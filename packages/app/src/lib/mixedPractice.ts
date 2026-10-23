// =============================================================================
// mixedPractice.ts — the student's mixed practice calls (D43, slice 3)
// -----------------------------------------------------------------------------
// docs/design/mixed-practice.md → "Slice 3 — as built". Thin, typed wrappers;
// every rule lives in the database (0066) and in check-activity's practice
// modes (slice 2, server/practice-handler.ts).
//
//   lookupPracticeClass   the class behind a join code (member RLS)
//   previewMixed          start_mixed_session(p_start = false), DIRECT over
//                         PostgREST: it writes nothing, and the entry read
//                         must not pay check-activity's cold start
//   startMixed            check-activity `practice-start` (start = true): the
//                         session's sanitized items, or today's open one
//   checkPracticeItem     check-activity `practice`: one try at one slot
//   finishMixed           finish_mixed_session (Finish here, DM-6)
//
// ⚠ Called only from the LAZY /facts (= /practice) route and its runner chunk —
// keep it out of anything the shell imports.
// =============================================================================

import {
    CHECK_WIRE_VERSION,
    CheckError,
    checkErrorFor,
    type PracticeCheckResult,
    type PracticeStartResult,
    type PracticeStartState,
    type SectionResponses,
} from '@activity/viewer';
import { supabase, functionsBase } from './supabase';
import { CHECK_ACTIVITY_FUNCTION, edgeFunctionUrl } from './edgeFunctions';
import { MIXED_PRACTICE_RPC } from './mixedPracticeRpc';

export { MIXED_PRACTICE_RPC };

/** The class a /practice/:CODE link names, as its member sees it. */
export interface PracticeClass {
    id: string;
    mixedOn: boolean;
}

/** null ⇒ no class this student can see under that code. */
export async function lookupPracticeClass(code: string): Promise<PracticeClass | null> {
    const { data, error } = await supabase
        .from('classes')
        .select('id, mixed_on_at')
        .eq('join_code', code)
        .is('deleted_at', null)
        .maybeSingle()
        // An OPTIONAL read on the entry path: fail fast and read as "off",
        // never hold the student's screen through supabase-js's GET retries
        // (1 s + 2 s + 4 s on a network failure).
        .retry(false);
    if (error) throw new Error(error.message);
    if (!data) return null;
    const row = data as { id: string; mixed_on_at: string | null };
    return { id: row.id, mixedOn: row.mixed_on_at !== null };
}

/** What the entry needs to know, from the preview (no session is written). */
export type MixedPreview =
    | { state: 'off' }
    | {
          state: Exclude<PracticeStartState, 'started'>;
          doneToday: number;
          graded: boolean;
          itemsPerSession: number;
          /** `ready`: questions a session would hold. `resume`: the open one's. */
          planned: number;
          /** `resume` only: the first question not yet tried (1-based). */
          nextSeq?: number;
          /** `resume` only: the open session, for Finish here (DM-6). */
          sessionId?: string;
      };

interface RawPreview {
    state: Exclude<PracticeStartState, 'started'>;
    done_today: number;
    graded: boolean;
    items_per_session: number;
    planned?: number;
    session?: { session_id: string; planned: number; items: { seq: number; answered: boolean }[] };
}

/** start_mixed_session refuses with ONE error for "off", "not a member" and
 * "no class": the entry has already told membership apart, so here it reads
 * as off. Any other failure throws. */
export async function previewMixed(classId: string): Promise<MixedPreview> {
    const { data, error } = await supabase.rpc(MIXED_PRACTICE_RPC.start, {
        p_class_id: classId,
        p_start: false,
    });
    if (error) {
        if (/not available/i.test(error.message)) return { state: 'off' };
        throw new Error(error.message);
    }
    const raw = data as RawPreview;
    const common = {
        doneToday: raw.done_today ?? 0,
        graded: raw.graded === true,
        itemsPerSession: raw.items_per_session,
    };
    if (raw.state === 'resume' && raw.session) {
        const untried = raw.session.items.find((i) => !i.answered);
        return {
            state: 'resume',
            ...common,
            planned: raw.session.planned,
            nextSeq: untried?.seq ?? raw.session.planned,
            sessionId: raw.session.session_id,
        };
    }
    return { state: raw.state, ...common, planned: raw.planned ?? 0 };
}

/** The minutes a practice of `questions` takes: 60–90 s a question, rounded
 * to whole minutes (C-146, as amended; slice 3 ruling 4: from the questions
 * actually planned). "6–9", or "1" when both ends agree. */
export function practiceMinutes(questions: number): string {
    const low = Math.max(1, Math.round(questions));
    const high = Math.max(low, Math.round((questions * 90) / 60));
    return low === high ? `${low}` : `${low}–${high}`;
}

// ---- check-activity ------------------------------------------------------------

async function accessToken(): Promise<string | null> {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
}

/** POST to check-activity; failures leave as the viewer's typed CheckError
 * (offline, unauthenticated, unavailable, …), so the runner can switch on
 * `kind`. `nothing_answered` (slice 2 ruling 2) gets its own message. */
async function post<T>(body: unknown, fetchImpl: typeof fetch = fetch): Promise<T> {
    const token = await accessToken();
    if (!token) throw new CheckError('unauthenticated', 'Not signed in');
    let response: Response;
    try {
        response = await fetchImpl(edgeFunctionUrl(functionsBase(), CHECK_ACTIVITY_FUNCTION), {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
    } catch {
        throw new CheckError('offline', 'Could not reach the server.');
    }
    if (!response.ok) {
        let parsed: { code?: string; error?: string; message?: string; details?: { code?: string } } = {};
        try {
            parsed = (await response.json()) as typeof parsed;
        } catch {
            // A non-JSON error body is not worth failing differently over.
        }
        if ((parsed.details?.code ?? parsed.code) === 'nothing_answered') {
            throw new CheckError('unknown', NOTHING_ANSWERED, response.status);
        }
        throw checkErrorFor(response.status, parsed);
    }
    let data: unknown;
    try {
        data = await response.json();
    } catch {
        throw new CheckError('unknown', 'The server sent a response we could not read.');
    }
    if ((data as { wireVersion?: number })?.wireVersion !== CHECK_WIRE_VERSION) {
        throw new CheckError('stale_client', 'This page is out of date. Reload to keep going.');
    }
    return data as T;
}

/** The student-facing words for an empty Check (the server refuses it). */
export const NOTHING_ANSWERED = 'Answer the question, or skip it.';

export function startMixed(classId: string, fetchImpl?: typeof fetch): Promise<PracticeStartResult> {
    return post<PracticeStartResult>(
        { wireVersion: CHECK_WIRE_VERSION, mode: 'practice-start', classId, start: true },
        fetchImpl,
    );
}

export function checkPracticeItem(
    request: { sessionId: string; seq: number; responses: SectionResponses; skip?: boolean },
    fetchImpl?: typeof fetch,
): Promise<PracticeCheckResult> {
    return post<PracticeCheckResult>(
        {
            wireVersion: CHECK_WIRE_VERSION,
            mode: 'practice',
            sessionId: request.sessionId,
            seq: request.seq,
            responses: request.responses,
            ...(request.skip ? { skip: true } : {}),
        },
        fetchImpl,
    );
}

export interface FinishedCounts {
    planned: number;
    right: number;
    answered: number;
    skipped: number;
    graded: boolean;
}

export async function finishMixed(sessionId: string): Promise<FinishedCounts> {
    const { data, error } = await supabase.rpc(MIXED_PRACTICE_RPC.finish, { p_session_id: sessionId });
    if (error) throw new Error(error.message);
    return data as FinishedCounts;
}

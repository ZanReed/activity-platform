// =============================================================================
// server/practice-handler.ts — mixed practice on check-activity (D43 slice 2)
// -----------------------------------------------------------------------------
// docs/design/mixed-practice.md MP-6/MP-7, ER-1/ER-4/ER-9/ER-13. Two modes on
// the check endpoint (one warm isolate for the grading bundle, MP-6):
//
//   practice-start   start_mixed_session AS THE CALLER ─► (only then) the
//                    session's SNAPSHOTS, service role ─► sanitize, fill in
//                    the slot's numbers, shuffle ─► send
//   practice         mixed_item_for_check AS THE CALLER ─► (only then) the
//                    slot's snapshot, service role ─► grade ─► RECORD ─► send
//
// THE SAME ORDER AS A SECTION CHECK, FOR THE SAME REASON: a snapshot is
// answer-key class (0066 ER-4 — the item document with its keys, and the
// slot's row of seeded values, derived answers included). Nothing is read
// with the service role until the database, running as the caller, has said
// the session is theirs, the class is live, they are still a member and the
// slot is in the session's PLAN. The client never names an item or a row:
// the session ids come back from the start RPC and every slot is the
// server's choice (ER-1).
//
// RECORD BEFORE VERDICT (ER-9): the attempt row is written before anything
// about the try leaves, and the response carries what was STORED. A slot
// already tried returns its stored try (`replayed`) — never a re-grade. The
// answers (author ruling 2026-10-23) leave only with a recorded try.
//
// What a snapshot never sends: its row values (the derived columns include
// the answers), its owner, its fingerprint, the item's mistake matchers or
// keys. The leak tests scan the wire with the shared secret-bearing fixture.
// =============================================================================

import { UpgradeError, upgradeActivityDocument } from '@activity/schema';
import {
  CHECK_WIRE_VERSION,
  emptySectionResponses,
  type CheckItemResult,
  type PracticeAnswers,
  type PracticeCheckRequest,
  type PracticeItemResult,
  type PracticeServedItem,
  type PracticeSession,
  type PracticeStartRequest,
  type PracticeStartState,
  type SectionCheckResult,
  type SectionResponses,
} from '../check/wire.js';
import { gradeSection } from './grading/index.js';
import { graphTakesInput } from './grading/graphs.js';
import { evaluateSeededKeys } from './grading/seededKeys.js';
import { inventorySection, type RawSection } from './grading/walk.js';
import { sanitizeActivityDocument } from '../sanitize/sanitize.js';
import { applyServeShuffles } from '../sanitize/shuffle.js';
import { serveSeed } from '../sanitize/serveSeed.js';
import type { SeedValues } from '../sanitize/seedValues.js';
import { substituteSeedValues } from '../sanitize/substitute.js';
import type { CorsKit, DbResult } from './get-activity-handler.js';
import { jwtSub } from './jwt.js';
import { UUID_RE } from './uuid.js';

// ---- Ports ------------------------------------------------------------------

/** One planned slot's snapshot (mixed_session_items), SERVICE ROLE. */
export interface PracticeSnapshotRow {
  seq: number;
  document: unknown;
  row_values: unknown;
}

/** One stored try (mixed_attempts), SERVICE ROLE. */
export interface PracticeAttemptRow {
  seq: number;
  correct: boolean;
  skipped: boolean;
  verdicts: unknown;
}

export interface RecordPracticeResult {
  replayed: boolean;
  correct: boolean;
  skipped: boolean;
  verdicts: unknown;
}

export interface PracticeDb {
  /** `start_mixed_session` AS THE CALLER (0066 G1): every refusal is its one
   * "Not available". */
  startMixedSession(
    authHeader: string,
    classId: string,
    start: boolean,
  ): Promise<DbResult<unknown>>;
  /** `mixed_item_for_check` AS THE CALLER (0066 G2). */
  mixedItemForCheck(
    authHeader: string,
    sessionId: string,
    seq: number,
  ): Promise<DbResult<unknown>>;
  /** A session's snapshots, SERVICE ROLE. Only ever called with a session id
   * one of the two caller RPCs above has just authorized; `seq` narrows to
   * one slot. */
  readSnapshots(sessionId: string, seq?: number): Promise<DbResult<PracticeSnapshotRow[]>>;
  /** A session's stored tries, SERVICE ROLE, under the same rule. */
  readAttempts(sessionId: string): Promise<DbResult<PracticeAttemptRow[]>>;
  /** `record_mixed_attempt`, SERVICE ROLE (it accepts a verdict). */
  recordAttempt(args: {
    studentId: string;
    sessionId: string;
    seq: number;
    correct: boolean;
    skipped: boolean;
    responses: SectionResponses;
    verdicts: SectionCheckResult['items'];
  }): Promise<DbResult<RecordPracticeResult>>;
}

type ServedOrderings = (args: {
  document: unknown;
  versionId: string;
  studentId: string;
  sectionId: string;
  seedKey?: string;
}) => Record<string, string[]>;

export interface PracticeHandlerDeps {
  practice: PracticeDb;
  cors: CorsKit;
  servedOrderings?: ServedOrderings;
}

// ---- Validation ---------------------------------------------------------------

interface Failure {
  message: string;
  code: string;
}

/** The planned list is at most 50 (0066 `planned between 1 and 50`). */
const MAX_SEQ = 50;

export function validatePracticeStartRequest(
  body: unknown,
): { ok: true; request: PracticeStartRequest } | { ok: false; failure: Failure } {
  const fail = (message: string, code: string) => ({ ok: false as const, failure: { message, code } });
  if (body === null || typeof body !== 'object') return fail('Body must be a JSON object', 'malformed_body');
  const b = body as Record<string, unknown>;
  if (b.wireVersion !== CHECK_WIRE_VERSION) {
    return fail(
      `Unsupported wire version ${String(b.wireVersion)}; expected ${CHECK_WIRE_VERSION}`,
      'wire_version_mismatch',
    );
  }
  if (typeof b.classId !== 'string' || !UUID_RE.test(b.classId)) {
    return fail('classId must be a UUID', 'bad_class_id');
  }
  if (b.start !== undefined && typeof b.start !== 'boolean') {
    return fail('start must be a boolean', 'bad_start');
  }
  return {
    ok: true,
    request: { wireVersion: CHECK_WIRE_VERSION, mode: 'practice-start', classId: b.classId, start: b.start === true },
  };
}

export function validatePracticeCheckRequest(
  body: unknown,
  validateResponses: (
    r: unknown,
  ) => { ok: true; responses: SectionResponses } | { ok: false; failure: Failure },
): { ok: true; request: PracticeCheckRequest } | { ok: false; failure: Failure } {
  const fail = (message: string, code: string) => ({ ok: false as const, failure: { message, code } });
  if (body === null || typeof body !== 'object') return fail('Body must be a JSON object', 'malformed_body');
  const b = body as Record<string, unknown>;
  if (b.wireVersion !== CHECK_WIRE_VERSION) {
    return fail(
      `Unsupported wire version ${String(b.wireVersion)}; expected ${CHECK_WIRE_VERSION}`,
      'wire_version_mismatch',
    );
  }
  if (typeof b.sessionId !== 'string' || !UUID_RE.test(b.sessionId)) {
    return fail('sessionId must be a UUID', 'bad_session_id');
  }
  if (typeof b.seq !== 'number' || !Number.isInteger(b.seq) || b.seq < 1 || b.seq > MAX_SEQ) {
    return fail('seq must be a question number', 'bad_seq');
  }
  if (b.skip !== undefined && typeof b.skip !== 'boolean') {
    return fail('skip must be a boolean', 'bad_skip');
  }
  const skip = b.skip === true;
  let responses = emptySectionResponses();
  if (b.responses !== undefined || !skip) {
    const checked = validateResponses(b.responses);
    if (!checked.ok) return checked;
    responses = checked.responses;
  }
  // A skip is a decision, not an answer: it carries none, so the stored row
  // can never hold an answer the verdict did not judge.
  if (skip && Object.values(responses).some((m) => Object.keys(m).length > 0)) {
    return fail('A skipped question carries no answer', 'bad_skip');
  }
  return {
    ok: true,
    request: {
      wireVersion: CHECK_WIRE_VERSION,
      mode: 'practice',
      sessionId: b.sessionId,
      seq: b.seq,
      responses,
      ...(skip ? { skip: true } : {}),
    },
  };
}

// ---- The slot's document ------------------------------------------------------

/** The ONE spelling of a slot's serve-time shuffle key: the read path's
 * serveSeed with the slot in the version's place. Serving and grading both
 * call this, so the permutation the grader recomputes is the one served (the
 * two-spellings rule, G1). */
export function practiceServeKey(sessionId: string, seq: number): string {
  return `practice:${sessionId}:${seq}`;
}

class SnapshotError extends Error {}

interface Slot {
  /** Upgraded, the slot's numbers filled in — what the grader reads. */
  raw: { sections?: RawSection[] } & Record<string, unknown>;
  sectionId: string;
  values: SeedValues;
}

/** A snapshot → the document the grader reads. Throws SnapshotError for a
 * snapshot that cannot be served (our data, a 500). */
function slotOf(row: PracticeSnapshotRow): Slot {
  const values = row.row_values;
  if (
    values === null ||
    typeof values !== 'object' ||
    Array.isArray(values) ||
    !Object.values(values).every((v) => typeof v === 'number' && Number.isFinite(v))
  ) {
    throw new SnapshotError(`slot ${row.seq}: row values are not a map of numbers`);
  }
  let upgraded;
  try {
    upgraded = upgradeActivityDocument(row.document);
  } catch (err) {
    if (err instanceof UpgradeError) throw new SnapshotError(`slot ${row.seq}: ${err.message}`);
    throw err;
  }
  const raw = substituteSeedValues(upgraded.doc, values as SeedValues) as unknown as Slot['raw'];
  const sections = raw.sections ?? [];
  // DM-19: one question is one section. The bank importer builds exactly one.
  const sectionId = sections.length === 1 ? sections[0]!.id : undefined;
  if (typeof sectionId !== 'string') {
    throw new SnapshotError(`slot ${row.seq}: ${sections.length} sections, not 1`);
  }
  return { raw, sectionId, values: values as SeedValues };
}

/** What the student is served for a slot: sanitized first (the read path's
 * order), then shuffled under the slot's key, then the numbers filled in. */
function servedDocument(
  row: PracticeSnapshotRow,
  sessionId: string,
  studentId: string,
): PracticeServedItem['document'] {
  const slot = slotOf(row); // validates; the served copy starts from the RAW doc
  const upgraded = upgradeActivityDocument(row.document);
  const sanitized = sanitizeActivityDocument(upgraded.doc);
  let served = applyServeShuffles(sanitized, serveSeed(practiceServeKey(sessionId, row.seq), studentId));
  served = substituteSeedValues(served, slot.values);
  // A bank item declares no seedVars (its values are the row), but the read
  // path's R8 rule holds anyway: the specs never reach a client.
  const meta = { ...(served.meta as Record<string, unknown>) };
  delete meta.seedVars;
  return { ...served, meta } as PracticeServedItem['document'];
}

/** Grade the slot. Empty responses grade to no verdicts, which is how a
 * replay and a resume get the solutions without a second judgement. */
function gradeSlot(
  slot: Slot,
  responses: SectionResponses,
  sessionId: string,
  seq: number,
  studentId: string,
  servedOrderings: ServedOrderings | undefined,
): SectionCheckResult {
  return gradeSection({
    document: slot.raw,
    sectionId: slot.sectionId,
    responses,
    seedValues: slot.values,
    servedOrderings: servedOrderings?.({
      document: slot.raw,
      versionId: practiceServeKey(sessionId, seq),
      studentId,
      sectionId: slot.sectionId,
    }),
  });
}

/** Every graded part's id in the slot (the keys a verdict can carry). */
function gradedIdsOf(slot: Slot): string[] {
  const section = slot.raw.sections![0]!;
  const inv = inventorySection(section);
  return [
    ...inv.blankGroupsByBlock.flatMap((g) => g.keys.map((k) => k.id)),
    ...inv.multipleChoice.map((m) => m.blockId),
    ...inv.matching.map((m) => m.blockId),
    ...inv.correspondence.map((c) => c.blockId),
    ...inv.ordering.map((o) => o.blockId),
    // A display-only graph is a stimulus with no verdict: not a part to get right.
    ...inv.graphs.filter((g) => graphTakesInput(g.block)).map((g) => g.blockId),
  ];
}

/** The answers a recorded try releases (author ruling 2026-10-23). */
function answersOf(slot: Slot): PracticeAnswers {
  const inv = inventorySection(slot.raw.sections![0]!);
  const blanks: PracticeAnswers['blanks'] = {};
  for (const { keys } of inv.blankGroupsByBlock) {
    for (const key of evaluateSeededKeys(keys, slot.values)) {
      const answer = key.answers[0];
      if (answer === undefined) continue;
      blanks[key.id] = { answer, ...(key.unit ? { unit: key.unit } : {}) };
    }
  }
  const choices: PracticeAnswers['choices'] = {};
  for (const mc of inv.multipleChoice) choices[mc.blockId] = [...mc.correctIds];
  return { blanks, choices };
}

function resultOf(
  slot: Slot,
  graded: SectionCheckResult,
  stored: { correct: boolean; skipped: boolean; verdicts: unknown },
): PracticeItemResult {
  const verdicts =
    stored.verdicts !== null && typeof stored.verdicts === 'object' && !Array.isArray(stored.verdicts)
      ? (stored.verdicts as Record<string, CheckItemResult>)
      : {};
  return {
    correct: stored.correct,
    skipped: stored.skipped,
    items: verdicts,
    solutions: graded.solutions,
    answers: answersOf(slot),
  };
}

// ---- Error mapping --------------------------------------------------------------

/** The caller RPCs' one no-oracle refusal → 404; a token problem → 401. */
function rpcStatus(message: string): 404 | 401 | 500 {
  return message.includes('Not available') ? 404 : /JWT|token|auth/i.test(message) ? 401 : 500;
}

// ---- The handlers -----------------------------------------------------------------

export function createPracticeHandlers(deps: PracticeHandlerDeps) {
  const { practice, cors } = deps;

  async function handlePracticeStart(req: Request, authHeader: string, body: unknown): Promise<Response> {
    const validated = validatePracticeStartRequest(body);
    if (!validated.ok) {
      return cors.errorResponse(req, 400, validated.failure.message, { code: validated.failure.code });
    }
    const { classId, start } = validated.request;

    // ---- As the CALLER: membership, class live, mixed on, the plan --------
    const { data, error } = await practice.startMixedSession(authHeader, classId, start);
    if (error) {
      const status = rpcStatus(error.message ?? '');
      if (status === 500) console.error('[check-activity] start_mixed_session error:', error);
      return cors.errorResponse(req, status, status === 404 ? 'Not available' : (error.message ?? ''));
    }
    const out = data as {
      state?: string;
      done_today?: number;
      graded?: boolean;
      items_per_session?: number;
      planned?: number;
      session?: {
        session_id: string;
        practice_day: string;
        planned: number;
        graded: boolean;
        score_right: number;
        score_answered: number;
        finished: boolean;
        items: Array<{ seq: number; answered: boolean }>;
      };
    } | null;
    const STATES: PracticeStartState[] = ['resume', 'ready', 'started', 'nothing_taught', 'nothing_due', 'done_today'];
    if (!out || !STATES.includes(out.state as PracticeStartState)) {
      console.error('[check-activity] start_mixed_session returned an unknown shape');
      return cors.errorResponse(req, 500, 'Could not start practice', { code: 'practice_start_failed' });
    }
    const head = {
      wireVersion: CHECK_WIRE_VERSION,
      state: out.state as PracticeStartState,
      doneToday: out.done_today ?? 0,
      graded: out.graded === true,
      itemsPerSession: out.items_per_session ?? 0,
    };
    if (!out.session) {
      return cors.jsonResponse(req, { ...head, ...(out.state === 'ready' ? { planned: out.planned ?? 0 } : {}) });
    }

    const studentId = jwtSub(authHeader);
    if (!studentId) {
      console.error('[check-activity] authorized practice start carried no sub claim');
      return cors.errorResponse(req, 500, 'Could not identify the student');
    }
    const s = out.session;

    // ---- Only now: the snapshots (service role), the session the RPC named
    const [snaps, tries] = await Promise.all([
      practice.readSnapshots(s.session_id),
      practice.readAttempts(s.session_id),
    ]);
    if (snaps.error || !snaps.data || tries.error || !tries.data) {
      console.error('[check-activity] practice snapshot read failed:', snaps.error ?? tries.error);
      return cors.errorResponse(req, 500, 'Could not load practice', { code: 'practice_read_failed' });
    }
    const bySeq = new Map(snaps.data.map((r) => [r.seq, r]));
    const tried = new Map(tries.data.map((a) => [a.seq, a]));

    const items: PracticeServedItem[] = [];
    try {
      for (const planned of s.items) {
        const row = bySeq.get(planned.seq);
        if (!row) throw new SnapshotError(`slot ${planned.seq}: no snapshot`);
        const served: PracticeServedItem = {
          seq: planned.seq,
          document: servedDocument(row, s.session_id, studentId),
        };
        const attempt = tried.get(planned.seq);
        if (attempt) {
          const slot = slotOf(row);
          const graded = gradeSlot(slot, emptySectionResponses(), s.session_id, planned.seq, studentId, deps.servedOrderings);
          served.result = resultOf(slot, graded, attempt);
        }
        items.push(served);
      }
    } catch (err) {
      if (!(err instanceof SnapshotError)) throw err;
      console.error('[check-activity] practice snapshot cannot be served:', err.message);
      return cors.errorResponse(req, 500, 'This practice question is broken', { code: 'malformed_document' });
    }

    const session: PracticeSession = {
      sessionId: s.session_id,
      practiceDay: s.practice_day,
      planned: s.planned,
      graded: s.graded,
      scoreRight: s.score_right,
      scoreAnswered: s.score_answered,
      finished: s.finished,
      items,
    };
    return cors.jsonResponse(req, { ...head, session });
  }

  async function handlePracticeCheck(
    req: Request,
    authHeader: string,
    body: unknown,
    validateResponses: Parameters<typeof validatePracticeCheckRequest>[1],
  ): Promise<Response> {
    const validated = validatePracticeCheckRequest(body, validateResponses);
    if (!validated.ok) {
      return cors.errorResponse(req, 400, validated.failure.message, { code: validated.failure.code });
    }
    const { sessionId, seq, responses } = validated.request;
    const skip = validated.request.skip === true;

    // ---- As the CALLER: the session is theirs, live, and the slot planned --
    const { data, error } = await practice.mixedItemForCheck(authHeader, sessionId, seq);
    if (error) {
      const status = rpcStatus(error.message ?? '');
      if (status === 500) console.error('[check-activity] mixed_item_for_check error:', error);
      return cors.errorResponse(req, status, status === 404 ? 'Not available' : (error.message ?? ''));
    }
    const auth = data as {
      replay?: boolean;
      student_id?: string;
      correct?: boolean;
      skipped?: boolean;
      verdicts?: unknown;
    } | null;
    const studentId = jwtSub(authHeader);
    if (!auth || typeof auth.replay !== 'boolean') return cors.errorResponse(req, 404, 'Not available');
    if (!studentId) {
      console.error('[check-activity] authorized practice check carried no sub claim');
      return cors.errorResponse(req, 500, 'Could not identify the student');
    }
    // Defense in depth: the database's student is the token's student.
    if (auth.student_id !== studentId) return cors.errorResponse(req, 404, 'Not available');

    // ---- Only now: this slot's snapshot (service role) ----------------------
    const snap = await practice.readSnapshots(sessionId, seq);
    const row = snap.data?.find((r) => r.seq === seq);
    if (snap.error || !row) {
      console.error('[check-activity] practice snapshot read failed:', snap.error);
      return cors.errorResponse(req, 500, 'Could not load this question', { code: 'practice_read_failed' });
    }
    let slot: Slot;
    try {
      slot = slotOf(row);
    } catch (err) {
      if (!(err instanceof SnapshotError)) throw err;
      console.error('[check-activity] practice snapshot cannot be graded:', err.message);
      return cors.errorResponse(req, 500, 'This practice question is broken', { code: 'malformed_document' });
    }

    const respond = (stored: { correct: boolean; skipped: boolean; verdicts: unknown }, replayed: boolean) => {
      const solutionsOnly = gradeSlot(slot, emptySectionResponses(), sessionId, seq, studentId, deps.servedOrderings);
      return cors.jsonResponse(req, {
        wireVersion: CHECK_WIRE_VERSION,
        seq,
        replayed,
        ...resultOf(slot, solutionsOnly, stored),
      });
    };

    // ER-9: a slot already tried is that try. Nothing is graded or written.
    if (auth.replay) {
      return respond({ correct: auth.correct === true, skipped: auth.skipped === true, verdicts: auth.verdicts }, true);
    }

    // ---- Grade -------------------------------------------------------------
    let verdicts: SectionCheckResult['items'] = {};
    let correct = false;
    if (!skip) {
      let graded: SectionCheckResult;
      try {
        graded = gradeSlot(slot, responses, sessionId, seq, studentId, deps.servedOrderings);
      } catch (err) {
        console.error('[check-activity] practice grading failed', JSON.stringify({ sessionId, seq }), err);
        return cors.errorResponse(req, 500, 'Could not check this question', { code: 'grading_failed' });
      }
      verdicts = graded.items;
      const ids = gradedIdsOf(slot);
      // The one try is precious (MP-9): a Check with nothing answered is not
      // a try. The student answers, or uses Skip (author ruling 2026-10-23).
      if (!ids.some((id) => verdicts[id] !== undefined)) {
        return cors.errorResponse(req, 400, 'Answer the question, or skip it', { code: 'nothing_answered' });
      }
      // Right = every graded part right; a part left blank is not right.
      correct = ids.length > 0 && ids.every((id) => verdicts[id]?.verdict === 'correct');
    }

    // ---- Record, BEFORE anything about the try leaves (ER-9) ---------------
    const { data: recorded, error: recordError } = await practice.recordAttempt({
      studentId,
      sessionId,
      seq,
      correct,
      skipped: skip,
      responses,
      verdicts,
    });
    if (recordError || !recorded) {
      const msg = recordError?.message ?? '';
      // Closed between the authorization and the write (finished on another
      // tab, or past its day): the backstop refused it. Same no-oracle 404.
      if (msg.includes('refused')) return cors.errorResponse(req, 404, 'Not available');
      console.error('[check-activity] record_mixed_attempt failed:', recordError);
      return cors.errorResponse(req, 500, 'Could not save this answer', { code: 'record_failed' });
    }
    // A concurrent request for the same slot won: return ITS try, not ours.
    return respond(
      { correct: recorded.correct, skipped: recorded.skipped, verdicts: recorded.verdicts },
      recorded.replayed,
    );
  }

  return { handlePracticeStart, handlePracticeCheck };
}

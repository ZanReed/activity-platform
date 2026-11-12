// =============================================================================
// bulkRepublish.ts — "Republish changed": publish every activity whose draft
// students can't see yet, from My activities (author ruling 2026-11-12, R-1..7)
// -----------------------------------------------------------------------------
// A catalogue re-import leaves every touched activity with a draft ahead of
// its published version, and each one used to need its own Republish in the
// editor (21 after the glossary fix). The rulings:
//   R-1  Only PUBLISHED activities with a draft. A never-published draft stays
//        unpublished: a bulk button never puts something live for the first time.
//   R-2  App edits count as changes too, which is why the teacher sees the
//        list and can untick (R-3, in RepublishDialog).
//   R-4  Quizzes and exams are skipped and named (D51: printed from the
//        draft, never published) — the same test the Bank uses
//        (0054 bank_version_is_assessment: meta.activityType in quiz/exam).
//   R-5  One at a time through the SAME call the editor's Republish makes
//        (publish_activity), validating each draft first as usePublish does —
//        the schema parse AND the pre-publish check (G-2, prePublishCheck.ts).
//        No migration, so it ships with a push (OV-7). A failure is reported
//        by name and the run keeps going.
// =============================================================================

import { ActivityDocument } from '@activity/schema';
import { PUBLISH_ACTIVITY_RPC } from './edgeFunctions';
import { findPublishProblems, publishProblemsSentence } from './prePublishCheck';
import { supabase } from './supabase';
import { INVALID_DOC_MESSAGE, mapPublishRpcError } from './usePublish';

/** The list-row fields this needs (Activities.tsx selects them). */
export interface RepublishRow {
    id: string;
    title: string;
    status: string;
    source_path: string | null;
    /** `draft_content->>schemaVersion`: non-null exactly when a draft exists. */
    draft_schema: string | null;
    /** `draft_content->meta->>activityType`. */
    draft_type: string | null;
}

export type SkipReason = 'assessment';

export interface RepublishCandidate<T extends RepublishRow = RepublishRow> {
    row: T;
    /** Imported from a catalogue file (source_path set), else edited in the app. */
    fromFile: boolean;
    skip: SkipReason | null;
}

const ASSESSMENT_TYPES = new Set(['quiz', 'exam']);

/** R-1 + R-4: every published activity with a draft, each marked. */
export function republishCandidates<T extends RepublishRow>(rows: readonly T[]): RepublishCandidate<T>[] {
    return rows
        // `?? null`: a row built without these fields (no draft path read) is
        // "no draft", never "changed".
        .filter((r) => r.status === 'published' && (r.draft_schema ?? null) !== null)
        .map((row) => ({
            row,
            fromFile: (row.source_path ?? null) !== null,
            skip: ASSESSMENT_TYPES.has(row.draft_type ?? '') ? 'assessment' : null,
        }));
}

export type RepublishResult = { id: string; ok: true } | { id: string; ok: false; message: string };

/**
 * R-5: publish `ids` one at a time, in order. `onProgress(done, total)` fires
 * after each. Never throws: every outcome, including a session or read
 * failure, comes back as a per-id result.
 */
export async function republishMany(
    ids: readonly string[],
    onProgress?: (done: number, total: number) => void,
): Promise<RepublishResult[]> {
    const fail = (message: string): RepublishResult[] => ids.map((id) => ({ id, ok: false, message }));
    if (ids.length === 0) return [];

    const {
        data: { session },
    } = await supabase.auth.getSession();
    if (!session) return fail('Not signed in');

    // The drafts, in one read, for the same pre-publish validation the
    // editor's Republish does (usePublish step 2).
    const { data: drafts, error: readError } = await supabase
        .from('activities')
        .select('id, draft_content')
        .in('id', [...ids]);
    if (readError) return fail(mapPublishRpcError(readError));
    const draftById = new Map(
        ((drafts ?? []) as { id: string; draft_content: unknown }[]).map((d) => [d.id, d.draft_content]),
    );

    const results: RepublishResult[] = [];
    for (const id of ids) {
        const draft = draftById.get(id);
        const parsed = draft !== null && draft !== undefined ? ActivityDocument.safeParse(draft) : null;
        // G-2: what a draft may hold but a published version may not — the same
        // check usePublish runs, so "Republish changed" can't skip it.
        const problems = parsed?.success ? findPublishProblems(parsed.data) : [];
        if (parsed && !parsed.success) {
            results.push({ id, ok: false, message: INVALID_DOC_MESSAGE });
        } else if (problems.length > 0) {
            results.push({ id, ok: false, message: publishProblemsSentence(problems) });
        } else {
            const { data: versionId, error } = await supabase.rpc(PUBLISH_ACTIVITY_RPC, { p_activity_id: id });
            if (error) results.push({ id, ok: false, message: mapPublishRpcError(error) });
            else if (typeof versionId !== 'string') {
                results.push({ id, ok: false, message: 'Publish returned an unexpected value' });
            } else results.push({ id, ok: true });
        }
        onProgress?.(results.length, ids.length);
    }
    return results;
}

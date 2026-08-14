// =============================================================================
// usePublish.ts — publish as a direct `publish_activity` RPC call (S9 Drop 1)
// -----------------------------------------------------------------------------
// Publish no longer goes through the publish-activity Edge Function — the
// function's only durable work (authz, version mint, activities update, audit)
// lives in the `publish_activity` RPC, and its render + R2 upload died with
// the published-page world. The share link is the viewer URL (built in
// PublishStatus), not an R2 object.
//
// The deleted function was also the only publish-time shape gate, so that
// gate moves here (E-1/OV-2):
//   1. onBeforePublish flushes the autosave and must ABORT the publish when
//      the flush cannot persist — a publish must never snapshot a draft the
//      editor failed to save.
//   2. ActivityDocument.safeParse runs on the exact payload that flush
//      persisted, before the RPC is called.
// Both failures leave the activity unpublished and surface an error line.
//
// Constraint (S7 amendment): this path must NOT write census rows — the
// census is derived by get-activity's cache-fill; a publish-side writer would
// race the read path on the same keys.
// =============================================================================

import { useCallback, useState } from 'react';
import { ActivityDocument } from '@activity/schema';
import { supabase } from './supabase';
import { PUBLISH_ACTIVITY_RPC } from './edgeFunctions';

/**
 * What the pre-publish step hands back. `ok: false` means the latest edits
 * could not be persisted — the publish ABORTS (OV-2). `draft` is the exact
 * payload known to be persisted as draft_content: the last body the autosave
 * wrote, or the draft loaded at mount when nothing was saved this session.
 * `null` when no draft is known client-side (post-publish, no new edits) —
 * validation is skipped and the RPC answers authoritatively ("No draft").
 */
export type PrePublishResult = { ok: true; draft: unknown } | { ok: false };

export type PublishState =
    | { kind: 'idle' }
    | { kind: 'publishing' }
    // versionNum is null when the post-publish version_num read failed — the
    // publish itself committed, so that read must never turn into an error.
    | { kind: 'success'; versionNum: number | null }
    | { kind: 'error'; message: string };

export const FLUSH_FAILED_MESSAGE =
    "Couldn't save your latest edits, so nothing was published. Fix the save error and try again.";
export const INVALID_DOC_MESSAGE =
    "This activity's draft failed validation, so nothing was published.";

/**
 * PostgREST surfaces the RPC's `raise exception` texts as error.message; map
 * the known raises (0003's publish_activity) to teacher-facing copy and pass
 * anything else through so the real cause is never hidden.
 */
export function mapPublishRpcError(error: {
    message?: string | null;
}): string {
    const msg = error.message ?? '';
    if (msg.includes('Not authorized')) {
        return "You don't have permission to publish this activity.";
    }
    if (msg.includes('No draft')) {
        return 'Nothing to publish — this activity has no unpublished changes.';
    }
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        return "Couldn't reach the server — check your connection and try again.";
    }
    return msg || 'Publish failed';
}

export function usePublish(
    activityId: string,
    onBeforePublish?: () => Promise<PrePublishResult>,
): { state: PublishState; publish: () => Promise<void> } {
    const [state, setState] = useState<PublishState>({ kind: 'idle' });

    const publish = useCallback(async () => {
        setState({ kind: 'publishing' });

        // Friendly pre-check: without a session the RPC would run as anon and
        // fail on the revoked grant with an opaque permission error.
        const {
            data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
            setState({ kind: 'error', message: 'Not signed in' });
            return;
        }

        // 1. Flush — and ABORT if the latest edits did not persist (OV-2). A
        // throwing prepare step is treated the same as a reported failure.
        let draft: unknown = null;
        if (onBeforePublish) {
            let prep: PrePublishResult;
            try {
                prep = await onBeforePublish();
            } catch {
                prep = { ok: false };
            }
            if (!prep.ok) {
                setState({ kind: 'error', message: FLUSH_FAILED_MESSAGE });
                return;
            }
            draft = prep.draft;
        }

        // 2. Validate the persisted payload (E-1) — the publish-time shape
        // gate the Edge Function used to be. Defense in depth: the autosave
        // already refuses to persist an invalid doc, so a failure here means
        // that guard broke — refuse rather than snapshot a doc students can't
        // load.
        if (draft !== null && draft !== undefined) {
            const parsed = ActivityDocument.safeParse(draft);
            if (!parsed.success) {
                setState({ kind: 'error', message: INVALID_DOC_MESSAGE });
                return;
            }
        }

        // 3. The atomic publish. Runs user-scoped: the RPC checks ownership
        // via can_edit_activity(auth.uid()) internally.
        const { data: versionId, error } = await supabase.rpc(
            PUBLISH_ACTIVITY_RPC,
            { p_activity_id: activityId },
        );
        if (error) {
            setState({ kind: 'error', message: mapPublishRpcError(error) });
            return;
        }
        if (typeof versionId !== 'string') {
            setState({
                kind: 'error',
                message: 'Publish returned an unexpected value',
            });
            return;
        }

        // 4. Read the minted version_num for the "Published v{N}" line. The
        // publish already committed — a failed read degrades the label to
        // "Live", never to an error.
        const { data: versionRow } = await supabase
            .from('activity_versions')
            .select('version_num')
            .eq('id', versionId)
            .maybeSingle();
        const versionNum =
            versionRow &&
            typeof (versionRow as { version_num?: unknown }).version_num ===
                'number'
                ? (versionRow as { version_num: number }).version_num
                : null;
        setState({ kind: 'success', versionNum });
    }, [activityId, onBeforePublish]);

    return { state, publish };
}

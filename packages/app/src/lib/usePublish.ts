// =============================================================================
// usePublish.ts — the publish-activity Edge Function call, as a hook
// -----------------------------------------------------------------------------
// Lifted out of the old PublishControl so the header's Publish chip and the
// published-status line (both in ActivityEditor) can share one publish state.
// Owns the invoke + the FunctionsHttpError body-parsing; the UI reads `state`
// and calls `publish()`.
//
// onBeforePublish (useAutosave's flush) runs first so any pending debounced
// draft-save completes before the Edge Function snapshots draft_content —
// closing the 1s debounce-window race.
// =============================================================================

import { useCallback, useState } from 'react';
import { supabase } from './supabase';

interface PublishResponse {
    version_id: string;
    version_num: number;
    public_url: string;
    versioned_url: string;
}

export type PublishState =
    | { kind: 'idle' }
    | { kind: 'publishing' }
    | { kind: 'success'; versionNum: number; publicUrl: string }
    | { kind: 'error'; message: string };

export function usePublish(
    activityId: string,
    onBeforePublish?: () => Promise<void>,
): { state: PublishState; publish: () => Promise<void> } {
    const [state, setState] = useState<PublishState>({ kind: 'idle' });

    const publish = useCallback(async () => {
        setState({ kind: 'publishing' });
        // Persist the latest draft before the Edge Function snapshots
        // draft_content. flush() is best-effort and never throws.
        if (onBeforePublish) await onBeforePublish();
        // Attach the session token explicitly. Under the publishable-key system
        // (sb_publishable_...), supabase-js does not reliably forward the user's
        // access token on functions.invoke, which leaves the Edge Function
        // running as anon and the publish RPC raising "Not authorized". Passing
        // Authorization here guarantees the user JWT reaches the function so
        // auth.uid() resolves to the owner.
        const {
            data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
            setState({ kind: 'error', message: 'Not signed in' });
            return;
        }
        const { data, error } = await supabase.functions.invoke<PublishResponse>(
            'publish-activity',
            {
                body: { activity_id: activityId },
                headers: { Authorization: `Bearer ${session.access_token}` },
            },
        );

        if (error) {
            // FunctionsHttpError exposes the raw response on .context; the Edge
            // Function's errorResponse helper returns
            // { error: string, details?: { message?: string } }. Surface the
            // top-line `error`, and append `details.message` when present (e.g.
            // the underlying R2 PUT failure) so the teacher sees the real cause
            // without digging through Edge Function logs.
            let message = error.message || 'Publish failed';
            const ctx = (error as { context?: Response }).context;
            if (ctx && typeof ctx.json === 'function') {
                try {
                    const body = (await ctx.json()) as unknown;
                    if (body && typeof body === 'object') {
                        const errField = (body as { error?: unknown }).error;
                        if (typeof errField === 'string') message = errField;
                        const details = (body as { details?: unknown }).details;
                        const detailMsg =
                            details &&
                            typeof details === 'object' &&
                            typeof (details as { message?: unknown }).message ===
                                'string'
                                ? (details as { message: string }).message
                                : null;
                        if (detailMsg && detailMsg !== message) {
                            message = `${message}: ${detailMsg}`;
                        }
                    }
                } catch {
                    /* keep generic message */
                }
            }
            setState({ kind: 'error', message });
            return;
        }
        if (!data) {
            setState({ kind: 'error', message: 'Publish returned no data' });
            return;
        }
        setState({
            kind: 'success',
            versionNum: data.version_num,
            publicUrl: data.public_url,
        });
    }, [activityId, onBeforePublish]);

    return { state, publish };
}

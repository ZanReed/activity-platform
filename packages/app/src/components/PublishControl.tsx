// =============================================================================
// PublishControl.tsx — Publish button + post-publish URL display
// -----------------------------------------------------------------------------
// Invokes the publish-activity Edge Function. On success, surfaces the live
// student-facing URL with Copy + Open-in-new-tab affordances.
//
// Disabled while saveStatus === 'saving' to avoid publishing a stale draft.
// Additionally calls onBeforePublish (useAutosave's flush) at the start of a
// publish, which forces any pending debounced draft-save to complete before the
// publish RPC reads draft_content — closing the 1s debounce-window race.
// =============================================================================

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { SaveStatus } from '../lib/useAutosave';

// Long classNames are pulled out of JSX so a copy/paste line-wrap can never
// break them mid-string — the kind of failure that produces opaque JSX errors.
const BUTTON_CLASS =
    'rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50';

const PILL_CLASS =
    'flex items-center gap-2 rounded-md bg-green-50 px-2 py-1 text-xs text-green-800';

const PILL_LINK_CLASS =
    'rounded px-1.5 py-0.5 underline underline-offset-2 hover:bg-green-100';

const PILL_COPY_CLASS =
    'rounded px-1.5 py-0.5 underline-offset-2 hover:bg-green-100 hover:underline';

interface PublishResponse {
    version_id: string;
    version_num: number;
    public_url: string;
    versioned_url: string;
}

type PublishState =
    | { kind: 'idle' }
    | { kind: 'publishing' }
    | { kind: 'success'; result: PublishResponse; copied: boolean }
    | { kind: 'error'; message: string };

interface PublishControlProps {
    activityId: string;
    saveStatus: SaveStatus;
    /** Forces a pending draft-save to flush before publish reads draft_content. */
    onBeforePublish?: () => Promise<void>;
}

export default function PublishControl({
    activityId,
    saveStatus,
    onBeforePublish,
}: PublishControlProps) {
    const [state, setState] = useState<PublishState>({ kind: 'idle' });

    const handlePublish = async () => {
        setState({ kind: 'publishing' });
        // Make sure the latest draft is persisted before the Edge Function
        // snapshots draft_content. flush() is best-effort and never throws.
        if (onBeforePublish) await onBeforePublish();
        // Attach the session token explicitly. Under the new publishable-key
        // system (sb_publishable_...), supabase-js does not reliably forward
        // the logged-in user's access token on functions.invoke, which leaves
        // the Edge Function running as anon and the publish RPC raising
        // "Not authorized". Passing Authorization here guarantees the user JWT
        // reaches the function so auth.uid() resolves to the owner.
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
            // FunctionsHttpError exposes the raw response on .context; the
            // Edge Function's errorResponse helper returns
            // { error: string, details?: { message?: string } }. Surface the
            // top-line `error`, and append the `details.message` detail when
            // present (e.g. the underlying R2 PUT failure) so the teacher sees
            // the real cause without digging through Edge Function logs.
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
        setState({ kind: 'success', result: data, copied: false });
    };

    const handleCopy = async () => {
        if (state.kind !== 'success') return;
        try {
            await navigator.clipboard.writeText(state.result.public_url);
            setState({ ...state, copied: true });
            setTimeout(() => {
                setState((s) =>
                    s.kind === 'success' ? { ...s, copied: false } : s,
                );
            }, 1500);
        } catch {
            /* clipboard write can fail in unsupported contexts; non-fatal */
        }
    };

    const isPublishing = state.kind === 'publishing';
    const isDisabled = isPublishing || saveStatus === 'saving';

    let buttonLabel = 'Publish';
    if (isPublishing) buttonLabel = 'Publishing...';
    else if (state.kind === 'success') buttonLabel = 'Republish';

    const buttonTitle =
        saveStatus === 'saving'
            ? 'Waiting for save to finish before publishing'
            : 'Publish this activity as a student-facing page';

    return (
        <div className="flex items-center gap-3">
            {state.kind === 'success' && (
                <div className={PILL_CLASS}>
                    <span className="font-medium">
                        Published v{state.result.version_num}
                    </span>
                    <button
                        type="button"
                        onClick={handleCopy}
                        className={PILL_COPY_CLASS}
                    >
                        {state.copied ? 'Copied!' : 'Copy URL'}
                    </button>
                    <a
                        href={state.result.public_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={PILL_LINK_CLASS}
                    >
                        Open in new tab
                    </a>
                </div>
            )}
            {state.kind === 'error' && (
                <span className="text-xs text-red-600">
                    Publish failed: {state.message}
                </span>
            )}
            <button
                type="button"
                onClick={handlePublish}
                disabled={isDisabled}
                title={buttonTitle}
                className={BUTTON_CLASS}
            >
                {buttonLabel}
            </button>
        </div>
    );
}

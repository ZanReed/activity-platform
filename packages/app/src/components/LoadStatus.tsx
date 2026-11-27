// =============================================================================
// LoadStatus — what a teacher screen shows while it has no data (review C5)
// -----------------------------------------------------------------------------
// docs/design/shared-data-loading.md, decision 4: one look for loading
// trouble on every teacher screen that loads through useLoad.
//
//   if (!loaded.data) return <LoadStatus state={loaded} what="progress" />;
//
//   loading          → "Loading…"
//   loading, slow    → "Taking longer than usual…" + Try again (SLOW_LOAD_MS)
//   failed           → "Couldn't load <what>. Check your connection, then try
//                      again." + Try again; the server's own words only under
//                      "Details" (never as the main copy: a teacher cannot act
//                      on "JWT expired")
//   refused          → the caller's sentence (not your class / activity); no
//                      Try again, since trying again cannot help
//
// A failed REFRESH is not drawn here — the screen still has its data; it says
// "Couldn't refresh · showing 9:41" itself (progress/common.tsx RefreshLine).
//
// `data-load-status` is the SHELL_EVICTED marker (scripts/perf-budgets.mjs):
// this module must never reach the student shell.
// =============================================================================

import type { LoadState } from '../lib/useLoad';

const BUTTON =
    'mt-3 min-h-[44px] rounded-md border border-line-strong bg-canvas px-4 text-sm font-medium text-strong hover:bg-surface';

export default function LoadStatus({
    state,
    what,
    refusedText = "You don't have access to this.",
}: {
    state: Pick<LoadState<unknown>, 'failed' | 'refused' | 'errorMessage' | 'slow' | 'reload'>;
    /** Names the data in the failure sentence: "Couldn't load <what>." */
    what: string;
    refusedText?: string;
}) {
    if (state.failed) {
        return (
            <div data-load-status="failed" className="rounded-lg border border-line bg-canvas p-4">
                <p role="alert" className="text-sm text-ink">
                    {state.refused ? refusedText : `Couldn't load ${what}. Check your connection, then try again.`}
                </p>
                {!state.refused && (
                    <button type="button" onClick={state.reload} className={BUTTON}>
                        Try again
                    </button>
                )}
                {!state.refused && state.errorMessage && (
                    <details className="mt-3 text-xs text-muted">
                        <summary className="cursor-pointer">Details</summary>
                        <code className="mt-1 block break-words">{state.errorMessage}</code>
                    </details>
                )}
            </div>
        );
    }
    if (state.slow) {
        return (
            <div data-load-status="slow" role="status" className="text-sm text-muted">
                <p>Taking longer than usual. Check your connection.</p>
                <button type="button" onClick={state.reload} className={BUTTON}>
                    Try again
                </button>
            </div>
        );
    }
    return (
        <p data-load-status="loading" role="status" className="text-sm text-muted">
            Loading…
        </p>
    );
}

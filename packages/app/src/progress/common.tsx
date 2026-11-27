// =============================================================================
// progress/common.tsx — pieces both progress pages share (class-progress-view.md)
// -----------------------------------------------------------------------------
// The controls line (DR-9: Hide names switch, Least done first, Refresh +
// "Updated 9:41"), the Stat card (Analytics' look), and the context the answer
// panel reads from its page (Hide names reaches the panel too). Loading itself
// (CP-8, DR-4: a failed refresh keeps the last grid) moved to lib/useLoad.ts
// and components/LoadStatus.tsx (review C5 slice 1, shared-data-loading.md).
// =============================================================================

import { useCallback, useState } from 'react';
import { HIDE_NAMES_KEY, LEAST_DONE_KEY, clockTime, readFlag, writeFlag } from '../lib/classProgress';
import type { LoadState } from '../lib/useLoad';

/** What the progress pages' refresh controls read from their load. */
type RefreshState = Pick<LoadState<unknown>, 'loading' | 'loadedAt' | 'refreshFailed' | 'reload'>;

/** The refusal sentence both progress pages give (0061's 42501s). */
export const PROGRESS_REFUSED = 'You can only see progress for your own classes and activities.';

/** Refresh + "Updated 9:41" alone, for the empty states (CP-8 holds there too). */
export function RefreshLine({ loaded }: { loaded: RefreshState }) {
    const shown = loaded.loadedAt ? clockTime(loaded.loadedAt) : null;
    return (
        <p className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
            <button
                type="button"
                onClick={loaded.reload}
                disabled={loaded.loading}
                className="min-h-[44px] rounded-md border border-line-strong bg-canvas px-4 font-medium text-strong hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
            >
                {loaded.loading ? 'Refreshing…' : 'Refresh'}
            </button>
            <span role="status">
                {loaded.refreshFailed ? `Couldn't refresh · showing ${shown ?? 'the last load'}` : shown ? `Updated ${shown}` : ''}
            </span>
        </p>
    );
}

/** A device-remembered on/off choice (CP-5, DR-7). */
export function useDeviceFlag(key: string): [boolean, (on: boolean) => void] {
    const [on, setOn] = useState(() => readFlag(key));
    const set = useCallback(
        (next: boolean) => {
            setOn(next);
            writeFlag(key, next);
        },
        [key],
    );
    return [on, set];
}

export const useHideNames = () => useDeviceFlag(HIDE_NAMES_KEY);
export const useLeastDoneFirst = () => useDeviceFlag(LEAST_DONE_KEY);

export function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border border-line bg-canvas p-3">
            <div className="text-xs text-muted">{label}</div>
            <div className="mt-1 text-lg font-semibold text-ink">{value}</div>
        </div>
    );
}

export function Controls({
    hideNames,
    onHideNames,
    leastDone,
    onLeastDone,
    loaded,
}: {
    hideNames: boolean;
    onHideNames: (on: boolean) => void;
    leastDone: boolean;
    onLeastDone: (on: boolean) => void;
    loaded: RefreshState;
}) {
    const shown = loaded.loadedAt ? clockTime(loaded.loadedAt) : null;
    return (
        <div className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-2">
            <button
                type="button"
                role="switch"
                aria-checked={hideNames}
                className="cp-switch"
                onClick={() => onHideNames(!hideNames)}
            >
                <span className="cp-switch-track" aria-hidden="true" />
                Hide names
            </button>
            <label className="inline-flex min-h-[44px] items-center gap-2 text-sm text-ink">
                <input
                    type="checkbox"
                    checked={leastDone}
                    onChange={(e) => onLeastDone(e.target.checked)}
                    className="h-4 w-4"
                />
                Least done first
            </label>
            <span className="ml-auto inline-flex flex-wrap items-center gap-3">
                <span className="text-sm text-muted" role="status">
                    {loaded.refreshFailed
                        ? `Couldn't refresh · showing ${shown ?? 'the last load'}`
                        : shown
                          ? `Updated ${shown}`
                          : ''}
                </span>
                <button
                    type="button"
                    onClick={loaded.reload}
                    disabled={loaded.loading}
                    className="min-h-[44px] rounded-md border border-line-strong bg-canvas px-4 text-sm font-medium text-strong hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loaded.loading ? 'Refreshing…' : 'Refresh'}
                </button>
            </span>
        </div>
    );
}

/** What the answer panel (a child route) reads from the page it opened on. */
export interface ProgressOutletContext {
    hideNames: boolean;
    /** The name to show for a student: their name, or "Student 4". */
    nameOf: (studentId: string, name: string) => string;
    /** The class the panel was opened from; null on the activity page. */
    classId: string | null;
    /** Where Close goes back to. */
    closeTo: string;
}

/** Last check, for the Stat card. */
export function lastCheckWords(iso: string | null): string {
    return iso ? clockTime(new Date(iso)) : 'None yet';
}

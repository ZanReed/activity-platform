// =============================================================================
// progress/common.tsx — pieces both progress pages share (class-progress-view.md)
// -----------------------------------------------------------------------------
// The load-and-refresh hook (CP-8, DR-4: a failed refresh keeps the last grid),
// the controls line (DR-9: Hide names switch, Least done first, Refresh +
// "Updated 9:41"), the Stat card (Analytics' look), and the context the answer
// panel reads from its page (Hide names reaches the panel too).
// =============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { HIDE_NAMES_KEY, LEAST_DONE_KEY, clockTime, readFlag, writeFlag } from '../lib/classProgress';

export interface Loaded<T> {
    data: T | null;
    /** The first load failed and there is nothing to show. */
    failed: boolean;
    /** The first load was REFUSED (not the caller's class / activity), as
     * opposed to a network failure: different advice. */
    refused: boolean;
    /** A refresh failed; `data` is the last good load. */
    refreshFailed: boolean;
    loading: boolean;
    loadedAt: Date | null;
    reload: () => void;
}

export function useProgressLoad<T>(load: () => Promise<T>, deps: readonly unknown[]): Loaded<T> {
    const [data, setData] = useState<T | null>(null);
    const [failed, setFailed] = useState(false);
    const [refused, setRefused] = useState(false);
    const [refreshFailed, setRefreshFailed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadedAt, setLoadedAt] = useState<Date | null>(null);
    const hasData = useRef(false);
    const generation = useRef(0);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const run = useCallback(load, deps);

    const reload = useCallback(() => {
        const mine = ++generation.current;
        setLoading(true);
        run().then(
            (d) => {
                if (mine !== generation.current) return;
                hasData.current = true;
                setData(d);
                setFailed(false);
                setRefreshFailed(false);
                setLoadedAt(new Date());
                setLoading(false);
            },
            (e: unknown) => {
                if (mine !== generation.current) return;
                if (hasData.current) setRefreshFailed(true);
                else {
                    setFailed(true);
                    setRefused(isRefusal(e));
                }
                setLoading(false);
            },
        );
    }, [run]);

    useEffect(() => {
        hasData.current = false;
        setData(null);
        setFailed(false);
        setRefreshFailed(false);
        reload();
    }, [reload]);

    return { data, failed, refused, refreshFailed, loading, loadedAt, reload };
}

/** 0061's refusals (42501): not the caller's class, activity, or student. */
export function isRefusal(e: unknown): boolean {
    const m = e instanceof Error ? e.message : '';
    return /not_class_teacher|not_your_activity|not_in_scope/.test(m);
}

/** The first-load failure, worded for its cause (DR-4). */
export function LoadFailed({ refused, onRetry }: { refused: boolean; onRetry: () => void }) {
    return (
        <div className="rounded-lg border border-line bg-canvas p-4">
            <p role="alert" className="text-sm text-ink">
                {refused
                    ? 'You can only see progress for your own classes and activities.'
                    : "Couldn't load progress. Check your connection, then try again."}
            </p>
            {!refused && (
                <button
                    type="button"
                    onClick={onRetry}
                    className="mt-3 min-h-[44px] rounded-md border border-line-strong bg-canvas px-4 text-sm font-medium text-strong hover:bg-surface"
                >
                    Try again
                </button>
            )}
        </div>
    );
}

/** Refresh + "Updated 9:41" alone, for the empty states (CP-8 holds there too). */
export function RefreshLine({ loaded }: { loaded: Pick<Loaded<unknown>, 'loading' | 'loadedAt' | 'refreshFailed' | 'reload'> }) {
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
    loaded: Pick<Loaded<unknown>, 'loading' | 'loadedAt' | 'refreshFailed' | 'reload'>;
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

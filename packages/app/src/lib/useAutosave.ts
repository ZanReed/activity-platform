// =============================================================================
// useAutosave.ts — debounced autosave with overlap protection
// -----------------------------------------------------------------------------
// `key` is a stable string fingerprint of the document. When it changes, the
// document changed. The FIRST non-null key is treated as the loaded baseline
// and is not saved. After that, a distinct key schedules save() once edits go
// quiet for `delayMs`.
//
// Guarantees:
//   - Debounced: rapid edits collapse into one save after typing stops.
//   - No overlapping writes: a save never starts while one is in flight.
//   - Trailing save: if the document changes while a save runs, another save is
//     chained when it finishes (on SUCCESS only), so the final state always
//     reaches the server. A failed save is NOT auto-retried here — that would
//     busy-loop on a persistent error; the next edit reschedules instead.
//   - Flush on unmount: a pending change is fired (not awaited) on unmount, so
//     navigating away within the debounce window doesn't drop the last edits.
//   - On-demand flush(): force a pending debounced change to save immediately
//     and await it (e.g. before publish, so the DB has the latest draft).
//     Reports whether the latest state actually persisted — publish ABORTS on
//     false (S9 Drop 1, OV-2), so this result must stay honest.
//   - beforeunload guard: warns on tab close while a change is unsaved (pending
//     debounce or in-flight write), so a hard close doesn't silently drop edits.
// =============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'conflict';

/** Thrown by a save() that found the row changed under it (G-8). */
export class SaveConflictError extends Error {
    constructor() {
        super('This activity changed in another tab or on another device.');
        this.name = 'SaveConflictError';
    }
}

/** Thrown by a save() that can never succeed by retrying (a document that
 *  fails validation, a row that is gone): status 'error', no retries. */
export class PermanentSaveError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'PermanentSaveError';
    }
}

/** Waits between automatic retries of a failed save; the last repeats. */
export const RETRY_DELAYS_MS = [2000, 5000, 15000, 30000] as const;

export interface Autosave {
    status: SaveStatus;
    /** The last failure's message when it won't be retried (PermanentSaveError). */
    permanentError: string | null;
    /**
     * Force any pending/in-flight save to complete. Resolves `true` once the
     * latest document state has reached the server, `false` when a save
     * errored and the latest state is NOT persisted. Never throws. Safe to
     * call when nothing is pending; it resolves `true` immediately.
     */
    flush: () => Promise<boolean>;
    /** Try a failed save again now (the "Retry" button). */
    retry: () => void;
    /** After a conflict: save this tab's version over the other one. */
    overwrite: () => void;
}

export function useAutosave(
    key: string | null,
    /** `force` is true only for overwrite(): skip the conflict check once. */
    save: (opts?: { force?: boolean }) => Promise<void>,
                            delayMs = 1000,
): Autosave {
    const [status, setStatus] = useState<SaveStatus>('idle');
    const [permanentError, setPermanentError] = useState<string | null>(null);

    // Latest values, read at save time without re-running the debounce effect.
    const saveRef = useRef(save);
    saveRef.current = save;
    const latestKey = useRef<string | null>(key);
    latestKey.current = key;

    const savedKey = useRef<string | null>(null); // last key written to the server
    const inFlight = useRef(false);
    const inFlightPromise = useRef<Promise<void> | null>(null);
    const alive = useRef(true);
    // G-8: back-off state, and the conflict stop.
    const failures = useRef(0);
    const retryTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const conflicted = useRef(false);
    const forceNext = useRef(false);

    // True when the document has unsaved changes: a write is in flight, or the
    // latest key differs from what's been persisted (pending debounce window).
    const isDirty = useCallback(
        () =>
        inFlight.current ||
        (latestKey.current !== null && latestKey.current !== savedKey.current),
        [],
    );

    // Runs one save; chains another if the document moved while it was writing.
    // Reads everything from refs, so it is a stable callback.
    const runSave = useCallback(() => {
        if (inFlight.current || !alive.current || conflicted.current) return;
        const writingKey = latestKey.current;
        if (writingKey === null || writingKey === savedKey.current) return;

        clearTimeout(retryTimer.current);
        inFlight.current = true;
        setStatus('saving');
        // Force stays set until a save SUCCEEDS: a network failure during an
        // overwrite retries as an overwrite, not as a checked save.
        const force = forceNext.current;
        const promise = saveRef
        .current(force ? { force: true } : undefined)
        .then(() => {
            savedKey.current = writingKey;
            failures.current = 0;
            forceNext.current = false;
            if (alive.current) {
                setStatus('saved');
                setPermanentError(null);
            }
        })
        .catch((err: unknown) => {
            if (!alive.current) return;
            if (err instanceof SaveConflictError) {
                conflicted.current = true;
                setStatus('conflict');
                return;
            }
            setStatus('error');
            if (err instanceof PermanentSaveError) {
                // Retrying can't help; say why instead of "trying again".
                setPermanentError(err.message);
                return;
            }
            setPermanentError(null);
            // G-8: retry on a back-off rather than wait for the next keystroke.
            const wait = RETRY_DELAYS_MS[Math.min(failures.current, RETRY_DELAYS_MS.length - 1)];
            failures.current += 1;
            retryTimer.current = setTimeout(() => runSaveRef.current(), wait);
        })
        .finally(() => {
            inFlight.current = false;
            inFlightPromise.current = null;
            // Trailing save ONLY on success (savedKey advanced to writingKey)
            // and only if the document moved again during the write. On error,
            // stop — auto-chaining would hammer the server in a tight loop; the
            // next edit (key change) reschedules via the debounce effect.
            if (
                alive.current &&
                savedKey.current === writingKey &&
                latestKey.current !== savedKey.current
            ) {
                runSave();
            }
        });
        inFlightPromise.current = promise;
    }, []);
    // runSave schedules itself from inside its own promise chain.
    const runSaveRef = useRef(runSave);
    runSaveRef.current = runSave;

    const retry = useCallback(() => {
        clearTimeout(retryTimer.current);
        runSave();
    }, [runSave]);

    const overwrite = useCallback(() => {
        conflicted.current = false;
        forceNext.current = true;
        runSave();
    }, [runSave]);

    // G-8: back online → try a failed save at once.
    useEffect(() => {
        const onOnline = () => {
            if (!conflicted.current && latestKey.current !== savedKey.current) runSaveRef.current();
        };
        window.addEventListener('online', onOnline);
        return () => {
            window.removeEventListener('online', onOnline);
            clearTimeout(retryTimer.current);
        };
    }, []);

    const flush = useCallback(async (): Promise<boolean> => {
        // Baseline not yet recorded — there's nothing meaningful to save; adopt
        // the current key as baseline (mirrors the debounce effect) and return.
        if (savedKey.current === null) {
            savedKey.current = latestKey.current;
            return true;
        }
        while (
            alive.current &&
            latestKey.current !== null &&
            latestKey.current !== savedKey.current
        ) {
            if (!inFlightPromise.current) runSave();
            const pending = inFlightPromise.current;
            if (!pending) break; // runSave declined to start one — avoid spinning
            await pending.catch(() => {});
            // Save errored if the persisted key didn't advance and nothing new
            // is in flight — stop rather than retry forever.
            if (latestKey.current !== savedKey.current && !inFlightPromise.current) {
                break;
            }
        }
        // Persisted iff nothing is left pending — the honest answer publish's
        // flush-abort gate (OV-2) relies on.
        return (
            latestKey.current === null ||
            latestKey.current === savedKey.current
        );
    }, [runSave]);

    // Flush a pending change on unmount (fire-and-forget — the network write
    // outlives the component).
    useEffect(() => {
        alive.current = true;
        return () => {
            alive.current = false;
            if (
                !inFlight.current &&
                latestKey.current !== null &&
                latestKey.current !== savedKey.current
            ) {
                saveRef.current().catch(() => undefined);
            }
        };
    }, []);

    // Warn on tab/window close while a change is unsaved. The browser shows its
    // generic "Leave site?" prompt when the handler calls preventDefault — we
    // only arm it when actually dirty so a clean editor never nags.
    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            // Not during a conflict: its own banner offers Reload, and the
            // browser's "Leave site?" on top of it would only confuse.
            if (isDirty() && !conflicted.current) {
                e.preventDefault();
                // Legacy requirement for the prompt to show in some browsers.
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [isDirty]);

    // Debounce: schedule a save once edits go quiet.
    useEffect(() => {
        if (key === null || key === savedKey.current) return;
        // First non-null key = the freshly-loaded baseline; record, don't save.
        if (savedKey.current === null) {
            savedKey.current = key;
            return;
        }
        const timer = setTimeout(runSave, delayMs);
        return () => clearTimeout(timer);
    }, [key, delayMs, runSave]);

    return { status, permanentError, flush, retry, overwrite };
}

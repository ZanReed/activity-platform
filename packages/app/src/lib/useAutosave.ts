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
//   - beforeunload guard: warns on tab close while a change is unsaved (pending
//     debounce or in-flight write), so a hard close doesn't silently drop edits.
// =============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface Autosave {
    status: SaveStatus;
    /**
     * Force any pending/in-flight save to complete, resolving once the latest
     * document state has reached the server (or a save errored — flush is
     * best-effort and never throws). Safe to call when nothing is pending; it
     * resolves immediately.
     */
    flush: () => Promise<void>;
}

export function useAutosave(
    key: string | null,
    save: () => Promise<void>,
                            delayMs = 1000,
): Autosave {
    const [status, setStatus] = useState<SaveStatus>('idle');

    // Latest values, read at save time without re-running the debounce effect.
    const saveRef = useRef(save);
    saveRef.current = save;
    const latestKey = useRef<string | null>(key);
    latestKey.current = key;

    const savedKey = useRef<string | null>(null); // last key written to the server
    const inFlight = useRef(false);
    const inFlightPromise = useRef<Promise<void> | null>(null);
    const alive = useRef(true);

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
        if (inFlight.current || !alive.current) return;
        const writingKey = latestKey.current;
        if (writingKey === null || writingKey === savedKey.current) return;

        inFlight.current = true;
        setStatus('saving');
        const promise = saveRef
        .current()
        .then(() => {
            savedKey.current = writingKey;
            if (alive.current) setStatus('saved');
        })
        .catch(() => {
            if (alive.current) setStatus('error');
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

    const flush = useCallback(async (): Promise<void> => {
        // Baseline not yet recorded — there's nothing meaningful to save; adopt
        // the current key as baseline (mirrors the debounce effect) and return.
        if (savedKey.current === null) {
            savedKey.current = latestKey.current;
            return;
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
                void saveRef.current();
            }
        };
    }, []);

    // Warn on tab/window close while a change is unsaved. The browser shows its
    // generic "Leave site?" prompt when the handler calls preventDefault — we
    // only arm it when actually dirty so a clean editor never nags.
    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (isDirty()) {
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

    return { status, flush };
}

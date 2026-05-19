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
//     chained when it finishes, so the final state always reaches the server.
//   - Flush on unmount: a pending change is fired (not awaited) on unmount, so
//     navigating away within the debounce window doesn't drop the last edits.
// =============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useAutosave(
    key: string | null,
    save: () => Promise<void>,
                            delayMs = 1000,
): SaveStatus {
    const [status, setStatus] = useState<SaveStatus>('idle');

    // Latest values, read at save time without re-running the debounce effect.
    const saveRef = useRef(save);
    saveRef.current = save;
    const latestKey = useRef<string | null>(key);
    latestKey.current = key;

    const savedKey = useRef<string | null>(null); // last key written to the server
    const inFlight = useRef(false);
    const alive = useRef(true);

    // Runs one save; chains another if the document moved while it was writing.
    // Reads everything from refs, so it is a stable callback.
    const runSave = useCallback(() => {
        if (inFlight.current || !alive.current) return;
        const writingKey = latestKey.current;
        if (writingKey === null || writingKey === savedKey.current) return;

        inFlight.current = true;
        setStatus('saving');
        saveRef
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
            if (alive.current && latestKey.current !== savedKey.current) {
                runSave(); // trailing save for edits made during the write
            }
        });
    }, []);

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

    return status;
}

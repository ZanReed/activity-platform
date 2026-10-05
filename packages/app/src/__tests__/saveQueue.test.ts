// The run's save queue (G1, ER-19, DR-14), with the port, the storage and the
// timer injected — no network, no real clock.
import { describe, expect, it } from 'vitest';
import type { AttemptRecord } from '../practice/factRun';
import { FactSaveQueue, heldKey, type SaveOutcome, type SavePort } from '../practice/saveQueue';

const attempt = (n: number): AttemptRecord => ({
    n,
    typed: String(n),
    skipped: false,
    interrupted: false,
    rtMs: 900,
    offsetMs: n * 1000,
    modality: 'keyboard',
});

function memoryStorage() {
    const data = new Map<string, string>();
    return {
        data,
        getItem: (k: string) => data.get(k) ?? null,
        setItem: (k: string, v: string) => void data.set(k, v),
        removeItem: (k: string) => void data.delete(k),
    };
}

/** A port whose every call is held until the test settles it. */
function manualPort() {
    const calls: {
        attempts: AttemptRecord[];
        options: { baselines: unknown; finished: boolean };
        resolve: (o: SaveOutcome) => void;
        reject: (e: Error) => void;
    }[] = [];
    const port: SavePort = (attempts, options) =>
        new Promise<SaveOutcome>((resolve, reject) => {
            calls.push({ attempts, options, resolve, reject });
        });
    return { port, calls };
}

const tick = () => new Promise<void>((r) => setTimeout(r, 0));
const saved = (n: number): SaveOutcome => ({ state: 'saved', saved: n, finished: false });

describe('FactSaveQueue', () => {
    it('sends one request at a time and coalesces what arrives meanwhile', async () => {
        const { port, calls } = manualPort();
        const storage = memoryStorage();
        const q = new FactSaveQueue({ port, storage, storageKey: 'k' });
        q.enqueue(attempt(1), { keyboard: 200, keypad: null });
        q.enqueue(attempt(2), null);
        q.enqueue(attempt(3), null);
        expect(calls).toHaveLength(1);
        expect(calls[0]!.attempts.map((a) => a.n)).toEqual([1]);
        expect(calls[0]!.options.baselines).toEqual({ keyboard: 200, keypad: null });
        calls[0]!.resolve(saved(1));
        await tick();
        expect(calls).toHaveLength(2);
        expect(calls[1]!.attempts.map((a) => a.n)).toEqual([2, 3]);
        calls[1]!.resolve(saved(3));
        await tick();
        expect(q.pending).toBe(0);
        expect(q.status).toBe('idle');
        expect(storage.data.size).toBe(0);
    });

    it('mirrors only the unsaved attempts to storage, and a new queue re-sends them', async () => {
        const storage = memoryStorage();
        const first = manualPort();
        const q1 = new FactSaveQueue({ port: first.port, storage, storageKey: 'k' });
        q1.enqueue(attempt(1), { keyboard: 200, keypad: null });
        q1.enqueue(attempt(2), null);
        expect(JSON.parse(storage.data.get('k')!).attempts).toHaveLength(2);
        // The page reloads before anything was confirmed.
        const second = manualPort();
        const q2 = new FactSaveQueue({ port: second.port, storage, storageKey: 'k' });
        expect(q2.pending).toBe(2);
        void q2.flush();
        expect(second.calls[0]!.attempts.map((a) => a.n)).toEqual([1, 2]);
        expect(second.calls[0]!.options.baselines).toEqual({ keyboard: 200, keypad: null });
        second.calls[0]!.resolve(saved(2));
        await tick();
        expect(storage.data.size).toBe(0);
    });

    it('retries a failed save with the same attempts, and records when failing began', async () => {
        const { port, calls } = manualPort();
        const timers: { fn: () => void; ms: number }[] = [];
        let now = 1000;
        const q = new FactSaveQueue({
            port,
            storage: null,
            storageKey: 'k',
            now: () => now,
            setTimer: (fn, ms) => timers.push({ fn, ms }),
        });
        q.enqueue(attempt(1), null);
        calls[0]!.reject(new Error('fetch failed'));
        await tick();
        expect(q.status).toBe('failing');
        expect(q.failingSince).toBe(1000);
        expect(q.pending).toBe(1);
        expect(timers.map((t) => t.ms)).toEqual([1000]);
        // A second attempt arrives while failing: it rides the retry.
        q.enqueue(attempt(2), null);
        await tick();
        now = 5000;
        calls.at(-1)!.reject(new Error('fetch failed'));
        await tick();
        expect(q.failingSince).toBe(1000);
        timers.at(-1)!.fn();
        expect(calls.at(-1)!.attempts.map((a) => a.n)).toEqual([1, 2]);
        calls.at(-1)!.resolve(saved(2));
        await tick();
        expect(q.status).toBe('idle');
        expect(q.failingSince).toBeNull();
        expect(q.pending).toBe(0);
    });

    it('stops and reports when the server says the check was closed', async () => {
        const { port, calls } = manualPort();
        const storage = memoryStorage();
        let closed = 0;
        const q = new FactSaveQueue({ port, storage, storageKey: 'k', onClosed: () => closed++ });
        q.enqueue(attempt(1), null);
        calls[0]!.resolve({ state: 'closed', saved: 0, finished: false });
        await tick();
        expect(q.status).toBe('closed');
        expect(closed).toBe(1);
        expect(storage.data.size).toBe(0);
        q.enqueue(attempt(2), null);
        expect(calls).toHaveLength(1);
    });

    it('does not retry a refusal the server would repeat forever', async () => {
        const { port, calls } = manualPort();
        const timers: unknown[] = [];
        const q = new FactSaveQueue({ port, storage: null, storageKey: 'k', setTimer: (fn) => timers.push(fn) });
        q.enqueue(attempt(1), null);
        calls[0]!.reject(new Error('malformed: 1 attempt(s) refused'));
        await tick();
        expect(q.status).toBe('refused');
        expect(timers).toHaveLength(0);
    });

    it('sends the finishing call, even with nothing left to save, and only then is settled', async () => {
        const { port, calls } = manualPort();
        const storage = memoryStorage();
        const q = new FactSaveQueue({ port, storage, storageKey: 'k' });
        q.enqueue(attempt(1), null);
        calls[0]!.resolve(saved(1));
        await tick();
        expect(q.settled).toBe(true);
        q.finish();
        expect(q.settled).toBe(false);
        expect(calls[1]!.attempts).toEqual([]);
        expect(calls[1]!.options.finished).toBe(true);
        calls[1]!.resolve({ state: 'saved', saved: 1, finished: true });
        await tick();
        expect(q.settled).toBe(true);
        // Nothing stays on the device once the run is fully saved (found by the
        // e2e run: a "finished" marker used to be left behind).
        expect(storage.data.size).toBe(0);
        // …and it is not sent twice.
        void q.flush();
        expect(calls).toHaveLength(2);
    });

    it('keeps held attempts under the viewer prefix, per student and per check', () => {
        expect(heldKey('activity-viewer:', 'student-1', 'probe-9')).toBe('activity-viewer:facts:student-1:probe-9');
    });
});

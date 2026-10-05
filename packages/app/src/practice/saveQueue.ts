// =============================================================================
// saveQueue.ts — saving a run's attempts (G1, ER-19, DR-14)
// -----------------------------------------------------------------------------
// The runner saves after EVERY item. This queue is what makes that safe:
//
//   - COALESCING: one request in flight at a time; whatever arrives meanwhile
//     goes in the next one.
//   - IDEMPOTENT: the server keys on (session, item number) and the first
//     write wins, so re-sending after a failure or a reload cannot double-
//     count. That is why a retry simply re-sends everything not yet confirmed.
//   - HELD ON THE DEVICE: only attempts not yet saved are kept, in memory and
//     mirrored to sessionStorage under the viewer's `activity-viewer:` prefix
//     (so signOutEverything already purges it — no new eager code). A reload
//     picks the held ones up and sends them again. Nothing in localStorage.
//   - SILENT: nothing here ever interrupts an item. The route reads `status`
//     and `failingSince` to show one quiet line after 10 s of failure, and the
//     done screen's retry state.
//   - CLOSED: when the server says the check was closed, the queue stops and
//     tells the route, which shows the closed screen. A refusal the server
//     will repeat forever (malformed, not a member) stops it too.
//
// Pure of React and of Supabase: the port, the storage and the timer are
// injected, so the rules are tested on a fake clock.
// =============================================================================

import type { AttemptRecord } from './factRun';
import type { Baselines } from './baseline';

export interface SaveOutcome {
    state: 'saved' | 'closed';
    saved: number;
    finished: boolean;
}

export type SavePort = (
    attempts: AttemptRecord[],
    options: { baselines: Baselines | null; finished: boolean },
) => Promise<SaveOutcome>;

export type QueueStatus = 'idle' | 'saving' | 'failing' | 'closed' | 'refused';

export interface SaveQueueOptions {
    port: SavePort;
    /** sessionStorage, or null when storage is unavailable. */
    storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null;
    storageKey: string;
    now?: () => number;
    setTimer?: (fn: () => void, ms: number) => unknown;
    onClosed?: () => void;
    onChange?: () => void;
}

interface Held {
    attempts: AttemptRecord[];
    baselines: Baselines | null;
    finished: boolean;
}

const RETRY_MS = [1000, 2000, 4000, 8000, 15000];

/** Errors the server will give again however often we ask. */
const isPermanent = (message: string) => /malformed|not_member|not_signed_in/i.test(message);

export class FactSaveQueue {
    status: QueueStatus = 'idle';
    /** When the current run of failures began (ms), or null. */
    failingSince: number | null = null;
    private held: Held = { attempts: [], baselines: null, finished: false };
    private inFlight = false;
    private failures = 0;
    private finishSent = false;
    private readonly o: Required<Pick<SaveQueueOptions, 'now' | 'setTimer'>> & SaveQueueOptions;

    constructor(options: SaveQueueOptions) {
        this.o = {
            now: () => Date.now(),
            setTimer: (fn, ms) => setTimeout(fn, ms),
            ...options,
        };
        this.restore();
    }

    /** Attempts not yet confirmed saved. */
    get pending(): number {
        return this.held.attempts.length;
    }

    /** Everything is saved, including the finishing call if one was asked for. */
    get settled(): boolean {
        return this.pending === 0 && !this.inFlight && (!this.held.finished || this.finishSent);
    }

    enqueue(attempt: AttemptRecord, baselines: Baselines | null): void {
        if (this.status === 'closed' || this.status === 'refused') return;
        this.held.attempts.push(attempt);
        if (baselines) this.held.baselines = baselines;
        this.persist();
        void this.flush();
    }

    /** The run is over: tell the server, with whatever is still held. */
    finish(): void {
        if (this.status === 'closed' || this.status === 'refused') return;
        this.held.finished = true;
        this.persist();
        void this.flush();
    }

    /** Send now (also the done screen's "Try now" and the page-hidden flush). */
    async flush(): Promise<void> {
        if (this.inFlight || this.status === 'closed' || this.status === 'refused') return;
        const wantsFinish = this.held.finished && !this.finishSent;
        if (this.held.attempts.length === 0 && !wantsFinish) return;

        const batch = [...this.held.attempts];
        this.inFlight = true;
        if (this.status !== 'failing') this.setStatus('saving');
        try {
            const outcome = await this.o.port(batch, {
                baselines: this.held.baselines,
                finished: this.held.finished,
            });
            this.inFlight = false;
            this.failures = 0;
            this.failingSince = null;
            if (outcome.state === 'closed') {
                this.held = { attempts: [], baselines: null, finished: false };
                this.persist();
                this.setStatus('closed');
                this.o.onClosed?.();
                return;
            }
            // Drop what was sent; keep anything that arrived meanwhile.
            const sent = new Set(batch.map((a) => a.n));
            this.held.attempts = this.held.attempts.filter((a) => !sent.has(a.n));
            if (wantsFinish) this.finishSent = true;
            this.persist();
            this.setStatus('idle');
            if (this.held.attempts.length > 0 || (this.held.finished && !this.finishSent)) {
                void this.flush();
            }
        } catch (err) {
            this.inFlight = false;
            const message = err instanceof Error ? err.message : String(err);
            if (isPermanent(message)) {
                this.setStatus('refused');
                return;
            }
            if (this.failingSince === null) this.failingSince = this.o.now();
            const delay = RETRY_MS[Math.min(this.failures, RETRY_MS.length - 1)]!;
            this.failures++;
            this.setStatus('failing');
            this.o.setTimer(() => void this.flush(), delay);
        }
    }

    private setStatus(status: QueueStatus): void {
        this.status = status;
        this.o.onChange?.();
    }

    private persist(): void {
        const { storage, storageKey } = this.o;
        if (!storage) return;
        try {
            // Nothing left to send — no attempts, and no finishing call still
            // owed — means nothing is kept on the device.
            if (this.held.attempts.length === 0 && (!this.held.finished || this.finishSent)) {
                storage.removeItem(storageKey);
            }
            else storage.setItem(storageKey, JSON.stringify(this.held));
        } catch {
            // Storage full or blocked: the attempts stay in memory.
        }
    }

    private restore(): void {
        const { storage, storageKey } = this.o;
        if (!storage) return;
        try {
            const raw = storage.getItem(storageKey);
            if (!raw) return;
            const parsed = JSON.parse(raw) as Partial<Held>;
            if (Array.isArray(parsed.attempts)) {
                this.held = {
                    attempts: parsed.attempts,
                    baselines: parsed.baselines ?? null,
                    finished: parsed.finished === true,
                };
            }
        } catch {
            // Unreadable: start clean.
        }
    }
}

/** The sessionStorage key for one student's held attempts on one check. */
export function heldKey(prefix: string, studentId: string, probeId: string): string {
    return `${prefix}facts:${studentId}:${probeId}`;
}

// =============================================================================
// retryLoop.ts — keep a practice Check going while the network is away (DM-5)
// -----------------------------------------------------------------------------
// A Check that cannot reach the server is NOT a failure (the viewer's own
// TV3-A doctrine): the item and the typed answer stay, the button keeps saying
// "Checking…", and the same request goes again until it lands. Only an
// `offline` CheckError retries; every other failure is a real answer and is
// thrown to the caller at once.
//
// Resending is safe: check-activity's practice mode returns a slot's STORED
// try when one exists (ER-9), so a request that landed but whose response was
// lost replays instead of recording twice.
//
// `failingSince` drives DM-5's quiet line after 10 s; `poke()` is its
// "Try again", which fires the waiting retry now instead of at the next tick.
// =============================================================================

export const RETRY_DELAYS_MS = [1_000, 2_000, 4_000, 8_000] as const;
export const RETRY_MAX_DELAY_MS = 10_000;

export class RetryLoop {
    /** When the current run first failed to reach the server; null otherwise. */
    failingSince: number | null = null;
    private wake: (() => void) | null = null;
    private stopped = false;

    constructor(
        private readonly onChange: () => void = () => {},
        private readonly now: () => number = Date.now,
    ) {}

    async run<T>(attempt: () => Promise<T>): Promise<T> {
        let tries = 0;
        for (;;) {
            try {
                const value = await attempt();
                this.settle();
                return value;
            } catch (error) {
                if ((error as { kind?: string }).kind !== 'offline' || this.stopped) {
                    this.settle();
                    throw error;
                }
                if (this.failingSince === null) {
                    this.failingSince = this.now();
                    this.onChange();
                }
                const delay = RETRY_DELAYS_MS[tries] ?? RETRY_MAX_DELAY_MS;
                tries += 1;
                await new Promise<void>((resolve) => {
                    const timer = setTimeout(() => {
                        this.wake = null;
                        resolve();
                    }, delay);
                    this.wake = () => {
                        clearTimeout(timer);
                        this.wake = null;
                        resolve();
                    };
                });
            }
        }
    }

    /** "Try again": fire the waiting retry now. */
    poke(): void {
        this.wake?.();
    }

    /** The runner is (back) on screen. Paired with stop() in one effect, so a
     * remount (React StrictMode runs every effect's cleanup once in dev)
     * never leaves the loop stopped under a question still showing. */
    start(): void {
        this.stopped = false;
    }

    /** The runner is going away: the next failure throws instead of waiting. */
    stop(): void {
        this.stopped = true;
        this.poke();
    }

    private settle(): void {
        if (this.failingSince !== null) {
            this.failingSince = null;
            this.onChange();
        }
    }
}

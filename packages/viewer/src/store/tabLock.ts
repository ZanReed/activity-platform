// =============================================================================
// store/tabLock.ts — one editable tab per student per activity (ruling S6-4)
// -----------------------------------------------------------------------------
// Two tabs open on the same activity both writing to the same buffer key means
// the last one to flush wins, and the student loses whichever half they did in
// the other tab. Ruling 2.3A calls for the Docs convention: the stale tab goes
// read-only behind an explicit "Use it here" takeover.
//
// WHY THE WEB LOCKS API AND NOT A HEARTBEAT. The obvious hand-rolled version
// writes a timestamp every few seconds and treats a stale timestamp as a dead
// tab. That forces a guess, and Chromebooks make the guess wrong: background
// tabs get throttled hard, so a perfectly alive tab can look dead, and a tab
// killed by the OS looks alive until its timeout lapses. `navigator.locks`
// releases automatically when the holder's context goes away — crash, close,
// or kill — which deletes the entire staleness question rather than tuning it.
//
//   tab A  ──request(exclusive)──► HELD ────────────────┐
//   tab B  ──request(exclusive)──► queued (read-only)   │
//                                                        │
//   tab B  ──request(steal:true)─► HELD                 │
//   tab A  ◄── request() rejects AbortError ────────────┘
//          └─► read-only, and re-queues so that closing B hands it back
//
// The steal rejection IS the notification: the displaced tab learns it lost
// from the lock itself. A BroadcastChannel announcement was in the plan and is
// deliberately not here — it would be a second mechanism carrying the same
// fact, and the two could disagree. If a future need appears that the lock
// genuinely cannot express, add it then.
// =============================================================================

export interface LockRequestOptions {
  mode?: 'exclusive' | 'shared';
  /** Take the lock from the current holder, rejecting their request promise. */
  steal?: boolean;
}

/** The slice of `navigator.locks` this module uses — injectable so the
 * two-tab cases are real tests instead of a browser-only hope. */
export interface LockManagerLike {
  request(
    name: string,
    options: LockRequestOptions,
    callback: () => Promise<void>,
  ): Promise<void>;
}

export interface TabLockOptions {
  /** Scope. Must include the user AND the activity: two students on one
   * machine, or one student on two activities, must not block each other. */
  name: string;
  locks?: LockManagerLike | null;
  onChange?: (held: boolean) => void;
}

export interface TabLock {
  /** True when THIS tab is the one allowed to write. */
  isHeld(): boolean;
  /** Take the lock from whoever holds it — the "Use it here" action. */
  takeOver(): void;
  subscribe(listener: (held: boolean) => void): () => void;
  /** Release and stop competing (unmount). */
  dispose(): void;
}

function browserLocks(): LockManagerLike | null {
  if (typeof navigator === 'undefined') return null;
  const locks = (navigator as Navigator & { locks?: LockManagerLike }).locks;
  return locks ?? null;
}

export function createTabLock(options: TabLockOptions): TabLock {
  const { name, onChange } = options;
  const locks = options.locks === undefined ? browserLocks() : options.locks;

  let held = false;
  let active = true;
  let releaseCurrent: (() => void) | null = null;
  // Which claim is the live one. Taking over abandons the request we already
  // had queued, but that request still exists inside the lock manager and will
  // eventually be granted — without this counter, that zombie grant would flip
  // us to held and straight back to not-held, for a lock we already hold by
  // other means. A stale claim releases immediately and touches no state.
  let generation = 0;
  const listeners = new Set<(held: boolean) => void>();

  function setHeld(next: boolean): void {
    if (held === next) return;
    held = next;
    onChange?.(next);
    for (const listener of listeners) listener(next);
  }

  // NO WEB LOCKS (older browser, non-DOM context): assume this tab is the only
  // one. Locking a student out of their own work because we cannot coordinate
  // is far worse than the clobber risk we are guarding against — the guard is
  // a safety net, not a gate on doing the activity at all.
  if (!locks) {
    setHeld(true);
    return {
      isHeld: () => held,
      takeOver: () => {},
      subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
      dispose() {
        active = false;
        setHeld(false);
      },
    };
  }

  function claim(steal: boolean): void {
    if (!active) return;
    const gen = ++generation;
    let release!: () => void;
    const holding = new Promise<void>((resolve) => {
      release = resolve;
    });
    releaseCurrent = release;

    void locks!
      .request(name, { mode: 'exclusive', steal }, async () => {
        if (gen !== generation) return; // abandoned claim: release at once
        setHeld(true);
        // Holding the lock IS keeping this promise pending. It resolves when
        // we release deliberately, or when a steal knocks us off below.
        await holding;
        setHeld(false);
      })
      .catch(() => {
        if (gen !== generation) return;
        // Someone called takeOver() in another tab. Stop holding, go
        // read-only, and get back in line: if that tab closes, this one
        // becomes editable again on its own, which is what a student who
        // closed the new tab expects.
        setHeld(false);
        release();
        if (active) claim(false);
      });
  }

  claim(false);

  return {
    isHeld: () => held,

    takeOver() {
      if (!active || held) return;
      // Release our queued request first, or we would sit behind ourselves.
      releaseCurrent?.();
      claim(true);
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    dispose() {
      active = false;
      releaseCurrent?.();
      releaseCurrent = null;
      setHeld(false);
    },
  };
}

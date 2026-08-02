// =============================================================================
// store/queue.ts — the queued-check executor (S6 rulings S6-2 / S6-7 / S6-8)
// -----------------------------------------------------------------------------
// A student pressed Check with no network. The promise the UI made them is
// "Will check when you're back online" — this is the thing that keeps it.
//
// IT OWNS NO QUEUE. The list of waiting sections lives in the store (and
// therefore in the buffer, and therefore survives a closed lid); this module
// only decides WHEN to act on it. That is ruling S6-8, and the reason is
// boring but real: two components asking "is this section queued?" must never
// get two answers.
//
//   store.pending ──┐
//                   │   ┌──────────────────────────────────────┐
//   connectivity ───┼──►│ runNow()                             │
//   (online / vis)  │   │  1. online? else return              │
//                   │   │  2. anything pending? else return    │
//   start()/boot ───┘   │  3. ensureSession() — refresh FIRST  │
//                       │  4. for each, sequentially:          │
//                       │       store.checkSection(CURRENT)    │
//                       │  5. still pending ⇒ network is still │
//                       │     down ⇒ stop, wait for next signal│
//                       └──────────────────────────────────────┘
//
// WHY SEQUENTIAL: a classroom coming back online is thirty Chromebooks firing
// at once. Per-student that is a handful of sections, and firing them serially
// costs a second while keeping us under the per-student rate ceiling the check
// RPC enforces. Parallel would buy nothing a student can perceive and would
// turn one reconnect into a burst.
//
// WHY REFRESH BEFORE FIRING: after a long outage the access token is usually
// expired. Firing first means a guaranteed 401 that burns the attempt and
// shows the student a failure that has nothing to do with their work. If the
// refresh itself fails, the queue PARKS — the intent stays, the re-auth banner
// takes over, and the check fires after they sign back in.
// =============================================================================

import type { ConnectivitySignal } from './ports.js';
import type { SectionItemIds, ViewerStore } from './store.js';

export interface CheckQueueOptions {
  store: ViewerStore;
  /**
   * The section's item ids, from the served document. `null` means the section
   * no longer exists in what we're rendering — the intent is dropped rather
   * than fired blind.
   */
  resolveItems(sectionId: string): SectionItemIds | null;
  connectivity: ConnectivitySignal;
  /**
   * Make the session usable before firing. `false` ⇒ park. Injected because
   * the viewer package holds no auth code (the app owns Supabase); the port
   * keeps the dependency pointing the right way.
   */
  ensureSession?: () => Promise<boolean>;
  /** Told when a run parks on auth, so the UI can raise the re-auth banner. */
  onAuthRequired?: () => void;
}

export interface CheckQueue {
  /** Subscribe to connectivity and attempt an immediate run (the boot fire). */
  start(): void;
  stop(): void;
  /** Run now. Concurrent callers share the in-flight run. */
  runNow(): Promise<void>;
}

export function createCheckQueue(options: CheckQueueOptions): CheckQueue {
  const { store, resolveItems, connectivity, ensureSession, onAuthRequired } =
    options;

  // Concurrency control, NOT queue state: `online` and `visibilitychange` both
  // fire on a Chromebook waking up, and without this the same section would be
  // checked twice — two attempts in the teacher's data for one piece of work.
  let inFlight: Promise<void> | null = null;
  // ...but a signal arriving DURING a run must not be dropped, which is subtler
  // than it sounds and was a real bug here: a run started a moment before the
  // network came back returns early (still offline), and if the wake signal
  // that arrived mid-run were discarded, the queued check would sit there until
  // some later, unrelated event. So a signal during a run schedules exactly one
  // more pass. Never two at once, never a missed edge.
  let rerun = false;
  let unsubscribe: (() => void) | null = null;

  async function run(): Promise<void> {
    if (!connectivity.isOnline()) return;

    const queued = Object.keys(store.getState().pending);
    if (queued.length === 0) return;

    if (ensureSession) {
      const ok = await ensureSession();
      if (!ok) {
        // Park: the intents stay exactly where they are. Re-auth will trigger
        // another run, and the student's queued checks are still waiting.
        onAuthRequired?.();
        return;
      }
    }

    for (const sectionId of queued) {
      // Re-read every iteration: an earlier fire may have cleared this one
      // (a re-check the student triggered by hand, say), and firing a section
      // that is no longer queued would mint a duplicate attempt.
      if (store.getState().pending[sectionId] === undefined) continue;

      const items = resolveItems(sectionId);
      if (items === null) {
        store.dropPendingCheck(sectionId);
        continue;
      }

      // checkSection reads CURRENT values (2.2A) and owns the drift notice —
      // the queue deliberately does not pass a snapshot, because grading what
      // the student has NOW is the whole ruling.
      await store.checkSection(sectionId, items);

      // Still queued ⇒ the fire failed offline again ⇒ the network is not
      // actually back. Stop rather than grinding through the rest; the next
      // connectivity signal starts a fresh pass.
      if (store.getState().pending[sectionId] !== undefined) return;
    }
  }

  function runNow(): Promise<void> {
    if (inFlight) {
      rerun = true;
      return inFlight;
    }
    inFlight = (async () => {
      do {
        rerun = false;
        await run();
      } while (rerun);
    })().finally(() => {
      inFlight = null;
    });
    return inFlight;
  }

  return {
    start() {
      if (unsubscribe) return;
      unsubscribe = connectivity.subscribe(() => {
        void runNow();
      });
      // The boot fire: a tab reopened after the outage ended never sees an
      // 'online' event, because it was not running when the edge happened.
      void runNow();
    },

    stop() {
      unsubscribe?.();
      unsubscribe = null;
    },

    runNow,
  };
}

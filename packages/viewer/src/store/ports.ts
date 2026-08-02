// =============================================================================
// store/ports.ts — injectable environment seams for the local-first layer
// (S6 ruling S6-7)
// -----------------------------------------------------------------------------
// The buffer and (in V2) the queue executor react to things the browser owns:
// time passing, the page going away, connectivity returning. Those enter
// through ports rather than being read off globals, for the same reason
// grading enters through `CheckService`: a test can drive them exactly, and
// the production implementation stays a thin, obvious wrapper.
//
// The alternative — stubbing globals per test — re-encodes browser event
// semantics by hand in every suite. That is the divergence class that already
// bit this repo once (a hand-written error-shape double let a real error path
// stay broken while both sides' unit tests passed); the ports keep the fake
// and the real thing shaped by ONE interface.
//
// Note these deliberately do NOT try to be a full scheduler abstraction. They
// cover exactly what the local-first layer needs, and nothing speculative.
// =============================================================================

export type TimerHandle = ReturnType<typeof setTimeout>;

export interface Clock {
  now(): number;
  setTimer(fn: () => void, ms: number): TimerHandle;
  clearTimer(handle: TimerHandle): void;
}

export const systemClock: Clock = {
  now: () => Date.now(),
  setTimer: (fn, ms) => setTimeout(fn, ms),
  clearTimer: (handle) => clearTimeout(handle),
};

/**
 * Fires when the page is about to stop being visible — the last moment a
 * synchronous write is guaranteed to land.
 *
 * `visibilitychange`→hidden and `pagehide` are both listened to on purpose:
 * a Chromebook lid closing, a tab switch, and a tab closing do not all produce
 * the same event, and the one that fires reliably differs by platform. Firing
 * the listener twice is harmless (the flush is idempotent); missing it loses
 * the student's last few hundred milliseconds of work.
 *
 * `beforeunload` is deliberately NOT used — it suppresses the back/forward
 * cache and is unreliable on mobile.
 */
export interface HideSignal {
  subscribe(listener: () => void): () => void;
}

/** No-op signal for non-DOM contexts (node tests, SSR). */
export const nullHideSignal: HideSignal = {
  subscribe: () => () => {},
};

/**
 * "Can we reach the server, and did that just change?"
 *
 * `navigator.onLine` is famously optimistic — it reports true for a laptop
 * joined to a captive-portal Wi-Fi that routes nowhere. It is used here as a
 * TRIGGER, never as proof: the queue's real test of connectivity is sending
 * the check and seeing what happens. A false positive costs one failed request
 * that lands back in the queue; a missed transition would strand a student's
 * queued check until they touched something, which is the worse failure.
 *
 * `visibilitychange` is a trigger too, and matters more than it looks: a
 * Chromebook lid that opens on a working network often produces a visibility
 * event and no `online` event at all, because the tab never observed the
 * offline→online edge while it was frozen.
 */
export interface ConnectivitySignal {
  isOnline(): boolean;
  /** Fires on any event that means "worth trying again". */
  subscribe(listener: () => void): () => void;
}

/** Always-online signal for tests and non-DOM contexts. */
export const alwaysOnlineConnectivity: ConnectivitySignal = {
  isOnline: () => true,
  subscribe: () => () => {},
};

export function createBrowserConnectivity(): ConnectivitySignal {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return alwaysOnlineConnectivity;
  }
  return {
    isOnline: () => navigator.onLine,
    subscribe(listener) {
      const onOnline = () => listener();
      const onVisible = () => {
        if (document.visibilityState === 'visible') listener();
      };
      window.addEventListener('online', onOnline);
      document.addEventListener('visibilitychange', onVisible);
      return () => {
        window.removeEventListener('online', onOnline);
        document.removeEventListener('visibilitychange', onVisible);
      };
    },
  };
}

export function createDocumentHideSignal(): HideSignal {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return nullHideSignal;
  }
  return {
    subscribe(listener) {
      const onVisibility = () => {
        if (document.visibilityState === 'hidden') listener();
      };
      const onPageHide = () => listener();
      document.addEventListener('visibilitychange', onVisibility);
      window.addEventListener('pagehide', onPageHide);
      return () => {
        document.removeEventListener('visibilitychange', onVisibility);
        window.removeEventListener('pagehide', onPageHide);
      };
    },
  };
}

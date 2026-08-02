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

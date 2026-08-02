// =============================================================================
// swRegistration.ts — service worker + stale-chunk recovery (S6 V8)
// -----------------------------------------------------------------------------
// Two separate jobs that share one cause: the files this app is made of are
// content-hashed, and a deploy replaces them.
//
// 1. REGISTER THE WORKER, so a student who has opened the activity once can
//    open it again with no network. `autoUpdate` means a new build is adopted
//    on the next navigation rather than waiting for every tab to close — the
//    stale-forever trap that gives service workers their reputation.
//
// 2. RECOVER FROM A CHUNK THAT NO LONGER EXISTS. This one is NOT a
//    service-worker problem and predates this slice: Cloudflare Pages replaces
//    the hashed assets on deploy, so a tab left open across a deploy asks for
//    a filename that is now a 404 the moment the student opens something lazy
//    — the calculator, a graph. Before this, that was a control that silently
//    did nothing. Vite raises `vite:preloadError` for exactly this case, and
//    the only real fix is to reload into the new HTML.
//
// The reload is guarded by a session flag so a genuinely broken deploy cannot
// put a student in a reload loop, which would be worse than the dead button.
// =============================================================================

const RELOAD_GUARD_KEY = 'activity-viewer:reloaded-for-stale-chunk';

/** Session storage, or null in a profile that forbids it. */
function safeSession(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export interface StaleChunkRecoveryOptions {
  /** Injectable so the guard logic is testable; jsdom cannot spy a real
   * location.reload, and stubbing window.location globally leaks between
   * tests. */
  reload?: () => void;
}

/** Returns a detacher, matching `watchIdle`'s shape. Production calls this once
 * and ignores it; tests need it, because listeners left on `window` between
 * cases make one test's guard swallow the next one's event. */
export function installStaleChunkRecovery(
  options: StaleChunkRecoveryOptions = {},
): { stop: () => void } {
  const reload = options.reload ?? (() => window.location.reload());

  const onPreloadError = (event: Event) => {
    const store = safeSession();
    if (store?.getItem(RELOAD_GUARD_KEY)) {
      // Already tried. A second reload would loop; let the error surface so
      // the failure is at least visible instead of a spinning page.
      return;
    }
    // Prevent Vite's default (rethrow) so the page is not left in a broken
    // state while the reload is in flight.
    event.preventDefault();
    store?.setItem(RELOAD_GUARD_KEY, '1');
    reload();
  };

  // A load that got this far is healthy: clear the guard so a LATER deploy
  // gets its own single retry rather than inheriting this one's.
  const onLoad = () => {
    safeSession()?.removeItem(RELOAD_GUARD_KEY);
  };

  window.addEventListener('vite:preloadError', onPreloadError);
  window.addEventListener('load', onLoad);

  return {
    stop: () => {
      window.removeEventListener('vite:preloadError', onPreloadError);
      window.removeEventListener('load', onLoad);
    },
  };
}

/**
 * Put the assets THIS page actually used into the runtime cache.
 *
 * Without this, offline reopen does not work until a student's THIRD visit,
 * and the reason is subtle enough to be worth stating: the worker installs
 * during the first visit, so that visit's own asset requests were already in
 * flight and never passed through it. Nothing gets cached. The second visit
 * finally routes through the worker and populates the cache; only the third
 * can survive going offline. A student who opens an activity once in class and
 * reopens it at home with no signal would get a blank page — which is exactly
 * what the first run of the offline e2e showed.
 *
 * `performance.getEntriesByType('resource')` is the honest source for "what
 * did this page need": no manifest to keep in sync, and it naturally covers
 * lazily-loaded chunks the moment a student opens the surface that needs them.
 * The re-fetch is nearly free — these files are content-hashed and immutable,
 * so the browser's own HTTP cache answers.
 */
export function warmAssetCache(cacheName: string): void {
  if (typeof caches === 'undefined') return;
  const warm = () => {
    void (async () => {
      try {
        const urls = performance
          .getEntriesByType('resource')
          .map((entry) => entry.name)
          .filter((name) => name.startsWith(`${location.origin}/assets/`));
        if (urls.length === 0) return;
        const cache = await caches.open(cacheName);
        await Promise.all(
          urls.map(async (url) => {
            // Skip what is already there so a revisit costs nothing.
            if (await cache.match(url)) return;
            await cache.add(url).catch(() => {
              // One asset failing to cache is not worth failing the page.
            });
          }),
        );
      } catch {
        // No storage, or a quota refusal. Online still works.
      }
    })();
  };
  if (document.readyState === 'complete') warm();
  else window.addEventListener('load', warm);
}

export async function registerServiceWorker(): Promise<void> {
  // Dev serves modules unbundled and the generated worker does not exist, so
  // registering there would be registering something else entirely.
  if (!import.meta.env.PROD) return;
  try {
    const { registerSW } = await import('virtual:pwa-register');
    registerSW({ immediate: true });
  } catch {
    // No worker support, or a blocked registration. Everything on this page
    // works online without it; offline reopen is the only thing lost.
  }
}

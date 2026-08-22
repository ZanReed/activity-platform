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
// 3. RECOVER FROM A STORED DOCUMENT THE OLD BUILD CANNOT READ. Same cause,
//    different symptom, found on a teacher 2026-08-22. index.html is the one
//    PRECACHED file (assets are cached by hashed name, where a hit can never be
//    stale), so a page load served the old index.html loads an entirely old,
//    self-consistent build. If a deploy added a BLOCK TYPE, that build's schema
//    does not know it, and `ActivityDocument.safeParse` rejects the whole
//    document — the editor shows "malformed" for an activity whose stored bytes
//    are perfectly valid. Unlike the chunk case there is no browser event to
//    listen for: the failure is a zod result, so the CALLER reports it here.
//
// Both reloads are guarded by their own session flag so a genuinely broken
// deploy — or a genuinely broken document — cannot put anyone in a reload loop,
// which would be worse than the dead button or the error page.
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

const STALE_DOC_GUARD_KEY = 'activity-viewer:reloaded-for-stale-build';

export interface StaleBuildReloadOptions {
  /** Injectable for the same reason the chunk recovery injects it: jsdom
   * cannot spy a real location.reload. */
  reload?: () => void;
}

/**
 * A stored document failed to parse — reload ONCE in case this build is stale.
 *
 * WHEN THIS IS THE RIGHT ANSWER, and why it is not a guess: a document reaching
 * this app was validated when it was saved AND again when it was published (the
 * importer validates too). So "the schema rejects it" overwhelmingly means the
 * SCHEMA is old, not that the document is bad — and the schema is old exactly
 * when index.html came from the precache after a deploy that added a block type.
 * One reload adopts the new build, because the worker has already installed it
 * by then (autoUpdate + skipWaiting + clientsClaim).
 *
 * WHEN IT IS NOT, and why that stays safe: if the document really is malformed,
 * the reload happens once, the second parse fails the same way, the guard is
 * set, and the caller shows its error — now with the failing field's path.
 * The cost of being wrong is one page load; the cost of NOT doing it is a
 * teacher being told their content is corrupt when it is not.
 *
 * @returns true when a reload was triggered (the caller should render nothing
 *          further), false when the guard has already been spent.
 */
export function reloadOnceForStaleBuild(
  options: StaleBuildReloadOptions = {},
): boolean {
  const store = safeSession();
  if (store?.getItem(STALE_DOC_GUARD_KEY)) return false;
  // NO SESSION STORAGE → DO NOTHING, and note that this DIVERGES from the
  // chunk recovery above, which reloads anyway. The divergence is the point:
  // a preloadError fires when a student opens something lazy, so an unguarded
  // reload there costs one extra load. This trigger is a parse failure during
  // PAGE LOAD, so without a guard every load would reload — an infinite loop,
  // and the teacher could never reach the error message either. Refusing leaves
  // them with a real error they can act on.
  if (!store) return false;
  store.setItem(STALE_DOC_GUARD_KEY, '1');
  (options.reload ?? (() => window.location.reload()))();
  return true;
}

/** Clear the stale-build guard once a document has parsed. Called on a healthy
 * load so a LATER deploy gets its own single retry, exactly as the chunk
 * recovery clears its own guard on `load`. */
export function clearStaleBuildGuard(): void {
  safeSession()?.removeItem(STALE_DOC_GUARD_KEY);
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

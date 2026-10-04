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

// -----------------------------------------------------------------------------
// 4. A NEW BUILD ARRIVING UNDER AN OPEN TAB (stale-shell recovery, 2026-10-04)
// -----------------------------------------------------------------------------
// Jobs 2 and 3 above recover when something FAILS. The gap they left: a tab
// held open across a deploy fails at nothing. The worker only looked for a new
// version when the page loaded, and it answers the old hashed chunks from its
// own cache — so the old build kept running, self-consistent and silent. Found
// live: an editor tab opened before a deploy ran the previous importer and
// turned a valid fence into plain text.
//
// Two halves:
//   * LOOK for a new version while the tab is open: every 15 minutes, and each
//     time the tab becomes visible again.
//   * When one arrives, NEVER reload under someone who has started working
//     (author ruling, 2026-10-04: an automatic reload "loses all work no
//     matter what" from where the user sits). Show a notice with a Refresh
//     button and let them choose the moment. The one automatic reload left is
//     when the update lands before the user has touched the page at all — the
//     first seconds of a visit right after a deploy, where there is no work to
//     lose and the alternative is greeting every visitor with a notice.
// -----------------------------------------------------------------------------

/** How often an open tab asks whether a newer build exists. */
export const UPDATE_CHECK_INTERVAL_MS = 15 * 60 * 1000;

const UPDATE_READY_EVENT = 'activity:update-ready';
let updateReady = false;

/** True once a newer build has taken over and this page is still the old one. */
export function isUpdateReady(): boolean {
  return updateReady;
}

/** Subscribe to "a newer build is ready" (the notice bar's source). */
export function onUpdateReady(listener: () => void): () => void {
  window.addEventListener(UPDATE_READY_EVENT, listener);
  return () => window.removeEventListener(UPDATE_READY_EVENT, listener);
}

/** Test seam: forget a previous announcement. */
export function resetUpdateReadyForTests(): void {
  updateReady = false;
}

export interface UpdateArrivalOptions {
  /** Has the user pressed a key or pointer on this page yet? */
  interacted: () => boolean;
  reload?: () => void;
}

/**
 * A newer build has taken control of this (old) page. Reload only when the
 * user has not started doing anything; otherwise announce it and wait for
 * them. Returns what it did, for the tests.
 */
export function handleUpdateArrival(options: UpdateArrivalOptions): 'reloaded' | 'announced' {
  if (!options.interacted()) {
    (options.reload ?? (() => window.location.reload()))();
    return 'reloaded';
  }
  updateReady = true;
  window.dispatchEvent(new Event(UPDATE_READY_EVENT));
  return 'announced';
}

/** Watch for the first sign that a person is using this page. */
export function trackInteraction(): { interacted: () => boolean; stop: () => void } {
  let seen = false;
  const mark = () => {
    seen = true;
  };
  const EVENTS = ['pointerdown', 'keydown'] as const;
  for (const e of EVENTS) window.addEventListener(e, mark, { capture: true, passive: true });
  return {
    interacted: () => seen,
    stop: () => {
      for (const e of EVENTS) window.removeEventListener(e, mark, { capture: true });
    },
  };
}

/**
 * Ask for a newer worker on a timer and whenever the tab becomes visible.
 * `update()` is cheap (one conditional request for sw.js) and its failure —
 * offline, a blocked request — is not worth surfacing: the next tick retries.
 */
export function scheduleUpdateChecks(
  registration: Pick<ServiceWorkerRegistration, 'update'>,
  intervalMs: number = UPDATE_CHECK_INTERVAL_MS,
): { stop: () => void } {
  const check = () => {
    void Promise.resolve()
      .then(() => registration.update())
      .catch(() => {});
  };
  const onVisible = () => {
    if (document.visibilityState === 'visible') check();
  };
  const timer = window.setInterval(check, intervalMs);
  document.addEventListener('visibilitychange', onVisible);
  return {
    stop: () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    },
  };
}

export async function registerServiceWorker(): Promise<void> {
  // Dev serves modules unbundled and the generated worker does not exist, so
  // registering there would be registering something else entirely.
  if (!import.meta.env.PROD) return;
  try {
    const { registerSW } = await import('virtual:pwa-register');
    const { interacted } = trackInteraction();
    registerSW({
      immediate: true,
      // Without this hook the plugin reloads the page the instant a new
      // worker activates — under whatever the user was doing.
      onNeedReload: () => {
        handleUpdateArrival({ interacted });
      },
      onRegisteredSW: (_url, registration) => {
        if (registration) scheduleUpdateChecks(registration);
      },
    });
  } catch {
    // No worker support, or a blocked registration. Everything on this page
    // works online without it; offline reopen is the only thing lost.
  }
}

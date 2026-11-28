// =============================================================================
// lazy/retryableChunk.ts — a lazy chunk that can be fetched again after a failure
// -----------------------------------------------------------------------------
// THE TRAP (measured 2026-11-28 against the production build). Chromium AND
// WebKit remember a failed `import()` for the life of the page: once the
// request for a chunk has failed, a second `import()` of the same URL rejects
// at once and sends nothing. The same file under another URL loads. So "call
// the import again" — what the maths retry did from 2026-11-26 — is inert in
// both engines our students use, and a single request dropped by school Wi-Fi
// left every equation as raw LaTeX until a reload.
//
// THE FIX: after a failure, fetch the chunk under a NEW URL, `?retry=n`.
// Static hosts ignore the query, and the service worker's CacheFirst route for
// /assets/ keys by the full URL, so a retry URL is a cache miss that goes to the
// network (and is then cached under that key) — never a refusal.
//
// WHERE THE URL COMES FROM. Not the error: WebKit's says only "Importing a
// module script failed." and names nothing, and its resource-timing list leaves
// the failed request out (both measured). The importer's own source does name
// it, because the bundler writes the hashed file into it:
//     () => __vitePreload(() => import("./katex-DkKDou_j.js"), [])
// (a module Rollup folded into a SHARED chunk is written with a `.then(n=>n.D)`
// after the import; those are refused, see specifierInSource)
// so the specifier is read from `String(importer)` (ES2019 requires a
// function's source text back exactly) and resolved against the URL of the
// module that wrote it, which the caller passes as `import.meta.url`. In dev the
// specifier is Vite's `/node_modules/.vite/deps/…` path, which works the same.
// Where no specifier can be read (the test runner rewrites imports), the error's
// URL is used if it has one (Chromium's does), and failing that the importer is
// simply called again — the old behaviour, no worse than before.
//
// WHAT A NEW URL CANNOT FIX: a chunk whose own STATIC dependency failed. The
// retried file imports that dependency by its original URL, which the browser
// has already given up on. KaTeX's chunk has no dependencies; graph-kit's do.
// The tries are bounded either way.
//
// TWO COPIES OF A MODULE? The copy that failed never evaluated, so the retry's
// copy is the only one that ran. A later import of the ORIGINAL url (another
// chunk that imports it statically) fails in that page rather than making a
// second instance — the teacher editor's chunks do this with KaTeX, which is a
// stale-chunk failure the app's recovery already handles.
//
// THE CLAIM. A failure this module will retry by itself must not ALSO send the
// app's stale-chunk recovery into a reload (app/src/lib/swRegistration.ts:
// Vite raises `vite:preloadError` for every failed lazy import). A caller that
// owns a retry schedule marks the error with `claimChunkFailure`; the recovery
// decides one task later, after the rejection has reached its caller, and
// leaves a claimed error alone. When the schedule gives up it calls
// `reportChunkGaveUp`, which hands the error back to the recovery — so a chunk
// that is truly gone after a deploy still ends in the Refresh notice.
// =============================================================================

/** Marks an error whose chunk the caller will fetch again by itself. A
 * `Symbol.for` key so the app's recovery reads the same mark without a shared
 * module instance. */
export const CHUNK_FAILURE_CLAIMED: unique symbol = Symbol.for(
  'activity:chunk-failure-claimed',
) as never;

type Claimable = { [CHUNK_FAILURE_CLAIMED]?: boolean };
const claimable = (error: unknown): error is Claimable =>
  error !== null && typeof error === 'object';

/** Say "I will retry this one myself" (see THE CLAIM above). */
export function claimChunkFailure(error: unknown): void {
  if (claimable(error)) error[CHUNK_FAILURE_CLAIMED] = true;
}

/** Has a caller promised to retry this failure itself? */
export function isChunkFailureClaimed(error: unknown): boolean {
  return claimable(error) && error[CHUNK_FAILURE_CLAIMED] === true;
}

/**
 * The retry schedule has run out: hand the failure to the app's stale-chunk
 * recovery, as if Vite had raised it unclaimed. The recovery then shows the
 * Refresh notice (it never reloads a page in use; by the time a schedule has
 * run out the page is past its fresh-load window).
 */
export function reportChunkGaveUp(error: unknown): void {
  if (claimable(error)) delete error[CHUNK_FAILURE_CLAIMED];
  const event = new Event('vite:preloadError', { cancelable: true }) as Event & {
    payload?: unknown;
  };
  event.payload = error;
  window.dispatchEvent(event);
}

/** The one module specifier an importer's source names, or null. Only a path
 * or URL counts: a bare `'katex'` (the test runner's rewrite) is not one.
 *
 * And only when NOTHING is chained after the import. A widget that Rollup
 * folded into a shared chunk is written as
 *     import("./graph-question-….js").then(n=>n.D)
 * — the chunk's namespace is not the module's, `.D` is. A native import of
 * that URL would hand back the wrong object (found in review, 2026-11-28), so
 * such an importer gets no URL retry: it is called again, which is no worse
 * than before. */
export function specifierInSource(source: string): string | null {
  const found = [...source.matchAll(/\bimport\((["'`])([^"'`]+)\1\)(\.)?/g)];
  const match = found.length === 1 ? found[0] : undefined;
  const spec = match && !match[3] ? (match[2] ?? '') : '';
  return /^(\.{0,2}\/|https?:)/.test(spec) ? spec : null;
}

/** The asset URL a failed load's message names (Chromium's import error, and
 * Vite's own "Unable to preload CSS for …" in every browser), or null. */
export function urlInError(error: unknown): string | null {
  return /(https?:\/\/|\/)[^\s'"]+\.(m?js|css)\b/.exec(String((error as Error | null)?.message ?? error))?.[0] ?? null;
}

/** The same file under a URL the browser has not seen fail: `?retry=n`. */
export function retryUrl(url: string, n: number, base?: string): string {
  const resolved = new URL(url, base ?? document.baseURI);
  resolved.searchParams.set('retry', String(n));
  return resolved.href;
}

/**
 * The state machine both wrappers share: call `first` until it has failed,
 * then `again(url?retry=n)`. A success is kept; concurrent calls share one
 * try. `base` (when given) lets the URL come from `first`'s own source;
 * otherwise, and as a fallback, it comes from the error. With no URL at all,
 * `first` is simply called again.
 */
function retryable<T>(
  first: () => Promise<T>,
  again: (url: string) => Promise<T>,
  base?: string,
): () => Promise<T> {
  const spec = base === undefined ? null : specifierInSource(String(first));
  let done: Promise<T> | undefined;
  let inFlight: Promise<T> | undefined;
  let url: string | null = null;
  let failures = 0;
  return () =>
    done ??
    (inFlight ??= (url && failures ? again(retryUrl(url, failures, base)) : first()).then(
      (value) => (done = Promise.resolve(value)),
      (error: unknown) => {
        failures += 1;
        url ??= spec !== null ? new URL(spec, base).href : urlInError(error);
        inFlight = undefined;
        throw error;
      },
    ));
}

export interface RetryableModuleOptions {
  /** How a retry URL is imported. Injected in tests; a native import in the
   * browser (Vite leaves an ignored, non-literal import alone). */
  importUrl?: (url: string) => Promise<unknown>;
}

/**
 * Wrap a lazy `import()` so that a call AFTER a failure fetches the chunk under
 * a new URL. This adds no schedule of its own: whoever calls it again decides
 * when.
 *
 * @param importer the bundler-visible `() => import('…')` — keep it a literal
 *        import, so the chunk boundary and its specifier stay where the bundler
 *        and this module can see them.
 * @param base `import.meta.url` of the module that wrote `importer`.
 */
export function retryableModule<T>(
  importer: () => Promise<T>,
  base: string,
  options: RetryableModuleOptions = {},
): () => Promise<T> {
  const importUrl = options.importUrl ?? ((url: string) => import(/* @vite-ignore */ url));
  return retryable(importer, importUrl as (url: string) => Promise<T>, base);
}

export interface RetryableStylesheetOptions {
  /** Attach a stylesheet and settle when it loads or fails. Injected in tests. */
  attach?: (url: string) => Promise<void>;
}

function attachStylesheet(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.onload = () => resolve();
    link.onerror = () => {
      link.remove();
      reject(new Error(`Unable to load stylesheet ${url}`));
    };
    document.head.appendChild(link);
  });
}

/**
 * The stylesheet half of a lazy chunk (`import('x.css')`). Vite loads it with a
 * `<link>` and, on a later call, skips any `<link>` already carrying that href
 * — including the one that FAILED — so its own retry "succeeds" with no styles
 * (KaTeX unstyled draws every equation twice). After a failure this attaches a
 * fresh `<link>` under `?retry=n` instead. The URL comes from Vite's error
 * message, which names it in every browser.
 */
export function retryableStylesheet(
  importer: () => Promise<unknown>,
  options: RetryableStylesheetOptions = {},
): () => Promise<unknown> {
  return retryable(importer, options.attach ?? attachStylesheet);
}

/**
 * Try `load` now and after each delay, sharing one schedule between callers.
 * Every failure is CLAIMED, so the app's recovery leaves it alone while the
 * schedule runs; the last one is handed back through `reportChunkGaveUp`.
 * Bounded by the delays: `delays.length + 1` tries, then it stops. A schedule
 * that ran out is forgotten, so a later caller (a component mounted
 * afterwards) starts a fresh one rather than inheriting a failure.
 */
export function withRetrySchedule<T>(
  load: () => Promise<T>,
  delays: () => readonly number[],
): () => Promise<T> {
  let running: Promise<T> | undefined;
  const run = async (schedule: readonly number[]): Promise<T> => {
    for (let i = 0; ; i += 1) {
      try {
        return await load();
      } catch (error) {
        claimChunkFailure(error);
        if (i >= schedule.length) {
          running = undefined;
          reportChunkGaveUp(error);
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, schedule[i]));
      }
    }
  };
  return () => (running ??= run(delays()));
}

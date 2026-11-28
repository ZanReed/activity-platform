// =============================================================================
// inline/math.ts — the lazy KaTeX seam (S3 ruling D14)
// -----------------------------------------------------------------------------
// Math is core content for this product, so the viewer renders it with the
// SAME engine the published pages use (KaTeX) — visual and print parity for
// free, and the T8 print-parity gate has a chance of passing. But KaTeX is
// ~70 KiB gz against a ~150 KiB shell cap (P1A), and most worksheets in a
// given class period may carry no math at all, so it is a LAZY chunk: the
// dynamic import below is the chunk boundary, taken the first time a
// math-bearing block renders and never on a page without one.
//
// Options are copied deliberately from packages/renderer/src/math.ts —
// throwOnError:false, strict:'warn', trust:false, the same errorColor — so a
// given latex string renders identically on an old published page and in the
// viewer. Diverging here would show up as a print-parity failure much later,
// with no obvious cause. When the renderer retires, this file inherits the
// comment about WHY these options are what they are: a teacher's
// half-finished equation must render as a visible error, never crash the
// worksheet, and never be allowed to inject HTML.
//
// The module keeps the loaded engine in a memo so components can render
// synchronously after the first load (no flash on the second equation), and
// exposes an injection point for tests and the dev harness.
// =============================================================================

export interface MathRenderer {
  (latex: string, displayMode: boolean): string;
}

import { MARKS, markOnce } from '../perf/marks.js';
import {
  claimChunkFailure,
  retryableModule,
  retryableStylesheet,
  withRetrySchedule,
} from '../lazy/retryableChunk.js';

let engine: MathRenderer | null = null;

/** The engine, if it is already resident — lets components render on the
 * first paint once any math has loaded. */
export function residentMathRenderer(): MathRenderer | null {
  return engine;
}

/** Replace the engine (dev harness, tests). Pass null to restore lazy load. */
export function setMathRenderer(renderer: MathRenderer | null): void {
  engine = renderer;
  scheduled = withRetrySchedule(loadOnce, () => retryDelays);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// The two halves of the chunk, each fetched again under a new URL after a
// failure (lazy/retryableChunk.ts: Chromium and WebKit both refuse to re-fetch
// a URL whose import failed, so asking again for the same one does nothing).
//
// The stylesheet rides the same lazy boundary as the engine. Without it
// KaTeX's .katex-mathml copy is not hidden and its .katex-html copy is
// unstyled, so a browser with native MathML (Firefox, Chrome 109+) draws
// a real fraction followed by the loose digits "15⁄6 6 15". The editor
// imports this CSS in its own NodeViews; the student surface never loads
// the editor, so it must import it here.
const loadKatexModule = retryableModule(() => import('katex'), import.meta.url);
const loadKatexStyles = retryableStylesheet(() => import('katex/dist/katex.min.css'));

/** How long to wait before each further try at the math chunk. Three tries
 * after the first, then stop: the LaTeX fallback is readable, and a network
 * that has been down for 20 seconds is not one to keep hammering. */
export const MATH_RETRY_DELAYS_MS = [2000, 5000, 15000] as const;

let retryDelays: readonly number[] = MATH_RETRY_DELAYS_MS;

/** Test seam: shorter waits between tries. Pass null to restore the real ones. */
export function setMathRetryDelays(delays: readonly number[] | null): void {
  retryDelays = delays ?? MATH_RETRY_DELAYS_MS;
}

async function loadOnce(): Promise<MathRenderer> {
  if (engine) return engine;
  // Each half claims its OWN failure. When the network drops, both fail and
  // Vite raises an event for each; Promise.all passes only the first to the
  // schedule, so the second would reach the app's recovery unclaimed and
  // reload the page (found in review, 2026-11-28).
  const claimed = <T>(half: Promise<T>): Promise<T> =>
    half.catch((error: unknown) => {
      claimChunkFailure(error);
      throw error;
    });
  const [mod] = await Promise.all([claimed(loadKatexModule()), claimed(loadKatexStyles())]);
  if (engine) return engine;
  const katex = (mod as { default?: unknown }).default ?? mod;
  const renderer: MathRenderer = (latex, displayMode) => {
    try {
      return (katex as {
        renderToString: (tex: string, opts: Record<string, unknown>) => string;
      }).renderToString(latex, {
        displayMode,
        throwOnError: false,
        errorColor: '#cc0000',
        strict: 'warn',
        trust: false,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Math error';
      return `<span class="math-error">Math error: ${escapeHtml(message)}</span>`;
    }
  };
  engine = renderer;
  // S8: the moment the KaTeX chunk is actually usable. This is the number
  // that decides T7 (keep math lazy, load it eagerly on math-bearing pages,
  // or preload it the moment the served document is known to contain math).
  // Before this instant a student sees the readable-LaTeX fallback, and a
  // browser-menu Ctrl+P in that window prints the fallback (residual S5-2) —
  // so the length of this window IS the open question, and now it is
  // measured rather than argued about.
  markOnce(MARKS.mathRendered);
  return renderer;
}

let scheduled = withRetrySchedule(loadOnce, () => retryDelays);

/**
 * Load KaTeX and return the renderer. The dynamic import IS the P1A chunk
 * boundary.
 *
 * ONE schedule for the whole page: the first call starts it, later calls join
 * it. A failed try is tried again after each of MATH_RETRY_DELAYS_MS, under a
 * new URL, and only the half that failed is fetched again. While it runs the
 * failures are claimed, so the app's stale-chunk recovery does not reload the
 * page over them; after the last try the failure is handed back to it (the
 * Refresh notice) and this rejects. A call after that starts a new schedule.
 * (Until 2026-11-28 each math component ran its own retries, all of them
 * asking Chromium for a URL it had already given up on.)
 */
export function loadMathRenderer(): Promise<MathRenderer> {
  if (engine) return Promise.resolve(engine);
  return scheduled();
}

/**
 * Call `onReady` with the renderer once it has loaded. What the math
 * components use in their effects: it never rejects (a failed load leaves the
 * readable LaTeX), and the retrying is loadMathRenderer's, shared by every
 * component on the page.
 *
 * @returns a cancel function for the effect's cleanup.
 */
export function whenMathReady(onReady: (render: MathRenderer) => void): () => void {
  let cancelled = false;
  loadMathRenderer().then(
    (render) => {
      if (!cancelled) onReady(render);
    },
    () => {
      // Given up: the LaTeX stays, readable. The app has the failure.
    },
  );
  return () => {
    cancelled = true;
  };
}

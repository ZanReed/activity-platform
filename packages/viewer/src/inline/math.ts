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

let engine: MathRenderer | null = null;
let loading: Promise<MathRenderer> | null = null;

/** The engine, if it is already resident — lets components render on the
 * first paint once any math has loaded. */
export function residentMathRenderer(): MathRenderer | null {
  return engine;
}

/** Replace the engine (dev harness, tests). Pass null to restore lazy load. */
export function setMathRenderer(renderer: MathRenderer | null): void {
  engine = renderer;
  loading = null;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Load KaTeX (once) and return the renderer. The dynamic import IS the
 * P1A chunk boundary. */
export async function loadMathRenderer(): Promise<MathRenderer> {
  if (engine) return engine;
  loading ??= import('katex').then((mod) => {
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
    return renderer;
  });
  return loading;
}

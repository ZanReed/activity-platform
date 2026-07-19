// =============================================================================
// runtime/math-blanks.ts — eager preload of the math-equivalence grader
// -----------------------------------------------------------------------------
// Model B math blanks are graded by expression equivalence, which needs the
// math.js engine that lives only in the lazy graph-kit. We do NOT grade async:
// the runtime eager-loads the kit here (fire-and-forget) and hands the pure,
// synchronous mathEquivalent function to strategies.ts via setMathEquivalent, so
// the existing sync re-score path (both check and submit) grades correctly once
// it's armed (docs/design/math-blanks.md A1/A2).
//
// This is a lazy-kit feature, so like calculator-summon / graph-integration it
// does its own targeted DOM read for the kit URL rather than routing through
// init.ts. If the import fails (offline, R2 blip) a math blank stays
// ungraded-but-submittable — this never throws.
// =============================================================================

import { setMathEquivalent, type MathEquivalentFn } from './strategies.js';

interface MathKitModule {
  mathEquivalent: MathEquivalentFn;
}

/**
 * Arm the sync mathEquivalent reference if the page has any 'math' answer blank.
 * The kit URL rides data-blank-kit-src on a math blank's block; a page that also
 * has graphs/calculator exposes the SAME kit under their attrs, so fall back to
 * those (one kit per page). No-op when there's no math blank or no kit URL.
 */
export function preloadMathBlanks(): void {
  if (!document.querySelector('.blank[data-blank-strategy="math"]')) return;
  const src =
    document
      .querySelector('[data-blank-kit-src]')
      ?.getAttribute('data-blank-kit-src') ||
    document
      .querySelector('[data-graph-kit-src]')
      ?.getAttribute('data-graph-kit-src') ||
    document
      .querySelector('[data-calculator-kit-src]')
      ?.getAttribute('data-calculator-kit-src');
  if (!src) return; // no kit URL (dev-without-R2 / print) — stays ungraded (A2)

  import(/* @vite-ignore */ src)
    .then((mod: MathKitModule) => {
      if (typeof mod.mathEquivalent === 'function') {
        setMathEquivalent(mod.mathEquivalent);
      }
    })
    .catch((err) => {
      console.error('[activity-runtime] math kit failed to load', err);
    });
}

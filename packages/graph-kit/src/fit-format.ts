// =============================================================================
// fit-format.ts — display strings for a regression fit (Stage 3)
// -----------------------------------------------------------------------------
// Pure, unit-tested formatting kept out of the calculator shell: a Fit in,
// the equation and r² lines a student reads (and the aria-live region
// announces) out. Uses U+2212 minus and unicode superscripts to match the
// keypad's typography.
// =============================================================================

import type { Fit } from './regression.js';

const MINUS = '−';

// 6 significant digits, trailing zeros dropped — precise enough to check
// against a TI-84's readout without wrapping the panel with 12-digit noise.
export function formatCoefficient(n: number): string {
  const s = String(Number.parseFloat(n.toPrecision(6)));
  return s.startsWith('-') ? MINUS + s.slice(1) : s;
}

// "+ 3.2" / "− 3.2" continuation terms, so equations read like a textbook
// (y = 2x − 1.5, never y = 2x + -1.5).
function signed(n: number, suffix = ''): string {
  const sign = n < 0 ? MINUS : '+';
  return ` ${sign} ${formatCoefficient(Math.abs(n))}${suffix}`;
}

export function equationText(fit: Fit): string {
  switch (fit.model) {
    case 'linear':
      return `y = ${formatCoefficient(fit.a)}x${signed(fit.b)}`;
    case 'quadratic':
      return `y = ${formatCoefficient(fit.a)}x²${signed(fit.b, 'x')}${signed(fit.c)}`;
    case 'exponential':
      return `y = ${formatCoefficient(fit.a)} · ${formatCoefficient(fit.b)}ˣ`;
    case 'logarithmic':
      return `y = ${formatCoefficient(fit.a)}${signed(fit.b, ' ln(x)')}`;
  }
}

// TI labels the quadratic goodness-of-fit R² and the linear/exponential ones
// r² — students check the panel against that readout, so mirror it.
export function r2Text(fit: Fit): string {
  const label = fit.model === 'quadratic' ? 'R²' : 'r²';
  return `${label} = ${String(Number.parseFloat(fit.r2.toPrecision(4)))}`;
}

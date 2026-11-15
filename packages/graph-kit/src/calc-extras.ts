// =============================================================================
// calc-extras.ts — the scientific calculator's history and fraction view
// (2026-11-15). Pure, so it is tested without MathLive (calculator.ts mounts
// the UI around it).
// =============================================================================

/** A finished calculation: what was typed (LaTeX) and its value. */
export interface CalcHistoryEntry {
  latex: string;
  value: number;
}

export const CALC_HISTORY_MAX = 8;

/** Newest first, at most CALC_HISTORY_MAX, and a repeat of the newest is not
 *  stored twice (pressing = again on the same line). */
export function pushHistory(list: readonly CalcHistoryEntry[], entry: CalcHistoryEntry): CalcHistoryEntry[] {
  const top = list[0];
  if (top && top.latex === entry.latex && top.value === entry.value) return [...list];
  return [entry, ...list].slice(0, CALC_HISTORY_MAX);
}

/**
 * The value as a fraction "p/q" in lowest terms when it is one with a
 * denominator up to 1000 (to within float noise), else null: an integer
 * needs no fraction, and π has no honest one. Continued fractions, so 0.1 +
 * 0.2 still reads 3/10.
 */
export function fractionText(n: number): string | null {
  if (!Number.isFinite(n) || Number.isInteger(n)) return null;
  const sign = n < 0 ? '-' : '';
  const x = Math.abs(n);
  let [h0, h1, k0, k1] = [0, 1, 1, 0];
  let b = x;
  for (let i = 0; i < 32; i++) {
    const a = Math.floor(b);
    [h0, h1] = [h1, a * h1 + h0];
    [k0, k1] = [k1, a * k1 + k0];
    if (k1 > 1000) return null;
    if (Math.abs(x - h1 / k1) < 1e-9 * Math.max(1, x)) return `${sign}${h1}/${k1}`;
    const frac = b - a;
    if (frac < 1e-12) break;
    b = 1 / frac;
  }
  return null;
}

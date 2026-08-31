// =============================================================================
// regression.test.ts — the least-squares engine (Stage 3)
// -----------------------------------------------------------------------------
// Exact fits pin the closed forms; the noisy datasets are hand-computed from
// the normal equations (worked in the session notes, not copied from the
// implementation); conventions (exponential y = a·bˣ with r² on the log fit)
// are pinned against what a TI-84 reports for the same data.
// =============================================================================

import { describe, it, expect } from 'vitest';
import {
  fitLinear,
  fitQuadratic,
  fitCubic,
  fitQuartic,
  fitExponential,
  fitModel,
  type DataPoint,
} from '../src/regression.js';

const pts = (...pairs: [number, number][]): DataPoint[] =>
  pairs.map(([x, y]) => ({ x, y }));

describe('fitLinear', () => {
  it('recovers an exact line with r² = 1', () => {
    const r = fitLinear(pts([1, 2], [2, 4], [3, 6]));
    if (!r.ok) throw new Error(r.error);
    expect(r.fit).toMatchObject({ model: 'linear' });
    if (r.fit.model !== 'linear') throw new Error('wrong model');
    expect(r.fit.a).toBeCloseTo(2, 10);
    expect(r.fit.b).toBeCloseTo(0, 10);
    expect(r.fit.r2).toBeCloseTo(1, 10);
    expect(r.predict(10)).toBeCloseTo(20, 10);
  });

  it('fits noisy data (hand-computed normal equations)', () => {
    // (1,1),(2,3),(3,2),(4,5): a = 22/20 = 1.1, b = 0, r² = 1 − 2.7/8.75
    const r = fitLinear(pts([1, 1], [2, 3], [3, 2], [4, 5]));
    if (!r.ok) throw new Error(r.error);
    if (r.fit.model !== 'linear') throw new Error('wrong model');
    expect(r.fit.a).toBeCloseTo(1.1, 10);
    expect(r.fit.b).toBeCloseTo(0, 10);
    expect(r.fit.r2).toBeCloseTo(1 - 2.7 / 8.75, 10);
  });

  it('reports r² = 1 for constant y perfectly fit', () => {
    const r = fitLinear(pts([1, 5], [2, 5], [3, 5]));
    if (!r.ok) throw new Error(r.error);
    if (r.fit.model !== 'linear') throw new Error('wrong model');
    expect(r.fit.a).toBeCloseTo(0, 10);
    expect(r.fit.b).toBeCloseTo(5, 10);
    expect(r.fit.r2).toBe(1);
  });

  it('rejects fewer than 2 points', () => {
    expect(fitLinear(pts([1, 2]))).toMatchObject({ ok: false });
  });

  it('rejects all-identical x (vertical line)', () => {
    const r = fitLinear(pts([2, 1], [2, 3], [2, 5]));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/different x/i);
  });
});

describe('fitQuadratic', () => {
  it('recovers an exact parabola with r² = 1', () => {
    // y = x² + x + 1
    const r = fitQuadratic(pts([0, 1], [1, 3], [2, 7], [3, 13]));
    if (!r.ok) throw new Error(r.error);
    if (r.fit.model !== 'quadratic') throw new Error('wrong model');
    expect(r.fit.a).toBeCloseTo(1, 8);
    expect(r.fit.b).toBeCloseTo(1, 8);
    expect(r.fit.c).toBeCloseTo(1, 8);
    expect(r.fit.r2).toBeCloseTo(1, 10);
    expect(r.predict(5)).toBeCloseTo(31, 8);
  });

  it('recovers y = x² through the origin (negative x included)', () => {
    const r = fitQuadratic(pts([-2, 4], [-1, 1], [0, 0], [1, 1], [2, 4]));
    if (!r.ok) throw new Error(r.error);
    if (r.fit.model !== 'quadratic') throw new Error('wrong model');
    expect(r.fit.a).toBeCloseTo(1, 8);
    expect(r.fit.b).toBeCloseTo(0, 8);
    expect(r.fit.c).toBeCloseTo(0, 8);
  });

  it('rejects fewer than 3 points', () => {
    expect(fitQuadratic(pts([1, 1], [2, 4]))).toMatchObject({ ok: false });
  });

  it('rejects only 2 distinct x-values (singular normal equations)', () => {
    const r = fitQuadratic(pts([1, 1], [1, 2], [3, 4], [3, 5]));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/different x/i);
  });
});

describe('fitCubic', () => {
  it('recovers an exact cubic y = x³ − 3x with R² = 1', () => {
    const r = fitCubic(pts([-2, -2], [-1, 2], [0, 0], [1, -2], [2, 2]));
    if (!r.ok) throw new Error(r.error);
    if (r.fit.model !== 'cubic') throw new Error('wrong model');
    expect(r.fit.a).toBeCloseTo(1, 8);
    expect(r.fit.b).toBeCloseTo(0, 8);
    expect(r.fit.c).toBeCloseTo(-3, 8);
    expect(r.fit.d).toBeCloseTo(0, 8);
    expect(r.fit.r2).toBeCloseTo(1, 10);
    expect(r.predict(3)).toBeCloseTo(18, 8);
  });

  it('interpolates exactly through 4 points (the handle count)', () => {
    // y = 2x³ − x + 5 at x = −1, 0, 1, 2.
    const r = fitCubic(pts([-1, 4], [0, 5], [1, 6], [2, 19]));
    if (!r.ok) throw new Error(r.error);
    if (r.fit.model !== 'cubic') throw new Error('wrong model');
    expect(r.fit.a).toBeCloseTo(2, 8);
    expect(r.fit.b).toBeCloseTo(0, 8);
    expect(r.fit.c).toBeCloseTo(-1, 8);
    expect(r.fit.d).toBeCloseTo(5, 8);
  });

  it('fits noisy odd data (hand-computed normal equations)', () => {
    // Odd data on symmetric x ∈ {±1, ±2, ±3} ∪ {0}: b = d = 0 by symmetry, and
    // the 2×2 odd system (S6·a + S4·c = Σx³y; S4·a + S2·c = Σxy) with
    // S2 = 28, S4 = 196, S6 = 1588, Σxy = 180, Σx³y = 1464 solves to
    // a = 5712/6048 = 17/18, c = −1104/6048 = −23/126 (worked by hand).
    const r = fitCubic(
      pts([-3, -25], [-2, -7], [-1, -1], [0, 0], [1, 1], [2, 7], [3, 25]),
    );
    if (!r.ok) throw new Error(r.error);
    if (r.fit.model !== 'cubic') throw new Error('wrong model');
    expect(r.fit.a).toBeCloseTo(17 / 18, 10);
    expect(r.fit.b).toBeCloseTo(0, 10);
    expect(r.fit.c).toBeCloseTo(-23 / 126, 10);
    expect(r.fit.d).toBeCloseTo(0, 10);
    expect(r.fit.r2).toBeGreaterThan(0.99);
    expect(r.fit.r2).toBeLessThan(1);
  });

  it('reports a ≈ 0 with R² = 1 on exactly quadratic data', () => {
    const r = fitCubic(pts([-2, 4], [-1, 1], [0, 0], [1, 1], [2, 4]));
    if (!r.ok) throw new Error(r.error);
    if (r.fit.model !== 'cubic') throw new Error('wrong model');
    expect(r.fit.a).toBeCloseTo(0, 8);
    expect(r.fit.b).toBeCloseTo(1, 8);
    expect(r.fit.r2).toBeCloseTo(1, 10);
  });

  it('rejects fewer than 4 points', () => {
    const r = fitCubic(pts([0, 0], [1, 1], [2, 8]));
    expect(r.ok).toBe(false);
  });

  it('rejects only 3 distinct x-values (singular normal equations)', () => {
    const r = fitCubic(pts([0, 0], [1, 1], [2, 8], [2, 8.5]));
    expect(r.ok).toBe(false);
    if (r.ok) throw new Error('expected failure');
    expect(r.error).toMatch(/4 different x-values/);
  });
});

describe('fitQuartic', () => {
  it('recovers an exact quartic y = x⁴ − 5x² + 4 with R² = 1', () => {
    const r = fitQuartic(
      pts([-2, 0], [-1, 0], [0, 4], [1, 0], [2, 0], [3, 40]),
    );
    if (!r.ok) throw new Error(r.error);
    if (r.fit.model !== 'quartic') throw new Error('wrong model');
    expect(r.fit.a).toBeCloseTo(1, 8);
    expect(r.fit.b).toBeCloseTo(0, 8);
    expect(r.fit.c).toBeCloseTo(-5, 8);
    expect(r.fit.d).toBeCloseTo(0, 8);
    expect(r.fit.e).toBeCloseTo(4, 8);
    expect(r.fit.r2).toBeCloseTo(1, 10);
    expect(r.predict(-3)).toBeCloseTo(40, 6);
  });

  it('reports a ≈ 0 with R² = 1 on exactly cubic data', () => {
    // y = x³ at 5 points — the quartic fit collapses to the cubic.
    const r = fitQuartic(pts([-2, -8], [-1, -1], [0, 0], [1, 1], [2, 8]));
    if (!r.ok) throw new Error(r.error);
    if (r.fit.model !== 'quartic') throw new Error('wrong model');
    expect(r.fit.a).toBeCloseTo(0, 8);
    expect(r.fit.b).toBeCloseTo(1, 8);
    expect(r.fit.r2).toBeCloseTo(1, 10);
  });

  it('rejects fewer than 5 points', () => {
    const r = fitQuartic(pts([0, 0], [1, 1], [2, 16], [3, 81]));
    expect(r.ok).toBe(false);
  });

  it('rejects only 4 distinct x-values (singular normal equations)', () => {
    const r = fitQuartic(pts([0, 0], [1, 1], [2, 16], [3, 81], [3, 80]));
    expect(r.ok).toBe(false);
    if (r.ok) throw new Error('expected failure');
    expect(r.error).toMatch(/5 different x-values/);
  });
});

describe('fitExponential', () => {
  it('recovers an exact y = 3·2ˣ with r² = 1', () => {
    const r = fitExponential(pts([0, 3], [1, 6], [2, 12]));
    if (!r.ok) throw new Error(r.error);
    if (r.fit.model !== 'exponential') throw new Error('wrong model');
    expect(r.fit.a).toBeCloseTo(3, 8);
    expect(r.fit.b).toBeCloseTo(2, 8);
    expect(r.fit.r2).toBeCloseTo(1, 10);
    expect(r.predict(3)).toBeCloseTo(24, 6);
  });

  it('matches the TI-84 ExpReg convention on noisy data', () => {
    // (1,4),(2,7),(3,12),(4,21) — TI-84 ExpReg: y ≈ 2.3094·1.7356ˣ,
    // r² ≈ 0.99994 reported on the log-transformed (ln y vs x) fit.
    const r = fitExponential(pts([1, 4], [2, 7], [3, 12], [4, 21]));
    if (!r.ok) throw new Error(r.error);
    if (r.fit.model !== 'exponential') throw new Error('wrong model');
    expect(r.fit.a).toBeCloseTo(2.3094, 3);
    expect(r.fit.b).toBeCloseTo(1.7356, 3);
    expect(r.fit.r2).toBeGreaterThan(0.9999);
    expect(r.fit.r2).toBeLessThan(1);
  });

  it('rejects any y ≤ 0 with a clear message (the first edge a student hits)', () => {
    const r = fitExponential(pts([0, 3], [1, 0], [2, 12]));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/above 0/);
    const neg = fitExponential(pts([0, 3], [1, -2], [2, 12]));
    expect(neg.ok).toBe(false);
  });

  it('rejects fewer than 2 points and all-identical x', () => {
    expect(fitExponential(pts([1, 2]))).toMatchObject({ ok: false });
    expect(fitExponential(pts([1, 2], [1, 4]))).toMatchObject({ ok: false });
  });
});

describe('fitModel', () => {
  it('dispatches to each engine by name', () => {
    const data = pts([0, 1], [1, 2], [2, 5], [3, 10]);
    expect(fitModel('linear', data).ok).toBe(true);
    expect(fitModel('quadratic', data).ok).toBe(true);
    expect(fitModel('exponential', data).ok).toBe(true);
    const lin = fitModel('linear', data);
    if (lin.ok) expect(lin.fit.model).toBe('linear');
  });
});

// =============================================================================
// solve.test.ts — the shared solve-for-y core (calculator-parity batch)
// -----------------------------------------------------------------------------
// solveForY/side probes are exercised indirectly through formula.test.ts too;
// here they get direct coverage plus the pieces that are NEW with the batch:
// the brace/spaced-`for` domain forms, formatDomainClause, inDomain, and the
// board's half-plane outline geometry.
// =============================================================================

import { describe, it, expect } from 'vitest';
import {
  solveForY,
  curveSide,
  verticalSide,
  extractDomain,
  formatDomainClause,
  inDomain,
  halfPlaneOutline,
  type G,
} from '../src/solve.js';

// g for `LHS op RHS` given as y - f(x).
const gLinear: G = (x, y) => y - (2 * x + 1);
const gVertical: G = (x, _y) => x - 3;

describe('solveForY', () => {
  it('solves a y-linear equation to f(x)', () => {
    const s = solveForY(gLinear);
    if (s.kind !== 'fn') throw new Error('expected fn');
    expect(s.fn(2)).toBeCloseTo(5);
  });

  it('detects an x-only equation as a vertical line', () => {
    const s = solveForY(gVertical);
    expect(s).toEqual({ kind: 'vertical', x: 3 });
  });

  it('rejects equations nonlinear in y', () => {
    const s = solveForY((x, y) => y * y - x);
    expect(s.kind).toBe('error');
  });
});

describe('side probes', () => {
  it('y > f(x): the y-side above the boundary satisfies it', () => {
    const s = solveForY(gLinear);
    if (s.kind !== 'fn') throw new Error('expected fn');
    expect(curveSide(gLinear, s.fn, '>')).toBe('above');
    expect(curveSide(gLinear, s.fn, '<')).toBe('below');
  });

  it('rearranged sides flip correctly: 2x + 1 > y shades below', () => {
    const g: G = (x, y) => 2 * x + 1 - y;
    const s = solveForY(g);
    if (s.kind !== 'fn') throw new Error('expected fn');
    expect(curveSide(g, s.fn, '>')).toBe('below');
  });

  it('x > 3 shades right; x < 3 shades left', () => {
    expect(verticalSide(gVertical, 3, '>')).toBe('right');
    expect(verticalSide(gVertical, 3, '<')).toBe('left');
  });
});

describe('extractDomain — clause forms', () => {
  it('parses the plain for clause', () => {
    expect(extractDomain('y = 2x for x >= 0')).toEqual({
      rest: 'y = 2x',
      domain: { min: 0, minClosed: true },
    });
  });

  it('parses the spaced `f o r` a math field may serialize', () => {
    expect(extractDomain('y = 2x f o r x > 1')).toEqual({
      rest: 'y = 2x',
      domain: { min: 1, minClosed: false },
    });
  });

  it('parses the Desmos-style brace form', () => {
    expect(extractDomain('y = 2x {-2 < x <= 5}')).toEqual({
      rest: 'y = 2x',
      domain: { min: -2, minClosed: false, max: 5, maxClosed: true },
    });
  });

  it('leaves a string without a clause untouched', () => {
    expect(extractDomain('y = 2x + 1')).toEqual({ rest: 'y = 2x + 1' });
  });

  it('does not eat an unrecognized clause', () => {
    expect(extractDomain('y = 2x for banana')).toEqual({ rest: 'y = 2x for banana' });
  });
});

describe('formatDomainClause / inDomain', () => {
  it('round-trips through extractDomain', () => {
    for (const src of [' for x >= 0', ' for x < 5', ' for -2 <= x < 5']) {
      const { domain } = extractDomain(`y = x${src}`);
      expect(formatDomainClause(domain)).toBe(src);
    }
  });

  it('honors open vs closed endpoints', () => {
    const d = { min: 0, minClosed: false, max: 5, maxClosed: true };
    expect(inDomain(0, d)).toBe(false);
    expect(inDomain(0.1, d)).toBe(true);
    expect(inDomain(5, d)).toBe(true);
    expect(inDomain(5.1, d)).toBe(false);
  });

  it('treats absent bounds as unbounded', () => {
    expect(inDomain(-1e9, { max: 0 })).toBe(true);
    expect(inDomain(1, { max: 0 })).toBe(false);
  });
});

describe('halfPlaneOutline', () => {
  const box = { xMin: -10, xMax: 10, yMin: -10, yMax: 10 };

  it('shades right of a vertical boundary as a rectangle', () => {
    const { xs, ys } = halfPlaneOutline('right', box, { x: 3 });
    expect(xs).toEqual([3, 3, 10, 10, 3]);
    expect(ys).toEqual([-10, 10, 10, -10, -10]);
  });

  it('closes an above-fill against the top edge', () => {
    const { xs, ys } = halfPlaneOutline('above', box, { fn: () => 0 }, 4);
    // 5 samples + the two closing corners + the return to start.
    expect(xs.slice(-3)).toEqual([10, -10, -10]);
    expect(ys.slice(-3)).toEqual([10, 10, 0]);
    expect(ys.slice(0, 5)).toEqual([0, 0, 0, 0, 0]);
  });

  it('clamps the boundary into the window', () => {
    const { ys } = halfPlaneOutline('below', box, { fn: (x) => x * 100 }, 4);
    for (const y of ys) expect(Math.abs(y)).toBeLessThanOrEqual(10);
  });

  it('collapses NaN (out-of-domain) columns to the shaded edge', () => {
    const { ys } = halfPlaneOutline(
      'above',
      box,
      { fn: (x) => (x >= 0 ? 0 : NaN) },
      4,
    );
    // Samples at x = -10, -5 are NaN → snapped to yMax (zero-height columns).
    expect(ys[0]).toBe(10);
    expect(ys[1]).toBe(10);
    expect(ys[2]).toBe(0);
  });

  it('returns an empty outline for a non-finite vertical boundary', () => {
    expect(halfPlaneOutline('left', box, { x: NaN })).toEqual({ xs: [], ys: [] });
  });
});

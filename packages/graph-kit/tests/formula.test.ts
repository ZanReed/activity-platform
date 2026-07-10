// =============================================================================
// formula.test.ts — the freeform teacher command line (Drop 3)
// -----------------------------------------------------------------------------
// The whole point is "any format works": every rearrangement of the same line
// must classify to the same family + parameters. Numeric pipeline (compile →
// solve for y → sample → fit), so assertions use toBeCloseTo.
// =============================================================================

import { describe, it, expect } from 'vitest';
import { parseGraphFormula, parsePointList, formatModel, formatInequality } from '../src/formula.js';

function expectLinear(input: string, slope: number, intercept: number): void {
  const r = parseGraphFormula(input);
  expect(r.kind, `${input} → ${JSON.stringify(r)}`).toBe('function');
  if (r.kind === 'function' && r.model.family === 'linear') {
    expect(r.model.slope).toBeCloseTo(slope, 4);
    expect(r.model.intercept).toBeCloseTo(intercept, 4);
  } else {
    throw new Error(`${input} did not parse as linear: ${JSON.stringify(r)}`);
  }
}

describe('parseGraphFormula — linear, any format', () => {
  it('slope-intercept', () => expectLinear('y = 2x + 3', 2, 3));
  it('bare expression', () => expectLinear('2x + 3', 2, 3));
  it('standard form', () => expectLinear('2x + 3y = 6', -2 / 3, 2));
  it('point-slope', () => expectLinear('y - 5 = 2(x - 1)', 2, 3));
  it('reversed sides', () => expectLinear('2x + 3 = y', 2, 3));
  it('unicode operators', () => expectLinear('y = 2·x − 3', 2, -3));
  it('horizontal line', () => expectLinear('y = 4', 0, 4));
  it('fractional slope', () => expectLinear('y = x/2 + 1', 0.5, 1));
});

describe('parseGraphFormula — other families', () => {
  it('quadratic (bare, ^ and ² forms)', () => {
    for (const input of ['x^2 - 2x + 1', 'y = x² - 2x + 1']) {
      const r = parseGraphFormula(input);
      expect(r.kind).toBe('function');
      if (r.kind === 'function' && r.model.family === 'quadratic') {
        expect(r.model.a).toBeCloseTo(1, 4);
        expect(r.model.b).toBeCloseTo(-2, 4);
        expect(r.model.c).toBeCloseTo(1, 4);
      } else {
        throw new Error(`not quadratic: ${JSON.stringify(r)}`);
      }
    }
  });

  it('exponential y = 2*3^x', () => {
    const r = parseGraphFormula('y = 2*3^x');
    expect(r.kind).toBe('function');
    if (r.kind === 'function' && r.model.family === 'exponential') {
      expect(r.model.a).toBeCloseTo(2, 4);
      expect(r.model.b).toBeCloseTo(3, 4);
    } else {
      throw new Error(`not exponential: ${JSON.stringify(r)}`);
    }
  });

  it('logarithmic y = 1 + 2ln(x)', () => {
    const r = parseGraphFormula('y = 1 + 2ln(x)');
    expect(r.kind).toBe('function');
    if (r.kind === 'function' && r.model.family === 'logarithmic') {
      expect(r.model.a).toBeCloseTo(1, 4);
      expect(r.model.b).toBeCloseTo(2, 4);
    } else {
      throw new Error(`not logarithmic: ${JSON.stringify(r)}`);
    }
  });

  it('vertical x = 4, and solved form 2x + 4 = 10 → x = 3', () => {
    const r1 = parseGraphFormula('x = 4');
    expect(r1.kind === 'function' && r1.model.family === 'vertical' && r1.model.x === 4).toBe(true);
    const r2 = parseGraphFormula('2x + 4 = 10');
    expect(r2.kind === 'function' && r2.model.family === 'vertical' && r2.model.x === 3).toBe(true);
  });

  it('unsupported curve steers to Display', () => {
    const r = parseGraphFormula('y = sin(x)');
    expect(r.kind).toBe('error');
    if (r.kind === 'error') expect(r.message).toContain('Display');
  });

  it('garbage errors cleanly', () => {
    expect(parseGraphFormula('y = 2x +').kind).toBe('error');
    expect(parseGraphFormula('').kind).toBe('error');
  });
});

describe('parseGraphFormula — inequalities', () => {
  it('y > 2x + 1 → above, strict', () => {
    const r = parseGraphFormula('y > 2x + 1');
    expect(r.kind).toBe('inequality');
    if (r.kind === 'inequality') {
      expect(r.strict).toBe(true);
      expect(r.side).toBe('above');
      expect(r.boundary.family).toBe('linear');
    }
  });

  it('y <= -x + 4 → below, inclusive', () => {
    const r = parseGraphFormula('y <= -x + 4');
    expect(r.kind === 'inequality' && !r.strict && r.side === 'below').toBe(true);
  });

  it('reversed: 2x + 1 < y → above', () => {
    const r = parseGraphFormula('2x + 1 < y');
    expect(r.kind === 'inequality' && r.strict && r.side === 'above').toBe(true);
  });

  it('unicode ≥: y ≥ x² → above quadratic, inclusive', () => {
    const r = parseGraphFormula('y ≥ x²');
    expect(r.kind).toBe('inequality');
    if (r.kind === 'inequality') {
      expect(r.strict).toBe(false);
      expect(r.side).toBe('above');
      expect(r.boundary.family).toBe('quadratic');
    }
  });

  it('vertical: x > 3 → right of x = 3', () => {
    const r = parseGraphFormula('x > 3');
    expect(r.kind).toBe('inequality');
    if (r.kind === 'inequality') {
      expect(r.side).toBe('right');
      expect(r.boundary.family === 'vertical' && r.boundary.x).toBe(3);
    }
  });

  it('vertical: x <= -1 → left, inclusive', () => {
    const r = parseGraphFormula('x <= -1');
    expect(r.kind === 'inequality' && !r.strict && r.side === 'left').toBe(true);
  });
});

describe('parseGraphFormula — domain clauses (rays/segments foundation)', () => {
  it('y = 2x + 3 for x >= 0', () => {
    const r = parseGraphFormula('y = 2x + 3 for x >= 0');
    expect(r.kind).toBe('function');
    if (r.kind === 'function') {
      expect(r.domain).toEqual({ min: 0, minClosed: true });
      expect(r.model.family).toBe('linear');
    }
  });

  it('two-sided: y = x for -2 < x <= 5', () => {
    const r = parseGraphFormula('y = x for -2 < x <= 5');
    expect(r.kind === 'function' && r.domain).toEqual({
      min: -2, minClosed: false, max: 5, maxClosed: true,
    });
  });
});

describe('parsePointList', () => {
  it('single and multiple points', () => {
    expect(parsePointList('(2, 3)')).toEqual([[2, 3]]);
    expect(parsePointList('(2,3), (-4, 5.5)')).toEqual([[2, 3], [-4, 5.5]]);
  });
  it('rejects trailing garbage and empties', () => {
    expect(parsePointList('(2,3) oops')).toBeNull();
    expect(parsePointList('')).toBeNull();
  });
});

describe('formatModel round-trips through parseGraphFormula', () => {
  const cases = [
    { family: 'linear', slope: 2, intercept: 3, slopeTolerance: 0.1, interceptTolerance: 0.1 },
    { family: 'linear', slope: -1, intercept: 0, slopeTolerance: 0.1, interceptTolerance: 0.1 },
    { family: 'linear', slope: 0, intercept: 4, slopeTolerance: 0.1, interceptTolerance: 0.1 },
    { family: 'quadratic', a: 1, b: -2, c: 1, aTolerance: 0.1, bTolerance: 0.1, cTolerance: 0.1 },
    { family: 'exponential', a: 2, b: 3, aTolerance: 0.1, bTolerance: 0.1 },
    { family: 'logarithmic', a: 1, b: 2, aTolerance: 0.1, bTolerance: 0.1 },
    { family: 'vertical', x: 4, xTolerance: 0.1 },
  ] as const;

  for (const model of cases) {
    it(`${model.family}: ${formatModel(model)}`, () => {
      const r = parseGraphFormula(formatModel(model));
      expect(r.kind).toBe('function');
      if (r.kind === 'function') {
        expect(r.model.family).toBe(model.family);
        // Every numeric parameter must survive the round trip.
        for (const [k, v] of Object.entries(model)) {
          if (typeof v === 'number' && !k.endsWith('Tolerance')) {
            expect((r.model as Record<string, unknown>)[k]).toBeCloseTo(v, 4);
          }
        }
      }
    });
  }
});

// ---- Calculator-parity batch (2026-07-11) --------------------------------------

describe('parseGraphFormula — inequality domains', () => {
  it('carries a trailing for clause on an inequality', () => {
    const p = parseGraphFormula('y > 2x + 1 for x >= 0');
    if (p.kind !== 'inequality') throw new Error('expected inequality');
    expect(p.strict).toBe(true);
    expect(p.side).toBe('above');
    expect(p.domain).toEqual({ min: 0, minClosed: true });
  });

  it('still parses a domain-free inequality without one', () => {
    const p = parseGraphFormula('y <= x^2');
    if (p.kind !== 'inequality') throw new Error('expected inequality');
    expect(p.domain).toBeUndefined();
  });
});

describe('formatInequality — the round trip', () => {
  const roundTrip = (src: string): void => {
    const p = parseGraphFormula(src);
    if (p.kind !== 'inequality') throw new Error(`expected inequality for ${src}`);
    const text = formatInequality(p.boundary, p.side, p.strict);
    const again = parseGraphFormula(text);
    expect(again).toEqual(p);
  };

  it('round-trips linear, strict and inclusive', () => {
    roundTrip('y > 2x + 1');
    roundTrip('y <= -x + 4');
  });

  it('round-trips quadratic and vertical boundaries', () => {
    roundTrip('y < x^2 - 4');
    roundTrip('x >= 3');
  });

  it('formats rearranged input back to the canonical side', () => {
    // 2x + 1 > y means y < 2x + 1.
    const p = parseGraphFormula('2x + 1 > y');
    if (p.kind !== 'inequality') throw new Error('expected inequality');
    expect(formatInequality(p.boundary, p.side, p.strict)).toBe('y < 2x + 1');
  });

  it('formats a vertical boundary with the side operator', () => {
    const p = parseGraphFormula('x < -2');
    if (p.kind !== 'inequality') throw new Error('expected inequality');
    expect(formatInequality(p.boundary, p.side, p.strict)).toBe('x < -2');
  });
});

// =============================================================================
// evaluate.test.ts — the calculator evaluation seam (the locked-decision keystone)
// -----------------------------------------------------------------------------
// Validates the full path a student's input takes: LaTeX (what the math-field
// holds) -> AsciiMath (MathLive's own conversion) -> normalize -> math.js ->
// number. We feed REAL MathLive output via convertLatexToAsciiMath (the DOM-free
// SSR export), so these tests would catch any drift in MathLive's AsciiMath
// dialect that the normalizer doesn't handle — the "is the math.js glue leaky?"
// risk, pinned down.
// =============================================================================

import { describe, it, expect } from 'vitest';
import { convertLatexToAsciiMath } from 'mathlive/ssr';
import {
  evaluate,
  normalizeAsciiMath,
  compileFunction,
  type EvalOptions,
} from '../src/evaluate.js';

// Evaluate from LaTeX the way the widget will: math-field -> ascii -> evaluate.
function fromLatex(latex: string, opts?: EvalOptions) {
  return evaluate(convertLatexToAsciiMath(latex), opts);
}
function valueOf(latex: string, opts?: EvalOptions): number {
  const r = fromLatex(latex, opts);
  if (!r.ok) throw new Error(`expected ok, got error: ${r.error}`);
  return r.value;
}

describe('normalizeAsciiMath (lexical rewrites)', () => {
  it('rewrites the AsciiMath division operator', () => {
    expect(normalizeAsciiMath('2 -: 4')).toBe('2 / 4');
  });
  it('drops the space between a function name and its parenthesis', () => {
    expect(normalizeAsciiMath('sin (30)')).toBe('sin(30)');
  });
  it('wraps a bare function argument in parentheses', () => {
    expect(normalizeAsciiMath('sin 30')).toBe('sin(30)');
  });
  it('rewrites root(n)(x) to nthRoot(x, n)', () => {
    expect(normalizeAsciiMath('root(3)(27)')).toBe('nthRoot(27,3)');
  });
  it('rewrites inverse-trig to the a-prefixed name', () => {
    expect(normalizeAsciiMath('sin ^(-1)(1)')).toBe('asin(1)');
  });
  it('rewrites |x| to abs(x)', () => {
    expect(normalizeAsciiMath('|-3|')).toBe('abs(-3)');
  });
  it('rewrites log _b(x) to logBase(x, b)', () => {
    expect(normalizeAsciiMath('log _2(8)')).toBe('logBase(8,2)');
  });
});

describe('evaluate — arithmetic & structure (from real MathLive LaTeX)', () => {
  it('respects operator precedence', () => {
    expect(valueOf('2+3\\times4')).toBe(14);
    expect(valueOf('\\left(2+3\\right)\\times4')).toBe(20);
  });
  it('evaluates fractions', () => {
    expect(valueOf('\\frac{1}{2}+\\frac{3}{4}')).toBeCloseTo(1.25, 10);
  });
  it('evaluates the AsciiMath division operator', () => {
    expect(valueOf('10\\div4')).toBeCloseTo(2.5, 10);
  });
  it('evaluates powers', () => {
    expect(valueOf('2^{10}')).toBe(1024);
  });
  it('evaluates square root and nth root', () => {
    expect(valueOf('\\sqrt{16}')).toBe(4);
    expect(valueOf('\\sqrt[3]{27}')).toBeCloseTo(3, 10);
  });
  it('evaluates factorial and absolute value', () => {
    expect(valueOf('5!')).toBe(120);
    expect(valueOf('\\left|-3\\right|')).toBe(3);
  });
  it('knows the constants pi and e (with implicit multiplication)', () => {
    expect(valueOf('2\\pi')).toBeCloseTo(2 * Math.PI, 10);
    expect(valueOf('e^{1}')).toBeCloseTo(Math.E, 10);
  });
});

describe('evaluate — angle modes', () => {
  it('treats trig arguments as radians by default', () => {
    expect(valueOf('\\cos(0)')).toBeCloseTo(1, 10);
    expect(valueOf('\\sin(0)')).toBeCloseTo(0, 10);
  });
  it('treats trig arguments as degrees in deg mode', () => {
    const deg: EvalOptions = { angleMode: 'deg' };
    expect(valueOf('\\sin(30)', deg)).toBeCloseTo(0.5, 10);
    expect(valueOf('\\cos(60)', deg)).toBeCloseTo(0.5, 10);
    expect(valueOf('\\tan(45)', deg)).toBeCloseTo(1, 10);
  });
  it('returns inverse-trig results in the active angle unit', () => {
    expect(valueOf('\\sin^{-1}(1)')).toBeCloseTo(Math.PI / 2, 10); // rad
    expect(valueOf('\\sin^{-1}(1)', { angleMode: 'deg' })).toBeCloseTo(90, 10);
  });
});

describe('evaluate — log / exp (ln vs log10 vs base)', () => {
  it('treats ln as natural log and log as base-10', () => {
    expect(valueOf('\\ln(e)')).toBeCloseTo(1, 10);
    expect(valueOf('\\log(100)')).toBeCloseTo(2, 10);
  });
  it('evaluates an explicit log base', () => {
    expect(valueOf('\\log_{2}(8)')).toBeCloseTo(3, 10);
  });
});

describe('evaluate — restriction gates', () => {
  it('blocks trig when allowTrig is false', () => {
    const r = fromLatex('\\sin(30)', { allowTrig: false, angleMode: 'deg' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/trig/i);
  });
  it('blocks log/exp when allowLogExp is false', () => {
    const r = fromLatex('\\log(100)', { allowLogExp: false });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/log/i);
  });
  it('still allows arithmetic when functions are gated off', () => {
    expect(
      valueOf('2+2', { allowTrig: false, allowLogExp: false }),
    ).toBe(4);
  });
});

describe('compileFunction (graphing: y = f(x))', () => {
  it('compiles a polynomial in x', () => {
    const f = compileFunction(convertLatexToAsciiMath('x^2'));
    expect(f).not.toBeNull();
    expect(f!(3)).toBeCloseTo(9, 10);
    expect(f!(-2)).toBeCloseTo(4, 10);
  });
  it('handles implicit multiplication (2x)', () => {
    const f = compileFunction('2x+1');
    expect(f!(5)).toBeCloseTo(11, 10);
  });
  it('respects angle mode for trig functions of x', () => {
    const f = compileFunction(convertLatexToAsciiMath('\\sin(x)'), {
      angleMode: 'deg',
    });
    expect(f!(90)).toBeCloseTo(1, 10);
    expect(f!(0)).toBeCloseTo(0, 10);
  });
  it('returns NaN at out-of-domain points (curve breaks)', () => {
    const f = compileFunction(convertLatexToAsciiMath('\\sqrt{x}'));
    expect(Number.isNaN(f!(-1))).toBe(true);
    expect(f!(4)).toBeCloseTo(2, 10);
  });
  it('returns NaN when a gated function is used', () => {
    const f = compileFunction(convertLatexToAsciiMath('\\sin(x)'), {
      allowTrig: false,
    });
    expect(Number.isNaN(f!(0))).toBe(true);
  });
  it('returns null for empty or unparseable input', () => {
    expect(compileFunction('')).toBeNull();
    expect(compileFunction('2+')).toBeNull();
  });
});

describe('evaluate — error handling', () => {
  it('returns a blank (no error) for empty input', () => {
    expect(evaluate('')).toEqual({ ok: false, error: '' });
    expect(evaluate('   ')).toEqual({ ok: false, error: '' });
  });
  it('reports an undefined result for division by zero', () => {
    const r = fromLatex('\\frac{1}{0}');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/undefined/i);
  });
  it('reports an undefined result for the square root of a negative', () => {
    const r = fromLatex('\\sqrt{-4}');
    expect(r.ok).toBe(false);
  });
  it('reports a generic failure for malformed input', () => {
    const r = evaluate('2+');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/can't be evaluated/i);
  });
});

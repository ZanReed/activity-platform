// =============================================================================
// math-equivalent.test.ts — numeric-sampling equivalence for math-answer blanks
// -----------------------------------------------------------------------------
// The batchable, high-value core of Model B math blanks. Pins the Q6 correctness
// traps from docs/design/math-blanks.md: free-var UNION, signed sampling domain
// (sqrt(x^2) ≢ x), skip-and-resample on undefined, plus value/exact-form modes.
// =============================================================================

import { describe, it, expect } from 'vitest';
import { mathEquivalent } from '../src/math-equivalent.js';
import { freeVariables } from '../src/evaluate.js';

describe('mathEquivalent — value mode', () => {
  it('accepts algebraically equal forms of 2a', () => {
    expect(mathEquivalent('2a', '2a')).toBe(true);
    expect(mathEquivalent('a*2', '2a')).toBe(true);
    expect(mathEquivalent('a+a', '2a')).toBe(true);
    expect(mathEquivalent('2*a', '2a')).toBe(true);
  });

  it('rejects a different variable / different expression', () => {
    expect(mathEquivalent('2b', '2a')).toBe(false);
    expect(mathEquivalent('a', '2a')).toBe(false);
    expect(mathEquivalent('a/2', '2a')).toBe(false);
    expect(mathEquivalent('3a', '2a')).toBe(false);
  });

  it('handles multi-variable expressions (denominator of the quadratic formula)', () => {
    expect(mathEquivalent('2a', '2*a')).toBe(true);
    expect(mathEquivalent('a b', 'a*b')).toBe(true);
    expect(mathEquivalent('b a', 'a*b')).toBe(true); // commutative
    expect(mathEquivalent('a*b', 'a+b')).toBe(false);
  });

  it('Q6 trap: samples the UNION of key + student vars (verbose form with an extra var)', () => {
    // `a + a + 0*b` mentions b; sampling only the key (a) would leave b unbound → NaN → wrong.
    expect(mathEquivalent('a + a + 0*b', '2a')).toBe(true);
    expect(mathEquivalent('2a', 'a + a + 0*b')).toBe(true); // symmetric
  });

  it('Q6 trap: sqrt(x^2) is NOT equivalent to x (signed sampling domain)', () => {
    expect(mathEquivalent('sqrt(x^2)', 'x')).toBe(false);
    expect(mathEquivalent('sqrt(x^2)', 'abs(x)')).toBe(true); // |x| IS sqrt(x^2)
  });

  it('skip-and-resample: expressions agreeing where both are defined pass despite undefined points', () => {
    // Both undefined for x<0; agree for x>=0. Should still pass on the valid overlap.
    expect(mathEquivalent('sqrt(x)', 'x^(1/2)')).toBe(true);
    // 1/x vs 1/x agree everywhere they're defined (x=0 skipped).
    expect(mathEquivalent('1/x', '1/x')).toBe(true);
  });

  it('constants and pure-numeric answers compare by value', () => {
    expect(mathEquivalent('2+3', '5')).toBe(true);
    expect(mathEquivalent('1/2', '0.5')).toBe(true);
    expect(mathEquivalent('2+3', '6')).toBe(false);
  });

  it('respects an absolute tolerance for numeric wobble', () => {
    expect(mathEquivalent('0.33', '1/3')).toBe(false); // outside default (exact) tolerance
    expect(mathEquivalent('0.33', '1/3', { tolerance: 0.01 })).toBe(true);
  });

  it('empty / unparseable input is never correct', () => {
    expect(mathEquivalent('', '2a')).toBe(false);
    expect(mathEquivalent('2a', '')).toBe(false);
    expect(mathEquivalent('((', '2a')).toBe(false);
  });
});

describe('mathEquivalent — form mode (exact-form RETIRED, FG-8)', () => {
  it('accepts the same form, whitespace- and order-insensitively', () => {
    expect(mathEquivalent('2a', '2a', { mode: 'form' })).toBe(true);
    expect(mathEquivalent('2 a', '2a', { mode: 'form' })).toBe(true);
    expect(mathEquivalent('a*2', '2*a', { mode: 'form' })).toBe(true); // exact-form refused this
  });

  it('rejects an unsimplified form that value mode accepts', () => {
    expect(mathEquivalent('a+a', '2a', { mode: 'form' })).toBe(false);
    expect(mathEquivalent('a+a', '2a')).toBe(true);
  });

  it('anything exact-form accepted, form accepts (the upgrade is widening-only)', () => {
    for (const [s, k] of [['2a', '2a'], ['2 a', '2a'], ['x^2 + 1', 'x^2+1'], ['6(3x-2)', '6(3x-2)']]) {
      expect(mathEquivalent(s!, k!, { mode: 'form' })).toBe(true);
    }
  });
});

describe('FG-3 in value mode: letters singly, a letter before a bracket multiplies', () => {
  it('fixes the live defects', () => {
    expect(mathEquivalent('12ba', '12ab')).toBe(true);
    expect(mathEquivalent('12*a*b', '12ab')).toBe(true);
    expect(mathEquivalent('x(x+2)', 'x^2+2x')).toBe(true);
    expect(mathEquivalent('3x(x+2)', '3x^2+6x')).toBe(true);
    expect(mathEquivalent('x*(x+2)', 'x(x+2)')).toBe(true);
    expect(mathEquivalent('(2)/(3)x', '2x/3')).toBe(true);
    expect(mathEquivalent('1 1/3', '4/3')).toBe(true);
    expect(mathEquivalent('⅓', '1/3')).toBe(true);
  });
  it('the five live math-blank keys still grade as before', () => {
    for (const k of ['3/2', '2x', '5x', '4x', 'k']) expect(mathEquivalent(k, k)).toBe(true);
    expect(mathEquivalent('1.5', '3/2')).toBe(true);
    expect(mathEquivalent('x+x', '2x')).toBe(true);
    expect(mathEquivalent('3x', '2x')).toBe(false);
  });
});

describe('freeVariables', () => {
  it('extracts variable names, excluding functions and constants', () => {
    expect(freeVariables('2a').sort()).toEqual(['a']);
    expect(freeVariables('a*b + c').sort()).toEqual(['a', 'b', 'c']);
    expect(freeVariables('sin(x) + pi').sort()).toEqual(['x']); // sin is a fn, pi a constant
    expect(freeVariables('2+3')).toEqual([]);
    expect(freeVariables('')).toEqual([]);
  });
});

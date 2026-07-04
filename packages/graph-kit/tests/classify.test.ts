// =============================================================================
// classify.test.ts — expression-row classification + slider scope (Stage 4)
// -----------------------------------------------------------------------------
// classifyExpression() decides what an expression-list row is (function /
// point / slider / error); compileFunction()'s vars parameter is what lets a
// row reference a slider. Inputs are the AsciiMath strings a MathLive field
// produces (getValue('ascii-math')).
// =============================================================================

import { describe, it, expect } from 'vitest';
import { classifyExpression, compileFunction } from '../src/evaluate.js';

describe('classifyExpression — functions', () => {
  it('classifies a bare expression in x as a function', () => {
    const r = classifyExpression('x^(2)');
    if (r.kind !== 'function') throw new Error(`got ${r.kind}`);
    expect(r.fn(3)).toBe(9);
  });

  it('strips y = notation', () => {
    const r = classifyExpression('y=2x+1');
    if (r.kind !== 'function') throw new Error(`got ${r.kind}`);
    expect(r.fn(2)).toBe(5);
  });

  it('treats a constant as a horizontal line (still a function)', () => {
    const r = classifyExpression('3');
    if (r.kind !== 'function') throw new Error(`got ${r.kind}`);
    expect(r.fn(-5)).toBe(3);
  });

  it('classifies empty (and bare y=) as empty', () => {
    expect(classifyExpression('').kind).toBe('empty');
    expect(classifyExpression('y=').kind).toBe('empty');
  });
});

describe('classifyExpression — sliders', () => {
  it('classifies a = 3 as a slider', () => {
    const r = classifyExpression('a=3');
    expect(r).toEqual({ kind: 'slider', name: 'a', value: 3 });
  });

  it('accepts a constant expression as the slider value', () => {
    const r = classifyExpression('k=2pi');
    if (r.kind !== 'slider') throw new Error(`got ${r.kind}`);
    expect(r.value).toBeCloseTo(2 * Math.PI, 10);
  });

  it('does not treat x =, y =, or e = as sliders', () => {
    // x is the plot variable, y= is function notation, e is the constant.
    expect(classifyExpression('y=x').kind).toBe('function');
    expect(classifyExpression('x=3').kind).not.toBe('slider');
    expect(classifyExpression('e=3').kind).not.toBe('slider');
  });

  it('errors on a slider whose value is not constant', () => {
    expect(classifyExpression('a=q+1').kind).toBe('error');
  });
});

describe('classifyExpression — points', () => {
  it('classifies (1, 2) as a point', () => {
    const r = classifyExpression('(1,2)');
    if (r.kind !== 'point') throw new Error(`got ${r.kind}`);
    expect(r.px()).toBe(1);
    expect(r.py()).toBe(2);
  });

  it('lets point coordinates reference sliders', () => {
    const r = classifyExpression('(a,2a)');
    if (r.kind !== 'point') throw new Error(`got ${r.kind}`);
    expect(r.px({ a: 3 })).toBe(3);
    expect(r.py({ a: 3 })).toBe(6);
  });

  it('does NOT mistake a parenthesized product for a point', () => {
    // (x+1)*(x-2) starts with ( and ends with ) but is not one group.
    expect(classifyExpression('(x+1)*(x-2)').kind).toBe('function');
  });

  it('does NOT mistake a two-comma tuple for a point', () => {
    expect(classifyExpression('(1,2,3)').kind).not.toBe('point');
  });
});

describe('compileFunction — slider vars', () => {
  it('evaluates with slider values from the vars scope', () => {
    const fn = compileFunction('a x^(2)');
    if (!fn) throw new Error('did not compile');
    expect(fn(2, { a: 3 })).toBe(12);
    expect(fn(2, { a: -1 })).toBe(-4);
  });

  it('yields NaN when a referenced slider is missing (curve just breaks)', () => {
    const fn = compileFunction('b+x');
    if (!fn) throw new Error('did not compile');
    expect(Number.isNaN(fn(1))).toBe(true);
    expect(fn(1, { b: 1 })).toBe(2);
  });

  it('still honors restriction gates with vars present', () => {
    const fn = compileFunction('a sin(x)', { allowTrig: false });
    if (!fn) throw new Error('did not compile');
    expect(Number.isNaN(fn(1, { a: 2 }))).toBe(true);
  });
});

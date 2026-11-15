import { describe, expect, it } from 'vitest';
import { CALC_HISTORY_MAX, fractionText, pushHistory } from '../src/calc-extras.js';

describe('fractionText', () => {
  it('finds simple fractions in lowest terms, through float noise', () => {
    expect(fractionText(0.75)).toBe('3/4');
    expect(fractionText(0.1 + 0.2)).toBe('3/10');
    expect(fractionText(-1.5)).toBe('-3/2');
    expect(fractionText(1 / 3)).toBe('1/3');
    expect(fractionText(22 / 7)).toBe('22/7');
  });

  it('gives none for integers, irrationals and huge denominators', () => {
    expect(fractionText(4)).toBeNull();
    expect(fractionText(Math.PI)).toBeNull();
    expect(fractionText(Math.SQRT2)).toBeNull();
    expect(fractionText(1 / 1009)).toBeNull();
    expect(fractionText(Number.NaN)).toBeNull();
  });
});

describe('pushHistory', () => {
  it('keeps newest first, caps the list, and skips a repeat of the newest', () => {
    let h = pushHistory([], { latex: '1+1', value: 2 });
    h = pushHistory(h, { latex: '2\\times3', value: 6 });
    expect(h.map((e) => e.value)).toEqual([6, 2]);
    expect(pushHistory(h, { latex: '2\\times3', value: 6 })).toHaveLength(2);
    for (let i = 0; i < 20; i++) h = pushHistory(h, { latex: String(i), value: i });
    expect(h).toHaveLength(CALC_HISTORY_MAX);
    expect(h[0]!.value).toBe(19);
  });
});

// =============================================================================
// fit-format.test.ts — display strings for regression fits (Stage 3)
// =============================================================================

import { describe, it, expect } from 'vitest';
import { equationText, r2Text, formatCoefficient } from '../src/fit-format.js';

describe('formatCoefficient', () => {
  it('caps at 6 significant digits and drops trailing zeros', () => {
    expect(formatCoefficient(1.23456789)).toBe('1.23457');
    expect(formatCoefficient(2.5)).toBe('2.5');
    expect(formatCoefficient(2)).toBe('2');
  });

  it('renders negatives with U+2212 (the keypad minus)', () => {
    expect(formatCoefficient(-1.5)).toBe('−1.5');
  });
});

describe('equationText', () => {
  it('formats a linear fit like a textbook (no + −)', () => {
    expect(equationText({ model: 'linear', a: 1.1, b: 0, r2: 1 })).toBe(
      'y = 1.1x + 0',
    );
    expect(equationText({ model: 'linear', a: 2, b: -1.5, r2: 1 })).toBe(
      'y = 2x − 1.5',
    );
  });

  it('formats a quadratic fit with unicode superscript', () => {
    expect(
      equationText({ model: 'quadratic', a: 1, b: -2, c: 3, r2: 1 }),
    ).toBe('y = 1x² − 2x + 3');
  });

  it('formats an exponential fit as y = a·bˣ', () => {
    expect(equationText({ model: 'exponential', a: 2.3094, b: 1.7356, r2: 1 })).toBe(
      'y = 2.3094 · 1.7356ˣ',
    );
  });
});

describe('r2Text', () => {
  it('labels quadratic R² and the others r² (the TI readouts)', () => {
    expect(r2Text({ model: 'linear', a: 1, b: 0, r2: 0.99109 })).toBe(
      'r² = 0.9911',
    );
    expect(r2Text({ model: 'quadratic', a: 1, b: 0, c: 0, r2: 1 })).toBe(
      'R² = 1',
    );
    expect(r2Text({ model: 'exponential', a: 1, b: 2, r2: 0.6914285 })).toBe(
      'r² = 0.6914',
    );
  });
});

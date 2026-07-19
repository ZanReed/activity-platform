// =============================================================================
// math-prompt-convert.test.ts — LaTeX <-> ascii bridge (MA-T3, Model A)
// -----------------------------------------------------------------------------
// The converters wrap MathLive's pure SSR functions; these tests pin the
// direction the value bridge relies on (LaTeX from the field -> ascii into the
// mirror, and back for hydrate), the round-trip, and the malformed-input safety
// that keeps a mid-edit expression from throwing on the check/gather path.
// =============================================================================

import { describe, it, expect } from 'vitest';
import { latexToAscii, asciiToLatex } from '../src/math-prompt-convert.js';

describe('latexToAscii', () => {
  it('converts a MathLive fraction to graded ascii', () => {
    expect(latexToAscii('\\frac{1}{2}')).toBe('(1)/(2)');
  });

  it('passes a plain expression through', () => {
    expect(latexToAscii('2a')).toBe('2a');
  });

  it('returns empty string for empty / whitespace input (unanswered gap)', () => {
    expect(latexToAscii('')).toBe('');
    expect(latexToAscii('   ')).toBe('');
  });

  it('never throws on malformed LaTeX — yields empty, not an exception', () => {
    expect(() => latexToAscii('\\frac{')).not.toThrow();
    expect(typeof latexToAscii('\\frac{')).toBe('string');
  });
});

describe('asciiToLatex', () => {
  it('converts ascii back to MathLive LaTeX for hydrate', () => {
    expect(asciiToLatex('(1)/(2)')).toBe('\\frac{1}{2}');
  });

  it('returns empty string for empty input', () => {
    expect(asciiToLatex('')).toBe('');
  });
});

describe('round-trip', () => {
  it('LaTeX -> ascii -> LaTeX is stable for a fraction', () => {
    const ascii = latexToAscii('\\frac{1}{2}');
    expect(asciiToLatex(ascii)).toBe('\\frac{1}{2}');
  });

  it('a value the student would type in the quadratic denominator survives', () => {
    // Student types "2a" in the field -> stored ascii -> graded by mathEquivalent.
    expect(latexToAscii('2a')).toBe('2a');
    // Restored ascii hydrates back into a valid field value.
    expect(typeof asciiToLatex('2a')).toBe('string');
  });
});

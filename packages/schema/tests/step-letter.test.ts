// =============================================================================
// step-letter.test.ts — the a/b/c marker, now that two packages share it
// -----------------------------------------------------------------------------
// `stepLetter` had no test in either of the places it used to live. That was
// survivable while each copy served one caller; it is not now that ONE
// implementation feeds a faded example's step letters (editor) and the sub-part
// letters on a multi-blank fill_in_blank (viewer, ruling N7). A change here
// moves two surfaces at once, so the wrap boundary gets pinned rather than
// assumed.
//
// The interesting case is 26. This is BIJECTIVE base-26 — there is no "digit
// zero", so the sequence is a…z, aa, ab, and index 26 is "aa". A plain base-26
// conversion would produce "ba" (1×26 + 0) and nobody would notice until a
// worksheet had 27 sub-parts, which is exactly the kind of thing that ships.
// =============================================================================

import { describe, it, expect } from 'vitest';
import { stepLetter } from '../src/index.js';

describe('stepLetter', () => {
  it('covers the single-letter run', () => {
    expect(stepLetter(0)).toBe('a');
    expect(stepLetter(1)).toBe('b');
    expect(stepLetter(25)).toBe('z');
  });

  it('wraps BIJECTIVELY at 26 — "aa", not "ba" and not "a0"', () => {
    expect(stepLetter(26)).toBe('aa');
    expect(stepLetter(27)).toBe('ab');
    expect(stepLetter(51)).toBe('az');
    expect(stepLetter(52)).toBe('ba');
  });

  it('carries a second time at the end of the two-letter run', () => {
    expect(stepLetter(701)).toBe('zz');
    expect(stepLetter(702)).toBe('aaa');
  });

  it('is strictly increasing and never empty across the wrap', () => {
    // A property rather than a table: the failure this catches is a length or
    // ordering glitch at a boundary nobody thought to enumerate.
    let previous = '';
    for (let i = 0; i < 800; i++) {
      const letter = stepLetter(i);
      expect(letter).toMatch(/^[a-z]+$/);
      const longerOrLater =
        letter.length > previous.length ||
        (letter.length === previous.length && letter > previous);
      expect(longerOrLater, `stepLetter(${i}) = "${letter}" after "${previous}"`).toBe(
        true,
      );
      previous = letter;
    }
  });
});

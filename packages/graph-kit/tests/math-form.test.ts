// =============================================================================
// math-form.test.ts — form grading's engine (docs/design/form-grading.md)
// -----------------------------------------------------------------------------
// Pins: the four D60 examples verbatim; every row of FG-1's family table; the
// review's parse rows; amendments A2 (fraction coefficient), A3 (sign through a
// bracket) and A4 (mixed numbers); key-side folding (FG-6); the bound (FG-14);
// and two property tests (form ⇒ value; any +/× reordering of a key matches).
// =============================================================================

import { describe, it, expect } from 'vitest';
import {
  tokenizeMath,
  mathShape,
  sameShape,
  displayFormKey,
  foldCollapsesBracket,
  FORM_REWRITES,
  MAX_SHAPE_NODES,
} from '../src/math-form.js';
import { mathEquivalent } from '../src/math-equivalent.js';
import { freeVariables } from '../src/evaluate.js';

const form = (s: string, k: string): boolean => mathEquivalent(s, k, { mode: 'form' });
const value = (s: string, k: string): boolean => mathEquivalent(s, k);

/** [student, key, value-equal?, form-equal?] */
type Row = [string, string, boolean, boolean];
const check = (rows: Row[]): void => {
  for (const [s, k, v, f] of rows) {
    expect({ s, k, value: value(s, k) }).toEqual({ s, k, value: v });
    expect({ s, k, form: form(s, k) }).toEqual({ s, k, form: f });
  }
};

describe('D60 acceptance examples, verbatim (their four)', () => {
  it('Factorise 18x − 12', () => {
    check([
      ['6(3x − 2)', '6(3x-2)', true, true],
      ['18x − 12', '6(3x-2)', true, false],
      ['2(9x − 6)', '6(3x-2)', true, false],
    ]);
  });
  it('Simplify 4a × 3b', () => {
    check([
      ['12ab', '12ab', true, true],
      ['4a×3b', '12ab', true, false],
      ['7ab', '12ab', false, false],
    ]);
  });
  it('Expand −2(3x − 5)', () => {
    check([
      ['−6x + 10', '-6x+10', true, true],
      ['−6x − 10', '-6x+10', false, false],
    ]);
  });
  it('Simplest form of 4/6', () => {
    check([
      ['2/3', '2/3', true, true],
      ['4/6', '2/3', true, false],
    ]);
  });
});

describe('FG-1 family table', () => {
  it('terms collected', () => {
    check([
      ['2y+3x', '3x+2y', true, true],
      ['5x-2x+2y', '3x+2y', true, false],
      ['x+x+x+2y', '3x+2y', true, false],
    ]);
  });
  it('simplified product / quotient, index laws', () => {
    check([
      ['12ba', '12ab', true, true],
      ['12*a*b', '12ab', true, true],
      ['a^5', 'a^5', true, true],
      ['4a*3b', '12ab', true, false],
      ['a^2*a^3', 'a^5', true, false],
      ['a*a*a*a*a', 'a^5', true, false],
    ]);
  });
  it('expanded', () => {
    check([
      ['10-6x', '-6x+10', true, true],
      ['-6x+10', '-6x+10', true, true],
      ['-2(3x-5)', '-6x+10', true, false],
    ]);
  });
  it('factorised', () => {
    check([
      ['(3x-2)6', '6(3x-2)', true, true],
      ['6(-2+3x)', '6(3x-2)', true, true],
      ['18x-12', '6(3x-2)', true, false],
      ['2(9x-6)', '6(3x-2)', true, false],
    ]);
  });
  it('simplest form', () => {
    check([
      ['2/3', '2/3', true, true],
      ['(2)/(3)', '2/3', true, true],
      ['4/6', '2/3', true, false],
    ]);
    // 0.6667 is outside the engine's slack: not equivalent at all.
    expect(value('0.6667', '2/3')).toBe(false);
  });
  it('accepted, and the letter says so: factor order and ÷', () => {
    check([
      ['a*12*b', '12ab', true, true],
      ['2÷3', '2/3', true, true],
    ]);
  });
});

describe('A2 · a fraction coefficient (rule 9)', () => {
  it('a product over a numeric denominator is that fraction as a coefficient', () => {
    check([
      ['x/2', '½x', true, true],
      ['½x', 'x/2', true, true],
      ['(1/2)x', 'x/2', true, true],
      ['2x/3', '⅔x', true, true],
      ['⅔x', '(2/3)x', true, true],
      ['(2)/(3)x', '2x/3', true, true], // MathLive's \frac{2}{3}x
    ]);
  });
  it('leaves never fold, so simplest form holds', () => {
    check([['4x/6', '⅔x', true, false]]);
  });
  it('a letter denominator is unchanged', () => {
    expect(mathShape('4b/a', 'student')).toBe(mathShape('4b/a', 'key'));
    check([['4b/a', '4(b/a)', true, false]]);
  });
});

describe('A3 · sign through a bracket (rule 10)', () => {
  it('negating two factors of a product is the same shape', () => {
    check([
      ['−6(2−3x)', '6(3x-2)', true, true],
      ['−x(2−xy^3)', 'x(xy^3-2)', true, true],
      ['−6(3x−2)', '6(2-3x)', true, true],
      ['-(x+1)(1-x)', '(x+1)(x-1)', true, true],
    ]);
  });
  it('a lone minus in front of a bracket stays (brackets are not expanded)', () => {
    check([
      ['-(3x-2)', '2-3x', true, false],
      ['2-3x', '-(3x-2)', true, false],
    ]);
  });
  it('a top-level sum keeps its signs', () => {
    check([['6x-10', '10-6x', false, false]]);
  });
  it('applies to mistake entries too: !2(9x-6) catches −2(6−9x)', () => {
    expect(sameShape('−2(6−9x)', '2(9x-6)')).toBe(true);
    expect(sameShape('(9x - 6)*2', '2(9x-6)')).toBe(true);
  });
});

describe('A4 · mixed numbers', () => {
  it('a mixed number of integers is the shape of its improper fraction', () => {
    check([
      ['1⅓', '4/3', true, true],
      ['1 1/3', '4/3', true, true],
      ['1(1)/(3)', '4/3', true, true], // MathLive's 1\frac{1}{3}
      ['2(1)/(3)', '7/3', true, true],
      ['1 2/6', '4/3', true, false],
      ['-1 1/3', '-4/3', true, true],
    ]);
  });
  it('a lone glyph is its fraction', () => {
    check([
      ['⅓', '1/3', true, true],
      ['¾', '3/4', true, true],
    ]);
  });
  it('each spelling was a parse failure, so reading it is widening-only', () => {
    expect(tokenizeMath('1 1/3')).toBe('(4/3)');
    expect(tokenizeMath('1⅓')).toBe('(4/3)');
    expect(tokenizeMath('2(1)/(3)')).toBe('(7/3)');
    expect(tokenizeMath('1 1/3x')).toBe('(4/3) x');
  });
  it('a whole part that does not stand alone is not read as one', () => {
    expect(tokenizeMath('x^2 1/2')).not.toContain('(5/2)');
    expect(tokenizeMath('6/2 1/3')).not.toContain('(7/3)');
  });
});

describe('the review’s parse rows, pinned (FG-3 + FG-2 rule 7)', () => {
  it('letters are read singly', () => {
    expect(freeVariables(tokenizeMath('12ab')).sort()).toEqual(['a', 'b']);
    check([
      ['12ba', '12ab', true, true],
      ['12*a*b', '12ab', true, true],
      ['12a b', '12ab', true, true], // MathLive's 12ab
    ]);
  });
  it('a letter before a bracket multiplies', () => {
    expect(tokenizeMath('x(x+2)')).toBe('x*(x+2)');
    expect(tokenizeMath('ab(c+d)')).toBe('a b*(c+d)');
    check([
      ['x(x+2)', 'x^2+2x', true, false],
      ['3x(x+2)', '3x^2+6x', true, false],
      ['x*(x+2)', 'x(x+2)', true, true],
    ]);
  });
  it('a letter before digits multiplies', () => {
    expect(tokenizeMath('x2')).toBe('x 2');
    expect(tokenizeMath('2x3')).toBe('2 x 3');
    check([['x2', '2x', true, true]]);
  });
  it('-2^2 is -(2^2): a sign never crosses a power', () => {
    expect(value('-2^2', '-4')).toBe(true);
    check([['-2^2', '(-2)^2', false, false]]);
  });
  it('-x / -1x / (-1)x: the student side keeps the 1, the key side drops it', () => {
    check([
      ['-x', '-x', true, true],
      ['-1x', '-x', true, false],
      ['(-1)x', '-x', true, false],
      ['-x', '(-1)x', true, true], // key-side clean-up (FG-6)
    ]);
  });
  it('two signs are not simplest; one sign moves to the front', () => {
    check([
      ['(-2)/(-3)', '2/3', true, false],
      ['-(2/3)', '(-2)/3', true, true],
      ['2/(-3)', '-2/3', true, true],
    ]);
  });
  it('a/b/c is (a/b)/c, not a/(bc)', () => {
    expect(sameShape('a/b/c', 'a/(bc)')).toBe(false);
    expect(sameShape('(a/b)/c', 'a/b/c')).toBe(true);
  });
  it('a sign on a number is the number’s sign; x-(-2) is x+2', () => {
    check([
      ['x-(-2)', 'x+2', true, true],
      ['10+(-6)x', '-6x+10', true, true],
      ['-(6x)', '(-6)x', true, true],
    ]);
  });
  it('protected names stay whole; e stays Euler’s number; scientific notation keeps its e', () => {
    expect(tokenizeMath('pir^2')).toBe('pi r^2');
    expect(tokenizeMath('xsin(x)')).toBe('x sin(x)');
    expect(tokenizeMath('sqrt(x)')).toBe('sqrt(x)');
    expect(tokenizeMath('1e3')).toBe('1e3');
    expect(tokenizeMath('10 mod 3')).toMatch(/^10\s+mod\s+3$/);
    expect(freeVariables(tokenizeMath('2ex'))).toEqual(['x']);
    expect(tokenizeMath('x_1')).toBe('x_1');
  });
  it('MathLive spellings, run (form-grading.md "Not checked yet")', () => {
    // \cdot between brackets, a superscript on a bracket, \div, \times.
    check([
      ['(x+1) * (x-1)', '(x+1)(x-1)', true, true],
      ['(x+1)^2', '(x+1)^2', true, true],
      ['2 -: 3', '2/3', true, true],
      ['3 * 4a', '12a', true, false],
      ['x^2y^3', 'y^3x^2', true, true],
    ]);
  });
});

describe('Fable review of step 1: precedence and spacing rows', () => {
  it('splitting letters never changes precedence after / or ^ (value mode, widening-only)', () => {
    check([
      ['1/(ab)', '1/ab', true, true],
      ['a/(bc)', 'a/bc', true, true],
      ['(ab)/(cd)', 'ab/cd', true, true],
      ['x/(2yz)', 'x/2yz', true, true],
      ['x/(2y)', 'x/2y', true, true],
      ['x^(ab)', 'x^ab', true, true],
    ]);
    // `1/x(x+2)` was a CALL of x (always wrong); it now reads (1/x)·(x+2), the
    // explicit product — the one widening the review named in this family.
    expect(value('(x+2)/x', '1/x(x+2)')).toBe(true);
  });
  it('a space between a letter and a bracket is still a product', () => {
    check([
      ['x (x+2)', 'x^2+2x', true, false],
      ['a b (c+d)', 'ab(c+d)', true, true],
    ]);
  });
  it('MathLive fraction after a coefficient or a letter is one factor', () => {
    check([
      ['2(x)/(3)y', '2x/3*y', true, false],
      ['2(x)/(3)y', '2*(x/3)*y', true, true],
      ['a(2)/(3)b', '(2/3)ab', true, true],
    ]);
    expect(tokenizeMath('sqrt(2)/(3)x')).toContain('sqrt(2)');
  });
  it('a glyph after a space is still a mixed number', () => {
    check([['1 ⅓', '4/3', true, true]]);
  });
});

describe('FG-6 · key-side folding and clean-up', () => {
  it('a computed coefficient folds, a division never does', () => {
    check([
      ['12ab', '((4)*(3))ab', true, true],
      ['-18x + 12', '(-(6)*(3))*x + (6)*(2)', true, true],
      ['6(3x-2)', '(6)*((3)*x-(2))', true, true],
      ['2/3', '(2)/(3)', true, true],
      ['4/6', '(4)/(6)', true, true], // the key's own fraction stays a fraction
      ['2/3', '(4)/(6)', true, false],
    ]);
  });
  it('the clean-up list applies to the key only', () => {
    check([
      ['x', '(1)*x', true, true],
      ['-x', '(-1)*x', true, true],
      ['x', 'x^(1)', true, true],
      ['x', 'x + (0)', true, true],
      ['1', 'x^(0)', true, true],
      ['x', '(0)*y + x', true, true],
      // …and a student who wrote them has not finished simplifying.
      ['1x', 'x', true, false],
      ['x+0', 'x', true, false],
      ['4*3ab', '12ab', true, false],
    ]);
  });
  it('displayFormKey shows the folded key the way a worksheet writes it', () => {
    expect(displayFormKey('(6)*((3)*x-(2))')).toBe('6(3x - 2)');
    expect(displayFormKey('((4)*(3))ab')).toBe('12ab');
    expect(displayFormKey('(-(6)*(3))*x + (6)*(2)')).toBe('-18x + 12');
    expect(displayFormKey('(3)/(4)')).toBe('3/4');
    expect(displayFormKey('(1)*x + (0)')).toBe('x');
    expect(displayFormKey('x - (-2)')).toBe('x - (-2)');
    expect(displayFormKey('')).toBeNull();
  });
  it('a displayed key is itself a correct answer for the key it came from', () => {
    for (const k of ['(6)*((3)*x-(2))', '((4)*(3))ab', '(-(6)*(3))*x + (6)*(2)', '(2)/(3)', '(1)/(2)x']) {
      const shown = displayFormKey(k) ?? '';
      expect({ k, shown, ok: form(shown, k) }).toEqual({ k, shown, ok: true });
    }
  });
  it('folds only SEED arithmetic: an authored all-number key keeps its form', () => {
    // Seed binding always brackets a value (`(6)`); an author's `3*4` has no
    // brackets, so it is the form wanted (Fable review of step 1, finding 4).
    check([
      ['3*4', '3*4', true, true],
      ['12', '3*4', true, false],
      ['2*2*3', '2*2*3', true, true],
      ['12', '(3)*(4)', true, true],
      ['1x', '1x', true, true],
    ]);
  });
  it('displayFormKey never prints a different expression (no accidental names)', () => {
    for (const k of ['a*sin(x)', 'm*a*x*(y+1)', 'p*i', 's*i*n', '(2)*e*x']) {
      const shown = displayFormKey(k) ?? '';
      expect({ k, shown, ok: form(shown, k) }).toEqual({ k, shown, ok: true });
    }
  });
  it('foldCollapsesBracket names a seed row that collapses the form', () => {
    expect(foldCollapsesBracket('(6)*((3)*x-(0))')).toBe(true);
    expect(foldCollapsesBracket('(6)*((3)*x-(2))')).toBe(false);
  });
});

describe('FG-14 · the bound', () => {
  it('a tree over MAX_SHAPE_NODES has no shape', () => {
    const big = Array.from({ length: MAX_SHAPE_NODES }, () => 'x').join('+');
    expect(mathShape(big, 'student')).toBeNull();
    expect(sameShape(big, big)).toBe(false);
  });
  it('letters are split before anything counts them', () => {
    // 256 letters become 256 factors joined by 255 implicit products — what
    // the grader's bound counts on the TOKENIZED string (guards.ts).
    const tok = tokenizeMath('a'.repeat(256));
    expect(tok.split(' ')).toHaveLength(256);
  });
  it('unshapeable input is never a form match', () => {
    for (const bad of ['', '((', '[1,2]', 'x=2', 'x<2']) {
      expect(form(bad, 'x')).toBe(false);
      expect(form('x', bad)).toBe(false);
    }
  });
});

describe('the closed list', () => {
  it('names ten rules, FG-2 1–8 plus A2 and A3 (A4 widens rule 8)', () => {
    expect(FORM_REWRITES).toHaveLength(10);
    expect(FORM_REWRITES[8]).toMatch(/A2/);
    expect(FORM_REWRITES[9]).toMatch(/A3/);
  });
});

// ---- properties ---------------------------------------------------------------

/** mulberry32 — a seeded PRNG, so a failure reproduces. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type T = { op: '+' | '*'; xs: T[] } | { leaf: string };

function gen(r: () => number, depth: number): T {
  if (depth <= 0 || r() < 0.3) {
    const leaves = ['2', '3', '5', 'a', 'b', 'x', 'x^2', '-4', '7'];
    return { leaf: leaves[Math.floor(r() * leaves.length)] ?? 'x' };
  }
  const n = 2 + Math.floor(r() * 2);
  return { op: r() < 0.5 ? '+' : '*', xs: Array.from({ length: n }, () => gen(r, depth - 1)) };
}

function show(t: T, r: (() => number) | null): string {
  if ('leaf' in t) return t.leaf.startsWith('-') ? `(${t.leaf})` : t.leaf;
  const xs = [...t.xs];
  if (r) {
    for (let i = xs.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [xs[i], xs[j]] = [xs[j] as T, xs[i] as T];
    }
  }
  return `(${xs.map((x) => show(x, r)).join(t.op === '+' ? ' + ' : '*')})`;
}

describe('properties', () => {
  it('any reordering of a key’s + / × operands matches the key', () => {
    const r = rng(20261114);
    let tried = 0;
    for (let i = 0; i < 2000 && tried < 300; i++) {
      const t = gen(r, 3);
      const key = show(t, null);
      // Only keys an author writes: no all-number subtree for FG-6 to fold
      // (a folded key is, by design, not matched by its own unfolded spelling).
      if (mathShape(key, 'key') !== mathShape(key, 'student')) continue;
      tried++;
      const reordered = show(t, r);
      expect({ key, reordered, ok: form(reordered, key) }).toEqual({ key, reordered, ok: true });
    }
    expect(tried).toBe(300);
  });

  it('form-match ⇒ value-match, over random pairs and the corpus rows above', () => {
    const r = rng(7);
    const pool = [
      '6(3x-2)', '18x-12', '2(9x-6)', '12ab', '4a*3b', '-6x+10', '10-6x', '2/3', '4/6',
      'x/2', '½x', '1⅓', '4/3', '-(3x-2)', '2-3x', '(-2)/(-3)', 'x(x+2)', 'x^2+2x',
    ];
    for (let i = 0; i < 300; i++) pool.push(show(gen(r, 2), r));
    for (let i = 0; i < 600; i++) {
      const s = pool[Math.floor(r() * pool.length)] ?? 'x';
      const k = pool[Math.floor(r() * pool.length)] ?? 'x';
      if (form(s, k)) expect({ s, k, value: value(s, k) }).toEqual({ s, k, value: true });
      // And the bare shape relation never claims more than value equivalence.
      if (sameShape(s, s) && sameShape(s, k) && !value(s, k)) {
        throw new Error(`shape without value: ${s} vs ${k}`);
      }
    }
  });

  it('a displayed key is always a correct answer for its key', () => {
    const r = rng(99);
    const letters = ['a', 'b', 'x', 'p', 'i', 'm', 's', 'n'];
    for (let i = 0; i < 300; i++) {
      const t = gen(r, 3);
      // Mix in bracketed (seed-style) numbers and name-forming letters.
      const key = show(t, null)
        .replace(/\b(2|3)\b/g, (d) => (r() < 0.5 ? `(${d})` : d))
        .replace(/\ba\b/g, () => letters[Math.floor(r() * letters.length)] ?? 'a');
      const shown = displayFormKey(key);
      if (shown === null) continue;
      expect({ key, shown, ok: form(shown, key) }).toEqual({ key, shown, ok: true });
    }
  });

  it('tokenizeMath is idempotent', () => {
    const r = rng(42);
    const samples = [
      '12ab', 'x(x+2)', '(2)/(3)x', '1 1/3', '1⅓', '2(1)/(3)x', 'x2', 'pir^2',
      'sin x', 'xsin(x)', '½x', '3 × 4', '1e3', '-6(2-3x)', 'ab(c+d)',
      '10 mod 3', 'x (x+2)', '2(x)/(3)y', '1 ⅓', 'x^ab', '1/ab', 'a b (c+d)',
    ];
    for (let i = 0; i < 100; i++) samples.push(show(gen(r, 3), r));
    for (const s of samples) {
      const once = tokenizeMath(s);
      expect({ s, twice: tokenizeMath(once) }).toEqual({ s, twice: once });
    }
  });
});

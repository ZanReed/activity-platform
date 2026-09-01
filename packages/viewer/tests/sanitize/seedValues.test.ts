// =============================================================================
// seedValues.test.ts — derivation + substitution walk (wishlist #6)
// -----------------------------------------------------------------------------
// The D8 walk-level two-students test lives in grading-section.test.ts; these
// pin the leaves: determinism, per-name independence (D3's order-independence
// claim), distinct sampling, and the substitution surface list (D5 as built).
// =============================================================================

import { describe, expect, it } from 'vitest';
import type { SeedVar } from '@activity/schema';
import { deriveSeedValues, formatSeedValue } from '../../src/sanitize/seedValues.js';
import {
  substituteSeedValues,
  substituteText,
} from '../../src/sanitize/substitute.js';

const VARS: SeedVar[] = [
  { name: 'a', spec: { kind: 'int', min: 2, max: 9 } },
  { name: 'p', spec: { kind: 'list', values: [1.5, 1.75, 2.25, 2.5] } },
  { name: 'data', spec: { kind: 'sample', n: 8, min: 55, max: 99 } },
];

describe('deriveSeedValues', () => {
  it('is deterministic per seed and differs across seeds', () => {
    const s1 = deriveSeedValues(VARS, 'v1:student-a');
    const s1again = deriveSeedValues(VARS, 'v1:student-a');
    const s2 = deriveSeedValues(VARS, 'v1:student-b');
    expect(s1).toEqual(s1again);
    // Not a tautology: with 8-of-45 sampling the chance two students draw the
    // same full assignment is negligible; a collision here means the seed is
    // not reaching the PRNG.
    expect(s1).not.toEqual(s2);
  });

  it('draws within each spec (int range, list membership, distinct sample)', () => {
    for (const student of ['s1', 's2', 's3', 's4', 's5']) {
      const v = deriveSeedValues(VARS, `v1:${student}`);
      const a = v.a as number;
      expect(Number.isInteger(a)).toBe(true);
      expect(a).toBeGreaterThanOrEqual(2);
      expect(a).toBeLessThanOrEqual(9);
      expect([1.5, 1.75, 2.25, 2.5]).toContain(v.p);
      const data = v.data as number[];
      expect(data).toHaveLength(8);
      expect(new Set(data).size).toBe(8);
      for (const d of data) {
        expect(d).toBeGreaterThanOrEqual(55);
        expect(d).toBeLessThanOrEqual(99);
      }
    }
  });

  it('adding a variable never re-rolls the others (per-name sub-seeding)', () => {
    const before = deriveSeedValues(VARS, 'v1:student-a');
    const after = deriveSeedValues(
      [...VARS, { name: 'z', spec: { kind: 'int', min: 1, max: 100 } }],
      'v1:student-a',
    );
    expect(after.a).toEqual(before.a);
    expect(after.p).toEqual(before.p);
    expect(after.data).toEqual(before.data);
  });

  it('a full-range sample is a permutation (the distinctness edge)', () => {
    const v = deriveSeedValues(
      [{ name: 'all', spec: { kind: 'sample', n: 5, min: 1, max: 5 } }],
      'v1:x',
    );
    expect([...(v.all as number[])].sort((x, y) => x - y)).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('substitution surfaces (D5 as built)', () => {
  const values = deriveSeedValues(VARS, 'v1:student-a');

  it('interpolates declared names and leaves undeclared ones literal', () => {
    expect(substituteText('Buy {a} at $' + '{p}.', values)).toBe(
      `Buy ${values.a} at $${values.p}.`,
    );
    expect(substituteText('keep {unknown} literal', values)).toBe(
      'keep {unknown} literal',
    );
  });

  it('renders a sample variable as a comma-separated list in prose', () => {
    expect(substituteText('scores: {data}', values)).toBe(
      `scores: ${(values.data as number[]).join(', ')}`,
    );
    expect(formatSeedValue(values.data as number[])).toBe(
      (values.data as number[]).join(', '),
    );
  });

  it('walks text runs, splices data_plot.dataVar, and NEVER touches latex', () => {
    const doc = {
      sections: [
        {
          blocks: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'You have {a} items.' },
                { type: 'math_inline', latex: 'x^{a} + \\frac{a}{p}' },
              ],
            },
            {
              type: 'data_plot',
              data: [1, 2, 3],
              dataVar: 'data',
              prompt: [{ type: 'text', text: 'Plot {data}.' }],
            },
          ],
        },
      ],
    };
    const out = substituteSeedValues(doc, values) as typeof doc;
    const para = out.sections[0]!.blocks[0]! as {
      content: { text?: string; latex?: string }[];
    };
    expect(para.content[0]!.text).toBe(`You have ${values.a} items.`);
    // R2: latex is OUT of v1's surfaces — `{a}` there is a brace group.
    expect(para.content[1]!.latex).toBe('x^{a} + \\frac{a}{p}');
    const plot = out.sections[0]!.blocks[1]! as { data: number[] };
    expect(plot.data).toEqual(values.data);
    // Pure walk: the input tree was not mutated.
    expect(doc.sections[0]!.blocks[1]!.data).toEqual([1, 2, 3]);
    expect(
      (doc.sections[0]!.blocks[0]! as { content: { text?: string }[] })
        .content[0]!.text,
    ).toBe('You have {a} items.');
  });

  it('a dataVar naming nothing leaves the representative literal (fail-safe)', () => {
    const doc = { type: 'data_plot', data: [1, 2, 3], dataVar: 'ghost' };
    expect((substituteSeedValues(doc, values) as { data: number[] }).data).toEqual([
      1, 2, 3,
    ]);
  });
});

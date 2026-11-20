// =============================================================================
// seeded-display-places.test.ts — a spelled list's decimals on the answer key
// -----------------------------------------------------------------------------
// `p: list 1.50, 1.75` shows "1.50" in prose; the evaluated KEY over it
// (`a*p`) must print "4.50" on the teacher's key, not "4.5". Rule
// (resolveEntry.ts displayNumber + seedValues.ts PLACES): pad to the most
// decimals any referenced list variable was spelled with — when ALL its
// spellings share that count — and never drop a digit the exact value needs.
// Display only: the grader's resolveSeededEntry form is unchanged.
// =============================================================================

import { describe, expect, it } from 'vitest';
import type { SeedVar } from '@activity/schema';
import { deriveSeedValues, seedPlaces } from '../src/sanitize/seedValues.js';
import { displaySeededEntry, resolveSeededEntry } from '../src/seeded/resolveEntry.js';
import { seedForForm } from '../src/print/seededPrint.js';
import { substituteSeedValues } from '../src/sanitize/substitute.js';
import { gradeSection } from '../src/server/grading/index.js';
import { emptySectionResponses } from '../src/check/wire.js';
import { serveSeed } from '../src/sanitize/serveSeed.js';

function values(vars: SeedVar[]) {
  return deriveSeedValues(vars, 'print:act:v1');
}
const A3: SeedVar = { name: 'a', spec: { kind: 'list', values: [3] } };
const A2: SeedVar = { name: 'a', spec: { kind: 'list', values: [2] } };
const P150: SeedVar = { name: 'p', spec: { kind: 'list', values: [1.5], text: ['1.50'] } };
const P125: SeedVar = { name: 'p', spec: { kind: 'list', values: [1.25], text: ['1.25'] } };

describe('displaySeededEntry pads to a spelled list variable’s decimals', () => {
  it('3 × 1.50 → "4.50"', () => {
    expect(displaySeededEntry('a*p', 'numeric', values([A3, P150]))).toBe('4.50');
  });

  it('2 × 1.25 → "2.50"', () => {
    expect(displaySeededEntry('a*p', 'numeric', values([A2, P125]))).toBe('2.50');
  });

  it('a bare spelled variable shows its spelling, as prose does', () => {
    expect(displaySeededEntry('p', 'numeric', values([P150]))).toBe('1.50');
  });

  it('never rounds: an exact value needing 3 decimals stays exact', () => {
    // 1.25 × 3.3 = 4.125 (float noise trimmed), more places than p's 2.
    expect(displaySeededEntry('p*3.3', 'numeric', values([P125]))).toBe('4.125');
  });

  it('an int-only expression is unchanged, even beside a spelled variable', () => {
    const v = values([A3, P150, { name: 'b', spec: { kind: 'int', min: 4, max: 4 } }]);
    expect(displaySeededEntry('a*b', 'numeric', v)).toBe('12');
  });

  it('a list with no spellings is unchanged', () => {
    const r: SeedVar = { name: 'r', spec: { kind: 'list', values: [1.5] } };
    expect(displaySeededEntry('a*r', 'numeric', values([A3, r]))).toBe('4.5');
  });

  it('mixed spellings ("2", "2.50") fix no places', () => {
    const m: SeedVar = { name: 'm', spec: { kind: 'list', values: [2, 2.5], text: ['2', '2.50'] } };
    const v = values([A3, m]);
    expect(seedPlaces(v, 'm')).toBeUndefined();
    expect(['6', '7.5']).toContain(displaySeededEntry('a*m', 'numeric', v));
    // Both decimal, different counts: still no fixed places.
    const n: SeedVar = { name: 'n', spec: { kind: 'list', values: [1.5, 2.5], text: ['1.5', '2.50'] } };
    const w = values([A3, n]);
    expect(seedPlaces(w, 'n')).toBeUndefined();
    expect(['4.5', '7.5']).toContain(displaySeededEntry('a*n', 'numeric', w));
  });

  it('places come from ALL spellings, so every draw of the list agrees', () => {
    const p: SeedVar = { name: 'p', spec: { kind: 'list', values: [1.5, 1.75, 2], text: ['1.50', '1.75', '2.00'] } };
    for (const seed of ['s1', 's2', 's3', 's4', 's5', 's6']) {
      const v = deriveSeedValues([A2, p], seed);
      expect(displaySeededEntry('a*p', 'numeric', v)).toMatch(/^\d+\.\d{2}$/);
    }
  });

  it('the most places over the referenced variables wins', () => {
    const q: SeedVar = { name: 'q', spec: { kind: 'list', values: [0.5], text: ['0.500'] } };
    expect(displaySeededEntry('p + q', 'numeric', values([P150, q]))).toBe('2.000');
    expect(displaySeededEntry('q + p', 'numeric', values([P150, q]))).toBe('2.000');
  });

  it('a map not from deriveSeedValues (bank row, DoL table, copy) falls back', () => {
    const copy = { ...values([A3, P150]) };
    expect(displaySeededEntry('a*p', 'numeric', copy)).toBe('4.5');
    expect(displaySeededEntry('a*p', 'numeric', { a: 3, p: 1.5 })).toBe('4.5');
  });
});

describe('grading never sees the padding', () => {
  it('the bound key stays numeric and both spellings grade correct', () => {
    const VARS = [A3, P150];
    const v = deriveSeedValues(VARS, serveSeed('ver-1', 'student-alpha'));
    expect(resolveSeededEntry('a*p', 'numeric', v)).toBe('4.5');
    const d = {
      schemaVersion: 2,
      meta: { title: 'T', seedVars: VARS },
      sections: [{ id: 'sec', title: 'S', rows: [{ id: 'r1', columns: [{ id: 'c1', blocks: [{
        id: 'fib', type: 'fill_in_blank',
        content: [
          { type: 'text', text: '{a} pens at ${p}: ' },
          { type: 'blank', id: 'b', answer: 'a*p', answerType: 'numeric', width: 6 },
        ],
      }] }] }] }],
    };
    for (const typed of ['4.5', '4.50']) {
      const r = gradeSection({
        document: substituteSeedValues(d, v) as never,
        sectionId: 'sec',
        responses: { ...emptySectionResponses(), blanks: { b: typed } },
        seedValues: v,
      });
      expect(r.items['b']?.verdict, typed).toBe('correct');
    }
  });
});

describe('the printed answer key (seedForForm.keyed)', () => {
  it('prints the padded key, and the prose the spelling', () => {
    const doc = {
      schemaVersion: 2,
      meta: { title: 'T', seedVars: [A3, P150] },
      sections: [{ id: 'sec', title: 'S', rows: [{ id: 'r1', columns: [{ id: 'c1', blocks: [{
        id: 'fib', type: 'fill_in_blank',
        content: [
          { type: 'text', text: '{a} pens at ${p}: ' },
          { type: 'blank', id: 'b', answer: 'a*p', answerType: 'numeric', acceptableAnswers: ['p*a'], width: 6 },
        ],
      }] }] }] }],
    };
    const { keyed } = seedForForm(doc, 'print:act:v1');
    const content = keyed.sections[0]!.rows[0]!.columns[0]!.blocks[0]!.content;
    expect(content[0]).toMatchObject({ text: '3 pens at $1.50: ' });
    expect(content[1]).toMatchObject({ answer: '4.50', acceptableAnswers: ['4.50'] });
  });
});

describe('a list stored WITHOUT spellings (the importer’s shape) still fixes its places (Fable review)', () => {
  // listSpecFromText stores `text` only when a spelling differs from the
  // number, so "1.25, 1.75, 2.25" arrives as plain values.
  it('2 × 1.25 from a text-less list → "2.50"', () => {
    const p: SeedVar = { name: 'p', spec: { kind: 'list', values: [1.25, 1.75, 2.25] } };
    for (const seed of ['s1', 's2', 's3']) {
      const v = deriveSeedValues([A2, p], seed);
      expect(displaySeededEntry('a*p', 'numeric', v)).toMatch(/^\d+\.\d{2}$/);
    }
  });

  it('whole-number lists fix nothing', () => {
    const n: SeedVar = { name: 'n', spec: { kind: 'list', values: [2, 4, 6] } };
    expect(displaySeededEntry('n/4', 'numeric', values([n]))).toMatch(/^(0\.5|1|1\.5)$/);
  });

  it('an absurd spelling (more than 10 places) fixes nothing rather than printing float noise', () => {
    const x: SeedVar = { name: 'x', spec: { kind: 'list', values: [0.1], text: ['0.10000000000000'] } };
    expect(displaySeededEntry('x*3', 'numeric', values([x]))).toBe('0.3');
  });
});

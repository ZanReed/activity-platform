// =============================================================================
// walk-integrity.test.ts — the malformed-document gate (eng-review B8/D10)
// -----------------------------------------------------------------------------
// Executes corpus.ts's INTEGRITY_CASES against gradeSection. The posture under
// test: a grader-read field PRESENT with a shape the schema cannot author
// throws MalformedDocumentError (the handler maps it to `malformed_document`);
// a field that is absent or authored empty grades exactly as it always has.
//
// These cases are SERVER-ONLY — deliberately outside the renderer parity half
// (see the corpus header). On today's handler path the upgrade step's Zod
// validation means no storable document can reach the walk broken; the gate is
// the ENGINE's own contract, so the safety stops depending on every caller
// remembering to validate first (the handler hands the document over through
// an `as never` cast, and S9 re-plumbs this path).
//
// Landed red-green per the ruling: every 'malformed' case was run against the
// ungated walk first and produced today's silent coercion — a confident
// verdict, a vanished answer, or a skipped solution — before the gate existed.
// =============================================================================

import { describe, expect, it } from 'vitest';
import { INTEGRITY_CASES } from '../src/server/grading/corpus.js';
import { emptySectionResponses } from '../src/check/wire.js';
import {
  gradeSection,
  MalformedDocumentError,
} from '../src/server/grading/index.js';

const SECTION_ID = 'sec-1';

function sectionOf(...blocks: Array<Record<string, unknown>>): unknown {
  return { id: SECTION_ID, rows: [{ columns: [{ blocks }] }] };
}

function grade(section: unknown, responses: Record<string, unknown>) {
  return gradeSection({
    document: { sections: [section] } as never,
    sectionId: SECTION_ID,
    responses: { ...emptySectionResponses(), ...responses } as never,
  });
}

describe('walk integrity: structurally broken fails typed', () => {
  for (const c of INTEGRITY_CASES.filter((c) => c.expect === 'malformed')) {
    it(c.name, () => {
      expect(() => grade(sectionOf(c.block), c.responses)).toThrow(
        MalformedDocumentError,
      );
    });
  }

  it('names the offending block id in the problems it carries', () => {
    // The error is what turns "a student says checking is broken" into a
    // findable defect — a typed failure that cannot say WHERE is barely
    // better than the silent mark it replaced.
    let caught: unknown;
    try {
      grade(
        sectionOf({ id: 'the-broken-one', type: 'multiple_choice', choices: 'x' }),
        {},
      );
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(MalformedDocumentError);
    const problems = (caught as MalformedDocumentError).problems;
    expect(problems.length).toBeGreaterThan(0);
    expect(problems.join(' ')).toContain('the-broken-one');
  });
});

describe('walk integrity: authored-empty grades exactly as today', () => {
  for (const c of INTEGRITY_CASES.filter((c) => c.expect !== 'malformed')) {
    it(c.name, () => {
      const result = grade(sectionOf(c.block), c.responses);
      for (const [id, expected] of Object.entries(
        c.expect as Record<string, string>,
      )) {
        if (expected === 'absent') {
          expect(result.items[id]).toBeUndefined();
        } else {
          expect(result.items[id]?.verdict).toBe(expected);
        }
      }
    });
  }
});

describe('walk integrity: the section skeleton', () => {
  // The same present-vs-absent rule, one level up. A skeleton coerced to
  // emptiness is the worst silent outcome of all: the whole section "checks"
  // successfully with zero items.
  it('throws when rows is present but not an array', () => {
    expect(() => grade({ id: SECTION_ID, rows: 'broken' }, {})).toThrow(
      MalformedDocumentError,
    );
  });

  it('throws when a row’s columns is present but not an array', () => {
    expect(() =>
      grade({ id: SECTION_ID, rows: [{ columns: 'broken' }] }, {}),
    ).toThrow(MalformedDocumentError);
  });

  it('throws when a column’s blocks is present but not an array', () => {
    expect(() =>
      grade({ id: SECTION_ID, rows: [{ columns: [{ blocks: 'broken' }] }] }, {}),
    ).toThrow(MalformedDocumentError);
  });

  it('throws when a blocks entry is not an object', () => {
    expect(() => grade(sectionOf('not-a-block' as never), {})).toThrow(
      MalformedDocumentError,
    );
  });

  it('grades an absent-rows section as authored-empty', () => {
    const result = grade({ id: SECTION_ID }, {});
    expect(result.items).toEqual({});
  });

  it('grades an empty-rows section as authored-empty', () => {
    const result = grade({ id: SECTION_ID, rows: [] }, {});
    expect(result.items).toEqual({});
  });
});

// =============================================================================
// numbering.test.ts — the page-numbering walk
// -----------------------------------------------------------------------------
// What these pins protect, in the order they matter:
//
//   1. THE SEQUENCE IS DOCUMENT ORDER, INCLUDING ACROSS COLUMNS. A two-column
//      row numbers all of column 1, then all of column 2 — the same order
//      blockIndex and the answer-key extractor walk. Get this wrong and a
//      printed worksheet's numbers zig-zag while its answer key counts
//      straight, which a teacher discovers while marking.
//
//   2. ONLY AN AUTO LABEL CONSUMES A SLOT. `custom` and `none` are
//      out-of-sequence by ruling; if either advanced the counter, every
//      question after an unnumbered one would be off by one — silently, and
//      identically on the sheet and the key, so nothing would look wrong until
//      someone counted.
//
//   3. THE TWO EXCLUSIONS ARE STRUCTURAL. Reference-panel blocks and nested
//      child blocks are absent from the map because the walk never reaches
//      them, not because a flag was passed correctly. These are the tests that
//      would fail if someone "simplified" the walk into a deep traversal.
// =============================================================================

import { describe, expect, it } from 'vitest';
import { buildNumbering } from '../src/numbering/numbering.js';
import type { SanitizedActivityDocument } from '../src/index.js';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

/** A minimal numbered block (fill_in_blank is page-numbered unconditionally). */
const question = (n: number, extra: object = {}) => ({
  id: id(n),
  type: 'fill_in_blank',
  content: [{ type: 'text', text: 'q', marks: [] }],
  ...extra,
});

/** A block type that is never page-numbered. */
const prose = (n: number) => ({
  id: id(n),
  type: 'paragraph',
  content: [{ type: 'text', text: 'prose', marks: [] }],
});

/** Rows of one column each — the ordinary single-column document. */
function doc(...blocks: object[]): SanitizedActivityDocument {
  return {
    sections: [
      {
        id: 'sec-1',
        rows: blocks.map((block, i) => ({
          id: `row-${i}`,
          columns: [{ id: `col-${i}`, blocks: [block] }],
        })),
      },
    ],
  } as unknown as SanitizedActivityDocument;
}

/** ONE row holding several columns — the multi-column case. */
function columnsDoc(...columns: object[][]): SanitizedActivityDocument {
  return {
    sections: [
      {
        id: 'sec-1',
        rows: [
          {
            id: 'row-0',
            columns: columns.map((blocks, i) => ({ id: `col-${i}`, blocks })),
          },
        ],
      },
    ],
  } as unknown as SanitizedActivityDocument;
}

const numbers = (map: Record<string, { kind: string; n?: number }>) =>
  Object.fromEntries(Object.entries(map).map(([k, v]) => [k, v.n ?? v.kind]));

describe('the sequence', () => {
  it('numbers questions 1, 2, 3 in document order', () => {
    const map = buildNumbering(doc(question(1), question(2), question(3)));
    expect(numbers(map)).toEqual({ [id(1)]: 1, [id(2)]: 2, [id(3)]: 3 });
  });

  it('skips blocks that are not page-numbered, without consuming a slot', () => {
    // Prose between two questions must not shift the second one to 3.
    const map = buildNumbering(doc(question(1), prose(9), question(2)));
    expect(numbers(map)).toEqual({ [id(1)]: 1, [id(2)]: 2 });
    expect(map[id(9)]).toBeUndefined();
  });

  it('is COLUMN-MAJOR inside a multi-column row', () => {
    // Left column top-to-bottom, THEN right column — the order every other
    // walk in this package uses. The alternative (visual left-right reading
    // order) would disagree with the answer-key extractor, which walks this way.
    const map = buildNumbering(
      columnsDoc([question(1), question(2)], [question(3), question(4)]),
    );
    expect(numbers(map)).toEqual({
      [id(1)]: 1,
      [id(2)]: 2,
      [id(3)]: 3,
      [id(4)]: 4,
    });
  });

  it('continues the sequence across sections', () => {
    const two = {
      sections: [
        {
          id: 'a',
          rows: [{ id: 'r', columns: [{ id: 'c', blocks: [question(1)] }] }],
        },
        {
          id: 'b',
          rows: [{ id: 'r2', columns: [{ id: 'c2', blocks: [question(2)] }] }],
        },
      ],
    } as unknown as SanitizedActivityDocument;
    // One worksheet, one numbering — a section break is not a reset.
    expect(numbers(buildNumbering(two))).toEqual({ [id(1)]: 1, [id(2)]: 2 });
  });
});

describe('label modes (ruling N5)', () => {
  it('custom shows its text and does NOT consume a slot', () => {
    const map = buildNumbering(
      doc(
        question(1),
        question(2, { label: { mode: 'custom', text: 'Warm-up' } }),
        question(3),
      ),
    );
    expect(map[id(1)]).toEqual({ kind: 'number', n: 1 });
    expect(map[id(2)]).toEqual({ kind: 'custom', text: 'Warm-up' });
    // THE POINT: the third block is 2, not 3.
    expect(map[id(3)]).toEqual({ kind: 'number', n: 2 });
  });

  it('none is absent from the map and does NOT consume a slot', () => {
    const map = buildNumbering(
      doc(question(1), question(2, { label: { mode: 'none' } }), question(3)),
    );
    expect(map[id(2)]).toBeUndefined();
    expect(map[id(3)]).toEqual({ kind: 'number', n: 2 });
  });

  it('an explicit auto label behaves exactly like an absent one', () => {
    const explicit = buildNumbering(doc(question(1, { label: { mode: 'auto' } })));
    const absent = buildNumbering(doc(question(1)));
    expect(explicit).toEqual(absent);
  });

  it('the three types that gained the field at V1 honour it', () => {
    // short_answer and essay became numbered at answer-key E7;
    // faded_worked_example has always been one numbered box. Before V1 none of
    // them could carry a label at all, so `none` was unreachable for them.
    for (const type of ['short_answer', 'essay', 'faded_worked_example']) {
      const numbered = buildNumbering(
        doc({ id: id(1), type, prompt: [], content: [], title: 't' }),
      );
      expect(numbered[id(1)], `${type} numbered`).toEqual({ kind: 'number', n: 1 });

      const suppressed = buildNumbering(
        doc({
          id: id(1),
          type,
          prompt: [],
          content: [],
          title: 't',
          label: { mode: 'none' },
        }),
      );
      expect(suppressed[id(1)], `${type} suppressed`).toBeUndefined();
    }
  });
});

describe('the two structural exclusions', () => {
  it('never walks the reference panel', () => {
    // A formula sheet may legitimately contain a question-shaped block. It
    // renders through the SAME BlockSlot as section content, so the guarantee
    // has to be that its id is never in the map — not that a prop was passed.
    const withPanel = {
      sections: [
        {
          id: 'sec-1',
          rows: [{ id: 'r', columns: [{ id: 'c', blocks: [question(1)] }] }],
        },
      ],
      referencePanel: { title: 'Formulas', blocks: [question(99)] },
    } as unknown as SanitizedActivityDocument;

    const map = buildNumbering(withPanel);
    expect(map[id(1)]).toEqual({ kind: 'number', n: 1 });
    expect(map[id(99)]).toBeUndefined();
  });

  it('never descends into nested child blocks', () => {
    // The faded example is ONE numbered problem; its steps are lettered by
    // their own <ol>. If the walk descended, each step would eat a worksheet
    // number and every question after the box would shift.
    const box = {
      id: id(1),
      type: 'faded_worked_example',
      title: 'Worked',
      content: [question(50), question(51)],
    };
    const map = buildNumbering(doc(box, question(2)));

    expect(map[id(1)]).toEqual({ kind: 'number', n: 1 });
    expect(map[id(50)]).toBeUndefined();
    expect(map[id(51)]).toBeUndefined();
    // The box counted once, so the next question is 2.
    expect(map[id(2)]).toEqual({ kind: 'number', n: 2 });
  });
});

describe('degenerate documents', () => {
  it('an empty document yields an empty map', () => {
    expect(buildNumbering(doc())).toEqual({});
  });

  it('a document with no numbered blocks yields an empty map', () => {
    // The map being empty is what makes "no gutter, no grid, no layout shift"
    // true for a prose-only activity.
    expect(buildNumbering(doc(prose(1), prose(2)))).toEqual({});
  });

  it('a block without a string id is skipped rather than crashing', () => {
    const map = buildNumbering(doc({ type: 'fill_in_blank', content: [] }, question(2)));
    expect(numbers(map)).toEqual({ [id(2)]: 1 });
  });

  it('is pure — the same document twice gives an equal map', () => {
    const d = doc(question(1), question(2));
    expect(buildNumbering(d)).toEqual(buildNumbering(d));
  });
});

// -----------------------------------------------------------------------------
// Sub-part lettering (ruling N7) — the decision, not the markup
// -----------------------------------------------------------------------------
// The rendering is pinned in the component tests; what is worth pinning here is
// that all three exclusions come from DATA rather than from flags, because that
// is what makes them hard to break by accident.

describe('sub-part lettering preconditions', () => {
  const letters = (label: { kind: string } | undefined, blanks: number) =>
    label?.kind === 'number' && blanks >= 2;

  it('letters a numbered problem with two or more blanks', () => {
    expect(letters({ kind: 'number' }, 2)).toBe(true);
    expect(letters({ kind: 'number' }, 5)).toBe(true);
  });

  it('does NOT letter a single-blank problem — nothing to tell apart', () => {
    expect(letters({ kind: 'number' }, 1)).toBe(false);
  });

  it('does NOT letter a custom-labelled problem — it is out of sequence', () => {
    expect(letters({ kind: 'custom' }, 3)).toBe(false);
  });

  it('does NOT letter a nested step — ChildBlocks passes no label at all', () => {
    // The faded example letters its own steps with a real <ol>; a second
    // lettering scheme inside it would collide with that one.
    expect(letters(undefined, 3)).toBe(false);
  });
});

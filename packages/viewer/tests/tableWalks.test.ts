import { describe, it, expect } from 'vitest';
import { ActivityDocument, createEmptyDocument, TableBlock } from '@activity/schema';
import type { Block } from '@activity/schema';
import { inventorySection, MalformedDocumentError } from '../src/server/grading/walk.js';
import { indexDocument } from '../src/container/blockIndex.js';
import { extractAnswerKey } from '../src/answer-key/extract.js';
import { sanitizeActivityDocument } from '../src/sanitize/sanitize.js';
import type { SanitizedActivityDocument } from '../src/sanitize/sanitized-types.js';

// =============================================================================
// tableWalks.test.ts — THE QUARTET (table-block eng review, Q1–Q3)
// -----------------------------------------------------------------------------
// The table block's entire design rests on ONE claim: a blank sitting in a
// table cell needs no new grading, checking, sanitizing or answer-key code,
// because four independent walks already find in-band blanks STRUCTURALLY at
// any depth.
//
// That claim is true only while table rows and cells carry no `type` field.
// `looksLikeBlockArray` (blockIndex.ts) fires on any array whose elements all
// carry BOTH a string `id` and a string `type`, and three of the four walks
// stop descending there. Add `type: 'table_row'` and those three skip the whole
// table — while the sanitizer, which never stops, keeps stripping. So nothing
// leaks and no leak suite goes red: the student's answer is simply submitted,
// stored, and NEVER SCORED. walk.ts calls that the worst kind of failure.
//
// WHY THIS FILE EXISTS SEPARATELY FROM THE SCHEMA'S OWN SHAPE TEST. That one
// asserts the shape (no `type` on rows/cells). This one asserts the CONSEQUENCE
// — what each walk actually returns — because a shape assertion restates the
// schema and would keep passing if the heuristic itself changed underneath it.
// This repo has watched a declaration-vs-declaration guard survive the deletion
// of the only thing that made it true (registry `numbered`, four months). A
// guard bound to OUTPUT cannot do that.
//
// Add a walk to the codebase and it belongs here too.
// =============================================================================

const BLANK_ID = 'b1111111-1111-4111-8111-111111111111';
const SECOND_BLANK_ID = 'b2222222-2222-4222-8222-222222222222';
const TABLE_ID = 'aaaaaaaa-1111-4111-8111-111111111111';
const uuid = () => crypto.randomUUID();
const text = (t: string) => ({ type: 'text' as const, text: t, marks: [] });

/** A rates table with two answered cells — the pilot's real shape. */
function tableBlock(): Block {
  return TableBlock.parse({
    id: TABLE_ID,
    type: 'table',
    headerRow: true,
    columnAligns: ['left', 'right'],
    rows: [
      {
        id: uuid(),
        cells: [
          { id: uuid(), content: [text('Kilograms')] },
          { id: uuid(), content: [text('Cost ($)')] },
        ],
      },
      {
        id: uuid(),
        cells: [
          { id: uuid(), content: [text('2')] },
          {
            id: uuid(),
            content: [
              {
                type: 'blank',
                id: BLANK_ID,
                answer: '9.00',
                acceptableAnswers: ['9'],
                answerType: 'numeric',
              },
            ],
          },
        ],
      },
      {
        id: uuid(),
        cells: [
          { id: uuid(), content: [text('3')] },
          {
            id: uuid(),
            content: [
              {
                type: 'blank',
                id: SECOND_BLANK_ID,
                answer: '13.50',
                acceptableAnswers: [],
                answerType: 'numeric',
              },
            ],
          },
        ],
      },
    ],
  }) as Block;
}

function docWithTable(): ActivityDocument {
  const doc = createEmptyDocument({ title: 'Rates' });
  const raw = JSON.parse(JSON.stringify(doc)) as ActivityDocument;
  raw.sections[0]!.rows = [
    {
      id: uuid(),
      gridLines: 'inherit',
      columns: [{ id: uuid(), blocks: [tableBlock()] }],
    },
  ];
  return ActivityDocument.parse(raw);
}

describe('the quartet: every walk reaches a blank inside a table cell', () => {
  const doc = docWithTable();

  // ---- Q1: the SERVER's grading keys ---------------------------------------
  it('Q1 the grading walk returns a key for each cell blank, attributed to the table', () => {
    const inv = inventorySection(doc.sections[0]! as never);
    const group = inv.blankGroupsByBlock.find((g) => g.blockId === TABLE_ID);
    expect(
      group,
      'the grading walk produced NO keys for the table — a student answer here ' +
        'would be submitted, stored and never scored',
    ).toBeDefined();
    expect(group!.keys.map((k) => k.id)).toEqual([BLANK_ID, SECOND_BLANK_ID]);
    // Not just present — carrying the real key, so a mark can actually be made.
    expect(group!.keys[0]!.answers).toEqual(['9.00', '9']);
    expect(group!.keys[0]!.answerType).toBe('numeric');
  });

  it('Q1b the keys arrive in READING ORDER, which is what `~` grouping means', () => {
    const inv = inventorySection(doc.sections[0]! as never);
    const keys = inv.blankGroupsByBlock.find((g) => g.blockId === TABLE_ID)!.keys;
    expect(keys.map((k) => k.id)).toEqual([BLANK_ID, SECOND_BLANK_ID]);
  });

  // ---- Q2: the CLIENT's check payload --------------------------------------
  it('Q2 the client index lists each cell blank, so the answers are SENT', () => {
    const served = sanitizeActivityDocument(doc) as SanitizedActivityDocument;
    const index = indexDocument(served);
    const section = index.sections[0]!;
    expect(section.items.blanks ?? []).toEqual([BLANK_ID, SECOND_BLANK_ID]);
    // And the block itself is in the section's roster, not silently unsupported.
    expect(section.blockIds).toContain(TABLE_ID);
    expect(index.unsupported).toEqual([]);
  });

  // ---- Q3: the TEACHER's answer key ----------------------------------------
  it('Q3 the answer key carries each cell answer, keyed by the table block', () => {
    const key = extractAnswerKey(doc);
    expect(key[TABLE_ID]?.blanks).toEqual({
      [BLANK_ID]: '9.00',
      [SECOND_BLANK_ID]: '13.50',
    });
  });

  // ---- The fourth walk, and the asymmetry that makes this file necessary ---
  it('the sanitizer strips the cell answers (it never stops descending)', () => {
    const served = JSON.stringify(sanitizeActivityDocument(doc));
    expect(served).not.toContain('9.00');
    expect(served).not.toContain('13.50');
    // The blank itself SURVIVES — the student needs an input to type into.
    expect(served).toContain(BLANK_ID);
  });
});

describe('the landmine, demonstrated', () => {
  // This is the test that gives the schema comment its teeth. It builds the
  // shape a future edit would reach for and shows what breaks — and, just as
  // importantly, what does NOT break, which is why nobody would notice.
  const typedRowsDoc = () => {
    const doc = docWithTable();
    const table = doc.sections[0]!.rows[0]!.columns[0]!.blocks[0] as unknown as {
      rows: Array<Record<string, unknown>>;
    };
    for (const row of table.rows) row.type = 'table_row';
    return doc;
  };

  it('a `type` on rows makes the grading walk skip the table ENTIRELY', () => {
    const inv = inventorySection(typedRowsDoc().sections[0]! as never);
    expect(inv.blankGroupsByBlock.find((g) => g.blockId === TABLE_ID)).toBeUndefined();
  });

  it('…while the sanitizer still strips, so NOTHING LEAKS and no alarm sounds', () => {
    const served = JSON.stringify(sanitizeActivityDocument(typedRowsDoc()));
    expect(served).not.toContain('9.00');
  });
});

describe('Q6 — the integrity gate covers a table skeleton', () => {
  // The BLANKS are gated by the in-band walk already (checkKeyFields runs on
  // every blank it finds, at any depth). These pin the half that walk cannot
  // see: a skeleton present with a shape the schema cannot author yields no
  // keys at all, which reads to the student as a clean check of an unanswered
  // table rather than as the broken document it is.
  const sectionWith = (block: unknown) => ({
    id: 's1',
    rows: [{ id: 'r', columns: [{ id: 'c', blocks: [block] }] }],
  });
  const problemsFor = (block: unknown): string[] => {
    try {
      inventorySection(sectionWith(block) as never, { integrity: 'throw' });
      return [];
    } catch (err) {
      return err instanceof MalformedDocumentError ? err.problems : ['<wrong error>'];
    }
  };

  it('flags rows that is present but not an array', () => {
    expect(problemsFor({ id: 't', type: 'table', rows: 'nope' })).toEqual([
      'block t: rows is not an array',
    ]);
  });

  it('flags a row whose cells is not an array', () => {
    expect(
      problemsFor({ id: 't', type: 'table', rows: [{ id: 'r', cells: { a: 1 } }] }),
    ).toEqual(['block t: a row whose cells is not an array']);
  });

  it('flags a cell whose content is not an array', () => {
    expect(
      problemsFor({
        id: 't',
        type: 'table',
        rows: [{ id: 'r', cells: [{ id: 'c', content: 'nope' }] }],
      }),
    ).toEqual(['block t: a cell whose content is not an array']);
  });

  it('flags a malformed BLANK in a cell — the in-band walk, unchanged', () => {
    expect(
      problemsFor({
        id: 't',
        type: 'table',
        rows: [
          { id: 'r', cells: [{ id: 'c', content: [{ type: 'blank', id: 'b', answer: 42 }] }] },
        ],
      }),
    ).toEqual(['block t: blank b: answer is not a string']);
  });

  it('an AUTHORED-EMPTY table is fine — a teacher mid-edit is not corruption', () => {
    expect(problemsFor({ id: 't', type: 'table', rows: [] })).toEqual([]);
    expect(problemsFor({ id: 't', type: 'table' })).toEqual([]);
  });
});

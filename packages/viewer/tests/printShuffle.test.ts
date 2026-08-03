// =============================================================================
// printShuffle.test.ts — paper never shows the authored order (S5.5 D15A)
// -----------------------------------------------------------------------------
// The defect this closes was found by the eng review's outside voice, AFTER the
// answer-channel design had already been ruled: the teacher print path
// sanitizes without the per-student serve shuffle, so an ordering question —
// whose authored sequence IS the answer — would have printed the answer as the
// worksheet. Every classroom copy. The renderer had always shuffled on print;
// nothing in the viewer did, and no rule in the parity gate named it.
//
// The pins here are therefore about a PROPERTY, not a permutation:
//
//   - the authored order does not reach paper;
//   - the same seed reprints identically (a key printed last week still
//     matches this week's reprint) while a different seed — a version —
//     rearranges;
//   - each block shuffles independently, so two ordering questions on one sheet
//     do not share an arrangement;
//   - and the one that ties this slice together: the ANSWER KEY SURVIVES. The
//     key is id-keyed and components derive positions at render time, so a
//     shuffled sheet and its key must still agree. If they ever stop agreeing,
//     a teacher marks thirty sheets against the wrong letters.
//
// SANITIZER_REV is pinned here too. The whole reason this declaration sits on
// the PrintSpec rather than in sanitize.serveShuffled is that print must not
// move the read cache's fingerprint; a test is how that stays true.
// =============================================================================

import { describe, expect, it } from 'vitest';
import {
  SANITIZER_REV,
  applyPrintShuffles,
  blockRegistry,
  printSeed,
  registeredBlockTypes,
  seededShuffle,
} from '../src/index.js';
import { sanitizedFixtureDocument } from '../src/fixtures/index.js';
import type { SanitizedActivityDocument } from '../src/index.js';

const ACTIVITY = 'aaaaaaaa-0000-4000-8000-000000000001';

/** Every block of a type, flattened out of a document. */
function blocksOfType(doc: SanitizedActivityDocument, type: string) {
  const out: Array<Record<string, unknown>> = [];
  const visit = (block: Record<string, unknown>): void => {
    if (block.type === type) out.push(block);
    for (const value of Object.values(block)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item && typeof item === 'object' && 'type' in item) {
            visit(item as Record<string, unknown>);
          }
        }
      }
    }
  };
  for (const section of doc.sections) {
    for (const row of section.rows) {
      for (const column of row.columns) {
        for (const block of column.blocks) {
          visit(block as unknown as Record<string, unknown>);
        }
      }
    }
  }
  return out;
}

const itemIds = (block: Record<string, unknown>) =>
  (block.items as Array<{ id: string }>).map((item) => item.id);

describe('the authored order does not reach paper', () => {
  it('ordering items are rearranged by the print transform', () => {
    const doc = sanitizedFixtureDocument();
    const before = blocksOfType(doc, 'ordering').map(itemIds);
    const after = blocksOfType(
      applyPrintShuffles(doc, printSeed(ACTIVITY)),
      'ordering',
    ).map(itemIds);

    expect(before.length).toBeGreaterThan(0);
    expect(after).not.toEqual(before);
    // A permutation, not a rewrite: the same items, reordered.
    expect([...after[0]!].sort()).toEqual([...before[0]!].sort());
  });

  it('leaves the source document untouched (pure)', () => {
    const doc = sanitizedFixtureDocument();
    const before = blocksOfType(doc, 'ordering').map(itemIds);
    applyPrintShuffles(doc, printSeed(ACTIVITY));

    expect(blocksOfType(doc, 'ordering').map(itemIds)).toEqual(before);
  });

  it('touches only what the registry declares', () => {
    // multiple_choice declares no print shuffle yet (that lands with the
    // version coda, behind its lockChoiceOrder flag), so its choices must come
    // through in the order they were served.
    const doc = sanitizedFixtureDocument();
    const choiceIds = (d: SanitizedActivityDocument) =>
      blocksOfType(d, 'multiple_choice').map((block) =>
        (block.choices as Array<{ id: string }>).map((c) => c.id),
      );

    expect(choiceIds(applyPrintShuffles(doc, printSeed(ACTIVITY)))).toEqual(
      choiceIds(doc),
    );
  });
});

describe('seeding', () => {
  it('the same seed reprints an identical sheet', () => {
    const doc = sanitizedFixtureDocument();
    const once = applyPrintShuffles(doc, printSeed(ACTIVITY));
    const twice = applyPrintShuffles(doc, printSeed(ACTIVITY));

    // What a teacher depends on without ever thinking about it: the key they
    // printed last week still matches the sheet they reprint today.
    expect(blocksOfType(twice, 'ordering').map(itemIds)).toEqual(
      blocksOfType(once, 'ordering').map(itemIds),
    );
  });

  it('a different version rearranges the sheet', () => {
    const doc = sanitizedFixtureDocument();
    const v1 = applyPrintShuffles(doc, printSeed(ACTIVITY, 1));
    const v2 = applyPrintShuffles(doc, printSeed(ACTIVITY, 2));

    expect(blocksOfType(v2, 'ordering').map(itemIds)).not.toEqual(
      blocksOfType(v1, 'ordering').map(itemIds),
    );
  });

  it('sub-seeds per block, so two questions never share an arrangement', () => {
    // Two ordering blocks with IDENTICAL items and different ids: if the seed
    // did not include the block id they would shuffle in lockstep, which is
    // both a weaker anti-copying story and an obvious tell.
    const items = Array.from({ length: 6 }, (_, i) => ({
      id: `item-${i}`,
      content: [{ type: 'text', text: `step ${i}` }],
    }));
    const doc = {
      sections: [
        {
          id: 'sec-1',
          rows: [
            {
              id: 'row-1',
              columns: [
                {
                  id: 'col-1',
                  blocks: [
                    { id: 'block-a', type: 'ordering', prompt: [], items },
                    { id: 'block-b', type: 'ordering', prompt: [], items },
                  ],
                },
              ],
            },
          ],
        },
      ],
    } as unknown as SanitizedActivityDocument;

    const shuffled = applyPrintShuffles(doc, printSeed(ACTIVITY));
    const [a, b] = blocksOfType(shuffled, 'ordering');

    expect(itemIds(a!)).not.toEqual(itemIds(b!));
  });
});

describe('a shuffle never deals the answer back', () => {
  // The renderer has always guaranteed this and documents why; the viewer had
  // not. A fair shuffle returns the identity 1/n! of the time — negligible for
  // six items, but ordering blocks are allowed as few as TWO, where it is one
  // student in two receiving a pre-solved question.

  it('never returns the identity, at any size, for any seed', () => {
    for (let size = 2; size <= 8; size++) {
      const items = Array.from({ length: size }, (_, i) => `i${i}`);
      for (let seed = 0; seed < 200; seed++) {
        expect(
          seededShuffle(items, `seed-${size}-${seed}`),
          `size ${size}, seed ${seed} dealt the authored order back`,
        ).not.toEqual(items);
      }
    }
  });

  it('is still a permutation, and still deterministic', () => {
    const items = ['a', 'b', 'c', 'd'];
    const once = seededShuffle(items, 'k');

    expect([...once].sort()).toEqual([...items].sort());
    expect(seededShuffle(items, 'k')).toEqual(once);
  });

  it('a single item is returned untouched', () => {
    expect(seededShuffle(['only'], 'k')).toEqual(['only']);
    expect(seededShuffle([], 'k')).toEqual([]);
  });
});

describe('the declaration is where it is for a reason', () => {
  it('SANITIZER_REV is unmoved by the print declaration', () => {
    // The deployed value. Print shuffles live on the PrintSpec precisely so
    // they cannot orphan the read cache or force a get-activity redeploy; if
    // this ever fails, someone moved the declaration into the sanitize spec and
    // the deploy discipline changed with it.
    expect(SANITIZER_REV).toBe('1-f8328527');
  });

  it('every serve-shuffled field is ALSO print-shuffled', () => {
    // THE GUARD FOR THE DEFECT D15A FIXED, generalised so the next block type
    // cannot repeat it.
    //
    // A field is declared serveShuffled for exactly one reason: its authored
    // order is the answer, so the server must not send it as authored. The
    // teacher print path does not run the serve shuffle (there is no student to
    // seed it with), so any such field missing from print.shuffled goes onto
    // paper in authored order — which is to say, the worksheet IS the key.
    //
    // The two declarations overlapping is therefore correct, not a smell: the
    // paths are disjoint (students take one, print takes the other) and each
    // carries its own seed.
    for (const type of registeredBlockTypes) {
      const entry = blockRegistry[type];
      const printed = new Set(entry.print.shuffled ?? []);
      for (const served of entry.sanitize.serveShuffled ?? []) {
        expect(
          printed.has(served),
          `${type}.${served} is serve-shuffled because its authored order is ` +
            'the answer, but is not print-shuffled — teacher print would put ' +
            'that answer on paper',
        ).toBe(true);
      }
    }
  });
});

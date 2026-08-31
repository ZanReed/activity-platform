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

/** Versions 2..25 — the seed space the "a different seed rearranges" rows walk. */
const OTHER_VERSIONS = Array.from({ length: 24 }, (_, i) => i + 2);

const isEqual = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

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
    // matching's BANK is shuffled by the component (D21C), not by this
    // transform, so the registry declares no print shuffle for it and the data
    // must come through untouched. If that ever changes the bank would be
    // shuffled twice — harmless in output, but a second mechanism nobody
    // reading one declaration would predict.
    const doc = sanitizedFixtureDocument();
    const targetIds = (d: SanitizedActivityDocument) =>
      blocksOfType(d, 'matching').map((block) =>
        (block.targets as Array<{ id: string }>).map((t) => t.id),
      );

    expect(targetIds(applyPrintShuffles(doc, printSeed(ACTIVITY)))).toEqual(
      targetIds(doc),
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

  it('a different version rearranges the sheet, for most versions', () => {
    // NOT "version 2 differs from version 1". Two seeds are two independent
    // non-identity deals, and nothing stops them coinciding — on a two-item
    // block they ALWAYS do (there is only one non-identity order). Asserting
    // a single pair is a dice roll whose odds move every time a fixture
    // changes the id sequence; it came up tails once (TODOS, 2026-08-22).
    // The property that is actually true: across the seed space, a different
    // seed usually rearranges.
    const doc = sanitizedFixtureDocument();
    const v1 = blocksOfType(
      applyPrintShuffles(doc, printSeed(ACTIVITY, 1)),
      'ordering',
    ).map(itemIds);

    const sameAsV1 = OTHER_VERSIONS.filter((v) =>
      isEqual(
        blocksOfType(applyPrintShuffles(doc, printSeed(ACTIVITY, v)), 'ordering').map(itemIds),
        v1,
      ),
    );
    expect(
      sameAsV1.length,
      `versions ${sameAsV1.join(', ')} reprinted version 1's ordering arrangement`,
    ).toBeLessThan(OTHER_VERSIONS.length / 2);
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

describe('print versions (S5.5 T9/T10)', () => {
  const choiceIds = (doc: SanitizedActivityDocument) =>
    blocksOfType(doc, 'multiple_choice').map((block) =>
      (block.choices as Array<{ id: string }>).map((c) => c.id),
    );

  it('version 1 already differs from authored, and other versions mostly differ from it', () => {
    const doc = sanitizedFixtureDocument();
    const v1 = choiceIds(applyPrintShuffles(doc, printSeed(ACTIVITY, 1)));

    // Every printed sheet shuffles — including the default one. A teacher who
    // never opens the version selector still should not hand out the authored
    // order. This half is a GUARANTEE (seededShuffle never deals the identity,
    // pinned below), so one seed is enough to pin it.
    expect(v1).not.toEqual(choiceIds(doc));

    // This half is NOT a guarantee — see the ordering test above for why a
    // single v2-vs-v1 pair is a coin flip — so it is asserted over the seed
    // space, not for one pair.
    const sameAsV1 = OTHER_VERSIONS.filter((v) =>
      isEqual(choiceIds(applyPrintShuffles(doc, printSeed(ACTIVITY, v))), v1),
    );
    expect(
      sameAsV1.length,
      `versions ${sameAsV1.join(', ')} reprinted version 1's choice arrangement`,
    ).toBeLessThan(OTHER_VERSIONS.length / 2);
  });

  it('lockChoiceOrder keeps a question in its authored order (D17A)', () => {
    // The question this exists for: "all of the above" has to stay last, and no
    // heuristic can read "both A and B" reliably enough to decide for a teacher.
    const doc = sanitizedFixtureDocument();
    const locked = structuredClone(doc);
    for (const block of blocksOfType(locked, 'multiple_choice')) {
      block.lockChoiceOrder = true;
    }

    const printed = applyPrintShuffles(locked, printSeed(ACTIVITY, 3));
    expect(choiceIds(printed)).toEqual(choiceIds(doc));

    // …and it is genuinely the flag doing it, not the seed happening to agree.
    expect(choiceIds(applyPrintShuffles(doc, printSeed(ACTIVITY, 3)))).not.toEqual(
      choiceIds(doc),
    );
  });

  it('the lock is per BLOCK, not per document', () => {
    const doc = sanitizedFixtureDocument();
    const mixed = structuredClone(doc);
    const blocks = blocksOfType(mixed, 'multiple_choice');
    const first = blocks[0];
    expect(first, 'fixture has no multiple_choice block').toBeDefined();
    first!.lockChoiceOrder = true;

    const printed = applyPrintShuffles(mixed, printSeed(ACTIVITY, 2));
    const printedBlocks = blocksOfType(printed, 'multiple_choice');
    const authoredBlocks = blocksOfType(doc, 'multiple_choice');

    const ids = (b: Record<string, unknown>) =>
      (b.choices as Array<{ id: string }>).map((c) => c.id);

    // The locked one held its order; ordering questions around it still moved,
    // so one question opting out cannot quietly disable the whole sheet.
    expect(ids(printedBlocks[0]!)).toEqual(ids(authoredBlocks[0]!));
    expect(
      blocksOfType(printed, 'ordering').map(itemIds),
    ).not.toEqual(blocksOfType(doc, 'ordering').map(itemIds));
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
    //
    // MOVED 2026-08-20, deliberately: '1-f8328527' → '1-87a5e78b'. The
    // answer-key slice added `answer` + `solution` to short_answer's and
    // essay's strip lists, which IS a sanitize-spec change, so the rev moving
    // is the mechanism working — it orphans every stale read-cache row the
    // moment the new get-activity is live. The pin is not here to freeze the
    // value; it is here to make a move IMPOSSIBLE TO MAKE ACCIDENTALLY, because
    // a moved rev means both server bundles must be regenerated in this commit
    // and a get-activity redeploy must be queued (CLAUDE.md's deploy rule, and
    // ruling E5.4's ordering constraint: no answer-bearing activity may be
    // published before that redeploy is verified live).
    //
    // MOVED AGAIN 2026-08-21, deliberately: '1-87a5e78b' → '1-07e6311d'. The
    // table block added a registry entry whose sanitize spec declares
    // `inlineBlankSecrets` — a sanitize-spec change, so the rev moving is again
    // the mechanism working. Both server bundles are regenerated in the same
    // commit, and the get-activity redeploy is queued as a pending author
    // action under the arc's capability-before-content gate (no table can reach
    // a draft until both functions are live, whichever path writes it).
    // MOVED AGAIN 2026-08-23, and this one is a DIFFERENT KIND of move —
    // '1-07e6311d' → '2-59a68ddc'. Note the leading digit: SANITIZER_ALGO_REV
    // went 1 → 2 BY HAND. Every move above was a declaration change, where the
    // hash recomputes itself and the mechanism works unattended. This time the
    // per-block strips began covering `referencePanel` (a live answer-key leak
    // — the panel takes the full Block union and the strips had never run
    // there) while every sanitize declaration stayed byte-identical. So the
    // computed half would NOT have moved, this pin would NOT have failed, and
    // every already-cached activity would have gone on serving the leaked key
    // from the read cache after the fix shipped.
    //
    // The lesson for the next person: when a fix changes the TRANSFORM rather
    // than a declaration, this test staying green is the warning sign, not the
    // all-clear. Bump SANITIZER_ALGO_REV by hand — that is the only thing that
    // orphans the cache. Same redeploy discipline as every move above.
    //
    // MOVED AGAIN 2026-08-24, deliberately: '2-59a68ddc' → '2-aa0152c4'. The
    // schema dropped `partialCredit` from interactive_graph, so its registry
    // strip entry (and the sanitized-types Omit) went with it — a declaration
    // change, the hash recomputed itself, the mechanism working. Both server
    // bundles regenerate in the same commit; get-activity redeploy queued as a
    // pending author action.
    //
    // AND AGAIN same day: '2-aa0152c4' → '2-050ad6e2'. The misconception-id
    // slice added `choices[].misconceptionId` to multiple_choice's strip list
    // (the distractor→registry binding is server-side metadata; a pre-check
    // client could otherwise read which wrong answers were anticipated).
    // Declaration change, hash recomputed itself, same redeploy discipline.
    //
    // MOVED 2026-09-01: '2-050ad6e2' → '2-ea886923'. Unit-bearing numeric
    // blanks added `unit` + `acceptableUnits` to BLANK_SECRET_FIELDS (the
    // required unit is half the answer; a served unit would prompt the very
    // recall the blank tests). Declaration change, hash recomputed itself,
    // get-activity redeploy queued as a pending author action.
    expect(SANITIZER_REV).toBe('2-ea886923');
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

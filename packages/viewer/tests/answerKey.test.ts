// =============================================================================
// answerKey.test.ts — the teacher answer-key extraction (S5.5 T1, ruling D3A)
// -----------------------------------------------------------------------------
// What these pins protect, in the order they matter:
//
//   1. THE KEY IS POSITION-FREE. It names answers by id and never by "B" or
//      "third". Print shuffles presentation per version (D15A/D5), so a key
//      that baked in a letter would be correct for Version 1 and quietly wrong
//      for every version after it — a teacher marking thirty sheets against a
//      key that disagrees with them. The invariance tests below are the real
//      subject of this file: shuffling a block's PRESENTATION must not change
//      its key, while reordering an ordering block's items — where the authored
//      order IS the answer — must.
//
//   2. NOTHING GRADABLE IS SILENTLY UNKEYED. The roster guard forces every
//      auto_gradable type into a justified bucket, and a non-vacuity pin proves
//      each bucket's claim by actually extracting from that type's fixtures. A
//      coverage map that is merely declarative is the failure it exists to
//      prevent (S4's CORPUS_COVERAGE, same shape).
//
//   3. THE READ PATH NEVER CARRIES THIS CODE. The get-activity bundle exists to
//      strip answers; shipping the module that reads them into it would be the
//      V9 leak class again, so absence is asserted against the committed bundle
//      rather than trusted to a comment.
// =============================================================================

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  renderGraphSvg,
  renderNumberLineSvg,
} from '@activity/graph-kit/static-svg';
import type { Block } from '@activity/schema';
import {
  ANSWER_KEY_COVERAGE,
  ANSWER_KEY_INK,
  extractAnswerKey,
  extractBlockAnswerKey,
  familyOf,
  registeredBlockTypes,
} from '../src/index.js';
import { blockRegistry } from '../src/registry/registry.js';
import type { BlockType } from '../src/registry/types.js';
import {
  authoredBlockFixture,
  authoredFixtureDocument,
  authoredVariantFixtures,
} from '../src/fixtures/index.js';

const gradableTypes = registeredBlockTypes.filter(
  (type) => blockRegistry[type].family === 'auto_gradable',
);

describe('in-band answers (blanks + math gaps)', () => {
  it('prefills a blank with its CANONICAL answer, never an alternate', () => {
    const block = authoredBlockFixture('fill_in_blank');
    const answers = Object.values(extractBlockAnswerKey(block).blanks ?? {});

    // The fixture blank is answer '3' with acceptableAnswers ['3.0']. Grading
    // still accepts both; a printed key wants one definitive value on the line.
    expect(answers).toEqual(['3']);
    expect(answers).not.toContain('3.0');
  });

  it('extracts math-gap answers keyed by prompt id', () => {
    // NOTE: this is a deliberate VIEWER-ONLY improvement (recorded in
    // ANSWER_KEY_COVERAGE). The renderer never filled math gaps in its answer
    // key — renderMathBlock is called without showAnswers — so a gap-bearing
    // equation, a graded question, printed a key with nothing in it.
    const block = authoredBlockFixture('math_block');
    expect(extractBlockAnswerKey(block).mathGaps).toEqual({ g1: '3' });
  });

  it('attributes a nested step’s blanks to the STEP, not its container', () => {
    const container = authoredBlockFixture('faded_worked_example');
    const map = extractAnswerKey(authoredFixtureDocument());

    // The container answers through its children (its coverage claim), so it
    // holds no key of its own...
    expect(extractBlockAnswerKey(container)).toEqual({});
    expect(map[container.id]).toBeUndefined();

    // ...and the nested fill_in_blank step keys by its OWN block id, which is
    // what lets a component look itself up without knowing it is nested.
    const step = (container as { content: { id: string }[] }).content[0]!;
    expect(Object.values(map[step.id]?.blanks ?? {})).toEqual(['4']);
  });
});

describe('the key is position-free (the property every print version depends on)', () => {
  it('multiple_choice: reordering the CHOICES leaves the key identical', () => {
    const block = authoredBlockFixture('multiple_choice') as {
      choices: { id: string; correct?: boolean }[];
    };
    const reordered = { ...block, choices: [...block.choices].reverse() };

    expect(extractBlockAnswerKey(reordered as never)).toEqual(
      extractBlockAnswerKey(block as never),
    );
  });

  it('matching: reordering the TARGETS leaves the key identical', () => {
    const block = authoredBlockFixture('matching') as {
      targets: { id: string }[];
    };
    const reordered = { ...block, targets: [...block.targets].reverse() };

    expect(extractBlockAnswerKey(reordered as never)).toEqual(
      extractBlockAnswerKey(block as never),
    );
  });

  it('ordering: reordering the ITEMS DOES change the key (authored order is the answer)', () => {
    const block = authoredBlockFixture('ordering') as { items: { id: string }[] };
    const reordered = { ...block, items: [...block.items].reverse() };

    // The mirror image of the two pins above, and not a contradiction: an
    // ordering block has no separate key field, so its authored sequence is the
    // answer itself rather than a presentation choice.
    expect(extractBlockAnswerKey(reordered as never)).not.toEqual(
      extractBlockAnswerKey(block as never),
    );
  });
});

describe('out-of-band answers, per type', () => {
  it('multiple_choice: exactly the correct choice ids, no incorrect ones', () => {
    const block = authoredBlockFixture('multiple_choice') as {
      choices: { id: string; correct?: boolean }[];
    };
    const key = extractBlockAnswerKey(block as never);
    const correct = block.choices.filter((c) => c.correct).map((c) => c.id);
    const incorrect = block.choices.filter((c) => !c.correct).map((c) => c.id);

    expect(key.correctChoiceIds).toEqual(correct);
    expect(correct.length).toBeGreaterThan(0);
    for (const id of incorrect) {
      expect(key.correctChoiceIds).not.toContain(id);
    }
  });

  it('matching: values are TARGET IDS, never printed letters', () => {
    const block = authoredBlockFixture('matching') as {
      items: { id: string }[];
      targets: { id: string }[];
      key: Record<string, string>;
    };
    const pairs = extractBlockAnswerKey(block as never).targetIdByItemId ?? {};
    const targetIds = new Set(block.targets.map((t) => t.id));

    expect(Object.keys(pairs).length).toBeGreaterThan(0);
    for (const [itemId, targetId] of Object.entries(pairs)) {
      expect(block.items.some((i) => i.id === itemId)).toBe(true);
      expect(targetIds.has(targetId)).toBe(true);
      // A single letter would mean the serve order had been baked in.
      expect(targetId).not.toMatch(/^[A-Z]$/);
    }
  });

  it('ordering: 1-based positions following the authored sequence', () => {
    const block = authoredBlockFixture('ordering') as { items: { id: string }[] };
    const positions = extractBlockAnswerKey(block as never).positionByItemId ?? {};

    expect(block.items.map((item) => positions[item.id])).toEqual(
      block.items.map((_, index) => index + 1),
    );
  });

  it('graph family: question variants carry an overlay, display variants carry nothing', () => {
    for (const type of ['interactive_graph', 'number_line', 'data_plot'] as const) {
      for (const block of authoredVariantFixtures(type)) {
        const key = extractBlockAnswerKey(block);

        if (familyOf(block) === 'static') {
          // A display figure is a stimulus, not a question — it has no answer,
          // and the same familyOf() call keeps it out of check payloads.
          expect(key, `${type} display variant`).toEqual({});
          continue;
        }

        if (type === 'interactive_graph') {
          if (key.graphNoSolution) {
            // "No solution" is the answer: nothing to draw, flagged so a key
            // never reads as a blank grid with a missing answer.
            expect(key.graphOverlay).toHaveLength(0);
          } else {
            expect(key.graphOverlay?.length ?? 0).toBeGreaterThan(0);
          }
        }
        if (type === 'number_line') {
          expect(key.numberLineMarks?.length ?? 0).toBeGreaterThan(0);
        }
        if (type === 'data_plot') {
          expect(key.dataPlotValues?.length ?? 0).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe('the overlay channel is usable by the twin renderer (D8A seam)', () => {
  // D8A said to port answerKeyDrawables into the pure static-svg subpath; S5's
  // T2 extraction had already carried it (and its number-line twin) there, so
  // nothing was re-ported. What still needed proving is that what the EXTRACTOR
  // produces is what the twin renderer consumes — the seam T2's components sit
  // on, and the one the parity gate counts through `data-drawables`.

  it('a graph answer overlay renders as drawables the gate can count', () => {
    const graphs = authoredVariantFixtures('interactive_graph').filter(
      (block): block is Extract<Block, { type: 'interactive_graph' }> =>
        block.type === 'interactive_graph' && familyOf(block) !== 'static',
    );
    const block = graphs.find(
      (candidate) => (extractBlockAnswerKey(candidate).graphOverlay ?? []).length > 0,
    );
    expect(block, 'no graded graph fixture produced an overlay').toBeDefined();

    const overlay = extractBlockAnswerKey(block!).graphOverlay ?? [];
    const svg = renderGraphSvg(
      block!.axisConfig,
      [...overlay],
      block!.id,
      ANSWER_KEY_INK,
    );

    expect(svg).toContain(`data-drawables="${overlay.length}"`);
    // The overlay is a distinct neutral layer, not the display palette.
    expect(svg).toContain(ANSWER_KEY_INK);
  });

  it('a number-line answer overlay renders its marks', () => {
    const lines = authoredVariantFixtures('number_line').filter(
      (block): block is Extract<Block, { type: 'number_line' }> =>
        block.type === 'number_line' && familyOf(block) !== 'static',
    );
    const block = lines[0];
    expect(block, 'no graded number_line fixture').toBeDefined();

    const marks = extractBlockAnswerKey(block!).numberLineMarks ?? [];
    const svg = renderNumberLineSvg(block!.config, [...marks], block!.id);

    expect(marks.length).toBeGreaterThan(0);
    expect(svg).toContain(`data-drawables="${marks.length}"`);
  });

  it('a question twin still prints EMPTY when given no overlay (S5-OV4 holds)', () => {
    // The student-surface invariant the answer key must not erode: the same
    // renderer, called the way the student path calls it, draws nothing.
    const block = authoredVariantFixtures('interactive_graph').find(
      (candidate): candidate is Extract<Block, { type: 'interactive_graph' }> =>
        candidate.type === 'interactive_graph' && familyOf(candidate) !== 'static',
    );
    const svg = renderGraphSvg(block!.axisConfig, [], block!.id);
    expect(svg).toContain('data-drawables="0"');
  });
});

describe('written answers on the manually-graded pair (ruling §2)', () => {
  const bare = (type: 'short_answer' | 'essay', extra: object = {}): Block =>
    ({
      id: '00000000-0000-4000-8000-00000000f00d',
      type,
      prompt: [{ type: 'text', text: 'Explain.', marks: [] }],
      ...extra,
    }) as unknown as Block;

  it('prints `answer` when the author supplied one', () => {
    const key = extractBlockAnswerKey(authoredBlockFixture('short_answer'));
    expect(key.writtenAnswerSource).toBe('answer');
    expect(key.writtenAnswer?.length).toBeGreaterThan(0);
    expect(key.manuallyGraded).toBeUndefined();
  });

  it('FALLS BACK to `solution` — in the extractor, where both fields exist', () => {
    // The essay fixture carries only `solution`. The fallback cannot live in
    // the component: components render the SANITIZED document, where neither
    // field survives, so a component-side fallback would be reaching for
    // something that is gone by construction.
    const key = extractBlockAnswerKey(authoredBlockFixture('essay'));
    expect(key.writtenAnswerSource).toBe('solution');
    expect(key.writtenAnswer?.length).toBeGreaterThan(0);
  });

  it('prefers `answer` over `solution` when both are present', () => {
    const key = extractBlockAnswerKey(
      bare('short_answer', {
        answer: [{ type: 'text', text: 'THE ANSWER', marks: [] }],
        solution: [{ type: 'text', text: 'the explanation', marks: [] }],
      }),
    );
    expect(key.writtenAnswerSource).toBe('answer');
    expect(JSON.stringify(key.writtenAnswer)).toContain('THE ANSWER');
  });

  it.each(['short_answer', 'essay'] as const)(
    '%s with NEITHER field keys as manually graded — never as absent',
    (type) => {
      const key = extractBlockAnswerKey(bare(type));
      expect(key).toEqual({ manuallyGraded: true });
      // And it reaches the document-level map, so the printed key shows the
      // question. A question missing from a key is indistinguishable from a
      // question the key forgot — which a teacher discovers mid-marking.
      const doc = authoredFixtureDocument();
      const map = extractAnswerKey(doc);
      const ids = doc.sections
        .flatMap((section) => section.rows)
        .flatMap((row) => row.columns)
        .flatMap((column) => column.blocks)
        .filter((block) => block.type === type)
        .map((block) => block.id);
      expect(ids.length).toBeGreaterThan(0);
      for (const id of ids) expect(map[id]).toBeDefined();
    },
  );

  it('an EMPTY answer array is not an answer — it falls through the chain', () => {
    const key = extractBlockAnswerKey(bare('essay', { answer: [], solution: [] }));
    expect(key).toEqual({ manuallyGraded: true });
  });
});

// =============================================================================
// The roster guard — CONTRACT AMENDED 2026-08-20 (answer-key slice, ruling §2)
// -----------------------------------------------------------------------------
// This guard used to assert an EQUALITY in two halves: every auto_gradable type
// is keyed, and nothing that is not auto_gradable is keyed. The second half is
// now WRONG on purpose, and it was rewritten rather than relaxed.
//
// The new contract is a CONTAINMENT: **keyed ⊇ auto-gradable**.
//
// What forced it: short_answer and essay are `recorded`-family blocks — no
// machine grades them — and that is exactly WHY they carry a teacher's written
// answer. A printed key for a paper worksheet must include the questions a
// human marks; those are the ones the teacher actually needs the key for. Under
// the old equality, adding them would have turned this file red, and the wrong
// response would have been to append two names to a whitelist until the red
// went away. So the claim itself is restated, with its own bound:
//
//   - every auto_gradable type is still keyed (unchanged — a machine-graded
//     question with no key is the failure this roster exists to catch);
//   - a keyed type must be QUESTION-BEARING (registry family ≠ 'static'), so
//     the widening cannot drift into keying static content;
//   - self_explanation is pinned as a NAMED exclusion, because "not in the map"
//     and "decided not to key it" look identical from here otherwise
//     (E5/finding 11 — the family audit is satisfied by decision, not silence);
//   - non-vacuity now runs over EVERY keyed type rather than only the
//     auto_gradable ones, which is what makes the two new rows earn their place
//     instead of merely occupying it.
// =============================================================================

const keyedTypes = Object.keys(ANSWER_KEY_COVERAGE) as BlockType[];

describe('roster guard: keyed ⊇ auto-gradable', () => {
  it('every auto_gradable type has a recorded answer-key decision', () => {
    for (const type of gradableTypes) {
      expect(
        ANSWER_KEY_COVERAGE[type],
        `${type} is auto_gradable but has no ANSWER_KEY_COVERAGE entry — ` +
          'add an extractor, declare it in-band, or record why it answers ' +
          'through its children',
      ).toBeDefined();
    }
  });

  it('the containment is PROPER — the roster is wider than auto-gradable', () => {
    // Non-vacuity for the amendment itself. If this ever fails, the recorded
    // rows were removed and the contract silently reverted to the old equality.
    const recordedKeyed = keyedTypes.filter(
      (type) => blockRegistry[type].family === 'recorded',
    );
    expect(recordedKeyed.sort()).toEqual(['essay', 'short_answer']);
  });

  it('coverage names no STATIC type — the bound on the widening', () => {
    for (const type of keyedTypes) {
      expect(
        blockRegistry[type].family,
        `${type} is claimed in the answer-key roster but is static content`,
      ).not.toBe('static');
    }
  });

  it('self_explanation is UNKEYED, by decision', () => {
    // Ungraded reflection has no right answer to print. Pinned by name so the
    // exclusion stays a ruling instead of decaying into an oversight the next
    // time someone sweeps the recorded family.
    expect(blockRegistry.self_explanation.family).toBe('recorded');
    expect(ANSWER_KEY_COVERAGE.self_explanation).toBeUndefined();
  });

  it('every claim is non-vacuous: the declared route really produces a key', () => {
    for (const type of keyedTypes) {
      const coverage = ANSWER_KEY_COVERAGE[type];
      if (!coverage) continue; // the pin above already failed for this type
      const variants = authoredVariantFixtures(type);

      if (coverage.via === 'children') {
        // The container itself must stay empty — that IS its claim — while its
        // children carry the answers.
        for (const block of variants) {
          expect(extractBlockAnswerKey(block), `${type} claims 'children'`)
            .toEqual({});
        }
        continue;
      }

      const produced = variants.some(
        (block) => Object.keys(extractBlockAnswerKey(block)).length > 0,
      );
      expect(
        produced,
        `${type} declares '${coverage.via}' but no authored variant produced ` +
          'an answer key — the claim is vacuous',
      ).toBe(true);
    }
  });
});

describe('the read path never carries answer-reading code (V9 leak class)', () => {
  it('the committed viewer-server bundle contains no answer-key symbols', () => {
    const bundle = readFileSync(
      new URL(
        '../../../supabase/functions/_shared/viewer-server.bundle.js',
        import.meta.url,
      ),
      'utf8',
    );

    // Code symbols, not prose: the bundle is deliberately unminified and its
    // comments legitimately discuss answer keys (that is what the sanitizer is
    // for), so matching on "answer key" would be a permanent false positive.
    for (const symbol of [
      'extractAnswerKey',
      'extractBlockAnswerKey',
      'ANSWER_KEY_COVERAGE',
    ]) {
      expect(
        bundle.includes(symbol),
        `${symbol} reached the get-activity bundle — the read path must never ` +
          'import answer-reading code (keep it out of src/server/index.ts)',
      ).toBe(false);
    }
  });
});

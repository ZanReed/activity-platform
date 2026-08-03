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

describe('roster guard over auto_gradable types', () => {
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

  it('coverage names no type that is not gradable', () => {
    for (const type of Object.keys(ANSWER_KEY_COVERAGE) as BlockType[]) {
      expect(gradableTypes, `${type} is claimed but is not auto_gradable`)
        .toContain(type);
    }
  });

  it('every claim is non-vacuous: the declared route really produces a key', () => {
    for (const type of gradableTypes) {
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

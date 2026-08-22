// =============================================================================
// registry.test.ts — the registry guard suite (S0)
// -----------------------------------------------------------------------------
// The T1 guard ("every schema block type has an entry") plus the coherence
// guards that keep the registry's declarations honest against the schema's
// rule engine (block-predicates.ts) while both exist. This is the start of the
// TV4-A guard-suite arc: invariants re-derived for the React world live here.
// =============================================================================

import { describe, expect, it } from 'vitest';
// Deep import, not the barrel: this is an internal helper with no consumer
// outside these guards, and export-reachability (policy P1) is right to
// refuse a barrel export that nothing in the product calls.
import { resolveBreakInside } from '../src/registry/printExpectations.js';
import {
  Block,
  GraphInteraction,
  NumberLineInteraction,
  DataPlotInteraction,
  isGradeable,
  isPageNumberedType,
} from '@activity/schema';
import {
  blockRegistry,
  registeredBlockTypes,
  familyOf,
  categoryOf,
  censusKeyOf,
} from '../src/index.js';
import type { BlockType } from '../src/index.js';

// The established reflection trick (runtime-doc-contract.test.ts precedent):
// read the union's type literals off the Zod schema at runtime.
const schemaBlockTypes = Block.options.map(
  (option) => option.shape.type.value as BlockType,
);

// Probe the numbering rule engine in its gradable and ungradable extremes.
// isPageNumberedType(type, interactionType, hasPrompts) only consults the
// extra args for the conditional types, so two probes classify every type:
//   always        → numbered in both extremes
//   when_gradable → numbered only in the gradable extreme
//   never         → numbered in neither
const numberedGradable = (type: string) =>
  isPageNumberedType(type, 'plot_point', true);
const numberedUngradable = (type: string) =>
  isPageNumberedType(type, 'display', false);

// Minimal instances for the instance-level predicates. isGradeable reads only
// `type`, `interaction.type`, `prompts`, and — since the table block — a cell
// blank, so these probes carry EVERY gradability signal at once (and the
// ungradable probe carries each one switched off). A conditional type that adds
// a new signal must add it here too, or it silently probes as ungradable and
// this file reports a family disagreement that is really a stale probe.
// The cast is confined to this test.
const gradableProbe = (type: BlockType): Block =>
  ({
    type,
    interaction: { type: 'plot_point' },
    prompts: [{}],
    rows: [{ id: 'r', cells: [{ id: 'c', content: [{ type: 'blank', id: 'b' }] }] }],
  }) as unknown as Block;
const ungradableProbe = (type: BlockType): Block =>
  ({
    type,
    interaction: { type: 'display' },
    prompts: [],
    rows: [{ id: 'r', cells: [{ id: 'c', content: [] }] }],
  }) as unknown as Block;

describe('registry coverage (the T1 guard)', () => {
  it('has exactly one entry per schema block type — no missing, no stale', () => {
    expect([...registeredBlockTypes].sort()).toEqual([...schemaBlockTypes].sort());
  });

  it('every entry declares its own type as its key', () => {
    for (const type of registeredBlockTypes) {
      expect(blockRegistry[type].type).toBe(type);
    }
  });
});

describe('numbering declarations agree with block-predicates.ts', () => {
  it.each(schemaBlockTypes)('%s', (type) => {
    const declared = blockRegistry[type].numbered;
    const inGradableForm = numberedGradable(type);
    const inUngradableForm = numberedUngradable(type);
    const derived =
      inGradableForm && inUngradableForm
        ? 'always'
        : inGradableForm
          ? 'when_gradable'
          : 'never';
    expect(declared).toBe(derived);
  });
});

describe('checked-state families (ruling 7.2A)', () => {
  it('recorded is exactly the manually-reviewed free-text trio', () => {
    const recorded = registeredBlockTypes.filter(
      (type) => blockRegistry[type].family === 'recorded',
    );
    expect(recorded.sort()).toEqual(['essay', 'self_explanation', 'short_answer']);
  });

  it('a non-static family requires a gradeable form (isGradeable agrees)', () => {
    for (const type of registeredBlockTypes) {
      const { family } = blockRegistry[type];
      expect(isGradeable(gradableProbe(type))).toBe(family !== 'static');
    }
  });

  it('familyOf resolves ungradable instances of conditional types to static', () => {
    expect(familyOf(gradableProbe('interactive_graph'))).toBe('auto_gradable');
    expect(familyOf(ungradableProbe('interactive_graph'))).toBe('static');
    expect(familyOf(ungradableProbe('data_plot'))).toBe('static');
    expect(familyOf(ungradableProbe('math_block'))).toBe('static');
    expect(familyOf(gradableProbe('math_block'))).toBe('auto_gradable');
    expect(familyOf(gradableProbe('self_explanation'))).toBe('recorded');
    expect(familyOf(gradableProbe('paragraph'))).toBe('static');
  });

  it('categoryOf downgrades display-mode question blocks to content', () => {
    expect(categoryOf(gradableProbe('interactive_graph'))).toBe('question');
    expect(categoryOf(ungradableProbe('interactive_graph'))).toBe('content');
    expect(categoryOf(ungradableProbe('data_plot'))).toBe('content');
    expect(categoryOf(gradableProbe('fill_in_blank'))).toBe('question');
    expect(categoryOf(gradableProbe('faded_worked_example'))).toBe('scaffold');
  });
});

describe('a11y stories (ruling 6.1A)', () => {
  it('every interactive block declares a non-trivial a11y story', () => {
    for (const type of registeredBlockTypes) {
      const entry = blockRegistry[type];
      if (entry.interactivity === 'interactive') {
        expect(entry.a11y?.story ?? '').not.toHaveLength(0);
        // A story, not a checkbox: it must say something about the keyboard.
        expect(entry.a11y!.story.length).toBeGreaterThan(60);
      }
    }
  });

  it('interactive is exactly the set of input-accepting types', () => {
    const interactive = registeredBlockTypes.filter(
      (type) => blockRegistry[type].interactivity === 'interactive',
    );
    expect(interactive.sort()).toEqual(
      [
        'data_plot',
        'essay',
        'fill_in_blank',
        'interactive_graph',
        'matching',
        'math_block',
        'multiple_choice',
        'number_line',
        'ordering',
        'self_explanation',
        'short_answer',
        'table',
      ].sort(),
    );
  });
});

describe('interaction variants agree with the schema unions', () => {
  const variantsOf = (union: {
    options: ReadonlyArray<{ shape: { type: { value: string } } }>;
  }) => union.options.map((option) => option.shape.type.value);

  it('interactive_graph', () => {
    expect([...blockRegistry.interactive_graph.variants!].sort()).toEqual(
      variantsOf(GraphInteraction).sort(),
    );
  });

  it('number_line', () => {
    expect([...blockRegistry.number_line.variants!].sort()).toEqual(
      variantsOf(NumberLineInteraction).sort(),
    );
  });

  it('data_plot', () => {
    expect([...blockRegistry.data_plot.variants!].sort()).toEqual(
      variantsOf(DataPlotInteraction).sort(),
    );
  });

  it('no other entry declares variants', () => {
    const withVariants = registeredBlockTypes.filter(
      (type) => blockRegistry[type].variants !== undefined,
    );
    expect(withVariants.sort()).toEqual([
      'data_plot',
      'interactive_graph',
      'number_line',
    ]);
  });
});

describe('sanitize declarations (ruling TV4-A)', () => {
  it('every auto-gradable type accounts for its answer key somehow', () => {
    for (const type of registeredBlockTypes) {
      const entry = blockRegistry[type];
      if (entry.family !== 'auto_gradable') continue;
      const spec = entry.sanitize;
      const accounted =
        spec.strip.length > 0 ||
        spec.inlineBlankSecrets === true ||
        (spec.serveShuffled?.length ?? 0) > 0 ||
        spec.derivableFromServed !== undefined ||
        (spec.childBlocks?.length ?? 0) > 0;
      expect(accounted, `${type} declares no answer-key handling`).toBe(true);
    }
  });

  it('solution strips wherever the schema carries one', () => {
    // The blocks whose schema has a `solution` field (inventory 2026-07-28).
    const withSolution: BlockType[] = [
      'problem',
      'fill_in_blank',
      'multiple_choice',
      'matching',
      'ordering',
      'interactive_graph',
      'number_line',
      'data_plot',
      'math_block',
    ];
    for (const type of withSolution) {
      expect(
        blockRegistry[type].sanitize.strip,
        `${type} must strip solution (server reveals post-check, ruling Q2B)`,
      ).toContain('solution');
    }
  });

  it('rubrics never reach students', () => {
    expect(blockRegistry.short_answer.sanitize.strip).toContain('rubric');
    expect(blockRegistry.essay.sanitize.strip).toContain('rubric');
  });

  it('ordering serves shuffled — its authored order is the key', () => {
    expect(blockRegistry.ordering.sanitize.serveShuffled).toContain('items');
  });

  it('container recursion covers the two block-bearing containers', () => {
    expect(blockRegistry.worked_example.sanitize.childBlocks).toContain('content');
    expect(blockRegistry.faded_worked_example.sanitize.childBlocks).toContain('content');
  });
});

describe('analytics census keys (ruling P3A)', () => {
  it('analyticsKey follows the type-name convention', () => {
    for (const type of registeredBlockTypes) {
      expect(blockRegistry[type].analyticsKey).toBe(type);
    }
  });

  it('censusKeyOf appends the interaction variant', () => {
    expect(censusKeyOf(gradableProbe('interactive_graph'))).toBe(
      'interactive_graph.plot_point',
    );
    expect(censusKeyOf(ungradableProbe('data_plot'))).toBe('data_plot.display');
    expect(censusKeyOf(gradableProbe('fill_in_blank'))).toBe('fill_in_blank');
  });
});

describe('print declarations (faithful to the baseline print layer)', () => {
  // ('answer-key variants match the renderer showAnswers set' lived here,
  // pinning print.answerKeyVariant against a hardcoded seven — a surface that
  // no longer exists in the app. Both the field and the pin were deleted
  // 2026-08-06 (A18): ANSWER_KEY_COVERAGE is the single source of "which
  // types have a key", guarded for vacuity in answerKey.test.ts.)

  it('break-inside:avoid covers every block that must stay whole on a page', () => {
    // `avoid-unless-figures` (matching, ruling A9) DEFAULTS to avoid — the
    // conditional only relaxes it for an instance carrying figures. Resolving
    // rather than string-matching is what keeps this list meaning "blocks that
    // stay whole on an ordinary page"; the figures branch is asserted
    // separately, below.
    const avoid = registeredBlockTypes.filter(
      (type) => resolveBreakInside(blockRegistry[type].print.breakInside, {}) === 'avoid',
    );
    // WAS pinned to the baseline print CSS including its gaps — math_block,
    // data_plot and self_explanation were absent because the renderer's rule
    // omits them, and the registry recorded what IS so that improving it would
    // be a ruling rather than a silent side effect. S5 ruled it (S5-OV6), and
    // the author extended the ruling to short_answer and essay, which share
    // self_explanation's writing-box structure and its defect but were not
    // named in the original finding. The parity gate asserts this spec on both
    // surfaces rather than diffing against renderer output, which is what
    // makes the improvement expressible without touching published pages.
    //
    // Every FREE-TEXT type now avoids, which is the invariant worth reading
    // off this list: no prompt is ever separated from the space to answer it.
    expect(avoid.sort()).toEqual(
      [
        'data_plot',
        'essay',
        'faded_worked_example',
        'fill_in_blank',
        'interactive_graph',
        'learning_objectives',
        'matching',
        'math_block',
        'multiple_choice',
        'number_line',
        'ordering',
        'problem',
        'self_explanation',
        'short_answer',
      'table',
        'worked_example',
      ].sort(),
    );
  });

  it('keeps the whole writing-box family whole on the page (no prompt stranded from its answer space)', () => {
    // The rule behind the list above, stated as a rule rather than a roster:
    // if a future free-text type ships with break-inside auto, this fails even
    // though the roster test was updated to match it.
    const writingBox = registeredBlockTypes.filter(
      (type) => blockRegistry[type].print.treatment === 'writing-box',
    );
    expect(writingBox.length).toBeGreaterThan(0);
    for (const type of writingBox) {
      expect(
        blockRegistry[type].print.breakInside,
        `${type} can separate its prompt from its writing box on paper`,
      ).toBe('avoid');
    }
  });

  it('the conditional break DEFAULTS to avoid and relaxes only with figures', () => {
    // The other half of A9/E3, and the reason the conditional was declared in
    // the registry rather than left as a quiet stylesheet override: a
    // declaration is only worth something if BOTH its branches are asserted.
    // Without this, `avoid-unless-figures` would be indistinguishable from
    // plain `avoid` to every guard in the suite.
    expect(resolveBreakInside('avoid-unless-figures', {})).toBe('avoid');
    expect(resolveBreakInside('avoid-unless-figures', { figures: false })).toBe('avoid');
    expect(resolveBreakInside('avoid-unless-figures', { figures: true })).toBe('auto');
    // Unconditional values are returned untouched whatever the context says.
    expect(resolveBreakInside('avoid', { figures: true })).toBe('avoid');
    expect(resolveBreakInside('auto', { figures: false })).toBe('auto');
  });
});

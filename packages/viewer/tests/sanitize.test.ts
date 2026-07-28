// =============================================================================
// sanitize.test.ts — wire-level leak tests + sanitizer guards (S2/T3, TV4-A)
// -----------------------------------------------------------------------------
// The failure this suite exists for is SILENT: a sanitizer miss ships an
// answer key to every student and nothing crashes. So the core test is blunt
// and wire-level — build ONE document containing every block type and every
// interaction variant, plant unique sentinels in every secret field, sanitize,
// and string-scan the serialized wire output for survivors. The mechanism
// (strip paths, deep walks) is deliberately not what's asserted; the WIRE is.
//
// Alongside it, the anti-drift guards:
//   - every declared strip path must RESOLVE on a fully-loaded instance (a
//     typo'd path is a silent leak — this makes it a red test),
//   - every suspicious key the schema carries (top-level, interaction-variant,
//     and choice-level) must be declared stripped — a FUTURE block type or
//     field that carries a key can't slip past the registry unnoticed,
//   - data_plot's `data` is asserted PRESENT (the documented
//     derivableFromServed residual is a whitelist, never a silent skip).
// =============================================================================

import { describe, expect, it } from 'vitest';
import {
  ActivityDocument,
  Block,
  DataPlotInteraction,
  GraphInteraction,
  MultipleChoiceOption,
  NumberLineInteraction,
  createEmptyDocument,
} from '@activity/schema';
import {
  SANITIZER_REV,
  applyServeShuffles,
  blockRegistry,
  registeredBlockTypes,
  sanitizeActivityDocument,
  sanitizeBlock,
  seededShuffle,
} from '../src/index.js';
import type { BlockType, SanitizedActivityDocument } from '../src/index.js';

const uuid = () => crypto.randomUUID();

// Unique sentinels. STR for string-valued secrets, NUM for numeric ones (both
// chosen to be un-collidable with any legitimate fixture value; NUM serializes
// as a unique substring).
const STR = 'LEAK_SECRET_7f3a';
const NUM = 133742.4217;

const text = (t: string) => ({ type: 'text' as const, text: t });
const sentinelInline = () => [text(STR)];

// ---- Fully-loaded fixtures --------------------------------------------------
// One instance per block type — plus one per interaction variant for the three
// variant-carrying blocks — with EVERY secret field populated. Kept parse-valid
// (the assembled document goes through ActivityDocument.parse below), so the
// strip-path guard is checking real shapes, not convenient ones.

const linearModel = {
  family: 'linear' as const,
  slope: NUM,
  intercept: NUM,
};

function fixturesByType(): Map<BlockType, Record<string, unknown>[]> {
  const m = new Map<BlockType, Record<string, unknown>[]>();
  const put = (type: BlockType, ...blocks: Record<string, unknown>[]) =>
    m.set(type, blocks);

  put('paragraph', {
    id: uuid(),
    type: 'paragraph',
    // The defense-in-depth case: a prompted math_inline OUTSIDE the two
    // blocks that declare inlineBlankSecrets. Must still be stripped.
    content: [
      text('see '),
      {
        type: 'math_inline',
        latex: 'x + \\placeholder[g0]{}',
        prompts: [
          { id: 'g0', answer: STR, acceptableAnswers: [STR], tolerance: NUM },
        ],
      },
    ],
  });
  put('heading', { id: uuid(), type: 'heading', level: 2, content: [text('H')] });
  put('math_block', {
    id: uuid(),
    type: 'math_block',
    latex: 'y = \\placeholder[g1]{}',
    prompts: [
      {
        id: 'g1',
        answer: STR,
        acceptableAnswers: [STR],
        equivalence: 'value',
        tolerance: NUM,
      },
    ],
    solution: sentinelInline(),
  });
  put('image', { id: uuid(), type: 'image', src: 'https://x.test/i.png', alt: 'a' });
  put('callout', { id: uuid(), type: 'callout', variant: 'info', content: [text('c')] });
  put('problem', {
    id: uuid(),
    type: 'problem',
    content: [text('p')],
    solution: sentinelInline(),
  });
  put('fill_in_blank', {
    id: uuid(),
    type: 'fill_in_blank',
    content: [
      text('answer: '),
      {
        type: 'blank',
        id: uuid(),
        answer: STR,
        acceptableAnswers: [STR],
        width: 8,
        hint: [text('HINT_SURVIVES')],
        mistakeFeedback: [{ match: STR, feedback: sentinelInline() }],
        answerType: 'math',
        tolerance: NUM,
        equivalence: 'exact-form',
      },
    ],
    solution: sentinelInline(),
  });
  put('bullet_list', {
    id: uuid(),
    type: 'bullet_list',
    items: [{ id: uuid(), content: [text('li')] }],
  });
  put('ordered_list', {
    id: uuid(),
    type: 'ordered_list',
    items: [{ id: uuid(), content: [text('li')] }],
  });

  const graphBase = () => ({
    id: uuid(),
    type: 'interactive_graph',
    prompt: [text('graph it')],
    axisConfig: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
    allowNoSolution: true,
    noSolutionCorrect: true,
    partialCredit: true,
    builtinFeedback: true,
    mistakeFeedback: [{ match: `y = ${STR}`, feedback: sentinelInline() }],
    solution: sentinelInline(),
  });
  put(
    'interactive_graph',
    {
      ...graphBase(),
      interaction: { type: 'plot_point', correctPoints: [[NUM, NUM]], tolerance: NUM },
    },
    {
      ...graphBase(),
      interaction: {
        type: 'plot_function',
        models: [linearModel],
        domains: [{ min: NUM, max: NUM }],
      },
    },
    {
      ...graphBase(),
      interaction: {
        type: 'shade_region',
        regions: [
          {
            correctVertices: [
              [NUM, NUM],
              [NUM, 0],
              [0, NUM],
            ],
          },
        ],
      },
    },
    {
      ...graphBase(),
      interaction: {
        type: 'graph_inequality',
        inequalities: [{ boundary: linearModel, strict: true, shadeSide: 'above' }],
      },
    },
    {
      ...graphBase(),
      interaction: {
        type: 'plot_ray',
        rays: [{ from: [NUM, NUM], through: [NUM, 0], tolerance: NUM }],
      },
    },
    {
      ...graphBase(),
      interaction: {
        type: 'plot_segment',
        segments: [{ from: [NUM, NUM], to: [NUM, 0], tolerance: NUM }],
      },
    },
    {
      ...graphBase(),
      interaction: {
        type: 'display',
        drawables: [{ kind: 'point', at: [1, 2] }],
      },
    },
  );

  put('multiple_choice', {
    id: uuid(),
    type: 'multiple_choice',
    prompt: [text('pick')],
    choices: [
      {
        id: uuid(),
        content: [text('right')],
        correct: true,
        feedback: sentinelInline(),
      },
      { id: uuid(), content: [text('wrong')], correct: false },
    ],
    solution: sentinelInline(),
  });

  const itemA = uuid();
  const itemB = uuid();
  const targetA = uuid();
  const targetB = uuid();
  put('matching', {
    id: uuid(),
    type: 'matching',
    prompt: [text('match')],
    items: [
      { id: itemA, content: [text('1')] },
      { id: itemB, content: [text('2')] },
    ],
    targets: [
      { id: targetA, content: [text('a')] },
      { id: targetB, content: [text('b')] },
    ],
    key: { [itemA]: targetA, [itemB]: targetB },
    solution: sentinelInline(),
  });

  put('ordering', {
    id: uuid(),
    type: 'ordering',
    prompt: [text('order')],
    items: [
      { id: uuid(), content: [text('first')] },
      { id: uuid(), content: [text('second')] },
      { id: uuid(), content: [text('third')] },
      { id: uuid(), content: [text('fourth')] },
      { id: uuid(), content: [text('fifth')] },
      { id: uuid(), content: [text('sixth')] },
    ],
    solution: sentinelInline(),
  });

  const nlBase = () => ({
    id: uuid(),
    type: 'number_line',
    prompt: [text('plot')],
    config: { min: 0, max: 10 },
    solution: sentinelInline(),
  });
  put(
    'number_line',
    {
      ...nlBase(),
      interaction: { type: 'plot_point', correctPoints: [NUM], tolerance: NUM },
    },
    {
      ...nlBase(),
      interaction: {
        type: 'plot_interval',
        correctInterval: { min: NUM, max: NUM },
        tolerance: NUM,
      },
    },
  );

  const dpBase = () => ({
    id: uuid(),
    type: 'data_plot',
    prompt: [text('chart')],
    data: [3, 5, 5, 6, 8],
    config: { min: 0, max: 10 },
    solution: sentinelInline(),
  });
  put(
    'data_plot',
    { ...dpBase(), interaction: { type: 'display', chart: 'dotplot' } },
    { ...dpBase(), interaction: { type: 'build_dotplot' } },
    { ...dpBase(), interaction: { type: 'build_histogram' } },
    { ...dpBase(), interaction: { type: 'build_boxplot', tolerance: NUM } },
  );

  put('learning_objectives', {
    id: uuid(),
    type: 'learning_objectives',
    title: 'Objectives',
    items: [[text('obj')]],
  });
  put('worked_example', {
    id: uuid(),
    type: 'worked_example',
    title: 'Worked example',
    // The childBlocks recursion case: a nested math_block whose solution and
    // prompt secrets must be stripped by ITS OWN registry entry.
    content: [
      { id: uuid(), type: 'paragraph', content: [text('step')] },
      {
        id: uuid(),
        type: 'math_block',
        latex: 'z = \\placeholder[g2]{}',
        prompts: [{ id: 'g2', answer: STR }],
        solution: sentinelInline(),
      },
    ],
  });
  put('faded_worked_example', {
    id: uuid(),
    type: 'faded_worked_example',
    title: 'Guided practice',
    content: [
      {
        id: uuid(),
        type: 'fill_in_blank',
        content: [
          text('faded: '),
          {
            type: 'blank',
            id: uuid(),
            answer: STR,
            acceptableAnswers: [STR],
            mistakeFeedback: [{ match: STR, feedback: sentinelInline() }],
          },
        ],
        solution: sentinelInline(),
      },
    ],
  });
  put('self_explanation', {
    id: uuid(),
    type: 'self_explanation',
    prompt: [text('why?')],
  });
  put('short_answer', {
    id: uuid(),
    type: 'short_answer',
    prompt: [text('answer briefly')],
    rubric: { criteria: [{ id: uuid(), label: STR, maxPoints: 3, description: STR }] },
  });
  put('essay', {
    id: uuid(),
    type: 'essay',
    prompt: [text('discuss')],
    rubric: { criteria: [{ id: uuid(), label: STR, maxPoints: 5 }] },
  });
  put('graph_figure', {
    id: uuid(),
    type: 'graph_figure',
    axis: { xMin: -5, xMax: 5, yMin: -5, yMax: 5 },
    drawables: [{ kind: 'point', at: [1, 1] }],
  });

  return m;
}

/** Assemble every fixture into one parse-valid document (one block per row). */
function fullyLoadedDocument() {
  const doc = createEmptyDocument({ title: 'Leak fixture' });
  const blocks = [...fixturesByType().values()].flat();
  const raw = {
    ...JSON.parse(JSON.stringify(doc)),
    sections: [
      {
        id: uuid(),
        isCheckpoint: false,
        rows: blocks.map((block) => ({
          id: uuid(),
          gridLines: 'inherit',
          columns: [{ id: uuid(), blocks: [block] }],
        })),
      },
    ],
  };
  // Parse so the fixtures are REAL (defaults filled, shapes verified) — a
  // fixture that drifted from the schema fails here, loudly, not downstream.
  return ActivityDocument.parse(raw);
}

const wireOf = (value: unknown) => JSON.stringify(value);

// -----------------------------------------------------------------------------
// The leak test
// -----------------------------------------------------------------------------

describe('wire-level leak tests (TV4-A)', () => {
  const doc = fullyLoadedDocument();
  const sanitized = sanitizeActivityDocument(doc);
  const wire = wireOf(sanitized);

  it('the fixture actually contains every sentinel before sanitizing', () => {
    const before = wireOf(doc);
    expect(before).toContain(STR);
    expect(before).toContain(String(NUM));
  });

  it('no string sentinel survives to the wire', () => {
    expect(wire).not.toContain(STR);
  });

  it('no numeric sentinel survives to the wire', () => {
    expect(wire).not.toContain(String(NUM));
  });

  it('covers every registered block type (fixture completeness guard)', () => {
    const covered = [...fixturesByType().keys()].sort();
    expect(covered).toEqual([...registeredBlockTypes].sort());
  });

  it('covers every interaction variant of the three variant blocks', () => {
    const fixtures = fixturesByType();
    for (const type of ['interactive_graph', 'number_line', 'data_plot'] as const) {
      const present = fixtures
        .get(type)!
        .map((b) => (b.interaction as { type: string }).type)
        .sort();
      expect(present).toEqual([...(blockRegistry[type].variants ?? [])].sort());
    }
  });

  it('data_plot `data` SURVIVES — the documented derivableFromServed residual', () => {
    const dataPlots = sanitized.sections[0]!.rows
      .flatMap((r) => r.columns.flatMap((c) => c.blocks))
      .filter((b) => b.type === 'data_plot');
    expect(dataPlots.length).toBeGreaterThan(0);
    for (const dp of dataPlots) {
      expect((dp as { data: number[] }).data).toEqual([3, 5, 5, 6, 8]);
    }
    expect(blockRegistry.data_plot.sanitize.derivableFromServed).toBeTruthy();
  });

  it('pre-check affordances survive: hint, answerType, width, gap ids', () => {
    expect(wire).toContain('HINT_SURVIVES');
    expect(wire).toContain('"answerType":"math"');
    expect(wire).toContain('"width":8');
    // The math gap ids survive (they ARE the gaps); their answers do not.
    expect(wire).toContain('"g1"');
  });

  it('structural keys are ABSENT (fields with un-sentinelable values)', () => {
    const blocks = sanitized.sections[0]!.rows.flatMap((r) =>
      r.columns.flatMap((c) => c.blocks),
    );
    const byType = (t: string) => blocks.filter((b) => b.type === t);

    for (const matching of byType('matching')) {
      expect('key' in matching).toBe(false);
    }
    for (const mc of byType('multiple_choice')) {
      for (const choice of (mc as { choices: object[] }).choices) {
        expect('correct' in choice).toBe(false);
        expect('feedback' in choice).toBe(false);
      }
    }
    for (const graph of byType('interactive_graph')) {
      expect('noSolutionCorrect' in graph).toBe(false);
      expect('mistakeFeedback' in graph).toBe(false);
      expect('partialCredit' in graph).toBe(false);
      expect('builtinFeedback' in graph).toBe(false);
      // allowNoSolution SURVIVES — it renders the "no solution" control.
      expect((graph as { allowNoSolution?: boolean }).allowNoSolution).toBe(true);
    }
    for (const sa of [...byType('short_answer'), ...byType('essay')]) {
      expect('rubric' in sa).toBe(false);
    }
  });

  it('sanitize does not reorder anything (shuffling is serve-time work)', () => {
    const ordering = sanitized.sections[0]!.rows
      .flatMap((r) => r.columns.flatMap((c) => c.blocks))
      .find((b) => b.type === 'ordering') as {
      items: Array<{ content: Array<{ text?: string }> }>;
    };
    expect(ordering.items.map((i) => i.content[0]?.text)).toEqual([
      'first',
      'second',
      'third',
      'fourth',
      'fifth',
      'sixth',
    ]);
  });

  it('sanitizeBlock fails CLOSED on an unknown block type', () => {
    expect(() =>
      sanitizeBlock({ id: uuid(), type: 'mystery_block' } as never),
    ).toThrowError(/unknown block type/);
  });

  it('does not mutate its input', () => {
    const before = wireOf(doc);
    sanitizeActivityDocument(doc);
    expect(wireOf(doc)).toBe(before);
  });
});

// -----------------------------------------------------------------------------
// Anti-drift guards
// -----------------------------------------------------------------------------

describe('strip-path validity (a mistyped path is a silent leak)', () => {
  const fixtures = fixturesByType();

  const pathResolves = (block: Record<string, unknown>, path: string): boolean => {
    const arrayIdx = path.indexOf('[].');
    if (arrayIdx !== -1) {
      const arr = block[path.slice(0, arrayIdx)];
      const sub = path.slice(arrayIdx + 3);
      return (
        Array.isArray(arr) &&
        arr.some(
          (el) => el !== null && typeof el === 'object' && sub in (el as object),
        )
      );
    }
    const dotIdx = path.indexOf('.');
    if (dotIdx !== -1) {
      const parent = block[path.slice(0, dotIdx)];
      return (
        parent !== null &&
        typeof parent === 'object' &&
        path.slice(dotIdx + 1) in (parent as object)
      );
    }
    return path in block;
  };

  it.each([...registeredBlockTypes])('%s', (type) => {
    const instances = fixtures.get(type)!;
    for (const path of blockRegistry[type].sanitize.strip) {
      // Variant-scoped paths must resolve on AT LEAST ONE variant fixture;
      // unscoped paths on every instance.
      const resolved = path.startsWith('interaction.')
        ? instances.some((b) => pathResolves(b, path))
        : instances.every((b) => pathResolves(b, path));
      expect(resolved, `${type}: strip path '${path}' resolves on no fixture`).toBe(
        true,
      );
    }
    for (const field of blockRegistry[type].sanitize.serveShuffled ?? []) {
      expect(
        instances.every((b) => Array.isArray(b[field])),
        `${type}: serveShuffled field '${field}' is not an array on the fixture`,
      ).toBe(true);
    }
    for (const field of blockRegistry[type].sanitize.childBlocks ?? []) {
      expect(
        instances.every((b) => Array.isArray(b[field])),
        `${type}: childBlocks field '${field}' is not an array on the fixture`,
      ).toBe(true);
    }
  });
});

describe('schema-vs-registry secret completeness (future-block guard)', () => {
  // Any key on a block schema whose NAME signals answer-key material must be
  // declared stripped (or explicitly whitelisted here, with a reason). A new
  // block type that adds `solution` without a registry strip fails THIS test,
  // not a student's privacy.
  const SUSPICIOUS_TOP_LEVEL = [
    'solution',
    'answer',
    'acceptableAnswers',
    'rubric',
    'key',
    'mistakeFeedback',
    'noSolutionCorrect',
    'correct',
  ] as const;
  // data_plot.data: the documented derivableFromServed residual (the chart is
  // computed from data the student must receive).
  const WHITELIST = new Set(['data_plot:data']);

  it('every suspicious top-level key is stripped', () => {
    for (const option of Block.options) {
      const type = option.shape.type.value as BlockType;
      const strips = blockRegistry[type].sanitize.strip;
      for (const key of Object.keys(option.shape)) {
        if (!SUSPICIOUS_TOP_LEVEL.includes(key as never)) continue;
        if (WHITELIST.has(`${type}:${key}`)) continue;
        expect(
          strips.includes(key),
          `${type}.${key} looks like answer-key material but is not stripped`,
        ).toBe(true);
      }
    }
  });

  const SUSPICIOUS_INTERACTION = [
    'correctPoints',
    'correctInterval',
    'models',
    'domains',
    'regions',
    'inequalities',
    'rays',
    'segments',
    'tolerance',
  ] as const;

  it.each([
    ['interactive_graph', GraphInteraction],
    ['number_line', NumberLineInteraction],
    ['data_plot', DataPlotInteraction],
  ] as const)('every suspicious %s interaction key is stripped', (type, union) => {
    const strips = blockRegistry[type].sanitize.strip;
    for (const option of union.options) {
      for (const key of Object.keys(option.shape)) {
        if (!SUSPICIOUS_INTERACTION.includes(key as never)) continue;
        expect(
          strips.includes(`interaction.${key}`),
          `${type}.interaction.${key} (variant ${option.shape.type.value}) is not stripped`,
        ).toBe(true);
      }
    }
  });

  it('every suspicious multiple-choice option key is stripped', () => {
    const strips = blockRegistry.multiple_choice.sanitize.strip;
    for (const key of Object.keys(MultipleChoiceOption.shape)) {
      if (key === 'correct' || key === 'feedback') {
        expect(strips.includes(`choices[].${key}`)).toBe(true);
      }
    }
  });
});

// -----------------------------------------------------------------------------
// Serve-time shuffles + the cache revision
// -----------------------------------------------------------------------------

describe('serve-time shuffles (deterministic per version + student)', () => {
  const sanitized = sanitizeActivityDocument(fullyLoadedDocument());
  const orderingTexts = (doc: SanitizedActivityDocument): string[] => {
    const ordering = doc.sections[0]!.rows
      .flatMap((r) => r.columns.flatMap((c) => c.blocks))
      .find((b) => b.type === 'ordering') as {
      items: Array<{ content: Array<{ text?: string }> }>;
    };
    return ordering.items.map((i) => i.content[0]?.text ?? '');
  };
  const authored = orderingTexts(sanitized);

  it('serves a permutation, not the authored order (the order IS the key)', () => {
    const served = orderingTexts(applyServeShuffles(sanitized, 'v1:student-a'));
    expect([...served].sort()).toEqual([...authored].sort());
    expect(served).not.toEqual(authored);
  });

  it('is stable for the same (version, student) seed — reloads never reshuffle', () => {
    const a = orderingTexts(applyServeShuffles(sanitized, 'v1:student-a'));
    const b = orderingTexts(applyServeShuffles(sanitized, 'v1:student-a'));
    expect(a).toEqual(b);
  });

  it('differs across students and across versions', () => {
    const a = orderingTexts(applyServeShuffles(sanitized, 'v1:student-a'));
    const b = orderingTexts(applyServeShuffles(sanitized, 'v1:student-b'));
    const c = orderingTexts(applyServeShuffles(sanitized, 'v2:student-a'));
    // Deterministic seeds — these particular permutations of 6 items differ
    // (verified once; the PRNG is fixed, so this can never flake).
    expect(a).not.toEqual(b);
    expect(a).not.toEqual(c);
  });

  it('does not mutate the cached artifact it reads from', () => {
    const before = wireOf(sanitized);
    applyServeShuffles(sanitized, 'v1:student-a');
    expect(wireOf(sanitized)).toBe(before);
  });

  it('seededShuffle preserves membership and is seed-deterministic', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8];
    const a = seededShuffle(items, 'seed');
    expect([...a].sort((x, y) => x - y)).toEqual(items);
    expect(seededShuffle(items, 'seed')).toEqual(a);
    expect(items).toEqual([1, 2, 3, 4, 5, 6, 7, 8]); // pure
  });
});

describe('SANITIZER_REV (the durable cache invalidation key)', () => {
  it('has the algo-hash shape and is stable within a build', () => {
    expect(SANITIZER_REV).toMatch(/^\d+-[0-9a-f]{8}$/);
    expect(SANITIZER_REV).toBe(SANITIZER_REV);
  });
});

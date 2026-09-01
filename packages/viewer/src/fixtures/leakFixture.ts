// =============================================================================
// fixtures/leakFixture.ts — the fully-loaded secret-bearing document
// -----------------------------------------------------------------------------
// ONE fixture, TWO channels. Every block type — plus every interaction variant
// of the three variant-carrying blocks — with EVERY secret field populated by a
// unique sentinel, assembled into a parse-valid ActivityDocument.
//
// It was written for S2's read-path leak tests (TV4-A). S4 added a SECOND
// server→client channel: the check response returns authored feedback and
// solutions that the read path deliberately stripped. G3 (2026-08-06) added
// the THIRD: the teacher print route's rendered DOM, scanned app-side — which
// is why this moved from tests/helpers into src/fixtures (exported at
// '@activity/viewer/fixtures/leak'). Every channel scans the same sentinels,
// or a block type gains a secret field and gets covered on one path only.
//
// Extracting it here means a new secret field is declared once and both leak
// suites inherit it. Keeping two copies would have guaranteed the opposite.
//
// The document is pushed through ActivityDocument.parse, so a fixture that
// drifts from the schema fails loudly here rather than silently testing a shape
// that cannot exist.
// =============================================================================


import { ActivityDocument, createEmptyDocument } from '@activity/schema';
import type { BlockType } from '../index.js';

export const uuid = () => crypto.randomUUID();

// Unique sentinels. STR for string-valued secrets, NUM for numeric ones (both
// chosen to be un-collidable with any legitimate fixture value; NUM serializes
// as a unique substring).
export const STR = 'LEAK_SECRET_7f3a';
export const NUM = 133742.4217;

/**
 * The inline CONTENT of a solution / mistakeFeedback body — deliberately a
 * DIFFERENT sentinel from STR, because the two have different release rules and
 * one marker cannot express both:
 *
 *   STR (answer material)  — never released on any channel, ever.
 *   RELEASABLE (content)   — stripped from the READ path, but deliberately
 *                            RETURNED by the check response after a section
 *                            check (rulings Q2B / 2.1A).
 *
 * They were one sentinel until S4's leak suite went red on content the check
 * channel is supposed to carry. Splitting them is what lets each suite assert
 * the truth for its own channel instead of the weaker "nothing at all".
 * `hint` already had its own marker for exactly this reason (it survives the
 * read path), so this follows an established shape rather than inventing one.
 */
export const RELEASABLE = 'RELEASABLE_CONTENT_9c21';

export const text = (t: string) => ({ type: 'text' as const, text: t });
export const sentinelInline = () => [text(RELEASABLE)];

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

export function fixturesByType(): Map<BlockType, Record<string, unknown>[]> {
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
        mistakeFeedback: [
          {
            match: STR,
            feedback: sentinelInline(),
            // RELEASABLE-class: stripped from the read path, returned by the
            // check response when this entry matches (decision 4, 2026-08-24).
            misconceptionId: `mis.probe.${RELEASABLE}`,
          },
        ],
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
        // The START model deliberately carries plain values, not NUM
        // sentinels: it is question material and SURVIVES sanitize by design
        // (the student must see the parent curve). The target model is the
        // key and must strip.
        type: 'transform_curve',
        start: { family: 'quadratic', a: 1, b: 0, c: 0 },
        models: [{ family: 'quadratic', a: NUM, b: NUM, c: NUM }],
        requireEquation: true,
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
      {
        id: uuid(),
        content: [text('wrong')],
        correct: false,
        misconceptionId: `mis.probe.${RELEASABLE}`,
      },
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

  const corrItemA = uuid();
  const corrItemB = uuid();
  const corrColA = uuid();
  const corrColB = uuid();
  const corrTargetA1 = uuid();
  const corrTargetA2 = uuid();
  const corrTargetB1 = uuid();
  const corrTargetB2 = uuid();
  put('correspondence', {
    id: uuid(),
    type: 'correspondence',
    prompt: [text('correspond')],
    items: [
      { id: corrItemA, content: [text('1')] },
      { id: corrItemB, content: [text('2')] },
    ],
    targetColumns: [
      {
        id: corrColA,
        header: [text('graphs')],
        targets: [
          { id: corrTargetA1, content: [text('a')] },
          { id: corrTargetA2, content: [text('b')] },
        ],
      },
      {
        id: corrColB,
        header: [text('tables')],
        targets: [
          { id: corrTargetB1, content: [text('c')] },
          { id: corrTargetB2, content: [text('d')] },
        ],
      },
    ],
    key: {
      [corrItemA]: { [corrColA]: corrTargetA1, [corrColB]: corrTargetB1 },
      [corrItemB]: { [corrColA]: corrTargetA2, [corrColB]: corrTargetB2 },
    },
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
  // A table whose CELLS carry answer material. The point of this entry is the
  // depth: the blank sits inside rows[].cells[].content[], two levels below any
  // field the sanitizer's declared strips name, and it is caught only because
  // the in-band walk descends unconditionally. Sentinels in the answer, the
  // alternates, the hint and the mistake feedback, so each channel is proven.
  put('table', {
    id: uuid(),
    type: 'table',
    headerRow: true,
    headerColumn: false,
    showCellLabels: true,
    rows: [
      {
        id: uuid(),
        cells: [
          { id: uuid(), content: [text('kg')] },
          { id: uuid(), content: [text('cost')] },
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
                id: uuid(),
                answer: STR,
                acceptableAnswers: [STR],
                tolerance: NUM,
                // NOT a sentinel: `hint` SURVIVES sanitization deliberately (it
                // shapes the input before any check), exactly as on a prose
                // blank — the fill_in_blank fixture's HINT_SURVIVES marker is
                // the same statement. Putting RELEASABLE here would assert the
                // opposite contract, and the leak suite says so immediately.
                hint: [text('HINT_SURVIVES')],
                mistakeFeedback: [{ match: STR, feedback: sentinelInline() }],
              },
            ],
          },
        ],
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
  // The two manually-graded free-response blocks carry BOTH sentinels, and
  // which one goes in which field is the whole point (answer-key slice, E3):
  //
  //   answer   → STR         answer material. Never released on ANY channel,
  //                          including the check response — the printed
  //                          teacher key is its only destination.
  //   solution → RELEASABLE  content. Stripped from the read path, deliberately
  //                          RETURNED by the check response (walk.ts's generic
  //                          solution collection picks it up), so the check-leak
  //                          suite must NOT see it as a violation.
  //
  // Getting these backwards would make one suite green for the wrong reason,
  // which is why the two markers exist at all (see RELEASABLE's own note).
  put('short_answer', {
    id: uuid(),
    type: 'short_answer',
    prompt: [text('answer briefly')],
    rubric: { criteria: [{ id: uuid(), label: STR, maxPoints: 3, description: STR }] },
    answer: [text(STR)],
    solution: sentinelInline(),
  });
  put('essay', {
    id: uuid(),
    type: 'essay',
    prompt: [text('discuss')],
    rubric: { criteria: [{ id: uuid(), label: STR, maxPoints: 5 }] },
    answer: [text(STR)],
    solution: sentinelInline(),
  });
  put('graph_figure', {
    id: uuid(),
    type: 'graph_figure',
    axis: { xMin: -5, xMax: 5, yMin: -5, yMax: 5 },
    drawables: [{ kind: 'point', at: [1, 1] }],
  });

  return m;
}

/** Assemble every fixture into one parse-valid document (one block per row).
 *
 * The blocks go into the section body AND into `referencePanel.blocks`, because
 * the panel takes the SAME `z.array(Block)` union the body does — the full one,
 * multiple choice and matching included. That was not a hypothetical: until
 * 2026-08-23 `sanitizeActivityDocument` ran the per-block strips over the body
 * only and left the panel to the in-band deep walk, which knows about blanks
 * and math prompts and nothing else. A teacher who pasted a multiple-choice
 * into a reference panel shipped its `correct` flags to every student.
 *
 * Putting them here rather than adding a bespoke assertion is deliberate: this
 * suite's whole design is "one document holding everything, scan the wire for
 * sentinels", so the surface that was missing belongs in the DOCUMENT. Every
 * existing leak test now covers the panel, and every future secret field
 * inherits that coverage for free. */
export function fullyLoadedDocument() {
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
    referencePanel: {
      title: 'Reference',
      // Fresh clones: the sanitizer mutates its own copy, but two references to
      // ONE object in the pre-sanitize fixture would make the "sentinels are
      // present before sanitizing" check pass for the wrong reason.
      blocks: JSON.parse(JSON.stringify(blocks)) as unknown[],
    },
  };
  // Parse so the fixtures are REAL (defaults filled, shapes verified) — a
  // fixture that drifted from the schema fails here, loudly, not downstream.
  return ActivityDocument.parse(raw);
}

export const wireOf = (value: unknown) => JSON.stringify(value);

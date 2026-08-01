// =============================================================================
// fixtures/index.ts — generated sanitized fixtures (S3 ruling D13)
// -----------------------------------------------------------------------------
// ONE source of truth for "what a served block looks like": realistic authored
// blocks (answers present, Algebra-I flavored) that are ALWAYS pushed through
// the real pipeline — ActivityDocument.parse (defaults filled, shapes
// verified) → sanitizeActivityDocument → optionally applyServeShuffles. The
// post-sanitize shapes are NEVER hand-authored here; they are computed, so a
// SanitizeSpec or SANITIZER_REV change updates every consumer automatically
// (the drift class the S2 cache design avoids, avoided again).
//
// Consumers: the family conformance factory, component unit tests, and the
// /dev/viewer harness route. Import via `@activity/viewer/fixtures` — kept off
// the package root so app production code can't pick fixtures up by accident.
//
// Determinism: ids come from a counter-based v4-shaped uuid, so two calls (or
// two processes) produce byte-identical documents — snapshot- and
// harness-deep-link-stable. The serve-shuffle seed is fixed for the same
// reason. tests/fixtures.test.ts guards completeness (every registry entry +
// every declared interaction variant has a fixture) and determinism.
// =============================================================================

import {
  ActivityDocument,
  createEmptyDocument,
  type Block,
} from '@activity/schema';
import { blockRegistry, registeredBlockTypes } from '../registry/registry.js';
import type { BlockType } from '../registry/types.js';
import {
  sanitizeActivityDocument,
  sanitizeBlock,
} from '../sanitize/sanitize.js';
import { applyServeShuffles } from '../sanitize/shuffle.js';
import type {
  SanitizedActivityDocument,
  SanitizedBlock,
} from '../sanitize/sanitized-types.js';

/** The deterministic per-(version, student) seed the fixture "student" gets. */
export const FIXTURE_SHUFFLE_SEED = 'fixture-version:fixture-student';

// Counter-based v4-shaped uuid — valid for Zod's .uuid(), stable across runs.
function makeIds() {
  let n = 0;
  return () => {
    n += 1;
    return `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
  };
}

const text = (t: string) => ({ type: 'text' as const, text: t });

// ---- Authored blocks --------------------------------------------------------
// One PRIMARY instance per registered type; the three variant-carrying blocks
// add one instance per declared interaction variant. Content is realistic —
// answer keys are present and meaningful, so sanitize visibly strips them and
// component fixtures look like real worksheets, not lorem ipsum.

function authoredRawByType(
  fid: () => string,
): Map<BlockType, Record<string, unknown>[]> {
  const m = new Map<BlockType, Record<string, unknown>[]>();
  const put = (type: BlockType, ...blocks: Record<string, unknown>[]) =>
    m.set(type, blocks);

  put('heading', {
    id: fid(),
    type: 'heading',
    level: 2,
    content: [text('Slope-intercept form')],
  });
  put('paragraph', {
    id: fid(),
    type: 'paragraph',
    content: [
      text('A line in slope-intercept form is written '),
      { type: 'math_inline', latex: 'y = mx + b' },
      text(', where m is the '),
      // A DEFINED TERM lives in the fixture set on purpose. Definitions are an
      // inline MARK, not a block, so no per-block fixture can carry one — and
      // without one here, the print glossary appendix would have nothing to
      // render and the gate's document/definition-glossary case would pass
      // vacuously (the empty-activity trap this repo has hit before: a leak
      // scan against a document with no secrets in it).
      {
        type: 'text',
        text: 'slope',
        marks: [
          {
            type: 'definition',
            content: [
              {
                id: fid(),
                type: 'paragraph',
                content: [
                  { type: 'text', text: 'How steep the line is: rise over run.' },
                ],
              },
            ],
          },
        ],
      },
      text(' and b is the y-intercept.'),
    ],
  });
  put('math_block', {
    id: fid(),
    type: 'math_block',
    latex: 'y = \\placeholder[g1]{}x + 4',
    prompts: [
      {
        id: 'g1',
        answer: '3',
        acceptableAnswers: ['3.0'],
        equivalence: 'value',
      },
    ],
    solution: [text('The line rises 3 for every 1 across, so m = 3.')],
  });
  put('image', {
    id: fid(),
    type: 'image',
    src: 'https://fixtures.invalid/graph-of-line.png',
    alt: 'A line crossing the y-axis at 4',
  });
  // All FOUR variants, because the print rule that matters about callouts is
  // that they stay distinguishable in grayscale — which cannot be checked with
  // one of them. (The gate caught this: warning/success/note had no fixture and
  // the checks were silently running against the info callout.)
  put(
    'callout',
    {
      id: fid(),
      type: 'callout',
      variant: 'info',
      content: [text('Slope is rise over run — watch the sign.')],
    },
    {
      id: fid(),
      type: 'callout',
      variant: 'warning',
      content: [text('A negative slope falls from left to right.')],
    },
    {
      id: fid(),
      type: 'callout',
      variant: 'success',
      content: [text('Nicely done — that is the y-intercept.')],
    },
    {
      id: fid(),
      type: 'callout',
      variant: 'note',
      content: [text('Vertical lines have no slope at all.')],
    },
  );
  put('problem', {
    id: fid(),
    type: 'problem',
    content: [text('Find the slope of the line through (1, 7) and (3, 13).')],
    solution: [text('m = (13 − 7) / (3 − 1) = 3.')],
  });
  put('fill_in_blank', {
    id: fid(),
    type: 'fill_in_blank',
    content: [
      text('The slope of '),
      { type: 'math_inline', latex: 'y = 3x + 4' },
      text(' is '),
      {
        type: 'blank',
        id: fid(),
        answer: '3',
        acceptableAnswers: ['3.0'],
        width: 6,
        hint: [text('Look at the coefficient of x.')],
        mistakeFeedback: [
          { match: '4', feedback: [text('4 is the y-intercept, not the slope.')] },
        ],
        answerType: 'math',
        equivalence: 'value',
      },
      text('.'),
    ],
    solution: [text('The coefficient of x is the slope: 3.')],
  });
  put('bullet_list', {
    id: fid(),
    type: 'bullet_list',
    items: [
      { id: fid(), content: [text('Positive slope: rises left to right')] },
      { id: fid(), content: [text('Negative slope: falls left to right')] },
    ],
  });
  put('ordered_list', {
    id: fid(),
    type: 'ordered_list',
    items: [
      { id: fid(), content: [text('Plot the y-intercept')] },
      { id: fid(), content: [text('Use the slope to find a second point')] },
    ],
  });

  const graphBase = () => ({
    type: 'interactive_graph',
    prompt: [text('Graph the line y = 2x − 1.')],
    axisConfig: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
    solution: [text('The line passes through (0, −1) with slope 2.')],
  });
  const linear = { family: 'linear' as const, slope: 2, intercept: -1 };
  put(
    'interactive_graph',
    {
      ...graphBase(),
      id: fid(),
      interaction: {
        type: 'plot_function',
        models: [linear],
      },
    },
    {
      ...graphBase(),
      id: fid(),
      prompt: [text('Plot the y-intercept of y = 2x − 1.')],
      interaction: { type: 'plot_point', correctPoints: [[0, -1]], tolerance: 0.5 },
    },
    {
      ...graphBase(),
      id: fid(),
      prompt: [text('Shade the triangle with the given vertices.')],
      interaction: {
        type: 'shade_region',
        regions: [
          {
            correctVertices: [
              [0, 0],
              [4, 0],
              [0, 4],
            ],
          },
        ],
      },
    },
    {
      ...graphBase(),
      id: fid(),
      prompt: [text('Graph y > 2x − 1.')],
      interaction: {
        type: 'graph_inequality',
        inequalities: [{ boundary: linear, strict: true, shadeSide: 'above' }],
      },
    },
    {
      ...graphBase(),
      id: fid(),
      prompt: [text('Draw the ray from (0, 0) through (3, 3).')],
      interaction: {
        type: 'plot_ray',
        rays: [{ from: [0, 0], through: [3, 3], tolerance: 0.5 }],
      },
    },
    {
      ...graphBase(),
      id: fid(),
      prompt: [text('Draw the segment from (−2, 1) to (2, 3).')],
      interaction: {
        type: 'plot_segment',
        segments: [{ from: [-2, 1], to: [2, 3], tolerance: 0.5 }],
      },
    },
    {
      ...graphBase(),
      id: fid(),
      prompt: [text('The graph shows y = 2x − 1.')],
      interaction: {
        type: 'display',
        drawables: [{ kind: 'point', at: [0, -1] }],
      },
    },
  );

  put('multiple_choice', {
    id: fid(),
    type: 'multiple_choice',
    prompt: [text('What is the slope of y = 3x + 4?')],
    choices: [
      {
        id: fid(),
        content: [text('3')],
        correct: true,
        feedback: [text('Right — the coefficient of x.')],
      },
      {
        id: fid(),
        content: [text('4')],
        correct: false,
        feedback: [text('4 is the y-intercept.')],
      },
      { id: fid(), content: [text('7')], correct: false },
    ],
    solution: [text('The slope is the coefficient of x: 3.')],
  });

  const matchItemA = fid();
  const matchItemB = fid();
  const matchTargetA = fid();
  const matchTargetB = fid();
  put('matching', {
    id: fid(),
    type: 'matching',
    prompt: [text('Match each equation to its slope.')],
    items: [
      { id: matchItemA, content: [text('y = 5x − 2')] },
      { id: matchItemB, content: [text('y = −x + 3')] },
    ],
    targets: [
      { id: matchTargetA, content: [text('5')] },
      { id: matchTargetB, content: [text('−1')] },
    ],
    key: { [matchItemA]: matchTargetA, [matchItemB]: matchTargetB },
    solution: [text('Read the coefficient of x in each equation.')],
  });

  put('ordering', {
    id: fid(),
    type: 'ordering',
    prompt: [text('Order the steps for solving 2x + 3 = 11.')],
    items: [
      { id: fid(), content: [text('Start from 2x + 3 = 11')] },
      { id: fid(), content: [text('Subtract 3 from both sides')] },
      { id: fid(), content: [text('Simplify to 2x = 8')] },
      { id: fid(), content: [text('Divide both sides by 2')] },
      { id: fid(), content: [text('Simplify to x = 4')] },
      { id: fid(), content: [text('Check: 2(4) + 3 = 11')] },
    ],
    solution: [text('Undo addition first, then division.')],
  });

  const nlBase = () => ({
    type: 'number_line',
    prompt: [text('Plot the solution of x + 2 = 5.')],
    config: { min: 0, max: 10 },
    solution: [text('x = 3.')],
  });
  put(
    'number_line',
    {
      ...nlBase(),
      id: fid(),
      interaction: { type: 'plot_point', correctPoints: [3], tolerance: 0.25 },
    },
    {
      ...nlBase(),
      id: fid(),
      prompt: [text('Graph the interval 2 ≤ x < 7.')],
      interaction: {
        type: 'plot_interval',
        correctInterval: { min: 2, minStyle: 'closed', max: 7, maxStyle: 'open' },
        tolerance: 0.25,
      },
    },
  );

  const dpBase = () => ({
    type: 'data_plot',
    prompt: [text('The quiz scores were 3, 5, 5, 6, 8.')],
    data: [3, 5, 5, 6, 8],
    config: { min: 0, max: 10 },
    solution: [text('Five dots, one per score, stacked at repeats.')],
  });
  put(
    'data_plot',
    { ...dpBase(), id: fid(), interaction: { type: 'build_dotplot' } },
    {
      ...dpBase(),
      id: fid(),
      interaction: { type: 'display', chart: 'dotplot' },
    },
    { ...dpBase(), id: fid(), interaction: { type: 'build_histogram' } },
    {
      ...dpBase(),
      id: fid(),
      interaction: { type: 'build_boxplot', tolerance: 0.25 },
    },
  );

  put('learning_objectives', {
    id: fid(),
    type: 'learning_objectives',
    title: 'Objectives',
    items: [
      [text('Identify slope and intercept from an equation')],
      [text('Graph a line from slope-intercept form')],
    ],
  });
  put('worked_example', {
    id: fid(),
    type: 'worked_example',
    title: 'Worked example',
    content: [
      {
        id: fid(),
        type: 'paragraph',
        content: [text('Solve 2x + 3 = 11 by undoing each operation.')],
      },
      {
        id: fid(),
        type: 'math_block',
        latex: '2x = \\placeholder[g2]{}',
        prompts: [{ id: 'g2', answer: '8' }],
        solution: [text('Subtracting 3 from both sides leaves 2x = 8.')],
      },
    ],
  });
  put('faded_worked_example', {
    id: fid(),
    type: 'faded_worked_example',
    title: 'Guided practice',
    content: [
      {
        id: fid(),
        type: 'fill_in_blank',
        content: [
          text('2x = 8, so x = '),
          {
            id: fid(),
            type: 'blank',
            answer: '4',
            acceptableAnswers: ['4.0'],
            mistakeFeedback: [
              { match: '16', feedback: [text('Divide, do not multiply.')] },
            ],
          },
          text('.'),
        ],
        solution: [text('Divide both sides by 2.')],
      },
    ],
  });
  put('self_explanation', {
    id: fid(),
    type: 'self_explanation',
    prompt: [text('Why do we subtract 3 before dividing by 2?')],
  });
  put('short_answer', {
    id: fid(),
    type: 'short_answer',
    prompt: [text('Explain what the y-intercept means on this graph.')],
    rubric: {
      criteria: [
        {
          id: fid(),
          label: 'Names the point where x = 0',
          maxPoints: 2,
          description: 'Identifies (0, b) as where the line crosses the y-axis.',
        },
      ],
    },
  });
  put('essay', {
    id: fid(),
    type: 'essay',
    prompt: [text('Describe a real situation modeled by y = 15x + 40.')],
    rubric: {
      criteria: [
        { id: fid(), label: 'Interprets slope as a rate', maxPoints: 3 },
      ],
    },
  });
  put('graph_figure', {
    id: fid(),
    type: 'graph_figure',
    axis: { xMin: -5, xMax: 5, yMin: -5, yMax: 5 },
    drawables: [{ kind: 'point', at: [0, -1] }],
  });

  return m;
}

// ---- Assembly + the public accessors ---------------------------------------

interface BuiltFixtures {
  document: ActivityDocument;
  /** Every parsed instance per type, primary first. */
  byType: Map<BlockType, Block[]>;
}

function build(): BuiltFixtures {
  const fid = makeIds();
  const raw = authoredRawByType(fid);
  const rowId = makeIds();
  // Registry order, primaries and variants inline — one block per row.
  const blocks = registeredBlockTypes.flatMap((type) => raw.get(type) ?? []);
  const empty = createEmptyDocument({ title: 'Fixture worksheet' });
  const document = ActivityDocument.parse({
    ...JSON.parse(JSON.stringify(empty)),
    sections: [
      {
        id: 'ffffffff-ffff-4fff-8fff-000000000001',
        isCheckpoint: false,
        rows: blocks.map((block) => ({
          id: `ffffffff-ffff-4fff-8fff-1${rowId().slice(-11)}`,
          gridLines: 'inherit',
          columns: [
            { id: `ffffffff-ffff-4fff-8fff-2${rowId().slice(-11)}`, blocks: [block] },
          ],
        })),
      },
    ],
  });
  const byType = new Map<BlockType, Block[]>();
  for (const section of document.sections) {
    for (const row of section.rows) {
      for (const column of row.columns) {
        for (const block of column.blocks) {
          const list = byType.get(block.type as BlockType) ?? [];
          list.push(block);
          byType.set(block.type as BlockType, list);
        }
      }
    }
  }
  return { document, byType };
}

let cache: BuiltFixtures | null = null;
function built(): BuiltFixtures {
  cache ??= build();
  return cache;
}

/** The full authored (pre-sanitize) fixture document, schema-parsed. */
export function authoredFixtureDocument(): ActivityDocument {
  return structuredClone(built().document);
}

/** The primary authored instance for a type (answers present). */
export function authoredBlockFixture(type: BlockType): Block {
  const list = built().byType.get(type);
  if (!list?.[0]) throw new Error(`No authored fixture for block type "${type}"`);
  return structuredClone(list[0]);
}

/** Every authored instance for a type — one per interaction variant for the
 * three variant blocks, primary first. */
export function authoredVariantFixtures(type: BlockType): Block[] {
  const list = built().byType.get(type);
  if (!list?.length) throw new Error(`No authored fixtures for block type "${type}"`);
  return structuredClone(list);
}

/** What a component actually receives: the primary fixture through the REAL
 * sanitizer. */
export function sanitizedBlockFixture(type: BlockType): SanitizedBlock {
  return sanitizeBlock(authoredBlockFixture(type));
}

/** Every variant instance for a type, sanitized. */
export function sanitizedVariantFixtures(type: BlockType): SanitizedBlock[] {
  return authoredVariantFixtures(type).map((block) => sanitizeBlock(block));
}

/** The full fixture document through the real sanitizer (pre-shuffle — the
 * cacheable, student-independent artifact). */
export function sanitizedFixtureDocument(): SanitizedActivityDocument {
  return sanitizeActivityDocument(built().document);
}

/** The document as the fixture student is SERVED it: sanitized + the real
 * serve-time shuffles (ordering arrives permuted, exactly like production). */
export function servedFixtureDocument(
  seed: string = FIXTURE_SHUFFLE_SEED,
): SanitizedActivityDocument {
  return applyServeShuffles(sanitizedFixtureDocument(), seed);
}

/** Registry re-export so fixture consumers can iterate without a second
 * import path. */
export { blockRegistry, registeredBlockTypes };

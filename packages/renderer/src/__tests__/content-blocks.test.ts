// =============================================================================
// content-blocks.test.ts — renderLearningObjectives / renderWorkedExample
// -----------------------------------------------------------------------------
// Pure content blocks: the correct data-block-category ("content", so the
// runtime never scores or indexes them), the emitted structure (title + list /
// title + nested body), title escaping, empty-item dropping, and that a worked
// example recurses its children through the shared block dispatch.
// =============================================================================

import { describe, it, expect } from 'vitest';
import { renderLearningObjectives } from '../blocks/learning-objectives.js';
import { renderWorkedExample } from '../blocks/worked-example.js';
import { renderFadedWorkedExample } from '../blocks/faded-worked-example.js';
import type { BlockRenderContext } from '../blocks/index.js';
import {
  LearningObjectivesBlock,
  WorkedExampleBlock,
  FadedWorkedExampleBlock,
} from '@activity/schema';

const OID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const WID = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
const text = (t: string) => [{ type: 'text' as const, text: t }];
const CTX: BlockRenderContext = { nextProblemNumber: () => 0 };

describe('renderLearningObjectives', () => {
  const block = LearningObjectivesBlock.parse({
    id: OID,
    type: 'learning_objectives',
    title: 'Goals for today',
    items: [text('Solve linear equations'), text('Graph a line'), []],
  });
  const html = renderLearningObjectives(block);

  it('is tagged as content (never scored/indexed)', () => {
    expect(html).toContain('data-block-category="content"');
    expect(html).toContain('data-block-type="learning_objectives"');
    expect(html).toContain('data-block-id="' + OID + '"');
  });

  it('renders the title and one <li> per non-empty item', () => {
    expect(html).toContain('Goals for today');
    const items = html.match(/<li /g) ?? [];
    expect(items).toHaveLength(2); // the empty third item is dropped
    expect(html).toContain('Solve linear equations');
  });

  it('escapes the title', () => {
    const b = LearningObjectivesBlock.parse({
      id: OID,
      type: 'learning_objectives',
      title: 'A & B <goals>',
      items: [],
    });
    const out = renderLearningObjectives(b);
    expect(out).toContain('A &amp; B &lt;goals&gt;');
    expect(out).not.toContain('<goals>');
  });
});

describe('renderWorkedExample', () => {
  const block = WorkedExampleBlock.parse({
    id: WID,
    type: 'worked_example',
    title: 'Solving 2x + 3 = 11',
    content: [
      { id: 'eeeeeeee-eeee-4eee-8eee-000000000001', type: 'paragraph', content: text('Subtract 3 from both sides.') },
      { id: 'eeeeeeee-eeee-4eee-8eee-000000000002', type: 'math_block', latex: 'x = 4' },
    ],
  });
  const html = renderWorkedExample(block, CTX);

  it('is tagged as content', () => {
    expect(html).toContain('data-block-category="content"');
    expect(html).toContain('data-block-type="worked_example"');
    expect(html).toContain('data-block-id="' + WID + '"');
  });

  it('renders the title and recurses nested children', () => {
    expect(html).toContain('Solving 2x + 3 = 11');
    expect(html).toContain('Subtract 3 from both sides.');
    // The math_block child rendered through the shared dispatch.
    expect(html).toContain('data-block-type="math_block"');
  });
});

describe('renderFadedWorkedExample', () => {
  const FID = 'ffffffff-ffff-4fff-8fff-ffffffffffff';
  let problemNum = 0;
  const ctx: BlockRenderContext = { nextProblemNumber: () => ++problemNum };
  const block = FadedWorkedExampleBlock.parse({
    id: FID,
    type: 'faded_worked_example',
    title: 'Guided practice',
    content: [
      { id: 'ffffffff-ffff-4fff-8fff-000000000001', type: 'paragraph', content: text('First, subtract 3.') },
      {
        id: 'ffffffff-ffff-4fff-8fff-000000000002',
        type: 'fill_in_blank',
        content: [
          { type: 'text', text: 'x = ', marks: [] },
          { type: 'blank', id: 'ffffffff-ffff-4fff-8fff-000000000003', answer: '4', acceptableAnswers: [] },
        ],
        skills: [],
      },
    ],
  });
  const html = renderFadedWorkedExample(block, ctx);

  it('is tagged as a scaffold shell (scoring rides its child blanks)', () => {
    expect(html).toContain('data-block-category="scaffold"');
    expect(html).toContain('data-block-type="faded_worked_example"');
    expect(html).toContain('data-block-id="' + FID + '"');
  });

  it('renders shown steps and recurses the faded fill_in_blank step', () => {
    expect(html).toContain('First, subtract 3.');
    // The nested fill_in_blank rendered with its own runtime markup — this is
    // what init.ts scans each section for, so scoring works with no new runtime.
    expect(html).toContain('data-block-type="fill_in_blank"');
    expect(html).toContain('blank'); // the blank input carries the .blank hook
    // The faded step pulled a problem number from the shared sequence.
    expect(html).toContain('block-problem-number');
  });
});

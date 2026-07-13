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
import { renderSelfExplanation } from '../blocks/self-explanation.js';
import { renderShortAnswer, renderEssay } from '../blocks/free-response.js';
import type { BlockRenderContext } from '../blocks/index.js';
import {
  LearningObjectivesBlock,
  WorkedExampleBlock,
  FadedWorkedExampleBlock,
  SelfExplanationBlock,
  ShortAnswerBlock,
  EssayBlock,
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
  });

  it('numbers the box once (in the title) and letters the faded step', () => {
    // The box owns the single problem number, leading its title…
    expect(html).toContain('block-faded-example__number');
    expect(html).toContain('>1.</span>');
    // …and the faded step is gutter-less with a compact "(a)" label, NOT a
    // standalone problem-number gutter.
    expect(html).toContain('is-faded-step');
    expect(html).toContain('block-faded-step__label');
    expect(html).toContain('(a)');
    expect(html).not.toContain('block-problem-number');
    // Only one number was drawn from the sequence (the box).
    expect(problemNum).toBe(1);
  });

  it('drops the step letters when showStepLabels is false', () => {
    const bare = renderFadedWorkedExample(
      FadedWorkedExampleBlock.parse({ ...block, showStepLabels: false }),
      { nextProblemNumber: () => 5 },
    );
    expect(bare).toContain('is-faded-step');
    expect(bare).not.toContain('block-faded-step__label');
    expect(bare).toContain('>5.</span>'); // box still numbered
  });
});

describe('renderSelfExplanation', () => {
  const SID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const block = SelfExplanationBlock.parse({
    id: SID,
    type: 'self_explanation',
    prompt: text('Explain why you subtracted 3.'),
    placeholder: 'I subtracted 3 because…',
  });
  const html = renderSelfExplanation(block);

  it('is a question-category block that carries no answer key', () => {
    expect(html).toContain('data-block-category="question"');
    expect(html).toContain('data-block-type="self_explanation"');
    expect(html).toContain('data-block-id="' + SID + '"');
    // Ungraded: no problem number, no answer-key attribute.
    expect(html).not.toContain('block-problem-number');
    expect(html).not.toContain('answer-key');
  });

  it('renders the prompt and a response textarea with the placeholder', () => {
    expect(html).toContain('Explain why you subtracted 3.');
    expect(html).toContain('<textarea');
    expect(html).toContain('self-explanation-input');
    expect(html).toContain('data-for-block="' + SID + '"');
    expect(html).toContain('placeholder="I subtracted 3 because…"');
  });

  it('omits the placeholder attribute when none is set', () => {
    const bare = SelfExplanationBlock.parse({
      id: SID,
      type: 'self_explanation',
      prompt: text('Explain.'),
    });
    expect(renderSelfExplanation(bare)).not.toContain('placeholder=');
  });
});

describe('renderShortAnswer + renderEssay (manually-graded free text)', () => {
  const SAID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  const ESID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

  it('short_answer: question category, shared .free-text-input, no answer key', () => {
    const block = ShortAnswerBlock.parse({
      id: SAID,
      type: 'short_answer',
      prompt: text('Summarize the passage.'),
      placeholder: 'In your own words…',
    });
    const html = renderShortAnswer(block);
    expect(html).toContain('data-block-category="question"');
    expect(html).toContain('data-block-type="short_answer"');
    expect(html).toContain('data-block-id="' + SAID + '"');
    expect(html).toContain('class="free-text-input"');
    expect(html).toContain('data-for-block="' + SAID + '"');
    expect(html).toContain('placeholder="In your own words…"');
    expect(html).not.toContain('block-problem-number');
    expect(html).not.toContain('answer-key');
    expect(html).not.toContain('free-text-wordcount'); // short answer has no counter
    // Manual-feedback mount point (hidden until the sidecar fills it).
    expect(html).toContain('class="free-text-feedback"');
  });

  it('essay: renders a live word counter with the target range in data-*', () => {
    const block = EssayBlock.parse({
      id: ESID,
      type: 'essay',
      prompt: text('Write a persuasive essay.'),
      wordCountHint: { min: 200, max: 300 },
    });
    const html = renderEssay(block);
    expect(html).toContain('data-block-type="essay"');
    expect(html).toContain('class="free-text-input"');
    expect(html).toContain('free-text-wordcount');
    expect(html).toContain('data-word-min="200"');
    expect(html).toContain('data-word-max="300"');
  });

  it('essay: omits target data-* when no word-count hint is set', () => {
    const bare = EssayBlock.parse({
      id: ESID,
      type: 'essay',
      prompt: text('Write freely.'),
    });
    const html = renderEssay(bare);
    expect(html).toContain('free-text-wordcount'); // counter still present
    expect(html).not.toContain('data-word-min');
    expect(html).not.toContain('data-word-max');
  });
});

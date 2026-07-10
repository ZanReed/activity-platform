// =============================================================================
// multiple-choice-figures.test.ts — per-choice image/graph figures
// -----------------------------------------------------------------------------
// The optional MultipleChoiceOption.image / .graph figures: markup emission
// inside the choice label (clicking the figure selects the choice), the
// kit-free static graph SVG, and the ≥2-figures 2-up grid class. The MC
// runtime contract (data-mc-answer, data-choice-id, feedback slots) is pinned
// by the runtime suite's fixtures; this file covers only the figure layer.
// =============================================================================

import { describe, it, expect } from 'vitest';
import { renderMultipleChoice } from '../blocks/multiple-choice.js';
import { MultipleChoiceBlock } from '@activity/schema';

const BLOCK_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const A = 'bbbbbbbb-bbbb-4bbb-8bbb-000000000001';
const B = 'bbbbbbbb-bbbb-4bbb-8bbb-000000000002';
const C = 'bbbbbbbb-bbbb-4bbb-8bbb-000000000003';

const AXIS = { xMin: -5, xMax: 5, yMin: -5, yMax: 5 };

type ChoiceSeed = {
  id: string;
  correct?: boolean;
  image?: { src: string; alt?: string };
  graph?: { axis: typeof AXIS; drawables?: unknown[] };
};

function block(choices: ChoiceSeed[]): MultipleChoiceBlock {
  return MultipleChoiceBlock.parse({
    id: BLOCK_ID,
    type: 'multiple_choice',
    prompt: [{ type: 'text', text: 'Which one?' }],
    choices: choices.map((c) => ({
      id: c.id,
      content: [{ type: 'text', text: 'choice' }],
      correct: c.correct ?? false,
      ...(c.image ? { image: c.image } : {}),
      ...(c.graph ? { graph: c.graph } : {}),
    })),
  });
}

const CTX = { problemNumber: 1 };

describe('renderMultipleChoice figures', () => {
  it('emits no figure markup for plain text choices', () => {
    const html = renderMultipleChoice(block([{ id: A, correct: true }, { id: B }]), CTX);
    expect(html).not.toContain('mc-choice-figure');
    expect(html).not.toContain('mc-choices-grid');
  });

  it('renders an image figure inside the choice label', () => {
    const html = renderMultipleChoice(
      block([
        { id: A, correct: true, image: { src: 'https://example.com/fig.png', alt: 'a triangle' } },
        { id: B },
      ]),
      CTX,
    );
    expect(html).toContain('<span class="mc-choice-figure">');
    expect(html).toContain('src="https://example.com/fig.png"');
    expect(html).toContain('alt="a triangle"');
    expect(html).toContain('loading="lazy"');
    // The figure sits before the label close so it participates in the label.
    const label = html.slice(html.indexOf('<label'), html.indexOf('</label>'));
    expect(label).toContain('mc-choice-figure');
  });

  it('renders a static graph SVG namespaced by block+choice id', () => {
    const html = renderMultipleChoice(
      block([
        {
          id: A,
          correct: true,
          graph: { axis: AXIS, drawables: [{ kind: 'point', at: [1, 2] }] },
        },
        { id: B },
      ]),
      CTX,
    );
    expect(html).toContain('class="graph-paper"');
    // SVG-internal ids are document-global; each choice graph must own its own.
    expect(html).toContain(`gclip-${BLOCK_ID}-${A}`);
  });

  it('escapes attribute-breaking image URLs and alt text', () => {
    const html = renderMultipleChoice(
      block([
        {
          id: A,
          correct: true,
          image: { src: 'https://example.com/a.png?x=1&y=2', alt: 'says "hi" & more' },
        },
        { id: B },
      ]),
      CTX,
    );
    expect(html).toContain('x=1&amp;y=2');
    expect(html).toContain('says &quot;hi&quot; &amp; more');
  });

  it('one figured choice keeps the vertical list (no grid class)', () => {
    const html = renderMultipleChoice(
      block([
        { id: A, correct: true, image: { src: 'https://example.com/a.png' } },
        { id: B },
        { id: C },
      ]),
      CTX,
    );
    expect(html).not.toContain('mc-choices-grid');
  });

  it('two or more figured choices switch to the 2-up grid', () => {
    const html = renderMultipleChoice(
      block([
        { id: A, correct: true, graph: { axis: AXIS } },
        { id: B, graph: { axis: AXIS } },
        { id: C },
      ]),
      CTX,
    );
    expect(html).toContain('class="mc-choices mc-choices-grid"');
  });

  it('a choice may carry both image and graph — image first', () => {
    const html = renderMultipleChoice(
      block([
        {
          id: A,
          correct: true,
          image: { src: 'https://example.com/a.png' },
          graph: { axis: AXIS },
        },
        { id: B },
      ]),
      CTX,
    );
    const fig = html.slice(html.indexOf('mc-choice-figure'));
    expect(fig.indexOf('<img')).toBeGreaterThan(-1);
    expect(fig.indexOf('<svg')).toBeGreaterThan(fig.indexOf('<img'));
  });
});

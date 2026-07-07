// =============================================================================
// interactive-graph-display.test.ts — the static (display-mode) graph renderer
// -----------------------------------------------------------------------------
// A display-mode interactive_graph is ungraded content: it emits the read-only
// figure markup (data-graph-drawables, role="img"), is categorized as content
// (not a question), and — crucially — does NOT pull from the problem-number
// sequence, so graded blocks around it keep numbering right.
// =============================================================================

import { describe, it, expect } from 'vitest';
import { renderBlock, isNumberedBlock } from '../blocks/index.js';
import { InteractiveGraphBlock } from '@activity/schema';

const AXIS = { xMin: -10, xMax: 10, yMin: -10, yMax: 10 };

const displayBlock = () =>
  InteractiveGraphBlock.parse({
    id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    type: 'interactive_graph',
    prompt: [],
    axisConfig: AXIS,
    interaction: {
      type: 'display',
      drawables: [
        { kind: 'point', at: [2, 3], label: 'A' },
        { kind: 'curve', model: { family: 'linear', slope: 1, intercept: 0 } },
      ],
    },
  });

const gradedBlock = () =>
  InteractiveGraphBlock.parse({
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    type: 'interactive_graph',
    prompt: [],
    axisConfig: AXIS,
    interaction: { type: 'plot_point', correctPoints: [[1, 1]] },
  });

// A number source that FAILS the test if a display block ever pulls a number.
const throwingCtx = () => ({
  nextProblemNumber: (): number => {
    throw new Error('display graph must not pull a problem number');
  },
});

describe('display-mode interactive_graph rendering', () => {
  it('emits the static-figure markup, not the graded shell', () => {
    const html = renderBlock(displayBlock(), throwingCtx());
    expect(html).toContain('data-graph-interaction-type="display"');
    expect(html).toContain('data-graph-drawables=');
    expect(html).toContain('block-graph-display');
    expect(html).toContain('role="img"');
    // No graded chrome: no answer key, no problem number, categorized as content.
    expect(html).not.toContain('data-graph-answer-key');
    expect(html).not.toContain('block-problem-number');
    expect(html).toContain('data-block-category="content"');
  });

  it('does not consume a problem number (throwingCtx never fires)', () => {
    expect(() => renderBlock(displayBlock(), throwingCtx())).not.toThrow();
  });

  it('a graded graph still pulls its number', () => {
    let n = 0;
    const html = renderBlock(gradedBlock(), { nextProblemNumber: () => ++n });
    expect(n).toBe(1);
    expect(html).toContain('data-graph-answer-key');
    expect(html).toContain('data-graph-interaction-type="plot_point"');
  });

  it('omits the caption box for an empty prompt (standalone exemplar)', () => {
    const html = renderBlock(displayBlock(), throwingCtx());
    expect(html).not.toContain('graph-caption');
  });

  it('isNumberedBlock: false for display, true for graded', () => {
    expect(isNumberedBlock(displayBlock())).toBe(false);
    expect(isNumberedBlock(gradedBlock())).toBe(true);
  });
});

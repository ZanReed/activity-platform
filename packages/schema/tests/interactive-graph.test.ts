// =============================================================================
// interactive-graph.test.ts — InteractiveGraphBlock (Phase 2.7, Stage 5)
// -----------------------------------------------------------------------------
// The graded graph block's schema: axis config defaults, the plot_point
// interaction, block-level defaults, factory validity, and membership in the
// top-level Block union. Submission-side (graphResponses) coverage lives in
// submission.test.ts.
// =============================================================================
import { describe, it, expect } from 'vitest';
import {
  InteractiveGraphBlock,
  AxisConfig,
  Block,
  createInteractiveGraphBlock,
} from '../src/index.js';

const baseGraph = () => ({
  id: crypto.randomUUID(),
  type: 'interactive_graph' as const,
  prompt: [],
  axisConfig: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
  interaction: { type: 'plot_point' as const, correctPoints: [[3, 4]] },
});

describe('AxisConfig', () => {
  it('fills grid/show/snap defaults', () => {
    const cfg = AxisConfig.parse({ xMin: -5, xMax: 5, yMin: -5, yMax: 5 });
    expect(cfg.xGridStep).toBe(1);
    expect(cfg.yGridStep).toBe(1);
    expect(cfg.showGrid).toBe(true);
    expect(cfg.snapToGrid).toBe(true);
  });

  it('rejects a non-positive grid step', () => {
    const bad = { xMin: -5, xMax: 5, yMin: -5, yMax: 5, xGridStep: 0 };
    expect(AxisConfig.safeParse(bad).success).toBe(false);
  });
});

describe('InteractiveGraphBlock', () => {
  it('parses with defaults applied', () => {
    const parsed = InteractiveGraphBlock.parse(baseGraph());
    expect(parsed.hasConfidenceRating).toBe(false);
    expect(parsed.skills).toEqual([]);
    expect(parsed.interaction.tolerance).toBe(0.1);
    expect(parsed.axisConfig.snapToGrid).toBe(true);
  });

  it('accepts multiple correct points, a custom tolerance, confidence + skills', () => {
    const parsed = InteractiveGraphBlock.parse({
      ...baseGraph(),
      interaction: {
        type: 'plot_point',
        correctPoints: [[1, 2], [3, 4]],
        tolerance: 0.5,
      },
      hasConfidenceRating: true,
      skills: ['plotting points'],
    });
    expect(parsed.interaction.correctPoints).toHaveLength(2);
    expect(parsed.interaction.tolerance).toBe(0.5);
    expect(parsed.hasConfidenceRating).toBe(true);
  });

  it('requires at least one correct point', () => {
    const bad = { ...baseGraph(), interaction: { type: 'plot_point', correctPoints: [] } };
    expect(InteractiveGraphBlock.safeParse(bad).success).toBe(false);
  });

  it('rejects a negative tolerance', () => {
    const bad = {
      ...baseGraph(),
      interaction: { type: 'plot_point', correctPoints: [[0, 0]], tolerance: -1 },
    };
    expect(InteractiveGraphBlock.safeParse(bad).success).toBe(false);
  });

  it('rejects an unknown interaction type', () => {
    const bad = { ...baseGraph(), interaction: { type: 'plot_line', correctPoints: [[0, 0]] } };
    expect(InteractiveGraphBlock.safeParse(bad).success).toBe(false);
  });

  it('is a member of the Block union', () => {
    const parsed = Block.safeParse(InteractiveGraphBlock.parse(baseGraph()));
    expect(parsed.success).toBe(true);
  });
});

describe('createInteractiveGraphBlock factory', () => {
  it('produces schema-valid output', () => {
    expect(InteractiveGraphBlock.safeParse(createInteractiveGraphBlock()).success).toBe(true);
  });

  it('defaults to a symmetric plane with one correct point at the origin', () => {
    const block = createInteractiveGraphBlock();
    expect(block.axisConfig).toMatchObject({ xMin: -10, xMax: 10, yMin: -10, yMax: 10 });
    expect(block.interaction).toMatchObject({
      type: 'plot_point',
      correctPoints: [[0, 0]],
    });
  });
});

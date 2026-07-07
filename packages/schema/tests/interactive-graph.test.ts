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

describe('plot_function interaction (linear)', () => {
  const funcGraph = () => ({
    id: crypto.randomUUID(),
    type: 'interactive_graph' as const,
    prompt: [],
    axisConfig: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
    interaction: {
      type: 'plot_function' as const,
      model: { family: 'linear' as const, slope: 2, intercept: 3 },
    },
  });

  it('parses a linear plot_function with tolerance defaults', () => {
    const parsed = InteractiveGraphBlock.parse(funcGraph());
    expect(parsed.interaction.type).toBe('plot_function');
    if (parsed.interaction.type === 'plot_function' && parsed.interaction.model.family === 'linear') {
      expect(parsed.interaction.model.slope).toBe(2);
      expect(parsed.interaction.model.intercept).toBe(3);
      expect(parsed.interaction.model.slopeTolerance).toBe(0.1);
      expect(parsed.interaction.model.interceptTolerance).toBe(0.1);
    }
  });

  it('accepts custom tolerances', () => {
    const parsed = InteractiveGraphBlock.parse({
      ...funcGraph(),
      interaction: {
        type: 'plot_function',
        model: { family: 'linear', slope: 2, intercept: 3, slopeTolerance: 0.25, interceptTolerance: 0.5 },
      },
    });
    if (parsed.interaction.type === 'plot_function' && parsed.interaction.model.family === 'linear') {
      expect(parsed.interaction.model.slopeTolerance).toBe(0.25);
    }
  });

  it('rejects an unknown family', () => {
    const bad = {
      ...funcGraph(),
      interaction: { type: 'plot_function', model: { family: 'cubic', slope: 1, intercept: 0 } },
    };
    expect(InteractiveGraphBlock.safeParse(bad).success).toBe(false);
  });

  it('is a member of the Block union', () => {
    expect(Block.safeParse(InteractiveGraphBlock.parse(funcGraph())).success).toBe(true);
  });
});

describe('shade_region interaction', () => {
  const regionGraph = () => ({
    id: crypto.randomUUID(),
    type: 'interactive_graph' as const,
    prompt: [],
    axisConfig: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
    interaction: {
      type: 'shade_region' as const,
      correctVertices: [[0, 0], [4, 0], [2, 3]],
    },
  });

  it('parses a triangle region with the minOverlap default', () => {
    const parsed = InteractiveGraphBlock.parse(regionGraph());
    expect(parsed.interaction.type).toBe('shade_region');
    if (parsed.interaction.type === 'shade_region') {
      expect(parsed.interaction.correctVertices).toHaveLength(3);
      expect(parsed.interaction.minOverlap).toBe(0.9);
    }
  });

  it('requires at least three vertices', () => {
    const bad = {
      ...regionGraph(),
      interaction: { type: 'shade_region', correctVertices: [[0, 0], [4, 0]] },
    };
    expect(InteractiveGraphBlock.safeParse(bad).success).toBe(false);
  });

  it('rejects a minOverlap outside 0..1', () => {
    const bad = {
      ...regionGraph(),
      interaction: { type: 'shade_region', correctVertices: [[0, 0], [4, 0], [2, 3]], minOverlap: 1.5 },
    };
    expect(InteractiveGraphBlock.safeParse(bad).success).toBe(false);
  });

  it('is a member of the Block union', () => {
    expect(Block.safeParse(InteractiveGraphBlock.parse(regionGraph())).success).toBe(true);
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

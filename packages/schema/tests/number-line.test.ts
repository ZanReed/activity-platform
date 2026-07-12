// =============================================================================
// number-line.test.ts — NumberLineBlock (Phase 2.7, 1-D)
// -----------------------------------------------------------------------------
// The graded number-line block's schema: config defaults, the plot_point and
// plot_interval interactions, block-level defaults, factory validity, and
// membership in the top-level Block + ColumnCellBlock unions. Submission-side
// (numberLineResponses) coverage lives in submission.test.ts.
// =============================================================================
import { describe, it, expect } from 'vitest';
import {
  NumberLineBlock,
  NumberLineConfig,
  NumberLineInteraction,
  Block,
  ColumnCellBlock,
  createNumberLineBlock,
} from '../src/index.js';

const baseLine = () => ({
  id: crypto.randomUUID(),
  type: 'number_line' as const,
  prompt: [],
  config: { min: 0, max: 10 },
  interaction: { type: 'plot_point' as const, correctPoints: [5] },
});

describe('NumberLineConfig', () => {
  it('fills tick/minor/snap defaults', () => {
    const cfg = NumberLineConfig.parse({ min: -5, max: 5 });
    expect(cfg.tickStep).toBe(1);
    expect(cfg.minorTicksPerStep).toBe(0);
    expect(cfg.snapToTick).toBe(true);
  });

  it('rejects a non-positive tickStep', () => {
    expect(NumberLineConfig.safeParse({ min: 0, max: 10, tickStep: 0 }).success).toBe(
      false,
    );
  });
});

describe('NumberLineInteraction', () => {
  it('parses a plot_point with a default tolerance', () => {
    const i = NumberLineInteraction.parse({ type: 'plot_point', correctPoints: [3] });
    expect(i.type).toBe('plot_point');
    if (i.type === 'plot_point') expect(i.tolerance).toBe(0.1);
  });

  it('rejects a plot_point with no correct points', () => {
    expect(
      NumberLineInteraction.safeParse({ type: 'plot_point', correctPoints: [] }).success,
    ).toBe(false);
  });

  it('parses a bounded plot_interval with open/closed styles', () => {
    const i = NumberLineInteraction.parse({
      type: 'plot_interval',
      correctInterval: { min: -2, minStyle: 'closed', max: 4, maxStyle: 'open' },
    });
    expect(i.type).toBe('plot_interval');
    if (i.type === 'plot_interval') {
      expect(i.correctInterval.minStyle).toBe('closed');
      expect(i.tolerance).toBe(0.1);
    }
  });

  it('parses a ray plot_interval (one bound omitted)', () => {
    const parsed = NumberLineInteraction.safeParse({
      type: 'plot_interval',
      correctInterval: { min: 3, minStyle: 'closed' },
    });
    expect(parsed.success).toBe(true);
  });
});

describe('NumberLineBlock', () => {
  it('parses a minimal block and fills defaults', () => {
    const block = NumberLineBlock.parse(baseLine());
    expect(block.hasConfidenceRating).toBe(false);
    expect(block.skills).toEqual([]);
    expect(block.config.snapToTick).toBe(true);
  });

  it('is a member of the top-level Block union', () => {
    expect(Block.safeParse(baseLine()).success).toBe(true);
  });

  it('is a member of the ColumnCellBlock union (placeable in columns)', () => {
    expect(ColumnCellBlock.safeParse(baseLine()).success).toBe(true);
  });
});

describe('createNumberLineBlock', () => {
  it('produces a schema-valid default block', () => {
    const block = createNumberLineBlock();
    expect(NumberLineBlock.safeParse(block).success).toBe(true);
    expect(block.type).toBe('number_line');
  });
});

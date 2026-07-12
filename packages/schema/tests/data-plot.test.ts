// =============================================================================
// data-plot.test.ts — DataPlotBlock (Phase 2.7, statistics charts)
// -----------------------------------------------------------------------------
// The data_plot block's schema: config defaults (axis reused from
// NumberLineConfig + histogram extras), the display and build_dotplot
// interactions, block-level defaults, factory validity, and membership in the
// top-level Block + ColumnCellBlock unions. Submission-side (dataPlotResponses)
// coverage lives in submission.test.ts.
// =============================================================================
import { describe, it, expect } from 'vitest';
import {
  DataPlotBlock,
  DataPlotConfig,
  DataPlotInteraction,
  Block,
  ColumnCellBlock,
  createDataPlotBlock,
} from '../src/index.js';

const basePlot = () => ({
  id: crypto.randomUUID(),
  type: 'data_plot' as const,
  prompt: [],
  data: [3, 5, 5, 6, 8],
  config: { min: 0, max: 10 },
  interaction: { type: 'build_dotplot' as const },
});

describe('DataPlotConfig', () => {
  it('inherits the number-line axis defaults (tick/minor/snap)', () => {
    const cfg = DataPlotConfig.parse({ min: 0, max: 20 });
    expect(cfg.tickStep).toBe(1);
    expect(cfg.minorTicksPerStep).toBe(0);
    expect(cfg.snapToTick).toBe(true);
  });

  it('accepts optional histogram extras (binWidth, maxFrequency)', () => {
    const cfg = DataPlotConfig.parse({
      min: 0,
      max: 20,
      binWidth: 5,
      maxFrequency: 8,
    });
    expect(cfg.binWidth).toBe(5);
    expect(cfg.maxFrequency).toBe(8);
  });

  it('rejects a non-positive binWidth', () => {
    expect(
      DataPlotConfig.safeParse({ min: 0, max: 10, binWidth: 0 }).success,
    ).toBe(false);
  });

  it('rejects a non-integer maxFrequency', () => {
    expect(
      DataPlotConfig.safeParse({ min: 0, max: 10, maxFrequency: 2.5 }).success,
    ).toBe(false);
  });
});

describe('DataPlotInteraction', () => {
  it('parses a display interaction carrying the chart type', () => {
    const i = DataPlotInteraction.parse({ type: 'display', chart: 'boxplot' });
    expect(i.type).toBe('display');
    if (i.type === 'display') expect(i.chart).toBe('boxplot');
  });

  it('rejects a display interaction with an unknown chart', () => {
    expect(
      DataPlotInteraction.safeParse({ type: 'display', chart: 'pie' }).success,
    ).toBe(false);
  });

  it('parses a build_dotplot interaction (bare marker)', () => {
    const i = DataPlotInteraction.parse({ type: 'build_dotplot' });
    expect(i.type).toBe('build_dotplot');
  });
});

describe('DataPlotBlock', () => {
  it('parses a minimal block and fills defaults', () => {
    const block = DataPlotBlock.parse(basePlot());
    expect(block.hasConfidenceRating).toBe(false);
    expect(block.skills).toEqual([]);
    expect(block.config.snapToTick).toBe(true);
  });

  it('rejects an empty dataset', () => {
    expect(DataPlotBlock.safeParse({ ...basePlot(), data: [] }).success).toBe(
      false,
    );
  });

  it('is a member of the top-level Block union', () => {
    expect(Block.safeParse(basePlot()).success).toBe(true);
  });

  it('is a member of the ColumnCellBlock union (placeable in columns)', () => {
    expect(ColumnCellBlock.safeParse(basePlot()).success).toBe(true);
  });
});

describe('createDataPlotBlock', () => {
  it('produces a schema-valid default block', () => {
    const block = createDataPlotBlock();
    expect(DataPlotBlock.safeParse(block).success).toBe(true);
    expect(block.type).toBe('data_plot');
  });
});

import { describe, expect, it } from 'vitest';
import {
  Block,
  ChartBlock,
  CHART_MAX_CATEGORIES,
  CHART_MAX_SERIES,
  chartIsDrawable,
  createChartBlock,
} from '../src/index.js';

const base = {
  id: '11111111-1111-4111-8111-111111111111',
  type: 'chart' as const,
  chart: 'bar' as const,
  categories: ['Mon', 'Tue', 'Wed'],
  series: [{ values: [12, 7, 15] }],
};

describe('ChartBlock (Y7 charts, T9)', () => {
  it('parses a minimal bar chart and is a member of the Block union', () => {
    expect(ChartBlock.parse(base)).toEqual(base);
    expect(Block.parse(base).type).toBe('chart');
  });

  it('the factory output is valid and drawable', () => {
    const made = createChartBlock();
    expect(ChartBlock.safeParse(made).success).toBe(true);
    expect(chartIsDrawable(made)).toBe(true);
  });

  it('carries title, labels, alt, the axis override and sizing', () => {
    const full = {
      ...base,
      chart: 'clustered' as const,
      title: 'Books borrowed',
      xLabel: 'Day',
      yLabel: 'Number of books',
      alt: 'Bar chart of books borrowed',
      series: [
        { name: 'Walk', values: [12, 7, 15] },
        { name: 'Bus', values: [4, 6, 3] },
      ],
      yMax: 20,
      yStep: 5,
      width: 0.75,
      align: 'left' as const,
    };
    expect(ChartBlock.parse(full)).toEqual(full);
  });

  it('refuses a negative value: the baseline is always zero (Q7)', () => {
    expect(ChartBlock.safeParse({ ...base, series: [{ values: [1, -2, 3] }] }).success).toBe(false);
  });

  it('refuses more categories or series than the renderer lays out (N2)', () => {
    const cats = Array.from({ length: CHART_MAX_CATEGORIES + 1 }, (_, i) => `c${i}`);
    expect(
      ChartBlock.safeParse({ ...base, categories: cats, series: [{ values: cats.map(() => 1) }] })
        .success,
    ).toBe(false);
    const series = Array.from({ length: CHART_MAX_SERIES + 1 }, (_, i) => ({
      name: `s${i}`,
      values: [1, 2, 3],
    }));
    expect(ChartBlock.safeParse({ ...base, series }).success).toBe(false);
  });

  it('refuses an unknown chart kind and a non-positive axis override', () => {
    expect(ChartBlock.safeParse({ ...base, chart: 'pie' }).success).toBe(false);
    expect(ChartBlock.safeParse({ ...base, yMax: 0 }).success).toBe(false);
    expect(ChartBlock.safeParse({ ...base, yStep: -1 }).success).toBe(false);
  });

  it('chartIsDrawable is false when a series has the wrong number of values', () => {
    // Not a schema refine (a refined object cannot join the discriminated
    // union), so the schema ACCEPTS this and the check carries the rule.
    const short = { ...base, series: [{ values: [1, 2] }] };
    expect(ChartBlock.safeParse(short).success).toBe(true);
    expect(chartIsDrawable(short)).toBe(false);
    expect(chartIsDrawable(base)).toBe(true);
  });
});

// The static chart renderer (Y7 charts, T10 — y7-figures-and-charts.md Q7, N1,
// N4). Assertions read the SVG STRING, which is the rendered output: the
// viewer sets it verbatim.
import { describe, expect, it } from 'vitest';
import {
  chartAxis,
  formatChartValue,
  renderChartSvg,
  wrapChartLabel,
  type ChartSpec,
} from '../src/static-svg/chart-svg.js';

const count = (svg: string, re: RegExp): number => (svg.match(re) ?? []).length;

const bar: ChartSpec = {
  chart: 'bar',
  title: 'Books borrowed',
  xLabel: 'Day',
  yLabel: 'Number of books',
  categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  series: [{ values: [12, 7, 15, 9, 4] }],
};

const two: ChartSpec = {
  chart: 'clustered',
  categories: ['Mon', 'Tue', 'Wed'],
  series: [
    { name: 'Walk', values: [12, 7, 15] },
    { name: 'Bus', values: [4, 6, 3] },
  ],
};

describe('chartAxis — zero baseline, 1/2/5 ceiling (Q7)', () => {
  it('picks the next nice step at or above the data', () => {
    expect(chartAxis(bar)).toEqual({ yMax: 15, yStep: 5 });
    expect(chartAxis({ ...bar, series: [{ values: [12, 7, 16, 9, 4] }] })).toEqual({ yMax: 20, yStep: 5 });
    expect(chartAxis({ ...bar, series: [{ values: [3, 1, 2, 0, 4] }] })).toEqual({ yMax: 4, yStep: 1 });
    expect(chartAxis({ ...bar, series: [{ values: [120, 70, 480, 90, 40] }] })).toEqual({ yMax: 500, yStep: 100 });
  });

  it('whole-number data never gets a fractional step', () => {
    expect(chartAxis({ ...bar, series: [{ values: [1, 2, 1, 0, 2] }] }).yStep).toBe(1);
  });

  it('a stacked chart reaches the largest TOTAL, not the largest value', () => {
    expect(chartAxis({ ...two, chart: 'stacked' }).yMax).toBe(20); // 15 + 3 = 18
    expect(chartAxis(two).yMax).toBe(15);
  });

  it('honours an authored y: override, and ignores one below the data', () => {
    expect(chartAxis({ ...bar, yMax: 20, yStep: 4 })).toEqual({ yMax: 20, yStep: 4 });
    expect(chartAxis({ ...bar, yMax: 10 }).yMax).toBe(15);
  });

  it('an all-zero chart still has an axis', () => {
    expect(chartAxis({ ...bar, series: [{ values: [0, 0, 0, 0, 0] }] })).toEqual({ yMax: 1, yStep: 1 });
  });
});

describe('labels (N4)', () => {
  it('wraps at about ten characters, to at most two lines', () => {
    expect(wrapChartLabel('Mon')).toEqual(['Mon']);
    expect(wrapChartLabel('Fish and chips')).toEqual(['Fish and', 'chips']);
    expect(wrapChartLabel('one two three four five six')).toHaveLength(2);
  });

  it('formats five-digit values with a thin space', () => {
    expect(formatChartValue(1500)).toBe('1500');
    expect(formatChartValue(12000)).toBe('12 000');
    expect(formatChartValue(2.5)).toBe('2.5');
  });
});

describe('renderChartSvg — bars', () => {
  it('draws one bar per category per series, on a zero baseline', () => {
    const svg = renderChartSvg(bar, 'u1');
    expect(count(svg, /<rect data-bar=""/g)).toBe(5);
    expect(count(renderChartSvg(two, 'u2'), /<rect data-bar=""/g)).toBe(6);
    // Every unstacked bar ends on the same baseline: y + height is constant.
    const ends = [...svg.matchAll(/<rect data-bar="" data-series="0" x="[\d.]+" y="([\d.]+)" width="[\d.]+" height="([\d.]+)"/g)].map(
      (m) => Math.round(Number(m[1]) + Number(m[2])),
    );
    expect(new Set(ends).size).toBe(1);
  });

  it('bar heights are proportional to the values', () => {
    const svg = renderChartSvg(bar, 'u1');
    const heights = [...svg.matchAll(/<rect data-bar=""[^>]* height="([\d.]+)"/g)].map((m) => Number(m[1]));
    // 12 and 4 on a 0..15 axis of 180px.
    expect(heights[0]).toBeCloseTo(144, 0);
    expect(heights[4]).toBeCloseTo(48, 0);
  });

  it('a stacked chart stacks: the second series starts where the first ends', () => {
    const svg = renderChartSvg({ ...two, chart: 'stacked' }, 'u3');
    const rects = [...svg.matchAll(/<rect data-bar="" data-series="(\d)" x="([\d.]+)" y="([\d.]+)" width="[\d.]+" height="([\d.]+)"/g)];
    const first = rects[0]!;
    const second = rects[1]!;
    expect(first[2]).toBe(second[2]); // same x
    expect(Number(second[3]) + Number(second[4])).toBeCloseTo(Number(first[3]), 1);
  });

  it('series 2+ carry a hatch pattern, and the legend swatch carries it too (N1)', () => {
    const svg = renderChartSvg(two, 'u2');
    expect(count(svg, /<pattern /g)).toBe(1);
    expect(svg).toContain('fill="url(#ch-u2-1)"');
    expect(count(svg, /data-legend=""[^>]*fill="url\(#ch-u2-1\)"/g)).toBe(1);
    const four = renderChartSvg(
      { ...two, series: [...two.series, { name: 'Car', values: [1, 2, 3] }, { name: 'Bike', values: [2, 2, 2] }] },
      'u4',
    );
    expect(count(four, /<pattern /g)).toBe(3);
    expect(count(renderChartSvg(bar, 'u1'), /<pattern /g)).toBe(0);
  });

  it('a named series produces a legend; an unnamed single series does not', () => {
    expect(count(renderChartSvg(two, 'u2'), /data-chart-text="legend"/g)).toBe(2);
    expect(count(renderChartSvg(bar, 'u1'), /data-chart-text="legend"/g)).toBe(0);
  });
});

describe('renderChartSvg — text', () => {
  it('draws the title and both axis labels, each once, only when authored', () => {
    const svg = renderChartSvg(bar, 'u1');
    expect(svg).toMatch(/data-chart-text="title"[^>]*>Books borrowed</);
    expect(svg).toMatch(/data-chart-text="xlabel"[^>]*>Day</);
    expect(svg).toMatch(/data-chart-text="ylabel"[^>]*>Number of books</);
    const bare = renderChartSvg({ chart: 'bar', categories: bar.categories, series: bar.series }, 'u1');
    expect(bare).not.toContain('data-chart-text="title"');
    expect(bare).not.toContain('data-chart-text="xlabel"');
    expect(bare).not.toContain('data-chart-text="ylabel"');
  });

  it('labels every category and never rotates text', () => {
    const svg = renderChartSvg(bar, 'u1');
    expect(count(svg, /data-chart-text="category"/g)).toBe(5);
    expect(svg).not.toContain('rotate(');
  });

  it('the value axis starts at 0 and ends at the ceiling', () => {
    const values = [...renderChartSvg(bar, 'u1').matchAll(/data-chart-text="value"[^>]*>([^<]+)</g)].map((m) => m[1]);
    expect(values).toEqual(['0', '5', '10', '15']);
  });

  it('escapes authored strings', () => {
    const svg = renderChartSvg({ ...bar, title: 'a < b & "c"', categories: ['<x>', 'b', 'c', 'd', 'e'] }, 'u1');
    expect(svg).toContain('a &lt; b &amp; "c"');
    expect(svg).toContain('&lt;x&gt;');
    expect(svg).not.toContain('<x>');
  });

  it('chrome uses the --gk-svg-* variables the viewer themes', () => {
    const svg = renderChartSvg(bar, 'u1');
    expect(svg).toContain('var(--gk-svg-grid');
    expect(svg).toContain('var(--gk-svg-axis');
    // Labels carry an ATTRIBUTE colour so the viewer's text rule can theme them.
    expect(svg).toMatch(/data-chart-text="category" fill="#475569"/);
    expect(svg).toMatch(/data-chart-text="title" style="fill:var\(--gk-svg-ink/);
    expect(svg).toContain('data-drawables="5"');
    expect(svg).toContain('var(--gk-svg-ink');
    expect(svg).not.toContain('--gk-board-');
  });
});

describe('renderChartSvg — line', () => {
  const line: ChartSpec = { ...two, chart: 'line' };
  it('draws one polyline per series with a marked point per category', () => {
    const svg = renderChartSvg(line, 'u5');
    expect(count(svg, /<polyline /g)).toBe(2);
    expect(count(svg, /data-point=""/g)).toBe(6);
    expect(count(svg, /<rect data-bar/g)).toBe(0);
  });

  it('the second series is dashed and uses a different marker (grayscale, N1)', () => {
    const svg = renderChartSvg(line, 'u5');
    expect(svg).toMatch(/<polyline data-series="1"[^>]*stroke-dasharray=/);
    expect(svg).not.toMatch(/<polyline data-series="0"[^>]*stroke-dasharray=/);
    expect(count(svg, /<circle [^>]*data-point=""/g)).toBe(3);
  });
});

describe('renderChartSvg — undrawable data', () => {
  it("returns '' for no categories, no series, or a series of the wrong length", () => {
    expect(renderChartSvg({ ...bar, categories: [] }, 'u')).toBe('');
    expect(renderChartSvg({ ...bar, series: [] }, 'u')).toBe('');
    expect(renderChartSvg({ ...bar, series: [{ values: [1, 2] }] }, 'u')).toBe('');
  });
});

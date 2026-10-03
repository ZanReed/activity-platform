// =============================================================================
// chart.test.tsx — what a chart block actually draws (Y7 charts, Q9)
// -----------------------------------------------------------------------------
// Orphan guards, one per schema field, bound to RENDERED OUTPUT: the DOM the
// viewer's Chart component produces, not the schema and not the engine's
// return value in isolation. Each was mutation-tested once by reverting the
// wiring it guards (the mutations are listed in the Y7 design doc's T9–T11).
// =============================================================================

import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import Chart from '../../src/blocks/Chart.js';

const BASE = {
  id: 'chart-1',
  type: 'chart',
  chart: 'clustered',
  title: 'How we get to school',
  xLabel: 'Day',
  yLabel: 'Number of students',
  categories: ['Mon', 'Tue', 'Wed'],
  series: [
    { name: 'Walk', values: [12, 7, 15] },
    { name: 'Bus', values: [4, 6, 3] },
  ],
};

function renderChart(extra: Record<string, unknown> = {}) {
  const { container } = render(<Chart block={{ ...BASE, ...extra } as never} mode="screen" />);
  return container;
}

const texts = (root: Element, role: string): string[] =>
  Array.from(root.querySelectorAll(`[data-chart-text="${role}"]`)).map((n) => n.textContent ?? '');

describe('chart — every authored field reaches the page', () => {
  it('title, xLabel and yLabel are each drawn as text', () => {
    const root = renderChart();
    expect(texts(root, 'title')).toEqual(['How we get to school']);
    expect(texts(root, 'xlabel')).toEqual(['Day']);
    expect(texts(root, 'ylabel')).toEqual(['Number of students']);
  });

  it('absent title and labels draw nothing in their place', () => {
    const root = renderChart({ title: undefined, xLabel: undefined, yLabel: undefined });
    expect(texts(root, 'title')).toEqual([]);
    expect(texts(root, 'xlabel')).toEqual([]);
    expect(texts(root, 'ylabel')).toEqual([]);
  });

  it('categories: one axis label each, in authored order', () => {
    expect(texts(renderChart(), 'category')).toEqual(['Mon', 'Tue', 'Wed']);
  });

  it('series: one bar per category per series, a hatch per series after the first, a legend entry each', () => {
    const root = renderChart();
    expect(root.querySelectorAll('rect[data-bar]')).toHaveLength(6);
    expect(root.querySelectorAll('pattern')).toHaveLength(1);
    expect(texts(root, 'legend')).toEqual(['Walk', 'Bus']);
    const three = renderChart({
      series: [...BASE.series, { name: 'Car', values: [1, 2, 3] }],
    });
    expect(three.querySelectorAll('rect[data-bar]')).toHaveLength(9);
    expect(three.querySelectorAll('pattern')).toHaveLength(2);
  });

  it('series values set the bar heights', () => {
    const heights = (root: Element) =>
      Array.from(root.querySelectorAll('rect[data-bar][data-series="0"]')).map((r) => Number(r.getAttribute('height')));
    const before = heights(renderChart());
    const after = heights(renderChart({ series: [{ name: 'Walk', values: [6, 7, 15] }, BASE.series[1]] }));
    expect(after[0]).toBeCloseTo(before[0]! / 2, 1);
    expect(after[1]).toBe(before[1]);
  });

  it('chart kind: stacked stacks, line draws polylines and no bars', () => {
    const stacked = renderChart({ chart: 'stacked' });
    const xs = Array.from(stacked.querySelectorAll('rect[data-bar]')).map((r) => r.getAttribute('x'));
    expect(new Set(xs).size).toBe(3); // one column per category, not six
    expect(new Set(Array.from(renderChart().querySelectorAll('rect[data-bar]')).map((r) => r.getAttribute('x'))).size).toBe(6);

    const line = renderChart({ chart: 'line' });
    expect(line.querySelectorAll('polyline')).toHaveLength(2);
    expect(line.querySelectorAll('[data-point]')).toHaveLength(6);
    expect(line.querySelectorAll('rect[data-bar]')).toHaveLength(0);
  });

  it('yMax and yStep set the value axis', () => {
    expect(texts(renderChart(), 'value')).toEqual(['0', '5', '10', '15']);
    // 30, not 20: a step of 10 over data peaking at 15 reaches 20 on its own,
    // so a yMax of 20 would pass with yMax unread (found by mutation).
    expect(texts(renderChart({ yMax: 30, yStep: 10 }), 'value')).toEqual(['0', '10', '20', '30']);
    expect(texts(renderChart({ yStep: 10 }), 'value')).toEqual(['0', '10', '20']);
  });

  it('alt names the chart; without it the title does; without either, "Chart"', () => {
    const name = (root: Element) => root.querySelector('[role="img"]')?.getAttribute('aria-label');
    expect(name(renderChart({ alt: 'Walking beats the bus every day' }))).toBe('Walking beats the bus every day');
    expect(name(renderChart())).toBe('How we get to school');
    expect(name(renderChart({ title: undefined }))).toBe('Chart');
  });

  it('width: a sized chart fills its footprint, an unsized one keeps the chart cap', () => {
    const cap = (root: Element) =>
      (root.querySelector('[data-block-type="chart"]') as HTMLElement).style.getPropertyValue(
        '--vw-figure-cap-standalone',
      );
    expect(cap(renderChart())).toBe('34rem');
    expect(cap(renderChart({ width: 0.5 }))).toBe('100%');
  });
});

describe('chart — the hidden data table (N3)', () => {
  it('has a caption, one header cell per category and one row per series', () => {
    const table = renderChart().querySelector('table[data-chart-table]')!;
    expect(table.querySelector('caption')?.textContent).toBe('How we get to school');
    const head = Array.from(table.querySelectorAll('thead th')).map((th) => th.textContent);
    expect(head).toEqual(['Day', 'Mon', 'Tue', 'Wed']);
    const rows = Array.from(table.querySelectorAll('tbody tr')).map((tr) =>
      Array.from(tr.children).map((cell) => cell.textContent),
    );
    expect(rows).toEqual([
      ['Walk', '12', '7', '15'],
      ['Bus', '4', '6', '3'],
    ]);
  });

  it('is a SIBLING of the role="img" element, never inside it', () => {
    const root = renderChart();
    const img = root.querySelector('[role="img"]')!;
    const table = root.querySelector('table[data-chart-table]')!;
    expect(img.contains(table)).toBe(false);
    expect(table.parentElement).toBe(img.parentElement);
  });

  it('is visually hidden, not display:none (a screen reader must reach it)', () => {
    const table = renderChart().querySelector('table[data-chart-table]') as HTMLElement;
    expect(table.style.position).toBe('absolute');
    expect(table.style.display).not.toBe('none');
  });
});

describe('chart — data the engine cannot draw', () => {
  it('a series of the wrong length shows "Chart unavailable", named in the DOM', () => {
    const root = renderChart({ series: [{ values: [1, 2] }] });
    const el = root.querySelector('[data-figure-unavailable]')!;
    expect(el.getAttribute('data-figure-unavailable')).toBe('degenerate-chart');
    expect(el.textContent).toBe('Chart unavailable');
    expect(root.querySelector('svg')).toBeNull();
  });
});

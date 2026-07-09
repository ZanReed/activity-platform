// =============================================================================
// graph-svg.test.ts — the static SVG fallback for interactive_graph blocks
// -----------------------------------------------------------------------------
// The no-JS / print fallback: a server-rendered coordinate plane from the same
// AxisConfig the widget uses (grid, axes, tick labels), with drawables for
// display graphs and — in the showAnswers print variant — the graded answer
// key. Pure string-in/string-out, so everything is testable by inspection.
// =============================================================================

import { describe, it, expect } from 'vitest';
import { renderGraphSvg, answerKeyDrawables } from '../graph-svg.js';
import { renderBlock } from '../blocks/index.js';
import { InteractiveGraphBlock, type AxisConfig, type Drawable } from '@activity/schema';

const axis = (over: Partial<AxisConfig> = {}): AxisConfig => ({
  xMin: -10,
  xMax: 10,
  yMin: -10,
  yMax: 10,
  xGridStep: 1,
  yGridStep: 1,
  showGrid: true,
  snapToGrid: true,
  ...over,
});

const svg = (a: AxisConfig, d: Drawable[] = []) => renderGraphSvg(a, d, 'test-uid');

describe('renderGraphSvg — plane', () => {
  it('emits a square viewBox with grid lines, axes, and tick labels', () => {
    const out = svg(axis());
    expect(out).toContain('viewBox="0 0 400 400"');
    expect(out).toContain('aria-hidden="true"');
    // Grid group + both axes (0 is inside both ranges).
    expect(out).toContain('stroke="#cbd5e1"');
    expect(out).toContain('stroke="#64748b"');
    // Tick labels present (21 lines decimate to every 2nd — even values);
    // origin label skipped (it would sit on the crossing).
    expect(out).toContain('>4</text>');
    expect(out).not.toContain('>0</text>');
  });

  it('omits the grid when showGrid is false, keeps axes', () => {
    const out = svg(axis({ showGrid: false }));
    expect(out).not.toContain('stroke="#cbd5e1"');
    expect(out).toContain('stroke="#64748b"');
  });

  it('omits axes when 0 is outside the window, labels along the edges', () => {
    const out = svg(axis({ xMin: 2, xMax: 12, yMin: 5, yMax: 15 }));
    expect(out).not.toContain('stroke="#64748b"');
    expect(out).toContain('>10</text>'); // labels still present
  });

  it('caps a pathological grid (tiny step over a huge range)', () => {
    const out = svg(axis({ xMin: -1000, xMax: 1000, xGridStep: 0.1 }));
    // Doubling the step caps the line count; well under one line per step.
    const lines = out.match(/<line /g) ?? [];
    expect(lines.length).toBeLessThan(120);
  });

  it('returns empty for a degenerate window', () => {
    expect(svg(axis({ xMin: 5, xMax: 5 }))).toBe('');
    expect(svg(axis({ yMin: 3, yMax: -3 }))).toBe('');
  });

  it('namespaces internal ids by uid (many graphs per document)', () => {
    const out = renderGraphSvg(axis(), [], 'block-42');
    expect(out).toContain('id="gclip-block-42"');
    expect(out).toContain('url(#gclip-block-42)');
    expect(out).toContain('id="garrow-block-42"');
  });
});

describe('renderGraphSvg — drawables', () => {
  it('point: closed dot by default, open when styled, label escaped', () => {
    const closed = svg(axis(), [{ kind: 'point', at: [2, 3] }]);
    expect(closed).toContain('fill="#1e293b"');
    const open = svg(axis(), [{ kind: 'point', at: [2, 3], style: 'open' }]);
    expect(open).toContain('fill="#fff"');
    const labeled = svg(axis(), [{ kind: 'point', at: [2, 3], label: '<A&B>' }]);
    expect(labeled).toContain('&lt;A&amp;B&gt;');
    expect(labeled).not.toContain('<A&B>');
  });

  it('linear curve: a sampled path; dashed style applies', () => {
    const solid = svg(axis(), [
      { kind: 'curve', model: { family: 'linear', slope: 1, intercept: 0 } },
    ] as Drawable[]);
    expect(solid).toContain('<path d="M');
    expect(solid).not.toContain('stroke-dasharray');
    const dashed = svg(axis(), [
      { kind: 'curve', model: { family: 'linear', slope: 1, intercept: 0 }, style: 'dashed' },
    ] as Drawable[]);
    expect(dashed).toContain('stroke-dasharray');
  });

  it('logarithmic curve: only defined for x > 0, still renders', () => {
    const out = svg(axis(), [
      { kind: 'curve', model: { family: 'logarithmic', a: 0, b: 1 } },
    ] as Drawable[]);
    expect(out).toContain('<path d="M');
  });

  it('vertical model: a vertical line; left/right shading fills a rect', () => {
    const out = svg(axis(), [
      { kind: 'curve', model: { family: 'vertical', x: 3 }, shade: 'left' },
    ] as Drawable[]);
    expect(out).toContain('<line');
    expect(out).toContain('fill-opacity="0.12"');
  });

  it('above/below shading closes a half-plane polygon against the edge', () => {
    const out = svg(axis(), [
      { kind: 'curve', model: { family: 'linear', slope: 1, intercept: 0 }, shade: 'above' },
    ] as Drawable[]);
    expect(out).toContain('fill-opacity="0.12"');
  });

  it('domain-restricted curve draws endpoint dots per style', () => {
    const out = svg(axis(), [
      {
        kind: 'curve',
        model: { family: 'linear', slope: 1, intercept: 0 },
        domain: { min: 0, minStyle: 'open' },
      },
    ] as Drawable[]);
    expect(out).toContain('fill="#fff"'); // the open endpoint dot
  });

  it('segment: line plus two endpoint dots honoring endpoint styles', () => {
    const out = svg(axis(), [
      { kind: 'segment', from: [0, 0], to: [4, 4], endpoints: ['open', 'closed'] },
    ] as Drawable[]);
    expect(out).toContain('fill="#fff"');
    expect(out).toContain('fill="#1e293b"');
  });

  it('ray: extended line with the arrowhead marker + endpoint dot', () => {
    const out = svg(axis(), [
      { kind: 'ray', from: [0, 0], through: [1, 1] },
    ] as Drawable[]);
    expect(out).toContain('marker-end="url(#garrow-test-uid)"');
    const degenerate = svg(axis(), [
      { kind: 'ray', from: [0, 0], through: [0, 0] },
    ] as Drawable[]);
    expect(degenerate).not.toContain('marker-end'); // dot only, no direction
  });

  it('polygon: filled at low opacity; unfilled is outline-only', () => {
    const filled = svg(axis(), [
      { kind: 'polygon', vertices: [[0, 0], [4, 0], [0, 4]], filled: true },
    ] as Drawable[]);
    expect(filled).toContain('fill-opacity="0.15"');
    const outline = svg(axis(), [
      { kind: 'polygon', vertices: [[0, 0], [4, 0], [0, 4]], filled: false },
    ] as Drawable[]);
    expect(outline).toContain('fill="none"');
  });

  it('expression drawables are skipped (kit-only parser)', () => {
    const out = svg(axis(), [
      { kind: 'expression', expression: 'sin(x)' },
    ] as Drawable[]);
    // No ink strokes at all — grid/axes use their own colors, and the only
    // #1e293b in a blank plane is the (unused) arrowhead marker fill.
    expect(out).not.toContain('stroke="#1e293b"');
  });
});

// -----------------------------------------------------------------------------
// answerKeyDrawables — graded interaction → drawables for the showAnswers print
// -----------------------------------------------------------------------------

const gradedBlock = (interaction: unknown, over: Record<string, unknown> = {}) =>
  InteractiveGraphBlock.parse({
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    type: 'interactive_graph',
    prompt: [],
    axisConfig: axis(),
    interaction,
    ...over,
  });

describe('answerKeyDrawables', () => {
  it('plot_point → one point per correct point', () => {
    const d = answerKeyDrawables(
      gradedBlock({ type: 'plot_point', correctPoints: [[1, 1], [2, 4]] }),
    );
    expect(d).toEqual([
      { kind: 'point', at: [1, 1] },
      { kind: 'point', at: [2, 4] },
    ]);
  });

  it('plot_function → curves carrying their index-aligned domains', () => {
    const d = answerKeyDrawables(
      gradedBlock({
        type: 'plot_function',
        models: [{ family: 'linear', slope: 2, intercept: 1 }],
        domains: [{ min: 0 }],
      }),
    );
    expect(d).toHaveLength(1);
    expect(d[0]).toMatchObject({ kind: 'curve', domain: { min: 0 } });
  });

  it('graph_inequality → dashed boundary when strict, with the shade side', () => {
    const d = answerKeyDrawables(
      gradedBlock({
        type: 'graph_inequality',
        inequalities: [
          {
            boundary: { family: 'linear', slope: 1, intercept: 0 },
            strict: true,
            shadeSide: 'above',
          },
        ],
      }),
    );
    expect(d[0]).toMatchObject({ kind: 'curve', style: 'dashed', shade: 'above' });
  });

  it('shade_region / plot_ray / plot_segment map onto their drawable twins', () => {
    expect(
      answerKeyDrawables(
        gradedBlock({
          type: 'shade_region',
          regions: [{ correctVertices: [[0, 0], [2, 0], [0, 2]] }],
        }),
      )[0],
    ).toMatchObject({ kind: 'polygon', filled: true });
    expect(
      answerKeyDrawables(
        gradedBlock({ type: 'plot_ray', rays: [{ from: [0, 0], through: [1, 2] }] }),
      )[0],
    ).toMatchObject({ kind: 'ray', from: [0, 0] });
    expect(
      answerKeyDrawables(
        gradedBlock({ type: 'plot_segment', segments: [{ from: [0, 0], to: [3, 3] }] }),
      )[0],
    ).toMatchObject({ kind: 'segment', to: [3, 3] });
  });

  it('noSolutionCorrect: the drawn key is a decoy — draw nothing', () => {
    const d = answerKeyDrawables(
      gradedBlock(
        { type: 'plot_point', correctPoints: [[1, 1]] },
        { allowNoSolution: true, noSolutionCorrect: true },
      ),
    );
    expect(d).toEqual([]);
  });
});

// -----------------------------------------------------------------------------
// Block-level integration: the fallback SVG in the rendered markup
// -----------------------------------------------------------------------------

describe('interactive_graph block markup carries the static fallback', () => {
  const ctx = () => {
    let n = 0;
    return { nextProblemNumber: () => ++n };
  };

  it('graded: blank grid + screen-only cue; no answer content by default', () => {
    const html = renderBlock(
      gradedBlock({ type: 'plot_point', correctPoints: [[1, 1]] }),
      ctx(),
    );
    expect(html).toContain('class="graph-paper"');
    expect(html).toContain('graph-nojs');
    // Blank grid: no drawable marks (points render as circles).
    expect(html).not.toContain('<circle');
  });

  it('graded + showAnswers: the key is drawn onto the grid', () => {
    const html = renderBlock(
      gradedBlock({ type: 'plot_point', correctPoints: [[1, 1]] }),
      { ...ctx(), showAnswers: true },
    );
    expect(html).toContain('class="graph-paper"');
    expect(html).toContain('<circle');
  });

  it('display: the figure renders its drawables, and the JS cue is gone', () => {
    const html = renderBlock(
      InteractiveGraphBlock.parse({
        id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
        type: 'interactive_graph',
        prompt: [],
        axisConfig: axis(),
        interaction: {
          type: 'display',
          drawables: [{ kind: 'point', at: [2, 3], label: 'A' }],
        },
      }),
      {
        nextProblemNumber: () => {
          throw new Error('display graph must not pull a number');
        },
      },
    );
    expect(html).toContain('class="graph-paper"');
    expect(html).toContain('<circle');
    expect(html).toContain('>A</text>');
    expect(html).not.toContain('graph-nojs');
  });
});

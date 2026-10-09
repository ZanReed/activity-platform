// =============================================================================
// graph-figure.test.tsx — what a standalone graph figure actually draws
// -----------------------------------------------------------------------------
// The guard for the convergence slice (docs/design/graph-figure-convergence.md),
// and it is bound to RENDERED OUTPUT rather than to another declaration —
// the distinction that decides whether a guard survives its implementation.
//
// WHAT IT EXISTS TO CATCH. `GraphFigure.tsx` used to draw its own SVG and skip
// `curve` drawables, on the stated grounds that the authoring surfaces never
// produced one. THERE IS NO `line` DRAWABLE KIND — a line is
// `{kind:'curve', model:{family:'linear'}}` — so every line a teacher drew on
// a formula sheet rendered as an empty grid, on screen and on paper, while the
// editor's own preview (which always used `renderGraphSvg`) showed it
// correctly. Nothing in the suite noticed for four months, because the only
// fixture authored a lone point and the registry's own tests compared
// declarations to declarations.
//
// So these rows assert MARKS ON THE PAGE. A test that asserted "GraphFigure
// renders a <figure>" would have passed throughout the bug.
//
// The four rows after the curve are the losses measured at T0: the old
// hand-rolled renderer drew rays without arrowheads, segments and rays without
// endpoint dots, points without their labels, and everything in one inherited
// colour. Those were silent degradations of drawables that supposedly worked,
// which is why they are pinned here rather than trusted.
// =============================================================================

import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import GraphFigure from '../../src/blocks/GraphFigure.js';

const AXIS = {
  xMin: -5,
  xMax: 5,
  yMin: -5,
  yMax: 5,
  xGridStep: 1,
  yGridStep: 1,
  showGrid: true,
  snapToGrid: true,
};

/** A LINE. Not a `line` kind — that does not exist. */
const line = (slope: number, intercept: number) => ({
  kind: 'curve',
  model: { family: 'linear', slope, intercept, slopeTolerance: 0.1, interceptTolerance: 0.1 },
});

function renderFigure(
  drawables: readonly unknown[],
  axis: Record<string, unknown> = AXIS,
  id = 'fig-1',
  extra: Record<string, unknown> = {},
) {
  const { container } = render(
    <GraphFigure
      block={{ id, type: 'graph_figure', axis, drawables, ...extra } as never}
      mode="screen"
    />,
  );
  return container;
}

describe('a standalone figure draws what was authored', () => {
  it('draws two parallel LINES — the picture this block type exists for', () => {
    const container = renderFigure([line(2, 1), line(2, -3)]);
    const svg = container.querySelector('.viewer-figure > svg');

    expect(svg, 'the engine svg must be a DIRECT child (the print rule targets it)').not.toBeNull();

    // The engine's own count of what it drew, which grid lines cannot inflate.
    expect(svg?.getAttribute('data-drawables')).toBe('2');

    // Two stroked paths: before convergence this was zero, on a grid that
    // otherwise looked perfectly correct.
    const strokedPaths = Array.from(container.querySelectorAll('path')).filter(
      (p) => p.getAttribute('stroke') !== null && p.getAttribute('stroke') !== 'none',
    );
    expect(strokedPaths.length, 'each line is a stroked <path>').toBe(2);
  });

  it('draws a curve that is not a line (a parabola)', () => {
    const container = renderFigure([{ kind: 'curve', model: { family: 'quadratic', a: 1, b: 0, c: 0 } }], {
      ...AXIS,
      yMin: -1,
      yMax: 9,
    });
    expect(container.querySelector('svg')?.getAttribute('data-drawables')).toBe('1');
    expect(container.querySelectorAll('path').length).toBeGreaterThan(0);
  });

  // ---- The four silent losses measured at T0 --------------------------------

  it('gives a ray its ARROWHEAD', () => {
    const container = renderFigure([{ kind: 'ray', from: [1, -3], through: [3, -1] }]);
    // An arrowhead is a <marker> in <defs> that the ray references.
    expect(container.querySelector('marker'), 'a ray needs a marker to point with').not.toBeNull();
  });

  it('gives a segment its AUTHORED endpoint dots', () => {
    const container = renderFigure([
      { kind: 'segment', from: [-4, -2], to: [0, 2], endpoints: ['closed', 'open'] },
    ]);
    expect(container.querySelectorAll('circle').length, 'both authored ends are marked').toBe(2);
  });

  // Ruling 10 (2026-10-09): dots only when authored, plane or not. Paper used to
  // add closed dots on a plane while the board drew none, so a stimulus segment
  // looked different on paper than on screen.
  it('draws NO dots on a segment whose endpoints were not authored, even on a plane', () => {
    const container = renderFigure([{ kind: 'segment', from: [-4, -2], to: [0, 2] }]);
    expect(container.querySelectorAll('circle').length).toBe(0);
  });

  // Arrowhead Drop 1: a vector. The head is a SOLID polygon whose tip sits on
  // `to`; the shaft stops short of it; no dots even when endpoints were authored.
  it('gives an ARROWED segment a solid head at its second point and no dots', () => {
    const container = renderFigure([
      { kind: 'segment', from: [-4, -2], to: [0, 2], arrow: true, endpoints: ['closed', 'closed'] },
    ]);
    const g = container.querySelector('[data-drawable="segment"]')!;
    const head = g.querySelector('polygon');
    expect(head, 'an arrowed segment draws a head').not.toBeNull();
    expect(head!.getAttribute('fill-opacity')).toBe('1');
    expect(g.querySelectorAll('circle').length, 'no endpoint dots on a vector').toBe(0);
    const tip = head!.getAttribute('points')!.split(' ')[0]!.split(',').map(Number);
    const line = g.querySelector('line')!;
    const shaftEnd = [Number(line.getAttribute('x2')), Number(line.getAttribute('y2'))];
    const tail = [Number(line.getAttribute('x1')), Number(line.getAttribute('y1'))];
    const dist = (a: number[], b: number[]) => Math.hypot(a[0]! - b[0]!, a[1]! - b[1]!);
    expect(dist(tail, shaftEnd), 'the shaft stops at the head base, short of the tip').toBeLessThan(dist(tail, tip));
    expect(dist(shaftEnd, tip)).toBeGreaterThan(5);
  });

  it('draws NO head on a plain segment', () => {
    const container = renderFigure([{ kind: 'segment', from: [-4, -2], to: [0, 2] }]);
    expect(container.querySelector('[data-drawable="segment"] polygon')).toBeNull();
  });

  it('renders a point LABEL as text', () => {
    const container = renderFigure([{ kind: 'point', at: [2, 3], style: 'closed', label: 'A' }]);
    const labels = Array.from(container.querySelectorAll('text')).map((t) => t.textContent);
    expect(labels, 'the authored label reaches the page').toContain('A');
  });

  it('draws in the palette COLOUR, not an inherited currentColor', () => {
    const container = renderFigure([line(1, 0)]);
    const stroked = Array.from(container.querySelectorAll('path')).map((p) => p.getAttribute('stroke'));
    expect(
      stroked.some((s) => s !== null && s !== 'none' && s !== 'currentColor'),
      'a real colour, so a figure is legible on its own terms',
    ).toBe(true);
  });
});

describe('a figure that cannot be drawn says so', () => {
  // The engine returns '' for a window it cannot map. Rendering that raw is a
  // blank where a teacher authored a picture — the failure mode this whole
  // slice exists to end, so it must not come back in a new costume.
  const DEGENERATE = { ...AXIS, xMin: 5, xMax: 5 };

  it('renders a legible fallback, not a silent blank', () => {
    const container = renderFigure([line(1, 0)], DEGENERATE);

    expect(container.textContent).toContain('Figure unavailable');
    expect(container.querySelector('svg'), 'nothing was drawn').toBeNull();
  });

  it('names the CAUSE in the DOM, so a blank figure is diagnosable', () => {
    const container = renderFigure([line(1, 0)], DEGENERATE);
    expect(
      container.querySelector('[data-figure-unavailable="degenerate-axis"]'),
      'devtools and a failing test should both name why',
    ).not.toBeNull();
  });
});

describe('accessibility', () => {
  it('names the figure on the WRAPPER — the engine svg is aria-hidden', () => {
    const container = renderFigure([line(1, 0)]);
    const figure = container.querySelector('.viewer-figure');

    expect(figure?.getAttribute('role')).toBe('img');
    expect(figure?.getAttribute('aria-label')).toBe('Graph figure');

    // If the engine ever stopped hiding its svg, the figure would be announced
    // twice — once by the wrapper's label and once by the graphic itself.
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('is still named when it could not be drawn', () => {
    const container = renderFigure([line(1, 0)], { ...AXIS, xMin: 5, xMax: 5 });
    const figure = container.querySelector('figure');

    expect(figure?.getAttribute('role')).toBe('img');
    expect(figure?.getAttribute('aria-label')).toBe('Figure unavailable');
  });
});

describe('an empty figure is not an error', () => {
  it('draws bare axes for a figure with no drawables', () => {
    const container = renderFigure([]);
    expect(container.querySelector('svg')?.getAttribute('data-drawables')).toBe('0');
    expect(container.textContent).not.toContain('Figure unavailable');
  });
});

// =============================================================================
// Y7 geometry (y7-figures-and-charts.md Q9). Every row is bound to RENDERED
// output and was mutation-tested the day it was written: the wiring it guards
// was reverted and the row went red (the record is in the commit message).
// =============================================================================

const TRI = [
  { kind: 'point', at: [0, 0], label: 'A' },
  { kind: 'point', at: [8, 0], label: 'B' },
  { kind: 'point', at: [2, 5], label: 'C' },
  { kind: 'polygon', vertices: [[0, 0], [8, 0], [2, 5]], filled: false },
];
const FIT = { ...AXIS, xMin: -2, xMax: 10, yMin: -2, yMax: 7 };
const planeless = (drawables: readonly unknown[], extra: Record<string, unknown> = {}) =>
  renderFigure(drawables, FIT, 'fig-y7', { plane: false, ...extra });
const inMark = (c: HTMLElement, kind: string) => c.querySelectorAll(`[data-drawable="${kind}"]`);

describe('each annotation kind draws its marks (Q9)', () => {
  it('angle_mark: one arc <path> + its label; double = two arcs; right = one square', () => {
    const c = planeless([...TRI, { kind: 'angle_mark', at: [0, 0], from: [8, 0], to: [2, 5], label: '68°' }]);
    const g = inMark(c, 'angle_mark');
    expect(g).toHaveLength(1);
    expect(g[0]!.querySelectorAll('path')).toHaveLength(1);
    expect(g[0]!.querySelector('text')?.textContent).toBe('68°');

    const d = planeless([...TRI, { kind: 'angle_mark', at: [8, 0], from: [0, 0], to: [2, 5], style: 'double' }]);
    expect(inMark(d, 'angle_mark')[0]!.querySelectorAll('path')).toHaveLength(2);

    const r = planeless([...TRI, { kind: 'angle_mark', at: [0, 0], from: [8, 0], to: [0, 5], style: 'right' }]);
    expect(inMark(r, 'angle_mark')[0]!.querySelectorAll('path')).toHaveLength(1);
    expect(inMark(r, 'angle_mark')[0]!.querySelectorAll('text')).toHaveLength(0);
  });

  it('tick_mark: `count` <line>s', () => {
    const c = planeless([...TRI, { kind: 'tick_mark', from: [8, 0], to: [2, 5], count: 2 }]);
    expect(inMark(c, 'tick_mark')[0]!.querySelectorAll('line')).toHaveLength(2);
  });

  it('parallel_mark: `count` chevron <path>s', () => {
    const c = planeless([...TRI, { kind: 'parallel_mark', from: [0, 0], to: [8, 0], count: 2 }]);
    expect(inMark(c, 'parallel_mark')[0]!.querySelectorAll('path')).toHaveLength(2);
  });

  it('side_label and text: one <text> carrying the authored string', () => {
    const c = planeless([
      ...TRI,
      { kind: 'side_label', from: [0, 0], to: [8, 0], text: '8 cm' },
      { kind: 'text', at: [4, -1.5], text: 'base' },
    ]);
    expect(inMark(c, 'side_label')[0]!.querySelector('text')?.textContent).toBe('8 cm');
    expect(inMark(c, 'text')[0]!.querySelector('text')?.textContent).toBe('base');
  });

  it('marks count as drawables in data-drawables (the print row reads it)', () => {
    const c = planeless([...TRI, { kind: 'tick_mark', from: [8, 0], to: [2, 5], count: 1 }]);
    expect(c.querySelector('.viewer-figure > svg')?.getAttribute('data-drawables')).toBe('5');
  });
});

describe('plane on / off (Q9, D3)', () => {
  it('plane: false — no grid lines and a non-square viewBox', () => {
    const c = planeless(TRI);
    const svg = c.querySelector('.viewer-figure > svg')!;
    const [, , w, h] = svg.getAttribute('viewBox')!.split(' ').map(Number);
    expect(w).not.toBe(h);
    // With the plane off the only <line>s are marks; this figure has none.
    expect(svg.querySelectorAll('line')).toHaveLength(0);
  });

  it('plane: true (and absent) — the grid is back and the box is square', () => {
    for (const extra of [{ plane: true }, {}]) {
      const c = renderFigure(TRI, FIT, 'fig-on', extra);
      const svg = c.querySelector('.viewer-figure > svg')!;
      expect(svg.getAttribute('viewBox')).toBe('0 0 400 400');
      expect(svg.querySelectorAll('g[stroke] > line').length).toBeGreaterThan(0);
    }
  });
});

describe('alt text names the figure (D11)', () => {
  it('aria-label equals the authored alt', () => {
    const c = planeless(TRI, { alt: 'Triangle ABC with AB = 8 cm' });
    expect(c.querySelector('.viewer-figure')?.getAttribute('aria-label')).toBe('Triangle ABC with AB = 8 cm');
  });

  it('absent or blank alt falls back to "Graph figure"', () => {
    expect(planeless(TRI).querySelector('.viewer-figure')?.getAttribute('aria-label')).toBe('Graph figure');
    expect(planeless(TRI, { alt: '   ' }).querySelector('.viewer-figure')?.getAttribute('aria-label')).toBe(
      'Graph figure',
    );
  });
});

describe('"Not to scale" caption (N8)', () => {
  const caption = (c: HTMLElement) => c.querySelector('figcaption');

  it('a plane-less figure carries it, as a real figcaption OUTSIDE the role=img node', () => {
    const c = planeless(TRI);
    expect(caption(c)?.textContent).toBe('Not to scale');
    // Reachable: not inside the presentational role="img" subtree (ER-8).
    expect(caption(c)?.closest('[role="img"]')).toBeNull();
    expect(caption(c)?.parentElement?.tagName).toBe('FIGURE');
  });

  it('is absent with the plane on', () => {
    expect(caption(renderFigure(TRI, FIT, 'on', { plane: true }))).toBeNull();
  });

  it('is absent when the author says `to scale`', () => {
    expect(caption(planeless(TRI, { toScale: true }))).toBeNull();
  });
});

describe('unavailable reasons (N2)', () => {
  it('a plane-less figure with nothing on it is "degenerate-figure", boxed at the computed aspect', () => {
    const c = planeless([]);
    const fig = c.querySelector('[data-figure-unavailable="degenerate-figure"]') as HTMLElement | null;
    expect(fig).not.toBeNull();
    expect(fig!.style.aspectRatio).toMatch(/^400 \/ /);
    expect(fig!.style.aspectRatio).not.toBe('400 / 400');
  });

  it('a degenerate window is still "degenerate-axis"', () => {
    const c = renderFigure([line(1, 0)], { ...AXIS, xMin: 5, xMax: 5 }, 'bad', { plane: false });
    expect(c.querySelector('[data-figure-unavailable="degenerate-axis"]')).not.toBeNull();
  });
});

describe('sizing (N6)', () => {
  it('a sized figure lifts the standalone cap on screen and on paper', () => {
    const c = planeless(TRI, { width: 1 });
    const wrap = c.querySelector('.viewer-figure-wrap') as HTMLElement;
    expect(wrap.style.getPropertyValue('--vw-figure-cap-standalone')).toBe('100%');
    expect(wrap.style.getPropertyValue('--vw-figure-cap-standalone-print')).toBe('100%');
  });

  it('an unsized figure keeps the caps', () => {
    const wrap = planeless(TRI).querySelector('.viewer-figure-wrap') as HTMLElement;
    expect(wrap.style.getPropertyValue('--vw-figure-cap-standalone')).toBe('');
  });
});

describe('cuboid (Q6, Q9)', () => {
  const CUBOID = { kind: 'cuboid', length: 4, width: 2, height: 3 };
  const BOX = { ...AXIS, xMin: -2, xMax: 7, yMin: -2, yMax: 6 };
  const cub = (extra: Record<string, unknown> = {}) =>
    renderFigure([{ ...CUBOID, ...extra }], BOX, 'fig-cub', { plane: false });
  const g = (c: HTMLElement) => c.querySelector('[data-drawable="cuboid"]')!;

  it('draws exactly 3 dashed hidden edges, and none with hidden: false', () => {
    expect(g(cub()).querySelectorAll('line[stroke-dasharray="6 4"]')).toHaveLength(3);
    expect(g(cub({ hidden: false })).querySelectorAll('line[stroke-dasharray]')).toHaveLength(0);
  });

  it('draws 9 visible edges and 3 filled faces', () => {
    expect(g(cub()).querySelectorAll('line[stroke-width="2"]')).toHaveLength(9);
    expect(g(cub()).querySelectorAll('polygon[fill-opacity="0.12"]')).toHaveLength(3);
  });

  it('`units` draws the unit-cube grid on the three visible faces: 2(l+w+h) − 6 lines', () => {
    expect(g(cub({ units: true })).querySelectorAll('line[stroke-width="1"]')).toHaveLength(2 * (4 + 2 + 3) - 6);
    expect(g(cub()).querySelectorAll('line[stroke-width="1"]')).toHaveLength(0);
  });

  it('`at` moves the solid: its front-bottom-left corner sits at the authored point', () => {
    // Same window, two positions: every visible edge shifts by the same px.
    const xs = (c: HTMLElement) =>
      Array.from(g(c).querySelectorAll('line[stroke-width="2"]'), (l) => Number(l.getAttribute('x1')));
    const home = xs(cub());
    const moved = xs(cub({ at: [1, 0] }));
    expect(moved).toHaveLength(home.length);
    const shift = moved[0]! - home[0]!;
    expect(shift).toBeGreaterThan(0);
    moved.forEach((x, i) => expect(x - home[i]!).toBeCloseTo(shift, 0));
  });

  it('labels the three dimensions with the unit word, and nothing without one', () => {
    const labels = Array.from(g(cub({ unit: 'cm' })).querySelectorAll('text'), (t) => t.textContent);
    expect(labels.sort()).toEqual(['2 cm', '3 cm', '4 cm']);
    expect(g(cub()).querySelectorAll('text')).toHaveLength(0);
  });
});

// =============================================================================
// Side-by-side figures (2026-10-04): the caption, and labels that stay readable
// when a figure is drawn three or four to a row.
// =============================================================================

import { ColumnShareContext } from '../../src/container/layoutStyles.js';

const TRIANGLE = [
  { kind: 'point', at: [0, 0], label: 'A' },
  { kind: 'point', at: [4, 0], label: 'B' },
  { kind: 'point', at: [0, 3], label: 'C' },
  { kind: 'polygon', vertices: [[0, 0], [4, 0], [0, 3]], filled: false },
  { kind: 'side_label', from: [0, 0], to: [4, 0], text: '4 cm' },
];

function renderAtShare(share: number, extra: Record<string, unknown> = {}, drawables: readonly unknown[] = TRIANGLE) {
  const { container } = render(
    <ColumnShareContext.Provider value={share}>
      <GraphFigure
        block={{ id: 'fig-s', type: 'graph_figure', axis: AXIS, drawables, ...extra } as never}
        mode="screen"
      />
    </ColumnShareContext.Provider>,
  );
  return container;
}

const fontSizes = (root: Element): number[] =>
  Array.from(root.querySelectorAll('svg text')).map((t) => Number(t.getAttribute('font-size')));
/** The plane's tick labels live in the one group drawn at font-size 11. */
const tickLabelCount = (root: Element): number =>
  root.querySelectorAll('svg g[font-size="11"] text').length;

describe('caption', () => {
  it('is drawn above the figure and leads its accessible name', () => {
    const root = renderAtShare(1, { caption: 'B', alt: 'A triangle left of a dashed line' });
    const caption = root.querySelector('[data-figure-caption]')!;
    expect(caption.textContent).toBe('B');
    // Above the picture: the caption precedes the role="img" element.
    const img = root.querySelector('[role="img"]')!;
    expect(caption.compareDocumentPosition(img) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(img.getAttribute('aria-label')).toBe('Figure B: A triangle left of a dashed line');
  });

  it('is absent when not authored, and the name is the alt alone', () => {
    const root = renderAtShare(1, { alt: 'A triangle' });
    expect(root.querySelector('[data-figure-caption]')).toBeNull();
    expect(root.querySelector('[role="img"]')!.getAttribute('aria-label')).toBe('A triangle');
  });
});

describe('labels at a narrow share of the row', () => {
  it('full width and two per row are unchanged', () => {
    const full = fontSizes(renderAtShare(1, { plane: false }));
    const half = fontSizes(renderAtShare(0.5, { plane: false }));
    expect(half).toEqual(full);
    expect(Math.max(...full)).toBe(16);
  });

  it('three per row enlarges labels 1.3x, four per row 1.75x', () => {
    const base = fontSizes(renderAtShare(1, { plane: false }));
    const third = fontSizes(renderAtShare(1 / 3, { plane: false }));
    const quarter = fontSizes(renderAtShare(0.25, { plane: false }));
    expect(third).toEqual(base.map((n) => Math.round(n * 1.3 * 10) / 10));
    expect(quarter).toEqual(base.map((n) => Math.round(n * 1.75 * 10) / 10));
  });

  it('the block\'s own width fraction narrows the share too', () => {
    // Half a row, at half width: a quarter.
    const quarter = fontSizes(renderAtShare(0.5, { plane: false, width: 0.5 }));
    expect(Math.max(...quarter)).toBe(28); // 16 x 1.75
  });

  it('a plane-on figure keeps its grid and loses its tick labels at three and four per row', () => {
    expect(tickLabelCount(renderAtShare(1))).toBeGreaterThan(0);
    expect(tickLabelCount(renderAtShare(0.5))).toBeGreaterThan(0);
    for (const share of [1 / 3, 0.25]) {
      const root = renderAtShare(share);
      expect(tickLabelCount(root), `share ${share}`).toBe(0);
      // The grid itself is still there.
      expect(root.querySelectorAll('svg line').length).toBeGreaterThan(10);
    }
  });

  it('enlarged labels stay inside the drawing: the shape is inset, not clipped', () => {
    const letters = (root: Element) =>
      Array.from(root.querySelectorAll('svg text')).map((t) => ({
        x: Number(t.getAttribute('x')),
        y: Number(t.getAttribute('y')),
      }));
    const [, , w, h] = renderAtShare(0.25, { plane: false })
      .querySelector('svg')!
      .getAttribute('viewBox')!
      .split(' ')
      .map(Number);
    for (const p of letters(renderAtShare(0.25, { plane: false }))) {
      expect(p.x).toBeGreaterThan(0);
      expect(p.x).toBeLessThan(w!);
      expect(p.y).toBeGreaterThan(0);
      expect(p.y).toBeLessThan(h!);
    }
  });
});

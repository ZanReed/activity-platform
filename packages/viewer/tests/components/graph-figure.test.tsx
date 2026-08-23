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
) {
  const { container } = render(
    <GraphFigure
      block={{ id, type: 'graph_figure', axis, drawables } as never}
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

  it('gives a segment its ENDPOINT DOTS', () => {
    const container = renderFigure([{ kind: 'segment', from: [-4, -2], to: [0, 2] }]);
    expect(container.querySelectorAll('circle').length, 'both ends are marked').toBeGreaterThan(0);
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
    const figure = container.querySelector('figure');

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

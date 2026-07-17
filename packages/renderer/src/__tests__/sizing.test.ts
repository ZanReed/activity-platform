// =============================================================================
// sizing.test.ts — per-block width/align emission on the figure blocks
// -----------------------------------------------------------------------------
// Group 3 sizing slice. The shared sizing render path (sizingClass/sizingAttrs)
// now runs for interactive_graph, data_plot, and number_line. Asserts:
//   SZ-M2   sized → .block-sized + --block-width:<pct>%; align left/right →
//           data-block-align; unsized → NONE (identity).
//   SZ-M4   one authored width → identical --block-width across all 3 types.
//   SZ-INV1 unsized emission carries no sizing markup (omit-when-default).
// =============================================================================

import { describe, it, expect } from 'vitest';
import { renderBlock } from '../blocks/index.js';
import { blockStyles } from '../runtime/styles.js';
import {
  InteractiveGraphBlock,
  DataPlotBlock,
  NumberLineBlock,
} from '@activity/schema';

const ctx = () => ({ nextProblemNumber: () => 1 });

// One representative block per figure type, built with overridable sizing attrs.
const graph = (extra: Record<string, unknown> = {}) =>
  InteractiveGraphBlock.parse({
    id: '11111111-1111-4111-8111-111111111111',
    type: 'interactive_graph',
    prompt: [],
    axisConfig: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
    interaction: { type: 'display', drawables: [] },
    ...extra,
  });

const dataPlot = (extra: Record<string, unknown> = {}) =>
  DataPlotBlock.parse({
    id: '22222222-2222-4222-8222-222222222222',
    type: 'data_plot',
    prompt: [],
    data: [1, 2, 3, 4],
    config: { min: 0, max: 10 },
    interaction: { type: 'display', chart: 'dotplot' },
    ...extra,
  });

const numberLine = (extra: Record<string, unknown> = {}) =>
  NumberLineBlock.parse({
    id: '33333333-3333-4333-8333-333333333333',
    type: 'number_line',
    prompt: [],
    config: { min: 0, max: 10 },
    interaction: { type: 'plot_point', correctPoints: [3] },
    ...extra,
  });

const figures = [
  ['interactive_graph', graph],
  ['data_plot', dataPlot],
  ['number_line', numberLine],
] as const;

describe('figure-block sizing emission', () => {
  for (const [name, make] of figures) {
    describe(name, () => {
      it('SZ-INV1 — an unsized block emits NO sizing markup (identity)', () => {
        const html = renderBlock(make(), ctx());
        expect(html).not.toContain('block-sized');
        expect(html).not.toContain('--block-width');
        expect(html).not.toContain('data-block-align');
      });

      it('SZ-M2 — a sized block emits .block-sized + --block-width', () => {
        const html = renderBlock(make({ width: 0.5 }), ctx());
        expect(html).toContain('block-sized');
        expect(html).toContain('--block-width:50%');
      });

      it('SZ-M2 — align left/right emits data-block-align (with width)', () => {
        const left = renderBlock(make({ width: 0.5, align: 'left' }), ctx());
        expect(left).toContain('data-block-align="left"');
        const right = renderBlock(make({ width: 0.5, align: 'right' }), ctx());
        expect(right).toContain('data-block-align="right"');
      });

      it('SZ-M2 — align center, or align without width, emits no align attr', () => {
        expect(
          renderBlock(make({ width: 0.5, align: 'center' }), ctx()),
        ).not.toContain('data-block-align');
        // align without width is a no-op by design (nothing to align).
        expect(
          renderBlock(make({ align: 'left' }), ctx()),
        ).not.toContain('data-block-align');
      });
    });
  }

  it('SZ-M4 — one authored width renders identically across all 3 types', () => {
    for (const [, make] of figures) {
      const html = renderBlock(make({ width: 0.33 }), ctx());
      expect(html).toContain('--block-width:33%');
    }
  });
});

// SZ-CSS — a sized figure block must lift the board's max-width cap, or the
// --block-width fraction is silently swallowed for any width above the cap
// (the "resizing does nothing" bug). Guards the CSS rule stays present.
describe('sized figure canvases lift their max-width cap', () => {
  it('blockStyles removes the graph/number-line/data-plot cap when .block-sized', () => {
    const css = blockStyles.replace(/\s+/g, ' ');
    expect(css).toMatch(
      /\.block-sized \.graph-canvas,\s*\.block-sized \.number-line-canvas,\s*\.block-sized \.data-plot-canvas \{ max-width: none/,
    );
  });
});

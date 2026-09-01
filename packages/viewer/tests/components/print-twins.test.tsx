// =============================================================================
// print-twins.test.tsx — what a kit-backed block actually prints (S5 T2)
// -----------------------------------------------------------------------------
// Every kit-backed block renders two figures: the live JSXGraph board for the
// screen, and a static SVG twin that is what prints. These pin the twin's
// existence and, more importantly, its CONTENT rule (S5-1 as amended by OV4):
//
//   question variant → EMPTY axes, because the student's plotted work is an
//                      answer and a printed worksheet is the blank version.
//                      REVISED VARIANT-SCOPED (design A3): transform_curve's
//                      start curve IS the question — a student cannot
//                      transform a parent they cannot see — so that one
//                      variant prints exactly the start curve and nothing else
//   display variant  → the AUTHORED drawables, because that is the content the
//                      block exists to show; empty axes there would silently
//                      delete what is being taught
//
// The count rides `data-drawables`, emitted by the ONE shared renderer both
// surfaces use (@activity/graph-kit/static-svg), which is what makes it a
// meaningful parity assertion rather than two implementations agreeing by
// luck.
//
// Rendered in SCREEN mode throughout: that is the mode a student prints from,
// and a twin built only under mode='print' would be absent from every real
// printout while passing a test that rendered it in print mode.
// =============================================================================

import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import {
  ViewerProvider,
  createMockCheckService,
  createViewerStore,
} from '../../src/index.js';
import InteractiveGraph from '../../src/blocks/InteractiveGraph.js';
import NumberLine from '../../src/blocks/NumberLine.js';
import DataPlot from '../../src/blocks/DataPlot.js';
import { sanitizedVariantFixtures } from '../../src/fixtures/index.js';
import { TEST_USER_ID } from '../helpers/ids.js';

function harness(ui: ReactElement) {
  const store = createViewerStore({
    userId: TEST_USER_ID,
    activityId: 'aaaaaaaa-0000-4000-8000-000000000001',
    versionId: 'bbbbbbbb-0000-4000-8000-000000000001',
    checkService: createMockCheckService({}),
  });
  return render(
    <ViewerProvider store={store} sectionByBlock={{}}>
      {ui}
    </ViewerProvider>,
  );
}

/** The fixture instance of a type whose interaction matches. */
const variant = (type: 'interactive_graph' | 'number_line' | 'data_plot', kind: string) => {
  const found = sanitizedVariantFixtures(type).find(
    (b) => (b as { interaction?: { type?: string } }).interaction?.type === kind,
  );
  if (!found) throw new Error(`no ${type} fixture with interaction ${kind}`);
  return found;
};

const twinOf = (container: HTMLElement) =>
  container.querySelector('[data-print-svg]');

describe('every kit-backed block carries a printable twin', () => {
  it('renders one for an interactive graph', () => {
    const { container } = harness(
      <InteractiveGraph block={variant('interactive_graph', 'plot_point') as never} mode="screen" />,
    );
    expect(twinOf(container)).not.toBeNull();
    expect(twinOf(container)?.querySelector('svg')).not.toBeNull();
  });

  it('renders one for a number line', () => {
    const { container } = harness(
      <NumberLine block={variant('number_line', 'plot_point') as never} mode="screen" />,
    );
    expect(twinOf(container)?.querySelector('svg')).not.toBeNull();
  });

  it('renders one for a data plot', () => {
    const { container } = harness(
      <DataPlot block={variant('data_plot', 'build_histogram') as never} mode="screen" />,
    );
    expect(twinOf(container)?.querySelector('svg')).not.toBeNull();
  });

  it('hides the twin from assistive tech (the live canvas is the named one)', () => {
    const { container } = harness(
      <InteractiveGraph block={variant('interactive_graph', 'plot_point') as never} mode="screen" />,
    );
    expect(twinOf(container)?.getAttribute('aria-hidden')).toBe('true');
  });
});

describe('a QUESTION prints empty axes', () => {
  it('draws nothing for a plot_point graph', () => {
    const { container } = harness(
      <InteractiveGraph block={variant('interactive_graph', 'plot_point') as never} mode="screen" />,
    );
    expect(twinOf(container)?.querySelector('svg')?.getAttribute('data-drawables')).toBe(
      '0',
    );
  });

  it('draws nothing for a plot_function graph', () => {
    // The authored model IS the answer, and the sanitizer strips it — so there
    // is nothing to draw even if this file wanted to.
    const { container } = harness(
      <InteractiveGraph
        block={variant('interactive_graph', 'plot_function') as never}
        mode="screen"
      />,
    );
    expect(twinOf(container)?.querySelector('svg')?.getAttribute('data-drawables')).toBe(
      '0',
    );
  });

  it('draws nothing on either number-line variant', () => {
    // Neither is a display: the marks a student makes are the answer.
    for (const kind of ['plot_point', 'plot_interval']) {
      const { container } = harness(
        <NumberLine block={variant('number_line', kind) as never} mode="screen" />,
      );
      expect(
        twinOf(container)?.querySelector('svg')?.getAttribute('data-drawables'),
        `number_line ${kind} printed marks`,
      ).toBe('0');
    }
  });

  it('prints ONLY the start curve for a transform_curve question', () => {
    // The variant-scoped revision of this suite's invariant (design A3): the
    // start curve is question material, the target model is the answer. One
    // drawable — the sanitized fixture has no models left to draw, so a count
    // above 1 here means the sanitizer regressed, and 0 means the student got
    // a blank sheet for a "transform THIS" task.
    const { container } = harness(
      <InteractiveGraph
        block={variant('interactive_graph', 'transform_curve') as never}
        mode="screen"
      />,
    );
    expect(twinOf(container)?.querySelector('svg')?.getAttribute('data-drawables')).toBe(
      '1',
    );
  });

  it('prints an equation write line for transform_curve, and only there', () => {
    // The typed half of the two-channel answer (design A2) needs somewhere to
    // be written on paper. Other variants must NOT grow the line: it would
    // read as "write an equation" on questions that never ask for one.
    const transform = harness(
      <InteractiveGraph
        block={variant('interactive_graph', 'transform_curve') as never}
        mode="screen"
      />,
    );
    expect(
      transform.container.querySelector('.viewer-graph__equation-line'),
    ).not.toBeNull();

    const point = harness(
      <InteractiveGraph block={variant('interactive_graph', 'plot_point') as never} mode="screen" />,
    );
    expect(point.container.querySelector('.viewer-graph__equation-line')).toBeNull();
  });

  it('prints an EMPTY frame for a build-the-chart question', () => {
    // The data is served (the student needs it to plot), but plotting it is
    // the task — printing the finished chart would print the answer.
    for (const kind of ['build_dotplot', 'build_histogram', 'build_boxplot']) {
      const { container } = harness(
        <DataPlot block={variant('data_plot', kind) as never} mode="screen" />,
      );
      expect(
        twinOf(container)?.querySelector('svg')?.getAttribute('data-drawables'),
        `data_plot ${kind} printed its data`,
      ).toBe('0');
    }
  });
});

describe('a DISPLAY figure prints its authored content', () => {
  it('draws the authored drawables for a display graph', () => {
    // The bug this exists for: an "empty axes for everything" twin would have
    // deleted the content a display figure exists to show, and no
    // treatment-level rule would have noticed.
    const { container } = harness(
      <InteractiveGraph block={variant('interactive_graph', 'display') as never} mode="screen" />,
    );
    const count = Number(
      twinOf(container)?.querySelector('svg')?.getAttribute('data-drawables'),
    );
    expect(count).toBeGreaterThan(0);
  });

  it('draws the data for a display chart', () => {
    const { container } = harness(
      <DataPlot block={variant('data_plot', 'display') as never} mode="screen" />,
    );
    const count = Number(
      twinOf(container)?.querySelector('svg')?.getAttribute('data-drawables'),
    );
    expect(count).toBeGreaterThan(0);
  });
});

describe('the twin leaks nothing', () => {
  it('contains no answer-key coordinates for a question graph', () => {
    // The strongest form of the rule: not "we asked for zero drawables" but
    // "nothing that could encode an answer reached the markup". The fixture's
    // correct point is (0, -1) and its model is slope 2 / intercept -1.
    const { container } = harness(
      <InteractiveGraph block={variant('interactive_graph', 'plot_point') as never} mode="screen" />,
    );
    const svg = twinOf(container)?.innerHTML ?? '';
    expect(svg).not.toContain('correctPoints');
    expect(svg).not.toContain('tolerance');
    // A path element would mean SOMETHING was plotted beyond the grid/axes.
    expect(twinOf(container)?.querySelectorAll('[data-drawable]')).toHaveLength(0);
  });

  it('contains no target model for a transform_curve question', () => {
    // The one variant whose twin draws SOMETHING, so the zero-drawable form of
    // the rule above cannot cover it: assert instead that what was drawn is
    // exactly one curve and nothing model-shaped beyond it survived.
    const { container } = harness(
      <InteractiveGraph
        block={variant('interactive_graph', 'transform_curve') as never}
        mode="screen"
      />,
    );
    const twin = twinOf(container);
    expect(twin?.innerHTML ?? '').not.toContain('models');
    expect(twin?.querySelectorAll('[data-drawable]')).toHaveLength(1);
    // The write line is BLANK on a student sheet — no answer-key context here,
    // so a formatted target equation in it would be a leak.
    expect(
      container.querySelector('.viewer-graph__equation-line')?.textContent?.trim(),
    ).toBe('y =');
  });
});

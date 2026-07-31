// =============================================================================
// canvas-blocks.test.tsx — number_line + data_plot (S3)
// -----------------------------------------------------------------------------
// Family behavior for both blocks is already covered by the conformance
// factory, which picked them up automatically the moment they were bound. This
// suite covers only what is UNIQUE to each — the geometry translation into the
// shared `graphs` wire category, which is where a silent mistake would send
// the grader work it cannot read:
//
//   number_line → 1-D positions ride as [value, 0]; interval endpoint STYLES
//                 are part of the answer ("2 ≤ x" ≠ "2 < x") and travel in
//                 `domain`, not as loose points.
//   data_plot   → chart values ride as [index, value]; and the client's
//                 locally-computed `correct` is dropped even though this is
//                 the one block whose answer it could legitimately derive.
// =============================================================================

import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, waitFor } from '@testing-library/react';
import {
  ViewerProvider,
  createMockCheckService,
  createViewerStore,
  setDataPlotSurface,
  setNumberLineSurface,
} from '../../src/index.js';
import NumberLine from '../../src/blocks/NumberLine.js';
import DataPlot from '../../src/blocks/DataPlot.js';
import { sanitizedVariantFixtures } from '../../src/fixtures/index.js';

const ACTIVITY = 'aaaaaaaa-0000-4000-8000-000000000001';
const VERSION = 'bbbbbbbb-0000-4000-8000-000000000001';
const SECTION = 'sec-1';

const variantOf = (type: 'number_line' | 'data_plot', interaction: string) =>
  sanitizedVariantFixtures(type).find(
    (b) => (b as unknown as { interaction: { type: string } }).interaction.type === interaction,
  )! as unknown as { id: string };

/** Records the mount and lets a test emit student moves. */
function fakeSurface<R>() {
  const restored: number[][] = [];
  const calls: unknown[] = [];
  let emit: ((r: R) => void) | undefined;
  const surface = vi.fn(async (_el: HTMLElement, config: unknown, hooks: { onChange?: (r: R) => void }) => {
    calls.push(config);
    emit = hooks.onChange;
    return {
      restore: (v: number[]) => restored.push(v),
      setLocked: () => {},
      destroy: () => {},
    };
  });
  return {
    surface,
    calls,
    restored,
    async move(r: R) {
      await act(async () => {
        emit?.(r);
      });
    },
  };
}

function mount(
  Component: typeof NumberLine | typeof DataPlot,
  block: unknown,
  seed?: [number, number][],
) {
  const store = createViewerStore({
    activityId: ACTIVITY,
    versionId: VERSION,
    checkService: createMockCheckService(),
  });
  if (seed) {
    store.setGraphWork((block as { id: string }).id, {
      interaction: 'seeded',
      points: seed,
    });
  }
  const utils = render(
    <ViewerProvider store={store} defaultSectionId={SECTION}>
      <Component block={block as never} mode="screen" />
    </ViewerProvider>,
  );
  return { ...utils, store };
}

afterEach(() => {
  setNumberLineSurface(null);
  setDataPlotSurface(null);
});

describe('NumberLine — 1-D geometry in the shared wire slot', () => {
  it('stores plotted positions as [value, 0] pairs', async () => {
    const fake = fakeSurface<{ values: number[]; answered: boolean }>();
    setNumberLineSurface(fake.surface as never);
    const block = variantOf('number_line', 'plot_point');
    const { store } = mount(NumberLine, block);
    await waitFor(() => expect(fake.calls).toHaveLength(1));

    await fake.move({ values: [3], answered: true });

    expect(store.getState().responses.graphs[block.id]).toEqual({
      interaction: 'plot_point',
      points: [[3, 0]],
    });
  });

  it('carries interval endpoints AND their open/closed styles', async () => {
    const fake = fakeSurface<{
      values: number[];
      answered: boolean;
      interval?: Record<string, unknown>;
    }>();
    setNumberLineSurface(fake.surface as never);
    const block = variantOf('number_line', 'plot_interval');
    const { store } = mount(NumberLine, block);
    await waitFor(() => expect(fake.calls).toHaveLength(1));

    await fake.move({
      values: [2, 7],
      answered: true,
      interval: { min: 2, minStyle: 'closed', max: 7, maxStyle: 'open' },
    });

    const work = store.getState().responses.graphs[block.id]!;
    // The styles are part of the answer — 2 ≤ x < 7 is not 2 < x < 7.
    expect(work.domain).toEqual({
      minX: 2,
      minStyle: 'closed',
      maxX: 7,
      maxStyle: 'open',
    });
  });

  it('restores prior work back to 1-D values', async () => {
    const fake = fakeSurface<{ values: number[]; answered: boolean }>();
    setNumberLineSurface(fake.surface as never);
    const block = variantOf('number_line', 'plot_point');
    mount(NumberLine, block, [[5, 0]]);
    await waitFor(() => expect(fake.restored).toEqual([[5]]));
  });

  it('passes the derived questionShape and NO answer key', async () => {
    const fake = fakeSurface<never>();
    setNumberLineSurface(fake.surface as never);
    mount(NumberLine, variantOf('number_line', 'plot_point'));
    await waitFor(() => expect(fake.calls).toHaveLength(1));

    const wire = JSON.stringify(fake.calls[0]);
    for (const secret of ['answerKey', 'correctPoints', 'correctInterval', 'tolerance']) {
      expect(wire).not.toContain(secret);
    }
    expect((fake.calls[0] as Record<string, unknown>).questionShape).toBeDefined();
  });
});

describe('DataPlot — chart values, and the verdict it refuses to keep', () => {
  it('stores chart values as [index, value] pairs', async () => {
    const fake = fakeSurface<{ values: number[]; answered: boolean }>();
    setDataPlotSurface(fake.surface as never);
    const block = variantOf('data_plot', 'build_histogram');
    const { store } = mount(DataPlot, block);
    await waitFor(() => expect(fake.calls).toHaveLength(1));

    await fake.move({ values: [2, 5, 1], answered: true });

    expect(store.getState().responses.graphs[block.id]).toEqual({
      interaction: 'build_histogram',
      points: [
        [0, 2],
        [1, 5],
        [2, 1],
      ],
    });
  });

  it('serves the student the data (it must — the chart is built FROM it)', async () => {
    const fake = fakeSurface<never>();
    setDataPlotSurface(fake.surface as never);
    mount(DataPlot, variantOf('data_plot', 'build_dotplot'));
    await waitFor(() => expect(fake.calls).toHaveLength(1));

    // The documented `derivableFromServed` residual, asserted rather than
    // assumed: `data` reaches the client by necessity.
    const config = fake.calls[0] as { data?: unknown };
    expect(Array.isArray(config.data)).toBe(true);
    expect((config.data as number[]).length).toBeGreaterThan(0);
  });

  it('drops a client-computed verdict even though this block COULD grade itself', async () => {
    const fake = fakeSurface<{ values: number[]; answered: boolean }>();
    setDataPlotSurface(fake.surface as never);
    const block = variantOf('data_plot', 'build_dotplot');
    const { store } = mount(DataPlot, block);
    await waitFor(() => expect(fake.calls).toHaveLength(1));

    await fake.move({
      values: [3, 5],
      answered: true,
      ...({ correct: true, scored: true } as object),
    } as never);

    const wire = JSON.stringify(store.getState().responses.graphs[block.id]);
    expect(wire).not.toContain('correct');
    expect(wire).not.toContain('scored');
  });

  it('mounts no board for the display variant', async () => {
    const fake = fakeSurface<never>();
    setDataPlotSurface(fake.surface as never);
    mount(DataPlot, variantOf('data_plot', 'display'));
    await new Promise((r) => setTimeout(r, 10));
    expect(fake.surface).not.toHaveBeenCalled();
  });
});

// @vitest-environment jsdom
// =============================================================================
// canvas-follow-store.test.tsx — mounted widgets follow the store (A2, 2026-11-26)
// -----------------------------------------------------------------------------
// The canvas blocks and the maths gaps read the store once, at first render.
// A server restore or a tab hand-back (`store.hydrate`) or a DoL form start
// (`store.startDolForm`) that landed after that left the widget showing the
// old answer, while text blanks showed the new one. blocks/useFollowStored.ts
// remounts the widget when the stored value stops matching what it shows.
//
// These rows pin the logic against FAKE surfaces, where mounts can be counted:
// an outside change remounts from the new value, and nothing else does (the
// widget's own reports, a hydrate that changes nothing). The real boards are
// driven through the same path in canvas-restore-real-kit.test.tsx. Also here:
// the seam's pure restore mappings.
// =============================================================================

import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, waitFor } from '@testing-library/react';
import {
  ViewerProvider,
  createMockCheckService,
  createViewerStore,
  setDataPlotSurface,
  setGraphSurface,
  setNumberLineSurface,
} from '../../src/index.js';
import type { ViewerStore } from '../../src/index.js';
import {
  setMathPromptsSurface,
  toGraphRestore,
  toNumberLineRestore,
} from '../../src/blocks/kitSurfaces.js';
import { sameValue } from '../../src/blocks/useFollowStored.js';
import InteractiveGraph from '../../src/blocks/InteractiveGraph.js';
import NumberLine from '../../src/blocks/NumberLine.js';
import DataPlot from '../../src/blocks/DataPlot.js';
import MathBlock from '../../src/blocks/MathBlock.js';
import { InlineContent } from '../../src/inline/InlineContent.js';
import { sanitizedVariantFixtures } from '../../src/fixtures/index.js';
import type { GraphWork } from '../../src/check/wire.js';
import { TEST_USER_ID } from '../helpers/ids.js';

const ACTIVITY = 'aaaaaaaa-0000-4000-8000-000000000001';
const VERSION = 'bbbbbbbb-0000-4000-8000-000000000001';

const newStore = (): ViewerStore =>
  createViewerStore({
    userId: TEST_USER_ID,
    activityId: ACTIVITY,
    versionId: VERSION,
    checkService: createMockCheckService(),
  });

/** A store holding `seed`, serialized: what a server restore hands `hydrate`. */
function snapshot(seed: (s: ViewerStore) => void): string {
  const s = newStore();
  seed(s);
  return s.serialize();
}

const variantOf = (type: 'interactive_graph' | 'number_line' | 'data_plot', interaction: string) =>
  sanitizedVariantFixtures(type).find(
    (b) => (b as unknown as { interaction: { type: string } }).interaction.type === interaction,
  )! as unknown as { id: string };

/** Counts mounts and records what each mount was asked to restore. */
function countingSurface() {
  const mounts: Array<{ restored: unknown[] }> = [];
  let emit: ((r: unknown) => void) | undefined;
  const surface = vi.fn(async (_el: HTMLElement, _cfg: unknown, hooks: { onChange?: (r: unknown) => void }) => {
    const entry = { restored: [] as unknown[] };
    mounts.push(entry);
    emit = hooks.onChange;
    return {
      getResponse: () => ({ points: [], values: [], answered: false }),
      restore: (w: unknown) => entry.restored.push(w),
      setLocked: () => {},
      destroy: () => {},
    };
  });
  return {
    surface,
    mounts,
    async report(r: unknown) {
      await act(async () => emit?.(r));
    },
  };
}

afterEach(() => {
  cleanup();
  setGraphSurface(null);
  setNumberLineSurface(null);
  setDataPlotSurface(null);
  setMathPromptsSurface(null);
});

const CANVAS = [
  {
    name: 'interactive_graph',
    Component: InteractiveGraph,
    block: variantOf('interactive_graph', 'plot_point'),
    install: (s: unknown) => setGraphSurface(s as never),
    report: { points: [[2, 3]], answered: true },
  },
  {
    name: 'number_line',
    Component: NumberLine,
    block: variantOf('number_line', 'plot_point'),
    install: (s: unknown) => setNumberLineSurface(s as never),
    report: { values: [4], answered: true },
  },
  {
    name: 'data_plot',
    Component: DataPlot,
    block: variantOf('data_plot', 'build_dotplot'),
    install: (s: unknown) => setDataPlotSurface(s as never),
    report: { values: [1, 2], answered: true },
  },
] as const;

describe.each(CANVAS)('$name follows the store', ({ Component, block, install, report }) => {
  function mount(store: ViewerStore) {
    return render(
      <ViewerProvider store={store} defaultSectionId="sec-1">
        <Component block={block as never} mode="screen" />
      </ViewerProvider>,
    );
  }
  const later: GraphWork = { interaction: 'restored', points: [[7, 9]] };

  it('a server restore after mount remounts the board from the restored work', async () => {
    const fake = countingSurface();
    install(fake.surface);
    const store = newStore();
    mount(store);
    await waitFor(() => expect(fake.mounts).toHaveLength(1));
    expect(fake.mounts[0]!.restored).toEqual([]);

    await act(async () => {
      store.hydrate(snapshot((s) => s.setGraphWork(block.id, later)));
    });
    await waitFor(() => expect(fake.mounts).toHaveLength(2));
    await waitFor(() => expect(fake.mounts[1]!.restored).toHaveLength(1));
    // Each block hands its seam its own form of the work: the whole work for a
    // graph or number line, the value list for a data plot.
    expect(JSON.stringify(fake.mounts[1]!.restored[0])).toContain('9');
  });

  it("the board's own reports, and a hydrate that changes nothing, do not remount it", async () => {
    const fake = countingSurface();
    install(fake.surface);
    const store = newStore();
    mount(store);
    await waitFor(() => expect(fake.mounts).toHaveLength(1));
    await fake.report(report);
    await fake.report(report);
    expect(store.getState().responses.graphs[block.id]).toBeDefined();
    // A hydrate of the same answers: every value is a fresh clone, none differ.
    await act(async () => {
      store.hydrate(store.serialize());
    });
    await act(async () => {});
    expect(fake.mounts).toHaveLength(1);
  });

  it('a cleared answer (a DoL form start) remounts an empty board', async () => {
    const fake = countingSurface();
    install(fake.surface);
    const store = newStore();
    store.setGraphWork(block.id, later);
    mount(store);
    await waitFor(() => expect(fake.mounts).toHaveLength(1));
    await waitFor(() => expect(fake.mounts[0]!.restored).toHaveLength(1));
    await act(async () => {
      store.hydrate(snapshot(() => {}));
    });
    await waitFor(() => expect(fake.mounts).toHaveLength(2));
    await act(async () => {});
    expect(fake.mounts[1]!.restored).toEqual([]);
  });
});

describe('maths gaps follow the store', () => {
  const mathBlock = {
    id: 'mb-1',
    type: 'math_block',
    latex: 'x = \\placeholder[m1]{}',
    prompts: [{ id: 'm1' }],
  };
  const inlineNode = { type: 'math_inline', latex: 'k = \\placeholder[g1]{}', prompts: [{ id: 'g1' }] };

  it.each([
    ['math_block', 'm1', () => <MathBlock block={mathBlock as never} mode="screen" />],
    ['inline maths', 'g1', () => <InlineContent nodes={[inlineNode as never]} />],
  ] as const)('%s: a later restore remounts the fields with the restored value', async (_n, id, ui) => {
    const calls: Array<{ initialValues: Record<string, string>; onValue: (id: string, v: string) => void }> = [];
    setMathPromptsSurface(async (_host, opts) => {
      calls.push(opts);
      return { destroy: () => {} };
    });
    const store = newStore();
    render(
      <ViewerProvider store={store} defaultSectionId="sec-1">
        {ui()}
      </ViewerProvider>,
    );
    await waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0]!.initialValues[id]).toBe('');

    // Typing is the field's own report: stored, no remount.
    await act(async () => calls[0]!.onValue(id, '5'));
    expect(store.getState().responses.blanks[id]).toBe('5');
    await act(async () => {});
    expect(calls).toHaveLength(1);

    await act(async () => {
      store.hydrate(snapshot((s) => s.setBlank(id, '12')));
    });
    await waitFor(() => expect(calls).toHaveLength(2));
    expect(calls[1]!.initialValues[id]).toBe('12');
  });
});

describe('the seam maps saved work onto each kit restore', () => {
  it('a ray carries its shape and its one endpoint style', () => {
    expect(
      toGraphRestore({
        interaction: 'plot_ray',
        points: [[0, 0], [3, 3]],
        shape: 'ray_negative',
        endpointStyles: ['open'],
      }),
    ).toEqual([[[0, 0], [3, 3]], { shape: 'ray_negative', fromStyle: 'open' }]);
  });

  it('a segment carries both endpoint styles, in order', () => {
    expect(
      toGraphRestore({
        interaction: 'plot_segment',
        points: [[-2, 1], [2, 3]],
        shape: 'segment',
        endpointStyles: ['closed', 'open'],
      }),
    ).toEqual([[[-2, 1], [2, 3]], { shape: 'segment', endpoints: ['closed', 'open'] }]);
  });

  it('an inequality carries its line style and side from parts[0]; a bad side is dropped', () => {
    const base = { interaction: 'graph_inequality', points: [[0, 0], [1, 1]] as [number, number][] };
    expect(
      toGraphRestore({ ...base, parts: [{ points: base.points, strict: true, side: 'below' }] }),
    ).toEqual([base.points, { strict: true, side: 'below' }]);
    expect(toGraphRestore({ ...base, parts: [{ strict: false, side: 'sideways' }] })).toEqual([
      base.points,
      { strict: false },
    ]);
  });

  it('"no solution" restores with no points; empty work restores nothing', () => {
    expect(toGraphRestore({ interaction: 'plot_point', points: [[1, 1]], noSolution: true })).toEqual([
      [],
      { noSolution: true },
    ]);
    expect(toGraphRestore({ interaction: 'plot_point', points: [] })).toBeNull();
  });

  it("transform_curve restores points only for dragged work (its seeds sit on the parent)", () => {
    const w = { interaction: 'transform_curve', points: [[1, 1]] as [number, number][], equation: 'y = x' };
    expect(toGraphRestore({ ...w, dragged: true })).toEqual([[[1, 1]]]);
    expect(toGraphRestore(w)).toBeNull();
  });

  it('a number-line interval restores from `domain`, styles included; points restore as values', () => {
    expect(
      toNumberLineRestore({
        interaction: 'plot_interval',
        points: [],
        domain: { minX: 2, minStyle: 'closed', maxX: 7, maxStyle: 'open' },
      }),
    ).toEqual([[], { interval: { min: 2, minStyle: 'closed', max: 7, maxStyle: 'open' } }]);
    expect(toNumberLineRestore({ interaction: 'plot_point', points: [[5, 0], [6, 0]] })).toEqual([[5, 6]]);
    expect(toNumberLineRestore({ interaction: 'plot_point', points: [] })).toBeNull();
  });
});

describe('sameValue', () => {
  it('is structural, key-order blind, and reads undefined as absent', () => {
    expect(sameValue({ a: 1, b: [1, { c: 2 }] }, { b: [1, { c: 2 }], a: 1 })).toBe(true);
    expect(sameValue({ a: 1, b: undefined }, { a: 1 })).toBe(true);
    expect(sameValue({ a: [1, 2] }, { a: [2, 1] })).toBe(false);
    expect(sameValue([1], { 0: 1 })).toBe(false);
    expect(sameValue(undefined, {})).toBe(false);
  });
});

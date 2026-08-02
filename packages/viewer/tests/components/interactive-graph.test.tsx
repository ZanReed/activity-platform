// =============================================================================
// interactive-graph.test.tsx — the kit-backed exemplar (S3 V9)
// -----------------------------------------------------------------------------
// The board itself needs a real browser (graph-kit's own suite says the
// widget-mount path stays browser-verified), so these tests drive the component
// through a FAKE surface — which is precisely what the seam exists for. What
// gets pinned here is everything the component owns: response wiring, restore,
// verdict chrome from the server only, narration, teardown, and the fact that
// no answer key or client verdict can enter through the surface.
// =============================================================================

import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import {
  ViewerProvider,
  createMockCheckService,
  createViewerStore,
  setGraphSurface,
} from '../../src/index.js';
import type { GraphSurfaceResponse, MockCheckScript } from '../../src/index.js';
import InteractiveGraph from '../../src/blocks/InteractiveGraph.js';
import { sanitizedVariantFixtures } from '../../src/fixtures/index.js';
import { TEST_USER_ID } from '../helpers/ids.js';

const ACTIVITY = 'aaaaaaaa-0000-4000-8000-000000000001';
const VERSION = 'bbbbbbbb-0000-4000-8000-000000000001';
const SECTION = 'sec-1';

const variants = sanitizedVariantFixtures('interactive_graph');
const plotPoint = variants.find(
  (b) => (b as unknown as { interaction: { type: string } }).interaction.type === 'plot_point',
)! as unknown as { id: string; questionShape?: unknown };
const displayGraph = variants.find(
  (b) => (b as unknown as { interaction: { type: string } }).interaction.type === 'display',
)! as unknown as { id: string };

/** A surface that records what it was asked to mount and lets a test emit
 * student moves. */
function fakeSurface() {
  const calls: unknown[] = [];
  const restored: [number, number][][] = [];
  let destroyed = 0;
  let emit: ((r: GraphSurfaceResponse) => void) | undefined;
  let current: GraphSurfaceResponse = { points: [], answered: false };

  const surface = vi.fn(async (_el: HTMLElement, config: unknown, hooks: {
    onChange?: (r: GraphSurfaceResponse) => void;
  }) => {
    calls.push(config);
    emit = hooks.onChange;
    return {
      getResponse: () => current,
      restore: (pts: [number, number][]) => restored.push(pts),
      setLocked: () => {},
      destroy: () => {
        destroyed += 1;
      },
    };
  });

  return {
    surface,
    calls,
    restored,
    get destroyed() {
      return destroyed;
    },
    async move(response: GraphSurfaceResponse) {
      current = response;
      await act(async () => {
        emit?.(response);
      });
    },
  };
}

function mount(
  block: unknown,
  opts: { script?: MockCheckScript; mode?: 'screen' | 'print'; seed?: boolean } = {},
) {
  const service = createMockCheckService(opts.script ?? {});
  const store = createViewerStore({
    userId: TEST_USER_ID,
    activityId: ACTIVITY,
    versionId: VERSION,
    checkService: service,
  });
  if (opts.seed) {
    store.setGraphWork((block as { id: string }).id, {
      interaction: 'plot_point',
      points: [[3, 4]],
    });
  }
  const utils = render(
    <ViewerProvider store={store} defaultSectionId={SECTION}>
      <InteractiveGraph block={block as never} mode={opts.mode ?? 'screen'} />
    </ViewerProvider>,
  );
  return { ...utils, store, service };
}

afterEach(() => setGraphSurface(null));

describe('mounting the surface', () => {
  it('mounts with the served interaction type and derived questionShape', async () => {
    const fake = fakeSurface();
    setGraphSurface(fake.surface);
    mount(plotPoint);

    await waitFor(() => expect(fake.calls).toHaveLength(1));
    const config = fake.calls[0] as Record<string, unknown>;
    expect(config.interactionType).toBe('plot_point');
    // The sanitizer's derived hint is what tells the widget its layout now
    // that the key is gone.
    expect(config.questionShape).toEqual(plotPoint.questionShape);
    expect(config.questionShape).toBeDefined();
  });

  it('NEVER passes an answer key — the client does not have one', async () => {
    const fake = fakeSurface();
    setGraphSurface(fake.surface);
    mount(plotPoint);

    await waitFor(() => expect(fake.calls).toHaveLength(1));
    const wire = JSON.stringify(fake.calls[0]);
    for (const secret of ['answerKey', 'correctPoints', 'tolerance', 'models']) {
      expect(wire).not.toContain(secret);
    }
  });

  it('does not mount a board for a display-mode graph', async () => {
    const fake = fakeSurface();
    setGraphSurface(fake.surface);
    mount(displayGraph);
    await new Promise((r) => setTimeout(r, 10));
    expect(fake.surface).not.toHaveBeenCalled();
  });

  it('does not mount a board in print mode', async () => {
    const fake = fakeSurface();
    setGraphSurface(fake.surface);
    mount(plotPoint, { mode: 'print' });
    await new Promise((r) => setTimeout(r, 10));
    expect(fake.surface).not.toHaveBeenCalled();
  });

  it('destroys the board on unmount (no leaked JSXGraph instance)', async () => {
    const fake = fakeSurface();
    setGraphSurface(fake.surface);
    const { unmount } = mount(plotPoint);
    await waitFor(() => expect(fake.calls).toHaveLength(1));
    unmount();
    await waitFor(() => expect(fake.destroyed).toBe(1));
  });

  it('restores prior work on mount (reload keeps the student’s graph)', async () => {
    const fake = fakeSurface();
    setGraphSurface(fake.surface);
    mount(plotPoint, { seed: true });
    await waitFor(() => expect(fake.restored).toEqual([[[3, 4]]]));
  });
});

describe('response wiring (the store is the source of truth)', () => {
  it('writes the student’s work to the graphs category, keyed by block id', async () => {
    const fake = fakeSurface();
    setGraphSurface(fake.surface);
    const { store } = mount(plotPoint);
    await waitFor(() => expect(fake.calls).toHaveLength(1));

    await fake.move({ points: [[2, -1]], answered: true });

    expect(store.getState().responses.graphs[plotPoint.id]).toEqual({
      interaction: 'plot_point',
      points: [[2, -1]],
    });
  });

  it('carries no-solution and inequality choices through as work', async () => {
    const fake = fakeSurface();
    setGraphSurface(fake.surface);
    const { store } = mount(plotPoint);
    await waitFor(() => expect(fake.calls).toHaveLength(1));

    await fake.move({
      points: [[0, 0]],
      answered: true,
      noSolution: false,
      strict: true,
      side: 'above',
    });

    const work = store.getState().responses.graphs[plotPoint.id]!;
    expect(work.noSolution).toBe(false);
    expect(work.parts).toEqual([{ points: [[0, 0]], strict: true, side: 'above' }]);
  });

  it('stores no grading signal, even if the surface tried to send one', async () => {
    const fake = fakeSurface();
    setGraphSurface(fake.surface);
    const { store } = mount(plotPoint);
    await waitFor(() => expect(fake.calls).toHaveLength(1));

    await fake.move({
      points: [[1, 1]],
      answered: true,
      // Extra fields a careless surface might pass along.
      ...({ correct: true, scored: true, earned: 1, total: 1 } as object),
    } as GraphSurfaceResponse);

    const wire = JSON.stringify(store.getState().responses.graphs[plotPoint.id]);
    for (const key of ['correct', 'scored', 'earned', 'total']) {
      expect(wire).not.toContain(key);
    }
  });
});

describe('state chrome + a11y', () => {
  it('shows no verdict before the server has spoken', async () => {
    const fake = fakeSurface();
    setGraphSurface(fake.surface);
    mount(plotPoint);
    await waitFor(() => expect(fake.calls).toHaveLength(1));
    await fake.move({ points: [[1, 1]], answered: true });
    expect(document.querySelector('[data-state]')).toBeNull();
  });

  it('shows the server verdict after a check', async () => {
    const fake = fakeSurface();
    setGraphSurface(fake.surface);
    const { store } = mount(plotPoint, {
      script: { verdicts: { [plotPoint.id]: 'incorrect' } },
    });
    await waitFor(() => expect(fake.calls).toHaveLength(1));
    await fake.move({ points: [[9, 9]], answered: true });
    await act(async () => {
      await store.checkSection(SECTION, { graphs: [plotPoint.id] });
    });

    await waitFor(() =>
      expect(document.querySelector('[data-state]')).toHaveAttribute(
        'data-state',
        'incorrect',
      ),
    );
  });

  it('an incorrect verdict never redraws the student’s work', async () => {
    const fake = fakeSurface();
    setGraphSurface(fake.surface);
    const { store } = mount(plotPoint, {
      script: { verdicts: { [plotPoint.id]: 'incorrect' } },
    });
    await waitFor(() => expect(fake.calls).toHaveLength(1));
    await fake.move({ points: [[9, 9]], answered: true });
    const before = fake.restored.length;

    await act(async () => {
      await store.checkSection(SECTION, { graphs: [plotPoint.id] });
    });
    await waitFor(() => expect(document.querySelector('[data-state]')).not.toBeNull());

    // family-spec rule 2, named FOR this block: ✗ marks the attempt, it never
    // redraws the line.
    expect(fake.restored.length).toBe(before);
    expect(store.getState().responses.graphs[plotPoint.id]!.points).toEqual([[9, 9]]);
  });

  it('narrates handle positions to a VISUALLY HIDDEN live region', async () => {
    const fake = fakeSurface();
    setGraphSurface(fake.surface);
    const { container } = mount(plotPoint);
    await waitFor(() => expect(fake.calls).toHaveLength(1));
    await fake.move({ points: [[2, -3]], answered: true });

    const live = container.querySelector('[data-graph-narration="true"]')!;
    expect(live).toHaveAttribute('aria-live', 'polite');
    expect(live).toHaveTextContent('2, -3');
    // Hidden from SIGHT, not from assistive tech. The clip-rect recipe, not
    // display:none — and jest-dom's toBeVisible() passing is the proof of
    // exactly that distinction: display:none would fail it, and would also
    // take the announcement away from the screen reader, which is the whole
    // point of the region. A visible readout would instead hand over the
    // coordinate reading that IS the skill.
    expect(live).toBeVisible();
    expect((live as HTMLElement).style.position).toBe('absolute');
    expect((live as HTMLElement).style.clipPath).toBe('inset(50%)');
    expect((live as HTMLElement).style.width).toBe('1px');
    expect((live as HTMLElement).style.display).not.toBe('none');
  });

  it('gives the canvas an accessible name before the chunk lands', () => {
    const fake = fakeSurface();
    setGraphSurface(fake.surface);
    const { container } = mount(plotPoint);
    expect(
      container.querySelector('[data-graph-canvas="true"]'),
    ).toHaveAttribute('aria-label', 'Interactive graph');
  });

  it('discloses the solution only once the server releases it', async () => {
    const fake = fakeSurface();
    setGraphSurface(fake.surface);
    const { store } = mount(plotPoint, {
      script: {
        solutions: {
          [plotPoint.id]: [{ type: 'text', text: 'It passes through (0, −1).', marks: [] }],
        },
      },
    });
    await waitFor(() => expect(fake.calls).toHaveLength(1));
    expect(screen.queryByText('Show solution')).toBeNull();

    await act(async () => {
      await store.checkSection(SECTION, { graphs: [plotPoint.id] });
    });
    await waitFor(() => expect(screen.getByText('Show solution')).toBeInTheDocument());
  });
});

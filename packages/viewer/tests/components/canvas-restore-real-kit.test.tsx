// @vitest-environment jsdom
// =============================================================================
// canvas-restore-real-kit.test.tsx — graph and number-line work survives a
// reload, through the REAL kit (review defect A2, 2026-11-26)
// -----------------------------------------------------------------------------
// JSXGraph mounts in jsdom (it warns that IntersectionObserver and matchMedia
// are missing and carries on), so these rows drive the real graph and number-
// line boards through the real block, the real seam and the real store. Each
// row is the path a student's answer travels:
//
//   1. The student builds an answer on the board: picks a shape, flips an
//      endpoint, picks a side, moves a handle by keyboard.
//   2. The block stores it. The stored work must carry every choice: until
//      2026-11-26 the kit, mounted ungraded as the viewer always mounts it,
//      reported NONE of a ray's or segment's shape and styles or an
//      inequality's line style and side, so the server called every ray and
//      segment unanswered and every inequality wrong.
//   3. Reload: a fresh block over a store hydrated from the first one. The
//      board must show the saved work (its pills and, via a Tab that makes the
//      kit report what it holds, its handles and choices), and the restore
//      must write NOTHING to the store: the old points-only restore echoed the
//      board's defaults back over the saved choices.
//
// Plus the two neighbours of the same defect: a store change that lands after
// mount (the server restore) reaches the board, and a Tab before any answer
// (`answered: false`) is not stored as one.
// =============================================================================

import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import {
  ViewerProvider,
  createMockCheckService,
  createViewerStore,
} from '../../src/index.js';
import type { ViewerStore } from '../../src/index.js';
import InteractiveGraph from '../../src/blocks/InteractiveGraph.js';
import NumberLine from '../../src/blocks/NumberLine.js';
import { sanitizedVariantFixtures } from '../../src/fixtures/index.js';
import type { GraphWork } from '../../src/check/wire.js';
import { TEST_USER_ID } from '../helpers/ids.js';

type Block = { id: string; interaction: { type: string } };

const variant = (type: 'interactive_graph' | 'number_line', interaction: string): Block =>
  sanitizedVariantFixtures(type).find(
    (b) => (b as unknown as Block).interaction.type === interaction,
  ) as unknown as Block;

beforeAll(() => {
  // JSXGraph probes matchMedia for a print listener; jsdom has none. A stub
  // keeps the log readable and changes nothing the board draws.
  if (!window.matchMedia) {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
  }
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
});

function newStore(): ViewerStore {
  return createViewerStore({
    userId: TEST_USER_ID,
    activityId: 'aaaaaaaa-0000-4000-8000-000000000001',
    versionId: 'bbbbbbbb-0000-4000-8000-000000000001',
    checkService: createMockCheckService(),
  });
}

type Component = typeof InteractiveGraph | typeof NumberLine;

async function mountBlock(Component: Component, block: Block, store: ViewerStore) {
  const utils = render(
    <ViewerProvider store={store} defaultSectionId="sec-1">
      <Component block={block as never} mode="screen" />
    </ViewerProvider>,
  );
  const root = utils.container;
  // The kit's keyboard target: it takes over the per-mount host itself.
  const board = (): HTMLElement | null =>
    root.querySelector<HTMLElement>('[data-graph-board-host][tabindex="0"]');
  await waitFor(() => expect(board(), 'the real board mounted').not.toBeNull(), {
    timeout: 15_000, // the first test pays the kit chunk's cold import
  });
  // The restore runs in the mount promise's .then, one tick after the board.
  await act(async () => {});
  const buttons = () =>
    Array.from(root.querySelectorAll<HTMLButtonElement>('[data-graph-board-host] button'));
  return {
    ...utils,
    board: () => board()!,
    async click(prefix: string) {
      const b = buttons().find((x) => x.textContent?.startsWith(prefix));
      if (!b) throw new Error(`no "${prefix}" pill in: ${buttons().map((x) => x.textContent).join(' | ')}`);
      await act(async () => b.click());
    },
    async key(key: string) {
      await act(async () => {
        fireEvent.keyDown(board()!, { key });
      });
    },
    /** What the pills show: label + pressed state, for every visible pill. */
    pills: () =>
      buttons()
        .filter((b) => !b.hidden)
        .map((b) => `${b.textContent}${b.getAttribute('aria-pressed') === 'true' ? ' [on]' : ''}`),
  };
}

const work = (store: ViewerStore, id: string): GraphWork | undefined =>
  store.getState().responses.graphs[id];

interface Case {
  name: string;
  Component: Component;
  block: Block;
  /** The student's moves on a fresh board. */
  build: string[];
  /** What the stored work must say (a subset of it). */
  expected: Partial<GraphWork>;
}

const ineq = variant('interactive_graph', 'graph_inequality');

const CASES: Case[] = [
  {
    name: 'plot_ray: a ray with an open endpoint',
    Component: InteractiveGraph,
    block: variant('interactive_graph', 'plot_ray'),
    build: ['key:ArrowUp', 'Ray', 'Endpoint'],
    expected: { shape: 'ray_positive', endpointStyles: ['open'] },
  },
  {
    name: 'plot_segment: one open and one closed endpoint',
    Component: InteractiveGraph,
    block: variant('interactive_graph', 'plot_segment'),
    build: ['key:ArrowUp', 'Segment', 'Left'],
    expected: { shape: 'segment', endpointStyles: ['open', 'closed'] },
  },
  {
    name: 'graph_inequality: a dotted line shaded below',
    Component: InteractiveGraph,
    block: ineq,
    build: ['key:ArrowUp', 'Dotted line', 'Shade below'],
    expected: {},
  },
  {
    name: 'graph_inequality: "no solution"',
    Component: InteractiveGraph,
    // The fixture turns the choice off; the author's flag is what offers it.
    block: { ...ineq, allowNoSolution: true } as Block,
    build: ['Cannot be graphed'],
    expected: { noSolution: true, points: [] },
  },
  {
    name: 'number_line plot_interval: mixed endpoint styles',
    Component: NumberLine,
    block: variant('number_line', 'plot_interval'),
    build: ['key:ArrowRight', 'Segment', 'Left'],
    expected: {},
  },
];

/** Checks a case's own expectations that a Partial can't express. */
function caseSpecific(c: Case, w: GraphWork) {
  if (c.name.startsWith('graph_inequality: a dotted')) {
    expect(w.parts?.[0]).toMatchObject({ strict: true, side: 'below' });
  }
  if (c.name.startsWith('number_line')) {
    expect(w.domain).toMatchObject({ minStyle: 'open', maxStyle: 'closed' });
    expect(w.domain?.minX).toBeTypeOf('number');
    expect(w.domain?.maxX).toBeTypeOf('number');
  }
}

describe.each(CASES)('$name', (c) => {
  it('is stored with every choice, restored whole, and the restore writes nothing', async () => {
    // 1–2. Build it on a real board; the block stores it.
    const first = newStore();
    const a = await mountBlock(c.Component, c.block, first);
    for (const step of c.build) {
      if (step.startsWith('key:')) await a.key(step.slice(4));
      else await a.click(step);
    }
    const saved = work(first, c.block.id);
    expect(saved, 'the answer was stored').toBeDefined();
    expect(saved).toMatchObject(c.expected);
    caseSpecific(c, saved!);
    const shownBefore = a.pills();
    a.unmount();

    // 3. Reload into a fresh store, then a fresh board.
    const second = newStore();
    expect(second.hydrate(first.serialize())).toBe(true);
    const writes = vi.spyOn(second, 'setGraphWork');
    const b = await mountBlock(c.Component, c.block, second);

    expect(writes, 'the restore wrote nothing to the store').not.toHaveBeenCalled();
    expect(work(second, c.block.id)).toEqual(saved);
    expect(b.pills(), 'the board shows the saved choices').toEqual(shownBefore);

    // Tab makes the kit report what it holds; it must be exactly the saved
    // work. ("No solution" freezes the board's keyboard, so its pills above
    // are the read-back.)
    if (saved!.noSolution !== true) {
      await b.key('Tab');
      expect(writes, 'the Tab reported once').toHaveBeenCalledTimes(1);
      expect(work(second, c.block.id)).toEqual(saved);
    }
  });

  it('follows a store change that lands after the board mounted', async () => {
    const first = newStore();
    const a = await mountBlock(c.Component, c.block, first);
    for (const step of c.build) {
      if (step.startsWith('key:')) await a.key(step.slice(4));
      else await a.click(step);
    }
    const saved = work(first, c.block.id)!;
    const shownBefore = a.pills();
    a.unmount();

    // The board mounts EMPTY, then the server's copy arrives.
    const second = newStore();
    const b = await mountBlock(c.Component, c.block, second);
    expect(b.pills()).not.toEqual(shownBefore);
    await act(async () => {
      second.hydrate(first.serialize());
    });
    await waitFor(() => expect(b.pills()).toEqual(shownBefore));
    expect(work(second, c.block.id)).toEqual(saved);
    if (saved.noSolution !== true) {
      await waitFor(() => expect(b.board()).not.toBeNull());
      await b.key('Tab');
      expect(work(second, c.block.id)).toEqual(saved);
    }
  });
});

describe('a Tab before any answer is not an answer', () => {
  // Both boards report a Tab between handles as a change with
  // `answered: false`. Stored, it would put the default handle positions on
  // the wire and the grader would mark them (the data-plot fix, A2's first
  // half, found the same hazard there).
  it.each([
    ['interactive_graph', InteractiveGraph, variant('interactive_graph', 'plot_segment')],
    ['number_line', NumberLine, variant('number_line', 'plot_interval')],
  ] as const)('%s', async (_name, Component, block) => {
    const store = newStore();
    const m = await mountBlock(Component, block, store);
    await m.key('Tab');
    expect(work(store, block.id)).toBeUndefined();
    // A real move after it IS stored.
    await m.key(Component === NumberLine ? 'ArrowRight' : 'ArrowUp');
    expect(work(store, block.id)).toBeDefined();
  });
});

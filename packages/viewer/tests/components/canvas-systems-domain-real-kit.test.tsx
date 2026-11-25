// =============================================================================
// canvas-systems-domain-real-kit.test.tsx — a bounded curve and a system, end
// to end through the REAL kit (A2 follow-up, 2026-11-26)
// -----------------------------------------------------------------------------
// Two gaps the editor could author and the student surface could not answer:
//
//   1. A curve with a range ("y = x² for x ≥ 0"). The kit drew its endpoint
//      handles and style toggles only from the answer key, which the viewer
//      never has, and the grader ignored the range. A student saw the whole
//      curve and could not say where it stops.
//   2. A system ("graph both lines", a system of inequalities). Both system
//      boards required the key, so the viewer mounted the one-part board and
//      the grader, which reads one part per curve, marked every system wrong.
//
// Each row is the whole path: the AUTHORED block → the sanitizer (what the
// student is served) → the real block, seam and board, driven by keyboard and
// by its own controls → the store → the server grader over the authored block.
// Then a reload, where the board must show the saved work and write nothing.
// =============================================================================

import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import {
  ViewerProvider,
  createMockCheckService,
  createViewerStore,
  sanitizeBlock,
} from '../../src/index.js';
import type { ViewerStore } from '../../src/index.js';
import InteractiveGraph from '../../src/blocks/InteractiveGraph.js';
import { authoredVariantFixtures } from '../../src/fixtures/index.js';
import { gradeSection } from '../../src/server/grading/index.js';
import { emptySectionResponses, type GraphWork } from '../../src/check/wire.js';
import { TEST_USER_ID } from '../helpers/ids.js';

type Block = Parameters<typeof sanitizeBlock>[0];
type Pt = [number, number];

// Tolerances written out: an authored fixture is the PRE-parse shape, so the
// schema's defaults are not filled in, and the grader reads the raw block.
const tol = { slopeTolerance: 0.1, interceptTolerance: 0.1 } as const;
const lineA = { family: 'linear', slope: 2, intercept: -1, ...tol } as const; // y = 2x − 1
const lineB = { family: 'linear', slope: -1, intercept: 2, ...tol } as const; // y = −x + 2

/** An authored interactive_graph with the given interaction. */
function authored(interaction: Record<string, unknown>): Block {
  const base = authoredVariantFixtures('interactive_graph').find(
    (b) => (b as { interaction?: { type?: string } }).interaction?.type === 'plot_function',
  )!;
  return { ...base, interaction } as Block;
}

beforeAll(() => {
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

const workOf = (store: ViewerStore, id: string): GraphWork | undefined =>
  store.getState().responses.graphs[id];

/** Every handle, in the board's Tab order: a system's parts, in order. */
const flatPoints = (w: GraphWork | undefined): Pt[] =>
  w?.parts && w.parts.length > 1 ? w.parts.flatMap((p) => p.points ?? []) : (w?.points ?? []);

async function mountServed(block: Block, store: ViewerStore) {
  const served = sanitizeBlock(block);
  const utils = render(
    <ViewerProvider store={store} defaultSectionId="sec-1">
      <InteractiveGraph block={served as never} mode="screen" />
    </ViewerProvider>,
  );
  const root = utils.container;
  const board = () => root.querySelector<HTMLElement>('[data-graph-board-host][tabindex="0"]')!;
  await waitFor(() => expect(root.querySelector('[data-graph-board-host][tabindex="0"]')).not.toBeNull(), {
    timeout: 15_000,
  });
  await act(async () => {});
  const buttons = () => Array.from(root.querySelectorAll<HTMLButtonElement>('[data-graph-board-host] button'));
  const key = async (k: string, times = 1) => {
    for (let n = 0; n < times; n++) {
      await act(async () => {
        fireEvent.keyDown(board(), { key: k });
      });
    }
  };
  return {
    ...utils,
    served,
    key,
    labels: () => buttons().map((b) => b.getAttribute('aria-label') ?? b.textContent ?? ''),
    async click(prefix: string) {
      const b = buttons().find(
        (x) => (x.getAttribute('aria-label') ?? x.textContent ?? '').startsWith(prefix),
      );
      if (!b) throw new Error(`no "${prefix}" in: ${buttons().map((x) => x.textContent).join(' | ')}`);
      await act(async () => b.click());
    },
    /** Move every handle, in Tab order, onto `targets` by arrow keys. */
    async driveTo(targets: Pt[]) {
      await key('ArrowUp');
      await key('ArrowDown');
      const start = flatPoints(workOf(store, block.id));
      expect(start).toHaveLength(targets.length);
      for (let i = 0; i < targets.length; i++) {
        const [x0, y0] = start[i]!;
        const [x1, y1] = targets[i]!;
        await key(x1 > x0 ? 'ArrowRight' : 'ArrowLeft', Math.abs(x1 - x0));
        await key(y1 > y0 ? 'ArrowUp' : 'ArrowDown', Math.abs(y1 - y0));
        if (i < targets.length - 1) await key('Tab');
      }
      expect(flatPoints(workOf(store, block.id))).toEqual(targets);
    },
  };
}

function grade(block: Block, work: GraphWork | undefined) {
  return gradeSection({
    document: { sections: [{ id: 's1', rows: [{ columns: [{ blocks: [block] }] }] }] } as never,
    sectionId: 's1',
    responses: { ...emptySectionResponses(), graphs: work ? { [block.id]: work } : {} },
  }).items[block.id]?.verdict;
}

/** Reload: a fresh store hydrated from `from`, a fresh board, and a Tab that
 * makes the kit report what it holds. Returns what it reported. */
async function reload(block: Block, from: ViewerStore) {
  const store = newStore();
  expect(store.hydrate(from.serialize())).toBe(true);
  const writes = vi.spyOn(store, 'setGraphWork');
  const m = await mountServed(block, store);
  expect(writes, 'the restore wrote nothing').not.toHaveBeenCalled();
  await m.key('Tab');
  expect(writes).toHaveBeenCalledTimes(1);
  return { store, m };
}

describe('a curve with a range: y = 2x − 1 for x ≥ 0', () => {
  const block = authored({
    type: 'plot_function',
    models: [lineA],
    domains: [{ min: 0, minStyle: 'closed' }],
  });

  it('is served WHICH end is bounded, and nothing about where', () => {
    const served = sanitizeBlock(block) as unknown as {
      questionShape?: { domain?: unknown };
      interaction: Record<string, unknown>;
    };
    expect(served.questionShape?.domain).toEqual({ min: true });
    expect(served.interaction.domains).toBeUndefined();
    expect(JSON.stringify(served)).not.toContain('minStyle');
  });

  it('the board offers the start toggle; the range is graded and restored', async () => {
    const first = newStore();
    const a = await mountServed(block, first);
    expect(a.labels().some((l) => l.startsWith('Start:'))).toBe(true);
    expect(a.labels().some((l) => l.startsWith('End:'))).toBe(false);

    // On the line, starting at x = 0: right, closed by default.
    await a.driveTo([[0, -1], [3, 5]]);
    const right = workOf(first, block.id)!;
    expect(right.domain).toEqual({ minX: 0, minStyle: 'closed' });
    expect(grade(block, right)).toBe('correct');

    // The same line from x = 0 OPEN is a different answer (x > 0).
    await a.click('Start:');
    expect(workOf(first, block.id)!.domain?.minStyle).toBe('open');
    expect(grade(block, workOf(first, block.id))).toBe('incorrect');
    await a.click('Start:');
    a.unmount();

    const { store } = await reload(block, first);
    expect(workOf(store, block.id)).toEqual(workOf(first, block.id));
  });

  it('a range that starts in the wrong place is marked wrong', async () => {
    const store = newStore();
    const a = await mountServed(block, store);
    await a.driveTo([[1, 1], [3, 5]]); // on the line, but from x = 1
    expect(grade(block, workOf(store, block.id))).toBe('incorrect');
  });
});

describe('a system of two lines', () => {
  const block = authored({ type: 'plot_function', models: [lineA, lineB] });

  it('is served one family per line', () => {
    const served = sanitizeBlock(block) as unknown as { questionShape?: { partFamilies?: unknown } };
    expect(served.questionShape?.partFamilies).toEqual(['linear', 'linear']);
  });

  it('gets two curves; both drawn right is correct, in either order, and survives a reload', async () => {
    const first = newStore();
    const a = await mountServed(block, first);
    // Line B first, then line A: the grader matches in any order.
    await a.driveTo([[0, 2], [2, 0], [0, -1], [2, 3]]);
    const w = workOf(first, block.id)!;
    expect(w.parts).toHaveLength(2);
    expect(w.points).toEqual([]);
    expect(grade(block, w)).toBe('correct');
    a.unmount();

    const { store } = await reload(block, first);
    expect(workOf(store, block.id)).toEqual(w);
  });

  it('one line right and one wrong is incorrect', async () => {
    const store = newStore();
    const a = await mountServed(block, store);
    await a.driveTo([[0, -1], [2, 3], [0, 0], [2, 2]]);
    expect(grade(block, workOf(store, block.id))).toBe('incorrect');
  });
});

describe('a system of two inequalities: y > 2x − 1 and y ≤ −x + 2', () => {
  const block = authored({
    type: 'graph_inequality',
    inequalities: [
      { boundary: lineA, strict: true, shadeSide: 'above' },
      { boundary: lineB, strict: false, shadeSide: 'below' },
    ],
  });

  it('gets two boundaries with their own style and side; an unpicked side is no answer', async () => {
    const first = newStore();
    const a = await mountServed(block, first);
    expect(a.labels().filter((l) => l.startsWith('Line '))).toHaveLength(2);
    await a.driveTo([[0, -1], [2, 3], [0, 2], [2, 0]]);

    // Lines drawn, no sides picked yet: nothing is defaulted.
    const unpicked = workOf(first, block.id)!;
    expect(unpicked.parts?.map((p) => p.side)).toEqual([undefined, undefined]);
    expect(grade(block, unpicked)).toBe('incorrect');

    // Line 1: dotted, shaded above (the flip goes unpicked → above).
    await a.click('Line 1');
    await a.click('Dotted');
    await a.click('Flip shaded side');
    // Line 2: solid (the default), shaded below (above, then below).
    await a.click('Line 2');
    await a.click('Flip shaded side');
    await a.click('Flip shaded side');

    const w = workOf(first, block.id)!;
    expect(w.parts?.map((p) => ({ strict: p.strict, side: p.side }))).toEqual([
      { strict: true, side: 'above' },
      { strict: false, side: 'below' },
    ]);
    expect(grade(block, w)).toBe('correct');
    a.unmount();

    const { store } = await reload(block, first);
    expect(workOf(store, block.id)).toEqual(w);
  });
});

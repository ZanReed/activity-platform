// =============================================================================
// render-scope.test.tsx — a student's input re-renders only the block it is in
// (efficiency audit 2026-10 #5; TODOS item 1, decisions 1–8 ruled 2026-10-18)
// -----------------------------------------------------------------------------
// Before the fix one keystroke in one blank re-rendered all 60 blocks of a
// 60-block worksheet, through three channels: the container subscribed to the
// whole store, the context handed the whole state to every block, and the
// store deep-copied every answer on each keystroke (so even a block reading
// only its own answer saw a "new" one). Each row here closes one of those.
//
// Renders are counted per block with React's Profiler, which fires for any
// commit inside it — including a block re-rendering from its own subscription,
// not just from its parent.
// =============================================================================

import { afterEach, describe, expect, it } from 'vitest';
import { Profiler, type ComponentType } from 'react';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import {
  ViewerContainer,
  createMockCheckService,
  createViewerStore,
} from '../../src/index.js';
import { resolveBlockComponent } from '../../src/registry/resolveComponent.js';
import type { BlockComponentProps, BlockType, SanitizedActivityDocument } from '../../src/index.js';
import { sanitizedFixtureDocument } from '../../src/fixtures/index.js';
import { TEST_USER_ID } from '../helpers/ids.js';

const fullDoc = sanitizedFixtureDocument();
const allBlocks = fullDoc.sections
  .flatMap((s) => s.rows)
  .flatMap((r) => r.columns)
  .flatMap((c) => c.blocks) as unknown as Record<string, unknown>[];
const first = (type: string) => {
  const b = allBlocks.find((x) => x.type === type);
  if (!b) throw new Error(`fixture has no ${type}`);
  return b;
};

/**
 * 60 blocks: the three targets (a blank, a choice, a multi-blank table), then
 * callouts and id-cloned questions. With `split`, the first 30 are section 1
 * and the rest section 2, each with its own Check.
 */
function sixtyBlockDoc(split = false): {
  doc: SanitizedActivityDocument;
  fib: string;
  mc: string;
  table: string;
  ids: string[];
} {
  const fib = first('fill_in_blank');
  const mc = first('multiple_choice');
  const table = first('table');
  const callout = first('callout');
  const shortAnswer = first('short_answer');
  const blocks: Record<string, unknown>[] = [fib, mc, table];
  for (let i = 0; blocks.length < 60; i++) {
    const kind = [callout, mc, shortAnswer][i % 3]!;
    // Own prefix: the fixture's ids all share one, so a clone could collide.
    blocks.push({ ...kind, id: `cccccccc-0000-4000-8000-${String(i).padStart(12, '0')}` });
  }
  const rowsOf = (list: Record<string, unknown>[], from: number) =>
    list.map((block, i) => ({
      id: `row-${from + i}`,
      gridLines: 'inherit',
      columns: [{ id: `col-${from + i}`, blocks: [block] }],
    }));
  const section = (id: string, title: string, list: Record<string, unknown>[], from: number) => ({
    ...fullDoc.sections[0]!,
    id,
    title,
    rows: rowsOf(list, from),
  });
  const doc = {
    ...fullDoc,
    sections: split
      ? [section('sec-1', 'Section one', blocks.slice(0, 30), 0), section('sec-2', 'Section two', blocks.slice(30), 30)]
      : [section('sec-1', 'Section one', blocks, 0)],
  } as unknown as SanitizedActivityDocument;
  return {
    doc,
    fib: String(fib.id),
    mc: String(mc.id),
    table: String(table.id),
    ids: blocks.map((b) => String(b.id)),
  };
}

const renders = new Map<string, number>();
const counted = new Map<string, ComponentType<BlockComponentProps>>();
/** Stable per type, so the wrapper never changes identity between renders. */
function countingResolve(type: BlockType): ComponentType<BlockComponentProps> | null {
  const Real = resolveBlockComponent(type);
  if (!Real) return null;
  let C = counted.get(type);
  if (!C) {
    C = function Counted(props: BlockComponentProps) {
      const id = (props.block as { id: string }).id;
      return (
        <Profiler id={id} onRender={() => renders.set(id, (renders.get(id) ?? 0) + 1)}>
          <Real {...props} />
        </Profiler>
      );
    };
    counted.set(type, C);
  }
  return C;
}

function mount(split = false) {
  const { doc, fib, mc, table, ids } = sixtyBlockDoc(split);
  const store = createViewerStore({
    userId: TEST_USER_ID,
    activityId: 'aaaaaaaa-0000-4000-8000-000000000001',
    versionId: 'bbbbbbbb-0000-4000-8000-000000000001',
    checkService: createMockCheckService(),
  });
  const view = render(
    <ViewerContainer
      document={doc}
      store={store}
      versionId="bbbbbbbb-0000-4000-8000-000000000001"
      resolveComponent={countingResolve}
    />,
  );
  const mounted = renders.size;
  renders.clear();
  return { view, store, fib, mc, table, ids, mounted };
}

const rerendered = () => [...renders.keys()];

afterEach(() => {
  cleanup();
  renders.clear();
});

describe('render scope (audit #5)', () => {
  it('the worksheet renders the 60 top-level blocks the rows are about', () => {
    expect(mount().mounted).toBe(60);
  });

  it('typing in one blank re-renders only that block', () => {
    const { view, store, fib, mc } = mount();
    // Other questions already hold answers, so a store that re-creates every
    // answer on each keystroke would re-render them too.
    act(() => store.setChoices(mc, ['x']));
    act(() => store.setFreeText('cccccccc-0000-4000-8000-000000000002', 'an answer'));
    renders.clear();
    const input = view.container.querySelector<HTMLInputElement>(`[data-block-id="${fib}"] input`);
    expect(input).not.toBeNull();
    act(() => {
      fireEvent.change(input!, { target: { value: '7' } });
    });
    expect(rerendered()).toEqual([fib]);
  });

  it('choosing an answer re-renders only that question', () => {
    const { view, mc } = mount();
    const choice = view.container.querySelector<HTMLInputElement>(`[data-block-id="${mc}"] input`);
    expect(choice).not.toBeNull();
    act(() => {
      fireEvent.click(choice!);
    });
    expect(rerendered()).toEqual([mc]);
  });

  it('a keystroke elsewhere leaves another block\'s answer object untouched', () => {
    const { view, store, fib, mc } = mount();
    act(() => store.setChoices(mc, ['x']));
    const before = store.getState().responses.choices[mc];
    const input = view.container.querySelector<HTMLInputElement>(`[data-block-id="${fib}"] input`);
    act(() => {
      fireEvent.change(input!, { target: { value: '8' } });
    });
    expect(store.getState().responses.choices[mc]).toBe(before);
  });

  it('typing in a table\'s second blank re-renders only the table', () => {
    const { view, table } = mount();
    const inputs = view.container.querySelectorAll<HTMLInputElement>(`[data-block-id="${table}"] input`);
    expect(inputs.length).toBeGreaterThanOrEqual(2);
    act(() => {
      fireEvent.change(inputs[1]!, { target: { value: '55' } });
    });
    expect(rerendered()).toEqual([table]);
    expect(inputs[1]!.value).toBe('55');
  });

  it('checking one section re-renders no block in the other', async () => {
    // Called on the store directly: the default grouping puts both sections
    // under one Check button. What is pinned is the container + BlockSlot memo:
    // a section's status change must not re-render the other section's blocks.
    const { store, ids } = mount(true);
    const sectionOne = new Set(ids.slice(0, 30));
    const sectionTwo = new Set(ids.slice(30));
    await act(async () => {
      await store.checkSection('sec-1', {});
    });
    const touched = rerendered();
    expect(touched.some((id) => sectionOne.has(id))).toBe(true); // not vacuous
    expect(touched.filter((id) => sectionTwo.has(id))).toEqual([]);
  });
});

// =============================================================================
// correspondence.test.tsx — the N-way match's own render contracts
// -----------------------------------------------------------------------------
// The family conformance suite already proves the checked-state contract; this
// file pins the CORRESPONDENCE-SPECIFIC properties:
//
//  1. PER-COLUMN SHUFFLE SEEDS DIFFER. The authored n-th card of every column
//     belongs to the n-th item, so two columns shuffled with the SAME seed
//     stay aligned — reading any one card's position gives away every other
//     column's answer for that item. Seeded shuffles are deterministic, so
//     this is a fixed outcome, not a flaky one: with 6 cards per column the
//     two orders differ for these ids, and reverting the seed to block.id
//     alone turns exactly this case red (mutation-proven the day it landed).
//
//  2. PER-COLUMN MARKER SEQUENCES. Column 0 letters A/B/C, column 1 romans
//     i/ii/iii — the written answer line "C · ii" must be unambiguous in
//     grayscale print.
//
//  3. A SELECT PER (item, column) CELL writing the nested response map.
// =============================================================================

import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import {
  ViewerProvider,
  createMockCheckService,
  createViewerStore,
} from '../../src/index.js';
import Correspondence from '../../src/blocks/Correspondence.js';
import { TEST_USER_ID } from '../helpers/ids.js';

const ACTIVITY = 'aaaaaaaa-0000-4000-8000-000000000001';
const VERSION = 'bbbbbbbb-0000-4000-8000-000000000001';
const BLOCK = 'cccccccc-0000-4000-8000-000000000077';

const t = (text: string) => ({ type: 'text', text, marks: [] });

function harness(ui: ReactElement) {
  const store = createViewerStore({
    userId: TEST_USER_ID,
    activityId: ACTIVITY,
    versionId: VERSION,
    checkService: createMockCheckService({}),
  });
  const utils = render(
    <ViewerProvider store={store} defaultSectionId="sec-1">
      {ui}
    </ViewerProvider>,
  );
  return { ...utils, store };
}

function sixCardBlock() {
  const card = (n: number, col: string) => ({
    id: `dddddddd-0000-4000-8000-00000000${col}00${n}`,
    content: [t(`card ${n}`)],
  });
  const cards = (col: string) => [1, 2, 3, 4, 5, 6].map((n) => card(n, col));
  const items = [1, 2, 3, 4, 5, 6].map((n) => ({
    id: `eeeeeeee-0000-4000-8000-00000000000${n}`,
    content: [t(`item ${n}`)],
  }));
  const columns = [
    { id: 'ffffffff-0000-4000-8000-000000000001', header: [t('Graph')], targets: cards('a') },
    { id: 'ffffffff-0000-4000-8000-000000000002', header: [t('Table')], targets: cards('b') },
  ];
  const key: Record<string, Record<string, string>> = {};
  items.forEach((item, i) => {
    key[item.id] = {
      [columns[0]!.id]: columns[0]!.targets[i]!.id,
      [columns[1]!.id]: columns[1]!.targets[i]!.id,
    };
  });
  return {
    id: BLOCK,
    type: 'correspondence',
    prompt: [t('match everything')],
    items,
    targetColumns: columns,
    key,
    skills: [],
  } as never;
}

describe('per-column shuffle independence (the alignment leak)', () => {
  it('two same-length columns render their banks in DIFFERENT orders', () => {
    const { container } = harness(<Correspondence block={sixCardBlock()} mode="screen" />);
    const banks = container.querySelectorAll('.viewer-correspondence__bank');
    expect(banks).toHaveLength(2);
    const orderOf = (bank: Element) =>
      Array.from(bank.querySelectorAll('[data-target-id]')).map((el) =>
        // Compare by the authored card NUMBER (the id suffix), which is the
        // per-column alignment axis; the ids themselves differ per column.
        el.getAttribute('data-target-id')!.slice(-1),
      );
    expect(orderOf(banks[0]!)).not.toEqual(orderOf(banks[1]!));
  });

  it('neither bank renders in authored order (the bank must shuffle at all)', () => {
    const { container } = harness(<Correspondence block={sixCardBlock()} mode="screen" />);
    const banks = container.querySelectorAll('.viewer-correspondence__bank');
    for (const bank of Array.from(banks)) {
      const order = Array.from(bank.querySelectorAll('[data-target-id]')).map(
        (el) => el.getAttribute('data-target-id')!.slice(-1),
      );
      expect(order).not.toEqual(['1', '2', '3', '4', '5', '6']);
    }
  });
});

describe('per-column markers', () => {
  it('column 0 marks A/B/…, column 1 marks i/ii/…', () => {
    const { container } = harness(<Correspondence block={sixCardBlock()} mode="screen" />);
    const banks = container.querySelectorAll('.viewer-correspondence__bank');
    const letters = (bank: Element) =>
      Array.from(bank.querySelectorAll('[data-letter]')).map((el) =>
        el.getAttribute('data-letter'),
      );
    expect(letters(banks[0]!)).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
    expect(letters(banks[1]!)).toEqual(['i', 'ii', 'iii', 'iv', 'v', 'vi']);
  });
});

describe('cell selects write the nested response map', () => {
  it('choosing a card records { item → { column → target } }', () => {
    const block = sixCardBlock() as {
      id: string;
      items: Array<{ id: string }>;
      targetColumns: Array<{ id: string; targets: Array<{ id: string }> }>;
    };
    const { container, store } = harness(
      <Correspondence block={block as never} mode="screen" />,
    );
    const firstItem = container.querySelector('[data-item-id]')!;
    const firstCell = firstItem.querySelector(
      '.viewer-correspondence__cell select',
    ) as HTMLSelectElement;
    const chosen = block.targetColumns[0]!.targets[3]!.id;
    fireEvent.change(firstCell, { target: { value: chosen } });
    expect(
      store.getState().responses.correspondences?.[block.id]?.[
        block.items[0]!.id
      ],
    ).toEqual({ [block.targetColumns[0]!.id]: chosen });
  });
});

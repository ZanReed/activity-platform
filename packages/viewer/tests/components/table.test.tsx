// =============================================================================
// table.test.tsx — what a table actually puts on the page (Q7, Q9)
// -----------------------------------------------------------------------------
// Two things a declaration cannot prove:
//
//   Q9  a blank inside a grid is announceable. Its accessible name has to carry
//       the row and column headers, because that is the information a sighted
//       student reads off the table and a screen-reader user otherwise cannot
//       recover — "blank 2 of 4" in a cost table tells you nothing about which
//       cost. This is why the block emits a real <table> with <th scope>.
//
//   Q7  a BLANKLESS table is a stimulus, not a question: no problem number, no
//       inputs, no check chrome. That is ruling 2A (gradability derived from
//       content) bound to rendered output rather than to isGradeable's return
//       value — the declaration-vs-declaration trap this repo has paid for.
// =============================================================================

import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import {
  ViewerProvider,
  createMockCheckService,
  createViewerStore,
} from '../../src/index.js';
import Table from '../../src/blocks/Table.js';
import type { ResolvedLabel } from '../../src/numbering/numbering.js';
import { TEST_USER_ID } from '../helpers/ids.js';

const ACTIVITY = 'aaaaaaaa-0000-4000-8000-000000000001';
const VERSION = 'bbbbbbbb-0000-4000-8000-000000000001';

function harness(ui: ReactElement) {
  const store = createViewerStore({
    userId: TEST_USER_ID,
    activityId: ACTIVITY,
    versionId: VERSION,
    checkService: createMockCheckService({}),
  });
  return render(
    <ViewerProvider store={store} defaultSectionId="sec-1">
      {ui}
    </ViewerProvider>,
  );
}

const cell = (id: string, content: unknown[]) => ({ id, content });
const t = (text: string) => ({ type: 'text', text, marks: [] });
const blank = (id: string) => ({ type: 'blank', id, answerType: 'numeric' });

/** A cost table: header row across the top, kg down the left. */
const ratesTable = (opts: { blanks: boolean; headerColumn?: boolean }) => ({
  id: 'tbl-1',
  type: 'table',
  headerRow: true,
  headerColumn: opts.headerColumn ?? true,
  showCellLabels: true,
  columnAligns: ['left', 'right'],
  rows: [
    { id: 'r0', cells: [cell('c00', [t('Kilograms')]), cell('c01', [t('Cost ($)')])] },
    {
      id: 'r1',
      cells: [
        cell('c10', [t('2')]),
        cell('c11', opts.blanks ? [blank('b1')] : [t('9.00')]),
      ],
    },
    {
      id: 'r2',
      cells: [
        cell('c20', [t('3')]),
        cell('c21', opts.blanks ? [blank('b2')] : [t('13.50')]),
      ],
    },
  ],
});

const numberLabel: ResolvedLabel = { kind: 'number', n: 4 };

describe('Q9 — a blank in a cell is announceable', () => {
  it('names each blank with its row and column headers', () => {
    const { container } = harness(
      <Table block={ratesTable({ blanks: true }) as never} label={numberLabel} mode="screen" />,
    );
    const names = Array.from(container.querySelectorAll('input')).map((i) =>
      i.getAttribute('aria-label'),
    );
    // "2" is the row header (headerColumn), "Cost ($)" the column header.
    expect(names[0]).toBe('2, Cost ($), Part a');
    expect(names[1]).toBe('3, Cost ($), Part b');
  });

  it('falls back to the sub-part letter when an axis has no header', () => {
    const { container } = harness(
      <Table
        block={ratesTable({ blanks: true, headerColumn: false }) as never}
        label={numberLabel}
        mode="screen"
      />,
    );
    const names = Array.from(container.querySelectorAll('input')).map((i) =>
      i.getAttribute('aria-label'),
    );
    expect(names[0]).toBe('Cost ($), Part a');
  });

  it('emits real header cells with scope, which is what makes the above work', () => {
    const { container } = harness(
      <Table block={ratesTable({ blanks: true }) as never} label={numberLabel} mode="screen" />,
    );
    const colHeaders = container.querySelectorAll('th[scope="col"]');
    const rowHeaders = container.querySelectorAll('th[scope="row"]');
    expect(colHeaders.length).toBe(2);
    expect(rowHeaders.length).toBe(2); // one per body row
  });

  it('shows the (a)/(b) marker but hides it from the screen reader', () => {
    const { container } = harness(
      <Table block={ratesTable({ blanks: true }) as never} label={numberLabel} mode="screen" />,
    );
    const markers = Array.from(
      container.querySelectorAll('.viewer-blank__sublabel'),
    );
    expect(markers.map((m) => m.textContent)).toEqual(['(a)', '(b)']);
    // Announced by the input's own name instead — never twice (ruling D3).
    for (const m of markers) expect(m.getAttribute('aria-hidden')).toBe('true');
  });

  it('carries the author’s column alignment onto the cells', () => {
    const { container } = harness(
      <Table block={ratesTable({ blanks: true }) as never} label={numberLabel} mode="screen" />,
    );
    const right = container.querySelectorAll('[data-align="right"]');
    expect(right.length).toBe(3); // the whole second column
  });
});

describe('Q7 — a blankless table is a stimulus, not a question', () => {
  it('renders no inputs at all', () => {
    const { container } = harness(
      <Table block={ratesTable({ blanks: false }) as never} label={undefined} mode="screen" />,
    );
    expect(container.querySelectorAll('input').length).toBe(0);
  });

  it('renders no sub-part markers and no state pills', () => {
    const { container } = harness(
      <Table block={ratesTable({ blanks: false }) as never} label={undefined} mode="screen" />,
    );
    expect(container.querySelectorAll('.viewer-blank__sublabel').length).toBe(0);
    expect(container.querySelectorAll('.viewer-state-pill').length).toBe(0);
  });

  it('still renders the data — it is a table to READ', () => {
    const { container } = harness(
      <Table block={ratesTable({ blanks: false }) as never} label={undefined} mode="screen" />,
    );
    expect(container.textContent).toContain('9.00');
    expect(container.querySelectorAll('tr').length).toBe(3);
  });
});

describe('a single-blank table does not letter its one gap', () => {
  it('omits the marker when there is nothing to tell apart', () => {
    const oneBlank = {
      ...ratesTable({ blanks: true }),
      rows: [
        { id: 'r0', cells: [cell('c00', [t('Kilograms')])] },
        { id: 'r1', cells: [cell('c10', [blank('b1')])] },
      ],
    };
    const { container } = harness(
      <Table block={oneBlank as never} label={numberLabel} mode="screen" />,
    );
    expect(container.querySelectorAll('.viewer-blank__sublabel').length).toBe(0);
    expect(
      container.querySelector('input')!.getAttribute('aria-label'),
    ).toBe('Kilograms, Blank');
  });
});

// =============================================================================
// blank-size.test.tsx — how wide a blank's input renders (blankSize.ts)
// -----------------------------------------------------------------------------
// The author's finding (2026-10-04): an unsized blank in a third-width column
// took a line of its own, because the browser default is 20 characters. Option
// 2 (ruled 2026-10-05) made an unsized NUMERIC blank 8 characters, which still
// wrapped in a third-width column; the author then chose option 1: it starts at
// 4 characters and GROWS with what the student types (cap 20). Bound to the rendered `size` attribute of BOTH places a blank input
// is rendered — prose (FillInBlank) and a table cell (Table) — because the
// rule lives in one helper and a call site that bypasses it is the failure.
// =============================================================================

import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import {
  ViewerProvider,
  createMockCheckService,
  createViewerStore,
} from '../../src/index.js';
import FillInBlank from '../../src/blocks/FillInBlank.js';
import Table from '../../src/blocks/Table.js';
import type { ResolvedLabel } from '../../src/numbering/numbering.js';
import { TEST_USER_ID } from '../helpers/ids.js';

const ACTIVITY = 'aaaaaaaa-0000-4000-8000-000000000001';
const VERSION = 'bbbbbbbb-0000-4000-8000-000000000001';
const LABEL: ResolvedLabel = { kind: 'number', n: 1 };

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

type ServedBlank = { answerType?: 'text' | 'numeric' | 'math'; width?: number };

/** A SERVED blank: answer-key fields already stripped, answerType kept. */
const blank = (id: string, extra: ServedBlank) => ({ type: 'blank', id, ...extra });

const prose = (...blanks: ServedBlank[]) => ({
  id: 'blk-1',
  type: 'fill_in_blank',
  content: [
    { type: 'text', text: 'The scale factor is ', marks: [] },
    ...blanks.map((b, i) => blank(`b${i}`, b)),
  ],
});

const sizes = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('input.viewer-blank__input')).map((el) =>
    el.getAttribute('size'),
  );

describe('blank input size', () => {
  it('an unsized numeric blank starts at 4 characters on screen; text and math keep the browser default', () => {
    const { container } = harness(
      <FillInBlank
        block={prose({ answerType: 'numeric' }, { answerType: 'text' }, { answerType: 'math' }, {}) as never}
        mode="screen"
        label={LABEL}
      />,
    );
    expect(sizes(container)).toEqual(['4', null, null, null]);
  });

  it('grows with what the student types, one character of room past the value, capped at 20', () => {
    const { container } = harness(
      <FillInBlank block={prose({ answerType: 'numeric' }) as never} mode="screen" label={LABEL} />,
    );
    const input = container.querySelector('input.viewer-blank__input')!;
    fireEvent.change(input, { target: { value: '12' } });
    expect(sizes(container)).toEqual(['4']);
    fireEvent.change(input, { target: { value: '60 km/h' } });
    expect(sizes(container)).toEqual(['8']);
    fireEvent.change(input, { target: { value: '1'.repeat(40) } });
    expect(sizes(container)).toEqual(['20']);
    fireEvent.change(input, { target: { value: '' } });
    expect(sizes(container)).toEqual(['4']);
  });

  it('an authored width always wins', () => {
    const { container } = harness(
      <FillInBlank
        block={prose({ answerType: 'numeric', width: 3 }, { answerType: 'text', width: 12 }) as never}
        mode="screen"
        label={LABEL}
      />,
    );
    expect(sizes(container)).toEqual(['3', '12']);
  });

  it('print is unchanged: no default size on paper', () => {
    const { container } = harness(
      <FillInBlank block={prose({ answerType: 'numeric' }) as never} mode="print" label={LABEL} />,
    );
    expect(sizes(container)).toEqual([null]);
  });

  it('a numeric blank in a table cell follows the same rule', () => {
    const table = {
      id: 'tbl-1',
      type: 'table',
      headerRow: true,
      rows: [
        {
          id: 'r0',
          cells: [
            { id: 'c00', content: [{ type: 'text', text: 'Kilograms', marks: [] }] },
            { id: 'c01', content: [{ type: 'text', text: 'Cost', marks: [] }] },
          ],
        },
        {
          id: 'r1',
          cells: [
            { id: 'c10', content: [blank('t0', { answerType: 'numeric' })] },
            { id: 'c11', content: [blank('t1', { answerType: 'text' })] },
          ],
        },
      ],
    };
    const { container } = harness(<Table block={table as never} label={LABEL} mode="screen" />);
    expect(sizes(container)).toEqual(['4', null]);
    fireEvent.change(container.querySelector('input.viewer-blank__input')!, {
      target: { value: '22.50' },
    });
    expect(sizes(container)).toEqual(['6', null]);
  });
});

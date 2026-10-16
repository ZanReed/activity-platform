// =============================================================================
// superscript-tray.test.tsx — the ² ³ keys on a blank, bound to rendered output
// -----------------------------------------------------------------------------
// docs/design/superscript-units.md. What this pins:
//   * every EDITABLE blank gets the tray on focus, numeric AND text (SU-3, D6),
//     in a sentence AND in a table cell (D2: one BlankInput, both surfaces);
//   * read-only blanks (print, answer key) never do;
//   * a pointer press keeps focus in the input and inserts at the live caret
//     (DR-2); a key reached by Tab inserts at the remembered caret and hands
//     focus back (D3); a selection is replaced;
//   * the screen-reader note (DR-5);
//   * the placement rule (DR-1, D5, DR-6) through the pure chooser, because
//     jsdom has no layout (real layout is the student e2e lane's job).
// =============================================================================

import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ViewerProvider, createMockCheckService, createViewerStore } from '../../src/index.js';
import FillInBlank from '../../src/blocks/FillInBlank.js';
import Table from '../../src/blocks/Table.js';
import { loadSuperscriptTray } from '../../src/blocks/BlankInput.js';
import { chooseTrayPlacement, dockLayout } from '../../src/blocks/SuperscriptTray.js';
import { TEST_USER_ID } from '../helpers/ids.js';

const ACTIVITY = 'aaaaaaaa-0000-4000-8000-000000000002';
const VERSION = 'bbbbbbbb-0000-4000-8000-000000000002';

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

const t = (text: string) => ({ type: 'text', text, marks: [] });
const sentence = (answerType?: 'numeric') => ({
  id: 'fib-1',
  type: 'fill_in_blank',
  content: [
    t('The area is '),
    { type: 'blank', id: 'b1', ...(answerType ? { answerType } : {}) },
    t(' and the side is '),
    { type: 'blank', id: 'b2', answerType: 'numeric' },
  ],
});
const table = () => ({
  id: 'tbl-1',
  type: 'table',
  headerRow: true,
  headerColumn: false,
  rows: [
    { id: 'r0', cells: [{ id: 'c0', content: [t('Area')] }] },
    { id: 'r1', cells: [{ id: 'c1', content: [{ type: 'blank', id: 'tb1', answerType: 'numeric' }] }] },
  ],
});

async function focusBlank(name: string) {
  const input = screen.getByRole('textbox', { name }) as HTMLInputElement;
  await act(async () => {
    input.focus();
    await loadSuperscriptTray();
  });
  return input;
}

const keys = () => screen.queryAllByRole('button', { name: /Insert (squared|cubed)/ });

describe('which blanks get the tray', () => {
  it('a numeric blank in a sentence: none until focus, two named keys on focus', async () => {
    harness(<FillInBlank block={sentence('numeric') as never} mode="screen" />);
    expect(keys()).toHaveLength(0);
    await focusBlank('Blank 1 of 2');
    expect(keys().map((k) => k.getAttribute('aria-label'))).toEqual(['Insert squared', 'Insert cubed']);
    // The face is decoration; the button carries the name (DR-3). It draws
    // the exponent as a full-size digit, not the tiny ² glyph.
    const face = keys()[0]!.querySelector('[aria-hidden="true"]');
    expect(face?.querySelector('.viewer-blank__tray-exp')?.textContent).toBe('2');
    expect(face?.textContent).not.toContain('²');
  });

  it('a TEXT blank gets it too (D6)', async () => {
    harness(<FillInBlank block={sentence() as never} mode="screen" />);
    await focusBlank('Blank 1 of 2');
    expect(keys()).toHaveLength(2);
  });

  it('a blank in a TABLE cell gets it (D2: one BlankInput, both surfaces)', async () => {
    harness(<Table block={table() as never} mode="screen" />);
    const input = screen.getByRole('textbox');
    await act(async () => {
      input.focus();
      await loadSuperscriptTray();
    });
    expect(keys()).toHaveLength(2);
  });

  it('print never gets it, and carries no screen-reader note', async () => {
    harness(<FillInBlank block={sentence('numeric') as never} mode="print" />);
    const input = screen.getByRole('textbox', { name: 'Blank 1 of 2' });
    await act(async () => {
      input.focus();
      await loadSuperscriptTray();
    });
    expect(keys()).toHaveLength(0);
    expect(input.getAttribute('aria-describedby')).toBeNull();
  });

  it('an editable blank is described: the keys exist (DR-5)', () => {
    harness(<FillInBlank block={sentence('numeric') as never} mode="screen" />);
    const input = screen.getByRole('textbox', { name: 'Blank 1 of 2' });
    const hint = document.getElementById(input.getAttribute('aria-describedby')!);
    expect(hint?.textContent).toBe('Squared and cubed keys follow.');
  });
});

describe('inserting', () => {
  it('a pointer press keeps focus in the input and inserts at the live caret (DR-2)', async () => {
    harness(<FillInBlank block={sentence('numeric') as never} mode="screen" />);
    const input = await focusBlank('Blank 1 of 2');
    fireEvent.change(input, { target: { value: '28 m' } });
    input.setSelectionRange(4, 4);
    const squared = keys()[0]!;
    const down = fireEvent.pointerDown(squared);
    expect(down).toBe(false); // default prevented: focus never moves
    fireEvent.click(squared);
    expect(input.value).toBe('28 m²');
    expect(document.activeElement).toBe(input);
    expect(input.selectionStart).toBe(5);
  });

  it('replaces a selection', async () => {
    harness(<FillInBlank block={sentence('numeric') as never} mode="screen" />);
    const input = await focusBlank('Blank 1 of 2');
    fireEvent.change(input, { target: { value: '28 m2' } });
    input.setSelectionRange(4, 5);
    fireEvent.click(keys()[0]!);
    expect(input.value).toBe('28 m²');
  });

  it('a key reached by Tab inserts at the remembered caret and hands focus back (D3)', async () => {
    harness(<FillInBlank block={sentence('numeric') as never} mode="screen" />);
    const input = await focusBlank('Blank 1 of 2');
    fireEvent.change(input, { target: { value: '125 cm' } });
    input.setSelectionRange(6, 6);
    fireEvent.select(input);
    const cubed = keys()[1]!;
    act(() => cubed.focus()); // Tab: focus moves INTO the tray, which stays
    expect(keys()).toHaveLength(2);
    fireEvent.click(cubed);
    expect(input.value).toBe('125 cm³');
    expect(document.activeElement).toBe(input);
  });

  it('focus leaving the blank closes the tray', async () => {
    harness(<FillInBlank block={sentence('numeric') as never} mode="screen" />);
    await focusBlank('Blank 1 of 2');
    expect(keys()).toHaveLength(2);
    act(() => (document.activeElement as HTMLElement).blur());
    expect(keys()).toHaveLength(0);
  });
});

describe('placement (DR-1 beside → below → above; D5 clip; DR-6 never on a blank)', () => {
  const input = { left: 100, top: 100, right: 160, bottom: 124 };
  const tray = { width: 100, height: 52 };
  const roomy = { left: 0, top: 0, right: 800, bottom: 600 };

  it('beside when the line has room', () => {
    expect(chooseTrayPlacement(input, tray, roomy, [])).toEqual({ placement: 'beside', shiftX: 0 });
  });

  it('below when the clip box ends to the right (e.g. a table cell edge)', () => {
    const clip = { ...roomy, right: 220 };
    expect(chooseTrayPlacement(input, tray, clip, []).placement).toBe('below');
  });

  it('above when there is no room right or below (last table row, phone keyboard)', () => {
    const clip = { left: 0, top: 0, right: 220, bottom: 140 };
    expect(chooseTrayPlacement(input, tray, clip, []).placement).toBe('above');
  });

  it('skips beside when it would cover another blank, e.g. "(x, y)" (DR-6)', () => {
    const yBlank = { left: 175, top: 100, right: 235, bottom: 124 };
    expect(chooseTrayPlacement(input, tray, roomy, [yBlank]).placement).toBe('below');
  });

  it('skips below too when a stacked blank sits there', () => {
    const right = { left: 175, top: 100, right: 235, bottom: 124 };
    const under = { left: 100, top: 130, right: 160, bottom: 154 };
    expect(chooseTrayPlacement(input, tray, roomy, [right, under]).placement).toBe('above');
  });

  it('slides a below tray left to stay inside the clip box', () => {
    const wide = { left: 300, top: 100, right: 360, bottom: 124 };
    const clip = { left: 0, top: 0, right: 370, bottom: 600 };
    expect(chooseTrayPlacement(wide, tray, clip, [])).toEqual({ placement: 'below', shiftX: -30 });
  });

  it('beside starts after the verdict mark when one is on the line', () => {
    // besideFrom = the ✗ pill's right edge (220), not the input's (160).
    const room = { ...roomy, right: 330 };
    expect(chooseTrayPlacement(input, tray, room, [], 220).placement).toBe('beside');
    // …and if the pill pushes it past the clip box, it falls back instead of covering the pill.
    expect(chooseTrayPlacement(input, tray, room, [], 240).placement).toBe('below');
  });

  it('falls back to below when nothing is clear', () => {
    const tight = { left: 95, top: 95, right: 170, bottom: 130 };
    expect(chooseTrayPlacement(input, tray, tight, []).placement).toBe('below');
  });
});

describe('phone dock (≤ 480 px): bottom of the visible screen, never on the lines', () => {
  const base = { innerHeight: 800, trayHeight: 52 };

  it('sits on the visual viewport bottom (the keyboard top when it is open)', () => {
    expect(dockLayout({ ...base, visibleBottom: 800, barTop: null, inputBottom: 300 })).toEqual({ bottom: 6, scrollBy: 0 });
    expect(dockLayout({ ...base, visibleBottom: 450, barTop: null, inputBottom: 300 })).toEqual({ bottom: 356, scrollBy: 0 });
  });

  it('sits above a sticky Check bar showing at the bottom', () => {
    expect(dockLayout({ ...base, visibleBottom: 800, barTop: 740, inputBottom: 300 }).bottom).toBe(66);
  });

  it('scrolls just enough when the blank would be hidden behind it', () => {
    // floor 450, tray top 450-6-52 = 392; input bottom 420 needs 420+6-392 = 34.
    expect(dockLayout({ ...base, visibleBottom: 450, barTop: null, inputBottom: 420 }).scrollBy).toBe(34);
  });
});

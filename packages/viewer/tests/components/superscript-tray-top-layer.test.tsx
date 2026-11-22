// =============================================================================
// superscript-tray-top-layer.test.tsx — the tray in the TOP LAYER (2026-11-23)
// -----------------------------------------------------------------------------
// jsdom has no Popover API, so this file installs one BEFORE the tray module
// loads (TOP_LAYER is read once, at import). What it pins, bound to rendered
// output: with the API the tray is a manual popover, shown on open, placed
// with fixed viewport coordinates from its measured box, and NOT clipped by a
// table's scroll box (the author's screenshot: a one-row table's last column).
// Real layout is the student e2e lane's job (blank-superscript.e2e.ts).
// =============================================================================

import { afterAll, describe, expect, it, vi } from 'vitest';

const shown = vi.hoisted(() => {
  const calls: Element[] = [];
  (HTMLElement.prototype as unknown as { showPopover: () => void }).showPopover = function (this: HTMLElement) {
    calls.push(this);
  };
  return calls;
});

import { act, render, screen } from '@testing-library/react';
import { ViewerProvider, createMockCheckService, createViewerStore } from '../../src/index.js';
import Table from '../../src/blocks/Table.js';
import { loadSuperscriptTray } from '../../src/blocks/BlankInput.js';
import { TOP_LAYER } from '../../src/blocks/SuperscriptTray.js';
import { TEST_USER_ID } from '../helpers/ids.js';

afterAll(() => {
  delete (HTMLElement.prototype as unknown as { showPopover?: unknown }).showPopover;
});

const t = (text: string) => ({ type: 'text', text, marks: [] });
// One row, blank in the LAST column: no room beside, above or below inside
// the table's scroll box.
const table = {
  id: 'tbl-1',
  type: 'table',
  headerRow: false,
  headerColumn: true,
  rows: [
    {
      id: 'r0',
      cells: [
        { id: 'c0', content: [t('y')] },
        { id: 'c1', content: [t('5')] },
        { id: 'c2', content: [{ type: 'blank', id: 'tb1', answerType: 'numeric' }] },
      ],
    },
  ],
};

const rect = (left: number, top: number, width: number, height: number) =>
  ({ left, top, right: left + width, bottom: top + height, width, height, x: left, y: top, toJSON: () => ({}) }) as DOMRect;

describe('the tray in the top layer', () => {
  it('is a manual popover, shown on open, placed below the blank outside the table box', async () => {
    expect(TOP_LAYER).toBe(true);
    const store = createViewerStore({ userId: TEST_USER_ID, activityId: 'a', versionId: 'v', checkService: createMockCheckService({}) });
    render(
      <ViewerProvider store={store} defaultSectionId="sec-1">
        <Table block={table as never} mode="screen" />
      </ViewerProvider>,
    );
    // The table's scroll box hugs the one row (top 100 → 150, right edge 700);
    // the blank sits at its right edge; the screen is 1000 × 800.
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1000);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(800);
    const original = Element.prototype.getBoundingClientRect;
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
      if (this.classList.contains('viewer-blank__tray')) return rect(0, 0, 100, 52);
      if (this.classList.contains('viewer-blank__input')) return rect(600, 112, 90, 26);
      if (this.classList.contains('viewer-blank__field')) return rect(600, 112, 90, 26);
      if (this.classList.contains('viewer-table')) return rect(100, 100, 600, 50);
      // Every other ancestor is the page: the whole screen.
      void original;
      return rect(0, 0, 1000, 800);
    });
    vi.spyOn(window, 'getComputedStyle').mockImplementation(
      () => ({ overflowX: 'auto', overflowY: 'auto' }) as CSSStyleDeclaration,
    );

    const input = screen.getByRole('textbox');
    await act(async () => {
      input.focus();
      await loadSuperscriptTray();
    });
    const tray = document.querySelector<HTMLElement>('.viewer-blank__tray')!;
    expect(tray.getAttribute('popover')).toBe('manual');
    expect(shown).toContain(tray);
    // Beside would cross the screen? No: 696 + 100 < 1000, so beside fits the
    // SCREEN — the table's box (right 700) no longer clips it.
    expect(tray.getAttribute('data-placement')).toBe('beside');
    expect(tray.style.left).toBe('696px');
    expect(tray.style.top).toBe('99px');
    // Still in the blank's own field in the DOM: Tab order is unchanged (D3).
    expect(input.closest('.viewer-blank__field')?.contains(tray)).toBe(true);
    expect(tray.style.visibility).toBe('');

    // A sticky bar now covers the blank: the tray must not hang there alone.
    const bar = document.createElement('div');
    document.body.append(bar);
    (document as unknown as { elementFromPoint: () => Element }).elementFromPoint = () => bar;
    await act(async () => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(tray.style.visibility).toBe('hidden');
    // Uncovered again: it comes back.
    (document as unknown as { elementFromPoint: () => Element }).elementFromPoint = () => input;
    await act(async () => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(tray.style.visibility).toBe('');
    delete (document as unknown as { elementFromPoint?: unknown }).elementFromPoint;
    vi.restoreAllMocks();
  });
});

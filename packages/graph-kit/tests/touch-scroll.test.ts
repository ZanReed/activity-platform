// @vitest-environment jsdom
// =============================================================================
// touch-scroll.test.ts — which touches a board claims (review A7)
// -----------------------------------------------------------------------------
// The rule itself, with a stand-in for the board: real fingers on real boards
// are app/e2e/touch/canvas-touch.e2e.ts, in Chromium and WebKit.
// =============================================================================

import { describe, expect, it } from 'vitest';
import {
  BOARD_TOUCH_ACTION,
  isCancelledPointer,
  sharePageScroll,
  type DragModeBoard,
} from '../src/touch-scroll.js';

const DRAG = 1;
const board = (mode = 0): DragModeBoard => ({ mode, BOARD_MODE_DRAG: DRAG });

/** A cancelable touchstart; returns whether the page claimed it. */
function touchStart(el: HTMLElement): boolean {
  return !el.dispatchEvent(new Event('touchstart', { bubbles: true, cancelable: true }));
}

describe('sharePageScroll', () => {
  it('lets the page scroll from a touch on the board', () => {
    const el = document.createElement('div');
    el.style.touchAction = 'none'; // what JSXGraph writes at init
    sharePageScroll(el, board());
    expect(el.style.touchAction).toBe(BOARD_TOUCH_ACTION);
    expect(BOARD_TOUCH_ACTION).not.toBe('none');
  });

  it("puts it back after each pointerdown, when JSXGraph has written 'none' again", () => {
    const el = document.createElement('div');
    // JSXGraph's own listener, registered first, as at init.
    el.addEventListener('pointerdown', () => {
      el.style.touchAction = 'none';
    });
    sharePageScroll(el, board());
    el.dispatchEvent(new Event('pointerdown'));
    expect(el.style.touchAction).toBe(BOARD_TOUCH_ACTION);
  });

  it('claims a touch only while the board is dragging something', () => {
    const el = document.createElement('div');
    const b = board(0);
    sharePageScroll(el, b);
    expect(touchStart(el), 'a touch on empty space is the page\'s').toBe(false);
    b.mode = DRAG;
    expect(touchStart(el), 'a touch that caught a handle is the board\'s').toBe(true);
    b.mode = 0;
    expect(touchStart(el)).toBe(false);
  });

  it('stops when told to', () => {
    const el = document.createElement('div');
    const b = board(DRAG);
    const stop = sharePageScroll(el, b);
    stop();
    expect(touchStart(el)).toBe(false);
    el.style.touchAction = 'none';
    el.dispatchEvent(new Event('pointerdown'));
    expect(el.style.touchAction).toBe('none');
  });
});

describe('isCancelledPointer', () => {
  it('is true for a cancel and false for a lift', () => {
    expect(isCancelledPointer(new Event('pointercancel'))).toBe(true);
    expect(isCancelledPointer(new Event('touchcancel'))).toBe(true);
    expect(isCancelledPointer(new Event('pointerup'))).toBe(false);
    expect(isCancelledPointer(new Event('touchend'))).toBe(false);
  });
});

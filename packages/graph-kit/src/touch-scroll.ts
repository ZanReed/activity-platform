// =============================================================================
// touch-scroll.ts — a finger on a board can still scroll the page (review A7)
// -----------------------------------------------------------------------------
// JSXGraph writes `touch-action: none` on its container when a board is made
// and again on every pointerdown. `none` tells the browser that no touch that
// starts on the board may scroll, anywhere on it, so on an iPad or a
// touchscreen Chromebook a board is a patch of the page a finger cannot scroll
// past. A graph fills most of a tablet's screen; a worksheet with two of them
// was a place a student could get stuck (measured 2026-11-28: a 150px finger
// drag over a graph or number line moved the page by 0px).
//
// JSXGraph's own answer is `browserPan`, and it does not fit: it decides
// touch-action for the NEXT touch from where the LAST one landed (a browser
// reads touch-action before any handler runs), so the first drag of a handle
// after a scroll is taken by the page, and the first scroll after a drag does
// nothing. Its documentation calls this "double tap".
//
// What this does instead, with nothing to remember between touches:
//
//   1. The board's touch-action is `manipulation`: the page may scroll and
//      pinch-zoom from a touch that starts on it. Re-applied after each
//      pointerdown, because JSXGraph has just written `none` again. (A value
//      changed during a touch does not affect that touch.)
//   2. A touch that lands on something JSXGraph is now DRAGGING is claimed for
//      the board by cancelling its `touchstart`. That is the long-standing way
//      a page tells a browser not to scroll for one touch; both Chromium and
//      WebKit send `pointerdown` first, so by `touchstart` JSXGraph has done
//      its own hit test (with its own, generous, finger-sized precision) and
//      `board.mode` says whether a handle was caught.
//
// So: finger on a handle, the handle moves and the page stays; finger anywhere
// else on the board, the page scrolls. A locked board's handles are `fixed`,
// JSXGraph never starts a drag on them, and the whole board scrolls the page.
// (In the viewer a frozen canvas also has `pointer-events: none`,
// packages/viewer/src/styles/viewer.css, which is what the browser rows
// actually exercise.)
//
// A leaf module on purpose: no JSXGraph import, so both board files can use it
// and it can be tested without a board.
// =============================================================================

/** The two fields of a JSXGraph board this reads. */
export interface DragModeBoard {
  /** The board's current interaction mode. */
  mode: number;
  /** The value `mode` holds while an element is being dragged. */
  BOARD_MODE_DRAG: number;
}

/** What the page may do with a touch that starts on a board. */
export const BOARD_TOUCH_ACTION = 'manipulation';

/**
 * Let touches that miss every handle scroll the page. Call it AFTER
 * `JSXGraph.initBoard`: its pointerdown listener must run after JSXGraph's.
 * Returns the function that removes the listeners.
 */
export function sharePageScroll(container: HTMLElement, board: DragModeBoard): () => void {
  const allowScroll = (): void => {
    container.style.touchAction = BOARD_TOUCH_ACTION;
  };
  const claimIfDragging = (event: Event): void => {
    if (board.mode === board.BOARD_MODE_DRAG && event.cancelable) event.preventDefault();
  };
  allowScroll();
  container.addEventListener('pointerdown', allowScroll);
  // `passive: false` is required: a passive listener may not cancel.
  container.addEventListener('touchstart', claimIfDragging, { passive: false });
  return () => {
    container.removeEventListener('pointerdown', allowScroll);
    container.removeEventListener('touchstart', claimIfDragging);
  };
}

/** A pointer the browser took away (it began scrolling, or the system
 *  interrupted). JSXGraph reports it to `up` handlers like a lifted finger;
 *  it is never a tap. */
export function isCancelledPointer(event: Event): boolean {
  return event.type === 'pointercancel' || event.type === 'touchcancel';
}

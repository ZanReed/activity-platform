// =============================================================================
// e2e/helpers/finger.ts — one finger, for the touch lane
// -----------------------------------------------------------------------------
// `fingerDrag` puts a finger down, moves it and lifts it. HOW depends on the
// engine, and the difference decides what a row is allowed to claim:
//
//   Chromium  the touch goes in through the DevTools protocol
//             (Input.dispatchTouchEvent), below the page. The browser's own
//             gesture recogniser sees it, so `touch-action` is honoured, the
//             page really scrolls, and a scroll really sends `pointercancel`.
//             A row may claim what a finger does.
//
//   WebKit    Playwright has no such channel (its touchscreen can only tap).
//             The finger is the events a touch produces, dispatched in the
//             page in the order iPadOS sends them: pointerdown, touchstart,
//             then moves, then pointerup, touchend. The page's handlers run
//             for real, in the iPad's engine; the browser's scrolling does
//             not. A row may claim what the BOARD did with the touch, and
//             whether it cancelled it, and nothing about scrolling.
//
// `realGestures` tells a spec which of the two it is running under.
// =============================================================================

import type { Page } from '@playwright/test';

export interface Point {
  x: number;
  y: number;
}

export interface FingerResult {
  /** Whether the page called preventDefault on the touchstart: a cancelled
   *  touchstart is how a page tells the browser "this touch is mine, do not
   *  scroll". Read by a listener the helper adds for the length of the drag. */
  touchStartCancelled: boolean;
}

export function realGestures(page: Page): boolean {
  return page.context().browser()?.browserType().name() === 'chromium';
}

/** Record whether the next touchstart ends up cancelled. Runs last (window,
 *  bubble phase), so every handler on the way has had its say. */
async function watchTouchStart(page: Page): Promise<void> {
  await page.evaluate(() => {
    const w = window as unknown as { __touchStartCancelled?: boolean | null };
    w.__touchStartCancelled = null;
    window.addEventListener(
      'touchstart',
      (e) => {
        w.__touchStartCancelled = e.defaultPrevented;
      },
      { once: true, passive: true },
    );
  });
}

/** Throws when no touchstart reached the window at all: a row must not pass
 *  "not cancelled" because the event never fired. */
async function readTouchStart(page: Page): Promise<boolean> {
  const seen = await page.evaluate(
    () => (window as unknown as { __touchStartCancelled?: boolean | null }).__touchStartCancelled ?? null,
  );
  if (seen === null) throw new Error('fingerDrag: no touchstart reached the window during the drag');
  return seen;
}

/** One finger from `from` to `to` (viewport pixels), in `steps` moves. */
export async function fingerDrag(
  page: Page,
  from: Point,
  to: Point,
  steps = 10,
): Promise<FingerResult> {
  await watchTouchStart(page);
  const at = (i: number): Point => ({
    x: from.x + ((to.x - from.x) * i) / steps,
    y: from.y + ((to.y - from.y) * i) / steps,
  });

  if (realGestures(page)) {
    const cdp = await page.context().newCDPSession(page);
    const touch = (p: Point) => [{ x: Math.round(p.x), y: Math.round(p.y), id: 1 }];
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: touch(from) });
    for (let i = 1; i <= steps; i += 1) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: touch(at(i)) });
      // A real finger takes time; without it the recogniser sees a teleport.
      await page.waitForTimeout(16);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await cdp.detach();
  } else {
    await page.evaluate(
      async ({ points }) => {
        // A finger's moves arrive a frame apart. JSXGraph drops moves that
        // come faster than its frame rate, so a burst would test nothing.
        const frame = (): Promise<void> => new Promise((done) => setTimeout(done, 20));
        const first = points[0]!;
        const target = document.elementFromPoint(first.x, first.y) ?? document.body;
        const pointer = (type: string, p: { x: number; y: number }, buttons: number): void => {
          target.dispatchEvent(
            new PointerEvent(type, {
              bubbles: true,
              cancelable: true,
              composed: true,
              pointerId: 7,
              pointerType: 'touch',
              isPrimary: true,
              clientX: p.x,
              clientY: p.y,
              screenX: p.x,
              screenY: p.y,
              button: type === 'pointermove' ? -1 : 0,
              buttons,
              width: 30,
              height: 30,
              pressure: buttons ? 0.5 : 0,
            }),
          );
        };
        // WebKit has no `Touch` constructor, so the touch events are plain
        // cancelable events carrying the touch lists. That is all a page's
        // handlers can read from one, and cancelling it is what is asserted.
        const touchEvent = (type: string, p: { x: number; y: number }): void => {
          const t = { identifier: 7, target, clientX: p.x, clientY: p.y, pageX: p.x + window.scrollX, pageY: p.y + window.scrollY };
          const live = type === 'touchend' ? [] : [t];
          const event = new Event(type, { bubbles: true, cancelable: true, composed: true });
          Object.defineProperties(event, {
            touches: { value: live },
            targetTouches: { value: live },
            changedTouches: { value: [t] },
          });
          target.dispatchEvent(event);
        };
        pointer('pointerdown', first, 1);
        touchEvent('touchstart', first);
        for (const p of points.slice(1)) {
          await frame();
          pointer('pointermove', p, 1);
          touchEvent('touchmove', p);
        }
        await frame();
        const last = points[points.length - 1]!;
        pointer('pointerup', last, 0);
        touchEvent('touchend', last);
      },
      { points: Array.from({ length: steps + 1 }, (_, i) => at(i)) },
    );
  }
  return { touchStartCancelled: await readTouchStart(page) };
}

/**
 * A finger that lands and is then taken away by the browser, without moving:
 * `pointerdown`, then `pointercancel` at the same place. That is how a touch
 * ends when the browser starts a scroll (or the system interrupts) before the
 * finger has travelled. Dispatched in the page in BOTH engines: what a cancel
 * carries for coordinates differs between browsers, and the point of the row
 * that uses this is that the answer must not depend on it.
 */
export async function fingerCancelled(page: Page, at: Point): Promise<void> {
  await page.evaluate((p) => {
    const target = document.elementFromPoint(p.x, p.y) ?? document.body;
    for (const type of ['pointerdown', 'pointercancel']) {
      target.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          cancelable: true,
          composed: true,
          pointerId: 9,
          pointerType: 'touch',
          isPrimary: true,
          clientX: p.x,
          clientY: p.y,
          screenX: p.x,
          screenY: p.y,
          button: 0,
          buttons: type === 'pointerdown' ? 1 : 0,
        }),
      );
    }
  }, at);
}

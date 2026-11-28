// =============================================================================
// touch/canvas-touch.e2e.ts — fingers on REAL boards (review C4 + A7)
// -----------------------------------------------------------------------------
// Students work on iPads and touchscreen Chromebooks. Until 2026-11-28 every
// browser test here used a mouse on Desktop Chrome, and a finger found two
// things a mouse cannot:
//
//   A7  a finger on a graph or a number line could not scroll the page. The
//       board told the browser to leave every touch to it (JSXGraph's
//       `touch-action: none`), so a board was a patch of worksheet a student
//       could not scroll past. Fixed in graph-kit/src/touch-scroll.ts.
//   and a locked section's boards must not take a finger either (review A3).
//
// THE SAME ROWS RUN IN TWO ENGINES, and each row says what it may claim in
// each (helpers/finger.ts has the reason):
//   touch-chromium  real gestures: the page really scrolls, or really doesn't.
//   touch-webkit    the iPad's engine with dispatched touches: what the board
//                   did with the touch, and whether it claimed it. Whether
//                   iPadOS then scrolls is the author's hand check.
// =============================================================================

import { expect, test, type Locator, type Page } from '@playwright/test';
import {
  boardOf,
  canvasDocument,
  checkSection,
  drawnHandles,
  drawnPlot,
  openCanvasActivity,
  pressedPills,
  sentGraphWork,
} from '../helpers/canvasBoards';
import { fingerCancelled, fingerDrag, realGestures, type Point } from '../helpers/finger';
// P2: the value the board must carry is the kit's own constant.
import { BOARD_TOUCH_ACTION } from '../../../graph-kit/src/touch-scroll';

const scrollY = (page: Page): Promise<number> => page.evaluate(() => Math.round(window.scrollY));

/** Put a board's middle at the middle of the screen, so a finger has room to
 *  travel either way and the page has room to scroll either way. */
async function centre(page: Page, board: Locator): Promise<void> {
  await settle(page);
  await board.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await settle(page);
}

/** Wait until the page has stopped moving. A real finger's scroll coasts on
 *  after the finger lifts, and a position read mid-coast is already stale. */
async function settle(page: Page): Promise<void> {
  let last = -1;
  await expect
    .poll(
      async () => {
        const now = await scrollY(page);
        const still = now === last;
        last = now;
        return still;
      },
      { intervals: [120] },
    )
    .toBe(true);
}

/** The first drawn handle's centre, in viewport pixels. */
async function handleCentre(board: Locator): Promise<Point> {
  return board.evaluate((el) => {
    const visible = Array.from(el.querySelectorAll('svg ellipse')).find((n) => {
      const cs = getComputedStyle(n);
      return cs.display !== 'none' && cs.visibility !== 'hidden';
    });
    if (!visible) throw new Error('the board has drawn no handle');
    const r = visible.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
}

/** A point on the board that is on screen and well clear of every handle:
 *  a quarter of the way in from the board's left edge, at the screen's middle
 *  (or the board's own middle, when it is shorter than the screen). */
async function emptySpot(page: Page, board: Locator, clearOf: Point): Promise<Point> {
  const box = await board.boundingBox();
  const viewport = page.viewportSize();
  if (!box || !viewport) throw new Error('no board box or viewport');
  const top = Math.max(box.y, 0);
  const bottom = Math.min(box.y + box.height, viewport.height);
  const spot = { x: box.x + box.width * 0.25, y: top + (bottom - top) * 0.75 };
  expect(Math.hypot(spot.x - clearOf.x, spot.y - clearOf.y), 'the spot is clear of the handle').toBeGreaterThan(80);
  return spot;
}

const LONG_PAGE = [
  { type: 'interactive_graph', interaction: 'plot_point' },
  { type: 'number_line', interaction: 'plot_point' },
  { type: 'interactive_graph', interaction: 'graph_inequality' },
  { type: 'data_plot', interaction: 'build_dotplot' },
  { type: 'data_plot', interaction: 'build_histogram' },
] as const;

test.describe('a finger on a graph', () => {
  test('on empty board space it scrolls the page, and moves nothing on the board', async ({ page }) => {
    const { document, ids } = canvasDocument([...LONG_PAGE]);
    const graphId = ids[0] as string;
    await openCanvasActivity(page, document);
    const board = await boardOf(page, graphId);
    await centre(page, board);
    const handles = await drawnHandles(board);
    const from = await emptySpot(page, board, await handleCentre(board));
    const startY = await scrollY(page);

    const finger = await fingerDrag(page, from, { x: from.x, y: from.y - 160 });

    // The board lets the page have this touch: it allows scrolling, and it did
    // not claim the touch for itself.
    expect(await board.evaluate((el) => getComputedStyle(el).touchAction)).toBe(BOARD_TOUCH_ACTION);
    expect(finger.touchStartCancelled, 'the board left the touch to the page').toBe(false);
    expect(await drawnHandles(board), 'no handle moved').toEqual(handles);
    if (realGestures(page)) {
      // A real finger moving up 160px scrolls the page down by about that.
      await expect.poll(() => scrollY(page), 'the page scrolled').toBeGreaterThan(startY + 100);
    }
  });

  test('on a handle it drags the handle, the page stays, and the check carries the new point', async ({ page }) => {
    const { document, ids } = canvasDocument([...LONG_PAGE]);
    const graphId = ids[0] as string;
    const api = await openCanvasActivity(page, document);
    const board = await boardOf(page, graphId);
    await centre(page, board);
    const before = await drawnHandles(board);
    const from = await handleCentre(board);
    const startY = await scrollY(page);

    const finger = await fingerDrag(page, from, { x: from.x + 64, y: from.y - 64 });

    const after = await drawnHandles(board);
    expect(after, 'the handle followed the finger').not.toEqual(before);
    expect(after[0]![0]).toBeGreaterThan(before[0]![0]);
    expect(after[0]![1]).toBeLessThan(before[0]![1]);
    // The board claimed this touch, which is what stops the page scrolling.
    expect(finger.touchStartCancelled, 'the board claimed the touch').toBe(true);
    if (realGestures(page)) expect(await scrollY(page), 'the page did not scroll').toBe(startY);

    // The drag is the answer: right and up of the origin, on the grid.
    await checkSection(page, api);
    const work = sentGraphWork(api, graphId) as { interaction: string; points: [number, number][] };
    expect(work.interaction).toBe('plot_point');
    expect(work.points).toHaveLength(1);
    const [x, y] = work.points[0]!;
    expect(x).toBeGreaterThan(0);
    expect(y).toBeGreaterThan(0);
    expect([x % 1, y % 1], 'snapped to the grid').toEqual([0, 0]);
  });

  test('scrolling past an inequality graph does not shade a side', async ({ page }) => {
    // A touch the browser turns into a scroll ends in a cancel, and JSXGraph
    // reports that like a lifted finger. A tap on empty space is how a student
    // picks the shaded side, so a scroll must not be read as one.
    const { document, ids } = canvasDocument([...LONG_PAGE]);
    const graphId = ids[2] as string;
    await openCanvasActivity(page, document);
    const board = await boardOf(page, graphId);
    await centre(page, board);
    const pills = await pressedPills(page, graphId);
    const from = await emptySpot(page, board, await handleCentre(board));
    const startY = await scrollY(page);

    await fingerDrag(page, from, { x: from.x, y: from.y - 160 });

    if (realGestures(page)) await expect.poll(() => scrollY(page)).toBeGreaterThan(startY + 100);
    expect(await pressedPills(page, graphId), 'no side was shaded').toEqual(pills);
  });

  test('a touch the browser takes away is not a tap: it shades no side, but a real tap does', async ({ page }) => {
    // The same rule from the other end. When a browser begins a scroll before
    // the finger has travelled, the touch ends in a cancel AT the place it
    // began, which is exactly what a tap looks like to a handler that only
    // compares positions.
    const { document, ids } = canvasDocument([...LONG_PAGE]);
    const graphId = ids[2] as string;
    await openCanvasActivity(page, document);
    const board = await boardOf(page, graphId);
    await centre(page, board);
    const pills = await pressedPills(page, graphId);
    const spot = await emptySpot(page, board, await handleCentre(board));

    await fingerCancelled(page, spot);
    expect(await pressedPills(page, graphId), 'a cancelled touch shaded nothing').toEqual(pills);

    // The control: a finger that lands and LIFTS at that same spot is a tap,
    // and it does pick a side.
    await page.touchscreen.tap(spot.x, spot.y);
    await expect
      .poll(() => pressedPills(page, graphId), 'a tap shaded a side')
      .not.toEqual(pills);
  });
});

test.describe('a finger on a number line', () => {
  test('on the line it scrolls the page; on the handle it drags the handle', async ({ page }) => {
    const { document, ids } = canvasDocument([...LONG_PAGE]);
    const lineId = ids[1] as string;
    await openCanvasActivity(page, document);
    const board = await boardOf(page, lineId);
    await centre(page, board);
    const before = await drawnHandles(board);
    const handle = await handleCentre(board);
    const startY = await scrollY(page);

    // Well left of the handle, on the line: an up-and-down finger scrolls.
    const scroll = await fingerDrag(page, { x: handle.x - 200, y: handle.y }, { x: handle.x - 200, y: handle.y - 160 });
    expect(scroll.touchStartCancelled).toBe(false);
    expect(await drawnHandles(board)).toEqual(before);
    if (realGestures(page)) await expect.poll(() => scrollY(page)).toBeGreaterThan(startY + 100);

    // On the handle: it follows the finger along the line.
    await centre(page, board);
    const grab = await handleCentre(board);
    const settledY = await scrollY(page);
    const drag = await fingerDrag(page, grab, { x: grab.x + 120, y: grab.y });
    expect(drag.touchStartCancelled).toBe(true);
    const after = await drawnHandles(board);
    expect(after[0]![0], 'the handle moved right').toBeGreaterThan(before[0]![0]);
    if (realGestures(page)) expect(await scrollY(page)).toBe(settledY);
  });
});

test.describe('a finger on a data plot', () => {
  test('a tap on a dot plot adds a dot', async ({ page }) => {
    const { document, ids } = canvasDocument([...LONG_PAGE]);
    const plotId = ids[3] as string;
    await openCanvasActivity(page, document);
    const board = await boardOf(page, plotId);
    await centre(page, board);
    expect((await drawnPlot(board)).circles).toEqual([]);
    const box = await board.boundingBox();
    if (!box) throw new Error('the plot has no box');
    await page.touchscreen.tap(box.x + box.width * 0.5, box.y + box.height * 0.5);
    await expect.poll(async () => (await drawnPlot(board)).circles).toHaveLength(1);
  });

  // KNOWN DEFECT, measured 2026-11-28 with real gestures, not yet ruled on by
  // the author (TODOS.md, "Touch: a scroll that starts on a data plot edits
  // it"). A data plot acts the moment a finger lands, before anyone can know
  // whether the finger is tapping or scrolling: scrolling the page with a
  // finger on a dot plot adds a dot, on a histogram sets a bar, and on a box
  // plot moves the nearest handle. The page scrolls correctly; the answer is
  // what changes. The fix alters how these three charts take a finger, which
  // is the author's call, so this row states the wanted behaviour and waits.
  test.fixme('scrolling past a data plot changes nothing on it', async ({ page }) => {
    const { document, ids } = canvasDocument([...LONG_PAGE]);
    const plotId = ids[3] as string;
    await openCanvasActivity(page, document);
    const board = await boardOf(page, plotId);
    await centre(page, board);
    const box = await board.boundingBox();
    if (!box) throw new Error('the plot has no box');
    const from = { x: box.x + box.width * 0.5, y: box.y + box.height * 0.5 };
    await fingerDrag(page, from, { x: from.x, y: from.y - 160 });
    expect((await drawnPlot(board)).circles).toEqual([]);
  });
});

test.describe('a locked section', () => {
  test('a finger on a locked handle does not move it, and the page scrolls instead', async ({ page }) => {
    const { document, ids } = canvasDocument([...LONG_PAGE], { submissionMode: 'locked' });
    const graphId = ids[0] as string;
    const api = await openCanvasActivity(page, document);
    let board = await boardOf(page, graphId);
    await centre(page, board);

    // Before the lock the same finger moves the handle (the row's control).
    const start = await drawnHandles(board);
    const grab = await handleCentre(board);
    await fingerDrag(page, grab, { x: grab.x + 64, y: grab.y - 64 });
    const placed = await drawnHandles(board);
    expect(placed).not.toEqual(start);

    await checkSection(page, api);
    await expect(page.locator('fieldset.viewer-section__inputs').first()).toHaveJSProperty('disabled', true);

    board = await boardOf(page, graphId);
    await centre(page, board);
    const locked = await handleCentre(board);
    const startY = await scrollY(page);
    const finger = await fingerDrag(page, locked, { x: locked.x, y: locked.y - 160 });

    expect(await drawnHandles(board), 'the locked handle stayed put').toEqual(placed);
    expect(finger.touchStartCancelled, 'a locked board claims no touch').toBe(false);
    if (realGestures(page)) await expect.poll(() => scrollY(page), 'the page scrolled').toBeGreaterThan(startY + 100);
    expect(api.checkRequests).toHaveLength(1);
  });
});

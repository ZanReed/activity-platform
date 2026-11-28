// =============================================================================
// canvas-data-plot.e2e.ts — REAL data plots: keys, check payload, reload
// -----------------------------------------------------------------------------
// Review C4 (2026-11-28); see canvas-graph.e2e.ts for why this is a browser
// row. One row per chart, because each chart has carried its own defect:
//
//   * dot plot   the restore was a no-op (review A2).
//   * histogram  never recorded an answer at all (review A0).
//   * box plot   stored as [], so it could never be marked (review A1).
//
// And all three, found by writing this file: a chart could not be answered
// from the keyboard in the student viewer. Focus lands on the block's wrapper,
// the kit listens on a child, and a key never travels down. The unit tests
// press their keys on the child directly, so they could not see it. These rows
// focus the chart the way Tab does (blocks/DataPlot.tsx, forwardKeyToBoard).
// =============================================================================

import { expect, test } from '@playwright/test';
import {
  boardOf,
  canvasDocument,
  checkSection,
  drawnPlot,
  openCanvasActivity,
  pressOnBoard,
  sentGraphWork,
} from '../helpers/canvasBoards';

test('dot plot: keys add dots, the check carries each value, a reload redraws them', async ({ page }) => {
  const { document, ids } = canvasDocument([{ type: 'data_plot', interaction: 'build_dotplot' }]);
  const [id] = ids as [string];
  const api = await openCanvasActivity(page, document);
  const board = await boardOf(page, id);
  expect((await drawnPlot(board)).circles).toEqual([]);

  // A 0 to 10 axis: the cursor starts in the middle, at 5. One dot there, then
  // two at 6.
  await pressOnBoard(page, id, ['ArrowUp', 'ArrowRight', 'ArrowUp', 'ArrowUp']);
  const drawn = await drawnPlot(board);
  expect(drawn.circles).toHaveLength(3);

  await checkSection(page, api);
  // One wire shape for every canvas block: value i travels as [i, value].
  expect(sentGraphWork(api, id)).toEqual({
    interaction: 'build_dotplot',
    points: [[0, 5], [1, 6], [2, 6]],
  });

  await page.reload();
  const again = await boardOf(page, id);
  await expect.poll(async () => (await drawnPlot(again)).circles, 'the reloaded plot shows the saved dots').toEqual(drawn.circles);
  expect(api.checkRequests).toHaveLength(1);
});

test('histogram: keys raise bars, the check carries every bin, a reload redraws them', async ({ page }) => {
  const { document, ids } = canvasDocument([{ type: 'data_plot', interaction: 'build_histogram' }]);
  const [id] = ids as [string];
  const api = await openCanvasActivity(page, document);
  const board = await boardOf(page, id);

  // Bin 1 to height 1, bin 2 to height 2.
  await pressOnBoard(page, id, ['ArrowUp', 'ArrowRight', 'ArrowUp', 'ArrowUp']);
  const drawn = await drawnPlot(board);
  expect(drawn.bars).toHaveLength(2);

  await checkSection(page, api);
  // Ten bins on a 0 to 10 axis, each as [bin, height].
  expect(sentGraphWork(api, id)).toEqual({
    interaction: 'build_histogram',
    points: [1, 2, 0, 0, 0, 0, 0, 0, 0, 0].map((height, bin) => [bin, height]),
  });

  await page.reload();
  const again = await boardOf(page, id);
  await expect.poll(async () => (await drawnPlot(again)).bars, 'the reloaded histogram shows the saved bars').toEqual(drawn.bars);
  expect(api.checkRequests).toHaveLength(1);
});

test('box plot: keys move two handles, the check carries all five in order, a reload redraws them', async ({ page }) => {
  const { document, ids } = canvasDocument([{ type: 'data_plot', interaction: 'build_boxplot' }]);
  const [id] = ids as [string];
  const api = await openCanvasActivity(page, document);
  const board = await boardOf(page, id);
  const untouched = await drawnPlot(board);
  expect(untouched.circles).toHaveLength(5);

  // The five handles start at 0, 3, 5, 8, 10. Minimum to 1; Tab to the lower
  // quartile (Tab moves between handles while there is a next one); it to 4.
  await pressOnBoard(page, id, ['ArrowRight', 'Tab', 'ArrowRight']);
  const drawn = await drawnPlot(board);
  expect(drawn.circles).not.toEqual(untouched.circles);

  await checkSection(page, api);
  // Minimum, Q1, median, Q3, maximum: the grader reads them by position.
  expect(sentGraphWork(api, id)).toEqual({
    interaction: 'build_boxplot',
    points: [[0, 1], [1, 4], [2, 5], [3, 8], [4, 10]],
  });

  await page.reload();
  const again = await boardOf(page, id);
  await expect.poll(async () => (await drawnPlot(again)).circles, 'the reloaded box plot shows the saved handles').toEqual(drawn.circles);
  expect(api.checkRequests).toHaveLength(1);
});

test('a modified key stays the browser’s: Control or Alt with an arrow adds no dot, a plain arrow does', async ({ page }) => {
  const { document, ids } = canvasDocument([{ type: 'data_plot', interaction: 'build_dotplot' }]);
  const [id] = ids as [string];
  await openCanvasActivity(page, document);
  const board = await boardOf(page, id);

  // Ctrl/Cmd +/- zooms the page and Alt+Arrow navigates: forwardKeyToBoard
  // must leave them alone, so the board never sees them.
  await pressOnBoard(page, id, ['Control+ArrowUp', 'Alt+ArrowUp']);
  expect((await drawnPlot(board)).circles, 'no dot from a modified key').toEqual([]);

  await pressOnBoard(page, id, ['ArrowUp']);
  expect((await drawnPlot(board)).circles, 'one dot from the plain key').toHaveLength(1);
});

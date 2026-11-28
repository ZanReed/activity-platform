// =============================================================================
// canvas-number-line.e2e.ts — a REAL number line: keys, check payload, reload
// -----------------------------------------------------------------------------
// Review C4 (2026-11-28); see canvas-graph.e2e.ts for why this is a browser
// row. The interval row is review A2's second half: an interval is stored with
// no points at all, and the block used to key its restore on points, so a
// reloaded interval came back as the board's default.
// =============================================================================

import { expect, test } from '@playwright/test';
import {
  boardOf,
  canvasDocument,
  checkSection,
  drawnHandles,
  openCanvasActivity,
  pressOnBoard,
  sentGraphWork,
} from '../helpers/canvasBoards';

test('plot a point: arrow keys move the handle, the check carries it, a reload redraws it', async ({ page }) => {
  const { document, ids } = canvasDocument([{ type: 'number_line', interaction: 'plot_point' }]);
  const [id] = ids as [string];
  const api = await openCanvasActivity(page, document);
  const board = await boardOf(page, id);
  const untouched = await drawnHandles(board);
  expect(untouched).toHaveLength(1);

  // A 0 to 10 line: the handle starts in the middle, at 5, and steps by 1.
  await pressOnBoard(page, id, ['ArrowRight', 'ArrowRight']);
  const moved = await drawnHandles(board);
  expect(moved).not.toEqual(untouched);

  await checkSection(page, api);
  // One wire shape for every canvas block: a line position travels as [x, 0].
  expect(sentGraphWork(api, id)).toEqual({ interaction: 'plot_point', points: [[7, 0]] });

  await page.reload();
  const again = await boardOf(page, id);
  await expect.poll(() => drawnHandles(again), 'the reloaded line shows the saved point').toEqual(moved);
  expect(api.checkRequests).toHaveLength(1);
});

test('graph an interval: both ends and their open/closed styles go out and come back', async ({ page }) => {
  const { document, ids } = canvasDocument([{ type: 'number_line', interaction: 'plot_interval' }]);
  const [id] = ids as [string];
  const api = await openCanvasActivity(page, document);
  const board = await boardOf(page, id);
  const block = page.locator(`[data-block-id="${id}"]`);
  const untouched = await drawnHandles(board);
  expect(untouched).toHaveLength(2);

  await pressOnBoard(page, id, ['ArrowLeft']);
  await block.getByRole('button', { name: /^Left:/ }).click();
  const moved = await drawnHandles(board);
  expect(moved).not.toEqual(untouched);
  await expect(block.getByRole('button', { name: /^Left:/ })).toContainText('open');

  await checkSection(page, api);
  const work = sentGraphWork(api, id) as {
    interaction: string;
    points: unknown[];
    domain: { minX: number; minStyle: string; maxX: number; maxStyle: string };
  };
  expect(work.interaction).toBe('plot_interval');
  // An interval is its two ends; it carries no points.
  expect(work.points).toEqual([]);
  expect(work.domain.minStyle).toBe('open');
  expect(work.domain.maxStyle).toBe('closed');
  expect(work.domain.minX).toBeLessThan(work.domain.maxX);

  await page.reload();
  const again = await boardOf(page, id);
  await expect.poll(() => drawnHandles(again), 'the reloaded line shows the saved ends').toEqual(moved);
  await expect(block.getByRole('button', { name: /^Left:/ })).toContainText('open');
  await expect(block.getByRole('button', { name: /^Right:/ })).toContainText('closed');
  expect(api.checkRequests).toHaveLength(1);
});

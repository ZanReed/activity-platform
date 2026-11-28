// =============================================================================
// canvas-graph.e2e.ts — a REAL graph board: keys in, check payload out, reload
// -----------------------------------------------------------------------------
// Review C4 (2026-11-28). The interactive graph, mounted by the real kit on the
// real student route. Each row moves a handle from the keyboard, reads the work
// off the check request the app actually sent, reloads, and reads the handles
// back off the board's own SVG.
//
// Why a browser: the unit suite mounts JSXGraph in jsdom, which has no layout,
// and dispatches its keys straight onto the board's element. Whether focus can
// reach that element, whether the board draws where the store says, and
// whether a reload puts the handles back on screen are only true or false here.
//
// The second row is review A2's defect, in a browser for the first time: an
// inequality's line style and shaded side are answer content that the seam
// used to drop on the way out and again on the way back in.
// =============================================================================

import { expect, test } from '@playwright/test';
import {
  boardOf,
  canvasDocument,
  checkSection,
  drawnHandles,
  openCanvasActivity,
  pressedPills,
  pressOnBoard,
  sentGraphWork,
} from '../helpers/canvasBoards';

test('plot a point: arrow keys move the handle, the check carries it, a reload redraws it', async ({ page }) => {
  const { document, ids } = canvasDocument([{ type: 'interactive_graph', interaction: 'plot_point' }]);
  const [id] = ids as [string];
  const api = await openCanvasActivity(page, document);
  const board = await boardOf(page, id);
  const untouched = await drawnHandles(board);
  expect(untouched).toHaveLength(1);

  // The handle starts at the origin; the grid step is 1.
  await pressOnBoard(page, id, ['ArrowRight', 'ArrowRight', 'ArrowUp', 'ArrowUp', 'ArrowUp']);
  const moved = await drawnHandles(board);
  expect(moved, 'the handle moved on screen').not.toEqual(untouched);

  await checkSection(page, api);
  expect(sentGraphWork(api, id)).toEqual({ interaction: 'plot_point', points: [[2, 3]] });

  await page.reload();
  const again = await boardOf(page, id);
  await expect.poll(() => drawnHandles(again), 'the reloaded board shows the saved point').toEqual(moved);
  // Coming back sent nothing: restore is never a check.
  expect(api.checkRequests).toHaveLength(1);
});

test('graph an inequality: the line style and shaded side travel with the points, out and back', async ({ page }) => {
  const { document, ids } = canvasDocument([{ type: 'interactive_graph', interaction: 'graph_inequality' }]);
  const [id] = ids as [string];
  const api = await openCanvasActivity(page, document);
  const board = await boardOf(page, id);
  const block = page.locator(`[data-block-id="${id}"]`);
  expect(await pressedPills(page, id)).toEqual(['Solid line']);

  await pressOnBoard(page, id, ['ArrowUp', 'ArrowUp']);
  await block.getByRole('button', { name: 'Dotted line' }).click();
  await block.getByRole('button', { name: 'Shade below' }).click();
  const moved = await drawnHandles(board);
  expect(await pressedPills(page, id)).toEqual(['Dotted line', 'Shade below']);

  await checkSection(page, api);
  const work = sentGraphWork(api, id) as {
    interaction: string;
    points: [number, number][];
    parts: Array<{ points: [number, number][]; strict: boolean; side: string }>;
  };
  expect(work.interaction).toBe('graph_inequality');
  expect(work.points).toHaveLength(2);
  // The choices ride in the wire's per-object slot, with the same points.
  expect(work.parts).toEqual([{ points: work.points, strict: true, side: 'below' }]);

  await page.reload();
  const again = await boardOf(page, id);
  await expect.poll(() => drawnHandles(again)).toEqual(moved);
  await expect
    .poll(() => pressedPills(page, id), 'the reloaded board shows the saved choices, not its defaults')
    .toEqual(['Dotted line', 'Shade below']);
  expect(api.checkRequests).toHaveLength(1);
});

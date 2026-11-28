// =============================================================================
// canvas-lock.e2e.ts — a locked section freezes its REAL boards
// -----------------------------------------------------------------------------
// Review A3 and C4 (2026-11-28). "Check and lock" is one-way: the server
// refuses a second check. The freeze is a disabled fieldset, and a graph, a
// number line and a data plot are not form controls, so `disabled` never
// reaches them. Before 2026-11-26 a student could go on dragging after the
// lock: the marks held, but the screen, the saved work and the "N answered"
// count drifted from what was graded. The fix was tested against fake boards
// and the kit's own lock, never by moving a real handle. This is that row.
//
// Two different things stop input, and the row proves each on its own:
//   * the KEYBOARD is stopped by the block calling the board's lock
//     (useSectionFrozen → setLocked). Nothing else stands in a key's way.
//   * a MOUSE or FINGER is stopped by a CSS rule on the frozen canvas as well.
//
// Every "cannot move" below has its "could move a moment ago" in the same
// test, so a board that never took input cannot pass for a locked one.
// =============================================================================

import { expect, test, type Locator, type Page } from '@playwright/test';
import {
  boardOf,
  canvasDocument,
  checkSection,
  drawnHandles,
  drawnPlot,
  openCanvasActivity,
  pressOnBoard,
} from '../helpers/canvasBoards';

/** Drag the mouse from a drawn handle, 60px right and 40px down. */
async function dragHandle(page: Page, board: Locator): Promise<void> {
  const box = await board.locator('svg').first().boundingBox();
  const [handle] = await drawnHandles(board);
  if (!box || !handle) throw new Error('no board or no handle to drag');
  const x = box.x + handle[0];
  const y = box.y + handle[1];
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 30, y + 20, { steps: 4 });
  await page.mouse.move(x + 60, y + 40, { steps: 4 });
  await page.mouse.up();
}

test('after "Check and lock", no key and no drag moves a graph, a number line or a data plot', async ({ page }) => {
  const { document, ids } = canvasDocument(
    [
      { type: 'interactive_graph', interaction: 'plot_point' },
      { type: 'number_line', interaction: 'plot_point' },
      { type: 'data_plot', interaction: 'build_dotplot' },
    ],
    { submissionMode: 'locked' },
  );
  const [graphId, lineId, plotId] = ids as [string, string, string];
  const api = await openCanvasActivity(page, document);
  const graph = await boardOf(page, graphId);
  const line = await boardOf(page, lineId);
  const plot = await boardOf(page, plotId);

  // ---- Before the lock: every input moves its board -------------------------
  const graphStart = await drawnHandles(graph);
  await dragHandle(page, graph);
  const graphDragged = await drawnHandles(graph);
  expect(graphDragged, 'a mouse drag moves the handle').not.toEqual(graphStart);
  await pressOnBoard(page, graphId, ['ArrowLeft']);
  const graphKeyed = await drawnHandles(graph);
  expect(graphKeyed, 'a key moves the handle').not.toEqual(graphDragged);

  const lineStart = await drawnHandles(line);
  await pressOnBoard(page, lineId, ['ArrowRight']);
  const lineKeyed = await drawnHandles(line);
  expect(lineKeyed).not.toEqual(lineStart);

  await pressOnBoard(page, plotId, ['ArrowUp']);
  const plotKeyed = await drawnPlot(plot);
  expect(plotKeyed.circles).toHaveLength(1);

  // ---- Lock ------------------------------------------------------------------
  await checkSection(page, api);
  await expect(page.locator('fieldset.viewer-section__inputs')).toHaveJSProperty('disabled', true);

  const expectFrozen = async (when: string): Promise<void> => {
    const g = await boardOf(page, graphId);
    const l = await boardOf(page, lineId);
    const p = await boardOf(page, plotId);
    await expect.poll(() => drawnHandles(g), `graph, ${when}`).toEqual(graphKeyed);

    // Keys: only the board's own lock stops these.
    await pressOnBoard(page, graphId, ['ArrowRight', 'ArrowUp']);
    await pressOnBoard(page, lineId, ['ArrowLeft', 'ArrowLeft']);
    await pressOnBoard(page, plotId, ['ArrowUp', 'ArrowRight', 'ArrowUp']);
    // A drag, and a click where a dot plot would add a dot.
    await dragHandle(page, g);
    const plotBox = await p.boundingBox();
    if (!plotBox) throw new Error('the data plot has no box');
    await page.mouse.click(plotBox.x + plotBox.width * 0.25, plotBox.y + plotBox.height * 0.5);

    expect(await drawnHandles(g), `graph stayed put, ${when}`).toEqual(graphKeyed);
    expect(await drawnHandles(l), `number line stayed put, ${when}`).toEqual(lineKeyed);
    expect((await drawnPlot(p)).circles, `data plot stayed put, ${when}`).toEqual(plotKeyed.circles);
  };

  await expectFrozen('right after the lock');

  // ---- And still locked after a reload ---------------------------------------
  // The board mounts fresh, so this is the mount-time lock, a separate line of
  // code from the one that fires when the section freezes under a live board.
  await page.reload();
  await expect(page.locator('fieldset.viewer-section__inputs')).toHaveJSProperty('disabled', true);
  await expectFrozen('after a reload');

  // Nothing the student did after the lock reached the server.
  expect(api.checkRequests).toHaveLength(1);
});

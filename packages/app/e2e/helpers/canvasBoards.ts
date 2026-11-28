// =============================================================================
// e2e/helpers/canvasBoards.ts — real graph-kit boards on the student route
// -----------------------------------------------------------------------------
// Review C4 (2026-11-28). Until these specs, no browser test moved a handle:
// the viewer's canvas tests drove fake surfaces, and the one real-board spec
// (graph-stimulus) only checked that a stimulus drew. The three defects of the
// 2026-11-26 review (a box plot stored as [], answers not restored, a locked
// section that still took input) all lived in that gap.
//
// Shared by the student-lane canvas specs and the touch lane, so both drive
// the SAME served document through the SAME stub server.
//
// The document is the lane's own fixture through the REAL sanitizer and
// serve-time shuffle (`servedFixtureDocument`), cut down to the blocks a spec
// names. Nothing about a block is retyped here (P2): its question shape is
// whatever the sanitizer derived, exactly as `get-activity` would serve it.
// =============================================================================

import type { Locator, Page } from '@playwright/test';
import { servedFixtureDocument } from '@activity/viewer/fixtures';
import { activityUrl, signInAs, stubActivityApi, type ActivityApi } from './studentSession';

type Served = ReturnType<typeof servedFixtureDocument>;
type ServedBlock = Served['sections'][number]['rows'][number]['columns'][number]['blocks'][number];

export interface CanvasPick {
  /** The block's `type`. */
  type: 'interactive_graph' | 'number_line' | 'data_plot';
  /** Its `interaction.type`. */
  interaction: string;
}

export interface CanvasDocument {
  document: Served;
  /** The picked blocks' ids, in the order they were asked for. */
  ids: string[];
}

const interactionOf = (block: ServedBlock): string | undefined =>
  (block as { interaction?: { type?: string } }).interaction?.type;

/**
 * The served fixture, keeping only the rows that hold a picked block, in ONE
 * section. A short page on purpose: the canvas rows assert on one board, and a
 * full worksheet would put thirty other questions between the board and Check.
 */
export function canvasDocument(
  picks: CanvasPick[],
  meta: Record<string, unknown> = {},
): CanvasDocument {
  const served = servedFixtureDocument();
  const rows = served.sections.flatMap((s) => s.rows);
  const ids: string[] = [];
  const kept = picks.map((pick) => {
    const row = rows.find((r) =>
      r.columns.some((c) =>
        c.blocks.some((b) => b.type === pick.type && interactionOf(b) === pick.interaction),
      ),
    );
    const block = row?.columns
      .flatMap((c) => c.blocks)
      .find((b) => b.type === pick.type && interactionOf(b) === pick.interaction);
    if (!row || !block) {
      throw new Error(`the served fixture has no ${pick.type} / ${pick.interaction}`);
    }
    ids.push(block.id);
    return row;
  });
  const first = served.sections[0];
  if (!first) throw new Error('the served fixture has no section');
  const document = {
    ...served,
    meta: { ...served.meta, ...meta },
    sections: [{ ...first, rows: kept }],
  } as Served;
  return { document, ids };
}

/** Sign in, serve `document`, open the activity. The stub REMEMBERS checks, so
 *  a reload can restore a checked (or locked) section the way production does. */
export async function openCanvasActivity(
  page: Page,
  document: Served,
): Promise<ActivityApi> {
  await signInAs(page);
  const api = await stubActivityApi(page, { document, serverRemembers: true });
  await page.route('**/rest/v1/rpc/get_my_released_feedback', (r) => r.fulfill({ json: [] }));
  await page.goto(activityUrl());
  return api;
}

/** A block's board: the element the kit mounted into, once it has drawn. */
export async function boardOf(page: Page, blockId: string): Promise<Locator> {
  const board = page.locator(`[data-block-id="${blockId}"] [data-graph-board-host]`);
  await board.locator('svg').first().waitFor({ timeout: 20_000 });
  return board;
}

/** The graph work the app sent for a block on its most recent check. */
export function sentGraphWork(api: ActivityApi, blockId: string): unknown {
  const last = api.checkRequests.at(-1) as
    | { responses?: { graphs?: Record<string, unknown> } }
    | undefined;
  return last?.responses?.graphs?.[blockId];
}

/** Focus a board the way Tab does, then press keys on it. The focus target is
 *  the block's own tab stop for a data plot and the kit's host for a graph or
 *  number line: whichever element inside the block is focusable and holds the
 *  board. */
export async function pressOnBoard(page: Page, blockId: string, keys: string[]): Promise<void> {
  const block = page.locator(`[data-block-id="${blockId}"]`);
  const host = block.locator('[data-graph-board-host][tabindex="0"]');
  const target = (await host.count()) > 0 ? host : block.locator('[data-graph-canvas][tabindex="0"]');
  await target.focus();
  for (const key of keys) await page.keyboard.press(key);
}

/**
 * Where a JSXGraph board (graph, number line) has DRAWN its handles: the
 * visible points' centres in SVG pixels, rounded. Read from the board's own
 * SVG, so it says what is on screen and nothing about the store. JSXGraph also
 * keeps hidden helper points (axis definitions); those are skipped.
 */
export async function drawnHandles(board: Locator): Promise<Array<[number, number]>> {
  return board.evaluate((el) =>
    Array.from(el.querySelectorAll('svg ellipse'))
      .filter((n) => {
        const cs = getComputedStyle(n);
        return cs.display !== 'none' && cs.visibility !== 'hidden';
      })
      .map((n): [number, number] => [
        Math.round(Number(n.getAttribute('cx'))),
        Math.round(Number(n.getAttribute('cy'))),
      ]),
  );
}

/**
 * What a data plot has DRAWN: its dots or box handles (circle centres) and its
 * histogram bars (the stroked rects; the unstroked one is the keyboard
 * cursor's column). Sizes are left out on purpose: the active handle is drawn
 * larger, and which one is active is not part of the answer.
 */
export async function drawnPlot(board: Locator): Promise<{ circles: string[]; bars: string[] }> {
  return board.evaluate((el) => {
    const svg = el.querySelector('svg.data-plot-paper');
    const num = (n: Element, a: string) => Math.round(Number(n.getAttribute(a)));
    return {
      circles: Array.from(svg?.querySelectorAll('circle') ?? []).map(
        (n) => `${num(n, 'cx')},${num(n, 'cy')}`,
      ),
      bars: Array.from(svg?.querySelectorAll('rect[stroke]') ?? [])
        .filter((n) => n.getAttribute('fill') !== 'none')
        .map((n) => `${num(n, 'x')},${num(n, 'height')}`),
    };
  });
}

/** Which of a block's pill buttons are pressed, by their text. */
export async function pressedPills(page: Page, blockId: string): Promise<string[]> {
  return page
    .locator(`[data-block-id="${blockId}"]`)
    .getByRole('button', { pressed: true })
    .allInnerTexts();
}

/** Press the section's Check and wait for the server's answer to land. */
export async function checkSection(page: Page, api: ActivityApi): Promise<void> {
  const before = api.checkRequests.length;
  await page.getByRole('button', { name: /^Check/ }).first().click();
  // A locked activity asks first; the confirm's button is the one that sends.
  const confirm = page.getByRole('button', { name: 'Check and lock' });
  if (await confirm.isVisible().catch(() => false)) await confirm.click();
  await page.waitForFunction(() => /Checked/.test(document.body.innerText));
  if (api.checkRequests.length !== before + 1) {
    throw new Error(`expected one check request, saw ${api.checkRequests.length - before}`);
  }
}

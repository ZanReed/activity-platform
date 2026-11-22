// =============================================================================
// blank-superscript.e2e.ts — the ² ³ tray in REAL layout
// -----------------------------------------------------------------------------
// docs/design/superscript-units.md. The component test pins behaviour with
// mocked rectangles; jsdom has no layout, so these rows pin what only a real
// browser can say:
//   DR-1  the tray sits BESIDE the blank, and after a wrong check it never
//         covers the feedback line under it ("write the unit, m²");
//   DR-6  on a coordinate pair "( x , y )" the tray on x never covers y;
//   D5    in a table's LAST row (overflow-x clips both axes) the tray is
//         clickable and the table grows no scroll area under it — since
//         2026-11-23 the tray is in the TOP LAYER, so the table cannot clip
//         it; this replaced "stays inside the table";
//   TL    the author's case: a ONE-row table, blank in the LAST column — the
//         tray is fully on screen, clickable, and the table does not scroll;
//   D3    Tab walks input → ² → ³ and the tray stays open while it does (the
//         focus-within line jsdom cannot prove), Enter inserts and hands focus
//         back;
//   DR-2  a click on ² never takes focus from the input; at 375 px too.
// Screenshots are attached as the visual record (no mockups were made).
// =============================================================================

import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test';
import { servedFixtureDocument } from '@activity/viewer/fixtures';
import { activityUrl, signInAs, stubActivityApi } from '../helpers/studentSession';

const t = (text: string) => ({ type: 'text', text, marks: [] });
const ID = (n: number) => `5a900000-0000-4000-8000-${String(n).padStart(12, '0')}`;

const AREA = ID(1);
const X = ID(2);
const Y = ID(3);
const CELL = ID(4);
const LAST = ID(5);

function documentWithBlanks() {
  const document = JSON.parse(JSON.stringify(servedFixtureDocument())) as ReturnType<
    typeof servedFixtureDocument
  >;
  const section = document.sections[0] as unknown as { rows: unknown[] };
  const row = (n: number, block: unknown) => ({
    id: ID(100 + n),
    gridLines: 'inherit',
    columns: [{ id: ID(200 + n), blocks: [block] }],
  });
  section.rows = [
    row(1, {
      id: ID(11),
      type: 'fill_in_blank',
      content: [t('A garden bed is 7 m by 4 m. Its area is '), { type: 'blank', id: AREA, answerType: 'numeric' }, t(' and that is the whole bed.')],
    }),
    row(2, {
      id: ID(12),
      type: 'fill_in_blank',
      content: [t('R′ is at ('), { type: 'blank', id: X, answerType: 'numeric' }, t(', '), { type: 'blank', id: Y, answerType: 'numeric' }, t(').')],
    }),
    row(3, {
      id: ID(13),
      type: 'table',
      headerRow: true,
      headerColumn: false,
      rows: [
        { id: ID(31), cells: [{ id: ID(41), content: [t('Shape')] }, { id: ID(42), content: [t('Area')] }] },
        { id: ID(32), cells: [{ id: ID(43), content: [t('Square')] }, { id: ID(44), content: [t('9 cm²')] }] },
        { id: ID(33), cells: [{ id: ID(45), content: [t('Rectangle')] }, { id: ID(46), content: [{ type: 'blank', id: CELL, answerType: 'numeric' }] }] },
      ],
    }),
    row(4, {
      id: ID(14),
      type: 'table',
      headerRow: false,
      headerColumn: true,
      rows: [
        {
          id: ID(34),
          cells: [
            { id: ID(47), content: [t('y')] },
            { id: ID(48), content: [t('5')] },
            { id: ID(49), content: [t('8')] },
            { id: ID(50), content: [{ type: 'blank', id: LAST, answerType: 'numeric' }] },
          ],
        },
      ],
    }),
    ...section.rows,
  ];
  return document;
}

async function open(page: Page, width = 1280, check?: Parameters<typeof stubActivityApi>[1]['check']) {
  await page.setViewportSize({ width, height: 900 });
  await stubActivityApi(page, { document: documentWithBlanks(), ...(check ? { check } : {}) });
  await signInAs(page);
  await page.goto(activityUrl());
  await page.locator(`[data-blank-id="${AREA}"] input`).waitFor();
}

const input = (page: Page, id: string) => page.locator(`[data-blank-id="${id}"] input`);
const tray = (page: Page) => page.locator('.viewer-blank__tray');

async function box(l: Locator) {
  const b = await l.boundingBox();
  if (!b) throw new Error('no box');
  return b;
}
const overlaps = (a: { x: number; y: number; width: number; height: number }, b: typeof a) =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

async function record(page: Page, info: TestInfo, name: string) {
  await info.attach(name, { body: await page.screenshot(), contentType: 'image/png' });
}

test('DR-1/DR-2: the tray sits beside; a click inserts ² and keeps focus', async ({ page }, info) => {
  await open(page);
  await input(page, AREA).click();
  await input(page, AREA).pressSequentially('28 m');
  await expect(tray(page)).toHaveAttribute('data-placement', 'beside');
  await record(page, info, 'beside');
  await page.getByRole('button', { name: 'Insert squared' }).click();
  await expect(input(page, AREA)).toHaveValue('28 m²');
  await expect(input(page, AREA)).toBeFocused();
});

test('D3: Tab walks input → ² → ³, the tray stays, Enter inserts and returns focus', async ({ page }) => {
  await open(page);
  await input(page, AREA).click();
  await input(page, AREA).pressSequentially('125 cm');
  // The tray's chunk is lazy (shell budget ruling): a Tab pressed before it
  // has arrived goes straight past, which is harmless for a student (typing
  // cm3 grades the same) but is not what this row tests.
  await expect(tray(page)).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Insert squared' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Insert cubed' })).toBeFocused();
  await expect(tray(page)).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(input(page, AREA)).toHaveValue('125 cm³');
  await expect(input(page, AREA)).toBeFocused();
});

test('DR-6: the tray on x never covers y', async ({ page }, info) => {
  await open(page);
  await input(page, X).click();
  await expect(tray(page)).toBeVisible();
  await record(page, info, 'coordinate-pair');
  expect(overlaps(await box(tray(page)), await box(input(page, Y)))).toBe(false);
});

/** The key is the topmost thing at its own centre: visible AND clickable. */
async function keyIsHittable(page: Page) {
  const k = await box(page.getByRole('button', { name: 'Insert squared' }));
  return page.evaluate(
    ([x, y]) => document.elementFromPoint(x!, y!)?.closest('button')?.getAttribute('aria-label') ?? null,
    [k.x + k.width / 2, k.y + k.height / 2],
  );
}

/** The table's scroll box has no vertical overflow (no scrollbar under the tray). */
const tableScrolls = (table: Locator) => table.evaluate((el) => el.scrollHeight > el.clientHeight + 1);

test('D5: in the last table row the tray is clickable and the table grows no scroll', async ({ page }, info) => {
  await open(page, 700);
  await input(page, CELL).click();
  await expect(tray(page)).toBeVisible();
  await record(page, info, 'table-last-row');
  expect(await keyIsHittable(page)).toBe('Insert squared');
  expect(await tableScrolls(page.locator('.viewer-table').first())).toBe(false);
});

test('TL: one-row table, blank in the last column — the tray is on screen, clickable, no table scroll', async ({ page }, info) => {
  await open(page, 1280);
  await input(page, LAST).scrollIntoViewIfNeeded();
  await input(page, LAST).click();
  await expect(tray(page)).toBeVisible();
  await expect(tray(page)).toHaveAttribute('popover', 'manual');
  // The in-flow placement rules are undone (beside's translateY(-50%) would
  // put it half a tray too high).
  await expect(tray(page)).toHaveCSS('transform', 'none');
  await record(page, info, 'one-row-last-column');
  const tb = await box(tray(page));
  expect(tb.x).toBeGreaterThanOrEqual(0);
  expect(tb.x + tb.width).toBeLessThanOrEqual(1280);
  expect(await keyIsHittable(page)).toBe('Insert squared');
  expect(await tableScrolls(page.locator('.viewer-table').nth(1))).toBe(false);
  await page.getByRole('button', { name: 'Insert squared' }).click();
  await expect(input(page, LAST)).toBeFocused();
  // Scrolling the page moves the tray WITH its blank (fixed coordinates are
  // re-measured on scroll).
  const before = await box(input(page, LAST));
  await page.mouse.wheel(0, 120);
  await expect.poll(async () => (await box(input(page, LAST))).y).not.toBe(before.y);
  const i = await box(input(page, LAST));
  const after = await box(tray(page));
  expect(Math.abs(after.y + after.height / 2 - (i.y + i.height / 2))).toBeLessThan(40);
});

test('DR-1: after a wrong check the feedback line under the blank stays uncovered', async ({ page }, info) => {
  await open(page, 1280, {
    verdicts: { [AREA]: 'incorrect' },
    feedback: { [AREA]: [t('Say what 28 counts: write the unit, m².')] },
  });
  await input(page, AREA).click();
  await input(page, AREA).pressSequentially('28');
  await page.getByRole('button', { name: 'Check' }).first().click();
  const feedback = page.locator(`[data-blank-id="${AREA}"] [data-feedback="server"]`);
  await expect(feedback).toBeVisible();
  await input(page, AREA).click();
  await expect(tray(page)).toBeVisible();
  await record(page, info, 'after-wrong-check');
  expect(overlaps(await box(tray(page)), await box(feedback))).toBe(false);
  // …and never the ✗ verdict mark beside the input (author, 2026-10-16).
  const pill = page.locator(`[data-blank-id="${AREA}"] .viewer-state-pill`);
  await expect(pill).toBeVisible();
  expect(overlaps(await box(tray(page)), await box(pill))).toBe(false);
});

test('phone (375 px): the tray docks at the bottom, off the blank\'s lines, above the Check bar; a tap keeps focus', async ({ page }, info) => {
  await open(page, 375);
  await input(page, AREA).click();
  await input(page, AREA).pressSequentially('6 m');
  await expect(tray(page)).toHaveAttribute('data-placement', 'dock');
  await record(page, info, 'phone');
  const tb = await box(tray(page));
  // Nothing of the blank's own paragraph is covered.
  expect(overlaps(tb, await box(page.locator('.viewer-blanks').first()))).toBe(false);
  // On screen, and above the sticky Check bar when it shows.
  expect(tb.x).toBeGreaterThanOrEqual(0);
  expect(tb.x + tb.width).toBeLessThanOrEqual(375);
  const bar = page.locator('.viewer-check-group__footer').first();
  if (await bar.isVisible()) expect(tb.y + tb.height).toBeLessThanOrEqual((await box(bar)).y);
  await page.getByRole('button', { name: 'Insert squared' }).click();
  await expect(input(page, AREA)).toHaveValue('6 m²');
  await expect(input(page, AREA)).toBeFocused();
});

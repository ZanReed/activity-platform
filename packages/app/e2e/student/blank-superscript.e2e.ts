// =============================================================================
// blank-superscript.e2e.ts — the ² ³ tray in REAL layout
// -----------------------------------------------------------------------------
// docs/design/superscript-units.md. The component test pins behaviour with
// mocked rectangles; jsdom has no layout, so these rows pin what only a real
// browser can say:
//   DR-1  the tray sits BESIDE the blank, and after a wrong check it never
//         covers the feedback line under it ("write the unit, m²");
//   DR-6  on a coordinate pair "( x , y )" the tray on x never covers y;
//   D5    in a table's LAST row (overflow-x clips both axes) the tray stays
//         inside the table and is clickable;
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

test('D5: in the last table row the tray stays inside the table and is clickable', async ({ page }, info) => {
  await open(page, 700);
  await input(page, CELL).click();
  await expect(tray(page)).toBeVisible();
  await record(page, info, 'table-last-row');
  const key = page.getByRole('button', { name: 'Insert squared' });
  const k = await box(key);
  const hit = await page.evaluate(
    ([x, y]) => document.elementFromPoint(x!, y!)?.closest('button')?.getAttribute('aria-label') ?? null,
    [k.x + k.width / 2, k.y + k.height / 2],
  );
  expect(hit).toBe('Insert squared');
  const table = await box(page.locator('.viewer-table').first());
  const tb = await box(tray(page));
  expect(tb.y).toBeGreaterThanOrEqual(table.y - 1);
  expect(tb.y + tb.height).toBeLessThanOrEqual(table.y + table.height + 1);
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
});

test('DR-2: at 375 px a tap on ² keeps focus and the tray stays on screen', async ({ page }, info) => {
  await open(page, 375);
  await input(page, AREA).click();
  await input(page, AREA).pressSequentially('6 m');
  await expect(tray(page)).toBeVisible();
  await record(page, info, 'phone');
  const tb = await box(tray(page));
  expect(tb.x).toBeGreaterThanOrEqual(0);
  expect(tb.x + tb.width).toBeLessThanOrEqual(375);
  await page.getByRole('button', { name: 'Insert squared' }).click();
  await expect(input(page, AREA)).toHaveValue('6 m²');
  await expect(input(page, AREA)).toBeFocused();
});

// =============================================================================
// side-by-side-figures.e2e.ts — four small figures in a row stay READABLE
// -----------------------------------------------------------------------------
// Side-by-side figures (2026-10-04). The unit rows pin the label SCALE; this
// row pins what the scale is for: the size, in real screen pixels, of a label
// on a figure drawn a quarter of the row wide. It is measured in the browser,
// through the real container and stylesheet, because that is the only place
// "how big is it on screen" has an answer.
//
// The T7b measurement that set the old two-column limit: at quarter width a
// 16-unit label came out about 6px. The floor asserted here is 9.5px.
// =============================================================================

import { expect, test, type Page } from '@playwright/test';
import { servedFixtureDocument } from '@activity/viewer/fixtures';
import { activityUrl, signInAs, stubActivityApi } from '../helpers/studentSession';

const AXIS = { xMin: -4, xMax: 4, yMin: -4, yMax: 4, xGridStep: 1, yGridStep: 1, showGrid: true, snapToGrid: true };

function figure(letter: string, plane: boolean) {
  return {
    id: `f1600000-0000-4000-8000-00000000000${letter.charCodeAt(0) - 64}`,
    type: 'graph_figure',
    axis: AXIS,
    plane,
    toScale: false,
    caption: letter,
    alt: `Triangle ${letter}`,
    drawables: [
      { kind: 'point', at: [-2, -2], label: 'P' },
      { kind: 'point', at: [2, -2], label: 'Q' },
      { kind: 'point', at: [0, 2], label: 'R' },
      { kind: 'polygon', vertices: [[-2, -2], [2, -2], [0, 2]], filled: false },
    ],
  };
}

function documentWithRow(plane: boolean) {
  const document = JSON.parse(JSON.stringify(servedFixtureDocument())) as ReturnType<typeof servedFixtureDocument>;
  const section = document.sections[0] as unknown as { rows: unknown[] };
  section.rows = [
    {
      id: 'f1600000-0000-4000-8000-0000000000aa',
      gridLines: 'inherit',
      columns: ['A', 'B', 'C', 'D'].map((letter, i) => ({
        id: `f1600000-0000-4000-8000-0000000000b${i}`,
        blocks: [figure(letter, plane)],
      })),
    },
    ...section.rows,
  ];
  return document;
}

async function open(page: Page, plane: boolean, width: number) {
  await page.setViewportSize({ width, height: 900 });
  await stubActivityApi(page, { document: documentWithRow(plane) });
  await signInAs(page);
  await page.goto(activityUrl());
  await page.locator('[data-figure-caption]').first().waitFor();
}

/** Each label's size in SCREEN pixels: its viewBox font size times the svg's scale. */
const labelPixels = (page: Page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll('[data-block-type="graph_figure"] svg')).flatMap((svg) => {
      const viewBoxWidth = Number(svg.getAttribute('viewBox')!.split(' ')[2]);
      const scale = svg.getBoundingClientRect().width / viewBoxWidth;
      return Array.from(svg.querySelectorAll('text'))
        .filter((t) => ['P', 'Q', 'R'].includes(t.textContent ?? ''))
        .map((t) => Number(t.getAttribute('font-size')) * scale);
    }),
  );

test('four figures in a row on a laptop: captions A–D in order, labels at reading size', async ({ page }) => {
  await open(page, false, 1280);
  await expect(page.locator('[data-figure-caption]')).toHaveText(['A', 'B', 'C', 'D']);

  // All four sit on one line. (`figure.viewer-figure-wrap`, not
  // [data-block-type]: that attribute is on the container's wrapper too.)
  const tops = await page.locator('figure.viewer-figure-wrap').evaluateAll((els) =>
    els.slice(0, 4).map((el) => Math.round(el.getBoundingClientRect().top)),
  );
  expect(new Set(tops).size).toBe(1);

  const sizes = await labelPixels(page);
  expect(sizes).toHaveLength(12);
  expect(Math.min(...sizes), `smallest label is ${Math.min(...sizes).toFixed(1)}px`).toBeGreaterThanOrEqual(9.5);
});

test('with the plane on, four to a row keep the grid and drop the axis numbers', async ({ page }) => {
  await open(page, true, 1280);
  const first = page.locator('[data-block-type="graph_figure"] svg').first();
  expect(await first.locator('g[font-size="11"] text').count()).toBe(0);
  expect(await first.locator('line').count()).toBeGreaterThan(10);
});

test('on a tablet the four go two-by-two; on a phone, one per row', async ({ page }) => {
  await open(page, false, 820);
  const tops = () =>
    page.locator('figure.viewer-figure-wrap').evaluateAll((els) =>
      els.slice(0, 4).map((el) => Math.round(el.getBoundingClientRect().top)),
    );
  expect(new Set(await tops()).size).toBe(2);
  await page.setViewportSize({ width: 400, height: 900 });
  expect(new Set(await tops()).size).toBe(4);
});

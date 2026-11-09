// =============================================================================
// viewer-inline-gaps.e2e.ts — two things found on a real phone, 2026-11-09
// -----------------------------------------------------------------------------
// A blank inside inline maths (`$k = \gap{4}$`) printed raw `\placeholder[...]`
// in red and pushed its card off the page, with nowhere to type. A `graph` with
// only `show:` lines drew an empty box. Both need the real kit and real layout.
// =============================================================================

import { expect, test } from '@playwright/test';
import { servedFixtureDocument } from '@activity/viewer/fixtures';
import { activityUrl, signInAs, stubActivityApi } from '../helpers/studentSession';

test.use({ viewport: { width: 375, height: 812 } });

const GAP = 'a0000000000000000000000000000001';

test('a display graph draws, and an inline gap is a field on the page', async ({ page }) => {
  const document = JSON.parse(JSON.stringify(servedFixtureDocument()));
  document.sections[0].rows[0].columns[0].blocks.unshift(
    {
      id: '44444444-0000-4000-8000-000000000001',
      type: 'interactive_graph',
      prompt: [],
      axisConfig: { xMin: 0, xMax: 5, yMin: 0, yMax: 25, showGrid: true, xGridStep: 1, yGridStep: 1, snapToGrid: true },
      interaction: {
        type: 'display',
        drawables: [
          { kind: 'curve', model: { family: 'linear', slope: 5, intercept: 0 } },
          { kind: 'point', at: [1, 5], label: '(1, 5)', style: 'closed' },
        ],
      },
    },
    {
      id: '44444444-0000-4000-8000-000000000002',
      type: 'paragraph',
      content: [
        { type: 'text', text: 'As a constant of proportionality: ', marks: [] },
        { type: 'math_inline', latex: `k = \\placeholder[${GAP}]{}`, prompts: [{ id: GAP }] },
      ],
    },
  );
  await stubActivityApi(page, { document, versionId: 'dddddddd-0000-4000-8000-00000000f001' });
  await signInAs(page);
  await page.goto(activityUrl());

  const graph = page.locator('[data-graph-canvas="true"]').first();
  await expect(graph.locator('svg')).toBeVisible();
  expect((await graph.boundingBox())!.height).toBeGreaterThan(100);

  await expect(page.locator('body')).not.toContainText('placeholder');
  const field = page.locator('[data-math-gaps="true"] math-field').first();
  await expect(field).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

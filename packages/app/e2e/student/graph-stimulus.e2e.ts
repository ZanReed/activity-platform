// =============================================================================
// graph-stimulus.e2e.ts — a graded graph's STIMULUS on the student's live board
// -----------------------------------------------------------------------------
// Graded stimuli (2026-10-04). The unit rows prove the viewer HANDS the board
// its stimulus and that the print twin draws it; nothing in the unit suite
// loads JSXGraph (ER-5: "board proof is an e2e row"). This is that row: the
// real kit, on the real student route, with the stimulus arriving through the
// served document exactly as `get-activity` would send it.
//
// The fixture document is the lane's own, with a stimulus added to its
// plot_point graph — so everything else about the block (question shape,
// section, check wiring) is what every other student spec already exercises.
// =============================================================================

import { expect, test } from '@playwright/test';
import { servedFixtureDocument } from '@activity/viewer/fixtures';
import { activityUrl, signInAs, stubActivityApi } from '../helpers/studentSession';

const STIMULUS = [
  { kind: 'point', at: [1, 1], label: 'A', color: 'slate' },
  { kind: 'point', at: [4, 1], label: 'B', color: 'slate' },
  { kind: 'point', at: [2, 4], label: 'C', color: 'slate' },
  { kind: 'polygon', vertices: [[1, 1], [4, 1], [2, 4]], filled: false },
  { kind: 'curve', model: { family: 'vertical', x: 0, xTolerance: 0.1 }, style: 'dashed' },
];

/** The lane's document, with `stimulus` set on its plot_point graph. */
function documentWith(stimulus: unknown[]): { document: ReturnType<typeof servedFixtureDocument>; id: string } {
  const document = JSON.parse(JSON.stringify(servedFixtureDocument())) as ReturnType<typeof servedFixtureDocument>;
  let id = '';
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (node === null || typeof node !== 'object') return;
    const rec = node as Record<string, unknown>;
    const interaction = rec.interaction as { type?: string } | undefined;
    if (!id && rec.type === 'interactive_graph' && interaction?.type === 'plot_point') {
      rec.stimulus = stimulus;
      id = rec.id as string;
    }
    Object.values(rec).forEach(walk);
  };
  walk(document.sections);
  if (!id) throw new Error('the served fixture carries no plot_point graph');
  return { document, id };
}

async function boardOf(page: import('@playwright/test').Page, stimulus: unknown[]) {
  const { document, id } = documentWith(stimulus);
  await stubActivityApi(page, { document });
  await signInAs(page);
  await page.goto(activityUrl());
  const board = page.locator(`[data-block-id="${id}"] [data-graph-canvas]`);
  await board.locator('svg').first().waitFor({ timeout: 20_000 });
  return board;
}

/** Shapes JSXGraph drew, by SVG element. Labels are HTML, counted separately. */
async function census(board: import('@playwright/test').Locator) {
  return board.evaluate((el) => ({
    polygons: el.querySelectorAll('svg polygon').length,
    dashed: Array.from(el.querySelectorAll('svg line, svg path')).filter((n) => {
      const d = n.getAttribute('stroke-dasharray');
      return d !== null && d !== '' && d !== 'none';
    }).length,
    // VISIBLE points only: JSXGraph also creates hidden helper points (a
    // polygon's vertices, a segment's ends), which would make a raw count
    // depend on how each shape happens to be built.
    ellipses: Array.from(el.querySelectorAll('svg ellipse')).filter((n) => {
      const cs = getComputedStyle(n);
      return cs.display !== 'none' && cs.visibility !== 'hidden';
    }).length,
    labels: Array.from(el.querySelectorAll('.JXGtext')).map((n) => (n.textContent ?? '').trim()),
  }));
}

test('the live graded board draws the stimulus: shape, labelled points, dashed mirror line', async ({ page }) => {
  const plain = await census(await boardOf(page, []));
  await page.goto('about:blank');
  const withStimulus = await census(await boardOf(page, STIMULUS));

  // The polygon outline, three labelled points, and a dashed line — each
  // counted against the SAME board with no stimulus, so the grid, the axes and
  // the student's own handle cannot satisfy the row.
  expect(withStimulus.polygons).toBe(plain.polygons + 1);
  expect(withStimulus.ellipses).toBe(plain.ellipses + 3);
  expect(withStimulus.dashed).toBeGreaterThan(plain.dashed);
  for (const name of ['A', 'B', 'C']) {
    expect(withStimulus.labels, `label ${name}`).toContain(name);
    expect(plain.labels).not.toContain(name);
  }
});

test('the stimulus is fixed: the student still has exactly the handles the question gives', async ({ page }) => {
  const board = await boardOf(page, STIMULUS);
  // A draggable JSXGraph point takes keyboard focus; fixed ones do not. The
  // plot_point fixture gives the student its own handle(s) and nothing more.
  const focusable = await board.evaluate(
    (el) => el.querySelectorAll('svg ellipse[tabindex="0"]').length,
  );
  const plainBoard = await (async () => {
    await page.goto('about:blank');
    return boardOf(page, []);
  })();
  const plainFocusable = await plainBoard.evaluate(
    (el) => el.querySelectorAll('svg ellipse[tabindex="0"]').length,
  );
  expect(focusable).toBe(plainFocusable);
});

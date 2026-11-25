// =============================================================================
// math-prompt-box.e2e.ts — the answer box around a typed maths answer
// -----------------------------------------------------------------------------
// Found in the author's walkthrough, 2026-11-24: in `12x + 18 = [ ]` the box
// sat LOW against a taller answer. MathLive 0.109.2 placed its outline with a
// fixed offset while the answer grew upward: "6(2x+3)" poked out of the top,
// and a fraction sat 11 px above the box with 12 px of empty box below it.
// 0.111.4 rewrote that layout; this row holds any future MathLive to it.
//
// It measures the answer's glyph boxes (text line boxes, a little taller than
// the ink) against the prompt's outline, inside the field's shadow DOM. Only a
// real browser can say this: jsdom has no layout. Mutation-checked against
// 0.109.2 on the day: it fails at the author's own case, 6(2x+3).
// =============================================================================

import { expect, test, type Page } from '@playwright/test';
import { servedFixtureDocument } from '@activity/viewer/fixtures';
import { activityUrl, signInAs, stubActivityApi } from '../helpers/studentSession';

const GAP = 'b0000000000000000000000000000001';

/** Where the outline is, and where the answer's glyphs are, in page px. */
async function boxAndGlyphs(page: Page, latex: string) {
  return page.evaluate(
    async ([value, gap]) => {
      const mf = document.querySelector('math-field') as HTMLElement & {
        setPromptValue: (id: string, v: string) => void;
        shadowRoot: ShadowRoot;
      };
      const read = () => {
        const sr = mf.shadowRoot;
        const outline = sr.querySelector('.ML__prompt')?.getBoundingClientRect();
        const atom = sr.querySelector('.ML__prompt-atom');
        const answer = atom ? [...atom.children].find((c) => !c.classList.contains('ML__prompt')) : undefined;
        const leaves = answer
          ? [...answer.querySelectorAll('*')].filter((el) => !el.children.length && el.textContent?.trim())
          : [];
        const glyphs = leaves.map((el) => el.getBoundingClientRect());
        return {
          text: leaves.map((el) => el.textContent).join(''),
          box: { top: outline?.top ?? NaN, bottom: outline?.bottom ?? NaN },
          glyphs: { top: Math.min(...glyphs.map((g) => g.top)), bottom: Math.max(...glyphs.map((g) => g.bottom)) },
        };
      };
      const frames = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const before = read().text;
      mf.focus();
      mf.setPromptValue(gap!, value!);
      // MathLive redraws on a later frame, and how much later depends on the
      // machine: a fixed 400 ms sleep measured an empty field on a slow CI
      // runner (2026-11-25). Wait instead until the NEW answer is drawn (its
      // text differs from the last one's; every value below renders
      // differently) and has held still for one more pair of frames.
      const deadline = performance.now() + 5_000;
      let last = read();
      while (performance.now() < deadline) {
        await frames();
        const now = read();
        const settled =
          now.text !== '' &&
          now.text !== before &&
          now.text === last.text &&
          now.box.top === last.box.top &&
          now.box.bottom === last.box.bottom &&
          now.glyphs.top === last.glyphs.top &&
          now.glyphs.bottom === last.glyphs.bottom;
        last = now;
        if (settled) break;
      }
      return last;
    },
    [latex, GAP],
  );
}

test('the answer box surrounds the typed answer, however tall', async ({ page }) => {
  const document = JSON.parse(JSON.stringify(servedFixtureDocument()));
  document.sections[0].rows[0].columns[0].blocks.unshift({
    id: '55555555-0000-4000-8000-000000000001',
    type: 'math_block',
    latex: `12x + 18 = \\placeholder[${GAP}]{}`,
    prompts: [{ id: GAP }],
  });
  await stubActivityApi(page, { document, versionId: 'dddddddd-0000-4000-8000-00000000f002' });
  await signInAs(page);
  await page.goto(activityUrl());
  await expect(page.locator('math-field').first()).toBeVisible();

  // The line boxes of a stacked fraction reach ~2 px past the ink, hence the
  // slack below; 0.109.2 missed by 11 px above and left 12 px empty below.
  for (const latex of ['5', '6\\left(2x+3\\right)', 'x^2', '\\sqrt{x}', '\\frac{1}{2}']) {
    const m = await boxAndGlyphs(page, latex);
    expect(m.text.length, `${latex} rendered`).toBeGreaterThan(0);
    expect(m.glyphs.top, `${latex}: nothing pokes out of the top`).toBeGreaterThanOrEqual(m.box.top - 1);
    expect(m.glyphs.bottom, `${latex}: nothing hangs out of the bottom`).toBeLessThanOrEqual(m.box.bottom + 3);
    expect(m.box.bottom - m.glyphs.bottom, `${latex}: no empty band under the answer`).toBeLessThan(8);
  }
});

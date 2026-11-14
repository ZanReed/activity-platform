// =============================================================================
// form-grading.e2e.ts — "equal, but not in the form" on the real page (D60)
// -----------------------------------------------------------------------------
// docs/design/form-grading.md, Test discipline: one browser lane, bound to
// rendered output. A student who types 18x - 12 for "factorise 18x - 12"
// (key 6(3x - 2), a form blank) sees ✗ AND the built-in line — not a bare ✗,
// which reads as a broken grader.
//
// The check reply is a STUB, so it is derived, not retyped (policy P2): the
// spec runs the REAL grader (scoreBlank + selectBlankOutcome) on the same key
// and the value the page actually sent, and asserts the stub says exactly what
// the server would. Mutation-tested once by removing the feedback line from
// FillInBlank's render and watching the last assertion go red.
// =============================================================================

import { expect, test } from '@playwright/test';
import { servedFixtureDocument } from '@activity/viewer/fixtures';
import { activityUrl, signInAs, stubActivityApi } from '../helpers/studentSession';
import {
  FORM_WRONG_LINE,
  scoreBlank,
  selectBlankOutcome,
  type BlankKey,
} from '../../../viewer/src/server/grading/blanks';

const t = (text: string) => ({ type: 'text', text, marks: [] });
const BLANK = '5f000000-0000-4000-8000-000000000001';

/** The raw key the server would grade against (never served to the page). */
const KEY: BlankKey = {
  id: BLANK,
  answers: ['6(3x-2)'],
  answerType: 'math',
  tolerance: 0,
  equivalence: 'form',
  mistakeFeedback: [],
  hint: undefined,
  interchangeableWithPrevious: false,
};

function documentWithFormBlank() {
  const document = JSON.parse(JSON.stringify(servedFixtureDocument())) as ReturnType<typeof servedFixtureDocument>;
  const section = document.sections[0] as unknown as { rows: unknown[] };
  section.rows = [
    {
      id: '5f000000-0000-4000-8000-000000000101',
      gridLines: 'inherit',
      columns: [
        {
          id: '5f000000-0000-4000-8000-000000000201',
          blocks: [
            {
              id: '5f000000-0000-4000-8000-000000000011',
              type: 'fill_in_blank',
              // As served: the sanitizer strips answer, equivalence and mistakes.
              content: [t('Factorise 18x − 12 fully: '), { type: 'blank', id: BLANK, answerType: 'math' }],
            },
          ],
        },
      ],
    },
    ...section.rows,
  ];
  return document;
}

test('a right value in the wrong form shows ✗ and the built-in line', async ({ page }) => {
  const typed = '18x - 12';
  const verdict = scoreBlank(typed, KEY);
  const outcome = selectBlankOutcome(typed, KEY, verdict);
  // The real grader's reading — what the stub below must reproduce.
  expect(verdict).toBe(false);
  expect(outcome.feedback).toEqual([{ type: 'text', text: FORM_WRONG_LINE }]);

  const api = await stubActivityApi(page, {
    document: documentWithFormBlank(),
    check: {
      verdicts: { [BLANK]: 'incorrect' },
      feedback: { [BLANK]: outcome.feedback as unknown[] },
    },
  });
  await signInAs(page);
  await page.goto(activityUrl());
  const input = page.locator(`[data-blank-id="${BLANK}"] input`);
  await input.fill(typed);
  await page.getByRole('button', { name: 'Check' }).first().click();

  // The value the page sent is the one the grader was run on.
  await expect.poll(() => api.checkRequests.length).toBeGreaterThan(0);
  const sent = (api.checkRequests[0] as { responses: { blanks: Record<string, string> } }).responses.blanks[BLANK];
  expect(sent).toBe(typed);

  const blank = page.locator(`[data-blank-id="${BLANK}"]`);
  await expect(blank.locator('[data-state="incorrect"]')).toBeVisible();
  await expect(blank.locator('[data-feedback="server"]')).toHaveText(FORM_WRONG_LINE);
});

test('the same value in the key’s form, any order, is right (grader parity)', async () => {
  // No page needed: the stub lanes cannot grade, so the right-answer half of
  // the row is pinned on the real grader the stub above is derived from.
  for (const typed of ['6(3x - 2)', '(3x-2)6', '-6(2-3x)']) {
    expect({ typed, verdict: scoreBlank(typed, KEY) }).toEqual({ typed, verdict: true });
  }
});

// =============================================================================
// facts-entry.e2e.ts — /facts/:code, the student's one link (D43 slice 1)
// -----------------------------------------------------------------------------
// Real browser, stubbed backend. The RPC names are the production constants
// (P2); the payload shapes the stubs return are the ones verify-0045 asserts
// the real functions produce. What these rows are for:
//
//   - each entry state has its own screen, and nothing starts by itself;
//   - one link takes a signed-in non-member through joining to the intro;
//   - a full run SAVES after every item, with the server's field names, the
//     baselines on the first save and a finishing call at the end;
//   - a reload resumes (and re-sends what was held on the device);
//   - a check closed under a student goes to the closed screen;
//   - failing saves never interrupt: one quiet line, then recovery;
//   - returning to the tab does NOT re-read the entry or rebuild the run (the
//     no-reload rule).
// =============================================================================

import { expect, test, type Page, type Route } from '@playwright/test';
import { FACT_PROBE_RPC } from '../../src/lib/factProbeRpc';
import { signInAs, stubIdentityApi } from '../helpers/studentSession';

const CODE = 'ABC234';
const PROBE = 'cccccccc-0000-4000-8000-00000000e2e1';

const ITEMS = [
  { n: 1, display: '7 × 8 = __', spoken: 'seven times eight', answer: '56' },
  { n: 2, display: '9 × 6 = __', spoken: 'nine times six', answer: '54' },
  { n: 3, display: '12² = __', spoken: 'twelve squared', answer: '144' },
];

const ready = {
  state: 'ready', probe_id: PROBE, total: ITEMS.length, ceiling_s: 15, saved: 0, next_n: 1,
  counts: { right: 0, skipped: 0, not_counted: 0 },
  baselines: { keyboard: null, keypad: null }, items: ITEMS,
};

interface Backend {
  entry: unknown;
  entryCalls: number;
  saves: { p_attempts: { n: number; typed: string; rt_ms: number; offset_ms: number; skipped: boolean; interrupted: boolean; modality: string | null }[]; p_baselines: { keyboard: number | null; keypad: number | null } | null; p_finished: boolean; p_probe_id: string }[];
  save: (route: Route, body: Backend['saves'][number]) => Promise<void>;
}

async function backend(page: Page, entry: unknown): Promise<Backend> {
  const state: Backend = {
    entry,
    entryCalls: 0,
    saves: [],
    save: async (route) => {
      const savedNs = new Set(state.saves.flatMap((s) => s.p_attempts.map((a) => a.n)));
      await route.fulfill({ json: { state: 'saved', saved: savedNs.size, finished: state.saves.some((s) => s.p_finished) } });
    },
  };
  await page.route(`**/rest/v1/rpc/${FACT_PROBE_RPC.entry}`, async (route) => {
    state.entryCalls += 1;
    await route.fulfill({ json: state.entry });
  });
  await page.route(`**/rest/v1/rpc/${FACT_PROBE_RPC.save}`, async (route) => {
    const body = route.request().postDataJSON() as Backend['saves'][number];
    state.saves.push(body);
    await state.save(route, body);
  });
  return state;
}

/** Type the warm-up through to the "Warm-up done" card, then Start. */
async function warmUp(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Start' }).click();
  const expr = page.locator('.fx-expr');
  for (let i = 0; i < 25; i++) {
    if (await page.getByRole('heading', { name: 'Warm-up done' }).isVisible()) break;
    const shown = (await expr.textContent())!.replace('−', '-');
    await page.waitForTimeout(320);
    await page.keyboard.type(shown);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(150);
  }
  await page.getByRole('button', { name: 'Start' }).click();
}

async function answer(page: Page, text: string): Promise<void> {
  await page.waitForTimeout(320);
  await page.keyboard.type(text);
  await page.keyboard.press('Enter');
}

test('signed out: the link asks for a school sign-in and calls nothing', async ({ page }) => {
  const api = await backend(page, ready);
  await page.goto(`/facts/${CODE}`);
  await expect(page.getByRole('heading', { name: 'Quick number facts' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in with Google' })).toBeVisible();
  expect(api.entryCalls).toBe(0);
});

test('a teacher is told the link is for students, with a way into the demo', async ({ page }) => {
  await stubIdentityApi(page, { role: 'teacher' });
  await signInAs(page);
  await backend(page, { state: 'teacher' });
  await page.goto(`/facts/${CODE}`);
  await expect(page.getByRole('heading', { name: 'This link is for students' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Try the demo' })).toHaveAttribute('href', '/facts/demo');
});

test('a non-member joins from the same link and lands on the intro, which does not start by itself', async ({ page }) => {
  const identity = await stubIdentityApi(page, { role: 'student' });
  await signInAs(page);
  const api = await backend(page, { state: 'not_member' });
  await page.goto(`/facts/${CODE}`);
  await expect(page.getByRole('heading', { name: 'Join this class first' })).toBeVisible();
  await expect(page.getByText(CODE)).toBeVisible();
  api.entry = ready; // what the server says once they are a member
  await page.getByRole('button', { name: 'Join the class and start' }).click();
  await expect(page.getByRole('heading', { name: 'Quick number facts' })).toBeVisible();
  await expect(page.getByText('About 1 minute.')).toBeVisible();
  expect(identity.joinCalls).toBe(1);
  // The intro waits for Start: no fact, no keypad.
  await expect(page.locator('.fx-pad')).toHaveCount(0);
});

test('the waiting room checks again by itself and shows the intro when a check opens', async ({ page }) => {
  await stubIdentityApi(page, { role: 'student' });
  await signInAs(page);
  const api = await backend(page, { state: 'none_open' });
  await page.clock.install();
  await page.goto(`/facts/${CODE}`);
  await expect(page.getByRole('heading', { name: 'Nothing to do yet' })).toBeVisible();
  await expect(page.getByText('This page checks again by itself.')).toBeVisible();
  const before = api.entryCalls;
  api.entry = ready;
  await page.clock.fastForward(11_000);
  await expect(page.getByRole('heading', { name: 'Quick number facts' })).toBeVisible();
  expect(api.entryCalls).toBe(before + 1);
  await expect(page.locator('.fx-pad')).toHaveCount(0);
});

test('a full run saves after every item, sends the baselines first and a finishing call last', async ({ page }) => {
  test.setTimeout(90_000);
  await stubIdentityApi(page, { role: 'student' });
  await signInAs(page);
  const api = await backend(page, ready);
  await page.goto(`/facts/${CODE}`);
  await warmUp(page);
  expect(api.saves).toHaveLength(0); // nothing is saved before the first fact

  await answer(page, '56');
  await expect(page.locator('.fx-expr')).toHaveText('9 × 6 = __');
  await expect.poll(() => api.saves.length).toBe(1);
  const first = api.saves[0]!;
  expect(first.p_probe_id).toBe(PROBE);
  expect(first.p_attempts).toHaveLength(1);
  expect(first.p_attempts[0]).toMatchObject({ n: 1, typed: '56', skipped: false, interrupted: false, modality: 'keyboard', offset_ms: 0 });
  expect(Number.isInteger(first.p_attempts[0]!.rt_ms) && first.p_attempts[0]!.rt_ms >= 300).toBe(true);
  expect(first.p_baselines?.keyboard).toBeGreaterThan(0);
  expect(first.p_baselines?.keypad).toBeNull();
  expect(first.p_finished).toBe(false);

  await page.waitForTimeout(320);
  await page.getByRole('button', { name: 'Skip this one' }).click();
  await answer(page, '144');

  await expect(page.getByRole('heading', { name: 'All done' })).toBeVisible();
  await expect(page.getByText('You got 2 right. You skipped 1.')).toBeVisible();
  await expect(page.getByText('Your answers are saved. This is not marked.')).toBeVisible();
  const sent = api.saves.flatMap((s) => s.p_attempts);
  expect(sent.map((a) => a.n).sort()).toEqual([1, 2, 3]);
  expect(sent.find((a) => a.n === 2)).toMatchObject({ skipped: true, typed: '' });
  expect(api.saves.at(-1)!.p_finished).toBe(true);
  // Nothing is left on the device once saved, and nothing ever in localStorage.
  const held = await page.evaluate(() => [
    Object.keys(sessionStorage).filter((k) => k.includes('facts:')),
    Object.keys(localStorage).filter((k) => k.includes('facts:')),
  ]);
  expect(held).toEqual([[], []]);
  await expect(page.locator('body')).not.toContainText(/probe/i);
});

test('a reload resumes after the last saved item and re-sends what was held on the device', async ({ page }) => {
  test.setTimeout(90_000);
  await stubIdentityApi(page, { role: 'student' });
  await signInAs(page);
  const api = await backend(page, ready);
  await page.goto(`/facts/${CODE}`);
  await warmUp(page);
  await answer(page, '56');
  await expect.poll(() => api.saves.length).toBe(1);

  // The network drops: the second answer is held on the device.
  api.save = async (route) => route.abort('failed');
  await answer(page, '54');
  await expect(page.locator('.fx-expr')).toHaveText('12² = __'); // saving never blocks the next fact
  await expect.poll(async () =>
    page.evaluate(() => Object.keys(sessionStorage).filter((k) => k.startsWith('activity-viewer:facts:')).length),
  ).toBe(1);

  // Reload. The server holds item 1 only.
  const before = api.saves.length;
  api.save = async (route) => {
    await route.fulfill({ json: { state: 'saved', saved: 2, finished: false } });
  };
  api.entry = { ...ready, state: 'resume', saved: 1, next_n: 2, counts: { right: 1, skipped: 0, not_counted: 0 }, baselines: { keyboard: 180, keypad: null } };
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  await expect(page.getByText('You have done 1 of 3. Your answers so far are saved.')).toBeVisible();
  // The held answer goes out without the student doing anything.
  await expect.poll(() => api.saves.slice(before).flatMap((s) => s.p_attempts.map((a) => a.n))).toContain(2);
  // No warm-up again, and it continues where the SERVER says.
  await page.getByRole('button', { name: 'Keep going' }).click();
  await expect(page.locator('.fx-expr')).toHaveText('9 × 6 = __');
});

test('a check closed under the student goes to the closed screen', async ({ page }) => {
  test.setTimeout(90_000);
  await stubIdentityApi(page, { role: 'student' });
  await signInAs(page);
  const api = await backend(page, ready);
  await page.goto(`/facts/${CODE}`);
  await warmUp(page);
  await answer(page, '56');
  await expect.poll(() => api.saves.length).toBe(1);
  api.save = async (route) => {
    await route.fulfill({ json: { state: 'closed', saved: 1, finished: false } });
  };
  await answer(page, '54');
  await expect(page.getByRole('heading', { name: 'Your teacher has finished this' })).toBeVisible();
  await expect(page.getByText('Your 1 answer was saved.')).toBeVisible();
});

test('failing saves never interrupt: one quiet line after ten seconds, and the done screen offers a retry', async ({ page }) => {
  test.setTimeout(120_000);
  await stubIdentityApi(page, { role: 'student' });
  await signInAs(page);
  const api = await backend(page, ready);
  api.save = async (route) => route.abort('failed');
  await page.goto(`/facts/${CODE}`);
  await warmUp(page);
  await answer(page, '56');
  await expect(page.locator('.fx-expr')).toHaveText('9 × 6 = __');
  await expect(page.locator('.fx-savenote')).toHaveText('');
  await expect(page.locator('.fx-savenote')).toHaveText(
    'Not connected. Keep going; your answers are kept on this device.',
    { timeout: 15_000 },
  );
  await answer(page, '54');
  await answer(page, '144');
  await expect(page.getByRole('heading', { name: 'All done' })).toBeVisible();
  await expect(page.getByText(/We could not save your last 3 answers/)).toBeVisible();
  // The connection returns; "Try now" settles it.
  api.save = async (route) => {
    await route.fulfill({ json: { state: 'saved', saved: 3, finished: true } });
  };
  await page.getByRole('button', { name: 'Try now' }).click();
  await expect(page.getByText('Your answers are saved. This is not marked.')).toBeVisible();
});

test('returning to the tab pauses the fact but never re-reads the entry or rebuilds the run', async ({ page }) => {
  test.setTimeout(90_000);
  await stubIdentityApi(page, { role: 'student' });
  await signInAs(page);
  const api = await backend(page, ready);
  await page.goto(`/facts/${CODE}`);
  await warmUp(page);
  await answer(page, '56');
  const calls = api.entryCalls;
  expect(calls).toBeGreaterThan(0); // anti-vacuity: the counter sees the entry read
  await expect(page.locator('.fx-expr')).toHaveText('9 × 6 = __');
  await page.waitForTimeout(400); // item 2 is on screen and its clock is running
  // The page is hidden and comes back (supabase-js re-announces the session).
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    document.dispatchEvent(new Event('visibilitychange', { bubbles: true }));
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
    document.dispatchEvent(new Event('visibilitychange', { bubbles: true }));
  });
  await expect(page.getByRole('heading', { name: 'Paused' })).toBeVisible();
  await page.waitForTimeout(600);
  expect(api.entryCalls).toBe(calls);
  await page.getByRole('button', { name: 'Keep going' }).click();
  // The interrupted fact (item 2) is not asked again: item 3 is next.
  await expect(page.locator('.fx-expr')).toHaveText('12² = __');
});

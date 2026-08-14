// =============================================================================
// content-surface.e2e.ts — S9 Drop 2: share → student-sees, end to end
// -----------------------------------------------------------------------------
// The eng test plan's e2e rows for the content surface: share→student-sees,
// unshare→gone, double-click-once (the disabled-while-busy guard), the
// unpublished-refusal copy, and the join-gate name (+ its meta-fetch-fails
// silent fallback, DR-4/DR-6).
//
// ONE STATEFUL SERVER STUB spans both personas: the share/unshare RPC stubs
// mutate an in-memory row set, and the student's list RPC + the teacher's
// class_activities read derive from it — so "the student sees what the
// teacher added" is a real assertion about the wiring, not two disconnected
// fixtures. Paths derive from the production constants (P2); the RPC error
// is the 0030 raise text PostgREST-shaped, never retyped copy.
// =============================================================================

import { expect, test, type Page } from '@playwright/test';
import {
  LIST_CLASS_ACTIVITIES_RPC,
  SHARE_ACTIVITY_RPC,
  UNSHARE_ACTIVITY_RPC,
} from '../../src/lib/edgeFunctions';
import {
  signInAs,
  stubIdentityApi,
  E2E_ACTIVITY_ID,
} from '../helpers/studentSession';

const TEACHER_ID = 'dddddddd-0000-4000-8000-00000000e2e9';
const STUDENT_ID = 'dddddddd-0000-4000-8000-00000000e2e1';
const CLASS_ID = 'cccccccc-0000-4000-8000-00000000e2e1';
const CLASS_NAME = 'Algebra I — Period 3';
const JOIN_CODE = 'QX7M2P';
const ACTIVITY_TITLE = 'Linear equations practice';

interface SurfaceState {
  /** activity ids currently shared to the class. */
  shared: string[];
  shareCalls: number;
  /** next share outcome: null = success, string = raise text. */
  refuseWith: string | null;
  /** Artificial share latency — REQUIRED by the double-click row (the
   * identity harness's lesson, verbatim): an INSTANT stub has no in-flight
   * window for the disabled-while-busy guard to guard, so under parallel-run
   * timing the second click can land on a legitimately re-enabled button. */
  shareDelayMs: number;
}

/** The whole content-surface server, derived from one mutable state. */
async function stubSurface(page: Page, state: SurfaceState): Promise<void> {
  const wantsObject = (accept: string | undefined) =>
    (accept ?? '').includes('pgrst.object');

  await page.route('**/rest/v1/classes**', async (route) => {
    const row = {
      id: CLASS_ID,
      name: CLASS_NAME,
      join_code: JOIN_CODE,
      expected_domain: null,
      age_assertion_at: new Date().toISOString(),
      assertion_text_version: 'e2e',
      created_at: new Date().toISOString(),
    };
    await route.fulfill({
      json: wantsObject(route.request().headers()['accept']) ? row : [row],
    });
  });

  await page.route('**/rest/v1/class_activities**', async (route) => {
    await route.fulfill({
      json: state.shared.map((id) => ({
        class_id: CLASS_ID,
        activity_id: id,
        added_at: new Date().toISOString(),
        activities: {
          title: ACTIVITY_TITLE,
          status: 'published',
          deleted_at: null,
          current_version_id: 'bbbbbbbb-0000-4000-8000-00000000e2e1',
        },
      })),
    });
  });

  await page.route('**/rest/v1/activities**', async (route) => {
    await route.fulfill({
      json: [
        {
          id: E2E_ACTIVITY_ID,
          title: ACTIVITY_TITLE,
          current_version: { created_at: new Date().toISOString() },
        },
      ],
    });
  });

  await page.route(`**/rest/v1/rpc/${SHARE_ACTIVITY_RPC}`, async (route) => {
    state.shareCalls += 1;
    if (state.shareDelayMs) {
      await new Promise((r) => setTimeout(r, state.shareDelayMs));
    }
    if (state.refuseWith) {
      // PostgREST surfaces a raise as a 400 whose message is the raise text.
      await route.fulfill({
        status: 400,
        json: { code: 'P0001', message: state.refuseWith, details: null, hint: null },
      });
      return;
    }
    const body = route.request().postDataJSON() as { p_activity_id: string };
    if (!state.shared.includes(body.p_activity_id)) {
      state.shared.push(body.p_activity_id);
    }
    await route.fulfill({ json: null });
  });

  await page.route(`**/rest/v1/rpc/${UNSHARE_ACTIVITY_RPC}`, async (route) => {
    const body = route.request().postDataJSON() as { p_activity_id: string };
    state.shared = state.shared.filter((id) => id !== body.p_activity_id);
    await route.fulfill({ json: null });
  });

  await page.route(`**/rest/v1/rpc/${LIST_CLASS_ACTIVITIES_RPC}`, async (route) => {
    await route.fulfill({
      json: state.shared.map((id) => ({
        class_id: CLASS_ID,
        activity_id: id,
        title: ACTIVITY_TITLE,
        added_at: new Date().toISOString(),
      })),
    });
  });
}

function freshState(): SurfaceState {
  return { shared: [], shareCalls: 0, refuseWith: null, shareDelayMs: 0 };
}

async function openPanel(page: Page): Promise<void> {
  await page.goto('/classes');
  await page.getByRole('button', { name: /Activities \(\d+\)/ }).click();
}

test.describe('teacher share surface (board 3a/3b)', () => {
  test('share → row appears; unshare → gone; the STUDENT list mirrors both', async ({
    page,
    context,
  }) => {
    const state = freshState();
    await signInAs(page, { userId: TEACHER_ID });
    await stubIdentityApi(page, { role: 'teacher' });
    await stubSurface(page, state);

    await openPanel(page);
    await expect(page.getByText('No activities yet', { exact: false })).toBeVisible();

    await page.getByLabel('Choose a published activity').selectOption(E2E_ACTIVITY_ID);
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await expect(
      page.locator('li', { hasText: ACTIVITY_TITLE }).getByRole('button', { name: 'Remove' }),
    ).toBeVisible();
    expect(state.shared).toEqual([E2E_ACTIVITY_ID]);

    // THE MIRROR: a student session (separate page, same stub state) sees the
    // row on Home — the DR-1 verification affordance made literal.
    const studentPage = await context.newPage();
    await signInAs(studentPage, { userId: STUDENT_ID });
    await stubIdentityApi(studentPage, {
      role: 'student',
      classes: [{ classId: CLASS_ID, name: CLASS_NAME, joinedAt: new Date().toISOString() }],
    });
    await stubSurface(studentPage, state);
    await studentPage.goto('/');
    await expect(studentPage.getByRole('heading', { name: CLASS_NAME })).toBeVisible();
    await expect(
      studentPage.getByRole('link', { name: new RegExp(ACTIVITY_TITLE) }),
    ).toBeVisible();

    // unshare → gone on both sides
    await page.getByRole('button', { name: 'Remove' }).click();
    // exact:true — the sr-only announcement region carries the same sentence
    // plus "Undo available." and would otherwise double-match.
    await expect(
      page.getByText(`“${ACTIVITY_TITLE}” removed.`, { exact: true }),
    ).toBeVisible();
    await studentPage.reload();
    await expect(studentPage.getByRole('heading', { name: CLASS_NAME })).toBeVisible();
    await expect(
      studentPage.getByText("Nothing here yet — your teacher hasn't added activities."),
    ).toBeVisible();
    await studentPage.close();
  });

  test('double-click Adds ONCE (disabled while in flight)', async ({ page }) => {
    const state = freshState();
    state.shareDelayMs = 400; // hold the in-flight window open for click #2
    await signInAs(page, { userId: TEACHER_ID });
    await stubIdentityApi(page, { role: 'teacher' });
    await stubSurface(page, state);

    await openPanel(page);
    await page.getByLabel('Choose a published activity').selectOption(E2E_ACTIVITY_ID);
    const add = page.getByRole('button', { name: /^Add/ });
    // Two immediate clicks — the second lands on a disabled "Adding…" button.
    await add.click();
    await add.click({ force: true }).catch(() => {});
    await expect(
      page.locator('li', { hasText: ACTIVITY_TITLE }).getByRole('button', { name: 'Remove' }),
    ).toBeVisible();
    expect(state.shareCalls).toBe(1);
  });

  test('the unpublished race renders the honest refusal copy (DR-9f)', async ({ page }) => {
    const state = freshState();
    state.refuseWith = 'Activity is not published';
    await signInAs(page, { userId: TEACHER_ID });
    await stubIdentityApi(page, { role: 'teacher' });
    await stubSurface(page, state);

    await openPanel(page);
    await page.getByLabel('Choose a published activity').selectOption(E2E_ACTIVITY_ID);
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await expect(
      page.getByText("This activity can't be added — it's no longer published", {
        exact: false,
      }),
    ).toBeVisible();
  });
});

test.describe('join gate name (board 4c, DR-4/DR-6)', () => {
  test('the class name fills the reserved title slot; the chip stays', async ({ page }) => {
    await page.route('**/functions/v1/get-activity*', async (route) => {
      const url = new URL(route.request().url());
      if (url.searchParams.get('join_code') === JOIN_CODE) {
        await route.fulfill({ json: { api_version: 1, class_name: CLASS_NAME } });
        return;
      }
      await route.fulfill({ status: 404, json: { error: 'Not available' } });
    });
    await page.goto(`/join/${JOIN_CODE}`);
    await expect(page.getByRole('heading', { name: CLASS_NAME })).toBeVisible();
    await expect(page.getByText(JOIN_CODE)).toBeVisible();
  });

  test('meta fetch failure keeps the SILENT neutral state (no warning, gate works)', async ({
    page,
  }) => {
    await page.route('**/functions/v1/get-activity*', (route) =>
      route.abort('internetdisconnected'),
    );
    await page.goto(`/join/${JOIN_CODE}`);
    await expect(page.getByRole('heading', { name: 'Join your class' })).toBeVisible();
    await expect(page.getByText(/doesn't match a class/)).toBeHidden();
    await expect(page.getByRole('button', { name: 'Sign in with Google' })).toBeEnabled();
  });

  test('a DEFINITIVE no-such-class warns BEFORE OAuth, sign-in stays enabled (DR-6)', async ({
    page,
  }) => {
    await page.route('**/functions/v1/get-activity*', (route) =>
      route.fulfill({ status: 404, json: { error: 'Not available' } }),
    );
    await page.goto(`/join/${JOIN_CODE}`);
    await expect(page.getByRole('heading', { name: 'Join your class' })).toBeVisible();
    await expect(
      page.getByText("This code doesn't match a class — double-check it with your teacher."),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in with Google' })).toBeEnabled();
  });
});

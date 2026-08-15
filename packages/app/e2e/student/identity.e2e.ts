// =============================================================================
// identity.e2e.ts — the identity-slice rows (plan §4 step 5; s1:9's idle proof)
// -----------------------------------------------------------------------------
// Student lane: faked storage session + stubbed PostgREST/RPC (see
// stubIdentityApi — shapes derive from authContract.json, P2). What these
// rows CANNOT prove — the real OAuth round-trip and the real trigger — lives
// in the author runbook's probes and verify-0027.
// =============================================================================
import { test, expect } from '@playwright/test';
import {
  E2E_STUDENT_ID,
  signInAs,
  stubIdentityApi,
  joinUrl,
} from '../helpers/studentSession';
import { SIGN_IN_FAILED_COPY, JOIN_ERROR_COPY, LANDING_COPY } from '../../src/lib/authMessages';

const SUPABASE_URL = 'http://127.0.0.1:54321';
const CODE = 'QX7M2P';

test.describe('role-branched Home (B12/E-4)', () => {
  test('a student lands on the student shell, never the teacher card', async ({ page }) => {
    await signInAs(page, { userId: E2E_STUDENT_ID, supabaseUrl: SUPABASE_URL });
    await stubIdentityApi(page, { role: 'student' });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Join your first class' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'My activities' })).toHaveCount(0);
  });

  test('REGRESSION: a teacher still gets the unchanged teacher Home', async ({ page }) => {
    await signInAs(page, { userId: E2E_STUDENT_ID, supabaseUrl: SUPABASE_URL });
    await stubIdentityApi(page, { role: 'teacher' });
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'My activities' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'My classes' })).toBeVisible();
  });

  test('zero users row → the account-unavailable state, not a spinner (E-11)', async ({ page }) => {
    await signInAs(page, { userId: E2E_STUDENT_ID, supabaseUrl: SUPABASE_URL });
    await stubIdentityApi(page, { role: 'none' });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: "This account isn't active" })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();
  });

  test('a joined student sees classes first, join second (board 1a)', async ({ page }) => {
    await signInAs(page, { userId: E2E_STUDENT_ID, supabaseUrl: SUPABASE_URL });
    await stubIdentityApi(page, {
      role: 'student',
      classes: [{ classId: 'c-1', name: 'Algebra I — Period 3', joinedAt: '2026-08-12T00:00:00Z' }],
    });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Your classes' })).toBeVisible();
    await expect(page.getByText('Algebra I — Period 3')).toBeVisible();
  });
});

test.describe('/join/:code (B12/E-9/P2-ruling)', () => {
  test('signed-out gate echoes the code — the code survives because it IS the URL', async ({ page }) => {
    await page.goto(joinUrl(CODE));
    await expect(page.getByText(CODE)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in with Google' })).toBeVisible();
  });

  test('a student auto-joins EXACTLY once and lands on the success card', async ({ page }) => {
    await signInAs(page, { userId: E2E_STUDENT_ID, supabaseUrl: SUPABASE_URL });
    const control = await stubIdentityApi(page, {
      role: 'student',
      joined: { classId: 'c-1', name: 'Algebra I — Period 3' },
    });
    await page.goto(joinUrl(CODE));
    await expect(page.getByRole('heading', { name: /You(’|')re in/ })).toBeVisible();
    await expect(page.getByText('Algebra I — Period 3')).toBeVisible();
    // The quiet undo line (P2) and the single-fire guard.
    await expect(page.getByText('Wrong class? Ask your teacher to remove you.')).toBeVisible();
    expect(control.joinCalls).toBe(1);
  });

  test('a TEACHER gets the explanatory screen and join_class is never called (E-9)', async ({ page }) => {
    await signInAs(page, { userId: E2E_STUDENT_ID, supabaseUrl: SUPABASE_URL });
    const control = await stubIdentityApi(page, { role: 'teacher' });
    await page.goto(joinUrl(CODE));
    await expect(
      page.getByRole('heading', { name: 'Join links are for student accounts' }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open Classes' })).toBeVisible();
    expect(control.joinCalls).toBe(0);
  });

  test('a refused join renders the classified copy, not the wire string', async ({ page }) => {
    await signInAs(page, { userId: E2E_STUDENT_ID, supabaseUrl: SUPABASE_URL });
    await stubIdentityApi(page, { role: 'student', join: 'badCode' });
    await page.goto(joinUrl(CODE));
    await expect(page.getByText(JOIN_ERROR_COPY.bad_code)).toBeVisible();
  });
});

test.describe('join form on the student Home (board 1b + OV#1/#7)', () => {
  test('a bad code shows the copy inline with the CODE PRESERVED; double-submit fires one RPC', async ({ page }) => {
    await signInAs(page, { userId: E2E_STUDENT_ID, supabaseUrl: SUPABASE_URL });
    const control = await stubIdentityApi(page, { role: 'student', join: 'badCode', joinDelayMs: 400 });
    await page.goto('/');
    const input = page.getByLabel('Class code');
    await input.fill('zz zz zz'); // paste tolerance: uppercased, spaces stripped
    await expect(input).toHaveValue('ZZZZZZ');
    const join = page.getByRole('button', { name: 'Join' });
    // Two rapid activations — the in-flight disable must hold it to one call.
    await join.click();
    await join.click({ force: true }).catch(() => undefined);
    await expect(page.getByText(JOIN_ERROR_COPY.bad_code)).toBeVisible();
    await expect(input).toHaveValue('ZZZZZZ');
    expect(control.joinCalls).toBe(1);

    // Recovery: the same form joins successfully without a reload — the
    // input clears and the error goes away (the stubbed class list stays
    // empty, so the empty-state hero remains the correct screen).
    control.setJoin('ok');
    await join.click();
    await expect(input).toHaveValue('');
    await expect(page.getByText(JOIN_ERROR_COPY.bad_code)).toHaveCount(0);
    expect(control.joinCalls).toBe(2);
  });
});

test.describe('sign-in-failed frames (E-7/P1/P3)', () => {
  test('a callback error on /join renders the school-account frame (query form)', async ({ page }) => {
    await page.goto(`${joinUrl(CODE)}?error=server_error&error_description=Database+error+saving+new+user`);
    await expect(page.getByRole('heading', { name: SIGN_IN_FAILED_COPY.title })).toBeVisible();
    await expect(page.getByText(/Choose the account that ends in/)).toBeVisible();
  });

  test('hash-form callback errors parse too (OV mechanical #3)', async ({ page }) => {
    await page.goto(`${joinUrl(CODE)}#error=access_denied&error_description=refused`);
    await expect(page.getByRole('heading', { name: SIGN_IN_FAILED_COPY.title })).toBeVisible();
  });

  test('Home renders the GENERIC frame — no school-account guidance for the shared entry (P3)', async ({ page }) => {
    await page.goto('/?error=server_error&error_description=whatever');
    await expect(page.getByRole('heading', { name: SIGN_IN_FAILED_COPY.title })).toBeVisible();
    await expect(page.getByText(/Choose the account that ends in/)).toHaveCount(0);
  });
});

test.describe('idle sign-out wiring (s1:9 / D-10 — the C2 gate proof)', () => {
  test('idle → prompt banner → escalation signs out with the explanation banner', async ({ page }) => {
    await page.clock.install();
    await signInAs(page, { userId: E2E_STUDENT_ID, supabaseUrl: SUPABASE_URL });
    await stubIdentityApi(page, { role: 'student' });
    await page.route('**/auth/v1/logout**', (route) => route.fulfill({ status: 204, body: '' }));
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Join your first class' })).toBeVisible();

    // 30 idle minutes → the prompt (production values — P3 the policy).
    await page.clock.fastForward('30:30');
    await expect(page.getByText(/Still there\?/)).toBeVisible();

    // 2 more silent minutes → escalation: signed out, with the why.
    // The landed-on surface is now the R5-DR pre-auth fork, not the old lone
    // "Sign in to continue" button (P5: this assertion was FLIPPED to the
    // surface that replaced it, not deleted — it still proves the escalation
    // reaches a signed-out screen, and now also that the explanation survived
    // the move onto the landing).
    await page.clock.fastForward('02:30');
    await expect(page.getByLabel(LANDING_COPY.codeLabel)).toBeVisible();
    await expect(
      page.getByRole('button', { name: LANDING_COPY.teacherAction }),
    ).toBeVisible();
    await expect(
      page.getByText('You were signed out after being away. Your work is saved.'),
    ).toBeVisible();
  });
});

test.describe('remove-student dialog (B14 + design 5a/5b)', () => {
  async function openRoster(page: import('@playwright/test').Page) {
    await signInAs(page, { userId: E2E_STUDENT_ID, supabaseUrl: SUPABASE_URL });
    await stubIdentityApi(page, { role: 'teacher' });
    await page.route('**/rest/v1/classes**', (route) =>
      route.fulfill({
        json: [{
          id: 'c-1', name: 'Algebra I', join_code: CODE, expected_domain: null,
          age_assertion_at: '2026-07-28T00:00:00Z',
          assertion_text_version: 'v', created_at: '2026-07-28T00:00:00Z',
        }],
      }),
    );
    await page.route('**/rest/v1/rpc/list_class_members', (route) =>
      route.fulfill({
        json: [{
          student_id: 's-1', display_name: 'Jordan P.', email: 'jordan@school.org',
          joined_at: '2026-08-12T00:00:00Z', removed_at: null,
        }],
      }),
    );
    await page.route('**/rest/v1/class_members**', (route) => {
      if (route.request().method() === 'PATCH') return route.fulfill({ json: [] });
      return route.fulfill({ json: [] });
    });
    await page.route('**/rest/v1/rpc/regenerate_join_code', (route) =>
      route.fulfill({ json: { join_code: 'R8KD4N' } }),
    );
    await page.goto('/classes');
    await page.getByRole('button', { name: 'Roster' }).click();
    await page.getByRole('button', { name: 'Remove' }).click();
  }

  test('two explicit actions, no default; Escape cancels; plain remove closes silently', async ({ page }) => {
    await openRoster(page);
    const dialog = page.getByRole('dialog');
    // aria-labels keep the accessible names clean of the consequence sublines.
    await expect(dialog.getByRole('button', { name: 'Remove', exact: true })).toBeFocused();
    await expect(
      dialog.getByRole('button', { name: 'Remove and get a new class code', exact: true }),
    ).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);

    await page.getByRole('button', { name: 'Remove', exact: true }).click();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Remove', exact: true })
      .click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('remove-and-regenerate ends on the after-state with the NEW code (OV#2)', async ({ page }) => {
    await openRoster(page);
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Remove and get a new class code', exact: true })
      .click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Jordan P. removed')).toBeVisible();
    await expect(dialog.getByText('The old link no longer works', { exact: false })).toBeVisible();
    await expect(dialog.getByText('R8KD4N')).toBeVisible();
    await dialog.getByRole('button', { name: 'Done' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
});

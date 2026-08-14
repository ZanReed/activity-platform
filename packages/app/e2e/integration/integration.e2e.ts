// =============================================================================
// integration/integration.e2e.ts — the anti-stub lane (S9 Drop 5, D-11/E-5)
// -----------------------------------------------------------------------------
// Everything the stub lanes CANNOT prove, against `supabase start`: the real
// signup trigger minting roles (email+password users — admin-minted sessions
// would bypass the trigger and recreate stub-blindness, E-5's rejection),
// real RLS, the real join_class / publish_activity / share RPCs (0030
// included, so every lane run is also a local apply-proof of the newest
// migration via the per-run `supabase db reset`), and one REAL check-activity
// round trip — the A1 bug class: the app POSTing to a function that never
// existed was invisible to every stub because the stub was derived from the
// same wrong name (P2's founding failure).
//
// LOCAL-ONLY (DX P6): needs Docker + the supabase CLI; the preflight in
// stack.ts fails with NAMED fixes on a cold machine. CI adoption is a TODOS
// entry with a trigger. Run with `pnpm --filter @activity/app
// test:e2e:integration`.
// =============================================================================

import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';
import { expect, test, type Page } from '@playwright/test';
import {
  ActivityDocument,
  createBlankToken,
  createEmptyDocument,
  createFillInBlankBlock,
} from '@activity/schema';
import { supabaseStorageKey } from '../helpers/studentSession';
import {
  INT_OUTSIDER,
  INT_STUDENT,
  INT_TEACHER,
  LOCAL_ANON_KEY,
  LOCAL_SUPABASE_URL,
} from './contract';
import { preflightAndReset, seedAdmission } from './stack';

test.describe.configure({ mode: 'serial' });

// The world this file builds once and every row reads:
let teacher: { client: SupabaseClient; session: Session };
let student: { client: SupabaseClient; session: Session };
let joinCode: string;
let className: string;
let activityId: string;

function anonClient(): SupabaseClient {
  return createClient(LOCAL_SUPABASE_URL, LOCAL_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Real signup through the REAL trigger; returns a signed-in client. The
 * local stack auto-confirms email signups (CLI default), so signUp yields a
 * session directly — if it doesn't, the named fix says what to change. */
async function signUpAndIn(creds: {
  email: string;
  password: string;
}): Promise<{ client: SupabaseClient; session: Session }> {
  const client = anonClient();
  const { error: signUpError } = await client.auth.signUp(creds);
  if (signUpError) throw signUpError;
  const { data, error } = await client.auth.signInWithPassword(creds);
  if (error || !data.session) {
    throw new Error(
      `signInWithPassword failed for ${creds.email}: ${error?.message ?? 'no session'}.\n` +
        '  FIX: local email signups must auto-confirm — ensure supabase/config.toml has no [auth.email] enable_confirmations=true override, then `supabase stop && supabase start`.',
    );
  }
  return { client, session: data.session };
}

/** Put a GENUINE local-stack session where the app's supabase-js reads it —
 * the signInAs mechanism, but with a real JWT instead of a fake one. */
async function useSession(page: Page, session: Session): Promise<void> {
  await page.addInitScript(
    ([key, value]) => {
      window.localStorage.setItem(key as string, value as string);
    },
    [supabaseStorageKey(LOCAL_SUPABASE_URL), JSON.stringify(session)] as const,
  );
}

/** One checkable worksheet: a single section with one text blank, answer 4. */
function checkableDoc(): unknown {
  const doc = createEmptyDocument({ title: 'Integration check' });
  const blank = createFillInBlankBlock();
  blank.content = [
    { type: 'text', text: 'x = ', marks: [] },
    createBlankToken('4'),
  ];
  doc.sections[0]!.rows = [
    {
      id: crypto.randomUUID(),
      gridLines: 'inherit',
      columns: [{ id: crypto.randomUUID(), blocks: [blank] }],
    },
  ];
  return ActivityDocument.parse(doc);
}

test.beforeAll(async () => {
  test.setTimeout(360_000); // db reset downloads nothing but replays 30 migrations

  const stack = preflightAndReset();
  await seedAdmission(stack);

  // Edge Functions must be served for the check round trip. Recent CLIs serve
  // them as part of `supabase start`; older setups need the extra command.
  const fnProbe = await fetch(
    `${LOCAL_SUPABASE_URL}/functions/v1/get-activity?activity_id=x&meta=1`,
  ).catch(() => null);
  if (!fnProbe || fnProbe.status === 404 || fnProbe.status >= 500) {
    throw new Error(
      `\n[integration lane] the local stack is not serving Edge Functions (probe status ${fnProbe?.status ?? 'unreachable'}).\n` +
        '  FIX: upgrade the supabase CLI (`brew upgrade supabase`) — recent versions serve functions with `supabase start`; or run `supabase functions serve` in another terminal.',
    );
  }

  // The REAL trigger decides all three fates.
  teacher = await signUpAndIn(INT_TEACHER);
  student = await signUpAndIn(INT_STUDENT);
});

test('the real trigger mints roles — and refuses the outsider (nothing here is vacuous)', async () => {
  const roleOf = async (who: { client: SupabaseClient }) => {
    const { data, error } = await who.client
      .from('users')
      .select('role')
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as { role?: string } | null)?.role;
  };
  expect(await roleOf(teacher)).toBe('teacher');
  expect(await roleOf(student)).toBe('student');

  // The negative branch: neither allowlisted nor in-domain → the trigger
  // raises, GoTrue rolls the signup back and reports its generic wire text —
  // the exact behavior Probe 2 recorded in production.
  const { error } = await anonClient().auth.signUp(INT_OUTSIDER);
  expect(error, 'the outsider signup must be refused').not.toBeNull();
  expect(error!.message).toMatch(/Database error/i);
});

test('a teacher makes a class + publishes + shares; a student joins through the REAL join_class', async ({
  page,
}) => {
  // -- teacher side, all real RPCs (0027 + 0003 + 0030) ----------------------
  const { data: cls, error: classError } = await teacher.client.rpc('create_class', {
    p_name: 'Integration Period 1',
    p_expected_domain: null,
    p_assertion_text_version: 'integration-lane',
  });
  if (classError) throw new Error(classError.message);
  const classRow = cls as { id: string; name: string; join_code: string };
  joinCode = classRow.join_code;
  className = classRow.name;

  const { data: inserted, error: insertError } = await teacher.client
    .from('activities')
    .insert({
      owner_id: teacher.session.user.id,
      title: 'Integration check',
      slug: `integration-check-${Date.now()}`,
      draft_content: checkableDoc(),
    })
    .select('id')
    .single();
  if (insertError) throw new Error(insertError.message);
  activityId = (inserted as { id: string }).id;

  const { error: publishError } = await teacher.client.rpc('publish_activity', {
    p_activity_id: activityId,
  });
  if (publishError) throw new Error(publishError.message);

  const { error: shareError } = await teacher.client.rpc('share_activity_to_class', {
    p_class_id: classRow.id,
    p_activity_id: activityId,
  });
  if (shareError) throw new Error(shareError.message);

  // -- the teacher's OWN shell routes by the real role -----------------------
  await useSession(page, teacher.session);
  await page.goto('/');
  await expect(
    page.getByRole('link', { name: 'Activities', exact: true }),
  ).toBeVisible();

  // -- student side: the join deep link, end to end --------------------------
  const studentPage = await page.context().newPage();
  await useSession(studentPage, student.session);
  await studentPage.goto(`/join/${joinCode}`);
  await expect(studentPage.getByText('You’re in ✓')).toBeVisible({
    timeout: 15_000,
  });
  await expect(studentPage.getByText(className)).toBeVisible();

  // Home shows the class AND the shared activity — the real
  // list_class_activities round trip (0030's E-6 shape, live).
  await studentPage.getByRole('button', { name: 'Go to your classes' }).click();
  await expect(
    studentPage.getByRole('heading', { name: className }),
  ).toBeVisible();
  await expect(
    studentPage.getByRole('link', { name: /Integration check/ }),
  ).toBeVisible();
  await studentPage.close();
});

test('one REAL check round trip — the A1 class of bug can never hide again', async ({
  page,
}) => {
  await useSession(page, student.session);
  await page.goto(`/a/${activityId}`);
  const blank = page.locator('[data-section-id] input[type="text"]').first();
  await blank.waitFor({ timeout: 20_000 });
  await blank.fill('4');
  await page.getByRole('button', { name: 'Check', exact: true }).first().click();

  // The verdict comes back from the REAL check-activity function, through the
  // real grading engine, against the real stored version. No stub anywhere.
  await expect(page.locator('[data-section-phase="checked"]').first()).toBeVisible({
    timeout: 20_000,
  });
  await expect(
    page.locator('.viewer-section__status[aria-live="polite"]').first(),
  ).toHaveText(/Checked/);
});

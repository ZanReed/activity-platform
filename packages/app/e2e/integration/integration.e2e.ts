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
  INT_PENDING_STUDENT,
  INT_PENDING_TEACHER,
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

  // Called for its effects (preflight with named fixes, then a full db reset);
  // the returned handle is no longer needed now that seeding goes through the
  // CLI as postgres rather than PostgREST as the service role.
  preflightAndReset();
  await seedAdmission();

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

const roleOf = async (who: { client: SupabaseClient }) => {
  const { data, error } = await who.client.from('users').select('role').maybeSingle();
  if (error) throw new Error(error.message);
  return (data as { role?: string } | null)?.role;
};

test('the real trigger mints all THREE fates (nothing here is vacuous)', async () => {
  expect(await roleOf(teacher)).toBe('teacher');
  expect(await roleOf(student)).toBe('student');

  // The third branch, REWRITTEN AT 0033 (P5 audit — this row asserted a
  // REFUSAL until self-serve admission landed). An email that is neither
  // allowlisted nor in-domain is no longer rejected by the trigger: it is
  // admitted into the contained `pending` role, and two audited RPCs promote
  // it. The negative branch has not disappeared — it MOVED to the RPCs, where
  // the refusal text can actually reach a browser, and it is proven by the
  // refused-redeem row below plus verify-0033's five containment rows.
  const outsider = await signUpAndIn(INT_OUTSIDER);
  expect(await roleOf(outsider), 'the outsider is admitted CONTAINED').toBe('pending');
});

test('a pending account redeems a real code: promoted + joined in one call', async () => {
  const pending = await signUpAndIn(INT_PENDING_STUDENT);
  expect(await roleOf(pending)).toBe('pending');

  // Fixture: a class owned by the (allowlisted, cap-exempt) teacher.
  const { data: created, error: createErr } = await teacher.client.rpc('create_class', {
    p_name: 'Redeem lane class',
    p_expected_domain: null,
    p_assertion_text_version: 'integration-lane',
  });
  if (createErr) throw new Error(createErr.message);
  const code = (created as { join_code: string }).join_code;

  // REFUSED first, so the happy path below cannot be vacuous: a bad code must
  // leave the caller pending, not half-promoted.
  const bad = await pending.client.rpc('redeem_join_code', { p_join_code: 'ZZZZZZ' });
  expect(bad.error, 'a bad code must refuse').not.toBeNull();
  expect(await roleOf(pending), 'a refusal must not promote').toBe('pending');

  // The real thing: promote + join, one audited call.
  const { data: joined, error: redeemErr } = await pending.client.rpc('redeem_join_code', {
    p_join_code: code,
  });
  if (redeemErr) throw new Error(redeemErr.message);
  expect((joined as { class_name: string }).class_name).toBe('Redeem lane class');
  expect(await roleOf(pending), 'redeem promotes to student').toBe('student');

  // Idempotent: re-redeeming is a no-op, not a duplicate membership or an error.
  const again = await pending.client.rpc('redeem_join_code', { p_join_code: code });
  expect(again.error).toBeNull();
});

test('a pending account claims teacher — attestation required, and the cap is REAL', async () => {
  const claimer = await signUpAndIn(INT_PENDING_TEACHER);
  expect(await roleOf(claimer)).toBe('pending');

  // Attestation is not optional: the RPC refuses an empty version.
  const noAttest = await claimer.client.rpc('claim_teacher', { p_attestation_version: '' });
  expect(noAttest.error, 'claim without attestation must refuse').not.toBeNull();
  expect(await roleOf(claimer)).toBe('pending');

  const { error: claimErr } = await claimer.client.rpc('claim_teacher', {
    p_attestation_version: 'integration-lane',
  });
  if (claimErr) throw new Error(claimErr.message);
  expect(await roleOf(claimer), 'claim promotes to teacher').toBe('teacher');

  // P3 LIVENESS: a self-serve teacher is capped at 5 classes. Fire it at the
  // production value — a cap nobody has watched refuse is a dormant safeguard,
  // and this lane exists precisely to stop trusting unfired guards.
  for (let i = 1; i <= 5; i++) {
    const { error } = await claimer.client.rpc('create_class', {
      p_name: `capped ${i}`,
      p_expected_domain: null,
      p_assertion_text_version: 'integration-lane',
    });
    if (error) throw new Error(`class ${i} should have been allowed: ${error.message}`);
  }
  const sixth = await claimer.client.rpc('create_class', {
    p_name: 'capped 6',
    p_expected_domain: null,
    p_assertion_text_version: 'integration-lane',
  });
  expect(sixth.error, 'the 6th class must be refused by the cap').not.toBeNull();
  expect(sixth.error!.message).toMatch(/limited to 5 classes/i);
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
  // "My activities", not "Activities" — the teacher shell's actual link text
  // (routes/Home.tsx). This assertion was retyped from imagination and had
  // never run against the real UI; see the note on the join-success copy below.
  await expect(
    page.getByRole('link', { name: 'My activities', exact: true }),
  ).toBeVisible();

  // -- student side: the join deep link, end to end --------------------------
  const studentPage = await page.context().newPage();
  await useSession(studentPage, student.session);
  await studentPage.goto(`/join/${joinCode}`);
  // STRAIGHT apostrophe: JoinClass.tsx writes `You&apos;re in ✓`, which renders
  // U+0027, while this assertion was originally typed with a curly U+2019 — two
  // strings that can never match and that look identical in a diff. Both this
  // and the link text above are the same class of defect: UI copy retyped into
  // a lane that had never executed, so nothing could contradict it. The lane
  // built to end stub-blindness shipped with three stubs of its own.
  await expect(studentPage.getByText("You're in ✓")).toBeVisible({
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

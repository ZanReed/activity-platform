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

import { readFileSync } from 'node:fs';
import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';
import { expect, test, type Page } from '@playwright/test';
import {
  ActivityDocument,
  createBlankToken,
  createEmptyDocument,
  createFillInBlankBlock,
  createShortAnswerBlock,
} from '@activity/schema';
// The wire version comes from the viewer's own constant (P2) — an e2e route
// payload that retypes a production constant is a test about a protocol the
// product does not speak.
import { CHECK_WIRE_VERSION } from '@activity/viewer';
import { supabaseStorageKey } from '../helpers/studentSession';
import { FACT_PROBE_RPC } from '../../src/lib/factProbeRpc';
import { expandFactScope } from '../../src/lib/factScope';
import { answer, warmUp } from '../helpers/factsRun';
import {
  INT_FACT_STUDENTS,
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
let classId: string;
let serviceRoleKey: string;

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
  // A written-answer block rides along so the GRADING rows have something real
  // to grade. Without it they skip, and a skipped row proves nothing — the
  // vacuity this project has caught in three separate lanes.
  const written = createShortAnswerBlock();
  written.prompt = [{ type: 'text', text: 'Explain your reasoning.', marks: [] }];
  doc.sections[0]!.rows = [
    {
      id: crypto.randomUUID(),
      gridLines: 'inherit',
      columns: [{ id: crypto.randomUUID(), blocks: [blank, written] }],
    },
  ];
  return ActivityDocument.parse(doc);
}

test.beforeAll(async () => {
  test.setTimeout(360_000); // db reset downloads nothing but replays 30 migrations

  // Preflight with named fixes, then a full db reset. Admission seeding goes
  // through the CLI as postgres; the service-role key is kept for the one
  // service-only write a row needs (the fact-scope mirror, as the importer
  // makes it).
  serviceRoleKey = preflightAndReset().serviceRoleKey;
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
  classId = classRow.id;

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

// =============================================================================
// Image upload (V4) — the raw-fetch path, against a real Storage
// -----------------------------------------------------------------------------
// uploadImage stopped using @supabase/storage-js on 2026-08-18 (shell-slimming
// slice 1, R2) and now builds its two requests by hand. A unit test believes
// whatever headers you hand a mocked fetch, and the plan's claimed safety net —
// "the existing editor e2e upload row" — turned out not to exist at all (the
// review's severe finding OV-1: a safety net asserted without checking, policy
// P11). So the proof has to be a real request to a real Storage, and this is
// the only lane that has one.
//
// The module under test is imported FROM THE PAGE, through the same Vite dev
// server the app runs on — so the resolve.alias substitution is in force and
// this exercises the shipped code path, not a re-implementation of it.
//
// ⚠ A MEASURED CORRECTION TO THE PLAN, recorded here because the plan is wrong
// and this row is what found it. The eng review's severe finding 1 said the
// missing `apikey` header "would have 401'd uploads" — supabase-js's
// `fetchWithAuth` adds it invisibly, so a hand-built request that sends only
// the Bearer token was assumed to be rejected by the API gateway. Against the
// real local stack it is NOT: apikey-less, Bearer-only uploads succeed with a
// 200 and a real object. The gateway accepts the user JWT as the credential.
//
// uploadImage still sends both headers — it mirrors what the vendor client
// sends, it costs nothing, and hosted Supabase's gateway config is not this
// repo's to assume. But the liveness probe below asserts what is ACTUALLY
// load-bearing (the Bearer token, and behind it 0019's RLS policy) rather than
// a refusal that does not happen. A probe that pins a premise the world does
// not honor is the vacuity this lane exists to end, not an example of it.
// =============================================================================

// A 1×1 PNG. Small enough to be free, real enough that the bucket's
// allowed_mime_types check has something true to say yes to.
const PIXEL_PNG_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

test('a REAL image upload through the raw-fetch path — and the token is load-bearing', async ({
  page,
}) => {
  await useSession(page, teacher.session);
  await page.goto('/');

  const result = await page.evaluate(
    async ([activity, b64]) => {
      const bytes = Uint8Array.from(atob(b64 as string), (c) => c.charCodeAt(0));
      const file = new File([bytes], 'pixel.png', { type: 'image/png' });

      // The SHIPPED module, served by the dev server with the alias applied.
      const mod = (await import('/src/lib/uploadImage.ts')) as {
        uploadImage: (id: string, f: File) => Promise<string>;
      };
      const publicUrl = await mod.uploadImage(activity as string, file);

      // ---- ANTI-VACUITY (P3): fire the refusal that actually guards the
      // bucket. Identical request, identical URL shape (bucket included — an
      // earlier draft dropped that segment and would have been refused for the
      // wrong reason), with the Bearer token withheld. 0019's INSERT policy is
      // `to authenticated`, so an anonymous caller must be refused. If THIS
      // succeeds, the upload above proves nothing about authorization.
      const sb = (await import('/src/lib/supabase.ts')) as {
        storageBase: () => string;
        supabaseAnonKey: () => string;
      };
      const form = new FormData();
      form.append('cacheControl', '31536000');
      form.append('', file);
      const anon = await fetch(
        `${sb.storageBase()}/object/activity-images/${activity as string}/probe-anonymous.png`,
        {
          method: 'POST',
          headers: { apikey: sb.supabaseAnonKey(), 'x-upsert': 'false' },
          body: form,
        },
      );

      return {
        publicUrl,
        anonStatus: anon.status,
        anonBody: (await anon.text()).slice(0, 200),
      };
    },
    [activityId, PIXEL_PNG_B64] as const,
  );

  // 1. The key layout 0019's policy parses: exactly one folder segment, and it
  //    is the activity id. A different layout 403s on the real policy — which
  //    is why this assertion belongs against the real stack and not a mock.
  expect(result.publicUrl).toContain(`/object/public/activity-images/${activityId}/`);
  expect(result.publicUrl).toMatch(/\.png$/);

  // 2. The returned URL is genuinely public: fetched from Node, with no
  //    session, no headers, nothing. `getPublicUrl` was always pure string
  //    building, so this is the row that proves the string we now build by
  //    hand actually addresses the object we just wrote.
  const fetched = await fetch(result.publicUrl);
  expect(fetched.status, `public URL not fetchable: ${result.publicUrl}`).toBe(200);
  expect(fetched.headers.get('content-type')).toContain('image/png');

  // 3. The session token is what carries the authorization. Same bucket, same
  //    key shape, no Bearer header — 0019's `to authenticated` INSERT policy
  //    must refuse it. This is what stops row 1 from being "any request to this
  //    URL returns 200".
  //
  //    Asserted as a specific AUTH refusal, not merely "not 200": a 404 from a
  //    mistyped URL would satisfy the loose form while proving nothing. The
  //    body is carried out of the page so that if Storage's wording or status
  //    changes, the failure SHOWS it rather than silently reclassifying.
  expect(
    result.anonStatus,
    'an ANONYMOUS upload was accepted — 0019’s INSERT policy is not gating this ' +
      `bucket, which makes the upload above prove nothing. Body: ${result.anonBody}`,
  ).not.toBe(200);
  expect(
    [400, 401, 403],
    `expected an AUTH refusal without a session; got ${result.anonStatus}: ${result.anonBody}`,
  ).toContain(result.anonStatus);
});

test('one REAL check round trip — the A1 class of bug can never hide again', async ({
  page,
}) => {
  await useSession(page, student.session);
  await page.goto(`/a/${activityId}`);
  const blank = page.locator('[data-section-id] input[type="text"]').first();
  await blank.waitFor({ timeout: 20_000 });
  await blank.fill('4');
  // Answer the written block too: the grading rows below need a real response
  // captured by the real check, not a fixture inserted behind the app's back.
  await page.locator('[data-block-type="short_answer"] textarea').first().fill(
    'because the slope stays the same',
  );
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

// =============================================================================
// Grading (0034) — the round trip no unit test can prove
// -----------------------------------------------------------------------------
// Everything below runs against the REAL RPCs on the local stack: the teacher's
// four doors, real RLS, real PostgREST error text. What this catches that the
// migration's own verify script cannot is the WIRE — argument names, the shape
// PostgREST returns, and whether the student's readback actually carries a body.
//
// That last one is the point. get-feedback served bodiless 200s for its entire
// life and every test it had passed, because nothing ever asserted that a real
// body reached a real client. These rows do.
// =============================================================================

test('the teacher grades a REAL check, and nothing reaches the student until release', async () => {
  // The check row this grades is the one the previous row created through the
  // real grading function, so this is genuinely end-to-end from student
  // keystroke to teacher score.
  const { data: checks } = await teacher.client
    .rpc('list_grading_queue', { p_activity_id: activityId });
  const queue = (checks ?? []) as Array<Record<string, unknown>>;

  // The fixture worksheet may carry no free-text block; if so this row has
  // nothing to prove and says so rather than passing vacuously.
  test.skip(queue.length === 0, 'fixture activity has no written-answer blocks');

  const row = queue[0]!;
  expect(row.graded).toBe(false);
  expect(row.student_label).not.toBeUndefined();

  const { error: saveError } = await teacher.client.rpc('upsert_check_grade', {
    p_check_id: row.check_id,
    p_block_id: row.block_id,
    p_criteria: [],
    p_general_feedback: 'Real feedback through the real RPC.',
  });
  expect(saveError).toBeNull();

  // BEFORE release the student sees nothing. This is the containment half of
  // the release ruling, asserted from the student's own client.
  const { data: beforeRelease } = await student.client
    .rpc('get_my_released_feedback', { p_activity_id: activityId });
  expect((beforeRelease ?? []).length).toBe(0);

  const { data: released, error: releaseError } = await teacher.client
    .rpc('release_check_grades', {
      p_activity_id: activityId,
      p_student_id: student.session.user.id,
    });
  expect(releaseError).toBeNull();
  expect((released as { released: number }).released).toBe(1);

  // AFTER release: a real body, with real content, at a real student client.
  const { data: afterRelease } = await student.client
    .rpc('get_my_released_feedback', { p_activity_id: activityId });
  const feedback = (afterRelease ?? []) as Array<Record<string, unknown>>;
  expect(feedback.length).toBe(1);
  expect(feedback[0]!.general_feedback).toBe('Real feedback through the real RPC.');
  expect(feedback[0]!.has_grader).toBe(true);
  expect(feedback[0]!.stale).toBe(false);
});

test('a student cannot grade, and cannot read another student’s feedback', async () => {
  const { data: queue } = await teacher.client
    .rpc('list_grading_queue', { p_activity_id: activityId });
  const rows = (queue ?? []) as Array<Record<string, unknown>>;
  test.skip(rows.length === 0, 'fixture activity has no written-answer blocks');

  // The student holds a real session and a real JWT — this is the containment
  // proof RLS-bypassing verify blocks cannot make.
  const { error: gradeError } = await student.client.rpc('upsert_check_grade', {
    p_check_id: rows[0]!.check_id,
    p_block_id: rows[0]!.block_id,
    p_criteria: [],
    p_general_feedback: 'I grade myself full marks',
  });
  expect(gradeError).not.toBeNull();

  const { error: queueError } = await student.client
    .rpc('list_grading_queue', { p_activity_id: activityId });
  expect(queueError).not.toBeNull();
});

test('the student SEES released feedback on the worksheet (the body reaches the DOM)', async ({
  page,
}) => {
  const { data: feedback } = await student.client
    .rpc('get_my_released_feedback', { p_activity_id: activityId });
  test.skip(((feedback ?? []) as unknown[]).length === 0, 'nothing released in this run');

  await useSession(page, student.session);
  await page.goto(`/a/${activityId}`);
  // The whole chain: PostgREST row → app lib → viewer store → the card.
  await expect(page.locator('[data-released-feedback]').first()).toBeVisible({
    timeout: 20_000,
  });
  await expect(page.locator('[data-released-feedback]').first()).toContainText(
    'Real feedback through the real RPC.',
  );
  await expect(page.locator('[data-released-feedback]').first()).toContainText(
    'Feedback from your teacher',
  );
});

// =============================================================================
// The check LOCK (0040 / activity flow modes, guard 8 / ruling 7A)
// -----------------------------------------------------------------------------
// The refusal is a THREE-PART contract and no unit test can prove any of it:
// the Edge Function must derive `p_locked` from the stored document, the RPC
// must refuse a second check WITHOUT writing a row, and it must still REPLAY a
// retry that carries the first check's idempotency key. That last one is the
// whole reason the refusal sits after the replay lookup (OV#9) — get it wrong
// and the dominant Chromebook failure (request sent, Wi-Fi drops, response
// lost) becomes a permanent lockout of work that was already recorded.
//
// Driven over HTTP rather than through the UI: this is a server contract, and
// the UI cannot express "the same idempotency key, twice" at all.
// =============================================================================

test('a `locked` activity refuses a second check, writes no row, and still replays a retry', async () => {
  // A second activity, identical except for the one meta field. Published and
  // shared exactly like the first, so the authorization chain is the real one.
  const lockedDoc = ActivityDocument.parse({
    ...checkableDoc(),
    meta: { ...checkableDoc().meta, submissionMode: 'locked' },
  });
  const { data: insertedLocked, error: insertErr } = await teacher.client
    .from('activities')
    .insert({
      owner_id: teacher.session.user.id,
      title: 'Integration lock',
      slug: `integration-lock-${Date.now()}`,
      draft_content: lockedDoc,
    })
    .select('id')
    .single();
  if (insertErr) throw new Error(insertErr.message);
  const lockedActivityId = (insertedLocked as { id: string }).id;

  const { error: pubErr } = await teacher.client.rpc('publish_activity', {
    p_activity_id: lockedActivityId,
  });
  if (pubErr) throw new Error(pubErr.message);

  const { data: row, error: readErr } = await teacher.client
    .from('activities')
    .select('current_version_id')
    .eq('id', lockedActivityId)
    .single();
  if (readErr) throw new Error(readErr.message);
  const lockedVersionId = (row as { current_version_id: string }).current_version_id;

  const sectionId = lockedDoc.sections[0]!.id;
  const blankId = lockedDoc.sections[0]!.rows[0]!.columns[0]!.blocks[0]!.id;

  // The wire version comes from the CONSTANT, never retyped (P2): a hand-typed
  // number turns a real wire bump into a green test about the wrong protocol.
  const check = async (idempotencyKey: string, answer: string) =>
    fetch(`${LOCAL_SUPABASE_URL}/functions/v1/check-activity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student.session.access_token}`,
        apikey: LOCAL_ANON_KEY,
      },
      body: JSON.stringify({
        wireVersion: CHECK_WIRE_VERSION,
        activityId: lockedActivityId,
        versionId: lockedVersionId,
        sectionId,
        idempotencyKey,
        responses: { blanks: { [blankId]: answer } },
      }),
    });

  const countRows = async (): Promise<number> => {
    const { count } = await student.client
      .from('section_checks')
      .select('id', { count: 'exact', head: true })
      .eq('activity_version_id', lockedVersionId)
      .eq('section_id', sectionId);
    return count ?? 0;
  };

  // 1. The first check lands normally. Non-vacuity: if this were not 200 every
  //    assertion below would pass for the wrong reason.
  const first = await check('lock-key-1', '4');
  expect(
    first.status,
    `the first check of a locked section must succeed; body: ${await first.clone().text()}`,
  ).toBe(200);
  expect(await countRows()).toBe(1);

  // 2. A SECOND check — a different key, so genuinely a new attempt — is
  //    refused, with the code the client maps to copy that never says "try
  //    again". There is no unlock in v1, so a retry can never succeed.
  const second = await check('lock-key-2', '5');
  expect(second.status).toBe(409);
  const body = (await second.json()) as { details?: { code?: string } };
  expect(body.details?.code).toBe('section_locked');

  // 3. ...AND NO ROW WAS WRITTEN. A refusal that still records is worse than
  //    no refusal: the teacher would see two attempts for work the student was
  //    told was locked after one.
  expect(await countRows()).toBe(1);

  // 4. THE ONE THAT MATTERS MOST (OV#9). A retry of the FIRST check, carrying
  //    its original idempotency key, must replay — not 409. If the lock were
  //    checked before the replay lookup this returns 409 and a student whose
  //    response was lost in transit is locked out of work already graded.
  const replay = await check('lock-key-1', '4');
  expect(
    replay.status,
    'the locking check’s own retry was REFUSED — the lock is being checked before the idempotent-replay lookup',
  ).toBe(200);
  expect(await countRows()).toBe(1);

  // 5. And `free` is untouched: the original activity — which the row above
  //    already checked once — still re-checks. Without this control the slice
  //    could have made EVERY activity locked and steps 1-4 would be just as
  //    green.
  //
  //    ⚠ The section id is read back from the PUBLISHED version, never from
  //    `checkableDoc()`. That factory mints fresh UUIDs on every call
  //    (CLAUDE.md says so outright about tiptapToActivity, and
  //    createEmptyDocument is the same), so a locally-built id names a section
  //    the stored document does not have — which is a 400 `unknown_section`
  //    that looks exactly like the failure this assertion is watching for. It
  //    did, on the first run of this row.
  const { data: freeVersion } = await teacher.client
    .from('activities')
    .select('current_version_id')
    .eq('id', activityId)
    .single();
  const freeVersionId = (freeVersion as { current_version_id: string })
    .current_version_id;
  const { data: freeContent } = await teacher.client
    .from('activity_versions')
    .select('content')
    .eq('id', freeVersionId)
    .single();
  const freeSectionId = (
    (freeContent as { content: { sections: Array<{ id: string }> } }).content
  ).sections[0]!.id;

  const freeAgain = await fetch(`${LOCAL_SUPABASE_URL}/functions/v1/check-activity`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${student.session.access_token}`,
      apikey: LOCAL_ANON_KEY,
    },
    body: JSON.stringify({
      wireVersion: CHECK_WIRE_VERSION,
      activityId,
      versionId: freeVersionId,
      sectionId: freeSectionId,
      responses: {},
    }),
  });
  expect(
    freeAgain.status,
    `a \`free\` activity was refused a re-check — the lock is not reading submissionMode; body: ${await freeAgain.clone().text()}`,
  ).toBe(200);
});

// =============================================================================
// Number facts (D43, 0045–0048) — the join the stub lanes cannot make
// -----------------------------------------------------------------------------
// facts-teacher.e2e.ts drives the teacher's page against a stub; facts-entry
// drives the student's run against a stub; verify-0045/0048 prove the server's
// half in SQL. Nothing proved the two meet: that what the server COMPUTES is
// what the page SHOWS. This row is that join (TODOS → "A real-backend row in
// the local integration lane", fired by 0048's additive fields).
//
// Teacher opens in the browser (through the end-date step) → one student runs
// it in the browser → four more save through the same RPC with set timings (a
// verdict needs five students with a rate) → the teacher closes in the browser
// → the page is held to the fields fact_probe_results returns, read here BY
// NAME. If a server field is renamed the page goes blank while this row reads
// the real field, and the row goes red. Registry: the committed copy of the
// revision live runs on, through the importer's own expander (P2).
// =============================================================================

interface ProbeResults {
  probe: { id: string; state: string; keep_until: string; item_count: number };
  class: {
    verdict: string;
    in_class: number;
    started: number;
    finished: number;
    with_rate: number;
    left_out: number;
    median_rate: number | null;
    floor: number;
  };
}

/** yyyy-mm-dd plus whole days, in calendar terms (no time zone in play). */
function addDays(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number);
  const t = new Date(Date.UTC(y!, m! - 1, d! + days));
  return t.toISOString().slice(0, 10);
}

test('number facts: what the server computes is what the teacher sees (open → run → close)', async ({
  page,
  browser,
}, testInfo) => {
  test.setTimeout(240_000);

  // -- the registry, mirrored the way the importer mirrors it ---------------
  // The committed copy of the revision live runs on (read as a file: the
  // runner's ESM loader will not import JSON without an attribute).
  const liveRegistry: unknown = JSON.parse(
    readFileSync(new URL('../../src/__tests__/fixtures/fact-scope-registry.2d20d8c9.json', import.meta.url), 'utf8'),
  );
  const expanded = expandFactScope(liveRegistry);
  if (!expanded.ok) throw new Error(`the fixture registry does not expand: ${expanded.errors.join('; ')}`);
  const service = createClient(LOCAL_SUPABASE_URL, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: mirrorError } = await service.rpc('sync_fact_scope', {
    p_mirror: expanded.mirror,
    p_apply: true,
  });
  if (mirrorError) throw new Error(`sync_fact_scope: ${mirrorError.message}`);

  // -- the teacher opens it, through the end-date step ----------------------
  await useSession(page, teacher.session);
  await page.goto(`/classes/${classId}/facts`);
  await expect(page.getByRole('heading', { name: 'Number facts snapshot' })).toBeVisible({
    timeout: 20_000,
  });
  const yearEnd = page.getByLabel('When does this class’s school year end?');
  await expect(yearEnd).toHaveValue(/^\d{4}-\d{2}-\d{2}$/);
  const endsOn = await yearEnd.inputValue();
  await page.getByRole('radio', { name: /Facts up to Year 7/ }).check();
  await page.getByRole('button', { name: 'Open the snapshot' }).click();
  await expect(page.locator('.ft-linkbig')).toHaveText(new RegExp(`/facts/${joinCode}$`), {
    timeout: 15_000,
  });

  const { data: overview, error: overviewError } = await teacher.client.rpc(FACT_PROBE_RPC.overview, {
    p_class_id: classId,
  });
  if (overviewError) throw new Error(overviewError.message);
  const probeId = (overview as { probes: Array<{ id: string; state: string }> }).probes.find(
    (p) => p.state === 'open',
  )?.id;
  expect(probeId, 'the page said it opened, but the overview has no open snapshot').toBeTruthy();

  // -- one student runs it in the browser ------------------------------------
  // The answers come from the student's OWN entry read (the payload the run is
  // built from), matched to what the page shows: the test types what a student
  // who knows their facts would type.
  const { data: entry, error: entryError } = await student.client.rpc(FACT_PROBE_RPC.entry, {
    p_code: joinCode,
  });
  if (entryError) throw new Error(entryError.message);
  const ready = entry as { state: string; total: number; items: Array<{ display: string; answer: string }> };
  expect(ready.state).toBe('ready');
  const norm = (t: string) => t.replace(/−/g, '-').replace(/\s+/g, ' ').trim();
  const answers = new Map(ready.items.map((i) => [norm(i.display), i.answer]));

  // Its OWN browser context: a second tab in the teacher's context shares
  // localStorage, so the student's session would replace the teacher's under
  // the teacher page's polling.
  const studentContext = await browser.newContext({ baseURL: testInfo.project.use.baseURL });
  const studentPage = await studentContext.newPage();
  await useSession(studentPage, student.session);
  await studentPage.goto(`/facts/${joinCode}`);
  await expect(studentPage.getByRole('heading', { name: 'Quick number facts' })).toBeVisible({
    timeout: 15_000,
  });
  await warmUp(studentPage);
  const expr = studentPage.locator('.fx-expr');
  for (let n = 1; n <= ready.total; n++) {
    const shown = norm((await expr.textContent()) ?? '');
    const typed = answers.get(shown);
    expect(typed, `no item in the entry payload is displayed as "${shown}"`).toBeDefined();
    await answer(studentPage, typed!);
    if (n < ready.total) await expect(expr).not.toHaveText(shown);
  }
  await expect(studentPage.getByRole('heading', { name: 'All done' })).toBeVisible({ timeout: 15_000 });
  await expect(studentPage.getByText(`You got ${ready.total} right.`)).toBeVisible();
  await studentContext.close();

  // -- four more students, through the same join and save RPCs ---------------
  // All right, and slow: 9–12 s a fact (under the 15 s ceiling; the server
  // counts less than the raw time, so 4–7 s still read as fluent), so the
  // class median sits below the floor and the page has to render the full 'below' verdict (median, floor,
  // counts), not the 'not enough' sentence that carries no numbers.
  for (const [i, creds] of INT_FACT_STUDENTS.entries()) {
    const other = await signUpAndIn(creds);
    const { error: joinError } = await other.client.rpc('join_class', { p_join_code: joinCode });
    if (joinError) throw new Error(`join_class (${creds.email}): ${joinError.message}`);
    const { data: theirEntry, error: theirEntryError } = await other.client.rpc(FACT_PROBE_RPC.entry, {
      p_code: joinCode,
    });
    if (theirEntryError) throw new Error(theirEntryError.message);
    const items = (theirEntry as { items: Array<{ n: number; answer: string }> }).items;
    const rt = 9000 + i * 1000;
    const { data: saved, error: saveError } = await other.client.rpc(FACT_PROBE_RPC.save, {
      p_probe_id: probeId,
      p_attempts: items.map((it, k) => ({
        n: it.n, typed: it.answer, rt_ms: rt, offset_ms: k * (rt + 300),
        skipped: false, interrupted: false, modality: 'keyboard',
      })),
      p_baselines: { keyboard: 300, keypad: null },
      p_finished: true,
    });
    if (saveError) throw new Error(`save_fact_attempts (${creds.email}): ${saveError.message}`);
    expect((saved as { state: string; finished: boolean })).toMatchObject({ state: 'saved', finished: true });
  }

  // -- the live view counts what the server counts ----------------------------
  const readResults = async (): Promise<ProbeResults> => {
    const { data, error } = await teacher.client.rpc(FACT_PROBE_RPC.results, { p_probe_id: probeId });
    if (error) throw new Error(error.message);
    return data as ProbeResults;
  };
  const live = await readResults();
  expect(live.class.started, 'five students saved; the server should count five').toBe(5);
  await expect(page.locator('.ft-counts')).toHaveText(
    `In class ${live.class.in_class} · Started ${live.class.started} · Finished ${live.class.finished}`,
    { timeout: 15_000 }, // the page polls every 5 seconds
  );

  // -- the teacher closes it in the browser ------------------------------------
  await page.getByRole('button', { name: 'Close the snapshot…' }).click();
  await page.getByRole('button', { name: 'Close it' }).click();
  const verdict = page.locator('.ft-verdict');
  await expect(verdict).toBeVisible({ timeout: 15_000 });

  // -- the join: the page against the stored snapshot, field by field ---------
  const closed = await readResults();
  const c = closed.class;
  expect(closed.probe.state).toBe('closed');
  expect(c.verdict, `the fixture is built to land below the floor; the server said ${JSON.stringify(c)}`).toBe('below');
  expect(c.with_rate).toBe(5);
  await expect(verdict).toHaveAttribute('data-verdict', c.verdict);
  await expect(verdict).toContainText('This class is below the fluency floor.');
  await expect(verdict).toContainText(
    `Class median: ${c.median_rate} correct a minute. Floor: ${c.floor}. Based on ${c.with_rate} of ${c.in_class} students` +
      (c.left_out > 0 ? `; ${c.left_out} had too little to measure.` : '.'),
  );

  // The end date the teacher confirmed sets how long answers are kept: its
  // date + 30 days (RP-3), and the page says that date.
  expect(closed.probe.keep_until).toBe(addDays(endsOn, 30));
  const keepText = await page.evaluate((d) => {
    const [y, m, day] = d.split('-').map(Number);
    return new Date(y!, m! - 1, day!).toLocaleDateString(undefined, {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  }, closed.probe.keep_until);
  await expect(page.getByTestId('ft-keep-until')).toContainText(keepText);
});

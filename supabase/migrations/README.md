# Supabase migrations

Schema for the activity platform. **The applied set is whatever `supabase migration list` reports against the live project — check it, don't trust a range pinned here** (this header has rotted twice by pinning one: it said "0017 queued" after 0017 was live, then "0020 not yet applied" after 0020 was live). Per-migration verification records live in STATE.md; anything genuinely pending appears under STATE.md → "Pending author actions".

## Files

| File | What it does |
|---|---|
| `0001_initial_schema.sql` | Extensions, enum types, all tables, indexes. RLS enabled and forced on every user-data table; no policies yet (so RLS denies everything by default). |
| `0002_rls_policies.sql` | Adds the policies that grant specific access patterns (owner reads own activities, teacher reads own assignments' submissions, etc.). |
| `0003_functions.sql` | Triggers (auto-create user row on signup), RPC functions (`ingest_submission`, `publish_activity`), the aggregate-stats view, and the soft-delete cron function. |
| `0004_seed_dev.sql` | **Dev only.** Seeds your email into the allowlist so you can sign up. Edit the email first. |
| `0005_attempt_number.sql` | Adds the `attempt_number` column on `submissions` plus two partial unique indexes for per-student attempt scoping; replaces `ingest_submission` to derive `attempt_number` server-side (it now returns `jsonb {submission_id, attempt_number}`). |
| `0006_account_tier.sql` | Adds the `account_tier` enum and the `users.account_tier` column; extends the `users_update_self` RLS policy to block client-side tier escalation. |
| `0007_submission_version.sql` | Pins each submission to the `activity_versions` row it was made against, so the dashboard reads the answer key the student actually saw. |
| `0008_soft_delete_activity.sql` | `SECURITY DEFINER` RPC `soft_delete_activity` — a client-side soft-delete UPDATE is rejected under the `deleted_at is null` SELECT policy (the post-update row becomes invisible to SELECT). See DECISIONS.md → "Activity deletion". |
| `0009_security_housekeeping.sql` | Advisor-driven security + performance pass (2026-07-11 run): `activity_aggregate_stats` → `security_invoker` (was leaking cross-teacher aggregates to any signed-in user); EXECUTE revoked from PUBLIC/anon/authenticated on the SECURITY DEFINER RPCs, re-granted only to verified call sites (`publish_activity` + `soft_delete_activity` keep `authenticated`); pinned `search_path` on the three RLS helpers; `auth.uid()` → `(select auth.uid())` initplan rewrite across 9 policies; covering indexes for 5 unindexed FKs. Verification queries (with expected results) are commented at the bottom of the file. Intentional non-fixes documented in DECISIONS.md → "Supabase security/performance housekeeping (0009)". |
| `0010_grades.sql` + `0011_grades_security.sql` | Phase 2.6 manual grading: the `grades` table (per-block rubric scores + feedback, upserted by the teacher grading UI) and its RLS/grant hardening. |
| `0012_restore_activity.sql` | `restore_activity` RPC (un-soft-delete; the delete flow's undo). Its missing revoke stanza was closed by `0015`. |
| `0013_student_identity.sql` | S1 identity, part 1: `student` role, `student_domain` gate, `handle_new_auth_user` rewrite (allowlist wins ties), `current_user_is_teacher()` guards on the five authoring policies. |
| `0014_classes.sql` | S1 identity, part 2: `classes` (NOT-NULL 13+ assertion record) + `class_members`, `join_class`/`list_class_members`/`soft_delete_class` RPCs, `submissions.student_id` third identity branch + account attempt-race index. |
| `0015_rpc_grant_housekeeping.sql` + `0016_helper_grant_lockdown.sql` | Advisor + ACL follow-ups: anon EXECUTE revoked on `restore_activity`, `generate_join_code` pinned, the four INVOKER RLS helpers locked to `authenticated`/`service_role`. After 0016, every function in `public` has an explicit revoke/grant stanza. |
| `0017_read_api.sql` | S2 read API: `activity_version_reads` durable per-version cache (service-role only), `get_published_activity` (authenticated resolve of the current published version), `get_activity_public_meta` (the deliberate anon exception — title + teacher name for the pre-auth interstitial). Verification: `scripts/verify-0017.sql`. |
| `0018_users_policy_recursion.sql` | Closes the `42P17 infinite recursion` on the `users` SELECT policy: policy rewritten to `(id = auth.uid()) OR current_user_is_admin()` with a DEFINER `current_user_is_admin()` helper (`search_path=public`; granted `authenticated`/`postgres`/`service_role`, never anon). Fully idempotent, safe to re-run. |
| `0019_image_storage.sql` | Cloudflare-exit + direct-upload eng review (2026-07-31): the `activity-images` Storage bucket (public read for cross-origin `<img>`; bucket-level mime/size limits are the server-side validation) plus the ONE RLS INSERT policy that is the write gate — the editor uploads directly, no Edge Function. The policy parses the activity id out of the object key (`{activityId}/{uuid}.{ext}`, CASE-guarded uuid cast so a malformed key gets a clean denial, never a cast error) and calls `can_edit_activity` as the caller. Deliberately NO update/delete/select policies. Quick checks commented at the bottom of the file; the full behavioral matrix is `scripts/verify-image-storage.sql`. Idempotent, safe to re-run. |
| `0020_section_checks.sql` | S4 grading slice: `section_checks` (the durable record of every section check — responses AND the verdicts/feedback the student was shown; version-pinned `on delete restrict` because publishing mints fresh block ids, so a check's item ids are meaningful only against its own version), `get_activity_version_for_check` (the caller-scoped authorization chain — authenticated ∧ published ∧ **version belongs to activity**; returns metadata ONLY, never content, since it is callable by every authenticated user and `activity_versions.content` is the RAW document), and `record_check` (**service-role only** — it takes verdicts as an argument, so a student able to call it could forge them; carries the per-student rate ceiling, idempotent replay, and the 0005-style attempt race backstop). Two SELECT policies, deliberately NO write policy — writes go through the RPC. Deliberately does NOT widen `grades`: binding teacher grading to checks lands with the UI that decides attempts-vs-latest (TODOS.md). Full matrix: `scripts/verify-0020.sql`. |
| `0021_display_name_privacy.sql` | Privacy fix (author ruling 2026-08-04): teacher `display_name` must never be an email. Three layers — `handle_new_auth_user` stores `nullif(trim(full_name), '')` instead of `coalesce(full_name, email)` (NULL is the designed-for "no name" state; the anon meta contract already documents it), `get_activity_public_meta` refuses to return an email-shaped value (same `\S+@\S+\.\S+` line as the client's `looksLikeEmail` guard, which stays as a third layer), and rows where the old fallback stored the email are backfilled to NULL (scoped to `display_name = email` exactly — never rewrites a name a user chose). No signature/grant/RLS changes; REPLACE preserves ACLs. Walkthrough: `scripts/verify-0021.sql`, then the regression re-runs below (it REPLACEd a function from each of 0013 and 0017). |

| `0022_purge_section_checks.sql` | Fixes a latent bug that would have stopped the nightly retention job outright: `purge_soft_deleted` (0003) predates `section_checks` (0020), and deleted a purge-eligible activity's *versions* before the activity — but `section_checks.activity_version_id` is ON DELETE RESTRICT, so the first check old enough to matter raises `23503` and rolls back the WHOLE run (assignments, activities, account purges included), reporting only into the cron log. Fix is ordering: delete the activity's checks first; the RESTRICT stays because it is load-bearing (S4-2 — a version must never vanish from under the checks whose block ids it minted). Also makes the student-purge cascade an explicit counted delete instead of an invisible FK side effect. Deliberately does NOT touch the `submissions.student_id` RESTRICT hazard — that one is a retention decision (30-day account clock vs 400-day submissions clock), flagged in STATE. Signature/grants unchanged. Bug reproduced and fix confirmed against the live function inside rolled-back transactions: `scripts/verify-0022.sql` section C. |

| `0023_account_retention_clock.sql` | Carries the 2026-08-04 ruling that **the account clock is subordinate to the work clock** — an account is purged only once no retained work remains, so `submissions.student_id` RESTRICT becomes the ruling's enforcement rather than an obstacle (reasoning: DECISIONS.md → "The account clock waits for the work"). Fixes two defects underneath it: (1) the job ran `delete from users` believing it cascaded to `auth.users`, but the FK runs the other way, so the Google identity survived **permanently** — it now deletes the `auth.users` row, which is what actually removes an account; (2) a single blocked account raised 23503 and rolled back the whole nightly run, so eligibility is now a per-account precondition and blocked accounts are skipped and counted. **Does NOT resolve** the `audit_log.actor_id` NO ACTION blocker — every account has a `user.create` row, so no account can be purged at all; that needs a ruling on audit_log's 2-year window and is queued in STATE. Both behaviors reproduced against the live function inside rolled-back transactions: `scripts/verify-0023.sql` section C. |

| `0024_audit_actor_purge.sql` | Carries the 2026-08-04 ruling that **an audit event outlives the account that made it**: `audit_log.actor_id` becomes ON DELETE SET NULL and the purge job stamps `metadata.actor_purged = true` before deleting, so the event survives its own 2-year security window without naming a person — and stays distinguishable from the genuinely-unattributed rows that already carry a NULL actor (7 of them, anonymous `submission.create`). **This is what made account deletion possible at all**: until 0024 every account was permanently blocked by its own `user.create` row, so `purge_soft_deleted` could never delete one. Alternatives rejected: CASCADE would make the 2-year window untrue and turn deletion into evidence erasure; making the account wait out the 2 years would keep a name and email ~18 months past the work that justified the account. `actor_id` was already nullable, so no column change. Idempotent. Three teacher-side FKs (`allowlist.added_by`, `student_domain.added_by`, `classes.age_assertion_by`) stay NO ACTION deliberately. Proven end to end in a rolled-back transaction — an account owning nothing deleted cleanly, its audit row survived and stamped: `scripts/verify-0024.sql` section C. |

| `0025_student_dormancy.sql` | Starts the account clock, closing the last gap between the retention policy and reality (after 0022–0024 the purge could complete, but nothing made an account eligible). A student is purge-eligible after **400 days with no active class membership**, **derived live** from `class_members`/`classes` — no column, no marking sweep, no clearing path, nothing to drift; rejoining ends dormancy on its own. **The job never writes `users.deleted_at`**, and that is load-bearing: `join_class` refuses accounts with it set, so marking a dormant student would have locked them out of rejoining between terms. That column stays reserved for explicit/administrative deletion (30-day window, any role). 400 days rather than the 30 originally written because 30 is shorter than a summer break. Never-joined accounts clock from `created_at`. No schema change. Verified by FIXTURE, not inspection — `scripts/verify-0025.sql` section C builds five real student accounts through the signup trigger plus a real class and memberships, runs the real purge, asserts the six-case matrix, and rolls it all back. |

## Regression re-runs (the DB has no CI harness)

Nothing in CI exercises Postgres — triggers, RLS, and grants are only verified by the
`scripts/verify-*.sql` walkthroughs, run by hand. So a later migration can silently regress an
earlier one, and the only defense is re-running the earlier scripts. **After applying any migration
that touches auth, identity, RLS policies, or function grants, re-run:**

- `scripts/verify-0013-0014.sql` sections A–D (identity: role enum, domain gate, trigger, classes
  RLS, authoring guards) — section E (live signup) only if the trigger itself changed.
- `scripts/verify-0017.sql` (read API: cache-table RLS, DEFINER functions, the exact grant/ACL
  matrix — its completeness query catches ANY function newly executable by anon/PUBLIC, which is
  how the 0009-era grant drift was found).
- `scripts/verify-image-storage.sql` (the image bucket's write gate: 8-case impersonated INSERT
  matrix on 0019's policy, incl. the non-uuid-key clean-denial pin and the no-UPDATE-policy
  overwrite check — this policy rides `can_edit_activity`, so any migration touching that helper
  or its grants can regress it).
- `scripts/verify-0020.sql` (the section-check surface: 23-case matrix over the authorization
  chain, `record_check`, and `section_checks` RLS). Two of its cases are security boundaries
  rather than conveniences, and a regression in either is silent: **A2** — a version belonging to
  a DIFFERENT activity must be refused, because without the parentage join an empty-responses
  check request would return a foreign activity's whole solution set; **B1** — `authenticated`
  must never be able to call `record_check`, which takes verdicts as an argument and would let a
  student write themselves a row of `correct`. The teacher-read policy rides `can_read_activity`,
  so this shares 0019's exposure to helper changes.

Each query states its expected result; anything else = stop and report. This is the standing
mitigation for S1's known gap (no automated DB tests), recorded in the 2026-07-29 S0–S2 test-setup
review.

Run order is the file order. Each builds on the previous. `0004` is the dev seed and only matters on a dev project; the schema migrations `0005`+ come after it numerically and run after it.

## How to run them

There are two practical ways to apply these migrations.

### Option A: Supabase CLI (recommended)

```bash
# One-time setup
npm install -g supabase
supabase login
supabase init                                  # in your repo root
supabase link --project-ref <your-project-ref> # from the Supabase dashboard URL

# Move these migration files into ./supabase/migrations/ in your repo, then:
supabase db push
```

The CLI normally names migrations with timestamps (`20240505140000_initial_schema.sql`). When you `supabase migration new <name>`, it generates a stub with a timestamp. For these initial files, you can either rename them to use timestamps or leave the numeric prefixes — the CLI applies them in lexicographic order either way.

### Option B: Paste into the SQL editor

Open your Supabase project → SQL Editor → New query. Paste and run `0001`, `0002`, `0003`, `0005`, `0006`, `0007`, `0008`, and `0009` in order. `0004` is the dev seed — edit the email first, then run it any time after `0003` (only against a dev project).

This works but isn't reproducible. Use Option A once you're past the prototype stage.

### Option C: the verify runner (for the regression re-runs, not for applying)

`pnpm verify:auth --target live` executes the whole auth/grant regression set
(verify-0027 + verify-0013-0014 + verify-0017 + verify-image-storage +
verify-0020) over psql and prints per-assertion PASS/FAIL — replacing the
paste-and-eyeball walkthrough for those five scripts. `--target local` points
it at a `supabase start` stack instead (migration rehearsal). One-time
prerequisites and the connection-string setup are documented in the runner's
header (`scripts/verify-runner.mjs`): `brew install libpq && brew link --force
libpq`, plus `SUPABASE_DB_URL` (the **pooler** DSN + the dashboard database
password) in `.env.supabase`. Scripts stay individually paste-runnable — the
runner just automates them via `-- @section` markers.

## Notable decisions baked into these migrations

A few things worth calling out, mostly additions that came out of conversation:

- **`activities.draft_content jsonb`** — mutable in-progress edit, separate from the append-only `activity_versions`. Autosave writes here; publish copies it into a new version row and clears the draft.
- **`submissions` constraint `submissions_identity_present`** — CHECK constraint that enforces every submission has either an `opaque_token` (Phase 3) or a non-empty `display_name` (Phase 1).
- **Documented shape for `submissions.responses`** — keyed by stable `blank.id` so per-blank aggregation queries work even when blocks are reordered between document versions. Locked in early to avoid migrating historical data later.
- **`publish_activity()` RPC** — atomic publish flow: insert version row, point activity at it, clear draft, audit log. Called by the publish Edge Function after it validates the draft.
- **Hardened `ingest_submission()`** — checks the identity-present constraint and the `responses` jsonb shape (belt-and-suspenders alongside the Edge Function's Zod parser).
- **Permission helper functions** (`can_read_activity`, `can_edit_activity`, `can_access_assignment`) — defined at the top of `0002_rls_policies.sql`. RLS policies on `activity_versions`, `assignment_students`, and `submissions` call these helpers instead of inlining `EXISTS (SELECT 1 FROM activities ...)` clauses. `publish_activity` also calls `can_edit_activity` for its authorization check. Phase 3+ access patterns (collaborators, marketplace purchasers) are added by extending the helper bodies — no policy rewrites required. (Policies *on the `activities` table itself* still inline the owner check — calling a helper that selects from `activities` inside an `activities` policy risks RLS recursion.)
- **`submissions.attempt_number`** (added in `0005`) — per-student attempt counter for revision cycles, derived server-side by `ingest_submission` via `max + 1` over the student's identity scope, with two partial unique indexes guarding the SELECT-max → INSERT race.
- **`users.account_tier`** (added in `0006`) — per-user tier (`free` / `supporter` / `institutional` / `comp`), separate from `role`; inert in Phase 1. The `users_update_self` policy is extended so clients cannot escalate their own tier.

## After the migrations are applied

A few one-time setup steps in the Supabase dashboard:

1. **Enable `pg_cron` extension** (Database → Extensions). Then schedule the soft-delete purge:
   ```sql
   select cron.schedule(
     'purge-soft-deleted',
     '0 3 * * *',
     'select purge_soft_deleted();'
   );
   ```

2. **Configure auth providers** (Authentication → Providers). For Phase 1 with the allowlist, you'll likely want only Google OAuth enabled (since teachers are signing in with school accounts).

3. **Set up service role key** for the Edge Functions. The submission and publish Edge Functions both need to call SECURITY DEFINER functions with elevated privileges; they use the service role key from environment variables (never expose it to the browser).

4. **Edit `0004_seed_dev.sql`** with your real email and run it.

## Test plan

After applying all migrations, run the script below to verify RLS is working. This is a sanity check, not a full test suite — for ongoing repeatable testing once Phase 1 is real, use `supabase test db` with **pgTAP**, which handles fixtures and rollback properly. The manual version here is fine for verifying schema changes haven't broken anything.

### Prerequisites

You need two test users before the test will run. The trigger in `0003` requires their emails to be allowlisted before signup, so the order matters.

**1. Allowlist two test emails:**

```sql
insert into allowlist (email, notes) values
  ('[email protected]', 'RLS test fixture'),
  ('[email protected]', 'RLS test fixture')
on conflict (email) do nothing;
```

**2. Create the users via the dashboard:** Authentication → Users → Add user → Create new user, using each of the emails above. Set any password (you'll never log in as them). The signup trigger will fire and create matching `public.users` rows.

**3. Get the UUIDs:**

```sql
select id, email from public.users where email like 'rls-test-%';
```

Copy the two UUIDs that come back; you'll paste them into the test script below.

### Diagnostic queries

If anything goes wrong during setup, these tell you what state you're actually in:

```sql
select * from allowlist where email like 'rls-test-%';   -- Should have 2 rows
select id, email from auth.users where email like 'rls-test-%';   -- Should have 2 rows
select id, email from public.users where email like 'rls-test-%'; -- Should have 2 rows
```

If `auth.users` has rows but `public.users` doesn't, the signup trigger isn't firing — check `select * from pg_trigger where tgname = 'on_auth_user_created';` and make sure `0003` was applied.

### The test

Replace `PUT-TEACHER-A-UUID-HERE` and `PUT-TEACHER-B-UUID-HERE` with the real UUIDs from step 3. Highlight the entire block in SQL Editor and run it as one query — the `BEGIN`/`ROLLBACK` must wrap everything so `set local` actually persists across statements. The `ROLLBACK` at the end means nothing is saved; you can re-run this as many times as you want without polluting the database.

```sql
-- ============================================================================
-- RLS test plan
-- Expected outcomes are noted next to each query. If any of them is wrong,
-- RLS is broken and that needs to be fixed before anything else ships.
-- ============================================================================

begin;

-- ---- As Teacher A ----
set local role authenticated;
set local request.jwt.claims = '{"sub": "PUT-TEACHER-A-UUID-HERE", "role": "authenticated"}';

-- A creates their own activity. SHOULD SUCCEED.
insert into activities (owner_id, title, slug)
  values ('PUT-TEACHER-A-UUID-HERE', 'A''s activity', 'a-activity');

-- A reads their activities. EXPECT: 1
select count(*) as a_sees_own_activity from activities;

-- ---- As Teacher B ----
set local request.jwt.claims = '{"sub": "PUT-TEACHER-B-UUID-HERE", "role": "authenticated"}';

-- B tries to read A's activity. EXPECT: 0
select count(*) as b_sees_a_activity from activities;

-- B tries to update A's activity. EXPECT: 0 rows affected
update activities set title = 'hijacked' where slug = 'a-activity';

-- B tries to read assignment_students rows. EXPECT: 0 (privacy-critical)
select count(*) as b_sees_a_assignment_students from assignment_students;

-- B tries to read submissions. EXPECT: 0
select count(*) as b_sees_a_submissions from submissions;

-- ---- Back as Teacher A ----
set local request.jwt.claims = '{"sub": "PUT-TEACHER-A-UUID-HERE", "role": "authenticated"}';

-- A confirms title is unchanged. EXPECT: A's activity (NOT 'hijacked')
select title from activities where slug = 'a-activity';

rollback;
```

### What to do if a check fails

If `b_sees_a_activity` returns anything other than 0, or the update affected more than 0 rows, or the title comes back as 'hijacked' — **stop**. Data leakage between teachers is the worst kind of bug this system can have, and a small RLS mistake at this stage compounds into a privacy disaster once real student data is involved. Re-read the policies in `0002_rls_policies.sql`, identify which one is too permissive, and fix it before doing anything else.

### Tests deliberately not here

A separate scenario worth testing once it becomes relevant is the failing INSERT — verifying that B *cannot* forge an activity with `owner_id = A`. Postgres's WITH CHECK rejection raises an exception, which aborts the transaction and prevents any later statements in the same `BEGIN` block from running. Testing it requires either a separate transaction or a `SAVEPOINT`/`ROLLBACK TO` dance. The pgTAP framework handles this cleanly; pure SQL doesn't. For now, the SELECT/UPDATE checks above are sufficient to confirm cross-user reads and writes are blocked.

## What's deliberately NOT here

The schema does not include:

- Public/marketplace visibility policies (Phase 3+ — additional `select` policies on `activities` and `activity_versions`).
- Purchase/entitlement table (Phase 5).
- Organization/team tables (Phase 4 — multi-tenancy).
- Comments, ratings, reviews (Phase 5+).
- A separate `students` table — student accounts (added 2026-07-28, migrations 0013/0014) live in `users` with `role='student'`; a parallel table would fork every join and the signup trigger (DECISIONS.md → "Student identity S1").
- Messaging or notifications.

These are intentional omissions. Phase 1 is the smallest possible schema that supports the auth → create → edit → publish → submit → review loop.

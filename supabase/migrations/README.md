# Supabase migrations

Phase 1 schema for the activity platform. Eight core migrations plus an optional dev seed. `0001`–`0008` are applied to the live project; `0009` is prepared and awaiting apply (see STATE.md "Pending author actions" / "Status by area").

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
- A `students` table — we don't store student accounts. Ever.
- Messaging or notifications.

These are intentional omissions. Phase 1 is the smallest possible schema that supports the auth → create → edit → publish → submit → review loop.

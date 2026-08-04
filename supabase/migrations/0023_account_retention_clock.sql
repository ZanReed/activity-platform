-- =============================================================================
-- 0023_account_retention_clock.sql — the account clock is subordinate to work
-- -----------------------------------------------------------------------------
-- RULING 2026-08-04 (author): when a student leaves all their classes, **the
-- work's clock wins**. An account becomes purge-eligible only once no retained
-- work remains — it does NOT get deleted at 30 days while its submissions are
-- still inside their own retention window.
--
-- Why that way (the alternatives and their costs are in DECISIONS.md →
-- "The account clock waits for the work"): the 400-day window exists to keep
-- *attributable* school records ("can I see my grade from last semester").
-- Cascading the work away at 30 days destroys those records; pseudonymizing it
-- keeps rows that no longer answer the question they were kept for. Only this
-- option matches the sentence already written for students in
-- privacy-policy.md: "submitted classwork may be kept for the school's records
-- window, then purged."
--
-- Two mechanical defects are fixed alongside the ruling.
--
-- DEFECT 1 — the purge job deleted the wrong table, so the Google identity
-- survived forever. 0003 does `delete from users` under a comment claiming it
-- "cascades to auth.users via the FK from public.users". The FK runs the OTHER
-- WAY: public.users.id REFERENCES auth.users(id) ON DELETE CASCADE. Deleting
-- public.users therefore leaves auth.users — email, Google name, provider
-- metadata, OAuth consents, sessions — in place permanently, while the
-- retention policy promised "Student account (users + auth.users) — 30 days".
-- Deleting auth.users is what actually removes an account; public.users,
-- class_members, and section_checks fall via CASCADE behind it.
--
-- DEFECT 2 — one ineligible account aborted the entire nightly run. Several
-- children of users are RESTRICT or NO ACTION, so a single blocked account
-- raised 23503 and rolled back everything the job had done (same failure class
-- 0022 fixed for section_checks). Eligibility is now a precondition, checked
-- per account, so a blocked account is SKIPPED and reported instead of fatal.
--
-- ⚠ THE ACCOUNT PURGE STILL CANNOT COMPLETE FOR ANY ACCOUNT, and this
-- migration deliberately does not change that. `audit_log.actor_id` is
-- NO ACTION, and the signup trigger writes a `user.create` row for every
-- account at creation — so every account is permanently blocked by its own
-- audit trail (verified live 2026-08-04: 3 accounts, 3 with audit rows).
-- Resolving it means ruling on audit_log's 2-year security window vs. account
-- deletion — SET NULL the actor and keep the event, delete the rows with the
-- account, or make the account wait out the 2 years. That is a compliance
-- decision, not a mechanical one, and it is queued in STATE rather than
-- guessed at here. Until it is made, the account purge reports what it is
-- blocked on instead of silently doing nothing.

create or replace function purge_soft_deleted()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_checks_activity int;
  v_checks_student  int;
  v_accounts        int := 0;
  v_blocked         int := 0;
  v_uid             uuid;
begin
  -- 1. Section checks belonging to purge-eligible ACTIVITIES.
  --    MUST precede the activity_versions delete: activity_version_id is
  --    ON DELETE RESTRICT and would otherwise abort the entire run (0022).
  delete from section_checks
   where activity_id in (
           select id from activities
            where deleted_at < now() - interval '30 days'
         )
      or activity_version_id in (
           select av.id from activity_versions av
             join activities a on a.id = av.activity_id
            where a.deleted_at < now() - interval '30 days'
         );
  get diagnostics v_checks_activity = row_count;

  -- 2. Submissions linked to deleted assignments
  delete from submissions
    where assignment_id in (
      select id from assignments where deleted_at < now() - interval '30 days'
    );

  -- 3. Assignments themselves
  delete from assignments where deleted_at < now() - interval '30 days';

  -- 4. Activity versions of deleted activities
  delete from activity_versions
    where activity_id in (
      select id from activities where deleted_at < now() - interval '30 days'
    );

  -- 5. Activities themselves
  delete from activities where deleted_at < now() - interval '30 days';

  -- 6. Section checks belonging to accounts that are ALREADY past their window
  --    and otherwise clear. Explicit rather than riding the FK cascade, so the
  --    destruction of student work is a counted act (2026-08-04 compliance
  --    finding). Guarded by the same work-first rule as step 7: an account with
  --    retained submissions is not eligible, so its checks stay too.
  delete from section_checks sc
   where sc.student_id in (
     select u.id from users u
      where u.deleted_at < now() - interval '30 days'
        and not exists (select 1 from submissions s where s.student_id = u.id)
   );
  get diagnostics v_checks_student = row_count;

  -- 7. Accounts. THE RULED PRECEDENCE LIVES HERE: an account is eligible only
  --    when its window has elapsed AND it retains no work AND nothing else
  --    references it. Iterating one account at a time is deliberate — it keeps
  --    a single blocked account from aborting the run (defect 2), and lets the
  --    job report WHAT blocked it.
  for v_uid in
    select u.id from users u
     where u.deleted_at < now() - interval '30 days'
     order by u.deleted_at
  loop
    if exists (select 1 from submissions      x where x.student_id = v_uid)
    or exists (select 1 from section_checks   x where x.student_id = v_uid)
    or exists (select 1 from activities       x where x.owner_id   = v_uid)
    or exists (select 1 from activity_versions x where x.created_by = v_uid)
    or exists (select 1 from assignments      x where x.teacher_id = v_uid)
    or exists (select 1 from classes          x where x.teacher_id = v_uid
                                                   or x.age_assertion_by = v_uid)
    or exists (select 1 from grades           x where x.graded_by  = v_uid)
    or exists (select 1 from allowlist        x where x.added_by   = v_uid)
    or exists (select 1 from student_domain   x where x.added_by   = v_uid)
    or exists (select 1 from audit_log        x where x.actor_id   = v_uid)
    then
      -- Not eligible yet. Work (or an audit trail, or authored content) is
      -- still retained; the account waits for it. See the audit_log note in
      -- this file's header — today that branch catches EVERY account.
      v_blocked := v_blocked + 1;
      continue;
    end if;

    -- Delete the AUTH row: public.users, class_members, and the auth.*
    -- children all fall via ON DELETE CASCADE behind it. Deleting
    -- public.users instead would strand the Google identity (defect 1).
    delete from auth.users where id = v_uid;
    v_accounts := v_accounts + 1;
  end loop;

  raise notice
    'purge_soft_deleted: section_checks %+% (activity/student), accounts purged %, accounts blocked %',
    v_checks_activity, v_checks_student, v_accounts, v_blocked;
end;
$$;

-- =============================================================================
-- Verification — spot checks (scripts/verify-0023.sql is the full pass)
-- =============================================================================
--
-- -- 1. The job targets auth.users, not public.users, for account deletion.
-- --    EXPECT: t / f
-- select strpos(prosrc, 'delete from auth.users') > 0 as deletes_auth_row,
--        strpos(prosrc, 'delete from users where deleted_at') > 0 as old_wrong_delete
-- from pg_proc where proname = 'purge_soft_deleted';
--
-- -- 2. Grants unchanged by REPLACE. EXPECT: service_role (+postgres) only.
-- select coalesce(g.rolname, 'PUBLIC') as grantee
-- from pg_proc p
-- cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
-- left join pg_roles g on g.oid = a.grantee
-- where p.proname = 'purge_soft_deleted';
--
-- -- 3. The submissions RESTRICT stays — it is now the enforcement of the
-- --    ruling, not an obstacle to it. EXPECT: RESTRICT
-- select case confdeltype when 'r' then 'RESTRICT' when 'c' then 'CASCADE' end
-- from pg_constraint where conname = 'submissions_student_id_fkey';

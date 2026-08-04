-- =============================================================================
-- 0022_purge_section_checks.sql — teach purge_soft_deleted about section_checks
-- -----------------------------------------------------------------------------
-- purge_soft_deleted (0003) predates section_checks (0020) and never learned
-- about it. That left one LATENT BUG and one silent behavior, both fixed here.
--
-- THE BUG (armed, not yet fired — verified live 2026-08-04: 44 checks exist,
-- 0 of them on a soft-deleted activity, so the job still succeeds today):
--
--   section_checks.activity_version_id ─► activity_versions  ON DELETE RESTRICT
--
-- The job deletes activity_versions of purge-eligible activities BEFORE it
-- deletes the activities themselves. Once any check references such a version,
-- RESTRICT raises — and because this is one plpgsql function, one exception
-- rolls back the WHOLE nightly run. Not just that activity: assignments,
-- activities, and user purges all stop too, every night, reporting only into
-- the cron log. A retention job that silently stops running is the exact
-- failure mode the retention policy exists to prevent. Soft-deleting the
-- author's own E2E activity (`6a84c8cb`, 44 checks) and waiting 30 days is all
-- it would have taken.
--
-- Ordering is the fix: delete a purge-eligible activity's checks BEFORE its
-- versions. The RESTRICT then has nothing to block, and it stays RESTRICT —
-- it is load-bearing (0020 ruling S4-2: a check's block ids are meaningful
-- ONLY against the version that minted them, so a version must never vanish
-- from under its checks by cascade).
--
-- THE SILENT BEHAVIOR: section_checks.student_id is ON DELETE CASCADE, so a
-- student purge already removed check history — correctly, but invisibly, as
-- a side effect of deleting the users row. It is now an explicit statement
-- with a counted result, per the 2026-08-04 compliance-pack finding
-- (retention-policy.md → Mechanics). Same rows deleted; the difference is that
-- the job can now say how many, and a reader of this function can see that
-- student work is being destroyed without having to know the FK's delete rule.
--
-- NOT fixed here, because it is a retention DECISION and not a mechanical one
-- (flagged in STATE for the S4/S7 purge-job work): `submissions.student_id` is
-- ON DELETE RESTRICT, so `delete from users` still fails for any student who
-- has account-backed submissions. Harmless today (0 such rows live) and
-- arguably correct — submissions carry a 400-day window while the account
-- carries 30, so the two clocks genuinely disagree and someone must rule on
-- which wins. Fixing it silently here would bake in an answer nobody chose.
--
-- Signature, volatility, security, and ACLs are unchanged; CREATE OR REPLACE
-- preserves the 0009 grants (service_role + postgres only).

create or replace function purge_soft_deleted()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_checks_activity int;
  v_checks_student  int;
begin
  -- 1. Section checks belonging to purge-eligible ACTIVITIES.
  --    MUST precede the activity_versions delete below: activity_version_id is
  --    ON DELETE RESTRICT and would otherwise abort the entire run.
  --    Matched on activity_id OR activity_version_id: the two are consistent by
  --    construction (0020's authorization chain proves version-belongs-to-
  --    activity before a row is written), and the belt-and-braces predicate
  --    means a future inconsistency degrades to over-deleting rows that were
  --    being purged anyway rather than to a nightly outage.
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

  -- 4. Activity versions of deleted activities (FK is ON DELETE CASCADE from
  -- activities, so deleting activities below will cascade; this delete is for
  -- safety in case of FK changes).
  delete from activity_versions
    where activity_id in (
      select id from activities where deleted_at < now() - interval '30 days'
    );

  -- 5. Activities themselves
  delete from activities where deleted_at < now() - interval '30 days';

  -- 6. Section checks belonging to purge-eligible STUDENTS. The FK would
  --    cascade this on step 7 anyway; doing it explicitly makes the
  --    destruction of student work a visible, counted act rather than a
  --    side effect (2026-08-04 compliance finding).
  delete from section_checks
   where student_id in (
     select id from users where deleted_at < now() - interval '30 days'
   );
  get diagnostics v_checks_student = row_count;

  -- 7. Users (cascades to auth.users via the FK from public.users)
  delete from users where deleted_at < now() - interval '30 days';

  -- Counts go to the Postgres log, which is where a cron failure would be read
  -- from too. Deliberately NOT audit_log rows: this is a scheduled system
  -- sweep, and audit_log.actor_id wants a real user (0020 used the same
  -- reasoning to keep high-volume non-actions out of it).
  raise notice 'purge_soft_deleted: % section_checks by activity, % by student',
    v_checks_activity, v_checks_student;
end;
$$;

-- =============================================================================
-- Verification — spot checks (scripts/verify-0022.sql is the full pass)
-- =============================================================================
--
-- -- 1. The ordering fix is present and precedes the versions delete.
-- --    EXPECT: t
-- select strpos(prosrc, 'delete from section_checks')
--          < strpos(prosrc, 'delete from activity_versions') as checks_deleted_first
-- from pg_proc where proname = 'purge_soft_deleted';
--
-- -- 2. Grants survived REPLACE. EXPECT: service_role (+postgres), and NO
-- --    public/anon/authenticated row.
-- select coalesce(g.rolname, 'PUBLIC') as grantee
-- from pg_proc p
-- cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
-- left join pg_roles g on g.oid = a.grantee
-- where p.proname = 'purge_soft_deleted';
--
-- -- 3. The RESTRICT that made this necessary is still in place (it is
-- --    load-bearing — see the header). EXPECT: RESTRICT
-- select case confdeltype when 'r' then 'RESTRICT' when 'c' then 'CASCADE' end
-- from pg_constraint where conname = 'section_checks_activity_version_id_fkey';

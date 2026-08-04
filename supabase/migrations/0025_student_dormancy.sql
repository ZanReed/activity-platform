-- =============================================================================
-- 0025_student_dormancy.sql — start the account clock without a marking step
-- -----------------------------------------------------------------------------
-- Closes the last gap between the retention policy and reality. After
-- 0022/0023/0024 the purge could finally complete, but nothing ever set
-- users.deleted_at, so no account was ever eligible and the job stayed inert.
--
-- RULINGS 2026-08-04 (author), full reasoning in DECISIONS.md → "Student
-- dormancy is derived, not marked":
--
--   1. Dormancy window is **400 days**, matching the work-records window, so
--      the account and the work it belongs to expire together instead of
--      fighting. 30 days — the number originally written — is shorter than a
--      summer break: a student whose spring class is deleted in May would be
--      purged in June and return in August to a destroyed account.
--   2. A student who signs in but never joins a class starts their clock at
--      `created_at`, so sign-in-once accounts do not accumulate email and name
--      forever. Anyone who did real work is still shielded by the 0023
--      work-first rule.
--   3. **This job never sets `users.deleted_at`.** That column keeps meaning
--      "account disabled", set only by an admin or an on-request deletion.
--
-- WHY DORMANCY IS DERIVED RATHER THAN MARKED — the load-bearing part.
-- `join_class` (0014) selects the caller with `... and deleted_at is null` and
-- rejects otherwise. So writing deleted_at onto a dormant student would LOCK
-- THEM OUT OF REJOINING — breaking the most ordinary case in a school: a
-- student between terms, or one a teacher removed by mistake. In this schema
-- `deleted_at` means "disabled", not "the retention clock is running", and
-- conflating the two would have shipped a lockout bug.
--
-- Deriving it also removes the machinery that would have needed maintaining: a
-- marking sweep, a clearing path for re-joins, and a backfill — three things
-- that can drift out of sync. Rejoining ends dormancy on its own, because an
-- active membership simply exists again. Nothing to keep correct.
--
-- No schema change: dormancy is computed from rows that already exist, and
-- `class_members_student_idx` (partial on removed_at is null) already covers
-- the active-membership probe.

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

  -- 6. Section checks belonging to explicitly-deleted accounts past their
  --    window and otherwise clear. Explicit rather than riding the FK cascade,
  --    so destroying student work is a counted act (2026-08-04 finding).
  delete from section_checks sc
   where sc.student_id in (
     select u.id from users u
      where u.deleted_at < now() - interval '30 days'
        and not exists (select 1 from submissions s where s.student_id = u.id)
   );
  get diagnostics v_checks_student = row_count;

  -- 7. Accounts. TWO independent ways in, then the 0023 precedence applies to
  --    both: eligible only once no work is retained and nothing else
  --    references the row.
  --
  --      (a) EXPLICIT deletion — admin action or an on-request deletion set
  --          users.deleted_at. 30-day grace. Any role.
  --      (b) DORMANCY — a student with no active class membership for 400
  --          days. DERIVED, never written down (see the header). The clock
  --          starts at the latest moment one of their memberships ended, or
  --          at created_at for a student who never joined one.
  for v_uid in
    select u.id
      from users u
     where (u.deleted_at < now() - interval '30 days')
        or (
             u.role = 'student'
             -- no membership that is still live on a live class
             and not exists (
               select 1
                 from class_members cm
                 join classes c on c.id = cm.class_id
                where cm.student_id = u.id
                  and cm.removed_at is null
                  and c.deleted_at is null
             )
             -- ...and the most recent ending is past the window. GREATEST
             -- ignores NULLs, and every membership of a dormant student has at
             -- least one of removed_at / class.deleted_at set, so this is
             -- never NULL for a row that reached here.
             and coalesce(
                   (select max(greatest(cm.removed_at, c.deleted_at))
                      from class_members cm
                      join classes c on c.id = cm.class_id
                     where cm.student_id = u.id),
                   u.created_at
                 ) < now() - interval '400 days'
           )
     order by u.created_at
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
    then
      v_blocked := v_blocked + 1;
      continue;
    end if;

    -- Mark this actor's audit rows BEFORE the delete (0024): afterwards
    -- SET NULL has fired and actor_id no longer identifies them.
    update audit_log
       set metadata = coalesce(metadata, '{}'::jsonb)
                      || jsonb_build_object('actor_purged', true)
     where actor_id = v_uid;

    delete from auth.users where id = v_uid;
    v_accounts := v_accounts + 1;
  end loop;

  raise notice
    'purge_soft_deleted: section_checks %+% (activity/student), accounts purged %, accounts blocked %',
    v_checks_activity, v_checks_student, v_accounts, v_blocked;
end;
$$;

-- =============================================================================
-- Verification — spot checks (scripts/verify-0025.sql is the full pass, and it
-- builds real student fixtures in a rolled-back transaction)
-- =============================================================================
--
-- -- 1. Dormancy is present and scoped to students. EXPECT: t / t
-- select strpos(prosrc, '400 days') > 0        as has_dormancy_window,
--        strpos(prosrc, 'role = ''student''') > 0 as students_only
-- from pg_proc where proname = 'purge_soft_deleted';
--
-- -- 2. The job still never writes users.deleted_at. EXPECT: f
-- select strpos(prosrc, 'update users') > 0 as writes_users
-- from pg_proc where proname = 'purge_soft_deleted';
--
-- -- 3. join_class still refuses disabled accounts — deliberately unchanged,
-- --    which is exactly why dormancy is derived. EXPECT: t
-- select strpos(prosrc, 'deleted_at is null') > 0 as still_gates_on_deleted
-- from pg_proc where proname = 'join_class';

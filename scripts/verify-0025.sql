-- =============================================================================
-- verify-0025.sql — derived student dormancy (0025)
-- -----------------------------------------------------------------------------
-- PORTED TO THE RUNNER 2026-11-26 (code review E3), against TODAY's
-- purge_soft_deleted. Run with
-- `pnpm verify:auth --target live|local --only verify-0025`.
--
-- Posture and grants (0025's A4/B1) are no longer repeated here: verify-0022's
-- A-shape checks them for the same function.
-- KEPT AS COMMENTS, not run: §D's "who is dormant right now" query, which
-- docs/compliance/retention-policy.md points to; it has no pass condition. The fixture now makes students the way every later
-- verify script does (insert auth.users, then set the role), not through a
-- student_domain row.
--
-- §C builds the six-case matrix and runs the REAL purge inside a transaction
-- that always ends in a raise: @local-only (review B5).
-- =============================================================================

-- @section A-shape
-- @expect-rows
select 'dormancy_is_students_only',
       strpos(prosrc, '400 days') > 0 and strpos(prosrc, 'role = ''student''') > 0,
       'a 400-day dormancy window, scoped to students'
from pg_proc where proname = 'purge_soft_deleted';
-- Dormancy is DERIVED. The job never writes users.deleted_at, which stays
-- reserved for explicit deletion; that keeps a between-terms student out of
-- join_class's deleted-account lockout.
select 'purge_never_writes_users',
       strpos(prosrc, 'update users') = 0,
       'purge_soft_deleted contains no UPDATE of users'
from pg_proc where proname = 'purge_soft_deleted';
select 'join_class_gates_deleted_accounts',
       strpos(prosrc, 'deleted_at is null') > 0,
       'join_class still refuses an account with deleted_at set'
from pg_proc where proname = 'join_class';

-- @section C-dormancy-matrix
-- @expect-error VERIFY-0025 PASS
-- @local-only
-- 1 = kept, 0 = purged:
--   active_member  a live membership protects the account        -> 1
--   ended_401d     membership ended past the 400-day window       -> 0
--   ended_100d     ended inside the window (the summer break)     -> 1
--   never_401d     never joined, account older than the window    -> 0
--   never_10d      never joined, new                              -> 1
--   teacher_bare   an old teacher who owns NOTHING (so no blocked-
--                  account guard protects them): students-only     -> 1
do $vfy$
declare
  v_t uuid := gen_random_uuid();
  v_t_bare uuid := gen_random_uuid();
  s_active uuid := gen_random_uuid();
  s_ended_old uuid := gen_random_uuid();
  s_ended_recent uuid := gen_random_uuid();
  s_never_old uuid := gen_random_uuid();
  s_never_new uuid := gen_random_uuid();
  v_class uuid; v_result text; v_report text; v_expected text;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  select u, 'vfy0025-' || o || '@vfy0025.example', '{}'::jsonb
    from unnest(array[v_t, v_t_bare, s_active, s_ended_old, s_ended_recent, s_never_old, s_never_new])
         with ordinality x(u, o);
  update users set role = 'teacher' where id in (v_t, v_t_bare);
  update users set role = 'student'
   where id in (s_active, s_ended_old, s_ended_recent, s_never_old, s_never_new);
  -- The bare teacher is old and owns nothing, so only the students-only scope
  -- keeps them (v_t owns the class, and the blocked-account guard would keep
  -- them whatever the scope said).
  update users set created_at = now() - interval '401 days' where id in (v_t_bare, s_never_old);
  update users set created_at = now() - interval '10 days' where id = s_never_new;

  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version)
  values (v_t, 'vfy 0025 dormancy', v_t, 'v1') returning id into v_class;
  insert into class_members (class_id, student_id) values (v_class, s_active);
  insert into class_members (class_id, student_id, removed_at)
  values (v_class, s_ended_old, now() - interval '401 days'),
         (v_class, s_ended_recent, now() - interval '100 days');

  begin
    perform purge_soft_deleted();
    v_result := 'job ran';
  exception when others then
    v_result := 'ABORTED -> ' || SQLSTATE || ': ' || SQLERRM;
  end;

  v_report :=
       'active_member=' || (select count(*) from users where id = s_active)
    || ' ended_401d='   || (select count(*) from users where id = s_ended_old)
    || ' ended_100d='   || (select count(*) from users where id = s_ended_recent)
    || ' never_401d='   || (select count(*) from users where id = s_never_old)
    || ' never_10d='    || (select count(*) from users where id = s_never_new)
    || ' teacher_bare=' || (select count(*) from users where id = v_t_bare);
  v_expected := 'active_member=1 ended_401d=0 ended_100d=1 never_401d=0 never_10d=1 teacher_bare=1';
  if v_result = 'job ran' and v_report = v_expected then
    raise exception 'VERIFY-0025 PASS (rolled back) >>> % | %', v_result, v_report;
  end if;
  raise exception 'VERIFY-0025 FAIL (rolled back) >>> % | got % | want %', v_result, v_report, v_expected;
end $vfy$;

-- @section E-residue
-- @expect-rows
select 'no_fixture_residue',
       (select count(*) from users where email like '%@vfy0025.example') = 0
       and (select count(*) from classes where name = 'vfy 0025 dormancy') = 0,
       'the dormancy matrix left nothing behind';

-- ===================== D. The rule, stated as a query ========================
-- NOT RUN by the runner (no pass condition). Paste into the SQL editor to see
-- who is dormant right now and since when; the job uses the same derivation,
-- and there is no stored column to look at, by design.
--
-- select u.id,
--        coalesce(
--          (select max(greatest(cm.removed_at, c.deleted_at))
--             from class_members cm join classes c on c.id = cm.class_id
--            where cm.student_id = u.id),
--          u.created_at) as dormant_since,
--        coalesce(
--          (select max(greatest(cm.removed_at, c.deleted_at))
--             from class_members cm join classes c on c.id = cm.class_id
--            where cm.student_id = u.id),
--          u.created_at) < now() - interval '400 days' as purge_eligible
-- from users u
-- where u.role = 'student'
--   and not exists (
--     select 1 from class_members cm join classes c on c.id = cm.class_id
--      where cm.student_id = u.id and cm.removed_at is null and c.deleted_at is null)
-- order by 2;

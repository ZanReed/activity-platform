-- =============================================================================
-- verify-0025.sql — author walkthrough for derived student dormancy
-- -----------------------------------------------------------------------------
-- Run AFTER applying 0025_student_dormancy.sql (SQL editor, service role).
--
-- ⚠ RUN SECTION 0 FIRST — it answers "is the migration actually live?".
-- ⚠ Section C reports success as a Postgres ERROR (`P0001`): the trailing
--   `raise exception` is what forces the rollback that protects live data.
--   Judge C by the TEXT of its message. A P0001 opening with EXPECTED
--   ROLLBACK is always a pass.
--
-- Section C is the most substantial test in this repo's SQL suite: it builds
-- FIVE real student accounts through the actual signup trigger, a real class,
-- and real memberships, runs the real purge, and reports who survived — then
-- rolls all of it back. It is the only way to exercise dormancy, because this
-- project has no student accounts.
--
-- No redeploy involved — pg_cron calls purge_soft_deleted inside the database.
-- =============================================================================

-- ===================== 0. PRECONDITION — run this FIRST ======================
-- EXPECT: applied = t. If f, run `supabase db push` and start over from here.
select strpos(prosrc, '400 days') > 0 as applied,
       case when strpos(prosrc, '400 days') > 0
            then 'OK — 0025 is live, continue to section A'
            else 'STOP — 0025 NOT APPLIED. Run: supabase db push'
       end as verdict
from pg_proc where proname = 'purge_soft_deleted';

-- ============================ A. Function shape ==============================

-- A1. Dormancy present and scoped to students. EXPECT: t / t
select strpos(prosrc, '400 days') > 0            as has_dormancy_window,
       strpos(prosrc, 'role = ''student''') > 0  as students_only
from pg_proc where proname = 'purge_soft_deleted';

-- A2. The job NEVER writes users.deleted_at — dormancy is derived, and that
--     column stays reserved for explicit/administrative deletion. This is the
--     invariant that keeps a between-terms student out of a join_class
--     lockout. EXPECT: f
select strpos(prosrc, 'update users') > 0 as writes_users_deleted_at
from pg_proc where proname = 'purge_soft_deleted';

-- A3. join_class still refuses accounts with deleted_at set — deliberately
--     UNCHANGED, and precisely why dormancy had to be derived rather than
--     marked. EXPECT: t
select strpos(prosrc, 'deleted_at is null') > 0 as still_gates_on_deleted
from pg_proc where proname = 'join_class';

-- A4. Posture unchanged by REPLACE. EXPECT: t / search_path=public
select prosecdef, proconfig from pg_proc where proname = 'purge_soft_deleted';

-- ============================== B. Grants ====================================

-- B1. EXPECT: service_role (+postgres) ONLY.
select coalesce(g.rolname, 'PUBLIC') as grantee
from pg_proc p
cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
left join pg_roles g on g.oid = a.grantee
where p.proname = 'purge_soft_deleted'
order by 1;

-- ===================== C. Behavior — the actual proof =========================

-- C1. Six-case fixture matrix. EXPECT exactly:
--       job ran | active_member=1 ended_401d=0 ended_100d=1
--                 never_401d=0 never_10d=1 teachers_left=3
--     reading 1 = kept, 0 = purged:
--       active_member  a live membership protects the account
--       ended_401d     past the 400-day window -> purged
--       ended_100d     inside the window -> kept (this is the summer-break
--                      case the original 30-day number would have destroyed)
--       never_401d     never joined, aged past the window -> purged
--       never_10d      never joined but new -> kept
--       teachers_left  dormancy is students-only; adjust to your teacher count
--
--     The trailing RAISE guarantees the rollback. Do not remove it.
do $outer$
declare
  v_teacher uuid;
  v_class uuid;
  s_active       uuid := gen_random_uuid();
  s_ended_old    uuid := gen_random_uuid();
  s_ended_recent uuid := gen_random_uuid();
  s_never_old    uuid := gen_random_uuid();
  s_never_new    uuid := gen_random_uuid();
  v_result text; v_report text;
begin
  select id into v_teacher from users where role = 'teacher' order by created_at limit 1;

  insert into student_domain (domain, notes) values ('test-dormancy.org', '0025 verify');

  -- real accounts via the real trigger (which also writes their audit rows,
  -- so this exercises 0024's SET NULL path as a side effect)
  insert into auth.users (id, email) values
    (s_active,'a@test-dormancy.org'), (s_ended_old,'b@test-dormancy.org'),
    (s_ended_recent,'c@test-dormancy.org'), (s_never_old,'d@test-dormancy.org'),
    (s_never_new,'e@test-dormancy.org');

  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version)
  values (v_teacher, 'Dormancy fixture', v_teacher, 'v1') returning id into v_class;

  insert into class_members (class_id, student_id) values (v_class, s_active);
  insert into class_members (class_id, student_id, removed_at)
    values (v_class, s_ended_old, now() - interval '401 days');
  insert into class_members (class_id, student_id, removed_at)
    values (v_class, s_ended_recent, now() - interval '100 days');

  update users set created_at = now() - interval '401 days' where id = s_never_old;
  update users set created_at = now() - interval '10 days'  where id = s_never_new;

  begin
    perform purge_soft_deleted();
    v_result := 'job ran';
  exception when others then
    v_result := 'ABORTED -> ' || SQLSTATE || ': ' || SQLERRM;
  end;

  v_report :=
      'active_member='  || (select count(*) from users where id = s_active)
   || ' ended_401d='    || (select count(*) from users where id = s_ended_old)
   || ' ended_100d='    || (select count(*) from users where id = s_ended_recent)
   || ' never_401d='    || (select count(*) from users where id = s_never_old)
   || ' never_10d='     || (select count(*) from users where id = s_never_new)
   || ' teachers_left=' || (select count(*) from users where role = 'teacher');

  raise exception 'EXPECTED ROLLBACK >>> % | % (1=kept 0=purged)', v_result, v_report;
end $outer$;

-- C2. Confirm C1 left nothing behind. EXPECT: your real counts, and 0 for
--     students / classes / memberships / domains — every fixture was rolled
--     back.
select (select count(*) from users) as users,
       (select count(*) from users where role = 'student') as students,
       (select count(*) from classes) as classes,
       (select count(*) from class_members) as memberships,
       (select count(*) from student_domain) as domains,
       (select count(*) from audit_log where metadata->>'actor_purged' = 'true') as stamped;

-- ===================== D. The rule, stated as a query ========================

-- D1. Who is dormant right now, and since when? The same derivation the job
--     uses, exposed for inspection — there is no stored column to look at, by
--     design. EXPECT: 0 rows today (no student accounts exist yet).
select u.id,
       coalesce(
         (select max(greatest(cm.removed_at, c.deleted_at))
            from class_members cm join classes c on c.id = cm.class_id
           where cm.student_id = u.id),
         u.created_at) as dormant_since,
       coalesce(
         (select max(greatest(cm.removed_at, c.deleted_at))
            from class_members cm join classes c on c.id = cm.class_id
           where cm.student_id = u.id),
         u.created_at) < now() - interval '400 days' as purge_eligible
from users u
where u.role = 'student'
  and not exists (
    select 1 from class_members cm join classes c on c.id = cm.class_id
     where cm.student_id = u.id and cm.removed_at is null and c.deleted_at is null)
order by 2;

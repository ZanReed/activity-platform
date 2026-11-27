-- verify-0109.sql — the advisor clean-ups (migration 0109, review 2026-11-26 B6).
-- Run with `pnpm verify:auth --target live|local`. §A reads the catalog only;
-- §B is a self-fixturing EXPECTED-ROLLBACK block, so nothing persists (P7).

-- @section A-posture
-- @expect-rows
select 'four_invoker_functions_pin_search_path',
       count(*) = 4
       and bool_and(exists (select 1 from unnest(coalesce(p.proconfig, '{}')) c where c like 'search_path=%')),
       'analytics_day, analytics_default_zone, analytics_rolled_boundary, users_timezone_guard pin search_path'
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace and n.nspname = 'public'
where p.proname in ('analytics_day', 'analytics_default_zone', 'analytics_rolled_boundary', 'users_timezone_guard');
select 'no_public_function_has_a_mutable_search_path',
       not exists (select 1 from pg_proc p
                    join pg_namespace n on n.oid = p.pronamespace and n.nspname = 'public'
                    left join pg_depend d on d.objid = p.oid and d.deptype = 'e'
                   where d.objid is null
                     and p.prokind in ('f', 'p')
                     and not exists (select 1 from unnest(coalesce(p.proconfig, '{}')) c where c like 'search_path=%')),
       'every function in public (outside extensions) pins its search_path — the advisor''s lint, as a row';
select 'four_tables_policies_scoped_to_authenticated',
       (select count(*) from pg_policies
         where schemaname = 'public'
           and tablename in ('class_members', 'classes', 'section_checks', 'submissions')) = 10
       and not exists (select 1 from pg_policies
                        where schemaname = 'public'
                          and tablename in ('class_members', 'classes', 'section_checks', 'submissions')
                          and roles <> '{authenticated}'),
       'all ten policies on class_members, classes, section_checks, submissions are to authenticated';
select 'predicates_unchanged',
       (select bool_and(qual = expected)
          from (values
            ('class_members_select_self',         '(student_id = ( SELECT auth.uid() AS uid))'),
            ('class_members_select_teacher',      'is_class_teacher(class_id)'),
            ('class_members_update_teacher',      'is_class_teacher(class_id)'),
            ('classes_select_member',             '((deleted_at IS NULL) AND is_class_member(id))'),
            ('classes_select_own',                '((teacher_id = ( SELECT auth.uid() AS uid)) AND (deleted_at IS NULL))'),
            ('classes_update_own',                '((teacher_id = ( SELECT auth.uid() AS uid)) AND (deleted_at IS NULL))'),
            ('section_checks_select_student',     '(student_id = ( SELECT auth.uid() AS uid))'),
            ('section_checks_select_teacher',     'can_read_activity(activity_id)'),
            ('submissions_select_activity_owner', '((assignment_id IS NULL) AND can_read_activity(activity_id))'),
            ('submissions_select_teacher',        '((assignment_id IS NOT NULL) AND can_access_assignment(assignment_id))')
          ) e(policyname, expected)
          join pg_policies p on p.schemaname = 'public' and p.policyname = e.policyname)
       and (select count(*) from pg_policies where schemaname = 'public'
              and policyname like any (array['class_members_%', 'classes_%', 'section_checks_%', 'submissions_%'])) = 10,
       'ALTER POLICY ... TO changed the roles only: every USING expression is what it was';

-- @section B-behavioral
-- @local-only (builds users, a class and a check)
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_t uuid := gen_random_uuid();
  v_s uuid := gen_random_uuid();
  v_k uuid;
  v_a uuid; v_v uuid;
  n   integer := 0;
  c   integer;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  select u, 'vfy0109-' || o || '@vfy0109.example', '{}'::jsonb
    from unnest(array[v_t, v_s]) with ordinality x(u, o);
  update users set role = 'teacher' where id = v_t;
  update users set role = 'student' where id = v_s;
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version)
  values (v_t, 'vfy 0109', v_t, 'vfy') returning id into v_k;
  insert into class_members (class_id, student_id) values (v_k, v_s);
  insert into activities (owner_id, title, slug, status) values (v_t, 'A', 'vfy-0109-a', 'published') returning id into v_a;
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_a, 1, '{"schemaVersion": 2, "meta": {"title": "A"}, "sections": []}', v_t) returning id into v_v;
  insert into section_checks (student_id, activity_id, activity_version_id, section_id, attempt_number, responses, verdicts)
  values (v_s, v_a, v_v, 's1', 1, '{}', '{}');

  -- B1 the teacher still reads their class, its roster and the check
  perform set_config('request.jwt.claims', json_build_object('sub', v_t, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  select (select count(*) from classes where id = v_k)
       + (select count(*) from class_members where class_id = v_k)
       + (select count(*) from section_checks where activity_id = v_a) into c;
  if c <> 3 then raise exception 'FAIL B1: teacher sees % of 3', c; end if;
  n := n + 1;

  -- B2 the student still reads their class, their membership and their check
  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', v_s, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  select (select count(*) from classes where id = v_k)
       + (select count(*) from class_members where class_id = v_k)
       + (select count(*) from section_checks where activity_id = v_a) into c;
  if c <> 3 then raise exception 'FAIL B2: student sees % of 3', c; end if;
  n := n + 1;

  -- B3 anon sees none of it (no policy applies to anon now; no grant error
  --    either, where the table is granted to anon at all)
  execute 'reset role';
  perform set_config('request.jwt.claims', '{"role": "anon"}', true);
  execute 'set local role anon';
  c := 0;
  begin
    select (select count(*) from classes where id = v_k)
         + (select count(*) from class_members where class_id = v_k)
         + (select count(*) from section_checks where activity_id = v_a) into c;
  exception when insufficient_privilege then c := 0;
  end;
  if c <> 0 then raise exception 'FAIL B3: anon sees %', c; end if;
  n := n + 1;

  -- B4 the timezone guard still runs (pinned path): a bad zone is refused
  execute 'reset role';
  begin
    update users set timezone = 'Not/AZone' where id = v_t;
    raise exception 'FAIL B4: a bad zone was accepted';
  exception when others then
    if sqlerrm not like 'timezone must be a valid IANA zone name%' then raise; end if;
  end;
  if analytics_default_zone() <> 'America/Chicago'
     or analytics_day('2026-01-01 12:00+00', 'Pacific/Auckland') <> date '2026-01-02' then
    raise exception 'FAIL B4: the analytics helpers changed';
  end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> B-advisor-cleanups: %/4', n;
end
$vfy$;

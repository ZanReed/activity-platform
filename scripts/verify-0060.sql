-- verify-0060.sql — the restore reads: my_checked_section_ids and
-- my_latest_checks (migration 0060; Fable review F1 + F6).
--
-- Run with `pnpm verify:auth --target live|local`. §B is a self-fixturing
-- EXPECTED-ROLLBACK block: real rows, claims-switched calls as `authenticated`,
-- everything rolled back (P7).
--
--   §A — catalog posture: both SECURITY DEFINER with a pinned search_path,
--        callable by authenticated, not by anon.
--   §B — own rows only, one row per section: the student gets distinct ids and
--        the LATEST attempt per section; the section filter holds; a CLASS
--        TEACHER (whose RLS policy can read the student's rows) gets nothing
--        (F6); a classmate gets nothing; no claims gets nothing.

-- @section A-catalog-posture
-- @expect-rows
select 'restore_reads_definer_pinned',
       (select count(*) = 2
               and bool_and(p.prosecdef and p.proconfig @> array['search_path=public'])
          from pg_proc p where p.proname in ('my_checked_section_ids', 'my_latest_checks')),
       'both SECURITY DEFINER, search_path pinned';
select 'restore_reads_signed_in_only',
       (select bool_and(has_function_privilege('authenticated', p.oid, 'execute')
                        and not has_function_privilege('anon', p.oid, 'execute'))
          from pg_proc p where p.proname in ('my_checked_section_ids', 'my_latest_checks')),
       'anon cannot execute either';

-- @section B-own-latest-rows
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_teacher  uuid := gen_random_uuid();
  v_student  uuid := gen_random_uuid();
  v_peer     uuid := gen_random_uuid();
  v_class    uuid;
  v_activity uuid;
  v_version  uuid;
  v_n        integer;
  v_ids      text[];
  v_row      record;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_teacher, 'vfy0060-t@vfy0060.example', '{}'::jsonb),
         (v_student, 'vfy0060-s@vfy0060.example', '{}'::jsonb),
         (v_peer,    'vfy0060-p@vfy0060.example', '{}'::jsonb);
  update users set role = 'teacher' where id = v_teacher;
  update users set role = 'student' where id in (v_student, v_peer);
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version)
  values (v_teacher, 'vfy 0060', v_teacher, 'vfy') returning id into v_class;
  insert into class_members (class_id, student_id) values (v_class, v_student), (v_class, v_peer);

  insert into activities (owner_id, title, slug, status)
  values (v_teacher, 'vfy 0060', 'vfy-0060', 'published') returning id into v_activity;
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_activity, 1, '{"schemaVersion": 2, "meta": {"title": "v"}, "sections": []}'::jsonb, v_teacher)
  returning id into v_version;
  update activities set current_version_id = v_version where id = v_activity;
  insert into class_activities (class_id, activity_id, added_by) values (v_class, v_activity, v_teacher);

  -- The student: three attempts on s1 (the latest says 'third'), one on s2.
  insert into section_checks (student_id, activity_id, activity_version_id, section_id, attempt_number, responses, verdicts)
  values (v_student, v_activity, v_version, 's1', 1, '{"blanks":{"b":"first"}}',  '{}'),
         (v_student, v_activity, v_version, 's1', 2, '{"blanks":{"b":"second"}}', '{}'),
         (v_student, v_activity, v_version, 's1', 3, '{"blanks":{"b":"third"}}',  '{"b":{"verdict":"correct"}}'),
         (v_student, v_activity, v_version, 's2', 1, '{"blanks":{"c":"only"}}',   '{}'),
         (v_peer,    v_activity, v_version, 's3', 1, '{"blanks":{"d":"peer"}}',   '{}');

  -- B1: the student's distinct checked section ids.
  perform set_config('request.jwt.claims', json_build_object('sub', v_student, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  select array_agg(section_id order by section_id) into v_ids from my_checked_section_ids(v_version);
  execute 'reset role';
  if v_ids is distinct from array['s1', 's2'] then
    raise exception 'FAIL B1: checked ids %', v_ids;
  end if;

  -- B2: the latest attempt per section, ONE row each.
  execute 'set local role authenticated';
  select count(*) into v_n from my_latest_checks(v_version, array['s1', 's2']);
  select * into v_row from my_latest_checks(v_version, array['s1', 's2']) where section_id = 's1';
  execute 'reset role';
  if v_n <> 2 or v_row.attempt_number <> 3 or v_row.responses->'blanks'->>'b' <> 'third'
     or v_row.verdicts->'b'->>'verdict' <> 'correct' then
    raise exception 'FAIL B2: % rows, s1 = %', v_n, row_to_json(v_row);
  end if;

  -- B3: the section filter holds (an unrequested section never comes back).
  execute 'set local role authenticated';
  select array_agg(section_id) into v_ids from my_latest_checks(v_version, array['s2']);
  execute 'reset role';
  if v_ids is distinct from array['s2'] then raise exception 'FAIL B3: %', v_ids; end if;

  -- B4 (F6): the CLASS TEACHER reads nothing, though their RLS policy could.
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  select count(*) into v_n from section_checks where student_id = v_student;  -- the policy DOES admit these
  if v_n = 0 then
    execute 'reset role';
    raise exception 'FAIL B4 precondition: the teacher policy no longer reads student rows; B4 would be vacuous';
  end if;
  select count(*) into v_n from my_checked_section_ids(v_version);
  if v_n <> 0 then execute 'reset role'; raise exception 'FAIL B4: teacher read % checked ids', v_n; end if;
  select count(*) into v_n from my_latest_checks(v_version, array['s1', 's2', 's3']);
  execute 'reset role';
  if v_n <> 0 then raise exception 'FAIL B4: teacher read % latest rows', v_n; end if;

  -- B5: a classmate reads only their own (s3).
  perform set_config('request.jwt.claims', json_build_object('sub', v_peer, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  select array_agg(section_id) into v_ids from my_latest_checks(v_version, array['s1', 's2', 's3']);
  execute 'reset role';
  if v_ids is distinct from array['s3'] then raise exception 'FAIL B5: classmate read %', v_ids; end if;

  -- B6: no claims reads nothing.
  perform set_config('request.jwt.claims', '', true);
  select count(*) into v_n from my_checked_section_ids(v_version);
  if v_n <> 0 then raise exception 'FAIL B6: no-claims read % ids', v_n; end if;

  raise exception 'EXPECTED ROLLBACK';
end
$vfy$;

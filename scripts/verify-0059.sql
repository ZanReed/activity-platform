-- verify-0059.sql — a student's progress: section_total on each check, the
-- defaulted record_check, and my_activity_progress() (migration 0059;
-- docs/design/student-experience-review.md, eng review D3–D7).
--
-- Run with `pnpm verify:auth --target live|local`. §B and §C are
-- self-fixturing EXPECTED-ROLLBACK blocks (the verify-0043 idiom): real rows
-- through the real functions, claims-switched calls as `authenticated`,
-- everything rolled back. Durable-write-free on every path (P7).
--
-- ⚠ ALSO RE-RUN verify-0020 and verify-0040: both call record_check, and
-- verify-0040 C1 asserts exactly one overload exists.
--
--   §A — catalog posture: the column and its check; ONE record_check, still
--        service-only; my_activity_progress SECURITY DEFINER with a pinned
--        search_path, callable by authenticated and not by anon.
--   §B — the deploy window (eng finding 3): a record_check call WITHOUT the
--        new argument still records (total NULL); a call WITH it stores it;
--        a non-positive total is refused by the column check.
--   §C — the read (S1/S2): own rows only; live classes only (a removed
--        member and an unshared activity read nothing); not started = 0;
--        k of n on the current version; a finished older version reads
--        earlier_done; a pre-0059 NULL total stays NULL (never "done");
--        released feedback flags; no claims reads nothing.

-- @section A-catalog-posture
-- @expect-rows
select 'section_total_column',
       exists (select 1 from information_schema.columns
                where table_name = 'section_checks' and column_name = 'section_total'
                  and data_type = 'integer' and is_nullable = 'YES'),
       'nullable integer (pre-0059 rows stay NULL)';
select 'record_check_one_overload',
       (select count(*) = 1 from pg_proc where proname = 'record_check'),
       'the 10-argument signature was dropped';
select 'record_check_service_only',
       (select not has_function_privilege('authenticated', p.oid, 'execute')
               and not has_function_privilege('anon', p.oid, 'execute')
               and has_function_privilege('service_role', p.oid, 'execute')
          from pg_proc p where p.proname = 'record_check'),
       'it accepts verdicts: students must never call it';
select 'record_check_total_defaults_null',
       (select pg_get_function_arguments(p.oid) ilike '%p_section_total integer DEFAULT NULL%'
          from pg_proc p where p.proname = 'record_check'),
       'the old caller resolves during the deploy window';
select 'progress_definer_pinned',
       (select p.prosecdef and p.proconfig @> array['search_path=public']
          from pg_proc p where p.proname = 'my_activity_progress'),
       'SECURITY DEFINER, search_path pinned';
select 'progress_signed_in_only',
       (select has_function_privilege('authenticated', p.oid, 'execute')
               and not has_function_privilege('anon', p.oid, 'execute')
          from pg_proc p where p.proname = 'my_activity_progress'),
       'anon cannot execute';

-- @section B-deploy-window
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_teacher  uuid := gen_random_uuid();
  v_student  uuid := gen_random_uuid();
  v_activity uuid;
  v_version  uuid;
  v_result   jsonb;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_teacher, 'vfy0059-bt@vfy0059.example', '{}'::jsonb),
         (v_student, 'vfy0059-bs@vfy0059.example', '{}'::jsonb);
  update users set role = 'teacher' where id = v_teacher;
  update users set role = 'student' where id = v_student;
  insert into activities (owner_id, title, slug, status)
  values (v_teacher, 'vfy 0059 b', 'vfy-0059-b', 'published') returning id into v_activity;
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_activity, 1, '{"schemaVersion": 2, "meta": {"title": "b"}, "sections": []}'::jsonb, v_teacher)
  returning id into v_version;

  -- B1: the pre-0059 caller (no p_section_total) still records, total NULL.
  v_result := record_check(v_student, v_activity, v_version, 'sec-1',
                           '{}'::jsonb, '{}'::jsonb, null, 60, 60, false);
  if (select section_total from section_checks where id = (v_result->>'check_id')::uuid) is not null then
    raise exception 'FAIL B1: an old-style call wrote a total';
  end if;

  -- B2: the new caller stores the total.
  v_result := record_check(v_student, v_activity, v_version, 'sec-2',
                           '{}'::jsonb, '{}'::jsonb, null, 60, 60, false, 3);
  if (select section_total from section_checks where id = (v_result->>'check_id')::uuid) is distinct from 3 then
    raise exception 'FAIL B2: total not stored';
  end if;

  -- B3: a non-positive total is refused by the column check.
  begin
    perform record_check(v_student, v_activity, v_version, 'sec-3',
                         '{}'::jsonb, '{}'::jsonb, null, 60, 60, false, 0);
    raise exception 'FAIL B3: a zero total was accepted';
  exception when check_violation then
    null;
  end;

  raise exception 'EXPECTED ROLLBACK';
end
$vfy$;

-- @section C-progress-read
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_teacher  uuid := gen_random_uuid();
  v_student  uuid := gen_random_uuid();
  v_peer     uuid := gen_random_uuid();
  v_gone     uuid := gen_random_uuid();
  v_class    uuid;
  v_a        uuid;  -- shared; v1 finished, v2 current and 2 of 3 checked
  v_a1       uuid;
  v_a2       uuid;
  v_b        uuid;  -- shared, never checked
  v_b1       uuid;
  v_c        uuid;  -- NOT shared with the class, but the student has a check on it
  v_c1       uuid;
  v_d        uuid;  -- shared; checked only before 0059 (NULL total)
  v_d1       uuid;
  v_check    uuid;
  v_row      record;
  v_n        integer;
  v_doc      jsonb := '{"schemaVersion": 2, "meta": {"title": "c"}, "sections": []}'::jsonb;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_teacher, 'vfy0059-ct@vfy0059.example', '{}'::jsonb),
         (v_student, 'vfy0059-cs@vfy0059.example', '{}'::jsonb),
         (v_peer,    'vfy0059-cp@vfy0059.example', '{}'::jsonb),
         (v_gone,    'vfy0059-cg@vfy0059.example', '{}'::jsonb);
  update users set role = 'teacher' where id = v_teacher;
  update users set role = 'student' where id in (v_student, v_peer, v_gone);

  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version)
  values (v_teacher, 'vfy 0059', v_teacher, 'vfy') returning id into v_class;
  insert into class_members (class_id, student_id) values (v_class, v_student), (v_class, v_peer);
  insert into class_members (class_id, student_id, removed_at) values (v_class, v_gone, now());

  -- Activity A: two versions; v2 is current.
  insert into activities (owner_id, title, slug, status) values (v_teacher, 'A', 'vfy-0059-a', 'published') returning id into v_a;
  insert into activity_versions (activity_id, version_num, content, created_by) values (v_a, 1, v_doc, v_teacher) returning id into v_a1;
  insert into activity_versions (activity_id, version_num, content, created_by) values (v_a, 2, v_doc, v_teacher) returning id into v_a2;
  update activities set current_version_id = v_a2 where id = v_a;
  -- Activity B: shared, never checked.
  insert into activities (owner_id, title, slug, status) values (v_teacher, 'B', 'vfy-0059-b2', 'published') returning id into v_b;
  insert into activity_versions (activity_id, version_num, content, created_by) values (v_b, 1, v_doc, v_teacher) returning id into v_b1;
  update activities set current_version_id = v_b1 where id = v_b;
  -- Activity C: NOT shared.
  insert into activities (owner_id, title, slug, status) values (v_teacher, 'C', 'vfy-0059-c', 'published') returning id into v_c;
  insert into activity_versions (activity_id, version_num, content, created_by) values (v_c, 1, v_doc, v_teacher) returning id into v_c1;
  update activities set current_version_id = v_c1 where id = v_c;
  -- Activity D: shared; only pre-0059 checks.
  insert into activities (owner_id, title, slug, status) values (v_teacher, 'D', 'vfy-0059-d', 'published') returning id into v_d;
  insert into activity_versions (activity_id, version_num, content, created_by) values (v_d, 1, v_doc, v_teacher) returning id into v_d1;
  update activities set current_version_id = v_d1 where id = v_d;

  insert into class_activities (class_id, activity_id, added_by)
  values (v_class, v_a, v_teacher), (v_class, v_b, v_teacher), (v_class, v_d, v_teacher);

  -- The student: A v1 finished (2 of 2), A v2 2 of 3 (one section twice),
  -- C checked (unshared), D checked before 0059.
  insert into section_checks (student_id, activity_id, activity_version_id, section_id, attempt_number, responses, verdicts, section_total)
  values (v_student, v_a, v_a1, 's1', 1, '{}', '{}', 2),
         (v_student, v_a, v_a1, 's2', 1, '{}', '{}', 2),
         (v_student, v_a, v_a2, 's1', 1, '{}', '{}', 3),
         (v_student, v_a, v_a2, 's1', 2, '{}', '{}', 3),
         (v_student, v_a, v_a2, 's2', 1, '{}', '{}', 3),
         (v_student, v_c, v_c1, 's1', 1, '{}', '{}', 1),
         (v_student, v_d, v_d1, 's1', 1, '{}', '{}', null);
  -- The peer finished all of A v2: must not leak into the student's count.
  insert into section_checks (student_id, activity_id, activity_version_id, section_id, attempt_number, responses, verdicts, section_total)
  values (v_peer, v_a, v_a2, 's1', 1, '{}', '{}', 3),
         (v_peer, v_a, v_a2, 's2', 1, '{}', '{}', 3),
         (v_peer, v_a, v_a2, 's3', 1, '{}', '{}', 3);
  -- Released feedback on the student's A v2 check; an UNRELEASED grade on D.
  select id into v_check from section_checks
   where student_id = v_student and activity_version_id = v_a2 and section_id = 's2';
  insert into check_grades (check_id, block_id, released_at) values (v_check, gen_random_uuid(), now());
  select id into v_check from section_checks where student_id = v_student and activity_id = v_d;
  insert into check_grades (check_id, block_id) values (v_check, gen_random_uuid());

  -- ---- as the student ------------------------------------------------------
  perform set_config('request.jwt.claims', json_build_object('sub', v_student, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  create temporary table vfy_progress on commit drop as select * from my_activity_progress();
  execute 'reset role';

  -- C1: exactly the three shared activities; the unshared one is absent.
  select count(*) into v_n from vfy_progress;
  if v_n <> 3 or exists (select 1 from vfy_progress where activity_id = v_c) then
    raise exception 'FAIL C1: % rows, unshared present: %', v_n,
      exists (select 1 from vfy_progress where activity_id = v_c);
  end if;

  -- C2: A — current v2, 2 of 3, earlier version finished, feedback released.
  select * into v_row from vfy_progress where activity_id = v_a;
  if v_row.current_version_id is distinct from v_a2
     or v_row.sections_total is distinct from 3
     or v_row.sections_checked is distinct from 2
     or not v_row.earlier_checked or not v_row.earlier_done
     or not v_row.feedback_released then
    raise exception 'FAIL C2: A read %', row_to_json(v_row);
  end if;

  -- C3: B — not started.
  select * into v_row from vfy_progress where activity_id = v_b;
  if v_row.sections_checked <> 0 or v_row.sections_total is not null
     or v_row.earlier_checked or v_row.feedback_released then
    raise exception 'FAIL C3: B read %', row_to_json(v_row);
  end if;

  -- C4: D — pre-0059 check: counted, but the total stays NULL; an
  --     UNRELEASED grade does not flag feedback.
  select * into v_row from vfy_progress where activity_id = v_d;
  if v_row.sections_checked <> 1 or v_row.sections_total is not null
     or v_row.feedback_released then
    raise exception 'FAIL C4: D read %', row_to_json(v_row);
  end if;

  -- C5: a removed member reads nothing.
  perform set_config('request.jwt.claims', json_build_object('sub', v_gone, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  select count(*) into v_n from my_activity_progress();
  execute 'reset role';
  if v_n <> 0 then raise exception 'FAIL C5: removed member read % rows', v_n; end if;

  -- C6: the peer sees their OWN count (3 of 3), not the student's.
  perform set_config('request.jwt.claims', json_build_object('sub', v_peer, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  select * into v_row from my_activity_progress() where activity_id = v_a;
  execute 'reset role';
  if v_row.sections_checked is distinct from 3 or v_row.earlier_checked or v_row.feedback_released then
    raise exception 'FAIL C6: peer read %', row_to_json(v_row);
  end if;

  -- C7: no claims reads nothing.
  perform set_config('request.jwt.claims', '', true);
  select count(*) into v_n from my_activity_progress();
  if v_n <> 0 then raise exception 'FAIL C7: no-claims read % rows', v_n; end if;

  raise exception 'EXPECTED ROLLBACK';
end
$vfy$;

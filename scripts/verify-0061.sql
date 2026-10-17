-- verify-0061.sql — the teacher's class progress reads (migration 0061;
-- docs/design/class-progress-view.md, CP-4, D3, D5–D8, DR-11).
--
-- Run with `pnpm verify:auth --target live|local`. §B is a self-fixturing
-- EXPECTED-ROLLBACK block (the verify-0059 idiom): real rows, claims-switched
-- calls as `authenticated`, everything rolled back. Durable-write-free on every
-- path (P7).
--
--   §A — catalog posture: the four reads are SECURITY DEFINER with a pinned
--        search_path, callable by authenticated and not by anon;
--        can_read_activity is still ownership-only and my_activity_progress
--        still reads auth.uid() (neither was touched, D3/D6).
--   §B — one fixture, every gate and every number:
--        B1–B9   class_progress: the roster (removed student and outsider
--                absent), the assignment (unshared and deleted activities
--                absent), statuses, NULL total, older version, score, to-grade,
--                and the refusals (another teacher, a deleted class, no claims)
--        B10     THE AGREEMENT ROW (D3): every class_progress cell equals
--                my_activity_progress() run as that student, for both
--                rostered students
--        B11–B14 activity_progress: classes the caller teaches with it
--                assigned (not a deleted one), rostered students only,
--                per-section rows, the refusal for a non-owner
--        B15–B18 class_student_work: latest attempt and attempt count, the
--                NULL-class form, and one refusal per gate
--        B19–B23 class_misconceptions: ever/still, the unmirrored id, the
--                outsider and the removed student not counted, wrong-answer
--                grouping (0.75 = .75), the 2-student floor, the refusals

-- @section A-catalog-posture
-- @expect-rows
select 'reads_definer_pinned',
       (select count(*) = 4 from pg_proc p
         where p.proname in ('class_progress', 'activity_progress',
                             'class_student_work', 'class_misconceptions')
           and p.prosecdef and p.proconfig @> array['search_path=public']),
       'all four SECURITY DEFINER, search_path pinned';
select 'reads_signed_in_only',
       (select bool_and(has_function_privilege('authenticated', p.oid, 'execute')
                        and not has_function_privilege('anon', p.oid, 'execute'))
               and count(*) = 4
          from pg_proc p
         where p.proname in ('class_progress', 'activity_progress',
                             'class_student_work', 'class_misconceptions')),
       'authenticated may call, anon may not';
select 'can_read_activity_not_widened',
       (select p.prosrc ilike '%a.owner_id = auth.uid()%'
               and p.prosrc not ilike '%class%'
               and not p.prosecdef
          from pg_proc p where p.proname = 'can_read_activity'),
       'still activity ownership, invoker (the Bank landmine)';
select 'student_progress_untouched',
       (select p.prosrc ilike '%m.student_id = auth.uid()%'
               and p.prosrc ilike '%sc.student_id = auth.uid()%'
          from pg_proc p where p.proname = 'my_activity_progress'),
       'my_activity_progress still reads only the caller (D3)';

-- @section B-reads
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_t   uuid := gen_random_uuid();  -- the teacher
  v_t2  uuid := gen_random_uuid();  -- another teacher
  v_s   uuid := gen_random_uuid();  -- rostered student
  v_p   uuid := gen_random_uuid();  -- rostered peer
  v_g   uuid := gen_random_uuid();  -- removed from the class
  v_o   uuid := gen_random_uuid();  -- in no class of the teacher's; checked A anyway
  v_k   uuid;  -- the class
  v_k2  uuid;  -- the teacher's DELETED class, A assigned
  v_k3  uuid;  -- the other teacher's class
  v_a   uuid; v_a1 uuid; v_a2 uuid;  -- shared; v2 current
  v_b   uuid; v_b1 uuid;             -- shared, never checked
  v_c   uuid; v_c1 uuid;             -- NOT shared; S checked it
  v_d   uuid; v_d1 uuid;             -- shared; pre-0059 NULL total
  v_e   uuid; v_e1 uuid;             -- shared, then soft-deleted
  v_sa1 uuid := gen_random_uuid();   -- short_answer blocks in A v2 s2
  v_sa2 uuid := gen_random_uuid();
  v_check uuid;
  v_j   jsonb;
  v_c_  jsonb;
  v_row record;
  v_n   integer;
  v_ok  boolean;
  v_plain jsonb := '{"schemaVersion": 2, "meta": {"title": "v"}, "sections": []}'::jsonb;
  v_doc_a2 jsonb;
begin
  v_doc_a2 := jsonb_build_object('schemaVersion', 2, 'meta', jsonb_build_object('title', 'A'),
    'sections', jsonb_build_array(
      jsonb_build_object('id', 's1', 'rows', '[]'::jsonb),
      jsonb_build_object('id', 's2', 'rows', jsonb_build_array(jsonb_build_object('columns',
        jsonb_build_array(jsonb_build_object('blocks', jsonb_build_array(
          jsonb_build_object('id', v_sa1, 'type', 'short_answer'),
          jsonb_build_object('id', v_sa2, 'type', 'short_answer'))))))),
      jsonb_build_object('id', 's3', 'rows', '[]'::jsonb)));

  insert into auth.users (id, email, raw_user_meta_data)
  values (v_t,  'vfy0061-t@vfy0061.example',  '{}'::jsonb),
         (v_t2, 'vfy0061-t2@vfy0061.example', '{}'::jsonb),
         (v_s,  'vfy0061-s@vfy0061.example',  '{}'::jsonb),
         (v_p,  'vfy0061-p@vfy0061.example',  '{}'::jsonb),
         (v_g,  'vfy0061-g@vfy0061.example',  '{}'::jsonb),
         (v_o,  'vfy0061-o@vfy0061.example',  '{}'::jsonb);
  update users set role = 'teacher' where id in (v_t, v_t2);
  update users set role = 'student' where id in (v_s, v_p, v_g, v_o);
  update users set display_name = 'Ana Vfy' where id = v_s;
  update users set display_name = '   '     where id = v_p;  -- blank → falls back to email

  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version)
  values (v_t, 'vfy 0061', v_t, 'vfy') returning id into v_k;
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version, deleted_at)
  values (v_t, 'vfy 0061 gone', v_t, 'vfy', now()) returning id into v_k2;
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version)
  values (v_t2, 'vfy 0061 other', v_t2, 'vfy') returning id into v_k3;
  insert into class_members (class_id, student_id) values (v_k, v_s), (v_k, v_p), (v_k2, v_o), (v_k3, v_o);
  insert into class_members (class_id, student_id, removed_at) values (v_k, v_g, now());

  insert into activities (owner_id, title, slug, status) values (v_t, 'A', 'vfy-0061-a', 'published') returning id into v_a;
  insert into activity_versions (activity_id, version_num, content, created_by) values (v_a, 1, v_plain, v_t) returning id into v_a1;
  insert into activity_versions (activity_id, version_num, content, created_by) values (v_a, 2, v_doc_a2, v_t) returning id into v_a2;
  update activities set current_version_id = v_a2 where id = v_a;
  insert into activities (owner_id, title, slug, status) values (v_t, 'B', 'vfy-0061-b', 'published') returning id into v_b;
  insert into activity_versions (activity_id, version_num, content, created_by) values (v_b, 1, v_plain, v_t) returning id into v_b1;
  update activities set current_version_id = v_b1 where id = v_b;
  insert into activities (owner_id, title, slug, status) values (v_t, 'C', 'vfy-0061-c', 'published') returning id into v_c;
  insert into activity_versions (activity_id, version_num, content, created_by) values (v_c, 1, v_plain, v_t) returning id into v_c1;
  update activities set current_version_id = v_c1 where id = v_c;
  insert into activities (owner_id, title, slug, status) values (v_t, 'D', 'vfy-0061-d', 'published') returning id into v_d;
  insert into activity_versions (activity_id, version_num, content, created_by) values (v_d, 1, v_plain, v_t) returning id into v_d1;
  update activities set current_version_id = v_d1 where id = v_d;
  insert into activities (owner_id, title, slug, status) values (v_t, 'E', 'vfy-0061-e', 'published') returning id into v_e;
  insert into activity_versions (activity_id, version_num, content, created_by) values (v_e, 1, v_plain, v_t) returning id into v_e1;
  update activities set current_version_id = v_e1 where id = v_e;

  -- Added oldest → newest: D, B, A (so the grid's newest-first order is A, B, D).
  insert into class_activities (class_id, activity_id, added_by, added_at)
  values (v_k, v_d, v_t, now() - interval '3 days'),
         (v_k, v_b, v_t, now() - interval '2 days'),
         (v_k, v_a, v_t, now() - interval '1 day'),
         (v_k, v_e, v_t, now()),
         (v_k2, v_a, v_t, now());

  -- S: A v1 finished (2 of 2); A v2 s1 twice (wrong then right), s2 once;
  --    C (unshared) and E (to be deleted) checked; D before 0059.
  insert into section_checks (student_id, activity_id, activity_version_id, section_id, attempt_number, responses, verdicts, section_total, created_at)
  values (v_s, v_a, v_a1, 's1', 1, '{}', '{}', 2, now() - interval '5 hours'),
         (v_s, v_a, v_a1, 's2', 1, '{}', '{}', 2, now() - interval '5 hours'),
         (v_s, v_a, v_a2, 's1', 1, '{"blanks": {"b1": "7"}}',
                                   '{"b1": {"verdict": "incorrect", "misconceptionIds": ["mis.vfy0061.x"]}}', 3, now() - interval '3 hours'),
         (v_s, v_a, v_a2, 's1', 2, '{"blanks": {"b1": "8"}}',
                                   '{"b1": {"verdict": "correct"}}', 3, now() - interval '2 hours'),
         (v_s, v_a, v_a2, 's2', 1, '{"blanks": {"b2": " 0.75", "b3": "x"}, "choices": {"mc1": ["c2"]}}',
                                   '{"b2": {"verdict": "incorrect"}, "b3": {"verdict": "incorrect"}, "mc1": {"verdict": "correct"}, "sa": {"verdict": "recorded"}}', 3, now() - interval '1 hour'),
         (v_s, v_c, v_c1, 's1', 1, '{}', '{}', 1, now()),
         (v_s, v_e, v_e1, 's1', 1, '{}', '{}', 1, now()),
         (v_s, v_d, v_d1, 's1', 1, '{}', '{}', null, now() - interval '4 hours');
  -- P: only A v1, one of two sections (older version, started), wrong with
  --    two tags (one not mirrored in the registry). B22 adds a v2 check later.
  insert into section_checks (student_id, activity_id, activity_version_id, section_id, attempt_number, responses, verdicts, section_total, created_at)
  values (v_p, v_a, v_a1, 's1', 1, '{"blanks": {"b1": "1"}}',
                                   '{"b1": {"verdict": "incorrect", "misconceptionIds": ["mis.vfy0061.x", "mis.vfy0061.unmirrored"]}}', 2, now() - interval '6 hours');
  -- O (outsider) and G (removed) are wrong on A v2 s2 b2 too, with the tag:
  --    neither may count anywhere.
  insert into section_checks (student_id, activity_id, activity_version_id, section_id, attempt_number, responses, verdicts, section_total)
  values (v_o, v_a, v_a2, 's2', 1, '{"blanks": {"b2": ".75"}}', '{"b2": {"verdict": "incorrect", "misconceptionIds": ["mis.vfy0061.x"]}}', 3),
         (v_g, v_a, v_a2, 's2', 1, '{"blanks": {"b2": ".75"}}', '{"b2": {"verdict": "incorrect", "misconceptionIds": ["mis.vfy0061.x"]}}', 3);
  -- One of S's two short answers in A v2 s2 is graded: one left to grade.
  select id into v_check from section_checks where student_id = v_s and activity_version_id = v_a2 and section_id = 's2';
  insert into check_grades (check_id, block_id) values (v_check, v_sa1);
  insert into misconception_registry (id, description) values ('mis.vfy0061.x', 'vfy: adds the denominators');
  update activities set deleted_at = now() where id = v_e;

  -- ======================= class_progress, as the teacher ===================
  perform set_config('request.jwt.claims', json_build_object('sub', v_t, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  v_j := class_progress(v_k);
  execute 'reset role';

  -- B1: the live roster only, by name (blank display_name → email).
  if (select array_agg(e->>'student_id' order by ord) from jsonb_array_elements(v_j->'students') with ordinality x(e, ord))
     is distinct from array[v_s::text, v_p::text] then
    raise exception 'FAIL B1: students %', v_j->'students';
  end if;
  if (v_j->'students'->1->>'name') <> 'vfy0061-p@vfy0061.example' then
    raise exception 'FAIL B1b: a blank display_name did not fall back to the email: %', v_j->'students'->1;
  end if;
  -- B2: assigned live activities only, newest first (C unshared, E deleted).
  if (select array_agg(e->>'activity_id' order by ord) from jsonb_array_elements(v_j->'activities') with ordinality x(e, ord))
     is distinct from array[v_a::text, v_b::text, v_d::text] then
    raise exception 'FAIL B2: activities %', v_j->'activities';
  end if;
  -- B3: no cell for the removed student, the outsider, or C/E/B.
  if exists (select 1 from jsonb_array_elements(v_j->'cells') c
              where (c->>'student_id')::uuid in (v_g, v_o)
                 or (c->>'activity_id')::uuid in (v_c, v_e, v_b)) then
    raise exception 'FAIL B3: an out-of-scope cell %', v_j->'cells';
  end if;
  -- B4: S on A — current v2, 2 of 3, earlier version done, shown v2,
  --     score 2 of 3 marked (s1's LATEST attempt is right; recorded excluded),
  --     one short answer left to grade.
  select c into v_c_ from jsonb_array_elements(v_j->'cells') c
   where (c->>'student_id')::uuid = v_s and (c->>'activity_id')::uuid = v_a;
  if (v_c_->>'sections_total')::int is distinct from 3
     or (v_c_->>'sections_checked')::int is distinct from 2
     or not (v_c_->>'earlier_checked')::boolean or not (v_c_->>'earlier_done')::boolean
     or (v_c_->>'shown_version_id')::uuid is distinct from v_a2
     or (v_c_->>'correct')::int is distinct from 2 or (v_c_->>'marked')::int is distinct from 4
     or (v_c_->>'to_grade')::int is distinct from 1 then
    raise exception 'FAIL B4: S/A cell %', v_c_;
  end if;
  -- B5: S on D — checked before 0059: counted, total NULL (never "done").
  select c into v_c_ from jsonb_array_elements(v_j->'cells') c
   where (c->>'student_id')::uuid = v_s and (c->>'activity_id')::uuid = v_d;
  if v_c_ is null or (v_c_->'sections_total') <> 'null'::jsonb
     or (v_c_->>'sections_checked')::int <> 1 or (v_c_->'shown_total') <> 'null'::jsonb then
    raise exception 'FAIL B5: S/D cell %', v_c_;
  end if;
  -- B6: P on A — only the older version: shown v1, 1 of 2, earlier not done.
  select c into v_c_ from jsonb_array_elements(v_j->'cells') c
   where (c->>'student_id')::uuid = v_p and (c->>'activity_id')::uuid = v_a;
  if (v_c_->>'shown_version_id')::uuid is distinct from v_a1
     or (v_c_->>'sections_checked')::int <> 0
     or not (v_c_->>'earlier_checked')::boolean or (v_c_->>'earlier_done')::boolean
     or (v_c_->>'shown_checked')::int <> 1 or (v_c_->>'shown_total')::int <> 2
     or (v_c_->>'correct')::int <> 0 or (v_c_->>'marked')::int <> 1 then
    raise exception 'FAIL B6: P/A cell %', v_c_;
  end if;
  -- B7: last_check_at is from in-scope work only (S's E and C checks are
  --     "now", in-scope work is at most an hour old).
  if (v_j->>'last_check_at')::timestamptz > now() - interval '30 minutes' then
    raise exception 'FAIL B7: last_check_at came from out-of-scope work: %', v_j->>'last_check_at';
  end if;

  -- B8: another teacher is refused.
  perform set_config('request.jwt.claims', json_build_object('sub', v_t2, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  v_ok := false;
  begin
    perform class_progress(v_k);
  exception when insufficient_privilege then v_ok := true;
  end;
  execute 'reset role';
  if not v_ok then raise exception 'FAIL B8: another teacher read the class'; end if;

  -- B9: the teacher's own DELETED class is refused; so is no claims.
  perform set_config('request.jwt.claims', json_build_object('sub', v_t, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  v_ok := false;
  begin
    perform class_progress(v_k2);
  exception when insufficient_privilege then v_ok := true;
  end;
  execute 'reset role';
  if not v_ok then raise exception 'FAIL B9: a deleted class was read'; end if;
  perform set_config('request.jwt.claims', '', true);
  v_ok := false;
  begin
    perform class_progress(v_k);
  exception when insufficient_privilege then v_ok := true;
  end;
  if not v_ok then raise exception 'FAIL B9b: no claims read the class'; end if;

  -- B10: THE AGREEMENT ROW (D3). For each rostered student, every activity
  --      class_progress lists must read the same as my_activity_progress()
  --      run as that student. A missing cell means "no checks at all".
  for v_row in select unnest(array[v_s, v_p]) as sid loop
    perform set_config('request.jwt.claims', json_build_object('sub', v_row.sid, 'role', 'authenticated')::text, true);
    execute 'set local role authenticated';
    create temporary table if not exists vfy_mine on commit drop as select * from my_activity_progress() limit 0;
    delete from vfy_mine;
    insert into vfy_mine select * from my_activity_progress();
    execute 'reset role';
    select count(*) into v_n
    from jsonb_array_elements(v_j->'activities') a
    left join vfy_mine m on m.activity_id = (a->>'activity_id')::uuid
    left join lateral (
      select c from jsonb_array_elements(v_j->'cells') c
       where (c->>'student_id')::uuid = v_row.sid
         and (c->>'activity_id') = (a->>'activity_id')
    ) cell on true
    where m.activity_id is null
       or m.current_version_id is distinct from (a->>'current_version_id')::uuid
       or m.sections_total   is distinct from (cell.c->>'sections_total')::int
       or m.sections_checked is distinct from coalesce((cell.c->>'sections_checked')::int, 0)
       or m.earlier_checked  is distinct from coalesce((cell.c->>'earlier_checked')::boolean, false)
       or m.earlier_done     is distinct from coalesce((cell.c->>'earlier_done')::boolean, false);
    if v_n <> 0 then
      raise exception 'FAIL B10: class_progress and my_activity_progress disagree on % activities for %', v_n, v_row.sid;
    end if;
  end loop;

  -- ======================= activity_progress ================================
  perform set_config('request.jwt.claims', json_build_object('sub', v_t, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  v_j := activity_progress(v_a);
  execute 'reset role';
  -- B11: one class (the deleted one is gone), students S then P.
  if jsonb_array_length(v_j->'classes') <> 1
     or (v_j->'classes'->0->>'class_id')::uuid <> v_k
     or (select array_agg(e->>'student_id' order by ord)
           from jsonb_array_elements(v_j->'classes'->0->'students') with ordinality x(e, ord))
        is distinct from array[v_s::text, v_p::text] then
    raise exception 'FAIL B11: classes %', v_j->'classes';
  end if;
  -- B12: S's summary agrees with the class grid; per-section rows count
  --      attempts; no row belongs to the outsider or the removed student.
  if (v_j->'classes'->0->'students'->0->>'sections_checked')::int <> 2
     or (v_j->'classes'->0->'students'->0->>'to_grade')::int <> 1
     or not exists (select 1 from jsonb_array_elements(v_j->'sections') s
                     where (s->>'student_id')::uuid = v_s and (s->>'version_id')::uuid = v_a2
                       and s->>'section_id' = 's1' and (s->>'attempts')::int = 2
                       and (s->>'correct')::int = 1 and (s->>'marked')::int = 1)
     or exists (select 1 from jsonb_array_elements(v_j->'sections') s
                 where (s->>'student_id')::uuid in (v_o, v_g)) then
    raise exception 'FAIL B12: activity_progress rows %', v_j;
  end if;
  -- B13: an unshared activity of the teacher's has no classes and no rows.
  execute 'set local role authenticated';
  v_j := activity_progress(v_c);
  execute 'reset role';
  if jsonb_array_length(v_j->'classes') <> 0 or jsonb_array_length(v_j->'sections') <> 0 then
    raise exception 'FAIL B13: unshared activity read %', v_j;
  end if;
  -- B14: another teacher is refused.
  perform set_config('request.jwt.claims', json_build_object('sub', v_t2, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  v_ok := false;
  begin
    perform activity_progress(v_a);
  exception when insufficient_privilege then v_ok := true;
  end;
  execute 'reset role';
  if not v_ok then raise exception 'FAIL B14: another teacher read the activity'; end if;

  -- ======================= class_student_work ===============================
  perform set_config('request.jwt.claims', json_build_object('sub', v_t, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  v_j := class_student_work(v_k, v_s, v_a);
  execute 'reset role';
  -- B15: current version first; s1's latest attempt (2 of 2) is the one shown.
  if (v_j->'versions'->0->>'version_id')::uuid <> v_a2
     or not (v_j->'versions'->0->>'is_current')::boolean
     or (v_j->'versions'->1->>'version_id')::uuid <> v_a1
     or not exists (select 1 from jsonb_array_elements(v_j->'versions'->0->'sections') s
                     where s->>'section_id' = 's1' and (s->>'attempts')::int = 2
                       and (s->>'attempt_number')::int = 2
                       and s->'responses'->'blanks'->>'b1' = '8')
     or not exists (select 1 from jsonb_array_elements(v_j->'versions'->0->'sections') s
                     where s->>'section_id' = 's2'
                       and s->'graded_block_ids' = jsonb_build_array(v_sa1))
     or v_j->'student'->>'name' <> 'Ana Vfy' then
    raise exception 'FAIL B15: student work %', v_j;
  end if;
  -- B16: the NULL-class form (the activity page) reads the same student.
  execute 'set local role authenticated';
  v_j := class_student_work(null, v_s, v_a);
  execute 'reset role';
  if jsonb_array_length(v_j->'versions') <> 2 then
    raise exception 'FAIL B16: NULL-class form %', v_j;
  end if;
  -- B17: one refusal per gate — removed student, outsider (even NULL-class:
  --      their only class of the teacher's is deleted), unshared activity,
  --      deleted activity, deleted class.
  for v_row in
    select * from (values
      (v_k, v_g, v_a, 'removed student'),
      (v_k, v_o, v_a, 'outsider'),
      (null::uuid, v_o, v_a, 'outsider, NULL class'),
      (v_k, v_s, v_c, 'unshared activity'),
      (v_k, v_s, v_e, 'deleted activity'),
      (v_k2, v_o, v_a, 'deleted class')) x(k, s, a, why)
  loop
    execute 'set local role authenticated';
    v_ok := false;
    begin
      perform class_student_work(v_row.k, v_row.s, v_row.a);
    exception when insufficient_privilege then v_ok := true;
    end;
    execute 'reset role';
    if not v_ok then raise exception 'FAIL B17: % was read', v_row.why; end if;
  end loop;
  -- B18: another teacher is refused, by class or not.
  perform set_config('request.jwt.claims', json_build_object('sub', v_t2, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  v_ok := false;
  begin
    perform class_student_work(v_k, v_s, v_a);
  exception when insufficient_privilege then v_ok := true;
  end;
  execute 'reset role';
  if not v_ok then raise exception 'FAIL B18: another teacher read the work'; end if;

  -- ======================= class_misconceptions =============================
  perform set_config('request.jwt.claims', json_build_object('sub', v_t, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  v_j := class_misconceptions(v_k);
  execute 'reset role';
  -- B19: mis.x — ever 2 (S on an earlier attempt, P), still 1 (P; S fixed it).
  --      The outsider and the removed student are not counted.
  select m into v_c_ from jsonb_array_elements(v_j->'misconceptions') m where m->>'id' = 'mis.vfy0061.x';
  if (v_c_->>'ever')::int is distinct from 2 or (v_c_->>'still')::int is distinct from 1
     or v_c_->>'description' <> 'vfy: adds the denominators'
     or exists (select 1 from jsonb_array_elements(v_c_->'students') s
                 where (s->>'student_id')::uuid in (v_o, v_g)) then
    raise exception 'FAIL B19: mis.x %', v_c_;
  end if;
  -- B20: an id the registry does not mirror is listed with a NULL description.
  select m into v_c_ from jsonb_array_elements(v_j->'misconceptions') m where m->>'id' = 'mis.vfy0061.unmirrored';
  if v_c_ is null or (v_c_->'description') <> 'null'::jsonb or (v_c_->>'ever')::int <> 1 then
    raise exception 'FAIL B20: unmirrored %', v_c_;
  end if;
  -- B21: without an activity there are no wrong-answer rows.
  if jsonb_array_length(v_j->'wrong_answers') <> 0 then
    raise exception 'FAIL B21: wrong answers without an activity %', v_j->'wrong_answers';
  end if;
  -- B22: on A (the activity page form, NULL class): b2 has 2 wrong — S " 0.75"
  --      is not the outsider's ".75" (not counted) — b3 (1 wrong) is under the
  --      floor; "0.75" and ".75" would group as one numeric value.
  execute 'set local role authenticated';
  v_j := class_misconceptions(null, v_a);
  execute 'reset role';
  if jsonb_array_length(v_j->'wrong_answers') <> 0 then
    raise exception 'FAIL B22a: only S is wrong on v2 b2 in scope, so nothing reaches the floor: %', v_j->'wrong_answers';
  end if;
  -- Put P wrong on v2 b2 with ".75": now 2 in scope, grouped as one answer.
  insert into section_checks (student_id, activity_id, activity_version_id, section_id, attempt_number, responses, verdicts, section_total)
  values (v_p, v_a, v_a2, 's2', 1, '{"blanks": {"b2": ".75"}}', '{"b2": {"verdict": "incorrect", "misconceptionIds": ["mis.vfy0061.x"]}}', 3);
  execute 'set local role authenticated';
  v_j := class_misconceptions(null, v_a);
  execute 'reset role';
  if jsonb_array_length(v_j->'wrong_answers') <> 1
     or v_j->'wrong_answers'->0->>'item_id' <> 'b2'
     or (v_j->'wrong_answers'->0->>'wrong')::int <> 2
     or jsonb_array_length(v_j->'wrong_answers'->0->'answers') <> 1
     or (v_j->'wrong_answers'->0->'answers'->0->>'count')::int <> 2
     or v_j->'wrong_answers'->0->'answers'->0->>'family' <> 'blanks'
     or v_j->'wrong_answers'->0->'answers'->0->'misconception_ids' <> '["mis.vfy0061.x"]'::jsonb then
    raise exception 'FAIL B22: wrong answers %', v_j->'wrong_answers';
  end if;
  -- B23: refusals — another teacher's class, and no class with no activity.
  perform set_config('request.jwt.claims', json_build_object('sub', v_t2, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  v_ok := false;
  begin
    perform class_misconceptions(v_k);
  exception when insufficient_privilege then v_ok := true;
  end;
  v_j := class_misconceptions(null, v_a);  -- another teacher, activity form: no classes, nothing
  execute 'reset role';
  if not v_ok then raise exception 'FAIL B23: another teacher read the class tags'; end if;
  if jsonb_array_length(v_j->'misconceptions') <> 0 or jsonb_array_length(v_j->'wrong_answers') <> 0 then
    raise exception 'FAIL B23b: another teacher read the activity tags %', v_j;
  end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_t, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  v_ok := false;
  begin
    perform class_misconceptions(null, null);
  exception when insufficient_privilege then v_ok := true;
  end;
  execute 'reset role';
  if not v_ok then raise exception 'FAIL B23c: no class and no activity was accepted'; end if;

  raise exception 'EXPECTED ROLLBACK';
end
$vfy$;

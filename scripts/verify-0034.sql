-- verify-0034.sql — teacher grading bound to section_checks (migration 0034).
--
-- Run with `pnpm verify:auth --target live|local`. §C/§D/§E are self-fixturing
-- EXPECTED-ROLLBACK blocks (the verify-0027 §E / verify-0030 §B / verify-0033 §C
-- idiom): real rows through the real functions, claims-switched RPC calls,
-- everything rolled back — durable-write-free on every path (P7).
--
-- WHY EACH SECTION EXISTS:
--   §A — catalog posture: the table exists with ZERO policies (the control is
--        the absence of a policy, so its emptiness is the assertion), RLS is
--        forced, all four RPCs are authenticated-only (0009's stanza rule), the
--        release enum label landed, and the FK delete rules are the ones the
--        design depends on (CASCADE from checks, SET NULL from the grader).
--   §B — the P5 drop audit: `grades` and `can_grade_submission` are GONE, and
--        the live purge function no longer references the dropped table. That
--        second row is the one that matters — a purge job referencing a dropped
--        relation fails at its next nightly fire, not at migration time.
--   §C — the write matrix (G3 + D13): 10 rows, every refusal path plus the
--        unanswered-block acceptance the design review amended in.
--   §D — release + readback (G4/G5/G2): the release event, its audit row, the
--        idempotent second call, the unreleased-after-release state, and the
--        student read INCLUDING the two rows the whole staleness ruling exists
--        for — text-changed fires, identical-text re-check does NOT.
--   §E — retention (G11): the CASCADE legs and the teacher-purge SET NULL leg
--        that the retired RESTRICT used to block.

-- @section A-catalog-posture
-- @expect-rows
select 'check_grades_exists',
       to_regclass('public.check_grades') is not null,
       'G1: the checks-native grading table';
select 'check_grades_rls_forced',
       (select relrowsecurity and relforcerowsecurity
          from pg_class where relname = 'check_grades'),
       'RLS enabled AND forced — the table owner does not get a free pass';
select 'check_grades_has_zero_policies',
       (select count(*) from pg_policies
         where tablename = 'check_grades') = 0,
       'G5/G10: the ABSENCE of a policy is the control; all access is via the 4 functions';
select 'check_grades_no_client_grants',
       not has_table_privilege('authenticated', 'check_grades', 'select')
       and not has_table_privilege('anon', 'check_grades', 'select'),
       'a stray grant would make the control depend on the policy set staying empty';
select 'grade_release_enum_exists',
       exists (select 1 from pg_enum e join pg_type t on t.oid = e.enumtypid
                where t.typname = 'audit_action' and e.enumlabel = 'grade.release'),
       'G4: an undeclared label raises at RUNTIME inside the RPC (the 0033 §A lesson)';
select 'check_id_cascades',
       (select confdeltype = 'c' from pg_constraint
         where conrelid = 'check_grades'::regclass
           and confrelid = 'section_checks'::regclass),
       'G11: retention completeness rides this cascade — 0022 never learns grades exist';
select 'graded_by_set_null',
       (select confdeltype = 'n' from pg_constraint
         where conrelid = 'check_grades'::regclass
           and confrelid = 'users'::regclass),
       'G1: 0024 event-outlives-account — a grade survives its grader, anonymized';
select 'one_grade_per_check_block',
       exists (select 1 from pg_indexes
                where tablename = 'check_grades' and indexdef ilike '%unique%'
                  and indexdef ilike '%check_id%' and indexdef ilike '%block_id%'),
       'a re-grade UPDATEs; double-submit cannot mint a second row';
select 'upsert_not_anon_reachable',
       not has_function_privilege('anon', 'upsert_check_grade(uuid,uuid,jsonb,text)', 'execute')
       and has_function_privilege('authenticated', 'upsert_check_grade(uuid,uuid,jsonb,text)', 'execute'),
       '0009 stanza: a write on a student academic record is never anon-callable';
select 'release_not_anon_reachable',
       not has_function_privilege('anon', 'release_check_grades(uuid,uuid)', 'execute')
       and has_function_privilege('authenticated', 'release_check_grades(uuid,uuid)', 'execute'),
       '0009 stanza';
select 'readback_not_anon_reachable',
       not has_function_privilege('anon', 'get_my_released_feedback(uuid)', 'execute')
       and has_function_privilege('authenticated', 'get_my_released_feedback(uuid)', 'execute'),
       '0009 stanza';
select 'queue_not_anon_reachable',
       not has_function_privilege('anon', 'list_grading_queue(uuid)', 'execute')
       and has_function_privilege('authenticated', 'list_grading_queue(uuid)', 'execute'),
       '0009 stanza';
select 'readback_never_reads_document',
       (select strpos(prosrc, 'activity_versions') = 0
          from pg_proc where proname = 'get_my_released_feedback'),
       'G5 leak guard: the student-callable read must never touch the raw document (0020 header)';
select 'upsert_gates_on_edit_not_read',
       (select strpos(prosrc, 'can_edit_activity') > 0 and strpos(prosrc, 'can_read_activity') = 0
          from pg_proc where proname = 'upsert_check_grade'),
       'G3: immune to the recorded Activity-Bank read-widening landmine';

-- @section B-drop-audit
-- @expect-rows
select 'grades_table_dropped',
       to_regclass('public.grades') is null,
       'P5: 0029 kept it only until this slice re-decided; the decision is check_grades';
select 'can_grade_submission_dropped',
       not exists (select 1 from pg_proc where proname = 'can_grade_submission'),
       'the helper routed through the dormant assignments table';
select 'purge_no_longer_references_grades',
       (select strpos(prosrc, 'from grades') = 0
          from pg_proc where proname = 'purge_soft_deleted'),
       'THE row that matters: a purge job citing a dropped relation dies at its next nightly fire, not at migration time';
select 'purge_still_counts_checks',
       (select strpos(prosrc, 'purge_soft_deleted: section_checks') > 0
          from pg_proc where proname = 'purge_soft_deleted'),
       'the NOTICE prefix verify-0029 greps survived the rewrite';

-- @section C-write-matrix
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_teacher   uuid := gen_random_uuid();
  v_other     uuid := gen_random_uuid();   -- a second teacher: the not-yours leg
  v_student   uuid := gen_random_uuid();
  v_activity  uuid;
  v_version   uuid;
  v_check     uuid;
  v_essay     uuid := gen_random_uuid();   -- short_answer block, has a rubric
  v_explain   uuid := gen_random_uuid();   -- self_explanation: never gradable
  v_blank     uuid := gen_random_uuid();   -- a blank id: not a free-text block
  v_unanswered uuid := gen_random_uuid();  -- essay with NO response key (D13)
  v_crit      uuid := gen_random_uuid();
  v_foreign   uuid := gen_random_uuid();   -- criterion id not on the rubric
  v_res       jsonb;
  v_stored    jsonb;
  -- refusal flags
  v_ref_other    boolean := false;
  v_ref_nocheck  boolean := false;
  v_ref_explain  boolean := false;
  v_ref_blank    boolean := false;
  v_ref_crit     boolean := false;
  v_ref_over     boolean := false;
  v_ref_neg      boolean := false;
begin
  -- ---- fixtures ----------------------------------------------------------
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_teacher, 'vfy0034-t@vfy0034.example', '{}'::jsonb),
         (v_other,   'vfy0034-o@vfy0034.example', '{}'::jsonb),
         (v_student, 'vfy0034-s@vfy0034.example', '{}'::jsonb);
  update users set role = 'teacher' where id in (v_teacher, v_other);
  update users set role = 'student' where id = v_student;

  insert into activities (owner_id, title, slug, status)
  values (v_teacher, 'vfy 0034', 'vfy-0034', 'published')
  returning id into v_activity;

  -- The document's real shape: sections -> rows -> columns -> blocks. Written
  -- as a JSON literal rather than a 12-deep jsonb_build_object nest ON PURPOSE:
  -- the nested-call form cost this script a debugging round when one missing
  -- paren silently swallowed the statement's own INTO clause, and a fixture
  -- nobody can read at a glance is a fixture nobody can check.
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_activity, 1, format($doc$
    {"schemaVersion": 2,
     "meta": {"title": "vfy 0034"},
     "sections": [
       {"id": "sec-1", "rows": [{"id": "%s", "columns": [{"id": "%s", "blocks": [
          {"id": "%s", "type": "short_answer",
           "rubric": {"criteria": [{"id": "%s", "label": "Reasoning", "maxPoints": 4}]}},
          {"id": "%s", "type": "essay"},
          {"id": "%s", "type": "self_explanation"},
          {"id": "%s", "type": "fill_in_blank"}
       ]}]}]},
       {"id": "sec-2", "rows": [{"id": "%s", "columns": [{"id": "%s", "blocks": [
          {"id": "%s", "type": "short_answer"}
       ]}]}]}
     ]}
    $doc$, gen_random_uuid(), gen_random_uuid(), v_essay, v_crit, v_unanswered,
           v_explain, v_blank, gen_random_uuid(), gen_random_uuid(),
           gen_random_uuid())::jsonb, v_teacher)
  returning id into v_version;
  update activities set current_version_id = v_version where id = v_activity;

  -- The check: the essay answered, the second essay left EMPTY (no key at all).
  insert into section_checks
    (student_id, activity_id, activity_version_id, section_id, attempt_number,
     responses, verdicts)
  values (v_student, v_activity, v_version, 'sec-1', 1,
    jsonb_build_object('freeText', jsonb_build_object(v_essay::text, 'the slope stays the same')),
    '{}'::jsonb)
  returning id into v_check;

  -- ---- (1) the happy path ------------------------------------------------
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);
  v_res := upsert_check_grade(v_check, v_essay,
             jsonb_build_array(jsonb_build_object('criterionId', v_crit, 'earned', 3)),
             'Nice reasoning.');
  if v_res->>'id' is null then raise exception 'FAIL upsert: no row returned'; end if;
  if v_res->>'released_at' is not null then
    raise exception 'FAIL upsert: a fresh grade must NOT be released';
  end if;

  -- maxPoints is DENORMALIZED BY THE SERVER, never taken from the client.
  select criteria into v_stored from check_grades where check_id = v_check and block_id = v_essay;
  if (v_stored->0->>'maxPoints')::numeric <> 4 then
    raise exception 'FAIL denormalization: maxPoints=% (want 4 from the pinned rubric)',
      v_stored->0->>'maxPoints';
  end if;

  -- ---- (2) a client-supplied maxPoints cannot inflate the denominator ----
  perform upsert_check_grade(v_check, v_essay,
    jsonb_build_array(jsonb_build_object('criterionId', v_crit, 'earned', 3, 'maxPoints', 999)),
    null);
  select criteria into v_stored from check_grades where check_id = v_check and block_id = v_essay;
  if (v_stored->0->>'maxPoints')::numeric <> 4 then
    raise exception 'FAIL: client maxPoints was trusted (got %)', v_stored->0->>'maxPoints';
  end if;

  -- ---- (3) re-grade UPDATEs, never inserts a second row ------------------
  if (select count(*) from check_grades where check_id = v_check and block_id = v_essay) <> 1 then
    raise exception 'FAIL: re-grade minted a second row';
  end if;

  -- ---- (4) D13: an UNANSWERED block is gradable --------------------------
  -- The amendment the design review won: the student who wrote nothing is
  -- exactly the one a teacher needs to reach, and an empty essay leaves no
  -- freeText key at all.
  perform upsert_check_grade(v_check, v_unanswered, '[]'::jsonb, 'You left this blank — see me.');
  if not exists (select 1 from check_grades where check_id = v_check and block_id = v_unanswered) then
    raise exception 'FAIL D13: an unanswered block could not be graded';
  end if;

  -- ---- (5) self_explanation is never gradable (G7) -----------------------
  begin perform upsert_check_grade(v_check, v_explain, '[]'::jsonb, 'x');
  exception when others then v_ref_explain := true; end;
  if not v_ref_explain then raise exception 'FAIL: self_explanation was graded'; end if;

  -- ---- (6) a non-free-text id is refused ---------------------------------
  begin perform upsert_check_grade(v_check, v_blank, '[]'::jsonb, 'x');
  exception when others then v_ref_blank := true; end;
  if not v_ref_blank then raise exception 'FAIL: a blank id was graded'; end if;

  -- ---- (7) a foreign criterion is refused --------------------------------
  begin perform upsert_check_grade(v_check, v_essay,
    jsonb_build_array(jsonb_build_object('criterionId', v_foreign, 'earned', 1)), null);
  exception when others then v_ref_crit := true; end;
  if not v_ref_crit then raise exception 'FAIL: scored a criterion not on the rubric'; end if;

  -- ---- (8) earned > max, and earned < 0 ----------------------------------
  begin perform upsert_check_grade(v_check, v_essay,
    jsonb_build_array(jsonb_build_object('criterionId', v_crit, 'earned', 5)), null);
  exception when others then v_ref_over := true; end;
  if not v_ref_over then raise exception 'FAIL: earned above maxPoints was accepted'; end if;

  begin perform upsert_check_grade(v_check, v_essay,
    jsonb_build_array(jsonb_build_object('criterionId', v_crit, 'earned', -1)), null);
  exception when others then v_ref_neg := true; end;
  if not v_ref_neg then raise exception 'FAIL: negative points were accepted'; end if;

  -- ---- (9) another teacher cannot grade ----------------------------------
  perform set_config('request.jwt.claims', json_build_object('sub', v_other)::text, true);
  begin perform upsert_check_grade(v_check, v_essay, '[]'::jsonb, 'mine now');
  exception when others then v_ref_other := true; end;
  if not v_ref_other then raise exception 'FAIL: a non-owner graded'; end if;

  -- ---- (10) a nonexistent check ------------------------------------------
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);
  begin perform upsert_check_grade(gen_random_uuid(), v_essay, '[]'::jsonb, null);
  exception when others then v_ref_nocheck := true; end;
  if not v_ref_nocheck then raise exception 'FAIL: graded a check that does not exist'; end if;

  raise exception 'EXPECTED ROLLBACK >>> C-write-matrix: 10/10';
end
$vfy$;

-- @section D-release-and-readback
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_teacher  uuid := gen_random_uuid();
  v_student  uuid := gen_random_uuid();
  v_peer     uuid := gen_random_uuid();   -- another student: the scoping leg
  v_activity uuid;
  v_version  uuid;
  v_check1   uuid;                        -- attempt 1 (graded)
  v_check2   uuid;                        -- attempt 2, TEXT CHANGED
  v_check3   uuid;                        -- attempt 3, text IDENTICAL to 2
  v_essay    uuid := gen_random_uuid();
  v_crit     uuid := gen_random_uuid();
  v_res      jsonb;
  v_cnt      int;
  v_stale    boolean;
  v_rows     int;
  v_ref_peer boolean := false;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_teacher, 'vfy0034d-t@vfy0034.example', '{}'::jsonb),
         (v_student, 'vfy0034d-s@vfy0034.example', '{}'::jsonb),
         (v_peer,    'vfy0034d-p@vfy0034.example', '{}'::jsonb);
  update users set role = 'teacher' where id = v_teacher;
  update users set role = 'student' where id in (v_student, v_peer);

  insert into activities (owner_id, title, slug, status)
  values (v_teacher, 'vfy 0034d', 'vfy-0034d', 'published') returning id into v_activity;
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_activity, 1, format($doc$
    {"schemaVersion": 2,
     "meta": {"title": "vfy 0034d"},
     "sections": [
       {"id": "sec-1", "rows": [{"id": "%s", "columns": [{"id": "%s", "blocks": [
          {"id": "%s", "type": "short_answer",
           "rubric": {"criteria": [{"id": "%s", "label": "Reasoning", "maxPoints": 4}]}}
       ]}]}]}
     ]}
    $doc$, gen_random_uuid(), gen_random_uuid(), v_essay, v_crit)::jsonb, v_teacher)
  returning id into v_version;
  update activities set current_version_id = v_version where id = v_activity;

  insert into section_checks
    (student_id, activity_id, activity_version_id, section_id, attempt_number, responses, verdicts)
  values (v_student, v_activity, v_version, 'sec-1', 1,
          jsonb_build_object('freeText', jsonb_build_object(v_essay::text, 'first answer')),
          '{}'::jsonb)
  returning id into v_check1;

  -- ---- (1) grade, then release ------------------------------------------
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);
  perform upsert_check_grade(v_check1, v_essay,
    jsonb_build_array(jsonb_build_object('criterionId', v_crit, 'earned', 3)), 'Good start.');

  -- Before release the student sees NOTHING.
  perform set_config('request.jwt.claims', json_build_object('sub', v_student)::text, true);
  select count(*) into v_cnt from get_my_released_feedback(v_activity);
  if v_cnt <> 0 then raise exception 'FAIL: unreleased feedback reached the student'; end if;

  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);
  v_res := release_check_grades(v_activity, v_student);
  if (v_res->>'released')::int <> 1 then
    raise exception 'FAIL release: released=% (want 1)', v_res->>'released';
  end if;
  if not exists (select 1 from audit_log
                  where action = 'grade.release' and target_id = v_activity) then
    raise exception 'FAIL: the release event was not audited';
  end if;

  -- ---- (2) idempotent second release, and no phantom audit row ----------
  v_res := release_check_grades(v_activity, v_student);
  if (v_res->>'released')::int <> 0 then
    raise exception 'FAIL: a second release re-stamped rows';
  end if;
  select count(*) into v_cnt from audit_log
   where action = 'grade.release' and target_id = v_activity;
  if v_cnt <> 1 then
    raise exception 'FAIL: a no-op release wrote an audit row (an audit rail that records non-events lies)';
  end if;

  -- ---- (3) THE BODY ROUND-TRIPS (P9, the get-feedback rule) -------------
  -- get-feedback served bodiless 200s its entire life. A readback that "works"
  -- while returning nothing is this slice's named failure mode, so the row
  -- asserts real content, not a row count.
  perform set_config('request.jwt.claims', json_build_object('sub', v_student)::text, true);
  select count(*) into v_cnt from get_my_released_feedback(v_activity)
   where general_feedback = 'Good start.'
     and (criteria->0->>'earned')::numeric = 3
     and (criteria->0->>'maxPoints')::numeric = 4
     and has_grader
     and attempt_number = 1;
  if v_cnt <> 1 then raise exception 'FAIL: the readback body did not round-trip'; end if;

  -- ---- (4) not stale yet -------------------------------------------------
  select stale into v_stale from get_my_released_feedback(v_activity);
  if v_stale then raise exception 'FAIL: stale fired with no revision'; end if;

  -- ---- (5) a re-check with CHANGED text goes stale -----------------------
  insert into section_checks
    (student_id, activity_id, activity_version_id, section_id, attempt_number, responses, verdicts)
  values (v_student, v_activity, v_version, 'sec-1', 2,
          jsonb_build_object('freeText', jsonb_build_object(v_essay::text, 'a REVISED answer')),
          '{}'::jsonb)
  returning id into v_check2;

  select stale into v_stale from get_my_released_feedback(v_activity);
  if not v_stale then raise exception 'FAIL: changed text did not go stale'; end if;

  -- ---- (6) THE ROW THE WHOLE RULING EXISTS FOR ---------------------------
  -- A re-check with IDENTICAL text must NOT be stale. This is the difference
  -- between G2's ruling and the attempt-number rule it replaced: re-checking to
  -- retry auto-graded blanks is a designed feature, and an attempt-number rule
  -- would cry wolf on every one of them until teachers learned to ignore it.
  insert into section_checks
    (student_id, activity_id, activity_version_id, section_id, attempt_number, responses, verdicts)
  values (v_student, v_activity, v_version, 'sec-1', 3,
          jsonb_build_object('freeText', jsonb_build_object(v_essay::text, 'a REVISED answer')),
          '{}'::jsonb)
  returning id into v_check3;

  -- Re-grade against the LATEST check, then confirm identical-text stays fresh.
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);
  perform upsert_check_grade(v_check3, v_essay,
    jsonb_build_array(jsonb_build_object('criterionId', v_crit, 'earned', 4)), 'Better.');
  perform release_check_grades(v_activity, v_student);

  perform set_config('request.jwt.claims', json_build_object('sub', v_student)::text, true);
  select stale into v_stale from get_my_released_feedback(v_activity);
  if v_stale then
    raise exception 'FAIL: identical-text re-check reported stale (the false-positive the ruling forbids)';
  end if;

  -- ---- (7) two released grades on one block: latest graded_at wins -------
  select count(*) into v_rows from get_my_released_feedback(v_activity);
  if v_rows <> 1 then
    raise exception 'FAIL: % rows for one block (the wire is a block-keyed map)', v_rows;
  end if;
  select count(*) into v_cnt from get_my_released_feedback(v_activity)
   where general_feedback = 'Better.';
  if v_cnt <> 1 then raise exception 'FAIL: the older grade won'; end if;

  -- ---- (8) a peer student sees nothing -----------------------------------
  perform set_config('request.jwt.claims', json_build_object('sub', v_peer)::text, true);
  select count(*) into v_cnt from get_my_released_feedback(v_activity);
  if v_cnt <> 0 then raise exception 'FAIL: a student read another student''s feedback'; end if;

  -- ---- (9) a student cannot release --------------------------------------
  begin perform release_check_grades(v_activity, v_student);
  exception when others then v_ref_peer := true; end;
  if not v_ref_peer then raise exception 'FAIL: a student released grades'; end if;

  -- ---- (10) the queue: free-text projection, no-answer rows, staleness ---
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);
  select count(*) into v_cnt from list_grading_queue(v_activity);
  if v_cnt <> 1 then
    raise exception 'FAIL queue: % rows (want 1 — latest check per student/section/version x 1 graded block)', v_cnt;
  end if;
  -- identity is roster-scoped: this student is in NO class of the teacher's
  select count(*) into v_cnt from list_grading_queue(v_activity)
   where student_label is null and not in_your_class;
  if v_cnt <> 1 then
    raise exception 'FAIL queue: a non-roster student''s identity leaked to the activity owner';
  end if;

  raise exception 'EXPECTED ROLLBACK >>> D-release-and-readback: 10/10';
end
$vfy$;

-- @section E-retention
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_teacher  uuid := gen_random_uuid();
  v_ghost    uuid := gen_random_uuid();   -- a teacher who owns nothing
  v_student  uuid := gen_random_uuid();
  v_activity uuid;
  v_version  uuid;
  v_check    uuid;
  v_essay    uuid := gen_random_uuid();
  v_cnt      int;
  v_grader   uuid;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_teacher, 'vfy0034e-t@vfy0034.example', '{}'::jsonb),
         (v_ghost,   'vfy0034e-g@vfy0034.example', '{}'::jsonb),
         (v_student, 'vfy0034e-s@vfy0034.example', '{}'::jsonb);
  update users set role = 'teacher' where id in (v_teacher, v_ghost);
  update users set role = 'student' where id = v_student;

  insert into activities (owner_id, title, slug, status)
  values (v_teacher, 'vfy 0034e', 'vfy-0034e', 'published') returning id into v_activity;
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_activity, 1, format($doc$
    {"schemaVersion": 2,
     "meta": {"title": "vfy 0034e"},
     "sections": [
       {"id": "sec-1", "rows": [{"id": "%s", "columns": [{"id": "%s", "blocks": [
          {"id": "%s", "type": "essay"}
       ]}]}]}
     ]}
    $doc$, gen_random_uuid(), gen_random_uuid(), v_essay)::jsonb, v_teacher)
  returning id into v_version;
  update activities set current_version_id = v_version where id = v_activity;

  insert into section_checks
    (student_id, activity_id, activity_version_id, section_id, attempt_number, responses, verdicts)
  values (v_student, v_activity, v_version, 'sec-1', 1,
          jsonb_build_object('freeText', jsonb_build_object(v_essay::text, 'answer')), '{}'::jsonb)
  returning id into v_check;

  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);
  perform upsert_check_grade(v_check, v_essay, '[]'::jsonb, 'noted');

  -- ---- (1) graded_by SET NULL: the grade survives its grader --------------
  -- Tested on a grader who owns nothing, because that is the only shape in
  -- which the leg is reachable: activities.owner_id blocks deleting a teacher
  -- who still owns the activity (and purge_soft_deleted's own chain blocks the
  -- same case), so in the ORDINARY purge path an owner's checks — and their
  -- cascaded grades — are already gone before the account becomes eligible.
  -- What SET NULL buys is that no deletion path can ever be WEDGED by a grade,
  -- which is exactly what 0010's ON DELETE RESTRICT did and why the purge
  -- carried a `grades` blocker at all.
  update check_grades set graded_by = v_ghost where check_id = v_check;
  delete from auth.users where id = v_ghost;

  select count(*) into v_cnt from check_grades where check_id = v_check;
  if v_cnt <> 1 then raise exception 'FAIL: the grade died with its grader'; end if;
  select graded_by into v_grader from check_grades where check_id = v_check;
  if v_grader is not null then
    raise exception 'FAIL: graded_by was not nulled (the "former teacher" attribution depends on it)';
  end if;

  -- ---- (2) the CHECK cascade: retention completeness without new code -----
  -- 0022 taught purge_soft_deleted to delete section_checks by activity and by
  -- student. This cascade is why it never had to learn that grades exist —
  -- and, inverted, why the deferred pruning work must never delete a graded
  -- check row (the constraint recorded in the TODOS entry).
  delete from section_checks where id = v_check;
  select count(*) into v_cnt from check_grades where check_id = v_check;
  if v_cnt <> 0 then
    raise exception 'FAIL: a grade outlived its check (0022 purge paths would leak it)';
  end if;

  raise exception 'EXPECTED ROLLBACK >>> E-retention: 2/2';
end
$vfy$;

-- verify-0042.sql — AI grading assist: suggestion store + RPCs (migration 0042).
--
-- Run with `pnpm verify:auth --target live|local`. §B–§F are self-fixturing
-- EXPECTED-ROLLBACK blocks (the verify-0027 §E / verify-0034 §C idiom): real
-- rows through the real functions, claims-switched RPC calls, everything
-- rolled back — durable-write-free on every path (P7).
--
-- The matrix this file proves is EH-13's, verbatim from the reviewed plan
-- (docs/design/ai-grading-assist.md §3b):
--   §A — catalog posture: five tables, RLS forced, zero policies everywhere
--        except the registry's single read policy, the production partial
--        unique, the claimed partial index, grant stanzas, the auth-predicate
--        pins (claim/submit/confirm never cite can_read_activity), the shared
--        validator wired into upsert_check_grade, and NO per-row cost column
--        (EH-15).
--   §B — claim/submit: EH-12 empty exclusion, lease liveness, the shared
--        validator PARITY leg (same refusals from submit and upsert), rev
--        stamps mandatory, registry validation, high-confidence full
--        coverage, cross-teacher scoping, the EH-2 study-list refusal, the
--        non-service p_teacher_id refusal, provider_off.
--   §C — teacher resolution: confirm-unchanged vs edited (DR-2 server-side),
--        chip-strike-counts-as-edit, strike-of-unobserved refused, rev
--        mismatch ('suggestion_changed'), reject + reason, DR-10 provenance
--        visibility, study rows invisible, student read refused.
--   §D — lease expiry → re-claim, identical-text re-key (EH-3: same row, new
--        check), changed-text supersession, rev-bump re-claim of pending,
--        grade-exists exclusion (EH-5).
--   §E — the D13 gate: per-teacher quota trips on a LIVE aggregate (EH-8),
--        global cap trips independently, missing prices refuse, missing
--        budget row fails closed, local_worker bypasses (billable=false),
--        EH-14 non-roster exclusion under platform_api, and the EH-9
--        service_role identity branch.
--   §F — retention: the cascade from section_checks carries suggestions
--        (production AND study) with zero purge-function edits.

-- @section A-catalog-posture
-- @expect-rows
select 'suggestions_table_exists',
       to_regclass('public.check_grade_suggestions') is not null,
       'D2: the suggestion store';
select 'suggestions_rls_forced',
       (select relrowsecurity and relforcerowsecurity
          from pg_class where relname = 'check_grade_suggestions'),
       'RLS enabled AND forced';
select 'suggestions_zero_policies',
       (select count(*) from pg_policies
         where tablename = 'check_grade_suggestions') = 0,
       '0034 §B shape: the ABSENCE of a policy is the control';
select 'suggestions_no_client_grants',
       not has_table_privilege('authenticated', 'check_grade_suggestions', 'select')
       and not has_table_privilege('anon', 'check_grade_suggestions', 'select'),
       'drafted grades + student text never client-reachable';
select 'settings_locked_down',
       (select relrowsecurity and relforcerowsecurity from pg_class where relname = 'grading_settings')
       and (select count(*) from pg_policies where tablename = 'grading_settings') = 0
       and not has_table_privilege('authenticated', 'grading_settings', 'select'),
       'D11/D13: provider is a compliance gate, quota is budget — neither self-serviceable';
select 'budget_locked_down',
       (select relrowsecurity and relforcerowsecurity from pg_class where relname = 'grading_platform_budget')
       and (select count(*) from pg_policies where tablename = 'grading_platform_budget') = 0
       and not has_table_privilege('authenticated', 'grading_platform_budget', 'select'),
       'the global cap is the author''s backstop';
select 'prices_locked_down',
       (select relrowsecurity and relforcerowsecurity from pg_class where relname = 'grading_model_prices')
       and (select count(*) from pg_policies where tablename = 'grading_model_prices') = 0
       and not has_table_privilege('authenticated', 'grading_model_prices', 'select'),
       'EH-15: prices are enforcement inputs';
select 'registry_read_only_surface',
       (select relrowsecurity and relforcerowsecurity from pg_class where relname = 'misconception_registry')
       and (select count(*) from pg_policies where tablename = 'misconception_registry') = 1
       and has_table_privilege('authenticated', 'misconception_registry', 'select')
       and not has_table_privilege('authenticated', 'misconception_registry', 'insert'),
       'EH-7: public generated content — readable, never client-writable';
select 'suggestion_audit_labels',
       (select count(*) = 3 from pg_enum e join pg_type t on t.oid = e.enumtypid
         where t.typname = 'audit_action'
           and e.enumlabel in ('suggestion.claim', 'suggestion.submit', 'suggestion.reject')),
       '0033 §A: an undeclared label raises at RUNTIME inside the RPC';
select 'status_enum_has_claimed',
       exists (select 1 from pg_enum e join pg_type t on t.oid = e.enumtypid
                where t.typname = 'suggestion_status' and e.enumlabel = 'claimed'),
       'EH-4: a lease with no content is a distinct state, not an overloaded pending';
select 'source_enum_exists',
       exists (select 1 from pg_type where typname = 'suggestion_source'),
       'EH-10: study rows are marked in-row';
select 'check_id_cascades',
       (select confdeltype = 'c' from pg_constraint
         where conrelid = 'check_grade_suggestions'::regclass
           and confrelid = 'section_checks'::regclass),
       'P7: retention rides the cascade — purge_soft_deleted never learns suggestions exist';
select 'production_partial_unique',
       exists (select 1 from pg_indexes
                where tablename = 'check_grade_suggestions'
                  and indexname = 'check_grade_suggestions_production_key'
                  and indexdef ilike '%unique%'
                  and indexdef ilike '%production%'),
       'one live draft per (check, block) — for production rows only (EH-10)';
select 'claimed_partial_index',
       exists (select 1 from pg_indexes
                where tablename = 'check_grade_suggestions'
                  and indexname = 'check_grade_suggestions_claimed_idx'),
       'EH-4: the claim scan';
select 'no_per_row_cost_column',
       not exists (select 1 from information_schema.columns
                    where table_name = 'check_grade_suggestions'
                      and column_name = 'est_cost_cents'),
       'EH-15: integer cents floors sub-cent calls to 0; tokens+prices are canonical';
select 'claim_not_anon_reachable',
       not has_function_privilege('anon', 'claim_grade_suggestions(int,int,int,int,text,boolean,uuid[],uuid)', 'execute')
       and has_function_privilege('authenticated', 'claim_grade_suggestions(int,int,int,int,text,boolean,uuid[],uuid)', 'execute'),
       '0009 stanza';
select 'submit_not_anon_reachable',
       not has_function_privilege('anon', 'submit_grade_suggestion(uuid,text,text,int,int,jsonb,text,jsonb,int,int)', 'execute')
       and has_function_privilege('authenticated', 'submit_grade_suggestion(uuid,text,text,int,int,jsonb,text,jsonb,int,int)', 'execute'),
       '0009 stanza';
select 'confirm_reject_list_grants',
       not has_function_privilege('anon', 'confirm_grade_suggestion(uuid,timestamptz,jsonb,text,jsonb)', 'execute')
       and has_function_privilege('authenticated', 'confirm_grade_suggestion(uuid,timestamptz,jsonb,text,jsonb)', 'execute')
       and not has_function_privilege('anon', 'reject_grade_suggestion(uuid,timestamptz,text)', 'execute')
       and has_function_privilege('authenticated', 'reject_grade_suggestion(uuid,timestamptz,text)', 'execute')
       and not has_function_privilege('anon', 'list_grade_suggestions(uuid)', 'execute')
       and has_function_privilege('authenticated', 'list_grade_suggestions(uuid)', 'execute'),
       '0009 stanza, three doors';
select 'validator_not_client_callable',
       not has_function_privilege('authenticated', 'validate_check_grade_criteria(uuid,uuid,jsonb)', 'execute')
       and not has_function_privilege('anon', 'validate_check_grade_criteria(uuid,uuid,jsonb)', 'execute'),
       'EH-6: an internal seam, not a client surface';
select 'claim_never_cites_read_helper',
       (select strpos(prosrc, 'can_read_activity') = 0
          from pg_proc where proname = 'claim_grade_suggestions'),
       'EH-1: immune to the recorded Activity-Bank read-widening landmine';
select 'submit_gates_on_edit_not_read',
       (select strpos(prosrc, 'can_edit_activity') > 0 and strpos(prosrc, 'can_read_activity') = 0
          from pg_proc where proname = 'submit_grade_suggestion'),
       'EH-1';
select 'confirm_gates_on_edit_not_read',
       (select strpos(prosrc, 'can_edit_activity') > 0 and strpos(prosrc, 'can_read_activity') = 0
          from pg_proc where proname = 'confirm_grade_suggestion'),
       'EH-1: confirm WRITES a grade';
select 'upsert_wired_to_shared_validator',
       (select strpos(prosrc, 'validate_check_grade_criteria') > 0
          from pg_proc where proname = 'upsert_check_grade'),
       'EH-6: one validator, two callers — parity is structural, then §B proves it behaviorally';

-- @section B-claim-submit-matrix
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_teacher  uuid := gen_random_uuid();
  v_other    uuid := gen_random_uuid();
  v_student  uuid := gen_random_uuid();
  v_activity uuid;
  v_version  uuid;
  v_check    uuid;
  v_sa1      uuid := gen_random_uuid();   -- short_answer, 1-criterion rubric
  v_essay2   uuid := gen_random_uuid();   -- essay, 2-criterion rubric
  v_unans    uuid := gen_random_uuid();   -- essay with NO response (EH-12)
  v_c1       uuid := gen_random_uuid();
  v_c2a      uuid := gen_random_uuid();
  v_c2b      uuid := gen_random_uuid();
  v_res      jsonb;
  v_sug1     uuid;
  v_sug2     uuid;
  v_ref      boolean;
begin
  -- ---- fixtures ----------------------------------------------------------
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_teacher, 'vfy0042b-t@vfy0042.example', '{}'::jsonb),
         (v_other,   'vfy0042b-o@vfy0042.example', '{}'::jsonb),
         (v_student, 'vfy0042b-s@vfy0042.example', '{}'::jsonb);
  update users set role = 'teacher' where id in (v_teacher, v_other);
  update users set role = 'student' where id = v_student;

  insert into activities (owner_id, title, slug, status)
  values (v_teacher, 'vfy 0042b', 'vfy-0042b', 'published')
  returning id into v_activity;

  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_activity, 1, format($doc$
    {"schemaVersion": 2,
     "meta": {"title": "vfy 0042b"},
     "sections": [
       {"id": "sec-1", "rows": [{"id": "%s", "columns": [{"id": "%s", "blocks": [
          {"id": "%s", "type": "short_answer",
           "rubric": {"criteria": [{"id": "%s", "label": "Reasoning", "maxPoints": 4}]}},
          {"id": "%s", "type": "essay",
           "rubric": {"criteria": [{"id": "%s", "label": "Method", "maxPoints": 3},
                                    {"id": "%s", "label": "Conclusion", "maxPoints": 2}]}},
          {"id": "%s", "type": "essay",
           "rubric": {"criteria": [{"id": "%s", "label": "Any", "maxPoints": 1}]}}
       ]}]}]}
     ]}
    $doc$, gen_random_uuid(), gen_random_uuid(), v_sa1, v_c1,
           v_essay2, v_c2a, v_c2b, v_unans, gen_random_uuid())::jsonb, v_teacher)
  returning id into v_version;
  update activities set current_version_id = v_version where id = v_activity;

  insert into section_checks
    (student_id, activity_id, activity_version_id, section_id, attempt_number,
     responses, verdicts)
  values (v_student, v_activity, v_version, 'sec-1', 1,
    jsonb_build_object('freeText', jsonb_build_object(
      v_sa1::text,   'the slope stays the same',
      v_essay2::text,'I compared unit rates and picked the cheaper one')),
    '{}'::jsonb)
  returning id into v_check;

  insert into misconception_registry (id, skill, description)
  values ('mis.vfy.test', 'skill.vfy', 'a verify fixture misconception');  -- richer columns optional today

  insert into grading_settings (teacher_id, provider)
  values (v_teacher, 'local_worker');

  -- ---- (1) claim: two answered blocks, the unanswered one EXCLUDED -------
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);
  v_res := claim_grade_suggestions(p_prompt_rev => 1, p_schema_rev => 1, p_model_id => 'vfy-model');
  if v_res->>'status' <> 'ok' then raise exception 'FAIL claim: status=%', v_res->>'status'; end if;
  if jsonb_array_length(v_res->'items') <> 2 then
    raise exception 'FAIL EH-12: % items (want 2 — the unanswered block must stay a plain manual row)',
      jsonb_array_length(v_res->'items');
  end if;
  select id into v_sug1 from check_grade_suggestions where block_id = v_sa1;
  select id into v_sug2 from check_grade_suggestions where block_id = v_essay2;
  if (select count(*) from check_grade_suggestions where status = 'claimed') <> 2 then
    raise exception 'FAIL: claim did not insert claimed rows';
  end if;
  if (select billable from check_grade_suggestions where id = v_sug1) then
    raise exception 'FAIL: a local_worker claim was stamped billable';
  end if;

  -- ---- (2) claim again: leases are live, nothing to hand out -------------
  v_res := claim_grade_suggestions(p_prompt_rev => 1, p_schema_rev => 1, p_model_id => 'vfy-model');
  if jsonb_array_length(v_res->'items') <> 0 then
    raise exception 'FAIL: double-claim handed out leased work';
  end if;

  -- ---- (3) submit sa1: high, full coverage, valid misconception ----------
  v_res := submit_grade_suggestion(v_sug1, 'high', 'vfy-model', 1, 1,
    jsonb_build_array(jsonb_build_object('criterionId', v_c1, 'earned', 3, 'maxPoints', 999)),
    'Good reasoning.',
    jsonb_build_array(jsonb_build_object('misId', 'mis.vfy.test', 'evidence', 'compared totals')),
    1200, 240);
  if (select status from check_grade_suggestions where id = v_sug1) <> 'pending' then
    raise exception 'FAIL: submit did not move claimed -> pending';
  end if;
  if (select (criteria->0->>'maxPoints')::numeric from check_grade_suggestions where id = v_sug1) <> 4 then
    raise exception 'FAIL EH-6: worker maxPoints was trusted';
  end if;

  -- ---- (4) submit against a non-claimed row: lease_expired ---------------
  v_ref := false;
  begin
    perform submit_grade_suggestion(v_sug1, 'high', 'vfy-model', 1, 1,
      jsonb_build_array(jsonb_build_object('criterionId', v_c1, 'earned', 2)), null, '[]'::jsonb, 1, 1);
  exception when others then
    v_ref := true;
    if sqlerrm <> 'lease_expired' then
      raise exception 'FAIL W-2: wanted the lease_expired error code, got %', sqlerrm;
    end if;
  end;
  if not v_ref then raise exception 'FAIL: a pending row accepted a second submit'; end if;

  -- ---- (5) refusal legs on the essay2 lease ------------------------------
  v_ref := false;  -- unknown misconception id (EH-7: rejected at the door)
  begin
    perform submit_grade_suggestion(v_sug2, 'high', 'vfy-model', 1, 1,
      jsonb_build_array(jsonb_build_object('criterionId', v_c2a, 'earned', 1),
                        jsonb_build_object('criterionId', v_c2b, 'earned', 1)),
      null, jsonb_build_array(jsonb_build_object('misId', 'mis.invented', 'evidence', 'x')), 1, 1);
  exception when others then v_ref := true; end;
  if not v_ref then raise exception 'FAIL EH-7: an invented misconception id was stored'; end if;

  v_ref := false;  -- partial coverage at high confidence
  begin
    perform submit_grade_suggestion(v_sug2, 'high', 'vfy-model', 1, 1,
      jsonb_build_array(jsonb_build_object('criterionId', v_c2a, 'earned', 1)),
      null, '[]'::jsonb, 1, 1);
  exception when others then v_ref := true; end;
  if not v_ref then raise exception 'FAIL: a partial high-confidence draft was stored'; end if;

  v_ref := false;  -- earned > max (validator leg)
  begin
    perform submit_grade_suggestion(v_sug2, 'high', 'vfy-model', 1, 1,
      jsonb_build_array(jsonb_build_object('criterionId', v_c2a, 'earned', 9),
                        jsonb_build_object('criterionId', v_c2b, 'earned', 1)),
      null, '[]'::jsonb, 1, 1);
  exception when others then v_ref := true; end;
  if not v_ref then raise exception 'FAIL: earned above maxPoints was accepted'; end if;

  v_ref := false;  -- foreign criterion (validator leg)
  begin
    perform submit_grade_suggestion(v_sug2, 'low', 'vfy-model', 1, 1,
      jsonb_build_array(jsonb_build_object('criterionId', gen_random_uuid(), 'earned', 1)),
      null, '[]'::jsonb, 1, 1);
  exception when others then v_ref := true; end;
  if not v_ref then raise exception 'FAIL: a foreign criterion was accepted'; end if;

  v_ref := false;  -- missing rev stamps
  begin
    perform submit_grade_suggestion(v_sug2, 'low', 'vfy-model', null, 1, '[]'::jsonb, null, '[]'::jsonb, 1, 1);
  exception when others then v_ref := true; end;
  if not v_ref then raise exception 'FAIL: a row without its rev stamps was stored'; end if;

  -- ---- (6) PARITY (EH-6): the grade write refuses the SAME matrix --------
  v_ref := false;
  begin
    perform upsert_check_grade(v_check, v_essay2,
      jsonb_build_array(jsonb_build_object('criterionId', v_c2a, 'earned', 9)), null);
  exception when others then v_ref := true; end;
  if not v_ref then raise exception 'FAIL parity: upsert accepted what submit refused (over max)'; end if;

  v_ref := false;
  begin
    perform upsert_check_grade(v_check, v_essay2,
      jsonb_build_array(jsonb_build_object('criterionId', gen_random_uuid(), 'earned', 1)), null);
  exception when others then v_ref := true; end;
  if not v_ref then raise exception 'FAIL parity: upsert accepted a foreign criterion'; end if;

  -- ---- (7) low confidence: partial criteria are acceptable telemetry -----
  perform submit_grade_suggestion(v_sug2, 'low', 'vfy-model', 1, 1,
    jsonb_build_array(jsonb_build_object('criterionId', v_c2a, 'earned', 1)),
    null, '[]'::jsonb, 1, 1);
  if (select machine_confidence from check_grade_suggestions where id = v_sug2) <> 'low' then
    raise exception 'FAIL D6: the abstain submit did not store';
  end if;

  -- ---- (8) cross-teacher scoping -----------------------------------------
  perform set_config('request.jwt.claims', json_build_object('sub', v_other)::text, true);
  v_res := claim_grade_suggestions();
  if v_res->>'status' <> 'provider_off' then
    raise exception 'FAIL W-2: no settings row must read provider_off, got %', v_res->>'status';
  end if;

  insert into grading_settings (teacher_id, provider) values (v_other, 'local_worker');
  v_res := claim_grade_suggestions(p_prompt_rev => 1, p_schema_rev => 1, p_model_id => 'vfy-model');
  if v_res->>'status' <> 'ok' or jsonb_array_length(v_res->'items') <> 0 then
    raise exception 'FAIL: another teacher''s claim saw someone else''s students';
  end if;

  -- the EH-2 leg: a study list naming the victim's check is DROPPED, counted
  v_res := claim_grade_suggestions(p_study => true, p_study_check_ids => array[v_check]);
  if jsonb_array_length(v_res->'items') <> 0 or (v_res->>'dropped')::int <> 1 then
    raise exception 'FAIL EH-2: the study path leaked a foreign check (items=%, dropped=%)',
      jsonb_array_length(v_res->'items'), v_res->>'dropped';
  end if;

  -- ---- (9) p_teacher_id without service_role is refused (EH-9) -----------
  v_ref := false;
  begin
    perform claim_grade_suggestions(p_teacher_id => v_teacher);
  exception when others then v_ref := true; end;
  if not v_ref then raise exception 'FAIL EH-9: a client claimed for another teacher'; end if;

  -- ---- (10) provider off is a typed status, never an empty array ---------
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);
  update grading_settings set provider = 'off' where teacher_id = v_teacher;
  v_res := claim_grade_suggestions();
  if v_res->>'status' <> 'provider_off' then
    raise exception 'FAIL DR-9/W-2: off must read provider_off, got %', v_res->>'status';
  end if;

  raise exception 'EXPECTED ROLLBACK >>> B-claim-submit-matrix: 10/10';
end
$vfy$;

-- @section C-teacher-resolution
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_teacher  uuid := gen_random_uuid();
  v_student  uuid := gen_random_uuid();
  v_activity uuid;
  v_version  uuid;
  v_check    uuid;
  v_a        uuid := gen_random_uuid();  -- confirm-unchanged leg
  v_b        uuid := gen_random_uuid();  -- strike-as-edit leg
  v_c        uuid := gen_random_uuid();  -- rev-mismatch + reject leg
  v_ca       uuid := gen_random_uuid();
  v_cb       uuid := gen_random_uuid();
  v_cc       uuid := gen_random_uuid();
  v_res      jsonb;
  v_sa       uuid; v_sb uuid; v_sc uuid;
  v_rev_a    timestamptz; v_rev_b timestamptz; v_rev_c timestamptz;
  v_ref      boolean;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_teacher, 'vfy0042c-t@vfy0042.example', '{}'::jsonb),
         (v_student, 'vfy0042c-s@vfy0042.example', '{}'::jsonb);
  update users set role = 'teacher' where id = v_teacher;
  update users set role = 'student' where id = v_student;

  insert into activities (owner_id, title, slug, status)
  values (v_teacher, 'vfy 0042c', 'vfy-0042c', 'published')
  returning id into v_activity;

  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_activity, 1, format($doc$
    {"schemaVersion": 2,
     "meta": {"title": "vfy 0042c"},
     "sections": [
       {"id": "sec-1", "rows": [{"id": "%s", "columns": [{"id": "%s", "blocks": [
          {"id": "%s", "type": "short_answer",
           "rubric": {"criteria": [{"id": "%s", "label": "A", "maxPoints": 4}]}},
          {"id": "%s", "type": "short_answer",
           "rubric": {"criteria": [{"id": "%s", "label": "B", "maxPoints": 4}]}},
          {"id": "%s", "type": "short_answer",
           "rubric": {"criteria": [{"id": "%s", "label": "C", "maxPoints": 4}]}}
       ]}]}]}
     ]}
    $doc$, gen_random_uuid(), gen_random_uuid(),
           v_a, v_ca, v_b, v_cb, v_c, v_cc)::jsonb, v_teacher)
  returning id into v_version;
  update activities set current_version_id = v_version where id = v_activity;

  insert into section_checks
    (student_id, activity_id, activity_version_id, section_id, attempt_number,
     responses, verdicts)
  values (v_student, v_activity, v_version, 'sec-1', 1,
    jsonb_build_object('freeText', jsonb_build_object(
      v_a::text, 'answer a', v_b::text, 'answer b', v_c::text, 'answer c')),
    '{}'::jsonb)
  returning id into v_check;

  insert into misconception_registry (id, skill, description)
  values ('mis.vfy.c', 'skill.vfy', 'fixture');
  insert into grading_settings (teacher_id, provider) values (v_teacher, 'local_worker');

  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);
  v_res := claim_grade_suggestions(p_prompt_rev => 1, p_schema_rev => 1, p_model_id => 'vfy-model');
  if jsonb_array_length(v_res->'items') <> 3 then
    raise exception 'FAIL fixture: % items (want 3)', jsonb_array_length(v_res->'items');
  end if;
  select id into v_sa from check_grade_suggestions where block_id = v_a;
  select id into v_sb from check_grade_suggestions where block_id = v_b;
  select id into v_sc from check_grade_suggestions where block_id = v_c;

  perform submit_grade_suggestion(v_sa, 'high', 'vfy-model', 1, 1,
    jsonb_build_array(jsonb_build_object('criterionId', v_ca, 'earned', 3, 'feedback', 'solid work')),
    'Nice one.', '[]'::jsonb, 1, 1);
  perform submit_grade_suggestion(v_sb, 'high', 'vfy-model', 1, 1,
    jsonb_build_array(jsonb_build_object('criterionId', v_cb, 'earned', 2)),
    null,
    jsonb_build_array(jsonb_build_object('misId', 'mis.vfy.c', 'evidence', 'inverted the ratio')),
    1, 1);
  perform submit_grade_suggestion(v_sc, 'high', 'vfy-model', 1, 1,
    jsonb_build_array(jsonb_build_object('criterionId', v_cc, 'earned', 1)),
    null, '[]'::jsonb, 1, 1);
  select updated_at into v_rev_a from check_grade_suggestions where id = v_sa;
  select updated_at into v_rev_b from check_grade_suggestions where id = v_sb;
  select updated_at into v_rev_c from check_grade_suggestions where id = v_sc;

  -- ---- (1) the sibling read shows three pendings -------------------------
  if (select count(*) from list_grade_suggestions(v_activity) where status = 'pending') <> 3 then
    raise exception 'FAIL DR-6: the queue read does not show the pending drafts';
  end if;

  -- ---- (2) confirm-unchanged: same values, WHITESPACE-only drift ---------
  -- DR-2 is whitespace-insensitive: "  Nice one. " is not an edit.
  v_res := confirm_grade_suggestion(v_sa, v_rev_a,
    jsonb_build_array(jsonb_build_object('criterionId', v_ca, 'earned', 3, 'feedback', 'solid  work')),
    '  Nice one. ');
  if v_res->>'status' <> 'confirmed' then
    raise exception 'FAIL DR-2: an untouched pre-fill read as %', v_res->>'status';
  end if;
  if not exists (select 1 from check_grades
                  where check_id = v_check and block_id = v_a and graded_by = v_teacher) then
    raise exception 'FAIL D2: confirm did not write the grade under the TEACHER''s uuid';
  end if;

  -- ---- (3) strike of an unobserved chip is refused; a real strike = edit -
  v_ref := false;
  begin
    perform confirm_grade_suggestion(v_sb, v_rev_b,
      jsonb_build_array(jsonb_build_object('criterionId', v_cb, 'earned', 2)),
      null, jsonb_build_array(to_jsonb('mis.never.observed'::text)));
  exception when others then v_ref := true; end;
  if not v_ref then raise exception 'FAIL DR-4: struck a chip the draft never observed'; end if;

  v_res := confirm_grade_suggestion(v_sb, v_rev_b,
    jsonb_build_array(jsonb_build_object('criterionId', v_cb, 'earned', 2)),
    null, jsonb_build_array(to_jsonb('mis.vfy.c'::text)));
  if v_res->>'status' <> 'edited' then
    raise exception 'FAIL DR-2/DR-4: a chip strike must count as an edit, got %', v_res->>'status';
  end if;

  -- ---- (4) rev mismatch: the draft the teacher read must be the draft ----
  v_ref := false;
  begin
    perform confirm_grade_suggestion(v_sc, v_rev_c - interval '1 second',
      jsonb_build_array(jsonb_build_object('criterionId', v_cc, 'earned', 1)), null);
  exception when others then
    v_ref := true;
    if sqlerrm <> 'suggestion_changed' then
      raise exception 'FAIL EH-5: wanted suggestion_changed, got %', sqlerrm;
    end if;
  end;
  if not v_ref then raise exception 'FAIL EH-5: a stale rev was resolved'; end if;

  -- ---- (5) reject with a one-tap reason ----------------------------------
  v_res := reject_grade_suggestion(v_sc, v_rev_c, 'wrong_points');
  if (select status from check_grade_suggestions where id = v_sc) <> 'rejected'
     or (select reject_reason from check_grade_suggestions where id = v_sc) <> 'wrong_points' then
    raise exception 'FAIL DR-8: reject did not record';
  end if;

  -- ---- (6) DR-10 provenance: resolved rows stay visible to the teacher ---
  if (select count(*) from list_grade_suggestions(v_activity)
       where status in ('confirmed', 'edited', 'rejected')) <> 3 then
    raise exception 'FAIL DR-10: resolved rows must remain joinable for the provenance trail';
  end if;

  -- ---- (7) a changed earned value reads as edited ------------------------
  -- (re-arm block A via a study row? No — study rows are never confirmed.
  --  The edited-by-points leg already rode block B's strike; prove the
  --  points path on a fresh claim after a re-check with NEW text in §D. Here
  --  prove the study-row refusal instead.)
  insert into check_grade_suggestions
    (check_id, block_id, source, status, source_text_hash, lease_expires_at,
     criteria, submitted_at, machine_confidence, model_id, prompt_rev, schema_rev)
  values (v_check, v_a, 'study', 'pending', md5('answer a'), now() + interval '15 minutes',
          jsonb_build_array(jsonb_build_object('criterionId', v_ca, 'earned', 1, 'maxPoints', 4)),
          now(), 'high', 'vfy-model', 1, 1)
  returning id into v_sa;
  v_ref := false;
  begin
    perform confirm_grade_suggestion(v_sa,
      (select updated_at from check_grade_suggestions where id = v_sa),
      jsonb_build_array(jsonb_build_object('criterionId', v_ca, 'earned', 1)), null);
  exception when others then v_ref := true; end;
  if not v_ref then raise exception 'FAIL EH-10: a study row was confirmed'; end if;

  -- and study rows never surface in the queue read
  if exists (select 1 from list_grade_suggestions(v_activity) lgs
              join check_grade_suggestions s on s.id = lgs.suggestion_id
              where s.source = 'study') then
    raise exception 'FAIL EH-10: a study row surfaced in the queue read';
  end if;

  -- ---- (8) a student cannot read the drafts ------------------------------
  perform set_config('request.jwt.claims', json_build_object('sub', v_student)::text, true);
  v_ref := false;
  begin perform 1 from list_grade_suggestions(v_activity) limit 1;
  exception when others then v_ref := true; end;
  if not v_ref then raise exception 'FAIL: a student read the suggestion queue'; end if;

  raise exception 'EXPECTED ROLLBACK >>> C-teacher-resolution: 8/8';
end
$vfy$;

-- @section D-lease-rekey-supersession
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_teacher  uuid := gen_random_uuid();
  v_student  uuid := gen_random_uuid();
  v_activity uuid;
  v_version  uuid;
  v_check1   uuid; v_check2 uuid; v_check3 uuid;
  v_essay    uuid := gen_random_uuid();
  v_crit     uuid := gen_random_uuid();
  v_res      jsonb;
  v_sug      uuid;
  v_sug2     uuid;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_teacher, 'vfy0042d-t@vfy0042.example', '{}'::jsonb),
         (v_student, 'vfy0042d-s@vfy0042.example', '{}'::jsonb);
  update users set role = 'teacher' where id = v_teacher;
  update users set role = 'student' where id = v_student;

  insert into activities (owner_id, title, slug, status)
  values (v_teacher, 'vfy 0042d', 'vfy-0042d', 'published')
  returning id into v_activity;

  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_activity, 1, format($doc$
    {"schemaVersion": 2,
     "meta": {"title": "vfy 0042d"},
     "sections": [
       {"id": "sec-1", "rows": [{"id": "%s", "columns": [{"id": "%s", "blocks": [
          {"id": "%s", "type": "essay",
           "rubric": {"criteria": [{"id": "%s", "label": "R", "maxPoints": 4}]}}
       ]}]}]}
     ]}
    $doc$, gen_random_uuid(), gen_random_uuid(), v_essay, v_crit)::jsonb, v_teacher)
  returning id into v_version;
  update activities set current_version_id = v_version where id = v_activity;

  insert into grading_settings (teacher_id, provider) values (v_teacher, 'local_worker');

  insert into section_checks
    (student_id, activity_id, activity_version_id, section_id, attempt_number, responses, verdicts)
  values (v_student, v_activity, v_version, 'sec-1', 1,
    jsonb_build_object('freeText', jsonb_build_object(v_essay::text, 'the slope stays the same')),
    '{}'::jsonb)
  returning id into v_check1;

  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);

  -- ---- (1) claim, then lease expiry makes the row re-claimable -----------
  v_res := claim_grade_suggestions(p_prompt_rev => 1, p_schema_rev => 1, p_model_id => 'vfy-model');
  if jsonb_array_length(v_res->'items') <> 1 then raise exception 'FAIL fixture claim'; end if;
  select id into v_sug from check_grade_suggestions where check_id = v_check1;

  update check_grade_suggestions set lease_expires_at = now() - interval '1 minute'
   where id = v_sug;
  v_res := claim_grade_suggestions(p_prompt_rev => 1, p_schema_rev => 1, p_model_id => 'vfy-model');
  if jsonb_array_length(v_res->'items') <> 1
     or (v_res->'items'->0->>'suggestion_id')::uuid <> v_sug
     or (select count(*) from check_grade_suggestions) <> 1 then
    raise exception 'FAIL EH-4: an expired lease was not re-claimed in place';
  end if;

  perform submit_grade_suggestion(v_sug, 'high', 'vfy-model', 1, 1,
    jsonb_build_array(jsonb_build_object('criterionId', v_crit, 'earned', 3)),
    null, '[]'::jsonb, 1, 1);

  -- ---- (2) re-check with IDENTICAL text: re-key, never re-infer (EH-3) ---
  insert into section_checks
    (student_id, activity_id, activity_version_id, section_id, attempt_number, responses, verdicts)
  values (v_student, v_activity, v_version, 'sec-1', 2,
    jsonb_build_object('freeText', jsonb_build_object(v_essay::text, 'the slope stays the same')),
    '{}'::jsonb)
  returning id into v_check2;

  v_res := claim_grade_suggestions(p_prompt_rev => 1, p_schema_rev => 1, p_model_id => 'vfy-model');
  if jsonb_array_length(v_res->'items') <> 0 then
    raise exception 'FAIL EH-3: an identical-text re-check triggered a re-inference';
  end if;
  if (select check_id from check_grade_suggestions where id = v_sug) <> v_check2
     or (select status from check_grade_suggestions where id = v_sug) <> 'pending' then
    raise exception 'FAIL EH-3: the pending draft was not re-keyed to the latest check';
  end if;

  -- ---- (3) re-check with CHANGED text: supersede + fresh claim -----------
  insert into section_checks
    (student_id, activity_id, activity_version_id, section_id, attempt_number, responses, verdicts)
  values (v_student, v_activity, v_version, 'sec-1', 3,
    jsonb_build_object('freeText', jsonb_build_object(v_essay::text, 'the slope doubles')),
    '{}'::jsonb)
  returning id into v_check3;

  v_res := claim_grade_suggestions(p_prompt_rev => 1, p_schema_rev => 1, p_model_id => 'vfy-model');
  if jsonb_array_length(v_res->'items') <> 1 then
    raise exception 'FAIL EH-3: changed text did not produce a fresh claim';
  end if;
  if (select status from check_grade_suggestions where id = v_sug) <> 'superseded' then
    raise exception 'FAIL EH-3: the outdated draft was not superseded';
  end if;
  select id into v_sug2 from check_grade_suggestions where check_id = v_check3;

  perform submit_grade_suggestion(v_sug2, 'high', 'vfy-model', 1, 1,
    jsonb_build_array(jsonb_build_object('criterionId', v_crit, 'earned', 2)),
    null, '[]'::jsonb, 1, 1);

  -- ---- (4) a rev bump re-claims the pending draft (§3) -------------------
  v_res := claim_grade_suggestions(p_prompt_rev => 2, p_schema_rev => 1, p_model_id => 'vfy-model');
  if jsonb_array_length(v_res->'items') <> 1
     or (v_res->'items'->0->>'suggestion_id')::uuid <> v_sug2 then
    raise exception 'FAIL §3: a rev bump did not re-claim the pending draft';
  end if;
  perform submit_grade_suggestion(v_sug2, 'high', 'vfy-model', 2, 1,
    jsonb_build_array(jsonb_build_object('criterionId', v_crit, 'earned', 2)),
    null, '[]'::jsonb, 1, 1);

  -- ---- (5) grade-exists exclusion (EH-5): a graded block is off-limits ---
  perform upsert_check_grade(v_check3, v_essay,
    jsonb_build_array(jsonb_build_object('criterionId', v_crit, 'earned', 4)), 'hand-graded');
  v_res := claim_grade_suggestions(p_prompt_rev => 3, p_schema_rev => 1, p_model_id => 'vfy-model');
  if jsonb_array_length(v_res->'items') <> 0 then
    raise exception 'FAIL EH-5: a graded block''s draft was re-claimed';
  end if;

  raise exception 'EXPECTED ROLLBACK >>> D-lease-rekey-supersession: 5/5';
end
$vfy$;

-- @section E-quota-and-identity
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_teacher   uuid := gen_random_uuid();
  v_roster    uuid := gen_random_uuid();  -- student ON the roster
  v_stranger  uuid := gen_random_uuid();  -- link-share discovery student (EH-14)
  v_service   uuid := gen_random_uuid();  -- the platform worker's jwt sub
  v_activity  uuid;
  v_version   uuid;
  v_class     uuid;
  v_check_r   uuid; v_check_s uuid;
  v_essay     uuid := gen_random_uuid();
  v_crit      uuid := gen_random_uuid();
  v_res       jsonb;
  v_sug       uuid;
  v_ref       boolean;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_teacher,  'vfy0042e-t@vfy0042.example', '{}'::jsonb),
         (v_roster,   'vfy0042e-r@vfy0042.example', '{}'::jsonb),
         (v_stranger, 'vfy0042e-x@vfy0042.example', '{}'::jsonb);
  update users set role = 'teacher' where id = v_teacher;
  update users set role = 'student' where id in (v_roster, v_stranger);

  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version)
  values (v_teacher, 'vfy 0042e', v_teacher, 'vfy') returning id into v_class;
  insert into class_members (class_id, student_id) values (v_class, v_roster);

  insert into activities (owner_id, title, slug, status)
  values (v_teacher, 'vfy 0042e', 'vfy-0042e', 'published')
  returning id into v_activity;

  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_activity, 1, format($doc$
    {"schemaVersion": 2,
     "meta": {"title": "vfy 0042e"},
     "sections": [
       {"id": "sec-1", "rows": [{"id": "%s", "columns": [{"id": "%s", "blocks": [
          {"id": "%s", "type": "essay",
           "rubric": {"criteria": [{"id": "%s", "label": "R", "maxPoints": 4}]}}
       ]}]}]}
     ]}
    $doc$, gen_random_uuid(), gen_random_uuid(), v_essay, v_crit)::jsonb, v_teacher)
  returning id into v_version;
  update activities set current_version_id = v_version where id = v_activity;

  insert into section_checks
    (student_id, activity_id, activity_version_id, section_id, attempt_number, responses, verdicts)
  values (v_roster, v_activity, v_version, 'sec-1', 1,
          jsonb_build_object('freeText', jsonb_build_object(v_essay::text, 'roster answer')), '{}'::jsonb)
  returning id into v_check_r;
  insert into section_checks
    (student_id, activity_id, activity_version_id, section_id, attempt_number, responses, verdicts)
  values (v_stranger, v_activity, v_version, 'sec-1', 1,
          jsonb_build_object('freeText', jsonb_build_object(v_essay::text, 'stranger answer')), '{}'::jsonb)
  returning id into v_check_s;

  insert into grading_settings (teacher_id, provider, quota_microdollars)
  values (v_teacher, 'platform_api', 1000000);           -- $1 teacher quota
  insert into grading_platform_budget (monthly_cap_microdollars)
  values (100000000);                                     -- $100 global cap
  insert into grading_model_prices
    (model_id, input_microdollars_per_mtok, output_microdollars_per_mtok)
  values ('vfy-hosted', 5000000, 15000000);               -- $5 / $15 per MTok

  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);

  -- ---- (1) EH-14: platform_api claims exclude the non-roster student -----
  v_res := claim_grade_suggestions(p_prompt_rev => 1, p_schema_rev => 1, p_model_id => 'vfy-hosted');
  if v_res->>'status' <> 'ok' or jsonb_array_length(v_res->'items') <> 1
     or (v_res->'items'->0->>'check_id')::uuid <> v_check_r then
    raise exception 'FAIL EH-14: a non-roster student''s work was claimed under platform_api (status=% items=%)',
      v_res->>'status', jsonb_array_length(v_res->'items');
  end if;
  select id into v_sug from check_grade_suggestions where check_id = v_check_r;
  if not (select billable from check_grade_suggestions where id = v_sug) then
    raise exception 'FAIL §7a: a platform_api claim was not stamped billable';
  end if;

  -- ---- (2) EH-8: spend past the teacher quota gates the NEXT claim -------
  -- 100k in × $5/MTok + 50k out × $15/MTok = $0.50 + $0.75 = $1.25 > $1.
  perform submit_grade_suggestion(v_sug, 'high', 'vfy-hosted', 1, 1,
    jsonb_build_array(jsonb_build_object('criterionId', v_crit, 'earned', 3)),
    null, '[]'::jsonb, 100000, 50000);
  v_res := claim_grade_suggestions(p_prompt_rev => 1, p_schema_rev => 1, p_model_id => 'vfy-hosted');
  if v_res->>'status' <> 'quota_paused' or v_res->>'resumes_at' is null then
    raise exception 'FAIL EH-8/D13: live spend did not pause the claim (status=%)', v_res->>'status';
  end if;

  -- ---- (3) local_worker BYPASSES the quota (provider scoping, §7a) -------
  update grading_settings set provider = 'local_worker' where teacher_id = v_teacher;
  v_res := claim_grade_suggestions(p_prompt_rev => 1, p_schema_rev => 1, p_model_id => 'vfy-local');
  if v_res->>'status' <> 'ok' then
    raise exception 'FAIL §7a: the author''s pilot self-throttled (status=%)', v_res->>'status';
  end if;
  -- Two items: the stranger's fresh claim (on-device processing inherits the
  -- teacher-can-already-read-it posture, EH-14) AND the roster row's pending
  -- draft re-claimed because the worker tuple changed (§3's rev-bump rule).
  if jsonb_array_length(v_res->'items') <> 2
     or not (v_res->'items' @> jsonb_build_array(jsonb_build_object('check_id', v_check_s::text))) then
    raise exception 'FAIL EH-14: local claim should see the link-share student''s work (items=%)',
      jsonb_array_length(v_res->'items');
  end if;
  -- billable is STICKY: the hosted spend on the re-claimed row must survive
  -- the local re-claim, or the quota aggregate forgets money already spent.
  if not (select billable from check_grade_suggestions where id = v_sug) then
    raise exception 'FAIL D13: a local re-claim erased recorded hosted spend';
  end if;

  -- ---- (4) the GLOBAL cap trips independently of the teacher quota -------
  update grading_settings set provider = 'platform_api', quota_microdollars = 100000000
   where teacher_id = v_teacher;
  update grading_platform_budget set monthly_cap_microdollars = 1;
  v_res := claim_grade_suggestions(p_prompt_rev => 1, p_schema_rev => 1, p_model_id => 'vfy-hosted');
  if v_res->>'status' <> 'quota_paused' then
    raise exception 'FAIL D13: the global backstop did not hold (status=%)', v_res->>'status';
  end if;

  -- ---- (5) a MISSING budget row fails closed -----------------------------
  delete from grading_platform_budget;
  v_res := claim_grade_suggestions(p_prompt_rev => 1, p_schema_rev => 1, p_model_id => 'vfy-hosted');
  if v_res->>'status' <> 'quota_paused' then
    raise exception 'FAIL D13: a missing budget row must read cap 0 (status=%)', v_res->>'status';
  end if;

  -- ---- (6) an EMPTY price table refuses platform_api outright ------------
  delete from grading_model_prices;
  v_ref := false;
  begin perform claim_grade_suggestions(p_prompt_rev => 1, p_schema_rev => 1, p_model_id => 'vfy-hosted');
  exception when others then v_ref := true; end;
  if not v_ref then
    raise exception 'FAIL EH-15: platform_api claimed with no prices configured';
  end if;

  -- ---- (7) EH-9: the service_role branch claims FOR a teacher ------------
  update grading_settings set provider = 'local_worker' where teacher_id = v_teacher;
  perform set_config('request.jwt.claims',
    json_build_object('sub', v_service, 'role', 'service_role')::text, true);
  v_res := claim_grade_suggestions(p_prompt_rev => 1, p_schema_rev => 1,
                                   p_model_id => 'vfy-local', p_teacher_id => v_teacher);
  if v_res->>'status' <> 'ok' then
    raise exception 'FAIL EH-9: the platform worker could not claim for its teacher (status=%)',
      v_res->>'status';
  end if;

  raise exception 'EXPECTED ROLLBACK >>> E-quota-and-identity: 7/7';
end
$vfy$;

-- @section F-retention-cascade
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_teacher  uuid := gen_random_uuid();
  v_student  uuid := gen_random_uuid();
  v_activity uuid;
  v_version  uuid;
  v_check    uuid;
  v_essay    uuid := gen_random_uuid();
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_teacher, 'vfy0042f-t@vfy0042.example', '{}'::jsonb),
         (v_student, 'vfy0042f-s@vfy0042.example', '{}'::jsonb);
  update users set role = 'teacher' where id = v_teacher;
  update users set role = 'student' where id = v_student;

  insert into activities (owner_id, title, slug, status)
  values (v_teacher, 'vfy 0042f', 'vfy-0042f', 'published')
  returning id into v_activity;
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_activity, 1, '{"schemaVersion":2,"meta":{"title":"f"},"sections":[]}'::jsonb, v_teacher)
  returning id into v_version;

  insert into section_checks
    (student_id, activity_id, activity_version_id, section_id, attempt_number, responses, verdicts)
  values (v_student, v_activity, v_version, 'sec-1', 1, '{}'::jsonb, '{}'::jsonb)
  returning id into v_check;

  -- One production row and one study row, written directly (this section
  -- proves the CASCADE, not the RPCs).
  insert into check_grade_suggestions
    (check_id, block_id, source, status, source_text_hash, lease_expires_at)
  values (v_check, v_essay, 'production', 'claimed', md5('x'), now() + interval '15 minutes'),
         (v_check, gen_random_uuid(), 'study', 'claimed', md5('x'), now() + interval '15 minutes');

  delete from section_checks where id = v_check;
  if (select count(*) from check_grade_suggestions where check_id = v_check) <> 0 then
    raise exception 'FAIL P7: the cascade left suggestion rows behind';
  end if;

  raise exception 'EXPECTED ROLLBACK >>> F-retention-cascade: 1/1';
end
$vfy$;

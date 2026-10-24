-- verify-0070.sql — the DoL retake and the "DoL passed" signal (migration 0070).
--
-- Run with `pnpm verify:auth --target live|local`. §B is a self-fixturing
-- EXPECTED-ROLLBACK block (the verify-0066/0068 idiom): its own users,
-- activities, versions and part counts, real functions, everything rolled
-- back (P7). docs/design/dol-retake.md (DL + DE rulings).
--
--   §A — posture: dol_pass RLS forced, student-read only; every writer and
--        helper definer + pinned; record_check ONE overload, service only;
--        the pass survives its evidence (`on delete set null`, DE-5).
--   §B — the engine at production values:
--        dol_pass_skill: final part only, consolidation never, copies through
--          their source, a missing final part grants nothing (DE-11, DE-12);
--        record_check: the allowance, the next-day retake (owner zone),
--          dol_form_stale, replay-before-refusal (DE-4), the rubric retake
--          waits for a RELEASED grade (DE-9), the auto pass is insert-once,
--          the pre-0070 call shape still records (DE-3);
--        the prune can't un-pass (DE-5); my_dol_state as the caller (DE-1);
--        set_dol_pass: owner only, DoL sections only, untick removes only a
--          teacher pass (DE-15); dol_pass_status;
--        mixed_tier_ok: P/E gated only when a pass-granting DoL is live (DE-10).

-- @section A-catalog-posture
-- @expect-rows
select 'dol_pass_rls_student_read_only',
       (select relrowsecurity and relforcerowsecurity from pg_class where relname = 'dol_pass')
       and has_table_privilege('authenticated', 'dol_pass', 'select')
       and not has_table_privilege('authenticated', 'dol_pass', 'insert')
       and not has_table_privilege('authenticated', 'dol_pass', 'update')
       and not has_table_privilege('authenticated', 'dol_pass', 'delete')
       and not has_table_privilege('anon', 'dol_pass', 'select'),
       'passes: a student reads their own; every write is a definer function';
select 'dol_pass_survives_its_evidence',
       (select bool_and(c.confdeltype = 'n')
          from pg_constraint c
          join pg_attribute att on att.attrelid = c.conrelid and att.attnum = c.conkey[1]
         where c.conrelid = 'dol_pass'::regclass and c.contype = 'f'
           and att.attname in ('activity_id', 'version_id', 'check_id', 'granted_by')),
       'DE-5: every evidence FK is ON DELETE SET NULL (the prune must not un-pass)';
select 'record_check_one_overload_service_only',
       (select count(*) = 1 from pg_proc where proname = 'record_check')
       and not has_function_privilege('authenticated',
         'record_check(uuid, uuid, uuid, text, jsonb, jsonb, text, integer, integer, boolean, integer, integer, integer, boolean, boolean)', 'execute'),
       'record_check: one overload, never client-callable (it accepts verdicts)';
select 'dol_rpcs_signed_in_definer_pinned',
       bool_and(has_function_privilege('authenticated', f, 'execute')
                and not has_function_privilege('anon', f, 'execute'))
       and (select bool_and(prosecdef and proconfig @> array['search_path=public'])
              from pg_proc where proname in ('my_dol_state', 'set_dol_pass', 'dol_pass_status',
                                             'dol_zone', 'dol_pass_skill', 'mixed_tier_ok')),
       'the student and teacher reads/writes: definer, pinned, never anonymous'
  from unnest(array['my_dol_state(uuid, uuid, text, boolean)', 'set_dol_pass(uuid, boolean)',
                    'dol_pass_status(uuid)']) f;
select 'dol_helpers_service_only',
       bool_and(not has_function_privilege('authenticated', f, 'execute')
                and not has_function_privilege('anon', f, 'execute')),
       'dol_zone / dol_pass_skill / mixed_tier_ok are reachable only through the guarded functions'
  from unnest(array['dol_zone(uuid)', 'dol_pass_skill(uuid)', 'mixed_tier_ok(text, uuid, text)']) f;
select 'skill_part_count_read_only_to_clients',
       has_table_privilege('authenticated', 'skill_part_count', 'select')
       and not has_table_privilege('authenticated', 'skill_part_count', 'insert')
       and not has_table_privilege('anon', 'skill_part_count', 'select')
       and (select relrowsecurity and relforcerowsecurity from pg_class where relname = 'skill_part_count'),
       'part counts: signed-in read, importer write';

-- @section B-engine
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_t       uuid := gen_random_uuid();
  v_x       uuid := gen_random_uuid();
  v_s1      uuid := gen_random_uuid();
  v_s2      uuid := gen_random_uuid();
  v_dol     jsonb := '{"schemaVersion": 2, "meta": {}, "sections": [
                       {"id": "lesson-sec", "isCheckpoint": true, "rows": []},
                       {"id": "dol-sec", "isCheckpoint": true, "rows": [],
                        "dol": {"skills": ["s.vfy0070.one"], "retake": true}}]}';
  v_plain   jsonb := '{"schemaVersion": 2, "meta": {}, "sections": [
                       {"id": "dol-sec", "isCheckpoint": true, "rows": []}]}';
  v_p1      uuid;  v_p2  uuid;  v_cons uuid;  v_two uuid;  v_copy uuid;
  v_p2v     uuid;  v_twov uuid;
  v_res     jsonb;
  v_got     text;
  v_check1  uuid;
  v_n       integer;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  select u, 'vfy0070-' || o || '@vfy0070.example', '{}'::jsonb
    from unnest(array[v_t, v_x, v_s1, v_s2]) with ordinality x(u, o);
  update users set role = 'teacher', timezone = 'UTC' where id in (v_t, v_x);
  update users set role = 'student' where id in (v_s1, v_s2);

  -- The catalogue: s.vfy0070.one has TWO parts and a consolidation;
  -- s.vfy0070.two has one part. A Bank copy of part 2 in the other teacher's
  -- library.
  insert into activities (owner_id, title, slug, status, source_path, primary_skill)
  values (v_t, 'part 1', 'vfy-0070-p1', 'published', 'c/01-chain.vfy/01.md', 's.vfy0070.one') returning id into v_p1;
  insert into activities (owner_id, title, slug, status, source_path, primary_skill)
  values (v_t, 'part 2', 'vfy-0070-p2', 'published', 'c/01-chain.vfy/02.md', 's.vfy0070.one') returning id into v_p2;
  insert into activities (owner_id, title, slug, status, source_path, primary_skill, consolidates_chain)
  values (v_t, 'cons', 'vfy-0070-cons', 'published', 'c/01-chain.vfy/03.md', 's.vfy0070.one', 'chain.vfy') returning id into v_cons;
  insert into activities (owner_id, title, slug, status, source_path, primary_skill)
  values (v_t, 'two', 'vfy-0070-two', 'published', 'c/02-chain.vfy2/01.md', 's.vfy0070.two') returning id into v_two;
  insert into activities (owner_id, title, slug, status, copied_from_activity_id)
  values (v_x, 'copy of part 2', 'vfy-0070-copy', 'published', v_p2) returning id into v_copy;
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_p2, 1, v_dol, v_t) returning id into v_p2v;
  update activities set current_version_id = v_p2v where id = v_p2;
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_two, 1, v_plain, v_t) returning id into v_twov;
  update activities set current_version_id = v_twov where id = v_two;

  -- ---- dol_pass_skill (DE-11, DE-12) ---------------------------------------
  -- No part count mirrored: s.vfy0070.one defaults to ONE part but two exist,
  -- so NOTHING grants (a missing/miscounted final part never lets one stand in).
  if dol_pass_skill(v_p2) is not null or dol_pass_skill(v_p1) is not null then
    raise exception 'FAIL B1: with no part count, a 2-part skill granted a pass';
  end if;
  insert into skill_part_count (id, parts) values ('s.vfy0070.one', 2), ('s.vfy0070.two', 1)
  on conflict (id) do update set parts = excluded.parts;
  if dol_pass_skill(v_p2) is distinct from 's.vfy0070.one' then raise exception 'FAIL B1: the final part does not grant'; end if;
  if dol_pass_skill(v_p1) is not null then raise exception 'FAIL B1: a non-final part grants'; end if;
  if dol_pass_skill(v_cons) is not null then raise exception 'FAIL B1: a consolidation grants'; end if;
  if dol_pass_skill(v_two) is distinct from 's.vfy0070.two' then raise exception 'FAIL B1: a one-part skill does not grant'; end if;
  if dol_pass_skill(v_copy) is distinct from 's.vfy0070.one' then raise exception 'FAIL B1: a Bank copy does not resolve through its source'; end if;
  update skill_part_count set parts = 3 where id = 's.vfy0070.one';
  if dol_pass_skill(v_p2) is not null then raise exception 'FAIL B1: part 2 of 3 (part 3 missing) granted'; end if;
  update skill_part_count set parts = 2 where id = 's.vfy0070.one';

  -- ---- the allowance and the retake (DL-6/7/8, DE-4, DE-9) ---------------
  v_res := record_check(v_s1, v_p2, v_p2v, 'dol-sec', '{}'::jsonb, '{"b1":{"verdict":"incorrect"}}'::jsonb,
                        'vfy0070-a1', 60, 60, false, 2, 2, 1, false, false);
  if (v_res->>'attempt_number')::int <> 1 or (v_res->>'dol_passed')::boolean then
    raise exception 'FAIL B2: attempt 1 %', v_res;
  end if;
  v_check1 := (v_res->>'check_id')::uuid;
  -- Same day: the retake is not open.
  v_got := null;
  begin
    perform record_check(v_s1, v_p2, v_p2v, 'dol-sec', '{}'::jsonb, '{}'::jsonb,
                         'vfy0070-a2', 60, 60, false, 2, 2, 2, false, true);
  exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'dol_retake_not_yet' then raise exception 'FAIL B2: same-day retake gave %', v_got; end if;
  -- A lost-response retry of attempt 1 REPLAYS, it is not refused (DE-4).
  v_res := record_check(v_s1, v_p2, v_p2v, 'dol-sec', '{}'::jsonb, '{}'::jsonb,
                        'vfy0070-a1', 60, 60, false, 2, 2, 1, false, false);
  if not (v_res->>'replayed')::boolean then raise exception 'FAIL B2: the retry was not replayed %', v_res; end if;
  -- The next day (owner zone UTC).
  update section_checks set created_at = created_at - interval '1 day' where id = v_check1;
  -- A stale form-1 page is refused (DE-4).
  v_got := null;
  begin
    perform record_check(v_s1, v_p2, v_p2v, 'dol-sec', '{}'::jsonb, '{}'::jsonb,
                         'vfy0070-a2b', 60, 60, false, 2, 2, 1, false, true);
  exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'dol_form_stale' then raise exception 'FAIL B2: a stale form gave %', v_got; end if;
  v_res := record_check(v_s1, v_p2, v_p2v, 'dol-sec', '{}'::jsonb, '{"b1":{"verdict":"correct"}}'::jsonb,
                        'vfy0070-a2c', 60, 60, false, 2, 2, 2, false, true);
  if (v_res->>'attempt_number')::int <> 2 or not (v_res->>'dol_passed')::boolean then
    raise exception 'FAIL B2: the retake %', v_res;
  end if;
  select count(*) into v_n from dol_pass where student_id = v_s1 and skill_id = 's.vfy0070.one' and source = 'auto';
  if v_n <> 1 then raise exception 'FAIL B2: % auto pass rows', v_n; end if;
  -- Attempt 3 is over the allowance.
  v_got := null;
  begin
    perform record_check(v_s1, v_p2, v_p2v, 'dol-sec', '{}'::jsonb, '{}'::jsonb,
                         'vfy0070-a3', 60, 60, false, 2, 2, 3, false, true);
  exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'section_locked' then raise exception 'FAIL B2: attempt 3 gave %', v_got; end if;

  -- ---- the rubric retake waits for a RELEASED grade (DE-9) ----------------
  v_res := record_check(v_s2, v_p2, v_p2v, 'dol-sec', '{}'::jsonb, '{}'::jsonb,
                        'vfy0070-r1', 60, 60, false, 2, 2, 1, true, null);
  update section_checks set created_at = created_at - interval '1 day' where id = (v_res->>'check_id')::uuid;
  insert into check_grades (check_id, block_id, criteria, graded_by)
  values ((v_res->>'check_id')::uuid, gen_random_uuid(), '[]'::jsonb, v_t);
  v_got := null;
  begin
    perform record_check(v_s2, v_p2, v_p2v, 'dol-sec', '{}'::jsonb, '{}'::jsonb,
                         'vfy0070-r2', 60, 60, false, 2, 2, 2, true, null);
  exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'dol_retake_not_yet' then raise exception 'FAIL B3: an UNRELEASED grade opened the retake: %', v_got; end if;
  update check_grades set released_at = now() where check_id = (v_res->>'check_id')::uuid;
  v_res := record_check(v_s2, v_p2, v_p2v, 'dol-sec', '{}'::jsonb, '{}'::jsonb,
                        'vfy0070-r2', 60, 60, false, 2, 2, 2, true, null);
  if (v_res->>'attempt_number')::int <> 2 then raise exception 'FAIL B3: released grade, retake %', v_res; end if;

  -- ---- DE-3: the pre-0070 call shape still records ------------------------
  v_res := record_check(v_s1, v_two, v_twov, 'free-sec', '{}'::jsonb, '{}'::jsonb, null, 60, 60, false, 1);
  v_res := record_check(v_s1, v_two, v_twov, 'free-sec', '{}'::jsonb, '{}'::jsonb, null, 60, 60, false, 1);
  if (v_res->>'attempt_number')::int <> 2 or (v_res->>'dol_passed')::boolean then
    raise exception 'FAIL B4: the old call shape %', v_res;
  end if;

  -- ---- DE-5: the prune can't un-pass ---------------------------------------
  delete from section_checks where student_id = v_s1 and activity_version_id = v_p2v;
  select count(*) into v_n from dol_pass where student_id = v_s1 and skill_id = 's.vfy0070.one' and check_id is null;
  if v_n <> 1 then raise exception 'FAIL B5: deleting the check deleted the pass'; end if;

  -- ---- DE-1: my_dol_state as the caller -------------------------------------
  perform set_config('request.jwt.claims', json_build_object('sub', v_s2)::text, true);
  v_res := my_dol_state(v_p2, v_p2v, 'dol-sec', true);
  if (v_res->>'attempts')::int <> 2 or (v_res->>'passed')::boolean then
    raise exception 'FAIL B6: my_dol_state for s2 %', v_res;
  end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_s1)::text, true);
  v_res := my_dol_state(v_p2, v_p2v, 'dol-sec', false);
  if not (v_res->>'passed')::boolean or (v_res->>'attempts')::int <> 0 then
    raise exception 'FAIL B6: my_dol_state for s1 (pass kept, checks pruned) %', v_res;
  end if;

  -- ---- DE-15: the teacher's tick ----------------------------------------------
  select id into v_check1 from section_checks where student_id = v_s2 and activity_version_id = v_p2v
   order by attempt_number limit 1;
  perform set_config('request.jwt.claims', json_build_object('sub', v_x)::text, true);
  v_got := null;
  begin perform set_dol_pass(v_check1, true); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'Not your activity' then raise exception 'FAIL B7: another teacher ticked: %', v_got; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_t)::text, true);
  v_res := set_dol_pass(v_check1, true);
  if not (v_res->>'passed')::boolean or v_res->>'source' <> 'teacher' then raise exception 'FAIL B7: tick %', v_res; end if;
  v_res := set_dol_pass(v_check1, false);
  if (v_res->>'passed')::boolean then raise exception 'FAIL B7: untick %', v_res; end if;
  -- An untick never removes an AUTO pass.
  insert into section_checks (student_id, activity_id, activity_version_id, section_id, attempt_number, responses, verdicts)
  values (v_s1, v_p2, v_p2v, 'dol-sec', 1, '{}', '{}') returning id into v_check1;
  v_res := set_dol_pass(v_check1, false);
  if not (v_res->>'passed')::boolean or v_res->>'source' <> 'auto' then raise exception 'FAIL B7: an untick removed an auto pass %', v_res; end if;
  -- Not a DoL section → refused.
  insert into section_checks (student_id, activity_id, activity_version_id, section_id, attempt_number, responses, verdicts)
  values (v_s1, v_p2, v_p2v, 'lesson-sec', 1, '{}', '{}') returning id into v_check1;
  v_got := null;
  begin perform set_dol_pass(v_check1, true); exception when others then v_got := sqlerrm; end;
  if v_got is distinct from 'That response is not a DoL' then raise exception 'FAIL B7: a lesson section ticked: %', v_got; end if;
  select count(*) into v_n from dol_pass_status(v_p2);
  if v_n <> 1 then raise exception 'FAIL B7: dol_pass_status gave % rows', v_n; end if;
  select count(*) into v_n from audit_log where actor_id = v_t and action in ('dol.pass', 'dol.unpass');
  if v_n <> 2 then raise exception 'FAIL B7: % audit rows for a tick + untick', v_n; end if;

  -- ---- DE-10: the tier gate ------------------------------------------------------
  -- s.vfy0070.two's live version has no DoL section: P/E are NOT gated.
  if not mixed_tier_ok('P', v_s2, 's.vfy0070.two') then raise exception 'FAIL B8: gated with no live DoL'; end if;
  update activity_versions set content = v_dol where id = v_twov;
  if mixed_tier_ok('P', v_s2, 's.vfy0070.two') then raise exception 'FAIL B8: P served before a pass'; end if;
  if not mixed_tier_ok('D', v_s2, 's.vfy0070.two') or not mixed_tier_ok(null, v_s2, 's.vfy0070.two') then
    raise exception 'FAIL B8: D or untagged gated';
  end if;
  insert into dol_pass (student_id, skill_id, source) values (v_s2, 's.vfy0070.two', 'auto');
  if not mixed_tier_ok('E', v_s2, 's.vfy0070.two') then raise exception 'FAIL B8: E withheld after a pass'; end if;

  raise exception 'EXPECTED ROLLBACK (all §B rows passed)';
end
$vfy$;

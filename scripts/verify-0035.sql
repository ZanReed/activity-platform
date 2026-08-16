-- verify-0035.sql — the disarmed check-prune + the schema-encoded arming gate
-- (migration 0035; plan + rulings in docs/design/check-retention-and-rollup.md).
--
-- Run with `pnpm verify:auth --target live|local`. §C is a self-fixturing
-- EXPECTED-ROLLBACK block (the verify-0034 §C idiom): real rows through the
-- real functions, claims-switched RPC calls, everything rolled back —
-- durable-write-free on every path (P7).
--
-- WHY EACH SECTION EXISTS (the §-letters in the plan's matrix map here):
--   §A — catalog posture (plan §A/§B): the view exists with the EXACT latest
--        shape the prune negates; the rolled_through column exists, nullable,
--        and — the live assertion that must hold until the arming arc —
--        NOTHING has ever written it; the prune fn is dry-run-by-default and
--        service-role-only (0009).
--   §C — the behavioral matrix, one fixture, in order:
--        G  the D11 gate: an ARMED prune against a NULL watermark refuses
--           everything (the reason arming-before-rollup is mechanically inert);
--        F  clause 3: rows at/after the watermark are refused (watermark moved
--           forward ⇒ the 45d row becomes a candidate);
--        4  clause 4: a non-latest row younger than PRUNE_HORIZON is refused
--           even under a fresh watermark;
--        K  the zero-arg call is a dry run: counts reported, nothing deleted;
--        E  the P3 liveness leg: armed, at production values, 3 rows actually
--           deleted (inside the rollback);
--        C  G12: the graded NON-latest row and its grade both survive;
--        D  the queue's stale flag still computes from that surviving pair
--           (graded text vs latest text — each protected by a DIFFERENT clause);
--        H  the queue's row set is byte-identical across the prune (the D7
--           equivalence pin: pruning touched nothing any reader reads);
--        I  get_activity_analytics: *_latest sums and totals.students are
--           unchanged; *_all drops by EXACTLY the pruned verdicts (the honest
--           statement of what pruning destroys — F2);
--        J  record_check still derives max+1 over the surviving rows (the
--           latest row is never pruned, so numbering has no gap at the top).

-- @section A-catalog-posture
-- @expect-rows
select 'latest_view_exists',
       to_regclass('public.section_checks_latest') is not null,
       'D7: THE definition of "the student''s current attempt"; the prune is its negation';
select 'latest_view_shape',
       (select strpos(pg_get_viewdef('public.section_checks_latest'::regclass), 'DISTINCT ON') > 0
           and strpos(pg_get_viewdef('public.section_checks_latest'::regclass), 'attempt_number DESC') > 0),
       'the distinct-on ordering IS the semantics — verify §H pins it to list_grading_queue''s copy';
select 'latest_view_no_client_grants',
       not has_table_privilege('authenticated', 'section_checks_latest', 'select')
       and not has_table_privilege('anon', 'section_checks_latest', 'select'),
       '0028 posture: the view is an internal definition, not a client surface';
select 'rolled_through_column_nullable',
       (select is_nullable = 'YES' from information_schema.columns
         where table_name = 'analytics_job_runs' and column_name = 'rolled_through'),
       'D11: ships nullable so the gate below can exist before the rollup does';
select 'rolled_through_never_written',
       not exists (select 1 from analytics_job_runs where rolled_through is not null),
       'THE D11 assertion: only the future rollup step may write this. If this row goes red, the arming arc has landed and this expectation moves to ITS verify script — flip it there, do not delete it (P5)';
select 'prune_fn_dry_run_default',
       (select pg_get_function_arguments(oid) ilike '%default true%'
          from pg_proc where proname = 'prune_section_checks'),
       'disarmed by default: a bare call can never delete';
select 'prune_fn_service_role_only',
       not has_function_privilege('anon', 'prune_section_checks(boolean)', 'execute')
       and not has_function_privilege('authenticated', 'prune_section_checks(boolean)', 'execute'),
       '0009: a deletion primitive over student work is never client-callable';
select 'prune_reads_the_view',
       (select strpos(prosrc, 'section_checks_latest') > 0
          from pg_proc where proname = 'prune_section_checks'),
       'D7 by construction: clause 1 cannot drift from the readers'' definition';
select 'prune_checks_grades',
       (select strpos(prosrc, 'check_grades') > 0
          from pg_proc where proname = 'prune_section_checks'),
       'G12: the cascade that makes retention free would make an unguarded prune destroy grades';
select 'prune_horizon_named',
       (select strpos(prosrc, 'c_prune_horizon') > 0
          from pg_proc where proname = 'prune_section_checks'),
       'clause 4 is a named constant with a floor bond (≥ 7 days — split-day re-roll constraint)';

-- @section C-behavioral-matrix
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_teacher  uuid := gen_random_uuid();
  v_s1       uuid := gen_random_uuid();
  v_s2       uuid := gen_random_uuid();
  v_activity uuid;
  v_version  uuid;
  v_block    uuid := gen_random_uuid();   -- short_answer, rubric'd, gradable
  v_crit     uuid := gen_random_uuid();
  -- s1: three attempts, the MIDDLE one graded (text differs from latest → stale)
  v_s1a1 uuid; v_s1a2 uuid; v_s1a3 uuid;
  -- s2: four attempts; a3 is young (inside the horizon), a4 is latest
  v_s2a1 uuid; v_s2a2 uuid; v_s2a3 uuid; v_s2a4 uuid;
  v_res       jsonb;
  v_before    jsonb;
  v_after     jsonb;
  v_queue_before uuid[];
  v_queue_after  uuid[];
  v_stale     boolean;
  v_graded    boolean;
  v_rows      int;
begin
  -- ---- fixtures ----------------------------------------------------------
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_teacher, 'vfy0035-t@vfy0035.example', '{}'::jsonb),
         (v_s1,      'vfy0035-s1@vfy0035.example', '{}'::jsonb),
         (v_s2,      'vfy0035-s2@vfy0035.example', '{}'::jsonb);
  update users set role = 'teacher' where id = v_teacher;
  update users set role = 'student' where id in (v_s1, v_s2);

  insert into activities (owner_id, title, slug, status)
  values (v_teacher, 'vfy 0035', 'vfy-0035', 'published')
  returning id into v_activity;

  -- JSON literal, not nested builders (the verify-0034 readability lesson).
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_activity, 1, format($doc$
    {"schemaVersion": 2,
     "meta": {"title": "vfy 0035"},
     "sections": [
       {"id": "sec-1", "rows": [{"id": "%s", "columns": [{"id": "%s", "blocks": [
          {"id": "%s", "type": "short_answer",
           "rubric": {"criteria": [{"id": "%s", "label": "Reasoning", "maxPoints": 4}]}}
       ]}]}]}
     ]}
    $doc$, gen_random_uuid(), gen_random_uuid(), v_block, v_crit)::jsonb, v_teacher)
  returning id into v_version;
  update activities set current_version_id = v_version where id = v_activity;

  -- Seven checks, created_at BACKDATED so clause-3/4 arithmetic runs at real
  -- production values (30-day horizon) rather than toy ones (P3).
  --   s1: a1@60d  a2@50d(graded, text B)  a3@40d(latest, text C ≠ B → stale)
  --   s2: a1@60d  a2@45d  a3@8d(inside horizon)  a4@5d(latest)
  insert into section_checks (student_id, activity_id, activity_version_id,
                              section_id, attempt_number, responses, verdicts)
  values (v_s1, v_activity, v_version, 'sec-1', 1,
          jsonb_build_object('freeText', jsonb_build_object(v_block::text, 'draft A')),
          jsonb_build_object(v_block::text, jsonb_build_object('verdict', 'recorded')))
  returning id into v_s1a1;
  insert into section_checks (student_id, activity_id, activity_version_id,
                              section_id, attempt_number, responses, verdicts)
  values (v_s1, v_activity, v_version, 'sec-1', 2,
          jsonb_build_object('freeText', jsonb_build_object(v_block::text, 'answer B')),
          jsonb_build_object(v_block::text, jsonb_build_object('verdict', 'recorded')))
  returning id into v_s1a2;
  insert into section_checks (student_id, activity_id, activity_version_id,
                              section_id, attempt_number, responses, verdicts)
  values (v_s1, v_activity, v_version, 'sec-1', 3,
          jsonb_build_object('freeText', jsonb_build_object(v_block::text, 'answer C')),
          jsonb_build_object(v_block::text, jsonb_build_object('verdict', 'recorded')))
  returning id into v_s1a3;
  insert into section_checks (student_id, activity_id, activity_version_id,
                              section_id, attempt_number, responses, verdicts)
  values (v_s2, v_activity, v_version, 'sec-1', 1,
          jsonb_build_object('freeText', jsonb_build_object(v_block::text, 'try 1')),
          jsonb_build_object(v_block::text, jsonb_build_object('verdict', 'recorded')))
  returning id into v_s2a1;
  insert into section_checks (student_id, activity_id, activity_version_id,
                              section_id, attempt_number, responses, verdicts)
  values (v_s2, v_activity, v_version, 'sec-1', 2,
          jsonb_build_object('freeText', jsonb_build_object(v_block::text, 'try 2')),
          jsonb_build_object(v_block::text, jsonb_build_object('verdict', 'recorded')))
  returning id into v_s2a2;
  insert into section_checks (student_id, activity_id, activity_version_id,
                              section_id, attempt_number, responses, verdicts)
  values (v_s2, v_activity, v_version, 'sec-1', 3,
          jsonb_build_object('freeText', jsonb_build_object(v_block::text, 'try 3')),
          jsonb_build_object(v_block::text, jsonb_build_object('verdict', 'recorded')))
  returning id into v_s2a3;
  insert into section_checks (student_id, activity_id, activity_version_id,
                              section_id, attempt_number, responses, verdicts)
  values (v_s2, v_activity, v_version, 'sec-1', 4,
          jsonb_build_object('freeText', jsonb_build_object(v_block::text, 'try 4')),
          jsonb_build_object(v_block::text, jsonb_build_object('verdict', 'recorded')))
  returning id into v_s2a4;

  update section_checks set created_at = now() - interval '60 days' where id in (v_s1a1, v_s2a1);
  update section_checks set created_at = now() - interval '50 days' where id = v_s1a2;
  update section_checks set created_at = now() - interval '45 days' where id = v_s2a2;
  update section_checks set created_at = now() - interval '40 days' where id = v_s1a3;
  update section_checks set created_at = now() - interval '8 days'  where id = v_s2a3;
  update section_checks set created_at = now() - interval '5 days'  where id = v_s2a4;

  -- Grade s1's MIDDLE attempt through the real door (claims-switched).
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);
  perform upsert_check_grade(v_s1a2, v_block,
            jsonb_build_array(jsonb_build_object('criterionId', v_crit, 'earned', 3)),
            'Good reasoning.');

  -- Baselines: analytics + the queue's row set, BEFORE any prune.
  v_before := get_activity_analytics(v_activity);
  select array_agg(q.check_id order by q.check_id)
    into v_queue_before
    from list_grading_queue(v_activity) q;

  -- ---- (G) the D11 gate: ARMED, NULL watermark ⇒ inert --------------------
  v_res := prune_section_checks(p_dry_run => false);
  if (v_res->>'deleted')::int <> 0 or (v_res->>'candidates')::int <> 0 then
    raise exception 'FAIL D11 gate: armed prune with NULL watermark acted (%)', v_res;
  end if;
  select count(*) into v_rows from section_checks where activity_id = v_activity;
  if v_rows <> 7 then
    raise exception 'FAIL D11 gate: row count % after null-watermark armed run (want 7)', v_rows;
  end if;

  -- ---- (F) clause 3: the watermark bounds candidacy -----------------------
  -- Watermark at 55d: only the two 60d rows are old enough to be candidates
  -- (s2a2@45d sits AFTER the watermark and must be refused).
  insert into analytics_job_runs (stale_cache_rows_deleted, section_check_rows,
                                  census_versions, notes, rolled_through)
  values (0, 7, 0, 'vfy0035: seeded watermark (rolled back)', now() - interval '55 days');
  v_res := prune_section_checks();
  if (v_res->>'candidates')::int <> 2 then
    raise exception 'FAIL clause 3 (watermark 55d): candidates=% (want 2: the two 60d rows)', v_res;
  end if;

  -- Advance the watermark (a SECOND ledger row — the function must pick it by
  -- id, not ran_at: both rows share this transaction''s now(), the 0034
  -- graded_at tie all over again). s2a2@45d now becomes a candidate;
  -- s2a3@8d must STILL be refused — clause 4, the horizon.
  insert into analytics_job_runs (stale_cache_rows_deleted, section_check_rows,
                                  census_versions, notes, rolled_through)
  values (0, 7, 0, 'vfy0035: advanced watermark (rolled back)', now() - interval '6 minutes');
  v_res := prune_section_checks();
  if (v_res->>'candidates')::int <> 3 then
    raise exception 'FAIL clause 3/4 (fresh watermark): candidates=% (want 3: 60d+60d+45d; the 8d row is horizon-refused)', v_res;
  end if;

  -- ---- (K) the zero-arg call above was a DRY RUN: nothing deleted ---------
  select count(*) into v_rows from section_checks where activity_id = v_activity;
  if v_rows <> 7 then
    raise exception 'FAIL dry-run: row count % after two dry runs (want 7)', v_rows;
  end if;
  if (v_res->>'deleted')::int <> 0 then
    raise exception 'FAIL dry-run: reported deleted=% (want 0)', v_res->>'deleted';
  end if;

  -- ---- (E) the P3 liveness leg: ARMED, production values ------------------
  v_res := prune_section_checks(p_dry_run => false);
  if (v_res->>'deleted')::int <> 3 then
    raise exception 'FAIL armed prune: deleted=% (want 3)', v_res->>'deleted';
  end if;
  if exists (select 1 from section_checks where id in (v_s1a1, v_s2a1, v_s2a2)) then
    raise exception 'FAIL armed prune: a candidate row survived';
  end if;

  -- ---- (C) G12: the graded non-latest row AND its grade survive -----------
  if not exists (select 1 from section_checks where id = v_s1a2) then
    raise exception 'FAIL G12: the graded non-latest check was pruned';
  end if;
  if not exists (select 1 from check_grades where check_id = v_s1a2) then
    raise exception 'FAIL G12: the teacher''s grade did not survive the prune';
  end if;

  -- ---- (D) the stale flag still computes from the surviving pair ----------
  select q.stale, q.graded into v_stale, v_graded
    from list_grading_queue(v_activity) q
   where q.check_id = v_s1a3 and q.block_id = v_block;
  if not coalesce(v_graded, false) then
    raise exception 'FAIL post-prune queue: s1''s latest row lost its grade join';
  end if;
  if not coalesce(v_stale, false) then
    raise exception 'FAIL post-prune stale: graded text (B) vs latest text (C) should be stale';
  end if;

  -- ---- (H) the D7 equivalence pin: the queue''s row set is unchanged -------
  select array_agg(q.check_id order by q.check_id)
    into v_queue_after
    from list_grading_queue(v_activity) q;
  if v_queue_before is distinct from v_queue_after then
    raise exception 'FAIL D7 pin: the prune changed the queue''s row set (before=%, after=%)',
      v_queue_before, v_queue_after;
  end if;

  -- ---- (I) analytics: latest family + students unchanged; *_all down by 3 -
  v_after := get_activity_analytics(v_activity);
  if (v_before->'totals'->>'students') is distinct from (v_after->'totals'->>'students') then
    raise exception 'FAIL F1: totals.students changed across the prune';
  end if;
  if (v_before->'keys'->0->>'verdicts_latest') is distinct from (v_after->'keys'->0->>'verdicts_latest')
  or (v_before->'keys'->0->>'correct_latest') is distinct from (v_after->'keys'->0->>'correct_latest') then
    raise exception 'FAIL F1: the latest family changed across the prune';
  end if;
  if (v_before->'keys'->0->>'verdicts_all')::int - (v_after->'keys'->0->>'verdicts_all')::int <> 3 then
    raise exception 'FAIL F2 honesty: verdicts_all delta=% (want exactly the 3 pruned verdicts)',
      (v_before->'keys'->0->>'verdicts_all')::int - (v_after->'keys'->0->>'verdicts_all')::int;
  end if;

  -- ---- (J) record_check numbering: max+1 over survivors -------------------
  -- s2''s surviving max is a4 = 4; the next check must be 5 (never a reused
  -- number — the latest row is unprunable, so the max never regresses).
  v_res := record_check(v_s2, v_activity, v_version, 'sec-1',
             jsonb_build_object('freeText', jsonb_build_object(v_block::text, 'try 5')),
             jsonb_build_object(v_block::text, jsonb_build_object('verdict', 'recorded')));
  if (v_res->>'attempt_number')::int <> 5 then
    raise exception 'FAIL numbering: attempt_number=% after prune (want 5)', v_res->>'attempt_number';
  end if;

  raise exception 'EXPECTED ROLLBACK >>> verify-0035 §C all rows passed';
end $vfy$;

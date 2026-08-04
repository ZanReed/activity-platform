-- =============================================================================
-- verify-0026.sql — author walkthrough for the analytics census (S7)
-- -----------------------------------------------------------------------------
-- Run AFTER applying 0026_analytics_census.sql (SQL editor, service role).
--
-- ⚠ RUN SECTION 0 FIRST — it answers "is the migration actually live?".
--
-- A GREEN RUN PRINTS NOTICES AND NO ERROR. This script uses the verify-0020
-- shape (begin / one DO block with PASS-FAIL counters / rollback) rather than
-- the raise-exception-to-force-rollback shape of 0022-0025, precisely because
-- that one reports success as a scary P0001 and cost two round-trips to read
-- correctly. Any ERROR here is a real failure.
--
-- Everything in section C builds its OWN fixtures — a fixture activity, two
-- real student accounts through the real signup trigger, and hand-written
-- checks with known verdicts — then rolls all of it back. It never asserts
-- against ambient data, which is the anti-vacuity discipline this repo learned
-- twice (the empty-activity leak scan, and verify-0022's C1 pointing at E2E
-- residue that later got cleaned).
--
-- Requires: at least one teacher account (the fixture activity needs an owner).
-- No deploy is involved for sections A-C; the get-activity redeploy matters for
-- scripts/verify-analytics-e2e.js, which is the other half of this proof.
-- =============================================================================

-- ===================== 0. PRECONDITION — run this FIRST ======================
-- EXPECT: applied = t. If f, run `supabase db push` and start over from here.
select count(*) = 3 as applied,
       case when count(*) = 3
            then 'OK — 0026 is live, continue'
            else 'STOP — 0026 NOT APPLIED. Run: supabase db push'
       end as verdict
from pg_proc
where proname in ('write_version_census', 'run_analytics_maintenance',
                  'get_activity_analytics');

begin;

create function pg_temp.impersonate(p_sub text, p_role text) returns void as $$
begin
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', p_sub, 'role', p_role)::text,
    true
  );
  execute format('set local role %I', p_role);
end;
$$ language plpgsql;

create function pg_temp.unimpersonate() returns void as $$
begin
  reset role;
  perform set_config('request.jwt.claims', null, true);
end;
$$ language plpgsql;

do $$
declare
  v_teacher   uuid;
  v_activity  uuid;
  v_version   uuid;
  v_spare     uuid;   -- a second version, for the CASCADE + GC checks
  v_student_a uuid := gen_random_uuid();
  v_student_b uuid := gen_random_uuid();
  v_stranger  uuid := gen_random_uuid();
  v_result    jsonb;
  v_key       jsonb;
  v_n         int;
  v_txt       text;
  v_pass      int := 0;
  v_fail      int := 0;
begin

-- ============================ A. Shape =======================================

  -- A1. Both census tables CASCADE from activity_versions. They are DERIVED
  --     data about a version and must never block deleting one.
  select count(*) into v_n
  from pg_constraint c
  join pg_class t on t.oid = c.conrelid
  where t.relname in ('activity_version_census', 'activity_version_items')
    and c.contype = 'f'
    and c.confdeltype = 'c';  -- 'c' = CASCADE
  if v_n = 2 then
    v_pass := v_pass + 1; raise notice 'PASS A1: both census tables CASCADE from activity_versions';
  else
    v_fail := v_fail + 1; raise warning 'FAIL A1: expected 2 CASCADE FKs, found %', v_n;
  end if;

  -- A2. The ledger has NO foreign keys — it outlives everything it reports on.
  select count(*) into v_n
  from pg_constraint c
  join pg_class t on t.oid = c.conrelid
  where t.relname = 'analytics_job_runs' and c.contype = 'f';
  if v_n = 0 then
    v_pass := v_pass + 1; raise notice 'PASS A2: analytics_job_runs carries no FKs';
  else
    v_fail := v_fail + 1; raise warning 'FAIL A2: analytics_job_runs has % FK(s) — it will be dragged down by a purge', v_n;
  end if;

  -- A3. All three functions are DEFINER with a pinned search_path.
  select count(*) into v_n
  from pg_proc
  where proname in ('write_version_census', 'run_analytics_maintenance',
                    'get_activity_analytics')
    and prosecdef
    and array_to_string(coalesce(proconfig, '{}'), ',') like '%search_path=public%';
  if v_n = 3 then
    v_pass := v_pass + 1; raise notice 'PASS A3: all 3 functions are DEFINER with pinned search_path';
  else
    v_fail := v_fail + 1; raise warning 'FAIL A3: only % of 3 functions are hardened', v_n;
  end if;

-- ============================ B. Posture =====================================

  -- B1. RLS forced with ZERO policies on all three tables (deny-by-default IS
  --     the access control; the DEFINER RPC is the only read path).
  select count(*) into v_n
  from pg_class
  where relname in ('activity_version_census', 'activity_version_items',
                    'analytics_job_runs')
    and relrowsecurity and relforcerowsecurity;
  if v_n = 3 and (
       select count(*) from pg_policies
       where tablename in ('activity_version_census', 'activity_version_items',
                           'analytics_job_runs')
     ) = 0 then
    v_pass := v_pass + 1; raise notice 'PASS B1: RLS forced, zero policies, on all 3 tables';
  else
    v_fail := v_fail + 1; raise warning 'FAIL B1: only % of 3 tables locked down, or a policy appeared', v_n;
  end if;

  -- B2. Write paths are service_role only; the read RPC adds authenticated.
  --     No anon, no PUBLIC, anywhere.
  select count(*) into v_n
  from pg_proc p
  cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
  left join pg_roles g on g.oid = a.grantee
  where p.proname in ('write_version_census', 'run_analytics_maintenance',
                      'get_activity_analytics')
    and coalesce(g.rolname, 'PUBLIC') in ('anon', 'PUBLIC');
  if v_n = 0 then
    v_pass := v_pass + 1; raise notice 'PASS B2: no anon/PUBLIC grant on any analytics function';
  else
    v_fail := v_fail + 1; raise warning 'FAIL B2: % anon/PUBLIC grant(s) on analytics functions', v_n;
  end if;

  select count(*) into v_n
  from pg_proc p
  cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
  left join pg_roles g on g.oid = a.grantee
  where p.proname in ('write_version_census', 'run_analytics_maintenance')
    and coalesce(g.rolname, 'PUBLIC') = 'authenticated';
  if v_n = 0 then
    v_pass := v_pass + 1; raise notice 'PASS B3: write paths are not reachable by a signed-in user';
  else
    v_fail := v_fail + 1; raise warning 'FAIL B3: a write path is executable by authenticated';
  end if;

  -- B4. THE DE-IDENTIFICATION PIN. These tables describe authored content and
  --     job bookkeeping — never a student. That is what keeps them outside the
  --     retention scope the 0022-0025 arc closed, and it is exactly the kind of
  --     property that erodes when someone adds "just one useful column".
  select count(*) into v_n
  from information_schema.columns
  where table_schema = 'public'
    and table_name in ('activity_version_census', 'activity_version_items',
                       'analytics_job_runs')
    and column_name in ('student_id', 'user_id', 'actor_id', 'email',
                        'display_name', 'ip_hash');
  if v_n = 0 then
    v_pass := v_pass + 1; raise notice 'PASS B4: no student identifier column on any analytics table';
  else
    v_fail := v_fail + 1; raise warning 'FAIL B4: % identifier column(s) reached the analytics tables — these rows are now personal data with no purge path', v_n;
  end if;

-- ===================== C. Behavior — the actual proof =========================

  select id into v_teacher from users where role = 'teacher' and deleted_at is null
  order by created_at limit 1;
  if v_teacher is null then
    raise exception 'No teacher account exists — section C cannot build its fixture';
  end if;

  -- ---- Fixture -------------------------------------------------------------
  insert into activities (owner_id, title, status)
  values (v_teacher, 'verify-0026 fixture', 'published')
  returning id into v_activity;

  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_activity, 1, '{"schemaVersion":2}'::jsonb, v_teacher)
  returning id into v_version;

  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_activity, 2, '{"schemaVersion":2}'::jsonb, v_teacher)
  returning id into v_spare;

  update activities set current_version_id = v_version where id = v_activity;

  -- Two real student accounts through the real trigger (0025's pattern).
  insert into student_domain (domain, notes) values ('test-census.org', '0026 verify');
  insert into auth.users (id, email) values
    (v_student_a, 'a@test-census.org'),
    (v_student_b, 'b@test-census.org');

  -- The census, written through the REAL function.
  perform write_version_census(
    v_version,
    '[{"censusKey":"fill_in_blank","blockCount":2},
      {"censusKey":"multiple_choice","blockCount":1}]'::jsonb,
    '[{"itemId":"blank-1","censusKey":"fill_in_blank"},
      {"itemId":"blank-2","censusKey":"fill_in_blank"},
      {"itemId":"mc-1","censusKey":"multiple_choice"}]'::jsonb
  );

  -- Three checks. Student A checks TWICE — the formative re-check loop that
  -- makes naive all-attempt counts inflate, which is why the RPC reports the
  -- latest-attempt reading beside it. Student B's check carries a 'ghost-1'
  -- item the census does not know (a stand-in for a census written before a
  -- republish): it must surface as _unattributed, never vanish.
  insert into section_checks
    (student_id, activity_id, activity_version_id, section_id, attempt_number,
     responses, verdicts)
  values
    (v_student_a, v_activity, v_version, 'sec-1', 1, '{}'::jsonb,
     '{"blank-1":{"verdict":"correct"},
       "blank-2":{"verdict":"incorrect"},
       "mc-1":{"verdict":"incorrect"}}'::jsonb),
    (v_student_a, v_activity, v_version, 'sec-1', 2, '{}'::jsonb,
     '{"blank-1":{"verdict":"correct"},
       "blank-2":{"verdict":"correct"},
       "mc-1":{"verdict":"correct"}}'::jsonb),
    (v_student_b, v_activity, v_version, 'sec-1', 1, '{}'::jsonb,
     '{"blank-1":{"verdict":"incorrect"},
       "blank-2":{"verdict":"correct"},
       "mc-1":{"verdict":"correct"},
       "ghost-1":{"verdict":"correct"}}'::jsonb);

  -- C0. The fixture is real (anti-vacuity: assert the subject EXISTS before
  --     asserting anything about it).
  select count(*) into v_n from section_checks where activity_id = v_activity;
  if v_n = 3 then
    v_pass := v_pass + 1; raise notice 'PASS C0: fixture built — 3 checks, 2 students, 1 censused version';
  else
    v_fail := v_fail + 1; raise warning 'FAIL C0: fixture has % checks, expected 3', v_n;
  end if;

  -- C1. The census write path landed both tables atomically.
  select count(*) into v_n from activity_version_census where version_id = v_version;
  if v_n = 2 and (select count(*) from activity_version_items where version_id = v_version) = 3 then
    v_pass := v_pass + 1; raise notice 'PASS C1: write_version_census wrote 2 count rows + 3 item rows';
  else
    v_fail := v_fail + 1; raise warning 'FAIL C1: census wrote % count rows (expected 2)', v_n;
  end if;

  -- C2. Re-running replaces rather than merges — the property the backfill's
  --     rerunnability depends on.
  perform write_version_census(
    v_version,
    '[{"censusKey":"fill_in_blank","blockCount":2},
      {"censusKey":"multiple_choice","blockCount":1}]'::jsonb,
    '[{"itemId":"blank-1","censusKey":"fill_in_blank"},
      {"itemId":"blank-2","censusKey":"fill_in_blank"},
      {"itemId":"mc-1","censusKey":"multiple_choice"}]'::jsonb
  );
  select count(*) into v_n from activity_version_items where version_id = v_version;
  if v_n = 3 then
    v_pass := v_pass + 1; raise notice 'PASS C2: re-running the census is idempotent (still 3 item rows)';
  else
    v_fail := v_fail + 1; raise warning 'FAIL C2: re-run left % item rows, expected 3', v_n;
  end if;

  -- C3. THE AGGREGATE, exact. Owner's view.
  perform pg_temp.impersonate(v_teacher::text, 'authenticated');
  v_result := get_activity_analytics(v_activity);
  perform pg_temp.unimpersonate();

  select k into v_key
  from jsonb_array_elements(v_result->'keys') k
  where k->>'census_key' = 'fill_in_blank';

  if  (v_key->>'block_count')::int      = 2
  and (v_key->>'verdicts_all')::int     = 6
  and (v_key->>'correct_all')::int      = 4
  and (v_key->>'incorrect_all')::int    = 2
  and (v_key->>'verdicts_latest')::int  = 4
  and (v_key->>'correct_latest')::int   = 3
  and (v_key->>'incorrect_latest')::int = 1
  and (v_key->>'students')::int         = 2
  then
    v_pass := v_pass + 1;
    raise notice 'PASS C3: fill_in_blank exact — 6 verdicts all / 4 latest, 4 correct all / 3 correct latest';
    -- The whole reason rollups were deferred, visible in one line: the same
    -- two blanks read as 4 corrects across attempts and 3 on latest attempt.
    raise notice '        (re-check inflation is REAL and both readings are reported)';
  else
    v_fail := v_fail + 1;
    raise warning 'FAIL C3: fill_in_blank aggregate wrong — got %', v_key;
  end if;

  select k into v_key
  from jsonb_array_elements(v_result->'keys') k
  where k->>'census_key' = 'multiple_choice';
  if  (v_key->>'block_count')::int     = 1
  and (v_key->>'verdicts_all')::int    = 3
  and (v_key->>'correct_all')::int     = 2
  and (v_key->>'verdicts_latest')::int = 2
  and (v_key->>'correct_latest')::int  = 2
  then
    v_pass := v_pass + 1; raise notice 'PASS C4: multiple_choice aggregate exact';
  else
    v_fail := v_fail + 1; raise warning 'FAIL C4: multiple_choice aggregate wrong — got %', v_key;
  end if;

  -- C5. The unattributed item is SURFACED, not dropped. If this ever silently
  --     disappears, every republish-era check would quietly stop being counted
  --     with no signal that anything was missing.
  select k into v_key
  from jsonb_array_elements(v_result->'keys') k
  where k->>'census_key' = '_unattributed';
  if v_key is not null and (v_key->>'verdicts_all')::int = 1
     and v_key->>'block_count' is null then
    v_pass := v_pass + 1; raise notice 'PASS C5: the unknown item id surfaces as _unattributed (1 verdict, no block_count)';
  else
    v_fail := v_fail + 1; raise warning 'FAIL C5: unattributed verdict was dropped or miscounted — got %', v_key;
  end if;

  -- C6. Totals count CHECKS and STUDENTS, not verdicts.
  if  (v_result->'totals'->>'checks')::int   = 3
  and (v_result->'totals'->>'students')::int = 2
  and (v_result->>'censused')::boolean       = true
  then
    v_pass := v_pass + 1; raise notice 'PASS C6: totals — 3 checks, 2 students, censused=true';
  else
    v_fail := v_fail + 1; raise warning 'FAIL C6: totals wrong — got %', v_result->'totals';
  end if;

  -- C7. REFUSAL MATRIX. A signed-in stranger must learn nothing — not even
  --     whether the activity exists.
  begin
    perform pg_temp.impersonate(v_stranger::text, 'authenticated');
    v_result := get_activity_analytics(v_activity);
    perform pg_temp.unimpersonate();
    v_fail := v_fail + 1;
    raise warning 'FAIL C7: a stranger read another teacher''s analytics — LEAK';
  exception when others then
    perform pg_temp.unimpersonate();
    v_txt := sqlerrm;
    if v_txt like '%Not available%' then
      v_pass := v_pass + 1; raise notice 'PASS C7: stranger refused with the no-oracle message (%)', left(v_txt, 30);
    else
      v_fail := v_fail + 1; raise warning 'FAIL C7: stranger refused, but with a leaky message: %', v_txt;
    end if;
  end;

  -- C8. A student is refused too: this is a teacher surface, and students are
  --     authenticated users like any other.
  begin
    perform pg_temp.impersonate(v_student_a::text, 'authenticated');
    v_result := get_activity_analytics(v_activity);
    perform pg_temp.unimpersonate();
    v_fail := v_fail + 1;
    raise warning 'FAIL C8: a student read the activity analytics — LEAK';
  exception when others then
    perform pg_temp.unimpersonate();
    v_pass := v_pass + 1; raise notice 'PASS C8: student refused (%)', left(sqlerrm, 30);
  end;

  -- C9. Anonymous cannot execute at all (the grant, not just the gate).
  begin
    perform pg_temp.impersonate(v_stranger::text, 'anon');
    v_result := get_activity_analytics(v_activity);
    perform pg_temp.unimpersonate();
    v_fail := v_fail + 1;
    raise warning 'FAIL C9: anon executed get_activity_analytics';
  exception when others then
    perform pg_temp.unimpersonate();
    v_pass := v_pass + 1; raise notice 'PASS C9: anon refused (%)', left(sqlerrm, 40);
  end;

  -- C10. GC SWEEP. Two cache rows for one version under different revs; the
  --      newest rev wins and the older row is swept. NOTE: the sweep is global,
  --      so it also touches real cache rows — the rollback at the end of this
  --      script is what makes that safe, and a swept row costs one cache miss.
  insert into activity_version_reads (version_id, sanitizer_rev, schema_version, content, created_at)
  values (v_spare, 'rev-OLD', 2, '{}'::jsonb, now() - interval '2 days'),
         (v_spare, 'rev-NEW', 2, '{}'::jsonb, now() + interval '2 days');

  perform run_analytics_maintenance();

  select count(*) into v_n from activity_version_reads
  where version_id = v_spare and sanitizer_rev = 'rev-OLD';
  if v_n = 0 and (
       select count(*) from activity_version_reads
       where version_id = v_spare and sanitizer_rev = 'rev-NEW'
     ) = 1 then
    v_pass := v_pass + 1; raise notice 'PASS C10: stale-rev cache row swept, current-rev row kept';
  else
    v_fail := v_fail + 1; raise warning 'FAIL C10: GC left % stale row(s)', v_n;
  end if;

  -- C11. The job leaves a DURABLE ledger row — the thing that makes a dead
  --      cron visible on the teacher panel instead of only in a log that is
  --      gone in a day.
  select count(*) into v_n from analytics_job_runs
  where ran_at > now() - interval '1 minute';
  if v_n >= 1 then
    v_pass := v_pass + 1; raise notice 'PASS C11: the maintenance run wrote a ledger row';
  else
    v_fail := v_fail + 1; raise warning 'FAIL C11: no ledger row — a stopped job would be invisible';
  end if;

  -- C12. The ledger reaches the teacher surface.
  perform pg_temp.impersonate(v_teacher::text, 'authenticated');
  v_result := get_activity_analytics(v_activity);
  perform pg_temp.unimpersonate();
  if v_result->'job'->>'last_run_at' is not null then
    v_pass := v_pass + 1; raise notice 'PASS C12: the panel payload carries the last job run';
  else
    v_fail := v_fail + 1; raise warning 'FAIL C12: job health missing from the panel payload';
  end if;

  -- C13. CASCADE: census rows die with their version and never block its
  --      deletion (a census that could pin a version would break the purge
  --      job the same way section_checks did before 0022).
  perform write_version_census(
    v_spare,
    '[{"censusKey":"paragraph","blockCount":1}]'::jsonb,
    '[]'::jsonb
  );
  delete from activity_version_reads where version_id = v_spare;
  delete from activity_versions where id = v_spare;
  select count(*) into v_n from activity_version_census where version_id = v_spare;
  if v_n = 0 then
    v_pass := v_pass + 1; raise notice 'PASS C13: deleting a version cascaded its census away';
  else
    v_fail := v_fail + 1; raise warning 'FAIL C13: % census row(s) survived their version', v_n;
  end if;

  -- ======================= Verdict ==========================================
  raise notice '=== verify-0026: % PASS, % FAIL ===', v_pass, v_fail;
  if v_fail > 0 then
    raise exception 'verify-0026 FAILED with % failures — see warnings above', v_fail;
  end if;
end;
$$;

rollback;

-- ============================ D. Live state ==================================
-- Read-only, AFTER the rollback: what the real database looks like right now.

-- D1. Census coverage. A version appears here once a student has opened it
--     (the census is written on the first cache-filling read) or once the
--     backfill has run. versions_uncensused > 0 is normal and simply means
--     "nobody has opened those versions since 0026 shipped" — the fix, if you
--     want full coverage now, is `node scripts/backfill-census.js`.
select
  (select count(*) from activity_versions)                            as versions_total,
  (select count(distinct version_id) from activity_version_census)    as versions_censused,
  (select count(*) from activity_versions v
     where not exists (select 1 from activity_version_census c
                       where c.version_id = v.id))                    as versions_uncensused,
  (select count(*) from activity_version_items)                       as item_map_rows;

-- D2. Job health. last_run_at null = the cron job has never run; schedule it:
--   select cron.schedule('analytics-maintenance', '30 3 * * *',
--                        'select run_analytics_maintenance();');
select max(ran_at) as last_run_at,
       count(*)    as runs_recorded,
       (select section_check_rows from analytics_job_runs order by ran_at desc limit 1)
         as section_checks_at_last_run
from analytics_job_runs;

-- D3. Real unattributed exposure: check items no census row explains. Expect 0
--     once the backfill has run. A non-zero count is not data loss — the raw
--     checks are intact — it means the census is behind and re-running the
--     backfill will attribute them.
select count(*) as unattributed_items
from section_checks sc
cross join lateral jsonb_each(sc.verdicts) e
left join activity_version_items i
  on i.version_id = sc.activity_version_id and i.item_id = e.key
where i.item_id is null;

-- D4. Read-cache orphans still on disk (what the sweep will clean tonight).
select sanitizer_rev, count(*) as rows
from activity_version_reads
group by 1 order by 2 desc;

-- verify-0036.sql — the durable check rollup + the self-healing timezone layer
-- (migration 0036; plan + rulings in docs/design/check-retention-and-rollup.md
-- PART II, as amended by the Part II eng review D2-II–D7-II + OV-1..9).
--
-- Run with `pnpm verify:auth --target live|local`. §C is a self-fixturing
-- EXPECTED-ROLLBACK block (the verify-0034/0035 idiom): real rows through the
-- real functions, everything rolled back — durable-write-free on every path (P7).
--
-- WHY EACH SECTION EXISTS (plan §II.3 letters map here):
--   §A  catalog posture: both rollup tables (shape, CASCADE FKs, RLS forced,
--       zero policies, zero client grants), the ledger's job_name /
--       reconciliation / purge columns, users.timezone + rollup_rebuild_needed,
--       every new fn service-role-only (0009), the default-zone single home
--       (D3-II), and the flipped 0035 watchdog: rolled_through is written by
--       analytics rows ONLY (P11 — a live-state assertion, not a prosrc grep;
--       it catches foreign writers, not a writer mimicking job_name).
--   §B  the 0026 §B4 erosion guard EXTENDED: no student-identifier column on
--       either rollup table (R1 — the no-identifier property is load-bearing).
--   §D  analytics_day unit rows at real offsets (D6) including the Chicago
--       spring-forward day (OV-9b): 2026-03-08 has 23 hours; keys stay
--       contiguous with no gap and no double-day.
--   §C  the behavioral matrix, one fixture, in order:
--       Ct  the timezone trigger: invalid zone refused naming the column,
--           valid + NULL accepted (II.2.1);
--       E   roll liveness (P3): 3 checks roll into BOTH tables under the
--           owner's zone; watermark stamped at the 5-min lag; ledger row is
--           job_name='analytics' and its reconciliation pair is EQUAL;
--       F   idempotence: a second run changes nothing (delete-then-insert);
--       G   split-day (finding 6): a mid-day watermark + a later run produce
--           EXACTLY the single-run state (full-day recompute semantics);
--       H   analytics v2 *_all = rolled + raw above the boundary, no double
--           count; totals.checks keeps meaning "checks performed" (OV-2:
--           rolled daily sum + raw — check_rollup_daily's production reader);
--       I   *_latest and per-key students are LATEST-GROUNDED (D8 pin: an
--           item answered only in a superseded attempt reads students=0);
--       N   the zone-change self-heal END TO END (D2-II, the review's P1):
--           trigger stamps the flag, the nightly re-days in-horizon history
--           under the new zone, the flag clears, and the total rolled checks
--           are INVARIANT (each check counted exactly once);
--       O2  flag integrity: a client write to rollup_rebuild_needed is
--           REFUSED (OV-4); the compare-and-clear predicate leaves the flag
--           standing when the zone moved mid-rebuild (OV-3);
--       P2  the horizon clamp (D5-II/OV-1, severe): a no-arg rebuild never
--           touches a rolled day older than PRUNE_HORIZON (frozen history);
--           an explicit deep p_from is honored but returns the WARNING;
--       R2  the reconciliation instrument (OV-6): a late-committing row below
--           the watermark surfaces as a ledger drift of exactly 1, and a
--           no-arg rebuild HEALS it (drift back to 0);
--       J   rebuild ≡ incremental within the raw-complete window (R7 as
--           bounded by D5-II), and a census re-key re-attributes at READ
--           time with no rebuild (D4);
--       K   purge v4 (OV-6/finding 4): never blocked, counts the unrolled
--           rows it destroyed on a job_name='purge' ledger row, and the
--           rollup rows CASCADE-die with the activity (R1);
--       M   the panel's job object ignores purge rows (II.1.2 — a decoy
--           purge row an hour in the future is invisible to the filter).

-- @section A-catalog-posture
-- @expect-rows
select 'rollup_tables_exist',
       to_regclass('public.check_rollup_daily') is not null
       and to_regclass('public.check_item_rollup_daily') is not null,
       'D4: item-grain + daily-grain, the two-table shape ruled in §5';
select 'rollup_fks_cascade',
       (select count(*) = 4 from pg_constraint
         where conrelid in ('check_rollup_daily'::regclass, 'check_item_rollup_daily'::regclass)
           and contype = 'f' and confdeltype = 'c'),
       'R1: aggregates die with the activity AND the version — a purged class of one leaves no residue';
select 'rollup_rls_forced_no_policies',
       (select bool_and(relrowsecurity and relforcerowsecurity) from pg_class
         where oid in ('check_rollup_daily'::regclass, 'check_item_rollup_daily'::regclass))
       and not exists (select 1 from pg_policies
         where tablename in ('check_rollup_daily', 'check_item_rollup_daily')),
       '0026 posture: the absence of a policy IS the access control';
select 'rollup_no_client_grants',
       not has_table_privilege('authenticated', 'check_rollup_daily', 'select')
       and not has_table_privilege('anon', 'check_rollup_daily', 'select')
       and not has_table_privilege('authenticated', 'check_item_rollup_daily', 'select')
       and not has_table_privilege('anon', 'check_item_rollup_daily', 'select'),
       'belt over the RLS braces: the platform default grants are revoked outright';
select 'ledger_new_columns',
       (select count(*) = 4 from information_schema.columns
         where table_name = 'analytics_job_runs'
           and column_name in ('job_name', 'purge_unrolled_destroyed',
                               'checks_below_watermark', 'rolled_checks_total')),
       'II.2.3 discriminator + OV-6 reconciliation pair + finding-4 purge count';
select 'users_new_columns',
       (select count(*) = 2 from information_schema.columns
         where table_schema = 'public' and table_name = 'users'
           and column_name in ('timezone', 'rollup_rebuild_needed')),
       'D6 per-teacher zone + D2-II self-heal flag';
select 'users_tz_trigger_present',
       exists (select 1 from pg_trigger t join pg_class c on c.oid = t.tgrelid
                join pg_namespace n on n.oid = c.relnamespace
               where n.nspname = 'public' and c.relname = 'users'
                 and t.tgname = 'users_timezone_guard' and not t.tgisinternal),
       'II.2.1: validation + flag-stamping + flag-guarding, one trigger';
select 'default_zone_single_home',
       (select provolatile = 'i' from pg_proc where proname = 'analytics_default_zone')
       and analytics_default_zone() = 'America/Chicago',
       'D3-II: the default lives in ONE immutable function — three call sites, zero drifting literals';
select 'boundary_helper_exists',
       (select count(*) = 1 from pg_proc where proname = 'analytics_rolled_boundary'),
       'II.2.5: the single-sourced >=/< boundary for the two new readers';
select 'new_fns_service_role_only',
       not has_function_privilege('authenticated', 'rebuild_check_rollup(date)', 'execute')
       and not has_function_privilege('anon', 'rebuild_check_rollup(date)', 'execute')
       and not has_function_privilege('authenticated', 'analytics_rolled_boundary()', 'execute')
       and not has_function_privilege('anon', 'analytics_rolled_boundary()', 'execute'),
       '0009: rollup machinery is never client-callable';
select 'analytics_rpc_still_teacher_callable',
       has_function_privilege('authenticated', 'get_activity_analytics(uuid)', 'execute'),
       'CREATE OR REPLACE preserved the teacher grant — the panel keeps working';
select 'purge_notice_prefix_intact',
       (select strpos(prosrc, 'purge_soft_deleted: section_checks %+%') > 0
          from pg_proc where proname = 'purge_soft_deleted'),
       'verify-0029 §D greps this prefix; v4 must not break it';
select 'rolled_through_analytics_rows_only',
       not exists (select 1 from analytics_job_runs
                    where rolled_through is not null and job_name <> 'analytics'),
       'THE FLIPPED 0035 WATCHDOG (P5→P11): the watermark is written by the analytics job alone. Catches foreign writers; the grants rows above are what refuse a mimic';

-- @section B-no-student-identifiers
-- @expect-rows
-- 0026 §B4 forbids any '%student%' column outright, because on ITS tables a
-- student-shaped column could only be an identifier. These tables legitimately
-- carry student COUNTS (students / students_all), so the wildcard cannot be
-- ported verbatim — the property to assert is "no student IDENTITY", and the
-- type is what distinguishes them: a count is an integer, an identity is a
-- uuid or text. Naming a column `student_id integer` would still be caught by
-- the explicit list below.
select 'rollup_no_student_identifier_columns',
       not exists (select 1 from information_schema.columns
                    where table_schema = 'public'
                      and table_name in ('check_rollup_daily', 'check_item_rollup_daily')
                      and (column_name in ('student_id', 'user_id', 'actor_id', 'email',
                                           'display_name', 'ip_hash', 'user_agent')
                           or (column_name like '%student%'
                               and data_type not in ('integer', 'bigint', 'smallint')))),
       'R1/0026 §B4 extended: a rollup row may count students but must never NAME one — that is what keeps these tables outside the purge jobs'' scope';
select 'rollup_student_columns_are_counts',
       (select count(*) = 2 from information_schema.columns
         where table_schema = 'public'
           and table_name in ('check_rollup_daily', 'check_item_rollup_daily')
           and column_name like '%student%'
           and data_type in ('integer', 'bigint', 'smallint')),
       'the positive half: both student-shaped columns exist AND are counts (D6-II — the one figure that cannot be recomputed after pruning)';

-- @section D-day-key-units
-- @expect-rows
select 'day_chicago_evening_prior_day',
       analytics_day('2026-09-02 01:00:00+00'::timestamptz, 'America/Chicago') = date '2026-09-01',
       'D6: a US school evening stays on ITS calendar day — the design input that started this';
select 'day_auckland_same_day',
       analytics_day('2026-09-02 10:00:00+00'::timestamptz, 'Pacific/Auckland') = date '2026-09-02',
       '10:00 UTC = 22:00 NZST — same NZ day';
select 'day_zones_disagree_by_design',
       analytics_day('2026-09-01 20:00:00+00'::timestamptz, 'America/Chicago')
         <> analytics_day('2026-09-01 20:00:00+00'::timestamptz, 'Pacific/Auckland'),
       'the same instant is two different school days — why the zone is part of the key';
select 'day_dst_spring_forward_contiguous',
       analytics_day('2026-03-08 05:59:00+00'::timestamptz, 'America/Chicago') = date '2026-03-07'
       and analytics_day('2026-03-08 06:00:00+00'::timestamptz, 'America/Chicago') = date '2026-03-08'
       and analytics_day('2026-03-08 07:59:00+00'::timestamptz, 'America/Chicago') = date '2026-03-08'
       and analytics_day('2026-03-08 08:01:00+00'::timestamptz, 'America/Chicago') = date '2026-03-08',
       'OV-9b: the 23-hour spring-forward day (02:00 CST→03:00 CDT) neither gaps nor doubles';

-- @section C-behavioral-matrix
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_teacher  uuid := gen_random_uuid();
  v_s1       uuid := gen_random_uuid();
  v_s2       uuid := gen_random_uuid();
  v_activity uuid;
  v_activity2 uuid;
  v_version  uuid;
  v_b1 uuid := gen_random_uuid();
  v_b2 uuid := gen_random_uuid();
  -- Deterministic day-boundary instants (valid at ANY runtime, year-round):
  -- yesterday 20:00 UTC is a Chicago afternoon (same UTC date) but an Auckland
  -- MORNING of the NEXT date — the Chicago/Auckland day keys provably differ.
  v_d0 timestamptz := date_trunc('day', now()) - interval '1 day' + interval '10 hours';
  v_d1 timestamptz := date_trunc('day', now()) - interval '1 day' + interval '20 hours';
  v_d2 timestamptz := date_trunc('day', now()) - interval '1 day' + interval '22 hours';
  v_wm timestamptz;
  v_res jsonb;
  v_full_daily jsonb; v_full_items jsonb;
  v_snap_daily jsonb; v_snap_items jsonb;
  v_run_id bigint;
  v_n bigint; v_n2 bigint;
  v_flag boolean;
  v_refused boolean := false;
begin
  -- ---- fixtures ----------------------------------------------------------
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_teacher, 'vfy0036-t@vfy0036.example', '{}'::jsonb),
         (v_s1,      'vfy0036-s1@vfy0036.example', '{}'::jsonb),
         (v_s2,      'vfy0036-s2@vfy0036.example', '{}'::jsonb);
  update users set role = 'teacher' where id = v_teacher;
  update users set role = 'student' where id in (v_s1, v_s2);

  -- Ct: the timezone trigger (II.2.1) -------------------------------------
  begin
    update users set timezone = 'Not/AZone' where id = v_teacher;
    raise exception 'VERIFY FAIL Ct: invalid timezone was accepted';
  exception when others then
    if sqlerrm not ilike '%timezone%' then
      raise exception 'VERIFY FAIL Ct: refusal does not name the column (%)', sqlerrm;
    end if;
  end;
  update users set timezone = null where id = v_teacher;              -- NULL ok
  update users set timezone = 'America/Chicago' where id = v_teacher; -- valid ok
  -- The NULL→Chicago transition legitimately stamped the flag; clear it (as
  -- postgres — the guard refuses only client roles) for a clean E baseline.
  update users set rollup_rebuild_needed = false where id = v_teacher;
  raise notice 'PASS Ct: invalid zone refused naming the column; NULL and valid accepted';

  insert into activities (owner_id, title, slug, status)
  values (v_teacher, 'vfy 0036', 'vfy-0036', 'published')
  returning id into v_activity;
  insert into activities (owner_id, title, slug, status)
  values (v_teacher, 'vfy 0036 b', 'vfy-0036-b', 'published')
  returning id into v_activity2;

  insert into activity_versions (activity_id, version_num, content, created_by)
  values (v_activity, 1, format($doc$
    {"schemaVersion": 2,
     "meta": {"title": "vfy 0036"},
     "sections": [
       {"id": "sec-1", "rows": [{"id": "%s", "columns": [{"id": "%s", "blocks": [
          {"id": "%s", "type": "short_answer"},
          {"id": "%s", "type": "short_answer"}
       ]}]}]}
     ]}
    $doc$, gen_random_uuid(), gen_random_uuid(), v_b1, v_b2)::jsonb, v_teacher)
  returning id into v_version;
  update activities set current_version_id = v_version where id = v_activity;

  -- Census + item map (0026): read-time attribution for the rollup keys.
  insert into activity_version_census (version_id, census_key, block_count)
  values (v_version, 'short_answer', 2);
  insert into activity_version_items (version_id, item_id, census_key)
  values (v_version, v_b1::text, 'short_answer'),
         (v_version, v_b2::text, 'short_answer');

  -- Three checks, all safely below the 5-min watermark lag:
  --   c1  s1 a1 @ v_d0  {b1 correct, b2 incorrect}   (b2 answered ONLY here)
  --   c2  s1 a2 @ v_d1  {b1 correct}                 (s1's latest)
  --   c3  s2 a1 @ v_d2  {b1 incorrect, b2 recorded}
  -- Chicago: one day for all three. Auckland: v_d0 is one day, v_d1/v_d2 the next.
  insert into section_checks (student_id, activity_id, activity_version_id,
                              section_id, attempt_number, responses, verdicts, created_at)
  values
    (v_s1, v_activity, v_version, 'sec-1', 1, '{}'::jsonb,
     jsonb_build_object(v_b1::text, jsonb_build_object('verdict', 'correct'),
                        v_b2::text, jsonb_build_object('verdict', 'incorrect')), v_d0),
    (v_s1, v_activity, v_version, 'sec-1', 2, '{}'::jsonb,
     jsonb_build_object(v_b1::text, jsonb_build_object('verdict', 'correct')), v_d1),
    (v_s2, v_activity, v_version, 'sec-1', 1, '{}'::jsonb,
     jsonb_build_object(v_b1::text, jsonb_build_object('verdict', 'incorrect'),
                        v_b2::text, jsonb_build_object('verdict', 'recorded')), v_d2);

  -- E: roll liveness (P3) --------------------------------------------------
  select run_analytics_maintenance() into v_run_id;
  select rolled_through into v_wm from analytics_job_runs where id = v_run_id;
  if v_wm is null or v_wm > now() - interval '5 minutes' then
    raise exception 'VERIFY FAIL E: watermark not stamped at the 5-min lag (got %)', v_wm;
  end if;
  select count(*), coalesce(sum(checks), 0) into v_n, v_n2 from check_rollup_daily
   where activity_id = v_activity;
  if v_n <> 1 or v_n2 <> 3 then
    raise exception 'VERIFY FAIL E: expected 1 Chicago day / 3 checks, got % / %', v_n, v_n2;
  end if;
  if (select students from check_rollup_daily where activity_id = v_activity) <> 2 then
    raise exception 'VERIFY FAIL E: daily students should be 2';
  end if;
  if (select count(*) from check_item_rollup_daily where activity_id = v_activity) <> 2
     or (select verdicts_all from check_item_rollup_daily
          where activity_id = v_activity and item_id = v_b1::text) <> 3
     or (select correct_all from check_item_rollup_daily
          where activity_id = v_activity and item_id = v_b1::text) <> 2
     or (select verdicts_all from check_item_rollup_daily
          where activity_id = v_activity and item_id = v_b2::text) <> 2 then
    raise exception 'VERIFY FAIL E: item rollup counts wrong';
  end if;
  if (select job_name from analytics_job_runs where id = v_run_id) <> 'analytics'
     or (select checks_below_watermark from analytics_job_runs where id = v_run_id)
        <> (select rolled_checks_total from analytics_job_runs where id = v_run_id) then
    raise exception 'VERIFY FAIL E: ledger row wrong (job_name or reconciliation pair)';
  end if;
  raise notice 'PASS E: 3 checks rolled into both tables under the owner zone; watermark + equal pair on an analytics ledger row';

  -- F: idempotence ---------------------------------------------------------
  select jsonb_agg(to_jsonb(r) order by r.day) into v_full_daily
    from (select day, checks, students from check_rollup_daily where activity_id = v_activity) r;
  select jsonb_agg(to_jsonb(r) order by r.day, r.item_id) into v_full_items
    from (select day, item_id, verdicts_all, correct_all, incorrect_all, recorded_all, students_all
            from check_item_rollup_daily where activity_id = v_activity) r;
  perform run_analytics_maintenance();
  select jsonb_agg(to_jsonb(r) order by r.day) into v_snap_daily
    from (select day, checks, students from check_rollup_daily where activity_id = v_activity) r;
  if v_snap_daily is distinct from v_full_daily then
    raise exception 'VERIFY FAIL F: a second run changed the rolled state';
  end if;
  raise notice 'PASS F: a second run in the same state is a no-op';

  -- G: split-day semantics (finding 6) -------------------------------------
  delete from check_rollup_daily where activity_id = v_activity;
  delete from check_item_rollup_daily where activity_id = v_activity;
  delete from analytics_job_runs where rolled_through is not null;
  -- Simulate "the first roll happened mid-day": a watermark BETWEEN c2 and c3.
  insert into analytics_job_runs (job_name, rolled_through) values ('analytics', v_d1 + interval '1 hour');
  perform run_analytics_maintenance();
  select jsonb_agg(to_jsonb(r) order by r.day) into v_snap_daily
    from (select day, checks, students from check_rollup_daily where activity_id = v_activity) r;
  select jsonb_agg(to_jsonb(r) order by r.day, r.item_id) into v_snap_items
    from (select day, item_id, verdicts_all, correct_all, incorrect_all, recorded_all, students_all
            from check_item_rollup_daily where activity_id = v_activity) r;
  if v_snap_daily is distinct from v_full_daily or v_snap_items is distinct from v_full_items then
    raise exception 'VERIFY FAIL G: split-day result differs from the single-run state';
  end if;
  raise notice 'PASS G: a day rolled across a mid-day watermark equals the full-day recompute';

  -- H: analytics v2 — *_all = rolled + raw, totals keep meaning (OV-2) ------
  -- The analytics RPC is auth-gated (auth.uid() + can_read_activity), so the
  -- reads below go through the real door as the owning teacher (the
  -- verify-0034/0035 claims-switch idiom) rather than around it.
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);
  insert into section_checks (student_id, activity_id, activity_version_id,
                              section_id, attempt_number, responses, verdicts, created_at)
  values (v_s2, v_activity, v_version, 'sec-1', 2, '{}'::jsonb,
          jsonb_build_object(v_b1::text, jsonb_build_object('verdict', 'correct')),
          now() - interval '1 minute');   -- ABOVE the watermark: raw-only
  select get_activity_analytics(v_activity) into v_res;
  -- b1: correct@c1, correct@c2, incorrect@c3, correct@c4(raw) = 4 verdicts / 3 correct
  -- b2: incorrect@c1, recorded@c3                            = 2 verdicts / 0 correct
  if (select (k->>'verdicts_all')::int from jsonb_array_elements(v_res->'keys') k
       where k->>'census_key' = 'short_answer') <> 6
     or (select (k->>'correct_all')::int from jsonb_array_elements(v_res->'keys') k
          where k->>'census_key' = 'short_answer') <> 3 then
    raise exception 'VERIFY FAIL H: *_all is not rolled + raw (no-double-count sum)';
  end if;
  if (v_res->'totals'->>'checks')::int <> 4 then
    raise exception 'VERIFY FAIL H: totals.checks lost its meaning (expected 4 = 3 rolled + 1 raw, got %)',
      v_res->'totals'->>'checks';
  end if;
  raise notice 'PASS H: *_all and totals.checks = rolled + raw across the boundary, counted once';

  -- I: latest stays live; per-key students is LATEST-GROUNDED (D8) ----------
  if (v_res->'totals'->>'students')::int <> 2
     or (select (k->>'verdicts_latest')::int from jsonb_array_elements(v_res->'keys') k
          where k->>'census_key' = 'short_answer') <> 2   -- s1→c2{b1}, s2→c4{b1}
     or (select (k->>'students')::int from jsonb_array_elements(v_res->'keys') k
          where k->>'census_key' = 'short_answer') <> 2 then
    raise exception 'VERIFY FAIL I: latest reading or latest-grounded students wrong';
  end if;
  raise notice 'PASS I: latest is live from surviving rows; per-key students counts latest attempts only';

  -- N: the zone-change self-heal, end to end (D2-II) ------------------------
  update users set timezone = 'Pacific/Auckland' where id = v_teacher;
  select rollup_rebuild_needed into v_flag from users where id = v_teacher;
  if not v_flag then
    raise exception 'VERIFY FAIL N: the trigger did not stamp the rebuild flag on a zone change';
  end if;
  perform run_analytics_maintenance();
  select rollup_rebuild_needed into v_flag from users where id = v_teacher;
  if v_flag then
    raise exception 'VERIFY FAIL N: the self-heal did not clear the flag';
  end if;
  select count(*), coalesce(sum(checks), 0) into v_n, v_n2 from check_rollup_daily
   where activity_id = v_activity;
  if v_n <> 2 or v_n2 <> 3 then
    raise exception 'VERIFY FAIL N: expected 2 Auckland days / 3 rolled checks (invariant sum), got % / %', v_n, v_n2;
  end if;
  if (select coalesce(sum(verdicts_all), 0) from check_item_rollup_daily
       where activity_id = v_activity and item_id = v_b1::text) <> 3 then
    raise exception 'VERIFY FAIL N: item sums not invariant across the re-day';
  end if;
  raise notice 'PASS N: zone change → flag → nightly re-days in-horizon history; every check still counted exactly once';

  -- O2: flag integrity (OV-3/OV-4) ------------------------------------------
  execute format('set local request.jwt.claims = %L', json_build_object('sub', v_teacher, 'role', 'authenticated')::text);
  execute 'set local role authenticated';
  begin
    update users set rollup_rebuild_needed = true where id = v_teacher;
    v_refused := false;
  exception when others then
    v_refused := true;
  end;
  execute 'reset role';
  if not v_refused then
    raise exception 'VERIFY FAIL O2: a client wrote the rebuild flag';
  end if;
  -- The compare-and-clear predicate: a mid-rebuild zone change keeps its flag.
  update users set rollup_rebuild_needed = true where id = v_teacher;
  update users set rollup_rebuild_needed = false
   where id = v_teacher and timezone is not distinct from 'America/Chicago'; -- stale capture
  select rollup_rebuild_needed into v_flag from users where id = v_teacher;
  if not v_flag then
    raise exception 'VERIFY FAIL O2: compare-and-clear cleared against a stale zone';
  end if;
  update users set rollup_rebuild_needed = false
   where id = v_teacher and timezone is not distinct from 'Pacific/Auckland'; -- current capture
  select rollup_rebuild_needed into v_flag from users where id = v_teacher;
  if v_flag then
    raise exception 'VERIFY FAIL O2: compare-and-clear failed against the current zone';
  end if;
  raise notice 'PASS O2: client writes to the flag refused; compare-and-clear honors only the zone it rebuilt under';

  -- P2: the horizon clamp (D5-II — the OV-1 severe fix) ---------------------
  insert into check_rollup_daily (activity_id, activity_version_id, day, checks, students)
  values (v_activity, v_version, current_date - 40, 7, 1);   -- fabricated frozen history
  select rebuild_check_rollup() into v_res;
  if (select checks from check_rollup_daily
       where activity_id = v_activity and day = current_date - 40) is distinct from 7 then
    raise exception 'VERIFY FAIL P2: a no-arg rebuild touched a frozen day';
  end if;
  if v_res ? 'warning' then
    raise exception 'VERIFY FAIL P2: a no-arg rebuild should not warn';
  end if;
  select rebuild_check_rollup(current_date - 60) into v_res;
  if not (v_res ? 'warning') then
    raise exception 'VERIFY FAIL P2: a deep p_from must return the collapse warning';
  end if;
  raise notice 'PASS P2: frozen history is unreachable by default; reaching for it is answered with the warning';

  -- R2: the reconciliation instrument (OV-6) --------------------------------
  -- Both ledger figures are GLOBAL (every activity, every rolled day), which is
  -- what makes them a whole-database health signal — so this row asserts the
  -- DELTA against a baseline, not an absolute. That is also the honest reading
  -- post-arming, where the absolute pair legitimately diverges by the
  -- cumulative pruned count and only MOVEMENT between runs signals a problem.
  -- (Asserting an absolute here would also have been a lie about the fixture:
  -- P2's fabricated frozen row is deliberately rolled-without-raw.)
  select run_analytics_maintenance() into v_run_id;
  select checks_below_watermark - rolled_checks_total into v_n
    from analytics_job_runs where id = v_run_id;

  select analytics_rolled_boundary() into v_wm;
  insert into section_checks (student_id, activity_id, activity_version_id,
                              section_id, attempt_number, responses, verdicts, created_at)
  values (v_s2, v_activity, v_version, 'sec-1', 3, '{}'::jsonb,
          jsonb_build_object(v_b1::text, jsonb_build_object('verdict', 'recorded')),
          v_wm - interval '1 minute');   -- the late commit: below the watermark, unrolled
  select run_analytics_maintenance() into v_run_id;
  select checks_below_watermark - rolled_checks_total into v_n2
    from analytics_job_runs where id = v_run_id;
  if v_n2 - v_n <> 1 then
    raise exception 'VERIFY FAIL R2: the late commit moved the drift by % (want exactly 1)', v_n2 - v_n;
  end if;

  perform rebuild_check_rollup();   -- the documented heal
  select run_analytics_maintenance() into v_run_id;
  select checks_below_watermark - rolled_checks_total into v_n2
    from analytics_job_runs where id = v_run_id;
  if v_n2 <> v_n then
    raise exception 'VERIFY FAIL R2: the rebuild did not heal the drift (% vs baseline %)', v_n2, v_n;
  end if;
  raise notice 'PASS R2: a late-committing row moves the ledger drift by exactly 1, and the rebuild heals it back to baseline';

  -- J: rebuild ≡ incremental (bounded R7) + read-time re-attribution (D4) ---
  select jsonb_agg(to_jsonb(r) order by r.day, r.item_id) into v_full_items
    from (select day, item_id, verdicts_all, correct_all, incorrect_all, recorded_all, students_all
            from check_item_rollup_daily where activity_id = v_activity) r;
  delete from check_item_rollup_daily where activity_id = v_activity
    and day > current_date - 35;   -- in-horizon rows only; the frozen -40d daily row stands
  perform rebuild_check_rollup();
  select jsonb_agg(to_jsonb(r) order by r.day, r.item_id) into v_snap_items
    from (select day, item_id, verdicts_all, correct_all, incorrect_all, recorded_all, students_all
            from check_item_rollup_daily where activity_id = v_activity) r;
  if v_snap_items is distinct from v_full_items then
    raise exception 'VERIFY FAIL J: rebuild does not reproduce the incremental state';
  end if;
  update activity_version_items set census_key = 'renamed_kind'
   where version_id = v_version and item_id = v_b1::text;
  select get_activity_analytics(v_activity) into v_res;
  if not exists (select 1 from jsonb_array_elements(v_res->'keys') k
                  where k->>'census_key' = 'renamed_kind') then
    raise exception 'VERIFY FAIL J: a census re-key must re-attribute at READ time, no rebuild';
  end if;
  raise notice 'PASS J: rebuild ≡ incremental in the raw-complete window; census re-keys attribute at read';

  -- K: purge v4 — never blocked, counted, CASCADE-clean (finding 4 / R1) ----
  select count(*) into v_n from section_checks
   where activity_id = v_activity and created_at >= analytics_rolled_boundary();
  update activities set deleted_at = now() - interval '40 days' where id = v_activity;
  perform purge_soft_deleted();
  if exists (select 1 from section_checks where activity_id = v_activity)
     or exists (select 1 from check_rollup_daily where activity_id = v_activity)
     or exists (select 1 from check_item_rollup_daily where activity_id = v_activity) then
    raise exception 'VERIFY FAIL K: purge left checks or rollup residue behind';
  end if;
  if (select purge_unrolled_destroyed from analytics_job_runs
       where job_name = 'purge' order by id desc limit 1) is distinct from v_n::int then
    raise exception 'VERIFY FAIL K: the purge ledger row does not carry the unrolled-destroyed count (expected %)', v_n;
  end if;
  raise notice 'PASS K: purge v4 ran unblocked, counted % unrolled rows destroyed, rollup rows cascade-died', v_n;

  -- M: the panel ignores purge rows (II.1.2) --------------------------------
  insert into analytics_job_runs (job_name, ran_at, stale_cache_rows_deleted)
  values ('purge', now() + interval '1 hour', 999);   -- decoy: newest by ran_at
  select get_activity_analytics(v_activity2) into v_res;
  if (v_res->'job'->>'stale_cache_rows_deleted')::int = 999 then
    raise exception 'VERIFY FAIL M: the panel job object read a purge row';
  end if;
  raise notice 'PASS M: the job-health read filters to analytics rows; the decoy purge row is invisible';

  raise exception 'EXPECTED ROLLBACK';
end
$vfy$;

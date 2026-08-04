-- =============================================================================
-- 0026_analytics_census.sql — the analytics census + on-demand aggregation (S7)
-- -----------------------------------------------------------------------------
-- P3A's analytics lane, built against what S0-S6 actually shipped rather than
-- what the 2026-07-28 ruling assumed. Two corrections are baked into this
-- migration and are worth knowing before changing anything here:
--
--   1. THE CENSUS IS DERIVED, NOT WRITTEN AT PUBLISH TIME. Since 0017, every
--      published version's document lives in activity_versions.content
--      permanently, so a census can be computed from stored data at any time.
--      It is written by get-activity's cache-fill path (and by
--      scripts/backfill-census.js for versions already cached), never by
--      publish-activity. That is deliberate: publish-activity is rewritten at
--      the S9 cutover, and a census riding it would have to be written twice.
--      Same shape as 0025's derived dormancy — don't mark what you can derive.
--
--   2. THE SOURCE OF CHECK DATA IS section_checks, NOT submissions. P3A said
--      "submissions/audit_log"; that predates S4. `submissions` is the
--      anonymous-era table S9 demolishes, and checks deliberately never moved
--      into it.
--
-- WHAT THIS MIGRATION DELIBERATELY DOES NOT BUILD: durable pre-aggregated
-- rollups. Checking is formative by ruling (7.1A) — students re-check freely
-- and every check re-scores the whole section — so a naive per-day verdict
-- count tallies one student's one item many times. The correct durable shape
-- (first-attempt vs latest-per-student) is the SAME open question that gates
-- section_checks pruning, parked with the teacher-grading slice. Freezing the
-- wrong aggregate is the one mistake that cannot be undone later, precisely
-- because rollups exist to outlive the raw rows. So until that ruling lands,
-- get_activity_analytics computes aggregates ON DEMAND from raw checks and
-- reports both readings (all attempts AND latest attempt per student/section)
-- without picking one. See TODOS.md → "section_checks retention / GC".
--
--   get-activity cache-fill ──► write_version_census() ─► census + item map
--                                                            │
--   student checks ──► record_check ──► section_checks ───┐   │
--                                                         ▼   ▼
--   teacher panel ◄── get_activity_analytics() ◄── on-demand join (item id →
--                          │                        census key), no rollup
--                          └─ + last analytics_job_runs row (a dead cron is
--                             VISIBLE on the panel, not just in a log nobody
--                             reads)
--
--   pg_cron nightly ──► run_analytics_maintenance() ─► stale-rev cache sweep
--                                                    + growth ledger row
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. activity_version_census — what a published version is MADE OF
-- -----------------------------------------------------------------------------
-- One row per (version, census key): "this version contains 4
-- fill_in_blank and 2 data_plot.build_histogram". The key comes from the
-- viewer registry's censusKeyOf() — variant-suffixed for the blocks with an
-- interaction axis — so this table's vocabulary is the registry's, and a new
-- block type is counted the day it registers.
--
-- ON DELETE CASCADE, like activity_version_reads: this is DERIVED data about a
-- version. It must never block deleting one, and it has no meaning without it.
create table activity_version_census (
  version_id  uuid not null references activity_versions(id) on delete cascade,
  census_key  text not null,
  block_count integer not null check (block_count > 0),
  created_at  timestamptz not null default now(),

  primary key (version_id, census_key)
);

-- -----------------------------------------------------------------------------
-- 2. activity_version_items — item id → census key
-- -----------------------------------------------------------------------------
-- The join table that makes check data legible. section_checks.verdicts is
-- keyed by ITEM id — a blank id, an in-equation gap id, or a block id — and
-- nothing else in this database knows what an item id is. Without this map, an
-- aggregate can count checks but can never say what KIND of question students
-- got wrong, which is the entire question P3A exists to answer.
--
-- The id set is produced by the same walk the GRADER uses to decide which ids
-- it accepts (packages/viewer/src/server/grading/walk.ts, via the census
-- module). One enumeration, not two: a second one would drift, and drifted
-- attribution is silent.
create table activity_version_items (
  version_id uuid not null references activity_versions(id) on delete cascade,
  item_id    text not null,
  census_key text not null,

  primary key (version_id, item_id)
);

-- -----------------------------------------------------------------------------
-- 3. analytics_job_runs — the maintenance ledger
-- -----------------------------------------------------------------------------
-- 0022 learned that a scheduled job which silently stops running is the real
-- failure mode, and answered it with `raise notice`. That answer is weaker than
-- it looks: pg_cron records a job's STATUS and return value in
-- cron.job_run_details, not its notices, and free-tier Postgres logs are gone
-- in about a day. So this run leaves a durable row instead, and
-- get_activity_analytics hands the newest one to the teacher panel — a job that
-- stopped three weeks ago is then visible on a screen someone actually opens.
--
-- NO foreign keys, deliberately: this outlives every table it reports on
-- (audit_log.target_id precedent). It holds counts, never identifiers.
create table analytics_job_runs (
  id                       bigserial primary key,
  ran_at                   timestamptz not null default now(),
  stale_cache_rows_deleted integer not null default 0,
  -- Growth observation for the parked retention decision: nothing prunes
  -- section_checks today, and this is the ledger that will say how fast it
  -- actually grows when the teacher-grading slice needs the number.
  section_check_rows       bigint not null default 0,
  census_versions          bigint not null default 0,
  notes                    text
);

create index analytics_job_runs_ran_at_idx on analytics_job_runs (ran_at desc);

alter table activity_version_census enable row level security;
alter table activity_version_census force row level security;
alter table activity_version_items enable row level security;
alter table activity_version_items force row level security;
alter table analytics_job_runs enable row level security;
alter table analytics_job_runs force row level security;
-- Zero policies on all three, deliberately: service-role writes them, and the
-- only read path is the DEFINER RPC below, which does its own ownership check.
-- Same posture as activity_version_reads / allowlist / audit_log — the absence
-- of a policy IS the access control. Shows up as rls_enabled_no_policy (INFO).

-- =============================================================================
-- NO STUDENT IDENTIFIERS LIVE IN THIS MIGRATION'S TABLES.
-- -----------------------------------------------------------------------------
-- Everything above describes AUTHORED CONTENT (what a worksheet is made of) or
-- job bookkeeping. Nothing here is derived from a particular student, so none
-- of it enters the retention scope the 0022-0025 arc closed, and none of it
-- needs a purge path.
--
-- That property is load-bearing and easy to erode: adding a student_id column
-- "just for one useful query" would turn these into personal-data tables that
-- the nightly purge jobs know nothing about. scripts/verify-0026.sql section B
-- asserts the absence against information_schema so the erosion fails loudly.
--
-- Per-student analytics is not forbidden — it is a different design, and it
-- belongs with the durable-rollup slice, where retention windows and
-- small-cohort exposure (a class of one makes an "aggregate" personal) get
-- decided together with counsel-readable wording in
-- docs/compliance/retention-policy.md.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 4. write_version_census — the census write path (service-role only)
-- -----------------------------------------------------------------------------
-- ONE function writing BOTH tables, because a partially-written census is worse
-- than none: counts present + items missing looks like a censused version whose
-- every check is unattributable. plpgsql gives the atomicity for free, and the
-- Edge Function gets a single all-or-nothing signal it can act on (it withholds
-- the read-cache row when this fails, so the next read retries).
--
-- Delete-then-insert rather than upsert: a version's document is immutable, but
-- the census RULE is not (a registry key rename, a new variant). Re-running
-- must be able to replace a stale census, not merge into it. That also makes
-- the backfill script safe to run any number of times.
create function write_version_census(
  p_version_id uuid,
  p_counts     jsonb,
  p_items      jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_version_id is null then
    raise exception 'version_id is required';
  end if;

  delete from activity_version_census where version_id = p_version_id;
  delete from activity_version_items  where version_id = p_version_id;

  insert into activity_version_census (version_id, census_key, block_count)
  select p_version_id,
         c->>'censusKey',
         (c->>'blockCount')::integer
  from jsonb_array_elements(coalesce(p_counts, '[]'::jsonb)) as c
  on conflict (version_id, census_key) do update
    set block_count = excluded.block_count;

  insert into activity_version_items (version_id, item_id, census_key)
  select p_version_id,
         i->>'itemId',
         i->>'censusKey'
  from jsonb_array_elements(coalesce(p_items, '[]'::jsonb)) as i
  on conflict (version_id, item_id) do update
    set census_key = excluded.census_key;
end;
$$;

revoke execute on function write_version_census(uuid, jsonb, jsonb) from public, anon, authenticated;
grant execute on function write_version_census(uuid, jsonb, jsonb) to service_role;

-- -----------------------------------------------------------------------------
-- 5. run_analytics_maintenance — the nightly job (service-role / cron only)
-- -----------------------------------------------------------------------------
-- Two jobs, both cheap:
--
--   (a) The TAIL half of the read-cache GC (finding R6(a)). A SANITIZER_REV
--       change orphans every cache row written under the old rev. get-activity
--       deletes the stale rows for any version it re-caches — exact, because
--       only that code knows the current rev — but a version nobody opens again
--       keeps its orphan forever. This sweep catches those by treating the rev
--       of the most RECENTLY written cache row as current.
--
--       That heuristic can be wrong for one window: right after a deploy, before
--       any read has happened, the newest row still carries the OLD rev, and the
--       sweep would delete rows for the new one. The consequence is a deleted
--       cache row, which the next read regenerates — the failure mode is a cache
--       miss, not incorrect data. Nothing here touches student work.
--
--   (b) The growth ledger (see analytics_job_runs).
--
-- Returns the ledger row id: pg_cron stores a function's RETURN VALUE in
-- cron.job_run_details, so the run is traceable there as well as in the table.
create function run_analytics_maintenance()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_rev  text;
  v_deleted      integer := 0;
  v_checks       bigint;
  v_versions     bigint;
  v_run_id       bigint;
begin
  select sanitizer_rev into v_current_rev
  from activity_version_reads
  order by created_at desc
  limit 1;

  -- No cache rows at all, or a single rev in play: nothing to sweep. The
  -- delete below would be a no-op anyway; the branch keeps the intent legible.
  if v_current_rev is not null then
    delete from activity_version_reads
    where sanitizer_rev is distinct from v_current_rev;
    get diagnostics v_deleted = row_count;
  end if;

  select count(*) into v_checks from section_checks;
  select count(distinct version_id) into v_versions from activity_version_census;

  insert into analytics_job_runs (
    stale_cache_rows_deleted, section_check_rows, census_versions, notes
  )
  values (
    v_deleted, v_checks, v_versions,
    case when v_current_rev is null
      then 'no cached reads yet; sweep skipped'
      else 'current sanitizer_rev=' || v_current_rev
    end
  )
  returning id into v_run_id;

  return v_run_id;
end;
$$;

revoke execute on function run_analytics_maintenance() from public, anon, authenticated;
grant execute on function run_analytics_maintenance() to service_role;

-- Schedule via Supabase pg_cron. Run this once after deploying (the author
-- does this; pg_cron must be enabled in the dashboard first):
--   select cron.schedule('analytics-maintenance', '30 3 * * *',
--                        'select run_analytics_maintenance();');
-- 03:30 keeps it clear of the 03:00 purge job (0003) — the two touch different
-- tables, but a night where both run long should not overlap for no reason.
-- Cron registration is NOT in this migration, matching purge_soft_deleted's
-- precedent: pg_cron lives outside the migration's reach.

-- -----------------------------------------------------------------------------
-- 6. get_activity_analytics — the teacher read surface
-- -----------------------------------------------------------------------------
-- One call returns everything the panel shows. DEFINER because the analytics
-- tables carry zero policies by design; the ownership gate is can_read_activity
-- (the helper, never an inlined owner check — standing rule — so a future
-- co-teacher path is inherited).
--
-- Returns jsonb rather than a table because the shape is nested (structure +
-- per-key stats + totals + job health), and one round trip beats four.
--
-- The two readings, reported side by side and NEITHER privileged:
--
--   *_all    — every verdict ever recorded. Inflated by re-checking, which is
--              a FEATURE of the check loop, not noise.
--   *_latest — one verdict per (student, version, section, item): the student's
--              most recent attempt. Closer to "how did the class end up".
--
-- Which of these deserves to become a durable rollup is the parked question.
-- Computing both, live, from raw rows is what keeps that question open.
create function get_activity_analytics(p_activity_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_current_version uuid;
  v_result          jsonb;
begin
  if auth.uid() is null then
    raise exception 'Not authorized';
  end if;
  if not can_read_activity(p_activity_id) then
    -- Same no-oracle discipline as get_published_activity: one message for
    -- "not yours" and "does not exist".
    raise exception 'Not available';
  end if;

  select current_version_id into v_current_version
  from activities where id = p_activity_id;

  with checks as (
    select sc.id, sc.student_id, sc.section_id, sc.activity_version_id,
           sc.attempt_number, sc.verdicts, sc.created_at
    from section_checks sc
    where sc.activity_id = p_activity_id
  ),
  -- The student's most recent attempt at each section of each version.
  latest as (
    select distinct on (student_id, activity_version_id, section_id) id
    from checks
    order by student_id, activity_version_id, section_id, attempt_number desc
  ),
  exploded as (
    select c.student_id,
           c.activity_version_id,
           e.key                as item_id,
           e.value->>'verdict'  as verdict,
           (c.id in (select id from latest)) as is_latest
    from checks c
    cross join lateral jsonb_each(c.verdicts) e
  ),
  stats as (
    select
      -- An item id with no census row is NEVER dropped: it surfaces as its own
      -- bucket. Silence here would read as "nothing to see"; a visible
      -- _unattributed count reads as "the census is behind", which is the
      -- truth and is fixable by re-running the backfill.
      coalesce(i.census_key, '_unattributed')                     as census_key,
      count(*)                                                    as verdicts_all,
      count(*) filter (where x.verdict = 'correct')               as correct_all,
      count(*) filter (where x.verdict = 'incorrect')             as incorrect_all,
      count(*) filter (where x.verdict = 'recorded')              as recorded_all,
      count(*) filter (where x.is_latest)                         as verdicts_latest,
      count(*) filter (where x.is_latest and x.verdict = 'correct')   as correct_latest,
      count(*) filter (where x.is_latest and x.verdict = 'incorrect') as incorrect_latest,
      count(*) filter (where x.is_latest and x.verdict = 'recorded')  as recorded_latest,
      count(distinct x.student_id)                                as students
    from exploded x
    left join activity_version_items i
      on i.version_id = x.activity_version_id
     and i.item_id    = x.item_id
    group by 1
  ),
  structure as (
    select c.census_key, c.block_count
    from activity_version_census c
    where c.version_id = v_current_version
  )
  select jsonb_build_object(
    'activity_id',        p_activity_id,
    'current_version_id', v_current_version,
    -- Present but empty = "this version has never been opened by a student"
    -- (the census is written on first read). The panel says so rather than
    -- showing a bare zero.
    'censused',           exists (select 1 from structure),
    'keys',               coalesce(
      (
        -- FULL OUTER: a key can exist in the current version with no checks
        -- yet (new question), or in the check history with no place in the
        -- current version (the teacher removed or replaced it). Both are real
        -- and both are worth seeing.
        select jsonb_agg(row_to_json(k) order by k.census_key)
        from (
          select coalesce(s.census_key, st.census_key) as census_key,
                 st.block_count,
                 coalesce(s.verdicts_all, 0)      as verdicts_all,
                 coalesce(s.correct_all, 0)       as correct_all,
                 coalesce(s.incorrect_all, 0)     as incorrect_all,
                 coalesce(s.recorded_all, 0)      as recorded_all,
                 coalesce(s.verdicts_latest, 0)   as verdicts_latest,
                 coalesce(s.correct_latest, 0)    as correct_latest,
                 coalesce(s.incorrect_latest, 0)  as incorrect_latest,
                 coalesce(s.recorded_latest, 0)   as recorded_latest,
                 coalesce(s.students, 0)          as students
          from stats s
          full outer join structure st on st.census_key = s.census_key
        ) k
      ),
      '[]'::jsonb
    ),
    'totals', (
      select jsonb_build_object(
        'checks',         count(*),
        'students',       count(distinct student_id),
        'last_check_at',  max(created_at)
      )
      from checks
    ),
    'job', (
      select case when r.id is null then null else jsonb_build_object(
        'last_run_at',              r.ran_at,
        'stale_cache_rows_deleted', r.stale_cache_rows_deleted,
        'section_check_rows',       r.section_check_rows
      ) end
      from (select * from analytics_job_runs order by ran_at desc limit 1) r
    )
  ) into v_result;

  return v_result;
end;
$$;

revoke execute on function get_activity_analytics(uuid) from public, anon;
grant execute on function get_activity_analytics(uuid) to authenticated, service_role;

-- =============================================================================
-- Intentional advisor residue after this migration (do NOT "fix" these)
-- -----------------------------------------------------------------------------
--   * rls_enabled_no_policy (INFO) on activity_version_census,
--     activity_version_items, analytics_job_runs — deny-by-default, zero
--     policies IS the design (joins activity_version_reads / allowlist /
--     audit_log / student_domain in the documented set).
--   * authenticated_security_definer_function_executable (WARN) on
--     get_activity_analytics — DEFINER with an inline gate (auth.uid() +
--     can_read_activity) is the accepted pattern; 0015's footer lists the set
--     and this joins it.
--   * write_version_census / run_analytics_maintenance are DEFINER and
--     service_role-only; they are never reachable by a signed-in user.
-- =============================================================================

-- =============================================================================
-- Verification — spot checks (run scripts/verify-0026.sql for the full pass)
-- =============================================================================
--
-- -- 1. Grants. EXPECT get_activity_analytics: {authenticated, service_role};
-- --    write_version_census / run_analytics_maintenance: {service_role} only
-- --    (+postgres on all three). NO PUBLIC and NO anon row for any.
-- select p.proname, coalesce(g.rolname, 'PUBLIC') as grantee
-- from pg_proc p
-- cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
-- left join pg_roles g on g.oid = a.grantee
-- where p.proname in ('get_activity_analytics', 'write_version_census',
--                     'run_analytics_maintenance')
-- order by 1, 2;
--
-- -- 2. Tables locked down. EXPECT rowsecurity=t, forcerowsecurity=t, 0 policies.
-- select relname, relrowsecurity, relforcerowsecurity from pg_class
-- where relname in ('activity_version_census', 'activity_version_items',
--                   'analytics_job_runs');
--
-- -- 3. No student identifiers reached the analytics tables. EXPECT 0 rows.
-- select table_name, column_name from information_schema.columns
-- where table_schema = 'public'
--   and table_name in ('activity_version_census', 'activity_version_items',
--                      'analytics_job_runs')
--   and column_name in ('student_id', 'user_id', 'actor_id', 'email');

-- =============================================================================
-- 0063_zone_name_lookup.sql — check a timezone name without scanning the tz
-- database (docs/reviews/2026-10-18-live-perf-baseline.md §1)
-- -----------------------------------------------------------------------------
-- Measured live 2026-10-18: `exists (select 1 from pg_timezone_names where
-- name = …)` costs ~820 ms on this instance. pg_timezone_names is a function
-- that walks the whole tz database on every call; filtering by name does not
-- make it cheap. It ran on three paths:
--
--   fact_class_zone (0050)        every daily-practice open and overview —
--                                 fact_sprint_entry averaged 940 ms,
--                                 fact_sprint_overview 620 ms
--   users_timezone_guard (0036)   every write to a users row with a timezone —
--                                 set_public_name took 821 ms, all of it here
--   recompute_check_rollup_days   the nightly rollup, once per run
--
--   §A  iana_zone_names — the valid names, seeded from pg_timezone_names
--   §B  iana_zone_is_valid(name) — the lookup; falls back to the slow scan
--       ONLY for a name the table does not hold, so the answer is exactly
--       the old one
--   §C  the three callers re-created with the one check swapped
--   §D  grants
--
-- SAME ANSWERS, NOT A WIDER CHECK. A cheaper test (`now() at time zone x` in an
-- exception block) was rejected: `at time zone` also accepts abbreviations and
-- POSIX strings ('EST', 'UTC+5' — the latter sign-inverted), which the guard's
-- "valid IANA zone name" rule refuses today.
--
-- STALENESS. tzdata never removes a name (retired zones move to `backward`,
-- which pg_timezone_names still lists), so after a Postgres upgrade the table
-- can only be MISSING a new zone, never hold a dead one. A missing zone still
-- validates through the fallback, at the old cost. verify-0063's
-- `zone_table_complete` row goes red when that happens; the fix is to re-run
-- §A's insert.
--
-- NOT PERSONAL DATA: the table holds the tz database's zone names only
-- (data-map draft-30).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- §A — iana_zone_names
-- -----------------------------------------------------------------------------
create table iana_zone_names (
  name text primary key
);

alter table iana_zone_names enable row level security;
alter table iana_zone_names force row level security;
-- No policies: only the definer lookup below reads it.

insert into iana_zone_names (name)
select name from pg_timezone_names
on conflict do nothing;

-- -----------------------------------------------------------------------------
-- §B — iana_zone_is_valid
-- -----------------------------------------------------------------------------
-- plpgsql so the order is guaranteed: the slow scan runs only after the table
-- has said no. NULL is not a zone, and answers at once (the old checks scanned
-- for it).
create or replace function iana_zone_is_valid(p_zone text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if p_zone is null then
    return false;
  end if;
  if exists (select 1 from iana_zone_names where name = p_zone) then
    return true;
  end if;
  -- Not in the table: not a zone, or a zone newer than the table.
  return exists (select 1 from pg_timezone_names where name = p_zone);
end;
$$;

-- -----------------------------------------------------------------------------
-- §C — the three callers, each with only the check swapped
-- -----------------------------------------------------------------------------

-- 0050. The class's practice day: the teacher's timezone (0036), else the
-- platform default. An unknown zone name falls back rather than failing a
-- student.
create or replace function fact_class_zone(p_class_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select u.timezone from classes c join users u on u.id = c.teacher_id
      where c.id = p_class_id
        and iana_zone_is_valid(u.timezone)),
    analytics_default_zone());
$$;

-- 0036. Still SECURITY INVOKER on purpose: the rollup_rebuild_needed check
-- reads current_user as the CLIENT role. That is why §D grants the lookup to
-- authenticated, and why the call is schema-qualified (the client's
-- search_path applies here, not a pinned one).
create or replace function users_timezone_guard()
returns trigger
language plpgsql
as $$
begin
  -- The flag is machinery, not user data: only the trigger itself (below) and
  -- the DEFINER job may move it. current_user is the CLIENT role under
  -- PostgREST ('authenticated'/'anon'); definer functions run as their owner.
  if tg_op = 'UPDATE'
     and new.rollup_rebuild_needed is distinct from old.rollup_rebuild_needed
     and current_user in ('authenticated', 'anon') then
    raise exception 'rollup_rebuild_needed is not client-writable';
  end if;

  if new.timezone is not null
     and not public.iana_zone_is_valid(new.timezone) then
    raise exception 'timezone must be a valid IANA zone name (got %)', new.timezone;
  end if;

  -- D2-II: a zone CHANGE (including NULL→zone and zone→NULL — both move the
  -- effective day boundary) queues the self-heal.
  if tg_op = 'UPDATE' and new.timezone is distinct from old.timezone then
    new.rollup_rebuild_needed := true;
  end if;

  return new;
end;
$$;

-- 0036, copied from the live definition (pg_get_functiondef, 2026-10-18) with
-- the one `update _rollup_zone` line changed.
create or replace function recompute_check_rollup_days(
  p_versions uuid[], p_floor date, p_bound timestamptz
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_days bigint := 0;
begin
  -- Resolve each activity's zone ONCE (owner → timezone → default), with the
  -- 0022-class guard: a bad zone that somehow got past the trigger degrades
  -- that one activity to the default, never the run (verify-0036 §L-class).
  create temp table if not exists _rollup_zone (
    activity_id uuid primary key, zone text
  ) on commit drop;
  delete from _rollup_zone;
  insert into _rollup_zone (activity_id, zone)
  select a.id, coalesce(u.timezone, analytics_default_zone())
    from activities a join users u on u.id = a.owner_id
   where exists (select 1 from section_checks sc
                  where sc.activity_id = a.id
                    and (p_versions is null or sc.activity_version_id = any (p_versions)));
  update _rollup_zone z set zone = analytics_default_zone()
   where not iana_zone_is_valid(z.zone);

  -- The touched (version, day) set, day-keyed in each owner's zone.
  create temp table if not exists _rollup_scope (
    activity_id uuid, activity_version_id uuid, day date, zone text,
    primary key (activity_version_id, day)
  ) on commit drop;
  delete from _rollup_scope;
  insert into _rollup_scope (activity_id, activity_version_id, day, zone)
  select distinct sc.activity_id, sc.activity_version_id,
         analytics_day(sc.created_at, z.zone), z.zone
    from section_checks sc join _rollup_zone z on z.activity_id = sc.activity_id
   where (p_versions is null or sc.activity_version_id = any (p_versions))
     and sc.created_at < p_bound
     and analytics_day(sc.created_at, z.zone) >= p_floor;

  -- Full-day recompute (finding 6): DELETE covers the scope's days even where
  -- no raw rows remain (a re-day moves rows off a day; its stale row must go).
  delete from check_rollup_daily r
   using (select distinct activity_version_id from _rollup_scope) s
   where r.activity_version_id = s.activity_version_id and r.day >= p_floor;
  delete from check_item_rollup_daily r
   using (select distinct activity_version_id from _rollup_scope) s
   where r.activity_version_id = s.activity_version_id and r.day >= p_floor;

  insert into check_rollup_daily (activity_id, activity_version_id, day, checks, students)
  select sc.activity_id, sc.activity_version_id,
         analytics_day(sc.created_at, z.zone),
         count(*), count(distinct sc.student_id)
    from section_checks sc
    join (select distinct activity_version_id, zone from _rollup_scope) z
      on z.activity_version_id = sc.activity_version_id
   where sc.created_at < p_bound
     and analytics_day(sc.created_at, z.zone) >= p_floor
   group by 1, 2, 3;

  insert into check_item_rollup_daily (activity_id, activity_version_id, day,
                                       item_id, verdicts_all, correct_all,
                                       incorrect_all, recorded_all, students_all)
  select sc.activity_id, sc.activity_version_id,
         analytics_day(sc.created_at, z.zone),
         e.key,
         count(*),
         count(*) filter (where e.value->>'verdict' = 'correct'),
         count(*) filter (where e.value->>'verdict' = 'incorrect'),
         count(*) filter (where e.value->>'verdict' = 'recorded'),
         count(distinct sc.student_id)
    from section_checks sc
    join (select distinct activity_version_id, zone from _rollup_scope) z
      on z.activity_version_id = sc.activity_version_id
    cross join lateral jsonb_each(sc.verdicts) e
   where sc.created_at < p_bound
     and analytics_day(sc.created_at, z.zone) >= p_floor
   group by 1, 2, 3, 4;

  select count(*) into v_days from _rollup_scope;
  return v_days;
end;
$$;

-- -----------------------------------------------------------------------------
-- §D — grants
-- -----------------------------------------------------------------------------
revoke all on table iana_zone_names from public, anon, authenticated;

-- authenticated: the invoker guard calls it on a client's own users write.
revoke execute on function iana_zone_is_valid(text) from public, anon;
grant  execute on function iana_zone_is_valid(text) to authenticated, service_role;

-- create or replace keeps the earlier grants on the three re-created functions.

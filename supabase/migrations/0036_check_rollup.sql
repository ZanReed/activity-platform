-- =============================================================================
-- 0036_check_rollup.sql — the durable analytics rollup + the arming arc's build
-- -----------------------------------------------------------------------------
-- Plan + every ruling: docs/design/check-retention-and-rollup.md PART II
-- (§II.1–II.5, eng-reviewed CLEAR-AMENDED 2026-08-16: D2-II/D3-II/D4-II +
-- outside-voice OV-1..OV-9). Part I (0035) shipped the DISARMED prune behind
-- the NULL-watermark gate; this migration ships the thing that writes the
-- watermark. After this applies, the gate's character changes: the watermark
-- EXISTS nightly, so the prune is held disarmed by (a) not being scheduled and
-- (b) its dry-run default — no longer by the NULL gate. Arming remains the §4
-- checklist (counsel Q10 + N green nights), author-run.
--
--   §A  users.timezone + rollup_rebuild_needed + the guard trigger   (D6, D2-II)
--   §B  analytics_default_zone + analytics_day                       (D3-II, D6)
--   §C  the two rollup tables                                        (D4, R1)
--   §D  ledger widening: job_name + reconciliation + purge count    (II.2.3, OV-6)
--   §E  analytics_rolled_boundary — the single-sourced boundary      (II.2.5)
--   §F  the day-recompute core + rebuild_check_rollup                (D5-II, R7)
--   §G  run_analytics_maintenance v2: heal → roll → stamp            (II.2.4)
--   §H  purge_soft_deleted v4: the ledger row                        (finding 4)
--   §I  get_activity_analytics v2: rolled + raw, latest-grounded     (OV-2, D8)
--   §J  grants                                                       (0009)
--
-- P5 SUPERSESSIONS (the flips this migration owes):
--   * 0022's header and 0026's analytics_job_runs comment both say nothing
--     prunes/pre-aggregates section_checks. AS OF 0035+0036 that era is over:
--     0035 ships the (disarmed) prune, THIS file ships the rollup. Those
--     comments describe their own migrations' moment truthfully and stay; this
--     header is the recorded supersession (the 0029-tombstone pattern).
--   * verify-0035 §A's `rolled_through_never_written` row dies in the same
--     commit as this file — replaced by verify-0036 §A's live-state scoping
--     assertion (`rolled_through` on analytics rows ONLY), exactly as that
--     row's own message instructed (flip it there, do not delete it).
--
-- THE ONE DESIGN TENSION CARRIED VISIBLY (from the Part II review, OV-1/D5-II):
-- rolled rows are computed FROM raw rows, and the armed prune DELETES raw rows.
-- Every recompute path in this file is therefore HORIZON-CLAMPED: only days
-- ending after now() - PRUNE_HORIZON — days the prune's clause 4 guarantees
-- raw-complete — are ever recomputed. Older rolled rows are FROZEN history,
-- keyed under the zone they were recorded in. An explicit deep rebuild is
-- honored but answers with a warning naming the collapse risk. Known bounded
-- artifact: a zone change can double-count boundary-hour rows AT THE HORIZON
-- SEAM (≤ ~2 day-boundaries' worth, once per zone change) — accepted in
-- review as the price of never letting a rebuild destroy months of aggregates.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A. users.timezone + the self-heal flag + the guard trigger (D6, D2-II, OV-3/4)
-- -----------------------------------------------------------------------------
-- timezone: nullable IANA name; NULL means "use the platform default at read
-- time" (no stored backfill — a future default change is a one-line migration).
-- rollup_rebuild_needed: the D2-II self-heal flag. A rolled row's day key is
-- frozen at roll time, so a zone change would let boundary-hour checks count
-- under BOTH the old and new day; the flag makes the nightly job re-day that
-- owner's in-horizon history. Set ONLY by the trigger; cleared ONLY by the
-- nightly job's compare-and-clear. users carries table-level client UPDATE
-- (0032) and users_update_self pins only role/account_tier, so without the
-- trigger guard a client could clear its own flag and freeze a double-count
-- in place (OV-4) — or write garbage into timezone and kill the nightly run
-- at its next fire (the 0022 failure class).
alter table users add column timezone text;
alter table users add column rollup_rebuild_needed boolean not null default false;

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
     and not exists (select 1 from pg_timezone_names where name = new.timezone) then
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

create trigger users_timezone_guard
  before insert or update on users
  for each row execute function users_timezone_guard();

-- The author's row (Pacific/Auckland — the one live teacher in NZ). Email-keyed
-- and existence-guarded: a no-op on a fresh replay where the row is absent, so
-- this stays reproducible-from-migrations (the 0021 display_name lesson: data
-- edits that migrations cannot replay become permanent archaeology).
update users set timezone = 'Pacific/Auckland' where email = 'zanreed@gmail.com';

-- -----------------------------------------------------------------------------
-- B. The zone vocabulary: one default, one day function (D3-II, D6)
-- -----------------------------------------------------------------------------
-- The default lives in EXACTLY one place. Three call sites (the roll, its
-- exception guard, verify-0036) would otherwise carry drifting literals, and a
-- drifted default forks day keys (D3-II). IMMUTABLE: the planner inlines it.
create function analytics_default_zone()
returns text
language sql
immutable
as $$ select 'America/Chicago' $$;

-- "Which school day was this instant?" — THE day-key definition (D6). STABLE,
-- not immutable: zone offset rules can change with tzdata updates, and lying
-- to the planner about that is how cached wrong answers happen.
create function analytics_day(p_at timestamptz, p_zone text)
returns date
language sql
stable
as $$ select (p_at at time zone p_zone)::date $$;

-- -----------------------------------------------------------------------------
-- C. The two rollup tables (D4 — item grain, daily grain; R1 — no identifiers)
-- -----------------------------------------------------------------------------
-- These rows are DESIGNED TO OUTLIVE their source rows: after the prune is
-- armed, superseded raw checks are deleted and these aggregates are the only
-- record of the *_all flow. That is why:
--   * NO student identifiers, ever — verify-0036 §B extends 0026 §B4's erosion
--     guard over both tables; a "student_id just for one query" turns them
--     into personal-data tables the purge jobs know nothing about.
--   * Both FKs CASCADE — the aggregates die with the activity/version, so a
--     purged class of one leaves no de-identified-in-name-only residue (R1).
--   * day is keyed in the OWNER'S zone at roll time (D6); the zone is not
--     stored per row — a frozen row's day simply IS the day it was recorded
--     under, like a date in an old paper ledger (D5-II).
-- students / students_all: per-day distinct students. Their production reader
-- is the future daily-trend surface (tracked in TODOS, P1's tracked-debt
-- form); they ship anyway because per-day distinct students is the ONE figure
-- that cannot be recomputed retroactively once pruning runs (D6-II).
create table check_rollup_daily (
  activity_id         uuid not null references activities(id) on delete cascade,
  activity_version_id uuid not null references activity_versions(id) on delete cascade,
  day                 date not null,
  checks              integer not null,
  students            integer not null,
  rolled_at           timestamptz not null default now(),
  primary key (activity_version_id, day)
);
create index check_rollup_daily_activity_idx on check_rollup_daily (activity_id, day);

create table check_item_rollup_daily (
  activity_id         uuid not null references activities(id) on delete cascade,
  activity_version_id uuid not null references activity_versions(id) on delete cascade,
  day                 date not null,
  item_id             text not null,
  verdicts_all        integer not null,
  correct_all         integer not null,
  incorrect_all       integer not null,
  recorded_all        integer not null,
  students_all        integer not null,
  rolled_at           timestamptz not null default now(),
  primary key (activity_version_id, day, item_id)
);
create index check_item_rollup_daily_activity_idx on check_item_rollup_daily (activity_id, day);

alter table check_rollup_daily enable row level security;
alter table check_rollup_daily force row level security;
alter table check_item_rollup_daily enable row level security;
alter table check_item_rollup_daily force row level security;
-- Zero policies (0026 posture) AND the platform default grants revoked
-- outright — belt over braces; the only read path is the DEFINER RPC (§I).
revoke all on check_rollup_daily from public, anon, authenticated;
revoke all on check_item_rollup_daily from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- D. Ledger widening (II.2.3 job_name; OV-6 reconciliation; finding 4)
-- -----------------------------------------------------------------------------
-- job_name: the panel's job-health object reads the NEWEST ledger row blind
-- (0026 §6); once the purge also writes rows (§H), an unfiltered read would
-- show purge bookkeeping as "the analytics job" for half an hour a day.
-- checks_below_watermark / rolled_checks_total: the OV-6 reconciliation pair.
-- The 5-minute lag shrinks but does not close the late-commit hole (a row
-- committing after its window was scanned, in a day never re-rolled, is
-- invisible forever) — and once the prune is armed, such a row is DELETED
-- unrolled, destroying the evidence. The pair makes the drift a number on a
-- screen someone opens, while rebuild can still heal it. Post-arming the pair
-- legitimately diverges by the cumulative pruned count; the drift signal is
-- its MOVEMENT between runs, not its absolute value.
alter table analytics_job_runs add column job_name text not null default 'analytics';
alter table analytics_job_runs add column purge_unrolled_destroyed integer;
alter table analytics_job_runs add column checks_below_watermark bigint;
alter table analytics_job_runs add column rolled_checks_total bigint;

-- -----------------------------------------------------------------------------
-- E. The single-sourced boundary (II.2.5)
-- -----------------------------------------------------------------------------
-- The one definition of "rolled through when?" for the two NEW readers (the
-- roll's window start, analytics v2's rolled-vs-raw split). ORDER BY id, not
-- ran_at: now() is transaction-constant, so same-transaction rows tie on
-- ran_at and the tiebreak must be deterministic (the 0034 §D lesson, again).
-- prune_section_checks (0035) keeps its own byte-identical read on purpose —
-- re-plumbing a live-verified function for DRY is churn without a defect
-- (II.1.4); verify-0035 §A pins its copy.
create function analytics_rolled_boundary()
returns timestamptz
language sql
stable
as $$
  select rolled_through from analytics_job_runs
   where rolled_through is not null
   order by id desc limit 1
$$;

-- -----------------------------------------------------------------------------
-- F. The day-recompute core + rebuild (II.2.4/II.2.6; D5-II; R7 bounded)
-- -----------------------------------------------------------------------------
-- ONE implementation of "recompute these versions' days from raw", used by the
-- roll, the self-heal, and the rebuild — R7's rebuild ≡ incremental property
-- is structural, not aspirational. Delete-then-insert per (version, day):
-- idempotent by construction (0026's write_version_census precedent).
--
-- p_versions NULL means "every version with any check in scope" — the REBUILD
-- entry point's semantics. ⚠ CALLERS MUST NOT PASS A BARE array_agg: it
-- returns NULL for an empty set, so a quiet night (no checks in the window)
-- would silently mean "recompute everything". Both call sites in §G guard on
-- `is not null` and skip instead; verify-0036 §R2 is what caught this (the
-- accidental full recompute was healing a drift the test needed to observe).
-- p_floor bounds the days recomputed (the D5-II clamp — callers pass the
-- horizon floor or, for a deep rebuild, their explicit choice). p_bound is
-- the exclusive upper cut (the watermark: rows at/after it roll next run).
create function recompute_check_rollup_days(
  p_versions uuid[],
  p_floor    date,
  p_bound    timestamptz
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
   where not exists (select 1 from pg_timezone_names where name = z.zone);

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

-- The rebuild entry point (R7, bounded by D5-II). No-arg: horizon-clamped —
-- it can NEVER reach a day the armed prune may have hollowed out; frozen
-- history stays byte-identical (verify-0036 §P2). Explicit p_from deeper than
-- the safe floor is honored — the pre-arming full rebuild, the author's
-- explicit call — but the result carries the warning naming what a post-
-- arming deep rebuild would do (collapse *_all toward latest). Batch note:
-- one transaction; at real scale the arming checklist re-checks this (same
-- discipline as the prune's array-collection note).
create function rebuild_check_rollup(p_from date default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  c_prune_horizon constant interval := interval '30 days';   -- 0035's constant
  v_safe_floor date := ((now() - c_prune_horizon) at time zone 'UTC')::date;
  v_floor date;
  v_bound timestamptz := coalesce(analytics_rolled_boundary(), now() - interval '5 minutes');
  v_days bigint;
  v_res jsonb;
begin
  v_floor := coalesce(p_from, v_safe_floor);
  v_days := recompute_check_rollup_days(null, v_floor, v_bound);
  v_res := jsonb_build_object('days_recomputed', v_days,
                              'from_used', v_floor, 'bound_used', v_bound);
  if v_floor < v_safe_floor then
    v_res := v_res || jsonb_build_object('warning',
      'rebuild reached below the prune horizon: if the prune has ever run armed, '
      || 'pruned days recompute from surviving rows only and *_all collapses toward '
      || 'latest — safe only while raw history is complete');
  end if;
  return v_res;
end;
$$;

-- -----------------------------------------------------------------------------
-- G. run_analytics_maintenance v2 — sweep → self-heal → roll → stamp (II.2.4)
-- -----------------------------------------------------------------------------
-- The sweep half is 0026's, byte-preserved. Then, in order:
--   self-heal (D2-II): for each flagged owner, re-day their activities'
--     in-horizon days under the CURRENT zone, then compare-and-clear — the
--     flag clears only if the zone still equals the one just rebuilt under
--     (OV-3: a zone change committing mid-rebuild keeps its flag and heals
--     next night rather than being silently swallowed).
--   roll: window [coalesce(boundary, -infinity), now()-5min) — the first run
--     IS the backfill (OV-9a). Days touched by the window recompute in FULL
--     (finding 6), horizon-clamped like every recompute (D5-II).
--   stamp: the ledger row carries rolled_through = the new watermark plus the
--     OV-6 reconciliation pair. Return the row id (pg_cron records it).
create or replace function run_analytics_maintenance()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  c_prune_horizon constant interval := interval '30 days';
  v_safe_floor date := ((now() - c_prune_horizon) at time zone 'UTC')::date;
  v_current_rev  text;
  v_deleted      integer := 0;
  v_checks       bigint;
  v_versions     bigint;
  v_run_id       bigint;
  v_old_wm       timestamptz := analytics_rolled_boundary();
  v_new_wm       timestamptz := now() - interval '5 minutes';
  v_heal record;
  v_healed       integer := 0;
  v_below        bigint;
  v_rolled_total bigint;
  -- NOT `v_versions` — 0026 already uses that name for the census count in
  -- this same function, and shadowing it is a compile error.
  v_scope_versions uuid[];
begin
  -- (a) The read-cache sweep, unchanged from 0026.
  select sanitizer_rev into v_current_rev
  from activity_version_reads
  order by created_at desc
  limit 1;
  if v_current_rev is not null then
    delete from activity_version_reads
    where sanitizer_rev is distinct from v_current_rev;
    get diagnostics v_deleted = row_count;
  end if;

  -- (b) The zone-change self-heal (D2-II), horizon-clamped (D5-II).
  for v_heal in
    select u.id, coalesce(u.timezone, analytics_default_zone()) as zone
      from users u where u.rollup_rebuild_needed
  loop
    select array_agg(distinct sc.activity_version_id) into v_scope_versions
      from section_checks sc
      join activities a on a.id = sc.activity_id
     where a.owner_id = v_heal.id;
    -- NULL here would mean "all versions" (see §F's header): an owner with no
    -- checks at all must re-day NOTHING, not everything.
    if v_scope_versions is not null then
      perform recompute_check_rollup_days(v_scope_versions, v_safe_floor, v_new_wm);
    end if;
    update users set rollup_rebuild_needed = false
     where id = v_heal.id
       and coalesce(timezone, analytics_default_zone()) is not distinct from v_heal.zone;
    v_healed := v_healed + 1;
  end loop;

  -- (c) The roll. Same NULL guard: a quiet night rolls nothing rather than
  -- recomputing every version in the database.
  select array_agg(distinct activity_version_id) into v_scope_versions
    from section_checks
   where created_at >= coalesce(v_old_wm, '-infinity'::timestamptz)
     and created_at < v_new_wm;
  if v_scope_versions is not null then
    perform recompute_check_rollup_days(v_scope_versions, v_safe_floor, v_new_wm);
  end if;

  -- (d) The ledger row: growth numbers, the watermark, the reconciliation pair.
  select count(*) into v_checks from section_checks;
  select count(distinct version_id) into v_versions from activity_version_census;
  select count(*) into v_below from section_checks where created_at < v_new_wm;
  select coalesce(sum(checks), 0) into v_rolled_total from check_rollup_daily;

  insert into analytics_job_runs (
    job_name, stale_cache_rows_deleted, section_check_rows, census_versions,
    rolled_through, checks_below_watermark, rolled_checks_total, notes
  )
  values (
    'analytics', v_deleted, v_checks, v_versions,
    v_new_wm, v_below, v_rolled_total,
    case when v_current_rev is null
      then 'no cached reads yet; sweep skipped'
      else 'current sanitizer_rev=' || v_current_rev
    end || case when v_healed > 0
      then format('; self-healed %s owner(s)', v_healed) else '' end
  )
  returning id into v_run_id;

  return v_run_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- H. purge_soft_deleted v4 — the ledger row (finding 4; F3 unchanged)
-- -----------------------------------------------------------------------------
-- 0034 §G byte-preserved (the NOTICE prefix included — verify-0029 §D greps
-- it) plus exactly two additions: the pre-delete count of UNROLLED rows being
-- destroyed (created_at at/after the watermark — rows the rollup never
-- recorded; with a NULL watermark, every destroyed row counts), and a
-- job_name='purge' ledger row carrying it durably. rolled_through stays NULL
-- on purge rows — the boundary readers and the prune's own watermark read all
-- filter on non-null, so purge bookkeeping can never masquerade as analytics
-- state. F3 stands: NOTHING here blocks on analytics; retention always wins.
create or replace function purge_soft_deleted()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_checks_activity int;
  v_checks_student  int;
  v_accounts        int := 0;
  v_blocked         int := 0;
  v_uid             uuid;
  v_boundary        timestamptz := analytics_rolled_boundary();
  v_unrolled        int := 0;
begin
  -- Count the unrolled rows this run is about to destroy, BEFORE destroying
  -- them (finding 4 / OV-6): both delete predicates below, restricted to rows
  -- the rollup has not recorded.
  select count(*) into v_unrolled
    from section_checks sc
   where sc.created_at >= coalesce(v_boundary, '-infinity'::timestamptz)
     and (sc.activity_id in (select id from activities
                              where deleted_at < now() - interval '30 days')
       or sc.activity_version_id in (select av.id from activity_versions av
                                       join activities a on a.id = av.activity_id
                                      where a.deleted_at < now() - interval '30 days')
       or sc.student_id in (select id from users
                             where deleted_at < now() - interval '30 days'));

  -- 1. Section checks belonging to purge-eligible ACTIVITIES.
  --    MUST precede the activity_versions delete: activity_version_id is
  --    ON DELETE RESTRICT and would otherwise abort the entire run (0022).
  delete from section_checks
   where activity_id in (
           select id from activities
            where deleted_at < now() - interval '30 days'
         )
      or activity_version_id in (
           select av.id from activity_versions av
             join activities a on a.id = av.activity_id
            where a.deleted_at < now() - interval '30 days'
         );
  get diagnostics v_checks_activity = row_count;

  -- 2. Submissions linked to deleted assignments (frozen table, empty since
  --    0029; kept as-is — see 0029's "what deliberately survives").
  delete from submissions
    where assignment_id in (
      select id from assignments where deleted_at < now() - interval '30 days'
    );

  -- 3. Assignments themselves
  delete from assignments where deleted_at < now() - interval '30 days';

  -- 4. Activity versions of deleted activities
  delete from activity_versions
    where activity_id in (
      select id from activities where deleted_at < now() - interval '30 days'
    );

  -- 5. Activities themselves (check_rollup_daily / check_item_rollup_daily
  --    CASCADE from here — R1: the aggregates die with the activity).
  delete from activities where deleted_at < now() - interval '30 days';

  -- 6. Section checks belonging to explicitly-deleted accounts past their
  --    window. Explicit rather than riding the FK cascade, so destroying
  --    student work is a counted act (2026-08-04 finding).
  delete from section_checks sc
   where sc.student_id in (
     select u.id from users u
      where u.deleted_at < now() - interval '30 days'
   );
  get diagnostics v_checks_student = row_count;

  -- 7. Accounts. TWO independent ways in, then the 0023 precedence applies to
  --    both: eligible only once no work is retained and nothing else
  --    references the row.
  for v_uid in
    select u.id
      from users u
     where (u.deleted_at < now() - interval '30 days')
        or (
             u.role = 'student'
             and not exists (
               select 1
                 from class_members cm
                 join classes c on c.id = cm.class_id
                where cm.student_id = u.id
                  and cm.removed_at is null
                  and c.deleted_at is null
             )
             and coalesce(
                   (select max(greatest(cm.removed_at, c.deleted_at))
                      from class_members cm
                      join classes c on c.id = cm.class_id
                     where cm.student_id = u.id),
                   u.created_at
                 ) < now() - interval '400 days'
           )
     order by u.created_at
  loop
    -- 0034: the `grades` blocker is GONE with the table. check_grades does not
    -- replace it — graded_by is SET NULL, so a grader's purge anonymizes the
    -- grade instead of being blocked by it.
    if exists (select 1 from section_checks   x where x.student_id = v_uid)
    or exists (select 1 from activities       x where x.owner_id   = v_uid)
    or exists (select 1 from activity_versions x where x.created_by = v_uid)
    or exists (select 1 from assignments      x where x.teacher_id = v_uid)
    or exists (select 1 from classes          x where x.teacher_id = v_uid
                                                   or x.age_assertion_by = v_uid)
    or exists (select 1 from allowlist        x where x.added_by   = v_uid)
    or exists (select 1 from student_domain   x where x.added_by   = v_uid)
    then
      v_blocked := v_blocked + 1;
      continue;
    end if;

    -- Mark this actor's audit rows BEFORE the delete (0024): afterwards
    -- SET NULL has fired and actor_id no longer identifies them.
    update audit_log
       set metadata = coalesce(metadata, '{}'::jsonb)
                      || jsonb_build_object('actor_purged', true)
     where actor_id = v_uid;

    delete from auth.users where id = v_uid;
    v_accounts := v_accounts + 1;
  end loop;

  -- The durable half of finding 4: a job_name='purge' ledger row. The NOTICE
  -- below stays for the cron log; this row is what a screen can read.
  insert into analytics_job_runs (
    job_name, section_check_rows, purge_unrolled_destroyed, notes
  )
  values (
    'purge',
    (select count(*) from section_checks),
    v_unrolled,
    format('checks purged %s by activity, %s by student; accounts purged %s, blocked %s',
           v_checks_activity, v_checks_student, v_accounts, v_blocked)
  );

  raise notice
    'purge_soft_deleted: section_checks %+% (activity/student), accounts purged %, accounts blocked %',
    v_checks_activity, v_checks_student, v_accounts, v_blocked;
end;
$$;

-- -----------------------------------------------------------------------------
-- I. get_activity_analytics v2 — rolled + raw, latest-grounded (OV-2, D8, R2)
-- -----------------------------------------------------------------------------
-- The two readings, one boundary:
--   *_all    = the rolled tables (item grain, census_key resolved at READ time
--              via activity_version_items — a re-censused key re-attributes
--              with no rebuild, and an unmapped item surfaces as
--              '_unattributed', never silence: R2) PLUS raw rows at/after the
--              boundary. Counted once: the roll's window is < boundary, the
--              read's raw half is >= boundary, single-sourced from §E.
--   *_latest = live from surviving rows via section_checks_latest (0035's
--              view — F1: pruning never touches what this reads).
--   per-key students = LATEST-GROUNDED (D8, the R12 semantic change, made
--              once, at 0 rows): distinct students whose CURRENT attempt
--              carries the item. The panel's explainer sentence discloses it.
--   totals.checks = rolled daily sum + raw above boundary (OV-2: it keeps
--              meaning "checks performed" across the prune boundary forever —
--              and is check_rollup_daily's production reader).
--   job      = newest ANALYTICS row (job_name filter — II.1.2; id-desc
--              tiebreak — the 0034 transaction-constant-now() lesson).
create or replace function get_activity_analytics(p_activity_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_current_version uuid;
  v_boundary        timestamptz;
  v_result          jsonb;
begin
  if auth.uid() is null then
    raise exception 'Not authorized';
  end if;
  if not can_read_activity(p_activity_id) then
    raise exception 'Not available';
  end if;

  select current_version_id into v_current_version
  from activities where id = p_activity_id;
  v_boundary := coalesce(analytics_rolled_boundary(), '-infinity'::timestamptz);

  with raw_above as (
    select sc.id, sc.student_id, sc.activity_version_id, sc.verdicts, sc.created_at
    from section_checks sc
    where sc.activity_id = p_activity_id
      and sc.created_at >= v_boundary
  ),
  raw_exploded as (
    select r.activity_version_id, e.key as item_id, e.value->>'verdict' as verdict
    from raw_above r cross join lateral jsonb_each(r.verdicts) e
  ),
  all_stats as (
    -- The *_all flow: rolled + raw-above-boundary, keyed at read time (R2).
    select coalesce(i.census_key, '_unattributed') as census_key,
           sum(s.verdicts_all)  as verdicts_all,
           sum(s.correct_all)   as correct_all,
           sum(s.incorrect_all) as incorrect_all,
           sum(s.recorded_all)  as recorded_all
    from (
      select activity_version_id, item_id, verdicts_all, correct_all,
             incorrect_all, recorded_all
      from check_item_rollup_daily where activity_id = p_activity_id
      union all
      select activity_version_id, item_id,
             1, (verdict = 'correct')::int, (verdict = 'incorrect')::int,
             (verdict = 'recorded')::int
      from raw_exploded
    ) s
    left join activity_version_items i
      on i.version_id = s.activity_version_id and i.item_id = s.item_id
    group by 1
  ),
  latest_exploded as (
    select l.student_id, l.activity_version_id,
           e.key as item_id, e.value->>'verdict' as verdict
    from section_checks_latest l
    cross join lateral jsonb_each(l.verdicts) e
    where l.activity_id = p_activity_id
  ),
  latest_stats as (
    select coalesce(i.census_key, '_unattributed') as census_key,
           count(*)                                          as verdicts_latest,
           count(*) filter (where x.verdict = 'correct')     as correct_latest,
           count(*) filter (where x.verdict = 'incorrect')   as incorrect_latest,
           count(*) filter (where x.verdict = 'recorded')    as recorded_latest,
           count(distinct x.student_id)                      as students
    from latest_exploded x
    left join activity_version_items i
      on i.version_id = x.activity_version_id and i.item_id = x.item_id
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
    'censused',           exists (select 1 from structure),
    'keys',               coalesce(
      (
        select jsonb_agg(row_to_json(k) order by k.census_key)
        from (
          select coalesce(a.census_key, l.census_key, st.census_key) as census_key,
                 st.block_count,
                 coalesce(a.verdicts_all, 0)       as verdicts_all,
                 coalesce(a.correct_all, 0)        as correct_all,
                 coalesce(a.incorrect_all, 0)      as incorrect_all,
                 coalesce(a.recorded_all, 0)       as recorded_all,
                 coalesce(l.verdicts_latest, 0)    as verdicts_latest,
                 coalesce(l.correct_latest, 0)     as correct_latest,
                 coalesce(l.incorrect_latest, 0)   as incorrect_latest,
                 coalesce(l.recorded_latest, 0)    as recorded_latest,
                 coalesce(l.students, 0)           as students
          from all_stats a
          full outer join latest_stats l on l.census_key = a.census_key
          full outer join structure st
            on st.census_key = coalesce(a.census_key, l.census_key)
        ) k
      ),
      '[]'::jsonb
    ),
    'totals', (
      select jsonb_build_object(
        'checks',
          coalesce((select sum(checks) from check_rollup_daily
                     where activity_id = p_activity_id), 0)
          + (select count(*) from raw_above),
        'students',
          (select count(distinct student_id) from section_checks_latest
            where activity_id = p_activity_id),
        'last_check_at',
          (select max(created_at) from section_checks_latest
            where activity_id = p_activity_id)
      )
    ),
    'job', (
      select case when r.id is null then null else jsonb_build_object(
        'last_run_at',              r.ran_at,
        'stale_cache_rows_deleted', r.stale_cache_rows_deleted,
        'section_check_rows',       r.section_check_rows
      ) end
      from (select * from analytics_job_runs
             where job_name = 'analytics'
             order by ran_at desc, id desc limit 1) r
    )
  ) into v_result;

  return v_result;
end;
$$;

-- -----------------------------------------------------------------------------
-- J. Grants (0009: rollup machinery is never client-callable)
-- -----------------------------------------------------------------------------
revoke execute on function users_timezone_guard() from public, anon, authenticated;
revoke execute on function analytics_default_zone() from public, anon, authenticated;
revoke execute on function analytics_day(timestamptz, text) from public, anon, authenticated;
revoke execute on function analytics_rolled_boundary() from public, anon, authenticated;
revoke execute on function recompute_check_rollup_days(uuid[], date, timestamptz) from public, anon, authenticated;
revoke execute on function rebuild_check_rollup(date) from public, anon, authenticated;
grant execute on function analytics_rolled_boundary() to service_role;
grant execute on function rebuild_check_rollup(date) to service_role;
-- run_analytics_maintenance / purge_soft_deleted / get_activity_analytics:
-- CREATE OR REPLACE preserves their existing ACLs (0026/0022/0009) — the
-- teacher grant on get_activity_analytics survives; verify-0036 §A pins both.

-- =============================================================================
-- Verification — scripts/verify-0036.sql is the full pass (§A–§M), registered
-- in the runner in this same commit. Spot check:
--
-- -- The gate's character after this migration: the watermark now EXISTS
-- -- nightly, so the 0035 prune is held disarmed by schedule + dry-run only.
-- -- EXPECT: a timestamp within the last ~24h once the nightly has fired.
-- select analytics_rolled_boundary();
-- =============================================================================

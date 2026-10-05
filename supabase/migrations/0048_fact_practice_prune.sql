-- =============================================================================
-- 0048_fact_practice_prune.sql — the school year's end, and the prune of
--                                 number-facts timing data (DISARMED)
-- -----------------------------------------------------------------------------
-- docs/design/practice-blocks.md → "Roll-up and prune: as ruled" (RP-1–RP-8,
-- the author, 2026-10-06). The second function in this repo that deletes
-- student work. It inherits prune_section_checks's discipline (0035): dry-run
-- by default, service-role only, UNSCHEDULED. Arming it is a checklist in
-- TODOS.md with the author's explicit yes; nothing here schedules it.
--
--   §A  audit action fact_practice.prune
--   §B  classes.school_year_ends_on (RP-1, RP-2) and the probe's keep_until /
--       pruned_at (RP-1, RP-3, RP-6, RP-8)
--   §C  set_class_year_end — the teacher's one write
--   §D  open_fact_probe — refuses a class with no end date, or one that has
--       passed; copies keep_until onto the probe
--   §E  fact_probe_overview / fact_probe_results — carry the dates; a pruned
--       check returns NO student rows (otherwise every member would read
--       "did not start")
--   §F  prune_fact_practice(p_dry_run default true)
--   §G  grants
--
-- WHAT "THE SCHOOL YEAR" MEANS (E1, RP-1). Each class carries an explicit end
-- date, given by its teacher. A check COPIES it at open, plus 30 days of grace
-- (RP-3), as `keep_until` — like every other parameter fixed at open, so
-- moving the class's date later never extends a past year's data. No
-- inference from the calendar or a timezone (the eng review's advice).
--
-- THE BACKSTOP (RP-8). keep_until is never more than 400 days after the check
-- opened — the "school year plus a buffer" figure the dormant-student purge
-- already uses. Checks opened before this migration have no end date to copy,
-- so §B backfills them at exactly that backstop.
--
-- A SOFT-DELETED CLASS (RP-5). Its checks' practice data is removable 30 days
-- after the class was deleted, or at keep_until if that comes first. The
-- class_probes row and its snapshot stay with the class row (no class purge
-- exists).
--
-- NO ROLL-UP TABLE (RP-4). The ruled per-student per-fact summary has no
-- reader until the sprint (slice 2); it is designed there, with mastery. What
-- survives a prune is the check's class result (its snapshot: counts and a
-- median, no student identity — ER-18).
--
-- ⚠ CHANGES HOW LONG STUDENT DATA IS KEPT (once armed): data-map.md and
-- retention-policy.md move in this commit. No personal-data column is added:
-- an end date and two timestamps on a class's rows identify no one.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A. audit action
-- -----------------------------------------------------------------------------
alter type audit_action add value if not exists 'fact_practice.prune';

-- -----------------------------------------------------------------------------
-- B. the dates
-- -----------------------------------------------------------------------------
alter table classes add column school_year_ends_on date;

comment on column classes.school_year_ends_on is
  'The last day of this class''s school year, given by its teacher (0048, RP-1). '
  'Copied onto each number-facts check at open; never inferred.';

alter table class_probes
  add column keep_until date,
  add column pruned_at  timestamptz,
  -- Only a finalised check is pruned (§F finalises a due one first).
  add constraint class_probes_pruned_after_close check (pruned_at is null or closed_at is not null);

-- RP-8: checks opened before 0048 had no end date to copy.
update class_probes
   set keep_until = (opened_at at time zone 'UTC')::date + 400
 where keep_until is null;

alter table class_probes alter column keep_until set not null;

comment on column class_probes.keep_until is
  'Student practice data under this check is removable AFTER this date (0048): the class''s '
  'school-year end at open + 30 days (RP-3), never more than 400 days after opening (RP-8).';
comment on column class_probes.pruned_at is
  'When prune_fact_practice removed this check''s sessions and attempts (0048). The class '
  'result (snapshot) is kept; the teacher''s screen says what was removed and when.';

-- -----------------------------------------------------------------------------
-- C. set_class_year_end — today up to 400 days ahead (RP-8)
-- -----------------------------------------------------------------------------
-- Errors, by name: not_class_teacher, year_end_out_of_range.
create or replace function set_class_year_end(p_class_id uuid, p_ends_on date)
returns date
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or p_class_id is null or not is_class_teacher(p_class_id)
     or exists (select 1 from classes where id = p_class_id and deleted_at is not null) then
    raise exception 'not_class_teacher' using errcode = '42501';
  end if;
  if p_ends_on is null or p_ends_on < current_date or p_ends_on > current_date + 400 then
    raise exception 'year_end_out_of_range';
  end if;

  update classes
     set school_year_ends_on = p_ends_on, updated_at = now()
   where id = p_class_id;
  return p_ends_on;
end;
$$;

-- -----------------------------------------------------------------------------
-- D. open_fact_probe — 0047's body; the end date is required and copied
-- -----------------------------------------------------------------------------
-- New errors, by name: school_year_end_missing, school_year_ended.
create or replace function open_fact_probe(p_class_id uuid, p_year_level integer)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_rev      fact_scope_revision%rowtype;
  v_id       uuid := gen_random_uuid();
  v_due      uuid;
  v_families jsonb;
  v_items    jsonb;
  v_count    integer;
  v_floor    numeric;
  v_closes   timestamptz := now() + interval '7 days';
  v_ends_on  date;
  v_keep     date;
begin
  if auth.uid() is null or p_class_id is null or not is_class_teacher(p_class_id) then
    raise exception 'not_class_teacher' using errcode = '42501';
  end if;

  -- 0048 (RP-1, RP-2): no check opens without the class's school-year end.
  select school_year_ends_on into v_ends_on from classes where id = p_class_id;
  if v_ends_on is null then
    raise exception 'school_year_end_missing';
  end if;
  if v_ends_on < current_date then
    raise exception 'school_year_ended';
  end if;
  v_keep := least(v_ends_on + 30, current_date + 400);

  -- S-3: the most recently mirrored revision.
  select * into v_rev from fact_scope_revision
  order by mirrored_at desc, registry_rev desc, fact_grammar_rev desc
  limit 1;
  if v_rev.registry_rev is null then
    raise exception 'fact_scope_not_mirrored';
  end if;
  if p_year_level is null or p_year_level not between 7 and 10
     or not (v_rev.year_scope ? p_year_level::text) then
    raise exception 'year_not_available';
  end if;

  -- A probe past its closes_at is finalised first (ER-9).
  for v_due in
    select id from class_probes
     where class_id = p_class_id and closed_at is null and closes_at <= now()
  loop
    perform finalise_fact_probe(v_due, true);
  end loop;
  if exists (select 1 from class_probes where class_id = p_class_id and closed_at is null) then
    raise exception 'probe_already_open';
  end if;

  select jsonb_agg(
           jsonb_build_object(
             'family_id',   f.family_id,
             'name',        f.name,
             'ord',         f.ord,
             'criterion_s', f.criterion_s,
             'n_items',     a.n_items,
             'part',        a.part,
             'min_items',   least(v_rev.min_items_per_family, f.fact_count))
           order by f.ord),
         v_rev.floor_factor_k * 60 * sum(a.n_items) / sum(a.n_items * f.criterion_s)
    into v_families, v_floor
  from fact_probe_allocate(v_rev.registry_rev, v_rev.fact_grammar_rev, p_year_level) a
  join fact_scope_family f
    on f.registry_rev = v_rev.registry_rev and f.fact_grammar_rev = v_rev.fact_grammar_rev
   and f.family_id = a.family_id
  where a.n_items > 0;

  with alloc as (
    select * from fact_probe_allocate(v_rev.registry_rev, v_rev.fact_grammar_rev, p_year_level)
  ),
  ranked as (
    select x.fact_id, x.family_id, x.answer, x.display, x.spoken,
           x.display_swapped, x.spoken_swapped, a.n_items, a.part,
           row_number() over (
             partition by x.family_id
             order by md5(v_id::text || ':' || x.fact_id), x.fact_id) as rk
    from fact_scope_fact x
    join alloc a on a.family_id = x.family_id
    where x.registry_rev = v_rev.registry_rev and x.fact_grammar_rev = v_rev.fact_grammar_rev
  ),
  picked as (
    select r.*,
           (r.display_swapped is not null
             and get_byte(decode(md5(v_id::text || ':o:' || r.fact_id), 'hex'), 0) % 2 = 1) as swapped
    from ranked r
    where r.rk <= r.n_items
  ),
  numbered as (
    select pk.*,
           -- Part 1's items all come before Part 2's; within a part the
           -- families are mixed by the second hash, as before.
           row_number() over (order by pk.part, md5(v_id::text || ':s:' || pk.fact_id), pk.fact_id) as n
    from picked pk
  )
  select jsonb_agg(
           jsonb_build_object(
             'n',         nb.n,
             'fact_id',   nb.fact_id,
             'family_id', nb.family_id,
             'part',      nb.part,
             'shown',     case when nb.swapped then 'swapped' else 'canonical' end,
             'display',   case when nb.swapped then nb.display_swapped else nb.display end,
             'spoken',    case when nb.swapped then nb.spoken_swapped else nb.spoken end,
             'answer',    nb.answer)
           order by nb.n),
         count(*)
    into v_items, v_count
  from numbered nb;

  if v_items is null or v_count = 0 then
    raise exception 'year_not_available';
  end if;

  begin
    insert into class_probes (
      id, class_id, opened_by, closes_at, year_level, registry_rev, fact_grammar_rev,
      floor_factor_k, ceiling_s, accuracy_threshold, facts_met_threshold,
      min_items_per_family, floor_per_min, min_students, min_attempts, min_counted_s,
      families, items, item_count, keep_until)
    values (
      v_id, p_class_id, auth.uid(), v_closes, p_year_level,
      v_rev.registry_rev, v_rev.fact_grammar_rev,
      v_rev.floor_factor_k, v_rev.response_ceiling_s, v_rev.accuracy_threshold,
      v_rev.facts_met_threshold, v_rev.min_items_per_family, v_floor,
      5, 10, 60,
      v_families, v_items, v_count, v_keep);
  exception when unique_violation then
    -- Two opens raced; the other one won.
    raise exception 'probe_already_open';
  end;

  insert into audit_log (actor_id, action, target_type, target_id, metadata)
  values (auth.uid(), 'fact_probe.open', 'class_probe', v_id,
          jsonb_build_object('class_id', p_class_id, 'year_level', p_year_level,
                             'registry_rev', v_rev.registry_rev, 'item_count', v_count,
                             'keep_until', v_keep));

  return jsonb_build_object(
    'probe_id', v_id, 'year_level', p_year_level, 'item_count', v_count,
    'parts', (select jsonb_agg(c order by part)
                from (select (i->>'part')::integer as part, count(*) as c
                        from jsonb_array_elements(v_items) i group by 1) x),
    'closes_at', v_closes, 'floor_per_min', round(v_floor, 2), 'keep_until', v_keep);
end;
$$;

-- -----------------------------------------------------------------------------
-- E. the teacher's two reads
-- -----------------------------------------------------------------------------
-- fact_probe_overview: 0047's body plus the class's end date and each
-- check's keep_until / pruned_at.
create or replace function fact_probe_overview(p_class_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_rev   fact_scope_revision%rowtype;
  v_due   uuid;
  v_years jsonb := '[]'::jsonb;
  v_code  text;
  v_ends  date;
begin
  if auth.uid() is null or p_class_id is null or not is_class_teacher(p_class_id) then
    raise exception 'not_class_teacher' using errcode = '42501';
  end if;

  for v_due in
    select id from class_probes
     where class_id = p_class_id and closed_at is null and closes_at <= now()
  loop
    perform finalise_fact_probe(v_due, true);
  end loop;

  select * into v_rev from fact_scope_revision
  order by mirrored_at desc, registry_rev desc, fact_grammar_rev desc
  limit 1;

  if v_rev.registry_rev is not null then
    select coalesce(jsonb_agg(
             jsonb_build_object(
               'year',        y.year,
               'description', v_rev.year_scope -> y.year::text ->> 'description',
               'adds', (select coalesce(jsonb_agg(f.name order by f.ord), '[]'::jsonb)
                          from fact_scope_family f
                         where f.registry_rev = v_rev.registry_rev
                           and f.fact_grammar_rev = v_rev.fact_grammar_rev
                           and (v_rev.year_scope -> y.year::text -> 'adds') ? f.family_id),
               'families', jsonb_array_length(v_rev.year_scope -> y.year::text -> 'cumulative'),
               'items', (select coalesce(sum(a.n_items), 0)
                           from fact_probe_allocate(v_rev.registry_rev, v_rev.fact_grammar_rev, y.year) a),
               -- Facts per part, in order: [40] for one part, [42, 40] for two.
               'parts', (select coalesce(jsonb_agg(x.c order by x.part), '[]'::jsonb)
                           from (select a.part, sum(a.n_items) as c
                                   from fact_probe_allocate(v_rev.registry_rev, v_rev.fact_grammar_rev, y.year) a
                                  group by a.part) x))
             order by y.year), '[]'::jsonb)
      into v_years
    from generate_series(7, 10) as y(year)
    where v_rev.year_scope ? y.year::text;
  end if;

  select join_code, school_year_ends_on into v_code, v_ends from classes where id = p_class_id;

  return jsonb_build_object(
    'join_code', v_code,
    'mirrored',  v_rev.registry_rev is not null,
    'school_year_ends_on', v_ends,
    'years',     v_years,
    'probes', (select coalesce(jsonb_agg(
                        jsonb_build_object(
                          'id',          p.id,
                          'year_level',  p.year_level,
                          'opened_at',   p.opened_at,
                          'closes_at',   p.closes_at,
                          'closed_at',   p.closed_at,
                          'auto_closed', p.auto_closed,
                          'state',       case when p.closed_at is null then 'open' else 'closed' end,
                          'item_count',  p.item_count,
                          'verdict',     p.snapshot->>'verdict',
                          'keep_until',  p.keep_until,
                          'pruned_at',   p.pruned_at)
                        order by p.opened_at desc), '[]'::jsonb)
                 from class_probes p where p.class_id = p_class_id));
end;
$$;

-- fact_probe_results: 0045's body plus keep_until / pruned_at. A PRUNED check
-- returns no student rows at all: fact_probe_stat lists every class member,
-- and with the attempts gone each one would read "did not start".
create or replace function fact_probe_results(p_probe_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_probe class_probes%rowtype;
  v_stat  jsonb;
  v_code  text;
begin
  select * into v_probe from class_probes where id = p_probe_id;
  if auth.uid() is null or v_probe.id is null or not is_class_teacher(v_probe.class_id) then
    raise exception 'not_class_teacher' using errcode = '42501';
  end if;

  if v_probe.closed_at is null and v_probe.closes_at <= now() then
    perform finalise_fact_probe(p_probe_id, true);
    select * into v_probe from class_probes where id = p_probe_id;
  end if;

  if v_probe.pruned_at is null then
    v_stat := fact_probe_stat(p_probe_id);
  end if;
  select join_code into v_code from classes where id = v_probe.class_id;

  return jsonb_build_object(
    'probe', jsonb_build_object(
      'id',          v_probe.id,
      'class_id',    v_probe.class_id,
      'join_code',   v_code,
      'year_level',  v_probe.year_level,
      'opened_at',   v_probe.opened_at,
      'closes_at',   v_probe.closes_at,
      'closed_at',   v_probe.closed_at,
      'auto_closed', v_probe.auto_closed,
      'state',       case when v_probe.closed_at is null then 'open' else 'closed' end,
      'item_count',  v_probe.item_count,
      'ceiling_s',   v_probe.ceiling_s,
      'families',    v_probe.families,
      'keep_until',  v_probe.keep_until,
      'pruned_at',   v_probe.pruned_at),
    'class',    coalesce(v_probe.snapshot, v_stat->'class'),
    'students', coalesce(v_stat->'students', '[]'::jsonb));
end;
$$;

-- -----------------------------------------------------------------------------
-- F. prune_fact_practice — DISARMED by default, unscheduled (RP-7)
-- -----------------------------------------------------------------------------
-- A CHECK is a candidate when ALL hold:
--   1. it is not already pruned;
--   2. it is finalised, or due to be (closes_at passed) — a check still open
--      for saves is never touched;
--   3. EITHER its keep_until has passed (RP-1, RP-3, RP-8) OR its class was
--      soft-deleted more than 30 days ago (RP-5).
-- Removal is BY CHECK: every session under a candidate goes, with its
-- attempts, in the same transaction, and the check is stamped pruned_at. A
-- check is never left half-pruned. The class_probes row and its snapshot stay
-- (ER-18). A due check is finalised FIRST, so its class result is written
-- from the data before the data goes.
--
-- COUNTED: the report says what was (or would be) removed, by reason; an armed
-- run writes one fact_practice.prune audit row per check with its counts.
-- Rows are locked FOR UPDATE, which waits out any save in flight (saves hold
-- FOR SHARE on the probe row — 0045's close/save rule).
--
-- p_dry_run => false is the ONLY deleting form. Nothing in this migration, and
-- nothing live, schedules it: arming is TODOS.md → "Number-facts prune:
-- the ARMING checklist", with the author's explicit yes.
create or replace function prune_fact_practice(p_dry_run boolean default true)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_probe     record;
  v_ids       uuid[];
  v_by_year   integer := 0;
  v_by_class  integer := 0;
  v_sessions  integer := 0;
  v_attempts  integer := 0;
  v_s         integer;
  v_a         integer;
begin
  select array_agg(p.id order by p.opened_at, p.id),
         count(*) filter (where p.keep_until < current_date),
         count(*) filter (where not (p.keep_until < current_date))
    into v_ids, v_by_year, v_by_class
    from class_probes p
    join classes c on c.id = p.class_id
   where p.pruned_at is null                                             -- 1
     and (p.closed_at is not null or p.closes_at <= now())               -- 2
     and (p.keep_until < current_date                                    -- 3
          or c.deleted_at < now() - interval '30 days');

  if v_ids is null then
    return jsonb_build_object('dry_run', p_dry_run, 'checks', 0, 'by_year_end', 0,
                              'by_class_deleted', 0, 'sessions', 0, 'attempts', 0);
  end if;

  if p_dry_run then
    select count(distinct s.id), count(a.seq)
      into v_sessions, v_attempts
      from practice_sessions s
      left join fact_attempts a on a.session_id = s.id
     where s.probe_id = any (v_ids);
    return jsonb_build_object('dry_run', true, 'checks', cardinality(v_ids),
                              'by_year_end', v_by_year, 'by_class_deleted', v_by_class,
                              'sessions', v_sessions, 'attempts', v_attempts);
  end if;

  for v_probe in
    select p.id, p.class_id, p.closed_at, p.keep_until
      from class_probes p where p.id = any (v_ids)
     order by p.opened_at, p.id
       for update
  loop
    if v_probe.closed_at is null then
      perform finalise_fact_probe(v_probe.id, true);
    end if;

    delete from fact_attempts a
     using practice_sessions s
     where a.session_id = s.id and s.probe_id = v_probe.id;
    get diagnostics v_a = row_count;
    delete from practice_sessions where probe_id = v_probe.id;
    get diagnostics v_s = row_count;

    update class_probes set pruned_at = now() where id = v_probe.id;

    insert into audit_log (actor_id, action, target_type, target_id, metadata)
    values (null, 'fact_practice.prune', 'class_probe', v_probe.id,
            jsonb_build_object('class_id', v_probe.class_id, 'keep_until', v_probe.keep_until,
                               'reason', case when v_probe.keep_until < current_date
                                              then 'year_end' else 'class_deleted' end,
                               'sessions', v_s, 'attempts', v_a));
    v_sessions := v_sessions + v_s;
    v_attempts := v_attempts + v_a;
  end loop;

  return jsonb_build_object('dry_run', false, 'checks', cardinality(v_ids),
                            'by_year_end', v_by_year, 'by_class_deleted', v_by_class,
                            'sessions', v_sessions, 'attempts', v_attempts);
end;
$$;

-- -----------------------------------------------------------------------------
-- G. grants
-- -----------------------------------------------------------------------------
-- 0009 stanza: a deletion primitive over student work is never client-callable.
revoke execute on function prune_fact_practice(boolean) from public, anon, authenticated;
grant  execute on function prune_fact_practice(boolean) to service_role;

revoke execute on function set_class_year_end(uuid, date) from public, anon;
grant  execute on function set_class_year_end(uuid, date) to authenticated, service_role;

-- Re-created client RPCs keep their stanzas; re-stated regardless.
revoke execute on function open_fact_probe(uuid, integer) from public, anon;
grant  execute on function open_fact_probe(uuid, integer) to authenticated, service_role;
revoke execute on function fact_probe_overview(uuid)      from public, anon;
grant  execute on function fact_probe_overview(uuid)      to authenticated, service_role;
revoke execute on function fact_probe_results(uuid)       from public, anon;
grant  execute on function fact_probe_results(uuid)       to authenticated, service_role;

-- =============================================================================
-- Verification lives in scripts/verify-0048.sql (registered in the verify
-- runner): the columns and the backfill, the grants, NO cron job naming the
-- prune, the end date's refusals, keep_until at open (grace and backstop), and
-- the prune's matrix at production values — dry-run deletes nothing, an open
-- check is never touched, a past keep_until and a class deleted 31 days ago
-- are candidates while 29 days is not, an armed run removes exactly the
-- candidate checks' sessions and attempts, keeps the snapshot, stamps
-- pruned_at, audits the counts, and a second run finds nothing.
--
-- Spot check after apply. EXPECT: {"dry_run": true, "checks": 0, ...} — the
-- live checks were backfilled to 400 days after they opened.
-- select prune_fact_practice();
-- =============================================================================

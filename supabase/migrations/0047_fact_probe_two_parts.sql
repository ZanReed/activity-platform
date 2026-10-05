-- =============================================================================
-- 0047_fact_probe_two_parts.sql — a long check runs in two parts
-- -----------------------------------------------------------------------------
-- The author's rulings of 2026-10-05 (practice-blocks.md → "A two-part check
-- for the long years"), recorded on the curriculum side in their D43
-- amendment of the same day (quote their log, not this):
--
--   - a check whose single-part length would exceed `two_part_above` facts is
--     split into TWO PARTS; each family is in the part whose family groups
--     contain it (related families sit together);
--   - in a two-part check every family gets min(`two_part_items_per_family`,
--     its fact count) items — more evidence per family label;
--   - it is ONE check, opened once, with one class verdict and one floor; the
--     student takes a break between the parts or does Part 2 another day.
--
--   §A  fact_scope_revision gains the two settings and the two lists
--   §B  sync_fact_scope stores and compares them
--   §C  fact_probe_family_parts / fact_probe_allocate_single / fact_probe_allocate
--   §D  open_fact_probe orders Part 1 before Part 2 and stamps each item's part
--   §E  fact_probe_entry and fact_probe_overview return the parts
--   §F  grants
--
-- WHAT DOES NOT CHANGE. A revision without the new settings (every revision
-- mirrored before this) opens single-part checks exactly as before, and a
-- check opened before this migration has no `part` on its items and reads as
-- one part. The "not judged" minimum stays min_items_per_family (or the fact
-- count if smaller) in a two-part check too. The floor is still computed from
-- the check's own items. No table of student data changes; no personal data.
--
-- THE MIRROR TABLES STAY INSERT-ONLY. §A adds NULLABLE columns (an ALTER, not
-- an UPDATE), so every stored revision keeps its rows untouched and reads as
-- "no two-part settings".
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A. the mirror's new columns
-- -----------------------------------------------------------------------------
alter table fact_scope_revision
  add column two_part_above integer check (two_part_above > 0),
  add column two_part_items_per_family integer check (two_part_items_per_family > 0),
  -- [{"id": "group.times-tables", "label": "Times tables", "families": [...]}, …]
  add column family_groups jsonb check (family_groups is null or jsonb_typeof(family_groups) = 'array'),
  -- [["group.…", …], ["group.…", …]] — exactly two parts
  add column probe_parts jsonb check (
    probe_parts is null or (jsonb_typeof(probe_parts) = 'array' and jsonb_array_length(probe_parts) = 2)),
  add constraint fact_scope_two_part_all_or_none check (
    (two_part_above is null) = (two_part_items_per_family is null)
    and (two_part_above is null) = (family_groups is null)
    and (two_part_above is null) = (probe_parts is null));

-- -----------------------------------------------------------------------------
-- B. sync_fact_scope — stores and compares the new fields
-- -----------------------------------------------------------------------------
-- ⚠ ORDER: this migration is applied BEFORE a two-part registry is mirrored.
-- 0044's function would have accepted one and silently dropped the settings.
-- Its results now carry `schema: 2`, and the importer refuses to mirror a
-- registry with two-part settings through a function that does not say so.
-- 0044's body with the four fields added to the insert and to the "is this
-- revision already mirrored with the same content?" comparison. A revision
-- without them compares as before (nulls on both sides).
create or replace function sync_fact_scope(p_mirror jsonb, p_apply boolean default false)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_rev      text;
  v_grammar  integer;
  v_families jsonb;
  v_facts    jsonb;
  v_head     jsonb;
  v_latest   jsonb;
  v_diff     bigint;
  v_status   text;
begin
  if p_mirror is null or jsonb_typeof(p_mirror) <> 'object'
     or jsonb_typeof(p_mirror->'families') is distinct from 'array'
     or jsonb_typeof(p_mirror->'facts') is distinct from 'array'
     or jsonb_typeof(p_mirror->'fact_probe') is distinct from 'object'
     or p_mirror->>'registry_rev' is null
     or p_mirror->>'fact_grammar_rev' is null then
    raise exception 'sync_fact_scope: malformed mirror';
  end if;

  v_rev      := p_mirror->>'registry_rev';
  v_grammar  := (p_mirror->>'fact_grammar_rev')::integer;
  v_families := p_mirror->'families';
  v_facts    := p_mirror->'facts';
  if jsonb_array_length(v_facts) > 50000 then
    raise exception 'sync_fact_scope: % facts exceeds the 50000-fact cap', jsonb_array_length(v_facts);
  end if;

  -- One mirror at a time: two concurrent first mirrors of one revision would
  -- otherwise race to the primary key.
  perform pg_advisory_xact_lock(hashtext('sync_fact_scope'));

  select jsonb_build_object('registry_rev', registry_rev,
                            'fact_grammar_rev', fact_grammar_rev,
                            'graph_version', graph_version,
                            'mirrored_at', mirrored_at)
    into v_latest
  from fact_scope_revision
  order by mirrored_at desc
  limit 1;

  if exists (select 1 from fact_scope_revision
              where registry_rev = v_rev and fact_grammar_rev = v_grammar) then
    -- Compare EVERY stored field except graph_version and mirrored_at.
    select jsonb_build_object(
             'fact_probe', jsonb_strip_nulls(jsonb_build_object(
               'floor_factor_k', floor_factor_k,
               'accuracy_threshold', accuracy_threshold,
               'facts_met_threshold', facts_met_threshold,
               'response_ceiling_s', response_ceiling_s,
               'min_items_per_family', min_items_per_family,
               'practice_window', practice_window,
               'two_part_above', two_part_above,
               'two_part_items_per_family', two_part_items_per_family)),
             'year_scope', year_scope,
             'fraction_names', fraction_names,
             'family_groups', coalesce(family_groups, 'null'::jsonb),
             'probe_parts', coalesce(probe_parts, 'null'::jsonb))
      into v_head
    from fact_scope_revision
    where registry_rev = v_rev and fact_grammar_rev = v_grammar;

    with incoming_f as (
      select f from jsonb_array_elements(v_families) f
    ), stored_f as (
      select jsonb_build_object(
               'family_id', family_id, 'ord', ord, 'kind', kind, 'name', name,
               'source_year', source_year, 'operation', operation,
               'criterion_s', criterion_s, 'turnaround', turnaround,
               'weight', weight, 'fact_count', fact_count, 'strategy', strategy) f
      from fact_scope_family
      where registry_rev = v_rev and fact_grammar_rev = v_grammar
    ), incoming_x as (
      select x from jsonb_array_elements(v_facts) x
    ), stored_x as (
      select jsonb_build_object(
               'fact_id', fact_id, 'family_id', family_id, 'ord', ord,
               'operands', to_jsonb(operands), 'answer', answer,
               'display', display, 'spoken', spoken,
               'display_swapped', display_swapped,
               'spoken_swapped', spoken_swapped) x
      from fact_scope_fact
      where registry_rev = v_rev and fact_grammar_rev = v_grammar
    )
    select (select count(*) from (select f from incoming_f except select f from stored_f) a)
         + (select count(*) from (select f from stored_f except select f from incoming_f) b)
         + abs((select count(*) from incoming_f) - (select count(*) from stored_f))
         + (select count(*) from (select x from incoming_x except select x from stored_x) c)
         + (select count(*) from (select x from stored_x except select x from incoming_x) d)
         + abs((select count(*) from incoming_x) - (select count(*) from stored_x))
      into v_diff;

    if v_diff > 0 or v_head is distinct from jsonb_build_object(
         'fact_probe', jsonb_strip_nulls(p_mirror->'fact_probe'),
         'year_scope', p_mirror->'year_scope',
         'fraction_names', p_mirror->'fraction_names',
         'family_groups', coalesce(p_mirror->'family_groups', 'null'::jsonb),
         'probe_parts', coalesce(p_mirror->'probe_parts', 'null'::jsonb)) then
      raise exception
        'sync_fact_scope: revision % (fact grammar %) is already mirrored with DIFFERENT content — the expander changed without a FACT_GRAMMAR_REV bump',
        left(v_rev, 8), v_grammar;
    end if;

    return jsonb_build_object(
      'status', 'unchanged', 'applied', false,
      'families', jsonb_array_length(v_families),
      'facts', jsonb_array_length(v_facts),
      'latest_before', v_latest,
      -- 2 = this function stores the two-part settings (0047). The importer
      -- refuses to mirror a two-part registry through a function without it.
      'schema', 2);
  end if;

  begin
    insert into fact_scope_revision (
      registry_rev, fact_grammar_rev, graph_version,
      floor_factor_k, accuracy_threshold, facts_met_threshold, response_ceiling_s,
      min_items_per_family, practice_window, year_scope, fraction_names,
      family_count, fact_count,
      two_part_above, two_part_items_per_family, family_groups, probe_parts)
    values (
      v_rev, v_grammar, p_mirror->>'graph_version',
      (p_mirror->'fact_probe'->>'floor_factor_k')::numeric,
      (p_mirror->'fact_probe'->>'accuracy_threshold')::numeric,
      (p_mirror->'fact_probe'->>'facts_met_threshold')::numeric,
      (p_mirror->'fact_probe'->>'response_ceiling_s')::numeric,
      (p_mirror->'fact_probe'->>'min_items_per_family')::integer,
      (p_mirror->'fact_probe'->>'practice_window')::integer,
      p_mirror->'year_scope', p_mirror->'fraction_names',
      jsonb_array_length(v_families), jsonb_array_length(v_facts),
      (p_mirror->'fact_probe'->>'two_part_above')::integer,
      (p_mirror->'fact_probe'->>'two_part_items_per_family')::integer,
      nullif(p_mirror->'family_groups', 'null'::jsonb),
      nullif(p_mirror->'probe_parts', 'null'::jsonb));

    insert into fact_scope_family (
      registry_rev, fact_grammar_rev, family_id, ord, kind, name, source_year,
      operation, criterion_s, turnaround, weight, fact_count, strategy)
    select v_rev, v_grammar, f.family_id, f.ord, f.kind, f.name, f.source_year,
           f.operation, f.criterion_s, f.turnaround, f.weight, f.fact_count, f.strategy
    from jsonb_to_recordset(v_families) as f(
      family_id text, ord integer, kind text, name text, source_year integer,
      operation text, criterion_s numeric, turnaround boolean, weight numeric,
      fact_count integer, strategy jsonb);

    insert into fact_scope_fact (
      registry_rev, fact_grammar_rev, fact_id, family_id, ord, operands, answer,
      display, spoken, display_swapped, spoken_swapped)
    select v_rev, v_grammar, x.fact_id, x.family_id, x.ord, x.operands, x.answer,
           x.display, x.spoken, x.display_swapped, x.spoken_swapped
    from jsonb_to_recordset(v_facts) as x(
      fact_id text, family_id text, ord integer, operands integer[], answer text,
      display text, spoken text, display_swapped text, spoken_swapped text);

    -- A family's fact_count is a cross-side guard (their item 31, CR-23):
    -- the expander checked it, and the database checks it again here.
    if exists (
      select 1 from fact_scope_family fam
      where fam.registry_rev = v_rev and fam.fact_grammar_rev = v_grammar
        and fam.fact_count <> (select count(*) from fact_scope_fact x
                                where x.registry_rev = v_rev and x.fact_grammar_rev = v_grammar
                                  and x.family_id = fam.family_id)) then
      raise exception 'sync_fact_scope: a family''s fact_count does not match its facts';
    end if;

    if not p_apply then
      raise exception using errcode = 'P0001', message = '__sync_fact_scope_dry_run__';
    end if;
    v_status := 'mirrored';
  exception when raise_exception then
    if sqlerrm <> '__sync_fact_scope_dry_run__' then raise; end if;
    v_status := 'new';
  end;

  return jsonb_build_object(
    'status', v_status, 'applied', p_apply,
    'families', jsonb_array_length(v_families),
    'facts', jsonb_array_length(v_facts),
    'latest_before', v_latest,
      -- 2 = this function stores the two-part settings (0047). The importer
      -- refuses to mirror a two-part registry through a function without it.
      'schema', 2);
end;
$$;

-- -----------------------------------------------------------------------------
-- C. the allocation
-- -----------------------------------------------------------------------------
-- fact_probe_allocate_single is 0045's fact_probe_allocate, renamed and
-- otherwise unchanged (their items 20, 22). fact_probe_allocate now adds the
-- PART and, for a two-part check, the per-family count.
drop function fact_probe_allocate(text, integer, integer);

create or replace function fact_probe_allocate_single(p_rev text, p_grammar integer, p_year integer)
returns table (family_id text, n_items integer)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_ids     text[];
  v_w       numeric[];
  v_cap     integer[];
  v_min     integer[];
  v_n       integer[];
  v_frac    numeric[];
  v_capped  boolean[];
  v_count   integer;
  v_minimum integer;
  v_len     integer;
  v_rest    numeric;
  v_wsum    numeric;
  v_changed boolean;
  v_total   integer := 0;
  v_left    integer;
  v_best    integer;
  i         integer;
  j         integer;
begin
  select array_agg(f.family_id order by f.ord),
         array_agg(f.weight order by f.ord),
         array_agg(f.fact_count order by f.ord),
         max(r.min_items_per_family)
    into v_ids, v_w, v_cap, v_minimum
  from fact_scope_revision r
  join fact_scope_family f
    on f.registry_rev = r.registry_rev and f.fact_grammar_rev = r.fact_grammar_rev
  where r.registry_rev = p_rev and r.fact_grammar_rev = p_grammar
    and (r.year_scope -> p_year::text -> 'cumulative') ? f.family_id;

  v_count := coalesce(array_length(v_ids, 1), 0);
  if v_count = 0 then return; end if;

  -- Never ask for more items than there are facts.
  v_len := least(greatest(30, v_minimum * v_count),
                 (select sum(c)::integer from unnest(v_cap) c));

  for i in 1..v_count loop
    v_n[i] := 0;
    v_frac[i] := -1;
    v_capped[i] := false;
    v_min[i] := least(v_minimum, v_cap[i]);
  end loop;

  -- Cap every family whose share would exceed its facts, and re-share.
  loop
    v_changed := false;
    v_rest := v_len;
    v_wsum := 0;
    for i in 1..v_count loop
      if v_capped[i] then v_rest := v_rest - v_cap[i]; else v_wsum := v_wsum + v_w[i]; end if;
    end loop;
    exit when v_wsum = 0;
    for i in 1..v_count loop
      if not v_capped[i] and v_rest * v_w[i] / v_wsum > v_cap[i] then
        v_capped[i] := true;
        v_changed := true;
      end if;
    end loop;
    exit when not v_changed;
  end loop;

  -- Whole parts, then the largest remainders.
  for i in 1..v_count loop
    if v_capped[i] then
      v_n[i] := v_cap[i];
    else
      v_n[i] := floor(v_rest * v_w[i] / v_wsum);
      v_frac[i] := v_rest * v_w[i] / v_wsum - v_n[i];
    end if;
    v_total := v_total + v_n[i];
  end loop;
  v_left := v_len - v_total;
  while v_left > 0 loop
    v_best := null;
    for i in 1..v_count loop
      if not v_capped[i] and v_n[i] < v_cap[i]
         and (v_best is null or v_frac[i] > v_frac[v_best]) then
        v_best := i;
      end if;
    end loop;
    exit when v_best is null;
    v_n[v_best] := v_n[v_best] + 1;
    v_frac[v_best] := -1;
    v_left := v_left - 1;
  end loop;

  -- The per-family minimum, taken from whoever is furthest above theirs.
  for i in 1..v_count loop
    while v_n[i] < v_min[i] loop
      v_best := null;
      for j in 1..v_count loop
        if j <> i and v_n[j] > v_min[j]
           and (v_best is null or v_n[j] - v_min[j] >= v_n[v_best] - v_min[v_best]) then
          v_best := j;
        end if;
      end loop;
      exit when v_best is null;
      v_n[v_best] := v_n[v_best] - 1;
      v_n[i] := v_n[i] + 1;
    end loop;
  end loop;

  return query select v_ids[g], v_n[g] from generate_subscripts(v_ids, 1) g;
end;
$$;

create or replace function fact_probe_family_parts(p_rev text, p_grammar integer)
returns table (family_id text, part integer)
language sql
stable
security definer
set search_path = public
as $$
  -- probe_parts is [[group id, …], [group id, …]]; family_groups is
  -- [{id, label, families: [family id, …]}, …]. A family's part is the part
  -- whose groups contain it.
  select fam.value #>> '{}', p.ord::integer
    from fact_scope_revision r
    cross join lateral jsonb_array_elements(r.probe_parts) with ordinality as p(groups, ord)
    cross join lateral jsonb_array_elements_text(p.groups) as gid(id)
    join lateral jsonb_array_elements(r.family_groups) as g(obj) on g.obj->>'id' = gid.id
    cross join lateral jsonb_array_elements(g.obj->'families') as fam(value)
   where r.registry_rev = p_rev and r.fact_grammar_rev = p_grammar
     and r.probe_parts is not null and r.family_groups is not null;
$$;

create or replace function fact_probe_allocate(p_rev text, p_grammar integer, p_year integer)
returns table (family_id text, n_items integer, part integer)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_rev    fact_scope_revision%rowtype;
  v_single integer;
  v_two    boolean := false;
begin
  select * into v_rev from fact_scope_revision
   where registry_rev = p_rev and fact_grammar_rev = p_grammar;
  if v_rev.registry_rev is null then return; end if;

  select coalesce(sum(a.n_items), 0) into v_single
    from fact_probe_allocate_single(p_rev, p_grammar, p_year) a;

  -- Two parts only when the revision defines them, the single-part length is
  -- over the threshold, and BOTH parts have a family in this year's scope.
  if v_rev.two_part_above is not null and v_rev.two_part_items_per_family is not null
     and v_rev.family_groups is not null and v_rev.probe_parts is not null
     and v_single > v_rev.two_part_above then
    select count(distinct pf.part) = 2 into v_two
      from fact_probe_family_parts(p_rev, p_grammar) pf
      join fact_probe_allocate_single(p_rev, p_grammar, p_year) a on a.family_id = pf.family_id;
  end if;

  if not coalesce(v_two, false) then
    return query
      select a.family_id, a.n_items, 1
        from fact_probe_allocate_single(p_rev, p_grammar, p_year) a;
    return;
  end if;

  return query
    select f.family_id,
           least(v_rev.two_part_items_per_family, f.fact_count),
           pf.part
      from fact_probe_allocate_single(p_rev, p_grammar, p_year) a
      join fact_scope_family f
        on f.registry_rev = p_rev and f.fact_grammar_rev = p_grammar and f.family_id = a.family_id
      join fact_probe_family_parts(p_rev, p_grammar) pf on pf.family_id = a.family_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- D. open_fact_probe — Part 1 before Part 2; each item carries its part
-- -----------------------------------------------------------------------------
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
begin
  if auth.uid() is null or p_class_id is null or not is_class_teacher(p_class_id) then
    raise exception 'not_class_teacher' using errcode = '42501';
  end if;

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
      families, items, item_count)
    values (
      v_id, p_class_id, auth.uid(), v_closes, p_year_level,
      v_rev.registry_rev, v_rev.fact_grammar_rev,
      v_rev.floor_factor_k, v_rev.response_ceiling_s, v_rev.accuracy_threshold,
      v_rev.facts_met_threshold, v_rev.min_items_per_family, v_floor,
      5, 10, 60,
      v_families, v_items, v_count);
  exception when unique_violation then
    -- Two opens raced; the other one won.
    raise exception 'probe_already_open';
  end;

  insert into audit_log (actor_id, action, target_type, target_id, metadata)
  values (auth.uid(), 'fact_probe.open', 'class_probe', v_id,
          jsonb_build_object('class_id', p_class_id, 'year_level', p_year_level,
                             'registry_rev', v_rev.registry_rev, 'item_count', v_count));

  return jsonb_build_object(
    'probe_id', v_id, 'year_level', p_year_level, 'item_count', v_count,
    'parts', (select jsonb_agg(c order by part)
                from (select (i->>'part')::integer as part, count(*) as c
                        from jsonb_array_elements(v_items) i group by 1) x),
    'closes_at', v_closes, 'floor_per_min', round(v_floor, 2));
end;
$$;

-- -----------------------------------------------------------------------------
-- E. the student entry and the teacher overview return the parts
-- -----------------------------------------------------------------------------
create or replace function fact_probe_entry(p_code text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid     uuid := auth.uid();
  v_user    users%rowtype;
  v_class   classes%rowtype;
  v_probe   class_probes%rowtype;
  v_session practice_sessions%rowtype;
  v_open    boolean;
  v_saved   integer := 0;
  v_next    integer := 1;
  v_counts  jsonb := jsonb_build_object('right', 0, 'skipped', 0, 'not_counted', 0);
  v_done    boolean;
begin
  if v_uid is null then
    raise exception 'not_signed_in' using errcode = '42501';
  end if;
  select * into v_user from users where id = v_uid;
  if v_user.id is null or v_user.deleted_at is not null then
    raise exception 'This account is disabled' using errcode = '42501';
  end if;
  if v_user.role in ('teacher', 'admin') then
    return jsonb_build_object('state', 'teacher');
  end if;

  select * into v_class from classes
   where join_code = upper(trim(coalesce(p_code, ''))) and deleted_at is null;
  if v_class.id is null or not exists (
       select 1 from class_members m
        where m.class_id = v_class.id and m.student_id = v_uid and m.removed_at is null) then
    return jsonb_build_object('state', 'not_member');
  end if;

  select * into v_probe from class_probes
   where class_id = v_class.id
   order by opened_at desc, id
   limit 1;
  if v_probe.id is null then
    return jsonb_build_object('state', 'none_open');
  end if;
  v_open := v_probe.closed_at is null and v_probe.closes_at > now();

  select * into v_session from practice_sessions
   where probe_id = v_probe.id and student_id = v_uid;
  if not v_open and v_session.id is null then
    return jsonb_build_object('state', 'none_open');
  end if;

  if v_session.id is not null then
    select count(*), coalesce(max(seq), 0) + 1 into v_saved, v_next
      from fact_attempts where session_id = v_session.id;
    select jsonb_build_object(
             'right',       count(*) filter (where j.judgment in ('met', 'slow', 'unjudged')),
             'skipped',     count(*) filter (where j.judgment = 'skipped'),
             'not_counted', count(*) filter (where j.judgment = 'interrupted'))
      into v_counts
      from fact_probe_judged(v_probe.id) j
     where j.session_id = v_session.id;
  end if;
  v_done := v_session.finished_at is not null or v_saved >= v_probe.item_count;

  if v_done or not v_open then
    return jsonb_build_object(
      'state', case when v_done then 'finished' else 'closed' end,
      'saved', v_saved, 'total', v_probe.item_count, 'counts', v_counts);
  end if;

  return jsonb_build_object(
    'state',     case when v_saved > 0 then 'resume' else 'ready' end,
    'probe_id',  v_probe.id,
    'total',     v_probe.item_count,
    'ceiling_s', v_probe.ceiling_s,
    'saved',     v_saved,
    'next_n',    v_next,
    'counts',    v_counts,
    'baselines', jsonb_build_object('keyboard', v_session.baseline_keyboard_ms,
                                    'keypad',   v_session.baseline_keypad_ms),
    'items', (select jsonb_agg(
                       jsonb_build_object('n', (i->>'n')::integer, 'display', i->>'display',
                                          'spoken', i->>'spoken', 'answer', i->>'answer',
                                          -- 1 for a probe opened before 0047
                                          'part', coalesce((i->>'part')::integer, 1))
                       order by (i->>'n')::integer)
                from jsonb_array_elements(v_probe.items) i));
end;
$$;

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

  select join_code into v_code from classes where id = p_class_id;

  return jsonb_build_object(
    'join_code', v_code,
    'mirrored',  v_rev.registry_rev is not null,
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
                          'verdict',     p.snapshot->>'verdict')
                        order by p.opened_at desc), '[]'::jsonb)
                 from class_probes p where p.class_id = p_class_id));
end;
$$;

-- -----------------------------------------------------------------------------
-- F. grants (0009: every function carries its own stanza; create-or-replace
--    keeps the old ones, the new functions need theirs)
-- -----------------------------------------------------------------------------
revoke execute on function sync_fact_scope(jsonb, boolean) from public, anon, authenticated;
grant  execute on function sync_fact_scope(jsonb, boolean) to service_role;

revoke execute on function fact_probe_allocate_single(text, integer, integer) from public, anon, authenticated;
revoke execute on function fact_probe_family_parts(text, integer)             from public, anon, authenticated;
revoke execute on function fact_probe_allocate(text, integer, integer)        from public, anon, authenticated;
grant  execute on function fact_probe_allocate_single(text, integer, integer) to service_role;
grant  execute on function fact_probe_family_parts(text, integer)             to service_role;
grant  execute on function fact_probe_allocate(text, integer, integer)        to service_role;

revoke execute on function open_fact_probe(uuid, integer) from public, anon;
grant  execute on function open_fact_probe(uuid, integer) to authenticated, service_role;
revoke execute on function fact_probe_entry(text)         from public, anon;
grant  execute on function fact_probe_entry(text)         to authenticated, service_role;
revoke execute on function fact_probe_overview(uuid)      from public, anon;
grant  execute on function fact_probe_overview(uuid)      to authenticated, service_role;

-- =============================================================================
-- Verification lives in scripts/verify-0047.sql (registered in the verify
-- runner): the mirror stores and compares the new fields; a year over the
-- threshold opens in two ordered parts with the two-part count per family; a
-- year under it, and a revision without the settings, stay single-part.
-- =============================================================================

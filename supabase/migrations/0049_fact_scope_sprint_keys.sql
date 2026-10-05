-- =============================================================================
-- 0049_fact_scope_sprint_keys.sql — the mirror can hold the sprint's settings
-- -----------------------------------------------------------------------------
-- D43 slice 2, build slice 1 of 4 (practice-blocks.md → "Slice 2, the sprint:
-- design pass"; SB-2, SP-5 to SP-13). Seven curriculum-owned graph keys,
-- agreed by name with the curriculum side (C-63, C-66; quote their decision
-- log, not this):
--
--   sprint_max_misses             1            integer >= 0
--   sprint_minutes                5            number  > 0
--   sprint_step_intervals         [1,2,4,8,16] integers >= 1, strictly increasing
--   sprint_mastered_step          2            1 .. length of the intervals
--   sprint_new_facts_per_session  5            integer >= 0
--   sprint_working_families       2            integer >= 1
--   sprint_reask_gap              3            integer >= 1
--
-- ALL OR NONE: a revision carries all seven or none.
--
-- WHY NOW, AHEAD OF ANY READER. The mirror is insert-only and a revision's
-- content is compared field by field on a re-mirror, so a revision mirrored
-- before the mirror could hold these keys could never gain them. Their
-- registry PR waits for this migration (their "D43 amendment (2026-10-06)").
-- NOTHING READS THE COLUMN YET: the sprint's engine is the next slice (a
-- tracked debt under policy P1 — TODOS, "IN PROGRESS — the sprint").
--
--   §A  fact_scope_revision.sprint — one nullable jsonb, shape-checked
--   §B  sync_fact_scope stores and compares it; its results say `schema: 3`
--   §C  grants
--
-- THE MIRROR TABLES STAY INSERT-ONLY: §A is an ALTER adding a NULLABLE column,
-- so every stored revision reads as "no sprint settings". No student data; no
-- personal data.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A. the column
-- -----------------------------------------------------------------------------
-- The check is the database's own copy of the cross-side contract: the seven
-- keys and nothing else, each of the agreed type and range.
create or replace function fact_scope_sprint_ok(s jsonb)
returns boolean
language sql
immutable
set search_path = public
as $fn$
  select s is null or (
    jsonb_typeof(s) = 'object'
    and (select count(*) from jsonb_object_keys(s)) = 7
    and s ?& array['sprint_max_misses', 'sprint_minutes', 'sprint_step_intervals',
                   'sprint_mastered_step', 'sprint_new_facts_per_session',
                   'sprint_working_families', 'sprint_reask_gap']
    and jsonb_typeof(s->'sprint_minutes') = 'number' and (s->>'sprint_minutes')::numeric > 0
    and (select bool_and(jsonb_typeof(s->k) = 'number'
                         and (s->>k)::numeric = trunc((s->>k)::numeric))
           from unnest(array['sprint_max_misses', 'sprint_mastered_step',
                             'sprint_new_facts_per_session', 'sprint_working_families',
                             'sprint_reask_gap']) k)
    and (s->>'sprint_max_misses')::numeric >= 0
    and (s->>'sprint_new_facts_per_session')::numeric >= 0
    and (s->>'sprint_working_families')::numeric >= 1
    and (s->>'sprint_reask_gap')::numeric >= 1
    and jsonb_typeof(s->'sprint_step_intervals') = 'array'
    and jsonb_array_length(s->'sprint_step_intervals') >= 1
    and (select bool_and(jsonb_typeof(e.v) = 'number')
           from jsonb_array_elements(s->'sprint_step_intervals') e(v))
    and (select bool_and((e.v #>> '{}')::numeric >= 1
                         and (e.v #>> '{}')::numeric = trunc((e.v #>> '{}')::numeric)
                         and (e.i = 1 or (e.v #>> '{}')::numeric
                                > ((s->'sprint_step_intervals'->((e.i - 2)::int)) #>> '{}')::numeric))
           from jsonb_array_elements(s->'sprint_step_intervals') with ordinality e(v, i))
    and (s->>'sprint_mastered_step')::numeric
          between 1 and jsonb_array_length(s->'sprint_step_intervals'))
$fn$;

alter table fact_scope_revision
  add column sprint jsonb,
  add constraint fact_scope_sprint_shape check (fact_scope_sprint_ok(sprint));

comment on column fact_scope_revision.sprint is
  'The sprint''s seven graph keys (0049), exactly as the registry carries them in fact_probe; NULL on a revision from before them. Read by the sprint''s engine (D43 slice 2).';

-- -----------------------------------------------------------------------------
-- B. sync_fact_scope — 0047's body; stores and compares the sprint keys
-- -----------------------------------------------------------------------------
-- ⚠ ORDER: applied BEFORE a registry carrying the keys is mirrored. 0047's
-- function would accept one and silently DROP them; the importer refuses
-- unless this function answers `schema: 3`.
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
               'two_part_items_per_family', two_part_items_per_family))
               -- (0049) the seven sprint keys sit flat in fact_probe, as in the registry
               || coalesce(sprint, '{}'::jsonb),
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
      -- 2 = stores the two-part settings (0047); 3 = also the sprint's keys
      -- (0049). The importer refuses to mirror a registry carrying either
      -- through a function that does not say so.
      'schema', 3);
  end if;

  begin
    insert into fact_scope_revision (
      registry_rev, fact_grammar_rev, graph_version,
      floor_factor_k, accuracy_threshold, facts_met_threshold, response_ceiling_s,
      min_items_per_family, practice_window, year_scope, fraction_names,
      family_count, fact_count,
      two_part_above, two_part_items_per_family, family_groups, probe_parts, sprint)
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
      nullif(p_mirror->'probe_parts', 'null'::jsonb),
      -- The sprint's keys, exactly as sent; the column's check refuses a
      -- partial or malformed set.
      (select jsonb_object_agg(k, p_mirror->'fact_probe'->k)
         from unnest(array['sprint_max_misses', 'sprint_minutes', 'sprint_step_intervals',
                           'sprint_mastered_step', 'sprint_new_facts_per_session',
                           'sprint_working_families', 'sprint_reask_gap']) k
        where p_mirror->'fact_probe' ? k));

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
      -- 2 = stores the two-part settings (0047); 3 = also the sprint's keys
      -- (0049). The importer refuses to mirror a registry carrying either
      -- through a function that does not say so.
      'schema', 3);
end;
$$;

-- -----------------------------------------------------------------------------
-- C. grants
-- -----------------------------------------------------------------------------
revoke execute on function sync_fact_scope(jsonb, boolean) from public, anon, authenticated;
grant  execute on function sync_fact_scope(jsonb, boolean) to service_role;
revoke execute on function fact_scope_sprint_ok(jsonb) from public, anon, authenticated;
grant  execute on function fact_scope_sprint_ok(jsonb) to service_role;

-- =============================================================================
-- Verification lives in scripts/verify-0049.sql (registered in the verify
-- runner): the column and its shape check; a revision with the seven keys is
-- stored and re-mirrors as unchanged; a changed key under the same revision is
-- refused; a partial or malformed set is refused; a revision without the keys
-- behaves as before; the function says schema 3.
-- =============================================================================

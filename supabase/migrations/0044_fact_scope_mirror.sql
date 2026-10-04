-- =============================================================================
-- 0044_fact_scope_mirror.sql — the fact-scope registry mirror (D43 slice 1, T4)
-- -----------------------------------------------------------------------------
-- docs/design/practice-blocks.md → "Server → The fact-scope mirror" (ER-13),
-- with the build-time decisions 1–9 the author ruled 2026-10-04 (recorded in
-- that document's "The mirror pass, as built").
--
--   §A  fact_scope_revision / fact_scope_family / fact_scope_fact — one
--       registry revision expanded into facts, keyed by (registry_rev,
--       fact_grammar_rev), INSERT-ONLY
--   §B  the insert-only trigger
--   §C  sync_fact_scope — the importer's mirror: one atomic, service-only call;
--       p_apply=false runs the SAME inserts and rolls them back
--   §D  grants
--
-- WHAT THESE TABLES ARE. Curriculum content generated on the curriculum side
-- (`fact-scope-registry.json`, generated and CI-gated in their repo) and
-- expanded ONCE by the batch importer (packages/app/src/lib/factScope.ts — the
-- only place the fact grammar runs). They hold NO student data and no person
-- reference of any kind. Slice 1's probe (0045) samples them when a probe
-- opens and copies what it needs onto the probe row, so a probe never reads
-- them again.
--
-- WHY A SEPARATE MIGRATION (decision 1). The probe tables, RPCs and the
-- re-created purge are 0045. Splitting the mirror out lets it be applied and
-- mirrored live while the probe is built, and keeps 0045 the migration that
-- touches student data.
--
-- GLOBAL, NOT OWNER-KEYED (decision 2). There is one fact scope for the
-- platform, like misconception_registry and unlike glossary_entry.
--
-- INSERT-ONLY (ER-13). A revision's rows never change, so a probe that copied
-- from them can always be explained, and a rename or retirement on the
-- curriculum side arrives as a NEW revision rather than an edit. §B makes that
-- mechanical: UPDATE, DELETE and TRUNCATE raise. A re-mirror of an existing
-- (registry_rev, fact_grammar_rev) is a no-op when its content is identical
-- and is REFUSED when it differs — the expander's output changed without
-- FACT_GRAMMAR_REV being bumped, which is a platform bug to fix, not a row to
-- overwrite.
--
-- ⚠ graph_version is NOT part of the content. The registry's header names the
-- graph it was generated FROM, and that moves on every graph bump while the
-- revision (a hash of the body) does not. It is stored as "first mirrored
-- from" and excluded from the comparison, or every graph bump would read as a
-- conflict.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A. the three tables
-- -----------------------------------------------------------------------------
create table fact_scope_revision (
  registry_rev         text not null check (registry_rev ~ '^[0-9a-f]{64}$'),
  fact_grammar_rev     integer not null check (fact_grammar_rev >= 1),
  -- First mirrored from (informational; see the header).
  graph_version        text not null,
  -- The six single values (their items 15, 18, 25), as graph keys.
  floor_factor_k       numeric not null check (floor_factor_k > 0),
  accuracy_threshold   numeric not null check (accuracy_threshold > 0 and accuracy_threshold <= 1),
  facts_met_threshold  numeric not null check (facts_met_threshold > 0 and facts_met_threshold <= 1),
  response_ceiling_s   numeric not null check (response_ceiling_s > 0),
  min_items_per_family integer not null check (min_items_per_family > 0),
  practice_window      integer not null check (practice_window > 0),
  -- {"7": {"adds": [...], "cumulative": [...], "description": …}, …}
  year_scope           jsonb not null check (jsonb_typeof(year_scope) = 'object'),
  -- {"4": {"one": "quarter", "many": "quarters"}, …} (CR-22)
  fraction_names       jsonb not null check (jsonb_typeof(fraction_names) = 'object'),
  family_count         integer not null check (family_count > 0),
  fact_count           integer not null check (fact_count > 0),
  mirrored_at          timestamptz not null default now(),
  primary key (registry_rev, fact_grammar_rev)
);

comment on table fact_scope_revision is
  'One mirrored revision of the curriculum fact-scope registry (0044, D43 ER-13). Curriculum content, no student data. Written only via sync_fact_scope (service role); insert-only.';

create table fact_scope_family (
  registry_rev     text not null,
  fact_grammar_rev integer not null,
  family_id        text not null check (family_id ~ '^fact\.[a-z0-9.-]+$'),
  ord              integer not null check (ord >= 0),
  kind             text not null check (kind in ('generated', 'listed')),
  name             text not null check (length(btrim(name)) > 0),
  source_year      integer not null,
  -- The expander's operation; null for a listed family.
  operation        text,
  criterion_s      numeric not null check (criterion_s > 0),
  turnaround       boolean not null,
  weight           numeric not null check (weight > 0),
  fact_count       integer not null check (fact_count > 0),
  -- {intro, lines: [{label, text}], example} — the sprint reads it, the probe
  -- does not (B-24: plain text, no markup).
  strategy         jsonb check (strategy is null or jsonb_typeof(strategy) = 'object'),
  primary key (registry_rev, fact_grammar_rev, family_id),
  foreign key (registry_rev, fact_grammar_rev)
    references fact_scope_revision (registry_rev, fact_grammar_rev),
  check ((kind = 'listed') = (operation is null))
);

comment on table fact_scope_family is
  'A fact family of one mirrored fact-scope revision (0044): criterion, weight, turnaround, strategy text. Curriculum content; insert-only.';

create table fact_scope_fact (
  registry_rev     text not null,
  fact_grammar_rev integer not null,
  -- `<family id>:<a>,<b>` (smaller operand first for a turnaround pair), or a
  -- listed fact's authored id (decision 5, CR-24).
  fact_id          text not null
                   check (fact_id ~ '^fact\.[a-z0-9.-]+(:-?[0-9]+(,-?[0-9]+)?)?$'),
  family_id        text not null,
  ord              integer not null check (ord >= 0),
  -- The shown operands in canonical order; null for a listed fact.
  operands         integer[],
  -- What a student types (their item 19, CR-17); compared numerically (CR-18).
  answer           text not null
                   check (answer ~ '^-?[0-9]+(\.[0-9]+)?$' and length(answer) <= 8),
  -- Finished strings (CR-21): the display carries one `__` for the answer.
  display          text not null check (strpos(display, '__') > 0),
  spoken           text not null check (length(btrim(spoken)) > 0),
  -- The other operand order of a turnaround pair (decision 4); null when the
  -- family has no turnaround or the two operands are equal.
  display_swapped  text,
  spoken_swapped   text,
  primary key (registry_rev, fact_grammar_rev, fact_id),
  foreign key (registry_rev, fact_grammar_rev, family_id)
    references fact_scope_family (registry_rev, fact_grammar_rev, family_id),
  check ((display_swapped is null) = (spoken_swapped is null))
);

comment on table fact_scope_fact is
  'One fact of one mirrored fact-scope revision (0044): operands, answer, display and spoken strings in both orders for a turnaround pair. Curriculum content; insert-only.';

-- No client reads these tables directly (decision 2): the probe's definer RPCs
-- (0045) are the only readers. RLS on, forced, and NO policy — the absence of
-- a policy is the control, as on section_checks writes.
alter table fact_scope_revision enable row level security;
alter table fact_scope_revision force row level security;
alter table fact_scope_family   enable row level security;
alter table fact_scope_family   force row level security;
alter table fact_scope_fact     enable row level security;
alter table fact_scope_fact     force row level security;

-- -----------------------------------------------------------------------------
-- B. insert-only
-- -----------------------------------------------------------------------------
create or replace function fact_scope_insert_only()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception '% is insert-only (0044): a fact-scope revision never changes; mirror a new revision instead',
    tg_table_name;
end;
$$;

create trigger fact_scope_revision_insert_only
  before update or delete on fact_scope_revision
  for each row execute function fact_scope_insert_only();
create trigger fact_scope_revision_no_truncate
  before truncate on fact_scope_revision
  for each statement execute function fact_scope_insert_only();
create trigger fact_scope_family_insert_only
  before update or delete on fact_scope_family
  for each row execute function fact_scope_insert_only();
create trigger fact_scope_family_no_truncate
  before truncate on fact_scope_family
  for each statement execute function fact_scope_insert_only();
create trigger fact_scope_fact_insert_only
  before update or delete on fact_scope_fact
  for each row execute function fact_scope_insert_only();
create trigger fact_scope_fact_no_truncate
  before truncate on fact_scope_fact
  for each statement execute function fact_scope_insert_only();

-- -----------------------------------------------------------------------------
-- C. sync_fact_scope — the importer's mirror
-- -----------------------------------------------------------------------------
-- p_mirror is FactScopeMirror (packages/app/src/lib/factScope.ts), already
-- validated by the expander; the CHECKs above are the backstop.
--
-- Returns {status, applied, families, facts, latest_before}:
--   status 'unchanged' — this (registry_rev, fact_grammar_rev) is mirrored
--                        with identical content; nothing written
--   status 'new'       — not mirrored yet; p_apply=false, nothing written
--   status 'mirrored'  — not mirrored yet; p_apply=true, written
-- Raises when the pair is mirrored with DIFFERENT content.
--
-- The dry run runs the SAME inserts inside a block and rolls them back, so a
-- row the CHECKs would refuse fails the dry run exactly as it would fail the
-- write (the glossary mirror's W-14 property, by construction).
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
             'fact_probe', jsonb_build_object(
               'floor_factor_k', floor_factor_k,
               'accuracy_threshold', accuracy_threshold,
               'facts_met_threshold', facts_met_threshold,
               'response_ceiling_s', response_ceiling_s,
               'min_items_per_family', min_items_per_family,
               'practice_window', practice_window),
             'year_scope', year_scope,
             'fraction_names', fraction_names)
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
         'fact_probe', p_mirror->'fact_probe',
         'year_scope', p_mirror->'year_scope',
         'fraction_names', p_mirror->'fraction_names') then
      raise exception
        'sync_fact_scope: revision % (fact grammar %) is already mirrored with DIFFERENT content — the expander changed without a FACT_GRAMMAR_REV bump',
        left(v_rev, 8), v_grammar;
    end if;

    return jsonb_build_object(
      'status', 'unchanged', 'applied', false,
      'families', jsonb_array_length(v_families),
      'facts', jsonb_array_length(v_facts),
      'latest_before', v_latest);
  end if;

  begin
    insert into fact_scope_revision (
      registry_rev, fact_grammar_rev, graph_version,
      floor_factor_k, accuracy_threshold, facts_met_threshold, response_ceiling_s,
      min_items_per_family, practice_window, year_scope, fraction_names,
      family_count, fact_count)
    values (
      v_rev, v_grammar, p_mirror->>'graph_version',
      (p_mirror->'fact_probe'->>'floor_factor_k')::numeric,
      (p_mirror->'fact_probe'->>'accuracy_threshold')::numeric,
      (p_mirror->'fact_probe'->>'facts_met_threshold')::numeric,
      (p_mirror->'fact_probe'->>'response_ceiling_s')::numeric,
      (p_mirror->'fact_probe'->>'min_items_per_family')::integer,
      (p_mirror->'fact_probe'->>'practice_window')::integer,
      p_mirror->'year_scope', p_mirror->'fraction_names',
      jsonb_array_length(v_families), jsonb_array_length(v_facts));

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
    'latest_before', v_latest);
end;
$$;

comment on function sync_fact_scope(jsonb, boolean) is
  'The batch importer''s fact-scope mirror (0044, D43 ER-13): one atomic insert of a registry revision expanded into facts; service role only. p_apply=false runs the same inserts and rolls them back. An identical re-mirror is a no-op; a different one raises.';

-- -----------------------------------------------------------------------------
-- D. grants
-- -----------------------------------------------------------------------------
-- Migration-created tables do not inherit dashboard default grants (0032's
-- lesson). No client role reads or writes; service_role reads for read-backs.
revoke all on table fact_scope_revision from anon, authenticated;
revoke all on table fact_scope_family   from anon, authenticated;
revoke all on table fact_scope_fact     from anon, authenticated;
grant  select on table fact_scope_revision to service_role;
grant  select on table fact_scope_family   to service_role;
grant  select on table fact_scope_fact     to service_role;

revoke execute on function fact_scope_insert_only() from public, anon, authenticated;

revoke execute on function sync_fact_scope(jsonb, boolean) from public, anon, authenticated;
grant  execute on function sync_fact_scope(jsonb, boolean) to service_role;

-- =============================================================================
-- Verification lives in scripts/verify-0044.sql (registered in the verify
-- runner): catalog posture, the dry run that writes nothing, the apply, the
-- identical re-mirror, the refused divergent re-mirror, the insert-only
-- trigger and the fact_count cross-check.
-- =============================================================================

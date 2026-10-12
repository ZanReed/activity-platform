-- =============================================================================
-- 0058_practice_item.sql — the practice-bank item store (docs/design/practice-banks.md)
-- -----------------------------------------------------------------------------
-- D43 practice banks, PB-1…PB-12 ruled 2026-10-12, format agreed with the
-- curriculum side (C-123, amendments (a)(b)), eng review BE-1…BE-12 ruled the
-- same day. This slice is PB-11 (a): import + store + validate + a TEACHER
-- preview. NOTHING serves a bank item to a student yet (mixed practice is gated).
--
--   §A  practice_item — one row per bank TEMPLATE, owner-keyed like the glossary
--       and the hook store; written ONLY by the batch importer's service
--       connection; ONE owner SELECT policy (the 0043 posture, BE-8)
--   §B  sync_practice_items — the importer's mirror: one atomic, service-only
--       transaction (dry run by p_apply = false). It upserts and RETIRES, and
--       it REFUSES a retired id that returns (PB-3: bank item ids are never
--       reused) unless the run passes p_allow_unretire (the importer's --force).
--       0057 un-retired silently; for bank items that would merge two
--       templates' per-student histories under one id once serving exists.
--   §C  grants (0009's standing rule: every function carries its own stanza)
--
-- ANSWER-KEY CLASS. A row's `document` is the template's full ActivityDocument
-- — answers, mistake matchers, misconception bindings — and `value_table`
-- holds every valid combination of its seeded values. Students must never read
-- either: there is no student policy, no student RPC, and no Edge Function or
-- bundle reads this table. A future serving slice reads it server-side.
--
-- THE TABLE IS THE CONTRACT (BE-3, BE-4). value_table is enumerated once, at
-- import; preview (and later serving + grading) pick a row and never re-derive.
-- `fingerprint` changes whenever anything a student could see or be graded on
-- changes (document, seed spec, table, status, role/skill/chain); a future
-- serve/grade pair must name it, because this row is updated in place.
--
-- PERSONAL DATA. Curriculum content keyed to its owning teacher; no student
-- data. data-map.md and retention-policy.md move in this commit.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A. practice_item
-- -----------------------------------------------------------------------------
create table practice_item (
  owner_id      uuid not null references users(id) on delete cascade,
  -- `<file stem>#<heading>` (PB-3; amendment (b) for discrimination banks).
  -- Never reused after removal: the curriculum side's ledger is
  -- bank-item-ids-retired.txt, and §B refuses a returning retired id.
  item_id       text not null
                check (item_id ~ '^[a-z][a-z0-9._-]*#[a-z][a-z0-9-]*$' and length(item_id) <= 200),
  -- The catalogue path, banks/<chain folder>/<stem>.md (PB-1). Organisation,
  -- not identity — the item id is the identity.
  bank_path     text not null check (bank_path ~ '^banks/[^/]+/[^/]+\.md$'),
  role          text not null check (role in ('skill', 'discrimination')),
  skill_id      text check (skill_id is null or length(skill_id) <= 120),
  chain_id      text not null
                check (chain_id ~ '^chain\.[a-z0-9][a-z0-9.-]*$' and length(chain_id) <= 120),
  -- A discrimination bank's skills (PB-7), ≥ 2; empty for a skill bank.
  discriminates text[] not null default '{}',
  -- PB-10: only `ratified` will ever be served; who ratifies is the curriculum
  -- side's and the author's call — the platform only reads the word.
  status        text not null check (status in ('draft', 'ratified')),
  -- The template's order in its file (0-based), for the preview.
  position      integer not null check (position >= 0),
  document      jsonb not null check (jsonb_typeof(document) = 'object'),
  seed_spec     jsonb not null check (jsonb_typeof(seed_spec) = 'object'),
  value_table   jsonb not null check (jsonb_typeof(value_table) = 'object'
                                      and jsonb_typeof(value_table->'rows') = 'array'
                                      and jsonb_array_length(value_table->'rows') >= 1),
  fingerprint   text not null check (fingerprint ~ '^[0-9a-f]{64}$'),
  retired_at    timestamptz,
  updated_at    timestamptz not null default now(),
  primary key (owner_id, item_id),
  check (
    (role = 'skill' and skill_id is not null and cardinality(discriminates) = 0)
    or (role = 'discrimination' and skill_id is null and cardinality(discriminates) >= 2)
  )
);

create index practice_item_owner_chain on practice_item (owner_id, chain_id)
  where retired_at is null;

comment on table practice_item is
  'Practice-bank items mirrored from the catalogue''s banks/ folder by pnpm import:batch (0058; docs/design/practice-banks.md). Owner-keyed curriculum content, ANSWER-KEY CLASS (documents carry answers, value_table every seeded value), no student data, never served yet. Written only via sync_practice_items (service role); read by the owner. Retire, never delete; a retired id is never reused.';

alter table practice_item enable row level security;
alter table practice_item force row level security;

-- ONE read policy, owner-scoped (the 0043 glossary posture, BE-8): the teacher
-- who imported the bank reads their own rows for the preview. No other read
-- path exists; students own no rows and have no RPC. `(select auth.uid())` is
-- 0009's initplan form.
create policy practice_item_read_own on practice_item
  for select to authenticated
  using (owner_id = (select auth.uid()));

-- -----------------------------------------------------------------------------
-- B. sync_practice_items — the importer's mirror (BE-8)
-- -----------------------------------------------------------------------------
-- p_items: [{item_id, bank_path, role, skill_id, chain_id, discriminates,
--            status, position, document, seed_spec, value_table, fingerprint}]
-- — already validated by the importer (bankImport.ts: every template
-- enumerated, schema-checked, PB-8 at every row); the CHECKs are the backstop.
--
-- p_apply = false computes the identical answer and writes NOTHING (the dry run
-- and the mass-retire guard read it first). A returning retired id is listed in
-- `refused`; with refusals and p_allow_unretire = false, an apply RAISES and
-- nothing is written — the importer never applies a refused plan.
create or replace function sync_practice_items(
  p_owner uuid,
  p_items jsonb,
  p_apply boolean default false,
  p_allow_unretire boolean default false
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_active_before integer;
  v_new           text[];
  v_changed       text[];
  v_retired       text[];
  v_returning     text[];
begin
  if p_owner is null or not exists (select 1 from users where id = p_owner) then
    raise exception 'sync_practice_items: unknown owner %', p_owner;
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'sync_practice_items: p_items must be a jsonb array';
  end if;
  if jsonb_array_length(p_items) > 5000 then
    raise exception 'sync_practice_items: % items exceeds the 5000-item cap',
      jsonb_array_length(p_items);
  end if;
  if (select count(*) <> count(distinct i->>'item_id')
        from jsonb_array_elements(p_items) i) then
    raise exception 'sync_practice_items: duplicate item_id in p_items';
  end if;

  select count(*) into v_active_before
  from practice_item where owner_id = p_owner and retired_at is null;

  select coalesce(array_agg(i->>'item_id' order by i->>'item_id'), '{}')
    into v_new
  from jsonb_array_elements(p_items) i
  where not exists (
    select 1 from practice_item p
    where p.owner_id = p_owner and p.item_id = i->>'item_id');

  -- LIVE rows whose content or placement moved. The fingerprint covers
  -- everything gradeable (BE-9); path and position are organisation.
  select coalesce(array_agg(p.item_id order by p.item_id), '{}')
    into v_changed
  from jsonb_array_elements(p_items) i
  join practice_item p on p.owner_id = p_owner and p.item_id = i->>'item_id'
  where p.retired_at is null
    and (p.fingerprint, p.bank_path, p.position)
        is distinct from
        (i->>'fingerprint', i->>'bank_path', (i->>'position')::integer);

  select coalesce(array_agg(p.item_id order by p.item_id), '{}')
    into v_retired
  from practice_item p
  where p.owner_id = p_owner and p.retired_at is null
    and not exists (
      select 1 from jsonb_array_elements(p_items) i
      where i->>'item_id' = p.item_id);

  select coalesce(array_agg(p.item_id order by p.item_id), '{}')
    into v_returning
  from practice_item p
  where p.owner_id = p_owner and p.retired_at is not null
    and exists (
      select 1 from jsonb_array_elements(p_items) i
      where i->>'item_id' = p.item_id);

  if p_apply then
    if cardinality(v_returning) > 0 and not p_allow_unretire then
      raise exception 'sync_practice_items: retired item ids returned (%), refused — bank item ids are never reused (PB-3)',
        array_to_string(v_returning, ', ');
    end if;

    insert into practice_item
      (owner_id, item_id, bank_path, role, skill_id, chain_id, discriminates,
       status, position, document, seed_spec, value_table, fingerprint,
       retired_at, updated_at)
    select p_owner,
           i->>'item_id',
           i->>'bank_path',
           i->>'role',
           nullif(i->>'skill_id', ''),
           i->>'chain_id',
           coalesce(array(select jsonb_array_elements_text(coalesce(i->'discriminates', '[]'::jsonb))), '{}'),
           i->>'status',
           (i->>'position')::integer,
           i->'document',
           i->'seed_spec',
           i->'value_table',
           i->>'fingerprint',
           null,
           now()
    from jsonb_array_elements(p_items) i
    on conflict (owner_id, item_id) do update
      set bank_path     = excluded.bank_path,
          role          = excluded.role,
          skill_id      = excluded.skill_id,
          chain_id      = excluded.chain_id,
          discriminates = excluded.discriminates,
          status        = excluded.status,
          position      = excluded.position,
          document      = excluded.document,
          seed_spec     = excluded.seed_spec,
          value_table   = excluded.value_table,
          fingerprint   = excluded.fingerprint,
          retired_at    = null,
          -- updated_at moves only when something did (0043's rule).
          updated_at    = case
            when (practice_item.fingerprint, practice_item.bank_path, practice_item.position)
                 is distinct from
                 (excluded.fingerprint, excluded.bank_path, excluded.position)
              or practice_item.retired_at is not null
            then now()
            else practice_item.updated_at
          end;

    update practice_item
       set retired_at = now(), updated_at = now()
     where owner_id = p_owner and item_id = any(v_retired);
  end if;

  return jsonb_build_object(
    'applied',       p_apply,
    'active_before', v_active_before,
    'new',           to_jsonb(v_new),
    'changed',       to_jsonb(v_changed),
    'retired',       to_jsonb(v_retired),
    'refused',       to_jsonb(case when p_allow_unretire then '{}'::text[] else v_returning end),
    'unretired',     to_jsonb(case when p_allow_unretire then v_returning else '{}'::text[] end));
end;
$$;

comment on function sync_practice_items(uuid, jsonb, boolean, boolean) is
  'The batch importer''s practice-bank mirror (0058, BE-8): one atomic upsert + retire, service role only. A returning retired id is refused unless p_allow_unretire. p_apply=false reports and writes nothing. Retire, never delete.';

-- -----------------------------------------------------------------------------
-- C. grants
-- -----------------------------------------------------------------------------
-- Migration-created tables do not inherit dashboard default grants (0032's
-- lesson); state every privilege.
revoke all on table practice_item from anon, authenticated;
grant  select on table practice_item to authenticated;
grant  all on table practice_item to service_role;

revoke execute on function sync_practice_items(uuid, jsonb, boolean, boolean) from public, anon, authenticated;
grant  execute on function sync_practice_items(uuid, jsonb, boolean, boolean) to service_role;

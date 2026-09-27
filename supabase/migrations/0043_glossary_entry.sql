-- =============================================================================
-- 0043_glossary_entry.sql — the course glossary store (docs/design/glossary.md)
-- -----------------------------------------------------------------------------
-- Implements the reviewed store (§5 R1/R7/R8 as amended by §5c W-2/W-9 and
-- §5d EN-1/EN-2/EN-8/EN-13; full /autoplan gate APPROVED 2026-09-27).
--
--   §A  glossary_entry — owner-keyed course vocabulary (the 2026-06-19 tenant
--       ruling), written ONLY by the batch importer's service connection
--   §B  glossary_for_activity — the student read: ONE jsonb, never a row set
--   §C  sync_glossary_entries — the importer's mirror: one atomic, service-only
--       transaction that upserts, retires and un-retires
--   §D  grants (0009's standing rule: every function carries its own stanza)
--
-- WHAT THIS TABLE IS. Curriculum content — a course's defined words, their
-- US display variants (D9) and a rich definition body — mirrored from the
-- curriculum side's glossary file by `pnpm import:batch --glossary`. It holds
-- no student data. Its one person reference is `owner_id`: whose catalogue
-- the vocabulary belongs to (data-map.md, retention-policy.md — both move in
-- this commit, per CLAUDE.md's compliance rule).
--
-- RETIRE, NEVER DELETE (R8). A term that leaves the file gets `retired_at`;
-- nothing here deletes a row. Published activities carry marks keyed to a
-- `term_id`, and a key must keep resolving for the life of those marks. A
-- returning term clears `retired_at`. Only the owner's account purge removes
-- rows (FK CASCADE).
--
-- ⚠ STORE BODIES SKIP THE SERVER SANITIZE (EN-8). Activity content reaches a
-- student through get-activity's sanitize; §B returns `body` verbatim. That is
-- safe ONLY because a definition body is a DefinitionBlock array — which admits
-- no blank tokens — and the viewer rejects any body carrying a prompted
-- math_inline (@activity/schema glossary-body.ts) while the importer refuses to
-- write one. If DefinitionBlock ever admits a gradeable shape, re-read this.
--
-- ONE JSONB, NEVER A ROW SET (EN-1). supabase/config.toml sets no
-- `[api] max_rows`, so hosted PostgREST caps every read — set-returning RPCs
-- included — at 1,000 rows, silently. A course glossary may exceed that; §B
-- therefore aggregates into a single jsonb value, capped HERE at 2,000 entries
-- (= GLOSSARY_MAX_ENTRIES in @activity/schema; scripts/tests/glossary-cap.test.mjs
-- pins the two together) and says so via `capped`.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A. glossary_entry
-- -----------------------------------------------------------------------------
create table glossary_entry (
  owner_id   uuid not null references users(id) on delete cascade,
  -- The stable identity from the file's REQUIRED `id:` line (W-2) — never
  -- derived from the term, so a spelling fix is not a rename. Lower-case
  -- slug-ish ids only; the importer names any other shape before writing.
  term_id    text not null
             check (term_id ~ '^[a-z0-9][a-z0-9._-]*$' and length(term_id) <= 120),
  term       text not null check (length(btrim(term)) > 0),
  -- Locale-keyed display strings, e.g. {"us": "slope"} (D9, W-3).
  variants   jsonb not null default '{}'::jsonb check (jsonb_typeof(variants) = 'object'),
  body       jsonb not null check (jsonb_typeof(body) = 'array'),
  retired_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (owner_id, term_id)
);

comment on table glossary_entry is
  'Course glossary mirrored from the curriculum glossary file by pnpm import:batch --glossary (0043; docs/design/glossary.md). Owner-keyed curriculum content, no student data. Written only via sync_glossary_entries (service role); students read via glossary_for_activity. Retire, never delete.';

alter table glossary_entry enable row level security;
alter table glossary_entry force row level security;

-- ONE read policy, owner-scoped (R7): a teacher reads their own rows directly;
-- everyone else — every student — reads only through §B, which is the single
-- cross-owner path. `(select auth.uid())` is 0009's initplan form.
create policy glossary_entry_read_own on glossary_entry
  for select to authenticated
  using (owner_id = (select auth.uid()));

-- -----------------------------------------------------------------------------
-- B. glossary_for_activity — the student read (R1, EN-1)
-- -----------------------------------------------------------------------------
-- Gate = EXACTLY get_published_activity's predicate (0017): signed in, the
-- activity exists, is not deleted, and is PUBLISHED. There is no owner/draft
-- branch: the viewer never serves drafts. NOT can_read_activity — that helper
-- is owner-only (0009) and the Activity-Bank landmine.
--
-- Consequence, stated plainly: anyone signed in who can open a published
-- activity can read its owner's whole glossary. Acceptable because the rows
-- are course content, never student data.
--
-- Returns NULL when the activity is not a published one (the viewer's
-- `not-published` developer signal, W-10), else
--   {"entries": [{term_id, term, variants, body, retired}], "capped": bool}
-- Retired entries ARE returned (flagged): a published mark keyed to a retired
-- term must keep its definition; the viewer keeps them out of list and search.
create function glossary_for_activity(p_activity_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_owner   uuid;
  v_total   integer;
  v_entries jsonb;
begin
  if auth.uid() is null then
    raise exception 'Not authorized';
  end if;

  select a.owner_id into v_owner
  from activities a
  where a.id = p_activity_id
    and a.deleted_at is null
    and a.status = 'published';
  if not found then
    return null;
  end if;

  select count(*) into v_total from glossary_entry where owner_id = v_owner;

  select coalesce(
           jsonb_agg(
             jsonb_build_object(
               'term_id',  g.term_id,
               'term',     g.term,
               'variants', g.variants,
               'body',     g.body,
               'retired',  g.retired_at is not null)
             order by g.term, g.term_id),
           '[]'::jsonb)
    into v_entries
  from (
    select * from glossary_entry
    where owner_id = v_owner
    order by term, term_id
    limit 2000                       -- = GLOSSARY_MAX_ENTRIES
  ) g;

  return jsonb_build_object('entries', v_entries, 'capped', v_total > 2000);
end;
$$;

comment on function glossary_for_activity(uuid) is
  'Student read of a published activity''s owner glossary as ONE jsonb (0043 EN-1: a row set would hit PostgREST''s 1,000-row default silently). NULL when the activity is not published. Gate = 0017''s predicate, never can_read_activity.';

-- -----------------------------------------------------------------------------
-- C. sync_glossary_entries — the importer's mirror (R8, EN-2)
-- -----------------------------------------------------------------------------
-- ONE atomic transaction: upsert every entry in p_entries, RETIRE every active
-- row absent from it, UN-RETIRE every retired row that returns. p_apply=false
-- computes the identical answer and writes NOTHING — the importer's dry run
-- and its mass-retire guard (W-5/EN-12) both read that answer before any
-- write happens. Service role only: the importer is the store's sole writer.
--
-- p_entries: [{term_id, term, variants, body}, …] — already validated by the
-- importer (loader rules R3/W-2/W-3/EN-8); the table's CHECKs are the backstop.
create function sync_glossary_entries(
  p_owner   uuid,
  p_entries jsonb,
  p_apply   boolean default false
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
  v_unretired     text[];
begin
  if p_owner is null or not exists (select 1 from users where id = p_owner) then
    raise exception 'sync_glossary_entries: unknown owner %', p_owner;
  end if;
  if p_entries is null or jsonb_typeof(p_entries) <> 'array' then
    raise exception 'sync_glossary_entries: p_entries must be a jsonb array';
  end if;
  if jsonb_array_length(p_entries) > 2000 then   -- = GLOSSARY_MAX_ENTRIES
    raise exception 'sync_glossary_entries: % entries exceeds the 2000-entry cap',
      jsonb_array_length(p_entries);
  end if;
  if (select count(*) <> count(distinct e->>'term_id')
        from jsonb_array_elements(p_entries) e) then
    raise exception 'sync_glossary_entries: duplicate term_id in p_entries';
  end if;

  select count(*) into v_active_before
  from glossary_entry where owner_id = p_owner and retired_at is null;

  select coalesce(array_agg(e->>'term_id' order by e->>'term_id'), '{}')
    into v_new
  from jsonb_array_elements(p_entries) e
  where not exists (
    select 1 from glossary_entry g
    where g.owner_id = p_owner and g.term_id = e->>'term_id');

  select coalesce(array_agg(g.term_id order by g.term_id), '{}')
    into v_changed
  from jsonb_array_elements(p_entries) e
  join glossary_entry g on g.owner_id = p_owner and g.term_id = e->>'term_id'
  where (g.term, g.variants, g.body)
        is distinct from
        (e->>'term', coalesce(e->'variants', '{}'::jsonb), e->'body');

  select coalesce(array_agg(g.term_id order by g.term_id), '{}')
    into v_retired
  from glossary_entry g
  where g.owner_id = p_owner and g.retired_at is null
    and not exists (
      select 1 from jsonb_array_elements(p_entries) e
      where e->>'term_id' = g.term_id);

  select coalesce(array_agg(g.term_id order by g.term_id), '{}')
    into v_unretired
  from glossary_entry g
  where g.owner_id = p_owner and g.retired_at is not null
    and exists (
      select 1 from jsonb_array_elements(p_entries) e
      where e->>'term_id' = g.term_id);

  if p_apply then
    insert into glossary_entry (owner_id, term_id, term, variants, body, retired_at, updated_at)
    select p_owner,
           e->>'term_id',
           e->>'term',
           coalesce(e->'variants', '{}'::jsonb),
           e->'body',
           null,
           now()
    from jsonb_array_elements(p_entries) e
    on conflict (owner_id, term_id) do update
      set term       = excluded.term,
          variants   = excluded.variants,
          body       = excluded.body,
          retired_at = null,
          -- updated_at moves only when something did (a no-op re-import must
          -- not make every row look freshly edited).
          updated_at = case
            when (glossary_entry.term, glossary_entry.variants, glossary_entry.body)
                 is distinct from (excluded.term, excluded.variants, excluded.body)
              or glossary_entry.retired_at is not null
            then now()
            else glossary_entry.updated_at
          end;

    update glossary_entry
       set retired_at = now(), updated_at = now()
     where owner_id = p_owner and term_id = any(v_retired);
  end if;

  return jsonb_build_object(
    'applied',       p_apply,
    'active_before', v_active_before,
    'new',           to_jsonb(v_new),
    'changed',       to_jsonb(v_changed),
    'retired',       to_jsonb(v_retired),
    'unretired',     to_jsonb(v_unretired));
end;
$$;

comment on function sync_glossary_entries(uuid, jsonb, boolean) is
  'The batch importer''s glossary mirror (0043 EN-2): one atomic upsert + retire + un-retire, service role only. p_apply=false reports and writes nothing. Retire, never delete.';

-- -----------------------------------------------------------------------------
-- D. grants
-- -----------------------------------------------------------------------------
-- Migration-created tables do not inherit dashboard default grants (0032's
-- lesson) — and this one must not: the SELECT grant is what lets the owner
-- policy matter; no client role writes, ever.
revoke all on table glossary_entry from anon, authenticated;
grant  select on table glossary_entry to authenticated, service_role;

revoke execute on function glossary_for_activity(uuid) from public, anon;
grant  execute on function glossary_for_activity(uuid) to authenticated, service_role;

revoke execute on function sync_glossary_entries(uuid, jsonb, boolean) from public, anon, authenticated;
grant  execute on function sync_glossary_entries(uuid, jsonb, boolean) to service_role;

-- =============================================================================
-- Verification lives in scripts/verify-0043.sql (registered in the verify
-- runner): catalog posture, the read RPC's gate matrix and its 1,001+-entry
-- single-jsonb proof, the sync RPC's dry-run/upsert/retire/un-retire matrix,
-- and the owner-purge cascade.
-- =============================================================================

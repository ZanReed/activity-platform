-- =============================================================================
-- 0057_chain_hooks.sql — the chain hook view's store (docs/design/chain-hooks-view.md)
-- -----------------------------------------------------------------------------
-- Ruled 2026-10-08 (CH-1..CH-12), eng-reviewed (D1–D6), design-reviewed and
-- re-reviewed the same day. The joint contract (the curriculum side's generated
-- hook-registry.json) was agreed in C-97 and merged at their 71dd581.
--
--   §A  chain_hook — owner-keyed mirror of a chain's hook pool (CH-4), written
--       ONLY by the batch importer's service connection; NO client policy (D1)
--   §B  sync_chain_hooks — the importer's mirror: one atomic, service-only
--       transaction that upserts, retires and un-retires (CH-5), dry run by
--       p_apply = false (the 0043 §C shape)
--   §C  my_chain_hooks — the ONE teacher read (D1): every live pool for every
--       chain the caller teaches, own or Bank-copied, as one jsonb
--   §D  class_hook_use — per-class "used" marks (CH-9), read and written
--       directly by the class's teacher under is_class_teacher RLS
--   §E  activities_provenance_guard — client roles may not write the copy
--       provenance columns (D4); the copier read in §C trusts them
--   §F  grants (0009's standing rule: every function carries its own stanza)
--
-- PERSONAL DATA. chain_hook holds curriculum content (a hook's prompt and
-- teacher note) keyed to its owning teacher. class_hook_use holds a teacher's
-- planning state (which hook a class has heard, and when) keyed to a class and
-- to the teacher who marked it. Neither holds student data. data-map.md and
-- retention-policy.md move in this commit (CLAUDE.md's compliance rule).
--
-- STUDENTS NEVER READ HOOKS. A hook's note carries its answer ("80c vs about
-- 83c"), so it is answer-key-class content. Hooks are not in any activity
-- document: no sanitize change, no Edge Function, no bundle. The teacher gate
-- inside §C is the only read path.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A. chain_hook
-- -----------------------------------------------------------------------------
create table chain_hook (
  owner_id    uuid not null references users(id) on delete cascade,
  -- The curriculum's hook id (C-97: never reused once in their graph or cut at
  -- screening; their hook-ids-retired.txt is the ledger).
  hook_id     text not null
              check (hook_id ~ '^hook\.[a-z0-9][a-z0-9.-]*$' and length(hook_id) <= 120),
  -- The graph's chain_id; an activity's chain is its catalogue folder with the
  -- ordinal stripped (C-97 (e), D46: folder = <ordinal>-<chain_id>).
  chain_id    text not null
              check (chain_id ~ '^chain\.[a-z0-9][a-z0-9.-]*$' and length(chain_id) <= 120),
  -- Pool order as authored, opener first (C-97 (a)); written from the array
  -- index, so a reorder is a change the dry run reports.
  position    integer not null check (position >= 0),
  -- [{id, label}] — the skills the hook opens, labels from the graph (C-97 (c)).
  connects_to jsonb not null default '[]'::jsonb check (jsonb_typeof(connects_to) = 'array'),
  -- PLAIN TEXT (C-97 (d), enforced by their generator): rendered literally.
  prompt      text not null check (length(btrim(prompt)) > 0),
  note        text not null check (length(btrim(note)) > 0),
  retired_at  timestamptz,
  updated_at  timestamptz not null default now(),
  primary key (owner_id, hook_id)
);

comment on table chain_hook is
  'Chain hook pools mirrored from the curriculum hook-registry.json by pnpm import:batch --hook-registry (0057; docs/design/chain-hooks-view.md). Owner-keyed curriculum content, teacher-only (notes carry answers), no student data. Written only via sync_chain_hooks (service role); read only via my_chain_hooks. Retire, never delete.';

alter table chain_hook enable row level security;
alter table chain_hook force row level security;
-- NO policy (D1): even the owner reads through my_chain_hooks, so there is one
-- read path to verify and attack, not two.

-- -----------------------------------------------------------------------------
-- B. sync_chain_hooks — the importer's mirror (CH-3, CH-5)
-- -----------------------------------------------------------------------------
-- ONE atomic transaction: upsert every hook in p_hooks, RETIRE every live row
-- absent from it, UN-RETIRE every retired row that returns. p_apply = false
-- computes the identical answer and writes NOTHING — the importer's dry run and
-- its mass-retire guard both read it first. Service role only.
--
-- p_hooks: [{hook_id, chain_id, position, connects_to, prompt, note}, …] —
-- already validated by the importer (revision, chain + skill registries,
-- id shape); the table's CHECKs are the backstop.
create or replace function sync_chain_hooks(
  p_owner uuid,
  p_hooks jsonb,
  p_apply boolean default false
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
    raise exception 'sync_chain_hooks: unknown owner %', p_owner;
  end if;
  if p_hooks is null or jsonb_typeof(p_hooks) <> 'array' then
    raise exception 'sync_chain_hooks: p_hooks must be a jsonb array';
  end if;
  if jsonb_array_length(p_hooks) > 2000 then
    raise exception 'sync_chain_hooks: % hooks exceeds the 2000-hook cap',
      jsonb_array_length(p_hooks);
  end if;
  if (select count(*) <> count(distinct h->>'hook_id')
        from jsonb_array_elements(p_hooks) h) then
    raise exception 'sync_chain_hooks: duplicate hook_id in p_hooks';
  end if;

  select count(*) into v_active_before
  from chain_hook where owner_id = p_owner and retired_at is null;

  select coalesce(array_agg(h->>'hook_id' order by h->>'hook_id'), '{}')
    into v_new
  from jsonb_array_elements(p_hooks) h
  where not exists (
    select 1 from chain_hook c
    where c.owner_id = p_owner and c.hook_id = h->>'hook_id');

  select coalesce(array_agg(c.hook_id order by c.hook_id), '{}')
    into v_changed
  from jsonb_array_elements(p_hooks) h
  join chain_hook c on c.owner_id = p_owner and c.hook_id = h->>'hook_id'
  where (c.chain_id, c.position, c.connects_to, c.prompt, c.note)
        is distinct from
        (h->>'chain_id', (h->>'position')::integer,
         coalesce(h->'connects_to', '[]'::jsonb), h->>'prompt', h->>'note');

  select coalesce(array_agg(c.hook_id order by c.hook_id), '{}')
    into v_retired
  from chain_hook c
  where c.owner_id = p_owner and c.retired_at is null
    and not exists (
      select 1 from jsonb_array_elements(p_hooks) h
      where h->>'hook_id' = c.hook_id);

  select coalesce(array_agg(c.hook_id order by c.hook_id), '{}')
    into v_unretired
  from chain_hook c
  where c.owner_id = p_owner and c.retired_at is not null
    and exists (
      select 1 from jsonb_array_elements(p_hooks) h
      where h->>'hook_id' = c.hook_id);

  if p_apply then
    insert into chain_hook
      (owner_id, hook_id, chain_id, position, connects_to, prompt, note, retired_at, updated_at)
    select p_owner,
           h->>'hook_id',
           h->>'chain_id',
           (h->>'position')::integer,
           coalesce(h->'connects_to', '[]'::jsonb),
           h->>'prompt',
           h->>'note',
           null,
           now()
    from jsonb_array_elements(p_hooks) h
    on conflict (owner_id, hook_id) do update
      set chain_id    = excluded.chain_id,
          position    = excluded.position,
          connects_to = excluded.connects_to,
          prompt      = excluded.prompt,
          note        = excluded.note,
          retired_at  = null,
          -- updated_at moves only when something did (0043's rule: a no-op
          -- re-import must not make every row look freshly edited).
          updated_at  = case
            when (chain_hook.chain_id, chain_hook.position, chain_hook.connects_to,
                  chain_hook.prompt, chain_hook.note)
                 is distinct from
                 (excluded.chain_id, excluded.position, excluded.connects_to,
                  excluded.prompt, excluded.note)
              or chain_hook.retired_at is not null
            then now()
            else chain_hook.updated_at
          end;

    update chain_hook
       set retired_at = now(), updated_at = now()
     where owner_id = p_owner and hook_id = any(v_retired);
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

comment on function sync_chain_hooks(uuid, jsonb, boolean) is
  'The batch importer''s hook mirror (0057 CH-3/CH-5): one atomic upsert + retire + un-retire, service role only. p_apply=false reports and writes nothing. Retire, never delete.';

-- -----------------------------------------------------------------------------
-- C. my_chain_hooks — the one teacher read (D1, D2, D4)
-- -----------------------------------------------------------------------------
-- Returns ONE jsonb:
--   { "activityChains": { "<activity id>": "<chain_id>", … },
--     "chains":         { "<chain_id>": [ {id, connects_to, prompt, note}, … ] } }
-- activityChains covers every non-deleted activity the caller OWNS that has a
-- chain; chains covers only chains with a LIVE pool, hooks in pool order.
--
-- An activity's chain: its own source_path's first segment with the ordinal
-- stripped; for a Bank copy (no source_path, BK-1), its ORIGINAL's. Whose pool:
--   * own chain  → the caller's own rows (their import);
--   * copy chain → the original's owner's rows, read WHATEVER the original's
--                  deleted_at (D2: the copier keeps the unit's hooks);
--   * both exist for one chain → the caller's own pool wins (BK-7's rule).
-- (chain, owner) pairs are formed per activity from ONE source each, so a
-- client-set source_path on a copy can only ever point at the caller's own
-- (empty) rows. copied_from_* cannot be client-written at all (§E).
--
-- Gate: a signed-in TEACHER (current_user_is_teacher(), 0013 — also excludes a
-- deleted account). Students own no activities (0013's insert containment),
-- but a definer function bypasses RLS, so the gate lives here too.
create or replace function my_chain_hooks()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid    uuid := auth.uid();
  v_result jsonb;
begin
  if v_uid is null then
    raise exception 'Not authorized';
  end if;
  if not current_user_is_teacher() then
    return jsonb_build_object('activityChains', '{}'::jsonb, 'chains', '{}'::jsonb);
  end if;

  with mine as (
    select a.id,
           case when position('/' in coalesce(a.source_path, '')) > 0
                then nullif(regexp_replace(split_part(a.source_path, '/', 1), '^\d+-', ''), '')
           end as own_chain,
           s.owner_id as src_owner,
           case when position('/' in coalesce(s.source_path, '')) > 0
                then nullif(regexp_replace(split_part(s.source_path, '/', 1), '^\d+-', ''), '')
           end as src_chain
    from activities a
    left join activities s on s.id = a.copied_from_activity_id
    where a.owner_id = v_uid
      and a.deleted_at is null
  ),
  chained as (
    select id,
           coalesce(own_chain, src_chain) as chain_id,
           case when own_chain is not null then v_uid else src_owner end as pool_owner
    from mine
    where coalesce(own_chain, src_chain) is not null
  ),
  candidates as (
    select distinct c.chain_id, c.pool_owner
    from chained c
    where exists (select 1 from chain_hook h
                  where h.owner_id = c.pool_owner and h.chain_id = c.chain_id
                    and h.retired_at is null)
  ),
  chosen as (
    -- Own pool wins; otherwise one deterministic source owner per chain.
    select distinct on (chain_id) chain_id, pool_owner
    from candidates
    order by chain_id, (pool_owner = v_uid) desc, pool_owner
  ),
  pools as (
    select ch.chain_id,
           jsonb_agg(jsonb_build_object(
                       'id',          h.hook_id,
                       'connects_to', h.connects_to,
                       'prompt',      h.prompt,
                       'note',        h.note)
                     order by h.position, h.hook_id) as hooks
    from chosen ch
    join chain_hook h on h.owner_id = ch.pool_owner and h.chain_id = ch.chain_id
                     and h.retired_at is null
    group by ch.chain_id
  )
  select jsonb_build_object(
           'activityChains',
             coalesce((select jsonb_object_agg(id::text, chain_id) from chained), '{}'::jsonb),
           'chains',
             coalesce((select jsonb_object_agg(chain_id, hooks) from pools), '{}'::jsonb))
    into v_result;

  return v_result;
end;
$$;

comment on function my_chain_hooks() is
  'The ONE teacher read of chain hooks (0057 D1): every live pool for every chain the caller owns a non-deleted activity in, own source_path or a Bank copy''s original (whatever its deleted_at, D2); the caller''s own pool wins. Teachers only; students and other callers get empty maps.';

-- -----------------------------------------------------------------------------
-- D. class_hook_use — per-class "used" marks (CH-9a–d)
-- -----------------------------------------------------------------------------
-- One row per (class, hook): the class has heard this hook, on used_on. The
-- teacher may change the date (CH-9a); unmarking DELETES the row (CH-9d — this
-- is planning state, not student work). hook_id has no FK: a copier's hooks are
-- owned by the original's owner (CH-6), so no (owner, hook) pair can be formed;
-- CH-5's retire-never-delete is what keeps a mark resolving.
--
-- Retention: a mark lives as long as its class row. classes are only ever
-- soft-deleted today, so the CASCADE is correct but inert (eng review, scope
-- finding 2). is_class_teacher requires deleted_at is null, so marks on a
-- soft-deleted class vanish from every surface.
create table class_hook_use (
  class_id   uuid not null references classes(id) on delete cascade,
  hook_id    text not null
             check (hook_id ~ '^hook\.[a-z0-9][a-z0-9.-]*$' and length(hook_id) <= 120),
  used_on    date not null,
  -- on delete set null: keeps marks off the account purge's hand-kept blocker
  -- list (0050), and a mark's meaning does not depend on who clicked.
  marked_by  uuid references users(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (class_id, hook_id)
);

comment on table class_hook_use is
  'Per-class "used" marks for chain hooks (0057 CH-9): which hook a class has heard and on what date. Teacher planning state, no student data. The class''s teacher reads and writes directly (is_class_teacher RLS); unmarking deletes the row.';

alter table class_hook_use enable row level security;
alter table class_hook_use force row level security;

create policy class_hook_use_select on class_hook_use
  for select to authenticated
  using (is_class_teacher(class_id));

create policy class_hook_use_insert on class_hook_use
  for insert to authenticated
  with check (is_class_teacher(class_id) and marked_by = (select auth.uid()));

create policy class_hook_use_update on class_hook_use
  for update to authenticated
  using (is_class_teacher(class_id))
  with check (is_class_teacher(class_id) and marked_by = (select auth.uid()));

create policy class_hook_use_delete on class_hook_use
  for delete to authenticated
  using (is_class_teacher(class_id));

-- -----------------------------------------------------------------------------
-- E. activities_provenance_guard (D4)
-- -----------------------------------------------------------------------------
-- activities' RLS is row-level only (0013: owner + current_user_is_teacher(),
-- no column list), so before this trigger any teacher could write
-- copied_from_activity_id on their own row, point it at any activity, and have
-- §C serve that owner's hooks. Now only a non-client role may set or change the
-- two provenance columns: copy_bank_activity (SECURITY DEFINER, runs as its
-- owner), the service-role importer, and the FK's own ON DELETE SET NULL.
-- current_user is the CLIENT role under PostgREST ('authenticated'/'anon'); the
-- users_timezone_guard pattern (0036).
create or replace function activities_provenance_guard()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user in ('authenticated', 'anon') then
    if tg_op = 'INSERT' then
      if new.copied_from_activity_id is not null or new.copied_from_version_id is not null then
        raise exception 'copied_from_activity_id / copied_from_version_id are not client-writable';
      end if;
    elsif new.copied_from_activity_id is distinct from old.copied_from_activity_id
       or new.copied_from_version_id is distinct from old.copied_from_version_id then
      raise exception 'copied_from_activity_id / copied_from_version_id are not client-writable';
    end if;
  end if;
  return new;
end;
$$;

create trigger activities_provenance_guard
  before insert or update on activities
  for each row execute function activities_provenance_guard();

-- -----------------------------------------------------------------------------
-- F. grants
-- -----------------------------------------------------------------------------
-- Migration-created tables do not inherit dashboard default grants (0032's
-- lesson). chain_hook: no client privilege at all (D1). class_hook_use: the
-- four verbs, gated by the policies above.
revoke all on table chain_hook from anon, authenticated;
grant  all on table chain_hook to service_role;

revoke all on table class_hook_use from anon, authenticated;
grant  select, insert, update, delete on table class_hook_use to authenticated;
grant  all on table class_hook_use to service_role;

revoke execute on function my_chain_hooks() from public, anon;
grant  execute on function my_chain_hooks() to authenticated, service_role;

revoke execute on function sync_chain_hooks(uuid, jsonb, boolean) from public, anon, authenticated;
grant  execute on function sync_chain_hooks(uuid, jsonb, boolean) to service_role;

revoke execute on function activities_provenance_guard() from public, anon, authenticated;

-- =============================================================================
-- Verification lives in scripts/verify-0057.sql (registered in the verify
-- runner): catalog posture; the sync matrix; the read gate (owner, copier,
-- soft-deleted original, hand-set source_path, student, no-activity teacher,
-- own-wins); the marks RLS matrix; and the provenance guard (forged insert and
-- update refused, the honest copy still works).
-- =============================================================================

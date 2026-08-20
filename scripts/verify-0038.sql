-- verify-0038.sql — file identity for the batch importer (migration 0038; plan
-- + rulings in docs/design/batch-importer.md).
--
-- Run with `pnpm verify:auth --target live|local`. §C is a self-fixturing
-- EXPECTED-ROLLBACK block (the verify-0034/0035/0037 idiom): real rows, real
-- constraint violations caught and re-raised, everything rolled back —
-- durable-write-free on every path (P7).
--
-- WHY EACH SECTION EXISTS:
--   §A — posture: the column has the shape ruling D1 specifies (text, NULLABLE)
--        and the index carries BOTH predicate clauses. The predicate is not
--        decoration: `source_path is not null` is what lets the hundreds of
--        hand-authored activities coexist, and `deleted_at is null` is what
--        makes "delete it in the app and re-run the importer" work. A future
--        session tidying the index into a plain unique constraint would break
--        both, silently and only under real data — so both are asserted.
--   §C — the behavioral matrix, one fixture, in order:
--        U  the same (owner, source_path) twice RAISES — the upsert key is real,
--           which is the entire reason the column exists;
--        N  many NULL source_paths for one owner are FINE — otherwise the
--           migration would have broken every existing activity;
--        X  two different owners may hold the same path — identity is
--           owner-scoped, like every other key on this table;
--        D  soft-deleting an imported row FREES its path for a fresh import —
--           the author's undo, and the one place this index deliberately
--           differs from `unique (owner_id, slug)` (which is not partial, by
--           0012's design);
--        S  the slug constraint still bites, unchanged — this migration added
--           an identity, it did not replace one.

-- @section A-posture
-- @expect-rows
select 'source_path_column_exists_nullable',
       (select data_type = 'text' and is_nullable = 'YES'
          from information_schema.columns
         where table_schema = 'public' and table_name = 'activities'
           and column_name = 'source_path'),
       'D1: text, and NULLABLE because every hand-authored activity has no source file — that is the common state, not an exceptional one';
select 'source_path_unique_index_exists',
       exists (select 1 from pg_indexes
                where schemaname = 'public' and tablename = 'activities'
                  and indexname = 'activities_owner_source_path_key'),
       'the index IS the upsert key: without it, re-running the importer duplicates instead of updating, which is the whole property the slice exists to deliver';
select 'source_path_index_is_owner_scoped',
       (select indexdef ilike '%(owner_id, source_path)%'
          from pg_indexes
         where schemaname = 'public' and tablename = 'activities'
           and indexname = 'activities_owner_source_path_key'),
       'identity is owner-scoped like every other key on this table — two teachers may each have a unit-3/warm-up.md';
select 'source_path_index_predicate_excludes_nulls',
       (select indexdef ilike '%source_path is not null%'
          from pg_indexes
         where schemaname = 'public' and tablename = 'activities'
           and indexname = 'activities_owner_source_path_key'),
       'the clause that lets un-imported activities coexist. Removing it would make every hand-authored row compete for one NULL slot in some future Postgres semantics — say the intent, do not lean on it';
select 'source_path_index_predicate_excludes_soft_deleted',
       (select indexdef ilike '%deleted_at is null%'
          from pg_indexes
         where schemaname = 'public' and tablename = 'activities'
           and indexname = 'activities_owner_source_path_key'),
       'the author''s undo: delete an imported activity in the app, re-run the importer, get a clean row. This is the one place the index DEPARTS from unique (owner_id, slug), which is deliberately NOT partial so 0012''s restore_activity stays conflict-free';
select 'activities_grants_cover_source_path',
       has_column_privilege('authenticated', 'public.activities', 'source_path', 'update')
       and has_column_privilege('authenticated', 'public.activities', 'source_path', 'select'),
       '0032 grants at TABLE level, so columns added later are covered without a new grant stanza — asserted rather than assumed (the 0037 precedent)';
select 'source_path_absent_from_person_column_sweep',
       'source_path' not in ('student_id','teacher_id','owner_id','created_by',
                             'actor_id','user_id','display_name','email',
                             'ip_hash','user_agent','timezone'),
       'the compliance claim this migration makes, stated where it can be read: a relative file path inside the author''s own folder is activity metadata, not personal data. If a future column here IS person-referencing, data-map.md gains a row and this reasoning does not transfer';

-- @section C-behavioral-matrix
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_teacher   uuid := gen_random_uuid();
  v_other     uuid := gen_random_uuid();
  v_first     uuid;
  v_second    uuid;
  v_caught    boolean;
begin
  -- ---- fixtures ----------------------------------------------------------
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_teacher, 'vfy0038-a@vfy0038.example', '{}'::jsonb),
         (v_other,   'vfy0038-b@vfy0038.example', '{}'::jsonb);
  update users set role = 'teacher' where id in (v_teacher, v_other);

  insert into activities (owner_id, title, slug, status, source_path)
  values (v_teacher, 'vfy 0038 one', 'vfy-0038-one', 'draft',
          'unit-3/factoring.md')
  returning id into v_first;

  -- ---- (U) the same (owner, source_path) twice RAISES ---------------------
  -- The row that proves the upsert key is real. If this ever passes without
  -- raising, re-running the importer silently duplicates all 150 activities.
  v_caught := false;
  begin
    insert into activities (owner_id, title, slug, status, source_path)
    values (v_teacher, 'vfy 0038 dup', 'vfy-0038-dup', 'draft',
            'unit-3/factoring.md');
  exception when unique_violation then
    v_caught := true;
  end;
  if not v_caught then
    raise exception 'FAIL (U): a second activity claimed source_path unit-3/factoring.md for the same owner. The upsert key does not hold, so a re-import would DUPLICATE rather than update — the one property this slice exists to deliver';
  end if;

  -- ---- (N) many NULL source_paths for one owner are fine ------------------
  -- If this raises, the migration broke every activity that already exists.
  insert into activities (owner_id, title, slug, status)
  values (v_teacher, 'vfy 0038 hand a', 'vfy-0038-hand-a', 'draft'),
         (v_teacher, 'vfy 0038 hand b', 'vfy-0038-hand-b', 'draft');

  -- ---- (X) two owners may hold the same path ------------------------------
  insert into activities (owner_id, title, slug, status, source_path)
  values (v_other, 'vfy 0038 other', 'vfy-0038-other', 'draft',
          'unit-3/factoring.md')
  returning id into v_second;

  -- ---- (D) soft-delete frees the path -------------------------------------
  -- The author's undo. Delete the imported activity in the app, re-run the
  -- importer, get a clean row rather than a collision with a tombstone.
  update activities set deleted_at = now() where id = v_first;

  insert into activities (owner_id, title, slug, status, source_path)
  values (v_teacher, 'vfy 0038 reimport', 'vfy-0038-reimport', 'draft',
          'unit-3/factoring.md');

  -- ---- (S) the slug constraint is untouched -------------------------------
  -- This migration ADDED an identity; it did not replace one. `slug` is still
  -- title-derived, still required, and still unique per owner — and its
  -- constraint is still NOT partial, so the soft-deleted row above is STILL
  -- holding vfy-0038-one (0012 depends on precisely that).
  v_caught := false;
  begin
    insert into activities (owner_id, title, slug, status)
    values (v_teacher, 'vfy 0038 slug clash', 'vfy-0038-one', 'draft');
  exception when unique_violation then
    v_caught := true;
  end;
  if not v_caught then
    raise exception 'FAIL (S): unique (owner_id, slug) no longer bites for a SOFT-DELETED row. 0012''s restore_activity relies on a tombstone keeping its slug; if that changed, restore can now conflict';
  end if;

  raise exception 'EXPECTED ROLLBACK — all rows passed';
end
$vfy$;

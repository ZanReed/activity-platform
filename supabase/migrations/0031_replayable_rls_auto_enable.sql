-- =============================================================================
-- 0031_replayable_rls_auto_enable.sql — make the migration chain rebuildable
-- -----------------------------------------------------------------------------
-- WHY THIS EXISTS. `rls_auto_enable()` and its `ensure_rls` event trigger were
-- created in the Supabase dashboard, never in a migration. 0009 then wrote a
-- `revoke execute` against the function — an EXECUTABLE dependency on a
-- dashboard-only object. The consequence went unnoticed for months because it
-- is invisible from the live database, where the function exists and 0009
-- applied cleanly: **a fresh replay of the chain aborted at 0009**. No new
-- environment could be built from migrations, disaster recovery from
-- migrations was broken, and the S9 integration lane could never have passed on
-- ANY machine, because its preflight runs `supabase db reset` on every run.
--
-- Found 2026-08-14 by the integration lane's first real run — the lane built to
-- end stub-blindness, finding a thing no amount of reading would have shown.
-- DECISIONS.md had recorded the provenance ("so the next catalog-vs-repo diff
-- doesn't treat it as a mystery"); the note worked as documentation and did not
-- prevent the executable break. Provenance in a comment is not reproducibility.
--
-- WHAT THIS DOES. Creates the function and the event trigger ONLY IF ABSENT, so
-- this migration is a strict no-op on the live database (both already exist
-- there) and does the real work on a rebuilt one. 0009's revoke is guarded and
-- re-applied at the end here, so a fresh database lands on the same grant shape
-- live already has rather than leaving the function executable by PUBLIC.
--
-- ⚠ THE FUNCTION BODY IS A RECONSTRUCTION, not a dump of the live definition.
-- Nothing in the repo ever recorded the original (only its purpose: "a safety
-- net that auto-enables RLS on new public tables"), and it is deliberately NOT
-- `create or replace` — replacing would overwrite live's working definition
-- with this reconstruction. Live keeps its own body; only rebuilt databases use
-- this one. To retire this caveat, diff the two and reconcile:
--     select prosrc from pg_proc where proname = 'rls_auto_enable';
--
-- ⚠ CREATE EVENT TRIGGER REQUIRES SUPERUSER. That is almost certainly why the
-- original was made in the dashboard. On live the trigger already exists so the
-- branch never runs and no privilege is needed; locally the migration role IS
-- superuser, so it succeeds. On a hypothetical fresh HOSTED project the create
-- would fail — hence the explicit insufficient_privilege handler, which downgrades
-- it to a NOTICE rather than aborting the chain a second time in a new way.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. The function — created only when absent.
-- -----------------------------------------------------------------------------
do $outer$
begin
  if not exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where p.proname = 'rls_auto_enable' and n.nspname = 'public'
  ) then
    execute $fn$
      create function public.rls_auto_enable()
        returns event_trigger
        language plpgsql
        security definer
        set search_path = public, pg_catalog
      as $body$
      declare
        obj record;
      begin
        -- The safety net: any table newly created in `public` gets RLS turned
        -- on immediately, so a migration that forgets `enable row level
        -- security` fails closed (no policies = no access) instead of open.
        for obj in
          select * from pg_event_trigger_ddl_commands()
          where command_tag = 'CREATE TABLE' and object_type = 'table'
        loop
          if obj.schema_name = 'public' then
            execute format('alter table %s enable row level security', obj.object_identity);
          end if;
        end loop;
      end;
      $body$;
    $fn$;
  end if;
end
$outer$;

-- -----------------------------------------------------------------------------
-- 2. The event trigger — created only when absent; superuser-tolerant.
-- -----------------------------------------------------------------------------
do $outer$
begin
  if not exists (select 1 from pg_event_trigger where evtname = 'ensure_rls') then
    begin
      execute 'create event trigger ensure_rls on ddl_command_end '
           || 'when tag in (''CREATE TABLE'') '
           || 'execute function public.rls_auto_enable()';
    exception
      when insufficient_privilege then
        raise notice
          'ensure_rls event trigger NOT created (needs superuser). The RLS '
          'safety net is absent on this database; create it from the dashboard '
          'if this is a real environment rather than a throwaway.';
    end;
  end if;
end
$outer$;

-- -----------------------------------------------------------------------------
-- 3. Re-apply 0009's revoke, now that the function certainly exists.
-- -----------------------------------------------------------------------------
-- On live this is a harmless re-revoke. On a rebuilt database it is the line
-- that actually closes the grant, because 0009's copy was skipped by its guard
-- (the function did not exist yet at that point in the chain). Without this, a
-- rebuilt database would leave rls_auto_enable executable by PUBLIC — the exact
-- leak 0009 was written to close.
-- Expected end state (0009's own verification block): {service_role} (+postgres).
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- Parity, not function. Live carries a service_role EXECUTE grant (Supabase's
-- default privileges on functions), and 0009's verification block asserts it.
-- A rebuilt database creates the function under plain Postgres defaults and
-- ends up with {postgres} only, so that check would report a difference that
-- means nothing behaviorally — 0009 states it outright: event triggers do not
-- check EXECUTE at fire time, so no grant is needed for `ensure_rls` to fire.
-- Granting it anyway costs nothing and keeps rebuilt == live, which is the one
-- property this whole migration exists to restore.
grant execute on function public.rls_auto_enable() to service_role;

-- =============================================================================
-- Verification — EXPECT one row: ensure_rls | enabled, and no PUBLIC/anon grant.
-- =============================================================================
-- select evtname, case evtenabled when 'O' then 'enabled' else evtenabled::text end
-- from pg_event_trigger where evtname = 'ensure_rls';
--
-- select coalesce(g.rolname, 'PUBLIC') as grantee
-- from pg_proc p
-- cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
-- left join pg_roles g on g.oid = a.grantee
-- where p.proname = 'rls_auto_enable';

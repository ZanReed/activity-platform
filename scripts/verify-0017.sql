-- =============================================================================
-- verify-0017.sql — author walkthrough for the read-API migration
-- -----------------------------------------------------------------------------
-- Run AFTER applying 0017_read_api.sql; re-run after ANY auth/RLS/grant
-- migration (CLAUDE.md rule). Runner-compatible since the identity slice
-- (DX F1): `pnpm verify:auth` executes the @section blocks; §C1–C5 stay
-- manual by design (they need real published activities — the deployed
-- get-activity Edge Function covers that path over HTTP).
-- =============================================================================

-- @section A-schema
-- @expect-rows
select 'cache_table_rls_forced',
       (select relrowsecurity and relforcerowsecurity from pg_class
        where relname = 'activity_version_reads'), 'enabled + forced';
select 'cache_table_zero_policies',
       (select count(*) from pg_policies where tablename = 'activity_version_reads') = 0,
       'deny-by-default, service-role only';
select 'cache_pk_shape',
       (select pg_get_constraintdef(oid) from pg_constraint
        where conrelid = 'activity_version_reads'::regclass and contype = 'p')
       like '%version_id%sanitizer_rev%', 'composite PK (version_id, sanitizer_rev)';

-- @section B-function-grants
-- @expect-rows
select 'get_published_activity_grants',
       not has_function_privilege('anon', p.oid, 'execute')
       and has_function_privilege('authenticated', p.oid, 'execute')
       and has_function_privilege('service_role', p.oid, 'execute'), 'no anon'
from pg_proc p where p.proname = 'get_published_activity';
select 'get_activity_public_meta_grants',
       has_function_privilege('anon', p.oid, 'execute')
       and has_function_privilege('authenticated', p.oid, 'execute')
       and has_function_privilege('service_role', p.oid, 'execute'),
       'anon deliberate (3.2A meta endpoint)'
from pg_proc p where p.proname = 'get_activity_public_meta';
select 'both_definer_pinned',
       (select count(*) from pg_proc
        where proname in ('get_published_activity', 'get_activity_public_meta')
          and prosecdef
          and array_to_string(coalesce(proconfig, '{}'), ',') like '%search_path%') = 2, '';

-- @section C6-cache-denial
-- @expect-rows
-- The cache table is unreadable by client roles: no policies AND no grant.
select 'cache_denied_to_authenticated',
       not has_table_privilege('authenticated', 'activity_version_reads', 'select'), '';
select 'cache_denied_to_anon',
       not has_table_privilege('anon', 'activity_version_reads', 'select'), '';

-- @section D-acl-completeness
-- @expect-rows
-- The 0016 post-DDL routine, catalog-wide (the ONE copy — DECISIONS + the
-- migrations README both point here): the only public-schema function
-- reachable by anon or PUBLIC is get_activity_public_meta.
select 'anon_reachable_functions',
       (select count(distinct p.proname)
        from pg_proc p
        join pg_namespace n on n.oid = p.pronamespace
        cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
        left join pg_roles g on g.oid = a.grantee
        where n.nspname = 'public' and (g.rolname = 'anon' or a.grantee = 0)) = 1
       and exists (
        select 1 from pg_proc p
        join pg_namespace n on n.oid = p.pronamespace
        where n.nspname = 'public' and p.proname = 'get_activity_public_meta'
          and has_function_privilege('anon', p.oid, 'execute')),
       'exactly one: get_activity_public_meta (the documented 3.2A exception)';

-- ==================== C. Manual behavior checks (unchanged) ==================
-- These need a real published activity; the deployed get-activity function
-- also exercises them over HTTP. Run in the SQL editor when touching the
-- read path itself (not required for grant-surgery re-runs):
--
-- C1. select * from get_activity_public_meta('<published-activity-uuid>');
--     EXPECT: 1 row, title present, teacher_name NULL (post-0021 posture; a
--     non-null name is only correct for a teacher who deliberately set one).
-- C2. Meta on a DRAFT/deleted activity. EXPECT: 0 rows.
-- C3. select * from get_published_activity('<published-activity-uuid>');
--     as postgres (auth.uid() null). EXPECT: ERROR 'Not authorized'.
-- C4. Impersonated authenticated read (set local role + claims). EXPECT: 1 row.
-- C5. Same against a DRAFT. EXPECT: ERROR 'Not available' (no oracle).

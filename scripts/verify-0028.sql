-- verify-0028.sql — grant hygiene (migration 0028).
--
-- Run with `pnpm verify:auth --target live|local` (the runner executes each
-- marked section below and prints per-check PASS/FAIL), or a section at a time
-- in the SQL editor. No DO blocks and no fixtures here: every assertion is a
-- catalog read, so this script writes nothing on any path (P7 trivially).
--
-- (The marker word is deliberately not spelled out in this preamble: the
-- runner's parser matches it at line start anywhere in the file, so prose that
-- names it mints a phantom section whose body is comment text. Harmless — it
-- runs as a no-op — but it shows up in output as a check nobody wrote.
-- verify-0027.sql has the same wart; that is what its "below," row is.)
--
-- WHY THIS EXISTS: the drift 0028 fixes was invisible for weeks because the
-- containment (RLS forced + zero policies) held, so nothing ever leaked and
-- nothing ever failed at runtime. Only the FIRST live verify run caught it.
-- These assertions are therefore written to fail loudly if any future
-- migration re-widens a grant — including the platform default silently
-- re-granting on a newly created table (§C is the anti-recurrence check, and
-- it is the one that would have caught this class on day one).
--
-- P11 note: §A asserts a COUNT of anon-reachable functions, which is a claim
-- about coverage. It is guarded, not asserted blind — the roster is derived
-- from the catalog, not hand-listed, so a new anon-reachable function fails it
-- rather than sneaking past a stale literal.

-- @section A-function-acl
-- @expect-rows
-- Exactly one anon-reachable function: the documented 3.2A meta endpoint.
-- (The same assertion verify-0017 §D makes; repeated here because 0028's
-- finding B was a FUNCTION grant, and this script owns that fix.)
select 'trigger_fn_not_anon_executable',
       not has_function_privilege('anon', 'public.set_classes_updated_at()', 'execute'),
       '0027 finding B: trigger fns need no EXECUTE to fire';
select 'trigger_fn_not_authenticated_executable',
       not has_function_privilege('authenticated', 'public.set_classes_updated_at()', 'execute'),
       '';
-- Roster grew to TWO at 0030 (S9 Drop 2): get_class_public_meta is the join
-- gate's pre-auth class-name lookup, served through get-activity's anonymous
-- meta branch (D-3/E-2). Any THIRD name failing here is the drift this check
-- exists to catch.
select 'anon_reachable_function_roster',
       (select coalesce(array_agg(p.proname::text order by p.proname), '{}')
          from pg_proc p
         where p.pronamespace = 'public'::regnamespace
           and has_function_privilege('anon', p.oid, 'execute'))
       = array['get_activity_public_meta', 'get_class_public_meta'],
       'exactly two: the 3.2A activity meta + the 0030 class meta';

-- @section B-zero-policy-table-grants
-- @expect-rows
-- The seven zero-policy tables deny anon + authenticated at the GRANT layer,
-- so RLS is no longer the only gate. service_role KEEPS its grants (the Edge
-- Functions write the cache and census through it) — asserted, not assumed,
-- because a sweep that also stripped service_role would break get-activity's
-- cache-fill silently and only under load.
select 'no_client_grants_on_zero_policy_tables',
       not exists (
         select 1
           from information_schema.table_privileges
          where table_schema = 'public'
            and grantee in ('anon', 'authenticated')
            and table_name in ('activity_version_census', 'activity_version_items',
                               'activity_version_reads', 'allowlist',
                               'analytics_job_runs', 'audit_log', 'student_domain')
       ),
       'all seven revoked for both client roles';
select 'service_role_grants_survive',
       (select count(distinct table_name)
          from information_schema.table_privileges
         where table_schema = 'public'
           and grantee = 'service_role'
           and privilege_type = 'SELECT'
           and table_name in ('activity_version_census', 'activity_version_items',
                              'activity_version_reads', 'allowlist',
                              'analytics_job_runs', 'audit_log', 'student_domain')
       ) = 7,
       'service_role still reads all seven (cache-fill depends on it)';
select 'rls_still_forced_on_all_seven',
       not exists (
         select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
          where n.nspname = 'public'
            and c.relname in ('activity_version_census', 'activity_version_items',
                              'activity_version_reads', 'allowlist',
                              'analytics_job_runs', 'audit_log', 'student_domain')
            and not (c.relrowsecurity and c.relforcerowsecurity)
       ),
       'the ORIGINAL guard is intact — 0028 added a layer, replaced nothing';

-- @section C-no-new-drift
-- @expect-rows
-- Anti-recurrence, and the check that generalizes the finding: NO zero-policy
-- table anywhere in public may carry a client grant. Derived from the catalog,
-- so a table created by a future migration is covered without editing §B's
-- literal roster — the platform default re-granting on a new table is exactly
-- how this drift arrived, and it must fail here the first time it happens.
select 'no_zero_policy_table_has_client_grants',
       not exists (
         select 1
           from pg_class c
           join pg_namespace n on n.oid = c.relnamespace
          where n.nspname = 'public'
            and c.relkind = 'r'
            and (select count(*) from pg_policies p
                  where p.schemaname = 'public' and p.tablename = c.relname) = 0
            and exists (
              select 1 from information_schema.table_privileges tp
               where tp.table_schema = 'public'
                 and tp.table_name = c.relname
                 and tp.grantee in ('anon', 'authenticated')
            )
       ),
       'catalog-derived: any zero-policy table with a client grant fails here';
select 'policy_bearing_tables_keep_their_grants',
       (select count(*) from information_schema.table_privileges
         where table_schema = 'public' and table_name = 'activities'
           and grantee = 'authenticated' and privilege_type = 'SELECT') = 1,
       'anti-vacuity: the sweep did NOT strip the tables RLS policies need';

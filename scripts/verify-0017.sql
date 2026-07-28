-- =============================================================================
-- verify-0017.sql — author walkthrough for the read-API migration
-- -----------------------------------------------------------------------------
-- Run AFTER applying 0017_read_api.sql. Sections A–C are pure SQL (SQL editor,
-- service role); section D is the post-DDL ACL completeness routine (0016
-- footer rule: the advisor's function lints are DEFINER-only, so run the
-- pg_proc ACL query after every DDL migration). Every query states its
-- EXPECTED result. Anything else = stop and report.
--
-- The end-to-end behavior check (meta fetch, resolve, content + cache fill)
-- runs through the get-activity Edge Function once deployed — Claude verifies
-- that over HTTP after `pnpm deploy:get-activity`.
-- =============================================================================

-- ============================== A. Schema shape ==============================

-- A1. Cache table exists with RLS forced. EXPECT: 1 row, t / t
select relname, relrowsecurity, relforcerowsecurity
from pg_class
where relname = 'activity_version_reads';

-- A2. Zero policies (deny-by-default; service-role only). EXPECT: 0
select count(*) from pg_policies where tablename = 'activity_version_reads';

-- A3. Composite key on (version_id, sanitizer_rev). EXPECT: one PRIMARY KEY
--     constraint over exactly those two columns.
select pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'activity_version_reads'::regclass and contype = 'p';

-- ============================== B. Function grants ===========================

-- B1. EXPECT get_published_activity: authenticated + service_role (+postgres),
--     NO anon, NO PUBLIC. get_activity_public_meta: anon + authenticated +
--     service_role (+postgres), NO PUBLIC.
select p.proname, coalesce(g.rolname, 'PUBLIC') as grantee
from pg_proc p
cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
left join pg_roles g on g.oid = a.grantee
where p.proname in ('get_published_activity', 'get_activity_public_meta')
order by 1, 2;

-- B2. Both pin search_path and are SECURITY DEFINER. EXPECT: 2 rows, both
--     prosecdef = t, proconfig containing search_path=public.
select proname, prosecdef, proconfig
from pg_proc
where proname in ('get_published_activity', 'get_activity_public_meta');

-- ============================== C. Behavior ==================================

-- C1. Anonymous meta on a PUBLISHED activity. EXPECT: 1 row — its title +
--     the owner's display_name. (Run as-is; DEFINER means role doesn't matter
--     for the read, and anon EXECUTE is the deliberate grant.)
--     Substitute any published activity id from your dashboard.
-- select * from get_activity_public_meta('<published-activity-uuid>');

-- C2. Meta on a DRAFT or soft-deleted activity. EXPECT: 0 rows (silent — the
--     Edge Function turns that into a 404).
-- select * from get_activity_public_meta('<draft-activity-uuid>');

-- C3. get_published_activity refuses anonymous callers even if a grant slips.
--     As postgres/service role auth.uid() is NULL, so: EXPECT ERROR
--     'Not authorized'.
-- select * from get_published_activity('<published-activity-uuid>');

-- C4. Impersonated authenticated read (any real user id from public.users —
--     a student works; access is any-authenticated by design).
--     EXPECT: 1 row (current version id + version_num + title), then rollback.
-- begin;
-- set local role authenticated;
-- set local request.jwt.claims = '{"sub":"<real-user-uuid>","role":"authenticated"}';
-- select * from get_published_activity('<published-activity-uuid>');
-- rollback;

-- C5. Same impersonation against a DRAFT activity. EXPECT: ERROR 'Not
--     available' (one message for missing/unpublished/deleted — no oracle).
-- begin;
-- set local role authenticated;
-- set local request.jwt.claims = '{"sub":"<real-user-uuid>","role":"authenticated"}';
-- select * from get_published_activity('<draft-activity-uuid>');
-- rollback;

-- C6. The cache table rejects non-service-role access outright (RLS forced,
--     zero policies + no grants needed by design). EXPECT: 0 rows or
--     permission denied — NEVER data.
-- begin;
-- set local role authenticated;
-- select * from activity_version_reads limit 1;
-- rollback;

-- ============================ D. ACL completeness ============================

-- D1. The 0016 post-DDL routine. EXPECT: exactly ONE function row —
--     get_activity_public_meta with grantee anon (the documented 3.2A
--     exception). Any OTHER row = a missed revoke stanza; stop and report.
select p.proname, coalesce(g.rolname, 'PUBLIC') as grantee
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
left join pg_roles g on g.oid = a.grantee
where n.nspname = 'public'
  and (g.rolname = 'anon' or a.grantee = 0)
order by 1, 2;

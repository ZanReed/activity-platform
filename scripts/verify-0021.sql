-- =============================================================================
-- verify-0021.sql — author walkthrough for the display_name privacy migration
-- -----------------------------------------------------------------------------
-- Run AFTER applying 0021_display_name_privacy.sql (SQL editor, service role).
-- Every query states its EXPECTED result. Anything else = stop and report.
-- Then re-run verify-0013-0014.sql + verify-0017.sql (CLAUDE.md rule for any
-- auth/grant-touching migration — 0021 REPLACEd a function from each).
--
-- The end-to-end behavior check (anon meta fetch shows title + NO email) runs
-- through the get-activity Edge Function / the pre-auth screen — no redeploy
-- is needed (the function calls the RPC live), so just reload /a/:id signed
-- out after applying.
-- =============================================================================

-- ========================= A. Function definitions ===========================

-- A1. Trigger no longer falls back to email. EXPECT: 1 row, f / t
--     (strpos, not LIKE: backslash is LIKE's escape char and these needles
--     carry literal backslashes elsewhere in this file — one idiom throughout.)
select strpos(prosrc, 'coalesce(new.raw_user_meta_data') > 0 as still_has_email_fallback,
       strpos(prosrc, 'nullif(trim(new.raw_user_meta_data') > 0 as has_null_fallback
from pg_proc
where proname = 'handle_new_auth_user';

-- A2. RPC carries the email-shape guard. EXPECT: 1 row, t
select strpos(prosrc, '~ ''\S+@\S+\.\S+''') > 0 as guarded
from pg_proc
where proname = 'get_activity_public_meta';

-- A3. Guard logic sanity — the regex draws the same line as the client's
--     looksLikeEmail. EXPECT: t / t / f / f (emails caught, names pass).
select 'zanreed@gmail.com'   ~ '\S+@\S+\.\S+' as catches_plain_email,
       'a.b@school.k12.us'   ~ '\S+@\S+\.\S+' as catches_subdomain_email,
       'Mrs. Jafari'          ~ '\S+@\S+\.\S+' as false_positive_name,
       'J. R. R. Tolkien'     ~ '\S+@\S+\.\S+' as false_positive_initials;

-- ============================ B. Grants survived =============================

-- B1. REPLACE preserved ACLs. EXPECT: get_activity_public_meta → anon +
--     authenticated + service_role (+postgres), NO PUBLIC;
--     handle_new_auth_user → supabase_auth_admin + service_role (+postgres).
select p.proname, coalesce(g.rolname, 'PUBLIC') as grantee
from pg_proc p
cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
left join pg_roles g on g.oid = a.grantee
where p.proname in ('get_activity_public_meta', 'handle_new_auth_user')
order by 1, 2;

-- =============================== C. Data =====================================

-- C1. Backfill complete — no row still holds its email as its name. EXPECT: 0
select count(*) as fallback_artifacts
from users
where display_name is not null
  and lower(display_name) = lower(email);

-- C2. The live contract — no published activity resolves to an email-shaped
--     teacher_name anymore. EXPECT: 0
select count(*) as leaking_activities
from activities a
join users u on u.id = a.owner_id
where a.deleted_at is null
  and a.status = 'published'
  and (select teacher_name from get_activity_public_meta(a.id)) ~ '\S+@\S+\.\S+';

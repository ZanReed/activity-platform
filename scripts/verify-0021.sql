-- =============================================================================
-- verify-0021.sql — the display_name privacy migration (0021)
-- -----------------------------------------------------------------------------
-- PORTED TO THE RUNNER 2026-11-26 (code review E3). Until then this was an
-- author walkthrough whose EXPECTs were prose; each is now a check row, judged
-- against TODAY's functions (0021's two functions have been replaced since, so
-- a row tests the property 0021 established, not 0021's exact source).
-- Run with `pnpm verify:auth --target live|local --only verify-0021`.
--
-- Everything here is a read: catalog, grants, and two counts over real rows.
-- It runs on live. The end-to-end check (a signed-out /a/:id shows the title
-- and no email) is still a browser check.
-- =============================================================================

-- @section A-functions
-- @expect-rows
-- The signup trigger never falls back to the email as a display name.
-- (strpos, not LIKE: backslash is LIKE's escape char.)
select 'trigger_has_no_email_fallback',
       strpos(prosrc, 'coalesce(new.raw_user_meta_data') = 0
       and strpos(prosrc, 'nullif(trim(new.raw_user_meta_data') > 0,
       'handle_new_auth_user leaves display_name NULL rather than copying the email'
from pg_proc where proname = 'handle_new_auth_user';
-- The anonymous meta RPC refuses to serve an email-shaped teacher name.
select 'public_meta_has_email_guard',
       strpos(prosrc, '~ ''\S+@\S+\.\S+''') > 0,
       'get_activity_public_meta carries the email-shape guard'
from pg_proc where proname = 'get_activity_public_meta';
-- The guard draws the same line as the client's looksLikeEmail.
select 'guard_regex_draws_the_line',
       'someone@example.com' ~ '\S+@\S+\.\S+'
       and 'a.b@school.k12.us' ~ '\S+@\S+\.\S+'
       and not ('Mrs. Jafari' ~ '\S+@\S+\.\S+')
       and not ('J. R. R. Tolkien' ~ '\S+@\S+\.\S+'),
       'emails match; names with dots and initials do not';

-- @section B-grants
-- @expect-rows
select 'public_meta_grants',
       has_function_privilege('anon', 'public.get_activity_public_meta(uuid)', 'execute')
       and has_function_privilege('authenticated', 'public.get_activity_public_meta(uuid)', 'execute')
       and not exists (select 1 from pg_proc p
                        cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
                       where p.proname = 'get_activity_public_meta' and a.grantee = 0),
       'anon + authenticated may call get_activity_public_meta; PUBLIC holds no grant';
select 'trigger_grants',
       has_function_privilege('supabase_auth_admin', 'public.handle_new_auth_user()', 'execute')
       and not has_function_privilege('anon', 'public.handle_new_auth_user()', 'execute')
       and not has_function_privilege('authenticated', 'public.handle_new_auth_user()', 'execute'),
       'only the auth admin (and service roles) run the signup trigger';

-- @section C-data
-- @expect-rows
select 'no_email_as_display_name',
       count(*) = 0,
       count(*) || ' users whose display_name is their email'
from users
where display_name is not null and lower(display_name) = lower(email);
-- The guard is the second line of defence; the first is that no owner of a
-- published activity has an email-shaped name for it to catch. (Asking the
-- RPC itself could never fail: it returns NULL for such a name.)
select 'no_email_shaped_owner_name',
       count(*) = 0,
       count(*) || ' published activities whose owner''s display_name is email-shaped'
from activities a
join users u on u.id = a.owner_id
where a.deleted_at is null
  and a.status = 'published'
  and u.display_name ~ '\S+@\S+\.\S+';

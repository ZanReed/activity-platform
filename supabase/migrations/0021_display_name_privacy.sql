-- =============================================================================
-- 0021_display_name_privacy.sql — teacher display_name must never be an email
-- -----------------------------------------------------------------------------
-- Found live 2026-07-31 (recorded in STATE): get_activity_public_meta returned
-- teacher_name = the author's email on the ANONYMOUS pre-auth screen, because
-- handle_new_auth_user (0013, inherited from 0003) stores
-- coalesce(full_name, email) and Google supplied no full_name for that account.
-- Ruling 3.2A's "teacher display name" meant a NAME ("Mrs. Jafari") — an email
-- address on a page anyone with the link can open is a privacy leak, not
-- attribution. The client already suppresses email-shaped values
-- (StudentViewer's looksLikeEmail guard); this migration fixes the server so
-- the client guard is a belt, not the only defense. Three layers (author
-- ruling 2026-08-04):
--
--   1. handle_new_auth_user stops falling back to email. display_name is
--      nullable BY DESIGN (0017's meta contract documents the null case and
--      the client ships fallback copy), so NULL is the correct "Google gave
--      us no name" state — not an address the user never chose to publish.
--
--   2. get_activity_public_meta refuses to RETURN an email-shaped value, so
--      no future consumer of the anon RPC can leak one regardless of what the
--      column holds (e.g. a user whose Google-supplied full_name IS their
--      email — layer 1 can't catch that one).
--
--   3. Backfill: rows where the 0003/0013 fallback stored the email are reset
--      to NULL. The author's row deliberately goes to NULL rather than a
--      hand-picked name (ruling 2026-08-04): neutral attribution ("your
--      teacher") until the teacher-facing "how your name appears to students"
--      control exists — that control is BACKLOGGED, not designed here.
--
-- Nothing here changes function signatures, grants, or RLS: both functions are
-- CREATE OR REPLACEd, which preserves ACLs (the 0013 footer documents this for
-- the trigger; same mechanics for the RPC's 0017 grants incl. the deliberate
-- anon EXECUTE).

-- -----------------------------------------------------------------------------
-- 1. handle_new_auth_user — store a name or nothing, never the email
-- -----------------------------------------------------------------------------
-- Byte-identical to the 0013 version except the display_name expression:
-- nullif(trim(full_name), '') instead of coalesce(full_name, email). trim
-- also keeps a whitespace-only Google name from becoming a "present" name.
create or replace function handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_domain text := lower(split_part(new.email, '@', 2));
begin
  if exists (select 1 from public.allowlist where email = new.email) then
    -- Teacher path: role defaults to 'teacher'.
    insert into public.users (id, email, display_name)
    values (
      new.id,
      new.email,
      nullif(trim(new.raw_user_meta_data->>'full_name'), '')
    );
  elsif exists (select 1 from public.student_domain where domain = v_domain) then
    -- Student path: admitted by district domain.
    insert into public.users (id, email, display_name, role)
    values (
      new.id,
      new.email,
      nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
      'student'
    );
  else
    raise exception 'Email % is not permitted to sign up', new.email;
  end if;

  insert into public.audit_log (actor_id, action, target_type, target_id)
  values (new.id, 'user.create', 'user', new.id);

  return new;
end;
$$;

-- (on_auth_user_created keeps pointing here; grants from 0009 —
-- supabase_auth_admin + service_role only — survive REPLACE.)

-- -----------------------------------------------------------------------------
-- 2. get_activity_public_meta — never return an email-shaped teacher_name
-- -----------------------------------------------------------------------------
-- Same contract as 0017 (title + teacher name, nothing else; teacher_name may
-- be null and the client supplies fallback copy). The email-shape test mirrors
-- the client's looksLikeEmail (\S+@\S+\.\S+) so both layers draw the same
-- line. Grants (anon, authenticated, service_role — the documented 3.2A anon
-- exception) survive REPLACE.
create or replace function get_activity_public_meta(p_activity_id uuid)
returns table (title text, teacher_name text)
language sql
stable
security definer
set search_path = public
as $$
  select a.title,
         case
           when u.display_name ~ '\S+@\S+\.\S+' then null
           else nullif(trim(u.display_name), '')
         end as teacher_name
  from activities a
  join users u on u.id = a.owner_id
  where a.id = p_activity_id
    and a.deleted_at is null
    and a.status = 'published';
$$;

-- -----------------------------------------------------------------------------
-- 3. Backfill — erase the fallback artifact
-- -----------------------------------------------------------------------------
-- Scoped to display_name = email (case-insensitive): that is exactly what the
-- old coalesce stored, so this cannot clobber a name a user actually chose.
-- Deliberately NOT "any email-shaped value" — layer 2 makes rendering such a
-- value impossible, and rewriting a deliberately-set (if odd) name is more
-- invasive than the leak it would prevent. No audit_log rows: this is data
-- repair of a trigger artifact, not a user action (same reasoning 0017/0020
-- used to keep non-actions out of audit_log).
update public.users
set display_name = null
where display_name is not null
  and lower(display_name) = lower(email);

-- =============================================================================
-- Verification — spot checks (scripts/verify-0021.sql is the full pass; also
-- re-run scripts/verify-0013-0014.sql + scripts/verify-0017.sql per the
-- CLAUDE.md rule for auth/grant-touching migrations)
-- =============================================================================
--
-- -- 1. Trigger no longer embeds an email fallback. EXPECT: f.
-- select strpos(prosrc, 'coalesce(new.raw_user_meta_data') > 0 as still_leaky
-- from pg_proc where proname = 'handle_new_auth_user';
--
-- -- 2. RPC guard present (strpos, not LIKE — backslash is LIKE's escape
-- --    char, so a LIKE pattern with \S never matches). EXPECT: t.
-- select strpos(prosrc, '~ ''\S+@\S+\.\S+''') > 0 as guarded
-- from pg_proc where proname = 'get_activity_public_meta';
--
-- -- 3. Grants unchanged by REPLACE. EXPECT: get_activity_public_meta →
-- --    {anon, authenticated, service_role} (+postgres), no PUBLIC;
-- --    handle_new_auth_user → {supabase_auth_admin, service_role} (+postgres).
-- select p.proname, coalesce(g.rolname, 'PUBLIC') as grantee
-- from pg_proc p
-- cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
-- left join pg_roles g on g.oid = a.grantee
-- where p.proname in ('get_activity_public_meta', 'handle_new_auth_user')
-- order by 1, 2;
--
-- -- 4. Backfill complete. EXPECT: 0.
-- select count(*) from users
-- where display_name is not null and lower(display_name) = lower(email);

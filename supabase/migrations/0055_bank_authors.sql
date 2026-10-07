-- =============================================================================
-- 0055_bank_authors.sql — Activity Bank authors: opt-in names, colleagues list
--                         their own, copies never listed
-- -----------------------------------------------------------------------------
-- The author's rulings of 2026-10-07 after 0054 went live
-- (docs/design/activity-bank.md BK-11…BK-13):
--
--   BK-12  Allowlisted colleagues (caps-exempt teachers) may list THEIR OWN
--          activities — 0054 already allowed that — but NEVER a copy taken
--          from the Bank (the July design's "branches are never listable",
--          not carried into 0054). Enforced at the toggle and, as a belt, in
--          list_bank, which never returns a copy.
--   BK-13  An author's name appears on their Bank cards ONLY after they set it
--          themselves (the 2026-08-04 ruling: default to showing nothing,
--          opt IN). users.display_name alone cannot carry that: a self-serve
--          teacher's display_name is filled from Google's full_name at signup
--          (STATE flags it), so showing it would publish names nobody chose.
--          The opt-in is recorded as users.name_opt_in_at, written only by
--          set_public_name().
--
--   §A  users.name_opt_in_at
--   §B  set_public_name(p_name)  — set (opt in) or clear (opt out) one's name
--   §C  set_activity_listing     — 0054's body + "a Bank copy cannot be listed"
--   §D  list_bank                — + author_name (opted-in names only), never
--                                  a copy (return shape changes → drop+create)
--   §E  grants
--
-- PERSONAL DATA. The name is now visible to OTHER TEACHERS on listed
-- activities, and only once its owner opted in. data-map.md (draft-22)
-- records the new recipient; nothing new is collected.
--
-- ORDER (OV-7). Apply BEFORE pushing the app that reads author_name or calls
-- set_public_name. The page live before this migration ignores author_name.
-- =============================================================================

alter type audit_action add value if not exists 'user.set_public_name';

-- -----------------------------------------------------------------------------
-- A. the opt-in record
-- -----------------------------------------------------------------------------
alter table users add column name_opt_in_at timestamptz;

comment on column users.name_opt_in_at is
  'When this teacher chose to show users.display_name as their author name in the Activity Bank (0055, BK-13). NULL = not opted in: their Bank cards carry no name, whatever display_name holds. Written only by set_public_name().';

-- -----------------------------------------------------------------------------
-- B. set_public_name — opt in with a name, or opt out with an empty one
-- -----------------------------------------------------------------------------
-- A name is 1–80 characters after trimming and never email-shaped (0021's
-- rule: attribution is a NAME). Opting out clears the opt-in; display_name is
-- left as it is (it also serves the students' pre-auth screen, which this
-- arc does not change).
create or replace function set_public_name(p_name text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text := nullif(btrim(coalesce(p_name, '')), '');
  v_old  text;
begin
  if not current_user_is_teacher() then
    raise exception 'Only teachers have a public name';
  end if;

  select display_name into v_old from users where id = auth.uid();

  if v_name is null then
    update users set name_opt_in_at = null, updated_at = now() where id = auth.uid();
  else
    if length(v_name) > 80 then
      raise exception 'A name is at most 80 characters';
    end if;
    if v_name ~ '\S+@\S+\.\S+' then
      raise exception 'Use a name, not an email address';
    end if;
    update users
    set display_name = v_name, name_opt_in_at = now(), updated_at = now()
    where id = auth.uid();
  end if;

  insert into audit_log (actor_id, action, target_type, target_id, metadata)
  values (auth.uid(), 'user.set_public_name', 'user', auth.uid(),
          jsonb_build_object('opted_in', v_name is not null,
                             'name_changed', v_name is not null and v_name is distinct from v_old));

  return jsonb_build_object('display_name', coalesce(v_name, v_old),
                            'opted_in', v_name is not null);
end;
$$;

-- -----------------------------------------------------------------------------
-- C. set_activity_listing — 0054's body, plus BK-12's copy refusal
-- -----------------------------------------------------------------------------
create or replace function set_activity_listing(p_activity_id uuid, p_listed boolean)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row activities%rowtype;
begin
  if not can_edit_activity(p_activity_id) then
    raise exception 'Not your activity';
  end if;

  select * into v_row from activities where id = p_activity_id;

  if p_listed then
    if not is_bank_lister() then
      raise exception 'Only the Activity Bank''s curator can list activities';
    end if;
    if v_row.copied_from_activity_id is not null then
      raise exception 'A copy from the Activity Bank cannot be listed';
    end if;
    if v_row.status <> 'published' or v_row.current_version_id is null then
      raise exception 'Publish this activity before listing it';
    end if;
    if v_row.is_for_sale then
      raise exception 'An activity for sale cannot be listed in the free Bank';
    end if;
    if bank_version_is_assessment(v_row.current_version_id) then
      raise exception 'Quizzes and exams are never listed in the Activity Bank';
    end if;
  end if;

  update activities
  set visibility = case when p_listed then 'public'::activity_visibility
                        else 'private'::activity_visibility end,
      updated_at = now()
  where id = p_activity_id;

  insert into audit_log (actor_id, action, target_type, target_id, metadata)
  values (auth.uid(),
          (case when p_listed then 'activity.bank_list' else 'activity.bank_unlist' end)::audit_action,
          'activity', p_activity_id,
          jsonb_build_object('previous', v_row.visibility));

  return case when p_listed then 'public' else 'private' end;
end;
$$;

-- -----------------------------------------------------------------------------
-- D. list_bank — + author_name; never a copy
-- -----------------------------------------------------------------------------
drop function list_bank();

create function list_bank()
returns table (
  id               uuid,
  title            text,
  description      text,
  course           text,
  unit             text,
  tags             text[],
  pedagogical_role pedagogical_role,
  activity_type    text,
  source_path      text,
  has_guide        boolean,
  version_num      integer,
  published_at     timestamptz,
  author_name      text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not current_user_is_teacher() then
    raise exception 'The Activity Bank is for teachers';
  end if;

  return query
  select a.id, a.title, a.description, a.course, a.unit, a.tags,
         a.pedagogical_role,
         coalesce(v.content -> 'meta' ->> 'activityType', 'worksheet'),
         a.source_path,
         jsonb_typeof(v.content -> 'teacherGuide') = 'object',
         v.version_num,
         v.created_at,
         -- Opted-in names only (BK-13), and never an email (0021's rule,
         -- re-applied in case display_name was set by another path).
         case when u.name_opt_in_at is not null
                   and u.display_name !~ '\S+@\S+\.\S+'
              then nullif(btrim(u.display_name), '')
         end
  from activities a
  join activity_versions v on v.id = a.current_version_id
  join users u on u.id = a.owner_id
  where a.visibility = 'public'
    and a.status = 'published'
    and a.deleted_at is null
    and not a.is_for_sale
    and a.copied_from_activity_id is null
    and coalesce(v.content -> 'meta' ->> 'activityType', '') not in ('quiz', 'exam')
  order by a.course, a.unit nulls last, a.source_path nulls last, a.title;
end;
$$;

-- -----------------------------------------------------------------------------
-- E. grants (0009 discipline: authenticated only)
-- -----------------------------------------------------------------------------
revoke execute on function set_public_name(text) from public, anon;
grant execute on function set_public_name(text) to authenticated, service_role;
revoke execute on function list_bank() from public, anon;
grant execute on function list_bank() to authenticated, service_role;
-- set_activity_listing keeps 0054's grants (create or replace preserves them).

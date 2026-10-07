-- =============================================================================
-- 0054_activity_bank.sql — the Activity Bank: list, browse, copy-on-use
-- -----------------------------------------------------------------------------
-- docs/design/activity-bank.md, rulings BK-1…BK-10 (author, 2026-10-07, all as
-- recommended). Any teacher who makes an account can browse the author's
-- LISTED activities and add a copy to their own library, "like the importer
-- does": the copy is an activity THEY own, so every owner-gated surface
-- (share to class, Responses, grading, analytics, print, editor, teacher guide)
-- already works for it, scoped to that teacher, with no change.
--
--   §A  provenance on activities (copied_from_activity_id / _version_id) + the
--       GIN index on tags that 0037 deferred to "the Bank's catalog RPC"
--   §B  is_bank_lister()            — caps-exempt teacher or admin (BK-3)
--   §C  set_activity_listing()      — the author's toggle (BK-3/BK-4)
--   §D  list_bank()                 — browse, catalogue-safe columns only (BK-5)
--   §E  get_bank_teacher_guide()    — the guide before copying (BK-6)
--   §F  copy_bank_activity()        — the copy, PUBLISHED on arrival (BK-1/2)
--   §G  glossary_for_activity       — per-term fallback to the source owner's
--                                     course glossary for copies (BK-7)
--   §H  grants
--
-- THE LISTING FLAG is the existing, never-used `activities.visibility`
-- (0001:96): listed = visibility 'public' AND published AND not deleted AND
-- not is_for_sale. Nothing in packages/ read or wrote the column before this.
--
-- WHAT IS NEVER WIDENED. can_read_activity / can_edit_activity stay owner-only
-- (0042 calls widening them "the Activity-Bank landmine"). Every Bank read is a
-- SECURITY DEFINER function returning a fixed column subset; none returns
-- draft_content, and only copy_bank_activity touches a document — the source's
-- CURRENT PUBLISHED version, never its draft.
--
-- ASSESSMENTS ARE NEVER LISTED (BK-8; curriculum D51 ruling 12). A version
-- whose meta.activityType is 'quiz' or 'exam' cannot be listed, is hidden from
-- list_bank, and cannot be copied — enforced at all three, because a listed
-- activity can later be republished as a quiz.
--
-- NO PERSONAL DATA. The provenance columns point at activities and versions,
-- never at people; the audit rows carry the actor as every other RPC does.
--
-- ORDER (OV-7). Apply BEFORE pushing the app that calls these RPCs. The page
-- deployed before this migration calls none of them.
-- =============================================================================

-- Three new audit actions (audit_log.action is an enum; the 0045/0050
-- pattern). Used only inside function bodies, so adding them in this
-- transaction is safe.
alter type audit_action add value if not exists 'activity.bank_list';
alter type audit_action add value if not exists 'activity.bank_unlist';
alter type audit_action add value if not exists 'activity.bank_copy';

-- -----------------------------------------------------------------------------
-- A. provenance + the tags index
-- -----------------------------------------------------------------------------
alter table activities
  add column copied_from_activity_id uuid references activities(id) on delete set null,
  add column copied_from_version_id  uuid references activity_versions(id) on delete set null;

comment on column activities.copied_from_activity_id is
  'Activity Bank provenance (0054, BK-1): the listed activity this one was copied from. NULL for authored/imported activities. Read for the "From the Activity Bank" marker and the glossary fallback (BK-7).';
comment on column activities.copied_from_version_id is
  'Activity Bank provenance (0054, BK-1): the source version copied. Kept for the later "newer version in the Bank" notice (BK-9, not built).';

create index activities_copied_from_idx
  on activities (copied_from_activity_id)
  where copied_from_activity_id is not null;

-- 0037 deferred this to "the Bank's catalog RPC migration": list_bank filters
-- on tags client-side today, but a listed-rows-only GIN index is the cheap
-- seam for a server-side tag filter.
create index activities_listed_tags_gin
  on activities using gin (tags)
  where visibility = 'public' and deleted_at is null and status = 'published';

-- -----------------------------------------------------------------------------
-- B. who may list (BK-3): caps-exempt teachers (the allowlist; in practice the
--    author) and admins. Self-attested teachers can browse and copy, not list.
-- -----------------------------------------------------------------------------
create or replace function is_bank_lister()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from users
    where id = auth.uid()
      and deleted_at is null
      and (role = 'admin' or (role = 'teacher' and teacher_caps_exempt))
  );
$$;

-- An activity's CURRENT published version is an assessment (D51).
create or replace function bank_version_is_assessment(p_version_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select v.content -> 'meta' ->> 'activityType' in ('quiz', 'exam')
     from activity_versions v where v.id = p_version_id),
    false);
$$;

-- -----------------------------------------------------------------------------
-- C. set_activity_listing — the author's toggle (BK-3, BK-4)
-- -----------------------------------------------------------------------------
-- Listing requires: the caller can edit it AND is a Bank lister; the activity
-- is published with a current version; it is not for sale; its current
-- version is not an assessment. Unlisting needs only edit rights (anyone may
-- take their own activity out). Copies already made are untouched either way.
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
-- D. list_bank — browse (BK-5). Teachers only; catalogue-safe columns only.
-- -----------------------------------------------------------------------------
create or replace function list_bank()
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
  published_at     timestamptz
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
         v.created_at
  from activities a
  join activity_versions v on v.id = a.current_version_id
  where a.visibility = 'public'
    and a.status = 'published'
    and a.deleted_at is null
    and not a.is_for_sale
    and coalesce(v.content -> 'meta' ->> 'activityType', '') not in ('quiz', 'exam')
  order by a.course, a.unit nulls last, a.source_path nulls last, a.title;
end;
$$;

-- -----------------------------------------------------------------------------
-- E. get_bank_teacher_guide — read the guide before copying (BK-6)
-- -----------------------------------------------------------------------------
-- Returns ONLY the current version's teacherGuide (or NULL when it has none).
-- NULL as well when the activity is not listed — no signal distinguishes
-- "unlisted" from "no guide", so the call cannot probe private activities.
create or replace function get_bank_teacher_guide(p_activity_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_guide jsonb;
begin
  if not current_user_is_teacher() then
    raise exception 'The Activity Bank is for teachers';
  end if;

  select v.content -> 'teacherGuide' into v_guide
  from activities a
  join activity_versions v on v.id = a.current_version_id
  where a.id = p_activity_id
    and a.visibility = 'public'
    and a.status = 'published'
    and a.deleted_at is null
    and not a.is_for_sale
    and coalesce(v.content -> 'meta' ->> 'activityType', '') not in ('quiz', 'exam');

  return v_guide;
end;
$$;

-- -----------------------------------------------------------------------------
-- F. copy_bank_activity — add a copy to the caller's library (BK-1, BK-2)
-- -----------------------------------------------------------------------------
-- The copy is owned by the caller, copies the source's CURRENT PUBLISHED
-- version verbatim (block ids need only be unique within an activity), and
-- arrives PUBLISHED through publish_activity itself — so it is stamped exactly
-- like any other publish and can be shared to a class at once (BK-2).
-- NEVER copied: the catalogue identity (source_path / source_key /
-- source_fingerprint — a copy is not file-backed, so the batch importer never
-- touches it), visibility (forced private), sale fields.
create or replace function copy_bank_activity(p_activity_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_src     activities%rowtype;
  v_content jsonb;
  v_base    text;
  v_slug    text;
  v_try     integer := 0;
  v_new_id  uuid;
begin
  if not current_user_is_teacher() then
    raise exception 'The Activity Bank is for teachers';
  end if;

  select * into v_src
  from activities a
  where a.id = p_activity_id
    and a.visibility = 'public'
    and a.status = 'published'
    and a.deleted_at is null
    and not a.is_for_sale;
  if not found or v_src.current_version_id is null then
    raise exception 'That activity is not in the Activity Bank';
  end if;

  select v.content into v_content
  from activity_versions v where v.id = v_src.current_version_id;
  if coalesce(v_content -> 'meta' ->> 'activityType', '') in ('quiz', 'exam') then
    raise exception 'That activity is not in the Activity Bank';
  end if;

  -- unique (owner_id, slug): the app's ladder (lib/slug.ts) — base, base-2…
  -- base-5, then a short random suffix.
  v_base := v_src.slug;
  v_slug := v_base;
  while exists (select 1 from activities where owner_id = auth.uid() and slug = v_slug) loop
    v_try := v_try + 1;
    v_slug := case when v_try <= 4 then v_base || '-' || (v_try + 1)
                   else v_base || '-' || substr(md5(random()::text), 1, 6) end;
  end loop;

  insert into activities (
    owner_id, title, slug, course, unit, description, tags, pedagogical_role,
    status, visibility, draft_content,
    copied_from_activity_id, copied_from_version_id)
  values (
    auth.uid(), v_src.title, v_slug, v_src.course, v_src.unit, v_src.description,
    v_src.tags, v_src.pedagogical_role,
    'draft', 'private', v_content,
    v_src.id, v_src.current_version_id)
  returning id into v_new_id;

  -- Version 1, through the one publish path (stamps course/unit, audits).
  perform publish_activity(v_new_id);

  insert into audit_log (actor_id, action, target_type, target_id, metadata)
  values (auth.uid(), 'activity.bank_copy', 'activity', v_new_id,
          jsonb_build_object('source_activity_id', v_src.id,
                             'source_version_id', v_src.current_version_id));

  return v_new_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- G. glossary_for_activity — per-term fallback for copies (BK-7)
-- -----------------------------------------------------------------------------
-- 0043's body, plus: when the activity was copied from the Bank, terms the
-- copy owner's own store lacks are read from the SOURCE owner's store. The
-- copy owner's entry for a term always wins. Marks already carry a baked body
-- (glossary design L3), so this only restores the live panel and search.
create or replace function glossary_for_activity(p_activity_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_owner     uuid;
  v_src_owner uuid;
  v_total     integer;
  v_entries   jsonb;
begin
  if auth.uid() is null then
    raise exception 'Not authorized';
  end if;

  select a.owner_id, s.owner_id into v_owner, v_src_owner
  from activities a
  left join activities s on s.id = a.copied_from_activity_id
  where a.id = p_activity_id
    and a.deleted_at is null
    and a.status = 'published';
  if not found then
    return null;
  end if;

  with merged as (
    select g.* from glossary_entry g where g.owner_id = v_owner
    union all
    select g.* from glossary_entry g
    where v_src_owner is not null
      and v_src_owner <> v_owner
      and g.owner_id = v_src_owner
      and not exists (select 1 from glossary_entry o
                      where o.owner_id = v_owner and o.term_id = g.term_id)
  )
  select count(*) into v_total from merged;

  with merged as (
    select g.* from glossary_entry g where g.owner_id = v_owner
    union all
    select g.* from glossary_entry g
    where v_src_owner is not null
      and v_src_owner <> v_owner
      and g.owner_id = v_src_owner
      and not exists (select 1 from glossary_entry o
                      where o.owner_id = v_owner and o.term_id = g.term_id)
  )
  select coalesce(
           jsonb_agg(
             jsonb_build_object(
               'term_id',  m.term_id,
               'term',     m.term,
               'variants', m.variants,
               'body',     m.body,
               'retired',  m.retired_at is not null)
             order by m.term, m.term_id),
           '[]'::jsonb)
    into v_entries
  from (select * from merged order by term, term_id limit 2000) m;  -- = GLOSSARY_MAX_ENTRIES

  return jsonb_build_object('entries', v_entries, 'capped', v_total > 2000);
end;
$$;

comment on function glossary_for_activity(uuid) is
  'Student read of a published activity''s owner glossary as ONE jsonb (0043 EN-1). 0054 (BK-7): a Bank copy falls back, per term, to its source owner''s store. NULL when the activity is not published. Gate = 0017''s predicate, never can_read_activity.';

-- -----------------------------------------------------------------------------
-- H. grants (0009 discipline: authenticated only)
-- -----------------------------------------------------------------------------
revoke execute on function is_bank_lister() from public, anon;
grant execute on function is_bank_lister() to authenticated, service_role;
revoke execute on function bank_version_is_assessment(uuid) from public, anon, authenticated;
grant execute on function bank_version_is_assessment(uuid) to service_role;
revoke execute on function set_activity_listing(uuid, boolean) from public, anon;
grant execute on function set_activity_listing(uuid, boolean) to authenticated, service_role;
revoke execute on function list_bank() from public, anon;
grant execute on function list_bank() to authenticated, service_role;
revoke execute on function get_bank_teacher_guide(uuid) from public, anon;
grant execute on function get_bank_teacher_guide(uuid) to authenticated, service_role;
revoke execute on function copy_bank_activity(uuid) from public, anon;
grant execute on function copy_bank_activity(uuid) to authenticated, service_role;

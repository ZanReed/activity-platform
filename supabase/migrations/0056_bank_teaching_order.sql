-- =============================================================================
-- 0056_bank_teaching_order.sql — the Activity Bank lists units in TEACHING
--                                order, not alphabetically
-- -----------------------------------------------------------------------------
-- 0054/0055's list_bank ordered by course → unit NAME → source path. Within a
-- unit that is teaching order, but ACROSS units it is alphabetical: with Year 7
-- holding two units for the first time (2026-10-08), "Angles and Parallel
-- Lines" (713) came before "Triangles and Angle Sums" (712). The catalogue's
-- source_path already encodes the teaching order (the chain folder's number,
-- then the file's), which is exactly what the Activities list orders by.
--
-- New order: course → source_path → unit → title. Catalogue rows follow their
-- chain folders; rows with no source_path (a colleague's hand-made activities)
-- follow them, grouped by unit. The Bank page groups CONSECUTIVE rows by
-- course + unit, so each catalogue unit stays one block.
--
-- Body otherwise byte-identical to 0055's; same return shape, so CREATE OR
-- REPLACE keeps 0055's grants. No app change. No personal data.
-- =============================================================================

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
  order by a.course, a.source_path nulls last, a.unit nulls last, a.title;
end;
$$;

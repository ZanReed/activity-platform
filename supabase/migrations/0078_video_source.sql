-- =============================================================================
-- 0078_video_source.sql — who gets a clip's URL (D64 slice 2, D73)
-- -----------------------------------------------------------------------------
-- docs/design/video-pause-points.md VP-7, VP-8. The served copy has no URL for
-- anyone, so this read is the gate. A row comes back only when:
--   - the caller owns the activity (a teacher reviews their own clip, stale or
--     not, cleared or not); or
--   - the activity is published, D73's setting is on and the clip isn't stale.
-- Anything else returns no rows, with no message saying which rule failed.
--
-- ⚠ Turning the setting on exposes students' devices to a third-party host. It
-- is an author action, after the VP-8 checklist in TODOS. verify-0078 fails while
-- it is on, and that row is removed on purpose when the checklist is done.
-- =============================================================================

-- A singleton. A missing row reads as off.
create table video_clearance (
  id         boolean primary key default true check (id),
  cleared    boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table video_clearance enable row level security;
alter table video_clearance force row level security;

comment on table video_clearance is
  'D73: whether students may get pause-point clips (0078). Zero policies: read through video_source, changed by the author in SQL after the VP-8 checklist.';

insert into video_clearance (cleared) values (false);

create function video_source(p_activity_id uuid, p_version_id uuid, p_block_id uuid)
returns table (url text, captions text)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_owner  uuid;
  v_status text;
  v_block  jsonb;
begin
  if auth.uid() is null then
    raise exception 'Not authorized';
  end if;

  select a.owner_id, a.status::text,
         jsonb_path_query_first(
           v.content,
           '$.sections[*].rows[*].columns[*].blocks[*] ? (@.type == "video" && @.id == $id)',
           jsonb_build_object('id', p_block_id::text))
    into v_owner, v_status, v_block
  from activities a
  join activity_versions v on v.activity_id = a.id
  where a.id = p_activity_id
    and v.id = p_version_id
    and a.deleted_at is null;

  if v_block is null or v_block->>'url' is null then
    return;
  end if;

  if v_owner is distinct from auth.uid() then
    if v_status <> 'published'
       or coalesce((v_block->>'stale')::boolean, true)
       or not coalesce((select c.cleared from video_clearance c), false) then
      return;
    end if;
  end if;

  url := v_block->>'url';
  captions := v_block->>'captions';
  return next;
end;
$$;

revoke execute on function video_source(uuid, uuid, uuid) from public, anon;
grant execute on function video_source(uuid, uuid, uuid) to authenticated, service_role;

-- =============================================================================
-- 0093_student_work_photos.sql — private storage for students' photos of their
-- working (media submissions slice 1; docs/design/media-submissions.md, ruled
-- 2026-11-18, MS-1..MS-25)
-- -----------------------------------------------------------------------------
-- This migration adds STORAGE AND RECORD ONLY. No student can create a photo
-- yet: there is no photo_response block, `photo_clearance` ships OFF, and
-- reserve_work_photo refuses while it is off. Slice 2 adds the block and the
-- check wire, slice 3 the teacher read, slice 5 turns it on.
--
-- What is here, and why each piece:
--
--   A. The `student-work` bucket. PRIVATE (unlike 0019's activity-images): a
--      photo of a student's working is personal data (§6). JPEG only, because
--      the client re-encodes every photo (which is also what strips EXIF/GPS,
--      MS-5); 1.5 MB is the post-re-encode ceiling. Both limits are
--      load-bearing, as 0019's are.
--   B. `photo_clearance`, the student-facing switch (MS-12), the 0078
--      video_clearance pattern: a singleton, off, changed by the author in SQL
--      after the slice-5 checklist. verify-0093 fails while it is on, and that
--      row is removed on purpose when the checklist is done.
--   C. `work_photos`, one row per photo, written BEFORE the upload (the
--      reservation, §6.2). The row comes first so no object can exist without
--      one: in the other order a client that skipped the registration call
--      would leave bytes nothing ever deletes. The object key is derived from
--      the row (`object_name`), never chosen by the client.
--   D. `work_photo_deletions` + an AFTER DELETE trigger. Deleting the ROW is
--      how every path removes a photo (retention, account purge, activity
--      purge — all by CASCADE). Deleting the BYTES is not a SQL operation:
--      storage.objects carries a `protect_objects_delete` statement trigger
--      (measured on the local stack 2026-11-18), so the bytes go through the
--      Storage API, from the sweep-work-photos Edge Function. The queue is the
--      hand-over between the two.
--   E. The two storage.objects policies, each one helper call (CLAUDE.md:
--      never inline ownership checks). Both helpers compare the full object
--      name as TEXT against `work_photos.object_name`, so there is no uuid
--      cast to guard (0019's CASE hazard does not arise) and depth / layout are
--      enforced by exact match.
--   F. reserve_work_photo — the student's one write, and the gate.
--   G. The sweep's service-only SQL (dry-run by default, unscheduled) and the
--      cost meter (MS-13).
--
-- ⚠ sweep_work_photos_due DELETES STUDENT WORK. It ships dry-run by default
-- and UNSCHEDULED, like every prune here; arming it (a pg_cron job calling the
-- Edge Function with dryRun:false) is a slice-5 author action that must
-- happen BEFORE photo_clearance goes on (MS-11: the opposite order from the
-- other prunes, because an unarmed sweep means photos outlive the window
-- counsel was told about). verify-0093's sweep_is_unscheduled row fails if a
-- cron job names it; that row is replaced by a schedule pin at arming.
--
-- Deliberately ABSENT (do not add without a design pass):
--   * an UPDATE policy on student-work — objects are immutable; a retake is a
--     new photo (and UPDATE is what an upsert needs, so overwrite stays dead);
--   * a client DELETE policy — removal is the sweep's, by the row;
--   * any client grant on the three tables — every read and write is a
--     DEFINER function;
--   * a SELECT branch for can_read_activity — the Activity-Bank landmine
--     (0034 G3): a widened READ helper must never grant a view of students'
--     work. The teacher branch is can_edit_activity, and only for photos a
--     check has attached.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A. The bucket. Idempotent: a re-run reconciles the limits.
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'student-work',
  'student-work',
  false,
  1572864, -- 1.5 MB after the client's re-encode (MS-5)
  array['image/jpeg']::text[]
)
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- -----------------------------------------------------------------------------
-- B. photo_clearance. A missing row reads as off.
-- -----------------------------------------------------------------------------
create table photo_clearance (
  id         boolean primary key default true check (id),
  cleared    boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table photo_clearance enable row level security;
alter table photo_clearance force row level security;

comment on table photo_clearance is
  'MS-12: whether students may add photos of their working (0093). Zero policies: read by reserve_work_photo and the check path, changed by the author in SQL after the slice-5 checklist (media-submissions.md §10).';

insert into photo_clearance (cleared) values (false);

-- -----------------------------------------------------------------------------
-- C. work_photos
-- -----------------------------------------------------------------------------
create table work_photos (
  id                  uuid primary key default gen_random_uuid(),
  student_id          uuid not null references users(id) on delete cascade,
  activity_id         uuid not null references activities(id) on delete cascade,
  -- CASCADE, not the default: purge_soft_deleted deletes an activity's
  -- versions BEFORE the activity, and a RESTRICT key here would abort the
  -- nightly purge (Fable review, 2026-11-18).
  activity_version_id uuid not null references activity_versions(id) on delete cascade,
  block_id            uuid not null,
  source              text not null default 'device' check (source in ('device', 'handoff')),
  created_at          timestamptz not null default now(),
  -- Set by the check that first hands the photo in (slice 2, inside
  -- record_check's transaction). NULL = reserved or uploaded, never handed in.
  attached_at         timestamptz,
  -- The one retention clock (§6.5). 7 days at reservation; on attach the
  -- school-year ceiling least(ends_on + 30, today + 400); on release
  -- least(keep_until, released_at + 30 days). Never extended.
  keep_until          timestamptz not null,
  object_name         text generated always as
                        (activity_id::text || '/' || student_id::text || '/' || id::text || '.jpg') stored,
  constraint work_photos_object_name_key unique (object_name)
);

create index work_photos_keep_until_idx on work_photos (keep_until);
create index work_photos_student_block_idx on work_photos (student_id, activity_id, block_id);
create index work_photos_student_created_idx on work_photos (student_id, created_at);
create index work_photos_version_idx on work_photos (activity_version_id);

alter table work_photos enable row level security;
alter table work_photos force row level security;

comment on table work_photos is
  'One row per student photo of their working (0093; media-submissions.md §6.2). Written by reserve_work_photo BEFORE the upload; the Storage object key is object_name. Zero policies, no client grants: read and written only through DEFINER functions. Deleting a row queues its bytes for the sweep (work_photo_deletions).';

-- -----------------------------------------------------------------------------
-- D. The deletion queue and its trigger
-- -----------------------------------------------------------------------------
create table work_photo_deletions (
  object_name text primary key,
  queued_at   timestamptz not null default now()
);

alter table work_photo_deletions enable row level security;
alter table work_photo_deletions force row level security;

comment on table work_photo_deletions is
  'Object keys whose work_photos row is gone and whose bytes the sweep-work-photos Edge Function has not yet removed through the Storage API (0093). The key embeds the student''s uuid, so this is personal data by reference (data-map.md).';

create function work_photos_queue_bytes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into work_photo_deletions (object_name)
  values (old.object_name)
  on conflict (object_name) do nothing;
  return old;
end;
$$;

revoke execute on function work_photos_queue_bytes() from public, anon, authenticated;

create trigger work_photos_queue_bytes
after delete on work_photos
for each row execute function work_photos_queue_bytes();

-- -----------------------------------------------------------------------------
-- E. The policy helpers and the two policies
-- -----------------------------------------------------------------------------
-- An open reservation: the caller's own row, not yet handed in, not yet due.
-- The clearance is re-read here too, so turning the switch off also closes
-- uploads for reservations already made.
create function work_photo_reserved(p_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select c.cleared from public.photo_clearance c), false)
     and exists (
       select 1 from public.work_photos w
       where w.object_name = p_name
         and w.student_id = auth.uid()
         and w.attached_at is null
         and w.keep_until > now()
     );
$$;

-- Who may read an object: the student whose photo it is, or the teacher who
-- can edit the activity — and the teacher only once a check has attached it
-- (§6.3: unattached uploads never reach a teacher surface).
create function work_photo_readable(p_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.work_photos w
    where w.object_name = p_name
      and (w.student_id = auth.uid()
           or (w.attached_at is not null and public.can_edit_activity(w.activity_id)))
  );
$$;

revoke execute on function work_photo_reserved(text) from public, anon;
revoke execute on function work_photo_readable(text) from public, anon;
grant execute on function work_photo_reserved(text) to authenticated;
grant execute on function work_photo_readable(text) to authenticated;

drop policy if exists student_work_insert_reserved on storage.objects;
create policy student_work_insert_reserved
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'student-work'
  and public.work_photo_reserved(name)
);

drop policy if exists student_work_select_owner_or_grader on storage.objects;
create policy student_work_select_owner_or_grader
on storage.objects
for select
to authenticated
using (
  bucket_id = 'student-work'
  and public.work_photo_readable(name)
);

-- -----------------------------------------------------------------------------
-- F. reserve_work_photo — the gate (§6.2, MS-17)
-- -----------------------------------------------------------------------------
-- Refusal strings are the contract the client maps to copy:
--   photos_off      — photo_clearance is off
--   not_a_student   — a teacher (or roleless) account
--   not_available   — no such published activity / version / photo block
--   not_in_class    — the caller is not in a live class the activity is in
--   photo_cap       — the per-block or per-day cap is reached
-- Version: any version of a published, live activity — a student pinned to an
-- older version offline must still be able to attach (DECISIONS.md, "The
-- orphan GC must never eat unsent work"; the grader accepts non-current
-- versions by design).
create function reserve_work_photo(p_activity_id uuid, p_version_id uuid, p_block_id uuid)
returns uuid
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_block jsonb;
  v_max   integer;
  v_id    uuid;
begin
  if v_uid is null then
    raise exception 'Not authorized';
  end if;

  if not coalesce((select c.cleared from photo_clearance c), false) then
    raise exception 'photos_off';
  end if;

  if not exists (select 1 from users u where u.id = v_uid and u.role = 'student') then
    raise exception 'not_a_student';
  end if;

  select jsonb_path_query_first(
           v.content,
           '$.sections[*].rows[*].columns[*].blocks[*] ? (@.type == "photo_response" && @.id == $id)',
           jsonb_build_object('id', p_block_id::text))
    into v_block
  from activities a
  join activity_versions v on v.activity_id = a.id
  where a.id = p_activity_id
    and v.id = p_version_id
    and a.status = 'published'
    and a.deleted_at is null;

  if v_block is null then
    raise exception 'not_available';
  end if;

  if not exists (
    select 1
    from class_members m
    join classes c on c.id = m.class_id and c.deleted_at is null
    join class_activities ca on ca.class_id = c.id and ca.activity_id = p_activity_id
    where m.student_id = v_uid
      and m.removed_at is null
  ) then
    raise exception 'not_in_class';
  end if;

  -- maxPhotos is 1..3 (MS-4); anything else in a document reads as 1.
  v_max := case when (v_block->>'maxPhotos') in ('1', '2', '3')
                then (v_block->>'maxPhotos')::integer else 1 end;

  -- Serialize one student's reservations so the two counts below cannot be
  -- raced past by parallel calls.
  perform pg_advisory_xact_lock(hashtextextended('reserve_work_photo:' || v_uid::text, 0));

  -- The per-block cap counts only photos NOT yet handed in (Fable review
  -- 2026-11-18): attached photos live up to 400 days, so counting them would
  -- lock a student out of a block for the year after three hand-ins. What a
  -- check may attach is bounded by maxPhotos at check time (slice 2).
  if (select count(*) from work_photos w
       where w.student_id = v_uid and w.activity_id = p_activity_id
         and w.block_id = p_block_id and w.attached_at is null
         and w.keep_until > now()) >= v_max * 3
     or (select count(*) from work_photos w
          where w.student_id = v_uid and w.created_at > now() - interval '1 day') >= 30 then
    raise exception 'photo_cap';
  end if;

  insert into work_photos (student_id, activity_id, activity_version_id, block_id, keep_until)
  values (v_uid, p_activity_id, p_version_id, p_block_id, now() + interval '7 days')
  returning id into v_id;

  return v_id;
end;
$$;

revoke execute on function reserve_work_photo(uuid, uuid, uuid) from public, anon;
grant execute on function reserve_work_photo(uuid, uuid, uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- G. The sweep's SQL (service-only) and the cost meter
-- -----------------------------------------------------------------------------
-- Step 1: remove the ROWS whose clock has run out. The trigger queues their
-- bytes. Dry-run by default; reports what it would remove.
create function sweep_work_photos_due(p_dry_run boolean default true)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_due      integer;
  v_attached integer;
  v_oldest   timestamptz;
begin
  select count(*), count(*) filter (where attached_at is not null), min(keep_until)
    into v_due, v_attached, v_oldest
  from work_photos
  where keep_until <= now();

  if not p_dry_run then
    delete from work_photos where keep_until <= now();
  end if;

  return jsonb_build_object(
    'dry_run',       p_dry_run,
    'due',           v_due,
    'due_attached',  v_attached,
    'oldest_due',    v_oldest,
    'removed',       case when p_dry_run then 0 else v_due end
  );
end;
$$;

-- Step 2: the bytes waiting for the Storage API, oldest first.
create function work_photo_deletion_batch(p_limit integer default 100)
returns setof text
language sql
stable
security definer
set search_path = public
as $$
  select d.object_name from work_photo_deletions d
  order by d.queued_at, d.object_name
  limit least(greatest(coalesce(p_limit, 100), 1), 1000);
$$;

-- Step 3: clear queue rows — but only for objects that are really gone from
-- storage.objects. The Edge Function passes everything it asked Storage to
-- delete; this function decides what actually left, so a failed delete can
-- never be marked done. Returns how many cleared.
create function work_photo_deletions_done(p_names text[])
returns integer
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_n integer;
begin
  delete from work_photo_deletions d
  where d.object_name = any (coalesce(p_names, '{}'))
    and not exists (
      select 1 from storage.objects o
      where o.bucket_id = 'student-work' and o.name = d.object_name
    );
  get diagnostics v_n = row_count;
  return v_n;
end;
$$;

-- The backstop (§6.2 step 3): objects in the bucket with no row and not
-- already queued, older than an hour (so an upload in flight is never one).
-- The sweep deletes these through the Storage API too.
create function work_photo_orphans(p_limit integer default 100)
returns setof text
language sql
stable
security definer
set search_path = public
as $$
  select o.name from storage.objects o
  where o.bucket_id = 'student-work'
    and o.created_at < now() - interval '1 hour'
    and not exists (select 1 from work_photos w where w.object_name = o.name)
    and not exists (select 1 from work_photo_deletions d where d.object_name = o.name)
  order by o.created_at
  limit least(greatest(coalesce(p_limit, 100), 1), 1000);
$$;

-- The cost meter (MS-13): stored bytes by owning teacher, read from Storage's
-- own metadata (never a client-supplied size). Rows with no object yet
-- (reserved, never uploaded) count as photos with 0 bytes.
create function work_photo_usage()
returns table (teacher_id uuid, photos bigint, attached bigint, bytes bigint)
language sql
stable
security definer
set search_path = public
as $$
  select a.owner_id,
         count(*),
         count(*) filter (where w.attached_at is not null),
         coalesce(sum((o.metadata->>'size')::bigint), 0)
  from work_photos w
  join activities a on a.id = w.activity_id
  left join storage.objects o on o.bucket_id = 'student-work' and o.name = w.object_name
  group by a.owner_id;
$$;

revoke execute on function sweep_work_photos_due(boolean) from public, anon, authenticated;
revoke execute on function work_photo_deletion_batch(integer) from public, anon, authenticated;
revoke execute on function work_photo_deletions_done(text[]) from public, anon, authenticated;
revoke execute on function work_photo_orphans(integer) from public, anon, authenticated;
revoke execute on function work_photo_usage() from public, anon, authenticated;
grant execute on function sweep_work_photos_due(boolean) to service_role;
grant execute on function work_photo_deletion_batch(integer) to service_role;
grant execute on function work_photo_deletions_done(text[]) to service_role;
grant execute on function work_photo_orphans(integer) to service_role;
grant execute on function work_photo_usage() to service_role;

-- =============================================================================
-- Verification: scripts/verify-0093.sql (`pnpm verify:auth --target live|local
-- --only verify-0093`) — posture, the policy matrix, the reservation gates,
-- every cascade path into the deletion queue, and the sweep's dry-run default.
-- The Storage-API half (that the bytes really leave) is
-- scripts/verify-student-work-e2e.mjs, which needs the Edge Function.
-- =============================================================================

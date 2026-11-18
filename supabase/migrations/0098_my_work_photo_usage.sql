-- =============================================================================
-- 0098 — a teacher's own photo storage, for the line on My classes
-- -----------------------------------------------------------------------------
-- docs/design/media-submissions.md §6.8 (MS-13, the cost meter). 0093's
-- work_photo_usage() is the author's read (service role, every teacher). The
-- design also shows each teacher their own figure; the author ruled
-- 2026-11-19 that it goes on the My classes page, as one line.
--
--   my_work_photo_usage() — the caller's STORED photos (of activities they
--   OWN) and their bytes, read from Storage's own metadata like 0093's meter.
--   Unlike 0093's author meter it counts only photos whose bytes are in
--   Storage: a reservation the student abandoned before uploading is not a
--   photo a teacher would recognise (Fable review). A soft-deleted activity's
--   photos still count: their bytes are still stored until the purge.
--   A caller who owns nothing (a student) gets zeros. Counts and bytes only:
--   no photo, student or activity is named.
--
-- Verification: scripts/verify-0098.sql.
-- =============================================================================

create function my_work_photo_usage()
returns table (photos bigint, attached bigint, bytes bigint)
language sql
stable
security definer
set search_path = public
as $$
  select count(o.id),
         count(o.id) filter (where w.attached_at is not null),
         coalesce(sum((o.metadata->>'size')::bigint), 0)
  from work_photos w
  join activities a on a.id = w.activity_id
  left join storage.objects o on o.bucket_id = 'student-work' and o.name = w.object_name
  where a.owner_id = auth.uid();
$$;

comment on function my_work_photo_usage() is
  'The caller''s own photo storage (0098): stored photos on activities they own (abandoned reservations excluded), how many a check handed in, and stored bytes from storage.objects metadata. Counts only. The My classes page''s line.';

revoke execute on function my_work_photo_usage() from public, anon;
grant  execute on function my_work_photo_usage() to authenticated, service_role;

-- =============================================================================
-- 0095 — the phone QR handoff (media submissions slice 2c)
-- -----------------------------------------------------------------------------
-- docs/design/media-submissions.md §4.1, MS-3, MS-24. A student on a Chromebook
-- presses "Use my phone", the Chromebook shows a QR code, and a phone with no
-- sign-in photographs the page and sends it. The photo becomes one of the
-- student's own photos exactly as a device upload does (a work_photos row with
-- source = 'handoff'), so everything downstream — the check's attach (0094),
-- retention, the sweep, the teacher's read — is unchanged.
--
--   A. photo_block_gate / reserve_photo_for — the gate reserve_work_photo has
--      always applied, lifted out so the handoff path applies the SAME one.
--      reserve_work_photo is re-created as a wrapper; its behaviour and its
--      refusal strings are unchanged (verify-0093 still pins them).
--   B. photo_handoffs — one row per code. Holds only the code's sha256, never
--      the code.
--   C. The student's three calls: start_photo_handoff, photo_handoff_status,
--      end_photo_handoff.
--   D. The photo-handoff Edge Function's four calls, SERVICE-ROLE ONLY:
--      handoff_peek, handoff_reserve, handoff_confirm, handoff_release.
--   E. prune_photo_handoffs + its nightly job (author's yes, 2026-11-18: the
--      rows are codes, not student work; the photos live in work_photos).
--
-- THE CODE. 32 random bytes, base64url (43 characters), returned ONCE by
-- start_photo_handoff and never stored. The phone sends it in a POST body; it
-- reaches the phone in the URL FRAGMENT (/h#<code>), which browsers never send
-- to a server, so no access log holds it.
--
-- WHAT A CODE CAN DO: upload at most `slots_left` photos (1–3: the block's
-- maxPhotos, less what the Chromebook already holds) into ONE question of ONE
-- student, for 10 minutes or until the Chromebook closes its panel. It can
-- read nothing: handoff_peek returns the activity title, the question's
-- prompt text and the slots left — never the student. The threat model (§4.1)
-- is a classmate who photographs the QR; the student sees every arrival and
-- can remove it.
--
-- THE MODE RULE (author, 2026-11-18): refused in a QUIZ or an EXAM
-- (`meta.activityType`), where a phone out is a phone for looking things up.
-- Not refused in a `locked` activity or a DoL section — the author ruled the
-- design's quiz-and-exam scope as written, NOT the help-request set.
-- Checked at start AND again at each upload, from the version's own content.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A. The shared gate
-- -----------------------------------------------------------------------------
-- Raises photos_off / not_a_student / not_available / not_in_class, exactly as
-- reserve_work_photo did; returns the block's maxPhotos (1..3).
create function photo_block_gate(p_uid uuid, p_activity_id uuid, p_version_id uuid, p_block_id uuid)
returns integer
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_block jsonb;
begin
  if not coalesce((select c.cleared from photo_clearance c), false) then
    raise exception 'photos_off';
  end if;

  if not exists (select 1 from users u where u.id = p_uid and u.role = 'student') then
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
    where m.student_id = p_uid
      and m.removed_at is null
  ) then
    raise exception 'not_in_class';
  end if;

  -- maxPhotos is 1..3 (MS-4); anything else in a document reads as 1.
  return case when (v_block->>'maxPhotos') in ('1', '2', '3')
              then (v_block->>'maxPhotos')::integer else 1 end;
end;
$$;

-- The whole of what reserve_work_photo did, for a named student and source.
-- Internal: only reserve_work_photo (a signed-in student, auth.uid()) and
-- handoff_reserve (the service role, the code's student) call it.
create function reserve_photo_for(p_uid uuid, p_activity_id uuid, p_version_id uuid, p_block_id uuid, p_source text)
returns uuid
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_max integer;
  v_id  uuid;
begin
  v_max := photo_block_gate(p_uid, p_activity_id, p_version_id, p_block_id);

  -- Serialize one student's reservations so the two counts below cannot be
  -- raced past by parallel calls (a phone and the Chromebook included).
  perform pg_advisory_xact_lock(hashtextextended('reserve_work_photo:' || p_uid::text, 0));

  -- The per-block cap counts only photos NOT yet handed in (0093, Fable).
  if (select count(*) from work_photos w
       where w.student_id = p_uid and w.activity_id = p_activity_id
         and w.block_id = p_block_id and w.attached_at is null
         and w.keep_until > now()) >= v_max * 3
     or (select count(*) from work_photos w
          where w.student_id = p_uid and w.created_at > now() - interval '1 day') >= 30 then
    raise exception 'photo_cap';
  end if;

  insert into work_photos (student_id, activity_id, activity_version_id, block_id, source, keep_until)
  values (p_uid, p_activity_id, p_version_id, p_block_id, p_source, now() + interval '7 days')
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function reserve_work_photo(p_activity_id uuid, p_version_id uuid, p_block_id uuid)
returns uuid
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authorized';
  end if;
  return reserve_photo_for(auth.uid(), p_activity_id, p_version_id, p_block_id, 'device');
end;
$$;

revoke execute on function photo_block_gate(uuid, uuid, uuid, uuid) from public, anon, authenticated;
grant  execute on function photo_block_gate(uuid, uuid, uuid, uuid) to service_role;
revoke execute on function reserve_photo_for(uuid, uuid, uuid, uuid, text) from public, anon, authenticated;
grant  execute on function reserve_photo_for(uuid, uuid, uuid, uuid, text) to service_role;
revoke execute on function reserve_work_photo(uuid, uuid, uuid) from public, anon;
grant  execute on function reserve_work_photo(uuid, uuid, uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- B. photo_handoffs
-- -----------------------------------------------------------------------------
create table photo_handoffs (
  id                  uuid primary key default gen_random_uuid(),
  student_id          uuid not null references users(id) on delete cascade,
  activity_id         uuid not null references activities(id) on delete cascade,
  -- CASCADE for the same reason as work_photos (0093): the purge deletes an
  -- activity's versions before the activity.
  activity_version_id uuid not null references activity_versions(id) on delete cascade,
  block_id            uuid not null,
  -- sha256 of the code's text. The code itself is never stored.
  code_hash           bytea not null,
  slots_left          integer not null check (slots_left between 0 and 3),
  -- The photos that ARRIVED (bytes in Storage): what the Chromebook adds.
  photo_ids           uuid[] not null default '{}',
  created_at          timestamptz not null default now(),
  expires_at          timestamptz not null,
  -- The Chromebook closed its panel, or started a newer code.
  ended_at            timestamptz,
  constraint photo_handoffs_code_hash_key unique (code_hash)
);

create index photo_handoffs_student_created_idx on photo_handoffs (student_id, created_at);
create index photo_handoffs_expires_idx on photo_handoffs (expires_at);

alter table photo_handoffs enable row level security;
alter table photo_handoffs force row level security;

comment on table photo_handoffs is
  'One row per phone-handoff code (0095; media-submissions.md §4.1). Holds the code''s sha256, never the code. Zero policies, no client grants: read and written only through DEFINER functions. Deleted one day after it expires (prune_photo_handoffs).';

-- Whether a version's content allows a phone at all (the author's ruling).
create function photo_handoff_allowed(p_content jsonb)
returns boolean
language sql
immutable
set search_path = public
as $$
  select coalesce(p_content->'meta'->>'activityType', 'worksheet') not in ('quiz', 'exam');
$$;

revoke execute on function photo_handoff_allowed(jsonb) from public, anon, authenticated;
grant  execute on function photo_handoff_allowed(jsonb) to service_role;

-- A live row for a code: not ended, not expired. Locked for the caller's
-- transaction so two uploads on one code cannot both take its last slot.
create function handoff_row_for(p_code text)
returns photo_handoffs
language sql
volatile
security definer
set search_path = public
as $$
  select h.* from photo_handoffs h
   where h.code_hash = sha256(convert_to(coalesce(p_code, ''), 'UTF8'))
     and h.ended_at is null
     and h.expires_at > now()
   for update;
$$;

revoke execute on function handoff_row_for(text) from public, anon, authenticated;
grant  execute on function handoff_row_for(text) to service_role;

-- -----------------------------------------------------------------------------
-- C. The student's calls (signed in, on the Chromebook)
-- -----------------------------------------------------------------------------
-- Refusals, in addition to photo_block_gate's:
--   handoff_not_here — a quiz or an exam
--   handoff_cap      — 20 codes in a day (a bound on the table, not a policy)
create function start_photo_handoff(p_activity_id uuid, p_version_id uuid, p_block_id uuid, p_slots integer)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_uid     uuid := auth.uid();
  v_max     integer;
  v_content jsonb;
  v_code    text;
  v_row     photo_handoffs;
begin
  if v_uid is null then
    raise exception 'Not authorized';
  end if;

  v_max := photo_block_gate(v_uid, p_activity_id, p_version_id, p_block_id);

  select v.content into v_content from activity_versions v where v.id = p_version_id;
  if not photo_handoff_allowed(v_content) then
    raise exception 'handoff_not_here';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('start_photo_handoff:' || v_uid::text, 0));

  if (select count(*) from photo_handoffs h
       where h.student_id = v_uid and h.created_at > now() - interval '1 day') >= 20 then
    raise exception 'handoff_cap';
  end if;

  -- One live code per student: a new one ends any other, so a QR left on a
  -- screen elsewhere stops working the moment the student starts again.
  update photo_handoffs set ended_at = now()
   where student_id = v_uid and ended_at is null;

  v_code := translate(rtrim(encode(extensions.gen_random_bytes(32), 'base64'), '='), '+/', '-_');

  insert into photo_handoffs (student_id, activity_id, activity_version_id, block_id,
                              code_hash, slots_left, expires_at)
  values (v_uid, p_activity_id, p_version_id, p_block_id,
          sha256(convert_to(v_code, 'UTF8')),
          least(greatest(coalesce(p_slots, 1), 1), v_max),
          now() + interval '10 minutes')
  returning * into v_row;

  return jsonb_build_object(
    'id', v_row.id,
    'code', v_code,
    'expires_at', v_row.expires_at,
    'slots', v_row.slots_left);
end;
$$;

-- What the Chromebook polls (every 3 s while its panel is open). The caller's
-- own row only; anyone else's reads as gone.
create function photo_handoff_status(p_handoff_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select jsonb_build_object(
              'photos', to_jsonb(h.photo_ids),
              'slots_left', h.slots_left,
              'expires_at', h.expires_at,
              'live', h.ended_at is null and h.expires_at > now())
       from photo_handoffs h
      where h.id = p_handoff_id and h.student_id = auth.uid()),
    jsonb_build_object('photos', '[]'::jsonb, 'slots_left', 0, 'live', false));
$$;

-- Closing the panel revokes the code at once.
create function end_photo_handoff(p_handoff_id uuid)
returns void
language sql
volatile
security definer
set search_path = public
as $$
  update photo_handoffs set ended_at = coalesce(ended_at, now())
   where id = p_handoff_id and student_id = auth.uid();
$$;

revoke execute on function start_photo_handoff(uuid, uuid, uuid, integer) from public, anon;
grant  execute on function start_photo_handoff(uuid, uuid, uuid, integer) to authenticated;
revoke execute on function photo_handoff_status(uuid) from public, anon;
grant  execute on function photo_handoff_status(uuid) to authenticated;
revoke execute on function end_photo_handoff(uuid) from public, anon;
grant  execute on function end_photo_handoff(uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- D. The Edge Function's calls (service role only; the phone has no session)
-- -----------------------------------------------------------------------------
-- Refusals the phone maps to copy:
--   handoff_expired — no live code (wrong, used up by a newer code, closed, or
--                     past its 10 minutes). One string for all of them, so a
--                     guess learns nothing about which.
--   handoff_full    — every slot used
--   handoff_not_here, photos_off, not_in_class, not_available, photo_cap
--   handoff_busy    — the global ceiling (120 handoff photos a minute)

-- What the phone shows: the activity's title and the question's prompt as
-- text. Never the student.
create function handoff_peek(p_code text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_row     photo_handoffs;
  v_content jsonb;
  v_block   jsonb;
begin
  v_row := handoff_row_for(p_code);
  if v_row.id is null then
    raise exception 'handoff_expired';
  end if;

  select v.content into v_content from activity_versions v where v.id = v_row.activity_version_id;
  v_block := jsonb_path_query_first(
    v_content,
    '$.sections[*].rows[*].columns[*].blocks[*] ? (@.id == $id)',
    jsonb_build_object('id', v_row.block_id::text));

  return jsonb_build_object(
    'title', left(coalesce(v_content->'meta'->>'title', ''), 120),
    'prompt', left(coalesce(
      (select string_agg(t #>> '{}', '')
         from jsonb_path_query(coalesce(v_block->'prompt', '[]'::jsonb), 'strict $.**.text') t
        where jsonb_typeof(t) = 'string'), ''), 200),
    'slots_left', v_row.slots_left,
    'expires_at', v_row.expires_at);
end;
$$;

-- Take a slot and reserve the photo for the code's student, under the SAME
-- gate a device upload passes (clearance, class, block, caps), plus the mode
-- rule re-read now. Returns where the function must write the bytes.
create function handoff_reserve(p_code text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_row     photo_handoffs;
  v_content jsonb;
  v_id      uuid;
begin
  v_row := handoff_row_for(p_code);
  if v_row.id is null then
    raise exception 'handoff_expired';
  end if;
  if v_row.slots_left <= 0 then
    raise exception 'handoff_full';
  end if;

  select v.content into v_content from activity_versions v where v.id = v_row.activity_version_id;
  if not photo_handoff_allowed(v_content) then
    raise exception 'handoff_not_here';
  end if;

  if (select count(*) from work_photos w
       where w.source = 'handoff' and w.created_at > now() - interval '1 minute') >= 120 then
    raise exception 'handoff_busy';
  end if;

  v_id := reserve_photo_for(v_row.student_id, v_row.activity_id, v_row.activity_version_id,
                            v_row.block_id, 'handoff');

  update photo_handoffs set slots_left = slots_left - 1 where id = v_row.id;

  return jsonb_build_object(
    'photo_id', v_id,
    'object_name', (select w.object_name from work_photos w where w.id = v_id));
end;
$$;

-- The bytes are in Storage: the photo ARRIVES (the Chromebook's next poll
-- adds it). Matched by the code's hash whether or not it is still live — an
-- upload that started in minute 9 must still arrive in minute 11 — and only
-- for a handoff photo of that row's own student and question, once.
create function handoff_confirm(p_code text, p_photo_id uuid)
returns integer
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_slots integer;
begin
  -- Idempotent: a retried confirm (the function's response was lost) is a
  -- success, not a refusal.
  select h.slots_left into v_slots from photo_handoffs h
   where h.code_hash = sha256(convert_to(coalesce(p_code, ''), 'UTF8'))
     and p_photo_id = any (h.photo_ids);
  if v_slots is not null then
    return v_slots;
  end if;

  update photo_handoffs h
     set photo_ids = h.photo_ids || p_photo_id
   where h.code_hash = sha256(convert_to(coalesce(p_code, ''), 'UTF8'))
     and not (p_photo_id = any (h.photo_ids))
     and exists (select 1 from work_photos w
                  join storage.objects o on o.bucket_id = 'student-work' and o.name = w.object_name
                  where w.id = p_photo_id and w.student_id = h.student_id
                    and w.activity_id = h.activity_id and w.block_id = h.block_id
                    and w.source = 'handoff')
  returning h.slots_left into v_slots;
  if v_slots is null then
    raise exception 'handoff_expired';
  end if;
  return v_slots;
end;
$$;

-- The upload failed: delete the reservation and give the slot back.
create function handoff_release(p_code text, p_photo_id uuid)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_row_id uuid;
begin
  delete from work_photos w
   using photo_handoffs h
   where h.code_hash = sha256(convert_to(coalesce(p_code, ''), 'UTF8'))
     and w.id = p_photo_id and w.student_id = h.student_id
     and w.source = 'handoff' and w.attached_at is null
     and not (p_photo_id = any (h.photo_ids))
  returning h.id into v_row_id;
  if v_row_id is not null then
    update photo_handoffs set slots_left = least(slots_left + 1, 3) where id = v_row_id;
  end if;
end;
$$;

revoke execute on function handoff_peek(text) from public, anon, authenticated;
grant  execute on function handoff_peek(text) to service_role;
revoke execute on function handoff_reserve(text) from public, anon, authenticated;
grant  execute on function handoff_reserve(text) to service_role;
revoke execute on function handoff_confirm(text, uuid) from public, anon, authenticated;
grant  execute on function handoff_confirm(text, uuid) to service_role;
revoke execute on function handoff_release(text, uuid) from public, anon, authenticated;
grant  execute on function handoff_release(text, uuid) to service_role;

-- -----------------------------------------------------------------------------
-- E. The cleanup: rows go one day after they expire (§4.1)
-- -----------------------------------------------------------------------------
create function prune_photo_handoffs(p_dry_run boolean default true)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_rows integer;
begin
  select count(*) into v_rows from photo_handoffs h where h.expires_at < now() - interval '1 day';
  if not p_dry_run then
    delete from photo_handoffs h where h.expires_at < now() - interval '1 day';
  end if;
  return jsonb_build_object('dry_run', p_dry_run, 'handoffs', v_rows);
end;
$$;

comment on function prune_photo_handoffs(boolean) is
  'Deletes phone-handoff codes one day after they expire (0095, §4.1). Removes no student work: the photos are work_photos rows. Scheduled nightly at 03:50 UTC (author''s yes, 2026-11-18).';

revoke execute on function prune_photo_handoffs(boolean) from public, anon, authenticated;
grant  execute on function prune_photo_handoffs(boolean) to service_role;

-- SCHEDULED on apply, where pg_cron exists (live). The local stack has no
-- pg_cron, so this is a no-op there; verify-0095's live-only row pins the job.
-- 03:50 UTC: after the 03:45 help-request prune; 16:50 / 15:50 in NZ and the
-- US evening before, outside school hours in both.
do $cron$
begin
  if exists (select 1 from pg_namespace where nspname = 'cron') then
    perform cron.unschedule(j.jobid) from cron.job j where j.jobname = 'prune-photo-handoffs';
    perform cron.schedule('prune-photo-handoffs', '50 3 * * *', 'select prune_photo_handoffs(false);');
  end if;
end;
$cron$;

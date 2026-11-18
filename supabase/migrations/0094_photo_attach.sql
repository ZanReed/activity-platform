-- =============================================================================
-- 0094 — handing a photo in: the check attaches it (media submissions slice 2)
-- -----------------------------------------------------------------------------
-- docs/design/media-submissions.md §3.2, §6.5, §6.6. 0093 built the storage and
-- the record; nothing could hand a photo in. This migration is that step, and
-- the two small reads the student's block needs.
--
--   A. photo_answers_on()       — the block's read of photo_clearance, so a
--                                 student sees "not turned on yet" up front.
--   B. discard_work_photo(id)   — Remove, before a check: deletes the caller's
--                                 own unattached row (the 0093 trigger queues
--                                 the bytes). Attached photos are evidence for a
--                                 grade and are never discarded by a student.
--   C. section_checks_attach_photos — a BEFORE INSERT trigger on section_checks.
--                                 Every path that records a check validates and
--                                 attaches the photos its responses reference,
--                                 inside the insert's own transaction.
--   E. (placed before C, which uses it) work_photos.attached_object_version and
--                                 the teacher's read bound to it — see §E.
--   D. dol_optional_block (0076)  — re-created with photo_response in its two
--                                 type lists: MS-23, a photo follows
--                                 short_answer's DoL rules (gradable; optional
--                                 marking when it is not the primary item).
--                                 scripts/tests/dol-optional-gradeable.test.mjs
--                                 binds the list to isGradeable.
--
-- WHY A TRIGGER, NOT A FIFTH RE-CREATION OF record_check: the rule is about the
-- ROW ("no check row may reference a photo that is not this student's, for this
-- activity and block, uploaded, while photos are on"), so it belongs on the
-- row. record_check's body (0070) is unchanged, and any future insert path is
-- covered without anyone remembering to call a helper. record_check's retry
-- loop runs each insert in its own savepoint, so an insert that loses the
-- unique race rolls the trigger's attach back with it.
--
-- WHAT THE TRIGGER CHECKS, per ref in responses.photos (blockId → [{id}]):
--   * no row, or an unattached row already past its 7-day clock
--       → kept on the check as {"id": …, "removed": true}; the check proceeds
--         (§3.2: a re-check never fails because the sweep ran). A made-up id
--         lands here too, harmlessly: it names no object anyone can read.
--   * a row of another student, activity or block → 'photo_not_yours' (tampering)
--   * an unattached row whose object is not in Storage → 'photo_not_uploaded'
--       This is the G17 finding (0093's e2e): a signed upload URL issued while a
--       reservation was open still uploads after the switch goes off, because
--       Storage checks the policy when it SIGNS. Requiring the object here, and
--       the clearance below, means a URL signed before attach can never place
--       bytes under an attached key: the object already exists, and an upsert
--       needs UPDATE, which no policy grants.
--   * a photo that would be NEWLY handed in while photo_clearance is off →
--       'photos_off'. Refs already attached, and removed ones, still pass, so
--       turning the switch off never blocks a section's other answers for a
--       student whose earlier check already holds a photo (§6.6; Fable review
--       2026-11-18).
--   * the same id twice in one check, or a malformed map → 'bad_photos'
-- The block TYPE and the maxPhotos COUNT are checked by the handler against the
-- stored document before it calls record_check (record_check is service-role
-- only, so the handler is the only caller). They are not re-derived here.
--
-- ATTACH sets attached_at and the school-year ceiling on a photo's FIRST
-- hand-in only; a re-check that references it again changes nothing (§6.5:
-- "never extended"). The ceiling is 0048's formula —
-- least(ends_on + 30, today + 400), ends_on the latest school_year_ends_on of
-- the student's live classes this activity is assigned to — with one addition:
-- a FLOOR of 30 days from the hand-in. Without it, a photo handed in after a
-- class's year-end + 30 would be due the moment it arrived and swept that night,
-- before its teacher could see it. Slice 3 adds the release clock
-- (least(keep_until, released_at + 30 days)), which can bring it earlier.
--
-- Nothing here deletes student work, and nothing here is scheduled.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A. photo_answers_on
-- -----------------------------------------------------------------------------
create function photo_answers_on()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select c.cleared from public.photo_clearance c), false);
$$;

revoke execute on function photo_answers_on() from public, anon;
grant execute on function photo_answers_on() to authenticated;

comment on function photo_answers_on() is
  'Whether students may add photos of their working (0094; reads photo_clearance). A display read only: reserve_work_photo and the section_checks trigger enforce the switch themselves.';

-- -----------------------------------------------------------------------------
-- B. discard_work_photo
-- -----------------------------------------------------------------------------
create function discard_work_photo(p_id uuid)
returns boolean
language sql
volatile
security definer
set search_path = ''
as $$
  with gone as (
    delete from public.work_photos w
    where w.id = p_id
      and w.student_id = auth.uid()
      and w.attached_at is null
    returning 1
  )
  select exists (select 1 from gone);
$$;

revoke execute on function discard_work_photo(uuid) from public, anon;
grant execute on function discard_work_photo(uuid) to authenticated;

comment on function discard_work_photo(uuid) is
  'A student''s Remove before a check (0094): deletes their own UNATTACHED photo row; the 0093 trigger queues the bytes for the sweep. Returns false (and deletes nothing) for an attached photo, another student''s, or no such row.';

-- -----------------------------------------------------------------------------
-- E. A handed-in photo is the bytes that were handed in
-- -----------------------------------------------------------------------------
-- MEASURED (verify-student-work-e2e G18, Fable review 2026-11-18): a signed
-- upload URL requested WITH upsert before the first upload passes Storage's
-- sign-time check — that check runs INSERT … ON CONFLICT DO UPDATE against an
-- absent object, so only the INSERT policy is consulted — and the URL (valid
-- about two hours) later REPLACES the object even after a check has handed it
-- in. Storage performs that write with its own role, so no policy can refuse
-- it. What a policy CAN do is refuse to show the replaced bytes as the work:
-- the attach records the object's Storage `version` (a fresh value on every
-- write), and the teacher's read requires it still to match. A replaced photo
-- is unreadable to the teacher (it fails closed; slice 3 shows it as changed),
-- while the student still reads their own object.
alter table work_photos add column attached_object_version text;

comment on column work_photos.attached_object_version is
  'storage.objects.version of the photo when a check first handed it in (0094). The teacher''s read (work_photo_readable) requires the live object still to carry it, so bytes replaced after hand-in never reach a teacher. NULL until attached.';

create function work_photo_readable(p_name text, p_version text)
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
           or (w.attached_at is not null
               and w.attached_object_version = p_version
               and public.can_edit_activity(w.activity_id)))
  );
$$;

revoke execute on function work_photo_readable(text, text) from public, anon;
grant execute on function work_photo_readable(text, text) to authenticated;

drop policy if exists student_work_select_owner_or_grader on storage.objects;
create policy student_work_select_owner_or_grader
on storage.objects
for select
to authenticated
using (
  bucket_id = 'student-work'
  and public.work_photo_readable(name, version)
);

drop function work_photo_readable(text);

-- -----------------------------------------------------------------------------
-- C. The attach trigger
-- -----------------------------------------------------------------------------
create function section_checks_attach_photos()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_photos  jsonb := new.responses -> 'photos';
  v_out     jsonb := '{}'::jsonb;
  v_block   record;
  v_ref     jsonb;
  v_refs    jsonb;
  v_id      uuid;
  v_row     work_photos%rowtype;
  v_seen    uuid[] := '{}';
  v_attach  uuid[] := '{}';
  v_ends    date;
  v_keep    timestamptz;
begin
  if v_photos is null or v_photos = '{}'::jsonb then
    return new;
  end if;
  if jsonb_typeof(v_photos) <> 'object' then
    raise exception 'bad_photos' using errcode = 'P0001';
  end if;

  for v_block in select key, value from jsonb_each(v_photos) loop
    if jsonb_typeof(v_block.value) <> 'array' then
      raise exception 'bad_photos' using errcode = 'P0001';
    end if;
    v_refs := '[]'::jsonb;
    for v_ref in select value from jsonb_array_elements(v_block.value) loop
      begin
        v_id := (v_ref ->> 'id')::uuid;
      exception when others then
        raise exception 'bad_photos' using errcode = 'P0001';
      end;
      if v_id is null or v_id = any(v_seen) then
        raise exception 'bad_photos' using errcode = 'P0001';
      end if;
      v_seen := v_seen || v_id;

      select * into v_row from work_photos w where w.id = v_id for update;
      if not found or (v_row.attached_at is null and v_row.keep_until <= now()) then
        v_refs := v_refs || jsonb_build_array(jsonb_build_object('id', v_id, 'removed', true));
        continue;
      end if;
      if v_row.student_id <> new.student_id
         or v_row.activity_id <> new.activity_id
         or v_row.block_id::text <> v_block.key then
        raise exception 'photo_not_yours' using errcode = 'P0001';
      end if;
      if v_row.attached_at is null then
        if not exists (select 1 from storage.objects o
                       where o.bucket_id = 'student-work' and o.name = v_row.object_name) then
          raise exception 'photo_not_uploaded' using errcode = 'P0001';
        end if;
        v_attach := v_attach || v_id;
      end if;
      v_refs := v_refs || jsonb_build_array(jsonb_build_object('id', v_id));
    end loop;
    v_out := v_out || jsonb_build_object(v_block.key, v_refs);
  end loop;

  if array_length(v_attach, 1) is not null
     and not coalesce((select c.cleared from photo_clearance c), false) then
    raise exception 'photos_off' using errcode = 'P0001';
  end if;

  if array_length(v_attach, 1) is not null then
    select max(c.school_year_ends_on) into v_ends
    from class_members m
    join classes c on c.id = m.class_id and c.deleted_at is null
    join class_activities ca on ca.class_id = c.id and ca.activity_id = new.activity_id
    where m.student_id = new.student_id
      and m.removed_at is null;

    v_keep := least(coalesce((v_ends + 30)::timestamptz, 'infinity'::timestamptz),
                    now() + interval '400 days');
    v_keep := greatest(v_keep, now() + interval '30 days');

    update work_photos w
       set attached_at = now(),
           keep_until = v_keep,
           attached_object_version = (select o.version from storage.objects o
                                       where o.bucket_id = 'student-work' and o.name = w.object_name)
     where w.id = any(v_attach)
       and w.attached_at is null;
  end if;

  -- The stored refs are normalized: {id} or {id, removed}, nothing else a
  -- client sent survives into a row that lives 400 days.
  new.responses := jsonb_set(new.responses, '{photos}', v_out);
  return new;
end;
$$;

revoke execute on function section_checks_attach_photos() from public, anon, authenticated;

create trigger section_checks_attach_photos
  before insert on section_checks
  for each row
  execute function section_checks_attach_photos();

comment on function section_checks_attach_photos() is
  'BEFORE INSERT on section_checks (0094; media-submissions.md §3.2): validates responses.photos (the caller''s own, this activity and block, uploaded, photos on) and attaches each photo on its first hand-in (attached_at; keep_until = the school-year ceiling with a 30-day floor). Refusals: bad_photos, photo_not_yours, photo_not_uploaded, photos_off. A ref with no row (retention) is stored as {id, removed: true}.';

-- -----------------------------------------------------------------------------
-- D. dol_optional_block — 0076's body, with photo_response in both lists
-- -----------------------------------------------------------------------------
-- Unchanged otherwise (0076: never NULL). The viewer's twins are
-- container/dolOptional.ts and server/dolPrimary.ts.
create or replace function dol_optional_block(p_section jsonb, p_block_id text)
returns boolean
language sql
immutable
set search_path = public
as $$
  with blocks as (
    select b, row_number() over (order by r.o, c.o, bl.o) as n
    from jsonb_array_elements(coalesce(p_section->'rows', '[]'::jsonb)) with ordinality r(v, o)
    cross join lateral jsonb_array_elements(coalesce(r.v->'columns', '[]'::jsonb)) with ordinality c(v, o)
    cross join lateral jsonb_array_elements(coalesce(c.v->'blocks', '[]'::jsonb)) with ordinality bl(b, o)
  ), gradable as (
    select b, n from blocks
    where b->>'type' in ('fill_in_blank', 'multiple_choice', 'matching', 'correspondence', 'ordering',
                         'number_line', 'self_explanation', 'short_answer', 'essay', 'photo_response',
                         'faded_worked_example')
       or (b->>'type' in ('interactive_graph', 'data_plot') and b->'interaction'->>'type' <> 'display')
       or (b->>'type' = 'math_block' and jsonb_array_length(coalesce(b->'prompts', '[]'::jsonb)) > 0)
       or (b->>'type' = 'table' and jsonb_path_exists(b, '$.**.type ? (@ == "blank")'))
  )
  select coalesce(jsonb_typeof(p_section->'dol') = 'object', false)
     and exists (select 1 from gradable g
                 where g.b->>'id' = p_block_id and g.b->>'type' in ('short_answer', 'essay', 'photo_response')
                   and g.n > (select min(n) from gradable));
$$;

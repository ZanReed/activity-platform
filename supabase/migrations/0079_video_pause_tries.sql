-- =============================================================================
-- 0079_video_pause_tries.sql — a clip's pause checks feed the struggling rule
-- (D64 slice 3)
-- -----------------------------------------------------------------------------
-- docs/design/video-pause-points.md VP-3, VP-4. A pause check grades one faded
-- block. It never writes section_checks: the section's own Check stays the real
-- attempt, so first tries (0062), class progress and attempt counts don't move.
--
--   video_pause_tries        one row per student per block. The first answer's
--                            result never changes; later tries only count up.
--                            No watch log: nothing says who played what.
--   record_video_pause_try   service role only, because it takes a verdict. The
--                            handler calls it BEFORE it returns the verdict.
--   mixed_recent             gains these rows, so "Getting stuck" and "Keep
--                            practising" can fire from a pause.
--
-- STUDENT-DERIVED personal data, so data-map and retention-policy move with it.
-- No row can exist until D73's setting is on: video_source refuses a student
-- with it off, and the handler asks that gate before it grades.
-- =============================================================================

create table video_pause_tries (
  student_id          uuid not null references users(id) on delete cascade,
  activity_version_id uuid not null references activity_versions(id) on delete cascade,
  block_id            uuid not null,
  -- The activity's primary skill at the time. NULL means it has none, and the
  -- struggling rule skips the row.
  skill_id            text,
  correct             boolean not null,
  tries               integer not null default 1 check (tries >= 1),
  saved_at            timestamptz not null default now(),
  primary key (student_id, activity_version_id, block_id)
);

create index video_pause_tries_version_idx on video_pause_tries (activity_version_id);

alter table video_pause_tries enable row level security;
alter table video_pause_tries force row level security;

comment on table video_pause_tries is
  'A student''s first try at a clip''s pause check (0079, D64 VP-4): right or not, and how many tries. STUDENT-DERIVED personal data. Zero policies: written only by record_video_pause_try, read only through mixed_recent.';

create function record_video_pause_try(
  p_student_id  uuid,
  p_activity_id uuid,
  p_version_id  uuid,
  p_section_id  text,
  p_block_id    uuid,
  p_correct     boolean,
  p_max_tries   integer default 30
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
  v_skill text;
  v_tries integer;
begin
  select a.owner_id, src.primary_skill
    into v_owner, v_skill
  from activities a
  join activity_versions v on v.activity_id = a.id and v.id = p_version_id
  join activities src on src.id = coalesce(a.copied_from_activity_id, a.id)
  where a.id = p_activity_id;
  if not found then
    raise exception 'Not available' using errcode = '42501';
  end if;

  -- A teacher trying their own clip is not a student's first try.
  if v_owner = p_student_id then
    return jsonb_build_object('recorded', false);
  end if;

  -- VP-3: the section's check has already shown its solutions.
  if exists (select 1 from section_checks c
             where c.student_id = p_student_id and c.activity_version_id = p_version_id
               and c.section_id = p_section_id) then
    return jsonb_build_object('recorded', false, 'already_checked', true);
  end if;

  -- Retries are free for a student and each one is a verdict, so they have a
  -- ceiling. No real student gets near it.
  select t.tries into v_tries from video_pause_tries t
   where t.student_id = p_student_id and t.activity_version_id = p_version_id
     and t.block_id = p_block_id
   for update;
  if v_tries >= p_max_tries then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  insert into video_pause_tries (student_id, activity_version_id, block_id, skill_id, correct)
  values (p_student_id, p_version_id, p_block_id, v_skill, p_correct)
  on conflict (student_id, activity_version_id, block_id)
  do update set tries = video_pause_tries.tries + 1
  returning tries into v_tries;

  return jsonb_build_object('recorded', true, 'tries', v_tries);
end;
$$;

revoke execute on function record_video_pause_try(uuid, uuid, uuid, text, uuid, boolean, integer) from public, anon, authenticated;
grant execute on function record_video_pause_try(uuid, uuid, uuid, text, uuid, boolean, integer) to service_role;

-- VP-4: a pause's first try counts like a mixed first try, per class through the
-- class's activities. A section check still never feeds this, so nothing counts twice.
create or replace function mixed_recent(p_class_id uuid, p_window integer)
returns table (student_id uuid, bank_key text, tries integer, right_n integer, skipped_n integer)
language sql
stable
security definer
set search_path = public
as $$
  select x.student_id, x.bank_key, count(*)::integer,
         count(*) filter (where x.correct)::integer,
         count(*) filter (where x.skipped)::integer
  from (
    select a.*, row_number() over (partition by a.student_id, a.bank_key
                                   order by a.practice_day desc, a.saved_at desc, a.seq desc) as rn
    from (
      select ma.student_id, ma.bank_key, ma.correct, ma.skipped, ma.practice_day, ma.saved_at, ma.seq
      from mixed_attempts ma
      where ma.class_id = p_class_id and ma.kind = 'skill'
      union all
      select t.student_id, t.skill_id, t.correct, false,
             (t.saved_at at time zone fact_class_zone(p_class_id))::date, t.saved_at, 0
      from video_pause_tries t
      join activity_versions v on v.id = t.activity_version_id
      join class_activities ca on ca.activity_id = v.activity_id and ca.class_id = p_class_id
      where t.skill_id is not null
    ) a
    join class_members m on m.class_id = p_class_id and m.student_id = a.student_id
                        and m.removed_at is null
  ) x
  where x.rn <= p_window
  group by x.student_id, x.bank_key;
$$;

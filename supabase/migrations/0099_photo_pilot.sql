-- =============================================================================
-- 0099 — photo answers for PILOT teachers only (author ruling 2026-11-19)
-- -----------------------------------------------------------------------------
-- Photo answers open first to the author's local teachers, hidden from every
-- other school until the feature is ready. Ruled 2026-11-19 (items 1-8):
--
--   A. users.photo_pilot — per TEACHER, default off, set by the author in SQL
--      (`update users set photo_pilot = true where email = '...'`). Called a
--      pilot, not premium: no billing exists (CLAUDE.md). Not client-writable:
--      users_update_self pins only role and account_tier, so a guard trigger
--      refuses a client change (the users_timezone_guard pattern).
--   B. photos_allowed_for(activity) — THE rule: the global photo_clearance
--      switch is on AND the activity's OWNER is a pilot teacher. A Bank copy is
--      its copier's activity, so a non-pilot copy is off (item 6).
--   C. Every server gate asks B instead of the bare switch: work_photo_reserved
--      (the Storage INSERT policy), photo_block_gate (reserving and the phone
--      handoff), section_checks_attach_photos (handing in with a check).
--   D. photo_answers_on(activity) — the block's display read, per activity.
--      The zero-argument form stays (the global switch) for clients older
--      than this push.
--   E. 0097's "not owed while off" rule now reads B per activity: in
--      activity_progress, class_progress, list_grading_queue and
--      class_student_work's photos_on. A non-pilot teacher's empty photo
--      answer is never "to grade".
--
-- Bodies in C and E are the live definitions (through 0098) with only the
-- switch read changed. Verification: scripts/verify-0099.sql; re-run
-- verify-0093..0098 (their fixture teachers are now pilots).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A. The flag and its guard
-- -----------------------------------------------------------------------------
alter table users add column photo_pilot boolean not null default false;

comment on column users.photo_pilot is
  'Photo answers pilot (0099): when true, students may add photos of their working to this teacher''s activities (with photo_clearance on). Set by the author in SQL; not client-writable (users_photo_pilot_guard).';

create function users_photo_pilot_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- current_user is the CLIENT role under PostgREST; the author's SQL and
  -- definer functions run as their owner.
  if new.photo_pilot is distinct from old.photo_pilot
     and current_user in ('authenticated', 'anon') then
    raise exception 'photo_pilot is not client-writable';
  end if;
  return new;
end;
$$;

create trigger users_photo_pilot_guard
  before update of photo_pilot on users
  for each row execute function users_photo_pilot_guard();

-- -----------------------------------------------------------------------------
-- B. The rule
-- -----------------------------------------------------------------------------
create function photos_allowed_for(p_activity_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select c.cleared from public.photo_clearance c), false)
     and exists (
       select 1 from public.activities a
       join public.users u on u.id = a.owner_id
       where a.id = p_activity_id and u.photo_pilot
     );
$$;

comment on function photos_allowed_for(uuid) is
  'Whether students may add photos to this activity (0099): photo_clearance is on AND the activity owner is a photo pilot teacher. Every photo gate asks this.';

revoke execute on function photos_allowed_for(uuid) from public, anon, authenticated;
grant  execute on function photos_allowed_for(uuid) to service_role;

-- -----------------------------------------------------------------------------
-- D. The block's display read, per activity
-- -----------------------------------------------------------------------------
create function photo_answers_on(p_activity_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.photos_allowed_for(p_activity_id);
$$;

comment on function photo_answers_on(uuid) is
  'Whether students may add photos to this activity (0099; photos_allowed_for). A display read only: the gates re-check on the server.';

revoke execute on function photo_answers_on(uuid) from public, anon;
grant  execute on function photo_answers_on(uuid) to authenticated, service_role;

-- -----------------------------------------------------------------------------
-- C. The gates (live bodies; only the switch read changes)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.work_photo_reserved(p_name text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select exists (
       select 1 from public.work_photos w
       where w.object_name = p_name
         and w.student_id = auth.uid()
         and w.attached_at is null
         and w.keep_until > now()
         and public.photos_allowed_for(w.activity_id)
     );
$function$;

CREATE OR REPLACE FUNCTION public.photo_block_gate(p_uid uuid, p_activity_id uuid, p_version_id uuid, p_block_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_block jsonb;
begin
  if not photos_allowed_for(p_activity_id) then
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
$function$;

CREATE OR REPLACE FUNCTION public.section_checks_attach_photos()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
     and not photos_allowed_for(new.activity_id) then
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
$function$;

-- -----------------------------------------------------------------------------
-- E. "Not owed while off", per activity (live bodies from 0097)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.activity_progress(p_activity_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_act activities%rowtype;
  v_out jsonb;
  v_photos_on boolean;
begin
  v_photos_on := photos_allowed_for(p_activity_id);
  if auth.uid() is null or p_activity_id is null or not can_read_activity(p_activity_id) then
    raise exception 'not_your_activity' using errcode = '42501';
  end if;
  select * into v_act from activities where id = p_activity_id;

  with my_classes as (
    select c.id as class_id, c.name
    from classes c
    join class_activities ca on ca.class_id = c.id and ca.activity_id = p_activity_id
    where c.teacher_id = auth.uid()
      and c.deleted_at is null
      and v_act.status = 'published'
      and v_act.current_version_id is not null
      and v_act.deleted_at is null
  ),
  roster as (
    select m.class_id, m.student_id,
           coalesce(nullif(btrim(u.display_name), ''), u.email, 'Unknown') as name
    from class_members m
    join my_classes mc on mc.class_id = m.class_id
    join users u on u.id = m.student_id
    where m.removed_at is null
  ),
  students as (
    select distinct student_id from roster
  ),
  checks as (
    -- 0064: only the columns read below.
    select sc.id as check_id, sc.student_id, sc.activity_id, sc.activity_version_id, sc.section_id,
           sc.attempt_number, sc.created_at, sc.section_total, sc.verdicts
    from section_checks sc
    join students s on s.student_id = sc.student_id
    where sc.activity_id = p_activity_id
  ),
  per_version as (
    select c.student_id, c.activity_version_id,
           count(distinct c.section_id)::integer as checked,
           (array_agg(c.section_total order by c.created_at desc)
              filter (where c.section_total is not null))[1] as total,
           max(c.created_at) as last_at
    from checks c
    group by c.student_id, c.activity_version_id
  ),
  latest as (
    select distinct on (c.student_id, c.activity_version_id, c.section_id)
           c.*,
           count(*) over (partition by c.student_id, c.activity_version_id, c.section_id) as attempts
    from checks c
    order by c.student_id, c.activity_version_id, c.section_id,
             c.attempt_number desc, c.created_at desc
  ),
  section_scores as (
    select l.student_id, l.activity_version_id, l.section_id, l.attempts,
           l.created_at,
           count(v.key) filter (where v.value->>'verdict' = 'correct')::integer as correct,
           count(v.key) filter (where v.value->>'verdict' in ('correct', 'incorrect'))::integer as marked
    from latest l
    left join lateral jsonb_each(
      case when jsonb_typeof(l.verdicts) = 'object' then l.verdicts else '{}'::jsonb end) v on true
    group by l.student_id, l.activity_version_id, l.section_id, l.attempts, l.created_at
  ),
  hand as (
    select l.student_id, count(*)::integer as n
    from latest l
    join activity_versions av on av.id = l.activity_version_id
    cross join lateral jsonb_array_elements(coalesce(av.content->'sections', '[]'::jsonb)) s
    cross join lateral jsonb_array_elements(coalesce(s->'rows', '[]'::jsonb)) r
    cross join lateral jsonb_array_elements(coalesce(r->'columns', '[]'::jsonb)) col
    cross join lateral jsonb_array_elements(coalesce(col->'blocks', '[]'::jsonb)) b
    where s->>'id' = l.section_id
      and hand_grade_owed(b->>'type', l.check_id, (b->>'id')::uuid, v_photos_on,
                          jsonb_typeof(s->'dol') = 'object')
      and not (jsonb_typeof(s->'dol') = 'object' and dol_optional_block(s, b->>'id'))
      and not exists (
        select 1
        from check_grades cg
        join section_checks g on g.id = cg.check_id
        where g.student_id = l.student_id
          and g.activity_version_id = l.activity_version_id
          and g.section_id = l.section_id
          and cg.block_id = (b->>'id')::uuid
      )
    group by l.student_id
  ),
  per_student as (
    -- 0064: grouped once instead of three correlated subqueries per student.
    select pv.student_id,
           bool_or(pv.activity_version_id <> v_act.current_version_id) as earlier_checked,
           bool_or(pv.activity_version_id <> v_act.current_version_id
                   and pv.total is not null
                   and pv.checked >= pv.total) as earlier_done,
           max(pv.last_at) as last_checked_at
    from per_version pv
    group by pv.student_id
  ),
  shown as (
    select distinct on (pv.student_id) pv.*
    from per_version pv
    order by pv.student_id,
             (pv.activity_version_id = v_act.current_version_id) desc, pv.last_at desc
  ),
  summary as (
    select s.student_id,
           cur.total                              as sections_total,
           coalesce(cur.checked, 0)               as sections_checked,
           coalesce(ps.earlier_checked, false)    as earlier_checked,
           coalesce(ps.earlier_done, false)       as earlier_done,
           shown.activity_version_id              as shown_version_id,
           shown.total                            as shown_total,
           shown.checked                          as shown_checked,
           coalesce(h.n, 0)                       as to_grade,
           ps.last_checked_at
    from students s
    left join per_version cur
      on cur.student_id = s.student_id
     and cur.activity_version_id = v_act.current_version_id
    left join shown       on shown.student_id = s.student_id
    left join per_student ps on ps.student_id = s.student_id
    left join hand h      on h.student_id = s.student_id
  )
  select jsonb_build_object(
    'activity', jsonb_build_object('id', v_act.id, 'title', v_act.title,
                                   'current_version_id', v_act.current_version_id),
    'classes', (select coalesce(jsonb_agg(jsonb_build_object(
                         'class_id', mc.class_id, 'name', mc.name,
                         'students', (select coalesce(jsonb_agg(
                                         jsonb_build_object('student_id', r.student_id, 'name', r.name)
                                           || (to_jsonb(sm) - 'student_id')
                                         order by lower(r.name), r.student_id), '[]'::jsonb)
                                        from roster r
                                        join summary sm on sm.student_id = r.student_id
                                       where r.class_id = mc.class_id))
                       order by lower(mc.name), mc.class_id), '[]'::jsonb)
                  from my_classes mc),
    'sections', (select coalesce(jsonb_agg(jsonb_build_object(
                          'student_id', ss.student_id,
                          'version_id', ss.activity_version_id,
                          'section_id', ss.section_id,
                          'attempts', ss.attempts,
                          'correct', ss.correct,
                          'marked', ss.marked,
                          'checked_at', ss.created_at)), '[]'::jsonb)
                   from section_scores ss),
    'last_check_at', (select max(pv.last_at) from per_version pv))
  into v_out;

  return v_out;
end;
$function$;

CREATE OR REPLACE FUNCTION public.class_progress(p_class_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_class classes%rowtype;
  v_out   jsonb;
begin
  if auth.uid() is null or p_class_id is null or not is_class_teacher(p_class_id) then
    raise exception 'not_class_teacher' using errcode = '42501';
  end if;
  select * into v_class from classes where id = p_class_id;

  with roster as (
    select m.student_id,
           coalesce(nullif(btrim(u.display_name), ''), u.email, 'Unknown') as name
    from class_members m
    join users u on u.id = m.student_id
    where m.class_id = p_class_id
      and m.removed_at is null
  ),
  acts as (
    select ca.activity_id, a.title, a.current_version_id, ca.added_at
    from class_activities ca
    join activities a on a.id = ca.activity_id
    where ca.class_id = p_class_id
      and a.status = 'published'
      and a.current_version_id is not null
      and a.deleted_at is null
  ),
  checks as (
    -- 0064: only the columns read below; `responses` no longer rides the sort.
    select sc.id as check_id, sc.student_id, sc.activity_id, sc.activity_version_id, sc.section_id,
           sc.attempt_number, sc.created_at, sc.section_total, sc.verdicts
    from section_checks sc
    join roster r on r.student_id = sc.student_id
    join acts   on acts.activity_id = sc.activity_id
  ),
  per_version as (
    select c.student_id, c.activity_id, c.activity_version_id,
           count(distinct c.section_id)::integer as checked,
           (array_agg(c.section_total order by c.created_at desc)
              filter (where c.section_total is not null))[1] as total,
           max(c.created_at) as last_at
    from checks c
    group by c.student_id, c.activity_id, c.activity_version_id
  ),
  latest as (
    -- One row per student × version × section: the latest attempt (the
    -- list_grading_queue order: attempt, then time).
    select distinct on (c.student_id, c.activity_version_id, c.section_id) c.*
    from checks c
    order by c.student_id, c.activity_version_id, c.section_id,
             c.attempt_number desc, c.created_at desc
  ),
  scores as (
    -- correct ÷ marked over each section's latest attempt; 'recorded' items
    -- (essays, short answers) are not marked (CP-2).
    select l.student_id, l.activity_version_id,
           count(*) filter (where v.value->>'verdict' = 'correct')::integer as correct,
           count(*) filter (where v.value->>'verdict' in ('correct', 'incorrect'))::integer as marked
    from latest l
    cross join lateral jsonb_each(
      case when jsonb_typeof(l.verdicts) = 'object' then l.verdicts else '{}'::jsonb end) v
    group by l.student_id, l.activity_version_id
  ),
  hand as (
    -- CP-7: hand-graded blocks on each latest check with no grade yet. The
    -- same block walk and "graded" test as list_grading_queue (0034), so the
    -- number matches the ungraded rows Responses shows for this student.
    select l.student_id, l.activity_id, count(*)::integer as n
    from latest l
    join activity_versions av on av.id = l.activity_version_id
    cross join lateral jsonb_array_elements(coalesce(av.content->'sections', '[]'::jsonb)) s
    cross join lateral jsonb_array_elements(coalesce(s->'rows', '[]'::jsonb)) r
    cross join lateral jsonb_array_elements(coalesce(r->'columns', '[]'::jsonb)) col
    cross join lateral jsonb_array_elements(coalesce(col->'blocks', '[]'::jsonb)) b
    where s->>'id' = l.section_id
      and hand_grade_owed(b->>'type', l.check_id, (b->>'id')::uuid, photos_allowed_for(l.activity_id),
                          jsonb_typeof(s->'dol') = 'object')
      and not (jsonb_typeof(s->'dol') = 'object' and dol_optional_block(s, b->>'id'))
      and not exists (
        select 1
        from check_grades cg
        join section_checks g on g.id = cg.check_id
        where g.student_id = l.student_id
          and g.activity_version_id = l.activity_version_id
          and g.section_id = l.section_id
          and cg.block_id = (b->>'id')::uuid
      )
    group by l.student_id, l.activity_id
  ),
  per_activity as (
    -- 0064: the old cell CTE ran three correlated subqueries per roster ×
    -- activity cell, each scanning all of per_version (quadratic in students ×
    -- activities). Grouped once instead; the values are the same.
    select pv.student_id, pv.activity_id,
           bool_or(pv.activity_version_id <> acts.current_version_id) as earlier_checked,
           bool_or(pv.activity_version_id <> acts.current_version_id
                   and pv.total is not null
                   and pv.checked >= pv.total) as earlier_done,
           max(pv.last_at) as last_checked_at
    from per_version pv
    join acts on acts.activity_id = pv.activity_id
    group by pv.student_id, pv.activity_id
  ),
  shown as (
    -- The version a cell displays: the current one if checked, else the most
    -- recently checked (the old lateral's order).
    select distinct on (pv.student_id, pv.activity_id) pv.*
    from per_version pv
    join acts on acts.activity_id = pv.activity_id
    order by pv.student_id, pv.activity_id,
             (pv.activity_version_id = acts.current_version_id) desc, pv.last_at desc
  ),
  cells as (
    select r.student_id, acts.activity_id, acts.current_version_id,
           cur.total                    as sections_total,
           coalesce(cur.checked, 0)     as sections_checked,
           pa.earlier_checked,
           pa.earlier_done,
           shown.activity_version_id    as shown_version_id,
           shown.total                  as shown_total,
           shown.checked                as shown_checked,
           coalesce(sco.correct, 0)     as correct,
           coalesce(sco.marked, 0)      as marked,
           coalesce(h.n, 0)             as to_grade,
           pa.last_checked_at
    from roster r
    join shown        on shown.student_id = r.student_id
    join acts         on acts.activity_id = shown.activity_id
    join per_activity pa
      on pa.student_id = r.student_id
     and pa.activity_id = acts.activity_id
    left join per_version cur
      on cur.student_id = r.student_id
     and cur.activity_id = acts.activity_id
     and cur.activity_version_id = acts.current_version_id
    left join scores sco
      on sco.student_id = r.student_id
     and sco.activity_version_id = shown.activity_version_id
    left join hand h
      on h.student_id = r.student_id
     and h.activity_id = acts.activity_id
  )
  select jsonb_build_object(
    'class', jsonb_build_object('id', v_class.id, 'name', v_class.name,
                                'join_code', v_class.join_code),
    'students', (select coalesce(jsonb_agg(jsonb_build_object(
                          'student_id', r.student_id, 'name', r.name)
                        order by lower(r.name), r.student_id), '[]'::jsonb)
                   from roster r),
    'activities', (select coalesce(jsonb_agg(jsonb_build_object(
                            'activity_id', a.activity_id, 'title', a.title,
                            'current_version_id', a.current_version_id,
                            'added_at', a.added_at)
                          order by a.added_at desc, a.activity_id desc), '[]'::jsonb)
                     from acts a),
    'cells', (select coalesce(jsonb_agg(to_jsonb(c)), '[]'::jsonb) from cells c),
    'last_check_at', (select max(c.last_checked_at) from cells c))
  into v_out;

  return v_out;
end;
$function$;

CREATE OR REPLACE FUNCTION public.list_grading_queue(p_activity_id uuid)
 RETURNS TABLE(check_id uuid, student_id uuid, student_label text, in_your_class boolean, activity_version_id uuid, version_num integer, is_current boolean, section_id text, block_id uuid, block_type text, response_text text, response_photos jsonb, attempt_number integer, checked_at timestamp with time zone, graded boolean, criteria jsonb, general_feedback text, graded_at timestamp with time zone, released_at timestamp with time zone, has_grader boolean, stale boolean)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_photos_on boolean := photos_allowed_for(p_activity_id);
begin
  if auth.uid() is null then
    raise exception 'Sign in before grading';
  end if;
  if not can_read_activity(p_activity_id) then
    raise log 'grading queue refused (not_owner) user=% activity=%', auth.uid(), p_activity_id;
    raise exception 'Not your activity';
  end if;

  return query
  with latest as (
    -- The queue's unit of "current work": one check per student, per section,
    -- per version (G2). Version scoping is not cosmetic — block and section
    -- ids are minted fresh on every publish, so a cross-version "latest" is
    -- comparing identifiers that were never the same question.
    select distinct on (sc.student_id, sc.activity_version_id, sc.section_id) sc.*
    from section_checks sc
    where sc.activity_id = p_activity_id
    order by sc.student_id, sc.activity_version_id, sc.section_id,
             sc.attempt_number desc, sc.created_at desc
  ),
  blocks as (
    -- Every hand-graded block of each section (is_manually_graded_type, 0096),
    -- from the pinned document.
    select l.id as check_id, l.student_id, l.activity_version_id, l.section_id,
           l.attempt_number, l.created_at, l.responses,
           (b->>'id')::uuid as block_id,
           b->>'type'       as block_type,
           (jsonb_typeof(s->'dol') = 'object') as in_dol
    from latest l
    join activity_versions av on av.id = l.activity_version_id
    cross join lateral jsonb_array_elements(coalesce(av.content->'sections', '[]'::jsonb)) s
    cross join lateral jsonb_array_elements(coalesce(s->'rows', '[]'::jsonb)) r
    cross join lateral jsonb_array_elements(coalesce(r->'columns', '[]'::jsonb)) c
    cross join lateral jsonb_array_elements(coalesce(c->'blocks', '[]'::jsonb)) b
    where s->>'id' = l.section_id
      and is_manually_graded_type(b->>'type')
  ),
  graded as (
    -- The winning grade per (student, version, section, block): latest by
    -- graded_at, and NOT necessarily attached to the latest check — that gap
    -- is precisely what `stale` reports.
    select distinct on (sc.student_id, sc.activity_version_id, sc.section_id, cg.block_id)
           sc.student_id, sc.activity_version_id, sc.section_id, cg.block_id,
           cg.criteria, cg.general_feedback, cg.graded_at, cg.released_at,
           cg.graded_by,
           sc.responses as graded_responses
    from check_grades cg
    join section_checks sc on sc.id = cg.check_id
    where sc.activity_id = p_activity_id
    -- Same tiebreak as §E's winner, and for the same reason: graded_at is a
    -- transaction timestamp, so it ties whenever two grades were written
    -- together. Later attempt wins; the uuid is only a last-resort determinism
    -- backstop.
    order by sc.student_id, sc.activity_version_id, sc.section_id, cg.block_id,
             cg.graded_at desc, sc.attempt_number desc, cg.id desc
  ),
  roster as (
    -- The caller's live roster: the students whose identity they may see.
    select distinct cm.student_id
    from class_members cm
    join classes cl on cl.id = cm.class_id
    where cl.teacher_id = auth.uid()
      and cl.deleted_at is null
      and cm.removed_at is null
  )
  select bl.check_id,
         bl.student_id,
         case when ro.student_id is not null then u.email else null end,
         (ro.student_id is not null),
         bl.activity_version_id,
         av.version_num,
         (av.id = a.current_version_id),
         bl.section_id,
         bl.block_id,
         bl.block_type,
         bl.responses->'freeText'->>bl.block_id::text,
         -- 0096: the photo ids the check handed in, in order ({id} or
         -- {id, removed}); NULL for a text block or a photo block left empty.
         bl.responses->'photos'->bl.block_id::text,
         bl.attempt_number,
         bl.created_at,
         (g.block_id is not null),
         g.criteria,
         g.general_feedback,
         g.graded_at,
         g.released_at,
         (g.graded_by is not null),
         coalesce(
           g.block_id is not null
           and ((g.graded_responses->'freeText'->>bl.block_id::text)
                  is distinct from
                (bl.responses->'freeText'->>bl.block_id::text)
                -- MS-18: a photo answer is stale when the ORDERED list of
                -- photo ids differs (ids are immutable; a removed flag is not
                -- a change the student made).
                or photo_ids_of(g.graded_responses, bl.block_id)
                     is distinct from photo_ids_of(bl.responses, bl.block_id)),
           false
         )
  from blocks bl
  join activity_versions av on av.id = bl.activity_version_id
  join activities a on a.id = p_activity_id
  join users u on u.id = bl.student_id
  left join roster ro on ro.student_id = bl.student_id
  left join graded g
    on g.student_id = bl.student_id
   and g.activity_version_id = bl.activity_version_id
   and g.section_id = bl.section_id
   and g.block_id = bl.block_id
  -- 0097: a photo question left empty while photo answers are off is not
  -- owed (no student could answer it); one already graded stays listed.
  where g.block_id is not null
     or hand_grade_owed(bl.block_type, bl.check_id, bl.block_id, v_photos_on, bl.in_dol)
  order by av.version_num desc, bl.section_id, bl.block_id, u.email;
end;
$function$;

CREATE OR REPLACE FUNCTION public.class_student_work(p_class_id uuid, p_student_id uuid, p_activity_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_act  activities%rowtype;
  v_name text;
  v_out  jsonb;
begin
  if auth.uid() is null or p_student_id is null or p_activity_id is null
     or not exists (
       select 1
       from classes c
       join class_members m     on m.class_id = c.id
       join class_activities ca on ca.class_id = c.id
       join activities a        on a.id = ca.activity_id
       where c.teacher_id = auth.uid()
         and c.deleted_at is null
         and (p_class_id is null or c.id = p_class_id)
         and m.student_id = p_student_id
         and m.removed_at is null
         and ca.activity_id = p_activity_id
         and a.status = 'published'
         and a.current_version_id is not null
         and a.deleted_at is null
     ) then
    raise exception 'not_in_scope' using errcode = '42501';
  end if;

  select * into v_act from activities where id = p_activity_id;
  select coalesce(nullif(btrim(u.display_name), ''), u.email, 'Unknown')
    into v_name from users u where u.id = p_student_id;

  with first_try as (
    -- FT-8: attempt 1 of each section, shown by the panel's First try switch.
    select sc.activity_version_id, sc.section_id, sc.responses, sc.verdicts, sc.created_at
    from section_checks sc
    where sc.student_id = p_student_id
      and sc.activity_id = p_activity_id
      and sc.attempt_number = 1
  ),
  latest as (
    select distinct on (sc.activity_version_id, sc.section_id)
           sc.*,
           count(*) over (partition by sc.activity_version_id, sc.section_id) as attempts
    from section_checks sc
    where sc.student_id = p_student_id
      and sc.activity_id = p_activity_id
    order by sc.activity_version_id, sc.section_id,
             sc.attempt_number desc, sc.created_at desc
  ),
  graded as (
    select sc.activity_version_id, sc.section_id,
           jsonb_agg(distinct cg.block_id) as block_ids
    from check_grades cg
    join section_checks sc on sc.id = cg.check_id
    where sc.student_id = p_student_id
      and sc.activity_id = p_activity_id
    group by sc.activity_version_id, sc.section_id
  ),
  versions as (
    select l.activity_version_id, av.version_num,
           (l.activity_version_id = v_act.current_version_id) as is_current,
           jsonb_agg(jsonb_build_object(
             'section_id', l.section_id,
             'attempts', l.attempts,
             'attempt_number', l.attempt_number,
             'checked_at', l.created_at,
             'responses', l.responses,
             'verdicts', l.verdicts,
             'graded_block_ids', coalesce(g.block_ids, '[]'::jsonb),
             'first', case when f.section_id is null then null
                           else jsonb_build_object('responses', f.responses,
                                                   'verdicts', f.verdicts,
                                                   'checked_at', f.created_at) end)
           order by l.section_id) as sections
    from latest l
    join activity_versions av on av.id = l.activity_version_id
    left join graded g
      on g.activity_version_id = l.activity_version_id
     and g.section_id = l.section_id
    left join first_try f
      on f.activity_version_id = l.activity_version_id
     and f.section_id = l.section_id
    group by l.activity_version_id, av.version_num
  )
  select jsonb_build_object(
    'student', jsonb_build_object('id', p_student_id, 'name', v_name),
    -- 0097: the panel's "N to grade" skips an empty photo answer while this
    -- is false, the same rule as hand_grade_owed.
    'photos_on', photos_allowed_for(p_activity_id),
    'activity', jsonb_build_object('id', v_act.id, 'title', v_act.title,
                                   'current_version_id', v_act.current_version_id),
    'versions', (select coalesce(jsonb_agg(jsonb_build_object(
                          'version_id', v.activity_version_id,
                          'version_num', v.version_num,
                          'is_current', v.is_current,
                          'sections', v.sections)
                        order by v.is_current desc, v.version_num desc), '[]'::jsonb)
                   from versions v))
  into v_out;

  return v_out;
end;
$function$;

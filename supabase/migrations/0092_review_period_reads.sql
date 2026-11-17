-- =============================================================================
-- 0092_review_period_reads.sql — the review period's reads (review-period.md,
-- slice 4; RV-2, RV-7, RV-14)
-- -----------------------------------------------------------------------------
--   mixed_class_summary v3  + period_minutes, review_on
--   class_plan v2           each day + its review (focus chains, double); a day
--                           with only a review is listed
--   class_today v2          + review (today has one AND the keys are mirrored)
--   review_preview          NEW, teacher only: the session's size and how many
--                           students' pools would fill less than review_min_fill
--                           of it, as if it ran today
--
-- Reads only: no table, column or grant change, so no personal data is added.
-- review_preview returns counts, never a student. Apply BEFORE the planner and
-- practice-settings UI that call it is pushed (OV-7).
-- =============================================================================

-- 0083's summary, plus the period length and the review switch.
create or replace function mixed_class_summary(p_class_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_class classes%rowtype;
  v_basis record;
  v_win   integer;
  v_min   integer;
  v_today date;
begin
  if auth.uid() is null or p_class_id is null or not is_class_teacher(p_class_id) then
    raise exception 'not_class_teacher' using errcode = '42501';
  end if;
  select * into v_class from classes where id = p_class_id;
  select * into v_basis from mixed_basis(p_class_id);
  v_win   := coalesce((v_basis.settings->>'mixed_struggling_window')::integer, 5);
  v_min   := coalesce((v_basis.settings->>'mixed_struggling_min_right')::integer, 3);
  v_today := (now() at time zone fact_class_zone(p_class_id))::date;

  return jsonb_build_object(
    'on_at', v_class.mixed_on_at,
    'reason', v_basis.reason,
    'items_per_session', v_class.mixed_items_per_session,
    'default_items', (v_basis.settings->>'mixed_items_per_session')::integer,
    -- PA-10's helper line (0083). Null until a registry carries them.
    'period_shapes', v_basis.settings->'period_shapes',
    'seconds_per_item', v_basis.settings->'mixed_seconds_per_item',
    -- 0092 (review period, RV-2/RV-7): the class's period length, and whether
    -- the review keys are mirrored (a review placed before then does nothing).
    'period_minutes', v_class.period_minutes,
    'review_on', coalesce(v_basis.settings ? 'review_items_max', false),
    'graded', v_class.mixed_graded,
    'school_year_ends_on', v_class.school_year_ends_on,
    -- DM-9: does ANY skill a student of this class has checked have a bank?
    'has_bank', exists (
      select 1 from class_members m
      cross join lateral mixed_taught(p_class_id, m.student_id, fact_class_zone(p_class_id)) t
      where m.class_id = p_class_id and m.removed_at is null
        and exists (select 1 from practice_item p
                     where p.owner_id = t.owner_id and p.skill_id = t.skill_id
                       and p.role = 'skill' and p.status = 'ratified' and p.retired_at is null)),
    'in_class', (select count(*) from class_members m
                  where m.class_id = p_class_id and m.removed_at is null),
    'practised_today', (select count(distinct a.student_id) from mixed_attempts a
                         join class_members m on m.class_id = a.class_id and m.student_id = a.student_id
                                             and m.removed_at is null
                        where a.class_id = p_class_id and a.practice_day = v_today),
    'practised_week', (select count(distinct a.student_id) from mixed_attempts a
                        join class_members m on m.class_id = a.class_id and m.student_id = a.student_id
                                            and m.removed_at is null
                       where a.class_id = p_class_id and a.practice_day > v_today - 7),
    'skills', (select coalesce(jsonb_agg(jsonb_build_object(
                 'skill_id', r.bank_key,
                 'label', l.label,
                 'students_practising', r.students,
                 'struggling', r.struggling,
                 'first_tries_right', r.right_n,
                 'first_tries', r.tries,
                 'skips', r.skips) order by r.bank_key), '[]'::jsonb)
               from (select bank_key, count(*) as students,
                            count(*) filter (where tries - right_n > v_win - v_min) as struggling,
                            sum(right_n) as right_n, sum(tries) as tries, sum(skipped_n) as skips
                       from mixed_recent(p_class_id, v_win) group by bank_key) r
               left join skill_label l on l.id = r.bank_key));
end;
$$;

-- 0088's plan, plus each day's review.
create or replace function class_plan(p_class_id uuid, p_from date, p_to date)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_today date;
  v_last  date;
begin
  if not is_class_teacher(p_class_id) then
    raise exception 'Not your class' using errcode = '42501';
  end if;
  if p_from is null or p_to is null or p_to < p_from or p_to - p_from > 92 then
    raise exception 'bad_range';
  end if;
  v_today := (now() at time zone fact_class_zone(p_class_id))::date;
  select max(on_date) into v_last from class_period_items
   where class_id = p_class_id and on_date < v_today;

  return jsonb_build_object(
    'today', v_today,
    'limit', class_plan_limit(p_class_id, v_today),
    'days', (
      select coalesce(jsonb_agg(jsonb_build_object(
               'on_date', d.on_date,
               'activities', (
                 select coalesce(jsonb_agg(jsonb_build_object(
                          'activity_id', a.id, 'title', a.title, 'minutes', a.minutes,
                          'position', i.position, 'available', class_plan_visible(a.id))
                        order by i.position), '[]'::jsonb)
                   from class_period_items i join activities a on a.id = i.activity_id
                  where i.class_id = p_class_id and i.on_date = d.on_date),
               'hook_ids', (
                 select coalesce(jsonb_agg(h.hook_id order by h.hook_id), '[]'::jsonb)
                   from class_hook_use h
                  where h.class_id = p_class_id and h.used_on = d.on_date),
               -- 0092: the day's review period (0091), or null.
               'review', (
                 select jsonb_build_object('focus_chains', to_jsonb(r.focus_chains), 'is_double', r.is_double)
                   from class_period_reviews r
                  where r.class_id = p_class_id and r.on_date = d.on_date))
             order by d.on_date), '[]'::jsonb)
        from (select i.on_date from class_period_items i
               where i.class_id = p_class_id and i.on_date between p_from and p_to
              union
              select h.used_on from class_hook_use h
               where h.class_id = p_class_id and h.used_on between p_from and p_to
              union
              select r.on_date from class_period_reviews r
               where r.class_id = p_class_id and r.on_date between p_from and p_to) d(on_date)),
    'last_day', case when v_last is null then null else jsonb_build_object(
      'on_date', v_last,
      'activities', (
        select coalesce(jsonb_agg(jsonb_build_object(
                 'activity_id', a.id, 'title', a.title, 'minutes', a.minutes,
                 'position', i.position, 'available', class_plan_visible(a.id))
               order by i.position), '[]'::jsonb)
          from class_period_items i join activities a on a.id = i.activity_id
         where i.class_id = p_class_id and i.on_date = v_last)) end);
end;
$$;

-- 0088's today, plus the review flag.
create or replace function class_today(p_class_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_today date;
begin
  if not exists (select 1 from classes c where c.id = p_class_id and c.deleted_at is null)
     or not (is_class_teacher(p_class_id) or is_class_member(p_class_id)) then
    raise exception 'Not available' using errcode = '42501';
  end if;
  v_today := (now() at time zone fact_class_zone(p_class_id))::date;
  return jsonb_build_object(
    'on_date', v_today,
    'activities', (
      select coalesce(jsonb_agg(jsonb_build_object('activity_id', a.id, 'title', a.title,
                                                   'minutes', a.minutes)
                                order by i.position), '[]'::jsonb)
        from (select i.activity_id, i.position from class_period_items i
                join activities x on x.id = i.activity_id
               where i.class_id = p_class_id and i.on_date = v_today
                 and x.status = 'published' and x.current_version_id is not null
                 and x.deleted_at is null
               order by i.position limit 6) i
        join activities a on a.id = i.activity_id),
    -- 0092: a review period today, and only once the review keys are mirrored
    -- (before then a placed review changes nothing a student does).
    'review', exists (select 1 from class_period_reviews r
                       where r.class_id = p_class_id and r.on_date = v_today)
              and coalesce((select b.settings ? 'review_items_max' from mixed_basis(p_class_id) b), false));
end;
$$;

-- The planner's estimate (RV-7): the size of a review on this class, and how
-- many live-roster students' plans would fill less than review_min_fill of
-- it, as if it ran on p_on_date (today when null or past) with what each
-- student has done so far. Counts only. Planned for a later day, nothing
-- practised today is held back, and more skills are due.
create or replace function review_preview(p_class_id uuid, p_is_double boolean default false,
                                          p_on_date date default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_basis record;
  v_zone  text;
  v_today date;
  v_items integer;
  v_floor integer;
  v_students integer := 0;
  v_thin  integer := 0;
  v_empty integer := 0;
  v_n     integer;
  v_sid   uuid;
  v_chains jsonb;
begin
  if auth.uid() is null or p_class_id is null or not is_class_teacher(p_class_id) then
    raise exception 'not_class_teacher' using errcode = '42501';
  end if;
  -- The chains this class's activities sit in, for the focus picker (RV-10):
  -- the source's folder, so a Bank copy counts under its source's chain, the
  -- same rule review_plan's focus uses.
  select coalesce(jsonb_agg(jsonb_build_object('chain_id', c.chain_id, 'activities', c.n)
                            order by c.first_path), '[]'::jsonb)
    into v_chains
    from (select regexp_replace(split_part(src.source_path, '/', 1), '^[0-9]+-', '') as chain_id,
                 count(*) as n, min(src.source_path) as first_path
            from class_activities ca
            join activities a   on a.id = ca.activity_id
            join activities src on src.id = coalesce(a.copied_from_activity_id, a.id)
           where ca.class_id = p_class_id and src.source_path is not null
             and split_part(src.source_path, '/', 1) ~ '^[0-9]+-chain\.[a-z0-9][a-z0-9.-]*$'
           group by 1) c;
  select * into v_basis from mixed_basis(p_class_id);
  if v_basis.settings is null or not v_basis.settings ? 'review_items_max' then
    return jsonb_build_object('review_on', false, 'chains', v_chains);
  end if;
  v_zone  := fact_class_zone(p_class_id);
  v_today := greatest((now() at time zone v_zone)::date,
                      coalesce(p_on_date, (now() at time zone v_zone)::date));
  v_items := review_items_for(p_class_id, v_basis.settings, p_is_double);
  v_floor := ceil(v_items * (v_basis.settings->>'review_min_fill')::numeric);
  for v_sid in select m.student_id from class_members m
                where m.class_id = p_class_id and m.removed_at is null loop
    v_students := v_students + 1;
    select count(*) into v_n
      from review_plan(p_class_id, v_sid, gen_random_uuid(), v_today, v_basis.settings, v_items,
                       v_zone, '{}');
    if v_n = 0 then v_empty := v_empty + 1; end if;
    if v_n < v_floor then v_thin := v_thin + 1; end if;
  end loop;
  return jsonb_build_object('review_on', true, 'capacity', v_items, 'students', v_students,
                            'thin', v_thin, 'empty', v_empty, 'chains', v_chains);
end;
$$;
revoke execute on function review_preview(uuid, boolean, date) from public, anon;
grant  execute on function review_preview(uuid, boolean, date) to authenticated, service_role;
-- mixed_class_summary, class_plan and class_today: `create or replace` keeps
-- their grants.

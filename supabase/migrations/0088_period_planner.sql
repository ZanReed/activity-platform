-- =============================================================================
-- 0088_period_planner.sql — planning days ahead, a time per activity, and the
-- teacher's timezone (docs/design/period-planner.md, PP-1…PP-12, ruled by the
-- author 2026-11-13)
-- -----------------------------------------------------------------------------
--   §A  activities.minutes — about how long an activity takes (PP-5); the Bank
--       copy carries it ("Make a copy" is client code and carries it there)
--   §B  class_period_items keeps the latest past day (PP-2), not none
--   §C  set_class_plan / class_plan / move_class_plan_item / reorder_class_plan
--       (PP-3, PP-4); the cap counts only activities the teacher can still see
--   §D  set_class_today becomes a call to set_class_plan with the class's
--       today; class_today gains each activity's minutes (PA-5)
--   §E  my_timezone / set_my_timezone (PP-11)
--   §F  grants
--
-- PERSONAL DATA: none added. `minutes` is about content. class_period_items
-- still names no person (data-map draft-48). Keeping the latest past day is a
-- retention change to planning state (retention-policy moves in this commit).
-- users.timezone already exists (0036) and is documented; this only gives it a
-- write path. Who planned what goes to audit_log, as 0082 does.
--
-- Nothing here gates a student: students still read TODAY only, through
-- class_today. The plan ahead is the teacher's (PP-1).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A. activities.minutes
-- -----------------------------------------------------------------------------
alter table activities
  add column minutes smallint
    check (minutes is null or minutes between 1 and 120);

comment on column activities.minutes is
  'About how long the activity takes a typical class, whole minutes (0088, PP-5). Row-native like pedagogical_role: the catalogue''s ```meta `minutes:` sets it through the importer, the owner edits it in the editor''s settings drawer, a Bank copy and "Make a copy" carry it. NULL = not set; no default is ever guessed.';

-- 0054's copy_bank_activity, plus `minutes` in the copied columns.
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

  v_base := v_src.slug;
  v_slug := v_base;
  while exists (select 1 from activities where owner_id = auth.uid() and slug = v_slug) loop
    v_try := v_try + 1;
    v_slug := case when v_try <= 4 then v_base || '-' || (v_try + 1)
                   else v_base || '-' || substr(md5(random()::text), 1, 6) end;
  end loop;

  insert into activities (
    owner_id, title, slug, course, unit, description, tags, pedagogical_role, minutes,
    status, visibility, draft_content,
    copied_from_activity_id, copied_from_version_id)
  values (
    auth.uid(), v_src.title, v_slug, v_src.course, v_src.unit, v_src.description,
    v_src.tags, v_src.pedagogical_role, v_src.minutes,
    'draft', 'private', v_content,
    v_src.id, v_src.current_version_id)
  returning id into v_new_id;

  perform publish_activity(v_new_id);

  insert into audit_log (actor_id, action, target_type, target_id, metadata)
  values (auth.uid(), 'activity.bank_copy', 'activity', v_new_id,
          jsonb_build_object('source_activity_id', v_src.id,
                             'source_version_id', v_src.current_version_id));

  return v_new_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- B. Keep the latest past day (PP-2)
-- -----------------------------------------------------------------------------
-- Every planner write calls this first. It removes past days EXCEPT the latest
-- one that has rows, so "Last time: … · Carry on today" survives a weekend or a
-- term break. Deletion happens only inside a write, so a class that stops
-- planning keeps its last day until its next write.
create or replace function class_plan_prune(p_class_id uuid, p_today date)
returns void
language sql
volatile
security definer
set search_path = public
as $$
  delete from class_period_items i
   where i.class_id = p_class_id
     and i.on_date < (select max(j.on_date) from class_period_items j
                       where j.class_id = p_class_id and j.on_date < p_today);
$$;

comment on table class_period_items is
  'What a class does on a day (0082, PA-4; 0088, PP-1…PP-4). Teacher-set, class-scoped, no person named. Today and later days are the plan; the latest past day is kept read-only for "carry on" (0088). Read through class_today (today, teacher and students) and class_plan (teacher); written through set_class_plan and its siblings.';

-- -----------------------------------------------------------------------------
-- C. The planner's functions
-- -----------------------------------------------------------------------------

-- The furthest day a class may plan: its school year's end while that is still
-- ahead, else a year from today (PP-2).
create or replace function class_plan_limit(p_class_id uuid, p_today date)
returns date
language sql
stable
security definer
set search_path = public
as $$
  select case when c.school_year_ends_on >= p_today then c.school_year_ends_on
              else p_today + 365 end
    from classes c where c.id = p_class_id;
$$;

-- Is this activity one the class can still use (published, current, live)?
create or replace function class_plan_visible(p_activity_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from activities a
                  where a.id = p_activity_id and a.status = 'published'
                    and a.current_version_id is not null and a.deleted_at is null);
$$;

-- The teacher's read: the days from p_from to p_to with their activities (in
-- order, with minutes; a row the class can no longer use comes back with
-- available = false so it can be removed) and the hook ids dated on each day.
-- Plus the latest past day with rows, for "Last time".
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
                  where h.class_id = p_class_id and h.used_on = d.on_date))
             order by d.on_date), '[]'::jsonb)
        from (select i.on_date from class_period_items i
               where i.class_id = p_class_id and i.on_date between p_from and p_to
              union
              select h.used_on from class_hook_use h
               where h.class_id = p_class_id and h.used_on between p_from and p_to) d(on_date)),
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

-- Lock the class and work out its today; refuse anything but its teacher.
-- Returns the class's today.
create or replace function class_plan_begin(p_class_id uuid)
returns date
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_today date;
begin
  if not is_class_teacher(p_class_id) then
    raise exception 'Not your class';
  end if;
  -- Serializes two writes at once, so the cap holds.
  -- `no key update`: blocks a second planner write, not a student joining.
  perform 1 from classes where id = p_class_id and deleted_at is null for no key update;
  if not found then
    raise exception 'Not your class';
  end if;
  v_today := (now() at time zone fact_class_zone(p_class_id))::date;
  perform class_plan_prune(p_class_id, v_today);
  return v_today;
end;
$$;

-- A day the class may write: today or later. Only ADDING to a day is held to
-- the limit, so a row left beyond a shortened year end can still be removed
-- or moved back.
create or replace function class_plan_check_day(p_class_id uuid, p_today date, p_on_date date, p_adding boolean)
returns void
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if p_on_date is null or p_on_date < p_today then
    raise exception 'past_day';
  end if;
  if p_adding and p_on_date > class_plan_limit(p_class_id, p_today) then
    raise exception 'too_far';
  end if;
end;
$$;

-- Plan or unplan one activity on one day (PP-3). Same rules as 0084's
-- set_class_today: published and in the class, at most six a day, audited,
-- a repeat is a success with no audit row. The cap counts only activities the
-- class can still use (a soft-deleted one doesn't fire the FK cascade).
create or replace function set_class_plan(p_class_id uuid, p_on_date date, p_activity_id uuid, p_on boolean)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_today date;
  v_next  integer;
begin
  v_today := class_plan_begin(p_class_id);
  perform class_plan_check_day(p_class_id, v_today, p_on_date, coalesce(p_on, false));

  if coalesce(p_on, false) then
    if not exists (select 1 from class_activities ca
                    where ca.class_id = p_class_id and ca.activity_id = p_activity_id)
       or not class_plan_visible(p_activity_id) then
      raise exception 'not_in_class';
    end if;
    if not exists (select 1 from class_period_items
                    where class_id = p_class_id and on_date = p_on_date
                      and activity_id = p_activity_id) then
      if (select count(*) from class_period_items i
           where i.class_id = p_class_id and i.on_date = p_on_date
             and class_plan_visible(i.activity_id)) >= 6 then
        raise exception 'day_full';
      end if;
      select coalesce(max(position), 0) + 1 into v_next from class_period_items
       where class_id = p_class_id and on_date = p_on_date;
      insert into class_period_items (class_id, on_date, activity_id, position)
      values (p_class_id, p_on_date, p_activity_id, v_next);
      insert into audit_log (actor_id, action, target_type, target_id, metadata)
      values (auth.uid(), 'class.update', 'class', p_class_id,
              jsonb_build_object('op', case when p_on_date = v_today then 'use_today' else 'plan_add' end,
                                 'activity_id', p_activity_id, 'on_date', p_on_date));
    end if;
  else
    delete from class_period_items
     where class_id = p_class_id and on_date = p_on_date and activity_id = p_activity_id;
    if found then
      insert into audit_log (actor_id, action, target_type, target_id, metadata)
      values (auth.uid(), 'class.update', 'class', p_class_id,
              jsonb_build_object('op', case when p_on_date = v_today then 'clear_today' else 'plan_remove' end,
                                 'activity_id', p_activity_id, 'on_date', p_on_date));
    end if;
  end if;
  return class_plan(p_class_id, p_on_date, p_on_date);
end;
$$;

-- Move one planned activity to another day (PP-3): it goes last on the new day.
-- Past days are read-only, so both days are today or later. Moving onto a day
-- that already has it just removes it from the old day.
create or replace function move_class_plan_item(p_class_id uuid, p_from_date date, p_activity_id uuid, p_to_date date)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_today date;
  v_next  integer;
begin
  v_today := class_plan_begin(p_class_id);
  perform class_plan_check_day(p_class_id, v_today, p_from_date, false);
  perform class_plan_check_day(p_class_id, v_today, p_to_date, true);
  if not exists (select 1 from class_period_items
                  where class_id = p_class_id and on_date = p_from_date and activity_id = p_activity_id) then
    raise exception 'not_planned';
  end if;
  if p_from_date = p_to_date then
    return class_plan(p_class_id, p_to_date, p_to_date);
  end if;
  if not exists (select 1 from class_period_items
                  where class_id = p_class_id and on_date = p_to_date and activity_id = p_activity_id) then
    if (select count(*) from class_period_items i
         where i.class_id = p_class_id and i.on_date = p_to_date
           and class_plan_visible(i.activity_id)) >= 6 then
      raise exception 'day_full';
    end if;
    select coalesce(max(position), 0) + 1 into v_next from class_period_items
     where class_id = p_class_id and on_date = p_to_date;
    insert into class_period_items (class_id, on_date, activity_id, position)
    values (p_class_id, p_to_date, p_activity_id, v_next);
  end if;
  delete from class_period_items
   where class_id = p_class_id and on_date = p_from_date and activity_id = p_activity_id;
  insert into audit_log (actor_id, action, target_type, target_id, metadata)
  values (auth.uid(), 'class.update', 'class', p_class_id,
          jsonb_build_object('op', 'move_plan', 'activity_id', p_activity_id,
                             'from_date', p_from_date, 'on_date', p_to_date));
  return class_plan(p_class_id, least(p_from_date, p_to_date), greatest(p_from_date, p_to_date));
end;
$$;

-- Put a day's activities in a new order (PP-4). The ids must be exactly the
-- day's rows, hidden ones included, so nothing is dropped by a stale screen.
create or replace function reorder_class_plan(p_class_id uuid, p_on_date date, p_activity_ids uuid[])
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_today date;
begin
  v_today := class_plan_begin(p_class_id);
  perform class_plan_check_day(p_class_id, v_today, p_on_date, false);
  if p_activity_ids is null
     or cardinality(p_activity_ids) <> (select count(distinct x) from unnest(p_activity_ids) x)
     or (select coalesce(array_agg(activity_id order by activity_id), '{}') from class_period_items
          where class_id = p_class_id and on_date = p_on_date)
        is distinct from
        (select coalesce(array_agg(x order by x), '{}') from unnest(p_activity_ids) x) then
    raise exception 'reorder_mismatch';
  end if;
  update class_period_items i set position = o.n
    from unnest(p_activity_ids) with ordinality o(id, n)
   where i.class_id = p_class_id and i.on_date = p_on_date and i.activity_id = o.id
     and i.position is distinct from o.n;
  if found then
    insert into audit_log (actor_id, action, target_type, target_id, metadata)
    values (auth.uid(), 'class.update', 'class', p_class_id,
            jsonb_build_object('op', 'reorder_plan', 'on_date', p_on_date));
  end if;
  return class_plan(p_class_id, p_on_date, p_on_date);
end;
$$;

-- -----------------------------------------------------------------------------
-- D. Today, on top of the planner
-- -----------------------------------------------------------------------------

-- 0082's read, plus each activity's minutes (PA-5: the student list shows
-- "about N min" once a time exists), and never more than six: a soft-deleted
-- pick frees a slot, so restoring it can leave seven rows; the first six by
-- position are the day. Still today only, for teacher and members.
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
        join activities a on a.id = i.activity_id));
end;
$$;

-- 0084's write, now one call into set_class_plan, so the two can't drift.
-- Keeps 0084's contract exactly: today only, the class_today shape, and the
-- `today_full` error the shipped Today panel matches on.
create or replace function set_class_today(p_class_id uuid, p_activity_id uuid, p_on boolean)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  begin
    perform set_class_plan(p_class_id,
                           (now() at time zone fact_class_zone(p_class_id))::date,
                           p_activity_id, p_on);
  exception when raise_exception then
    if sqlerrm = 'day_full' then
      raise exception 'today_full';
    end if;
    raise;
  end;
  return class_today(p_class_id);
end;
$$;

-- -----------------------------------------------------------------------------
-- E. The teacher's timezone (PP-11)
-- -----------------------------------------------------------------------------
-- A class's day is its teacher's zone (fact_class_zone). Until now nothing
-- could set it, so every teacher but the author ran on the America/Chicago
-- default. A direct client update of `users` hits users_update_self's
-- recursive WITH CHECK (TODOS), so the write is this DEFINER function, like
-- set_public_name. 0036's guard validates the name and queues the rollup's
-- self-heal. A change moves the day for ALL the teacher's classes.

create or replace function my_timezone()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'zone', coalesce((select u.timezone from users u
                       where u.id = auth.uid() and iana_zone_is_valid(u.timezone)),
                     analytics_default_zone()),
    'is_set', exists (select 1 from users u
                       where u.id = auth.uid() and iana_zone_is_valid(u.timezone)));
$$;

create or replace function set_my_timezone(p_zone text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if not current_user_is_teacher() then
    raise exception 'Only teachers set a timezone';
  end if;
  if p_zone is null or length(p_zone) > 64 or not iana_zone_is_valid(p_zone) then
    raise exception 'bad_zone';
  end if;
  update users set timezone = p_zone, updated_at = now()
   where id = auth.uid() and timezone is distinct from p_zone;
  if found then
    -- The zone itself is not copied into the log: the users row holds it.
    insert into audit_log (actor_id, action, target_type, target_id, metadata)
    values (auth.uid(), 'user.update', 'user', auth.uid(),
            jsonb_build_object('op', 'set_timezone'));
  end if;
  return my_timezone();
end;
$$;

-- -----------------------------------------------------------------------------
-- F. grants (0009's standing rule: every function carries its own stanza)
-- -----------------------------------------------------------------------------
-- Internal helpers: no client role calls them directly.
revoke execute on function class_plan_prune(uuid, date) from public, anon, authenticated;
revoke execute on function class_plan_limit(uuid, date) from public, anon, authenticated;
revoke execute on function class_plan_visible(uuid) from public, anon, authenticated;
revoke execute on function class_plan_begin(uuid) from public, anon, authenticated;
revoke execute on function class_plan_check_day(uuid, date, date, boolean) from public, anon, authenticated;
grant execute on function class_plan_prune(uuid, date) to service_role;
grant execute on function class_plan_limit(uuid, date) to service_role;
grant execute on function class_plan_visible(uuid) to service_role;
grant execute on function class_plan_begin(uuid) to service_role;
grant execute on function class_plan_check_day(uuid, date, date, boolean) to service_role;

revoke execute on function class_plan(uuid, date, date) from public, anon;
revoke execute on function set_class_plan(uuid, date, uuid, boolean) from public, anon;
revoke execute on function move_class_plan_item(uuid, date, uuid, date) from public, anon;
revoke execute on function reorder_class_plan(uuid, date, uuid[]) from public, anon;
revoke execute on function my_timezone() from public, anon;
revoke execute on function set_my_timezone(text) from public, anon;
grant execute on function class_plan(uuid, date, date) to authenticated, service_role;
grant execute on function set_class_plan(uuid, date, uuid, boolean) to authenticated, service_role;
grant execute on function move_class_plan_item(uuid, date, uuid, date) to authenticated, service_role;
grant execute on function reorder_class_plan(uuid, date, uuid[]) to authenticated, service_role;
grant execute on function my_timezone() to authenticated, service_role;
grant execute on function set_my_timezone(text) to authenticated, service_role;
-- class_today, set_class_today, copy_bank_activity: `create or replace` keeps
-- their 0082 / 0054 grants.

-- =============================================================================
-- 0082_class_today.sql — which activity a class is doing today
-- (period assembly PA-3, PA-4; docs/design/period-assembly.md → "The rulings")
-- -----------------------------------------------------------------------------
-- A dated row per period item. `kind` allows only 'activity' until the review
-- period ships. A row is never set automatically: the teacher picks, up to two
-- a day for a double, and a pick lapses at the end of the class's day because
-- reads ask for today in the class's timezone. Nothing here gates anything: a
-- student can still open any activity at any time (PA-6).
--
-- NO PERSONAL DATA. No column names a person, and who picked is in audit_log
-- (the same rail as sharing an activity). No history: a write clears the
-- class's earlier days.
-- =============================================================================

create table class_period_items (
  class_id    uuid not null,
  on_date     date not null,
  kind        text not null default 'activity' check (kind = 'activity'),
  activity_id uuid not null,
  position    integer not null check (position >= 1),
  primary key (class_id, on_date, activity_id),
  -- Removing an activity from the class takes its pick with it.
  foreign key (class_id, activity_id)
    references class_activities (class_id, activity_id) on delete cascade
);

create index class_period_items_activity_idx on class_period_items (class_id, activity_id);

comment on table class_period_items is
  'What a class does on a day (0082, PA-4). Teacher-set, class-scoped, no person named. Read through class_today; written through set_class_today.';

alter table class_period_items enable row level security;
alter table class_period_items force row level security;
-- No policies and no client grants: the two functions below are the only doors.
grant select, insert, update, delete on class_period_items to service_role;

-- Today's picks for a class, for its teacher and its current students.
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
      select coalesce(jsonb_agg(jsonb_build_object('activity_id', a.id, 'title', a.title)
                                order by i.position), '[]'::jsonb)
        from class_period_items i
        join activities a on a.id = i.activity_id
       where i.class_id = p_class_id and i.on_date = v_today
         and a.status = 'published' and a.current_version_id is not null
         and a.deleted_at is null));
end;
$$;

-- Pick or unpick. Picking twice, or unpicking what isn't picked, is a success
-- with no audit row. Returns the same shape as class_today.
create or replace function set_class_today(p_class_id uuid, p_activity_id uuid, p_on boolean)
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
  if not is_class_teacher(p_class_id) then
    raise exception 'Not your class';
  end if;
  -- Serializes two picks at once, so the cap holds.
  perform 1 from classes where id = p_class_id and deleted_at is null for update;
  if not found then
    raise exception 'Not your class';
  end if;
  v_today := (now() at time zone fact_class_zone(p_class_id))::date;
  delete from class_period_items where class_id = p_class_id and on_date < v_today;

  if coalesce(p_on, false) then
    if not exists (
      select 1 from class_activities ca
        join activities a on a.id = ca.activity_id
       where ca.class_id = p_class_id and ca.activity_id = p_activity_id
         and a.status = 'published' and a.current_version_id is not null
         and a.deleted_at is null) then
      raise exception 'not_in_class';
    end if;
    if not exists (select 1 from class_period_items
                    where class_id = p_class_id and on_date = v_today
                      and activity_id = p_activity_id) then
      if (select count(*) from class_period_items
           where class_id = p_class_id and on_date = v_today) >= 2 then
        raise exception 'two_today';
      end if;
      select coalesce(max(position), 0) + 1 into v_next from class_period_items
       where class_id = p_class_id and on_date = v_today;
      insert into class_period_items (class_id, on_date, activity_id, position)
      values (p_class_id, v_today, p_activity_id, v_next);
      insert into audit_log (actor_id, action, target_type, target_id, metadata)
      values (auth.uid(), 'class.update', 'class', p_class_id,
              jsonb_build_object('op', 'use_today', 'activity_id', p_activity_id, 'on_date', v_today));
    end if;
  else
    delete from class_period_items
     where class_id = p_class_id and on_date = v_today and activity_id = p_activity_id;
    if found then
      insert into audit_log (actor_id, action, target_type, target_id, metadata)
      values (auth.uid(), 'class.update', 'class', p_class_id,
              jsonb_build_object('op', 'clear_today', 'activity_id', p_activity_id, 'on_date', v_today));
    end if;
  end if;
  return class_today(p_class_id);
end;
$$;

revoke execute on function class_today(uuid) from public, anon;
revoke execute on function set_class_today(uuid, uuid, boolean) from public, anon;
grant execute on function class_today(uuid) to authenticated, service_role;
grant execute on function set_class_today(uuid, uuid, boolean) to authenticated, service_role;

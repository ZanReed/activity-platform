-- =============================================================================
-- 0087_class_activity_due.sql — a due date on a class's activity
-- (docs/design/due-dates.md, DD-1 … DD-9; ruled by the author 2026-11-13)
-- -----------------------------------------------------------------------------
-- DD-1: a DATE (not a time) on the class's row. "Due Friday" is the end of
-- Friday in the class's timezone (fact_class_zone, DD-6). One date per class
-- per activity; removing the activity from the class takes its date with it.
-- `assignments` (0001, with its own due_at) is NOT revived: it has never been
-- written, and it would be a second way a class holds an activity.
--
-- DD-3: a LABEL, never a lock. Nothing here gates opening or checking an
-- activity; PA-6 stands.
--
-- DD-8: NO PERSONAL DATA. The date is about a class's activity; who set it is
-- in audit_log (the share rail). The data map gains no table and no
-- student-derived column (docs/compliance/data-map.md draft-53 records
-- that); retention-policy is unchanged.
--
-- The teacher reads due_on straight from class_activities (its SELECT policy
-- and grant already cover the new column). Students read it through
-- list_class_activities(), which gains the column — its return type changes,
-- so it is dropped and re-created with the same body, filters and grants.
-- =============================================================================

alter table class_activities add column due_on date;

comment on column class_activities.due_on is
  'Due date for this class (0087, DD-1): a date in the class''s timezone, null = none. A label only, never a lock (DD-3). Set through set_class_activity_due.';

-- -----------------------------------------------------------------------------
-- The one write door (DD-2): owner-only, audited like a share. Past dates are
-- allowed (a teacher may record a deadline that already passed); the client
-- says so. Clearing (null) is the same call. A row that isn't there raises:
-- the date belongs to a class's activity, so there must be one.
-- -----------------------------------------------------------------------------
create or replace function set_class_activity_due(
  p_class_id uuid,
  p_activity_id uuid,
  p_due_on date
)
returns date
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old date;
begin
  if not is_class_teacher(p_class_id) then
    raise exception 'Not your class';
  end if;
  select due_on into v_old from class_activities
   where class_id = p_class_id and activity_id = p_activity_id
   for update;
  if not found then
    raise exception 'That activity is not in this class';
  end if;
  if v_old is distinct from p_due_on then
    update class_activities set due_on = p_due_on
     where class_id = p_class_id and activity_id = p_activity_id;
    insert into audit_log (actor_id, action, target_type, target_id, metadata)
    values (auth.uid(), 'class.update', 'class', p_class_id,
            jsonb_build_object('op', 'set_due', 'activity_id', p_activity_id,
                               'due_on', p_due_on, 'was', v_old));
  end if;
  return p_due_on;
end;
$$;

revoke execute on function set_class_activity_due(uuid, uuid, date) from public, anon;
grant execute on function set_class_activity_due(uuid, uuid, date) to authenticated, service_role;

-- -----------------------------------------------------------------------------
-- The student Home list (0030 §3) with due_on and the class's today. Same
-- body otherwise: DEFINER
-- because students can't read activity titles; published + non-deleted
-- filters server-side.
-- -----------------------------------------------------------------------------
drop function list_class_activities();

create function list_class_activities()
returns table (
  class_id uuid,
  activity_id uuid,
  title text,
  added_at timestamptz,
  due_on date,
  class_today date
)
language sql
stable
security definer
set search_path = public
as $$
  select ca.class_id, ca.activity_id, a.title, ca.added_at, ca.due_on,
         -- "today" in the class's zone (DD-6), so "Due today" / "Was due" are
         -- the class's day, not the device's, with no extra round trip.
         (now() at time zone fact_class_zone(ca.class_id))::date as class_today
  from class_activities ca
  join classes c on c.id = ca.class_id
  join class_members m on m.class_id = ca.class_id
  join activities a on a.id = ca.activity_id
  where m.student_id = auth.uid()
    and m.removed_at is null
    and c.deleted_at is null
    and a.status = 'published'
    and a.current_version_id is not null
    and a.deleted_at is null
  order by ca.added_at desc, ca.activity_id desc;
$$;

revoke execute on function list_class_activities() from public, anon;
grant execute on function list_class_activities() to authenticated, service_role;

-- A class's "today" in its own zone, for the TEACHER's due labels and
-- markers (DD-4, DD-6): the same date class_today uses. Teacher or current
-- student only. (Students get it on every list_class_activities row.)
create or replace function class_local_date(p_class_id uuid)
returns date
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not (is_class_teacher(p_class_id) or is_class_member(p_class_id)) then
    raise exception 'Not available' using errcode = '42501';
  end if;
  return (now() at time zone fact_class_zone(p_class_id))::date;
end;
$$;

revoke execute on function class_local_date(uuid) from public, anon;
grant execute on function class_local_date(uuid) to authenticated, service_role;

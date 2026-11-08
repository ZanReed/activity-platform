-- =============================================================================
-- 0084_class_today_six.sql — a class can pick up to six activities for a day
-- -----------------------------------------------------------------------------
-- Author ruling 2026-11-09, from the walkthrough: two was too tight for a
-- 90-minute block or a teacher who uses activities differently. Six is a
-- generous limit, not a model of a period. Only the cap and its error change.
-- No personal data; no table, column or grant change.
-- =============================================================================

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
           where class_id = p_class_id and on_date = v_today) >= 6 then
        raise exception 'today_full';
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

-- =============================================================================
-- 0083_period_shapes_mirror.sql — the keys behind the "Items per session" helper
-- line (period assembly PA-10; docs/design/period-assembly.md)
-- -----------------------------------------------------------------------------
-- A practice registry may now carry `period_shapes` and `mixed_seconds_per_item`,
-- both or neither. Revisions mirrored before this stay valid. They change nothing
-- about how practice runs: the scheduler doesn't read them, and the class's
-- "Items per session" stays the teacher's. The teacher's summary passes them on.
--
-- No personal data; no table, column or grant change. Apply BEFORE the first
-- import of a registry that carries them (the old check refuses it, loudly).
-- =============================================================================

-- 0073's check, plus the two keys.
create or replace function mixed_settings_ok(s jsonb)
returns boolean
language sql
immutable
set search_path = public
as $fn$
  select s is not null
    and jsonb_typeof(s) = 'object'
    and (select count(*) from jsonb_object_keys(s))
          = 7 + (s ? 'dol_practice_items')::integer
              + 2 * (s ? 'period_shapes')::integer
    -- Both or neither (0083): the helper line needs the two together.
    and (s ? 'period_shapes') = (s ? 'mixed_seconds_per_item')
    and (not s ? 'period_shapes'
         or (jsonb_typeof(s->'period_shapes') = 'object'
             -- A missing `lengths` is null here, and a null would pass a CHECK.
             and coalesce(jsonb_typeof(s->'period_shapes'->'lengths'), '') = 'object'
             and jsonb_typeof(s->'mixed_seconds_per_item') = 'array'
             and jsonb_array_length(s->'mixed_seconds_per_item') = 2
             and jsonb_typeof(s->'mixed_seconds_per_item'->0) = 'number'
             and jsonb_typeof(s->'mixed_seconds_per_item'->1) = 'number'
             and (s->'mixed_seconds_per_item'->>0)::numeric >= 1
             and (s->'mixed_seconds_per_item'->>1)::numeric >= (s->'mixed_seconds_per_item'->>0)::numeric))
    and (not s ? 'dol_practice_items'
         or (jsonb_typeof(s->'dol_practice_items') = 'number'
             and (s->>'dol_practice_items')::numeric = trunc((s->>'dol_practice_items')::numeric)
             and (s->>'dol_practice_items')::numeric between 2 and 8))
    and s ?& array['mixed_step_intervals', 'mixed_wrong_drop', 'mixed_items_per_session',
                   'mixed_max_discrimination', 'mixed_new_skills_per_session',
                   'mixed_struggling_window', 'mixed_struggling_min_right']
    and (select bool_and(jsonb_typeof(s->k) = 'number'
                         and (s->>k)::numeric = trunc((s->>k)::numeric)
                         and (s->>k)::numeric >= 0)
           from unnest(array['mixed_wrong_drop', 'mixed_items_per_session',
                             'mixed_max_discrimination', 'mixed_new_skills_per_session',
                             'mixed_struggling_window', 'mixed_struggling_min_right']) k)
    and jsonb_typeof(s->'mixed_step_intervals') = 'array'
    and jsonb_array_length(s->'mixed_step_intervals') between 1 and 50
    and (select bool_and(jsonb_typeof(e.v) = 'number'
                         and (e.v #>> '{}')::numeric >= 1
                         and (e.v #>> '{}')::numeric = trunc((e.v #>> '{}')::numeric)
                         and (e.i = 1 or (e.v #>> '{}')::numeric
                                > ((s->'mixed_step_intervals'->((e.i - 2)::int)) #>> '{}')::numeric))
           from jsonb_array_elements(s->'mixed_step_intervals') with ordinality e(v, i))
    and (s->>'mixed_wrong_drop')::numeric < jsonb_array_length(s->'mixed_step_intervals')
    and (s->>'mixed_items_per_session')::numeric between 1 and 50
    and (s->>'mixed_max_discrimination')::numeric <= (s->>'mixed_items_per_session')::numeric
    and (s->>'mixed_new_skills_per_session')::numeric <= (s->>'mixed_items_per_session')::numeric
    and (s->>'mixed_struggling_window')::numeric >= 1
    and (s->>'mixed_struggling_min_right')::numeric <= (s->>'mixed_struggling_window')::numeric
$fn$;

-- 0068's summary, plus the two keys.
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

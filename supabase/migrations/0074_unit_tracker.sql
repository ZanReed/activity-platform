-- 0074_unit_tracker.sql — the student unit tracker (curriculum D67)
-- docs/design/student-unit-tracker.md (UT-1…UT-12, ruled 2026-11-01).
--
--   §A  tracker_wording — a teacher's private row wording, per skill (UT-5).
--   §B  set_tracker_wording — the one write.
--   §C  unit_tracker_rows — the rows of a class's units (UT-2, UT-7, UT-12).
--   §D  my_unit_tracker — the student's read: statuses and the next line
--       (UT-3, UT-8, UT-12). Everything is derived; nothing is stored (UT-9).
--   §E  class_unit_tracker — the teacher's read: same rows, no statuses (UT-6).
--
-- A tracker unit is activities.unit, one chain in v1 (C-172 note 1). Skills
-- admitted only by a consolidation get no row yet (filed, TRIGGER 904 drafted).
--
-- ⚠ One known imprecision: my_unit_tracker's retake test cannot see whether a
-- DoL's primary item is teacher-marked (the handler works that out from the
-- document), so a rubric primary can say "Try the check again" before its mark
-- is released. The activity's own frozen copy still tells the truth. No live
-- file has a DoL yet; filed in TODOS.
--
-- COMPLIANCE: tracker_wording.teacher_id is teacher identity on teacher-written
-- text, no student data; removed with the account. The student read derives
-- from rows already mapped. data-map draft-40, retention-policy draft-20.

-- §A ---------------------------------------------------------------------------
create table tracker_wording (
  teacher_id uuid not null references users(id) on delete cascade,
  skill_id   text not null check (char_length(skill_id) <= 200),
  wording    text not null check (char_length(wording) between 1 and 200),
  updated_at timestamptz not null default now(),
  primary key (teacher_id, skill_id)
);
alter table tracker_wording enable row level security;
alter table tracker_wording force row level security;
-- NO policies: every access is a definer function (UT-5).
revoke all on table tracker_wording from anon, authenticated;
comment on table tracker_wording is
  'A teacher''s private wording for a tracker row (D67, UT-5): the school''s own text, which never crosses to the curriculum repo. Keyed by teacher, so it never travels with a Bank copy. A student reads only their class teacher''s, through my_unit_tracker.';

-- §B ---------------------------------------------------------------------------
-- Empty wording removes the row, which returns it to the fallback (UT-6).
create or replace function set_tracker_wording(p_skill_id text, p_wording text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_text text := btrim(coalesce(p_wording, ''));
begin
  if auth.uid() is null or not current_user_is_teacher() then
    raise exception 'not_a_teacher' using errcode = '42501';
  end if;
  if v_text = '' then
    delete from tracker_wording where teacher_id = auth.uid() and skill_id = p_skill_id;
    return;
  end if;
  if char_length(v_text) > 200 then
    raise exception 'wording_too_long' using errcode = '22001';
  end if;
  insert into tracker_wording (teacher_id, skill_id, wording)
  values (auth.uid(), p_skill_id, v_text)
  on conflict (teacher_id, skill_id)
  do update set wording = excluded.wording, updated_at = now();
end;
$$;
revoke execute on function set_tracker_wording(text, text) from public, anon;
grant  execute on function set_tracker_wording(text, text) to authenticated;

-- §C ---------------------------------------------------------------------------
-- UT-2: a unit appears once the class has any activity from it; its rows are
-- the distinct primary skills of the source owner's published non-consolidation
-- activities in that unit, in teaching order. UT-7: letters are the skill's
-- ratified, non-retired templates' tiers. UT-12: passable = a published activity
-- in the unit grants this skill's pass (dol_pass_skill) and carries a DoL.
-- dol_activity_id is the CLASS's activity for it (perhaps a Bank copy), or NULL.
create or replace function unit_tracker_rows(p_class_id uuid)
returns table (unit text, owner_id uuid, skill_id text, ord text, label text, wording text,
               letters text[], has_harder boolean, passable boolean, dol_activity_id uuid)
language sql
stable
security definer
set search_path = public
as $$
  with given as (
    select a.id, src.id as source_id, src.owner_id, src.unit
    from class_activities ca
    join activities a   on a.id = ca.activity_id and a.deleted_at is null
    join activities src on src.id = coalesce(a.copied_from_activity_id, a.id)
    where ca.class_id = p_class_id and src.unit is not null
  ), catalogue as (
    select u.id, u.owner_id, u.unit, u.primary_skill, u.title, u.source_path, u.current_version_id
    from activities u
    join (select distinct g.owner_id, g.unit from given g) k
      on k.owner_id = u.owner_id and k.unit = u.unit
    where u.status = 'published' and u.deleted_at is null and u.copied_from_activity_id is null
      and u.primary_skill is not null and u.consolidates_chain is null
  ), skills as (
    select c.unit, c.owner_id, c.primary_skill as skill_id,
           min(coalesce(c.source_path, c.title)) as ord,
           (array_agg(c.title order by coalesce(c.source_path, c.title)))[1] as first_title
    from catalogue c
    group by c.unit, c.owner_id, c.primary_skill
  )
  select s.unit, s.owner_id, s.skill_id, s.ord,
         coalesce(l.label, s.first_title),
         w.wording,
         coalesce(t.letters, '{}'),
         coalesce(t.letters && array['P', 'E'], false),
         d.source_id is not null,
         d.class_activity
  from skills s
  join classes k on k.id = p_class_id
  left join skill_label l on l.id = s.skill_id
  left join tracker_wording w on w.teacher_id = k.teacher_id and w.skill_id = s.skill_id
  left join lateral (
    select array_agg(x.tier order by position(x.tier in 'DCPE')) as letters
    from (select distinct p.tier from practice_item p
          where p.owner_id = s.owner_id and p.role = 'skill' and p.skill_id = s.skill_id
            and p.status = 'ratified' and p.retired_at is null and p.tier is not null) x
  ) t on true
  left join lateral (
    select c.id as source_id,
           (select g.id from given g where g.source_id = c.id limit 1) as class_activity
    from catalogue c
    join activity_versions v on v.id = c.current_version_id
    where c.unit = s.unit and c.owner_id = s.owner_id and c.primary_skill = s.skill_id
      and dol_pass_skill(c.id) = s.skill_id
      and exists (select 1 from jsonb_array_elements(coalesce(v.content->'sections', '[]'::jsonb)) sec
                  where jsonb_typeof(sec->'dol') = 'object')
    limit 1
  ) d on true;
$$;
revoke execute on function unit_tracker_rows(uuid) from public, anon, authenticated;

-- §D ---------------------------------------------------------------------------
-- UT-3: passed > keep_practising (0066's rule, this class) > learning (the pool)
-- > not_started. UT-8 + UT-12: walk the taught, unpassed, passable rows in
-- teaching order; a row with its tries used up has no step, so the walk moves
-- on. Next kinds: check, practice, retake, wait, all_passed, up_next.
create or replace function my_unit_tracker(p_class_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid      uuid := auth.uid();
  v_zone     text;
  v_settings jsonb;
  v_win      integer;
  v_min      integer;
  v_units    jsonb := '[]'::jsonb;
  v_unit     record;
  v_row      record;
  v_rows     jsonb;
  v_next     jsonb;
  v_status   text;
  v_passable integer;
  v_unpassed integer;
  v_a        activities%rowtype;
  v_content  jsonb;
  v_dol      jsonb;
  v_tries    integer;
  v_allow    integer;
  v_first    timestamptz;
  v_dzone    text;
begin
  if v_uid is null or p_class_id is null or not exists (
       select 1 from class_members m join classes c on c.id = m.class_id
        where m.class_id = p_class_id and m.student_id = v_uid
          and m.removed_at is null and c.deleted_at is null) then
    raise exception 'Not available' using errcode = '42501';
  end if;
  v_zone := fact_class_zone(p_class_id);
  select settings into v_settings from mixed_basis(p_class_id);
  v_win := coalesce((v_settings->>'mixed_struggling_window')::integer, 5);
  v_min := coalesce((v_settings->>'mixed_struggling_min_right')::integer, 3);

  for v_unit in
    select r.unit, r.owner_id, min(r.ord) as ord
    from unit_tracker_rows(p_class_id) r group by r.unit, r.owner_id order by 3
  loop
    v_rows := '[]'::jsonb; v_next := null; v_passable := 0; v_unpassed := 0;
    for v_row in
      select r.*,
             exists (select 1 from dol_pass dp where dp.student_id = v_uid and dp.skill_id = r.skill_id) as passed,
             exists (select 1 from mixed_recent(p_class_id, v_win) x
                     where x.student_id = v_uid and x.bank_key = r.skill_id
                       and x.tries - x.right_n > v_win - v_min) as stuck,
             exists (select 1 from mixed_taught(p_class_id, v_uid, v_zone) t
                     where t.skill_id = r.skill_id and t.owner_id = r.owner_id) as taught
      from unit_tracker_rows(p_class_id) r
      where r.unit = v_unit.unit and r.owner_id = v_unit.owner_id
      order by r.ord
    loop
      v_status := case when v_row.passed then 'passed'
                       when v_row.stuck  then 'keep_practising'
                       when v_row.taught then 'learning'
                       else 'not_started' end;
      v_rows := v_rows || jsonb_build_object(
        'skill_id', v_row.skill_id, 'label', v_row.label, 'wording', v_row.wording,
        'letters', to_jsonb(v_row.letters), 'status', v_status,
        'harder', v_row.passed and v_row.has_harder);

      if v_row.passable and (v_row.passed or v_row.taught) then
        v_passable := v_passable + 1;
        if not v_row.passed then v_unpassed := v_unpassed + 1; end if;
      end if;

      if v_next is null and v_row.passable and v_row.taught and not v_row.passed
         and v_row.dol_activity_id is not null then
        select * into v_a from activities where id = v_row.dol_activity_id;
        select content into v_content from activity_versions where id = v_a.current_version_id;
        select s into v_dol from jsonb_array_elements(coalesce(v_content->'sections', '[]'::jsonb)) s
         where jsonb_typeof(s->'dol') = 'object' limit 1;
        if v_dol is not null then
          select count(*), min(created_at) into v_tries, v_first from section_checks
           where student_id = v_uid and activity_version_id = v_a.current_version_id
             and section_id = v_dol->>'id';
          v_allow := case when coalesce((v_dol->'dol'->>'retake')::boolean, false) then 2 else 1 end;
          if v_tries = 0 then
            v_next := jsonb_build_object('kind', 'check', 'skill_id', v_row.skill_id,
                                         'activity_id', v_a.id, 'title', v_a.title);
          elsif v_tries < v_allow then
            v_dzone := dol_zone(v_a.id);
            if exists (select 1 from practice_item p
                        where p.owner_id = v_row.owner_id and p.role = 'skill'
                          and p.skill_id = v_row.skill_id and p.status = 'ratified'
                          and p.retired_at is null and mixed_tier_ok(p.tier, v_uid, p.skill_id))
               and not exists (select 1 from dol_practice_sessions ds
                                where ds.student_id = v_uid and ds.version_id = v_a.current_version_id
                                  and ds.finished_at is not null) then
              v_next := jsonb_build_object('kind', 'practice', 'skill_id', v_row.skill_id,
                                           'activity_id', v_a.id, 'version_id', v_a.current_version_id);
            elsif (v_first at time zone v_dzone)::date < (now() at time zone v_dzone)::date then
              v_next := jsonb_build_object('kind', 'retake', 'skill_id', v_row.skill_id,
                                           'activity_id', v_a.id);
            else
              v_next := jsonb_build_object('kind', 'wait', 'skill_id', v_row.skill_id);
            end if;
          end if;
        end if;
      end if;
    end loop;

    if v_next is null and v_passable > 0 and v_unpassed = 0 then
      v_next := jsonb_build_object('kind', 'all_passed');
    elsif v_next is null then
      select jsonb_build_object('kind', 'up_next', 'activity_id', a.id, 'title', a.title) into v_next
      from class_activities ca
      join activities a   on a.id = ca.activity_id and a.deleted_at is null
      join activities src on src.id = coalesce(a.copied_from_activity_id, a.id)
      where ca.class_id = p_class_id and src.unit = v_unit.unit and src.owner_id = v_unit.owner_id
        and not exists (select 1 from section_checks sc where sc.activity_id = a.id and sc.student_id = v_uid)
      order by coalesce(src.source_path, src.title)
      limit 1;
    end if;

    v_units := v_units || jsonb_build_object('unit', v_unit.unit, 'rows', v_rows, 'next', v_next);
  end loop;
  return jsonb_build_object('units', v_units);
end;
$$;
revoke execute on function my_unit_tracker(uuid) from public, anon;
grant  execute on function my_unit_tracker(uuid) to authenticated;

-- §E ---------------------------------------------------------------------------
create or replace function class_unit_tracker(p_class_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or p_class_id is null or not is_class_teacher(p_class_id) then
    raise exception 'not_class_teacher' using errcode = '42501';
  end if;
  return jsonb_build_object('units', coalesce((
    select jsonb_agg(u.j order by u.ord)
    from (
      select min(r.ord) as ord,
             jsonb_build_object('unit', r.unit, 'rows', jsonb_agg(jsonb_build_object(
               'skill_id', r.skill_id, 'label', r.label, 'wording', r.wording,
               'letters', to_jsonb(r.letters)) order by r.ord)) as j
      from unit_tracker_rows(p_class_id) r
      group by r.unit, r.owner_id
    ) u), '[]'::jsonb));
end;
$$;
revoke execute on function class_unit_tracker(uuid) from public, anon;
grant  execute on function class_unit_tracker(uuid) to authenticated;

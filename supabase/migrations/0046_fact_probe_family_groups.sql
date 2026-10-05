-- =============================================================================
-- 0046_fact_probe_family_groups.sql — the grouping is per fact family
-- -----------------------------------------------------------------------------
-- The author's ruling of 2026-10-05 (four numbered choices; practice-blocks.md
-- → "Per-family grouping"), recorded on the curriculum side as "D43 amendment
-- (2026-10-05). Grouping is per fact family, and the accuracy threshold is
-- 80%." It supersedes CR-7 (one group per student) and relaxes CR-8 for the
-- label.
--
--   WHAT IS GROUPED   each fact family, per student — not the student.
--   THE RULE          accuracy first, on the family's counted items:
--                       needs_strategy  fewer than accuracy_threshold right
--                       fluent          else at least facts_met_threshold
--                                       quick and right
--                       slow            otherwise
--                     Both thresholds are read from the PROBE ROW (copied at
--                     open), so a probe opened at 0.9 is judged at 0.9 and one
--                     opened after the 0.8 registry revision at 0.8.
--   NOT JUDGED        a family with fewer counted items than its minimum has
--                     no label (their items 22, 23, unchanged).
--   WHO GETS A LABEL  any session, family by family — the label needs only
--                     that family's own minimum, not an overall rate.
--   MET / NOT MET     restated (their item 5): met IS fluent.
--   NO OVERALL LABEL  each student carries a derived `family_summary` (counts
--                     of families per label). It is not a second rule.
--
-- EXPAND, NOT REPLACE. This re-creates ONE function, fact_probe_stat, from
-- 0045's text. It ADDS `right` and `group` to each family reading and
-- `family_summary` to each student row. The old per-student `group` and the
-- class `groups` counts are still returned, unread by the new screen, so the
-- page deployed before this migration keeps working across the apply. Their
-- removal is filed in TODOS (trigger: the next migration that touches this
-- function).
--
-- The class verdict is untouched: still the median rate against the floor.
-- No table changes, no new personal data, no grants change (create or replace
-- keeps 0045's revoke/grant on fact_probe_stat; re-stated below regardless).
-- =============================================================================

create or replace function fact_probe_stat(p_probe_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_probe    class_probes%rowtype;
  v_students jsonb;
  v_class    jsonb;
begin
  select * into v_probe from class_probes where id = p_probe_id;
  if v_probe.id is null then
    raise exception 'probe_not_found';
  end if;

  with j as (
    select * from fact_probe_judged(p_probe_id)
  ),
  per as (
    select j.session_id,
           count(*)                                                     as saved,
           count(*) filter (where j.judgment <> 'interrupted')          as counted,
           count(*) filter (where j.judgment = 'interrupted')           as not_counted,
           count(*) filter (where j.judgment in ('met', 'slow', 'unjudged')) as right_n,
           count(*) filter (where j.judgment = 'met')                   as met_n,
           count(*) filter (where j.judgment = 'skipped')               as skipped_n,
           coalesce(sum(j.counted_ms) filter (where j.judgment <> 'interrupted'), 0) as counted_ms,
           coalesce(bool_or(j.flagged) filter (where j.judgment <> 'interrupted'), false) as flagged
    from j
    group by j.session_id
  ),
  famrows as (
    select j.session_id, j.family_id,
           count(*) filter (where j.judgment <> 'interrupted') as counted,
           count(*) filter (where j.judgment in ('met', 'slow', 'unjudged')) as right_n,
           count(*) filter (where j.judgment = 'met')          as met_n
    from j
    group by j.session_id, j.family_id
  ),
  famlabel as (
    -- THE PER-FAMILY LABEL (their D43 amendment of 2026-10-05, item 13
    -- restated). Accuracy first, within the family's counted items.
    select s.id as session_id,
           f->>'family_id' as family_id,
           f->>'name' as name,
           (f->>'ord')::integer as ord,
           coalesce(fr.counted, 0) as counted,
           coalesce(fr.right_n, 0) as right_n,
           coalesce(fr.met_n, 0) as met_n,
           case
             when coalesce(fr.counted, 0) < (f->>'min_items')::integer then null
             when fr.right_n::numeric / fr.counted < v_probe.accuracy_threshold then 'needs_strategy'
             when fr.met_n::numeric / fr.counted >= v_probe.facts_met_threshold then 'fluent'
             else 'slow'
           end as grp
    from practice_sessions s
    cross join jsonb_array_elements(v_probe.families) f
    left join famrows fr on fr.session_id = s.id and fr.family_id = f->>'family_id'
    where s.probe_id = p_probe_id
  ),
  famjson as (
    select fl.session_id,
           jsonb_agg(
             jsonb_build_object(
               'family_id', fl.family_id,
               'name',      fl.name,
               'counted',   fl.counted,
               'right',     fl.right_n,
               'met',       fl.met_n,
               'group',     fl.grp,
               -- Item 23 restated: met IS fluent; not met is slow or needs strategy.
               'status',    case when fl.grp is null then 'not_judged'
                                 when fl.grp = 'fluent' then 'met'
                                 else 'not_met' end)
             order by fl.ord) as families,
           jsonb_build_object(
             'fluent',         count(*) filter (where fl.grp = 'fluent'),
             'slow',           count(*) filter (where fl.grp = 'slow'),
             'needs_strategy', count(*) filter (where fl.grp = 'needs_strategy'),
             'not_judged',     count(*) filter (where fl.grp is null)) as family_summary
    from famlabel fl
    group by fl.session_id
  ),
  people as (
    select coalesce(s.student_id, m.student_id) as student_id,
           s.id as session_id,
           s.finished_at,
           (m.student_id is not null) as is_member
    from (select * from practice_sessions where probe_id = p_probe_id) s
    full join (select cm.student_id from class_members cm
                where cm.class_id = v_probe.class_id and cm.removed_at is null) m
      on m.student_id = s.student_id
  ),
  shaped as (
    select pe.student_id, pe.is_member, pe.session_id, pe.finished_at,
           coalesce(nullif(btrim(u.display_name), ''), u.email, 'Unknown') as name,
           coalesce(per.saved, 0)       as saved,
           coalesce(per.counted, 0)     as counted,
           coalesce(per.not_counted, 0) as not_counted,
           coalesce(per.right_n, 0)     as right_n,
           coalesce(per.met_n, 0)       as met_n,
           coalesce(per.skipped_n, 0)   as skipped_n,
           coalesce(per.counted_ms, 0)  as counted_ms,
           coalesce(per.flagged, false) as flagged,
           fj.families,
           fj.family_summary,
           (coalesce(per.counted_ms, 0) > 0
             and (coalesce(per.counted, 0) >= v_probe.min_attempts
                  or coalesce(per.counted_ms, 0) >= v_probe.min_counted_s * 1000)) as has_rate
    from people pe
    left join users u on u.id = pe.student_id
    left join per on per.session_id = pe.session_id
    left join famjson fj on fj.session_id = pe.session_id
  ),
  rated as (
    select sh.*,
           case when sh.has_rate
                then round(sh.right_n / (sh.counted_ms / 60000.0), 2) end as rate,
           case
             when not sh.has_rate then null
             when sh.right_n::numeric / sh.counted < v_probe.accuracy_threshold then 'needs_strategy'
             when sh.met_n::numeric / sh.counted >= v_probe.facts_met_threshold then 'fluent'
             else 'slow'
           end as grp,
           case
             when sh.session_id is null then 'not_started'
             when sh.finished_at is not null or sh.saved >= v_probe.item_count then 'finished'
             else 'in_progress'
           end as status
    from shaped sh
  )
  select coalesce(jsonb_agg(
           jsonb_build_object(
             'student_id',  r.student_id,
             'name',        r.name,
             'is_member',   r.is_member,
             'status',      r.status,
             'done',        r.saved,
             'has_rate',    r.has_rate,
             'rate',        r.rate,
             'right',       r.right_n,
             'met',         r.met_n,
             'skipped',     r.skipped_n,
             'not_counted', r.not_counted,
             'counted',     r.counted,
             'group',       r.grp,
             'typing_flag', r.flagged and r.session_id is not null,
             'families',    coalesce(r.families, '[]'::jsonb),
             'family_summary', coalesce(r.family_summary, jsonb_build_object(
               'fluent', 0, 'slow', 0, 'needs_strategy', 0,
               'not_judged', jsonb_array_length(v_probe.families))))
           order by lower(r.name), r.student_id), '[]'::jsonb)
    into v_students
  from rated r;

  select jsonb_build_object(
           'in_class',  count(*) filter (where s.is_member),
           'started',   count(*) filter (where s.is_member and s.status <> 'not_started'),
           'finished',  count(*) filter (where s.is_member and s.status = 'finished'),
           'with_rate', count(*) filter (where s.is_member and s.has_rate),
           'left_out',  count(*) filter (where s.is_member and s.status <> 'not_started' and not s.has_rate),
           'median_rate',
             round((percentile_cont(0.5) within group (order by s.rate)
                      filter (where s.is_member and s.has_rate))::numeric, 2),
           'floor',     round(v_probe.floor_per_min, 2),
           'min_students', v_probe.min_students,
           'groups', jsonb_build_object(
             'fluent',         count(*) filter (where s.is_member and s."group" = 'fluent'),
             'slow',           count(*) filter (where s.is_member and s."group" = 'slow'),
             'needs_strategy', count(*) filter (where s.is_member and s."group" = 'needs_strategy')))
    into v_class
  from jsonb_to_recordset(v_students) as s(
    is_member boolean, status text, has_rate boolean, rate numeric, "group" text);

  v_class := v_class || jsonb_build_object(
    'verdict',
    case
      when (v_class->>'with_rate')::integer < v_probe.min_students then 'not_enough'
      when (v_class->>'median_rate')::numeric < round(v_probe.floor_per_min, 2) then 'below'
      else 'at_or_above'
    end);

  return jsonb_build_object('class', v_class, 'students', v_students);
end;
$$;

revoke execute on function fact_probe_stat(uuid) from public, anon, authenticated;
grant  execute on function fact_probe_stat(uuid) to service_role;

-- =============================================================================
-- Verification lives in scripts/verify-0046.sql (registered in the verify
-- runner): every label per student and family at 0.8 and at 0.9, the not-judged
-- floor, met = fluent, the summary counts, and that the pre-0046 keys survive.
-- =============================================================================

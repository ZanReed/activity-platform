-- =============================================================================
-- 0051_fact_sprint_overview.sql — what the teacher sees of the daily practice
-- -----------------------------------------------------------------------------
-- D43 slice 2, build slice 4 of 4 (practice-blocks.md → "Slice 2, the sprint:
-- design pass", SP-2 and SP-4). ONE read function for the class's
-- number-facts page: the switch's state (and why it cannot be switched on,
-- when it cannot), how many practised today and in the last seven days, each
-- fact family by how many students are in each state, and each student's days
-- practised and families by state. No ranking, no times, no rates.
--
-- Every number is DERIVED, by 0050's functions, from the attempts that exist.
-- No table changes; no new personal data (it reads what 0050 stores, for the
-- class's own teacher only).
--
-- A family's state, in the teacher's words:
--   strategy     in strategy mode (accuracy first)
--   practising   being practised for speed
--   fluent       FLUENT on the check, or fluent in practice
-- =============================================================================

create or replace function fact_sprint_overview(p_class_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_class  classes%rowtype;
  v_basis  record;
  v_today  date;
  v_fams   jsonb := '[]'::jsonb;
  v_studs  jsonb := '[]'::jsonb;
  v_counts jsonb;
begin
  if auth.uid() is null or p_class_id is null or not is_class_teacher(p_class_id) then
    raise exception 'not_class_teacher' using errcode = '42501';
  end if;
  select * into v_class from classes where id = p_class_id;
  select * into v_basis from fact_sprint_basis(p_class_id);
  v_today := (now() at time zone fact_class_zone(p_class_id))::date;

  select jsonb_build_object(
           'in_class', (select count(*) from class_members m
                         where m.class_id = p_class_id and m.removed_at is null),
           'practised_today', count(distinct s.student_id) filter (where s.practice_day = v_today),
           'practised_week',  count(distinct s.student_id) filter (where s.practice_day > v_today - 7))
    into v_counts
  from sprint_sessions s
  join class_members m on m.class_id = s.class_id and m.student_id = s.student_id
                      and m.removed_at is null
  where s.class_id = p_class_id
    and exists (select 1 from sprint_attempts a where a.session_id = s.id);

  if v_basis.reason is null then
    with members as (
      select m.student_id,
             coalesce(nullif(btrim(u.display_name), ''), u.email, 'Unknown') as name
      from class_members m join users u on u.id = m.student_id
      where m.class_id = p_class_id and m.removed_at is null
    ),
    fam as (
      select mb.student_id, mb.name, f.family_id, f.name as family_name, f.ord,
             case f.mode when 'strategy' then 'strategy'
                         when 'practice' then 'practising'
                         else 'fluent' end as state
      from members mb
      cross join lateral fact_sprint_families(
        p_class_id, mb.student_id, v_basis.registry_rev, v_basis.fact_grammar_rev,
        v_basis.year_level) f
    ),
    days as (
      select s.student_id, count(distinct s.practice_day) as days, max(s.practice_day) as last_day
      from sprint_sessions s
      where s.class_id = p_class_id
        and exists (select 1 from sprint_attempts a where a.session_id = s.id)
      group by s.student_id
    )
    select
      (select coalesce(jsonb_agg(jsonb_build_object(
                'family_id', x.family_id, 'name', x.family_name,
                'strategy', x.n_strategy, 'practising', x.n_practising, 'fluent', x.n_fluent)
              order by x.ord), '[]'::jsonb)
         from (select f.family_id, f.family_name, f.ord,
                      count(*) filter (where f.state = 'strategy')   as n_strategy,
                      count(*) filter (where f.state = 'practising') as n_practising,
                      count(*) filter (where f.state = 'fluent')     as n_fluent
                 from fam f group by f.family_id, f.family_name, f.ord) x),
      (select coalesce(jsonb_agg(jsonb_build_object(
                'student_id', y.student_id, 'name', y.name,
                'days_practised', coalesce(d.days, 0), 'last_day', d.last_day,
                'strategy', y.n_strategy, 'practising', y.n_practising, 'fluent', y.n_fluent)
              order by lower(y.name), y.student_id), '[]'::jsonb)
         from (select f.student_id, f.name,
                      count(*) filter (where f.state = 'strategy')   as n_strategy,
                      count(*) filter (where f.state = 'practising') as n_practising,
                      count(*) filter (where f.state = 'fluent')     as n_fluent
                 from fam f group by f.student_id, f.name) y
         left join days d on d.student_id = y.student_id)
      into v_fams, v_studs;
  end if;

  return v_counts || jsonb_build_object(
    'on',          v_class.fact_sprint_on_at is not null,
    'on_at',       v_class.fact_sprint_on_at,
    -- NULL when it can be switched on; else the reason, by name.
    'blocked_by',  v_basis.reason,
    'year_level',  v_basis.year_level,
    'join_code',   v_class.join_code,
    'families',    v_fams,
    'students',    v_studs);
end;
$$;

revoke execute on function fact_sprint_overview(uuid) from public, anon;
grant  execute on function fact_sprint_overview(uuid) to authenticated, service_role;

-- =============================================================================
-- Verification lives in scripts/verify-0051.sql (registered in the verify
-- runner): the grant; only the class's teacher; the counts of who practised;
-- each family's and each student's states against 0050's own functions; what
-- it returns when the practice cannot be switched on.
-- =============================================================================

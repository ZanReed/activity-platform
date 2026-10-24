-- =============================================================================
-- 0071_mixed_who_first_cross_skill.sql — "Same mistake twice" across skills
-- -----------------------------------------------------------------------------
--   mixed_who_first, replacing 0068's (0069/0070 did not touch it): group 2
--       "Same mistake twice" counts the same misconception ACROSS ALL of a student's skills (curriculum C-164 item 3,
--       author-ruled 2026-10-25). 0068 counted it per skill, so a misconception
--       shared by several skills (C-162's reason for W-4) never combined. The
--       window is unchanged: each try must be inside its own skill's last
--       `mixed_struggling_window` first tries, and the student practised today.
--       Group 1, the number-facts rows and "everyone else" are unchanged.
--
-- No new personal data; no table changes. The signature is unchanged, so the
-- grants from 0068 stand (create or replace keeps them).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- mixed_who_first (replaces 0068's)
-- -----------------------------------------------------------------------------
create or replace function mixed_who_first(p_class_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_class   classes%rowtype;
  v_basis   record;
  v_sprint  record;
  v_win     integer;
  v_min     integer;
  v_today   date;
  v_stuck   jsonb := '[]'::jsonb;
  v_facts   jsonb := '[]'::jsonb;
  v_same    jsonb := '[]'::jsonb;
  v_listed  uuid[] := '{}';
  v_started integer;
  v_roster  integer;
begin
  if auth.uid() is null or p_class_id is null or not is_class_teacher(p_class_id) then
    raise exception 'not_class_teacher' using errcode = '42501';
  end if;
  select * into v_class from classes where id = p_class_id;
  select * into v_basis from mixed_basis(p_class_id);
  v_win   := coalesce((v_basis.settings->>'mixed_struggling_window')::integer, 5);
  v_min   := coalesce((v_basis.settings->>'mixed_struggling_min_right')::integer, 3);
  v_today := (now() at time zone fact_class_zone(p_class_id))::date;

  select count(*) into v_roster from mixed_roster(p_class_id);

  -- Group 1, mixed: practised today, getting stuck (0066's rule, unchanged)
  -- on a skill served to them today.
  with today_served as (
    select distinct si.student_id, si.bank_key
      from mixed_sessions s
      join mixed_session_items si on si.session_id = s.id
     where s.class_id = p_class_id and s.practice_day = v_today and si.kind = 'skill'
  ), practised as (
    select distinct a.student_id from mixed_attempts a
     where a.class_id = p_class_id and a.practice_day = v_today
  ), hit as (
    select r.student_id, r.bank_key
      from mixed_recent(p_class_id, v_win) r
      join practised p on p.student_id = r.student_id
      join today_served t on t.student_id = r.student_id and t.bank_key = r.bank_key
     where r.tries - r.right_n > v_win - v_min
  )
  select coalesce(jsonb_agg(jsonb_build_object(
           'student_id', w.student_id, 'name', w.name,
           'skills', (select jsonb_agg(jsonb_build_object('id', h.bank_key, 'label', l.label)
                                       order by h.bank_key)
                        from hit h left join skill_label l on l.id = h.bank_key
                       where h.student_id = w.student_id))
         order by lower(w.name), w.student_id), '[]'::jsonb)
    into v_stuck
    from mixed_roster(p_class_id) w
   where exists (select 1 from hit h where h.student_id = w.student_id);

  -- Group 1, number facts (S4-3): only when the sprint is on and readable.
  if v_class.fact_sprint_on_at is not null then
    select * into v_sprint from fact_sprint_basis(p_class_id);
    if v_sprint.reason is null then
      with practised as (
        select distinct s.student_id from sprint_sessions s
         where s.class_id = p_class_id and s.practice_day = v_today
           and exists (select 1 from sprint_attempts a where a.session_id = s.id)
      ), fam as (
        select w.student_id, w.name, f.name as family, f.ord
          from mixed_roster(p_class_id) w
          join practised p on p.student_id = w.student_id
          cross join lateral fact_sprint_families(p_class_id, w.student_id, v_sprint.registry_rev,
                                                  v_sprint.fact_grammar_rev, v_sprint.year_level) f
         where f.label = 'needs_strategy' and f.mode = 'strategy'
      )
      select coalesce(jsonb_agg(jsonb_build_object('student_id', x.student_id, 'name', x.name,
                                                   'families', x.families)
                                order by lower(x.name), x.student_id), '[]'::jsonb)
        into v_facts
        from (select student_id, name, jsonb_agg(family order by ord) as families
                from fam group by student_id, name) x;
    end if;
  end if;

  -- Group 2 (0071, C-164 item 3): the same misconception on ≥ 2 first tries
  -- ACROSS ALL the student's skills (and discrimination banks), each try
  -- inside its own skill's last `window` first tries, across days; practised
  -- today. A misconception attached to several skills (pair attachments,
  -- e.g. mis.expand.first-term-only) now combines; the row lists every skill
  -- it fired on.
  with practised as (
    select distinct a.student_id from mixed_attempts a
     where a.class_id = p_class_id and a.practice_day = v_today
  ), win as (
    select a.student_id, a.kind, a.bank_key, a.misconception_ids,
           row_number() over (partition by a.student_id, a.bank_key
                              order by a.practice_day desc, a.saved_at desc, a.seq desc) as rn
      from mixed_attempts a
      join practised p on p.student_id = a.student_id
     where a.class_id = p_class_id
  ), hits as (
    select w.student_id, m.id as mis, w.kind, w.bank_key
      from win w cross join lateral unnest(w.misconception_ids) m(id)
     where w.rn <= v_win
  ), rep as (
    select h.student_id, h.mis
      from hits h
     group by h.student_id, h.mis
    having count(*) >= 2
  ), per_mis as (
    select r.student_id, r.mis,
           (select jsonb_agg(jsonb_build_object('id', k.bank_key, 'label', mixed_key_label(k.kind, k.bank_key))
                     order by k.bank_key)
              from (select distinct h.kind, h.bank_key from hits h
                     where h.student_id = r.student_id and h.mis = r.mis) k) as skills
      from rep r
  )
  select coalesce(jsonb_agg(jsonb_build_object(
           'student_id', w.student_id, 'name', w.name,
           'mistakes', (select jsonb_agg(jsonb_build_object('id', pm.mis, 'label', mr.description,
                                                            'skills', pm.skills) order by pm.mis)
                          from per_mis pm left join misconception_registry mr on mr.id = pm.mis
                         where pm.student_id = w.student_id))
         order by lower(w.name), w.student_id), '[]'::jsonb)
    into v_same
    from mixed_roster(p_class_id) w
   where exists (select 1 from per_mis pm where pm.student_id = w.student_id);

  select coalesce(array_agg(distinct (e->>'student_id')::uuid), '{}') into v_listed
    from jsonb_array_elements(v_stuck || v_facts || v_same) e;

  select count(*) into v_started from mixed_roster(p_class_id) w
   where exists (select 1 from mixed_attempts a
                  where a.class_id = p_class_id and a.student_id = w.student_id
                    and a.practice_day = v_today)
      or exists (select 1 from sprint_sessions s
                  where s.class_id = p_class_id and s.student_id = w.student_id
                    and s.practice_day = v_today
                    and exists (select 1 from sprint_attempts a where a.session_id = s.id));

  return jsonb_build_object(
    'mixed_on',      v_class.mixed_on_at is not null,
    'facts_on',      v_class.fact_sprint_on_at is not null,
    'started_today', v_started,
    'stuck',         v_stuck,
    'facts',         v_facts,
    'same_mistake',  v_same,
    'everyone_else', v_roster - coalesce(array_length(v_listed, 1), 0));
end;
$$;

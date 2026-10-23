-- =============================================================================
-- 0068_mixed_teacher_panel.sql — mixed practice: the teacher's panel and
--                                "Who to see first" (build slice 4 of 4)
-- -----------------------------------------------------------------------------
-- docs/design/mixed-practice-teacher-panel.md (W-1…W-11, ruled 2026-10-23) and
-- the slice 4 P10 rulings (S4-1…S4-5, 2026-10-23) in mixed-practice.md.
--
--   §A  skill_label — a mirror of the curriculum's skill labels (W-6), the
--       `# …` text after each id in their skill-registry.txt. Written by
--       `pnpm import:batch --skills-registry` (service role, insert-or-update,
--       never deleted). Public curriculum text: any signed-in user reads it.
--   §B  mixed_who_first(class) — ONE read for the list (W-11): group 1
--       "Getting stuck on a skill" (practised TODAY, getting stuck by the
--       unchanged 0066 rule, on a skill among today's served items), plus the
--       number-facts rows (S4-3: a family labelled needs_strategy and still
--       in strategy mode, number facts practised today; never merged with the
--       mixed signal), group 2 "Same mistake twice" (the same misconception
--       id on ≥ 2 of the last `mixed_struggling_window` first tries on one
--       skill ACROSS DAYS, listed only if the student practised today — W-4
--       as revised by C-162), and "Everyone else" as a COUNT.
--   §C  mixed_student_recent(class, student) — the drawer (W-8): the
--       student's last 10 first tries in this class.
--   §D  mixed_class_summary v2 + mixed_class_students v2 — labels (W-6); the
--       students' "getting stuck on" as {id, label}; the latest graded score
--       from FINISHED sessions only, with `score_in_progress` when a graded
--       session today is still open (S4-5).
--
-- Every read is teacher-only through is_class_teacher (W-10: a student gets
-- not_class_teacher). Names appear only in the reads the panel calls behind a
-- deliberate disclosure (DM-18, W-2); the summary stays counts only.
--
-- ⚠ NO NEW PERSONAL DATA: skill_label holds curriculum text; the reads derive
-- from mixed_attempts / sprint rows already in the data map.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A. skill_label (W-6)
-- -----------------------------------------------------------------------------
create table skill_label (
  id          text primary key check (length(id) between 1 and 200),
  label       text not null check (length(label) between 1 and 500),
  updated_at  timestamptz not null default now()
);

alter table skill_label enable row level security;
alter table skill_label force row level security;

-- One read policy; writes only through the importer's service connection.
create policy skill_label_read on skill_label for select to authenticated using (true);

comment on table skill_label is
  'Platform mirror of the curriculum''s skill labels (0068, W-6): the `# …` text after each id in their skill-registry.txt. Refreshed by pnpm import:batch --skills-registry (insert-or-update, never deleted). Public generated content: readable by any signed-in user; written only via service role.';

-- The live roster with display names, as 0066's teacher reads build it.
create or replace function mixed_roster(p_class_id uuid)
returns table (student_id uuid, name text)
language sql
stable
security definer
set search_path = public
as $$
  select m.student_id, coalesce(nullif(btrim(u.display_name), ''), u.email, 'Unknown')
    from class_members m join users u on u.id = m.student_id
   where m.class_id = p_class_id and m.removed_at is null;
$$;

-- A practice key's words for a teacher: a skill's mirrored label; a
-- discrimination bank's key (`<chain>.discrimination`, PB-3) is never shown —
-- it reads "Choosing between skills" (DM-13: never "discrimination" on screen;
-- Fable review 2026-10-23, P2-1).
create or replace function mixed_key_label(p_kind text, p_key text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select case when p_kind = 'discrimination' then 'Choosing between skills'
              else (select l.label from skill_label l where l.id = p_key) end;
$$;

-- -----------------------------------------------------------------------------
-- B. mixed_who_first (W-2, W-3, W-4, W-9, W-11; S4-1, S4-3)
-- -----------------------------------------------------------------------------
-- Shape:
--   { mixed_on, facts_on, started_today,
--     stuck:        [{student_id, name, skills: [{id, label}]}],
--     facts:        [{student_id, name, families: [name]}],
--     same_mistake: [{student_id, name, mistakes: [{id, label, skills: [{id, label}]}]}],
--     everyone_else: n }
-- Every list in NAME order (groups, not a rank — W-2). No scores, rates or
-- per-student counts.
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

  -- Group 2: the same misconception on ≥ 2 of the last `window` first tries
  -- on one skill (or discrimination bank), across days; practised today.
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
  ), rep as (
    select w.student_id, m.id as mis, w.kind, w.bank_key
      from win w cross join lateral unnest(w.misconception_ids) m(id)
     where w.rn <= v_win
     group by w.student_id, m.id, w.kind, w.bank_key
    having count(*) >= 2
  ), per_mis as (
    select r.student_id, r.mis,
           jsonb_agg(jsonb_build_object('id', r.bank_key, 'label', mixed_key_label(r.kind, r.bank_key))
                     order by r.bank_key) as skills
      from rep r
     group by r.student_id, r.mis
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

-- -----------------------------------------------------------------------------
-- C. mixed_student_recent — the drawer (W-8)
-- -----------------------------------------------------------------------------
-- The student's last 10 first tries IN THIS CLASS: skill (id + label), right /
-- wrong / skipped, the misconceptions it showed (id + teacher-facing label),
-- the day. A current member only; the same no-oracle error otherwise.
create or replace function mixed_student_recent(p_class_id uuid, p_student_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or p_class_id is null or p_student_id is null
     or not is_class_teacher(p_class_id)
     or not exists (select 1 from class_members m
                     where m.class_id = p_class_id and m.student_id = p_student_id
                       and m.removed_at is null) then
    raise exception 'not_class_teacher' using errcode = '42501';
  end if;
  return (
    select coalesce(jsonb_agg(jsonb_build_object(
             'practice_day', x.practice_day,
             'kind', x.kind,
             'skill_id', x.bank_key,
             'skill_label', mixed_key_label(x.kind, x.bank_key),
             'correct', x.correct,
             'skipped', x.skipped,
             'mistakes', (select coalesce(jsonb_agg(jsonb_build_object('id', m.id, 'label', mr.description)
                                                    order by m.id), '[]'::jsonb)
                            from unnest(x.misconception_ids) m(id)
                            left join misconception_registry mr on mr.id = m.id))
           order by x.practice_day desc, x.saved_at desc, x.seq desc), '[]'::jsonb)
    from (select a.*
            from mixed_attempts a
           where a.class_id = p_class_id and a.student_id = p_student_id
           order by a.practice_day desc, a.saved_at desc, a.seq desc
           limit 10) x);
end;
$$;

-- -----------------------------------------------------------------------------
-- D. the two 0066 reads, v2 — labels (W-6) and finished-only scores (S4-5)
-- -----------------------------------------------------------------------------
-- H1 v2: 0066's body; each skill row gains `label` (NULL until mirrored).
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

-- H2 v2: `struggling` becomes [{id, label}]; `latest_score` reads FINISHED
-- graded sessions only, and `score_in_progress` says a graded session today
-- is still open (S4-5: a running count is not a score).
create or replace function mixed_class_students(p_class_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_basis record;
  v_win   integer;
  v_min   integer;
  v_today date;
begin
  if auth.uid() is null or p_class_id is null or not is_class_teacher(p_class_id) then
    raise exception 'not_class_teacher' using errcode = '42501';
  end if;
  select * into v_basis from mixed_basis(p_class_id);
  v_win   := coalesce((v_basis.settings->>'mixed_struggling_window')::integer, 5);
  v_min   := coalesce((v_basis.settings->>'mixed_struggling_min_right')::integer, 3);
  v_today := (now() at time zone fact_class_zone(p_class_id))::date;

  return (
    with roster as (
      select m.student_id,
             coalesce(nullif(btrim(u.display_name), ''), u.email, 'Unknown') as name
      from class_members m join users u on u.id = m.student_id
      where m.class_id = p_class_id and m.removed_at is null
    ), rec as (select * from mixed_recent(p_class_id, v_win))
    select coalesce(jsonb_agg(jsonb_build_object(
             'student_id', r.student_id,
             'name', r.name,
             'days_this_week', (select count(distinct a.practice_day) from mixed_attempts a
                                 where a.class_id = p_class_id and a.student_id = r.student_id
                                   and a.practice_day > v_today - 7),
             'struggling', (select coalesce(jsonb_agg(jsonb_build_object('id', x.bank_key, 'label', l.label)
                                                      order by x.bank_key), '[]'::jsonb)
                              from rec x left join skill_label l on l.id = x.bank_key
                             where x.student_id = r.student_id
                               and x.tries - x.right_n > v_win - v_min),
             'latest_score', (select jsonb_build_object('right', s.score_right,
                                                        'answered', s.score_answered,
                                                        'planned', s.planned,
                                                        'practice_day', s.practice_day)
                                from mixed_sessions s
                               where s.class_id = p_class_id and s.student_id = r.student_id
                                 and s.graded and s.finished_at is not null
                               order by s.practice_day desc, s.ordinal desc limit 1),
             'score_in_progress', exists (select 1 from mixed_sessions s
                                           where s.class_id = p_class_id and s.student_id = r.student_id
                                             and s.graded and s.finished_at is null
                                             and s.practice_day = v_today))
           order by lower(r.name), r.student_id), '[]'::jsonb)
    from roster r);
end;
$$;

-- -----------------------------------------------------------------------------
-- E. grants
-- -----------------------------------------------------------------------------
revoke all on table skill_label from anon;
revoke insert, update, delete, truncate on table skill_label from authenticated;
grant  select on table skill_label to authenticated;
grant  select, insert, update on table skill_label to service_role;

revoke execute on function mixed_key_label(text, text)           from public, anon, authenticated;
grant  execute on function mixed_key_label(text, text)           to service_role;
revoke execute on function mixed_roster(uuid)                    from public, anon, authenticated;
grant  execute on function mixed_roster(uuid)                    to service_role;
revoke execute on function mixed_who_first(uuid)                 from public, anon;
grant  execute on function mixed_who_first(uuid)                 to authenticated, service_role;
revoke execute on function mixed_student_recent(uuid, uuid)      from public, anon;
grant  execute on function mixed_student_recent(uuid, uuid)      to authenticated, service_role;
revoke execute on function mixed_class_summary(uuid)             from public, anon;
grant  execute on function mixed_class_summary(uuid)             to authenticated, service_role;
revoke execute on function mixed_class_students(uuid)            from public, anon;
grant  execute on function mixed_class_students(uuid)            to authenticated, service_role;

-- =============================================================================
-- Verification lives in scripts/verify-0068.sql (registered in the verify
-- runner): the posture (definer, pinned, signed-in only; skill_label read-only
-- to clients); only the class's teacher reads any of it (a student gets
-- not_class_teacher, W-10); each group FIRES at production values (P3);
-- getting stuck but not practising today is NOT listed (C-162); a sprint
-- needs_strategy row, and never a "slow" one; everyone else is a count; the
-- drawer; labels; finished-only scores.
-- =============================================================================

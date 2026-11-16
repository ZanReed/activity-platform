-- =============================================================================
-- 0090_help_requests.sql — "Ask my teacher" (docs/design/ask-my-teacher.md,
-- S9, ST-1..ST-14 ruled by the author 2026-11-16, all as recommended)
-- -----------------------------------------------------------------------------
-- A signed-in student, inside an activity, asks their teacher for help on one
-- check group of it. The teacher sees who is asking, where, and since when on
-- Class Progress, and marks it Done. The student can withdraw it ("I've got it
-- now"). Anything still open LAPSES at the end of the class's day.
--
--   §A  classes.help_requests_on (ST-14, default ON) + set_class_help
--   §B  help_requests — STUDENT-DERIVED personal data, no free text (ST-1 i)
--   §C  the student's RPCs: my_help_state, ask_teacher, withdraw_help
--   §D  the teacher's RPCs: class_help_open, end_help
--   §E  prune_help_requests — 30 days, DISARMED (ST-12)
--   §F  grants
--
-- ONE ROW PER CLASS (as built; the design sketched one row with a class_ids
-- array). ST-3 sends a request to every class that holds the activity and has
-- the student. Those classes may belong to DIFFERENT teachers, and each one's
-- Done is that teacher's own, so a row per class is what "Done" means. The
-- student sees one request: any open row for that section is "asked".
--
-- LAPSE IS STORED, not recomputed: `lapses_at` is the end of the class's day
-- in its teacher's zone (fact_class_zone) at the moment of asking. An open
-- request is `ended_at is null and lapses_at > now()`. A lapsed row is never
-- shown again (ST-4) and the prune takes it at 30 days.
--
-- The class is resolved HERE, never sent by the client (ST-3): the viewer at
-- /a/:id knows no class (0030), and a client-supplied class id would let a
-- student file into a class they are not in.
--
-- No audit row per request (ST-13): requests are formative and frequent, like
-- checks (0020:29-32); the table, with who ended each row, is the record. The
-- class switch is a teacher write and IS audited (class.update, op
-- set_help — 0088's pattern, no new enum label for it).
--
-- PERSONAL DATA: adds `help_requests` (student id + where and when they
-- asked). docs/compliance/data-map.md and retention-policy.md change in this
-- commit.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A. The class switch (ST-14)
-- -----------------------------------------------------------------------------

alter table classes add column help_requests_on boolean not null default true;

comment on column classes.help_requests_on is
  'Students in this class can ask the teacher for help from inside an activity (0090, ST-14). Default on. Written only by set_class_help.';

create or replace function set_class_help(p_class_id uuid, p_on boolean)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or p_class_id is null or p_on is null
     or not current_user_is_teacher()
     or not exists (select 1 from classes c
                     where c.id = p_class_id and c.teacher_id = auth.uid()
                       and c.deleted_at is null) then
    raise exception 'Not your class' using errcode = '42501';
  end if;
  update classes set help_requests_on = p_on
   where id = p_class_id and help_requests_on is distinct from p_on;
  if found then
    insert into audit_log (actor_id, action, target_type, target_id, metadata)
    values (auth.uid(), 'class.update', 'class', p_class_id,
            jsonb_build_object('op', 'set_help', 'on', p_on));
  end if;
  return jsonb_build_object('on', p_on);
end;
$$;

-- -----------------------------------------------------------------------------
-- B. The table
-- -----------------------------------------------------------------------------

create table help_requests (
  id                  uuid primary key default gen_random_uuid(),
  student_id          uuid not null references users(id) on delete cascade,
  class_id            uuid not null references classes(id) on delete cascade,
  activity_id         uuid not null references activities(id) on delete cascade,
  activity_version_id uuid not null references activity_versions(id) on delete cascade,
  section_id          text not null check (length(section_id) between 1 and 100),
  created_at          timestamptz not null default now(),
  lapses_at           timestamptz not null,
  ended_at            timestamptz,
  -- Who ended it. NULL while open, and on a row that simply lapsed.
  ended_by            text check (ended_by in ('teacher', 'student')),
  -- The teacher who marked it Done (ST-12). SET NULL so a teacher's account
  -- purge never takes a student's row with it.
  ended_by_teacher    uuid references users(id) on delete set null,
  check ((ended_at is null) = (ended_by is null)),
  check (ended_by = 'teacher' or ended_by_teacher is null)
);

-- At most ONE open request per student and section (ST-2). "Open" depends on
-- now() (a row lapses), which no index predicate can express, so the rule is
-- held in ask_teacher: a per-student transaction lock, then "already open?"
-- before any insert. verify-0090 B2 proves a second ask makes no row.

-- The teacher's read: a class's open rows, newest last.
create index help_requests_class_idx on help_requests (class_id, created_at);
-- The student's read and the daily limit.
create index help_requests_student_idx on help_requests (student_id, created_at);

alter table help_requests enable row level security;
alter table help_requests force row level security;
-- No client policies: every read and write is one of the DEFINER functions
-- below, so the table itself grants nothing.
revoke all on help_requests from public, anon, authenticated;

comment on table help_requests is
  'A student asked their teacher for help on one check group (0090, S9). No free text. Kept 30 days (prune_help_requests, disarmed).';

-- -----------------------------------------------------------------------------
-- C. The student
-- -----------------------------------------------------------------------------

-- The classes a request from the caller about this activity goes to: the
-- caller is an ACTIVE member, the class holds the activity, is not deleted,
-- and has the switch on (ST-3, ST-14).
create or replace function help_target_classes(p_activity_id uuid)
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select c.id
    from class_members m
    join classes c on c.id = m.class_id
    join class_activities ca on ca.class_id = c.id and ca.activity_id = p_activity_id
   where m.student_id = auth.uid()
     and m.removed_at is null
     and c.deleted_at is null
     and c.help_requests_on;
$$;

-- The caller's OPEN requests on this activity that a teacher can actually
-- see: unended, not lapsed, in a class that still exists and still has the
-- student (class_help_open's own conditions). A row a teacher can no longer
-- see (the student moved class, the class was deleted) must not read
-- "Asked" to the student, or a hand is up that nobody can see (Fable review).
-- Matched on the ACTIVITY, not the version: a republish must not strand a
-- request the student can neither see nor withdraw.
create or replace function help_open_rows(p_activity_id uuid)
returns setof help_requests
language sql
stable
security definer
set search_path = public
as $$
  select h.*
    from help_requests h
    join classes c on c.id = h.class_id and c.deleted_at is null
    join class_members m on m.class_id = h.class_id and m.student_id = h.student_id
                        and m.removed_at is null
   where h.student_id = auth.uid()
     and h.activity_id = p_activity_id
     and h.ended_at is null
     and h.lapses_at > now();
$$;

-- No asking during an assessment (author ruling 2026-11-16): not in a
-- `locked` activity, not in a quiz or an exam, not in a DoL section. Read from the
-- version's own content, so the server holds the rule, not the button.
create or replace function help_allowed(p_content jsonb, p_section_id text)
returns boolean
language sql
immutable
set search_path = public
as $$
  select coalesce(p_content->'meta'->>'submissionMode', 'free') <> 'locked'
     and coalesce(p_content->'meta'->>'activityType', 'worksheet') not in ('quiz', 'exam')
     and (p_section_id is null
          or not exists (select 1 from jsonb_array_elements(coalesce(p_content->'sections', '[]'::jsonb)) s
                          where s->>'id' = p_section_id
                            and s->'dol' is not null and s->'dol' <> 'null'::jsonb));
$$;

-- What the viewer draws (ST-9): can the caller ask at all, which sections are
-- asked now, and which a teacher marked Done today. Read once on open and
-- after each ask/withdraw; never polled.
create or replace function my_help_state(p_version_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_activity uuid;
  v_content  jsonb;
begin
  select activity_id, content into v_activity, v_content from activity_versions where id = p_version_id;
  if auth.uid() is null or v_activity is null then
    return jsonb_build_object('can_ask', false, 'open', '[]'::jsonb, 'done', '[]'::jsonb);
  end if;
  return jsonb_build_object(
    -- ask_teacher's own gates: a student account, a class to ask, and not an
    -- assessment (a DoL section is refused per section; the viewer hides
    -- the button on the DoL group).
    'can_ask', help_allowed(v_content, null)
               and exists (select 1 from users u where u.id = auth.uid()
                        and u.role = 'student' and u.deleted_at is null)
               and exists (select 1 from help_target_classes(v_activity)),
    'open', (select coalesce(jsonb_agg(distinct o.section_id), '[]'::jsonb)
               from help_open_rows(v_activity) o),
    -- Done today, and the student's LATEST word on that section: nothing
    -- asked (or withdrawn) after it.
    'done', (select coalesce(jsonb_agg(distinct h.section_id), '[]'::jsonb)
               from help_requests h
              where h.student_id = auth.uid() and h.activity_id = v_activity
                and h.ended_by = 'teacher' and h.lapses_at > now()
                and not exists (select 1 from help_requests n
                                 where n.student_id = h.student_id
                                   and n.activity_id = h.activity_id
                                   and n.section_id = h.section_id
                                   and n.created_at > h.created_at)
                and not exists (select 1 from help_open_rows(v_activity) o
                                 where o.section_id = h.section_id)));
end;
$$;

create or replace function ask_teacher(p_version_id uuid, p_section_id text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_activity uuid;
  v_content  jsonb;
  v_asks     integer;
  v_class    uuid;
  v_zone     text;
  v_now      timestamptz := now();
begin
  if auth.uid() is null
     or not exists (select 1 from users u where u.id = auth.uid()
                     and u.role = 'student' and u.deleted_at is null) then
    raise exception 'Only students can ask' using errcode = '42501';
  end if;

  -- The version must be the activity's CURRENT published one, and the section
  -- one of its own: a request never names a place a student cannot be.
  select v.activity_id, v.content into v_activity, v_content
    from activity_versions v
    join activities a on a.id = v.activity_id
   where v.id = p_version_id and a.current_version_id = v.id
     and a.status = 'published' and a.deleted_at is null;
  if v_activity is null
     or p_section_id is null
     or not exists (select 1 from jsonb_array_elements(coalesce(v_content->'sections', '[]'::jsonb)) s
                     where s->>'id' = p_section_id) then
    raise exception 'not_available';
  end if;

  if not help_allowed(v_content, p_section_id) then
    raise exception 'not_during_assessment';
  end if;

  if not exists (select 1 from help_target_classes(v_activity)) then
    raise exception 'no_class';
  end if;

  -- One ask at a time per student (two taps, two tabs): the check below and
  -- the insert run under this lock, so ST-2 holds without an index.
  perform pg_advisory_xact_lock(hashtext('help_requests'), hashtext(auth.uid()::text));

  -- Already asked in EVERY class it goes to: nothing new (ST-2). A class
  -- without a visible open row (joined since, or the student was moved into
  -- it) gets one, so no teacher who should see the hand misses it.
  if not exists (select 1 from help_target_classes(v_activity) t
                  where not exists (select 1 from help_open_rows(v_activity) o
                                     where o.class_id = t and o.section_id = p_section_id)) then
    return my_help_state(p_version_id);
  end if;

  -- ST-11: at most 20 asks a day. An ask writes its rows at one instant, so
  -- asks are distinct created_at values over a trailing 24 hours.
  select count(distinct h.created_at) into v_asks
    from help_requests h
   where h.student_id = auth.uid() and h.created_at > v_now - interval '24 hours';
  if v_asks >= 20 then
    raise exception 'rate_limited';
  end if;

  for v_class in
    select t from help_target_classes(v_activity) t
     where not exists (select 1 from help_open_rows(v_activity) o
                        where o.class_id = t and o.section_id = p_section_id)
  loop
    v_zone := fact_class_zone(v_class);
    insert into help_requests (student_id, class_id, activity_id, activity_version_id,
                               section_id, created_at, lapses_at)
    values (auth.uid(), v_class, v_activity, p_version_id, p_section_id, v_now,
            (((v_now at time zone v_zone)::date + 1)::timestamp) at time zone v_zone);
  end loop;

  return my_help_state(p_version_id);
end;
$$;

-- Ends every unended request the caller has on this activity's section, in
-- any class and on any version, so nothing the student can't see stays up.
create or replace function withdraw_help(p_version_id uuid, p_section_id text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_activity uuid;
begin
  if auth.uid() is null then
    raise exception 'Not signed in' using errcode = '42501';
  end if;
  select activity_id into v_activity from activity_versions where id = p_version_id;
  update help_requests h set ended_at = now(), ended_by = 'student'
   where h.student_id = auth.uid() and h.activity_id = v_activity
     and h.section_id = p_section_id
     and h.ended_at is null and h.lapses_at > now();
  return my_help_state(p_version_id);
end;
$$;

-- -----------------------------------------------------------------------------
-- D. The teacher
-- -----------------------------------------------------------------------------

-- A class's open requests, oldest first (who has waited longest leads). The
-- section is named by its title, else its first heading below level 1, else
-- "Section N" by position, from the version the student asked on. Polled by Class Progress (ST-5/6).
create or replace function class_help_open(p_class_id uuid)
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
  return jsonb_build_object(
    'on', (select c.help_requests_on from classes c where c.id = p_class_id),
    'requests', (
      select coalesce(jsonb_agg(jsonb_build_object(
               'id', h.id,
               'student_id', h.student_id,
               'name', coalesce(nullif(btrim(u.display_name), ''), u.email, 'Unknown'),
               'activity_id', h.activity_id,
               'activity_title', a.title,
               'section_label', coalesce(
                 (select coalesce(
                           nullif(btrim(s.value->>'title'), ''),
                           -- A catalogue section often has no title and names
                           -- itself with a heading instead ("Review"); level 1
                           -- is the activity's own title, so it is skipped.
                           (select nullif(btrim(string_agg(t->>'text', '' order by tn)), '')
                              from (select b, rn
                                      from jsonb_array_elements(coalesce(s.value->'rows', '[]'::jsonb))
                                             with ordinality r(row, ro)
                                      cross join lateral jsonb_array_elements(coalesce(r.row->'columns', '[]'::jsonb))
                                             with ordinality c(col, co)
                                      cross join lateral jsonb_array_elements(coalesce(c.col->'blocks', '[]'::jsonb))
                                             with ordinality bl(b, bo)
                                      cross join lateral (select (ro * 1000000 + co * 1000 + bo) as rn) k
                                     where b->>'type' = 'heading' and coalesce((b->>'level')::int, 1) >= 2
                                     order by rn limit 1) first_heading
                              cross join lateral jsonb_array_elements(coalesce(first_heading.b->'content', '[]'::jsonb))
                                     with ordinality tt(t, tn)),
                           'Section ' || s.ordinality)
                    from jsonb_array_elements(coalesce(v.content->'sections', '[]'::jsonb))
                         with ordinality s
                   where s.value->>'id' = h.section_id),
                 'A section'),
               'created_at', h.created_at)
             order by h.created_at, h.id), '[]'::jsonb)
        from help_requests h
        join users u on u.id = h.student_id
        join activities a on a.id = h.activity_id and a.deleted_at is null
        join activity_versions v on v.id = h.activity_version_id
        -- Only students still in the class: a removed student's hand is not
        -- this class's to answer.
        join class_members m on m.class_id = h.class_id and m.student_id = h.student_id
                            and m.removed_at is null
       where h.class_id = p_class_id
         and h.ended_at is null and h.lapses_at > now()));
end;
$$;

create or replace function end_help(p_request_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_class uuid;
begin
  select h.class_id into v_class from help_requests h where h.id = p_request_id;
  if auth.uid() is null or v_class is null or not is_class_teacher(v_class) then
    raise exception 'not_class_teacher' using errcode = '42501';
  end if;
  update help_requests h
     set ended_at = now(), ended_by = 'teacher', ended_by_teacher = auth.uid()
   where h.id = p_request_id and h.ended_at is null;
  return class_help_open(v_class);
end;
$$;

-- -----------------------------------------------------------------------------
-- E. The 30-day prune (ST-12) — DISARMED
-- -----------------------------------------------------------------------------
-- Dry-run by default and UNSCHEDULED, like the four deleters of student work
-- (CLAUDE.md → Things NOT to do). This one deletes requests, not work, but it
-- is held to the same rule: arming is the author's yes (TODOS), and
-- verify-0090's prune_is_unscheduled row fails if a cron job names it.

alter type audit_action add value if not exists 'help_requests.prune';

create or replace function prune_help_requests(p_dry_run boolean default true)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_rows  integer;
  v_class record;
begin
  select count(*) into v_rows from help_requests h
   where h.created_at < now() - interval '30 days';

  if not p_dry_run and v_rows > 0 then
    for v_class in
      select h.class_id, count(*) as n
        from help_requests h
       where h.created_at < now() - interval '30 days'
       group by h.class_id
    loop
      insert into audit_log (actor_id, action, target_type, target_id, metadata)
      values (null, 'help_requests.prune', 'class', v_class.class_id,
              jsonb_build_object('requests', v_class.n));
    end loop;
    delete from help_requests h where h.created_at < now() - interval '30 days';
  end if;

  return jsonb_build_object('dry_run', p_dry_run, 'requests', v_rows);
end;
$$;

comment on function prune_help_requests(boolean) is
  'Removes help requests 30 days after they were made (0090, ST-12). Dry-run by default and unscheduled: arming is the author''s call (TODOS).';

-- -----------------------------------------------------------------------------
-- F. grants (0009's standing rule: every function carries its own stanza)
-- -----------------------------------------------------------------------------
revoke execute on function help_target_classes(uuid) from public, anon, authenticated;
grant  execute on function help_target_classes(uuid) to service_role;
revoke execute on function help_allowed(jsonb, text) from public, anon, authenticated;
grant  execute on function help_allowed(jsonb, text) to service_role;
revoke execute on function help_open_rows(uuid) from public, anon, authenticated;
grant  execute on function help_open_rows(uuid) to service_role;

revoke execute on function set_class_help(uuid, boolean)   from public, anon;
grant  execute on function set_class_help(uuid, boolean)   to authenticated, service_role;
revoke execute on function my_help_state(uuid)             from public, anon;
grant  execute on function my_help_state(uuid)             to authenticated, service_role;
revoke execute on function ask_teacher(uuid, text)         from public, anon;
grant  execute on function ask_teacher(uuid, text)         to authenticated, service_role;
revoke execute on function withdraw_help(uuid, text)       from public, anon;
grant  execute on function withdraw_help(uuid, text)       to authenticated, service_role;
revoke execute on function class_help_open(uuid)           from public, anon;
grant  execute on function class_help_open(uuid)           to authenticated, service_role;
revoke execute on function end_help(uuid)                  from public, anon;
grant  execute on function end_help(uuid)                  to authenticated, service_role;

revoke execute on function prune_help_requests(boolean) from public, anon, authenticated;
grant  execute on function prune_help_requests(boolean) to service_role;

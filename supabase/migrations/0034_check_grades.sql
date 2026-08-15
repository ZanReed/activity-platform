-- =============================================================================
-- 0034_check_grades.sql — teacher grading, bound to section_checks
-- -----------------------------------------------------------------------------
-- Implements the eng+design-cleared architecture in docs/design/teacher-grading.md
-- (G1–G14 ruled 2026-08-15; the UI half is §2b/G8-DR). This is the S4 deferral
-- coming due: S4 CAPTURED free text into section_checks.responses and
-- deliberately refused to key grades onto it, because `unique(check_id, block_id)`
-- written before the grading UI existed would have frozen the attempts-vs-latest
-- question blind (cross-model tension T2, 2026-08-01). The UI now exists on
-- paper, the question is ruled, and this migration writes that key.
--
--   §A  audit_action gains 'grade.release'                       (G4)
--   §B  check_grades — the table, deny-by-default                (G1)
--   §C  upsert_check_grade — the audited write                   (G3)
--   §D  release_check_grades — the audited, visible event        (G4)
--   §E  get_my_released_feedback — the student read              (G5)
--   §F  list_grading_queue — the teacher read                    (G10)
--   §G  purge_soft_deleted v3 — the grades blocker retires       (G11)
--   §H  DROP grades + can_grade_submission                       (G1)
--   §I  grants (0009's standing rule)
--
-- THE RULING THIS FILE ENCODES (G2, the deferral's answer): a grade keys on a
-- SPECIFIC check row — the immutable record of what was actually graded — while
-- the teacher's queue surfaces the LATEST check per (student, section) within a
-- version. "Stale" therefore means the student's TEXT changed, never that a
-- newer check row exists: re-checking to retry auto-graded blanks is a designed
-- feature (parity ruling 7.1A), and an attempt-number staleness rule would cry
-- wolf on every one of them.
--
-- ORDER CONTRACT: §A's enum label is added before any function body USES it.
-- Same PG12+ rule 0033 §A documents — ADD VALUE commits in-transaction, the
-- label just cannot be used by DML in that same transaction, and nothing here
-- writes an audit row at migration time.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A. The release audit action
-- -----------------------------------------------------------------------------
-- 'grade.upsert' already exists (0010 declared it, and it outlives the table
-- that motivated it — enum labels are independent of the tables that used
-- them). 'grade.release' is new, and it is the row that matters most in this
-- slice: release is the moment a student's academic record becomes visible to
-- them, which is precisely the event a FERPA-shaped audit trail exists to
-- record. 0033 §A learned this the hard way — an undeclared label does not fail
-- a lint, it raises at RUNTIME inside the RPC.
alter type audit_action add value if not exists 'grade.release';

-- -----------------------------------------------------------------------------
-- B. check_grades
-- -----------------------------------------------------------------------------
-- One row per (check, block): the teacher's per-criterion scores and feedback
-- against ONE free-text block of ONE check row.
--
-- check_id ON DELETE CASCADE is load-bearing for retention (G11): 0022 taught
-- purge_soft_deleted to delete section_checks by activity and by student, and
-- this cascade means those two paths stay complete without the purge function
-- ever learning that grades exist. ⚠ The same cascade is why the DEFERRED
-- check-pruning work carries a hard constraint, recorded in TODOS: pruning must
-- never delete a check row referenced here, or it silently destroys the
-- teacher's grade along with the attempt.
--
-- graded_by ON DELETE SET NULL is 0024's event-outlives-account pattern, and it
-- is a DELIBERATE change from 0010's ON DELETE RESTRICT. Under 0010 a teacher
-- who had graded anything could never be purged; here the grade survives its
-- grader and the UI attributes it to "a former teacher" (G8-DR's copy table).
-- §G removes the purge blocker that RESTRICT required.
--
-- criteria shape: [{criterionId uuid, earned numeric, maxPoints numeric,
-- feedback? text}]. maxPoints is DENORMALIZED here on purpose (G1) — it is
-- copied from the pinned rubric BY THE SERVER at grade time (§C), never trusted
-- from the client. Two reasons: the student read (§E) must never need to open
-- activity_versions.content to render a score (that column is the raw document,
-- answer keys included — the leak hazard 0020's header shouts about), and a
-- rubric edited in a later version cannot retroactively change what a released
-- grade said.
create table check_grades (
  id               uuid primary key default gen_random_uuid(),
  check_id         uuid not null references section_checks(id) on delete cascade,
  block_id         uuid not null,
  criteria         jsonb not null default '[]'::jsonb,
  general_feedback text,
  graded_by        uuid references users(id) on delete set null,
  graded_at        timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  -- NULL = graded but not yet visible to the student. Stamped by §D only.
  released_at      timestamptz,
  -- One grade per (check, block): a re-grade UPDATEs this row (0010's good
  -- idea, kept). The leading column also covers the check_id FK (0009).
  unique (check_id, block_id)
);

-- FK covering index (0009 discipline — an unindexed FK slows cascades and
-- planning). check_id is covered by the unique above.
create index check_grades_graded_by_idx on check_grades (graded_by);

-- The student read (§E) and the release write (§D) both filter released_at;
-- partial index because the unreleased rows are the ones nobody queries by it.
create index check_grades_released_idx on check_grades (released_at)
  where released_at is not null;

alter table check_grades enable row level security;
alter table check_grades force row level security;

-- NO POLICIES AT ALL, deliberately — the same shape 0020 chose for
-- section_checks writes and 0019 for the image bucket: the ABSENCE of a policy
-- is the control. Every read and write goes through the four audited/scoped
-- functions below, so there is no client-reachable path that RLS would have to
-- get right. A future "just let the teacher select it" policy would widen the
-- surface these functions exist to keep narrow (G5/G10).

comment on table check_grades is
  'Teacher grades on section_checks free-text blocks (0034). No RLS policies by design: all access is through upsert_check_grade / release_check_grades / get_my_released_feedback / list_grading_queue.';

-- -----------------------------------------------------------------------------
-- C. upsert_check_grade — the audited write (G3)
-- -----------------------------------------------------------------------------
-- Gated on can_edit_activity, NOT can_read_activity. They are byte-identical
-- today (both resolve to activity ownership), and that is exactly why the
-- choice is free to make correctly now: can_read_activity is the recorded
-- Activity-Bank landmine — the co-ownership arc may widen it, and a widened
-- READ helper must never silently confer WRITE access to students' academic
-- records.
--
-- VALIDATION, and one amendment worth naming. The eng review first ruled that a
-- grade must target a block with a RESPONSE in the check; the design review
-- overturned it (D13): a student who wrote nothing is exactly the student a
-- teacher most needs to write to, and an empty essay may leave no freeText key
-- at all. So the containment check is against the check's SECTION in the pinned
-- version — which still makes the cross-section write unrepresentable — and
-- response presence is not required.
create or replace function upsert_check_grade(
  p_check_id         uuid,
  p_block_id         uuid,
  p_criteria         jsonb,
  p_general_feedback text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_check     section_checks%rowtype;
  v_content   jsonb;
  v_block     jsonb;
  v_criteria  jsonb := '[]'::jsonb;
  v_item      jsonb;
  v_rubric    jsonb;
  v_max       numeric;
  v_earned    numeric;
  v_row       check_grades%rowtype;
begin
  if auth.uid() is null then
    raise log 'grade refused (signed_out)';
    raise exception 'Sign in before grading';
  end if;

  select * into v_check from section_checks where id = p_check_id;
  if v_check.id is null then
    raise log 'grade refused (no_check) user=% check=%', auth.uid(), p_check_id;
    raise exception 'No such response to grade';
  end if;

  if not can_edit_activity(v_check.activity_id) then
    raise log 'grade refused (not_owner) user=% activity=%', auth.uid(), v_check.activity_id;
    raise exception 'Not your activity';
  end if;

  select content into v_content
  from activity_versions where id = v_check.activity_version_id;

  -- The block must live in THIS check's section, in the version the student was
  -- actually served. Walking sections -> rows -> columns -> blocks is the
  -- document's real shape (schema: Section.rows[].columns[].blocks[]).
  select b into v_block
  from jsonb_array_elements(coalesce(v_content->'sections', '[]'::jsonb)) s
  cross join lateral jsonb_array_elements(coalesce(s->'rows', '[]'::jsonb)) r
  cross join lateral jsonb_array_elements(coalesce(r->'columns', '[]'::jsonb)) c
  cross join lateral jsonb_array_elements(coalesce(c->'blocks', '[]'::jsonb)) b
  where s->>'id' = v_check.section_id
    and b->>'id' = p_block_id::text
  limit 1;

  if v_block is null then
    raise log 'grade refused (block_not_in_section) user=% check=% block=%',
      auth.uid(), p_check_id, p_block_id;
    raise exception 'That question is not in this section';
  end if;

  -- self_explanation is READABLE in the response view but never gradable (G7):
  -- the schema calls it an ungraded reflection, and grading it would contradict
  -- the block's own contract. Anything outside the graded free-text pair is
  -- refused here, which also stops an MC id from being scored.
  if v_block->>'type' not in ('short_answer', 'essay') then
    raise log 'grade refused (not_gradable=%) user=% block=%',
      v_block->>'type', auth.uid(), p_block_id;
    raise exception 'Only written-answer questions can be graded';
  end if;

  v_rubric := v_block->'rubric'->'criteria';

  -- Build the stored criteria SERVER-SIDE. The client supplies criterionId +
  -- earned (+ optional feedback); maxPoints is read from the pinned rubric and
  -- written here, so a client cannot inflate a denominator, and §E never has to
  -- reopen the document to render one.
  for v_item in select * from jsonb_array_elements(coalesce(p_criteria, '[]'::jsonb))
  loop
    select (c->>'maxPoints')::numeric into v_max
    from jsonb_array_elements(coalesce(v_rubric, '[]'::jsonb)) c
    where c->>'id' = v_item->>'criterionId'
    limit 1;

    if v_max is null then
      raise log 'grade refused (criterion_not_on_rubric) user=% block=% criterion=%',
        auth.uid(), p_block_id, v_item->>'criterionId';
      raise exception 'That criterion is not on this rubric';
    end if;

    v_earned := (v_item->>'earned')::numeric;
    if v_earned is null or v_earned < 0 or v_earned > v_max then
      raise log 'grade refused (points_out_of_range) user=% block=% earned=% max=%',
        auth.uid(), p_block_id, v_earned, v_max;
      raise exception 'Points must be between 0 and the maximum';
    end if;

    v_criteria := v_criteria || jsonb_build_array(jsonb_build_object(
      'criterionId', v_item->>'criterionId',
      'earned',      v_earned,
      'maxPoints',   v_max,
      'feedback',    nullif(trim(coalesce(v_item->>'feedback', '')), '')
    ));
  end loop;

  insert into check_grades (check_id, block_id, criteria, general_feedback, graded_by)
  values (
    p_check_id,
    p_block_id,
    v_criteria,
    nullif(trim(coalesce(p_general_feedback, '')), ''),
    auth.uid()
  )
  on conflict (check_id, block_id) do update
    set criteria         = excluded.criteria,
        general_feedback = excluded.general_feedback,
        graded_by        = excluded.graded_by,
        updated_at       = now()
        -- released_at is deliberately NOT touched: a re-grade of a released
        -- row stays released and goes live immediately (G4), and a re-grade of
        -- an unreleased row stays unreleased. Release is §D's job alone.
  returning * into v_row;

  insert into audit_log (actor_id, action, target_type, target_id, metadata)
  values (auth.uid(), 'grade.upsert', 'activity', v_check.activity_id,
          jsonb_build_object('check_id', p_check_id, 'block_id', p_block_id,
                             'student_id', v_check.student_id));

  return jsonb_build_object(
    'id',          v_row.id,
    'check_id',    v_row.check_id,
    'block_id',    v_row.block_id,
    'criteria',    v_row.criteria,
    'released_at', v_row.released_at,
    'graded_at',   v_row.graded_at,
    'updated_at',  v_row.updated_at
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- D. release_check_grades — the audited, visible event (G4)
-- -----------------------------------------------------------------------------
-- Stamps released_at on one student's unreleased grades for one activity, and
-- writes the grade.release audit row.
--
-- Release is an EVENT, not a sticky state, and the design review (D14/D10) made
-- that honest rather than hidden: a grade saved AFTER a release sits unreleased
-- until the teacher releases again, and the UI derives an "N unreleased" badge
-- + a re-arming button from exactly the rows this function would stamp. The
-- alternative (future grades inherit a released flag) would silently stream
-- half-entered rubrics to a student mid-grading, which is the whole thing
-- explicit release exists to prevent.
--
-- Bulk release (G8-DR) iterates THIS function per student rather than adding a
-- second RPC: one audited event per student is the granularity the trail wants.
create or replace function release_check_grades(
  p_activity_id uuid,
  p_student_id  uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  if auth.uid() is null then
    raise log 'release refused (signed_out)';
    raise exception 'Sign in before releasing feedback';
  end if;

  if not can_edit_activity(p_activity_id) then
    raise log 'release refused (not_owner) user=% activity=%', auth.uid(), p_activity_id;
    raise exception 'Not your activity';
  end if;

  update check_grades cg
     set released_at = now()
    from section_checks sc
   where sc.id = cg.check_id
     and sc.activity_id = p_activity_id
     and sc.student_id  = p_student_id
     and cg.released_at is null;
  get diagnostics v_count = row_count;

  -- Idempotent by construction: a second release with nothing pending updates
  -- zero rows. It still writes an audit row ONLY when something actually
  -- changed — an audit rail that records non-events lies (0030's phrasing).
  if v_count > 0 then
    insert into audit_log (actor_id, action, target_type, target_id, metadata)
    values (auth.uid(), 'grade.release', 'activity', p_activity_id,
            jsonb_build_object('student_id', p_student_id, 'released', v_count));
  end if;

  return jsonb_build_object('released', v_count);
end;
$$;

-- -----------------------------------------------------------------------------
-- E. get_my_released_feedback — the student read (G5)
-- -----------------------------------------------------------------------------
-- SECURITY DEFINER scoped to auth.uid(), following 0030's list_class_activities
-- precedent: the table has no policies, so one function is the entire read
-- surface and the verify matrix pins its scoping. An INVOKER read would need a
-- student SELECT policy on check_grades — a wider surface for no gain.
--
-- ⚠ It must NEVER touch activity_versions.content. Everything it returns comes
-- from check_grades (whose criteria already carry maxPoints, §C) and
-- section_checks. That is the whole reason maxPoints is denormalized: this
-- function is student-callable, and the document holds answer keys.
--
-- No teacher identity is returned, only has_grader. Teacher display_name is
-- NULL by the author's own 2026-08-04 ruling and the student-facing copy says
-- "your teacher" / "a former teacher" (G8-DR) — a name here would be a
-- disclosure this slice has no reason to make.
--
-- stale (G2): the graded check's text for this block versus the LATEST check's
-- text for the same (student, version, section). Text, not attempt number.
create or replace function get_my_released_feedback(p_activity_id uuid)
returns table (
  block_id            uuid,
  criteria            jsonb,
  general_feedback    text,
  graded_at           timestamptz,
  attempt_number      integer,
  activity_version_id uuid,
  has_grader          boolean,
  stale               boolean
)
language sql
stable
security definer
set search_path = public
as $$
  with mine as (
    select sc.*, cg.block_id as g_block, cg.criteria, cg.general_feedback,
           cg.graded_at, cg.graded_by, cg.released_at
    from check_grades cg
    join section_checks sc on sc.id = cg.check_id
    where sc.student_id = auth.uid()
      and sc.activity_id = p_activity_id
      and cg.released_at is not null
  ),
  -- Latest released grade per block (G2: latest by graded_at wins). Two
  -- released grades on one block are reachable — grade attempt 2, student
  -- re-checks, grade attempt 4 — and the wire is a block-keyed map, so a
  -- winner rule is not optional.
  --
  -- ⚠ attempt_number is the SECOND key, not decoration: graded_at defaults to
  -- now(), which is the TRANSACTION timestamp, so two grades written in one
  -- transaction tie exactly. verify-0034 §D caught this by failing its
  -- identical-text row — with only `id desc` behind graded_at the winner was a
  -- random uuid comparison, and the staleness answer flipped run to run. When
  -- the clock cannot separate two grades, the one on the LATER attempt is the
  -- one the teacher meant.
  winner as (
    select distinct on (g_block) *
    from mine
    order by g_block, graded_at desc, attempt_number desc, id desc
  ),
  latest as (
    select distinct on (sc.student_id, sc.activity_version_id, sc.section_id) sc.*
    from section_checks sc
    where sc.student_id = auth.uid()
      and sc.activity_id = p_activity_id
    order by sc.student_id, sc.activity_version_id, sc.section_id,
             sc.attempt_number desc, sc.created_at desc
  )
  select w.g_block,
         w.criteria,
         w.general_feedback,
         w.graded_at,
         w.attempt_number,
         w.activity_version_id,
         (w.graded_by is not null),
         coalesce(
           (w.responses->'freeText'->>w.g_block::text)
             is distinct from
           (l.responses->'freeText'->>w.g_block::text),
           false
         )
  from winner w
  left join latest l
    on l.activity_version_id = w.activity_version_id
   and l.section_id = w.section_id;
$$;

-- -----------------------------------------------------------------------------
-- F. list_grading_queue — the teacher read (G10)
-- -----------------------------------------------------------------------------
-- One round trip for the Responses tab. DEFINER because the projection joins
-- users (for the student label) and activity_versions (to enumerate a section's
-- graded blocks) — neither readable by the caller under RLS for this purpose.
--
-- FREE-TEXT-ONLY PROJECTION, and the reason is not tidiness: a check row's
-- responses jsonb carries every blank, every plotted point and every graph the
-- student built. Shipping whole rows for a class to render one-line snippets is
-- megabytes for kilobytes of use.
--
-- ⚠ IDENTITY IS SCOPED TO THE ROSTER, and this is a judgment the implementation
-- had to make: `share = DISCOVERY, published = OPEN` (0030 OV-9) means ANY
-- signed-in student can open a published activity by link, so the checks on a
-- teacher's activity can include students who are in none of their classes.
-- 0020's RLS already lets the teacher read those check ROWS (student_id only).
-- Returning an email for a student the teacher has no roster relationship with
-- would be a NEW disclosure, and the compliance pack's whole posture is that
-- the roster IS the relationship that carries consent. So: student_label is the
-- email only when the caller shares a live class with that student; otherwise
-- NULL, with in_your_class=false so the UI can say so plainly.
--
-- Rows are one per (latest check per student+section+version) x (graded
-- free-text block in that section). Blocks with no response still appear —
-- D13's ruling: the student who wrote nothing is the one a teacher most needs
-- to reach, so the queue marks "No answer" rather than hiding the row.
create or replace function list_grading_queue(p_activity_id uuid)
returns table (
  check_id            uuid,
  student_id          uuid,
  student_label       text,
  in_your_class       boolean,
  activity_version_id uuid,
  version_num         integer,
  is_current          boolean,
  section_id          text,
  block_id            uuid,
  block_type          text,
  response_text       text,
  attempt_number      integer,
  checked_at          timestamptz,
  graded              boolean,
  criteria            jsonb,
  general_feedback    text,
  graded_at           timestamptz,
  released_at         timestamptz,
  has_grader          boolean,
  stale               boolean
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Sign in before grading';
  end if;
  if not can_read_activity(p_activity_id) then
    raise log 'grading queue refused (not_owner) user=% activity=%', auth.uid(), p_activity_id;
    raise exception 'Not your activity';
  end if;

  return query
  with latest as (
    -- The queue's unit of "current work": one check per student, per section,
    -- per version (G2). Version scoping is not cosmetic — block and section
    -- ids are minted fresh on every publish, so a cross-version "latest" is
    -- comparing identifiers that were never the same question.
    select distinct on (sc.student_id, sc.activity_version_id, sc.section_id) sc.*
    from section_checks sc
    where sc.activity_id = p_activity_id
    order by sc.student_id, sc.activity_version_id, sc.section_id,
             sc.attempt_number desc, sc.created_at desc
  ),
  blocks as (
    -- Every graded free-text block of each section, from the pinned document.
    select l.id as check_id, l.student_id, l.activity_version_id, l.section_id,
           l.attempt_number, l.created_at, l.responses,
           (b->>'id')::uuid as block_id,
           b->>'type'       as block_type
    from latest l
    join activity_versions av on av.id = l.activity_version_id
    cross join lateral jsonb_array_elements(coalesce(av.content->'sections', '[]'::jsonb)) s
    cross join lateral jsonb_array_elements(coalesce(s->'rows', '[]'::jsonb)) r
    cross join lateral jsonb_array_elements(coalesce(r->'columns', '[]'::jsonb)) c
    cross join lateral jsonb_array_elements(coalesce(c->'blocks', '[]'::jsonb)) b
    where s->>'id' = l.section_id
      and b->>'type' in ('short_answer', 'essay')
  ),
  graded as (
    -- The winning grade per (student, version, section, block): latest by
    -- graded_at, and NOT necessarily attached to the latest check — that gap
    -- is precisely what `stale` reports.
    select distinct on (sc.student_id, sc.activity_version_id, sc.section_id, cg.block_id)
           sc.student_id, sc.activity_version_id, sc.section_id, cg.block_id,
           cg.criteria, cg.general_feedback, cg.graded_at, cg.released_at,
           cg.graded_by,
           sc.responses as graded_responses
    from check_grades cg
    join section_checks sc on sc.id = cg.check_id
    where sc.activity_id = p_activity_id
    -- Same tiebreak as §E's winner, and for the same reason: graded_at is a
    -- transaction timestamp, so it ties whenever two grades were written
    -- together. Later attempt wins; the uuid is only a last-resort determinism
    -- backstop.
    order by sc.student_id, sc.activity_version_id, sc.section_id, cg.block_id,
             cg.graded_at desc, sc.attempt_number desc, cg.id desc
  ),
  roster as (
    -- The caller's live roster: the students whose identity they may see.
    select distinct cm.student_id
    from class_members cm
    join classes cl on cl.id = cm.class_id
    where cl.teacher_id = auth.uid()
      and cl.deleted_at is null
      and cm.removed_at is null
  )
  select bl.check_id,
         bl.student_id,
         case when ro.student_id is not null then u.email else null end,
         (ro.student_id is not null),
         bl.activity_version_id,
         av.version_num,
         (av.id = a.current_version_id),
         bl.section_id,
         bl.block_id,
         bl.block_type,
         bl.responses->'freeText'->>bl.block_id::text,
         bl.attempt_number,
         bl.created_at,
         (g.block_id is not null),
         g.criteria,
         g.general_feedback,
         g.graded_at,
         g.released_at,
         (g.graded_by is not null),
         coalesce(
           g.block_id is not null
           and (g.graded_responses->'freeText'->>bl.block_id::text)
                 is distinct from
               (bl.responses->'freeText'->>bl.block_id::text),
           false
         )
  from blocks bl
  join activity_versions av on av.id = bl.activity_version_id
  join activities a on a.id = p_activity_id
  join users u on u.id = bl.student_id
  left join roster ro on ro.student_id = bl.student_id
  left join graded g
    on g.student_id = bl.student_id
   and g.activity_version_id = bl.activity_version_id
   and g.section_id = bl.section_id
   and g.block_id = bl.block_id
  order by av.version_num desc, bl.section_id, bl.block_id, u.email;
end;
$$;

-- -----------------------------------------------------------------------------
-- G. purge_soft_deleted v3 — the grades blocker retires (G11)
-- -----------------------------------------------------------------------------
-- ⚠ THIS IS THE REASON §H CANNOT JUST DROP THE TABLE. The live purge job's
-- account-eligibility chain contains `exists (select 1 from grades x where
-- x.graded_by = v_uid)` — dropping `grades` under it would break the nightly
-- cron at its next fire, silently, until someone read the job log.
--
-- The blocker is REMOVED rather than re-pointed at check_grades, and that is a
-- deliberate semantic change, not a port. It existed because 0010 declared
-- grades.graded_by ON DELETE RESTRICT: a teacher who had graded could not be
-- deleted. §B declares check_grades.graded_by ON DELETE SET NULL instead
-- (0024's pattern), so a purged teacher's grades SURVIVE, anonymized, and the
-- student keeps their feedback attributed to "a former teacher". Blocking the
-- purge would now contradict the column.
--
-- Everything else is byte-for-byte from 0029's definition (the current live
-- one), including the NOTICE line — verify-0029 §D greps its prefix, and the
-- cron-run verification reads it.
--
-- Section-check deletes need no new code: check_grades cascades from
-- section_checks, so steps 1 and 6 already carry their grades with them. The
-- counts below are for the checks, as before; the cascade is asserted in
-- verify-0034 §E rather than counted here, because get diagnostics reports the
-- targeted table's rows, not its cascade's.
create or replace function purge_soft_deleted()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_checks_activity int;
  v_checks_student  int;
  v_accounts        int := 0;
  v_blocked         int := 0;
  v_uid             uuid;
begin
  -- 1. Section checks belonging to purge-eligible ACTIVITIES.
  --    MUST precede the activity_versions delete: activity_version_id is
  --    ON DELETE RESTRICT and would otherwise abort the entire run (0022).
  delete from section_checks
   where activity_id in (
           select id from activities
            where deleted_at < now() - interval '30 days'
         )
      or activity_version_id in (
           select av.id from activity_versions av
             join activities a on a.id = av.activity_id
            where a.deleted_at < now() - interval '30 days'
         );
  get diagnostics v_checks_activity = row_count;

  -- 2. Submissions linked to deleted assignments (frozen table, empty since
  --    0029; kept as-is — see 0029's "what deliberately survives").
  delete from submissions
    where assignment_id in (
      select id from assignments where deleted_at < now() - interval '30 days'
    );

  -- 3. Assignments themselves
  delete from assignments where deleted_at < now() - interval '30 days';

  -- 4. Activity versions of deleted activities
  delete from activity_versions
    where activity_id in (
      select id from activities where deleted_at < now() - interval '30 days'
    );

  -- 5. Activities themselves
  delete from activities where deleted_at < now() - interval '30 days';

  -- 6. Section checks belonging to explicitly-deleted accounts past their
  --    window. Explicit rather than riding the FK cascade, so destroying
  --    student work is a counted act (2026-08-04 finding).
  delete from section_checks sc
   where sc.student_id in (
     select u.id from users u
      where u.deleted_at < now() - interval '30 days'
   );
  get diagnostics v_checks_student = row_count;

  -- 7. Accounts. TWO independent ways in, then the 0023 precedence applies to
  --    both: eligible only once no work is retained and nothing else
  --    references the row.
  for v_uid in
    select u.id
      from users u
     where (u.deleted_at < now() - interval '30 days')
        or (
             u.role = 'student'
             and not exists (
               select 1
                 from class_members cm
                 join classes c on c.id = cm.class_id
                where cm.student_id = u.id
                  and cm.removed_at is null
                  and c.deleted_at is null
             )
             and coalesce(
                   (select max(greatest(cm.removed_at, c.deleted_at))
                      from class_members cm
                      join classes c on c.id = cm.class_id
                     where cm.student_id = u.id),
                   u.created_at
                 ) < now() - interval '400 days'
           )
     order by u.created_at
  loop
    -- 0034: the `grades` blocker is GONE with the table. check_grades does not
    -- replace it — graded_by is SET NULL, so a grader's purge anonymizes the
    -- grade instead of being blocked by it.
    if exists (select 1 from section_checks   x where x.student_id = v_uid)
    or exists (select 1 from activities       x where x.owner_id   = v_uid)
    or exists (select 1 from activity_versions x where x.created_by = v_uid)
    or exists (select 1 from assignments      x where x.teacher_id = v_uid)
    or exists (select 1 from classes          x where x.teacher_id = v_uid
                                                   or x.age_assertion_by = v_uid)
    or exists (select 1 from allowlist        x where x.added_by   = v_uid)
    or exists (select 1 from student_domain   x where x.added_by   = v_uid)
    then
      v_blocked := v_blocked + 1;
      continue;
    end if;

    -- Mark this actor's audit rows BEFORE the delete (0024): afterwards
    -- SET NULL has fired and actor_id no longer identifies them.
    update audit_log
       set metadata = coalesce(metadata, '{}'::jsonb)
                      || jsonb_build_object('actor_purged', true)
     where actor_id = v_uid;

    delete from auth.users where id = v_uid;
    v_accounts := v_accounts + 1;
  end loop;

  raise notice
    'purge_soft_deleted: section_checks %+% (activity/student), accounts purged %, accounts blocked %',
    v_checks_activity, v_checks_student, v_accounts, v_blocked;
end;
$$;

-- -----------------------------------------------------------------------------
-- H. The Phase-2.6 grading world is retired
-- -----------------------------------------------------------------------------
-- 0029 wiped these rows and deliberately KEPT the table, in its own words, "for
-- the parked teacher-grading slice to re-decide whether grades re-keys or a
-- checks-native table replaces it". §B is that decision, so the placeholder has
-- served its purpose and a dead table with live security policies is exactly
-- the kind of surface that outlives the reason nobody deleted it (OV-DX-2: a
-- leftover path is a resurrection path).
--
-- Scoped deliberately: `submissions` is NOT dropped here. It has its own 0029
-- reasoning and its own TODOS entry, and retiring it means rewriting
-- purge_soft_deleted a third time — a blast radius the grading slice should not
-- carry on its critical path.
--
-- P5 audit performed in this same commit (the citations, not just the objects).
-- The rule applied: RE-RUN assertions get flipped, applied migrations do not
-- get edited — they are history, and 0029's precedent updated verify scripts
-- rather than the migrations they superseded.
--   * scripts/verify-0029.sql §A asserted `count(*) from grades = 0` — FLIPPED
--     to assert the relation is gone, which is the claim that replaced it. Left
--     as-is it would fail on a missing relation instead of a real regression.
--   * Greped clean otherwise: no other verify script, app module, or viewer
--     module cites `grades` or `can_grade_submission`.
--   * 0016's revoke/grant lines for can_grade_submission and 0032's
--     platform-default grant for public.grades are inert once the objects are
--     gone (both are historical statements against objects that no longer
--     exist; a replay runs them before this migration drops them).
--   * docs/design/manual-grading.md's stale "SHIPPED + DEPLOYED" status line is
--     corrected to name this slice as its successor, in this commit.
-- ORDER MATTERS, and the replay caught it: 0010/0011's three policies on
-- `grades` (select/insert/update) all call can_grade_submission, so dropping
-- the FUNCTION first fails with SQLSTATE 2BP01 ("other objects depend on it").
-- The table goes first — dropping it takes its policies with it — and the
-- now-unreferenced helper follows. No CASCADE anywhere: a cascade here would
-- also silently drop anything ELSE that had come to depend on the helper, which
-- is precisely the kind of blast radius a retirement migration should refuse.
drop table if exists grades;
drop function if exists can_grade_submission(uuid);

-- -----------------------------------------------------------------------------
-- I. Grants — 0009's standing rule, applied to the four new doors
-- -----------------------------------------------------------------------------
-- Supabase still default-grants EXECUTE to PUBLIC, so every function gets an
-- explicit stanza. All four are called BY a signed-in user (three by a teacher,
-- one by a student), so: authenticated + service_role, never anon.
revoke execute on function upsert_check_grade(uuid, uuid, jsonb, text) from public, anon;
grant  execute on function upsert_check_grade(uuid, uuid, jsonb, text) to authenticated, service_role;

revoke execute on function release_check_grades(uuid, uuid) from public, anon;
grant  execute on function release_check_grades(uuid, uuid) to authenticated, service_role;

revoke execute on function get_my_released_feedback(uuid) from public, anon;
grant  execute on function get_my_released_feedback(uuid) to authenticated, service_role;

revoke execute on function list_grading_queue(uuid) from public, anon;
grant  execute on function list_grading_queue(uuid) to authenticated, service_role;

-- The table itself gets no client grants at all. 0032 records that Supabase
-- default-grants table privileges to anon/authenticated on tables created
-- through the dashboard; a table created by migration does not inherit that,
-- and check_grades must not — RLS with zero policies is the control, and a
-- stray grant would make that control depend on the policy set being empty
-- rather than on the absence of access.
revoke all on table check_grades from anon, authenticated;

-- =============================================================================
-- Verification lives in scripts/verify-0034.sql (registered in the verify
-- runner). The matrix it proves, per the plan's §5: 10 upsert rows, 4 release
-- rows, 8 readback rows, 2 drop-audit rows, 4 queue rows, and 3 retention rows
-- including the teacher-purge SET NULL leg the old RESTRICT used to block.
-- =============================================================================

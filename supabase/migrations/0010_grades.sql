-- =============================================================================
-- 0010_grades.sql — Manual grading (Phase 2.6)
-- -----------------------------------------------------------------------------
-- One `grades` row per (submission, block) for short_answer / essay blocks. The
-- teacher's per-criterion scores + feedback. Grades are MUTABLE (a teacher can
-- revise) so they live here, not in the immutable submissions jsonb.
--
-- Rubrics themselves are NOT a table — they live IN the pinned activity document
-- on the block (submission -> activity_version pinning is the "rubric edits
-- apply prospectively" mechanism). The grading UI reads the rubric from the
-- version the student answered; `criteria` here stores only {criterionId,
-- earned, feedback?} against that rubric's criterion ids.
--
-- Writes are direct authenticated upserts (no Edge Function), RLS-gated. Only a
-- teacher who can see the underlying submission can read/write its grades. The
-- `earned` values are teacher-entered, so — unlike client-computed auto-scores —
-- they are authoritative even though written client-side (the RLS write gate is
-- the trust boundary; the numbers aren't a leakable answer key).
--
-- Re-grade after a revision falls out for free: a new attempt is a new
-- submission_id, so its grades rows simply don't exist yet (ungraded).
-- =============================================================================

-- audit_action gains a grade value. ADD VALUE is transaction-safe on PG 12+ as
-- long as the new value isn't USED in the same transaction — this migration
-- only references it inside a function body (executed later, at upsert time).
alter type audit_action add value if not exists 'grade.upsert';

create table grades (
  id               uuid primary key default gen_random_uuid(),
  submission_id    uuid not null references submissions(id) on delete cascade,
  block_id         uuid not null,   -- the short_answer/essay block in the pinned doc
  -- [{criterionId uuid, earned numeric, feedback? text}] against the block's
  -- rubric (in the pinned version). Partial allowed — an unscored criterion is
  -- simply absent. Validated client-side against the rubric (advisory, like the
  -- runtime's `correct`); the DB stores whatever the teacher entered.
  criteria         jsonb not null default '[]'::jsonb,
  general_feedback text,
  graded_by        uuid not null references users(id) on delete restrict,
  graded_at        timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  -- One grade per (submission, block): a re-grade UPDATEs this row.
  unique (submission_id, block_id)
);

create index grades_submission_idx on grades (submission_id);
-- FK covering index (the 0009 discipline — unindexed FKs slow cascades + planning).
create index grades_graded_by_idx on grades (graded_by);

alter table grades enable row level security;
alter table grades force row level security;

-- -----------------------------------------------------------------------------
-- Visibility helper — one place that encodes "can this user grade this
-- submission's responses?" so the policies below don't inline the join
-- (CLAUDE.md: don't inline ownership checks in policies; call helpers). Mirrors
-- the two submissions SELECT policies exactly: assignment-scoped via
-- can_access_assignment, else Phase-1 link-share via can_read_activity.
-- -----------------------------------------------------------------------------
create or replace function can_grade_submission(p_submission_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1 from submissions s
    where s.id = p_submission_id
      and (
        (s.assignment_id is not null and can_access_assignment(s.assignment_id))
        or
        (s.assignment_id is null and can_read_activity(s.activity_id))
      )
  );
$$;

-- Read: a teacher who can see the submission sees its grades.
create policy grades_select on grades
  for select using ( can_grade_submission(submission_id) );

-- Insert: same visibility, and the writer must stamp themselves as graded_by
-- (no grading on someone else's behalf).
create policy grades_insert on grades
  for insert with check (
    can_grade_submission(submission_id)
    and graded_by = (select auth.uid())
  );

-- Update: same. Clearing a grade = UPDATE to empty criteria / null feedback;
-- there is deliberately no DELETE policy (grades are historical once made).
create policy grades_update on grades
  for update using ( can_grade_submission(submission_id) )
  with check (
    can_grade_submission(submission_id)
    and graded_by = (select auth.uid())
  );

-- -----------------------------------------------------------------------------
-- updated_at maintenance + audit trail. SECURITY DEFINER so the audit_log
-- insert succeeds (audit_log has no client insert policy — service-role/definer
-- only), matching how ingest_submission / publish_activity write audit rows.
-- -----------------------------------------------------------------------------
create or replace function grades_touch_and_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at := now();
  insert into audit_log (actor_id, action, target_type, target_id, metadata)
  values (
    new.graded_by,
    'grade.upsert',
    'submission',
    new.submission_id,
    jsonb_build_object('block_id', new.block_id)
  );
  return new;
end;
$$;

create trigger grades_touch_and_audit_trg
  before insert or update on grades
  for each row execute function grades_touch_and_audit();

-- -----------------------------------------------------------------------------
-- Verification (run manually after `supabase db push`; expected results noted):
--   select 'grades' = ANY (select tablename from pg_tables where schemaname='public');  -- t
--   select relrowsecurity and relforcerowsecurity from pg_class where relname='grades'; -- t, t
--   select count(*) from pg_policies where tablename='grades';                          -- 3
--   select 'grade.upsert' = ANY (enum_range(null::audit_action)::text[]);               -- t
--   select proname from pg_proc where proname='can_grade_submission';                   -- 1 row
-- -----------------------------------------------------------------------------

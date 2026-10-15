-- =============================================================================
-- 0059_student_progress.sql — a student's progress, readable by the student
-- (docs/design/student-experience-review.md, S1–S3 + S5, eng review D3–D7,
-- ruled 2026-10-14/15)
-- -----------------------------------------------------------------------------
-- The walkthrough finding: a student cannot tell what they have finished. Their
-- checks are all here, in section_checks, but no student surface read them back.
--
--   §A  section_checks.section_total — how many sections the CHECKED VERSION
--       has, written by check-activity on every check (D3, the "smaller
--       arrangement"). Every section belongs to a check group, and pressing a
--       group's Check records a row for EVERY member section, including ones
--       with nothing to answer (viewer/src/store/store.ts checkGroup). So
--       "every section checked" is exactly "done" (S1), and the total is the
--       version's section count — no notion of "gradable" to keep in sync.
--   §B  record_check gains p_section_total, DEFAULT NULL. The default is the
--       deploy-window guard (eng finding 3): this migration is applied before
--       check-activity is redeployed, and in between the live function calls
--       record_check WITHOUT the new argument. A required parameter would fail
--       every check in that window; a defaulted one resolves the old call.
--   §C  my_activity_progress() — the student Home's status read (S2): per
--       activity on the caller's live classes, the current version's total
--       and checked count, whether an OLDER version has checks (and whether
--       that version was finished), and whether released feedback exists.
--   §D  grants (0009's standing rule: every function carries its own stanza)
--
-- NOT PERSONAL DATA. section_total is a count of sections in a published
-- document; the row it rides on is already in the data map. The read returns
-- only the CALLER's own rows (auth.uid()), joined through the same live-class
-- membership list_class_activities uses (0030). can_read_activity is NOT
-- widened (the recorded Activity-Bank landmine).
--
-- Checks made before this migration carry section_total NULL. The read
-- reports a NULL total, and Home shows those as "Started", never "Done" (D3's
-- accepted consequence): a total the server never wrote is not one we guess.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- §A — the total, on the row that was checked
-- -----------------------------------------------------------------------------
alter table section_checks
  add column section_total integer
    check (section_total is null or section_total > 0);

comment on column section_checks.section_total is
  'How many sections the checked version has (0059, written by check-activity). '
  'NULL on rows recorded before 0059. Every section is covered by a check group '
  'and every member section of a pressed group is recorded, so a version is '
  'finished when the distinct checked section_ids reach this number.';

-- -----------------------------------------------------------------------------
-- §B — record_check with the total
-- -----------------------------------------------------------------------------
-- Same body as 0040 except the INSERT column list. The old signature goes first;
-- inside the migration transaction there is no moment where neither exists, and
-- verify-0040 C1 ("exactly one record_check overload") still holds after.
drop function if exists record_check(
  uuid, uuid, uuid, text, jsonb, jsonb, text, integer, integer, boolean
);

create function record_check(
  p_student_id          uuid,
  p_activity_id         uuid,
  p_activity_version_id uuid,
  p_section_id          text,
  p_responses           jsonb,
  p_verdicts            jsonb,
  p_idempotency_key     text default null,
  p_rate_limit          integer default 60,
  p_rate_window_seconds integer default 60,
  p_locked              boolean default false,
  p_section_total       integer default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing        section_checks%rowtype;
  v_check_id        uuid;
  v_attempt_number  integer;
  v_recent          integer;
  v_retries         integer := 0;
  v_locked_hit      boolean;
begin
  -- 0. Idempotent replay (S4-B2). Returns the ORIGINAL verdicts so a retried
  --    request produces a byte-identical response to the one that was lost.
  if p_idempotency_key is not null then
    select * into v_existing
    from section_checks
    where student_id = p_student_id
      and idempotency_key = p_idempotency_key;

    if found then
      return jsonb_build_object(
        'check_id',       v_existing.id,
        'attempt_number', v_existing.attempt_number,
        'verdicts',       v_existing.verdicts,
        'replayed',       true
      );
    end if;
  end if;

  -- 0b. THE LOCK (0040), unchanged: after the replay, before the rate ceiling.
  if p_locked then
    select true into v_locked_hit
    from section_checks
    where student_id = p_student_id
      and activity_version_id = p_activity_version_id
      and section_id = p_section_id
    limit 1;

    if v_locked_hit then
      raise exception 'section_locked'
        using errcode = 'P0001',
              hint = 'this section is already checked and locked';
    end if;
  end if;

  -- 1. Rate ceiling (S4-5), unchanged.
  select count(*) into v_recent
  from section_checks
  where student_id = p_student_id
    and created_at > now() - make_interval(secs => p_rate_window_seconds);

  if v_recent >= p_rate_limit then
    raise exception 'rate_limited'
      using errcode = 'P0001', hint = 'check rate ceiling reached';
  end if;

  -- 2 + 3. Attempt derivation and insert, in the 0005 retry loop (unchanged
  --        apart from section_total in the column list).
  loop
    select coalesce(max(attempt_number), 0) + 1
      into v_attempt_number
      from section_checks
      where student_id = p_student_id
        and activity_version_id = p_activity_version_id
        and section_id = p_section_id;

    begin
      insert into section_checks (
        student_id, activity_id, activity_version_id, section_id,
        attempt_number, responses, verdicts, idempotency_key, section_total
      )
      values (
        p_student_id, p_activity_id, p_activity_version_id, p_section_id,
        v_attempt_number, p_responses, p_verdicts, p_idempotency_key,
        p_section_total
      )
      returning id into v_check_id;

      exit;  -- success
    exception
      when unique_violation then
        if p_idempotency_key is not null then
          select * into v_existing
          from section_checks
          where student_id = p_student_id
            and idempotency_key = p_idempotency_key;

          if found then
            return jsonb_build_object(
              'check_id',       v_existing.id,
              'attempt_number', v_existing.attempt_number,
              'verdicts',       v_existing.verdicts,
              'replayed',       true
            );
          end if;
        end if;

        if p_locked then
          raise exception 'section_locked'
            using errcode = 'P0001',
                  hint = 'this section is already checked and locked';
        end if;

        v_retries := v_retries + 1;
        if v_retries > 3 then
          raise;
        end if;
    end;
  end loop;

  return jsonb_build_object(
    'check_id',       v_check_id,
    'attempt_number', v_attempt_number,
    'verdicts',       p_verdicts,
    'replayed',       false
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- §C — the student's progress read
-- -----------------------------------------------------------------------------
-- One row per activity the caller can see on their Home (the 0030 join: live
-- membership, live class, published, not deleted). A student with no checks on
-- an activity still gets its row (checked = 0), so Home can say "Not started"
-- from data rather than from absence.
--
-- The total for a version is the newest NON-NULL section_total among the
-- caller's rows on it. Every 0059+ row for one version carries the same number
-- (it is a property of the document), so "newest" only matters in that it skips
-- the pre-0059 NULLs.
create or replace function my_activity_progress()
returns table (
  activity_id        uuid,
  current_version_id uuid,
  sections_total     integer,
  sections_checked   integer,
  earlier_checked    boolean,
  earlier_done       boolean,
  feedback_released  boolean
)
language sql
stable
security definer
set search_path = public
as $$
  with acts as (
    select distinct ca.activity_id, a.current_version_id
    from class_activities ca
    join classes c       on c.id = ca.class_id
    join class_members m on m.class_id = ca.class_id
    join activities a    on a.id = ca.activity_id
    where m.student_id = auth.uid()
      and m.removed_at is null
      and c.deleted_at is null
      and a.status = 'published'
      and a.current_version_id is not null
      and a.deleted_at is null
  ),
  per_version as (
    select sc.activity_id,
           sc.activity_version_id,
           count(distinct sc.section_id)::integer as checked,
           (array_agg(sc.section_total order by sc.created_at desc)
              filter (where sc.section_total is not null))[1] as total
    from section_checks sc
    join acts on acts.activity_id = sc.activity_id
    where sc.student_id = auth.uid()
    group by sc.activity_id, sc.activity_version_id
  )
  select acts.activity_id,
         acts.current_version_id,
         cur.total,
         coalesce(cur.checked, 0),
         exists (
           select 1 from per_version pv
           where pv.activity_id = acts.activity_id
             and pv.activity_version_id <> acts.current_version_id
         ),
         exists (
           select 1 from per_version pv
           where pv.activity_id = acts.activity_id
             and pv.activity_version_id <> acts.current_version_id
             and pv.total is not null
             and pv.checked >= pv.total
         ),
         exists (
           select 1
           from check_grades cg
           join section_checks sc on sc.id = cg.check_id
           where sc.student_id = auth.uid()
             and sc.activity_id = acts.activity_id
             and cg.released_at is not null
         )
  from acts
  left join per_version cur
    on cur.activity_id = acts.activity_id
   and cur.activity_version_id = acts.current_version_id;
$$;

-- -----------------------------------------------------------------------------
-- §D — grants
-- -----------------------------------------------------------------------------
-- ⚠ record_check stays SERVICE-ROLE ONLY: it accepts verdicts, so a student able
-- to call it could write themselves a row of 'correct' answers (0020, 0040).
revoke execute on function record_check(uuid, uuid, uuid, text, jsonb, jsonb, text, integer, integer, boolean, integer)
  from public, anon, authenticated;
grant execute on function record_check(uuid, uuid, uuid, text, jsonb, jsonb, text, integer, integer, boolean, integer)
  to service_role;

comment on function record_check(uuid, uuid, uuid, text, jsonb, jsonb, text, integer, integer, boolean, integer) is
  'Records one section check. Service-role only (it accepts verdicts). '
  'p_locked is DERIVED BY THE SERVER from the stored document''s '
  'meta.submissionMode — never sent by the client. p_section_total (0059) is the '
  'checked version''s section count, also derived by the server; it defaults to '
  'NULL so a caller from before 0059 still records. See '
  'docs/design/activity-flow-modes.md and docs/design/student-experience-review.md.';

revoke execute on function my_activity_progress() from public, anon;
grant execute on function my_activity_progress() to authenticated, service_role;

comment on function my_activity_progress() is
  'The student Home''s per-activity status (0059, S2): the caller''s OWN checks '
  'on activities in their live classes. A NULL sections_total means the checks '
  'predate 0059 (show "Started", never "Done").';

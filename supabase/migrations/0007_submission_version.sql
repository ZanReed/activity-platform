-- =============================================================================
-- 0007_submission_version.sql — Pin each submission to the version it answered
-- -----------------------------------------------------------------------------
-- The submissions dashboard drills into a student's answers and shows the
-- activity's answer key next to each response. Until now it could only show the
-- CURRENT published version's key — but a student answered whatever version was
-- live at submission time. After a teacher edits and republishes, the dashboard
-- would pair an old response with a new (possibly unrelated) answer key.
--
-- Fix: record the activity's current_version_id on each submission at ingest
-- time, so the dashboard can index each submission against the exact version it
-- was answered against. The column is nullable:
--   * Legacy rows (inserted before this migration) have no recorded version;
--     the dashboard falls back to the current version for them.
--   * A published activity always has a current_version_id, so new rows get a
--     concrete version. We still allow null at the column level rather than
--     NOT NULL, to keep ingest resilient if that invariant ever loosens.
--
-- on delete set null: activity_versions are never deleted while an activity
-- holds submissions (submissions.activity_id -> activities is ON DELETE
-- RESTRICT), so in practice this never fires; if a version somehow disappears,
-- the submission survives and the dashboard falls back, rather than the row
-- being cascade-deleted.
-- =============================================================================

alter table submissions
  add column activity_version_id uuid references activity_versions(id) on delete set null;

-- Backfill: best-effort attribution of pre-existing rows to their activity's
-- current version. Correct for the common case (no republish happened between
-- submission and this migration); for rows that predate a republish it matches
-- the dashboard's prior behavior anyway (it only ever had the current version).
update submissions s
   set activity_version_id = a.current_version_id
  from activities a
 where s.activity_id = a.id
   and s.activity_version_id is null
   and a.current_version_id is not null;

-- -----------------------------------------------------------------------------
-- ingest_submission — replaces the version in 0005_attempt_number.sql
-- -----------------------------------------------------------------------------
-- Only change from the 0005 version: resolve the activity's current_version_id
-- once and store it on the inserted row. Everything else (attempt_number
-- derivation, retry loop, display_name normalization, audit log) is unchanged.
-- Signature is identical, so create-or-replace is sufficient and the Edge
-- Function needs no change.
-- -----------------------------------------------------------------------------
create or replace function ingest_submission(
  p_activity_id  uuid,
  p_opaque_token text,
  p_display_name text,
  p_responses    jsonb,
  p_score        numeric,
  p_user_agent   text,
  p_ip_hash      text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_assignment_id   uuid;
  v_submission_id   uuid;
  v_attempt_number  integer;
  v_retries         integer := 0;
  v_display_trimmed text;
  v_version_id      uuid;
begin
  -- Activity must exist and be published.
  if not exists (
    select 1 from activities
    where id = p_activity_id
      and status = 'published'
      and deleted_at is null
  ) then
    raise exception 'Activity not found or not published';
  end if;

  -- Identity must be present in some form.
  if p_opaque_token is null
     and (p_display_name is null or length(trim(p_display_name)) = 0) then
    raise exception 'Submission requires either an opaque_token or a non-empty display_name';
  end if;

  -- If a token was provided, resolve it to an assignment.
  if p_opaque_token is not null then
    select assignment_id into v_assignment_id
    from assignment_students
    where opaque_token = p_opaque_token;

    if v_assignment_id is null then
      raise exception 'Invalid token';
    end if;
  end if;

  -- Shape sanity check. The Edge Function's Zod validator is authoritative;
  -- this is the belt-and-suspenders DB-side check. We accept v1 OR v2 shape
  -- here on purpose: the Edge Function enforces v2-only for incoming HTTP
  -- requests, while this layer just enforces structural shape so a future
  -- server-only data path (imports, replays from audit log) doesn't need a
  -- coordinated migration.
  if not (p_responses ? 'schemaVersion' and p_responses ? 'blanks') then
    raise exception 'responses must be { schemaVersion, blanks }';
  end if;

  -- Pin the version the student answered. A published activity always has a
  -- current_version_id; we read it once here so the dashboard can pair each
  -- response with the exact answer key it was graded against.
  select current_version_id into v_version_id
  from activities
  where id = p_activity_id;

  -- Normalize display_name once. nullif keeps the field NULL when no name
  -- was provided (the opaque_token path).
  v_display_trimmed := nullif(trim(coalesce(p_display_name, '')), '');

  -- Compute attempt_number + insert. The unique indexes turn the
  -- SELECT-max → INSERT race into a unique_violation we retry on.
  loop
    if p_opaque_token is not null then
      select coalesce(max(attempt_number), 0) + 1
        into v_attempt_number
        from submissions
        where assignment_id = v_assignment_id
          and opaque_token = p_opaque_token;
    else
      select coalesce(max(attempt_number), 0) + 1
        into v_attempt_number
        from submissions
        where activity_id = p_activity_id
          and assignment_id is null
          and opaque_token is null
          and display_name = v_display_trimmed;
    end if;

    begin
      insert into submissions (
        assignment_id, activity_id, opaque_token, display_name,
        responses, score, user_agent, ip_hash, attempt_number,
        activity_version_id
      )
      values (
        v_assignment_id, p_activity_id, p_opaque_token, v_display_trimmed,
        p_responses, p_score, p_user_agent, p_ip_hash, v_attempt_number,
        v_version_id
      )
      returning id into v_submission_id;

      exit;  -- success
    exception
      when unique_violation then
        v_retries := v_retries + 1;
        if v_retries > 3 then
          raise;  -- give up; very unlikely to reach here
        end if;
        -- loop and recompute with fresh max
    end;
  end loop;

  insert into audit_log (action, target_type, target_id, metadata, ip_hash)
  values (
    'submission.create',
    'submission',
    v_submission_id,
    jsonb_build_object(
      'activity_id',         p_activity_id,
      'activity_version_id', v_version_id,
      'has_token',           p_opaque_token is not null,
      'attempt_number',      v_attempt_number
    ),
    p_ip_hash
  );

  return jsonb_build_object(
    'submission_id',  v_submission_id,
    'attempt_number', v_attempt_number
  );
end;
$$;

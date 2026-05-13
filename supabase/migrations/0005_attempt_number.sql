-- =============================================================================
-- 0005_attempt_number.sql — Per-student attempt tracking for revision cycles
-- -----------------------------------------------------------------------------
-- revisionMode='free' (the default activity-level setting from 9a) lets
-- students resubmit. Each resubmit is a new row in submissions; this migration
-- adds the attempt_number column that distinguishes them, plus partial unique
-- indexes that make max-lookup fast AND prevent the race where two concurrent
-- resubmits both compute the same next number.
--
-- Identity scope for attempt numbering (matches the partial-index WHEREs and
-- the SELECT scopes in the replaced ingest_submission function):
--   * Phase 1 link-share: (activity_id, display_name) with assignment_id IS NULL
--   * Phase 3 assignment: (assignment_id, opaque_token)
--
-- Pre-existing submissions become attempt_number = 1 via the default. Correct:
-- before revision was a thing, every row was a single attempt.
-- =============================================================================

alter table submissions
  add column attempt_number integer not null default 1;

-- Race backstop + reverse-scan source for max(attempt_number). Partial so
-- they only cover rows in each identity mode — link-share rows can never
-- collide with assignment rows since the scopes are disjoint.
create unique index submissions_link_share_attempt_idx
  on submissions (activity_id, display_name, attempt_number)
  where assignment_id is null and opaque_token is null;

create unique index submissions_assignment_attempt_idx
  on submissions (assignment_id, opaque_token, attempt_number)
  where assignment_id is not null and opaque_token is not null;

-- -----------------------------------------------------------------------------
-- ingest_submission — replaces the version in 0003_functions.sql
-- -----------------------------------------------------------------------------
-- Changes from the 0003 version:
--   1. Return type: uuid → jsonb { submission_id, attempt_number }. The Edge
--      Function returns attempt_number to the runtime so it can reconcile its
--      optimistic value with the canonical server value.
--   2. Computes attempt_number server-side via max+1 over the student's
--      identity scope, inside a retry loop. The partial unique indexes above
--      catch the SELECT-then-INSERT race and force a recompute.
--   3. display_name is trimmed BEFORE insert. The 0003 version trimmed only
--      for the identity check; the value stored could keep trailing whitespace
--      and create phantom-identity rows ("Bob " ≠ "Bob") for attempt lookups.
--      Intentional improvement; pre-9b there are no real submissions so no
--      data migration is needed.
-- -----------------------------------------------------------------------------
drop function if exists ingest_submission(uuid, text, text, jsonb, numeric, text, text);
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
        responses, score, user_agent, ip_hash, attempt_number
      )
      values (
        v_assignment_id, p_activity_id, p_opaque_token, v_display_trimmed,
        p_responses, p_score, p_user_agent, p_ip_hash, v_attempt_number
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
      'activity_id',    p_activity_id,
      'has_token',      p_opaque_token is not null,
      'attempt_number', v_attempt_number
    ),
    p_ip_hash
  );

  return jsonb_build_object(
    'submission_id',  v_submission_id,
    'attempt_number', v_attempt_number
  );
end;
$$;

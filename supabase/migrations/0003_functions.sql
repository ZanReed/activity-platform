-- =============================================================================
-- 0003_functions.sql — Triggers, RPC functions, scheduled jobs
-- -----------------------------------------------------------------------------
-- All functions are SECURITY DEFINER (run with the privileges of their owner)
-- so they can do things RLS would normally block — like writing to audit_log,
-- or inserting into submissions on behalf of unauthenticated students. The
-- search_path is locked to `public` to prevent search-path injection
-- (a real attack vector against SECURITY DEFINER functions).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- handle_new_auth_user — trigger on auth.users insert
-- -----------------------------------------------------------------------------
-- Fires when Supabase Auth creates a new user. Checks the allowlist. If the
-- email isn't permitted, raises an exception which causes the auth signup to
-- fail (the auth.users row is rolled back). If permitted, creates the
-- corresponding public.users row and an audit log entry.
create or replace function handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.allowlist where email = new.email) then
    raise exception 'Email % is not on the allowlist', new.email;
  end if;

  insert into public.users (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  );

  insert into public.audit_log (actor_id, action, target_type, target_id)
  values (new.id, 'user.create', 'user', new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_auth_user();

-- -----------------------------------------------------------------------------
-- ingest_submission — RPC called by the submission Edge Function
-- -----------------------------------------------------------------------------
-- The submission Edge Function (supabase/functions/ingest-submission) runs
-- as the service role, validates the responses jsonb shape against the
-- schema package's Zod validator, and then calls this function. This
-- function performs the database-side validation: activity exists and is
-- published; if a token is provided, it matches a real assignment_students
-- row; identity is present (display_name OR opaque_token); responses is the
-- expected shape.
--
-- responses jsonb shape (also enforced by the Edge Function's Zod parse):
--   {
--     "schemaVersion": 1,
--     "blanks": {
--       "<blank_uuid>": { "answer": "...", "correct": true|false }
--     }
--   }
create or replace function ingest_submission(
  p_activity_id  uuid,
  p_opaque_token text,
  p_display_name text,
  p_responses    jsonb,
  p_score        numeric,
  p_user_agent   text,
  p_ip_hash      text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_assignment_id uuid;
  v_submission_id uuid;
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

  -- Shape sanity check on responses. The Edge Function's Zod validator is the
  -- authoritative parser; this is a belt-and-suspenders database-side check
  -- in case someone bypasses the Edge Function.
  if not (p_responses ? 'schemaVersion' and p_responses ? 'blanks') then
    raise exception 'responses must be { schemaVersion, blanks }';
  end if;

  insert into submissions (
    assignment_id, activity_id, opaque_token, display_name,
    responses, score, user_agent, ip_hash
  )
  values (
    v_assignment_id, p_activity_id, p_opaque_token, p_display_name,
    p_responses, p_score, p_user_agent, p_ip_hash
  )
  returning id into v_submission_id;

  insert into audit_log (action, target_type, target_id, metadata, ip_hash)
  values (
    'submission.create',
    'submission',
    v_submission_id,
    jsonb_build_object(
      'activity_id', p_activity_id,
      'has_token', p_opaque_token is not null
    ),
    p_ip_hash
  );

  return v_submission_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- publish_activity — RPC called by the publish Edge Function
-- -----------------------------------------------------------------------------
-- Called by the publish Edge Function after it has validated draft_content
-- against the ActivityDocument Zod schema. Performs the database-side
-- atomicity: insert a new activity_versions row, point the activity at it,
-- mark as published, write audit log. The Edge Function then renders and
-- uploads the static HTML to R2.
--
-- Returns the new version id so the Edge Function can use it in the upload
-- path (e.g., activities/<slug>/v<num>/index.html).
create or replace function publish_activity(p_activity_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_draft_content jsonb;
  v_next_num      integer;
  v_version_id    uuid;
begin
  -- Authorization. SECURITY DEFINER bypasses RLS, so we explicitly check
  -- via the helper. Phase 3+: when collaborator roles arrive, this function
  -- gains nothing; can_edit_activity grows to recognize editor-role
  -- collaborators and that change flows through here automatically.
  if not can_edit_activity(p_activity_id) then
    raise exception 'Not authorized to publish this activity';
  end if;

  -- Load the draft content. Activity existence + non-deleted-ness was
  -- already verified by can_edit_activity above.
  select draft_content
    into v_draft_content
  from activities
  where id = p_activity_id;

  if v_draft_content is null then
    raise exception 'No draft content to publish';
  end if;

  -- Compute the next version number for this activity.
  select coalesce(max(version_num), 0) + 1
    into v_next_num
  from activity_versions
  where activity_id = p_activity_id;

  -- Insert the new version (immutable snapshot of the draft).
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (p_activity_id, v_next_num, v_draft_content, auth.uid())
  returning id into v_version_id;

  -- Point the activity at the new version, mark as published, clear draft.
  -- (Clearing draft_content is a UX choice we agreed on: after publish, the
  -- editor opens to the published version. The "unpublished changes" badge
  -- only appears when the user makes new edits.)
  update activities
  set current_version_id = v_version_id,
      status             = 'published',
      draft_content      = null,
      updated_at         = now()
  where id = p_activity_id;

  insert into audit_log (actor_id, action, target_type, target_id, metadata)
  values (
    auth.uid(),
    'activity.publish',
    'activity',
    p_activity_id,
    jsonb_build_object('version_id', v_version_id, 'version_num', v_next_num)
  );

  return v_version_id;
end;
$$;

-- Allow authenticated users to call publish_activity. The function itself
-- performs the ownership check using auth.uid().
grant execute on function publish_activity(uuid) to authenticated;

-- ingest_submission is called only by the service role. No grant needed.

-- -----------------------------------------------------------------------------
-- activity_aggregate_stats — view (Phase 5 marketplace prep)
-- -----------------------------------------------------------------------------
-- Activity authors see aggregate stats on their own activities. This view
-- returns no PII and no per-row submission data. Phase 5 will use a
-- SECURITY DEFINER function instead so authors can see aggregates across
-- other teachers' assignments of their (purchased) activities; documenting
-- the placeholder here.
create or replace view activity_aggregate_stats as
select
  a.id                            as activity_id,
  a.owner_id,
  count(s.id)                     as submission_count,
  avg(s.score)                    as average_score,
  count(distinct s.assignment_id) as assignment_count
from activities a
left join submissions s on s.activity_id = a.id
where a.deleted_at is null
group by a.id, a.owner_id;

-- -----------------------------------------------------------------------------
-- purge_soft_deleted — daily cron
-- -----------------------------------------------------------------------------
-- Hard-deletes rows soft-deleted more than 30 days ago. Order matters:
-- delete children before parents to satisfy FK constraints with ON DELETE
-- RESTRICT.
create or replace function purge_soft_deleted()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Submissions linked to deleted assignments
  delete from submissions
    where assignment_id in (
      select id from assignments where deleted_at < now() - interval '30 days'
    );

  -- Assignments themselves
  delete from assignments where deleted_at < now() - interval '30 days';

  -- Activity versions of deleted activities (FK is ON DELETE CASCADE, so
  -- deleting activities below will cascade; this delete is for safety in
  -- case of FK changes).
  delete from activity_versions
    where activity_id in (
      select id from activities where deleted_at < now() - interval '30 days'
    );

  -- Activities themselves
  delete from activities where deleted_at < now() - interval '30 days';

  -- Users (cascades to auth.users via the FK from public.users)
  delete from users where deleted_at < now() - interval '30 days';
end;
$$;

-- Schedule via Supabase pg_cron. Run this once after deploying:
--   select cron.schedule('purge-soft-deleted', '0 3 * * *', 'select purge_soft_deleted();');
-- Cron registration is NOT in this migration because pg_cron must be enabled
-- in the Supabase dashboard first; do it after the project is set up.

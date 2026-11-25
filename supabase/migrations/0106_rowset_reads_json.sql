-- =============================================================================
-- 0106_rowset_reads_json.sql — the seven reads whose rows grow with use, as ONE
-- jsonb each (code review 2026-11-26, A5 follow-up; author: "fix all the watch
-- entries now")
-- -----------------------------------------------------------------------------
-- PostgREST stops a row set at max_rows (1,000; supabase/config.toml sets
-- none) with HTTP 200 and no error. 0104 closed that for the grading queue.
-- Its guard (scripts/tests/rowset-rpc-bounds.test.mjs) then listed six more
-- reads as WATCH, and its review found a seventh (list_deleted_activities,
-- bounded only by the 30-day purge, so a catalogue owner retiring files in one
-- re-import could pass 1,000). Nowhere near 1,000 today, but nothing in their
-- definitions stops them growing. The fix is the same for all seven, so it
-- lands now, before any of them is cut:
--
--   list_bank_json  ← the Activity Bank (0056): one row per public Bank activity, so it grows with the shared catalogue, and a cut drops the last course.
--   my_activity_progress_json  ← the student Home's status (0059): one row per (activity, version) assigned in the caller's live classes.
--   list_class_activities_json  ← the student's class list (0087): one row per activity in the caller's live classes.
--   list_class_members_json  ← one class's roster (0014): every member EVER, removed members included; the 50-member join cap counts only live members, and exempt teachers have none.
--   dol_pass_status_json  ← a DoL's passes (0070): one row per student holding the skill who checked the activity; nothing caps that set.
--   list_deleted_activities_json  ← Recently deleted (0086): one row per soft-deleted activity; only the nightly 30-day purge bounds it, which is time, not a cap.
--   list_deleted_classes_json  ← Recently deleted (0086): one row per soft-deleted class; the 5-class cap counts only live classes and nothing purges deleted ones.
--
-- The pattern is 0104's: a SECURITY INVOKER sql wrapper aggregating the inner
-- function's rows, in its own order (WITH ORDINALITY), with `- 'ordinality'`
-- dropping the counter. The inner functions are untouched: every gate, error
-- string and identity rule stays theirs, and the verify scripts that read them
-- as tables (dozens of references across the seven) stay valid. The app calls
-- only the wrappers; the guard forbids naming the inner seven from source, and
-- with these gone it has no WATCH entries left.
--
-- `create or replace function` (not `create function`) is deliberate: the
-- app's edgeFunctions.test.ts pins its RPC constants to that literal form.
--
-- No table, column or personal-data change: the same fields, to the same
-- callers. Two are STUDENT reads (the Home page): pushed before this is
-- applied, the student Home loses its class list.
--
-- ORDER: apply, run verify-0106, THEN push the app change (OV-7).
-- =============================================================================

create or replace function list_bank_json()
 returns jsonb
 language sql
 stable
 security invoker
 set search_path to 'public'
as $function$
  select coalesce(jsonb_agg(to_jsonb(r) - 'ordinality' order by r.ordinality), '[]'::jsonb)
  from list_bank() with ordinality as r;
$function$;

revoke execute on function list_bank_json() from public, anon;
grant  execute on function list_bank_json() to authenticated, service_role;
comment on function list_bank_json() is
  '0106 (review A5 follow-up): list_bank''s rows as ONE jsonb array, in its order. A row set is cut at PostgREST''s max_rows with no error; a scalar is not. Invoker: the gates are list_bank''s.';

create or replace function my_activity_progress_json()
 returns jsonb
 language sql
 stable
 security invoker
 set search_path to 'public'
as $function$
  select coalesce(jsonb_agg(to_jsonb(r) - 'ordinality' order by r.ordinality), '[]'::jsonb)
  from my_activity_progress() with ordinality as r;
$function$;

revoke execute on function my_activity_progress_json() from public, anon;
grant  execute on function my_activity_progress_json() to authenticated, service_role;
comment on function my_activity_progress_json() is
  '0106 (review A5 follow-up): my_activity_progress''s rows as ONE jsonb array, in its order. A row set is cut at PostgREST''s max_rows with no error; a scalar is not. Invoker: the gates are my_activity_progress''s.';

create or replace function list_class_activities_json()
 returns jsonb
 language sql
 stable
 security invoker
 set search_path to 'public'
as $function$
  select coalesce(jsonb_agg(to_jsonb(r) - 'ordinality' order by r.ordinality), '[]'::jsonb)
  from list_class_activities() with ordinality as r;
$function$;

revoke execute on function list_class_activities_json() from public, anon;
grant  execute on function list_class_activities_json() to authenticated, service_role;
comment on function list_class_activities_json() is
  '0106 (review A5 follow-up): list_class_activities''s rows as ONE jsonb array, in its order. A row set is cut at PostgREST''s max_rows with no error; a scalar is not. Invoker: the gates are list_class_activities''s.';

create or replace function list_class_members_json(p_class_id uuid)
 returns jsonb
 language sql
 stable
 security invoker
 set search_path to 'public'
as $function$
  select coalesce(jsonb_agg(to_jsonb(r) - 'ordinality' order by r.ordinality), '[]'::jsonb)
  from list_class_members(p_class_id) with ordinality as r;
$function$;

revoke execute on function list_class_members_json(uuid) from public, anon;
grant  execute on function list_class_members_json(uuid) to authenticated, service_role;
comment on function list_class_members_json(uuid) is
  '0106 (review A5 follow-up): list_class_members''s rows as ONE jsonb array, in its order. A row set is cut at PostgREST''s max_rows with no error; a scalar is not. Invoker: the gates are list_class_members''s.';

create or replace function dol_pass_status_json(p_activity_id uuid)
 returns jsonb
 language sql
 stable
 security invoker
 set search_path to 'public'
as $function$
  select coalesce(jsonb_agg(to_jsonb(r) - 'ordinality' order by r.ordinality), '[]'::jsonb)
  from dol_pass_status(p_activity_id) with ordinality as r;
$function$;

revoke execute on function dol_pass_status_json(uuid) from public, anon;
grant  execute on function dol_pass_status_json(uuid) to authenticated, service_role;
comment on function dol_pass_status_json(uuid) is
  '0106 (review A5 follow-up): dol_pass_status''s rows as ONE jsonb array, in its order. A row set is cut at PostgREST''s max_rows with no error; a scalar is not. Invoker: the gates are dol_pass_status''s.';

create or replace function list_deleted_classes_json()
 returns jsonb
 language sql
 stable
 security invoker
 set search_path to 'public'
as $function$
  select coalesce(jsonb_agg(to_jsonb(r) - 'ordinality' order by r.ordinality), '[]'::jsonb)
  from list_deleted_classes() with ordinality as r;
$function$;

revoke execute on function list_deleted_classes_json() from public, anon;
grant  execute on function list_deleted_classes_json() to authenticated, service_role;
comment on function list_deleted_classes_json() is
  '0106 (review A5 follow-up): list_deleted_classes''s rows as ONE jsonb array, in its order. A row set is cut at PostgREST''s max_rows with no error; a scalar is not. Invoker: the gates are list_deleted_classes''s.';

create or replace function list_deleted_activities_json()
 returns jsonb
 language sql
 stable
 security invoker
 set search_path to 'public'
as $function$
  select coalesce(jsonb_agg(to_jsonb(r) - 'ordinality' order by r.ordinality), '[]'::jsonb)
  from list_deleted_activities() with ordinality as r;
$function$;

revoke execute on function list_deleted_activities_json() from public, anon;
grant  execute on function list_deleted_activities_json() to authenticated, service_role;
comment on function list_deleted_activities_json() is
  '0106 (review A5 follow-up): list_deleted_activities''s rows as ONE jsonb array, in its order. A row set is cut at PostgREST''s max_rows with no error; a scalar is not. Invoker: the gates are list_deleted_activities''s.';

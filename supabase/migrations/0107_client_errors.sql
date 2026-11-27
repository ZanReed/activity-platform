-- =============================================================================
-- 0107_client_errors.sql — the teacher-only error log (review C5 slice 4)
-- -----------------------------------------------------------------------------
-- docs/design/shared-data-loading.md, decisions 8 and 10 (ruled by the author
-- 2026-11-27, as recommended). When a teacher's screen fails to load or
-- crashes, the app records WHAT broke, so the author hears about a broken
-- screen without waiting for a teacher's message.
--
--   §A  client_errors — one row per distinct error per teacher per minute
--   §B  report_client_error — the one writer; TEACHERS ONLY, rate-limited
--   §C  prune_client_errors — 30 days, SCHEDULED nightly on apply (decision 10)
--   §D  grants
--
-- TEACHERS ONLY. A student call is refused (`not_teacher`): student telemetry
-- stays behind its own gate (TODOS, "Field measurement of student-interactive":
-- the census must fail to answer a question AND the compliance pack be
-- amended first). The app only calls this from a teacher session; the check
-- here is what makes that a rule rather than a habit.
--
-- WHAT A ROW HOLDS — nothing a teacher typed, nothing from a page:
--   teacher_id, the route PATTERN (ids replaced here too, in case a caller
--   forgets), the build's commit, an error kind from a closed list, the RPC
--   name when there is one, and the error's message cut to 300 characters.
--   An error message can in principle quote an input, so the message is the
--   one column the data map flags; the 300-character cut and the 30 days are
--   its bound.
--
-- RATE LIMIT: the same error from the same page within a minute bumps
-- `repeats` on the row already there; beyond 20 new rows per teacher per hour
-- the call writes nothing and says so. A broken page in a retry loop therefore
-- costs at most 20 rows an hour, not one per render.
--
-- ARMED FROM DAY ONE (decision 10), unlike the four student-work prunes
-- (CLAUDE.md → Things NOT to do): this table holds no student work, and a log
-- nobody prunes only grows. verify-0107's live-only row pins the one job.
--
-- PERSONAL DATA: adds `client_errors` (a teacher id + what failed for them).
-- docs/compliance/data-map.md and retention-policy.md change in this commit.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A. The table
-- -----------------------------------------------------------------------------

create table client_errors (
  id           bigint generated always as identity primary key,
  -- CASCADE: a teacher's account purge takes their error rows with it — the
  -- rows are about them and nobody else.
  teacher_id   uuid not null references users(id) on delete cascade,
  occurred_at  timestamptz not null default now(),
  last_at      timestamptz not null default now(),
  repeats      integer not null default 1 check (repeats >= 1),
  kind         text not null check (kind in ('load_failed', 'refresh_failed', 'refused', 'render_threw', 'unhandled')),
  route        text not null check (length(route) between 1 and 200),
  build        text not null check (length(build) between 1 and 40),
  -- Which load (useLoad's key name, e.g. classProgress) or RPC failed.
  source       text check (source is null or length(source) between 1 and 80),
  message      text not null check (length(message) <= 300)
);

-- The writer's dedupe and rate reads, and the author's "what broke lately".
create index client_errors_teacher_idx on client_errors (teacher_id, occurred_at);
create index client_errors_recent_idx on client_errors (occurred_at);

alter table client_errors enable row level security;
alter table client_errors force row level security;
-- No client policies: the one writer is DEFINER, and the author reads the
-- table from the SQL editor. Teachers never read it.
revoke all on client_errors from public, anon, authenticated;

comment on table client_errors is
  'What failed on a teacher''s screen (0107, review C5): route pattern, build, error kind, load or RPC name, a 300-character message. Teachers only; no student rows. Kept 30 days (prune_client_errors, scheduled nightly).';

-- -----------------------------------------------------------------------------
-- B. The writer
-- -----------------------------------------------------------------------------

create or replace function report_client_error(
  p_kind    text,
  p_route   text,
  p_build   text,
  p_source     text,
  p_message text
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_uid     uuid := auth.uid();
  v_route   text;
  v_build   text;
  v_source     text;
  v_message text;
  v_id      bigint;
begin
  if v_uid is null or not current_user_is_teacher() then
    raise exception 'not_teacher' using errcode = '42501';
  end if;
  if p_kind is null or p_kind not in ('load_failed', 'refresh_failed', 'refused', 'render_threw', 'unhandled') then
    raise exception 'bad_kind' using errcode = '22023';
  end if;

  -- The pattern, never the instance: drop any query or hash, replace uuids
  -- and long digit runs with :id, then cut.
  v_route := split_part(split_part(coalesce(nullif(p_route, ''), '/'), '?', 1), '#', 1);
  v_route := regexp_replace(v_route, '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}', ':id', 'g');
  v_route := regexp_replace(v_route, '[0-9]{4,}', ':id', 'g');
  v_route := left(v_route, 200);
  v_build := left(coalesce(nullif(p_build, ''), 'unknown'), 40);
  v_source := nullif(left(coalesce(p_source, ''), 80), '');
  v_message := left(coalesce(p_message, ''), 300);

  -- One writer at a time per teacher, so the dedupe and the hourly count
  -- below cannot both pass for two calls racing.
  perform pg_advisory_xact_lock(hashtext('client_errors:' || v_uid::text));

  update client_errors e
     set repeats = e.repeats + 1, last_at = now()
   where e.id = (
     select e2.id from client_errors e2
      where e2.teacher_id = v_uid and e2.kind = p_kind and e2.route = v_route
        and e2.source is not distinct from v_source and e2.message = v_message
        and e2.last_at > now() - interval '1 minute'
      order by e2.last_at desc
      limit 1)
  returning e.id into v_id;
  if v_id is not null then
    return jsonb_build_object('logged', true, 'repeat', true);
  end if;

  if (select count(*) from client_errors e
       where e.teacher_id = v_uid and e.occurred_at > now() - interval '1 hour') >= 20 then
    return jsonb_build_object('logged', false, 'reason', 'rate_limited');
  end if;

  insert into client_errors (teacher_id, kind, route, build, source, message)
  values (v_uid, p_kind, v_route, v_build, v_source, v_message);
  return jsonb_build_object('logged', true, 'repeat', false);
end;
$$;

comment on function report_client_error(text, text, text, text, text) is
  'Records one failure on a teacher''s screen (0107, review C5). Teachers only (42501 not_teacher otherwise). Route ids are stripped here; the same error within a minute bumps repeats; more than 20 new rows an hour writes nothing.';

-- -----------------------------------------------------------------------------
-- C. The prune: 30 days, armed (decision 10)
-- -----------------------------------------------------------------------------

create or replace function prune_client_errors(p_dry_run boolean default true)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_rows integer;
begin
  select count(*) into v_rows from client_errors e where e.occurred_at < now() - interval '30 days';
  if not p_dry_run then
    delete from client_errors e where e.occurred_at < now() - interval '30 days';
  end if;
  return jsonb_build_object('dry_run', p_dry_run, 'errors', v_rows);
end;
$$;

comment on function prune_client_errors(boolean) is
  'Deletes teacher error-log rows 30 days after they were first seen (0107, review C5). Removes no student work. Scheduled nightly at 03:55 UTC (author''s yes, 2026-11-27, decision 10).';

-- SCHEDULED on apply, where pg_cron exists (live). The local stack has no
-- pg_cron, so this is a no-op there; verify-0107's live-only row pins the job.
-- 03:55 UTC: after the 03:45 help-request and 03:50 handoff prunes; 16:55 /
-- 15:55 in NZ and the US evening before, outside school hours in both.
do $cron$
begin
  if exists (select 1 from pg_namespace where nspname = 'cron') then
    perform cron.unschedule(j.jobid) from cron.job j where j.jobname = 'prune-client-errors';
    perform cron.schedule('prune-client-errors', '55 3 * * *', 'select prune_client_errors(false);');
  end if;
end;
$cron$;

-- -----------------------------------------------------------------------------
-- D. grants (0009's standing rule: every function carries its own stanza)
-- -----------------------------------------------------------------------------
revoke execute on function report_client_error(text, text, text, text, text) from public, anon;
grant  execute on function report_client_error(text, text, text, text, text) to authenticated, service_role;

revoke execute on function prune_client_errors(boolean) from public, anon, authenticated;
grant  execute on function prune_client_errors(boolean) to service_role;

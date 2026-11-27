-- verify-cron-jobs.sql — the nightly jobs that exist only by README prose
-- (code review 2026-11-26, E3). Run with
-- `pnpm verify:auth --target live --only verify-cron-jobs`.
-- Catalog reads only; nothing is written, scheduled or unscheduled.
--
-- `purge-soft-deleted` (0003) and `analytics-maintenance` (0026) were created
-- by hand from commented SQL and no verify row named them, so a rebuilt or
-- branched project would silently run no retention job at all and every
-- verify script would stay green. These rows pin each job's name, hour,
-- command and active flag as read live on 2026-11-26, the way verify-0090, verify-0095 and
-- verify-0107 pin theirs. A deliberate change to either job edits THIS file in
-- the same step (the README's "After the migrations are applied" is the
-- recipe).
--
-- The roster row is the P4 half: it fails when cron holds a job this repo has
-- never named, which is how an armed prune (one of the four functions that
-- delete student work and must stay unscheduled) would otherwise first show
-- up. A job scheduled with no name (pg_cron's two-argument form) counts as
-- unknown too. The two photo-sweep jobs are named here because verify-0093 already
-- rules on their exact shape.
--
-- Every cron row is @live-only: the local stack has no pg_cron.

-- @section A-jobs
-- @expect-rows
select 'job_functions_exist',
       to_regprocedure('public.purge_soft_deleted()') is not null
       and to_regprocedure('public.run_analytics_maintenance()') is not null,
       'purge_soft_deleted() and run_analytics_maintenance() exist for the two jobs to call';
select 'job_functions_not_client_callable',
       not has_function_privilege('anon', 'public.purge_soft_deleted()', 'execute')
       and not has_function_privilege('authenticated', 'public.purge_soft_deleted()', 'execute')
       and not has_function_privilege('anon', 'public.run_analytics_maintenance()', 'execute')
       and not has_function_privilege('authenticated', 'public.run_analytics_maintenance()', 'execute'),
       'neither nightly function can be called by a client';
-- @live-only (cron.job is pg_cron's; the local stack has no pg_cron)
select 'purge_is_scheduled_nightly',
       (select count(*) from cron.job where command ilike '%purge_soft_deleted%') = 1
       and exists (select 1 from cron.job
                    where jobname = 'purge-soft-deleted' and schedule = '0 3 * * *'
                      and command = 'select purge_soft_deleted();' and active),
       'one nightly job runs purge_soft_deleted() at 03:00 UTC';
-- @live-only (cron.job is pg_cron's; the local stack has no pg_cron)
select 'analytics_is_scheduled_nightly',
       (select count(*) from cron.job where command ilike '%run_analytics_maintenance%') = 1
       and exists (select 1 from cron.job
                    where jobname = 'analytics-maintenance' and schedule = '30 3 * * *'
                      and command = 'select run_analytics_maintenance();' and active),
       'one nightly job runs run_analytics_maintenance() at 03:30 UTC';
-- @live-only (cron.job is pg_cron's; the local stack has no pg_cron)
select 'cron_roster_is_known',
       not exists (select 1 from cron.job
                    where jobname is null or jobname not in ('purge-soft-deleted', 'analytics-maintenance',
                                          'prune-help-requests', 'prune-photo-handoffs', 'prune-client-errors',
                                          'sweep-work-photo-rows', 'sweep-work-photos')),
       coalesce('unknown job(s): ' || (select string_agg(coalesce(jobname, '<unnamed #' || jobid || '>'), ', ' order by jobid) from cron.job
                where jobname is null or jobname not in ('purge-soft-deleted', 'analytics-maintenance',
                                      'prune-help-requests', 'prune-photo-handoffs', 'prune-client-errors',
                                      'sweep-work-photo-rows', 'sweep-work-photos')),
                'every cron job is one this repo names');

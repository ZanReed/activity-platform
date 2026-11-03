-- =============================================================================
-- 0080_prune_video_pause_tries.sql — the 30-day window on a clip's first tries
-- (D64, author ruling 2026-11-03)
-- -----------------------------------------------------------------------------
-- A row goes 30 days after the student's first answer. Dry-run by default and
-- UNSCHEDULED: this deletes student work, so arming it is the author's call
-- (TODOS, the VP-8 checklist). verify-0080 fails if a cron job names it.
-- No new personal data. One audit row per activity, counts only.
-- =============================================================================

alter type audit_action add value if not exists 'video_pause_tries.prune';

create function prune_video_pause_tries(p_dry_run boolean default true)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_tries    integer;
  v_activity record;
begin
  select count(*) into v_tries from video_pause_tries t
   where t.saved_at < now() - interval '30 days';

  if not p_dry_run and v_tries > 0 then
    for v_activity in
      select v.activity_id, count(*) as n
        from video_pause_tries t
        join activity_versions v on v.id = t.activity_version_id
       where t.saved_at < now() - interval '30 days'
       group by v.activity_id
    loop
      insert into audit_log (actor_id, action, target_type, target_id, metadata)
      values (null, 'video_pause_tries.prune', 'activity', v_activity.activity_id,
              jsonb_build_object('tries', v_activity.n));
    end loop;
    delete from video_pause_tries t where t.saved_at < now() - interval '30 days';
  end if;

  return jsonb_build_object('dry_run', p_dry_run, 'tries', v_tries);
end;
$$;

revoke execute on function prune_video_pause_tries(boolean) from public, anon, authenticated;
grant execute on function prune_video_pause_tries(boolean) to service_role;

comment on function prune_video_pause_tries(boolean) is
  'Removes a clip''s first tries 30 days after the first answer (0080). Dry-run by default and unscheduled: arming is the author''s call (TODOS, VP-8).';

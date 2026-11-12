-- =============================================================================
-- 0086_restore_class_and_recently_deleted.sql — a deleted class can be put
-- back, and a teacher can see what they deleted (UI review G-5 / G-6,
-- docs/design/ui-review-group-a.md)
-- -----------------------------------------------------------------------------
-- Classes have been SOFT-deleted since 0014 (soft_delete_class stamps
-- deleted_at), but nothing could undo it: the classes SELECT and UPDATE
-- policies both require deleted_at is null, so the client cannot see or touch
-- a deleted row — the same reason 0012 made restore_activity a DEFINER RPC.
-- Activities could be restored (0012) but only from a 7-second toast: the
-- list query hides soft-deleted rows, so after the toast nothing reached them.
--
--   §A restore_class(id)            — mirrors restore_activity: inline owner +
--                                      tombstone check, audited.
--   §B list_deleted_classes()       — the caller's own deleted classes.
--   §C list_deleted_activities()    — the caller's own deleted activities,
--                                      with the day purge_soft_deleted (0003,
--                                      30 days) removes them for good.
--
-- No purge exists for classes (TODOS "A class purge does not exist"), so a
-- deleted class stays restorable until one is ruled. Its join code stays
-- reserved the whole time (classes.join_code is unique, not partial), so a
-- restore can never collide. Restoring brings the class back as it was:
-- roster, activities and the same code. ⚠ ONE EXCEPTION, once armed: the
-- disarmed prunes prune_fact_practice (0048/0050) and prune_mixed_practice
-- (0066) remove a class's practice data 30 days after it was deleted, so a
-- class restored after that comes back without its number-facts checks and
-- mixed-practice sessions. Both arming checklists in TODOS carry this.
--
-- No personal-data column or student-derived table is added: class names and
-- activity titles are teacher content (data-map unchanged).
-- =============================================================================

alter type audit_action add value if not exists 'class.restore';

-- §A ---------------------------------------------------------------------------
create or replace function restore_class(p_class_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- is_class_teacher is unusable here (it requires deleted_at is null), so
  -- the ownership + tombstone test is inline, as in restore_activity. A
  -- non-owner, a missing row, or a live (already-restored) class all raise.
  -- current_user_is_teacher(): a teacher demoted since lost delete through
  -- is_class_teacher (0027 §D); they must not be able to restore either.
  if not exists (
    select 1 from classes
    where id = p_class_id
      and teacher_id = auth.uid()
      and deleted_at is not null
  ) or not current_user_is_teacher() then
    raise exception 'Class is not restorable';
  end if;

  update classes set deleted_at = null, updated_at = now() where id = p_class_id;

  insert into audit_log (actor_id, action, target_type, target_id)
  values (auth.uid(), 'class.restore', 'class', p_class_id);
end;
$$;

revoke execute on function restore_class(uuid) from public, anon;
grant execute on function restore_class(uuid) to authenticated, service_role;

-- §B ---------------------------------------------------------------------------
create or replace function list_deleted_classes()
returns table (id uuid, name text, deleted_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select c.id, c.name, c.deleted_at
  from classes c
  where c.teacher_id = auth.uid() and c.deleted_at is not null
    and current_user_is_teacher()
  order by c.deleted_at desc;
$$;

revoke execute on function list_deleted_classes() from public, anon;
grant execute on function list_deleted_classes() to authenticated, service_role;

-- §C ---------------------------------------------------------------------------
create or replace function list_deleted_activities()
returns table (id uuid, title text, deleted_at timestamptz, purge_after timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select a.id, a.title, a.deleted_at, a.deleted_at + interval '30 days'
  from activities a
  where a.owner_id = auth.uid() and a.deleted_at is not null
  order by a.deleted_at desc;
$$;

revoke execute on function list_deleted_activities() from public, anon;
grant execute on function list_deleted_activities() to authenticated, service_role;

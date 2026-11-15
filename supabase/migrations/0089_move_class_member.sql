-- =============================================================================
-- 0089_move_class_member.sql — move a student to another of the teacher's
-- classes (docs/design/schema-shortlist.md S5, author ruling 2026-11-15)
-- -----------------------------------------------------------------------------
-- Until now a move was two steps the teacher could not do alone: remove the
-- student, then ask them to rejoin with the other class's code. This is one
-- audited step, by the teacher, between two classes they BOTH own.
--
-- What it touches: class_members only. A student's checks carry no class
-- (section_checks is keyed by student, activity version and section), so
-- their work goes with them unchanged. What stays behind is class-scoped
-- history: the old class's practice sessions and daily facts results remain
-- that class's records, as after any removal.
--
-- It keeps join_class's two admission rules, because a move is a way in:
--   - the target class's expected_domain (a class limited to a district's
--     accounts stays limited);
--   - the attested-teacher member cap (0033 §G), counted on the target class,
--     only when the student is not already a member there.
-- A cross-teacher move stays remove + rejoin with the other teacher's code
-- (S5-b): one teacher cannot place a student in another teacher's class.
--
-- No personal-data column or table. Audited as `class.update` with
-- op = 'move_member' (0088's pattern: no new audit_action enum label), its
-- metadata naming the student and both classes (all the caller's).
-- =============================================================================

create or replace function move_class_member(
  p_student_id uuid,
  p_from_class uuid,
  p_to_class uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_from     classes%rowtype;
  v_to       classes%rowtype;
  v_student  users%rowtype;
  v_member   class_members%rowtype;
  v_target   class_members%rowtype;
  v_exempt   boolean;
  v_members  integer;
begin
  if p_from_class = p_to_class then
    raise exception 'Pick a different class';
  end if;

  select * into v_from from classes
  where id = p_from_class and teacher_id = auth.uid() and deleted_at is null;
  select * into v_to from classes
  where id = p_to_class and teacher_id = auth.uid() and deleted_at is null;
  if v_from.id is null or v_to.id is null then
    raise exception 'Not your class';
  end if;

  select * into v_member from class_members
  where class_id = p_from_class and student_id = p_student_id and removed_at is null
  for update;
  if v_member.id is null then
    raise exception 'That student is not in this class';
  end if;

  select * into v_student from users where id = p_student_id;
  if v_to.expected_domain is not null
     and lower(split_part(v_student.email, '@', 2)) <> v_to.expected_domain then
    raise exception 'That class is limited to % accounts', v_to.expected_domain;
  end if;

  select * into v_target from class_members
  where class_id = p_to_class and student_id = p_student_id
  for update;

  if v_target.id is null or v_target.removed_at is not null then
    -- 0033 §G: a NEW place in the target class is held to the member cap.
    -- (A reactivated row counts as new: it was not counted while removed.)
    select coalesce(teacher_caps_exempt, false) into v_exempt
    from users where id = auth.uid();
    if not v_exempt then
      select count(*) into v_members from class_members
      where class_id = p_to_class and removed_at is null;
      if v_members >= 50 then
        raise exception 'That class is full';
      end if;
    end if;
  end if;

  update class_members set removed_at = now() where id = v_member.id;

  if v_target.id is null then
    insert into class_members (class_id, student_id)
    values (p_to_class, p_student_id);
  elsif v_target.removed_at is not null then
    update class_members set removed_at = null, joined_at = now()
    where id = v_target.id;
  end if;
  -- (Already an active member of the target: the move only removes them from
  -- the source, which is what the teacher asked for.)

  insert into audit_log (actor_id, action, target_type, target_id, metadata)
  values (auth.uid(), 'class.update', 'class', p_to_class,
          jsonb_build_object('op', 'move_member',
                             'student_id', p_student_id,
                             'from_class', p_from_class,
                             'to_class', p_to_class));

  return jsonb_build_object('from_class', p_from_class, 'to_class', p_to_class);
end;
$$;

revoke execute on function move_class_member(uuid, uuid, uuid) from public, anon;
grant execute on function move_class_member(uuid, uuid, uuid) to authenticated, service_role;

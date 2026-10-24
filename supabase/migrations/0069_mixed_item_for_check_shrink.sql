-- =============================================================================
-- 0069 — shrink mixed_item_for_check's non-replay return (Fable P3, slice 2)
-- -----------------------------------------------------------------------------
-- TODOS → D68 sub-item: mixed_item_for_check (0066 G2) returned owner_id,
-- item_id, fingerprint and row_index to any signed-in caller over PostgREST.
-- None is answer-bearing (practice_item is owner-only; the row's values were
-- never returned), and the only caller — check-activity's practice handler —
-- reads `replay` and `student_id` and nothing else
-- (packages/viewer/src/server/practice-handler.ts, the practice check path).
-- So the return shrinks to exactly what is read.
--
-- Its own migration, applied in the same sitting as 0070 (D65), on purpose
-- (eng review DE-19): a regression here must not roll back the DoL arc, nor
-- the other way round. The trigger for this shrink fired at 0068 and was
-- missed; this is the "next mixed-practice migration" TODOS named.
--
-- Body identical to 0066 apart from the final return. Re-run verify-0066 after.
-- =============================================================================

create or replace function mixed_item_for_check(p_session_id uuid, p_seq integer)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_s  mixed_sessions%rowtype;
  v_i  mixed_session_items%rowtype;
  v_a  mixed_attempts%rowtype;
begin
  select * into v_s from mixed_sessions where id = p_session_id;
  select * into v_i from mixed_session_items where session_id = p_session_id and seq = p_seq;
  if auth.uid() is null or v_s.id is null or v_i.session_id is null
     or v_s.student_id <> auth.uid()
     or not exists (select 1 from classes c where c.id = v_s.class_id and c.deleted_at is null)
     or not exists (select 1 from class_members m
                     where m.class_id = v_s.class_id and m.student_id = auth.uid()
                       and m.removed_at is null) then
    raise exception 'Not available' using errcode = '42501';
  end if;

  select * into v_a from mixed_attempts where session_id = p_session_id and seq = p_seq;
  if v_a.session_id is not null then
    return jsonb_build_object('replay', true, 'student_id', v_s.student_id,
                              'correct', v_a.correct, 'skipped', v_a.skipped,
                              'verdicts', v_a.verdicts);
  end if;
  if v_s.finished_at is not null or now() > v_s.started_at + interval '1 day' then
    raise exception 'Not available' using errcode = '42501';
  end if;
  -- 0069: only what the handler reads. The snapshot it grades is read by the
  -- service role, keyed by the session and seq it already holds.
  return jsonb_build_object('replay', false, 'student_id', v_s.student_id);
end;
$$;

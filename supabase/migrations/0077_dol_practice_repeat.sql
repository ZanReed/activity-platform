-- =============================================================================
-- 0077_dol_practice_repeat.sql — repeat the one matching template, first and last
-- -----------------------------------------------------------------------------
-- docs/design/dol-targeted-practice.md TP-3 as amended (their C-167 wish, its
-- trigger fired at C-173: 801/03's mis.proportional.one-pair-assumed-constant
-- is bound only by t7, 24 rows). When exactly one template the student may be
-- served binds a misconception their first try showed, and it has at least two
-- rows, targeted practice serves it first and again last, with a different row.
-- The dose stays dol_practice_items, so the repeat replaces one other template.
--
--   §A  dol_practice_repeat_row(): the repeat's row, never the first slot's.
--   §B  start_dol_practice v3: 0073's body with the repeat in the plan.
--
-- Slots are keyed by (session, seq), so a repeated item_id needs no table
-- change. Sessions already started keep their snapshot. No personal data; no
-- table, column or grant change beyond §A's service-role helper.
-- =============================================================================

-- §A ---------------------------------------------------------------------------
-- An offset of 1..rows-1 from the first slot's row, so it can't land on it.
create or replace function dol_practice_repeat_row(p_session_id uuid, p_item_id text, p_rows integer)
returns integer
language sql
immutable
set search_path = public
as $$
  select ((mixed_row_index(p_session_id, p_item_id, p_rows) + 1
           + mixed_row_index(p_session_id, p_item_id || ':repeat', p_rows - 1))
          % greatest(p_rows, 1))::integer;
$$;
revoke execute on function dol_practice_repeat_row(uuid, text, integer) from public, anon, authenticated;
grant  execute on function dol_practice_repeat_row(uuid, text, integer) to service_role;

-- §B ---------------------------------------------------------------------------
create or replace function start_dol_practice(p_activity_id uuid, p_version_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_uid      uuid := auth.uid();
  v_content  jsonb;
  v_dol      jsonb;
  v_src      activities%rowtype;
  v_attempts integer;
  v_latest   section_checks%rowtype;
  v_mis      text[];
  v_id       uuid;
  v_n        integer;
  v_plan     jsonb;
  v_cap      integer := dol_practice_cap();
begin
  if v_uid is null then
    raise exception 'Not available' using errcode = '42501';
  end if;
  select v.content into v_content
  from activities a join activity_versions v on v.activity_id = a.id
  where a.id = p_activity_id and v.id = p_version_id
    and a.deleted_at is null and a.status = 'published';
  select s into v_dol
  from jsonb_array_elements(coalesce(v_content->'sections', '[]'::jsonb)) s
  where jsonb_typeof(s->'dol') = 'object'
  limit 1;
  if v_content is null or v_dol is null or coalesce((v_dol->'dol'->>'retake')::boolean, false) is not true then
    raise exception 'Not available' using errcode = '42501';
  end if;

  -- The skill and the bank owner come from the SOURCE activity (a Bank copy
  -- resolves through what it was copied from, DE-11).
  select src.* into v_src
  from activities a join activities src on src.id = coalesce(a.copied_from_activity_id, a.id)
  where a.id = p_activity_id;
  if v_src.primary_skill is null then
    raise exception 'Not available' using errcode = '42501';
  end if;

  select count(*) into v_attempts from section_checks
   where student_id = v_uid and activity_version_id = p_version_id and section_id = v_dol->>'id';
  if v_attempts <> 1 or exists (
       select 1 from dol_pass dp where dp.student_id = v_uid and dp.skill_id = v_src.primary_skill) then
    raise exception 'Not available' using errcode = '42501';
  end if;

  select id into v_id from dol_practice_sessions where student_id = v_uid and version_id = p_version_id;
  if v_id is not null then
    return jsonb_build_object('state', 'resume', 'session', dol_practice_session_payload(v_id));
  end if;

  -- What the first try showed (0061 reads the same verdict field).
  select * into v_latest from section_checks
   where student_id = v_uid and activity_version_id = p_version_id and section_id = v_dol->>'id'
   order by attempt_number desc limit 1;
  select coalesce(array_agg(distinct m), '{}') into v_mis
  from jsonb_each(coalesce(v_latest.verdicts, '{}'::jsonb)) e(k, v)
  cross join lateral jsonb_array_elements_text(coalesce(e.v->'misconceptionIds', '[]'::jsonb)) m;

  -- TP-3: v_cap ratified templates, the ones binding a shown misconception
  -- first. When exactly ONE template binds one and it has two or more rows, it
  -- also takes the last slot (§A), and the plan's length stays the same.
  with ranked as (
    select p.owner_id, p.item_id, h.hits,
           jsonb_array_length(p.value_table->'rows') as n_rows,
           row_number() over (order by h.hits desc, p.position, p.item_id) as rn
    from practice_item p
    cross join lateral (
      select count(*) as hits
      from jsonb_path_query(p.document, 'strict $.**.misconceptionId') x
      where x #>> '{}' = any (v_mis)) h
    where p.owner_id = v_src.owner_id and p.role = 'skill' and p.skill_id = v_src.primary_skill
      and p.status = 'ratified' and p.retired_at is null
      and mixed_tier_ok(p.tier, v_uid, p.skill_id)
  ), repeated as (
    select r.owner_id, r.item_id from ranked r
    where r.hits > 0 and r.n_rows >= 2 and v_cap >= 2
      and (select count(*) from ranked where hits > 0) = 1
  ), kept as (
    select owner_id, item_id, rn as seq, false as again from ranked
    where rn <= v_cap - (select count(*) from repeated)
  ), plan as (
    select owner_id, item_id, seq, again from kept
    union all
    select owner_id, item_id, (select count(*) from kept) + 1, true from repeated
  )
  select coalesce(jsonb_agg(jsonb_build_object('seq', seq, 'owner_id', owner_id, 'item_id', item_id, 'again', again)
                            order by seq), '[]'::jsonb)
    into v_plan
  from plan;
  v_n := jsonb_array_length(v_plan);
  if v_n = 0 then
    return jsonb_build_object('state', 'nothing_to_practise');
  end if;

  begin
    insert into dol_practice_sessions (student_id, activity_id, version_id, skill_id, planned)
    values (v_uid, p_activity_id, p_version_id, v_src.primary_skill, v_n)
    returning id into v_id;
  exception when unique_violation then
    -- Two tabs started at once; the other one won. Hand back its session.
    select id into v_id from dol_practice_sessions where student_id = v_uid and version_id = p_version_id;
    return jsonb_build_object('state', 'resume', 'session', dol_practice_session_payload(v_id));
  end;

  -- ER-4 / TP-4: snapshot each item with its drawn row (mixed practice's hash).
  insert into dol_practice_items (session_id, seq, student_id, owner_id, item_id, fingerprint,
                                  row_index, document, row_values)
  select v_id, t.seq, v_uid, p.owner_id, p.item_id, p.fingerprint, r.idx, p.document,
         coalesce((select jsonb_object_agg(c.name, (p.value_table->'rows'->r.idx)->((c.i - 1)::int))
                     from jsonb_array_elements_text(p.value_table->'columns') with ordinality c(name, i)),
                  '{}'::jsonb)
  from jsonb_to_recordset(v_plan) as t(seq integer, owner_id uuid, item_id text, again boolean)
  join practice_item p on p.owner_id = t.owner_id and p.item_id = t.item_id
  cross join lateral (select case when t.again
                                  then dol_practice_repeat_row(v_id, p.item_id, jsonb_array_length(p.value_table->'rows'))
                                  else mixed_row_index(v_id, p.item_id, jsonb_array_length(p.value_table->'rows'))
                             end as idx) r;

  return jsonb_build_object('state', 'started', 'session', dol_practice_session_payload(v_id));
end;
$$;

-- =============================================================================
-- 0073_dol_practice_items.sql — the graph's dol_practice_items (C-167/C-168)
-- -----------------------------------------------------------------------------
-- docs/design/dol-targeted-practice.md TP-9. Targeted practice's dose (4 in
-- 0072, a constant) becomes the curriculum graph's `dol_practice_items`
-- (activity_defaults, D25), mirrored with the seven mixed_* keys from
-- practice-registry.json (curriculum PR #81, revision 481cd3bf…).
--
--   §A  mixed_settings_ok v2: the seven keys, plus OPTIONALLY an eighth,
--       dol_practice_items, a whole number 2–8 (their check 4 L). Revisions
--       mirrored before 0073 (seven keys) stay valid.
--   §B  dol_practice_cap(): the latest mirrored revision's dol_practice_items,
--       4 when it names none (sync_mixed_settings's "latest" ordering).
--   §C  start_dol_practice v2: 0072's body with the cap read from §B.
--
-- No personal data; no table, column or grant change. Apply BEFORE the first
-- import of a practice registry that carries the eighth key (the old
-- function refuses an eight-key mirror, loudly).
-- =============================================================================

-- §A ---------------------------------------------------------------------------
create or replace function mixed_settings_ok(s jsonb)
returns boolean
language sql
immutable
set search_path = public
as $fn$
  select s is not null
    and jsonb_typeof(s) = 'object'
    and (select count(*) from jsonb_object_keys(s)) = case when s ? 'dol_practice_items' then 8 else 7 end
    and (not s ? 'dol_practice_items'
         or (jsonb_typeof(s->'dol_practice_items') = 'number'
             and (s->>'dol_practice_items')::numeric = trunc((s->>'dol_practice_items')::numeric)
             and (s->>'dol_practice_items')::numeric between 2 and 8))
    and s ?& array['mixed_step_intervals', 'mixed_wrong_drop', 'mixed_items_per_session',
                   'mixed_max_discrimination', 'mixed_new_skills_per_session',
                   'mixed_struggling_window', 'mixed_struggling_min_right']
    and (select bool_and(jsonb_typeof(s->k) = 'number'
                         and (s->>k)::numeric = trunc((s->>k)::numeric)
                         and (s->>k)::numeric >= 0)
           from unnest(array['mixed_wrong_drop', 'mixed_items_per_session',
                             'mixed_max_discrimination', 'mixed_new_skills_per_session',
                             'mixed_struggling_window', 'mixed_struggling_min_right']) k)
    and jsonb_typeof(s->'mixed_step_intervals') = 'array'
    and jsonb_array_length(s->'mixed_step_intervals') between 1 and 50
    and (select bool_and(jsonb_typeof(e.v) = 'number'
                         and (e.v #>> '{}')::numeric >= 1
                         and (e.v #>> '{}')::numeric = trunc((e.v #>> '{}')::numeric)
                         and (e.i = 1 or (e.v #>> '{}')::numeric
                                > ((s->'mixed_step_intervals'->((e.i - 2)::int)) #>> '{}')::numeric))
           from jsonb_array_elements(s->'mixed_step_intervals') with ordinality e(v, i))
    and (s->>'mixed_wrong_drop')::numeric < jsonb_array_length(s->'mixed_step_intervals')
    and (s->>'mixed_items_per_session')::numeric between 1 and 50
    and (s->>'mixed_max_discrimination')::numeric <= (s->>'mixed_items_per_session')::numeric
    and (s->>'mixed_new_skills_per_session')::numeric <= (s->>'mixed_items_per_session')::numeric
    and (s->>'mixed_struggling_window')::numeric >= 1
    and (s->>'mixed_struggling_min_right')::numeric <= (s->>'mixed_struggling_window')::numeric
$fn$;

-- §B ---------------------------------------------------------------------------
create or replace function dol_practice_cap()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select (settings->>'dol_practice_items')::integer
                     from mixed_settings_revision
                    order by mirrored_at desc, revision desc limit 1), 4);
$$;
revoke execute on function dol_practice_cap() from public, anon, authenticated;
grant  execute on function dol_practice_cap() to service_role;

-- §C ---------------------------------------------------------------------------
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

  -- TP-3: v_cap (the graph's dol_practice_items, 4 until mirrored) ratified templates, the ones binding a shown misconception first.
  select coalesce(jsonb_agg(jsonb_build_object('seq', c.rn, 'owner_id', c.owner_id, 'item_id', c.item_id)
                            order by c.rn), '[]'::jsonb)
    into v_plan
  from (
    select p.owner_id, p.item_id,
           row_number() over (order by h.hits desc, p.position, p.item_id) as rn
    from practice_item p
    cross join lateral (
      select count(*) as hits
      from jsonb_path_query(p.document, 'strict $.**.misconceptionId') x
      where x #>> '{}' = any (v_mis)) h
    where p.owner_id = v_src.owner_id and p.role = 'skill' and p.skill_id = v_src.primary_skill
      and p.status = 'ratified' and p.retired_at is null
      and mixed_tier_ok(p.tier, v_uid, p.skill_id)
  ) c
  where c.rn <= v_cap;
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
  from jsonb_to_recordset(v_plan) as t(seq integer, owner_id uuid, item_id text)
  join practice_item p on p.owner_id = t.owner_id and p.item_id = t.item_id
  cross join lateral (select mixed_row_index(v_id, p.item_id,
                                             jsonb_array_length(p.value_table->'rows')) as idx) r;

  return jsonb_build_object('state', 'started', 'session', dol_practice_session_payload(v_id));
end;
$$;

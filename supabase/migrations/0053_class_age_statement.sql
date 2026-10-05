-- =============================================================================
-- 0053_class_age_statement.sql — a class records WHICH age statement its
--                                teacher confirmed (under-13 use, by school
--                                authorization)
-- -----------------------------------------------------------------------------
-- The author's rulings U-1 to U-4 (2026-10-06), after counsel's answer to the
-- D24 packet as he reported it (counsel-review-packet.md, top). Until now a
-- class could only be created against one sentence — "every student in this
-- class is 13 or older" — so a class with younger students could not honestly
-- exist (DECISIONS → "The 13+ floor"). From here the teacher confirms ONE of
-- two statements, and the class records which:
--
--   includes_under_13 = false   every student in this class is 13 or older
--   includes_under_13 = true    this class includes students under 13, and
--                               the teacher's school has authorized their use
--
--   §A  classes.includes_under_13 (existing classes: false — what they
--       confirmed)
--   §B  create_class takes the choice (0033's body; same cap, same audit)
--   §C  reconfirm_class_age — the teacher confirms the other statement for an
--       existing class (U-2): the choice, the time, the confirming teacher
--       and the policy version are re-stamped, and the change is audited with
--       the old values
--   §D  grants
--
-- WHAT DOES NOT CHANGE (U-3). Nothing reads the mark to behave differently:
-- same sign-in, same data, same retention. It is a record.
--
-- NO PERSONAL DATA. The column says something about a CLASS, as a teacher
-- stated it; no student's age is asked, stored or inferred anywhere.
--
-- ORDER (OV-7). create_class keeps working for the page deployed before this
-- migration: the new parameter has a default, so a call with the three old
-- named arguments creates a 13-or-older class exactly as before.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A. the record
-- -----------------------------------------------------------------------------
alter table classes add column includes_under_13 boolean not null default false;

comment on column classes.includes_under_13 is
  'Which age statement the class''s teacher confirmed (0053, U-1): false = every student is 13 or older; true = the class includes students under 13 and the school has authorized their use. Stamped with age_assertion_at / _by / assertion_text_version. Written only by create_class and reconfirm_class_age.';

-- -----------------------------------------------------------------------------
-- B. create_class — 0033's body plus the choice
-- -----------------------------------------------------------------------------
-- A new parameter is a new signature: the old function is dropped so there is
-- ONE create_class, and the default keeps three-argument callers working.
drop function create_class(text, text, text);

create function create_class(
  p_name text,
  p_expected_domain text,
  p_assertion_text_version text,
  p_includes_under_13 boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name    text := trim(p_name);
  v_domain  text := nullif(trim(coalesce(p_expected_domain, '')), '');
  v_class   classes%rowtype;
  v_attempt int;
  v_exempt  boolean;
  v_count   int;
begin
  if not current_user_is_teacher() then
    raise exception 'Only teacher accounts can create classes';
  end if;
  if v_name is null or length(v_name) = 0 then
    raise exception 'Class name is required';
  end if;
  if v_domain is not null and (v_domain <> lower(v_domain) or v_domain not like '%.%') then
    raise exception 'Expected domain must be a lowercase domain like school.org';
  end if;
  if p_assertion_text_version is null or length(trim(p_assertion_text_version)) = 0 then
    raise exception 'Assertion version is required';
  end if;
  if p_includes_under_13 is null then
    raise exception 'An age statement is required';
  end if;

  -- 0033 §G: the attested-teacher class cap.
  select coalesce(teacher_caps_exempt, false) into v_exempt from users where id = auth.uid();
  if not v_exempt then
    select count(*) into v_count from classes
    where teacher_id = auth.uid() and deleted_at is null;
    if v_count >= 5 then
      raise log 'create_class refused (class_cap) user=% count=%', auth.uid(), v_count;
      raise exception 'This account is limited to 5 classes. Contact support to raise it.';
    end if;
  end if;

  for v_attempt in 1..3 loop
    begin
      insert into classes (teacher_id, name, expected_domain, age_assertion_by,
                           assertion_text_version, includes_under_13)
      values (auth.uid(), v_name, v_domain, auth.uid(),
              trim(p_assertion_text_version), p_includes_under_13)
      returning * into v_class;
      exit;
    exception when unique_violation then
      if v_attempt = 3 then raise; end if;
    end;
  end loop;

  insert into audit_log (actor_id, action, target_type, target_id, metadata)
  values (auth.uid(), 'class.create', 'class', v_class.id,
          jsonb_build_object('includes_under_13', v_class.includes_under_13,
                             'assertion_text_version', v_class.assertion_text_version));

  return jsonb_build_object(
    'id', v_class.id,
    'name', v_class.name,
    'join_code', v_class.join_code,
    'expected_domain', v_class.expected_domain,
    'created_at', v_class.created_at,
    'age_assertion_at', v_class.age_assertion_at,
    'assertion_text_version', v_class.assertion_text_version,
    'includes_under_13', v_class.includes_under_13
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- C. reconfirm_class_age — the other statement, for an existing class (U-2)
-- -----------------------------------------------------------------------------
-- Only the class's own teacher. Confirming is always a fresh act: the time,
-- the confirming teacher and the policy version are re-stamped even when the
-- choice is the same one (a teacher re-reading the current wording). The
-- audit row keeps what the class carried before, so the earlier statement is
-- never lost. Errors: 'Not your class'; 'Assertion version is required';
-- 'An age statement is required'.
create function reconfirm_class_age(
  p_class_id uuid,
  p_includes_under_13 boolean,
  p_assertion_text_version text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old classes%rowtype;
  v_new classes%rowtype;
begin
  if auth.uid() is null or p_class_id is null or not is_class_teacher(p_class_id) then
    raise exception 'Not your class';
  end if;
  if p_assertion_text_version is null or length(trim(p_assertion_text_version)) = 0 then
    raise exception 'Assertion version is required';
  end if;
  if p_includes_under_13 is null then
    raise exception 'An age statement is required';
  end if;

  select * into v_old from classes where id = p_class_id for update;

  update classes
     set includes_under_13      = p_includes_under_13,
         age_assertion_at       = now(),
         age_assertion_by       = auth.uid(),
         assertion_text_version = trim(p_assertion_text_version)
   where id = p_class_id
  returning * into v_new;

  insert into audit_log (actor_id, action, target_type, target_id, metadata)
  values (auth.uid(), 'class.update', 'class', p_class_id,
          jsonb_build_object(
            'field', 'age_statement',
            'old', jsonb_build_object('includes_under_13', v_old.includes_under_13,
                                      'age_assertion_at', v_old.age_assertion_at,
                                      'age_assertion_by', v_old.age_assertion_by,
                                      'assertion_text_version', v_old.assertion_text_version),
            'new', jsonb_build_object('includes_under_13', v_new.includes_under_13,
                                      'assertion_text_version', v_new.assertion_text_version)));

  return jsonb_build_object(
    'id', v_new.id,
    'includes_under_13', v_new.includes_under_13,
    'age_assertion_at', v_new.age_assertion_at,
    'assertion_text_version', v_new.assertion_text_version);
end;
$$;

-- -----------------------------------------------------------------------------
-- D. grants (0009: every function carries its own stanza; 0027's client column
--    grants are untouched — the new column is written only by the two RPCs)
-- -----------------------------------------------------------------------------
revoke execute on function create_class(text, text, text, boolean) from public, anon;
grant  execute on function create_class(text, text, text, boolean) to authenticated, service_role;
revoke execute on function reconfirm_class_age(uuid, boolean, text) from public, anon;
grant  execute on function reconfirm_class_age(uuid, boolean, text) to authenticated, service_role;

-- =============================================================================
-- Verification lives in scripts/verify-0053.sql (registered in the verify
-- runner): the column and its default; one create_class, signed-in only; a
-- three-argument call still creates a 13-or-older class; the choice is stored,
-- returned and audited; the re-confirm's gate, its re-stamp and its audit row;
-- a client cannot write the column directly.
-- =============================================================================

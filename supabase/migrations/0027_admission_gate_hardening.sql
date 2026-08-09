-- 0027_admission_gate_hardening.sql
-- =============================================================================
-- S9-prep identity slice, migration half (plan: docs/design/s9-prep-identity-slice.md;
-- rulings E-1/E-2/E-3/E-7/E-8, T3/T4, D-11, X1-X3 — eng review 2026-08-08,
-- DX + design reviews 2026-08-09).
--
-- One concern-family: the admission / class-write boundary.
--   §A  allowlist case-normalization (the ARMED DEFECT: a mis-cased teacher row
--       admits its owner as a STUDENT the moment student_domain is seeded)
--   §B  expected_domain format floor (defensive normalize, then CHECK)
--   §C  handle_new_auth_user v3 — case-normalized allowlist compare
--   §D  is_class_teacher gains the role conjunct (demotion hole, s1a item 11)
--   §E  classes goes deny-by-default: UPDATE grant narrows to (name),
--       INSERT revoked + classes_insert_teacher dropped; updated_at moves to a
--       trigger stamp
--   §F  join_class v2 — split error strings (contract: the app's
--       authContract.json, verbatim), RAISE LOG refusal visibility
--   §G  create_class / regenerate_join_code / update_class_domain DEFINER RPCs
--       with class.create / class.update audit writers
--
-- ORDER CONTRACT: this migration applies BEFORE student_domain is ever seeded
-- (S9 gate 4). Wire strings here are shared VERBATIM with
-- packages/app/src/lib/authContract.json — edit both together or the contract
-- pin test and verify-0027 §E fail.
--
-- After applying: run `pnpm verify:auth --target live` (verify-0027 plus the
-- four README-mandated grant-surgery re-runs).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A. Allowlist case-normalization
-- -----------------------------------------------------------------------------
-- 0013's trigger matched allowlist by exact `email = new.email` while the
-- student branch lowercases — so a mis-cased allowlist row silently demotes
-- its teacher to the student branch. Normalize the data, pin the invariant,
-- and (in §C) lowercase the compare.

update allowlist set email = lower(email) where email <> lower(email);

alter table allowlist
  add constraint allowlist_email_lowercase check (email = lower(email));

-- -----------------------------------------------------------------------------
-- B. expected_domain format floor
-- -----------------------------------------------------------------------------
-- A dotless "domain" (e.g. 'district') can never match a real email domain —
-- it bricks joining until the class is recreated. Defensively null any
-- non-conforming rows FIRST (never trust a plan-time row count at apply time,
-- P11 / OV-7), then add the CHECK.

update classes set expected_domain = null
where expected_domain is not null and expected_domain not like '%.%';

alter table classes
  add constraint classes_expected_domain_dotted
  check (expected_domain is null or expected_domain like '%.%');

-- -----------------------------------------------------------------------------
-- C. handle_new_auth_user v3 (supersedes 0021's v2)
-- -----------------------------------------------------------------------------
-- Sole change from 0021: the allowlist compare is case-normalized
-- (`email = lower(new.email)` against the §A-lowercased table). Everything
-- else — display_name capture, student branch, refusal, audit — is byte-for-
-- byte 0021 behavior.
--
-- The refusal raise text is contract-recorded (authContract.json →
-- signupRefusalTemplate) but NEVER reaches the browser: GoTrue swallows
-- trigger errors into a generic server_error redirect (T1 ruling). The app's
-- sign-in-failed screens key on error PRESENCE, not this phrase.

create or replace function handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_domain text := lower(split_part(new.email, '@', 2));
begin
  if exists (select 1 from public.allowlist where email = lower(new.email)) then
    -- Teacher path: role defaults to 'teacher'.
    insert into public.users (id, email, display_name)
    values (
      new.id,
      new.email,
      nullif(trim(new.raw_user_meta_data->>'full_name'), '')
    );
  elsif exists (select 1 from public.student_domain where domain = v_domain) then
    -- Student path: admitted by district domain.
    insert into public.users (id, email, display_name, role)
    values (
      new.id,
      new.email,
      nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
      'student'
    );
  else
    raise exception 'Email % is not permitted to sign up', new.email;
  end if;

  insert into public.audit_log (actor_id, action, target_type, target_id)
  values (new.id, 'user.create', 'user', new.id);

  return new;
end;
$$;

-- (on_auth_user_created keeps pointing here; grants from 0009 —
-- supabase_auth_admin + service_role only — survive REPLACE.)

-- -----------------------------------------------------------------------------
-- D. is_class_teacher: ownership AND current role
-- -----------------------------------------------------------------------------
-- s1a item 11: ownership-only meant a teacher demoted to 'student' kept roster
-- reads (emails), member removal, and class delete — role demotion revoked
-- only INSERT. The conjunct closes it; current_user_is_teacher() is the 0013
-- helper vocabulary (CLAUDE.md: policies call helpers).

create or replace function is_class_teacher(p_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from classes c
    where c.id = p_class_id
      and c.teacher_id = auth.uid()
      and c.deleted_at is null
  ) and current_user_is_teacher();
$$;

-- -----------------------------------------------------------------------------
-- E. classes: deny-by-default writes (E-1 amended by T3/T4)
-- -----------------------------------------------------------------------------
-- The 13+ assertion columns are a legal paper trail; 0014's policy pinned only
-- teacher_id/age_assertion_by, leaving age_assertion_at, assertion_text_version,
-- join_code, expected_domain, and even deleted_at client-writable. Column
-- grants make immutability structural:
--   * UPDATE narrows to (name) — the one genuinely cosmetic column.
--   * INSERT is revoked and classes_insert_teacher dropped — create_class (§G)
--     is the ONLY creation door, so the class.create audit rail has no bypass.
--   * join_code / expected_domain / deleted_at move behind DEFINER RPCs
--     (§G here; soft_delete_class since 0014).
-- SELECT grants and both select policies are untouched.

revoke insert, update on table classes from authenticated, anon;
grant update (name) on table classes to authenticated;

drop policy classes_insert_teacher on classes;

-- Recreate the UPDATE policy without the age_assertion_by WITH CHECK clause:
-- the assertion columns are now grant-protected, and that clause made a class
-- whose assertion was stamped by someone else permanently un-updatable — wrong
-- under any future co-ownership.
drop policy classes_update_own on classes;
create policy classes_update_own on classes
  for update using (teacher_id = (select auth.uid()) and deleted_at is null)
  with check (teacher_id = (select auth.uid()));

-- updated_at becomes a trigger stamp (was client-supplied — clock-skew prone,
-- and no longer grantable).
create or replace function set_classes_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists classes_updated_at on classes;
create trigger classes_updated_at
  before update on classes
  for each row execute function set_classes_updated_at();

-- -----------------------------------------------------------------------------
-- F. join_class v2 (supersedes 0014's v1)
-- -----------------------------------------------------------------------------
-- Two changes from 0014, both ruled:
--   * E-7/D-9 error split: a disabled account and a teacher account get
--     DISTINCT raise strings (0014 folded both into one). Strings are the
--     authContract.json wire contract, verbatim.
--   * E-8 refusal visibility: RAISE LOG fires BEFORE each refusal raise. LOG
--     emits to the server log and SURVIVES the rollback that the raise causes
--     — the one channel a raise-based function has for failure traces.
--
-- E-8 acceptance record (2026-08-09, eng review T2): join-code enumeration is
-- NOT throttled, deliberately. The space is 31^6 ≈ 887M codes; callers must
-- hold an authenticated student account; at any plausible request rate the
-- expected time-to-hit is years. A durable failure counter would force this
-- function off raise-based errors (a rollback takes any trace row with it),
-- rewriting the client contract against a geologic threat. Revisit triggers:
-- multi-district tenancy, or any public signup path. Until then the RAISE LOG
-- lines below are the visibility channel (verify-0027 proves they fire).

create or replace function join_class(p_join_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user    users%rowtype;
  v_class   classes%rowtype;
  v_member  class_members%rowtype;
begin
  select * into v_user from users where id = auth.uid();

  if v_user.id is null or (v_user.deleted_at is null and v_user.role <> 'student') then
    raise log 'join_class refused (not_student) user=%', auth.uid();
    raise exception 'Only student accounts can join a class';
  end if;

  if v_user.deleted_at is not null then
    raise log 'join_class refused (disabled) user=%', auth.uid();
    raise exception 'This account is disabled';
  end if;

  select * into v_class from classes
  where join_code = upper(trim(p_join_code)) and deleted_at is null;

  if v_class.id is null then
    raise log 'join_class refused (bad_code) user=%', auth.uid();
    raise exception 'No class found for that code';
  end if;

  if v_class.expected_domain is not null
     and lower(split_part(v_user.email, '@', 2)) <> v_class.expected_domain then
    raise log 'join_class refused (domain) user=% class=%', auth.uid(), v_class.id;
    raise exception 'This class is limited to % accounts', v_class.expected_domain;
  end if;

  select * into v_member from class_members
  where class_id = v_class.id and student_id = v_user.id;

  if v_member.id is null then
    insert into class_members (class_id, student_id)
    values (v_class.id, v_user.id)
    returning * into v_member;
  elsif v_member.removed_at is not null then
    update class_members
    set removed_at = null, joined_at = now()
    where id = v_member.id
    returning * into v_member;
  end if;

  insert into audit_log (actor_id, action, target_type, target_id)
  values (v_user.id, 'class.join', 'class', v_class.id);

  return jsonb_build_object(
    'class_id',   v_class.id,
    'class_name', v_class.name,
    'joined_at',  v_member.joined_at
  );
end;
$$;

-- (join_class grants from 0014 — authenticated + service_role — survive REPLACE.)

-- -----------------------------------------------------------------------------
-- G. The three audited write doors (E-2 / E-3 / T4)
-- -----------------------------------------------------------------------------
-- join_class's idiom throughout: validate, write, audit, return jsonb.
-- class.create and class.update were declared in 0014's enum with ZERO
-- writers; they gain them here.

-- G1. create_class — the ONLY way a class row comes to exist (see §E).
create or replace function create_class(
  p_name text,
  p_expected_domain text,
  p_assertion_text_version text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name   text := trim(p_name);
  v_domain text := nullif(trim(coalesce(p_expected_domain, '')), '');
  v_class  classes%rowtype;
  v_attempt int;
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

  -- Server-side collision retry (was a client loop in classes.ts; 3 attempts
  -- matches the 0014-era client behavior).
  for v_attempt in 1..3 loop
    begin
      insert into classes (teacher_id, name, expected_domain, age_assertion_by, assertion_text_version)
      values (auth.uid(), v_name, v_domain, auth.uid(), trim(p_assertion_text_version))
      returning * into v_class;
      exit;
    exception when unique_violation then
      if v_attempt = 3 then raise; end if;
    end;
  end loop;

  insert into audit_log (actor_id, action, target_type, target_id, metadata)
  values (auth.uid(), 'class.create', 'class', v_class.id,
          jsonb_build_object('name', v_class.name, 'expected_domain', v_class.expected_domain,
                             'assertion_text_version', v_class.assertion_text_version));

  return jsonb_build_object(
    'id', v_class.id, 'name', v_class.name, 'join_code', v_class.join_code,
    'expected_domain', v_class.expected_domain, 'created_at', v_class.created_at,
    'age_assertion_at', v_class.age_assertion_at,
    'assertion_text_version', v_class.assertion_text_version
  );
end;
$$;

-- G2. regenerate_join_code — the lockout half of B14's "Remove & regenerate".
-- An unaudited lockout is a hole; metadata carries old/new so the audit row
-- reconstructs which posted link died.
create or replace function regenerate_join_code(p_class_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old  text;
  v_new  text;
  v_attempt int;
begin
  if not is_class_teacher(p_class_id) then
    raise exception 'Not your class';
  end if;

  select join_code into v_old from classes where id = p_class_id;

  for v_attempt in 1..3 loop
    begin
      v_new := generate_join_code();
      update classes set join_code = v_new where id = p_class_id;
      exit;
    exception when unique_violation then
      if v_attempt = 3 then raise; end if;
    end;
  end loop;

  insert into audit_log (actor_id, action, target_type, target_id, metadata)
  values (auth.uid(), 'class.update', 'class', p_class_id,
          jsonb_build_object('field', 'join_code', 'old', v_old, 'new', v_new));

  return jsonb_build_object('join_code', v_new);
end;
$$;

-- G3. update_class_domain — boundary-loosening write, so audited (T4: a null
-- domain + a leaked code admits ANY admitted student; that must leave a trace).
create or replace function update_class_domain(p_class_id uuid, p_domain text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old    text;
  v_domain text := nullif(trim(coalesce(p_domain, '')), '');
begin
  if not is_class_teacher(p_class_id) then
    raise exception 'Not your class';
  end if;
  if v_domain is not null and (v_domain <> lower(v_domain) or v_domain not like '%.%') then
    raise exception 'Expected domain must be a lowercase domain like school.org';
  end if;

  select expected_domain into v_old from classes where id = p_class_id;
  update classes set expected_domain = v_domain where id = p_class_id;

  insert into audit_log (actor_id, action, target_type, target_id, metadata)
  values (auth.uid(), 'class.update', 'class', p_class_id,
          jsonb_build_object('field', 'expected_domain', 'old', v_old, 'new', v_domain));

  return jsonb_build_object('expected_domain', v_domain);
end;
$$;

revoke execute on function create_class(text, text, text) from public, anon;
revoke execute on function regenerate_join_code(uuid) from public, anon;
revoke execute on function update_class_domain(uuid, text) from public, anon;
grant execute on function create_class(text, text, text) to authenticated, service_role;
grant execute on function regenerate_join_code(uuid) to authenticated, service_role;
grant execute on function update_class_domain(uuid, text) to authenticated, service_role;

-- =============================================================================
-- Post-apply: `pnpm verify:auth --target live` runs verify-0027 (four trigger
-- proof rows at production values, grant matrix incl. INSERT, audit-row
-- assertions, prosrc contract pin, RAISE LOG fire) plus the four mandated
-- grant-surgery re-runs (verify-0013-0014 — §B expectations updated by this
-- slice, verify-0017, verify-image-storage, verify-0020).
-- Advisor note: the three §G functions are SECURITY DEFINER with pinned
-- search_path — same accepted posture as join_class (0014).
-- =============================================================================

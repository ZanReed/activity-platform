-- =============================================================================
-- 0033_pending_admission.sql — self-serve admission via a contained pending role
-- -----------------------------------------------------------------------------
-- Implements the eng+design-cleared architecture in docs/design/admission-model.md
-- §5b (R1–R11, ruled 2026-08-15). The one-line summary: unknown Google signups
-- stop being REFUSED and start being ADMITTED as `pending` — a role that can do
-- nothing — and two audited RPCs promote them.
--
-- WHY THIS SHAPE (the short version; §5b has the long one). The morning's design
-- put a class code in email+password signup metadata so the TRIGGER could decide
-- everything at once. Two facts killed it: Supabase's built-in mailer cannot
-- serve one classroom signing up at once, and a password path on managed-tier
-- emails lets anyone pre-create a teacher account. Google-only + a pending role
-- deletes both, and moves every refusal into an RPC whose raise text actually
-- reaches the browser (GoTrue swallows trigger raises — 0027 §C says so, and
-- this migration is the second time that fact has decided a design).
--
--   §A  user_role gains 'pending'                       (R1)
--   §B  users gains attestation + caps-exempt columns   (R3/D6)
--   §C  generate_join_code v2 — crypto, unbiased        (R7/3A)
--   §D  handle_new_auth_user v4 — else-branch admits    (R1)
--   §E  redeem_join_code — student promotion + join     (R2)
--   §F  claim_teacher — teacher promotion + attestation (R3)
--   §G  create_class gains the attested-teacher cap     (R3/OV-9)
--   §H  grants (0009's standing rule: every new function gets a stanza)
--
-- ORDER CONTRACT: §A must commit before any ROW can hold 'pending'. Postgres
-- 12+ permits ALTER TYPE ... ADD VALUE inside a transaction, but the new label
-- cannot be USED by DML in that same transaction. Nothing here writes a pending
-- row — the function BODIES below are stored as text and resolve the label at
-- call time, which is why this lands as one migration rather than two.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A. The pending role
-- -----------------------------------------------------------------------------
-- Deliberately NOT the column default: 'teacher' stays the default so that the
-- allowlist branch in §D keeps working by omission, exactly as 0027 left it.
-- Pending is only ever written explicitly, by the trigger's else-branch.
alter type user_role add value if not exists 'pending';

-- The two promotions are audited, and audit_action is an ENUM — a row with an
-- undeclared action does not fail a lint, it raises at runtime inside the RPC.
-- (0014 hit this same edge from the other side: it declared class.create /
-- class.update in the enum with no writer, and 0027 supplied the writers. Here
-- the writers arrive first, so the labels have to.) Caught by verify-0033 §C on
-- its first run, which is the argument for writing the matrix before shipping.
alter type audit_action add value if not exists 'user.promote_student';
alter type audit_action add value if not exists 'user.claim_teacher';

-- -----------------------------------------------------------------------------
-- B. Attestation + cap-exemption columns
-- -----------------------------------------------------------------------------
-- Mirrors the 3.1C age-assertion shape: a timestamp, an actor, and the policy
-- version the wording came from, so a later reword is distinguishable in the
-- record. NULL for allowlist teachers — they predate the mechanism and the
-- author vouched for them directly (R3).
alter table users
  add column if not exists educator_attested_at    timestamptz,
  add column if not exists educator_attested_version text,
  add column if not exists teacher_caps_exempt     boolean not null default false;

comment on column users.educator_attested_at is
  'When a SELF-SERVE teacher attested they are an educator authorized by their school. NULL for allowlist teachers (0033 §B).';
comment on column users.teacher_caps_exempt is
  'Exempt from the attested-teacher structural caps (0033 §G). TRUE for allowlist teachers; the author lifts it per-account.';

-- Existing teachers are allowlist teachers by definition (student_domain has
-- never been seeded and pending does not exist yet), so exempt them. Safe DML:
-- it writes 'teacher_caps_exempt', never the new enum label.
update users set teacher_caps_exempt = true where role in ('teacher', 'admin');

-- -----------------------------------------------------------------------------
-- C. generate_join_code v2 — crypto-grade, unbiased
-- -----------------------------------------------------------------------------
-- 0014 used `(random() * 30)::int + 1` over a 31-char alphabet: not crypto, and
-- biased (the multiply-and-round maps the endpoints unevenly). That was fine
-- when a code leaked only a class NAME. Under R1 a code is an admission token —
-- possession plus a Google account creates a student — so it gets real entropy.
--
-- THE NUMBERS, pinned so nobody re-derives them (R7): 31 chars (Crockford-style,
-- I/L/O/0/1 excluded so a kid reading a whiteboard cannot transpose) ^ 6
-- positions = 887,503,681 codes, unique-indexed. Brute force costs an audited,
-- rate-limited RPC call per guess ON A REAL GOOGLE ACCOUNT, with the pre-auth
-- meta limiter in front of the cheap probe path.
--
-- gen_random_bytes is pgcrypto, installed since 0001. The modulo bias here is
-- 256 mod 31 = 8/256 ≈ 3% on eight of the letters — immaterial against 887M and
-- an authenticated redemption cost, and called out so the next reader does not
-- mistake it for an oversight.
create or replace function generate_join_code()
returns text
language plpgsql
volatile
set search_path = public, extensions
as $$
declare
  v_alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_bytes    bytea := extensions.gen_random_bytes(6);
  v_code     text := '';
  i          int;
begin
  for i in 0..5 loop
    v_code := v_code || substr(v_alphabet, (get_byte(v_bytes, i) % 31) + 1, 1);
  end loop;
  return v_code;
end;
$$;

-- -----------------------------------------------------------------------------
-- D. handle_new_auth_user v4 — the else-branch admits instead of refusing
-- -----------------------------------------------------------------------------
-- The two managed-tier fast paths are BYTE-IDENTICAL to 0027 §C. The only
-- change is the terminal branch: `raise exception` becomes a pending insert.
--
-- Precedence is unchanged and now trivially safe: allowlist > student_domain >
-- pending, most-specific first. The eng review's pre-creation attack and the
-- teacher-demotion hole both required a password path to exist; there is none.
--
-- NOTE the refusal string retires here. 0027's `Email % is not permitted to
-- sign up` was the ONLY thing the sign-in-failure frames could key on, and they
-- key on error PRESENCE rather than the phrase (0027 §C), so those frames keep
-- working — they simply stop firing for unknown emails, which is the point.
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
    -- Teacher path: role defaults to 'teacher'. Allowlist teachers are
    -- cap-exempt (§B's backfill covers the existing ones; this covers new ones).
    insert into public.users (id, email, display_name, teacher_caps_exempt)
    values (
      new.id,
      new.email,
      nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
      true
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
    -- Pending path (0033): admitted, contained, and useless until an audited
    -- RPC promotes it. Every capability in this schema keys on 'teacher' or
    -- 'student'; verify-0033 §D proves pending reaches none of them.
    insert into public.users (id, email, display_name, role)
    values (
      new.id,
      new.email,
      nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
      'pending'
    );
  end if;

  insert into public.audit_log (actor_id, action, target_type, target_id)
  values (new.id, 'user.create', 'user', new.id);

  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- E. redeem_join_code — the student promotion (R2)
-- -----------------------------------------------------------------------------
-- Promotes pending -> student AND joins, in one transaction. join_class stays
-- the only writer into class_members (0027's invariant): this function promotes
-- first and then CALLS it, rather than inlining an insert.
--
-- E-7/E-8 contract, inherited from join_class: RAISE LOG before every refusal
-- (it survives the rollback the raise causes), distinct strings per cause. The
-- difference that made this architecture win: these strings REACH THE BROWSER.
-- The client renders them per docs/design/admission-model.md R5-DR.
--
--   pending  -> validate -> promote -> join_class() -> audit -> jsonb
--   student  -> idempotent: no promote, join_class() handles rejoin
--   teacher  -> refused (a teacher testing their own code stays a teacher)
create or replace function redeem_join_code(p_join_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user   users%rowtype;
  v_class  classes%rowtype;
  v_result jsonb;
begin
  select * into v_user from users where id = auth.uid();

  if v_user.id is null then
    raise log 'redeem refused (no_user) user=%', auth.uid();
    raise exception 'Sign in before joining a class';
  end if;

  if v_user.deleted_at is not null then
    raise log 'redeem refused (disabled) user=%', auth.uid();
    raise exception 'This account is disabled';
  end if;

  -- Only pending and student may redeem. A teacher (or admin) hitting a code
  -- keeps their role: silently demoting the teacher who is testing their own
  -- class code is the 0027 §A defect wearing a new hat.
  if v_user.role not in ('pending', 'student') then
    raise log 'redeem refused (wrong_role=%) user=%', v_user.role, auth.uid();
    raise exception 'Teacher accounts cannot join a class as a student';
  end if;

  select * into v_class from classes
  where join_code = upper(trim(coalesce(p_join_code, ''))) and deleted_at is null;

  if v_class.id is null then
    raise log 'redeem refused (bad_code) user=%', auth.uid();
    raise exception 'No class found for that code';
  end if;

  -- Checked HERE as well as inside join_class (D2/R2): refusing at admission
  -- means a student never ends up holding an account they cannot use. The
  -- disclosure shape matches 0014's — the domain is named to a signed-in caller
  -- who already holds the code.
  if v_class.expected_domain is not null
     and lower(split_part(v_user.email, '@', 2)) <> v_class.expected_domain then
    raise log 'redeem refused (domain) user=% class=%', auth.uid(), v_class.id;
    raise exception 'This class is limited to % accounts', v_class.expected_domain;
  end if;

  -- Promote before joining: join_class refuses anything that is not a student.
  if v_user.role = 'pending' then
    update users set role = 'student' where id = v_user.id;
    insert into audit_log (actor_id, action, target_type, target_id)
    values (v_user.id, 'user.promote_student', 'user', v_user.id);
  end if;

  v_result := join_class(v_class.join_code);
  return v_result;
end;
$$;

-- -----------------------------------------------------------------------------
-- F. claim_teacher — the teacher promotion (R3)
-- -----------------------------------------------------------------------------
-- Pending-only by design: an existing teacher calling this is a no-op error
-- rather than a re-attestation, and a student cannot become a teacher by
-- checking a box (role changes between the two student/teacher tiers are an
-- author action, deliberately not a self-serve one).
--
-- The attestation VERSION is required and stored. It rides POLICY_VERSION on
-- the client, so a reworded attestation is distinguishable in the record — the
-- same reason classes.assertion_text_version exists (3.1C).
create or replace function claim_teacher(p_attestation_version text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user users%rowtype;
begin
  select * into v_user from users where id = auth.uid();

  if v_user.id is null then
    raise log 'claim_teacher refused (no_user) user=%', auth.uid();
    raise exception 'Sign in before setting up a teacher account';
  end if;

  if v_user.deleted_at is not null then
    raise log 'claim_teacher refused (disabled) user=%', auth.uid();
    raise exception 'This account is disabled';
  end if;

  if v_user.role <> 'pending' then
    raise log 'claim_teacher refused (wrong_role=%) user=%', v_user.role, auth.uid();
    raise exception 'This account is already set up';
  end if;

  if p_attestation_version is null or length(trim(p_attestation_version)) = 0 then
    raise log 'claim_teacher refused (no_attestation) user=%', auth.uid();
    raise exception 'Educator attestation is required';
  end if;

  update users
  set role                      = 'teacher',
      educator_attested_at      = now(),
      educator_attested_version = trim(p_attestation_version)
      -- teacher_caps_exempt stays FALSE: self-serve teachers are capped (§G).
  where id = v_user.id;

  insert into audit_log (actor_id, action, target_type, target_id)
  values (v_user.id, 'user.claim_teacher', 'user', v_user.id);

  return jsonb_build_object('role', 'teacher', 'attested_at', now());
end;
$$;

-- -----------------------------------------------------------------------------
-- G. The attested-teacher cap (R3 / OV-9)
-- -----------------------------------------------------------------------------
-- The hostile-teacher blast radius, bounded. A fake attested teacher can create
-- a class, lure students with the code, and read roster emails through
-- list_class_members — that surface is legitimate for real teachers, so the
-- answer is structural limits rather than removing the capability.
--
-- 5 classes is generous for one teacher's course load and a rounding error for
-- a harvester; allowlist teachers are exempt. The MEMBER cap lives in join_class
-- (below) because that is the only door into class_members.
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

  insert into audit_log (actor_id, action, target_type, target_id)
  values (auth.uid(), 'class.create', 'class', v_class.id);

  return jsonb_build_object(
    'id', v_class.id,
    'name', v_class.name,
    'join_code', v_class.join_code,
    'expected_domain', v_class.expected_domain,
    'created_at', v_class.created_at
  );
end;
$$;

-- join_class v3: unchanged except the member cap for classes owned by a
-- non-exempt teacher. Placed here (not in redeem_join_code) because join_class
-- is the ONLY door into class_members — a cap anywhere else would be bypassable
-- by the domain-student path that calls join_class directly.
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
  v_exempt  boolean;
  v_members int;
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

  -- 0033 §G: the attested-teacher member cap. Checked only for a NEW membership
  -- (a rejoin by an already-counted student must never be refused by the cap).
  if v_member.id is null then
    select coalesce(teacher_caps_exempt, false) into v_exempt
    from users where id = v_class.teacher_id;
    if not v_exempt then
      select count(*) into v_members from class_members
      where class_id = v_class.id and removed_at is null;
      if v_members >= 50 then
        raise log 'join_class refused (member_cap) class=% count=%', v_class.id, v_members;
        raise exception 'This class is full. Ask your teacher for help.';
      end if;
    end if;

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

-- -----------------------------------------------------------------------------
-- H. Grants — 0009's standing rule, applied to the two new doors
-- -----------------------------------------------------------------------------
-- "A migration adding any function is not done until its revoke/grant stanza is
-- written" (0009/0015/0016). Supabase still default-grants EXECUTE to PUBLIC.
-- Both RPCs are called BY a signed-in user, so: authenticated + service_role.
revoke execute on function redeem_join_code(text) from public, anon;
grant  execute on function redeem_join_code(text) to authenticated, service_role;

revoke execute on function claim_teacher(text) from public, anon;
grant  execute on function claim_teacher(text) to authenticated, service_role;

-- generate_join_code keeps 0015's shape (it is called by the classes default
-- and by regenerate_join_code, never directly by a client).
revoke execute on function generate_join_code() from public, anon;
grant  execute on function generate_join_code() to authenticated, service_role;

-- =============================================================================
-- Verification lives in scripts/verify-0033.sql (registered in the verify
-- runner). The matrix it proves, per R9: 4 trigger rows, 6 redeem rows, 4 claim
-- rows incl. both caps at production values, 5 pending-containment rows, and
-- the retention row for never-redeemed pending accounts.
-- =============================================================================

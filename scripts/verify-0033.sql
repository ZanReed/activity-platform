-- verify-0033.sql — self-serve admission via the pending role (migration 0033).
--
-- Run with `pnpm verify:auth --target live|local`. §C is a self-fixturing
-- EXPECTED-ROLLBACK block (the verify-0027 §E / verify-0030 §B idiom): real
-- auth.users inserts through the REAL trigger, claims-switched RPC calls,
-- everything rolled back — durable-write-free on every path (P7).
--
-- WHY EACH SECTION EXISTS:
--   §A — the catalog posture: 'pending' exists in the enum, the attestation +
--        cap columns landed, both new RPCs are authenticated-only (0009's
--        stanza rule — anon must NOT reach an admission door), and the code
--        generator is the crypto one (a grep for the retired random() bias).
--   §B — the R7 code-shape contract: 6 chars from the confusable-excluded
--        alphabet, uniqueness enforced by index, and the generator actually
--        produces distinct values (a stuck generator would still pass a
--        shape-only assertion — the vacuity this row exists to prevent).
--   §C — the R9 behavior matrix: 4 trigger rows (allowlist / domain / pending
--        / precedence), 6 redeem rows, 4 claim rows INCLUDING both caps fired
--        at their production values (P3: a cap nobody has seen fire is a
--        dormant safeguard), 5 pending-containment rows, and the retention row
--        for a never-redeemed pending account.

-- @section A-catalog-posture
-- @expect-rows
select 'pending_role_exists',
       exists (select 1 from pg_enum e join pg_type t on t.oid = e.enumtypid
                where t.typname = 'user_role' and e.enumlabel = 'pending'),
       'R1: the contained role';
select 'attestation_columns',
       (select count(*) from information_schema.columns
         where table_name = 'users'
           and column_name in ('educator_attested_at','educator_attested_version','teacher_caps_exempt')) = 3,
       'R3/D6: attestation rides POLICY_VERSION; caps exemption is per-account';
-- ⚠ SCOPED TO THE ALLOWLIST DOOR 2026-08-24, AND THAT IS A CORRECTION, NOT A
-- WEAKENING. As written this asserted that NO teacher is capped — but capping
-- the self-serve ones is the entire point of 0033 §G, whose own source comment
-- says so ("teacher_caps_exempt stays FALSE: self-serve teachers are capped").
-- The assertion's message always described the narrower property; only its
-- predicate was wide. It began reporting correct behaviour as a failure the
-- moment the self-serve door produced its first teacher (2026-08-19, two
-- accounts), and it fails identically on the LOCAL database for the same
-- reason — the integration lane's teacher claims through claim_teacher.
--
-- `educator_attested_at is null` IS the allowlist door: claim_teacher stamps
-- it, the trigger's allowlist branch does not, and the column comment says so
-- outright ("NULL for allowlist teachers"). Preferred over allowlist
-- membership, which can be edited after the fact.
select 'existing_teachers_exempt',
       not exists (select 1 from users
                    where role in ('teacher','admin')
                      and educator_attested_at is null
                      and teacher_caps_exempt = false),
       'allowlist teachers predate the caps and stay uncapped';
-- The COMPLEMENT, which nothing asserted before — and it is the half that is a
-- security property rather than a migration artifact (P3: the caps gate had no
-- liveness proof). Net coverage goes UP: one over-wide row becomes two exact
-- ones.
-- ⚠ IF THE AUTHOR DELIBERATELY LIFTS ONE ACCOUNT'S CAP, this goes red. That is
-- intended — a hand-granted exemption is a security-relevant, not-reproducible-
-- from-migrations fact (the `display_name` class), and having to write down
-- WHICH account and WHY is the cheapest audit trail there is. Amend the row
-- with the reason; do not widen the predicate back.
select 'self_serve_teachers_capped',
       not exists (select 1 from users
                    where role in ('teacher','admin')
                      and educator_attested_at is not null
                      and teacher_caps_exempt = true),
       '§G: claiming teacher does NOT buy an exemption — the author lifts it per-account';
select 'redeem_not_anon_reachable',
       not has_function_privilege('anon', 'redeem_join_code(text)', 'execute')
       and has_function_privilege('authenticated', 'redeem_join_code(text)', 'execute'),
       '0009 stanza: an admission door is never anon-callable';
select 'claim_not_anon_reachable',
       not has_function_privilege('anon', 'claim_teacher(text)', 'execute')
       and has_function_privilege('authenticated', 'claim_teacher(text)', 'execute'),
       '0009 stanza: same for the teacher door';
select 'code_generator_is_crypto',
       (select strpos(prosrc, 'gen_random_bytes') > 0 and strpos(prosrc, 'random()') = 0
          from pg_proc where proname = 'generate_join_code'),
       'R7/3A: the biased random() generator is retired, not merely supplemented';

-- @section B-code-shape
-- @expect-rows
select 'code_shape_6_from_alphabet',
       (select bool_and(c ~ '^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$')
          from (select generate_join_code() as c from generate_series(1, 40)) s),
       'R7: 6 chars, confusable-excluded (no I/L/O/0/1)';
select 'code_generator_not_stuck',
       (select count(distinct c) >= 35
          from (select generate_join_code() as c from generate_series(1, 40)) s),
       'a constant generator would pass a shape-only check — this is the vacuity guard';
select 'join_code_unique_enforced',
       exists (select 1 from pg_indexes
                where tablename = 'classes' and indexdef ilike '%unique%'
                  and indexdef ilike '%join_code%'),
       'collisions are refused by the index, not by luck';

-- @section C-behavior-matrix
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_allow    uuid := gen_random_uuid();  -- allowlisted email  -> teacher
  v_domain   uuid := gen_random_uuid();  -- district domain    -> student
  v_pending  uuid := gen_random_uuid();  -- unknown gmail      -> pending
  v_prec     uuid := gen_random_uuid();  -- allowlist AND domain -> teacher (precedence)
  v_claimer  uuid := gen_random_uuid();  -- pending -> claim_teacher
  v_capped   uuid := gen_random_uuid();  -- pending -> claim -> hits class cap
  v_member   uuid := gen_random_uuid();  -- pending -> redeem into a capped class
  v_class    classes%rowtype;
  v_dclass   classes%rowtype;            -- domain-restricted class
  v_capclass classes%rowtype;            -- class owned by a capped teacher
  v_role     user_role;
  v_msg      text;
  v_res      jsonb;
  v_i        int;
  v_cnt      int;
  -- refusal flags
  v_bad_code       boolean := false;
  v_deleted_class  boolean := false;
  v_domain_refused boolean := false;
  v_teacher_refused boolean := false;
  v_claim_norole   boolean := false;
  v_claim_noattest boolean := false;
  v_class_cap      boolean := false;
  v_member_cap     boolean := false;
  -- containment flags
  v_pending_no_author boolean := false;
  v_pending_no_join   boolean := false;
  v_pending_no_class  boolean := false;
begin
  -- ---- fixtures ----------------------------------------------------------
  insert into student_domain (domain) values ('vfy0033.example');
  insert into allowlist (email) values ('vfy0033-a@elsewhere.example');
  insert into allowlist (email) values ('vfy0033-p@vfy0033.example');  -- also domain-matching

  -- (1) TRIGGER ROWS: each insert exercises one branch of handle_new_auth_user.
  insert into auth.users (id, email, raw_user_meta_data) values
    (v_allow,   'vfy0033-a@elsewhere.example', '{}'::jsonb),
    (v_domain,  'vfy0033-d@vfy0033.example',   '{}'::jsonb),
    (v_pending, 'vfy0033-x@gmail.example',     '{}'::jsonb),
    (v_prec,    'vfy0033-p@vfy0033.example',   '{}'::jsonb);

  select role into v_role from users where id = v_allow;
  if v_role <> 'teacher' then raise exception 'FAIL trigger: allowlist -> % (want teacher)', v_role; end if;
  select role into v_role from users where id = v_domain;
  if v_role <> 'student' then raise exception 'FAIL trigger: domain -> % (want student)', v_role; end if;
  select role into v_role from users where id = v_pending;
  if v_role <> 'pending' then raise exception 'FAIL trigger: unknown -> % (want pending)', v_role; end if;
  -- PRECEDENCE: allowlist beats student_domain, most-specific first.
  select role into v_role from users where id = v_prec;
  if v_role <> 'teacher' then raise exception 'FAIL precedence: allowlist+domain -> % (want teacher)', v_role; end if;
  -- and the allowlist branch marks new teachers cap-exempt
  if not (select teacher_caps_exempt from users where id = v_allow) then
    raise exception 'FAIL: allowlist teacher is not cap-exempt';
  end if;

  -- classes: one open, one domain-restricted (both owned by the exempt teacher)
  insert into classes (teacher_id, name, age_assertion_by, assertion_text_version)
  values (v_allow, 'vfy 0033 open', v_allow, 'vfy') returning * into v_class;
  insert into classes (teacher_id, name, expected_domain, age_assertion_by, assertion_text_version)
  values (v_allow, 'vfy 0033 district', 'vfy0033.example', v_allow, 'vfy') returning * into v_dclass;

  -- (2) REDEEM ROWS --------------------------------------------------------
  perform set_config('request.jwt.claims', json_build_object('sub', v_pending)::text, true);

  -- bad code
  begin perform redeem_join_code('ZZZZZZ');
  exception when others then v_bad_code := true; end;
  if not v_bad_code then raise exception 'FAIL redeem: bad code was accepted'; end if;

  -- domain-restricted class, wrong account (gmail user vs vfy0033.example)
  begin perform redeem_join_code(v_dclass.join_code);
  exception when others then
    get stacked diagnostics v_msg = message_text;
    if v_msg not like '%limited to%' then raise exception 'FAIL redeem domain msg: %', v_msg; end if;
    v_domain_refused := true;
  end;
  if not v_domain_refused then raise exception 'FAIL redeem: domain-restricted class admitted an outsider'; end if;
  -- ...and the refusal did NOT promote the caller (the whole point of D2)
  select role into v_role from users where id = v_pending;
  if v_role <> 'pending' then raise exception 'FAIL redeem: refusal still promoted to %', v_role; end if;

  -- happy path: promote + join in one call
  v_res := redeem_join_code(v_class.join_code);
  select role into v_role from users where id = v_pending;
  if v_role <> 'student' then raise exception 'FAIL redeem: no promotion (role=%)', v_role; end if;
  if (v_res->>'class_id')::uuid <> v_class.id then raise exception 'FAIL redeem: wrong class returned'; end if;
  select count(*) into v_cnt from class_members
   where class_id = v_class.id and student_id = v_pending and removed_at is null;
  if v_cnt <> 1 then raise exception 'FAIL redeem: membership rows = % (want 1)', v_cnt; end if;
  -- the promotion is audited
  if not exists (select 1 from audit_log
                  where actor_id = v_pending and action = 'user.promote_student') then
    raise exception 'FAIL redeem: promotion not audited';
  end if;

  -- idempotent re-call (already a student): no error, no duplicate membership
  perform redeem_join_code(v_class.join_code);
  select count(*) into v_cnt from class_members
   where class_id = v_class.id and student_id = v_pending;
  if v_cnt <> 1 then raise exception 'FAIL redeem: re-call duplicated membership (%)', v_cnt; end if;

  -- soft-deleted class refuses
  update classes set deleted_at = now() where id = v_dclass.id;
  begin perform redeem_join_code(v_dclass.join_code);
  exception when others then v_deleted_class := true; end;
  if not v_deleted_class then raise exception 'FAIL redeem: deleted class accepted'; end if;
  update classes set deleted_at = null where id = v_dclass.id;

  -- a TEACHER redeeming keeps their role (the 0027 §A demotion class, guarded)
  perform set_config('request.jwt.claims', json_build_object('sub', v_allow)::text, true);
  begin perform redeem_join_code(v_class.join_code);
  exception when others then v_teacher_refused := true; end;
  if not v_teacher_refused then raise exception 'FAIL redeem: a teacher was allowed to join as a student'; end if;
  select role into v_role from users where id = v_allow;
  if v_role <> 'teacher' then raise exception 'FAIL redeem: teacher demoted to %', v_role; end if;

  -- (3) CLAIM ROWS ---------------------------------------------------------
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_claimer, 'vfy0033-c@gmail.example', '{}'::jsonb);
  perform set_config('request.jwt.claims', json_build_object('sub', v_claimer)::text, true);

  -- missing attestation refuses
  begin perform claim_teacher('');
  exception when others then v_claim_noattest := true; end;
  if not v_claim_noattest then raise exception 'FAIL claim: empty attestation accepted'; end if;
  select role into v_role from users where id = v_claimer;
  if v_role <> 'pending' then raise exception 'FAIL claim: refusal promoted to %', v_role; end if;

  -- happy path
  perform claim_teacher('vfy-policy-1');
  select role into v_role from users where id = v_claimer;
  if v_role <> 'teacher' then raise exception 'FAIL claim: no promotion (role=%)', v_role; end if;
  if (select educator_attested_at is null or educator_attested_version <> 'vfy-policy-1'
        from users where id = v_claimer) then
    raise exception 'FAIL claim: attestation not recorded';
  end if;
  -- self-serve teachers are NOT cap-exempt
  if (select teacher_caps_exempt from users where id = v_claimer) then
    raise exception 'FAIL claim: self-serve teacher was made cap-exempt';
  end if;

  -- second call refuses (already set up)
  begin perform claim_teacher('vfy-policy-1');
  exception when others then v_claim_norole := true; end;
  if not v_claim_norole then raise exception 'FAIL claim: double-claim accepted'; end if;

  -- (4) CAPS AT PRODUCTION VALUES (P3 — fire them, do not assume them) ------
  -- class cap: 5 allowed, 6th refused
  for v_i in 1..5 loop
    perform create_class('vfy cap ' || v_i, null, 'vfy');
  end loop;
  begin perform create_class('vfy cap 6', null, 'vfy');
  exception when others then
    get stacked diagnostics v_msg = message_text;
    if v_msg not like '%limited to 5 classes%' then raise exception 'FAIL class cap msg: %', v_msg; end if;
    v_class_cap := true;
  end;
  if not v_class_cap then raise exception 'FAIL: the 5-class cap never fired'; end if;

  -- member cap: fill a capped teacher's class to 50, then refuse the 51st.
  -- The fillers are REAL accounts minted through the real trigger (the FK to
  -- users is what caught the first draft of this block using bare UUIDs) and
  -- promoted to student, because the cap counts class_members rows and the
  -- point of the row is the count, not the join path.
  select * into v_capclass from classes where teacher_id = v_claimer limit 1;
  for v_i in 1..50 loop
    declare v_filler uuid := gen_random_uuid();
    begin
      insert into auth.users (id, email, raw_user_meta_data)
      values (v_filler, 'vfy0033-f' || v_i || '@gmail.example', '{}'::jsonb);
      update users set role = 'student' where id = v_filler;
      insert into class_members (class_id, student_id) values (v_capclass.id, v_filler);
    end;
  end loop;
  insert into auth.users (id, email, raw_user_meta_data)
  values (v_member, 'vfy0033-m@gmail.example', '{}'::jsonb);
  perform set_config('request.jwt.claims', json_build_object('sub', v_member)::text, true);
  begin perform redeem_join_code(v_capclass.join_code);
  exception when others then
    get stacked diagnostics v_msg = message_text;
    if v_msg not like '%class is full%' then raise exception 'FAIL member cap msg: %', v_msg; end if;
    v_member_cap := true;
  end;
  if not v_member_cap then raise exception 'FAIL: the 50-member cap never fired'; end if;

  -- (5) PENDING CONTAINMENT (R4) -------------------------------------------
  -- v_member is still pending (its redeem was refused by the cap).
  select role into v_role from users where id = v_member;
  if v_role <> 'pending' then raise exception 'FAIL containment setup: role=%', v_role; end if;

  -- cannot author. NOTE the `set local role authenticated` (the 0013-0014 §D /
  -- 0020 idiom): this block runs as postgres, which BYPASSES RLS — the first
  -- draft asserted an unguarded INSERT and "failed" by succeeding, proving only
  -- that superusers ignore policies. The role switch is what makes the row real.
  begin
    execute 'set local role authenticated';
    begin
      insert into activities (owner_id, title, slug) values (v_member, 'nope', 'vfy-0033-nope');
    exception when others then v_pending_no_author := true;
    end;
    execute 'reset role';
  end;
  if not v_pending_no_author then raise exception 'FAIL containment: pending authored an activity'; end if;

  -- cannot join a class directly (join_class is student-only)
  begin perform join_class(v_class.join_code);
  exception when others then v_pending_no_join := true; end;
  if not v_pending_no_join then raise exception 'FAIL containment: pending joined via join_class'; end if;

  -- cannot create a class (current_user_is_teacher is false for pending)
  begin perform create_class('nope', null, 'vfy');
  exception when others then v_pending_no_class := true; end;
  if not v_pending_no_class then raise exception 'FAIL containment: pending created a class'; end if;

  -- is not a teacher by the helper every authoring policy consults
  if current_user_is_teacher() then
    raise exception 'FAIL containment: current_user_is_teacher() true for pending';
  end if;

  -- (6) RETENTION (R8) ------------------------------------------------------
  -- A never-redeemed pending account holds email + provider only, and the 0025
  -- dormancy derivation reaches it by account age (no membership rows to key
  -- off). Assert the row is minimal and that purge_soft_deleted does not choke
  -- on a pending row.
  if exists (select 1 from users
              where id = v_member and (display_name is not null and display_name <> '')) then
    raise exception 'FAIL retention: pending row carries a display_name it was not given';
  end if;
  perform purge_soft_deleted();

  raise notice 'verify-0033 §C: trigger=4/4 redeem=6/6 claim=4/4 caps=2/2 containment=5/5 retention=ok';
  raise exception 'EXPECTED ROLLBACK';
end
$vfy$;

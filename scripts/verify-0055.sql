-- verify-0055.sql — Activity Bank authors (migration 0055; activity-bank.md
-- BK-12, BK-13).
--
-- Run with `pnpm verify:auth --target live|local`. §B is a self-fixturing
-- EXPECTED-ROLLBACK block (P7).
--
--   §A — posture: the opt-in column; set_public_name and list_bank signed-in
--        only, definer, pinned; list_bank now returns author_name.
--   §B — a name shows ONLY after its owner opts in (a Google-filled
--        display_name does not); opt-out hides it again; email-shaped and
--        over-long names are refused; students cannot set one; a Bank copy can
--        never be listed (and list_bank never returns one); a colleague on the
--        allowlist lists their own activity; a self-attested teacher still
--        cannot.

-- @section A-catalog-posture
-- @expect-rows
select 'name_opt_in_column',
       exists (select 1 from information_schema.columns
                where table_name = 'users' and column_name = 'name_opt_in_at'
                  and is_nullable = 'YES'),
       'NULL until a teacher opts in; nobody is named by default';
select 'author_rpcs_signed_in_only_definer',
       (select bool_and(has_function_privilege('authenticated', p.oid, 'execute')
                        and not has_function_privilege('anon', p.oid, 'execute')
                        and p.prosecdef and p.proconfig @> array['search_path=public'])
               and count(*) = 2
          from pg_proc p where p.proname in ('set_public_name', 'list_bank')),
       'never anonymous; definer with a pinned search path';
select 'list_bank_returns_author_name',
       (select pg_get_function_result('list_bank()'::regprocedure) like '%author_name text%'),
       'the card''s author comes from the server, opted-in names only';

-- @section B-bank-authors
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_author    uuid := gen_random_uuid();
  v_colleague uuid := gen_random_uuid();
  v_stranger  uuid := gen_random_uuid();
  v_student   uuid := gen_random_uuid();
  v_doc       jsonb := '{"schemaVersion":2,"meta":{"title":"vfy","course":"Y7","activityType":"worksheet"},"sections":[]}'::jsonb;
  v_a         uuid;
  v_c         uuid;
  v_s         uuid;
  v_copy      uuid;
  v_name      text;
  v_raised    boolean;
  n           integer := 0;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  select u, 'vfy0055-' || row_number() over () || '@vfy0055.example', '{}'::jsonb
    from unnest(array[v_author, v_colleague, v_stranger, v_student]) u;
  -- a Google-filled name on the colleague, as self-serve signup would store it
  update users set role = 'teacher', teacher_caps_exempt = true, display_name = 'Author Name' where id = v_author;
  update users set role = 'teacher', teacher_caps_exempt = true, display_name = 'Google Full Name' where id = v_colleague;
  update users set role = 'teacher', teacher_caps_exempt = false where id = v_stranger;
  update users set role = 'student' where id = v_student;

  insert into activities (owner_id, title, slug, course, draft_content)
  values (v_author, 'vfy a', 'vfy-a', 'Y7', v_doc) returning id into v_a;
  insert into activities (owner_id, title, slug, course, draft_content)
  values (v_colleague, 'vfy c', 'vfy-c', 'Y7', v_doc) returning id into v_c;
  insert into activities (owner_id, title, slug, course, draft_content)
  values (v_stranger, 'vfy s', 'vfy-s', 'Y7', v_doc) returning id into v_s;

  -- B1 an allowlisted colleague lists their OWN activity (BK-12)
  perform set_config('request.jwt.claims', json_build_object('sub', v_colleague)::text, true);
  perform publish_activity(v_c);
  if set_activity_listing(v_c, true) <> 'public' then
    raise exception 'FAIL B1: a colleague could not list their own activity';
  end if;
  n := n + 1;

  -- B2 a self-attested teacher still cannot list
  perform set_config('request.jwt.claims', json_build_object('sub', v_stranger)::text, true);
  perform publish_activity(v_s);
  v_raised := false;
  begin perform set_activity_listing(v_s, true);
  exception when others then v_raised := sqlerrm = 'Only the Activity Bank''s curator can list activities'; end;
  if not v_raised then raise exception 'FAIL B2: a self-attested teacher listed'; end if;
  n := n + 1;

  -- B3 NO name before opting in — not even the Google-filled one
  select author_name into v_name from list_bank() where id = v_c;
  if not found or v_name is not null then
    raise exception 'FAIL B3: name before opt-in: %', v_name;
  end if;
  n := n + 1;

  -- B4 opting in shows the chosen name; opting out hides it again
  perform set_config('request.jwt.claims', json_build_object('sub', v_colleague)::text, true);
  perform set_public_name('  Ms Rivera  ');
  select author_name into v_name from list_bank() where id = v_c;
  if v_name is distinct from 'Ms Rivera'
     or (select name_opt_in_at from users where id = v_colleague) is null
     or not exists (select 1 from audit_log where action = 'user.set_public_name' and actor_id = v_colleague) then
    raise exception 'FAIL B4: opt-in shows %', v_name;
  end if;
  perform set_public_name('');
  select author_name into v_name from list_bank() where id = v_c;
  if v_name is not null or (select name_opt_in_at from users where id = v_colleague) is not null then
    raise exception 'FAIL B4: opt-out still shows %', v_name;
  end if;
  n := n + 1;

  -- B5 email-shaped and over-long names are refused; a student has none
  v_raised := false;
  begin perform set_public_name('me@school.example');
  exception when others then v_raised := sqlerrm = 'Use a name, not an email address'; end;
  if not v_raised then raise exception 'FAIL B5: an email was accepted'; end if;
  v_raised := false;
  begin perform set_public_name(repeat('x', 81));
  exception when others then v_raised := sqlerrm = 'A name is at most 80 characters'; end;
  if not v_raised then raise exception 'FAIL B5: an 81-character name was accepted'; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_student)::text, true);
  v_raised := false;
  begin perform set_public_name('A Student');
  exception when others then v_raised := sqlerrm = 'Only teachers have a public name'; end;
  if not v_raised then raise exception 'FAIL B5: a student set a public name'; end if;
  n := n + 1;

  -- B6 a Bank COPY can never be listed, even by an allowlisted teacher, and
  --    list_bank never returns one
  perform set_config('request.jwt.claims', json_build_object('sub', v_author)::text, true);
  perform publish_activity(v_a);
  perform set_activity_listing(v_a, true);
  perform set_config('request.jwt.claims', json_build_object('sub', v_colleague)::text, true);
  v_copy := copy_bank_activity(v_a);
  v_raised := false;
  begin perform set_activity_listing(v_copy, true);
  exception when others then v_raised := sqlerrm = 'A copy from the Activity Bank cannot be listed'; end;
  if not v_raised then raise exception 'FAIL B6: a copy was listed'; end if;
  -- belt: even a copy forced public by hand stays out of the Bank
  update activities set visibility = 'public' where id = v_copy;
  if exists (select 1 from list_bank() where id = v_copy) then
    raise exception 'FAIL B6: list_bank returned a copy';
  end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> B-bank-authors: %/6', n;
end
$vfy$;

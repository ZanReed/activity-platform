-- verify-0054.sql — the Activity Bank: list, browse, copy-on-use (migration
-- 0054; docs/design/activity-bank.md BK-1…BK-10).
--
-- Run with `pnpm verify:auth --target live|local`. §B is a self-fixturing
-- EXPECTED-ROLLBACK block: its own users, activities and glossary rows, real
-- functions, everything rolled back (P7).
--
--   §A — catalog posture: provenance columns; every Bank RPC signed-in only,
--        definer, pinned; the assessment helper is not client-callable;
--        can_read_activity / can_edit_activity are still owner-only (the
--        landmine 0042 names stays unwidened).
--   §B — the RLS attack list and the behaviour: who may list, what a teacher
--        sees, what a copy carries (the PUBLISHED version, never the draft),
--        assessments never listed or copied, the glossary fallback per term,
--        the slug ladder, and that the source stays unreadable to the copier.

-- @section A-catalog-posture
-- @expect-rows
select 'provenance_columns',
       (select count(*) = 2 from information_schema.columns
         where table_name = 'activities'
           and column_name in ('copied_from_activity_id', 'copied_from_version_id')
           and is_nullable = 'YES'),
       'a copy records its source activity and version; authored rows leave both NULL';
select 'bank_rpcs_signed_in_only_definer',
       (select bool_and(has_function_privilege('authenticated', p.oid, 'execute')
                        and not has_function_privilege('anon', p.oid, 'execute')
                        and p.prosecdef and p.proconfig @> array['search_path=public'])
               and count(*) = 5
          from pg_proc p where p.proname in ('is_bank_lister', 'set_activity_listing',
                                             'list_bank', 'get_bank_teacher_guide',
                                             'copy_bank_activity')),
       'never anonymous; definer with a pinned search path';
select 'assessment_helper_not_client_callable',
       not has_function_privilege('authenticated', 'bank_version_is_assessment(uuid)', 'execute')
       and not has_function_privilege('anon', 'bank_version_is_assessment(uuid)', 'execute'),
       'an internal predicate, read only inside the Bank RPCs';
select 'ownership_helpers_still_owner_only',
       (select pg_get_functiondef('can_read_activity(uuid)'::regprocedure) like '%a.owner_id = auth.uid()%')
       and (select pg_get_functiondef('can_edit_activity(uuid)'::regprocedure) like '%a.owner_id = auth.uid()%')
       and (select pg_get_functiondef('can_read_activity(uuid)'::regprocedure) not like '%visibility%'),
       'the Bank never widens the owner checks; it is definer RPCs with fixed column sets';

-- @section B-activity-bank
-- @expect-error EXPECTED ROLLBACK
do $vfy$
declare
  v_author  uuid := gen_random_uuid();
  v_teacher uuid := gen_random_uuid();
  v_student uuid := gen_random_uuid();
  v_pending uuid := gen_random_uuid();
  v_doc     jsonb := jsonb_build_object(
    'schemaVersion', 2,
    'meta', jsonb_build_object('title', 'vfy 0054', 'course', 'Y7', 'activityType', 'worksheet'),
    'sections', '[]'::jsonb,
    'teacherGuide', jsonb_build_object('blocks', jsonb_build_array(
      jsonb_build_object('id', gen_random_uuid(), 'type', 'paragraph',
                         'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'VFY_GUIDE'))))));
  v_listed  uuid;
  v_private uuid;
  v_quiz    uuid;
  v_copy    uuid;
  v_copy2   uuid;
  v_n       integer;
  v_g       jsonb;
  v_raised  boolean;
  n         integer := 0;
begin
  insert into auth.users (id, email, raw_user_meta_data)
  select u, 'vfy0054-' || row_number() over () || '@vfy0054.example', '{}'::jsonb
    from unnest(array[v_author, v_teacher, v_student, v_pending]) u;
  update users set role = 'teacher', teacher_caps_exempt = true where id = v_author;
  update users set role = 'teacher', teacher_caps_exempt = false where id = v_teacher;
  update users set role = 'student' where id = v_student;
  update users set role = 'pending' where id = v_pending;

  -- the author's three activities: listed-to-be, private, and a quiz
  insert into activities (owner_id, title, slug, course, draft_content, source_path, source_key)
  values (v_author, 'vfy listed', 'vfy-listed', 'Y7', v_doc, '712-vfy/01.md', 'act.vfy.listed')
  returning id into v_listed;
  insert into activities (owner_id, title, slug, course, draft_content)
  values (v_author, 'vfy private', 'vfy-private', 'Y7', v_doc) returning id into v_private;
  insert into activities (owner_id, title, slug, course, draft_content)
  values (v_author, 'vfy quiz', 'vfy-quiz', 'Y7',
          jsonb_set(v_doc, '{meta,activityType}', '"quiz"')) returning id into v_quiz;

  perform set_config('request.jwt.claims', json_build_object('sub', v_author)::text, true);

  -- B1 an unpublished activity cannot be listed
  v_raised := false;
  begin perform set_activity_listing(v_listed, true);
  exception when others then v_raised := sqlerrm = 'Publish this activity before listing it'; end;
  if not v_raised then raise exception 'FAIL B1: listed a draft'; end if;
  perform publish_activity(v_listed);
  perform publish_activity(v_private);
  perform publish_activity(v_quiz);
  -- call FIRST, check after: one SQL statement reads one snapshot, so a check
  -- written in the same IF as the call would see the row as it was before.
  if set_activity_listing(v_listed, true) <> 'public' then
    raise exception 'FAIL B1: listing returned the wrong state';
  end if;
  if (select visibility from activities where id = v_listed) <> 'public'
     or not exists (select 1 from audit_log where action = 'activity.bank_list' and target_id = v_listed) then
    raise exception 'FAIL B1: listing a published activity';
  end if;
  n := n + 1;

  -- B2 a quiz/exam is never listed
  v_raised := false;
  begin perform set_activity_listing(v_quiz, true);
  exception when others then v_raised := sqlerrm = 'Quizzes and exams are never listed in the Activity Bank'; end;
  if not v_raised then raise exception 'FAIL B2: listed a quiz'; end if;
  n := n + 1;

  -- B3 a self-attested teacher may not list, even their own published activity;
  --    nor may anyone list someone else's
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);
  v_raised := false;
  begin perform set_activity_listing(v_private, true);
  exception when others then v_raised := sqlerrm = 'Not your activity'; end;
  if not v_raised then raise exception 'FAIL B3: a teacher listed the author''s activity'; end if;
  n := n + 1;

  -- B4 who may browse: teachers yes; students and pending accounts no
  perform set_config('request.jwt.claims', json_build_object('sub', v_student)::text, true);
  v_raised := false;
  begin perform * from list_bank();
  exception when others then v_raised := sqlerrm = 'The Activity Bank is for teachers'; end;
  if not v_raised then raise exception 'FAIL B4: a student browsed the Bank'; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_pending)::text, true);
  v_raised := false;
  begin perform * from list_bank();
  exception when others then v_raised := sqlerrm = 'The Activity Bank is for teachers'; end;
  if not v_raised then raise exception 'FAIL B4: a pending account browsed the Bank'; end if;
  n := n + 1;

  -- B5 a teacher sees the listed activity and ONLY it, with its guide flag
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);
  if not exists (select 1 from list_bank() b where b.id = v_listed and b.has_guide and b.version_num = 1)
     or exists (select 1 from list_bank() b where b.id in (v_private, v_quiz)) then
    raise exception 'FAIL B5: what the Bank shows';
  end if;
  n := n + 1;

  -- B6 the guide reads for a listed activity; NULL (indistinguishable) otherwise
  v_g := get_bank_teacher_guide(v_listed);
  if v_g::text not like '%VFY_GUIDE%' or get_bank_teacher_guide(v_private) is not null
     or get_bank_teacher_guide(v_quiz) is not null then
    raise exception 'FAIL B6: the guide read';
  end if;
  n := n + 1;

  -- B7 the author keeps editing: a NEW DRAFT must never reach a copy
  update activities set draft_content = jsonb_set(v_doc, '{meta,title}', '"VFY_DRAFT_SECRET"')
   where id = v_listed;

  -- B8 the copy: owned by the teacher, published v1, the PUBLISHED content,
  --    private, no catalogue identity, provenance recorded, audited
  v_copy := copy_bank_activity(v_listed);
  if (select owner_id from activities where id = v_copy) <> v_teacher
     or (select status from activities where id = v_copy) <> 'published'
     or (select visibility from activities where id = v_copy) <> 'private'
     or (select source_path is not null or source_key is not null from activities where id = v_copy)
     or (select copied_from_activity_id from activities where id = v_copy) <> v_listed
     or (select v.content::text like '%VFY_DRAFT_SECRET%'
           from activities a join activity_versions v on v.id = a.current_version_id
          where a.id = v_copy)
     or (select v.content -> 'teacherGuide' is null
           from activities a join activity_versions v on v.id = a.current_version_id
          where a.id = v_copy)
     or (select version_num from activities a join activity_versions v on v.id = a.current_version_id
          where a.id = v_copy) <> 1
     or not exists (select 1 from audit_log where action = 'activity.bank_copy' and target_id = v_copy) then
    raise exception 'FAIL B8: the copy';
  end if;
  -- …and every owner surface now works for the teacher, because they own it
  if not can_edit_activity(v_copy) or not can_read_activity(v_copy) then
    raise exception 'FAIL B8: the teacher does not own their copy';
  end if;
  n := n + 1;

  -- B9 the SOURCE stays the author's: the copier still cannot read or edit it
  if can_read_activity(v_listed) or can_edit_activity(v_listed) then
    raise exception 'FAIL B9: copying widened access to the source';
  end if;
  n := n + 1;

  -- B10 the slug ladder: a second copy gets base-2
  v_copy2 := copy_bank_activity(v_listed);
  if (select slug from activities where id = v_copy2) <> 'vfy-listed-2' then
    raise exception 'FAIL B10: slug %', (select slug from activities where id = v_copy2);
  end if;
  n := n + 1;

  -- B11 unlisted, quiz, student: no copy
  v_raised := false;
  begin perform copy_bank_activity(v_private);
  exception when others then v_raised := sqlerrm = 'That activity is not in the Activity Bank'; end;
  if not v_raised then raise exception 'FAIL B11: copied an unlisted activity'; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_student)::text, true);
  v_raised := false;
  begin perform copy_bank_activity(v_listed);
  exception when others then v_raised := sqlerrm = 'The Activity Bank is for teachers'; end;
  if not v_raised then raise exception 'FAIL B11: a student copied'; end if;
  -- a listed activity later republished AS a quiz drops out of the Bank
  perform set_config('request.jwt.claims', json_build_object('sub', v_author)::text, true);
  update activities set draft_content = jsonb_set(v_doc, '{meta,activityType}', '"exam"')
   where id = v_listed;
  perform publish_activity(v_listed);
  perform set_config('request.jwt.claims', json_build_object('sub', v_teacher)::text, true);
  v_raised := false;
  begin perform copy_bank_activity(v_listed);
  exception when others then v_raised := sqlerrm = 'That activity is not in the Activity Bank'; end;
  if not v_raised or exists (select 1 from list_bank() b where b.id = v_listed) then
    raise exception 'FAIL B11: a republished exam stayed in the Bank';
  end if;
  n := n + 1;

  -- B12 the glossary fallback, per term: the copy owner's own entry wins,
  --     missing terms come from the source owner; the author's own reads
  --     are unchanged
  insert into glossary_entry (owner_id, term_id, term, body) values
    (v_author,  'gloss.vfy-a', 'vfy alpha', '[]'::jsonb),
    (v_author,  'gloss.vfy-b', 'vfy beta (author)', '[]'::jsonb),
    (v_teacher, 'gloss.vfy-b', 'vfy beta (teacher)', '[]'::jsonb);
  v_g := glossary_for_activity(v_copy);
  select count(*) into v_n from jsonb_array_elements(v_g -> 'entries') e
   where e ->> 'term_id' like 'gloss.vfy-%';
  if v_n <> 2
     or not (v_g::text like '%vfy alpha%' and v_g::text like '%vfy beta (teacher)%')
     or v_g::text like '%vfy beta (author)%' then
    raise exception 'FAIL B12: copy glossary %', v_g;
  end if;
  v_g := glossary_for_activity(v_private);
  if v_g::text like '%vfy beta (teacher)%' or v_g::text not like '%vfy beta (author)%' then
    raise exception 'FAIL B12: the author''s own glossary changed %', v_g;
  end if;
  n := n + 1;

  raise exception 'EXPECTED ROLLBACK >>> B-activity-bank: %/12', n;
end
$vfy$;

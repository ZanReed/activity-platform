-- seed-grading-check.sql — W-8's hello-world fixture: ONE pending rubric
-- check, so the grading worker's first suggestion is reachable without
-- role-playing a student through the viewer.
--
-- LOCAL STACK ONLY (it inserts into auth.users):
--   psql postgresql://postgres:postgres@127.0.0.1:54322/postgres \
--     -f scripts/seed-grading-check.sql
--
-- Owned by the dev user (same owner as seed-test-data.sql). Re-runnable: the
-- teardown removes the prior copy first (section_checks cascade carries
-- grades + suggestions with it).
--
-- After seeding, the remaining setup is the PROVIDER FLIP (W-8/W-9 — the
-- pilot's one-liner until a settings surface ships):
--   insert into grading_settings (teacher_id, provider)
--   values ('184464c4-8b8b-4820-aea5-51c34f361bfc', 'local_worker')
--   on conflict (teacher_id) do update set provider = excluded.provider;
\set ON_ERROR_STOP on
begin;

delete from public.section_checks
 where activity_id = 'a0000000-0000-4000-8000-000000000042';
delete from public.activities
 where id = 'a0000000-0000-4000-8000-000000000042';

-- A student account for the check to belong to (no class needed: the pilot's
-- local_worker path has no roster gate — EH-14 gates only platform_api).
insert into auth.users (id, email, raw_user_meta_data)
values ('a0000000-0000-4000-8000-0000000000ee', 'seed-grading-student@local.example', '{}'::jsonb)
on conflict (id) do nothing;
update public.users set role = 'student'
 where id = 'a0000000-0000-4000-8000-0000000000ee';

insert into public.activities (id, owner_id, title, slug, status)
values ('a0000000-0000-4000-8000-000000000042',
        '184464c4-8b8b-4820-aea5-51c34f361bfc',
        '[TEST] Grading worker hello world', 'zz-test-grading-worker', 'published');

insert into public.activity_versions (id, activity_id, version_num, content, created_by)
values ('a0000000-0000-4000-8000-0000000000d1'::uuid,
        'a0000000-0000-4000-8000-000000000042', 1,
        $json${
  "schemaVersion": 2,
  "meta": {"title": "[TEST] Grading worker hello world"},
  "sections": [
    {"id": "sec-1", "rows": [{"id": "a0000000-0000-4000-8000-0000000000f1", "columns": [
      {"id": "a0000000-0000-4000-8000-0000000000cc", "blocks": [
        {"id": "a0000000-0000-4000-8000-0000000000b1",
         "type": "essay",
         "prompt": [{"type": "text", "text": "Two shops sell juice: A is $5.40 for 3 L, B is $7.50 for 5 L. Which is cheaper per litre? Justify with unit rates."}],
         "rubric": {"criteria": [
           {"id": "a0000000-0000-4000-8000-0000000000e1", "label": "Method (unit rates computed)", "maxPoints": 3},
           {"id": "a0000000-0000-4000-8000-0000000000e2", "label": "Conclusion (correct comparison)", "maxPoints": 2}
         ]},
         "answer": [{"type": "text", "text": "A: 5.40/3 = $1.80/L. B: 7.50/5 = $1.50/L. B is cheaper. Full method marks need both divisions; conclusion marks need the comparison stated from them."}],
         "solution": [{"type": "text", "text": "Divide each price by its litres, then compare the two $/L values."}]}
      ]}
    ]}]}
  ]
}$json$::jsonb,
        '184464c4-8b8b-4820-aea5-51c34f361bfc');

update public.activities
   set current_version_id = 'a0000000-0000-4000-8000-0000000000d1'::uuid
 where id = 'a0000000-0000-4000-8000-000000000042';

insert into public.section_checks
  (student_id, activity_id, activity_version_id, section_id, attempt_number,
   responses, verdicts)
values ('a0000000-0000-4000-8000-0000000000ee',
        'a0000000-0000-4000-8000-000000000042',
        'a0000000-0000-4000-8000-0000000000d1'::uuid,
        'sec-1', 1,
        '{"freeText": {"a0000000-0000-4000-8000-0000000000b1": "A costs 5.40 and B costs 7.50 so A is cheaper because it is less money."}}'::jsonb,
        '{}'::jsonb);

commit;

select 'seeded: one pending rubric check on [TEST] Grading worker hello world' as done;

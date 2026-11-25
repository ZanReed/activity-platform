-- verify-0105.sql — an index under every single-column foreign key in public
-- (migration 0105; code review 2026-11-26, D6). Run with
-- `pnpm verify:auth --target live|local --only verify-0105`.
-- Catalog reads only; nothing is written (P7 has no residue to own).
--
-- §A states the RULE, not a list: no single-column foreign key in public whose
-- column leads no index a delete can use (a partial index counts only when its
-- predicate is `col IS NOT NULL`), the dead `assignments` table excepted. A hand-kept list is what the next table quietly
-- escapes (P4), so a later migration that adds an unindexed foreign key turns
-- this row red, which is the point. §B checks the nine the review named
-- by name, so a red §A row still says which delete path is exposed.

-- @section A-rule
-- @expect-rows
select 'no_unindexed_fk',
       count(*) = 0,
       coalesce('unindexed: ' || string_agg(c.conrelid::regclass || '.' || a.attname, ', '
                                            order by c.conrelid::regclass::text, a.attname),
                'every single-column foreign key in public leads an index')
from pg_constraint c
join pg_attribute a on a.attrelid = c.conrelid and a.attnum = c.conkey[1]
where c.contype = 'f'
  and c.connamespace = 'public'::regnamespace
  and array_length(c.conkey, 1) = 1
  -- The dead assignments table: retirement filed in TODOS, not indexed (0105).
  and c.conrelid::regclass::text <> 'assignments'
  and not exists (select 1 from pg_index i
                   where i.indrelid = c.conrelid and i.indkey[0] = c.conkey[1]
                     -- a partial index counts only when a lookup by the column
                     -- implies its predicate (`col IS NOT NULL`)
                     and (i.indpred is null
                          or pg_get_expr(i.indpred, i.indrelid) = '(' || quote_ident(a.attname) || ' IS NOT NULL)'));
-- P3: a rule that examines nothing passes vacuously. Before 0105 the row above
-- was red on live with 19 names in it (read 2026-11-26); this row makes sure
-- it is still looking at the same population.
select 'rule_is_not_vacuous',
       count(*) >= 87,
       'the rule examined ' || count(*) || ' single-column foreign keys (87 on live 2026-11-26, 19 of them unindexed and 2 partial-only before 0105)'
from pg_constraint c
where c.contype = 'f'
  and c.connamespace = 'public'::regnamespace
  and array_length(c.conkey, 1) = 1;

-- @section B-named
-- @expect-rows
select 'review_d6_nine_indexed',
       bool_and(exists (select 1 from pg_index i
                         join pg_attribute a on a.attrelid = i.indrelid and a.attnum = i.indkey[0]
                         where i.indrelid = t.tbl::regclass and a.attname = t.col)),
       'dol_pass.check_id/.version_id, mixed_session_items.student_id, class_activities.activity_id, '
       || 'practice_sessions.class_id, dol_practice_sessions.activity_id/.version_id, '
       || 'help_requests.activity_id, work_photos.activity_id each lead an index'
from (values ('public.dol_pass', 'check_id'),
             ('public.dol_pass', 'version_id'),
             ('public.mixed_session_items', 'student_id'),
             ('public.class_activities', 'activity_id'),
             ('public.practice_sessions', 'class_id'),
             ('public.dol_practice_sessions', 'activity_id'),
             ('public.dol_practice_sessions', 'version_id'),
             ('public.help_requests', 'activity_id'),
             ('public.work_photos', 'activity_id')) as t(tbl, col);
select 'indexes_are_valid',
       count(*) = 21 and bool_and(i.indisvalid and i.indisready),
       count(*) || ' of the 21 indexes 0105 creates exist, all valid and ready'
from pg_index i
join pg_class x on x.oid = i.indexrelid
where x.relnamespace = 'public'::regnamespace
  and x.relname in ('dol_pass_check_id_idx', 'dol_pass_version_id_idx',
                    'mixed_session_items_student_id_idx', 'class_activities_activity_id_idx',
                    'practice_sessions_class_id_idx', 'dol_practice_sessions_activity_id_idx',
                    'dol_practice_sessions_version_id_idx', 'help_requests_activity_id_idx',
                    'work_photos_activity_id_idx', 'activities_copied_from_version_id_idx',
                    'class_activities_added_by_idx', 'class_probes_opened_by_idx',
                    'class_hook_use_marked_by_idx', 'mixed_sessions_revision_idx',
                    'dol_pass_granted_by_idx', 'help_requests_activity_version_id_idx',
                    'help_requests_ended_by_teacher_idx', 'photo_handoffs_activity_id_idx',
                    'photo_handoffs_activity_version_id_idx',
                    'class_members_student_id_idx', 'classes_teacher_id_idx');

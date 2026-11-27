# Function index — GENERATED, do not edit

Every function the migrations leave live in `public`, through **0109**:
230 overloads of 229 names; 42 return row sets,
34 are `security invoker`, 126 names are called from the code, and
26 names have been defined three or more times. Written by `pnpm db:index`; CI fails
when it is stale (`scripts/tests/function-index.test.mjs`). The parser and its limits:
[scripts/lib/migrations.mjs](../scripts/lib/migrations.mjs). Design: review C1,
[database-snapshot-and-types.md](design/database-snapshot-and-types.md).

Columns: arguments (`?` = has a default) · what it returns · definer or invoker · where the **latest**
definition starts (the live body) · how many `create function` statements have named it · the
`scripts/verify-*.sql` files that name it · who calls the NAME over PostgREST (`—` = only other
functions, triggers or cron; both overloads of an overloaded name show the same callers).

| function | returns | security | latest definition | defined | verify | called from |
|---|---|---|---|---|---|---|
| `activities_provenance_guard()` | trigger | invoker | [0066_mixed_practice.sql:103](../supabase/migrations/0066_mixed_practice.sql#L103) | 2 | 0057 | — |
| `activity_first_tries(p_activity_id uuid)` | jsonb | definer | [0062_first_tries.sql:54](../supabase/migrations/0062_first_tries.sql#L54) | 1 | 0062 | app |
| `activity_progress(p_activity_id uuid)` | jsonb | definer | [0108_grid_and_panel_costs.sql:224](../supabase/migrations/0108_grid_and_panel_costs.sql#L224) | 7 | 0061, 0064, 0075, 0096, 0097, 0099, 0108 | app |
| `analytics_day(p_at timestamp with time zone, p_zone text)` | date | invoker | [0036_check_rollup.sql:118](../supabase/migrations/0036_check_rollup.sql#L118) | 1 | 0036, 0109 | — |
| `analytics_default_zone()` | text | invoker | [0036_check_rollup.sql:109](../supabase/migrations/0036_check_rollup.sql#L109) | 1 | 0036, 0109 | — |
| `analytics_rolled_boundary()` | timestamp with time zone | invoker | [0036_check_rollup.sql:206](../supabase/migrations/0036_check_rollup.sql#L206) | 1 | 0036, 0109 | — |
| `ask_teacher(p_version_id uuid, p_section_id text)` | jsonb | definer | [0090_help_requests.sql:229](../supabase/migrations/0090_help_requests.sql#L229) | 1 | 0090 | app |
| `bank_version_is_assessment(p_version_id uuid)` | boolean | definer | [0054_activity_bank.sql:94](../supabase/migrations/0054_activity_bank.sql#L94) | 1 | 0054 | — |
| `can_access_assignment(p_assignment_id uuid)` | boolean | invoker | [0009_security_housekeeping.sql:187](../supabase/migrations/0009_security_housekeeping.sql#L187) | 2 | 0109 | — |
| `can_edit_activity(p_activity_id uuid)` | boolean | invoker | [0009_security_housekeeping.sql:172](../supabase/migrations/0009_security_housekeeping.sql#L172) | 2 | 0034, 0037, 0042, 0054, 0093, image-storage | — |
| `can_read_activity(p_activity_id uuid)` | boolean | invoker | [0009_security_housekeeping.sql:157](../supabase/migrations/0009_security_housekeeping.sql#L157) | 2 | 0020, 0030, 0034, 0036, 0042, 0043, 0054, 0061, 0093, 0109 | — |
| `claim_grade_suggestions(p_limit? integer, p_lease_minutes? integer, p_prompt_rev? integer, p_schema_rev? integer, p_model_id? text, p_study? boolean, p_study_check_ids? uuid[], p_teacher_id? uuid)` | jsonb | definer | [0042_grade_suggestions.sql:552](../supabase/migrations/0042_grade_suggestions.sql#L552) | 1 | 0042, 0096 | worker |
| `claim_teacher(p_attestation_version text)` | jsonb | definer | [0033_pending_admission.sql:259](../supabase/migrations/0033_pending_admission.sql#L259) | 1 | 0033 | app |
| `class_gradebook(p_class_id uuid)` | jsonb | definer | [0102_class_gradebook.sql:58](../supabase/migrations/0102_class_gradebook.sql#L58) | 1 | 0102 | app |
| `class_help_open(p_class_id uuid)` | jsonb | definer | [0090_help_requests.sql:341](../supabase/migrations/0090_help_requests.sql#L341) | 1 | 0090 | app |
| `class_local_date(p_class_id uuid)` | date | definer | [0087_class_activity_due.sql:118](../supabase/migrations/0087_class_activity_due.sql#L118) | 1 | 0087 | app |
| `class_misconceptions(p_class_id uuid, p_activity_id? uuid)` | jsonb | definer | [0064_read_path_costs.sql:567](../supabase/migrations/0064_read_path_costs.sql#L567) | 2 | 0061, 0064 | app |
| `class_plan(p_class_id uuid, p_from date, p_to date)` | jsonb | definer | [0092_review_period_reads.sql:91](../supabase/migrations/0092_review_period_reads.sql#L91) | 2 | 0088, 0092 | app |
| `class_plan_begin(p_class_id uuid)` | date | definer | [0088_period_planner.sql:218](../supabase/migrations/0088_period_planner.sql#L218) | 1 | 0088 | — |
| `class_plan_check_day(p_class_id uuid, p_today date, p_on_date date, p_adding boolean)` | void | definer | [0088_period_planner.sql:246](../supabase/migrations/0088_period_planner.sql#L246) | 1 | 0088 | — |
| `class_plan_limit(p_class_id uuid, p_today date)` | date | definer | [0088_period_planner.sql:131](../supabase/migrations/0088_period_planner.sql#L131) | 1 | 0088 | — |
| `class_plan_prune(p_class_id uuid, p_today date)` | void | definer | [0088_period_planner.sql:109](../supabase/migrations/0088_period_planner.sql#L109) | 1 | 0088 | — |
| `class_plan_visible(p_activity_id uuid)` | boolean | definer | [0088_period_planner.sql:144](../supabase/migrations/0088_period_planner.sql#L144) | 1 | 0088 | — |
| `class_progress(p_class_id uuid)` | jsonb | definer | [0108_grid_and_panel_costs.sql:41](../supabase/migrations/0108_grid_and_panel_costs.sql#L41) | 7 | 0061, 0064, 0075, 0097, 0099, 0108 | app |
| `class_student_work(p_class_id uuid, p_student_id uuid, p_activity_id uuid)` | jsonb | definer | [0099_photo_pilot.sql:727](../supabase/migrations/0099_photo_pilot.sql#L727) | 4 | 0061, 0062, 0097, 0099 | app |
| `class_today(p_class_id uuid)` | jsonb | definer | [0092_review_period_reads.sql:156](../supabase/migrations/0092_review_period_reads.sql#L156) | 3 | 0082, 0087, 0088, 0092 | app |
| `class_unit_tracker(p_class_id uuid)` | jsonb | definer | [0074_unit_tracker.sql:269](../supabase/migrations/0074_unit_tracker.sql#L269) | 1 | 0074 | app |
| `close_fact_probe(p_probe_id uuid)` | jsonb | definer | [0045_fact_probe.sql:763](../supabase/migrations/0045_fact_probe.sql#L763) | 1 | 0045, 0048, 0050, 0051, 0068 | app |
| `confirm_grade_suggestion(p_suggestion_id uuid, p_expected_updated_at timestamp with time zone, p_criteria jsonb, p_general_feedback text, p_struck_mis? jsonb)` | jsonb | definer | [0042_grade_suggestions.sql:1100](../supabase/migrations/0042_grade_suggestions.sql#L1100) | 1 | 0042 | app |
| `copy_bank_activity(p_activity_id uuid)` | uuid | definer | [0088_period_planner.sql:37](../supabase/migrations/0088_period_planner.sql#L37) | 2 | 0054, 0055, 0057, 0088 | app |
| `create_class(p_name text, p_expected_domain text, p_assertion_text_version text, p_includes_under_13? boolean)` | jsonb | definer | [0053_class_age_statement.sql:52](../supabase/migrations/0053_class_age_statement.sql#L52) | 3 | 0013-0014, 0027, 0033, 0053 | app, scripts |
| `current_user_is_admin()` | boolean | definer | [0018_users_policy_recursion.sql:67](../supabase/migrations/0018_users_policy_recursion.sql#L67) | 1 | — | — |
| `current_user_is_teacher()` | boolean | definer | [0013_student_identity.sql:114](../supabase/migrations/0013_student_identity.sql#L114) | 1 | 0013-0014, 0033 | — |
| `discard_work_photo(p_id uuid)` | boolean | definer | [0094_photo_attach.sql:93](../supabase/migrations/0094_photo_attach.sql#L93) | 1 | 0094 | viewer, scripts |
| `dol_optional_block(p_section jsonb, p_block_id text)` | boolean | invoker | [0096_photo_grading.sql:493](../supabase/migrations/0096_photo_grading.sql#L493) | 4 | 0075, 0094, 0096 | — |
| `dol_pass_skill(p_activity_id uuid)` | text | definer | [0070_dol_retake.sql:128](../supabase/migrations/0070_dol_retake.sql#L128) | 1 | 0070, 0102, 0106 | — |
| `dol_pass_status(p_activity_id uuid)` | table(student_id, source, passed_at) | definer | [0070_dol_retake.sql:530](../supabase/migrations/0070_dol_retake.sql#L530) | 1 | 0070, 0106 | — |
| `dol_pass_status_json(p_activity_id uuid)` | jsonb | invoker | [0106_rowset_reads_json.sql:105](../supabase/migrations/0106_rowset_reads_json.sql#L105) | 1 | 0106 | app |
| `dol_practice_cap()` | integer | definer | [0073_dol_practice_items.sql:61](../supabase/migrations/0073_dol_practice_items.sql#L61) | 1 | 0073, 0077 | — |
| `dol_practice_item_for_check(p_session_id uuid, p_seq integer)` | jsonb | definer | [0072_dol_targeted_practice.sql:243](../supabase/migrations/0072_dol_targeted_practice.sql#L243) | 1 | 0072 | edge |
| `dol_practice_repeat_row(p_session_id uuid, p_item_id text, p_rows integer)` | integer | invoker | [0077_dol_practice_repeat.sql:21](../supabase/migrations/0077_dol_practice_repeat.sql#L21) | 1 | 0077 | — |
| `dol_practice_session_payload(p_session_id uuid)` | jsonb | definer | [0072_dol_targeted_practice.sql:99](../supabase/migrations/0072_dol_targeted_practice.sql#L99) | 1 | 0072 | — |
| `dol_zone(p_activity_id uuid)` | text | definer | [0070_dol_retake.sql:107](../supabase/migrations/0070_dol_retake.sql#L107) | 1 | 0070 | — |
| `end_help(p_request_id uuid)` | jsonb | definer | [0090_help_requests.sql:400](../supabase/migrations/0090_help_requests.sql#L400) | 1 | 0090 | app |
| `end_photo_handoff(p_handoff_id uuid)` | void | definer | [0095_photo_handoff.sql:306](../supabase/migrations/0095_photo_handoff.sql#L306) | 1 | 0095 | viewer, scripts |
| `fact_attempt_judgment(p_rt_ms integer, p_typed text, p_skipped boolean, p_interrupted boolean, p_correct boolean, p_modality text, p_baseline_keyboard integer, p_baseline_keypad integer, p_criterion_ms numeric, p_ceiling_ms numeric)` | text | invoker | [0050_fact_sprint.sql:179](../supabase/migrations/0050_fact_sprint.sql#L179) | 1 | 0050 | — |
| `fact_class_zone(p_class_id uuid)` | text | definer | [0063_zone_name_lookup.sql:87](../supabase/migrations/0063_zone_name_lookup.sql#L87) | 2 | 0050, 0063, 0087, 0088, 0090, 0108 | — |
| `fact_probe_allocate(p_rev text, p_grammar integer, p_year integer)` | table(family_id, n_items, part) | definer | [0047_fact_probe_two_parts.sql:395](../supabase/migrations/0047_fact_probe_two_parts.sql#L395) | 2 | 0045, 0047 | — |
| `fact_probe_allocate_single(p_rev text, p_grammar integer, p_year integer)` | table(family_id, n_items) | definer | [0047_fact_probe_two_parts.sql:260](../supabase/migrations/0047_fact_probe_two_parts.sql#L260) | 1 | 0047 | — |
| `fact_probe_entry(p_code text)` | jsonb | definer | [0047_fact_probe_two_parts.sql:588](../supabase/migrations/0047_fact_probe_two_parts.sql#L588) | 2 | 0045, 0047, 0048 | app |
| `fact_probe_family_parts(p_rev text, p_grammar integer)` | table(family_id, part) | definer | [0047_fact_probe_two_parts.sql:375](../supabase/migrations/0047_fact_probe_two_parts.sql#L375) | 1 | 0047 | — |
| `fact_probe_judged(p_probe_id uuid, p_student_id? uuid)` | table(session_id, student_id, seq, family_id, judgment, counted_ms, flagged) | definer | [0065_fact_judged_per_student.sql:39](../supabase/migrations/0065_fact_judged_per_student.sql#L39) | 2 | 0045, 0050, 0065 | — |
| `fact_probe_overview(p_class_id uuid)` | jsonb | definer | [0048_fact_practice_prune.sql:272](../supabase/migrations/0048_fact_practice_prune.sql#L272) | 3 | 0045, 0047, 0048 | app |
| `fact_probe_results(p_probe_id uuid)` | jsonb | definer | [0048_fact_practice_prune.sql:353](../supabase/migrations/0048_fact_practice_prune.sql#L353) | 2 | 0045, 0048 | app |
| `fact_probe_stat(p_probe_id uuid)` | jsonb | definer | [0046_fact_probe_family_groups.sql:40](../supabase/migrations/0046_fact_probe_family_groups.sql#L40) | 2 | 0045, 0046 | — |
| `fact_scope_insert_only()` | trigger | invoker | [0044_fact_scope_mirror.sql:145](../supabase/migrations/0044_fact_scope_mirror.sql#L145) | 1 | 0044, 0047, 0049 | — |
| `fact_scope_sprint_ok(s jsonb)` | boolean | invoker | [0049_fact_scope_sprint_keys.sql:40](../supabase/migrations/0049_fact_scope_sprint_keys.sql#L40) | 1 | 0049 | — |
| `fact_sprint_basis(p_class_id uuid)` | table(reason, registry_rev, fact_grammar_rev, year_level) | definer | [0050_fact_sprint.sql:609](../supabase/migrations/0050_fact_sprint.sql#L609) | 1 | 0050 | — |
| `fact_sprint_best(p_class_id uuid, p_student_id uuid)` | integer | definer | [0064_read_path_costs.sql:35](../supabase/migrations/0064_read_path_costs.sql#L35) | 1 | 0064 | — |
| `fact_sprint_build(p_class_id uuid, p_student_id uuid, p_rev text, p_grammar integer, p_year integer, p_today date)` | table(fact_id, family_id, kind, pick) | definer | [0050_fact_sprint.sql:539](../supabase/migrations/0050_fact_sprint.sql#L539) | 1 | 0050 | — |
| `fact_sprint_entry(p_code text, p_start? boolean)` | jsonb | definer | [0064_read_path_costs.sql:64](../supabase/migrations/0064_read_path_costs.sql#L64) | 2 | 0050, 0051, 0064, 0068 | app |
| `fact_sprint_families(p_class_id uuid, p_student_id uuid, p_rev text, p_grammar integer, p_year integer)` | table(family_id, name, ord, criterion_s, strategy, label, accuracy_bar, fluency_bar, mode, work_rank, working) | definer | [0065_fact_judged_per_student.sql:150](../supabase/migrations/0065_fact_judged_per_student.sql#L150) | 2 | 0050, 0051, 0065, 0068 | — |
| `fact_sprint_log(p_class_id uuid, p_student_id uuid)` | table(fact_id, family_id, at, seq, day, judgment, source) | definer | [0065_fact_judged_per_student.sql:111](../supabase/migrations/0065_fact_judged_per_student.sql#L111) | 2 | 0050, 0065 | — |
| `fact_sprint_overview(p_class_id uuid)` | jsonb | definer | [0051_fact_sprint_overview.sql:21](../supabase/migrations/0051_fact_sprint_overview.sql#L21) | 1 | 0051 | app |
| `fact_sprint_payload(p_session_id uuid)` | jsonb | definer | [0050_fact_sprint.sql:718](../supabase/migrations/0050_fact_sprint.sql#L718) | 1 | 0050 | — |
| `fact_sprint_score(p_session_id uuid)` | table(quick_right, best_before) | definer | [0050_fact_sprint.sql:690](../supabase/migrations/0050_fact_sprint.sql#L690) | 1 | 0050, 0064 | — |
| `fact_sprint_state(p_class_id uuid, p_student_id uuid, p_rev text, p_grammar integer, p_year integer)` | table(fact_id, family_id, fact_ord, seen, asked, missed, step, due_day) | definer | [0050_fact_sprint.sql:420](../supabase/migrations/0050_fact_sprint.sql#L420) | 1 | 0050 | — |
| `finalise_fact_probe(p_probe_id uuid, p_auto boolean)` | jsonb | definer | [0045_fact_probe.sql:579](../supabase/migrations/0045_fact_probe.sql#L579) | 1 | 0045 | — |
| `finish_mixed_session(p_session_id uuid)` | jsonb | definer | [0091_review_period.sql:1265](../supabase/migrations/0091_review_period.sql#L1265) | 2 | 0066, 0091 | app |
| `generate_join_code()` | text | invoker | [0033_pending_admission.sql:91](../supabase/migrations/0033_pending_admission.sql#L91) | 3 | 0013-0014, 0033 | — |
| `get_activity_analytics(p_activity_id uuid)` | jsonb | definer | [0064_read_path_costs.sql:774](../supabase/migrations/0064_read_path_costs.sql#L774) | 3 | 0026, 0035, 0036, 0064 | app, scripts |
| `get_activity_public_meta(p_activity_id uuid)` | table(title, teacher_name) | definer | [0021_display_name_privacy.sql:90](../supabase/migrations/0021_display_name_privacy.sql#L90) | 2 | 0017, 0021, 0028 | edge |
| `get_activity_version_for_check(p_activity_id uuid, p_version_id uuid)` | table(version_id, version_num, is_current, current_version_id) | definer | [0020_section_checks.sql:144](../supabase/migrations/0020_section_checks.sql#L144) | 1 | 0020 | edge |
| `get_bank_teacher_guide(p_activity_id uuid)` | jsonb | definer | [0054_activity_bank.sql:213](../supabase/migrations/0054_activity_bank.sql#L213) | 1 | 0054 | app |
| `get_class_public_meta(p_join_code text)` | table(name) | definer | [0030_class_activities.sql:216](../supabase/migrations/0030_class_activities.sql#L216) | 1 | 0017, 0028, 0030 | edge |
| `get_grading_assist_status()` | jsonb | definer | [0042_grade_suggestions.sql:1381](../supabase/migrations/0042_grade_suggestions.sql#L1381) | 1 | 0042 | app |
| `get_my_released_feedback(p_activity_id uuid)` | table(block_id, criteria, general_feedback, graded_at, attempt_number, activity_version_id, has_grader, stale) | definer | [0096_photo_grading.sql:646](../supabase/migrations/0096_photo_grading.sql#L646) | 2 | 0034, 0096 | app |
| `get_published_activity(p_activity_id uuid)` | table(version_id, version_num, title) | definer | [0017_read_api.sql:74](../supabase/migrations/0017_read_api.sql#L74) | 1 | 0017 | edge |
| `glossary_for_activity(p_activity_id uuid)` | jsonb | definer | [0054_activity_bank.sql:326](../supabase/migrations/0054_activity_bank.sql#L326) | 2 | 0043, 0054 | app |
| `grade_suggestions(p_activity_id uuid)` | jsonb | invoker | [0104_grading_queue_json.sql:69](../supabase/migrations/0104_grading_queue_json.sql#L69) | 1 | 0104 | app |
| `grades_touch_and_audit()` | trigger | definer | [0010_grades.sql:104](../supabase/migrations/0010_grades.sql#L104) | 1 | — | — |
| `grading_queue(p_activity_id uuid)` | jsonb | invoker | [0104_grading_queue_json.sql:49](../supabase/migrations/0104_grading_queue_json.sql#L49) | 1 | 0104 | app |
| `grading_quota_state(p_teacher uuid, p_quota_microdollars bigint)` | jsonb | definer | [0042_grade_suggestions.sql:474](../supabase/migrations/0042_grade_suggestions.sql#L474) | 1 | 0042 | — |
| `hand_grade_owed(p_type text, p_check_id uuid, p_block_id uuid, p_photos_on boolean, p_in_dol boolean)` | boolean | invoker | [0097_photo_not_owed_while_off.sql:33](../supabase/migrations/0097_photo_not_owed_while_off.sql#L33) | 1 | 0097, 0104 | — |
| `handle_new_auth_user()` | trigger | definer | [0033_pending_admission.sql:124](../supabase/migrations/0033_pending_admission.sql#L124) | 5 | 0013-0014, 0020, 0021, 0027, 0033 | — |
| `handoff_confirm(p_code text, p_photo_id uuid)` | integer | definer | [0095_photo_handoff.sql:419](../supabase/migrations/0095_photo_handoff.sql#L419) | 1 | 0095 | edge |
| `handoff_peek(p_code text)` | jsonb | definer | [0095_photo_handoff.sql:337](../supabase/migrations/0095_photo_handoff.sql#L337) | 1 | 0095 | edge |
| `handoff_release(p_code text, p_photo_id uuid)` | void | definer | [0095_photo_handoff.sql:456](../supabase/migrations/0095_photo_handoff.sql#L456) | 1 | 0095 | edge |
| `handoff_reserve(p_code text)` | jsonb | definer | [0095_photo_handoff.sql:374](../supabase/migrations/0095_photo_handoff.sql#L374) | 1 | 0095 | edge |
| `handoff_row_for(p_code text)` | photo_handoffs | definer | [0095_photo_handoff.sql:207](../supabase/migrations/0095_photo_handoff.sql#L207) | 1 | 0095 | — |
| `help_allowed(p_content jsonb, p_section_id text)` | boolean | invoker | [0090_help_requests.sql:171](../supabase/migrations/0090_help_requests.sql#L171) | 1 | — | — |
| `help_open_rows(p_activity_id uuid)` | setof help_requests | definer | [0090_help_requests.sql:150](../supabase/migrations/0090_help_requests.sql#L150) | 1 | 0090 | — |
| `help_target_classes(p_activity_id uuid)` | setof uuid | definer | [0090_help_requests.sql:126](../supabase/migrations/0090_help_requests.sql#L126) | 1 | 0090 | — |
| `iana_zone_is_valid(p_zone text)` | boolean | definer | [0063_zone_name_lookup.sql:61](../supabase/migrations/0063_zone_name_lookup.sql#L61) | 1 | 0063 | — |
| `is_bank_lister()` | boolean | definer | [0054_activity_bank.sql:78](../supabase/migrations/0054_activity_bank.sql#L78) | 1 | 0054 | app |
| `is_class_member(p_class_id uuid)` | boolean | definer | [0014_classes.sql:127](../supabase/migrations/0014_classes.sql#L127) | 1 | 0013-0014, 0109 | — |
| `is_class_teacher(p_class_id uuid)` | boolean | definer | [0027_admission_gate_hardening.sql:119](../supabase/migrations/0027_admission_gate_hardening.sql#L119) | 2 | 0013-0014, 0092, 0102, 0109 | — |
| `is_manually_graded_type(p_type text)` | boolean | invoker | [0096_photo_grading.sql:41](../supabase/migrations/0096_photo_grading.sql#L41) | 1 | 0096 | — |
| `join_class(p_join_code text)` | jsonb | definer | [0033_pending_admission.sql:387](../supabase/migrations/0033_pending_admission.sql#L387) | 3 | 0013-0014, 0025, 0027, 0030, 0033 | app, scripts |
| `list_bank()` | table(id, title, description, course, unit, tags, pedagogical_role, activity_type, source_path, has_guide, version_num, published_at, author_name) | definer | [0056_bank_teaching_order.sql:21](../supabase/migrations/0056_bank_teaching_order.sql#L21) | 3 | 0054, 0055, 0056, 0106 | — |
| `list_bank_json()` | jsonb | invoker | [0106_rowset_reads_json.sql:41](../supabase/migrations/0106_rowset_reads_json.sql#L41) | 1 | 0106 | app |
| `list_class_activities()` | table(class_id, activity_id, title, added_at, due_on, class_today) | definer | [0087_class_activity_due.sql:81](../supabase/migrations/0087_class_activity_due.sql#L81) | 2 | 0030, 0087, 0106 | — |
| `list_class_activities_json()` | jsonb | invoker | [0106_rowset_reads_json.sql:73](../supabase/migrations/0106_rowset_reads_json.sql#L73) | 1 | 0106 | app |
| `list_class_members(p_class_id uuid)` | table(student_id, display_name, email, joined_at, removed_at) | definer | [0014_classes.sql:265](../supabase/migrations/0014_classes.sql#L265) | 1 | 0013-0014, 0106 | — |
| `list_class_members_json(p_class_id uuid)` | jsonb | invoker | [0106_rowset_reads_json.sql:89](../supabase/migrations/0106_rowset_reads_json.sql#L89) | 1 | 0106 | app |
| `list_deleted_activities()` | table(id, title, deleted_at, purge_after) | definer | [0086_restore_class_and_recently_deleted.sql:87](../supabase/migrations/0086_restore_class_and_recently_deleted.sql#L87) | 1 | 0086, 0106 | — |
| `list_deleted_activities_json()` | jsonb | invoker | [0106_rowset_reads_json.sql:137](../supabase/migrations/0106_rowset_reads_json.sql#L137) | 1 | 0106 | app |
| `list_deleted_classes()` | table(id, name, deleted_at) | definer | [0086_restore_class_and_recently_deleted.sql:69](../supabase/migrations/0086_restore_class_and_recently_deleted.sql#L69) | 1 | 0086, 0106 | — |
| `list_deleted_classes_json()` | jsonb | invoker | [0106_rowset_reads_json.sql:121](../supabase/migrations/0106_rowset_reads_json.sql#L121) | 1 | 0106 | app |
| `list_grade_suggestions(p_activity_id uuid)` | table(suggestion_id, check_id, block_id, status, machine_confidence, criteria, general_feedback_draft, misconception_notes, struck_mis, model_id, prompt_rev, schema_rev, claimed_at, lease_expires_at, submitted_at, resolved_at, reject_reason, updated_at) | definer | [0042_grade_suggestions.sql:1313](../supabase/migrations/0042_grade_suggestions.sql#L1313) | 1 | 0042, 0104 | — |
| `list_grading_queue(p_activity_id uuid)` | table(check_id, student_id, student_label, in_your_class, activity_version_id, version_num, is_current, section_id, block_id, block_type, response_text, response_photos, attempt_number, checked_at, graded, criteria, general_feedback, graded_at, released_at, has_grader, stale) | definer | [0099_photo_pilot.sql:601](../supabase/migrations/0099_photo_pilot.sql#L601) | 4 | 0034, 0035, 0096, 0097, 0099, 0104 | — |
| `mixed_basis(p_class_id uuid)` | table(reason, revision, settings) | definer | [0066_mixed_practice.sql:264](../supabase/migrations/0066_mixed_practice.sql#L264) | 1 | 0066 | — |
| `mixed_class_students(p_class_id uuid)` | jsonb | definer | [0068_mixed_teacher_panel.sql:350](../supabase/migrations/0068_mixed_teacher_panel.sql#L350) | 2 | 0066, 0068, 0079 | app |
| `mixed_class_summary(p_class_id uuid)` | jsonb | definer | [0092_review_period_reads.sql:19](../supabase/migrations/0092_review_period_reads.sql#L19) | 4 | 0066, 0068, 0083, 0092 | app |
| `mixed_item_for_check(p_session_id uuid, p_seq integer)` | jsonb | definer | [0069_mixed_item_for_check_shrink.sql:20](../supabase/migrations/0069_mixed_item_for_check_shrink.sql#L20) | 2 | 0066 | edge |
| `mixed_key_label(p_kind text, p_key text)` | text | definer | [0068_mixed_teacher_panel.sql:71](../supabase/migrations/0068_mixed_teacher_panel.sql#L71) | 1 | — | — |
| `mixed_misconceptions_of(p_verdicts jsonb)` | text[] | invoker | [0067_mixed_misconceptions.sql:45](../supabase/migrations/0067_mixed_misconceptions.sql#L45) | 1 | 0067 | — |
| `mixed_plan(p_class_id uuid, p_student_id uuid, p_session_id uuid, p_today date, p_ordinal integer, p_settings jsonb, p_items integer, p_zone text)` | table(seq, kind, bank_key, owner_id, item_id, early) | definer | [0091_review_period.sql:557](../supabase/migrations/0091_review_period.sql#L557) | 4 | 0066, 0081, 0091 | — |
| `mixed_recent(p_class_id uuid, p_window integer)` | table(student_id, bank_key, tries, right_n, skipped_n) | definer | [0091_review_period.sql:1042](../supabase/migrations/0091_review_period.sql#L1042) | 3 | 0066, 0079, 0091, 0108 | — |
| `mixed_roster(p_class_id uuid)` | table(student_id, name) | definer | [0068_mixed_teacher_panel.sql:55](../supabase/migrations/0068_mixed_teacher_panel.sql#L55) | 1 | 0068 | — |
| `mixed_row_index(p_session_id uuid, p_item_id text, p_rows integer)` | integer | invoker | [0066_mixed_practice.sql:710](../supabase/migrations/0066_mixed_practice.sql#L710) | 1 | 0066, 0077 | — |
| `mixed_session_items_position()` | trigger | invoker | [0091_review_period.sql:264](../supabase/migrations/0091_review_period.sql#L264) | 1 | — | — |
| `mixed_session_payload(p_session_id uuid)` | jsonb | definer | [0091_review_period.sql:1017](../supabase/migrations/0091_review_period.sql#L1017) | 2 | 0066, 0091 | — |
| `mixed_settings_ok(s jsonb)` | boolean | invoker | [0091_review_period.sql:57](../supabase/migrations/0091_review_period.sql#L57) | 4 | 0066, 0073, 0083, 0091 | — |
| `mixed_steps(p_class_id uuid, p_student_id uuid, p_intervals integer[], p_drop integer)` | table(kind, bank_key, step, last_day, due_on, days, last_any, last_any_early) | definer | [0081_mixed_exhausted_sessions.sql:41](../supabase/migrations/0081_mixed_exhausted_sessions.sql#L41) | 2 | 0066, 0081, 0091 | — |
| `mixed_student_recent(p_class_id uuid, p_student_id uuid)` | jsonb | definer | [0091_review_period.sql:1075](../supabase/migrations/0091_review_period.sql#L1075) | 2 | 0068, 0091 | app |
| `mixed_taught(p_class_id uuid, p_student_id uuid, p_zone text)` | table(skill_id, owner_id, taught_day, chain_order) | definer | [0066_mixed_practice.sql:470](../supabase/migrations/0066_mixed_practice.sql#L470) | 1 | 0066 | — |
| `mixed_tier_ok(p_tier text, p_student_id uuid, p_skill_id text)` | boolean | definer | [0070_dol_retake.sql:717](../supabase/migrations/0070_dol_retake.sql#L717) | 1 | 0070 | — |
| `mixed_who_first(p_class_id uuid)` | jsonb | definer | [0108_grid_and_panel_costs.sql:398](../supabase/migrations/0108_grid_and_panel_costs.sql#L398) | 4 | 0068, 0071, 0108 | app |
| `move_class_member(p_student_id uuid, p_from_class uuid, p_to_class uuid)` | jsonb | definer | [0089_move_class_member.sql:28](../supabase/migrations/0089_move_class_member.sql#L28) | 1 | 0089 | app |
| `move_class_plan_item(p_class_id uuid, p_from_date date, p_activity_id uuid, p_to_date date)` | jsonb | definer | [0088_period_planner.sql:321](../supabase/migrations/0088_period_planner.sql#L321) | 1 | 0088 | app |
| `my_activity_progress()` | table(activity_id, current_version_id, sections_total, sections_checked, earlier_checked, earlier_done, feedback_released) | definer | [0059_student_progress.sql:207](../supabase/migrations/0059_student_progress.sql#L207) | 1 | 0059, 0061, 0106 | — |
| `my_activity_progress_json()` | jsonb | invoker | [0106_rowset_reads_json.sql:57](../supabase/migrations/0106_rowset_reads_json.sql#L57) | 1 | 0106 | app |
| `my_chain_hooks()` | jsonb | definer | [0057_chain_hooks.sql:219](../supabase/migrations/0057_chain_hooks.sql#L219) | 1 | 0057 | app |
| `my_checked_section_ids(p_version_id uuid)` | table(section_id) | definer | [0060_my_latest_checks.sql:34](../supabase/migrations/0060_my_latest_checks.sql#L34) | 1 | 0060 | app |
| `my_dol_state(p_activity_id uuid, p_version_id uuid, p_section_id text, p_rubric_primary? boolean)` | jsonb | definer | [0072_dol_targeted_practice.sql:320](../supabase/migrations/0072_dol_targeted_practice.sql#L320) | 2 | 0070, 0072 | edge |
| `my_help_state(p_version_id uuid)` | jsonb | definer | [0090_help_requests.sql:188](../supabase/migrations/0090_help_requests.sql#L188) | 1 | 0090 | app |
| `my_latest_checks(p_version_id uuid, p_section_ids text[])` | table(section_id, attempt_number, responses, verdicts) | definer | [0060_my_latest_checks.sql:53](../supabase/migrations/0060_my_latest_checks.sql#L53) | 1 | 0060 | edge |
| `my_timezone()` | jsonb | definer | [0088_period_planner.sql:473](../supabase/migrations/0088_period_planner.sql#L473) | 1 | 0088 | app |
| `my_unit_tracker(p_class_id uuid)` | jsonb | definer | [0074_unit_tracker.sql:140](../supabase/migrations/0074_unit_tracker.sql#L140) | 1 | 0074, 0079 | app |
| `my_work_photo_usage()` | table(photos, attached, bytes) | definer | [0098_my_work_photo_usage.sql:21](../supabase/migrations/0098_my_work_photo_usage.sql#L21) | 1 | 0098 | app |
| `open_fact_probe(p_class_id uuid, p_year_level integer)` | jsonb | definer | [0048_fact_practice_prune.sql:114](../supabase/migrations/0048_fact_practice_prune.sql#L114) | 3 | 0045, 0046, 0047, 0048, 0050, 0051, 0065, 0068 | app |
| `photo_answers_on()` | boolean | definer | [0094_photo_attach.sql:74](../supabase/migrations/0094_photo_attach.sql#L74) | 2 | 0094, 0099 | viewer |
| `photo_answers_on(p_activity_id uuid)` | boolean | definer | [0099_photo_pilot.sql:86](../supabase/migrations/0099_photo_pilot.sql#L86) | 2 | 0094, 0099 | viewer |
| `photo_block_gate(p_uid uuid, p_activity_id uuid, p_version_id uuid, p_block_id uuid)` | integer | definer | [0099_photo_pilot.sql:121](../supabase/migrations/0099_photo_pilot.sql#L121) | 2 | 0095, 0099 | — |
| `photo_handoff_allowed(p_content jsonb)` | boolean | invoker | [0095_photo_handoff.sql:193](../supabase/migrations/0095_photo_handoff.sql#L193) | 1 | 0095 | — |
| `photo_handoff_status(p_handoff_id uuid)` | jsonb | definer | [0095_photo_handoff.sql:287](../supabase/migrations/0095_photo_handoff.sql#L287) | 1 | 0095 | viewer, scripts |
| `photo_ids_of(p_responses jsonb, p_block_id uuid)` | jsonb | invoker | [0096_photo_grading.sql:59](../supabase/migrations/0096_photo_grading.sql#L59) | 1 | — | — |
| `photos_allowed_for(p_activity_id uuid)` | boolean | definer | [0099_photo_pilot.sql:62](../supabase/migrations/0099_photo_pilot.sql#L62) | 1 | 0097, 0099, 0108 | — |
| `prune_client_errors(p_dry_run? boolean)` | jsonb | definer | [0107_client_errors.sql:152](../supabase/migrations/0107_client_errors.sql#L152) | 1 | 0107 | — |
| `prune_fact_practice(p_dry_run? boolean)` | jsonb | definer | [0050_fact_sprint.sql:1110](../supabase/migrations/0050_fact_sprint.sql#L1110) | 2 | 0048, 0050 | — |
| `prune_help_requests(p_dry_run? boolean)` | jsonb | definer | [0090_help_requests.sql:431](../supabase/migrations/0090_help_requests.sql#L431) | 1 | 0090 | — |
| `prune_mixed_practice(p_dry_run? boolean)` | jsonb | definer | [0066_mixed_practice.sql:1155](../supabase/migrations/0066_mixed_practice.sql#L1155) | 1 | 0066 | — |
| `prune_photo_handoffs(p_dry_run? boolean)` | jsonb | definer | [0095_photo_handoff.sql:491](../supabase/migrations/0095_photo_handoff.sql#L491) | 1 | 0095 | — |
| `prune_section_checks(p_dry_run? boolean)` | jsonb | definer | [0035_check_prune_disarmed.sql:121](../supabase/migrations/0035_check_prune_disarmed.sql#L121) | 1 | 0035, 0036 | — |
| `prune_video_pause_tries(p_dry_run? boolean)` | jsonb | definer | [0080_prune_video_pause_tries.sql:13](../supabase/migrations/0080_prune_video_pause_tries.sql#L13) | 1 | 0080 | — |
| `publish_activity(p_activity_id uuid)` | uuid | definer | [0037_activity_taxonomy.sql:97](../supabase/migrations/0037_activity_taxonomy.sql#L97) | 2 | 0037, 0054, 0055, 0056, 0057, 0088 | app, scripts |
| `purge_soft_deleted()` | void | definer | [0066_mixed_practice.sql:1215](../supabase/migrations/0066_mixed_practice.sql#L1215) | 11 | 0022, 0023, 0024, 0025, 0029, 0033, 0034, 0036, 0042, 0045, 0050, 0066, 0086, cron-jobs | — |
| `rebuild_check_rollup(p_from? date)` | jsonb | definer | [0036_check_rollup.sql:328](../supabase/migrations/0036_check_rollup.sql#L328) | 1 | 0036 | — |
| `recompute_check_rollup_days(p_versions uuid[], p_floor date, p_bound timestamp with time zone)` | bigint | definer | [0063_zone_name_lookup.sql:136](../supabase/migrations/0063_zone_name_lookup.sql#L136) | 2 | 0063 | — |
| `reconfirm_class_age(p_class_id uuid, p_includes_under_13 boolean, p_assertion_text_version text)` | jsonb | definer | [0053_class_age_statement.sql:138](../supabase/migrations/0053_class_age_statement.sql#L138) | 1 | 0053 | app |
| `record_check(p_student_id uuid, p_activity_id uuid, p_activity_version_id uuid, p_section_id text, p_responses jsonb, p_verdicts jsonb, p_idempotency_key? text, p_rate_limit? integer, p_rate_window_seconds? integer, p_locked? boolean, p_section_total? integer, p_max_attempts? integer, p_expected_attempt? integer, p_rubric_primary? boolean, p_dol_primary_correct? boolean)` | jsonb | definer | [0070_dol_retake.sql:179](../supabase/migrations/0070_dol_retake.sql#L179) | 4 | 0020, 0035, 0040, 0059, 0070, 0094, 0096, 0097, 0099 | edge, scripts |
| `record_dol_practice_attempt(p_student_id uuid, p_session_id uuid, p_seq integer, p_correct boolean, p_skipped boolean, p_responses jsonb, p_verdicts jsonb)` | jsonb | definer | [0072_dol_targeted_practice.sql:273](../supabase/migrations/0072_dol_targeted_practice.sql#L273) | 1 | 0072 | edge |
| `record_mixed_attempt(p_student_id uuid, p_session_id uuid, p_seq integer, p_correct boolean, p_skipped boolean, p_responses jsonb, p_verdicts jsonb)` | jsonb | definer | [0091_review_period.sql:882](../supabase/migrations/0091_review_period.sql#L882) | 4 | 0066, 0067, 0081, 0091 | edge |
| `record_video_pause_try(p_student_id uuid, p_activity_id uuid, p_version_id uuid, p_section_id text, p_block_id uuid, p_correct boolean, p_max_tries? integer)` | jsonb | definer | [0079_video_pause_tries.sql:43](../supabase/migrations/0079_video_pause_tries.sql#L43) | 1 | 0079 | edge |
| `redeem_join_code(p_join_code text)` | jsonb | definer | [0033_pending_admission.sql:187](../supabase/migrations/0033_pending_admission.sql#L187) | 1 | 0033 | app |
| `regenerate_join_code(p_class_id uuid)` | jsonb | definer | [0027_admission_gate_hardening.sql:331](../supabase/migrations/0027_admission_gate_hardening.sql#L331) | 1 | 0027 | app |
| `reject_grade_suggestion(p_suggestion_id uuid, p_expected_updated_at timestamp with time zone, p_reason? text)` | jsonb | definer | [0042_grade_suggestions.sql:1220](../supabase/migrations/0042_grade_suggestions.sql#L1220) | 1 | 0042 | app |
| `release_check_grades(p_activity_id uuid, p_student_id uuid)` | jsonb | definer | [0096_photo_grading.sql:711](../supabase/migrations/0096_photo_grading.sql#L711) | 2 | 0034, 0096 | app |
| `reorder_class_plan(p_class_id uuid, p_on_date date, p_activity_ids uuid[])` | jsonb | definer | [0088_period_planner.sql:366](../supabase/migrations/0088_period_planner.sql#L366) | 1 | 0088 | app |
| `report_client_error(p_kind text, p_route text, p_build text, p_source text, p_message text)` | jsonb | definer | [0107_client_errors.sql:78](../supabase/migrations/0107_client_errors.sql#L78) | 1 | 0107 | app |
| `reserve_photo_for(p_uid uuid, p_activity_id uuid, p_version_id uuid, p_block_id uuid, p_source text)` | uuid | definer | [0095_photo_handoff.sql:103](../supabase/migrations/0095_photo_handoff.sql#L103) | 1 | 0095 | — |
| `reserve_work_photo(p_activity_id uuid, p_version_id uuid, p_block_id uuid)` | uuid | definer | [0095_photo_handoff.sql:138](../supabase/migrations/0095_photo_handoff.sql#L138) | 2 | 0093, 0094, 0095, 0096, 0097, 0099 | viewer, scripts |
| `restore_activity(p_activity_id uuid)` | void | definer | [0012_restore_activity.sql:31](../supabase/migrations/0012_restore_activity.sql#L31) | 1 | 0038 | app |
| `restore_class(p_class_id uuid)` | void | definer | [0086_restore_class_and_recently_deleted.sql:37](../supabase/migrations/0086_restore_class_and_recently_deleted.sql#L37) | 1 | 0086 | app |
| `review_items_for(p_class_id uuid, p_settings jsonb, p_is_double boolean)` | integer | definer | [0091_review_period.sql:294](../supabase/migrations/0091_review_period.sql#L294) | 1 | 0091 | — |
| `review_plan(p_class_id uuid, p_student_id uuid, p_session_id uuid, p_today date, p_settings jsonb, p_items integer, p_zone text, p_focus_chains text[])` | table(seq, kind, bank_key, owner_id, item_id, early) | definer | [0091_review_period.sql:352](../supabase/migrations/0091_review_period.sql#L352) | 1 | 0091 | — |
| `review_preview(p_class_id uuid, p_is_double? boolean, p_on_date? date)` | jsonb | definer | [0092_review_period_reads.sql:197](../supabase/migrations/0092_review_period_reads.sql#L197) | 1 | 0092 | app |
| `rls_auto_enable()` | event_trigger | definer | [0031_replayable_rls_auto_enable.sql:61](../supabase/migrations/0031_replayable_rls_auto_enable.sql#L61) | 1 | — | — |
| `run_analytics_maintenance()` | bigint | definer | [0036_check_rollup.sql:370](../supabase/migrations/0036_check_rollup.sql#L370) | 2 | 0026, 0035, 0036, cron-jobs | — |
| `save_fact_attempts(p_probe_id uuid, p_attempts jsonb, p_baselines? jsonb, p_finished? boolean, p_app_build? text)` | jsonb | definer | [0045_fact_probe.sql:892](../supabase/migrations/0045_fact_probe.sql#L892) | 1 | 0045, 0046, 0048, 0050, 0051, 0065, 0068 | app |
| `save_sprint_attempts(p_session_id uuid, p_attempts jsonb, p_baselines? jsonb, p_finished? boolean, p_app_build? text)` | jsonb | definer | [0050_fact_sprint.sql:942](../supabase/migrations/0050_fact_sprint.sql#L942) | 1 | 0050, 0051, 0068 | app |
| `section_checks_attach_photos()` | trigger | definer | [0099_photo_pilot.sql:171](../supabase/migrations/0099_photo_pilot.sql#L171) | 2 | 0094, 0099 | — |
| `set_activity_listing(p_activity_id uuid, p_listed boolean)` | text | definer | [0055_bank_authors.sql:96](../supabase/migrations/0055_bank_authors.sql#L96) | 2 | 0054, 0055, 0056, 0057 | app |
| `set_class_activity_due(p_class_id uuid, p_activity_id uuid, p_due_on date)` | date | definer | [0087_class_activity_due.sql:36](../supabase/migrations/0087_class_activity_due.sql#L36) | 1 | 0087 | app |
| `set_class_help(p_class_id uuid, p_on boolean)` | jsonb | definer | [0090_help_requests.sql:51](../supabase/migrations/0090_help_requests.sql#L51) | 1 | 0090 | app |
| `set_class_period_minutes(p_class_id uuid, p_minutes integer)` | jsonb | definer | [0091_review_period.sql:143](../supabase/migrations/0091_review_period.sql#L143) | 1 | 0091, 0092 | app |
| `set_class_plan(p_class_id uuid, p_on_date date, p_activity_id uuid, p_on boolean)` | jsonb | definer | [0088_period_planner.sql:267](../supabase/migrations/0088_period_planner.sql#L267) | 1 | 0088 | app |
| `set_class_review(p_class_id uuid, p_on_date date, p_on boolean, p_focus_chains? text[], p_is_double? boolean)` | jsonb | definer | [0091_review_period.sql:203](../supabase/migrations/0091_review_period.sql#L203) | 1 | 0091, 0092 | app |
| `set_class_today(p_class_id uuid, p_activity_id uuid, p_on boolean)` | jsonb | definer | [0088_period_planner.sql:441](../supabase/migrations/0088_period_planner.sql#L441) | 3 | 0082, 0084, 0088 | app |
| `set_class_year_end(p_class_id uuid, p_ends_on date)` | date | definer | [0048_fact_practice_prune.sql:87](../supabase/migrations/0048_fact_practice_prune.sql#L87) | 1 | 0048 | app |
| `set_classes_updated_at()` | trigger | invoker | [0027_admission_gate_hardening.sql:164](../supabase/migrations/0027_admission_gate_hardening.sql#L164) | 1 | 0028 | — |
| `set_dol_pass(p_check_id uuid, p_passed boolean)` | jsonb | definer | [0070_dol_retake.sql:461](../supabase/migrations/0070_dol_retake.sql#L461) | 1 | 0070 | app |
| `set_fact_sprint(p_class_id uuid, p_on boolean)` | jsonb | definer | [0050_fact_sprint.sql:647](../supabase/migrations/0050_fact_sprint.sql#L647) | 1 | 0050, 0051, 0068 | app |
| `set_mixed_practice(p_class_id uuid, p_on boolean)` | jsonb | definer | [0066_mixed_practice.sql:289](../supabase/migrations/0066_mixed_practice.sql#L289) | 1 | 0066, 0081, 0091 | app |
| `set_mixed_settings(p_class_id uuid, p_items integer, p_graded boolean)` | jsonb | definer | [0066_mixed_practice.sql:330](../supabase/migrations/0066_mixed_practice.sql#L330) | 1 | 0066, 0081, 0091 | app |
| `set_my_timezone(p_zone text)` | jsonb | definer | [0088_period_planner.sql:488](../supabase/migrations/0088_period_planner.sql#L488) | 1 | 0088, 0100 | app |
| `set_public_name(p_name text)` | jsonb | definer | [0055_bank_authors.sql:53](../supabase/migrations/0055_bank_authors.sql#L53) | 1 | 0055, 0063 | app |
| `set_tracker_wording(p_skill_id text, p_wording text)` | void | definer | [0074_unit_tracker.sql:41](../supabase/migrations/0074_unit_tracker.sql#L41) | 1 | 0074 | app |
| `share_activity_to_class(p_class_id uuid, p_activity_id uuid)` | void | definer | [0030_class_activities.sql:90](../supabase/migrations/0030_class_activities.sql#L90) | 1 | 0030, 0087 | app, scripts |
| `soft_delete_activity(p_activity_id uuid)` | void | definer | [0008_soft_delete_activity.sql:18](../supabase/migrations/0008_soft_delete_activity.sql#L18) | 1 | 0086 | app |
| `soft_delete_class(p_class_id uuid)` | void | definer | [0014_classes.sql:296](../supabase/migrations/0014_classes.sql#L296) | 1 | 0013-0014, 0086 | app |
| `start_dol_practice(p_activity_id uuid, p_version_id uuid)` | jsonb | definer | [0077_dol_practice_repeat.sql:35](../supabase/migrations/0077_dol_practice_repeat.sql#L35) | 3 | 0072, 0073, 0077 | edge |
| `start_mixed_session(p_class_id uuid, p_start? boolean)` | jsonb | definer | [0091_review_period.sql:728](../supabase/migrations/0091_review_period.sql#L728) | 3 | 0066, 0081, 0091 | app, edge |
| `start_photo_handoff(p_activity_id uuid, p_version_id uuid, p_block_id uuid, p_slots integer)` | jsonb | definer | [0095_photo_handoff.sql:230](../supabase/migrations/0095_photo_handoff.sql#L230) | 1 | 0095, 0099 | viewer, scripts |
| `submit_grade_suggestion(p_suggestion_id uuid, p_machine_confidence text, p_model_id text, p_prompt_rev integer, p_schema_rev integer, p_criteria? jsonb, p_general_feedback_draft? text, p_misconceptions? jsonb, p_tokens_in? integer, p_tokens_out? integer)` | jsonb | definer | [0042_grade_suggestions.sql:959](../supabase/migrations/0042_grade_suggestions.sql#L959) | 1 | 0042 | worker |
| `sweep_work_photos_due(p_dry_run? boolean)` | jsonb | definer | [0093_student_work_photos.sql:336](../supabase/migrations/0093_student_work_photos.sql#L336) | 1 | 0093 | edge |
| `sync_chain_hooks(p_owner uuid, p_hooks jsonb, p_apply? boolean)` | jsonb | definer | [0057_chain_hooks.sql:78](../supabase/migrations/0057_chain_hooks.sql#L78) | 1 | 0057 | scripts |
| `sync_fact_scope(p_mirror jsonb, p_apply? boolean)` | jsonb | definer | [0049_fact_scope_sprint_keys.sql:88](../supabase/migrations/0049_fact_scope_sprint_keys.sql#L88) | 3 | 0044, 0047, 0049 | scripts |
| `sync_glossary_entries(p_owner uuid, p_entries jsonb, p_apply? boolean)` | jsonb | definer | [0043_glossary_entry.sql:154](../supabase/migrations/0043_glossary_entry.sql#L154) | 1 | 0043 | scripts |
| `sync_mixed_settings(p_mirror jsonb, p_apply? boolean)` | jsonb | definer | [0066_mixed_practice.sql:204](../supabase/migrations/0066_mixed_practice.sql#L204) | 1 | 0066, 0067, 0068, 0071, 0073, 0081, 0083, 0091, 0092, 0102, 0108 | scripts |
| `sync_practice_items(p_owner uuid, p_items jsonb, p_apply? boolean, p_allow_unretire? boolean)` | jsonb | definer | [0070_dol_retake.sql:573](../supabase/migrations/0070_dol_retake.sql#L573) | 2 | 0058 | scripts |
| `unit_tracker_rows(p_class_id uuid)` | table(unit, owner_id, skill_id, ord, label, wording, letters, has_harder, passable, dol_activity_id) | definer | [0074_unit_tracker.sql:76](../supabase/migrations/0074_unit_tracker.sql#L76) | 1 | 0074 | — |
| `unshare_activity_from_class(p_class_id uuid, p_activity_id uuid)` | void | definer | [0030_class_activities.sql:137](../supabase/migrations/0030_class_activities.sql#L137) | 1 | 0030, 0082, 0087 | app |
| `update_class_domain(p_class_id uuid, p_domain text)` | jsonb | definer | [0027_admission_gate_hardening.sql:368](../supabase/migrations/0027_admission_gate_hardening.sql#L368) | 1 | 0027 | app |
| `upsert_check_grade(p_check_id uuid, p_block_id uuid, p_criteria jsonb, p_general_feedback text)` | jsonb | definer | [0042_grade_suggestions.sql:395](../supabase/migrations/0042_grade_suggestions.sql#L395) | 2 | 0034, 0035, 0042, 0096, 0097 | app |
| `users_photo_pilot_guard()` | trigger | invoker | [0099_photo_pilot.sql:39](../supabase/migrations/0099_photo_pilot.sql#L39) | 1 | 0099 | — |
| `users_timezone_guard()` | trigger | invoker | [0063_zone_name_lookup.sql:105](../supabase/migrations/0063_zone_name_lookup.sql#L105) | 2 | 0036, 0063, 0109 | — |
| `validate_check_grade_criteria(p_check_id uuid, p_block_id uuid, p_criteria jsonb)` | jsonb | definer | [0096_photo_grading.sql:82](../supabase/migrations/0096_photo_grading.sql#L82) | 2 | 0042 | — |
| `video_source(p_activity_id uuid, p_version_id uuid, p_block_id uuid)` | table(url, captions) | definer | [0078_video_source.sql:31](../supabase/migrations/0078_video_source.sql#L31) | 1 | 0078 | viewer, edge |
| `withdraw_help(p_version_id uuid, p_section_id text)` | jsonb | definer | [0090_help_requests.sql:312](../supabase/migrations/0090_help_requests.sql#L312) | 1 | 0090 | app |
| `work_photo_deletion_batch(p_limit? integer)` | setof text | definer | [0093_student_work_photos.sql:368](../supabase/migrations/0093_student_work_photos.sql#L368) | 1 | 0093 | edge |
| `work_photo_deletions_done(p_names text[])` | integer | definer | [0093_student_work_photos.sql:384](../supabase/migrations/0093_student_work_photos.sql#L384) | 1 | 0093 | edge |
| `work_photo_orphans(p_limit? integer)` | setof text | definer | [0093_student_work_photos.sql:408](../supabase/migrations/0093_student_work_photos.sql#L408) | 1 | 0093 | edge |
| `work_photo_readable(p_name text, p_version text)` | boolean | definer | [0094_photo_attach.sql:135](../supabase/migrations/0094_photo_attach.sql#L135) | 2 | 0093, 0094 | — |
| `work_photo_reserved(p_name text)` | boolean | definer | [0099_photo_pilot.sql:105](../supabase/migrations/0099_photo_pilot.sql#L105) | 2 | 0093, 0099 | — |
| `work_photo_states(p_activity_id uuid, p_photo_ids uuid[])` | table(photo_id, state) | definer | [0096_photo_grading.sql:795](../supabase/migrations/0096_photo_grading.sql#L795) | 1 | 0096 | app |
| `work_photo_usage()` | table(teacher_id, photos, attached, bytes) | definer | [0093_student_work_photos.sql:427](../supabase/migrations/0093_student_work_photos.sql#L427) | 1 | 0093 | — |
| `work_photos_queue_bytes()` | trigger | definer | [0093_student_work_photos.sql:148](../supabase/migrations/0093_student_work_photos.sql#L148) | 1 | — | — |
| `write_version_census(p_version_id uuid, p_counts jsonb, p_items jsonb)` | void | definer | [0026_analytics_census.sql:160](../supabase/migrations/0026_analytics_census.sql#L160) | 1 | 0026 | edge |

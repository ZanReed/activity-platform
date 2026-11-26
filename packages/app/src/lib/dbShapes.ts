// =============================================================================
// lib/dbShapes.ts — what each `jsonb` database function returns, in ONE place
// -----------------------------------------------------------------------------
// Review C1 slice 4, design D3/D6 (docs/design/database-snapshot-and-types.md).
// The generated schema types a `jsonb` result as `Json`: no shape. lib/db.ts's
// rpc() gives a function listed here this type instead, so the cast from Json
// to a hand-written shape happens here, once, not at every call site.
//
// Each entry carries `@shape-as-of NNNN`: the migration holding the function's
// latest definition when the shape was last matched to it. When a later
// migration restates the function, scripts/tests/db-rpc.test.mjs goes red until
// someone re-reads the new body's keys, fixes the type if they moved, and bumps
// the stamp. The first stamps (2026-11-26) record the shapes the app already
// relied on, not a fresh key-by-key re-read of every body.
//
// `@derived-from x` entries are not hand-written: the function returns
// `to_jsonb` of x's rows (0104, 0106), so its keys ARE x's columns. Every
// column is typed `| null`: Postgres records no nullability for a function's
// result, so the generator's non-null column types would lie (list_class_members'
// removed_at is NULL for every live member). Call sites narrow from there.
// Types only — nothing here ships.
// =============================================================================

import type { Database } from '@activity/db-types';
import type { AnalyticsPayload } from '../routes/ActivityAnalytics';
import type { ClassPlan } from './classPlan';
import type { ActivityProgress, ClassMisconceptions, ClassProgress, FirstTries, StudentWork } from './classProgress';
import type { ClassToday } from './classToday';
import type { ClassRow } from './classes';
import type { ClassStat, ProbeOverview, ProbeResults, SaveResult } from './factProbe';
import type { SprintOverview, SprintSaveResult } from './factSprint';
import type { ClassGradebook } from './gradebook';
import type { AssistStatus, SuggestionRow } from './gradingAssist';
import type { FinishedCounts, RawPreview } from './mixedPractice';
import type { MixedStudentRow, MixedSummary, RecentTry, WhoFirst } from './mixedTeacher';
import type { StudentTrackerUnit, TeacherTrackerUnit } from './unitTracker';

type Fn = Database['public']['Functions'];
/** A row-set function's rows, every column nullable (see above). */
type RowsOf<F extends keyof Fn> = Fn[F]['Returns'] extends (infer R)[] ? { [K in keyof R]: R[K] | null }[] : never;

export interface JsonShapes {
  /** @shape-as-of 0062 */
  activity_first_tries: FirstTries;
  /** @shape-as-of 0099 */
  activity_progress: ActivityProgress;
  /** @shape-as-of 0102 */
  class_gradebook: ClassGradebook;
  /** @shape-as-of 0064 */
  class_misconceptions: ClassMisconceptions;
  /** @shape-as-of 0092 */
  class_plan: ClassPlan;
  /** @shape-as-of 0099 */
  class_progress: ClassProgress;
  /** @shape-as-of 0099 */
  class_student_work: StudentWork;
  /** @shape-as-of 0092 */
  class_today: ClassToday;
  /** @shape-as-of 0074 */
  class_unit_tracker: { units: TeacherTrackerUnit[] };
  /** @shape-as-of 0045 */
  close_fact_probe: ClassStat;
  /** @shape-as-of 0053 */
  create_class: ClassRow;
  /** @shape-as-of 0106 · @derived-from dol_pass_status (to_jsonb of its rows) */
  dol_pass_status_json: RowsOf<'dol_pass_status'>;
  /** @shape-as-of 0048 */
  fact_probe_overview: ProbeOverview;
  /** @shape-as-of 0048 */
  fact_probe_results: ProbeResults;
  /** @shape-as-of 0051 */
  fact_sprint_overview: SprintOverview;
  /** @shape-as-of 0091 */
  finish_mixed_session: FinishedCounts;
  /** @shape-as-of 0064 */
  get_activity_analytics: AnalyticsPayload;
  /** @shape-as-of 0042 */
  get_grading_assist_status: AssistStatus;
  /** @shape-as-of 0104 — hand-written, not derived: the app reads `criteria` as SuggestionCriterion[], which the generated row types as plain Json */
  grade_suggestions: SuggestionRow[];
  /** @shape-as-of 0104 · @derived-from list_grading_queue (to_jsonb of its rows) */
  grading_queue: RowsOf<'list_grading_queue'>;
  /** @shape-as-of 0106 · @derived-from list_bank (to_jsonb of its rows) */
  list_bank_json: RowsOf<'list_bank'>;
  /** @shape-as-of 0106 · @derived-from list_class_activities (to_jsonb of its rows) */
  list_class_activities_json: RowsOf<'list_class_activities'>;
  /** @shape-as-of 0106 · @derived-from list_class_members (to_jsonb of its rows) */
  list_class_members_json: RowsOf<'list_class_members'>;
  /** @shape-as-of 0106 · @derived-from list_deleted_activities (to_jsonb of its rows) */
  list_deleted_activities_json: RowsOf<'list_deleted_activities'>;
  /** @shape-as-of 0106 · @derived-from list_deleted_classes (to_jsonb of its rows) */
  list_deleted_classes_json: RowsOf<'list_deleted_classes'>;
  /** @shape-as-of 0068 */
  mixed_class_students: MixedStudentRow[];
  /** @shape-as-of 0092 */
  mixed_class_summary: MixedSummary;
  /** @shape-as-of 0091 */
  mixed_student_recent: RecentTry[];
  /** @shape-as-of 0091 */
  mixed_who_first: WhoFirst;
  /** @shape-as-of 0092 — returns class_plan(), restated in 0092; keys re-read 2026-11-26 */
  move_class_plan_item: ClassPlan;
  /** @shape-as-of 0106 · @derived-from my_activity_progress (to_jsonb of its rows) */
  my_activity_progress_json: RowsOf<'my_activity_progress'>;
  /** @shape-as-of 0074 */
  my_unit_tracker: { units: StudentTrackerUnit[] };
  /** @shape-as-of 0048 */
  open_fact_probe: { probe_id: string };
  /** @shape-as-of 0092 — returns class_plan(), restated in 0092; keys re-read 2026-11-26 */
  reorder_class_plan: ClassPlan;
  /** @shape-as-of 0045 */
  save_fact_attempts: SaveResult;
  /** @shape-as-of 0050 */
  save_sprint_attempts: SprintSaveResult;
  /** @shape-as-of 0091 */
  set_class_period_minutes: { period_minutes: number | null };
  /** @shape-as-of 0092 — returns class_plan(), restated in 0092; keys re-read 2026-11-26 */
  set_class_plan: ClassPlan;
  /** @shape-as-of 0092 — returns class_today(), restated in 0092; keys re-read 2026-11-26 */
  set_class_today: ClassToday;
  /** @shape-as-of 0066 */
  set_mixed_practice: { on: boolean; on_at: string | null };
  /** @shape-as-of 0091 */
  start_mixed_session: RawPreview;
}

/**
 * grading.ts — the app's side of the teacher-grading wire (migration 0034).
 *
 * All four doors are PostgREST RPCs, not Edge Functions (design ruling G5/G10):
 * grading is a signed-in read/write against the database, so it goes through
 * the same supabase client every other authed call uses and inherits its auth
 * headers and token refresh for free.
 *
 * ⚠ The student readback replaced `get-feedback`, which was deleted at S9
 * Drop 3 and had NEVER worked (its success path passed jsonResponse's
 * arguments swapped, so it served the literal number 200 as a body for its
 * entire life). Nothing here is ported from it, and the "does a real body
 * round-trip" assertion exists in verify-0034 §D precisely because that
 * failure shipped undetected once.
 */
import { supabase } from './supabase';
import type { ReleasedFeedbackRow } from '@activity/viewer';

/**
 * Released teacher feedback for the signed-in student.
 *
 * THROWS ON FAILURE, on purpose: the degrade lives one layer up, in
 * httpCheckService.fetchReleasedFeedback, so that EVERY implementation of the
 * port degrades identically. A function that swallowed its own errors here
 * would make the viewer's guarantee depend on which client it was handed.
 */
export async function fetchReleasedFeedbackRows(
  activityId: string,
): Promise<ReleasedFeedbackRow[]> {
  const { data, error } = await supabase.rpc('get_my_released_feedback', {
    p_activity_id: activityId,
  });
  if (error) throw new Error(error.message);
  return (data ?? []) as ReleasedFeedbackRow[];
}

/* ---- the teacher side (0034 §C/§D/§F) ------------------------------------ */

/** One row of list_grading_queue: a (student, block) response plus its grade. */
export interface GradingQueueRow {
  check_id: string;
  student_id: string;
  /** The student's email, or NULL when they share no class with this teacher.
   *  Identity is roster-scoped on purpose — a published activity is open by
   *  link, so its checks can include students the teacher has no relationship
   *  with, and the roster IS the relationship that carries consent. */
  student_label: string | null;
  in_your_class: boolean;
  activity_version_id: string;
  version_num: number;
  is_current: boolean;
  section_id: string;
  block_id: string;
  block_type: 'short_answer' | 'essay';
  /** NULL = the student left it blank. Gradable anyway (design ruling D13). */
  response_text: string | null;
  attempt_number: number;
  checked_at: string;
  graded: boolean;
  criteria: GradedCriterion[] | null;
  general_feedback: string | null;
  graded_at: string | null;
  released_at: string | null;
  has_grader: boolean;
  /** The student's TEXT changed after this was graded (never "a newer check
   *  exists" — re-checking to retry blanks must not cry wolf). */
  stale: boolean;
}

export interface GradedCriterion {
  criterionId: string;
  earned: number;
  maxPoints: number;
  feedback?: string | null;
}

/** What the teacher's panel sends. maxPoints is deliberately absent: the
 *  server reads it from the pinned rubric, so a client cannot inflate a
 *  denominator (0034 §C). */
export interface CriterionEntry {
  criterionId: string;
  earned: number;
  feedback?: string;
}

export async function fetchGradingQueue(activityId: string): Promise<GradingQueueRow[]> {
  const { data, error } = await supabase.rpc('list_grading_queue', {
    p_activity_id: activityId,
  });
  if (error) throw new Error(error.message);
  return (data ?? []) as GradingQueueRow[];
}

export async function saveCheckGrade(input: {
  checkId: string;
  blockId: string;
  criteria: CriterionEntry[];
  generalFeedback: string;
}): Promise<void> {
  const { error } = await supabase.rpc('upsert_check_grade', {
    p_check_id: input.checkId,
    p_block_id: input.blockId,
    p_criteria: input.criteria,
    p_general_feedback: input.generalFeedback,
  });
  if (error) throw new Error(error.message);
}

/** Releases one student's unreleased grades on this activity, and returns how
 *  many became visible. Bulk release iterates THIS call per student rather
 *  than adding a second RPC: one audited event per student is the granularity
 *  the FERPA-shaped trail wants (design ruling D10). */
export async function releaseGrades(
  activityId: string,
  studentId: string,
): Promise<number> {
  const { data, error } = await supabase.rpc('release_check_grades', {
    p_activity_id: activityId,
    p_student_id: studentId,
  });
  if (error) throw new Error(error.message);
  return Number((data as { released?: number } | null)?.released ?? 0);
}

/* ---- copy (design ruling G8-DR's table) ---------------------------------- */

export const RESPONSES_COPY = {
  title: 'Responses',
  needsGrading: 'Needs grading',
  graded: 'Graded',
  textChanged: 'Text changed since grading',
  noAnswer: 'No answer',
  notInYourClass: 'Not in your classes',
  save: 'Save grade',
  saving: 'Saving…',
  generalFeedback: 'General feedback',
  discardPrompt: 'Discard unsaved grade?',
  // Empty, all-caught-up, and not-applicable are three different truths and
  // get three different sentences — an empty list that means "you're done"
  // must never look like one that means "nothing has happened yet".
  emptyTitle: 'No responses yet',
  emptyBody:
    'When students check sections with written answers, their work appears here.',
  allCaughtTitle: 'All caught up',
  allCaughtBody: 'Every written answer is graded.',
  showGraded: 'Show graded',
  noFreeTextTitle: 'This activity has no written-answer questions',
  noFreeTextBody:
    'Short-answer and essay questions appear here when the worksheet has them.',
  loadFailed: 'Couldn’t load responses',
  saveFailed: 'Couldn’t save that grade. Your entries are still here — try again.',
  releasedNote: 'Released · visible to student · edits appear immediately',
  studentPreview: 'As the student sees it',
} as const;

/** "Release 3 graded to Maya" — the count travels in the button, so the
 *  teacher never fires a release without seeing what goes out (no modal). */
export function releaseLabel(count: number, who: string): string {
  return `Release ${count} graded to ${who}`;
}

export function unreleasedBadge(count: number): string {
  return `${count} unreleased`;
}

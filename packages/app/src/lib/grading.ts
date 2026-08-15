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

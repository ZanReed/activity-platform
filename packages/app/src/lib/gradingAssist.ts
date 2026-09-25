/**
 * gradingAssist.ts — the app's side of the AI-grading-assist wire (migration
 * 0042; design docs/design/ai-grading-assist.md §4b DR-1..12).
 *
 * Deliberately a SIBLING of grading.ts, not an extension of it: grading.ts is
 * 0034's wire and stays authoritative for grades; everything here is drafts.
 * A suggestion is NOT a grade — it becomes one only through
 * confirm_grade_suggestion, which replays the teacher's values through
 * upsert_check_grade server-side in one transaction (EH-5) and computes the
 * DR-2 edit diff THERE. The client never decides confirmed-vs-edited; it only
 * reports chip strikes.
 */
import { supabase } from './supabase';
import type { CriterionEntry } from './grading';

/* ---- wire types (0042 §K/§K2) -------------------------------------------- */

export type SuggestionStatus =
  | 'claimed'
  | 'pending'
  | 'confirmed'
  | 'edited'
  | 'rejected';

export interface SuggestionCriterion {
  criterionId: string;
  earned: number;
  maxPoints: number;
  feedback?: string | null;
}

export interface MisconceptionNote {
  misId: string;
  evidence: string | null;
}

export interface SuggestionRow {
  suggestion_id: string;
  check_id: string;
  block_id: string;
  status: SuggestionStatus;
  machine_confidence: 'high' | 'low' | null;
  criteria: SuggestionCriterion[];
  general_feedback_draft: string | null;
  misconception_notes: MisconceptionNote[];
  struck_mis: string[];
  model_id: string | null;
  prompt_rev: number | null;
  schema_rev: number | null;
  claimed_at: string;
  lease_expires_at: string;
  submitted_at: string | null;
  resolved_at: string | null;
  reject_reason: string | null;
  /** The optimistic-concurrency rev confirm/reject must echo (EH-5). */
  updated_at: string;
}

export interface AssistStatus {
  provider: 'off' | 'local_worker' | 'platform_api';
  last_draft_at?: string | null;
  quota_paused?: boolean;
  misconfigured?: boolean;
  resumes_at?: string | null;
}

export type RejectReason = 'wrong_points' | 'wrong_feedback' | 'wrong_misconception';

/* ---- reads ---------------------------------------------------------------- */

export async function fetchSuggestions(activityId: string): Promise<SuggestionRow[]> {
  const { data, error } = await supabase.rpc('list_grade_suggestions', {
    p_activity_id: activityId,
  });
  if (error) throw new Error(error.message);
  return (data ?? []) as SuggestionRow[];
}

export async function fetchAssistStatus(): Promise<AssistStatus> {
  const { data, error } = await supabase.rpc('get_grading_assist_status');
  if (error) throw new Error(error.message);
  return (data ?? { provider: 'off' }) as AssistStatus;
}

/** The pinned rubric per (version, block), read from the teacher's own
 *  activity_versions rows (owner-readable under can_read_activity). This is
 *  what lets a FIRST grade render rubric rows at all — the queue RPC returns
 *  criteria only once a grade exists — and it is version-pinned by
 *  construction: each queue row names the version the student was served. */
export interface RubricCriterionSpec {
  id: string;
  label: string;
  maxPoints: number;
}

export async function fetchVersionRubrics(
  versionIds: string[],
): Promise<Map<string, RubricCriterionSpec[]>> {
  const rubrics = new Map<string, RubricCriterionSpec[]>();
  if (versionIds.length === 0) return rubrics;
  const { data, error } = await supabase
    .from('activity_versions')
    .select('id, content')
    .in('id', versionIds);
  if (error) throw new Error(error.message);
  for (const row of (data ?? []) as { id: string; content: unknown }[]) {
    const content = row.content as {
      sections?: {
        rows?: { columns?: { blocks?: Record<string, unknown>[] }[] }[];
      }[];
    };
    for (const section of content?.sections ?? []) {
      for (const docRow of section.rows ?? []) {
        for (const column of docRow.columns ?? []) {
          for (const block of column.blocks ?? []) {
            const criteria = (
              block as { rubric?: { criteria?: RubricCriterionSpec[] } }
            ).rubric?.criteria;
            if (criteria && typeof block.id === 'string') {
              rubrics.set(`${row.id}:${block.id}`, criteria);
            }
          }
        }
      }
    }
  }
  return rubrics;
}

/* ---- writes ---------------------------------------------------------------- */

/** Confirm = the existing Save (DR-3): same button, this RPC instead of
 *  upsert_check_grade whenever the panel pre-filled from a draft. Throws
 *  `suggestion_changed` when the draft moved under the teacher — callers
 *  reload rather than mis-attributing (EH-5). */
export async function confirmSuggestion(input: {
  suggestionId: string;
  expectedUpdatedAt: string;
  criteria: CriterionEntry[];
  generalFeedback: string;
  struckMis: string[];
}): Promise<'confirmed' | 'edited'> {
  const { data, error } = await supabase.rpc('confirm_grade_suggestion', {
    p_suggestion_id: input.suggestionId,
    p_expected_updated_at: input.expectedUpdatedAt,
    p_criteria: input.criteria,
    p_general_feedback: input.generalFeedback,
    p_struck_mis: input.struckMis,
  });
  if (error) throw new Error(error.message);
  return ((data as { status?: string } | null)?.status ?? 'confirmed') as
    | 'confirmed'
    | 'edited';
}

export async function rejectSuggestion(input: {
  suggestionId: string;
  expectedUpdatedAt: string;
  reason: RejectReason | null;
}): Promise<void> {
  const { error } = await supabase.rpc('reject_grade_suggestion', {
    p_suggestion_id: input.suggestionId,
    p_expected_updated_at: input.expectedUpdatedAt,
    p_reason: input.reason,
  });
  if (error) throw new Error(error.message);
}

/* ---- display-state derivation (DR-6's table, in one place) ----------------- */

export type AssistDisplay =
  | { kind: 'none' }
  /** claimed + live lease → the subtle "Draft pending" text. An expired
   *  claim or a never-attempted row renders NOTHING (no spinner-forever). */
  | { kind: 'draft_pending' }
  /** pending + high on an ungraded row → the pre-fill. */
  | { kind: 'prefill'; suggestion: SuggestionRow }
  /** pending + low → the D6 abstain: a NEUTRAL badge, never pre-filled. */
  | { kind: 'abstain' }
  /** resolved → DR-10's teacher-only provenance trail. */
  | { kind: 'provenance'; suggestion: SuggestionRow };

export function deriveAssistDisplay(
  suggestion: SuggestionRow | undefined,
  rowGraded: boolean,
  now: Date = new Date(),
): AssistDisplay {
  if (!suggestion) return { kind: 'none' };
  if (suggestion.status === 'claimed') {
    return new Date(suggestion.lease_expires_at) > now
      ? { kind: 'draft_pending' }
      : { kind: 'none' };
  }
  if (suggestion.status === 'pending') {
    if (suggestion.machine_confidence === 'low') return { kind: 'abstain' };
    // A pending draft on an already-graded row is moot — the teacher graded
    // past it manually; pre-filling now would fight the saved grade.
    if (rowGraded) return { kind: 'none' };
    return { kind: 'prefill', suggestion };
  }
  return { kind: 'provenance', suggestion };
}

/** "12 min ago" for the heartbeat line — coarse on purpose; the line exists
 *  to make silence legible, not to be a clock. */
export function relativeTime(iso: string, now: Date = new Date()): string {
  const ms = now.getTime() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return ASSIST_COPY.justNow;
  if (min < 60) return `${min} min ago`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.floor(hours / 24)} d ago`;
}

/* ---- copy (DR-11: every string is a contract string) ----------------------- */

export const ASSIST_COPY = {
  aiDraft: 'AI draft',
  draftNote: 'AI draft — values clear their draft mark when you edit them',
  draftPending: 'Draft pending',
  abstain: 'Needs full manual grading',
  heartbeat: 'Last AI draft:',
  heartbeatNone: 'No AI drafts yet',
  justNow: 'just now',
  // DR-9's exact header sentence; {date} substituted by quotaPausedLine.
  quotaPaused: 'AI drafting paused — monthly limit reached; resumes {date}',
  misconceptionsHeading: 'Misconceptions observed',
  strikeHint: 'Click a chip to strike an observation you disagree with',
  rejectDraft: 'Reject draft',
  rejectWhy: 'Why? (optional)',
  rejectReasons: {
    wrong_points: 'Wrong points',
    wrong_feedback: 'Wrong feedback',
    wrong_misconception: 'Wrong misconception',
  } as Record<RejectReason, string>,
  rejectNoReason: 'No reason',
  rejectCancel: 'Keep draft',
  draftRejected: 'AI draft rejected — grade it yourself below.',
  draftChanged: 'That draft changed since you opened it — reloading the row.',
  provenanceUnedited: 'Confirmed from AI draft (unedited)',
  provenanceEdited: 'Confirmed from AI draft (edited)',
  provenanceRejected: 'AI draft was rejected',
  savedConfirmed: 'Saved — AI draft confirmed unchanged',
  savedEdited: 'Saved — AI draft confirmed with edits',
  criterionFeedback: 'Feedback',
} as const;

export function quotaPausedLine(resumesAt: string | null | undefined): string {
  const date = resumesAt
    ? new Date(resumesAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : 'next month';
  return ASSIST_COPY.quotaPaused.replace('{date}', date);
}

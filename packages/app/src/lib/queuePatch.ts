// =============================================================================
// queuePatch.ts — the responses page's in-place patch after a Save (review A5
// follow-up). NO runtime imports, and ONLY the responses route imports it at
// runtime (others import types): imported from grading.ts it landed in the
// shell (+0.22 KiB). The integration lane also runs it in node against the
// REAL server's re-read, which grading.ts cannot do (it imports the Supabase
// client, which reads import.meta.env).
// =============================================================================

import type { GradedCriterion, GradingQueueRow } from './grading';
import type { SuggestionStatus } from './gradingAssist';

/** What upsert_check_grade returns about the grade it stored (0034 §C): the
 *  criteria as the SERVER normalized them (maxPoints from the pinned rubric),
 *  and its two timestamps. */
export interface StoredGrade {
  criteria: GradedCriterion[];
  graded_at: string;
  released_at: string | null;
}

/** The stored grade from an upsert/confirm reply, or null when the reply
 *  doesn't carry one (the caller then re-reads instead of patching). */
export function parseStoredGrade(data: unknown): StoredGrade | null {
  const g = data as Partial<StoredGrade> | null;
  if (!g || !Array.isArray(g.criteria) || typeof g.graded_at !== 'string') return null;
  return { criteria: g.criteria, graded_at: g.graded_at, released_at: g.released_at ?? null };
}


/** A save the responses page applies IN PLACE instead of re-reading the whole
 *  queue (review A5 follow-up): one (check, block) row changed. */
export interface SavedGrade {
  checkId: string;
  blockId: string;
  grade: StoredGrade;
  /** What the teacher sent; normalized here the way the server stores it. */
  generalFeedback: string;
}

/** What a panel action changed, so the page can patch rather than re-read.
 *  Absent = "re-read everything" (a release, or a draft that moved under the
 *  teacher: changes the client cannot compute). */
export type SavedChange =
  | {
      kind: 'grade';
      checkId: string;
      blockId: string;
      /** upsert_check_grade's reply, RAW; the page parses it (no grade in it
       *  = the page re-reads). Raw so this module stays out of the panel's
       *  and the shell's chunks: only the route imports it at runtime. */
      reply: unknown;
      /** What the teacher sent as general feedback. */
      generalFeedback: string;
      /** A confirmed draft's new status (confirm_grade_suggestion's DR-2). */
      suggestion?: { id: string; status: SuggestionStatus };
      /** The DoL pass was set or cleared in the same Save. */
      dolChanged: boolean;
    }
  | { kind: 'rejected'; suggestionId: string };

/** `nullif(trim(coalesce(x, '')), '')`, as upsert_check_grade stores it.
 *  Postgres trim() strips SPACES only, so this does too. */
export function storedFeedback(text: string): string | null {
  const t = text.replace(/^ +| +$/g, '');
  return t === '' ? null : t;
}

/** The queue with one saved grade applied, exactly as the next
 *  grading_queue read would return that row; null when it cannot be sure (no
 *  matching row, or the row showed a NEWER grade from an older attempt — see
 *  below), and the caller re-reads. A save targets the row's own LATEST
 *  check, so once its grade is the winning one it was written by the teacher
 *  (has_grader) against the very answer the row shows (stale = false).
 *  released_at is the server's: an upsert never touches it. */
export function applySavedGrade(
  rows: readonly GradingQueueRow[],
  saved: SavedGrade,
): GradingQueueRow[] | null {
  let hit = false;
  let unsure = false;
  const next = rows.map((r) => {
    if (r.check_id !== saved.checkId || r.block_id !== saved.blockId) return r;
    hit = true;
    // The queue shows the grade with the LATEST graded_at across the row's
    // checks, and a re-save never moves graded_at (set once, at insert). So
    // if the row already showed a grade NEWER than the one just saved — an
    // older attempt graded later, by a stale tab or a co-teacher — the server
    // still picks that one, and only a re-read can say what the row is now.
    // Equal or newer: this check's grade wins (the tie goes to the later
    // attempt, which this row is). Unparseable or millisecond-equal but
    // textually different: unsure, re-read.
    if (r.graded_at !== null && r.graded_at !== saved.grade.graded_at) {
      const was = Date.parse(r.graded_at);
      const now = Date.parse(saved.grade.graded_at);
      if (!(now > was)) unsure = true;
    }
    return {
      ...r,
      graded: true,
      criteria: saved.grade.criteria,
      general_feedback: storedFeedback(saved.generalFeedback),
      graded_at: saved.grade.graded_at,
      released_at: saved.grade.released_at,
      has_grader: true,
      stale: false,
    };
  });
  return hit && !unsure ? next : null;
}

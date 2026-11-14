// =============================================================================
// responsesQueue.ts — the Responses page's queue order, and what Next opens
// -----------------------------------------------------------------------------
// Pure helpers for routes/ActivityResponses.tsx (teacher-grading.md D4, D8).
// =============================================================================

import type { GradingQueueRow } from './grading';

/** Section → question → rows, in the RPC's order; within a question, oldest
 *  submission first (DR-7's fairness rule). */
export function groupRows(list: readonly GradingQueueRow[]): Map<string, Map<string, GradingQueueRow[]>> {
  const bySection = new Map<string, Map<string, GradingQueueRow[]>>();
  for (const row of list) {
    const questions = bySection.get(row.section_id) ?? new Map<string, GradingQueueRow[]>();
    questions.set(row.block_id, [...(questions.get(row.block_id) ?? []), row]);
    bySection.set(row.section_id, questions);
  }
  for (const questions of bySection.values()) {
    for (const blockRows of questions.values()) {
      blockRows.sort((a, b) => new Date(a.checked_at).getTime() - new Date(b.checked_at).getTime());
    }
  }
  return bySection;
}

export const rowKey = (row: GradingQueueRow) => `${row.check_id}:${row.block_id}`;

/** The next response still to grade after `selected`, in the order the list
 *  shows, wrapping to the top; null when nothing else is owed. Read over the
 *  WHOLE queue, so a row that just left the filtered list still has a place. */
export function nextOwedKey(
  rows: readonly GradingQueueRow[],
  selected: string | null,
  owed: (row: GradingQueueRow) => boolean,
): string | null {
  const ordered = [...groupRows(rows).values()].flatMap((q) => [...q.values()].flat());
  const at = ordered.findIndex((r) => rowKey(r) === selected);
  const hit =
    ordered.slice(at + 1).find(owed) ?? ordered.slice(0, Math.max(at, 0)).find(owed);
  return hit && rowKey(hit) !== selected ? rowKey(hit) : null;
}

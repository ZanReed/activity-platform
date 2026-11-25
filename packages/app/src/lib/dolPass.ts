// =============================================================================
// dolPass.ts — the teacher's side of the DoL pass (0070, D65 DL-11/DE-15/DE-16)
// -----------------------------------------------------------------------------
// Its own module, not lib/grading.ts: grading.ts reaches the STUDENT shell
// (released feedback), and nothing here is a student's — the shell budget
// (scripts/perf-budgets.mjs) pays for every byte a teacher-only helper adds.
// =============================================================================

import { supabase } from './supabase';
import { DOL_PASS_STATUS_RPC } from './edgeFunctions';
import type { CriterionEntry } from './grading';

/** One student holding the pass this activity's DoL can grant. */
export interface DolPassRow {
  student_id: string;
  /** 'auto' = the server marked the primary item right (here or on another
   *  activity of the same skill); 'teacher' = a teacher ticked it. */
  source: 'auto' | 'teacher';
  passed_at: string;
}

/** Who holds this DoL's pass (empty when the activity grants none). */
export async function fetchDolPassStatus(activityId: string): Promise<DolPassRow[]> {
  const { data, error } = await supabase.rpc(DOL_PASS_STATUS_RPC, { p_activity_id: activityId });
  if (error) throw new Error(error.message);
  return (data ?? []) as DolPassRow[];
}

/** The teacher's tick on a rubric primary (set) or the untick of THEIR OWN
 *  tick (clear) — an auto pass is never removed. Audited server-side. */
export async function setDolPass(checkId: string, passed: boolean): Promise<void> {
  const { error } = await supabase.rpc('set_dol_pass', { p_check_id: checkId, p_passed: passed });
  if (error) throw new Error(error.message);
}

/**
 * The prefill (DL-11 as amended by C-163): every rubric line tagged at the
 * BASE level is at full marks. The base level is:
 *   - `A` (nz-ncea's Achieved) when any line is tagged `A` — the catalogue's
 *     case, unchanged;
 *   - otherwise the level of the FIRST tagged line. Levels are written lowest
 *     first (`dol_rubric_levels: A, M, E`, and the editor's level picker
 *     follows the rubric's line order), so a teacher who names their own
 *     levels ("Basic, Proficient, Advanced") gets the prefill from the first.
 * No declared field: the prefill is a suggestion the teacher can untick, and
 * its note names the level it used. A rubric with no tagged line gets no
 * prefill and the teacher ticks unaided (801/04 today).
 */
export const NCEA_BASE_LEVEL = 'A';

export function baseLevelOf(
  spec: ReadonlyArray<{ level?: string }>,
): string | undefined {
  const levels = spec.map((c) => c.level).filter((l): l is string => l !== undefined && l !== '');
  return levels.includes(NCEA_BASE_LEVEL) ? NCEA_BASE_LEVEL : levels[0];
}

export function baseLevelMet(
  spec: ReadonlyArray<{ id: string; maxPoints: number; level?: string }>,
  entries: ReadonlyArray<CriterionEntry>,
): boolean {
  const level = baseLevelOf(spec);
  if (level === undefined) return false;
  const base = spec.filter((c) => c.level === level);
  return base.every((c) => (entries.find((e) => e.criterionId === c.id)?.earned ?? 0) >= c.maxPoints);
}

/** The tick's copy (DL-11). */
export const DOL_PASS_COPY = {
  label: 'DoL passed',
  hint: 'Tick when this answer shows the skill. Saved with the grade.',
  /** Names the base level it used: "Achieved" for `A`, else the teacher's own word. */
  prefill: (level: string) =>
    `Ticked because every ${level === NCEA_BASE_LEVEL ? 'Achieved' : `“${level}”`} line is at full marks. Untick if you disagree, then save.`,
  auto: 'Already passed: the student got this skill’s DoL right on a check.',
} as const;

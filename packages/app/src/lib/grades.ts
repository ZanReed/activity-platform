// =============================================================================
// grades.ts — manual grading data layer (Phase 2.6)
// -----------------------------------------------------------------------------
// Grades for short_answer / essay blocks: per-criterion earned points + feedback
// against the block's in-document rubric (read from the submission's pinned
// version). Grades are mutable and live in the `grades` table (migration 0010);
// writes are direct authenticated upserts, RLS-gated by can_grade_submission.
//
// The pure helpers here are the dashboard's grading arithmetic; the two async
// functions are the only DB touch points. `earned` is teacher-entered and thus
// authoritative — the RLS write gate is the trust boundary, not the client.
// =============================================================================

import type { Rubric, SubmissionResponses } from '@activity/schema';
import type { ActivityIndex, FreeTextInfo } from './submissions';
import { supabase } from './supabase';

// One criterion's grade, keyed to a RubricCriterion.id. `earned` in points; an
// unscored criterion is simply ABSENT (partial grading is allowed).
export interface CriterionGrade {
    criterionId: string;
    earned: number;
    feedback?: string;
}

// One block's grade for one submission (camelCase view of a `grades` row).
export interface BlockGrade {
    submissionId: string;
    blockId: string;
    criteria: CriterionGrade[];
    generalFeedback: string | null;
    gradedAt: string;
    updatedAt: string;
}

// grades[submissionId][blockId] = BlockGrade. Nested maps so the dashboard can
// ask "is this submission's block graded?" in O(1).
export type GradesBySubmission = Map<string, Map<string, BlockGrade>>;

export type GradingStatus = 'none' | 'partial' | 'full';

// ---- Pure helpers -----------------------------------------------------------

/** Sum of a rubric's criterion maxPoints (the denominator). */
export function rubricMaxPoints(rubric: Rubric): number {
    return rubric.criteria.reduce((sum, c) => sum + c.maxPoints, 0);
}

/**
 * The earned total for a block, clamped per criterion to [0, maxPoints] and
 * ignoring grades for criteria the rubric no longer has (a rubric edit after
 * grading). Criteria without a grade contribute 0.
 */
export function earnedTotal(
    rubric: Rubric,
    grade: BlockGrade | undefined,
): number {
    if (!grade) return 0;
    const byId = new Map(grade.criteria.map((c) => [c.criterionId, c.earned]));
    return rubric.criteria.reduce((sum, c) => {
        const raw = byId.get(c.id);
        if (raw === undefined || !Number.isFinite(raw)) return sum;
        return sum + Math.max(0, Math.min(raw, c.maxPoints));
    }, 0);
}

/**
 * Grading status of a block against its rubric: 'none' (no grade / no scored
 * criteria), 'full' (every rubric criterion has a finite earned entry), else
 * 'partial'. General feedback alone does NOT make a block graded — the rubric
 * criteria are what "graded" means.
 */
export function gradingStatus(
    rubric: Rubric,
    grade: BlockGrade | undefined,
): GradingStatus {
    if (!grade) return 'none';
    const scored = new Set(
        grade.criteria
            .filter((c) => Number.isFinite(c.earned))
            .map((c) => c.criterionId),
    );
    const hit = rubric.criteria.filter((c) => scored.has(c.id)).length;
    if (hit === 0) return 'none';
    return hit === rubric.criteria.length ? 'full' : 'partial';
}

// ---- Gradable blocks (dashboard) --------------------------------------------

// One rubric-bearing written response ready to grade: the block's info (with
// its rubric, read from the pinned version), the student's text, and the
// current grade + status. A short_answer/essay with NO rubric isn't "gradable"
// — it's just collected text (like self_explanation), read but not scored.
export interface GradableBlock {
    info: FreeTextInfo;
    rubric: Rubric;
    text: string;
    grade: BlockGrade | undefined;
    status: GradingStatus;
}

/**
 * The rubric-bearing, ANSWERED free-text blocks of one submission, in the
 * index's iteration order. Blocks without a rubric, or with an empty response,
 * are excluded (nothing to grade).
 */
export function gradableBlocks(
    index: ActivityIndex,
    responses: SubmissionResponses,
    grades: Map<string, BlockGrade> | undefined,
): GradableBlock[] {
    const free = responses.freeResponses ?? {};
    const out: GradableBlock[] = [];
    for (const [blockId, info] of index.freeText) {
        if (!info.rubric) continue;
        const resp = free[blockId];
        if (!resp || resp.text.trim().length === 0) continue;
        const grade = grades?.get(blockId);
        out.push({
            info,
            rubric: info.rubric,
            text: resp.text,
            grade,
            status: gradingStatus(info.rubric, grade),
        });
    }
    return out;
}

/** True when any answered rubric-bearing block isn't fully graded. */
export function submissionNeedsGrading(
    index: ActivityIndex,
    responses: SubmissionResponses,
    grades: Map<string, BlockGrade> | undefined,
): boolean {
    return gradableBlocks(index, responses, grades).some(
        (b) => b.status !== 'full',
    );
}

// ---- DB ---------------------------------------------------------------------

interface GradeRow {
    submission_id: string;
    block_id: string;
    criteria: unknown;
    general_feedback: string | null;
    graded_at: string;
    updated_at: string;
}

// Coerce a raw jsonb criteria array into typed CriterionGrades, dropping
// malformed entries (numeric coercion — PostgREST serializes numeric as string).
function parseCriteria(raw: unknown): CriterionGrade[] {
    if (!Array.isArray(raw)) return [];
    const out: CriterionGrade[] = [];
    for (const c of raw) {
        if (!c || typeof c !== 'object') continue;
        const o = c as Record<string, unknown>;
        const id = o.criterionId;
        const earned = Number(o.earned);
        if (typeof id !== 'string' || !Number.isFinite(earned)) continue;
        const entry: CriterionGrade = { criterionId: id, earned };
        if (typeof o.feedback === 'string' && o.feedback) entry.feedback = o.feedback;
        out.push(entry);
    }
    return out;
}

function rowToGrade(r: GradeRow): BlockGrade {
    return {
        submissionId: r.submission_id,
        blockId: r.block_id,
        criteria: parseCriteria(r.criteria),
        generalFeedback: r.general_feedback,
        gradedAt: r.graded_at,
        updatedAt: r.updated_at,
    };
}

/**
 * Load all grades for a set of submissions into the nested map. Empty input →
 * empty map (no query). RLS returns only grades the teacher may see.
 */
export async function loadGrades(
    submissionIds: string[],
): Promise<GradesBySubmission> {
    const out: GradesBySubmission = new Map();
    if (submissionIds.length === 0) return out;
    const { data, error } = await supabase
        .from('grades')
        .select(
            'submission_id, block_id, criteria, general_feedback, graded_at, updated_at',
        )
        .in('submission_id', submissionIds);
    if (error) throw new Error(error.message);
    for (const row of (data ?? []) as GradeRow[]) {
        const grade = rowToGrade(row);
        let bySub = out.get(grade.submissionId);
        if (!bySub) {
            bySub = new Map();
            out.set(grade.submissionId, bySub);
        }
        bySub.set(grade.blockId, grade);
    }
    return out;
}

export interface UpsertGradeInput {
    submissionId: string;
    blockId: string;
    gradedBy: string; // must equal auth.uid() (RLS WITH CHECK)
    criteria: CriterionGrade[];
    generalFeedback: string | null;
}

/**
 * Upsert one block's grade (insert or replace the (submission, block) row). The
 * DB trigger stamps updated_at + writes the audit row. Returns the saved grade.
 */
export async function upsertGrade(input: UpsertGradeInput): Promise<BlockGrade> {
    const { data, error } = await supabase
        .from('grades')
        .upsert(
            {
                submission_id: input.submissionId,
                block_id: input.blockId,
                graded_by: input.gradedBy,
                criteria: input.criteria,
                general_feedback: input.generalFeedback,
            },
            { onConflict: 'submission_id,block_id' },
        )
        .select(
            'submission_id, block_id, criteria, general_feedback, graded_at, updated_at',
        )
        .single();
    if (error) throw new Error(error.message);
    return rowToGrade(data as GradeRow);
}

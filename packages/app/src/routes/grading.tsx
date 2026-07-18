// =============================================================================
// grading.tsx — teacher grading UI for written responses (Phase 2.6 slice 4)
// -----------------------------------------------------------------------------
// A small context carries the loaded grades + the current teacher id + a
// save-callback down to each SubmissionDetail (which is rendered deep inside the
// summary/attempts tables, so context beats prop threading). GradingPanel
// renders one side-by-side grader per rubric-bearing answered block: the
// criteria with earned-points inputs + per-criterion feedback, plus a general
// feedback field, upserting on save.
//
// Grades don't exist until migration 0010 is applied; until then loadGrades
// returns empty and saves fail with the teacher-facing error surfaced inline.
// =============================================================================

import { createContext, useContext, useState } from 'react';
import type { RubricCriterion } from '@activity/schema';
import {
    upsertGrade,
    earnedTotal,
    rubricMaxPoints,
    type BlockGrade,
    type CriterionGrade,
    type GradableBlock,
    type GradesBySubmission,
    type GradingStatus,
} from '../lib/grades';

interface GradingContextValue {
    grades: GradesBySubmission;
    gradedBy: string | null;
    onSaved: (grade: BlockGrade) => void;
}

const GradingContext = createContext<GradingContextValue | null>(null);

export function GradingProvider({
    value,
    children,
}: {
    value: GradingContextValue;
    children: React.ReactNode;
}) {
    return (
        <GradingContext.Provider value={value}>{children}</GradingContext.Provider>
    );
}

export function useGrading(): GradingContextValue | null {
    return useContext(GradingContext);
}

const STATUS_LABEL: Record<GradingStatus, string> = {
    none: 'Not graded',
    partial: 'Partially graded',
    full: 'Graded',
};
const STATUS_CLASS: Record<GradingStatus, string> = {
    none: 'text-warning-text',
    partial: 'text-warning-text',
    full: 'text-success-strong',
};

/** The grader for every rubric-bearing block of one submission. */
export function GradingPanel({
    submissionId,
    blocks,
}: {
    submissionId: string;
    blocks: GradableBlock[];
}) {
    const grading = useGrading();
    if (blocks.length === 0) return null;
    // Manual (rubric) total across this submission's gradable blocks — shown as
    // a SEPARATE figure from the auto score, never merged into one number while
    // anything is still ungraded.
    const earned = blocks.reduce((s, b) => s + earnedTotal(b.rubric, b.grade), 0);
    const max = blocks.reduce((s, b) => s + rubricMaxPoints(b.rubric), 0);
    const anyUngraded = blocks.some((b) => b.status !== 'full');
    return (
        <div className="mt-4">
            <div className="flex items-baseline justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Grading
                </p>
                <p className="text-sm text-muted">
                    Rubric total:{' '}
                    <span className="font-medium text-ink">
                        {earned} / {max}
                    </span>
                    {anyUngraded && (
                        <span className="ml-1 text-xs italic text-warning-text">
                            (grading in progress)
                        </span>
                    )}
                </p>
            </div>
            <div className="mt-2 space-y-3">
                {blocks.map((b) => (
                    <BlockGrader
                        // Remount when the stored grade identity changes so local
                        // edit state re-seeds after an external save.
                        key={b.info.blockId + ':' + (b.grade?.updatedAt ?? 'new')}
                        submissionId={submissionId}
                        block={b}
                        gradedBy={grading?.gradedBy ?? null}
                        onSaved={grading?.onSaved}
                    />
                ))}
            </div>
        </div>
    );
}

function BlockGrader({
    submissionId,
    block,
    gradedBy,
    onSaved,
}: {
    submissionId: string;
    block: GradableBlock;
    gradedBy: string | null;
    onSaved: ((grade: BlockGrade) => void) | undefined;
}) {
    const { rubric, grade } = block;
    // Local edit state, seeded from the stored grade. Earned is a STRING so the
    // input can be cleared (an empty criterion = unscored, not zero).
    const seededEarned: Record<string, string> = {};
    const seededFeedback: Record<string, string> = {};
    for (const c of rubric.criteria) {
        const g = grade?.criteria.find((x) => x.criterionId === c.id);
        seededEarned[c.id] = g ? String(g.earned) : '';
        seededFeedback[c.id] = g?.feedback ?? '';
    }
    const [earned, setEarned] = useState(seededEarned);
    const [feedback, setFeedback] = useState(seededFeedback);
    const [general, setGeneral] = useState(grade?.generalFeedback ?? '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Live earned total from the current inputs (clamped per criterion).
    const liveEarned = rubric.criteria.reduce((sum, c) => {
        const n = Number(earned[c.id]);
        if (earned[c.id]?.trim() === '' || !Number.isFinite(n)) return sum;
        return sum + Math.max(0, Math.min(n, c.maxPoints));
    }, 0);
    const max = rubricMaxPoints(rubric);

    const save = async () => {
        if (!gradedBy) {
            setError('Not signed in.');
            return;
        }
        const criteria: CriterionGrade[] = [];
        for (const c of rubric.criteria) {
            const raw = earned[c.id];
            const n = Number(raw);
            if (raw?.trim() === '' || !Number.isFinite(n)) continue; // unscored → absent
            const entry: CriterionGrade = { criterionId: c.id, earned: n };
            const fb = feedback[c.id]?.trim();
            if (fb) entry.feedback = fb;
            criteria.push(entry);
        }
        setSaving(true);
        setError(null);
        try {
            const saved = await upsertGrade({
                submissionId,
                blockId: block.info.blockId,
                gradedBy,
                criteria,
                generalFeedback: general.trim() || null,
            });
            onSaved?.(saved);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Save failed.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="rounded-md border border-line bg-canvas p-3">
            <div className="flex items-baseline justify-between">
                <p className="text-sm font-medium text-strong">
                    {block.info.problemPrompt || 'Written response'}
                </p>
                <span className={`text-xs font-medium ${STATUS_CLASS[block.status]}`}>
                    {STATUS_LABEL[block.status]}
                </span>
            </div>
            <div className="mt-2 space-y-2">
                {rubric.criteria.map((c: RubricCriterion) => (
                    <div key={c.id} className="grid grid-cols-[1fr_auto] gap-2">
                        <div>
                            <label className="text-sm text-strong">{c.label}</label>
                            {c.description && (
                                <p className="text-xs text-muted">{c.description}</p>
                            )}
                            <input
                                type="text"
                                className="mt-1 w-full rounded border border-line-strong px-2 py-1 text-sm"
                                placeholder="Feedback (optional)"
                                value={feedback[c.id] ?? ''}
                                onChange={(e) =>
                                    setFeedback((f) => ({ ...f, [c.id]: e.target.value }))
                                }
                            />
                        </div>
                        <div className="flex items-start gap-1 whitespace-nowrap pt-0.5 text-sm text-muted">
                            <input
                                type="number"
                                min={0}
                                max={c.maxPoints}
                                step={0.5}
                                className="w-16 rounded border border-line-strong px-2 py-1 text-right text-sm"
                                placeholder="—"
                                value={earned[c.id] ?? ''}
                                onChange={(e) =>
                                    setEarned((s) => ({ ...s, [c.id]: e.target.value }))
                                }
                            />
                            <span className="pt-1.5">/ {c.maxPoints}</span>
                        </div>
                    </div>
                ))}
            </div>
            <textarea
                className="mt-2 w-full rounded border border-line-strong px-2 py-1 text-sm"
                rows={2}
                placeholder="General feedback (optional)"
                value={general}
                onChange={(e) => setGeneral(e.target.value)}
            />
            <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-medium text-strong">
                    {liveEarned} / {max} points
                </span>
                <div className="flex items-center gap-3">
                    {error && <span className="text-xs text-danger">{error}</span>}
                    <button
                        type="button"
                        onClick={save}
                        disabled={saving || !gradedBy}
                        className="rounded bg-primary px-3 py-1 text-sm font-medium text-white disabled:opacity-50"
                    >
                        {saving ? 'Saving…' : 'Save grade'}
                    </button>
                </div>
            </div>
        </div>
    );
}

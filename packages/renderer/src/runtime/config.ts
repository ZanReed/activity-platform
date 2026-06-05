// =============================================================================
// runtime/config.ts — Activity-level immutable configuration
// -----------------------------------------------------------------------------
// Mirrors the shape of the activity-config JSON blob the renderer emits in
// document.ts (post-Step-5 expanded to six fields). Parsed once on init;
// immutable thereafter.
//
// Local mirror — no schema import. The runtime keeps its size budget by not
// pulling in @activity/schema. If the renderer's blob shape changes, update
// this interface and the parser defensively rejects malformed shapes.
// =============================================================================

export type SubmissionMode = 'single' | 'locked' | 'free';
export type RevisionMode = 'free' | 'locked';
export type GradingMode = 'auto' | 'manual' | 'mixed';
export type AnswerFeedback = 'immediate' | 'on_check';

export interface RuntimeConfig {
    /** UUID of the activity, included in submission payload. */
    activityId: string;
    /** Version number of this published HTML — surfaced on submissions for
     *  attempt tracking and dashboard filtering. */
    versionNum: number;
    /** Absolute URL to POST submissions to (the ingest-submission Edge Function). */
    submissionEndpoint: string;
    /** Whether the activity uses per-section checkpoints (and how). */
    submissionMode: SubmissionMode;
    /** Whether the student can revise after final submit. */
    revisionMode: RevisionMode;
    /** Phase 2.6+ forward-compat: who scores the activity. 'auto' for Phase 1. */
    gradingMode: GradingMode;
    /** When a blank's correct/incorrect signal becomes visible: 'immediate'
     *  (self-check on blur) or 'on_check' (only after a section check / submit). */
    answerFeedback: AnswerFeedback;
}

/**
 * Parse the #activity-config script tag. Returns null on any failure —
 * missing element, malformed JSON, or missing/wrong-typed required field.
 * The caller falls back to a no-op runtime when config is unavailable
 * (per RUNTIME.md "graceful degradation" — never throw to the student).
 *
 * Defensive type-checking each required field guards against a renderer
 * regression that emits a malformed blob. Enum values aren't fully
 * validated here (a malformed submissionMode will get caught downstream
 * by the checkpoint-mode branching); we just type-check enough to make
 * the cast safe.
 */
export function parseConfig(doc: Document = document): RuntimeConfig | null {
    const el = doc.getElementById('activity-config');
    if (!el) return null;
    let parsed: unknown;
    try {
        parsed = JSON.parse(el.textContent || '{}');
    } catch {
        return null;
    }
    if (!parsed || typeof parsed !== 'object') return null;
    const obj = parsed as Record<string, unknown>;
    if (typeof obj.activityId !== 'string') return null;
    if (typeof obj.versionNum !== 'number') return null;
    if (typeof obj.submissionEndpoint !== 'string') return null;
    if (typeof obj.submissionMode !== 'string') return null;
    if (typeof obj.revisionMode !== 'string') return null;
    if (typeof obj.gradingMode !== 'string') return null;
    // answerFeedback is NOT required: activities published before this field
    // existed have a config blob without it. Coerce missing/invalid to
    // 'immediate' — that was their behavior before the field, so old pages
    // keep self-checking on blur. Newly published pages carry an explicit
    // value (default 'on_check' from the schema).
    const answerFeedback: AnswerFeedback =
    obj.answerFeedback === 'on_check' ? 'on_check' : 'immediate';
    return { ...(obj as unknown as RuntimeConfig), answerFeedback };
}

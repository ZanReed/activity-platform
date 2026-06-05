// =============================================================================
// runtime/refs.ts — Typed DOM references built by the init pass
// -----------------------------------------------------------------------------
// Refs are typed pointers to DOM nodes the runtime needs to read or write.
// Built once at init; immutable thereafter. State mutates; refs don't (the
// runtime treats them as Readonly<>).
//
// Each ref carries parsed data-* attributes so downstream code doesn't
// re-query them. Scoring and feedback functions operate on these refs as
// pure inputs — no DOM queries inside hot paths (RUNTIME.md "Don't query
// the DOM inside scoring or state functions").
//
// Refs maps are keyed by the schema's stable uuid for that entity (blank.id,
// block.id, section.id), so reordering blocks across document versions
// doesn't break the reference. Maps (not plain objects) because they aren't
// serialized — only state is — and Map iteration is cleaner.
// =============================================================================

/** One per <input class="blank">. */
export interface BlankRef {
    /** The text input the student types into. */
    input: HTMLInputElement;
    /** The sibling .js-blank-feedback span the runtime renders ✓/✗ into. */
    feedbackEl: HTMLElement;
    /** The .js-blank-hint button — null when the blank has no hint. Opens the global hint modal. */
    hintButton: HTMLButtonElement | null;
    /** Pipe-separated answers from data-blank-answers, parsed into an array. */
    answers: string[];
    /** Scoring strategy name (defaults to 'list' when attribute is absent). */
    strategy: string;
    /** Teacher-authored hint text, mirroring data-hint. Null when absent. */
    hint: string | null;
    /** Parsed mistakeFeedback (empty array when attribute is absent or malformed). */
    mistakeFeedback: Array<{ match: string; feedback: string }>;
    /** ID of the parent fill_in_blank block. */
    blockId: string;
    /** ID of the section the parent block belongs to. */
    sectionId: string;
}

/** One per fill_in_blank block. */
export interface FillInBlankRef {
    /** The block <div>. */
    el: HTMLElement;
    /** IDs of every blank inside this block (in document order). */
    blankIds: string[];
    /** Teacher-authored solution text — null when not authored. */
    solution: string | null;
    /** The .js-solution slot the runtime reveals at check time — null when no solution. */
    solutionEl: HTMLElement | null;
    /** Whether the block surfaces a confidence-rating fieldset. */
    hasConfidenceRating: boolean;
    /** The fieldset element when hasConfidenceRating is true — null otherwise. */
    confidenceFieldset: HTMLFieldSetElement | null;
    /**
     * Radio inputs inside the confidence fieldset, in document order.
     * Empty array when hasConfidenceRating is false or no radios are
     * present. Populated once at init time so render and wireConfidence
     * don't re-query the DOM on every render/event tick.
     */
    confidenceRadios: HTMLInputElement[];
    /** Skill tags from data-skills (empty array when attribute is absent). */
    skills: string[];
    /** ID of the section this block belongs to. */
    sectionId: string;
}

/** One per <section class="activity-section">. */
export interface SectionRef {
    /** The section element. */
    el: HTMLElement;
    /**
     * Whether this section is flagged as a checkpoint.
     * False when the attribute is absent entirely (single mode) AND when
     * the attribute is present-and-"false" (non-checkpoint section in
     * locked/free mode). The runtime distinguishes via SectionRef.checkButton
     * presence rather than re-reading the attribute.
     */
    isCheckpoint: boolean;
    /** IDs of every blank in this section's blocks (across all its blocks). */
    blankIds: string[];
    /** IDs of every fill_in_blank block in this section. */
    blockIds: string[];
    /** The .js-checkpoint-btn — present only on checkpoint sections in locked/free mode. */
    checkButton: HTMLButtonElement | null;
    /** The .js-section-score slot — present only on checkpoint sections in locked/free mode. */
    scoreEl: HTMLElement | null;
}

/**
 * The single global hint modal (one per page). Null when the page emitted no
 * modal markup (e.g. an activity with no authored hints, or older HTML) — the
 * runtime then treats hint buttons as no-ops rather than crashing.
 */
export interface HintModalRef {
    /** The full-screen overlay (.js-hint-modal). Clicking it (outside the dialog) closes. */
    overlay: HTMLElement;
    /** The centered dialog box (.js-hint-modal-dialog). */
    dialog: HTMLElement;
    /** The .js-hint-modal-body element the runtime writes the active hint text into. */
    bodyEl: HTMLElement;
    /** The × close button (.js-hint-modal-close). */
    closeButton: HTMLButtonElement;
}

/** The bundle of refs maps the init pass produces. */
export interface Refs {
    blanks: Map<string, BlankRef>;
    fillInBlanks: Map<string, FillInBlankRef>;
    sections: Map<string, SectionRef>;
    /** The global hint modal, or null when the page has no modal markup. */
    hintModal: HintModalRef | null;
}

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
    /** The .js-blank-hint button — null when the blank has no hint. Opens the hint popover. */
    hintButton: HTMLButtonElement | null;
    /**
     * The red .js-blank-mistake `!` button — null when the blank has no
     * authored mistake feedback. Hidden until a wrong answer matches an
     * entry (render reveals it); clicking it opens the mistake popover.
     */
    mistakeButton: HTMLButtonElement | null;
    /** Pipe-separated answers from data-blank-answers, parsed into an array. */
    answers: string[];
    /** Scoring strategy name (defaults to 'list' when attribute is absent). */
    strategy: string;
    /**
     * The .js-blank-hint-content <template> holding the hint's pre-rendered
     * rich content. Null when the blank has no hint. Cloned into the popover
     * body on open (never re-rendered — KaTeX already ran server-side).
     */
    hintContent: HTMLTemplateElement | null;
    /**
     * Authored mistake-feedback entries, in document order. Each pairs the
     * `match` string (for wrong-answer matching) with the .js-blank-mistake-
     * content <template> holding that entry's pre-rendered rich content.
     * Empty array when the blank has no authored mistake feedback.
     */
    mistakeFeedback: Array<{ match: string; content: HTMLTemplateElement }>;
    /** ID of the parent fill_in_blank block. */
    blockId: string;
    /** ID of the section the parent block belongs to. */
    sectionId: string;
    /**
     * data-blank-group id when this blank belongs to an order-independent
     * group (2+ adjacent interchangeable blanks); null when ungrouped. Blanks
     * sharing a groupId are scored together with consume-once matching so
     * answers count in any order but each correct answer satisfies only one
     * blank. Set once at init from the data attribute; never queried again.
     */
    groupId: string | null;
}

/** One per fill_in_blank block. */
export interface FillInBlankRef {
    /** The block <div>. */
    el: HTMLElement;
    /** IDs of every blank inside this block (in document order). */
    blankIds: string[];
    /**
     * The .js-solution slot (holding pre-rendered rich content) the runtime
     * reveals at check time — null when no solution was authored. Its mere
     * presence is the "has a solution" signal; there is no separate string.
     */
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

/** One per multiple_choice block. */
export interface McRef {
    /** The block <div>. */
    el: HTMLElement;
    /** Choice inputs (radio or checkbox), in document order. */
    inputs: HTMLInputElement[];
    /** data-choice-id per input — parallel to `inputs`. */
    choiceIds: string[];
    /** The .mc-choice <label> wrapping each input — parallel to `inputs`. */
    labels: HTMLElement[];
    /** Correct choice ids parsed from data-mc-answer (the baked answer key). */
    correctIds: string[];
    /** "Select all that apply" (checkboxes) vs single-select (radios). */
    multiSelect: boolean;
    /**
     * Per-choice feedback divs (.js-mc-feedback), keyed by choice id. Only
     * choices with authored feedback have an entry. Pre-rendered server-side;
     * render() just toggles `hidden` post-check for selected choices.
     */
    feedbackEls: Record<string, HTMLElement>;
    /** The .js-solution slot, revealed at check time; null when none authored. */
    solutionEl: HTMLElement | null;
    /** Whether the block surfaces a confidence-rating fieldset. */
    hasConfidenceRating: boolean;
    /** Radios inside the confidence fieldset (empty when none). */
    confidenceRadios: HTMLInputElement[];
    /** Skill tags from data-skills (empty when absent). */
    skills: string[];
    /** ID of the section this block belongs to. */
    sectionId: string;
}

/** One left-column item inside a matching block. */
export interface MatchItemRef {
    /** The .match-item row. */
    el: HTMLElement;
    /** The .match-slot dock render() parks a target card (or chip) into. */
    slot: HTMLElement;
}

/** One right-column target card inside a matching block. */
export interface MatchTargetRef {
    /** The draggable .match-target card. */
    card: HTMLElement;
    /** The .match-target-slot home wrapper (holds the ghost letter). */
    home: HTMLElement;
    /** The card's letter (A…), fixed by the publish-time shuffle. */
    letter: string;
}

/** One per matching block. */
export interface MatchRef {
    /** The block <div>. */
    el: HTMLElement;
    /** Item ids in document order — the per-pair scoring denominator. */
    itemIds: string[];
    /** Per-item refs, keyed by item id. */
    items: Map<string, MatchItemRef>;
    /** Target ids in rendered (publish-time shuffled) order. */
    targetIds: string[];
    /** Per-target refs, keyed by target id. */
    targets: Map<string, MatchTargetRef>;
    /** The baked answer key from data-match-key (item id → target id). */
    key: Record<string, string>;
    /** Many-to-one docking allowed (data-match-reuse) — dock COPIES the card. */
    allowReuse: boolean;
    /** The .js-match-status live region for drag/keyboard narration. */
    statusEl: HTMLElement | null;
    /** The .js-solution slot, revealed at check time; null when none authored. */
    solutionEl: HTMLElement | null;
    /** Whether the block surfaces a confidence-rating fieldset. */
    hasConfidenceRating: boolean;
    /** Radios inside the confidence fieldset (empty when none). */
    confidenceRadios: HTMLInputElement[];
    /** Skill tags from data-skills (empty when absent). */
    skills: string[];
    /** ID of the section this block belongs to. */
    sectionId: string;
}

/** One per ordering block. */
export interface OrderingRef {
    /** The block <div>. */
    el: HTMLElement;
    /** The .order-list container render() re-sequences. */
    list: HTMLElement;
    /** Item elements keyed by item id. */
    items: Map<string, HTMLElement>;
    /** Item ids in the rendered (publish-time shuffled) order at load. */
    initialOrder: string[];
    /** The authored (correct) order from data-order-answer. */
    answer: string[];
    /** The .js-order-status live region for drag/keyboard narration. */
    statusEl: HTMLElement | null;
    /** The .js-solution slot, revealed at check time; null when none authored. */
    solutionEl: HTMLElement | null;
    /** Whether the block surfaces a confidence-rating fieldset. */
    hasConfidenceRating: boolean;
    /** Radios inside the confidence fieldset (empty when none). */
    confidenceRadios: HTMLInputElement[];
    /** Skill tags from data-skills (empty when absent). */
    skills: string[];
    /** ID of the section this block belongs to. */
    sectionId: string;
}

/**
 * One per graded interactive_graph block. SLIM since the 2026-07-10 bundle-
 * budget move: only what the INLINE runtime consumes — scoring totals, the
 * submit gather (interactionType), confidence wiring (confidence.ts), and the
 * kit hand-off (el/canvas/kitSrc). The heavy fields (parsed config, answer
 * key, mistake templates, chrome elements, the widget handle) live in the
 * lazy kit's own chrome refs (@activity/graph-kit runtime.ts), which parses
 * them from `el` when it attaches.
 */
export interface GraphRef {
    /** The block <div> — the kit parses its data-* attributes on attach. */
    el: HTMLElement;
    /** The .graph-canvas the kit mounts the board into. */
    canvas: HTMLElement;
    /** Absolute URL of the graph kit on R2; null when unavailable (no hydrate). */
    kitSrc: string | null;
    /** The block's interaction discriminant (e.g. 'plot_point'). */
    interactionType: string;
    /** Whether the block surfaces a confidence-rating fieldset. */
    hasConfidenceRating: boolean;
    /** Radios inside the confidence fieldset (empty when none). */
    confidenceRadios: HTMLInputElement[];
    /** ID of the section this block belongs to. */
    sectionId: string;
}

/**
 * One per DISPLAY (static, ungraded) interactive_graph block. Never scored,
 * never in graphBlockIds; the kit parses config/drawables from `el` and mounts
 * a read-only figure into `canvas`.
 */
export interface GraphDisplayRef {
    /** The block <div> — the kit parses config/drawables from it on attach. */
    el: HTMLElement;
    /** The .graph-canvas the kit draws the static figure into. */
    canvas: HTMLElement;
    /** Absolute URL of the graph kit on R2; null when unavailable (no hydrate). */
    kitSrc: string | null;
}

/**
 * One per graded number_line block. SLIM like GraphRef — only what the INLINE
 * runtime consumes: scoring totals, the submit gather (interactionType),
 * confidence wiring, and the kit hand-off (el/canvas/kitSrc). The kit parses
 * config + answer key from `el` when it attaches (numberLineExt.wire).
 */
export interface NumberLineRef {
    /** The block <div> — the kit parses its data-* attributes on attach. */
    el: HTMLElement;
    /** The .number-line-canvas the kit mounts the board into. */
    canvas: HTMLElement;
    /** Absolute URL of the graph kit on R2; null when unavailable (no hydrate). */
    kitSrc: string | null;
    /** The block's interaction discriminant ('plot_point' | 'plot_interval'). */
    interactionType: string;
    /** Whether the block surfaces a confidence-rating fieldset. */
    hasConfidenceRating: boolean;
    /** Radios inside the confidence fieldset (empty when none). */
    confidenceRadios: HTMLInputElement[];
    /** ID of the section this block belongs to. */
    sectionId: string;
}

/**
 * One per graded data_plot block (build_dotplot). SLIM like NumberLineRef — only
 * what the INLINE runtime consumes: scoring totals, the submit gather, confidence
 * wiring, and the kit hand-off. The kit parses config + the dataset from `el`
 * when it attaches (dataPlotExt.wire). (Display data_plots are static SVG the
 * renderer draws — they never reach the runtime, so there is no display ref.)
 */
export interface DataPlotRef {
    /** The block <div> — the kit parses its data-* attributes on attach. */
    el: HTMLElement;
    /** The .data-plot-canvas the kit mounts the board into. */
    canvas: HTMLElement;
    /** Absolute URL of the graph kit on R2; null when unavailable (no hydrate). */
    kitSrc: string | null;
    /** The block's interaction discriminant ('build_dotplot'). */
    interactionType: string;
    /** Whether the block surfaces a confidence-rating fieldset. */
    hasConfidenceRating: boolean;
    /** Radios inside the confidence fieldset (empty when none). */
    confidenceRadios: HTMLInputElement[];
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
    /** IDs of every interactive_graph block in this section (each scores as 1). */
    graphBlockIds: string[];
    /** IDs of every number_line block in this section (each scores as 1). */
    numberLineBlockIds: string[];
    /** IDs of every graded data_plot block in this section (each scores as 1). */
    dataPlotBlockIds: string[];
    /** IDs of every multiple_choice block in this section (each scores as 1). */
    mcBlockIds: string[];
    /** IDs of every matching block in this section (each pair scores as 1). */
    matchBlockIds: string[];
    /** IDs of every ordering block in this section (each scores as 1). */
    orderingBlockIds: string[];
    /** The .js-checkpoint-btn — present only on checkpoint sections in locked/free mode. */
    checkButton: HTMLButtonElement | null;
    /** The .js-section-score slot — present only on checkpoint sections in locked/free mode. */
    scoreEl: HTMLElement | null;
}

/**
 * The single floating popover (one per page) shared by hint and mistake
 * feedback. Null when the page emitted no popover markup (older HTML) — the
 * runtime then treats trigger buttons as no-ops rather than crashing.
 *
 * Unlike the old hint modal there is no full-screen overlay: the popover is a
 * bare anchored panel that does not dim the page. Closing is handled by the
 * runtime (× button, Escape, or a click outside the popover/trigger/owning
 * input); dragging the header repositions it.
 */
export interface PopoverRef {
    /** The floating panel (.js-popover). */
    el: HTMLElement;
    /** The header bar (.js-popover-header) — doubles as the drag handle. */
    header: HTMLElement;
    /** The title element (.js-popover-title) — set to "Hint"/"Feedback" per kind. */
    titleEl: HTMLElement;
    /** The .js-popover-body element the runtime writes the active text into. */
    bodyEl: HTMLElement;
    /** The × close button (.js-popover-close). */
    closeButton: HTMLButtonElement;
}

/** The bundle of refs maps the init pass produces. */
export interface Refs {
    blanks: Map<string, BlankRef>;
    fillInBlanks: Map<string, FillInBlankRef>;
    mcs: Map<string, McRef>;
    matches: Map<string, MatchRef>;
    orderings: Map<string, OrderingRef>;
    graphs: Map<string, GraphRef>;
    /** Static (display-mode) graph blocks — mounted read-only, never scored. */
    graphDisplays: Map<string, GraphDisplayRef>;
    /** Graded number_line blocks (1-D) — ride the same lazy kit as graphs. */
    numberLines: Map<string, NumberLineRef>;
    /** Graded data_plot blocks (stats charts) — ride the same lazy kit as graphs. */
    dataPlots: Map<string, DataPlotRef>;
    sections: Map<string, SectionRef>;
    /** The shared floating popover, or null when the page has no popover markup. */
    popover: PopoverRef | null;
}

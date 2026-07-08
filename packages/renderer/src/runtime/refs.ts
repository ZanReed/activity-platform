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

// The handle the lazy-loaded graph kit returns from mountGraphQuestion. A
// parallel structural type (the runtime never imports @activity/graph-kit — it
// dynamic-imports the built bundle by URL at runtime); the shape is the contract
// with graph-question.ts. studentPoints is the wire shape the kit reports.
export interface GraphResponseData {
    studentPoints: [number, number][];
    correct: boolean;
    answered: boolean;
    /** graph_inequality: dotted (strict) vs solid boundary. */
    strict?: boolean;
    /** graph_inequality: which side the student shaded. */
    side?: 'above' | 'below' | 'left' | 'right';
    /** The student chose "cannot be graphed / no solution". */
    noSolution?: boolean;
    /** Partial credit (partialCredit blocks): parts earned / parts total. */
    earned?: number;
    total?: number;
    /** Domain-restricted plot_function: endpoint positions + open/closed. */
    domain?: {
        minX?: number;
        minStyle?: 'open' | 'closed';
        maxX?: number;
        maxStyle?: 'open' | 'closed';
    };
    /** plot_ray / plot_segment: the student's chosen shape (a graded part;
     *  absent while unchosen). */
    shape?: 'ray_positive' | 'ray_negative' | 'segment';
    /** plot_ray: the drawn endpoint's style choice. */
    fromStyle?: 'open' | 'closed';
    /** plot_segment: per-endpoint style choices, canonical order. */
    endpoints?: ['open' | 'closed', 'open' | 'closed'];
    /** Matched authored anticipated mistake — index into the block's
     *  js-graph-mistake-content templates. Wrong answers only. */
    mistakeIndex?: number;
    /** Built-in classifier message for a recognized wrong answer (no authored
     *  match). Wrong answers only. */
    mistakeText?: string;
}
export interface GraphWidgetHandle {
    getResponse(): GraphResponseData;
    restore(
        points: [number, number][],
        extras?: {
            strict?: boolean;
            side?: GraphResponseData['side'];
            noSolution?: boolean;
            domain?: GraphResponseData['domain'];
            shape?: GraphResponseData['shape'];
            fromStyle?: GraphResponseData['fromStyle'];
            endpoints?: GraphResponseData['endpoints'];
        },
    ): void;
    setLocked(locked: boolean): void;
    destroy(): void;
}

/** One per interactive_graph block. */
export interface GraphRef {
    /** The block <div>. */
    el: HTMLElement;
    /** The .graph-canvas the kit mounts the board into. */
    canvas: HTMLElement;
    /** The .js-graph-feedback aria-live region (narration + result). */
    feedbackEl: HTMLElement | null;
    /** The .js-solution slot, revealed at check time; null when none authored. */
    solutionEl: HTMLElement | null;
    /** Absolute URL of the graph kit on R2; null when unavailable (no hydrate). */
    kitSrc: string | null;
    /** The block's interaction discriminant (e.g. 'plot_point'). */
    interactionType: string;
    /** Parsed data-graph-config (AxisConfig) — passed straight to the kit. */
    config: unknown;
    /** Parsed data-graph-answer-key — passed to the kit for client-side scoring. */
    answerKey: unknown;
    /** Whether the block surfaces a confidence-rating fieldset. */
    hasConfidenceRating: boolean;
    /** Radios inside the confidence fieldset (empty when none). */
    confidenceRadios: HTMLInputElement[];
    /** Skill tags from data-skills (empty when absent). */
    skills: string[];
    /** Per-part fractional scoring (data-graph-partial-credit). */
    partialCredit: boolean;
    /** Student gets a "cannot be graphed" choice (data-graph-allow-no-solution). */
    allowNoSolution: boolean;
    /** Trick question: no-solution IS the answer (data-graph-no-solution-correct). */
    noSolutionCorrect: boolean;
    /** Authored anticipated-mistake match strings (data-graph-mistakes),
     *  index-aligned with mistakeTemplates. Empty when none authored. */
    mistakes: string[];
    /** Built-in mistake classifiers enabled (data-graph-builtin-feedback;
     *  absent = true — omit-when-default). */
    builtinFeedback: boolean;
    /** Pre-rendered rich feedback templates (js-graph-mistake-content), in
     *  authored order; render() clones the matched one into the feedback line. */
    mistakeTemplates: HTMLTemplateElement[];
    /** ID of the section this block belongs to. */
    sectionId: string;
    /**
     * The kit widget handle, acquired ASYNCHRONOUSLY after init when the sidecar
     * mounts the board. Null until then (and forever if no kitSrc / the kit
     * fails to load). This is the one mutable field on a ref: the handle is a
     * runtime-acquired resource, not a DOM node discoverable at init. render()
     * reads it to lock the widget; the sidecar (graphs.ts) writes it once.
     */
    handle: GraphWidgetHandle | null;
}

/**
 * One per DISPLAY (static, ungraded) interactive_graph block. Deliberately much
 * thinner than GraphRef: a display graph collects no answer, so there is no
 * answer key, no confidence, no scoring state, and it is NOT in any section's
 * graphBlockIds. The sidecar just mounts a read-only figure into `canvas`.
 */
export interface GraphDisplayRef {
    /** The .graph-canvas the kit draws the static figure into. */
    canvas: HTMLElement;
    /** Absolute URL of the graph kit on R2; null when unavailable (no hydrate). */
    kitSrc: string | null;
    /** Parsed data-graph-config (AxisConfig) — passed straight to the kit. */
    config: unknown;
    /** Parsed data-graph-drawables (the figure to draw) — passed to the kit. */
    drawables: unknown;
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
    graphs: Map<string, GraphRef>;
    /** Static (display-mode) graph blocks — mounted read-only, never scored. */
    graphDisplays: Map<string, GraphDisplayRef>;
    sections: Map<string, SectionRef>;
    /** The shared floating popover, or null when the page has no popover markup. */
    popover: PopoverRef | null;
}

// =============================================================================
// importFormatRegistry.ts — the machine-readable index of the import surface
// -----------------------------------------------------------------------------
// A declarative list of every capability the markdown importer
// (markdownToTiptap.ts) exposes: each fenced block DSL, its recognized options,
// and the inline fill-in-the-blank grammar. This is the "capability registry"
// artifact — a single structured source other tooling can read — AND the anchor
// for an anti-drift guard: importFormatRegistry.test.ts binds this list to the
// three hand-maintained artifacts so none can silently diverge.
//
//   registry  ←→  parser   every fence the parser DISPATCHES is listed here and
//                          vice-versa (source-scan); every listed fence/option
//                          actually imports (behavioral).
//   registry  ←→  prompt   every fence tag + option appears in
//                          MARKDOWN_IMPORT_AI_PROMPT (so the AI prompt teaches it).
//
// This registry is DATA, not codegen: the prompt (markdownImportPrompt.ts) and
// the doc (docs/markdown-import-format.md) stay hand-written for prose quality;
// the registry + its test only guarantee they never OMIT or CONTRADICT a real
// capability. Add a fence/option to the parser and this list (and the prompt) or
// the guard goes red. See docs/capability-inventory.md §5 for the seam rationale
// and the heavier codegen/parser-consuming variants deliberately not taken here.
// =============================================================================

// A fenced block DSL — ```<tag> … ```.
export interface FenceSpec {
    // The fence info string the parser dispatches on (markdownToTiptap.ts mapBlock).
    tag: string;
    // The Tiptap node type a successful import produces.
    blockType: string;
    // One-line human description (mirrors the prompt/doc intent).
    summary: string;
    // A MINIMAL fence BODY (no ``` lines) that imports successfully to blockType
    // with no warning — the behavioral probe the guard runs.
    example: string;
    // `options:`-line keywords this fence accepts. The guard checks each is (a)
    // accepted by the parser and (b) named in the prompt.
    options?: string[];
    // True when the fence's blocks land in ImportResult.referencePanel (the
    // reference-panel side channel) instead of the body — the guard probes
    // that field for blockType.
    panel?: boolean;
    // True for the ```definitions fence, a THIRD kind of side channel: it
    // contributes no blocks anywhere. Its content reaches the document only
    // through a [[term]] mark in the body, so the guard appends a reference to
    // `probeTerm` and looks for blockType inside that mark's content.
    definitions?: boolean;
    probeTerm?: string;
    // True for the ```meta fence, a FOURTH kind of side channel: it produces
    // no blocks ANYWHERE (not even inside a mark, unlike ```definitions) —
    // it describes the activity rather than filling it, landing in
    // ImportResult.meta. The guard probes that object instead of the document.
    meta?: boolean;
}

// An inline fill-in-the-blank modifier — the `{{…}}` grammar.
export interface BlankModifierSpec {
    // The canonical syntax token, e.g. '{{=answer}}' (also asserted present in the prompt).
    syntax: string;
    summary: string;
    // A full markdown snippet that imports to a `blank` node.
    example: string;
}

// The fenced block DSLs (one entry per tag the parser dispatches — the source
// scan below keeps the count honest). `example` bodies are intentionally
// minimal — enough to import to `blockType` without a fallback/warning.
// Options mirror the `options:` switch in each parse*Fence (markdownToTiptap.ts).
export const FENCES: FenceSpec[] = [
    {
        tag: 'graph',
        blockType: 'interactiveGraph',
        summary: 'a coordinate-plane question (or a static display graph)',
        example: 'answer: y = 2x + 3',
        options: [
            'partial-credit',
            'allow-no-solution',
            'no-solution-correct',
            'no-builtin-feedback',
        ],
    },
    {
        tag: 'numberline',
        blockType: 'numberLine',
        summary: 'a 1-D number-line question (plot points or graph an inequality)',
        example: 'answer: x >= 3',
        options: ['confidence'],
    },
    {
        tag: 'dataplot',
        blockType: 'dataPlot',
        summary: 'a statistics-chart question (dot plot / histogram / box plot)',
        example: 'data: 1, 2, 3\nanswer: dotplot',
        options: ['confidence'],
    },
    {
        tag: 'mc',
        blockType: 'multipleChoice',
        summary: 'a multiple-choice question (single or select-all)',
        example: 'prompt: Pick one\n(x) yes\n( ) no',
        options: ['confidence'],
    },
    {
        tag: 'match',
        blockType: 'matching',
        summary: 'a matching question (items paired to options)',
        example: 'apple = fruit\ncarrot = vegetable',
        options: ['confidence', 'reuse'],
    },
    {
        tag: 'order',
        blockType: 'ordering',
        summary: 'a put-in-order question (listed order is the answer)',
        example: '1. first\n2. second',
        options: ['confidence'],
    },
    {
        tag: 'objectives',
        blockType: 'learningObjectives',
        summary: 'a learning-objectives list',
        example: 'Solve two-step equations',
    },
    {
        tag: 'worked',
        blockType: 'workedExample',
        summary: 'a boxed worked example to study',
        example: 'Subtract 3 from both sides.',
    },
    {
        tag: 'faded',
        blockType: 'fadedWorkedExample',
        summary: 'a guided example with student-completed (blank) steps',
        example: 'x = {{4}}',
    },
    {
        tag: 'explain',
        blockType: 'selfExplanation',
        summary: 'an ungraded free-text self-explanation prompt',
        example: 'Why did that step work?',
    },
    {
        tag: 'shortanswer',
        blockType: 'shortAnswer',
        summary: 'a graded short-answer question (optional rubric)',
        example: 'prompt: Explain why the sum of two evens is even.',
    },
    {
        tag: 'essay',
        blockType: 'essay',
        summary: 'a graded essay question (optional word-count target + rubric)',
        example: 'prompt: Argue whether zoos do more good than harm.',
    },
    {
        tag: 'columns',
        blockType: 'row',
        summary: 'a multi-column (side-by-side) row, columns divided by ---',
        example: 'left column\n---\nright column',
    },
    {
        tag: 'callout',
        blockType: 'callout',
        summary: 'a tinted note box (info / warning / success / note)',
        example: 'variant: warning\nDouble-check your units before submitting.',
    },
    {
        tag: 'reference',
        blockType: 'graphFigure',
        summary:
            'the reference panel (a summonable formula sheet, optionally with static graph figures) — content routes to the panel, not the body',
        example: 'title: Formulas\nSlope-intercept form: $y = mx + b$\ngraph: line y = 2x + 1',
        panel: true,
    },
    {
        tag: 'definitions',
        blockType: 'math_block',
        summary:
            'rich vocabulary definitions referenced from the body by [[term]] — entries split by ---, each headed by "term:"; use this when a definition needs an equation, a list, or a figure ([[term :: text]] still covers one-liners)',
        example:
            'term: Slope\nSteepness of a line — rise over run.\n$$m = \\frac{y_2 - y_1}{x_2 - x_1}$$',
        definitions: true,
        probeTerm: 'Slope',
    },
    {
        tag: 'meta',
        // No block type: the fence contributes nothing to the document. The
        // field is required by FenceSpec, so it names the ImportResult key the
        // guard probes instead.
        blockType: 'meta',
        summary:
            'activity metadata AND settings — title, course, unit, tags, Bank role, activity type, submission/revision mode, answer feedback, calculator — as plain `key: value` lines; applied only where the activity has no value yet, so a paste never overwrites anything you set by hand',
        example:
            'title: Factoring Trinomials\ncourse: Algebra I\nunit: Quadratics\ntags: factoring, vertex form\nrole: lesson\ntype: exit_ticket\nsubmission: locked\nrevision: locked\nfeedback: on_check\ncalculator: graphing',
        meta: true,
    },
];

// The inline fill-in-the-blank grammar (parseBlankSpec in markdownToTiptap.ts).
export const BLANK_MODIFIERS: BlankModifierSpec[] = [
    {
        syntax: '{{answer}}',
        summary: 'a text blank matched by exact string',
        example: 'The capital is {{Paris}}.',
    },
    {
        syntax: '{{answer|alt}}',
        summary: 'additional accepted answers after |',
        example: 'Made of {{oxygen|O2}}.',
    },
    {
        syntax: '{{~answer}}',
        summary: 'interchangeable with the previous blank (order-independent group)',
        example: '(x + {{2}})(x + {{~3}})',
    },
    {
        syntax: '{{=answer}}',
        summary: 'a numeric blank (equivalent forms count)',
        example: 'the area is {{=12}}.',
    },
    {
        syntax: '{{=answer +- tol}}',
        summary: 'a numeric blank with an absolute tolerance',
        example: 'pi is {{=3.14 +- 0.01}}.',
    },
    {
        syntax: '{{==expr}}',
        summary: 'a math-expression blank graded by equivalence',
        example: 'simplify to {{==2a}}.',
    },
    {
        syntax: '{{answer | ?hint}}',
        summary: 'a hint the student can open when stuck',
        example: 'The capital is {{Paris | ?It starts with P}}.',
    },
    {
        syntax: '{{answer | !wrong :: message}}',
        summary: 'targeted feedback for a specific anticipated wrong answer',
        example: "The capital is {{Paris | !Lyon :: that's the third-largest city}}.",
    },
    {
        syntax: '{{answer | ??x}}',
        summary: 'escape: an accepted answer that literally starts with ? or !',
        example: 'answer {{a | ??x}}',
    },
];

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { createInteractiveGraphBlock } from '@activity/schema';
import InteractiveGraphView from '../nodeViews/InteractiveGraphView';
import type { InlineNodes } from '../../lib/serialize';

// ============================================================================
// InteractiveGraph — Tiptap block node for the graded interactive-graph block
// (Stage 5 slice 2). Unlike Image (an atom), this node has EDITABLE inline
// content: the prompt (formatted text + inline math), edited in place via
// NodeViewContent. The geometry — axis config, the interaction + its answer
// key, the solution, confidence, skills — rides as structured attrs, mirrored
// into JSON data-* attributes so editor copy-paste round-trips.
//
// Only plot_point is functional today; the node/attrs and the NodeView's
// interaction picker are shaped so plot_line / shade_region slot in additively
// (a new interaction.type + a new authoring sub-component), per the agreed
// B-shape. serialize.ts maps this node <-> the schema's InteractiveGraphBlock.
// ============================================================================

// The structured shapes carried as attrs (parallel to @activity/schema, kept
// loose here — the schema Zod-validates on the serialize boundary).
export interface GraphAxisConfig {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
    xGridStep: number;
    yGridStep: number;
    showGrid: boolean;
    snapToGrid: boolean;
}
export interface PointInteractionAttr {
    type: 'plot_point';
    correctPoints: [number, number][];
    tolerance: number;
}
export interface LinearFunctionModel {
    family: 'linear';
    slope: number;
    intercept: number;
    slopeTolerance: number;
    interceptTolerance: number;
}
export interface QuadraticFunctionModel {
    family: 'quadratic';
    a: number; b: number; c: number;
    aTolerance: number; bTolerance: number; cTolerance: number;
}
export interface ExponentialFunctionModel {
    family: 'exponential';
    a: number; b: number;
    aTolerance: number; bTolerance: number;
}
export interface LogarithmicFunctionModel {
    family: 'logarithmic';
    a: number; b: number;
    aTolerance: number; bTolerance: number;
}
export interface VerticalFunctionModel {
    family: 'vertical';
    x: number; xTolerance: number;
}
// The editor's parallel FunctionModel union (mirrors the schema). The current
// authoring UI edits linear; freeform equation entry (Drop 3) produces the rest.
export type FunctionModelAttr =
    | LinearFunctionModel
    | QuadraticFunctionModel
    | ExponentialFunctionModel
    | LogarithmicFunctionModel
    | VerticalFunctionModel;
export interface RegionAnswerAttr {
    correctVertices: [number, number][];
    minOverlap: number;
}
// plot_function / shade_region carry ARRAYS of answer objects (ship as one) so
// systems of equations/regions are additive — see the schema.
export interface FunctionInteractionAttr {
    type: 'plot_function';
    models: FunctionModelAttr[];
}
export interface RegionInteractionAttr {
    type: 'shade_region';
    regions: RegionAnswerAttr[];
}
export interface InequalityAnswerAttr {
    boundary: FunctionModelAttr;
    strict: boolean;
    shadeSide: 'above' | 'below' | 'left' | 'right';
}
export interface InequalityInteractionAttr {
    type: 'graph_inequality';
    inequalities: InequalityAnswerAttr[];
}
export interface RayAnswerAttr {
    from: [number, number];
    through: [number, number];
    fromStyle: 'open' | 'closed';
    tolerance: number;
}
export interface RayInteractionAttr {
    type: 'plot_ray';
    rays: RayAnswerAttr[];
}
export interface SegmentAnswerAttr {
    from: [number, number];
    to: [number, number];
    endpoints: ['open' | 'closed', 'open' | 'closed'];
    tolerance: number;
}
export interface SegmentInteractionAttr {
    type: 'plot_segment';
    segments: SegmentAnswerAttr[];
}
// Static-display drawables (interaction.type === 'display'). Parallel to the
// schema's Drawable union; the NodeView reads them by `kind`. `curve` reuses the
// same FunctionModelAttr plot_function uses (a display curve is one curve).
export type DrawableAttr =
    | { kind: 'point'; at: [number, number]; label?: string; style?: 'open' | 'closed' }
    | {
          kind: 'curve';
          model: FunctionModelAttr;
          style?: 'solid' | 'dashed';
          shade?: 'above' | 'below' | 'left' | 'right';
          domain?: { min?: number; minStyle?: 'open' | 'closed'; max?: number; maxStyle?: 'open' | 'closed' };
          // Continuation arrowheads on unbounded ends; undefined = on.
          arrows?: boolean;
      }
    | { kind: 'expression'; expression: string; style?: 'solid' | 'dashed'; arrows?: boolean }
    | { kind: 'segment'; from: [number, number]; to: [number, number]; endpoints?: ['open' | 'closed', 'open' | 'closed'] }
    | { kind: 'ray'; from: [number, number]; through: [number, number]; fromStyle?: 'open' | 'closed'; arrows?: boolean }
    | { kind: 'polygon'; vertices: [number, number][]; filled: boolean };
export interface DisplayInteractionAttr {
    type: 'display';
    drawables: DrawableAttr[];
}
export type GraphInteraction =
    | PointInteractionAttr
    | FunctionInteractionAttr
    | RegionInteractionAttr
    | InequalityInteractionAttr
    | RayInteractionAttr
    | SegmentInteractionAttr
    | DisplayInteractionAttr;

// One authored anticipated mistake: a freeform wrong answer (same syntax as the
// formula field) + rich feedback. Mirrors the schema's mistakeFeedback entries.
export interface GraphMistakeEntry {
    match: string;
    feedback: InlineNodes;
}

// A fresh graph_inequality (y > x, strict, shade above) — used when the author
// switches the picker to "Graph an inequality". Array-of-one; systems later.
export function defaultInequalityInteraction(): InequalityInteractionAttr {
    return {
        type: 'graph_inequality',
        inequalities: [
            {
                boundary: {
                    family: 'linear',
                    slope: 1,
                    intercept: 0,
                    slopeTolerance: 0.1,
                    interceptTolerance: 0.1,
                },
                strict: true,
                shadeSide: 'above',
            },
        ],
    };
}

export function defaultRayInteraction(): RayInteractionAttr {
    return {
        type: 'plot_ray',
        rays: [{ from: [0, 0], through: [3, 3], fromStyle: 'closed', tolerance: 0.25 }],
    };
}

export function defaultSegmentInteraction(): SegmentInteractionAttr {
    return {
        type: 'plot_segment',
        segments: [{ from: [-2, 0], to: [3, 2], endpoints: ['closed', 'closed'], tolerance: 0.25 }],
    };
}

// A fresh display interaction — one point + one line so the author sees the
// figure immediately and can add/remove/edit drawables.
export function defaultDisplayInteraction(): DisplayInteractionAttr {
    return {
        type: 'display',
        drawables: [
            { kind: 'point', at: [2, 3] },
            {
                kind: 'curve',
                model: {
                    family: 'linear',
                    slope: 1,
                    intercept: 0,
                    slopeTolerance: 0.1,
                    interceptTolerance: 0.1,
                },
            },
        ],
    };
}

// A fresh plot_function interaction (a single linear curve, y = x) — used when
// the author switches the picker to "Plot a function". Typing a formula in any
// family (y = x², y = 2·3ˣ, …) re-derives the model + handle count from the
// formula field. Array-of-one; systems add more curves later.
export function defaultFunctionInteraction(): FunctionInteractionAttr {
    return {
        type: 'plot_function',
        models: [
            {
                family: 'linear',
                slope: 1,
                intercept: 0,
                slopeTolerance: 0.1,
                interceptTolerance: 0.1,
            },
        ],
    };
}

// A fresh plot_point interaction (one point at the origin).
export function defaultPointInteraction(): PointInteractionAttr {
    return { type: 'plot_point', correctPoints: [[0, 0]], tolerance: 0.1 };
}

// A fresh shade_region interaction — a single small triangle the author drags
// into shape. Array-of-one; systems of regions add more later.
export function defaultRegionInteraction(): RegionInteractionAttr {
    return {
        type: 'shade_region',
        regions: [{ correctVertices: [[0, 0], [4, 0], [2, 4]], minOverlap: 0.9 }],
    };
}

const defaults = createInteractiveGraphBlock();

// Parse a JSON data-* attribute, falling back to `fallback` on absence/garbage
// (a malformed clipboard payload degrades to defaults, never throws).
function parseJson<T>(raw: string | null, fallback: T): T {
    if (!raw) return fallback;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        interactiveGraph: {
            insertInteractiveGraph: () => ReturnType;
            /** Insert a static (display-mode) graph — an ungraded figure/exemplar. */
            insertStaticGraph: () => ReturnType;
        };
    }
}

export const InteractiveGraph = Node.create({
    name: 'interactiveGraph',
    group: 'block',
    content: '(text | mathInline)*',
    draggable: true,
    selectable: true,
    defining: true,

    addAttributes() {
        return {
            id: {
                default: '',
                parseHTML: (el) => el.getAttribute('data-block-id') ?? '',
                renderHTML: (attrs) =>
                    attrs.id ? { 'data-block-id': attrs.id } : {},
            },
            axisConfig: {
                default: defaults.axisConfig as GraphAxisConfig,
                parseHTML: (el) =>
                    parseJson<GraphAxisConfig>(
                        el.getAttribute('data-graph-config'),
                        defaults.axisConfig as GraphAxisConfig,
                    ),
                renderHTML: (attrs) => ({
                    'data-graph-config': JSON.stringify(attrs.axisConfig),
                }),
            },
            interaction: {
                default: defaults.interaction as GraphInteraction,
                parseHTML: (el) =>
                    parseJson<GraphInteraction>(
                        el.getAttribute('data-graph-interaction'),
                        defaults.interaction as GraphInteraction,
                    ),
                renderHTML: (attrs) => ({
                    'data-graph-interaction': JSON.stringify(attrs.interaction),
                    'data-graph-interaction-type': (attrs.interaction as GraphInteraction).type,
                }),
            },
            solution: {
                default: null as InlineNodes | null,
                parseHTML: (el) =>
                    parseJson<InlineNodes | null>(
                        el.getAttribute('data-graph-solution'),
                        null,
                    ),
                renderHTML: (attrs) =>
                    attrs.solution
                        ? { 'data-graph-solution': JSON.stringify(attrs.solution) }
                        : {},
            },
            partialCredit: {
                default: false,
                parseHTML: (el) => el.getAttribute('data-graph-partial-credit') === 'true',
                renderHTML: (attrs) =>
                    attrs.partialCredit ? { 'data-graph-partial-credit': 'true' } : {},
            },
            allowNoSolution: {
                default: false,
                parseHTML: (el) => el.getAttribute('data-graph-allow-no-solution') === 'true',
                renderHTML: (attrs) =>
                    attrs.allowNoSolution ? { 'data-graph-allow-no-solution': 'true' } : {},
            },
            noSolutionCorrect: {
                default: false,
                parseHTML: (el) => el.getAttribute('data-graph-no-solution-correct') === 'true',
                renderHTML: (attrs) =>
                    attrs.noSolutionCorrect ? { 'data-graph-no-solution-correct': 'true' } : {},
            },
            builtinFeedback: {
                default: true,
                parseHTML: (el) => el.getAttribute('data-graph-builtin-feedback') !== 'false',
                renderHTML: (attrs) =>
                    attrs.builtinFeedback === false
                        ? { 'data-graph-builtin-feedback': 'false' }
                        : {},
            },
            mistakeFeedback: {
                default: [] as GraphMistakeEntry[],
                parseHTML: (el) =>
                    parseJson<GraphMistakeEntry[]>(
                        el.getAttribute('data-graph-mistake-feedback'),
                        [],
                    ),
                renderHTML: (attrs) =>
                    Array.isArray(attrs.mistakeFeedback) && attrs.mistakeFeedback.length > 0
                        ? { 'data-graph-mistake-feedback': JSON.stringify(attrs.mistakeFeedback) }
                        : {},
            },
            hasConfidenceRating: {
                default: false,
                parseHTML: (el) =>
                    el.getAttribute('data-has-confidence-rating') === 'true',
                renderHTML: (attrs) =>
                    attrs.hasConfidenceRating
                        ? { 'data-has-confidence-rating': 'true' }
                        : {},
            },
            skills: {
                default: [] as string[],
                parseHTML: (el) =>
                    parseJson<string[]>(el.getAttribute('data-skills'), []),
                renderHTML: (attrs) =>
                    Array.isArray(attrs.skills) && attrs.skills.length > 0
                        ? { 'data-skills': JSON.stringify(attrs.skills) }
                        : {},
            },
        };
    },

    parseHTML() {
        return [{ tag: 'div[data-block-type="interactive_graph"]' }];
    },

    renderHTML({ HTMLAttributes }) {
        // The editor-clipboard shape only: a div carrying the JSON attrs + the
        // prompt as inline content (the 0 hole). The PUBLISHED HTML is produced
        // by the renderer from the serialized ActivityDocument, not from this.
        return [
            'div',
            mergeAttributes(
                { 'data-block-type': 'interactive_graph', class: 'block-interactive-graph' },
                HTMLAttributes,
            ),
            0,
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(InteractiveGraphView);
    },

    addCommands() {
        return {
            insertInteractiveGraph:
                () =>
                ({ chain }) => {
                    const fresh = createInteractiveGraphBlock();
                    return chain()
                        .insertContent({
                            type: this.name,
                            attrs: {
                                id: fresh.id,
                                axisConfig: fresh.axisConfig,
                                interaction: fresh.interaction,
                                solution: null,
                                hasConfidenceRating: false,
                                skills: [],
                            },
                        })
                        .run();
                },
            insertStaticGraph:
                () =>
                ({ chain }) => {
                    const fresh = createInteractiveGraphBlock();
                    return chain()
                        .insertContent({
                            type: this.name,
                            attrs: {
                                id: fresh.id,
                                axisConfig: fresh.axisConfig,
                                interaction: defaultDisplayInteraction(),
                                solution: null,
                                hasConfidenceRating: false,
                                skills: [],
                            },
                        })
                        .run();
                },
        };
    },
});

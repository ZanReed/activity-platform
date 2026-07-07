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
export interface FunctionInteractionAttr {
    type: 'plot_function';
    model: LinearFunctionModel; // future: | QuadraticModel | …
}
export interface RegionInteractionAttr {
    type: 'shade_region';
    correctVertices: [number, number][];
    minOverlap: number;
}
export type GraphInteraction =
    | PointInteractionAttr
    | FunctionInteractionAttr
    | RegionInteractionAttr;

// A fresh plot_function interaction (linear, y = x) — used when the author
// switches the picker to "Plot a line".
export function defaultFunctionInteraction(): FunctionInteractionAttr {
    return {
        type: 'plot_function',
        model: {
            family: 'linear',
            slope: 1,
            intercept: 0,
            slopeTolerance: 0.1,
            interceptTolerance: 0.1,
        },
    };
}

// A fresh plot_point interaction (one point at the origin).
export function defaultPointInteraction(): PointInteractionAttr {
    return { type: 'plot_point', correctPoints: [[0, 0]], tolerance: 0.1 };
}

// A fresh shade_region interaction — a small triangle the author drags into shape.
export function defaultRegionInteraction(): RegionInteractionAttr {
    return {
        type: 'shade_region',
        correctVertices: [[0, 0], [4, 0], [2, 4]],
        minOverlap: 0.9,
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
        };
    },
});

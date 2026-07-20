import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { labelNodeAttr } from '../labelNodeAttr';
import { createNumberLineBlock } from '@activity/schema';
import NumberLineView from '../nodeViews/NumberLineView';
import type { InlineNodes } from '../../lib/serialize';
import { sizingNodeAttributes } from './sizingNodeAttributes';

// ============================================================================
// NumberLine — Tiptap block node for the graded number_line block (1-D). The
// 1-D sibling of InteractiveGraph, and deliberately LEANER: two interactions
// (plot_point, plot_interval), an integer-tick line config, no partial credit /
// mistake feedback (design decision 6, all-or-nothing). Like InteractiveGraph,
// the prompt is EDITABLE inline content (NodeViewContent); the line config, the
// interaction + its answer key, the solution, confidence, and skills ride as
// structured attrs mirrored into JSON data-* so editor copy-paste round-trips.
// serialize.ts maps this node <-> the schema's NumberLineBlock.
// ============================================================================

export interface NumberLineConfigAttr {
    min: number;
    max: number;
    tickStep: number;
    minorTicksPerStep: number;
    snapToTick: boolean;
}
export interface NumberLinePointInteractionAttr {
    type: 'plot_point';
    correctPoints: number[];
    tolerance: number;
}
export interface NumberLineIntervalAttr {
    min?: number;
    minStyle?: 'open' | 'closed';
    max?: number;
    maxStyle?: 'open' | 'closed';
}
export interface NumberLineIntervalInteractionAttr {
    type: 'plot_interval';
    correctInterval: NumberLineIntervalAttr;
    tolerance: number;
}
export type NumberLineInteractionAttr =
    | NumberLinePointInteractionAttr
    | NumberLineIntervalInteractionAttr;

// A fresh plot_point interaction — one correct point at the line's midpoint-ish
// tick (the factory seeds 5 on a 0..10 line for the author to drag).
export function defaultNumberLinePointInteraction(): NumberLinePointInteractionAttr {
    return { type: 'plot_point', correctPoints: [5], tolerance: 0.1 };
}

// A fresh plot_interval — a bounded closed/open interval the author drags into
// place ("graph 2 <= x < 8" on the default 0..10 line).
export function defaultNumberLineIntervalInteraction(): NumberLineIntervalInteractionAttr {
    return {
        type: 'plot_interval',
        correctInterval: { min: 2, minStyle: 'closed', max: 8, maxStyle: 'open' },
        tolerance: 0.1,
    };
}

const defaults = createNumberLineBlock();

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
        numberLine: {
            insertNumberLine: () => ReturnType;
        };
    }
}

export const NumberLine = Node.create({
    name: 'numberLine',
    group: 'block',
    content: '(text | mathInline)*',
    draggable: true,
    selectable: true,
    defining: true,

    addAttributes() {
        return {
            ...labelNodeAttr,
            id: {
                default: '',
                parseHTML: (el) => el.getAttribute('data-block-id') ?? '',
                renderHTML: (attrs) =>
                    attrs.id ? { 'data-block-id': attrs.id } : {},
            },
            config: {
                default: defaults.config as NumberLineConfigAttr,
                parseHTML: (el) =>
                    parseJson<NumberLineConfigAttr>(
                        el.getAttribute('data-numberline-config'),
                        defaults.config as NumberLineConfigAttr,
                    ),
                renderHTML: (attrs) => ({
                    'data-numberline-config': JSON.stringify(attrs.config),
                }),
            },
            interaction: {
                default: defaults.interaction as NumberLineInteractionAttr,
                parseHTML: (el) =>
                    parseJson<NumberLineInteractionAttr>(
                        el.getAttribute('data-numberline-interaction'),
                        defaults.interaction as NumberLineInteractionAttr,
                    ),
                renderHTML: (attrs) => ({
                    'data-numberline-interaction': JSON.stringify(attrs.interaction),
                    'data-numberline-interaction-type': (attrs.interaction as NumberLineInteractionAttr).type,
                }),
            },
            solution: {
                default: null as InlineNodes | null,
                parseHTML: (el) =>
                    parseJson<InlineNodes | null>(
                        el.getAttribute('data-numberline-solution'),
                        null,
                    ),
                renderHTML: (attrs) =>
                    attrs.solution
                        ? { 'data-numberline-solution': JSON.stringify(attrs.solution) }
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
            // Variable block sizing (width/align) — shared with image/math (D5).
            ...sizingNodeAttributes(),
        };
    },

    parseHTML() {
        return [{ tag: 'div[data-block-type="number_line"]' }];
    },

    renderHTML({ HTMLAttributes }) {
        // Editor-clipboard shape only: a div carrying the JSON attrs + the prompt
        // as inline content (the 0 hole). The PUBLISHED HTML is produced by the
        // renderer from the serialized ActivityDocument, not from this.
        return [
            'div',
            mergeAttributes(
                { 'data-block-type': 'number_line', class: 'block-number-line' },
                HTMLAttributes,
            ),
            0,
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(NumberLineView);
    },

    addCommands() {
        return {
            insertNumberLine:
                () =>
                ({ chain }) => {
                    const fresh = createNumberLineBlock();
                    return chain()
                        .insertContent({
                            type: this.name,
                            attrs: {
                                id: fresh.id,
                                config: fresh.config,
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

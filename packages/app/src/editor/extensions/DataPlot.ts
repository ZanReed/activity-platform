import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { createDataPlotBlock } from '@activity/schema';
import DataPlotView from '../nodeViews/DataPlotView';
import type { InlineNodes } from '../../lib/serialize';

// ============================================================================
// DataPlot — Tiptap block node for the data_plot block (statistics charts). The
// statistics sibling of NumberLine. Unlike the graph/number-line blocks there is
// no drag-to-author board: a data_plot is authored by editing its DATASET (the
// correct plot is computed from it), so the NodeView is a numeric data-table + a
// live static preview. The prompt is EDITABLE inline content (NodeViewContent);
// the dataset, chart config, interaction (display chart | build_dotplot), the
// solution, confidence, and skills ride as structured attrs mirrored into JSON
// data-* so editor copy-paste round-trips. serialize.ts maps this node <-> the
// schema's DataPlotBlock.
// ============================================================================

export interface DataPlotConfigAttr {
    min: number;
    max: number;
    tickStep: number;
    minorTicksPerStep: number;
    snapToTick: boolean;
    binWidth?: number;
    maxFrequency?: number;
}
export interface DataPlotDisplayInteractionAttr {
    type: 'display';
    chart: 'dotplot' | 'histogram' | 'boxplot';
}
export interface DataPlotDotplotInteractionAttr {
    type: 'build_dotplot';
}
export interface DataPlotHistogramInteractionAttr {
    type: 'build_histogram';
}
export interface DataPlotBoxplotInteractionAttr {
    type: 'build_boxplot';
    tolerance: number;
}
export type DataPlotInteractionAttr =
    | DataPlotDisplayInteractionAttr
    | DataPlotDotplotInteractionAttr
    | DataPlotHistogramInteractionAttr
    | DataPlotBoxplotInteractionAttr;

export function defaultDataPlotBuildInteraction(): DataPlotDotplotInteractionAttr {
    return { type: 'build_dotplot' };
}
export function defaultDataPlotHistogramInteraction(): DataPlotHistogramInteractionAttr {
    return { type: 'build_histogram' };
}
export function defaultDataPlotBoxplotInteraction(): DataPlotBoxplotInteractionAttr {
    return { type: 'build_boxplot', tolerance: 0.5 };
}
export function defaultDataPlotDisplayInteraction(
    chart: DataPlotDisplayInteractionAttr['chart'] = 'dotplot',
): DataPlotDisplayInteractionAttr {
    return { type: 'display', chart };
}

const defaults = createDataPlotBlock();

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
        dataPlot: {
            insertDataPlot: () => ReturnType;
        };
    }
}

export const DataPlot = Node.create({
    name: 'dataPlot',
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
            data: {
                default: defaults.data as number[],
                parseHTML: (el) =>
                    parseJson<number[]>(
                        el.getAttribute('data-dataplot-data'),
                        defaults.data as number[],
                    ),
                renderHTML: (attrs) => ({
                    'data-dataplot-data': JSON.stringify(attrs.data),
                }),
            },
            config: {
                default: defaults.config as DataPlotConfigAttr,
                parseHTML: (el) =>
                    parseJson<DataPlotConfigAttr>(
                        el.getAttribute('data-dataplot-config'),
                        defaults.config as DataPlotConfigAttr,
                    ),
                renderHTML: (attrs) => ({
                    'data-dataplot-config': JSON.stringify(attrs.config),
                }),
            },
            interaction: {
                default: defaults.interaction as DataPlotInteractionAttr,
                parseHTML: (el) =>
                    parseJson<DataPlotInteractionAttr>(
                        el.getAttribute('data-dataplot-interaction'),
                        defaults.interaction as DataPlotInteractionAttr,
                    ),
                renderHTML: (attrs) => ({
                    'data-dataplot-interaction': JSON.stringify(attrs.interaction),
                    'data-dataplot-interaction-type': (attrs.interaction as DataPlotInteractionAttr).type,
                }),
            },
            solution: {
                default: null as InlineNodes | null,
                parseHTML: (el) =>
                    parseJson<InlineNodes | null>(
                        el.getAttribute('data-dataplot-solution'),
                        null,
                    ),
                renderHTML: (attrs) =>
                    attrs.solution
                        ? { 'data-dataplot-solution': JSON.stringify(attrs.solution) }
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
        return [{ tag: 'div[data-block-type="data_plot"]' }];
    },

    renderHTML({ HTMLAttributes }) {
        // Editor-clipboard shape only: a div carrying the JSON attrs + the prompt
        // as inline content (the 0 hole). The PUBLISHED HTML is produced by the
        // renderer from the serialized ActivityDocument, not from this.
        return [
            'div',
            mergeAttributes(
                { 'data-block-type': 'data_plot', class: 'block-data-plot' },
                HTMLAttributes,
            ),
            0,
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(DataPlotView);
    },

    addCommands() {
        return {
            insertDataPlot:
                () =>
                ({ chain }) => {
                    const fresh = createDataPlotBlock();
                    return chain()
                        .insertContent({
                            type: this.name,
                            attrs: {
                                id: fresh.id,
                                data: fresh.data,
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

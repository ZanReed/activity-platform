import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { createChartBlock } from '@activity/schema';
import ChartView from '../nodeViews/ChartView';
import { sizingNodeAttributes } from './sizingNodeAttributes';
import type { ChartAttrs } from '../../lib/chartFence';

// ============================================================================
// Chart — Tiptap block node for the static statistics chart (Y7 charts, T12).
// An ATOM, like GraphFigure: the whole block is the picture. Its data rides as
// ONE structured attr (`data`, the ChartAttrs the ```chart fence parses to),
// mirrored into a JSON data-* attribute so editor copy-paste round-trips.
// serialize.ts maps this node <-> the schema's ChartBlock.
//
// One attr rather than nine: every field is written together by the same two
// writers (the importer and the "Chart source" popover), and both produce a
// whole ChartAttrs — so there is no partial update for separate attrs to serve,
// and one attr cannot be half-copied by a future serializer edit.
// ============================================================================

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        chart: {
            /** Insert a static statistics chart. */
            insertChart: () => ReturnType;
        };
    }
}

export function defaultChartData(): ChartAttrs {
    const fresh = createChartBlock();
    return { chart: fresh.chart, title: 'Chart title', categories: fresh.categories, series: fresh.series };
}

export const Chart = Node.create({
    name: 'chart',
    group: 'block',
    atom: true,
    draggable: true,
    selectable: true,

    addAttributes() {
        return {
            id: {
                default: '',
                parseHTML: (el) => el.getAttribute('data-block-id') ?? '',
                renderHTML: (attrs) => (attrs.id ? { 'data-block-id': attrs.id } : {}),
            },
            data: {
                default: defaultChartData(),
                parseHTML: (el) => {
                    try {
                        return JSON.parse(el.getAttribute('data-chart') ?? '') as ChartAttrs;
                    } catch {
                        return defaultChartData();
                    }
                },
                renderHTML: (attrs) => ({ 'data-chart': JSON.stringify(attrs.data) }),
            },
            ...sizingNodeAttributes(),
        };
    },

    parseHTML() {
        return [{ tag: 'div[data-block-type="chart"]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes({ 'data-block-type': 'chart', class: 'block-chart' }, HTMLAttributes)];
    },

    addNodeView() {
        return ReactNodeViewRenderer(ChartView);
    },

    addCommands() {
        return {
            insertChart:
                () =>
                ({ chain }) =>
                    chain()
                        .insertContent({
                            type: this.name,
                            attrs: { id: crypto.randomUUID(), data: defaultChartData() },
                        })
                        .run(),
        };
    },
});

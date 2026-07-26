import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { createGraphFigureBlock } from '@activity/schema';
import type { GraphAxisConfig, DrawableAttr } from './InteractiveGraph';
import GraphFigureView from '../nodeViews/GraphFigureView';

// ============================================================================
// GraphFigure — Tiptap block node for the static graph-figure block
// (reference-panel content). An ATOM: no editable inline content — the whole
// block is the picture. Axis + drawables ride as structured attrs (the same
// editor-side attr twins the interactive graph uses), mirrored into JSON
// data-* attributes so editor copy-paste round-trips. serialize.ts maps this
// node <-> the schema's GraphFigureBlock.
//
// Authored in ReferencePanelEditor; the main editor registers the node only
// so it can REPRESENT one (pasted or column-nested content must not crash)
// but never offers inserting it — the body's static-graph story is the
// interactive_graph display mode, and the panel's contract is "students never
// work on or input into it": this node can't accept input by construction.
// The slash-menu item is referenceOnly.
// ============================================================================

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
        graphFigure: {
            /** Insert a static graph figure (reference-panel content). */
            insertGraphFigure: () => ReturnType;
        };
    }
}

export const GraphFigure = Node.create({
    name: 'graphFigure',
    group: 'block',
    atom: true,
    draggable: true,
    selectable: true,

    addAttributes() {
        const defaults = createGraphFigureBlock();
        return {
            id: {
                default: '',
                parseHTML: (el) => el.getAttribute('data-block-id') ?? '',
                renderHTML: (attrs) =>
                    attrs.id ? { 'data-block-id': attrs.id } : {},
            },
            axis: {
                default: defaults.axis as GraphAxisConfig,
                parseHTML: (el) =>
                    parseJson<GraphAxisConfig>(
                        el.getAttribute('data-figure-axis'),
                        defaults.axis as GraphAxisConfig,
                    ),
                renderHTML: (attrs) => ({
                    'data-figure-axis': JSON.stringify(attrs.axis),
                }),
            },
            drawables: {
                default: [] as DrawableAttr[],
                parseHTML: (el) =>
                    parseJson<DrawableAttr[]>(
                        el.getAttribute('data-figure-drawables'),
                        [],
                    ),
                renderHTML: (attrs) => ({
                    'data-figure-drawables': JSON.stringify(attrs.drawables),
                }),
            },
        };
    },

    parseHTML() {
        return [{ tag: 'div[data-block-type="graph_figure"]' }];
    },

    renderHTML({ HTMLAttributes }) {
        // The editor-clipboard shape only; the PUBLISHED HTML is produced by
        // the renderer from the serialized ActivityDocument, not from this.
        return [
            'div',
            mergeAttributes(
                { 'data-block-type': 'graph_figure', class: 'block-graph-figure' },
                HTMLAttributes,
            ),
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(GraphFigureView);
    },

    addCommands() {
        return {
            insertGraphFigure:
                () =>
                ({ chain }) => {
                    const fresh = createGraphFigureBlock();
                    return chain()
                        .insertContent({
                            type: this.name,
                            attrs: {
                                id: fresh.id,
                                axis: fresh.axis,
                                drawables: fresh.drawables,
                            },
                        })
                        .run();
                },
        };
    },
});

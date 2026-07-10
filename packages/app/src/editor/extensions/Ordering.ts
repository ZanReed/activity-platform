import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import OrderingView from '../nodeViews/OrderingView';

// ============================================================================
// Ordering — Tiptap block node for an ordering / sequencing question.
// ----------------------------------------------------------------------------
// Structure mirrors MultipleChoice: the PROMPT is the node's editable inline
// content, the item list is a structured attr edited in the NodeView. The
// AUTHORED ORDER of items IS the correct answer; students see the list
// shuffled (publish-time, deterministic) — the NodeView says so.
//
// Attrs:
//   - id: stable UUID (serialize mints fresh ones per round trip).
//   - items: Array<{ id, content: InlineNode[] }> in the correct order.
//   - solution / hasConfidenceRating / skills / workSpace: block-level fields
//     identical to MultipleChoice's (same settings footer UI).
// ============================================================================

export interface EditorOrderItem {
    id: string;
    content: unknown[];
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        ordering: {
            insertOrdering: () => ReturnType;
        };
    }
}

function freshItem(): EditorOrderItem {
    return { id: crypto.randomUUID(), content: [] };
}

export function defaultOrderItems(): EditorOrderItem[] {
    return [freshItem(), freshItem(), freshItem()];
}

export const Ordering = Node.create({
    name: 'ordering',
    group: 'block',
    content: '(text | mathInline)*',
    draggable: true,
    selectable: true,
    definingForContent: true,

    addAttributes() {
        return {
            id: {
                default: '',
                parseHTML: (element) => element.getAttribute('data-block-id') ?? '',
                renderHTML: (attributes) =>
                    attributes.id ? { 'data-block-id': attributes.id } : {},
            },
            items: {
                default: [] as EditorOrderItem[],
                parseHTML: (element) => {
                    const raw = element.getAttribute('data-items');
                    if (!raw) return [];
                    try {
                        const parsed = JSON.parse(raw);
                        return Array.isArray(parsed) ? parsed : [];
                    } catch {
                        return [];
                    }
                },
                renderHTML: (attributes) => {
                    const v = attributes.items as EditorOrderItem[];
                    return Array.isArray(v) && v.length > 0
                        ? { 'data-items': JSON.stringify(v) }
                        : {};
                },
            },
            solution: {
                default: null as unknown[] | null,
                parseHTML: (element) => {
                    const raw = element.getAttribute('data-solution');
                    if (!raw) return null;
                    try {
                        const parsed = JSON.parse(raw);
                        return Array.isArray(parsed) && parsed.length > 0
                            ? parsed
                            : null;
                    } catch {
                        return null;
                    }
                },
                renderHTML: (attributes) => {
                    const v = attributes.solution as unknown[] | null;
                    return Array.isArray(v) && v.length > 0
                        ? { 'data-solution': JSON.stringify(v) }
                        : {};
                },
            },
            hasConfidenceRating: {
                default: false,
                parseHTML: (element) =>
                    element.getAttribute('data-has-confidence-rating') === 'true',
                renderHTML: (attributes) =>
                    attributes.hasConfidenceRating
                        ? { 'data-has-confidence-rating': 'true' }
                        : {},
            },
            skills: {
                default: [] as string[],
                parseHTML: (element) => {
                    const raw = element.getAttribute('data-skills');
                    if (!raw) return [];
                    try {
                        const parsed = JSON.parse(raw);
                        return Array.isArray(parsed)
                            ? parsed.filter((s): s is string => typeof s === 'string')
                            : [];
                    } catch {
                        return [];
                    }
                },
                renderHTML: (attributes) =>
                    Array.isArray(attributes.skills) && attributes.skills.length > 0
                        ? { 'data-skills': JSON.stringify(attributes.skills) }
                        : {},
            },
            workSpace: {
                default: null as number | null,
                parseHTML: (element) => {
                    const raw = element.getAttribute('data-work-space');
                    if (raw === null) return null;
                    const n = Number(raw);
                    return Number.isFinite(n) && n >= 0 ? n : null;
                },
                renderHTML: (attributes) =>
                    typeof attributes.workSpace === 'number'
                        ? { 'data-work-space': String(attributes.workSpace) }
                        : {},
            },
        };
    },

    parseHTML() {
        return [{ tag: 'div[data-ordering]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes({ 'data-ordering': '' }, HTMLAttributes), 0];
    },

    addNodeView() {
        return ReactNodeViewRenderer(OrderingView);
    },

    addCommands() {
        return {
            insertOrdering:
                () =>
                ({ chain }) =>
                    chain()
                        .focus()
                        .insertContent({
                            type: this.name,
                            attrs: {
                                id: crypto.randomUUID(),
                                items: defaultOrderItems(),
                            },
                        })
                        .run(),
        };
    },
});

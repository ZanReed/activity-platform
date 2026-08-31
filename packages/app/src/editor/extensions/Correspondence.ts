import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { labelNodeAttr } from '../labelNodeAttr';
import CorrespondenceView from '../nodeViews/CorrespondenceView';
import type { EditorMatchSide } from './Matching';

// ============================================================================
// Correspondence — Tiptap block node for the N-way match (wishlist #4).
// ----------------------------------------------------------------------------
// Matching's structure, one axis deeper: the PROMPT is the node's editable
// inline content; items / targetColumns / key are structured attrs edited
// through the NodeView. Each target column carries its own header + card
// pool; the key is nested (itemId → columnId → targetId). Column count is
// 2..3 (with the anchor, a 3- or 4-way match) — a 2-way is just `matching`.
// ============================================================================

export interface EditorTargetColumn {
    id: string;
    header: unknown[];
    targets: EditorMatchSide[];
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        correspondence: {
            insertCorrespondence: () => ReturnType;
        };
    }
}

function freshSide(): EditorMatchSide {
    return { id: crypto.randomUUID(), content: [] };
}

export function defaultCorrespondence(): {
    items: EditorMatchSide[];
    targetColumns: EditorTargetColumn[];
    key: Record<string, Record<string, string>>;
} {
    const items = [freshSide(), freshSide()];
    const targetColumns: EditorTargetColumn[] = [0, 1].map(() => ({
        id: crypto.randomUUID(),
        header: [],
        targets: [freshSide(), freshSide()],
    }));
    const key: Record<string, Record<string, string>> = {};
    items.forEach((item, i) => {
        const row: Record<string, string> = {};
        for (const column of targetColumns) {
            const target = column.targets[i];
            if (target) row[column.id] = target.id;
        }
        key[item.id] = row;
    });
    return { items, targetColumns, key };
}

function parseJsonAttr<T>(raw: string | null, fallback: T): T {
    if (!raw) return fallback;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

export const Correspondence = Node.create({
    name: 'correspondence',
    group: 'block',
    content: '(text | mathInline)*',
    draggable: true,
    selectable: true,
    definingForContent: true,

    addAttributes() {
        return {
            ...labelNodeAttr,
            id: {
                default: '',
                parseHTML: (element) => element.getAttribute('data-block-id') ?? '',
                renderHTML: (attributes) =>
                    attributes.id ? { 'data-block-id': attributes.id } : {},
            },
            items: {
                default: [] as EditorMatchSide[],
                parseHTML: (element) => {
                    const parsed = parseJsonAttr<unknown>(
                        element.getAttribute('data-items'),
                        [],
                    );
                    return Array.isArray(parsed) ? parsed : [];
                },
                renderHTML: (attributes) => {
                    const v = attributes.items as EditorMatchSide[];
                    return Array.isArray(v) && v.length > 0
                        ? { 'data-items': JSON.stringify(v) }
                        : {};
                },
            },
            targetColumns: {
                default: [] as EditorTargetColumn[],
                parseHTML: (element) => {
                    const parsed = parseJsonAttr<unknown>(
                        element.getAttribute('data-target-columns'),
                        [],
                    );
                    return Array.isArray(parsed) ? parsed : [];
                },
                renderHTML: (attributes) => {
                    const v = attributes.targetColumns as EditorTargetColumn[];
                    return Array.isArray(v) && v.length > 0
                        ? { 'data-target-columns': JSON.stringify(v) }
                        : {};
                },
            },
            key: {
                default: {} as Record<string, Record<string, string>>,
                parseHTML: (element) => {
                    const parsed = parseJsonAttr<unknown>(
                        element.getAttribute('data-key'),
                        {},
                    );
                    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
                        ? parsed
                        : {};
                },
                renderHTML: (attributes) => {
                    const v = attributes.key as Record<string, Record<string, string>>;
                    return v && Object.keys(v).length > 0
                        ? { 'data-key': JSON.stringify(v) }
                        : {};
                },
            },
            solution: {
                default: null as unknown[] | null,
                parseHTML: (element) => {
                    const parsed = parseJsonAttr<unknown>(
                        element.getAttribute('data-solution'),
                        null,
                    );
                    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
                },
                renderHTML: (attributes) => {
                    const v = attributes.solution as unknown[] | null;
                    return Array.isArray(v) && v.length > 0
                        ? { 'data-solution': JSON.stringify(v) }
                        : {};
                },
            },
            skills: {
                default: [] as string[],
                parseHTML: (element) => {
                    const parsed = parseJsonAttr<unknown>(
                        element.getAttribute('data-skills'),
                        [],
                    );
                    return Array.isArray(parsed)
                        ? parsed.filter((s): s is string => typeof s === 'string')
                        : [];
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
        return [{ tag: 'div[data-correspondence]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes({ 'data-correspondence': '' }, HTMLAttributes),
            0,
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(CorrespondenceView);
    },

    addCommands() {
        return {
            insertCorrespondence:
                () =>
                ({ chain }) =>
                    chain()
                        .focus()
                        .insertContent({
                            type: this.name,
                            attrs: {
                                id: crypto.randomUUID(),
                                ...defaultCorrespondence(),
                            },
                        })
                        .run(),
        };
    },
});

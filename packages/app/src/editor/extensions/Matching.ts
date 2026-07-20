import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { labelNodeAttr } from '../labelNodeAttr';
import MatchingView from '../nodeViews/MatchingView';
import type { GraphAxisConfig, DrawableAttr } from './InteractiveGraph';

// ============================================================================
// Matching — Tiptap block node for a matching question.
// ----------------------------------------------------------------------------
// Structure mirrors MultipleChoice: the PROMPT is the node's editable inline
// content (NodeViewContent), while items/targets/key live as structured attrs
// edited through the NodeView's own controls (nested InlineRichTextEditor per
// row).
//
// Attrs:
//   - id: stable UUID (serialize mints fresh ones per round trip).
//   - items:   Array<{ id, content: InlineNode[], image?, graph? }> — left
//     column stems, document order.
//   - targets: same shape — right column options; may exceed items
//     (distractors). Students see them SHUFFLED (publish-time, deterministic);
//     the editor shows authored order, so the NodeView's key picker labels
//     targets by their text, never by a letter.
//   - key: Record<itemId, targetId> — the correct pairing. Incomplete keys
//     are legal to SAVE (mid-edit drafts autosave); the NodeView warns.
//   - allowTargetReuse: many-to-one docking ("categorization-lite").
//   - solution / hasConfidenceRating / skills / workSpace: block-level fields
//     identical to MultipleChoice's (same settings footer UI).
// ============================================================================

export interface EditorMatchSide {
    id: string;
    content: unknown[];
    // Optional figure below the text (canonical schema shapes; the save
    // boundary re-validates with ChoiceImage/ChoiceGraph and drops malformed
    // figures — the MC choice-figure pattern).
    image?: { src: string; alt: string };
    graph?: { axis: GraphAxisConfig; drawables: DrawableAttr[] };
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        matching: {
            insertMatching: () => ReturnType;
        };
    }
}

function freshSide(): EditorMatchSide {
    return { id: crypto.randomUUID(), content: [] };
}

export function defaultMatching(): {
    items: EditorMatchSide[];
    targets: EditorMatchSide[];
    key: Record<string, string>;
} {
    const items = [freshSide(), freshSide()];
    const targets = [freshSide(), freshSide()];
    const key: Record<string, string> = {};
    items.forEach((item, i) => {
        const target = targets[i];
        if (target) key[item.id] = target.id;
    });
    return { items, targets, key };
}

function parseJsonAttr<T>(raw: string | null, fallback: T): T {
    if (!raw) return fallback;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

export const Matching = Node.create({
    name: 'matching',
    group: 'block',
    // The prompt's alphabet: text (with marks) + inline math.
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
            targets: {
                default: [] as EditorMatchSide[],
                parseHTML: (element) => {
                    const parsed = parseJsonAttr<unknown>(
                        element.getAttribute('data-targets'),
                        [],
                    );
                    return Array.isArray(parsed) ? parsed : [];
                },
                renderHTML: (attributes) => {
                    const v = attributes.targets as EditorMatchSide[];
                    return Array.isArray(v) && v.length > 0
                        ? { 'data-targets': JSON.stringify(v) }
                        : {};
                },
            },
            key: {
                default: {} as Record<string, string>,
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
                    const v = attributes.key as Record<string, string>;
                    return v && Object.keys(v).length > 0
                        ? { 'data-key': JSON.stringify(v) }
                        : {};
                },
            },
            allowTargetReuse: {
                default: false,
                parseHTML: (element) =>
                    element.getAttribute('data-allow-target-reuse') === 'true',
                renderHTML: (attributes) =>
                    attributes.allowTargetReuse
                        ? { 'data-allow-target-reuse': 'true' }
                        : {},
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
        return [{ tag: 'div[data-matching]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes({ 'data-matching': '' }, HTMLAttributes), 0];
    },

    addNodeView() {
        return ReactNodeViewRenderer(MatchingView);
    },

    addCommands() {
        return {
            insertMatching:
                () =>
                ({ chain }) =>
                    chain()
                        .focus()
                        .insertContent({
                            type: this.name,
                            attrs: {
                                id: crypto.randomUUID(),
                                ...defaultMatching(),
                            },
                        })
                        .run(),
        };
    },
});

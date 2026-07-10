import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import MultipleChoiceView from '../nodeViews/MultipleChoiceView';
import type { GraphAxisConfig, DrawableAttr } from './InteractiveGraph';

// ============================================================================
// MultipleChoice — Tiptap block node for a multiple-choice question.
// ----------------------------------------------------------------------------
// Structure mirrors InteractiveGraph: the PROMPT is the node's editable
// inline content (NodeViewContent — text + inline math), while the choices
// live as a structured attr edited through the NodeView's own controls
// (nested InlineRichTextEditor per choice, like blank hints and graph
// mistake feedback). Nested editable regions inside one ProseMirror doc are
// the alternative and are deliberately avoided — one content stream per
// node keeps selection/undo sane.
//
// Attrs:
//   - id: stable UUID (serialize mints fresh ones per round trip, as
//     everywhere else; the in-session id keeps NodeView identity stable).
//   - choices: Array<{ id, content: InlineNode[], correct, feedback? }> —
//     canonical schema shape, opaque JSON here.
//   - multiSelect: single answer (radios) vs select-all-that-apply.
//   - solution / hasConfidenceRating / skills / workSpace: block-level
//     fields identical to FillInBlank's (same settings footer UI).
// ============================================================================

export interface EditorMcChoice {
    id: string;
    content: unknown[];
    correct: boolean;
    feedback?: unknown[];
    // Optional figure below the choice text (canonical schema shapes, using
    // the graph node's parallel attr types; the save boundary re-validates
    // with ChoiceImage/ChoiceGraph and drops malformed figures).
    image?: { src: string; alt: string };
    graph?: { axis: GraphAxisConfig; drawables: DrawableAttr[] };
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        multipleChoice: {
            insertMultipleChoice: () => ReturnType;
        };
    }
}

function freshChoice(correct = false): EditorMcChoice {
    return { id: crypto.randomUUID(), content: [], correct };
}

export function defaultChoices(): EditorMcChoice[] {
    return [freshChoice(true), freshChoice(), freshChoice()];
}

export const MultipleChoice = Node.create({
    name: 'multipleChoice',
    group: 'block',
    // The prompt's alphabet: text (with marks) + inline math.
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
            choices: {
                default: [] as EditorMcChoice[],
                parseHTML: (element) => {
                    const raw = element.getAttribute('data-choices');
                    if (!raw) return [];
                    try {
                        const parsed = JSON.parse(raw);
                        return Array.isArray(parsed) ? parsed : [];
                    } catch {
                        return [];
                    }
                },
                renderHTML: (attributes) => {
                    const v = attributes.choices as EditorMcChoice[];
                    return Array.isArray(v) && v.length > 0
                        ? { 'data-choices': JSON.stringify(v) }
                        : {};
                },
            },
            multiSelect: {
                default: false,
                parseHTML: (element) =>
                    element.getAttribute('data-multi-select') === 'true',
                renderHTML: (attributes) =>
                    attributes.multiSelect ? { 'data-multi-select': 'true' } : {},
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
        return [{ tag: 'div[data-multiple-choice]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes({ 'data-multiple-choice': '' }, HTMLAttributes),
            0,
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(MultipleChoiceView);
    },

    addCommands() {
        return {
            insertMultipleChoice:
                () =>
                ({ chain }) =>
                    chain()
                        .focus()
                        .insertContent({
                            type: this.name,
                            attrs: {
                                id: crypto.randomUUID(),
                                choices: defaultChoices(),
                            },
                        })
                        .run(),
        };
    },
});

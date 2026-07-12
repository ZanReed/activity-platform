import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import FreeResponseView from '../nodeViews/FreeResponseView';

// ============================================================================
// Essay — Tiptap block node for the essay block (manually graded long free
// text). Like ShortAnswer, but adds an optional word-count target stored as two
// numeric attrs (wordMin / wordMax; serialize folds them into wordCountHint).
// Shares FreeResponseView, which shows the word-guidance fields for `essay`.
// ============================================================================

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        essay: {
            insertEssay: () => ReturnType;
        };
    }
}

// A positive-integer attribute round-tripping to a `data-*` name. `attrName` is
// the node-attribute key; `domName` is the DOM attribute it reads/writes.
function numAttr(attrName: 'wordMin' | 'wordMax', domName: string) {
    return {
        default: null as number | null,
        parseHTML: (element: HTMLElement) => {
            const raw = element.getAttribute(domName);
            if (raw === null) return null;
            const n = Number(raw);
            return Number.isInteger(n) && n > 0 ? n : null;
        },
        renderHTML: (attributes: Record<string, unknown>) =>
            typeof attributes[attrName] === 'number'
                ? { [domName]: String(attributes[attrName] as number) }
                : {},
    };
}

export const Essay = Node.create({
    name: 'essay',
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
            placeholder: {
                default: '',
                parseHTML: (element) =>
                    element.getAttribute('data-placeholder') ?? '',
                renderHTML: (attributes) =>
                    attributes.placeholder
                        ? { 'data-placeholder': attributes.placeholder as string }
                        : {},
            },
            wordMin: numAttr('wordMin', 'data-word-min'),
            wordMax: numAttr('wordMax', 'data-word-max'),
            // Grading rubric (Phase 2.6) — see ShortAnswer.ts for the pattern.
            rubric: {
                default: null as unknown,
                parseHTML: (element: HTMLElement) => {
                    const raw = element.getAttribute('data-rubric');
                    if (!raw) return null;
                    try {
                        return JSON.parse(raw);
                    } catch {
                        return null;
                    }
                },
                renderHTML: (attributes: Record<string, unknown>) =>
                    attributes.rubric
                        ? { 'data-rubric': JSON.stringify(attributes.rubric) }
                        : {},
            },
        };
    },

    parseHTML() {
        return [{ tag: 'div[data-essay]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes({ 'data-essay': '' }, HTMLAttributes), 0];
    },

    addNodeView() {
        return ReactNodeViewRenderer(FreeResponseView);
    },

    addCommands() {
        return {
            insertEssay:
                () =>
                ({ chain }) =>
                    chain()
                        .focus()
                        .insertContent({
                            type: this.name,
                            attrs: { id: crypto.randomUUID() },
                        })
                        .run(),
        };
    },
});

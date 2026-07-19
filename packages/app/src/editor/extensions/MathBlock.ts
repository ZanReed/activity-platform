import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import MathBlockView from '../nodeViews/MathBlockView';
import { signalOpenInsertedMath } from './MathFocus';
import { promptsAttribute } from './mathPromptsAttribute';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        mathBlock: {
            insertMathBlock: (latex: string) => ReturnType;
        };
    }
}

export const MathBlock = Node.create({
    name: 'mathBlock',
    group: 'block',
    atom: true,
    selectable: true,

    addAttributes() {
        return {
            latex: {
                default: '',
                    parseHTML: (element) => element.getAttribute('data-latex') ?? '',
                                     renderHTML: (attributes) => ({ 'data-latex': attributes.latex }),
            },
            // Model A: in-equation gradeable gaps (shared with mathInline).
            ...promptsAttribute,
            // Sizing attrs (schema sizing fragment): width fraction in (0, 1]
            // (null = full width) and align ('left' | 'right'; null = center).
            // No UI sets these yet — carried so imported docs round-trip.
            width: {
                default: null as number | null,
                parseHTML: (element) => {
                    const raw = element.getAttribute('data-block-width');
                    if (raw === null) return null;
                    const n = Number(raw);
                    return Number.isFinite(n) && n > 0 && n <= 1 ? n : null;
                },
                renderHTML: (attributes) =>
                    typeof attributes.width === 'number'
                        ? { 'data-block-width': String(attributes.width) }
                        : {},
            },
            align: {
                default: null as 'left' | 'right' | null,
                parseHTML: (element) => {
                    const raw = element.getAttribute('data-block-align');
                    return raw === 'left' || raw === 'right' ? raw : null;
                },
                renderHTML: (attributes) =>
                    attributes.align === 'left' || attributes.align === 'right'
                        ? { 'data-block-align': attributes.align }
                        : {},
            },
        };
    },

    parseHTML() {
        return [{ tag: 'div[data-math-block]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes({ 'data-math-block': '' }, HTMLAttributes)];
    },

    addNodeView() {
        return ReactNodeViewRenderer(MathBlockView);
    },

    addCommands() {
        return {
            insertMathBlock:
            (latex: string) =>
            ({ chain }) =>
            chain()
            .focus()
            .insertContent({ type: this.name, attrs: { latex } })
            .command(({ tr, dispatch }) => {
                if (dispatch) signalOpenInsertedMath(tr, this.name);
                return true;
            })
            .run(),
        };
    },
});

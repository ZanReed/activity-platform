import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import MathBlockView from '../nodeViews/MathBlockView';

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
            .run(),
        };
    },
});

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import MathInlineView from '../nodeViews/MathInlineView';
import { signalOpenInsertedMath } from './MathFocus';
import { promptsAttribute } from './mathPromptsAttribute';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        mathInline: {
            insertMathInline: (latex: string) => ReturnType;
        };
    }
}

export const MathInline = Node.create({
    name: 'mathInline',
    group: 'inline',
    inline: true,
    atom: true,
    selectable: true,

    addAttributes() {
        return {
            latex: {
                default: '',
                    parseHTML: (element) => element.getAttribute('data-latex') ?? '',
                                      renderHTML: (attributes) => ({ 'data-latex': attributes.latex }),
            },
            // Model A: in-equation gradeable gaps (shared with mathBlock).
            ...promptsAttribute,
        };
    },

    parseHTML() {
        return [{ tag: 'span[data-math-inline]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes({ 'data-math-inline': '' }, HTMLAttributes)];
    },

    addNodeView() {
        return ReactNodeViewRenderer(MathInlineView);
    },

    addCommands() {
        return {
            insertMathInline:
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

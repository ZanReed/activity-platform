// TextAlign — left / centre / right on paragraphs and headings
// (schema-shortlist.md S6-a, 2026-11-15). A block attr, `textAlign`, saved as
// the schema's `align` ('center' | 'right'; left is the absence). Registered
// in every editor that holds paragraph or heading blocks (main, reference
// panel, teacher guide), so none of them drops it on a save.
import { Extension } from '@tiptap/core';

export type Align = 'left' | 'center' | 'right';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        textAlign: {
            setTextAlign: (align: Align) => ReturnType;
        };
    }
}

export const TextAlign = Extension.create({
    name: 'textAlign',
    addGlobalAttributes() {
        return [
            {
                types: ['paragraph', 'heading'],
                attributes: {
                    textAlign: {
                        default: null as 'center' | 'right' | null,
                        parseHTML: (el) => {
                            const v = (el as HTMLElement).style.textAlign;
                            return v === 'center' || v === 'right' ? v : null;
                        },
                        renderHTML: (attrs) =>
                            attrs.textAlign === 'center' || attrs.textAlign === 'right'
                                ? { style: `text-align: ${attrs.textAlign}` }
                                : {},
                    },
                },
            },
        ];
    },
    addCommands() {
        return {
            setTextAlign:
                (align) =>
                ({ commands, state }) => {
                    // Only a paragraph or heading that is a block of its own
                    // (in a column, or a panel's top level). A list item's or
                    // an objective's line is saved as inline text, which has
                    // no alignment, so offering it there would be a lie.
                    const { $from } = state.selection;
                    const host = $from.depth >= 1 ? $from.node($from.depth - 1) : null;
                    if (!host || !['column', 'doc'].includes(host.type.name)) return false;
                    const value = align === 'left' ? null : align;
                    const a = commands.updateAttributes('paragraph', { textAlign: value });
                    const b = commands.updateAttributes('heading', { textAlign: value });
                    return a || b;
                },
        };
    },
});

// Highlight — ONE highlighter colour (schema-shortlist.md S6-b, 2026-11-15).
// A plain mark (schema SIMPLE_MARK_TYPES 'highlight'), so serialize.ts carries
// it like bold. On paper and in forced colours the viewer draws it as a grey
// fill plus an underline, so it still reads in black and white.
import { Mark, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        highlight: {
            toggleHighlight: () => ReturnType;
        };
    }
}

export const Highlight = Mark.create({
    name: 'highlight',
    parseHTML() {
        return [{ tag: 'mark' }];
    },
    renderHTML({ HTMLAttributes }) {
        return ['mark', mergeAttributes(HTMLAttributes, { class: 'editor-highlight' }), 0];
    },
    addCommands() {
        return {
            toggleHighlight:
                () =>
                ({ commands }) =>
                    commands.toggleMark(this.name),
        };
    },
    addKeyboardShortcuts() {
        return { 'Mod-Shift-h': () => this.editor.commands.toggleHighlight() };
    },
});

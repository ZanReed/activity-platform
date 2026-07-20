import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

// ============================================================================
// PlaceholderHint — a grey hint teaching the `/` insert shortcut.
// ----------------------------------------------------------------------------
// A minimal, dependency-free placeholder (we don't pull @tiptap/extension-
// placeholder — the repo keeps the @tiptap/* family lean and version-locked).
// It renders the hint text via a node decoration + CSS ::before on empty
// top-level paragraphs, so it:
//   • greets a brand-new empty activity (the first line is empty), and
//   • reappears on whichever empty line the caret is in.
//
// This is the keyboard door's signifier: the `/` slash menu is otherwise
// invisible. It pairs with the mouse doors (the insert line + end square).
// ============================================================================

const placeholderHintKey = new PluginKey('placeholderHint');

export const HINT_TEXT = 'Type / to add a block — questions, examples, math, and more';

export const PlaceholderHint = Extension.create({
    name: 'placeholderHint',

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: placeholderHintKey,
                props: {
                    decorations: (state) => {
                        const { doc, selection } = state;
                        const decorations: Decoration[] = [];

                        const selectionPos = selection.$from;
                        // The doc's very first stack line: into row (+1), into
                        // column (+1). Position 2 when the first child is a row.
                        const firstLinePos =
                            doc.firstChild?.type.name === 'row' ? 2 : -1;

                        doc.descendants((node, pos) => {
                            const name = node.type.name;
                            // Strict grid: descend through the row/column wrappers
                            // to reach the stack paragraphs; never descend into
                            // other blocks (lists, worked examples, …).
                            if (name === 'row' || name === 'column') return true;
                            if (name !== 'paragraph') return false;
                            // Only paragraphs sitting DIRECTLY in a column stack
                            // (the section flow) carry the "/" hint.
                            if (doc.resolve(pos).parent.type.name !== 'column')
                                return false;
                            if (node.childCount > 0) return false; // not empty

                            // Show on the doc's first line (empty-activity
                            // greeting) OR the empty line holding the caret.
                            const isFirst = pos === firstLinePos;
                            const holdsCaret =
                                selectionPos.pos >= pos &&
                                selectionPos.pos <= pos + node.nodeSize;
                            if (!isFirst && !holdsCaret) return false;

                            decorations.push(
                                Decoration.node(pos, pos + node.nodeSize, {
                                    class: 'is-empty-hint',
                                    'data-placeholder': HINT_TEXT,
                                }),
                            );
                            return false;
                        });

                        return DecorationSet.create(doc, decorations);
                    },
                },
            }),
        ];
    },
});

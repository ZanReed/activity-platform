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

                        const firstChild = doc.firstChild;
                        const selectionPos = selection.$from;

                        doc.descendants((node, pos) => {
                            // Only top-level paragraphs (depth 1 = a direct
                            // child of the doc); never descend into blocks.
                            if (node.type.name !== 'paragraph') return false;
                            const isTopLevel =
                                doc.resolve(pos).depth === 0;
                            if (!isTopLevel) return false;
                            if (node.childCount > 0) return false; // not empty

                            // Show on the doc's first line (empty-activity
                            // greeting) OR the empty line holding the caret.
                            const isFirst = node === firstChild;
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

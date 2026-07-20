import { Node, mergeAttributes } from '@tiptap/core';
import { TextSelection } from '@tiptap/pm/state';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { SectionBreakView } from '../nodeViews/SectionBreakView';
import { topLevelRowAt } from '../strictGrid';

// =============================================================================
// SectionBreak — Tiptap atom node that opens a new Section in the document.
// -----------------------------------------------------------------------------
// The `title` and `isCheckpoint` attrs are a *staging area* for the eventual
// schema-side Section.title / Section.isCheckpoint fields. The serialize layer
// (packages/app/src/lib/serialize.ts) reads these attrs off the break and
// writes them onto the Section that the break opens.
//
// First-section UX (Stage 9c, intentional): the very first Section in any
// document is implicit and inherits defaults (no title, not a checkpoint).
// If a teacher wants to title or check the first section, they insert a
// section_break at the top of the document. Stage 15 will add a proper
// activity-properties panel that covers first-section metadata alongside
// submissionMode / revisionMode / activityType / skills.
// =============================================================================

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        sectionBreak: {
            insertSectionBreak: () => ReturnType;
        };
    }
}

export const SectionBreak = Node.create({
    name: 'sectionBreak',
    // No `group` (strict grid): a sectionBreak is a top-level marker, named
    // directly by the Doc node's content expression. It is deliberately NOT in
    // the `block` group, so a `column`'s block+ content can never hold one.
    atom: true,        // no editable content slot; NodeView provides its own UI
    selectable: true,
    draggable: true,

    addAttributes() {
        return {
            title: {
                default: null as string | null,
                    // parseHTML/renderHTML below are used only by Tiptap's *internal* HTML
                    // serialization (clipboard, etc). The renderer package handles
                    // published-HTML output via the schema-side Section, not via these.
                    parseHTML: (el) => el.getAttribute('data-title'),
                                        renderHTML: (attrs) =>
                                        attrs.title ? { 'data-title': attrs.title } : {},
            },
            isCheckpoint: {
                default: false,
                    parseHTML: (el) => el.getAttribute('data-is-checkpoint') === 'true',
                                        renderHTML: (attrs) => ({
                                            'data-is-checkpoint': attrs.isCheckpoint ? 'true' : 'false',
                                        }),
            },
        };
    },

    parseHTML() {
        return [{ tag: 'div[data-section-break]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-section-break': '' })];
    },

    addNodeView() {
        return ReactNodeViewRenderer(SectionBreakView);
    },

    addCommands() {
        return {
            // Strict grid: a sectionBreak lives only at the doc top level, so it
            // is inserted just AFTER the top-level row holding the caret (the
            // section boundary lands at row granularity). A fresh empty stack row
            // follows it so the new section has somewhere to type, and the caret
            // lands there.
            insertSectionBreak:
            () =>
            ({ state, dispatch, tr }) => {
                const breakType = state.schema.nodes.sectionBreak;
                const rowType = state.schema.nodes.row;
                const columnType = state.schema.nodes.column;
                if (!breakType || !rowType || !columnType) return false;
                const anchor = topLevelRowAt(state.selection.$from);
                const insertPos = anchor
                    ? anchor.pos + anchor.node.nodeSize
                    : state.doc.content.size;
                if (dispatch) {
                    const emptyColumn = columnType.createAndFill();
                    if (!emptyColumn) return false;
                    const newRow = rowType.create({ id: crypto.randomUUID() }, [
                        emptyColumn,
                    ]);
                    tr.insert(insertPos, [breakType.create(), newRow]);
                    // Caret into the new section's empty paragraph (past the
                    // break + into the new row/column).
                    const caret = insertPos + breakType.create().nodeSize + 2;
                    tr.setSelection(
                        TextSelection.near(
                            tr.doc.resolve(Math.min(caret, tr.doc.content.size)),
                        ),
                    );
                    dispatch(tr.scrollIntoView());
                }
                return true;
            },
        };
    },
});

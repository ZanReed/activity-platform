import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import FillInBlankView from '../nodeViews/FillInBlankView';

// ============================================================================
// FillInBlank — Tiptap block node for a fill-in-the-blank problem.
// ----------------------------------------------------------------------------
// Container block whose body holds the same alphabet as the schema's
// FillInBlankInline union: text (with marks), inline math, and blank tokens.
// Content spec restricts what can be inserted; ProseMirror enforces this at
// the editor level, so a user can't paste a heading or another fill_in_blank
// into the body.
//
// Block-level attrs in Stage 13.5 scope:
//   - id: stable UUID auto-assigned at insertion. The serialize layer mints
//     fresh UUIDs on every round trip (existing convention); the in-session
//     id keeps NodeView identity stable while editing.
//
// Out of scope (Stage 15):
//   - solution, hasConfidenceRating, skills attrs and their editing UIs
//
// Drag/drop behavior:
//   This node does NOT carry `defining: true`. An earlier iteration added it
//   speculatively to handle a theoretical "drop into content" issue, but it
//   caused asymmetric drag-reorder failures (later blocks couldn't be moved
//   above earlier blocks; only the first block was reliably draggable). The
//   flag was removed in Stage 13.5 Session 1 debugging. If drop-into-content
//   issues emerge in practice, address them via a different mechanism
//   (NodeView dragend handler, dropcursor extension config, or making the
//   body element explicitly drag-inert).
// ============================================================================

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        fillInBlank: {
            insertFillInBlank: () => ReturnType;
        };
    }
}

export const FillInBlank = Node.create({
    name: 'fillInBlank',
    group: 'block',
    // Content spec: zero-or-more text, mathInline, blank nodes. ProseMirror
    // enforces this — pasting a heading into a fillInBlank body will be
    // rejected (the text content survives, the heading wrapper is stripped).
    content: '(text | mathInline | blank)*',
                                       // Drop targets work at the block level (drag handle in left gutter);
                                       // the block itself is draggable as a unit.
                                       draggable: true,
                                       selectable: true,

                                       addAttributes() {
                                           return {
                                               id: {
                                                   default: '',
                                                       parseHTML: (element) => element.getAttribute('data-block-id') ?? '',
                                       renderHTML: (attributes) =>
                                       attributes.id ? { 'data-block-id': attributes.id } : {},
                                               },
                                           };
                                       },

                                       parseHTML() {
                                           return [{ tag: 'div[data-fill-in-blank]' }];
                                       },

                                       renderHTML({ HTMLAttributes }) {
                                           return [
                                               'div',
                                               mergeAttributes({ 'data-fill-in-blank': '' }, HTMLAttributes),
                                       0,
                                           ];
                                       },

                                       addNodeView() {
                                           return ReactNodeViewRenderer(FillInBlankView);
                                       },

                                       addCommands() {
                                           return {
                                               insertFillInBlank:
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

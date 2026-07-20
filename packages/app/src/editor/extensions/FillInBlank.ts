import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import FillInBlankView from '../nodeViews/FillInBlankView';
import { labelNodeAttr } from '../labelNodeAttr';

declare module '@tiptap/core' {
    // Interface declaration merging requires the type parameters to match the
    // original NodeConfig<Options, Storage> signature exactly (same names), so
    // they can't be renamed to `_`-prefixed or dropped even though unused here.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface NodeConfig<Options, Storage> {
        /**
         * ProseMirror NodeSpec flag — preserves this node when content
         * is replaced into it. Tiptap doesn't surface this granular
         * field (only the combined `defining`), so we augment NodeConfig
         * to accept it. Whether Tiptap forwards it to the underlying
         * NodeSpec at runtime is verified by the empty-fillInBlank +
         * sentinel input-rule test.
         */
        definingForContent?: boolean;
    }
}

// ============================================================================
// FillInBlank — Tiptap block node for a fill-in-the-blank problem.
// ----------------------------------------------------------------------------
// Container block whose body holds the same alphabet as the schema's
// FillInBlankInline union: text (with marks), inline math, and blank tokens.
// Content spec restricts what can be inserted; ProseMirror enforces this at
// the editor level, so a user can't paste a heading or another fill_in_blank
// into the body.
//
// Block-level attrs:
//   - id: stable UUID auto-assigned at insertion. The serialize layer mints
//     fresh UUIDs on every round trip (existing convention); the in-session
//     id keeps NodeView identity stable while editing.
//   - solution: worked explanation shown post-check (Stage 15). Stored as
//     canonical InlineNode[] (rich text + inline math); opaque JSON here, with
//     serialize/the nested mini-editor owning its shape.
//   - hasConfidenceRating: when true, the block asks for a confidence rating
//     before checking (Stage 15).
//   - skills: universal skill tags. Carried through round-trips so imported
//     or future-authored tags survive; the editing UI is deferred to Phase 2
//     (no control surfaces this attr yet).
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
                                       definingForContent: true,

                                       addAttributes() {
                                           return {
                                               id: {
                                                   default: '',
                                                       parseHTML: (element) => element.getAttribute('data-block-id') ?? '',
                                       renderHTML: (attributes) =>
                                       attributes.id ? { 'data-block-id': attributes.id } : {},
                                               },
                                               solution: {
                                                   default: null as unknown[] | null,
                                                       parseHTML: (element) => {
                                                           const raw = element.getAttribute('data-solution');
                                                           if (!raw) return null;
                                                           try {
                                                               const parsed = JSON.parse(raw);
                                                               return Array.isArray(parsed) && parsed.length > 0
                                                               ? parsed
                                                               : null;
                                                           } catch {
                                                               return null;
                                                           }
                                                       },
                                       renderHTML: (attributes) => {
                                           const v = attributes.solution as unknown[] | null;
                                           return Array.isArray(v) && v.length > 0
                                           ? { 'data-solution': JSON.stringify(v) }
                                           : {};
                                       },
                                               },
                                               hasConfidenceRating: {
                                                   default: false,
                                                       parseHTML: (element) =>
                                                       element.getAttribute('data-has-confidence-rating') === 'true',
                                       renderHTML: (attributes) =>
                                       attributes.hasConfidenceRating
                                       ? { 'data-has-confidence-rating': 'true' }
                                       : {},
                                               },
                                               skills: {
                                                   default: [] as string[],
                                                       parseHTML: (element) => {
                                                           const raw = element.getAttribute('data-skills');
                                                           if (!raw) return [];
                                                           try {
                                                               const parsed = JSON.parse(raw);
                                                               return Array.isArray(parsed)
                                                               ? parsed.filter((s): s is string => typeof s === 'string')
                                                               : [];
                                                           } catch {
                                                               return [];
                                                           }
                                                       },
                                       renderHTML: (attributes) =>
                                       Array.isArray(attributes.skills) && attributes.skills.length > 0
                                       ? { 'data-skills': JSON.stringify(attributes.skills) }
                                       : {},
                                               },
                                               // Per-block display label (numbering/label decouple) — shared attr.
                                               ...labelNodeAttr,
                                               // Per-problem print work space (rem). null = inherit the
                                               // activity-level print.workSpace default; a number overrides it
                                               // for this problem only. See the renderer's per-block override.
                                               workSpace: {
                                                   default: null as number | null,
                                                       parseHTML: (element) => {
                                                           const raw = element.getAttribute('data-work-space');
                                                           if (raw === null) return null;
                                                           const n = Number(raw);
                                                           return Number.isFinite(n) && n >= 0 ? n : null;
                                                       },
                                       renderHTML: (attributes) =>
                                       typeof attributes.workSpace === 'number'
                                       ? { 'data-work-space': String(attributes.workSpace) }
                                       : {},
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

import { Node, mergeAttributes, InputRule } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import BlankView from '../nodeViews/BlankView';

// ============================================================================
// Blank — Tiptap inline atom node representing a fill-in-the-blank input.
// ----------------------------------------------------------------------------
// Lives inside fill_in_blank block content streams ONLY (the schema's
// FillInBlankInline union is text | math_inline | blank). The block-level
// extension's content spec enforces the placement at the ProseMirror level.
//
// Attrs (Stage 13.5 Session 2, Drop 2a):
//   - id: stable UUID. Used as the key in SubmissionResponses.blanks[<id>].
//     Minted at insertion via the input rule / chain command.
//   - answer: required, min 1 char (per schema). Canonical correct answer.
//   - acceptableAnswers: array of alternative correct strings. Default [].
//   - hint: optional teacher-authored nudge. Stored as undefined when absent
//     to match the schema's optional field (avoid empty-string ambiguity).
//   - mistakeFeedback: optional array of {match, feedback} pairs. Stored as
//     undefined when absent or empty.
//
// Drop 2a does NOT add any UI for editing hint or mistakeFeedback. Those
// attrs exist in the schema but no popover, toolbar button, or other
// authoring affordance reads or writes them yet. They'll get edit UIs in
// Drops 2b and 2c.
//
// Out of scope for Stage 13.5 entirely:
//   - inputMode (text vs math student input — Phase 2.5)
//   - width override (Stage 15)
//
// Insertion paths:
//   1. insertBlank chain command — programmatic insertion. Used by the
//      eventual toolbar button (Drop 3).
//   2. Eager input rule on {{answer}} or {{answer|alt1|alt2}}. Pipe-delimited
//      matches the runtime's data-blank-answers="canonical|alt1|alt2" wire
//      format. The input rule does NOT populate hint or mistakeFeedback —
//      those get set later via updateBlankAttrs once the popover lands.
//
// Editing path (added in Drop 2a, used in 2b+):
//   updateBlankAttrs chain command — called by the chip popover when the
//   user edits any per-blank field. Targets a specific blank by node
//   position (passed in from the popover, which knows the chip's pos).
//   Does NOT use ProseMirror selection because the popover may be open
//   while the user clicks elsewhere; updating by explicit position avoids
//   the "where is the chip now?" race.
//
// Why raw InputRule + chain instead of nodeInputRule helper?
//   nodeInputRule had a partial-consumption bug — typing
//   {{please|sumimasem|perdon}} produced a chip for "please" but left
//   "|sumimasem|perdon}}" as orphan text. The regex matched correctly;
//   only the deletion was short. Using raw InputRule with explicit range
//   computed from match[0].length ensures the whole sentinel is consumed.
// ============================================================================

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        blank: {
            insertBlank: (attrs: {
                answer: string;
                acceptableAnswers?: string[];
            }) => ReturnType;
            // Update an existing blank's attrs by position. `pos` is the
            // blank node's position in the doc (from a NodeView's getPos()
            // or computed externally). `attrs` is a partial — only provided
            // fields update; others preserved. Returns false if no blank
            // node exists at that position.
            updateBlankAttrs: (
                pos: number,
                attrs: Partial<{
                    answer: string;
                    acceptableAnswers: string[];
                    hint: string | undefined;
                    mistakeFeedback:
                    | Array<{ match: string; feedback: string }>
                    | undefined;
                }>,
            ) => ReturnType;
        };
    }
}

// Greedy match for {{answer}} or {{answer|alt1|alt2|...}}. Trailing $ anchors
// to cursor position so the rule fires when the closing }} is just typed.
// Inner classes [^{}|] explicitly exclude brace and pipe chars from group
// content so we can't span past the intended sentinel boundaries.
const BLANK_INPUT_REGEX = /\{\{([^{}|]+)((?:\|[^{}|]+)*)\}\}$/;

export const Blank = Node.create({
    name: 'blank',
    group: 'inline',
    inline: true,
    atom: true,
    selectable: true,
    draggable: false,

    addAttributes() {
        return {
            id: {
                default: '',
                    parseHTML: (element) => element.getAttribute('data-blank-id') ?? '',
                                 renderHTML: (attributes) =>
                                 attributes.id ? { 'data-blank-id': attributes.id } : {},
            },
            answer: {
                default: '',
                    parseHTML: (element) => element.getAttribute('data-answer') ?? '',
                                 renderHTML: (attributes) => ({ 'data-answer': attributes.answer }),
            },
            acceptableAnswers: {
                default: [] as string[],
                    parseHTML: (element) => {
                        const raw = element.getAttribute('data-acceptable-answers');
                        if (!raw) return [];
                        try {
                            const parsed = JSON.parse(raw);
                            return Array.isArray(parsed) ? parsed : [];
                        } catch {
                            return [];
                        }
                    },
                    renderHTML: (attributes) => {
                        const arr = (attributes.acceptableAnswers as string[]) ?? [];
                        return arr.length > 0
                        ? { 'data-acceptable-answers': JSON.stringify(arr) }
                        : {};
                    },
            },
            // Optional hint string. Stored as undefined (not empty string)
            // when absent, matching the schema's optional field semantics.
            // parseHTML normalizes empty/missing to undefined so saved
            // documents never carry phantom empty hints.
            hint: {
                default: undefined as string | undefined,
                    parseHTML: (element) => {
                        const raw = element.getAttribute('data-hint');
                        return raw && raw.length > 0 ? raw : undefined;
                    },
                    renderHTML: (attributes) => {
                        const v = attributes.hint as string | undefined;
                        return v && v.length > 0 ? { 'data-hint': v } : {};
                    },
            },
            // Optional array of {match, feedback} pairs. JSON-encoded into
            // a single data attribute for compact transport. Stored as
            // undefined when absent or empty so the schema's optional
            // field stays clean.
            mistakeFeedback: {
                default: undefined as
                    | Array<{ match: string; feedback: string }>
                    | undefined,
                    parseHTML: (element) => {
                        const raw = element.getAttribute('data-mistake-feedback');
                        if (!raw) return undefined;
                        try {
                            const parsed = JSON.parse(raw);
                            if (!Array.isArray(parsed)) return undefined;
                            // Filter to well-formed pairs only — defensive
                            // against partially-corrupted stored data.
                            const cleaned = parsed.filter(
                                (p): p is { match: string; feedback: string } =>
                                p &&
                                typeof p === 'object' &&
                                typeof p.match === 'string' &&
                                typeof p.feedback === 'string',
                            );
                            return cleaned.length > 0 ? cleaned : undefined;
                        } catch {
                            return undefined;
                        }
                    },
                    renderHTML: (attributes) => {
                        const v = attributes.mistakeFeedback as
                        | Array<{ match: string; feedback: string }>
                        | undefined;
                        return v && v.length > 0
                        ? { 'data-mistake-feedback': JSON.stringify(v) }
                        : {};
                    },
            },
        };
    },

    parseHTML() {
        return [{ tag: 'span[data-blank]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes({ 'data-blank': '' }, HTMLAttributes)];
    },

    addNodeView() {
        return ReactNodeViewRenderer(BlankView);
    },

    addCommands() {
        return {
            insertBlank:
            (attrs) =>
            ({ chain }) =>
            chain()
            .focus()
            .insertContent({
                type: this.name,
                attrs: {
                    id: crypto.randomUUID(),
                           answer: attrs.answer,
                           acceptableAnswers: attrs.acceptableAnswers ?? [],
                },
            })
            .run(),

                                 // Update a blank's attrs by position. Used by the popover (Drop
                                 // 2b+) to apply edits. setNodeMarkup is the right ProseMirror
                                 // primitive: changes a node's attrs in place without disturbing
                                 // its content or surrounding nodes. For atom nodes (blanks have
                                 // no content), this is equivalent to "change the chip's data
                                 // without touching anything else."
                                 //
                                 // Why merge with existing attrs vs. replace?
                                 //   The popover passes a Partial<> — only the fields the user
                                 //   actually edited. Preserving unedited fields is correct
                                 //   behavior. We read the current node's attrs at `pos` and
                                 //   merge the partial on top.
                                 updateBlankAttrs:
                                 (pos, attrs) =>
                                 ({ tr, state, dispatch }) => {
                                     const node = state.doc.nodeAt(pos);
                                     if (!node || node.type.name !== 'blank') {
                                         return false;
                                     }
                                     const nextAttrs = { ...node.attrs, ...attrs };
                                     if (dispatch) {
                                         tr.setNodeMarkup(pos, undefined, nextAttrs);
                                     }
                                     return true;
                                 },
        };
    },

    addInputRules() {
        const nodeType = this.type;

        return [
            new InputRule({
                find: BLANK_INPUT_REGEX,
                handler: ({ range, match, chain }) => {
                    const canonical = (match[1] ?? '').trim();
                    const altSegment = match[2] ?? '';
                    const acceptableAnswers = altSegment
                    .split('|')
                    .map((s) => s.trim())
                    .filter((s) => s.length > 0);

                    if (canonical.length === 0) {
                        return null;
                    }

                    const from = range.to - match[0].length;
                    const to = range.to;

                    chain()
                    .deleteRange({ from, to })
                    .insertContentAt(from, {
                        type: nodeType.name,
                        attrs: {
                            id: crypto.randomUUID(),
                                     answer: canonical,
                                     acceptableAnswers,
                        },
                    })
                    .run();
                },
            }),
        ];
    },
});

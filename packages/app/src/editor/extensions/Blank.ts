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
// Attrs in Stage 13.5 scope:
//   - id: stable UUID. Used as the key in SubmissionResponses.blanks[<id>].
//     Minted at insertion via the input rule / chain command.
//   - answer: required, min 1 char (per schema). Canonical correct answer.
//   - acceptableAnswers: array of alternative correct strings. Default [].
//
// Out of scope (Stage 15):
//   - hint, mistakeFeedback per-blank attrs (UIs deferred)
//   - width override (Stage 13.5 auto-derives from answer.length on both
//     editor and renderer sides via deriveBlankWidth)
//
// Insertion paths:
//   1. insertBlank chain command — used by the eventual toolbar button
//      (Session 2) and callable programmatically.
//   2. Eager input rule on {{answer}} or {{answer|alt1|alt2}} — fires when
//      the closing }} is typed. Pipe-delimited matches the runtime's
//      data-blank-answers="canonical|alt1|alt2" wire format.
//
// Why raw InputRule + chain instead of nodeInputRule helper?
//   nodeInputRule had a partial-consumption bug in Stage 13.5 Session 1
//   testing — typing {{please|sumimasem|perdon}} produced a chip for "please"
//   but left "|sumimasem|perdon}}" as orphan text. The regex matched
//   correctly (verified via console logging of match[0]); only the deletion
//   was short. Using raw InputRule with explicit range computed from
//   match[0].length ensures the whole sentinel is consumed.
//
//   Critical detail: the handler must use chain() (or mutate the provided
//   tr) to apply changes. An earlier attempt that created a fresh
//   state.tr inside the handler and never dispatched it was a no-op —
//   Tiptap auto-applies the handler's chain/tr, not arbitrary transactions.
// ============================================================================

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        blank: {
            insertBlank: (attrs: {
                answer: string;
                acceptableAnswers?: string[];
            }) => ReturnType;
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
    // Inline atoms aren't draggable in our editor — dragging single blanks
    // around is fiddly and not a natural authoring operation. Reordering
    // happens at the block level via the drag handle.
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
        };
    },

    addInputRules() {
        const nodeType = this.type;

        return [
            new InputRule({
                find: BLANK_INPUT_REGEX,
                handler: ({ range, match, chain }) => {
                    // Parse the match groups. match[0] is the full sentinel
                    // ({{...}}); match[1] is the canonical answer; match[2]
                    // is the |alt|alt|... segment (possibly empty).
                    const canonical = (match[1] ?? '').trim();
                    const altSegment = match[2] ?? '';
                    const acceptableAnswers = altSegment
                    .split('|')
                    .map((s) => s.trim())
                    .filter((s) => s.length > 0);

                    if (canonical.length === 0) {
                        // Schema requires answer.min(1). Don't fire on empty.
                        return null;
                    }

                    // Compute the exact replacement range from match[0].length.
                    // Tiptap's `range` here can sometimes be a shorter
                    // lookback window than the full regex match; computing
                    // `from` as cursor minus full match length ensures we
                    // consume the entire sentinel.
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

import { Node, mergeAttributes, InputRule } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { NodeSelection } from 'prosemirror-state';
import BlankView from '../nodeViews/BlankView';

// ============================================================================
// Blank — Tiptap inline atom node representing a fill-in-the-blank input.
// ----------------------------------------------------------------------------
// Lives inside fill_in_blank block content streams ONLY (the schema's
// FillInBlankInline union is text | math_inline | blank). The block-level
// extension's content spec enforces the placement at the ProseMirror level.
//
// Attrs:
//   - id: stable UUID. Used as the key in SubmissionResponses.blanks[<id>].
//   - answer: required, min 1 char (per schema). Canonical correct answer.
//   - acceptableAnswers: array of alternative correct strings.
//   - hint: optional teacher-authored nudge.
//   - mistakeFeedback: optional array of {match, feedback} pairs.
//
// Editing path:
//   updateBlankAttrs chain command — called by BlankPopoverHost when the
//   user edits any per-blank field. Targets a specific blank by node
//   position.
//
//   `preserveSelection` (default true) — re-applies NodeSelection at the
//   chip's position after setNodeMarkup. Without re-apply, setNodeMarkup
//   can invalidate the existing selection, causing the host to think no
//   blank is selected and unmount the popover. This is desirable during
//   normal field edits (Tab between fields, × remove a row) where we want
//   the popover to stay open.
//
//   When the popover is being CLOSED (Escape, outside click, etc.) and
//   needs to flush pending edits, the caller passes preserveSelection:
//   false. Without re-asserting selection, the subsequent setTextSelection
//   in onClose can move the cursor off the chip cleanly. Without this,
//   the re-asserted NodeSelection fights with the close-time selection
//   move and the popover bounces open again, requiring a second click to
//   actually close.
// ============================================================================

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        blank: {
            insertBlank: (attrs: {
                answer: string;
                acceptableAnswers?: string[];
            }) => ReturnType;
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
                options?: { preserveSelection?: boolean },
            ) => ReturnType;
        };
    }
}

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

            updateBlankAttrs:
                (pos, attrs, options) =>
                ({ tr, state, dispatch }) => {
                    const node = state.doc.nodeAt(pos);
                    if (!node || node.type.name !== 'blank') {
                        return false;
                    }
                    const nextAttrs = { ...node.attrs, ...attrs };
                    if (dispatch) {
                        tr.setNodeMarkup(pos, undefined, nextAttrs);
                        // Re-establish selection at this position so the
                        // popover stays open through normal edits. Skip when
                        // the caller is flushing-before-close — in that
                        // case the subsequent setTextSelection in onClose
                        // needs the selection free to move cleanly off
                        // the chip.
                        const preserveSelection =
                            options?.preserveSelection ?? true;
                        if (preserveSelection) {
                            try {
                                const newSelection = NodeSelection.create(
                                    tr.doc,
                                    pos,
                                );
                                tr.setSelection(newSelection);
                            } catch {
                                /* defensive — non-fatal if selection can't apply */
                            }
                        }
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

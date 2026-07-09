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
//   - hint: optional teacher-authored nudge, stored as canonical InlineNode[]
//     (rich text + inline math). Opaque JSON here; serialize/the nested
//     mini-editor own its shape.
//   - mistakeFeedback: optional array of {match, feedback} pairs where feedback
//     is an InlineNode[] (same opaque-JSON treatment as hint).
//
// Editing path:
//   updateBlankAttrs — `preserveSelection` (default true) re-applies
//   NodeSelection at the chip's position after setNodeMarkup so the
//   popover stays open through edits. Close-time flushes pass false so
//   the subsequent setTextSelection in onClose can move cleanly.
//
// Input rule ({{answer|alt1|alt2}}):
//   Uses insertContentAt with a range argument — a SINGLE transaction
//   step that replaces the matched text range with the blank node in
//   one atomic operation. Underneath this is ProseMirror's
//   replaceRangeWith, which validates the result against the schema in
//   one shot rather than going through an intermediate empty-content
//   state.
//
//   The earlier chain pattern (.deleteRange().insertContentAt()) had
//   two transaction steps with a transient empty-content state
//   between them, which ProseMirror could interpret as "this
//   fill_in_blank block is empty, remove it" if {{...}} was the only
//   content. The range-based insertContentAt avoids the intermediate
//   state.
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
                    interchangeableWithPrevious: boolean;
                    answerType: 'text' | 'numeric';
                    tolerance: number | undefined;
                    hint: unknown[] | undefined;
                    mistakeFeedback:
                        | Array<{ match: string; feedback: unknown[] }>
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
            // Order-independent grouping: when true, this blank's answer is
            // interchangeable with the blank before it (same fill_in_blank
            // block). Authored via the popover checkbox; the renderer compiles
            // adjacent runs of flagged blanks into a scored group.
            interchangeableWithPrevious: {
                default: false,
                parseHTML: (element) =>
                    element.getAttribute('data-interchangeable') === 'true',
                renderHTML: (attributes) =>
                    attributes.interchangeableWithPrevious
                        ? { 'data-interchangeable': 'true' }
                        : {},
            },
            // Numeric answer mode. 'text' (the default) is exact string
            // matching; 'numeric' makes the runtime parse + compare within
            // `tolerance`. serialize.ts maps 'text' → omitted schema field.
            answerType: {
                default: 'text' as 'text' | 'numeric',
                parseHTML: (element) =>
                    element.getAttribute('data-answer-type') === 'numeric'
                        ? 'numeric'
                        : 'text',
                renderHTML: (attributes) =>
                    attributes.answerType === 'numeric'
                        ? { 'data-answer-type': 'numeric' }
                        : {},
            },
            tolerance: {
                default: undefined as number | undefined,
                parseHTML: (element) => {
                    const raw = element.getAttribute('data-tolerance');
                    if (!raw) return undefined;
                    const n = Number(raw);
                    return isFinite(n) && n >= 0 ? n : undefined;
                },
                renderHTML: (attributes) =>
                    attributes.tolerance !== undefined
                        ? { 'data-tolerance': String(attributes.tolerance) }
                        : {},
            },
            hint: {
                default: undefined as unknown[] | undefined,
                parseHTML: (element) => {
                    const raw = element.getAttribute('data-hint');
                    if (!raw) return undefined;
                    try {
                        const parsed = JSON.parse(raw);
                        return Array.isArray(parsed) && parsed.length > 0
                            ? parsed
                            : undefined;
                    } catch {
                        return undefined;
                    }
                },
                renderHTML: (attributes) => {
                    const v = attributes.hint as unknown[] | undefined;
                    return v && v.length > 0
                        ? { 'data-hint': JSON.stringify(v) }
                        : {};
                },
            },
            mistakeFeedback: {
                default: undefined as
                    | Array<{ match: string; feedback: unknown[] }>
                    | undefined,
                parseHTML: (element) => {
                    const raw = element.getAttribute('data-mistake-feedback');
                    if (!raw) return undefined;
                    try {
                        const parsed = JSON.parse(raw);
                        if (!Array.isArray(parsed)) return undefined;
                        const cleaned = parsed.filter(
                            (p): p is { match: string; feedback: unknown[] } =>
                                p &&
                                typeof p === 'object' &&
                                typeof p.match === 'string' &&
                                Array.isArray(p.feedback),
                        );
                        return cleaned.length > 0 ? cleaned : undefined;
                    } catch {
                        return undefined;
                    }
                },
                renderHTML: (attributes) => {
                    const v = attributes.mistakeFeedback as
                        | Array<{ match: string; feedback: unknown[] }>
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
                    // Replace the matched range with the blank node.
                    // insertContentAt with a range arg is a single PM
                    // replaceWith. The parent fillInBlank block survives
                    // the replace because FillInBlank.definingForContent
                    // is true — that prevents PM's content-fit algorithm
                    // from auto-lifting the inline atom out of a parent
                    // it just emptied.
                        chain()
                        .insertContentAt(range, {
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

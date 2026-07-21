import { Node, mergeAttributes, InputRule } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { NodeSelection } from 'prosemirror-state';
import BlankView from '../nodeViews/BlankView';
import { parseBlankSpec, blankAttrsFromSpec } from '../../lib/blankSyntax';

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
            // Insert an empty-answer blank and select it, so BlankPopoverHost
            // opens the edit popover with the Answer input focused. Backs the
            // "+ Blank" button and the ⌘⇧B shortcut. Inserts at `pos` when given
            // (the button passes the block's content-end, since a mousedown on
            // the button can move the live selection before the handler reads
            // it); otherwise at the caret (the keyboard path).
            insertBlankAndEdit: (pos?: number) => ReturnType;
            updateBlankAttrs: (
                pos: number,
                attrs: Partial<{
                    answer: string;
                    acceptableAnswers: string[];
                    interchangeableWithPrevious: boolean;
                    answerType: 'text' | 'numeric' | 'math';
                    tolerance: number | undefined;
                    equivalence: 'value' | 'exact-form' | undefined;
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
            // Answer mode. 'text' (default) = exact string; 'numeric' = parse +
            // compare within `tolerance`; 'math' = expression equivalence via
            // the lazy graph-kit (Model B). serialize.ts maps 'text' → omitted.
            answerType: {
                default: 'text' as 'text' | 'numeric' | 'math',
                parseHTML: (element) => {
                    const raw = element.getAttribute('data-answer-type');
                    return raw === 'numeric' || raw === 'math' ? raw : 'text';
                },
                renderHTML: (attributes) =>
                    attributes.answerType === 'numeric' ||
                    attributes.answerType === 'math'
                        ? { 'data-answer-type': attributes.answerType }
                        : {},
            },
            // Math equivalence mode ('value' default | 'exact-form'). Only
            // meaningful when answerType is 'math'; undefined = 'value'.
            equivalence: {
                default: undefined as 'value' | 'exact-form' | undefined,
                parseHTML: (element) =>
                    element.getAttribute('data-equivalence') === 'exact-form'
                        ? 'exact-form'
                        : undefined,
                renderHTML: (attributes) =>
                    attributes.equivalence === 'exact-form'
                        ? { 'data-equivalence': 'exact-form' }
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

            insertBlankAndEdit:
                (pos) =>
                ({ chain, state }) => {
                    // Explicit `pos` (button) or the caret. `to` (not `from`) so
                    // a non-empty selection places the blank after it rather
                    // than replacing it.
                    const insertPos = pos ?? state.selection.to;
                    return chain()
                        .insertContentAt(insertPos, {
                            type: this.name,
                            attrs: {
                                id: crypto.randomUUID(),
                                answer: '',
                                acceptableAnswers: [],
                            },
                        })
                        .command(({ tr, dispatch }) => {
                            // Select the just-inserted blank (it occupies
                            // [insertPos, insertPos+1]) so the selection-driven
                            // popover host opens it focused. Empty answer is a
                            // valid transient authoring state — the popover
                            // reverts it on blur.
                            if (dispatch) {
                                try {
                                    tr.setSelection(
                                        NodeSelection.create(tr.doc, insertPos),
                                    );
                                } catch {
                                    /* defensive — non-fatal if it can't apply */
                                }
                            }
                            return true;
                        })
                        .run();
                },

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
                    // The SAME {{…}} sigil grammar the markdown importer uses
                    // (shared blankSyntax.ts), so typing {{~3}}, {{=12}}, {{==2a}},
                    // {{Paris | ?hint | !Lyon :: msg}}, or {{a | ??x}} produces the
                    // same blank as pasting it — instead of storing the sigils as
                    // literal text. blankAttrsFromSpec stores hint / mistake
                    // feedback as PLAIN TEXT; the blank popover enriches it (adds
                    // inline math) afterwards. A dropped `!wrong` (no `::`) never
                    // becomes an accepted answer, matching the importer.
                    const spec = parseBlankSpec(match[1] ?? '', match[2] ?? '');
                    if (!spec) {
                        return null; // empty answer → leave {{…}} as literal text
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
                                ...blankAttrsFromSpec(spec),
                            },
                        })
                        .run();
                },
            }),
        ];
    },

    // ⌘⇧B / Ctrl⇧B: insert a blank at the caret and open its popover, mirroring
    // the same chord in the math-field edit chrome (useMathFieldEditing.ts). The
    // `Mod-Shift-b` binding is the normalized "insert a blank" shortcut across
    // both blank flavours. Scoped to fill_in_blank context: a blank can live
    // nowhere else (schema), and returning false everywhere else lets the chord
    // pass through untouched.
    addKeyboardShortcuts() {
        return {
            'Mod-Shift-b': () => {
                const { $from } = this.editor.state.selection;
                let inFillInBlank = false;
                for (let d = $from.depth; d > 0; d--) {
                    if ($from.node(d).type.name === 'fillInBlank') {
                        inFillInBlank = true;
                        break;
                    }
                }
                if (!inFillInBlank) return false;
                return this.editor.commands.insertBlankAndEdit();
            },
        };
    },
});

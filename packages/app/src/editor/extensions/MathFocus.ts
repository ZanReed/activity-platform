// =============================================================================
// MathFocus.ts — cursor handoff between ProseMirror and the MathLive fields
// -----------------------------------------------------------------------------
// Math nodes (mathInline / mathBlock) are `atom: true`: their interior is a
// MathLive <math-field> web component, not ProseMirror content. So the caret
// can't "flow" into them the way it does for normal text — entering edit mode
// is a deliberate handoff. This extension is the doc→field half of that handoff:
//
//   • A one-shot "open" signal, carried as a node Decoration on the target math
//     node. The NodeView (via useMathFieldEditing) consumes it, enters edit
//     mode, focuses the <math-field>, and clears the signal. Decorations map
//     through transactions automatically, so the signal survives concurrent
//     edits without position bookkeeping.
//   • Keyboard shortcuts that raise that signal: Enter on a selected math node,
//     and Arrow{Left,Right} when the caret is about to step onto an inline math
//     atom from the doc (so you can type-navigate straight into a formula).
//
// The field→doc half (arrowing/Escape back out) lives in useMathFieldEditing,
// which listens for MathLive's `move-out` event.
//
// We deliberately do NOT auto-open on every NodeSelection: a NodeSelection is
// also the stepping-stone ProseMirror uses for delete (select-then-Backspace),
// and hijacking it would trap that flow. Opening is always an explicit signal.
// =============================================================================

import { Extension } from '@tiptap/core';
import { Plugin, PluginKey, NodeSelection, type Transaction } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

/** Where to place the caret once the field is focused. */
export type MathOpenMode = 'all' | 'start' | 'end';

const MATH_TYPES = new Set(['mathInline', 'mathBlock']);

export const mathFocusKey = new PluginKey<DecorationSet>('mathFocus');

/** Details a NodeView needs to act on an open signal. */
export interface OpenSignal {
    mode: MathOpenMode;
    /** Monotonic id — changes on every open so re-entry re-triggers the NodeView
     *  effect even when the caret placement (`mode`) is identical. */
    nonce: number;
}

type MathFocusMeta = { type: 'open'; pos: number } & OpenSignal;

// Monotonic across the module. We deliberately never clear an open decoration:
// removing a node decoration forces ProseMirror to redraw that node, which
// blurs the <math-field> we just focused. Instead the decoration lingers
// harmlessly (view-only, never serialized) and the nonce distinguishes a fresh
// open from a stale one. A new open elsewhere replaces the set (one at a time).
let openNonce = 0;

/**
 * Meta payload asking the plugin to raise an "open" signal on the math node at
 * `pos`. Spread into `tr.setMeta(...)`.
 */
export function openMathFieldMeta(pos: number, mode: MathOpenMode): [PluginKey, MathFocusMeta] {
    return [mathFocusKey, { type: 'open', pos, mode, nonce: ++openNonce }];
}

/**
 * Called on the transaction right after a math node is inserted: locates the
 * just-inserted node of `typeName` and raises an "open" signal on it (mode
 * 'all', so the seed LaTeX is selected and the first keystroke replaces it).
 * Best-effort — if the node can't be located the insert simply doesn't
 * auto-open, never throws.
 */
export function signalOpenInsertedMath(tr: Transaction, typeName: string): void {
    const { $from } = tr.selection;
    let pos: number | null = null;
    // Common case (inline, and block when the caret lands right after it): the
    // node sits immediately before the caret.
    const before = $from.nodeBefore;
    if (before?.type.name === typeName) {
        pos = $from.pos - before.nodeSize;
    } else {
        // A block insert can push the caret past a trailing paragraph; scan the
        // handful of positions preceding the caret for the inserted node.
        const start = Math.max(0, $from.pos - 4);
        tr.doc.nodesBetween(start, $from.pos, (n, p) => {
            if (n.type.name === typeName) pos = p;
        });
    }
    if (pos != null) tr.setMeta(...openMathFieldMeta(pos, 'all'));
}

/** Reads the open signal off a NodeView's decorations, if one is present. */
export function readOpenSignal(decorations: readonly Decoration[]): OpenSignal | null {
    for (const deco of decorations) {
        const signal = (deco.spec as { openMathField?: OpenSignal } | undefined)?.openMathField;
        if (signal) return signal;
    }
    return null;
}

export const MathFocus = Extension.create({
    name: 'mathFocus',

    addProseMirrorPlugins() {
        return [
            new Plugin<DecorationSet>({
                key: mathFocusKey,
                state: {
                    init: () => DecorationSet.empty,
                    apply(tr, value) {
                        const meta = tr.getMeta(mathFocusKey) as MathFocusMeta | undefined;
                        // Map existing decorations through the step first so a
                        // signal raised in the same tr as a doc change lands on
                        // the right node.
                        let set = value.map(tr.mapping, tr.doc);
                        if (meta?.type === 'open') {
                            const node = tr.doc.nodeAt(meta.pos);
                            if (node && MATH_TYPES.has(node.type.name)) {
                                const signal: OpenSignal = { mode: meta.mode, nonce: meta.nonce };
                                set = DecorationSet.create(tr.doc, [
                                    Decoration.node(
                                        meta.pos,
                                        meta.pos + node.nodeSize,
                                        {},
                                        { openMathField: signal },
                                    ),
                                ]);
                            }
                        }
                        return set;
                    },
                },
                props: {
                    decorations(state) {
                        return mathFocusKey.getState(state);
                    },
                },
            }),
        ];
    },

    addKeyboardShortcuts() {
        const raise = (pos: number, mode: MathOpenMode) =>
            ({ editor }: { editor: import('@tiptap/core').Editor }) => {
                editor.view.dispatch(editor.state.tr.setMeta(...openMathFieldMeta(pos, mode)));
                return true;
            };

        return {
            // Enter on a selected math node opens its field (caret at the end).
            Enter: ({ editor }) => {
                const { selection } = editor.state;
                if (
                    selection instanceof NodeSelection &&
                    MATH_TYPES.has(selection.node.type.name)
                ) {
                    return raise(selection.from, 'end')({ editor });
                }
                return false;
            },
            // Type-navigating right into an inline math atom: enter at its start.
            ArrowRight: ({ editor }) => {
                const { selection } = editor.state;
                if (!selection.empty) return false;
                const after = selection.$from.nodeAfter;
                if (after?.type.name === 'mathInline') {
                    return raise(selection.from, 'start')({ editor });
                }
                return false;
            },
            // Type-navigating left into an inline math atom: enter at its end.
            ArrowLeft: ({ editor }) => {
                const { selection } = editor.state;
                if (!selection.empty) return false;
                const before = selection.$from.nodeBefore;
                if (before?.type.name === 'mathInline') {
                    return raise(selection.from - before.nodeSize, 'end')({ editor });
                }
                return false;
            },
        };
    },
});

// =============================================================================
// useMathFieldEditing — shared MathLive NodeView logic for inline + block math
// -----------------------------------------------------------------------------
// MathInlineView and MathBlockView differ only in tag (span vs div) and KaTeX
// display mode; every behavior below is identical, so it lives here once. This
// hook owns the NodeView half of the caret handoff described in MathFocus.ts:
//
//   • KaTeX renders the static view (5-commitments lifecycle: useLayoutEffect,
//     stable ref, tight [latex] dep, throwOnError:false).
//   • Entering edit mode focuses the <math-field> one animation frame late
//     (MathLive custom elements don't autofocus, and a focus issued the same
//     tick the element mounts is dropped) and places the caret per the open
//     mode (select-all on insert so the seed is type-over-able; start/end when
//     arrowing in from the doc).
//   • An "open" signal arriving as a Decoration (from MathFocus) enters edit
//     mode, then is cleared so a later blur can't re-trigger it.
//   • Leaving the field — MathLive's `move-out` (arrow/tab past an edge) or
//     Escape — hands the caret back to the doc on the correct side.
//
// Invariant preserved from the original views: exiting edit mode is driven by
// the field's blur, so the field must be focused on entry or the node gets
// stuck in edit mode forever (an unfocused field can never blur).
// =============================================================================

import { useLayoutEffect, useRef, useState } from 'react';
import katex from 'katex';
import type { NodeViewProps } from '@tiptap/react';
import type { MathfieldElement } from 'mathlive';
import { readOpenSignal, type MathOpenMode } from '../extensions/MathFocus';

export interface MathFieldEditing<E extends HTMLElement> {
    latex: string;
    editing: boolean;
    /** Ref for the KaTeX static-render target (span for inline, div for block). */
    renderRef: React.RefObject<E | null>;
    mathFieldRef: React.RefObject<MathfieldElement | null>;
    /** Click handler for the wrapper: enters edit mode (caret at the end). */
    onWrapperClick: () => void;
    /** Props to spread onto the <math-field> element. */
    fieldProps: {
        onInput: (e: React.FormEvent) => void;
        onBlur: () => void;
        onKeyDown: (e: React.KeyboardEvent) => void;
    };
}

export function useMathFieldEditing<E extends HTMLElement>(
    props: NodeViewProps,
    displayMode: boolean,
): MathFieldEditing<E> {
    const { node, updateAttributes, editor, getPos, decorations } = props;
    const latex = node.attrs.latex as string;
    const [editing, setEditing] = useState(false);
    const renderRef = useRef<E>(null);
    const mathFieldRef = useRef<MathfieldElement>(null);
    // Where to place the caret the next time the field is focused. A ref (not
    // state) so setting it never triggers an extra render.
    const openModeRef = useRef<MathOpenMode>('end');

    // Static KaTeX render — stays mounted (hidden while editing) so renderRef
    // is stable across edit cycles.
    useLayoutEffect(() => {
        if (!renderRef.current) return;
        katex.render(latex || '\\square', renderRef.current, {
            displayMode,
            throwOnError: false,
        });
    }, [latex, displayMode]);

    // Consume an "open" signal delivered as a decoration by MathFocus (insert or
    // keyboard re-entry): enter edit mode with the requested caret placement.
    // Keyed on the signal's nonce so a fresh open re-triggers even when `mode`
    // is unchanged; the decoration itself is never cleared (see MathFocus.ts).
    const openSignal = readOpenSignal(decorations);
    const openNonce = openSignal?.nonce ?? null;
    useLayoutEffect(() => {
        if (!openSignal) return;
        openModeRef.current = openSignal.mode;
        setEditing(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openNonce]);

    // Hand the caret back to the document on the given side of this node.
    const exitToDoc = (side: 'before' | 'after') => {
        const pos = typeof getPos === 'function' ? getPos() : undefined;
        setEditing(false);
        if (typeof pos !== 'number') {
            editor.commands.focus();
            return;
        }
        const target = side === 'before' ? pos : pos + node.nodeSize;
        editor.chain().focus().setTextSelection(target).run();
    };

    // Configure + focus the field on entry; wire move-out for the field→doc
    // handoff. Deferred one frame so MathLive has finished wiring its editable
    // region before we focus and position the caret.
    useLayoutEffect(() => {
        if (!editing || !mathFieldRef.current) return;
        const mf = mathFieldRef.current;
        mf.mathVirtualKeyboardPolicy = 'manual';
        const showKeyboard = () => window.mathVirtualKeyboard?.show();
        const hideKeyboard = () => window.mathVirtualKeyboard?.hide();
        const onMoveOut = (ev: Event) => {
            const direction = (ev as CustomEvent<{ direction: string }>).detail?.direction;
            // Prevent MathLive's default (which would just no-op) and move the
            // ProseMirror caret to the matching side instead.
            ev.preventDefault();
            exitToDoc(direction === 'backward' || direction === 'upward' ? 'before' : 'after');
        };
        mf.addEventListener('focusin', showKeyboard);
        mf.addEventListener('focusout', hideKeyboard);
        mf.addEventListener('move-out', onMoveOut);

        // Focus + place the caret one frame after mount. MathLive's focus()
        // resolves asynchronously (the element isn't document.activeElement until
        // a tick later) — so we call it exactly once and trust it to land;
        // polling activeElement and re-focusing breaks MathLive's own async
        // focus handling. executeCommand operates on the model immediately, so
        // the caret placement is correct by the time focus resolves.
        // Focus + place the caret one frame after mount. MathLive's focus()
        // resolves asynchronously and a field created this tick isn't focusable
        // until its shadow DOM is wired, so defer one frame (matching the
        // original NodeViews). executeCommand operates on the model immediately,
        // so the caret placement is correct by the time focus resolves.
        const raf = requestAnimationFrame(() => {
            mf.focus();
            const mode = openModeRef.current;
            if (mode === 'all') mf.executeCommand('selectAll');
            else if (mode === 'start') mf.executeCommand('moveToMathfieldStart');
            else mf.executeCommand('moveToMathfieldEnd');
            // Reset to the click-default for the next entry.
            openModeRef.current = 'end';
        });

        return () => {
            cancelAnimationFrame(raf);
            mf.removeEventListener('focusin', showKeyboard);
            mf.removeEventListener('focusout', hideKeyboard);
            mf.removeEventListener('move-out', onMoveOut);
        };
    }, [editing]);

    return {
        latex,
        editing,
        renderRef,
        mathFieldRef,
        onWrapperClick: () => {
            if (editing) return;
            openModeRef.current = 'end';
            setEditing(true);
        },
        fieldProps: {
            onInput: (e) => updateAttributes({ latex: (e.currentTarget as MathfieldElement).value }),
            onBlur: () => setEditing(false),
            onKeyDown: (e) => {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    exitToDoc('after');
                }
            },
        },
    };
}

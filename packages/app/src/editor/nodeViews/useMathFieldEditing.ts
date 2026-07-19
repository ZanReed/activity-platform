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
import type { MathPrompt } from '@activity/schema';
import { asciiToLatex } from '@activity/graph-kit';
import { readOpenSignal, type MathOpenMode } from '../extensions/MathFocus';
import {
  hasPlaceholders,
  placeholderEntries,
  buildMathPrompts,
} from '../mathPromptSync';

// A MathLive-safe unique gap id: alphanumeric only (placeholder ids can't hold
// uuid hyphens) — random suffix is unique enough within one equation.
function mintPromptId(): string {
  return 'g' + Math.random().toString(36).slice(2, 8);
}

// Model A reconcile (MA-DR3 answer-in-gap): derive prompts[] from the gaps'
// in-field answers. We store the RAW latex (answers still embedded), NOT an
// emptied one: emptying the stored latex makes React re-render the field with
// emptied children, which — verified live — resets MathLive and wipes the
// just-typed answer. The draft latex is the teacher's private copy (never served
// to students); serialize() empties the placeholders at publish, so the answer
// never reaches the student-facing latex / data-math-prompt-latex. The pure half
// (buildMathPrompts) is unit-tested; here we just parse the field's latex (not
// getPromptValue, which returns '' for a programmatically-set placeholder).
function reconcilePrompts(
  field: MathfieldElement,
  existing: MathPrompt[],
): { latex: string; prompts: MathPrompt[] } {
  const raw = field.value;
  if (!hasPlaceholders(raw)) return { latex: raw, prompts: [] };
  const gaps = placeholderEntries(raw).map((e) => ({
    id: e.id,
    answerLatex: e.value,
  }));
  return { latex: raw, prompts: buildMathPrompts(gaps, existing) };
}

export interface MathFieldEditing<E extends HTMLElement> {
    latex: string;
    editing: boolean;
    /** Ref for the KaTeX static-render target (span for inline, div for block). */
    renderRef: React.RefObject<E | null>;
    mathFieldRef: React.RefObject<MathfieldElement | null>;
    /** Click handler for the wrapper: enters edit mode (caret at the end). */
    onWrapperClick: () => void;
    /** The node's current Model A gaps (drives the gap-signifier + popover). */
    prompts: MathPrompt[];
    /** Insert an empty `\placeholder` gap at the caret (the insert-blank button). */
    insertPrompt: () => void;
    /** Set true while interacting with the settings popover so a field blur
     *  doesn't tear down edit mode (unmounting the popover). MathLive blurs on
     *  outside pointerdown and its blur relatedTarget is null across the shadow
     *  boundary, so an explicit guard is more reliable than relatedTarget. */
    keepEditingRef: React.MutableRefObject<boolean>;
    /** Props to spread onto the <math-field> element. */
    fieldProps: {
        onInput: (e: React.FormEvent) => void;
        onBlur: (e: React.FocusEvent) => void;
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
    // Guard: the NodeView sets this true while the settings popover is open, so a
    // field blur (MathLive blurs on outside pointerdown) doesn't exit edit mode.
    const keepEditingRef = useRef(false);

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
        // Never auto-pop the on-screen virtual keyboard: 'manual' policy AND no
        // show-on-focus (we used to call mathVirtualKeyboard.show() on focusin,
        // which meant it appeared every time a teacher clicked into math to edit
        // — the reported annoyance). Desktop authors type with their keyboard; a
        // touch trigger is part of the deferred input-parity pass.
        mf.mathVirtualKeyboardPolicy = 'manual';
        const onMoveOut = (ev: Event) => {
            const direction = (ev as CustomEvent<{ direction: string }>).detail?.direction;
            // Prevent MathLive's default (which would just no-op) and move the
            // ProseMirror caret to the matching side instead.
            ev.preventDefault();
            exitToDoc(direction === 'backward' || direction === 'upward' ? 'before' : 'after');
        };
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
            // Model A: the stored latex has EMPTY placeholders (answers live in
            // prompts[]); re-fill each gap so the author sees their answers again
            // (MA-DR3). Runs after the field is wired so its prompts exist.
            const stored = (node.attrs.prompts as MathPrompt[] | undefined) ?? [];
            for (const p of stored) {
                try {
                    mf.setPromptValue(p.id, asciiToLatex(p.answer), {});
                } catch {
                    // The gap id no longer exists in the latex — skip it.
                }
            }
        });

        return () => {
            cancelAnimationFrame(raf);
            mf.removeEventListener('move-out', onMoveOut);
        };
    }, [editing]);

    // Insert an empty gap at the caret. Shared by the "+ Blank" button and the
    // ⌘⇧B / Ctrl⇧B shortcut, so define it once here.
    const insertPrompt = (): void => {
        const mf = mathFieldRef.current;
        if (!mf) return;
        mf.insert('\\placeholder[' + mintPromptId() + ']{}');
        mf.focus();
    };

    return {
        latex,
        editing,
        renderRef,
        mathFieldRef,
        prompts: (node.attrs.prompts as MathPrompt[] | undefined) ?? [],
        keepEditingRef,
        insertPrompt,
        onWrapperClick: () => {
            if (editing) return;
            openModeRef.current = 'end';
            setEditing(true);
        },
        fieldProps: {
            onInput: (e) => {
                const field = e.currentTarget as MathfieldElement;
                const existing = (node.attrs.prompts as MathPrompt[] | undefined) ?? [];
                const { latex: nextLatex, prompts } = reconcilePrompts(field, existing);
                // Include prompts in the write only when there are (or were) any,
                // so a plain equation's attrs stay prompt-free (byte-identity).
                if (prompts.length > 0 || existing.length > 0) {
                    updateAttributes({ latex: nextLatex, prompts });
                } else {
                    updateAttributes({ latex: nextLatex });
                }
            },
            onBlur: (e) => {
                // Model A: interacting with the edit chrome / settings popover
                // moves focus out of the field but must NOT tear down edit mode
                // (which would unmount the popover mid-interaction). The explicit
                // keepEditing guard is primary (MathLive's blur relatedTarget is
                // null across the shadow boundary); relatedTarget is a fallback.
                if (keepEditingRef.current) return;
                const next = e.relatedTarget as HTMLElement | null;
                if (
                    next &&
                    typeof next.closest === 'function' &&
                    next.closest('.math-edit-chrome, .blank-edit-popover')
                ) {
                    return;
                }
                setEditing(false);
            },
            onKeyDown: (e) => {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    exitToDoc('after');
                    return;
                }
                // ⌘⇧B / Ctrl⇧B: insert a fill-in blank at the caret (MA-DR1).
                if (
                    (e.metaKey || e.ctrlKey) &&
                    e.shiftKey &&
                    (e.key === 'b' || e.key === 'B')
                ) {
                    e.preventDefault();
                    insertPrompt();
                }
            },
        },
    };
}

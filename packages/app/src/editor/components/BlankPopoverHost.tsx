import { useEffect, useState, useCallback } from 'react';
import type { Editor } from '@tiptap/react';
import { NodeSelection } from 'prosemirror-state';
import BlankEditPopover from './BlankEditPopover';

// ============================================================================
// BlankPopoverHost — root-level popover orchestrator for blank chips.
// ----------------------------------------------------------------------------
// Single instance lives at editor root (sibling of EditorContent). Watches
// editor selection updates and shows the BlankEditPopover when a blank node
// is currently selected. When selection moves elsewhere, popover hides.
//
// Why a single host instead of per-chip popovers?
//   Per-chip popovers were tried in Drop 1 and caused widespread editor
//   issues (slash menu rendering inline, fill-in-blank blocks becoming
//   uneditable, drag handles breaking). Diagnosed as React reconciliation
//   problems caused by N permanently-mounted popovers calling useFloating
//   and createPortal regardless of open state. The single-host pattern
//   has one popover lifecycle, mounts only when needed, and integrates
//   cleanly with Tiptap's selection model.
//
// Selection narrowing:
//   ProseMirror's Selection base type doesn't expose `.node` directly. The
//   canonical way to detect "a single node is selected" is instanceof
//   NodeSelection — that class has a typed `.node` property. We import
//   NodeSelection from prosemirror-state (already a transitive dep via
//   Tiptap).
//
// Why query the chip DOM via document.querySelector instead of ProseMirror's
// view.nodeDOM(pos)?
//   nodeDOM is the canonical lookup, but accessing the view object from
//   the editor API is fiddly and can be brittle during transactions. The
//   blank's data-blank-id is stable and unique, so a CSS selector is
//   simpler and more reliable.
// ============================================================================

interface BlankPopoverHostProps {
    editor: Editor | null;
}

interface SelectedBlankState {
    pos: number;
    blankId: string;
    answer: string;
    acceptableAnswers: string[];
    hint: string | undefined;
    mistakeFeedback: Array<{ match: string; feedback: string }> | undefined;
}

export default function BlankPopoverHost({ editor }: BlankPopoverHostProps) {
    const [selectedBlank, setSelectedBlank] = useState<SelectedBlankState | null>(
        null,
    );
    const [referenceElement, setReferenceElement] =
    useState<HTMLElement | null>(null);

    // Resolve the chip's DOM element by blank id. Defensive escaping protects
    // against future id format changes (UUIDs don't contain special CSS
    // selector chars today, but the cost of CSS.escape is trivial).
    const resolveChipElement = useCallback((blankId: string) => {
        if (!blankId) return null;
        const escaped =
        typeof CSS !== 'undefined' && CSS.escape
        ? CSS.escape(blankId)
        : blankId;
        return document.querySelector<HTMLElement>(
            `.blank-chip[data-blank-id="${escaped}"]`,
        );
    }, []);

    useEffect(() => {
        if (!editor) return;

        const updateFromSelection = () => {
            const { selection } = editor.state;

            // instanceof NodeSelection narrows selection.node to a typed
            // ProseMirror Node, with .type and .attrs accessible.
            if (!(selection instanceof NodeSelection)) {
                setSelectedBlank((prev) => (prev === null ? prev : null));
                return;
            }

            const node = selection.node;
            if (node.type.name !== 'blank') {
                setSelectedBlank((prev) => (prev === null ? prev : null));
                return;
            }

            const pos = selection.from;
            const blankId = (node.attrs.id as string) ?? '';
            const answer = (node.attrs.answer as string) ?? '';
            const acceptableAnswers =
            (node.attrs.acceptableAnswers as string[]) ?? [];
            const hint = node.attrs.hint as string | undefined;
            const mistakeFeedback = node.attrs.mistakeFeedback as
            | Array<{ match: string; feedback: string }>
            | undefined;

            // Identity-stable comparison: only update state if attrs actually
            // changed. Avoids redundant renders + popover state resets when
            // unrelated transactions fire.
            setSelectedBlank((prev) => {
                if (
                    prev &&
                    prev.pos === pos &&
                    prev.blankId === blankId &&
                    prev.answer === answer &&
                    arraysEqual(prev.acceptableAnswers, acceptableAnswers) &&
                    prev.hint === hint &&
                    feedbackEqual(prev.mistakeFeedback, mistakeFeedback)
                ) {
                    return prev;
                }
                return {
                    pos,
                    blankId,
                    answer,
                    acceptableAnswers,
                    hint,
                    mistakeFeedback,
                };
            });
        };

        editor.on('selectionUpdate', updateFromSelection);
        editor.on('transaction', updateFromSelection);
        // Run once on mount in case selection is already on a blank when
        // we attach (e.g., hot reload re-mounted the host).
        updateFromSelection();

        return () => {
            editor.off('selectionUpdate', updateFromSelection);
            editor.off('transaction', updateFromSelection);
        };
    }, [editor]);

    // Resolve the chip DOM element whenever the selected blank changes.
    // requestAnimationFrame defers the query until after Tiptap renders —
    // the chip's DOM may not yet exist when selectionUpdate fires.
    useEffect(() => {
        if (!selectedBlank) {
            setReferenceElement(null);
            return;
        }
        const raf = requestAnimationFrame(() => {
            setReferenceElement(resolveChipElement(selectedBlank.blankId));
        });
        return () => cancelAnimationFrame(raf);
    }, [selectedBlank, resolveChipElement]);

    const handleChange = useCallback(
        (
            attrs: Partial<{
                answer: string;
                acceptableAnswers: string[];
                hint: string | undefined;
                mistakeFeedback:
                | Array<{ match: string; feedback: string }>
                | undefined;
            }>,
        ) => {
            if (!editor || !selectedBlank) return;
            editor.commands.updateBlankAttrs(selectedBlank.pos, attrs);
        },
        [editor, selectedBlank],
    );

    const handleClose = useCallback(() => {
        if (!editor) return;
        // Move selection off the chip so the popover-watch effect closes.
        // Position after the chip lets the user keep typing where they left
        // off without manually clicking back into the prose.
        if (selectedBlank) {
            editor.commands.setTextSelection(selectedBlank.pos + 1);
        }
    }, [editor, selectedBlank]);

    if (!editor || !selectedBlank) return null;

    return (
        <BlankEditPopover
        referenceElement={referenceElement}
        isOpen={true}
        initialAnswer={selectedBlank.answer}
        initialAcceptableAnswers={selectedBlank.acceptableAnswers}
        initialHint={selectedBlank.hint}
        initialMistakeFeedback={selectedBlank.mistakeFeedback}
        onChange={handleChange}
        onClose={handleClose}
        />
    );
}

function arraysEqual<T>(a: T[], b: T[]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function feedbackEqual(
    a: Array<{ match: string; feedback: string }> | undefined,
    b: Array<{ match: string; feedback: string }> | undefined,
): boolean {
    if (a === b) return true;
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i]?.match !== b[i]?.match) return false;
        if (a[i]?.feedback !== b[i]?.feedback) return false;
    }
    return true;
}

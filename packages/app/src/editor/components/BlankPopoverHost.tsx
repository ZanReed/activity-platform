import { useEffect, useState, useCallback } from 'react';
import type { Editor } from '@tiptap/react';
import { NodeSelection } from 'prosemirror-state';
import BlankEditPopover from './BlankEditPopover';
import type { InlineNodes } from '../../lib/serialize';
import {
    isSameBlankSelection,
    type SelectedBlankState,
} from './blankPopoverLogic';

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
// onChange options:
//   The popover passes an optional `options` argument to onChange, threaded
//   through to updateBlankAttrs. Used by the popover's close-time flush
//   to skip selection re-assertion (so the subsequent close can move
//   selection cleanly off the chip in one click).
// ============================================================================

interface BlankPopoverHostProps {
    editor: Editor | null;
}

interface ChangeOptions {
    preserveSelection?: boolean;
}

export default function BlankPopoverHost({ editor }: BlankPopoverHostProps) {
    const [selectedBlank, setSelectedBlank] = useState<SelectedBlankState | null>(
        null,
    );
    const [referenceElement, setReferenceElement] =
        useState<HTMLElement | null>(null);

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
            const hint = node.attrs.hint as InlineNodes | undefined;
            const mistakeFeedback = node.attrs.mistakeFeedback as
                | Array<{ match: string; feedback: InlineNodes }>
                | undefined;
            const interchangeableWithPrevious =
                node.attrs.interchangeableWithPrevious === true;
            const answerType =
                node.attrs.answerType === 'numeric' ? 'numeric' : 'text';
            const tolerance =
                typeof node.attrs.tolerance === 'number'
                    ? (node.attrs.tolerance as number)
                    : undefined;

            // Structural: can this blank group with a previous one? Only when an
            // earlier blank exists in the same fill_in_blank block. The first
            // blank in a block has nothing to group with, so the checkbox hides.
            const $pos = editor.state.doc.resolve(pos);
            const parent = $pos.parent;
            const indexInParent = $pos.index();
            let canGroupWithPrevious = false;
            for (let i = 0; i < indexInParent; i++) {
                if (parent.child(i).type.name === 'blank') {
                    canGroupWithPrevious = true;
                    break;
                }
            }

            setSelectedBlank((prev) => {
                const next: SelectedBlankState = {
                    pos,
                    blankId,
                    answer,
                    acceptableAnswers,
                    hint,
                    mistakeFeedback,
                    interchangeableWithPrevious,
                    answerType,
                    tolerance,
                    canGroupWithPrevious,
                };
                return isSameBlankSelection(prev, next) ? prev : next;
            });
        };

        editor.on('selectionUpdate', updateFromSelection);
        editor.on('transaction', updateFromSelection);
        updateFromSelection();

        return () => {
            editor.off('selectionUpdate', updateFromSelection);
            editor.off('transaction', updateFromSelection);
        };
    }, [editor]);

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

    // handleChange accepts an optional options object threaded to the
    // editor command. preserveSelection: false is used by the popover's
    // close-time flush to release selection so onClose can move it cleanly.
    const handleChange = useCallback(
        (
            attrs: Partial<{
                answer: string;
                acceptableAnswers: string[];
                interchangeableWithPrevious: boolean;
                answerType: 'text' | 'numeric';
                tolerance: number | undefined;
                hint: InlineNodes | undefined;
                mistakeFeedback:
                    | Array<{ match: string; feedback: InlineNodes }>
                    | undefined;
            }>,
            options?: ChangeOptions,
        ) => {
            if (!editor || !selectedBlank) return;
            editor.commands.updateBlankAttrs(selectedBlank.pos, attrs, options);
        },
        [editor, selectedBlank],
    );

    const handleClose = useCallback(() => {
        if (!editor) return;
        if (selectedBlank) {
            editor.commands.setTextSelection(selectedBlank.pos + 1);
        }
    }, [editor, selectedBlank]);

    if (!editor || !selectedBlank) return null;

    return (
        <BlankEditPopover
            referenceElement={referenceElement}
            isOpen={true}
            blankId={selectedBlank.blankId}
            initialAnswer={selectedBlank.answer}
            initialAcceptableAnswers={selectedBlank.acceptableAnswers}
            initialHint={selectedBlank.hint}
            initialMistakeFeedback={selectedBlank.mistakeFeedback}
            initialInterchangeable={selectedBlank.interchangeableWithPrevious}
            initialAnswerType={selectedBlank.answerType}
            initialTolerance={selectedBlank.tolerance}
            canGroupWithPrevious={selectedBlank.canGroupWithPrevious}
            onChange={handleChange}
            onClose={handleClose}
        />
    );
}

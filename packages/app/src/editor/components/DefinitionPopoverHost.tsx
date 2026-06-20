import { useEffect, useState, useCallback } from 'react';
import type { Editor } from '@tiptap/react';
import { getMarkRange } from '@tiptap/core';
import DefinitionEditPopover from './DefinitionEditPopover';

// ============================================================================
// DefinitionPopoverHost — root-level edit popover for the `definition` mark.
// ----------------------------------------------------------------------------
// Single instance at editor root (mirrors BlankPopoverHost / ImagePopoverHost).
// Watches the selection; when the cursor sits inside a definition mark it opens
// the edit popover anchored to that marked span. One popover lifecycle — never
// per-mark mounting (the standing reconciliation constraint).
//
// Unlike the blank/image hosts (node selections), `definition` is a MARK, so
// "what's targeted" is found via getMarkRange around the cursor. The range's
// start position keys the popover, so its draft reloads only when the author
// moves to a DIFFERENT definition — not on every keystroke-driven transaction.
// Editing the definition text changes only the mark's attribute, never the
// document text, so [from, to) stays put for the whole editing session.
// ============================================================================

interface DefinitionPopoverHostProps {
    editor: Editor | null;
}

interface ActiveDefinition {
    from: number;
    to: number;
    definition: string;
}

export default function DefinitionPopoverHost({
    editor,
}: DefinitionPopoverHostProps) {
    const [active, setActive] = useState<ActiveDefinition | null>(null);
    const [referenceElement, setReferenceElement] =
        useState<HTMLElement | null>(null);

    useEffect(() => {
        if (!editor) return;

        const update = () => {
            const markType = editor.schema.marks.definition;
            if (!markType || !editor.isActive('definition')) {
                setActive((prev) => (prev === null ? prev : null));
                return;
            }
            const { from } = editor.state.selection;
            const range = getMarkRange(
                editor.state.doc.resolve(from),
                markType,
            );
            if (!range) {
                setActive((prev) => (prev === null ? prev : null));
                return;
            }
            const definition =
                (editor.getAttributes('definition').definition as string) ?? '';
            setActive((prev) =>
                prev &&
                prev.from === range.from &&
                prev.to === range.to &&
                prev.definition === definition
                    ? prev
                    : { from: range.from, to: range.to, definition },
            );
        };

        editor.on('selectionUpdate', update);
        editor.on('transaction', update);
        update();
        return () => {
            editor.off('selectionUpdate', update);
            editor.off('transaction', update);
        };
    }, [editor]);

    // Resolve the .definition span at the marked range for floating-ui anchoring.
    useEffect(() => {
        if (!editor || !active) {
            setReferenceElement(null);
            return;
        }
        const raf = requestAnimationFrame(() => {
            try {
                const dom = editor.view.domAtPos(active.from + 1);
                const node = dom.node;
                const el =
                    node.nodeType === 3
                        ? node.parentElement
                        : (node as HTMLElement);
                setReferenceElement(
                    el?.closest<HTMLElement>('.definition') ?? null,
                );
            } catch {
                setReferenceElement(null);
            }
        });
        return () => cancelAnimationFrame(raf);
    }, [editor, active]);

    const handleChange = useCallback(
        (definition: string) => {
            if (!editor) return;
            editor.commands.updateDefinition({ definition });
        },
        [editor],
    );

    const handleRemove = useCallback(() => {
        if (!editor) return;
        editor.chain().focus().unsetDefinition().run();
    }, [editor]);

    const handleClose = useCallback(() => {
        if (!editor || !active) return;
        // Move the cursor just past the marked range (inclusive:false, so `to`
        // is outside the mark) — releases the popover instead of reopening it.
        editor.chain().focus().setTextSelection(active.to).run();
    }, [editor, active]);

    if (!editor || !active) return null;

    return (
        <DefinitionEditPopover
            key={active.from}
            referenceElement={referenceElement}
            initialDefinition={active.definition}
            onChange={handleChange}
            onRemove={handleRemove}
            onClose={handleClose}
        />
    );
}

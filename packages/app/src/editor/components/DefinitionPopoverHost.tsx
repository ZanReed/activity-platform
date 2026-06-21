import { useEffect, useState, useCallback } from 'react';
import type { Editor } from '@tiptap/react';
import { getMarkRange } from '@tiptap/core';
import DefinitionEditPopover from './DefinitionEditPopover';
import type { InlineNodes } from '../../lib/serialize';
import type { DefinitionImageAttr } from '../extensions/Definition';

// ============================================================================
// DefinitionPopoverHost — root-level edit popover for the `definition` mark.
// ----------------------------------------------------------------------------
// Single instance at editor root (mirrors BlankPopoverHost / ImagePopoverHost).
// Watches the selection; when the cursor sits inside a definition mark it opens
// the edit popover anchored to that marked span. One popover lifecycle — never
// per-mark mounting (the standing reconciliation constraint).
//
// `definition` is a MARK, so the target is found via getMarkRange around the
// cursor. The range's start keys the popover. `active` is set ONLY when the
// target range changes — not on every transaction — so committing the
// definition's own content (which fires a transaction) never resets the
// popover's in-progress draft. Editing content/image changes only the mark's
// attrs, never the document text, so [from, to) is stable for the session.
// ============================================================================

interface DefinitionPopoverHostProps {
    editor: Editor | null;
    // Forwarded to the popover's image control for uploads. Undefined in the
    // playground, where uploads are disabled (URL paste only).
    activityId?: string;
}

interface ActiveDefinition {
    from: number;
    to: number;
    content: InlineNodes;
    image: DefinitionImageAttr | null;
}

export default function DefinitionPopoverHost({
    editor,
    activityId,
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
            setActive((prev) => {
                // Same target range → keep the popover and its draft intact.
                if (prev && prev.from === range.from && prev.to === range.to) {
                    return prev;
                }
                const attrs = editor.getAttributes('definition');
                const content = (attrs.content as InlineNodes) ?? [];
                const image = (attrs.image as DefinitionImageAttr | null) ?? null;
                return { from: range.from, to: range.to, content, image };
            });
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
        (content: InlineNodes, image: DefinitionImageAttr | null) => {
            if (!editor) return;
            editor.commands.updateDefinition({ content, image });
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
            initialContent={active.content}
            initialImage={active.image}
            activityId={activityId}
            onChange={handleChange}
            onRemove={handleRemove}
            onClose={handleClose}
        />
    );
}

import { useEffect, useState, useCallback } from 'react';
import type { Editor } from '@tiptap/react';
import { getMarkRange } from '@tiptap/core';
import type { DefinitionBlock } from '@activity/schema';
import DefinitionEditPopover from './DefinitionEditPopover';
import DefinitionEditDialog from './DefinitionEditDialog';

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
// popover's in-progress draft. Editing content changes only the mark's attrs,
// never the document text, so [from, to) is stable for the session.
//
// Two surfaces (design doc D5): the anchored popover for a simple definition,
// and DefinitionEditDialog for a rich one. This host owns the choice — the
// popover decides internally whether to render editable or read-only
// (definitionShape.ts), and asks to be replaced by the dialog via onExpand.
// While the dialog is open the popover is unmounted, so only one surface can
// ever hold a draft.
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
    content: DefinitionBlock[];
    // The defined word itself — the dialog's title, so an author editing a rich
    // definition in an unanchored modal still knows which term it belongs to.
    term: string;
}

export default function DefinitionPopoverHost({
    editor,
    activityId,
}: DefinitionPopoverHostProps) {
    const [active, setActive] = useState<ActiveDefinition | null>(null);
    const [referenceElement, setReferenceElement] =
        useState<HTMLElement | null>(null);
    // Which surface is showing. Reset whenever the target range changes, so
    // moving to another term never reopens the dialog on the new one.
    const [expanded, setExpanded] = useState(false);

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
                const content = (attrs.content as DefinitionBlock[]) ?? [];
                const term = editor.state.doc.textBetween(range.from, range.to);
                setExpanded(false);
                return { from: range.from, to: range.to, content, term };
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
        (content: DefinitionBlock[]) => {
            if (!editor) return;
            editor.commands.updateDefinition({ content });
            // Keep the host's copy in step so a follow-on Expand opens the
            // dialog on what was just committed, not the stale snapshot.
            setActive((prev) => (prev ? { ...prev, content } : prev));
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

    // Only ONE surface is mounted at a time: the dialog replaces the popover
    // rather than layering over it, so there is never a second live draft.
    if (expanded) {
        return (
            <DefinitionEditDialog
                key={`dialog-${active.from}`}
                term={active.term}
                initialContent={active.content}
                activityId={activityId}
                onSave={(content) => {
                    handleChange(content);
                    setExpanded(false);
                    handleClose();
                }}
                onCancel={() => {
                    setExpanded(false);
                    handleClose();
                }}
            />
        );
    }

    return (
        <DefinitionEditPopover
            key={active.from}
            referenceElement={referenceElement}
            initialContent={active.content}
            activityId={activityId}
            onChange={handleChange}
            onRemove={handleRemove}
            onClose={handleClose}
            onExpand={() => setExpanded(true)}
        />
    );
}

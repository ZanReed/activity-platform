import { useEffect, useState, useCallback } from 'react';
import type { Editor } from '@tiptap/react';
import { NodeSelection } from '@tiptap/pm/state';
import ImageEditPopover from './ImageEditPopover';

// ============================================================================
// ImagePopoverHost — root-level popover orchestrator for image blocks.
// ----------------------------------------------------------------------------
// Single instance at editor root (sibling of EditorContent), mirroring
// BlankPopoverHost. Watches the editor selection and shows ImageEditPopover
// when an image node is currently node-selected. One popover lifecycle — never
// per-node mounting (see BlankPopoverHost for the reconciliation history).
// ============================================================================

interface ImagePopoverHostProps {
    editor: Editor | null;
    // Forwarded to the popover's Upload tab so it can POST to upload-image.
    // Undefined in the playground.
    activityId?: string;
}

interface SelectedImageState {
    pos: number;
    imageId: string;
    src: string;
    alt: string;
    caption: string;
    // Sizing (null = full width / centered / auto height, the schema defaults).
    width: number | null;
    align: 'left' | 'right' | null;
    height: number | null;
}

interface ChangeOptions {
    preserveSelection?: boolean;
}

type ImageAttrPatch = Partial<{
    src: string;
    alt: string;
    caption: string;
    width: number | null;
    align: 'left' | 'right' | null;
    height: number | null;
}>;

export default function ImagePopoverHost({
    editor,
    activityId,
}: ImagePopoverHostProps) {
    const [selectedImage, setSelectedImage] =
        useState<SelectedImageState | null>(null);
    const [referenceElement, setReferenceElement] =
        useState<HTMLElement | null>(null);

    const resolveCardElement = useCallback((imageId: string) => {
        if (!imageId) return null;
        const escaped =
            typeof CSS !== 'undefined' && CSS.escape
                ? CSS.escape(imageId)
                : imageId;
        // Match by attribute only — the image NodeView renders either a
        // placeholder card (.image-card, empty/broken) or a live preview
        // (.image-preview). Both carry data-image-id, so the popover anchors
        // correctly in every state.
        return document.querySelector<HTMLElement>(
            `[data-image-id="${escaped}"]`,
        );
    }, []);

    useEffect(() => {
        if (!editor) return;

        const updateFromSelection = () => {
            const { selection } = editor.state;

            if (!(selection instanceof NodeSelection)) {
                setSelectedImage((prev) => (prev === null ? prev : null));
                return;
            }

            const node = selection.node;
            if (node.type.name !== 'image') {
                setSelectedImage((prev) => (prev === null ? prev : null));
                return;
            }

            const pos = selection.from;
            const imageId = (node.attrs.id as string) ?? '';
            const src = (node.attrs.src as string) ?? '';
            const alt = (node.attrs.alt as string) ?? '';
            const caption = (node.attrs.caption as string) ?? '';
            const width =
                typeof node.attrs.width === 'number' && node.attrs.width > 0
                    ? (node.attrs.width as number)
                    : null;
            const align =
                node.attrs.align === 'left' || node.attrs.align === 'right'
                    ? (node.attrs.align as 'left' | 'right')
                    : null;
            const height =
                typeof node.attrs.height === 'number' && node.attrs.height > 0
                    ? (node.attrs.height as number)
                    : null;

            setSelectedImage((prev) => {
                if (
                    prev &&
                    prev.pos === pos &&
                    prev.imageId === imageId &&
                    prev.src === src &&
                    prev.alt === alt &&
                    prev.caption === caption &&
                    prev.width === width &&
                    prev.align === align &&
                    prev.height === height
                ) {
                    return prev;
                }
                return { pos, imageId, src, alt, caption, width, align, height };
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
        if (!selectedImage) {
            setReferenceElement(null);
            return;
        }
        const raf = requestAnimationFrame(() => {
            setReferenceElement(resolveCardElement(selectedImage.imageId));
        });
        return () => cancelAnimationFrame(raf);
    }, [selectedImage, resolveCardElement]);

    const handleChange = useCallback(
        (attrs: ImageAttrPatch, options?: ChangeOptions) => {
            if (!editor || !selectedImage) return;
            editor.commands.updateImageAttrs(selectedImage.pos, attrs, options);
        },
        [editor, selectedImage],
    );

    const handleClose = useCallback(() => {
        if (!editor || !selectedImage) return;
        // Move the cursor just past the image so the NodeSelection releases and
        // the popover closes. The image is a leaf (nodeSize 1), so pos + 1 is
        // the position immediately after it.
        editor.commands.setTextSelection(selectedImage.pos + 1);
    }, [editor, selectedImage]);

    const handleDelete = useCallback(() => {
        if (!editor || !selectedImage) return;
        // Removing the node clears the NodeSelection, so the selection watcher
        // above unmounts the popover on its own — no explicit onClose needed.
        editor.commands.deleteImage(selectedImage.pos);
    }, [editor, selectedImage]);

    if (!editor || !selectedImage) return null;
    // Wait for the anchor card to resolve (one rAF after selection) before
    // mounting — a popover mounted with a null reference floats at the body's
    // top-left, and focusing it scrolled the page to the top.
    if (!referenceElement) return null;

    return (
        <ImageEditPopover
            referenceElement={referenceElement}
            isOpen={true}
            imageId={selectedImage.imageId}
            initialSrc={selectedImage.src}
            initialAlt={selectedImage.alt}
            initialCaption={selectedImage.caption}
            width={selectedImage.width}
            align={selectedImage.align}
            height={selectedImage.height}
            activityId={activityId}
            onChange={handleChange}
            onClose={handleClose}
            onDelete={handleDelete}
        />
    );
}

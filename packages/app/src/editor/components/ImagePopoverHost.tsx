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
}

interface SelectedImageState {
    pos: number;
    imageId: string;
    src: string;
    alt: string;
    caption: string;
}

interface ChangeOptions {
    preserveSelection?: boolean;
}

export default function ImagePopoverHost({ editor }: ImagePopoverHostProps) {
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
        return document.querySelector<HTMLElement>(
            `.image-card[data-image-id="${escaped}"]`,
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

            setSelectedImage((prev) => {
                if (
                    prev &&
                    prev.pos === pos &&
                    prev.imageId === imageId &&
                    prev.src === src &&
                    prev.alt === alt &&
                    prev.caption === caption
                ) {
                    return prev;
                }
                return { pos, imageId, src, alt, caption };
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
        (
            attrs: Partial<{ src: string; alt: string; caption: string }>,
            options?: ChangeOptions,
        ) => {
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

    if (!editor || !selectedImage) return null;

    return (
        <ImageEditPopover
            referenceElement={referenceElement}
            isOpen={true}
            imageId={selectedImage.imageId}
            initialSrc={selectedImage.src}
            initialAlt={selectedImage.alt}
            initialCaption={selectedImage.caption}
            onChange={handleChange}
            onClose={handleClose}
        />
    );
}

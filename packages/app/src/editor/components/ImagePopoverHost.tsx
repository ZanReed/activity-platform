import { useEffect, useState, useCallback, useRef } from 'react';
import type { Editor } from '@tiptap/react';
import { NodeSelection } from '@tiptap/pm/state';
import ImageEditPopover from './ImageEditPopover';
import { OPEN_IMAGE_POPOVER } from '../extensions/Image';

// ============================================================================
// ImagePopoverHost — root-level popover orchestrator for image blocks.
// ----------------------------------------------------------------------------
// Single instance at editor root (sibling of EditorContent), mirroring
// BlankPopoverHost. One popover lifecycle — never per-node mounting (see
// BlankPopoverHost for the reconciliation history).
//
// Slice-6 stage 3: the popover no longer AUTO-opens on selection (that would
// double up with the block command bar, which now fires on the same image
// NodeSelection). Instead the bar's Replace primary dispatches an
// OPEN_IMAGE_POPOVER transaction meta; this host reads it and opens on the URL
// field. Selecting an image just shows the command bar; the popover (source
// only — alt/caption/crop live elsewhere) is a deliberate second step.
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
    // Sizing (null = full width / centered, the schema defaults). Width gates
    // whether the popover's alignment chips apply.
    width: number | null;
    align: 'left' | 'right' | null;
}

interface ChangeOptions {
    preserveSelection?: boolean;
}

// The slimmed popover only edits the source + alignment; alt/caption moved to
// the Advanced drawer, width is a drag-handle.
type ImageAttrPatch = Partial<{
    src: string;
    align: 'left' | 'right' | null;
}>;

export default function ImagePopoverHost({
    editor,
    activityId,
}: ImagePopoverHostProps) {
    const [selectedImage, setSelectedImage] =
        useState<SelectedImageState | null>(null);
    const [referenceElement, setReferenceElement] =
        useState<HTMLElement | null>(null);
    // The popover opens only when the command bar's Replace requests it (not on
    // plain selection). It always focuses the URL field.
    const [requestedOpen, setRequestedOpen] = useState(false);
    // Identity of the last image the selection watcher saw. When it changes we
    // dismiss any bar-requested popover — but this reset is done INLINE in the
    // watcher (not a post-render effect) so that a transaction which both
    // selects an image AND carries the open-meta (an insert) can set
    // requestedOpen true afterward without the reset clobbering it.
    const lastIdentityRef = useRef<string | null>(null);

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

            // Dismiss a bar-requested popover when the selection moves to a
            // different image (or off images). Inline (not a post-render effect)
            // so an insert's open-meta can re-set requestedOpen afterward.
            const applyIdentity = (identity: string | null) => {
                if (identity !== lastIdentityRef.current) {
                    lastIdentityRef.current = identity;
                    setRequestedOpen(false);
                }
            };

            if (!(selection instanceof NodeSelection)) {
                applyIdentity(null);
                setSelectedImage((prev) => (prev === null ? prev : null));
                return;
            }

            const node = selection.node;
            if (node.type.name !== 'image') {
                applyIdentity(null);
                setSelectedImage((prev) => (prev === null ? prev : null));
                return;
            }

            const pos = selection.from;
            const imageId = (node.attrs.id as string) ?? '';
            const src = (node.attrs.src as string) ?? '';
            const width =
                typeof node.attrs.width === 'number' && node.attrs.width > 0
                    ? (node.attrs.width as number)
                    : null;
            const align =
                node.attrs.align === 'left' || node.attrs.align === 'right'
                    ? (node.attrs.align as 'left' | 'right')
                    : null;

            applyIdentity(`${pos}:${imageId}`);

            setSelectedImage((prev) => {
                if (
                    prev &&
                    prev.pos === pos &&
                    prev.imageId === imageId &&
                    prev.src === src &&
                    prev.width === width &&
                    prev.align === align
                ) {
                    return prev;
                }
                return { pos, imageId, src, width, align };
            });
        };

        // The command bar's Replace/Caption primaries dispatch this meta to
        // open the popover on demand (focused on the named field).
        const onTransaction = ({
            transaction,
        }: {
            transaction: { getMeta: (key: string) => unknown };
        }) => {
            updateFromSelection();
            if (transaction.getMeta(OPEN_IMAGE_POPOVER)) {
                setRequestedOpen(true);
            }
        };

        editor.on('selectionUpdate', updateFromSelection);
        editor.on('transaction', onTransaction);
        updateFromSelection();

        return () => {
            editor.off('selectionUpdate', updateFromSelection);
            editor.off('transaction', onTransaction);
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

    // Only mount when the command bar has requested it (not on plain selection).
    if (!editor || !selectedImage || !requestedOpen) return null;
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
            width={selectedImage.width}
            align={selectedImage.align}
            activityId={activityId}
            onChange={handleChange}
            onClose={handleClose}
            onDelete={handleDelete}
        />
    );
}

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { widthAttrLabel } from '../imageSizing';
import { useBlockWidthResize } from '../hooks/useBlockWidthResize';
import { canEnterCrop, type Rect } from '../cropGeometry';
import { useCropRequest } from '../components/cropMode';
import ImageCropEditor from '../components/ImageCropEditor';

// ============================================================================
// ImageView — NodeView for the image block.
// ----------------------------------------------------------------------------
// Three visual states, all anchoring the edit popover via data-image-id:
//   1. Empty (no src)   → dashed placeholder card ("Add image").
//   2. Broken (load err) → solid card noting the URL couldn't load.
//   3. Has src + loads   → live preview (the actual <img>), with a hover "Edit"
//                          affordance. Height-capped so a huge image doesn't
//                          blow out the editing canvas — unless the author has
//                          sized it, in which case the authored width wins.
// Clicking any state sets a NodeSelection, which ImagePopoverHost watches to
// open the edit popover. The published/print output still comes from the
// renderer's renderImage — this NodeView is editor-only.
//
// Sizing (variable block sizing Drop 3): the wrapper previews the schema's
// width/align exactly as the published page renders them (width % of the
// container, auto-margins for alignment). When selected, side drag-handles
// resize: live local preview during the drag (no transactions), one
// updateImageAttrs commit on release (single undo step), Escape cancels,
// snapping to the same stops as the popover's width chips (Alt = fine).
// The gesture is fully owned by this NodeView — no decoration plugins, no
// shared screen regions with other affordances.
// ============================================================================

// Derive a human-readable filename from a URL or path. Falls back to '' when
// there's nothing usable (empty src, or a URL ending in '/').
function fileNameFromSrc(src: string): string {
    if (!src) return '';
    try {
        const url = new URL(src, 'https://x');
        const last = url.pathname.split('/').filter(Boolean).pop();
        return last ? decodeURIComponent(last) : '';
    } catch {
        const last = src.split('/').filter(Boolean).pop();
        return last ?? '';
    }
}

type Align = 'left' | 'right' | null; // null = center (the schema default)

export default function ImageView({
    node,
    selected,
    editor,
    getPos,
}: NodeViewProps) {
    const src = (node.attrs.src as string) ?? '';
    const alt = (node.attrs.alt as string) ?? '';
    const caption = (node.attrs.caption as string) ?? '';
    const id = (node.attrs.id as string) ?? '';
    const width =
        typeof node.attrs.width === 'number' && node.attrs.width > 0
            ? (node.attrs.width as number)
            : null;
    const align: Align =
        node.attrs.align === 'left' || node.attrs.align === 'right'
            ? node.attrs.align
            : null;

    const crop = (node.attrs.crop as Rect | null) ?? null;

    const hasSrc = src.length > 0;
    const fileName = fileNameFromSrc(src);

    // Track image load failures so we can fall back to an informative card
    // instead of a browser's broken-image glyph. Reset whenever src changes.
    const [loadError, setLoadError] = useState(false);

    // Crop mode (image-crop.md): the "Crop" command-bar primary bumps this
    // image's request nonce; on a bump we enter crop mode IF the source has
    // loaded with a real intrinsic size (CR-INV1 disabled-until-load, CR-M8
    // no 0×0 source). The natural size feeds both the entry guard and the
    // srcAspect the crop editor commits.
    const [cropMode, setCropMode] = useState(false);
    const previewImgRef = useRef<HTMLImageElement | null>(null);
    const naturalRef = useRef<{ w: number; h: number } | null>(null);
    const cropRequest = useCropRequest(id);
    const lastRequestRef = useRef(cropRequest);

    // Swapping the source clears the stored crop (CR-INV2, enforced in the
    // updateImageAttrs command) and invalidates the captured natural size, so
    // leave crop mode and reset load/broken state.
    useEffect(() => {
        setLoadError(false);
        setCropMode(false);
        naturalRef.current = null;
    }, [src]);

    useEffect(() => {
        if (cropRequest === lastRequestRef.current) return;
        lastRequestRef.current = cropRequest;
        // Refresh from the live <img> in case its load fired before this effect
        // (cached sources complete synchronously).
        const img = previewImgRef.current;
        if (img && img.complete && img.naturalWidth > 0) {
            naturalRef.current = { w: img.naturalWidth, h: img.naturalHeight };
        }
        if (canEnterCrop(naturalRef.current)) setCropMode(true);
    }, [cropRequest]);

    // Transient drag state (null = not dragging). Document attrs only change on
    // release. Width rides the shared useBlockWidthResize hook (D1). (Fixed
    // height was removed — framing is now the crop feature, image-crop.md.)
    const wrapperRef = useRef<HTMLElement | null>(null);

    const { dragWidth, startResize } = useBlockWidthResize({
        wrapperRef,
        align,
        onCommit: (nextWidth) => {
            const pos = getPos();
            if (typeof pos !== 'number') return;
            editor.commands.updateImageAttrs(
                pos,
                { width: nextWidth },
                { preserveSelection: true },
            );
        },
    });

    // Remove the whole image block. Stop the gesture from reaching ProseMirror
    // so the click deletes instead of selecting the node (which would open the
    // popover). Works in every state — card or live preview, selected or not.
    const handleDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        const pos = getPos();
        if (typeof pos !== 'number') return;
        editor.commands.deleteImage(pos);
    };

    // The delete button lives inside the draggable NodeViewWrapper; swallow its
    // pointer/mouse-down so PM neither selects the node nor starts a block drag.
    const swallowPointer = (
        event: React.PointerEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement>,
    ) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const deleteButton = (className: string) => (
        <button
            type="button"
            className={className}
            aria-label="Delete image"
            title="Delete image"
            draggable={false}
            onPointerDown={swallowPointer}
            onMouseDown={swallowPointer}
            onClick={handleDelete}
        >
            <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
            </svg>
        </button>
    );

    // --- Empty / broken states: the compact card. ---------------------------
    if (!hasSrc || loadError) {
        const title = !hasSrc
            ? 'Add image'
            : alt || fileName || 'Image';
        const subtitle = !hasSrc
            ? 'Click to set a URL or upload'
            : loadError
              ? "Couldn't load — click to edit the URL"
              : fileName || src;

        return (
            <NodeViewWrapper
                className={`image-card${selected ? ' is-selected' : ''}${
                    hasSrc ? '' : ' is-empty'
                }${loadError ? ' is-broken' : ''}`}
                data-image-id={id}
                data-drag-handle
            >
                <span className="image-card__icon" aria-hidden="true">
                    <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                    </svg>
                </span>
                <span className="image-card__meta">
                    <span className="image-card__title">{title}</span>
                    <span className="image-card__path">{subtitle}</span>
                </span>
                <span className="image-card__edit" aria-hidden="true">
                    Edit
                </span>
                {deleteButton('image-card__delete')}
            </NodeViewWrapper>
        );
    }

    // --- Crop mode: the full-source reframe gesture (image-crop.md). --------
    // Replaces the preview while active; Apply commits crop{x,y,w,h}+srcAspect
    // (or clears both when reframed to the full source), Cancel discards.
    if (cropMode) {
        return (
            <NodeViewWrapper
                className="image-preview is-cropping"
                data-image-id={id}
                contentEditable={false}
            >
                <ImageCropEditor
                    src={src}
                    alt={alt}
                    initialCrop={crop}
                    onApply={(nextCrop, srcAspect) => {
                        const pos = getPos();
                        if (typeof pos === 'number') {
                            editor.commands.updateImageAttrs(
                                pos,
                                nextCrop
                                    ? { crop: nextCrop, srcAspect }
                                    : { crop: null, srcAspect: null },
                                { preserveSelection: true },
                            );
                        }
                        setCropMode(false);
                    }}
                    onCancel={() => setCropMode(false)}
                />
            </NodeViewWrapper>
        );
    }

    // --- Has-src state: live preview with a hover Edit affordance. -----------
    // Mirrors the published CSS: a sized image's wrapper takes the authored
    // width with auto-margin centering; left/right zero one side. During a drag
    // the transient width overrides the stored one.
    const effectiveWidth = dragWidth ?? width;
    const sizingStyle: CSSProperties =
        effectiveWidth !== null
            ? {
                  width: `${effectiveWidth * 100}%`,
                  marginLeft: align === 'left' ? 0 : 'auto',
                  marginRight: align === 'right' ? 0 : 'auto',
              }
            : {};
    const isResizing = dragWidth !== null;

    // Crop preview: the editor must show the SAME window the published renderer
    // does (CR-S3 parity), so mirror renderImage's math — a fixed-aspect window
    // (aspect-ratio = srcAspect·w/h) with the <img> scaled/offset absolutely so
    // the crop rectangle fills it. Only when both crop + a positive srcAspect
    // are present and the rect is non-degenerate (the renderer's CR-M8 guard).
    const srcAspect =
        typeof node.attrs.srcAspect === 'number'
            ? (node.attrs.srcAspect as number)
            : null;
    const cropPreview =
        crop && srcAspect && srcAspect > 0 && crop.w > 0 && crop.h > 0
            ? {
                  window: {
                      aspectRatio: `${srcAspect * (crop.w / crop.h)}`,
                  } as CSSProperties,
                  img: {
                      position: 'absolute',
                      width: `${100 / crop.w}%`,
                      height: `${100 / crop.h}%`,
                      left: `${-(crop.x / crop.w) * 100}%`,
                      top: `${-(crop.y / crop.h) * 100}%`,
                      maxWidth: 'none',
                      maxHeight: 'none',
                  } as CSSProperties,
              }
            : null;

    const previewImg = (
        <img
            ref={previewImgRef}
            className={`image-preview__img${
                cropPreview ? ' image-preview__img--cropped' : ''
            }`}
            src={src}
            alt={alt}
            style={cropPreview ? cropPreview.img : undefined}
            draggable={false}
            onLoad={(e) => {
                const img = e.currentTarget;
                naturalRef.current = {
                    w: img.naturalWidth,
                    h: img.naturalHeight,
                };
            }}
            onError={() => setLoadError(true)}
        />
    );

    return (
        <NodeViewWrapper
            ref={wrapperRef}
            className={`image-preview${selected ? ' is-selected' : ''}${
                effectiveWidth !== null ? ' is-sized' : ''
            }${isResizing ? ' is-resizing' : ''}${
                cropPreview ? ' is-cropped' : ''
            }`}
            style={sizingStyle}
            data-image-id={id}
            data-drag-handle
        >
            {cropPreview ? (
                <span className="image-preview__crop" style={cropPreview.window}>
                    {previewImg}
                </span>
            ) : (
                previewImg
            )}
            {caption ? (
                <span className="image-preview__caption">{caption}</span>
            ) : null}
            <span className="image-preview__edit" aria-hidden="true">
                Edit
            </span>
            {deleteButton('image-delete-button')}
            {selected ? (
                <>
                    <span
                        className="image-resize-handle image-resize-handle--left"
                        role="presentation"
                        draggable={false}
                        onPointerDown={startResize('left')}
                    />
                    <span
                        className="image-resize-handle image-resize-handle--right"
                        role="presentation"
                        draggable={false}
                        onPointerDown={startResize('right')}
                    />
                </>
            ) : null}
            {isResizing ? (
                <span className="image-resize-badge" aria-hidden="true">
                    {widthAttrLabel(dragWidth)}
                </span>
            ) : null}
        </NodeViewWrapper>
    );
}

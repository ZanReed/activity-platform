import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import {
    snapWidthFraction,
    widthAttrLabel,
    widthFractionToAttr,
} from '../imageSizing';

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

// The width a sizing fraction resolves against: the containing block's CONTENT
// width (CSS percentage semantics), i.e. the parent minus its padding.
function containerContentWidth(wrapper: HTMLElement): number {
    const parent = wrapper.parentElement;
    if (!parent) return 0;
    const cs = getComputedStyle(parent);
    return (
        parent.clientWidth -
        parseFloat(cs.paddingLeft || '0') -
        parseFloat(cs.paddingRight || '0')
    );
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

    const hasSrc = src.length > 0;
    const fileName = fileNameFromSrc(src);

    // Track image load failures so we can fall back to an informative card
    // instead of a browser's broken-image glyph. Reset whenever src changes.
    const [loadError, setLoadError] = useState(false);
    useEffect(() => {
        setLoadError(false);
    }, [src]);

    // Transient drag state: the fraction being previewed (null = not
    // dragging). Document attrs only change on release.
    const [dragWidth, setDragWidth] = useState<number | null>(null);
    const wrapperRef = useRef<HTMLElement | null>(null);

    const startResize = (side: 'left' | 'right') => (
        event: React.PointerEvent<HTMLSpanElement>,
    ) => {
        if (event.button !== 0) return;
        // Own the gesture: no block drag (the wrapper is data-drag-handle), no
        // text selection, no PM mousedown handling.
        event.preventDefault();
        event.stopPropagation();

        const wrapper = wrapperRef.current;
        if (!wrapper) return;
        const containerPx = containerContentWidth(wrapper);
        if (containerPx <= 0) return;

        const startX = event.clientX;
        const startPx = wrapper.getBoundingClientRect().width;
        // Outward pointer travel grows the image. A centered image grows on
        // both sides at once, so a pixel of travel is two pixels of width.
        const outwardSign = side === 'right' ? 1 : -1;
        const growthFactor = align === null ? 2 : 1;
        const handle = event.currentTarget;

        try {
            handle.setPointerCapture(event.pointerId);
        } catch {
            /* synthetic events may have no active pointer to capture */
        }

        let latest = snapWidthFraction(startPx / containerPx, true);
        setDragWidth(latest);

        const onMove = (ev: PointerEvent) => {
            const outwardPx = (ev.clientX - startX) * outwardSign;
            const rawFraction =
                (startPx + outwardPx * growthFactor) / containerPx;
            latest = snapWidthFraction(rawFraction, !ev.altKey);
            setDragWidth(latest);
        };

        const cleanup = () => {
            handle.removeEventListener('pointermove', onMove);
            handle.removeEventListener('pointerup', onUp);
            handle.removeEventListener('pointercancel', onCancel);
            window.removeEventListener('keydown', onKeyDown, true);
            try {
                if (handle.hasPointerCapture(event.pointerId)) {
                    handle.releasePointerCapture(event.pointerId);
                }
            } catch {
                /* mirror of the capture guard */
            }
            setDragWidth(null);
        };

        const onUp = () => {
            cleanup();
            const pos = getPos();
            if (typeof pos !== 'number') return;
            editor.commands.updateImageAttrs(
                pos,
                { width: widthFractionToAttr(latest) },
                { preserveSelection: true },
            );
        };

        const onCancel = () => cleanup();

        const onKeyDown = (ev: KeyboardEvent) => {
            if (ev.key === 'Escape') {
                ev.preventDefault();
                ev.stopPropagation();
                onCancel();
            }
        };

        handle.addEventListener('pointermove', onMove);
        handle.addEventListener('pointerup', onUp);
        handle.addEventListener('pointercancel', onCancel);
        window.addEventListener('keydown', onKeyDown, true);
    };

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
            </NodeViewWrapper>
        );
    }

    // --- Has-src state: live preview with a hover Edit affordance. -----------
    // Mirrors the published CSS: a sized image's wrapper takes the authored
    // width with auto-margin centering; left/right zero one side. During a
    // drag the transient fraction overrides the stored one.
    const effectiveWidth = dragWidth ?? width;
    const sizingStyle: CSSProperties =
        effectiveWidth !== null
            ? {
                  width: `${effectiveWidth * 100}%`,
                  marginLeft: align === 'left' ? 0 : 'auto',
                  marginRight: align === 'right' ? 0 : 'auto',
              }
            : {};

    return (
        <NodeViewWrapper
            ref={wrapperRef}
            className={`image-preview${selected ? ' is-selected' : ''}${
                effectiveWidth !== null ? ' is-sized' : ''
            }${dragWidth !== null ? ' is-resizing' : ''}`}
            style={sizingStyle}
            data-image-id={id}
            data-drag-handle
        >
            <img
                className="image-preview__img"
                src={src}
                alt={alt}
                draggable={false}
                onError={() => setLoadError(true)}
            />
            {caption ? (
                <span className="image-preview__caption">{caption}</span>
            ) : null}
            <span className="image-preview__edit" aria-hidden="true">
                Edit
            </span>
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
            {dragWidth !== null ? (
                <span className="image-resize-badge" aria-hidden="true">
                    {widthAttrLabel(dragWidth)}
                </span>
            ) : null}
        </NodeViewWrapper>
    );
}

import { useEffect, useState } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';

// ============================================================================
// ImageView — NodeView for the image block.
// ----------------------------------------------------------------------------
// Three visual states, all anchoring the edit popover via data-image-id:
//   1. Empty (no src)   → dashed placeholder card ("Add image").
//   2. Broken (load err) → solid card noting the URL couldn't load.
//   3. Has src + loads   → live preview (the actual <img>), with a hover "Edit"
//                          affordance. Height-capped so a huge image doesn't
//                          blow out the editing canvas.
// Clicking any state sets a NodeSelection, which ImagePopoverHost watches to
// open the edit popover. The published/print output still comes from the
// renderer's renderImage — this NodeView is editor-only.
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

export default function ImageView({ node, selected }: NodeViewProps) {
    const src = (node.attrs.src as string) ?? '';
    const alt = (node.attrs.alt as string) ?? '';
    const caption = (node.attrs.caption as string) ?? '';
    const id = (node.attrs.id as string) ?? '';

    const hasSrc = src.length > 0;
    const fileName = fileNameFromSrc(src);

    // Track image load failures so we can fall back to an informative card
    // instead of a browser's broken-image glyph. Reset whenever src changes.
    const [loadError, setLoadError] = useState(false);
    useEffect(() => {
        setLoadError(false);
    }, [src]);

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
    return (
        <NodeViewWrapper
            className={`image-preview${selected ? ' is-selected' : ''}`}
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
        </NodeViewWrapper>
    );
}

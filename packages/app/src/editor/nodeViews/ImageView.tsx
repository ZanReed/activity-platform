import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';

// ============================================================================
// ImageView — NodeView for the image block (Option B: compact placeholder card).
// ----------------------------------------------------------------------------
// The editor shows a light card (icon + alt/filename + Edit affordance) rather
// than the actual picture. This keeps the editing canvas compact regardless of
// image size; the real <figure><img> only appears in the published/print
// output (renderer's renderImage). Clicking the card sets a NodeSelection,
// which ImagePopoverHost watches to open the edit popover.
//
// Pure display of attrs — no React state, no effects (mirrors BlankView). The
// data-image-id hook lets the host resolve this element as the popover anchor.
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
    const id = (node.attrs.id as string) ?? '';

    const hasSrc = src.length > 0;
    const fileName = fileNameFromSrc(src);

    const title = hasSrc ? alt || fileName || 'Image' : 'Add image';
    const subtitle = hasSrc
        ? fileName || src
        : 'Click to set a URL or upload';

    return (
        <NodeViewWrapper
            className={`image-card${selected ? ' is-selected' : ''}${
                hasSrc ? '' : ' is-empty'
            }`}
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

import type { CSSProperties } from 'react';

// ============================================================================
// figureSizingStyle — editor preview of a figure block's authored width/align.
// ----------------------------------------------------------------------------
// The graph/data-plot/number-line blocks are sized from the drawer (D5/D6), but
// the author needs to SEE the change. Applied to each view's FIGURE/board region
// (never the authoring controls — those stay full-width), it previews the
// published proportion: width as a fraction of the block, centered by default,
// left/right when aligned. Null width → {} (full width, today's look). The live
// kit boards re-fit via JSXGraph's built-in resize (D3); the static data-plot
// SVG scales via its viewBox.
// ============================================================================

export function figureSizingStyle(
    width: number | null,
    align: 'left' | 'right' | null,
): CSSProperties {
    if (width === null || !(width > 0) || width > 1) return {};
    // maxWidth: 'none' lifts each board host's default cap (e.g. 22rem) so the
    // authored fraction alone drives the width — a faithful proportion preview.
    return {
        width: `${width * 100}%`,
        maxWidth: 'none',
        marginLeft: align === 'left' ? 0 : 'auto',
        marginRight: align === 'right' ? 0 : 'auto',
    };
}

/** Read a node's sizing attrs into the {width, align} the style helper takes. */
export function readSizingAttrs(attrs: Record<string, unknown>): {
    width: number | null;
    align: 'left' | 'right' | null;
} {
    const rawWidth = attrs.width;
    const width =
        typeof rawWidth === 'number' && rawWidth > 0 && rawWidth <= 1
            ? rawWidth
            : null;
    const align =
        attrs.align === 'left' || attrs.align === 'right' ? attrs.align : null;
    return { width, align };
}

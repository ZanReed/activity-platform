// =============================================================================
// imageSizing.ts — pure math for the image width controls (variable block
// sizing Drop 3; see docs/design/variable-block-sizing.md).
// -----------------------------------------------------------------------------
// Shared by the popover's width chips and the preview's side drag-handles so
// both UIs write identical values. Width is the schema's fraction of the
// container's content width in (0, 1]; full width is stored as null (absent),
// matching Drop 1's omit-when-default rule.
// =============================================================================

// The clean stops both UIs offer. Stored pre-rounded (0.33 not 1/3) so a chip
// press and a snapped drag produce byte-identical attrs. NOTE: 1 is a REAL
// stored width ("fill the container", upscaling if needed) — distinct from
// the null default ("Auto": natural size, never upscaled). The popover offers
// Auto separately; a drag always commits an explicit width.
export const WIDTH_SNAP_STOPS = [0.25, 0.33, 0.5, 0.66, 0.75, 1] as const;

// Below this the image is a sliver the author can't grab again.
export const MIN_WIDTH_FRACTION = 0.15;

// How close (in fraction units) a drag must be to a stop to snap onto it.
export const WIDTH_SNAP_TOLERANCE = 0.03;

/**
 * Raw width fraction from a drag, BEFORE snapping/clamping. Pure so the
 * growth-factor branch is unit-testable without a live pointer (SZ-J2a).
 *
 * `outwardPx` is pointer travel in the grow direction (already signed by the
 * side). `growthFactor` is 2 for a CENTERED block — it grows on both sides at
 * once, so a pixel of travel is two pixels of width — and 1 for a left/right-
 * aligned block that grows on one side only. A non-positive container width
 * has no meaningful fraction, so it falls back to full (1).
 */
export function dragWidthFraction(
    startPx: number,
    outwardPx: number,
    growthFactor: number,
    containerPx: number,
): number {
    if (containerPx <= 0) return 1;
    return (startPx + outwardPx * growthFactor) / containerPx;
}

/** Clamp a raw drag fraction into bounds, snapping to clean stops. */
export function snapWidthFraction(fraction: number, snap: boolean): number {
    const clamped = Math.min(Math.max(fraction, MIN_WIDTH_FRACTION), 1);
    if (!snap) return Math.round(clamped * 100) / 100;
    for (const stop of WIDTH_SNAP_STOPS) {
        if (Math.abs(clamped - stop) <= WIDTH_SNAP_TOLERANCE) return stop;
    }
    return Math.round(clamped * 100) / 100;
}

/** Label for badges/chips: 0.33 → "33%", 1 → "100%". */
export function widthAttrLabel(width: number | null): string {
    return `${Math.round((width ?? 1) * 100)}%`;
}

// -----------------------------------------------------------------------------
// Height (rem). Stored like Column.minHeight so it scales with the print
// font-size config. Snapping is a step grid rather than named stops — heights
// have no natural "thirds".
// -----------------------------------------------------------------------------

export const MIN_HEIGHT_REM = 2;
export const MAX_HEIGHT_REM = 60;
export const HEIGHT_SNAP_STEP_REM = 0.5;

/** Clamp a raw drag height into bounds, snapping to half-rem steps. */
export function snapHeightRem(rem: number, snap: boolean): number {
    const clamped = Math.min(Math.max(rem, MIN_HEIGHT_REM), MAX_HEIGHT_REM);
    const step = snap ? HEIGHT_SNAP_STEP_REM : 0.1;
    // Second rounding strips float artifacts (73 * 0.1 = 7.300000000000001).
    return Math.round(Math.round(clamped / step) * step * 100) / 100;
}

/** Convert a pixel length to rem against the document's root font size. */
export function pxToRem(px: number, pxPerRem: number): number {
    return pxPerRem > 0 ? px / pxPerRem : px / 16;
}

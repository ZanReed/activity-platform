// ============================================================================
// DRAWABLE_PALETTE — the single source of truth for authored drawable colors.
// ----------------------------------------------------------------------------
// A drawable stores a palette KEY (a string), never a raw hex, so colors stay
// semantic. This map resolves key -> hex. It lives in graph-kit (the leaf
// package) so the three draw paths that need it — the live/author board
// (board.ts), the static/print SVG (@activity/renderer graph-svg), and the
// app's color picker — all import ONE definition, with zero new dependency
// edges (renderer + app already depend on graph-kit).
//
// The hexes are chosen to match the editor's --ed- primitive palette, but are
// stored as static hex here because published pages and the print SVG can't
// read the editor's CSS custom properties.
//
// `DRAWABLE_DEFAULT_COLOR` is what an UNCOLORED drawable resolves to on EVERY
// path — the shared default that stops a static-SVG default (near-black INK)
// disagreeing with the live board default (blue) and flashing on hydration.
// ============================================================================

export const DRAWABLE_PALETTE = {
    blue: '#2563eb',
    indigo: '#4f46e5',
    teal: '#0d9488',
    green: '#16a34a',
    amber: '#d97706',
    red: '#dc2626',
    violet: '#7c3aed',
    slate: '#475569',
} as const;

export type DrawableColorKey = keyof typeof DRAWABLE_PALETTE;

export const DRAWABLE_PALETTE_KEYS = Object.keys(
    DRAWABLE_PALETTE,
) as DrawableColorKey[];

// The fallback for a drawable with no `color`. Matches the historical board
// default (CURVE_COLOR) so colored and uncolored drawables render consistently
// across the live board and the static SVG.
export const DRAWABLE_DEFAULT_COLOR = DRAWABLE_PALETTE.blue;

/**
 * Resolve a stored color key to a hex. Unknown/absent keys fall back to the
 * shared default (defensive: a stale key from an older document never draws
 * nothing — it draws the default). Schema validation (z.enum) is the primary
 * guard; this is the render-time safety net.
 */
export function resolveDrawableColor(key?: string | null): string {
    if (key && key in DRAWABLE_PALETTE) {
        return DRAWABLE_PALETTE[key as DrawableColorKey];
    }
    return DRAWABLE_DEFAULT_COLOR;
}

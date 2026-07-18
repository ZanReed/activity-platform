// ============================================================================
// graph-colors.ts — the ONE source of truth for graph-kit's UI colors.
// ----------------------------------------------------------------------------
// graph-kit is a lazy-loaded, self-contained widget that reaches PUBLISHED
// student pages, so it can't read the editor/chrome CSS custom properties
// (--ed-* / --color-*) and must NOT adopt their names. This module consolidates
// the ~137 raw color literals that used to live scattered (and duplicated —
// ANSWER_COLOR was declared in 3 files, AXIS_COLOR in 2) across board.ts,
// data-plot-board.ts, number-line-board.ts, calculator.ts and the question
// mounters. (Design: docs/design/graph-kit-color.md.)
//
// THREE sections, deliberately separate:
//  1. Board render roles — JS hex strings drawn into JSXGraph / SVG / canvas.
//  2. Series palettes — N-color cycles for multi-series drawing.
//  3. GK_CHROME — the calculator + question DOM chrome palette. The calculator
//     interpolates these into a `.gk-cal { --gk-* }` CSS var block (dark-READY:
//     a later published-dark pass re-points the vars); the question mounters
//     interpolate them straight into inline styles (JS, not dark-ready — same
//     bucket as the board colors, per the ruled scope).
//
// SEPARATE from DRAWABLE_PALETTE (drawable-palette.ts): that is the CURATED
// authored-drawable palette. Some roles here share a hex with it by coincidence
// (CURVE == blue, ANSWER == violet, FIT == green) — they stay independently
// defined, because a render role and an authored drawable color are different
// semantic axes; a change to one must not ripple to the other.
//
// VALUE-IDENTITY: every value here equals the literal it replaces. This pass
// moves colors, it does not restyle them (a later dark pass changes values).
// ============================================================================

// ── 1. Board render roles (hex strings for JSXGraph / SVG / canvas) ──────────
export const CURVE = '#2563eb'; // primary function / curve stroke
export const SCATTER = '#0f172a'; // scatter points + point strokes (slate-900)
export const FIT = '#16a34a'; // regression fit line (green)
export const ANSWER = '#7c3aed'; // "your answer" purple (was ANSWER_COLOR ×3)
export const ANSWER_FILL = '#c4b5fd'; // light-purple answer fill / cursor (was FILL/CURSOR_COLOR)
export const AXIS = '#64748b'; // axis lines (was AXIS_COLOR ×2)
export const LABEL = '#475569'; // axis / tick labels (was LABEL_COLOR)
export const INK = '#1e293b'; // data-plot ink (slate-800; distinct from SCATTER)
export const GRID = '#e2e8f0'; // grid lines
export const CURSOR_BG = '#f1f5f9'; // data-plot cursor band fill
export const OPEN_FILL = '#ffffff'; // hollow/open-point fill + white point strokes
export const SHADE_FILL_OPACITY = 0.18; // inequality shade fill alpha

// ── 2. Series palettes (distinct N-color cycles; NOT DRAWABLE_PALETTE) ───────
// Boundary colors for a system of inequalities (board.ts).
export const SYSTEM_BOUNDARY_COLORS = [
    '#7c3aed',
    '#2563eb',
    '#059669',
    '#d97706',
    '#dc2626',
] as const;
// Per-row color cycle for the calculator's multi-expression list.
export const EXPRESSION_PALETTE = [
    '#2563eb',
    '#dc2626',
    '#16a34a',
    '#9333ea',
    '#d97706',
    '#0891b2',
] as const;

// ── 3. Chrome palette — calculator KIT_CSS + question inline styles ──────────
// Interpolated into the calculator's `.gk-cal { --gk-<role> }` block and into
// the question mounters' inline styles. Slate/blue/red/green tones, mirroring
// the editor's look but self-contained (published pages can't read editor CSS).
export const GK_CHROME = {
    bg: '#ffffff', // panel / field background
    inkStrong: '#0f172a', // result + expression text (slate-900)
    ink: '#1e293b', // panel text (slate-800)
    text2: '#334155', // board-nav / secondary controls (slate-700)
    textSecondary: '#475569', // labels (slate-600)
    muted: '#64748b', // hints, muted meta (slate-500)
    faint: '#94a3b8', // remove/×, inert glyphs (slate-400)
    border: '#cbd5e1', // field / control borders (slate-300)
    surface: '#f8fafc', // field fill (slate-50)
    surface2: '#f1f5f9', // keypad button fill (slate-100)
    hover: '#e2e8f0', // hover fill / dividers (slate-200)
    accent: '#2563eb', // interactive blue
    accentText: '#1d4ed8', // active keyboard text (blue-700)
    accentBorder: '#93c5fd', // active accent border (blue-300)
    accentBg: '#eff6ff', // accent tint (blue-50)
    accentBgActive: '#dbeafe', // active accent tint (blue-100)
    accentAlt: '#4338ca', // keyboard accent (indigo-700)
    accentAltBg: '#eef2ff', // keyboard accent tint (indigo-50)
    accentAltBg2: '#e0e7ff', // keyboard accent hover (indigo-100)
    error: '#b91c1c', // error text (red-700)
    errorBg: '#fef2f2', // error tint (red-50)
    success: '#15803d', // valid/success text (green-700)
    successAccent: '#16a34a', // success accent (green-600)
    successBg: '#f0fdf4', // success tint (green-50)
    overlayChip: 'rgba(255, 255, 255, 0.92)', // on-board readout chips
    overlayBar: 'rgba(255, 255, 255, 0.88)', // control strips over the board
    overlayPanel: 'rgba(255, 255, 255, 0.97)', // floating popover panel
    overlayFooter: 'rgba(255, 255, 255, 0.9)', // footer strip
    shadow: 'rgba(0, 0, 0, 0.22)', // panel drop shadow
    shadowSoft: 'rgba(0, 0, 0, 0.08)', // popover soft shadow
} as const;

export type GkChromeRole = keyof typeof GK_CHROME;

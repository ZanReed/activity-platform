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

// ── 4. Board theming (dark mode) ─────────────────────────────────────────────
// The boards (JSXGraph + hand-built SVG) reach published pages and can't read
// CSS custom properties, so board dark mode is a JS resolver, not light-dark().
// Design: docs/design/graph-kit-board-dark.md.
//
// A board SELF-DETECTS its theme from its container's computed color-scheme
// (which the app's light-dark() mechanism sets on :root — system pref AND the
// toggle). LIGHT values below match today's rendering (JSXGraph defaults / the
// existing consts), so light stays pixel-identical; callers only apply the DARK
// structural colors when dark is detected.
export type BoardTheme = 'light' | 'dark';

export interface BoardColors {
    bg: string; // board background
    grid: string; // grid lines
    axis: string; // axis strokes
    label: string; // tick / axis labels
    scatter: string; // scatter points + point strokes (near-black in light)
    ink: string; // data-plot ink
    openFill: string; // hollow/open-point fill = the board bg, so it reads hollow
}

// Light = today's values (JSXGraph defaults for bg/grid/axis/label; the existing
// content consts for scatter/ink/openFill). Setting these is a no-op vs default,
// so callers skip them in light and only override in dark.
const BOARD_LIGHT: BoardColors = {
    bg: '#ffffff',
    grid: '#c0c0c0', // JSXGraph default major grid
    axis: '#666666', // JSXGraph default axis
    label: '#666666',
    scatter: SCATTER, // #0f172a
    ink: INK, // #1e293b
    openFill: OPEN_FILL, // #ffffff
};

const BOARD_DARK: BoardColors = {
    bg: '#0f172a', // slate-900 — matches the dark editor canvas
    grid: '#1e293b', // slate-800 — subtle grid on dark (mirrors the light subtlety)
    axis: '#94a3b8', // slate-400 — axis reads clearly
    label: '#cbd5e1', // slate-300 — readable tick labels
    scatter: '#e2e8f0', // slate-200 — light points (near-black would vanish)
    ink: '#e2e8f0', // slate-200
    openFill: '#0f172a', // = bg, so hollow points read hollow on dark
};

export function boardColors(theme: BoardTheme): BoardColors {
    return theme === 'dark' ? BOARD_DARK : BOARD_LIGHT;
}

// ── 5. Chrome theming (dark mode) ────────────────────────────────────────────
// The question mounters draw a control strip (shape/style pills) OVER the board
// as plain DOM styled inline from GK_CHROME — a static LIGHT palette. Once the
// board self-themes dark, that strip stayed light: a white bar with white-on-
// (inherited-light) pills that vanish on the dark board. This resolves the strip
// + pill colors the same way boards do (self-detect at mount, dark overrides
// only). LIGHT == today's GK_CHROME values, so light is byte-identical.
export interface ChromeColors {
    barBg: string; // control strip background over the board
    barBorder: string; // strip / panel / footer divider (was GK_CHROME.hover)
    pillBg: string; // inactive pill fill
    pillBorder: string; // pill border
    pillText: string; // inactive pill text
    accent: string; // active pill fill
    onAccent: string; // active pill text
    panelBg: string; // floating popover panel over the board
    footerBg: string; // footer strip over the board
    muted: string; // hint / muted meta text on the strip
    shadow: string; // soft popover shadow
}

const CHROME_LIGHT: ChromeColors = {
    barBg: GK_CHROME.overlayBar, // rgba(255,255,255,0.88) — today
    barBorder: GK_CHROME.hover, // #e2e8f0 — today
    pillBg: GK_CHROME.bg, // #ffffff — today
    pillBorder: GK_CHROME.border, // #cbd5e1 — today
    pillText: 'inherit', // today's inactive pill color (inherits editor ink)
    accent: GK_CHROME.accent, // #2563eb — today
    onAccent: GK_CHROME.bg, // #ffffff — today's active pill text
    panelBg: GK_CHROME.overlayPanel, // rgba(255,255,255,0.97) — today
    footerBg: GK_CHROME.overlayFooter, // rgba(255,255,255,0.9) — today
    muted: GK_CHROME.muted, // #64748b — today
    shadow: GK_CHROME.shadowSoft, // rgba(0,0,0,0.08) — today
};

const CHROME_DARK: ChromeColors = {
    barBg: 'rgba(30, 41, 59, 0.92)', // slate-800 strip over the slate-900 board
    barBorder: '#334155', // slate-700
    pillBg: '#334155', // slate-700 — reads distinct from the strip
    pillBorder: '#475569', // slate-600
    pillText: '#e2e8f0', // slate-200 — readable on the dark pill
    accent: '#2563eb', // blue reads on dark
    onAccent: '#ffffff',
    panelBg: 'rgba(30, 41, 59, 0.97)', // slate-800 panel
    footerBg: 'rgba(30, 41, 59, 0.9)', // slate-800 footer
    muted: '#94a3b8', // slate-400 — readable muted on dark
    shadow: 'rgba(0, 0, 0, 0.5)', // deeper soft shadow on dark
};

export function chromeColors(theme: BoardTheme): ChromeColors {
    return theme === 'dark' ? CHROME_DARK : CHROME_LIGHT;
}

/**
 * Resolve a container's computed `color-scheme` (+ the OS preference for the
 * ambiguous cases) to a single board theme. Pure, so it's unit-testable without
 * a DOM.
 *   'dark'                  -> dark
 *   'light'                 -> light
 *   'light dark' | 'normal' -> the OS preference (prefersDark)
 */
export function resolveBoardTheme(
    colorScheme: string,
    prefersDark: boolean,
): BoardTheme {
    const cs = colorScheme.trim();
    const hasDark = cs.includes('dark');
    const hasLight = cs.includes('light');
    if (hasDark && !hasLight) return 'dark';
    if (hasLight && !hasDark) return 'light';
    return prefersDark ? 'dark' : 'light'; // 'light dark' (system) or 'normal'/''
}

/** Detect a board's theme from its container's computed color-scheme. */
export function detectBoardTheme(el: Element | null): BoardTheme {
    if (typeof window === 'undefined' || !el) return 'light';
    const cs = window.getComputedStyle(el).colorScheme || 'normal';
    const prefersDark =
        window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    return resolveBoardTheme(cs, prefersDark);
}

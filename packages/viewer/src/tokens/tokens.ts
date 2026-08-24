// =============================================================================
// tokens.ts — typed names for the token layer (tokens.css)
// -----------------------------------------------------------------------------
// tokens.css is the value source of truth; this module names the vocabulary so
// TypeScript consumers (components, the T6 contrast harness, guard tests) can
// reference tokens without string literals. The guard suite parses tokens.css
// and fails if these lists and the stylesheet disagree — add a token in both
// places or nowhere.
// =============================================================================

/** Color roles that MUST be re-declared by every theme block (dark media,
 * forced-dark, print) — the themable surface of the vocabulary. */
export const colorTokens = [
  '--vw-color-page',
  '--vw-color-paper',
  '--vw-color-raised',
  '--vw-color-overlay',
  '--vw-color-hover',
  '--vw-color-ink',
  '--vw-color-ink-muted',
  '--vw-color-ink-faint',
  '--vw-color-line',
  '--vw-color-line-strong',
  '--vw-color-line-faint',
  '--vw-color-accent',
  '--vw-color-accent-strong',
  '--vw-color-accent-wash',
  // The static-SVG graph palette. Colour ROLES like the rest, so every theme
  // block must re-declare them — which is what forces dark and print to have
  // an opinion instead of silently inheriting paper. Consumed by graph-kit's
  // `renderGraphSvg` through `var(--gk-svg-*, <paper hex>)` in an SVG
  // presentation attribute; the fallback is the paper value, so a surface that
  // does not load tokens.css (the EDITOR, measured 2026-08-24) renders exactly
  // as it did before these existed.
  '--gk-svg-grid',
  '--gk-svg-axis',
  '--gk-svg-label',
  '--state-correct-ink',
  '--state-correct-border',
  '--state-correct-surface',
  '--state-correct-surface-soft',
  '--state-incorrect-ink',
  '--state-incorrect-border',
  '--state-incorrect-surface',
  '--state-incorrect-surface-soft',
  '--state-pending-ink',
  '--state-pending-border',
  '--state-pending-surface',
  '--state-recorded-ink',
  '--state-recorded-border',
  '--state-recorded-surface',
  '--callout-info-ink',
  '--callout-info-surface',
  '--callout-warning-ink',
  '--callout-warning-surface',
  '--callout-success-ink',
  '--callout-success-surface',
  '--callout-note-ink',
  '--callout-note-surface',
] as const;

/** Light-only tokens: declared once on :root, never re-themed (structure,
 * rhythm, type, print border styles). */
export const staticTokens = [
  '--callout-info-print-border',
  '--callout-warning-print-border',
  '--callout-success-print-border',
  '--callout-note-print-border',
  '--vw-font-body',
  '--vw-font-chrome',
  '--vw-font-math',
  '--leading',
  '--type-title',
  '--type-h1',
  '--type-h2',
  '--type-h3',
  '--type-body',
  '--type-small',
  '--type-meta',
  '--type-fine',
  '--space-1',
  '--space-2',
  '--space-3',
  '--space-4',
  '--space-5',
  '--space-6',
  '--space-8',
  '--space-10',
  '--measure',
  '--gutter-problem',
  '--gutter-equation',
  '--touch-target',
  '--vw-figure-cap',
  '--vw-figure-cap-print',
  '--vw-figure-cap-standalone',
  '--vw-figure-cap-standalone-print',
  '--vw-radius-sm',
  '--vw-radius-md',
  '--vw-radius-lg',
  '--vw-radius-xl',
  '--vw-radius-window',
  '--vw-radius-pill',
  '--focus-ring',
  '--focus-offset',
  '--vw-shadow-popover',
  '--vw-shadow-window',
  '--vw-shadow-drag',
  '--z-tools',
  '--z-reference',
  '--z-calculator',
  '--z-topbar',
  '--z-banner',
  '--z-popover',
] as const;

export type ColorToken = (typeof colorTokens)[number];
export type StaticToken = (typeof staticTokens)[number];
export type DesignToken = ColorToken | StaticToken;

/** The four states of the shared state vocabulary (rulings 7.2A / 2.1A):
 * every state pill, blank verdict, row tint, and banner draws from these —
 * a fifth state is a design decision, not a CSS addition. */
export const stateNames = ['correct', 'incorrect', 'pending', 'recorded'] as const;
export type StateName = (typeof stateNames)[number];

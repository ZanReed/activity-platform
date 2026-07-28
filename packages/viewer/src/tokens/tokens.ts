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
  '--color-page',
  '--color-paper',
  '--color-raised',
  '--color-overlay',
  '--color-hover',
  '--color-ink',
  '--color-ink-muted',
  '--color-ink-faint',
  '--color-line',
  '--color-line-strong',
  '--color-line-faint',
  '--color-accent',
  '--color-accent-strong',
  '--color-accent-wash',
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
  '--font-body',
  '--font-chrome',
  '--font-math',
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
  '--radius-sm',
  '--radius-md',
  '--radius-lg',
  '--radius-xl',
  '--radius-window',
  '--radius-pill',
  '--focus-ring',
  '--focus-offset',
  '--shadow-popover',
  '--shadow-window',
  '--shadow-drag',
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

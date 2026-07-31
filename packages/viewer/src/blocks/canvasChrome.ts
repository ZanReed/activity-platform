// =============================================================================
// blocks/canvasChrome.ts — shared bits for the canvas-backed blocks
// -----------------------------------------------------------------------------
// interactive_graph, number_line, and data_plot all mount an imperative kit
// widget, and all three need the same two inline styles. Both are inline
// rather than left to a stylesheet on purpose — each encodes a property that
// must not depend on external CSS having loaded.
// =============================================================================

/**
 * The per-mount host box. `height: 100%` matters: the kit measures its mount
 * point, and in a zero-height container JSXGraph builds an svg of height 0 and
 * draws nothing (found in /dev/viewer, where boards mounted only
 * intermittently until the canvas was given a real size).
 */
export const CANVAS_HOST_STYLE = {
  width: '100%',
  height: '100%',
} as const;

/**
 * Reaches screen readers, never the screen. Inlined because a missing class
 * would silently INVERT the intent — and `display: none` would hide the
 * region from assistive tech too, which is the opposite of the point. The
 * canvas blocks narrate handle positions here: a visible readout would hand
 * over the coordinate reading that IS the skill being assessed.
 */
export const VISUALLY_HIDDEN = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  margin: '-1px',
  padding: 0,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
  border: 0,
} as const;

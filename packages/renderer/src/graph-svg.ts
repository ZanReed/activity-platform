// =============================================================================
// graph-svg.ts — re-export shim
// -----------------------------------------------------------------------------
// The implementation moved to @activity/graph-kit/static-svg so the viewer can
// print IDENTICAL static graphs without importing this package (which retires
// at S5.5). This shim keeps every existing import path in the renderer working
// and its output byte-identical; it disappears with the renderer.
// =============================================================================

export {
  renderGraphSvg,
  answerKeyDrawables,
} from '@activity/graph-kit/static-svg';

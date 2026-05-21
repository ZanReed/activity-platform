// =============================================================================
// runtime/dom.ts — DOM query helpers
// -----------------------------------------------------------------------------
// Thin wrappers over querySelector / querySelectorAll. $$ returns a real array
// (not a NodeList) so callers can use forEach/map/filter without ceremony.
//
// These were `var $ = ...` closure helpers in the pre-Stage-11 single-string
// runtime; as real modules they are typed. $ is generic so a caller that
// passes a known selector gets the right element type back without a cast.
// =============================================================================

export function $<T extends Element = Element>(
  sel: string,
  root: ParentNode = document,
): T | null {
  return root.querySelector<T>(sel);
}

export function $$<T extends Element = Element>(
  sel: string,
  root: ParentNode = document,
): T[] {
  return Array.prototype.slice.call(root.querySelectorAll<T>(sel));
}

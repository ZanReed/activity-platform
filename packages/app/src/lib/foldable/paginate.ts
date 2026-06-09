// =============================================================================
// paginate.ts — chunk measured flow items into fixed-height panels
// -----------------------------------------------------------------------------
// The pagination engine: given the height of every flow item (a problem, a
// paragraph, a section title …) and the height budget of one panel, pack items
// greedily into panels in document order, NEVER splitting an item across a fold.
// A problem that lands at the bottom of a panel moves whole to the next panel;
// a problem taller than a whole panel gets its own (over-full) panel rather than
// being broken — keeping a problem intact always wins over filling space.
//
// Pure and DOM-free: it consumes measured heights (px, from measure.ts) and
// emits index groupings. That keeps the packing logic unit-testable without a
// browser. Spacing between items within a panel is added between consecutive
// items only (n items → n-1 gaps), matching CSS adjacent-sibling margins.
// =============================================================================

export interface FlowItem {
  /** Rendered HTML of one top-level block (outerHTML captured during measure). */
  html: string;
  /** Measured height in CSS px at 96/in. */
  height: number;
}

export interface PaginateOptions {
  /** Panel content-box height budget, px (SheetGeometry.panelHeightPx). */
  panelHeightPx: number;
  /** Vertical gap between consecutive items in a panel, px. */
  spacingPx: number;
}

/**
 * Group flow items into panels. Returns an array of panels, each an array of
 * indices into the input `items` (preserving document order). An empty input
 * yields an empty array (no panels, no foldable).
 */
export function paginate(
  items: readonly FlowItem[],
  opts: PaginateOptions,
): number[][] {
  const { panelHeightPx, spacingPx } = opts;
  const panels: number[][] = [];

  let current: number[] = [];
  let used = 0; // height consumed in the current panel, including gaps

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item) continue;
    const h = item.height;
    // Cost to add this item: its height, plus a gap if it isn't the first item
    // in the panel.
    const gap = current.length === 0 ? 0 : spacingPx;
    const projected = used + gap + h;

    if (current.length > 0 && projected > panelHeightPx) {
      // Doesn't fit — seal the current panel and start a fresh one with this
      // item. (If current is empty we never reach here: an oversized lone item
      // is placed rather than dropped.)
      panels.push(current);
      current = [i];
      used = h;
    } else {
      current.push(i);
      used = projected;
    }
  }

  if (current.length > 0) panels.push(current);
  return panels;
}

// =============================================================================
// columnResize.ts — drag-resize divider between adjacent columns (Drop 2 of
// variable block sizing; see docs/design/variable-block-sizing.md).
// -----------------------------------------------------------------------------
// One divider per internal cell boundary, rendered as a widget decoration
// pinned to the left edge of every column except the first (same never-
// serialized widget pattern as the columns grip). Dragging it reweights ONLY
// the adjacent pair — their combined weight is preserved, so the other
// columns keep their share of the row, which is what column resizing means in
// every table/layout tool.
//
// Gesture model:
//   * pointerdown on the divider captures the pointer and snapshots the pair's
//     weights and pixel widths.
//   * pointermove previews by writing flex-grow inline styles on the two cell
//     DOM nodes only — no transactions mid-drag, so the document and the undo
//     stack stay untouched while the mouse is down.
//   * pointerup commits ONE transaction writing the two columns' width attrs
//     (single undo step). Escape / pointercancel restores the preview styles
//     and commits nothing.
//
// Snapping: the boundary snaps to clean pair fractions (1/4, 1/3, 1/2, 2/3,
// 3/4 — i.e. ratios 1:3, 1:2, 1:1, 2:1, 3:1) when within tolerance; holding
// Alt disables snapping for fine-grained control. A weight that lands at ~1
// is stored as null (the schema's "default weight" spelling), so an evened-out
// block detects as the 'even' preset again.
// =============================================================================

import { Plugin, PluginKey, type EditorState } from '@tiptap/pm/state';
import { Decoration, DecorationSet, type EditorView } from '@tiptap/pm/view';

// -----------------------------------------------------------------------------
// Pure math — exported for unit tests.
// -----------------------------------------------------------------------------

// Neither cell of the pair can shrink below this fraction of their combined
// width: a near-zero column is unusable and unrecoverable (its divider and
// content would be unreachable).
export const PAIR_MIN_FRACTION = 0.15;

// Clean boundary positions within the pair, as left-cell fractions.
export const SNAP_STOPS = [1 / 4, 1 / 3, 1 / 2, 2 / 3, 3 / 4] as const;

// How close (in pair-fraction units) the pointer must be to a stop to snap.
export const SNAP_TOLERANCE = 0.03;

/** Clamp a raw left-cell fraction into bounds, snapping to clean stops. */
export function snapPairFraction(fraction: number, snap: boolean): number {
  const clamped = Math.min(
    Math.max(fraction, PAIR_MIN_FRACTION),
    1 - PAIR_MIN_FRACTION,
  );
  if (!snap) return clamped;
  for (const stop of SNAP_STOPS) {
    if (Math.abs(clamped - stop) <= SNAP_TOLERANCE) return stop;
  }
  return clamped;
}

/** Round to 2 decimals; weights at ~1 collapse to null (the schema default). */
export function normalizeWeight(weight: number): number | null {
  const rounded = Math.round(weight * 100) / 100;
  return Math.abs(rounded - 1) < 0.01 ? null : rounded;
}

export interface ResizeInput {
  // Current weights of the pair (null/absent already resolved to 1).
  leftWeight: number;
  rightWeight: number;
  // Pixel widths at drag start: the left cell, and the pair combined.
  leftPx: number;
  pairPx: number;
  // Horizontal pointer travel since drag start (px, +right).
  deltaPx: number;
  // False while Alt is held (fine-grained override).
  snap: boolean;
}

/**
 * New [left, right] width attrs for the pair. Their combined weight is
 * preserved so columns outside the pair keep their share of the row.
 */
export function resizePairWeights(
  input: ResizeInput,
): [number | null, number | null] {
  const { leftWeight, rightWeight, leftPx, pairPx, deltaPx, snap } = input;
  if (pairPx <= 0) {
    return [normalizeWeight(leftWeight), normalizeWeight(rightWeight)];
  }
  const pairWeight = leftWeight + rightWeight;
  const fraction = snapPairFraction((leftPx + deltaPx) / pairPx, snap);
  return [
    normalizeWeight(fraction * pairWeight),
    normalizeWeight((1 - fraction) * pairWeight),
  ];
}

// -----------------------------------------------------------------------------
// ProseMirror plumbing.
// -----------------------------------------------------------------------------

const columnResizePluginKey = new PluginKey('columnResize');

// Where the divider's widget position sits relative to the document: the
// widget is placed just inside its column (the RIGHT cell of the pair), so
// resolving getPos() finds the column at the deepest depth and the columns
// container one level up.
interface DividerContext {
  columnsDepth: number;
  // Index of the divider's own column (the right cell); the pair is
  // [index - 1, index].
  index: number;
}

function resolveDividerContext(
  state: EditorState,
  widgetPos: number,
): DividerContext | null {
  const $pos = state.doc.resolve(widgetPos);
  let depth = $pos.depth;
  while (depth > 0 && $pos.node(depth).type.name !== 'column') depth -= 1;
  if (depth === 0) return null;
  const columnsDepth = depth - 1;
  if ($pos.node(columnsDepth).type.name !== 'columns') return null;
  const index = $pos.index(columnsDepth);
  if (index === 0) return null; // no divider before the first cell
  return { columnsDepth, index };
}

// The effective weight of a column node's width attr (absent ⇒ 1).
function effectiveWeight(width: unknown): number {
  return typeof width === 'number' && width > 0 ? width : 1;
}

function startDividerDrag(
  view: EditorView,
  getPos: () => number | undefined,
  divider: HTMLElement,
  startEvent: PointerEvent,
): void {
  const widgetPos = getPos();
  if (typeof widgetPos !== 'number') return;
  const ctx = resolveDividerContext(view.state, widgetPos);
  if (!ctx) return;

  // DOM cells of the pair. The divider lives inside the right cell; the left
  // cell is the nearest preceding .editor-column sibling (the grip widget is
  // the only other child of the container, and it precedes the FIRST cell).
  const rightCell = divider.closest<HTMLElement>('.editor-column');
  if (!rightCell) return;
  let leftCell = rightCell.previousElementSibling;
  while (leftCell && !leftCell.classList.contains('editor-column')) {
    leftCell = leftCell.previousElementSibling;
  }
  if (!(leftCell instanceof HTMLElement)) return;
  const container = rightCell.parentElement;

  const columnsNode = view.state.doc.resolve(widgetPos).node(ctx.columnsDepth);
  const leftWeight = effectiveWeight(
    columnsNode.child(ctx.index - 1).attrs.width,
  );
  const rightWeight = effectiveWeight(columnsNode.child(ctx.index).attrs.width);
  const leftPx = leftCell.getBoundingClientRect().width;
  const pairPx = leftPx + rightCell.getBoundingClientRect().width;
  const startX = startEvent.clientX;

  // Inline styles to restore on cancel (the preview overwrites them).
  const prevLeftFlexGrow = leftCell.style.flexGrow;
  const prevRightFlexGrow = rightCell.style.flexGrow;
  const prevCursor = document.documentElement.style.cursor;

  let latest: [number | null, number | null] = [
    normalizeWeight(leftWeight),
    normalizeWeight(rightWeight),
  ];

  container?.classList.add('is-column-resizing');
  document.documentElement.style.cursor = 'col-resize';
  try {
    divider.setPointerCapture(startEvent.pointerId);
  } catch {
    /* synthetic events / exotic pointers may have no active pointer to
     capture; the move/up listeners still work for the common path */
  }

  const preview = (weights: [number | null, number | null]) => {
    leftCell.style.flexGrow = String(weights[0] ?? 1);
    rightCell.style.flexGrow = String(weights[1] ?? 1);
  };

  const cleanup = () => {
    divider.removeEventListener('pointermove', onMove);
    divider.removeEventListener('pointerup', onUp);
    divider.removeEventListener('pointercancel', onCancel);
    window.removeEventListener('keydown', onKeyDown, true);
    container?.classList.remove('is-column-resizing');
    document.documentElement.style.cursor = prevCursor;
    try {
      if (divider.hasPointerCapture(startEvent.pointerId)) {
        divider.releasePointerCapture(startEvent.pointerId);
      }
    } catch {
      /* mirror of the capture guard above */
    }
  };

  const restore = () => {
    leftCell.style.flexGrow = prevLeftFlexGrow;
    rightCell.style.flexGrow = prevRightFlexGrow;
  };

  const onMove = (event: PointerEvent) => {
    latest = resizePairWeights({
      leftWeight,
      rightWeight,
      leftPx,
      pairPx,
      deltaPx: event.clientX - startX,
      snap: !event.altKey,
    });
    preview(latest);
  };

  const onUp = () => {
    cleanup();
    restore();
    commit(latest);
  };

  const onCancel = () => {
    cleanup();
    restore();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onCancel();
    }
  };

  // Re-resolve positions at commit time (getPos survives unrelated doc
  // shifts), then write both width attrs in ONE transaction — a single undo
  // step, and the re-rendered cells replace the preview styles.
  const commit = (weights: [number | null, number | null]) => {
    const pos = getPos();
    if (typeof pos !== 'number') return;
    const freshCtx = resolveDividerContext(view.state, pos);
    if (!freshCtx) return;
    const $pos = view.state.doc.resolve(pos);
    const freshColumns = $pos.node(freshCtx.columnsDepth);
    const columnsPos = $pos.before(freshCtx.columnsDepth);

    const tr = view.state.tr;
    let childPos = columnsPos + 1;
    for (let i = 0; i < freshColumns.childCount; i++) {
      const child = freshColumns.child(i);
      if (i === freshCtx.index - 1 || i === freshCtx.index) {
        tr.setNodeMarkup(childPos, undefined, {
          ...child.attrs,
          width: i === freshCtx.index - 1 ? weights[0] : weights[1],
        });
      }
      childPos += child.nodeSize;
    }
    if (tr.docChanged) view.dispatch(tr);
  };

  divider.addEventListener('pointermove', onMove);
  divider.addEventListener('pointerup', onUp);
  divider.addEventListener('pointercancel', onCancel);
  window.addEventListener('keydown', onKeyDown, true);
}

function buildColumnDivider(
  view: EditorView,
  getPos: () => number | undefined,
): HTMLElement {
  const divider = document.createElement('div');
  divider.className = 'editor-column-divider';
  divider.setAttribute('contenteditable', 'false');
  divider.setAttribute('title', 'Drag to resize columns (Alt: fine-grained)');
  divider.setAttribute('aria-label', 'Drag to resize columns');

  divider.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    // Own the gesture: no text selection, no PM mousedown handling, no
    // nested-drag-handle hover logic underneath.
    event.preventDefault();
    event.stopPropagation();
    startDividerDrag(view, getPos, divider, event);
  });

  return divider;
}

function columnDividerDecorations(state: EditorState): DecorationSet {
  const decorations: Decoration[] = [];
  state.doc.descendants((node, pos) => {
    if (node.type.name !== 'columns') return true;
    let childPos = pos + 1;
    for (let i = 0; i < node.childCount; i++) {
      if (i > 0) {
        // Just inside the cell's first content slot — the divider renders as
        // the cell's first DOM child and CSS pins it over the gap to its left.
        decorations.push(
          Decoration.widget(childPos + 1, buildColumnDivider, {
            side: -1,
            key: `column-divider-${childPos}`,
          }),
        );
      }
      childPos += node.child(i).nodeSize;
    }
    return false; // columns can't nest — no need to descend
  });
  return DecorationSet.create(state.doc, decorations);
}

export function columnResizePlugin(): Plugin {
  return new Plugin({
    key: columnResizePluginKey,
    props: {
      decorations: columnDividerDecorations,
    },
  });
}

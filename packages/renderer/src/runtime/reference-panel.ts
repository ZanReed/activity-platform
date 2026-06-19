// =============================================================================
// reference-panel.ts — sidecar script for the on-screen reference panel
// -----------------------------------------------------------------------------
// Inlined into a published page by document.ts ONLY when the activity has a
// referencePanel. Self-contained UI chrome — it has NOTHING to do with the
// scoring runtime (separate bundle, separate concern), which is why it may do
// direct DOM writes instead of going through the runtime's state→render
// discipline. The scoring runtime's strict invariants stay untouched.
//
// Two behaviors:
//
//   1. Scroll-clearance. The panel is position:fixed at the viewport bottom, so
//      it floats over content and would permanently hide the bottom of the
//      page. A ResizeObserver keeps the activity container padded by the
//      panel's LIVE height, so the last content can always be scrolled clear,
//      and the page + panel scroll independently.
//
//   2. Drag-resize. A grab handle on the panel's top edge (visually top because
//      the panel is flex column-reverse) resizes the open panel between a floor
//      and ~90vh, so a large reference never takes the whole screen. Resizing
//      feeds the same observer, so the reserved space stays correct. An
//      explicit dragged height is cleared when the panel collapses, so the
//      closed bar is never stuck at the last dragged height.
//
// Defensive throughout: every lookup may be null (older published markup, or a
// future renderer change); a missing element disables that behavior, never
// throws.
// =============================================================================

function setupReferencePanel(): void {
  const panel = document.querySelector<HTMLDetailsElement>('.reference-panel');
  if (!panel) return;
  const container = document.querySelector<HTMLElement>('.activity-container');
  const handle = panel.querySelector<HTMLElement>('.reference-panel-resize');

  // --- 1. Scroll-clearance ---------------------------------------------------
  // Reserve page-bottom space equal to the panel's current height (plus a small
  // breathing buffer). offsetHeight is the collapsed bar when closed and the
  // full panel when open/resized — so the last content can always scroll clear.
  const sync = (): void => {
    if (container) {
      container.style.paddingBottom = panel.offsetHeight + 12 + 'px';
    }
  };
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(sync).observe(panel);
  } else {
    // Fallback for the (unsupported) no-ResizeObserver case: at least track
    // open/close. Won't follow a live drag, but the observer covers the
    // runtime's whole browser-support matrix in practice.
    panel.addEventListener('toggle', sync);
  }

  // Clear an explicit (dragged) height when the panel collapses, so the closed
  // bar is just the bar — not the last dragged height. sync() here also covers
  // the no-ResizeObserver fallback path.
  panel.addEventListener('toggle', () => {
    if (!panel.open) {
      panel.style.height = '';
      panel.style.maxHeight = '';
    }
    sync();
  });

  sync();

  // --- 2. Drag-resize --------------------------------------------------------
  if (handle) {
    const FLOOR = 96; // px — the panel never resizes smaller than this
    const ceiling = (): number => Math.round(window.innerHeight * 0.9);
    let dragging = false;

    handle.addEventListener('pointerdown', (e: PointerEvent) => {
      if (!panel.open) return; // only resizable while open
      dragging = true;
      // Let the panel exceed its default CSS max-height once the student
      // deliberately drags it taller.
      panel.style.maxHeight = ceiling() + 'px';
      handle.setPointerCapture(e.pointerId);
      e.preventDefault(); // suppress text selection during the drag
    });

    handle.addEventListener('pointermove', (e: PointerEvent) => {
      if (!dragging) return;
      // The panel is bottom-anchored, so its height is the distance from the
      // pointer up to the bottom of the viewport.
      const h = Math.min(
        ceiling(),
        Math.max(FLOOR, window.innerHeight - e.clientY),
      );
      panel.style.height = h + 'px';
    });

    const end = (e: PointerEvent): void => {
      if (!dragging) return;
      dragging = false;
      try {
        handle.releasePointerCapture(e.pointerId);
      } catch {
        /* pointer already released — non-fatal */
      }
    };
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupReferencePanel);
} else {
  setupReferencePanel();
}

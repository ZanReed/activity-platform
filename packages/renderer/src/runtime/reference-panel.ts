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
  const body = panel.querySelector<HTMLElement>('.reference-panel-body');

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

  // Clear an explicit (dragged) body cap when the panel collapses, so the next
  // open starts at the default size. sync() here also covers the
  // no-ResizeObserver fallback path.
  panel.addEventListener('toggle', () => {
    if (!panel.open && body) body.style.maxHeight = '';
    sync();
  });

  sync();

  // --- 2. Drag-resize --------------------------------------------------------
  // Resize is driven through the BODY's max-height (the element that actually
  // scrolls), NOT the panel's height — capping the panel alone left the body at
  // full content height (flex-shrink doesn't constrain against a max-height-only
  // container), so content overflowed the page instead of scrolling.
  if (handle && body) {
    const FLOOR = 80; // px — minimum visible body height
    let dragging = false;
    let chrome = 0; // bar + handle + borders, measured at drag start

    handle.addEventListener('pointerdown', (e: PointerEvent) => {
      if (!panel.open) return; // only resizable while open
      dragging = true;
      chrome = panel.offsetHeight - body.offsetHeight;
      handle.setPointerCapture(e.pointerId);
      e.preventDefault(); // suppress text selection during the drag
    });

    handle.addEventListener('pointermove', (e: PointerEvent) => {
      if (!dragging) return;
      // The panel is bottom-anchored; the body cap that puts the panel's top
      // edge at the pointer is (viewport bottom − pointerY) minus the fixed
      // chrome. Clamp between a floor and ~90vh so it never fills the screen.
      const ceiling = window.innerHeight * 0.9 - chrome;
      const desired = window.innerHeight - e.clientY - chrome;
      body.style.maxHeight = Math.min(ceiling, Math.max(FLOOR, desired)) + 'px';
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

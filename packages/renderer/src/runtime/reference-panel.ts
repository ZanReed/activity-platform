// =============================================================================
// reference-panel.ts — sidecar script for the floating reference panel
// -----------------------------------------------------------------------------
// Inlined into a published page by document.ts ONLY when the activity has a
// referencePanel. Self-contained UI chrome — it has NOTHING to do with the
// scoring runtime (separate bundle, separate concern), which is why it may do
// direct DOM writes instead of going through the runtime's state→render
// discipline. The scoring runtime's strict invariants stay untouched.
//
// The panel is a calculator-style floating window: a summon button in the
// .tool-corner cluster opens a fixed-position, draggable, natively-resizable
// panel whose content is server-rendered scaffold HTML already in the page —
// nothing is lazy-loaded, so unlike the calculator-summon sidecar there is no
// import() here. Three behaviors:
//
//   1. Summon/close toggling. The summon button opens the panel and hides
//      itself (it would sit under the panel otherwise — calculator pattern);
//      the panel's ×, or Escape from inside it, closes and restores the
//      button. Focus follows: into the panel on open, back to the button on
//      close. Escape respects defaultPrevented so a popover inside the panel
//      (e.g. a definition) can consume its own Escape without also closing
//      the panel.
//
//   2. Drag-to-move. Grab the header to slide the panel off the work,
//      Desmos-style (same clamps as the calculator kit: the header can never
//      be dragged off-screen). Drags starting on the × still click normally.
//
//   3. Geometry memory falls out for free: drag writes left/top and the
//      native CSS resize handle writes width/height as inline styles, and the
//      panel element is never destroyed — so size + position survive
//      close/open for the whole page session. Deliberately not localStorage.
//
// Defensive throughout: every lookup may be null (older published markup, or a
// future renderer change); a missing element disables that behavior, never
// throws.
// =============================================================================

export function setupReferenceTool(): void {
  const tool = document.querySelector<HTMLElement>('.reference-tool');
  if (!tool) return;
  const button = tool.querySelector<HTMLButtonElement>('.reference-summon');
  const panel = tool.querySelector<HTMLElement>('.reference-float');
  if (!button || !panel) return;
  const header = panel.querySelector<HTMLElement>('.reference-float-header');
  const closeBtn = panel.querySelector<HTMLButtonElement>(
    '.reference-float-close',
  );

  // --- 1. Summon/close toggling ---------------------------------------------
  const setOpen = (open: boolean): void => {
    panel.hidden = !open;
    button.hidden = open;
    button.setAttribute('aria-expanded', String(open));
    // Move focus with the state change (button → panel → button) so keyboard
    // users land where the action is and Escape works from anywhere inside.
    if (open) panel.focus();
    else button.focus();
  };

  button.addEventListener('click', () => setOpen(true));
  closeBtn?.addEventListener('click', () => setOpen(false));
  panel.addEventListener('keydown', (e: KeyboardEvent) => {
    // defaultPrevented: an inner widget (definition popover) that handled its
    // own Escape shouldn't also close the panel — same convention as the
    // editor's config drawer.
    if (e.key === 'Escape' && !e.defaultPrevented) setOpen(false);
  });

  // --- 2. Drag-to-move --------------------------------------------------------
  // Mirrors the calculator kit's header drag. Starts from the CSS default
  // corner; on first drag we pin left/top (releasing the bottom anchor) and
  // clamp so the header can never be lost off-screen. Drags that begin on a
  // header control (the ×) are ignored so it still clicks normally.
  if (header) {
    let dragDX = 0;
    let dragDY = 0;
    let dragging = false;
    header.addEventListener('pointerdown', (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('button')) return;
      dragging = true;
      const r = panel.getBoundingClientRect();
      panel.style.left = r.left + 'px';
      panel.style.top = r.top + 'px';
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
      dragDX = e.clientX - r.left;
      dragDY = e.clientY - r.top;
      header.setPointerCapture(e.pointerId);
      e.preventDefault(); // suppress text selection during the drag
    });
    header.addEventListener('pointermove', (e: PointerEvent) => {
      if (!dragging) return;
      const w = panel.offsetWidth;
      const left = Math.min(
        Math.max(e.clientX - dragDX, 8 - w + 64), // keep ≥64px on screen
        window.innerWidth - 64,
      );
      const top = Math.min(
        Math.max(e.clientY - dragDY, 8),
        window.innerHeight - 40,
      );
      panel.style.left = left + 'px';
      panel.style.top = top + 'px';
    });
    const end = (e: PointerEvent): void => {
      if (!dragging) return;
      dragging = false;
      try {
        header.releasePointerCapture(e.pointerId);
      } catch {
        /* pointer already released — non-fatal */
      }
    };
    header.addEventListener('pointerup', end);
    header.addEventListener('pointercancel', end);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setupReferenceTool());
} else {
  setupReferenceTool();
}

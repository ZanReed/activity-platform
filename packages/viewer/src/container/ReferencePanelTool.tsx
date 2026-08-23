// =============================================================================
// container/ReferencePanelTool.tsx — the reference panel's SCREEN surface
// -----------------------------------------------------------------------------
// The sixth and last S9 orphan: `ActivityDocument.referencePanel` is authored,
// stored, sanitized and censused, and since Drop 4 a student has seen it only
// on paper — and only when the teacher left the print box on. This is the
// screen half coming back.
//
// A CONTAINER, NOT A RENDERER. The blocks already render: ViewerContainer has
// put them through the same registry-driven `BlockSlot` as body content since
// the print box shipped. What did not exist was anywhere on screen to render
// them INTO. That is the whole of this file.
//
// WHY IT LIVES INSIDE ViewerContainer while the calculator lives in
// StudentViewer (C16): the calculator is framework-agnostic DOM that a route
// can mount anywhere, and keeping it out of the container is what stops it
// appearing in ActivityPrint's on-screen print preview. This panel renders
// REACT BLOCKS, so it needs the container's own context — the resolver, the
// per-block error boundary, the mode. It takes C16's second option instead:
// gated on `mode === 'screen'`, so the print preview and DevViewer never grow a
// floating panel while the print box beneath it is untouched.
//
// Conventions inherited from DECISIONS.md:193-195, not re-decided: the summon
// hides while the panel is open; × or Escape closes; focus moves panel <-> the
// button; role="dialog" is NON-MODAL; the panel anchors bottom-LEFT so an open
// calculator (bottom-right) never collides with it.
//
// NO DRAG in v1 (ruling R2). C5 already holds that drag is an ENHANCEMENT and
// the panel must be fully usable parked at its default position; the observed
// content is a formula list, and the drag machinery is the expensive half. The
// draggable form is this file plus a header handle — nothing here forecloses it.
// =============================================================================

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';

export interface ReferencePanelToolProps {
  readonly panel: { title?: string; blocks: unknown[] } | undefined;
  /** Render one panel block. A RENDER PROP rather than an import, because
   * `BlockSlot` is private to ViewerContainer and exporting internal machinery
   * to reach it would be the wrong trade — this way the container keeps its
   * resolver, boundary and reset-key wiring in one place, and this component
   * stays drivable in a test by a fake renderer that needs no registry. */
  readonly renderBlock: (block: unknown) => ReactNode;
}

export function ReferencePanelTool({
  panel,
  renderBlock,
}: ReferencePanelToolProps): ReactElement | null {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // Focus follows the panel's existence in BOTH directions, and it is an effect
  // rather than two calls at the toggle sites for the reason the calculator
  // slice learned the hard way: the element being focused does not exist until
  // after the render that creates it, so focusing at the call site targets a
  // ref that is still null and silently does nothing.
  const movedRef = useRef(false);
  useEffect(() => {
    if (!movedRef.current) {
      movedRef.current = true;
      return; // first render — do not steal focus from the worksheet
    }
    if (open) panelRef.current?.focus();
    else buttonRef.current?.focus();
  }, [open]);

  // Escape closes, but only if nothing inside already used it. A definition
  // popover opened over a term IN the panel consumes its own Escape, and a
  // student pressing it once expects the popover to close, not the whole panel
  // to vanish underneath it (DECISIONS.md:195 spells this out).
  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key !== 'Escape' || event.defaultPrevented) return;
    event.preventDefault();
    setOpen(false);
  }, []);

  // No blocks, no tool. A panel carrying only a title is not content, and a
  // summon that opens an empty window is worse than no summon.
  const blocks = panel?.blocks ?? [];
  if (blocks.length === 0) return null;

  const heading = panel?.title?.trim() ? panel.title.trim() : 'Reference';

  return (
    <>
      {!open && (
        <div className="tool-corner tool-corner--left">
          <button
            ref={buttonRef}
            type="button"
            className="tool-summon"
            data-tool="reference"
            onClick={() => setOpen(true)}
          >
            {heading}
          </button>
        </div>
      )}
      {open && (
        <div
          ref={panelRef}
          className="viewer-reference-float"
          role="dialog"
          aria-labelledby={titleId}
          aria-modal={false}
          tabIndex={-1}
          onKeyDown={onKeyDown}
        >
          <div className="viewer-reference-float__header">
            <h2 className="viewer-reference-float__title" id={titleId}>
              {heading}
            </h2>
            <button
              type="button"
              className="viewer-reference-float__close"
              aria-label="Close reference"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>
          {/* ALWAYS disabled, not conditionally. Reference material is by
              definition not answerable, and a question block CAN reach a panel:
              ReferencePanelEditor registers the multiple-choice / matching /
              ordering nodes to satisfy its column content schema, so a teacher
              can paste one in. Its answer key no longer ships (the sanitizer
              fix), but its radios still RENDER — and on screen a student could
              answer something that is in no section, so it is never checked and
              never submitted. The fieldset is the viewer's own idiom for this
              and its rationale carries over exactly: the browser disables every
              control inside it, including ones a block type that does not exist
              yet will add. */}
          <fieldset className="viewer-reference-float__body" disabled>
            {blocks.map((block) => (
              <div key={(block as { id: string }).id}>{renderBlock(block)}</div>
            ))}
          </fieldset>
        </div>
      )}
    </>
  );
}

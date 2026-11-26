// =============================================================================
// host-attached.ts — the student mounts' "host left the document" rejection
// -----------------------------------------------------------------------------
// A LEAF on purpose (review D1, 2026-11-26). It lived in graph-question.ts,
// and number-line-question.ts imported it from there, which made every number
// line statically load graph-question and, through formula.ts → evaluate.ts,
// all of mathjs (~44 KiB gz) that a number line never runs. Keep this file
// free of imports so any widget can share it without carrying another's code.
// =============================================================================

/**
 * The STUDENT-side twin of `detachedDuringLoad` (in graph-question.ts). A
 * student mount whose host left the document while the board chunk loaded
 * REJECTS with this named error instead of resolving to an inert handle, on
 * purpose:
 *
 * - The kit cannot tell "the component unmounted" from "the host was only
 *   detached for a moment and the caller still wants a board". The CALLER can:
 *   every viewer block (InteractiveGraph / NumberLine / DataPlot) mounts into a
 *   private per-mount host that only its own cleanup removes, and its
 *   `.catch` already reads its own `cancelled` flag — silent when it cancelled,
 *   `setMountFailed` (a visible fallback) when it did not. Rejecting keeps that
 *   decision with the side that knows; an inert handle would resolve the
 *   not-cancelled case to a blank board with no error and no fallback.
 * - It replaces JSXGraph's "HTML container element … not found" (thrown from
 *   deep inside initBoard, after `container.id` was already minted) with a
 *   rejection that names the actual cause and builds nothing.
 *
 * The editor mounts resolve inert instead: their only reachable cause is a
 * NodeView effect that has already torn down (StrictMode / fast unmount).
 */
export class HostDetachedError extends Error {
  override name = 'HostDetachedError';
  constructor(what: string) {
    super(`${what}: the host element left the document while the board loaded`);
  }
}

/** Throws HostDetachedError when `mount` left the document mid-load. */
export function assertHostAttached(mount: HTMLElement, what: string): void {
  if (!mount.isConnected) throw new HostDetachedError(what);
}

// =============================================================================
// container/ToolCluster.tsx — the summonable tool corner (calculator slice)
// -----------------------------------------------------------------------------
// The student's way back to a tool that has been authored, stored and served
// since S9 Drop 4 without ever reaching a student: `ActivityDocument.calculator`
// was written by three authoring surfaces and read by none. This is the read.
//
// Scaffold semantics, inherited from the design and not re-decided here: never
// scored, no submission, no answer key, no schemaVersion bump. Summoned on
// CLICK, never on presence — a graded block imports its kit because the block
// is on the page; a calculator imports its kit because a student asked for it.
//
// THE THREE STATES ARE ALL NORMAL PATHS. First click pulls MathLive and, in
// graphing mode, JSXGraph — measured at ~515 KiB gz — so on school wifi the
// PENDING state is what a student sees, not an edge case; and offline (the
// viewer's service worker makes reopening a shipped, proven capability) the
// import REJECTS, which until this file had no catch anywhere in the codebase.
// A pending spinner that runs forever is the failure this guards.
//
// Conventions from DECISIONS.md:193-195, inherited: the summon hides while its
// panel is open (they share the corner, and the kit pins itself to the same
// bottom-right); × or Escape closes; focus moves panel -> button on close;
// role="dialog" is NON-modal. The panel's own chrome — drag, resize, Escape,
// the dialog role — belongs to the kit; this component owns only the corner,
// the button, and the lifecycle.
// =============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import {
  calculatorSurface,
  type CalculatorSurfaceHandle,
} from '../blocks/kitSurfaces.js';

export interface ToolClusterProps {
  /** The activity's calculator config, verbatim from the served document.
   * Undefined or disabled renders NOTHING — not a hidden button, not an empty
   * corner. */
  readonly calculator?:
    | { enabled?: boolean; restrictions?: unknown }
    | undefined;
  /** Label + accessible name for the summon. */
  readonly label?: string | undefined;
}

type Status = 'idle' | 'pending' | 'open' | 'failed';

export function ToolCluster({
  calculator,
  label = 'Calculator',
}: ToolClusterProps): ReactElement | null {
  const enabled = calculator?.enabled === true;
  const restrictions = calculator?.restrictions;

  const mountRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const handleRef = useRef<CalculatorSurfaceHandle | null>(null);
  // Mirrors the mount's own lifetime. A ref, not state: the cleanup below runs
  // against whatever the LAST render left here, and a resolved-after-unmount
  // import must be able to see that it is too late.
  const liveRef = useRef(true);
  const [status, setStatus] = useState<Status>('idle');

  // Destroy — not close — belongs to unmount only (C15). Closing keeps the
  // student's in-progress expressions, which is the entire point of a tool
  // they put away and pick back up; destroy() drops the MathLive fields and
  // with them everything typed. This effect is the ONE destroy site.
  useEffect(() => {
    liveRef.current = true;
    return () => {
      liveRef.current = false;
      handleRef.current?.destroy();
      handleRef.current = null;
    };
  }, []);

  // Focus returns to the summon whenever the panel goes away — Escape, ×, or a
  // failed load. Without it, keyboard focus is stranded on a removed element
  // and the next Tab restarts from the top of the worksheet.
  //
  // It is a REQUEST plus an effect, not a direct .focus(), and that split is
  // load-bearing: the kit reports its close through onToggle BEFORE React has
  // re-rendered the button back into the corner, so focusing at the call site
  // targets a ref that is still null and silently does nothing. The flag
  // survives the render; the effect below runs after the button exists.
  const wantFocusRef = useRef(false);
  const requestFocus = useCallback(() => {
    wantFocusRef.current = true;
  }, []);
  useEffect(() => {
    if (!wantFocusRef.current) return;
    const button = buttonRef.current;
    if (!button) return;
    wantFocusRef.current = false;
    button.focus();
  }, [status]);

  const summon = useCallback(async () => {
    // The pending guard is the status itself: the button stays FOCUSABLE while
    // loading (disabled would blur it mid-interaction and drop the keyboard
    // user out of the corner), so it can still be clicked, and this is what
    // makes the second click a no-op rather than a second 515 KiB import.
    if (status === 'pending' || status === 'open') return;

    // Re-open the existing panel: the handle survives close(), so this is the
    // cheap path and the one that preserves the student's work.
    const existing = handleRef.current;
    if (existing) {
      existing.open();
      setStatus('open');
      return;
    }

    const mount = mountRef.current;
    if (!mount) return;
    setStatus('pending');
    try {
      const handle = await calculatorSurface()(mount, restrictions, {
        floating: true,
        // The kit self-closes (× / Escape) without telling anyone else. This
        // hook is how the button learns to come back.
        onToggle: (open: boolean) => {
          if (!liveRef.current) return;
          setStatus(open ? 'open' : 'idle');
          if (!open) requestFocus();
        },
      });
      if (!liveRef.current) {
        // Unmounted mid-load. Destroy the thing we just built rather than
        // installing it into a component that no longer exists — the leak the
        // editor drawer's `cancelled` flag has guarded against since Stage 4.
        handle.destroy();
        return;
      }
      handleRef.current = handle;
      setStatus('open');
    } catch {
      // Offline, a chunk 404 after a deploy, or the kit throwing mid-mount.
      // Stay RETRYABLE: the student's connection may come back, and the rest
      // of the worksheet is untouched either way.
      if (!liveRef.current) return;
      setStatus('failed');
      requestFocus();
    }
  }, [status, restrictions, requestFocus]);

  if (!enabled) return null;

  const pending = status === 'pending';
  return (
    <>
      {/* The corner is a positioned layer; the MOUNT deliberately is not. A
          z-indexed positioned ancestor would create a stacking context and trap
          the kit's fixed panel inside it at the cluster's own level, which is
          BELOW popovers — so the panel hangs off the corner element's sibling
          instead, and only inherits the custom property that tells the kit
          which z-index to take. */}
      <div className="tool-corner" data-tool-cluster>
        {status !== 'open' && (
          <button
            ref={buttonRef}
            type="button"
            className="tool-summon"
            data-tool="calculator"
            aria-busy={pending || undefined}
            onClick={() => {
              void summon();
            }}
          >
            {pending ? `Opening ${label.toLowerCase()}…` : label}
          </button>
        )}
        {status === 'failed' && (
          <p className="tool-summon-note" role="status">
            Calculator unavailable offline — try again when you reconnect.
          </p>
        )}
      </div>
      <div ref={mountRef} className="tool-mount" />
    </>
  );
}

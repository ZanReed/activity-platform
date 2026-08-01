// =============================================================================
// print/PrintButton.tsx — the student's way to get a worksheet on paper (S5 T3)
// -----------------------------------------------------------------------------
// Ruling 7.3A named the completion panel and the chip menu as the entry points
// for printing. Neither exists yet — they belong to the terminal-state (1.1A)
// and sign-out (2.4A) chrome, which land in their own slices — so this sits in
// the top bar that DOES exist (ruling S5-3). When that chrome arrives it calls
// the same action; this is a placement decision, not a competing one.
//
// The button's whole reason to exist over Ctrl+P is the barrier: it waits for
// math, fonts, and images before opening the dialog, which the browser's own
// print command cannot be made to do. A student who uses it gets the page as
// designed; a student who hits Ctrl+P gets the page as it stands, which is why
// every fallback on it is built to be legible.
//
// While waiting, the button says so and disables itself. That matters more than
// it looks: printing feels instant, so a button that appears to do nothing for
// a second reads as broken and gets pressed again — and a second press during
// an open dialog is how you end up with two jobs in the queue.
// =============================================================================

import { useCallback, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { awaitPrintReady, type PrintReadyReport } from './printReadiness.js';

export interface PrintButtonProps {
  /** Test seam: what actually opens the dialog. */
  readonly print?: (() => void) | undefined;
  /** Test seam / observability: called with what the barrier waited on. */
  readonly onReady?: ((report: PrintReadyReport) => void) | undefined;
  readonly timeoutMs?: number | undefined;
  readonly label?: string | undefined;
}

export function PrintButton({
  print,
  onReady,
  timeoutMs,
  label = 'Print',
}: PrintButtonProps): ReactElement {
  const [preparing, setPreparing] = useState(false);
  // Guards the window between the click and the dialog opening. `preparing`
  // drives the DISABLED attribute, but state updates are async and a fast
  // double-click can land two handlers before the first render — the ref is
  // what actually holds the door.
  const busy = useRef(false);

  const handleClick = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    setPreparing(true);
    try {
      const report = await awaitPrintReady(
        timeoutMs === undefined ? {} : { timeoutMs },
      );
      onReady?.(report);
      (print ?? (() => globalThis.print?.()))();
    } finally {
      busy.current = false;
      setPreparing(false);
    }
  }, [print, onReady, timeoutMs]);

  return (
    <button
      type="button"
      className="viewer-print-action"
      data-print-action="true"
      disabled={preparing}
      // The state is announced, not just shown: the wait is the whole point of
      // this control, and a screen-reader user gets no visual cue that it is
      // working.
      aria-live="polite"
      onClick={() => {
        void handleClick();
      }}
    >
      {preparing ? 'Preparing…' : label}
    </button>
  );
}

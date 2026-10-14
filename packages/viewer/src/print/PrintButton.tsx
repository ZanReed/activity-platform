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
import { VISUALLY_HIDDEN } from '../blocks/canvasChrome.js';

export interface PrintButtonProps {
  /** Test seam: what actually opens the dialog. */
  readonly print?: (() => void) | undefined;
  /** Test seam / observability: called with what the barrier waited on. */
  readonly onReady?: ((report: PrintReadyReport) => void) | undefined;
  readonly timeoutMs?: number | undefined;
  readonly label?: string | undefined;
  /** A printer icon instead of the word, for the student top bar (student
   *  review S6, 2026-10-14). The word stays in the accessible name and in the
   *  aria-live text, so "Preparing…" is still announced. */
  readonly iconOnly?: boolean | undefined;
}

// Lucide's "printer" (ISC), inlined: the viewer package carries no icon
// library, and one glyph does not justify adding one.
function PrinterIcon(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
      <rect x="6" y="14" width="12" height="8" rx="1" />
    </svg>
  );
}

export function PrintButton({
  print,
  onReady,
  timeoutMs,
  label = 'Print',
  iconOnly = false,
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
      className={iconOnly ? 'viewer-print-action viewer-print-action--icon' : 'viewer-print-action'}
      title={iconOnly ? label : undefined}
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
      {iconOnly ? (
        <>
          <PrinterIcon />
          <span style={VISUALLY_HIDDEN}>{preparing ? 'Preparing…' : label}</span>
        </>
      ) : preparing ? (
        'Preparing…'
      ) : (
        label
      )}
    </button>
  );
}

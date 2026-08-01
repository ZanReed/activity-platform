// =============================================================================
// print/printReadiness.ts — don't open the print dialog on a half-built page
// -----------------------------------------------------------------------------
// A worksheet is assembled progressively: KaTeX arrives as a lazy chunk, web
// fonts load, images come off Supabase Storage. Print at the wrong moment and
// the paper records that moment — raw LaTeX where an equation belongs, fallback
// type, an empty box where a diagram should be. Paper has no second render.
//
// WHAT WE CAN AND CANNOT CONTROL (ruling S5-2, amended by OV5). Our own Print
// control can wait, and this is what it waits on. The browser's File > Print
// and Ctrl+P cannot: `beforeprint` is synchronous and the dialog opens
// regardless, so there is no hook to hold. That residual is accepted and
// documented rather than papered over — every fallback on the page is designed
// to be legible precisely because it might be what prints (readable LaTeX, alt
// text, a bordered empty figure). The escalation trigger lives in TODOS.md,
// keyed to S8's chunk measurements.
//
// WHY IT WAITS ON THE DOM, NOT ON PROMISES. The first version of this waited
// for `loadMathRenderer()` to resolve, which is a lie by one tick: the engine
// being resident does not mean React has re-rendered the equations with it.
// The observable truth is the absence of `[data-math-pending]` markers, so that
// is what this polls. Same lesson as the S4 test double — assert the real
// state, not a proxy that usually agrees with it.
//
// ONE waiting mechanism, used three times. An earlier draft raced fonts and
// images against a `sleep(remaining)` timer instead, which is subtly wrong:
// the losing arm of a race still consumed the whole budget on the clock, so
// whichever check ran last got none of it. Polling one predicate to a shared
// deadline has no such interaction, and it made the tests honest — the bug
// showed up as images timing out for no visible reason.
//
// EVERYTHING IS BOUNDED. One dead image on a school network must not hang a
// print dialog forever; a student who cannot print is worse off than one whose
// printout is missing a figure. On timeout we print anyway and report what did
// not settle, so the failure is visible rather than silent.
// =============================================================================

import { loadMathRenderer, residentMathRenderer } from '../inline/math.js';

/** What the barrier waited on, and what it gave up on. */
export interface PrintReadyReport {
  /** True when everything settled inside the budget. */
  readonly ready: boolean;
  /** Things that were pending and did settle. */
  readonly waited: readonly string[];
  /** Things still pending when the budget ran out — printed anyway. */
  readonly timedOut: readonly string[];
}

export interface PrintReadyOptions {
  /** Where to look for math and images. Defaults to the whole document. */
  readonly root?: ParentNode | undefined;
  /**
   * Total budget. 2s is chosen to be longer than a lazy chunk on a slow school
   * connection and shorter than a student's patience with a button that looks
   * broken — not a measured constant, and worth revisiting with S8's numbers.
   */
  readonly timeoutMs?: number | undefined;
  /** Test seam: how to wait a tick. */
  readonly sleep?: ((ms: number) => Promise<void>) | undefined;
  /** Test seam: the clock. */
  readonly now?: (() => number) | undefined;
}

const DEFAULT_TIMEOUT_MS = 2000;
const POLL_MS = 16;

const defaultSleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

/** Poll until `settled()` or the deadline. Returns whether it settled. */
async function until(
  settled: () => boolean,
  deadline: number,
  now: () => number,
  sleep: (ms: number) => Promise<void>,
): Promise<boolean> {
  while (!settled()) {
    if (now() >= deadline) return false;
    await sleep(POLL_MS);
  }
  return true;
}

/**
 * Wait for the page to be worth printing.
 *
 * Resolves when lazy math has rendered, web fonts are ready, and every image
 * has loaded or failed — or when the budget expires, whichever comes first. It
 * never rejects: a barrier that could throw would be a barrier that could stop
 * a student printing at all.
 */
export async function awaitPrintReady(
  options: PrintReadyOptions = {},
): Promise<PrintReadyReport> {
  const root = options.root ?? (typeof document === 'undefined' ? null : document);
  const now = options.now ?? (() => Date.now());
  const sleep = options.sleep ?? defaultSleep;
  const deadline = now() + (options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  const waited: string[] = [];
  const timedOut: string[] = [];

  if (!root) return { ready: true, waited, timedOut };

  // ---- Math -----------------------------------------------------------------
  // The pending marker is what InlineContent renders while the chunk is in
  // flight. If any exists, pull the chunk in (rather than hoping something else
  // does) and then wait for the markers to actually clear.
  const mathPending = () => root.querySelectorAll('[data-math-pending]').length > 0;
  if (mathPending()) {
    waited.push('math');
    if (!residentMathRenderer()) {
      try {
        await loadMathRenderer();
      } catch {
        // A chunk that will not load is exactly when the readable-LaTeX
        // fallback earns its place. Nothing to do but print it.
      }
    }
    if (!(await until(() => !mathPending(), deadline, now, sleep))) {
      timedOut.push('math');
    }
  }

  // ---- Fonts ----------------------------------------------------------------
  // A worksheet in fallback type is not wrong, but it is not what the teacher
  // chose, and a font swapping in after layout also moves where the page breaks
  // fall. Polled via `status` rather than awaited via `ready`, for the reason
  // in the note below.
  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
  if (fonts && fonts.status !== 'loaded') {
    waited.push('fonts');
    if (!(await until(() => fonts.status === 'loaded', deadline, now, sleep))) {
      timedOut.push('fonts');
    }
  }

  // ---- Images ---------------------------------------------------------------
  // The classic blank-box failure, and the likeliest of the three: a diagram
  // still in flight from Storage prints as nothing at all.
  //
  // `complete` is the whole check — it goes true when the download finishes OR
  // fails, so a broken image settles instead of holding the budget. That is
  // also why this polls rather than listening: a load/error listener attached
  // now misses an event that already fired, and needs a `complete` check
  // beside it anyway.
  const pendingImages = Array.from(root.querySelectorAll('img')).filter(
    (img) => !img.complete,
  );
  if (pendingImages.length > 0) {
    waited.push('images');
    const settled = () => pendingImages.every((img) => img.complete);
    if (!(await until(settled, deadline, now, sleep))) {
      timedOut.push('images');
    }
  }

  return { ready: timedOut.length === 0, waited, timedOut };
}

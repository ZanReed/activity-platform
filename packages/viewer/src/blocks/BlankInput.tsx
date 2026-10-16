// =============================================================================
// blocks/BlankInput.tsx — the one blank input, for sentences AND table cells
// -----------------------------------------------------------------------------
// FillInBlank and Table each rendered their own copy of this <input> until the
// superscript arc (docs/design/superscript-units.md, eng D2): a feature added
// to one copy was missing from the other, the repo's orphan class. Both now
// render this component and keep only what differs (their aria-label, the
// sub-part letter, the feedback line).
//
// What it adds: a ² ³ tray while focus is inside an EDITABLE blank (SU-3,
// widened to text blanks by D6). A student on a phone or Chromebook cannot
// easily type ², so an answer like "28 m²" looked impossible.
//
// The tray's code is NOT in this file. The student shell sat past its stop
// line when this landed (157.0 of a 156.5 KiB gz stop line, cap 158), so the
// author ruled it lazy: the placement and keys live in SuperscriptTray.tsx,
// fetched in the background the first time an editable blank mounts, and used
// on first focus. Offline with the chunk never fetched there is no tray, and
// nothing else changes: grading accepts m2 and m^2 (SU-1, D7). A failed fetch
// is NOT retried within the page: Chromium caches a failed dynamic import for
// the document's life (measured 2026-10-17, one request across two focuses),
// so clearing our own promise cannot cause a re-download. A reload does.
//
// Focus model (D3 + DR-2): the tray stays while focus is anywhere inside the
// field, so Tab can walk input → ² → ³. Everything else (placement, the keys,
// inserting at the caret) lives in the lazy chunk; this file is only what
// every blank needs on first paint.
// =============================================================================

import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FocusEvent } from 'react';
import type { ItemVerdict } from '../check/wire.js';

type TrayModule = typeof import('./SuperscriptTray.js');

let trayModule: TrayModule | null = null;
let trayLoad: Promise<TrayModule> | null = null;

function loadTray(): Promise<TrayModule> {
  trayLoad ??= import('./SuperscriptTray.js').then((m) => (trayModule = m));
  return trayLoad;
}

/** Fetch the tray chunk once, off the critical path, so it is in the service
 * worker's cache before the student needs it (and survives going offline). */
function prefetchTray(): void {
  if (trayLoad) return;
  const start = () => void loadTray().catch(() => (trayLoad = null));
  const idle = (globalThis as { requestIdleCallback?: (cb: () => void) => void })
    .requestIdleCallback;
  if (idle) idle(start);
  else setTimeout(start, 1);
}

/** Exposed for tests: the chunk's promise, so a test can await it. */
export const loadSuperscriptTray = loadTray;

export interface BlankInputProps {
  blankId: string;
  value: string;
  readOnly: boolean;
  ariaLabel: string;
  size: number | undefined;
  verdict?: ItemVerdict | undefined;
  answerKeyFilled: boolean;
  onChange: (value: string) => void;
}

export function BlankInput({
  blankId,
  value,
  readOnly,
  ariaLabel,
  size,
  verdict,
  answerKeyFilled,
  onChange,
}: BlankInputProps) {
  const fieldRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [, setLoaded] = useState(trayModule !== null);

  const editable = !readOnly;
  const hintId = `${blankId}-superscript-hint`;

  useEffect(() => {
    if (editable) prefetchTray();
  }, [editable]);

  useEffect(() => {
    if (!open || trayModule) return;
    let live = true;
    loadTray().then(
      () => live && setLoaded(true),
      () => undefined, // offline, never fetched: no tray, typing still works
    );
    return () => {
      live = false;
    };
  }, [open]);

  const onFocus = () => {
    if (editable) setOpen(true);
  };
  const onBlur = (event: FocusEvent<HTMLSpanElement>) => {
    const next = event.relatedTarget as Node | null;
    // Still inside (input ↔ keys): stay open. jsdom batches the blur and the
    // focus into one update and cannot see this; in Chromium, removing it loses
    // focus on Tab (blank-superscript.e2e.ts, the D3 row, mutation-tested).
    if (next && fieldRef.current?.contains(next)) return;
    setOpen(false);
  };

  // Only an editable blank ever opens (onFocus), so open alone gates the tray.
  const Tray = open ? trayModule?.SuperscriptTray : undefined;

  return (
    <span className="viewer-blank__field" ref={fieldRef} onFocus={onFocus} onBlur={onBlur}>
      <input
        ref={inputRef}
        type="text"
        className="viewer-blank__input"
        value={value}
        // A keyed value is never editable: typing over it would leave the
        // printed key silently disagreeing with itself.
        readOnly={readOnly}
        aria-label={ariaLabel}
        {...(editable ? { 'aria-describedby': hintId } : {})}
        {...(answerKeyFilled ? { 'data-answer-key': 'filled' } : {})}
        size={size}
        {...(verdict ? { 'data-verdict': verdict, 'aria-invalid': verdict === 'incorrect' } : {})}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
      />
      {editable ? (
        // DR-5: a screen reader learns the keys exist the first time it lands
        // here, instead of only by tabbing on.
        <span id={hintId} className="viewer-visually-hidden">
          Squared and cubed keys follow.
        </span>
      ) : null}
      {Tray ? <Tray fieldRef={fieldRef} inputRef={inputRef} onChange={onChange} /> : null}
    </span>
  );
}

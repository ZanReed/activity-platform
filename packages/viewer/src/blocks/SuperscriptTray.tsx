// =============================================================================
// blocks/SuperscriptTray.tsx — the ² ³ keys beside a focused blank (LAZY chunk)
// -----------------------------------------------------------------------------
// Loaded by BlankInput on demand (the shell is past its stop line; see that
// file's header). Rulings, all in docs/design/superscript-units.md:
//
//   DR-1  BESIDE the input on the same line, vertically centred on it. Below
//         is where the blank's own feedback line ("write the unit, m²") and a
//         stacked blank live, so below is only a fallback.
//   D5    no room → the next position, measured against the nearest clipping
//         box (a table's scroll box clips BOTH axes once overflow-x is set)
//         AND the visual viewport (a phone keyboard). Re-measured while open,
//         because the keyboard opens AFTER focus.
//   DR-6  a position that would cover another blank's input is skipped: 42
//         catalogue lines put two blanks almost touching, e.g. "(x, y)".
//   DR-2  a pointer press never takes focus (preventDefault), so the phone
//         keyboard stays up and BlankInput uses the live caret.
//   DR-3  quiet look from existing tokens; the key face is aria-hidden and the
//         button carries the name. The face draws a small box with the digit
//         RAISED AT FULL SIZE: a ² glyph renders at ~60% of a digit and read as
//         a speck on a 44 px key (author, 2026-10-16, from the first screenshots).
//
// Order tried: beside → below → above; if none is clear, below. "Beside"
// starts after the blank's verdict mark (✗/✓) when that mark is on the same
// line, so the tray never hides it after a check.
//
// PHONES (≤ 480 px, author 2026-10-16): any tray in the text flow is taller
// than a line (44 px keys) and covers the lines above and below. There the
// tray DOCKS instead: fixed at the bottom of the visible screen, right-aligned,
// above the sticky Check bar and the on-screen keyboard, the place a phone
// keyboard's own accessory row sits. If the blank would end up behind the
// dock, the page scrolls just enough to keep it visible.
// =============================================================================

import { useLayoutEffect, useRef, useState } from 'react';
import type { PointerEvent, RefObject } from 'react';

export type TrayPlacement = 'beside' | 'below' | 'above' | 'dock';

const KEYS = [
  { glyph: '²', digit: '2', label: 'Insert squared' },
  { glyph: '³', digit: '3', label: 'Insert cubed' },
] as const;

/** Gap between the input (and its focus ring) and the tray, in px. */
const GAP = 6;

interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

function overlaps(a: Box, b: Box): boolean {
  return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
}

function inside(a: Box, clip: Box): boolean {
  return a.left >= clip.left && a.right <= clip.right && a.top >= clip.top && a.bottom <= clip.bottom;
}

/** The visible region: the visual viewport, cut down by every ancestor that
 * clips (overflow other than visible). */
function clipBoxFor(el: Element): Box {
  const vv = globalThis.visualViewport;
  let box: Box = vv
    ? { left: vv.offsetLeft, top: vv.offsetTop, right: vv.offsetLeft + vv.width, bottom: vv.offsetTop + vv.height }
    : { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };
  for (let node = el.parentElement; node; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (style.overflowX !== 'visible' || style.overflowY !== 'visible') {
      const r = node.getBoundingClientRect();
      box = {
        left: Math.max(box.left, r.left),
        top: Math.max(box.top, r.top),
        right: Math.min(box.right, r.right),
        bottom: Math.min(box.bottom, r.bottom),
      };
    }
  }
  return box;
}

/**
 * Pure placement: where the tray goes, and the horizontal nudge that keeps it
 * inside the clip box. Exported for tests (jsdom has no layout, so the
 * component test feeds rectangles here and through mocked rects).
 */
export function chooseTrayPlacement(
  input: Box,
  tray: { width: number; height: number },
  clip: Box,
  others: readonly Box[],
  besideFrom: number = input.right,
): { placement: TrayPlacement; shiftX: number } {
  const midY = (input.top + input.bottom) / 2;
  const candidates: Array<{ placement: TrayPlacement; box: Box }> = [
    {
      placement: 'beside',
      box: {
        left: besideFrom + GAP,
        right: besideFrom + GAP + tray.width,
        top: midY - tray.height / 2,
        bottom: midY + tray.height / 2,
      },
    },
    {
      placement: 'below',
      box: { left: input.left, right: input.left + tray.width, top: input.bottom + GAP, bottom: input.bottom + GAP + tray.height },
    },
    {
      placement: 'above',
      box: { left: input.left, right: input.left + tray.width, top: input.top - GAP - tray.height, bottom: input.top - GAP },
    },
  ];
  // Below and above may slide left to stay inside the clip box; beside may not
  // (sliding it left would put it on top of its own input).
  const clamp = (box: Box) => {
    let shift = 0;
    if (box.right > clip.right) shift = clip.right - box.right;
    if (box.left + shift < clip.left) shift = clip.left - box.left;
    return shift;
  };
  for (const { placement, box } of candidates) {
    const shiftX = placement === 'beside' ? 0 : clamp(box);
    const moved = { ...box, left: box.left + shiftX, right: box.right + shiftX };
    if (inside(moved, clip) && !others.some((o) => overlaps(moved, o))) {
      return { placement, shiftX };
    }
  }
  const below = candidates[1]!.box;
  return { placement: 'below', shiftX: clamp(below) };
}

/** Phones dock below this width (the viewer's phone breakpoint). */
export const DOCK_MAX_WIDTH = 480;

/**
 * Pure dock layout, in layout-viewport px. `visibleBottom` is the bottom of
 * the visual viewport (the keyboard's top when it is open); `barTop` is the
 * top of a sticky Check bar showing at the bottom, if any. Returns the CSS
 * `bottom` for the fixed tray and how far to scroll so the blank is not
 * hidden behind it (0 when it is clear).
 */
export function dockLayout(m: {
  innerHeight: number;
  visibleBottom: number;
  barTop: number | null;
  inputBottom: number;
  trayHeight: number;
}): { bottom: number; scrollBy: number } {
  const floor = Math.min(m.visibleBottom, m.barTop ?? Infinity);
  const bottom = m.innerHeight - floor + GAP;
  const trayTop = floor - GAP - m.trayHeight;
  const scrollBy = Math.max(0, Math.ceil(m.inputBottom + GAP - trayTop));
  return { bottom, scrollBy };
}

interface Place {
  placement: TrayPlacement;
  shiftX: number;
  /** beside: `left` in px from the field; dock: `bottom` in px. */
  offset: number | null;
}

export interface SuperscriptTrayProps {
  fieldRef: RefObject<HTMLSpanElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
  onChange: (value: string) => void;
}

export function SuperscriptTray({ fieldRef, inputRef, onChange }: SuperscriptTrayProps) {
  const trayRef = useRef<HTMLSpanElement>(null);
  // Where the caret goes once the store has re-rendered the new value.
  const pendingCaret = useRef<number | null>(null);

  useLayoutEffect(() => {
    const at = pendingCaret.current;
    const input = inputRef.current;
    if (at === null || !input) return;
    pendingCaret.current = null;
    input.setSelectionRange(at, at);
  });

  // Insert at the input's own selection. An input keeps its selection when it
  // loses focus, so this is right for both paths: a POINTER press never took
  // focus (keepFocus below), and a KEYBOARD press on a key that Tab reached
  // still finds the caret where the student left it, then hands focus back (D3).
  const insert = (glyph: string) => {
    const input = inputRef.current;
    if (!input) return;
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    pendingCaret.current = start + glyph.length;
    onChange(input.value.slice(0, start) + glyph + input.value.slice(end));
    if (document.activeElement !== input) input.focus();
  };
  const [place, setPlace] = useState<Place>({ placement: 'beside', shiftX: 0, offset: null });

  const commit = (next: Place) =>
    setPlace((prev) =>
      prev.placement === next.placement && prev.shiftX === next.shiftX && prev.offset === next.offset
        ? prev
        : next,
    );

  useLayoutEffect(() => {
    const measure = () => {
      const input = inputRef.current;
      const tray = trayRef.current;
      const field = fieldRef.current;
      if (!input || !tray || !field) return;
      const t = tray.getBoundingClientRect();
      const i = input.getBoundingClientRect();
      const vv = globalThis.visualViewport;

      if (window.innerWidth <= DOCK_MAX_WIDTH) {
        const visibleBottom = vv ? vv.offsetTop + vv.height : window.innerHeight;
        const bar = Array.from(document.querySelectorAll('.viewer-check-group__footer'))
          .map((el) => el.getBoundingClientRect())
          .find((r) => r.height > 0 && r.top < visibleBottom && r.bottom >= visibleBottom - 1);
        const dock = dockLayout({
          innerHeight: window.innerHeight,
          visibleBottom,
          barTop: bar ? bar.top : null,
          inputBottom: i.bottom,
          trayHeight: t.height,
        });
        if (dock.scrollBy > 0) window.scrollBy(0, dock.scrollBy);
        commit({ placement: 'dock', shiftX: 0, offset: dock.bottom });
        return;
      }

      const block = field.closest('[data-block-id]') ?? document.body;
      const others = Array.from(block.querySelectorAll<HTMLInputElement>('.viewer-blank__input'))
        .filter((el) => el !== input && !el.readOnly)
        .map((el) => el.getBoundingClientRect());
      // The verdict mark (✗/✓) follows the field inside the same blank; when
      // it sits on the input's line, beside starts after it.
      const pill = field.parentElement?.querySelector(':scope > .viewer-state-pill');
      const p = pill?.getBoundingClientRect();
      const besideFrom = p && p.top < i.bottom && p.bottom > i.top ? Math.max(i.right, p.right) : i.right;
      const next = chooseTrayPlacement(i, { width: t.width, height: t.height }, clipBoxFor(field), others, besideFrom);
      const f = field.getBoundingClientRect();
      commit({ ...next, offset: next.placement === 'beside' ? besideFrom - f.left + GAP : null });
    };
    measure();
    const vv = globalThis.visualViewport;
    vv?.addEventListener('resize', measure);
    vv?.addEventListener('scroll', measure);
    window.addEventListener('resize', measure);
    return () => {
      vv?.removeEventListener('resize', measure);
      vv?.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [fieldRef, inputRef]);

  // DR-2: a pointer press must not move focus off the input.
  const keepFocus = (event: PointerEvent<HTMLButtonElement>) => event.preventDefault();

  return (
    <span
      ref={trayRef}
      className="viewer-blank__tray"
      data-placement={place.placement}
      style={{
        ...(place.shiftX ? { translate: `${place.shiftX}px 0` } : {}),
        ...(place.offset !== null
          ? place.placement === 'dock'
            ? { bottom: `${place.offset}px` }
            : { left: `${place.offset}px` }
          : {}),
      }}
    >
      {KEYS.map((key) => (
        <button
          key={key.glyph}
          type="button"
          className="viewer-blank__tray-key"
          aria-label={key.label}
          onPointerDown={keepFocus}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => insert(key.glyph)}
        >
          <span className="viewer-blank__tray-face" aria-hidden="true">
            <span className="viewer-blank__tray-base" />
            <span className="viewer-blank__tray-exp">{key.digit}</span>
          </span>
        </button>
      ))}
    </span>
  );
}

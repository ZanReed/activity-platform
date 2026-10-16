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
//   DR-3  quiet look from existing tokens; the glyph is aria-hidden and the
//         button carries the name.
//
// Order tried: beside → below → above; if none is clear, below.
// =============================================================================

import { useLayoutEffect, useRef, useState } from 'react';
import type { PointerEvent, RefObject } from 'react';

export type TrayPlacement = 'beside' | 'below' | 'above';

const KEYS = [
  { glyph: '²', label: 'Insert squared' },
  { glyph: '³', label: 'Insert cubed' },
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
): { placement: TrayPlacement; shiftX: number } {
  const midY = (input.top + input.bottom) / 2;
  const candidates: Array<{ placement: TrayPlacement; box: Box }> = [
    {
      placement: 'beside',
      box: {
        left: input.right + GAP,
        right: input.right + GAP + tray.width,
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
  const [place, setPlace] = useState<{ placement: TrayPlacement; shiftX: number }>({
    placement: 'beside',
    shiftX: 0,
  });

  useLayoutEffect(() => {
    const measure = () => {
      const input = inputRef.current;
      const tray = trayRef.current;
      const field = fieldRef.current;
      if (!input || !tray || !field) return;
      const block = field.closest('[data-block-id]') ?? document.body;
      const others = Array.from(block.querySelectorAll<HTMLInputElement>('.viewer-blank__input'))
        .filter((el) => el !== input && !el.readOnly)
        .map((el) => el.getBoundingClientRect());
      const t = tray.getBoundingClientRect();
      const next = chooseTrayPlacement(
        input.getBoundingClientRect(),
        { width: t.width, height: t.height },
        clipBoxFor(field),
        others,
      );
      setPlace((prev) =>
        prev.placement === next.placement && prev.shiftX === next.shiftX ? prev : next,
      );
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
      style={place.shiftX ? { translate: `${place.shiftX}px 0` } : undefined}
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
          <span aria-hidden="true">{key.glyph}</span>
        </button>
      ))}
    </span>
  );
}

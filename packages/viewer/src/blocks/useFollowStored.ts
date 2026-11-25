// =============================================================================
// blocks/useFollowStored.ts — a mounted widget follows the store (2026-11-26)
// -----------------------------------------------------------------------------
// The canvas blocks and the maths gaps mount an imperative widget that owns its
// own state once it is up. They used to read the store ONCE, at first render,
// and never again. Three paths change a block's answer after that render: the
// server restore and the tab-lock hand-back (both `store.hydrate`, in the app's
// StudentViewer) and a DoL form start (`store.startDolForm`, which clears the
// section). Text blanks are controlled inputs and followed all three; boards
// and maths fields did not, so a restored section could show a verdict over an
// empty board.
//
// The rule here: remember what the widget is SHOWING (the value it was seeded
// with, or the last value it reported), and when the store's value stops
// matching that, the change came from outside, so bump `generation`. A block
// puts `generation` in its mount effect's dependencies, so the widget is torn
// down and mounted again from the stored value.
//
// Why remount rather than restore in place: a kit's restore can only ADD
// state (it can set "no solution" but never clear it, set a shape but never
// unset one), so restoring over a board the student has touched can leave it
// showing a mix of the two. A fresh mount shows exactly the stored work, which
// is the only thing worth guaranteeing. External changes are rare (once per
// page load, at most), so the cost of a remount is not on any hot path.
//
// No loop: the block calls `noteReported` BEFORE writing to the store, so the
// write it makes compares equal and changes nothing. Equality is structural
// (`hydrate` structured-clones every answer, so identity would remount every
// board on the page).
// =============================================================================

import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { useResponses } from '../container/context.js';

export interface FollowStored<T> {
  /** Moves when the store changed under the widget. A mount-effect dep. */
  generation: number;
  /** What the widget shows: read it to seed a (re)mount. */
  shown: MutableRefObject<T>;
  /** Record a value the widget itself reported, before storing it. */
  noteReported(value: T): void;
}

export function useFollowStored<T>(stored: T): FollowStored<T> {
  const shown = useRef(stored);
  const [generation, setGeneration] = useState(0);
  useEffect(() => {
    if (sameValue(stored, shown.current)) return;
    shown.current = stored;
    setGeneration((g) => g + 1);
  }, [stored]);
  return {
    generation,
    shown,
    noteReported: (value) => {
      shown.current = value;
    },
  };
}

/** The maths gaps' form: one stored string per prompt id, '' when empty. */
export function useFollowedBlanks(
  ids: readonly string[],
): FollowStored<Record<string, string>> {
  const values = useResponses('blanks', ids);
  const key = ids.join(' ');
  const record = useMemo(
    () => Object.fromEntries(ids.map((id, i) => [id, values[i] ?? ''])),
    // `values` is already compared by item (useResponses); `key` covers ids.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values, key],
  );
  return useFollowStored(record);
}

/** Structural equality over JSON-shaped values. An `undefined` property counts
 * as absent, the way it does once a value has been through JSON. */
export function sameValue(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
    return false;
  }
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => sameValue(v, b[i]));
  }
  const ra = a as Record<string, unknown>;
  const rb = b as Record<string, unknown>;
  const keys = new Set([...Object.keys(ra), ...Object.keys(rb)]);
  for (const k of keys) if (!sameValue(ra[k], rb[k])) return false;
  return true;
}

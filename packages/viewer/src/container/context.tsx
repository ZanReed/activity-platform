// =============================================================================
// container/context.tsx — the store seam components consume (S3 V5)
// -----------------------------------------------------------------------------
// BlockComponentProps stays minimal (block + mode) exactly as S0 declared it;
// everything a component needs from the running worksheet — its current
// response value, its post-check verdict, whether its section has been checked
// — arrives through this context instead. Two reasons over prop drilling:
//
//   - The container would otherwise need per-TYPE wiring knowledge (which
//     response category each block writes to), re-centralizing the thing the
//     registry exists to distribute.
//   - Components stay independently renderable in tests and in /dev/viewer:
//     wrap in <ViewerProvider> with a mock-backed store and the component is
//     live, no container required.
//
// Lookups are by ITEM ID (blank id, block id) because that is the wire's unit
// (R1: id-keyed, never positional) — a component asks "what happened to item
// X", never "what happened to the third thing in my section".
// =============================================================================

import { createContext, useContext, useMemo, useRef, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import type { CheckItemResult, ReleasedBlockFeedback, SectionResponses } from '../check/wire.js';
import type { SanitizedInlineNode } from '../sanitize/sanitized-types.js';
import type { SectionStatus } from '../store/persistence.js';
import type { ViewerStore, ViewerStoreState } from '../store/store.js';

/**
 * 'pending' is a queued check waiting on the network (S6). It joins the phase
 * vocabulary rather than collapsing into 'checking' because the two mean
 * different things to a student: 'checking' is "wait a moment", 'pending' is
 * "put this down and come back". StatePill has carried the pending copy since
 * S3; this is the phase that finally produces it.
 */
export type BlockPhase =
  | 'unchecked'
  | 'checking'
  | 'pending'
  | 'checked'
  | 'error';

export interface ViewerContextValue {
  /** The running worksheet's store. Stable for the life of the worksheet. */
  store: ViewerStore;
  /** Section owning a block — supplied by the container's index. */
  sectionOf(blockId: string): string | undefined;
  /** sectionId → every section its CHECK GROUP covers (R1/OV#14). */
  groupOf(sectionId: string): string[] | undefined;
}

// WHAT CHANGED, AND WHY (efficiency audit 2026-10 #5, decisions 1–8 ruled
// 2026-10-18). This context used to carry the whole store `state`, rebuilt on
// every change, so one keystroke in one blank re-rendered every block on the
// page (60 of 60 on a 60-block worksheet). It now carries only what never
// changes while a worksheet is open; anything that changes is read through
// useViewerSelector and the hooks below, so a block re-renders only when the
// piece IT reads changes. tests/components/render-scope.test.tsx pins it.
// ⚠ Do not add `state` back here, or a "convenience" hook that returns it:
// either one silently brings back the whole-page re-render.
// The hooks are deliberately PACKAGE-PRIVATE (not in index.ts): every block
// component lives in this package, and the app reads none of them. Export them
// when an outside caller exists, not before (P1).

const ViewerContext = createContext<ViewerContextValue | null>(null);

export interface ViewerProviderProps {
  store: ViewerStore;
  /** blockId → sectionId. The container passes its index; tests can pass a
   * literal map (or omit it for a single-section harness). */
  sectionByBlock?: Record<string, string>;
  /**
   * sectionId → every section its CHECK GROUP covers (R1/OV#14). Omitted means
   * "each section is its own group", which is what a single-section harness
   * and /dev/viewer want and is exactly the pre-slice behaviour.
   */
  groupSections?: Record<string, string[]>;
  /** Fallback section for blocks absent from the map — the single-section
   * case tests and /dev/viewer use. */
  defaultSectionId?: string;
  children: ReactNode;
}

const NO_SECTIONS: Record<string, string> = {};
const NO_GROUPS: Record<string, string[]> = {};

export function ViewerProvider({
  store,
  sectionByBlock = NO_SECTIONS,
  groupSections = NO_GROUPS,
  defaultSectionId,
  children,
}: ViewerProviderProps) {
  const value = useMemo<ViewerContextValue>(
    () => ({
      store,
      sectionOf: (blockId) => sectionByBlock[blockId] ?? defaultSectionId,
      groupOf: (sectionId) => groupSections[sectionId],
    }),
    [store, sectionByBlock, groupSections, defaultSectionId],
  );

  return <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>;
}

/** Components call this. Throws rather than returning null: a block rendered
 * outside a provider is a wiring bug, and a silent no-op would show a
 * permanently inert question to a student. */
export function useViewer(): ViewerContextValue {
  const value = useContext(ViewerContext);
  if (!value) {
    throw new Error(
      'useViewer must be used inside <ViewerProvider> (the container provides it).',
    );
  }
  return value;
}

/**
 * Read one piece of the store and re-render only when THAT piece changes.
 * `isEqual` lets a selector that builds a value (an array of blank values)
 * keep its previous result when nothing in it changed — without it a fresh
 * array every read would re-render on every store change.
 *
 * ⚠ Pass `select` INLINE (a new function each render). The cached value is
 * reused while both the state and the `select` function are unchanged, so a
 * memoised selector whose inputs change without a store commit (a
 * `useCallback` missing a dep) would keep returning the old answer.
 */
export function useViewerSelector<T>(
  select: (state: ViewerStoreState) => T,
  isEqual: (a: T, b: T) => boolean = Object.is,
): T {
  const { store } = useViewer();
  const cache = useRef<{ state: ViewerStoreState; select: unknown; value: T } | null>(null);
  const read = () => {
    const state = store.getState();
    const prev = cache.current;
    if (prev && prev.state === state && prev.select === select) return prev.value;
    const next = select(state);
    const value = prev && isEqual(prev.value, next) ? prev.value : next;
    cache.current = { state, select, value };
    return value;
  };
  return useSyncExternalStore(store.subscribe, read, read);
}

/**
 * A blank's value from the values read for `blankIds`. A blank the renderer
 * draws but `blankIds` does not list cannot happen today (both walk the same
 * flat content); if it ever does, read the store directly rather than showing
 * the student an empty box — a silent empty is exactly how an answer goes
 * missing. (No log: the shell budget has no room for the string.)
 */
export function blankValueAt(
  values: readonly (string | undefined)[],
  index: number,
  blankId: string,
  store: ViewerStore,
): string | undefined {
  return index >= 0 ? values[index] : store.getState().responses.blanks[blankId];
}

/** Two arrays with the same items, by identity, in the same order. */
export function sameItems<T>(a: readonly T[], b: readonly T[]): boolean {
  return a.length === b.length && a.every((x, i) => Object.is(x, b[i]));
}

// ---- the per-question hooks -------------------------------------------------
// Pure readers first (shared by the hooks and by anything holding a state
// snapshot), then the hooks. Every reader returns a primitive or an object that
// already lives in the state, so its identity changes only when it does.

function statusIn(
  state: ViewerStoreState,
  sectionId: string | undefined,
): SectionStatus | undefined {
  return sectionId ? state.sections[sectionId] : undefined;
}

/** Where the block's section is in the check cycle. */
export function useBlockPhase(blockId: string): BlockPhase {
  const { sectionOf } = useViewer();
  return useViewerSelector((s) => statusIn(s, sectionOf(blockId))?.phase ?? 'unchecked');
}

/**
 * The server's verdicts for the block's section, once it has been checked —
 * look an item up with `items?.[itemId ?? blockId]`.
 */
export function useCheckedItems(
  blockId: string,
): Record<string, CheckItemResult> | undefined {
  const { sectionOf } = useViewer();
  return useViewerSelector((s) => {
    const status = statusIn(s, sectionOf(blockId));
    return status?.phase === 'checked' ? status.result.items : undefined;
  });
}

/** The server's verdict for one item (default: the block itself). */
export function useItemResult(blockId: string, itemId?: string): CheckItemResult | undefined {
  return useCheckedItems(blockId)?.[itemId ?? blockId];
}

/** Solution content the server released for a block after its check. */
export function useBlockSolution(blockId: string): SanitizedInlineNode[] | undefined {
  const { sectionOf, groupOf } = useViewer();
  return useViewerSelector((s) => {
    const sectionId = sectionOf(blockId);
    const status = statusIn(s, sectionId);
    if (status?.phase !== 'checked') return undefined;
    // SOLUTIONS ARE REVEALED PER GROUP, NOT PER SECTION (OV#14). Under
    // ruling 3A a group is N independent RPCs, so a half-landed group would
    // otherwise show the first section's worked solutions while the second
    // is still editable — an answer key handed out for work the student has
    // not yet committed. Verdicts are deliberately NOT gated this way: they
    // describe work that DID land, and withholding them would leave a landed
    // section looking unchecked.
    const siblings = sectionId ? groupOf(sectionId) : undefined;
    if (siblings && !siblings.every((id) => s.sections[id]?.phase === 'checked')) {
      return undefined;
    }
    return status.result.solutions[blockId];
  });
}

/**
 * Released TEACHER feedback for a free-text block (0034 G5), or undefined.
 * Deliberately NOT keyed off the check cycle like the verdict hooks: this
 * arrives from a separate read on open, exists only after a teacher released
 * it, and outlives any number of re-checks.
 */
export function useBlockFeedback(blockId: string): ReleasedBlockFeedback | undefined {
  return useViewerSelector((s) => s.releasedFeedback[blockId]);
}

/** The student's answer for one key of one response map. */
export function useResponse<K extends keyof SectionResponses>(
  category: K,
  key: string,
): SectionResponses[K][string] | undefined {
  return useViewerSelector(
    (s) => (s.responses[category] as SectionResponses[K] | undefined)?.[key] as
      | SectionResponses[K][string]
      | undefined,
  );
}

/** Several answers from one map, in `keys` order (a block's blanks). */
export function useResponses<K extends keyof SectionResponses>(
  category: K,
  keys: readonly string[],
): (SectionResponses[K][string] | undefined)[] {
  return useViewerSelector(
    (s) =>
      keys.map(
        (k) =>
          (s.responses[category] as SectionResponses[K] | undefined)?.[k] as
            | SectionResponses[K][string]
            | undefined,
      ),
    sameItems,
  );
}

/** The version this worksheet is serving. */
export function useServedVersionId(): string {
  return useViewerSelector((s) => s.versionId);
}

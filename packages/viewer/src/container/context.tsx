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

import { createContext, useContext, useMemo, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import type { CheckItemResult, ReleasedBlockFeedback } from '../check/wire.js';
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
  store: ViewerStore;
  state: ViewerStoreState;
  /** Section owning a block — supplied by the container's index. */
  sectionOf(blockId: string): string | undefined;
  /** Where the block's section is in the check cycle. */
  phaseOf(blockId: string): BlockPhase;
  /** The server's verdict for an item, once its section has been checked. */
  resultFor(blockId: string, itemId?: string): CheckItemResult | undefined;
  /** Solution content the server released for a block after its check. */
  solutionFor(blockId: string): SanitizedInlineNode[] | undefined;
  /**
   * Released TEACHER feedback for a free-text block (0034 G5), or undefined.
   * Deliberately NOT keyed off the check cycle like resultFor/solutionFor: this
   * arrives from a separate read on open, exists only after a teacher released
   * it, and outlives any number of re-checks.
   */
  feedbackFor(blockId: string): ReleasedBlockFeedback | undefined;
}

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

export function ViewerProvider({
  store,
  sectionByBlock = {},
  groupSections = {},
  defaultSectionId,
  children,
}: ViewerProviderProps) {
  const state = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState,
  );

  const value = useMemo<ViewerContextValue>(() => {
    const sectionOf = (blockId: string) =>
      sectionByBlock[blockId] ?? defaultSectionId;

    const statusOf = (blockId: string): SectionStatus | undefined => {
      const sectionId = sectionOf(blockId);
      return sectionId ? state.sections[sectionId] : undefined;
    };

    return {
      store,
      state,
      sectionOf,
      phaseOf: (blockId) => statusOf(blockId)?.phase ?? 'unchecked',
      resultFor: (blockId, itemId) => {
        const status = statusOf(blockId);
        if (status?.phase !== 'checked') return undefined;
        return status.result.items[itemId ?? blockId];
      },
      solutionFor: (blockId) => {
        const status = statusOf(blockId);
        if (status?.phase !== 'checked') return undefined;
        // SOLUTIONS ARE REVEALED PER GROUP, NOT PER SECTION (OV#14). Under
        // ruling 3A a group is N independent RPCs, so a half-landed group
        // would otherwise show the first section's worked solutions while the
        // second is still editable — an answer key handed out for work the
        // student has not yet committed. Verdicts are deliberately NOT gated
        // this way: they describe work that DID land, and withholding them
        // would leave a landed section looking unchecked.
        const sectionId = sectionOf(blockId);
        const siblings = sectionId ? groupSections[sectionId] : undefined;
        if (
          siblings &&
          !siblings.every((id) => state.sections[id]?.phase === 'checked')
        ) {
          return undefined;
        }
        return status.result.solutions[blockId];
      },
      feedbackFor: (blockId) => state.releasedFeedback[blockId],
    };
  }, [store, state, sectionByBlock, groupSections, defaultSectionId]);

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

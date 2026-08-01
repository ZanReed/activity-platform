// =============================================================================
// store/store.ts — the viewer store seam (S3; rulings 5A/D11/2.2A)
// -----------------------------------------------------------------------------
// Subscription-shaped (ruling 5A: fetch-on-load v1, Realtime later plugs into
// the same subscribe seam) and dependency-injected: the ONLY way grading
// enters is the `CheckService` port, so every component and the conformance
// factory run against the scriptable mock until S4's real client exists.
//
// Semantics pinned here (and by tests/store.test.ts):
//   - Responses are item-id-keyed maps (wire.ts).
//   - `checkSection` snapshots CURRENT values at fire time (ruling 2.2A) —
//     the request is built synchronously when the check fires, so later edits
//     never mutate an in-flight request.
//   - Section status is a small machine: unchecked → checking → checked,
//     with 'error' recoverable back through a re-check. Failures NEVER lose
//     responses (local-first posture; T7 adds the queued-offline layer).
//   - Re-check is allowed and re-scores everything in the section (parity
//     bundle, ruling 7.1A).
//   - serialize()/hydrate() go through persistence.ts and its
//     VIEWER_STORE_SCHEMA_VERSION gate (ruling D9).
// =============================================================================

import {
  CHECK_WIRE_VERSION,
  emptySectionResponses,
  type CheckRequest,
  type CheckService,
  type GraphWork,
  type SectionResponses,
} from '../check/wire.js';
import type { CheckErrorKind } from '../client/httpCheckService.js';
import {
  emptyPersistedState,
  hydrateViewerState,
  serializeViewerState,
  type PersistedViewerState,
  type SectionStatus,
} from './persistence.js';

/** Which response ids belong to a section — the container derives this from
 * the served document and passes it at check time (the store stays
 * document-shape-agnostic). */
export interface SectionItemIds {
  blanks?: string[];
  choices?: string[];
  matches?: string[];
  orderings?: string[];
  freeText?: string[];
  graphs?: string[];
}

export interface ViewerStoreState {
  activityId: string;
  versionId: string;
  responses: SectionResponses;
  sections: Record<string, SectionStatus>;
  /**
   * Set once the server tells us a newer version of this activity exists
   * (ruling S4-T5). The check STILL SUCCEEDED — the student keeps working and
   * checking against the version they were served, because a mid-period
   * republish must never break a check in progress. This only drives a passive
   * banner offering a reload; nothing here reloads on its own, which would
   * throw away in-flight work.
   */
  newerVersionId?: string;
}

export interface ViewerStore {
  getState(): ViewerStoreState;
  subscribe(listener: () => void): () => void;

  setBlank(id: string, value: string): void;
  setChoices(blockId: string, choiceIds: string[]): void;
  setMatch(blockId: string, itemId: string, targetId: string | null): void;
  setOrdering(blockId: string, itemIds: string[]): void;
  setFreeText(blockId: string, text: string): void;
  /** Replace a graph-family block's work (wire v2). The component owns the
   * geometry; the store just holds it. */
  setGraphWork(blockId: string, work: GraphWork): void;

  /** One batched check for the section's CURRENT values (2.2A). Resolves when
   * the status transition has landed; never throws — failures surface as the
   * section's 'error' status. */
  checkSection(sectionId: string, items: SectionItemIds): Promise<void>;

  /** Persistence bridge (D9). hydrate() ignores payloads for a different
   * activity/version and version-mismatched blobs (null path). */
  serialize(): string;
  hydrate(raw: string | null | undefined): boolean;
}

export interface ViewerStoreOptions {
  activityId: string;
  versionId: string;
  checkService: CheckService;
  /** Mints idempotency keys. Injected so tests are deterministic and so the
   * store never reaches for a global (crypto is absent in some runtimes). */
  newCheckId?: () => string;
}

function pick<T>(
  source: Record<string, T>,
  ids: string[] | undefined,
): Record<string, T> {
  const out: Record<string, T> = {};
  for (const id of ids ?? []) {
    const value = source[id];
    if (value !== undefined) out[id] = value;
  }
  return out;
}

export function createViewerStore(options: ViewerStoreOptions): ViewerStore {
  const { checkService } = options;
  // Deliberately NOT persisted and NOT part of ViewerStoreState: an
  // idempotency key is only meaningful for a check that is in flight right now.
  // Rehydrating one from storage would let a reload replay an attempt from a
  // previous session, which is the opposite of what it is for.
  const pendingCheckIds: Record<string, string> = {};
  let counter = 0;
  const newCheckId =
    options.newCheckId ??
    (() => {
      counter += 1;
      // Enough entropy to be unique per student per section without depending
      // on crypto being present (the store runs in tests and SSR too); the
      // uniqueness that matters is scoped to one student's own rows.
      return `${Date.now().toString(36)}-${counter}-${Math.random()
        .toString(36)
        .slice(2, 10)}`;
    });
  let state: ViewerStoreState = {
    activityId: options.activityId,
    versionId: options.versionId,
    responses: emptySectionResponses(),
    sections: {},
  };
  const listeners = new Set<() => void>();

  function commit(next: ViewerStoreState): void {
    state = next;
    for (const listener of listeners) listener();
  }

  function setResponse(mutate: (responses: SectionResponses) => void): void {
    const responses = structuredClone(state.responses);
    mutate(responses);
    commit({ ...state, responses });
  }

  return {
    getState: () => state,

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    setBlank(id, value) {
      setResponse((r) => {
        r.blanks[id] = value;
      });
    },
    setChoices(blockId, choiceIds) {
      setResponse((r) => {
        r.choices[blockId] = [...choiceIds];
      });
    },
    setMatch(blockId, itemId, targetId) {
      setResponse((r) => {
        const placed = { ...(r.matches[blockId] ?? {}) };
        if (targetId === null) delete placed[itemId];
        else placed[itemId] = targetId;
        r.matches[blockId] = placed;
      });
    },
    setOrdering(blockId, itemIds) {
      setResponse((r) => {
        r.orderings[blockId] = [...itemIds];
      });
    },
    setFreeText(blockId, text) {
      setResponse((r) => {
        r.freeText[blockId] = text;
      });
    },
    setGraphWork(blockId, work) {
      setResponse((r) => {
        r.graphs[blockId] = structuredClone(work);
      });
    },

    async checkSection(sectionId, items) {
      // IDEMPOTENCY KEY LIFECYCLE (S4-B2). A key is minted when a check first
      // fires and KEPT until that check succeeds, so a retry after a lost
      // response replays the recorded attempt instead of minting a second one.
      // Once a check succeeds the key is cleared, so a deliberate RE-check gets
      // a fresh key — which is correct: re-checking is meant to create a new
      // attempt, and only the failed-and-retried case should collapse.
      //
      // Without this, the 3-4 s cold start measured on Edge is enough for a
      // student to give up and press Check again, and the teacher would see two
      // attempts for one piece of work.
      const idempotencyKey = pendingCheckIds[sectionId] ?? newCheckId();
      pendingCheckIds[sectionId] = idempotencyKey;

      // Fire-time snapshot (2.2A): built synchronously from CURRENT values.
      const request: CheckRequest = {
        wireVersion: CHECK_WIRE_VERSION,
        activityId: state.activityId,
        versionId: state.versionId,
        sectionId,
        idempotencyKey,
        responses: {
          blanks: pick(state.responses.blanks, items.blanks),
          choices: pick(state.responses.choices, items.choices),
          matches: pick(state.responses.matches, items.matches),
          orderings: pick(state.responses.orderings, items.orderings),
          freeText: pick(state.responses.freeText, items.freeText),
          graphs: pick(state.responses.graphs, items.graphs),
        },
      };
      commit({
        ...state,
        sections: { ...state.sections, [sectionId]: { phase: 'checking' } },
      });
      try {
        const result = await checkService.checkSection(request);
        delete pendingCheckIds[sectionId];
        // The stale-version advisory rides the successful response; it never
        // turns a good check into a failure.
        const advisory = (result as { currentVersionId?: string })
          .currentVersionId;
        commit({
          ...state,
          ...(advisory && advisory !== state.versionId
            ? { newerVersionId: advisory }
            : {}),
          sections: {
            ...state.sections,
            [sectionId]: { phase: 'checked', result },
          },
        });
      } catch (err) {
        // Responses are untouched — only the section status records the
        // failure (2.1A "Couldn't check — try again", non-blaming). The key is
        // deliberately NOT cleared: the next attempt is a retry of this check.
        const kind = (err as { kind?: CheckErrorKind }).kind;
        const retryable = (err as { retryable?: boolean }).retryable;
        if (!kind) {
          // An untyped failure is not a check outcome — it is a BUG in the
          // service or the store, and this catch is about to dress it up as a
          // friendly "couldn't check". Log it so it stays findable; without
          // this, a TypeError in the client is indistinguishable from the
          // server being down. (Learned the hard way: a missing import in a
          // test surfaced only as "the banner didn't render".)
          console.error('[viewer] check failed with an untyped error', err);
        }
        commit({
          ...state,
          sections: {
            ...state.sections,
            [sectionId]: {
              phase: 'error',
              message: err instanceof Error ? err.message : 'Check failed',
              ...(kind ? { kind } : {}),
              ...(retryable !== undefined ? { retryable } : {}),
            },
          },
        });
      }
    },

    serialize() {
      const persisted: PersistedViewerState = {
        ...emptyPersistedState(state.activityId, state.versionId),
        responses: structuredClone(state.responses),
        checked: Object.fromEntries(
          Object.entries(state.sections).flatMap(([id, status]) =>
            status.phase === 'checked' ? [[id, status.result]] : [],
          ),
        ),
      };
      return serializeViewerState(persisted);
    },

    hydrate(raw) {
      const persisted = hydrateViewerState(raw);
      if (!persisted) return false;
      // A blob from another activity or version never hydrates — a republish
      // means fresh state (the version-keyed content changed under it).
      if (
        persisted.activityId !== state.activityId ||
        persisted.versionId !== state.versionId
      ) {
        return false;
      }
      commit({
        ...state,
        responses: structuredClone(persisted.responses),
        sections: Object.fromEntries(
          Object.entries(persisted.checked).map(([id, result]) => [
            id,
            { phase: 'checked', result } as SectionStatus,
          ]),
        ),
      });
      return true;
    },
  };
}

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
//   - S6: the store is the SINGLE authority for idempotency keys and the
//     single source of truth for queued checks (rulings S6-3 / S6-8). The
//     buffer persists what serialize() emits; the queue executor (V2) reads
//     and clears `pending` here rather than keeping a list of its own — two
//     authorities over one fact is how a section ends up showing "pending" in
//     one place and "checked" in another.
// =============================================================================

import {
  CHECK_WIRE_VERSION,
  emptySectionResponses,
  type CheckRequest,
  type CheckService,
  type GraphWork,
  type ReleasedBlockFeedback,
  type SectionResponses,
} from '../check/wire.js';
import type { CheckErrorKind } from '../client/httpCheckService.js';
import {
  emptyPersistedState,
  fingerprintResponses,
  hydrateViewerState,
  serializeViewerState,
  type InFlightCheck,
  type PendingCheck,
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
  /** Whose work this is (S6-1). Written into every persisted blob and checked
   * on the way back in — the shared-Chromebook guard's in-state half. */
  userId: string;
  activityId: string;
  versionId: string;
  responses: SectionResponses;
  sections: Record<string, SectionStatus>;
  /**
   * Section id → queued check intent (S6-2/S6-8). Populated when a check can't
   * be sent and drained by the queue executor (V2); the derived 'pending' UI
   * phase reads it. Persisted, so a queued check survives a closed lid.
   */
  pending: Record<string, PendingCheck>;
  /**
   * Section id → the idempotency key of a check already sent (S6-3). Persisted
   * on purpose: see the InFlightCheck doc comment for why the earlier
   * in-memory-only rule was overturned.
   */
  inFlight: Record<string, InFlightCheck>;
  /**
   * Section id → gradable block ids that CRASHED before the last check of
   * that section, so the check under-covered (D12's recordable half, wired
   * by eng review D13). RUNTIME-ONLY — deliberately absent from serialize():
   * a crash roster describes THIS render of this tab, and persisting it
   * would resurrect a stale accusation after the crash is gone. Consumers
   * today: the route's error log; later, whatever the grading-UX era decides
   * an under-covered check should DO.
   */
  shortfalls: Record<string, string[]>;
  /**
   * Set once the server tells us a newer version of this activity exists
   * (ruling S4-T5). The check STILL SUCCEEDED — the student keeps working and
   * checking against the version they were served, because a mid-period
   * republish must never break a check in progress. This only drives a passive
   * banner offering a reload; nothing here reloads on its own, which would
   * throw away in-flight work.
   */
  newerVersionId?: string;
  /**
   * Block id → released teacher feedback (0034 G5). RUNTIME-ONLY, deliberately
   * absent from serialize(): it is server truth that the teacher can revise at
   * any moment (an edit to an already-released grade goes live immediately,
   * G4), so a persisted copy would show a student feedback their teacher had
   * already changed. It is also cheap — one RPC on open.
   *
   * Populated by loadReleasedFeedback(), which never throws and never blocks
   * the worksheet: an empty map is the honest state for "not graded yet",
   * "nothing released yet", and "the call failed" alike, and the student's
   * worksheet reads identically in all three (G14).
   */
  releasedFeedback: Record<string, ReleasedBlockFeedback>;
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

  /**
   * Check a CHECK GROUP: every section since the previous checkpoint (R1).
   *
   * N RPCs, not one (ruling 3A) — `section_checks` is per-section and the
   * server's atomic unit is the section, so a group is a composition rather
   * than a new wire shape. They fire CONCURRENTLY: the synchronous prelude of
   * each `checkSection` runs before any await, so every member reaches
   * 'checking' in the same commit batch — which is what makes the `locked`
   * freeze happen at PRESS rather than at fire (OV#19).
   *
   * Fires exactly the sections it is GIVEN. Retry passes only the unlanded
   * members (`groupStatus().unlanded`); a deliberate re-check in `free` mode
   * passes all of them and re-scores the whole group, which is what re-checking
   * has always meant (7.1A).
   *
   * Never throws — each member's failure surfaces as that section's status, and
   * the group's phase is DERIVED from them (container/checkGroups.ts). A member
   * that 429s mid-group therefore reads as 'partial', not as a failed group.
   */
  checkGroup(
    sectionIds: readonly string[],
    itemsBySection: Readonly<Record<string, SectionItemIds>>,
  ): Promise<void>;

  /** Record that a section's last check under-covered (crashed gradable
   * blocks sent no response). Runtime-only state — see ViewerStoreState. */
  recordShortfall(sectionId: string, crashedBlockIds: string[]): void;

  /**
   * Read released teacher feedback for this activity (0034 §E) into state.
   * NEVER throws and never rejects — the service degrades a failed read to an
   * empty result, and this resolves either way. Callers do not need to handle
   * failure, because there is no failure state to show a student: feedback
   * that could not be fetched is indistinguishable, on the page, from feedback
   * that was never released.
   */
  loadReleasedFeedback(): Promise<void>;

  /**
   * Forget a queued check without running it. The one caller today is the
   * queue executor, when the served document no longer contains the section
   * (a republish removed it) — firing blind would grade ids that don't exist.
   * V6's republish boot path is the other expected user.
   */
  dropPendingCheck(sectionId: string): void;

  /** Persistence bridge (D9). hydrate() ignores payloads for a different
   * activity/version and version-mismatched blobs (null path). */
  serialize(): string;
  hydrate(raw: string | null | undefined): boolean;
}

export interface ViewerStoreOptions {
  /** The signed-in student. Required: a store that doesn't know whose work it
   * holds cannot enforce the shared-device guard. */
  userId: string;
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
  // OVERTURNED 2026-08-02 (ruling S6-3). This used to be a module-local map,
  // documented as "deliberately NOT persisted" on the reasoning that a key
  // only matters while a request is in flight in this tab. That reasoning
  // missed the dominant Chromebook failure: request sent → Wi-Fi drops →
  // response lost → lid closes. With an in-memory key, reopening mints a fresh
  // one and the retry records a SECOND attempt for one piece of work. The key
  // now lives in state and therefore in the buffer, so that retry is a replay
  // against S4-B2's idempotency index. Cleared on success, so a deliberate
  // re-check still creates a new attempt.
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
    userId: options.userId,
    activityId: options.activityId,
    versionId: options.versionId,
    responses: emptySectionResponses(),
    sections: {},
    pending: {},
    inFlight: {},
    shortfalls: {},
    releasedFeedback: {},
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

  // Named rather than returned inline so `checkGroup` can compose
  // `checkSection` without `this` — a destructured `const { checkGroup } =
  // store` would otherwise lose its receiver and throw.
  const store: ViewerStore = {
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
      const idempotencyKey = state.inFlight[sectionId]?.checkId ?? newCheckId();

      // Fire-time snapshot (2.2A): built synchronously from CURRENT values.
      const firedResponses: SectionResponses = {
        blanks: pick(state.responses.blanks, items.blanks),
        choices: pick(state.responses.choices, items.choices),
        matches: pick(state.responses.matches, items.matches),
        orderings: pick(state.responses.orderings, items.orderings),
        freeText: pick(state.responses.freeText, items.freeText),
        graphs: pick(state.responses.graphs, items.graphs),
      };
      const request: CheckRequest = {
        wireVersion: CHECK_WIRE_VERSION,
        activityId: state.activityId,
        versionId: state.versionId,
        sectionId,
        idempotencyKey,
        responses: firedResponses,
      };
      // The key and what it was fired against are recorded BEFORE the await:
      // if the tab dies mid-request, the buffer already holds enough to make
      // the next attempt a replay rather than a second attempt.
      commit({
        ...state,
        sections: { ...state.sections, [sectionId]: { phase: 'checking' } },
        inFlight: {
          ...state.inFlight,
          [sectionId]: {
            checkId: idempotencyKey,
            fingerprint: fingerprintResponses(firedResponses),
          },
        },
      });
      // Was this section waiting in the queue? If so, compare what we are
      // about to send against what the student had when they pressed Check —
      // that difference is the whole basis of the 2.2A notice.
      const queued = state.pending[sectionId];
      const answersChangedWhileQueued =
        queued !== undefined &&
        queued.fingerprint !== fingerprintResponses(firedResponses);

      try {
        const result = await checkService.checkSection(request);
        const remainingInFlight = { ...state.inFlight };
        delete remainingInFlight[sectionId];
        const remainingPending = { ...state.pending };
        delete remainingPending[sectionId];
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
            [sectionId]: {
              phase: 'checked',
              result,
              ...(answersChangedWhileQueued
                ? { answersChangedWhileQueued: true }
                : {}),
            },
          },
          // Success clears the key: the next Check is a NEW attempt, which is
          // what re-checking means. Only the failed-and-retried case collapses.
          inFlight: remainingInFlight,
          // ...and it leaves the queue: this check happened.
          pending: remainingPending,
        });
      } catch (err) {
        // Responses are untouched — only the section status records the
        // failure (2.1A "Couldn't check — try again", non-blaming). The key is
        // deliberately NOT cleared: the next attempt is a retry of this check.
        const kind = (err as { kind?: CheckErrorKind }).kind;
        if (!kind) {
          // An untyped failure is not a check outcome — it is a BUG in the
          // service or the store, and this catch is about to dress it up as a
          // friendly "couldn't check". Log it so it stays findable; without
          // this, a TypeError in the client is indistinguishable from the
          // server being down. (Learned the hard way: a missing import in a
          // test surfaced only as "the banner didn't render".)
          console.error('[viewer] check failed with an untyped error', err);
        }

        // OFFLINE IS NOT A FAILURE, IT IS A DELAY (TV3-A). The request never
        // reached the server, so there is nothing to report and nothing for
        // the student to fix — the check joins the queue and fires on its own
        // when the network returns. Every other failure IS a failure the
        // student should see, with the 2.1A retry affordance.
        //
        // The fingerprint recorded here is what they had WHEN THEY PRESSED
        // CHECK. It is not re-taken later: the whole point is to notice that
        // the answers moved between then and the eventual fire.
        if (kind === 'offline') {
          commit({
            ...state,
            sections: { ...state.sections, [sectionId]: { phase: 'pending' } },
            pending: {
              ...state.pending,
              [sectionId]:
                state.pending[sectionId] ??
                { fingerprint: fingerprintResponses(firedResponses) },
            },
          });
          return;
        }

        commit({
          ...state,
          sections: {
            ...state.sections,
            [sectionId]: {
              phase: 'error',
              message: err instanceof Error ? err.message : 'Check failed',
              ...(kind ? { kind } : {}),
            },
          },
          // A reachable-but-failing server means this check is NOT queued:
          // retrying forever against a 500 would spin, and 2.1A gives the
          // student an explicit Retry instead. Dropping the queue entry is how
          // a section stops claiming it will check itself later.
          pending: (() => {
            const next = { ...state.pending };
            delete next[sectionId];
            return next;
          })(),
        });
      }
    },

    async checkGroup(sectionIds, itemsBySection) {
      // Promise.all over the SAME per-section path: no second code path for
      // grouped checks means idempotency keys, the offline queue, the 2.2A
      // fingerprint and the shortfall roster all behave identically whether a
      // section was checked alone or as a group member. `checkSection` never
      // rejects, so this never rejects either.
      await Promise.all(
        sectionIds.map((sectionId) =>
          store.checkSection(sectionId, itemsBySection[sectionId] ?? {}),
        ),
      );
    },

    recordShortfall(sectionId, crashedBlockIds) {
      commit({
        ...state,
        shortfalls: { ...state.shortfalls, [sectionId]: [...crashedBlockIds] },
      });
    },

    async loadReleasedFeedback() {
      // The try/catch is belt-and-suspenders: httpCheckService already degrades
      // a failed read to an empty result (G14), and the mock cannot fail. This
      // catch exists so a THIRD implementation of the port — a future realtime
      // source, a test double someone writes in a hurry — cannot reintroduce a
      // throw on the student's read path by forgetting the contract.
      let result;
      try {
        result = await options.checkService.fetchReleasedFeedback(state.activityId);
      } catch {
        return;
      }
      if (!result?.blocks) return;
      commit({ ...state, releasedFeedback: { ...result.blocks } });
    },

    dropPendingCheck(sectionId) {
      if (state.pending[sectionId] === undefined) return;
      const pending = { ...state.pending };
      delete pending[sectionId];
      const sections = { ...state.sections };
      // The derived phase goes with it — a section that is no longer queued
      // must stop saying it will check itself later.
      if (sections[sectionId]?.phase === 'pending') delete sections[sectionId];
      commit({ ...state, pending, sections });
    },

    serialize() {
      const persisted: PersistedViewerState = {
        ...emptyPersistedState(state.userId, state.activityId, state.versionId),
        responses: structuredClone(state.responses),
        checked: Object.fromEntries(
          Object.entries(state.sections).flatMap(([id, status]) =>
            status.phase === 'checked' ? [[id, status.result]] : [],
          ),
        ),
        pending: structuredClone(state.pending),
        inFlight: structuredClone(state.inFlight),
      };
      return serializeViewerState(persisted);
    },

    hydrate(raw) {
      // The user check happens inside hydrateViewerState — passing the id here
      // means a foreign blob is refused even if it somehow arrived under this
      // user's key (the key scheme is the other, independent layer).
      const persisted = hydrateViewerState(raw, state.userId);
      if (!persisted) return false;
      // A blob from another activity or version never hydrates — a republish
      // means fresh state (the version-keyed content changed under it). The
      // queue's boot path (V6) handles the republish case deliberately, by
      // deciding which version to RENDER; it never smuggles old responses into
      // a new version's store, where the block ids wouldn't match anyway.
      if (
        persisted.activityId !== state.activityId ||
        persisted.versionId !== state.versionId
      ) {
        return false;
      }
      // The 'pending' phase is DERIVED, so it has to be rebuilt here rather
      // than persisted as its own field. Order matters: a section that was
      // queued outranks a stale 'checked' result from an earlier check,
      // because the queued fire is the one the student is still waiting on.
      const sections: Record<string, SectionStatus> = Object.fromEntries(
        Object.entries(persisted.checked).map(([id, result]) => [
          id,
          { phase: 'checked', result } as SectionStatus,
        ]),
      );
      for (const sectionId of Object.keys(persisted.pending)) {
        sections[sectionId] = { phase: 'pending' };
      }
      commit({
        ...state,
        responses: structuredClone(persisted.responses),
        sections,
        pending: structuredClone(persisted.pending),
        inFlight: structuredClone(persisted.inFlight),
      });
      return true;
    },
  };
  return store;
}

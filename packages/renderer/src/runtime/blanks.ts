// =============================================================================
// runtime/blanks.ts — Blank scoring, state updates, per-blank wiring
// -----------------------------------------------------------------------------
// Post-Stage-13-Session-2: covers all per-blank concerns — scoring, mistake
// feedback dispatch, edit-to-clear, and the hint modal trigger. No DOM
// mutation happens here; every state change routes through onUpdate → render.
//
// Layered API:
//   trimValue                  — whitespace rule, shared with scoring + matching
//   scoreBlank                 — pure: ref + typed → true/false/null
//   matchMistakeFeedback       — pure: ref + typed → matched entry index | null
//   scoreBlankAndUpdateState   — composition: read input, score, write to state
//                                (result + matchedMistake). No DOM writes.
//   clearBlankState            — clear stale result + matchedMistake when the
//                                student edits a previously-scored blank.
//                                Returns boolean: did anything actually change?
//                                The caller uses that to skip onUpdate when
//                                there's nothing to render — avoids cascading
//                                renders on every keystroke during initial
//                                typing.
//   wireBlanks                 — attaches blur (score) + input (clear) handlers
//   wireHints                  — `?` buttons open the hint popover
//   wireMistakes               — `!` buttons open the mistake-feedback popover
//   wirePopover                — popover close handlers (×, Escape, outside
//                                click) + header drag-to-move
//
// Mistake matching rule: string match against BlankRef.mistakeFeedback
// entries' `match` field, case-insensitive (both sides trimmed + lowercased),
// first match wins. Deliberately looser than the case-sensitive scoring rule —
// a student shouldn't lose targeted help over capitalization. Only ever runs on
// a wrong answer (result === false), so it can't contradict a correct score.
//
// Architectural note: evaluateAnswer (strategies.ts) still reads data-*
// off ref.input — same small leak acknowledged in Stage 12. It hasn't
// been friction; STATE.md keeps it on the "refactor if friction" list.
// =============================================================================

import type { AnswerFeedback } from './config.js';
import type { BlankRef, Refs } from './refs.js';
import type { RuntimeState } from './state.js';
import { evaluateAnswer, isMathReady } from './strategies.js';

/** Trim leading/trailing whitespace. Shared so the rule has one home. */
export function trimValue(value: string): string {
  return value.replace(/^\s+|\s+$/g, '');
}

/**
 * Pure: score one blank against its ref, returning true/false/null.
 * Null means the typed value is empty (or whitespace-only) and therefore
 * unscored. Does not touch the DOM and does not touch state.
 */
export function scoreBlank(ref: BlankRef, typed: string): boolean | null {
  const trimmed = trimValue(typed);
  if (trimmed === '') return null;
  return evaluateAnswer(ref.input, trimmed);
}

/**
 * A 'math' blank that the student HAS answered but the kit couldn't grade yet
 * (not loaded). Its result is null despite a non-empty value. The section tally
 * excludes these from the denominator (math-blanks.md A2) so a transient
 * kit-load delay doesn't render as a miss. An EMPTY math blank is a normal
 * omission (counts in the total) and is not one of these.
 */
export function isUnscoredMathAnswer(ref: BlankRef): boolean {
  return (
    !isMathReady() &&
    ref.input.getAttribute('data-blank-strategy') === 'math' &&
    trimValue(ref.input.value) !== ''
  );
}

/**
 * Pure: find the index of the mistake-feedback entry whose `match` equals the
 * trimmed, lowercased typed value (case-insensitive). Returns the entry index
 * (into ref.mistakeFeedback), or null when no entry matches.
 *
 * Returning the index (rather than the feedback content) keeps persisted state
 * lean and lets render() clone the matching template by position — the rich
 * content never round-trips through state or localStorage.
 *
 * Empty/whitespace-only typed values always return null — even if the
 * teacher authored an entry with an empty match string, an empty answer
 * is "unscored" rather than "wrong in a specific way," so no targeted
 * feedback applies.
 *
 * Matching is case-insensitive (both sides trimmed + lowercased): a student
 * who types "Slope" still gets the feedback authored for "slope". The student
 * shouldn't lose targeted help over capitalization.
 *
 * First match wins. Teachers shouldn't author duplicate match strings;
 * if they do, the array order in mistakeFeedback wins (which is document
 * order from the schema).
 */
export function matchMistakeFeedback(
  ref: BlankRef,
  typed: string,
): number | null {
  const needle = trimValue(typed).toLowerCase();
  if (needle === '') return null;
  for (let i = 0; i < ref.mistakeFeedback.length; i++) {
    if (trimValue(ref.mistakeFeedback[i]!.match).toLowerCase() === needle) {
      return i;
    }
  }
  return null;
}

/**
 * Read ref.input.value, score it, write result + matchedMistake to
 * state.blanks[id]. Returns the result so callers (gatherResponses) can
 * use it directly.
 *
 * matchedMistake is only populated when result === false AND a match
 * exists. Correct or unscored answers always clear it — a stale message
 * from a previous incorrect attempt would be confusing after the student
 * fixes the answer.
 *
 * No DOM writes — render(state, refs) handles propagation.
 *
 * Silently no-ops the state write when state.blanks[id] is absent
 * (graceful degradation — refs and state should always agree post-init,
 * but defense-in-depth).
 */
export function scoreBlankAndUpdateState(
  state: RuntimeState,
  id: string,
  ref: BlankRef,
): boolean | null {
  const typed = ref.input.value;
  const result = scoreBlank(ref, typed);
  const blankState = state.blanks[id];
  if (blankState) {
    blankState.result = result;
    blankState.matchedMistake =
    result === false ? matchMistakeFeedback(ref, typed) : null;
  }
  return result;
}

/**
 * Score a group of order-independent blanks with consume-once matching.
 *
 * The blanks share an answer pool, but each correct answer can satisfy only one
 * blank: for `(x + ☐)(x + ☐)` with answers {2, 3}, both (2,3) and (3,2) score
 * 2/2, while (2,2) scores 1/2 (one blank matches "2", the other has nothing
 * left to match). Empty blanks stay unscored (null), mirroring solo behavior.
 *
 * Implementation: maximum bipartite matching (Kuhn's augmenting path) between
 * typed values and answer slots. A value fills a slot when that slot's blank
 * would score the value correct (evaluateAnswer against the slot's own answer
 * list — each blank keeps its own acceptableAnswers/strategy; we match against
 * per-slot lists, never a flattened pool, which is what preserves consume-once).
 * Values are processed in document order, so when more equal values compete than
 * there are slots, the LAST duplicate is the one left unmatched — a deterministic
 * tiebreak.
 *
 * Writes result + matchedMistake to state per blank, in the exact shape
 * scoreBlankAndUpdateState produces, so render() and gatherResponses treat
 * grouped and solo blanks identically downstream. No DOM writes.
 *
 * `ids` and `refsList` are index-aligned (ids[i] ↔ refsList[i]).
 */
export function scoreGroup(
  state: RuntimeState,
  ids: string[],
  refsList: BlankRef[],
): void {
  const n = ids.length;
  const values = refsList.map((ref) => trimValue(ref.input.value));

  // slotToValue[j] = index of the value currently occupying slot j, or -1.
  const slotToValue: number[] = new Array(n).fill(-1);

  const canFill = (vi: number, sj: number): boolean => {
    const value = values[vi];
    const slot = refsList[sj];
    if (!value || !slot) return false; // empty value never matches
    // evaluateAnswer is tri-state (a 'math' slot returns null while the kit
    // loads); a null never fills a slot. Math-in-a-group is an edge case, but
    // this keeps the matcher total and crash-free.
    return evaluateAnswer(slot.input, value) === true;
  };

  const augment = (vi: number, seen: boolean[]): boolean => {
    for (let sj = 0; sj < n; sj++) {
      if (seen[sj] || !canFill(vi, sj)) continue;
      seen[sj] = true;
      const occupant = slotToValue[sj];
      if (occupant === undefined) continue;
      if (occupant === -1 || augment(occupant, seen)) {
        slotToValue[sj] = vi;
        return true;
      }
    }
    return false;
  };

  for (let vi = 0; vi < n; vi++) {
    if (!values[vi]) continue; // empties stay unscored
    augment(vi, new Array<boolean>(n).fill(false));
  }

  const matched = new Array<boolean>(n).fill(false);
  for (let sj = 0; sj < n; sj++) {
    const vi = slotToValue[sj];
    if (vi !== undefined && vi >= 0) matched[vi] = true;
  }

  for (let i = 0; i < n; i++) {
    const id = ids[i];
    const ref = refsList[i];
    if (id === undefined || !ref) continue;
    const blankState = state.blanks[id];
    if (!blankState) continue;
    const value = values[i] ?? '';
    const result: boolean | null = value === '' ? null : matched[i] === true;
    blankState.result = result;
    blankState.matchedMistake =
      result === false ? matchMistakeFeedback(ref, value) : null;
  }
}

/**
 * Score a set of blanks, honoring order-independent groups. Blanks carrying a
 * groupId are bucketed and scored together via scoreGroup (consume-once); the
 * rest score independently via scoreBlankAndUpdateState. Used by BOTH the
 * per-section check (checkSection) and the whole-activity submit gather
 * (gatherResponses), so check-time and submit-time verdicts always agree.
 *
 * Every member of a group lives in one block within one section, so any scope
 * that contains whole sections (a section's blanks, or every blank on the page)
 * contains each group in full — bucketing never splits a group.
 */
export function scoreBlanksInScope(
  state: RuntimeState,
  refs: Refs,
  blankIds: Iterable<string>,
): void {
  const groups = new Map<string, string[]>();
  for (const id of blankIds) {
    const ref = refs.blanks.get(id);
    if (!ref) continue;
    if (ref.groupId) {
      const bucket = groups.get(ref.groupId);
      if (bucket) bucket.push(id);
      else groups.set(ref.groupId, [id]);
    } else {
      scoreBlankAndUpdateState(state, id, ref);
    }
  }
  for (const ids of groups.values()) {
    const refsList: BlankRef[] = [];
    for (const id of ids) {
      const ref = refs.blanks.get(id);
      if (ref) refsList.push(ref);
    }
    // Defensive: a ref vanished between bucketing and here (shouldn't happen
    // post-init). Score what's left independently so nothing goes unscored.
    if (refsList.length !== ids.length) {
      for (const id of ids) {
        const ref = refs.blanks.get(id);
        if (ref) scoreBlankAndUpdateState(state, id, ref);
      }
      continue;
    }
    scoreGroup(state, ids, refsList);
  }
}

/**
 * Clear stale result + matchedMistake on a blank. Used by the input
 * event handler so an edited answer doesn't keep its green "correct"
 * border (or stale mistake text) until the student blurs again.
 *
 * Returns true when anything actually changed; false when state was
 * already clean. The caller uses this to skip a needless render — on
 * keystrokes 2..N of a fresh edit there's nothing to clear, so onUpdate
 * isn't called and render() doesn't run.
 *
 * Does NOT touch hint-modal state. Editing a blank shouldn't close an
 * open hint — the hint is independent of the answer state.
 */
export function clearBlankState(state: RuntimeState, id: string): boolean {
  const blankState = state.blanks[id];
  if (!blankState) return false;
  if (blankState.result === null && blankState.matchedMistake === null) {
    return false;
  }
  blankState.result = null;
  blankState.matchedMistake = null;
  return true;
}

/**
 * Wire every blank's blur (commit + score) and input (clear stale state).
 * After either handler runs, the onUpdate callback fires — index.ts wires
 * it to render(state, refs).
 *
 * answerFeedback gates the blur handler. In 'immediate' mode, blur scores the
 * blank so the student sees correct/incorrect right away (self-check). In
 * 'on_check' mode, blur does NOT score — correctness stays hidden until the
 * section is checked or the activity is submitted (both of which score through
 * their own paths). The typed value still persists regardless (storage saves
 * input.value independently of blank result state).
 *
 * The input handler runs in BOTH modes: even in 'on_check', once a section
 * check has set results, editing a blank should clear its stale border
 * (edit-to-clear). It's gated by clearBlankState's return — keystrokes that
 * don't change state don't trigger renders.
 */
export function wireBlanks(
  answerFeedback: AnswerFeedback,
  state: RuntimeState,
  refs: Refs,
  onUpdate: () => void,
): void {
  for (const [id, ref] of refs.blanks) {
    // Immediate mode scores on blur — but only solo blanks. A grouped blank
    // can't resolve in isolation (its group-mates may still be empty or
    // mid-typing), so scoring it on blur would flash a misleading ✗ on an
    // answer that's correct once the group is matched. Grouped blanks instead
    // resolve when a group-aware scope runs (section check or submit).
    if (answerFeedback === 'immediate' && ref.groupId === null) {
      ref.input.addEventListener('blur', () => {
        scoreBlankAndUpdateState(state, id, ref);
        onUpdate();
      });
    }
    ref.input.addEventListener('input', () => {
      if (clearBlankState(state, id)) {
        onUpdate();
      }
    });
  }
}

/**
 * Compute the popover's initial position beside a trigger button: just to its
 * right, top-aligned. Coordinates are viewport-relative (the popover is
 * position:fixed). Clamped loosely into the viewport so it opens on-screen;
 * the student can drag it precisely afterward. Reads layout geometry, so it
 * runs in the click handler (never inside render).
 */
function positionBesideTrigger(button: HTMLElement): { x: number; y: number } {
  const rect = button.getBoundingClientRect();
  const width = Math.min(window.innerWidth - 32, 352); // mirrors the CSS cap
  let x = rect.right + 8;
  let y = rect.top;
  x = Math.max(8, Math.min(x, window.innerWidth - width - 8));
  y = Math.max(8, Math.min(y, window.innerHeight - 80));
  return { x, y };
}

/**
 * Open the shared popover for a blank. Seeds its position beside the trigger,
 * writes state.popover (replacing any currently-open popover — one at a time),
 * renders, then moves focus to the close button so keyboard + screen-reader
 * users land inside the panel.
 */
function openPopover(
  state: RuntimeState,
  refs: Refs,
  kind: 'hint' | 'mistake',
  id: string,
  trigger: HTMLElement,
  onUpdate: () => void,
): void {
  const { x, y } = positionBesideTrigger(trigger);
  state.popover = { kind, blankId: id, x, y };
  onUpdate();
  refs.popover?.closeButton.focus();
}

/**
 * Wire every blank that has a hint button. Click opens the hint popover for
 * that blank.
 *
 * Blanks without an authored hint have hintButton === null and are skipped
 * silently — no hint affordance is emitted by the renderer for those blanks.
 */
export function wireHints(
  state: RuntimeState,
  refs: Refs,
  onUpdate: () => void,
): void {
  for (const [id, ref] of refs.blanks) {
    const button = ref.hintButton;
    if (!button) continue;
    button.addEventListener('click', () => {
      openPopover(state, refs, 'hint', id, button, onUpdate);
    });
  }
}

/**
 * Wire every blank that has a mistake button. Click opens the mistake-feedback
 * popover for that blank (its body is BlankState.matchedMistake). The button
 * itself is emitted `hidden`; render reveals it only when a wrong answer
 * matched an entry, so the click handler can assume there's feedback to show.
 *
 * Blanks without authored mistake feedback have mistakeButton === null and are
 * skipped silently.
 */
export function wireMistakes(
  state: RuntimeState,
  refs: Refs,
  onUpdate: () => void,
): void {
  for (const [id, ref] of refs.blanks) {
    const button = ref.mistakeButton;
    if (!button) continue;
    button.addEventListener('click', () => {
      openPopover(state, refs, 'mistake', id, button, onUpdate);
    });
  }
}

/**
 * Wire the shared popover's close affordances and drag-to-move:
 *
 *   - × button, Escape: close.
 *   - Outside click: close — EXCEPT a click on the popover itself, on the
 *     active trigger button, or in the popover's OWNING answer blank. Keeping
 *     the owning input "inside" lets a student type their answer while reading
 *     the hint (the whole point of a movable, non-dimming popover).
 *   - Header drag: repositions the panel.
 *
 * On close, focus returns to the trigger that opened it (kept for keyboard
 * users). No-ops when the page has no popover markup (refs.popover === null).
 */
export function wirePopover(
  state: RuntimeState,
  refs: Refs,
  onUpdate: () => void,
): void {
  const popover = refs.popover;
  if (!popover) return;

  const close = () => {
    const p = state.popover;
    if (p === null) return;
    state.popover = null;
    onUpdate();
    const blank = refs.blanks.get(p.blankId);
    const trigger = p.kind === 'hint' ? blank?.hintButton : blank?.mistakeButton;
    trigger?.focus();
  };

  popover.closeButton.addEventListener('click', close);

  // Escape closes, but only while open so we don't swallow Escape elsewhere.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.popover !== null) {
      e.preventDefault();
      close();
    }
  });

  // Outside-click close. The click that OPENED the popover also bubbles here,
  // but its target is the trigger button (excluded below), so it doesn't
  // immediately re-close. Switching popovers works the same way: the new
  // trigger's own handler updates state.popover first, then this sees the new
  // trigger as the active one and leaves it open.
  document.addEventListener('click', (e) => {
    const p = state.popover;
    if (p === null) return;
    const target = e.target as Node | null;
    if (target === null) return;
    if (popover.el.contains(target)) return;
    const blank = refs.blanks.get(p.blankId);
    if (blank && blank.input === target) return;
    const trigger = p.kind === 'hint' ? blank?.hintButton : blank?.mistakeButton;
    if (trigger && trigger.contains(target)) return;
    close();
  });

  // Header drag-to-move. Pointer events + capture keep tracking even when the
  // cursor leaves the header. During the gesture we write style.left/top
  // directly AND sync state.popover.x/y — the one place the runtime mutates
  // the DOM outside render(), chosen deliberately: routing every pointermove
  // through onUpdate would re-render the whole activity (and re-persist) per
  // pixel. Keeping state in sync means any later render() preserves the spot.
  let drag: { pointerId: number; offsetX: number; offsetY: number } | null =
    null;

  popover.header.addEventListener('pointerdown', (e) => {
    if (state.popover === null) return;
    // The close button lives in the header but isn't a drag handle.
    if ((e.target as HTMLElement).closest('.js-popover-close')) return;
    const rect = popover.el.getBoundingClientRect();
    drag = {
      pointerId: e.pointerId,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };
    popover.header.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  popover.header.addEventListener('pointermove', (e) => {
    if (drag === null || e.pointerId !== drag.pointerId) return;
    const p = state.popover;
    if (p === null) return;
    const width = popover.el.offsetWidth;
    const height = popover.el.offsetHeight;
    let x = e.clientX - drag.offsetX;
    let y = e.clientY - drag.offsetY;
    x = Math.max(0, Math.min(x, window.innerWidth - width));
    y = Math.max(0, Math.min(y, window.innerHeight - height));
    p.x = x;
    p.y = y;
    popover.el.style.left = x + 'px';
    popover.el.style.top = y + 'px';
  });

  const endDrag = (e: PointerEvent) => {
    if (drag !== null && e.pointerId === drag.pointerId) {
      if (popover.header.hasPointerCapture(e.pointerId)) {
        popover.header.releasePointerCapture(e.pointerId);
      }
      drag = null;
    }
  };
  popover.header.addEventListener('pointerup', endDrag);
  popover.header.addEventListener('pointercancel', endDrag);
}

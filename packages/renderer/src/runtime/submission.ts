// =============================================================================
// runtime/submission.ts — Response gathering + submission
// -----------------------------------------------------------------------------
// Post-Session-4 expansions to the payload:
//   - blanks[].confidence — derived from state.blocks[ref.blockId].
//     confidence at submit time. Every blank in a block gets the same
//     confidence value (the fieldset is per-block).
//   - responses.checkpointResults — built from per-section state.
//     Included only when at least one section qualifies (checked=true,
//     checkedAt set, total > 0). The schema requires total positive, so
//     a section with zero blanks is filtered out defensively.
//
// On submit success, clearActivityState removes the persisted blob —
// next page-load shows a fresh form rather than restoring submitted work.
//
// Stage 14 will wire localStorage-backed retry, attempt-number
// reconciliation against the server's canonical value, and revisionMode
// resubmission.
// =============================================================================

import { $ } from './dom.js';
import { scoreBlankAndUpdateState, trimValue } from './blanks.js';
import type { RuntimeConfig } from './config.js';
import type { Refs } from './refs.js';
import type { RuntimeState } from './state.js';
import { clearActivityState, saveName } from './storage.js';

interface BlankResult {
  answer: string;
  correct: boolean;
  confidence?: 'unsure' | 'think_so' | 'certain';
}

interface CheckpointResultPayload {
  score: number;
  total: number;
  checkedAt: string;
}

interface GatheredResponses {
  blanks: Record<string, BlankResult>;
  score: number;
  totalScored: number;
}

/**
 * Pure score arithmetic, split from gatherResponses so it's testable
 * without a DOM. A fraction in [0, 1]; zero scored blanks scores 0 (not NaN).
 */
export function computeScore(totalCorrect: number, totalScored: number): number {
  return totalScored > 0 ? totalCorrect / totalScored : 0;
}

/**
 * Iterate refs.blanks, score each blank into state, assemble the payload.
 * Per-blank confidence comes from state.blocks[ref.blockId].confidence
 * (one value per block, applied uniformly to every blank in that block).
 * Omitted from the payload when the block has no selected confidence —
 * the schema field is optional.
 */
export function gatherResponses(
  state: RuntimeState,
  refs: Refs,
): GatheredResponses {
  const blanks: Record<string, BlankResult> = {};
  let totalCorrect = 0;
  let totalScored = 0;

  for (const [blankId, ref] of refs.blanks) {
    const correct = scoreBlankAndUpdateState(state, blankId, ref);
    if (correct !== null) totalScored += 1;
    if (correct === true) totalCorrect += 1;
    const result: BlankResult = {
      answer: trimValue(ref.input.value),
      correct: correct === true,
    };
    const blockState = state.blocks[ref.blockId];
    if (blockState?.confidence) {
      result.confidence = blockState.confidence;
    }
    blanks[blankId] = result;
  }

  return {
    blanks,
    score: computeScore(totalCorrect, totalScored),
    totalScored,
  };
}

/**
 * Build the checkpointResults map from per-section state. Includes only
 * sections that have been checked at least once AND have at least one
 * blank — the schema requires CheckpointResult.total to be positive
 * (z.number().int().positive()), so a zero-blank section would fail
 * validation server-side.
 *
 * Returns undefined when no sections qualify (kept out of the payload
 * entirely — schema field is optional, absent is fine).
 */
export function gatherCheckpointResults(
  state: RuntimeState,
): Record<string, CheckpointResultPayload> | undefined {
  const results: Record<string, CheckpointResultPayload> = {};
  let count = 0;
  for (const [sectionId, sectionState] of Object.entries(state.sections)) {
    if (
      sectionState.checked &&
      sectionState.checkedAt !== null &&
      sectionState.total > 0
    ) {
      results[sectionId] = {
        score: sectionState.score,
        total: sectionState.total,
        checkedAt: sectionState.checkedAt,
      };
      count += 1;
    }
  }
  return count > 0 ? results : undefined;
}

export function setStatus(msg: string, kind?: string): void {
  const el = $('.submit-status');
  if (!el) return;
  el.textContent = msg;
  el.className = 'submit-status' + (kind ? ' ' + kind : '');
}

export function setScore(score: number, total: number): void {
  const el = $('.score-display');
  if (!el || total === 0) return;
  const pct = Math.round(score * 100);
  el.textContent =
  'Score: ' + Math.round(score * total) + ' / ' + total + ' (' + pct + '%)';
}

/**
 * Validate the name, gather responses (scoring every blank into state),
 * call onUpdate() to render the final state, then POST to ingest-
 * submission. On success, persist the name to localStorage, mark
 * state.submitted, and clear the persisted activity blob so the next
 * page-load is fresh.
 *
 * onUpdate after gather both renders (DOM reflects re-scored state) and
 * persists. The persist is harmless — clearActivityState on success
 * removes the blob a moment later. Splitting render-only from
 * render+persist would add wiring complexity for marginal benefit.
 */
export function submit(
  config: RuntimeConfig,
  refs: Refs,
  state: RuntimeState,
  onUpdate: () => void,
): void {
  const nameInput = $<HTMLInputElement>('#student-name');
  const name = nameInput ? trimValue(nameInput.value) : '';
  if (!name) {
    setStatus('Please enter your name before submitting.', 'error');
    if (nameInput) nameInput.focus();
    return;
  }
  state.studentName = name;
  saveName(name);

  const data = gatherResponses(state, refs);
  const checkpointResults = gatherCheckpointResults(state);
  onUpdate();

  interface Responses {
    schemaVersion: 2;
    blanks: Record<string, BlankResult>;
    checkpointResults?: Record<string, CheckpointResultPayload>;
  }
  const responses: Responses = {
    schemaVersion: 2,
    blanks: data.blanks,
  };
  if (checkpointResults) {
    responses.checkpointResults = checkpointResults;
  }

  const payload = {
    activityId: config.activityId,
    displayName: name,
    responses,
    score: data.score,
  };

  const button = $<HTMLButtonElement>('.submit-button');
  if (button) button.disabled = true;
  setStatus('Submitting…');

  fetch(config.submissionEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  .then((res) => {
    if (!res.ok) {
      return res.text().then((t) => {
        throw new Error('Submission failed: ' + (t || res.status));
      });
    }
    return res.json();
  })
  .then(() => {
    setStatus('Submitted! You can close this page.', 'success');
    setScore(data.score, data.totalScored);
    state.submitted = true;
    clearActivityState(config);
    if (button) {
      button.disabled = true;
      button.textContent = 'Submitted';
    }
  })
  .catch((err: unknown) => {
    const message =
    err instanceof Error ? err.message : 'Submission failed. Please try again.';
    setStatus(message, 'error');
    if (button) button.disabled = false;
  });
}

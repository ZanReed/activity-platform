// =============================================================================
// runtime/submission.ts — Response gathering + submission
// -----------------------------------------------------------------------------
// Post-6b: iterates refs.blanks (built by init()) instead of re-walking the
// DOM at submit time. Each blank is re-checked via checkBlank, so the final
// submit also refreshes the correct/incorrect classes on every blank
// (preserves pre-6b behavior).
//
// SCHEMA VERSION: the payload sends `responses.schemaVersion: 2`. Stage 11
// fixed the pre-Stage-11 bug that ingest-submission was rejecting v1 with
// a 400; 6b keeps that fix in place.
//
// RuntimeConfig is now imported from config.ts (single source of truth
// post-6a). Submission only uses three of its six fields today
// (activityId, versionNum, submissionEndpoint) but importing the wider
// interface is fine — unused fields don't affect anything, and Stage 14's
// resubmit flow will pick up submissionMode / revisionMode here.
// =============================================================================

import { $ } from './dom.js';
import { checkBlank, trimValue } from './blanks.js';
import type { RuntimeConfig } from './config.js';
import type { Refs } from './refs.js';
import type { RuntimeState } from './state.js';
import { saveName } from './storage.js';

interface BlankResult {
  answer: string;
  correct: boolean;
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

/** Iterate refs.blanks, score each blank, and assemble the payload. */
export function gatherResponses(refs: Refs): GatheredResponses {
  const blanks: Record<string, BlankResult> = {};
  let totalCorrect = 0;
  let totalScored = 0;

  for (const [blankId, ref] of refs.blanks) {
    const correct = checkBlank(ref);
    if (correct !== null) totalScored += 1;
    if (correct === true) totalCorrect += 1;
    blanks[blankId] = {
      answer: trimValue(ref.input.value),
      correct: correct === true,
    };
  }

  return {
    blanks,
    score: computeScore(totalCorrect, totalScored),
    totalScored,
  };
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
 * Validate the name, gather responses, POST to ingest-submission. On
 * success, persist the name to localStorage and mark state.submitted.
 * On HTTP error, surface the error message and re-enable the submit
 * button. On network failure, fall through to the catch with a generic
 * try-again message.
 *
 * Stage 14 will wire localStorage-backed retry, attempt-number
 * reconciliation against the server's canonical value, and revisionMode
 * resubmission. 6b preserves the pre-6b single-shot flow.
 */
export function submit(
  config: RuntimeConfig,
  refs: Refs,
  state: RuntimeState,
): void {
  const nameInput = $<HTMLInputElement>('#student-name');
  const name = nameInput ? trimValue(nameInput.value) : '';
  if (!name) {
    setStatus('Please enter your name before submitting.', 'error');
    if (nameInput) nameInput.focus();
    return;
  }
  // Mirror to state for Stage 14 retry (reads it back from state, not DOM).
  state.studentName = name;
  // Persist the validated name so the next activity on this domain prefills it.
  saveName(name);

  const data = gatherResponses(refs);
  const payload = {
    activityId: config.activityId,
    displayName: name,
    // schemaVersion 2 — ingest-submission rejects v1 with a 400.
    responses: { schemaVersion: 2, blanks: data.blanks },
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

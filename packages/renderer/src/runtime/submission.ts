// =============================================================================
// runtime/submission.ts — Response gathering + submission
// -----------------------------------------------------------------------------
// Gathers every blank into a response payload, computes a fraction score, and
// POSTs to the ingest-submission Edge Function.
//
// SCHEMA VERSION: the payload sends `responses.schemaVersion: 2`. The
// pre-Stage-11 runtime sent `1`, which ingest-submission rejects with a 400
// (the function enforces v2). The blanks shape `{ answer, correct }` was
// already a valid v2 BlankResponse, so the fix is purely the version token.
// (Tracked in RUNTIME.md "Known defect" and STATE.md Nearest next steps.)
//
// Runtime-local types only — no import from @activity/schema (size budget +
// the deliberate parallel-types rule). RuntimeConfig mirrors the activity-
// config JSON blob; if the blob's shape changes, update this interface too.
// =============================================================================

import { $ } from './dom.js';
import { checkBlank, trimValue } from './blanks.js';
import { saveName } from './storage.js';

export interface RuntimeConfig {
  activityId: string;
  versionNum: number;
  submissionEndpoint: string;
}

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
 * Pure score arithmetic, split out from gatherResponses so it is testable
 * without a DOM. A fraction in [0, 1]; zero scored blanks scores 0 (not NaN).
 */
export function computeScore(totalCorrect: number, totalScored: number): number {
  return totalScored > 0 ? totalCorrect / totalScored : 0;
}

/** Walk every `.blank`, score it, and assemble the response payload. */
export function gatherResponses(): GatheredResponses {
  const blanks: Record<string, BlankResult> = {};
  let totalCorrect = 0;
  let totalScored = 0;

  Array.prototype.slice
    .call(document.querySelectorAll<HTMLInputElement>('.blank'))
    .forEach((input: HTMLInputElement) => {
      const id = input.getAttribute('data-blank-id');
      if (!id) return;
      const correct = checkBlank(input);
      if (correct !== null) totalScored += 1;
      if (correct === true) totalCorrect += 1;
      blanks[id] = {
        answer: trimValue(input.value),
        correct: correct === true,
      };
    });

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

export function submit(config: RuntimeConfig): void {
  const nameInput = $<HTMLInputElement>('#student-name');
  const name = nameInput ? trimValue(nameInput.value) : '';
  if (!name) {
    setStatus('Please enter your name before submitting.', 'error');
    if (nameInput) nameInput.focus();
    return;
  }
  // Persist the validated name so the next activity on this domain prefills it.
  saveName(name);

  const data = gatherResponses();
  const payload = {
    activityId: config.activityId,
    displayName: name,
    // schemaVersion 2 — see file header. ingest-submission rejects v1.
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

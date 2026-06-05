// =============================================================================
// runtime/index.ts — Runtime entry point
// -----------------------------------------------------------------------------
// The esbuild entry. Bundled (iife, minified, chrome90) by
// scripts/bundle-renderer.mjs into a generated string module, which
// document.ts inlines into a <script> tag in every published activity page.
//
// Post-Session-4 orchestration:
//   1. init() — config + refs + state in one DOM pass. Null on missing/
//      malformed config → no-op runtime (graceful degradation).
//   2. Restore the student name from cross-activity localStorage.
//   3. Restore per-activity state (typed values + scoring + revealed
//      solutions + section status + confidence) from versioned
//      localStorage. Null on first visit or invalid blob → fresh state.
//   4. Initial render reflects the restored state in the DOM BEFORE any
//      handlers attach. Calls render directly (not onUpdate) so we
//      don't immediately re-persist what we just loaded.
//   5. Define onUpdate as render + persist. Every event handler triggers
//      this single callback after mutating state.
//   6. Wire blanks (blur + input), hints, checkpoints, confidence, submit.
// =============================================================================

import { $ } from './dom.js';
import { init } from './init.js';
import {
  loadStoredName,
  loadActivityState,
  saveActivityState,
  applyStoredState,
} from './storage.js';
import { wireBlanks, wireHints, wireHintModal } from './blanks.js';
import { wireCheckpoints } from './checkpoints.js';
import { wireConfidence } from './confidence.js';
import { render } from './render.js';
import { submit, flushPendingSubmission } from './submission.js';

function bootstrap(): void {
  const result = init();
  if (!result) {
    console.error('[activity-runtime] init failed; falling back to no-op runtime');
    return;
  }
  const { config, refs, state } = result;

  // Restore the student name from cross-activity storage.
  const nameInput = $<HTMLInputElement>('#student-name');
  if (nameInput) {
    const stored = loadStoredName();
    nameInput.value = stored;
    state.studentName = stored;
  }

  // Restore per-version activity state from localStorage. Mutates
  // input values + state.blanks/blocks/sections in place when a blob
  // exists. Null on first visit or invalidated blob — fresh state in
  // either case.
  const stored = loadActivityState(config);
  if (stored) {
    applyStoredState(stored, refs, state);
  }

  // Initial render reflects restored state (correct/incorrect classes,
  // solution slots, locked inputs, confidence radios, section scores)
  // before any event handler attaches. Called directly (not via
  // onUpdate) — no point re-persisting state we just loaded.
  render(state, refs);

  // Single update trigger for every subsequent state mutation: render
  // + persist. Wired to every handler so they don't have to know
  // about either concern.
  const onUpdate = (): void => {
    render(state, refs);
    saveActivityState(config, refs, state);
  };

  wireBlanks(state, refs, onUpdate);
  wireHints(state, refs, onUpdate);
  wireHintModal(state, refs, onUpdate);
  wireCheckpoints(config, state, refs, onUpdate);
  wireConfidence(state, refs, onUpdate);

  const button = $<HTMLButtonElement>('.submit-button');
  if (button) {
    button.addEventListener('click', () => {
      submit(config, refs, state, onUpdate);
    });
  }

  // Recover a submission persisted on a prior load but never confirmed (tab
  // closed mid-flight, or in-page retries exhausted). No-ops when none pending.
  flushPendingSubmission(config, state);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}

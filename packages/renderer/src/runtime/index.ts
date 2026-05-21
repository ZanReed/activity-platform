// =============================================================================
// runtime/index.ts — Runtime entry point
// -----------------------------------------------------------------------------
// The esbuild entry. Bundled (iife, minified, chrome90) by
// scripts/bundle-renderer.mjs into a generated string module, which
// document.ts inlines into a <script> tag in every published activity page.
//
// Post-6b orchestration:
//   1. Call init() — builds config + refs + state in one DOM pass.
//   2. On null (missing/malformed config), log + return. The page stays
//      static (no scoring, no submission), which is the graceful-
//      degradation contract RUNTIME.md promises.
//   3. On success, wire blanks and the submit button against refs + state.
//
// Name persistence: the value is loaded from localStorage before wiring
// and mirrored to state.studentName so the runtime has a single source of
// truth post-init. saveName() runs inside submit() once the name is
// validated.
// =============================================================================

import { $ } from './dom.js';
import { init } from './init.js';
import { loadStoredName } from './storage.js';
import { wireBlanks } from './blanks.js';
import { submit } from './submission.js';

function bootstrap(): void {
  const result = init();
  if (!result) {
    console.error('[activity-runtime] init failed; falling back to no-op runtime');
    return;
  }
  const { config, refs, state } = result;

  // Restore the name from a previous activity on this domain.
  const nameInput = $<HTMLInputElement>('#student-name');
  if (nameInput) {
    const stored = loadStoredName();
    nameInput.value = stored;
    state.studentName = stored;
  }

  wireBlanks(refs);

  const button = $<HTMLButtonElement>('.submit-button');
  if (button) {
    button.addEventListener('click', () => {
      submit(config, refs, state);
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}

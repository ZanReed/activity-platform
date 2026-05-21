// =============================================================================
// runtime/index.ts — Runtime entry point
// -----------------------------------------------------------------------------
// The esbuild entry. Bundled (iife, minified, chrome90) by
// scripts/bundle-renderer.mjs into a generated string module, which document.ts
// inlines into a <script> tag in every published activity page.
//
// Responsibilities: parse the activity-config blob, restore the student's
// name, wire blanks and the submit button, and run on DOM-ready. Name
// persistence (saveName) lives inside submission.ts's submit(), called once
// the name is validated — index.ts only wires the click.
// =============================================================================

import { $ } from './dom.js';
import { loadStoredName } from './storage.js';
import { wireBlanks } from './blanks.js';
import { submit, type RuntimeConfig } from './submission.js';

function init(): void {
  const configEl = document.getElementById('activity-config');
  if (!configEl) return;

  let config: RuntimeConfig;
  try {
    config = JSON.parse(configEl.textContent || '{}');
  } catch {
    console.error('Invalid activity config');
    return;
  }

  // Restore the name from a previous activity on this domain.
  const nameInput = $<HTMLInputElement>('#student-name');
  if (nameInput) nameInput.value = loadStoredName();

  wireBlanks();

  const button = $<HTMLButtonElement>('.submit-button');
  if (button) {
    button.addEventListener('click', () => {
      submit(config);
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

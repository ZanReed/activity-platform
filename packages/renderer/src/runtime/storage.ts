// =============================================================================
// runtime/storage.ts — Student-name persistence
// -----------------------------------------------------------------------------
// Carries the student's name across activities on the same domain, so a
// student filling out several activities only types their name once.
//
// localStorage access is wrapped in try/catch: private-mode / guest-mode
// browsers (and locked-down school Chromebooks) can throw on access. A failure
// degrades to "no remembered name" — never throws to the student.
// =============================================================================

const STORAGE_KEY_NAME = 'activity_student_name';

export function loadStoredName(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_NAME) || '';
  } catch {
    return '';
  }
}

export function saveName(name: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_NAME, name);
  } catch {
    /* private mode etc — ignore */
  }
}

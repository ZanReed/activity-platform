// =============================================================================
// fonts.ts — load an activity font into the APP (editor canvas, drawer preview)
// -----------------------------------------------------------------------------
// The implementation moved to @activity/viewer, which needs exactly the same
// thing for the student worksheet — one loader, two consumers, rather than two
// switch statements that drift the next time a family is added. This module
// stays as the app's import path.
//
// Published pages still get their fonts as @font-face rules pointing at R2
// (renderer typography.ts); that path dies with R2 at S9. Same families, same
// pinned @fontsource versions, different delivery.
// =============================================================================

export { ensureActivityFontLoaded } from '@activity/viewer';

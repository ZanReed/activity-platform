// =============================================================================
// index.ts — Public API for @activity/renderer
// -----------------------------------------------------------------------------
// The renderer exposes one main function: renderActivity. The body-only
// variant (renderBody) is exported for the editor's preview integration —
// in the editor, the surrounding HTML chrome (head, header, runtime) isn't
// needed because the editor IS the chrome.
//
// We also re-export the schema so Edge Functions can do `import { renderActivity,
// ActivityDocument } from '@activity/renderer'` and get both rendering and
// validation in one bundled artifact. This is intentional: the renderer is
// the primary consumer of the schema in production code paths (publish flow,
// preview, eventual SSR), so co-locating the public API makes downstream
// consumers simpler.
// =============================================================================

export { renderActivity } from './document.js';
export type { RenderContext } from './document.js';

// Body-only renderer (no <html>/<head>/<body> wrapper, no header, no submit
// button, no runtime JS). Used by the editor preview integration.
export { renderBody } from './render.js';

// Re-export the schema. Validating inputs against ActivityDocument is part
// of the renderer's contract — anything that doesn't parse here is a
// programmer error, and we want callers to validate before rendering.
export * from '@activity/schema';

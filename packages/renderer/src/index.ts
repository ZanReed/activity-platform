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

// Print-oriented document renderer: same body, no interactive runtime/submit
// chrome, carrying the configured print layer. Foundation for the app's print
// route (Drop C).
export { renderActivityForPrint } from './document.js';

// Body-only renderer (no <html>/<head>/<body> wrapper, no header, no submit
// button, no runtime JS). Used by the editor preview integration.
export { renderBody } from './render.js';

// Stylesheets the renderer inlines into its documents. Exported so a client-side
// consumer that assembles its OWN document (the app's journal-foldable print
// builder, Drop D) can reuse the exact block CSS + KaTeX CSS the renderer emits,
// keeping its offscreen measurement and printed output faithful to the renderer.
export { blockStyles } from './runtime/styles.js';
export { katexCss } from './generated/katex-css.js';

// Activity-wide typography (meta.typography): the font registry behind the
// schema's ActivityFont ids plus the CSS helpers. Exported so the app can
// build the config-drawer menu (FONT_MENU/FONT_REGISTRY), style the editor
// canvas with the same family value (fontFamilyValue — WYSIWYG), and so
// publish-activity and scripts/build-fonts.mjs agree on the R2 layout
// (FONTS_R2_PREFIX).
export {
  FONT_REGISTRY,
  FONT_MENU,
  FONTS_R2_PREFIX,
  fontFamilyValue,
  fontFaceCss,
  typographyStyleTag,
} from './typography.js';
export type { FontSpec } from './typography.js';

// Re-export the schema. Validating inputs against ActivityDocument is part
// of the renderer's contract — anything that doesn't parse here is a
// programmer error, and we want callers to validate before rendering.
export * from '@activity/schema';

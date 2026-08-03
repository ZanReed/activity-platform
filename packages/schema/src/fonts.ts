// =============================================================================
// fonts.ts — the activity font menu, shared by every surface (S5.5 D18A)
// -----------------------------------------------------------------------------
// WHY THIS IS IN THE SCHEMA PACKAGE. `meta.typography.font` is a schema enum, so
// the set of legal ids already lives here; what did not was the human label and
// the CSS family each id means. Those lived in the RENDERER, and the app
// imported them from there — which is fine until the renderer starts retiring
// and the app has to stop importing it. Moving them to the leaf both sides
// already depend on is the only arrangement that needs no new dependency edge:
// the renderer keeps serving published pages until S9, the viewer serves
// everything else, and neither has to import the other.
//
// It had already drifted into THREE copies by the time it moved — the
// renderer's FONT_REGISTRY, the viewer's own CSS_FAMILY map, and the app's menu
// use — which is exactly the failure this prevents: a font added to one and not
// the others is a menu entry that renders as the default and nobody notices.
//
// WHAT IS DELIBERATELY *NOT* SHARED: the fallback stack behind the chosen
// family. The renderer's published page and the viewer's app resolve fonts
// through different pipelines and reasonably disagree about what to fall back
// to, which is why the print parity gate asserts the font by NAME and never by
// computed family string. Each surface passes its own stack.
//
// Also not shared: which WOFF2 files a family ships and where they are hosted.
// That is the renderer's R2 concern, it stays private there, and it dies with
// publishing at S9.
// =============================================================================

import type { ActivityFont } from './document.js';

export interface ActivityFontSpec {
  /** Menu label shown in the config drawer. */
  readonly label: string;
  /**
   * The CSS family name, or null for 'default' — which means "set no family"
   * rather than "set the fallback". A caller distinguishes the two by the null,
   * so a document that chose nothing inherits its surface's own body token
   * instead of pinning a stack that would quietly override it.
   */
  readonly cssFamily: string | null;
}

/**
 * The v1 menu (author-approved 2026-07-08, all SIL OFL). These are not
 * decorative choices: Atkinson Hyperlegible and Andika are low-vision and
 * early-reader faces, Lexend targets reading fluency, Comic Neue is the
 * dyslexia-friendly option. Dropping one silently removes an accessibility
 * decision a teacher made for a specific child.
 */
export const FONT_REGISTRY: Readonly<Record<ActivityFont, ActivityFontSpec>> = {
  default: { label: 'Default (system)', cssFamily: null },
  lexend: { label: 'Lexend', cssFamily: 'Lexend' },
  'atkinson-hyperlegible': {
    label: 'Atkinson Hyperlegible',
    cssFamily: 'Atkinson Hyperlegible',
  },
  andika: { label: 'Andika', cssFamily: 'Andika' },
  'comic-neue': { label: 'Comic Neue', cssFamily: 'Comic Neue' },
};

/** Menu order for the config drawer (default first, then alphabetical). */
export const FONT_MENU: readonly ActivityFont[] = [
  'default',
  'andika',
  'atkinson-hyperlegible',
  'comic-neue',
  'lexend',
];

/**
 * The stack used when a caller does not supply one. Matches what the published
 * page has always used, so the editor canvas — which previews against it —
 * keeps rendering exactly as before this move.
 */
export const DEFAULT_FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

/**
 * The `font-family` VALUE for a font id: the family quoted, with a fallback
 * tail behind it. Returns null for 'default' (no override).
 *
 * `fallbackStack` is a parameter rather than a constant because the surfaces
 * legitimately differ — see the header.
 */
export function fontFamilyValue(
  font: ActivityFont,
  fallbackStack: string = DEFAULT_FONT_STACK,
): string | null {
  const family = FONT_REGISTRY[font].cssFamily;
  return family === null ? null : `"${family}", ${fallbackStack}`;
}

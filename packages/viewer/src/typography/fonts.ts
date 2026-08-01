// =============================================================================
// typography/fonts.ts — the teacher's chosen worksheet font (S5 T4)
// -----------------------------------------------------------------------------
// A teacher picks a font per activity, and the reasons are pedagogical rather
// than decorative: Atkinson Hyperlegible and Andika exist for low-vision and
// early readers, Lexend for reading-fluency research, Comic Neue because
// dyslexic students often read it more easily. Ignoring the setting is not a
// cosmetic regression — it takes an accessibility choice away from the person
// who made it for a specific child.
//
// The viewer was ignoring it entirely: tokens.css has carried the
// --activity-font-family seam since S0 and nothing ever set it.
//
// TWO HALVES, BOTH REQUIRED. Naming the family in CSS does nothing if the font
// was never fetched — it silently falls back, which is the same
// resolves-to-nothing failure the token guard exists to catch. So this module
// owns both: the family NAME and the loading of the files.
//
// WHY IT LIVES IN THE VIEWER. The app's editor had this loader first, and the
// viewer needs exactly the same thing; the app already depends on the viewer,
// so moving it here leaves ONE implementation with two consumers rather than
// two switch statements that drift. It also has to leave the renderer behind
// regardless: published pages fetch these as @font-face rules pointing at R2,
// and R2 hosting dies at S9 (the Cloudflare-exit ruling). Same families, same
// pinned versions, different delivery — Vite serves them.
//
// Dynamic import so a family's CSS (and its WOFF2 files) is fetched only when
// an activity actually asks for it; the shell does not carry four families.
// =============================================================================

import type { ActivityFont } from '@activity/schema';

/**
 * The CSS family name each id resolves to, and the stack behind it.
 *
 * `default` is null on purpose rather than a stack: a document that chose
 * nothing must inherit the viewer's own body token, not pin a family. The
 * caller distinguishes the two by the null.
 */
const CSS_FAMILY: Readonly<Record<ActivityFont, string | null>> = {
  default: null,
  lexend: 'Lexend',
  'atkinson-hyperlegible': 'Atkinson Hyperlegible',
  andika: 'Andika',
  'comic-neue': 'Comic Neue',
};

/** The fallback chain behind whatever the teacher chose. */
const FALLBACK_STACK =
  'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

/**
 * The `font-family` value for an activity font, or null for the default.
 *
 * Null means "do not set the property", which lets the stylesheet's own
 * fallback apply — writing an explicit stack here would override the design
 * token and quietly make `default` mean something different from "our font".
 */
export function activityFontFamily(font: ActivityFont): string | null {
  const family = CSS_FAMILY[font];
  return family === null ? null : `"${family}", ${FALLBACK_STACK}`;
}

const loaded = new Set<ActivityFont>();

/**
 * Fetch a family's files. Idempotent, and a no-op for `default`.
 *
 * Weights mirror what each family actually ships (400/700 plus italics where
 * they exist; Lexend adds 600 and has no italics), so a bold run in a
 * worksheet renders as real bold rather than a synthesised smear.
 *
 * Never rejects: a font that will not load is a worse-looking worksheet, not a
 * broken one, and a rejected promise here would take a render down with it.
 */
export async function ensureActivityFontLoaded(font: ActivityFont): Promise<void> {
  if (font === 'default' || loaded.has(font)) return;
  loaded.add(font);
  try {
    switch (font) {
      case 'lexend':
        await Promise.all([
          import('@fontsource/lexend/400.css'),
          import('@fontsource/lexend/600.css'),
          import('@fontsource/lexend/700.css'),
        ]);
        break;
      case 'atkinson-hyperlegible':
        await Promise.all([
          import('@fontsource/atkinson-hyperlegible/400.css'),
          import('@fontsource/atkinson-hyperlegible/400-italic.css'),
          import('@fontsource/atkinson-hyperlegible/700.css'),
          import('@fontsource/atkinson-hyperlegible/700-italic.css'),
        ]);
        break;
      case 'andika':
        await Promise.all([
          import('@fontsource/andika/400.css'),
          import('@fontsource/andika/400-italic.css'),
          import('@fontsource/andika/700.css'),
          import('@fontsource/andika/700-italic.css'),
        ]);
        break;
      case 'comic-neue':
        await Promise.all([
          import('@fontsource/comic-neue/400.css'),
          import('@fontsource/comic-neue/400-italic.css'),
          import('@fontsource/comic-neue/700.css'),
          import('@fontsource/comic-neue/700-italic.css'),
        ]);
        break;
    }
  } catch {
    // Allow a retry on a later mount rather than caching the failure.
    loaded.delete(font);
  }
}

/** Test seam: forget what has been loaded. */
export function resetLoadedFonts(): void {
  loaded.clear();
}

/**
 * The CSS custom properties a document's typography sets on the worksheet root.
 *
 * Custom properties rather than direct declarations, for the reason the layout
 * seam uses them too: the stylesheet's fallbacks stay in charge when a document
 * chooses nothing, and a later rule (print, phone) can still win. Absent
 * typography — or the `default` font — emits nothing at all, so "the teacher
 * made no choice" and "the teacher chose our default" are the same thing
 * downstream, which is what they should be.
 */
export function typographyVars(
  typography: { font: ActivityFont; fontSize: number } | undefined,
): Record<string, string> {
  if (!typography) return {};
  const vars: Record<string, string> = {};
  const family = activityFontFamily(typography.font);
  if (family !== null) vars['--activity-font-family'] = family;
  // The authored size is in px and the token scale is rem-based; px is what the
  // editor's control produces and what the published page emits, so the two
  // surfaces agree by using the same unit rather than a converted one.
  vars['--activity-font-size'] = `${typography.fontSize}px`;
  return vars;
}

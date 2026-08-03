// =============================================================================
// typography.ts — Activity-wide font + base size (meta.typography)
// -----------------------------------------------------------------------------
// The renderer-side half of the typography feature: the FONT REGISTRY (the CSS
// specifics behind each schema ActivityFont id) and the helpers that turn
// meta.typography into a <style> tag. The schema only constrains the menu; the
// family names, fallback stacks, and WOFF2 file lists live here so a new font
// is one registry row + one upload — no schema change.
//
// THE CSS-VAR SEAM (designed so the parked per-span `textStyle` mark slots in
// additively later):
//
//   :root { --activity-font-family: …; --activity-font-size: …px; }
//
//   body                { font-family: var(--activity-font-family, var(--font-body)); }
//   .activity-container { font-size:   var(--activity-font-size, 1rem); }
//
// The vars are set by a per-document <style> tag (typographyStyleTag), NOT
// inline on the container, because the family must reach elements OUTSIDE
// <main> too (the floating hint popover, the calculator panel). Headings are
// em-relative in blockStyles, so they scale off whichever base is in effect —
// the screen base here, or --print-font-size in @media print (which overrides
// the container's screen font-size, so meta.print.fontSize keeps sole
// ownership of print body sizing; the FAMILY applies in print as well, so
// paper matches screen).
//
// A future textStyle mark rides the same seam: span-level inline styles win
// the cascade over the container defaults, `1.25em`-style sizes compound off
// the activity base, and fontFaceCss below already takes a LIST of families —
// the mark layer just collects the families a document actually uses and
// passes them all. Nothing here needs reworking for it.
//
// HOSTING: the WOFF2 files are SELF-HOSTED on R2 (no Google CDN dependency on
// published pages), uploaded by scripts/build-fonts.mjs from the pinned
// @fontsource/* packages under FONTS_R2_PREFIX. File names are the fontsource-
// canonical `<pkg>-latin-<weight>-<style>.woff2` — the upload script derives
// its list from the same names, so the two stay aligned by construction. If
// the font files themselves ever change (a fontsource glyph update worth
// shipping), bump the `v1` in FONTS_R2_PREFIX — the files are cached immutable.
// =============================================================================

import {
  DEFAULT_FONT_STACK,
  FONT_REGISTRY,
  fontFamilyValue as sharedFontFamilyValue,
  type ActivityFont,
  type Typography,
} from '@activity/schema';

// Re-exported so this package's public API is unchanged by the S5.5 move: the
// published-page code and this package's tests keep importing them from here,
// while the app and viewer now take them from @activity/schema directly (a lint
// rule enforces that they do).
export { FONT_REGISTRY, FONT_MENU } from '@activity/schema';
export type { ActivityFontSpec as FontSpec } from '@activity/schema';

/** Bucket-relative R2 prefix the font files live under (see file header). */
export const FONTS_R2_PREFIX = 'shared/fonts/v1';

// The default body stack — must match --font-body in runtime/styles.ts. Shared
// with every other surface via @activity/schema (S5.5 D18A), which is also
// where the labels and family names now live.
const DEFAULT_STACK = DEFAULT_FONT_STACK;

interface FontFile {
  file: string;
  weight: number;
  style: 'normal' | 'italic';
}

// WHICH FILES EACH FAMILY SHIPS, and where they are hosted, is the one part of
// the font story that stays here: it is an R2 concern, only fontFaceCss below
// consumes it, and it dies with published pages at S9. The labels and family
// NAMES moved to @activity/schema so the app and viewer can read them without
// importing this package (S5.5 D18A).
//
// Weights cover what the editor can author: 400 body, 700 bold (the em-relative
// headings inherit these), plus real italics where the family has them — Lexend
// ships none, so browsers synthesize its italic. Lexend also gets 600
// (headings-3 / UI semibold) since the family provides it.
// Exported for this package's own tests (the file-name pattern is the contract
// scripts/build-fonts.mjs derives its upload list from), but deliberately NOT
// re-exported by index.ts: nothing outside the renderer has any business
// knowing where the WOFF2 files live.
export const FONT_FILES: Record<ActivityFont, FontFile[]> = {
  default: [],
  lexend: [
    { file: 'lexend-latin-400-normal.woff2', weight: 400, style: 'normal' },
    { file: 'lexend-latin-600-normal.woff2', weight: 600, style: 'normal' },
    { file: 'lexend-latin-700-normal.woff2', weight: 700, style: 'normal' },
  ],
  'atkinson-hyperlegible': [
    { file: 'atkinson-hyperlegible-latin-400-normal.woff2', weight: 400, style: 'normal' },
    { file: 'atkinson-hyperlegible-latin-400-italic.woff2', weight: 400, style: 'italic' },
    { file: 'atkinson-hyperlegible-latin-700-normal.woff2', weight: 700, style: 'normal' },
    { file: 'atkinson-hyperlegible-latin-700-italic.woff2', weight: 700, style: 'italic' },
  ],
  andika: [
    { file: 'andika-latin-400-normal.woff2', weight: 400, style: 'normal' },
    { file: 'andika-latin-400-italic.woff2', weight: 400, style: 'italic' },
    { file: 'andika-latin-700-normal.woff2', weight: 700, style: 'normal' },
    { file: 'andika-latin-700-italic.woff2', weight: 700, style: 'italic' },
  ],
  'comic-neue': [
    { file: 'comic-neue-latin-400-normal.woff2', weight: 400, style: 'normal' },
    { file: 'comic-neue-latin-400-italic.woff2', weight: 400, style: 'italic' },
    { file: 'comic-neue-latin-700-normal.woff2', weight: 700, style: 'normal' },
    { file: 'comic-neue-latin-700-italic.woff2', weight: 700, style: 'italic' },
  ],
};

/**
 * The font-family VALUE for a given font id — the registry family quoted,
 * with the default stack as the fallback tail. Used both in the published
 * page's --activity-font-family var and by the editor canvas (WYSIWYG).
 * Returns null for 'default' (no override; --font-body applies).
 */
export function fontFamilyValue(font: ActivityFont): string | null {
  return sharedFontFamilyValue(font, DEFAULT_STACK);
}

/**
 * @font-face rules for the given families (non-default ids only; 'default'
 * contributes nothing). Takes a LIST so the future textStyle mark can embed
 * every family a document uses — the activity-wide layer passes one.
 *
 * fontsBaseUrl is the absolute URL prefix the WOFF2 files live under (the R2
 * public base joined with FONTS_R2_PREFIX). It is renderer-controlled config
 * (publish-activity env / app env), not user input — same trust level as
 * calculatorKitUrl.
 */
export function fontFaceCss(
  fonts: readonly ActivityFont[],
  fontsBaseUrl: string,
): string {
  const base = fontsBaseUrl.replace(/\/+$/, '');
  const seen = new Set<ActivityFont>();
  let css = '';
  for (const font of fonts) {
    if (seen.has(font)) continue;
    seen.add(font);
    const spec = FONT_REGISTRY[font];
    if (!spec.cssFamily) continue;
    for (const f of FONT_FILES[font]) {
      css +=
        '@font-face{' +
        `font-family:"${spec.cssFamily}";` +
        `font-style:${f.style};` +
        `font-weight:${f.weight};` +
        // swap: text renders immediately in the fallback stack, then reflows —
        // a worksheet must never block on a font download.
        'font-display:swap;' +
        `src:url("${base}/${f.file}") format("woff2");` +
        '}';
    }
  }
  return css;
}

/**
 * The complete per-document typography <style> tag: @font-face rules for the
 * selected family plus the :root vars the block CSS reads. Returns '' when the
 * document has no typography config (pre-typography documents and untouched
 * new ones — their pages carry zero extra bytes).
 *
 * Without a fontsBaseUrl (dev without R2 configured) the @font-face rules are
 * omitted — a rule pointing nowhere just delays fallback — but the vars still
 * apply, so sizing works and the family degrades to the default stack.
 */
export function typographyStyleTag(
  typography: Typography | undefined,
  fontsBaseUrl?: string,
): string {
  if (!typography) return '';
  const family = fontFamilyValue(typography.font);
  const faces =
    family && fontsBaseUrl ? fontFaceCss([typography.font], fontsBaseUrl) : '';
  // Both vars are emitted whenever typography is present: the stored config is
  // what renders, deterministically — the base size pins to px even at the
  // 16px default so screen output can't drift with per-browser defaults once
  // a teacher has touched typography at all.
  const vars =
    ':root{' +
    (family ? `--activity-font-family:${family};` : '') +
    `--activity-font-size:${typography.fontSize}px;` +
    '}';
  return '<style>' + faces + vars + '</style>';
}

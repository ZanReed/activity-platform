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

import type { ActivityFont, Typography } from '@activity/schema';

/** Bucket-relative R2 prefix the font files live under (see file header). */
export const FONTS_R2_PREFIX = 'shared/fonts/v1';

// The default body stack — must match --font-body in runtime/styles.ts. Also
// used as the fallback tail behind each downloadable family so a page whose
// fonts haven't loaded (or a dev environment with no R2 base URL) degrades to
// exactly the default look.
const DEFAULT_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

interface FontFile {
  file: string;
  weight: number;
  style: 'normal' | 'italic';
}

export interface FontSpec {
  /** Menu label shown in the config drawer. */
  label: string;
  /**
   * The @font-face / font-family name, or null for 'default' (no download,
   * no family override — the --font-body stack applies).
   */
  cssFamily: string | null;
  /** WOFF2 files to embed as @font-face rules (empty for 'default'). */
  files: FontFile[];
}

// v1 menu (author-approved 2026-07-08, all SIL OFL). Weights cover what the
// editor can author: 400 body, 700 bold (the em-relative headings inherit
// these), plus real italics where the family has them — Lexend ships none, so
// browsers synthesize its italic. Lexend also gets 600 (headings-3 / UI
// semibold) since the family provides it.
export const FONT_REGISTRY: Record<ActivityFont, FontSpec> = {
  default: {
    label: 'Default (system)',
    cssFamily: null,
    files: [],
  },
  lexend: {
    label: 'Lexend',
    cssFamily: 'Lexend',
    files: [
      { file: 'lexend-latin-400-normal.woff2', weight: 400, style: 'normal' },
      { file: 'lexend-latin-600-normal.woff2', weight: 600, style: 'normal' },
      { file: 'lexend-latin-700-normal.woff2', weight: 700, style: 'normal' },
    ],
  },
  'atkinson-hyperlegible': {
    label: 'Atkinson Hyperlegible',
    cssFamily: 'Atkinson Hyperlegible',
    files: [
      { file: 'atkinson-hyperlegible-latin-400-normal.woff2', weight: 400, style: 'normal' },
      { file: 'atkinson-hyperlegible-latin-400-italic.woff2', weight: 400, style: 'italic' },
      { file: 'atkinson-hyperlegible-latin-700-normal.woff2', weight: 700, style: 'normal' },
      { file: 'atkinson-hyperlegible-latin-700-italic.woff2', weight: 700, style: 'italic' },
    ],
  },
  andika: {
    label: 'Andika',
    cssFamily: 'Andika',
    files: [
      { file: 'andika-latin-400-normal.woff2', weight: 400, style: 'normal' },
      { file: 'andika-latin-400-italic.woff2', weight: 400, style: 'italic' },
      { file: 'andika-latin-700-normal.woff2', weight: 700, style: 'normal' },
      { file: 'andika-latin-700-italic.woff2', weight: 700, style: 'italic' },
    ],
  },
  'comic-neue': {
    label: 'Comic Neue',
    cssFamily: 'Comic Neue',
    files: [
      { file: 'comic-neue-latin-400-normal.woff2', weight: 400, style: 'normal' },
      { file: 'comic-neue-latin-400-italic.woff2', weight: 400, style: 'italic' },
      { file: 'comic-neue-latin-700-normal.woff2', weight: 700, style: 'normal' },
      { file: 'comic-neue-latin-700-italic.woff2', weight: 700, style: 'italic' },
    ],
  },
};

// Menu order for the config drawer (default first, then alphabetical).
export const FONT_MENU: ActivityFont[] = [
  'default',
  'andika',
  'atkinson-hyperlegible',
  'comic-neue',
  'lexend',
];

/**
 * The font-family VALUE for a given font id — the registry family quoted,
 * with the default stack as the fallback tail. Used both in the published
 * page's --activity-font-family var and by the editor canvas (WYSIWYG).
 * Returns null for 'default' (no override; --font-body applies).
 */
export function fontFamilyValue(font: ActivityFont): string | null {
  const spec = FONT_REGISTRY[font];
  if (!spec.cssFamily) return null;
  return `"${spec.cssFamily}", ${DEFAULT_STACK}`;
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
    for (const f of spec.files) {
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

// =============================================================================
// fonts.ts — load an activity font into the APP (editor canvas, drawer preview)
// -----------------------------------------------------------------------------
// Published pages get their fonts as @font-face rules pointing at R2 (renderer
// typography.ts). The EDITOR can't ride those — dev machines may have no R2
// base configured, and authoring must work offline — so the app loads the same
// families from the same pinned @fontsource packages the R2 upload script
// (scripts/build-fonts.mjs) draws from. Same version, same bytes, different
// delivery: Vite serves them. That keeps "editor shows exactly what the
// published page shows" true without coupling authoring to the CDN/R2 path.
//
// Dynamic import() so a family's CSS (and the font files it references) is
// fetched only when a teacher actually selects it — the app bundle doesn't
// grow by four font families. Loading is idempotent (Vite caches the module).
//
// The weight lists mirror FONT_REGISTRY in the renderer (400/700 + italics
// where the family has them; Lexend adds 600, no italics). The registry's
// cssFamily names match what these fontsource files declare, so a single
// font-family value works in both worlds.
// =============================================================================

import type { ActivityFont } from '@activity/schema';

const loaded = new Set<ActivityFont>();

export async function ensureActivityFontLoaded(
  font: ActivityFont,
): Promise<void> {
  if (font === 'default' || loaded.has(font)) return;
  loaded.add(font);
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
}

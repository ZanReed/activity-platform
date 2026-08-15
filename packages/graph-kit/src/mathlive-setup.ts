// =============================================================================
// mathlive-setup.ts — one-time MathLive global config (MA-T6)
// -----------------------------------------------------------------------------
// MathfieldElement.fontsDirectory / soundsDirectory are STATIC properties, so
// they must be set once, before ANY mathfield mounts. Both mathfield users in
// the kit — the calculator AND the Model A in-equation prompts — call
// configureMathLive() so the fonts are set regardless of which one a page has.
// (Previously only the calculator set them, so a math-prompt page without a
// calculator got MathLive's default font path — wrong under a bundled kit.)
//
// Fonts are SELF-HOSTED as a SIBLING of this module's own chunk (MA-D7's
// rationale, post-R2 home): no jsDelivr dependency on the student's path,
// where a school firewall blocking the CDN would leave the equation in
// fallback glyphs. We derive the fonts URL from the module URL
// (import.meta.url) — `<origin>/assets/mathlive-fonts/v<version>/` in the
// built app — and the app's build makes that derivation TRUE by copying the
// installed mathlive's woff2 files to exactly that path (the
// `activity:mathlive-fonts` plugin in packages/app/vite.config.ts, which also
// fails the build if MATHLIVE_VERSION drifts from the installed package). In
// dev the module is served from localhost where no fonts sibling exists, so
// we fall back to the CDN — dev isn't a student.
//
// [TOMBSTONE 2026-08-15, D-13 teardown] This derivation was born for the
// R2-hosted kit (`${R2}/shared/graph-kit-<hash>.js` + fonts uploaded next to
// it by `pnpm build:mathlive-fonts`). The kit went app-bundled at S9 Drop 4,
// which silently broke the derivation in production (no fonts at the derived
// path — 404s, fallback glyphs) until the vite plugin restored it from the
// app side; the uploader script and the bucket are gone.
// =============================================================================

import { MathfieldElement } from 'mathlive';

// Bump alongside the `mathlive` dependency. Guarded: the app build FAILS if
// this constant and the installed mathlive version diverge (vite.config.ts).
const MATHLIVE_VERSION = '0.109.2';

function fontsDirectory(): string {
  try {
    const here = new URL(import.meta.url);
    // Production: the kit is served from R2 over https; self-host the fonts as a
    // sibling under shared/. Dev (http localhost / file://): fall back to the CDN.
    if (
      here.protocol === 'https:' &&
      here.hostname !== 'localhost' &&
      here.hostname !== '127.0.0.1'
    ) {
      return new URL(`mathlive-fonts/v${MATHLIVE_VERSION}/`, here).href.replace(
        /\/$/,
        '',
      );
    }
  } catch {
    // import.meta.url unavailable — fall through to the CDN.
  }
  return `https://cdn.jsdelivr.net/npm/mathlive@${MATHLIVE_VERSION}/dist/fonts`;
}

let configured = false;
export function configureMathLive(): void {
  if (configured) return;
  configured = true;
  MathfieldElement.fontsDirectory = fontsDirectory();
  // A field that beeps on every key is classroom noise, and it avoids extra
  // fetches (the sounds are their own CDN assets).
  MathfieldElement.soundsDirectory = null;
}

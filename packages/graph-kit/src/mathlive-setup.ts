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
// Fonts are SELF-HOSTED on R2 alongside the kit (MA-D7): no jsDelivr dependency
// on the student's path, where a school firewall blocking the CDN would leave
// the equation in fallback glyphs. The published kit is served from
// `${R2}/shared/graph-kit-<hash>.js`, and the fonts sit next to it at
// `${R2}/shared/mathlive-fonts/v<version>/` — so we derive the fonts URL from
// the kit's own module URL (import.meta.url; esbuild provides it, the same way
// the kit resolves its lazy chunk). In the dev editor the kit is imported from
// localhost where the R2 fonts don't exist, so we fall back to the CDN there —
// dev isn't a student. Upload the fonts with `pnpm build:mathlive-fonts`.
// =============================================================================

import { MathfieldElement } from 'mathlive';

// Bump alongside the `mathlive` dependency AND the version prefix in
// scripts/build-mathlive-fonts.mjs (the R2 path is immutable per version).
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

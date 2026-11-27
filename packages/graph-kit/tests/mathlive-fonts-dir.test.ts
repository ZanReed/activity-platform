/**
 * @vitest-environment jsdom
 */
// =============================================================================
// mathlive-fonts-dir.test.ts — the dev CDN fonts path is a real folder
// -----------------------------------------------------------------------------
// Off the production origin, configureMathLive() points MathLive at jsDelivr.
// Until 2026-11-27 that URL ended in `dist/fonts`, a folder the mathlive
// package does not have, so every math field in dev 404'd all 20 KaTeX fonts
// and fell back to system glyphs. jsDelivr serves the npm package as
// published, so the path after `mathlive@<version>/` must name a folder the
// INSTALLED package has, holding the fonts — checked here against
// node_modules rather than the network.
// =============================================================================

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

// MathLive's custom element does not load under jsdom (see
// calculator-destroy-mid-load.test.ts); only the static setters matter here.
const holder = vi.hoisted(() => ({
  MathfieldElement: class {
    static fontsDirectory: string | null = null;
    static soundsDirectory: string | null = null;
  },
}));
vi.mock('mathlive', () => holder);

import { configureMathLive } from '../src/mathlive-setup.js';

// mathlive's `exports` map hides package.json, so read graph-kit's own link
// (import.meta.url is http: under jsdom, so this uses vitest's __dirname).
const pkgDir = join(__dirname, '..', 'node_modules', 'mathlive');
const installed = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8')).version as string;

describe('the dev CDN fonts directory', () => {
  configureMathLive();
  const url = holder.MathfieldElement.fontsDirectory ?? '';

  it('is the jsDelivr URL for the installed mathlive version', () => {
    expect(url.startsWith(`https://cdn.jsdelivr.net/npm/mathlive@${installed}/`)).toBe(true);
  });

  it('names a folder in the installed package that holds the fonts', () => {
    const rel = url.split(`mathlive@${installed}/`)[1] ?? '';
    const dir = join(pkgDir, rel);
    expect(existsSync(dir), `${rel} is not a folder in mathlive@${installed}`).toBe(true);
    expect(readdirSync(dir)).toContain('KaTeX_Main-Regular.woff2');
  });
});

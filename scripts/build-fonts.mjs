// =============================================================================
// scripts/build-fonts.mjs — Upload the activity typography WOFF2 files to R2
// -----------------------------------------------------------------------------
// The activity-wide typography feature (meta.typography) self-hosts its fonts
// on R2 — published pages must not depend on a Google CDN. The WOFF2 files
// come from the PINNED @fontsource/* devDependencies (versioned, SIL OFL,
// license files ship in each package), so "which bytes are we serving" is
// answered by pnpm-lock.yaml, not by a manual download.
//
// Files go to shared/fonts/v1/<file> — the layout the renderer's FONT_REGISTRY
// (packages/renderer/src/typography.ts) references via FONTS_R2_PREFIX. The
// file NAMES are the fontsource-canonical `<pkg>-latin-<weight>-<style>.woff2`
// and the FONTS table below must stay in step with that registry: a renderer
// test (typography.test.ts) pins the naming pattern, and this script fails
// loudly if a listed file is missing from node_modules. The files are cached
// immutable, so if the font BYTES ever need to change (a fontsource glyph
// update worth shipping), bump the v1 prefix here AND in FONTS_R2_PREFIX.
//
// Unlike build-graph-kit there is no build step and no manifest: file names
// are stable constants, so this is upload-only. Idempotent — re-running PUTs
// the same bytes to the same keys.
//
// Run (creds auto-load from .env.r2, same as build:graph-kit):
//   pnpm build:fonts
// =============================================================================

import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { readFile } from 'node:fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// Bucket-relative destination prefix. Must equal FONTS_R2_PREFIX in
// packages/renderer/src/typography.ts (see the version-bump note above).
const FONTS_R2_PREFIX = 'shared/fonts/v1';

// package name → latin WOFF2 files to upload. Mirrors FONT_REGISTRY's file
// lists: 400/700 (+ real italics where the family has them; Lexend ships no
// italics — browsers synthesize), plus Lexend 600 for semibold headings.
const FONTS = {
  '@fontsource/lexend': [
    'lexend-latin-400-normal.woff2',
    'lexend-latin-600-normal.woff2',
    'lexend-latin-700-normal.woff2',
  ],
  '@fontsource/atkinson-hyperlegible': [
    'atkinson-hyperlegible-latin-400-normal.woff2',
    'atkinson-hyperlegible-latin-400-italic.woff2',
    'atkinson-hyperlegible-latin-700-normal.woff2',
    'atkinson-hyperlegible-latin-700-italic.woff2',
  ],
  '@fontsource/andika': [
    'andika-latin-400-normal.woff2',
    'andika-latin-400-italic.woff2',
    'andika-latin-700-normal.woff2',
    'andika-latin-700-italic.woff2',
  ],
  '@fontsource/comic-neue': [
    'comic-neue-latin-400-normal.woff2',
    'comic-neue-latin-400-italic.woff2',
    'comic-neue-latin-700-normal.woff2',
    'comic-neue-latin-700-italic.woff2',
  ],
};

// ---- 1. Collect the files (fail loudly on a missing one) --------------------
const uploads = [];
for (const [pkg, files] of Object.entries(FONTS)) {
  for (const file of files) {
    const path = resolve(root, 'node_modules', pkg, 'files', file);
    let bytes;
    try {
      bytes = await readFile(path);
    } catch {
      throw new Error(
        `Missing ${pkg}/files/${file} — run pnpm install, or update the FONTS ` +
          'table if the fontsource file layout changed.',
      );
    }
    uploads.push({ name: file, bytes });
  }
}

console.log(`activity fonts (${uploads.length} files -> ${FONTS_R2_PREFIX}/):`);
for (const u of uploads) {
  console.log(`  ${u.name}  —  ${(u.bytes.length / 1024).toFixed(1)} KiB`);
}

// ---- 2. Upload to R2 (only with creds) ---------------------------------------
// Same env contract + paste-artifact guards as build-graph-kit.mjs (see the
// longer explanations there); a no-creds run just lists the files.
const env = (k) => process.env[k] ?? '';
const haveCreds =
  env('R2_ACCOUNT_ID') &&
  env('R2_ACCESS_KEY_ID') &&
  env('R2_SECRET_ACCESS_KEY') &&
  env('R2_BUCKET_NAME');

if (!haveCreds) {
  console.log('');
  console.log('R2 upload SKIPPED (no R2 creds in env). Nothing was uploaded.');
  console.log('Fill in .env.r2 (see .env.r2.example) and re-run pnpm build:fonts.');
} else {
  const shapeErrors = [];
  if (!/^[0-9a-f]{32}$/i.test(env('R2_ACCOUNT_ID')))
    shapeErrors.push('R2_ACCOUNT_ID should be 32 hex chars (Cloudflare account id)');
  if (!/^[0-9a-f]{32}$/i.test(env('R2_ACCESS_KEY_ID')))
    shapeErrors.push('R2_ACCESS_KEY_ID should be 32 hex chars');
  if (!/^[0-9a-f]{64}$/i.test(env('R2_SECRET_ACCESS_KEY')))
    shapeErrors.push(
      'R2_SECRET_ACCESS_KEY should be 64 hex chars (the S3 secret, NOT the bearer "Token value")',
    );
  const corrupted = ['R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME'].filter(
    (k) => /[^\x21-\x7e]/.test(env(k)),
  );
  if (corrupted.length)
    shapeErrors.push(
      `smart quotes / whitespace in ${corrupted.join(', ')} — retype with straight quotes`,
    );
  if (shapeErrors.length) {
    console.error('');
    for (const e of shapeErrors) console.error('R2 cred problem: ' + e);
    console.error('Nothing was uploaded. (See scripts/build-graph-kit.mjs for the classic mistakes.)');
    process.exit(1);
  }

  const { AwsClient } = await import('aws4fetch');
  const client = new AwsClient({
    accessKeyId: env('R2_ACCESS_KEY_ID'),
    secretAccessKey: env('R2_SECRET_ACCESS_KEY'),
    service: 's3',
    region: 'auto',
  });
  const endpoint = `https://${env('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`;
  const bucket = env('R2_BUCKET_NAME');
  for (const u of uploads) {
    const key = `${FONTS_R2_PREFIX}/${u.name}`;
    const res = await client.fetch(`${endpoint}/${bucket}/${key}`, {
      method: 'PUT',
      body: u.bytes,
      headers: {
        'Content-Type': 'font/woff2',
        // Immutable: the v1 prefix versions the bytes, so each URL never
        // changes meaning. WOFF2 is already compressed; no edge job needed.
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`R2 PUT ${key} failed: ${res.status} ${res.statusText} ${detail}`.trim());
    }
    console.log('Uploaded: ' + key);
  }
  const base = env('R2_PUBLIC_URL_BASE').replace(/\/+$/, '');
  if (base) console.log('Fonts base URL: ' + base + '/' + FONTS_R2_PREFIX);
  console.log('Done. Published pages reference these via publish-activity (redeploy if not yet done).');
}

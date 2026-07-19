// =============================================================================
// scripts/build-mathlive-fonts.mjs — Upload MathLive's WOFF2 fonts to R2 (MA-T6)
// -----------------------------------------------------------------------------
// Model A puts an interactive MathLive field on published pages. MathLive loads
// its glyph fonts from MathfieldElement.fontsDirectory; by default that points
// at a CDN (jsDelivr), which a school firewall can block, leaving the equation
// in fallback glyphs. So we self-host the fonts on R2 next to the kit and point
// fontsDirectory there (see packages/graph-kit/src/mathlive-setup.ts).
//
// Files go to shared/mathlive-fonts/v<version>/<file>. The kit derives that URL
// from its own module URL (a sibling under shared/), so this prefix + the
// MATHLIVE_VERSION constant in mathlive-setup.ts MUST stay in step (bump both
// when the `mathlive` dependency bumps). The bytes come from the PINNED
// `mathlive` dependency (pnpm-lock.yaml answers "which bytes"). Cached immutable;
// upload-only (no build step), idempotent.
//
// Run (creds auto-load from .env.r2, same as build:fonts / build:graph-kit):
//   pnpm build:mathlive-fonts
// =============================================================================

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { readdir, readFile } from 'node:fs/promises';

// Keep in step with MATHLIVE_VERSION in packages/graph-kit/src/mathlive-setup.ts.
const MATHLIVE_VERSION = '0.109.2';
const FONTS_R2_PREFIX = `shared/mathlive-fonts/v${MATHLIVE_VERSION}`;

// ---- 1. Locate + collect MathLive's font files -------------------------------
// mathlive is graph-kit's dependency (pnpm doesn't hoist it to the repo root),
// so resolve it from graph-kit's package, not this script's location.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(resolve(root, 'packages/graph-kit/package.json'));
// mathlive's `exports` map hides package.json, so resolve the main entry (which
// sits at the package root, a sibling of fonts/) and take its directory.
const mathliveDir = dirname(require.resolve('mathlive'));
const fontsDir = resolve(mathliveDir, 'fonts');

let files;
try {
  files = (await readdir(fontsDir)).filter((f) => f.endsWith('.woff2'));
} catch {
  throw new Error(
    `Could not read ${fontsDir} — run pnpm install (mathlive@${MATHLIVE_VERSION} ` +
      'must be present with its fonts/ directory).',
  );
}
if (files.length === 0) {
  throw new Error(`No .woff2 files under ${fontsDir} — did the mathlive layout change?`);
}

const uploads = [];
for (const file of files) {
  uploads.push({ name: file, bytes: await readFile(resolve(fontsDir, file)) });
}

console.log(`mathlive fonts (${uploads.length} files -> ${FONTS_R2_PREFIX}/):`);
for (const u of uploads) {
  console.log(`  ${u.name}  —  ${(u.bytes.length / 1024).toFixed(1)} KiB`);
}

// ---- 2. Upload to R2 (only with creds) ---------------------------------------
// Same env contract + paste-artifact guards as build-fonts.mjs / build-graph-kit.
const env = (k) => process.env[k] ?? '';
const haveCreds =
  env('R2_ACCOUNT_ID') &&
  env('R2_ACCESS_KEY_ID') &&
  env('R2_SECRET_ACCESS_KEY') &&
  env('R2_BUCKET_NAME');

if (!haveCreds) {
  console.log('');
  console.log('R2 upload SKIPPED (no R2 creds in env). Nothing was uploaded.');
  console.log('Fill in .env.r2 (see .env.r2.example) and re-run pnpm build:mathlive-fonts.');
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
        // Immutable: the versioned prefix pins the bytes, so each URL never
        // changes meaning. WOFF2 is already compressed.
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
  if (base) console.log('MathLive fonts base URL: ' + base + '/' + FONTS_R2_PREFIX);
  console.log('Done. The kit points MathfieldElement.fontsDirectory here (mathlive-setup.ts).');
}

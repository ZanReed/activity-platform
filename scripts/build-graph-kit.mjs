// =============================================================================
// scripts/build-graph-kit.mjs — Build the @activity/graph-kit bundle for R2
// -----------------------------------------------------------------------------
// The calculator widget (and later the rest of the graphing kit) is too heavy to
// inline into published HTML — MathLive + math.js is the largest payload the
// platform ships. So it lives as ONE shared, content-hashed ESM bundle on
// Cloudflare R2, lazy-import()ed by a published page only on the first summon
// click and then browser-cached across every calculator activity.
//
// This script:
//   1. esbuilds packages/graph-kit/src/index.ts -> a single minified ESM bundle.
//   2. Content-hashes it -> graph-kit-<hash>.js (immutable, cache-shareable;
//      same source => same hash, so re-running is idempotent).
//   3. Writes the committed manifest supabase/functions/_shared/graph-kit-
//      manifest.ts, which publish-activity reads to build the kit URL.
//   4. Uploads it to R2 under shared/<filename> — ONLY when R2 creds are in the
//      environment. Without them it builds + writes the manifest and skips the
//      upload (so a no-creds run, e.g. CI or a dev machine, still refreshes the
//      manifest). The author runs it WITH creds to actually publish the asset.
//
// MathLive fonts are NOT uploaded here — the kit points MathfieldElement at the
// version-matched jsDelivr CDN (same pattern as the renderer's KaTeX fonts).
// Brotli is handled by Cloudflare's edge compression; we upload plain JS.
//
// Run:
//   pnpm build:graph-kit                  # build + manifest only
//   R2_ACCOUNT_ID=… R2_ACCESS_KEY_ID=… R2_SECRET_ACCESS_KEY=… \
//   R2_BUCKET_NAME=… R2_PUBLIC_URL_BASE=… pnpm build:graph-kit   # + upload
//
// After a build that changes the hash: commit the manifest and redeploy
// publish-activity so it serves the new URL.
// =============================================================================

import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// ---- 1. Build ---------------------------------------------------------------
const entry = resolve(root, 'packages/graph-kit/src/index.ts');
const outDir = resolve(root, 'packages/graph-kit/dist');
await mkdir(outDir, { recursive: true });

const result = await build({
  entryPoints: [entry],
  bundle: true,
  // ESM: the published page consumes it via dynamic import(); the editor preview
  // imports the source directly (this bundle is the published-page artifact).
  format: 'esm',
  platform: 'browser',
  target: 'chrome90', // school Chromebooks (matches the runtime)
  minify: true,
  sourcemap: 'external', // dev/debug artifact, gitignored under dist/
  write: false,
  outdir: outDir, // not written (write:false), but esbuild needs it to name the map
  logLevel: 'info',
});

const jsFile = result.outputFiles.find((f) => f.path.endsWith('.js'));
if (!jsFile) throw new Error('graph-kit build produced no JS output — aborting.');
const code = jsFile.contents; // Uint8Array

// ---- 2. Content hash --------------------------------------------------------
const hash = createHash('sha256').update(code).digest('hex').slice(0, 16);
const filename = `graph-kit-${hash}.js`;
await writeFile(resolve(outDir, filename), code);
const mapFile = result.outputFiles.find((f) => f.path.endsWith('.map'));
if (mapFile) await writeFile(resolve(outDir, `${filename}.map`), mapFile.contents);

// ---- 3. Manifest (committed; read by publish-activity) ----------------------
const manifestPath = resolve(
  root,
  'supabase/functions/_shared/graph-kit-manifest.ts',
);
const manifest =
  '// =============================================================================\n' +
  '// _shared/graph-kit-manifest.ts — GENERATED FILE, DO NOT EDIT\n' +
  '// -----------------------------------------------------------------------------\n' +
  '// Produced by scripts/build-graph-kit.mjs. The content-hashed filename of the\n' +
  '// graphing-kit bundle on R2 (under shared/). publish-activity joins it with\n' +
  '// R2_PUBLIC_URL_BASE to form the calculatorKitUrl it passes to the renderer.\n' +
  '// Re-run `pnpm build:graph-kit` after any change to packages/graph-kit, commit\n' +
  '// this file, re-upload the bundle, and redeploy publish-activity.\n' +
  '// =============================================================================\n' +
  '\n' +
  `export const CALCULATOR_KIT_FILE = ${JSON.stringify(filename)};\n`;
await writeFile(manifestPath, manifest);

// ---- 4. Upload to R2 (only with creds) --------------------------------------
const env = (k) => process.env[k] ?? '';
const haveCreds =
  env('R2_ACCOUNT_ID') &&
  env('R2_ACCESS_KEY_ID') &&
  env('R2_SECRET_ACCESS_KEY') &&
  env('R2_BUCKET_NAME');

const gzKiB = (gzipSync(code).length / 1024).toFixed(1);
const rawKiB = (code.length / 1024).toFixed(1);

console.log('');
console.log('graph-kit bundle: ' + filename);
console.log(`  ${rawKiB} KiB minified · ${gzKiB} KiB gzip`);
console.log('manifest: ' + manifestPath);

if (!haveCreds) {
  console.log('');
  console.log('R2 upload SKIPPED (no R2 creds in env). Built + manifest written.');
  console.log('To publish the asset, re-run with R2_ACCOUNT_ID / R2_ACCESS_KEY_ID /');
  console.log('R2_SECRET_ACCESS_KEY / R2_BUCKET_NAME (+ R2_PUBLIC_URL_BASE) set.');
} else {
  const { AwsClient } = await import('aws4fetch');
  const client = new AwsClient({
    accessKeyId: env('R2_ACCESS_KEY_ID'),
    secretAccessKey: env('R2_SECRET_ACCESS_KEY'),
    service: 's3',
    region: 'auto',
  });
  const endpoint = `https://${env('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`;
  const key = `shared/${filename}`;
  const res = await client.fetch(`${endpoint}/${env('R2_BUCKET_NAME')}/${key}`, {
    method: 'PUT',
    body: code,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      // Immutable: the filename is content-hashed, so this exact URL never
      // changes meaning. Cloudflare brotli-compresses JS at the edge.
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`R2 PUT ${key} failed: ${res.status} ${res.statusText} ${detail}`.trim());
  }
  const base = env('R2_PUBLIC_URL_BASE').replace(/\/+$/, '');
  console.log('');
  console.log('Uploaded to R2: ' + key);
  if (base) console.log('Public URL: ' + base + '/' + key);
  console.log('Now commit the manifest and redeploy publish-activity.');
}

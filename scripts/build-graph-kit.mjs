// =============================================================================
// scripts/build-graph-kit.mjs — Build the @activity/graph-kit bundles for R2
// -----------------------------------------------------------------------------
// The graphing kit is too heavy to inline into published HTML, so it lives as
// content-hashed ESM on Cloudflare R2, lazy-import()ed by a published page only
// on the first summon click and then browser-cached across activities.
//
// CODE-SPLIT (the "lazy-split" decision): esbuild splitting produces
//   - graph-kit-<hash>.js          — the entry: calculator + MathLive + math.js
//                                     (~264 KiB gz). Loaded on summon.
//   - graph-kit-chunk-<hash>.js    — JSXGraph (~240 KiB gz). The entry dynamic-
//                                     imports it ONLY in graphing mode, so a
//                                     scientific-only calculator never fetches it.
// The entry references its chunk by a relative URL, which resolves against the
// entry's own location on R2 (same origin) — so publish-activity only needs the
// ENTRY filename (the manifest); the chunk rides along.
//
// This script:
//   1. esbuilds packages/graph-kit/src/index.ts with splitting -> entry + chunks.
//   2. Writes the committed manifest with the ENTRY filename (content-hashed by
//      esbuild; same source => same hashes, so re-running is idempotent).
//   3. Uploads EVERY .js output to shared/<filename> — ONLY when R2 creds are in
//      the env (the author/deploy step). A no-creds run builds + rewrites the
//      manifest and skips the upload.
//
// MathLive fonts come from the version-matched jsDelivr CDN (not uploaded; same
// pattern as the renderer's KaTeX fonts). Brotli is Cloudflare's edge job.
//
// Run:
//   pnpm build:graph-kit                  # build + manifest only
//   R2_ACCOUNT_ID=… R2_ACCESS_KEY_ID=… R2_SECRET_ACCESS_KEY=… \
//   R2_BUCKET_NAME=… R2_PUBLIC_URL_BASE=… pnpm build:graph-kit   # + upload
//
// After a build that changes the hashes: commit the manifest, re-upload (with
// creds), and redeploy publish-activity so it serves the new entry URL.
// =============================================================================

import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, basename } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// ---- 1. Build (code-split) --------------------------------------------------
const entry = resolve(root, 'packages/graph-kit/src/index.ts');
const outDir = resolve(root, 'packages/graph-kit/dist');
await mkdir(outDir, { recursive: true });

const result = await build({
  entryPoints: { 'graph-kit': entry }, // [name] = 'graph-kit'
  bundle: true,
  splitting: true, // JSXGraph (via board.ts's dynamic import) → its own chunk
  format: 'esm', // required for splitting; the page consumes via import()
  platform: 'browser',
  target: 'chrome90', // school Chromebooks (matches the runtime)
  minify: true,
  sourcemap: 'external', // dev/debug artifact, gitignored under dist/
  entryNames: '[name]-[hash]', // graph-kit-<hash>.js
  chunkNames: 'graph-kit-chunk-[hash]', // graph-kit-chunk-<hash>.js
  write: false,
  outdir: outDir,
  metafile: true,
  logLevel: 'info',
});

// Identify the entry output. esbuild marks `entryPoint` on BOTH the real entry
// (index.ts) and dynamic-import targets (board.ts → the JSXGraph chunk), so match
// specifically on index.ts — not just "any output with an entryPoint".
let entryFile = '';
for (const [outPath, meta] of Object.entries(result.metafile.outputs)) {
  if (meta.entryPoint && meta.entryPoint.endsWith('graph-kit/src/index.ts')) {
    entryFile = basename(outPath);
  }
}
if (!entryFile) throw new Error('graph-kit build produced no entry output — aborting.');

// Write every output to dist; collect the .js files (entry + chunks) for upload.
const jsOutputs = [];
for (const f of result.outputFiles) {
  const name = basename(f.path);
  await writeFile(resolve(outDir, name), f.contents);
  if (name.endsWith('.js')) jsOutputs.push({ name, bytes: f.contents });
}

// ---- 2. Manifest (committed; read by publish-activity) ----------------------
const manifestPath = resolve(
  root,
  'supabase/functions/_shared/graph-kit-manifest.ts',
);
const manifest =
  '// =============================================================================\n' +
  '// _shared/graph-kit-manifest.ts — GENERATED FILE, DO NOT EDIT\n' +
  '// -----------------------------------------------------------------------------\n' +
  '// Produced by scripts/build-graph-kit.mjs. The content-hashed filename of the\n' +
  '// graphing-kit ENTRY bundle on R2 (under shared/). publish-activity joins it\n' +
  '// with R2_PUBLIC_URL_BASE to form the calculatorKitUrl it passes to the\n' +
  '// renderer. The entry pulls its JSXGraph chunk by a relative URL, so only this\n' +
  '// filename is needed here. Re-run `pnpm build:graph-kit` after any change to\n' +
  '// packages/graph-kit, commit this file, re-upload, and redeploy publish-activity.\n' +
  '// =============================================================================\n' +
  '\n' +
  `export const CALCULATOR_KIT_FILE = ${JSON.stringify(entryFile)};\n`;
await writeFile(manifestPath, manifest);

// ---- 3. Upload every .js to R2 (only with creds) ----------------------------
const env = (k) => process.env[k] ?? '';
const haveCreds =
  env('R2_ACCOUNT_ID') &&
  env('R2_ACCESS_KEY_ID') &&
  env('R2_SECRET_ACCESS_KEY') &&
  env('R2_BUCKET_NAME');

console.log('');
console.log('graph-kit outputs (entry: ' + entryFile + '):');
for (const o of jsOutputs) {
  const gz = (gzipSync(o.bytes).length / 1024).toFixed(1);
  const raw = (o.bytes.length / 1024).toFixed(1);
  console.log(`  ${o.name}  —  ${raw} KiB min · ${gz} KiB gz`);
}
console.log('manifest: ' + manifestPath);

if (!haveCreds) {
  console.log('');
  console.log('R2 upload SKIPPED (no R2 creds in env). Built + manifest written.');
  console.log('To publish, re-run with R2_ACCOUNT_ID / R2_ACCESS_KEY_ID /');
  console.log('R2_SECRET_ACCESS_KEY / R2_BUCKET_NAME (+ R2_PUBLIC_URL_BASE) set.');
} else {
  // Guard against placeholder creds (e.g. a copy-pasted `R2_ACCOUNT_ID=…`):
  // fail with a plain message before aws4fetch throws an opaque Invalid URL.
  if (!/^[0-9a-f]{32}$/i.test(env('R2_ACCOUNT_ID'))) {
    console.error('');
    console.error(
      `R2_ACCOUNT_ID doesn't look like a Cloudflare account id (32 hex chars); ` +
        `got ${JSON.stringify(env('R2_ACCOUNT_ID'))}. Copy the real values from ` +
        'the Cloudflare dashboard (R2 -> Manage API Tokens; account id is on ' +
        'the R2 overview page). Nothing was uploaded.',
    );
    process.exit(1);
  }
  // Guard against smart-quote / whitespace corruption from copy-paste: a curly
  // “ or ” in a value means autocorrect replaced a straight quote and the shell
  // kept it as a literal character. R2 keys, secrets, and bucket names are all
  // printable ASCII with no spaces, so any non-printable-ASCII byte is a paste
  // artifact — which otherwise surfaces as an opaque 403 SignatureDoesNotMatch.
  const corrupted = ['R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME'].filter(
    (k) => /[^\x21-\x7e]/.test(env(k)),
  );
  if (corrupted.length) {
    console.error('');
    console.error(
      `These R2 values contain smart quotes or whitespace, likely from ` +
        `autocorrect turning your "straight quotes" into curly ones: ` +
        `${corrupted.join(', ')}. Retype the command with straight quotes — ` +
        `or drop the quotes entirely, since none of these values contain ` +
        `spaces. Nothing was uploaded.`,
    );
    process.exit(1);
  }
  // R2's S3 credentials have fixed shapes: the access key id is 32 hex chars,
  // the secret access key is 64 hex chars. The Cloudflare R2 token page ALSO
  // shows a "Token value" (a bearer token, often prefixed like `cfut_…`) for
  // the native API — pasting THAT into the secret field is the classic mistake
  // and yields an opaque SignatureDoesNotMatch. Catch it by shape.
  if (!/^[0-9a-f]{32}$/i.test(env('R2_ACCESS_KEY_ID'))) {
    console.error('');
    console.error(
      `R2_ACCESS_KEY_ID isn't a 32-char hex string (got ` +
        `${env('R2_ACCESS_KEY_ID').length} chars). Copy "Access Key ID" from ` +
        'the Cloudflare R2 token page. Nothing was uploaded.',
    );
    process.exit(1);
  }
  if (!/^[0-9a-f]{64}$/i.test(env('R2_SECRET_ACCESS_KEY'))) {
    console.error('');
    console.error(
      `R2_SECRET_ACCESS_KEY isn't a 64-char hex string (got ` +
        `${env('R2_SECRET_ACCESS_KEY').length} chars). On the Cloudflare R2 ` +
        'token page use "Secret Access Key" (64 hex chars, under the S3 client ' +
        'credentials) — NOT the "Token value" bearer token. Nothing was uploaded.',
    );
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
  for (const o of jsOutputs) {
    const key = `shared/${o.name}`;
    const res = await client.fetch(`${endpoint}/${bucket}/${key}`, {
      method: 'PUT',
      body: o.bytes,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        // Immutable: filenames are content-hashed, so each URL never changes
        // meaning. Cloudflare brotli-compresses JS at the edge.
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
  if (base) console.log('Entry URL: ' + base + '/shared/' + entryFile);
  console.log('Now commit the manifest and redeploy publish-activity.');
}

# Edge Functions

Phase 1 Edge Functions for the activity platform.

## Functions

| Function | Purpose | Status |
|---|---|---|
| `publish-activity` | Take a draft, atomically snapshot a version, render to HTML, upload to Cloudflare R2, return URLs. | ✅ Deployed |
| `ingest-submission` | Receive student submissions from published HTML, validate, write to `submissions`. **Must be deployed with `--no-verify-jwt`** (see Build + deploy). | ✅ Deployed |
| `upload-image` | Editor image uploads: validate MIME/size, check edit rights, PUT to R2 `uploads/{activityId}/`, return the public URL. | ✅ Deployed |

## Shared code

`_shared/` is for code imported by multiple functions. Two files live here:

- **`cors.ts`** — CORS helper (preflight handling, JSON response builder, error response builder). Hand-written, edit freely.
- **`renderer.bundle.js`** — **Auto-generated.** Do NOT edit by hand. Produced by `pnpm bundle:renderer` from `packages/renderer`. Re-run after any change to schema or renderer.

## One-time setup

### 1. Cloudflare R2 secrets

Published HTML and uploaded images live on Cloudflare R2, **not** Supabase Storage (Supabase free tier rewrites HTML responses to `text/plain` — see STATE.md / ROADMAP "Hosting platform"). `publish-activity` and `upload-image` both talk to R2 via the S3 API and need these secrets:

```bash
supabase secrets set R2_ACCOUNT_ID="..."
supabase secrets set R2_ACCESS_KEY_ID="..."
supabase secrets set R2_SECRET_ACCESS_KEY="..."
supabase secrets set R2_BUCKET_NAME="..."
supabase secrets set R2_ENDPOINT="https://<account-id>.r2.cloudflarestorage.com"
supabase secrets set R2_PUBLIC_URL_BASE="https://pub-<hash>.r2.dev"
```

`R2_PUBLIC_URL_BASE` is also mirrored client-side as `VITE_PUBLISHED_URL_BASE` in the app's `.env.local` (Supabase secrets are write-only, so the SPA can't read it).

> The legacy Supabase Storage bucket `activities` was deleted 2026-06-18 after R2 was verified end to end. The app's `.from('activities')` calls refer to the DB table, not that bucket.

### 2. Set environment secrets

After both functions are deployed, point publish-activity at the real ingest URL:

```bash
supabase secrets set SUBMISSION_ENDPOINT="https://<project-ref>.supabase.co/functions/v1/ingest-submission"
```

Set an IP hash salt for ingest-submission (a random string, generate with `openssl rand -hex 32`):

```bash
supabase secrets set IP_HASH_SALT="<random 32-byte hex string>"
```

Without IP_HASH_SALT, IPs are still hashed but unsalted, which is recoverable by brute force on a known IP range. The salt makes the hash effectively one-way.

Optionally, restrict allowed origins for prod:

```bash
supabase secrets set ALLOWED_ORIGINS="https://your-spa-domain.com,https://activities.your-domain.com"
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are auto-injected by the Supabase Edge runtime. No setup needed for those.

## Build + deploy

Both functions import the bundled renderer (the bundle carries the schema too, which `ingest-submission` uses for validation). Build it before deploying:

```bash
# From the repo root:
pnpm install                  # one-time, installs esbuild and friends
pnpm bundle:renderer          # produces supabase/functions/_shared/renderer.bundle.js

supabase functions deploy publish-activity
supabase functions deploy ingest-submission --no-verify-jwt
supabase functions deploy upload-image
```

The root `package.json` wraps these so the flags can't be forgotten: `pnpm deploy:publish`, `pnpm deploy:ingest` (bakes in `--no-verify-jwt`), `pnpm deploy:upload-image`. For a multi-part deploy, `pnpm deploy:train` walks the whole ordering below interactively.

**`ingest-submission` must always be deployed with `--no-verify-jwt`.** Students submit anonymously (no auth header); with JWT verification on, the platform gateway 401s every submission before the function runs. There is no `config.toml`, so the flag lives only on the Supabase platform — a plain redeploy silently re-enables verification. The function self-authenticates with the service role and validates in its body.

**On any submission wire-format (`schemaVersion`) bump, redeploy `ingest-submission` BEFORE republishing any activity.** A page publishing the new wire POSTs a version the live ingest rejects (400) until ingest is redeployed. Ingest keeps accepting older wire versions (it migrates them on write), so redeploying it first never breaks already-published pages.

If you change anything in `packages/renderer` or `packages/schema`, re-run `pnpm bundle:renderer` before re-deploying. CI should automate this — every push that touches those packages should trigger a re-bundle and deploy.

### Graphing kit (calculator) asset on R2

The calculator widget (`@activity/graph-kit`) is too heavy to inline, so it ships as **one shared, content-hashed ESM bundle on R2** under `shared/`, lazy-`import()`ed by published pages on the first summon click. `publish-activity` reads the hashed filename from the committed manifest `_shared/graph-kit-manifest.ts` and joins it with `R2_PUBLIC_URL_BASE` to form the `calculatorKitUrl` it passes to the renderer (the renderer only emits the calculator when an activity opts in *and* that URL is present).

Building and uploading are separate commands: `pnpm build:graph-kit` is build-only and **never uploads** (safe to run reflexively); `pnpm upload:graph-kit` builds AND uploads — the author/deploy step. It requires R2 creds in the env.

**Recommended one-time setup — a local creds file (no more pasting):**

```bash
cp .env.r2.example .env.r2    # then fill in the two secret values
pnpm upload:graph-kit         # auto-loads .env.r2 on every run from now on
```

`.env.r2` is gitignored; the upload command loads it via `node --env-file-if-exists`. The account id, bucket, and public URL are pre-filled in the example (they're not secrets); you only paste the Access Key ID + Secret Access Key once.

**One-off / CI alternative — creds inline:**

```bash
# From the repo root, with the same R2 secrets used for the functions in env:
R2_ACCOUNT_ID=… R2_ACCESS_KEY_ID=… R2_SECRET_ACCESS_KEY=… \
R2_BUCKET_NAME=… R2_PUBLIC_URL_BASE=… node scripts/build-graph-kit.mjs --upload
```

Inline vars take precedence over `.env.r2`, so this still works to override for a one-off.

This bundles the kit, content-hashes it to `graph-kit-<hash>.js`, rewrites the manifest, and PUTs the asset to `shared/<filename>` (immutable cache; Cloudflare brotli-compresses at the edge). MathLive fonts are **not** uploaded — the kit points `MathfieldElement.fontsDirectory` at the version-matched jsDelivr CDN (same pattern as KaTeX fonts).

After any change to `packages/graph-kit`: run `pnpm upload:graph-kit`, **commit the regenerated manifest**, and **redeploy `publish-activity`** so it serves the new hashed URL. **The order matters: upload FIRST, then deploy the function** — the reverse points the live function at a not-yet-uploaded hash and 404s the summon button on every page published in the gap. Confirm the `Uploaded:` lines before deploying (`pnpm deploy:train` sequences all of this). Older hashes stay on R2, so already-published pages keep working until re-published. `pnpm build:graph-kit` (no `--upload`) just rebuilds + refreshes the manifest and never touches R2.

## Calling the publish function

From the React app, with the user's auth session available:

```typescript
const { data, error } = await supabase.functions.invoke('publish-activity', {
  body: { activity_id: '00000000-...' },
});
// data: { version_id, version_num, public_url, versioned_url }
```

The `public_url` is the live alias (`{activity_id}/index.html`) — share this with students. The `versioned_url` is the immutable snapshot of this specific version (`{activity_id}/v{N}/index.html`) — useful for permalinks in submission records or assignment links.

## Why two URLs?

- **Live URL** (`{activity_id}/index.html`): rewrites on every publish, 5-minute cache. Use this for shareable links — students always see the latest version.
- **Versioned URL** (`{activity_id}/v{N}/index.html`): immutable, 1-year cache. Use this when you need a stable reference to a specific snapshot, e.g., the URL stored in an `assignments.activity_version_id` row (Phase 3).

## Error responses

The function returns JSON errors with these status codes:

| Status | Meaning |
|---|---|
| 400 | Missing/invalid request body, or no draft content to publish |
| 401 | Missing Authorization header |
| 403 | Caller is not the owner (or, in Phase 3, not a collaborator with editor role) |
| 404 | Activity not found |
| 405 | Wrong HTTP method |
| 422 | Document failed schema validation (Zod error details in response) |
| 500 | Render error, R2 upload error, or unexpected RPC failure |

The 422 case is the interesting one — it means the editor produced a document that didn't pass `ActivityDocument.parse()`. This should never happen if the editor's serialize layer is correct; if it does, fix the editor, not the validator.

## Testing locally

Supabase CLI lets you run Edge Functions locally:

```bash
supabase start                # spin up a local Supabase stack
supabase functions serve publish-activity --env-file ./supabase/functions/.env.local
```

Swap `publish-activity` for `ingest-submission` to serve that function instead. You'll need a `.env.local` with the secrets above. The local stack mirrors production tightly — same Postgres, same Auth, same Storage. The only difference is URLs (local uses `http://localhost:54321`).

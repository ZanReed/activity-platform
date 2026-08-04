# Edge Functions

Phase 1 Edge Functions for the activity platform.

## Functions

| Function | Purpose | Status |
|---|---|---|
| `publish-activity` | Take a draft, atomically snapshot a version, render to HTML, upload to Cloudflare R2, return URLs. | ✅ Deployed |
| `ingest-submission` | Receive student submissions from published HTML, validate, write to `submissions`. **Must be deployed with `--no-verify-jwt`** (see Build + deploy). | ✅ Deployed |
| ~~`upload-image`~~ | **Deleted 2026-07-31** (eng review; DECISIONS.md → "Direct-to-Storage image upload"). The editor uploads straight to the public `activity-images` bucket; migration 0019's RLS INSERT policy calls `can_edit_activity` as the caller. The deployed instance is removed with `supabase functions delete upload-image` — see STATE.md for the ordering. | 🗑 Removed |
| `get-activity` | The viewer read API (S2): anonymous title/teacher meta (rate-limited), authenticated resolve of the current version, and the upgraded+sanitized content served from the durable per-version cache with immutable headers. **Must be deployed with `--no-verify-jwt`** (the anonymous meta branch; see Build + deploy). Needs migration 0017. | ✅ Deployed |
| `get-feedback` | Student feedback sidecar (Phase 2.6 manual grading): published pages fetch teacher grades/feedback anonymously. **Must be deployed with `--no-verify-jwt`** (see Build + deploy). | ✅ Deployed |
| `check-activity` | The S4 grading RPC: server-authoritative section checks for the signed-in viewer. Deploy with `pnpm deploy:check` — **`verify_jwt` stays TRUE**, deliberately NOT in the no-verify-jwt trio (a check is always made by a signed-in student, so the platform gate is a free first line of defense). Needs migration 0020 + the grading-server bundle. | ✅ Deployed |

## Shared code

`_shared/` is for code imported by multiple functions (the directory listing is the source of truth for what lives here):

- **`cors.ts`** — CORS helper (preflight handling, JSON response builder, error response builder). Hand-written, edit freely.
- **`renderer.bundle.js`** — **Auto-generated.** Do NOT edit by hand. Produced by `pnpm bundle:renderer` from `packages/renderer`. Re-run after any change to schema or renderer.
- **`viewer-server.bundle.js`** — **Auto-generated.** Do NOT edit by hand. Produced by `pnpm bundle:viewer-server` from `packages/viewer/src/server/` (upgrade-on-read + the answer-key sanitizer + serve shuffles + `SANITIZER_REV`). Re-run after any change to schema or the viewer's sanitize/registry source. Kept separate from the renderer bundle so `get-activity` never loads the renderer + KaTeX.
- **`grading-server.bundle.js`** — **Auto-generated.** Do NOT edit by hand. Produced by `pnpm bundle:grading-server` (the S4 grading engine + graph-kit's pure `/scorers` — never the package barrel, which would pull MathLive; the build enforces a size ceiling). Re-run after any change to `packages/viewer/src/server/`, the grading engine, schema, or graph-kit's scorers. Separate from the viewer-server bundle so the read path never pays the grader's cold start.
- **`graph-kit-manifest.ts`** — **Auto-generated** by `scripts/build-graph-kit.mjs`; the content-hashed kit filename on R2 that `publish-activity` injects into published pages. Commit it after every `pnpm upload:graph-kit`.

### ⚠ Never put a DIRECTORY-PREFIX alias to `_shared/` in a function's `deno.json`

A function's `deno.json` must not map a folder, e.g.:

```jsonc
// DON'T — this uploads ALL of _shared/ with every deploy
{ "imports": { "@/shared/": "../_shared/" } }
```

The CLI resolves that prefix by uploading the **whole directory**, not the files
the function imports. Since `_shared/` holds three generated bundles totalling
~7 MB, any function carrying such an alias uploads all of them — and on
2026-08-03 that finally exceeded the request limit and `get-activity` failed to
deploy with `413 request entity too large`. The alias had never been *used*:
every function imports by relative path (`../_shared/cors.ts`), so it was pure
upload weight and was removed from all three functions that had it.

Diagnostic if it recurs: the deploy log lists the assets it uploads. A function
should only list the files it actually imports. `get-activity` listing
`renderer.bundle.js` is the tell.

Rough sizes, so the next bundle growth is predictable: renderer ~3.5 MB,
grading-server ~2.5 MB, viewer-server ~0.9 MB. No single function needs more
than one of them.

## One-time setup

### 1. Cloudflare R2 secrets

Published **HTML** lives on Cloudflare R2, **not** Supabase Storage (Supabase free tier rewrites HTML responses to `text/plain` — see STATE.md / ROADMAP "Hosting platform"). Only `publish-activity` still talks to R2 via the S3 API and needs these secrets:

> **Uploaded images no longer involve R2 — or any function.** Per the 2026-07-31 Cloudflare-exit ruling and the same-day eng review, the editor uploads straight to the public `activity-images` Supabase Storage bucket; migration `0019_image_storage.sql`'s RLS INSERT policy (calling `can_edit_activity` as the caller) is the gate, and the bucket's mime/size limits are the validation. **No secrets, no function.** Images were always safe on Storage; the anti-abuse rewrite that forced R2 applies to `text/html` only. R2 retires entirely at the S9 cutover, when published HTML stops existing.

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
```

The root `package.json` wraps these so the flags can't be forgotten: `pnpm deploy:publish`, `pnpm deploy:ingest` / `pnpm deploy:feedback` / `pnpm deploy:get-activity` (each bakes in `--no-verify-jwt`; for get-activity run `pnpm bundle:viewer-server` first), and `pnpm deploy:check` (no flag — `verify_jwt` stays true; run `pnpm bundle:grading-server` first). For a multi-part deploy, `pnpm deploy:train` walks the whole ordering below interactively.

**`ingest-submission`, `get-feedback`, and `get-activity` must always be deployed with `--no-verify-jwt`.** The first two are called anonymously from published pages (no auth header); `get-activity`'s anonymous branch is the 3.2A pre-auth meta endpoint. With JWT verification on, the platform gateway 401s those requests before the function runs. There is no `config.toml`, so the flag lives only on the Supabase platform — a plain redeploy silently re-enables verification. Each function self-authenticates in its body (service role / user-scoped RPC).

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

## How these functions authorize (and the RPC grants they depend on)

Each function calls a `SECURITY DEFINER` RPC, and migration `0009` locked EXECUTE on those RPCs down to exactly the caller each function uses — so the grants below are now load-bearing, not incidental:

- **`publish-activity`** builds a Supabase client with the **user's JWT** (anon key + the request's `Authorization` header → the `authenticated` role) and calls `publish_activity`. It is NOT service-role. `publish_activity` is granted to `authenticated`; its internal `can_edit_activity` check is the real authorization.
- **Image uploads have no function at all** (deleted 2026-07-31): the browser writes to the `activity-images` bucket directly, and 0019's RLS INSERT policy calls `can_edit_activity` **as the caller** — same helper, same grants, the gate just lives in policy SQL now. The policy is deliberately the ONLY write path (no UPDATE/DELETE policies; overwrites are impossible), and the bucket's `allowed_mime_types`/`file_size_limit` are the server-side validation. Behavioral proof: `scripts/verify-image-storage.sql`.
- **`ingest-submission`** uses the **service role** and calls `ingest_submission`, which after 0009 is granted to `service_role` **only** — `anon`/`authenticated` can no longer reach it via `/rest/v1/rpc/ingest_submission`, so a student can't bypass this function's Zod validation and IP-hashing by POSTing to PostgREST directly.

Implication for changes: if you ever recreate one of these RPCs or add a new one, Supabase's default privileges re-grant EXECUTE to `PUBLIC`/`anon`/`authenticated`, so a new migration must re-apply the revoke/grant stanza (see `0009_security_housekeeping.sql` and DECISIONS.md → "Supabase security/performance housekeeping (0009)"). Redeploying a function does **not** change grants — those live in the database.

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

# Edge Functions

Phase 1 Edge Functions for the activity platform. Two functions, both built and deployed.

## Functions

| Function | Purpose | Status |
|---|---|---|
| `publish-activity` | Take a draft, atomically snapshot a version, render to HTML, upload to Storage, return URLs. | ✅ Phase 1 |
| `ingest-submission` | Receive student submissions from published HTML, validate, write to `submissions`. | ✅ Phase 1 |

## Shared code

`_shared/` is for code imported by multiple functions. Two files live here:

- **`cors.ts`** — CORS helper (preflight handling, JSON response builder, error response builder). Hand-written, edit freely.
- **`renderer.bundle.js`** — **Auto-generated.** Do NOT edit by hand. Produced by `pnpm bundle:renderer` from `packages/renderer`. Re-run after any change to schema or renderer.

## One-time setup

### 1. Create the Storage bucket

The publish function uploads to a public Storage bucket called `activities`. Create it manually before the first publish.

**Via the dashboard** (recommended): Storage → New bucket → name `activities` → toggle **Public bucket** ON → Save. The published HTML files need to be readable by anyone with the URL, so public is correct.

**Via SQL** (alternative, if you prefer everything in migrations):

```sql
-- Run as service role / project owner (Storage owns its own RLS rules
-- separate from your tables').
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'activities',
  'activities',
  true,                             -- public read
  10 * 1024 * 1024,                 -- 10MB per file (way more than we need)
  array['text/html', 'text/css', 'application/javascript']::text[]
)
on conflict (id) do nothing;
```

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
supabase functions deploy ingest-submission
```

If you change anything in `packages/renderer` or `packages/schema`, re-run `pnpm bundle:renderer` before re-deploying. CI should automate this — every push that touches those packages should trigger a re-bundle and deploy.

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
| 500 | Render error, Storage upload error, or unexpected RPC failure |

The 422 case is the interesting one — it means the editor produced a document that didn't pass `ActivityDocument.parse()`. This should never happen if the editor's serialize layer is correct; if it does, fix the editor, not the validator.

## Testing locally

Supabase CLI lets you run Edge Functions locally:

```bash
supabase start                # spin up a local Supabase stack
supabase functions serve publish-activity --env-file ./supabase/functions/.env.local
```

Swap `publish-activity` for `ingest-submission` to serve that function instead. You'll need a `.env.local` with the secrets above. The local stack mirrors production tightly — same Postgres, same Auth, same Storage. The only difference is URLs (local uses `http://localhost:54321`).

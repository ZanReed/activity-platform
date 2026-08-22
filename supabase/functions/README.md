# Edge Functions

The two Deno Edge Functions that back the viewer. **The directory listing is the
source of truth for what exists** — exactly `get-activity` and `check-activity`,
plus `_shared/`. Per-function deploy flags are declared in
[`../config.toml`](../config.toml) (policy P6 — the CLI reads it on deploy).

> **Rewritten 2026-08-22.** The previous version of this file documented the
> Phase-1 world — `publish-activity`, `ingest-submission`, `get-feedback`, the
> renderer bundle, the R2 graph-kit upload — all of which died at S9 Drops 1–4
> (2026-08-14) and the D-13 R2 teardown (2026-08-15). It carried a tombstone
> promising a rewrite "at the Drop 4 doc sweep" for eight days. `git log` has
> the old text if a static-HTML surface ever returns.

## Functions

| Function | Purpose | `verify_jwt` | Deploy |
|---|---|---|---|
| `get-activity` | The viewer read API (S2): anonymous title/teacher meta for the pre-auth interstitial (`get_activity_public_meta`, `get_class_public_meta`; rate-limited), authenticated resolve of the current published version (`get_published_activity`), and the upgraded + sanitized content served from the durable per-version cache (`activity_version_reads`, 0017) with immutable headers. Its cache-fill path also writes the analytics census (`write_version_census`, 0026 — fail-safe: a missing RPC withholds the cache row and still serves a 200). | **`false`** — the ONLY anonymous function; the platform's gate would 401 the no-Authorization meta branch before the function ran | `pnpm bundle:viewer-server` first, then `pnpm deploy:get-activity` (bakes in `--no-verify-jwt`) |
| `check-activity` | The S4 grading endpoint: server-authoritative section checks for the signed-in viewer. Authorizes through `get_activity_version_for_check` (caller-scoped; metadata only), grades with the bundled engine, records through `record_check` (service-role only — it takes verdicts as an argument). Answers never reach the client pre-check. | **`true`** — a check is always made by a signed-in student, so the platform gate is a free first line of defense. **Never add `--no-verify-jwt`.** | `pnpm bundle:grading-server` first, then `pnpm deploy:check` |

Publishing needs no function: it is a direct `publish_activity` RPC from the
app (`usePublish`), snapshotting the draft into `activity_versions`. Image
upload needs no function either: the editor writes straight to the
`activity-images` Storage bucket under 0019's RLS INSERT policy (which calls
`can_edit_activity` as the caller); the bucket's mime/size limits are the
server-side validation (`scripts/verify-image-storage.sql`).

## Shared code (`_shared/`)

- **`cors.ts`** — CORS helper (preflight, JSON + error response builders).
  Hand-written. Reads `ALLOWED_ORIGINS` (comma-separated exact origins; `*`
  when unset).
- **`viewer-server.bundle.js`** — **auto-generated, do not edit.** `pnpm
  bundle:viewer-server` from `packages/viewer/src/server/` (upgrade-on-read +
  the answer-key sanitizer + serve shuffles + `SANITIZER_REV`). Imported by
  `get-activity`. Re-run after any change to schema or the viewer's
  sanitize/registry source; a sanitize-spec change moves `SANITIZER_REV`, which
  orphans stale read-cache rows once the new function is live.
- **`grading-server.bundle.js`** — **auto-generated, do not edit.** `pnpm
  bundle:grading-server` (the grading engine + graph-kit's pure `/scorers`
  subpath — never the package barrel, which would pull MathLive; the build
  enforces a size ceiling). Imported by `check-activity`. Re-run after any
  change to `packages/viewer/src/server/`, the grading engine, schema, or the
  scorers.

The two bundles are deliberately separate: the read path must never pay the
grader's cold start. **CI regenerates both and fails on drift**
(`.github/workflows/ci.yml`), so a source change without its re-bundled commit
cannot merge. Ceilings live in `scripts/perf-budgets.mjs`
(`VIEWER_SERVER_MAX_KIB`, `GRADING_SERVER_MAX_KIB`); read current sizes with
`wc -c _shared/*.bundle.js` rather than trusting a number written here.

### ⚠ Never put a DIRECTORY-PREFIX alias to `_shared/` in a function's `deno.json`

```jsonc
// DON'T — this uploads ALL of _shared/ with every deploy
{ "imports": { "@/shared/": "../_shared/" } }
```

The CLI resolves a folder prefix by uploading the **whole directory**, not the
files the function imports. On 2026-08-03 (three bundles, ~7 MB) that exceeded
the request limit and `get-activity` failed to deploy with `413 request entity
too large`. Every function imports by relative path (`../_shared/cors.ts`), so
the alias was pure upload weight. Diagnostic if it recurs: the deploy log lists
the assets it uploads; a function should list only what it imports
(`get-activity` listing `grading-server.bundle.js` is the tell).

## Environment

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are
auto-injected by the Edge runtime — both functions read only those three plus
the optional `ALLOWED_ORIGINS`. No other secrets exist. (The R2 secrets the
old functions needed are dead; unsetting them on the dashboard and shrinking
`ALLOWED_ORIGINS` are the remaining author-side D-13 steps — STATE.md.)

```bash
supabase secrets set ALLOWED_ORIGINS="https://your-spa-domain.com"
```

## Deploy ordering rules (from CLAUDE.md — restated, not replaced)

1. **Migration before function.** If a function change calls a NEW database
   function, apply the migration first (`get-activity` v8 shipped ahead of 0026
   once; its census call was designed to fail safe, so the blast radius was a
   withheld cache row rather than a 500). The reverse order is never needed.
2. **Bundle, commit, then deploy** — the committed bundle is what CI diffs.
3. **Verify live flags after every deploy** with the platform advisor's
   `list_edge_functions`, reading the **`version`** field (not the
   `entrypoint_path` suffix) and `verify_jwt` per function. `config.toml` is
   the intent; if the live flag disagrees, the deploy is the bug.

## How these functions authorize (and the grants they depend on)

Both functions build two clients: a **user-scoped** client (anon key + the
request's `Authorization` header → the `authenticated` role) for the RPCs whose
own `can_read_activity`/parentage checks are the real authorization, and an
**admin** (service-role) client for the privileged writes.

- `get-activity`: anonymous branch → `get_activity_public_meta` /
  `get_class_public_meta` as `anon` (the deliberate 0017 exception — title +
  teacher name only; 0021 refuses email-shaped names). Authenticated branch →
  `get_published_activity` as the caller. Cache reads/writes on
  `activity_version_reads` and `write_version_census` use the service role
  (that table is service-role only).
- `check-activity`: `get_activity_version_for_check` as the caller (refuses a
  version belonging to a different activity — `verify-0020.sql` A2); grading
  runs in the function against the RAW version content fetched with the service
  role; `record_check` is granted to `service_role` **only**, so a student
  cannot write themselves a row of `correct` through PostgREST
  (`verify-0020.sql` B1).

Implication: recreating one of these RPCs re-grants EXECUTE to
`PUBLIC`/`anon`/`authenticated` by default, so the migration must re-apply the
revoke/grant stanza (0009, 0028, 0032). Redeploying a function never changes
grants — those live in the database, and `pnpm verify:auth --target live`
re-runs the registered regression set (`scripts/verify-runner.mjs`).

## Testing locally

```bash
supabase start
supabase functions serve get-activity --no-verify-jwt
```

Swap in `check-activity` (without `--no-verify-jwt`) to serve that one. The
local stack mirrors production (same Postgres, Auth, Storage); only the URL
differs (`http://127.0.0.1:54321`). The e2e **integration** lane targets that
stack; the **stub** lanes deliberately sit on `127.0.0.1:54399`, an address
nothing listens on (`packages/app/e2e/helpers/e2eOrigins.ts`).

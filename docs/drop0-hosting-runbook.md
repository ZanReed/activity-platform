# Drop 0 — Hosting runbook (Cloudflare Pages)

Prepared by an AI session 2026-07-24 (task T1, `tasks-eng-review-20260724-104031.jsonl`).
Goal: get the SPA hosted at a real origin so allowlisted teachers (Kia Jafari, Felice
Mueller, + Kia's Algebra I colleagues) can log in. Standalone first step of the August
Activity-Bank build — **no Bank/assignment feature code is touched by this drop.**

Division of labor: this doc is the **prepared** artifact. **The author runs every
dashboard / DNS / OAuth-console / secrets / SQL step below.** Claude verifies the deployed
origin up to the OAuth wall afterward (see §6).

Source of truth for rulings: `~/.gstack/projects/ZanReed-activity-platform/user-main-design-20260724-010349.md`
(D8 = Cloudflare Pages, D15 = hosting ships first/standalone, A8 = hosting is the unlisted
dependency all consumer features gate on).

---

## 0. Facts this runbook is built on (verified against the repo 2026-07-24)

| Thing | Value |
|---|---|
| App package | `@activity/app` (Vite 6 + React 19 + React Router v7 **library mode**, `<BrowserRouter>`) |
| Router style | Pure client-side SPA (no SSR, no framework mode, no `react-router.config.ts`) |
| Build command | `pnpm --filter @activity/app build`  (`tsc -b && vite build`) |
| Build output | `packages/app/dist/`  (`index.html` + `assets/`, **no `404.html`**) |
| Workspace deps | `@activity/schema` / `renderer` / `graph-kit` all export from `./src/*.ts` → Vite compiles them from source. **No pre-build of packages needed**; the filtered build is self-contained (verified: clean build in ~6 s). |
| Package manager | `pnpm@11.1.2` (root `package.json` `packageManager` field → Cloudflare uses it via corepack) |
| Supabase project ref | `dtqutpdplefmufrrakxs` → `https://dtqutpdplefmufrrakxs.supabase.co` |
| Supabase OAuth callback | `https://dtqutpdplefmufrrakxs.supabase.co/auth/v1/callback` |
| Published-page (R2) origin | `https://pub-4675df837c14420c8a996a41027154b1.r2.dev` |
| Dev origin | `http://localhost:5173` |
| OAuth redirect in app | `signInWithOAuth({ provider:'google', options:{ redirectTo: window.location.origin }})` — the app redirects back to **whatever origin it is served from**, so the Pages origin must be allowlisted **in Supabase** (not Google — see §3). |

**Recommended Pages project name: `activity-platform`** → production URL
`https://activity-platform.pages.dev`. Pick the name deliberately: it becomes the origin
that gets hard-coded into the Supabase redirect list and the CORS list below. If you choose
a different name, substitute `<project>.pages.dev` everywhere below.

---

## 1. Cloudflare Pages — create & build config

Create the project via **Cloudflare dashboard → Workers & Pages → Create → Pages → Connect
to Git** (connect the `ZanReed/activity-platform` repo, production branch `main`).

Build settings (Framework preset: **None** — do not pick "React", it assumes CRA/Next):

| Setting | Value |
|---|---|
| **Production branch** | `main` |
| **Root directory** | *repo root* — leave blank / `/`. **Must be repo root**, not `packages/app`: it's a pnpm workspace, the lockfile + workspace deps live at the root, so install must run there. |
| **Build command** | `pnpm --filter @activity/app build` |
| **Build output directory** | `packages/app/dist` |
| **Install command** | leave default (Cloudflare auto-runs `pnpm install` when it sees the root `pnpm-lock.yaml` + `packageManager` field) |

### SPA deep-link fallback — nothing to configure (current Pages best practice, verified)

React Router v7 in `<BrowserRouter>` mode owns deep links like `/activities`,
`/activity/:id`, `/activity/:id/submissions`, `/activity/:id/print` client-side, so the host
must serve `index.html` (HTTP 200) for any unmatched path. **Cloudflare Pages does this
automatically when the build output has no top-level `404.html`** — which ours doesn't. From
Cloudflare's own docs: *"If your project does not include a top-level `404.html` file, Pages
assumes that you are deploying a single-page application… matches all incoming paths to the
root (`/`)."*

So **do not add a `_redirects` file** and **do not add a `404.html`**:
- A `_redirects` `/* /index.html 200` rule is the older pattern and Cloudflare's build system
  now flags it as an "infinite loop" and *ignores* it (community-confirmed 2025) — it would
  be worse than nothing.
- Adding a `404.html` would silently **disable** the automatic SPA fallback and start
  returning real 404s on deep links.

If a future change ever introduces a `404.html`, switch to the Workers-assets setting
`not_found_handling: "single-page-application"` instead of a `_redirects` file.

### Build-time environment variables (Pages → Settings → Variables & Secrets)

Vite **inlines `VITE_*` at build time** — a static SPA has no server runtime, so these MUST
be set as *build* variables on the Pages project (Production scope; also add to Preview if you
want preview deployments to function). The three values are **exactly the three lines already
in `packages/app/.env.local`** — copy them verbatim (they're public-safe: the anon key is
RLS-gated by design, the URLs are identifiers):

| Variable | Where to get it | Notes |
|---|---|---|
| `VITE_SUPABASE_URL` | `= https://dtqutpdplefmufrrakxs.supabase.co` | Supabase → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | copy from `.env.local` (Supabase → Settings → API → anon/publishable key) | public-safe |
| `VITE_PUBLISHED_URL_BASE` | `= https://pub-4675df837c14420c8a996a41027154b1.r2.dev` | no trailing slash; must match the R2 public base |
| `NODE_VERSION` | `= 22` | pins the Cloudflare build image's Node (local is 24; 22 LTS is the safe, supported choice — Vite 6 needs ≥18). Alternative: commit a `.node-version` file, but the env var avoids touching local dev. |

If any `VITE_*` is missing at build time the app throws on first load
(`Missing VITE_SUPABASE_URL…` from `packages/app/src/lib/supabase.ts`) — so a blank page after
deploy almost always means a missing/misspelled build variable.

---

## 2. Supabase Auth — add the Pages origin

**Dashboard → Authentication → URL Configuration.** Keep dev working; add prod.

- **Site URL:** set to `https://activity-platform.pages.dev` (the canonical deployed origin).
  Functionally the app always passes an explicit `redirectTo`, so Site URL is the fallback/
  email-link base — but making it the prod origin is the clean choice.
- **Redirect URLs (allow list):** must contain **both** origins the app can be served from,
  because `redirectTo = window.location.origin` is validated against this list:
  - `http://localhost:5173/**`   ← keep dev login working
  - `https://activity-platform.pages.dev/**`
  (The `/**` wildcard is belt-and-suspenders; the bare origin also matches since
  `window.location.origin` carries no path.)

**Recommended split rationale:** one canonical Site URL (prod) + an allow list that also
includes localhost. Don't remove localhost — the author still develops there daily.

> Preview deployments (`https://<hash>.activity-platform.pages.dev`) are **not** covered by
> these exact entries and their logins/CORS will fail. That's fine for the pilot — send Kia
> and Felice the **production** URL only. If preview logins are ever needed, add the specific
> preview origin (or a wildcard entry) here and to the CORS list in §4.

---

## 3. Google OAuth console — verify only (no new app origin needed)

Common trap: you do **not** add the Pages URL to Google. The flow is Supabase-mediated —
the browser goes app → Supabase `/authorize` → Google consent → **Supabase callback** →
back to the app. Google only ever redirects to Supabase, never to the app.

**Google Cloud Console → APIs & Services → Credentials → the OAuth 2.0 Client ID:**
- **Authorized redirect URIs** must contain
  `https://dtqutpdplefmufrrakxs.supabase.co/auth/v1/callback`.
  This is already present (dev login works today) — just **confirm** it; no change expected.
- **Authorized JavaScript origins** — not required for this server-side flow; leave as-is.

Net: for Drop 0, the Google console is a **verify-nothing-changed** step. The Pages origin is
registered with Supabase (§2), not Google.

---

## 4. CORS — tighten `ALLOWED_ORIGINS` from `'*'` (do this carefully, last)

### The mechanism (why "per-function lists" isn't an env thing)

All four Edge Functions import the same `_shared/cors.ts`, which reads **one** env var,
`ALLOWED_ORIGINS` (default `'*'`). Supabase secrets are **project-wide** — there is no
per-function env var — so one value governs all four functions. Exact-match only (the helper
does `allowed.includes(origin)`; no wildcard/suffix matching).

### The correct per-function origin map (worked out before changing anything)

| Function | Called from | Auth model | Origin(s) it must accept |
|---|---|---|---|
| `ingest-submission` | runtime baked into **published R2 pages** | anonymous (`--no-verify-jwt`) | `https://pub-4675df837c14420c8a996a41027154b1.r2.dev` |
| `get-feedback` | runtime baked into **published R2 pages** | anonymous (`--no-verify-jwt`) | `https://pub-4675df837c14420c8a996a41027154b1.r2.dev` |
| `publish-activity` | **app** (`supabase.functions.invoke`) | teacher JWT (`verify_jwt:true`) | `http://localhost:5173`, `https://activity-platform.pages.dev` |
| `upload-image` | **app** (`supabase.functions.invoke`) | teacher JWT (`verify_jwt:true`) | `http://localhost:5173`, `https://activity-platform.pages.dev` |

**The regression that bites if you tighten naively:** drop the R2 origin and *every student
submission on every already-published page 401s/blocks at the CORS preflight.* Whatever you
set MUST include the R2 origin.

### Recommendation: set the project-wide **union** (zero code change)

Set the one secret to the union of all four functions' needs:

```
ALLOWED_ORIGINS = https://pub-4675df837c14420c8a996a41027154b1.r2.dev,http://localhost:5173,https://activity-platform.pages.dev
```

(No spaces after commas required — the helper trims — but keep it clean. No trailing slashes;
each entry must match the `Origin` header exactly: scheme + host + port.)

This is a **real** tightening from `'*'` (arbitrary origins are now rejected). It does *not*
give per-function isolation — e.g. CORS alone would let the app origin call
`ingest-submission` — but **CORS is not the security boundary here**: `publish-activity` /
`upload-image` are gated by teacher JWT + RLS, and `ingest-submission` / `get-feedback` are
intentionally anonymous (gated by token validity, not origin). A cross-origin site can't read
a teacher's bearer token anyway. So the union is safe; the marginal benefit of hard
per-function isolation isn't worth a code change this drop.

> **If you ever want true per-function allow-lists**, it's a code change (not env):
> `corsHeaders(req, allowList)` with each function passing its own array (origins are public,
> so hard-coding them in `cors.ts` is fine and version-controlled). Flagged, not built —
> out of scope for Drop 0.

### Applying the change — and the `--no-verify-jwt` foot-gun

Supabase injects secrets at **runtime**, so setting `ALLOWED_ORIGINS` (dashboard → Edge
Functions → Secrets, or `supabase secrets set ALLOWED_ORIGINS=…`) generally takes effect
**without a redeploy**. Confirm it took effect with the published-page submission check in §6c.

**Only if** you decide to redeploy the functions for any reason: `ingest-submission` and
`get-feedback` MUST go through the flag-baked scripts —

```bash
pnpm deploy:ingest
pnpm deploy:feedback
```

— never a raw `supabase functions deploy` (a plain redeploy silently re-enables
`verify_jwt` and 401s every anonymous student; see CLAUDE.md). `publish-activity` /
`upload-image` redeploy normally (`pnpm deploy:publish` / `pnpm deploy:upload-image`).

**Sequencing:** tighten CORS **after** confirming the app loads and login works (§6a/§6b), so
a CORS mistake can't be confused with a hosting mistake. Then immediately run §6c.

---

## 5. Allowlist the pilot teachers (SQL — author runs)

The signup trigger `handle_new_auth_user` (0003) rejects any email not in `public.allowlist`
(`where email = new.email`, **case-sensitive**). Gmail emails arrive lowercased from Google,
so **enter the addresses in lowercase**. Run in Supabase → SQL Editor:

```sql
insert into allowlist (email, notes) values
  ('KIA_GMAIL_LOWERCASE_HERE',    'Pilot — head of Algebra I (Kia Jafari)'),
  ('FELICE_GMAIL_LOWERCASE_HERE', 'Pilot — coffee-test recruit (Felice Mueller)')
on conflict (email) do nothing;

-- Add Kia's Algebra I colleagues the same way as they come:
-- insert into allowlist (email, notes)
--   values ('COLLEAGUE_GMAIL_LOWERCASE', 'Pilot — Algebra I dept (via Kia)')
--   on conflict (email) do nothing;
```

⚠️ **Placeholders to fill:** `KIA_GMAIL_LOWERCASE_HERE` and `FELICE_GMAIL_LOWERCASE_HERE` —
their actual Google-account emails (ask them which Google account they'll sign in with; a
school Google Workspace address is fine as long as it's the one they use for the OAuth login).

---

## 6. Verification plan (after the author finishes §1–§5)

**(a) Claude verifies — deployed origin loads + SPA deep-link routing (up to the OAuth wall).**
Using browser tools: load `https://activity-platform.pages.dev/` (renders the app + Google
sign-in), then hit a **deep link directly** —
`https://activity-platform.pages.dev/activities` — and confirm it serves the app (the
RequireAuth gate / login screen), **not** a Cloudflare 404. That proves the auto SPA fallback.
Claude stops at the OAuth wall (can't and won't complete a Google login).

**(b) Author verifies — full non-author login end to end.** Sign in as an allowlisted
non-author (Kia/Felice, or a test allowlisted Google account) at the Pages URL; confirm the
signup trigger admits them and the Activities dashboard loads.

**(c) Author verifies — the CORS regression check (most likely to bite).** With the tightened
`ALLOWED_ORIGINS` live:
  - From the hosted app: **publish** an activity and **upload an image** — both must succeed
    (proves the Pages origin is accepted by `publish-activity` + `upload-image`).
  - Open an **already-published R2 page** (`pub-…r2.dev/...`), submit as a student, and — on a
    gradable activity — trigger feedback. The submission must POST 200 and feedback must load
    (proves the R2 origin is still accepted by `ingest-submission` + `get-feedback`). **If this
    fails, `ALLOWED_ORIGINS` is missing the R2 origin — fix before sending links to teachers.**

---

## 7. Out of scope for Drop 0 (do NOT do here)

- Custom domain (`activities.<brand>.com`) — Phase-2 polish; `*.pages.dev` is fine for v1.
- Any Bank / assignment / branch feature code, migrations, wire/runtime/published-page change.
- Per-function CORS code refactor (flagged in §4, not built).

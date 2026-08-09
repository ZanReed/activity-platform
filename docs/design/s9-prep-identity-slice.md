# S9-prep identity slice — plan (B12 / B13 / B14)

**Status: BUILT 2026-08-09 — all reviews clear (eng E-1…E-11+T1–T5, DX D4/F1–F5/G1/X1–X3,
design P1–P4), all 12 implementation tasks landed. Remaining: the §5 author
apply-day runbook (mirrored in STATE → Pending author actions).**
Rulings source: [findings-backlog.md](../reviews/findings-backlog.md) → RULINGS (2026-08-06 eng
review, B12/B13/B14 + C11/C13); defect detail in [s1-retro.md](../reviews/s1-retro.md) (items
9–15 + audit addenda). This plan re-derives those rulings against shipped reality per P10;
the corrections found are listed first because several change the work.

**Long-term stance (author's standing rule):** short-term pain for long-term gain. This slice
is the identity substrate every future class and activity row sits on. Where a ruling left the
mechanism open, this plan prefers the durable shape (audited RPCs, immutable-by-construction
records, typed contracts) over the quick patch — the cost of rework explodes once real
classes and student work exist.

---

## 0. Sequencing position (settled, verified 2026-08-08)

- This slice is **work package 7** of the ruled execution order; packages 1–6 are done.
- **C13 gate satisfied:** the POLICY_VERSION bump (`2026-08-07-draft-2`, commit `73ab7bc`)
  landed before this slice's assertion-immutability migration. (Counsel's read still gates
  the first real classroom — D24 — but not this migration.)
- **C11/C4 ordering:** this slice lands **BEFORE** `student_domain` seeding. Nothing in this
  slice seeds it; every branch proof runs at production values inside rolled-back
  transactions (P3, P7). Seeding remains S9 gate 4, an author action.
- CI is green on main; working tree clean.

## 1. Shipped-reality corrections (P10 recon, 2026-08-08)

These correct assumptions embedded in the rulings/backlog prose:

1. **The live admission trigger is `0021:42-77`, not 0013.** 0013's body is dead
   (superseded by `CREATE OR REPLACE`). The migration must replace the 0021 version.
2. **The trigger has 3 branches** (allowlist → student_domain → refuse), not 4. B13's
   "four branches at production values" resolves to four *proof rows*: exact-case teacher,
   **mis-cased teacher (the armed defect)**, student-domain admission, refusal.
3. **Join-code regeneration already ships** (`Classes.tsx:208-216` "New code" button) — but
   as `rpc('generate_join_code')` + a **client table UPDATE** under `classes_update_own`,
   with no audit row. B14 composes remove-with-regenerate on top of this path.
4. **`classes_update_own` pins only `teacher_id`/`age_assertion_by`** — `age_assertion_at`,
   `assertion_text_version`, `join_code`, even `deleted_at` are client-writable today.
   Also latent: its WITH CHECK requires `age_assertion_by = auth.uid()`, so a class whose
   assertion was stamped by someone else is un-updatable — fine today, wrong under any
   future co-ownership (the fall dept-co-ownership arc).
5. **`assignments` has NO `class_id`** — it predates 0014's classes and carries
   Google-Classroom text ids. **B12's "joined-class activities" has no data surface.**
   (§3 D-6 is the decision.)
6. **`Home` is statically imported into the entry chunk** (`App.tsx:6`) — the entry chunk
   *is* the student shell and `check-perf-budget.mjs` measures it. The student branch
   belongs there by design; the teacher branch is what's arguably in the wrong tier now.
7. **No OAuth-callback error handling exists anywhere.** A trigger-refused signup bounces
   back with `?error_description=…` in the URL and nothing reads it — the user just sees
   the same screen again. The refused-account screen must start from URL-param parsing.
8. **The e2e student harness never talks to Supabase** — it fakes localStorage session
   state only, stubs only `**/functions/v1/*`, and `fakeSession` carries no role and an
   `@e2e.invalid` email. Join-flow + role-branch e2e rows need harness extension
   (`/rest/v1/rpc/*` + `/rest/v1/users*` stubs, role-aware `fakeSession`).
9. **`join_class` folds "account disabled" and "not a student" into one error string**
   (`0014:215-217`) — a soft-deleted student is told "Only student accounts can join".
10. **Zero-coverage floor under B14:** `listClassMembers`, `removeClassMember`,
    `regenerateJoinCode`, `softDeleteClass` are exercised by nothing at any level
    (s1a item 9), and `classes.ts` carries a hand-shadowed `MemberRow` + 5 `as` casts.

## 2. Scope

**In:** migration 0027 (gate hardening) + its verify script; role in `SessionContext`;
student Home branch; join-by-code UI + `/join/:code` deep link; `hd` on sign-in;
refused-account screen; sign-out chrome on the student surface; B14 two-action remove
dialog; unit + e2e coverage for all of the above.

**IdP expansion map (recorded 2026-08-09 so no session re-derives it):** Blackboard/
Canvas are LMSes, not identity providers — they federate to the district's real IdP.
The K-12 IdP landscape: Google Workspace (current target, works as-is regardless of
LMS), Microsoft 365/Entra (those students have NO Google account — the cheap second
door: Supabase's `azure` provider + a second button; the admission trigger keys on
email domain and is IdP-agnostic by design), Clever/ClassLink (SSO brokers + ROSTERING
— would supersede join codes; already in STATE's backlog, demand-triggered), LTI 1.3
(activities launched inside Canvas/Blackboard with LMS-asserted identity — biggest
lift, only if a district demands in-LMS embedding). Expansion order when demand
arrives: Azure → Clever/ClassLink → LTI. Nothing built now; the seams are deliberate
(domain-keyed trigger, all membership through `join_class`, refusal copy in the
shared-constants module so IdP wording is a one-file edit).

**Out (explicitly):** `student_domain` seeding (S9 gate 4, author, AFTER this slice);
roster sync (future seam — all membership creation stays through `join_class`);
Edge Function changes (none needed — this slice is DB + app only; no bundle regens);
the compliance-pack counsel read (D24, gates classrooms not code); demolition of the
anonymous wire (S9 gate 5); **integration e2e lane against a real local Supabase
(unstubbed auth/RPC/RLS) — S9 design-review agenda item by DX ruling F5** (this
slice's real-DB coverage lives in the verify runner + rolled-back DO proofs).

## 3. Decisions

**Settled by the 2026-08-06 rulings** (restated for the record, not re-opened):

- S-1. Role is fetched into `SessionContext` (one `users.role` select on auth-state
  change); **UX-only trust** — every data surface stays RLS-gated; one comment says so.
- S-2. Student Home = join-by-code UI + shareable `/join/:code` link + joined-class
  view + sign-out chrome. Join code survives the OAuth redirect via `redirectTo` state.
- S-3. Personal-Gmail / refused accounts get a real screen; `hd` is passed as the
  district hint (UX only; the trigger stays the gate).
- S-4. B13's five hardening items land migration-first, before seeding.
- S-5. B14: two explicit actions, **no default**: "Remove" / "Remove & regenerate code
  (prevents rejoin — invalidates the posted link for future joins)".

**RULED at the 2026-08-08 eng review (E-numbers; scope ruled first: full plan
including all four adjacencies D-9/D-10/D-11/D-12):**

- **E-1 (settles D-1, D-4; ⚠ amended by OV-6/T4).** Immutability by **column-level
  grants**: `REVOKE UPDATE ON classes FROM authenticated; GRANT UPDATE (name) …` —
  name is the only client-writable column. `updated_at` moves to a BEFORE UPDATE
  trigger stamp (also kills client clock skew). `join_code`, `deleted_at`, AND
  `expected_domain` are RPC-only: domain edits **loosen the admission boundary**
  (null domain + leaked code admits any student), so D-4's edit path is an audited
  `update_class_domain(class_id, domain)` DEFINER RPC (`class.update` audit, old/new
  in metadata) + the `like '%.%'` CHECK in 0027 — **with a defensive normalize/null of
  any non-conforming existing rows first (OV-7: never trust a plan-time row count at
  apply time, P11)**.
- **E-2 (settles D-2; ⚠ amended by OV-4/T3).** `create_class(...)` SECURITY DEFINER
  RPC in `join_class`'s idiom: validate, insert with server-side collision retry, write
  `class.create` audit, return jsonb. The client INSERT + 3-retry loop in `classes.ts`
  dies — and so does the side door: **0027 revokes INSERT from authenticated and drops
  `classes_insert_teacher`**, making the RPC the only creation path; the grant-matrix
  assertions extend to INSERT.
- **E-3 (settles D-3).** `regenerate_join_code(class_id)` SECURITY DEFINER RPC:
  ownership check, collision retry, `class.update` audit with old/new code in metadata,
  returns the new code. Classes.tsx "New code" and B14's dialog both call it. The dead
  `class.update` enum gains its writer.
- **E-4 (settles D-5).** Role fetched **on signed-in user-id change** (not every auth
  event — TOKEN_REFRESHED fires hourly and reuses the cached value), cleared on
  sign-out. Shell holds the neutral "Checking session…" state until role resolves;
  fetch failure → explicit retry state, NEVER a defaulted teacher shell. Stale role
  after a manual DB demotion is accepted-cosmetic (RLS cuts real access) and documented
  in the UX-only-trust comment.
- **E-5 (settles D-6).** "Joined-class activities" **defers to S9** — no class→activity
  link exists (`assignments` has no `class_id`) and S9's design review owns the student
  content surface. Student Home v1: joined classes + "your teacher shares activity
  links" copy. The container component is identical either way.
- **E-6 (settles D-7).** `hd` from a single `VITE_DISTRICT_HINT` env default, read in
  `lib/supabase.ts` ONLY (the env-masked-local-verification learning: the one env-read
  site tests already mock). Student-facing sign-ins pass it when set; teacher Home does
  not; unset → no hint. Per-class lookup explicitly rejected for v1.
- **E-7 (settles D-8, D-9; ⚠ REWORKED by OV-1/T1).** GoTrue does NOT forward a
  signup-trigger `raise exception` message to the OAuth callback — the redirect carries
  only a generic `server_error` / "Database error saving new user" (the real message
  goes to GoTrue's server logs). So the refusal screen keys on **any auth-callback
  error at a student-facing entry point** (no other error class exists on that path
  today), generic detail logged; **a live probe of the real callback shape is a
  build-step prerequisite** before the screen is written. The shared-constant contract
  survives ONLY where messages reach the client verbatim: `join_class`'s split error
  strings (disabled-account vs not-a-student DISTINCT, via PostgREST). The pin test
  greps the latest defining migration AND verify-0027 asserts the constants against
  live `pg_proc.prosrc` (OV-10: a grep-the-file pin expires the day 0028+ replaces the
  function — the exact trap correction 1 documents). **Cross-language bridge (OV-DX
  #10): the strings live in ONE shared JSON file; the TS module imports it and the
  verify runner reads it to inject `psql -v` variables — no retyping in SQL, no TS
  parsing.** Callback parsing handles BOTH hash and query forms.
- **E-8 (NEW; ⚠ REWORKED by OV-2/OV-3/T2).** No throttle, no contract rewrite: a
  raise-based function cannot persist a failure trace (the raise rolls it back — which
  is why only success is audited today), and the threat is geologic (~890M codes,
  student accounts only). Instead: **`RAISE LOG` on each refusal** (emitted before the
  error raise, survives the rollback, visible in Supabase logs) + a dated comment in
  `join_class` recording the enumeration arithmetic, the acceptance, and the revisit
  triggers (multi-district or public signup). **Liveness proof mechanism (OV-DX #6 —
  `RAISE LOG` cannot be SELECTed):** the runner sets `client_min_messages = log` for
  that section and asserts the refusal line on psql's stderr; a row-based check here
  would be vacuous (P9's family).
- **E-9 (settles D-13).** Teacher opening `/join/:code` gets an **explanatory screen**
  ("join links are for student accounts" + link to /classes) — never a raw join_class
  error, never a silent bounce. Auto-submit happens only after role resolves to
  student (E-4's gate).
- **E-10 (NEW).** One shared `signInWithGoogle({redirectTo, districtHint})` helper
  replaces the two divergent hand-rolled call sites and hosts the third; unit test pins
  the hd passthrough.
- **E-11 (OV-8).** E-4's state machine gains an explicit **zero-rows state**: a role
  select returning no row (possible under future policy shapes; a soft-deleted student
  today still returns a row per 0018's filterless `users_select_self`) renders an
  "account unavailable" screen with sign-out — honest copy, never a retry loop, never
  a defaulted shell.
- **OV pass record (2026-08-09, Claude subagent — Codex not installed):** 12 findings.
  Accepted: OV-1 (E-7 rework), OV-2/3 (E-8 rework), OV-4 (INSERT revoke), OV-6
  (domain RPC), OV-7 (defensive normalize), OV-8 (E-11), OV-10 (prosrc pin), OV-11
  (live `/join` round-trip in author actions). Rejected with reasons: OV-5 (0027a
  split — seeding is already author-gated behind this slice, and build order fronts
  the migration regardless), OV-9 (localStorage role cache — staleness machinery in
  the auth path against a tens-of-ms select; revisit trigger = perf lane observation),
  OV-12 (Home v1 is already the minimal join-form + class-list shape it proposes).
- **Requirement (no decision):** `/join/:code` as an OAuth `redirectTo` target needs
  the Supabase dashboard's **Additional Redirect URLs** to cover the path pattern —
  joins Pending author actions (§5).

**Settled by ruling or made moot (kept for the record):**

- **D-1. Assertion-immutability mechanism.** RLS WITH CHECK cannot reference OLD values,
  so "strip the two columns from `classes_update_own`" needs a mechanism.
  **Recommend column-level grants**: `REVOKE UPDATE ON classes FROM authenticated;`
  `GRANT UPDATE (name, expected_domain) ON classes TO authenticated;` — immutability
  by construction, visible in the grant matrix verify scripts already assert on
  (aclexplode pattern in verify-0013-0014 §B). Consequences: `join_code` and
  `deleted_at` leave the client-writable set too, which **forces** D-2/D-3's RPC
  answer — deliberate, since both are audit-worthy actions (long-term stance).
  Alternative: a BEFORE UPDATE trigger comparing OLD/NEW (keeps the policy untouched
  but hides the rule in trigger code).
- **D-2. `class.create` writer.** Recommend a `create_class(...)` **SECURITY DEFINER RPC**
  (join_class's exact idiom: validate, insert, audit, return jsonb), replacing the
  client INSERT + its 3-retry collision loop (moves server-side). Alternative: AFTER
  INSERT audit trigger keeps the client INSERT — cheaper now, but leaves creation
  validation client-side and the RPC becomes necessary anyway the day anything else
  (Bank, sync) creates classes.
- **D-3. Promote regenerate-join-code to an audited RPC** (`regenerate_join_code(class_id)`
  writing `class.update` audit with old/new in metadata). Not explicitly ruled, but B14
  makes regeneration a *lockout* action — an unaudited lockout is a hole, and D-1's
  grant shape orphans the client-update path anyway. This also gives the dead
  `class.update` enum its writer. Same treatment question applies to rename/domain-edit
  (D-4) — if those stay client updates under column grants, `class.update` audit for
  them is deferred (say so in a comment), or fold them into an `update_class` RPC.
- **D-4. `expected_domain` edit path.** Ruled to exist ("a typo'd domain currently bricks
  joining, remedied only by delete-and-recreate"). Recommend: inline edit in the class
  card writing through whatever D-1/D-3 settle (column grant or RPC), with the
  `like '%.%'` format CHECK added in 0027 (table has 0 rows — CHECK is safe to add).
- **D-5. Role fetch shape & the flash problem.** `SessionContext` grows
  `{ role: 'teacher' | 'student' | null, roleLoading }`. Home must not flash the teacher
  shell at a student while the role select is in flight. Recommend: sessioned-but-roleless
  renders the same neutral "Checking session…" state `RequireAuth` already uses; role
  result cached per session (re-fetched on auth-state change only). Failure mode: role
  fetch fails → treat as unknown, show retry, never default to teacher shell.
- **D-6. "Joined-class activities" has no data surface (correction 5).** The options:
  (a) **Recommend: defer the activity list to S9** — student Home v1 shows joined
  classes + "your teacher will share activity links" copy; joining is this slice's
  deliverable, the *content* surface is S9's (it owns the viewer-list UX anyway).
  (b) Add `class_id` to `assignments` now + minimal teacher assign UI — real schema
  + UI work that S9's own design review should shape, not this slice.
  Long-term note for (a): no rework risk — the classes list component is the container
  either way; S9 fills it.
- **D-7. `hd` value source.** The app can't read a class's `expected_domain`
  pre-auth (RLS). Recommend: pass `hd` only where a domain is knowable — a single
  `VITE_DISTRICT_HINT` env default for the v1 single-district reality, used by the
  student-facing sign-in call sites (`/join/:code` screen, StudentViewer pre-auth).
  Explicitly NOT a per-class lookup (would need an anonymous endpoint — S9 can revisit
  if multi-district ever lands). Teacher sign-in on Home passes no `hd`.
- **D-8. Refused-account screen mechanics.** Parse `error_description` from the callback
  URL (hash and query forms) in one place; if it matches the trigger's "not permitted"
  message, render the refusal screen (district hint + "use your school account" +
  sign-in-again with `hd`); otherwise a generic auth-error state. The trigger's message
  becomes a **shared constant contract** (P2): the SQL string and the client matcher
  derive from one recorded value, with a test pinning them together.
- **D-9. `join_class` error-string split (correction 9).** In scope? It's one line in
  0027 (the function is already being replaced-adjacent) and the disabled-account case
  gets honest copy ("This account is disabled — ask your teacher"). Recommend: yes,
  while the file is open; the strings join the D-8 shared-constant contract.
- **D-10. Idle sign-out wiring (C2) — this slice or S9?** B12's ruling text includes
  "sign-out chrome (the 2.4A wiring)". Recommend: wire **sign-out chrome** (visible
  control on the student surfaces) + `watchIdleSignOut` on the student shell now, with
  the e2e row s1:9 demands — it's the same surfaces this slice builds, and deferring
  splits one wiring job across two slices. C2 then closes early.
- **D-11. Demotion hole** (`is_class_teacher` checks ownership only — a demoted teacher
  keeps roster reads/removal/delete; s1a item 11). Not ruled. Recommend: fix in 0027
  (add a `current_user_is_teacher()` conjunct to `is_class_teacher`) — it's the same
  admission-boundary family B13 exists for, and it's two lines while the migration is
  open. Flag: touches the helper-call discipline (CLAUDE.md: RLS calls helpers).
- **D-12. Typed RPC seam (correction 10).** B14 lands on zero-coverage functions with
  hand-shadowed types. Recommend: minimum-bar only — unit tests for the four untested
  functions land WITH the B14/D-3 changes (P1); the full generated-types adoption stays
  on the opportunistic watchlist (not this slice).
- **D-13. `/join/:code` for a signed-in TEACHER.** Recommend: explanatory screen
  ("Join links are for student accounts") — never auto-join (join_class refuses anyway;
  the screen just makes the refusal honest). A signed-out hit stores the code, runs
  sign-in with `redirectTo` back to `/join/:code`, and auto-submits on return **only
  after** the role resolves to student.

## 4. Build order

Migration-first (B13's hard rule), then app, then composition:

1. **0027 migration** — trigger replace (case-normalized allowlist compare + lower()
   normalization of existing `allowlist` rows + CHECK `email = lower(email)`),
   defensive normalize/null of non-conforming `expected_domain` rows THEN the
   `like '%.%'` CHECK, E-1 column grants (UPDATE narrows to `name`; INSERT revoked +
   `classes_insert_teacher` dropped per E-2) + `updated_at` trigger, the three DEFINER
   RPCs (`create_class`, `regenerate_join_code`, `update_class_domain`) with
   `class.create`/`class.update` audit writers, E-7 `join_class` error split (strings
   from the shared-constant module) + E-8 `RAISE LOG` refusal line + dated acceptance
   comment, D-11 `is_class_teacher` role conjunct. One migration, one concern-family:
   the admission/assertion boundary.

   ```
   Admission & class-write boundary after 0027
                                                    ┌─ audit rows ─┐
   student ─ Google OAuth ─▶ handle_new_auth_user ──▶ user.create   │
              │  (hd hint)     ├ allowlist (lower=lower) → teacher  │
              │                ├ student_domain → student           │
              │                └ else RAISE (generic at callback;   │
              │                   client shows school-account screen)
              └─ /join/:code ─▶ join_class ─────────▶ class.join    │
                                 ├ split errors (verbatim to client)│
                                 └ RAISE LOG on refusal (survives)  │
   teacher ── create_class ─────────────────────────▶ class.create  │
          ── regenerate_join_code ──────────────────▶ class.update  │
          ── update_class_domain ───────────────────▶ class.update  │
          ── UPDATE classes SET name (only client-writable column)
   ```
2. **Verify runner + script migrations (T11 — BEFORE step 2b's rehearsal can run,
   OV-DX #9):** `scripts/verify-runner.mjs` + `pnpm verify:auth`; migrates all four
   README-mandated regression scripts runner-compatible (X2). Key mechanics: the
   verify-0025 §C idiom raises `EXPECTED ROLLBACK >>>` on the GREEN path — the runner
   classifies that exception as PASS (OV-DX #2); explicit `--target local|live` flag
   reading distinct DSNs, refuses to run untargeted (OV-DX #5); `SUPABASE_DB_URL`
   pooler DSN from `.env.supabase` (OV-DX #3); `client_min_messages=log` + stderr
   capture for the E-8 line (OV-DX #6); psql-missing error prints the
   install+link one-liner (OV-DX #7). verify-0013-0014's §C/§D are commented-out
   manual blocks with placeholders — they get REWRITTEN as self-fixturing DO blocks,
   not ported (OV-DX #4); its §E header records the X1 supersession.

2b. **verify-0027.sql** — verify-0025 §C pattern (single rolled-back DO block seeding
   `student_domain` + inserting real `auth.users` rows so the REAL trigger fires):
   the four proof rows from correction 2, at production values, plus grant-matrix
   assertions for D-1 and audit-row assertions for D-2/D-3. Residue-printing per P7.
   Re-run `verify-0013-0014.sql` + `verify-0017.sql` (CLAUDE.md rule for auth/RLS/grant
   migrations) — expect §B5's policy-count and grant-matrix expectations to need
   updating for D-1's grant change (update the script in the same commit).
3. **App: session + shell** — role in `SessionContext` (D-5), Home student branch
   (join UI + classes list + sign-out chrome), `/join/:code` route (D-13 flows),
   refused-account screen (D-8), `hd` (D-7), idle wiring (D-10).
4. **App: teacher side** — B14 two-action remove dialog (armed-delete precedent,
   `Classes.tsx:224-233`), D-4 domain edit, wiring through D-2/D-3 RPCs.
5. **Tests** — unit: SessionContext role states (fetch-on-id-change, reuse across
   refresh, clear on sign-out, failure→retry), the four uncovered classes.ts
   functions, E-7 constant contract pin (greps 0027's SQL), E-10 hd passthrough,
   callback parsing hash AND query forms; e2e (student lane): harness extension
   (role-aware `fakeSession`, `/rest/v1/rpc/*` + `/rest/v1/users*` stubs),
   `/join/:code` happy path, **double-click Join fires exactly one RPC**,
   **mid-join session expiry preserves the code via redirectTo state**, role-branched
   Home row, refused-callback row, idle/sign-out wiring row (s1:9); e2e (chromium
   lane): remove dialog both actions. **Regression rows (mandatory):** teacher signup
   E1 still admits; rejoin reactivation preserved; teacher Home unchanged;
   `Classes.test.tsx` create path updated for the E-2 RPC. Every route mock derives
   from production constants (P2); new primitives all have callers (P1 — the
   reachability lint enforces). QA artifact:
   `~/.gstack/projects/ZanReed-activity-platform/user-main-eng-review-test-plan-20260808-identity-slice.md`.
6. **Docs** — DECISIONS entry (this slice's rulings + D-numbers), STATE update
   (including the stale "uncommitted pack diff" note), data-map touch if D-2 changes
   the write path inventory, `hd` claim in DECISIONS becomes true (s1a item 15).

Perf discipline: steps 3–4 touch the entry chunk — run the 12 budget gates locally;
the student branch must stay within the shell budget (correction 6).

## 5. Pending author actions this slice will queue

**One-time setup (DX ruling G1 + OV-DX #3/#7 — all missing on the current machine):**
1. `brew install libpq && brew link --force libpq` — libpq is keg-only; without the
   link there is no `psql` on PATH. The runner shells out to psql because PostgREST
   cannot run the scripts' DO blocks / SET LOCAL ROLE.
2. Obtain the **database password** (dashboard → Settings → Database; reset it if
   never recorded) and create `.env.supabase` (real file — only the `.example` exists
   today) with `SUPABASE_DB_URL` = the **pooler** DSN (`…pooler.supabase.com` host;
   the direct `db.<ref>` host is IPv6-only and typically unreachable from home).
3. Docker Desktop or colima, for the one-off rehearsal. Declining Docker = rehearsal
   skipped, recorded as the accepted fallback.

**Apply-day stations, in order:**

- **Rehearse 0027 locally (F4, one-off):** `supabase start` → apply 0001–0027 clean →
  `pnpm verify:auth --target local` → discard. *Fidelity caveat (OV-DX #14): local
  `postgres` is effectively superuser and the connection path differs from
  psql-over-pooler — a green rehearsal proves the apply mechanics, NOT live grant
  posture; the live runner pass is the proof.*
- Apply migration 0027 live (BEFORE any future `student_domain` seeding; no function
  deploys).
- **`pnpm verify:auth --target live`** — runs the FULL README-mandated grant-surgery
  regression set (X2): verify-0027 + verify-0013-0014 + verify-0017 +
  verify-image-storage + verify-0020, per-assertion PASS/FAIL. **§E supersession
  (X1), recorded in verify-0013-0014's §E header:** verify-0027's rolled-back DO
  block fires the REAL trigger on REAL `auth.users` inserts over a live connection —
  the E1/E3 live-signup equivalent; E2 = Probe 2 below; the student-join live proof
  is S9 gate 4's existing "live-verify the trigger's student branch after seeding".
- **Dashboard (F2):** Supabase Auth → URL Configuration → Additional Redirect URLs —
  add `http://localhost:5173/join/*` and `<production-origin>/join/*` (wildcard
  segment syntax; keep existing entries). Probe 1 below is this station's liveness
  proof (OV-11 — a misconfigured redirect is silent and invisible to every stubbed
  test).
- **Probe 1 — redirect + route + role branch (OV-11, EXPECT rewritten by X1):** open
  `<origin>/join/<REAL_CODE>` signed out in a fresh profile → sign in with YOUR
  teacher account. EXPECT: land back on `/join/<REAL_CODE>` showing the E-9 "join
  links are for student accounts" screen. A bounce to `/` = redirect pattern wrong;
  fix and re-run. (The student joined-confirmation probe is impossible before
  `student_domain` seeding — it lives at S9 gate 4.)
- **Probe 2 — refusal callback shape (E-7 prerequisite; runs BEFORE T5's refusal
  screen is finalized):** same URL, sign in with a throwaway personal Gmail. EXPECT:
  refused signup; RECORD the raw callback URL params (hash or query, exact
  keys/values) — the refusal screen's parser is built against this recording.
- Set `VITE_DISTRICT_HINT` in `.env.local` when ready (unset = no hint, graceful).
- **Record TWO STATE datapoints (Pass-8 boomerang; denominators split per OV-DX
  #12):** (a) one-time setup duration (installs, first `supabase start` image pulls)
  and (b) steady-state station duration — the <15-minute prediction applies to (b)
  only.
- (Later, S9 gate 4, unchanged: seed `student_domain` + live-verify the student
  branch, including the full join round-trip probe.)

## 6. Risks / watch items

- **The armed defect is the slice's reason to exist**: a mis-cased allowlist teacher
  becomes a *student* the moment `student_domain` is seeded (s1a item 10). The 0027
  proof row for this case is the slice's most load-bearing test.
- Grant-matrix changes (E-1/E-2) ripple into verify-0013-0014's §B expectations — update,
  don't fork (the hand-copied-expectations policy).
- `fakeSession` gaining a role must not silently diverge from the real JWT/users-row
  shape — derive the harness shape from the same constant the app reads (P2).
- Entry-chunk growth from the Home branch — budgets are the gate, watch the shell rows.

## 7. What already exists (reused, not rebuilt)

- Join-code display/copy UI + "New code" control (`Classes.tsx:30-52,208-216`) — rewired
  to the E-3 RPC, not rebuilt.
- The armed-delete two-step (`Classes.tsx:224-233`) — the precedent B14's dialog follows.
- `watchIdleSignOut` + `signOutEverything` (`studentAuth.ts`) — tested primitives, this
  slice only wires them (D-10).
- `join_class`'s rejoin/reactivation semantics (0014) — preserved, regression-pinned.
- The e2e faked-session harness (`studentSession.ts`) — extended (role + rest stubs),
  not forked.
- `RequireAuth`'s neutral loading state — the same state E-4's gate holds.
- Deliberately NOT reused: the client `INSERT`/`UPDATE` compose paths on `classes` —
  replaced by the audited-RPC posture (E-1/E-2/E-3/T4).

## 8. Failure modes (per new codepath)

| Path | Realistic failure | Test? | Handled? | User sees |
|---|---|---|---|---|
| Role select | Network fail / timeout | unit | retry state (E-4) | explicit retry, never wrong shell |
| Role select | Zero rows | unit | E-11 state | "account unavailable" + sign-out |
| OAuth callback | Trigger refusal (generic error) | e2e (stubbed URL) | any-error screen (E-7) | school-account screen |
| `/join` redirect | Dashboard allowlist missing | **author live probe** (OV-11) | n/a (config) | would silently land on Site URL — probe closes it |
| join_class | Disabled account | verify + unit copy | split string (E-7) | honest "account disabled" copy |
| join_class | Enumeration | verify (log line) | RAISE LOG + accepted (T2) | n/a — logged server-side |
| create/regen/domain RPCs | Collision exhaustion / non-owner | verify | raise → surfaced error | error banner |
| Migration apply | Non-conforming domain row | 0027 defensive normalize (OV-7) | yes | n/a (author-side) |

**Critical gaps: 0** after the OV amendments (the redirect-misconfig silent path was the
one candidate; OV-11's live probe closes it).

## 9. Parallelization

| Step | Modules touched | Depends on |
|---|---|---|
| 0027 + verify-0027 | supabase/migrations, scripts/ | shared-constant strings agreed |
| Constants module | packages/app/src/lib | — |
| Session/shell/join/refusal UI | packages/app/src (routes, lib) | constants; RPC shapes (stubs fine pre-apply) |
| Teacher dialog + domain edit | packages/app/src (Classes) | RPC shapes |
| Harness + e2e rows | packages/app/e2e | app surfaces |

Lane A: constants → 0027 + verify (sequential). Lane B: constants → session/shell/join UI
→ harness/e2e (sequential). Lanes A and B parallelize after the constants module lands;
the teacher-dialog step shares `packages/app/src` with Lane B — same lane, sequential.
Realistically a single-session sequential build also fits (the repo's usual mode).

## 10. Implementation tasks

Synthesized from this review's findings; checkbox as you ship.

- [x] **T1 (P1, CC: ~20m)** — app/lib — shared-constant module: join_class split strings + refusal-screen keys; pin test greps latest defining migration (E-7)
- [x] **T2 (P1, CC: ~1.5h)** — supabase — 0027: trigger replace w/ case-normalized compare, allowlist lower()+CHECK, domain defensive-normalize+CHECK, UPDATE grant→(name), INSERT revoke + policy drop, updated_at trigger, create_class / regenerate_join_code / update_class_domain RPCs + audit writers, join_class error split + RAISE LOG + dated comment, is_class_teacher role conjunct (E-1/E-2/E-3/E-7/E-8/T3/T4/D-11)
- [x] **T3 (P1, CC: ~1h)** — scripts — verify-0027 (verify-0025 §C pattern): four trigger proof rows, grant matrix incl. INSERT, audit-row assertions, prosrc constant assertion, RAISE LOG fire, throttle-acceptance comment check; update verify-0013-0014 §B expectations (P3/P7/OV-10)
- [x] **T4 (P1, CC: ~45m)** — app — SessionContext role: fetch-on-user-id-change, neutral gate, failure→retry, zero-rows→account-unavailable (E-4/E-11)
- [x] **T5 (P1, CC: ~1.5h)** — app — Home student branch + /join/:code route (auto-join after role resolves, teacher explanatory screen, signed-out redirectTo state) + refusal screen keyed on any callback error, hash+query parsing (B12/E-5/E-7/E-9)
- [x] **T6 (P2, CC: ~20m)** — app — signInWithGoogle helper + VITE_DISTRICT_HINT via lib/supabase.ts (E-6/E-10)
- [x] **T7 (P2, CC: ~45m)** — app — B14 two-action remove dialog + domain-edit UI on the RPCs; Classes.test.tsx create-path regression update (B14/T4/E-2)
- [x] **T8 (P2, CC: ~30m)** — app — idle sign-out wiring + student sign-out chrome (D-10, closes C2 early)
- [x] **T9 (P1, CC: ~1.5h)** — e2e — harness extension (role fakeSession, /rest/v1 stubs from production constants) + rows: join happy, double-click, mid-join expiry, role-branched Home, refusal, idle wiring (s1:9), remove dialog both actions + 4 regression rows
- [x] **T10 (P2, CC: ~30m)** — docs — DECISIONS entry, STATE update (incl. stale pack-diff note + apply-day duration datapoint slot), data-map write-path inventory, hd claim now true
- [x] **T11 (P1, CC: ~2.5h — honest restatement per OV-DX #4)** — scripts — verify runner (`pnpm verify:auth`, DX D4/F1/G1/X1/X2 + OV-DX #2/#3/#5/#6/#7): psql subprocess, `--target local|live` (refuses untargeted), `SUPABASE_DB_URL` pooler DSN, EXPECTED-ROLLBACK-classified-as-PASS, stderr LOG capture for E-8, per-assertion PASS/FAIL with expected-vs-actual + failing-section SQL on mismatch; migrates ALL FOUR mandated scripts (verify-0013-0014 §C/§D rewritten self-fixturing + §E supersession header, verify-0017, verify-image-storage, verify-0020); shared-JSON constants injected via `psql -v`; migrations/README gains Option C; **sequenced BEFORE the F4 rehearsal (build order step 2)**
- [x] **T12 (P2, CC: ~10m)** — docs/env — VITE_DISTRICT_HINT documented in `.env.local.example` + README getting-started + a harness comment recording it deliberately unset in e2e lanes (DX F3)

## 11. DX review record (2026-08-09, /plan-devex-review — EXPANSION mode)

**Persona:** the author (runs every deploy/migration by hand, eyeballs EXPECT lines)
+ fresh AI sessions (one context window; anything not in docs is lost). **Framing
ruled:** internal-tooling surface — build/test/verify/apply workflows, not end-user UX.

**Rulings:** D4 verify runner IN (this slice); F1 both mandated re-run scripts migrate
runner-compatible now; F2 exact author runbook in §5; F3 env-var docs in the three
discovery homes; F4 one-off local rehearsal of 0027 (not a standing lane); F5
integration e2e lane DEFERRED to S9's design review (named in §2 Out); G1 prereqs
documented as one-time installs (psql via libpq, Docker) with a recorded skip-fallback
for the rehearsal — zero-runtime-deps rule intact.

**Journey after rulings:** session handoff (STATE → this doc) → build (standard pnpm,
no bundle regens) → test (unit + stubbed e2e lanes) → rehearse (local stack, one-off)
→ apply (`db push`) → verify (one command, three scripts, PASS/FAIL) → configure +
probe (exact strings + EXPECT lines) → record (STATE datapoint). Apply-day estimate:
under 15 minutes vs the pre-review ~30–45 eyeballed minutes; failure modes now print
themselves instead of hiding in a skimmed EXPECT line.

**DX outside-voice pass (2026-08-09, Claude subagent):** 14 findings — 4 P1s all
verified correct (Probe 1 unrunnable pre-seeding; runner vs EXPECTED-ROLLBACK idiom;
`.env.supabase` holds HTTP creds not a DSN; verify-0013-0014 §C/§D are a rewrite and
§E needed a disposition). Ruled: X1 (§E supersession + Probe 1 rewrite + join probe
→ S9 gate 4), X2 (runner covers all FOUR mandated scripts), X3 (eleven mechanical
spec-completions accepted as a batch). All folded into §4/§5/E-7/E-8/T11.

**Scorecard (TARGETS the build must hit — a projection, not a measurement; the
Pass-8 boomerang datapoints in §5 are what turn these into measurements, per OV-DX
#12):** Getting-started/apply-day 9 · command ergonomics 9 · error output 9 · docs 9
· upgrade path 9 · dev environment 8 (CI cannot run the runner — no live DB in CI;
accepted, F5 owns the future) · community n/a · DX measurement 8. Overall target
**9/10** against a pre-review baseline of ~5 (five manual stations, two dead-on-
arrival prerequisites, three-of-five mandated scripts uncovered).

## 12. Design spec (2026-08-09, /plan-design-review — rulings P1–P4 + 20 outside-voice findings)

**Approved visual reference (the implementer builds from this):**
`~/.gstack/projects/ZanReed-activity-platform/designs/identity-screens-20260809/wireframes.html`
— v2 board, 12 frames, every state; slate tokens from `index.css`; dark mode via the
app's `light-dark()` tokens (verify with ThemeToggle). Direction: viewer-gate
composition (eyebrow/title/body/one button) for student gate screens; token-styled
cards for Home; near-monochrome, no gradients, no decoration.

**Ruled decisions:**
- **P1:** Sign-in-failure screen is **cause-agnostic** ("We couldn't sign you in" +
  school-account guidance as the *likely* fix) — the screen fires on ANY callback
  error and cannot know the cause. Probe 2's recording may enable branching later.
- **P2:** Auto-join stays frictionless; the success screen carries "Wrong class? Ask
  your teacher to remove you." The pre-auth class-name meta endpoint is recorded as
  the S9 fix (join gate can only show the code — RLS hides the name pre-auth).
- **P3:** Error-screen route split follows E-6's hd asymmetry: `/join/:code` +
  StudentViewer gate render the school-account frame; Home (shared entry) renders the
  generic frame without school-account guidance. Parser shared; copy branches by
  surface; route list enumerated in T5.
- **P4 (17 mechanical, all accepted):** join-error states inline under the input with
  code preserved and per-case E-7 constant copy; regenerate **after-state** showing
  the new code + copy affordance ("The old link no longer works"); **neutral
  signed-out Home** + idle-sign-out "your work is saved" banner variant;
  `prompt: 'select_account'` on the failure screen's retry (pinned by test — without
  it Google silently reuses the rejected account); dialog focus rules (open on safe
  "Remove", trap, Esc, return-to-invoker), Cancel promoted to a full row, in-dialog
  busy/error; join-input interaction spec (uppercase-on-input, 6-char gate, paste
  trim, Enter submits, in-flight disable, "6-character code" copy — alphabet already
  excludes O/0/I/1); the 8s `SLOW_LOAD_MS` escalation shared onto the role gate and
  join call; identity email in the topbar, card opens with "Your classes"; class-list
  loading/error frames; every sign-out control calls `signOutEverything` (S6-6
  contract, restated in T5/T8); copy fixes (no "this time", "wherever your teacher
  posts links"); 44px touch floors incl. padded quiet-links; joining/joined as
  sequential states; primary-button consistency on 2c; inert class rows carry no
  hover affordance; keyboard order + focus-visible inheritance stated; 16px body on
  gate screens; visible "Class code" label (placeholder is not a label).

**Pass scores (before → after):** Info Arch 3→9 · States 4→9 · Journey 6→9 ·
AI-slop 8→9 · System alignment 8→9 · Responsive/a11y 3→9 · Unresolved 0.
Overall **4/10 → 9/10**. Not in scope (design): brand identity pass (backlog,
"when the identity question goes live" — arguably next), pre-auth class-name
endpoint (S9), student class-detail pages (S9 content surface).

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | — |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 (2026-08-08) | CLEAR (PLAN) | 22 issues, 0 critical gaps |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 (2026-08-09) | CLEAR (FULL) | score 4 → 9; 12-frame board approved; P1–P4 ruled |
| DX Review | `/plan-devex-review` | Developer experience gaps | 1 (2026-08-09) | CLEAR (EXPANSION) | score ~5 → 9 target; apply-day <15 min steady-state |

- **CROSS-MODEL:** Three outside-voice passes (Claude subagent; Codex not installed).
  Eng: 12 findings — 8 accepted (two P1s reworked E-7/E-8), 3 rejected with reasons,
  1 folded as E-11; tensions T1–T5 ruled. DX: 14 findings — 4 verified P1s; rulings
  X1–X3 folded. Design: 20 findings — 3 critical (absent join-error states, undesigned
  regenerate after-state, teacher-copy signed-out Home) + the select_account retry
  trap; P1–P4 ruled, all folded into §12 + the v2 wireframe board; one OV claim
  corrected (dark mode exists via light-dark() tokens).
- **VERDICT:** ENG + DX + DESIGN CLEARED — ready to implement. Scope = full plan +
  verify runner (D4/X2) + one-off rehearsal (F4) + the §12 design spec; migration-first
  order stands.

NO UNRESOLVED DECISIONS

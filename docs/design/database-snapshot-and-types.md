# Database snapshot and types — design pass (review C1)

**Status: RULED 2026-11-26 — the author said yes to all eight recommendations (D1–D8) as written.
Slices 1 and 2 BUILT the same day: `scripts/tests/rpc-arguments.test.mjs`; the shared parser
`scripts/lib/migrations.mjs` (+ `scripts/lib/rpc-calls.mjs`) with all four guards moved onto it, and
the generated [function index](../function-index.md) (`pnpm db:index`). Slice 3 BUILT the same day:
`pnpm db:types` → `packages/db-types/database.types.ts` + the Deno copy, stamp test, and
`pnpm db:types:live-diff` (live matched main at 0106). Slice 4 BUILT the same day: the app's client is
`SupabaseClient<Database>`, every call goes through `lib/db.ts`, 41 jsonb shapes live in
`lib/dbShapes.ts` (8 derived from the row set their wrapper returns, every column nullable), result casts 94 → 77 with a
ratchet, +34 B gz on the student shell. Slice 5 BUILT the same day: the grading worker's client and the
viewer's photo/video seams are typed through the shared `@activity/db-types/rpc` call types, and
`packages/viewer/src/server/dbPorts.check.ts` checks at compile time that every server port's row type (a hand-kept port→source roster)
fits the generated row behind it (both server bundles byte-identical, no redeploy). The Edge
Functions followed the same day (author's yes): `deno check` in CI with a check-only config whose
import map points the bundles at their TypeScript source; their clients and fetch helpers typed. All five slices and
the Edge Functions are built.**
Source: [code review 2026-11-26](../reviews/2026-11-26-code-review.md) item C1, with A5, C6 and C10
as the same family. Not in the build queue (TODOS entry carries its trigger; ranking is the author's).

## 1. The problem in one paragraph

To learn what the database is *today*, you replay 106 migrations in your head. A function restated
three times in two days (`class_progress` in 0096, 0097, 0099) lives in whichever file came last, and
you find it by grep. On the other side of the wire, the app, the viewer, the grading worker and the
Edge Functions call those functions by string, with argument objects and result shapes typed by hand.
A renamed parameter or a dropped function compiles clean and passes the unit tests, because the tests
mock the client. The only things that catch it are the local integration lane and a live student.

## 2. Facts, measured 2026-11-26 (not quoted from the log)

Method: a throwaway node scan of `supabase/migrations/*.sql` (latest definition wins, `drop function`
honoured, the same rules as `scripts/tests/rowset-rpc-bounds.test.mjs`) and of the non-test source in
`packages/app/src`, `packages/viewer/src`, `packages/grading-worker/src`, `supabase/functions`
(constants and the local `call()`/`rpc()` helpers resolved). Live reads through the Supabase connector,
read-only. Nothing written to the repo.

**The database**
- 106 migrations on both sides (live `schema_migrations`: 106 rows, max `0106`; re-measured after
  0105/0106 landed the same day — first measured at 104).
- 351 `create function` statements for 229 names; 71 names are defined more than once.
- Live `public` holds 228 functions (218 callable plus 10 trigger functions), the same 228 name/arity
  pairs the migrations produce. **The set of names in live
  matches the set the migrations produce, exactly** (no live-only function, no repo-only function).
  Bodies were not compared; that needs a local stack (slice 3's live check does it).
- One overload pair is live: `photo_answers_on()` and `photo_answers_on(p_activity_id)`.
- 80 `scripts/verify-*.sql` files; nothing maps a function to the scripts that cover it.

**The callers**

| | call sites | distinct functions |
|---|---|---|
| app | 83 | 65 |
| viewer (blocks + server ports) | 7 | 7 |
| grading worker | 2 | 2 |
| Edge Functions | 23 | 20 |
| **all** | **128** | **113** |

- Four app files (`classPlan.ts`, `classProgress.ts`, `mixedTeacher.ts`, `factProbe.ts`) wrap the client
  in a local `call(fn: string, args: Record<string, unknown>)`, which throws away any type the client had.
- Hand-written shapes in the app: 20 `…Row` interfaces, plus result interfaces under other names
  (`FirstTries`, `ProbeOverview`, `MixedSummary`, …); 113 lines cast `data … as`. 46 table reads
  (`.from('…')`) sit beside the RPCs, also untyped.
- **Argument drift today: none.** Every one of the 121 call sites whose name and argument keys could
  be read statically sends only parameters the latest definition has, and every required parameter.
  The log's worry is real but has not yet bitten in this form.

**What generated types would actually give** (from the live generator's output, 128 KB, 4,357 lines):

| the 113 called functions return | count | generated type gives |
|---|---|---|
| `jsonb` | 79 | `Json` — no shape at all |
| a row set (`TABLE`/`SETOF`) | 10 | full row type |
| a scalar or nothing | 24 | exact type |

So generated types type **every argument** (113 of 113), **every table read** (46), and the 10 row
sets — but **70% of the results the app reads stay hand-written**, because the house style is "return
one jsonb" (0106 moved seven more reads from row sets to jsonb wrappers, the A5 follow-up). This is the most important fact in this doc: types are not the whole answer.

**Real failures of this family** (history, git, memory):
- *Wrong relationship name, live.* `3b883f64` (2026-11-12): an embed hint named
  `activities_current_version_id_fkey`; 0001 calls it `activities_current_version_fk`. PostgREST 400,
  the whole class activities panel in its error state. Typed `.from().select()` resolves embed hints
  against the generated relationships, so an unknown hint types the result as an error and the code
  reading it fails `tsc` (to be confirmed on 2.105.3 in slice 4, not assumed). (Since guarded by
  `postgrestHints.test.ts`, a hand-rolled migration parser; since slice 2 it is
  `scripts/tests/postgrest-hints.test.mjs` on the shared parser.)
- *Rows silently cut at 1,000.* A5 / 0104 (2026-11-26), and 0043 and 0060 before it. **Types do not
  catch this**; the A5 guard does.
- *Code ahead of the database, live.* The Bank (0054, 2026-10-07): the app was pushed before the
  migration was applied, and the Activities list broke until the apply. `get-activity` v8 called
  `write_version_census` before 0026 existed (2026-08-04). Neither is caught by anything in CI; both are
  "is live where main thinks it is?".
- *Overloads.* 0040 and 0065 each had to drop the older form first, because a second overload makes
  every call ambiguous and defaults `EXECUTE` to PUBLIC; verify-0040 asserts one overload by hand.
- *Restating cost.* `purge_soft_deleted` has 11 definitions; finding the live body is a grep every time.

There are already **three hand-rolled migration parsers** in the tests (`rowset-rpc-bounds`,
`postgrestHints`, `data-map-coverage`), each with its own regexes. A fourth is coming either way.

## 3. Decisions

### D1. Where the truth comes from
- **(a) Live database** (`supabase gen types --project-id`). Describes what is deployed. Lags main
  whenever a migration waits for the author's apply; needs credentials; CI and cloud sessions can't.
- **(b) Local stack built from the migrations** (`supabase db reset` then `gen types --local`).
  Describes main. Deterministic. Needs Docker: the author's Mac and local sessions have it, CI's
  check job and cloud sessions do not.
- **(c) Parse the migrations in node.** Runs anywhere, CI included. Good for names, arguments,
  defaults, "which file holds the latest body", overloads. Poor for full return types (column types of
  `SETOF some_table`, enums, domains): it would be rebuilding Postgres.
- **(d) Add `supabase start` to CI** so CI can regenerate (b). +3–5 minutes and Docker images on every
  push, for a check the cheaper pieces mostly cover.

**Recommend: (c) for names, arguments and the index (CI checks them on every push), (b) for the full
types file, (a) only as an after-apply proof read. Not (d) for now.** CI can then check: every call
names a real function with real arguments; the index is current; the types file was regenerated after
the last migration changed. CI still cannot check: that the types file is *correct* (it trusts the
generator was run), or anything about live. Catalogue files outside the repo are unaffected: nothing
here reads them.

### D2. Where generated output lives and how drift fails
- Types: `packages/db-types/database.types.ts`, a types-only workspace package (no runtime export),
  plus a byte-identical copy at `supabase/functions/_shared/database.types.ts` for Deno, which can't
  reach outside `supabase/functions` at deploy.
- Regenerated by `pnpm db:types` (local stack), **by whoever writes the migration, in the same
  commit** — the bundle discipline.
- Drift: the file's header carries a sha256 of `supabase/migrations/*.sql`. A node test recomputes it
  and fails with "migrations changed since the types were generated — run `pnpm db:types`", and checks
  the two copies are identical. Honest weakness: unlike the bundles, CI doesn't rebuild the file, so the
  stamp proves the generator ran after the last migration edit, not that nobody hand-edited the output.
- A cloud session (no Docker) that writes a migration goes red on this test; regenerating becomes a
  "Pending author action" in its PR.

**Recommend: as above.** Cost: one script, one test, one ~130 KB committed file that changes with
every migration.

### D3. How far to type the client
- **(a) Type the client and route every RPC through one typed `rpc()`** in `lib/db.ts`:
  `createClient<Database>`, the Proxy cast becomes `SupabaseClient<Database>`, the four local
  `call(fn: string)` helpers become generic over the function name, the name constants get `as const`.
  `tsc` then checks every argument object and every table read. The 79 jsonb results keep their
  hand-written shapes, but in **one map keyed by function name**, so the cast happens in one place.
- **(b) Leave the client untyped; rely on slice 1's argument test.** Catches drift in CI, no
  refactor, but nothing types the 10 row sets or 46 table reads, and the embed-hint class stays with its
  own parser.
- **(c) Type the client, leave direct calls where they are.** Most of (a)'s value, no central map.

Shipped bytes: types are erased, so (a) costs zero bytes; the wrapper is a few lines. The stubs are a
runtime alias and are untouched. `@supabase/supabase-js` stays pinned exactly at 2.105.3; the generic
`Database` parameter leans on its type internals, so a future pin bump may need type fixes, which the
existing stub-pin test already makes a deliberate step. The student shell ledger in
`scripts/perf-budgets.mjs` is the proof: `SHELL_JS_GZ_KIB` is 158.7 and `SHELL_JS_BASELINE_BYTES`
with its spend band makes any byte change a recorded row, so slice 4 must leave the baseline where it
is. Measure before and after, under CI's build env.

**Recommend (a).** Cost: M–L — 33 files, 83 app call sites, done mostly by `tsc` telling you where.

### D4. Edge Functions and the viewer's server ports
The viewer's handlers reach the database through hand-typed ports (`CheckActivityDb`,
`VersionForCheckRow`, `RecordCheckResult`, …); the Edge Function `index.ts` files fill them with
untyped `.rpc()` calls (`record_check` has 15 parameters).
- **(a) In scope now for the argument test** (slice 1 already scans `supabase/functions` and the
  viewer), **typed ports later** (slice 5): port types derived from `Database` where the function returns
  rows or scalars; jsonb results stay hand-written.
- **(b) Out of scope.** They are exercised by the local integration lane.

**Recommend (a).** Typing them is small once the types exist; the argument test costs nothing extra.

### D5. A function index
- **(a) Generated `docs/function-index.md`**, from the node parser: function and arguments, returns,
  definer or invoker, **latest definition at `file:line`**, how many times defined, which verify
  scripts name it, and who calls it (app / viewer / Edge Function / worker). A CI test regenerates it
  and fails on difference.
- **(b) One snapshot file per function body** (`pg_get_functiondef` from the local stack). A
  migration that restates a 600-line function would then show as a readable diff of the body. Strong,
  but 218 files that need the stack to regenerate.
- **(c) Squash the migrations.** No: their headers are the decision record.

**Recommend (a) now, (b) not now** (revisit if restated-function reviews keep being expensive). Build
(a) on **one shared parser module** (`scripts/lib/migrations.mjs`) and move the three existing guards
onto it, so there is one set of regexes to get right.

### D6. The hand-written shapes: when to migrate, and what stops new ones
- Arguments: **all at once** in slice 4 — once the client is typed, `tsc` lists every bad call.
- Result casts: **as files are touched**, with a ratchet: a test counts `data … as` casts outside
  `lib/db.ts` and fails if the number goes up.
- New hand-written jsonb shapes: they are unavoidable (79 functions), so the guard is a
  **"checked against" stamp**: each entry in the jsonb shape map records the migration it was checked
  against. When a function is restated in a later migration, the test fails: "`class_progress` was
  restated in 0105; re-read its `jsonb_build_object` keys and bump". That turns "remember to check the
  shape" into a red row at the moment it matters.
- A test that forbids `supabase.rpc(` outside `lib/db.ts`.

**Recommend all four.**

### D7. The author-applies-migrations rule
Under D1–D2 the committed types describe **main's migrations**, which may be one migration ahead of
live while it waits for the apply. That is the same state the code is in, and OV-7 already says main
is not pushed until the migration is live, so a *pushed* main's types match live.

Add an after-apply proof: `pnpm db:types:live-diff` generates from live with the same CLI and flags
(`--schema public`) and diffs against the committed file. Empty means live is where main thinks it is;
otherwise the diff names what is missing ("`grading_queue` absent" = 0104 not applied). The author runs
it after `supabase db push`, or a local session with the connector does, as part of close-out
question 2. It is the check that would have caught the Bank push and the `get-activity` v8 ordering.

**Recommend.** It turns "what is the database?" into one command for live as well as for main.

### D8. What this does NOT fix
- **Most result shapes.** 79 of the 113 called functions return jsonb; their shapes stay hand-written.
  D6's stamp makes restating them visible, not automatic.
- **Row caps.** A row set typed perfectly is still cut at 1,000; the A5 guard stays. Table reads
  (`.from()`) are still not swept for caps.
- **Meaning.** Same name, same type, different meaning (a column that now counts something else)
  passes everything.
- **Live timing by itself.** Nothing stops an early push; D7 only makes it visible in one command.
- **Deployed Edge Function code.** Still the hash-verify rule.
- **Permissions, policies, error strings.** RLS, grants, and the shared error strings
  (`authContract.json`) are untouched.
- **Mocked unit tests.** They still don't run the database; they just can't send impossible arguments.

## 4. Slice plan

| # | slice | size | needs | ships alone? |
|---|---|---|---|---|
| 1 | **RPC argument test** (node, CI): every called function exists in the latest migrations; argument keys ⊆ parameters; required parameters sent; no call matches two overloads; a dynamic name must be listed with a reason | S | nothing | **yes — the one to ship first** |
| 2 | Shared parser module + generated **function index** (D5a) + move the three existing guards onto it | M | slice 1's parser | yes |
| 3 | `pnpm db:types` (local stack) + the two committed copies + stamp test + `db:types:live-diff` | M | Docker locally | yes, but pays only with 4 |
| 4 | Type the client: `createClient<Database>`, `lib/db.ts` `rpc()`, the four helpers, `as const` constants, the jsonb shape map with "checked against" stamps, the cast ratchet, the no-direct-`rpc` test; shell bytes measured before/after | M–L | 3 | — |
| 5 | Viewer ports and Edge Function `index.ts` typed from `Database` | S–M | 3 | — |

**Slice 1 ships alone and pays for itself:** half a day, no dependency, no stack, runs in CI on every
push, and covers the app, viewer, worker and Edge Functions at once (the Edge Functions' wire is today
checked only by the local integration lane). Today it would pass, so it is a ratchet: the first
renamed parameter or dropped function goes red in CI instead of in a classroom. Slice 2 is the next
best value on its own, because it answers C1's title directly ("where is this function's live body?")
for every future restatement.

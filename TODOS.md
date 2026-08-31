# TODOS

Deferred work items with enough context to pick up cold. Durable backlog lives in
ROADMAP.md; this file is for concrete, near-term follow-ups surfaced during reviews.

## THE AUTHOR'S CAPABILITY WISHLIST — ranked by blocked-activity count (2026-08-24)

Source: the catalogue builder's direct answer to "what do you need to be
satisfied?", relayed by the author 2026-08-24. This is the first structured
output of the authoring-before-code ruling — the counts are the builder's own
(73 planned activities against its skill registry), the platform-side facts
below were verified against this repo the same day. Fallbacks per item are what
the builder ships in the meantime; an item being here does NOT cap authoring —
it caps specific activities at draft (the builder's D6 rule) or defers specific
data (D8/D10).

**Greenlit order (author, 2026-08-24): #1 + #4 as the next code slice, #2
alongside as a cheap win, then #5 → #3 → #6.** Each still gets its own design
pass with numbered decisions before code.

⚠ **STATUS 2026-09-01 (later): #1–#4 are ALL SHIPPED; the ranked remainder is
#5 → #6.** Both #5 and #6 still need their own design pass (and #5's mistake
signal rides #1's shipped machinery, so its main dependency is met).

1. ✅ **Misconception ids on distractors, in the markdown — SHIPPED
   2026-08-25.** Ids ride import → schema → sanitize → the server grader
   (`packages/viewer/src/server/grading/{blanks,choices,graphs,walk}.ts`) →
   the stored graded-response rows; the format doc teaches the third `::`
   segment at §"Misconception bindings"; `get-activity` + `check-activity` are
   deployed and code-verified, so the sensor is live end to end. The catalogue
   carries 13 bindings across 4 ids. **The minimum-honest-wiring bar below was
   MET, including the mutation-tested server-side check** — the entry is kept
   for its reasoning, not as open work. ⚠ *Stale until 2026-08-31: this still
   read "blocks all 73 / verified truly absent / the sensor data does not
   exist" six days after it shipped, which is the highest-ranked item in the
   file describing itself as blocking.* The original text follows.

   ~~(Blocks all 73 — or rather, blocks the DATA LAYER on all of them.)~~
   **Verified truly absent, not editor-only** (2026-08-24): "misconception" appears nowhere in the format
   doc, the importer, the schema, or any package — the feedback TEXT channels
   exist (`!wrong :: message`, mc `:: feedback`, graph `mistake:`) but no id
   field exists at any layer, and the `mis.*` registry lives only in the
   builder's project. Proposed syntax: a third `::` segment
   (`!0.5 :: divided the wrong way :: mis.roc.uses-endpoint-value`) and/or a
   `misconception:` line in the fences. ⚠ **The orphan trap, by design this
   time:** an id parsed and stored but read by nothing is the ninth instance of
   this repo's most expensive defect class. Minimum honest wiring: the id rides
   the distractor through import → schema → sanitize → **into
   `check-activity`'s stored graded-response rows**, guarded by a
   mutation-tested check that a checked wrong answer carries its id
   server-side. Aggregation/analytics on top is a later arc — stored ids are
   aggregable; unstored ones are gone. Cost: format doc + importer + schema +
   both server bundles + `SANITIZER_REV` bump + migration-before-deploy +
   `check-activity` redeploy. **Intersects the graph-feedback-knobs orphan
   ruling** (item 3 of "S9 left FIVE MORE ORPHAN CLASSES", below) —
   graph `mistake:` is one of the binding sites, so rule them together.
   Fallback until shipped: feedback text only; the sensor data does not exist.

2. ✅ **`graded_polynomial` — SHIPPED 2026-08-31** as two named families,
   `cubic` + `quartic` (degree-3-or-degree-n was ruled degree-NAMED on the
   family-string plumbing; degree 5+ deliberately out — decisions and the
   interpolation-shadow bug are recorded in
   [graded-function-families.md](docs/design/graded-function-families.md) §top).
   Rides the shared parser, so the editor answer field AND the markdown
   importer both accept `y = x^3 - 3x` with no per-surface work. Both server
   bundles regenerated in the same commit; `get-activity` + `check-activity`
   redeploys pending (STATE → Pending author actions). Unblocks the ~11
   derivative-chain activities.

3. ✅ **Unit-bearing numeric blanks — SHIPPED 2026-09-01** (greenlit →
   outside-voice reviewed, 11 findings → amended → built same day).
   `{{=1.5 unit: km/h, kph}}`: the unit lives in the blank's attrs (the
   standing `BlankResponse.answer` rule satisfied with NO wire bump — the
   typed "1.5 km/h" was already a string on the wire), single-input
   diagnostic, normalized-string unit match with authored alternates, and
   reserved `!unit-missing`/`!unit-wrong` outcome matches riding #1's
   misconception machinery. Design + amendments + AS BUILT:
   [unit-bearing-blanks.md](docs/design/unit-bearing-blanks.md). Eleven
   mutations, every guard red once; `SANITIZER_REV` moved; both bundles
   same-commit; redeploys pending (STATE). Unblocks the ~10 contextual DoLs.

4. ✅ **`nway_correspondence` — SHIPPED 2026-09-01** as the `correspondence`
   block (greenlit → outside-voice reviewed, 8 findings → amended R1–R8 →
   built). Anchor items + 2–3 shuffled card columns, one native select per
   (item, column) cell, per-cell scoring (earned/total stored via the raw
   cells map; verdict boolean like matching), the ```correspond fence with
   math-safe `|` splitting, per-column marker sequences (A/i/α), and
   `CHECK_WIRE_VERSION` 2→3. Design + amendments + AS BUILT:
   [nway-correspondence.md](docs/design/nway-correspondence.md). Nine
   mutations all red once; both bundles same-commit; redeploys pending
   (STATE — the wire bump makes deploy-before-push BINDING). Unblocks the ~5
   same-function-across-representations activities.

5. **`draggable_curve` — drag-then-type disagreement diagnostic.** (Blocks
   ~11: the transformation band.) The most expensive item: a new graph-kit
   interaction mode plus capturing WHERE the student drags independent of what
   they type — that separation is the diagnostic. Depends on the #1/graph-knobs
   ruling for where its mistake signal lands. Fallback: "which graph shows…"
   mc with choice-graphs (possible since 2026-08-22), which cannot separate
   the two signals.

6. **`seeded_data` — parameterised datasets.** (Blocks fewest here but is the
   print-integrity/A-B-versions/statistics-sampling lever.) The deepest cut:
   breaks the every-dataset-is-a-literal assumption across import, publish
   snapshotting, and grading — the server must grade against THIS student's
   seed. Own arc, ranked last deliberately.

**Print tier (wanted, does not block authoring):** page-break/keep-together
control (mostly print CSS + a small format knob — cheap); a problem-group
wrapper for NCEA a/b/c structures mixing auto + rubric parts under one stem
(container-model change — not cheap); true ruled writing lines (`work:` gives
blank room, `columns: ruled` gives boxes, nothing gives lines); per-term
definition control on print (all-or-nothing glossary today).

**Depends on:** ~~the graph-feedback-knobs author ruling~~ **RULED 2026-08-24**
— WIRE `mistakeFeedback`/`builtinFeedback` inside the #1 arc, DELETE
`partialCredit` (DECISIONS.md → "The last orphan classes"). Nothing blocks —
design passes proceed in greenlit order.

## CURRICULUM-ARCHITECTURE ALIGNMENT — four gaps found 2026-08-25

**Source:** the author's `curriculum-architecture.md` (lives in the AUTHORING
project, NOT this repo — deliberately not copied here, because a second copy is
exactly the hand-carried sync its own §14.2 names as the system's known weak
point). Decision refs `D1–D17` / `§1–§16` are that document's, not this repo's.
Every claim below was checked against code on 2026-08-25, not read off the prose.

### 1. `skills` is an ORPHAN FIELD AT BOTH GRAINS — and it is the spine of the model

The document's §2.2 is *"Everything references skill ids, never activity ids."*
**This codebase cannot record a skill id at all.**

| grain | evidence |
| --- | --- |
| block | `markdownToTiptap.ts` hardcodes `skills: []` at **7 sites** (846, 1643, 1807, 1870, 3157, 3289, 3585). No markdown syntax authors one. |
| block | **Nothing in `packages/viewer/src` reads `skills`** — grep returns empty. Only `serialize.ts` round-trips it. |
| activity | `meta.skills` exists (`schema/src/document.ts:108`) but `ActivityConfigDrawer.tsx:377` says "skills UI is still deferred to Phase 2". |

⚠ **This is NOT the orphan defect class, and calling it that was wrong** (said
here first on 2026-08-25, corrected the same day). The repo has an explicit,
reasoned position: `flow-field-readers.test.mjs`'s scoping note calls `skills`
"legitimately editor-and-catalog-only" — a teacher-facing tagging field like
`tags`, which has no business rendering to students. On its own terms that is
coherent and deliberate.

**The accurate finding is narrower and still real.** `skills` is *reserved*
rather than editor-only: the block grain is hardcoded `[]` with no way to author
one, and the activity grain's UI is deferred to Phase 2. So it is declared at
both grains, authorable at NEITHER, and read by nothing. That is fine for a
tagging field nobody uses yet. It is **not** fine as the spine of a curriculum
model — and that is the gap: §2.2 needs a first-class skill-id channel, which is
a CAPABILITY to build, not a defect to fix.

**The concrete proof it is already costing something:** the document states "47
skills in the graph, **0 covered**". Four activities covering unit rate and
proportionality were published 2026-08-25. Coverage is structurally blind — and
because D3 forbids storing derived state, coverage is COMPUTED, so it will keep
confidently reporting zero rather than failing loudly.

**Do not fix this by adding a field.** Close-out rule 1: ship the consumer, or a
guard bound to RENDERED OUTPUT, and mutation-test the guard by reverting the
wiring. A skill-id channel that stops at the schema is this defect again, larger.

**Depends on:** nothing. Blocks: coverage, burndown, review selection (the
ancestors × staleness × distance × error-rate query the graph exists for).

### 2. ✅ CLOSED 2026-08-26 — `source_path` is no longer identity

Built as Lane A: identity is a declared `key:` (migration 0041), the path became
organization + teaching order, and the chain is the folder with its title in
`chain-registry.txt`. Full rulings: [curriculum-alignment.md](docs/design/curriculum-alignment.md).
The analysis below stands as the reasoning; the proposal in it was superseded on
two points — the band left the path as proposed, but the ordinal STAYED (it is
safe once identity is declared) and the chain ordinal moved into the folder name
rather than the unit title, because `unit` turned out to be student-visible in
both the on-screen header and the printed worksheet.

<details><summary>The original analysis (2026-08-25)</summary>

#### `source_path` encodes the two things the model calls DISPOSABLE and omits the one it calls PERMANENT

⚠ **NEXT ITEM — decide this while it is four files.** Path IS identity
(batch-importer D1). Current shape:

    year-8/rates-and-proportional-relationships/activity-01-unit-rate.md
    └─ band          └─ "unit"                   └─ ordinal

| segment | the model says | the problem |
| --- | --- | --- |
| `year-8` | bands are **dual and deliberately unsynced** (`band_nz`/`band_us`, D14) | privileges NZ; a skill landing at a different US grade has nowhere to go |
| `rates-and-…` | "unit" is **not one of the five entities** (skill/chain/activity/misconception/capability) | an invented level with no home in the model |
| `activity-01` | activities are **disposable** — split, rewritten, forked (D1) | splitting activity-02 forces renumbering → new `source_path` → **orphan + new row + lost published history** |

The **chain** — permanent, and the owner of both ordering and the `hooks: []`
pool — appears nowhere in the path.

**Proposed:** `chain.rate.proportional/<stable-slug>.md`, with order carried by
chain metadata rather than filename digits.

**Cost curve, which is the whole argument:** 4 renames today on activities with
`section_checks` = 0 and `submissions` = 0, versus the same operation at 150
files on rows carrying real attempt history. ⚠ **Not free even now** — a rename
orphans the row (D1/D2), so the four activities need re-publishing after.

**Interacts with #1:** if skill ids become first-class, the path scheme matters
*less*, because the chain relationship stops depending on the filesystem. Decide
#1's direction before committing to a path, but do not let that defer #2 past
the point where it is cheap.

</details>

### 3. ✅ SPLIT WRITTEN DOWN 2026-08-26 — and rule 9 moved to the builder

The ownership table is in [curriculum-alignment.md](docs/design/curriculum-alignment.md) §4.
Two rules became platform-checked (`skill:` exactly one; skill id in registry).
**Rule 9 — nothing a review item retrieves appears on the reference panel — is
now the BUILDER's**, at its own request: a rule owned by a party that has
deferred it is a rule nobody runs, and with item-level skill data in the file it
is a lookup rather than semantic overlap detection. The analysis below stands.

<details><summary>The original analysis (2026-08-25)</summary>

#### §11's validator is TWO validators, and the split is not written down

Of the document's 13 checkable rules, this repo can own about four: the `mis.*`
registry check, the id-shape warning, `--strict`, and partially
distractor-on-a-non-auto-scored-type. The rest — faded beat (hard error), DoL
shape, hook count ≥ `ceil(activities/2)`, the approval gate, review reach,
`planting_for` — need **chain, skill, DoL and status concepts the platform
schema does not have**. Verified 2026-08-25: no chain, no DoL, no locale, no
hook concept exists (the greps that hit were React hooks and print locale).

§11 currently reads as one set. It is two, across two systems, and rules fall
down the gap between them unless the ownership is explicit.

**One rule IS cheap here and is unbuilt on both sides:** *"nothing a review item
retrieves appears on the activity's `reference` panel"* (§15 amendment, marked
*to build*). The importer already sees the `reference` fence and the review
items in a single pass, so this is a same-document check — the only §11 rule
this repo is well placed to enforce.

</details>

### 4. ✅ CORRECTED BY THE BUILDER 2026-08-26 — the §8 grading claim

Filed, accepted, and amended on the builder's side as a note on its D8 rather
than a reopening: only the *where it computes* clause was wrong, and the half the
decision rests on (only teacher-entered grades are server-**authoritative**)
survives. The analysis below stands.

<details><summary>The original analysis (2026-08-25)</summary>

#### The document's §8 grading claim is FALSE about this platform

> "Auto-scores are **client-computed** and advisory."

Auto-scoring is **server-computed**. `gradeSection` lives in
`packages/viewer/src/server/grading/`, reaches production only via
`_shared/grading-server.bundle.js`, and is called by `check-activity`. Grepped
2026-08-25 for a client caller: **there is none.**

This is filed as a defect rather than a typo because the document is explicitly
"reference for the codebase". A session told to make the code line up with that
sentence would move grading client-side and reopen the answer-leak surface the
entire sanitize/strip design exists to close (`MATH_PROMPT_SECRET_FIELDS`,
`BLANK_SECRET_FIELDS`, `choices[].misconceptionId`).

**The second half is true and worth keeping** — *only teacher-entered grades are
server-authoritative* is a correct statement about GRADEBOOK authority. The
sentence needs splitting: auto-scores are server-computed, but they are not the
official grade. **Owner: the author, in the authoring project's doc.**

</details>

### 5. ✅ CORRECTED IN PROSE 2026-08-26 — "Review" names two different things

<details><summary>The original analysis (2026-08-25)</summary>

#### "Review" names two different things

The document: a **component inside every activity** (review → lesson → DoL).
This repo: an activity-level `role` enum, `lesson | review | practice`
(`markdownToTiptap.ts`, `asPedagogicalRole`). The four Year 8 files declare
`role: lesson` while each CONTAINS a review section — both correct under their
own vocabulary. Anyone mapping the model onto `role` will conflate them. Cheap
to fix in prose; expensive if it reaches code as an assumption.

</details>

### ✅ RATIFIED 2026-08-26 — the misconception prefix subdivision

The builder moved it from "proposed, awaiting ratification" to ratified on this
evidence.

<details><summary>The original evidence (2026-08-25)</summary>

#### Evidence FOR one of the document's open questions

§15 leaves the misconception prefix subdivision "unratified". The 13 live
bindings split `mis.rate.*` (computation) from `mis.proportional.*` (conceptual),
and distinct prefixes measurably help the manifest's near-duplicate detector
(Levenshtein ≤ 2 over the whole id) avoid false pairs. Working in practice —
that is a datapoint for keeping it, not a decision.

</details>

## Coverage overclaims for a half-built multi-part skill — NARROWED (2026-08-26)

⚠ **CORRECTION, same day: the first version of this entry conflated two
different things and over-scoped itself.** Two activities can share a primary
skill for two unrelated reasons, and only ONE of them can overclaim:

- **Multi-part** — the skill is too big for one 20–25 minute activity, so it is
  split. Part 1 alone leaves the skill half-taught, and coverage saying
  "covered" IS an overclaim.
- **Consolidation** — the chain's closing activity. It teaches no new skill; it
  interleaves the chain's skills so the student has to decide *which* applies,
  and it carries the chain's exit check. Its primary skill is the chain's
  TERMINAL skill, which an earlier activity already taught in full. **Coverage
  is correct here and always was** — the skill was covered before this activity
  existed.

So the defect is real but half the size, and the fix is unchanged: `parts:`
declared on the FIRST part, defaulting to 1. That default makes consolidation a
no-op automatically — nothing to declare, nothing to detect, no category field
needed for coverage's sake.

### The original entry

**What:** `summarizeCoverage` counts a skill as covered when any activity names
it as `skill:`. Skills deliberately span 2+ activities (the activity is the
20–25 minute scheduling unit; the skill is the curriculum unit), so a skill
reads as **covered** the moment part 1 exists, while it is not yet taught.

**Why it matters more than it looks:** the curriculum builder is deleting its
own coverage count and consuming ours as the artifact of record. A count that
overclaims is worse than two counts that disagree, because nothing is left to
disagree with it.

**Not yet a defect in the artifact** — the manifest lists every activity per
skill, so a one-part skill is visibly one file. It is the headline count that
overclaims.

**Blocked on a builder ruling** (asked 2026-08-26): declare a part count in the
meta fence (`parts: 2`), which is legal under their D3 — a part count is a fact
about INTENT, the same exception that keeps per-chain projections declared, and
it is not derivable because only the author knows whether part 2 is coming. If
they take it, the manifest gains "covered (1/2)" and the JSON gains the pair.
⚠ It cannot live in the `x_` namespace: we contractually do not read those.

**Do NOT infer completeness from the chain's activity projection** — that makes
a per-skill fact depend on a per-chain estimate.

**Candidate check, deliberately unbuilt:** warn when two activities share a
primary skill but are not adjacent in path order (a part 2 three activities from
its part 1 is misfiled, or is not a part). Offered to the builder; not invented
unilaterally for a shape they have only just described.

## The drift audit has no section for GENERATED AUTHOR-REFRESHED artifacts (2026-08-30)

**Found by the audit auditing itself (§0).** Four committed artifacts are
generated, author-refreshed, and deliberately never CI-gated:

- `docs/misconception-manifest.md`
- `docs/skill-coverage-manifest.md` · `docs/skill-coverage.json`
- `docs/catalogue-authoring-prompt.md`

**No checklist section covers any of them**, and §0's own lesson has a mirror
worth writing down: a section whose target was deleted reports "clean" forever —
and **an artifact with no section is never audited at all.**

The exposure is real and structural, not hypothetical. The catalogue lives
OUTSIDE this repo, so CI cannot regenerate these and no drift check against them
could ever pass — that is ruled and correct. The consequence is that they can go
stale against a catalogue that has moved, and nothing anywhere would say so.

**Proposed §10, cheap:** for each generated artifact, confirm it was regenerated
after the last catalogue change — compare the newest `.md` mtime in the
catalogue folder against the artifact's, exactly the staleness guard the
curriculum side built on their own side for the same reason.

⚠ **`catalogue-authoring-prompt.md` is the exception and does NOT need it** — it
is generated from code in THIS repo and is already guarded by
`catalogueAuthoringPrompt.test.ts`, which fails the build on drift. Naming it
here so a future session does not add a redundant check for it.

**Structural, so it was not applied unilaterally.** It changes the audit
checklist, and that file's own history says a checklist edited carelessly is
worse than one left alone.

## `pnpm verify` goes RED under machine contention — three timing-sensitive files (2026-08-31)

**Do not chase these as real failures.** Running vitest concurrently with
`pnpm verify` (or two verifies at once) makes three files fail nondeterministically:

```
src/__tests__/supabaseStorageKey.test.ts     (fails at file level, not a case)
src/__tests__/ActivityPrint.test.tsx         "writes ONLY meta.print…" (D20A)
src/__tests__/StudentViewer.test.tsx         "a normal load shows no banner at all"
```

**The evidence it is contention, not a defect:**
- all three pass in isolation, exit 0;
- the whole suite passes on a quiet machine — 366 · 407 · 1419 · 1419, exit 0;
- **the failing run's `build` gate took 1461s against a normal ~18s**, which is
  the tell — the machine was saturated, not the code broken;
- the same two files did this earlier the same day, also with a background
  vitest running, and also passed in isolation.

**The trap is that they look like real regressions and are timing-shaped**, so a
session that "fixes" one will be fixing nothing and may weaken a real assertion.
Check the load and the build-gate duration before believing a red here.

**Worth a real fix eventually** — these three are the only files that behave this
way, so something in them is wall-clock dependent rather than fake-timer driven.
Finding and pinning that is a small slice; guessing at it under load is not.

**Reproduction attempted 2026-09-01, and the threshold is HIGHER than assumed:**
all three files stayed green under 16 CPU burners PLUS a concurrent full app
vitest run (StudentViewer 3× slower at 16.3s, still passing). The original red's
build gate ran ~80× slow (1461s vs 18s) — swap-level thrash, not mere CPU
contention, and not something worth inflicting on a work machine to reproduce.
Candidate wall-clock surfaces identified for whoever catches it live:
(1) both component files ride testing-library's 1s default async window
(`findAllByRole`/`waitFor` real-timer polls — StudentViewer's full-fixture
render is the suite's slowest, first to cross any threshold);
(2) `supabaseStorageKey`'s FILE-level failure shape fits an unhandled rejection
from supabase-js post-test async (GoTrue background work resolving after jsdom
teardown under extreme delay) — the two in-file assertions have no timing in
them at all. **Neither was confirmed** — if one of these reds is ever caught
live, read the actual error text before touching either file; a mitigation
shipped without that (e.g. raising `asyncUtilTimeout`) would be a guard nobody
watched fail.

⚠ And the operational half: **do not background a vitest run and then start
`pnpm verify`.** That is what produced both reds, and it is easy to do when
chasing a failure.

## ✅ Lane B — activities list sorts by catalogue path — SHIPPED 2026-08-31

**Built app-only**: no migration (0038 already carried `source_path`), no
bundle, no deploy. `comparePaths` + `sortForOutline` + `groupByUnit`'s
`orderFrom` in `packages/app/src/lib/activityGrouping.ts`; four wiring changes
in `routes/Activities.tsx`. The design record is
[activities-list-surface.md](docs/design/activities-list-surface.md) D5 (now
superseded for file-backed units) and D6 (reaffirmed, mechanism made explicit),
plus [curriculum-alignment.md](docs/design/curriculum-alignment.md) R7's AS
BUILT note.

**What this entry is kept for — the process fact, which is the durable half.**
The plan sat here for five days having PASSED an eng review. An outside voice
then found **five defects in it, every one verified against running code**, and
**two changed what got built**: group order derived from row data supersedes D6
as well as D5 (ruled a fork; D6 kept, via `orderFrom`), and the plan's
comparator was neither a total order nor a path sort. A third defect — the
group header reading `rows[0]` — meant the sort could silently relabel a
mixed-course group.

**Two of the review's own claims did not survive checking**, which is the
symmetric half of the same lesson:
- Its D7 coupling was overstated. `search`/`activeTags`/`draftsOnly` are plain
  component state with no URL param or storage, so a return from the editor
  always renders the UNFILTERED outline and D7's scroll restoration never sees
  a filtered group order. D6 stands on its own.
- Its prescribed fix for the equal-compare pairs ("default sensitivity plus a
  raw-string tie-break") credited the wrong half. Default sensitivity does not
  separate `01-x.md` from `1-x.md` — numeric collation reads both segments as
  the number 1. The tie-break is load-bearing; sensitivity buys consistent case
  ordering, which is a different property and needed its own test.

**Seven guards, all mutation-tested the day they were written — and one was
VACUOUS on the first attempt.** The case-distinctness assertion stayed green
when sensitivity was reverted to `'base'`, because the raw-string tie-break
already separated `A.md` from `a.md`. Replaced with `comparePaths('a/B.md',
'A/b.md')`, which is where sensitivity is actually observable. **That is the
second guard in two weeks to be vacuous in the documented way and only mutation
caught it.**

⚠ **The tests carry density the database does not.** This was built against 4
file-backed rows out of 51 planned parts: multi-chain units, mixed
path/no-path groups, the filtered-view group-order assertion and both
equal-compare pairs exist in fixtures and nowhere else yet. **When the corpus
reaches full size, the thing to check is whether those fixtures described it** —
the repo's standing expectation is that the corpus finds what the fixtures
cannot.

## graph-kit's legacy runtime should be deleted WHOLE, not gutted (2026-08-25)

`packages/graph-kit/src/runtime.ts` is the published-page data-attribute
runtime. **Re-verified unreachable 2026-08-25**: `attachGraphRuntime` and
`renderGraphChrome` have no callers outside graph-kit, and `runtime.ts` is not
in the package's `exports` map (only `runtime-contract` is, and only for
types). The viewer mounts widgets through `kitSurfaces.ts` instead.

The misconception arc deleted the widget's `annotateMistake`, which removed the
only in-repo WRITERS of `GraphBlockState.mistakeIndex` / `.mistakeText`. Their
READERS survive in `runtime.ts`'s feedback-render branch (authored-template
cloning + generic fallback, 4 tests in `runtime.test.ts`), plus
`chrome.mistakeTemplates` and `chrome.mistakes`/`builtinFeedback` which are now
parsed from data attributes and forwarded nowhere.

**Deliberately NOT gutted further.** That branch is coherent, well-tested code;
removing just its inputs would leave a more confusing module, not a cleaner
one, and the tests being deleted are good ones. The honest move is deleting the
legacy runtime AS A UNIT — `runtime.ts`, its contract's page-only fields, and
its tests — the same way `packages/renderer` went at S9 Drop 4. Until then, the
no-writer fields are dead fields in a dead module, which is consistent, rather
than a live declaration with no implementation.

**Depends on:** nothing. Do it whenever the legacy-runtime teardown is worth a
slice; check the `exports` map and `kitSurfaces.ts` again first, since that is
what makes the deletion safe.

## Editor cannot SHOW misconception bindings (DX review deferral, 2026-08-25)

The misconception-sensors arc round-trips `misconceptionId`s through the editor
(serialize both directions) but no editor view renders them — a teacher editing
in-app cannot see that a distractor is bound. Ruled ACCEPTABLE while the
".md is the source" rule holds (file-backed activities are edited in markdown,
where bindings are visible text). **Becomes real work when the fall
co-ownership arc gives colleagues in-app authoring** — then: read-only binding
badges in the blank popover, `MultipleChoiceView`, and `GraphSettings` mistake
rows, before any colleague authors over an imported activity blind.
**Depends on:** the co-ownership arc.

## ✅ The phantom `course`/`unit` change on every published activity — FIXED 2026-08-31

**Mechanism, verified live at the time and unchanged:** `publish_activity` sets
`draft_content = null`, the change preview computed `priorCourse` from
`existingRow.draftMeta`, and with the draft cleared it fell through to
`pipeline.DEFAULT_COURSE` and diffed the file against a default. So every
published activity reported a `course`/`unit` change on every run, forever.

**The fix:** the publish-truth COLUMNS are the second source —
`prior.course ?? existingRow.course ?? DEFAULT_COURSE` — with `course,unit`
added to the importer's select. The columns are still never WRITTEN by this
script (0037 R1); they are read only as the fallback for a draft that
publishing legitimately emptied. `DEFAULT_COURSE` survives for a genuinely new
row, the only case with neither source.

⚠ **It was NOT only cosmetic, and that only became clear while fixing it.** For
a file whose fence omits `course:`, the merge wrote `DEFAULT_COURSE`
("Algebra II") into the rebuilt draft, and the next publish would stamp that
into the column — a published Year 8 activity re-imported without a course line
came back as Algebra II. It stayed invisible because all four pilot files carry
an explicit `course:`. **The cosmetic report was the visible edge of a data
bug**, which is the argument for chasing preview noise rather than tolerating it.

**Guarded by three tests in `batch-import.test.mjs` §B**, all mutation-tested:
a published row whose file matches reports an EMPTY change list (the assertion
that would have caught it), a published row whose fence omits `course:` keeps
the column, and — the mirror image, pinned so the fix cannot be "simplified"
into always preferring the column — an UNPUBLISHED row still reads its draft.

## `{{…}}` inside `$…$` — ✅ DETECTOR SHIPPED 2026-08-26; the REPAIR is still open

⚠ **Read this header before the entry below it, which was written before the
detector existed.** The silent half is fixed: `mathAttrs` (the one function
every math surface funnels through) now warns when a constructed math node's
latex contains a blank, `--strict` fails on it, and the check lives in the
SHARED parser so a teacher pasting markdown is covered too. Mutation-tested.

**What is still open is the REPAIR** — making a blank work inside maths, which
is the capability gap: `\gap{}` grades correctly inside an equation but cannot
carry a misconception binding, so a sensor inside an equation still has no
spelling. That is a design question, not a bug fix, and the builder has filed it
as a capability wish on its side.

**Implementation note worth keeping:** the check tests the constructed node, NOT
a scan between `$` delimiters. The catalogue is full of `\$6.00`, so a
delimiter scan re-derives every escaping rule the tokenizer already applied and
false-positives on prose about money. Known false positive of the shipped shape,
stated rather than claimed away: valid TeX that doubles its braces (`x^{{2}}`).

---

### The original entry (2026-08-25)

**Found by the first real catalogue content, exactly as the authoring-first
ruling predicted.** `activity-04-proportional-consolidation.md` authored
`$k = {{=8 | !0.125 :: … :: mis.rate.ratio-inverted}}$`. A `{{…}}` inside inline
math is not extracted as a blank: the whole brace expression is absorbed into
the `mathInline` node's `latex`, with **zero warnings**.

```
{"type":"mathInline","attrs":{"latex":"k = {{=8 | !0.125 :: wrong way :: mis.rate.ratio-inverted}}"}}
```

**Three failures at once, in descending order of how bad they are:**

1. **The answer is displayed to the student.** `8` — the thing being asked for —
   renders inside the equation, along with the feedback prose and the
   misconception id. This is an answer LEAK through the importer, and the
   `\gap{}` path two lines away exists precisely because the stored equation
   must empty the gap so the answer never leaks.
2. **The item is not gradeable.** No blank node exists, so nothing is scored and
   the teacher sees no response for an item the student was asked to fill.
3. **The binding vanishes** — the sensor silently records "students didn't make
   this mistake."

**Why nothing caught it.** No importer warning; `--strict` exits 0; the
binding-manifest compile-check only inspects bindings that REACHED the
document, so a swallowed one is invisible to it. It was caught by hand, by
diffing the manifest's per-id counts against a grep of the source files — the
manifest credited `mis.rate.ratio-inverted` to two files when three carried it.

**The fix for authors (already applied to the corpus):** close the math before
the blank (`$k =$ {{=8 | …}}`, the form `activity-02` already used and the form
that works), or use `\gap{answer}` inside the math. ⚠ **`\gap{}` cannot carry a
binding** — `|`-alternates are not parsed inside math (format doc line 70), so a
mistake sensor inside an equation has no spelling today. That is a real gap, not
just a syntax preference.

**The fix for the platform (proposed, not built):** warn at import when a
`mathInline`/`math_block` `latex` contains `{{`. It is a one-line predicate over
a node the importer already constructs, and it converts a silent answer-leak
into a named warning that `--strict` fails on. Guard it against RENDERED OUTPUT
per the close-out rule, and mutation-test the guard by reverting the corpus fix.

**MEASURED — the swallow is universal across math contexts.** Every one of
these absorbs `{{=8}}` into the latex, emits a blank node for nothing, and warns
about nothing:

| context | swallowed | blank emitted | warnings |
| --- | --- | --- | --- |
| `$…$` inline · `$$…$$` display | yes | no | none |
| `worked` · `callout` · `faded` fences | yes | no | none |
| table cell · `mc` choice | yes | no | none |
| `definitions` fence | not reproduced (different storage path — recheck when fixing) | no | none |

**⚠ A FOURTH INSTANCE PREDATES THIS ARC AND IS IN PUBLISHED VERSIONS, NOT JUST
A DRAFT.** `unit-3/unit-rate.md:49` (authored 2026-08-21) held
`$$\frac{4.50}{3} = {{=1.50}}$$` inside its `faded` fence. Verified live
2026-08-25: **all three `activity_versions` snapshots (v1–v3, last 2026-08-22)
carry it**, and those are what `get-activity` serves at `/a/:id`:

    {"type": "math_block", "latex": "\\frac{4.50}{3} = {{=1.50}}"}

**The sanitizer structurally cannot help here, and that is the point.** It
strips `prompts[].answer` on `PROMPT_CARRIER_TYPES` (`registry.ts` →
`MATH_PROMPT_SECRET_FIELDS`). A swallowed blank produces **no `prompts` array at
all** — the answer sits in `latex`, which is content, not a secret field. So
every layer downstream of the importer is working correctly and the answer still
reaches the student. Compare the repaired row, where `\gap{}` puts the answer
where the sanitizer can reach it:

    "latex": "\\frac{4.50}{3} = \\placeholder[g72277e2…]{}"
    "prompts": [{"id": "g72277e2…", "answer": "1.50"}]

**Measured blast radius: zero.** `section_checks` = 0 and `submissions` = 0 for
this activity — no student ever engaged with it. The published page is reachable
by link, but nothing was seen.

**The draft is fixed (re-imported 2026-08-25); the PUBLISHED versions are not.**
A re-import updates `draft_content` only. Clearing this needs an author
republish from the app, which snapshots a clean v4. Until then v3 is what the
share link serves.

**Depends on:** nothing — this is a standalone importer warning.

## Misconception id RENAMES have no alias path to stored rows (2026-08-25)

`import:batch`'s registry check catches a taxonomy rename in the FILES on next
import, but `section_checks.verdicts` rows keep the old id string forever —
a rename fragments the longitudinal data. Ruled: **no mechanism until the
first real rename happens AND the rollup exists to consume an alias map**
(building one now is the orphan pattern). The rollup-spec amendment (eng
review X1, this arc's T5) must name aliasing as a design input so the rollup's
misconception dimension doesn't foreclose it. **Depends on:** the check-rollup
amendment arc.

## Does MathLive's post-mount focus grab affect a real student? (2026-08-22)

**What was observed:** on a worksheet carrying a gap-bearing `math_block`,
MathLive takes focus once while its element upgrades — nothing in this repo asks
it to (`mountMathPrompts` sets value/readOnly/prompts and never calls `focus()`).
Confirmed by the a11y lane's own instrumentation in CI run 32500013923: a Tab
walk reached the Check control and, by the time Enter landed, focus had moved to
`math-field`.

**Why it is probably NOT a user-facing bug:** the grab happens during the mount
settle, milliseconds after the block appears. A student's first Tab comes later.
The test only collided with it because it starts a ~76-stop walk the instant the
page is usable.

**Why it is still worth a look:** "probably" is doing work in that paragraph, and
focus theft is a serious a11y defect when it is real. A keyboard user who lands
on a slow connection, or who tabs immediately, could plausibly be inside the
window. The cheap check is to watch `document.activeElement` across a real
worksheet load on a throttled profile and see whether it ever moves without
input.

**⚠ The a11y row that used to sit over this no longer would.** `gap 2 — the full
keyboard path` now presses Enter on the Check LOCATOR (which focuses first), so
it proves reachability and activation but not focus stability. That was the right
call for the row — focus stability across a 76-stop walk is not an a11y property
— but it means nothing in the suite would notice this regressing.

**Depends on:** nothing.

## ~~The static-SVG engine's palette is light-only~~ ✅ VIEWER FIXED 2026-08-24 — the EDITOR half remains

**The blocking question is answered, by measurement.** The entry said "⚠ Verify
`var()` actually resolves in a presentation attribute in the target browsers
before committing to it." It does (Chromium, 2026-08-24):

```
stroke="var(--gk-svg-grid, rgb…)"     var set   → resolves to the variable
stroke="var(--gk-svg-missing, #cbd5e1)" var unset → falls back to #cbd5e1
```

**What shipped.** `graph-svg.ts`'s three palette constants became
`var(--gk-svg-{grid,axis,label}, <today's hex>)`. **The fallback is the exact
paper value, so a consumer that defines nothing renders byte-identically** —
which is what let the viewer opt in without touching print, the editor, or any
future caller. The viewer's `tokens.css` now declares all three as colour
ROLES (so the token guard forces every theme block to have an opinion): light =
the paper values, print = forced back to them, dark = **grid dropped to
`#1e293b`**.

**The defect that fixes:** the grid measured 12:1 on dark against axes at
3.75:1 — a reference grid shouting four times louder than the data drawn on it.
Neither number was a contrast FAILURE; only their ORDER was wrong.

**Guarded relatively, because a threshold could not have caught it.**
`dark-contrast.e2e.ts`'s graph row now asserts `contrast(grid) <
contrast(axis)` plus a `> 1.1` floor so "quieter" cannot become invisible.
Mutation-proven: revert the dark grid to the paper value → the row fails
naming the rule. Print lane re-run: 69 passed, paper unchanged.

**⚠ STILL OPEN — THE EDITOR, and it is bigger than it looks.** `tokens.css` is
imported by **StudentViewer, ActivityPrint and DevViewer only** (measured
2026-08-24). The editor's `GraphFigureView` preview and `MultipleChoiceView`
thumbnails never load the token layer at all, so they keep the paper palette in
dark mode — a teacher authoring in dark sees chrome the student does not get.

**Where to start:** decide whether the editor should import
`@activity/viewer/tokens.css` (simple, but pulls the whole viewer token layer
into the editor bundle — check the shell budget) or declare just the three
`--gk-svg-*` roles in the app's own CSS (cheaper, but forks the vocabulary and
the token guard will not see the copy). **Depends on:** nothing. Not urgent —
both student-facing surfaces are correct.

## The matching interaction the registry already claims — drag / select-then-place (2026-08-22)

Filed by the choice-figures design review (D5/A3) as the honest fix it decided
NOT to ship in that slice.

**Two divergences, one arc.** (1) `registry.ts:280` declares matching's a11y
story as *"Pointer drag with a keyboard select-then-place grammar underneath:
target cards are focusable, Space/Enter lifts, arrows choose a dock, Space/Enter
places, Escape cancels. Every move narrates to a visually-hidden aria-live
region."* `Matching.tsx` implements a plain `<select>` and says so in its own
header. **The registry describes an interaction that does not exist** — the same
declaration-without-implementation class as the orphan fields, one level up.
(2) Once per-choice figures ship, the `<select>` becomes actively bad for the
question type matching exists for: a graph target means read the bank, memorise
"graph B", scroll to the item, open a dropdown, pick "B".

**Worth knowing before starting:** the paper experience is already fine (write
the letter on the line), so this is a SCREEN-only fix — do not let it grow into
a print change. Targets are shuffled client-side with a block-id seed
(`Matching.tsx:56`) and letters derive from rendered position, so any new
interaction must keep both properties or the letters stop matching the bank.

**Depends on:** the choice-figures slice landing first (it makes the case
concrete and adds the fixtures a drag interaction would need to test against).

## Reject a degenerate axis window at the authoring surfaces (eng review 2026-08-23, ruling 6A follow-on)

**What:** A zod `refine` on `AxisConfig` (`xMax > xMin`, `yMax > yMin`) plus an
inline error in the editor's axis NumCells and a warning from the importer's
`axis:` line, so a teacher cannot publish a window the engine refuses to draw.

**Why:** `renderGraphSvg` returns `''` for a degenerate window
(`graph-svg.ts:513`). The graph-figure convergence slice makes the VIEWER show
"Figure unavailable" in that case (ruling 6A) — a net, not a fix. The schema
accepts the bad window, the editor's four NumCells do not cross-validate, and the
importer parses four numbers without ordering them.

**Pros:** one rule in the schema covers every block that carries an axis
(`interactive_graph`, `number_line`, `graph_figure`, choice graphs).
**Cons:** a SCHEMA change — both server bundles regenerate and `get-activity`
is owed a redeploy; and any document already holding a bad window would fail
to parse on the read path, so check the corpus first (`jsonb_path_exists` over
`$.** ? (@.xMin >= @.xMax)`).

**Depends on:** ride the next schema-changing slice; never stand alone.
**Where to start:** `packages/schema/src/graph-primitives.ts` (AxisConfig),
the axis NumCells in `packages/app/src/editor/components/`, and
`parseChoiceGraph` / the `axis:` branch in `markdownToTiptap.ts` (~2470).

## Measure the calculator's default size against a real viewport (2026-08-23)

The successor to a ruling that was wrong. The design review measured "two open
panels occlude 68% of a Chromebook viewport" and concluded only one tool may be
open at a time. **The 68% is the calculator ALONE** (640 − 206 = 434 ≈ its own
418px + margin) — closing a second panel recovers nothing. The lever is SIZE,
not count.

The kit declares 30rem × 26rem for graphing (min 24rem × 20rem). On a 640px
viewport that is roughly two thirds of the screen. Worth knowing: the kit
already carries `@container gkcal (max-width: 23rem)` (`calculator.ts:944`)
which **can never fire** while `min-width: 24rem` stands — compaction machinery
that exists and is unreachable.

**Depends on:** nothing any more — ✅ **UNBLOCKED 2026-08-23**, the calculator
slice landed, so there is a real student surface to measure against. (Guessing
before it existed is what produced the wrong ruling.) Note the sheet work
already handled the <480px case; what is left is the DESKTOP default height on
a short laptop viewport.

## ~~verify-0036's behavioural matrix is a 3.5-hour-a-day flake on live~~ ✅ FIXED 2026-08-24

**Section E now ESTABLISHES its watermark instead of inheriting one** — the
idiom section G in the same file already used. Two lines, inside the
transaction the section already rolls back.

**What it was.** The roll's scope is `[analytics_rolled_boundary(), now()-5min)`.
E called `run_analytics_maintenance()` against whatever boundary the database
happened to carry. Live cron is `30 3 * * *` stamping `now()-5min`, and the
fixtures are dated `date_trunc('day', now()) - 1 day + 10h/20h/22h` — so at UTC
midnight the fixtures jumped a day forward and landed ahead of the boundary
(**passing**), and at 03:30 the cron re-stamped past them (**failing**, `got
0 / 0`) for the next 20.5 hours. Green ~15% of the day.

**Why that was worse than a permanent red:** "N green nights of a non-drifting
reconciliation pair" is a BLOCKING step before `prune_section_checks` may be
armed. A scheduler running inside the pass window would have produced N green
nights that meant nothing. ⚠ **Any green nights recorded before 2026-08-24 are
not evidence — the check could not distinguish a working rollup from a skipped
one outside 00:00–03:30 UTC.**

**Why not re-date the fixtures:** `v_d0/v_d1/v_d2` are chosen so 20:00 UTC is a
Chicago afternoon but an Auckland MORNING of the next date. That day-split IS
section D's subject and the reason the author's US/NZ timezone question has an
answer. Chasing the watermark with the instants would have destroyed it.

**Proven, not argued:**
- The live failure was REPRODUCED ON DEMAND locally by advancing the local
  watermark past the fixtures — the exact message, `expected 1 Chicago day /
  3 checks, got 0 / 0`.
- Mutation 1: remove the rewind under that advanced watermark → fails.
- Mutation 2: rewind to AFTER the fixtures (`v_d2 + 1h`) instead of before →
  fails. So the VALUE is load-bearing, not just the presence of the lines.
- **Proven on LIVE** by running section C with the watermark deliberately set
  to `now()` — the worst case — inside a rolled-back transaction: PASS E,
  PASS F, PASS G, then the designed `EXPECTED ROLLBACK`. A green live run in
  the old pass window would have proved nothing; this does.
- **Residue: none, on both databases.** Live afterwards: 0 checks, 0 rollup
  rows, 0 fabricated ledger rows, and the watermark byte-identical at
  `2026-08-23 03:25:00.100469+00`. The local simulation row was identified by
  `notes is null` and removed.

**Full suites after the fix: local 168/0, live 168/0.**

Also amended: the `v_d0/v_d1/v_d2` comment claimed the instants were "valid at
ANY runtime, year-round". That is true of the DAY KEYS and was never true of
their relationship to the watermark — two different properties, one comment,
read as promising both.

## The a11y GAP-2 row — ✅ CAPTURE IS NOW AUTOMATIC (2026-08-24); still needs one sighting

**The blocker was never the bug — it was that nobody was watching.** The row
has flaked twice (run 31852826598, and locally 2026-08-22) and both times went
green again before anyone read the instrumentation, so it stayed unfixable for
weeks. `expect(reachedInput).toBe(true)` tells you `false` and nothing else.

**Fixed 2026-08-24:** the Tab walk now RECORDS where focus actually landed at
every step and puts the tail of that trail into the assertion message, so a
failure diagnoses itself — in CI, with nobody watching. Playwright keeps the
message in the report and the trace.

Verified by forcing a failure rather than waiting for one:

```
Error: Check must be reachable by Tab alone. Focus trail (last 12 stops):
  div#gk-answer-5 «interactive_graph»
  button «interactive_graph»
  ...
  div.viewer-graph__canvas «interactive_graph»
(25 stops walked, budget 117)
```

**Still open:** one real sighting. The next flake is now self-documenting —
**read the failure message, do not re-run first.** A re-run is what destroyed
the evidence both previous times.

**Noticed in passing:** the trail is dominated by `interactive_graph` stops,
which is direct evidence for the separate "Canvas blocks add ~17 keyboard
stops" entry below — that entry can now be measured from any failing run of
this one rather than by hand.

## P8 boomerang — the multi-station duration datapoints (moved out of STATE 2026-08-24)

**P8 boomerang — still uncollected, deliberately.** The duration datapoints for a multi-station apply day were voided by construction for the 0027 run (two password resets, a pooler lockout, no Docker, an unplanned migration mid-station, a materially faster author across the run). **The slot stays open for the NEXT representative multi-station day.**

**Why it moved here:** a deliberately-open measurement slot is open work, not
current status. P8 ("review-time promises go on a tracked checklist with an
owner slice, never only in prose") is the policy that says so about itself.

## `answerFeedback: 'immediate'` — deferred out of the flow-modes slice (2026-08-24)

Filed by [activity-flow-modes.md](docs/design/activity-flow-modes.md) R3/T2.
The author ruled it in (Q1: "auto-check when the group is complete"); the eng
review's outside voice showed it cannot be built inside that slice, and the
author accepted the deferral. **The field stays in the schema; `on_check` is
the only live value**; the editor greys the option, the importer warns, and
`docs/markdown-import-format.md` says "reserved — not yet active".

**Three things it needs that do not exist**, and they are the design work, not
the implementation:

1. **A COMMIT SEAM.** All eleven input components write to the store per
   keystroke (`store.ts` setters); there is no blur/commit concept to hang
   "the completing item committed" on. Building one is a cross-cutting edit of
   every block. Ruling 4A already settled the semantics — fire on COMMIT,
   never on input — so the seam is what is missing, not the rule.
2. **A CLIENT-SIDE "answered".** Only the server scorers know what answered
   means and they disagree by kind (`grading/graphs.ts` wants "placed them
   *all*", and the client cannot know "all" because the sanitizer strips the
   expected count). An ordering left in served order never "has a value".
3. **A BOUNDED RE-FIRE RULE.** After one auto-check, does the next edit
   re-fire? Once = no feedback on corrections. Every commit = the row-per-edit
   cost the deferral exists to avoid. Nobody has designed the middle.

**Already settled for it, do not re-derive:** `immediate` + `locked` is REFUSED
at authoring (T1) — the server sees one check request either way and cannot
tell an auto-check from a deliberate press, so it could not treat them
differently even if we wanted it to. The importer refuses the combination
today and the editor cannot produce it.

**The expiry mechanism exists**: `scripts/tests/flow-field-readers.test.mjs`
asserts `answerFeedback` has NO reader under `packages/viewer/src`. The day
this slice starts, that guard goes red and names the three surfaces whose
"reserved" copy has to come down with it. **Do not delete the assertion to make
it pass — move the field into `MUST_BE_READ`.**

**Depends on:** the commit seam, which is its own cross-cutting slice.

## A teacher unlock for `locked` activities (2026-08-24, flow modes T3)

There is **no unlock in v1** — not for the student, not for the teacher. A
republish mints a new version and every student starts clean on it; that is
the only unlock there is, and it resets the whole class. The eng review named
this a P1-class gap and the author accepted shipping without it, on the
grounds that `locked` is wanted "sparingly". The copy is honest about it: the
button reads "Check and lock" and confirms with "You won't be able to change
your answers after this."

**The realistic first request is a single student**, not a class: someone
checked the wrong section, or a Chromebook froze mid-answer. Republishing to
fix one student is the wrong tool by two orders of magnitude.

**What it would take:** a teacher-side RPC that deletes (or supersedes) one
student's `section_checks` rows for one (version, section), which is the FIRST
teacher-facing write that destroys student work — so it belongs with the
check-prune's arming discipline, not beside it. ⚠ Read
`prune_section_checks`'s entry before designing this; it is the only other
thing in this repo that deletes student work, and its whole story is about how
a "disarmed" mechanism stops being disarmed.

**Owner slice:** teacher grading (the `section_checks`-bound entry near the
bottom of this file). **Depends on:** a ruling on whether an unlock deletes
the attempt or records a new one — the analytics rollup reads these rows, and
"deleted" and "superseded" are different facts to it.

## S9 left FIVE MORE ORPHAN CLASSES — **ALL FIVE FIXED** (drift audit §9)

⚠ *Header corrected 2026-08-25: it read "FOUR FIXED, ONE OPEN" after item 5 was
fixed 2026-08-24 — the item was ticked and the tally was not. What IS still open
is the "Minor, same class" list at the foot of this entry, which nothing has ever
closed. A tally maintained separately from the items it counts will drift; the
ticks are the truth.*

The 2026-08-22 full audit swept **every** field in `packages/schema/src` (~180)
against the viewer's rendering set and the grading server. Everything below has
an editor control, an importer key, or a present-tense schema comment — and NO
student-facing consumer. **One cause for all five: the implementation lived in
`packages/renderer` / the published-page runtime and died at S9 Drop 4
(2026-08-14), while the declarations, the editor knobs and the design docs'
"✅ live" statuses survived.** The S9 claims-grep (P5) walked the renderer's
guards; it never walked the schema's comments or the editor's controls.

**Each needs a ruling — wire it (with a guard bound to rendered output) or
delete it end to end (schema + editor control + importer key + doc).** Ranked by
what reaches paper/screen as CONTENT LOSS first:

1. ~~**Choice and item figures never render**~~ — ✅ **FIXED 2026-08-22** (`b8c5fac` + `900fe51`): [choice-figures-and-nested-lists.md](docs/design/choice-figures-and-nested-lists.md) — `MultipleChoiceOption.image`/`.graph`,
   `MatchingItem.image`/`.graph`, `MatchingTarget.image`/`.graph`
   (`multiple-choice.ts:63-64`, `matching.ts:42-51`). The editor authors them
   (`MultipleChoiceView.tsx`), the importer accepts `graph: <spec>` and a
   per-choice `![alt](url)` (`markdownToTiptap.ts` ~1542), and
   `MultipleChoice.tsx`/`Matching.tsx` render only `.content`. A "which graph
   shows…" question publishes with blank choices, on screen AND on paper. No
   viewer fixture carries one, so no test could notice. **Print-affecting.**
2. ~~**Nested lists drop their children**~~ — ✅ **FIXED 2026-08-22**, same doc — `ListItem.children` (`list.ts:25`;
   also `DefinitionListItem.children`). `serialize.ts` emits them from Tiptap's
   native nesting; `BulletList.tsx`/`OrderedList.tsx` map `items[].content`
   only. Any indented sub-list a teacher types is flattened for students.
   **Print-affecting.**
3. ~~**The interactive-graph feedback knobs are inert end to end**~~ ✅
   **RESOLVED 2026-08-25** — `partialCredit` DELETED; `mistakeFeedback` +
   `builtinFeedback` WIRED in `server/grading/graphs.ts` (`selectGraphMistake`),
   which makes `graph-kit/src/mistakes.ts` production-reachable for the first
   time. The paragraph below is the 2026-08-22 finding, kept as the record of
   what was wrong; **every present-tense claim in it is now false.** One
   deliberate exception: the builtin classifier TEXT is still unwired (X3 —
   student-visible nudges need their own UX pass), so `builtinFeedback` remains
   authored-but-unread until that slice. Original finding:
   `partialCredit`, `builtinFeedback`, graph-level `mistakeFeedback`
   (`interactive-graph.ts:237-260`, all described in the present tense). The
   registry strips them for students, `server/grading/graphs.ts` reads neither,
   and `scoreGraphBlock` returns a boolean. The only readers are graph-kit's
   `runtime.ts` (the dead data-attribute contract — `attachGraphRuntime` has no
   caller outside graph-kit) and a client-side check path the viewer never
   invokes, which makes `graph-kit/src/mistakes.ts` (the classifier catalogue)
   production-unreachable. `GraphSettings.tsx` still exposes all of it.
   Contrast: BLANK-level `mistakeFeedback` IS live (`grading/blanks.ts`).
4. ~~**The student calculator no longer exists**~~ — ✅ **FIXED 2026-08-23**:
   [floating-tool-cluster.md](docs/design/floating-tool-cluster.md) (plan +
   AS-BUILT). `ActivityDocument.calculator` (`document.ts:305-347`) is read by
   `ToolCluster` in the viewer, mounted from `StudentViewer` (never from
   `ViewerContainer`, so it cannot leak into the print preview). The perf
   question this entry flagged resolved as a non-issue: summon is on CLICK, so
   a student who never opens it pays 0 bytes, and no budget row moved. The
   FEATURE SCOPE behind the wiring was ruled first — DECISIONS.md → "Calculator
   feature scope" (intersections/intercepts OUT; cross-row definitions MINIMUM
   only, shipped as T11).
5. ~~**Section checkpoints and the activity flow modes**~~ — ✅ **FIXED
   2026-08-24**: [activity-flow-modes.md](docs/design/activity-flow-modes.md)
   (plan + AS BUILT). `isCheckpoint` and `submissionMode` drive the check
   GROUPS and the server-enforced lock (migration 0040); `activityType` is a
   printed + on-screen label; `revisionMode` and `gradingMode` were DELETED
   end to end. `answerFeedback` stays declared but deliberately unread —
   `immediate` is deferred to its own slice (its entry is below), and
   `scripts/tests/flow-field-readers.test.mjs` fails if that deferral ever
   ends silently. **That guard is the one this entry asked for**, scoped to
   the flow fields by name rather than to every schema field (a whole-schema
   version would go red on `skills`, which is legitimately editor-only, and
   the fix for that is a skip list — forbidden by the data-map precedent).

**Minor, same class:** `ShortAnswerBlock.placeholder` (`free-response.ts:101` —
`Essay.tsx` and `SelfExplanation.tsx` honour theirs, `ShortAnswer.tsx` does not);
`RubricCriterion.description` (written by `RubricEditor.tsx`, read by neither
`ReleasedFeedbackCard.tsx` nor the teacher grading surface);
`inlineBlankSecrets` registry key (declared on 4 entries, `sanitize.ts` strips
blank secrets recursively regardless — over-strip, safe direction, guarded only
declaration-to-declaration in `registry.test.ts`).

**Comment claims with no code beside them** (fix with the ruling they belong
to): `registry.ts:37-38` + `FillInBlank.tsx:11` say `hint` survives
sanitization as "a pre-check affordance the student may open" — nothing in the
viewer reads `blank.hint` pre-check (not a leak; the stated reason is fiction);
`document.ts:81-85` "the runtime defaults a missing answerFeedback to
'immediate'"; `graph-kit/src/index.ts:7,75,98,126,261` and `inline.ts:328`
cite published pages / the runtime sidecar / `RUNTIME.md`.

**The guard this entry asked for now exists, PARTLY** —
`scripts/tests/flow-field-readers.test.mjs`, written with item 5. It covers the
FLOW fields, not every schema field, and the scoping is deliberate: a
whole-schema version goes red on `skills` (legitimately editor-and-catalog-only)
on day one, and the only way to keep it green is a skip list — which the
data-map precedent forbids, because the list becomes the thing people edit
instead of the code. ⚠ **So item 3 and the "Minor, same class" fields below are
still guarded by NOTHING but this list.** Extending the guard to them means
naming their scope the same way, one ruling at a time.

**Depends on:** ~~author rulings per item (wire / delete)~~ **RULED 2026-08-24**
(DECISIONS.md → "The last orphan classes"): item 3 splits —
`mistakeFeedback` + `builtinFeedback` are WIRE, implemented inside the
misconception arc (wishlist #1, one design pass covers both);
`partialCredit` is DELETE. The "Minor, same class" fields and the comment
claims still want their own small rulings.

## ~~TWO MORE ORPHAN FIELDS — `hasConfidenceRating` and `allowTargetReuse`~~ ✅ DELETED 2026-08-25 (`8e2a1f3`)

Found by the drift audit's §9 sweep run across **every** schema field rather
than only the new ones. Same class as the `number` override below, and the same
question: **wire it or delete it.**

**RULED 2026-08-24 (DECISIONS.md → "The last orphan classes"): DELETE, both,
end-to-end** — schema fields, editor controls, the wire's confidence slot, and
every comment citing them (P5). Execution folds into the misconception arc's
schema commit (or a small slice ahead of it) so one bundle-regen +
`get-activity` redeploy covers everything.

✅ **DONE 2026-08-25** — both deleted end to end in `8e2a1f3` (schema ×7 block
types, the editor's toggle and reuse field, `submission.ts`'s confidence slot
and `ConfidenceLevel`, serialize both directions, the importer's `confidence`
and `reuse` fence options, seeds, e2e). Deletion-pinning tests assert the keys
are STRIPPED rather than merely absent, so an old stored document still parses.
⚠ One thing the 2026-08-22 finding understated: `allowTargetReuse` was NOT
inert — the editor's MatchingView and serialize enforced one-to-one when it was
off, a promise the student surface never kept. Many-to-one is now always
allowed, everywhere.

**1. `hasConfidenceRating` — on SEVEN block types, with nothing anywhere that
renders it.** The schema describes it in the present tense ("students see a
3-point confidence selector (unsure / think_so / certain) … before checking"),
and `submission.ts`'s wire still carries a per-blank confidence. The
implementation was the RENDERER's and died at S9 Drop 4.

⚠ **The repo already half-knows this.** `printExpectations.ts:728` records that
eng review A10 (2026-08-06) deleted the `structure/section-confidence` print row
because "the viewer has no section-confidence feature — the string 'confidence'
appears nowhere in viewer source outside this file". That review removed the
print assertion and left the seven schema fields, the editor's settings control,
and the wire standing. Whichever way this goes, it should go all the way this
time.

**2. `allowTargetReuse` (matching) — inert in both directions.** The viewer's
Matching component never restricts docking a target twice, and the grader never
reads the flag (the key is `itemId → targetId`, so many-to-one already scores
correctly). So `true` enables nothing and `false` forbids nothing. Off by
default and the permissive behaviour is the safe one, which is why it has cost
nothing — but it is an authored knob that does not do what it says.

**Not orphans, checked and cleared in the same sweep:** `tickStep`, `binWidth`,
`minorTicksPerStep`, `snapToTick`, `maxFrequency`, `correctVertices`,
`minOverlap` (all consumed by graph-kit and/or the grading server — my first
pass flagged them only because the sweep's directory list omitted those
packages), and block-level `skills`, whose schema comment declares the deferral
honestly rather than implying a consumer.

## Editor open remainders (moved out of STATE 2026-08-22)

Pre-rewrite deferrals that lived only in STATE's "completed arc" section —
which is replaced every session, so they were one rewrite from vanishing.
Roughly priority-ordered; none gates anything.

1. **Focus mode** — needs a caret-tracking ProseMirror plugin; off-by-default,
   wants its own design + eng pass.
2. **Input-parity / a11y touch pass** — touch needs a real device; `/` covers
   the keyboard floor today. (Related: the canvas-blocks tab-stop entry below.)
3. **Slice 6.5 smart-defaults** — net-new unvalidated heuristics; own spike.
4. **⌘⇧↑/↓ keyboard-reorder settle** — snap-motion follow-up (debounce design).
   Also filed separately below as its own entry.
5. **Chip open:** the slash menu dies under synthetic keyboard input once a
   query char follows `/` — humans unaffected, so this is a test-harness
   hazard rather than a user bug. **Papercut:** the gutter "+" can overlap the
   drag grip's lower half on a short block.

## A general walk-descent guard for nested-content blocks

**What:** A fixture-driven guard asserting that every registered block type's authored in-band ids
(blank tokens, math gaps) equal what the four walks actually return — the general form of the
table-specific quartet in [table-block.md](docs/design/table-block.md) §7 (Q1–Q3).

**Why:** `looksLikeBlockArray` ([blockIndex.ts:107](packages/viewer/src/container/blockIndex.ts))
descends into nested content only while the nested records DON'T carry both an `id` and a `type`.
Give a future block's sub-records a `type` and three of the four walks silently skip it: the
sanitizer still strips (it never stops), so nothing leaks — the answer is simply **never graded**.
`walk.ts`'s header calls that "the worst kind" of failure. The table arc pins its own case; nothing
pins the next one, and PDF import plus any grouped-question type will both meet this.

**Pros:** turns a silent tripwire into a build failure, once, for every future type.
**Cons:** the general version needs a real fixture-roster harness — more than a one-line assertion.

**Where to start:** the table quartet, once Slice 1 lands — it is this guard's worked example.
Then generalize over `registeredBlockTypes` × the authored fixtures.

**Depends on:** the table block's Slice 1.

## ✅ RENDER DONE 2026-08-21 — the two dead print fields now reach paper; the IMPORT SYNTAX is what remains

**✅ The render half shipped.** `blockStyle` emits `--print-work-space` on the block wrapper, and
`ViewerContainer` emits `data-grid-lines="true"` on a row whose tri-state resolves on. Four e2e specs
run green in a real browser (per-problem override with its non-vacuity pair, ruled `on`, ruled
`inherit`, and the unruled negative). **No print baselines moved** — verified rather than assumed: no
fixture authors either field, so both features are inert on every baseline.

**⏭ WHAT REMAINS: the import syntax, and it has an open design fork.** `work:` is a clean fence key
for ```mc / ```match / ```order — but **`fill_in_blank` has no fence.** It is produced by a `{{…}}`
inside a paragraph, so there is nowhere to hang a key, and it is the most common numbered problem on
a worksheet. Shipping `work:` on three of the four types would give the format a confusing contract
("works everywhere except the one you use most"). Candidate shapes, none chosen:
(a) a trailing `work: 4` line that attaches to the PREVIOUS block — a new grammar concept the format
does not have; (b) an inline suffix in the blank spec — wrong scope, since workSpace is a block
property and a paragraph can hold several blanks; (c) leave fill_in_blank to the activity-level ⚙
default and document the asymmetry. **Decide before building.**

The ```columns `ruled` option is independent and has no fork — it can ship on its own.

**⚠ AND A NAMING TRAP WORTH READING BEFORE PROMISING THIS TO ANYONE: `gridLines` is not ruled
writing lines.** It draws a BOX with dividers between cells — "boxed regions to write in or cut out
on paper", in the retired renderer's own words. Notebook-style horizontal lines to write ON do not
exist anywhere in this codebase. If that is what someone asked for, it is a separate (small) print
treatment — most likely a repeating gradient over the reserved work space — and it needs its own
authored option, which means a schema change and the usual bundle regeneration.

**The evidence, all verified 2026-08-21 by reading the render path:**
- **`workSpace` per block** — declared on `fill-in-blank.ts:43`, `ordering.ts:44`, `matching.ts:77`
  and `multiple-choice.ts`. The print CSS at
  [viewer.css:1234](packages/viewer/src/styles/viewer.css) *says* "A single problem can override the
  work space with its own value; that is ordinary custom-property inheritance, not a special case."
  **Nothing in `blocks/` or `registry/` ever sets `--print-work-space` on a block.** The comment
  describes behaviour that does not exist (policy P11 — a comment asserting coverage is a claim).
  What DOES render: the activity-level `print.workSpace` default, and `Column.minHeight`.
- **`gridLines` per row** — `Row.gridLines` (layout.ts:64), read by the editor Toolbar and
  round-tripped by serialize. `ViewerContainer.tsx:346` emits `data-row-id`, `data-column-count` and
  a grid style **and no grid-lines attribute**; no CSS anywhere resolves it. The importer hardcodes
  `'inherit'` at four sites, so nothing could set it anyway.

**Why this keeps happening — the generalisable part.** Both implementations were the renderer's, and
died with `packages/renderer` at S9 Drop 4. The schema field and the editor control survived, so the
contract still reads as honoured. This is the **third** instance this month: `numbered` (fixed by the
viewer-numbering slice), `LABELED_BLOCK_TYPES`, and now these two. **When a package is deleted, its
surviving DECLARATIONS need a consumer audit** — and the guard must bind to OUTPUT, because a guard
comparing two declarations outlives the implementation.

**What it needs (why it is a slice, not a task):**
1. Viewer: set `--print-work-space` on the block wrapper when a block authors `workSpace` — the same
   shared wrapper the numbering slice used, so it is declared once rather than per type.
2. Viewer: emit a row grid-lines attribute + print CSS resolving `'inherit'` against
   `meta.print.gridLines`, `'on'`/`'off'` overriding.
3. `printExpectations` rows bound to computed style for both. Note `structure/reserved-work-space`
   already EXISTS as a bare `{id, rule}` with no `expect` — it is a rule with no test, which is how
   this stayed invisible.
4. **Print baselines will move** — a Linux regeneration author station (the V7 precedent).
5. THEN the import syntax (a `work:` key on the problem fences, a `ruled` option on ```columns).

**Do not ship the import syntax first.** A fence key feeding a field nothing renders is exactly the
trap this entry documents.

**Cost note:** no schema change (both fields exist), so **no bundle regeneration and no Edge Function
deploy** — sanitize is a strip-list, not an allowlist, so both fields already survive to the student
surface untouched. It ships via Pages like any SPA change.

**Depends on:** nothing. Surfaced while scoping the print-gap feedback (2026-08-21); the import-syntax
half was the original ask and is blocked on steps 1–3.

## Page breaks and keep-together (author feedback #2, 2026-08-21)

**What:** No import syntax and no per-instance control to force a page break or
hold a block together. You cannot put the exit ticket / DoL on its own printed
page, or stop a worked example splitting across a fold. `{checkpoint}` is a
SECTION break, not a page break.

**Already investigated (2026-08-21) so the next session does not re-derive it:**
- `Section` is `{ id, title, isCheckpoint, rows }` (`schema/src/document.ts:35`).
  **`pageBreak: boolean` is a natural sibling to `isCheckpoint`.**
- `.viewer-section` already carries an explicit `break-before: auto` with the
  comment *"explicit: flow naturally, never force a page"* (`viewer.css`) — the
  one line to flip.
- The import syntax extends an EXISTING parser feature: the `{checkpoint}`
  heading tag becomes `## Title {checkpoint, pagebreak}`.
- **Keep-together is mostly already there** — `break-inside: avoid` is declared
  per block type on the registry's PrintSpec and asserted by
  `printExpectations`'s `spec/break-inside` row. What is missing is a
  per-INSTANCE override, which may not be wanted at all.

**Cost:** a schema change, so **both server bundles regenerate and a
`get-activity` redeploy is owed** — and note the subtle one: zod `.object()`
STRIPS unknown keys, so a published document carrying `pageBreak` would LOSE it
on the read path until the new function is live. That is the migration-before-
deploy rule wearing a different hat.

**Also needs:** a `structure/page-break` roster entry + e2e (the roster
cross-check refuses a declared id with no spec), and print baselines may move.

## Per-term definition printing (author feedback #6, 2026-08-21)

**What:** The only print path for `[[term]]` pop-ups is the ACTIVITY-WIDE
`printDefinitionGlossary` toggle — an end-of-worksheet appendix, all or nothing.
There is no way to author one term to print inline, or as a margin note. Since
the vocabulary work has the author marking every term, a per-term or margin
option would matter.

**Already investigated (2026-08-21):** `print.printDefinitionGlossary` is a bare
boolean on `PrintConfig`, rendered by `viewer/src/print/DefinitionGlossary.tsx`
and gated in `ViewerContainer.tsx:416`. Definition popovers are `display:none`
in print, which is why the appendix exists at all.

**Why this one wants a DESIGN PASS before an eng review, unlike page breaks:**
"margin note" is a real layout question on a two-column-capable worksheet, not a
boolean. Where does the margin come from — the `@page` margin (currently
0.5in and author-configurable), a reserved gutter, or a footnote-style block at
the section end? Each answers a different pedagogical need, and the cheapest
version (inline expansion on first use) may cover most of it.

**Depends on:** nothing. Both of these were ranked Tier 2 in the 2026-08-21
print-gap triage — a small schema field plus CSS plus import syntax.

## The print baselines' 1% tolerance may be absorbing real layout changes (2026-08-20)

**What:** `print-baselines.e2e.ts` compares with `maxDiffPixelRatio: 0.01`. On a 992-px-wide
snapshot that is roughly ten thousand pixels of slack — enough, apparently, to absorb a 40px number
gutter on a sparse block.

**The evidence:** the viewer-numbering slice put a number on twelve block types. Regenerating the
baselines changed **three** images (`fill_in_blank`, `problem`, `ordering`). The other nine came back
byte-identical, twice, from two independent CI runs. Yet the number demonstrably renders on that
exact route: the DOM assertion added to that suite passes 22/22 in CI, and `numbering/prints` passes
on the variant route. So the render is right and the images did not move.

**Why that matters:** a baseline is supposed to catch what the written rules do not name — "a
collapsed margin, an overlapping figure, a heading that lost its weight" (the suite's own words). If
a 40px structural change can pass under the threshold, the suite is less sensitive than it reads,
and the failure mode is silent: it goes on passing while the page drifts.

**Worth checking first (cheap, and it may dissolve the item):** run the generate job with
`--update-snapshots=all` so the artifact contains CI's ACTUAL render for every type, rather than the
checked-out file for the ones judged unchanged. That is the one observation this investigation never
managed to make — every artifact so far returns the committed image for unchanged files, so nobody
has actually SEEN what Linux draws for `multiple_choice`. If those renders do contain numbers, the
tolerance is the culprit and lowering it (or asserting per-block geometry) is the fix.

**Depends on:** nothing. Not urgent — numbering itself is guarded by two DOM assertions that no
tolerance can absorb, which is why the slice shipped without resolving this.

## `data-block-type` is emitted TWICE per block, and it keeps costing time (2026-08-20)

**What:** the container's wrapper ([ViewerContainer.tsx:456](packages/viewer/src/container/ViewerContainer.tsx))
and most block components' own roots BOTH carry `data-block-type`. `[data-block-type="X"]` therefore
matches two nested elements, and "the block" is ambiguous in every selector built on it.

**Why record it rather than tolerate it:** it cost time four separate times in one session. The print
harness already carries a paragraph explaining that BLOCK_ROOT is ambiguous "by construction" and
tries every candidate; a live browser check for a nested-gutter leak matched the wrapper and briefly
looked like a real bug; and the new `numbering/prints` rule failed on its first run purely because
variant scoping targets the component root (which carries `data-variant`) while the number lives on
the wrapper. Each was resolved in minutes — which is the point. It is a recurring tax, not a one-off.

**Options:** (a) drop the attribute from component roots and let the wrapper own it — smallest
change, but touches every component and the many selectors assuming the inner one; (b) give the
wrapper a distinct `data-block-wrapper` and narrow existing selectors deliberately; (c) leave it and
keep paying, which is defensible since the harness already compensates and nothing is broken.

**Depends on:** nothing, but it wants a quiet slice — the print gate, the a11y lane and several
component tests all select on this attribute, so the blast radius is wide even though the change is
shallow.

## The `number` override is an ORPHAN FIELD — wire it or delete it (eng review D9, 2026-08-20)

**What:** `number: z.number().int().positive().optional()` sits on 8 block schemas
([fill-in-blank.ts:38](packages/schema/src/blocks/fill-in-blank.ts) + 7 others) and **nothing writes it.**
Decide whether to wire it end to end or remove it.

**The evidence, all verified 2026-08-20:**
- The dead renderer honoured it — `const num = block.number ?? ctx.problemNumber;`
- **The editor's walk ignores it** — `problemNumberAt` returns a running count and never reads
  `node.attrs.number`. So the two surviving surfaces already disagreed.
- `serialize.ts` emits it in neither direction; there is no editor control and no importer key.
  **No document currently in the database can carry it.**

**The unresolved sub-question, which is the reason this is not a five-minute job:** what does a manual
number do to the questions AFTER it? The renderer relabelled one question and let the count carry on
underneath (`number: 12` on question 1 yields a sheet reading 12, 2, 3, 4 — self-contradicting). The
alternative is that it restarts the count (12, 13, 14), which is the only semantics that serves the
real use case: **continuity across the ~150-activity catalogue**, where activity 2 should carry on
from where activity 1 stopped. Deleting the field instead is a schema change with the usual
unconditional bundle regeneration.

**Depends on:** nothing. Cut from the viewer numbering slice at D5 so the slice could ship without
adopting an authoring feature nobody had asked for.

## The document walk is duplicated FIVE times — extract `forEachTopLevelBlock` (eng review D10, 2026-08-20)

**What:** The same 4-deep `sections → rows → columns → blocks` loop is written by hand in:
[blockIndex.ts:189](packages/viewer/src/container/blockIndex.ts),
[answer-key/extract.ts:198](packages/viewer/src/answer-key/extract.ts),
[print/printShuffle.ts:90](packages/viewer/src/print/printShuffle.ts),
[sanitize/sanitize.ts:356](packages/viewer/src/sanitize/sanitize.ts), and now
`numbering/numbering.ts`. `census.ts`, `server/grading/walk.ts` and `servedOrder.ts` touch `.rows` too.

**Why it waited:** one of those call sites is **the sanitizer** — the module that keeps answer keys
away from students. Extracting a shared iterator drags the leak suites and both server bundles into
whatever slice does it, which is a poor trade for saving four lines of `for`. The numbering slice
deliberately wrote the fifth copy rather than take that blast radius (D6).

**How to do it when it is worth doing:** its own structural commit with nothing else in flight —
never structural and behavioural change in the same breath. Extract, migrate all callers, re-run the
leak suites, regenerate both bundles, verify `SANITIZER_REV` is unmoved.

**Depends on:** a quiet moment with no schema change in flight.

## Canvas blocks add ~17 keyboard stops — Check sits 76 tabs in (S9 Drop 5 follow-up)

**What:** On the fixture worksheet (every block type, all lazy blocks mounted), a
student tabbing from the top of the document reaches the first blank at stop 3 and
the section's **Check** button at stop **76**. The canvas blocks contribute ~17 of
those: 12 `viewer-graph__canvas` + 3 `viewer-data-plot__canvas` + 2
`viewer-number-line__canvas`, and JSXGraph adds further focusable descendants.

**Why it is only a finding, not a bug:** every one of those stops has an accessible
name, so it is not a WCAG violation and axe is clean — the a11y lane passes. It is a
UX question, not a conformance one.

**Why it was invisible until now:** the a11y lane's axe scan ran against the
PRE-mount DOM (the lazy tier renders nothing at all until its chunk resolves), so
nobody had ever measured the mounted tab order. Made deterministic 2026-08-14; the
measurement above is from that mounted state.

**The actual question when this is picked up:** how should a canvas block expose its
handles to the keyboard? Options run from a single roving-tabindex entry point per
board (one stop, arrow keys within) to a skip-link past the canvas. That is a design
pass, deliberately NOT smuggled into a CI-green commit (author-ruled 2026-08-14).

**Watch item:** `e2e/a11y/student-surfaces.e2e.ts` derives its Tab budget from the
page's focusable count, so adding block types will not silently re-fail the row —
but a large jump in that count is the signal this got worse.

## Settle on ⌘⇧↑/↓ keyboard reorder (debounced)

**What:** Tag `BlockReorderShortcuts` (⌘⇧↑/↓) into the stage-6 SettleMotion flow with a
debounce, so a keyboard-moved block settles at its FINAL resting position only.

**Why:** Stage 6's settle is meta-tag opt-in (eng-review ruling T2-1, 2026-07-21), and the
keyboard reorder chord was deliberately left untagged: each keypress is a delete+insert, so
holding the chord to walk a block five slots would fire five back-to-back settles (a
strobe). Untagged is the safe v1 default — but it means keyboard-first users get no
placement confirmation while mouse users (drag) and inserters do. Parity gap.

**The design problem:** "animate only the final position" needs stopped-moving detection —
e.g. a trailing debounce (~250ms after the last reorder transaction for the same block,
apply the settle decoration), or animate on chord keyup. Neither is trivial inside a PM
plugin; that's why it was split out rather than built into stage 6.

**Depends on:** stage 6's SettleMotion extension landing first (the meta contract +
`block-settle-move` keyframe it would reuse).

**Where to start:** `packages/app/src/editor/extensions/BlockReorderShortcuts.ts` (the
chord commands) + the SettleMotion plugin's meta contract. The move keyframe
(`block-settle-move`, bounce-only, no opacity dip) already exists by then.

**Context:** surfaced by /plan-eng-review's outside-voice pass on 2026-07-21 while
reviewing the stage-6 snap-motion plan (finding 4: the reorder chord has the same
transaction signature as a drag move).

## Doc-level seam zones between multi-column rows

**What:** A second insert-zone kind at the DOC level covering the horizontal gap between
two adjacent multi-column rows (or a multi-col row and a sectionBreak), inserting a fresh
1-col row at that position.

**Why:** The shipped insert-zones seam model (eng-review ruling 2A, 2026-07-23) is
column-interior only — a strip above every block inside a column plus one at each column's
end. That covers every gap EXCEPT multi-col-row ↔ multi-col-row adjacency, which stays
grip-menu-only ("Add row below"). Deliberate: one zone kind keeps the mental model pure
("this strip = a block lands here, into this column"); doc-level zones would put a
second, different landing semantic (new row) behind an identical-looking strip.

**Pros:** closes the last insert-affordance coverage hole. **Cons:** dual semantics in
one UI — the exact ambiguity 2A was chosen to avoid; needs a visual differentiator.

**Depends on:** the v1 insert zones shipping first; real dogfooding or teacher feedback
actually hitting the gap (rare layout).

**Where to start:** the InsertZones extension's `insertZonePositions` helper
(`packages/app/src/editor/strictGrid.ts`) — doc-level positions are the ones it
deliberately does not emit; `StrictGridNormalize` re-coalesce rules decide what a
doc-level insert normalizes into.

**Context:** surfaced by /plan-eng-review on 2026-07-23 while reviewing the persistent
insert-zones feature (issue 2 / ruling 2A).

## Batched staleness-status RPC (`get_branch_source_statuses(uuid[])`)

**What:** A batch variant of Drop 2′'s `get_branch_source_status(branch_id)` so the
Activities/library view resolves every branched card's staleness in one round-trip.

**Why:** v1 ships the per-card RPC — a deliberate N+1 accepted because branch counts are
single-digit (eng-review ruling D10, 2026-07-24). The batch variant is additive (no surface
break) and only earns its keep at scale.

**Trigger:** any user's branch count passes ~15, or library render is measurably slow.

**Where to start:** the `get_branch_source_status` definer RPC in the Drop 2′ migration —
same owner-only gating, `= any(p_ids)` + per-row degradation instead of a single lookup.

**Context:** surfaced by /plan-eng-review on 2026-07-24 (Activity Bank arc, performance
review finding 4-1).

## Orphaned-image garbage collection (activity-images bucket)

**What:** A cleanup job that diffs `activity-images` Storage objects against the image `src`s
actually referenced in activity documents and deletes the unreferenced ones.

**Why:** The bucket has no DELETE path by design (0019: INSERT-only policy), so every replaced or
abandoned upload lives in a public bucket forever. Same residue the R2 era had — but Storage
counts against Supabase's 1GB free-tier quota, which R2's 10GB never made anyone think about.
A slow clock, but a real one.

**Cons / why not now:** Needs real design — image refs live inside JSONB in BOTH
`activities.draft_content` AND `activity_versions.content`, and until the S9 cutover, old
published R2 pages also reference uploads. A naive GC deletes images that published pages still
show.

**Depends on:** S9 cutover (single source of truth for references). Service-role side (the only
role that can delete).

**Context:** surfaced by /plan-eng-review 2026-07-31 (direct-to-Storage upload review, TODO ask 1).

## Upload progress indicator (blocked on a policy-design amendment)

**What:** A progress bar during image upload in the editor popovers (ImageEditPopover,
DefinitionEditPopover).

**Why:** Visible-state UX for large images (repo UX priority: visible state indicators). The
10MB cap keeps uploads short on school networks, so this is polish, not pain.

**⚠️ The trap this entry exists to disarm:** this is NOT a UI-only task. supabase-js's standard
`upload()` has no progress callback; progress requires the TUS resumable protocol, and TUS needs
UPDATE (and possibly SELECT) policies on `activity-images` that 0019 deliberately omits — the
absence of an UPDATE policy is what makes objects overwrite-proof today (DECISIONS.md →
"Direct-to-Storage image upload"). Whoever picks this up is amending the bucket's security
posture first and adding a progress bar second.

**Context:** surfaced by /plan-eng-review 2026-07-31 (outside-voice finding 7, TODO ask 2).

## Teacher grading bound to `section_checks` (the S4 deferral's owner)

**What:** Make student free-text captured by the viewer's check flow gradable by a teacher, and
readable back by the student. Four pieces: (1) how `grades` keys onto checks — a nullable
`check_id` with an exactly-one-of constraint against the existing `submission_id`, or a
checks-native grading table; (2) the **attempts-vs-latest-response decision**; (3)
`get_my_released_feedback(activity_id)`; (4) the dashboard UI binding.

**Why:** S4 records every check into `section_checks` (responses + verdicts + feedback shown),
so free-text answers are CAPTURED — but nothing can grade them and
`CheckService.fetchReleasedFeedback` honestly returns `graded:false` until this lands. The
student-facing "Recorded ✓ — your teacher will review" copy stays true only because this slice
is scheduled. It must land before any real classroom use of the viewer.

**⚠️ Why it was deliberately CUT from S4** (eng review 2026-08-01, cross-model tension T2): a
`unique(check_id, block_id)` written during S4 would have frozen the attempts-vs-latest question
BEFORE the UX that answers it. Under a formative check loop a student produces MANY
`section_checks` rows per section, each re-snapshotting their free text. Does the teacher grade
an attempt, or the latest response per block? That is a grading-UX question, and deciding it
with the UI in front of you is the whole point of the deferral. Freezing the FK first buys a
second migration.

**Second open question the deferral inherits:** released feedback is keyed by BLOCK id, but a
republish mints all-new block ids (the same premise that made S4 grade the served version).
Feedback graded against version N is unrenderable by a client viewing version N+1. The
version-pinning insight was applied to grading and not yet to readback.

**Depends on:** S4 shipping `section_checks` (migration 0020) — DONE 2026-08-01, so this is unblocked.

**⏸ Deliberately parked (author, 2026-08-01): NOT pressing, because there are no
teachers using the system yet.** That is the whole reason it can wait — the
captured free text is accumulating safely in `section_checks.responses` and
nothing is being lost. What changes the urgency is the first real teacher: at
that moment "Recorded ✓ — your teacher will review" becomes a promise the
product cannot keep, and this slice is what keeps it.

**⚠ S9 amendment (2026-08-12, eng review OV-5/OV-6):** the S9 cutover plan
([s9-cutover.md](docs/design/s9-cutover.md) D-6) RETIRES the Phase 2.6 surface this
entry would have re-pointed: the Submissions dashboard route is deleted, `grades`
rows are wiped with the anonymous-wire test data, and `get-feedback` is deleted —
**and was discovered to have NEVER worked** (every success return passed its
arguments to `jsonResponse` swapped, so the body served was the literal `200`;
released feedback never reached a published page). Consequence for pickup: this
slice rebuilds against `section_checks` with NO working reference implementation —
do not port `get-feedback`'s "behavior"; there is none. The Phase 2.6 rubric UI
components remain in git history for salvage.

**Where to start:** `supabase/migrations/0010_grades.sql` (the `submission_id`-keyed table +
`can_grade_submission` helper + the dual-path RLS precedent already written for the assignment
world), and the Phase 2.6 teacher grading UI (side-by-side + Needs-grading filter) that will be
re-pointed.

**Context:** surfaced by /plan-eng-review 2026-08-01 (S4 review, outside-voice findings 5+6 →
ruled tension T2, TODO ask 1). Full rulings: the S4 section of
`~/.gstack/projects/ZanReed-activity-platform/user-main-design-20260728-components-as-data.md`.

## The check-rollup ARMING arc — ✅ ROLLUP BUILT (0036); only the ARMING FLIP remains

**⚡ STATUS 2026-08-16 (late): the build half is DONE and committed.** Migration **0036** ships the
two rollup tables, `users.timezone` + the IANA-validating guard trigger, `run_analytics_maintenance`
v2 (sweep → self-heal → roll → stamp + reconciliation pair), `rebuild_check_rollup`,
`purge_soft_deleted` v4, and `get_activity_analytics` v2. verify-0036 is **20/20**; the full local
suite is **145/2** (the 2 are the documented fresh-DB seeded-data preconditions). **Everything
below the checklist is now HISTORY of how it was ruled — the live work is the checklist alone.**

⚠ **THE GATE'S CHARACTER CHANGED, and this is the one thing a future session must not misread.**
0035's gate was mechanical: nothing wrote `rolled_through`, so arming was inert. **0036 writes it
nightly.** The prune is now held disarmed by exactly two things — **it is not scheduled**, and its
**`p_dry_run` default is true**. Scheduling `prune_section_checks(false)` now DELETES ROWS. The
inert-by-construction era is over; from here the checklist is the only guard.

**What remains:** apply 0036 live → watch the ledger for N green nights → work the arming
checklist below → the author flips the cron command to `prune_section_checks(false)`.

🚫 **NEW BLOCKING STEP — MISCONCEPTIONS MUST ROLL UP BEFORE ARMING (eng review X1,
2026-08-25).** The misconception-sensors arc records a `misconceptionIds` array on wrong
answers, stored inside `section_checks.verdicts`. **Those ids live almost exclusively on
NON-latest attempts** — a misconception appears when the student is wrong, and the latest
attempt is usually the corrected one. `prune_section_checks` deletes precisely the rows that
are not in `section_checks_latest`, so arming as currently specified **deletes the
misconception dataset and keeps the rows that carry none of it.** Neither rollup table has a
misconception dimension: `check_item_rollup_daily` is verdict counts only
(`verdicts_all / correct_all / incorrect_all / recorded_all / students`), so nothing survives
the prune to carry the signal.

**Do not arm until a misconception aggregate exists and has been running long enough to
cover the window the prune will delete.** Design decisions still open (they belong to the
rollup amendment, not to this checklist): whether the dimension is a third table keyed
`(version, day, item_id, misconception_id)` or an additional grain on the existing item
table; how the array is unnested (one row per id — a wrong answer with two ids counts once
for each); and how a taxonomy RENAME is handled at read time, since stored rows keep the old
string forever (see the id-rename TODO). Everything else in this arc's design is inherited,
not re-derived — but this dimension was never in it.

**Trigger for ARMING:** real check growth on the `analytics_job_runs.section_check_rows` ledger
(still 0 as of 2026-08-16 — 11 runs, all zero). No date; read the ledger. Building the rollup
early was the author's deliberate call (momentum + every ruling fresh); arming has no such
argument and waits for real data.

**Two tracked follow-ons this arc deliberately did NOT build (P1 tracked-debt form, OV-5/OV-7):**
- **The daily-trend surface** is the production reader for `check_rollup_daily.students` and
  `check_item_rollup_daily.students_all`. Those columns ship with no reader today and are kept
  anyway because per-day distinct students is the ONE figure that cannot be recomputed
  retroactively once pruning runs. **No RPC may ever offer their SUM** (uniques don't compose;
  `hll` is unavailable on Supabase, checked 2026-08-16).
- **A teacher timezone control.** `users.timezone` has no editing surface, so every teacher but
  the author (set by 0036's email-keyed UPDATE) gets the `America/Chicago` default baked into
  their rolled day keys. Bundle it with the deferred **"how your name appears to students"**
  control — same `users` self-edit family, same tiny RLS-covered write. ⚠ Ordering matters: a
  zone correction after arming can only re-day the in-horizon window (older days are frozen),
  so the control is worth more BEFORE a second teacher accumulates history.

**THE RULINGS BELOW ARE ALL BUILT INTO 0036** (eng review 2026-08-16 Part I D2–D12, Part II
D2-II–D7-II + OV-1..9; full trail in
[check-retention-and-rollup.md](docs/design/check-retention-and-rollup.md) §5 + §II). Kept as the
record of WHY the schema looks like it does — read them before changing it, not before building it:
- **Item grain, two single-grain tables** (`check_rollup_daily` per version/day: checks, students;
  `check_item_rollup_daily` per version/day/item: verdict counts, students). `census_key` resolved
  at READ time via `activity_version_items` so a re-census re-attributes rolled history. FKs
  CASCADE from activities AND versions; 0026 §B's no-student-identifier assertion extends to both;
  zero RLS, DEFINER reads, **activity-scoped ownership gates only** (0035's header states this as
  a checkable claim).
- **The rollup rides `run_analytics_maintenance()`** (no third cron job): sweep → roll → advance
  watermark, `rolled_through` written coalesce-forward on EVERY ledger row.
- **MVCC watermark lag ≥ 5 min**, honestly framed: it shrinks (not closes) the in-flight-transaction
  hole; state the bound and consider `idle_in_transaction_session_timeout`.
- **Per-teacher timezone:** `users.timezone` (IANA text), default `America/Chicago`, the author's
  row set to `Pacific/Auckland`; `analytics_day(ts, zone)` keyed on the activity OWNER's zone (the
  platform spans the US and New Zealand — no single constant works). ⚠ **Validate the zone**: it is
  user-editable text in the nightly job's path — check against `pg_timezone_names` at write AND
  exception-guard to the default in the job (one bad row must not kill the nightly run — the 0022
  failure class), with an invalid-zone verify row.
- **Split-day re-rolls:** every owner-zone day spans ≥2 nightly runs (03:30 UTC is mid-afternoon
  NZ); delete-then-insert per (version, day) must recompute the FULL day from raw rows, so
  `PRUNE_HORIZON` (30d, floor 7d — the bond in 0035) must stay ≫ the day-completion lag. Verify
  row: a day split across two runs. Re-derive the cron hour while here.
- **Purge v4:** `purge_soft_deleted` is NEVER blocked by the watermark (retention outranks
  analytics); it reports unrolled-destroyed counts **on a ledger row**, never the NOTICE (0026
  established notices are unreadable).
- **`rebuild_check_rollup(p_from date)`:** rebuild ≡ incremental, including after a re-census;
  every shape decision stays reversible until arming.
- **Per-key `students` becomes latest-grounded at arming** (no code change — the live query over
  surviving rows already computes it); the deliverable is the panel-copy disclosure. Daily
  `students` columns are per-day trend figures; **no RPC may offer their sum** (uniques don't
  compose; `hll` is unavailable on Supabase, checked 2026-08-16).
- **`*_latest` is NEVER rolled** — it stays live-computable forever (F2); the rollup carries the
  flow family only, and `get_activity_analytics` v2 reads rolled + raw across a single-sourced
  `>=`/`<` boundary.

**THE ARMING CHECKLIST — the live work** (also in 0035's header):
1. ✅ rollup built (0036, committed 2026-08-16) · 2. ⏭ **0036 applied live** (pending author) ·
3. ⏭ backfill — no separate step: **the first nightly run after 0036 IS the backfill** (it rolls
everything below the watermark; trivially empty at 0 checks) · 4. ⏭ watermark advancing for **≥ N
green nights, read off `analytics_job_runs` rows, not the cron registration (P3)**, with the
**reconciliation pair not drifting between runs** (`checks_below_watermark` vs
`rolled_checks_total` — movement is the signal, not the absolute) · 5. ⏭ verify-0035 + verify-0036
re-run live · 6. ⏭ **counsel packet Q10 answered** (n=1 aggregates surviving a purge; asked
2026-08-16) · 7. ⏭ `PRUNE_HORIZON` re-checked against real split-day lag · 8. ⏭ **cron flipped to
`prune_section_checks(false)`** — the first genuinely destructive act in this whole arc.

**✅ P5 debt — DISCHARGED by 0036**, where each retired guard said to discharge it: 0036's header
names and supersedes 0026:106 and 0022's header (applied migrations are immutable, so the
supersession is recorded rather than edited); verify-0035 §A's `rolled_through_never_written`
became a **scoping** assertion (`rolled_through` on `job_name='analytics'` rows only); and
verify-0035 §I **inverted** — the fixture is now rolled before the prune, so `*_all` is UNCHANGED
across it. That delta of zero, asserted where the honest loss used to be, is the arc's promise.

**Depends on (for ARMING):** 0036 applied live; real classroom traffic — the one thing neither
2026-08-16 review could have, and the reason step 8 waits.

**Where to start:** [check-retention-and-rollup.md](docs/design/check-retention-and-rollup.md)
(§4 checklist, §5 + §II rulings), then **0036's header** (its "design tension carried visibly"
block explains the horizon clamp — the single most important invariant to not break), then
`scripts/verify-0036.sql` §C for the fixture idiom.

**Context:** the original entry (2026-08-01, S4 review) waited months on the attempts-vs-latest
ruling; teacher-grading G2 ruled it 2026-08-15, the 2026-08-16 eng review ruled the rollup's shape,
and its outside voice overturned "build the rollup now" into "prune disarmed now, rollup at arming"
(D10) — the frame this entry now records.

## The remaining ~380 ms LaTeX-fallback window (S5-2 residual, halved not closed)

**What:** A student still sees readable-LaTeX fallback for roughly **380 ms** after the
worksheet becomes interactive, and a browser-menu Ctrl+P inside that window prints the
fallback rather than typeset math.

**What already happened (do not redo it):** S8 T7 shipped preload-on-math-detect — the
KaTeX fetch now starts the instant the served document is known to contain math instead of
waiting for a math component to mount. That took the window from ~737 ms to ~382 ms and
cost nothing in shell size. Full reasoning and the before/after table: DECISIONS.md →
"Preload math on detect, rather than eager-loading it".

**The only lever left is eager loading, and it is expensive.** KaTeX is 75.2 KiB gz against
a 168.1 KiB gz shell — about **+45% first load** on every math-bearing page — and it would
amend ruling D16, which exists to protect Chromebook load time. Deliberately NOT taken: a
sub-half-second window that only bites if a student reaches for Ctrl+P in the first moment
is not worth that, especially on the school hardware D16 protects.

**Trigger to revisit:** a teacher or student actually reports printing raw LaTeX, OR the
shell gets enough lighter (see the 168→150 KiB entry below) that 75 KiB stops being a
meaningful share of first load.

**Where to start:** `packages/viewer/src/inline/mathPreload.ts` (detection + preload) and
the `loading` tier in `packages/viewer/src/registry/bindings.ts`. Re-measure with
`pnpm --filter @activity/app exec playwright test --project=perf` — the spec prints the
fallback-window number directly.

**Context:** original residual from /plan-eng-review 2026-08-01 (S5 ruling S5-2); reframed
from a binary into three options by the S8 outside voice (2026-08-05, ruling D7); option 3
built and measured the same day.

## A DELTA guard for the two Edge Function bundles (2026-08-23)

**The problem, measured rather than argued.** `VIEWER_SERVER_MAX_KIB` (1500) and
`GRADING_SERVER_MAX_KIB` (4000) are ABSOLUTE ceilings, and `perf-budgets.mjs`
says plainly what they are for: *"every real leak has been enormous — the two
above were 3x and 23x the ceiling"* and *"if it jumps by a multiple, something is
importing a component."* They are order-of-magnitude tripwires, not budgets.

They still catch the two enormous incidents. **They no longer catch the smallest
of the three recorded ones.** Tested 2026-08-23 against the actual figures:

| recorded incident | viewer (964/1500) | grading (2535/4000) |
|---|---|---|
| component-tree leak (2.8 MB) | CAUGHT | CAUGHT |
| graph-binding leak (21 MB) | CAUGHT | CAUGHT |
| **MathLive via the barrel (~1 MB)** | CAUGHT | **MISSED** — 2535 + 1024 = 3559 < 4000 |

That third one is real, not hypothetical: CLAUDE.md records it happening
(*"importing scorers through the barrel put 1 MB of MathLive into the grading
Edge Function (caught by the bundle's size ceiling)"*). It was caught **because
the bundle was smaller then**. Grading has since grown legitimately into the
headroom that caught it — so the guard weakened without anyone changing it, which
is the "a budget that can only ever loosen is a fossil" concern running in the
other direction.

**DO NOT FIX THIS BY TIGHTENING THE CAP.** Grading legitimately grows when
grading gains capability; a tight absolute ceiling there creates friction for
real work and would be re-raised on its first legitimate collision, which is how
a cap becomes meaningless. The absolute ceilings are correctly calibrated for
what they do.

**The idea: a DELTA row.** Fail when a committed bundle grows more than ~15-20%
in a single commit, regardless of absolute headroom. A leak is a step change; a
legitimate feature is incremental. This catches the 1 MB class at ANY bundle
size, which is exactly the property the absolute cap loses as the bundle grows.

**What has to be decided before building it (do not skip these):**
1. **Where does the baseline live?** The committed bundle in git HEAD is the
   obvious answer and needs no new state — `git show HEAD:<bundle> | wc -c`
   against the working copy. Cheap, and it makes the check a diff property
   rather than a stored number that can rot.
2. **What about legitimate step changes?** This slice shrank both bundles 82 KiB
   at once, and a future one could add as much. The guard needs a documented
   override path, and the override must be a deliberate, explained commit — the
   same discipline the SANITIZER_REV pin uses.
3. **Does it belong in `perf-budgets.mjs` at all?** That file's two structures
   (CHUNK_LEDGER, absence rows) are both about the built SPA. A delta check over
   committed files is a different shape and may want to live with the bundle
   drift checks in `verify-local.mjs` instead.
4. **Mutation-test it.** A delta guard that has never been seen to fire is the
   vacuity class this repo keeps finding — and note the trap this slice already
   demonstrated: an unreferenced import gets tree-shaken away, so the mutation
   has to USE what it imports.

**Depends on:** nothing. **Not urgent** — the standing subpath rule in CLAUDE.md
(*"Import graph-kit SUBPATHS, never the package barrel"*) exists precisely
because of the incident this would re-catch, and it is the first line of defense.
This is the second.

## Five dormant editor papercuts (moved out of STATE 2026-08-23)

They sat in STATE's "Open questions" for weeks. **None blocks anything**, and
STATE is a "where am I" snapshot with a ~150-line budget, so a list that never
changes belongs here. Recorded with enough context to act without archaeology.

1. **Empty `fill_in_blank` drag-handle attachment** — whether
   `definingForContent: true` changed the handles-only-on-non-empty behaviour is
   UNVERIFIED. Re-test during a drag-reorder pass. Minor.
2. **Blank popover: one-click switch between chips** — a deferred design
   decision, no data loss either way. Needs its own pass: FocusTrap and
   selection are entangled here, which is why it was deferred rather than done.
3. **Section metadata panel** — `SectionBreakView`'s inline title/checkpoint UI
   is adequate; an editor-level panel stays optional. Do not build it because it
   "feels missing".
4. **Responsive `--blank-width` sizing** — deferred from Stage 11.
5. **Post-success edit edge case** — the locked/single paths briefly
   write-then-remove the persistence blob. Wasteful but CORRECT; low priority.

**Depends on:** nothing. Each is independent.

## The student shell's size ladder — TARGET MET (2026-08-23), ladder open

**⚖ THE ~150 KiB gz TARGET IS MET.** Two rungs shipped: slice 1 (the Supabase
sub-clients, 2026-08-18) and rung 1 (the zod audit, 2026-08-23). **Do not read a
byte figure out of this entry** — it has now produced stale numbers in two
consecutive drift audits, because the writing races the shipping and the writing
loses. **`node scripts/check-perf-budget.mjs` prints every row with its cap; the
caps and their reasoning live in `scripts/perf-budgets.mjs`.** That is the only
current source, and this entry deliberately no longer competes with it.

**⚑ WHAT IS ACTUALLY OPEN.** Both shell rows sit inside the ~10% headroom policy
again, so nothing forces a rung right now. The remaining candidates are listed
below and are NOT ranked — slice 1's own rule applies: each shipped slice changes
the composition of the entry chunk, so run a FRESH sourcemap attribution before
picking one (P10). The list was derived against a shell two slices heavier and is
stale by construction.

**⚑ THE TRIGGER, unchanged and still not a byte count:** a real measurement on
real school hardware showing the SHELL is the bottleneck (the field-measurement
entry in this file). The 2026-08-18 ruling's reasoning — timing already beats its
targets with room, and the shell is not what a student waits on — was never
refuted; it was simply overtaken when the budget rows tightened. Its fourth point
still holds and is the one to carry forward: **slice 1 and rung 1 were both
uniquely cheap because they deleted code that never executed** (dead sub-clients;
an import that was never a parse). Every rung left trades correctness or blast
radius for bytes.

**SHIPPED — slice 1, the Supabase sub-clients (2026-08-18):**
[shell-slim-supabase.md](docs/design/shell-slim-supabase.md). `@supabase/realtime-js`
(+ phoenix) and `@supabase/storage-js` (+ iceberg-js) are aliased to inert stubs; the
one storage caller, `lib/uploadImage.ts`, makes its two calls as raw `fetch`.
**177.6 → 156.4 KiB gz (−21.2), and the cap tightened 185 → 172 in the same slice**
(ruling R6 — a cap left at 185 over a 156 shell is 18% slack, i.e. the fossil this
file's own budget policy warns about). Guarded by four absence rows in
`scripts/check-perf-budget.mjs` and by `scripts/tests/supabase-stub-pin.test.mjs`.

**⏰ THE PARK EXPIRED 2026-08-23 and rung 1 SHIPPED the same day** — the entry
above is the current state; this line is kept only to record that the park had a
trigger and the trigger fired (both shell rows fell under the ~10% policy at once,
and the CSS row had no lever left, so the JS ladder was the only one). Rung 1 then
took the shell under the 150 target. ⚠ The numbers that stood here were stale
within hours of being written — see the entry above for why this section no longer
carries any.

**THE LADDER'S REMAINING RUNGS** (ruling R7 — each is its own slice,
deliberately NOT folded into slice 1; and see the stale-list warning above):
1. ~~**The zod audit.**~~ ✅ **SHIPPED 2026-08-23** —
   [shell-slim-zod.md](docs/design/shell-slim-zod.md) (design + AS-BUILT).
   **Entry chunk 160.5 → 143.2 KiB gz (−17.3), zod absent from the shell**, and
   `SHELL_JS_GZ_KIB` tightened 172 → 158 in the same commit per ruling R6.
   **P1A's ~150 KiB target is MET.** ⚠ The description that stood here was
   WRONG — it said the offline-restore path was parse-bearing. The student path
   contains ZERO zod parses; zod was IMPORT cost, not validation cost. Two
   conditions were needed and neither was sufficient alone: extracting
   `tableBlankIds` out of a zod schema module, and `sideEffects: false`. The
   trust-posture question the old text imagined is real, separate, and filed
   below.
2. **The router.** react-router v7's data APIs cost more than this app's route table
   needs; a swap is mechanical but touches every route file.
3. **Preact/compat.** Largest single win and largest blast radius (Tiptap, floating-ui
   and the whole editor ride on React); measure before believing.
4. **auth-js itself** (27.1 KiB gz, the biggest single line in the attribution). NOT a
   candidate the way realtime was: it runs constantly — session restore, refresh, the
   OAuth round trip. Hand-rolling it would be re-implementing security-relevant code
   the platform maintains. Listed for completeness, not as a plan.

**The measured position at the park (2026-08-18, both axes, re-measured against
`647fb8b~1` rather than quoted):** entry chunk **626.4 → 547.1 KiB raw** and
**177.6 → 156.4 KiB gz** — −79.3 raw, −21.2 gz. Raw is recorded on purpose: gz is what
the school Wi-Fi carries, raw is what a CPU-bound Chromebook has to parse, and this
project's throttling model says the second one is the half that hurts. ~6.4 KiB gz
separates the shell from the P1A sketch.

**Why the remainder is not slack:** the entry chunk is react-dom + react-router +
auth-js/postgrest + the viewer's eager block tier + StudentViewer + Home. The 3 MB of
editor weight already left in the S8 split.

**How to know if it worked:** `node scripts/check-perf-budget.mjs` prints the number
every run; lower `SHELL_JS_GZ_KIB` in `scripts/perf-budgets.mjs` deliberately when it
drops, so the win is locked in rather than silently re-spent. Slice 1 did exactly that
— do the same, in the same commit as the shrink.

**Context:** surfaced during the S8 build (2026-08-05) when calibration met the P1A
sketch; outside-voice finding 7 predicted the gap before it was measured. Slice 1's
attribution (2026-08-18, sourcemap-decoded) replaced the folklore 168 number with a
real per-library table — re-derive the same way before picking rung 2.

## Integration lane in CI (S9 Drop 5 deferral, DX ruling P6)

**What:** The `integration` Playwright lane (real `supabase start` stack, real
trigger/RLS/RPCs/Edge Functions — `packages/app/e2e/integration/`) is
LOCAL-ONLY by ruling: CI would need Docker-in-Actions + a supabase stack per
run, which the verify-runner's no-live-DB-in-CI posture deliberately avoided.

**Trigger to adopt:** the first regression that the integration lane catches
locally but CI missed, OR the first post-cutover slice that touches
auth/RLS/RPC surfaces — at that point the lane has proven it earns its CI
minutes; wire it as a separate workflow job with `supabase/setup-cli` +
`supabase start`, keyed E2E_INTEGRATION=1.

**Where to start:** `.github/workflows/ci.yml` (the e2e job's shape),
`packages/app/playwright.config.ts` (the integration project),
`supabase/config.toml` (local stack config). The lane's preflight prints its
own prerequisites. *(A second copy of this entry, "Integration e2e lane into
CI (post-S9)", was merged here 2026-08-23; its context: S9 DX review
2026-08-12 Pass 6 ruling P6, s9-cutover.md §9.)*

**Until then:** run `pnpm --filter @activity/app test:e2e:integration` before
cutover-adjacent pushes; the preflight prints named fixes on a cold machine
(verified 2026-08-14 — Docker-less run produced the exact fix text).

## Question parameterization — different numbers per printed version

**What:** Templated question variants: the same authored question with per-version
parameter values ("solve 3x + 5 = 20" vs "solve 4x + 7 = 31"), so randomized print
versions (S5.5) differ in CONTENT, not just arrangement.

**Why:** S5.5's version feature shuffles arrangement only (MC choice order, matching
bank, ordering items). A teacher fighting copying gets far more from different numbers.
The author asked for this during the S5.5 eng review and explicitly deferred it as its
own arc (ruling D5, 2026-08-03).

**What it needs (why it's an arc, not a task):** schema for parameter definitions and
constraints; per-instance answer computation (the answer key must be derived, not
authored, for parameterized blanks/MC); editor UI for authoring templates; grading
implications if parameterized activities ever meet the live check path; print-version
seeds extended to select parameter instantiations deterministically.

**Depends on:** S5.5 shipped (version selector + deterministic seeds are the natural
substrate). Wants its own design pass + eng review.

**Context:** surfaced in the S5.5 /plan-eng-review (2026-08-03) when the author asked
whether "versions" meant different questions; ruled out-of-slice, captured here.

## Batch print: all versions + answer keys in one job

**What:** A "Print all versions" action producing ONE print job containing Version
1..N sheets (optionally each version's answer key appended), instead of N separate
print-dialog runs.

**Why:** A teacher printing 3 versions for a class runs 3–6 print dialogs today
(version × key). Real time-saver once versions see classroom use.

**How (sketch):** sequential `window.print()` calls are browser-blocked; the workable
shape is a composed multi-version document — render each version's worksheet
(offscreen, same capture path the foldable uses post-S5.5), concatenate into one
printable document with per-version page breaks. The foldable's compose/iframe
machinery is the pattern.

**Depends on:** S5.5's version feature shipping AND seeing real use — demand-triggered.

**Context:** surfaced in the S5.5 /plan-eng-review (2026-08-03, decision D22).

## Editor load path and the schema upgrade seam

**What:** When the first real schema migration lands in `packages/schema/src/upgrade.ts`,
check the EDITOR's activity-load path runs the upgrade seam before parsing drafts.

**Why:** S5.5 wires the seam into the teacher print route (ruling D23, 2026-08-03), but
the editor loads drafts the same direct way. Zero impact today (zero migrations exist);
the day migration #1 lands, an un-upgraded old draft would fail the editor's parse.

**Where to start:** the editor's load in `packages/app/src/routes/ActivityEditor.tsx`
(or wherever draft_content is parsed) — mirror what the S5.5 print route does.

**Depends on:** the first schema migration existing. Until then this is a no-op.

**Context:** surfaced in the S5.5 /plan-eng-review (2026-08-03, decision D23).

## Field measurement of student-interactive on real Chromebooks (post-S9, compliance-gated)

**What:** Collect real-user timings of the `performance.mark('student-interactive')`
mark (landing with S8) from actual student devices, once the compliance posture
allows it.

**Why:** S8's throttled lab lane is a proxy; the mark was deliberately designed so
lab and field speak the same vocabulary (S8 ruling D2/R2 — the mark contract is
additive-only precisely so historical comparison survives). Real Chromebook numbers
are the ground truth the lab run approximates.

**Hard gate:** this is data collection from students. The backlog already rules that
behavioral telemetry waits until (a) the census cannot answer a concrete question AND
(b) the compliance pack is amended. Performance timing is thinner than behavioral
telemetry but it is still collection — the same two-part gate applies. Do NOT ship
quiet student telemetry as a perf-slice side effect.

**Where to start:** the mark already exists (S8, viewer instrumentation); collection
would be a small beacon + an amendment to docs/compliance/. Scope the retention and
aggregation before any write path exists.

**Depends on:** S9 cutover (students on the viewer at scale) + the compliance-pack
amendment.

**Context:** surfaced in the S8 /plan-eng-review long-term audit (2026-08-05, T1
ruling; rulings in the gstack design doc → S8 section).

## Privacy-guard content hash (after the compliance-pack rewrite)

**What:** Strengthen the compliance-pack guard from string-presence (`toContain`) to a
content hash over the student-facing pack files + the rendered `Privacy.tsx` text,
pinned beside `POLICY_VERSION` — so wording and version can only move together.

**Why:** The current guard asserts presence only, and the S1 audit found the
assertion-text tests are tautologies (they compare the constant to itself) — a material
wording edit without a version bump passes everywhere, which defeats
`assertion_text_version`'s entire purpose (distinguishing wording generations on the
legal record). The 2026-08-06 eng review ruled the first real POLICY_VERSION bump
(B10/B11); after that rewrite the wording is finally load-bearing enough to deserve a
real guard.

**⚠ Sequencing (the reason this is a TODO and not part of the rewrite):** land it
AFTER the D2/D3 pack rewrite — hashing the current text would pin the drift the rewrite
exists to fix. Kept out of the rewrite commit itself so the legal-wording diff stays
reviewable by the author without mechanical guard noise (eng review D23).

**Bonus in the same visit:** delete the tautology tests (`classes.test.ts:108` and
friends) the hash guard supersedes; add a one-line howto in the test for re-pinning the
hash on a deliberate wording change (the friction is the feature).

**Where to start:** the presence-only guard the privacy-version test already runs;
`packages/app/src/lib/policyVersion.ts`; `docs/compliance/*.md`.

**Context:** eng review 2026-08-06 (D23), from s1-retro audit findings 9/12.

## Drop the dormant `assignments` table (Classroom-integration arc)

**What:** Drop `assignments` (and its indexes/policies) when the Phase 3
Google-Classroom arc re-derives assignment shapes.

**Why:** The table has ZERO app consumers (grep-verified 2026-08-09: nothing in
packages/app or packages/viewer references it), carries Google-Classroom text-id
columns from a never-built integration sketch, and after S9 Drop 3 its last SQL
consumer (the ingest RPC's token→assignment lookup) dies too. Dead schema misleads
every future reader — but dropping it touches `submissions` FKs, which the parked
teacher-grading slice hasn't ruled on, so S9 deliberately leaves it dormant
(s9-cutover.md D-2: "leave assignments dormant").

**Pros:** removes a whole dead subsystem from the schema. **Cons:** FK surgery on
`submissions`; pointless to do before the Classroom arc decides what replaces it.

**Depends on:** S9 Drop 3 landed; owned by the Phase 3 Classroom-integration arc.

**Where to start:** `supabase/migrations/0001_initial_schema.sql:150-169` (the
table), `0009:255` (index), `0002:169-176`/`0013:166-172` (policies);
`submissions.assignment_id` FK.

**Context:** S9 eng review 2026-08-12 (recon + D-2 ruling; TODO ask 2).

## Student Home cross-class recency cue ("New this week")

**What:** A recency indicator on the student Home activities list — e.g. a quiet
"New" marker on rows added in the last ~7 days — so a student in many classes can
find today's work without scanning every class section.

**Why:** The S9 Drop 2 design ruled per-class newest-first as the complete v1
answer (DR-11, 2026-08-13): students launch with 1–2 classes, and an unvalidated
recency heuristic would be decoration. Past ~3 classes the scan cost becomes
real; this entry is the named lever so the gap is a decision, not a bug report.

**Trigger:** real multi-class usage exists (students in 3+ classes with active
sharing), or a student/teacher asks how to find "what's new".

**Pros:** one glance answers "what's new"; no layout change (a marker on
existing rows). **Cons:** "new since when?" needs a definition (added-at age vs
last-visit tracking — the latter is new per-student state); an age-based marker
lies to a student who already did the work.

**Where to start:** `packages/app/src/routes/Home.tsx` (StudentHome list rows);
`list_class_activities` already returns `added_at`, so an age-based v1 needs no
schema change. The design record is docs/design/s9-cutover.md §10 (DR-11) + the
v2 board annotations.

**Context:** S9 Drop 2 design review 2026-08-13 (issue 11 / OV-23b; ruled 11A —
record v1 as deliberate + name the lever).

## Cap-lifting admin surface for attested teachers (0033 R3 follow-on)

**What:** A way to raise or clear the self-serve teacher caps without hand-written
SQL. Migration 0033 caps an attested (non-allowlist) teacher at **5 classes and
50 members per class**; `users.teacher_caps_exempt` lifts both. Today the author
lifts it with a one-row UPDATE.

**Why it is here and not still in §7:** the caps are LIVE and they bind a real
person the first time an outside teacher hits one. §7 deferred the UI on "waits
for the second real teacher", which is correct — what that reasoning does not
cover is the moment BEFORE the UI exists, when a legitimate teacher is blocked
mid-lesson and the only remedy is the author at a SQL prompt. That is a support
path, not a feature, and it should be a known one.

**Trigger:** the first attested teacher who is not the author — i.e. the first
time `teacher_caps_exempt` matters to somebody who cannot edit the database.

**Where to start:** the caps are enforced in 0033's audited create/join paths;
`scripts/verify-0033.sql` has the liveness rows that fire both caps at production
values, so any change has a working proof harness already. The interim runbook is
one UPDATE on `users.teacher_caps_exempt` — worth writing into the support notes
before it is needed rather than during.

**Watch:** lifting a cap is the one action that converts a self-attested stranger
into an unbounded teacher. Whatever the surface becomes, it should stay an author
action with an audit row, not a self-service button.

**Context:** docs/design/admission-model.md §5b R3 + §7; eng review OV-9.

## Under-13 support — the age gate and school-consent enrollment (D7)

**What:** The arc that would let a class with students under 13 use the platform:
a student-facing age gate (the Khan-style birthdate-before-anything pattern) plus
a school-consent enrollment mechanism that actually carries COPPA's school-consent
exception, rather than excluding under-13s outright.

**Why it is here:** v1 excludes under-13 use entirely, and the ONLY thing carrying
that exclusion is the teacher's per-class "every student in this class is 13 or
older" assertion. Students are never asked their age. That is a real dependency on
a teacher's accuracy, disclosed in the pack, and it is the single most likely thing
for counsel to push back on (it is Q4 of the counsel packet). If the answer comes
back "teacher assertion is not enough", this stops being a deferred arc and becomes
required work — so it needs an entry that a session can pick up cold.

**Trigger:** the D24 counsel read answering Q4 against the current design, OR a
teacher asking for a 6th/7th-grade class.

**Scope sketch (not a design):** birthdate gate before auth; a parent-consent
branch for independent learners; school-consent enrollment for school users; the
compliance pack rewritten around consent rather than exclusion; the
`school-authorization-template.md` checkbox that currently reads "not available in
v1" becomes live. Gimkit's and Khan's published wording are the closest models —
both were read and quoted in the design doc.

**Do NOT half-build it.** The current posture is coherent (exclude, say so
plainly). A birthdate gate WITHOUT the consent mechanism behind it would collect
ages from children while still refusing them, which is worse than either end state.

**Context:** docs/design/admission-model.md §5a D7 + §7; docs/compliance/
counsel-review-packet.md Q4.

## Signable DPA template for the first district

**What:** A data-processing agreement the author can actually put in front of a
district, rather than assembling one under time pressure during a first adoption
conversation.

**Why it is here:** Illinois SOPPA, NY Ed Law 2-d and their siblings require
signed per-district agreements for school-directed services — this is statutory,
not a nicety, and no gate design avoids it. §7 defers the template to "the first
district that asks (with counsel)", which is the right sequencing but a bad
surprise: the first district that asks will be mid-conversation, and the delay is
visible to them. The cheap version of this is to know, before that call, which
regime applies and what the template must contain.

**Trigger:** the D24 counsel read (Q7 asks exactly this — should a template exist
BEFORE the first outside teacher, or is on-demand right?), or the first district
conversation, whichever comes first.

**Where to start:** `docs/compliance/school-authorization-template.md` is the
teacher-facing half and already exists; the DPA is the district-facing half and
does not. The SDPC registry is the usual source of standard forms. This one is
genuinely counsel-led — the repo-side contribution is the data map, which is
current as of 0033 and is what a DPA's schedule is built from.

**Context:** docs/design/admission-model.md §5 item 5 + §7; docs/compliance/
counsel-review-packet.md Q7.

## Student feedback discoverability (the promise's second half)

**What:** A quiet indicator on the student Home / activity list when released teacher feedback
exists that the student hasn't seen — e.g. a "Feedback" marker on the activity row.

**Why:** The teacher-grading slice's readback is pull-only: a student only finds released
feedback by spontaneously reopening a finished worksheet. The outside voice's sharpest strategic
point (2026-08-15): "Recorded — your teacher will review" completes in PRACTICE only when the
review's OUTPUT is findable. Without this, released feedback mostly goes unread.

**Design-together constraint:** "unread" needs either a seen-marker (new per-student state) or an
age heuristic — the same fork as the "Student Home cross-class recency cue" entry above (DR-11).
Design the two indicators together; two separate marker systems on the same list rows is the
twin-drift class.

**Trigger:** the first real released feedback (i.e. the teacher-grading slice live with a real
class), or the recency-cue entry's own trigger firing — whichever first.

**Where to start:** `list_class_activities` (0030) already returns the student's rows; a derived
"has unread released feedback" flag is a join against `check_grades.released_at`. The no-new-state
v1 is age-based ("released since your last check"), which lies less than it sounds because
re-checking is the natural reaction to reading feedback.

**Context:** docs/design/teacher-grading.md (Why-now + G5); outside-voice finding #14, ruled
2026-08-15 (TODO, not slice scope).

## Retire the `submissions` table (the last 0029 survivor)

**What:** A housekeeping migration dropping `submissions` (and its 0005/0007 attempt machinery),
removing purge_soft_deleted's step 2, and running the P5 citation audit over everything that
names the table.

**Why:** 0029 kept `submissions` + `grades` empty "for the parked teacher-grading slice to
re-decide." That slice re-decided 2026-08-15: grading is checks-native, `grades` +
`can_grade_submission` die in 0034 — which leaves `submissions` with NO future consumer: an
empty table with live RLS whose only remaining reader is the purge function.

**Why NOT bundled into 0034 (author-ruled 2026-08-15):** dropping it means rewriting
`purge_soft_deleted` a third time — blast radius on the nightly cron — and it sits nowhere on
the grading slice's path. The purge function deserves its own careful commit.

**Trigger:** 0034 applied live + one green nightly purge run after it (proving nothing re-keyed
onto submissions).

**Where to start:** 0029's header (what deliberately survived and why), 0022+0029 for the purge
function's history, `scripts/verify-*` for every row that asserts the table exists. Remember the
0009 discipline: the FK-covering indexes die with it.

**Context:** teacher-grading eng review 2026-08-15 (G1 scoping + TODO ruling); 0029's D-6 note.

## ✅ Activities list surface — search/sort/grouping — SHIPPED (closed 2026-08-31)

**All of D3–D11 is built**, verified against
[Activities.tsx](packages/app/src/routes/Activities.tsx) on 2026-08-31:
grouped-by-unit outline (D3), recent strip (D4), unit order (D5 — now
superseded by catalogue path for file-backed units, Lane B), filters hide empty
groups (D6), scroll restoration (D7, `useScrollMemory`), flat separated rows
(D8), `/`-search (D9), the a11y spec (D10), the drafts chip (D11). Design
record: [activities-list-surface.md](docs/design/activities-list-surface.md).

⚠ *This entry read "`Activities.tsx` is a flat unsorted `<ul>`" until
2026-08-31, long after the outline shipped.* It is the second stale entry found
in the same pass as wishlist #1 — both were found by ANSWERING "what is left",
not by an audit, which is worth noting given the audit ran the day before.

**What actually survives, and it is the untested part:** pagination or
virtualization. The outline has never rendered more than a few dozen rows; the
~150 the catalogue push will create is still a claim. **Depends on:** the
corpus reaching a size that tests it — i.e. dogfooding, not a slice.

## Refresh capability-inventory.md against the post-registry importer (ride Drop 2)

**What:** Update [docs/capability-inventory.md](docs/capability-inventory.md): §1's fence count (says 13, is 16 — `callout`/`reference`/`definitions` landed), §2.11 (`callout` is no longer editor-only), §4.B's importable-gaps list, and — once the taxonomy arc's Drop 2 lands — the new `meta` fence (which §3 currently declares impossible: "no activity-level settings are expressible in pasted markdown").

**Why:** The doc presents itself as code-derived truth with file:line citations; the 2026-08-18 taxonomy eng review had to re-verify its claims against code because several had silently gone stale. Stale citations are worse than no doc (the repo's own stale-diagram principle; P11 for coverage claims).

**Context:** Pin the refresh to the taxonomy arc's Drop 2 commit (the `meta` import fence), which touches the same three artifacts (parser/prompt/format doc) — refreshing before that commit would need doing twice. See [activity-taxonomy.md](docs/design/activity-taxonomy.md) §3.

**Effort:** S
**Priority:** P3
**Depends on:** taxonomy arc Drop 2 (the `meta` fence).

## React "state update on a not-yet-mounted component" from both editors' onCreate

**What:** Both Tiptap editors call a React state setter from `onCreate`, which Tiptap fires during the render phase — before React has committed the mount. Every first mount of an editor route logs `Can't perform a React state update on a component that hasn't mounted yet. This indicates that you have a side-effect in your render function…`. Decide whether to fix it or to record it as accepted, but stop leaving it unexplained.

**Why:** It is a real React warning on the primary authoring surface, and right now nobody knows whether it is benign. That ambiguity is the cost: the next person to see it in the console has to re-derive the whole thing before they can rule out that it is the cause of whatever they are actually debugging. (Found 2026-08-18 during the taxonomy slice's browser verification; **confirmed pre-existing** by checking out the pre-slice files and reproducing the identical warning, so it is not taxonomy fallout.)

**Context — the exact source, already traced, do not re-derive:**
- Stack bottoms out at `packages/app/src/editor/ReferencePanelEditor.tsx:128-130` — `onCreate: ({ editor }) => { onUpdate(editor.getJSON()); }` → `handlePanelUpdate` in ActivityEditor → `setPanelJson`.
- `packages/app/src/editor/Editor.tsx:107-109` has the **identical shape** (`onCreate` → `onUpdate?.` → `setTiptapJson`), so this is not dev-bench-only — it fires on the real `/activity/:id` route too. Reproduce on `/dev/config-drawer`, which is the cheapest surface (no auth, no Supabase).
- It warns **once per lazy chunk's first mount**: revisiting the route after the chunk is warm logs nothing, which is why it is easy to miss and why a naive "reload and check" shows a clean console.

**⚠ The trap — this is NOT a free "move it to useEffect":** that `onCreate` call is load-bearing for the autosave baseline. `changeKey` gates on `panelJson` precisely so the fingerprint settles only once BOTH editors have reported their loaded content (see the comment on `handlePanelUpdate`). Deferring the first report to an effect changes WHEN the baseline settles, and getting it wrong produces either a spurious load-time save or a missed first edit. Any fix needs the autosave baseline tests (and `activityChangeKey.test.ts`) to stay green, plus a check that opening an activity and immediately closing it still writes nothing.

**Pros:** Removes a real warning from the primary authoring surface; makes the console trustworthy again for debugging real defects.
**Cons:** Touches the autosave baseline settle, which is delicate and has bitten before; the warning appears to be cosmetic today, so the fix carries more risk than the symptom.

**Effort:** S (investigate + decide) / M (if the fix touches the baseline)
**Priority:** P3
**Depends on:** None.

## Remove the dead `problem` block (ride the next schema-changing slice)

**What:** Delete `problem` from schema, viewer (Problem.tsx, registry, bindings), sanitizer types, and the grading corpus row — with a P5 claims-grep for every comment citing it before deletion.

**Why:** E1 of the answer-key eng review (2026-08-19, [problem-answer-key.md](docs/design/problem-answer-key.md)) ruled the block stays dead: the editor has NEVER been able to hold one ([serialize.ts](packages/app/src/lib/serialize.ts) drops it with a warning), no fence produces one, and its paper-problem job now belongs to the extended `short_answer`/`essay`. What remains is a zombie that renders in the viewer and looks alive to any future session — the resurrection-path hazard OV-DX-2 names.

**Pros:** One less block type in schema/sanitizer/registry/grading to reason about; the E1 tombstone becomes temporary.
**Cons:** A `packages/schema` change, so it pays the bundle-regeneration round — which is why it should RIDE a slice already paying it, never stand alone.

**Context:** Registry calls it "numbered legacy prose problem" (registry.ts:133). The corpus is empty of them (nothing could ever author one). The answer-key review deliberately did NOT fold this into its own slice — deletions deserve their own focus (the S9 lesson).

**Effort:** S · **Priority:** P3 · **Depends on:** the next slice that regenerates the server bundles anyway.

## Answer/solution editing UI in FreeResponseView

**What:** Inline-content editors for the `answer`/`solution` fields on short_answer/essay blocks (E10 of the answer-key review ships READ-ONLY display only).

**Why:** Until it exists, fixing an answer typo = edit the .md file → re-import. Correct while the markdown corpus is the source of truth; a wall the moment an activity is authored editor-natively with no backing file (a future co-teacher without a markdown workflow — the Activity Bank's multi-author future).

**Pros:** Self-contained in-app authoring of answer keys.
**Cons:** An InlineNode editing surface — real editor work — building a second authoring path while the file-based one is primary.

**Context:** The fields ride Tiptap attrs (the rubric pattern); T2 of the review's task list adds the attrs + read-only display. **Trigger to build:** editor-native authoring of free-response answers becomes a real path.

**Effort:** M · **Priority:** P3 · **Depends on:** answer-key slice T2 (attrs + serialize round-trip).

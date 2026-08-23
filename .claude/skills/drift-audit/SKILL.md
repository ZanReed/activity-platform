# Drift audit

Compare what the documents claim against what the code does, and the documents against each other. The output is a ranked findings report (confirmed drift first, then long-term risks), NOT fixes — fix mechanical items only when the author says to, and bring structural items to discussion. This skill encodes the 2026-07-10 audit method that found stale version constants, "not implemented" status lines on shipped features, and superseded architecture sketches.

> **⚠ REWRITTEN 2026-08-17, and the reason is this skill's own cautionary tale.** The original checklist audited `packages/renderer`, `packages/renderer/RUNTIME.md`, `ingest-submission`, `bundle:renderer`, `STORAGE_SCHEMA_VERSION`, the wire-version ladder, and `_shared/graph-kit-manifest.ts` — **every one of them deleted at S9 (2026-08-14) or the D-13 R2 teardown (2026-08-15)**. Three of its eight sections pointed at nothing, which is worse than pointing at nothing loudly: **a section with no target reports "clean" forever.** The 2026-08-17 audit found this only because it read the checklist against the repo before running it. Hence §0 below.

## When to run this (added 2026-08-22 — the schedule question, answered)

**Not every session.** The temptation is real and the failure mode is worse than
the drift: most sessions produce none, so an audit that reports "clean" eight
times running stops being read carefully — and the ninth, the one with a finding,
gets skimmed. Same dynamic as a flaky test. This audit also costs ~30 tool calls,
live database reads and a full `pnpm verify`; spending that after a five-call
session buys nothing.

**The cheap half runs every session instead.** CLAUDE.md's *Session close-out* is
four questions scoped to what that session CHANGED — new schema field, touched
migration/deploy/constant, deleted anything, STATE still honest. That is where
most drift is cheapest to catch, because it is caught at the moment it is
created.

**Run THIS, in full, on a trigger:**

- **After any package, file, or feature DELETION.** The highest-yield trigger by
  far, and the one this skill exists to remember: S9 deleted `packages/renderer`
  and left five docs citing `RUNTIME.md` (two with broken links), three sections
  of this checklist pointing at nothing, and four schema fields whose
  implementation had gone.
- **After a schema change lands** — a new block type or field is the moment the
  §9 orphan class is created.
- **Before another person touches the repo.** Every doc this finds stale is one
  they would have believed.
- **When a session ends with several unrelated arcs** (the 2026-08-22 case: a
  four-slice feature, a CI change, two flake fixes and an incident).
- **Otherwise roughly every two weeks**, as a floor rather than a rhythm.

**2026-08-23 — the trigger list earned its keep, in the newest way yet.** The run
after a two-slice session found FIVE drift items and **every one had been created
in that same session**, hours earlier: four docs and one SOURCE comment saying
the reference panel's screen surface was dead or deferred, written before the
slice that shipped it. Nothing in the older repo had drifted at all. Two of the
five were in a paragraph that a PREVIOUS audit had already corrected once. So the
highest-yield trigger is not only DELETION — it is **any session that both
changes reality and writes about it**, because the writing races the shipping and
the docs lose. Corollary for the report: rank self-created drift first; it is the
freshest, the most confidently wrong, and the least likely to be caught by
anyone else.

**The audit should be getting CHEAPER.** Every finding converted into a guard
bound to output is a section that stops producing findings. If a run keeps
surfacing the same class, that is a signal the guards are not being written — not
that the audit needs running more often. Watch for the half-fix in particular: on
2026-08-22 §9 found `hasConfidenceRating`, which eng review A10 had already
half-acted-on in August (it deleted the print row and left the schema fields, the
editor control and the wire). **A finding that gets half-acted-on comes back.**

## Ground rules

- Precedence when sources disagree: **code > STATE.md > ROADMAP.md** (ROADMAP's own charter says so). A doc contradicting code is drift in the doc, not a bug in the code.
- "Mechanical" fixes (safe to apply on request): stale constants/sizes, status lines, pointers, annotations. "Structural" issues (discuss first): checklist gaps, budget trends, process hazards.
- When fixing a doc that pins a number the code owns, **prefer pointing at the source over re-pinning** ("run `node scripts/check-perf-budget.mjs`; caps live in `scripts/perf-budgets.mjs`") so it cannot rot again. STATE.md carried three different entry-chunk numbers in two of its own rows before this rule was applied there.
- **Annotate, never rewrite, a doc that describes retired infrastructure.** A shipped feature's design doc is also a historical record of how it shipped. Add a dated `> ⚠ INFRASTRUCTURE ANNOTATION` block above the status line naming what died and where the live mechanism is now; leave the original text intact. Four design docs got this treatment on 2026-08-17 (R2 kit hashes, `ingest-submission`, `publish-activity`, `upload:graph-kit`).
- **Verify against the live schema/platform, not against migration filenames.** The 2026-08-17 audit's biggest find (a student-name column undocumented since 0001) was invisible to diff-reading and obvious to an `information_schema` sweep.

## Checklist

Work through each item; skip none silently — say "clean" per section in the report.

**0. Audit this checklist first (the S9 lesson).** Before running anything, confirm every file, script, and constant named below still exists (`ls`, `grep`, `git log -1 -- <path>`). A section whose target was deleted must be reported as a finding about THIS SKILL, not silently skipped and not reported as "clean". Fix the checklist in the same pass if the author agrees.

**1. Version constants and version stamps.** Read the truth from source, then grep every doc that quotes it:
- `ACTIVITY_SCHEMA_VERSION` — `packages/schema/src/upgrade.ts` (currently 2; the document model's version, bumped by an upgrade path).
- `SANITIZER_REV` — `packages/viewer/src/sanitize/sanitize.ts`. **It is COMPUTED** (`SANITIZER_ALGO_REV` + an fnv1a hash of the spec material), so the check is *inverted*: no doc may pin a literal rev **UNGUARDED**. ⚠ **Corrected 2026-08-21** — this bullet used to say "no doc may pin a literal rev; a doc quoting one is drift by construction", and that produced a phantom finding. The repo pins the value ON PURPOSE in `packages/viewer/tests/printShuffle.test.ts` so a move cannot happen accidentally (a moved rev means both bundles regenerate and a `get-activity` redeploy is owed). A value quoted alongside that guard, or recorded in HISTORY as an observation, is not drift. An unguarded literal in a live doc still is.
- `POLICY_VERSION` — `packages/app/src/lib/policyVersion.ts` (in-product, student/teacher-facing).
- **Doc-local compliance stamps** — `docs/compliance/retention-policy.md` and `data-map.md` each carry their own `draft-N`. These are deliberately separate from `POLICY_VERSION`, and unifying them is **counsel packet Q8**. Check all three are internally consistent and that the divergence is still explicitly recorded rather than accidental.
- `MATHLIVE_VERSION` — pinned in `mathlive-setup.ts` and **self-guarding**: `packages/app/vite.config.ts`'s `activity:mathlive-fonts` plugin fails the BUILD if the pin drifts from the installed package. Note the guard exists; do not re-verify by hand.
- ⚰ **Dead, do not look for:** `STORAGE_SCHEMA_VERSION`, the published-page wire ladder, `ingest-submission`'s accepted-versions list. `packages/schema/src/submission.ts` still defines wire schemaVersions **1–9** (this bullet said "1–3" until the 2026-08-22 run read the file) for the **frozen, writer-less `submissions`** table — flag any doc that presents that ladder as a live contract.

**2. Bundle sizes and budgets.** `scripts/perf-budgets.mjs` is the ONE home for every ceiling, with its reasoning. Two families:
- **Edge Function bundles:** `VIEWER_SERVER_MAX_KIB` / `GRADING_SERVER_MAX_KIB` vs the committed `supabase/functions/_shared/*.bundle.js` (`wc -c`). CI guards staleness, not ceiling values — that is this audit's job.
- **Built SPA:** `node scripts/check-perf-budget.mjs` prints every row with its
  cap. ⚠ **DO NOT PIN THE ROW COUNT HERE — this bullet has now circulated a stale
  one twice** (it said 12, then 16; the 2026-08-23 run read 18 after the zod
  ledger + shell-absence rows landed). A checklist that warns about stale figures
  while carrying one is the exact failure §0 exists for. Read the count from the
  run; the caps and their reasoning live in `scripts/perf-budgets.mjs`.
- Flag anything within ~15% of its cap: the budget ladder should be *scheduled*, not discovered mid-feature. **Read the current numbers from `node scripts/check-perf-budget.mjs`; do not pin one here.** This bullet pinned "156.4 KiB" from 2026-08-18 until the 2026-08-21 audit found it reading 157.4 — a checklist that warns about circulating stale figures, circulating a stale figure. The shell-slim ladder is PARKED (TODOS.md names the one trigger to resume). Prefer flagging a row that has MOVED toward its cap since the last audit over a raw percentage — the headroom policy is ~10%, so a freshly-calibrated row always sits near 90% and a raw threshold flags every healthy row. DECISIONS: "a budget that can only ever loosen is a fossil."

**3. Design-doc status lines.** For each `docs/design/*.md`, read the status header and check it against STATE/HISTORY ship status.
- ⚠ **NOT EVERY doc in `docs/design/` IS A FEATURE DOC.** `ux-lens.md` is a
  reusable review INSTRUMENT; it has no ship status because it never ships.
  **Three consecutive audits have now reported it as status-less** (2026-08-17,
  2026-08-22 in a different spelling, 2026-08-23) — the finding is a false
  positive every time, and a checklist that reliably produces one trains its
  reader to skim. Classify first: a doc describing a PROCEDURE the team runs is
  out of scope for this section; a doc describing a FEATURE the product has is
  in it.
- ⚠ **"Cites a dead mechanism" is NOT drift when recording the death is the
  doc's job.** The naive grep (`on R2`, `ingest-submission`, `publish-activity`,
  `upload:graph-kit`, …) flags three docs that are all correct:
  `s9-cutover.md` — whose entire purpose is to specify the deletions;
  `manual-grading.md` — whose status line is explicitly ⚰️ SUPERSEDED and says
  why; and `strict-grid-editor.md` — which makes a NEGATIVE historical claim
  ("NO `publish-activity` redeploy"). Before flagging, ask what the sentence is
  DOING: asserting the mechanism is live (drift), or recording that it died or
  was never needed (not drift). Annotate only the first kind.
- ⚠ **Grep for ALL FOUR forms:** `**Status:**`, `**Status: ` (colon inside the bold), `> **Status:**` (inside a blockquote — `activities-list-surface.md`), and `Status: **VALUE**` (colon outside the bold — `dark-mode.md`). One expression that covers them: `grep -nE '^>? *\*{0,2}Status:'`. The 2026-08-17 audit reported two docs as having *no* status line because its grep only matched the first form — a false positive that cost a finding's credibility — and the 2026-08-22 audit repeated it in a NEW form, reporting `activities-list-surface.md` as status-less when its line sits in a blockquote. Two audits, same mistake, different spelling: widen the expression rather than adding forms one at a time. Normalize to `**Status:**` when fixing.
- A shipped feature's doc must say SHIPPED and carry an as-built-deltas note where the implementation diverged (pattern: `vocabulary-definitions.md`, `interactive-graph-block.md`).
- Watch for status lines that are true about *shipping* while naming a *retired mechanism* as live — the most common drift class in this repo. Annotate per the ground rule.
- Never delete a superseded doc that other docs cite.

**4. ROADMAP annotations.** Shipped items get ✅/strikethrough in the at-a-glance table and phase bodies (policy 2026-07-11: light sweep at ship time, not annotation-free). Architecture sketches contradicted by the as-built shape get a correction note pointing at the design doc, so later phases (2.8/2.9 cite earlier patterns as precedent) build against reality. ROADMAP's pre-2026-07-28 phases predate the components-as-data rewrite — check its own warning banner still says so.

**5. STATE.md internal consistency.** STATE is session-appended and rots inward:
- Older "Current focus" narratives instructing something a newer line or Status-by-area row says was retired.
- **The same fact stated twice with different numbers** (three entry-chunk figures, 2026-08-17). Prefer deleting both and pointing at the tool.
- **Standing rules parked in "Pending author actions" belong in CLAUDE.md** — STATE sections get *replaced* every session, so a prohibition living there is a prohibition with an expiry date. The prune-arming rule was found this way.
- Check STATE stays near its ~150-line rule.

**6. Deploy-state and migration sync.**
- `supabase/config.toml` is the authoritative per-function `verify_jwt` record; confirm it lists exactly the functions in `supabase/functions/` and that its prose header does not contradict its own entries (its opener claimed "three anonymous functions" against two entries until 2026-08-17).
- Verify live FLAGS with `list_edge_functions` — read the `version` field, NOT
  the `entrypoint_path` suffix beside it (that misread produced a false
  "verified live" stamp twice). ⚠ **But `version` does NOT prove the code
  changed, and 2026-08-23 is the third generation of this trap:** a successful
  `deploy:get-activity` left `version` 24, `updated_at` byte-identical and
  `ezbr_sha256` unchanged, and an audit concluded "not deployed" twice on that
  evidence before grepping the deployed source and finding the change live.
  **To verify CODE, `get_edge_function` and grep for a marker unique to the
  change** — a bumped constant, a new identifier, plus the ABSENCE of a string
  the old version carried. Treat an unmoved version as no information at all.
- Migrations named in docs vs `supabase/migrations/`; migration *ranges* claimed by the compliance pack (see §7).
- ⚰ **Dead:** kit-manifest sync, R2 upload ordering, ingest-before-republish. Nothing uploads anywhere.

**7. Compliance pack currency.** Read by counsel, not by tests — and the pack fell three migrations behind before 2026-08-17.
- **Guarded now:** `scripts/tests/data-map-coverage.test.mjs` sweeps migrations for person-referencing columns and fails if a table is undocumented or `data-map.md`'s stated migration range falls behind. `retention-windows.test.mjs` pins retention-policy's windows against migration SQL.
- **NOT guarded, so check by hand:** whether `retention-policy.md` has a row for every new table holding or summarizing student data, and whether any factual claim about production has expired. The 2026-08-17 audit caught it asserting "no rollup advances a watermark today" hours before a cron made that false.
- Cross-check live counts a doc states as fact (`execute_sql`) — the pack asserted "no real personal names are stored" after one had been.

**8. Cross-references, guards, and README durability.**
- Every `DECISIONS →`, `HISTORY →`, and design-doc link in STATE resolves to a real file/heading.
- Run the drift-guard tests: `node --test scripts/tests/*.test.mjs` — **read the count from the run, never from here** (this bullet pinned 54, STATE pinned 73, the run on 2026-08-22 said 98) plus the app-side lockstep guards (`markdownImportPrompt`, `blockTypeGuards`, `importFormatRegistry`).
- Test counts quoted in STATE vs actual `pnpm test`.
- README deliberately carries no build status — confirm none crept in. Its CI paragraph describes a *mechanism*, which is durable and fine. Confirm the add-a-block-type checklist still matches the real wiring surface.

**9. Declarations without consumers (added 2026-08-21 — the highest-yield sweep this repo has).**
FIVE instances in two weeks, all the same shape: a schema field or registry
declaration survives, its implementation does not, and the suite stays green
because the guard compares two DECLARATIONS rather than checking output.

| what declared it | what had died | found by |
|---|---|---|
| registry `numbered: 'always'` (8 types) | the renderer's `isNumberedBlock` | the viewer-numbering slice |
| `LABELED_BLOCK_TYPES` | — (hand-maintained list) | the answer-key slice |
| block `workSpace` (4 types) | the renderer's per-block emit | the print-gap triage |
| `Row.gridLines` | the renderer's `data-grid-lines` | the print-gap triage |
| `**bold**` in fence bodies | never existed; the doc promised it | **printing a page** |

The sweep: for each field in `packages/schema/src/blocks/*.ts` and each key in
the viewer registry, grep for a **rendering** consumer — `packages/viewer/src/blocks/`,
`container/`, or the print CSS. A field read only by the editor, only by
`serialize.ts`, or only by its own tests is a candidate. Two of the five above
reached PAPER, so weight print-affecting fields first.

**2026-08-22 — the sweep run over EVERY field, not only the new ones, found FIVE
more classes (choice `image`/`graph`, `ListItem.children`, the graph feedback
knobs, `ActivityDocument.calculator`, `isCheckpoint` + the flow modes — TODOS.md
"S9 left FIVE MORE ORPHAN CLASSES").** One cause: the implementation died with
the renderer/runtime, the declarations did not. So after any DELETION, the
claims-grep (P5) must also walk (a) `packages/schema/src` comments in the
present tense, (b) the editor's controls (`ActivityConfigDrawer`, `*Settings`,
NodeViews) and (c) importer keys — each one is a declaration that can outlive
its consumer. Run the full-field sweep, not the new-field sweep, on the
deletion trigger.

**The tell that this class is present:** a source comment describing behaviour
in the present tense with no code beside it (`packages/viewer/src/styles/viewer.css` — the 2026-08-22 §0 pass found this skill naming `src/viewer.css`, a path that does not exist — said "a single problem
can override the work space" for four months while nothing set the property).
Grep comments for "can override", "is honoured", "resolves to" and check each.

**When you find one, the fix is not just wiring it** — the guard must bind to
OUTPUT, or it re-rots. `scripts/tests/batch-import.test.mjs` §A (bundles and
RUNS the pipeline) and the `structure/*` rows in `print-rules.e2e.ts` (assert
computed style) are the patterns; a grep-for-the-import-string test is not.

## Report format

Lead with a one-paragraph TLDR (clean / N findings). Then:
- **Confirmed drift** — doc says X, code/reality says Y, with `file:line`, ranked by blast radius. **CLAUDE.md first** (it steers every AI session), then anything counsel reads, then STATE, then design docs.
- **Long-term risks** — trends and process hazards, each with a concrete recommendation.
- End by offering to apply the mechanical fixes as one docs commit, leaving structural items for discussion.

**Report your own false positives.** If a finding dissolves on closer reading, say so in the report rather than quietly dropping it — a checklist that produces phantom findings gets trusted less than one that admits them, and the phantom usually points at a real gap in the *method* (the `**Status:` grep, 2026-08-17).

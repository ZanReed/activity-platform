# Drift audit

Compare what the documents claim against what the code does, and the documents against each other. The output is a ranked findings report (confirmed drift first, then long-term risks), NOT fixes — fix mechanical items only when the author says to, and bring structural items to discussion. This skill encodes the 2026-07-10 audit method that found stale version constants, "not implemented" status lines on shipped features, and superseded architecture sketches.

> **⚠ REWRITTEN 2026-08-17, and the reason is this skill's own cautionary tale.** The original checklist audited `packages/renderer`, `packages/renderer/RUNTIME.md`, `ingest-submission`, `bundle:renderer`, `STORAGE_SCHEMA_VERSION`, the wire-version ladder, and `_shared/graph-kit-manifest.ts` — **every one of them deleted at S9 (2026-08-14) or the D-13 R2 teardown (2026-08-15)**. Three of its eight sections pointed at nothing, which is worse than pointing at nothing loudly: **a section with no target reports "clean" forever.** The 2026-08-17 audit found this only because it read the checklist against the repo before running it. Hence §0 below.

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
- `SANITIZER_REV` — `packages/viewer/src/sanitize/sanitize.ts`. **It is COMPUTED** (`SANITIZER_ALGO_REV` + an fnv1a hash of the spec material), so the check is *inverted*: no doc may pin a literal rev value. A doc quoting one is drift by construction. What docs may say is that a spec change rotates it and orphans the read cache.
- `POLICY_VERSION` — `packages/app/src/lib/policyVersion.ts` (in-product, student/teacher-facing).
- **Doc-local compliance stamps** — `docs/compliance/retention-policy.md` and `data-map.md` each carry their own `draft-N`. These are deliberately separate from `POLICY_VERSION`, and unifying them is **counsel packet Q8**. Check all three are internally consistent and that the divergence is still explicitly recorded rather than accidental.
- `MATHLIVE_VERSION` — pinned in `mathlive-setup.ts` and **self-guarding**: `packages/app/vite.config.ts`'s `activity:mathlive-fonts` plugin fails the BUILD if the pin drifts from the installed package. Note the guard exists; do not re-verify by hand.
- ⚰ **Dead, do not look for:** `STORAGE_SCHEMA_VERSION`, the published-page wire ladder, `ingest-submission`'s accepted-versions list. `packages/schema/src/submission.ts` still defines wire schemaVersions 1–3 for the **frozen, writer-less `submissions`** table — flag any doc that presents that ladder as a live contract.

**2. Bundle sizes and budgets.** `scripts/perf-budgets.mjs` is the ONE home for every ceiling, with its reasoning. Two families:
- **Edge Function bundles:** `VIEWER_SERVER_MAX_KIB` / `GRADING_SERVER_MAX_KIB` vs the committed `supabase/functions/_shared/*.bundle.js` (`wc -c`). CI guards staleness, not ceiling values — that is this audit's job.
- **Built SPA:** `node scripts/check-perf-budget.mjs` prints all 12 with their caps.
- Flag anything within ~15% of its cap: the budget ladder should be *scheduled*, not discovered mid-feature. **As of 2026-08-17 the student shell sits at ~96% of its 185 KiB gz cap** — either the 168→150 work (TODOS) gets scheduled or the cap gets a deliberate, explained re-baseline. DECISIONS: "a budget that can only ever loosen is a fossil."

**3. Design-doc status lines.** For each `docs/design/*.md`, read the status header and check it against STATE/HISTORY ship status.
- ⚠ **Grep for BOTH forms:** `**Status:**` and `**Status: ` (colon inside the bold). The 2026-08-17 audit reported two docs as having *no* status line because its grep only matched the first form — a false positive that cost a finding's credibility. Normalize to `**Status:**` when fixing.
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
- Verify live flags/versions with `list_edge_functions` — **read the `version` field, NOT the `entrypoint_path` suffix beside it.** That misread produced a false "verified live" stamp twice.
- Migrations named in docs vs `supabase/migrations/`; migration *ranges* claimed by the compliance pack (see §7).
- ⚰ **Dead:** kit-manifest sync, R2 upload ordering, ingest-before-republish. Nothing uploads anywhere.

**7. Compliance pack currency.** Read by counsel, not by tests — and the pack fell three migrations behind before 2026-08-17.
- **Guarded now:** `scripts/tests/data-map-coverage.test.mjs` sweeps migrations for person-referencing columns and fails if a table is undocumented or `data-map.md`'s stated migration range falls behind. `retention-windows.test.mjs` pins retention-policy's windows against migration SQL.
- **NOT guarded, so check by hand:** whether `retention-policy.md` has a row for every new table holding or summarizing student data, and whether any factual claim about production has expired. The 2026-08-17 audit caught it asserting "no rollup advances a watermark today" hours before a cron made that false.
- Cross-check live counts a doc states as fact (`execute_sql`) — the pack asserted "no real personal names are stored" after one had been.

**8. Cross-references, guards, and README durability.**
- Every `DECISIONS →`, `HISTORY →`, and design-doc link in STATE resolves to a real file/heading.
- Run the drift-guard tests: `node --test scripts/tests/*.test.mjs` (41 as of 2026-08-17 — check-perf-budget, data-map-coverage, export-reachability, perf-budgets, rate-ceiling, retention-windows, verify-runner) plus the app-side lockstep guards (`markdownImportPrompt`, `blockTypeGuards`, `importFormatRegistry`).
- Test counts quoted in STATE vs actual `pnpm test`.
- README deliberately carries no build status — confirm none crept in. Its CI paragraph describes a *mechanism*, which is durable and fine. Confirm the add-a-block-type checklist still matches the real wiring surface.

## Report format

Lead with a one-paragraph TLDR (clean / N findings). Then:
- **Confirmed drift** — doc says X, code/reality says Y, with `file:line`, ranked by blast radius. **CLAUDE.md first** (it steers every AI session), then anything counsel reads, then STATE, then design docs.
- **Long-term risks** — trends and process hazards, each with a concrete recommendation.
- End by offering to apply the mechanical fixes as one docs commit, leaving structural items for discussion.

**Report your own false positives.** If a finding dissolves on closer reading, say so in the report rather than quietly dropping it — a checklist that produces phantom findings gets trusted less than one that admits them, and the phantom usually points at a real gap in the *method* (the `**Status:` grep, 2026-08-17).

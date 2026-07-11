---
name: drift-audit
description: Audit the repo's documents against code and each other for drift — version constants, bundle sizes, design-doc status lines, ROADMAP annotations, STATE internal contradictions, kit-manifest sync. Report findings ranked; fix only the mechanical items when asked. Run after a few shipped sessions or ~monthly.
---

# Drift audit

Compare what the documents claim against what the code does, and the documents against each other. The output is a ranked findings report (confirmed drift first, then long-term risks), NOT fixes — fix mechanical items only when the author says to, and bring structural items to discussion. This skill encodes the 2026-07-10 audit method that found stale version constants, "not implemented" status lines on shipped features, and superseded architecture sketches.

## Ground rules

- Precedence when sources disagree: **code > STATE.md > ROADMAP.md** (ROADMAP's own charter says so). A doc contradicting code is drift in the doc, not a bug in the code.
- "Mechanical" fixes (safe to apply on request): stale constants/sizes, status lines, pointers, annotations. "Structural" issues (discuss first): checklist gaps, budget trends, process hazards.
- When fixing a doc that pins a number the code owns, prefer pointing at the source file over re-pinning ("the current value lives in `storage.ts`") so it can't rot again.

## Checklist

Work through each item; skip none silently — say "clean" per section in the report.

**1. Version constants.** Read the truth from source, then grep every doc that mentions a version for agreement:
- `STORAGE_SCHEMA_VERSION` in `packages/renderer/src/runtime/storage.ts`
- wire `schemaVersion` in `packages/renderer/src/runtime/submission.ts`
- accepted wire versions in `supabase/functions/ingest-submission/index.ts` (must accept all prior versions and the current one)
- Check: CLAUDE.md, packages/renderer/RUNTIME.md (ALL sections, not just the storage one — the graph/MC/matching sections quote versions too), STATE.md, docs/DECISIONS.md.

**2. Bundle sizes and budget.** `pnpm bundle:renderer` prints the real sizes (or read `wc -c` on `packages/renderer/src/runtime/generated/*.ts` as a proxy). Compare against every doc that quotes a size or the budget numbers: RUNTIME.md's bundle-size paragraph and budget sections, CLAUDE.md, DECISIONS.md ("Runtime size budget amendment"). Flag if a variant is within ~15% of the soft target — the budget ladder (DECISIONS) should be scheduled, not discovered.

**3. Design-doc status lines.** For each `docs/design/*.md`, read the `**Status:**` header and check it against STATE.md / HISTORY.md ship status. A shipped feature's doc must say SHIPPED and carry an as-built-deltas note where the implementation diverged (pattern: `vocabulary-definitions.md`, `interactive-graph-block.md`). Never delete a superseded doc that other docs cite — annotate it.

**4. ROADMAP annotations.** Shipped items get ✅/strikethrough in the at-a-glance table and phase bodies (policy decided 2026-07-11: light sweep at ship time, not annotation-free). Architecture sketches contradicted by the as-built shape get a correction note pointing at the design doc / RUNTIME.md, so future phases (2.8/2.9 cite earlier patterns as precedent) build against reality.

**5. STATE.md internal consistency.** STATE is session-appended and rots inward: look for older "Current focus" narratives that still instruct something a newer line or Status-by-area row says was retired/decided otherwise (the retired answer-surface-seam case). Also: "Standing rules" parked in Pending author actions belong in CLAUDE.md or `supabase/functions/README.md` — STATE sections get cleared. Check STATE stays near its ~150-line rule.

**6. Deploy-state sync.** `supabase/functions/_shared/graph-kit-manifest.ts` must name the hash STATE says is deployed. Migrations listed in docs match `supabase/migrations/`. Pending-action deploy ordering matches the standing rules (ingest-first on wire bumps; kit upload before publish-activity deploy).

**7. Cross-references and guards.** Every `DECISIONS →`, `HISTORY →`, and design-doc link in STATE resolves to a real heading/file. Run the existing drift-guard tests (`pnpm --filter @activity/app test -- markdownImportPrompt` covers the import doc/prompt/parser lockstep; `blockTypeGuards` + the schema columns guard cover block wiring). Test counts quoted in STATE vs actual `pnpm test` output.

**8. README durability.** README deliberately carries no build status — confirm none crept in. Confirm the add-a-block-type checklist still matches the real wiring surface (compare against the newest block type's commits if one shipped since the last audit).

## Report format

Lead with a one-paragraph TLDR (clean / N findings). Then:
- **Confirmed drift** — doc says X, code/reality says Y, with file:line, ranked by blast radius (CLAUDE.md and RUNTIME.md first — they steer every AI session).
- **Long-term risks** — trends and process hazards, each with a concrete recommendation.
- End by offering to apply the mechanical fixes as one docs commit (with the standing commit-message pattern), leaving structural items for discussion.

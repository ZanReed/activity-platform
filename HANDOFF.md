# Handoff — 2026-08-31

Paste the block below `PASTE FROM HERE` into a new chat. Everything above it is
context for a human deciding whether the handoff is accurate.

---

## What happened in the session that wrote this

**The catalogue's organization was aligned with the curriculum model, built, and
cut over** — and most of the session was an eleven-letter correspondence with the
curriculum side, not coding. Five commits, `a3d1b35`..`3eed4eb`.

The platform half: declared identity (`key:` + migration 0041), skill ids and a
skill registry, part counts, `chain_role`, a chain registry, the `x_` reserved
namespace, a detector for a live answer leak, a generated authoring prompt, and a
parts-aware coverage burndown. All of it verified against the real database
rather than against the script's own summary.

**The correspondence is the part worth reading.** Both sides corrected the other
on things neither side's tests could have caught, because each defect lived in
the half of the contract the other owns. That is written up in STATE's footer and
it is the durable lesson.

**A drift audit closed the session: 4 findings, all self-created, all fixed.**

## What the next session should know before trusting anything here

- **`HANDOFF.md` is REPLACED, not appended** — a transient baton, not in
  CLAUDE.md's doc map.
- **The author pushed mid-session, up to `c826431`.** Only the final close-out
  commit is unpushed. Verified with `git ls-remote`, not the local ref — the
  local `origin/main` can lag, and this repo has been misled by it before.
- **Nothing is owed to the author.** 0041 is applied (they applied it), no deploy
  is owed, no republish is owed.

---

# PASTE FROM HERE

I'm picking up the activity-platform repo cold. Read CLAUDE.md, then STATE.md,
then TODOS.md.

## Where things stand (2026-08-31, `main`, one commit unpushed)

**The curriculum-alignment arc is DONE and cut over.** Design + every ruling:
`docs/design/curriculum-alignment.md`. Migration 0041 is applied live.

The four pilot activities now live at `01-chain.rate.proportional/0N-*.md`,
each carrying a declared `key:`, and they followed their files there from
`year-8/rates-and-proportional-relationships/` **without orphaning a row** —
which is the whole point of the slice and was proved by doing it.

Run the catalogue with:

```
pnpm import:batch ~/activity-catalogue-pilot --owner <email> --dry-run --strict \
  --registry ~/activity-catalogue-pilot/misconception-registry.txt \
  --skills-registry ~/activity-catalogue-pilot/skill-registry.txt
```

Exit 0. Last run (registries at graph v0.12.5): **3/47 skills covered · 3 of 51
parts authored · 44 uncovered by name · 13 bindings across 4 ids · zero warnings
of either kind.** Four registry installs across the week each produced a
byte-identical manifest — that no-diff is the check, not the exit code.

## The five things most likely to be misunderstood

1. **The path fallback is not merely the keyless case.** It is how a keyed file
   ADOPTS a row that predates the column, which is the entire cutover. A
   key-only matcher turns the first run into N creates and N orphans. Both arms
   are pinned in `scripts/tests/batch-import.test.mjs` §K.
2. **`role` / `type` / `chain_role` are three different axes** — Bank trust
   label, presentation format, position in chain. A consolidation is still
   `role: lesson`. CLAUDE.md carries the rule.
3. **A consolidation names its chain's terminal skill without teaching it**, so
   it is excluded from that skill's parts and from the burndown numerator.
   Counting it would report a fully-taught skill as partial forever.
4. **`covered` counts whole skills and stays FLAT while a multi-part skill is
   half-written.** The number that moves is *parts authored / parts declared*,
   and its denominator counts skills the corpus has never named.
5. **Do not regenerate `misconception-registry.txt` from the graph without
   merging first.** That ordering saved 13 live bindings once already; it is now
   a standing step on the curriculum side.

## Open work, in the order it is worth doing

**Lane B — sort the activities list by catalogue path.** Designed, not built,
TODOS carries it with two verified traps (the query must keep its `updated_at`
order because the recency strip slices that array; and it supersedes the
list-surface D5 naming convention). It is what keeps chain ordinals out of
student-visible titles, and `unit` is student-visible in BOTH surfaces —
verified, `StudentViewer.tsx:556` and the print layer.

**The drift audit has no section for generated author-refreshed artifacts.**
Filed 2026-08-30, structural, deliberately not applied unilaterally.

**Everything else in TODOS is unchanged** and none of it blocks authoring.

## What is owed by whom

| | |
|---|---|
| **Author** | Nothing. Push when ready. |
| **Platform** | Nothing open. |
| **Curriculum side** | Nothing owed to us. All four registries are installed and generated through their notation gate (graph v0.12.5). Still theirs: one misconception carrier needs a restructure rather than a wish; the `transform.translate` activity (plan 73→74); alignment fields as arrays; two hooks for `chain.rate.proportional`; then chain 2. |

## The curriculum side, and where the shared record lives

The catalogue is authored by a **separate curriculum-side agent** with its own
repo, decision log and skill graph. This repo never reads that graph — it
consumes only the registries generated from it, and that boundary was defended
hard enough in correspondence that it is worth keeping.

**Their `boundary-page.md` is the shared surface**: open items with an owner and
a landing artifact, a numbered correspondence index, and a retractions table for
both sides. Three rules on it that were paid for —

- **An item is not closed until the artifact contains the change; close it by
  quoting the artifact, not describing it.** (Our own version of this is *a guard
  must bind to output, not a declaration* — same rule, reached independently.)
- Each side edits only rows it owns; a claim about the other side's system is a
  question, not an entry.
- If a file you do not own looks wrong, **file it — do not fix it.**

⚠ **Letters can go missing silently.** One platform letter never arrived and its
questions were asked again two exchanges later, with neither side aware. That is
what the numbered index is for.

**Four claims this side made and retracted are in
`docs/design/curriculum-alignment.md` §5e** — recorded there because they
otherwise live only in the other side's file.

## Traps that cost this session real time

- **A guard can be vacuous in the documented way and still feel finished.** The
  "nothing catalogue-only reaches the document" test parsed the importer's own
  return value instead of the merge path, so it proved zod strips unknown keys
  and nothing else. Mutation found it in minutes; review would not have.
  **Watch every new guard fail once, on the day you write it.**
- **An example is a claim.** Two skill/chain ids invented as format
  illustrations were read as real by the other side; one nearly got ratified
  into their registry. Mark illustrative things illustrative.
- **Route errors on what the system NAMED, not on a substring.** The importer's
  missing-column refusal matched a column name inside the request URL — which
  carries the whole `select=` list — and confidently named a migration that had
  been applied five days earlier.
- **A metric computed over an authored corpus measures authoring order.** Our
  near-duplicate detector has never fired at 4, 22 or 35 ids, so the evidence we
  gave the curriculum side for their D21 could not distinguish "working" from
  "never at risk". Retracted.

## House rules that bite hardest here

- Never `git push` — the author pushes. Check `git branch --show-current` is
  `main` before committing.
- `pnpm verify` is the definition of done for CI's check job. It is 8/8 now.
- A schema change means both bundles regenerate in the SAME commit and a
  redeploy is owed. **Nothing this session touched schema** — the catalogue
  fields live in the importer and the manifests, never in the document.
- After changing `catalogueAuthoringPrompt.ts` or the meta fence it teaches, run
  `pnpm prompt:catalogue` and commit the regenerated doc.
- STATE.md is measured in WORDS (~1,500 target, 4,000 ceiling, currently 3,659).

## Start here

Read `docs/design/curriculum-alignment.md` §5–§5d before touching
`scripts/batch-import.mjs`. Then run the dry-run above — it should exit 0 and
report 3/47 and 3/51. If it does not, something moved and that is the first
thing to understand.

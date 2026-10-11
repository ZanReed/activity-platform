# Practice banks — the bank file format and its import (D43, design pass)

**Status:** DESIGN PASS 2026-10-12 — **ALL TWELVE (PB-1…PB-12) RULED AS
RECOMMENDED by the author 2026-10-12 ("yes to all").** The format was sent to the
curriculum side as B-160 and **AGREED in C-123** with two discrimination-bank
amendments and the PB-6 spelling (section at the end; reply owed as B-161).
Next: an eng review (`/plan-eng-review`) of the build, then the build in the
PB-11 scope.
Parent: [practice-blocks.md](practice-blocks.md) (premise 6: "bank items use the
existing markdown format in a new practice file kind keyed by `skill:`, with a
per-session seed", ACCEPTED by the curriculum side as answer 6, with two format
asks). Trigger: the pass was ruled to run "when the first banks exist"; chain 1's
four banks exist (author ruled the pass 2026-10-12).

## What exists (read, not assumed — P10)

- **The four chain 1 banks** (curriculum zip `drafts-2026-10-06.zip`, sha256
  `0cf5cfbb…b438`, unpacked as data): `rate.unit-rate.md`,
  `rate.constant-of-proportionality.md`, `rate.proportional-graph.md` (6 templates
  each) and `chain.rate.proportional.discrimination.md` (3 fixed items), plus the
  builder's `README.md`. They use ONLY shipped catalogue syntax: a ```meta fence,
  ONE ```seed fence per file, `## t1`-style sections, `{{=expr | !expr :: … ::
  mis.*}}` blanks, ```mc, ```graph, glossary `[[term]]`. The undesigned wrapper
  rides in `x_` keys the importer ignores today: `x_kind: bank`, `x_chain`,
  `x_templates` (labels kept off the student-visible heading), `x_misconceptions`,
  and, on the discrimination file, `x_role: discrimination` +
  `x_confusable_skills`.
- **Their checker** (`tools/check_bank.py` at curriculum `3418bba`) enumerates
  EVERY seed combination (variables are drawn independently) and checks: each
  answer and `!mistake` expression evaluates (exact Fractions); answers ≤ 2
  decimal places, mistakes ≤ 3; a mistake never equals its answer at any seed;
  every `{name}` is declared; unit blanks read for value; it prints each
  template's answer range for a human (§11). All four banks pass.
- **What the platform already does with that syntax** (as built, wishlist #6):
  the ```seed fence lands on `meta.seedVars`; values derive from
  `serveSeed(versionId, studentId) + ':' + name` (seeded-data D3); substitution is
  server-side at serve; and — the fact that makes these banks work at all —
  **seeded MISTAKE matchers are evaluated per student at grade time**
  (`viewer/src/server/grading/seededKeys.ts`, ruling R3), so `!vh/vd` fires on
  each student's own wrong value. Seeded graph keys are out (seeded-data D5),
  which is why their graph templates are fixed.
- **Their two asks** (answer 6): (a) constraints between seed variables;
  (b) a way for a discrimination item to name its confusable skills.
- **What is NOT built:** any bank store, any bank import path, per-session
  seeding, mixed practice (gated on two chains with ratified banks).

## Decisions (numbered; each with a recommendation)

**PB-1 — Where bank files live.** (a) `banks/<chain-folder>/<skill>.md` in the
catalogue, mirroring the activity folders (their proposal); (b) inside the chain
folder (`801-…/banks/…`); (c) a separate catalogue root.
**Recommend (a).** The batch importer already walks the catalogue; a top-level
`banks/` tree keeps every activity folder's teaching order (file paths) free of
non-activities, and the chain-folder name ties a bank to its chain without a new
key.

**PB-2 — How a file declares it is a bank.** (a) the location alone; (b) an
explicit catalogue-only meta key `kind: bank`; (c) both, and a mismatch is an
error.
**Recommend (c).** The failure this prevents is a bank imported as an activity
(or an activity silently skipped as a bank). Location is the convention, the key
is the declaration, and disagreement fails the file by name — the
"two-spellings" guard pattern.

**PB-3 — Item identity.** Mixed practice, spacing and any per-student record
need a stable id per template. (a) the section heading: `rate.unit-rate#t1`
(their open question); (b) an explicit `id:` line per section; (c) a content
hash.
**Recommend (a), with the house id rules:** the id is `<skill>#<heading>`,
headings match `[a-z][a-z0-9-]*`, are unique within the file, and are NEVER
reused after removal (a retired-ids ledger on their side, as for skills,
glossary and hooks). Renaming a heading is a new item and the old one retires —
retire-not-rename, the same rule every other id here follows. (c) is rejected:
editing a typo would orphan the item's history.

**PB-4 — Where items are stored.** (a) as activities (one per bank file);
(b) a new owner-scoped store, `practice_item`, mirrored like the glossary and
hooks: one row per template (owner, item id, skill, chain, role, status,
converted content, seed spec, fingerprint, retired_at), written by a
`sync_practice_items` RPC with the dry-run/retire/mass-retire semantics the other
mirrors already have.
**Recommend (b).** A bank is not an activity: it is never assigned, published to
a class, or listed in the Bank. Activities would drag publish, drafts and
`source_key` semantics in for nothing. The mirror pattern is proven three times.

**PB-5 — Seeding per item.** Their files hold ONE ```seed fence for the whole
file, with distinct names per template. (a) keep that, and the importer assigns
each template the variables it REFERENCES; (b) require a seed fence per
template section.
**Recommend (a).** It is the shipped grammar unchanged, and per-template
variable sets fall out of the references the importer already validates
(seeded-data D7). A variable referenced by two templates is a WARNING (two
templates would then share a draw), unused variables already warn. Per-session
values (the "per-session seed" of premise 6) are a SERVING concern, designed with
mixed practice — the stored item only needs its seed spec.

**PB-6 — Ask (a): constraints between seed variables.** (a) DERIVED variables —
`k: = vd / vh` — an expression over earlier variables, evaluated in order;
(b) a `where:` line per template — a predicate over its variables, with
rejection sampling; (c) both; (d) neither yet.
**Recommend (c), built WITH this slice, because the importer must check them.**
Derived variables cover their two fixed-for-now cases (a proportional table's
`y = k·x` rows; a ratio that must invert cleanly); `where:` covers divisibility
and degenerate exclusions. Both are bounded: the importer ENUMERATES every
combination (their tool already does, at 12–48 per template; a cap of, say,
10,000 per template refuses a pathological fence) and REFUSES a template with
NO valid combination. ⚠ This changes the SHARED seed grammar, so activities gain
it too; the derivation runs in both Edge Function bundles (serve + grade), so it
carries both redeploys and the seeded-data determinism guard (D8) must be
extended to derived values.

**PB-7 — Ask (b): discrimination items.** (a) a discrimination BANK keyed by
chain: `kind: bank`, `role: discrimination`, `chain: chain.x`, `discriminates:
skill, skill, skill` (≥ 2, all registered, all in that chain), and NO `skill:`;
(b) keep `skill:` as the consolidation's skill and add `confusable_skills:`
(their current shape).
**Recommend (a).** A discrimination item is about telling skills apart; giving
it one primary skill is the misattribution their ask exists to avoid, and
`skill:` already means "the one skill this teaches" everywhere else. How a
discrimination answer credits each named skill is a MIXED-PRACTICE decision,
deferred; the store keeps the list.

**PB-8 — What the importer validates (the correctness half of check_bank).**
Per template, over every valid seed combination: every answer and mistake
expression evaluates; a mistake never equals its answer; every `{name}` is
declared; a template has ≥ 1 graded response. Bindings are checked against the
misconception registry as for activities.
**Recommend: these, as warnings (`--strict` fails).** The decimal-place rules
(≤ 2 answer, ≤ 3 mistake) and the §11 "is the context real" range report are
AUTHORING judgements and stay in their tool — the platform enforces what would
make an item ungradable or a binding dead, not house style.

**PB-9 — What an item may contain.** (a) any blocks; (b) auto-scorable
responses only: numeric/text blanks (including unit blanks and `\gap{}`), ```mc,
```match, ```order, ```graph, ```numberline; prose, math and glossary marks
around them; NO shortanswer/essay/explain/free text, NO worked or faded
examples, NO teacher-guide.
**Recommend (b)** — it is their §17 rule ("auto-scorable only") enforced where
it can't drift: a bank item with an ungradable block is refused by name.

**PB-10 — Status / ratification.** (a) catalogue-only meta `status: draft |
ratified`, stored per item and set per file; mixed practice serves only
`ratified`; (b) no status — everything imported is live.
**Recommend (a).** "Two chains with RATIFIED banks" is the gate premise 8 names,
so the store has to know which banks are ratified. Who ratifies is theirs
(their D6 read and the author); the platform only reads the word.

**PB-11 — Scope of the first build.** (a) import + store + validate + a TEACHER
PREVIEW of each item with a sample seed (so a bank can be read on the real
renderer before it is ratified) — no student serving; (b) all of that plus
serving in mixed practice.
**Recommend (a).** Mixed practice stays behind its gate (two chains with
ratified banks); (a) is what lets chain 1's banks BE ratified against the real
importer and renderer. Preview reuses the activity viewer's block renderers.

**PB-12 — The capability row.** Banks are not a fence, so the pinned
`capability-facts.json` (B14) does not list them. **Recommend: no row until
serving ships** — a capability is authorable when students can receive it; the
file format is agreed by letter, as the arrowhead syntax was.

## What changes for the curriculum side (the letter, after the rulings)

- Promote the `x_` wrapper to real keys: `kind: bank`, `status:`, and for the
  discrimination file `role: discrimination`, `chain:`, `discriminates:` (no
  `skill:`). `x_templates` / `x_misconceptions` stay `x_` (notes for humans).
- Files move to `banks/801-chain.rate.proportional/…`.
- Headings become ids: unique, `[a-z][a-z0-9-]*`, never reused — a retired-ids
  ledger for bank items.
- The seed grammar gains derived variables and `where:` (PB-6), so their three
  fixed-for-want-of-constraints items can become parametric.
- Their tool keeps the decimal-place and §11 checks; the platform's importer
  takes over the correctness checks (and their tool can keep them as a
  pre-check).

## Not in this pass

Mixed practice itself (scheduling, spacing, per-session seed derivation, how a
discrimination answer credits skills, the per-student record) — its own pass,
behind its gate. Seeded graph keys (seeded-data D5) stay out.

## Curriculum agreement — C-123 (2026-10-12), received at session close, NOT yet answered

**Agreed: PB-1…PB-12**, with two amendments for the discrimination bank and the
PB-6 spelling. Reply owed as **B-161** by the next platform session; the two
amendments look like straight extensions of PB-1/PB-3 but get the author's
glance before the eng review.

- **Amendment (a), PB-1 file name:** a discrimination bank is
  `banks/<chain-folder>/<chain-id>.discrimination.md` (e.g.
  `banks/801-chain.rate.proportional/chain.rate.proportional.discrimination.md`)
  — one per chain. The importer refuses a `role: discrimination` file under any
  other name, and a skill bank whose file name is not its `skill:`.
- **Amendment (b), PB-3 ids:** `<chain-id>.discrimination#<heading>` (e.g.
  `chain.rate.proportional.discrimination#d1`) — file stem + heading, the
  skill-bank rule; cannot collide with a skill id.
- **PB-5:** no variable is shared between templates in any of their three skill
  banks (checked). **PB-3:** their ledger is `bank-item-ids-retired.txt` in the
  curriculum repo; check_bank fails on reuse.
- **PB-6, their proposed grammar — everything stays INSIDE the one ```seed
  fence:**
  - DERIVED: `name: = expr` (leading `=`), over EARLIER names only, evaluated in
    order, never drawn; a later reference is refused; a template that references
    a derived variable implicitly references its sources (for PB-5's sharing
    check and PB-8's enumeration).
  - CONSTRAINT: `where <heading>: <predicate>` scoped to one template in a BANK
    (heading must exist; predicate may use only that template's variables,
    derived included); an UNSCOPED `where:` is REFUSED in a bank (it would
    couple templates) and is the ONLY form allowed in an ACTIVITY (no headings).
    Several `where` lines for one scope AND together.
  - PREDICATE: a boolean in the existing mathjs expression language (`== != < <=
    > >= and or not`, plus the already-allowed functions `mod gcd lcm round floor
    abs …`) — no new evaluator.
  - RESERVED: `where` joins RESERVED_SEED_NAMES.
  - ENUMERATION: every combination, a per-template cap, refuse a template with
    no valid combination; their check_bank enumerates identically and also
    reports the share of combinations a `where` rejects.
  - Example from their letter:
    ```
    vh: list 2, 4, 5
    vd: int 60..200
    k: = vd / vh
    where t6: mod(vd, vh) == 0 and cp > 2.5
    ```
- **Their question 4 — confirm in B-161:** bank FILES land in the CATALOGUE
  (the pilot), like activities; the curriculum repo gets only the ledger and the
  tool. (That matches PB-1: the importer reads banks from the catalogue.)

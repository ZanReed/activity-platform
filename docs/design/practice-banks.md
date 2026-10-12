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
    where t6: cp / cn > 0.4 and cp > 2.5
    ```
    (C-123 ERRATUM: their first example's `where t6: mod(vd, vh) == 0 …` broke
    the scope rule — `vd`/`vh` are not t6's variables. The rule stands: a
    scoped predicate uses only its own template's variables. The importer
    must refuse exactly that mistake.)
- **Their question 4 — confirm in B-161:** bank FILES land in the CATALOGUE
  (the pilot), like activities; the curriculum repo gets only the ledger and the
  tool. (That matches PB-1: the importer reads banks from the catalogue.)

## Eng review — 2026-10-12 (`/plan-eng-review`) — BE-1…BE-12 ALL RULED AS RECOMMENDED by the author 2026-10-12 ("yes to all"); sent to the curriculum side as B-162 (BE-2 needs their yes)

Scope reviewed: the PB-11 build (import, store, validate, teacher preview; no
student serving), with the focus on PB-6. Re-derived against shipped code
(P10). An independent second reviewer (a subagent, since Codex is not
installed) challenged the draft. Every claim of its that the rulings below rest
on was re-checked by hand. Receipts are given inline. "Measured" means a probe was run.

### What the code says (the facts the rulings rest on)

1. **The shipped evaluator cannot run the agreed predicate language.**
   Measured with `compileFunction` (`graph-kit/src/evaluate.ts:291`):
   `7 == 7`, `3 < 4`, `3 != 4`, `1 and 0`, `not 0` → no parse;
   `gcd(12, 8)`, `lcm(4, 6)` → NaN. The instance is built from arithmetic
   dependencies only (`evaluate.ts:124-136`), and its function table has no
   gcd/lcm. So C-123's "existing mathjs language, no new evaluator" is false
   here. B-161 repeated that claim without checking it, so B-162 must correct it.
2. **The two sides disagree on `round` and on exactness.** Their `check_bank`
   (PR #68 @ `6efebdf6`) uses `round(Fraction(a))`, which is Python's
   half-to-even rounding (2.5 → 2). Ours is `Math.round` (`evaluate.ts:177-180`, 2.5 → 3).
   They compute in exact Fractions and we compute in doubles: `0.1*3` =
   0.30000000000000004. `formatSeedValue` is a bare `String(v)`
   (`seedValues.ts:68-71`), so a derived `{t}` could render as float noise.
   Also, `mod(x, 0)` returns x here, while Python raises an error.
3. **The read bundle has no evaluator.** `viewer-server.bundle.js` is 1,089,490 B
   with no mathjs. The ceiling is 1500 KiB (`perf-budgets.mjs:53`). A
   standalone build of `compileFunction` is ~338 KiB [measured]. So deriving
   values at serve time would put the bundle at ~1,400/1,500 KiB [estimated]
   and undo the read/grade split.
4. **Both bundles contain `RESERVED_SEED_NAMES`** (`seed-vars.ts:24`;
   "this name is reserved" greps once in each bundle). Any edit to the activity
   seed schema is a re-bundle plus two redeploys.
5. **The fence parser cannot read the new lines, and it fails soft.**
   `markdownToTiptap.ts:3576` is
   `/^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.*)$/`. `where t6: …` does not match.
   `k: = vd / vh` falls to a skip. An unscoped `where:` parses as a variable
   called `where`. All three only warn.
6. **The reference sweep misses mistake matchers.** `validateSeedReferences`
   collects expression references from `blank.answer` / acceptable answers
   (`markdownToTiptap.ts:3655-3670`), not from `mistakeFeedback[].match`.
7. **A claimed guard does not exist.** `seed-vars.ts:14-17` says
   `evaluate.test.ts` checks that every bare-name builtin is reserved. The file
   exists (`graph-kit/tests/`) but carries no such guard (P11; corrected at
   build — the review first said the file was missing). `ln`, `sec`/`csc`/`cot`, the hyperbolics and `factorial`
   can be called but are not reserved.
8. **The mirror pattern un-retires.** `sync_chain_hooks` sets
   `retired_at = null` on a returning id (`0057_chain_hooks.sql:165`). PB-3
   forbids reusing a bank item id.
9. **PR #68 counts its 10,000 cap BEFORE filtering** (the product of the
   referenced drawn variables' sizes, `check_bank.py:203-210`).

### Rulings (author: yes to all, 2026-10-12)

**BE-1 — A dedicated seed-expression evaluator.** Add a new node-safe graph-kit
subpath, `seed-expr`, added to the `exports` map. It is a second
`mathjs/number` instance that imports evaluate.ts's function table (so `log`,
`round` and `floor` mean exactly what they mean in answer keys), plus the
relational (`== != < <= > >=`) and logical (`and or not`) operators, plus
`gcd`/`lcm`. Equality uses mathjs's epsilon. The calculator is unchanged. It
is the same library, so there is no new expression language, but the
platform's implementation is the authority. `round` rounds halves UP
(`floor(x + 1/2)`: 2.5 → 3, −2.5 → −2 — the calculator's `Math.round` too), and
B-162 tells them so they can match. *(Corrected 2026-10-12: this line first said
"half away from zero", which neither side does.)*

**BE-2 — Derived/`where` are BANKS-ONLY in this slice; activities are
deferred with a trigger.** This applies the "a wish gets a trigger, not a
slot" rule. No activity uses the new grammar, and supporting it on the serve
path costs ~300 KiB on every open (fact 3). Banks get their own seed schema
type in a module neither bundle imports, and `where` is reserved there only. So
the activity schema, both bundles and both Edge Functions are UNCHANGED, and
there are NO redeploys this slice. In an activity file, a derived line or a
`where:` line is a HARD ERROR, even without `--strict`. Trigger: the first
authored activity that needs either one. This needs the curriculum side's
yes, because C-123 lists unscoped `where:` as the activity form (B-162 asks).

**BE-3 — Store each template's VALID-COMBINATION TABLE at import.** Serving
and grading then become a table lookup with no evaluator, and they cannot
disagree with the importer or with each other. The lookup is index =
hash(`<seed>:<item id>`) mod rows. Canonical order: drawn variables sorted by
name, each value list in its authored order, the cartesian product in that
order. Derived values are rounded to 12 significant figures, so the table
holds no float noise. The order rule goes in the letter so their tool can
reproduce row counts. This replaces deriving at serve time, which is what
removes the D8 serve/grade risk for banks: there is one table and one index
function.

**BE-4 — Pin the item revision into the lookup.** A `practice_item` row is
updated in place, unlike an immutable `versionId`. So the content fingerprint
goes into the stored row, and a future serve/grade pair must name it.
Serving is out of scope, so this slice only stores the fingerprint and
documents the rule.

**BE-5 — Per-template variable sets, built properly.** A template's set is
every variable it references in prose, answers, acceptable answers and
MISTAKE matchers (fact 6), plus the transitive sources of any derived
variable. `where` lines never add to the set, so the C-123 erratum case is
refused. The cap is 10,000, counted before filtering over that set, matching
PR #68. `sample` variables are refused in banks. A divisor range containing 0
is refused for `mod`, `/` and `gcd`. Any combination with a non-finite derived
value is refused. A template with zero valid combinations is refused.

**BE-6 — The decimal checks stay theirs, plus one noise check.** We keep no
decimal-place rule (PB-8), and a `+- tol` tolerance is split off before
evaluation, so `{{=ct/cn +- 0.005}}` never warns (this answers C-125's
question). We add one check: a derived value referenced in prose whose rounded
form still has more than 6 decimal places warns (`--strict` fails). Our side
is the only one that renders.

**BE-7 — A new parse path for bank fences.** The `seed` fence gets a bank mode
that recognises `name: = expr`, `where <heading>: …` and refuses unscoped
`where:`. Every malformed line is an error that fails the file, not a skip.
Fix the phantom guard while we are here (fact 7): write the `evaluate.test.ts`
it claims, and reserve `ln`, `sec`, `csc`, `cot`, the hyperbolics,
`factorial`, `and`, `or`, `not`, `xor`, `to` and `in` in the bank seed schema.
The activity list widens only when BE-2's trigger fires.

**BE-8 — Store: `practice_item` (migration 0058), owner-only and
service-written.** RLS: the owner may SELECT, and there are no client
INSERT/UPDATE/DELETE policies at all, because answer keys live in the content.
Prior learning `activities-columns-client-writable` is why there are no client
write policies. Students and anon users get nothing. Writes go through
`sync_practice_items` (a service RPC with dry-run, retire and mass-retire). A
returning retired id is REFUSED, not un-retired (fact 8); `--force` overrides
it by name. `verify-0058` proves RLS denies a student and an anon caller.
`data-map.md` and `retention-policy.md` change in the same commit.

**BE-9 — Unchanged means unchanged.** The fingerprint covers id-normalised
content (reuse `contentKey`), the seed spec, the combination table and
`status`. Otherwise every re-import reports every item changed, because
conversion mints fresh UUIDs. A draft→ratified flip counts as a change.

**BE-10 — Folder routing.** The batch importer routes `banks/` to the bank
path. It never treats `banks` as a chain folder, and it refuses `kind: bank`
anywhere else and a non-bank file under `banks/` (PB-2). It also enforces the
amendment (a) file names. Until this ships, they place nothing there (C-124
item 2 agrees).

**BE-11 — Teacher preview on `/chains/:chainId`.** It is lazy-loaded and
client-side, with no Edge Function. It renders in print mode, as
`BankPreview` does, so there is no Check button. For the sample it shows the
answer key and each mistake value, because ratifying needs the answers. It
has "another sample" stepping and a "show the extremes" view (the rows with
the minimum and maximum answer), and the valid/total count per template. The
discrimination bank shows on the same page.

**BE-12 — Cross-check fixtures.** PR #68's fixtures (`rate.unit-rate.md`,
20/24 and 11/12 valid; the five `bad-bank-*` files) are copied into importer
tests with their source commit recorded. Each must be accepted or refused for
the same reason on our side. A divergence is a letter, not a local patch.

**Structure (complexity gate):** about 14 files and 3 new modules (`seed-expr`,
the bank parse and enumeration, the preview). BE-2 is the shrink. Without it,
the slice also touches both server handlers, both bundles, the D8 guard and
two redeploys. No smaller arrangement keeps BE-3 and BE-8.

### Not in scope (recorded)

Serving, per-session seeds and mixed practice (gated). Derived/`where` in
activities (BE-2's trigger). The capability row (PB-12). Seeded math (R2's
trigger stands).

## As built — 2026-10-12 (platform `0a5dc56c`, local, unpushed)

BE-1…BE-12 built in the PB-11 scope. `pnpm verify` green (8/8 gates); **both
Edge Function bundles byte-identical** (the drift gates are the proof of BE-2:
nothing to redeploy). verify-0058 green on the LOCAL stack (7 posture rows,
B 7/7, C 10/10). The four chain 1 drafts, reshaped to the agreed keys in
scratch, import clean: 21 items, 1–48 combinations per template; one warning
(`db` declared, unused, in `rate.proportional-graph`). The full mirror
lifecycle was run on the local stack — apply 21 new; no-op re-run writes
nothing (`updated_at` unmoved); a dropped template retires; its return is
REFUSED (exit 1); `--force` re-admits — then the residue was deleted (P7).
The preview was checked in a real browser against the local stack.

**Where it lives:** `graph-kit/src/seed-expr.ts` (subpath `./seed-expr`),
`schema/src/bank-seed.ts` (subpath `./bank-seed`, never in the barrel),
`app/src/lib/bankSeed.ts` + `bankImport.ts` (pure), `scripts/batch-import.mjs`
(`planBankFiles`, routing, mirror), migration 0058 + `scripts/verify-0058.sql`,
`app/src/lib/practiceBank.ts` + `components/BankItemPreview.tsx` + the chain
page's "Practice bank" section.

**Deviations from the rulings, each deliberate:**

- **BE-1 — a tree walk, not a second mathjs instance sharing evaluate.ts's
  table.** Sharing the table meant editing `evaluate.ts`, which the GRADING
  bundle carries — a byte change there breaks BE-2's "no redeploys". Instead:
  mathjs's parser plus an explicit walk over a closed grammar that owns the
  agreed semantics (half-up `round`, epsilon equality, zero divisors throw).
  A parity test pins the shared arithmetic against `compileFunction` over a
  grid, so a derived value and an answer key over it cannot disagree.
- **BE-5 — no static "divisor range contains 0" rule.** Enumeration is
  exhaustive, so a zero divisor at ANY combination already fails the template,
  naming the row — exactly where their check_bank fails (C-127 noted the
  difference; it is gone).
- **BE-7 — the reserved-names guard is bound to the REAL table:**
  `evaluate.test.ts` parses evaluate.ts's `math.import` block and `create()`
  dependency list and proves each name callable; the activity list's 24-name
  gap is pinned so it cannot grow silently (widen it when BE-2's trigger
  fires). Mutation-tested.
- **BE-8 — the mirror is HELD, not partial,** when any bank file has a problem
  (a partial set would retire the broken file's items), and untouched when the
  folder has no `banks/` (a sub-folder run must not retire a whole store).
- **BE-11 additions:** the preview hides the worksheet header; it shows the
  row's values, the answer key in place, and each mistake's value with its
  binding; "Find the extremes" ranks rows by the FIRST seeded answer.

**Found while building:**

- **Two `*` in one blank broke the blank, silently** (markdown emphasis ate
  it; `{{=2*a | !2*a+b :: …}}` imported as plain text, no warning). FIXED at
  the importer the same day for every surface: blank bodies are protected from
  emphasis (`protectBlankBodies`, mutation-tested). Banks keep refusing any
  literal `{{` that survives conversion, as a backstop.
- A list authored with trailing zeros (`3.60`) renders `3.6` — the shipped
  activity behaviour, inherited. Worth a letter if money prompts need cents.
- `README.md` under `banks/` is ignored with a notice (their drafts zip had
  one), not refused.

**Fable review of `0a5dc56c` (2026-10-12), all eleven findings fixed in the
follow-up commit, each with a regression test:**

1. Derived values chained through 12-sf-ROUNDED intermediates (`m = k*b`
   stored 0.999999999999). Now the scope keeps full precision — later derived
   variables and the predicates read exact-within-epsilon values, matching
   check_bank's Fractions — and only the STORED value rounds.
2. PB-8 skipped a LITERAL mistake on a seeded answer (`!4` vs `a*2` at a=2);
   it now compares whenever either side is seeded.
3. `declaresBank` missed CRLF files, so a misplaced bank could import as an
   activity; it now uses `scanSourceKey`'s fence discipline.
4. `NaN` / `Infinity` parsed as constants in predicates; refused.
5. verify-0058 never checked the definer's `search_path` pin; row added and
   mutation-tested (unpinned → red, restored → green).
6. `list 0x10` parsed (Number() takes hex/binary/octal); decimal literals only.
7. A duplicate item id across two files held the mirror but exited 0; both
   files now SKIP (exit 1).
8. **Ruling detail changed (author to confirm):** BE-8 put "re-admit a retired
   id" under `--force`, which also overrides the activity drift guard — one
   re-admit would force-overwrite every hand-edited activity in the run. It is
   now its own flag, `--allow-unretire`.
9. BE-1's text said "half away from zero"; both sides round halves UP. Text
   corrected; behaviour and parity unchanged.
10. A zero divisor guarded by an earlier `and` term short-circuits (Python's
    `and` does too) — "guard first" goes in the letter, no code change.
11. An explicit `role: skill` was refused; accepted.

**Not built (by ruling):** student serving, per-session seeds, mixed practice,
the capability row (PB-12), derived/`where` in activities (BE-2's trigger).

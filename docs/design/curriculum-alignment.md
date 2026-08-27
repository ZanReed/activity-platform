# Curriculum alignment — declared identity, chains, and skill coverage

**Status:** 🔨 **LANE A BUILT 2026-08-26** (migration 0041 prepared, not yet
applied — see Pending author actions in STATE.md). Lane B (the activities-list
sort) is designed here and **not built**.

Ruled through a full `/plan-eng-review` plus a written exchange with the
curriculum builder — the project outside this repo that owns
`curriculum-architecture.md`, the misconception registry and the drafting
prompts. Four letters, twelve positions moved, four of them ours reversing.
The correspondence is the *record*; this document is the *decision*.

---

## 1. The problem, in two facts

Both verified against code on 2026-08-25, not read off prose.

**1. The file path was the activity's database identity** (0038 D1). Moving,
renaming or splitting a `.md` orphaned its row and created a new one, stranding
the published history. The catalogue is authored against a curriculum model
whose first rule is that **skills are durable and activities are disposable** —
they get split, rewritten and re-filed. So every editorial act that model calls
normal was destructive here.

**2. The platform could not record a skill id at any grain.** `skills` is
declared on blocks and on `ActivityMeta`; nothing authors one and nothing reads
one. The builder reports "47 skills in the graph, 0 covered" — and because that
count is computed rather than stored, it would have kept confidently reporting
zero forever rather than failing loudly.

The path also encoded exactly the two things the model calls disposable and
omitted the one it calls permanent:

```
year-8 / rates-and-proportional-relationships / activity-01-unit-rate.md
  │            │                                    │
  │            │                                    └─ ordinal: a split forces renumbering
  │            └─ a "unit": not one of the model's five entities
  └─ a band: dual and deliberately unsynced, so a folder can only privilege one
```

The **chain** — permanent, and the owner of both ordering and the hook pool —
appeared nowhere.

---

## 2. Where each entity lives now

| Builder entity | Lifetime | Home after this slice | Owner |
|---|---|---|---|
| Skill | permanent | `skill-registry.txt` + `skill:` / `supporting_skills:` per activity. **DAG edges, bands and misconception attachments stay with the builder** — this repo holds only the valid id set | shared |
| Chain | permanent | the **folder**, with its display title in `chain-registry.txt`. Hooks, projections and ordering-of-record stay with the builder | builder |
| Activity | disposable | a row, identified by its declared `key:` | platform |
| Misconception | permanent | `misconception-registry.txt` + `:: mis.*` bindings (shipped 2026-08-25) | builder |
| Capability | permanent | the builder's registry | builder |

**One line:** the chain becomes the folder and the unit; the skill becomes a
validated id on the activity; the activity's identity stops being its location.

---

## 3. The rulings

**R1 — identity is a declared `key:`, matched ahead of the path.** Migration
0041 adds `activities.source_key` + a partial unique index, shaped exactly like
0038's. `source_path` keeps its column and **narrows in meaning** to
organization — where the file sits, and therefore what order it teaches in.

⚠ **The path fallback is not merely the keyless case**, and reading it that way
breaks the cutover. It is also how a keyed file **adopts** a row that predates
the column: add `key:` with paths untouched, run once, and every row records its
key by being matched on the path it still sits at. A key-only matcher would turn
that first run into N creates and N orphans — the exact damage this slice
prevents. `scripts/tests/batch-import.test.mjs` §K pins both arms.

**R2 — `--strict` refuses a file with no `key:` and no `skill:`.** The catalogue
runs under `--strict`, so the corpus is provably keyed rather than habitually
keyed. Exploratory runs on an unkeyed folder still work.

**R3 → superseded by R7.**

**R4 → superseded by R8.**

**R5 — orphans are computed from what was CONSUMED**, not from a path sweep. A
keyed row can be matched by a file that moved anywhere; a path sweep would
report every moved activity as an orphan and bury the real ones.

**R6 — skill ids live in the file and the manifest, never in a column or the
document.** Three homes were considered: file + manifest (chosen); row-native
columns (a later upgrade with no rework, when a query needs it); `doc.meta`
(rejected — schema change, both bundles, `SANITIZER_REV`, two redeploys, and
curriculum vocabulary on the student wire, for no reader).

**R7 — no ordinals in student-visible strings; order comes from the path.**
`unit` is student-visible in **both** surfaces (`StudentViewer.tsx` renders
`course · unit · type`, and the same line prints on every worksheet), so a
numbered unit title puts curriculum bookkeeping in front of students twice. The
chain ordinal lives in the **folder name** (`01-chain.rate.proportional/`) and
the activities list derives group order from each group's lowest `source_path` —
the same mechanism as within-group order. **This supersedes the list-surface
D5 naming convention** ("1: Quadratics"), which existed only because there was
no order to read.

**R8 — `chain-registry.txt` in the catalogue root** maps chain folder → unit
title. The original objection (a chain descriptor could import as a
student-reachable worksheet) does not survive: `findMarkdownFiles` collects
`.md` only, which `misconception-registry.txt` already demonstrates.
**Precedence: a file's own `unit:` > the registry title > unset.**

**R9 — the `x_` reserved namespace is skipped silently**, so the builder's
item-level data lives in the activity file rather than a parallel document that
would drift from it. ⚠ Underscores, not hyphens: the meta key pattern is
`[A-Za-z_]+`, so `x-review-items:` fails the *line* match and warns on every
file forever — the precise outcome the namespace exists to prevent.

**R10 — the in-math answer leak gets a detector in the shared parser.** A
`{{…}}` inside `$…$` is absorbed into the LaTeX: the answer renders to the
student, the item is not gradeable, and the binding vanishes. Implemented at
`mathAttrs`, the one function every math surface funnels through, testing the
constructed node's LaTeX rather than scanning between `$` delimiters — the
catalogue is full of `\$6.00`, and a delimiter scan would false-positive on
prose about money. In the **shared** parser, so the teacher pasting markdown is
covered too. Known false positive, stated rather than claimed away: valid TeX
that doubles its braces (`x^{{2}}`); the message names the rewrite.

**R11 — the plural key is `supporting_skills:`.** `skill` / `skills` differ by
one character with different meanings, and the plural is the likelier typo.

**R12 — two coverage artifacts**, `docs/skill-coverage-manifest.md` (human
diff) and `docs/skill-coverage.json` (the builder's input).

⚠ **The run timestamp the builder asked for is deliberately absent**, and the
replacement is stricter. Both artifacts are deterministic, like the misconception
manifest beside them, so a `git diff` shows coverage changes and nothing else. A
timestamp compared against file mtimes is a *proxy* for staleness; the `files`
list is the thing itself — an activity authored but never imported is absent
from it, and absence is exact. What a timestamp would catch and this does not:
an existing file edited since the last run, which can only change coverage by
changing a `skill:` line, which changes these files.

**R13 — key reuse is a check, not a promise.** 0041's index excludes
soft-deleted rows on purpose (delete-and-reimport is the author's undo), so a
reused key silently mints a fresh-looking activity. The importer warns when a
key matches a tombstone. A key edited *in place* is refused as a conflict with
its own explanation, rather than failing later as an opaque 23505.

**R14 — validator rule 9 belongs to the builder** (nothing a review item
retrieves appears on the reference panel). A rule owned by a party that has
deferred it is a rule nobody runs, and with item-level skill data in the file it
is a lookup rather than semantic overlap detection.

**R15 — two lanes.** Lane A (importer, migration, registries, manifests,
detector, docs) unblocks authoring on its own. Lane B is the list sort.

**R16 — the override report fires on DIVERGENCE, never on presence.** A file
repeating its chain's title verbatim is not an override. This matters because an
assistant emits a `meta` fence on every reply: teaching `unit:` in a drafting
prompt would otherwise make 100% of files overrides and the report unreadable.
The generated catalogue-authoring prompt therefore does not teach `unit:` —
**and** the report is immune to it if that prompt ever drifts. Both, not either,
because prompt drift is the builder's own named weak point.

**R17 — the `x_` receipt is load-bearing output.** The namespace is unvalidated
by design, so the per-run line naming ignored `x_` keys is its only sensor.

**R18 — two chains sharing a display title warn.** The list groups by the unit
string, so they would silently merge into one outline group.

---

## 4. Validator ownership (the builder's §11, split)

Rules this repo owns: `mis.*` registry check · id-shape warning · `--strict` ·
distractor-on-a-non-auto-scored-type (partial) · **exactly one primary skill**
(new) · **skill id in registry** (new).

Rules the builder owns: the faded beat · chain hook count · the approval gate ·
drafts excluded from counts · DoL shape · review reach · `planting_for` ·
units in contextual DoL answers · **rule 9** (moved here 2026-08-26).

Verified 2026-08-25: this repo has no chain, DoL, locale or hook concept, and
will not grow one.

**`approved` ≢ `published`.** The builder's approval gate has two conditions: a
human end-to-end read, and no dependency on a `proposed` capability. Publishing
covers the first and cannot cover the second. The builder gates publishing on
its own dependency check; given that, the manifest's **covered (published)**
count is correct by construction with no capability knowledge here.

---

## 5. Cutover — the order that avoids every orphan

1. Author applies 0041.
2. Add `key:` to the four existing files. **Paths unchanged.**
3. One import run: matches by path, records `source_key`, adopts.
   ⚠ Their `draft_content` is NULL (publishing clears it), so this run
   **re-creates a draft** on each. Expected; it does not change what students
   are served.
4. **Now** reorganize — `01-chain.*` folders, ordinals, `chain-registry.txt`,
   `skill:` lines, `skill-registry.txt`.
5. Dry-run: expect **4 updates, 0 creates, 0 orphans**. That output is the proof.
   Any *create* means the key path failed — stop.
6. No republish owed. No Edge Function deploy, no bundle regeneration: nothing
   in `packages/schema`, the viewer's sanitize/registry source, the viewer
   server or graph-kit's scorers is touched.

**A chain rename reaches drafts, and therefore the teacher outline, on the next
import** — the list reads `draft_content->meta->>unit` first and a published row
regains a draft. The **column** stays stale until republish, and that is what
the student's published snapshot reads. The one real split-outline case is
drift-refused files, which keep the old unit until forced; the run names them.

---

## 5b. Multi-part skills are the designed shape (author, 2026-08-26)

Activities are capped at 20–25 minutes because the ACTIVITY is the unit of
scheduling — a teacher slots one into the period they actually have. The SKILL
is the unit of curriculum, and it may span two or more activities. So **a chain
whose skill count is well below its activity count is expected**, not a smell,
and "one skill carries two activities" is a designed property.

Three consequences for this repo:

- **Part order is already recorded.** Within a chain folder it is path order —
  the filename ordinal, which the list surface now reads as teaching order (R7).
  Two activities sharing a primary skill are parts 1 and 2 in the order their
  files sort. No new field.
- **The importer already supports it.** `skill:` takes one id, several files may
  name the same id, and `summarizeCoverage` holds each skill's activities as an
  array. Nothing in Lane A assumed one activity per skill.
- **⚠ Coverage currently OVERCLAIMS for a half-built skill.** The manifest counts
  a skill as covered when any activity names it as primary, so a skill reads as
  covered the moment part 1 exists. The file list makes the partial state
  visible, but the headline count does not. **Open with the builder:** declare a
  part count (legal under their D3 — a part count is a fact about intent, the
  same exception that keeps per-chain projections declared) so the manifest can
  say "covered (1/2)". Do not infer it from the chain projection; that makes a
  per-skill fact depend on a per-chain estimate.

**The first worked instance — activity 04.** We argued for minting an
integration skill ("the unit rate, k and the origin line's steepness are one
number"). Withdrawn: activity 02 teaches in its own words that k is *"the unit
rate from last lesson, renamed"*, so the three faces are two — a number and its
graph — and that is the definition of `rate.proportional-graph`. Activity 04's
review beat is a single retrieval item, which is §6's part-2 shape. It targets
`rate.proportional-graph` as part 2.

The integration node is deferred with a named trigger rather than refused: mint
it when something downstream declares it a prerequisite. That retro-fit is one
edited line and a re-import now — **the first dividend of declared identity, and
the reason a curriculum call no longer has to be right the first time.**

## 6. NOT in scope

- **A chains table, chain-id columns, hook storage.** Nothing here would read
  them; hooks are teacher-timed against classroom facts the data model cannot
  see.
- **Block- or item-grain skill ids.** They serve builder-owned rules; an id
  stored and never read is this repo's most expensive defect class.
- **Row-native skill columns.** A one-migration upgrade when a query or a
  list-surface filter needs one. No rework of the file+manifest shape.
- **Following a renamed file by guessing.** A key change reports as a conflict;
  content-hash matching is a guess, and a guess in a report is still a guess.
- **Rule 9's reference-panel check.** Builder-owned as of R14.
- **Lane B** — the list sort. Designed in R7, not built.

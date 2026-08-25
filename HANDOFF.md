# Handoff — 2026-08-25 (evening)

Paste the block below `PASTE FROM HERE` into a new chat. Everything above it is
context for a human deciding whether the handoff is accurate.

---

## What happened in the session that wrote this

**Authoring started, and the tooling met real content for the first time.** The
catalogue went from 3 throwaway fixtures / 0 bindings to **4 real activities
carrying 13 bindings** across all four ratified `mis.*` ids. The author imported
and published them; the three old fixtures were then deleted from both sides.
Verified live at every step, against the database rather than the script's own
summary.

**The first real content immediately found a defect the whole test suite was
blind to.** `{{…}}` inside `$…$` is absorbed whole into the LaTeX — no blank, no
grading, no warning, and the ANSWER plus the binding id rendered to the student.
It is an answer leak, it is universal across math contexts, and `--strict`
cannot see it. Filed in TODOS with a proposed one-line importer warning.

**A fourth instance of that defect predated the arc and reached PUBLISHED
snapshots** — `unit-3/unit-rate.md`, since 2026-08-21. It proves the leak class
reaches `activity_versions`, not just drafts. That instance is now moot (the
activity was deleted), but the CLASS is untouched and unguarded.

**The four new activities were published** (v1 each, verified clean), so the
sensor is live on student-reachable content for the first time.

**A second, smaller importer finding landed at the end:** every PUBLISHED
activity now reports a phantom `course`/`unit` change on every dry-run, because
publish clears the draft the change-preview reads. Cosmetic at 4 files, noise at
150. Filed.

**The verification method is the reusable part.** Bindings were proven by
deriving one case per binding FROM the serialized documents and running each
through the shipped `gradeSection` — then mutation-testing that harness so its
green meant something. It found 12 of 13; the 13th was missing because of the
swallow bug, which the manifest-vs-grep diff caught.

## What the next session should know before trusting anything here

- **`HANDOFF.md` is REPLACED, not appended** — like STATE. A transient baton,
  not a durable doc, and not in CLAUDE.md's doc map.
- Everything is **pushed and CI-green at `129117c`**. Confirm with `gh run list`.
- **No author actions are owed.** The one that was (a republish) was retired by
  deleting the activity instead — see below.
- The last commit here may be **unpushed**; the author pushes.

---

# PASTE FROM HERE

I'm picking up the activity-platform repo cold. Read CLAUDE.md, then STATE.md,
then TODOS.md.

## Where things stand (2026-08-25 evening, pushed, CI green at `129117c`)

**Authoring is underway — the ruling from 2026-08-24 is being executed, not
still pending.** The catalogue at `~/activity-catalogue-pilot/` now holds:

```
misconception-registry.txt                          ← the taxonomy, 4 ratified ids
year-8/rates-and-proportional-relationships/
  activity-0{1,2,3,4}-*.md                          ← the real content, 13 bindings
```

The catalogue is now ONLY real content — the three Algebra I test fixtures were
deleted 2026-08-25 (see below). A dry-run reports `0 orphans`, which is the
proof both halves of that deletion happened.

Run it with:

```
pnpm import:batch ~/activity-catalogue-pilot --owner <email> --dry-run --strict \
  --registry ~/activity-catalogue-pilot/misconception-registry.txt
```

13 bindings · 4 distinct ids · `--strict` exit 0. `pnpm verify` 8/8.

**All four Year 8 activities are PUBLISHED** (v1 each, 2026-08-25) — so the
sensor is live on real student-reachable content for the first time. The
bindings themselves never reach the student: `choices[].misconceptionId` and
the whole `mistakeFeedback` array are on the sanitizer's strip lists, and that
is bound to output by `tests/sanitize.test.ts` (`expect(wire).not.toContain`)
plus `tests/check-leak.test.ts`, both in `pnpm verify`.

## The legacy test fixtures are GONE — and that closed the owed republish

The three initial-test activities (`unit-3/unit-rate.md`,
`unit-3/proportional-graphs.md`, `unit-4/rate-of-change.md`) were deleted
2026-08-25: the author soft-deleted the rows in the app, and the `.md` files
were removed from the catalogue. Both halves — a deleted file alone is only an
orphan (D2), and a deleted row alone leaves the file re-creating it next run.

**This retired the one owed author action.** `unit-3/unit-rate.md` carried the
swallowed-blank answer leak in published snapshots v1–v3 and needed a republish
to mint a clean v4. It never got one, and no longer needs one:
`get_published_activity` filters `a.deleted_at is null` (verified against the
live function definition), so the leaky version is no longer served. Blast
radius was zero throughout — `section_checks` = 0, `submissions` = 0.

⚠ **The leak CLASS is not closed** — only this instance is. The importer defect
below is still live and still unguarded.

## The defect the corpus found — the highest-value small slice available

**`{{…}}` inside `$…$` is swallowed whole into the latex, silently.**

```
{"type":"mathInline","attrs":{"latex":"k = {{=8 | !0.125 :: … :: mis.rate.ratio-inverted}}"}}
```

Three failures at once: the **answer is shown to the student**, the item is
**not gradeable**, and the **binding vanishes** (so the sensor reports "nobody
made this mistake"). Measured as universal — inline, display, `worked`,
`callout`, `faded`, table cells, mc choices. Only the `definitions` fence did
not reproduce, and that is unexplained, not cleared.

⚠ **Sanitize structurally cannot fix this, and that is the interesting part.**
It strips `prompts[].answer` on `PROMPT_CARRIER_TYPES`. A swallowed blank
produces **no `prompts` array at all** — the answer sits in `latex`, which is
content, not a secret field. Every layer below the importer behaves correctly
and the answer still lands on the page. The fix has to be at the importer.

**Proposed (not built):** warn when a `mathInline`/`math_block` latex contains
`{{`. One predicate over a node the importer already constructs; converts a
silent answer-leak into a `--strict` failure. Guard it against RENDERED OUTPUT
and mutation-test it by reverting the corpus fix. Full entry in TODOS.

⚠ **Do not "fix" this by telling authors to use `\gap{}` and stopping there.**
`\gap{}` is correct inside math AND puts the answer where the sanitizer can
reach it — but **`\gap{}` cannot carry a misconception binding**, because
`|`-alternates are not parsed inside math (format doc line 70). So a mistake
sensor inside an equation has no spelling today. That is a real capability gap
worth its own decision, not a syntax preference.

## A phantom change you will see on the very first dry-run

Every PUBLISHED activity reports `course "Algebra II" → "Year 8 Mathematics"`
and `unit <unset> → …` on every run. **Nothing is stale.** `publish_activity`
sets `draft_content = null`; the change preview reads `existingRow.draftMeta`
(`scripts/batch-import.mjs:340`), finds nothing, and diffs the file against
`DEFAULT_COURSE`. The `course` COLUMN is already correct — the importer never
writes it (publish-truth, 0037 R1).

Do not "fix" it by re-importing; the re-import writes the same document meta and
the phantom returns on the next run. Full entry + proposed fix in TODOS. It
matters because it inverts D5's promise: a preview that cries wolf on every row
is a preview nobody reads the real `title` change out of.

## The ordering — the author has named the next item

**⚠ NEXT ITEM, AUTHOR-DIRECTED (2026-08-25): decide the catalogue PATH SCHEME.**
TODOS → "CURRICULUM-ARCHITECTURE ALIGNMENT" §2 carries the full evidence. The
short version: `source_path` IS identity, and the current path
`year-8/rates-and-proportional-relationships/activity-01-unit-rate.md` encodes a
band (dual and deliberately unsynced, D14), a "unit" (not one of the model's five
entities), and an ordinal (activities are disposable and get split) — while the
CHAIN, which is permanent and owns both ordering and the hook pool, appears
nowhere. Proposed: `chain.<domain>.<name>/<stable-slug>.md`.

**Do it now because the cost curve is brutal:** 4 renames today on activities
with zero student data, versus the same operation at 150 files on rows carrying
real attempt history. It is not free even today — a rename orphans the row
(D1/D2), so the four activities need re-publishing after.

**Read §1 before committing to a scheme.** If skill ids become first-class, the
path matters less, because the chain relationship stops depending on the
filesystem. Decide §1's DIRECTION first; do not let that defer the path past the
point where it is cheap.

RULED BY THE AUTHOR (still standing):

1. **Writing activities comes before more code.** Still true, and now paying:
   the first 4 real files found an answer leak that 130 script guards and a full
   `pnpm verify` never saw.
2. **Do NOT harden constraints out of STATE yet.** 🚨 **This has now run out of
   room.** STATE sits at **exactly 4000 words against a 4000-word ceiling** —
   the budget test passes with ZERO headroom, so the next session cannot add a
   sentence without failing `pnpm test`. The deferral is over: the next session
   touching STATE does the PROMOTION into CLAUDE.md/DECISIONS. Deleting to make
   room is the one thing the rule forbids.

HARD DEPENDENCIES (facts, not preferences):

3. 🚫 **The check-prune CANNOT be armed until misconceptions roll up.** Ids live
   on NON-latest attempts, exactly what `prune_section_checks` deletes.
   `docs/design/check-retention-and-rollup.md` §II.6; blocking step on the
   ARMING checklist in TODOS. Also still gated on counsel Q10.
4. **The UNITS slice's syntax is UNPINNED** — three verified tokenizer
   collisions, worst being `unit: km/h|kph` making the literal "kph" an accepted
   answer. Read X2 in the design doc before designing; do not re-derive.
5. **The graph nudge TEXT is a separate slice with its own UX pass.**

MY READING (not ruled):

6. **`skills` being an orphan (§1) is the deepest of the four gaps** — an entire
   curriculum model is specified on a field that is authored by nothing and read
   by nothing. It is also the one that makes coverage permanently report zero.
7. **The importer's swallowed-blank warning is the best small code slice** —
   proven by real content, no dependencies, closes an answer leak.

## Authoring facts worth not re-deriving

- **`source_path` is the activity's IDENTITY** (D1). Moving or renaming a `.md`
  orphans its row and creates a new one. The `year-8/<unit>/` layout was chosen
  this session and is cheap to change ONLY while the row is disposable.
- **The registry is required in batch mode** once any file carries bindings.
  Plain text, one id per line, `#` comments. Adding an id there IS the
  ratification step.
- **Pick numbers so the anticipated wrong answer is exact.** All four
  `ratio-inverted` bindings invert to terminating values (3÷5, 3÷6, 4÷20, 3÷24).
  A non-terminating inverse gives a PARTIALLY dead binding — fires for some
  students, not others, so the count is biased while looking healthy.
- **Publishing clears the draft** (`publish_activity` sets `draft_content =
  null`), so a published activity with no draft is up to date, not stale.

## Drift audit — run 2026-08-25, 2 confirmed findings (both fixed)

Triggered by a deletion plus a session that changed reality and wrote about it.
§0–§8 clean; the two findings were both §9, and both were **self-created hours
earlier** — the pattern the skill's own trigger notes predict.

- **CLAUDE.md said "eight instances" of the orphan class; it is nine.** Fixed,
  with `skills` named.
- **STATE said "✅ THE ORPHAN CLASSES ARE ALL CLOSED (2026-08-25)".** False the
  same day. Fixed. **The mechanism is the interesting part:** the reachability
  guard is scoped BY NAME to the flow fields
  (`scripts/tests/flow-field-readers.test.mjs`), and a by-name guard cannot
  report a field nobody added to the list — so a closed-set claim survived an
  open instance. A guard that enumerates cannot prove exhaustiveness.

Also corrected: STATE's hand-maintained "THREE ITEMS ARE OWED" tally, replaced
by naming the items (a count in a section that gets replaced is a number with an
expiry date).

**A method fix worth keeping:** §9's sweep has a false-positive class it did not
name. Answer-key fields (`correctPoints`, `models`, `mistakeFeedback`, …) have
no viewer consumer BY DESIGN — sanitize strips them and the SERVER grader reads
them. Checking `graph-kit/src` and `viewer/src/server/` cut 19 candidates to 1.
That caveat is now in CLAUDE.md's close-out rule so the next sweep does not
re-report nineteen phantoms.

Clean sections, stated rather than skipped: version constants (§1 — every
`SANITIZER_REV` literal is a HISTORY observation or sits beside its guard);
budgets (§2 — 18/18 pass, tightest is `ledger: prosemirror` at 96% of cap,
no movement baseline to compare against); design-doc statuses (§3 — only
`ux-lens.md` lacks one, the documented false positive, correctly classified as a
procedure doc); ROADMAP (§4); STATE links (§5 — all resolve); deploy state
(§6 — `config.toml` lists exactly `get-activity` + `check-activity`, matching
the functions dir); compliance (§7 — no migration touched personal data this
session; `data-map-coverage` and `retention-windows` both green); guards (§8 —
130 script tests pass).

## Traps that cost this session real time

- **A manifest count is a cross-check no test replaces.** The swallow bug was
  invisible to the importer, to `--strict`, and to a harness that derives its
  cases from the document — because a swallowed binding never reaches the
  document. It was caught by diffing the manifest's per-id counts against a
  grep of the source files. Do that diff whenever bindings change.
- **Derive test cases from the artifact, then mutation-test the deriver.** The
  first harness silently collapsed two distinct mc choices sharing one id into
  one case (bad de-dup key) and reported 12/13 as if complete.
- **`browse` handoff did not preserve the login session.** The daemon restarted
  between `handoff` and `resume` and came back headless with empty
  localStorage; `connect` gave a headed browser on a fresh profile, also
  unauthenticated. Supabase keeps the session in localStorage, so
  `cookie-import-browser` would not have helped either. **Publishing from the
  app is an author action in practice** — plan around it rather than through it.
- **Check who pushed.** Three commits reached origin without this session
  running `git push` (the author pushed mid-session). `git ls-remote` and the
  `origin/main` reflog settle it; the local ref alone can mislead.

## House rules that bite hardest here

- Never `git push` — the author pushes. Check `git branch --show-current` is
  `main` before committing.
- `pnpm verify` is the definition of done for CI's check job.
- A schema change means both bundles regenerate in the SAME commit, and a
  redeploy is owed. **Nothing this session touched schema** — no redeploy owed.
- STATE.md is measured in WORDS (~1,500 target, 4,000 ceiling, currently 3981).
  Do not raise the ceiling to make a commit pass.

## Start here

Say which of 1–7 you're taking and why, before touching anything. Then run the
dry-run above — the manifest is no longer empty, and its per-id counts are the
first thing to reconcile against the files.

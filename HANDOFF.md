# Handoff — 2026-08-25 (evening)

Paste the block below `PASTE FROM HERE` into a new chat. Everything above it is
context for a human deciding whether the handoff is accurate.

---

## What happened in the session that wrote this

**Authoring started, and the tooling met real content for the first time.** The
catalogue went from 3 files / 0 bindings to 7 files / 13 bindings across all
four ratified `mis.*` ids. The author ran the real import; it created 4 and
updated 3. Verified live afterwards: 13 stored ids in `draft_content`, matching
the manifest per file.

**The first real content immediately found a defect the whole test suite was
blind to.** `{{…}}` inside `$…$` is absorbed whole into the LaTeX — no blank, no
grading, no warning, and the ANSWER plus the binding id rendered to the student.
It is an answer leak, it is universal across math contexts, and `--strict`
cannot see it. Filed in TODOS with a proposed one-line importer warning.

**A fourth instance of that defect predates the arc and is STILL LIVE in
published snapshots.** `unit-3/unit-rate.md` has carried it since 2026-08-21.
Measured blast radius is zero (no checks, no submissions), but it proves the
leak class is real and reaches `activity_versions`, not just drafts.

**The four new activities were published at session end** (v1 each, verified
clean). The leaky legacy one was not — see the owed action below.

**The verification method is the reusable part.** Bindings were proven by
deriving one case per binding FROM the serialized documents and running each
through the shipped `gradeSection` — then mutation-testing that harness so its
green meant something. It found 12 of 13; the 13th was missing because of the
swallow bug, which the manifest-vs-grep diff caught.

## What the next session should know before trusting anything here

- **`HANDOFF.md` is REPLACED, not appended** — like STATE. A transient baton,
  not a durable doc, and not in CLAUDE.md's doc map.
- Everything is **pushed and CI-green at `129117c`**. Confirm with `gh run list`.
- **One author action is still OWED** (republish `unit-3/unit-rate.md` — see
  below). Verified still outstanding at session end with the query given.

---

# PASTE FROM HERE

I'm picking up the activity-platform repo cold. Read CLAUDE.md, then STATE.md,
then TODOS.md.

## Where things stand (2026-08-25 evening, pushed, CI green at `129117c`)

**Authoring is underway — the ruling from 2026-08-24 is being executed, not
still pending.** The catalogue at `~/activity-catalogue-pilot/` now holds:

```
misconception-registry.txt                          ← the taxonomy, 4 ratified ids
unit-3/{unit-rate,proportional-graphs}.md           ← legacy Algebra I test fixtures
unit-4/rate-of-change.md                            ←   (pre-date the real catalogue)
year-8/rates-and-proportional-relationships/
  activity-0{1,2,3,4}-*.md                          ← the real content, 13 bindings
```

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

## The one author action still OWED

**Republish "Unit Rate from a Table" from the app** — the Algebra I one in the
legacy `unit-3/` folder, NOT one of the four new Year 8 activities.
`unit-3/unit-rate.md` authored `$$\frac{4.50}{3} = {{=1.50}}$$`, which the
importer swallows (see below). All three `activity_versions` snapshots (v1–v3,
last 2026-08-22) carry it, and those are what `get-activity` serves at
`/a/:id`. **The 2026-08-25 re-import fixed the DRAFT only** — a re-import never
touches published snapshots. A republish mints a clean v4.

⚠ **This was attempted and missed at session end**: the author published the
four NEW activities (all clean, v1 each) but not this one, because "republish
the unit-rate activity" reads ambiguously when the catalogue now contains both
`unit-3/unit-rate.md` and `year-8/…/activity-01-unit-rate.md`. Confirmed still
at v3. **Verify, do not assume:**

```sql
select v.version_num, position('{{=1.50}}' in v.content::text) > 0 as still_leaks
from activity_versions v join activities a on a.id = v.activity_id
where a.source_path = 'unit-3/unit-rate.md' order by v.version_num desc;
```

Blast radius was measured at zero — `section_checks` = 0, `submissions` = 0 —
so this is untidy, not an incident.

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

## The ordering — RULED vs my reading

RULED BY THE AUTHOR (still standing):

1. **Writing activities comes before more code.** Still true, and now producing
   returns: the first 4 files found a leak that 130 script guards and a full
   `pnpm verify` never saw. Keep authoring.
2. **Do NOT harden constraints out of STATE yet.** ⚠ But STATE is now at **3981
   words against a 4000 ceiling**. The next session touching it should do the
   PROMOTION, not squeeze — there is no room left to defer again.

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

6. **The importer warning above is the best next code slice** — it is small, it
   is proven by real content rather than argued from principle, and it closes an
   answer leak. It also has no dependencies, unlike everything in the wishlist.
7. The offline misconception match-rate query (T6) is still worth writing early
   as the first consumer of stored ids, but it is bound by the same prune
   ordering as #3.

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

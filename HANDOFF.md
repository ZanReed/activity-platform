# Handoff — 2026-08-31 (second of the day)

Paste the block below `PASTE FROM HERE` into a new chat. Everything above it is
context for a human deciding whether the handoff is accurate.

---

## What happened in the session that wrote this

Two commits, `0d2c811` and `3a49ea9`. **Lane B — the last unbuilt piece of the
curriculum-alignment arc — was built, and then a short housekeeping pass closed
two stale TODOS entries and fixed the importer's phantom-change noise.**

The session opened by ruling a design fork the previous session's outside-voice
review had surfaced: Lane B's group ordering derives from row data, and the
grouper is called with the FILTERED array, so D6 ("group order stays stable
among survivors") was in play as well as D5. **D6 was kept**, via an explicit
unfiltered order source.

**Two things worth knowing about how it went.** First, two of the outside-voice
review's own claims did not survive checking — its D7 coupling and its
attribution of the comparator fix — which is the symmetric half of the lesson
that produced the review in the first place. Second, **one of the seven new
guards was VACUOUS on the first attempt** and only mutation found it: a
case-distinctness assertion stayed green when the comparator's sensitivity was
reverted, because a different half of the fix already carried that property.
That is the second vacuous guard in two weeks, and both had the same shape —
*the assertion was true for a reason other than the one it was written for.*

**The housekeeping found more than expected.** The phantom `course`/`unit`
change was filed as cosmetic; fixing it revealed a data bug underneath (a
published activity re-imported from a file with no `course:` line came back as
"Algebra II"). And two TODOS entries described shipped work as open — one of
them the file's highest-ranked blocker. **Both were found by answering "what is
left on TODOS", not by the drift audit that ran the day before.**

## What the next session should know before trusting anything here

- **`HANDOFF.md` is REPLACED, not appended** — a transient baton, not in
  CLAUDE.md's doc map.
- **The author pushed mid-session again, and `origin/main` == local HEAD at
  `3a49ea9`.** Verified with `git ls-remote`, not the local ref. This is now
  the third session in a row where the push state was not what the previous
  handoff predicted — check it, do not inherit it.
- **Nothing is owed to the author.** No migration, no bundle, no deploy, no
  republish. Both commits are app/script-side only.
- **CI:** Lane B's run (`33400316329`) is green on all four jobs. The importer
  run (`33401019070`) was still in flight when this was written — **open it,
  do not assume.** A claim with a run id attached is still a claim.

---

# PASTE FROM HERE

I'm picking up the activity-platform repo cold. Read CLAUDE.md, then STATE.md,
then TODOS.md.

## Where things stand (2026-08-31, `main`, pushed to `3a49ea9`)

**The curriculum-alignment arc is COMPLETE.** Lane B — the activities list
sorting by catalogue path — was its last unbuilt piece and shipped today.
Design record: `docs/design/curriculum-alignment.md` (R1–R19, R7's AS BUILT
note) and `docs/design/activities-list-surface.md` (D5 superseded, D6
reaffirmed with its mechanism made explicit).

**There is no code slice queued.** The next lever is authoring, and STATE has
said so for a week: ~150 markdown files planned in `~/activity-catalogue-pilot/`,
4 written. Verify the catalogue still runs before anything else:

```
pnpm import:batch ~/activity-catalogue-pilot --owner <email> --dry-run --strict \
  --registry ~/activity-catalogue-pilot/misconception-registry.txt \
  --skills-registry ~/activity-catalogue-pilot/skill-registry.txt
```

Exit 0, and at the last run 3/47 skills · 3/51 parts · 13 bindings across 4 ids.
⚠ **The change preview should now be EMPTY for the published activities.** It
used to report a `course`/`unit` change on all four, every run; that was fixed
today. If changes reappear on rows nobody edited, that fix regressed — start
there.

## The ranked list, if you are here to do work rather than author

Nothing below blocks authoring. The wishlist's own rule: an item there caps
SPECIFIC activities at draft (the builder's D6), it does not cap the corpus.

1. **Wishlist #2 — `graded_polynomial`, cubic-and-up curve grading.** Blocks
   ~11 derivative-chain activities. The cheapest of the graph items: extends a
   well-tested enum through `regression.ts` → `fit-format.ts` → `graph-score.ts`.
   Re-verified open 2026-08-31 — `regression.ts` still grades exactly
   `linear | quadratic | exponential | logarithmic`. Design question to settle
   first: degree-3 or degree-n. ⚠ Grading-engine change ⇒
   `pnpm bundle:grading-server` in the SAME commit + a `check-activity`
   redeploy owed (`pnpm deploy:check`, never `--no-verify-jwt`).
2. **Wishlist #4 — `nway_correspondence`, 4-way match with per-edge partial
   credit.** Blocks ~5. A new block type, so the full add-a-block-type
   checklist in README. Re-verified open: the identifier appears nowhere in
   `packages/`.
3. **Wishlist #3 — unit-bearing numeric blanks** (`{{=1.5 unit: km/h}}`).
   Blocks ~10 contextual DoLs. ⚠ Standing rule: do NOT widen
   `BlankResponse.answer` to a union — keep the unit in the blank's attrs and
   grade it server-side.
4. **Then #5 (`draggable_curve`) → #6 (`seeded_data`).** #6 is its own arc.
5. **`pnpm verify` goes red under machine contention** — three timing-sensitive
   files, operational, will keep costing sessions until someone pins the
   wall-clock dependency. TODOS has the reproduction.

Everything else in TODOS is real but not load-bearing: the graph-kit legacy
runtime deletion, three minor orphan fields, the print tier, the check-rollup
ARMING arc (gated on counsel Q10, which is the author's, and it is the only
thing in this repo that deletes student work — read its checklist, never a
summary).

## The five things most likely to be misunderstood

1. **`unit` is student-visible in BOTH student surfaces** (`StudentViewer`'s
   `course · unit · type` line and the print layer). That is why chain ordinals
   live in the FOLDER NAME and the list reads order from `source_path`. Putting
   a number in a unit title is now actively wrong, not merely redundant.
2. **The path fallback in the importer is not merely the keyless case.** It is
   how a keyed file ADOPTS a row that predates the column. A key-only matcher
   turns the first run into N creates and N orphans. Both arms are pinned in
   `batch-import.test.mjs` §K.
3. **`role` / `type` / `chain_role` are three different axes** — Bank trust
   label, presentation format, position in chain. A consolidation is still
   `role: lesson`, and it is excluded from its terminal skill's parts.
4. **`covered` counts whole skills and stays FLAT while a multi-part skill is
   half-written.** The number that moves is *parts authored / parts declared*.
5. **The importer never WRITES `course`/`unit`** — they are publish-truth
   (0037 R1), stamped only by `publish_activity`. As of today it READS them as
   a fallback when the draft is null, which is not the same thing, and three
   §B tests pin the difference (including the mirror case: an unpublished row
   still reads its draft).

## Traps that cost real time recently

- **A guard can be vacuous in the documented way and still feel finished.** Two
  instances in two weeks, both caught only by mutation, both the same shape:
  *the assertion was true for a reason other than the one it was written for.*
  **Watch every new guard fail once, on the day you write it** — reverting the
  wiring and seeing red is a two-minute step and it has now paid twice.
- **A cosmetic report can be the visible edge of a data bug.** The phantom
  `course`/`unit` change was filed as noise for six days; the same line was
  writing a default course into published activities whose fence omitted one.
  It was invisible only because all four pilot files carry an explicit
  `course:`.
- **Stale TODOS entries are found by USING the file, not by auditing it.** Two
  turned up the day after a drift audit ran clean — one of them the
  highest-ranked blocker in the file, describing shipped work as absent. If an
  entry's premise is checkable in thirty seconds, check it before believing it.
- **Verify the push state with `git ls-remote`.** Three sessions running, the
  author pushed mid-session and the previous handoff's claim was stale.
- **Do not background a vitest run and then start `pnpm verify`** — it produces
  false reds in three timing-sensitive files.

## What is owed by whom

| | |
|---|---|
| **Author** | Nothing new. The standing three are unchanged: the D24 counsel read, Gate 4, and the `display_name` one-row fix — all in STATE → Pending. |
| **Platform** | Nothing open. |
| **Curriculum side** | Nothing owed to us. Still theirs: one misconception carrier needs a restructure, the `transform.translate` activity, alignment fields as arrays, two hooks for `chain.rate.proportional`, then chain 2. |

## The curriculum side, and where the shared record lives

The catalogue is authored by a **separate curriculum-side agent** with its own
repo, decision log and skill graph. This repo never reads that graph — it
consumes only the registries generated from it. **Their `boundary-page.md` is
the shared surface.** Three rules on it that were paid for: an item is not
closed until the artifact contains the change (close it by QUOTING the artifact,
not describing it); each side edits only rows it owns; and **if a file you do
not own looks wrong, file it — do not fix it.** ⚠ Letters can go missing
silently, which is what the numbered index is for.

## House rules that bite hardest here

- Never `git push` — the author pushes. Check `git branch --show-current` is
  `main` before committing.
- `pnpm verify` is the definition of done for CI's check job. It is 8/8 now;
  script guards are 164/164.
- A schema change means both bundles regenerate in the SAME commit and a
  redeploy is owed. **Nothing today touched schema.**
- A push to `main` IS a deploy (Cloudflare Pages auto-deploys), so UI calling a
  new table or RPC ships only after its migration is live.
- After changing `catalogueAuthoringPrompt.ts` or the meta fence it teaches, run
  `pnpm prompt:catalogue` and commit the regenerated doc.
- STATE.md is measured in WORDS (~1,500 target, 4,000 ceiling), and it is over
  target ON PURPOSE — resolved by promoting settled constraints, not deleting.

## Start here

Run the dry-run above. If it exits 0 at 3/47 · 3/51 with an empty change list,
nothing moved — go write activities. **The corpus finds what the fixtures
cannot**, and it has already proved that twice: a `graph_figure` test file
surfaced a four-month-old content-loss bug, and the first real consolidation
activity surfaced the in-math answer leak. Two capabilities no real activity
exercises yet: **a blank inside a table cell**, and **`graph_figure`**.

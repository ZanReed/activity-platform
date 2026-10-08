# Chain hooks — the teacher's hook view (curriculum D50 ask 3, first slice)

**Status: LIVE 2026-10-08** (0057 applied, verify-0057 12/12 live; pushed `c9f9eedc`, CI green; 13 hooks mirrored and read back live; receipt B-130). RULED, ENG-REVIEWED, DESIGN-REVIEWED and ENG-RE-REVIEWED the same day. Re-run: RT1–RT5 (plain mark buttons, Change date disabled while a write is in flight, an e2e spec for print + axe). Design: 2/10 → 8/10, 9 rulings (1A–7.2A), tasks DT1–DT5 amending T4–T6. Rulings are in §Rulings, and the joint contract was agreed in C-97. The eng review (§Eng review) replaced CH-6's two read paths with ONE RPC (D1). It ruled D2–D5, and the decisive one is D4: lock the copy provenance columns, a P1 hole found by the Fable outside voice. It filed D6 in TODOS and mapped the build to T1–T8. **The build may start now against a fixture (D5)**; the live import waits for the curriculum generator PR. Nothing is built yet.

## What a hook is (re-derived from curriculum `main` b74e02a, graph v0.17.19)

- **Data:** `curriculum-graph.json` → `chunking_plan.chains[].hooks`, each
  `{id, connects_to: [skill id], prompt, note}`. Four chains have pools:
  `chain.rate.proportional` (2), `chain.linear.slope` (3),
  `chain.geom.triangles-polygons` (2), `chain.geom.parallel-lines` (2). The
  other chains have none. Nine hooks in all.
- **Rules** (`chain-hooks.md`, `authoring_principles` §4,
  `activity_defaults.hook_contract`): a hook is a CHAIN-level pool, never welded
  to an activity ("Activities never carry hooks; days do"). The teacher fires
  one when their class's day begins, because period boundaries are classroom
  facts the data model cannot see. One question, under a minute, answerable by
  intuition, must not front-load the lesson. Pool minimum
  `max(skills_with_an_approved_activity, ceil(approved_activities / 2))`.
- **Only approved hooks reach the graph.** `chain-hooks.md` is the holding pen
  for drafts; the graph has no per-hook status field. So everything in a
  generated file is approved, and the platform needs no status column.
- **Notes carry the answer** ("80c vs about 83c"; "the four sharp angles are
  50°") and name misconception ids and activity positions ("Fire before
  activity 03") in prose. That makes a note teacher-only content in the same
  class as an answer key.
- **The text is plain**, with literal `$` signs (`$4`, `$10`). Run through this
  repo's markdown pipeline, `$…$` would parse as inline math. Hooks must render
  as plain text.
- **Hook ids are informally permanent.** `chain-hooks.md` says of the cut
  `hook.parallel.car-park`: "The id stays unused". There is no
  `hook-ids-retired.txt` beside the skill, fact, glossary and external-prereq
  ledgers.
- **Their side already expects the platform to generate this view.** D50 rule 7:
  "Chain-level guidance is generated, not authored." `authoring_principles` §19
  says the guide never repeats the hook, because "A copy would drift".
- **Stale on their side once this ships (theirs to amend, not ours):**
  `chain-hooks.md` → "the platform doesn't render hooks, so students draw or
  picture it." It stays true for STUDENTS (this design adds no student surface)
  but will read wrongly about teachers.

## What exists on this side (main bdf14524)

- **No hook anything.** `git grep -i hook` finds only React hooks. No schema
  field, table, importer flag or UI.
- **The mirror precedents** in `scripts/batch-import.mjs`:
  misconception registry (global table, upsert, 0042), glossary (OWNER-keyed,
  one atomic service RPC `sync_glossary_entries` with `p_apply` for dry runs,
  retire-never-delete, a mass-retire guard; 0043), fact-scope registry (a
  JSON file with a `revision` = sha256 of the canonical body, re-derived by
  `checkFactRegistryRevision`; one atomic RPC `sync_fact_scope`; 0044).
- **How an activity knows its chain:** `chainFolderOf(source_path)` = the first
  path segment, e.g. `713-chain.geom.parallel-lines`. The graph's `chain_id` is
  that folder minus its ordinal prefix (chain-registry header: "The chain
  ordinal lives in the FOLDER NAME"). Nothing stores `chain_id` on a row today.
- **Bank copies have no `source_path`** (BK-1 never copies catalogue identity).
  They do carry `copied_from_activity_id` (0054), whose row has one. BK-7's
  glossary fallback already reads across that link.
- **The Activities list** groups by unit (`lib/activityGrouping.ts`), one
  `<section>` + `<h2>` per unit with a per-unit "List unit in the Bank" action
  (`routes/Activities.tsx:616-666`). That header is the natural door.
- **The teacher guide** is activity-level, authored, a drawer section in the
  editor and the first page of the answer-key print (teacher-guides.md TG-4,
  TG-5).

## Decisions for the author

Each has a recommendation. Rule yes/no per item; nothing is built until then.

### CH-1. Scope: the hook pool first; what rides along, what waits

**Recommendation:** v1 is the chain hook view. **Rides along (cheap):** the
activities of that chain in teaching order, on the same page. The Activities
list already loads those rows with `source_path`, so this is a filter plus a
list, no new data. **Waits:** D49 correctives (none exist yet; trigger: the
first corrective file lands on their main, and it needs its own transport), and
the per-activity generated view (ask 2; its build trigger is unchanged: the
first activity taught by a teacher other than the author).

### CH-2. Transport: a generated `hook-registry.json` (JOINT CONTRACT)

**Recommendation:** their side generates it from the graph, in the fact-scope
registry's shape, so we reuse a revision rule both sides already run:

```json
{
  "header": {
    "generated_from": "curriculum-graph.json v0.17.19",
    "revision": "<sha256 of canonical body>",
    "revision_rule": "sha256 of the canonical JSON body (sort_keys, no whitespace, UTF-8), header excluded",
    "note": "GENERATED. Do not hand-edit."
  },
  "body": {
    "chains": {
      "chain.geom.parallel-lines": [
        {
          "id": "hook.angles.squashed-x",
          "connects_to": [{ "id": "geom.angles.relationships", "label": "Use supplementary, …" }],
          "prompt": "…",
          "note": "…"
        }
      ]
    }
  }
}
```

- Pool order in the file is display order (the chain opener first, as authored).
- Chains with no pool are omitted.
- `connects_to` carries each skill's LABEL beside its id, so the view can say
  what the hook opens without this repo mirroring the skill registry. The
  labels already exist in their generator (the skill registry's comments).
- `prompt` and `note` are PLAIN TEXT: no markdown, no `[[term]]`, no math. The
  platform shows them literally.

Alternatives: a line-based `.txt` like the other registries (notes are long
multi-sentence prose, so a line format means escaping), or JSON without a
revision (loses the cheap "did this file change" check the fact mirror relies
on).

### CH-3. Import: `pnpm import:batch --hook-registry <file>`

**Recommendation:** a new flag on the existing importer, same discipline as
`--fact-registry`:
- re-derive the revision and refuse a mismatch;
- every hook `chain_id` must match a chain-registry folder with its ordinal
  stripped, when `--chain-registry` is passed (warn; fails `--strict`);
- every `connects_to` id must be in `--skills-registry`, when passed (warn;
  fails `--strict`);
- hook ids must match `^hook\.[a-z0-9.-]+$`;
- the dry run prints create / update / retire / unchanged counts; a run that
  would retire more than half the owner's live hooks refuses without `--force`
  (the glossary's guard);
- no flag means the table is left alone (the glossary's R2 rule: a flag-less
  run never retires anything).

### CH-4. Storage: an owner-keyed `chain_hook` table

**Recommendation:** one migration, modelled on 0043:
`chain_hook (owner_id, hook_id, chain_id, position, connects_to jsonb, prompt,
note, retired_at, updated_at, primary key (owner_id, hook_id))`. It is written
ONLY by a service-role RPC `sync_chain_hooks(p_owner, p_registry, p_apply)`,
atomic, dry-run by `p_apply = false`. **Owner-keyed** because it is that
owner's catalogue content, like the glossary (the 2026-06-19 tenant ruling),
not a global id set like the misconception registry. `data-map.md` and
`retention-policy.md` change in the same commit (the person reference is
`owner_id`; no student data), and `data-map-coverage.test.mjs` enforces the
first.

Alternative: a global table (simpler RLS, but it would make one author's hooks
everyone's, which the tenant ruling rejected for the glossary).

### CH-5. Retired hooks: retire, never delete

**Recommendation:** a hook that leaves the file gets `retired_at`. It is hidden
from the view, and a returning id clears it. Nothing deletes a row except the
owner's account purge (FK cascade). This only matters once something points at
a hook id (CH-9's "used" marks), but it costs nothing now and avoids a migration
later. **The joint half:** ask their side to state in `chain-hooks.md` that a
hook id is never reused after it is cut, which they already practise
(car-park). A `hook-ids-retired.txt` ledger is theirs to choose. We would read
it only to warn.

### CH-6. Who can read hooks: teachers only, never students

**Recommendation:**
- **Owner:** reads their own rows directly (one RLS select policy, owner-scoped,
  0009's initplan form).
- **A teacher using Bank copies:** a definer RPC
  `chain_hooks_for_activity(p_activity)` returns the pool for the activity's
  chain, but only when the caller OWNS that activity. The chain comes from the
  activity's `source_path`, or from its `copied_from_activity_id` row's
  `source_path` for a copy. The pool is read from that original's owner. This
  is BK-7's fallback shape, read-only, and it never widens
  `can_read_activity` (the Activity Bank landmine).
- **Students:** no path at all. Hooks are not in the activity document, so
  `sanitize.ts`, `get-activity` and the two committed bundles are untouched and
  NO redeploy is owed.
- **Accepted residual (named, not new):** BK-8 already lets a student who
  claims to be a teacher copy an activity and read its answer key, so hook notes
  add nothing to that exposure.

Alternative: owner-only, with copiers getting nothing until someone asks
(smaller, but the colleague teaching a copy is the reader D50 was written for).

### CH-7. Where a teacher sees hooks

**Recommendation:**
1. **A chain page** (teacher route, e.g. `/chains/:chainId`): the hook pool
   (CH-8), then that chain's activities in teaching order (CH-1's ride-along).
   It is the page ask 3's later parts (correctives) will extend, so it is the
   right home even while it only holds hooks.
2. **The door:** a "Hooks (n)" link on each Activities-list unit header, beside
   "List unit in the Bank", shown only when the unit's chain has a live pool.
3. **The editor (cheap ride-along):** one line in the Teacher guide drawer
   section, "This unit's hooks →", linking to the chain page. No hook text in
   the drawer, which keeps the guide and the pool separate (CH-10).
4. **Print (cheap ride-along):** the chain page prints cleanly (print CSS, one
   hook per unbroken block, notes included). No print route of its own, and no
   hook in an activity's answer key.
5. **The Bank: not in v1.** Its preview is per activity (BK-6); a teacher sees a
   unit's hooks once they hold a copy from it (CH-6). Trigger: a colleague asks
   to see hooks before copying.

Alternative to 1–2: an expandable panel inside the unit header (no new route,
but the Activities list gets heavier and correctives would have nowhere to go).

### CH-8. What the view shows per hook

**Recommendation:** the **prompt** large (it is read aloud or put on the board),
"Opens: <skill label>" from `connects_to`, then the **note** under a "Teacher
notes" label, shown open. The page is teacher-only and the note is the reason
the hook works. All three render as literal text (a `$4` must stay `$4`), in
pool order. No hook id on screen. A copy-prompt button is a cheap optional
extra for putting the prompt on a slide.

### CH-9. "Mark as used for a class": NOT in v1

**Recommendation:** defer. It is new per-class teacher state (a table keyed to
classes and hook ids, its own RLS and compliance rows). Your ask is to SEE the
hooks. **Trigger:** the first chain taught to a real class through the platform,
which is ~early Feb 2027. CH-5's retire-never-delete is what keeps that later
build migration-free on the hook side.

### CH-10. Relation to the teacher guide

**Recommendation:** kept separate. The guide is activity-level and authored;
the pool is chain-level and generated, and §19 forbids the guide restating the
hook. The only join is CH-7.3's link. If a guide ever needs to name a hook, it
names it in prose. No hook-id reference syntax is added.

### CH-11. Capability facts and the authoring prompt: no change

**Recommendation:** none needed. Hooks are not written in activity files, so no
fence, no `capabilityFacts.ts` JOIN row, no `pnpm facts:capabilities`, and no
pin bump. The authoring prompt keeps saying nothing about hooks. The one
cross-side text effect is CH-5's id-permanence sentence plus the
`chain-hooks.md` line noted above, both theirs to write.

### CH-12. Order of work and the letter

**Recommendation:**
1. After your rulings: send **B-124** to the curriculum session ("Teacher
   guides discussion"), proposing CH-2's format and CH-5's id sentence. No
   commit hash is quoted until it is computed. Their reply (C-97) settles the
   contract; any amendment comes back to you before code.
2. Their generator lands on their `main` (they choose the script: a
   `generate-registries.py` addition, or a sibling of
   `generate_fact_registry.py`).
3. This side builds the migration (+ verify script, mutation-tested), the
   importer flag, and the chain page. **You apply the migration live BEFORE the
   UI is pushed** (OV-7: a push is a deploy).
4. Your next import passes `--hook-registry`, and the four pools appear.

**Build trigger:** you asked (2026-10-08). The design arc is open; the build
arc waits for rulings and their generator.

## Guards (the orphan rule, bound to rendered output)

- Importer: a fixture registry → a dry-run report with exact counts; a
  revision mismatch refuses; an unknown chain or skill fails `--strict`.
- `verify-00NN.sql`: owner reads own; another teacher reads nothing directly;
  a copier reads their copy's pool through the RPC and nothing for a chain they
  hold no activity in; a student session reads nothing; the sync RPC is
  service-only; retire / un-retire. Mutation-test once by dropping the
  ownership check in the RPC.
- Chain page: a sentinel prompt renders on the page and a note containing `$4`
  renders as `$4`. Mutation: route the text through the markdown renderer and
  watch the `$` test go red. The student viewer never shows the sentinel.

## Out of scope

Correctives (D49), the per-activity generated view (ask 2), hooks in the Bank (CH-7.5), any student surface, and hook figures
(hooks are text-only by their rule).

## Rulings (author, 2026-10-08)

Walked item by item. Every item went as recommended except **CH-9**.

| item | ruling |
|---|---|
| CH-1 | Hooks + the chain's activities in order. Correctives and ask 2 wait for their triggers. |
| CH-2 | `hook-registry.json` with a sha256 revision, skill labels inline, plain text. Proposed in B-124. |
| CH-3 | `--hook-registry` flag as described, including the mass-retire guard. |
| CH-4 | Owner-keyed `chain_hook` table. |
| CH-5 | Retire, never delete, and ask their side for the id-permanence sentence. |
| CH-6 | Owner plus Bank copiers (for activities they own). No student path. |
| CH-7 | Chain page + "Hooks (n)" list link, the editor drawer link, and print CSS. Not the Bank. |
| CH-8 | Prompt large, "Opens: <skill>", notes shown OPEN, literal text. No copy button. |
| **CH-9** | **BUILD IT IN v1** (overrides the defer recommendation). Sub-rulings below. |
| CH-10 | Kept separate from the teacher guide. |
| CH-11 | No capability-facts or authoring-prompt change. |
| CH-12 | Send B-124 now. |

### CH-9 as ruled: "used" marks per class

- **CH-9a: a toggle with an EDITABLE date.** Marking records today, and the
  teacher can change the date afterwards (the "forgot to mark it on the day"
  case). Unmark by toggling off.
- **CH-9b: a class picker on the chain page.** It lists the teacher's own
  classes and remembers the last choice per viewer (browser storage, with a
  try/catch, because it is a convenience). With no class picked, the page is
  the plain hook view.
- **CH-9c: dimmed in place**, keeping the authored pool order, with a
  "Used 12 Feb" badge.
- **CH-9d: unmarking deletes the row.** The mark is teacher planning state, not
  student work. Marks belong to the class and go with its purge.

**Shape (for the build's own review, not yet ruled in detail):**
`class_hook_use (class_id → classes, hook_id text, used_on date, marked_by →
users, updated_at, primary key (class_id, hook_id))`. RLS through the existing
`is_class_teacher(p_class_id)` helper, never an inlined ownership check (CLAUDE.md
→ Things NOT to do). `hook_id` has no foreign key, because a copier's hooks
are owned by the original's owner (CH-6), so no key pair can be formed. CH-5's
retire-never-delete is what keeps a mark resolving. `data-map.md` and
`retention-policy.md` gain a row in the same migration commit (class-linked
teacher state, no student data). The verify script adds: another teacher cannot
read or write your class's marks; a student session reads nothing; editing the
date keeps one row; a mark on a retired hook survives and reappears on
un-retire. Mutation-test by dropping the `is_class_teacher` gate.

The guards section above gains one rendered-output guard: a marked hook
renders dimmed with its date for that class and undimmed for another class.

## Joint contract AGREED (C-97, 2026-10-08)

The curriculum side agreed to B-124 as proposed. Re-derived against their
`main` b74e02a (still the tip) and PR #54 (open: an area-volume pool, 4 hooks,
graph v0.17.20; after it merges there are 5 chains with pools and 13 hooks).

- **Generator:** a sibling script, `scripts/generate_hook_registry.py`, with
  its own gate. CI fails on a diff, as with their other generated files.
- **(a)–(f) all confirmed:**
  - (a) authored pool order;
  - (b) chains with no pool omitted;
  - (c) `connects_to = [{id, label}]`;
  - (d) plain text, ENFORCED by their generator: it fails on `[[`, backticks
    or `**`. Money stays a bare `$`, and there is no math in hooks, ever;
  - (e) `folder = <ordinal>-<chain_id>` is a rule (D46). Verified: their
    `scripts/check_integrity.py:169` strips `^\d+-` and fails on a folder that
    is not a graph chain_id;
  - (f) approved hooks only, no status field.
- **No additions** to the body shape.
- **Id permanence:** `chain-hooks.md` will state that a hook id is never
  reused once it has been in the graph OR cut at screening. Their ledger
  `hook-ids-retired.txt` is append-only, like `skill-ids-retired.txt`. Their
  generator fails if a ledger id appears in the graph. It does not exist yet
  (it arrives in the same PR).
  **Our side (CH-5, unchanged):** an optional importer read that WARNS when a
  ledger id is live in the registry. That can't happen given their gate, so it
  is a belt over their braces. Whether to take the flag is a build-review
  detail.
- **Sequencing:** one PR on their side (generator + ledger + the
  `chain-hooks.md` rule + the "…to students" amendment), after #54 and on
  Zan's go. They send it to us for a pre-merge check against this import plan
  before Zan merges.

---

# Eng review (plan-eng-review, 2026-10-08)

**Target:** this file, `docs/design/chain-hooks-view.md` (ruled CH-1..CH-12 +
CH-9a-d, joint contract agreed in C-97), reviewed at platform `main` cd0ac386.
Everything above the line is the plan as ruled; this section and below is the
review.

## Scope record

feature answers: none proposed (the feature list was ruled item by item
2026-10-08); structure: A, Smaller arrangement (D1, author 2026-10-08);
accepted scope: one migration with `chain_hook` + `class_hook_use`, the service
sync `sync_chain_hooks`, ONE teacher read RPC `my_chain_hooks()`, no client
select policy on `chain_hook`, `class_hook_use` read and written directly under
`is_class_teacher` RLS; app = `lib/chainHooks.ts`, a lazy chain route with
route-scoped CSS, the Activities-list link, the drawer link; pending remedies:
none. **Scope Challenge result: scope accepted as-is** (the smaller arrangement
keeps every ruled feature).

**This replaces CH-6's two read paths.** Owner and copier both read through
`my_chain_hooks()`. It returns every live pool for every chain in which the
caller owns a non-deleted activity, either through that activity's own
`source_path` or, for a Bank copy, through its original's `source_path`. It
also returns the activity → chain map, so the list knows which unit gets which
link.

## Scope Challenge findings (factual corrections, no question needed)

1. **[P2] (9/10) CH-3's mass-retire guard is misdescribed.** The plan says
   "more than half … without `--force`". The importer's real guard is
   `scripts/batch-import.mjs:1888-1893`: "EN-12: more than 25, OR more than
   20% of the active entries AND more than 5", overridden by
   `--allow-mass-retire`. **Correction:** reuse `isMassRetire` and the
   existing flag. One consequence to state: with pools this size (9 hooks
   today, 13 after their #54), no realistic retire trips it (the `> 5` floor).
   That is acceptable because a retire is reversible: the next good file
   un-retires, and marks survive (CH-5). The dry run prints every retire by id.
2. **[P2] (9/10) CH-9d's "marks … go with its purge" is false.** Prior
   learning applied: `class-rows-never-purged-and-purge-is-explicit`
   (9/10, from 2026-10-01). Classes are only soft-deleted, and the account
   purge refuses a teacher who still has classes
   (`0050_fact_sprint.sql:1374`, "or exists (select 1 from classes x where
   x.teacher_id = v_uid"). **Correction:**
   - `class_hook_use.class_id` references `classes(id) on delete cascade`,
     correct but inert today;
   - a mark lives as long as its class row, which today means indefinitely;
   - the data-map and retention-policy rows say exactly that (teacher planning
     state, no student data).
   The ruled behavior, "marks belong to the class", is unchanged.
3. **[P2] (9/10) Shell CSS has 0.1 KiB of headroom.** Today's dist reads
   "shell CSS (entry, gz) 14.9 KiB (cap 15.0 KiB)". **Correction:** the chain
   page's screen and print CSS ship in a route-scoped file imported by the lazy
   route, the way `routes/FactsTeacher.tsx:56` imports
   `'../practice/factsTeacher.css'`. Nothing goes in `index.css`. Shell JS is
   154.6 / 158.0 (stop line 156.5). The new `lazy()` line costs bytes, not
   KiB, but CI's budget check is the proof.
4. **[P3] (8/10) CH-9a's "records today" needs a timezone.** The author is in
   NZ and colleagues in the US. **Correction:** the default date is the
   BROWSER's local date (the `Intl.DateTimeFormat().resolvedOptions().timeZone`
   pattern at `routes/FactsTeacher.tsx:238`), sent as a `date`. Never the
   server's `now()::date`, which is UTC and would stamp an NZ morning as
   yesterday.

Distribution: no new artifact. No Edge Function, no committed bundle, no
sanitize change, so no redeploy. The one ordering rule is OV-7: the author
applies the migration before the UI is pushed.

## Section 1: Architecture

```
 curriculum main                         platform
 ───────────────                         ────────
 curriculum-graph.json
   └─ generate_hook_registry.py ─► hook-registry.json (revision, chains{id:[hooks]})
                                        │  pnpm import:batch --hook-registry F
                                        ▼
                             importer: checkFactRegistryRevision(F) ── mismatch → refuse
                                       chain_id ∈ chain-registry folders (strip ^\d+-)? ─ no → warn/--strict fail
                                       connects_to ∈ skills-registry? ─ no → warn/--strict fail
                                        │ rpc sync_chain_hooks(owner, hooks, apply=false)  (dry run report)
                                        │ isMassRetire? ─ yes, no --allow-mass-retire → refuse
                                        ▼ rpc sync_chain_hooks(…, apply=true)   [service role only]
                             chain_hook (owner_id, hook_id) ── retire, never delete
                                        │
 teacher browser ── rpc my_chain_hooks() [definer, current_user_is_teacher()]
   │                 activities a (owner = me, not deleted)
   │                   chain = strip(folder(a.source_path))
   │                        ?? strip(folder(original(a.copied_from_activity_id).source_path))
   │                 hooks = chain_hook where owner = (a.owner | original.owner), retired_at null
   │                 → jsonb { activityChains: {activity_id: chain_id}, chains: {chain_id: [hooks…]} }
   ├─ Activities list: "Hooks (n)" per distinct chain among a unit's members
   ├─ /chains/:chainId: pool (literal text) + that chain's activities in order
   │     └─ class picker → class_hook_use (RLS is_class_teacher) → dim + date badge
   └─ editor drawer: "This unit's hooks →" when the activity has a chain
```

**Findings, most severe first:**

1. **[P1] (9/10) `my_chain_hooks()` must check that the caller is a teacher.**
   Students hold authenticated sessions too. Today they own no activities: the
   insert policy requires a teacher, per the 0013 comment "Containment —
   authoring policies require a teacher" (`0013_student_identity.sql:135`). A
   definer function bypasses RLS, though, so the gate goes inside it, using the
   existing `current_user_is_teacher()` helper (`0013:114`). That helper also
   excludes a deleted account. This is required proof of the ruled "teachers
   only" (CH-6), not a choice. Verify row: a student session gets an empty
   result even when an activity row is planted with the student as its owner.
2. **[P2] (8/10) A copy's original may be soft-deleted or hard-deleted.**
   `copied_from_activity_id … on delete set null`
   (`0054_activity_bank.sql:55`): a hard delete cuts the link, and the copy
   loses its hooks with no error. A SOFT delete leaves the original's row and
   folder readable on the server. What the copier sees then is a choice: **D2**.
3. **[P2] (8/10) A unit group can hold more than one chain.** The list groups
   by unit STRING (`lib/activityGrouping.ts`). The importer warns when two
   chains share a title (`batch-import.mjs:532`, "Two chains resolving to the
   SAME display title"), and a hand-made activity can carry a chain's unit
   title. **Behavior (detail of the ruled CH-7):** one "Hooks (n)" link per
   distinct chain among the group's members, normally exactly one; no link
   when no member has a chain.
4. **[P2] (8/10) Activities fail-soft.** An Activities page whose hook RPC
   fails must still render the list. This is a regression risk with history:
   a push before an apply once broke the Activities list. Settled as a
   regression contract in Section 3.
5. **[P3] (7/10) Copy of a copy.** Corrected by the outside voice (#3): it is
   not unreachable, it FAILS SAFE. A copy-of-a-copy carries no `source_path`,
   so it resolves to no chain. Originally written: "Not reachable." A copy can never be listed
   (`0055_bank_authors.sql:197`, "and a.copied_from_activity_id is null" in
   `list_bank`), so it cannot be copied, and one join from copy to original is
   complete. Recorded so the build does not add a recursive walk.

Dispositions (Section 1): #1 accepted as required proof of CH-6 (no question); #2 D2 → A, keep the hooks; #3 accepted as a detail of CH-7; #4 settled as the D3 regression contract; #5 evidence only.

## Section 2: Code quality

1. **[P1] (9/10) Hook warnings must be routed into `catalogueWarnings`, or
   `--strict` will not fail on them.** Prior learning applied:
   `batch-import-strict-ignores-importer-warnings` (9/10, from 2026-10-03).
   `--strict` fails only on binding, catalogue and glossary warnings. CH-3's
   "unknown chain / unknown skill fails `--strict`" holds only if those
   warnings go into the catalogue list explicitly. This is required proof of
   CH-3. The test is a strict run with an unknown chain id exiting non-zero.
   Measure the exit with no pipe (prior learning `pipe-exit-code-artifact`).
2. **[P2] (9/10) Reuse the revision check as it is.**
   `checkFactRegistryRevision(registry)` (`batch-import.mjs:187-191`) reads
   only `registry?.header?.revision` and hashes `canonicalJson(registry.body)`,
   so it is already generic over any `{header, body}` file. Call it for the
   hook registry; do not copy it. A rename is optional and not worth a
   separate change.
3. **[P2] (8/10) A missing migration must fail soft, with the fix named.**
   The importer already classifies missing objects
   (`batch-import.mjs:1885`, `/\b(PGRST205|PGRST202|42P01|42883)\b/`). The
   hook mirror goes through that path and prints "apply 00NN" the way the
   glossary mirror does, rather than crashing the whole run. This is required
   by the migration-before-push ordering.
4. **[P3] (7/10) Shared-code rubric: keep `sync_chain_hooks` separate from
   `sync_glossary_entries` (extraction REJECTED).** They have the same shape:
   upsert, retire the absent, un-retire the returning, `p_apply` dry run,
   moving `updated_at` only on real change (`0043 §C`). But the tables and
   columns differ. The only plpgsql generic is dynamic SQL, which is less
   explicit and harder to verify than two short functions. Savings would be
   about 40 lines removed and about 50 added for the generic version: net
   growth, so no extraction.
5. **[P3] (7/10) `position` is derived, not authored.** The sync writes each
   hook's array index as `position`, and a reorder counts as `changed`, so the
   dry run shows it. Pool order is the authored order (C-97 (a)).
6. **[P3] (6/10) Medium confidence, verify at build: the date input.** The
   CH-9a editable date is a native `<input type="date">` with `max` set to the
   browser's local today (reuse ladder rung 3). The column is `date not null`.
   No picker library.

Dispositions (Section 2): #1, #3 accepted as required proof; #2 accepted reuse; #4 extraction rejected (rubric); #5, #6 accepted details. No questions.

## Section 3: Tests

Grounded in the existing harnesses: `packages/app/src/__tests__/Activities.test.tsx`
(hoisted `from`/`rpc` mocks, `lib/bank` mocked so rpc counts stay about
deleting), `scripts/tests/batch-import.test.mjs` (2,737 lines, the importer
suite), and the verify-script pattern of `scripts/verify-0043.sql` /
`verify-0054.sql`. Every path below is PROPOSED, so every row is a gap the
build must fill. Nothing is claimed as already covered.

```
CODE PATHS                                               USER FLOWS
[+] scripts/batch-import.mjs --hook-registry             [+] Author imports hooks
  ├── revision re-derived (checkFactRegistryRevision)      ├── [GAP] dry run prints new/changed/retired/unretired
  │   ├── [GAP] match → continue                           └── [GAP] real run, then the four pools on the chain page [→E2E manual, author]
  │   └── [GAP] mismatch → refuse, names the file
  ├── chain_id vs chain-registry folders (strip ^\d+-)   [+] Teacher (owner) opens a unit
  │   ├── [GAP] unknown → warn                             ├── [GAP] "Hooks (n)" on a unit with a pool, none without
  │   └── [GAP] unknown + --strict → exit ≠ 0              ├── [GAP] chain page: prompt, "Opens: <label>", note, pool order
  ├── connects_to vs skills-registry (same two rows)       └── [GAP] `$4` renders as `$4` (literal text)
  ├── missing table/RPC → fail soft, names 00NN [GAP]
  └── isMassRetire → refuse w/o --allow-mass-retire [GAP] [+] Colleague with a Bank copy
[+] sync_chain_hooks (service only)                        ├── [GAP] sees the original unit's pool [→verify SQL]
  ├── [GAP] apply=false writes nothing, same report        └── [GAP] original soft-deleted → still sees it (D2)
  ├── [GAP] retire absent / un-retire returning           [+] Used marks (CH-9)
  ├── [GAP] updated_at moves only on change                ├── [GAP] pick class → mark → dimmed + date badge
  └── [GAP] anon/authenticated cannot execute              ├── [GAP] edit date → one row, new date
[+] my_chain_hooks (definer)                               ├── [GAP] other class → undimmed
  ├── [GAP] owner: own chains only                         └── [GAP] unmark → row gone
  ├── [GAP] copier: original's pool via copied_from      [+] Error states (D3)
  ├── [GAP] no activity in chain → nothing                 ├── [GAP] list renders unchanged when the read rejects  CRITICAL
  ├── [GAP] student session → empty (planted row too)      └── [GAP] chain page "Couldn't load hooks" + Retry refetches
  └── [GAP] retired hooks excluded
[+] class_hook_use RLS (is_class_teacher)
  ├── [GAP] other teacher: no read, no write
  └── [GAP] student: nothing
[+] Activities list: links per distinct chain [GAP]; existing rows/delete/undo/listing [★★★ TESTED, must stay green]

COVERAGE: 0/33 proposed paths tested (all new)  |  existing Activities behavior: tested, at risk → CRITICAL regression row
QUALITY: n/a (no new tests yet)  |  GAPS: 33 (1 manual E2E)
Legend: ★★★ behavior + edge + error  |  ★★ happy path  |  ★ smoke  |  [→E2E] integration
```

**Required tests (all proof of approved behavior; no new policy, so no
further question):**

| file | asserts | kind | value card |
|---|---|---|---|
| `scripts/tests/batch-import.test.mjs` (extend) | fixture hook registry → exact dry-run counts; revision mismatch refuses; unknown chain and unknown skill each fail `--strict` (exit measured without a pipe); missing-RPC fails soft naming 00NN; mass retire refuses without the flag | unit | protects=the mirror never writes a wrong or tampered file; fails_when=revision check, strict routing or guard is removed; why_new=no hook path exists; seam=none |
| `scripts/verify-00NN.sql` (new, added to `AUTH_VERIFY_SET`) | sync is service-only; apply=false writes nothing; retire/un-retire; owner reads own pools via `my_chain_hooks`; copier reads the original's pool; copier with the original SOFT-deleted still reads it (D2); teacher with no activity in a chain reads nothing; student session reads nothing even with a planted owned row; `class_hook_use` other-teacher read/write refused, student refused; a mark on a retired hook survives and returns on un-retire | SQL verify | protects=teachers-only, copy scope, class scope; fails_when=the teacher gate, the copy join or `is_class_teacher` is dropped; why_new=new tables and RPCs; seam=none |
| `packages/app/src/__tests__/Activities.test.tsx` (extend) | mock `lib/chainHooks` like `lib/bank`; one link per distinct chain with a live pool, none without; **CRITICAL:** rejecting read → rows, delete/undo and listing behave exactly as before, no notice (D3) | unit | protects=the list survives a failed or missing hook RPC; fails_when=the fetch is awaited inside the list load or an error bubbles; why_new=the 0054 push-before-apply incident; seam=none |
| `packages/app/src/__tests__/ChainHooks.test.tsx` (new) | sentinel prompt renders; note containing `$4` renders `$4`; pool order kept; "Opens: <label>"; class picker → mark → dimmed with date; other class undimmed; edit date keeps one row; failure → "Couldn't load hooks" + Retry refetches (D3) | unit | protects=literal rendering, per-class marks, the honest error; fails_when=text goes through the markdown renderer, or marks key on the wrong class; why_new=new route; seam=none |
| drawer link (extend the config-drawer test) | "This unit's hooks →" shows only when the activity has a chain | unit | protects=no dead link on a hand-made activity; fails_when=the link renders unconditionally; why_new=new element; seam=none |

**Mutation tests, one per guard, run once on the day each is written:**
- drop `current_user_is_teacher()` from `my_chain_hooks`: the student row goes red;
- drop the copy join: the copier row goes red;
- add a `deleted_at is null` on the original: the D2 row goes red;
- route the note through the markdown renderer: the `$4` test goes red;
- await the hook fetch inside the list load and reject it: the CRITICAL list test goes red.

**Tests made obsolete by this plan:** none.

Dispositions (Section 3): the regression contract is D3 → A; every table row above is accepted as proof of approved behavior.

## Section 4: Performance

1. **[P3] (8/10) Fetch the hooks alongside the list, never before it.**
   `my_chain_hooks` runs in parallel with the Activities list query and
   resolves into link state afterwards. One extra round trip, off the list's
   critical path (this is also what D3's contract tests).
2. **[P3] (7/10) Scale.**
   - One teacher owns about 150 activities (the planned catalogue), across at
     most 17 chains with pools.
   - The RPC joins the caller's activities through the existing partial index
     `activities_owner_idx on activities (owner_id) where deleted_at is null`
     (`0001_initial_schema.sql:111`) and at most one original per copy (PK).
   - It reads `chain_hook` by its primary-key prefix `(owner_id, …)`. The
     result is a few KB of jsonb.
   - `class_hook_use` reads by PK prefix `class_id`.
   - No index is added beyond the two primary keys. Revisit only if a teacher
     passes about 1,000 activities.
3. **[P3] (8/10) No caching layer.** The data changes only when an import
   runs, and one call per page load is cheaper than any invalidation scheme.

Dispositions (Section 4): all accepted as build details. No questions.

## Outside voice

Codex preflight: `CODEX_MODE: not_installed`, so outside-model coverage is
unavailable (install with `npm install -g @openai/codex`). As the author
pre-authorized ("consider Fable for the outside opinion if it seems needed"),
the second opinion ran as ONE read-only Claude subagent on **Fable 5.1**
(`claude-fable-5-1`, Plan type, foreground). It is a different model in the
same harness, so it is recorded as an in-host fallback, NOT as outside
coverage.

```
OUTSIDE VOICE (Claude subagent, Fable 5.1), summarized faithfully; findings verified by the parent:
1 High:   my_chain_hooks' copier hop trusts activities.copied_from_activity_id, which any teacher can
          rewrite (update policy has no column list, no trigger). Point an owned row at any uuid ->
          read that owner's hooks for ANY chain, listed or not. Verify script as drafted would pass.
2 Medium: source_path is equally client-writable; safe because the direct branch keys on the caller's
          own owner_id. Pin it with a verify row. The importer moves source_path (0041), so an
          original's chain can change under a copier (intended; state it).
3 Medium: "copy of a copy unreachable" is UI-only: copy_bank_activity never checks copied_from is null,
          and visibility is client-writable. A copy-of-a-copy has no source_path, so it fails safe.
          Pre-existing: a direct visibility write also bypasses is_bank_lister.
4 Medium: the build need not wait for their generator PR; the shape is fixed, the revision check is
          generic, tests run on a fixture. Only the live import depends on the PR.
5 Low:    class_hook_use WITH CHECK must pin marked_by = auth.uid(); marked_by -> users needs an explicit
          on delete (default NO ACTION would be a new, unlisted purge blocker, 0050:1370-1380).
6 Low:    the {chain_id: [hooks]} result shape cannot hold two owners' pools for one chain.
7 Low:    readChainRegistry (batch-import.mjs:502) does not strip ^\d+- today; the chain check is new parsing.
Checked clean: teacher gate, copy-then-delete, students, the mass-retire correction, the p_owner existence check.
Recommendation (theirs): hold the build until #1 has a ruled fix.
```

**Parent verification:**
- **#1 CONFIRMED (9/10).** `0013_student_identity.sql:152-157`:
  `alter policy activities_update_own … with check (owner_id = (select
  auth.uid()) and (select current_user_is_teacher()))`. No column list.
  `grep` finds no trigger on `activities` and no column-level grant. The
  INSERT policy (`0013:146`) is equally open, so a teacher can also INSERT a
  row carrying any `copied_from_activity_id`. The honest copy path writes it
  only inside `copy_bank_activity`, a SECURITY DEFINER function
  (`0054:251-316`, which also writes an `activity.bank_copy` audit row). →
  **D4.**
- **#2 accepted** as required proof: verify row "a teacher with a hand-set
  `source_path` and no pool of their own reads nothing".
- **#3 accepted as a correction:** Section 1 #5 should read "fails safe", not
  "unreachable". The `visibility` / `is_bank_lister` bypass is pre-existing
  Bank scope, filed as a TODO (below), not fixed here.
- **#4 is a sequencing choice** against ruled CH-12 → **D5.**
- **#5 accepted as a detail:** `with check (marked_by = (select auth.uid()) and
  is_class_teacher(class_id))`, and `marked_by … on delete set null`, keeping
  it off the purge's hand-kept blocker list.
- **#6 accepted, following the BK-7 precedent** ("The copy owner's entry for a
  term always wins", `0054:322-324`): the caller's own pool for a chain wins,
  and the original owner's is the fallback. One pool per `chain_id` in the
  result.
- **#7 accepted as a correction:** the chain check builds a new
  folder→chain_id map (strip `^\d+-`) from `readChainRegistry`'s entries.

## Decision ledger

### R1: what a copier sees when the Bank original is soft-deleted
Finding: Section 1 #2, P2, confidence 8/10, `0054_activity_bank.sql:55`, reviewer: Claude (plan-eng-review).
Plan baseline: unspecified. CH-6 ruled "owner plus Bank copiers"; it did not cover a deleted original.
Runtime evidence: `copied_from_activity_id uuid references activities(id) on delete set null` (0054:55). Activities are soft-deleted (`deleted_at`) by the client, and the row survives until purge. The original owner's `chain_hook` rows are unaffected by deleting one activity.
Comparison grid:

| Choice | Current | A | B |
|---|---|---|---|
| R1 soft-deleted original | unspecified, pending | copier keeps the pool (resolve chain from the original's row regardless of its `deleted_at`) | copier loses the pool (join requires the original `deleted_at is null`) |
| Hard-deleted original | link nulled, no hooks (fixed by FK) | unchanged | unchanged |
| Teacher-only gate (Sec 1 #1) | required proof of CH-6 | unchanged | unchanged |

Question D2:
D2 — When the original of a Bank copy is deleted, does the copier keep the unit's hooks?
Project/branch/task: main, the chain hook view build (my_chain_hooks read RPC).
ELI10: A colleague's copy finds its unit's hooks through your original activity. If you delete that original (a soft delete, so the row still exists on the server), the server can still see which unit it was in. We can keep showing the colleague the hooks, or stop.
Stakes if we pick wrong: a colleague mid-unit loses their hooks because you tidied your library, or deleted content stays reachable.
Recommendation: A because the hooks belong to the unit, not to that one activity row, and the copier's own activity still exists.
Note: options differ in kind, not coverage — no completeness score.
Pros / cons:
A) Keep the hooks (recommended)
  ✅ A colleague teaching a copy keeps their hook pool when the author tidies or deletes the original activity
  ✅ Matches the copy itself, which also survives the original's deletion (copy-on-use, BK-1)
  ❌ Hooks stay reachable through a deleted row until a hard delete nulls the link (FK on delete set null)
B) Drop the hooks
  ✅ Deleting the original cleanly removes everything reached through it, with no lingering link
  ❌ A colleague's chain page goes empty mid-unit with no explanation, for an action they did not take
Net: keeping the pool follows the copy's own survival rule; dropping it is tidier but surprises the copier.
Header: D2 Deleted orig
Options:
A) Keep the hooks (recommended)
The copier still sees the unit's hook pool after the original is soft-deleted; my_chain_hooks resolves the chain from the original's row whatever its deleted_at. A hard delete still cuts the link (FK). Verify row: soft-delete the original, the copier still gets the pool. Human ~10 min / CC ~2 min.
B) Drop the hooks
The copier stops seeing the pool once the original is soft-deleted; the join requires the original's deleted_at is null. Verify row: soft-delete the original, the copier gets no pool. Human ~10 min / CC ~2 min.

State: approved
Actual answer: A) Keep the hooks (author, D2, 2026-10-08)
Accepted scope: my_chain_hooks resolves a copy's chain from the original's row whatever its deleted_at; a hard delete still cuts the link through the FK; verify row "soft-delete the original, the copier still gets the pool". The teacher-only gate and the hard-delete behavior are unchanged.
History: none

### R2: regression contract, the Activities list and the chain page when the hook read fails
Finding: Section 1 #4 / Section 3 regression rule, P1, confidence 8/10, `packages/app/src/__tests__/Activities.test.tsx:26-59` (the list load + rpc mocks), reviewer: Claude (plan-eng-review). History: a push before an apply once broke the Activities list (memory activity-bank-0054); `my_chain_hooks` is a NEW RPC, so the same window exists (PGRST202 until 00NN is applied).
Plan baseline: unspecified. CH-7 ruled the link and the page; failure behavior was not covered.
Runtime evidence: Activities loads `from('activities')…order()` and the Bank lister flag; any rejected promise in that path is today's blast radius. The tests mock `lib/bank` precisely so rpc call counts stay about deleting (`:49-51`).
Comparison grid:

| Choice | Current | A | B | C |
|---|---|---|---|---|
| R2 list when the read fails | n/a (no read) | list renders unchanged, no hook links, no notice | same as A | list renders, small "Hooks unavailable" note |
| R2 chain page when the read fails | n/a | "Couldn't load hooks" + Retry | blank pool, no notice | "Couldn't load hooks" + Retry |
| Existing list behavior (rows, delete/undo, listing) | tested | preserved; tests mock `lib/chainHooks` like `lib/bank` | same | same |
| D2 soft-deleted original | approved A | unchanged | unchanged | unchanged |

Question D3:
D3 — What do teachers see if the hook lookup fails?
Project/branch/task: main, the chain hook view build (Activities list + chain page).
ELI10: The Activities list will make one extra call to fetch hook pools. If that call fails, for example in the gap between pushing the page and applying the migration (this exact gap once broke the Activities list), the list must still work. The question is what the teacher sees instead of hooks, and the tests will lock that in.
Stakes if we pick wrong: the Activities list breaks for every teacher on a failed call, or hooks vanish with no sign anything is wrong.
Recommendation: A because the list's job is the list, so it stays quiet, while on the chain page the hooks ARE the content, so it says so and offers Retry.
Completeness: A=10/10, B=7/10, C=9/10
Pros / cons:
A) Quiet list, page says so (recommended)
  ✅ The Activities list renders exactly as today when the lookup fails; only the hook links are missing
  ✅ The chain page names the failure and offers Retry, so a teacher is never left with a silently empty pool
  ❌ A teacher on the list alone gets no sign that the hook links are temporarily missing
B) Quiet everywhere
  ✅ Smallest UI: no error states to design, word or test beyond "does not crash"
  ❌ A failed load on the chain page looks exactly like a chain with no hooks: a silent failure
C) Note on both
  ✅ Every surface tells the teacher when hooks could not load
  ❌ A note on the list during a deploy gap shows to every teacher for a feature most units do not have yet
Net: protect the list absolutely, and be honest only where hooks are the point.
Header: D3 Read fails
Options:
A) Quiet list, page says so (recommended)
Contract: the list renders unchanged when my_chain_hooks rejects or is missing (no links, no notice); the chain page shows "Couldn't load hooks" with Retry. Tests: list with a rejecting lib/chainHooks still renders rows and delete/undo; chain page shows the error and Retry refetches; existing Activities tests mock lib/chainHooks like lib/bank. Human ~1.5 h / CC ~15 min.
B) Quiet everywhere
Contract: both surfaces render without hooks and show nothing on failure. Tests: the list renders with a rejecting lib/chainHooks; the chain page renders an empty pool. Human ~1 h / CC ~10 min.
C) Note on both
Contract: the list shows a small "Hooks unavailable" note and the chain page shows "Couldn't load hooks" with Retry. Tests: both notices render on rejection; the list still renders rows and delete/undo. Human ~2 h / CC ~20 min.

State: approved
Actual answer: A) Quiet list, page says so (author, D3, 2026-10-08)
Accepted scope: the list renders unchanged when my_chain_hooks rejects or is missing (no links, no notice); the chain page shows "Couldn't load hooks" with Retry. Tests: list with a rejecting lib/chainHooks still renders rows and delete/undo; chain page shows the error and Retry refetches; existing Activities tests mock lib/chainHooks like lib/bank. D2 stays approved A.
History: none

### R3: close the copy-provenance forgery before the copier hop ships
Finding: Outside voice #1, P1 (security), confidence 9/10, `supabase/migrations/0013_student_identity.sql:146,152-157`, reviewer: Fable 5.1 subagent, verified by the parent.
Plan baseline: CH-6 (owner + Bank copiers), D1 (one RPC `my_chain_hooks`), D2 (A, keep hooks when the original is soft-deleted). All three assumed `copied_from_activity_id` is written only by `copy_bank_activity`.
Runtime evidence: no trigger on `activities`, no column grant; the insert and update policies check only `owner_id = auth.uid()` and `current_user_is_teacher()`. So any teacher can set `copied_from_activity_id` on an owned row to any activity id that reaches them (student links carry it, `/a/:activityId`). Precedent for the fix: `users_timezone_guard` (`0036_check_rollup.sql:64-95`), "current_user is the CLIENT role under PostgREST ('authenticated'/'anon'); definer functions run as their owner".
Comparison grid:

| Choice | Current | A | B | C | D |
|---|---|---|---|---|---|
| R3 provenance columns | client-writable on insert and update | BEFORE INSERT OR UPDATE trigger on `activities` refuses a client-role (`authenticated`/`anon`) insert carrying, or update changing, `copied_from_activity_id`/`copied_from_version_id`; `copy_bank_activity` (definer) and the importer (service) unaffected | unchanged (accept the hole) | unchanged; investigate only | unchanged; decide later |
| Copier hop in `my_chain_hooks` | approved CH-6/D1 | ships, gated on trusted provenance | ships on forgeable provenance | waits on the investigation | waits |
| D2 soft-deleted original | approved A | unchanged | unchanged | unchanged | unchanged |
| Verify | drafted | + forged insert refused, + forged update refused, + honest copy still works, + a forged row reads no pool; mutation: drop the trigger, forged rows go red | none added | none | none |

Question D4:
D4 — Lock the "copied from" link so it cannot be forged?
Project/branch/task: main, the chain hook view build (my_chain_hooks copier hop); found by the Fable outside voice, confirmed in 0013:146-157.
ELI10: A colleague's copy finds your hooks through a hidden "copied from" link on their activity. Today any teacher can write that link themselves, pointing it at ANY activity whose id they can see (every student link contains one). The server would then hand them that unit's hooks, including the answer-bearing notes, even for units you never put in the Bank. The fix is a small database guard: only the real copy button (and the importer) may set that link. A guard of this exact kind already protects a column on users.
Stakes if we pick wrong: any teacher account, or a student who self-attests as a teacher, can read hook notes for any unit by planting one link.
Recommendation: A because it closes the hole at its root for every reader of the link (this feature, the glossary fallback, the Bank's "From the Activity Bank" label), with a precedent already in the repo.
Completeness: A=10/10, B=3/10, C=5/10, D=3/10
Pros / cons:
A) Apply this change (recommended)
  ✅ The copier hop can trust the link: only copy_bank_activity and the service-role importer can ever write it
  ✅ Reuses the users_timezone_guard pattern (0036) that the repo already verifies and relies on
  ❌ One more trigger on activities, a hot table, though it only compares two columns per write
B) Keep this row's current value
  ✅ No migration change beyond the ruled build
  ❌ Ships teacher-only answer notes behind a link any teacher can forge: the plan's central safety claim fails
C) Investigate before choosing
  ✅ Leaves time to weigh the alternatives (gate on the bank_copy audit row, or drop the copier hop from v1)
  ❌ Blocks the copier hop and its verify rows until a second round; the trigger is already the precedent-backed answer
D) Defer this proposed change only
  ✅ Lets the rest of the review finish now
  ❌ Leaves R3 unresolved, and the copier hop cannot be built safely until it is answered
Net: a ten-line guard with a repo precedent, against shipping a forgeable door to answer-bearing notes.
Header: D4 Lock link
Options:
A) Apply this change (recommended)
Add a BEFORE INSERT OR UPDATE trigger on activities that raises when current_user in ('authenticated','anon') inserts a row with copied_from_activity_id/copied_from_version_id set, or changes either on update. copy_bank_activity (definer) and the importer (service role) are unaffected. Verify rows: forged insert refused, forged update refused, honest copy still works, a forged row reads no pool; mutation: drop the trigger, those rows go red. Human ~1 h / CC ~10 min.
B) Keep this row's current value
No guard; the copier hop resolves provenance as written, and a teacher who writes the link reads that owner's hooks. No new verify rows. Human 0 / CC 0.
C) Investigate before choosing
Bounded: compare the trigger with an audit-row gate (activity.bank_copy, 0054:310) and with dropping the copier hop, report back, implement nothing. The copier hop and its verify rows wait; every other approved item is unchanged. Human ~1 h / CC ~15 min.
D) Defer this proposed change only
R3 stays unresolved and the copier hop cannot be built until it is answered; every other approved item is unchanged. Human 0 / CC 0.

State: approved
Actual answer: A) Apply this change (author, D4, 2026-10-08)
Accepted scope: a BEFORE INSERT OR UPDATE trigger on activities that raises when current_user in ('authenticated','anon') inserts a row with copied_from_activity_id/copied_from_version_id set, or changes either on update; copy_bank_activity (definer) and the importer (service role) unaffected. Verify rows: forged insert refused, forged update refused, honest copy still works, a forged row reads no pool; mutation: drop the trigger, those rows go red. The copier hop ships gated on this; D2 stays A.
History: none

### R4: build order, start before the curriculum generator PR lands?
Finding: Outside voice #4, P2, confidence 8/10, this file's CH-12 ("Their generator lands … → This side builds") and §Joint contract ("They send it to us for a pre-merge check against this import plan"), reviewer: Fable 5.1 subagent.
Plan baseline: CH-12 as ruled 2026-10-08: their generator first, then our build, then the author applies, then the import.
Runtime evidence: the file shape is fixed (C-97, "No additions"); `checkFactRegistryRevision` is already generic (`batch-import.mjs:187-191`); the importer suite runs on fixtures (`scripts/tests/batch-import.test.mjs`). A pre-merge check of a generated file can only run a real dry run against a working `--hook-registry` flag.
Comparison grid:

| Choice | Current | A | B | C | D |
|---|---|---|---|---|---|
| R4 when the build starts | after their generator PR (CH-12) | now, against a hand-made fixture in the agreed shape; the pre-merge check becomes a real dry run on their PR's file | after their PR (unchanged) | unchanged; investigate only | unchanged; decide later |
| Migration apply + push order | author applies before the UI is pushed (OV-7) | unchanged | unchanged | unchanged | unchanged |
| The live import (CH-12 step 4) | after their PR merges | unchanged | unchanged | unchanged | unchanged |
| D2, D3, D4 | approved | unchanged | unchanged | unchanged | unchanged |

Question D5:
D5 — Start building now, before the curriculum side's generator PR lands?
Project/branch/task: main, the chain hook view build (CH-12 sequencing).
ELI10: You ruled "their generator first, then we build". But the file's shape is already agreed, and our tests run on a sample file anyway. If we build first, their pre-merge check becomes a real dry run of their actual file through our real importer, instead of a read-through. The live import still waits for their PR, and you still apply the migration before anything is pushed.
Stakes if we pick wrong: either a pre-merge check that can't actually run the file, or the build arc opening while their PR is still in flight.
Recommendation: A because it turns their pre-merge check from reading into running, and nothing live moves earlier.
Completeness: A=10/10, B=7/10, C=5/10, D=5/10
Pros / cons:
A) Apply this change (recommended)
  ✅ Their PR's pre-merge check becomes a real --dry-run of the generated file through the shipped importer
  ✅ Nothing live moves earlier: the apply-before-push and import-after-merge rules are unchanged
  ❌ Opens the build arc while their PR is in flight; a late shape change would mean a small fixture and test edit
B) Keep this row's current value
  ✅ Keeps your ruled order exactly, and the build sees their real file from the first line of code
  ❌ The pre-merge check can only read the file, and the build idles until #54 and their PR both merge
C) Investigate before choosing
  ✅ Leaves room to ask the curriculum side how soon their PR will be ready
  ❌ A round trip for a question whose answer does not change the risk of building against a fixed shape
D) Defer this proposed change only
  ✅ Lets the review close without settling the build date
  ❌ Leaves CH-12's order open; the next session would have to ask again
Net: build against the agreed shape now, so their file meets working code at the check.
Header: D5 Build order
Options:
A) Apply this change (recommended)
Start the build now against a hand-made fixture in the C-97 shape; the pre-merge check on their PR is a real --dry-run of the generated file through our importer. Unchanged: the author applies the migration before the UI is pushed, and the live import waits for their PR to merge. Human 0 extra / CC 0 extra.
B) Keep this row's current value
Build only after their generator PR lands (CH-12 as ruled); the pre-merge check reads the file against this plan. Apply-before-push and import-after-merge unchanged. Human 0 / CC 0.
C) Investigate before choosing
Bounded: ask the curriculum session for their PR's expected date in the next letter, report back, change nothing. Human ~5 min / CC ~5 min.
D) Defer this proposed change only
CH-12's order stays as ruled for now and R4 stays open for the next session; everything else unchanged. Human 0 / CC 0.

State: approved
Actual answer: A) Apply this change (author, D5, 2026-10-08)
Accepted scope: the build may start now against a hand-made fixture in the C-97 shape; the pre-merge check on their PR is a real --dry-run of the generated file through our importer. Unchanged: the author applies the migration before the UI is pushed, and the live import waits for their PR to merge. D2, D3, D4 unchanged.
History: CH-12 as ruled (generator first, then build) is superseded on the build start only. **Amended 2026-10-08 (author, after C-98):** their PR #55 (head 8d4faa9) arrived before our flag existed. The author ruled it may MERGE NOW, on a file-level pre-merge check (B-126): the revision re-derived with checkFactRegistryRevision = d9635393…5d0; 5 chains and 13 hooks match the graph in order and text; ids resolve. T7 becomes the first `--dry-run --strict` against their main once T3 is built.

### R5: the Bank listing flag bypass (TODO candidate)
Finding: Outside voice #3, P2, confidence 9/10, `0013_student_identity.sql:152-157` + `0055_bank_authors.sql:111-116,193`, reviewer: Fable 5.1 subagent, verified by the parent (no app code writes `visibility`; the grep of `packages/app/src` finds none).
Plan baseline: out of this plan's scope (pre-existing Bank behavior).
Runtime evidence: as Finding. **Procedure note:** this record was written AFTER the answer. The D6 brief was sent from the review's chat rather than from a saved pre-answer record. The brief's full text is the AskUserQuestion payload of D6 in this session.
Question D6: TODO, the Bank's listing flag can be set directly. A) Add to TODOS.md / B) Skip / C) Build it now in this PR (recommended C).
Header: D6 Bank TODO

State: approved
Actual answer: A) Add to TODOS.md (author, D6, 2026-10-08)
Accepted scope: a TODOS entry under "Activity Bank follow-ons (0054, 2026-10-07)" with What/Why/Pros/Cons/Context/Depends on D4/Trigger; nothing changes in this build.
History: none

Approval readiness: PASS. Checked R1 (D2 → A), R2 (D3 → A), R3 (D4 → A), R4 (D5 → A), R5 (D6 → A), plus the scope record (D1 → A). Every other accepted item is required proof of an approved ruling (CH-1..CH-12, CH-9a-d), with its answer cited in §Rulings.

## Implementation Tasks
Synthesized from this review's findings. Each task derives from a specific
finding above. Run with Claude Code or Codex; checkbox as you ship.

- [ ] **T1 (P1, human: ~1 day / CC: ~40 min)**: database, migration 00NN
  - Surfaced by: Scope record (D1), Section 1 #1–#3, D2, D4, Outside voice #2, #5, #6.
  - Tables: `chain_hook` (owner-keyed, retire-never-delete) and `class_hook_use`:
    - `class_id → classes on delete cascade`;
    - `marked_by → users on delete set null`;
    - `used_on date not null`;
    - RLS `is_class_teacher(class_id)`, WITH CHECK pinning `marked_by = auth.uid()`.
  - Functions:
    - `sync_chain_hooks` (service only; copies 0043's `p_owner` existence check and dry-run shape);
    - `my_chain_hooks()`: definer; `current_user_is_teacher()`; own `source_path`, or the copy's original (whatever its `deleted_at`, D2); the caller's own pool wins (BK-7 rule); returns `{activityChains, chains}`;
    - the client-role provenance guard trigger on `activities` (D4).
  - Grant stanzas; `data-map.md` + `retention-policy.md` rows ("kept while the class row exists; classes are never hard-deleted"); `supabase/migrations/README.md` index.
  - Files: `supabase/migrations/00NN_chain_hooks.sql`, `docs/compliance/data-map.md`, `docs/compliance/retention-policy.md`, `supabase/migrations/README.md`
  - Verify: `node --test scripts/tests/data-map-coverage.test.mjs scripts/tests/migrations-index.test.mjs`
- [ ] **T2 (P1, human: ~4 h / CC: ~25 min)**: verify script + mutations
  - Surfaced by: Section 3 table row 2, D2, D4, Outside voice #2.
  - Files: `scripts/verify-00NN.sql`, `scripts/verify-runner.mjs` (`AUTH_VERIFY_SET`)
  - Verify: the local verify run green, then each of the five mutations turns its row red once.
- [ ] **T3 (P1, human: ~1 day / CC: ~40 min)**: importer `--hook-registry`
  - Surfaced by: Scope finding 1, Section 2 #1–#3, #5, Outside voice #7, D5.
  - Reuse `checkFactRegistryRevision`; a new folder→chain_id map (strip `^\d+-`); skills check; route warnings into `catalogueWarnings`; fail soft through the missing-object regex; `isMassRetire` + `--allow-mass-retire`; dry-run report. Build against a hand-made fixture in the C-97 shape.
  - Files: `scripts/batch-import.mjs`, `scripts/tests/batch-import.test.mjs`, a fixture under `scripts/tests/fixtures/`
  - Verify: `node --test scripts/tests/batch-import.test.mjs`; strict exit measured without a pipe.
- [ ] **T4 (P1, human: ~3 h / CC: ~20 min)**: `lib/chainHooks.ts` + the Activities-list link
  - Surfaced by: Section 1 #3, #4, D3, Section 4 #1.
  - Fetch in parallel with the list, fail soft, one link per distinct chain.
  - Files: `packages/app/src/lib/chainHooks.ts`, `packages/app/src/routes/Activities.tsx`, `packages/app/src/__tests__/Activities.test.tsx`
  - Verify: `pnpm --filter @activity/app test -- Activities`
- [ ] **T5 (P1, human: ~1 day / CC: ~40 min)**: the chain page
  - Surfaced by: CH-7/CH-8/CH-9a-d, Scope findings 3–4, D3, Section 2 #6.
  - A lazy route; route-scoped screen + print CSS (never `index.css`); literal text; class picker (localStorage in try/catch); marks with a native date input defaulting to the browser's local date; "Couldn't load hooks" + Retry.
  - Files: `packages/app/src/routes/ChainHooks.tsx`, its CSS, `packages/app/src/App.tsx`, `packages/app/src/__tests__/ChainHooks.test.tsx`
  - Verify: `pnpm --filter @activity/app test -- ChainHooks`; `node scripts/check-perf-budget.mjs` (shell JS under 156.5, shell CSS at or under 15.0)
- [ ] **T6 (P2, human: ~1 h / CC: ~10 min)**: the editor drawer link
  - Surfaced by: CH-7.3.
  - Files: `packages/app/src/components/ActivityConfigDrawer.tsx` + its test
  - Verify: the drawer test with and without a chain.
- [ ] **T7 (P2, human: ~1 h / CC: ~10 min)**: the pre-merge check of the curriculum generator PR
  - Surfaced by: D5, the Joint contract.
  - Run `pnpm import:batch … --hook-registry <their file> --dry-run --strict` against their MAIN (PR #55 merged before the flag existed, per the author's 2026-10-08 ruling) and reply by letter.
  - Files: none (a letter)
  - Verify: exit 0 and the expected chain and hook counts.
- [ ] **T8 (P2, human: ~1 h / CC: ~10 min)**: docs close-out
  - Surfaced by: the CLAUDE.md close-out rule.
  - An As-built section, STATE/TODOS pointers, and the pending author actions (apply 00NN, then push, then import).
  - Files: `docs/design/chain-hooks-view.md`, `STATE.md`, `TODOS.md`
  - Verify: `pnpm verify`.

## NOT in scope
- **D49 correctives:** none exist; trigger is the first corrective file on their main.
- **The per-activity generated view (ask 2):** its own trigger, the first activity taught by a colleague.
- **Hooks in the Bank:** CH-7.5; trigger is a colleague asking to see hooks before copying.
- **The Bank listing-flag bypass:** D6, filed in TODOS.
- **A hook-ids-retired ledger reader:** belt over their generator's gate; decided at build only if cheap.
- **Any student surface:** hooks are teacher-only (CH-6).

## What already exists (reused, not rebuilt)
- **`sync_glossary_entries` (0043 §C):** shape copied for `sync_chain_hooks`; extraction rejected (Section 2 #4).
- **`glossary_for_activity` copier fallback (0054:326):** pattern and own-wins rule for `my_chain_hooks`.
- **`current_user_is_teacher()` (0013:114) and `is_class_teacher()` (0014):** gates.
- **`users_timezone_guard` (0036:64-95):** pattern for the D4 provenance trigger.
- **`checkFactRegistryRevision` (batch-import.mjs:187):** reused as-is.
- **`isMassRetire` / `--allow-mass-retire` (batch-import.mjs:1888):** reused.
- **The missing-object regex (batch-import.mjs:1885):** fail-soft path.
- **`lazy()` routes in `App.tsx` and route-scoped CSS (`FactsTeacher.tsx:56`):** reused.
- **The `lib/bank` mock pattern in `Activities.test.tsx`:** reused for `lib/chainHooks`.

## Failure modes

| path | realistic failure | covered by | user sees |
|---|---|---|---|
| push before apply | `my_chain_hooks` missing (PGRST202) | D3 CRITICAL list test | list unchanged; chain page "Couldn't load hooks" + Retry |
| import | tampered or stale file | revision refuse test | importer names the file and refuses |
| import | migration not applied | fail-soft test | importer names 00NN |
| import | a bad file retires hooks | dry-run report + guard | retires listed by id; reversible on next good run |
| read | forged provenance | D4 verify rows + mutation | refused at write time |
| read | original hard-deleted | FK set null | copier's pool disappears (accepted, BK-1) |
| marks | wrong class | RLS verify rows | write refused |
| render | `$`-bearing text | literal-text test | text exactly as authored |

Critical gaps (no test AND no handling AND silent): **0**.

## Worktree parallelization strategy

| Step | Modules touched | Depends on |
|------|----------------|------------|
| T1 migration | supabase/migrations, docs/compliance | — |
| T2 verify | scripts (verify) | T1 |
| T3 importer | scripts (batch-import) | T1's RPC signature only |
| T4–T6 app | packages/app | T1's RPC result shape |
| T7 pre-merge check | none | T3 + their PR |

Lane A: T1 → T2 (shared supabase/). Lane B: T3 (scripts/, independent once the
sync signature is fixed). Lane C: T4 → T5 → T6 (packages/app/). Execution: write
T1 first, so the RPC shapes are fixed, then run A, B and C in parallel and merge.
Conflict flags: `scripts/` is shared by T2 and T3 (different files). Parallel
sessions share this checkout, so a single session runs the lanes sequentially.

## Unresolved decisions
None.

## Completion summary
- Step 0: Scope Challenge: scope accepted as-is (D1 smaller arrangement keeps every ruled feature)
- Architecture Review: 5 issues found
- Code Quality Review: 6 issues found
- Test Review: diagram produced, 33 gaps identified (all unbuilt code; 1 CRITICAL regression row settled by D3)
- Performance Review: 3 issues found
- NOT in scope: written
- What already exists: written
- TODOS.md updates: 1 item proposed to user (D6 → added)
- Failure modes: 0 critical gaps flagged
- Unresolved decisions: 0 in this review
- Outside voice: Codex not installed (unavailable); in-host fallback ran on Fable 5.1 by the author's pre-authorization, 7 findings, #1 a confirmed P1 security hole (D4)
- Parallelization: 3 lanes, 2 parallel after T1 / sequential in one checkout
- Lake Score: 3/3 (D3, D4 and D5 were scored for completeness and each answer picked the 10/10 option; D1, D2 and D6 were kind choices, excluded)

## Suppressed findings (appendix)
- (4/10) The date column could carry a range CHECK (for example, not before
  2020). Suppressed: the native input's `max` plus `not null` is enough, and
  there is no regression it would catch.
- (4/10) `my_chain_hooks` could cache its result in sessionStorage. Suppressed:
  one call per page load costs less than invalidating a cache (Section 4 #3).

# Design review (plan-design-review, 2026-10-08)

**Target:** the UI half of this plan: the `/chains/:chainId` teacher page, the
"Hooks (n)" link on Activities-list unit headers, and the editor drawer line.
Reviewed text-only: the gstack designer has no OpenAI key configured, so no
mockups were made. Outside design voices were skipped (D2: Codex is not
installed; a same-harness check would duplicate the passes).

**System audit:** there is no DESIGN.md. The calibration sources are
- the token roles in `packages/app/src/index.css` (`--color-canvas/surface/ink/muted/line/success/danger/accent`, light-dark());
- the UX lens (`docs/design/ux-lens.md`);
- the closest house precedent, the FactsTeacher page: a lazy route, `ft-` classes in a route CSS file, `.ft-crumb` + `.ft-h1`, "Loading…" muted, `role="alert"` with "Something went wrong loading this. Check your connection, then try again.", and status shown with an icon plus words, never colour alone (DR-21);
- the Activities list's unit header: an `h2`, a muted count, and muted underlined text actions (`Activities.tsx:637-668`).

Step 0: 5/10 (content and order ruled; page shell, states, mark
interaction, accessibility and print not specified). Focus: all 7 passes (D1).

## Pass 1: Information architecture (4/10 → 9/10)

**1A (ruled): the unit title is the heading.**

```
Activities / Angles and Parallel Lines        crumb (.ch-crumb), links to /activities
Angles and Parallel Lines                     h1 (.ch-h1) = the unit title of the chain's activities
Questions to open a lesson. Pick one when your class's day begins.   muted subtitle, one line
Class: [9MAT2 ▾]                              the ruled picker (CH-9b)
Hooks · 2                                     h2 section, pool order
  ┌ prompt (the anchor) / Opens: <skill label> / Teacher notes / mark controls ┐ (per hook)
Activities in this unit                       h2 section, teaching order, rows link to /activity/:id
```

Document title: "<unit> — Hooks". **Recorded house pattern (not a new
choice):** the list's "Hooks (n)" link is a muted underlined text action in
the unit header row, to the left of "List unit in the Bank" when both show.
Remaining gap (keeps it at 9): none material.

## Pass 2: Interaction states (3/10 → 9/10)

Ruled: **2.1A** (no link to an empty unit; the page still explains), **2.2A**
(no class means no marks, plus one quiet line), **2.3A** (optimistic, with an
honest failure). Loading and the read failure follow house patterns (FactsTeacher;
D3), recorded rather than re-asked. Note: after curriculum PR #55, 5 of the 17
chains have pools, so 12 do not. (The 2.1 question said 14, which was wrong;
the ruling stands.)

```
FEATURE            | LOADING              | EMPTY                                   | ERROR                                         | SUCCESS                         | PARTIAL
-------------------|----------------------|-----------------------------------------|-----------------------------------------------|---------------------------------|--------------------------------
Chain page (whole) | "Loading…" muted,    | no live hooks: under "Hooks", "No hooks | role=alert "Couldn't load hooks. Check your  | header + pool + activities      | pool loads, activities empty:
                   | header shows at once | for this unit yet." + muted "Hooks come | connection, then try again." + Retry button  |                                 | the section says "No activities
                   |                      | with the curriculum import. This unit's | (D3); the Activities section still renders   |                                 | in this unit are in your library."
                   |                      | activities are listed below." (2.1A)    | from the list data                           |                                 |
Class picker       | (with the page)      | zero classes: no picker; muted line     | classes read fails: picker hidden, the same  | "Class: [name ▾]", last choice  | classes, none chosen: "Choose a
                   |                      | "Track which hooks a class has used:    | muted line is NOT shown (no false "create a  | remembered (localStorage,       | class"; mark controls hidden
                   |                      | create a class in My classes." (2.2A)   | class" prompt); hooks still readable         | try/catch)                      | until one is picked (2.2A)
Used marks         | marks for the picked | no marks: every hook unmarked           | write fails: card reverts, "Couldn't save ·  | card shows used treatment (Pass | n/a
                   | class load with page |                                         | Try again" text-danger role=status (2.3A)    | 5) instantly, optimistic (2.3A) |
List "Hooks (n)"   | link absent until    | chain without a pool: no link (2.1A)    | read fails: no link, no notice (D3)          | "Hooks (n)" muted text action   | n/a
                   | the read returns     |                                         |                                               |                                 |
Drawer line        | absent until read    | no pool: no line (2.1A)                 | read fails: no line                          | "This unit's hooks →"           | n/a
```

Remaining gap (keeps it at 9): the activities-empty wording is house-style
and was not separately ruled.

## Pass 3: Journey (7/10 → 8/10, no new decision)

```
STEP | TEACHER DOES                                   | FEELS            | PLAN SPECIFIES?
1    | before class, opens Activities, sees Hooks (2) | oriented         | yes (list link, 2.1A)
2    | opens the unit page; last class pre-picked     | quick            | yes (CH-9b, remembered)
3    | scans the unmarked hooks, reads a note         | choosing         | yes (pool order, notes open, "Opens: <skill>")
4    | reads the prompt to the class / puts it up     | confident        | yes (the prompt is the large anchor)
5    | marks it used                                  | done, instantly  | yes (2.3A optimistic)
6    | next lesson: that hook shows "Used 12 Feb"     | trust            | yes (5.1A)
```

5-second: the prompt. 5-minute: the note and the mark. 5-year: the pool grows
by year batch with no layout change. Kept from a 10: "which hook fits today"
lives in the notes' prose ("fire before activity 03"), which is curriculum
content, deliberately not structured (C-97 (f): no status field).

## Pass 4: AI-slop risk (6/10 → 8/10)

Mode: OPERATE (app UI). **4.1A (ruled): one container with hairline
dividers**, the Activities list's D8 pattern:
- one `bg-canvas border border-line rounded-lg` container;
- each hook a padded block (`px-4 py-4`) separated by `border-t border-line`, in pool order;
- no shadow, no per-hook border, no accent stripe.

Hard rejections: none after 4.1A (rule 7, stacked cards, cleared).

Litmus:
1. Product unmistakable: n/a, inside the app shell.
2. One visual anchor: YES, the prompt.
3. Scannable by headings: YES.
4. One job per section: YES.
5. Cards necessary: NO, so none are used.
6. Motion: none, and none needed.
7. Premium without shadows: YES, nothing uses one.

Kept from a 10: the app-wide system-ui chrome font (blacklist #11), which
belongs to the backlogged brand pass (STATE → Backlog (6)) and is out of scope
here.

## Pass 5: Design-system alignment (5/10 → 9/10)

Recorded house pattern: route CSS `routes/chainHooks.css` (or
`practice/`-style sibling), imported only by the lazy route, with `ch-` classes
on the `index.css` roles (`--color-canvas/surface/ink/muted/line/success-strong/danger`),
mirroring `factsTeacher.css`. Nothing goes in `index.css` (shell CSS
14.9/15.0). Buttons copy the app's secondary button. Selects are native
(`Bank.tsx:392` style). The date input is native (eng review §2 #6).

**5.1A (ruled): the used look.**
- The prompt goes from `--color-ink` to `--color-muted` (AA).
- A status line: a check icon plus "Used 12 Feb" in `--color-success-strong`, then a
  "Change date" text action and an "Unmark" secondary button.
- An unmarked hook shows a "Mark used" secondary button.
- No opacity, no strikethrough, no colour-only signal (DR-21).
- Dates are formatted by the existing `formatListDate` (`lib/classActivities.ts:195`): browser locale, month short, year only when it differs. So NZ reads "12 Feb" and US reads "Feb 12".
- ⚠ **Build trap:** `used_on` is a `date`, and `new Date('2026-02-12')` parses as UTC midnight, so a US browser would show Feb 11. Build the Date from its parts (`new Date(y, m - 1, d)`) before formatting. Add a test row pinned to a US timezone.

Kept from a 10: no DESIGN.md exists. `/design-consultation` (the backlog
brand pass) would give these tokens a written home.

## Pass 6: Responsive and accessibility (2/10 → 9/10)

Recorded house pattern:
- the page shell copies FactsTeacher (`max-width: 56rem`, `padding: 24px 16px 64px`);
- below about 480px the controls wrap under the prompt and the class picker goes full width;
- the prompt stays at its size on a phone (it is what gets read aloud);
- dark mode comes free from the light-dark() tokens.

**6.1A (ruled): headed articles and named toggles.**
- The Hooks section is a `<section aria-labelledby>` with an `h2` "Hooks".
- Each hook is an `<article aria-labelledby>` whose prompt is its `h3`, styled as the prompt rather than as a heading.
- "Mark used"/"Unmark" is ONE `<button aria-pressed>`, named "Mark used: <first 8 words of the prompt>…".
- Marking announces "Marked used for <class>" through a polite `role="status"` line.
- Every button and link has a hit area of at least 44×44 px.
- Focus rings use the app's accent focus token, and focus stays on the toggle after it flips.

Kept from a 10: the prompt-as-heading makes long headings, accepted as the cost.

## Pass 7: Unresolved decisions (2 resolved, 0 deferred)

- **7.1A (ruled): print is a reference sheet with no marks.**
  - It shows the unit title (`h1`), one line "Hooks — teacher copy, not for students", then each hook (prompt, "Opens: <skill>", "Teacher notes" + note) with `break-inside: avoid`.
  - The Activities section prints as a plain list.
  - It hides the crumb, the class picker, every button and status line, and all marks.
  - `@page { margin: 0.5in }`, ink on white (CLAUDE.md → baseline print CSS).
- **7.2A (ruled): "Change date" is an inline swap that saves on change.**
  - The action replaces "Used 12 Feb" with `<label>Used on <input type="date" max={local today}></label>`, focused.
  - Choosing a date saves optimistically (2.3A) and restores the line.
  - Esc, or blur without a change, restores the line unchanged.
  - Focus returns to "Change date".

```
DECISION NEEDED                         | IF DEFERRED, WHAT HAPPENS
----------------------------------------|---------------------------
(none left)                             |
```

## Design review: NOT in scope
- **A DESIGN.md / brand pass** (fonts, the system-ui chrome stack): already in STATE → Backlog (6), `/design-consultation`.
- **Mockups:** the gstack designer has no OpenAI key. Run `~/.claude/skills/gstack/design/dist/design setup` and `/design-shotgun` if visuals are wanted before build.
- **A "next hook for this class" highlight:** the pool order plus the used state already answer it; subtraction default.
- **Showing the prompt full-screen for the class:** not asked for (CH-8 declined a copy button); print and the large prompt cover it.

## Design review: what already exists
- **FactsTeacher page shell** (`routes/FactsTeacher.tsx:205-209`, `practice/factsTeacher.css`): crumb, h1, panel, route CSS, loading and error copy, DR-21 status rule.
- **The Activities list's unit header and D8 flat list** (`routes/Activities.tsx:616-700`): header actions, the hairline container.
- **`formatListDate`** (`lib/classActivities.ts:195`).
- **Native `<select>`** (`routes/Bank.tsx:392`).
- **"Couldn't save"** inline danger text (`routes/ActivityPrint.tsx:566`).
- **Token roles** in `index.css`, including `success-strong`.

## Design review: TODOS
None proposed. The only design debt (DESIGN.md, chrome font) is already on the
backlog.

## Design review: Implementation Tasks
Synthesized from this review's findings. These amend the eng-review tasks
(T4–T6) and are built with them.

- [ ] **DT1 (P1, human: ~3 h / CC: ~15 min)**: chain page: header, states and layout
  - Surfaced by: 1A, 2.1A, 2.2A, 4.1A.
  - Crumb and h1 from the unit; one hairline container; the empty-pool, no-class and no-class-chosen states.
  - Files: `packages/app/src/routes/ChainHooks.tsx`, `routes/chainHooks.css`
  - Verify: `ChainHooks.test.tsx` rows: the empty-pool text; zero classes means no controls plus the My classes line; with classes but none chosen, the controls stay hidden.
- [ ] **DT2 (P1, human: ~3 h / CC: ~15 min)**: used marks: look, optimistic save, date edit
  - Surfaced by: 2.3A, 5.1A, 7.2A, and the Pass 5 date trap.
  - Files: `ChainHooks.tsx`, `chainHooks.css`
  - Verify: tests for the used look (muted prompt, check + words); a failed write reverts and shows "Couldn't save · Try again"; the inline date swap (Esc restores); `used_on` "2026-02-12" renders Feb 12 under `TZ=America/New_York`.
- [ ] **DT3 (P1, human: ~2 h / CC: ~10 min)**: accessibility
  - Surfaced by: 6.1A.
  - Files: `ChainHooks.tsx`
  - Verify: tests that each hook is an article with an h3; the toggle has aria-pressed and a named label; the status announcement; then the a11y lane (axe) on the route.
- [ ] **DT4 (P2, human: ~1 h / CC: ~10 min)**: print sheet
  - Surfaced by: 7.1A.
  - Files: `chainHooks.css`
  - Verify: a print-mode render hides the picker, buttons and marks, and shows the "teacher copy" line.
- [ ] **DT5 (P2, human: ~30 min / CC: ~5 min)**: hide the drawer line and the list link without a pool
  - Surfaced by: 2.1A.
  - Files: `components/ActivityConfigDrawer.tsx`, `routes/Activities.tsx`
  - Verify: the drawer and list tests with and without a pool.

## Design review: completion summary

```
  +====================================================================+
  |         DESIGN PLAN REVIEW — COMPLETION SUMMARY                    |
  +====================================================================+
  | System Audit         | no DESIGN.md; tokens in index.css; UI scope: 1 page + 2 links |
  | Step 0               | 5/10; focus: all 7 passes (D1)              |
  | Pass 1  (Info Arch)  | 4/10 → 9/10 after fixes                     |
  | Pass 2  (States)     | 3/10 → 9/10 after fixes                     |
  | Pass 3  (Journey)    | 7/10 → 8/10 after fixes                     |
  | Pass 4  (AI Slop)    | 6/10 → 8/10 after fixes                     |
  | Pass 5  (Design Sys) | 5/10 → 9/10 after fixes                     |
  | Pass 6  (Responsive) | 2/10 → 9/10 after fixes                     |
  | Pass 7  (Decisions)  | 2 resolved, 0 deferred                      |
  +--------------------------------------------------------------------+
  | NOT in scope         | written (4 items)                           |
  | What already exists  | written                                     |
  | TODOS.md updates     | 0 items proposed                            |
  | Approved Mockups     | 0 generated (no OpenAI key), 0 approved     |
  | Decisions made       | 9 added to plan                             |
  | Decisions deferred   | 0                                           |
  | Overall design score | 2/10 → 8/10                                 |
  +====================================================================+
```

Outside design voices: skipped (D2). Unresolved design decisions: none.

# Eng review re-run after the design review (plan-eng-review, 2026-10-08)

**Target:** this file, reviewed for the design-review delta since `ecc095de`: passes
1–7 and DT1–DT5. Eng D1–D6 stand. **Scope Challenge (delta):** no new service
or table; DT1–DT5 touch only files the plan already lists. Below the complexity
gate, so **scope accepted as-is**.

## Re-run Section 1: Architecture
1. **[P2] (8/10) DT5 puts `my_chain_hooks` on the editor's path.** The
   drawer's guide section opens from `ActivityConfigDrawer.tsx:257-264`
   (`onClick={() => onToggle('guide')}`). **Accepted mechanics, the ruled
   outcome unchanged (2.1A):** fetch on the FIRST open of the Teacher guide
   section, never on editor load, and fail soft (no line, per the Pass 2
   table). This adds no cost to opening the editor.
2. **[P3] (7/10) The mark writes go straight to `class_hook_use` under RLS
   (D1 scope record).**
   - Mark: an upsert on `(class_id, hook_id)` with PostgREST
     `Prefer: resolution=merge-duplicates,return=representation`. The
     `return=representation` matters: the importer once crashed on an empty
     201, per the comment at `batch-import.mjs:2188`.
   - Unmark: a delete.
   - Change date: an update.
   - No write is possible before a class is chosen (2.2A).
3. **[P2] (8/10) A date edit can start while the mark's own write is still in
   flight.** 2.3A says a second click during a write "is ignored". The used
   status line (and its "Change date") appears optimistically the instant
   "Mark used" is pressed, so a quick date change would be ignored and lost.
   → **D1-rerun (R7).**

## Re-run Section 2: Code quality
1. **[P1] (8/10) `aria-pressed` conflicts with a label that changes.** 6.1A
   specifies `<button aria-pressed>` with "Mark used"/"Unmark" as its name, and
   5.1A rules two different visible labels. A toggle button whose label
   changes WITH its state double-signals ("Unmark, toggle button, pressed"),
   and the ARIA authoring practice for toggle buttons keeps the label constant.
   → **D2-rerun (R6).** (No repo source to quote. The motivating plan lines are
   §Pass 6 6.1A and §Pass 5 5.1A above, so this is calibrated as a plan
   contradiction, not a code bug.)
2. **[P2] (8/10) DT2's US-timezone test is brittle; test a pure helper
   instead.** Switching `TZ` inside a running vitest worker depends on when
   Node first caches it. **Correction:** a pure `dateOnlyToLocalDate('2026-02-12')`
   helper, asserting `getFullYear/getMonth/getDate` = 2026/1/12, plus one
   assertion that `formatListDate` receives that Date. It holds in any zone, and it
   fails if someone swaps in `new Date(str)` and runs in the US.
3. **[P3] (7/10) The accessible name's "first 8 words".** One small helper
   (`hookShortName`) used by the toggle name and the status announcement, so
   both use the same words.

Dispositions: S1 #1, #2 accepted details; S1 #3 → D1-rerun; S2 #1 → D2-rerun;
S2 #2, #3 accepted corrections.

## Re-run Section 3: Tests (delta)

```
DESIGN-REVIEW PATHS (all proposed)                     COVERAGE
  header/crumb from unit (1A)                          [GAP] unit test
  empty pool / zero classes / none chosen (2.1A, 2.2A) [GAP] unit tests (3 rows)
  optimistic mark, revert + "Couldn't save" (2.3A)     [GAP] unit test with a rejecting write
  in-flight date edit (D1-rerun)                       [GAP] unit test, pending ruling
  used look: muted prompt, check + words (5.1A)        [GAP] unit test (class + text, never colour only)
  inline date swap, Esc restores (7.2A)                [GAP] unit test
  date-only parse (Pass 5 trap)                        [GAP] pure helper test (S2 #2)
  headed articles, toggle semantics (6.1A, D2-rerun)   [GAP] unit test on roles/names
  print sheet hides controls + marks (7.1A)            [GAP] jsdom CANNOT evaluate @media print → D3-rerun
  axe on the chain route                               [GAP] the a11y lane is student-only → D3-rerun
  drawer line only with a pool, fetched on open (DT5)  [GAP] drawer test, 3 rows (pool, none, rejected)
GAPS: 11, all unbuilt code. Regression risk: the editor drawer's existing tests (fetch on open must not fire on mount).
```

**Corrections to the design tasks' Verify lines:**
- DT3's "the a11y lane (axe) on the route" is not existing coverage: no spec
  scans `/chains/:chainId`. ⚠ **Corrected at build (2026-10-08):** this line
  first said the a11y lane was student-only. It is not —
  `e2e/a11y/student-surfaces.e2e.ts:735-800` already scans the teacher
  number-facts page. The ruling (D3-rerun A) is unaffected: the chain page
  still needed its own scan and a real print check.
- DT4's "a print-mode render" cannot run in jsdom.

The precedents for real proof are `print-answer-key.e2e.ts:35`
(`page.emulateMedia({ media: 'print' })`) and the teacher stub
`e2e/helpers/factsTeacherStub.ts` with `signInAs`. → **D3-rerun (R8).**

**Regression (carried, CRITICAL):** the editor drawer's tests must show
`my_chain_hooks` is NOT called on mount, only when the guide section opens.
This is required proof of S1 #1, not a new policy.

## Re-run Section 4: Performance
No issues found. The drawer fetch is deferred to the guide section's first
open (S1 #1). On the chain page, switching class costs one `class_hook_use`
read by PK prefix. Optimistic marks add no round trip to the visible path.

## Re-run decision ledger

### R6: toggle semantics for "Mark used" / "Unmark"
Finding: re-run S2 #1, P1, confidence 8/10, this file §Pass 6 (6.1A) and §Pass 5 (5.1A), reviewer: Claude (plan-eng-review re-run).
Plan baseline: 6.1A (`<button aria-pressed>` named "Mark used: …") + 5.1A (visible "Mark used" on an unmarked hook, "Unmark" on a used one).
Runtime evidence: none (unbuilt). WAI-ARIA authoring practice: a toggle button's label does not change with its state.
Comparison grid:

| Choice | Current | A | B |
|---|---|---|---|
| R6 control semantics | aria-pressed + changing label (contradictory) | plain buttons: "Mark used" / "Unmark", no aria-pressed; the status line carries the state | one constant-label toggle "Used" with aria-pressed; visible text constant |
| 5.1A visible wording | approved | unchanged | changes to one constant "Used" control |
| Accessible name carries the hook's words | approved (6.1A) | unchanged ("Mark used: <words>…" / "Unmark: <words>…") | unchanged ("Used: <words>…") |
| Status announcement | approved (6.1A) | unchanged | unchanged |

Question D1:
D1 — 'Mark used' / 'Unmark': two plain buttons, or one toggle?
Project/branch/task: main, the chain page's mark control (design 5.1A + 6.1A).
ELI10: The design review ruled two different visible labels ('Mark used', then 'Unmark') AND a toggle attribute that tells screen readers 'pressed / not pressed'. Together they say the state twice: a screen reader hears 'Unmark, toggle button, pressed', which is confusing. The accessibility guidance is to pick one. Either the label changes (plain buttons), or the label stays fixed and the pressed state changes (a true toggle).
Stakes if we pick wrong: screen-reader users get a muddled control, or sighted teachers lose the clear 'Unmark' wording you approved.
Recommendation: A because it keeps the wording you ruled in 5.1A, and the status line already announces the change.
Note: options differ in kind, not coverage — no completeness score.
Pros / cons:
A) Plain buttons, changing label (recommended)
  ✅ Keeps your ruled visible wording exactly: 'Mark used' on an unmarked hook, 'Unmark' on a used one
  ✅ Screen readers hear a plain action ('Unmark: Draw two long straight lines…'), and the status line confirms it
  ❌ Drops the pressed/not-pressed state, so the state lives in the 'Used 12 Feb' line rather than on the button
B) One toggle, constant label
  ✅ A true toggle: one 'Used' button whose pressed state is the state, the cleanest pattern for assistive tech
  ❌ Replaces your ruled 'Mark used' / 'Unmark' wording with one less explicit 'Used' control
Net: keep the words you chose; let the status line carry the state.
Header: D1 Toggle
Options:
A) Plain buttons, changing label (recommended)
'Mark used' and 'Unmark' are ordinary <button>s (no aria-pressed), named 'Mark used: <first 8 words>…' / 'Unmark: <first 8 words>…'; the polite status line announces 'Marked used for <class>' / 'Unmarked'. Focus stays on the control after it swaps. Amends 6.1A only.
B) One toggle, constant label
One <button aria-pressed> with constant visible text 'Used' and name 'Used: <first 8 words>…'; pressed = used. The status line still announces the change. Amends 5.1A's visible wording and 6.1A.

State: approved
Actual answer: A) Plain buttons, changing label (author, D1-rerun, 2026-10-08)
Accepted scope: 'Mark used' and 'Unmark' are ordinary <button>s (no aria-pressed), named 'Mark used: <first 8 words>…' / 'Unmark: <first 8 words>…'; the polite status line announces 'Marked used for <class>' / 'Unmarked'; focus stays on the control after it swaps. Amends 6.1A only (5.1A wording unchanged).
History: 6.1A as first ruled carried aria-pressed; superseded on that attribute only.

### R7: a date edit while the mark's write is in flight
Finding: re-run S1 #3, P2, confidence 8/10, this file §Pass 2 (2.3A "a second click while one is in flight is ignored") and §Pass 7 (7.2A), reviewer: Claude (plan-eng-review re-run).
Plan baseline: 2.3A ignores a second click while a write is in flight; 7.2A shows "Change date" on the used line, which appears optimistically.
Runtime evidence: none (unbuilt).
Comparison grid:

| Choice | Current | A | B |
|---|---|---|---|
| R7 date edit during the mark's write | unspecified (would be ignored, so lost) | "Change date" shows disabled until the mark's write lands (then enabled) | the latest intent per hook is queued and sent after the in-flight write |
| 2.3A toggle double-click | approved: ignored | unchanged | unchanged |
| D1-rerun | pending | pending | pending |

Question D2:
D2 — What if a teacher changes the date before 'Mark used' has finished saving?
Project/branch/task: main, the chain page's used marks (design 2.3A + 7.2A).
ELI10: Marking shows the used line instantly, including 'Change date', before the save finishes. The design review said a second action during a save is ignored, so a date picked in that half-second would be silently dropped. Either make 'Change date' wait until the mark is saved, or remember the date and send it right after.
Stakes if we pick wrong: a teacher sets yesterday's date, sees it, and the page quietly keeps today's.
Recommendation: A because the window is a fraction of a second, and a briefly disabled link is honest and simple, with no queue to build or test.
Completeness: A=9/10, B=10/10
Pros / cons:
A) Disable 'Change date' until saved (recommended)
  ✅ Nothing is ever dropped: the link enables the moment the mark's write lands, usually within a second
  ✅ No queue logic: one in-flight write per hook, matching 2.3A's ignore rule
  ❌ On a slow network the link stays grey for a moment, which a teacher may notice
B) Queue the latest intent per hook
  ✅ The teacher can act at once, and their last choice always wins
  ❌ A per-hook intent queue with its own failure and revert cases, all to build and test
Net: a briefly disabled link beats a queue for a sub-second window.
Header: D2 In-flight
Options:
A) Disable 'Change date' until saved (recommended)
While a hook's write is in flight, its 'Change date' renders disabled (aria-disabled, muted) and enables when the write lands; on a failed write the line reverts (2.3A) and the link disappears with it. Test: a pending write shows the link disabled; resolving enables it. Human ~30 min / CC ~5 min.
B) Queue the latest intent per hook
Each hook holds the latest desired state; a change during an in-flight write is sent after it, and the visible state is always the latest intent; a failure reverts to the last saved state and shows 'Couldn't save · Try again'. Tests: queued date sent after the mark; failure of either reverts. Human ~2 h / CC ~20 min.

State: approved
Actual answer: A) Disable 'Change date' until saved (author, D2-rerun, 2026-10-08)
Accepted scope: while a hook's write is in flight its 'Change date' renders disabled (aria-disabled, muted) and enables when the write lands; on a failed write the line reverts (2.3A) and the link disappears with it. Test: pending write → link disabled; resolve → enabled. 2.3A's ignore rule for toggles unchanged.
History: none

### R8: real-browser proof for print and accessibility on the chain route
Finding: re-run S3, P2, confidence 9/10, `packages/app/playwright.config.ts:150-151` (a11y project `testMatch: '**/a11y/**/*.e2e.ts'`, which holds only `e2e/a11y/student-surfaces.e2e.ts`); jsdom has no `@media print`. Reviewer: Claude (plan-eng-review re-run).
Plan baseline: DT3 "a11y lane (axe) on the route"; DT4 "a print-mode render" (both assumed coverage that does not exist).
Runtime evidence: precedents `e2e/print-answer-key.e2e.ts:35` (`page.emulateMedia({ media: 'print' })`) and `e2e/helpers/factsTeacherStub.ts` + `studentSession.ts` `signInAs` (a stubbed signed-in teacher page).
Comparison grid:

| Choice | Current | A | B |
|---|---|---|---|
| R8 proof depth | jsdom unit tests only (print and axe unproven) | + one e2e spec `e2e/a11y/chain-hooks.e2e.ts` with a `chainHooksStub.ts` (mocks derived from production constants, P2): axe scan clean, and in print media the picker, buttons and marks are hidden and the "teacher copy" line shows | unit tests assert the no-print class on every control; no browser proof |
| D1-rerun, D2-rerun | pending | pending | pending |

Question D3:
D3 — Add one browser test for the chain page's print sheet and accessibility?
Project/branch/task: main, the chain page's verification (design DT3 + DT4).
ELI10: Two of the design tasks assumed tests that don't exist. The accessibility lane only checks student pages, and the unit-test browser (jsdom) can't apply print styles. So 'controls hide on paper' and 'axe finds no problems' would go unproven. The repo already has the pieces: a print-media e2e test and a signed-in teacher stub for the facts page.
Stakes if we pick wrong: a print sheet that prints the class picker and buttons, or an accessibility regression no test sees.
Recommendation: A because both proofs are cheap given the existing stub and print precedents, and print is a repo standing constraint (baseline print CSS).
Completeness: A=10/10, B=6/10
Pros / cons:
A) Add the e2e spec (recommended)
  ✅ Proves print really hides the picker, buttons and marks, in real Chromium print media, not just via a class name
  ✅ Puts the first teacher route in the a11y lane with an axe scan, using the facts-teacher stub pattern
  ❌ One more spec plus a stub to keep in step with the RPC's shape (P2 says mocks derive from production constants)
B) Unit tests only
  ✅ No new e2e harness: unit tests assert every control carries the no-print class
  ❌ A class name is not proof the print stylesheet hides it, and axe never runs on a teacher page
Net: two real proofs for one small spec, on rails the repo already has.
Header: D3 Proof
Options:
A) Add the e2e spec (recommended)
New e2e/a11y/chain-hooks.e2e.ts + e2e/helpers/chainHooksStub.ts (stub derived from the my_chain_hooks result type and class_hook_use row shape): signInAs a teacher, open /chains/<id>, run axe (no violations), then emulateMedia print and assert the picker, buttons and marks are hidden and the teacher-copy line is visible. Human ~3 h / CC ~20 min.
B) Unit tests only
ChainHooks.test.tsx asserts every control and status line carries the no-print class and the teacher-copy line exists; no e2e spec, no axe run. Human ~30 min / CC ~5 min.

State: approved
Actual answer: A) Add the e2e spec (author, D3-rerun, 2026-10-08)
Accepted scope: new e2e/a11y/chain-hooks.e2e.ts + e2e/helpers/chainHooksStub.ts (stub derived from the my_chain_hooks result type and class_hook_use row shape, P2): signInAs a teacher, open /chains/<id>, axe with no violations, then emulateMedia print and assert the picker, buttons and marks hidden and the teacher-copy line visible. Replaces DT3's and DT4's assumed coverage.
History: none

Approval readiness (re-run): PASS. Checked R6 (D1-rerun → A), R7 (D2-rerun → A), R8 (D3-rerun → A). Every other re-run item is an accepted detail or correction preserving an approved outcome (2.1A, 2.3A, 5.1A, 6.1A, 7.1A, 7.2A, D3).

## Re-run outside voice
Preflight: `CODEX_MODE: not_installed` (Codex CLI absent). The native fallback
needs TaskOutput and TaskStop, which this session does not declare. So per the
skill: **"Outside voice unavailable. Continuing to planning decisions and
Approval readiness."** No outside coverage for this delta. The first run's Fable
voice covered the back-end half, and this delta is UI-only.

## Re-run TODOS
None proposed.

## Re-run Implementation Tasks
These amend DT2, DT3 and DT4 and are built with them.

- [ ] **RT1 (P1, human: ~30 min / CC: ~5 min)**: mark control semantics
  - Surfaced by: R6 (D1-rerun A).
  - Plain buttons, no aria-pressed; names via `hookShortName`; the status line.
  - Files: `packages/app/src/routes/ChainHooks.tsx`
  - Verify: unit test that the button has no aria-pressed, its name begins "Mark used:"/"Unmark:", and the status text appears.
- [ ] **RT2 (P1, human: ~30 min / CC: ~5 min)**: "Change date" disabled while the write is in flight
  - Surfaced by: R7 (D2-rerun A).
  - Files: `ChainHooks.tsx`
  - Verify: unit test with a pending write (link aria-disabled), resolved (enabled), rejected (line reverts and the link is gone).
- [ ] **RT3 (P1, human: ~3 h / CC: ~20 min)**: browser proof
  - Surfaced by: R8 (D3-rerun A).
  - Files: `packages/app/e2e/a11y/chain-hooks.e2e.ts`, `packages/app/e2e/helpers/chainHooksStub.ts`
  - Verify: `pnpm --filter @activity/app exec playwright test --project=a11y chain-hooks` (axe clean; print hides controls).
- [ ] **RT4 (P1, human: ~30 min / CC: ~5 min)**: date-only helper
  - Surfaced by: re-run S2 #2.
  - Files: `packages/app/src/lib/` (next to `formatListDate`)
  - Verify: `dateOnlyToLocalDate('2026-02-12')` parts = 2026/1/12.
- [ ] **RT5 (P1, human: ~30 min / CC: ~5 min)**: drawer fetch on the guide section's first open
  - Surfaced by: re-run S1 #1 + the CRITICAL regression.
  - Files: `packages/app/src/components/ActivityConfigDrawer.tsx` + its test
  - Verify: the drawer test proves `my_chain_hooks` is not called on mount, is called once on the first guide open, and shows no line on rejection.

## Re-run completion summary
- Step 0: Scope Challenge: scope accepted as-is (delta below the complexity gate)
- Architecture Review: 3 issues found
- Code Quality Review: 3 issues found
- Test Review: diagram produced, 11 gaps identified (all unbuilt; 1 CRITICAL regression row: drawer fetch not on mount)
- Performance Review: 0 issues found
- NOT in scope: unchanged from the first run
- What already exists: plus `factsTeacherStub.ts` + `signInAs`, `print-answer-key.e2e.ts:35` emulateMedia
- TODOS.md updates: 0 items proposed
- Failure modes: 0 critical gaps flagged (save failure is visible, 2.3A; the read failure is handled, D3)
- Unresolved decisions: 0 in this review
- Outside voice: codex not installed, native fallback unavailable (no TaskOutput/TaskStop), so unavailable
- Parallelization: sequential implementation, no parallelization opportunity (RT1–RT5 share ChainHooks.tsx except RT3/RT5)
- Lake Score: 1/2 (D2-rerun and D3-rerun were scored for completeness; D3-rerun picked the 10/10 option, and D2-rerun picked A at 9/10, the recommended one. D1-rerun was a kind choice, excluded)

# As built (2026-10-08)

Built in one session on `main`, unpushed. Commits: `dd1a353a` (T1, T2),
`01dd94ea` (T3), `347b1d73` (T4–T6, DT1–DT5, RT1–RT5).

- **Migration `0057_chain_hooks.sql`:**
  - the `chain_hook` table, with no client privilege;
  - `sync_chain_hooks`;
  - `my_chain_hooks()`;
  - the `class_hook_use` table, under four `is_class_teacher` policies;
  - `activities_provenance_guard`, the D4 trigger.

  Applied to the LOCAL stack only.
- **`scripts/verify-0057.sql`, 12 rows, local green.** Mutation-tested five
  ways. Two rows were vacuous on the first pass and fixed before the commit:
  - C2 used a NULL jsonb comparison that never raised;
  - C5b was a student with no planted row.

  The Bank (0054–0056) and glossary (0043) verify scripts are still green
  under the new trigger.
- **Importer `--hook-registry` (§HK, 10 tests).** Mutation-tested four ways.
  The first draft's strict rows were vacuous: the demo catalogue's own
  warnings failed `--strict` regardless. Each strict row now has a clean
  control run.
- **Their real `hook-registry.json` at `71dd581`** passes `--dry-run --strict`
  against the local stack: 5 chains, 13 hooks, exit 0. This is the D5 check;
  the LIVE dry run (T7) waits for the apply.
- **App:**
  - `lib/chainHooks.ts`;
  - `routes/ChainHooks.tsx` + `chainHooks.css` (lazy);
  - the Activities-list link;
  - the drawer line.

  Unit tests: 16 page + 3 drawer + 2 list (one CRITICAL) + 5 helper rows,
  mutation-tested seven ways. `e2e/a11y/chain-hooks.e2e.ts` proves axe-clean
  and the print sheet in Chromium, mutation-tested twice. The full a11y lane
  passes (23 rows).
- **`pnpm verify`:** all 8 check-job gates pass. Shell JS 154.6 → 154.8 KiB gz
  (stop line 156.5); shell CSS unchanged at 14.9.

**Deviations and findings at build:**
1. **The drawer's first fetch guard was a StrictMode bug.** A per-run
   `cancelled` plus a `started` ref discarded the only fetch. It now uses a
   mounted ref. Found in review, before any test.
2. **The eng re-run's "the a11y lane is student-only" was wrong** (corrected
   in §Re-run Section 3). It already scanned the teacher facts page. The
   ruling was unaffected.
3. **Known limit: a Bank copier's chain page orders their activities by
   recency, not teaching order.** A copy has no `source_path`, and the
   original's is not returned to the client. Fix if wanted: have
   `my_chain_hooks` also return each copy's original path. Trigger: a
   colleague with more than one copied activity in a unit.
4. **Not built:** the optional importer read of `hook-ids-retired.txt`. Their
   generator already gates it (C-97).

**Pending author actions, in order (ALL DONE 2026-10-08; one lesson: a mirrors-only run from an empty folder also rewrites the docs manifests, so restore them from git afterwards):**
1. Apply 0057 live.
2. Run `pnpm verify:auth --target live --only verify-0057`.
3. Push `main` (OV-7: the UI calls the new RPC, so apply first).
4. Next import: add `--hook-registry <curriculum>/hook-registry.json`, with
   `--dry-run --strict` first.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 3 | clean (latest, 2026-10-01, another plan) | not run for this plan |
| Outside Review | codex (`/plan-eng-review` outside voice) | Independent 2nd opinion | 37 | unavailable | run 1: Codex not installed, in-host Fable 5.1 fallback, 7 findings (1 P1 → D4); re-run: unavailable |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 49 | issues_open (mapped work) | re-run: 6 issues + 11 test gaps, 0 critical gaps; first run: 47 issues |
| Design Review | `/plan-design-review` | UI/UX gaps | 19 | clean | score: 2/10 → 8/10, 9 decisions |
| DX Review | `/plan-devex-review` | Developer experience gaps | 9 | — (not run for this plan) | — |

- Runs are this branch's logged totals across every plan. Status and findings describe THIS plan.
- **OUTSIDE COVERAGE:** codex, plan-review phase: unavailable on both eng runs (CLI not installed). Run 1's in-host Fable 5.1 fallback completed with findings, which is not outside coverage. Design phase: outside voices skipped (D2).
- **VERDICT:** DESIGN CLEARED. The Eng Review is issues_open because its findings are mapped build work (T1–T8, DT1–DT5, RT1–RT5); every decision is ruled (eng D1–D6, design 1A–7.2A, re-run D1–D3). eng review required
NO UNRESOLVED DECISIONS

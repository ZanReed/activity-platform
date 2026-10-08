# Chain hooks — the teacher's hook view (curriculum D50 ask 3, first slice)

**Status: RULED by the author 2026-10-08 (§Rulings at the end). The joint half
(CH-2, CH-5) was AGREED by the curriculum side in C-97 (§Joint contract); the build
waits for their generator PR.** Nothing is built and no migration exists. Scheduled by the author
2026-10-08: "easier for me to also see them if they are held within the app
rather than a raw text file". TODOS → "Teacher guides: a teacher-only field and
generated teacher views" holds the queue entry.

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

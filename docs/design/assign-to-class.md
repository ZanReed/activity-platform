# Adding activities to a class — design pass (UNRULED, 2026-10-14)

> **Status:** design pass only, no code. Run against [ux-lens.md](ux-lens.md)
> after the author's walkthrough finding (2026-10-14): *"it seems clunky that
> you have to open the activities in order to assign them."* Decisions A1–A7
> below wait for the author's yes/no per item.

## Feature and goal

**Feature:** putting activities on a class's student Home.
**Goal:** *"I'm starting the Integers unit with 7B. Give them these lessons, in order."*
The unit of intent is usually a **unit for a class**, sometimes one activity.

## What exists today (code-read 2026-10-14)

| Door | Where | Shape |
|---|---|---|
| Editor | `PublishStatus.tsx` "Add to a class…" after publish | One activity → one class per pick |
| Class page | `Classes.tsx` row link "Activities (n)" → `ClassActivitiesPanel` | Flat `<select>` of every published activity, title + date; one Add per pick |
| Activities list | — | **Nothing** |

Server: `share_activity_to_class(class, activity)` (0030) adds one row, is
idempotent (`on conflict do nothing`), audits only real inserts, and refuses
anything not published. Bank copies are published at copy time (0054), so only
the teacher's OWN drafts must go through the editor first.

Student side: `list_class_activities()` orders by **`added_at desc`**: newest
first (DR-1, ruled S9). Note what that does to a unit (finding F4 below).

## First-timer walk

1. On My activities, looking at the Integers unit. No control mentions classes.
   *"How do I give this to 7B?"* → opens an activity, finds "Add to a class…"
   under the publish status. Adds it. Back. Next activity. Repeat ×6.
2. Or: My classes → the 7B row has six grey links; "Activities (3)" reads as a
   count, not a door. Click → "Add an activity" → a dropdown of ~25 titles with
   no units, in no teaching order. Pick, Add, pick, Add…
3. Students open Home: the unit is listed **last lesson first**, because each
   add was newer than the one before.

## Lens scores

1. Task over schema ❌. Both doors model the row `(class_id, activity_id)`, one
   at a time. The task is "this unit, this class".
2. Visibility of action ⚠️. The class door is behind "Activities (n)", styled
   identically to "New code" and "Delete". The list page has no door.
3. Progressive disclosure ✅. Nothing is over-exposed.
4. Locus of intent ❌. The teacher's attention is on the unit in My
   activities; the action lives in the editor or on another page.
5. Two doors ⚠️. Two doors, but both are the slow single-item kind, and no bulk door.
6. Default to done ⚠️. The single-class pre-select (DR-13) is good; nothing
   else is defaulted.
7. Visible system state ❌ on the list: nothing on My activities says which
   class already has an activity. ✅ on the class panel.
8. Reversibility ✅. Remove + undo (DR-5) already exists.
9. Recognition over recall ❌. The class dropdown drops the unit grouping, so
   the teacher must recall which titles make up the unit.
10. Name by user's concept ✅. "Add to a class", "On students' Home".

## Findings

- **F1.** No door from the place a teacher plans from (My activities).
- **F2.** Every door is one-at-a-time; a unit costs N round trips of the hand.
- **F3.** The class-side picker loses unit grouping and teaching order.
- **F4. Order inversion (a real defect, not just friction).** Newest-first on
  the student Home means a unit added in teaching order displays REVERSED.
  Today this happens with any door; a bulk "add unit" would make it happen
  every time.
- **F5.** My activities shows no class membership, so "did I already give 7B
  this?" requires visiting the class page.

## Decisions (author rules each)

**A1. A door on My activities.** Add **"Add to class…"** on each unit header
(the bulk door) and on each row (the single door). Same popover for both.
*Recommend: yes, both.* Unit header is where the intent lives (lens 4); the
row covers the one-off.

**A2. The popover.** A list of the teacher's classes, each a checkbox showing
its current state for that unit/activity (checked, unchecked, or "3 of 5" for a
partly-added unit). Checking adds immediately with "Added to 7B ✓". Unchecking
removes, with the existing undo window (DR-5 semantics). *Recommend: yes.*
Alternative: add-only popover, removal stays on the class page (smaller build,
weaker lens 7/8).

**A3. Drafts in a unit add.** The server refuses unpublished activities.
*Recommend:* add the published ones and say so plainly:
"Added 5 to 7B · 1 draft skipped (publish it first)". No publish from the list
(see A7).

**A4. Fix the order inversion (F4).** Options:
- (a) **Client-side:** a unit add sends activities in REVERSE teaching order,
  so newest-first displays teaching order. No migration. Breaks only when the
  teacher later adds a single activity, which then sits on top. That's arguably
  right, since it's the newest thing.
- (b) **Server-side:** student Home groups a class's activities by unit in
  teaching order. Needs a `list_class_activities` change + migration, and
  reverses ruling DR-1.
- (c) Leave it.
*Recommend (a) now*, file (b) with a trigger ("a class has two units
on Home and students report not finding the current one").

**A5. The class-page door.** Keep it, but (i) restyle "Activities (n)" as a
visible button distinct from the grey admin links, and (ii) group its dropdown
by unit in teaching order (`<optgroup>`) with an **"Add whole unit"** choice per
group. *Recommend: yes to both.* It's the second door; it should not be the
weaker one.

**A6. Show class membership on My activities (F5).** A quiet line per row,
e.g. `7A · 7B`, and on the unit header "In 7B (5/6)". Costs one extra query on
the Activities page (the same one the class page makes). *Recommend: yes, behind
the perf budget:* `route-mount` must stay green; if it doesn't, load it after
first paint.

**A7. Publish from the list.** *Recommend: NOT in this slice.* File in TODOS
with trigger: "a teacher has to open more than one draft in a row just to
publish it for a class". The catalogue's own activities are published by the
author per import, and Bank copies arrive published, so today's pain is mostly
F1–F4.

## Build shape if A1–A6 are all yes

- App-only. **No migration**, no Edge Function, no bundle. The bulk add is N
  calls to the existing audited RPC (≤ ~15 per unit). Each is idempotent, so a
  retry after a partial failure is safe. Report partial failure per activity.
- One shared `AddToClassPopover` used by the unit header, the row, and the
  class page reuses the same unit grouping helper (`groupByUnit`).
- Push is the deploy (no new table/RPC, so OV-7 ordering is not engaged).
- Guards: RTL rows on the real Activities page (unit add sends reverse
  teaching order; drafts skipped and named; checkbox state reflects
  membership; partial failure named); mutation-test the order guard.

## Not in scope

Due dates, per-student assignment, scheduling a unit to appear later, and
publish-from-list (A7). The dormant `assignments` table stays dormant (0030).

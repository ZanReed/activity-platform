# TODOS

Deferred work items with enough context to pick up cold. Durable backlog lives in
ROADMAP.md; this file is for concrete, near-term follow-ups surfaced during reviews.

## Settle on ⌘⇧↑/↓ keyboard reorder (debounced)

**What:** Tag `BlockReorderShortcuts` (⌘⇧↑/↓) into the stage-6 SettleMotion flow with a
debounce, so a keyboard-moved block settles at its FINAL resting position only.

**Why:** Stage 6's settle is meta-tag opt-in (eng-review ruling T2-1, 2026-07-21), and the
keyboard reorder chord was deliberately left untagged: each keypress is a delete+insert, so
holding the chord to walk a block five slots would fire five back-to-back settles (a
strobe). Untagged is the safe v1 default — but it means keyboard-first users get no
placement confirmation while mouse users (drag) and inserters do. Parity gap.

**The design problem:** "animate only the final position" needs stopped-moving detection —
e.g. a trailing debounce (~250ms after the last reorder transaction for the same block,
apply the settle decoration), or animate on chord keyup. Neither is trivial inside a PM
plugin; that's why it was split out rather than built into stage 6.

**Depends on:** stage 6's SettleMotion extension landing first (the meta contract +
`block-settle-move` keyframe it would reuse).

**Where to start:** `packages/app/src/editor/extensions/BlockReorderShortcuts.ts` (the
chord commands) + the SettleMotion plugin's meta contract. The move keyframe
(`block-settle-move`, bounce-only, no opacity dip) already exists by then.

**Context:** surfaced by /plan-eng-review's outside-voice pass on 2026-07-21 while
reviewing the stage-6 snap-motion plan (finding 4: the reorder chord has the same
transaction signature as a drag move).

## Doc-level seam zones between multi-column rows

**What:** A second insert-zone kind at the DOC level covering the horizontal gap between
two adjacent multi-column rows (or a multi-col row and a sectionBreak), inserting a fresh
1-col row at that position.

**Why:** The shipped insert-zones seam model (eng-review ruling 2A, 2026-07-23) is
column-interior only — a strip above every block inside a column plus one at each column's
end. That covers every gap EXCEPT multi-col-row ↔ multi-col-row adjacency, which stays
grip-menu-only ("Add row below"). Deliberate: one zone kind keeps the mental model pure
("this strip = a block lands here, into this column"); doc-level zones would put a
second, different landing semantic (new row) behind an identical-looking strip.

**Pros:** closes the last insert-affordance coverage hole. **Cons:** dual semantics in
one UI — the exact ambiguity 2A was chosen to avoid; needs a visual differentiator.

**Depends on:** the v1 insert zones shipping first; real dogfooding or teacher feedback
actually hitting the gap (rare layout).

**Where to start:** the InsertZones extension's `insertZonePositions` helper
(`packages/app/src/editor/strictGrid.ts`) — doc-level positions are the ones it
deliberately does not emit; `StrictGridNormalize` re-coalesce rules decide what a
doc-level insert normalizes into.

**Context:** surfaced by /plan-eng-review on 2026-07-23 while reviewing the persistent
insert-zones feature (issue 2 / ruling 2A).

## Batched staleness-status RPC (`get_branch_source_statuses(uuid[])`)

**What:** A batch variant of Drop 2′'s `get_branch_source_status(branch_id)` so the
Activities/library view resolves every branched card's staleness in one round-trip.

**Why:** v1 ships the per-card RPC — a deliberate N+1 accepted because branch counts are
single-digit (eng-review ruling D10, 2026-07-24). The batch variant is additive (no surface
break) and only earns its keep at scale.

**Trigger:** any user's branch count passes ~15, or library render is measurably slow.

**Where to start:** the `get_branch_source_status` definer RPC in the Drop 2′ migration —
same owner-only gating, `= any(p_ids)` + per-row degradation instead of a single lookup.

**Context:** surfaced by /plan-eng-review on 2026-07-24 (Activity Bank arc, performance
review finding 4-1).

## Anonymous assignment-link validation at page load

**What:** A tiny anonymous endpoint (get-feedback's `--no-verify-jwt` pattern, or a new
action on it) that a published page calls at bootstrap when `?a=` is present, so a dead
assignment link surfaces BEFORE the student starts working, not at submit.

**Why:** The scoping train's ruling D14 (2026-07-24) made token death non-destructive —
on 401 the work is preserved in the pending blob and retries with a fresh link — so the
remaining harm is only "student learns late." That downgraded the preflight check from
requirement to polish, and it was deferred because it adds a real anonymous surface
(deploy flag, CORS, enumeration thinking — tokens are ~72-bit so enumeration is cold, but
it's still a new no-JWT function to maintain).

**Trigger:** the September observation (Kia/Felice classes) shows students actually
hitting dead links.

**Pros:** dead link discovered in second 1, not minute 40. **Cons:** one more anonymous
Edge Function surface to secure and redeploy correctly (`--no-verify-jwt` footgun applies).

**Where to start:** `supabase/functions/get-feedback` (the anonymous-endpoint precedent);
the runtime bootstrap in `packages/renderer/src/runtime/init.ts` for the call site.

**Context:** surfaced by the outside-voice pass of /plan-eng-review on 2026-07-24
(finding OV-4, option B content, deferred by ruling D14/D19).

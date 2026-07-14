# Notion-hybrid editor — slice 6 design

**Status:** 🎨 **DESIGN LOCKED via /design-consultation (2026-07-15); not yet built.** This
is the design direction for slice 6 of the columns-as-universal-container arc — the
authoring-paradigm layer deliberately deferred while slices 1–4 (schema reshape → renderer
→ editor Option-A bridge → split gesture) shipped. It is design-only; no code yet. The next
step is `/plan-eng-review` on an implementation plan derived from this.

This designs ONLY the editor's missing **interaction + motion + progressive-disclosure
layer**. The visual vocabulary is already settled (the `--ed-` token system in
`packages/app/src/editor/editor.css` — slate/blue/indigo/amber, AA-contrast; the July
editor design pass). No new fonts or colors. This is why the artifact is a focused design
doc, not a project-level DESIGN.md.

## North star (author, 2026-07-15)

> **"Everything just snaps into place."** No tutorial — things work how people feel they
> should. The user is never overwhelmed with information but can always find it in logical
> spaces. No walls of text: clear visuals that signal what they can do. Anything technical
> hides under an Advanced tab; users are never dragged into considering it.

### The five principles (every decision traces to one)

1. **Snaps into place** — magnetic drop targets, strong signifiers, motion that *confirms*
   placement. Nothing floats ambiguously.
2. **No tutorial** — lean on the grammar teachers already know (Notion/Craft hover-gutter +
   `/`); signifiers over instructions.
3. **Never overwhelmed, info in logical spaces** — radical progressive disclosure; a control
   lives *on the thing it controls* and appears on approach.
4. **Clear visuals, no walls of text** — icon-forward affordances, previews over prose.
5. **Technical under Advanced** — a two-tier control model on every block; the 1–2 things a
   teacher wants are surfaced, everything technical waits behind `Advanced`.

## Locked direction — "Calm base, float + spring"

Chosen from two explored variants (mockups persisted under
`~/.gstack/projects/<slug>/designs/notion-hybrid-editor-*`):

| Layer | Decision | From |
|---|---|---|
| **Resting canvas** | Calm, **full brightness** (easy to scan a whole worksheet) | Variant A |
| **Selected block controls** | A **floating command pill** above the block that tracks the selection (keeps the block itself clean) | Variant B |
| **Motion** | **Springy** snap-zone + drop-settle + insert pop-in | Variant B |
| **Focus / dim canvas** | **Optional toggle, OFF by default** (available as a "focus mode" for deep editing) | Variant B, gated |
| **Everywhere** | Two-tier `Advanced`; controls dock to the block; keep the flowing caret | Both |

**Guardrail (unchanged from the refactor):** the caret is never removed — prose typing stays
native ProseMirror (Enter → next block, Backspace merges). "Calm" comes from the empty-until-
hover gutter + a clean selection state, NOT from killing the caret (this is how Notion
actually works — confirmed in the reference research).

## The four-state model — one grammar

| State | What the teacher sees | Trigger | Keyboard |
|---|---|---|---|
| **Rest** | Block stream + flowing caret. **Empty left gutter, no chrome.** | default | type freely; `/` opens the block picker |
| **Hover** | Left-gutter cluster fades in: `⋮⋮` grip + `+`. *Nothing else.* | pointer over a block | — |
| **Select** | Soft `--ed-accent` outline + a **floating command pill** above the block with its 1–2 primary actions, `⌄ Advanced`, and a move handle. | click grip · `Esc` from text · click block frame | ↑/↓ move selection; `Enter` → edit; `⌫` delete; `⌘D` duplicate |
| **Edit** | Caret live in the block's inline editor. Top toolbar shows **text formatting only**. | type · double-click · `Enter` on a selected block | text editing; `Esc` → back to Select |

Transitions animate (see Motion). Select↔Edit is the load-bearing pair — the "click to
select, click-again to edit" grammar people already know.

## The floating command pill

- **Placement:** centered above the selected block, ~22px gap, small downward caret. Tracks
  the block on scroll; flips below if the block is near the top of the viewport.
- **Contents (left→right):** `[primary]` `[primary]` · `⌄ Advanced` · `⋮⋮ move`. Primary
  actions use the accent fill; Advanced + move are ghost. Max **two** primary actions — if a
  block needs more, they belong under Advanced.
- **Advanced** opens a drawer docked *inside* the block (not a modal) so the technical
  controls stay in the block's "logical space." Closed by default, remembers per-session.
- Dark pill (`--ed-ink`, a new near-black primitive) so it reads above any block content.

## Per-block control inventory (the buildable core)

Two primary actions max; everything else is Advanced. `text` blocks have no block-specific
primary — their pill is just move/duplicate/delete, and formatting is the top toolbar in Edit.

| Block | Primary (surfaced) | Advanced (tucked) |
|---|---|---|
| paragraph, heading | *(generic: move · duplicate · delete)* | heading level |
| math_block | **Edit** | width · align |
| image | **Replace · Caption** | width · align · height · crop |
| callout | **Style** (variant) | — |
| bullet/ordered list | *(generic)* | — |
| problem | **Edit · Solution** | skills · work-space · number override |
| fill_in_blank | **Answer key** | acceptable answers · numeric tolerance · order-independent · hint/feedback · confidence · skills · work-space |
| interactive_graph | **Edit · Answer** | tolerance · partial credit · allow-no-solution · mistake feedback · axis config · confidence · skills |
| multiple_choice | **Choices** | multi-select · per-choice figures · feedback · confidence · skills |
| matching | **Pairs** | allow target reuse · confidence · skills |
| ordering | **Items** | confidence · skills |
| number_line | **Edit · Answer** | tolerance · axis config · confidence |
| data_plot | **Edit · Data** | chart type · tolerance · confidence |
| learning_objectives | **Edit** | — |
| worked_example | **Edit** | — |
| faded_worked_example | **Edit** | show step labels |
| self_explanation | **Prompt** | placeholder |
| short_answer / essay | **Prompt · Rubric** | placeholder · word-count target (essay) · rubric details |
| **row** (multi-column) | **Width · + Column** | grid lines · per-cell min-height · − Column |

This table is the discipline that delivers "never overwhelmed": a teacher building a graph
question sees `Edit · Answer` and is never dragged into tolerance or axis config.

## Progressive disclosure + top-toolbar diet

- The current top toolbar is overloaded (block-style dropdown, formatting, insert, math,
  define, column controls). **Slim it to text formatting + inline math + define.** Block
  insertion already lives in the gutter `+` / `/`; block-type controls move to the pill.
- Nothing technical is visible until Select → Advanced. The `/` picker stays the two-pane
  visual window (icon + title, no descriptions crowding).
- Empty lines keep the ghost `Type / to add a block` signifier.

## Motion tokens (springy, reduced-motion safe)

New motion layer (add to the token system):

```
--ed-motion-fast: 120ms;      /* outline draw, selection */
--ed-motion-base: 160ms;      /* controls fade, drop settle */
--ed-motion-focus: 200ms;     /* optional focus-dim */
--ed-ease-out: cubic-bezier(.2,.8,.2,1);
--ed-spring: cubic-bezier(.34,1.56,.64,1);  /* pill pop-in, drop bounce, snap-zone open */
```

- **Pill:** spring-in on select (scale .92→1, `--ed-spring`).
- **Snap zone:** opens with a pulse when a drag hovers a "make columns" gap.
- **Drop:** the row settles with a small bounce (`--ed-spring`, `--ed-motion-base`).
- **Insert:** new block pops in (opacity + scale, `--ed-ease-out`).
- **`@media (prefers-reduced-motion: reduce)`** collapses all of the above to instant/opacity
  only — mandatory.

## New `--ed-` state tokens

Built on existing primitives (no new palette): `--ed-ink` (near-black for the pill),
`--ed-block-selected-outline` (= `--ed-accent`), `--ed-block-selected-ring`
(`rgba(59,130,246,.12)`), `--ed-gutter-affordance` (= `--ed-faint`), plus the motion vars above.

## Migration from today's editor → target (staged)

Build on the shipped Option-A editor. Each stage is independently shippable and browser-
verifiable on `/playground`.

1. **Gutter + hover state.** Left-gutter `⋮⋮` + `+` on hover, empty at rest. (Partly exists —
   the insert line + `+` square — reconcile into one gutter cluster.)
2. **Select state + floating pill (generic).** Block selection outline + a floating pill with
   move/duplicate/delete + the Select↔Edit click grammar. No per-block controls yet.
3. **Per-block primary actions in the pill.** Wire the inventory table's *primary* column per
   block type, reusing each block's existing NodeView editor surfaces.
4. **The `Advanced` drawer.** Move each block's technical fields out of its inline body into
   the block-docked Advanced drawer. This is the bulk of the "never overwhelmed" win.
5. **Top-toolbar diet.** Remove the migrated block controls from the top toolbar.
6. **Motion pass.** Spring/settle/pop-in tokens + the snap-zone pulse; reduced-motion.
7. **Focus mode (optional).** The dim-the-rest toggle, off by default.

## Risks / open questions

- **Pill vs. mobile / touch.** A hover-gutter + floating pill needs a touch story (tap =
  select, long-press = move?). Decide at build.
- **Two-primary-actions cap** may pinch a few blocks (fill_in_blank has a lot) — validate the
  inventory with the ux-lens before building stage 3.
- **NodeView reconciliation.** Per-block pills/drawers must not reintroduce the Stage-13.5
  reconciliation hazard — the pill is a single selection-driven host at editor root (like
  BlankPopoverHost), not per-block mounting.
- **`Esc` semantics** already carry meaning in some NodeViews (math field exit) — audit before
  overloading Esc for select.

## Not designed here (out of scope for slice 6)

- Visual tokens (settled), the runtime/published page (unaffected), drag-to-reorder mechanics
  (exist), the reference-panel/calculator surfaces (separate).

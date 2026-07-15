# Notion-hybrid editor — slice 6 design

**Status:** 🎨 **DESIGN LOCKED + REVISED + ENG-REVIEWED (2026-07-15); not yet built.** After
the design review, `/plan-eng-review` locked the build architecture (see §Engineering review):
a **control-descriptor registry** is the spine (single host renders per-block controls from
per-extension descriptors — no per-block mounting, no monster switch); **smart-defaults split
out to slice 6.5**; **interaction test harness** required; several perf/feasibility fixes
folded into the stages.
Original direction locked via /design-consultation; then steelmanned + pressure-tested
against the author's UX goals, which surfaced two goal-conflicts that were folded back in
(see §Revision log): the pill is now **docked/anchored** (not floating — floating fought
"snaps into place"), and **click places the caret** (not selects — select-first fought
"works how people feel it should" for Docs-native teachers). This is the design direction
for slice 6 of the columns-as-universal-container arc — the authoring-paradigm layer
deferred while slices 1–4 shipped. Design-only; no code yet. Next step is `/plan-eng-review`
on an implementation plan derived from this.

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

## Locked direction — "Calm base, anchored + spring" (revised)

Chosen from two explored variants (mockups persisted under
`~/.gstack/projects/<slug>/designs/notion-hybrid-editor-*`), then revised by the design
review to protect the two lead goals:

| Layer | Decision | Note |
|---|---|---|
| **Resting canvas** | Calm, **full brightness** (easy to scan a whole worksheet) | Variant A |
| **Selected block controls** | A command bar **anchored to the block** (docked top-right), *not* floating — it stays put, so it reads as "snapped into a logical place." **Spring is on its appearance, not its position.** | revised (was Variant B floating) |
| **Motion** | **Springy** confirm-motion on *all* placement: insert, reorder, and column-split — a magnetic insert-line + snap-to-gap settle everywhere, not just columns. | revised (broadened) |
| **Focus / dim canvas** | **Optional toggle, OFF by default** | Variant B, gated |
| **Everywhere** | Two-tier `Advanced` (with smart defaults + just-in-time surfacing) · controls docked to the block · keep the flowing caret · **click = edit** | Both + review |

**Guardrail (unchanged):** the caret is never removed — prose typing stays native ProseMirror
(Enter → next block, Backspace merges). "Calm" comes from the empty-until-approach gutter + a
clean selection state, NOT from killing the caret.

**Audience guardrail (added by review):** the target user is a **Docs/Word-native teacher**,
not a Notion power user. Where a Notion convention would feel *wrong* to a Docs user, the
Docs behavior wins — hence **click places the caret** (not selects), and selection is a
secondary, opt-in state reached via the grip or `Esc`.

## The four-state model — one grammar

| State | What the teacher sees | Trigger | Keyboard |
|---|---|---|---|
| **Rest** | Block stream + flowing caret. **Quiet gutter** (a faint always-present dot; see §Touch & a11y), no other chrome. | default | type freely; `/` opens the block picker |
| **Hover / focus** | The gutter dot expands into `⋮⋮` grip + `+`. *Nothing else.* Also triggers on keyboard focus and tap (not hover-only). | pointer over · keyboard focus · tap | — |
| **Edit** *(the default on click)* | Click lands the **caret** and you type immediately — exactly like Google Docs. The block's inline editor is live; the top toolbar shows text formatting only. | **click** · type · `/` | text editing; `Esc` → Select |
| **Select** *(secondary, opt-in)* | Soft `--ed-accent` outline + the **docked command bar** with the block's 1–2 primary actions, `⌄ Advanced`, and a move handle. | click the **grip** · `Esc` from text · tap the block frame edge | ↑/↓ move selection; `Enter` → edit; `⌫` delete; `⌘D` duplicate |

**The key revision:** click = **edit** (caret), not select — a Docs-native teacher clicks
expecting to type, and now they do. Selection is the *secondary* state, reached deliberately
via the grip or `Esc`. This keeps the block-control power without making first contact feel
broken. (Notion's click-selects model was rejected here: right for note-takers, wrong for a
worksheet tool whose users come from Docs.)

## The docked command bar

- **Placement:** **anchored to the selected block, top-right**, inside the selection outline —
  it does *not* float or track scroll. Staying put is the point: it reads as "snapped into a
  logical place," which serves the lead goal. It scrolls with its block like any content.
- **Motion:** springs *in* on select (scale .95→1, `--ed-spring`) — the delight is on
  appearance, not on chasing the selection around.
- **Contents (left→right):** `[primary]` `[primary]` · `⌄ Advanced` · `⋮⋮ move`. Primary
  actions use the accent fill; Advanced + move are ghost.
- **The 2-primary cap is a *default*, not a hard rule.** Most blocks want ≤2. A few
  (fill_in_blank: answer key + hint + feedback are all common for self-check practice) may
  earn a third — validate per block with `docs/design/ux-lens.md` at build. Never bury a
  *frequently used* action under Advanced just to hit the cap (that would break "findable in a
  logical space").
- **Advanced** opens a drawer docked *inside* the block (not a modal), **grouped and
  ordered most-common-first** so opening it isn't just a relocated wall (see §Advanced drawer).
- Uses `--ed-ink` (a new near-black primitive) so it reads above any block content.

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
  insertion already lives in the gutter `+` / `/`; block-type controls move to the docked bar.
- Nothing technical is visible until Select → Advanced.
- **Block picker = visual preview, not icon+title-only (review fix).** Your goal was "signal
  what they can do *and how it can help*." Cutting descriptions served "no walls of text" but
  dropped the "how it helps" half — a teacher who doesn't know what "faded worked example" is
  gets zero signal. Replace descriptions with a **tiny thumbnail/preview per block type** (a
  mini render of what it looks like) so the picker conveys *what it is + how it helps* with no
  prose. On hover/focus of a picker item, a slightly larger live preview.
- Empty lines keep the ghost `Type / to add a block` signifier. The first-run empty *doc* is a
  richer moment — see §First-run.

## Smart defaults + just-in-time surfacing (review fix — the other half of "Advanced")

Hiding technical settings under `Advanced` is only half the goal. "Never *dragged into*
technical" also means never being *surprised* by a hidden default later. The failure mode:
a teacher makes a numeric blank answered `0.5`, tolerance sits hidden at some default, a
student types `1/2`, gets marked wrong — and now the teacher is dragged into Advanced *later*,
confused, debugging a bad outcome. So:

- **Ship correctness-safe defaults** for every hidden setting.
- **Surface just-in-time, inline, when a default is likely wrong.** Detect the trigger and
  *offer* the fix in one tap without opening Advanced. Examples:
  - Numeric-looking answer with a fraction/decimal → an inline chip "Accept equivalent forms
    (½ = 0.5)?" on the blank itself.
  - A graph answer that's a curve → "Accept any correct-shape curve?" inline.
  - An essay with no word target → a quiet "Set a length?" affordance (dismissable).
- These are **suggestions, not walls** — one tap to accept, dismiss to ignore, and they never
  block. This is what keeps `Advanced` closed for real while still preventing the later
  surprise.

## The Advanced drawer

- Opens **inside the block**, not a modal — the technical controls stay in the block's logical
  space.
- **Grouped + ordered, most-common-first** (review fix). `interactive_graph` has ~7 Advanced
  fields; a flat dump is a relocated wall. Group them (e.g. *Grading* · *Display* · *Meta*)
  with the one or two a teacher touches most at the top. Opening Advanced should still feel
  like "a little more," not "everything at once."
- Closed by default; remembers per-session.

## Motion tokens (springy, reduced-motion safe)

New motion layer (add to the token system):

```
--ed-motion-fast: 120ms;      /* outline draw, selection */
--ed-motion-base: 160ms;      /* controls fade, drop settle */
--ed-motion-focus: 200ms;     /* optional focus-dim */
--ed-ease-out: cubic-bezier(.2,.8,.2,1);
--ed-spring: cubic-bezier(.34,1.56,.64,1);  /* pill pop-in, drop bounce, snap-zone open */
```

**"Snaps into place" applies to ALL placement, not just columns (review fix).** Insert and
reorder are the *common* actions; they must feel snapped too, or the signature feeling only
shows up in the rare column case.

- **Insert:** a **magnetic insert-line** that snaps to the nearest gap as you approach (from
  `+`, `/`, or drag); the new block **settles** into the gap (opacity + scale, `--ed-spring`).
- **Reorder (drag to move):** the same magnetic insert-line snaps to gaps; on drop the block
  **settles with a small bounce** — no ambiguous free-floating drop.
- **Column split:** the "make columns" snap zone opens with a pulse when a drag nears a
  side-gap; the row settles on release (`--ed-spring`, `--ed-motion-base`).
- **Command bar:** springs *in on appearance* (scale .95→1) — never chases the selection.
- **`@media (prefers-reduced-motion: reduce)`** collapses all of the above to instant/opacity
  only — mandatory.

## First-run / empty state (review fix — the highest-leverage "no tutorial" moment)

A brand-new empty worksheet is the one screen where "no tutorial" is decided. Calm-and-empty
is right for a *working* doc but reads as "broken / where do I start?" on first contact, and a
lone ghost hint isn't enough. Design it as a feature:

- A warm, centered **"Start here"** with **2–3 one-tap starters** shown as small visual cards:
  *Title + instructions*, *A question* (opens the picker), *Two-column layout*. Tapping one
  drops the block and places the caret — instant momentum, zero reading.
- The `/` and `+` affordances are still present and, on this screen only, gently emphasized.
- Dismisses the moment the first block has real content; never returns.

## Touch & accessibility (review fix — affordances can't be hover-only)

Hover doesn't exist on touch (many teachers author on iPads) and can't be reached by keyboard
or screen-reader users. Hover-only gutter affordances would make the primary discovery path
*invisible* for those users — the opposite of "no tutorial."

- **Persistent-but-quiet gutter dot** at rest (a single faint `--ed-gutter-affordance` dot),
  which **expands into the `⋮⋮` grip + `+` on hover, keyboard focus, OR tap** — parity across
  input methods.
- **Keyboard:** `focus-visible` shows the gutter cluster; the docked bar's actions are all
  tab-reachable; block selection + move works via keyboard (arrows + a documented shortcut).
- **Touch:** tap a block = caret (edit); tap the grip = select + bar; long-press the grip =
  drag to move. Decide the exact gesture set at build, but it is *in scope*, not deferred.
- **Targets:** 44px minimum on the grip, `+`, and every bar action.
- **Contrast:** the docked bar on `--ed-ink` and all state outlines meet AA (inherits the
  existing token discipline).

## New `--ed-` state tokens

Built on existing primitives (no new palette): `--ed-ink` (near-black for the pill),
`--ed-block-selected-outline` (= `--ed-accent`), `--ed-block-selected-ring`
(`rgba(59,130,246,.12)`), `--ed-gutter-affordance` (= `--ed-faint`), plus the motion vars above.

## Migration from today's editor → target (staged)

Build on the shipped Option-A editor. Each stage is independently shippable and browser-
verifiable on `/playground`.

0. **(eng) Control-descriptor registry + interaction harness.** Land the `BlockControls`
   descriptor type + the single-host skeleton + the Playwright/browse interaction harness
   FIRST, proven on 2–3 simple blocks (paragraph, math, image) before any complex one. This
   de-risks the whole arc (see §Engineering review).
1. **Gutter with input parity.** Persistent quiet dot at rest → `⋮⋮` + `+` on hover/focus/tap,
   empty otherwise. **CSS-hover-driven** (a block `::before`), not a per-block PM decoration.
   (Reconcile the existing insert line + `+` square into this one cluster.)
2. **Select state + docked command bar (generic) + click=edit.** Block-selection outline +
   an anchored bar with move/duplicate/delete; click lands the caret (edit); selection is
   **grip-click + `Esc` only** (no "click frame edge").
3. **Per-block controls via the descriptor.** Fill the inventory's *primary* + *Advanced*
   descriptors per block type, extracting each block's control surface out of its NodeView
   into its descriptor. This is a ~20-NodeView refactor, not wiring — simplest blocks first.
4. **The grouped `Advanced` drawer.** Rendered from the descriptor's grouped `advanced`;
   most-common-first. The bulk of the "never overwhelmed" win.
5. **Block-picker previews + first-run empty state.** Static SVG thumbnails per block type;
   the "Start here" starters on a fresh doc.
6. **Snap motion pass.** Magnetic insert-line + settle for insert/reorder/columns;
   spring-on-appear for the bar; reduced-motion.
7. **Top-toolbar diet + optional focus mode.** Remove migrated controls; ship the dim-the-rest
   toggle (off by default).

**Moved OUT to slice 6.5** (eng review — split from this arc): **smart defaults + just-in-time
surfacing** (the "accept equivalent forms?" inline suggestions). It's a net-new interaction
subsystem with *unvalidated* heuristics (per-block detectors, dismissable chips, persistence),
not a restyle — so it gets its own spike to prove the detectors fire reliably and that
teachers want the chip, and it gates nothing in slice 6. The §"Smart defaults" section above
is its spec; build it as 6.5.

## Risks / open questions

- **Two-primary-actions cap** is a default, not a rule — validate per block with the ux-lens
  before stage 3 (fill_in_blank likely earns a third). Never bury a frequently-used action.
- **NodeView reconciliation.** The docked bar + drawer must be a single selection-driven host
  at editor root (like `BlankPopoverHost`), NOT per-block mounting — that reintroduces the
  Stage-13.5 hazard.
- **`Esc` semantics** already mean "exit the math field" in some NodeViews — audit before
  overloading `Esc` for text→Select.
- **Touch gesture set** (tap/grip-tap/long-press) is in scope but needs a real-device pass;
  don't ship the gutter without it.

## Not designed here (out of scope for slice 6)

- Visual tokens (settled), the runtime/published page (unaffected), the drag-to-reorder
  *mechanics* (exist — this restyles their motion), the reference-panel/calculator surfaces.

## Revision log

**2026-07-15 — /plan-design-review (steelman + goal-alignment pass).** The /design-consultation
direction was pressure-tested against the author's five UX goals. Two goal-conflicts were the
root cause of most findings (leaning on Notion power-user conventions for a Docs-native teacher
audience), plus five gaps. All folded in above:

| # | Finding (drift from a goal) | Fix folded in |
|---|---|---|
| 1 | Floating pill *drifts* — fights "snaps into place" | Bar **anchored** to the block; spring on *appearance*, not tracking |
| 2 | Select-first click *feels wrong* to Docs users — fights "works how they feel" | **Click = edit (caret)**; selection is grip/`Esc`-only, secondary |
| 3 | "Snaps into place" only designed for columns | Magnetic insert-line + settle for **insert + reorder** too |
| 4 | `Advanced` hiding can *backfire* (later surprise) — fights "never dragged in" | **Smart defaults + just-in-time inline** suggestions |
| 5 | Cut descriptions but dropped "how it helps" | Block-picker **visual previews/thumbnails** |
| 6 | Hover-only affordances break touch + a11y — fight "no tutorial" | **Persistent quiet gutter dot**; hover/focus/tap parity; 44px targets |
| 7 | First-run empty state under-designed | **"Start here"** with 2–3 one-tap visual starters |
| 8 | `Advanced`, once open, is a wall | **Grouped, most-common-first** drawer |

Post-revision self-assessment against the goals: *snaps into place* 6→9, *no tutorial / feels
right* 5→8, *never overwhelmed* 8→9, *no walls of text / how it helps* 6→8, *technical under
Advanced* 7→9. The remaining softness is inherent uncertainty that only a **real-device
prototype + a teacher watching** resolves — the design can't fully close #2 and #6 on paper.

## Engineering review (/plan-eng-review, 2026-07-15)

**The architectural spine — a control-descriptor registry.** The design mandates a *single*
selection-driven host (to dodge the Stage-13.5 per-chip reconciliation hazard) that must
render *different* controls per block type. The mechanism: each block extension **declares
its controls as data**, registered next to the node (same "add-a-block-in-one-place"
discipline as `slashMenuItems` and the renderer dispatch). The single host reads the
descriptor for the *currently selected* block's type.

```
Block extension (per type)                Single root host (one mount)
┌─────────────────────────────┐           ┌──────────────────────────────┐
│ export const graphControls: │           │ selection changes →          │
│   BlockControls = {         │  register │   desc = controlsFor(type)   │
│   primary: [Edit, Answer],  │──────────▶│   <CommandBar desc/>         │
│   advanced: [                │  registry │   <AdvancedDrawer desc/>     │
│     {group:'Grading',…},     │           │ (host lifetime = editor,     │
│     {group:'Display',…}] }   │           │  NOT per block → no hazard)  │
└─────────────────────────────┘           └──────────────────────────────┘
   ~20 descriptors, each beside its           BlankPopoverHost pattern,
   extension (DRY, one place)                 generalized to all blocks
```

`primary`/`advanced` entries are `{ label, icon, onActivate(editor, pos) }` (+ grouped fields
for Advanced). Adding a block type = add its descriptor; the host needs no edit. This is the
load-bearing piece the design doc omitted — spec + build it in stage 0.

**State → ProseMirror primitive mapping** (so implementers aren't guessing):

| Design state | ProseMirror | Notes |
|---|---|---|
| Rest | — | no active affordance |
| Hover / focus | CSS `:hover`/`:focus-within` + one focus-driven widget | NOT a per-block decoration |
| Edit | `TextSelection` (caret) | the default on click |
| Select | `NodeSelection` on the block | via grip-click or `Esc` only |

**Verification (the biggest gap — resolved):** the design is almost entirely interaction, and
the repo has *no* editor-interaction test harness (`blockTypeGuards` only builds the schema;
gestures are hand-verified on `/playground`). Slice 6 must **stand up a lightweight
browser-driven harness** (Playwright or the gstack browse daemon) driving `/playground`:
click=edit vs grip=select, `Esc`, arrow-move, hover-gutter, drag-snap-to-gap, Advanced-open.
Plus **unit tests for the pure parts** — the descriptor registry, block-picker items, and the
state-mapping. The harness pays forward to every future editor slice.

**Feasibility fixes folded into the stages:** prove the descriptor pattern on 2–3 simple
blocks before the complex ones (stage 3 is a ~20-NodeView extraction, not wiring); CSS-driven
gutter (not a PM decoration per block); selection via grip+`Esc` only (drop "click frame
edge"); static SVG picker thumbnails (not live renders).

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | — |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | issues_open | 1 scope-split + 1 architecture + 4 recs + 1 test-infra, all folded |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | done | 8 goal-alignment fixes (prior) |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

- **OUTSIDE VOICE:** not run (Codex unavailable; interactive review with the author sufficed
  for a design-stage spec).
- **VERDICT:** ENG CLEARED — the design is buildable. Locked: control-descriptor registry as
  the spine; smart-defaults split to slice 6.5; interaction test harness required; gutter/
  selection/preview feasibility fixes folded. Real work concentrates in stage 3 (the
  ~20-NodeView control extraction) and stage 0 (the registry + harness) — sequence simplest
  blocks first.

NO UNRESOLVED DECISIONS

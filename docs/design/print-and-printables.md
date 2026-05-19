# print-and-printables.md

Design doc for **print as an authored feature** — teacher-configurable, classroom-ready printables generated from the same `ActivityDocument` that produces the interactive web activity.

Companion to STATE.md (where things are), ROADMAP.md (where things are going), and RUNTIME.md (the published-page runtime). This doc is *captured ahead of implementation* — same role as `interactive-graph-block.md` and `vocabulary-definitions.md`.

## Status

- **Sequencing: implemented after Stage 16**, once the Phase 1 create → publish → submit → review loop is closed. Print is an enhancement to a working product, not a substitute for having one.
- This doc is written now to preserve design context. The open questions below are resolved at print-stage kickoff, not now.
- **Not covered here:** the *baseline print stylesheet* — the small `@media print` layer that keeps the already-rendered HTML from looking broken on paper (hide interactive controls, page-break integrity, grayscale safety, sane margins and type). That ships with Stage 11 as part of the runtime work and is deliberately minimal. *This doc is the feature; the baseline is table stakes.*

## Why this is a feature, not a stylesheet

A `@media print` stylesheet makes an existing page printable. It does not let a teacher *author* a printable: choose a layout, reserve work space, add a name/date header, generate an answer key. Those are authoring decisions, and they touch schema, editor, and renderer.

Product rationale: a large share of classroom delivery is still paper — exit tickets, homework, sub plans, students without devices, low-bandwidth days. A platform that produces *both* a strong interactive activity and a clean printable from one source is genuinely differentiated; most tools pick a lane. Treating print as first-class is an adoption lever, not polish.

## Guiding principle: one source, many outputs

There is one authored artifact — the `ActivityDocument` — and several *renderings* of it:

- the interactive web activity (current renderer output),
- a student print copy,
- a teacher worksheet (configurable layout, work space, header),
- an answer-key copy.

Print is a **rendering**, never a separate document type. A teacher builds the activity once; printing is another view of that same work. This is the architectural meaning of "combine print and activity building into one" — there is no separate print editor, no parallel print document, nothing to keep in sync.

## Two print surfaces

**1. The published activity (baseline).** Static HTML in Supabase Storage. Carries the baseline print stylesheet from Stage 11. Anyone who can load the URL can print it — no editor, no account. Prints with whatever print *defaults* the author set.

**2. The teacher printable (the feature).** Generated on demand by the app invoking the renderer — on a draft while building, or on a published activity. This is where the rich capabilities live: multi-column layout, journal-glue 2-up, problem spacing, work space, configurable header, answer-key variant. Configuration belongs to the teacher *doing the printing*; the content belongs to the author.

Because the app must render *drafts* (teachers print before they publish) and *previews*, the renderer has to be invokable client-side. It already can be — it is pure and already bundled as `renderer.bundle.js`. App-architecture note for the print stage: a print/preview path in `@activity/app`, not a server round-trip.

## Print is a render capability, not an edit capability

This separation is load-bearing, and it resolves the Phase 5 marketplace question directly.

Printing renders an `ActivityDocument`. Editing changes one. They are different capabilities and do not have to travel together:

- A student printing the published page is not editing it.
- A teacher generating a worksheet — even adjusting its columns or work space — is not editing the activity. They are choosing *presentation*. The output is a printout, not a new activity.
- A Phase 5 buyer with read-only access to a purchased activity can therefore print it, and tailor the print layout to their classroom, **without** rewrite permissions. The purchased activity's content — problems, answers, structure — is never touched.

So both horns of the original worry are false: bought activities are *not* unprintable, and buyers do *not* need edit access to print them.

The resale concern is real but separate. Through the purchase mechanism it is already prevented — purchased activities are read-only; there is no edit surface; the print feature does not open one. Through determined *exfiltration* — copying activity content out of the published HTML, rebuilding it, reselling it — it is not technically preventable, because the content is in the published HTML by design (the "security ceiling" already documented in ROADMAP/RUNTIME). That is a Phase 5 marketplace-*governance* problem: provenance/attribution metadata, similarity detection, community flagging, editorial review, takedowns — already a deferred Phase 5 decision in ROADMAP. Print neither creates nor worsens it; the risk exists the moment anything is published. Out of scope here, recorded so the context is not lost.

## Requirements

Grouped; each carries a sub-decision flagged for the print stage.

**Worksheet header.** Teacher-configured `Name:` / `Date:` plus extra fields the teacher chooses (Period, Class, Score, custom). Note the overlap with the online submission-identity field — the runtime already renders a name input. Cleanest model: one "identity/header" concept rendering as inputs online and as fill-in lines on paper. *Sub-decision: header as an `ActivityMeta` field vs a placeable block.*

**Page layout.** Multi-column print (`column-count` is easy for flowing content but needs `break-inside: avoid` so problems do not split mid-column); journal-glue 2-up (print scaled so a worksheet fits a composition notebook — the hardest item: page *geometry*, leans on CSS `@page`, the most browser-variable corner of print); problem spacing (config value → margins); margins and paper size. Columns are the most naturally deferrable ("now or later").

**Typography & work space.** Print font size (config value); reserved work space — a configurable amount of blank vertical area under each problem for students to show work. *Sub-decision: per-activity default only, or per-problem override; work space as a height vs N ruled lines.*

**Responsive blank/option sizing.** The renderer already emits a `--blank-width` custom property. Make it responsive to the canonical answer's length — a suggested width, clamped to a min/max, teacher-overridable. Cheapest of the set and it improves the *online* product too, so it is a candidate to pull forward into Stage 11's baseline rather than wait.

**Answer-key copy.** Generate a filled answer-key printout alongside the blank student copy, from the same activity (the answers are already in the data). High value for teachers; a buyer printing a key from a purchased activity is fine — they are the legitimate teacher.

**Page-break integrity.** `break-inside: avoid` on problems, `break-before` control on sections. Belongs in the Stage 11 *baseline*, not the feature — a split problem is the first thing a teacher sees go wrong.

**Grayscale safety.** Callout variants and ✓/✗ feedback lean on color; classroom printers are black-and-white. Print output must not encode meaning in color alone — borders, labels, patterns instead. Also baseline; ties to the existing accessibility commitment.

**Print preview.** Teachers will not trust "it will print fine." An in-editor preview is a real UX investment. *Sub-decision: in-editor WYSIWYG panel vs a dedicated print route vs relying on the browser's preview.*

## Architecture direction

- **One renderer, not two.** Print is the same `ActivityDocument` → HTML path. Print configuration produces classes, CSS custom properties, and `data-*` attributes that `@media print` and the teacher-printable layout consume. A separate print-rendering path would double maintenance and drift; rejected unless an open question below forces it.
- **CSS custom properties carry print config** (`--print-columns`, `--print-problem-spacing`, `--print-work-space`, `--print-font-size`, …) — consistent with the existing `--blank-width` pattern and the "split by purpose" discipline in RUNTIME.md. This is what lets print *preferences* adjust a printout without re-authoring the activity.
- **The renderer is invoked client-side** for draft printing and preview — pure, already bundled.
- **Stress test: journal-glue 2-up.** If 2-up genuinely cannot be expressed as a print-layout class over the single renderer and needs a distinct rendering pass, that is the one requirement that could force a second path. The design must confirm this before any code.

## Where print config lives

Three options:

1. **On the `ActivityDocument`.** Author sets it; baked into published HTML. Simple, but a buyer is stuck with the author's choices.
2. **Pure render-time.** Whoever prints picks settings; nothing stored. Flexible, but the author's careful layout is never saved and every print is configured cold.
3. **Hybrid.** Author sets stored *defaults* (travel with the activity, so a published — or sold — activity is print-ready out of the box). A separate print-*preference* layer overrides per-printout: local to the printing teacher, presentation-only, never written back to the activity, never part of the saleable artifact.

**Lean: hybrid (option 3).** It is the option that makes a sold activity arrive print-ready *and* lets a buyer adapt the printout to their classroom *and* keeps print preferences from ever constituting a derivative work. Print config fields on `ActivityMeta` are optional-with-defaults, so adding them is additive and does not bump `schemaVersion` (the Stage 9a precedent) — no migration, and no reason to add them speculatively before this stage runs.

## Open questions — resolved at print-stage kickoff

- Header: `ActivityMeta` field vs placeable block.
- Print config granularity: per-activity defaults only, or per-problem overrides for spacing and work space.
- Journal-glue 2-up: expressible as a print-layout class, or does it force a second render path.
- Paper size: Letter-only at launch (Dallas ISD) vs Letter + A4.
- Work space unit: reserved height vs ruled lines vs both.
- Print preview: in-editor panel vs print route vs browser preview only.
- Responsive blank sizing: pulled forward into Stage 11 baseline, or shipped with the print feature.
- Answer-key copy: a separate generated output vs a toggle on the teacher printable.
- Print config storage shape on `ActivityMeta` (defines the hybrid's stored-defaults half).

## Out of scope

- The **baseline print stylesheet** — Stage 11, separate and minimal (hide interactive controls, page-break integrity, grayscale safety, margins/type). Mentioned in the requirements above where it overlaps, so the boundary is explicit.
- **Marketplace resale governance** — Phase 5; provenance, similarity detection, flagging, editorial review. Print does not create or worsen the underlying exfiltration risk.

## Done when

A teacher can take any activity — their own, or in Phase 5 a purchased one — and generate a classroom-ready printable: configured columns, spacing, work space, and header, with an answer-key variant, from the same source that produces the interactive web activity, without that configuration ever modifying the activity itself.

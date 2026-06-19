# ROADMAP.md

The long-term plan. STATE.md says where things are *today*; this file says where things are *going*. Updated rarely (when a major decision changes), not at the end of every session.

## Vision

An interactive math activity platform for K–12 educators that starts as a small invite-only tool for one Algebra II department, grows into a Google Classroom–integrated platform for districts, and ends as a multi-tenant creator marketplace where teachers can buy and sell high-quality activities. Static, fast, accessible, privacy-respecting; never stores student PII it doesn't need; treats teachers as the primary users, students as the audience their work is for, and districts as the eventual buyers of curriculum. Architecturally subject-portable from the start — the platform leads with math because that's where the founder teaches, but no schema or renderer decision is math-only, so social studies, ELA, foreign language, science, and CS teachers can adopt the same tool when the time comes.

## Phases at a glance

| Phase | Theme | User-visible win |
|---|---|---|
| **1** | The MVP loop | Sign in, build a worksheet in a block editor, share a link, see submissions |
| **2** | Polish the loop | ~~Markdown import~~ (shipped early in Phase 1), image upload, better submission analytics, self-signup, common question types beyond fill-in-blank (MC, matching, ordering) |
| **2.5** | Parameterized problems | Template-based variants (authoring-time, then runtime) |
| **2.6** | Manual grading + rubrics | Teacher-graded items (essays, short answer, open response) with multi-criterion rubrics |
| **2.7** | Graphing track (calculator + interactive graphing) | A teacher-configurable Desmos-style calculator tool, then graph blocks with tolerance-based scoring — both on one shared graphing kit |
| **2.8** | Media submissions | Audio, video, file uploads — student-generated multimedia responses |
| **2.9** | Annotation responses | Highlight, label, identify-the-error questions over passages and images |
| **3** | Classroom integration | "Assign in Classroom," roster-based identity, grade passback |
| **4** | Multi-tenancy | District/school workspaces, co-teaching, admin controls |
| **5** | Marketplace | Teachers sell activities to other teachers and districts |

Phases are named, not dated. Each phase is "shipped" when its loop is complete and used by real teachers, not when a date arrives. Decimal sub-phases between 2 and 3 reflect that subject-expansion features layer onto the polished Phase 1 loop in roughly independent waves; the order is the most natural dependency order, not a strict commitment.

---

## Phase 1 — The MVP loop

The complete create-publish-submit-review cycle, end to end, for one teacher (then a small group of colleagues) using invite-only access. Replaces an existing GitHub Pages-based workflow with a maintainable foundation that everything else builds on.

**User-visible**: Allowlisted teachers sign in via Google. They create activities in a vertical-stack block editor (paragraph, heading, math, image, callout, problem, fill-in-blank). They publish to a static URL. They share that URL with students, who fill out the worksheet and submit with their name. Teachers see submissions in a simple table.

**Architectural delta**: Everything from scratch. Postgres schema with append-only versioning, RLS, signup trigger with allowlist, atomic publish RPC, ingest submission RPC. Edge Functions for publish and submission. TypeScript packages for schema (Zod), renderer (pure JSON-to-HTML), and the React app (Vite + Tiptap). Static HTML on publish, hosted on Cloudflare R2 (Supabase Storage and Edge Functions both rewrite HTML responses to `text/plain` on free tier as anti-abuse, forcing the host off `*.supabase.co` — see Cross-cutting concerns / Hosting platform).

**Bounded by**: ~6–8 core block types. Image-by-URL only (no upload). Single owner per activity. No multi-column layouts *at the original scope* — structural authored columns (a side-by-side container block, with an optional ruled-grid mode for print) landed later as a follow-on alongside the print feature; see STATE. Simple raw-table submission viewer (no per-blank aggregation yet). English only. Allowlist-only access (no self-signup).

**Done when**: One teacher can build a worksheet, share it, and see real student submissions in the dashboard. End-to-end loop works without manual intervention.

**Follow-on after the loop — print and printables.** Once the loop closes (after Stage 16), the first follow-on work is print as an *authored feature*: teacher-configurable, classroom-ready printables — multi-column layout, problem spacing, reserved work space, name/date headers, answer-key copies — generated from the same `ActivityDocument` as the interactive activity. A minimal baseline print stylesheet ships earlier with the Stage 11 runtime work; the authored feature is a separate body of work, designed ahead in `docs/design/print-and-printables.md`. It is first-class, not polish: a large share of classroom delivery is still paper, and producing both a strong interactive activity and a clean printable from one source is a genuine differentiator. Architectural commitment: print is a *rendering* of the existing document model, never a separate document type — one authored artifact, many outputs.

---

## Phase 2 — Polish the loop

Quality-of-life improvements that make the Phase 1 loop pleasant rather than barely-functional, before opening to a broader audience. Also where the platform crosses from "math worksheet tool" to "activity tool for any subject" by adding the question types that non-math teachers ask for first.

**User-visible**: Paste a markdown list of problems and get blocks — **shipped early in Phase 1** as a dedicated Import dialog (built fresh on markdown-it, not the bulk-importer port originally imagined; see `docs/markdown-import-format.md`). Upload images directly instead of pasting URLs. Submission viewer shows aggregate per-blank stats ("78% got blank #3 correct"). Self-signup with email verification replaces the allowlist for general use, with the allowlist remaining as an admin override for restricted contexts. Section color tinting and a few more block types (table, divider, video embed) earn their way in if teachers ask for them.

**Reference panel** ✅ **SHIPPED 2026-06-18** (Drops A–C + a resize/scroll-clearance sidecar; live on published pages — see STATE and DECISIONS → "Reference panel"): holds reference content students may consult while working — formula charts, periodic tables, vocabulary lists, conversion tables, unit-circle diagrams, sentence-stem prompts, foreign-language verb tables, primary-source excerpts, maps. The teacher edits panel content in a constrained second editor (math, lists, image, columns — no sections or blank-authoring). Architecturally, an optional `referencePanel?: { title?: string, blocks: Block[] }` field on `ActivityDocument` (added Phase 1 Stage 9e as forward-compat) drives both presentations. **As-built diverges from the original sticky-sidebar idea:** on screen it's a collapsible, drag-resizable bottom-bar toolbar (the author's call — it follows the student and fits wide/future content like an associated video); in print it's a static box at the top, gated by `meta.print.printReferencePanel`. Reference content is `data-block-category="scaffold"` — doesn't contribute to scoring, doesn't fire checkpoint behavior, prints alongside the activity. Cross-subject use case driver: nearly every K-12 subject has a "students need this reference handy while they work" pattern, and the existing "open another tab" workaround is friction every teacher complains about.

**Vocabulary definitions**: teachers can select a word or phrase in the editor and attach an inline definition. Students see the defined term subtly underlined; click or tap (or focus + Enter) opens a popover with the definition. Targets the math-specific vocabulary barrier — "factor" as verb vs. noun, "rational expression," "domain," "coefficient" — that disproportionately gates Algebra II for ELL students and kids who arrived without earlier-grade terminology internalized. Inline-only in Phase 2; the activity-level glossary that lets a teacher define "factor" once and have every marked instance share that definition is a Phase 4 extension of the same mark.

**Free activity catalog** (cold-start lever, pairs with self-signup): a public, browsable catalog of free first-party activities — initially math — that a brand-new teacher can find and **run as-is** (assign / print / share the link), so onboarding doesn't start at a blank editor. This is the Phase 5 marketplace's *free + discovery* slice pulled forward, with all the hard parts absent precisely because the items are free and single-author: no Stripe, no entitlements, no multi-tenancy, no server-side grading (keys-in-HTML is fine for free formative practice). "Use" means run-in-place, read-only — the same primitive Phase 5 specifies — not clone-to-edit (that trails into Phase 4 multi-tenancy). Architecturally just a "listed" flag + tags as DB metadata (never in `ActivityDocument`) over the already-public R2 URL, plus a discovery route. Designed ahead in `docs/design/free-activity-catalog.md`; note the consumer-submission-dashboard piece depends on Phase 3 assignment scoping, so the Phase 2 slice is browse + run/assign/print.

**Common question types beyond fill-in-blank**: multiple choice (single and multi-select), matching pairs, ordering / sequencing. These are basic question types in nearly every subject — and historically far more common than fill-in-blank in non-STEM classrooms — but they don't fit `BlankResponse` because the answer isn't a string. Each new type follows the parallel-map pattern established in the interactive-graph design doc: a new `choices` / `matches` / `orderings` map on `SubmissionResponses` (bumped to v3 with migrate-on-read from v2), a new block type in the discriminated union, a new scoring strategy in the `evaluateAnswer` dispatch (`'mc-single'`, `'mc-multi'`, `'matching'`, `'ordering'`), and a new NodeView. Architecturally similar to graphs but simpler since the response shape is just a selection / arrangement, not geometric coordinates.

**Subscript and superscript marks**: inline marks alongside bold / italic / code. Chemistry (H₂O, CO₂), historical era notation (BCE/CE), citation references, ordinal indicators. The base mark applies to any text run, including text outside math nodes. Trivial to add; included in Phase 2 because it's a day-one trust regression for non-math teachers if absent.

**Architectural delta**: Image upload to object storage (Phase 2 — likely R2 since it's already integrated for published HTML, with size limits and a cleanup policy). Aggregate-stats query/view. Email verification flow in Supabase Auth. ~~Markdown parser package (likely a thin port of the existing bulk-importer.js).~~ **Shipped early in Phase 1** as `packages/app/src/lib/markdownToTiptap.ts` — markdown-it plus a small custom layer for `{{blanks}}` / `{checkpoint}` / `$math$`, not the bulk-importer port originally imagined. A new Tiptap mark (definition) joins the bold/italic/code mark set, carrying an inline definition string. Renderer emits `<span class="definition" data-definition="..." tabindex="0" role="button">` with full keyboard accessibility (Tab to reach, Enter/Space to open, Esc to dismiss; floating-ui for positioning, already a transitive dependency via the drag handle). Runtime gains a definition-popover handler — a new interactive element class in the data-attribute contract. Attribute names (`data-definition`, `data-glossary-key`) are designed now so the Phase 4 glossary layer is additive, not a rename.

For MC / matching / ordering: `SubmissionResponses` bumps to v3 with three new optional parallel maps. The Edge Function's response validation accepts the new shape; the runtime registers three new strategies in the `evaluateAnswer` dispatch (the dispatch was structured for this in Phase 1). The renderer emits the same `data-block-category="question"` contract used by fill-in-blank, plus type-specific data attributes for choices and correct keys. Subscript / superscript marks add two new entries to the mark schema, two new toolbar buttons, two new Tiptap mark extensions, and pass-through serialize / renderer support.

**Decisions deferred to the start of this phase**:
- Image hosting limits and lifecycle: per-teacher quota? Auto-delete after N days of non-use? Bucket — same R2 bucket as published HTML (with separate prefix), or a dedicated bucket? Probably dedicated, for cleaner lifecycle policies and quotas.
- ~~Whether the markdown import lives inline in the editor (paste anywhere, parse) or in a dedicated import dialog.~~ **Resolved (2026-06-16): a dedicated dialog**, shipped early in Phase 1 polish. See STATE / DECISIONS → "Markdown import" and `docs/markdown-import-format.md`.
- MC option randomization: per-student shuffle? Author-controlled lock for "last option must stay last (none of the above)"?
- Matching UI affordance: drag-and-drop pairs, dropdowns, or both? Touch-friendly default.
- Ordering UI affordance: drag-to-reorder list, or numbered slots? Drag is friendlier; numbered slots are more keyboard-accessible.
- Custom domain for the published-HTML R2 bucket (currently `pub-*.r2.dev`). Phase 2 is a reasonable point to introduce a vanity URL like `activities.<brand>.com` if a domain is owned.

**Done when**: A teacher who's never seen the system before can sign up, build a useful activity in 15 minutes, and use it with students that week — whether they teach Algebra II, AP US History, Spanish III, or 6th-grade ELA.

---

## Phase 2.5 — Parameterized problems

A teacher can write one template and have it become many problems. Two sub-features that share most of their machinery and ship in order.

**User-visible (2.5a — authoring-time variants)**: Teacher writes a template like `"simplify {rand(2,9)}x² − {rand(1,15)}"` and clicks "generate 12 variants" in the editor. The editor expands the template into 12 normal problem blocks with specific values, and saves them as static content. The student sees a fixed worksheet; the randomization happened in the teacher's editor. Closes the gap that previously required external tools (or AI assistance from a chat) to produce variant practice sets.

**User-visible (2.5b — runtime parameterization)**: Teacher writes the same kind of template but marks it as "regenerate per student." Each student loading the activity sees different numbers in the same problem. Submissions record both the answer and which variant the student saw, so the teacher viewer can show "this student saw `(2x+3)/(x−1)` and answered correctly" while aggregating across all variants for class-level stats.

**Architectural delta**: A new optional block type — `parameterized_problem` — joining the discriminated union (additive change, no migration of existing data). A small template language and parser (lives in a new `@activity/templates` package). For 2.5a the parser runs in the editor and produces normal problem blocks. For 2.5b the parser runs at student-page-load time in the runtime JS, with answer key computation following the same parameter substitution. The submissions `responses` shape grows an optional `variant` field via `schemaVersion: N+1`, with migrate-on-read keeping old submissions readable.

The renderer's runtime evaluator (which currently just compares against a static list of acceptable answers via `data-blank-answers`) needs to support strategy dispatch — `'list' | 'expression' | 'computed'` — so parameterized problems can plug in their own answer-evaluation logic. **This is the one cheap pre-emptive change worth making before Phase 1 frontend work begins** (see STATE.md): structuring the runtime as `evaluateAnswer(blank, typed)` with strategy dispatch, defaulting to 'list' to preserve current behavior. Adding new strategies later then becomes one switch case rather than a runtime refactor.

**Decisions deferred to the start of this phase**:
- **Template syntax**. Options: a custom mini-language (`{rand(2,9)}`), a more familiar one (Mustache/Handlebars-style), or a structured object form (`{ "type": "rand", "min": 2, "max": 9 }`). The custom mini-language reads best to teachers; the structured form is easier to validate and edit visually. Probably end up with both — internal storage is structured JSON, the editor offers a mini-language input as a power-user shortcut.
- **Answer evaluator scope**. How smart does it need to be? Pure equality is too strict (`2x+3` vs `3+2x` should both count). Symbolic equivalence (CAS-style) is hard. A reasonable middle ground is normalize-and-compare with a small simplifier: collect like terms, sort by exponent, normalize signs. Use an existing JS math library (math.js handles enough) rather than rolling our own.
- **How aggregation handles variants**. Per-template stats clearly. Per-variant ("students who got the `(2x+3)` version") probably worth surfacing too. UI design problem more than backend problem.
- **AI-assisted generation as a future Phase 5+ layer**: same template language, but the editor offers a "describe what you want and let the AI fill in templates" button. Defer entirely; just make sure the template format isn't tied to a specific generation method.

**Done when**: A teacher can write a single rational-expression simplification template and have either 12 static variants saved as a worksheet, or have every student see different numbers, with scoring working correctly in both cases.

---

## Phase 2.6 — Manual grading + rubrics

The architectural shift that opens the platform to subjects whose primary assessments aren't auto-gradable: history short answer, English essays, foreign language open response, science lab write-ups, art critiques. Until now everything assumes the runtime can score the student's response. Phase 2.6 forks the data model so some blocks are graded by the runtime, some by the teacher, and some activities mix both.

**User-visible**: Teacher inserts a "short answer" or "essay" block (new question-block types). Student submits free text; the runtime treats it as ungraded and the submission lands in the teacher's dashboard with a "needs grading" status. Teacher opens the submission, sees the student's response, applies a multi-criterion rubric (each criterion has a label, a max-points value, and per-level descriptors), enters feedback per criterion, and finalizes the grade. The aggregate score for the submission is the rubric total. Students never see their grade as a single number — they see per-criterion scores with the feedback the teacher wrote.

Activities can be `gradingMode: 'auto'` (current Phase 1–2.5 behavior), `'manual'` (no auto-scoring, everything pending until teacher grades), or `'mixed'` (some blocks auto-grade, others wait for the teacher; final dashboard score combines both).

**Architectural delta**: `gradingMode` field on `ActivityMeta` activates (it was added in Phase 1 Stage 9e as a deliberate forward-compatibility move). New block types `short_answer` and `essay` in the discriminated union — both have prompts, both expect free text, essay adds optional word-count guidance. A new `rubrics` table in the database: rubric belongs to an activity, has criteria with descriptors, versioned alongside the activity (rubric edits apply prospectively, not retroactively, just like activity versions). A new `grades` table joins submissions to rubric criteria, storing per-criterion score + feedback. New Edge Function `grade-submission` (or RPC) that the teacher dashboard calls when a teacher submits a rubric. Submission dashboard adds a "needs grading" filter and an inline rubric-application UI.

For `SubmissionResponses`: a new parallel map `freeResponses: Record<uuid, { text: string, wordCount: number }>` keyed by block.id. The teacher's grading lives in the separate `grades` table, not in the jsonb, because grades are mutable (teacher can revise feedback) and submissions are not.

For the runtime: short_answer and essay blocks render as textareas with optional character/word counters. They participate in submission but skip the auto-scoring path entirely. Checkpoint behavior in `locked`/`free` modes doesn't apply to manually-graded blocks — there's nothing to check at student-time.

**Decisions deferred to the start of this phase**:
- **Rubric reuse across activities.** District-shared rubrics? Per-teacher template library? Both? Phase 4 multi-tenancy makes shared rubrics more interesting.
- **Grade-pass audit trail.** Does each grading pass amend the existing grades row, or create a new "grading_attempt" row that joins to the previous one? Probably the join, for the same audit-trail reasons attempts are separate rows. Decide at phase start.
- **Rubric editing UX.** Side-by-side with student response? Modal? Probably side-by-side; teachers grade in flow.
- **"Quick feedback" vs full rubric.** Some teachers will want to leave one-line feedback without filling in every criterion. Allow a "general feedback" field separate from per-criterion fields, or force every criterion to be scored? Probably allow partial rubric application with a "criteria not yet scored" indicator.
- **Re-grading after revision.** When a student revises (in `revisionMode: 'free'`), does the previous grade carry over until the teacher re-grades, or get invalidated? Probably invalidated with an "ungraded since last revision" indicator on the dashboard.
- **Student-facing feedback rendering.** Does the rubric show up inline with their response (highlighted spans for what each criterion targets) or as a sidebar? Phase 2.6 is probably a sidebar; inline rubric anchors are a later polish.

**Done when**: A teacher can build an essay-style activity, students submit, the teacher grades against a rubric, and students see per-criterion feedback. Mixed-mode activities (e.g., 5 multiple-choice + 1 short essay) display sensibly in the dashboard with the auto-graded portion scored immediately and the manual portion clearly flagged as pending.

---

## Phase 2.7 — Graphing track (calculator tool + interactive graphing)

**This phase is one track, not two features.** It introduces a shared **graphing kit** — layered as (1) an expression layer (MathLive input → compiled function) and (2) a board layer (JSXGraph: axes, plotting, zoom/pan, keyboard / screen-reader narration) — with two faces built on top: a **calculator tool** (ungraded scaffold; the front of the track) and **interactive graph blocks** (graded question type; the original 2.7 scope, now the later stage). Both consume the same kit; neither reimplements plotting or expression parsing. The library is JSXGraph, **self-built (Path B)** — embedding the real Desmos API stays a district-funded escape hatch, never the default, so the platform never depends on Desmos for a load-bearing math feature.

The track ships smallest-shared-foundation-first: **scientific calculator** (MathLive + evaluator, no JSXGraph) → **single-function graphing** (adds the board layer) → **data table + regression** (linear / quadratic / exponential — the Texas Algebra I requirement, pulled forward) → **multi-expression list** (the Desmos-defining surface) → **graded interactions** (the blocks below) → further advanced (stats beyond regression, implicit / inequalities). Calculator design captured in `docs/design/calculator-tool.md`; graded-block design in `docs/design/interactive-graph-block.md`.

**The calculator tool.** A teacher-configurable, Desmos-style calculator students summon while working — *functionally* familiar so students feel at home, *visually* its own identity so it stays clear of Desmos's trade dress (functional twin, visual stranger). It is a **scaffold** (the reference panel's sibling): ungraded, produces no submission, carries no answer key, no `STORAGE_SCHEMA_VERSION` bump. Teachers limit it **per-activity** via a tiny, additive set of shape-named flags (mode ceiling, trig / log gates, graphing on/off, regression models, locked viewport, expression cap) and **preview the restricted tool inline** — the same widget runs in the author and student views, so what the teacher sees is what the student gets. Lazy-loaded **on click**: a page with a calculator available pays ~nothing until a student opens it. This is also the feature that finally brings MathLive into published HTML (the CLAUDE.md "Phase 2.5 decision"), justified by the on-click lazy load.

**The graded face — interactive graph blocks.** Graph blocks that students manipulate — plot a point, drag a line into position, shade a region — with tolerance-based scoring against teacher-authored answer keys. The Algebra II feature most likely to replace what teachers currently leave the platform to use Desmos for. Also natural fit for science (vector diagrams, force diagrams) and economics (supply / demand curves).

**User-visible**: Teacher inserts a graph block, chooses an interaction type, drags handles to set the correct answer, sets tolerance bounds. Student sees a coordinate plane with draggable handles, manipulates them to answer, gets per-section checkpoint feedback like fill-in-blank already provides. Full keyboard and screen-reader support for students who need it.

**Architectural delta**: New `interactive_graph` block type with a discriminated union over interaction types (point, line, region, eventually parabola and transformations). Lazy-loaded JSXGraph widget — the main runtime stays under 20KB; pages with graph blocks dynamic-import a separate `graph-widget.js` bundle. New scoring strategies join the `evaluateAnswer` dispatch (`'graph-point'`, `'graph-line'`, `'graph-region'`). `SubmissionResponses` bumps schemaVersion with a parallel `graphResponses` map (distinct from blanks because the answer shape is structured, not string). Server-side grading (Phase 5) becomes more urgent here than for fill-in-blank — the structured answer key in published HTML is more leakable.

Design captured in `docs/design/interactive-graph-block.md`.

**Decisions deferred to the start of this phase**:
- Library choice — **leaning resolved: JSXGraph, self-built (Path B)** (Mafs and GeoGebra evaluated; embed-Desmos is a paid escape hatch only). Confirm with a one-day spike.
- Evaluator / regression-math library — math.js vs. a lighter parser + a small least-squares routine; one-day spike at track start, shared by calculator regression and graded-line scoring.
- `graph-kit.js` bundling — one shared bundle vs. kit + per-face bundles; build-time call once real sizes are known.
- Calculator config scope — per-activity in v1; per-section override (no-calculator section, then calculator section) is an additive later change.
- Calculator state persistence — deferred; if added, its own localStorage key, never the scored-state blob (no `STORAGE_SCHEMA_VERSION` bump).
- Statistics beyond regression (mean / median / quartiles) — a later stage, not stage 3 (regression only there).
- Whether `correctEquation` authoring (graded blocks) uses plain string input or MathLive WYSIWYG.
- Print behavior — calculator can't print (optional one-line "Calculator: scientific functions only" note on the worksheet); interactive graphs print as static axes + empty answer space.

**Done when**: The graphing kit powers both faces. A teacher can enable and restrict a Desmos-style calculator on an activity (the student summons it, sees only the permitted functions, and can run a linear / quadratic / exponential regression on entered data) — *and*, at the graded end of the track, author a "plot the line y = 2x + 3" problem that a student solves on a Chromebook (with or without a mouse, with or without a screen reader), with the plotted slope and intercept and the within-tolerance verdict shown in the dashboard.

---

## Phase 2.8 — Media submissions

Student-generated audio, video, and uploaded files as response types. Opens foreign language (pronunciation, dialogue), music (performance recordings), PE / drama (movement / performance video), science labs (uploaded data files, photos of physical work), art (work-in-progress photos), and ELA (uploaded essay drafts) as first-class use cases.

**User-visible**: Teacher inserts an "audio response," "video response," or "file upload" block, optionally with prompt, time limit, file-type restrictions, and rubric (paired with Phase 2.6's manual grading). Student records audio / video in-browser or uploads a file. Submission lands in the dashboard; teacher can play / view / download and grade via rubric.

**Architectural delta**: Three new block types — `audio_response`, `video_response`, `file_upload`. New parallel map on `SubmissionResponses`: `files: Record<uuid, { storagePath: string, mimeType: string, durationSec?: number, fileName: string }>` keyed by block.id. The actual media lives in a private R2 bucket (or a private prefix within the existing bucket, with separate access policy) — `student-submissions` is private, served via short-lived signed URLs to authenticated teachers only. The runtime gains a media-capture widget (MediaRecorder API for audio / video) and an upload widget (file input + drag-drop). On submit, the runtime uploads media via signed-upload-URL pattern (Edge Function issues the URL, runtime PUTs directly to R2), then includes the resulting storage paths in the submission payload.

This is the privacy-sensitive phase. Student-generated media is a stronger privacy posture than typed text — voices and faces are identifying in ways that names aren't. Architectural commitments: media is never served publicly, signed URLs expire quickly (15 minutes), bucket has strict access policy that mirrors the existing submissions-table RLS (only the assigning teacher / activity owner can issue signed URLs for a student's media), no anonymous access to media ever, audit log records every signed-URL issuance.

This is also the first cost cliff for the platform — see the Sustainability model cross-cutting concern below. Phase 2.8 introduces per-teacher media storage quotas (not paywalls): free tier teachers get a generous cap (~500MB of stored student media at any one time) with auto-purge of media older than 90 days from archived assignments; `supporter` tier (optional paid individual) raises the cap and lengthens retention; `institutional` and `comp` tiers are effectively unlimited (bounded only by the district-level total). The quota is a cost ceiling, not a feature gate — a teacher hitting the cap sees "your students' media will be auto-purged after X days unless your school upgrades," not "your students can't submit." The runtime never blocks submission on quota; the quota only governs retention. This protects the platform from runaway costs without compromising the student-side experience.

**Decisions deferred to the start of this phase**:
- **Per-teacher storage quota.** A 5-minute video at 720p is ~50MB; a class of 30 students recording weekly fills a bucket fast. Default quota? Overage policy?
- **Retention policy after assignment archival.** Auto-delete media N days after the assignment is archived? Teacher-controlled? District-controlled (Phase 4)?
- **Content scanning.** Automated content moderation on uploaded media? Probably not in Phase 2.8 — student-facing scanning has its own privacy issues — but flag the question for districts that might require it (Phase 4).
- **In-browser recording vs upload only.** MediaRecorder API works in modern browsers but iOS Safari has historically had quirks. Decide whether Phase 2.8 launches with both, or upload-only with recording as a follow-up.
- **Video transcription.** Auto-generated captions for accessibility? Strong UDL win but adds a transcription service dependency. Maybe Phase 4 once the platform is district-scale.
- **Compression on upload.** Raw video is large; should the runtime transcode before upload? Modern browsers can but it's slow on Chromebooks. Probably upload raw + transcode server-side later.

**Done when**: A foreign language teacher can build an activity where students record themselves reading a dialogue, a student records and submits from a Chromebook microphone, and the teacher plays back and grades against a pronunciation rubric.

---

## Phase 2.9 — Annotation responses

Question types where the student interacts with a piece of content — a passage, an image, a diagram — by highlighting, labeling, circling, or marking. Close reading (ELA), error identification (math proofs, code), anatomy labeling (biology), period identification (history images), feature labeling (geography maps).

**User-visible**: Teacher inserts an "annotate text" or "annotate image" block, providing the content (passage or image) and the correct answer (which spans should be highlighted, which regions should be labeled). Student sees the content with annotation tools — highlight, click-to-label, draw-a-circle — and marks their response. Submission stores the structured annotation data; runtime scores against the correct answer with positional tolerance.

**Architectural delta**: New block types `annotate_text` and `annotate_image`. New parallel map: `annotations: Record<uuid, AnnotationResponse>`. The AnnotationResponse shape is itself a discriminated union (text-span annotations vs. image-region annotations). New scoring strategies in the dispatch: `'annotation-text'`, `'annotation-image'`. Storage of the underlying content (passage text inline, image via the existing Phase 2 image upload). Renderer emits the content plus annotation-target metadata; lazy-loaded annotation widget (similar pattern to graph) provides the interaction UI.

This is the second "structured response over rendered content" block category (interactive_graph was the first); the architectural pattern is shared. Lazy-loaded widget, structured answer key in `data-` attributes, parallel response map, dispatch-based scoring.

**Decisions deferred to the start of this phase**:
- **Annotation coordinate space.** For text: DOM-anchor + character-offset pairs, or normalized character indices into the rendered string? For images: CSS-pixel offsets, normalized fractions of image dimensions, or relative to a viewBox? Each has stability trade-offs across rendering contexts (print, mobile reflow, image scaling). Decide at phase start; the answer probably depends on whether we want annotations to survive content edits to the underlying passage (probably yes, which argues for character indices + image normalized fractions).
- **Partial credit for partial annotation.** If the correct answer is "highlight these 4 spans" and the student highlights 3 of them plus 1 wrong one, what's the score? Probably F1-style precision + recall, but the formula is worth a deliberate choice.
- **Annotation tool affordance per device.** Highlighting on touch is easy; precise region-drawing on touch is harder. Touch-friendly defaults; click-and-drag on desktop.
- **Multi-annotation per response.** Can a student make multiple distinct annotations on one image (e.g., "label the femur, the tibia, the patella")? Almost certainly yes — that's the most common labeling pattern. Schema and runtime support multiple annotations per response from day one.
- **Print behavior.** Annotated responses are interesting on paper. Probably print as the content + space for handwritten annotation; teacher grades manually if printed.

**Done when**: A biology teacher can build an activity with a labeled skeleton diagram and students label parts by clicking regions, getting auto-feedback per label. An ELA teacher can build a close-reading activity where students highlight thesis statements and supporting evidence, with separate scoring per category.

---

## Phase 3 — Classroom integration

The biggest external integration. Until now, students are anonymous-with-typed-name. Phase 3 makes them roster members with stable opaque tokens, grades flow back to Classroom, and "assign" becomes a real verb.

**User-visible**: A teacher clicks "Assign in Classroom" inside the activity. They pick a course and section. The activity is posted to that Classroom course as an assignment. Students click through, identify themselves automatically (via Classroom's session), submit. The teacher sees per-student submissions in the dashboard *and* the grade flows back to Classroom's gradebook. Names are canonical (no more "Bob S" vs "Bobby Smith" duplicates).

**Architectural delta**: Google Classroom OAuth scopes added to the existing Google sign-in. Roster fetch on assignment creation, populating `assignment_students` with one opaque token per student. Token-based submission path replaces the typed-name path for assigned activities (link-share continues to work for non-assigned use). Grade passback Edge Function (or scheduled job) that takes scored submissions and writes Classroom CourseworkSubmission grades. For activities with manual-graded items (Phase 2.6+), grade passback waits until the manual grading is complete.

**Decisions deferred to the start of this phase**:
- **Reaching LMSes beyond Classroom — one LTI integration, not bespoke connectors.** Google Classroom is an outlier: it does not support the LTI standard, which is why Classroom gets its own dedicated Classroom-API integration (this phase). Every other major LMS — Canvas, Schoology, Moodle, Brightspace, Blackboard — speaks LTI 1.3, so a *single* LTI integration reaches all of them at once, grade passback included. Multi-LMS support is therefore one engineering effort, not five — a later phase (post-Classroom), not Phase 3. The earlier "keep narrow" instinct was a guard against bespoke per-platform sprawl; LTI sidesteps that, so it no longer argues against multi-LMS reach. Link-share stays the zero-integration floor that works with any system today. LTI passback lands grades in the *LMS* gradebook; the LMS-to-SIS sync is the district's existing plumbing, not something this project builds.
- How to handle students who join the class after assignment creation? (Re-fetch on submission attempt, probably.)
- What happens when a teacher edits and republishes an activity that's already assigned — do existing students' assignments update, or stay pinned to the version they were assigned?

**Done when**: A teacher can assign an activity in Classroom, students take it without typing names, and grades land in the Classroom gradebook with no manual export/import.

---

## Phase 4 — Multi-tenancy

Districts and schools become first-class concepts. Until now, every teacher is a sole proprietor of their own activities. Phase 4 introduces shared workspaces and the governance that comes with them.

**User-visible**: A district admin invites teachers into a district workspace. Teachers can publish activities to "personal" or "district" scope. District-scoped activities are visible to other teachers in the same district (with read-only or co-edit permissions, depending on share settings). Co-teaching: two teachers can collaborate on a single activity. District admins see usage data without seeing student PII.

**Architectural delta**: New `organizations` and `user_organizations` tables. New `activity_collaborators` table (we sketched this in conversation — it's a join table with a role per collaborator). Nullable `organization_id` columns added to `activities` and `assignments`. The `can_read_activity`, `can_edit_activity`, and `can_access_assignment` helper functions extend to recognize org membership and collaborator roles — this is exactly what those helpers were designed for. The user role enum gains `district_admin`. The visibility enum gains `'organization'` to sit alongside `'private'` and `'public'`.

**Institutional pricing tier activates.** Phase 4 is the natural moment for paid pricing to land — see the Sustainability model cross-cutting concern below. Pricing is per-teacher-seat on an annual subscription ($3-15/teacher/year is the typical edtech range for tools of this scope, with the specific number set after the first few district conversations). District admin assigns seats; users in a paid org get `account_tier = 'institutional'` automatically via the `user_organizations` membership. Teachers without a paid seat in the org fall back to `account_tier = 'free'`. Collaborator teachers (`account_tier = 'comp'`) keep institutional-equivalent access regardless of org membership — `comp` overrides org-derived tier so founding contributors don't lose access if their district later signs up.

This is also when the platform crosses from "personal project" to "small business" in the legal sense: the platform needs an LLC (or equivalent business entity), a W9, and an ability to invoice. School and district procurement processes are designed for institutional purchases, not personal payments, so this overhead is the gating cost on revenue. It's tractable but non-trivial — budget the actual time and money for entity formation, basic accounting setup, and a simple Stripe-or-similar billing layer at Phase 4 start.

**Activity-level (and eventually district-level) glossary**. `ActivityMeta.glossary` becomes a map of stable keys to `{term, definition}`. The Phase 2 definition mark gains a `glossaryKey` field that resolves against this map at render time, so a teacher who defines "factor" once in the glossary has every marked instance share the same definition (and editing the glossary updates them all). Editor adds a glossary-management panel; marketplace authors (Phase 5) can ship activities with curated glossaries. The mark schema is forward-compatible from Phase 2 — `glossaryKey` is an additive optional field, no migration.

**UDL expansion.** Multi-tenancy is the natural pairing for the bigger Universal Design for Learning commitments: audio narration of activity prose (with word-level highlighting during playback), translation of UI strings into a teacher-selected primary language, configurable color schemes for low-vision and dyslexia-friendly rendering. These accumulate as additive renderer / runtime features layered on the data-attribute contract. District procurement processes specifically ask about UDL compliance; Phase 4 is when answering "yes, here are the receipts" becomes commercially important.

**Decisions deferred to the start of this phase** (the meaty ones):
- **Governance: who owns what when a teacher leaves a district?** Three reasonable models, pick one before designing org features:
  1. Teacher always owns; district has shared access while they work there.
  2. District owns content created within district scope; teacher loses access on leaving.
  3. Hybrid: personal scope is teacher-owned, district scope is district-owned.
- District admin capabilities: just billing/membership, or also content moderation, also analytics access?
- How invoicing works at the district level (probably moves to Phase 5 alongside marketplace billing).
- TTS provider for audio narration: browser Web Speech API (free, quality varies) or a server-side service (Google / Amazon, consistent quality, costs money). Probably Web Speech for Phase 4 launch with a server-side upgrade path.

**Done when**: Two districts are using the system independently with their own teacher rosters, and the data isolation between them is bulletproof (cross-district reads are impossible at the RLS level).

---

## Phase 5 — The marketplace

The endgame. Teachers publish high-quality activities for sale. Other teachers (or districts) buy them. Discoverability, ratings, royalties.

**User-visible**: Browse a catalog of activities by topic, grade level, standards alignment. Free and paid items. Buy an activity individually, or subscribe to a creator's full library. Use purchased activities as if you authored them (read-only — you can assign them, see submissions, but not edit). Authors see aggregate usage data on their published activities (no PII), and royalty deposits.

**Architectural delta**: Stripe integration. Purchase/entitlement table. Reviews and ratings tables. Search and discovery UI (probably full-text via Postgres `tsvector` to start; specialized search later if scale demands). Server-side grading replaces client-side scoring for marketplace activities — this is the "security ceiling" finally being addressed: answer keys move out of published HTML and into a server-side scoring endpoint. Author dashboards with revenue and engagement data.

**Decisions deferred to the start of this phase**:
- Pricing model: per-activity purchase, subscription, both?
- Revenue split (if any) between author and platform.
- Whether districts can buy bulk seats vs individual teachers paying.
- How aggregation stats work cross-organization without leaking student data — almost certainly through the same `activity_aggregate_stats` view we already sketched, computed server-side per author.
- Quality control: editorial review, community flagging, both, neither?

**Done when**: A teacher who has never met another marketplace user can search, find, purchase, assign, and use an activity — and an author who's never met that buyer is paid for the use, with the platform never seeing student data flow between them.

---

## Cross-cutting concerns

These don't belong to any single phase but matter throughout.

**Sustainability model.** The platform is built by a teacher for teachers, not as a venture; the funding model reflects that. Through Phase 1 and most of Phase 2, the operating costs are bounded at roughly $0-25/month total (Supabase free tier for database / auth / Edge Functions, Cloudflare R2 free tier for HTML hosting, no media yet) — sustainable indefinitely on personal funds if the mission matters. The first real cost cliff is Phase 2.8 (media submissions: audio, video, file uploads), where student-generated content can scale storage and bandwidth quickly. The second cliff is district scale (hundreds of teachers, regular use), where monthly costs reach the point that revenue becomes necessary.

The pattern adopted from the dominant K-12 edtech model (Pear Deck, Edpuzzle, Quizizz, Nearpod, Khan Academy variants): **free for individual teachers indefinitely, paid at the institutional level**. Mechanics:

- **Individual teachers always have free access to core features.** Phase 1 and 2 functionality is free forever — no time-limited trial, no feature lockouts. The build → publish → submit → review loop stays available regardless of `account_tier`.
- **Students never pay, never sign up, never see a paywall.** This is non-negotiable and shapes every design decision around student-facing surfaces.
- **Per-teacher quotas (not feature paywalls) cap cost ceilings at Phase 2.8+.** Free tier teachers get generous-but-bounded storage for student-generated media (~500MB with 90-day retention on archived assignments). The `supporter` tier raises caps for individual teachers who want to chip in (Buy Me a Coffee equivalent). Quotas govern *retention*, never blocking submission — a student whose teacher is over quota can still submit; the media just gets auto-purged sooner. This protects the platform from runaway costs without ever degrading the student experience.
- **Institutional pricing activates at Phase 4 alongside multi-tenancy.** Districts pay per-teacher-seat annually ($3-15/teacher/year is typical for tools at this scope, set after first district conversations). District admins manage seat assignments; users in paid orgs get institutional-tier access automatically. This is "land and expand": teachers adopt the free tier individually → students use it → administrators see value → district formalizes.
- **Marketplace revenue share funds the platform at Phase 5.** Authors who sell activities pay a platform fee on transactions. Doesn't paywall features — funds operations from the value exchange itself.

The `account_tier` enum on the `users` table tracks per-user limit-application status: `'free'` (default), `'supporter'` (optional paid individual), `'institutional'` (assigned via paid org membership), `'comp'` (complimentary access — collaborator teachers, founding contributors, beta partners). Inert in Phase 1 because no tier-gated behavior exists yet; the field is added in Stage 9e as a forward-compatibility move. `comp` tier is specifically the mechanism for thanking founding-team teachers who help shape the platform — they get institutional-equivalent access without any payment requirement, and that access persists even if their district later signs up for a paid tier.

Two practical commitments worth naming for future-me:

- **Don't pre-build Stripe.** Billing infrastructure is Phase 4 work, built after the first district conversations inform actual customer needs. Pre-building it costs time that should go to adoption-driving features and locks in design decisions on guesses.
- **The platform crosses from "personal project" to "small business" at Phase 4.** Schools can't pay individuals through procurement; they pay vendors with W9s and invoicing capability. Phase 4 start requires forming an LLC (or equivalent), basic accounting setup, and a billing layer. Budget actual time and money for this — it's tractable but real overhead.

Non-monetary risk worth flagging: solo-dev burnout. A successful free tool becomes a job nobody signed up for. Institutional pricing at Phase 4 isn't really about the dollar amount — it's about filtering users who'd consume support without contributing back, and protecting future-me from feeling exploited by my own success. An optional "supporters" link (Buy Me a Coffee, GitHub Sponsors) can be added at any phase without changing product mechanics — costs nothing to set up, gives users who get value a way to express it, and provides a small psychological cushion against burnout.

**Subject portability.** The platform leads with math because that's where the founder teaches, but no architectural decision is math-only. The block discriminated union absorbs new subject-specific block types (timeline, reading passage, audio embed, citation, annotation) without migration. The `skills: string[]` taxonomy is framework-neutral by design — works equally well for "factoring quadratics," "thesis development," "stoichiometry," "narrative structure," "primary source analysis." The `SubmissionResponses` shape extends by parallel maps (`choices`, `orderings`, `matches`, `graphs`, `files`, `essays`, `annotations`) rather than widening any single response type — each new map is an additive schema-version bump with migrate-on-read. Renderer and runtime emit `data-block-category="content|question|scaffold"` to reason about block kinds without sniffing block-type, so future cross-subject dashboard features (per-block-category analytics, subject-aware activity templates) don't need a renderer pass. Standing rule for the project: when extending the schema or renderer, prefer a generalization that fits multiple subjects over a math-specific implementation. Name new features by their shape, not their subject (`numeric_input` rather than `physics_quantity`, `annotation_response` rather than `close_reading`). The cost of generalization at design time is small; the cost of retrofitting subject-specific decisions when the second subject arrives is large.

**Privacy.** Student PII minimization is a foundational commitment. The schema is designed so that the only student-identifying data stored is what's strictly required to attribute submissions to a person — no contact info, no demographics, no location. Opaque tokens (Phase 3) replace typed names with non-personally-identifying identifiers. The `assignment_students` table is privacy-critical and access is gated through the assigning teacher only — never through activity authorship, even after marketplace activities exist. Audit log entries use `ip_hash`, never raw IPs. Phase 2.8's student-generated media tightens the privacy posture further: audio and video are stronger identifiers than typed names, so they live in a private bucket with short-lived signed-URL access and no anonymous read path.

**Accessibility.** Currently the weakest area. WCAG 2.1 AA is the right target for educational software. Issues to address by Phase 2 minimum: keyboard navigation in the block editor, screen reader support for math (KaTeX has reasonable defaults but custom blocks need explicit ARIA), color contrast in callout variants, focus management in the slash menu. Phase 4's UDL expansion is the larger commitment: multiple means of representation (text + audio narration), expression (typed + uploaded + recorded), and engagement (configurable presentation). When manually grading (Phase 2.6+) lands, rubrics include feedback in a form that's accessible to students using screen readers — the rubric is not just a teacher artifact, it's how the student learns.

**Performance.** Students often access activities on school-issued Chromebooks with slow Wi-Fi. Static published HTML is the right answer here — no React bundle, no auth round-trip, no SSR latency. Don't regress this. Cloudflare R2 hosts the published HTML from Phase 1 onward, chosen for zero-egress cost (critical as student-driven download volume scales with adoption) and global edge distribution. Total weight per published activity should stay under 100KB excluding images. The lazy-loaded-widget pattern (interactive_graph in Phase 2.7, annotation widget in Phase 2.9) keeps the cost of new question types bounded — pages without those blocks pay nothing. Runtime inlining (Stage 11) and KaTeX inlining (Phase 1) trade one-time bundle size for zero additional requests at page load — the right call for Phase 1, revisited in Phase 3+ when a versioned CDN-hosted shared runtime becomes worthwhile.

**Hosting platform.** Published activity HTML lives on Cloudflare R2, not Supabase Storage. This is a hard constraint, not a preference: Supabase's free tier rewrites all HTML responses to `text/plain` with a sandbox CSP as an anti-abuse measure to prevent the platform from being used as arbitrary web hosting. The restriction applies to both Storage public-bucket URLs (documented at https://supabase.com/docs/guides/storage/quickstart) and Edge Functions returning `text/html` (documented at https://supabase.com/docs/guides/functions/limits — "Serving of HTML content is only supported with custom domains"). The only escape on Supabase is the Pro plan ($25/mo) with a custom domain configured; ROADMAP's sustainability model defers paid tiers to Phase 4, so the constraint binds throughout Phase 1-3. Cloudflare R2 is the chosen host: zero egress (uniquely valuable for student-driven download patterns), S3-compatible API (no library lock-in), generous free tier (10 GB storage + 1M writes + 10M reads/month — covers Phase 1-4 by a wide margin), free custom domain support. The hybrid architecture is **Supabase for database / auth / Edge Functions, R2 for published HTML output** — minimum-viable Cloudflare adoption, not a full migration off Supabase. The Edge Function `publish-activity` uploads to R2 via the AWS SDK; everything else stays on Supabase. Migration to another S3-compatible host (Backblaze B2, Wasabi, AWS S3) later would be a config change, not a code rewrite. R2's custom-domain support means Phase 2+ can move student-facing URLs from `pub-<hash>.r2.dev` to `activities.<brand>.com` without changing the architecture.

**Internationalization.** Currently English-only. Spanish becomes plausibly relevant if Dallas ISD's bilingual programs adopt the system, or if Phase 4 brings in districts with Spanish curriculum. Plan: use a translation layer (`react-i18next` or similar) for UI strings, but keep activity *content* in whatever language the teacher writes it. Don't try to auto-translate worksheets. Phase 4 UDL expansion includes UI translation as a first-class commitment for districts whose teaching language isn't English.

**Versioning discipline.** Both `ActivityDocument` and `SubmissionResponses` have `schemaVersion` fields and are designed for migrate-on-read. When you change a shape, bump the version, write a migration function in the schema package, and never mutate existing stored data. This discipline pays off enormously over years. The naming convention is "rename when demoting, not when promoting": `SubmissionResponses` always names the current version; the previous version is `SubmissionResponsesV(N-1)` and is kept only for the migrate-on-read path.

**Math rendering inside dynamic UI — a known gotcha class.** KaTeX itself is synchronous, which avoids the worst of the async-rendering bugs that plagued the previous MathJax-based system. But math rendered inside Tiptap NodeViews introduces a new version of the same problem: NodeViews mount, unmount, and re-render aggressively as the user edits, and a NodeView that calls `katex.render()` in a `useEffect` can race with its own teardown. Symptoms to watch for during editor work: math briefly appearing as raw LaTeX before rendering, math disappearing on edits adjacent to it, ghost-state from previous renders leaking into new content. The mitigation is straightforward (render in a layout effect, render synchronously into a stable child node, clean up on unmount), but the *category of bug* is worth recognizing on sight rather than re-debugging from scratch. A previous chat exists with extensive debugging of the analogous MathJax timing issue ([the Activity creation and publishing issues chat](https://claude.ai/chat/556a78e3-31fd-4c78-b1cc-9d72dcdf8d4f)) — the specific solution doesn't transfer to KaTeX, but it documents the failure modes in detail.

**Data retention and deletion.** Soft-delete with 30-day purge cron is in place at the SQL level (`purge_soft_deleted` function). Phase 2 needs a "delete my account" UX that triggers the soft delete. Phase 4 needs district-level retention policies (e.g., "keep submission data for the school year, then purge"). Phase 2.8 media submissions need a complementary policy for student-generated media (the typed-text-only assumption breaks here). GDPR-style data export is a Phase 5 nice-to-have if any EU schools adopt.

**Security ceiling on answer keys.** Phase 1–4 has answer keys baked into the published HTML. A motivated student can view source. This is acceptable for low-stakes practice; it's NOT acceptable for graded summative assessments or marketplace items where author IP is at stake. Phase 5's server-side grading addresses this. Until then, the system is appropriate for formative assessment, not summative — make this explicit in marketing/onboarding. Note that Phase 2.6 manual grading is naturally immune to the answer-key leak problem — there's no answer key in the HTML for essays and short answers because there's no auto-scoring.

**Evidence-based pedagogy as a design constraint.** The features the platform prioritizes reflect what cognitive science says drives learning, not what's cheapest to ship. Worked examples and faded variants (Phase 2 block types) draw on Sweller's cognitive load theory. Confidence ratings (Phase 1) draw on metacognitive calibration research. Rubric-based grading with per-criterion feedback (Phase 2.6) draws on formative assessment research: students learn more from criterion-specific feedback than from composite scores. Retrieval practice and spaced practice are evidence-based but require cross-activity content linking (out of scope until Phase 4+). When in doubt, the question to ask is "does this feature help students learn, or just help them complete?" — features that help completion without helping learning aren't worth building.

---

## What this product is NOT

A useful set of constraints. Whenever a feature feels appealing, check it against this list:

- **Not a Learning Management System.** No course shells, no message boards, no calendars. Plays nicely with Google Classroom (Phase 3+); doesn't try to replace it.
- **Not a general document editor.** The block model is opinionated for educational activities. Trying to be Notion-for-everyone breaks the focus.
- **Not a student-facing app.** Students never log in. Students never have accounts. Students never have profiles. Submissions are attributed but the system doesn't store relationships between students or their work over time.
- **Not a grading tool for high-stakes assessment.** See "security ceiling" above. Formative practice, exit tickets, homework — yes. Final exams — no, until Phase 5+ if ever.
- **Not a quiz platform.** Quizzes have time limits, randomization, anti-cheat. Worksheets and activities don't. Stay in the activity lane.

---

## What ROADMAP.md is and isn't

- **Is**: A long-term plan, the framing for "is this Phase 2 work or Phase 4 work?", a record of decisions made and decisions deferred to a later phase.
- **Is not**: A backlog (use GitHub Issues). A specification (use design docs per feature). A todo list (that's STATE.md's "nearest next steps"). A timeline (phases ship when they ship).

When this file conflicts with STATE.md, STATE.md wins (it describes reality). When this file conflicts with code, code wins (it describes what's shipped). When code, STATE, and ROADMAP all agree, you're doing things right.

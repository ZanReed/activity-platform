# ROADMAP.md

The long-term plan. STATE.md says where things are *today*; this file says where things are *going*. Updated rarely (when a major decision changes), not at the end of every session.

## Vision

An interactive math activity platform for K–12 educators that starts as a small invite-only tool for one Algebra II department, grows into a Google Classroom–integrated platform for districts, and ends as a multi-tenant creator marketplace where teachers can buy and sell high-quality activities. Static, fast, accessible, privacy-respecting; never stores student PII it doesn't need; treats teachers as the primary users, students as the audience their work is for, and districts as the eventual buyers of curriculum.

## Phases at a glance

| Phase | Theme | User-visible win |
|---|---|---|
| **1** | The MVP loop | Sign in, build a worksheet in a block editor, share a link, see submissions |
| **2** | Polish the loop | Markdown import, image upload, better submission analytics, self-signup |
| **2.5** | Parameterized problems | Template-based variants (authoring-time, then runtime) |
| **3** | Classroom integration | "Assign in Classroom," roster-based identity, grade passback |
| **4** | Multi-tenancy | District/school workspaces, co-teaching, admin controls |
| **5** | Marketplace | Teachers sell activities to other teachers and districts |

Phases are named, not dated. Each phase is "shipped" when its loop is complete and used by real teachers, not when a date arrives.

---

## Phase 1 — The MVP loop

The complete create-publish-submit-review cycle, end to end, for one teacher (then a small group of colleagues) using invite-only access. Replaces an existing GitHub Pages-based workflow with a maintainable foundation that everything else builds on.

**User-visible**: Allowlisted teachers sign in via Google. They create activities in a vertical-stack block editor (paragraph, heading, math, image, callout, problem, fill-in-blank). They publish to a static URL. They share that URL with students, who fill out the worksheet and submit with their name. Teachers see submissions in a simple table.

**Architectural delta**: Everything from scratch. Postgres schema with append-only versioning, RLS, signup trigger with allowlist, atomic publish RPC, ingest submission RPC. Edge Functions for publish and submission. TypeScript packages for schema (Zod), renderer (pure JSON-to-HTML), and the React app (Vite + Tiptap). Static HTML on publish, hosted in Supabase Storage.

**Bounded by**: ~6–8 core block types. Image-by-URL only (no upload). Single owner per activity. No multi-column layouts. Simple raw-table submission viewer (no per-blank aggregation yet). English only. Allowlist-only access (no self-signup).

**Done when**: One teacher can build a worksheet, share it, and see real student submissions in the dashboard. End-to-end loop works without manual intervention.

---

## Phase 2 — Polish the loop

Quality-of-life improvements that make the Phase 1 loop pleasant rather than barely-functional, before opening to a broader audience.

**User-visible**: Paste a markdown list of problems and get blocks (port of the existing bulk-importer pattern). Upload images directly instead of pasting URLs. Submission viewer shows aggregate per-blank stats ("78% got blank #3 correct"). Self-signup with email verification replaces the allowlist for general use, with the allowlist remaining as an admin override for restricted contexts. Section color tinting and a few more block types (table, divider, video embed) earn their way in if teachers ask for them.

**Vocabulary definitions**: teachers can select a word or phrase in the editor and attach an inline definition. Students see the defined term subtly underlined; click or tap (or focus + Enter) opens a popover with the definition. Targets the math-specific vocabulary barrier — "factor" as verb vs. noun, "rational expression," "domain," "coefficient" — that disproportionately gates Algebra II for ELL students and kids who arrived without earlier-grade terminology internalized. Inline-only in Phase 2; the activity-level glossary that lets a teacher define "factor" once and have every marked instance share that definition is a Phase 4 extension of the same mark.


**Architectural delta**: Image upload to Supabase Storage (Phase 2 — public bucket but with size limits and a cleanup policy). Aggregate-stats query/view. Email verification flow in Supabase Auth. Markdown parser package (likely a thin port of the existing bulk-importer.js into TypeScript, with the same line-anchor logic). A new Tiptap mark (definition) joins the bold/italic/code mark set, carrying an inline definition string. Renderer emits <span class="definition" data-definition="..." tabindex="0" role="button"> with full keyboard accessibility (Tab to reach, Enter/Space to open, Esc to dismiss; floating-ui for positioning, already a transitive dependency via the drag handle). Runtime gains a definition-popover handler — a new interactive element class in the data-attribute contract. Attribute names (data-definition, data-glossary-key) are designed now so the Phase 4 glossary layer is additive, not a rename.



**Decisions deferred to the start of this phase**:
- Image hosting limits and lifecycle: per-teacher quota? Auto-delete after N days of non-use?
- Whether to migrate published HTML hosting to Cloudflare R2 (likely yes around here as egress starts to matter).
- Whether the markdown import lives inline in the editor (paste anywhere, parse) or in a dedicated import dialog.

**Done when**: A teacher who's never seen the system before can sign up, build a useful activity in 15 minutes, and use it with students that week.

---

## Phase 2.5 — Parameterized problems

A teacher can write one template and have it become many problems. Two sub-features that share most of their machinery and ship in order.

**User-visible (2.5a — authoring-time variants)**: Teacher writes a template like `"simplify {rand(2,9)}x² − {rand(1,15)}"` and clicks "generate 12 variants" in the editor. The editor expands the template into 12 normal problem blocks with specific values, and saves them as static content. The student sees a fixed worksheet; the randomization happened in the teacher's editor. Closes the gap that previously required external tools (or AI assistance from a chat) to produce variant practice sets.

**User-visible (2.5b — runtime parameterization)**: Teacher writes the same kind of template but marks it as "regenerate per student." Each student loading the activity sees different numbers in the same problem. Submissions record both the answer and which variant the student saw, so the teacher viewer can show "this student saw `(2x+3)/(x−1)` and answered correctly" while aggregating across all variants for class-level stats.

**Architectural delta**: A new optional block type — `parameterized_problem` — joining the discriminated union (additive change, no migration of existing data). A small template language and parser (lives in a new `@activity/templates` package). For 2.5a the parser runs in the editor and produces normal problem blocks. For 2.5b the parser runs at student-page-load time in the runtime JS, with answer key computation following the same parameter substitution. The submissions `responses` shape grows an optional `variant` field via `schemaVersion: 2`, with migrate-on-read keeping old submissions readable.

The renderer's runtime evaluator (which currently just compares against a static list of acceptable answers via `data-blank-answers`) needs to support strategy dispatch — `'list' | 'expression' | 'computed'` — so parameterized problems can plug in their own answer-evaluation logic. **This is the one cheap pre-emptive change worth making before Phase 1 frontend work begins** (see STATE.md): structuring the runtime as `evaluateAnswer(blank, typed)` with strategy dispatch, defaulting to 'list' to preserve current behavior. Adding new strategies later then becomes one switch case rather than a runtime refactor.

**Decisions deferred to the start of this phase**:
- **Template syntax**. Options: a custom mini-language (`{rand(2,9)}`), a more familiar one (Mustache/Handlebars-style), or a structured object form (`{ "type": "rand", "min": 2, "max": 9 }`). The custom mini-language reads best to teachers; the structured form is easier to validate and edit visually. Probably end up with both — internal storage is structured JSON, the editor offers a mini-language input as a power-user shortcut.
- **Answer evaluator scope**. How smart does it need to be? Pure equality is too strict (`2x+3` vs `3+2x` should both count). Symbolic equivalence (CAS-style) is hard. A reasonable middle ground is normalize-and-compare with a small simplifier: collect like terms, sort by exponent, normalize signs. Use an existing JS math library (math.js handles enough) rather than rolling our own.
- **How aggregation handles variants**. Per-template stats clearly. Per-variant ("students who got the `(2x+3)` version") probably worth surfacing too. UI design problem more than backend problem.
- **AI-assisted generation as a future Phase 5+ layer**: same template language, but the editor offers a "describe what you want and let the AI fill in templates" button. Defer entirely; just make sure the template format isn't tied to a specific generation method.

**Done when**: A teacher can write a single rational-expression simplification template and have either 12 static variants saved as a worksheet, or have every student see different numbers, with scoring working correctly in both cases.

---
## Phase 2.7 — Interactive graphing

Graph blocks that students manipulate — plot a point, drag a line into 
position, shade a region — with tolerance-based scoring against teacher-
authored answer keys. The Algebra II feature most likely to replace what 
teachers currently leave the platform to use Desmos for.

**User-visible**: Teacher inserts a graph block, chooses an interaction 
type, drags handles to set the correct answer, sets tolerance bounds. 
Student sees a coordinate plane with draggable handles, manipulates them 
to answer, gets per-section checkpoint feedback like fill-in-blank already 
provides. Full keyboard and screen-reader support for students who need it.

**Architectural delta**: New `interactive_graph` block type with a 
discriminated union over interaction types (point, line, region, 
eventually parabola and transformations). Lazy-loaded JSXGraph widget — 
the main runtime stays under 20KB; pages with graph blocks dynamic-import 
a separate `graph-widget.js` bundle. New scoring strategies join the 
`evaluateAnswer` dispatch (`'graph-point'`, `'graph-line'`, `'graph-region'`). 
`SubmissionResponses` bumps to v3 with a parallel `graphResponses` map 
(distinct from blanks because the answer shape is structured, not string). 
Server-side grading (Phase 5) becomes more urgent here than for fill-in-
blank — the structured answer key in published HTML is more leakable.

Design captured in `docs/design/interactive-graph-block.md`.

**Decisions deferred to the start of this phase**:
- Final library choice (JSXGraph leading, Mafs and GeoGebra also evaluated).
- Equation parsing library — reuse whatever Phase 2.5 chose.
- Whether `correctEquation` authoring uses plain string input or MathLive WYSIWYG.
- Print behavior for interactive graphs (probably static axes + empty answer space).

**Done when**: A teacher can author a "plot the line y = 2x + 3" problem, 
a student can solve it on a Chromebook (with or without a mouse, with or 
without a screen reader), and the teacher dashboard shows the student's 
plotted slope and intercept alongside whether it was within tolerance.

## Phase 3 — Classroom integration

The biggest external integration. Until now, students are anonymous-with-typed-name. Phase 3 makes them roster members with stable opaque tokens, grades flow back to Classroom, and "assign" becomes a real verb.

**User-visible**: A teacher clicks "Assign in Classroom" inside the activity. They pick a course and section. The activity is posted to that Classroom course as an assignment. Students click through, identify themselves automatically (via Classroom's session), submit. The teacher sees per-student submissions in the dashboard *and* the grade flows back to Classroom's gradebook. Names are canonical (no more "Bob S" vs "Bobby Smith" duplicates).

**Architectural delta**: Google Classroom OAuth scopes added to the existing Google sign-in. Roster fetch on assignment creation, populating `assignment_students` with one opaque token per student. Token-based submission path replaces the typed-name path for assigned activities (link-share continues to work for non-assigned use). Grade passback Edge Function (or scheduled job) that takes scored submissions and writes Classroom CourseworkSubmission grades.

**Decisions deferred to the start of this phase**:
- Should we also support Canvas/Schoology? Default answer: no, keep narrow until there's specific demand.
- How to handle students who join the class after assignment creation? (Re-fetch on submission attempt, probably.)
- What happens when a teacher edits and republishes an activity that's already assigned — do existing students' assignments update, or stay pinned to the version they were assigned?

**Done when**: A teacher can assign an activity in Classroom, students take it without typing names, and grades land in the Classroom gradebook with no manual export/import.

---

## Phase 4 — Multi-tenancy

Districts and schools become first-class concepts. Until now, every teacher is a sole proprietor of their own activities. Phase 4 introduces shared workspaces and the governance that comes with them.

**User-visible**: A district admin invites teachers into a district workspace. Teachers can publish activities to "personal" or "district" scope. District-scoped activities are visible to other teachers in the same district (with read-only or co-edit permissions, depending on share settings). Co-teaching: two teachers can collaborate on a single activity. District admins see usage data without seeing student PII.

**Architectural delta**: New `organizations` and `user_organizations` tables. New `activity_collaborators` table (we sketched this in conversation — it's a join table with a role per collaborator). Nullable `organization_id` columns added to `activities` and `assignments`. The `can_read_activity`, `can_edit_activity`, and `can_access_assignment` helper functions extend to recognize org membership and collaborator roles — this is exactly what those helpers were designed for. The user role enum gains `district_admin`. The visibility enum gains `'organization'` to sit alongside `'private'` and `'public'`.

**Decisions deferred to the start of this phase** (the meaty ones):
- **Governance: who owns what when a teacher leaves a district?** Three reasonable models, pick one before designing org features:
  1. Teacher always owns; district has shared access while they work there.
  2. District owns content created within district scope; teacher loses access on leaving.
  3. Hybrid: personal scope is teacher-owned, district scope is district-owned.
- District admin capabilities: just billing/membership, or also content moderation, also analytics access?
- How invoicing works at the district level (probably moves to Phase 5 alongside marketplace billing).

**Done when**: Two districts are using the system independently with their own teacher rosters, and the data isolation between them is bulletproof (cross-district reads are impossible at the RLS level).
**
-**Activity-level (and eventually district-level) glossary**. ActivityMeta.glossary becomes a map of stable keys to {term, definition}. The Phase 2 definition mark gains a glossaryKey field that resolves against this map at render time, so a teacher who defines "factor" once in the glossary has every marked instance share the same definition (and editing the glossary updates them all). Editor adds a glossary-management panel; marketplace authors (Phase 5) can ship activities with curated glossaries. The mark schema is forward-compatible from Phase 2 — glossaryKey is an additive optional field, no migration.



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

**Privacy.** Student PII minimization is a foundational commitment. The schema is designed so that the only student-identifying data stored is what's strictly required to attribute submissions to a person — no contact info, no demographics, no location. Opaque tokens (Phase 3) replace typed names with non-personally-identifying identifiers. The `assignment_students` table is privacy-critical and access is gated through the assigning teacher only — never through activity authorship, even after marketplace activities exist. Audit log entries use `ip_hash`, never raw IPs.

**Accessibility.** Currently the weakest area. WCAG 2.1 AA is the right target for educational software. Issues to address by Phase 2 minimum: keyboard navigation in the block editor, screen reader support for math (KaTeX has reasonable defaults but custom blocks need explicit ARIA), color contrast in callout variants, focus management in the slash menu.

**Performance.** Students often access activities on school-issued Chromebooks with slow Wi-Fi. Static published HTML is the right answer here — no React bundle, no auth round-trip, no SSR latency. Don't regress this. When we move from Supabase Storage to Cloudflare R2 (probably Phase 2 or 3), choose R2 specifically for the zero-egress cost and global edge distribution. Total weight per published activity should stay under 100KB excluding images.

**Internationalization.** Currently English-only. Spanish becomes plausibly relevant if Dallas ISD's bilingual programs adopt the system, or if Phase 4 brings in districts with Spanish curriculum. Plan: use a translation layer (`react-i18next` or similar) for UI strings, but keep activity *content* in whatever language the teacher writes it. Don't try to auto-translate worksheets.

**Versioning discipline.** Both `ActivityDocument` and `SubmissionResponses` have `schemaVersion` fields and are designed for migrate-on-read. When you change a shape, bump the version, write a migration function in the schema package, and never mutate existing stored data. This discipline pays off enormously over years.

**Math rendering inside dynamic UI — a known gotcha class.** KaTeX itself is synchronous, which avoids the worst of the async-rendering bugs that plagued the previous MathJax-based system. But math rendered inside Tiptap NodeViews introduces a new version of the same problem: NodeViews mount, unmount, and re-render aggressively as the user edits, and a NodeView that calls `katex.render()` in a `useEffect` can race with its own teardown. Symptoms to watch for during editor work: math briefly appearing as raw LaTeX before rendering, math disappearing on edits adjacent to it, ghost-state from previous renders leaking into new content. The mitigation is straightforward (render in a layout effect, render synchronously into a stable child node, clean up on unmount), but the *category of bug* is worth recognizing on sight rather than re-debugging from scratch. A previous chat exists with extensive debugging of the analogous MathJax timing issue ([the Activity creation and publishing issues chat](https://claude.ai/chat/556a78e3-31fd-4c78-b1cc-9d72dcdf8d4f)) — the specific solution doesn't transfer to KaTeX, but it documents the failure modes in detail.

**Data retention and deletion.** Soft-delete with 30-day purge cron is in place at the SQL level (`purge_soft_deleted` function). Phase 2 needs a "delete my account" UX that triggers the soft delete. Phase 4 needs district-level retention policies (e.g., "keep submission data for the school year, then purge"). GDPR-style data export is a Phase 5 nice-to-have if any EU schools adopt.

**Security ceiling on answer keys.** Phase 1–4 has answer keys baked into the published HTML. A motivated student can view source. This is acceptable for low-stakes practice; it's NOT acceptable for graded summative assessments or marketplace items where author IP is at stake. Phase 5's server-side grading addresses this. Until then, the system is appropriate for formative assessment, not summative — make this explicit in marketing/onboarding.

---

## What this product is NOT

A useful set of constraints. Whenever a feature feels appealing, check it against this list:

- **Not a Learning Management System.** No course shells, no message boards, no calendars. Plays nicely with Google Classroom (Phase 3+); doesn't try to replace it.
- **Not a general document editor.** The block model is opinionated for math worksheets. Trying to be Notion-for-everyone breaks the focus.
- **Not a student-facing app.** Students never log in. Students never have accounts. Students never have profiles. Submissions are attributed but the system doesn't store relationships between students or their work over time.
- **Not a grading tool for high-stakes assessment.** See "security ceiling" above. Formative practice, exit tickets, homework — yes. Final exams — no, until Phase 5+ if ever.
- **Not a quiz platform.** Quizzes have time limits, randomization, anti-cheat. Worksheets don't. Stay in the worksheet lane.

---

## What ROADMAP.md is and isn't

- **Is**: A long-term plan, the framing for "is this Phase 2 work or Phase 4 work?", a record of decisions made and decisions deferred to a later phase.
- **Is not**: A backlog (use GitHub Issues). A specification (use design docs per feature). A todo list (that's STATE.md's "nearest next steps"). A timeline (phases ship when they ship).

When this file conflicts with STATE.md, STATE.md wins (it describes reality). When this file conflicts with code, code wins (it describes what's shipped). When code, STATE, and ROADMAP all agree, you're doing things right.

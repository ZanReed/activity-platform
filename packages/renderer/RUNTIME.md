# RUNTIME.md

Architecture decisions and standing constraints for the published-activity runtime — the JavaScript that runs in students' browsers on every published activity page. Companion to the project-level STATE.md (where everything is) and ROADMAP.md (where everything is going).

Update at the end of each work session that touches the runtime — replace the relevant sections, don't append.

**Current vs. target.** Most of this document is a *design spec* for the runtime built across Stages 11–14. The runtime that actually ships today is minimal — see **Current state** below. To keep the two separate:

- The **data-attribute contract** section tags each group `[emitted today]` (in current renderer output) or `[target — Stage N]` (planned).
- The **architecture, state-shape, build-pipeline, error-handling, and testing** sections describe the Stage 11–14 *target* unless a paragraph says otherwise. Don't read them as descriptions of current code.
- **Current state** is the authoritative description of what runs in students' browsers right now.

*Last reconciled against code in the cross-package doc/code audit (see STATE.md footer).*

## What this is

The runtime is the JavaScript that runs in students' browsers on every published activity page. Its eventual remit:

- Student input state (what they've typed into blanks, selected, ordered, recorded, etc.)
- Per-section checkpoint scoring against answer keys baked into the HTML
- Feedback rendering (✓/✗, hints, mistake-specific feedback, solutions after checking)
- Revision mode enforcement (free / locked)
- Attempt tracking across resubmissions
- Final submission to the `ingest-submission` Edge Function
- Graceful degradation when anything goes wrong

The list above is the runtime's eventual remit; the current build is narrower — see **Current state**.

It does NOT handle:

- Authoring (that's the editor in `@activity/app`)
- Server-side validation (that's the Edge Function)
- Cross-activity state (each page load is isolated)
- Real-time collaboration (not in scope for any phase currently planned)
- Anti-cheating beyond what's possible in client code (Phase 5 server-side grading is the answer)

## Current state (what ships today)

The runtime is a minimal script — same behaviours as pre-Stage-11, but Stage 11 restructured how it's built. The source is six TypeScript modules under `packages/renderer/src/runtime/`:

- `index.ts` — entry point: parses the activity-config blob, restores the stored name, wires blanks, wires the submit button, runs on DOM-ready.
- `dom.ts` — `$` / `$$` query helpers.
- `storage.ts` — student-name persistence (try/catch-wrapped `localStorage`).
- `strategies.ts` — `evaluateAnswer` dispatch + the `list` strategy.
- `blanks.ts` — `trimValue`, `checkBlank` (blur-driven correct/incorrect toggle), `wireBlanks`.
- `submission.ts` — `gatherResponses`, `computeScore`, `submit`, `setStatus`, `setScore`.

The renderer's `document.ts` still inlines the runtime via a `<script>` tag in every published page — there is no separate `runtime.js` file shipped, and that's a deliberate Stage 11 decision (one fewer request on a Chromebook on slow Wi-Fi; the runtime stays co-versioned with the HTML it ships in). The path from source to inline script runs through an esbuild sub-step in `scripts/bundle-renderer.mjs` that produces a generated TypeScript string module at `runtime/generated/runtime-bundle.ts`, which `document.ts` imports. See the **Build pipeline** section for details. Source maps are emitted to `packages/renderer/dist/runtime.js.map` as a dev-only debugging artifact — gitignored, never uploaded; debugging a teacher-reported runtime bug means reproducing against the local unminified build.

The runtime has its own `tsconfig.json` (DOM lib, `noEmit`) excluded from the renderer's no-DOM tsconfig; the renderer package's `build` and `typecheck` scripts run both `tsc` invocations in sequence so the runtime cannot silently rot. Test seed at `packages/renderer/src/runtime/__tests__/strategies.test.ts` covers `evaluateAnswer` dispatch + fallback and the `computeScore` arithmetic; JSDOM-backed tests for `wireBlanks`, `gatherResponses`, and `submit` are Stages 12–14 work.

What it does:

- Reads `<script id="activity-config" type="application/json">` for `{ activityId, versionNum, submissionEndpoint }`.
- Restores the student's name from `localStorage` (carried across activities on the same domain).
- Wires every `.blank` input: on blur, trims the value and toggles `correct` / `incorrect` classes, scored through `evaluateAnswer(input, typed)` — a strategy dispatch reading `data-blank-strategy`, with only the `list` strategy implemented (pipe-split `data-blank-answers`, case-sensitive exact match).
- On submit: validates a non-empty name, gathers every blank into `{ answer, correct }`, computes a fraction score, and POSTs `{ activityId, displayName, responses: { schemaVersion: 2, blanks }, score }` to the submission endpoint. Persists the validated name to `localStorage` so the next activity prefills it. Disables the submit button during the request; re-enables on failure. (The pre-Stage-11 runtime sent `schemaVersion: 1` and was rejected by `ingest-submission` with a 400; Stage 11 fixed this while rewriting the file.)

What it does NOT do (all of this is Stages 12–14 target): per-section checkpoint scoring, submission/revision modes, feedback rendering (hints / mistakeFeedback / solutions), confidence ratings, attempt tracking, the `localStorage` retry queue, the state-object/`render()` architecture, and the init-pass refs maps.

Everything below this section is the target design unless tagged otherwise.

## Architecture decisions

Except where a paragraph notes otherwise, the decisions below describe the **target** runtime (Stages 11–14). They are the committed design; see **Current state** for what is actually built.

**Inline runtime, not a separate `runtime.js` file [resolved Stage 11].** The runtime is bundled by esbuild into a generated string module that `document.ts` inlines via a `<script>` tag in every published page. There is no separate `runtime.js` served from Storage. Rationale: one fewer request on a school Chromebook on slow Wi-Fi; the runtime stays co-versioned with the HTML it ships in; the Phase 1 runtime is small enough (~2.6 KiB minified — well under the 20 KiB budget) that a separately-cacheable file doesn't yet pay for the extra round trip. The separate-file model's real payoff is the Phase 3+ CDN-hosted shared runtime, where many activities can share one cached file across publishes — at that point the question is revisited (the trigger, per STATE.md's open questions, is roughly 50+ active activities, when republishing every activity for a runtime bug fix becomes painful). Until then, inline is correct.

**`runtimeVersion` — Phase 3+ migration anchor [target].** Not emitted today (the runtime is inlined, so there is nothing to version-select, and there is no `#activity-root` element to carry it). When the CDN-hosted shared runtime lands, a runtime version selector is needed so the loader picks the right file; it lives wherever the loader can read it earliest — likely a `data-*` attribute on a container. Decide its exact home then.

**[target — Stages 12–14] Plain state object + render() with DOM diffing guards.** Single source of truth is a plain JS object. User actions mutate state, then call `render()`. `render()` is the only function that touches the DOM. Every DOM mutation is guarded: only write if the value actually changed (`if (el.textContent !== value) el.textContent = value`). Prevents layout thrashing and makes render() idempotent — safe to call multiple times with no side effects. (The current minimal runtime does not have this — it mutates the DOM directly in event handlers.)

**Data-attribute contract is a public API.** The HTML emitted by the renderer is the interface. Once activities are published, that contract is frozen for those activities forever. Additive changes (new attributes) are safe. Removing or renaming existing attributes breaks published activities. Treat with the same versioning discipline as a REST API. The per-element attributes (`data-block-*`, `data-blank-*`, `data-section-id`) are emitted and read today; see the contract section for what is `[emitted today]` vs `[target]`.

**[target — Stages 12–13] Pure scoring, init pass builds maps.** On init, the runtime walks the DOM once and builds in-memory `Map`s for each interactive element category (blanks by id, fill-in-blank blocks by id, sections by id, and — when new block categories land in Phase 2+ — choices, orderings, matches, graphs, etc.). Every scoring/feedback function operates on these maps, not by querying the DOM. Scoring functions are pure functions of the maps + input values — testable without a DOM. The DOM gets touched only in init (read) and render (write).

**Source maps — dev-only, gitignored, never shipped [resolved Stage 11].** esbuild emits an external source map to `packages/renderer/dist/runtime.js.map` alongside the minified bundle. The file is gitignored, never included in any deployed bundle, and never reaches a student's browser. The dev-only choice flows from the inline decision above: there is no hosted `runtime.js` to pair a source map with, and a sourcemap for a script living inside a `<script>` tag in HTML isn't something the browser knows how to fetch. Debugging a teacher-reported runtime bug means reproducing locally against the unminified build, where the modular source under `src/runtime/` provides better debugging surface than a sourcemap-back-to-a-bundled-string would. Phase 3+ revisits this if the CDN-hosted shared runtime materializes — then a source map ships alongside the CDN file.

**Defensive attribute reads everywhere.** Every `dataset.X` read uses a `?? default` fallback. Every JSON-encoded attribute is wrapped in try/catch. An old published activity loading against a newer runtime degrades gracefully to default behavior. The runtime never throws to the student.

**Error boundaries on init and event handlers.** Init wrapped in try/catch with fallback to "basic submit only" mode (every blank read, no checkpoint behavior, no feedback). Every event handler wrapped in try/catch. A scoring bug for one section's check button does not break submission of the whole activity. (The current runtime has the basic pieces — config-parse try/catch, fetch-error handling — but not the full init-fallback mode; see Error handling philosophy.)

**Block category awareness.** The renderer emits `data-block-category="content|question|scaffold"` on every block (this is emitted today). The runtime uses this to drive init-pass partitioning: only `question`-category blocks register response handlers and contribute to scoring; `content` blocks are inert presentational; `scaffold` blocks (worked examples, hints, learning objectives) are presentational but may have their own progressive-disclosure UI later. Adding a new block kind doesn't require sniffing `data-block-type` — its category tells the runtime how to treat it. Categories are deliberately coarse; finer-grained discrimination still uses `data-block-type` and the registry pattern below. (The category-driven init partitioning is target — Stages 12–14.)

## The data-attribute contract

This is the API between renderer (emits) and runtime (reads). Additive changes only — once an activity is published, the attributes in its HTML are frozen for it forever. Document every attribute here; if it's not in this section, it doesn't exist.

**Status tags.** The runtime is built in Stages 11–14, *after* the renderer, so parts of this contract are still a target the renderer has not met. Attribute groups below carry a status tag:

- **[emitted today]** — current renderer output; relied on by shipping code and tests. Safe to build against.
- **[target — Stage N]** / **[target — Phase N]** — the shape the renderer must emit when that stage or phase lands. Not in current HTML; the exact shape may still shift until then. Do not assume it is present.

"If it's not in this section it doesn't exist" still holds — but "in this section" now distinguishes *emitted* from *targeted*.

### Document root

The renderer's `document.ts` wraps the body in a full HTML document. Runtime parameters reach the runtime two ways, following the **split-by-purpose** rule (see STATE.md's architecture decisions): config the JS consumes goes in a JSON blob; values the CSS must select on go in `data-*` attributes on a container.

**[emitted today]** The renderer emits a `<main class="activity-container">` wrapper and a JSON config blob:

```
<main class="activity-container">
  ...
</main>
<script id="activity-config" type="application/json">
  {"activityId":"<uuid>","versionNum":<int>,"submissionEndpoint":"<url>"}
</script>
```

The runtime parses `#activity-config` once on startup. The renderer escapes any literal `</script` in the JSON. There is **no `#activity-root` element** and **no document-root `data-*` attributes**. An earlier draft of this contract specified `<div id="activity-root" data-submission-mode=… data-grading-mode=… data-schema-version=…>`; that design was never built and has been superseded by the split below. Ignore any reference to `#activity-root` anywhere.

**[target — Stages 12–14]** When the real runtime needs activity-level semantics, they are placed by purpose:

- **CSS hooks → `data-*` on `activity-container`.** `data-activity-type` (`worksheet | exit_ticket | warm_up | review`) so the renderer's CSS can vary layout (e.g. `[data-activity-type="exit_ticket"] …`). `data-submission-mode` is a *candidate* — needed only if checkpoint-UI visibility is CSS-driven; if instead the renderer simply omits checkpoint markup in `single` mode, it is not needed. Settle that when checkpoint rendering is built (Stages 12–13).
- **JS-only config → the `activity-config` blob.** `revisionMode`, `gradingMode`, and the submission `schemaVersion` constant join `activityId` / `versionNum` / `submissionEndpoint` in the blob when the Stage 12–14 runtime needs them. The runtime reads `activityType` (and `submissionMode`, if present) from the container attribute — no duplication into the blob.

**[target — Phase 3+]** `runtimeVersion` is the migration anchor for the CDN-hosted shared runtime. Not emitted today. When the CDN move happens it lives wherever the loader reads it earliest — likely a `data-*` attribute. Decide then.

The deciding rule throughout: **CSS cannot read the JSON blob**, so anything CSS must branch on is forced to be an attribute; everything else defaults to the blob.

### Section

```
<!-- [emitted today] -->
<section class="activity-section"
         data-block-category="content"
         data-section-id="<uuid>">
  <!-- optional <h2 class="section-title">, then blocks -->
</section>
```

`<section>` is content (organizational), not a question — `data-block-category` is always `content`. Sections carry no `data-block-type`: they are containers, not blocks (see "Block identity attributes" below).

**[target — Stage 12–13]** When `submissionMode` is `locked` or `free`, the `<section>` additionally carries `data-is-checkpoint="true | false"`; in `single` mode the attribute is omitted entirely. Not emitted today — `render.ts` emits no checkpoint metadata yet.

### Reference panel (Phase 2)

**[target — Phase 2] — not emitted today.** The schema field exists (`ActivityDocument.referencePanel`, added Stage 9e); the renderer layout and editor authoring UX are Phase 2 work.

```
<aside class="reference-panel"
       data-reference-panel
       data-block-category="scaffold">
  <header class="reference-panel-title"><!-- optional title --></header>
  <div class="reference-panel-content">
    <!-- block-rendered content from ActivityDocument.referencePanel.blocks -->
  </div>
</aside>
```

The reference panel is a sticky sidebar (collapsible on mobile) holding student-facing reference content (formula charts, periodic tables, vocabulary lists, conversion tables, maps). The renderer emits it only when `ActivityDocument.referencePanel` is present. Content blocks inside use the same block schema as the activity body — no new block types needed. `data-block-category="scaffold"` signals to the runtime that nothing inside contributes to scoring or checkpoint behavior. Phase 1 Stage 9e adds the schema field as forward-compatibility; renderer layout and editor authoring UX are Phase 2.

Optional collapse/expand for mobile uses native `<details>` / `<summary>` elements where possible, keeping the basic UI script-free. Any runtime behavior beyond that (remembering open/closed state across sections, smart scroll positioning) is a Phase 2 implementation decision.

### Block identity attributes (every block)

```
<!-- [emitted today] — every top-level block -->
<… data-block-category="content | question | scaffold"
    data-block-type="<schema discriminant>"
    data-block-id="<uuid>" …>

<!-- [emitted today] — sections: containers, not blocks -->
<section data-block-category="content" data-section-id="<uuid>" …>
```

Every top-level block emitted by the renderer carries `data-block-category`, `data-block-type`, and `data-block-id`. (Confirmed against the renderer's `blocks/fill-in-blank.ts` and `blocks/problem.ts`.)

- `data-block-type` is the Zod schema discriminant **verbatim** — snake_case (`paragraph`, `heading`, `math_block`, `image`, `callout`, `problem`, `fill_in_blank`, `bullet_list`, `ordered_list`). It is deliberately *not* the kebab-case used in CSS class names (`math_block` renders with class `block-math`): the class is a styling namespace, `data-block-type` is an identity namespace. The Stage 11 init registry keys on this value (`registerBlockKind('fill_in_blank', …)`), so it must equal the schema literal exactly — there is no kebab↔snake mapping layer anywhere.
- `data-block-id` is the block's stable document `id` (uuid).
- `data-block-category` is the coarse discriminator; `data-block-type` is the fine one. Category exists so analytics and dashboard features can reason about block kinds without enumerating every block-type string.

`<section>` and `<li>` are **not** blocks: `<section>` is a container carrying `data-block-category` + `data-section-id` only; list items carry neither category nor block-type. The init registry never registers them as block kinds.

Phase 1 block types by category:

- `content` — `paragraph`, `heading`, `image`, `callout`, `math_block`, `bullet_list`, `ordered_list` (plus `divider`, `table` in Phase 2)
- `question` — `problem`, `fill_in_blank` (plus `multiple_choice`, `matching`, `ordering` in Phase 2; `short_answer`, `essay` in Phase 2.6; `interactive_graph` in Phase 2.7; `audio_response`, `video_response`, `file_upload` in Phase 2.8; `annotate_text`, `annotate_image` in Phase 2.9)
- `scaffold` — (Phase 2+) `worked_example`, `faded_worked_example`, `learning_objective`, `self_explanation`

### Checkpoint button

**[target — Stage 12–13] — not emitted today.** `render.ts` renders sections with content only; no checkpoint button is produced yet. This is the shape the renderer must emit when checkpoint scoring lands (rendered per section, only when that section is a checkpoint):

```
<button class="js-checkpoint-btn" data-for-section="<uuid>" type="button">
  Check this section
</button>
<div class="js-section-score" data-for-section="<uuid>" hidden>
  <!-- populated by runtime: "4 / 6 correct" -->
</div>
```

`type="button"` is non-negotiable — without it, browsers default to `type="submit"`, which submits the parent form if one exists and the runtime never gets the click.

### Fill-in-blank

A fill-in-blank renders as **two nested levels**: the block `<div>`, carrying block-level metadata, and one or more blank-token `<input>` elements inside its body. Block-level fields (`solution`, `hasConfidenceRating`, `skills`) belong on the block; per-blank fields (`answer`, `hint`, `mistakeFeedback`) belong on each token.

#### Fill-in-blank block

```
<!-- [emitted today] -->
<div class="block block-fill-in-blank"
     data-block-category="question"
     data-block-type="fill_in_blank"
     data-block-id="<uuid>">
  <div class="block-problem-number">3.</div>
  <div class="block-problem-body">
    <!-- inline content: text, inline math, and blank-token <input>s -->
  </div>
</div>
```

(Confirmed against `renderer/src/blocks/fill-in-blank.ts`.)

**[target — Stage 12–13]** The block `<div>` additionally carries `data-solution="..."` and `data-has-confidence-rating="true | false"`. When `data-has-confidence-rating="true"`, **one** confidence fieldset is rendered **per block — not per blank** (`hasConfidenceRating` is a `FillInBlankBlock` field; the runtime applies the single rating uniformly to every blank in the block):

```
<fieldset class="js-confidence-rating" data-for-block="<uuid>">
  <legend>How confident are you?</legend>
  <label><input type="radio" name="conf-<uuid>" value="unsure" />   Unsure</label>
  <label><input type="radio" name="conf-<uuid>" value="think_so" /> Think so</label>
  <label><input type="radio" name="conf-<uuid>" value="certain" />  Certain</label>
</fieldset>
```

**[target — Phase 2]** The block `<div>` also carries `data-skills='[...]'` (JSON array) once the editor surfaces problem-level skill tagging. The field is `skills`, not `standards` — an earlier draft named this `data-standards`, which is dead.

#### Blank token

```
<!-- [emitted today] one <input> per blank, sitting directly in block-problem-body -->
<input type="text"
       class="blank"
       data-blank-id="<uuid>"
       data-blank-answers="x+2|x + 2"
       aria-label="Blank 1 of 3"
       style="--blank-width:6ch"
       autocomplete="off"
       autocapitalize="off"
       autocorrect="off"
       spellcheck="false" />
```

- `data-blank-answers` is **pipe-delimited** (`answer|alt1|alt2`), *not* JSON. The first segment is the canonical `answer`; the rest are `acceptableAnswers`. The runtime splits on `|`. (A literal `|` in a math answer would be unusual; switch to JSON if that ever changes.)
- `--blank-width` (CSS custom property, `ch` units) sizes the input; defaults to `6`.
- The `autocomplete` / `autocapitalize` / `autocorrect` / `spellcheck` quartet disables browser interference with math input.
- There is **no wrapper element today** — the bare `<input class="blank">` is the whole token.

The current runtime confirms it reads `class="blank"`, `data-blank-id`, `data-blank-answers` (pipe-delimited), and `data-blank-strategy`. The `aria-label` / `--blank-width` / autocomplete attributes are emitted by `inline.ts`'s `renderBlank`, verified against that file — the whole `<input>` shape above is confirmed `[emitted today]`.

**[target — Stage 12–13]** The blank token additionally carries `data-hint="..."` and `data-mistake-feedback='[{"match":"2x","feedback":"..."}]'` (a JSON array), and gains a sibling feedback slot:

```
<span class="js-blank-feedback" data-for-blank="<uuid>" aria-live="polite" hidden></span>
```

Because an `<input>` is a void element, the feedback `<span>` cannot be its child — it must be a sibling, which means the blank token will need a wrapper element. The wrapper's tag and class, and whether the `blank` class moves onto it, are **not decided** — settle that when the Stage 12–13 feedback work begins (tracked in Open questions below).

**[target — Phase 2.5]** `data-blank-strategy="list | expression | computed"` selects the scoring strategy; when absent the runtime defaults to `"list"`. The current runtime already implements this dispatch (`evaluateAnswer`), with only the `list` strategy defined. `expression` / `computed` arrive with parameterized problems.

**JSON-encoded attributes** (`data-mistake-feedback`, `data-skills`) are HTML-entity-escaped by the renderer; the runtime parses each once at init and stores the result, never re-parsing on user input. `data-blank-answers` is the pipe-delimited exception above.

**`aria-live`** on the future `js-blank-feedback` span MUST be set in the source HTML by the renderer, not added later by the runtime — setting `aria-live` on an already-existing element is unreliable across screen readers.

**Accessibility — positional label.** Each blank `<input>` carries a renderer-supplied `aria-label`. With multiple blanks in the block it is positional — `Blank 1 of 3`, `Blank 2 of 3`, … — numbered in document order; a lone blank is labelled `Fill in the blank`. Without it, a blank inside prose is announced by screen readers only as "edit text", giving the student no cue which blank has focus.

### Reading discipline

Two sources, two patterns. Activity-level config is parsed once from the `#activity-config` blob; per-element data is read off `data-*` attributes during the init pass.

```typescript
// CORRECT — parse the config blob once, on init, inside try/catch.
let config = { activityId: '', versionNum: 0, submissionEndpoint: '' };
try {
  const el = document.getElementById('activity-config');
  config = JSON.parse(el?.textContent ?? '{}');
} catch {
  console.error('Invalid activity config');  // degrade; never throw to the student
}

// CORRECT — a CSS-hook attribute on the container, defensive read with default.
const activityType =
  (document.querySelector('.activity-container') as HTMLElement | null)
    ?.dataset.activityType ?? 'worksheet';

// CORRECT — data-blank-answers is pipe-delimited, not JSON. Split on `|`;
// an absent attribute yields a safe empty list.
const answers: string[] =
  (blank.dataset.blankAnswers ?? '').split('|').filter(Boolean);

// CORRECT — JSON-encoded per-element attributes (e.g. data-mistake-feedback)
// are parsed inside try/catch with a default.
let mistakeFeedback: Array<{ match: string; feedback: string }> = [];
try {
  mistakeFeedback = JSON.parse(blank.dataset.mistakeFeedback ?? '[]');
} catch {
  console.warn(`Malformed mistake-feedback for blank ${blank.dataset.blankId}`);
}

// WRONG — assumes attributes exist / are valid
const mf = JSON.parse(blank.dataset.mistakeFeedback);  // throws on malformed
```

## State shape

**[target — Stages 12–14].** None of this exists in the current runtime (see Current state) — the minimal runtime mutates the DOM directly. This is the committed design for when checkpoint / feedback / submission logic is built.

The runtime maintains a single state object. Mutated by user actions. Synchronized to the DOM by `render()`.

```typescript
interface RuntimeState {
  // From the activity-config blob, immutable after init
  activityId: string;
  versionNum: number;
  submissionMode: 'single' | 'locked' | 'free';
  revisionMode: 'free' | 'locked';
  activityType: 'worksheet' | 'exit_ticket' | 'warm_up' | 'review';
  gradingMode: 'auto' | 'manual' | 'mixed';

  // Mutable
  submitted: boolean;
  attemptNumber: number;     // increments on resubmit
  sections: Record<string, SectionState>;  // keyed by section.id
  studentName: string;       // bound to the name input
}

interface SectionState {
  isCheckpoint: boolean;
  checked: boolean;
  locked: boolean;           // true after check if submissionMode === 'locked'
  score: number;
  total: number;
  checkedAt: string | null;  // ISO timestamp
}
```

In-memory reference maps built once on init (not part of state, never mutated):

```typescript
// Per-blank — mirrors the BlankToken schema. One per <input class="blank">.
interface BlankRef {
  input: HTMLInputElement;
  feedbackEl: HTMLElement;   // sibling feedback slot — see the "Blank-token
                             // wrapper element" open question for placement
  answers: string[];         // canonical answer + acceptableAnswers
  strategy: 'list' | 'expression' | 'computed';
  hint: string | null;
  mistakeFeedback: Array<{ match: string; feedback: string }>;
  blockId: string;           // parent fill_in_blank block
  sectionId: string;         // section the parent block belongs to
}

// Per fill_in_blank BLOCK. solution / hasConfidenceRating / skills are
// FillInBlankBlock fields (NOT BlankToken fields), and the confidence
// fieldset is one-per-block — so they belong here, not on each BlankRef.
interface FillInBlankRef {
  el: HTMLElement;
  blankIds: string[];
  solution: string | null;
  hasConfidenceRating: boolean;
  confidenceFieldset: HTMLFieldSetElement | null;
  skills: string[];
  sectionId: string;
}

interface SectionRef {
  el: HTMLElement;
  isCheckpoint: boolean;
  blankIds: string[];
  checkButton: HTMLButtonElement | null;
  scoreEl: HTMLElement | null;
}

const blanks       = new Map<string, BlankRef>();
const fillInBlanks = new Map<string, FillInBlankRef>();
const sections     = new Map<string, SectionRef>();
```

State changes; refs don't. Treat refs as `Readonly<>` after init.

Earlier drafts of this section put block-level fields (`solution`, `hasConfidenceRating`, `skills`) and the per-block confidence fieldset on `BlankRef`, and used the field name `standards` — all incorrect against the schema (it is `skills`, not `standards`; and those fields live on `FillInBlankBlock`, not `BlankToken`). The per-block / per-blank split above is the corrected shape; the precise ref model is finalised when the Stage 12–13 init pass is actually built.

In Phase 2 and beyond, additional refs maps will be added for each new question category (`choices`, `orderings`, `matches`, `graphs`, `freeResponses`, `files`, `annotations`). The init registry pattern keeps this additive — adding a new question-block kind registers a handler in the init registry, allocates a refs map, and contributes scoring strategies to the `evaluateAnswer` dispatch. No refactoring of init for each new kind.

## Build pipeline

A single script — `scripts/bundle-renderer.mjs` — produces both build artifacts in order, because the renderer bundle depends on the runtime build. Run it with `pnpm run bundle:renderer`.

**Step 1 — Runtime build.** esbuild bundles `packages/renderer/src/runtime/index.ts` into a minified IIFE held in memory, then writes that text into a generated TypeScript module that the renderer imports.

- **Entry:** `packages/renderer/src/runtime/index.ts`
- **Format:** `iife` (not ESM — the output is inlined into a plain `<script>` tag by `document.ts`; an ESM bundle cannot be inlined that way)
- **Platform / target:** `browser`, `chrome90` (covers school-issued Chromebooks per the ChromeOS support window, plus Firefox 88+ / Safari 14+ / Edge 90+)
- **Bundle:** `true`, no externals (everything bundles in — the runtime has no JS dependencies by design)
- **Minify:** `true`, always (not dev/prod conditional — the size budget applies in both)
- **`write: false`:** the bundled JS stays in memory as a string. esbuild still returns it in `outputFiles`, and step 1b folds it into the generated TS module. The runtime is never written to disk as a `.js` file.
- **Source map:** `external`, written to `packages/renderer/dist/runtime.js.map` as a dev-only debugging artifact (gitignored, never shipped — see the inline / source-maps decisions in **Architecture decisions** for rationale).

**Step 1b — Generated string module.** The in-memory runtime text is serialized into `packages/renderer/src/runtime/generated/runtime-bundle.ts`, a one-export TS module:

```ts
export const runtimeJs = "…minified IIFE…";
```

`document.ts` imports `runtimeJs` and inlines it into a `<script>` tag in every published page. The serialization is `JSON.stringify` (which handles backslashes, quotes, and newlines correctly), with one extra pass: any `</script` substring is rewritten to `<\/script` as defense-in-depth against the eventual HTML embedding. Minified JS realistically never contains that sequence, but `document.ts` applies the same guard to its config blob and the runtime string matches that discipline. The generated module is committed to git so a clean checkout can typecheck the renderer without first running the bundler (same convention as `supabase/functions/_shared/renderer.bundle.js`).

**Size budget enforcement.** The script enforces the runtime size constraint from the bottom of this file directly: soft target 20 KiB (build prints a warning), hard ceiling 40 KiB (build throws and aborts). Phase 1 runtime sits around 2.6 KiB minified, well under both. The ceiling exists so a careless dependency or feature creep cannot silently bloat the student-facing bundle.

**Step 2 — Renderer bundle (pre-existing, unchanged).** esbuild bundles `packages/renderer/src/index.ts` into `supabase/functions/_shared/renderer.bundle.js` — the file the Edge Functions import. This step is the original renderer build; step 1 was added in front of it without changing it. Different settings than step 1 because the consumer is different:

- `format: 'esm'`, `platform: 'neutral'`, `target: 'es2022'` — the consumer is Deno Edge Functions, not a browser
- `minify: false` — stack-trace readability in Edge Function logs matters more than bundle size for this consumer
- `sourcemap: 'inline'`
- No externals; KaTeX bundles in along with schema and renderer code

`document.ts` lives inside this bundle and imports the generated module written in step 1b — which is the entire reason these two builds live in one script and must run in this order. Running the renderer build against a stale or missing generated module is the failure mode this ordering prevents.

**`publish-activity` is untouched.** Because the runtime is inlined by `document.ts`, the Edge Function uploads only the rendered HTML per publish — no separate `runtime.js`, no source map, no extra Storage objects. The Edge Function code is unchanged from pre-Stage-11.

**Re-run after** any change to `packages/schema`, `packages/renderer`, or the runtime source. The renderer bundle commits with the source it supports (STATE.md's standing constraints). CI should run `pnpm run bundle:renderer` on push so deploys never use a stale bundle — still a housekeeping todo as of Stage 11.

**Lazy widgets (Phase 2.7, Phase 2.9).** Phase 2.7's interactive graph widget and Phase 2.9's annotation widget are lazy-loaded by the main runtime via dynamic import on pages that need them. Unlike the main runtime they cannot be inlined — they ship as separate files under the published activity's Storage path, fetched on demand. The main runtime stays small; pages without those block types pay nothing for them. The script grows when these land — the runtime build above becomes the first of N widget builds, each independently size-budgeted, each producing its own generated string module or (for the lazy widgets) a real `.js` file uploaded by `publish-activity`.

## Error handling philosophy

*Current state:* the runtime already does config-parse try/catch, submit-button disable on click, and fetch-error handling. The init-fallback ("basic submit only") mode and the `localStorage` retry queue described below are **[target — Stage 14]**.

**Init can fail.** Malformed HTML, missing critical attributes, JSON parse errors — all possible if a renderer bug ships. If init throws, catch the error, log it to console with context, and fall back to "basic submit only" mode: every blank's input is read on final submit, no checkpoint behavior, no feedback rendering. Students never see a broken page.

**Event handlers can fail.** A scoring bug for one section's check button must not break the rest of the activity. Wrap every handler in try/catch. On error, log to console and leave the UI in its last known good state.

**Network failures on submission:** queue the submission payload in `localStorage` keyed by `activity_id + attempt_number`, retry with exponential backoff (1s, 4s, 16s). If all retries fail, surface a clear message: "your answers are saved locally; we'll try to submit them when you have a connection." Never lose student work to a network blip.

**Form double-submit protection.** On submit click, immediately disable the submit button. Don't re-enable until either success or final failure. Without this, a slow network invites duplicate clicks and duplicate submissions. (The current runtime does this.)

## Testing strategy

**[target — Stages 11–14].** No runtime tests exist yet; `packages/renderer/src/runtime/__tests__/` is not yet created. The suite must exist BEFORE the dashboard is built — student-side trust depends on runtime correctness.

**Pure functions:** Vitest, no DOM needed. Scoring, normalization, state mutators, the migrate-on-read for old submission shapes — all testable as plain functions of inputs to outputs.

**DOM integration:** JSDOM. Feed `init()` a known HTML string, simulate user events (click checkpoint button, type into blank, click submit) via JSDOM's event API, assert the state shape AND the rendered DOM state. The render() diffing guards make this assertion straightforward — if a value didn't change, the DOM didn't change.

**Test coverage targets:** all scoring strategy variants, all three submission modes (single / locked / free), revision attempt increment, network failure retry path, malformed-attribute graceful degradation, error-boundary fallback to basic submit mode.

Tests live at `packages/renderer/src/runtime/__tests__/`.

## Standing constraints

- **Runtime does not import from `@activity/schema`.** No Zod, no bundler-resolved dependencies. The runtime defines its own minimal TypeScript interfaces that mirror the data-attribute contract. This is a deliberate duplication for a deliberate reason — keeping the runtime tiny.

- **Performance budget:** runtime bundled + minified ≤ 20KB target, ≤ 40KB hard ceiling. School Chromebooks on slow Wi-Fi load activities in browser-bound conditions; every kilobyte costs paint time.

- **Browser support:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+. Covers all school-issued Chromebooks per Google's ChromeOS support window.

- **`render()` is the only DOM mutator** (target — Stages 12–14). Every other function reads from state, never writes to DOM. Every DOM mutation in render() is guarded by a change check.

- **All attribute reads have a fallback.** No `dataset.X` access without `?? default`. No `JSON.parse(...)` without try/catch.

- **No JS dependencies.** Runtime is hand-written vanilla TypeScript bundled to a single file. Adding utility libraries (lodash, date-fns, etc.) would blow the size budget and add attack surface for no benefit. Inline the small helpers you need.

- **Heavy widgets are lazy-loaded into separate bundles.** Interactive graphs (Phase 2.7) and annotation widgets (Phase 2.9) are dynamic imports from the main runtime. Pages without those block types never pay for them. Each lazy widget follows the same architectural commitments as the main runtime (source maps, defensive reads, graceful degradation).

- **Naming convention discipline:**
  - TypeScript fields: `camelCase` (`attemptNumber`, `revisionMode`)
  - HTML data attributes: `kebab-case` (`data-attempt-number`, `data-revision-mode`)
  - The renderer is the only layer that maps between them.

- **Block category as the coarse type discriminator.** The init pass routes by `data-block-category` first, then by `data-block-type`. New block kinds register through a small init-registry pattern (`registerBlockKind('multiple_choice', { init, score, render })`) so that adding a kind is one entry, not a refactor.

## Open questions / deferred decisions


- **CDN-hosted shared runtime (Phase 3+):** when this moves from versioned-per-publish to CDN-hosted, a `runtimeVersion` selector picks which CDN runtime file to load. Migration is additive. Decide CDN provider when the move is made (Cloudflare or Supabase Storage with long cache TTL are both reasonable).

- **Service worker for offline mode:** Phase 1 has (target) localStorage retry. Full offline (compose answers without connectivity, sync later) is a Phase 3+ consideration. A service worker could intercept submission failures more elegantly than localStorage retry, but adds complexity and an install step.

- **MathLive in published HTML:** Phase 2.5 decision per ROADMAP. If MathLive is included for student-side math input, the runtime bundle size budget must be re-evaluated.

- **Server-side scoring (Phase 5):** when this lands, the runtime's scoring functions remain in place for instant feedback, but final submission stops trusting them. The Edge Function re-scores against the answer keys server-side. The data-attribute contract for answers (`data-blank-answers`) likely changes — answers may not be in the published HTML at all. Plan a v2 of the runtime then; don't try to support both models in v1.

- **Media capture browser quirks (Phase 2.8):** MediaRecorder API has had iOS Safari quirks historically. Decide at phase start whether to launch with both in-browser recording and upload, or upload-only with recording as a follow-up. The runtime side either way is a media-capture widget that emits a Blob + metadata for the submission payload.

- **Annotation coordinate stability (Phase 2.9):** when the runtime captures annotation positions, what coordinate system does it use? Character indices into rendered text vs DOM anchors vs normalized fractions of rendered geometry. Decide at phase start.

- **Audio narration of activity prose (Phase 4 UDL):** browser Web Speech API vs server-rendered audio files. The runtime side is a play-button + word-level highlight handler either way; the question is where the audio comes from.

- **Blank-token wrapper element (Stage 12–13):** the feedback `<span>` for a blank cannot be a child of the `<input>` (a void element), so it must be a sibling — which means the blank token needs a wrapper. The renderer emits a bare `<input class="blank">` with no wrapper today. Decide the wrapper's tag and class, and whether the `blank` class moves onto it, when the feedback-rendering work starts. Until then the only frozen part of the blank-token contract is the bare `<input>`.

## Things NOT to do

- **Don't reintroduce `#activity-root`.** The document-root config mechanism is the `<script id="activity-config" type="application/json">` blob plus, where CSS needs them, `data-*` attributes on `activity-container` — see the Document root section. An earlier `#activity-root`-with-all-data-attributes design was superseded; don't resurrect it.

- **Don't query the DOM inside scoring or state functions.** Read once on init; mutate state; let render() handle DOM updates. The bug class this prevents — "feedback works the first time but not on the second check" — is caused by stale DOM state querying.

- **Don't import from `@activity/schema`.** Parallel types in the runtime are deliberate. If the schema changes, update both sides; if you find yourself wishing for `import { ActivityDocument }` in the runtime, that's a signal to add a runtime-local interface instead.

- **Don't add JS dependencies.** The runtime is single-file vanilla TypeScript by design. Every added dependency expands the size budget and adds attack surface for student-facing code.

- **Don't trust client-supplied attempt_number.** The Edge Function derives `attempt_number` server-side from `max(attempt_number) + 1` for the student's identity. The runtime sends a local guess for optimistic UI, but the server's value is canonical.

- **Don't reveal solutions before checking.** The runtime reads `data-solution` into memory but does NOT render it into the DOM until the student has checked that section (or submitted, in `single` mode). The solution being in HTML source is the existing security ceiling; don't make it worse by rendering it where students see it without working through the problem.

- **Don't make breaking changes to the data-attribute contract.** Add new attributes; never rename or remove existing ones. A renamed attribute breaks every activity published before the rename, forever, because that HTML is static and immutable in Storage.

- **Don't bake the answer key into the DOM for manually-graded blocks.** Phase 2.6's short_answer and essay blocks have no auto-scoring; the data-attribute payload should not pretend they do. The block category (`question`) and block type drive runtime behavior; the runtime's scoring path skips manual-graded blocks entirely.

- **Don't conflate runtime state with submission payload.** State has many fields (refs to DOM nodes, transient UI state). Submission payload has only what the Edge Function needs (blanks, attemptNumber, checkpointResults, studentName, confidence per blank, and the future parallel maps for new question categories). Build the payload from state at submit time; don't try to make state and payload the same shape.

- **Don't sniff `data-block-type` when `data-block-category` is enough.** Category-level decisions (is this block interactive? does it contribute to scoring? does it have a checkpoint contribution?) should branch on category. Block-type sniffing is for type-specific behavior only.

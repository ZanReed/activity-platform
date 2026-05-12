# RUNTIME.md

Architecture decisions and standing constraints for the published-activity runtime — the JavaScript that runs in students' browsers on every published activity page. Companion to the project-level STATE.md (where everything is) and ROADMAP.md (where everything is going). This file describes how the runtime works and why.

Update at the end of each work session that touches the runtime — replace the relevant sections, don't append.

## What this is

The runtime is the JavaScript bundle (`runtime.js`) embedded by reference in every published activity. It handles:

- Student input state (what they've typed into blanks)
- Per-section checkpoint scoring against answer keys baked into the HTML
- Feedback rendering (✓/✗, hints, mistake-specific feedback, solutions after checking)
- Revision mode enforcement (free / locked)
- Attempt tracking across resubmissions
- Final submission to the `ingest-submission` Edge Function
- Graceful degradation when anything goes wrong

It does NOT handle:

- Authoring (that's the editor in `@activity/app`)
- Server-side validation (that's the Edge Function)
- Cross-activity state (each page load is isolated)
- Real-time collaboration (not in scope for any phase currently planned)
- Anti-cheating beyond what's possible in client code (Phase 5 server-side grading is the answer)

## Architecture decisions

**Separate file, versioned-per-publish.** The runtime lives at `packages/renderer/src/runtime/` as TypeScript source. `bundle-renderer.mjs` builds it as `runtime.js` (plus `runtime.js.map`). `publish-activity` uploads both alongside `index.html` to the versioned Storage path. HTML references it as `<script type="module" src="./runtime.js">`. Each published version has its own copy of the runtime; bug fixes to the runtime require republishing affected activities (acceptable in Phase 1, addressed by Phase 3+ CDN-hosted shared runtime).

**`data-runtime-version="1"` on the activity root from day one.** Migration anchor for the Phase 3+ move to CDN-hosted shared runtime. When that move happens, the version attribute selects which runtime file to load. No schema changes required.

**Plain state object + render() with DOM diffing guards.** Single source of truth is a plain JS object. User actions mutate state, then call `render()`. `render()` is the only function that touches the DOM. Every DOM mutation is guarded: only write if the value actually changed (`if (el.textContent !== value) el.textContent = value`). Prevents layout thrashing and makes render() idempotent — safe to call multiple times with no side effects.

**Data-attribute contract is a public API.** The HTML emitted by the renderer is the interface. Once activities are published, that contract is frozen for those activities forever. Additive changes (new attributes) are safe. Removing or renaming existing attributes breaks published activities. Treat with the same versioning discipline as a REST API.

**Pure scoring, init pass builds maps.** On init, the runtime walks the DOM once and builds two in-memory `Map`s (blanks by id, sections by id). Every scoring/feedback function operates on these maps, not by querying the DOM. Scoring functions are pure functions of the maps + input values — testable without a DOM. The DOM gets touched only in init (read) and render (write).

**Source maps emitted, always.** `runtime.js.map` is built alongside `runtime.js` and uploaded with it. Modern browsers only fetch the source map when DevTools is open, so zero performance cost for students. Without it, teacher-reported bugs in minified runtime are not debuggable.

**Defensive attribute reads everywhere.** Every `dataset.X` read uses a `?? default` fallback. Every JSON-encoded attribute is wrapped in try/catch. An old published activity loading against a newer runtime degrades gracefully to default behavior. The runtime never throws to the student.

**Error boundaries on init and event handlers.** Init wrapped in try/catch with fallback to "basic submit only" mode (every blank read, no checkpoint behavior, no feedback). Every event handler wrapped in try/catch. A scoring bug for one section's check button does not break submission of the whole activity.

## The data-attribute contract

This is the API between renderer (emits) and runtime (reads). FROZEN for already-published activities. Additive changes only. Document every attribute here; if it's not in this section, it doesn't exist.

### Document root

```
<div id="activity-root"
  data-activity-id="<uuid>"
  data-runtime-version="1"
  data-submission-mode="single | locked | free"
  data-revision-mode="free | locked"
  data-activity-type="worksheet | exit_ticket | warm_up | review"
  data-schema-version="1">
```

`data-submission-mode` is the master switch for checkpoint behavior. `single` means no checkpoints render at all; `locked` and `free` enable checkpoint UI per section. `data-revision-mode` controls post-submission behavior — `free` allows resubmit, `locked` does not.

### Section

```
<section
  data-section-id="<uuid>"
  data-is-checkpoint="true | false">
  <!-- blocks -->
</section>
```

`data-is-checkpoint="true"` is rendered only when the activity's submissionMode is `locked` or `free`. In `single` mode the attribute is omitted (sections still exist for layout but have no checkpoint button).

### Checkpoint button (only when section is a checkpoint)

```
<button class="js-checkpoint-btn" data-for-section="<uuid>" type="button">
  Check this section
</button>
<div class="js-section-score" data-for-section="<uuid>" hidden>
  <!-- populated by runtime: "4 / 6 correct" -->
</div>
```

`type="button"` is non-negotiable — without it, browsers default to `type="submit"` which submits the parent form if one exists. The runtime then doesn't get to handle the click.

### Fill-in-blank

```
<span class="blank-wrapper"
  data-blank-id="<uuid>"
  data-blank-strategy="list"
  data-blank-answers='["x+2","x + 2"]'
  data-hint="..."
  data-mistake-feedback='[{"match":"2x","feedback":"..."}]'
  data-solution="..."
  data-has-confidence-rating="true | false"
  data-standards='["A.7C"]'>

  <input class="js-blank-input"
    type="text"
    autocomplete="off"
    inputmode="text"
    aria-label="Answer for ..." />

  <span class="js-blank-feedback"
    data-for-blank="<uuid>"
    aria-live="polite"
    hidden></span>

  <!-- if data-has-confidence-rating="true": -->
  <fieldset class="js-confidence-rating" data-for-blank="<uuid>">
    <legend>How confident are you?</legend>
    <label><input type="radio" name="conf-<uuid>" value="unsure" /> Unsure</label>
    <label><input type="radio" name="conf-<uuid>" value="think_so" /> Think so</label>
    <label><input type="radio" name="conf-<uuid>" value="certain" /> Certain</label>
  </fieldset>
</span>
```

JSON-encoded attributes (`data-blank-answers`, `data-mistake-feedback`, `data-standards`) are HTML-entity-escaped by the renderer. The runtime parses them once during init and stores the result in the blank's map entry; never re-parses on user input.

`aria-live="polite"` MUST be set in the HTML, not added dynamically by the runtime. Setting `aria-live` on an element that already exists is unreliable across screen readers; setting it in the source HTML works consistently.

### Reading discipline

```typescript
// CORRECT — defensive read with default
const revisionMode = (root.dataset.revisionMode ?? 'free') as RevisionMode;

// CORRECT — JSON parse wrapped in try/catch with default
let answers: string[] = [];
try {
  answers = JSON.parse(blank.dataset.blankAnswers ?? '[]');
} catch {
  // malformed JSON — log and continue with empty answer list
  console.warn(`Malformed blank-answers for blank ${blank.dataset.blankId}`);
}

// WRONG — assumes attribute exists, throws on undefined
const revisionMode = root.dataset.revisionMode;  // could be undefined
const answers = JSON.parse(blank.dataset.blankAnswers);  // throws on malformed
```

## State shape

The runtime maintains a single state object. Mutated by user actions. Synchronized to the DOM by `render()`.

```typescript
interface RuntimeState {
  // From HTML root, immutable after init
  activityId: string;
  runtimeVersion: number;
  submissionMode: 'single' | 'locked' | 'free';
  revisionMode: 'free' | 'locked';
  activityType: 'worksheet' | 'exit_ticket' | 'warm_up' | 'review';

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
interface BlankRef {
  wrapper: HTMLElement;
  input: HTMLInputElement;
  feedbackEl: HTMLElement;
  confidenceFieldset: HTMLFieldSetElement | null;
  answers: string[];
  strategy: 'list' | 'expression' | 'computed';
  hint: string | null;
  mistakeFeedback: Array<{ match: string; feedback: string }>;
  solution: string | null;
  hasConfidenceRating: boolean;
  standards: string[];
  sectionId: string;  // which section this blank belongs to
}

interface SectionRef {
  el: HTMLElement;
  isCheckpoint: boolean;
  blankIds: string[];
  checkButton: HTMLButtonElement | null;
  scoreEl: HTMLElement | null;
}

const blanks = new Map<string, BlankRef>();
const sections = new Map<string, SectionRef>();
```

State changes; refs don't. Treat refs as `Readonly<>` after init.

## Build pipeline

`scripts/bundle-renderer.mjs` (or a new sibling `scripts/bundle-runtime.mjs` if it grows too complex):

- **Entry:** `packages/renderer/src/runtime/index.ts`
- **Output:** `packages/renderer/dist/runtime.js` + `packages/renderer/dist/runtime.js.map`
- **Format:** `esm`
- **Bundle:** `true` (single file, no remote imports)
- **Target:** `chrome90` (covers school Chromebooks on supported ChromeOS versions; also Firefox 88+, Safari 14+, Edge 90+)
- **Minify:** `true` in production, `false` in dev
- **Source maps:** `external`, always emitted
- **External:** nothing (no externals; everything bundles in)

The `publish-activity` Edge Function reads both `index.html` (built per-activity from the document) and `runtime.js` + `runtime.js.map` (built once, shared across all activities published from this renderer bundle version) and uploads all three to the versioned Storage path.

## Error handling philosophy

**Init can fail.** Malformed HTML, missing critical attributes, JSON parse errors — all possible if a renderer bug ships. If init throws, catch the error, log it to console with context, and fall back to "basic submit only" mode: every blank's input is read on final submit, no checkpoint behavior, no feedback rendering. Students never see a broken page.

**Event handlers can fail.** A scoring bug for one section's check button must not break the rest of the activity. Wrap every handler in try/catch. On error, log to console and leave the UI in its last known good state.

**Network failures on submission:** queue the submission payload in `localStorage` keyed by `activity_id + attempt_number`, retry with exponential backoff (1s, 4s, 16s). If all retries fail, surface a clear message: "your answers are saved locally; we'll try to submit them when you have a connection." Never lose student work to a network blip.

**Form double-submit protection.** On submit click, immediately disable the submit button. Don't re-enable until either success or final failure. Without this, a slow network invites duplicate clicks and duplicate submissions.

## Testing strategy

**Pure functions:** Vitest, no DOM needed. Scoring, normalization, state mutators, the migrate-on-read for old submission shapes — all testable as plain functions of inputs to outputs.

**DOM integration:** JSDOM. Feed `init()` a known HTML string, simulate user events (click checkpoint button, type into blank, click submit) via JSDOM's event API, assert the state shape AND the rendered DOM state. The render() diffing guards make this assertion straightforward — if a value didn't change, the DOM didn't change.

**Test coverage targets:** all scoring strategy variants, all three submission modes (single / locked / free), revision attempt increment, network failure retry path, malformed-attribute graceful degradation, error-boundary fallback to basic submit mode.

Tests live at `packages/renderer/src/runtime/__tests__/`. The suite must exist BEFORE the dashboard is built — student-side trust depends on runtime correctness.

## Standing constraints

- **Runtime does not import from `@activity/schema`.** No Zod, no bundler-resolved dependencies. The runtime defines its own minimal TypeScript interfaces that mirror the data-attribute contract. This is a deliberate duplication for a deliberate reason — keeping the runtime tiny.

- **Performance budget:** runtime.js bundled + minified ≤ 20KB target, ≤ 40KB hard ceiling. School Chromebooks on slow Wi-Fi load activities in browser-bound conditions; every kilobyte costs paint time.

- **Browser support:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+. Covers all school-issued Chromebooks per Google's ChromeOS support window.

- **`render()` is the only DOM mutator.** Every other function reads from state, never writes to DOM. Every DOM mutation in render() is guarded by a change check.

- **All attribute reads have a fallback.** No `dataset.X` access without `?? default`. No `JSON.parse(...)` without try/catch.

- **No JS dependencies.** Runtime is hand-written vanilla TypeScript bundled to a single file. Adding utility libraries (lodash, date-fns, etc.) would blow the size budget and add attack surface for no benefit. Inline the small helpers you need.

- **Naming convention discipline:**
  - TypeScript fields: `camelCase` (`attemptNumber`, `revisionMode`)
  - HTML data attributes: `kebab-case` (`data-attempt-number`, `data-revision-mode`)
  - The renderer is the only layer that maps between them.

## Open questions / deferred decisions

- **CDN-hosted shared runtime (Phase 3+):** when this moves from versioned-per-publish to CDN-hosted, `data-runtime-version` selects which CDN runtime file to load. Migration is additive: old activities continue to reference `./runtime.js` and break-fix at republish; new activities reference the CDN URL. Decide CDN provider when the move is made (Cloudflare or Supabase Storage with long cache TTL are both reasonable).

- **Service worker for offline mode:** Phase 1 has localStorage retry. Full offline (compose answers without connectivity, sync later) is a Phase 3+ consideration. A service worker could intercept submission failures more elegantly than localStorage retry, but adds complexity and an install step.

- **MathLive in published HTML:** Phase 2.5 decision per ROADMAP. If MathLive is included for student-side math input, the runtime bundle size budget must be re-evaluated.

- **Server-side scoring (Phase 5):** when this lands, the runtime's scoring functions remain in place for instant feedback, but final submission stops trusting them. The Edge Function re-scores against the answer keys server-side. The data-attribute contract for answers (`data-blank-answers`) likely changes — answers may not be in the published HTML at all. Plan a v2 of the runtime then; don't try to support both models in v1.

## Things NOT to do

- **Don't query the DOM inside scoring or state functions.** Read once on init; mutate state; let render() handle DOM updates. The bug class this prevents — "feedback works the first time but not on the second check" — is caused by stale DOM state querying.

- **Don't import from `@activity/schema`.** Parallel types in the runtime are deliberate. If the schema changes, update both sides; if you find yourself wishing for `import { ActivityDocument }` in the runtime, that's a signal to add a runtime-local interface instead.

- **Don't add JS dependencies.** The runtime is single-file vanilla TypeScript by design. Every added dependency expands the size budget and adds attack surface for student-facing code.

- **Don't trust client-supplied attempt_number.** The Edge Function derives `attempt_number` server-side from `max(attempt_number) + 1` for the student's identity. The runtime sends a local guess for optimistic UI, but the server's value is canonical.

- **Don't reveal solutions before checking.** The runtime reads `data-solution` into memory but does NOT render it into the DOM until the student has checked that section (or submitted, in `single` mode). The solution being in HTML source is the existing security ceiling; don't make it worse by rendering it where students see it without working through the problem.

- **Don't make breaking changes to the data-attribute contract.** Add new attributes; never rename or remove existing ones. A renamed attribute breaks every activity published before the rename, forever, because that HTML is static and immutable in Storage.

- **Don't render feedback inside a NodeView that re-renders aggressively.** This is mostly an editor concern but worth noting here: the published HTML is static, so this rule doesn't apply to runtime rendering — the runtime is the master of the DOM after init and the DOM doesn't get torn down behind it.

- **Don't conflate runtime state with submission payload.** State has many fields (refs to DOM nodes, transient UI state). Submission payload has only what the Edge Function needs (blanks, attemptNumber, checkpointResults, studentName, confidence per blank). Build the payload from state at submit time; don't try to make state and payload the same shape.

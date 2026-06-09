// =============================================================================
// styles.ts — Activity stylesheet
// -----------------------------------------------------------------------------
// Block styles shared between the published HTML (renderer) and the editor
// (NodeViews). Inlined into the published page in a <style> tag so the
// activity is self-contained — no flash of unstyled content while CSS loads
// over the network.
//
// Class names match what the renderer emits (block-problem, block-callout,
// .activity-container, .identity-prompt, .submit-area, etc.). When the
// editor's NodeViews are written, they apply these same classes so the editor
// canvas and the published page look identical.
//
// KaTeX styles are NOT here — they're loaded from a CDN <link> in
// document.ts. KaTeX's CSS is large and well-cached at the CDN.
//
// The @media print block at the bottom is the Stage 11 BASELINE print layer
// (STATE.md standing constraints): hide interactive controls, page-break
// integrity, grayscale safety. The richer print FEATURE — multi-column,
// teacher-configured work space, answer-key variant — is a post-Stage-16
// effort (print-and-printables.md).
//
// Note: CSS comments below use single quotes (e.g. 'hidden') where you
// might expect backticks — backtick escapes inside this template literal
// are fragile across copy-paste, and single quotes carry the same meaning
// without the escape risk.
// =============================================================================

export const blockStyles = `
:root {
  --color-text: #1a1a1a;
  --color-muted: #6b6b6b;
  --color-bg: #ffffff;
  --color-border: #e5e5e5;
  --color-accent: #2563eb;
  --color-info: #0369a1;
  --color-info-bg: #e0f2fe;
  --color-warning: #b45309;
  --color-warning-bg: #fef3c7;
  --color-success: #15803d;
  --color-success-bg: #dcfce7;
  --color-note: #6b7280;
  --color-note-bg: #f3f4f6;
  --color-blank-correct-bg: #dcfce7;
  --color-blank-correct-border: #22c55e;
  --color-blank-incorrect-bg: #fee2e2;
  --color-blank-incorrect-border: #ef4444;
  --font-body: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-math: "Latin Modern Math", "Cambria Math", serif;
  --max-width: 760px;
}

* { box-sizing: border-box; }

body {
  font-family: var(--font-body);
  color: var(--color-text);
  background: var(--color-bg);
  line-height: 1.6;
  margin: 0;
  padding: 1rem;
}

.activity-container {
  max-width: var(--max-width);
  margin: 0 auto;
}

.activity-header {
  border-bottom: 2px solid var(--color-border);
  padding-bottom: 1rem;
  margin-bottom: 2rem;
}

.activity-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
}

.activity-header .meta {
  color: var(--color-muted);
  font-size: 0.875rem;
}

.identity-prompt {
  background: var(--color-info-bg);
  border: 1px solid var(--color-info);
  border-radius: 6px;
  padding: 0.75rem 1rem;
  margin: 1rem 0 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.identity-prompt label {
  font-weight: 600;
  color: var(--color-info);
}

.identity-prompt input {
  flex: 1 1 200px;
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 1rem;
}

.activity-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.25rem;
  margin: 1.5rem 0 1rem;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.block { margin: 1rem 0; }

.block-paragraph { margin: 0.75rem 0; }

.block-heading-1 { font-size: 1.5rem;  margin: 1.5rem 0 0.75rem; }
.block-heading-2 { font-size: 1.25rem; margin: 1.25rem 0 0.5rem; }
.block-heading-3 { font-size: 1.1rem;  margin: 1rem 0 0.5rem; font-weight: 600; }

.block-math {
  margin: 1.25rem 0;
  text-align: center;
  overflow-x: auto;
}

.block-image {
  margin: 1.5rem 0;
  text-align: center;
}
.block-image img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}
.block-image-caption {
  color: var(--color-muted);
  font-size: 0.875rem;
  margin-top: 0.5rem;
  font-style: italic;
}

.block-callout {
  display: flex;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-radius: 6px;
  border-left: 4px solid;
  margin: 1.25rem 0;
}
.block-callout-icon { font-size: 1.25rem; line-height: 1; }
.block-callout-body > :first-child { margin-top: 0; }
.block-callout-body > :last-child { margin-bottom: 0; }

.block-callout-info    { background: var(--color-info-bg);    border-color: var(--color-info);    }
.block-callout-warning { background: var(--color-warning-bg); border-color: var(--color-warning); }
.block-callout-success { background: var(--color-success-bg); border-color: var(--color-success); }
.block-callout-note    { background: var(--color-note-bg);    border-color: var(--color-note);    }

.block-problem,
.block-fill-in-blank {
  display: grid;
  grid-template-columns: 2.5rem 1fr;
  gap: 0.5rem;
  margin: 1.25rem 0;
  align-items: start;
}
.block-bullet-list,
.block-ordered-list {
  padding-left: 1.5rem;
}
.block-bullet-list li,
.block-ordered-list li {
  margin: 0.25rem 0;
}
/* Nested lists sit tighter than the .block 1rem default. */
.block-bullet-list .block-bullet-list,
.block-bullet-list .block-ordered-list,
.block-ordered-list .block-bullet-list,
.block-ordered-list .block-ordered-list {
  margin: 0.25rem 0;
}
.block-problem-number {
  font-weight: 600;
  text-align: right;
  padding-right: 0.25rem;
}
.block-problem-body > :first-child { margin-top: 0; }
.block-problem-body > :last-child { margin-bottom: 0; }

/* The blank-token wrapper keeps an <input class="blank"> and its sibling
 a fford*ances (.js-blank-hint, .js-blank-mistake) on the same inline-flow
 line, so they can't wrap apart mid-prose. The wrapper is structural only —
 the 'blank' class stays on the <input> itself, so every existing .blank
 selector continues to target the input directly. align-items: baseline lines
 the input baseline up with the surrounding prose; the gap controls spacing
 between input and its buttons. (Hidden siblings have display: none via the
'hidden' attribute and don't participate in the gap.) */
.blank-wrapper {
  display: inline-flex;
  align-items: baseline;
  gap: 0.25rem;
}

.blank {
  display: inline-block;
  width: var(--blank-width, 6ch);
  padding: 0.15rem 0.4rem;
  border: 1px solid var(--color-border);
  border-bottom: 2px solid var(--color-text);
  border-radius: 3px;
  font-family: inherit;
  font-size: inherit;
  background: #fafafa;
  text-align: center;
}
.blank:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 1px;
  background: white;
}
.blank.correct {
  background: var(--color-blank-correct-bg);
  border-color: var(--color-blank-correct-border);
}
.blank.incorrect {
  background: var(--color-blank-incorrect-bg);
  border-color: var(--color-blank-incorrect-border);
}

/* Hint affordance. The .js-blank-hint button is always available next to
 t he bl*ank when the teacher authored a hint; clicking it opens the global
 hint modal (.js-hint-modal) where the runtime shows the hint text. The
 button is a small circular '?' icon — discoverable without dominating the
 line. */
.js-blank-hint {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background: white;
  color: var(--color-muted);
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
}
.js-blank-hint:hover {
  color: var(--color-text);
  border-color: var(--color-text);
}
.js-blank-hint:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 1px;
}

/* Mistake affordance. The red .js-blank-mistake '!' button mirrors the hint
 button's geometry but is emitted 'hidden' — the runtime reveals it only when
 a wrong answer matches an authored mistake-feedback entry, and clicking it
 opens the shared popover with that feedback. Red signals "something's off
 here" without being as heavy as inline error text. The explicit
 [hidden] { display: none } overrides the inline-flex display so the button
 truly disappears (and leaves no gap) until revealed. */
.js-blank-mistake {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  padding: 0;
  border: 1px solid var(--color-blank-incorrect-border);
  border-radius: 50%;
  background: white;
  color: var(--color-blank-incorrect-border);
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
}
.js-blank-mistake[hidden] {
  display: none;
}
.js-blank-mistake:hover {
  background: var(--color-blank-incorrect-border);
  color: white;
}
.js-blank-mistake:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 1px;
}

/* Shared floating popover (document.ts) for hints and mistake feedback. A
 single bare panel anchored beside the trigger button that opened it. Unlike
 the old modal it does NOT dim the page or trap the viewport: position:fixed
 with explicit left/top (set by the runtime) instead of a full-screen overlay,
 so the rest of the activity stays interactive while it's open. The runtime
 seeds left/top beside the trigger and updates them as the student drags the
 header. z-index sits above all activity content; the panel caps its width for
 readability and scrolls internally if the text is long. */
.js-popover {
  position: fixed;
  z-index: 1000;
  width: min(22rem, calc(100vw - 2rem));
  max-height: 60vh;
  overflow-y: auto;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
}
.js-popover[hidden] {
  display: none;
}
/* The header doubles as the drag handle. touch-action:none lets the runtime's
 pointer drag work on touch without the browser hijacking it for scrolling;
 user-select:none stops text selection while dragging. */
.js-popover-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.4rem 0.5rem 0.4rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
}
.js-popover-header:active {
  cursor: grabbing;
}
.js-popover-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text);
}
/* Mistake variant: tint the title red to match the '!' trigger. */
.js-popover[data-kind="mistake"] .js-popover-title {
  color: var(--color-blank-incorrect-border);
}
.js-popover-close {
  flex: none;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--color-muted);
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
}
.js-popover-close:hover {
  background: var(--color-note-bg);
  color: var(--color-text);
}
.js-popover-close:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 1px;
}
.js-popover-body {
  padding: 0.75rem;
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--color-text);
  white-space: pre-wrap;
}

/* Confidence rating fieldset (Stage 12 step 3). One per fill-in-blank
 b lock *when hasConfidenceRating is true. Sits inside the problem body
 so it aligns under the problem number with the rest of the body
 content. Default browser fieldset styling is heavy; we tone it down
 to a thin bordered container with a small muted legend. Radios use
 plain inline-block layout (vs inline-flex) — simpler whitespace
 handling between input and label text, predictable across browsers. */
.js-confidence-rating {
  margin: 0.75rem 0 0;
  padding: 0.4rem 0.75rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
}
.js-confidence-rating legend {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-muted);
  padding: 0 0.4rem;
}
.js-confidence-rating label {
  display: inline-block;
  margin-right: 1rem;
  font-size: 0.9rem;
  cursor: pointer;
}
.js-confidence-rating label:last-child {
  margin-right: 0;
}
.js-confidence-rating input[type="radio"] {
  margin-right: 0.25rem;
  cursor: pointer;
  vertical-align: middle;
}

/* Solution slot. Hidden in source HTML; the Stage 13 runtime toggles
 ' hidde*n' when the section is checked. Visual treatment: subtle
 left-accent + tinted background so a revealed solution reads clearly
 as the teacher's explanation rather than continuation of the
 problem prose. */
.js-solution {
  margin-top: 0.75rem;
  padding: 0.6rem 0.8rem;
  border-left: 3px solid var(--color-accent);
  background: var(--color-info-bg);
  border-radius: 0 4px 4px 0;
  font-size: 0.95rem;
}

/* Checkpoint controls (Stage 12 step 4). Per-section button + score
 d ispla*y in locked/free submissionMode. Button visual: secondary
 (accent border, white fill) so it doesn't compete with the final
 submit button at the bottom of the page; hover fills it for clear
 affordance. .js-section-score reveals on check with text like
 "4 / 6 correct" — subdued status text inline with the button. */
.js-checkpoint-btn {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1.25rem;
  background: white;
  color: var(--color-accent);
  border: 2px solid var(--color-accent);
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
}
.js-checkpoint-btn:hover:not(:disabled) {
  background: var(--color-accent);
  color: white;
}
.js-checkpoint-btn:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.js-checkpoint-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.js-section-score {
  display: inline-block;
  margin-left: 0.75rem;
  font-size: 0.95rem;
  color: var(--color-muted);
  font-weight: 600;
}

.math-error {
  font-family: monospace;
  font-size: 0.85em;
  background: #fff0f0;
  padding: 1px 4px;
  border-radius: 3px;
}

.submit-area {
  border-top: 2px solid var(--color-border);
  padding-top: 1.5rem;
  margin-top: 2.5rem;
  text-align: center;
}
.submit-button {
  background: var(--color-accent);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}
.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.submit-button:hover:not(:disabled) {
  background: #1d4ed8;
}
.submit-status {
  margin-top: 0.75rem;
  min-height: 1.5em;
  font-size: 0.95rem;
}
.submit-status.success { color: var(--color-success); }
.submit-status.error   { color: var(--color-warning); }

/* Print-only header (Name/Date/… fill-in lines). Hidden on screen — the live
 on-screen name field is .identity-prompt; this is the paper equivalent and is
 revealed (with its child styles) inside @media print below. */
.print-header { display: none; }

/* =============================================================================
 B aseline* print layer (Stage 11)
 -----------------------------------------------------------------------------
 Goal: a published activity that looks broken on paper today, doesn't.
 This is NOT the print FEATURE (multi-column layout, work space, configured
 header, answer key) — that lives post-Stage-16 (print-and-printables.md).
 Scope of this layer:
 - Maximize printable area: @page margin 0.5in (floor for safe edge across
 unknown classroom printers — most laser printers have ~0.25in hardware
 non-printable margin).
 - Hide interactive controls so students don't print a Submit button.
 - Page-break integrity: never split a problem; let sections flow.
 - Grayscale safety: don't encode meaning in color alone (callouts vary by
 border STYLE; blank correct/incorrect state is neutralized — pre-lesson
 printables are blank worksheets, no scored state to distinguish).
 - Print typography is deliberately unchanged: it's a configurable feature
 (--print-font-size) reserved for the post-Stage-16 print work.
 ============================================================================= */
@media print {
  /* @page (paper size + margin) is emitted PER-DOCUMENT by the renderer
   (printPageStyle in document.ts) — it is configurable (letter/A4 + margin)
   and @page rules can't reliably read CSS custom properties, so it can't be a
   static rule here. */

  body { padding: 0; }

  /* Configured print layout. The renderer sets these --print-* vars on
   .activity-container (printContainerVars); this is where they take effect.
   The var() fallbacks keep a config-less context sane (e.g. the editor
   preview, which renders the body without the container that carries the
   vars). max-width is dropped so single- and multi-column layouts fill the
   page box the @page margins define — the on-screen 760px cap is a
   reading-comfort device with no place on paper, and A4 / multi-column need
   the full width. */
  .activity-container {
    max-width: none;
    font-size: var(--print-font-size, 11pt);
    column-count: var(--print-columns, 1);
    column-gap: 2rem;
  }

  /* Print-only header: a wrapping row of labeled fill-in lines (Name, Date,
   …) across the top of the sheet, ruled off from the body below. */
  .print-header {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.4rem 1.5rem;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid black;
    font-size: 0.95em;
  }
  .print-field {
    display: inline-flex;
    align-items: baseline;
    gap: 0.4rem;
  }
  .print-field-label {
    font-weight: 600;
    white-space: nowrap;
  }
  .print-field-line {
    display: inline-block;
    min-width: 8ch;
    border-bottom: 1px solid black;
  }
  /* Name and free-form custom fields get a longer writing line; the score
   field needs only a short one. */
  .print-field-name .print-field-line,
  .print-field-custom .print-field-line {
    min-width: 14ch;
  }
  .print-field-score .print-field-line {
    min-width: 6ch;
  }

  /* Hide interactive elements. The js-* selectors are documented in
   R UNT*IME.md; some not all emitted yet, listed here so the baseline is
   correct the moment those land. Printable hints + solutions are a
   post-Stage-16 print-feature configuration (answer-key variant), not
   a baseline. */
  .identity-prompt,
  .submit-area,
  .js-checkpoint-btn,
  .js-section-score,
  .js-confidence-rating,
  .js-blank-hint,
  .js-blank-mistake,
  .js-popover,
  .js-solution {
    display: none;
  }

  /* Don't establish an inline-flex formatting context in print — let the
   i npu*t flow naturally as plain inline content. Equivalent in this single-
   visible-child case to inline-flex, but explicit avoids relying on print
   engines treating one-item flex identically to bare-inline. */
  .blank-wrapper {
    display: inline;
  }

  /* Page-break integrity. Modern break-* names; legacy page-break-* aliases
   omit*ted (RUNTIME.md support matrix is Chrome/Firefox/Safari/Edge).
   Problem spacing and per-problem work space are configured here:
   --print-problem-spacing sets the vertical gap between problems;
   --print-work-space pads blank working room below each problem (a
   fill-in-blank block may override it per-problem with its own inline
   --print-work-space). break-inside: avoid keeps a problem (and its work
   space) whole across page and column breaks. */
  .block-problem,
  .block-fill-in-blank {
    break-inside: avoid;
    margin-top: var(--print-problem-spacing, 1.25rem);
    margin-bottom: var(--print-problem-spacing, 1.25rem);
    padding-bottom: var(--print-work-space, 0);
  }
  .activity-section {
    break-before: auto; /* explicit: flow naturally, don't force a page */
  }
  .activity-header h1,
  .section-title,
  .block-heading-1,
  .block-heading-2,
  .block-heading-3 {
    break-after: avoid; /* don't strand a heading at a page bottom */
  }

  /* Blanks print as underlined fill-ins. Correct/incorrect state classes
   a re *neutralized — a printed worksheet is the BLANK version a teacher
   hands out before the lesson, so there is no scored state to convey. */
  .blank,
  .blank.correct,
  .blank.incorrect {
    background: transparent;
    border-top: none;
    border-left: none;
    border-right: none;
    border-bottom: 1px solid black;
  }

  /* Callouts: solid borders carry color on screen; in B&W the variants
   b eco*me indistinguishable. Encode the variant in border STYLE so an
   info callout looks different from a warning even in grayscale. The
   icons remain (they survive grayscale too — belt and suspenders). */
  .block-callout-info    { border-left-style: solid;  }
  .block-callout-warning { border-left-style: dashed; }
  .block-callout-success { border-left-style: double; }
  .block-callout-note    { border-left-style: dotted; }
}
`.trim();

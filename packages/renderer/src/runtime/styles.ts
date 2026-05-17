// =============================================================================
// styles.ts — Activity stylesheet
// -----------------------------------------------------------------------------
// Block styles shared between the published HTML (renderer) and the editor
// (NodeViews). Inlined into the published page in a <style> tag so the
// activity is self-contained — no flash of unstyled content while CSS loads
// over the network.
//
// Class names match what the renderer emits (block-problem, block-callout,
// etc.). When the editor's NodeViews are written, they apply these same
// classes so the editor canvas and the published page look identical.
//
// KaTeX styles are NOT here — they're loaded from a CDN <link> in
// document.ts. KaTeX's CSS is large and well-cached at the CDN.
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

.activity {
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

.name-prompt {
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

.name-prompt label {
  font-weight: 600;
  color: var(--color-info);
}

.name-prompt input {
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

.math-error {
  font-family: monospace;
  font-size: 0.85em;
  background: #fff0f0;
  padding: 1px 4px;
  border-radius: 3px;
}

.activity-footer {
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

@media print {
  body { padding: 0; }
  .name-prompt, .activity-footer { display: none; }
  .blank {
    background: transparent;
    border-bottom: 1px solid black;
    border-top: none;
    border-left: none;
    border-right: none;
  }
}
`.trim();

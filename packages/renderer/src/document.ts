// =============================================================================
// document.ts — Wraps rendered body in a complete HTML document
// -----------------------------------------------------------------------------
// Produces a self-contained HTML file: KaTeX CSS via CDN (cached well across
// sites), block CSS inlined, runtime JS inlined, an activity-config script
// tag with the runtime parameters (activity id, submission endpoint).
//
// The runtime needs to know:
//   * activityId — included in submission payload so the Edge Function knows
//     which activity the submission belongs to
//   * submissionEndpoint — URL to POST submissions to
//
// These come from the RenderContext passed in at render time. The renderer
// itself stays pure — values flow through args, never read from environment.
// =============================================================================

import type { ActivityDocument } from '@activity/schema';
import { escape, attr } from './html.js';
import { renderBody } from './render.js';
import { blockStyles } from './runtime/styles.js';
import { runtimeJs } from './runtime/runtime.js';

export interface RenderContext {
  /** UUID of the activity, included in submissions. */
  activityId: string;
  /** Version number — used in the published HTML's metadata. */
  versionNum: number;
  /** Absolute URL to POST submissions to (the ingest-submission Edge Function). */
  submissionEndpoint: string;
  /** Optional KaTeX CSS URL override. Defaults to jsDelivr CDN. */
  katexCssUrl?: string;
}

const DEFAULT_KATEX_CSS =
  'https://cdn.jsdelivr.net/npm/[email protected]/dist/katex.min.css';

export function renderActivity(doc: ActivityDocument, ctx: RenderContext): string {
  const body = renderBody(doc);
  const katexCss = ctx.katexCssUrl ?? DEFAULT_KATEX_CSS;

  // Embedded JSON config that the runtime reads at startup.
  const config = {
    activityId: ctx.activityId,
    versionNum: ctx.versionNum,
    submissionEndpoint: ctx.submissionEndpoint,
  };

  // Activity header text
  const headerMeta: string[] = [];
  headerMeta.push(escape(doc.meta.course));
  if (doc.meta.unit) headerMeta.push(escape(doc.meta.unit));

  return (
    '<!DOCTYPE html>' +
    '<html lang="en">' +
    '<head>' +
    '<meta charset="utf-8" />' +
    '<meta name="viewport" content="width=device-width, initial-scale=1" />' +
    '<title>' + escape(doc.meta.title) + '</title>' +
    '<link rel="stylesheet" href="' + attr(katexCss) + '" crossorigin="anonymous" />' +
    '<style>' + blockStyles + '</style>' +
    '</head>' +
    '<body>' +
    '<main class="activity-container">' +

    // Header
    '<header class="activity-header">' +
    '<h1>' + escape(doc.meta.title) + '</h1>' +
    (headerMeta.length > 0
      ? '<div class="meta">' + headerMeta.join(' &middot; ') + '</div>'
      : '') +
    '</header>' +

    // Identity prompt (Pattern B: name field is upfront, validated at submit)
    '<div class="identity-prompt">' +
    '<label for="student-name">Your name:</label>' +
    '<input id="student-name" type="text" autocomplete="name" />' +
    '</div>' +

    // Body
    body +

    // Submit area
    '<div class="submit-area">' +
    '<button type="button" class="submit-button">Submit</button>' +
    '<span class="submit-status"></span>' +
    '<span class="score-display"></span>' +
    '</div>' +

    '</main>' +

    // Runtime config (read by runtime JS)
    '<script id="activity-config" type="application/json">' +
    // Note: this is JSON inside a <script>, NOT inline JS — only </script>
    // could break out of it. Replace any literal </script> in the JSON to
    // be safe (config values are renderer-controlled, but defense in depth).
    JSON.stringify(config).replace(/<\/script/gi, '<\\/script') +
    '</script>' +

    // Runtime JS (vanilla, no framework)
    '<script>' + runtimeJs + '</script>' +

    '</body>' +
    '</html>'
  );
}

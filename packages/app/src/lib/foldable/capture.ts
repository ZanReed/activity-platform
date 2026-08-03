// =============================================================================
// foldable/capture.ts — the viewer tree → measurable HTML (S5.5 T5, D6A)
// -----------------------------------------------------------------------------
// The foldable engine works on HTML strings: measure each block's printed
// height, pack blocks into fixed panels, impose panels onto duplex sheets. It
// was fed by the renderer's `renderBody()`, which returned exactly that. The
// viewer is a live React tree instead, so something has to turn one into the
// other — and that is this module.
//
// WHERE REACT RUNS, AND WHY IT MATTERS (ruling D6A). React renders here, in the
// ordinary app document, and the result is serialized. The alternative — mount
// React inside the measuring iframe — puts component lifecycles in a foreign
// realm where lazy chunks, StrictMode double-mounts (a logged S3 pitfall where
// overlapping mounts sharing a container wiped each other's DOM) and cleanup
// all behave differently, inside a hidden throwaway document. That is the
// hardest possible place to debug the riskiest part of this slice.
//
// OFFSCREEN, NOT HIDDEN. The container is positioned far off the viewport
// rather than given `display: none` or `visibility: hidden`: a display-none
// subtree has no layout at all, so images never size, fonts never apply, and
// kit-backed blocks that measure their mount point (JSXGraph does) build
// nothing. It must be laid out to be worth capturing — it just must not be
// somewhere a teacher can see it.
//
// WHAT IS CAPTURED, AND WHEN. Only after the print-readiness barrier says so,
// EXTENDED in S5.5 to cover lazy block components: a Suspense fallback captured
// into a panel becomes a spinner permanently baked into a printed booklet,
// sized like a spinner rather than like the figure it replaced.
// =============================================================================

import { createElement, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import type { PrintConfig, Typography } from '@activity/schema';
import {
  AnswerKeyProvider,
  ViewerContainer,
  awaitPrintReady,
  createViewerStore,
  printVars,
  typographyVars,
  type AnswerKeyMap,
  type PrintReadyReport,
  type SanitizedActivityDocument,
} from '@activity/viewer';

export interface CaptureResult {
  /** Per top-level flow block, in document order: its captured outerHTML. */
  readonly blocks: string[];
  /** `<style>`/`<link>` tags reproducing the app's CSS in another document. */
  readonly styleTags: string;
  /** Inline custom properties the captured blocks were laid out under. */
  readonly rootStyle: string;
  /** What the readiness barrier waited on, for the caller to surface. */
  readonly report: PrintReadyReport;
}

export interface CaptureOptions {
  readonly document: SanitizedActivityDocument;
  readonly answerKey?: AnswerKeyMap | undefined;
  readonly timeoutMs?: number | undefined;
}

/**
 * Reproduce the app's stylesheets for a foreign document.
 *
 * CLONED RATHER THAN IMPORTED, and this is the S5.5 answer to ruling D7A. The
 * obvious approach — import the CSS as a string (`?inline`) and inject it — was
 * spiked and rejected: KaTeX's stylesheet references its fonts RELATIVELY
 * (`url(fonts/KaTeX_Main-Regular.woff2)`), and in a srcdoc iframe those resolve
 * against the app's page URL, so every maths glyph would fall back and every
 * equation would measure at the wrong height. The renderer sidestepped this by
 * rewriting KaTeX's font URLs to a CDN, which is a network dependency the
 * viewer should not inherit.
 *
 * The stylesheets the app has ALREADY loaded carry absolute URLs, because the
 * bundler resolved them when it injected them. Cloning them therefore gets
 * correct font URLs for free, in dev and in production, plus any @fontsource
 * family lazily loaded for this activity's typography — with no build-time
 * rewriting and nothing to keep in sync.
 */
export function cloneDocumentStyles(doc: Document = document): string {
  const parts: string[] = [];
  for (const node of Array.from(
    doc.querySelectorAll('style, link[rel="stylesheet"]'),
  )) {
    if (node instanceof HTMLLinkElement) {
      parts.push(`<link rel="stylesheet" href="${node.href}">`);
    } else if (node instanceof HTMLStyleElement) {
      parts.push(`<style>${node.textContent ?? ''}</style>`);
    }
  }
  return parts.join('');
}

/**
 * Flatten a rendered worksheet into its flow items — the units the paginator
 * packs into panels and, by its contract, never splits.
 *
 * THE ROW IS THE UNIT, not the block, and that is a deliberate change from the
 * renderer-era flattener. The viewer lays a section out as
 * `.viewer-section > .viewer-row > .viewer-column > blocks`, where the row is a
 * CSS grid carrying the authored column ratio and each column carries its own
 * width and work-space floor. Descending past the row to reach individual
 * blocks would win finer pagination and lose the layout: a block measured
 * outside its grid track is measured at the wrong width, and a multi-column row
 * split across two panels tears a side-by-side comparison in half.
 *
 * In practice the granularity is the same either way — the strict grid gives
 * each block its own single-column row — so this costs nothing on ordinary
 * documents and stays correct on the ones where it matters.
 *
 * Section titles come through as flow items (they are content). The section
 * footer comes through too and is dropped later: print mode gives it no height,
 * and whether something has height is a question only layout can answer.
 */
export function flattenViewerBlocks(root: ParentNode): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>('.viewer-section > *'),
  );
}

/**
 * Render the worksheet offscreen, wait for it to be worth capturing, and return
 * its blocks as HTML plus everything needed to lay them out again elsewhere.
 */
export async function captureViewerBlocks(
  options: CaptureOptions,
): Promise<CaptureResult> {
  const host = document.createElement('div');
  // Off to the side, full panel-ish width, still laid out. aria-hidden and
  // inert so nothing here is reachable by a screen reader or the tab order
  // while it exists.
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText =
    'position:fixed;left:-10000px;top:0;width:1200px;pointer-events:none;';
  document.body.appendChild(host);

  const root = createRoot(host);
  try {
    const print = options.document.meta.print as PrintConfig;
    const typography = options.document.meta.typography as Typography | undefined;

    const store = createViewerStore({
      userId: 'foldable-capture',
      activityId: 'capture',
      versionId: 'capture',
      checkService: {
        checkSection: () => Promise.reject(new Error('capture never checks')),
        fetchReleasedFeedback: () =>
          Promise.reject(new Error('capture never fetches feedback')),
      },
    });

    const tree: ReactNode = createElement(ViewerContainer, {
      document: options.document,
      store,
      mode: 'print',
    });

    flushSync(() => {
      root.render(
        options.answerKey
          ? createElement(
              AnswerKeyProvider,
              { answers: options.answerKey, children: tree },
            )
          : tree,
      );
    });

    // Lazy chunks, fonts and images — scoped to this subtree so a slow image
    // elsewhere on the page cannot spend the budget.
    const report = await awaitPrintReady({
      root: host,
      ...(options.timeoutMs === undefined ? {} : { timeoutMs: options.timeoutMs }),
    });

    const blocks = flattenViewerBlocks(host).map((el) => el.outerHTML);

    // The wrapper the blocks were laid out INSIDE. Rebuilding it around them in
    // the measuring document is what makes the measurement mean anything: the
    // print spacing and typography arrive as inline custom properties on the
    // `.viewer` root, so blocks measured without it inherit nothing and every
    // height is wrong (finding F5).
    const rootStyle = Object.entries({
      ...printVars(print),
      ...typographyVars(typography),
    })
      .map(([key, value]) => `${key}:${String(value)}`)
      .join(';');

    return {
      blocks,
      styleTags: cloneDocumentStyles(),
      rootStyle,
      report,
    };
  } finally {
    // Unmount OUT of the commit phase — calling root.unmount() synchronously
    // inside a lifecycle throws in React 19.
    setTimeout(() => {
      root.unmount();
      host.remove();
    }, 0);
  }
}

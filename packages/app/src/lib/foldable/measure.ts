// =============================================================================
// measure.ts — offscreen DOM measurement of flow-item heights
// -----------------------------------------------------------------------------
// The one part of the foldable engine that needs a live browser: to know how
// tall each flow item renders at the panel's exact width (text wrapping, maths,
// images all depend on it), we lay the captured items out in a hidden iframe
// and read each box's height.
//
// Why an iframe and not a detached div: the panel stylesheet sets body/html
// rules and resets we don't want leaking into the app, and a same-document
// container would inherit the app's own reset. An iframe is a clean document.
//
// WHAT THE IFRAME HAS TO REPRODUCE (S5.5 F5), and why getting this wrong is
// silent rather than loud. The viewer's blocks are laid out inside a
// `.viewer[data-viewer-mode="print"]` root that carries the print spacing and
// typography as INLINE custom properties. Measure them without that wrapper and
// nothing errors — every `var(--print-…)` simply resolves to nothing, the
// blocks lay out at default spacing, and the numbers that come back are
// plausible, wrong, and mis-paginate every panel. So the wrapper, its inline
// vars, and the app's own stylesheets are all rebuilt here.
//
// The stylesheets are CLONED from the app document rather than imported as
// strings — see capture.ts's cloneDocumentStyles for the reasoning (KaTeX's
// font URLs are relative and would break in a srcdoc frame).
// =============================================================================

import type { PrintConfig } from '@activity/schema';
import { awaitPrintReady } from '@activity/viewer';
import type { SheetGeometry } from './geometry';
import { foldableStyles } from './styles';
import type { FlowItem } from './paginate';

/** Everything the measurer needs about the captured worksheet. */
export interface MeasureSource {
  /** Captured per-flow-item outerHTML, in document order. */
  readonly blocks: readonly string[];
  /** `<style>`/`<link>` tags reproducing the app's CSS. */
  readonly styleTags: string;
  /** Inline custom properties for the rebuilt `.viewer` root. */
  readonly rootStyle: string;
}

/**
 * Build the wrapper the captured items were laid out inside. Exported because
 * the final printed document has to reproduce it identically — measuring under
 * one set of rules and printing under another is precisely the divergence that
 * produces panels which overflow only on paper.
 */
export function viewerWrapperOpen(rootStyle: string): string {
  return (
    '<div class="viewer" data-viewer-mode="print" style="' +
    rootStyle.replace(/"/g, '&quot;') +
    '"><section class="viewer-section">'
  );
}

export const VIEWER_WRAPPER_CLOSE = '</section></div>';

/**
 * Lay the captured items out in a hidden iframe at panel width and return one
 * FlowItem per visible item, in document order, carrying its outerHTML and
 * measured px height. Cleans up the iframe before resolving. Browser-only.
 */
export async function measureFlowItems(
  source: MeasureSource,
  geom: SheetGeometry,
  print: PrintConfig,
  timeoutMs?: number,
): Promise<FlowItem[]> {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText =
    'position:fixed;left:-10000px;top:0;width:1200px;height:1200px;border:0;visibility:hidden;';
  document.body.appendChild(iframe);

  try {
    const idoc = iframe.contentDocument;
    if (!idoc) throw new Error('foldable measure: no iframe document');

    idoc.open();
    idoc.write(
      // data-theme="light": a foldable panel is PAPER, in every medium. The
      // tokens default to dark when the OS asks for it, and the print flatten
      // that would correct it lives behind @media print — invisible to this
      // on-screen measuring pass and to the preview a teacher looks at. Pinning
      // light here is the S5-9 rule applied where the medium is never a screen.
      '<!doctype html><html data-theme="light"><head><meta charset="utf-8" />' +
        source.styleTags +
        '<style>' + foldableStyles(geom, print) + '</style>' +
        '</head><body><div class="foldable-panel-content" id="measure-root">' +
        viewerWrapperOpen(source.rootStyle) +
        source.blocks.join('') +
        VIEWER_WRAPPER_CLOSE +
        '</div></body></html>',
    );
    idoc.close();

    const root = idoc.getElementById('measure-root');
    if (!root) throw new Error('foldable measure: no measure root');

    // BOUNDED (ruling D11A). The previous implementation waited on every image
    // with no deadline, so one URL that neither loaded nor errored — a stalled
    // request, not an exotic case on a school network — left the teacher
    // watching "Laying out pages…" forever with no way out. Sharing the print
    // barrier means one settling implementation for the whole slice, and the
    // fix that lands in it lands everywhere.
    await awaitPrintReady({
      root: idoc,
      ...(timeoutMs === undefined ? {} : { timeoutMs }),
    });

    const items: FlowItem[] = [];
    for (const el of Array.from(
      root.querySelectorAll<HTMLElement>('.viewer-section > *'),
    )) {
      const height = el.getBoundingClientRect().height;
      // Drop what print gives no height: the section footer's check chrome,
      // and anything else the stylesheet takes off the page.
      if (height > 0.5) {
        items.push({ html: el.outerHTML, height });
      }
    }
    return items;
  } finally {
    iframe.remove();
  }
}

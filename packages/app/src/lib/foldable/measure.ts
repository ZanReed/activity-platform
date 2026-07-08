// =============================================================================
// measure.ts — offscreen DOM measurement of flow-item heights
// -----------------------------------------------------------------------------
// The one part of the foldable engine that needs a live browser: to know how
// tall each block renders at the panel's exact width (text wrapping, math,
// images all depend on it), we lay the rendered body out in a hidden iframe and
// read each block's box height. The iframe uses the SAME stylesheet the printed
// document will (styles.ts + the renderer's blockStyles/katexCss), so the
// heights we measure are the heights that print.
//
// Why an iframe and not a detached div: the panel stylesheet sets body/html and
// resets that we don't want leaking into the app, and a same-document container
// would inherit the app's Tailwind reset. An iframe is a clean document.
//
// We flatten the body: blocks are emitted by the renderer inside <section>
// wrappers, but the foldable flows blocks across panels regardless of section,
// so we extract each section's element children in document order. Interactive-
// only controls (checkpoint button, etc.) are hidden by the stylesheet and so
// measure as zero height — we drop those.
// =============================================================================

import { blockStyles, katexCss } from '@activity/renderer';
import type { PrintConfig } from '@activity/schema';
import type { SheetGeometry } from './geometry';
import { foldableStyles } from './styles';
import type { FlowItem } from './paginate';

// Wait for every <img> in the document to settle (loaded or errored) so an
// image block measures its real height, not zero. Resolves immediately when
// there are no images.
function waitForImages(doc: Document): Promise<void> {
  const imgs = Array.from(doc.images);
  const pending = imgs.filter((img) => !img.complete);
  if (pending.length === 0) return Promise.resolve();
  return Promise.all(
    pending.map(
      (img) =>
        new Promise<void>((resolve) => {
          img.addEventListener('load', () => resolve(), { once: true });
          img.addEventListener('error', () => resolve(), { once: true });
        }),
    ),
  ).then(() => undefined);
}

/**
 * Flatten renderer `renderBody` output into the ordered list of top-level flow
 * blocks. The renderer wraps blocks in `<section class="activity-section">`, but
 * the foldable flows blocks across panels regardless of section, so we extract
 * each section's element children in document order. A structural container
 * (e.g. a `columns` block) is a single `.activity-section > *` child, so it
 * comes back as ONE element — its cells are never flattened into separate flow
 * items, which is what lets paginate pack and (never) split it whole.
 *
 * Pure parse-and-select: needs DOM parsing (innerHTML + querySelectorAll) but
 * not layout, so it runs anywhere a Document exists (the measuring iframe in
 * production, jsdom in tests). The caller supplies the parse document so the
 * returned elements belong to the context that will measure them.
 */
export function extractFlowBlocks(
  bodyHtml: string,
  parseDoc: Document,
): HTMLElement[] {
  const parsed = parseDoc.createElement('div');
  parsed.innerHTML = bodyHtml;
  return Array.from(parsed.querySelectorAll<HTMLElement>('.activity-section > *'));
}

/**
 * Render `bodyHtml` (renderer renderBody output) in a hidden iframe at panel
 * width and return one FlowItem per visible top-level block, in document order,
 * carrying its outerHTML and measured px height. Cleans up the iframe before
 * resolving. Browser-only (touches document/iframe).
 */
export async function measureFlowItems(
  bodyHtml: string,
  geom: SheetGeometry,
  print: PrintConfig,
  // Activity-wide typography <style> tag ('' when the activity has none).
  // MUST match what renderFoldableDocument embeds: the family changes text
  // metrics, and fonts.ready below waits for it — measuring in the fallback
  // font but printing in the real one would mis-paginate panels.
  typographyTag = '',
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
      '<!doctype html><html><head>' +
        '<meta charset="utf-8" />' +
        '<style>' + katexCss + '</style>' +
        '<style>' + blockStyles + '</style>' +
        '<style>' + foldableStyles(geom, print) + '</style>' +
        typographyTag +
        '</head><body><div class="foldable-panel-content" id="measure-root"></div></body></html>',
    );
    idoc.close();

    const root = idoc.getElementById('measure-root');
    if (!root) throw new Error('foldable measure: no measure root');

    // Extract each section's element children in document order (see
    // extractFlowBlocks — a columns container comes back as one element).
    const sourceItems = extractFlowBlocks(bodyHtml, idoc);

    // Place clones into the measuring container so they stack exactly as they
    // will in a panel (shared stylesheet → shared metrics).
    const placed: HTMLElement[] = [];
    for (const el of sourceItems) {
      const clone = el.cloneNode(true) as HTMLElement;
      root.appendChild(clone);
      placed.push(clone);
    }

    // Let images and web fonts settle before reading geometry — both change
    // block heights (katex uses CDN fonts; image blocks have intrinsic size).
    await waitForImages(idoc);
    if (idoc.fonts && idoc.fonts.ready) {
      await idoc.fonts.ready;
    }

    const items: FlowItem[] = [];
    for (const el of placed) {
      const height = el.getBoundingClientRect().height;
      // Drop interactive-only controls the stylesheet hides (zero height).
      if (height > 0.5) {
        items.push({ html: el.outerHTML, height });
      }
    }
    return items;
  } finally {
    iframe.remove();
  }
}

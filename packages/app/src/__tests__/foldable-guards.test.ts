// =============================================================================
// foldable-guards.test.ts — the browser-found foldable fixes, pinned (G4)
// -----------------------------------------------------------------------------
// S5.5's browser pass found two category errors — a panel is not a PHONE (the
// 480px breakpoint flattened an authored 2:1 split to a stack, on paper, on
// every copy) and a panel is not a SCREEN (dark-mode machines produced dark
// sheets). Both were fixed; NEITHER had a guard: "caught by driving the dev
// bench in a browser" was their only evidence (s5.5-retro finding 9), so a
// viewer.css breakpoint change or a theme-default change would silently
// regress a printed teacher artifact and nothing would go red.
//
// measureFlowItems builds its srcdoc inside an iframe it deletes before
// resolving, so its copy of the light-theme pin is guarded by the parse-back
// pattern (same bond the print CSS break-list uses): assert the source text,
// because the artifact is unreachable after the fact.
// =============================================================================

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { foldableStyles } from '../lib/foldable/styles';
import { renderFoldableDocument } from '../lib/foldable/render';
import type { SheetGeometry } from '../lib/foldable/geometry';
import type { PrintConfig } from '@activity/schema';

const geom = {
  sheetWidthIn: 11,
  sheetHeightIn: 8.5,
  panelWidthIn: 5.5,
  panelHeightIn: 4.25,
} as unknown as SheetGeometry;

const print = {
  fontSize: 11,
  problemSpacing: 1.5,
  workSpace: 0,
} as unknown as PrintConfig;

describe('a panel is not a phone (the 480px counter-override)', () => {
  it('re-asserts the authored column grid at panel width', () => {
    const css = foldableStyles(geom, print);
    // Value-equality, not presence (the D24-C lesson): the rule must both
    // exist AND still say grid-with-the-authored-template, or the viewer's
    // sub-480px stack rule flattens every printed 2:1 split again.
    expect(css).toContain('.foldable-panel-content .viewer-row');
    expect(css).toMatch(
      /\.foldable-panel-content \.viewer-row \{\s*display: grid;\s*grid-template-columns: var\(--activity-columns-template, 1fr\);/,
    );
    expect(css).toContain(
      '.foldable-panel-content .viewer-column + .viewer-column { margin-top: 0; }',
    );
  });
});

describe('a panel is not a screen (the forced light theme)', () => {
  it('the printable document roots itself data-theme="light"', () => {
    const html = renderFoldableDocument({
      title: 't',
      geom,
      print,
      contentPanels: ['<p>x</p>'],
      foldables: [],
      styleTags: '',
      rootStyle: '',
    } as unknown as Parameters<typeof renderFoldableDocument>[0]);
    expect(html).toContain('data-theme="light"');
  });

  it('the measuring iframe roots itself data-theme="light" (source pin)', () => {
    const source = readFileSync(
      join(
        dirname(fileURLToPath(import.meta.url)),
        '..',
        'lib',
        'foldable',
        'measure.ts',
      ),
      'utf8',
    );
    expect(source).toContain('<html data-theme="light">');
  });
});

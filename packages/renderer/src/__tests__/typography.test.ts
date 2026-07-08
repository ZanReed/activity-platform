// =============================================================================
// typography.test.ts — activity-wide typography renderer output
// -----------------------------------------------------------------------------
// String-level assertions on the typography <style> tag both document
// renderers emit from meta.typography, plus the pure helpers in typography.ts.
// The load-bearing back-compat case: a document WITHOUT typography emits
// nothing new — pre-typography pages are byte-identical in this layer.
// =============================================================================

import { describe, it, expect } from 'vitest';
import { renderActivity, renderActivityForPrint } from '../document.js';
import type { RenderContext } from '../document.js';
import {
  FONT_REGISTRY,
  FONT_MENU,
  fontFamilyValue,
  fontFaceCss,
  typographyStyleTag,
} from '../typography.js';
import { ActivityDocument, ActivityFont } from '@activity/schema';

const CTX: RenderContext = {
  activityId: '11111111-1111-4111-8111-111111111111',
  versionNum: 1,
  submissionEndpoint: 'https://example.test/ingest',
  fontsBaseUrl: 'https://pub.example.test/shared/fonts/v1',
};

const SECTION_ID = '22222222-2222-4222-8222-222222222222';
const PARA_ID = '33333333-3333-4333-8333-333333333333';

function makeDoc(typography?: Record<string, unknown>): ActivityDocument {
  return ActivityDocument.parse({
    schemaVersion: 1,
    meta: {
      title: 'Radicals',
      ...(typography ? { typography } : {}),
    },
    sections: [
      {
        id: SECTION_ID,
        blocks: [
          {
            id: PARA_ID,
            type: 'paragraph',
            content: [{ type: 'text', text: 'BODYMARKER' }],
          },
        ],
      },
    ],
  });
}

describe('renderActivity — typography', () => {
  // Note: bare '@font-face' / '--activity-font-*' substrings exist on EVERY
  // page (KaTeX embeds font faces; blockStyles reads the vars via var()), so
  // these assertions target the typography tag's distinctive output: the
  // ':root{--activity-font' SETTER and the activity-font file names.
  it('emits nothing extra for a document without meta.typography', () => {
    const html = renderActivity(makeDoc(), CTX);
    expect(html).not.toContain(':root{--activity-font');
    expect(html).not.toContain('shared/fonts/v1');
  });

  it('emits @font-face + :root vars for a selected font', () => {
    const html = renderActivity(makeDoc({ font: 'lexend', fontSize: 18 }), CTX);
    expect(html).toContain(
      'src:url("https://pub.example.test/shared/fonts/v1/lexend-latin-400-normal.woff2") format("woff2")',
    );
    expect(html).toContain('font-display:swap;');
    expect(html).toContain('--activity-font-family:"Lexend",');
    expect(html).toContain('--activity-font-size:18px;');
  });

  it('emits size var but no @font-face for the default font', () => {
    const html = renderActivity(makeDoc({ fontSize: 20 }), CTX);
    expect(html).not.toContain('shared/fonts/v1');
    expect(html).toContain(':root{--activity-font-size:20px;}');
  });

  it('omits @font-face (but keeps vars) when no fontsBaseUrl is supplied', () => {
    const { fontsBaseUrl: _omitted, ...ctxNoFonts } = CTX;
    const html = renderActivity(
      makeDoc({ font: 'andika', fontSize: 16 }),
      ctxNoFonts,
    );
    expect(html).not.toContain('andika-latin');
    expect(html).toContain('--activity-font-family:"Andika",');
    expect(html).toContain('--activity-font-size:16px;');
  });

  it('keeps the print body-size layer independent (--print-font-size intact)', () => {
    const html = renderActivity(makeDoc({ font: 'lexend', fontSize: 18 }), CTX);
    expect(html).toContain('--print-font-size:11pt;');
    expect(html).toContain('--activity-font-size:18px;');
  });
});

describe('renderActivityForPrint — typography', () => {
  it('carries the same typography tag when a fontsBaseUrl is supplied', () => {
    const html = renderActivityForPrint(
      makeDoc({ font: 'comic-neue', fontSize: 16 }),
      { fontsBaseUrl: 'https://pub.example.test/shared/fonts/v1' },
    );
    expect(html).toContain(
      'src:url("https://pub.example.test/shared/fonts/v1/comic-neue-latin-400-normal.woff2") format("woff2")',
    );
    expect(html).toContain('--activity-font-family:"Comic Neue",');
  });

  it('emits nothing extra without meta.typography', () => {
    const html = renderActivityForPrint(makeDoc(), {});
    expect(html).not.toContain(':root{--activity-font');
    expect(html).not.toContain('shared/fonts/v1');
  });
});

describe('typography helpers', () => {
  it('fontFamilyValue quotes the registry family and appends the default stack', () => {
    expect(fontFamilyValue('lexend')).toBe(
      '"Lexend", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    );
    expect(fontFamilyValue('default')).toBeNull();
  });

  it('fontFaceCss takes a list (the textStyle-mark seam) and dedupes', () => {
    const css = fontFaceCss(
      ['lexend', 'andika', 'lexend', 'default'],
      'https://base.test/fonts/',
    );
    // Both families present, trailing slash normalized, default contributes 0.
    expect(css).toContain('font-family:"Lexend";');
    expect(css).toContain('font-family:"Andika";');
    expect(css).toContain('url("https://base.test/fonts/andika-latin-400-italic.woff2")');
    // Dedupe: lexend's 400-normal face appears exactly once.
    expect(
      css.split('lexend-latin-400-normal.woff2').length - 1,
    ).toBe(1);
  });

  it('typographyStyleTag returns "" for undefined typography', () => {
    expect(typographyStyleTag(undefined, 'https://base.test')).toBe('');
  });

  it('every menu font is in the registry with fontsource-canonical file names', () => {
    expect([...FONT_MENU].sort()).toEqual([...ActivityFont.options].sort());
    for (const font of ActivityFont.options) {
      const spec = FONT_REGISTRY[font];
      expect(spec.label.length).toBeGreaterThan(0);
      for (const f of spec.files) {
        // scripts/build-fonts.mjs derives its upload list from these names —
        // the pattern is the contract that keeps the two aligned.
        expect(f.file).toMatch(new RegExp(`^${font}-latin-[467]00-(normal|italic)\\.woff2$`));
      }
    }
  });
});

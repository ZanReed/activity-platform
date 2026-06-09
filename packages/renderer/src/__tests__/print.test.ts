// =============================================================================
// print.test.ts — print feature renderer output (Drop A)
// -----------------------------------------------------------------------------
// String-level assertions on the two document renderers:
//   - renderActivity: the published page now carries the print layer
//     (dynamic @page, --print-* container vars, print-only header, per-block
//     work space) while keeping all its interactive chrome.
//   - renderActivityForPrint: same body + print layer, none of the
//     interactive chrome (runtime script, config blob, identity prompt,
//     submit area, popover).
// =============================================================================

import { describe, it, expect } from 'vitest';
import { renderActivity, renderActivityForPrint } from '../document.js';
import type { RenderContext } from '../document.js';
import { ActivityDocument } from '@activity/schema';

const CTX: RenderContext = {
    activityId: '11111111-1111-4111-8111-111111111111',
    versionNum: 1,
    submissionEndpoint: 'https://example.test/ingest',
};

const SECTION_ID = '22222222-2222-4222-8222-222222222222';
const PARA_ID = '33333333-3333-4333-8333-333333333333';
const FIB_WORK_ID = '44444444-4444-4444-8444-444444444444';
const FIB_PLAIN_ID = '55555555-5555-4555-8555-555555555555';

// Build + validate a document with a known body marker, one fill-in-blank
// block carrying a per-problem work-space override and one without. printMeta
// is merged into meta so individual tests can configure the print layer.
function makeDoc(printMeta: Record<string, unknown> = {}): ActivityDocument {
    return ActivityDocument.parse({
        schemaVersion: 1,
        meta: { title: 'Radicals', print: printMeta },
        sections: [
            {
                id: SECTION_ID,
                blocks: [
                    { id: PARA_ID, type: 'paragraph', content: [{ type: 'text', text: 'BODYMARKER' }] },
                    { id: FIB_WORK_ID, type: 'fill_in_blank', content: [], workSpace: 3 },
                    { id: FIB_PLAIN_ID, type: 'fill_in_blank', content: [] },
                ],
            },
        ],
    });
}

describe('renderActivity — print layer on the published page', () => {
    it('emits a default letter @page rule and the default --print-* vars', () => {
        const html = renderActivity(makeDoc(), CTX);
        expect(html).toContain('@page{size:letter;margin:0.5in;}');
        expect(html).toContain(
            '--print-columns:1;--print-work-space:0rem;--print-font-size:11pt;--print-problem-spacing:1rem;',
        );
    });

    it('reflects a configured print layer (A4, columns, spacing, margin)', () => {
        const html = renderActivity(
            makeDoc({
                paperSize: 'a4',
                columns: 2,
                workSpace: 2,
                fontSize: 12,
                problemSpacing: 1.5,
                margin: 1,
            }),
            CTX,
        );
        expect(html).toContain('@page{size:A4;margin:1in;}');
        expect(html).toContain(
            '--print-columns:2;--print-work-space:2rem;--print-font-size:12pt;--print-problem-spacing:1.5rem;',
        );
    });

    it('renders the default print header (Name + Date, no Period)', () => {
        const html = renderActivity(makeDoc(), CTX);
        expect(html).toContain('class="print-header"');
        expect(html).toContain('Name:');
        expect(html).toContain('Date:');
        expect(html).not.toContain('Period:');
    });

    it('renders enabled header fields and custom labels', () => {
        const html = renderActivity(
            makeDoc({
                header: {
                    period: true,
                    class: true,
                    score: true,
                    custom: ['Homeroom'],
                },
            }),
            CTX,
        );
        expect(html).toContain('Period:');
        expect(html).toContain('Class:');
        expect(html).toContain('Score:');
        expect(html).toContain('Homeroom:');
    });

    it('omits the print header entirely when no fields are enabled', () => {
        const html = renderActivity(
            makeDoc({ header: { name: false, date: false } }),
            CTX,
        );
        expect(html).not.toContain('class="print-header"');
    });

    it('emits the per-problem work-space override only on the block that set it', () => {
        const html = renderActivity(makeDoc(), CTX);
        expect(html).toContain('style="--print-work-space:3rem"');
        // The plain block carries no work-space style.
        const plainChunk = html.slice(html.indexOf(FIB_PLAIN_ID));
        expect(plainChunk).not.toContain('--print-work-space:3rem');
    });

    it('keeps the interactive chrome (this is still the published page)', () => {
        const html = renderActivity(makeDoc(), CTX);
        expect(html).toContain('activity-config');
        expect(html).toContain('identity-prompt');
        expect(html).toContain('submit-area');
    });
});

describe('renderActivityForPrint — print document, no interactive chrome', () => {
    it('renders the body and the print layer', () => {
        const html = renderActivityForPrint(makeDoc());
        expect(html).toContain('BODYMARKER');
        expect(html).toContain('@page{size:letter;margin:0.5in;}');
        expect(html).toContain('--print-columns:1;');
        expect(html).toContain('class="print-header"');
        expect(html).toContain('style="--print-work-space:3rem"');
    });

    it('strips the runtime, config blob, identity prompt, submit area, popover', () => {
        const html = renderActivityForPrint(makeDoc());
        // Assert on the MARKUP, not bare class names — the inlined stylesheet
        // legitimately references .identity-prompt / .submit-area / .js-popover
        // in its @media print hide rules, so those substrings appear in the CSS.
        expect(html).not.toContain('<script');
        expect(html).not.toContain('id="activity-config"');
        expect(html).not.toContain('class="identity-prompt"');
        expect(html).not.toContain('class="submit-area"');
        expect(html).not.toContain('id="activity-popover"');
    });
});

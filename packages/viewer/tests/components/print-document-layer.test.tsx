// =============================================================================
// print-document-layer.test.tsx — the print surface that is NOT a block (S5 T1c)
// -----------------------------------------------------------------------------
// Paper size, configured type and spacing, the row of fill-in lines, and the
// reference box. These reach STUDENTS today through Ctrl+P on a published page,
// and none of them is a block — which is exactly why they nearly fell into the
// crack between S5 and the S5.5 teacher-print slice, and why the parity gate
// needed a document fixture class (S5-OV1). A per-block roster cannot notice a
// missing header.
// =============================================================================

import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { PrintConfig, PrintHeader } from '@activity/schema';
import {
  PrintPageRule,
  PrintHeaderRow,
  PrintWorksheetHeading,
  printVars,
} from '../../src/container/PrintDocumentLayer.js';
import { ViewerContainer } from '../../src/container/ViewerContainer.js';
import { createViewerStore, createMockCheckService } from '../../src/index.js';
import type { SanitizedActivityDocument } from '../../src/index.js';
import {
  sanitizedFixtureDocument,
  sanitizedBlockFixture,
} from '../../src/fixtures/index.js';
import { TEST_USER_ID } from '../helpers/ids.js';

/** Schema defaults, so the tests exercise what a real document carries. */
const config = (overrides: Record<string, unknown> = {}) =>
  PrintConfig.parse(overrides);
const header = (overrides: Record<string, unknown> = {}) =>
  PrintHeader.parse(overrides);

describe('@page — the paper itself', () => {
  it('defaults to letter with the default margin', () => {
    const { container } = render(<PrintPageRule print={config()} />);
    expect(container.querySelector('style')?.textContent).toBe(
      '@page{size:letter;margin:0.5in;}',
    );
  });

  it('honors a teacher who chose A4', () => {
    // The wrong paper size is not cosmetic: it is content clipped at the
    // margin, and the teacher who set it is the one who knows their printer.
    const { container } = render(
      <PrintPageRule print={config({ paperSize: 'a4', margin: 1 })} />,
    );
    expect(container.querySelector('style')?.textContent).toBe(
      '@page{size:A4;margin:1in;}',
    );
  });

  it('emits a real stylesheet rule, not a custom property', () => {
    // @page cannot reliably read custom properties — the reason the renderer
    // emits a per-document <style> too. A var()-based attempt would silently
    // fall back to the default size on every printer.
    const { container } = render(<PrintPageRule print={config()} />);
    expect(container.querySelector('style')?.textContent).not.toContain('var(');
  });
});

describe('--print-* variables', () => {
  it('carries the configured type, spacing and work space', () => {
    expect(
      printVars(config({ fontSize: 12, problemSpacing: 2, workSpace: 3, columns: 2 })),
    ).toEqual({
      '--print-columns': 2,
      '--print-work-space': '3rem',
      '--print-font-size': '12pt',
      '--print-problem-spacing': '2rem',
    });
  });

  it('carries the schema defaults when nothing was configured', () => {
    expect(printVars(config())).toEqual({
      '--print-columns': 1,
      '--print-work-space': '0rem',
      '--print-font-size': '11pt',
      '--print-problem-spacing': '1rem',
    });
  });
});

describe('the print header', () => {
  it('renders Name and Date by default', () => {
    const { container } = render(<PrintHeaderRow header={header()} />);
    const labels = Array.from(
      container.querySelectorAll('.viewer-print-header__label'),
    ).map((el) => el.textContent);
    expect(labels).toEqual(['Name:', 'Date:']);
  });

  it('renders a writing line for every enabled field', () => {
    const { container } = render(
      <PrintHeaderRow header={header({ period: true, class: true, score: true })} />,
    );
    expect(container.querySelectorAll('.viewer-print-header__line')).toHaveLength(5);
  });

  it('renders the teacher’s custom labels verbatim', () => {
    const { container } = render(
      <PrintHeaderRow
        header={header({ name: false, date: false, custom: ['Table #', 'Partner'] })}
      />,
    );
    const labels = Array.from(
      container.querySelectorAll('.viewer-print-header__label'),
    ).map((el) => el.textContent);
    expect(labels).toEqual(['Table #:', 'Partner:']);
  });

  it('renders NOTHING when every field is disabled', () => {
    // An empty ruled box at the top of a worksheet is worse than no header:
    // it looks like something failed to load.
    const { container } = render(
      <PrintHeaderRow header={header({ name: false, date: false })} />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('hides the header from assistive tech', () => {
    // Blank lines for a pen. There is nothing here to announce, and the screen
    // surface never asks a student to type their name into it.
    const { container } = render(<PrintHeaderRow header={header()} />);
    expect(
      container.querySelector('.viewer-print-header')?.getAttribute('aria-hidden'),
    ).toBe('true');
  });

  it('keeps the score field distinguishable so it can be sized differently', () => {
    const { container } = render(<PrintHeaderRow header={header({ score: true })} />);
    expect(
      container.querySelector('.viewer-print-header__field--score'),
    ).not.toBeNull();
  });
});

describe('the reference box on the printed page', () => {
  const docWith = (
    overrides: { printReferencePanel?: boolean; withPanel?: boolean } = {},
  ) => {
    const doc = structuredClone(sanitizedFixtureDocument()) as Record<string, never> &
      SanitizedActivityDocument;
    const meta = doc.meta as unknown as { print: Record<string, unknown> };
    meta.print = {
      ...meta.print,
      printReferencePanel: overrides.printReferencePanel ?? true,
    };
    if (overrides.withPanel ?? true) {
      (doc as unknown as { referencePanel: unknown }).referencePanel = {
        title: 'Formula sheet',
        blocks: [sanitizedBlockFixture('paragraph')],
      };
    }
    return doc;
  };

  const renderDoc = (doc: SanitizedActivityDocument) => {
    const store = createViewerStore({
      userId: TEST_USER_ID,
      activityId: 'aaaaaaaa-0000-4000-8000-000000000001',
      versionId: 'bbbbbbbb-0000-4000-8000-000000000001',
      checkService: createMockCheckService({}),
    });
    return render(<ViewerContainer document={doc} store={store} />);
  };

  it('renders the box when the teacher left printing it on', () => {
    const { container } = renderDoc(docWith({ printReferencePanel: true }));
    const box = container.querySelector('.viewer-reference-print');
    expect(box).not.toBeNull();
    expect(box?.textContent).toContain('Formula sheet');
  });

  it('renders NOTHING when the teacher turned it off', () => {
    // A reference sheet reprinted on every worksheet in a unit is wasted paper,
    // which is why the setting exists and why honoring it matters.
    const { container } = renderDoc(docWith({ printReferencePanel: false }));
    expect(container.querySelector('.viewer-reference-print')).toBeNull();
  });

  it('renders nothing when the activity has no reference panel at all', () => {
    const { container } = renderDoc(docWith({ withPanel: false }));
    expect(container.querySelector('.viewer-reference-print')).toBeNull();
  });

  it('marks the box as scaffold so no check path ever walks it', () => {
    const { container } = renderDoc(docWith());
    expect(
      container
        .querySelector('.viewer-reference-print')
        ?.getAttribute('data-block-category'),
    ).toBe('scaffold');
  });

  it('puts the configured print variables on the worksheet root', () => {
    const { container } = renderDoc(docWith());
    const root = container.querySelector('.viewer') as HTMLElement;
    expect(root.style.getPropertyValue('--print-font-size')).toBe('11pt');
    expect(root.style.getPropertyValue('--print-problem-spacing')).toBe('1rem');
  });
});

describe('the worksheet says what it is on paper', () => {
    const renderDoc = () => {
        const doc = structuredClone(sanitizedFixtureDocument()) as never as {
            meta: Record<string, unknown>;
        };
        const store = createViewerStore({
          userId: TEST_USER_ID,
            activityId: 'aaaaaaaa-0000-4000-8000-000000000001',
            versionId: 'bbbbbbbb-0000-4000-8000-000000000001',
            checkService: createMockCheckService({}),
        });
        return render(<ViewerContainer document={doc as never} store={store} />);
    };

    it('prints the activity title', () => {
        // On screen the top bar carries this and it is hidden in print, so
        // without a heading of its own a printed worksheet has no title at all
        // — a stack of photocopies nobody can file.
        const { container } = renderDoc();
        expect(
            container.querySelector('.viewer-print-heading__title')?.textContent,
        ).toBe('Fixture worksheet');
    });

    it('prints the course line the published page prints', () => {
        const { container } = renderDoc();
        expect(
            container.querySelector('.viewer-print-heading__meta')?.textContent,
        ).toContain('Algebra II');
    });

    it('joins course and unit with the renderer’s separator', () => {
        // A teacher printing from either surface should get the same line.
        const { container } = render(
            <PrintWorksheetHeading title="Quiz 3" course="Algebra II" unit="Unit 4" />,
        );
        expect(
            container.querySelector('.viewer-print-heading__meta')?.textContent,
        ).toBe('Algebra II · Unit 4');
    });

    it('omits the meta line when there is nothing to say', () => {
        const { container } = render(<PrintWorksheetHeading title="Quiz 3" />);
        expect(container.querySelector('.viewer-print-heading__meta')).toBeNull();
        expect(container.querySelector('.viewer-print-heading__title')?.textContent).toBe(
            'Quiz 3',
        );
    });

    it('places the heading AFTER the fill-in lines and BEFORE the work', () => {
        // The published page's order, and the one that reads correctly: you
        // write your name at the top, then find out what you are doing.
        const { container } = renderDoc();
        const header = container.querySelector('.viewer-print-header');
        const heading = container.querySelector('.viewer-print-heading');
        const firstSection = container.querySelector('.viewer-section');
        expect(header).not.toBeNull();
        expect(heading).not.toBeNull();
        expect(
            header!.compareDocumentPosition(heading!) & Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
        expect(
            heading!.compareDocumentPosition(firstSection!) &
                Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
    });
});

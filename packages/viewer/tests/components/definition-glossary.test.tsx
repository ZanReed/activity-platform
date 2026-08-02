// =============================================================================
// definition-glossary.test.tsx — the paper surface for definitions (S5 T1c)
// -----------------------------------------------------------------------------
// On screen a definition is a disclosure opened over its own word. On paper
// there is no opening, so the appendix is where the content lives or it is lost
// — tolerable when a definition was a short gloss, not once one could carry a
// display equation, a list, and a figure.
//
// The collection walk is STRUCTURAL rather than type-directed, and most of
// these tests exist to hold that property: a definition riding a blank's hint,
// a choice's content, or a deeply nested list item must be found, because those
// are exactly the places a typed visitor forgets. A missing glossary entry is
// silent — the worksheet prints, it just quietly lacks the word a student did
// not know.
// =============================================================================

import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { collectDefinitions } from '../../src/print/definitions.js';
import { DefinitionGlossary } from '../../src/print/DefinitionGlossary.js';
import { setMathRenderer, sanitizeActivityDocument } from '../../src/index.js';
import {
  authoredFixtureDocument,
  sanitizedFixtureDocument,
} from '../../src/fixtures/index.js';
import { ViewerContainer } from '../../src/container/ViewerContainer.js';
import { createViewerStore, createMockCheckService } from '../../src/index.js';
import { TEST_USER_ID } from '../helpers/ids.js';

/** A text node carrying a definition mark. */
const defined = (term: string, content: unknown[]) => ({
  type: 'text',
  text: term,
  marks: [{ type: 'definition', content }],
});

const para = (text: string) => ({
  id: 'p1',
  type: 'paragraph',
  content: [{ type: 'text', text }],
});

/** A document shell whose sections hold whatever nodes a test needs. */
const docWith = (sections: unknown) => ({ sections });

describe('collectDefinitions — the structural walk', () => {
  it('finds a definition in ordinary block prose', () => {
    const entries = collectDefinitions(
      docWith([{ content: [defined('factor', [para('A number that divides.')])] }]),
    );
    expect(entries.map((e) => e.term)).toEqual(['factor']);
  });

  it('finds one buried in a blank hint, a choice, and a nested list item', () => {
    // The reason the walk is structural. A typed visitor would have to know
    // about every one of these places, and would silently miss the next one.
    const entries = collectDefinitions(
      docWith([
        { blanks: [{ hint: [defined('coefficient', [para('The number in front.')])] }] },
        { choices: [{ content: [defined('domain', [para('The inputs.')])] }] },
        {
          items: [
            { children: [{ items: [{ content: [defined('range', [para('The outputs.')])] }] }] },
          ],
        },
      ]),
    );
    expect(entries.map((e) => e.term)).toEqual(['coefficient', 'domain', 'range']);
  });

  it('finds definitions in the reference panel too', () => {
    const entries = collectDefinitions({
      sections: [],
      referencePanel: {
        blocks: [{ content: [defined('slope', [para('Rise over run.')])] }],
      },
    });
    expect(entries.map((e) => e.term)).toEqual(['slope']);
  });

  it('sorts alphabetically, because an appendix is looked up, not read', () => {
    const entries = collectDefinitions(
      docWith([
        { content: [defined('zero', [para('z')]), defined('apex', [para('a')])] },
      ]),
    );
    expect(entries.map((e) => e.term)).toEqual(['apex', 'zero']);
  });

  it('dedupes case-insensitively, first occurrence winning', () => {
    const entries = collectDefinitions(
      docWith([
        { content: [defined('Factor', [para('first')]), defined('factor', [para('second')])] },
      ]),
    );
    expect(entries).toHaveLength(1);
    expect(entries[0]?.term).toBe('Factor');
    expect(JSON.stringify(entries[0]?.content)).toContain('first');
  });

  it('skips a term whose definition is empty', () => {
    // Inert on screen (the term is not even clickable), so an entry with
    // nothing under it would be worse than no entry.
    expect(collectDefinitions(docWith([{ content: [defined('hollow', [])] }]))).toEqual(
      [],
    );
  });

  it('skips a whitespace-only term', () => {
    expect(
      collectDefinitions(docWith([{ content: [defined('   ', [para('x')])] }])),
    ).toEqual([]);
  });

  it('ignores non-definition marks', () => {
    const entries = collectDefinitions(
      docWith([{ content: [{ type: 'text', text: 'bold', marks: [{ type: 'bold' }] }] }]),
    );
    expect(entries).toEqual([]);
  });

  it('survives nulls and primitives without throwing', () => {
    // The walk runs over served data; a defensive shape check here is cheaper
    // than a blank worksheet from one unexpected null.
    expect(() =>
      collectDefinitions(docWith([null, 3, 'text', { content: null }])),
    ).not.toThrow();
  });

  it('returns nothing for a document with no definitions at all', () => {
    expect(collectDefinitions(docWith([{ content: [{ type: 'text', text: 'x' }] }]))).toEqual(
      [],
    );
  });
});

describe('the appendix itself', () => {
  it('renders one entry per term, with its content', () => {
    const entries = collectDefinitions(
      docWith([{ content: [defined('factor', [para('A number that divides.')])] }]),
    );
    const { container } = render(<DefinitionGlossary entries={entries} />);
    expect(container.querySelector('.viewer-glossary__term')?.textContent).toBe('factor');
    expect(container.querySelector('.viewer-glossary__body')?.textContent).toContain(
      'A number that divides.',
    );
  });

  it('renders NOTHING when there is nothing to define', () => {
    // A document with the setting on but no definitions must not print a bare
    // "Glossary" heading over empty space.
    const { container } = render(<DefinitionGlossary entries={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('marks the appendix as scaffold so no check path walks it', () => {
    const entries = collectDefinitions(
      docWith([{ content: [defined('x', [para('y')])] }]),
    );
    const { container } = render(<DefinitionGlossary entries={entries} />);
    expect(
      container.querySelector('.viewer-glossary')?.getAttribute('data-block-category'),
    ).toBe('scaffold');
  });

  it('renders every content variant the definition alphabet allows', () => {
    // The seven-variant union. A variant that fell through the switch would
    // render as a hole in the appendix — visible only on paper.
    setMathRenderer((latex) => `<span data-katex="1">${latex}</span>`);
    const entries = [
      {
        term: 'everything',
        content: [
          { id: 'a', type: 'paragraph', content: [{ type: 'text', text: 'prose' }] },
          {
            id: 'b',
            type: 'heading',
            level: 2,
            content: [{ type: 'text', text: 'sub' }],
          },
          { id: 'c', type: 'math_block', latex: 'x^2' },
          { id: 'd', type: 'image', src: 'https://example.test/i.png', alt: 'a figure' },
          {
            id: 'e',
            type: 'bullet_list',
            items: [{ id: 'e1', content: [{ type: 'text', text: 'bullet' }] }],
          },
          {
            id: 'f',
            type: 'ordered_list',
            items: [{ id: 'f1', content: [{ type: 'text', text: 'step' }] }],
          },
        ],
      },
    ] as never;

    const { container } = render(<DefinitionGlossary entries={entries} />);
    const body = container.querySelector('.viewer-glossary__body');
    expect(body?.textContent).toContain('prose');
    expect(body?.textContent).toContain('sub');
    expect(container.querySelector('.viewer-glossary__math')).not.toBeNull();
    expect(container.querySelector('.viewer-glossary__image')?.getAttribute('alt')).toBe(
      'a figure',
    );
    expect(container.querySelector('.viewer-glossary__list--bullet')).not.toBeNull();
    expect(container.querySelector('.viewer-glossary__list--ordered')).not.toBeNull();
    setMathRenderer(null);
  });

  it('renders nested list items', () => {
    const entries = [
      {
        term: 'nested',
        content: [
          {
            id: 'a',
            type: 'bullet_list',
            items: [
              {
                id: 'a1',
                content: [{ type: 'text', text: 'outer' }],
                children: [
                  {
                    id: 'a2',
                    type: 'bullet_list',
                    items: [{ id: 'a3', content: [{ type: 'text', text: 'inner' }] }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ] as never;
    const { container } = render(<DefinitionGlossary entries={entries} />);
    expect(container.querySelectorAll('.viewer-glossary__list')).toHaveLength(2);
    expect(container.textContent).toContain('inner');
  });

  it('falls back to readable LaTeX when no math renderer has loaded', () => {
    // The same bargain every math surface makes: a student who prints before
    // the chunk resolves gets source they can read, not a blank space.
    setMathRenderer(null);
    const entries = [
      { term: 't', content: [{ id: 'm', type: 'math_block', latex: '\\frac{a}{b}' }] },
    ] as never;
    const { container } = render(<DefinitionGlossary entries={entries} />);
    expect(
      container.querySelector('.viewer-glossary__math-fallback')?.textContent,
    ).toBe('\\frac{a}{b}');
  });
});

describe('definitions survive the trip to the student', () => {
  it('is still collectable AFTER the real sanitizer runs', () => {
    // The integration that decides whether any of this works in production.
    // The viewer never sees an authored document — it sees the sanitized one,
    // and if the answer-key sanitizer stripped definition content (it walks
    // inline nodes looking for secrets, and a definition mark IS an inline
    // node carrying a content array), every glossary would print empty while
    // every unit test above still passed. Asserted against the real transform,
    // not a hand-built "sanitized-looking" shape.
    const authored = authoredFixtureDocument() as unknown as {
      sections: { rows: { columns: { blocks: unknown[] }[] }[] }[];
    };
    const firstBlock = authored.sections[0]?.rows[0]?.columns[0]?.blocks[0] as {
      content?: unknown[];
    };
    firstBlock.content = [
      ...(firstBlock.content ?? []),
      defined('coefficient', [para('The number multiplying a variable.')]),
    ];

    const beforeSanitize = collectDefinitions(authored);
    expect(beforeSanitize.map((e) => e.term)).toContain('coefficient');

    const served = sanitizeActivityDocument(authored as never);
    const afterSanitize = collectDefinitions(served);

    expect(afterSanitize.map((e) => e.term)).toContain('coefficient');
    expect(JSON.stringify(afterSanitize)).toContain(
      'The number multiplying a variable.',
    );
  });
});

describe('the container gates the appendix on the teacher’s setting', () => {
  const renderDoc = (printDefinitionGlossary: boolean) => {
    const doc = structuredClone(sanitizedFixtureDocument()) as never as {
      meta: { print: Record<string, unknown> };
    };
    doc.meta.print = { ...doc.meta.print, printDefinitionGlossary };
    const store = createViewerStore({
      userId: TEST_USER_ID,
      activityId: 'aaaaaaaa-0000-4000-8000-000000000001',
      versionId: 'bbbbbbbb-0000-4000-8000-000000000001',
      checkService: createMockCheckService({}),
    });
    return render(<ViewerContainer document={doc as never} store={store} />);
  };

  it('renders the appendix when the teacher turned it on', () => {
    // The fixture document carries a real defined term ("slope"), so this is
    // not vacuous — a glossary with nothing in it would render null and this
    // would fail.
    const { container } = renderDoc(true);
    const terms = Array.from(
      container.querySelectorAll('.viewer-glossary__term'),
    ).map((el) => el.textContent);
    expect(terms).toContain('slope');
  });

  it('renders nothing when the teacher left it off (the default)', () => {
    // Off by default on purpose: most worksheets do not want two extra pages.
    const { container } = renderDoc(false);
    expect(container.querySelector('.viewer-glossary')).toBeNull();
  });

  it('places the appendix AFTER every section', () => {
    // An appendix in the middle of the worksheet is not an appendix. The DOM
    // order is what the printed order will be.
    const { container } = renderDoc(true);
    const glossary = container.querySelector('.viewer-glossary');
    const sections = Array.from(container.querySelectorAll('.viewer-section'));
    const lastSection = sections[sections.length - 1];
    expect(glossary).not.toBeNull();
    expect(lastSection).toBeDefined();
    expect(
      (lastSection as Element).compareDocumentPosition(glossary as Node) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});

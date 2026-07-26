// Definition glossary appendix — the print surface for inline vocabulary
// definitions (docs/design/definition-rich-content.md, D4).
import { describe, it, expect } from 'vitest';
import { ActivityDocument } from '@activity/schema';
import {
  collectDefinitions,
  renderDefinitionGlossary,
} from '../src/definition-glossary.js';
import { renderActivity, renderActivityForPrint } from '../src/document.js';

const META = {
  title: 'T',
  course: 'Algebra I',
  submissionMode: 'free',
  revisionMode: 'free',
  gradingMode: 'auto',
  activityType: 'worksheet',
  skills: [],
} as const;

const def = (text: string) => ({
  type: 'definition',
  content: [{ type: 'paragraph', content: [{ type: 'text', text, marks: [] }] }],
});

const term = (text: string, definition: string) => ({
  type: 'text',
  text,
  marks: [def(definition)],
});

// Builds a document whose single paragraph holds the given inline nodes.
function docWith(
  inline: unknown[],
  print: Record<string, unknown> = {},
  extra: Record<string, unknown> = {},
) {
  return ActivityDocument.parse({
    schemaVersion: 2,
    meta: { ...META, print },
    sections: [
      {
        id: '11111111-1111-4111-8111-111111111111',
        isCheckpoint: false,
        rows: [
          {
            id: '22222222-2222-4222-8222-222222222222',
            columns: [
              {
                id: '33333333-3333-4333-8333-333333333333',
                blocks: [
                  {
                    id: '44444444-4444-4444-8444-444444444444',
                    type: 'paragraph',
                    content: inline,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    ...extra,
  });
}

describe('collectDefinitions', () => {
  it('collects every defined term, alphabetically', () => {
    const doc = docWith([
      term('slope', 'rise over run'),
      { type: 'text', text: ' and ', marks: [] },
      term('intercept', 'where it crosses'),
    ]);
    expect(collectDefinitions(doc).map((e) => e.term)).toEqual([
      'intercept',
      'slope',
    ]);
  });

  it('dedupes by term case-insensitively, first occurrence winning', () => {
    const doc = docWith([
      term('Factor', 'a divisor'),
      { type: 'text', text: ' ', marks: [] },
      term('factor', 'a DIFFERENT sense'),
    ]);
    const entries = collectDefinitions(doc);
    expect(entries).toHaveLength(1);
    expect(entries[0]?.term).toBe('Factor');
    expect(JSON.stringify(entries[0]?.content)).toContain('a divisor');
  });

  it('skips a definition with empty content (inert on screen too)', () => {
    const doc = docWith([
      { type: 'text', text: 'bare', marks: [{ type: 'definition', content: [] }] },
    ]);
    expect(collectDefinitions(doc)).toEqual([]);
  });

  it('finds definitions nested anywhere — a blank hint, a list, a callout', () => {
    // The structural walk is the whole point: these live in three different
    // shapes, none of which a block-level visitor would reach without being
    // taught about them individually.
    const doc = ActivityDocument.parse({
      schemaVersion: 2,
      meta: META,
      sections: [
        {
          id: '11111111-1111-4111-8111-111111111111',
          isCheckpoint: false,
          rows: [
            {
              id: '22222222-2222-4222-8222-222222222222',
              columns: [
                {
                  id: '33333333-3333-4333-8333-333333333333',
                  blocks: [
                    {
                      id: '44444444-4444-4444-8444-444444444444',
                      type: 'fill_in_blank',
                      content: [
                        {
                          type: 'blank',
                          id: '55555555-5555-4555-8555-555555555555',
                          answer: '2',
                          hint: [term('coefficient', 'the number in front')],
                        },
                      ],
                    },
                    {
                      id: '66666666-6666-4666-8666-666666666666',
                      type: 'bullet_list',
                      items: [
                        {
                          id: '77777777-7777-4777-8777-777777777777',
                          content: [term('vertex', 'the turning point')],
                        },
                      ],
                    },
                    {
                      id: '88888888-8888-4888-8888-888888888888',
                      type: 'callout',
                      variant: 'info',
                      content: [term('asymptote', 'a line it approaches')],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
    expect(collectDefinitions(doc).map((e) => e.term)).toEqual([
      'asymptote',
      'coefficient',
      'vertex',
    ]);
  });

  it('includes definitions authored in the reference panel', () => {
    const doc = docWith([{ type: 'text', text: 'body', marks: [] }], {}, {
      referencePanel: {
        blocks: [
          {
            id: '99999999-9999-4999-8999-999999999999',
            type: 'paragraph',
            content: [term('radian', 'an angle measure')],
          },
        ],
      },
    });
    expect(collectDefinitions(doc).map((e) => e.term)).toEqual(['radian']);
  });
});

describe('renderDefinitionGlossary', () => {
  it('renders a <dl> of terms and their block content', () => {
    const html = renderDefinitionGlossary(
      docWith([term('slope', 'rise over run')]),
    );
    expect(html).toContain('<aside class="definition-glossary"');
    expect(html).toContain('data-block-category="scaffold"');
    expect(html).toContain('<dt class="definition-glossary-term">slope</dt>');
    expect(html).toContain('rise over run');
  });

  it('escapes the term', () => {
    const html = renderDefinitionGlossary(
      docWith([term('a < b', 'less than')]),
    );
    expect(html).toContain('<dt class="definition-glossary-term">a &lt; b</dt>');
  });

  it('is empty when there are no definitions', () => {
    expect(
      renderDefinitionGlossary(docWith([{ type: 'text', text: 'x', marks: [] }])),
    ).toBe('');
  });
});

describe('printDefinitionGlossary gate', () => {
  it('is OFF by default — neither document emits the appendix', () => {
    const doc = docWith([term('slope', 'rise over run')]);
    expect(doc.meta.print.printDefinitionGlossary).toBe(false);
    // Match the ELEMENT, not the bare string: the stylesheet always carries the
    // `.definition-glossary { display: none }` rule whether or not it is used.
    expect(renderActivity(doc, {})).not.toContain('class="definition-glossary"');
    expect(renderActivityForPrint(doc, {})).not.toContain(
      'class="definition-glossary"',
    );
  });

  it('emits the appendix in both documents when turned on', () => {
    const doc = docWith([term('slope', 'rise over run')], {
      printDefinitionGlossary: true,
    });
    expect(renderActivity(doc, {})).toContain('class="definition-glossary"');
    expect(renderActivityForPrint(doc, {})).toContain(
      'class="definition-glossary"',
    );
  });

  it('the published page places the appendix after the body, before submit', () => {
    const html = renderActivity(
      docWith([term('slope', 'rise over run')], {
        printDefinitionGlossary: true,
      }),
      {},
    );
    const at = html.indexOf('<aside class="definition-glossary"');
    expect(at).toBeGreaterThan(html.indexOf('<section class="activity-section"'));
    expect(at).toBeLessThan(html.indexOf('<div class="submit-area">'));
  });
});

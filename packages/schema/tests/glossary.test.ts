import { describe, expect, it } from 'vitest';
import {
  buildGlossaryIndex,
  crossLinkTargets,
  definitionPlainText,
  entryForMark,
  findFolded,
  foldText,
  GLOSSARY_LINK_MARK,
  linkify,
  localEntryId,
  parseGlossaryBody,
  parseGlossaryVariants,
  resolveTerm,
  searchGlossary,
  snippetAround,
  suggestTerm,
  termKey,
  type DefinitionBlock,
  type GlossarySourceEntry,
} from '../src/index.js';

const para = (text: string): DefinitionBlock => ({
  type: 'paragraph',
  content: [{ type: 'text', text, marks: [] }],
});

const store = (
  id: string,
  term: string,
  body: string,
  extra: Partial<GlossarySourceEntry> = {},
): GlossarySourceEntry => ({
  id,
  term,
  variants: {},
  body: [para(body)],
  retired: false,
  source: 'store',
  ...extra,
});

const local = (term: string, body: string): GlossarySourceEntry => ({
  id: localEntryId(term),
  term,
  variants: {},
  body: [para(body)],
  retired: false,
  source: 'local',
});

describe('folding', () => {
  it('folds case and diacritics, and termKey collapses whitespace', () => {
    expect(foldText('Écart')).toBe('ecart');
    expect(termKey('  Unit   Rate ')).toBe('unit rate');
  });

  it('maps a folded match back to the ORIGINAL characters', () => {
    expect(findFolded('The Écart here', 'ecart')).toEqual([4, 9]);
  });

  it('folds every typographic dash to a plain hyphen (curriculum v2 ask 1)', () => {
    for (const dash of ['\u2010', '\u2011', '\u2012', '\u2013', '\u2014', '\u2015', '\u2212', '\uFE58', '\uFE63', '\uFF0D']) {
      expect(termKey(`Point${dash}gradient form`)).toBe('point-gradient form');
    }
    // One character in, one out: the highlight still lands on the original.
    expect(findFolded('Use point–gradient form', 'point-gradient')).toEqual([4, 18]);
  });

  it('an en-dashed reference resolves to its hyphenated entry, both ways', () => {
    const entries = [{ id: 'pg', term: 'point-gradient form', variants: {} }];
    expect(resolveTerm('point–gradient form', new Set(), entries)).toMatchObject({ kind: 'store' });
    const dashed = [{ id: 'pg', term: 'point—gradient form', variants: {} }];
    expect(resolveTerm('point-gradient form', new Set(), dashed)).toMatchObject({ kind: 'store' });
  });
});

describe('resolveTerm (EN-3: one resolver, local wins structurally)', () => {
  const gradient = { id: 'gradient', term: 'gradient', variants: { us: 'slope' } };
  const entries = [gradient, { id: 'rate', term: 'rate', variants: {} }];

  it('a term named by a local definition is local', () => {
    expect(resolveTerm('Rate', new Set(['rate']), entries)).toEqual({
      kind: 'local',
      localKey: 'rate',
    });
  });

  it('resolves to the store by term and by variant', () => {
    expect(resolveTerm('Gradient', new Set(), entries)).toMatchObject({
      kind: 'store',
      entry: { id: 'gradient' },
    });
    expect(resolveTerm('slope', new Set(), entries)).toMatchObject({
      kind: 'store',
      entry: { id: 'gradient' },
    });
  });

  it('[[slope]] with a LOCAL gradient resolves to the local definition', () => {
    expect(resolveTerm('slope', new Set(['gradient']), entries)).toEqual({
      kind: 'local',
      localKey: 'gradient',
    });
  });

  it('a match on a retired entry alone is unresolved', () => {
    const retired = [{ ...gradient, retired: true }];
    expect(resolveTerm('gradient', new Set(), retired)).toEqual({ kind: 'none' });
  });

  it('nothing matching is unresolved', () => {
    expect(resolveTerm('median', new Set(), entries)).toEqual({ kind: 'none' });
  });
});

describe('buildGlossaryIndex (R15)', () => {
  it('a local definition hides the store entry it matches by term or variant', () => {
    const index = buildGlossaryIndex(
      [
        store('gradient', 'gradient', 'rise over run', { variants: { us: 'slope' } }),
        store('rate', 'rate', 'a comparison'),
      ],
      [local('Slope', 'our own words')],
    );
    expect(index.visible.map((e) => e.id)).toEqual(['rate', 'local:slope']);
    expect(index.hiddenBy.get('gradient')).toBe('local:slope');
    // The keyed mark opens the LOCAL definition — one body in one activity.
    expect(entryForMark(index, { glossaryKey: 'gradient', text: 'gradient' })?.id).toBe(
      'local:slope',
    );
  });

  it('retired entries are addressable by id but never visible', () => {
    const index = buildGlossaryIndex(
      [store('old', 'ratio', 'x', { retired: true })],
      [],
    );
    expect(index.visible).toHaveLength(0);
    expect(entryForMark(index, { glossaryKey: 'old', text: 'ratio' })?.term).toBe('ratio');
  });

  it('local entries dedupe by term, first wins; list is A→Z', () => {
    const index = buildGlossaryIndex(
      [store('b', 'Beta', 'x')],
      [local('alpha', 'first'), local('Alpha', 'second')],
    );
    expect(index.visible.map((e) => e.term)).toEqual(['alpha', 'Beta']);
    expect(definitionPlainText(index.byId.get('local:alpha')!.body)).toBe('first');
  });
});

describe('searchGlossary (D4 tiers, R11 variant tier, R14 body text)', () => {
  const index = buildGlossaryIndex(
    [
      store('gradient', 'gradient', 'How steep a line is.', { variants: { us: 'slope' } }),
      store('grade', 'grade', 'A mark.'),
      store('upgrade', 'upgrade', 'Improve it.'),
      store('rate', 'rate', 'Compares quantities; see the gradient of a graph.'),
      store('rise', 'rise', '', {
        body: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Vertical change ', marks: [] },
              { type: 'math_inline', latex: 'x' },
              { type: 'text', text: '.', marks: [] },
            ],
          },
        ],
      }),
    ],
    [],
  );

  it('empty query lists every visible entry A→Z', () => {
    expect(searchGlossary(index, '').map((r) => r.entry.term)).toEqual([
      'grade',
      'gradient',
      'rate',
      'rise',
      'upgrade',
    ]);
  });

  it('ranks name-prefix, then name-substring, then word in the definition', () => {
    const results = searchGlossary(index, 'grad');
    expect(results.map((r) => [r.entry.term, r.tier])).toEqual([
      ['grade', 0],
      ['gradient', 0],
      ['upgrade', 1],
      ['rate', 2],
    ]);
  });

  it('a variant ranks in its term\'s tier and names the variant that matched', () => {
    const [hit] = searchGlossary(index, 'Slo');
    expect(hit?.entry.id).toBe('gradient');
    expect(hit?.tier).toBe(0);
    expect(hit?.name?.locale).toBe('us');
    expect(hit?.nameRange).toEqual([0, 3]);
  });

  it('diacritics fold: an accented query still matches', () => {
    expect(searchGlossary(index, 'RÍSE')[0]?.entry.id).toBe('rise');
  });

  it('math never matches and never reaches a snippet as raw LaTeX', () => {
    expect(searchGlossary(index, 'x')).toEqual([]);
    const snippet = searchGlossary(index, 'vertical')[0]?.snippet;
    expect(snippet?.text).toContain('…');
    expect(snippet?.text).not.toContain('$');
  });

  it('definition-tier matches start at a word, with a highlight range', () => {
    const hit = searchGlossary(index, 'steep')[0];
    expect(hit?.tier).toBe(2);
    const snip = hit!.snippet!;
    expect(snip.text.slice(snip.range[0], snip.range[1])).toBe('steep');
    expect(searchGlossary(index, 'teep')).toEqual([]);
  });

  it('snippets window long text with ellipses', () => {
    const text = `${'a '.repeat(80)}target${' b'.repeat(80)}`;
    const at = text.indexOf('target');
    const s = snippetAround(text, [at, at + 6]);
    expect(s.text.startsWith('…')).toBe(true);
    expect(s.text.endsWith('…')).toBe(true);
    expect(s.text.slice(s.range[0], s.range[1])).toBe('target');
  });
});

describe('suggestTerm (W-8)', () => {
  it('allows distance 1 for short words and 2 for longer', () => {
    expect(suggestTerm('rat', ['rate'])).toBe('rate');
    expect(suggestTerm('rt', ['rate'])).toBeNull();
    expect(suggestTerm('gradinet', ['gradient'])).toBe('gradient');
  });

  it('says nothing when two candidates tie', () => {
    expect(suggestTerm('sin', ['sine', 'sing'])).toBeNull();
  });
});

describe('linkify (D3 rules, placed at render per UC1)', () => {
  const index = buildGlossaryIndex(
    [
      store('rate', 'rate', 'x'),
      store('unit-rate', 'unit rate', 'x'),
      store('gradient', 'gradient', 'x', { variants: { us: 'slope' } }),
    ],
    [],
  );
  const linksIn = (blocks: DefinitionBlock[]) =>
    JSON.stringify(blocks).match(new RegExp(GLOSSARY_LINK_MARK, 'g'))?.length ?? 0;

  it('links the first whole-word occurrence only, longest name first', () => {
    const body = [para('A unit rate is a rate; another rate and irate do not link.')];
    const out = linkify(body, index, 'gradient');
    expect(crossLinkTargets(body, index, 'gradient')).toEqual(['unit-rate', 'rate']);
    expect(linksIn(out)).toBe(2);
    const runs = (out[0] as { content: { text: string; marks: { type: string }[] }[] })
      .content;
    const linked = runs.filter((r) => r.marks.some((m) => m.type === GLOSSARY_LINK_MARK));
    expect(linked.map((r) => r.text)).toEqual(['unit rate', 'rate']);
  });

  it('never links to itself, even through a variant', () => {
    expect(crossLinkTargets([para('The slope is the gradient.')], index, 'gradient')).toEqual(
      [],
    );
  });

  it('links a variant to its entry and leaves math and code alone', () => {
    const body: DefinitionBlock[] = [
      {
        type: 'paragraph',
        content: [
          { type: 'math_inline', latex: 'rate' },
          { type: 'text', text: 'rate', marks: [{ type: 'code' }] },
          { type: 'text', text: ' and the slope', marks: [] },
        ],
      },
    ];
    expect(crossLinkTargets(body, index, 'unit-rate')).toEqual(['gradient']);
  });

  it('reaches list items and never mutates its input', () => {
    const body: DefinitionBlock[] = [
      { type: 'bullet_list', items: [{ content: [{ type: 'text', text: 'a rate', marks: [] }] }] },
    ];
    const before = JSON.stringify(body);
    expect(crossLinkTargets(body, index, 'gradient')).toEqual(['rate']);
    expect(JSON.stringify(body)).toBe(before);
  });
});

describe('parseGlossaryBody (EN-8: store bodies skip the server sanitize)', () => {
  it('accepts a definition body', () => {
    expect(parseGlossaryBody([para('ok')])).toHaveLength(1);
  });

  it('rejects a prompted math_inline — a gradeable gap would leak its answer', () => {
    const body = [
      {
        type: 'paragraph',
        content: [
          { type: 'math_inline', latex: 'x=\\placeholder[p]{}', prompts: [{ id: 'p', answer: '3' }] },
        ],
      },
    ];
    expect(parseGlossaryBody(body)).toBeNull();
  });

  it('rejects a blank token and anything that is not a body', () => {
    const blank = [{ type: 'paragraph', content: [{ type: 'blank', id: 'b', answer: '3' }] }];
    expect(parseGlossaryBody(blank)).toBeNull();
    expect(parseGlossaryBody({ nope: true })).toBeNull();
  });

  it('keeps only known locales with non-empty strings (W-3)', () => {
    expect(parseGlossaryVariants({ us: ' slope ', uk: 'x', au: '' })).toEqual({ us: 'slope' });
    expect(parseGlossaryVariants('us')).toEqual({});
  });
});

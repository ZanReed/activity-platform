// =============================================================================
// nested-lists.test.tsx — a sub-bullet a teacher typed reaches the student
// -----------------------------------------------------------------------------
// `ListItem.children` was the quietest of the S9 orphans. The editor indents on
// Tab, the serializer emits `children`, `serialize.test.ts` proves the round
// trip in BOTH directions, the importer builds nesting from indented markdown,
// and the print glossary has been rendering nested lists correctly the whole
// time. Only the two body-list components never recursed — so a teacher could
// type a sub-bullet, watch it save, reload it intact, and every student saw a
// flat list. Nothing in the suite noticed, because nothing asserted the DOM.
//
// These bind to rendered output: the nested <ul> exists inside its parent's
// <li>, and the text of the deeper item is on the page. A test that compared
// the schema field to the serializer's output would have passed throughout the
// eight days the feature was dead.
// =============================================================================

import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import BulletList from '../../src/blocks/BulletList.js';
import OrderedList from '../../src/blocks/OrderedList.js';
import { MAX_INDENT_DEPTH } from '../../src/blocks/NestedList.js';

const t = (text: string) => ({ type: 'text', text, marks: [] });

/** Outer list, one item, whose child list holds `inner`. */
const nested = (type: 'bullet_list' | 'ordered_list', inner: string) => ({
  id: 'l-1',
  type,
  items: [
    {
      id: 'i-1',
      content: [t('Label both axes.')],
      children: [
        {
          id: 'l-2',
          type,
          items: [{ id: 'i-2', content: [t(inner)] }],
        },
      ],
    },
    { id: 'i-3', content: [t('Plot the y-intercept.')] },
  ],
});

describe('nested lists reach the page', () => {
  it('renders a nested BULLET list inside its parent item', () => {
    const { container } = render(
      <BulletList mode="screen" block={nested('bullet_list', 'Mark the scale.') as never} />,
    );

    // Two lists, not one: the flattening bug produced exactly one.
    expect(container.querySelectorAll('ul.viewer-list')).toHaveLength(2);
    // The nested list is a SIBLING of its item's text inside the same <li> —
    // the HTML-correct placement, and the shape serialize.ts round-trips.
    const nestedList = container.querySelector('li.viewer-list__item > ul.viewer-list');
    expect(nestedList, 'the child list is not inside its parent <li>').not.toBeNull();
    // CONTENT, not existence: the deeper item's words are actually on the page.
    expect(nestedList?.textContent).toContain('Mark the scale.');
  });

  it('renders a nested ORDERED list, and mixes types freely', () => {
    const { container } = render(
      <OrderedList
        mode="screen"
        block={
          {
            id: 'l-1',
            type: 'ordered_list',
            items: [
              {
                id: 'i-1',
                content: [t('Find the slope.')],
                // Schema allows any mix at any depth — a numbered step whose
                // sub-points are bullets is ordinary worksheet prose.
                children: [
                  { id: 'l-2', type: 'bullet_list', items: [{ id: 'i-2', content: [t('Count the rise.')] }] },
                ],
              },
            ],
          } as never
        }
      />,
    );

    expect(container.querySelector('ol.viewer-list')).not.toBeNull();
    const inner = container.querySelector('li.viewer-list__item > ul.viewer-list');
    expect(inner?.textContent).toContain('Count the rise.');
  });

  it('marks each level with its depth, so the marker cascade can differ (B1)', () => {
    const { container } = render(
      <BulletList mode="screen" block={nested('bullet_list', 'Mark the scale.') as never} />,
    );
    const lists = Array.from(container.querySelectorAll('ul.viewer-list'));
    expect(lists.map((el) => el.getAttribute('data-depth'))).toEqual(['1', '2']);
  });

  it('stops compounding the indent past level 3 (B3)', () => {
    // Four levels deep. Depth is unbounded by schema, editor, importer and
    // serializer alike, and teachers paste four- and five-deep outlines out of
    // lesson plans — left to compound, a level-6 item's text column shrinks
    // toward a one-word-per-line ribbon on paper. The editor never shows that
    // failure because it does not use the print column width.
    const deep = {
      id: 'l-1',
      type: 'bullet_list',
      items: [
        {
          id: 'i-1',
          content: [t('one')],
          children: [
            {
              id: 'l-2',
              type: 'bullet_list',
              items: [
                {
                  id: 'i-2',
                  content: [t('two')],
                  children: [
                    {
                      id: 'l-3',
                      type: 'bullet_list',
                      items: [
                        {
                          id: 'i-3',
                          content: [t('three')],
                          children: [
                            {
                              id: 'l-4',
                              type: 'bullet_list',
                              items: [{ id: 'i-4', content: [t('four')] }],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const { container } = render(<BulletList mode="screen" block={deep as never} />);
    const depths = Array.from(container.querySelectorAll('ul.viewer-list')).map((el) =>
      el.getAttribute('data-depth'),
    );
    // Four real levels render — the tree is NOT truncated…
    expect(container.textContent).toContain('four');
    expect(depths).toHaveLength(4);
    // …but the depth attribute the stylesheet keys off saturates, so level 4
    // reuses level 3's indent instead of marching further right.
    expect(depths).toEqual(['1', '2', '3', String(MAX_INDENT_DEPTH)]);
  });

  it('a flat list still renders flat (no phantom nesting)', () => {
    const { container } = render(
      <BulletList
        mode="screen"
        block={
          {
            id: 'l-1',
            type: 'bullet_list',
            items: [{ id: 'i-1', content: [t('alone')] }],
          } as never
        }
      />,
    );
    expect(container.querySelectorAll('ul.viewer-list')).toHaveLength(1);
    expect(container.querySelector('li.viewer-list__item > ul.viewer-list')).toBeNull();
  });
});

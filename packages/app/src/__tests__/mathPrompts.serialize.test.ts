// =============================================================================
// mathPrompts.serialize.test.ts — Model A editor serialize round-trip (MA-T7)
// -----------------------------------------------------------------------------
// The `prompts` attr on mathBlock / mathInline must survive both directions
// (tiptapToActivity emit + activityToTiptap load) and stay off a plain equation
// entirely (byte-identity). Malformed prompt entries are dropped.
// =============================================================================

import { describe, it, expect } from 'vitest';
import { ActivityMeta } from '@activity/schema';
import { activityToTiptap, tiptapToActivity } from '../lib/serialize';
import type { JSONContent } from '@tiptap/react';

const META = ActivityMeta.parse({ title: 'T', course: 'Algebra II' });

const firstBlock = (doc: JSONContent) =>
  tiptapToActivity(doc, META).sections[0]!.rows[0]!.columns[0]!.blocks[0]!;

describe('math_block prompts — serialize', () => {
  it('emits prompts on a mathBlock that carries them', () => {
    const doc: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'mathBlock',
          attrs: {
            latex: 'x=\\frac{-b}{\\placeholder[denom]{}}',
            prompts: [
              { id: 'denom', answer: '2a', acceptableAnswers: ['a+a'] },
            ],
          },
        },
      ],
    };
    const block = firstBlock(doc) as { type: string; prompts?: unknown };
    expect(block.type).toBe('math_block');
    expect(block.prompts).toEqual([
      { id: 'denom', answer: '2a', acceptableAnswers: ['a+a'] },
    ]);
  });

  it('emits NO prompts key on a plain equation (byte-identity)', () => {
    const doc: JSONContent = {
      type: 'doc',
      content: [{ type: 'mathBlock', attrs: { latex: 'x = 4' } }],
    };
    const block = firstBlock(doc);
    expect('prompts' in block).toBe(false);
  });

  it('drops a malformed prompt entry (missing answer)', () => {
    const doc: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'mathBlock',
          attrs: {
            latex: '\\placeholder[g]{}',
            prompts: [{ id: 'g' /* no answer */ }, { id: 'h', answer: 'x' }],
          },
        },
      ],
    };
    const block = firstBlock(doc) as { prompts?: Array<{ id: string }> };
    expect(block.prompts?.map((p) => p.id)).toEqual(['h']);
  });

  it('round-trips prompts through activityToTiptap (load back into the editor)', () => {
    const doc: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'mathBlock',
          attrs: {
            latex: 'x=\\placeholder[d]{}',
            prompts: [
              { id: 'd', answer: '2a', acceptableAnswers: [], equivalence: 'exact-form', tolerance: 0.01 },
            ],
          },
        },
      ],
    };
    const back = activityToTiptap(tiptapToActivity(doc, META));
    // Find the mathBlock anywhere in the reloaded tree.
    const json = JSON.stringify(back);
    expect(json).toContain('"id":"d"');
    expect(json).toContain('"equivalence":"exact-form"');
    expect(json).toContain('"tolerance":0.01');
  });
});

describe('math_inline prompts — serialize', () => {
  it('emits prompts on inline math and omits them when absent', () => {
    const withGap: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'mathInline',
              attrs: {
                latex: '\\placeholder[g]{}+1',
                prompts: [{ id: 'g', answer: 'x', acceptableAnswers: [] }],
              },
            },
          ],
        },
      ],
    };
    const para = firstBlock(withGap) as {
      content: Array<{ type: string; prompts?: unknown }>;
    };
    const inline = para.content.find((n) => n.type === 'math_inline')!;
    expect(inline.prompts).toEqual([
      { id: 'g', answer: 'x', acceptableAnswers: [] },
    ]);

    const plain: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'mathInline', attrs: { latex: 'y=x^2' } }],
        },
      ],
    };
    const para2 = firstBlock(plain) as {
      content: Array<{ type: string; prompts?: unknown }>;
    };
    const inline2 = para2.content.find((n) => n.type === 'math_inline')!;
    expect('prompts' in inline2).toBe(false);
  });
});

// =============================================================================
// math-prompts.test.ts — Model A: in-equation math blanks (MA-T1, schema slice)
// -----------------------------------------------------------------------------
// The `prompts` field is additive and OPTIONAL WITH NO DEFAULT on both math
// nodes (math_inline + math_block). The load-bearing guarantee — the CRITICAL
// regression pin from the eng review — is byte-identity: a math node authored
// before Model A (no `prompts` key) must re-serialize UNCHANGED, so every
// already-published activity keeps its exact bytes. The rest exercises the
// MathPrompt shape (id/answer required, acceptableAnswers defaulted, equivalence
// enum, non-negative tolerance) and union membership. See
// docs/design/math-blanks.md (Model A, MA-D8 + CRITICAL pin).
// =============================================================================

import { describe, it, expect } from 'vitest';
import {
  InlineMathNode,
  MathBlock,
  MathPrompt,
  InlineNode,
} from '../src/index.js';

const uuid = () => crypto.randomUUID();

describe('MathPrompt', () => {
  it('parses a minimal prompt and defaults acceptableAnswers to []', () => {
    const parsed = MathPrompt.parse({ id: 'gap1', answer: '2a' });
    expect(parsed.acceptableAnswers).toEqual([]);
    expect(parsed.equivalence).toBeUndefined();
    expect(parsed.tolerance).toBeUndefined();
  });

  it('carries equivalence, tolerance, and alternative answers', () => {
    const parsed = MathPrompt.parse({
      id: 'denom',
      answer: '2a',
      acceptableAnswers: ['a+a', 'a*2'],
      equivalence: 'exact-form',
      tolerance: 0.01,
    });
    expect(parsed.acceptableAnswers).toEqual(['a+a', 'a*2']);
    expect(parsed.equivalence).toBe('exact-form');
    expect(parsed.tolerance).toBe(0.01);
  });

  it('rejects an empty id or empty answer', () => {
    expect(MathPrompt.safeParse({ id: '', answer: '2a' }).success).toBe(false);
    expect(MathPrompt.safeParse({ id: 'g', answer: '' }).success).toBe(false);
  });

  it('rejects an unknown equivalence mode and a negative tolerance', () => {
    expect(
      MathPrompt.safeParse({ id: 'g', answer: '2a', equivalence: 'symbolic' })
        .success,
    ).toBe(false);
    expect(
      MathPrompt.safeParse({ id: 'g', answer: '2a', tolerance: -1 }).success,
    ).toBe(false);
  });
});

describe('math_inline prompts (Model A)', () => {
  it('accepts a math_inline node carrying a prompt', () => {
    const node = {
      type: 'math_inline' as const,
      latex: 'x = \\frac{-b}{\\placeholder[denom]{}}',
      prompts: [{ id: 'denom', answer: '2a' }],
    };
    const result = InlineMathNode.safeParse(node);
    expect(result.success).toBe(true);
  });

  it('a prompt-carrying math_inline is a valid member of the InlineNode union', () => {
    const node = {
      type: 'math_inline',
      latex: '\\placeholder[g]{} + 1',
      prompts: [{ id: 'g', answer: 'x' }],
    };
    expect(InlineNode.safeParse(node).success).toBe(true);
  });

  // CRITICAL regression pin (IRON RULE): a math_inline with NO prompts must
  // re-serialize byte-identically — no `prompts` key materialized on read.
  it('CRITICAL: a prompt-free math_inline re-serializes byte-identically', () => {
    const legacy = { type: 'math_inline' as const, latex: 'a^2 + b^2 = c^2' };
    const parsed = InlineMathNode.parse(legacy);
    expect('prompts' in parsed).toBe(false);
    expect(JSON.stringify(parsed)).toBe(JSON.stringify(legacy));
    // Also holds when parsed through the InlineNode union.
    expect(JSON.stringify(InlineNode.parse(legacy))).toBe(
      JSON.stringify(legacy),
    );
  });
});

describe('math_block prompts (Model A)', () => {
  it('accepts a math_block node carrying a prompt', () => {
    const block = {
      id: uuid(),
      type: 'math_block' as const,
      latex: 'x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{\\placeholder[denom]{}}',
      prompts: [{ id: 'denom', answer: '2a', equivalence: 'value' as const }],
    };
    expect(MathBlock.safeParse(block).success).toBe(true);
  });

  // CRITICAL regression pin (IRON RULE): a math_block with NO prompts must
  // re-serialize byte-identically — the additive field can't perturb the
  // millions of already-published equation blocks.
  it('CRITICAL: a prompt-free math_block re-serializes byte-identically', () => {
    const legacy = { id: uuid(), type: 'math_block' as const, latex: 'x = 4' };
    const parsed = MathBlock.parse(legacy);
    expect('prompts' in parsed).toBe(false);
    expect(JSON.stringify(parsed)).toBe(JSON.stringify(legacy));
  });
});

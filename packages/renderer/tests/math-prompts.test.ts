// =============================================================================
// math-prompts.test.ts — Model A in-equation blanks: renderer emission (MA-T2)
// -----------------------------------------------------------------------------
// Verifies the SWAP-way emission: static KaTeX boxed gaps + the raw latex on
// data-math-prompt-latex (for the kit mount) + hidden mirror inputs carrying the
// Model B blank contract verbatim. Plus the CRITICAL render-level byte-identity
// pin: a prompt-free math node emits none of the new markup.
// =============================================================================

import { describe, it, expect } from 'vitest';
import {
  createEmptyDocument,
  createMathBlock,
  createParagraphBlock,
} from '@activity/schema';
import { renderBody } from '../src/index.js';
import {
  preprocessPromptLatex,
  renderMathPromptMirrors,
  hasMathPrompts,
} from '../src/math-prompts.js';

const prompt = (over: Record<string, unknown> = {}) => ({
  id: 'denom',
  answer: '2a',
  acceptableAnswers: [] as string[],
  ...over,
});

describe('preprocessPromptLatex', () => {
  it('rewrites a placeholder marker into a KaTeX-safe boxed gap sized to the answer', () => {
    const out = preprocessPromptLatex('\\frac{-b}{\\placeholder[denom]{}}', [
      prompt({ answer: '2a' }),
    ]);
    expect(out).not.toContain('\\placeholder');
    expect(out).toContain('\\boxed{\\phantom{00}}'); // 2-char answer → 2 glyphs
  });

  it('gives an orphan marker (no matching prompt) the minimum-width box', () => {
    const out = preprocessPromptLatex('\\placeholder[x]{}', []);
    expect(out).toBe('\\boxed{\\phantom{00}}');
  });

  it('clamps the gap width for a long answer', () => {
    const out = preprocessPromptLatex('\\placeholder[g]{}', [
      prompt({ id: 'g', answer: 'x'.repeat(40) }),
    ]);
    expect(out).toContain('\\phantom{' + '0'.repeat(12) + '}'); // clamped to 12
  });
});

describe('renderMathPromptMirrors', () => {
  it('emits the Model B blank contract for each prompt, pipe-joining alternatives', () => {
    const html = renderMathPromptMirrors([
      prompt({ answer: '2a', acceptableAnswers: ['a+a'] }),
    ]);
    expect(html).toContain('class="blank math-prompt-blank"');
    expect(html).toContain('data-blank-id="denom"');
    expect(html).toContain('data-blank-answers="2a|a+a"');
    expect(html).toContain('data-blank-strategy="math"');
    expect(html).toContain('hidden'); // the whole mirror group is hidden
  });

  it('emits equivalence only for exact-form and tolerance only when set', () => {
    const exact = renderMathPromptMirrors([
      prompt({ equivalence: 'exact-form', tolerance: 0.01 }),
    ]);
    expect(exact).toContain('data-blank-equivalence="exact-form"');
    expect(exact).toContain('data-blank-tolerance="0.01"');

    const plain = renderMathPromptMirrors([prompt()]);
    expect(plain).not.toContain('data-blank-equivalence');
    expect(plain).not.toContain('data-blank-tolerance');
  });
});

describe('hasMathPrompts', () => {
  it('is true only for a non-empty prompts array', () => {
    expect(hasMathPrompts(undefined)).toBe(false);
    expect(hasMathPrompts([])).toBe(false);
    expect(hasMathPrompts([prompt()])).toBe(true);
  });
});

describe('math_block emission (renderBody)', () => {
  const docWith = (block: unknown) => {
    const doc = createEmptyDocument({ title: 'T' });
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [block as never];
    return doc;
  };

  it('emits the SWAP contract: data-math-prompt-latex, a boxed gap, and a mirror input', () => {
    const block = Object.assign(createMathBlock(), {
      latex: 'x = \\frac{-b}{\\placeholder[denom]{}}',
      prompts: [prompt({ id: 'denom', answer: '2a' })],
    });
    const body = renderBody(docWith(block));
    expect(body).toContain('data-block-type="math_block"');
    expect(body).toContain('has-math-prompts');
    // The \boxed{\phantom{}} gap is standard KaTeX — it renders, not errors.
    expect(body).toContain('class="katex');
    expect(body).not.toContain('katex-error');
    expect(body).not.toContain('math-error');
    // Raw latex (markers intact) rides the attr for the kit to mount MathLive.
    expect(body).toContain('data-math-prompt-latex=');
    expect(body).toContain('placeholder[denom]');
    // The hidden mirror input carries the grading key; the answer is NOT shown
    // as a visible value on the static render (only the boxed phantom is).
    expect(body).toContain('data-blank-strategy="math"');
    expect(body).toContain('data-blank-answers="2a"');
  });

  // CRITICAL render-level byte-identity pin: a prompt-free math block emits the
  // exact legacy markup — none of the Model A additions leak in.
  it('CRITICAL: a prompt-free math_block emits no Model A markup', () => {
    const block = Object.assign(createMathBlock(), { latex: 'x = 4' });
    const body = renderBody(docWith(block));
    expect(body).toContain('class="block block-math"');
    expect(body).not.toContain('has-math-prompts');
    expect(body).not.toContain('data-math-prompt-latex');
    expect(body).not.toContain('math-prompt-mirrors');
  });
});

describe('math_inline emission (renderBody)', () => {
  it('wraps inline math with a gap in a marker span carrying the raw latex', () => {
    const doc = createEmptyDocument({ title: 'T' });
    const para = Object.assign(createParagraphBlock(), {
      content: [
        { type: 'text', text: 'Fill it: ', marks: [] },
        {
          type: 'math_inline',
          latex: '\\placeholder[g]{} + 1',
          prompts: [prompt({ id: 'g', answer: 'x' })],
        },
      ],
    });
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [para as never];
    const body = renderBody(doc);
    expect(body).toContain('math-inline has-math-prompts');
    expect(body).toContain('data-math-prompt-latex=');
    expect(body).toContain('data-blank-id="g"');
  });

  it('CRITICAL: prompt-free inline math stays a bare KaTeX span', () => {
    const doc = createEmptyDocument({ title: 'T' });
    const para = Object.assign(createParagraphBlock(), {
      content: [{ type: 'math_inline', latex: 'y = x^2' }],
    });
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [para as never];
    const body = renderBody(doc);
    expect(body).not.toContain('has-math-prompts');
    expect(body).not.toContain('data-math-prompt-latex');
  });
});

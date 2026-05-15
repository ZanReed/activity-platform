import { describe, it, expect } from 'vitest';
import {
  createEmptyDocument,
  createParagraphBlock,
  createHeadingBlock,
  createMathBlock,
  createImageBlock,
  createCalloutBlock,
  createProblemBlock,
  createFillInBlankBlock,
  createBlankToken,
  createSection,
} from '@activity/schema';
import { renderActivity, renderBody, type RenderContext } from '../src/index.js';

const ctx: RenderContext = {
  activityId: '00000000-0000-0000-0000-000000000001',
  versionNum: 1,
  submissionEndpoint: 'https://example.com/submit',
};

describe('renderActivity (full document)', () => {
  it('produces a valid HTML5 document', () => {
    const doc = createEmptyDocument({ title: 'Test' });
    const html = renderActivity(doc, ctx);
    expect(html.startsWith('<!DOCTYPE html>')).toBe(true);
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('</html>');
  });

  it('includes the activity title in <title> and <h1>', () => {
    const doc = createEmptyDocument({ title: 'Logarithms' });
    const html = renderActivity(doc, ctx);
    expect(html).toContain('<title>Logarithms</title>');
    expect(html).toContain('<h1>Logarithms</h1>');
  });

  it('escapes HTML in the activity title', () => {
    const doc = createEmptyDocument({ title: '<script>alert(1)</script>' });
    const html = renderActivity(doc, ctx);
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('embeds the activity config as JSON', () => {
    const doc = createEmptyDocument({ title: 'Test' });
    const html = renderActivity(doc, ctx);
    expect(html).toContain('id="activity-config"');
    expect(html).toContain('"activityId":"00000000-0000-0000-0000-000000000001"');
    expect(html).toContain('"submissionEndpoint":"https://example.com/submit"');
  });

  it('includes the runtime JS', () => {
    const doc = createEmptyDocument({ title: 'Test' });
    const html = renderActivity(doc, ctx);
    expect(html).toContain('STORAGE_KEY_NAME');
  });

  it('includes the identity prompt and submit button', () => {
    const doc = createEmptyDocument({ title: 'Test' });
    const html = renderActivity(doc, ctx);
    expect(html).toContain('id="student-name"');
    expect(html).toContain('class="submit-button"');
  });
});

describe('renderBody (body fragment only)', () => {
  it('produces no <html>/<body> wrapper', () => {
    const doc = createEmptyDocument({ title: 'Test' });
    const body = renderBody(doc);
    expect(body).not.toContain('<html');
    expect(body).not.toContain('<body');
    expect(body).not.toContain('<!DOCTYPE');
  });

  it('renders all block types', () => {
    const doc = createEmptyDocument({ title: 'All blocks' });
    const blank = createBlankToken('42');
    const fillIn = createFillInBlankBlock();
    fillIn.content = [
      { type: 'text', text: 'The answer is ', marks: [] },
      blank,
    ];
    doc.sections[0]!.blocks = [
      Object.assign(createParagraphBlock(), {
        content: [{ type: 'text', text: 'A paragraph.', marks: [] }],
      }),
      Object.assign(createHeadingBlock(2), {
        content: [{ type: 'text', text: 'A heading', marks: [] }],
      }),
      Object.assign(createMathBlock(), { latex: 'x^2' }),
      createImageBlock('https://example.com/img.png', 'a picture'),
      Object.assign(createCalloutBlock('warning'), {
        content: [{ type: 'text', text: 'Heads up.', marks: [] }],
      }),
      Object.assign(createProblemBlock(), {
        content: [{ type: 'text', text: 'Solve for x.', marks: [] }],
      }),
      fillIn,
    ];
    const body = renderBody(doc);
    expect(body).toContain('class="block block-paragraph"');
    expect(body).toContain('class="block block-heading');
    expect(body).toContain('class="block block-math"');
    expect(body).toContain('class="block block-image"');
    expect(body).toContain('block-callout-warning');
    expect(body).toContain('class="block block-problem"');
    expect(body).toContain('class="block block-fill-in-blank"');
    expect(body).toContain('class="blank"');
  });
});

describe('Inline rendering', () => {
  it('applies marks in stable order', () => {
    const doc = createEmptyDocument({ title: 'T' });
    doc.sections[0]!.blocks = [
      Object.assign(createParagraphBlock(), {
        content: [
          { type: 'text', text: 'styled', marks: ['bold', 'italic'] },
        ],
      }),
    ];
    const body = renderBody(doc);
    expect(body).toContain('<strong>');
    expect(body).toContain('<em>');
  });

  it('escapes text content', () => {
    const doc = createEmptyDocument({ title: 'T' });
    doc.sections[0]!.blocks = [
      Object.assign(createParagraphBlock(), {
        content: [{ type: 'text', text: '<script>', marks: [] }],
      }),
    ];
    const body = renderBody(doc);
    expect(body).not.toContain('<script>');
    expect(body).toContain('&lt;script&gt;');
  });

  it('renders inline math via KaTeX (output contains katex class)', () => {
    const doc = createEmptyDocument({ title: 'T' });
    doc.sections[0]!.blocks = [
      Object.assign(createParagraphBlock(), {
        content: [{ type: 'math_inline', latex: 'a+b' }],
      }),
    ];
    const body = renderBody(doc);
    expect(body).toContain('katex');
  });

  it('renders blank tokens as input elements with answer keys', () => {
    const doc = createEmptyDocument({ title: 'T' });
    const blank = createBlankToken('correct');
    blank.acceptableAnswers = ['CORRECT', 'Correct'];
    const fill = createFillInBlankBlock();
    fill.content = [blank];
    doc.sections[0]!.blocks = [fill];
    const body = renderBody(doc);
    expect(body).toContain('data-blank-id="' + blank.id + '"');
    expect(body).toContain('data-blank-answers="correct|CORRECT|Correct"');
  });

  it('handles invalid LaTeX without throwing', () => {
    const doc = createEmptyDocument({ title: 'T' });
    doc.sections[0]!.blocks = [
      Object.assign(createMathBlock(), { latex: '\\unknownmacro{x}' }),
    ];
    expect(() => renderBody(doc)).not.toThrow();
  });
});

describe('Problem numbering', () => {
  it('auto-numbers problems sequentially', () => {
    const doc = createEmptyDocument({ title: 'T' });
    doc.sections[0]!.blocks = [
      createProblemBlock(),
      createProblemBlock(),
      createProblemBlock(),
    ];
    const body = renderBody(doc);
    expect(body).toContain('>1.<');
    expect(body).toContain('>2.<');
    expect(body).toContain('>3.<');
  });

  it('numbers across sections continue from where the last left off', () => {
    const doc = createEmptyDocument({ title: 'T' });
    doc.sections[0]!.blocks = [createProblemBlock(), createProblemBlock()];
    const second = createSection('Part 2');
    second.blocks = [createProblemBlock()];
    doc.sections.push(second);
    const body = renderBody(doc);
    expect(body).toContain('>1.<');
    expect(body).toContain('>2.<');
    expect(body).toContain('>3.<');
  });

  it('respects an explicit number override but still increments the counter', () => {
    const doc = createEmptyDocument({ title: 'T' });
    const overridden = createProblemBlock();
    overridden.number = 99;
    doc.sections[0]!.blocks = [
      createProblemBlock(), // auto = 1
      overridden,           // shows 99, counter advances to 2
      createProblemBlock(), // auto = 3
    ];
    const body = renderBody(doc);
    expect(body).toContain('>1.<');
    expect(body).toContain('>99.<');
    expect(body).toContain('>3.<');
  });

  it('counts both problem and fill_in_blank toward numbering', () => {
    const doc = createEmptyDocument({ title: 'T' });
    doc.sections[0]!.blocks = [
      createProblemBlock(),
      createFillInBlankBlock(),
      createProblemBlock(),
    ];
    const body = renderBody(doc);
    expect(body).toContain('>1.<');
    expect(body).toContain('>2.<');
    expect(body).toContain('>3.<');
  });
  it('wraps subscript marks in <sub> and superscript marks in <sup>', () => {
    const doc: ActivityDocument = {
      schemaVersion: 1,
      meta: { title: 'T', course: 'Algebra II', submissionMode: 'free', revisionMode: 'free', gradingMode: 'auto', activityType: 'worksheet', skills: [] },
      sections: [{
        id: '11111111-1111-1111-1111-111111111111',
        isCheckpoint: false,
        blocks: [{
          id: '22222222-2222-2222-2222-222222222222',
          type: 'paragraph',
          content: [
            { type: 'text', text: 'H', marks: [] },
            { type: 'text', text: '2', marks: ['subscript'] },
            { type: 'text', text: 'O', marks: [] },
            { type: 'text', text: ' x', marks: [] },
            { type: 'text', text: '2', marks: ['superscript'] },
          ],
        }],
      }],
    };
    const body = renderBody(doc);
    expect(body).toContain('<sub>2</sub>');
    expect(body).toContain('<sup>2</sup>');
  });
});

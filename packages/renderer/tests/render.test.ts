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
  createBulletListBlock,
  createOrderedListBlock,
  createListItem,
  type ActivityDocument,
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
    // The runtime is minified into the bundle; identifier names are mangled
    // (STORAGE_KEY_NAME → some short var). Assert on the localStorage key VALUE
    // instead — that string is a literal in the source, survives minification,
    // and is a deliberately-stable contract (changing it would break cross-
    // activity name carry-over for students).
    expect(html).toContain('activity_student_name');
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

    // Content survives rendering — not just the wrapper class. Without these,
    // a bug that coerces inline content to a wrong value (the `'">' + +content`
    // → "NaN" bug) passes every class check above undetected.
    expect(body).toContain('A paragraph.');
    expect(body).toContain('A heading');
    expect(body).toContain('Heads up.');
    expect(body).toContain('Solve for x.');
    expect(body).toContain('The answer is');
    expect(body).toContain('alt="a picture"');
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
  it('gives each blank a positional aria-label', () => {
    const doc = createEmptyDocument({ title: 'T' });
    const fill = createFillInBlankBlock();
    fill.content = [
      { type: 'text', text: 'x = ', marks: [] },
      createBlankToken('a'),
     { type: 'text', text: ', y = ', marks: [] },
     createBlankToken('b'),
    ];
    doc.sections[0]!.blocks = [fill];
    const body = renderBody(doc);
    expect(body).toContain('aria-label="Blank 1 of 2"');
    expect(body).toContain('aria-label="Blank 2 of 2"');
  });

  it('labels a lone blank without a count', () => {
    const doc = createEmptyDocument({ title: 'T' });
    const fill = createFillInBlankBlock();
    fill.content = [createBlankToken('a')];
    doc.sections[0]!.blocks = [fill];
    const body = renderBody(doc);
    expect(body).toContain('aria-label="Fill in the blank"');
  });

  it('wraps each blank in a .blank-wrapper span', () => {
    // The wrapper is the structural change: it keeps the <input> and the
    // sibling .js-blank-feedback span together as a single inline unit so
    // they can't wrap apart mid-prose. The `blank` class deliberately stays
    // on the input itself — every existing .blank selector keeps targeting
    // the input directly with no change.
    const doc = createEmptyDocument({ title: 'T' });
    const blank = createBlankToken('answer');
    const fill = createFillInBlankBlock();
    fill.content = [blank];
    doc.sections[0]!.blocks = [fill];
    const body = renderBody(doc);
    expect(body).toContain('<span class="blank-wrapper">');
    // Class stays on the <input>, NOT on the wrapper.
    expect(body).toContain('<input type="text" class="blank"');
    // Wrapper appears immediately before the input opening tag.
    const wrapperIdx = body.indexOf('<span class="blank-wrapper">');
    const inputIdx = body.indexOf('<input type="text" class="blank"');
    expect(wrapperIdx).toBeGreaterThan(-1);
    expect(inputIdx).toBeGreaterThan(wrapperIdx);
  });

  it('emits a hidden, aria-live feedback slot keyed to each blank id', () => {
    // The feedback span is the input's next sibling. Hidden by default
    // (the `hidden` attribute); aria-live="polite" is set in source HTML
    // because setting aria-live later on an existing element is unreliable
    // across screen readers (RUNTIME.md). data-for-blank carries the id
    // so the runtime can look it up by relation without DOM-tree walking.
    const doc = createEmptyDocument({ title: 'T' });
    const blank = createBlankToken('answer');
    const fill = createFillInBlankBlock();
    fill.content = [blank];
    doc.sections[0]!.blocks = [fill];
    const body = renderBody(doc);
    expect(body).toContain(
      '<span class="js-blank-feedback" data-for-blank="' +
      blank.id +
      '" aria-live="polite" hidden>',
    );
    // Feedback span follows the input within the wrapper.
    const inputIdx = body.indexOf('data-blank-id="' + blank.id + '"');
    const feedbackIdx = body.indexOf('data-for-blank="' + blank.id + '"');
    expect(inputIdx).toBeGreaterThan(-1);
    expect(feedbackIdx).toBeGreaterThan(inputIdx);
  });

  it('emits data-hint, a hint button, and a hint text span when hint is set', () => {
    // The hint button is the always-available `?` affordance (decision 2).
    // data-hint on the input is the runtime's data contract (RUNTIME.md);
    // the hint text is also statically rendered into the span, paired with
    // the button via aria-controls. The Stage 13 runtime will toggle hidden
    // + aria-expanded on click — Step 2 only emits the static markup.
    const doc = createEmptyDocument({ title: 'T' });
    const blank = createBlankToken('answer');
    blank.hint = 'Try factoring first.';
    const fill = createFillInBlankBlock();
    fill.content = [blank];
    doc.sections[0]!.blocks = [fill];
    const body = renderBody(doc);

    expect(body).toContain('data-hint="Try factoring first."');
    expect(body).toContain(
      '<button class="js-blank-hint" type="button"' +
      ' aria-expanded="false"' +
      ' aria-controls="hint-' + blank.id + '"' +
      ' aria-label="Show hint">?</button>',
    );
    expect(body).toContain(
      '<span class="js-blank-hint-text" id="hint-' + blank.id + '" hidden>' +
      'Try factoring first.' +
      '</span>',
    );
  });

  it('escapes HTML in the hint (both attribute and text contexts)', () => {
    // Hint text containing HTML-special characters must not appear raw
    // anywhere in the output. Tested with & and < (escaped in both
    // attribute and element-text contexts) rather than " (attribute-only)
    // to avoid attr-vs-text escaping ambiguity.
    const doc = createEmptyDocument({ title: 'T' });
    const blank = createBlankToken('answer');
    blank.hint = 'a & b < c';
    const fill = createFillInBlankBlock();
    fill.content = [blank];
    doc.sections[0]!.blocks = [fill];
    const body = renderBody(doc);
    expect(body).not.toContain('a & b < c');
    expect(body).toContain('data-hint="a &amp; b &lt; c"');
    expect(body).toContain('>a &amp; b &lt; c<');
  });

  it('omits all hint emission when hint is undefined or empty', () => {
    // No hint authored → no button, no text span, no data-hint attribute.
    // The absence of the attribute is the signal "this blank has no hint
    // to reveal"; the runtime checks for presence, not value.
    const docs = [
      // hint undefined (default)
      (() => {
        const d = createEmptyDocument({ title: 'T' });
        const b = createBlankToken('a');
        const f = createFillInBlankBlock();
        f.content = [b];
        d.sections[0]!.blocks = [f];
        return d;
      })(),
     // hint empty string (treated as "no hint" per renderBlank's hint?
     // narrowing — an empty hint would surface a useless reveal)
     (() => {
       const d = createEmptyDocument({ title: 'T' });
       const b = createBlankToken('a');
       b.hint = '';
       const f = createFillInBlankBlock();
       f.content = [b];
       d.sections[0]!.blocks = [f];
       return d;
     })(),
    ];
    for (const doc of docs) {
      const body = renderBody(doc);
      expect(body).not.toContain('data-hint=');
      expect(body).not.toContain('js-blank-hint');
    }
  });

  it('emits mistakeFeedback as JSON in data-mistake-feedback', () => {
    // mistakeFeedback is a JSON-encoded array on the input; the runtime
    // parses it once at init and dispatches the matching entry into
    // .js-blank-feedback at check time (Stage 13). JSON keys/values appear
    // with " escaped to &quot; (attribute-context escaping); browsers
    // decode back to JSON.parse-able text.
    const doc = createEmptyDocument({ title: 'T' });
    const blank = createBlankToken('answer');
    blank.mistakeFeedback = [
      { match: '2x', feedback: 'Did you forget the constant?' },
      { match: '0', feedback: 'Check your sign.' },
    ];
    const fill = createFillInBlankBlock();
    fill.content = [blank];
    doc.sections[0]!.blocks = [fill];
    const body = renderBody(doc);
    expect(body).toContain('data-mistake-feedback="');
    // The JSON keys and individual entries appear escaped — testing
    // properties rather than the exact serialized blob keeps the test
    // resilient to JSON.stringify whitespace differences across runtimes.
    expect(body).toContain('&quot;match&quot;:&quot;2x&quot;');
    expect(body).toContain(
      '&quot;feedback&quot;:&quot;Did you forget the constant?&quot;',
    );
    expect(body).toContain('&quot;match&quot;:&quot;0&quot;');
    expect(body).toContain('&quot;feedback&quot;:&quot;Check your sign.&quot;');
  });

  it('omits data-mistake-feedback when the array is empty or undefined', () => {
    // Same single-signal philosophy as the hint: the absence of the
    // attribute means "no targeted feedback to consider", so an empty
    // array shouldn't emit a useless data-mistake-feedback="[]".
    const docs = [
      (() => {
        const d = createEmptyDocument({ title: 'T' });
        const b = createBlankToken('a');
        // mistakeFeedback undefined (default)
        const f = createFillInBlankBlock();
        f.content = [b];
        d.sections[0]!.blocks = [f];
        return d;
      })(),
     (() => {
       const d = createEmptyDocument({ title: 'T' });
       const b = createBlankToken('a');
       b.mistakeFeedback = [];
       const f = createFillInBlankBlock();
       f.content = [b];
       d.sections[0]!.blocks = [f];
       return d;
     })(),
    ];
    for (const doc of docs) {
      expect(renderBody(doc)).not.toContain('data-mistake-feedback');
    }
  });

  it('handles invalid LaTeX without throwing', () => {
    const doc = createEmptyDocument({ title: 'T' });
    doc.sections[0]!.blocks = [
      Object.assign(createMathBlock(), { latex: '\\unknownmacro{x}' }),
    ];
    expect(() => renderBody(doc)).not.toThrow();
  });
});

describe('Fill-in-blank block-level emission (Stage 9a fields)', () => {
  it('emits data-solution and a hidden solution slot when solution is set', () => {
    // Solution text appears in two places: as the runtime read contract
    // (data-solution on the block) and as static text inside .js-solution
    // (the slot the runtime will reveal at check time). Both are emitted;
    // the slot starts hidden so the student doesn't see the solution at
    // page load even if the runtime fails to initialize (fail-closed).
    const doc = createEmptyDocument({ title: 'T' });
    const fill = createFillInBlankBlock();
    fill.solution = 'Combine like terms, then divide.';
    doc.sections[0]!.blocks = [fill];
    const body = renderBody(doc);
    expect(body).toContain('data-solution="Combine like terms, then divide."');
    expect(body).toContain(
      '<div class="js-solution" data-for-block="' + fill.id + '" hidden>' +
      'Combine like terms, then divide.' +
      '</div>',
    );
  });

  it('escapes HTML in the solution (attribute + text contexts)', () => {
    const doc = createEmptyDocument({ title: 'T' });
    const fill = createFillInBlankBlock();
    fill.solution = 'Use a & b < c';
    doc.sections[0]!.blocks = [fill];
    const body = renderBody(doc);
    expect(body).not.toContain('Use a & b < c');
    expect(body).toContain('data-solution="Use a &amp; b &lt; c"');
    expect(body).toContain('>Use a &amp; b &lt; c<');
  });

  it('omits all solution emission when solution is undefined or empty', () => {
    const docs = [
      (() => {
        const d = createEmptyDocument({ title: 'T' });
        // factory leaves solution undefined
        d.sections[0]!.blocks = [createFillInBlankBlock()];
        return d;
      })(),
     (() => {
       const d = createEmptyDocument({ title: 'T' });
       const f = createFillInBlankBlock();
       f.solution = '';
       d.sections[0]!.blocks = [f];
       return d;
     })(),
    ];
    for (const doc of docs) {
      const body = renderBody(doc);
      expect(body).not.toContain('data-solution=');
      expect(body).not.toContain('js-solution');
    }
  });

  it('emits data-has-confidence-rating and a fieldset when hasConfidenceRating is true', () => {
    // The fieldset is rendered exactly once per block (not once per blank),
    // even when the block contains multiple blanks. The Stage 13 runtime
    // captures the single selected value and replicates it across every
    // BlankResponse for this block.
    const doc = createEmptyDocument({ title: 'T' });
    const fill = createFillInBlankBlock();
    fill.hasConfidenceRating = true;
    // Two blanks to confirm the fieldset still renders only once.
    fill.content = [createBlankToken('a'), createBlankToken('b')];
    doc.sections[0]!.blocks = [fill];
    const body = renderBody(doc);
    expect(body).toContain('data-has-confidence-rating="true"');
    expect(body).toContain(
      '<fieldset class="js-confidence-rating" data-for-block="' + fill.id + '">',
    );
    expect(body).toContain('<legend>How confident are you?</legend>');
    // Three radio options with snake_case values and the block-namespaced
    // name (so multiple confidence groups on the same page don't share
    // radio-group state).
    expect(body).toContain('name="conf-' + fill.id + '" value="unsure"');
    expect(body).toContain('name="conf-' + fill.id + '" value="think_so"');
    expect(body).toContain('name="conf-' + fill.id + '" value="certain"');
    // Fieldset opens exactly once for the whole block.
    const fieldsetMatches = body.match(/<fieldset class="js-confidence-rating"/g);
    expect(fieldsetMatches?.length).toBe(1);
  });

  it('omits the confidence fieldset and attribute when hasConfidenceRating is false', () => {
    const doc = createEmptyDocument({ title: 'T' });
    // factory returns hasConfidenceRating: false (schema default)
    doc.sections[0]!.blocks = [createFillInBlankBlock()];
    const body = renderBody(doc);
    expect(body).not.toContain('data-has-confidence-rating');
    expect(body).not.toContain('js-confidence-rating');
  });

  it('emits data-skills as JSON when skills is non-empty', () => {
    // skills lives on the block; editor UI is Phase 2 but the renderer
    // emits it now so per-skill analytics can reach back to Phase 1
    // blocks when the editor and dashboard features land.
    const doc = createEmptyDocument({ title: 'T' });
    const fill = createFillInBlankBlock();
    fill.skills = ['factoring-quadratics', 'distributive-property'];
    doc.sections[0]!.blocks = [fill];
    const body = renderBody(doc);
    expect(body).toContain('data-skills="');
    // JSON-array form with " escaped to &quot; in attribute context.
    expect(body).toContain('&quot;factoring-quadratics&quot;');
    expect(body).toContain('&quot;distributive-property&quot;');
  });

  it('omits data-skills when skills is empty (the schema default)', () => {
    const doc = createEmptyDocument({ title: 'T' });
    // factory returns skills: [] (schema default)
    doc.sections[0]!.blocks = [createFillInBlankBlock()];
    const body = renderBody(doc);
    expect(body).not.toContain('data-skills');
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

describe('lists', () => {
  it('renders a bullet list as <ul> with content category', () => {
    const doc = createEmptyDocument({ title: 'T' });
    doc.sections[0]!.blocks = [
      Object.assign(createBulletListBlock(), {
        items: [
          Object.assign(createListItem(), {
            content: [{ type: 'text', text: 'first item', marks: [] }],
          }),
          Object.assign(createListItem(), {
            content: [{ type: 'text', text: 'second item', marks: [] }],
          }),
        ],
      }),
    ];
    const body = renderBody(doc);
    expect(body).toContain(
      '<ul class="block block-bullet-list" data-block-category="content"',
    );
    expect(body).toContain('</ul>');
    expect(body).toContain('<li data-id=');
    expect(body).toContain('first item');
    expect(body).toContain('second item');
  });

  it('renders an ordered list as <ol> with content category', () => {
    const doc = createEmptyDocument({ title: 'T' });
    doc.sections[0]!.blocks = [
      Object.assign(createOrderedListBlock(), {
        items: [
          Object.assign(createListItem(), {
            content: [{ type: 'text', text: 'step one', marks: [] }],
          }),
        ],
      }),
    ];
    const body = renderBody(doc);
    expect(body).toContain(
      '<ol class="block block-ordered-list" data-block-category="content"',
    );
    expect(body).toContain('</ol>');
    expect(body).toContain('step one');
  });

  it('renders a nested bullet list inside its parent list item', () => {
    const doc = createEmptyDocument({ title: 'T' });
    doc.sections[0]!.blocks = [
      Object.assign(createBulletListBlock(), {
        items: [
          Object.assign(createListItem(), {
            content: [{ type: 'text', text: 'outer item', marks: [] }],
            children: [
              Object.assign(createBulletListBlock(), {
                items: [
                  Object.assign(createListItem(), {
                    content: [{ type: 'text', text: 'inner item', marks: [] }],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ];
    const body = renderBody(doc);
    expect(body).toContain('outer item');
    expect(body).toContain('inner item');
    // The nested <ul> opens immediately after the parent item's inline
    // content — i.e. inside the parent <li>, not as a sibling block.
    expect(body).toContain('outer item<ul ');
  });

  it('dispatches mixed nesting (a bullet list inside an ordered list)', () => {
    const doc = createEmptyDocument({ title: 'T' });
    doc.sections[0]!.blocks = [
      Object.assign(createOrderedListBlock(), {
        items: [
          Object.assign(createListItem(), {
            content: [{ type: 'text', text: 'numbered parent', marks: [] }],
            children: [
              Object.assign(createBulletListBlock(), {
                items: [
                  Object.assign(createListItem(), {
                    content: [
                      { type: 'text', text: 'bulleted child', marks: [] },
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ];
    const body = renderBody(doc);
    expect(body).toContain('block-ordered-list');
    expect(body).toContain('block-bullet-list');
    expect(body).toContain('numbered parent<ul ');
    expect(body).toContain('bulleted child');
  });

  it('renders inline marks inside a list item', () => {
    const doc = createEmptyDocument({ title: 'T' });
    doc.sections[0]!.blocks = [
      Object.assign(createBulletListBlock(), {
        items: [
          Object.assign(createListItem(), {
            content: [
              { type: 'text', text: 'plain ', marks: [] },
              { type: 'text', text: 'bold', marks: ['bold'] },
            ],
          }),
        ],
      }),
    ];
    const body = renderBody(doc);
    expect(body).toContain('plain ');
    expect(body).toContain('bold');
    expect(body).toContain('<strong>');
  });
});


describe('block identity attributes', () => {
  it('emits data-block-type (the snake_case schema discriminant) for every block type', () => {
    const doc = createEmptyDocument({ title: 'All blocks' });
    doc.sections[0]!.blocks = [
      createParagraphBlock(),
     createHeadingBlock(2),
     Object.assign(createMathBlock(), { latex: 'x' }),
     createImageBlock('https://example.com/i.png', 'alt'),
     createCalloutBlock('info'),
     createProblemBlock(),
     createFillInBlankBlock(),
     Object.assign(createBulletListBlock(), { items: [createListItem()] }),
     Object.assign(createOrderedListBlock(), { items: [createListItem()] }),
    ];
    const body = renderBody(doc);
    expect(body).toContain('data-block-type="paragraph"');
    expect(body).toContain('data-block-type="heading"');
    expect(body).toContain('data-block-type="math_block"');
    expect(body).toContain('data-block-type="image"');
    expect(body).toContain('data-block-type="callout"');
    expect(body).toContain('data-block-type="problem"');
    expect(body).toContain('data-block-type="fill_in_blank"');
    expect(body).toContain('data-block-type="bullet_list"');
    expect(body).toContain('data-block-type="ordered_list"');
  });

  it('emits the block id under data-block-id, not data-id', () => {
    const doc = createEmptyDocument({ title: 'T' });
    const para = createParagraphBlock();
    doc.sections[0]!.blocks = [para];
    const body = renderBody(doc);
    expect(body).toContain('data-block-id="' + para.id + '"');
    // the old bare attribute must be gone for blocks
    expect(body).not.toContain(' data-id="' + para.id + '"');
  });

  it('emits data-section-id on <section>, not data-id', () => {
    const doc = createEmptyDocument({ title: 'T' });
    const sectionId = doc.sections[0]!.id;
    const body = renderBody(doc);
    expect(body).toContain('data-section-id="' + sectionId + '"');
    expect(body).not.toContain(' data-id="' + sectionId + '"');
  });
});

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
  createMultipleChoiceBlock,
  createSection,
  createBulletListBlock,
  createOrderedListBlock,
  createListItem,
  createCalculatorTool,
  type ActivityDocument,
  type CalculatorRestrictions,
} from '@activity/schema';
import {
  renderActivity,
  renderActivityForPrint,
  renderBody,
  type RenderContext,
} from '../src/index.js';
import { referencePanelJs } from '../src/runtime/generated/reference-panel-bundle.js';

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

  it('emits the single global popover markup', () => {
    const doc = createEmptyDocument({ title: 'Test' });
    const html = renderActivity(doc, ctx);
    expect(html).toContain('class="js-popover"');
    expect(html).toContain('id="activity-popover"');
    expect(html).toContain('role="dialog"');
    expect(html).toContain('class="js-popover-header"');
    expect(html).toContain('class="js-popover-title"');
    expect(html).toContain('class="js-popover-body"');
    expect(html).toContain('class="js-popover-close"');
  });
});

describe('Activity container + config blob (Stage 12 step 5)', () => {
  it('emits data-activity-type on the activity-container', () => {
    // Sourced from doc.meta.activityType; the CSS hook for layout variants
    // ([data-activity-type="exit_ticket"] …) that distinguish a warm-up
    // from a worksheet from a review without runtime involvement.
    const doc = createEmptyDocument({ title: 'T', activityType: 'exit_ticket' });
    const html = renderActivity(doc, ctx);
    // Not pinning the closing '>' — the container also carries a style attr
    // with the --print-* vars now (print feature).
    expect(html).toContain(
      '<main class="activity-container" data-activity-type="exit_ticket"',
    );
  });

  it('defaults activityType to worksheet via the factory + schema default', () => {
    // Factory createEmptyDocument doesn't set activityType explicitly here,
    // so its default ('worksheet') surfaces — matching the schema default.
    const doc = createEmptyDocument({ title: 'T' });
    const html = renderActivity(doc, ctx);
    expect(html).toContain('data-activity-type="worksheet"');
  });

  it('includes submissionMode, revisionMode, gradingMode in the activity-config blob', () => {
    // The Stage 13 runtime reads these from the JSON blob:
    //   submissionMode → input-lockdown behavior in locked mode vs free
    //     revision in free mode (decision 4 means data-submission-mode is
    //     NOT on the container; the blob is the only home).
    //   revisionMode → post-final-submit resubmission permission.
    //   gradingMode → Phase 2.6 forward-compat; today auto everywhere.
    const doc = createEmptyDocument({
      title: 'T',
      submissionMode: 'locked',
      revisionMode: 'locked',
    });
    const html = renderActivity(doc, ctx);
    expect(html).toContain('"submissionMode":"locked"');
    expect(html).toContain('"revisionMode":"locked"');
    expect(html).toContain('"gradingMode":"auto"');
  });

  it('reflects free-mode defaults in the config blob', () => {
    // The factory defaults submissionMode='free', revisionMode='free',
    // gradingMode='auto'. Explicit assertion guards against silent default
    // drift if the factory or schema defaults change.
    const doc = createEmptyDocument({ title: 'T' });
    const html = renderActivity(doc, ctx);
    expect(html).toContain('"submissionMode":"free"');
    expect(html).toContain('"revisionMode":"free"');
    expect(html).toContain('"gradingMode":"auto"');
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
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [
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
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [
      Object.assign(createParagraphBlock(), {
        content: [
          { type: 'text', text: 'styled', marks: [{ type: 'bold' }, { type: 'italic' }] },
        ],
      }),
    ];
    const body = renderBody(doc);
    expect(body).toContain('<strong>');
    expect(body).toContain('<em>');
  });

  it('escapes text content', () => {
    const doc = createEmptyDocument({ title: 'T' });
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [
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
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [
      Object.assign(createParagraphBlock(), {
        content: [{ type: 'math_inline', latex: 'a+b' }],
      }),
    ];
    const body = renderBody(doc);
    expect(body).toContain('katex');
  });

  it('renders a hard break as <br> between text runs', () => {
    const doc = createEmptyDocument({ title: 'T' });
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [
      Object.assign(createParagraphBlock(), {
        content: [
          { type: 'text', text: 'Hello!', marks: [] },
          { type: 'hard_break' },
          { type: 'text', text: 'Hope this works', marks: [] },
        ],
      }),
    ];
    const body = renderBody(doc);
    expect(body).toContain('Hello!<br>Hope this works');
  });

  it('renders blank tokens as input elements with answer keys', () => {
    const doc = createEmptyDocument({ title: 'T' });
    const blank = createBlankToken('correct');
    blank.acceptableAnswers = ['CORRECT', 'Correct'];
    const fill = createFillInBlankBlock();
    fill.content = [blank];
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [fill];
    const body = renderBody(doc);
    expect(body).toContain('data-blank-id="' + blank.id + '"');
    expect(body).toContain('data-blank-answers="correct|CORRECT|Correct"');
    // A text blank carries NO strategy attributes (list is the runtime default).
    expect(body).not.toContain('data-blank-strategy');
    expect(body).not.toContain('inputmode');
  });

  it('numeric blanks carry strategy + tolerance attributes and a decimal inputmode', () => {
    const doc = createEmptyDocument({ title: 'T' });
    const blank = createBlankToken('3.14');
    blank.answerType = 'numeric';
    blank.tolerance = 0.01;
    const fill = createFillInBlankBlock();
    fill.content = [blank];
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [fill];
    const body = renderBody(doc);
    expect(body).toContain('data-blank-strategy="numeric"');
    expect(body).toContain('data-blank-tolerance="0.01"');
    expect(body).toContain('inputmode="decimal"');
  });

  it('numeric blanks without a tolerance omit the tolerance attribute', () => {
    const doc = createEmptyDocument({ title: 'T' });
    const blank = createBlankToken('12');
    blank.answerType = 'numeric';
    const fill = createFillInBlankBlock();
    fill.content = [blank];
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [fill];
    const body = renderBody(doc);
    expect(body).toContain('data-blank-strategy="numeric"');
    expect(body).not.toContain('data-blank-tolerance');
  });

  it('math blanks carry the math strategy + equivalence + tolerance (Model B)', () => {
    const doc = createEmptyDocument({ title: 'T' });
    const blank = createBlankToken('2a');
    blank.answerType = 'math';
    blank.equivalence = 'exact-form';
    blank.tolerance = 0.001;
    const fill = createFillInBlankBlock();
    fill.content = [blank];
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [fill];
    const body = renderBody(doc);
    expect(body).toContain('data-blank-strategy="math"');
    expect(body).toContain('data-blank-equivalence="exact-form"');
    expect(body).toContain('data-blank-tolerance="0.001"');
    // Math blanks are text input (not numeric) — no decimal inputmode.
    expect(body).not.toContain('inputmode="decimal"');
  });

  it('math blanks default equivalence to absent (= value)', () => {
    const doc = createEmptyDocument({ title: 'T' });
    const blank = createBlankToken('2a');
    blank.answerType = 'math';
    const fill = createFillInBlankBlock();
    fill.content = [blank];
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [fill];
    const body = renderBody(doc);
    expect(body).toContain('data-blank-strategy="math"');
    expect(body).not.toContain('data-blank-equivalence');
    expect(body).not.toContain('data-blank-tolerance');
  });

  it('a block with a math blank emits data-blank-kit-src (for the runtime preloader)', () => {
    const doc = createEmptyDocument({ title: 'T' });
    const blank = createBlankToken('2a');
    blank.answerType = 'math';
    const fill = createFillInBlankBlock();
    fill.content = [blank];
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [fill];
    const kit = 'https://cdn.example/graph-kit-ABC123.js';
    const withKit = renderBody(doc, { graphKitUrl: kit });
    expect(withKit).toContain('data-blank-kit-src="' + kit + '"');
    // No kit URL available (dev-without-R2 / print) → attribute omitted.
    expect(renderBody(doc)).not.toContain('data-blank-kit-src');
  });

  it('a text/numeric-only block does NOT emit data-blank-kit-src even when a kit URL exists', () => {
    const doc = createEmptyDocument({ title: 'T' });
    const numeric = createBlankToken('3');
    numeric.answerType = 'numeric';
    const fill = createFillInBlankBlock();
    fill.content = [createBlankToken('plain'), numeric];
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [fill];
    const body = renderBody(doc, { graphKitUrl: 'https://cdn.example/kit.js' });
    expect(body).not.toContain('data-blank-kit-src');
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
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [fill];
    const body = renderBody(doc);
    expect(body).toContain('aria-label="Blank 1 of 2"');
    expect(body).toContain('aria-label="Blank 2 of 2"');
  });

  it('labels a lone blank without a count', () => {
    const doc = createEmptyDocument({ title: 'T' });
    const fill = createFillInBlankBlock();
    fill.content = [createBlankToken('a')];
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [fill];
    const body = renderBody(doc);
    expect(body).toContain('aria-label="Fill in the blank"');
  });

  it('wraps each blank in a .blank-wrapper span', () => {
    const doc = createEmptyDocument({ title: 'T' });
    const blank = createBlankToken('answer');
    const fill = createFillInBlankBlock();
    fill.content = [blank];
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [fill];
    const body = renderBody(doc);
    expect(body).toContain('<span class="blank-wrapper">');
    expect(body).toContain('<input type="text" class="blank"');
    const wrapperIdx = body.indexOf('<span class="blank-wrapper">');
    const inputIdx = body.indexOf('<input type="text" class="blank"');
    expect(wrapperIdx).toBeGreaterThan(-1);
    expect(inputIdx).toBeGreaterThan(wrapperIdx);
  });

  it('emits no inline feedback slot for a plain blank', () => {
    const doc = createEmptyDocument({ title: 'T' });
    const blank = createBlankToken('answer');
    const fill = createFillInBlankBlock();
    fill.content = [blank];
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [fill];
    const body = renderBody(doc);
    // Inline feedback text was replaced by the popover; no slot is emitted.
    expect(body).not.toContain('js-blank-feedback');
    // A plain blank (no authored mistakes) also gets no mistake button.
    expect(body).not.toContain('js-blank-mistake');
  });

  it('emits a hidden mistake button + a per-entry content template when mistake feedback is authored', () => {
    const doc = createEmptyDocument({ title: 'T' });
    const blank = createBlankToken('answer');
    blank.mistakeFeedback = [
      { match: '2x', feedback: [{ type: 'text', text: 'Forgot the constant?', marks: [] }] },
    ];
    const fill = createFillInBlankBlock();
    fill.content = [blank];
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [fill];
    const body = renderBody(doc);
    expect(body).toContain(
      '<button class="js-blank-mistake" type="button"' +
      ' aria-haspopup="dialog"' +
      ' aria-expanded="false"' +
      ' aria-controls="activity-popover"' +
      ' aria-label="Show feedback" hidden>!</button>',
    );
    // Rich content lives in a hidden template, keyed by the match string.
    expect(body).toContain(
      '<template class="js-blank-mistake-content" data-match="2x">Forgot the constant?</template>',
    );
    // No data attribute carries the feedback any more.
    expect(body).not.toContain('data-mistake-feedback');
  });

  it('emits a hint button + a content template when hint is set', () => {
    const doc = createEmptyDocument({ title: 'T' });
    const blank = createBlankToken('answer');
    blank.hint = [{ type: 'text', text: 'Try factoring first.', marks: [] }];
    const fill = createFillInBlankBlock();
    fill.content = [blank];
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [fill];
    const body = renderBody(doc);

    expect(body).toContain(
      '<button class="js-blank-hint" type="button"' +
      ' aria-haspopup="dialog"' +
      ' aria-expanded="false"' +
      ' aria-controls="activity-popover"' +
      ' aria-label="Show hint">?</button>',
    );
    expect(body).toContain(
      '<template class="js-blank-hint-content">Try factoring first.</template>',
    );
    // The hint no longer rides on a data attribute.
    expect(body).not.toContain('data-hint=');
  });

  it('renders rich marks and inline math inside hint content', () => {
    const doc = createEmptyDocument({ title: 'T' });
    const blank = createBlankToken('answer');
    blank.hint = [
      { type: 'text', text: 'Recall ', marks: [] },
      { type: 'text', text: 'Pythagoras', marks: [{ type: 'bold' }] },
      { type: 'text', text: ': ', marks: [] },
      { type: 'math_inline', latex: 'a^2 + b^2' },
    ];
    const fill = createFillInBlankBlock();
    fill.content = [blank];
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [fill];
    const body = renderBody(doc);
    expect(body).toContain('<strong>Pythagoras</strong>');
    // KaTeX ran server-side: the rendered math carries the katex class.
    expect(body).toContain('class="katex"');
  });

  it('escapes HTML in hint content text', () => {
    const doc = createEmptyDocument({ title: 'T' });
    const blank = createBlankToken('answer');
    blank.hint = [{ type: 'text', text: 'a & b < c', marks: [] }];
    const fill = createFillInBlankBlock();
    fill.content = [blank];
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [fill];
    const body = renderBody(doc);
    expect(body).not.toContain('a & b < c');
    expect(body).toContain('a &amp; b &lt; c');
  });

  it('omits all hint emission when hint is undefined or empty', () => {
    const docs = [
      (() => {
        const d = createEmptyDocument({ title: 'T' });
        const b = createBlankToken('a');
        const f = createFillInBlankBlock();
        f.content = [b];
        d.sections[0]!.rows[0]!.columns[0]!.blocks = [f];
        return d;
      })(),
     (() => {
       const d = createEmptyDocument({ title: 'T' });
       const b = createBlankToken('a');
       b.hint = [];
       const f = createFillInBlankBlock();
       f.content = [b];
       d.sections[0]!.rows[0]!.columns[0]!.blocks = [f];
       return d;
     })(),
    ];
    for (const doc of docs) {
      const body = renderBody(doc);
      expect(body).not.toContain('js-blank-hint');
    }
  });

  it('emits one content template per mistakeFeedback entry, in order', () => {
    const doc = createEmptyDocument({ title: 'T' });
    const blank = createBlankToken('answer');
    blank.mistakeFeedback = [
      { match: '2x', feedback: [{ type: 'text', text: 'Did you forget the constant?', marks: [] }] },
      { match: '0', feedback: [{ type: 'text', text: 'Check your sign.', marks: [] }] },
    ];
    const fill = createFillInBlankBlock();
    fill.content = [blank];
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [fill];
    const body = renderBody(doc);
    const first = body.indexOf(
      '<template class="js-blank-mistake-content" data-match="2x">Did you forget the constant?</template>',
    );
    const second = body.indexOf(
      '<template class="js-blank-mistake-content" data-match="0">Check your sign.</template>',
    );
    expect(first).toBeGreaterThan(-1);
    expect(second).toBeGreaterThan(first);
  });

  it('omits all mistake emission when the array is empty or undefined', () => {
    const docs = [
      (() => {
        const d = createEmptyDocument({ title: 'T' });
        const b = createBlankToken('a');
        const f = createFillInBlankBlock();
        f.content = [b];
        d.sections[0]!.rows[0]!.columns[0]!.blocks = [f];
        return d;
      })(),
     (() => {
       const d = createEmptyDocument({ title: 'T' });
       const b = createBlankToken('a');
       b.mistakeFeedback = [];
       const f = createFillInBlankBlock();
       f.content = [b];
       d.sections[0]!.rows[0]!.columns[0]!.blocks = [f];
       return d;
     })(),
    ];
    for (const doc of docs) {
      const body = renderBody(doc);
      expect(body).not.toContain('js-blank-mistake');
    }
  });

  it('handles invalid LaTeX without throwing', () => {
    const doc = createEmptyDocument({ title: 'T' });
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [
      Object.assign(createMathBlock(), { latex: '\\unknownmacro{x}' }),
    ];
    expect(() => renderBody(doc)).not.toThrow();
  });
});

describe('Order-independent blank grouping (data-blank-group)', () => {
  // A "group" is a run of adjacent blanks each flagged interchangeableWithPrevious.
  // Runs of 2+ share the anchor blank's id as data-blank-group; lone blanks emit
  // none. The runtime buckets by this id for consume-once scoring.
  function bodyWith(blanks: ReturnType<typeof createBlankToken>[]): string {
    const doc = createEmptyDocument({ title: 'T' });
    const fill = createFillInBlankBlock();
    fill.content = blanks;
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [fill];
    return renderBody(doc);
  }

  it('groups two adjacent blanks under the anchor blank id', () => {
    const a = createBlankToken('2');
    const b = createBlankToken('3');
    b.interchangeableWithPrevious = true;
    const body = bodyWith([a, b]);
    // Both inputs carry the anchor (first blank) id as the group.
    const groupAttrs = body.match(/data-blank-group="[^"]*"/g) ?? [];
    expect(groupAttrs).toEqual([
      `data-blank-group="${a.id}"`,
      `data-blank-group="${a.id}"`,
    ]);
    expect(body).toContain('class="blank blank-grouped"');
    expect(body).toContain('title="Any order accepted"');
  });

  it('emits no group attribute for ungrouped blanks', () => {
    const a = createBlankToken('2');
    const b = createBlankToken('3'); // no flag → not grouped
    const body = bodyWith([a, b]);
    expect(body).not.toContain('data-blank-group');
    expect(body).not.toContain('blank-grouped');
  });

  it('ignores the flag on the first blank (no previous to group with)', () => {
    const a = createBlankToken('2');
    a.interchangeableWithPrevious = true; // meaningless on blank 1
    const b = createBlankToken('3'); // not flagged
    const body = bodyWith([a, b]);
    expect(body).not.toContain('data-blank-group');
  });

  it('starts a new group when the run breaks', () => {
    const a = createBlankToken('2');
    const b = createBlankToken('3');
    b.interchangeableWithPrevious = true; // group 1: {a, b} → anchor a
    const c = createBlankToken('4'); // breaks the run
    const d = createBlankToken('5');
    d.interchangeableWithPrevious = true; // group 2: {c, d} → anchor c
    const body = bodyWith([a, b, c, d]);
    const groupAttrs = body.match(/data-blank-group="([^"]*)"/g) ?? [];
    expect(groupAttrs).toEqual([
      `data-blank-group="${a.id}"`,
      `data-blank-group="${a.id}"`,
      `data-blank-group="${c.id}"`,
      `data-blank-group="${c.id}"`,
    ]);
  });
});

describe('Fill-in-blank block-level emission (Stage 9a fields)', () => {
  it('pre-renders rich solution content into a hidden slot when solution is set', () => {
    const doc = createEmptyDocument({ title: 'T' });
    const fill = createFillInBlankBlock();
    fill.solution = [{ type: 'text', text: 'Combine like terms, then divide.', marks: [] }];
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [fill];
    const body = renderBody(doc);
    expect(body).toContain(
      '<div class="js-solution" data-for-block="' + fill.id + '" hidden>' +
      'Combine like terms, then divide.' +
      '</div>',
    );
    // Presence is keyed off the slot, not a data attribute.
    expect(body).not.toContain('data-solution');
  });

  it('renders rich marks and inline math inside the solution slot', () => {
    const doc = createEmptyDocument({ title: 'T' });
    const fill = createFillInBlankBlock();
    fill.solution = [
      { type: 'text', text: 'Since ', marks: [] },
      { type: 'math_inline', latex: 'x = 2' },
      { type: 'text', text: ', the answer is ', marks: [] },
      { type: 'text', text: 'four', marks: [{ type: 'italic' }] },
    ];
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [fill];
    const body = renderBody(doc);
    expect(body).toContain('<em>four</em>');
    expect(body).toContain('class="katex"');
  });

  it('escapes HTML in solution content text', () => {
    const doc = createEmptyDocument({ title: 'T' });
    const fill = createFillInBlankBlock();
    fill.solution = [{ type: 'text', text: 'Use a & b < c', marks: [] }];
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [fill];
    const body = renderBody(doc);
    expect(body).not.toContain('Use a & b < c');
    expect(body).toContain('>Use a &amp; b &lt; c<');
  });

  it('omits all solution emission when solution is undefined or empty', () => {
    const docs = [
      (() => {
        const d = createEmptyDocument({ title: 'T' });
        d.sections[0]!.rows[0]!.columns[0]!.blocks = [createFillInBlankBlock()];
        return d;
      })(),
     (() => {
       const d = createEmptyDocument({ title: 'T' });
       const f = createFillInBlankBlock();
       f.solution = [];
       d.sections[0]!.rows[0]!.columns[0]!.blocks = [f];
       return d;
     })(),
    ];
    for (const doc of docs) {
      const body = renderBody(doc);
      expect(body).not.toContain('js-solution');
    }
  });

  it('emits data-has-confidence-rating and a fieldset when hasConfidenceRating is true', () => {
    const doc = createEmptyDocument({ title: 'T' });
    const fill = createFillInBlankBlock();
    fill.hasConfidenceRating = true;
    fill.content = [createBlankToken('a'), createBlankToken('b')];
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [fill];
    const body = renderBody(doc);
    expect(body).toContain('data-has-confidence-rating="true"');
    expect(body).toContain(
      '<fieldset class="js-confidence-rating" data-for-block="' + fill.id + '">',
    );
    expect(body).toContain('<legend>How confident are you?</legend>');
    expect(body).toContain('name="conf-' + fill.id + '" value="unsure"');
    expect(body).toContain('name="conf-' + fill.id + '" value="think_so"');
    expect(body).toContain('name="conf-' + fill.id + '" value="certain"');
    const fieldsetMatches = body.match(/<fieldset class="js-confidence-rating"/g);
    expect(fieldsetMatches?.length).toBe(1);
  });

  it('omits the confidence fieldset and attribute when hasConfidenceRating is false', () => {
    const doc = createEmptyDocument({ title: 'T' });
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [createFillInBlankBlock()];
    const body = renderBody(doc);
    expect(body).not.toContain('data-has-confidence-rating');
    expect(body).not.toContain('js-confidence-rating');
  });

  it('emits data-skills as JSON when skills is non-empty', () => {
    const doc = createEmptyDocument({ title: 'T' });
    const fill = createFillInBlankBlock();
    fill.skills = ['factoring-quadratics', 'distributive-property'];
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [fill];
    const body = renderBody(doc);
    expect(body).toContain('data-skills="');
    expect(body).toContain('&quot;factoring-quadratics&quot;');
    expect(body).toContain('&quot;distributive-property&quot;');
  });

  it('omits data-skills when skills is empty (the schema default)', () => {
    const doc = createEmptyDocument({ title: 'T' });
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [createFillInBlankBlock()];
    const body = renderBody(doc);
    expect(body).not.toContain('data-skills');
  });
});

describe('Section checkpoint emission (Stage 12 step 4)', () => {
  it('omits all checkpoint markup in single submissionMode', () => {
    const doc = createEmptyDocument({ title: 'T', submissionMode: 'single' });
    doc.sections[0]!.isCheckpoint = true;
    const body = renderBody(doc);
    expect(body).not.toContain('data-is-checkpoint');
    expect(body).not.toContain('js-checkpoint-btn');
    expect(body).not.toContain('js-section-score');
  });

  it('emits data-is-checkpoint on every section in locked submissionMode', () => {
    const doc = createEmptyDocument({ title: 'T', submissionMode: 'locked' });
    doc.sections[0]!.isCheckpoint = false;
    const second = createSection();
    second.isCheckpoint = true;
    doc.sections.push(second);
    const body = renderBody(doc);
    expect(body).toContain('data-is-checkpoint="false"');
    expect(body).toContain('data-is-checkpoint="true"');
  });

  it('emits data-is-checkpoint on every section in free submissionMode', () => {
    const doc = createEmptyDocument({ title: 'T', submissionMode: 'free' });
    doc.sections[0]!.isCheckpoint = false;
    const body = renderBody(doc);
    expect(body).toContain('data-is-checkpoint="false"');
  });

  it('emits the checkpoint button + score slot when isCheckpoint is true', () => {
    const doc = createEmptyDocument({ title: 'T', submissionMode: 'free' });
    const section = doc.sections[0]!;
    section.isCheckpoint = true;
    const body = renderBody(doc);
    expect(body).toContain(
      '<button class="js-checkpoint-btn"' +
      ' data-for-section="' + section.id + '"' +
      ' type="button">Check this section</button>',
    );
    expect(body).toContain(
      '<div class="js-section-score"' +
      ' data-for-section="' + section.id + '"' +
      ' hidden></div>',
    );
  });

  it('omits button + score on non-checkpoint sections (attribute still present)', () => {
    const doc = createEmptyDocument({ title: 'T', submissionMode: 'free' });
    doc.sections[0]!.isCheckpoint = false;
    const body = renderBody(doc);
    expect(body).toContain('data-is-checkpoint="false"');
    expect(body).not.toContain('js-checkpoint-btn');
    expect(body).not.toContain('js-section-score');
  });

  it('places the checkpoint button after the section blocks', () => {
    const doc = createEmptyDocument({ title: 'T', submissionMode: 'free' });
    const section = doc.sections[0]!;
    section.isCheckpoint = true;
    section.rows[0]!.columns[0]!.blocks = [createProblemBlock()];
    const body = renderBody(doc);
    const blockIdx = body.indexOf('block-problem');
    const btnIdx = body.indexOf('js-checkpoint-btn');
    expect(blockIdx).toBeGreaterThan(-1);
    expect(btnIdx).toBeGreaterThan(blockIdx);
  });
});

describe('Multiple-choice block', () => {
  function mcDoc() {
    const doc = createEmptyDocument({ title: 'T' });
    const mc = createMultipleChoiceBlock();
    mc.prompt = [{ type: 'text', text: 'What is 2 + 2?', marks: [] }];
    mc.choices[0]!.content = [{ type: 'text', text: '4', marks: [] }];
    mc.choices[1]!.content = [{ type: 'text', text: '5', marks: [] }];
    mc.choices[2]!.content = [{ type: 'text', text: '22', marks: [] }];
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [mc];
    return { doc, mc };
  }

  it('renders the block shell with the answer key and problem number', () => {
    const { doc, mc } = mcDoc();
    const body = renderBody(doc);
    expect(body).toContain('data-block-type="multiple_choice"');
    expect(body).toContain('data-block-category="question"');
    expect(body).toContain('data-block-id="' + mc.id + '"');
    // Answer key: JSON array of the correct choice ids (attr-escaped quotes).
    expect(body).toContain(
      'data-mc-answer="' + '[&quot;' + mc.choices[0]!.id + '&quot;]"',
    );
    expect(body).toContain('<div class="block-problem-number">1.</div>');
    expect(body).toContain('What is 2 + 2?');
  });

  it('single-select renders radios in a block-namespaced group, no multi attr', () => {
    const { doc, mc } = mcDoc();
    const body = renderBody(doc);
    expect(body).toContain('type="radio"');
    expect(body).toContain('name="mc-' + mc.id + '"');
    expect(body).not.toContain('data-mc-multi');
    expect(body).not.toContain('Select all that apply');
  });

  it('multi-select renders checkboxes, the attr, and the instruction line', () => {
    const { doc } = mcDoc();
    (doc.sections[0]!.rows[0]!.columns[0]!.blocks[0] as { multiSelect: boolean }).multiSelect = true;
    const body = renderBody(doc);
    expect(body).toContain('type="checkbox"');
    expect(body).toContain('data-mc-multi="true"');
    expect(body).toContain('Select all that apply.');
  });

  it('emits choice letters and per-choice ids', () => {
    const { doc, mc } = mcDoc();
    const body = renderBody(doc);
    expect(body).toContain('>A.</span>');
    expect(body).toContain('>B.</span>');
    expect(body).toContain('>C.</span>');
    for (const choice of mc.choices) {
      expect(body).toContain('data-choice-id="' + choice.id + '"');
    }
  });

  it('pre-renders per-choice feedback into a hidden js-mc-feedback div', () => {
    const { doc, mc } = mcDoc();
    mc.choices[1]!.feedback = [
      { type: 'text', text: 'Check your addition.', marks: [] },
    ];
    const body = renderBody(doc);
    expect(body).toContain('js-mc-feedback');
    expect(body).toContain('Check your addition.');
    // Only the one authored feedback div.
    expect(body.match(/js-mc-feedback/g)).toHaveLength(1);
  });

  it('emits solution slot and confidence fieldset like fill-in-blank', () => {
    const { doc, mc } = mcDoc();
    mc.solution = [{ type: 'text', text: 'Two plus two is four.', marks: [] }];
    mc.hasConfidenceRating = true;
    const body = renderBody(doc);
    expect(body).toContain('js-solution');
    expect(body).toContain('Two plus two is four.');
    expect(body).toContain('js-confidence-rating');
    expect(body).toContain('name="conf-' + mc.id + '"');
    expect(body).toContain('data-has-confidence-rating="true"');
  });

  it('showAnswers pre-checks the correct choices and marks the key class', () => {
    const { doc } = mcDoc();
    const printed = renderActivityForPrint(doc, { showAnswers: true });
    expect(printed).toContain('mc-key-correct');
    expect(printed).toContain(' checked');
  });

  it('participates in the shared problem number sequence', () => {
    const doc = createEmptyDocument({ title: 'T' });
    const fib = createFillInBlankBlock();
    fib.content = [createBlankToken('x')];
    const mc = createMultipleChoiceBlock();
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [fib, mc];
    const body = renderBody(doc);
    expect(body).toContain('<div class="block-problem-number">1.</div>');
    expect(body).toContain('<div class="block-problem-number">2.</div>');
  });
});

describe('Problem numbering', () => {
  it('auto-numbers problems sequentially', () => {
    const doc = createEmptyDocument({ title: 'T' });
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [
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
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [createProblemBlock(), createProblemBlock()];
    const second = createSection('Part 2');
    second.rows[0]!.columns[0]!.blocks = [createProblemBlock()];
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
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [
      createProblemBlock(),
     overridden,
     createProblemBlock(),
    ];
    const body = renderBody(doc);
    expect(body).toContain('>1.<');
    expect(body).toContain('>99.<');
    expect(body).toContain('>3.<');
  });

  it('counts both problem and fill_in_blank toward numbering', () => {
    const doc = createEmptyDocument({ title: 'T' });
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [
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
      schemaVersion: 2,
      meta: { title: 'T', course: 'Algebra II', submissionMode: 'free', revisionMode: 'free', gradingMode: 'auto', activityType: 'worksheet', skills: [] },
      sections: [{
        id: '11111111-1111-1111-1111-111111111111',
        isCheckpoint: false,
        rows: [{ id: '55555555-5555-4555-8555-555555555555', columns: [{ id: '66666666-6666-4666-8666-666666666666', blocks: [{
          id: '22222222-2222-2222-2222-222222222222',
          type: 'paragraph',
          content: [
            { type: 'text', text: 'H', marks: [] },
            { type: 'text', text: '2', marks: [{ type: 'subscript' }] },
            { type: 'text', text: 'O', marks: [] },
            { type: 'text', text: ' x', marks: [] },
            { type: 'text', text: '2', marks: [{ type: 'superscript' }] },
          ],
        }] }] }],
      }],
    };
    const body = renderBody(doc);
    expect(body).toContain('<sub>2</sub>');
    expect(body).toContain('<sup>2</sup>');
  });
  it('wraps underline marks in <u>', () => {
    const doc: ActivityDocument = {
      schemaVersion: 2,
      meta: { title: 'T', course: 'Algebra II', submissionMode: 'free', revisionMode: 'free', gradingMode: 'auto', activityType: 'worksheet', skills: [] },
      sections: [{
        id: '11111111-1111-1111-1111-111111111111',
        isCheckpoint: false,
        rows: [{ id: '55555555-5555-4555-8555-555555555555', columns: [{ id: '66666666-6666-4666-8666-666666666666', blocks: [{
          id: '22222222-2222-2222-2222-222222222222',
          type: 'paragraph',
          content: [
            { type: 'text', text: 'key term', marks: [{ type: 'underline' }] },
          ],
        }] }] }],
      }],
    };
    const body = renderBody(doc);
    expect(body).toContain('<u>key term</u>');
  });
  it('renders a definition mark as a span (escaped plain-text fallback) + content template', () => {
    const doc: ActivityDocument = {
      schemaVersion: 2,
      meta: { title: 'T', course: 'Algebra II', submissionMode: 'free', revisionMode: 'free', gradingMode: 'auto', activityType: 'worksheet', skills: [] },
      sections: [{
        id: '11111111-1111-1111-1111-111111111111',
        isCheckpoint: false,
        rows: [{ id: '55555555-5555-4555-8555-555555555555', columns: [{ id: '66666666-6666-4666-8666-666666666666', blocks: [{
          id: '22222222-2222-2222-2222-222222222222',
          type: 'paragraph',
          content: [
            { type: 'text', text: 'factor', marks: [{ type: 'definition', content: [{ type: 'text', text: 'a number that "divides" exactly', marks: [] }] }] },
          ],
        }] }] }],
      }],
    };
    const body = renderBody(doc);
    // data-definition is the escaped plain-text fallback...
    expect(body).toContain(
      '<span class="definition" data-definition="a number that &quot;divides&quot; exactly" tabindex="0" role="button" aria-haspopup="dialog" aria-expanded="false">factor</span>',
    );
    // ...and the rich content lives in an adjacent hidden template.
    expect(body).toContain('<template class="js-definition-content">a number that "divides" exactly</template>');
    // No glossaryKey attribute unless the mark carries one.
    expect(body).not.toContain('data-glossary-key');
  });
  it('renders math and an optional image into the content template', () => {
    const doc: ActivityDocument = {
      schemaVersion: 2,
      meta: { title: 'T', course: 'Algebra II', submissionMode: 'free', revisionMode: 'free', gradingMode: 'auto', activityType: 'worksheet', skills: [] },
      sections: [{
        id: '11111111-1111-1111-1111-111111111111',
        isCheckpoint: false,
        rows: [{ id: '55555555-5555-4555-8555-555555555555', columns: [{ id: '66666666-6666-4666-8666-666666666666', blocks: [{
          id: '22222222-2222-2222-2222-222222222222',
          type: 'paragraph',
          content: [
            { type: 'text', text: 'hypotenuse', marks: [{ type: 'definition', content: [{ type: 'text', text: 'the longest side ', marks: [] }, { type: 'math_inline', latex: 'c' }], image: { src: 'https://example.com/triangle.png', alt: 'a right triangle' } }] },
          ],
        }] }] }],
      }],
    };
    const body = renderBody(doc);
    expect(body).toContain('<template class="js-definition-content">');
    expect(body).toContain('<img class="definition-image" src="https://example.com/triangle.png" alt="a right triangle" />');
    // Math is pre-rendered (KaTeX) inside the template.
    expect(body).toContain('class="katex"');
  });
  it('emits data-glossary-key only when the definition mark carries one', () => {
    const doc: ActivityDocument = {
      schemaVersion: 2,
      meta: { title: 'T', course: 'Algebra II', submissionMode: 'free', revisionMode: 'free', gradingMode: 'auto', activityType: 'worksheet', skills: [] },
      sections: [{
        id: '11111111-1111-1111-1111-111111111111',
        isCheckpoint: false,
        rows: [{ id: '55555555-5555-4555-8555-555555555555', columns: [{ id: '66666666-6666-4666-8666-666666666666', blocks: [{
          id: '22222222-2222-2222-2222-222222222222',
          type: 'paragraph',
          content: [
            { type: 'text', text: 'factor', marks: [{ type: 'definition', content: [{ type: 'text', text: 'a divisor', marks: [] }], glossaryKey: 'factor-noun' }] },
          ],
        }] }] }],
      }],
    };
    const body = renderBody(doc);
    expect(body).toContain('data-glossary-key="factor-noun"');
  });
});

describe('lists', () => {
  it('renders a bullet list as <ul> with content category', () => {
    const doc = createEmptyDocument({ title: 'T' });
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [
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
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [
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
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [
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
    expect(body).toContain('outer item<ul ');
  });

  it('dispatches mixed nesting (a bullet list inside an ordered list)', () => {
    const doc = createEmptyDocument({ title: 'T' });
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [
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
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [
      Object.assign(createBulletListBlock(), {
        items: [
          Object.assign(createListItem(), {
            content: [
              { type: 'text', text: 'plain ', marks: [] },
              { type: 'text', text: 'bold', marks: [{ type: 'bold' }] },
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
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [
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
    doc.sections[0]!.rows[0]!.columns[0]!.blocks = [para];
    const body = renderBody(doc);
    expect(body).toContain('data-block-id="' + para.id + '"');
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

describe('reference panel', () => {
  // A document with a scaffold reference panel (a heading + a math block).
  // printReferencePanel defaults true; opts.print flips the print gate.
  function docWithPanel(
    opts: { print?: boolean; title?: string } = {},
  ): ActivityDocument {
    const base = createEmptyDocument({ title: 'T' });
    return {
      ...base,
      meta: {
        ...base.meta,
        print: { ...base.meta.print, printReferencePanel: opts.print ?? true },
      },
      referencePanel: {
        title: opts.title ?? 'Formula reference',
        blocks: [
          Object.assign(createHeadingBlock(2), {
            content: [{ type: 'text', text: 'Key formulas', marks: [] }],
          }),
          Object.assign(createMathBlock(), { latex: 'a^2+b^2=c^2' }),
        ],
      },
    };
  }

  it('renders the screen tool (scaffold): summon button + hidden floating panel', () => {
    const html = renderActivity(docWithPanel(), ctx);
    expect(html).toContain(
      '<div class="reference-tool" data-block-category="scaffold">',
    );
    expect(html).toContain(
      '<button type="button" class="reference-summon" aria-haspopup="dialog" aria-expanded="false">Formula reference</button>',
    );
    // The panel ships hidden (invisible until summoned; permanently so
    // without JS) and focusable so the sidecar can move focus in on open.
    expect(html).toContain(
      '<aside class="reference-float" role="dialog" aria-label="Formula reference" tabindex="-1" hidden>',
    );
    expect(html).toContain(
      '<span class="reference-float-title">Formula reference</span>',
    );
    expect(html).toContain('Key formulas'); // a panel block actually rendered
  });

  it('falls back to a "Reference" label when the panel has no title', () => {
    const html = renderActivity(docWithPanel({ title: '' }), ctx);
    expect(html).toContain('class="reference-summon"');
    expect(html).toContain('>Reference</button>');
    expect(html).toContain('aria-label="Reference"');
  });

  it('places the screen tool in the .tool-corner cluster OUTSIDE <main>', () => {
    const html = renderActivity(docWithPanel(), ctx);
    const mainEnd = html.indexOf('</main>');
    expect(html.indexOf('<div class="tool-corner">')).toBeGreaterThan(mainEnd);
    expect(html.indexOf('<div class="reference-tool"')).toBeGreaterThan(mainEnd);
    // The print box still sits at the top of the worksheet, above the first
    // section (and inside <main>).
    expect(html.indexOf('<aside class="reference-print"')).toBeLessThan(
      html.indexOf('<section class="activity-section"'),
    );
  });

  it('shares the cluster with the calculator when both tools are present', () => {
    const base = docWithPanel();
    const calc = createCalculatorTool();
    const doc = { ...base, calculator: calc };
    const html = renderActivity(doc, {
      ...ctx,
      calculatorKitUrl: 'https://kit.example.com/graph-kit-abc123.js',
    });
    // One cluster; reference button before calculator button inside it.
    expect(html.match(/<div class="tool-corner">/g)).toHaveLength(1);
    const cluster = html.indexOf('<div class="tool-corner">');
    const refAt = html.indexOf('<div class="reference-tool"');
    const calcAt = html.indexOf('<div class="calculator-tool"');
    expect(refAt).toBeGreaterThan(cluster);
    expect(calcAt).toBeGreaterThan(refAt);
  });

  it('drops the print box when printReferencePanel is off, keeps the screen tool', () => {
    const html = renderActivity(docWithPanel({ print: false }), ctx);
    expect(html).toContain('class="reference-tool"');
    expect(html).not.toContain('class="reference-print"');
  });

  it('renders no panel markup (and no cluster) when the activity has no panel', () => {
    const html = renderActivity(createEmptyDocument({ title: 'T' }), ctx);
    // The block CSS is always inlined (it carries .reference-* rules), so
    // assert on MARKUP, not bare substrings that also live in the stylesheet.
    expect(html).not.toContain('<div class="reference-tool"');
    expect(html).not.toContain('<aside class="reference-print"');
    expect(html).not.toContain('<div class="tool-corner">');
    expect(html).toContain('class="activity-container"');
  });

  it('print document emits the box but not the screen tool', () => {
    const html = renderActivityForPrint(docWithPanel());
    expect(html).toContain('<aside class="reference-print"');
    expect(html).not.toContain('class="reference-tool"');
    expect(html).not.toContain('class="reference-float"');
  });

  it('print document omits the box when printReferencePanel is off', () => {
    const html = renderActivityForPrint(docWithPanel({ print: false }));
    expect(html).not.toContain('class="reference-print"');
  });

  it('escapes the panel title in both the label and the aria-label', () => {
    const html = renderActivity(docWithPanel({ title: '<x> & "y"' }), ctx);
    // escape() handles text content (& < >); attr() also escapes quotes.
    expect(html).toContain('&lt;x&gt; &amp; "y"');
    expect(html).toContain('aria-label="&lt;x&gt; &amp; &quot;y&quot;"');
    expect(html).not.toContain('<span class="reference-float-title"><x>');
  });

  it('inlines the sidecar script only when a panel exists', () => {
    // Compare against the committed generated bundle itself — exact, and the
    // CI staleness guard keeps it in sync with the sidecar source.
    expect(renderActivity(docWithPanel(), ctx)).toContain(referencePanelJs);
    expect(
      renderActivity(createEmptyDocument({ title: 'T' }), ctx),
    ).not.toContain(referencePanelJs);
  });

  it('print outputs carry neither the sidecar nor the floating panel', () => {
    const printDoc = renderActivityForPrint(docWithPanel());
    expect(printDoc).not.toContain(referencePanelJs);
    expect(printDoc).not.toContain('class="reference-float"');
  });
});

describe('calculator tool', () => {
  const KIT_URL = 'https://kit.example.com/graph-kit-abc123.js';
  const ctxWithKit: RenderContext = { ...ctx, calculatorKitUrl: KIT_URL };

  // A document with an enabled calculator; `over` tweaks the restriction flags.
  function docWithCalc(
    over: Partial<CalculatorRestrictions> = {},
  ): ActivityDocument {
    const base = createEmptyDocument({ title: 'T' });
    const calc = createCalculatorTool();
    return {
      ...base,
      calculator: { ...calc, restrictions: { ...calc.restrictions, ...over } },
    };
  }

  it('emits the scaffold (summon button + empty mount + config) when enabled and a kit URL is present', () => {
    const html = renderActivity(docWithCalc(), ctxWithKit);
    expect(html).toContain(
      '<div class="calculator-tool" data-block-category="scaffold"',
    );
    expect(html).toContain('data-calculator-mode="scientific"');
    expect(html).toContain(
      'data-calculator-kit-src="https://kit.example.com/graph-kit-abc123.js"',
    );
    expect(html).toContain(
      '<button type="button" class="calculator-summon" aria-haspopup="dialog" aria-expanded="false">',
    );
    expect(html).toContain('<div class="calculator-mount" hidden></div>');
  });

  it('places the tool OUTSIDE <main> so the runtime never walks it', () => {
    const html = renderActivity(docWithCalc(), ctxWithKit);
    expect(html.indexOf('class="calculator-tool"')).toBeGreaterThan(
      html.indexOf('</main>'),
    );
  });

  it('omits the calculator entirely when disabled', () => {
    const base = createEmptyDocument({ title: 'T' });
    const calc = createCalculatorTool();
    const doc = { ...base, calculator: { ...calc, enabled: false } };
    const html = renderActivity(doc, ctxWithKit);
    expect(html).not.toContain('class="calculator-tool"');
    expect(html).not.toContain('Calculator failed to load'); // no sidecar
  });

  it('omits the calculator when no kit URL is available, even if enabled (graceful)', () => {
    // ctx (no calculatorKitUrl): a summon button that can't load anything is
    // worse than no button, so the renderer emits nothing.
    const html = renderActivity(docWithCalc(), ctx);
    expect(html).not.toContain('class="calculator-tool"');
    expect(html).not.toContain('Calculator failed to load');
  });

  it('renders nothing for a document with no calculator field', () => {
    const html = renderActivity(createEmptyDocument({ title: 'T' }), ctxWithKit);
    expect(html).not.toContain('class="calculator-tool"');
  });

  it('inlines the summon sidecar only when a calculator is emitted', () => {
    // 'Calculator failed to load' is a string literal unique to the
    // calculator-summon sidecar (survives minification), so it discriminates
    // "sidecar inlined" from the always-present CSS/markup.
    expect(renderActivity(docWithCalc(), ctxWithKit)).toContain(
      'Calculator failed to load',
    );
    expect(renderActivity(docWithCalc(), ctx)).not.toContain(
      'Calculator failed to load',
    );
  });

  it('carries the configured restriction flags in data-calculator-config (HTML-escaped)', () => {
    const html = renderActivity(docWithCalc({ allowTrig: false }), ctxWithKit);
    // JSON in an attribute value is escaped by attr() — quotes become &quot;.
    expect(html).toContain('&quot;allowTrig&quot;:false');
    expect(html).toContain('&quot;allowLogExp&quot;:true');
  });

  it('cannot reach the print document (no kit URL there; print CSS also hides it)', () => {
    const printDoc = renderActivityForPrint(docWithCalc());
    expect(printDoc).not.toContain('class="calculator-tool"');
    expect(printDoc).not.toContain('Calculator failed to load');
  });
});

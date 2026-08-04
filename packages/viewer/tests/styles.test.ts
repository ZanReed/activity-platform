// =============================================================================
// styles.test.ts — the token-only guard for component CSS
// -----------------------------------------------------------------------------
// DESIGN.md: "Components use tokens only — a literal color/size/shadow in
// component CSS is a review-blocker." This makes that enforcement rather than
// a promise, for the same reason every other invariant here is a test: the
// rule holds for the first five components and quietly stops holding around
// the twentieth, and the failure (a hard-coded colour that ignores dark mode,
// or misses AA, or survives the print flatten) is invisible in light-mode
// review.
//
// COLOUR and SHADOW are absolute — every one must come from a token. Lengths
// are NOT, deliberately: hairline borders, content-relative `ch`/`em` sizing,
// and the @page margin have no token and should not get invented ones. The
// spacing SCALE is what matters, and that is what the token set covers.
// =============================================================================

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  colorTokens,
  staticTokens,
  blockRegistry,
  registeredBlockTypes,
} from '../src/index.js';

const css = readFileSync(
  new URL('../src/styles/viewer.css', import.meta.url),
  'utf8',
);
/** Comments legitimately mention colours and values; strip before scanning. */
const code = css.replace(/\/\*[\s\S]*?\*\//g, '');

describe('token-only component CSS', () => {
  it('contains no hex colour literals', () => {
    expect(code.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).toEqual([]);
  });

  it('contains no rgb/hsl colour literals', () => {
    expect(code.match(/\b(?:rgba?|hsla?)\s*\(/g) ?? []).toEqual([]);
  });

  it('contains no named colour literals', () => {
    // `transparent`, `inherit`, `currentColor`, and `none` are keywords, not
    // palette choices — a component saying "no background" is not picking one.
    const named = /(?<![\w-])(?:white|black|red|green|blue|orange|yellow|purple|gray|grey|silver|navy|teal)(?![\w-])/g;
    expect(code.match(named) ?? []).toEqual([]);
  });

  it('declares no raw box-shadow (shadows are tokens)', () => {
    for (const decl of code.match(/box-shadow\s*:[^;]+;/g) ?? []) {
      expect(decl).toMatch(/var\(--shadow-/);
    }
  });

  it('actually uses the token layer it is supposed to consume', () => {
    // A file that referenced no tokens would pass every check above.
    const used = new Set(
      [...code.matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]),
    );
    expect(used.size).toBeGreaterThan(25);
    // And every colour it uses is a REAL token name (catches typos, which
    // would otherwise fail silently as an unset custom property).
    // Colour AND static (the callout print-border STYLES are static tokens —
    // border-style, not a palette value — which the first run of this test
    // usefully pointed out).
    const declared = [
      ...(colorTokens as readonly string[]),
      ...(staticTokens as readonly string[]),
    ];
    const colorish = [...used].filter((name) =>
      /^--(?:color|state|callout)-/.test(name ?? ''),
    );
    for (const name of colorish) {
      expect(declared, `${name} is not a declared token`).toContain(name);
    }
    expect(colorish.length).toBeGreaterThan(10);
  });

  it('uses only custom properties that tokens.css actually declares', () => {
    // WIDER THAN THE COLOUR CHECK ABOVE, and it exists because the narrower one
    // let a real mistake through: the stale-version banner shipped with
    // `var(--font-size-sm)`, a name from no token family we have (the type
    // scale is `--type-*`). Nothing failed — an undeclared custom property
    // just resolves to nothing, so the rule silently did not apply. That is the
    // same silent-failure mode the colour check was written for, and there was
    // no reason to guard one family and not the rest.
    //
    // Scoped to OUR namespaces on purpose: `--activity-*` and `--print-*` come
    // from the published-page pipeline at render time and are legitimately
    // absent from tokens.css.
    const tokensCss = readFileSync(
      new URL('../src/tokens/tokens.css', import.meta.url),
      'utf8',
    );
    const declaredNames = new Set(
      [...tokensCss.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]),
    );
    const referenced = new Set(
      [...code.matchAll(/var\(\s*(--[a-z0-9-]+)/g)].map((m) => m[1]),
    );
    const ours = [...referenced].filter(
      (name) => !/^--(?:activity|print)-/.test(name ?? ''),
    );
    for (const name of ours) {
      expect(
        declaredNames.has(name ?? ''),
        `${name} is used in viewer.css but declared nowhere in tokens.css — ` +
          `it will silently resolve to nothing`,
      ).toBe(true);
    }
    expect(ours.length).toBeGreaterThan(20);
  });
});

describe('the floors the design rulings set', () => {
  it('sizes tap targets from the 44px token (6.1A)', () => {
    expect(code).toContain('var(--touch-target)');
  });

  it('shows a visible focus ring from the token (6.1A)', () => {
    expect(code).toMatch(/:focus-visible\s*\{[^}]*var\(--focus-ring\)/);
  });

  it('carries a reduced-motion block (6.1A)', () => {
    expect(code).toContain('prefers-reduced-motion');
  });

  it('carries a phone breakpoint (6.2A)', () => {
    expect(code).toMatch(/@media\s*\(max-width:/);
  });

  it('prints as a BLANK worksheet: chrome hidden, page margin set', () => {
    const print = code.slice(code.indexOf('@media print'));
    expect(print).toContain('@page');
    // The check control and every state mark are gone on paper.
    expect(print).toContain('.viewer-section__footer');
    expect(print).toContain('.viewer-state-pill');
    expect(print).toContain('.viewer-solution');
    expect(print).toMatch(/break-inside:\s*avoid/);
  });

  it('encodes callout variants in BORDER STYLE for grayscale (baseline print)', () => {
    const print = code.slice(code.indexOf('@media print'));
    for (const variant of ['info', 'warning', 'success', 'note']) {
      expect(print).toContain(`var(--callout-${variant}-print-border)`);
    }
  });
});

describe('the viewer never depends on the absence of a host reset', () => {
  // This has now bitten twice. First list markers: the app's CSS reset strips
  // ul/ol bullets, so worksheet lists rendered as loose sentences until
  // list-style was made explicit. Then heading weight: the same reset sets
  // `font-weight: inherit` on every heading element, so an <h2> rendered at
  // body weight — no hierarchy at all, on screen or on paper, until the print
  // contact sheet showed a worksheet heading indistinguishable from the
  // sentence under it.
  //
  // The rule generalises: anything the viewer relies on a UA default for is
  // one host stylesheet away from vanishing silently. These pin the properties
  // that have actually been lost.
  it('states heading weight explicitly (a reset would otherwise flatten it)', () => {
    for (const selector of [
      '.viewer-heading',
      '.viewer-section__title',
    ]) {
      const rule = code.slice(code.indexOf(`${selector} {`));
      const block = rule.slice(0, rule.indexOf('}'));
      expect(block, `${selector} inherits its weight from the host`).toMatch(
        /font-weight:\s*\d00/,
      );
    }
  });

  it('states list markers explicitly', () => {
    expect(code).toMatch(/\.viewer-list--bullet\s*\{[^}]*list-style/);
    expect(code).toMatch(/\.viewer-list--ordered\s*\{[^}]*list-style/);
  });
});

describe('the print stylesheet agrees with the registry it mirrors', () => {
  // CSS cannot import the registry, so the break-inside list in viewer.css is
  // kept by hand — and a hand-kept list drifts the moment somebody adds a block
  // type or changes a PrintSpec. This parses the list back out and compares it
  // to the registry, which is the declared contract the parity gate asserts. It
  // is the cheap half of that gate: no browser needed to catch a stylesheet
  // that has stopped matching its own spec.
  const print = code.slice(code.indexOf('@media print'));

  /** The `[data-block-type='x']` selectors in the rule that sets avoid. */
  const declaredAvoid = (): Set<string> => {
    const found = new Set<string>();
    // Each block of selectors ending in a break-inside: avoid declaration.
    for (const rule of print.split('}')) {
      if (!/break-inside:\s*avoid/.test(rule)) continue;
      for (const match of rule.matchAll(/\[data-block-type='([a-z_]+)'\]/g)) {
        if (match[1]) found.add(match[1]);
      }
    }
    return found;
  };

  it('gives break-inside:avoid to exactly the types whose PrintSpec declares it', () => {
    const fromRegistry = new Set(
      registeredBlockTypes.filter(
        (type) => blockRegistry[type].print.breakInside === 'avoid',
      ),
    );
    expect([...declaredAvoid()].sort()).toEqual([...fromRegistry].sort());
  });

  it('does not pin any type that declares auto (the old blanket rule did)', () => {
    // The stylesheet used to apply avoid to `.viewer-block` wholesale, which
    // silently contradicted the registry for the seven types that declare auto
    // — paragraphs and lists were being held whole across page breaks, which is
    // wrong for long prose and wastes paper.
    const autoTypes = registeredBlockTypes.filter(
      (type) => blockRegistry[type].print.breakInside === 'auto',
    );
    const avoid = declaredAvoid();
    for (const type of autoTypes) {
      expect(avoid.has(type), `${type} declares auto but the CSS pins avoid`).toBe(false);
    }
    expect(print).not.toMatch(/\.viewer-block\s*,[^{]*\{[^}]*break-inside:\s*avoid/);
  });

  it('hides the live kit board so only the static twin prints (S5-1)', () => {
    expect(print).toContain('.viewer-graph__canvas');
    expect(print).toContain('.viewer-number-line__canvas');
    expect(print).toContain('.viewer-data-plot__canvas');
    expect(print).toContain('[data-print-svg]');
  });

  it('forces every colour it prints with to a light value (S5-9)', () => {
    // Paper is white regardless of the screen theme, and viewer print rules
    // resolve their colours from theme tokens — so a dark-mode student would
    // print near-white ink on white paper. Measured, not hypothesised:
    // --vw-color-ink is #f1f5f9 in dark mode.
    //
    // tokens.css already flattens the palette inside its own @media print
    // block, so the defence exists; what was missing is this pin. Without it,
    // the next print rule that reaches for a colour token nobody remembered to
    // flatten fails silently and invisibly — the failure only shows up on
    // paper, in someone else's classroom.
    //
    // The callout print-border tokens are exempt BY KIND: they carry border
    // STYLES (solid/dashed/double/dotted), which is precisely why the variant
    // survives grayscale, and they are declared once with no dark override.
    const tokensCss = readFileSync(
      new URL('../src/tokens/tokens.css', import.meta.url),
      'utf8',
    );
    const tokensPrintBlock = tokensCss.slice(tokensCss.indexOf('@media print'));
    const forcedInPrint = new Set(
      [...tokensPrintBlock.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]),
    );

    const colourTokensUsedInPrint = [
      ...new Set([...print.matchAll(/var\(\s*(--[a-z0-9-]+)/g)].map((m) => m[1])),
    ].filter(
      (name) =>
        /^--(?:vw-color|state|callout)-/.test(name ?? '') &&
        !/-print-border$/.test(name ?? ''),
    );

    expect(colourTokensUsedInPrint.length).toBeGreaterThan(0);
    for (const name of colourTokensUsedInPrint) {
      expect(
        forcedInPrint.has(name ?? ''),
        `${name} is printed with but never flattened to a light value in ` +
          `tokens.css @media print — a dark-mode student prints it on white paper`,
      ).toBe(true);
    }
  });

  it('keeps the print-only paper affordances out of the screen view', () => {
    // They live in the DOM permanently (printing cannot wait on a render), so
    // the screen rule hiding them is what stops a worksheet showing circle-me
    // letters and empty number boxes to a student working online.
    const screen = code.slice(0, code.indexOf('@media print'));
    for (const selector of [
      '.viewer-mc__letter',
      '.viewer-matching__letter-line',
      '.viewer-ordering__number-box',
      '[data-print-svg]',
    ]) {
      expect(screen, `${selector} is not hidden on screen`).toContain(selector);
    }
  });
});

describe('the in-page print preview mirrors the printed page (S5.5 D24)', () => {
  // WHY THIS GUARD EXISTS. The teacher route previews in-page (D4A), so the
  // paper conventions have to be visible on a SCREEN render — but every one of
  // them lives behind `@media print`, and CSS cannot share one rule body
  // between a media query and an attribute selector. The show/hide half is
  // therefore written twice, and duplication without a guard is just drift with
  // a delay: a treatment added to the print block and forgotten here produces a
  // preview that quietly stops predicting the printout.
  //
  // Only VISIBILITY is mirrored. Page geometry (size, margins, pagination) is
  // deliberately absent from the preview because a screen has none of it.

  const printBlock = code.slice(code.indexOf('@media print'));
  const previewBlock = code.slice(
    code.indexOf("[data-viewer-mode='print']"),
    code.indexOf('@media print'),
  );

  /** Selectors given `display: none` inside a block, ignoring the preview's
   *  own attribute prefix so the two lists are comparable. */
  function hiddenSelectors(block: string): Set<string> {
    const out = new Set<string>();
    for (const match of block.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const body = match[2] ?? '';
      if (!/display:\s*none/.test(body)) continue;
      for (const selector of (match[1] ?? '').split(',')) {
        const cleaned = selector
          .replace(/:where\(\[data-viewer-mode='print'\]\)\s*/g, '')
          .trim();
        if (cleaned.startsWith('.') || cleaned.startsWith('[')) out.add(cleaned);
      }
    }
    return out;
  }

  it('hides in the preview everything the printed page hides', () => {
    const inPrint = hiddenSelectors(printBlock);
    const inPreview = hiddenSelectors(previewBlock);

    expect(inPrint.size).toBeGreaterThan(0);
    for (const selector of inPrint) {
      expect(
        inPreview.has(selector),
        `${selector} is hidden when printing but still shows in the in-page ` +
          'preview — a teacher would see chrome that will not be on the paper',
      ).toBe(true);
    }
  });

  it('reveals each affordance with the SAME display value print gives it', () => {
    // The presence check below is not enough, and this test exists because that
    // gap shipped a bug: the preview revealed .viewer-print-header with a
    // blanket `display: block` while print lays it out as a flex row. The
    // preview selectors carry an attribute, so they OUTSPECIFY the print
    // block's own — meaning a wrong value here does not merely mis-render the
    // preview, it overrides the printed page too. The Name and Date fields lost
    // the 1.5rem gap between them and ran together on paper.
    const displaysIn = (block: string): Map<string, string> => {
      const out = new Map<string, string>();
      for (const match of block.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
        const display = /display:\s*([a-z-]+)/.exec(match[2] ?? '')?.[1];
        if (!display || display === 'none') continue;
        for (const selector of (match[1] ?? '').split(',')) {
          const cleaned = selector
            .replace(/:where\(\[data-viewer-mode='print'\]\)\s*/g, '')
            .trim();
          if (cleaned.startsWith('.') || cleaned.startsWith('[')) {
            out.set(cleaned, display);
          }
        }
      }
      return out;
    };

    const printed = displaysIn(printBlock);
    const preview = displaysIn(previewBlock);

    for (const [selector, value] of preview) {
      const printValue = printed.get(selector);
      if (printValue === undefined) continue; // preview-only affordance
      expect(
        value,
        `${selector} is ${value} in the preview but ${printValue} when printing ` +
          '— and the preview selector wins on specificity, so this changes the ' +
          'PRINTED page too',
      ).toBe(printValue);
    }
  });

  it('reveals in the preview every paper affordance the printed page reveals', () => {
    // The affordances hidden on screen by the base stylesheet, which print
    // turns back on. Each must also come back for the preview, or the teacher
    // is judging work space against furniture that is not there.
    for (const selector of [
      '.viewer-mc__letter',
      '.viewer-matching__letter-line',
      '.viewer-ordering__number-box',
      '.viewer-print-header',
      '.viewer-print-heading',
      '[data-print-svg]',
      '.viewer-reference-print',
      '.viewer-glossary',
    ]) {
      expect(
        previewBlock,
        `${selector} prints but is not revealed in the in-page preview`,
      ).toContain(selector);
    }
  });
});

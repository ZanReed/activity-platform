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
import { colorTokens, staticTokens } from '../src/index.js';

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

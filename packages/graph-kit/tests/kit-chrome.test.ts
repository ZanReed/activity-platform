// @vitest-environment jsdom
// =============================================================================
// kit-chrome.test.ts — the calculator stylesheet's two new seams (C12, C14, C8)
// -----------------------------------------------------------------------------
// jsdom, because calculator.ts imports mathlive at module scope. It can be
// IMPORTED here (the module loads fine); it cannot be MOUNTED — MathfieldElement
// is not a constructor in mathlive's node build, which is why the widget's own
// behaviour stays browser-verified and only its stylesheet is pinned here.
//
// Three things this file exists to catch, none of which a mount test would see:
//
//  1. A var(--gk-*) the rules READ that no theme block DEFINES. An undefined
//     custom property does not error — it renders as nothing, so a border
//     silently disappears. This is the repo's signature defect (a declaration
//     with nothing behind it) with the arrow reversed, and it is the specific
//     risk created by generating the theme blocks from a hand-written role list.
//  2. Light and dark drifting apart. They are generated from ONE list precisely
//     so they cannot, and this is the test that proves the generation, not the
//     intention.
//  3. The sheet rules losing their specificity tie. [data-sheet] and [data-mode]
//     are both 0-2-0, so the ONLY thing making the bottom sheet win is that its
//     rules come later in the file. That is invisible at the edit site.
// =============================================================================

import { describe, it, expect } from 'vitest';
import { KIT_CSS } from '../src/calculator.js';
import { GK_CHROME, GK_CHROME_DARK } from '../src/graph-colors.js';

/** Custom properties DEFINED by a rule block, given its selector. */
function definedVars(selector: string): Set<string> {
  const start = KIT_CSS.indexOf(selector + ' {');
  expect(start, `${selector} is missing from the stylesheet`).toBeGreaterThan(-1);
  const body = KIT_CSS.slice(start, KIT_CSS.indexOf('}', start));
  return new Set([...body.matchAll(/(--gk-[a-z0-9-]+)\s*:/g)].map((m) => m[1]!));
}

const LIGHT = '.gk-cal';
const DARK = ".gk-cal[data-theme='dark']";

describe('chrome tokens — every var read is a var defined', () => {
  it('defines every --gk-* custom property the rules reference', () => {
    const defined = definedVars(LIGHT);
    const read = new Set(
      [...KIT_CSS.matchAll(/var\((--gk-[a-z0-9-]+)/g)].map((m) => m[1]!),
    );
    // --gk-z-panel is the host's to set (the viewer points it at
    // --z-calculator); the kit only ever reads it WITH a fallback, which is
    // asserted separately below.
    read.delete('--gk-z-panel');
    const missing = [...read].filter((name) => !defined.has(name));
    expect(missing).toEqual([]);
  });

  it('defines no property that nothing reads', () => {
    // The other direction: a token generated into every panel that no rule
    // consumes is dead weight and a false signal to the next reader.
    const read = new Set(
      [...KIT_CSS.matchAll(/var\((--gk-[a-z0-9-]+)/g)].map((m) => m[1]!),
    );
    const unread = [...definedVars(LIGHT)].filter((name) => !read.has(name));
    expect(unread).toEqual([]);
  });
});

describe('dark chrome (C14)', () => {
  it('re-points exactly the light block’s properties — no more, no fewer', () => {
    // The drift guard. Both blocks come from one role list, so this passing is
    // the proof that the generation works; it failing means someone wrote one
    // of them by hand again.
    expect([...definedVars(DARK)].sort()).toEqual([...definedVars(LIGHT)].sort());
  });

  it('scopes dark ABOVE the defaults, so the attribute actually wins', () => {
    // .gk-cal[data-theme='dark'] is 0-2-0 against .gk-cal's 0-1-0. If someone
    // "simplifies" this to a bare class or a media query, the panel silently
    // stays light.
    expect(KIT_CSS).toContain(DARK + ' {');
    expect(KIT_CSS.indexOf(DARK)).toBeGreaterThan(KIT_CSS.indexOf(LIGHT + ' {'));
  });

  it('carries the dark palette’s values, not the light one’s', () => {
    // Bound to the actual emitted text: a generator that silently fell back to
    // GK_CHROME for both blocks would pass every structural check above.
    const darkBody = KIT_CSS.slice(KIT_CSS.indexOf(DARK), KIT_CSS.indexOf('}', KIT_CSS.indexOf(DARK)));
    expect(darkBody).toContain(`--gk-bg: ${GK_CHROME_DARK.bg};`);
    expect(darkBody).not.toContain(`--gk-bg: ${GK_CHROME.bg};`);
    expect(GK_CHROME_DARK.bg).not.toBe(GK_CHROME.bg);
  });
});

describe('the z-index seam (C12/D18)', () => {
  it('reads the host’s --gk-z-panel with a standalone fallback', () => {
    // Was a bare `z-index: 120` that agreed with the viewer's --z-calculator
    // token by coincidence. The fallback keeps /dev/calculator and the editor
    // preview — neither of which sets the var — rendering exactly as before.
    expect(KIT_CSS).toMatch(/\.gk-cal-floating \{[^}]*z-index: var\(--gk-z-panel, 120\)/s);
    expect(KIT_CSS).not.toMatch(/z-index: 120;/);
  });

  it('keeps the in-panel keyboard above whatever the host chose', () => {
    // The virtual keyboard renders INSIDE the panel; a fixed 130 would sink
    // beneath the panel the moment a host raised --gk-z-panel past it.
    expect(KIT_CSS).toContain('z-index: calc(var(--gk-z-panel, 120) + 10)');
  });
});

describe('the narrow-screen sheet (C8)', () => {
  it('overrides the graphing size that made the panel overflow', () => {
    // 24rem min-width beat max-width: 95vw and hung 123px off a 375px screen.
    expect(KIT_CSS).toMatch(
      /\.gk-cal-floating\[data-sheet='on'\]\[data-mode='graphing'\] \{[^}]*min-width: 0/s,
    );
  });

  it('comes AFTER the rules it overrides — the tie-break is source order', () => {
    // Both selectors are 0-2-0. Moving these rules up the file (a tidy-up that
    // looks free) puts the panel back off-screen on a phone.
    expect(KIT_CSS.indexOf(".gk-cal-floating[data-sheet='on']")).toBeGreaterThan(
      KIT_CSS.indexOf(".gk-cal[data-mode='graphing']"),
    );
  });

  it('stacks the two columns instead of splitting 375px between them', () => {
    // Side by side, the board gets ~130px on a phone. Hiding the col-resize
    // splitter goes with it: it would resize the wrong axis once stacked.
    expect(KIT_CSS).toMatch(
      /\.gk-cal-floating\[data-sheet='on'\] \.gk-cal-body \{[^}]*flex-direction: column/s,
    );
    expect(KIT_CSS).toMatch(
      /\.gk-cal-floating\[data-sheet='on'\] \.gk-cal-splitter \{[^}]*display: none/s,
    );
  });
});

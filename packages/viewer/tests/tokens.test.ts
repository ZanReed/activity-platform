// =============================================================================
// tokens.test.ts — the token-layer guard suite (S0, rulings 5.1A + 6.1A)
// -----------------------------------------------------------------------------
// Parses tokens.css (comments stripped, four blocks segmented by their at-rule
// markers) and proves: the declared vocabulary matches tokens.ts exactly; every
// theme block re-declares the full color-role set; the two dark blocks (media
// and forced) are value-identical; and the state vocabulary holds WCAG AA in
// both themes — the first brick of the 6.1A CI contrast check.
// =============================================================================

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { colorTokens, staticTokens, stateNames } from '../src/index.js';

const css = readFileSync(
  new URL('../src/tokens/tokens.css', import.meta.url),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, ''); // strip comments — they mention token names

// Segment the file by its top-level markers (order is part of the contract).
const darkMediaStart = css.indexOf('@media (prefers-color-scheme: dark)');
const forcedDarkStart = css.indexOf('\n:root[data-theme="dark"]');
const printStart = css.indexOf('@media print');
expect(darkMediaStart).toBeGreaterThan(0);
expect(forcedDarkStart).toBeGreaterThan(darkMediaStart);
expect(printStart).toBeGreaterThan(forcedDarkStart);

const segments = {
  root: css.slice(0, darkMediaStart),
  darkMedia: css.slice(darkMediaStart, forcedDarkStart),
  forcedDark: css.slice(forcedDarkStart, printStart),
  print: css.slice(printStart),
};

function declarations(segment: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const match of segment.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    out.set(match[1]!, match[2]!.trim());
  }
  return out;
}

const root = declarations(segments.root);
const darkMedia = declarations(segments.darkMedia);
const forcedDark = declarations(segments.forcedDark);
const print = declarations(segments.print);

const sortedColorTokens = [...colorTokens].sort();

// ---- Namespace isolation from the host app ---------------------------------
// tokens.css is imported by the APP (routes/StudentViewer + routes/DevViewer,
// both eagerly reached from App.tsx), so it loads on EVERY route and declares
// onto the shared document :root — UNLAYERED, while the app's Tailwind @theme
// compiles into @layer theme. Unlayered beats layered regardless of source
// order, so any name this file shares with the app is silently won HERE,
// app-wide, and no app test would see it.
//
// It happened: this layer declared plain --color-* / --radius-* and overrode
// seven app roles. --color-accent-strong was the sharp one — the two layers
// mean OPPOSITE things (here: accent's hover, so dark BRIGHTENS to #93c5fd
// under dark ink; app: a fill under WHITE ink, so dark must stay dark), and the
// app's Print button rendered white text at 1.80:1.
//
// So: no token here may sit in a namespace Tailwind's @theme owns. This is the
// cheap unit-level pin for it — a collision is otherwise only observable in a
// running browser, which is a slow and easily-skipped place to find out.
const TAILWIND_THEME_NAMESPACES = [
  'color', 'radius', 'font', 'shadow', 'inset-shadow', 'drop-shadow',
  'text-shadow', 'text', 'font-weight', 'tracking', 'leading', 'breakpoint',
  'container', 'spacing', 'blur', 'perspective', 'aspect', 'ease', 'animate',
];

describe('namespace isolation (the viewer must not squat Tailwind @theme keys)', () => {
  it.each(TAILWIND_THEME_NAMESPACES)(
    'declares no token in the --%s-* namespace',
    (namespace) => {
      const squatters = [...root.keys()].filter((name) =>
        name.startsWith(`--${namespace}-`),
      );
      expect(
        squatters,
        `${squatters.join(', ')} collide with Tailwind's --${namespace}-* theme ` +
          `namespace, so they silently override the app's role of the same name ` +
          `on every route. Prefix with --vw- (alias explicitly if a value really ` +
          `should be shared: --vw-color-x: var(--color-x)).`,
      ).toEqual([]);
    },
  );
});

describe('vocabulary sync (tokens.css ↔ tokens.ts)', () => {
  it(':root declares exactly the color + static tokens', () => {
    expect([...root.keys()].sort()).toEqual(
      [...colorTokens, ...staticTokens].sort(),
    );
  });

  it('each theme block re-declares exactly the color roles', () => {
    expect([...darkMedia.keys()].sort()).toEqual(sortedColorTokens);
    expect([...forcedDark.keys()].sort()).toEqual(sortedColorTokens);
    expect([...print.keys()].sort()).toEqual(sortedColorTokens);
  });

  it('the media-dark and forced-dark blocks are value-identical', () => {
    for (const token of colorTokens) {
      expect(forcedDark.get(token), token).toBe(darkMedia.get(token));
    }
  });

  it('every state name has its ink/border/surface trio in the vocabulary', () => {
    for (const state of stateNames) {
      for (const part of ['ink', 'border', 'surface']) {
        expect(colorTokens).toContain(`--state-${state}-${part}`);
      }
    }
  });
});

// ---- WCAG AA contrast (ruling 6.1A: state colors are CI-checked) ------------

function luminance(hex: string): number {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) throw new Error(`expected a 6-digit hex color, got "${hex}"`);
  const [r, g, b] = [0, 2, 4].map((offset) => {
    const channel = parseInt(match[1]!.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [
    number,
    number,
  ];
  return (hi + 0.05) / (lo + 0.05);
}

const themes = [
  { name: 'light', decls: root },
  { name: 'dark', decls: forcedDark },
] as const;

describe.each(themes)('WCAG AA — $name theme', ({ decls }) => {
  const value = (token: string) =>
    decls.get(token) ?? root.get(token) ?? expect.fail(`missing ${token}`);

  it.each([...stateNames])('state "%s" ink is AA on paper and on its surface', (state) => {
    const ink = value(`--state-${state}-ink`);
    expect(contrast(ink, value('--vw-color-paper'))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(ink, value(`--state-${state}-surface`))).toBeGreaterThanOrEqual(4.5);
  });

  it('body ink and muted ink are AA on paper', () => {
    expect(contrast(value('--vw-color-ink'), value('--vw-color-paper'))).toBeGreaterThanOrEqual(4.5);
    expect(
      contrast(value('--vw-color-ink-muted'), value('--vw-color-paper')),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it('accent is AA on paper (links, focus rings carry meaning)', () => {
    expect(contrast(value('--vw-color-accent'), value('--vw-color-paper'))).toBeGreaterThanOrEqual(
      4.5,
    );
  });
});

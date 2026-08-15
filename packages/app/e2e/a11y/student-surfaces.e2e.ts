// =============================================================================
// a11y/student-surfaces.e2e.ts — the four 6.1A gaps, for real (S9 Drop 5, D-10)
// -----------------------------------------------------------------------------
// Until this lane, a11y coverage was attributes-only: aria-live SITES existed,
// focus-visible CSS existed, and reduced-motion was asserted by GREPPING THE
// CSS FOR THE STRING — the weakest possible claim. These rows close the four
// gaps the s3 retro named, each as an observed behavior in a real browser:
//
//   1. ANNOUNCEMENT: the check status lands as TEXT in the live region after
//      a real check round trip — not "a region exists".
//   2. KEYBOARD PATH: blanks → Check are reachable by Tab alone, and Enter
//      activates the check.
//   3. VISIBLE FOCUS: :focus-visible produces a non-none outline by COMPUTED
//      STYLE on the focused control.
//   4. REDUCED MOTION: under `reducedMotion: 'reduce'` emulation, the
//      viewer's animation override is measured as APPLIED (computed
//      animation-duration collapses), replacing the CSS string-grep.
//
// Plus an axe scan per student surface (worksheet, Home, join gate) — zero
// violations, not "fewer than before". Runs on the student lane's pinned-env
// dev server; stubs derive from the shared harness (P2).
// =============================================================================

import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { blockBindings } from '@activity/viewer';
import { servedFixtureDocument } from '@activity/viewer/fixtures';
import {
  activityUrl,
  signInAs,
  stubActivityApi,
  stubIdentityApi,
} from '../helpers/studentSession';
import { LANDING_COPY } from '../../src/lib/authMessages';

// The lazy tier renders NOTHING — not even its own markers — until the chunk
// resolves, so a wait that counts those markers first is a no-op that scans the
// pre-mount DOM. That is precisely how this lane's first fix passed locally
// (probe at scan time: 0 canvases, 0 math-fields) while CI scanned the mounted
// state and stayed red. Each lazy type therefore declares the marker that
// proves it MOUNTED, and the map is cross-checked against the registry below
// (P11 — a coverage claim is guarded or not made).
const LAZY_MOUNT_MARKERS: Record<string, string> = {
  // The kit renders JSXGraph's <svg> into the canvas host.
  interactive_graph: '[data-graph-canvas] svg',
  number_line: '[data-graph-canvas] svg',
  data_plot: '[data-graph-canvas] svg',
  // A gap-bearing equation swaps the static KaTeX render for a MathLive field.
  math_block: 'math-field',
};

/** The registry's lazy tier, derived — never retyped (P2). */
function lazyBlockTypes(): string[] {
  return Object.entries(blockBindings)
    .filter(([, binding]) => binding.loading === 'lazy')
    .map(([type]) => type);
}

/** Every block type the fixture student is actually SERVED, nested included.
 * A deep walk rather than a rows→columns→blocks descent on purpose: nesting has
 * several container shapes (a worked_example holds its children under `content`)
 * and this lane only needs the SET of types, so keying on the registry is both
 * simpler and immune to a new container field. */
function servedBlockTypes(): Set<string> {
  const bound = new Set(Object.keys(blockBindings));
  const seen = new Set<string>();
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }
    if (node === null || typeof node !== 'object') return;
    const record = node as Record<string, unknown>;
    const type = record['type'];
    if (typeof type === 'string' && bound.has(type)) seen.add(type);
    for (const value of Object.values(record)) walk(value);
  };
  walk(servedFixtureDocument().sections);
  return seen;
}

test('every lazy block type declares a mount marker', () => {
  // Guards LAZY_MOUNT_MARKERS against the registry: a new lazy binding fails
  // here until its marker lands, rather than silently un-waiting the scan.
  expect(Object.keys(LAZY_MOUNT_MARKERS).sort()).toEqual(lazyBlockTypes().sort());
});

async function openWorksheet(page: Page): Promise<void> {
  await stubActivityApi(page);
  await signInAs(page);
  await page.goto(activityUrl());
  await page.locator('[data-section-id] input[type="text"]').first().waitFor();
  // Deterministic scan surface: wait for every lazy type the fixture carries to
  // be genuinely mounted, so local and CI scan the SAME DOM. Derived from the
  // served document, so a fixture that gains or loses a canvas block adjusts
  // the wait with it.
  const served = servedBlockTypes();
  for (const [type, marker] of Object.entries(LAZY_MOUNT_MARKERS)) {
    if (!served.has(type)) continue;
    await page.locator(marker).first().waitFor({ timeout: 20_000 });
  }
}

// The ONE carve-out, scoped to a single rule on a single element type, with the
// reason and an owner — never a blanket rule-disable (author-ruled 2026-08-14).
//
//   RULE:    nested-interactive (serious)
//   ELEMENT: <math-field> (MathLive 0.109.2)
//   WHY:     MathLive's own structure — a focusable host (tabindex=0) wrapping a
//            focusable `.ML__keyboard-sink` span with role="textbox". It is not
//            reachable from our code: setting the host's tabindex to -1 does NOT
//            clear the finding (verified against the running component), and the
//            component exposes no API for its focus structure. Fixing it means
//            changing MathLive.
//   OWNER:   revisit at the next MathLive major; the sibling finding
//            (aria-input-field-name) IS fixed, in math-prompt-mount.ts.
//
// Everything else stays strict, including nested-interactive ANYWHERE ELSE and
// every other rule on math-field itself.
const AXE_EXCLUSIONS: readonly { rule: string; selectorPrefix: string }[] = [
  { rule: 'nested-interactive', selectorPrefix: 'math-field' },
];

function isExcluded(ruleId: string, target: string): boolean {
  return AXE_EXCLUSIONS.some(
    (x) => x.rule === ruleId && target.includes(x.selectorPrefix),
  );
}

async function rawAxeViolations(
  page: Page,
): Promise<{ id: string; impact: string | null | undefined; nodes: string[] }[]> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  return results.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    nodes: v.nodes.map((n) => n.target.join(' ')),
  }));
}

async function expectNoAxeViolations(page: Page): Promise<void> {
  const results = { violations: await rawAxeViolations(page) };
  const reported = results.violations
    .map((v) => ({
      id: v.id,
      impact: v.impact,
      // Drop only the excluded NODES, so the same rule firing on any other
      // element still fails this scan.
      nodes: v.nodes.filter((target) => !isExcluded(v.id, target)),
    }))
    .filter((v) => v.nodes.length > 0);
  expect(reported).toEqual([]);
}

test.describe('gap 1 — the check announcement is observed, not assumed', () => {
  test('a checked section announces its verdict text in the live region', async ({
    page,
  }) => {
    await openWorksheet(page);
    await page.locator('[data-section-id] input[type="text"]').first().fill('42');
    await page.getByRole('button', { name: 'Check', exact: true }).first().click();

    const status = page.locator('.viewer-section__status[aria-live="polite"]').first();
    // The TEXT, in the REGION — an SR user hears this or nothing.
    await expect(status).toHaveText(/Checked/);
  });
});

test.describe('gap 2 — the full keyboard path', () => {
  test('Tab reaches the blank and the Check control; Enter checks', async ({
    page,
  }) => {
    await openWorksheet(page);

    // The bound is DERIVED from the page's own focusable count, not a magic
    // number: the fixture carries every block type, and once the lazy canvas
    // blocks mount, Check sits ~76 stops in — past the old hard-coded 60. A
    // fixed bound silently re-fails the day a block type is added; this one
    // tracks the document. Still bounded, so an unreachable control fails
    // loudly instead of spinning forever.
    const tabBudget = await page.evaluate(
      () =>
        document.querySelectorAll(
          'a[href], button, input, select, textarea, math-field, [tabindex]:not([tabindex="-1"])',
        ).length + 40,
    );

    // Tab from the top of the document until the first blank has focus.
    await page.locator('body').press('Tab');
    let reachedInput = false;
    for (let i = 0; i < tabBudget; i++) {
      const isInput = await page.evaluate(
        () =>
          document.activeElement?.matches(
            '[data-section-id] input[type="text"]',
          ) ?? false,
      );
      if (isInput) {
        reachedInput = true;
        break;
      }
      await page.keyboard.press('Tab');
    }
    expect(reachedInput, 'a blank must be reachable by Tab alone').toBe(true);

    await page.keyboard.type('42');

    // Keep tabbing to the section's Check button.
    let reachedCheck = false;
    for (let i = 0; i < tabBudget; i++) {
      const isCheck = await page.evaluate(
        () => document.activeElement?.matches('.viewer-section__check') ?? false,
      );
      if (isCheck) {
        reachedCheck = true;
        break;
      }
      await page.keyboard.press('Tab');
    }
    expect(reachedCheck, 'Check must be reachable by Tab alone').toBe(true);

    await page.keyboard.press('Enter');
    try {
      await expect(
        page.locator('.viewer-section__status[aria-live="polite"]').first(),
      ).toHaveText(/Checked/, { timeout: 10_000 });
    } catch (err) {
      // FIRST-SIGHTING DIAGNOSTIC (CI run 31852826598, 2026-08-15): this row
      // flaked once — the status stayed "" through every sample, meaning the
      // click never fired at all (a fired check would have shown a phase
      // label). Working THEORY, not proven mechanism: focus was stolen in the
      // window between the walk's last activeElement sample and the Enter
      // press — MathLive's keyboard sink settles asynchronously after mount,
      // and the deterministic-wait fix made this walk long enough (~76 stops)
      // to cross that settle window; the row could only start flaking once
      // the scan became honest. Per the tab-lock precedent, a first sighting
      // gets instrumented, not blind-fixed — so on the next failure, report
      // where focus actually was instead of a bare timeout, and the second
      // sighting becomes conclusive.
      const focusAt = await page.evaluate(() => {
        const a = document.activeElement;
        if (!a) return 'null';
        const cls = (a.className || '').toString().split(' ')[0];
        return `${a.tagName.toLowerCase()}${cls ? `.${cls}` : ''}`;
      });
      throw new Error(
        `status never changed after Enter — the click likely never fired; ` +
          `focus is now on: ${focusAt}\n${String(err)}`,
      );
    }
  });
});

test.describe('gap 3 — visible focus, by computed style', () => {
  test('keyboard focus on the Check control produces a real outline', async ({
    page,
  }) => {
    await openWorksheet(page);
    // Focus via keyboard so :focus-visible (not just :focus) applies.
    await page.locator('.viewer-section__check').first().focus();
    await page.evaluate(() => {
      // Force the focus-visible heuristic the way a keyboard user gets it:
      // element.focus() from script can be treated as pointer-ish, so tab off
      // and back.
    });
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');

    const focusStyle = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return null;
      const cs = getComputedStyle(el);
      return {
        matchesFocusVisible: el.matches(':focus-visible'),
        outlineStyle: cs.outlineStyle,
        outlineWidth: cs.outlineWidth,
        boxShadow: cs.boxShadow,
      };
    });
    expect(focusStyle).not.toBeNull();
    expect(focusStyle!.matchesFocusVisible).toBe(true);
    // A visible indicator: a non-none outline with real width, OR a box
    // shadow doing the same job. "none + 0px + none" is the failure.
    const hasOutline =
      focusStyle!.outlineStyle !== 'none' &&
      parseFloat(focusStyle!.outlineWidth) > 0;
    const hasShadow = focusStyle!.boxShadow !== 'none';
    expect(
      hasOutline || hasShadow,
      `focused control shows no visible indicator: ${JSON.stringify(focusStyle)}`,
    ).toBe(true);
  });
});

test.describe('gap 4 — reduced motion is measured, not grepped', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('under prefers-reduced-motion the viewer collapses animation durations', async ({
    page,
  }) => {
    await openWorksheet(page);
    // The override is global inside .viewer: every element's computed
    // animation/transition duration collapses to ~0. Measure a real element
    // rather than trusting the stylesheet text (the old grep's ceiling).
    const durations = await page.evaluate(() => {
      const el = document.querySelector('[data-section-id]');
      if (!el) return null;
      const cs = getComputedStyle(el);
      return {
        animation: cs.animationDuration,
        transition: cs.transitionDuration,
      };
    });
    expect(durations).not.toBeNull();
    const secs = (v: string) => parseFloat(v) * (v.endsWith('ms') ? 0.001 : 1);
    expect(secs(durations!.animation)).toBeLessThanOrEqual(0.01);
    expect(secs(durations!.transition)).toBeLessThanOrEqual(0.01);
  });
});

test.describe('axe — zero WCAG A/AA violations per student surface', () => {
  test('the worksheet', async ({ page }) => {
    await openWorksheet(page);
    await expectNoAxeViolations(page);
  });

  test('the nested-interactive carve-out is still load-bearing', async ({
    page,
  }) => {
    // P3/P5: an exclusion with no liveness proof outlives its reason silently.
    // If a MathLive upgrade fixes the nesting, this row fails and the carve-out
    // above must be DELETED rather than quietly kept forever. It also pins the
    // scope — the finding is on math-field and nowhere else.
    await openWorksheet(page);
    const raw = await rawAxeViolations(page);
    const nested = raw.find((v) => v.id === 'nested-interactive');
    expect(
      nested,
      'nested-interactive no longer fires — delete the AXE_EXCLUSIONS entry',
    ).toBeDefined();
    expect(
      nested!.nodes.every((target) => target.includes('math-field')),
      'nested-interactive now fires outside math-field — re-scope the carve-out',
    ).toBe(true);
  });

  test('the student Home', async ({ page }) => {
    await signInAs(page);
    await stubIdentityApi(page, {
      role: 'student',
      classes: [
        {
          classId: 'cccccccc-0000-4000-8000-00000000e2e1',
          name: 'Algebra I — Period 3',
          joinedAt: new Date().toISOString(),
        },
      ],
    });
    await page.goto('/');
    await page.getByRole('heading', { name: 'Your classes' }).waitFor();
    await expectNoAxeViolations(page);
  });

  test('the pre-auth landing (the R5-DR admission fork)', async ({ page }) => {
    // The first screen a stranger sees, and the only one carrying a form
    // before authentication — so it gets the same scan as the surfaces behind
    // the gate. The code field's label, the alert on refusal, and the
    // role=status announcement region are all in scope here.
    await page.goto('/');
    await page.getByLabel(LANDING_COPY.codeLabel).waitFor();
    await expectNoAxeViolations(page);
  });

  test('the join gate (signed out)', async ({ page }) => {
    await page.route('**/functions/v1/get-activity*', (route) =>
      route.fulfill({ json: { api_version: 1, class_name: 'Algebra I — Period 3' } }),
    );
    await page.goto('/join/QX7M2P');
    await page.getByRole('button', { name: 'Sign in with Google' }).waitFor();
    await expectNoAxeViolations(page);
  });
});

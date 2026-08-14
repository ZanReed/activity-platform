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
import {
  activityUrl,
  signInAs,
  stubActivityApi,
  stubIdentityApi,
} from '../helpers/studentSession';

async function openWorksheet(page: Page): Promise<void> {
  await stubActivityApi(page);
  await signInAs(page);
  await page.goto(activityUrl());
  await page.locator('[data-section-id] input[type="text"]').first().waitFor();
}

async function expectNoAxeViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(
    results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => n.target.join(' ')),
    })),
  ).toEqual([]);
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

    // Tab from the top of the document until the first blank has focus —
    // bounded, so an unreachable input fails loudly instead of spinning.
    await page.locator('body').press('Tab');
    let reachedInput = false;
    for (let i = 0; i < 60; i++) {
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
    for (let i = 0; i < 60; i++) {
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
    await expect(
      page.locator('.viewer-section__status[aria-live="polite"]').first(),
    ).toHaveText(/Checked/);
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

  test('the join gate (signed out)', async ({ page }) => {
    await page.route('**/functions/v1/get-activity*', (route) =>
      route.fulfill({ json: { api_version: 1, class_name: 'Algebra I — Period 3' } }),
    );
    await page.goto('/join/QX7M2P');
    await page.getByRole('button', { name: 'Sign in with Google' }).waitFor();
    await expectNoAxeViolations(page);
  });
});

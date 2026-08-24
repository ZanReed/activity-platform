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

/** The served id of the first block of a given type — for stubbing a check
 *  response whose keys match the document the student was actually served. */
function servedBlockId(type: string): string {
  const found: string[] = [];
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }
    if (node === null || typeof node !== 'object') return;
    const record = node as Record<string, unknown>;
    if (record['type'] === type && typeof record['id'] === 'string') {
      found.push(record['id']);
    }
    for (const value of Object.values(record)) walk(value);
  };
  walk(servedFixtureDocument().sections);
  if (found[0] === undefined) {
    throw new Error(`the served fixture carries no ${type} block`);
  }
  return found[0];
}

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

  // …AND WAIT FOR MATHLIVE TO FINISH UPGRADING, not merely to exist.
  //
  // `math-field` in the marker map is satisfied the moment the element is in
  // the DOM. MathLive then builds its internals asynchronously, and somewhere
  // in that window it takes focus once — nothing in this repo asks it to
  // (mountMathPrompts sets value/readOnly/prompts and never calls focus()).
  // A test that starts a ~76-stop Tab walk immediately after mount races that,
  // which is what CI run 32500013923 caught: the walk reached Check, and by the
  // time Enter landed focus had moved to `math-field`.
  //
  // shadowRoot is the upgrade signal: it exists once the custom element has
  // constructed its internals, which is what was still happening mid-walk.
  await page.waitForFunction(
    () =>
      Array.from(document.querySelectorAll('math-field')).every((f) =>
        Boolean((f as Element & { shadowRoot: ShadowRoot | null }).shadowRoot),
      ),
    undefined,
    { timeout: 20_000 },
  );
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

    // ⚠ THE TRAIL IS THE POINT (2026-08-24). This row has flaked twice and both
    // times went green again before anyone read the instrumentation, so it has
    // stayed unfixable for weeks: `expect(reachedInput).toBe(true)` tells you
    // "false" and nothing else. The walk now RECORDS where focus actually
    // landed at every step and puts the tail of that trail in the assertion
    // message — so the next failure diagnoses itself, in CI, with nobody
    // watching. Playwright keeps the message in the report and the trace.
    // Do not "simplify" this back to a boolean.
    const walk = async (selector: string, budget: number) => {
      const trail: string[] = [];
      for (let i = 0; i < budget; i++) {
        const step = await page.evaluate((sel) => {
          const el = document.activeElement;
          if (!el) return { hit: false, desc: '<none>' };
          const id = el.id ? `#${el.id}` : '';
          const cls = typeof el.className === 'string' && el.className
            ? `.${el.className.trim().split(/\s+/).slice(0, 2).join('.')}`
            : '';
          const block = el.closest('[data-block-type]')?.getAttribute('data-block-type');
          return {
            hit: el.matches(sel),
            desc: `${el.tagName.toLowerCase()}${id}${cls}${block ? ` «${block}»` : ''}`,
          };
        }, selector);
        trail.push(step.desc);
        if (step.hit) return { reached: true, trail };
        await page.keyboard.press('Tab');
      }
      return { reached: false, trail };
    };

    // Tab from the top of the document until the first blank has focus.
    await page.locator('body').press('Tab');
    const toInput = await walk('[data-section-id] input[type="text"]', tabBudget);
    expect(
      toInput.reached,
      'a blank must be reachable by Tab alone. Focus trail (last 12 stops):\n  ' +
        toInput.trail.slice(-12).join('\n  ') +
        `\n(${toInput.trail.length} stops walked, budget ${tabBudget})`,
    ).toBe(true);

    await page.keyboard.type('42');

    // Keep tabbing to the group's Check button — same instrumented walk.
    const toCheck = await walk('.viewer-section__check', tabBudget);
    const reachedCheck = toCheck.reached;
    expect(
      reachedCheck,
      'Check must be reachable by Tab alone. Focus trail (last 12 stops):\n  ' +
        toCheck.trail.slice(-12).join('\n  ') +
        `\n(${toCheck.trail.length} stops walked, budget ${tabBudget})`,
    ).toBe(true);

    // SECOND SIGHTING, MECHANISM CONFIRMED, so this now presses on the LOCATOR
    // rather than on whatever happens to hold focus.
    //
    // The 2026-08-15 comment here instrumented a first sighting and asked the
    // next failure to report where focus actually was. It did, in CI run
    // 32500013923: "the click likely never fired; focus is now on: math-field".
    // The theory was right — MathLive settles after mount and takes focus once,
    // and this walk is long enough to still be running when it does.
    //
    // WHAT THIS STILL PROVES, and it is the whole a11y claim: the two walk
    // assertions above establish that Tab ALONE reaches the blank and then the
    // Check control, and this line establishes that Enter on that control
    // checks the section. `locator.press` focuses the control and sends a real
    // Enter — so reachability and activation are both still real.
    //
    // WHAT IT NO LONGER PROVES: that focus happens to REMAIN on Check across a
    // 76-stop walk. That was never an accessibility property — it is an
    // artifact of this test racing a third-party mount — and the settle wait in
    // openWorksheet now closes that window at its source anyway. If MathLive's
    // focus grab ever becomes a REAL student-facing problem, note that this row
    // is no longer the thing that would catch it (see TODOS.md).
    const check = page.locator('.viewer-section__check').first();
    try {
      await check.press('Enter');
      await expect(
        page.locator('.viewer-section__status[aria-live="polite"]').first(),
      ).toHaveText(/Checked/, { timeout: 10_000 });
    } catch (err) {
      // The diagnostic stays: it is what turned a bare timeout into a named
      // mechanism, and it costs nothing until something fails again.
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

  test('a numbered question announces its number ONCE, from the group', async ({
    page,
  }) => {
    // Ruling D3, and the row T7 could not write because no number existed. The
    // number reaches assistive tech through the wrapper's group name, not by
    // being repeated on every control — a ten-choice question would otherwise
    // say "problem 3" ten times.
    await openWorksheet(page);

    const numbered = page.locator('.viewer-block[data-block-number]');
    // Non-vacuity first: the fixture really does carry numbered questions.
    expect(await numbered.count()).toBeGreaterThan(3);

    const audit = await page.evaluate(() => {
      const out: { role: string | null; name: string | null; hidden: string | null }[] = [];
      document
        .querySelectorAll('.viewer-block[data-block-number]')
        .forEach((el) => {
          const target = el.getAttribute('aria-labelledby');
          const gutter = target ? document.getElementById(target) : null;
          out.push({
            role: el.getAttribute('role'),
            name: gutter?.textContent?.trim() ?? null,
            hidden: gutter?.getAttribute('aria-hidden') ?? null,
          });
        });
      return out;
    });

    for (const entry of audit) {
      expect(entry.role).toBe('group');
      // The group's accessible name resolves to real text, not an empty node.
      expect(entry.name ?? '').not.toHaveLength(0);
      // …and the visible marker is out of the reading order, so it is not
      // announced a second time as loose text inside the group.
      expect(entry.hidden).toBe('true');
    }

    // The whole worksheet still scans clean with the groups in place — a
    // labelled group is only an improvement if it did not break anything else.
    await expectNoAxeViolations(page);
  });

  test('the worksheet AFTER a check, with a solution disclosed', async ({
    page,
  }) => {
    // THE POST-CHECK DOM HAD NEVER BEEN SCANNED. Every row above this one
    // scans the worksheet in its untouched state, so the elements that only
    // exist after a check round trip — the state pills, and the solution
    // disclosure the answer-key slice added to short_answer and essay — were
    // outside a11y coverage entirely. That is the same shape as the gaps this
    // lane was built to close: the coverage claim was about the SURFACE, and
    // the surface has a second state.
    //
    // The solution is stubbed onto a real served block id rather than typed
    // (P2): a hand-written id produces a response whose keys match nothing,
    // the disclosure never renders, and the scan passes over a page missing
    // the very thing it was added for.
    const shortAnswerId = servedBlockId('short_answer');
    await stubActivityApi(page, {
      check: {
        solutions: {
          [shortAnswerId]: [
            {
              type: 'text',
              text: 'The y-intercept is the value of y when x is zero.',
              marks: [],
            },
          ],
        },
      },
    });
    await signInAs(page);
    await page.goto(activityUrl());
    await page.locator('[data-section-id] input[type="text"]').first().waitFor();

    await page.locator('[data-section-id] textarea').first().fill('my answer');
    await page.getByRole('button', { name: 'Check', exact: true }).first().click();

    // Non-vacuity: the disclosure is really on the page before anything is
    // asserted about its accessibility.
    const disclosure = page.locator('.viewer-solution').first();
    await expect(disclosure).toBeVisible();

    // It is a native <details>, so the keyboard path is the platform's — but
    // "we used the right element" is a claim, and this is the check. The
    // summary takes focus and Enter opens it.
    const summary = disclosure.locator('summary');
    await summary.focus();
    await expect(summary).toBeFocused();
    await summary.press('Enter');
    await expect(disclosure).toHaveAttribute('open', '');

    await expectNoAxeViolations(page);
  });

  // ---- GUARD 6 (activity flow modes) -------------------------------------
  test('a LOCKED worksheet, frozen after its check', async ({ page }) => {
    // The freeze is a THIRD state of this surface, and it is the one that
    // changes the accessibility tree most: an entire fieldset goes disabled
    // under the student's cursor. The two things that could go wrong are
    // exactly what this scans for — a disabled region that is unreachable and
    // unexplained, and a focus position that fell to <body> when the fieldset
    // the student was standing in went inert (D6).
    const doc = servedFixtureDocument();
    await stubActivityApi(page, {
      document: {
        ...doc,
        meta: { ...doc.meta, submissionMode: 'locked' },
      } as typeof doc,
    });
    await signInAs(page);
    await page.goto(activityUrl());
    await page.locator('[data-section-id] input[type="text"]').first().waitFor();

    await page.locator('[data-section-id] input[type="text"]').first().fill('42');
    // D3 — in `locked` the button says what it does and asks first.
    await page.getByRole('button', { name: /^Check and lock/ }).first().click();
    await page.getByRole('button', { name: 'Check and lock', exact: true }).click();

    // Non-vacuity FIRST: the freeze really happened, so the scan below is of
    // the frozen DOM and not of a page where the click did nothing.
    const group = page.locator('.viewer-check-group').first();
    await expect(group).toHaveAttribute('data-group-frozen', 'true');
    await expect(
      page.locator('.viewer-section__inputs').first(),
    ).toHaveAttribute('disabled', '');

    // ANNOUNCED — the text is in the live region, once, and it is the
    // irreversibility sentence rather than the plain "Checked."
    const status = group.locator('.viewer-section__status[aria-live="polite"]');
    await expect(status).toHaveText('Checked and locked. You can’t change these answers.');

    // AND THE KEYBOARD KEPT ITS PLACE. Disabling the fieldset drops focus to
    // <body>; the status region takes it instead, which is also what makes the
    // announcement land for a user who is already there.
    await expect(status).toBeFocused();

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

  test('the Responses tab (the teacher grading surface)', async ({ page }) => {
    // A teacher surface in a lane named for student ones, deliberately: this
    // is the slice's only new form-bearing screen, and the axe scan is cheaper
    // here than the bug it catches. The queue row carries a rubric input, a
    // textarea, and two buttons — the shapes a11y regressions live in.
    await signInAs(page);
    await stubIdentityApi(page, { role: 'teacher' });
    await page.route('**/rest/v1/rpc/list_grading_queue', (route) =>
      route.fulfill({
        json: [
          {
            check_id: '11111111-0000-4000-8000-000000000001',
            student_id: '22222222-0000-4000-8000-000000000001',
            student_label: 'student@school.example',
            in_your_class: true,
            activity_version_id: '33333333-0000-4000-8000-000000000001',
            version_num: 1,
            is_current: true,
            section_id: 'sec-1',
            block_id: '44444444-0000-4000-8000-000000000001',
            block_type: 'short_answer',
            response_text: 'because the slope stays the same',
            attempt_number: 1,
            checked_at: '2026-08-15T00:00:00Z',
            graded: false,
            criteria: null,
            general_feedback: null,
            graded_at: null,
            released_at: null,
            has_grader: true,
            stale: false,
          },
        ],
      }),
    );
    await page.goto('/activity/55555555-0000-4000-8000-000000000001/responses');
    await page.getByText('1 need grading').waitFor();
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

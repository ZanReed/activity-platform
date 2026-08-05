// =============================================================================
// perf/shell-timing.e2e.ts — the throttled Chromebook lab run (S8)
// -----------------------------------------------------------------------------
// Runs against the PRODUCTION BUILD (vite preview), CPU- and network-throttled
// through CDP, and records how long a student waits before they can act.
//
// WHAT MAKES THIS HONEST (and what made the first draft of the plan wrong):
//
//   1. FRESH CONTEXT PER MEASUREMENT, and every measured resource asserted to
//      have `workerStart === 0`. The production build registers a service
//      worker immediately and CacheFirst-caches every hashed asset; CDP network
//      throttling is NOT reliably applied to service-worker-mediated fetches.
//      A second navigation in a warm context would therefore report a
//      beautiful number that describes a cache hit rather than a student. The
//      assertion is the difference between measuring and pretending.
//   2. THE SERVER IS STUBBED. Route interception serves a fixture document, so
//      this measures shell + render and never inherits Edge Function cold
//      start (that is S4's p95 gate, a different number with a different
//      owner). A lab metric that silently includes someone else's variance is
//      not a lab metric.
//   3. RECORDED ALWAYS, ENFORCED GENTLY (ruling D3). Sizes are the iron gates
//      because they are deterministic; a millisecond gate on a shared CI runner
//      goes red for reasons nobody can fix, and a gate that cries wolf is one
//      people learn to re-run. So the number is written to an artifact every
//      run, compared against the COMMITTED baseline (ruling R3 — not against a
//      previous CI artifact, which expires), and hard-fails only past the
//      derived 2x ceiling, which runner variance cannot plausibly reach but an
//      eagerly-imported graph kit blows straight through.
// =============================================================================

import { test, expect, type Browser, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    MARKS,
    THROTTLE,
    TIMING_TARGET_MS,
    TIMING_CEILING_MULTIPLE,
    timingCeilingMs,
} from '../../../../scripts/perf-budgets.mjs';
import {
    E2E_ACTIVITY_ID,
    E2E_SUPABASE_URL,
    signInAs,
    stubActivityApi,
} from '../helpers/studentSession';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESULTS_DIR = resolve(__dirname, '../../perf-results');

interface Measurement {
    mark: string;
    ms: number | null;
    lcpMs: number | null;
    swMediated: string[];
}

const measurements: Measurement[] = [];

/** Apply Chromebook-class CPU and network throttling to a page via CDP. */
async function throttle(browser: Browser, page: Page): Promise<void> {
    const client = await browser
        .contexts()[0]!
        .newCDPSession(page);
    await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', {
        offline: false,
        // CDP wants bytes/sec; the config is in kbps.
        downloadThroughput: (THROTTLE.downloadKbps * 1024) / 8,
        uploadThroughput: (THROTTLE.uploadKbps * 1024) / 8,
        latency: THROTTLE.latencyMs,
    });
    await client.send('Emulation.setCPUThrottlingRate', {
        rate: THROTTLE.cpuSlowdownMultiplier,
    });
}

/** Read a mark's start time, or null when it never fired. */
async function readMark(page: Page, name: string): Promise<number | null> {
    return page.evaluate((markName) => {
        const entry = performance.getEntriesByName(markName)[0];
        return entry ? entry.startTime : null;
    }, name);
}

/** Largest Contentful Paint, recorded as context (never enforced). */
async function readLcp(page: Page): Promise<number | null> {
    return page.evaluate(() => {
        const entries = performance.getEntriesByType('largest-contentful-paint');
        const last = entries[entries.length - 1];
        return last ? last.startTime : null;
    });
}

/**
 * Resources the service worker answered. MUST be empty for a measured run —
 * see the header. Returns names so a failure says WHICH resource was cached
 * rather than merely that something was.
 */
async function swMediatedResources(page: Page): Promise<string[]> {
    return page.evaluate(() =>
        performance
            .getEntriesByType('resource')
            .filter((r) => (r as PerformanceResourceTiming).workerStart > 0)
            .map((r) => r.name),
    );
}

function recordAndAssert(m: Measurement): void {
    measurements.push(m);

    const target = TIMING_TARGET_MS[m.mark] ?? null;
    const ceiling = timingCeilingMs(m.mark);

    if (m.ms === null) {
        // A mark that never fired is a REAL failure regardless of calibration:
        // either the instrumentation broke or the student never got to act.
        throw new Error(
            `Mark "${m.mark}" never fired. Either the viewer no longer stamps ` +
                `it (contract break — see packages/viewer/src/perf/marks.ts) or ` +
                `the student never reached that state under throttling.`,
        );
    }

    if (target === null) {
        console.log(
            `  [uncalibrated] ${m.mark}: ${m.ms.toFixed(0)} ms — set ` +
                `TIMING_TARGET_MS in scripts/perf-budgets.mjs from a green run ` +
                `to turn on the baseline comparison.`,
        );
        return;
    }

    const deltaPct = ((m.ms - target) / target) * 100;
    console.log(
        `  ${m.mark}: ${m.ms.toFixed(0)} ms vs committed target ${target} ms ` +
            `(${deltaPct >= 0 ? '+' : ''}${deltaPct.toFixed(0)}%)`,
    );
    // The ratchet answer (outside-voice finding 6): a hard gate this loose
    // would let slow creep through forever unnoticed, so anything meaningfully
    // over target is SAID OUT LOUD on every run even though it does not fail.
    if (deltaPct > 25) {
        console.warn(
            `  ⚠ ${m.mark} is ${deltaPct.toFixed(0)}% over the committed ` +
                `baseline. Not a failure (the hard ceiling is ` +
                `${TIMING_CEILING_MULTIPLE}x), but if this is the new normal, ` +
                `recalibrate deliberately rather than letting it drift.`,
        );
    }

    expect(
        m.ms,
        `${m.mark} exceeded its hard ceiling (${TIMING_CEILING_MULTIPLE}x the ` +
            `committed target). This is far outside runner variance — something ` +
            `on the student path got dramatically more expensive.`,
    ).toBeLessThan(ceiling!);
}

test.describe('throttled Chromebook lab run', () => {
    // Never share a context between measurements: a warm service worker would
    // serve the second run from cache and flatter the number.
    test.describe.configure({ mode: 'serial' });

    test('signed-out student reaches the pre-auth screen', async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        try {
            await throttle(browser, page);
            await stubActivityApi(page);
            await page.goto(`/a/${E2E_ACTIVITY_ID}`);

            // The promise being measured: a signed-out student can see what
            // they were sent and act on it (ruling 3.2A).
            await expect(
                page.getByRole('button', { name: /sign in with google/i }),
            ).toBeVisible();

            const mediated = await swMediatedResources(page);
            expect(
                mediated,
                'A service worker answered these requests, so CDP throttling did ' +
                    'not apply to them and this measurement is fiction. The lane ' +
                    'must measure a cold, uncontrolled first visit.',
            ).toEqual([]);

            recordAndAssert({
                mark: MARKS.preAuthInteractive,
                ms: await readMark(page, MARKS.preAuthInteractive),
                lcpMs: await readLcp(page),
                swMediated: mediated,
            });
        } finally {
            await context.close();
        }
    });

    test('signed-in student reaches an answerable worksheet', async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        try {
            await throttle(browser, page);
            await signInAs(page, { supabaseUrl: E2E_SUPABASE_URL });
            await stubActivityApi(page);
            await page.goto(`/a/${E2E_ACTIVITY_ID}`);

            // The worksheet is on screen and answerable.
            //
            // Waits on `.viewer-topbar`, which ONLY the ready state renders —
            // not on `.viewer-section`, because the loading Skeleton renders
            // that class too (with aria-busy="true"). Waiting on the section
            // let this spec proceed while the skeleton was still up, read a
            // mark that had not fired yet, and fail as "the viewer no longer
            // stamps it". It passed most runs purely because the document
            // usually arrives before Playwright's first poll — a race that
            // would have read as flaky instrumentation rather than a bad
            // selector.
            await expect(page.locator('.viewer-topbar')).toBeVisible();
            await expect(
                page.locator('.viewer-section[aria-busy="true"]'),
            ).toHaveCount(0);

            const mediated = await swMediatedResources(page);
            expect(mediated, 'service worker mediated a measured request').toEqual([]);

            recordAndAssert({
                mark: MARKS.worksheetInteractive,
                ms: await readMark(page, MARKS.worksheetInteractive),
                lcpMs: await readLcp(page),
                swMediated: mediated,
            });

            // Recorded, never enforced: this is the input to the open T7
            // question (keep KaTeX lazy, eager-load it, or preload it once the
            // document is known to carry math).
            //
            // The wait is the whole measurement. KaTeX is a lazy chunk, so the
            // mark lands strictly AFTER the worksheet is interactive — reading
            // it straight away reports "never fired" on a page that renders
            // math perfectly well half a second later, which is exactly what
            // the first run of this spec did. The gap between the worksheet
            // mark and this one IS the window in which a student sees the
            // readable-LaTeX fallback, and in which a browser-menu Ctrl+P
            // prints it (residual S5-2). Measuring that window is the point.
            await page
                .locator('.katex')
                .first()
                .waitFor({ state: 'attached', timeout: 15_000 })
                .catch(() => {
                    // A fixture with no math is legitimate: the chunk never
                    // loads and null is the honest answer, not a failure.
                });
            const mathMs = await readMark(page, MARKS.mathRendered);
            measurements.push({
                mark: MARKS.mathRendered,
                ms: mathMs,
                lcpMs: null,
                swMediated: [],
            });
            const worksheetMs = measurements.find(
                (x) => x.mark === MARKS.worksheetInteractive,
            )?.ms;
            console.log(
                `  ${MARKS.mathRendered}: ${
                    mathMs === null
                        ? 'not loaded (no math in this document)'
                        : `${mathMs.toFixed(0)} ms` +
                          (worksheetMs != null
                              ? ` — LaTeX-fallback window ${(mathMs - worksheetMs).toFixed(0)} ms (the T7 number)`
                              : '')
                }`,
            );
        } finally {
            await context.close();
        }
    });

    test.afterAll(() => {
        // The artifact CI uploads. Deliberately includes the throttle settings
        // and the committed targets, so a number read six months from now can
        // be interpreted without archaeology into which commit produced it.
        mkdirSync(RESULTS_DIR, { recursive: true });
        writeFileSync(
            resolve(RESULTS_DIR, 'shell-timing.json'),
            JSON.stringify(
                {
                    recordedAt: new Date().toISOString(),
                    throttle: THROTTLE,
                    committedTargets: TIMING_TARGET_MS,
                    ceilingMultiple: TIMING_CEILING_MULTIPLE,
                    measurements,
                },
                null,
                2,
            ),
        );
    });
});

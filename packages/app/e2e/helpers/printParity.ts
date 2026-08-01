// ============================================================================
// printParity.ts — running the print contract against a real page (S5 T7)
// ----------------------------------------------------------------------------
// The gate's executor. `printExpectations(type, ctx)` in @activity/viewer says
// WHAT must be true of a printed block; this says HOW to check it in a browser,
// once per expectation kind, for either surface.
//
// The two surfaces are the retiring renderer's published page and the viewer's
// print mode. They are deliberately different renderings — different DOM,
// different font pipelines, different container layout — which is exactly why
// the gate compares them against a shared CONTRACT rather than against each
// other (ruling S5-6). A cross-surface pixel diff between them would be either
// permanently red or vacuously loose; "every ruled rule holds on both" is
// falsifiable.
//
// A skipped check is reported, never silent: `targetFor` returns null only
// where the registry gives a written reason, and those show up in the result so
// a surface quietly dropping out of the gate is visible.
// ============================================================================

import type { Page, Locator } from '@playwright/test';
import {
    printExpectations,
    targetFor,
    BLOCK_ROOT,
    PAPER_COLOURS,
    type PrintCheck,
    type PrintSurface,
    type PrintInstanceContext,
} from '@activity/viewer';
import type { BlockType } from '@activity/viewer';

export interface CheckOutcome {
    readonly id: string;
    readonly rule: string;
    readonly status: 'pass' | 'fail' | 'skipped' | 'absent';
    readonly detail?: string;
}

const computed = (el: Locator, property: string) =>
    el.evaluate(
        (node, prop) => getComputedStyle(node as Element).getPropertyValue(prop).trim(),
        property,
    );

/**
 * Run one expectation. Returns an outcome rather than asserting, so the caller
 * can report every failure for a block at once — a gate that stops at the first
 * failure turns a ten-minute fix into ten runs.
 */
async function runCheck(
    roots: Locator,
    check: PrintCheck,
    surface: PrintSurface,
): Promise<CheckOutcome> {
    const selector = targetFor(check, surface);
    if (selector === null) {
        const target = check.target[surface];
        return {
            id: check.id,
            rule: check.rule,
            status: 'skipped',
            detail: typeof target === 'string' ? undefined : target.notApplicable,
        };
    }

    // BLOCK_ROOT is ambiguous by construction: the container wraps every block
    // in an element carrying data-block-type, and most components repeat the
    // attribute on their own root. A rule about "the block" is satisfied if
    // EITHER element carries it — that is what the printed page reflects — so a
    // root check tries every candidate instead of guessing which one the
    // stylesheet happened to target. Descendant selectors scope to the
    // outermost root, which contains them all.
    const el =
        selector === BLOCK_ROOT ? roots : roots.first().locator(selector);
    const count = await el.count();
    const expect_ = check.expect;

    // `hidden` is satisfied by absence: an element that was never rendered
    // cannot print, which is the outcome the rule wants.
    if (count === 0) {
        return expect_.kind === 'hidden'
            ? { id: check.id, rule: check.rule, status: 'pass', detail: 'not rendered' }
            : {
                  id: check.id,
                  rule: check.rule,
                  status: 'absent',
                  detail: `no element matched ${selector}`,
              };
    }

    // For a root check, try each candidate and take the first that satisfies.
    const candidates = selector === BLOCK_ROOT ? count : 1;
    let lastDetail = '';
    for (let candidate = 0; candidate < candidates; candidate++) {
        const outcome = await evaluateOn(el.nth(candidate), el, count, check, selector, expect_);
        if (outcome.status === 'pass') return outcome;
        lastDetail = outcome.detail ?? '';
    }
    return {
        id: check.id,
        rule: check.rule,
        status: 'fail',
        detail: lastDetail,
    };
}

/** One expectation against one concrete element. */
async function evaluateOn(
    first: Locator,
    el: Locator,
    count: number,
    check: PrintCheck,
    selector: string,
    expect_: PrintCheck['expect'],
): Promise<CheckOutcome> {
    const fail = (detail: string): CheckOutcome => ({
        id: check.id,
        rule: check.rule,
        status: 'fail',
        detail,
    });
    const pass: CheckOutcome = { id: check.id, rule: check.rule, status: 'pass' };

    switch (expect_.kind) {
        case 'hidden': {
            // Every match must be hidden — one visible instance is a leak.
            for (let i = 0; i < count; i++) {
                const display = await computed(el.nth(i), 'display');
                if (display !== 'none') {
                    return fail(`${selector}[${i}] has display:${display}`);
                }
            }
            return pass;
        }

        case 'visible': {
            const display = await computed(first, 'display');
            return display === 'none' ? fail(`${selector} is display:none`) : pass;
        }

        case 'computed': {
            const value = await computed(first, expect_.property);
            return expect_.oneOf.includes(value)
                ? pass
                : fail(
                      `${expect_.property} is "${value}", expected one of ${expect_.oneOf.join(', ')}`,
                  );
        }

        case 'bare-underline': {
            // Measured by WIDTH, not by style. The app's CSS reset (Tailwind's
            // preflight) sets `border-style: solid` on every element with
            // width 0, so "no border" is expressed as zero width here — the
            // first gate run failed on this and the reset was the reason, not
            // the markup.
            const [top, left, right, bottomStyle, bottomWidth] = await Promise.all([
                computed(first, 'border-top-width'),
                computed(first, 'border-left-width'),
                computed(first, 'border-right-width'),
                computed(first, 'border-bottom-style'),
                computed(first, 'border-bottom-width'),
            ]);
            for (const [side, width] of Object.entries({ top, left, right })) {
                if (parseFloat(width) > 0) {
                    return fail(`border-${side} is ${width} — a writing line has only a bottom rule`);
                }
            }
            if (bottomStyle !== 'solid') return fail(`border-bottom-style is ${bottomStyle}`);
            if (parseFloat(bottomWidth) <= 0) return fail('border-bottom has no width');
            return pass;
        }

        case 'boxed': {
            const [style, width] = await Promise.all([
                computed(first, 'border-top-style'),
                computed(first, 'border-top-width'),
            ]);
            // Width first for the same reset reason: style is `solid` on
            // everything, so only a real width means a real box.
            if (style !== expect_.style) {
                return fail(`border style is ${style}, expected ${expect_.style}`);
            }
            if (parseFloat(width) <= 0) return fail('border has no width');
            return pass;
        }

        case 'ink-not-paper': {
            // The dark-mode guard: printed text must not resolve to a paper
            // colour. Checked as computed COLOUR rather than as a token name,
            // because what reaches the page is the resolved value.
            const colour = await computed(first, 'color');
            return PAPER_COLOURS.includes(colour)
                ? fail(`color resolves to ${colour} — invisible on white paper`)
                : pass;
        }

        case 'max-width-capped': {
            const value = await computed(first, 'max-width');
            return value === 'none' || value === ''
                ? fail('max-width is none — the figure can run off the sheet')
                : pass;
        }

        case 'writing-space': {
            const [minHeight, fontSize] = await Promise.all([
                computed(first, 'min-height'),
                computed(first, 'font-size'),
            ]);
            const em = parseFloat(minHeight) / parseFloat(fontSize);
            return em + 0.01 >= expect_.minEm
                ? pass
                : fail(`min-height is ${em.toFixed(1)}em, expected >= ${expect_.minEm}em`);
        }

        case 'drawable-count': {
            const declared = await first.getAttribute('data-drawables');
            if (declared === null) {
                return fail('no data-drawables attribute — the shared SVG renderer did not emit one');
            }
            const n = Number(declared);
            if (expect_.zero && n !== 0) {
                return fail(`printed ${n} drawables; a question must print empty axes`);
            }
            if (!expect_.zero && n === 0) {
                return fail('printed 0 drawables; a display figure must print its content');
            }
            return pass;
        }
    }
}

export interface SurfaceRunOptions {
    readonly page: Page;
    readonly surface: PrintSurface;
    readonly type: BlockType;
    readonly ctx?: PrintInstanceContext;
    /** Scope for the block root; defaults to the type's data attribute. */
    readonly rootSelector?: string;
}

/** Every expectation for one block on one surface. */
export async function runPrintChecks({
    page,
    surface,
    type,
    ctx = {},
    rootSelector,
}: SurfaceRunOptions): Promise<CheckOutcome[]> {
    const roots = page.locator(rootSelector ?? `[data-block-type="${type}"]`);
    const checks = printExpectations(type, ctx);
    const outcomes: CheckOutcome[] = [];
    for (const check of checks) {
        outcomes.push(await runCheck(roots, check, surface));
    }
    return outcomes;
}

/** A readable failure report: which rules broke, in English, with the detail. */
export function describeFailures(
    outcomes: readonly CheckOutcome[],
    label: string,
): string {
    const bad = outcomes.filter((o) => o.status === 'fail' || o.status === 'absent');
    if (bad.length === 0) return '';
    return [
        `${label}: ${bad.length} print rule(s) broken`,
        ...bad.map((o) => `  [${o.status}] ${o.id} — ${o.rule}\n      ${o.detail ?? ''}`),
    ].join('\n');
}

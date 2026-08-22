// =============================================================================
// print-answer-key.e2e.ts — what a teacher's answer key contains
// -----------------------------------------------------------------------------
// The standing answer-key gate: every gradable type puts its answer on the page
// where a teacher expects to read it, and NOTHING is marked when no key was
// asked for.
//
// WHAT THIS USED TO BE. Through S5.5 the first half of this file compared the
// viewer against the retiring renderer, whose `showAnswers` variant was the only
// executable definition of what an answer key contains. It compared MEANING and
// never position — each surface's written letter resolved back through its own
// bank first, because the two shuffle differently by design and comparing
// letters would have asserted they shuffle identically.
//
// That comparison ran green, the contact sheet was signed off (2026-08-03), and
// the renderer half retired with it (S5-abs). The assertions it proved are kept
// here as viewer-only pins with explicit expected values — the coverage does not
// leave with the comparison, only the second surface does.
// =============================================================================

import { expect, test, type Page } from '@playwright/test';
import { ANSWER_KEY_COVERAGE, extractBlockAnswerKey } from '@activity/viewer';
import { authoredBlockFixture, authoredVariantFixtures } from '@activity/viewer/fixtures';
import type { BlockType } from '@activity/viewer';

async function loadViewerKey(page: Page, type: BlockType): Promise<void> {
    await page.goto(`/dev/viewer?type=${type}&answers=1`);
    await expect(page.locator(`[data-block-type="${type}"]`).first()).toBeAttached();
    // Lazy blocks (D16) render a Suspense fallback first, and reading the key
    // out of one measures a spinner. Same signal the print-readiness barrier
    // polls, so the harness waits for exactly what the product waits for.
    await expect(page.locator('.viewer-block__loading')).toHaveCount(0, {
        timeout: 15_000,
    });
    await page.emulateMedia({ media: 'print' });
}

/** The key the route would supply, from the same authored fixture the harness
 *  renders. The oracle for "did the component put the right answer on the
 *  page" — extraction itself is pinned in the viewer's unit suite. */
function keyFor(type: BlockType) {
    return extractBlockAnswerKey(authoredBlockFixture(type));
}

test.describe('answer key — every gradable type puts its answer on the page', () => {
    test('fill_in_blank: the canonical answer is on the line', async ({ page }) => {
        await loadViewerKey(page, 'fill_in_blank');
        const values = await page
            .locator('.viewer-blank__input')
            .evaluateAll((els) =>
                els.map((el) => (el as HTMLInputElement).value).filter(Boolean),
            );

        // The canonical answer, not an acceptable alternate: the fixture blank
        // is '3' with '3.0' also accepted, and a key wants one value on the line.
        expect(values).toEqual(Object.values(keyFor('fill_in_blank').blanks ?? {}));
        expect(values.length).toBeGreaterThan(0);
        expect(values).not.toContain('3.0');
    });

    test('multiple_choice: exactly the correct choice is marked', async ({ page }) => {
        await loadViewerKey(page, 'multiple_choice');
        const marked = await page
            .locator('.viewer-mc__choice[data-answer-key]')
            .evaluateAll((els) =>
                els.map(
                    (el) =>
                        el.querySelector('.viewer-mc__choice-content')?.textContent ?? '',
                ),
            );

        // Summed across EVERY authored instance of the type, not just the
        // primary one. The harness renders them all, so a per-type oracle that
        // reads only the first block silently under-counts the moment a second
        // instance is added — which is exactly what happened when the
        // figure-bearing multiple_choice fixture landed.
        const expectedMarks = authoredVariantFixtures('multiple_choice').reduce(
            (n, block) => n + (extractBlockAnswerKey(block).correctChoiceIds?.length ?? 0),
            0,
        );
        expect(marked).toHaveLength(expectedMarks);
        expect(marked.length).toBeGreaterThan(0);
        // The mark rides the LETTER, which is what survives onto paper — the
        // native control is hidden in print, so marking it would print nothing.
        await expect(
            page.locator('.viewer-mc__choice[data-answer-key] .viewer-mc__letter').first(),
        ).toBeAttached();
    });

    test('matching: each item gets the letter of ITS target', async ({ page }) => {
        await loadViewerKey(page, 'matching');
        const pairs = await page.evaluate(() => {
            const bank = new Map<string, string>();
            document.querySelectorAll('.viewer-matching__target').forEach((el) => {
                bank.set(el.getAttribute('data-letter') ?? '', el.getAttribute('data-target-id') ?? '');
            });
            const out: Record<string, string> = {};
            document.querySelectorAll('.viewer-matching__item').forEach((el) => {
                const written = (
                    el.querySelector('.viewer-matching__letter-line')?.textContent ?? ''
                ).trim();
                if (written) out[el.getAttribute('data-item-id') ?? ''] = written;
            });
            return { bank: Object.fromEntries(bank), written: out };
        });

        const key = keyFor('matching').targetIdByItemId ?? {};
        expect(Object.keys(pairs.written).length).toBeGreaterThan(0);
        for (const [itemId, letter] of Object.entries(pairs.written)) {
            expect(letter).toMatch(/^[A-Z]$/);
            // The letter must resolve, through the bank AS RENDERED, to the
            // target the key names — which is the property that survives the
            // print shuffle rearranging the bank.
            expect(pairs.bank[letter]).toBe(key[itemId]);
        }
    });

    test('ordering: each step carries its authored position', async ({ page }) => {
        await loadViewerKey(page, 'ordering');
        const printed = await page.evaluate(() => {
            const out: Record<string, string> = {};
            document.querySelectorAll('.viewer-ordering__item').forEach((el) => {
                const box = el.querySelector('.viewer-ordering__number-box')?.textContent ?? '';
                if (box.trim()) out[el.getAttribute('data-item-id') ?? ''] = box.trim();
            });
            return out;
        });

        const key = keyFor('ordering').positionByItemId ?? {};
        expect(Object.keys(printed).length).toBeGreaterThan(0);
        for (const [itemId, number] of Object.entries(printed)) {
            expect(number).toBe(String(key[itemId]));
        }
    });

    // The manually-graded pair (answer-key slice). "Every gradable type" in
    // this describe's title now means every KEYED type — the roster widened to
    // keyed ⊇ auto-gradable, because the questions a teacher marks by hand are
    // the ones they most need a key for.
    test('short_answer: the written answer is on the page', async ({ page }) => {
        expect(ANSWER_KEY_COVERAGE.short_answer?.via).toBe('extractor');
        await loadViewerKey(page, 'short_answer');
        const key = page.locator('.viewer-written-key');
        await expect(key).toHaveAttribute('data-answer-key', 'answer');
        await expect(key).toContainText('crosses the y-axis');
    });

    test('essay: falls back to the solution and labels it as one', async ({ page }) => {
        // The fixture authors only `solution`; printing it under the word
        // "Answer" would misrepresent it to whoever is marking with it.
        await loadViewerKey(page, 'essay');
        const key = page.locator('.viewer-written-key');
        await expect(key).toHaveAttribute('data-answer-key', 'solution');
        await expect(key.locator('.viewer-written-key__label')).toHaveText('Solution');
    });
});

test.describe('answer key — viewer-only, named with a reason', () => {
    test('math_block gaps are FILLED, which the renderer never did', async ({ page }) => {
        // Recorded as a viewer-only improvement in ANSWER_KEY_COVERAGE rather
        // than asserted on both surfaces: renderMathBlock is called without
        // showAnswers, so a gap-bearing equation — a graded question — printed
        // a key with nothing in it. This test is the improvement's evidence,
        // and the coverage note is where the decision lives.
        expect(ANSWER_KEY_COVERAGE.math_block?.via).toBe('in-band');

        await loadViewerKey(page, 'math_block');
        const html = await page
            .locator('[data-block-type="math_block"]')
            .first()
            .innerHTML();
        expect(html).toMatch(/boxed/);
    });

    test('a graph question draws its answer over the axes', async ({ page }) => {
        await loadViewerKey(page, 'interactive_graph');
        const drawn = await page
            .locator('[data-print-svg] svg')
            .first()
            .getAttribute('data-drawables');
        expect(Number(drawn ?? '0')).toBeGreaterThan(0);
    });
});

test.describe('printed versions carry a label (S5.5 T9)', () => {
    test('a version says which sheet it is; the default sheet stays unlabelled', async ({
        page,
    }) => {
        // Printing several arrangements only helps if a teacher can tell them
        // apart afterwards. An unlabelled stack of shuffled worksheets cannot be
        // matched to its answer key, which makes the feature worse than not
        // having it.
        await page.goto('/dev/viewer?type=ALL&version=2');
        await page.emulateMedia({ media: 'print' });
        const label = page.locator('.viewer-print-heading__version');
        await expect(label).toHaveText('Version B');
        await expect(label).toHaveAttribute('data-print-version', '2');

        // Version 1 is the ordinary sheet — labelling it would put "Version A"
        // on every worksheet a teacher ever prints.
        await page.goto('/dev/viewer?type=ALL');
        await page.emulateMedia({ media: 'print' });
        await expect(page.locator('.viewer-print-heading__version')).toHaveCount(0);
    });
});

test.describe('answer key — the negative direction', () => {
    test('no key requested, nothing marked anywhere', async ({ page }) => {
        // The half that ships broken. Every surface above is asserted with the
        // key ON; this is the same harness with it OFF, and it is what proves
        // the marks are caused by the key rather than always present.
        await page.goto('/dev/viewer?type=ALL');
        await page.emulateMedia({ media: 'print' });

        expect(await page.locator('[data-answer-key]').count()).toBe(0);
        const values = await page
            .locator('.viewer-blank__input')
            .evaluateAll((els) =>
                els.map((el) => (el as HTMLInputElement).value).filter(Boolean),
            );
        expect(values).toEqual([]);
    });
});

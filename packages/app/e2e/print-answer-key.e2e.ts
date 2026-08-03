// =============================================================================
// print-answer-key.e2e.ts — the answer key, on both surfaces (S5.5 D12A)
// -----------------------------------------------------------------------------
// The renderer's `showAnswers` print variant is the only executable definition
// of what a teacher's answer key contains: the canonical value on a blank line,
// a mark against the correct choice, a letter beside each matching item, a
// number in each ordering box. S5.5 reimplements all of it in the viewer and
// then deletes the original. This file is the one chance to prove the port
// preserved the semantics — after eviction the comparison is impossible
// forever, which is why it must run green BEFORE that commit.
//
// COMPARE MEANING, NEVER POSITION (finding F7, and it is the whole design of
// this file). The two surfaces deliberately arrange the page differently: the
// renderer shuffles matching targets and ordering items seeded by block id, the
// viewer shuffles by a print seed, and neither is wrong. So "choice B is
// correct on both" is a false assertion — it would be permanently red, and the
// obvious way to make it pass would be to loosen it into vacuity. What must
// agree is which CONTENT is the answer: the same item pairs with the same
// target, the same step gets the same number, the same choice is marked.
// Positions are resolved through each surface's OWN rendering before comparing.
//
// After the renderer goes, the cross-surface half of this file retires by
// design (S5-abs), and the viewer-only assertions plus the registry roster stay
// as the standing answer-key gate.
// =============================================================================

import { expect, test, type Page } from '@playwright/test';
import { renderActivityForPrint } from '@activity/renderer';
import { authoredFixtureDocument } from '@activity/viewer/fixtures';
import { ANSWER_KEY_COVERAGE } from '@activity/viewer';
import type { BlockType } from '@activity/viewer';

/** One authored block of a type, as its own single-block print document. */
function rendererKeyPageFor(type: BlockType): string {
    const doc = authoredFixtureDocument();
    const block = doc.sections
        .flatMap((s) => s.rows)
        .flatMap((r) => r.columns)
        .flatMap((c) => c.blocks)
        .find((b) => b.type === type);
    if (!block) throw new Error(`no authored fixture block of type ${type}`);

    const single = structuredClone(doc);
    single.sections = [
        {
            ...single.sections[0]!,
            rows: [
                {
                    id: 'row-1',
                    columns: [{ id: 'col-1', blocks: [structuredClone(block)] }],
                },
            ],
        },
    ];
    return renderActivityForPrint(single, { showAnswers: true });
}

async function loadRendererKey(page: Page, type: BlockType): Promise<void> {
    await page.setContent(rendererKeyPageFor(type), {
        waitUntil: 'domcontentloaded',
    });
    await page.emulateMedia({ media: 'print' });
}

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

const norm = (s: string | null | undefined) =>
    (s ?? '').replace(/\s+/g, ' ').trim();

test.describe('answer key — the same answers on both surfaces', () => {
    test('fill_in_blank: the canonical answer is on the line', async ({ page }) => {
        await loadRendererKey(page, 'fill_in_blank');
        const rendererValues = await page
            .locator('.blank-wrapper input, input.blank')
            .evaluateAll((els) =>
                els.map((el) => (el as HTMLInputElement).value).filter(Boolean),
            );

        await loadViewerKey(page, 'fill_in_blank');
        const viewerValues = await page
            .locator('.viewer-blank__input')
            .evaluateAll((els) =>
                els.map((el) => (el as HTMLInputElement).value).filter(Boolean),
            );

        // Same answers, in the same order — a blank's position in prose is not
        // shuffled by either surface, so here order IS meaning.
        expect(viewerValues.length).toBeGreaterThan(0);
        expect(viewerValues).toEqual(rendererValues);
    });

    test('multiple_choice: the same CHOICE is marked', async ({ page }) => {
        await loadRendererKey(page, 'multiple_choice');
        const rendererCorrect = await page
            .locator('.mc-choice.mc-key-correct')
            .evaluateAll((els) =>
                els.map((el) => {
                    const clone = el.cloneNode(true) as Element;
                    clone.querySelectorAll('.mc-choice-letter').forEach((n) => n.remove());
                    return clone.textContent ?? '';
                }),
            );

        await loadViewerKey(page, 'multiple_choice');
        const viewerCorrect = await page
            .locator('.viewer-mc__choice[data-answer-key]')
            .evaluateAll((els) =>
                els.map(
                    (el) =>
                        el.querySelector('.viewer-mc__choice-content')?.textContent ?? '',
                ),
            );

        expect(viewerCorrect.length).toBeGreaterThan(0);
        // Content, not letter: the letter is a fact about each surface's own
        // ordering, and comparing letters would assert the two surfaces shuffle
        // identically, which they deliberately do not.
        expect(viewerCorrect.map(norm).sort()).toEqual(
            rendererCorrect.map(norm).sort(),
        );
    });

    test('matching: each item pairs with the same TARGET', async ({ page }) => {
        // Resolve each surface's written letter back through its own bank, so
        // what is compared is item-content → target-content.
        await loadRendererKey(page, 'matching');
        const rendererPairs = await page.evaluate(() => {
            const strip = (el: Element, sel: string) => {
                const clone = el.cloneNode(true) as Element;
                clone.querySelectorAll(sel).forEach((n) => n.remove());
                return (clone.textContent ?? '').replace(/\s+/g, ' ').trim();
            };
            const bank = new Map<string, string>();
            document.querySelectorAll('.match-target').forEach((el) => {
                const letter = (el.querySelector('.match-target-letter')?.textContent ?? '')
                    .replace(/\W/g, '');
                bank.set(letter, strip(el, '.match-target-letter'));
            });
            const out: Record<string, string> = {};
            document.querySelectorAll('.match-item').forEach((el) => {
                const written = (el.querySelector('.match-letter-line')?.textContent ?? '').trim();
                if (written) {
                    out[strip(el, '.match-letter-line, .match-target-letter')] =
                        bank.get(written) ?? `?${written}`;
                }
            });
            return out;
        });

        await loadViewerKey(page, 'matching');
        const viewerPairs = await page.evaluate(() => {
            const strip = (el: Element, sel: string) => {
                const clone = el.cloneNode(true) as Element;
                clone.querySelectorAll(sel).forEach((n) => n.remove());
                return (clone.textContent ?? '').replace(/\s+/g, ' ').trim();
            };
            const bank = new Map<string, string>();
            document.querySelectorAll('.viewer-matching__target').forEach((el) => {
                const letter = el.getAttribute('data-letter') ?? '';
                bank.set(letter, strip(el, '.viewer-matching__letter'));
            });
            const out: Record<string, string> = {};
            document.querySelectorAll('.viewer-matching__item').forEach((el) => {
                const written = (
                    el.querySelector('.viewer-matching__letter-line')?.textContent ?? ''
                ).trim();
                if (written) {
                    out[el.querySelector('.viewer-matching__item-label')?.textContent ?? ''] =
                        bank.get(written) ?? `?${written}`;
                }
            });
            return out;
        });

        const strip = (pairs: Record<string, string>) =>
            Object.entries(pairs)
                .map(([item, target]) => `${norm(item)} => ${norm(target)}`)
                .sort();

        expect(Object.keys(viewerPairs).length).toBeGreaterThan(0);
        expect(strip(viewerPairs)).toEqual(strip(rendererPairs));
    });

    test('ordering: each step gets the same NUMBER', async ({ page }) => {
        await loadRendererKey(page, 'ordering');
        const rendererNumbers = await page.evaluate(() => {
            const out: Record<string, string> = {};
            document.querySelectorAll('.order-item').forEach((el) => {
                const box = el.querySelector('.order-number-box')?.textContent ?? '';
                const content = el.querySelector('.order-item-content')?.textContent
                    ?? el.textContent ?? '';
                if (box.trim()) out[content] = box.trim();
            });
            return out;
        });

        await loadViewerKey(page, 'ordering');
        const viewerNumbers = await page.evaluate(() => {
            const out: Record<string, string> = {};
            document.querySelectorAll('.viewer-ordering__item').forEach((el) => {
                const box = el.querySelector('.viewer-ordering__number-box')?.textContent ?? '';
                const content = el.querySelector('.viewer-ordering__content')?.textContent ?? '';
                if (box.trim()) out[content] = box.trim();
            });
            return out;
        });

        const strip = (m: Record<string, string>) =>
            Object.entries(m)
                .map(([content, n]) => `${norm(content).replace(/^\d+\s*/, '')} = ${n}`)
                .sort();

        expect(Object.keys(viewerNumbers).length).toBeGreaterThan(0);
        // The two surfaces print these steps in different orders on purpose;
        // what must match is which step carries which number.
        expect(strip(viewerNumbers)).toEqual(strip(rendererNumbers));
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

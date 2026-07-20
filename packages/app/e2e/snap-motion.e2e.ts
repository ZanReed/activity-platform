import { test, expect, type Page } from '@playwright/test';

// ============================================================================
// Snap motion (slice-6 stage 6) — settle-on-place + reduced-motion harness.
// ----------------------------------------------------------------------------
// The settle classes are transient (cleared on animationend, ~160ms), so
// presence is caught with a MutationObserver installed BEFORE the action —
// polling locators would race the clear. The move path is exercised at the
// signature level (a delete+insert transaction stamped uiEvent:'drop' — the
// exact meta prosemirror-view puts on a native drop); a true pointer drag of
// the PM drag handle is owner-eyeball territory per eng-review T1 (HTML5 DnD
// simulation was the pre-agreed fallback line).
// ============================================================================

async function waitForEditor(page: Page) {
    await expect(page.locator('.ProseMirror')).toBeVisible();
    await page.waitForFunction(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        () => Boolean((window as any).__tiptapEditor),
    );
}

// Resolves true if a settle class shows up within windowMs of installation.
function watchForSettle(page: Page, windowMs = 1500) {
    return page.evaluate((ms) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__settleSeen = new Promise<string | null>(
            (resolve) => {
                const root = document.querySelector('.ProseMirror');
                if (!root) {
                    resolve(null);
                    return;
                }
                const scan = () => {
                    const el = root.querySelector(
                        '.block-settle-in, .block-settle-move',
                    );
                    if (el) {
                        obs.disconnect();
                        resolve(
                            el.classList.contains('block-settle-move')
                                ? 'block-settle-move'
                                : 'block-settle-in',
                        );
                        return true;
                    }
                    return false;
                };
                const obs = new MutationObserver(() => scan());
                obs.observe(root, {
                    subtree: true,
                    childList: true,
                    attributes: true,
                    attributeFilter: ['class'],
                });
                if (scan()) return;
                setTimeout(() => {
                    obs.disconnect();
                    resolve(null);
                }, ms);
            },
        );
    }, windowMs);
}

function settleSeen(page: Page): Promise<string | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return page.evaluate(() => (window as any).__settleSeen);
}

// Insert via the Add-a-block window (the end-square button → search → tile).
// The slash menu can't be driven under automation — @tiptap/suggestion drops
// its match as soon as a query character follows the '/' when typed
// synthetically (pre-existing quirk, reproduced on a clean tree; flagged as
// its own investigation). The modal funnels through the same runInsert arm.
// Split open/pick so the settle watcher installs right before the insert.
async function openBlockModal(page: Page, query: string) {
    await page.getByRole('button', { name: 'Add a block' }).click();
    await expect(page.locator('.block-insert-overlay')).toBeVisible();
    await page.getByRole('textbox', { name: 'Search all blocks' }).fill(query);
    await expect(page.locator('.block-insert-tile').first()).toBeVisible();
}

async function pickFirstTile(page: Page) {
    await page.locator('.block-insert-tile').first().click();
}

// Focus the editor through its API — on ?empty=1 the centered Start-here
// overlay sits where a naive .ProseMirror center-click lands, so clicking is
// not a reliable way to get the caret into the doc.
async function focusEditor(page: Page, where: 'start' | 'end' = 'end') {
    await page.evaluate((w) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__tiptapEditor.chain().focus(w).run();
    }, where);
}

test('inserting a block settles it, then the class clears', async ({
    page,
}) => {
    await page.goto('/playground?empty=1');
    await waitForEditor(page);
    await openBlockModal(page, 'multiple choice');
    await watchForSettle(page);
    await pickFirstTile(page);
    expect(await settleSeen(page)).toBe('block-settle-in');
    // animationend clears the decoration — the sub-900ms bound proves it was
    // the animationend listener, not the 1.2s janitor fallback.
    await expect(page.locator('.block-settle-in')).toHaveCount(0, {
        timeout: 900,
    });
    // The placed block is on-screen (scrollIntoView on the insert paths).
    const block = page.locator('.ProseMirror .mc-block').first();
    const box = await block.boundingBox();
    const viewport = page.viewportSize();
    expect(box).not.toBeNull();
    if (box && viewport) {
        expect(box.y).toBeLessThan(viewport.height);
        expect(box.y + box.height).toBeGreaterThan(0);
    }
});

test('a block-style transform (heading) does not settle', async ({ page }) => {
    await page.goto('/playground?empty=1');
    await waitForEditor(page);
    await focusEditor(page);
    await page.keyboard.type('seed'); // transform target with content
    await watchForSettle(page, 700);
    // The style-transform path (TextStylePicker parity): an untagged
    // conversion transaction. (The slash menu's Text-group gate can't be
    // driven under automation — see the note on openBlockModal — but this
    // pins the same invariant end-to-end: conversions never settle.)
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__tiptapEditor
            .chain()
            .focus()
            .setNode('heading', { level: 1 })
            .run();
    });
    // The transform really ran (this is not vacuous) …
    await expect(page.locator('.ProseMirror h1')).toHaveCount(1);
    // … and it did NOT settle: transforms aren't placements.
    expect(await settleSeen(page)).toBeNull();
});

test('Split into columns settles the new row', async ({ page }) => {
    await page.goto('/playground?empty=1');
    await waitForEditor(page);
    await focusEditor(page);
    await page.keyboard.type('column me');
    await watchForSettle(page);
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__tiptapEditor.chain().focus().wrapInColumns(2).run();
    });
    expect(await settleSeen(page)).toBe('block-settle-in');
    await expect(page.locator('.block-settle-in')).toHaveCount(0);
});

test('a drop-stamped move transaction settles with the move class (no fade)', async ({
    page,
}) => {
    await page.goto('/playground');
    await waitForEditor(page);
    await watchForSettle(page);
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        // Move the second top-level block above the first — the same
        // delete+insert single transaction a native drop produces, with the
        // exact uiEvent meta prosemirror-view stamps on it.
        const doc = ed.state.doc;
        if (doc.childCount < 2) throw new Error('playground doc too small');
        const first = doc.child(0);
        const second = doc.child(1);
        const secondFrom = first.nodeSize;
        const tr = ed.state.tr
            .delete(secondFrom, secondFrom + second.nodeSize)
            .insert(0, second);
        tr.setMeta('uiEvent', 'drop');
        ed.view.dispatch(tr);
    });
    expect(await settleSeen(page)).toBe('block-settle-move');
    await expect(page.locator('.block-settle-move')).toHaveCount(0);
});

test('reduced motion: settle animation is none; janitor clears the class', async ({
    page,
}) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/playground?empty=1');
    await waitForEditor(page);
    await openBlockModal(page, 'multiple choice');
    await pickFirstTile(page);
    // With animation:none, animationend never fires — the class persists
    // until the janitor (1.2s), so a plain locator can see it.
    const settled = page.locator('.block-settle-in');
    await expect(settled).toHaveCount(1);
    const animation = await settled.evaluate(
        (el) => getComputedStyle(el).animationName,
    );
    expect(animation).toBe('none');
    // The janitor timeout still cleans up.
    await expect(settled).toHaveCount(0, { timeout: 3000 });
});

test('reduced motion: the transform-bearing chrome animations are none', async ({
    page,
}) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/playground');
    await waitForEditor(page);
    // Select a block → command bar appears; its pop-in must be suppressed.
    // (NodeSelection via the API — the block-command-bar.e2e idiom.)
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        let pos: number | null = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ed.state.doc.descendants((node: any, p: number) => {
            if (pos === null && node.type.name === 'paragraph') pos = p;
            return pos === null;
        });
        if (pos === null) throw new Error('no paragraph in playground doc');
        ed.commands.setNodeSelection(pos);
    });
    const bar = page.locator('.block-command-bar');
    await expect(bar).toBeVisible();
    expect(
        await bar.evaluate((el) => getComputedStyle(el).animationName),
    ).toBe('none');
});

test('popover opened during the settle anchors at the blank chip', async ({
    page,
}) => {
    await page.goto('/playground?empty=1');
    await waitForEditor(page);
    await openBlockModal(page, 'fill in the blank');
    await pickFirstTile(page);
    await expect(page.locator('.fill-in-blank-block')).toHaveCount(1);
    // Immediately insert-and-edit a blank — the popover measures its anchor
    // while the block may still be mid-settle (eng-review P1: origin-top
    // keeps the drift sub-pixel; this pins that the popover lands AT the
    // chip, not off in space).
    await page.keyboard.press('ControlOrMeta+Shift+b');
    const pop = page.locator('.blank-edit-popover');
    await expect(pop).toBeVisible();
    const chip = page.locator('.blank-chip').first();
    const chipBox = await chip.boundingBox();
    const popBox = await pop.boundingBox();
    expect(chipBox).not.toBeNull();
    expect(popBox).not.toBeNull();
    if (chipBox && popBox) {
        // Anchored: the popover sits within a chip-sized neighborhood —
        // a settle-induced mis-measure would strand it far away.
        const dy = Math.min(
            Math.abs(popBox.y - (chipBox.y + chipBox.height)),
            Math.abs(chipBox.y - (popBox.y + popBox.height)),
        );
        expect(dy).toBeLessThan(80);
        expect(popBox.x).toBeLessThan(chipBox.x + chipBox.width + 320);
        expect(popBox.x + popBox.width).toBeGreaterThan(chipBox.x - 320);
    }
});

import { test, expect, type Page } from '@playwright/test';

// ============================================================================
// Image crop mode — the authoring gesture (image-crop.md, TEST_SPEC CR-M5/M7/
// M10 + CR-INV1/2 + CR-S3/S4).
// ----------------------------------------------------------------------------
// Enter crop from the command-bar "Crop" primary → a draggable/resizable frame
// over the full source → Apply commits crop{x,y,w,h}+srcAspect, Cancel/Escape
// discards. The pure frame math (coordinate mapping, min-size clamp, in-bounds)
// is unit-pinned in cropGeometry.test.ts; here we prove the end-to-end lifecycle
// against the real editor. The resize is driven by synthetic pointer events on
// the SE handle (deterministic — no pixel-drag flake).
// ============================================================================

const BAR = '.block-command-bar';
const CROP = '.image-crop';

// A 2:1 source (400×200) → srcAspect 2, so the committed values are predictable.
const SVG_2x1 =
    'data:image/svg+xml,' +
    encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' width='400' height='200'>" +
            "<rect width='400' height='200' fill='#dbeafe'/>" +
            "<circle cx='100' cy='100' r='60' fill='#ef4444'/></svg>",
    );

async function boot(page: Page) {
    await page.goto('/playground?empty=1');
    await expect(page.locator('.ProseMirror')).toBeVisible();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await page.waitForFunction(() => Boolean((window as any).__tiptapEditor));
}

async function insertImage(page: Page, src: string) {
    await page.evaluate((src) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        ed.chain().focus('end').insertImage({ src, alt: 'shapes' }).run();
        ed.commands.focus('end'); // close the insert popover
    }, src);
}

async function selectImage(page: Page) {
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        let pos: number | null = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ed.state.doc.descendants((n: any, p: number) => {
            if (pos === null && n.type.name === 'image') pos = p;
            return pos === null;
        });
        ed.commands.setNodeSelection(pos);
    });
}

function imageAttrs(page: Page) {
    return page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let a: any = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ed.state.doc.descendants((n: any) => {
            if (!a && n.type.name === 'image') a = n.attrs;
        });
        return { crop: a.crop, srcAspect: a.srcAspect, width: a.width, src: a.src };
    });
}

/** Drag the SE handle by a normalized (dx,dy) via synthetic pointer events. */
async function resizeSE(page: Page, dxFrac: number, dyFrac: number) {
    await page.locator('.image-crop__handle--se').waitFor();
    await page.evaluate(
        ({ dxFrac, dyFrac }) => {
            const handle = document.querySelector('.image-crop__handle--se')!;
            const img = document
                .querySelector('.image-crop__img')!
                .getBoundingClientRect();
            const b = handle.getBoundingClientRect();
            const sx = b.x + b.width / 2;
            const sy = b.y + b.height / 2;
            const tx = sx + dxFrac * img.width;
            const ty = sy + dyFrac * img.height;
            const pe = (type: string, x: number, y: number) =>
                handle.dispatchEvent(
                    new PointerEvent(type, {
                        bubbles: true,
                        cancelable: true,
                        clientX: x,
                        clientY: y,
                        button: 0,
                        pointerId: 1,
                    }),
                );
            pe('pointerdown', sx, sy);
            pe('pointermove', tx, ty);
            pe('pointerup', tx, ty);
        },
        { dxFrac, dyFrac },
    );
    // Wait for React to re-render the moved frame before Apply reads it.
    await page.waitForFunction(() => {
        const f = document.querySelector('.image-crop__frame');
        const i = document.querySelector('.image-crop__img');
        if (!f || !i) return false;
        return (
            f.getBoundingClientRect().width <
            i.getBoundingClientRect().width - 1
        );
    });
}

async function clickCrop(page: Page) {
    await page.locator(BAR).getByRole('button', { name: 'Crop' }).click();
}

test.beforeEach(async ({ page }) => {
    await boot(page);
});

test('CR-M5/M7 — enter Crop, resize, Apply writes crop + srcAspect', async ({
    page,
}) => {
    await insertImage(page, SVG_2x1);
    await selectImage(page);
    await expect(page.locator(CROP)).toHaveCount(0);

    await clickCrop(page);
    await expect(page.locator(CROP)).toBeVisible();

    // Shrink SE by half in each axis → the top-left quadrant {0,0,0.5,0.5}.
    await resizeSE(page, -0.5, -0.5);
    await page.locator('.image-crop__btn--apply').click();

    await expect(page.locator(CROP)).toHaveCount(0);
    const attrs = await imageAttrs(page);
    expect(attrs.crop).toEqual({ x: 0, y: 0, w: 0.5, h: 0.5 });
    expect(attrs.srcAspect).toBe(2);
});

test('CR-M5 — Cancel discards with no commit', async ({ page }) => {
    await insertImage(page, SVG_2x1);
    await selectImage(page);
    await clickCrop(page);
    await expect(page.locator(CROP)).toBeVisible();

    await resizeSE(page, -0.5, -0.5);
    await page.locator('.image-crop__btn--cancel').click();

    await expect(page.locator(CROP)).toHaveCount(0);
    const attrs = await imageAttrs(page);
    expect(attrs.crop).toBeNull();
    expect(attrs.srcAspect).toBeNull();
});

test('CR-M5 — Escape discards with no commit', async ({ page }) => {
    await insertImage(page, SVG_2x1);
    await selectImage(page);
    await clickCrop(page);
    await expect(page.locator(CROP)).toBeVisible();

    await resizeSE(page, -0.4, -0.4);
    await page.locator(CROP).focus();
    await page.keyboard.press('Escape');

    await expect(page.locator(CROP)).toHaveCount(0);
    const attrs = await imageAttrs(page);
    expect(attrs.crop).toBeNull();
});

test('CR-M10 — re-entering crop seeds the frame to the existing rect', async ({
    page,
}) => {
    await insertImage(page, SVG_2x1);
    await selectImage(page);
    await clickCrop(page);
    await resizeSE(page, -0.5, -0.5);
    await page.locator('.image-crop__btn--apply').click();
    expect((await imageAttrs(page)).crop).toEqual({ x: 0, y: 0, w: 0.5, h: 0.5 });

    // Re-enter: the frame must start AT the stored rect, not the full source.
    await clickCrop(page);
    await expect(page.locator(CROP)).toBeVisible();
    const frame = await page.evaluate(() => {
        const f = document
            .querySelector('.image-crop__frame')!
            .getBoundingClientRect();
        const i = document
            .querySelector('.image-crop__img')!
            .getBoundingClientRect();
        return {
            w: +(f.width / i.width).toFixed(2),
            h: +(f.height / i.height).toFixed(2),
        };
    });
    expect(frame).toEqual({ w: 0.5, h: 0.5 });
});

test('CR-INV1/M8 — a not-loaded / broken source cannot enter crop', async ({
    page,
}) => {
    // A source that never resolves → naturalW/H unknown → crop disabled.
    await insertImage(page, 'https://invalid.invalid/nope.png');
    await selectImage(page);
    // The bar still shows Crop; clicking it must NOT open the frame.
    await clickCrop(page);
    // Give the request a beat; the guard blocks entry.
    await page.waitForTimeout(150);
    await expect(page.locator(CROP)).toHaveCount(0);
});

test('CR-INV2 — replacing the source clears crop + srcAspect', async ({
    page,
}) => {
    await insertImage(page, SVG_2x1);
    await selectImage(page);
    await clickCrop(page);
    await resizeSE(page, -0.5, -0.5);
    await page.locator('.image-crop__btn--apply').click();
    expect((await imageAttrs(page)).crop).not.toBeNull();

    // Replace the src through the same command the popover uses.
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        let pos: number | null = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ed.state.doc.descendants((n: any, p: number) => {
            if (pos === null && n.type.name === 'image') pos = p;
            return pos === null;
        });
        ed.commands.updateImageAttrs(pos, {
            src: 'https://example.com/other.png',
        });
    });
    const attrs = await imageAttrs(page);
    expect(attrs.crop).toBeNull();
    expect(attrs.srcAspect).toBeNull();
});

test('CR-S3 — the editor preview renders the same crop window as the renderer', async ({
    page,
}) => {
    await insertImage(page, SVG_2x1);
    await selectImage(page);
    await clickCrop(page);
    await resizeSE(page, -0.5, -0.5);
    await page.locator('.image-crop__btn--apply').click();

    // The preview window carries the derived aspect (srcAspect·w/h = 2·1 = 2)
    // and the img the same scaled/offset style the renderer emits.
    const win = page.locator('.image-preview__crop');
    await expect(win).toBeVisible();
    // The browser normalizes `aspect-ratio: 2` to `2 / 1`; parse it back to a
    // number — it must equal srcAspect·w/h = 2·1 = 2 (the renderer's derived A).
    const ratio = await win.evaluate((el) => {
        const ar = getComputedStyle(el as HTMLElement).aspectRatio;
        const [a, b] = ar.split('/').map((s) => parseFloat(s));
        return b ? a / b : a;
    });
    expect(ratio).toBeCloseTo(2);
    const imgStyle = await page
        .locator('.image-preview__img--cropped')
        .evaluate((el) => {
            const s = (el as HTMLElement).style;
            return { width: s.width, height: s.height, left: s.left, top: s.top };
        });
    expect(imgStyle).toEqual({
        width: '200%',
        height: '200%',
        left: '0%',
        top: '0%',
    });
});

test('CR-S4 — Reset crop clears only crop+srcAspect, leaving width', async ({
    page,
}) => {
    await insertImage(page, SVG_2x1);
    await selectImage(page);
    // Give the image a width first.
    await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ed = (window as any).__tiptapEditor;
        let pos: number | null = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ed.state.doc.descendants((n: any, p: number) => {
            if (pos === null && n.type.name === 'image') pos = p;
            return pos === null;
        });
        ed.commands.updateImageAttrs(pos, { width: 0.5 });
    });
    await selectImage(page);
    await clickCrop(page);
    await resizeSE(page, -0.5, -0.5);
    await page.locator('.image-crop__btn--apply').click();
    let attrs = await imageAttrs(page);
    expect(attrs.crop).not.toBeNull();
    expect(attrs.width).toBe(0.5);

    // Open Settings → Advanced → Reset crop.
    await selectImage(page);
    await page.locator(BAR).getByRole('button', { name: 'Settings', exact: true }).click();
    await page.locator(BAR).getByRole('button', { name: 'Advanced' }).click();
    await page.getByRole('button', { name: 'Reset crop' }).click();

    attrs = await imageAttrs(page);
    expect(attrs.crop).toBeNull();
    expect(attrs.srcAspect).toBeNull();
    expect(attrs.width).toBe(0.5); // width survives (CR-S4)
});

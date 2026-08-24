import { test, expect, type Page } from '@playwright/test';

// ============================================================================
// Dark-mode contrast harness — dark-mode slice 4 (docs/design/dark-mode.md).
// ----------------------------------------------------------------------------
// The fix-6 computed-color canary proves LIGHT didn't regress; it says nothing
// about DARK, where the values are intentionally different. This harness reads
// the REAL resolved role colors (the CSS is the source of truth — no duplicated
// palette) with each theme FORCED via data-theme, and asserts WCAG AA. It exists
// mainly to guard the "muted is AA on every surface" invariant across the dark
// elevation ladder (harder in dark — muted text spans canvas AND surface), plus
// the white-text buttons (it already caught dark accent-strong at blue-500 =
// 3.7:1 and forced blue-600). Runs on Home (`/`) — the @theme roles are global.
// ============================================================================

const AA = 4.5; // WCAG AA, normal text / UI
const WHITE: RGB = [255, 255, 255];
type RGB = [number, number, number];
type Roles = Record<string, RGB>;

// WCAG relative luminance + contrast ratio (sRGB 8-bit in).
function luminance([r, g, b]: RGB): number {
    const lin = (c: number) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
function contrast(a: RGB, b: RGB): number {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
}

// Read resolved role colors for a forced theme. Paints each role onto a probe
// (so light-dark() resolves per the root's color-scheme) and rasterizes to sRGB
// 8-bit via canvas (so oklch primitives come back as plain rgb).
async function readRoles(page: Page, theme: 'light' | 'dark'): Promise<Roles> {
    return page.evaluate((t) => {
        const root = document.documentElement;
        const prev = root.getAttribute('data-theme');
        root.setAttribute('data-theme', t);
        const cv = document.createElement('canvas');
        cv.width = cv.height = 1;
        const ctx = cv.getContext('2d')!;
        const probe = document.createElement('div');
        document.body.appendChild(probe);
        const px = (role: string): [number, number, number] => {
            probe.style.color = `var(--color-${role})`;
            const resolved = getComputedStyle(probe).color;
            ctx.clearRect(0, 0, 1, 1);
            ctx.fillStyle = '#000';
            ctx.fillStyle = resolved;
            ctx.fillRect(0, 0, 1, 1);
            const d = ctx.getImageData(0, 0, 1, 1).data;
            return [d[0], d[1], d[2]];
        };
        const roles = [
            'canvas', 'surface', 'surface-2', 'surface-3',
            'ink', 'strong', 'muted',
            'primary', 'accent-strong', 'accent-stronger',
            'success', 'success-strong', 'success-bg',
            'warning-strong', 'warning-text', 'warning-bg', 'warning-bg-2',
        ];
        const out: Record<string, [number, number, number]> = {};
        for (const r of roles) out[r] = px(r);
        probe.remove();
        if (prev) root.setAttribute('data-theme', prev);
        else root.removeAttribute('data-theme');
        return out;
    }, theme);
}

for (const theme of ['light', 'dark'] as const) {
    test(`${theme}: text roles meet AA across the surface ladder`, async ({
        page,
    }) => {
        await page.goto('/');
        const r = await readRoles(page, theme);
        // muted must be AA on BOTH the page (surface) and cards (canvas) — the
        // invariant fix 2/6 established for light, re-proven for the dark ladder.
        expect(contrast(r.muted, r.canvas)).toBeGreaterThanOrEqual(AA);
        expect(contrast(r.muted, r.surface)).toBeGreaterThanOrEqual(AA);
        // strong (labels/secondary headings) — AA on both surfaces.
        expect(contrast(r.strong, r.canvas)).toBeGreaterThanOrEqual(AA);
        expect(contrast(r.strong, r.surface)).toBeGreaterThanOrEqual(AA);
        // ink (primary text) — a stronger guarantee than the AA floor.
        expect(contrast(r.ink, r.canvas)).toBeGreaterThanOrEqual(7);
        expect(contrast(r.ink, r.surface)).toBeGreaterThanOrEqual(7);
    });

    test(`${theme}: solid white-text buttons meet AA`, async ({ page }) => {
        await page.goto('/');
        const r = await readRoles(page, theme);
        // bg-primary text-white (14 buttons), bg-accent-strong text-white (Print)
        // and its hover bg-accent-stronger — every one carries white text.
        expect(contrast(WHITE, r.primary)).toBeGreaterThanOrEqual(AA);
        expect(contrast(WHITE, r['accent-strong'])).toBeGreaterThanOrEqual(AA);
        expect(contrast(WHITE, r['accent-stronger'])).toBeGreaterThanOrEqual(AA);
    });
}

// Print always renders light (slice 5) — even for a forced-dark user. Under
// print emulation, color-scheme:light must win, so light-dark() resolves LIGHT:
// light paper, dark ink.
test('print forces light even for a dark-theme user', async ({ page }) => {
    await page.goto('/');
    await page.emulateMedia({ media: 'print' });
    const r = await readRoles(page, 'dark'); // data-theme=dark forced inside
    expect(luminance(r.canvas)).toBeGreaterThan(0.8); // white-ish paper
    expect(luminance(r.surface)).toBeGreaterThan(0.8);
    expect(luminance(r.ink)).toBeLessThan(0.1); // dark ink
});

// The status TINT badges. The -bg tokens are hand-picked tints in each theme;
// the TEXT sits on the tint (badges) or on the canvas (inline status text).
// Both themes must hold AA now — the light -600 status colors were sub-AA as
// small text (success 3.8:1 / warning 3.2:1), fixed by moving TEXT onto the
// darker -strong / -text tokens (success text → -success-strong emerald-700,
// warning text → -warning-text amber-700), accents/dots kept on the -600 base.
for (const theme of ['light', 'dark'] as const) {
    test(`${theme}: status text tokens meet AA on tint and canvas`, async ({
        page,
    }) => {
        await page.goto('/');
        const r = await readRoles(page, theme);
        // bg-success-bg text-success-strong (Published badge) + inline ✓ marks
        // (text-success-strong on the canvas: grading/submission result text).
        expect(contrast(r['success-strong'], r['success-bg'])).toBeGreaterThanOrEqual(AA);
        expect(contrast(r['success-strong'], r.canvas)).toBeGreaterThanOrEqual(AA);
        // text-warning-text on the canvas (grading status labels + "in progress").
        expect(contrast(r['warning-text'], r.canvas)).toBeGreaterThanOrEqual(AA);
        // bg-warning-bg-2 text-warning-strong (Archived badge — bumped off the
        // borderline -warning-text pair to amber-800 for headroom) and
        // bg-warning-bg text-warning-strong (callouts).
        expect(contrast(r['warning-strong'], r['warning-bg-2'])).toBeGreaterThanOrEqual(AA);
        expect(contrast(r['warning-strong'], r['warning-bg'])).toBeGreaterThanOrEqual(AA);
    });
}

// -----------------------------------------------------------------------------
// The static-svg figure's CHROME (graph-figure-convergence, T7).
//
// `renderGraphSvg` hardcodes its grid, axes and tick labels as presentation
// ATTRIBUTES in a light-only palette (#cbd5e1 / #64748b / #475569) — it is the
// print renderer and it predates dark mode. Measured on the dark surface before
// viewer.css re-pointed them at tokens: tick labels 2.36:1, below even the 3:1
// floor for graphics, on a figure a student is meant to READ COORDINATES from.
//
// This row exists because that failure was invisible to every other lane: the
// print gate runs on white, the a11y lane runs axe (which does not evaluate SVG
// presentation attributes against their surface), and the component tests run in
// jsdom, which has no computed colour at all. It took a real browser in a real
// theme, which is exactly what this file is.
//
// The DRAWABLES are deliberately not asserted here: their colour is authored
// meaning ("the blue line"), it is identical on paper and on screen by design,
// and it is the one part of the figure that must not follow the theme.
for (const theme of ['light', 'dark'] as const) {
    test(`${theme}: a graph figure's grid chrome is legible on the page`, async ({
        page,
    }) => {
        await page.goto('/dev/viewer?type=graph_figure');
        const figure = page.locator('.viewer-figure > svg');
        await expect(figure).toBeVisible();

        const measured = await page.evaluate((t) => {
            const root = document.documentElement;
            const prev = root.getAttribute('data-theme');
            root.setAttribute('data-theme', t);

            const svg = document.querySelector('.viewer-figure > svg')!;
            const rgb = (s: string): [number, number, number] =>
                s.match(/\d+(\.\d+)?/g)!.slice(0, 3).map(Number) as [number, number, number];

            // The first opaque ancestor is what the figure actually sits on.
            let el: HTMLElement | null = svg.parentElement;
            let bg = 'rgba(0, 0, 0, 0)';
            while (el && (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent')) {
                bg = getComputedStyle(el).backgroundColor;
                el = el.parentElement;
            }

            // The engine emits grid first, then axes (graph-svg.ts).
            const groups = svg.querySelectorAll('g[stroke]');
            const out = {
                surface: rgb(bg),
                label: rgb(getComputedStyle(svg.querySelector('text')!).fill),
                grid: rgb(getComputedStyle(groups[0]!).stroke),
                axis: rgb(getComputedStyle(groups[1]!).stroke),
            };
            if (prev) root.setAttribute('data-theme', prev);
            else root.removeAttribute('data-theme');
            return out;
        }, theme);

        // Tick labels are TEXT a student reads, so they carry the full AA bar.
        expect(
            contrast(measured.label, measured.surface),
            `${theme}: tick labels must be readable, not merely present`,
        ).toBeGreaterThanOrEqual(AA);

        // Axes are a graphical object: the 3:1 floor, not 4.5.
        expect(
            contrast(measured.axis, measured.surface),
            `${theme}: the axes must be distinguishable from the page`,
        ).toBeGreaterThanOrEqual(3);

        // ⚠ RELATIVE, NOT ABSOLUTE, AND THAT IS THE POINT. The defect this
        // catches was never a contrast FAILURE — on dark the grid measured
        // 12:1 while the axes measured 3.75:1, so the reference grid was
        // shouting four times louder than the data drawn on it. Both numbers
        // pass every absolute floor; only their ORDER is wrong. A threshold
        // could not have seen it.
        expect(
            contrast(measured.grid, measured.surface),
            `${theme}: the grid is louder than the axes — a reference grid must ` +
                `never out-shout the data drawn on it`,
        ).toBeLessThan(contrast(measured.axis, measured.surface));

        // ...and still present. "Quieter" has a floor: an invisible grid is a
        // different defect, not a fix for this one.
        expect(
            contrast(measured.grid, measured.surface),
            `${theme}: the grid vanished into the page`,
        ).toBeGreaterThan(1.1);
    });
}

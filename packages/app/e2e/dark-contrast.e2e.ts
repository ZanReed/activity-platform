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

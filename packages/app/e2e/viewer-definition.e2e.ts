import { test, expect } from '@playwright/test';

// ============================================================================
// Viewer definitions — a tapped term opens the glossary on its definition.
// ----------------------------------------------------------------------------
// A definition mark is either simple (`definition: string`) or rich
// (`content: DefinitionBlock[]`). Every catalogue import is rich — the
// definitions fence admits math and formatting — but until 2026-09-26 the
// on-screen disclosure rendered only the simple form and showed the bare word
// "Definition" for everything else.
//
// Since the glossary arc (docs/design/glossary.md D6, 2026-09-27) the term no
// longer expands in place: it is a dialog button that opens the glossary
// focused on that term. Bound to rendered output: taps the fixture's rich
// "slope" term and reads the text a student sees inside the dialog.
// ============================================================================

test('tapping a rich definition opens the glossary on its content', async ({ page }) => {
    await page.goto('/dev/viewer?type=paragraph');
    const term = page.locator('.viewer-definition__term', { hasText: 'slope' });
    await expect(term).toHaveAttribute('aria-haspopup', 'dialog');
    await term.click();
    const dialog = page.getByRole('dialog', { name: 'Glossary' });
    await expect(dialog).toBeVisible();
    await expect(term).toHaveAttribute('aria-expanded', 'true');
    await expect(dialog).toContainText('How steep the line is: rise over run.');
    await expect(dialog.getByRole('heading', { name: 'slope', level: 2 })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(term).toBeFocused();
});

test('at phone width the term opens a half-height sheet that can browse and search', async ({
    page,
}) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/dev/viewer?type=paragraph');
    const term = page.locator('.viewer-definition__term', { hasText: 'slope' });
    await term.click();
    const dialog = page.getByRole('dialog', { name: 'Glossary' });
    await expect(dialog).toHaveAttribute('data-height', 'half');
    await expect(dialog).toContainText('How steep the line is: rise over run.');
    await dialog.getByRole('button', { name: 'Browse glossary' }).click();
    await expect(dialog).toHaveAttribute('data-height', 'full');
    const search = dialog.getByRole('searchbox');
    await search.fill('slo');
    await expect(dialog.locator('.glossary-row').first()).toContainText('slope');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(term).toBeFocused();
});

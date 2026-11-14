// @vitest-environment jsdom
// ActivityRowMenu — a library row's ⋯ menu (author ruling 2026-11-15).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import ActivityRowMenu from '../components/ActivityRowMenu';
import { viewerShareUrl } from '../lib/shareUrl';

afterEach(cleanup);

function renderMenu(props: { published?: boolean; previewOpen?: boolean; onTogglePreview?: () => void } = {}) {
    render(
        <MemoryRouter>
            <ActivityRowMenu
                activityId="act-1"
                title="Unit rates"
                published={props.published ?? true}
                previewOpen={props.previewOpen ?? false}
                onTogglePreview={props.onTogglePreview ?? (() => undefined)}
                buttonClassName=""
            />
            <button type="button">elsewhere</button>
        </MemoryRouter>,
    );
    return screen.getByRole('button', { name: 'More for Unit rates' });
}
const itemNames = () => screen.queryAllByRole('menuitem').map((i) => i.textContent);

describe('the row menu', () => {
    it('a published activity offers the link, the preview and print; a draft only print', () => {
        fireEvent.click(renderMenu());
        expect(itemNames()).toEqual(['Copy student link', 'Preview', 'Print']);
        expect(screen.getByRole('menuitem', { name: 'Print' }).getAttribute('href')).toBe('/activity/act-1/print');
        cleanup();
        fireEvent.click(renderMenu({ published: false }));
        expect(itemNames()).toEqual(['Print']);
    });

    it('keyboard: ArrowDown opens on the first item, arrows wrap, Escape closes back to the button', async () => {
        const button = renderMenu();
        button.focus();
        fireEvent.keyDown(button, { key: 'ArrowDown' });
        await waitFor(() => expect(document.activeElement?.textContent).toBe('Copy student link'));
        const menu = screen.getByRole('menu');
        fireEvent.keyDown(menu, { key: 'ArrowUp' });
        expect(document.activeElement?.textContent).toBe('Print');
        fireEvent.keyDown(menu, { key: 'ArrowDown' });
        expect(document.activeElement?.textContent).toBe('Copy student link');
        fireEvent.keyDown(menu, { key: 'Escape' });
        expect(screen.queryByRole('menu')).toBeNull();
        expect(document.activeElement).toBe(button);
        expect(button.getAttribute('aria-expanded')).toBe('false');
    });

    it('Copy student link copies the /a/:id URL and says so', async () => {
        const writeText = vi.fn(() => Promise.resolve());
        Object.assign(navigator, { clipboard: { writeText } });
        fireEvent.click(renderMenu());
        fireEvent.click(screen.getByRole('menuitem', { name: 'Copy student link' }));
        await waitFor(() => expect(writeText).toHaveBeenCalledWith(viewerShareUrl('act-1')));
        expect(viewerShareUrl('act-1')).toBe(`${window.location.origin}/a/act-1`);
        expect(screen.queryByRole('menu')).toBeNull();
        await waitFor(() => expect(document.querySelector('[aria-live="polite"]')?.textContent).toBe('Student link copied'));
    });

    it('Preview hands the toggle up and names its state', () => {
        const toggle = vi.fn();
        fireEvent.click(renderMenu({ onTogglePreview: toggle }));
        fireEvent.click(screen.getByRole('menuitem', { name: 'Preview' }));
        expect(toggle).toHaveBeenCalledTimes(1);
        cleanup();
        fireEvent.click(renderMenu({ previewOpen: true }));
        expect(itemNames()).toContain('Hide preview');
    });

    it('Tab closes it with focus back on the button; a failed copy says so', async () => {
        const button = renderMenu();
        fireEvent.click(button);
        await waitFor(() => expect(document.activeElement?.getAttribute('role')).toBe('menuitem'));
        fireEvent.keyDown(screen.getByRole('menu'), { key: 'Tab' });
        expect(screen.queryByRole('menu')).toBeNull();
        expect(document.activeElement).toBe(button);

        Object.assign(navigator, { clipboard: { writeText: vi.fn(() => Promise.reject(new Error('denied'))) } });
        fireEvent.click(button);
        fireEvent.click(screen.getByRole('menuitem', { name: 'Copy student link' }));
        await waitFor(() => expect(document.querySelector('[aria-live="polite"]')?.textContent).toBe('Could not copy the link'));
    });

    it('a click outside closes it', () => {
        fireEvent.click(renderMenu());
        fireEvent.pointerDown(screen.getByRole('button', { name: 'elsewhere' }));
        expect(screen.queryByRole('menu')).toBeNull();
    });
});

// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { setTheme } from '../lib/theme';

// The color mechanism is CSS (light-dark()); this store owns only the explicit
// override — localStorage persistence + the data-theme attribute that flips
// color-scheme. These pins guard that contract (dark-mode slice 3).
describe('theme store', () => {
    beforeEach(() => {
        localStorage.clear();
        document.documentElement.removeAttribute('data-theme');
    });

    it('forces dark: writes localStorage + data-theme="dark"', () => {
        setTheme('dark');
        expect(localStorage.getItem('theme')).toBe('dark');
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('forces light: data-theme="light"', () => {
        setTheme('light');
        expect(localStorage.getItem('theme')).toBe('light');
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('system: clears the override so color-scheme follows the OS', () => {
        setTheme('dark');
        setTheme('system');
        expect(localStorage.getItem('theme')).toBeNull();
        expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    });
});

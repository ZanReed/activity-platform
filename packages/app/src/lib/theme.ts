// =============================================================================
// theme.ts — light/dark theme store (dark-mode slice 3)
// -----------------------------------------------------------------------------
// The COLOR mechanism lives in CSS: every role is light-dark(LIGHT, DARK) and
// `color-scheme` picks the side (index.css / editor.css). This store owns the
// EXPLICIT override: it writes `data-theme` on <html> (which flips color-scheme
// via the [data-theme] rules) and persists the choice in localStorage.
//
//   'system' → no data-theme attr → color-scheme:light dark → follows the OS
//   'light'  → data-theme="light" → color-scheme:light → forced light
//   'dark'   → data-theme="dark"  → color-scheme:dark  → forced dark
//
// The pre-paint guard in index.html applies the stored choice before first
// paint (FOUC guard); this store keeps React in sync and handles changes.
// =============================================================================
import { useSyncExternalStore } from 'react';

export type Theme = 'system' | 'light' | 'dark';

const KEY = 'theme';
const listeners = new Set<() => void>();

function read(): Theme {
    try {
        const v = localStorage.getItem(KEY);
        if (v === 'light' || v === 'dark') return v;
    } catch {
        // localStorage can throw (private mode / disabled) — fall back to system.
    }
    return 'system';
}

function apply(theme: Theme): void {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
}

export function setTheme(theme: Theme): void {
    try {
        if (theme === 'system') localStorage.removeItem(KEY);
        else localStorage.setItem(KEY, theme);
    } catch {
        // Persistence best-effort; still apply for the current session.
    }
    apply(theme);
    listeners.forEach((notify) => notify());
}

function subscribe(onChange: () => void): () => void {
    listeners.add(onChange);
    return () => listeners.delete(onChange);
}

/** `[theme, setTheme]`. Reads the persisted choice; the index.html guard has
 *  already applied it to <html> before paint, so no mount-time re-apply. */
export function useTheme(): [Theme, (theme: Theme) => void] {
    const theme = useSyncExternalStore(subscribe, read, (): Theme => 'system');
    return [theme, setTheme];
}

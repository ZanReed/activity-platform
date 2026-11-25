// @vitest-environment jsdom
// =============================================================================
// AppErrorBoundary.test.tsx — the route-level net (review 2026-11-26, C5).
// A render throw shows a message and a Refresh button instead of a blank page;
// the page is NEVER reloaded unless the button is pressed (author ruling
// 2026-10-04); a new path clears the error; and App.tsx mounts it around
// every route (a source-level bond, so it cannot be built and left unmounted).
// =============================================================================

import { afterEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import AppErrorBoundary from '../components/AppErrorBoundary';

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

function Boom(): never {
    throw new Error('render failed');
}

describe('AppErrorBoundary', () => {
    it('shows a Refresh button for a render throw, and does not reload on its own', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const reload = vi.fn();
        vi.stubGlobal('location', { ...window.location, reload });
        try {
            render(
                <AppErrorBoundary resetKey="/classes">
                    <Boom />
                </AppErrorBoundary>,
            );
            expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
            expect(reload).not.toHaveBeenCalled();
            fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
            expect(reload).toHaveBeenCalledTimes(1);
        } finally {
            vi.unstubAllGlobals();
        }
    });

    it('logs what failed', () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});
        render(
            <AppErrorBoundary resetKey="/">
                <Boom />
            </AppErrorBoundary>,
        );
        expect(error.mock.calls.some((c) => String(c[0]).includes('[app] a page failed to render'))).toBe(true);
    });

    it('clears when the path changes', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const { rerender } = render(
            <AppErrorBoundary resetKey="/classes">
                <Boom />
            </AppErrorBoundary>,
        );
        expect(screen.getByRole('alert')).toBeInTheDocument();
        rerender(
            <AppErrorBoundary resetKey="/activities">
                <p>Fine now</p>
            </AppErrorBoundary>,
        );
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(screen.getByText('Fine now')).toBeInTheDocument();
    });

    it('catches a throw on the first render after a path change, and takes focus', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const { rerender } = render(
            <AppErrorBoundary resetKey="/classes">
                <p>Fine</p>
            </AppErrorBoundary>,
        );
        rerender(
            <AppErrorBoundary resetKey="/bank">
                <Boom />
            </AppErrorBoundary>,
        );
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Refresh' })).toHaveFocus();
    });

    it('renders its children untouched when nothing throws', () => {
        render(
            <AppErrorBoundary resetKey="/">
                <p>Hello</p>
            </AppErrorBoundary>,
        );
        expect(screen.getByText('Hello')).toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('wraps every route in App (the Routes sit inside it)', () => {
        // Source-level bond: a boundary that exists but is not mounted around
        // the routes is the orphan this repo keeps paying for.
        const app = readFileSync(resolve(__dirname, '../App.tsx'), 'utf8');
        const open = app.indexOf('<AppErrorBoundary resetKey={pathname}>');
        const close = app.indexOf('</AppErrorBoundary>');
        expect(open).toBeGreaterThan(-1);
        expect(app.indexOf('<Routes>')).toBeGreaterThan(open);
        expect(app.indexOf('</Routes>')).toBeLessThan(close);
    });
});

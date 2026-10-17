// @vitest-environment jsdom
// =============================================================================
// noNetworkGuard.test.ts — the no-network guard is wired and live (P3, P9)
// -----------------------------------------------------------------------------
// src/test/noNetwork.setup.ts is a setupFile: if the vite.config.ts wiring were
// dropped, nothing would fail — every test would just quietly reach the
// network again. These rows fail instead. They take the refused calls back
// from the guard so that tripping it here does not fail this file.
//
// The guard module is imported DYNAMICALLY, after the wiring row: importing it
// installs the guard as a side effect, so a static import would make every row
// here pass with the setupFiles line deleted (mutation-tested 2026-10-18 —
// that is exactly what the first draft of this file did).
// =============================================================================

import { describe, expect, it } from 'vitest';
import { STUB_LANE_SUPABASE_URL } from '../../e2e/helpers/e2eOrigins';

const guard = () => import('../test/noNetwork.setup');

describe('no-network guard', () => {
    it('is installed by setupFiles before this file imports anything of it', () => {
        const mark = Symbol.for('activity.noNetworkGuard');
        expect((globalThis.fetch as unknown as Record<symbol, unknown>)[mark]).toBe(true);
    });

    it('pins the Supabase origin to the dead stub-lane address, not .env.local', () => {
        expect(import.meta.env.VITE_SUPABASE_URL).toBe(STUB_LANE_SUPABASE_URL);
    });

    it('refuses fetch and records the call for the afterEach to fail on', async () => {
        const { takeRefusedCalls } = await guard();
        await expect(fetch('https://example.invalid/x', { method: 'POST' })).rejects.toThrow(
            /unit tests may not use the network — refused fetch POST https:\/\/example\.invalid\/x/,
        );
        expect(takeRefusedCalls()).toEqual(['fetch POST https://example.invalid/x']);
    });

    it('refuses XHR and WebSocket in jsdom', async () => {
        const { takeRefusedCalls } = await guard();
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://example.invalid/y');
        expect(() => xhr.send()).toThrow(/refused xhr GET https:\/\/example\.invalid\/y/);
        expect(() => new WebSocket('wss://example.invalid/z')).toThrow(/refused websocket/);
        expect(takeRefusedCalls()).toEqual([
            'xhr GET https://example.invalid/y',
            'websocket wss://example.invalid/z',
        ]);
    });
});

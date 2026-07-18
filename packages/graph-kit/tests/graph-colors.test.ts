// =============================================================================
// graph-colors.test.ts — value-identity pins for the consolidated color source.
// -----------------------------------------------------------------------------
// The color pass (docs/design/graph-kit-color.md) moves ~137 literals into
// graph-colors.ts WITHOUT changing their values. These pins lock each role to
// the exact literal it replaced, so the board-dedup + calculator sweep slices
// can't silently drift a color. A later dark pass will intentionally change
// values — at that point these become the LIGHT-side pins.
// =============================================================================

import { describe, it, expect } from 'vitest';
import {
    CURVE,
    SCATTER,
    FIT,
    ANSWER,
    ANSWER_FILL,
    AXIS,
    LABEL,
    INK,
    GRID,
    CURSOR_BG,
    OPEN_FILL,
    SHADE_FILL_OPACITY,
    SYSTEM_BOUNDARY_COLORS,
    EXPRESSION_PALETTE,
    GK_CHROME,
} from '../src/graph-colors.js';

describe('graph-colors value-identity', () => {
    it('board render roles match their pre-pass literals', () => {
        expect({
            CURVE,
            SCATTER,
            FIT,
            ANSWER,
            ANSWER_FILL,
            AXIS,
            LABEL,
            INK,
            GRID,
            CURSOR_BG,
            OPEN_FILL,
            SHADE_FILL_OPACITY,
        }).toEqual({
            CURVE: '#2563eb',
            SCATTER: '#0f172a',
            FIT: '#16a34a',
            ANSWER: '#7c3aed',
            ANSWER_FILL: '#c4b5fd',
            AXIS: '#64748b',
            LABEL: '#475569',
            INK: '#1e293b',
            GRID: '#e2e8f0',
            CURSOR_BG: '#f1f5f9',
            OPEN_FILL: '#ffffff',
            SHADE_FILL_OPACITY: 0.18,
        });
    });

    it('series palettes are unchanged (order matters)', () => {
        expect(SYSTEM_BOUNDARY_COLORS).toEqual([
            '#7c3aed',
            '#2563eb',
            '#059669',
            '#d97706',
            '#dc2626',
        ]);
        expect(EXPRESSION_PALETTE).toEqual([
            '#2563eb',
            '#dc2626',
            '#16a34a',
            '#9333ea',
            '#d97706',
            '#0891b2',
        ]);
    });

    it('chrome palette matches the calculator/question literals', () => {
        expect(GK_CHROME).toEqual({
            bg: '#ffffff',
            inkStrong: '#0f172a',
            ink: '#1e293b',
            text2: '#334155',
            textSecondary: '#475569',
            muted: '#64748b',
            faint: '#94a3b8',
            border: '#cbd5e1',
            surface: '#f8fafc',
            surface2: '#f1f5f9',
            hover: '#e2e8f0',
            accent: '#2563eb',
            accentText: '#1d4ed8',
            accentBorder: '#93c5fd',
            accentBg: '#eff6ff',
            accentBgActive: '#dbeafe',
            accentAlt: '#4338ca',
            accentAltBg: '#eef2ff',
            accentAltBg2: '#e0e7ff',
            error: '#b91c1c',
            errorBg: '#fef2f2',
            success: '#15803d',
            successAccent: '#16a34a',
            successBg: '#f0fdf4',
            overlayChip: 'rgba(255, 255, 255, 0.92)',
            overlayBar: 'rgba(255, 255, 255, 0.88)',
            overlayPanel: 'rgba(255, 255, 255, 0.97)',
            overlayFooter: 'rgba(255, 255, 255, 0.9)',
            shadow: 'rgba(0, 0, 0, 0.22)',
            shadowSoft: 'rgba(0, 0, 0, 0.08)',
        });
    });
});

import { describe, expect, it } from 'vitest';
import { DrawableColor } from '@activity/schema';
import { DRAWABLE_PALETTE_KEYS } from '@activity/graph-kit';

// ============================================================================
// Drawable color contract: the palette KEY list is defined in TWO places on
// purpose — the z.enum in @activity/schema (dependency-free validation) and the
// key -> hex map in @activity/graph-kit (the render source of truth). This
// drift guard keeps them in lockstep so a key can never validate but fail to
// resolve to a hex (or vice versa).
// ============================================================================

describe('drawable color key parity', () => {
    it('schema DrawableColor enum matches graph-kit DRAWABLE_PALETTE keys', () => {
        const schemaKeys = [...DrawableColor.options].sort();
        const kitKeys = [...DRAWABLE_PALETTE_KEYS].sort();
        expect(schemaKeys).toEqual(kitKeys);
    });
});

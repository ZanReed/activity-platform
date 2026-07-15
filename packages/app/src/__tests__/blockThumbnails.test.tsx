import { describe, expect, it } from 'vitest';
import { isValidElement } from 'react';
import {
    slashMenuItems,
    isPickableBlock,
} from '../editor/slashMenuItems';
import {
    blockThumbnails,
    startHereThumbnails,
} from '../editor/blockThumbnails';

// ============================================================================
// Thumbnail ↔ catalogue parity (slice-6 stage 5).
// ----------------------------------------------------------------------------
// The "Add a block" window renders a static SVG preview per pickable
// slashMenuItems entry, keyed by title. These guards keep the two catalogues
// in lockstep: a new block type can't ship without a thumbnail, and a renamed
// or removed block can't strand an orphaned one.
// ============================================================================

const pickableTitles = slashMenuItems
    .filter(isPickableBlock)
    .map((i) => i.title);

describe('blockThumbnails parity', () => {
    it('every pickable block has a thumbnail', () => {
        const missing = pickableTitles.filter((t) => !(t in blockThumbnails));
        expect(missing).toEqual([]);
    });

    it('every thumbnail keys a pickable block (no orphans)', () => {
        const orphans = Object.keys(blockThumbnails).filter(
            (t) => !pickableTitles.includes(t),
        );
        expect(orphans).toEqual([]);
    });

    it('thumbnails are React elements', () => {
        for (const el of Object.values(blockThumbnails)) {
            expect(isValidElement(el)).toBe(true);
        }
        for (const el of Object.values(startHereThumbnails)) {
            expect(isValidElement(el)).toBe(true);
        }
    });
});

describe('Start-here starter dependencies', () => {
    it('the "2 columns" catalogue entry the two-column starter uses exists', () => {
        // Editor.tsx's startColumns finds this item by title; renaming it in
        // slashMenuItems must update that lookup too.
        expect(slashMenuItems.some((i) => i.title === '2 columns')).toBe(true);
    });

    it('the "Blanks" category the question starter opens exists', () => {
        // startQuestion opens the picker at initialCategory 'Blanks' — the
        // label derives from the fill-in-blank items' subgroup.
        const labels = slashMenuItems
            .filter(isPickableBlock)
            .map((i) => i.subgroup ?? i.group);
        expect(labels).toContain('Blanks');
    });
});

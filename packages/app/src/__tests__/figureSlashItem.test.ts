// Y7 T7 (Q8, C1): "Graph figure" is offered in the MAIN editor now — it was
// reference-panel-only (the retired `referenceOnly` flag). The slash menu
// can't be driven in a browser test, so the offering is pinned here.
import { describe, expect, it } from 'vitest';
import { isPickableBlock, slashMenuItems } from '../editor/slashMenuItems';

describe('Graph figure is a body block', () => {
    const item = slashMenuItems.find((i) => i.title === 'Graph figure');

    it('exists, and the block pickers offer it', () => {
        expect(item).toBeDefined();
        expect(isPickableBlock(item!)).toBe(true);
    });

    it('stays available in the reference panel and the definition dialog', () => {
        expect(item!.referenceSafe).toBe(true);
        expect(item!.definitionSafe).toBe(true);
    });

    it('no slash item carries the retired referenceOnly flag', () => {
        expect(slashMenuItems.some((i) => 'referenceOnly' in i)).toBe(false);
    });
});

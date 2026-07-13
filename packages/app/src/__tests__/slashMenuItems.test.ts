import { describe, expect, it } from 'vitest';
import {
    slashMenuGroups,
    slashMenuItems,
} from '../editor/slashMenuItems';

// slashMenuItems is the single source both the slash menu and the toolbar's
// "+ Insert" dropdown render from. These tests pin the list's structural
// invariants so a careless entry can't silently break either surface.
describe('slashMenuItems', () => {
    it('has unique titles (titles are React keys and user-facing labels)', () => {
        const titles = slashMenuItems.map((i) => i.title);
        expect(new Set(titles).size).toBe(titles.length);
    });

    it('assigns every item to a declared group', () => {
        for (const item of slashMenuItems) {
            expect(slashMenuGroups).toContain(item.group);
        }
    });

    it('keeps activity-only structure and question blocks out of the reference panel', () => {
        // The reference-panel editor does not register SectionBreak or the
        // graph extensions, and hides question authoring — offering these
        // there would throw on unregistered commands.
        const activityOnly = [
            'Section break',
            'Fill in the blank',
            'Answer blank',
            'Interactive graph',
            'Static graph',
            'Number line',
        ];
        for (const title of activityOnly) {
            const item = slashMenuItems.find((i) => i.title === title);
            expect(item, title).toBeDefined();
            expect(item?.referenceSafe, title).not.toBe(true);
        }
    });

    it('marks the reference-safe alphabet available', () => {
        // Everything the constrained reference toolbar offered before the
        // reorganization must stay reachable from its Insert dropdown.
        const referenceSafe = [
            'Heading 1',
            'Heading 2',
            'Heading 3',
            'Bullet list',
            'Numbered list',
            'Block math',
            '2 columns',
            '3 columns',
            'Image',
        ];
        for (const title of referenceSafe) {
            const item = slashMenuItems.find((i) => i.title === title);
            expect(item?.referenceSafe, title).toBe(true);
        }
    });

    it('gives every Text-group item an isActive (the style picker needs it)', () => {
        // The toolbar's TextStylePicker renders the Text group and shows the
        // current block style on its trigger; an item without isActive could
        // never be detected as current.
        for (const item of slashMenuItems.filter((i) => i.group === 'Text')) {
            expect(item.isActive, item.title).toBeTypeOf('function');
        }
    });

    it('keeps the Text group reference-safe (both toolbar variants show the style picker)', () => {
        for (const item of slashMenuItems.filter((i) => i.group === 'Text')) {
            expect(item.referenceSafe, item.title).toBe(true);
        }
    });

    it('keeps inline math slash-only (the flat toolbar owns the ƒx button)', () => {
        const inlineMath = slashMenuItems.find((i) => i.title === 'Inline math');
        expect(inlineMath?.insertMenu).toBe(false);
    });

    it('gives every Insert-dropdown item an icon (the left gutter renders it)', () => {
        // The "+ Insert" dropdown shows a lucide icon per row. Text items live
        // in the TextStylePicker and inline math (insertMenu:false) keeps its
        // flat ƒx button, so neither needs one — but everything the dropdown
        // actually renders must have an icon or the gutter goes ragged.
        for (const item of slashMenuItems) {
            if (item.group === 'Text' || item.insertMenu === false) continue;
            // A lucide icon is a forwardRef component (an object), not a plain
            // function — assert presence rather than a callable type.
            expect(item.icon, item.title).toBeTruthy();
        }
    });

    it('gives every contextual (gated) item a disabled hint for the dropdown', () => {
        for (const item of slashMenuItems) {
            if (item.isEnabled) {
                expect(item.disabledHint, item.title).toBeTruthy();
            }
        }
    });
});

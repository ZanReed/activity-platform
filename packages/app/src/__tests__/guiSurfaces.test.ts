// =============================================================================
// guiSurfaces.test.ts — every capability names its GUI, its tracked gap, or
// its exemption (author ruling 2026-11-12; CLAUDE.md "EVERY FEATURE SHIPS WITH
// A GUI"). Each claim is bound to something real: a slash title must be in the
// menu, a file marker must be in the file, a gap must have its TODOS heading.
// =============================================================================

import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { JOIN } from '../lib/capabilityFacts';
import { GUI_SURFACES } from '../lib/guiSurfaces';
import { slashMenuItems } from '../editor/slashMenuItems';

const SRC = fileURLToPath(new URL('../', import.meta.url));
const TODOS = readFileSync(fileURLToPath(new URL('../../../../TODOS.md', import.meta.url)), 'utf8');
const rows = Object.entries(GUI_SURFACES);

describe('the GUI roster covers exactly the capabilities', () => {
    it('has one row per JOIN capability, no more, no fewer', () => {
        expect(Object.keys(GUI_SURFACES).sort()).toEqual(Object.keys(JOIN).sort());
    });
});

describe('each row is bound to something real', () => {
    const titles = new Set(slashMenuItems.map((item) => item.title));

    it.each(rows.filter(([, s]) => 'slash' in s))('%s: its slash title is in the menu', (_id, surface) => {
        expect(titles.has((surface as { slash: string }).slash)).toBe(true);
    });

    it.each(rows.filter(([, s]) => 'file' in s))('%s: its control is in the named file', (_id, surface) => {
        const { file, marker } = surface as { file: string; marker: string };
        const path = `${SRC}${file}`;
        expect(existsSync(path), `${file} does not exist`).toBe(true);
        expect(readFileSync(path, 'utf8')).toContain(marker);
    });

    it.each(rows.filter(([, s]) => 'gap' in s))('%s: its gap is tracked in TODOS.md', (id, surface) => {
        const gap = (surface as { gap: string }).gap;
        expect(gap).toBe(id);
        expect(TODOS).toContain(`## GUI gap — \`${gap}\``);
    });

    it.each(rows.filter(([, s]) => 'exempt' in s))('%s: its exemption gives a reason', (_id, surface) => {
        expect((surface as { exempt: string }).exempt.length).toBeGreaterThan(40);
    });
});

describe('a closed gap does not linger', () => {
    it('every "GUI gap" heading in TODOS.md names a capability that is still a gap', () => {
        const headed = [...TODOS.matchAll(/^## GUI gap — `([a-z_]+)`/gm)].map((m) => m[1]);
        const gaps = rows.filter(([, s]) => 'gap' in s).map(([id]) => id);
        expect(headed.sort()).toEqual(gaps.sort());
    });
});

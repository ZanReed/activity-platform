// =============================================================================
// glossaryFile.test.ts — the course glossary file's rules (glossary R3, W-2,
// W-3, W-7, EN-8, EN-11)
// -----------------------------------------------------------------------------
// Every rule is asserted through the MESSAGE it prints, because the message is
// the product here: it must name the line and the fix (W-7).
// =============================================================================

import { beforeAll, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getGlossaryLoader, type GlossaryLoader } from '../lib/glossaryFile';

let load: GlossaryLoader;
beforeAll(async () => {
    load = await getGlossaryLoader();
});

const fence = (...lines: string[]) => ['```definitions', ...lines, '```'].join('\n');

describe('glossary file loader', () => {
    it('loads the checked-in fixture (W-1): ids, terms, the us: variant, math bodies', () => {
        const text = readFileSync(
            resolve(__dirname, '../../../../scripts/fixtures/glossary/glossary.fixture.md'),
            'utf8',
        );
        const res = load(text, 'glossary.fixture.md');
        expect(res.warnings).toEqual([]);
        expect(res.entries.map((e) => e.id).slice(0, 3)).toEqual(['gradient', 'y-intercept', 'rate']);
        expect(res.entries[0]).toMatchObject({ term: 'gradient', variants: { us: 'slope' } });
        expect(JSON.stringify(res.entries[1]?.body)).toContain('math_inline');
        expect(res.variantCount).toBeGreaterThanOrEqual(1);
    });

    it('requires an id: line, naming the line and the fix (W-2)', () => {
        const res = load(fence('term: gradient', 'Steep.'), 'g.md');
        expect(res.entries).toEqual([]);
        expect(res.warnings).toEqual([
            expect.stringMatching(/^g\.md:2 \(no id\) “gradient” — no id: line, entry skipped; add “id: <stable-id>”/),
        ]);
    });

    it('refuses an id the store would refuse', () => {
        const res = load(fence('id: Gradient!', 'term: gradient', 'Steep.'), 'g.md');
        expect(res.warnings[0]).toMatch(/^g\.md:2 Gradient! — not a valid id/);
    });

    it('keeps the FIRST of a duplicate id and locates the first', () => {
        const res = load(
            fence('id: gradient', 'term: gradient', 'One.', '---', 'id: gradient', 'term: other', 'Two.'),
            'g.md',
        );
        expect(res.entries.map((e) => e.term)).toEqual(['gradient']);
        expect(res.warnings).toEqual([
            'g.md:6 gradient — duplicate id (first at line 2), entry skipped; give one entry a different id:',
        ]);
    });

    it('refuses a second entry claiming a term or variant already taken', () => {
        const res = load(
            fence('id: gradient', 'term: gradient', 'us: slope', 'One.', '---', 'id: slope', 'term: Slope', 'Two.'),
            'g.md',
        );
        expect(res.entries.map((e) => e.id)).toEqual(['gradient']);
        expect(res.warnings[0]).toMatch(/^g\.md:8 slope — term “Slope” is already a name of gradient \(line 2\)/);
    });

    it('drops a variant that collides with another entry’s name, keeping the entry', () => {
        const res = load(
            fence('id: rate', 'term: rate', 'One.', '---', 'id: speed', 'term: speed', 'us: rate', 'Two.'),
            'g.md',
        );
        expect(res.entries.map((e) => [e.id, e.variants])).toEqual([
            ['rate', {}],
            ['speed', {}],
        ]);
        expect(res.warnings[0]).toMatch(/^g\.md:8 speed — variant us: “rate” is already a name of rate/);
    });

    it('knows only the us: locale (W-3)', () => {
        const res = load(fence('id: colour', 'term: colour', 'uk: colour', 'fr: couleur', 'Hue.'), 'g.md');
        expect(res.entries).toHaveLength(1);
        expect(res.warnings).toEqual([
            expect.stringMatching(/^g\.md:4 colour — unknown variant key “uk:”, line ignored; v1 knows only us:/),
            expect.stringMatching(/^g\.md:5 colour — unknown variant key “fr:”/),
        ]);
    });

    it('rejects a body carrying an answer gap — store bodies skip sanitize (EN-8)', () => {
        const res = load(fence('id: sum', 'term: sum', 'The sum is $1 + \\gap{2}$.'), 'g.md');
        expect(res.entries).toEqual([]);
        expect(res.warnings[0]).toMatch(/^g\.md:2 sum — the definition holds content a glossary entry cannot/);
    });

    it('skips an entry with no definition text', () => {
        const res = load(fence('id: empty', 'term: empty'), 'g.md');
        expect(res.warnings[0]).toMatch(/^g\.md:2 empty — no definition text/);
    });

    it('skips an entry over the 16 KB cap', () => {
        const res = load(fence('id: big', 'term: big', 'x'.repeat(17 * 1024)), 'g.md');
        expect(res.entries).toEqual([]);
        expect(res.warnings[0]).toMatch(/^g\.md:2 big — the definition is 1\d KB, over the 16 KB entry cap/);
    });

    it('flags a glossary over the 1 MB total cap (EN-11)', () => {
        const entries: string[] = [];
        for (let i = 0; i < 70; i += 1) {
            if (i) entries.push('---');
            entries.push(`id: t${i}`, `term: term ${i}`, 'y'.repeat(15 * 1024));
        }
        const res = load(fence(...entries), 'g.md');
        expect(res.entries).toHaveLength(70);
        expect(res.overTotalCap).toBe(true);
        expect(res.warnings.at(-1)).toMatch(/^g\.md — definitions total \d+ KB, over the 1024 KB glossary cap/);
    });

    it('says so when the file has no definitions fence at all', () => {
        expect(load('# Glossary\n\nNothing here.', 'g.md').warnings[0]).toMatch(
            /^g\.md:1 — no ```definitions fence/,
        );
    });
});

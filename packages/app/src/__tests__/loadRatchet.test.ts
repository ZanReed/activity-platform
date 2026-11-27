// Review C5 slice 2 (docs/design/shared-data-loading.md, decision 7): screens
// move onto lib/useLoad.ts as they are touched, and these two rows keep the
// move from sliding back.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = join(__dirname, '..');

function sourceFiles(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) return name === '__tests__' || name === 'test' ? [] : sourceFiles(p);
        return /\.tsx?$/.test(name) ? [p] : [];
    });
}

const files = sourceFiles(SRC).map((p) => ({ path: relative(SRC, p), text: readFileSync(p, 'utf8') }));

/** The hand-written latest-wins flags useLoad replaces (`let cancelled = false`
 *  and its `live` / `alive` spellings). 50 on 2026-11-27 before slice 2; 46
 *  after it. LOWER this when a screen moves; never raise it — load through
 *  useLoad instead. */
const FLAG_CEILING = 46;

describe('the loading ratchet', () => {
    it('hand-written cancelled/live/alive flags do not go up', () => {
        const count = files.reduce((n, f) => n + (f.text.match(/\blet (cancelled|live|alive)\b/g) ?? []).length, 0);
        expect(count, `${count} flags; the ceiling is ${FLAG_CEILING}`).toBeLessThanOrEqual(FLAG_CEILING);
        // A ceiling far above the count is a claim nobody checks (P11).
        expect(FLAG_CEILING - count, 'lower FLAG_CEILING to the new count').toBeLessThanOrEqual(2);
    });

    it('the class list is read through lib/classList.ts, so every screen shares one copy', () => {
        // PublishStatus re-reads on opening its picker (DR-9a: fresh, beside
        // the activity's own rows) and writes the answer into the shared copy.
        const ALLOWED = new Set(['lib/classes.ts', 'lib/classList.ts', 'components/PublishStatus.tsx']);
        const callers = files.filter((f) => /\blistClasses\(/.test(f.text)).map((f) => f.path);
        expect(callers.filter((p) => !ALLOWED.has(p))).toEqual([]);
        expect(readFileSync(join(SRC, 'components/PublishStatus.tsx'), 'utf8')).toMatch(/updateLoaded<ClassInfo\[\]>\(CLASS_LIST_KEY/);
    });
});

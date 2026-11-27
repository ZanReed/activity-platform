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

/** A catch that does nothing: an empty `catch {}` block (comments only), or a
 *  promise catch that returns a constant (`.catch(() => undefined)`, `() => {}`,
 *  `() => null`, `() => []`, `() => false`, `(_e) => …`), as `.catch`'s
 *  argument or as `.then`'s second one, one line or Prettier's multi-line form
 *  with its trailing comma. Its REASON is a comment on the same line, a
 *  comment-only line directly above, or a comment inside the arrow's body —
 *  never a neighbour's comment further away (Fable review, slice 3). */
const COMMENT = /(^|[\s;,)])\/\/|\/\*/;
function silentCatches(text: string): { line: number; reason: boolean }[] {
    const lines = text.split('\n');
    const lineOf = (i: number) => text.slice(0, i).split('\n').length;
    const out: { line: number; reason: boolean }[] = [];
    for (const m of text.matchAll(/catch\s*(\([^)]*\))?\s*\{/g)) {
        let i = m.index + m[0].length;
        let depth = 1;
        while (depth && i < text.length) {
            if (text[i] === '{') depth++;
            else if (text[i] === '}') depth--;
            i++;
        }
        const body = text.slice(m.index + m[0].length, i - 1);
        const code = body.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
        if (code === '') out.push({ line: lineOf(m.index), reason: /\/\/|\/\*/.test(body) });
    }
    const PROMISE =
        /(\.catch\(\s*|,(?:\s|\/\/[^\n]*\n)*)\(\s*(?:_\w*(?:\s*:\s*unknown)?)?\s*\)\s*=>\s*(undefined|null|void 0|false|\[\]|\{(?:\s|\/\/[^\n]*\n|\/\*[\s\S]*?\*\/)*\})\s*,?\s*\)/g;
    for (const m of text.matchAll(PROMISE)) {
        if (m[1]!.startsWith(',') && !/\.then\(/.test(text.slice(Math.max(0, m.index - 400), m.index))) continue;
        // The arrow itself starts after the `.catch(` / `, ` prefix.
        const at = lineOf(m.index + m[1]!.length);
        const own = lines[at - 1] ?? '';
        const above = lines[at - 2] ?? '';
        const reason = COMMENT.test(own) || /^\s*(\/\/|\/\*|\*)/.test(above) || /\/\/|\/\*/.test(m[2]!);
        out.push({ line: at, reason });
    }
    return out;
}

/** Catches that swallow a failure, each with its reason written beside it
 *  (slice 3, decision 9). The first scanner counted 81 on 2026-11-27; slice 3
 *  moved 35 teacher-side reads onto lib/loadFailure.ts's leaveOut, and the
 *  corrected scanner (multi-line `.then`, `() => []`) counts 61 left, all
 *  student, shell, dev or non-network ones. LOWER it when one goes; a new one
 *  needs a reason AND a slot here. */
const SILENT_CEILING = 61;

describe('the loading ratchet', () => {
    it('hand-written cancelled/live/alive flags do not go up', () => {
        const count = files.reduce((n, f) => n + (f.text.match(/\blet (cancelled|live|alive)\b/g) ?? []).length, 0);
        expect(count, `${count} flags; the ceiling is ${FLAG_CEILING}`).toBeLessThanOrEqual(FLAG_CEILING);
        // A ceiling far above the count is a claim nobody checks (P11).
        expect(FLAG_CEILING - count, 'lower FLAG_CEILING to the new count').toBeLessThanOrEqual(2);
    });

    it('every catch that swallows a failure says why, beside it', () => {
        const bare = files.flatMap((f) => silentCatches(f.text).filter((c) => !c.reason).map((c) => `${f.path}:${c.line}`));
        expect(bare, 'add a one-line reason, or report it with leaveOut (teacher screens), or show it').toEqual([]);
    });

    it('silent catches do not go up', () => {
        const n = files.reduce((k, f) => k + silentCatches(f.text).length, 0);
        expect(n, `${n} silent catches; the ceiling is ${SILENT_CEILING}`).toBeLessThanOrEqual(SILENT_CEILING);
        expect(n, `below the ceiling: lower SILENT_CEILING to ${n}`).toBe(SILENT_CEILING);
    });

    it('the scanner sees what it claims to (not vacuous)', () => {
        const sample = [
            'try { a(); } catch {}', // 1: bare block
            'try { a(); } catch { /* why */ }', // 2: block with its reason
            'p.catch(() => undefined);', // 3: bare promise catch
            'p.catch(() => []); // why', // 4: reason on its own line
            'p.then(', // 5
            '    (x) => use(x),', // 6
            '    // why', // 7: comment-only line directly above
            '    () => undefined,', // 8: Prettier's multi-line form
            ');', // 9
            'p.then(f, (_e) => false);', // 10: bare, with a parameter
            'p.catch(() => setX(null));', // 11: does something: not silent
        ].join('\n');
        expect(silentCatches(sample).map((c) => [c.line, c.reason])).toEqual([
            [1, false],
            [2, true],
            [3, false],
            [4, true],
            [8, true],
            [10, false],
        ]);
    });

    it('student screens never report (the telemetry gate): no leaveOut or useLoad in them', () => {
        const STUDENT = ['routes/StudentViewer.tsx', 'routes/Home.tsx', 'routes/JoinClass.tsx', 'routes/FactsEntry.tsx', 'routes/DolPractice.tsx', 'routes/PhotoHandoff.tsx', 'practice/MixedRunner.tsx', 'practice/FactRunner.tsx', 'practice/saveQueue.ts'];
        for (const path of STUDENT) {
            expect(readFileSync(join(SRC, path), 'utf8'), path).not.toMatch(/from '\.\.?\/(lib\/)?(loadFailure|useLoad)'/);
        }
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

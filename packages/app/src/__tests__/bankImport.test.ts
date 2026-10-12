// Practice-bank import (D43, docs/design/practice-banks.md PB-1…PB-12, eng
// review BE-1…BE-12). The first describe is the CROSS-CHECK against the
// curriculum side's check_bank fixtures (BE-12, copied by commit — see
// fixtures/banks/README.md); the rest pin this side's rules.
import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { getMarkdownImporter, type MarkdownImporter } from '../lib/markdownToTiptap';
import { parseBankFile, type BankFileResult } from '../lib/bankImport';
import { enumerateTemplate, parseBankSeedFence } from '../lib/bankSeed';
import { bankRowValues, BankValueTable } from '@activity/schema/bank-seed';

let importer: MarkdownImporter;
beforeAll(async () => {
    importer = await getMarkdownImporter();
});

const fixture = (name: string): string =>
    readFileSync(new URL(`./fixtures/banks/${name}`, import.meta.url), 'utf8');

function parse(md: string, stem = 'rate.unit-rate'): BankFileResult {
    return parseBankFile(md, { stem, importer });
}

function bank(seed: string, body: string, meta = 'kind: bank\nstatus: draft\nskill: rate.unit-rate'): string {
    return '```meta\n' + meta + '\n```\n\n```seed\n' + seed + '\n```\n\n' + body;
}

describe('cross-check with check_bank (BE-12, their 85ca61a fixtures)', () => {
    it('rate.unit-rate passes with their counts: t2 20/24, t3 11/12', () => {
        const r = parse(fixture('rate.unit-rate.md'));
        expect(r.problems).toEqual([]);
        const byHeading = Object.fromEntries(r.items.map((i) => [i.heading, i.table]));
        expect([byHeading.t2!.rows.length, byHeading.t2!.total]).toEqual([20, 24]);
        expect([byHeading.t3!.rows.length, byHeading.t3!.total]).toEqual([11, 12]);
        expect(r.items.map((i) => i.itemId)).toEqual(['rate.unit-rate#t2', 'rate.unit-rate#t3']);
    });

    it.each([
        ['bad-bank-derived-forward', /not declared ABOVE it/],
        ['bad-bank-where-empty', /no combination passes its where \(0 of 2\)/],
        ['bad-bank-where-scope', /uses b, which t1 does not use/],
        ['bad-bank-where-unscoped', /unscoped `where:` is refused/],
    ])('%s fails for the shared reason', (name, reason) => {
        const r = parse(fixture(`${name}.md`), name);
        expect(r.problems.some((p) => reason.test(p))).toBe(true);
        expect(r.items).toEqual([]);
    });

    it('bad-bank-retired parses here — the retired id is refused by the STORE (verify-0058)', () => {
        const r = parse(fixture('bad-bank-retired.md').replace('kind: bank', 'kind: bank\nstatus: draft'), 'bad-bank-retired');
        expect(r.problems).toEqual([]);
        expect(r.items[0]!.itemId).toBe('bad-bank-retired#t1');
    });
});

describe('the value table (BE-3)', () => {
    it('canonical order: drawn columns sorted, first name slowest, derived after', () => {
        const seed = parseBankSeedFence('zb: list 1, 2\naa: list 10, 20, 30\nk: = aa * zb');
        const e = enumerateTemplate(seed, 't1', new Set(['aa', 'zb', 'k']));
        expect(e.ok && e.table).toEqual({
            columns: ['aa', 'zb', 'k'],
            rows: [[10, 1, 10], [10, 2, 20], [20, 1, 20], [20, 2, 40], [30, 1, 30], [30, 2, 60]],
            total: 6,
        });
    });

    it('a template with no variables stores one empty row', () => {
        const r = parse(bank('a: list 1', '## t1\n\nTwo plus two is {{=4}}.\n\n## t2\n\nUse {a}: {{=a}}.'));
        const t1 = r.items.find((i) => i.heading === 't1')!;
        expect(t1.table).toEqual({ columns: [], rows: [[]], total: 1 });
    });

    it('derived values are stored at 12 significant figures (no float noise)', () => {
        const seed = parseBankSeedFence('a: list 0.1\nk: = a * 3');
        const e = enumerateTemplate(seed, 't1', new Set(['a', 'k']));
        expect(e.ok && e.table.rows).toEqual([[0.1, 0.3]]);
    });

    it('authored duplicates are separate rows; values keep authored order', () => {
        const seed = parseBankSeedFence('a: list 5, 2, 5');
        const e = enumerateTemplate(seed, 't1', new Set(['a']));
        expect(e.ok && e.table.rows).toEqual([[5], [2], [5]]);
    });

    it('the stored table round-trips the schema and reads back by row', () => {
        const r = parse(fixture('rate.unit-rate.md'));
        const t3 = r.items.find((i) => i.heading === 't3')!.table;
        expect(BankValueTable.safeParse(t3).success).toBe(true);
        const v = bankRowValues(t3, 0);
        expect(Object.keys(v).sort()).toEqual(['vd', 'vh']);
        expect(v.vd! % v.vh!).toBe(0);
    });
});

describe('variable sets and the cap (BE-5)', () => {
    it('a variable used ONLY in a mistake matcher joins the template', () => {
        const r = parse(bank('a: list 2, 3\nb: list 5, 7', '## t1\n\n{a} doubled: {{=2*a | !a+b :: Added b.}}'));
        expect(r.problems).toEqual([]);
        expect(r.items[0]!.table.columns).toEqual(['a', 'b']);
    });

    it('a derived variable carries its sources, transitively', () => {
        const r = parse(bank('a: list 2\nb: list 3\nc: = a * b\nd: = c + 1', '## t1\n\nIt is {d}: {{=d}}.'));
        expect(r.items[0]!.table.columns).toEqual(['a', 'b', 'c', 'd']);
        expect(r.items[0]!.table.rows).toEqual([[2, 3, 6, 7]]);
    });

    it('the cap counts BEFORE filtering', () => {
        const r = parse(bank('a: int 1..101\nb: int 1..100\nwhere t1: a == b', '## t1\n\n{a} and {b}: {{=a+b}}'));
        expect(r.problems.some((p) => /10100 combinations, over the cap of 10000/.test(p))).toBe(true);
    });

    it('sample is refused in banks', () => {
        const r = parse(bank('s: sample 3 of 1..9', '## t1\n\n{{=1}}'));
        expect(r.problems.some((p) => /`sample` variables are refused/.test(p))).toBe(true);
    });

    it('a zero divisor at any combination fails the template, naming the row', () => {
        const r = parse(bank('a: list 4, 6\nb: list 2, 0\nk: = a / b', '## t1\n\n{a} over {b} is {{=k}}.'));
        expect(r.problems.some((p) => /at a=4, b=0: division by zero/.test(p))).toBe(true);
    });

    it('a shared variable warns (PB-5); an unused one warns', () => {
        const r = parse(bank('a: list 2\nz: list 1', '## t1\n\n{{=a}} {a}\n\n## t2\n\n{{=a+1}} {a}'));
        expect(r.warnings.some((w) => /a is used by both t1 and t2/.test(w))).toBe(true);
        expect(r.warnings.some((w) => /“z” is declared but no template uses it/.test(w))).toBe(true);
    });
});

describe('PB-8 at every stored row', () => {
    it('a mistake that equals its answer at some row is refused, naming the row', () => {
        // a*a == a+a at a = 2.
        const r = parse(bank('a: list 3, 2', '## t1\n\n{a}: {{=a*a | !a+a :: Added.}}'));
        expect(r.problems.some((p) => /at a=2: mistake !a\+a = 4 equals the answer/.test(p))).toBe(true);
    });

    it('a mistake within the blank tolerance can never fire either', () => {
        const r = parse(bank('a: list 10', '## t1\n\n{a}: {{=a/3 +- 0.5 | !a/3+0.1 :: Close.}}'));
        expect(r.problems.some((p) => /can never fire/.test(p))).toBe(true);
    });

    it('a tolerance answer never warns about decimals (C-125)', () => {
        const r = parse(bank('ct: list 7\ncn: list 3', '## t1\n\n{ct} for {cn}: {{=ct/cn +- 0.005}}'));
        expect(r.problems).toEqual([]);
        expect(r.warnings).toEqual([]);
    });
});

describe('PB-1/2/3/7/9/10 and BE-6/BE-7', () => {
    it('status is required and closed (PB-10)', () => {
        expect(parse(bank('a: list 1', '## t1\n\n{{=a}} {a}', 'kind: bank\nskill: rate.unit-rate')).problems.join())
            .toMatch(/`status:` is `draft` or `ratified`.*missing/);
        expect(parse(bank('a: list 1', '## t1\n\n{{=a}} {a}', 'kind: bank\nstatus: final\nskill: rate.unit-rate')).problems.join())
            .toMatch(/not “final”/);
    });

    it('kind: bank is required under banks/ (PB-2)', () => {
        expect(parse(bank('a: list 1', '## t1\n\n{{=a}} {a}', 'status: draft\nskill: rate.unit-rate')).problems.join())
            .toMatch(/declares `kind: bank`/);
    });

    it('the file is named for its skill (amendment a)', () => {
        expect(parse(bank('a: list 1', '## t1\n\n{{=a}} {a}'), 'rate.wrong').problems.join())
            .toMatch(/this bank is named rate\.unit-rate\.md/);
    });

    it('a discrimination bank: chain + ≥2 discriminates, no skill, named <chain>.discrimination', () => {
        const meta = 'kind: bank\nstatus: draft\nrole: discrimination\nchain: chain.rate.proportional\ndiscriminates: rate.unit-rate, rate.proportional-graph';
        const ok = parse(bank('a: list 1', '## d1\n\n{{=a}} {a}', meta), 'chain.rate.proportional.discrimination');
        expect(ok.problems).toEqual([]);
        expect(ok.items[0]!.itemId).toBe('chain.rate.proportional.discrimination#d1');
        expect(ok.meta).toMatchObject({ role: 'discrimination', chain: 'chain.rate.proportional', skill: null });
        const bad = parse(bank('a: list 1', '## d1\n\n{{=a}} {a}', meta.replace(', rate.proportional-graph', '') + '\nskill: rate.unit-rate'), 'chain.rate.proportional.discrimination');
        expect(bad.problems.join()).toMatch(/NO `skill:`/);
        expect(bad.problems.join()).toMatch(/at least two skills/);
        expect(parse(bank('a: list 1', '## d1\n\n{{=a}} {a}', meta), 'chain.rate.proportional').problems.join())
            .toMatch(/named chain\.rate\.proportional\.discrimination\.md/);
    });

    it('headings are item ids: shape and uniqueness (PB-3)', () => {
        const r = parse(bank('a: list 1', '## T1\n\n{{=a}} {a}\n\n## t2\n\n{{=1}}\n\n## t2\n\n{{=2}}'));
        expect(r.problems.join()).toMatch(/heading “T1” is an item id/);
        expect(r.problems.join()).toMatch(/heading t2 is used twice/);
    });

    it('a where naming no template is refused', () => {
        expect(parse(bank('a: list 1\nwhere t9: a > 0', '## t1\n\n{{=a}} {a}')).problems.join())
            .toMatch(/no template has the heading t9/);
    });

    it('auto-scorable only: an essay is refused, and a template must grade something (PB-9)', () => {
        const r = parse(bank('a: list 1', '## t1\n\n{a} is a number.\n\n## t2\n\n{{=1}}'));
        expect(r.problems.join()).toMatch(/t1: no graded response/);
    });

    it('a {name} inside maths is refused (R2), an undeclared {name} is refused', () => {
        const r = parse(bank('a: list 2', '## t1\n\nSolve $x = {a}$ for {a}: {{=a}}\n\n## t2\n\n{ghost} {{=1}}'));
        expect(r.problems.join()).toMatch(/\{a\} is inside maths/);
        expect(r.problems.join()).toMatch(/\{ghost\} isn’t declared/);
    });

    it('malformed and reserved seed lines are PROBLEMS, not skips (BE-7)', () => {
        const r = parse(bank('ln: list 2\nwhere: list 3\nbad line\nx1: banana', '## t1\n\n{{=1}}'));
        const all = r.problems.join('\n');
        expect(all).toMatch(/“ln” is a reserved name/);
        expect(all).toMatch(/unscoped `where:` is refused/);
        expect(all).toMatch(/“bad line” isn’t a `name: spec`/);
        expect(all).toMatch(/specs are/);
    });

    it('a derived value that renders as float noise warns (BE-6)', () => {
        const r = parse(bank('a: list 1, 2\nk: = a / 3', '## t1\n\nIt is {k}: {{=k +- 0.01}}'));
        expect(r.warnings.some((w) => /\{k\} reaches \d+ decimal places in prose/.test(w))).toBe(true);
    });

    it('text before the first template, and a second seed fence, are refused', () => {
        const md = '```meta\nkind: bank\nstatus: draft\nskill: rate.unit-rate\n```\n\nIntro prose.\n\n```seed\na: list 1\n```\n\n```seed\nb: list 2\n```\n\n## t1\n\n{{=a}} {a}';
        const all = parse(md).problems.join('\n');
        expect(all).toMatch(/text before the first template/);
        expect(all).toMatch(/a second ```seed fence/);
    });

    it('a ## inside a fenced block is not a heading', () => {
        const r = parse(bank('a: list 1', '## t1\n\n```mc\nprompt: Pick {a}.\n(x) one\n( ) two\n```\n\n{{=a}}'));
        expect(r.problems).toEqual([]);
        expect(r.items).toHaveLength(1);
    });
});

describe('a blank that never formed', () => {
    it('two * in one blank (markdown emphasis) is a problem, not a silent text blank', () => {
        const r = parse(bank('a: list 2\nb: list 3', '## t1\n\n{a}, {b}: {{=a}} and {{=2*a | !2*a+b :: Added.}}'));
        expect(r.problems.join()).toMatch(/stayed as text, so that blank never formed/);
    });
});

describe('review fixes (Fable review of 0a5dc56c)', () => {
    it('#1 derived chains compute at FULL precision; only the stored value rounds', () => {
        const r = parse(bank('a: list 1, 2\nb: list 3\nk: = a / b\nm: = k * b\nwhere t1: k * b - a == 0', '## t1\n\nIt is {m}: {{=m}}'));
        expect(r.problems).toEqual([]);
        const t = r.items[0]!.table;
        expect(t.columns).toEqual(['a', 'b', 'k', 'm']);
        expect(t.rows).toEqual([[1, 3, 0.333333333333, 1], [2, 3, 0.666666666667, 2]]);
    });

    it('#2 a LITERAL mistake equal to a seeded answer at some row is refused', () => {
        const r = parse(bank('a: list 2, 3', '## t1\n\n{a}: {{=a*2 | !4 :: Added.}}'));
        expect(r.problems.join()).toMatch(/at a=2: mistake !4 = 4 equals the answer/);
    });

    it('#6 list values are decimal literals only (no 0x10 / 0b101 / 0o7)', () => {
        const r = parse(bank('a: list 0x10, 2', '## t1\n\n{a}: {{=a}}'));
        expect(r.problems.join()).toMatch(/list values must all be decimal numbers/);
        expect(parse(bank('a: list -1.5, +2, .5, 1e2', '## t1\n\n{a}: {{=a}}')).problems).toEqual([]);
    });

    it('#11 an explicit `role: skill` is accepted', () => {
        const r = parse(bank('a: list 1', '## t1\n\n{a}: {{=a}}', 'kind: bank\nstatus: draft\nrole: skill\nskill: rate.unit-rate'));
        expect(r.problems).toEqual([]);
        expect(r.meta?.role).toBe('skill');
    });
});

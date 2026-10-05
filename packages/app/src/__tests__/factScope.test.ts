// The fact-scope expander (D43, ER-13; decisions 3–9 of the mirror pass).
//
// The fixture is the curriculum side's GENERATED registry, copied byte for
// byte from ZanReed/curriculum `main` at aeeab52 (graph v0.17.7), revision
// ac8f9fd2…, file sha256 2a0cef2d…. It is the artifact the mirror reads, so the
// counts asserted below are THEIR fact_count values, reproduced by our
// expansion — not numbers this test chose.
import { describe, expect, it } from 'vitest';
import registry from './fixtures/fact-scope-registry.ac8f9fd2.json';
import twoPartRegistry from './fixtures/fact-scope-registry.d0144e8d.json';
import {
    expandFactScope,
    numberWords,
    probeLengthFor,
    probePartsFor,
    rationalAnswer,
    FACT_ANSWER_RE,
    type FactScopeMirror,
} from '../lib/factScope';

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

// The refusal rows poke arbitrary fields into a copy of the registry — fields
// the fixture's inferred type rightly does not have. One alias, one disable.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Loose = any;

function mirrorOf(input: unknown = registry): FactScopeMirror {
    const result = expandFactScope(input);
    if (!result.ok) throw new Error(result.errors.join('\n'));
    return result.mirror;
}

function errorsOf(mutate: (r: Loose) => void): string[] {
    const r = clone(registry) as Loose;
    mutate(r);
    const result = expandFactScope(r);
    if (result.ok) throw new Error('expected the expander to refuse');
    return result.errors;
}

const fact = (m: FactScopeMirror, id: string) => {
    const f = m.facts.find((x) => x.fact_id === id);
    if (!f) throw new Error(`no fact ${id}`);
    return f;
};

describe('expandFactScope — the registry at ac8f9fd2', () => {
    const m = mirrorOf();

    it('carries the revision, the grammar rev and the graph version', () => {
        expect(m.registry_rev).toBe(registry.header.revision);
        expect(m.fact_grammar_rev).toBe(1);
        expect(m.graph_version).toBe('0.17.7');
    });

    it('reproduces every family fact_count (CR-23) and the 1124 total', () => {
        for (const fam of registry.body.families) {
            const mirrored = m.families.find((f) => f.family_id === fam.id)!;
            expect(mirrored.fact_count, fam.id).toBe(fam.fact_count);
            expect(m.facts.filter((f) => f.family_id === fam.id)).toHaveLength(fam.fact_count);
        }
        expect(m.facts).toHaveLength(1124);
    });

    it('gives probes of 40, 55, 65 and 65 items (their items 20, 30, 32)', () => {
        expect(['7', '8', '9', '10'].map((y) => probeLengthFor(m, y))).toEqual([40, 55, 65, 65]);
    });

    it('stores the six single values as written', () => {
        expect(m.fact_probe).toEqual(registry.body.fact_probe);
    });

    it('stores a turnaround pair ONCE, smaller operand first, with both orders filled (decision 4)', () => {
        const f = fact(m, 'fact.mult.to-12:7,8');
        expect(f.operands).toEqual([7, 8]);
        expect(f.answer).toBe('56');
        expect(f.display).toBe('7 × 8 = __');
        expect(f.display_swapped).toBe('8 × 7 = __');
        expect(f.spoken).toBe('seven times eight');
        expect(f.spoken_swapped).toBe('eight times seven');
        expect(m.facts.some((x) => x.fact_id === 'fact.mult.to-12:8,7')).toBe(false);
        // a square pair has one order only
        expect(fact(m, 'fact.mult.to-12:7,7').display_swapped).toBeNull();
    });

    it('applies the display rules: true minus, brackets round a negative second operand', () => {
        const f = fact(m, 'fact.int.subtract:-3,-5');
        expect(f.display).toBe('−3 − (−5) = __');
        expect(f.spoken).toBe('negative three minus negative five');
        expect(f.answer).toBe('2');
        const add = fact(m, 'fact.int.add:-3,5');
        expect(add.display).toBe('−3 + 5 = __');
        expect(add.display_swapped).toBe('5 + (−3) = __');
        expect(add.spoken_swapped).toBe('five plus negative three');
    });

    it('says numbers in New Zealand English (decision 6)', () => {
        const f = fact(m, 'fact.div.to-12:144,12');
        expect(f.display).toBe('144 ÷ 12 = __');
        expect(f.spoken).toBe('one hundred and forty-four divided by twelve');
        expect(f.answer).toBe('12');
        expect(fact(m, 'fact.root.square:144').spoken).toBe('the square root of one hundred and forty-four');
    });

    it('names the denominator in the spoken fraction, singular for 1 (CR-22)', () => {
        const half = fact(m, 'fact.fdp.to-decimal:1,2');
        expect(half.spoken).toBe('one half as a decimal');
        expect(half.answer).toBe('0.5');
        const quarters = fact(m, 'fact.fdp.to-percent:3,4');
        expect(quarters.display).toBe('3/4 = __ %');
        expect(quarters.spoken).toBe('three quarters as a percentage');
        expect(quarters.answer).toBe('75');
        expect(fact(m, 'fact.fdp.to-decimal:3,4').answer).toBe('0.75');
    });

    it('applies the two flags to the SHOWN operands', () => {
        // exclude_plain_whole: 8 − 3 is a plain whole fact, 3 − 8 is not
        expect(m.facts.some((f) => f.fact_id === 'fact.int.subtract:8,3')).toBe(false);
        expect(fact(m, 'fact.int.subtract:3,8').answer).toBe('-5');
        // at_least_one_negative on divide reads the dividend and divisor
        expect(m.facts.some((f) => f.fact_id === 'fact.int.divide:6,2')).toBe(false);
        expect(fact(m, 'fact.int.divide:-6,2').answer).toBe('-3');
        // multiply excludes ±1 and 0 from the range
        const multiply = m.facts.filter((f) => f.family_id === 'fact.int.multiply');
        expect(multiply.length).toBeGreaterThan(0);
        expect(multiply.some((f) => f.operands!.some((n) => Math.abs(n) <= 1))).toBe(false);
    });

    it('stores listed facts as written, under their authored ids (CR-24)', () => {
        const f = fact(m, 'fact.units.mm-m');
        expect(f.operands).toBeNull();
        expect(f.display).toBe('1 mm = __ m');
        expect(f.answer).toBe('0.001');
        expect(f.display_swapped).toBeNull();
    });

    it('produces only typeable answers (CR-17) and unique ids', () => {
        for (const f of m.facts) {
            expect(FACT_ANSWER_RE.test(f.answer) && f.answer.length <= 8, f.fact_id).toBe(true);
        }
        expect(new Set(m.facts.map((f) => f.fact_id)).size).toBe(m.facts.length);
    });

    it('is deterministic', () => {
        expect(mirrorOf()).toEqual(m);
    });
});

describe('expandFactScope — refuses what was never agreed (decision 8)', () => {
    const fam = (r: Loose, id: string) => r.body.families.find((f: Loose) => f.id === id);

    it('an unknown operation', () => {
        expect(errorsOf((r) => { fam(r, 'fact.square.to-144').operation = 'power'; }).join()).toMatch(/unknown operation/);
    });
    it('an unknown flag', () => {
        expect(errorsOf((r) => { fam(r, 'fact.int.add').flags = ['at_most_one_positive']; }).join()).toMatch(/unknown flag/);
    });
    it('an unknown generate shape', () => {
        expect(errorsOf((r) => { fam(r, 'fact.square.to-144').generate = { pairs: [[2, 2]] }; }).join()).toMatch(/generate shape/);
    });
    it('an unknown placeholder', () => {
        expect(errorsOf((r) => { fam(r, 'fact.mult.to-12').spoken = '{a} lots of {c}'; }).join()).toMatch(/unknown placeholder/);
    });
    it('an unknown key on a family, the probe values or a strategy', () => {
        expect(errorsOf((r) => { fam(r, 'fact.mult.to-12').colour = 'red'; }).join()).toMatch(/unknown key/);
        expect(errorsOf((r) => { r.body.fact_probe.sprint_minutes = 5; }).join()).toMatch(/unknown key/);
        expect(errorsOf((r) => { fam(r, 'fact.mult.to-12').strategy.video = 'x'; }).join()).toMatch(/unknown strategy key/);
    });
    it('a family with both generate and facts', () => {
        expect(errorsOf((r) => { fam(r, 'fact.mult.to-12').facts = []; }).join()).toMatch(/exactly generate/);
    });
    it('a count that does not reproduce (CR-23)', () => {
        expect(errorsOf((r) => { fam(r, 'fact.cube.to-125').fact_count = 6; }).join()).toMatch(/expands to 5 facts, the registry says 6/);
    });
    it('a denominator with no fraction name (CR-22)', () => {
        expect(errorsOf((r) => { delete r.body.fraction_names['4']; }).join()).toMatch(/no fraction name for denominator 4/);
    });
    it('shown/answer strings that disagree with the operation', () => {
        expect(errorsOf((r) => { fam(r, 'fact.div.to-12').answer = 'x'; }).join()).toMatch(/do not match operation divide/);
    });
    it('a turnaround on a non-commutative operation', () => {
        expect(errorsOf((r) => { fam(r, 'fact.int.subtract').turnaround = true; }).join()).toMatch(/non-commutative/);
    });
    it('an answer a student cannot type', () => {
        expect(errorsOf((r) => { fam(r, 'fact.units').facts[0].answer = '1/10'; }).join()).toMatch(/not typeable/);
    });
    it('a cumulative list that is not the running total', () => {
        expect(errorsOf((r) => { r.body.year_scope['9'].cumulative.pop(); }).join()).toMatch(/running total/);
    });
});

describe('numbers', () => {
    it('numberWords', () => {
        expect([0, 13, 40, 99, 100, 105, 144, 1000, 1005, 1200, -7].map(numberWords)).toEqual([
            'zero', 'thirteen', 'forty', 'ninety-nine', 'one hundred', 'one hundred and five',
            'one hundred and forty-four', 'one thousand', 'one thousand and five',
            'one thousand two hundred', 'negative seven',
        ]);
    });
    it('rationalAnswer is exact and refuses a non-terminating answer', () => {
        expect(rationalAnswer({ num: 7, den: 10 })).toBe('0.7');
        expect(rationalAnswer({ num: -12, den: 4 })).toBe('-3');
        expect(rationalAnswer({ num: 1, den: 3 })).toBeNull();
    });
});

// The two-part fixture is their generated registry at revision d0144e8d (their
// PR #37, graph v0.17.9, file sha256 c904779f…): the same 1124 facts plus the
// two-part settings. The part sizes asserted are THEIR generator's report.
describe('expandFactScope — two-part checks (revision d0144e8d)', () => {
    const m = mirrorOf(twoPartRegistry);
    const broken = (mutate: (r: Loose) => void): string => {
        const r = clone(twoPartRegistry) as Loose;
        mutate(r);
        const result = expandFactScope(r);
        if (result.ok) throw new Error('expected the expander to refuse');
        return result.errors.join(' | ');
    };

    it('mirrors the settings, the four groups and the two parts', () => {
        expect(m.registry_rev).toBe(twoPartRegistry.header.revision);
        expect(m.fact_probe.two_part_above).toBe(40);
        expect(m.fact_probe.two_part_items_per_family).toBe(8);
        expect(m.family_groups!.map((g) => g.id)).toEqual([
            'group.times-tables', 'group.squares-roots', 'group.fdp-units', 'group.integers',
        ]);
        expect(m.probe_parts).toEqual([
            ['group.times-tables', 'group.squares-roots'],
            ['group.fdp-units', 'group.integers'],
        ]);
        expect(m.facts).toHaveLength(1124);
    });

    it('gives Year 7 one part of 40 and splits the long years: 42 + 40, 42 + 56, 42 + 56', () => {
        expect(['7', '8', '9', '10'].map((y) => probePartsFor(m, y))).toEqual([[40], [42, 40], [42, 56], [42, 56]]);
        expect(['7', '8', '9', '10'].map((y) => probeLengthFor(m, y))).toEqual([40, 82, 98, 98]);
    });

    it('a registry without the settings is single-part, as before', () => {
        const old = mirrorOf();
        expect(old.family_groups).toBeNull();
        expect(old.probe_parts).toBeNull();
        expect(['7', '8', '9', '10'].map((y) => probePartsFor(old, y))).toEqual([[40], [55], [65], [65]]);
    });

    it('refuses settings that are only partly there', () => {
        expect(broken((r) => { delete r.body.probe_parts; })).toMatch(/must all be present, or none/);
        expect(broken((r) => { delete r.body.fact_probe.two_part_above; })).toMatch(/must all be present, or none/);
    });
    it('refuses a family in two groups, in no group, or unknown', () => {
        expect(broken((r) => { r.body.family_groups[1].families.push('fact.mult.to-12'); })).toMatch(/is in both/);
        expect(broken((r) => { r.body.family_groups[3].families.pop(); })).toMatch(/fact\.int\.divide is in no group/);
        expect(broken((r) => { r.body.family_groups[0].families.push('fact.made.up'); })).toMatch(/unknown family/);
    });
    it('refuses a group in no part, in two parts, or a third part', () => {
        expect(broken((r) => { r.body.probe_parts[1].pop(); })).toMatch(/group\.integers is in no part/);
        expect(broken((r) => { r.body.probe_parts[0].push('group.integers'); })).toMatch(/is in two parts/);
        expect(broken((r) => { r.body.probe_parts.push(['group.integers']); })).toMatch(/exactly two/);
    });
    it('refuses a group with an extra key or a malformed id', () => {
        expect(broken((r) => { r.body.family_groups[0].colour = 'red'; })).toMatch(/must be exactly/);
        expect(broken((r) => { r.body.family_groups[0].id = 'Times Tables'; })).toMatch(/must be exactly/);
    });
    it('refuses a two-part setting that is not a positive whole number', () => {
        expect(broken((r) => { r.body.fact_probe.two_part_items_per_family = 7.5; })).toMatch(/not a positive whole number/);
    });
});

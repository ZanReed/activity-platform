// =============================================================================
// bankImport.ts — one practice-bank FILE → its items (D43, PB-1…PB-12)
// -----------------------------------------------------------------------------
// docs/design/practice-banks.md (PB-1…PB-12 ruled; C-123 amendments (a)(b);
// eng review BE-1…BE-12). A bank file is:
//
//   ```meta     kind: bank · status: draft|ratified · skill: <id>
//               (or role: discrimination · chain: <id> · discriminates: a, b)
//   ```seed     ONE fence for the whole file (bankSeed.ts has the grammar)
//   ## t1       one TEMPLATE per `## <heading>` — the item id is
//   …           `<file stem>#<heading>` (PB-3, amendment b)
//
// Each template is converted by the SHARED importer (bankSection mode), built
// into an ActivityDocument with the editor's own converter, schema-validated,
// enumerated into its value table (BE-3), and then checked at EVERY stored
// row on the exact document a grader would see (PB-8):
//   - every seeded answer and mistake evaluates to a number,
//   - a mistake never lands within the blank's tolerance of its answer,
// plus PB-9 — auto-scorable only: at least one graded response, and none of
// the blocks a bank item may not contain.
//
// The decimal-place rules and the "is the context real" range report stay in
// the curriculum side's check_bank (PB-8). One platform-only check (BE-6): a
// DERIVED value shown in prose with more than 6 decimal places warns — this
// side renders, so float noise would be ours to catch.
//
// Problems fail the FILE (nothing from it is written); warnings are printed and
// fail only under --strict. Pure: no I/O, no database — the batch importer
// owns routing, registries, the mirror and the report.
// =============================================================================

import type { JSONContent } from '@tiptap/core';
import { ActivityDocument, createEmptyDocument } from '@activity/schema';
import type { BankSeedSpec, BankValueTable } from '@activity/schema/bank-seed';
import { bankRowValues } from '@activity/schema/bank-seed';
import { freeVariables } from '@activity/graph-kit/scorers';
import { substituteSeededAnswers } from '@activity/viewer/seeded-print';
import {
    parseNumericValue,
    coerceTolerance,
    numericallyClose,
} from '../../../viewer/src/server/grading/numeric';
import type { ImportGlossaryEntry, MarkdownImporter } from './markdownToTiptap';
import { wrapBlocksStrict } from '../editor/strictGrid';
import { tiptapToActivity } from './serialize';
import { enumerateTemplate, parseBankSeedFence, templateVariables } from './bankSeed';

const BANK_HEADING = /^[a-z][a-z0-9-]*$/;

export type BankRole = 'skill' | 'discrimination';
export type BankStatus = 'draft' | 'ratified';

export interface BankMeta {
    readonly status: BankStatus;
    readonly role: BankRole;
    /** The skill a skill bank practises (registry-checked by the caller). */
    readonly skill: string | null;
    /** A discrimination bank's chain; a skill bank's comes from its folder. */
    readonly chain: string | null;
    /** A discrimination bank's skills, ≥ 2, distinct (PB-7). */
    readonly discriminates: readonly string[];
    readonly title: string | null;
}

export interface BankItem {
    /** `<stem>#<heading>` — permanent, never reused (PB-3). */
    readonly itemId: string;
    readonly heading: string;
    /** The template as a validated ActivityDocument (title = item id). */
    readonly document: ActivityDocument;
    readonly seed: BankSeedSpec;
    readonly table: BankValueTable;
}

export interface BankFileResult {
    /** The file stem the item ids use. */
    readonly stem: string;
    readonly meta: BankMeta | null;
    readonly items: readonly BankItem[];
    /** Any problem fails the whole file. */
    readonly problems: readonly string[];
    readonly warnings: readonly string[];
    /** [[term]] references that resolved nowhere (the glossary report's input). */
    readonly unresolvedTerms: readonly string[];
}

const KNOWN_META = new Set(['kind', 'status', 'skill', 'role', 'chain', 'discriminates', 'title', 'course']);

/** Blocks a bank item may not contain (PB-9): ungradable responses and
 *  teaching blocks. Prose, maths, glossary marks and display stimuli are fine. */
const REFUSED_BLOCKS: Record<string, string> = {
    short_answer: 'a short-answer response (not auto-scorable)',
    essay: 'an essay response (not auto-scorable)',
    self_explanation: 'an explain/self-explanation response (not auto-scorable)',
    worked_example: 'a worked example (teaching, not practice)',
    faded_worked_example: 'a faded worked example (teaching, not practice)',
    learning_objectives: 'learning objectives (teaching, not practice)',
};

/** Response blocks the grader scores (plus inline blanks and math gaps). */
const GRADED_BLOCKS = new Set([
    'multiple_choice', 'matching', 'ordering', 'interactive_graph',
    'number_line', 'correspondence', 'data_plot',
]);

interface Split {
    readonly metaSrc: string | null;
    readonly seedSrc: string | null;
    readonly sections: ReadonlyArray<{ heading: string; body: string; line: number }>;
    readonly problems: string[];
}

/** Split the file into its two fences and its `## ` sections. Fences are
 *  tracked so a `## ` inside one is never a heading. */
function splitBankFile(markdown: string): Split {
    const problems: string[] = [];
    const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
    let metaSrc: string | null = null;
    let seedSrc: string | null = null;
    const sections: Array<{ heading: string; body: string[]; line: number }> = [];
    let fence: { info: string; marker: string; body: string[]; start: number } | null = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!;
        const current = sections[sections.length - 1];
        if (fence) {
            if (line.trim().startsWith(fence.marker) && line.trim().replace(/`+|~+/, '') === '') {
                if (!current && (fence.info === 'meta' || fence.info === 'seed')) {
                    const text = fence.body.join('\n');
                    if (fence.info === 'meta') {
                        if (metaSrc !== null) problems.push('a second ```meta fence — a bank has one.');
                        else metaSrc = text;
                    } else if (seedSrc !== null) {
                        problems.push('a second ```seed fence — a bank declares its variables once.');
                    } else {
                        seedSrc = text;
                    }
                } else if (current) {
                    current.body.push(line);
                }
                fence = null;
                continue;
            }
            if (current) current.body.push(line);
            else fence.body.push(line);
            continue;
        }
        const open = /^\s{0,3}(`{3,}|~{3,})\s*([^\s`]*)/.exec(line);
        if (open) {
            fence = { info: (open[2] ?? '').trim(), marker: open[1]!, body: [], start: i + 1 };
            if (current) current.body.push(line);
            else if (fence.info !== 'meta' && fence.info !== 'seed') {
                problems.push(`line ${i + 1}: a \`\`\`${fence.info || ''} fence before the first template — everything but the meta and seed fences belongs under a \`## <heading>\`.`);
            }
            continue;
        }
        const h = /^##\s+(.*?)\s*$/.exec(line);
        if (h) {
            sections.push({ heading: h[1]!, body: [], line: i + 1 });
            continue;
        }
        if (current) current.body.push(line);
        else if (line.trim() !== '') {
            problems.push(`line ${i + 1}: text before the first template (“${line.trim().slice(0, 40)}”) — a bank file holds only its two fences and \`## <heading>\` templates.`);
        }
    }
    if (fence) problems.push(`line ${fence.start}: a fence that never closes.`);
    return {
        metaSrc,
        seedSrc,
        sections: sections.map((s) => ({ heading: s.heading, body: s.body.join('\n').trim(), line: s.line })),
        problems,
    };
}

function parseBankMeta(src: string | null, problems: string[], warnings: string[]): BankMeta | null {
    if (src === null) {
        problems.push('no ```meta fence — a bank declares `kind: bank` and its `status:` (PB-2, PB-10).');
        return null;
    }
    const kv = new Map<string, string>();
    for (const raw of src.split('\n')) {
        const line = raw.trim();
        if (line === '') continue;
        const m = /^([A-Za-z_]+)\s*:\s*(.*)$/.exec(line);
        if (!m) {
            problems.push(`meta: “${line}” isn’t a \`key: value\` line.`);
            continue;
        }
        const key = m[1]!;
        if (key.startsWith('x_')) continue; // notes for humans (PB, "what changes")
        if (!KNOWN_META.has(key)) warnings.push(`meta: \`${key}:\` isn’t a bank key and is ignored.`);
        if (kv.has(key)) problems.push(`meta: \`${key}:\` appears twice.`);
        kv.set(key, (m[2] ?? '').trim());
    }
    if (kv.get('kind') !== 'bank') {
        problems.push('meta: a file under banks/ declares `kind: bank` (PB-2: the location and the key must agree).');
    }
    const status = kv.get('status');
    if (status !== 'draft' && status !== 'ratified') {
        problems.push(`meta: \`status:\` is \`draft\` or \`ratified\` (PB-10)${status ? `, not “${status}”` : ' — it is missing'}.`);
    }
    const roleRaw = kv.get('role');
    const role: BankRole | null =
        roleRaw === undefined || roleRaw === 'skill' ? 'skill' : roleRaw === 'discrimination' ? 'discrimination' : null;
    if (role === null) problems.push(`meta: \`role: ${roleRaw}\` — a bank's role is \`skill\` (the default) or \`discrimination\` (PB-7).`);

    const skill = kv.get('skill') || null;
    const chain = kv.get('chain') || null;
    const discriminates = (kv.get('discriminates') ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s !== '');
    if (role === 'skill') {
        if (!skill) problems.push('meta: a skill bank names its `skill:` (PB-1).');
        if (discriminates.length > 0) problems.push('meta: `discriminates:` belongs only on a `role: discrimination` bank.');
        if (chain) warnings.push('meta: `chain:` on a skill bank is ignored — its chain is its folder.');
    } else if (role === 'discrimination') {
        if (skill) problems.push('meta: a discrimination bank has NO `skill:` — it is about telling skills apart (PB-7).');
        if (!chain) problems.push('meta: a discrimination bank names its `chain:` (PB-7).');
        if (new Set(discriminates).size !== discriminates.length) problems.push('meta: `discriminates:` lists a skill twice.');
        if (discriminates.length < 2) problems.push('meta: `discriminates:` names at least two skills (PB-7).');
    }
    if (role === null || (status !== 'draft' && status !== 'ratified')) return null;
    return {
        status,
        role,
        skill,
        chain,
        discriminates,
        title: kv.get('title') || null,
    };
}

// ---- references (BE-5) -------------------------------------------------------

interface Refs {
    /** `{name}` in prose — must be declared (it would render literally). */
    readonly prose: Set<string>;
    /** `{name}` inside latex — refused (R2: seeded values don't reach maths). */
    readonly latex: Set<string>;
    /** Free names in answers, acceptable answers and mistake matchers. */
    readonly expr: Set<string>;
    /** data: {name} on a data plot (a `sample` — refused in banks). */
    readonly dataVar: Set<string>;
    /** A literal `{{` survived into prose: a blank that did not parse — most
     *  often two `*` in one blank, which markdown reads as emphasis. */
    unparsedBlank: boolean;
}

const BRACE = /\{([a-z][a-z0-9_]*)\}/g;

function collectRefs(doc: ActivityDocument): Refs {
    const refs: Refs = { prose: new Set(), latex: new Set(), expr: new Set(), dataVar: new Set(), unparsedBlank: false };
    const exprOf = (s: unknown): void => {
        if (typeof s === 'string') for (const v of freeVariables(s)) refs.expr.add(v);
    };
    const visit = (node: unknown): void => {
        if (Array.isArray(node)) {
            node.forEach(visit);
            return;
        }
        if (node === null || typeof node !== 'object') return;
        const o = node as Record<string, unknown>;
        if (o.type === 'text' && typeof o.text === 'string') {
            for (const m of o.text.matchAll(BRACE)) refs.prose.add(m[1]!);
            if (o.text.includes('{{')) refs.unparsedBlank = true;
        }
        if (typeof o.latex === 'string') {
            for (const m of o.latex.matchAll(BRACE)) refs.latex.add(m[1]!);
        }
        if (typeof o.dataVar === 'string') refs.dataVar.add(o.dataVar);
        if (o.type === 'blank') {
            exprOf(o.answer);
            if (Array.isArray(o.acceptableAnswers)) o.acceptableAnswers.forEach(exprOf);
            if (Array.isArray(o.mistakeFeedback)) {
                for (const m of o.mistakeFeedback as Array<{ match?: unknown }>) {
                    // `!unit-missing` / `!unit-wrong` are reserved outcomes, not expressions.
                    if (typeof m.match === 'string' && !/^unit-(missing|wrong)$/.test(m.match.trim())) {
                        exprOf(m.match);
                    }
                }
            }
        }
        for (const v of Object.values(o)) if (v !== null && typeof v === 'object') visit(v);
    };
    visit(doc.sections);
    return refs;
}

// ---- PB-9 / PB-8 -------------------------------------------------------------

function blockCensus(doc: ActivityDocument): { refused: string[]; graded: number } {
    const refused = new Set<string>();
    let graded = 0;
    const visit = (node: unknown): void => {
        if (Array.isArray(node)) {
            node.forEach(visit);
            return;
        }
        if (node === null || typeof node !== 'object') return;
        const o = node as Record<string, unknown>;
        const t = typeof o.type === 'string' ? o.type : '';
        if (t in REFUSED_BLOCKS) refused.add(REFUSED_BLOCKS[t]!);
        if (GRADED_BLOCKS.has(t) || t === 'blank') graded++;
        if (Array.isArray(o.prompts) && typeof o.latex === 'string') graded += o.prompts.length;
        for (const v of Object.values(o)) if (v !== null && typeof v === 'object') visit(v);
    };
    visit(doc.sections);
    return { refused: [...refused], graded };
}

interface BlankLike {
    answer: string;
    answerType?: string;
    tolerance?: unknown;
    mistakeFeedback?: Array<{ match?: unknown }>;
}

function blanksOf(doc: unknown): BlankLike[] {
    const out: BlankLike[] = [];
    const visit = (node: unknown): void => {
        if (Array.isArray(node)) {
            node.forEach(visit);
            return;
        }
        if (node === null || typeof node !== 'object') return;
        const o = node as Record<string, unknown>;
        if (o.type === 'blank' && typeof o.answer === 'string') out.push(o as unknown as BlankLike);
        for (const v of Object.values(o)) if (v !== null && typeof v === 'object') visit(v);
    };
    visit(doc);
    return out;
}

/** PB-8 at one row: every seeded numeric answer and mistake resolves to a
 *  number, and no mistake sits within tolerance of its answer. Returns the
 *  first problem, or null. Checked on the AUTHORED and RESOLVED pair so the
 *  "is this seeded?" question is the template's, not the row's. */
function checkRow(authored: BlankLike[], resolved: BlankLike[], declared: Set<string>): string | null {
    for (let b = 0; b < authored.length; b++) {
        const a = authored[b]!;
        const r = resolved[b]!;
        if (a.answerType !== 'numeric') continue;
        const seeded = freeVariables(a.answer).some((v) => declared.has(v));
        const answer = parseNumericValue(r.answer);
        if (seeded && answer === null) return `answer ${a.answer} doesn’t evaluate to a number (got “${r.answer}”)`;
        const tol = coerceTolerance(typeof r.tolerance === 'number' ? r.tolerance : undefined);
        for (let m = 0; m < (a.mistakeFeedback ?? []).length; m++) {
            const am = a.mistakeFeedback![m]!.match;
            const rm = r.mistakeFeedback?.[m]?.match;
            if (typeof am !== 'string' || typeof rm !== 'string') continue;
            if (/^unit-(missing|wrong)$/.test(am.trim())) continue;
            // Compare whenever EITHER side is seeded: a literal `!4` on a
            // seeded answer can equal it at some rows, and never fire there.
            if (!seeded && !freeVariables(am).some((v) => declared.has(v))) continue;
            const mv = parseNumericValue(rm);
            if (mv === null) return `mistake !${am} doesn’t evaluate to a number (got “${rm}”)`;
            if (answer !== null && numericallyClose(mv, answer, tol)) {
                return `mistake !${am} = ${rm} equals the answer ${a.answer} = ${r.answer}, so it can never fire`;
            }
        }
    }
    return null;
}

const MAX_PROSE_DECIMALS = 6;

function decimals(v: number): number {
    const s = String(v);
    if (/e/i.test(s)) return Infinity;
    const dot = s.indexOf('.');
    return dot === -1 ? 0 : s.length - dot - 1;
}

// ---- the file ---------------------------------------------------------------

export interface ParseBankFileOptions {
    /** The file name without `.md` — the item-id stem and the PB-1 name check. */
    readonly stem: string;
    readonly importer: MarkdownImporter;
    readonly glossary?: readonly ImportGlossaryEntry[];
}

export function parseBankFile(markdown: string, options: ParseBankFileOptions): BankFileResult {
    const { stem, importer, glossary } = options;
    const problems: string[] = [];
    const warnings: string[] = [];
    const unresolvedTerms: string[] = [];
    const split = splitBankFile(markdown);
    problems.push(...split.problems);

    const meta = parseBankMeta(split.metaSrc, problems, warnings);
    // Amendment (a): a skill bank is named for its skill; a discrimination bank
    // for its chain — the importer refuses either under any other name.
    if (meta) {
        const want = meta.role === 'discrimination' ? `${meta.chain}.discrimination` : meta.skill;
        if (want && stem !== want) {
            problems.push(`file name ${stem}.md: this bank is named ${want}.md (PB-1, amendment a).`);
        }
    }

    const seed = parseBankSeedFence(split.seedSrc ?? '');
    problems.push(...seed.problems);

    const headings = split.sections.map((s) => s.heading);
    if (headings.length === 0) problems.push('no templates — a bank has at least one `## <heading>`.');
    for (const s of split.sections) {
        if (!BANK_HEADING.test(s.heading)) {
            problems.push(`line ${s.line}: heading “${s.heading}” is an item id — lowercase letters, digits and hyphens, starting with a letter (PB-3).`);
        }
    }
    for (const h of new Set(headings.filter((h, i) => headings.indexOf(h) !== i))) {
        problems.push(`heading ${h} is used twice — item ids are unique (PB-3).`);
    }
    for (const w of seed.wheres) {
        if (!headings.includes(w.scope)) problems.push(`seed: where ${w.scope}: no template has the heading ${w.scope}.`);
    }

    const declared = new Set<string>([...seed.drawn.keys(), ...seed.derived.map((d) => d.name)]);
    const derivedNames = new Set(seed.derived.map((d) => d.name));
    const owner = new Map<string, string>();
    const items: BankItem[] = [];

    for (const section of split.sections) {
        const h = section.heading;
        const where = `${h}:`;
        const result = importer(section.body, glossary ? { glossary, bankSection: true } : { bankSection: true });
        for (const p of result.seedProblems ?? []) problems.push(`${where} ${p}`);
        for (const p of result.figureProblems ?? []) problems.push(`${where} ${p}`);
        if (result.meta) problems.push(`${where} a \`\`\`meta fence inside a template — the bank's meta goes at the top.`);
        if (result.teacherGuide) problems.push(`${where} a teacher guide inside a template — bank items carry none.`);
        if (result.referencePanel) problems.push(`${where} a \`\`\`reference fence inside a template — bank items carry none.`);
        for (const w of result.warnings) {
            if (!(result.figureProblems ?? []).includes(w) && !w.startsWith('Seed: ')) warnings.push(`${where} ${w}`);
        }
        for (const r of result.glossary?.references ?? []) {
            if (r.resolution === 'none' && !unresolvedTerms.includes(r.text)) unresolvedTerms.push(r.text);
        }
        if (result.blocks.length === 0) {
            problems.push(`${where} the template is empty.`);
            continue;
        }

        const base = createEmptyDocument({ title: `${stem}#${h}` });
        const built = tiptapToActivity(wrapBlocksStrict(result.blocks as JSONContent[]), base.meta);
        const parsed = ActivityDocument.safeParse(built);
        if (!parsed.success) {
            const first = parsed.error.issues[0];
            problems.push(`${where} the template fails schema validation at ${first?.path?.join('.') || '<root>'}: ${first?.message ?? 'unknown'}.`);
            continue;
        }
        const doc = parsed.data;

        const census = blockCensus(doc);
        for (const r of census.refused) problems.push(`${where} ${r} — a bank item is auto-scorable only (PB-9).`);
        if (census.graded === 0) problems.push(`${where} no graded response — every bank item asks for at least one (PB-9).`);

        const refs = collectRefs(doc);
        if (refs.unparsedBlank) {
            problems.push(`${where} a \`{{…}}\` stayed as text, so that blank never formed — two \`*\` in one blank read as italics; write \`2*a\` once or use brackets.`);
        }
        for (const n of refs.dataVar) problems.push(`${where} data: {${n}} needs a \`sample\` variable, and banks have none (BE-5).`);
        for (const n of refs.latex) {
            if (declared.has(n)) problems.push(`${where} {${n}} is inside maths ($…$) — seeded values don’t reach maths, so students would see the letter (R2).`);
        }
        const undeclaredProse = [...refs.prose].filter((n) => !declared.has(n));
        for (const n of undeclaredProse) problems.push(`${where} {${n}} isn’t declared in the \`\`\`seed fence — it would render literally.`);
        // Expression names that aren't declared are ordinary maths symbols (an
        // answer of `2x`), not references.
        const referenced = [...refs.prose, ...[...refs.expr].filter((n) => declared.has(n))];
        const { vars } = templateVariables(seed, referenced);

        for (const n of vars) {
            const prior = owner.get(n);
            if (prior && prior !== h) warnings.push(`seed: ${n} is used by both ${prior} and ${h}, so they share a draw (PB-5).`);
            else owner.set(n, h);
        }

        const enumerated = enumerateTemplate(seed, h, vars);
        if (!enumerated.ok) {
            problems.push(...enumerated.problems);
            continue;
        }
        const { table } = enumerated;

        // PB-8 at every stored row, on the document the grader would see.
        const authoredBlanks = blanksOf(doc.sections);
        for (let row = 0; row < table.rows.length; row++) {
            const values = bankRowValues(table, row);
            const resolved = blanksOf(substituteSeededAnswers(doc.sections, values));
            const problem = checkRow(authoredBlanks, resolved, vars as Set<string>);
            if (problem) {
                const at = table.columns.map((c, i) => `${c}=${table.rows[row]![i]}`).join(', ');
                problems.push(`${where} at ${at}: ${problem} (PB-8).`);
                break;
            }
        }

        // BE-6: a DERIVED value shown in prose must not render as float noise.
        for (const n of refs.prose) {
            if (!derivedNames.has(n)) continue;
            const col = table.columns.indexOf(n);
            const worst = Math.max(...table.rows.map((r) => decimals(r[col]!)));
            if (worst > MAX_PROSE_DECIMALS) {
                warnings.push(`${where} {${n}} reaches ${worst === Infinity ? 'exponent notation' : `${worst} decimal places`} in prose at some combination — round it in its expression, or constrain it with a where (BE-6).`);
            }
        }

        items.push({ itemId: `${stem}#${h}`, heading: h, document: doc, seed: enumerated.spec, table });
    }

    const used = new Set(owner.keys());
    for (const n of declared) {
        if (!used.has(n)) warnings.push(`seed: “${n}” is declared but no template uses it.`);
    }

    return { stem, meta, items: problems.length === 0 ? items : [], problems, warnings, unresolvedTerms };
}

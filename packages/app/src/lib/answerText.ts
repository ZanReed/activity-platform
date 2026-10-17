/**
 * answerText.ts — a student's checked answers, as words (class progress, D2).
 *
 * A check stores answers the way the grader needs them: typed text for blanks
 * and free text, but IDS for choices, matching, correspondence and ordering,
 * and COORDINATES for the graph family (check/wire.ts). The teacher's answer
 * list (CP-3 A) shows every one of the seven families as words, by resolving
 * ids to their labels and graph work to numbers.
 *
 * THE DOCUMENT IS THE STUDENT'S SERVED ONE. A seeded activity shows each
 * student different numbers, so labels come from the version's content run
 * through the same steps the read path and the grader use: the upgrade seam,
 * then `deriveSeedValues(seedVars, serveSeed(versionId, studentId))` and
 * `substituteSeedValues` (prose) plus `substituteSeededAnswers` (the answer-key
 * strings, for DR-6's "Answer: …" line). All pure and deterministic; nothing
 * here is sent anywhere.
 *
 * A family this module cannot read, or an id the document does not have,
 * reads "(answer not shown)" — a clear placeholder, never a raw id.
 */
import {
    pageLabel,
    upgradeActivityDocument,
    type ActivityDocument,
    type Block,
} from '@activity/schema';
import {
    deriveSeedValues,
    extractAnswerKey,
    serveSeed,
    substituteSeedValues,
    type AnswerKeyMap,
    type CheckItemResult,
    type SectionResponses,
} from '@activity/viewer';
import { substituteSeededAnswers } from '@activity/viewer/seeded-print';

export const ANSWER_NOT_SHOWN = '(answer not shown)';
export const NO_ANSWER = '(no answer)';

/** The seven response maps of a check (wire.ts SectionResponses), by name. */
export type AnswerFamily = keyof SectionResponses;
export const ANSWER_FAMILIES: readonly AnswerFamily[] = [
    'blanks',
    'choices',
    'matches',
    'correspondences',
    'orderings',
    'freeText',
    'graphs',
];

/** What one student was served for one version: prose with their numbers, and
 * the answer key resolved to their numbers. */
export interface ServedDoc {
    doc: ActivityDocument;
    key: AnswerKeyMap;
    index: DocIndex;
}

/** Build a student's served document from a version's stored content. Throws
 * when the content cannot be read by this build (the caller shows that). */
export function servedDocument(content: unknown, versionId: string, studentId: string): ServedDoc {
    const { doc } = upgradeActivityDocument(content);
    const vars = doc.meta.seedVars ?? [];
    let served: ActivityDocument = doc;
    let keyed: ActivityDocument = doc;
    if (vars.length > 0) {
        const values = deriveSeedValues(vars, serveSeed(versionId, studentId));
        served = substituteSeedValues(doc, values);
        keyed = substituteSeededAnswers(served, values);
    }
    return { doc: served, key: extractAnswerKey(keyed), index: indexDoc(served) };
}

// ---- Plain text --------------------------------------------------------------

/** Inline content (any of the inline alphabets) → one line of plain text. */
export function inlineText(nodes: unknown): string {
    if (!Array.isArray(nodes)) return '';
    let out = '';
    for (const n of nodes) {
        if (!n || typeof n !== 'object') continue;
        const node = n as Record<string, unknown>;
        if (node.type === 'text' && typeof node.text === 'string') out += node.text;
        else if (node.type === 'math_inline' && typeof node.latex === 'string') out += node.latex;
        else if (node.type === 'blank') out += '___';
        else if (node.type === 'hard_break') out += ' ';
        else if (Array.isArray(node.content)) out += inlineText(node.content);
    }
    return out.replace(/\s+/g, ' ').trim();
}

/** A number the way a teacher writes it: true minus sign, no float noise. */
export function formatNumber(n: number): string {
    if (!Number.isFinite(n)) return String(n);
    const rounded = Math.round(n * 1e4) / 1e4;
    const s = String(Object.is(rounded, -0) ? 0 : rounded);
    return s.startsWith('-') ? `−${s.slice(1)}` : s;
}

function point(p: unknown): string {
    if (!Array.isArray(p) || p.length < 2) return '?';
    return `(${formatNumber(Number(p[0]))}, ${formatNumber(Number(p[1]))})`;
}

function list(parts: string[]): string {
    return parts.length === 0 ? NO_ANSWER : parts.join(', ');
}

// ---- The document index -----------------------------------------------------

/** Where one answerable item sits, for its label and its answer's words. */
export interface ItemPlace {
    itemId: string;
    family: AnswerFamily;
    /** The block that answers (for a blank: the block whose content holds it). */
    block: Block;
    /** The top-level block, which carries the page number. */
    topBlockId: string;
    /** 1-based position among the blanks of its block, when it has several. */
    blankOrdinal?: number;
    blankCount?: number;
}

export interface DocIndex {
    /** Section id → its items, document order. */
    bySection: Record<string, ItemPlace[]>;
    byItem: Record<string, ItemPlace>;
    /** Top-level block id → "Q4" / custom label. */
    numbering: Record<string, string>;
    sectionTitles: Record<string, string>;
}

function isBlockArray(value: unknown): value is Block[] {
    return (
        Array.isArray(value) &&
        value.length > 0 &&
        value.every(
            (b) =>
                b !== null &&
                typeof b === 'object' &&
                typeof (b as { id?: unknown }).id === 'string' &&
                typeof (b as { type?: unknown }).type === 'string' &&
                !['text', 'blank', 'math_inline', 'hard_break'].includes((b as { type: string }).type),
        )
    );
}

/** In-band ids (blank tokens, math-gap prompts) at any depth short of a child block. */
function inBandIds(value: unknown, out: string[]): void {
    if (Array.isArray(value)) {
        if (isBlockArray(value)) return;
        for (const v of value) inBandIds(v, out);
        return;
    }
    if (!value || typeof value !== 'object') return;
    const node = value as Record<string, unknown>;
    if (node.type === 'blank' && typeof node.id === 'string') {
        out.push(node.id);
        return;
    }
    if (typeof node.latex === 'string' && Array.isArray(node.prompts)) {
        for (const p of node.prompts) {
            const id = (p as { id?: unknown } | null)?.id;
            if (typeof id === 'string') out.push(id);
        }
    }
    for (const child of Object.values(node)) inBandIds(child, out);
}

const BLOCK_FAMILY: Partial<Record<string, AnswerFamily>> = {
    multiple_choice: 'choices',
    matching: 'matches',
    correspondence: 'correspondences',
    ordering: 'orderings',
    self_explanation: 'freeText',
    short_answer: 'freeText',
    essay: 'freeText',
    interactive_graph: 'graphs',
    number_line: 'graphs',
    data_plot: 'graphs',
};

function visit(block: Block, topBlockId: string, items: ItemPlace[]): void {
    const blanks: string[] = [];
    inBandIds(block, blanks);
    blanks.forEach((id, i) =>
        items.push({
            itemId: id,
            family: 'blanks',
            block,
            topBlockId,
            ...(blanks.length > 1 ? { blankOrdinal: i + 1, blankCount: blanks.length } : {}),
        }),
    );
    const family = BLOCK_FAMILY[block.type];
    if (family) items.push({ itemId: block.id, family, block, topBlockId });
    for (const value of Object.values(block as Record<string, unknown>)) {
        if (isBlockArray(value)) for (const child of value) visit(child, topBlockId, items);
    }
}

export function indexDoc(doc: ActivityDocument): DocIndex {
    const bySection: Record<string, ItemPlace[]> = {};
    const byItem: Record<string, ItemPlace> = {};
    const numbering: Record<string, string> = {};
    const sectionTitles: Record<string, string> = {};
    let next = 1;
    doc.sections.forEach((section, si) => {
        sectionTitles[section.id] = section.title?.trim() || `Section ${si + 1}`;
        const items: ItemPlace[] = [];
        for (const row of section.rows) {
            for (const column of row.columns) {
                for (const block of column.blocks) {
                    const label = pageLabel(block);
                    if (label.kind === 'number') numbering[block.id] = `Q${next++}`;
                    else if (label.kind === 'custom') numbering[block.id] = label.text;
                    visit(block, block.id, items);
                }
            }
        }
        bySection[section.id] = items;
        for (const item of items) byItem[item.itemId] = item;
    });
    return { bySection, byItem, numbering, sectionTitles };
}

/** "Q4", "Q4 · blank 2", or the start of the question's own words. */
export function questionLabel(index: DocIndex, place: ItemPlace): string {
    const base =
        index.numbering[place.topBlockId] ??
        (inlineText(promptOf(place.block)).slice(0, 48) || 'Question');
    return place.blankOrdinal ? `${base} · blank ${place.blankOrdinal}` : base;
}

function promptOf(block: Block): unknown {
    const b = block as Record<string, unknown>;
    return b.prompt ?? b.content ?? [];
}

// ---- The seven families -------------------------------------------------------

interface Labelled {
    id: string;
    content?: unknown;
    header?: unknown;
    image?: { alt?: string };
    graph?: unknown;
}

function labelOf(entry: Labelled | undefined): string | null {
    if (!entry) return null;
    const text = inlineText(entry.content ?? entry.header);
    if (text) return text;
    if (entry.image) return entry.image.alt ? `image: ${entry.image.alt}` : 'an image';
    if (entry.graph) return 'a graph';
    return null;
}

function byId<T extends { id: string }>(arr: unknown): Map<string, T> {
    return new Map(Array.isArray(arr) ? (arr as T[]).map((e) => [e.id, e]) : []);
}

function choiceWords(block: Block, ids: unknown): string | null {
    if (!Array.isArray(ids)) return null;
    const choices = byId<Labelled>((block as { choices?: unknown }).choices);
    const words = ids.map((id) => labelOf(choices.get(String(id))));
    return words.some((w) => w === null) ? null : list(words as string[]);
}

function matchWords(block: Block, pairs: unknown): string | null {
    if (!pairs || typeof pairs !== 'object') return null;
    const items = byId<Labelled>((block as { items?: unknown }).items);
    const targets = byId<Labelled>((block as { targets?: unknown }).targets);
    const out: string[] = [];
    // Authored item order, so two students' lists read the same way.
    for (const [itemId, item] of items) {
        const targetId = (pairs as Record<string, unknown>)[itemId];
        if (typeof targetId !== 'string') continue;
        const t = labelOf(targets.get(targetId));
        const i = labelOf(item);
        if (t === null || i === null) return null;
        out.push(`${i} → ${t}`);
    }
    return list(out);
}

function correspondenceWords(block: Block, cells: unknown): string | null {
    if (!cells || typeof cells !== 'object') return null;
    const items = byId<Labelled>((block as { items?: unknown }).items);
    const columns = (block as { targetColumns?: unknown }).targetColumns;
    if (!Array.isArray(columns)) return null;
    const out: string[] = [];
    for (const [itemId, item] of items) {
        const row = (cells as Record<string, unknown>)[itemId];
        if (!row || typeof row !== 'object') continue;
        const parts: string[] = [];
        for (const col of columns as Array<Labelled & { targets?: unknown }>) {
            const targetId = (row as Record<string, unknown>)[col.id];
            if (typeof targetId !== 'string') continue;
            const t = labelOf(byId<Labelled>(col.targets).get(targetId));
            if (t === null) return null;
            const header = labelOf(col);
            parts.push(header ? `${header} ${t}` : t);
        }
        const i = labelOf(item);
        if (i === null) return null;
        if (parts.length > 0) out.push(`${i}: ${parts.join(', ')}`);
    }
    return out.length === 0 ? NO_ANSWER : out.join('; ');
}

function orderingWords(block: Block, ids: unknown): string | null {
    if (!Array.isArray(ids)) return null;
    const items = byId<Labelled>((block as { items?: unknown }).items);
    const words = ids.map((id) => labelOf(items.get(String(id))));
    if (words.some((w) => w === null)) return null;
    return words.length === 0 ? NO_ANSWER : (words as string[]).join(' → ');
}

function styleWord(s: unknown): string {
    return s === 'open' ? 'open' : s === 'closed' ? 'closed' : '';
}

function graphWords(block: Block, work: unknown): string | null {
    if (!work || typeof work !== 'object') return null;
    const w = work as {
        interaction?: string;
        points?: unknown;
        noSolution?: boolean;
        domain?: { minX?: number; minStyle?: string; maxX?: number; maxStyle?: string };
        shape?: string;
        equation?: string;
        endpointStyles?: unknown[];
        parts?: Array<{ points?: unknown }>;
    };
    if (w.noSolution) return 'no solution';
    const pts = Array.isArray(w.points) ? (w.points as unknown[]) : [];
    const xs = pts.map((p) => (Array.isArray(p) ? formatNumber(Number(p[0])) : '?'));

    if (block.type === 'number_line') {
        if (w.domain && (w.domain.minX !== undefined || w.domain.maxX !== undefined)) {
            const d = w.domain;
            const lo = d.minX === undefined ? null : `${formatNumber(d.minX)} ${styleWord(d.minStyle)}`.trim();
            const hi = d.maxX === undefined ? null : `${formatNumber(d.maxX)} ${styleWord(d.maxStyle)}`.trim();
            if (lo && hi) return `from ${lo} to ${hi}`;
            if (lo) return `from ${lo}, going right`;
            return `up to ${hi}, going left`;
        }
        return pts.length === 0 ? NO_ANSWER : `plotted ${xs.join(', ')}`;
    }

    if (block.type === 'data_plot') {
        if (pts.length === 0) return NO_ANSWER;
        if (w.interaction === 'build_histogram') {
            const sorted = [...pts].sort((a, b) => Number((a as number[])[0]) - Number((b as number[])[0]));
            return `bar heights ${sorted.map((p) => formatNumber(Number((p as number[])[1]))).join(', ')}`;
        }
        if (w.interaction === 'build_dotplot') return `dots at ${xs.join(', ')}`;
        if (w.interaction === 'build_boxplot' && pts.length === 5) {
            const v = [...xs];
            return `min ${v[0]}, Q1 ${v[1]}, median ${v[2]}, Q3 ${v[3]}, max ${v[4]}`;
        }
        return list(pts.map(point));
    }

    // interactive_graph
    const parts: string[] = [];
    if (w.shape === 'ray_positive' || w.shape === 'ray_negative') parts.push('a ray');
    if (w.shape === 'segment') parts.push('a segment');
    if (pts.length > 0) parts.push(pts.map(point).join(', '));
    if (Array.isArray(w.endpointStyles) && w.endpointStyles.length > 0) {
        parts.push(`endpoints ${w.endpointStyles.map(styleWord).join(' and ')}`);
    }
    if (Array.isArray(w.parts)) {
        w.parts.forEach((p, i) => {
            const pp = Array.isArray(p.points) ? (p.points as unknown[]) : [];
            if (pp.length > 0) parts.push(`part ${i + 1}: ${pp.map(point).join(', ')}`);
        });
    }
    if (typeof w.equation === 'string' && w.equation.trim()) parts.push(`typed ${w.equation.trim()}`);
    return parts.length === 0 ? NO_ANSWER : parts.join('; ');
}

/**
 * One stored answer → words. `place` is where its item sits in the student's
 * served document; null when the document has no such item.
 */
export function answerWords(place: ItemPlace | null, family: AnswerFamily | null, value: unknown): string {
    if (value === undefined || value === null) return NO_ANSWER;
    if (family === 'blanks' || family === 'freeText') {
        if (typeof value !== 'string') return ANSWER_NOT_SHOWN;
        return value.trim() === '' ? NO_ANSWER : value.trim();
    }
    if (!place || !family) return ANSWER_NOT_SHOWN;
    let words: string | null = null;
    switch (family) {
        case 'choices':
            words = choiceWords(place.block, value);
            break;
        case 'matches':
            words = matchWords(place.block, value);
            break;
        case 'correspondences':
            words = correspondenceWords(place.block, value);
            break;
        case 'orderings':
            words = orderingWords(place.block, value);
            break;
        case 'graphs':
            words = graphWords(place.block, value);
            break;
    }
    return words ?? ANSWER_NOT_SHOWN;
}

// ---- The canonical answer (DR-6) ---------------------------------------------

function drawableWords(d: Record<string, unknown>): string | null {
    switch (d.kind) {
        case 'point':
            return point(d.at);
        case 'segment':
            return `segment ${point(d.from)} to ${point(d.to)}`;
        case 'ray':
            return `ray from ${point(d.from)} through ${point(d.through)}`;
        case 'expression':
            return typeof d.expression === 'string' ? d.expression : null;
        case 'polygon':
            return Array.isArray(d.vertices) ? `shape ${(d.vertices as unknown[]).map(point).join(', ')}` : null;
        default:
            return null;
    }
}

/** The answer a printed key would show for this item, as words; null when the
 * key has nothing a line of text can say (the page then says nothing). */
export function canonicalAnswer(served: ServedDoc, place: ItemPlace): string | null {
    const key = served.key[place.block.id];
    if (!key) return null;
    switch (place.family) {
        case 'blanks':
            return key.blanks?.[place.itemId] ?? key.mathGaps?.[place.itemId] ?? null;
        case 'choices':
            return key.correctChoiceIds ? choiceWords(place.block, key.correctChoiceIds) : null;
        case 'matches':
            return key.targetIdByItemId ? matchWords(place.block, key.targetIdByItemId) : null;
        case 'correspondences':
            return key.targetIdByItemAndColumn
                ? correspondenceWords(place.block, key.targetIdByItemAndColumn)
                : null;
        case 'orderings': {
            const pos = key.positionByItemId;
            if (!pos) return null;
            const ids = Object.keys(pos).sort((a, b) => (pos[a] ?? 0) - (pos[b] ?? 0));
            return orderingWords(place.block, ids);
        }
        case 'graphs': {
            if (key.graphNoSolution) return 'no solution';
            const marks = key.numberLineMarks;
            if (marks && marks.length > 0) {
                return marks
                    .map((m) => {
                        if (m.kind === 'point') return formatNumber(m.x);
                        const lo = m.min === undefined ? null : `${formatNumber(m.min)} ${styleWord(m.minStyle)}`.trim();
                        const hi = m.max === undefined ? null : `${formatNumber(m.max)} ${styleWord(m.maxStyle)}`.trim();
                        if (lo && hi) return `from ${lo} to ${hi}`;
                        return lo ? `from ${lo}, going right` : `up to ${hi ?? '?'}, going left`;
                    })
                    .join(', ');
            }
            if (key.dataPlotValues) return `the data ${key.dataPlotValues.map(formatNumber).join(', ')}`;
            const words = (key.graphOverlay ?? [])
                .map((d) => drawableWords(d as unknown as Record<string, unknown>))
                .filter((w): w is string => w !== null);
            if (key.graphEquation) words.push(key.graphEquation);
            return words.length > 0 ? words.join('; ') : null;
        }
        default:
            return null;
    }
}

// ---- One section's answer list ----------------------------------------------

export type LineVerdict = 'correct' | 'incorrect' | 'recorded' | 'unchecked';

export interface AnswerLine {
    itemId: string;
    family: AnswerFamily | null;
    label: string;
    answer: string;
    verdict: LineVerdict;
    /** The authored feedback the grader attached, as plain text. */
    feedback: string | null;
    misconceptionIds: string[];
    /** DR-6: only on a WRONG answer. */
    correctAnswer: string | null;
}

function familyOfStored(responses: Partial<SectionResponses>, itemId: string): AnswerFamily | null {
    for (const f of ANSWER_FAMILIES) {
        const map = responses[f] as Record<string, unknown> | undefined;
        if (map && typeof map === 'object' && Object.prototype.hasOwnProperty.call(map, itemId)) return f;
    }
    return null;
}

/**
 * Every item of one checked section, in document order, then any item the
 * grader marked that the document does not have (kept, labelled as unknown,
 * so nothing a student was marked on disappears).
 */
export function sectionAnswerLines(
    served: ServedDoc,
    sectionId: string,
    responses: unknown,
    verdicts: unknown,
): AnswerLine[] {
    const resp = (responses && typeof responses === 'object' ? responses : {}) as Partial<SectionResponses>;
    const verd = (verdicts && typeof verdicts === 'object' ? verdicts : {}) as Record<string, CheckItemResult>;
    const places = served.index.bySection[sectionId] ?? [];
    const lines: AnswerLine[] = [];
    const seen = new Set<string>();

    const line = (place: ItemPlace | null, itemId: string): AnswerLine => {
        const family = place?.family ?? familyOfStored(resp, itemId);
        const value = family ? (resp[family] as Record<string, unknown> | undefined)?.[itemId] : undefined;
        const v = verd[itemId];
        const verdict: LineVerdict =
            v?.verdict === 'correct' || v?.verdict === 'incorrect' || v?.verdict === 'recorded'
                ? v.verdict
                : 'unchecked';
        return {
            itemId,
            family,
            label: place ? questionLabel(served.index, place) : 'Unknown question',
            answer: answerWords(place, family, value),
            verdict,
            feedback: v?.feedback ? inlineText(v.feedback) || null : null,
            misconceptionIds: Array.isArray(v?.misconceptionIds) ? v.misconceptionIds : [],
            correctAnswer: verdict === 'incorrect' && place ? canonicalAnswer(served, place) : null,
        };
    };

    for (const place of places) {
        seen.add(place.itemId);
        lines.push(line(place, place.itemId));
    }
    for (const itemId of Object.keys(verd)) {
        if (!seen.has(itemId)) lines.push(line(null, itemId));
    }
    return lines;
}

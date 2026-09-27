// =============================================================================
// glossaryFile.ts — the course glossary file's RULES (docs/design/glossary.md)
// -----------------------------------------------------------------------------
// The batch importer's `--glossary <file>` goes through here: the raw parse
// (getGlossaryFileParser, in markdownToTiptap.ts — same fence grammar as a
// worksheet) and then every rule the reviewed design put on the file:
//
//   W-2   `id:` is REQUIRED and never derived from the term (a spelling fix
//         must not become a rename); it must be a store-legal id.
//   R3    one entry per id and per name — a duplicate keeps the FIRST; a
//         variant that is already another entry's name is dropped.
//   W-3   variant keys are a closed set ({us}); anything else is a typo until
//         somebody decides it is a locale.
//   EN-8  the body must be a DefinitionBlock[] with no prompted math — store
//         bodies skip the server sanitize, so this is their gate.
//   R3/W-9/EN-11  16 KB per entry (skipped), 2,000 entries (the rest
//         dropped), 1 MB in total (flagged: a live run refuses the mirror).
//
// Every problem is ONE line shaped `<file>:<line> <id> — <problem>; <fix>`
// (W-7), and every one of them fails a `--strict` run. The curriculum side's
// CI gates this file too (D8); these rules are the platform's own read of it,
// and they are what decide what is mirrored.
// =============================================================================

import {
    GLOSSARY_ENTRY_MAX_BYTES,
    GLOSSARY_LOCALES,
    GLOSSARY_MAX_ENTRIES,
    GLOSSARY_TOTAL_MAX_BYTES,
    parseGlossaryBody,
    termKey,
    type GlossaryLocale,
    type GlossaryVariants,
} from '@activity/schema';
import { getGlossaryFileParser, type ImportGlossaryEntry } from './markdownToTiptap';

/** The id shape the store accepts — migration 0043's CHECK, verbatim. */
export const GLOSSARY_ID_PATTERN = /^[a-z0-9][a-z0-9._-]*$/;
export const GLOSSARY_ID_MAX_LENGTH = 120;

export interface GlossaryLoadResult {
    /** The entries that passed every rule, file order, at most the row cap. */
    readonly entries: ImportGlossaryEntry[];
    /** One W-7 line per problem. Each fails `--strict`. */
    readonly warnings: string[];
    readonly variantCount: number;
    /** Serialized size of every accepted body. */
    readonly totalBytes: number;
    /** Over GLOSSARY_TOTAL_MAX_BYTES: a live run must not mirror (EN-11). */
    readonly overTotalCap: boolean;
}

export type GlossaryLoader = (markdown: string, label: string) => GlossaryLoadResult;

/**
 * A body without its block ids. The fence parser mints a fresh uuid for every
 * block on every parse, so an id-bearing body would differ from the stored one
 * on EVERY run — the sync would report the whole glossary changed and restamp
 * every row. Ids are optional on DefinitionBlock and nothing keys on them.
 */
export function stripBlockIds(blocks: readonly unknown[]): unknown[] {
    return blocks.map((raw) => {
        if (raw === null || typeof raw !== 'object') return raw;
        const block = { ...(raw as Record<string, unknown>) };
        delete block.id;
        if (Array.isArray(block.items)) {
            block.items = block.items.map((item) => {
                if (item === null || typeof item !== 'object') return item;
                const rest = { ...(item as Record<string, unknown>) };
                delete rest.id;
                // An item's content is inline (no ids); nested lists ride
                // `children`, which are list BLOCKS.
                return Array.isArray(rest.children)
                    ? { ...rest, children: stripBlockIds(rest.children) }
                    : rest;
            });
        }
        return block;
    });
}

const bytes = (value: unknown): number => new TextEncoder().encode(JSON.stringify(value)).length;
const kb = (n: number): string => `${Math.ceil(n / 1024)} KB`;

export async function getGlossaryLoader(): Promise<GlossaryLoader> {
    const parse = await getGlossaryFileParser();
    return (markdown, label) => {
        const parsed = parse(markdown);
        const warnings: string[] = [];
        const entries: ImportGlossaryEntry[] = [];
        const idLines = new Map<string, number>();
        // Every name (term or variant) → the entry that owns it.
        const names = new Map<string, { id: string; line: number }>();
        let variantCount = 0;
        let totalBytes = 0;
        let overCap = 0;

        if (parsed.fences === 0) {
            warnings.push(
                `${label}:1 — no \`\`\`definitions fence, so no glossary entries; ` +
                    'put the entries inside a ```definitions fence (docs/markdown-import-format.md)',
            );
        }

        for (const entry of parsed.entries) {
            const idHeader = entry.headers.get('id');
            const termHeader = entry.headers.get('term');
            const id = idHeader?.value ?? '';
            const term = termHeader?.value ?? '';
            const where = (line: number, who: string): string => `${label}:${line} ${who}`;
            const who = id || (term ? `(no id) “${term}”` : '(no id)');

            if (!id) {
                warnings.push(
                    `${where(entry.line, who)} — no id: line, entry skipped; add “id: <stable-id>” ` +
                        'as the entry’s first line (an id is permanent — never derived from the term)',
                );
                continue;
            }
            if (!GLOSSARY_ID_PATTERN.test(id) || id.length > GLOSSARY_ID_MAX_LENGTH) {
                warnings.push(
                    `${where(idHeader?.line ?? entry.line, id)} — not a valid id, entry skipped; use ` +
                        'lower-case letters, digits, “.”, “_” or “-”, starting with a letter or digit ' +
                        `(at most ${GLOSSARY_ID_MAX_LENGTH} characters)`,
                );
                continue;
            }
            const firstAt = idLines.get(id);
            if (firstAt !== undefined) {
                warnings.push(
                    `${where(idHeader?.line ?? entry.line, id)} — duplicate id (first at line ` +
                        `${firstAt}), entry skipped; give one entry a different id:`,
                );
                continue;
            }
            idLines.set(id, idHeader?.line ?? entry.line);
            if (!term) {
                warnings.push(
                    `${where(entry.line, id)} — no term: line, entry skipped; add “term: <word>” ` +
                        'under the id: line',
                );
                continue;
            }
            const termOwner = names.get(termKey(term));
            if (termOwner) {
                warnings.push(
                    `${where(termHeader?.line ?? entry.line, id)} — term “${term}” is already a name of ` +
                        `${termOwner.id} (line ${termOwner.line}), entry skipped; merge the two entries ` +
                        'or rename one term',
                );
                continue;
            }
            if (entry.emptyBody || entry.body.length === 0) {
                warnings.push(
                    `${where(entry.line, id)} — no definition text${
                        entry.emptyBody ? ' a definition can hold' : ''
                    }, entry skipped; write the definition below the header lines`,
                );
                continue;
            }
            const body = parseGlossaryBody(stripBlockIds(entry.body));
            if (body === null) {
                warnings.push(
                    `${where(entry.line, id)} — the definition holds content a glossary entry cannot ` +
                        '(an answer gap in math, or a block outside the definition subset), entry ' +
                        'skipped; remove it',
                );
                continue;
            }
            const size = bytes(body);
            if (size > GLOSSARY_ENTRY_MAX_BYTES) {
                warnings.push(
                    `${where(entry.line, id)} — the definition is ${kb(size)}, over the ` +
                        `${kb(GLOSSARY_ENTRY_MAX_BYTES)} entry cap, entry skipped; shorten it or split the entry`,
                );
                continue;
            }
            for (const w of entry.warnings) warnings.push(`${where(entry.line, id)} — ${w}`);

            const variants: GlossaryVariants = {};
            for (const [key, header] of entry.headers) {
                if (key === 'id' || key === 'term') continue;
                if (!(GLOSSARY_LOCALES as readonly string[]).includes(key)) {
                    warnings.push(
                        `${where(header.line, id)} — unknown variant key “${key}:”, line ignored; v1 knows ` +
                            `only ${GLOSSARY_LOCALES.map((l) => `${l}:`).join(', ')} — remove the line, or ` +
                            'ask for the locale to be added (a deliberate format change)',
                    );
                    continue;
                }
                if (!header.value) continue;
                const owner = names.get(termKey(header.value));
                if (owner || termKey(header.value) === termKey(term)) {
                    warnings.push(
                        `${where(header.line, id)} — variant ${key}: “${header.value}” is already a name of ` +
                            `${owner ? `${owner.id} (line ${owner.line})` : 'this entry'}, variant dropped; ` +
                            'remove one of them',
                    );
                    continue;
                }
                variants[key as GlossaryLocale] = header.value;
            }

            if (entries.length >= GLOSSARY_MAX_ENTRIES) {
                // Counted, and named once below — every entry past the cap is
                // dropped alike.
                overCap += 1;
                continue;
            }
            names.set(termKey(term), { id, line: entry.line });
            for (const v of Object.values(variants)) {
                if (v) names.set(termKey(v), { id, line: entry.line });
            }
            variantCount += Object.keys(variants).length;
            totalBytes += size;
            entries.push({ id, term, variants, body });
        }

        if (overCap > 0) {
            warnings.push(
                `${label} — ${GLOSSARY_MAX_ENTRIES + overCap} entries, over the ` +
                    `${GLOSSARY_MAX_ENTRIES}-entry cap; the last ${overCap} were dropped — split ` +
                    'the course glossary',
            );
        }
        const overTotalCap = totalBytes > GLOSSARY_TOTAL_MAX_BYTES;
        if (overTotalCap) {
            warnings.push(
                `${label} — definitions total ${kb(totalBytes)}, over the ` +
                    `${kb(GLOSSARY_TOTAL_MAX_BYTES)} glossary cap; a live run will not mirror the store ` +
                    'until it is under — shorten or split definitions',
            );
        }
        return { entries, warnings, variantCount, totalBytes, overTotalCap };
    };
}

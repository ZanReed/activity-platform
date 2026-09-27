// =============================================================================
// glossary.ts — the course glossary's pure core (docs/design/glossary.md §5d)
// -----------------------------------------------------------------------------
// ONE module both sides of the glossary run: the batch importer (resolving a
// `[[term]]` against the curriculum glossary file or the store, EN-3) and the
// student viewer (merging the store with the activity's own definitions,
// searching, cross-linking). It lives in @activity/schema because that package
// is already pure zod and already reaches both the node-bundled importer and
// the viewer — putting it in the viewer would drag React into the importer's
// node bundle, and the graph-kit barrel lesson (CLAUDE.md) is that a node
// bundle finds out the hard way.
//
// Four rules this file exists to make impossible to break twice:
//
//  1. LOCAL WINS, STRUCTURALLY (EN-3). A reference resolves to the store entry
//     whose term OR variant matches, and then yields to ANY activity-local
//     definition of that entry's term or variants. The importer and the viewer
//     call the same function, so "gradient" can never read two ways in one
//     activity.
//  2. FOLDING IS ONE FUNCTION. Case and diacritics are folded the same way for
//     identity, search and cross-link matching, and a folded match maps back to
//     the ORIGINAL characters for highlighting (GD-14).
//  3. A STORE BODY IS NOT SANITIZED BY THE SERVER (EN-8). Activity content
//     passes get-activity's sanitize; glossary rows arrive through an RPC and
//     do not. That is safe only while a definition body can carry nothing
//     gradeable — so `parseGlossaryBody` (glossary-body.ts) REJECTS a prompted
//     math_inline (the one gradeable shape DefinitionContentInline can hold)
//     instead of trusting the writer. Widening DefinitionBlock means
//     re-reading this.
//  4. CROSS-LINKS ARE PLACED WHEN SHOWN (UC1, author ruling at the gate). The
//     link set depends on the merged index — which local definitions shadow
//     which store entries — and that exists only on the page. `linkify` runs
//     over the merged index at render; the importer calls the same function
//     only to REPORT counts.
//
// ZOD-FREE ON PURPOSE. The student viewer imports this module on its EAGER
// path (the term button, the host), and the shell's perf budget forbids zod
// there (D16). Validation lives in glossary-body.ts and is loaded lazily by
// the viewer's store read.
// =============================================================================

import type { DefinitionBlock } from './inline.js';

// ---- Caps and names ----------------------------------------------------------

/** One cap for the importer and the read RPC (W-9); the SQL mirrors it. */
export const GLOSSARY_MAX_ENTRIES = 2000;
/** Serialized size above which one entry is skipped at load (R3). */
export const GLOSSARY_ENTRY_MAX_BYTES = 16 * 1024;
/** Total body size above which a live run refuses the mirror (EN-11). */
export const GLOSSARY_TOTAL_MAX_BYTES = 1024 * 1024;
/** The closed set of variant locales (W-3). A new locale is a format change. */
export const GLOSSARY_LOCALES = ['us'] as const;
export type GlossaryLocale = (typeof GLOSSARY_LOCALES)[number];
export type GlossaryVariants = Partial<Record<GlossaryLocale, string>>;
/** The render-only mark `linkify` adds to a text run. Never persisted. */
export const GLOSSARY_LINK_MARK = 'glossary_link';

/** Display label for a variant locale ("US: slope"). */
export function localeLabel(locale: GlossaryLocale): string {
  return locale.toUpperCase();
}

// ---- Folding -------------------------------------------------------------------

/**
 * Fold a string for matching: lower case, compatibility-decomposed, combining
 * marks stripped. `map[i]` is the index in the ORIGINAL string of the
 * character that produced folded[i]; `map[folded.length]` is the original
 * length, so a folded range [a, b) maps back to [map[a], map[b]).
 */
export function foldWithMap(text: string): { folded: string; map: number[] } {
  let folded = '';
  const map: number[] = [];
  let offset = 0;
  for (const ch of text) {
    const f = ch.toLowerCase().normalize('NFKD').replace(/\p{M}/gu, '');
    for (const unit of f) {
      folded += unit;
      for (let k = 0; k < unit.length; k += 1) map.push(offset);
    }
    offset += ch.length;
  }
  map.push(offset);
  return { folded, map };
}

/** Folded form for comparison and search. */
export function foldText(text: string): string {
  return foldWithMap(text).folded;
}

/** Folded IDENTITY of a term: folded, trimmed, inner whitespace collapsed. */
export function termKey(text: string): string {
  return foldText(text).trim().replace(/\s+/g, ' ');
}

const WORD_CHAR = /[\p{L}\p{N}]/u;
function isWordChar(ch: string | undefined): boolean {
  return ch !== undefined && WORD_CHAR.test(ch);
}

// ---- Body text -------------------------------------------------------------------

interface MaybeInline {
  type?: unknown;
  text?: unknown;
}

function inlineText(nodes: readonly unknown[], math: string): string {
  let out = '';
  for (const node of nodes) {
    const n = node as MaybeInline;
    if (n.type === 'text' && typeof n.text === 'string') out += n.text;
    else if (n.type === 'math_inline') out += math;
    else if (n.type === 'hard_break') out += ' ';
  }
  return out;
}

function listText(
  items: readonly { content?: readonly unknown[]; children?: readonly unknown[] }[],
  math: string,
  parts: string[],
): void {
  for (const item of items) {
    parts.push(inlineText(item.content ?? [], math));
    for (const child of item.children ?? []) {
      const list = child as { items?: readonly never[] };
      listText(list.items ?? [], math, parts);
    }
  }
}

/**
 * The plain text of a definition body (R14): text runs, headings, list items
 * and image alt text. Math becomes `math` (empty for SEARCH — math never
 * matches — and "…" for a SNIPPET, so raw LaTeX never reaches a student, GD-4).
 * Graph figures contribute nothing.
 */
export function definitionPlainText(
  blocks: readonly DefinitionBlock[],
  math = '',
): string {
  const parts: string[] = [];
  for (const block of blocks) {
    switch (block.type) {
      case 'paragraph':
      case 'heading':
        parts.push(inlineText(block.content, math));
        break;
      case 'math_block':
        if (math) parts.push(math);
        break;
      case 'image':
        if (block.alt) parts.push(block.alt);
        break;
      case 'bullet_list':
      case 'ordered_list':
        listText(block.items, math, parts);
        break;
      default:
        break;
    }
  }
  return parts
    .map((p) => p.trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ');
}

// ---- Variants -----------------------------------------------------------------

/** Keep only known locales with non-empty display strings (W-3). */
export function parseGlossaryVariants(raw: unknown): GlossaryVariants {
  const out: GlossaryVariants = {};
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) return out;
  for (const locale of GLOSSARY_LOCALES) {
    const value = (raw as Record<string, unknown>)[locale];
    if (typeof value === 'string' && value.trim()) out[locale] = value.trim();
  }
  return out;
}

// ---- Entries and the merged index ------------------------------------------------

export interface GlossarySourceEntry {
  /** Store: the entry's stable `term_id`. Local: `local:<termKey>`. */
  readonly id: string;
  readonly term: string;
  readonly variants: GlossaryVariants;
  readonly body: readonly DefinitionBlock[];
  readonly retired: boolean;
  readonly source: 'store' | 'local';
}

export interface GlossaryName {
  readonly text: string;
  readonly folded: string;
  /** Set when this name is a locale variant rather than the term itself. */
  readonly locale?: GlossaryLocale;
}

export interface GlossaryIndexEntry extends GlossarySourceEntry {
  readonly key: string;
  readonly names: readonly GlossaryName[];
  /** Folded plain text of the body, math excluded (R14). */
  readonly searchText: string;
}

export interface GlossaryIndex {
  /** What the list shows: active, not shadowed, A→Z by term. */
  readonly visible: readonly GlossaryIndexEntry[];
  /** Every entry by id — retired and shadowed included (GD-11). */
  readonly byId: ReadonlyMap<string, GlossaryIndexEntry>;
  /** store id → the local entry that hides it in this activity (R15). */
  readonly hiddenBy: ReadonlyMap<string, string>;
}

export function localEntryId(term: string): string {
  return `local:${termKey(term)}`;
}

function indexEntry(entry: GlossarySourceEntry): GlossaryIndexEntry {
  const names: GlossaryName[] = [{ text: entry.term, folded: termKey(entry.term) }];
  for (const locale of GLOSSARY_LOCALES) {
    const v = entry.variants[locale];
    if (v) names.push({ text: v, folded: termKey(v), locale });
  }
  return {
    ...entry,
    key: termKey(entry.term),
    names,
    searchText: foldText(definitionPlainText(entry.body)),
  };
}

function compareTerms(a: GlossaryIndexEntry, b: GlossaryIndexEntry): number {
  return (
    a.term.localeCompare(b.term, undefined, { sensitivity: 'base' }) ||
    a.id.localeCompare(b.id)
  );
}

/**
 * Merge the store with the activity's own definitions (R15). A local
 * definition hides the store entry it matches on the entry's term or any
 * variant — one row, the local one. Local entries dedupe by term, first wins
 * (the paper glossary's convention). Retired store entries stay addressable by
 * id but never enter `visible`.
 */
export function buildGlossaryIndex(
  store: readonly GlossarySourceEntry[],
  local: readonly GlossarySourceEntry[],
): GlossaryIndex {
  const byId = new Map<string, GlossaryIndexEntry>();
  const localByKey = new Map<string, GlossaryIndexEntry>();
  for (const raw of local) {
    const entry = indexEntry(raw);
    if (localByKey.has(entry.key)) continue;
    localByKey.set(entry.key, entry);
    byId.set(entry.id, entry);
  }
  const hiddenBy = new Map<string, string>();
  const visible: GlossaryIndexEntry[] = [...localByKey.values()];
  for (const raw of store) {
    const entry = indexEntry(raw);
    if (byId.has(entry.id)) continue;
    byId.set(entry.id, entry);
    const shadow = entry.names
      .map((n) => localByKey.get(n.folded))
      .find((e) => e !== undefined);
    if (shadow) {
      hiddenBy.set(entry.id, shadow.id);
      continue;
    }
    if (!entry.retired) visible.push(entry);
  }
  visible.sort(compareTerms);
  return { visible, byId, hiddenBy };
}

/**
 * The entry a tapped term opens: a keyed (store-resolved) mark opens its store
 * entry — or the local definition hiding it — and a local mark opens the local
 * entry for its text.
 */
export function entryForMark(
  index: GlossaryIndex,
  mark: { glossaryKey?: string | undefined; text: string },
): GlossaryIndexEntry | undefined {
  if (mark.glossaryKey) {
    const hider = index.hiddenBy.get(mark.glossaryKey);
    return index.byId.get(hider ?? mark.glossaryKey);
  }
  return index.byId.get(localEntryId(mark.text));
}

// ---- One resolver (EN-3) ---------------------------------------------------------

export interface ResolvableStoreEntry {
  readonly id: string;
  readonly term: string;
  readonly variants: GlossaryVariants;
  readonly retired?: boolean;
}

export type TermResolution<S extends ResolvableStoreEntry> =
  | { readonly kind: 'local'; readonly localKey: string }
  | { readonly kind: 'store'; readonly entry: S }
  | { readonly kind: 'none' };

function namesOf(entry: ResolvableStoreEntry): string[] {
  const names = [termKey(entry.term)];
  for (const locale of GLOSSARY_LOCALES) {
    const v = entry.variants[locale];
    if (v) names.push(termKey(v));
  }
  return names;
}

/**
 * Decide what a `[[text]]` reference means. `localKeys` holds the termKey of
 * every activity-local definition (fence AND inline `::`). Order:
 *   1. the text names a local definition → local;
 *   2. an ACTIVE store entry matches by term or variant; if any local
 *      definition names that entry's term or a variant → that local wins;
 *   3. otherwise the store entry;
 *   4. nothing → none. A match on a RETIRED entry alone is none: retirement
 *      stops new references (R2) without breaking marks that already exist.
 */
export function resolveTerm<S extends ResolvableStoreEntry>(
  text: string,
  localKeys: ReadonlySet<string>,
  store: readonly S[],
): TermResolution<S> {
  const key = termKey(text);
  if (localKeys.has(key)) return { kind: 'local', localKey: key };
  const entry = store.find((e) => !e.retired && namesOf(e).includes(key));
  if (!entry) return { kind: 'none' };
  const shadow = namesOf(entry).find((n) => localKeys.has(n));
  if (shadow !== undefined) return { kind: 'local', localKey: shadow };
  return { kind: 'store', entry };
}

// ---- Search (D4, R11, R14, GD-6/13/14) --------------------------------------------

export type MatchRange = readonly [number, number];

export interface GlossarySearchResult {
  readonly entry: GlossaryIndexEntry;
  /** 0 name-prefix, 1 name-substring, 2 word in the definition. */
  readonly tier: 0 | 1 | 2;
  /** The name that matched, when tier < 2 (a variant shows its line, GD-13). */
  readonly name?: GlossaryName;
  /** Highlight range in `name.text`, original characters. */
  readonly nameRange?: MatchRange;
  /** Tier 2: a plain-text window and the range to highlight in it. */
  readonly snippet?: { readonly text: string; readonly range: MatchRange };
}

/** Locate `query` (already folded) in `text`, mapped to original indices. */
export function findFolded(
  text: string,
  foldedQuery: string,
  options: { wordStart?: boolean } = {},
): MatchRange | null {
  if (!foldedQuery) return null;
  const { folded, map } = foldWithMap(text);
  let from = 0;
  for (;;) {
    const at = folded.indexOf(foldedQuery, from);
    if (at < 0) return null;
    if (!options.wordStart || !isWordChar(folded[at - 1])) {
      const start = map[at] ?? 0;
      const end = map[at + foldedQuery.length] ?? text.length;
      return [start, end];
    }
    from = at + 1;
  }
}

const SNIPPET_WIDTH = 80;

/** ~80 characters of `text` centred on `range`, with ellipses (GD-14). */
export function snippetAround(
  text: string,
  range: MatchRange,
): { text: string; range: MatchRange } {
  const [start, end] = range;
  const room = Math.max(0, SNIPPET_WIDTH - (end - start));
  let from = Math.max(0, start - Math.floor(room / 2));
  const to = Math.min(text.length, from + SNIPPET_WIDTH);
  from = Math.max(0, Math.min(from, to - SNIPPET_WIDTH));
  const lead = from > 0 ? '…' : '';
  const tail = to < text.length ? '…' : '';
  return {
    text: `${lead}${text.slice(from, to)}${tail}`,
    range: [start - from + lead.length, end - from + lead.length],
  };
}

/**
 * Rank the visible entries for a query. Empty query → every entry, A→Z. A
 * variant counts in the same tier as the term it belongs to (R11).
 */
export function searchGlossary(
  index: GlossaryIndex,
  query: string,
): GlossarySearchResult[] {
  const q = termKey(query);
  if (!q) return index.visible.map((entry) => ({ entry, tier: 0 as const }));
  const results: GlossarySearchResult[] = [];
  for (const entry of index.visible) {
    let best: GlossarySearchResult | undefined;
    for (const name of entry.names) {
      if (name.folded.startsWith(q)) {
        const range = findFolded(name.text, q);
        best = { entry, tier: 0, name, ...(range ? { nameRange: range } : {}) };
        break;
      }
      if (!best && name.folded.includes(q)) {
        const range = findFolded(name.text, q);
        best = { entry, tier: 1, name, ...(range ? { nameRange: range } : {}) };
      }
    }
    if (!best && entry.searchText.length > 0) {
      const plain = definitionPlainText(entry.body, '…');
      const range = findFolded(plain, q, { wordStart: true });
      if (range) best = { entry, tier: 2, snippet: snippetAround(plain, range) };
    }
    if (best) results.push(best);
  }
  return results.sort(
    (a, b) => a.tier - b.tier || compareTerms(a.entry, b.entry),
  );
}

// ---- Suggestions (W-8) ------------------------------------------------------------

function editDistance(a: string, b: string, cap: number): number {
  if (Math.abs(a.length - b.length) > cap) return cap + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i += 1) {
    const row = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const value = Math.min(
        (prev[j] ?? Infinity) + 1,
        (row[j - 1] ?? Infinity) + 1,
        (prev[j - 1] ?? Infinity) + cost,
      );
      row.push(value);
      rowMin = Math.min(rowMin, value);
    }
    if (rowMin > cap) return cap + 1;
    prev = row;
  }
  return prev[b.length] ?? cap + 1;
}

/**
 * "Did you mean …?" — the closest candidate within edit distance 1 (text of 5
 * characters or fewer) or 2 (longer), and nothing when two candidates tie:
 * a suggestion that might be the wrong one teaches people to ignore it.
 */
export function suggestTerm(
  text: string,
  candidates: readonly string[],
): string | null {
  const key = termKey(text);
  if (!key) return null;
  const cap = key.length <= 5 ? 1 : 2;
  let best: string | null = null;
  let bestDistance = cap + 1;
  let tie = false;
  const seen = new Set<string>();
  for (const candidate of candidates) {
    const folded = termKey(candidate);
    if (seen.has(folded)) continue;
    seen.add(folded);
    const d = editDistance(key, folded, cap);
    if (d > cap) continue;
    if (d < bestDistance) {
      best = candidate;
      bestDistance = d;
      tie = false;
    } else if (d === bestDistance) {
      tie = true;
    }
  }
  return best !== null && !tie ? best : null;
}

// ---- Cross-links (D3 as amended by UC1) ---------------------------------------------

interface LinkTarget {
  readonly id: string;
  readonly folded: string;
}

interface TextRun {
  type: 'text';
  text: string;
  marks?: { type: string; [key: string]: unknown }[];
}

function linkTargets(index: GlossaryIndex, selfId: string): LinkTarget[] {
  const self = index.byId.get(selfId);
  const selfNames = new Set(self?.names.map((n) => n.folded) ?? []);
  const targets: LinkTarget[] = [];
  for (const entry of index.visible) {
    for (const name of entry.names) {
      // A body never links to a word that names ITSELF — its own term or any
      // variant, which also covers its own entry (every name of it is here).
      if (name.folded && !selfNames.has(name.folded)) {
        targets.push({ id: entry.id, folded: name.folded });
      }
    }
  }
  // Longest first, so "unit rate" wins over "rate" where both match.
  return targets.sort((a, b) => b.folded.length - a.folded.length);
}

function linkRuns(
  runs: readonly unknown[],
  targets: readonly LinkTarget[],
  linked: Set<string>,
): unknown[] {
  const out: unknown[] = [];
  for (const node of runs) {
    const run = node as TextRun;
    const hasCode = run.marks?.some((m) => m.type === 'code') ?? false;
    if (run.type !== 'text' || typeof run.text !== 'string' || hasCode) {
      out.push(node);
      continue;
    }
    const { folded, map } = foldWithMap(run.text);
    const taken: [number, number, string][] = [];
    for (const target of targets) {
      if (linked.has(target.id)) continue;
      let from = 0;
      for (;;) {
        const at = folded.indexOf(target.folded, from);
        if (at < 0) break;
        const end = at + target.folded.length;
        const whole = !isWordChar(folded[at - 1]) && !isWordChar(folded[end]);
        const overlaps = taken.some(([s, e]) => at < e && end > s);
        if (whole && !overlaps) {
          taken.push([at, end, target.id]);
          linked.add(target.id);
          break;
        }
        from = at + 1;
      }
    }
    if (taken.length === 0) {
      out.push(node);
      continue;
    }
    taken.sort((a, b) => a[0] - b[0]);
    let cursor = 0;
    for (const [s, e, id] of taken) {
      const start = map[s] ?? 0;
      const end = map[e] ?? run.text.length;
      if (start > cursor) out.push({ ...run, text: run.text.slice(cursor, start) });
      out.push({
        ...run,
        text: run.text.slice(start, end),
        marks: [...(run.marks ?? []), { type: GLOSSARY_LINK_MARK, target: id }],
      });
      cursor = end;
    }
    if (cursor < run.text.length) out.push({ ...run, text: run.text.slice(cursor) });
  }
  return out;
}

function linkListItems(
  items: readonly Record<string, unknown>[],
  targets: readonly LinkTarget[],
  linked: Set<string>,
): Record<string, unknown>[] {
  return items.map((item) => ({
    ...item,
    content: linkRuns((item.content as unknown[]) ?? [], targets, linked),
    ...(Array.isArray(item.children)
      ? {
          children: (item.children as Record<string, unknown>[]).map((child) => ({
            ...child,
            items: linkListItems(
              (child.items as Record<string, unknown>[]) ?? [],
              targets,
              linked,
            ),
          })),
        }
      : {}),
  }));
}

/**
 * A copy of `blocks` where the FIRST whole-word occurrence of every other
 * visible entry's term or variant carries a `glossary_link` mark naming its
 * target (D3's rules: whole word, folded, first occurrence, never self).
 * Math, figures and code are never linked. The input is never mutated.
 */
export function linkify(
  blocks: readonly DefinitionBlock[],
  index: GlossaryIndex,
  selfId: string,
): DefinitionBlock[] {
  const targets = linkTargets(index, selfId);
  if (targets.length === 0) return [...blocks];
  const linked = new Set<string>();
  return blocks.map((block) => {
    switch (block.type) {
      case 'paragraph':
      case 'heading':
        return { ...block, content: linkRuns(block.content, targets, linked) };
      case 'bullet_list':
      case 'ordered_list':
        return {
          ...block,
          items: linkListItems(
            block.items as unknown as Record<string, unknown>[],
            targets,
            linked,
          ),
        };
      default:
        return block;
    }
  }) as DefinitionBlock[];
}

/** Ids of the entries a body links to — the importer's report count (UC1). */
export function crossLinkTargets(
  blocks: readonly DefinitionBlock[],
  index: GlossaryIndex,
  selfId: string,
): string[] {
  const ids: string[] = [];
  const walk = (value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    if (value === null || typeof value !== 'object') return;
    const obj = value as Record<string, unknown>;
    if (obj.type === GLOSSARY_LINK_MARK && typeof obj.target === 'string') {
      ids.push(obj.target);
    }
    Object.values(obj).forEach(walk);
  };
  walk(linkify(blocks, index, selfId));
  return ids;
}

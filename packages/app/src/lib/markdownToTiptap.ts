// =============================================================================
// markdownToTiptap.ts — Markdown → Tiptap JSONContent importer
// -----------------------------------------------------------------------------
// Turns pasted markdown into editor-ready Tiptap blocks. This is the shared
// converter described in docs/design/pdf-import.md: the queued PDF-import
// feature compiles a vision model's output to the same markdown surface and
// reuses this exact mapper, so the converter is intentionally standalone (no
// editor/DOM dependency) and exhaustively unit-tested.
//
// Why markdown-it: the strategic consumer is model-generated markdown (PDF
// import, and teachers drafting in an LLM). markdown-it IS CommonMark, so the
// whole class of "the model emitted valid markdown my hand-rolled parser
// choked on" bugs never arises. It is lazy-loaded (await import) so it stays
// off the initial editor bundle — the importer only runs behind the explicit
// Import dialog.
//
// markdown-it stays VANILLA (html:false, linkify:false). Our two custom
// constructs are resolved HERE, in the token→Tiptap mapper, never by patching
// markdown-it's rule chain:
//   - {{answer|alt1|alt2}}  → a `blank` inline atom (same sentinel grammar the
//                             editor's input rule already uses). A paragraph
//                             or list item carrying one becomes a fillInBlank.
//   - heading ending {checkpoint} → a checkpoint `sectionBreak` (title = the
//                             heading text). Plain headings stay heading blocks.
// `{`, `}`, `|` aren't markdown-special (tables off), so markdown-it passes
// them straight through as text and the two grammars never collide.
//
// Coverage is bounded by what the editor round-trips today (see serialize.ts):
// headings 1–3, paragraphs, bold/italic/code marks, nested bullet/ordered
// lists, blanks, checkpoint section breaks. Math ($…$) and images (![](url))
// are the planned fast-follow — deferred, not forgotten. Everything outside the
// supported set (code fences, blockquotes, tables, raw HTML, links, images)
// degrades gracefully to plain text / dropped attributes with a human-readable
// warning; it never throws and never corrupts the doc.
//
// The emitted JSONContent shapes match activityToTiptap's output exactly, so
// imported blocks round-trip through tiptapToActivity and render identically to
// authored ones.
// =============================================================================

import type { JSONContent } from '@tiptap/react';

// Minimal structural view of a markdown-it token — only the fields the mapper
// reads. Defined locally (rather than importing markdown-it's Token type) so
// the pure mapper stays independent of the library's type surface and the
// runtime stays the only place that touches markdown-it.
interface MdToken {
    type: string;
    tag: string;
    nesting: -1 | 0 | 1;
    content: string;
    markup: string;
    info: string;
    children: MdToken[] | null;
}

export interface ImportResult {
    // Block-level Tiptap nodes, ready to hand to editor.insertContent(). Empty
    // when the input has no importable content.
    blocks: JSONContent[];
    // Deduplicated, human-readable notes about anything that degraded (a code
    // fence flattened to text, a link's URL dropped, etc.). The dialog surfaces
    // these so the teacher knows what to fix by hand.
    warnings: string[];
}

export type MarkdownImporter = (markdown: string) => ImportResult;

// =============================================================================
// Public API — lazy-loaded, cached importer
// =============================================================================

let importerPromise: Promise<MarkdownImporter> | null = null;

// Resolves to a synchronous (markdown → ImportResult) function. markdown-it is
// dynamic-imported and the parser constructed once, then memoised — repeated
// calls (live preview + final import) reuse the same instance and never re-pay
// the import cost.
export function getMarkdownImporter(): Promise<MarkdownImporter> {
    if (!importerPromise) {
        importerPromise = (async () => {
            const { default: MarkdownIt } = await import('markdown-it');
            const md = new MarkdownIt({ html: false, linkify: false });
            return (markdown: string): ImportResult => {
                const tokens = md.parse(markdown, {}) as unknown as MdToken[];
                return tokensToBlocks(tokens);
            };
        })();
    }
    return importerPromise;
}

// =============================================================================
// Token stream → nested tree
// -----------------------------------------------------------------------------
// markdown-it emits a FLAT token stream with nesting markers (+1 open, -1
// close, 0 self-contained). Rebuild the nesting first so the mapper can recurse
// over a real tree instead of juggling an index cursor.
// =============================================================================

interface TokNode {
    token: MdToken;
    children: TokNode[];
}

function nest(tokens: MdToken[]): TokNode[] {
    const rootChildren: TokNode[] = [];
    const stack: TokNode[] = [{ token: ROOT_TOKEN, children: rootChildren }];
    for (const token of tokens) {
        const top = stack[stack.length - 1]!;
        if (token.nesting === 1) {
            const node: TokNode = { token, children: [] };
            top.children.push(node);
            stack.push(node);
        } else if (token.nesting === -1) {
            if (stack.length > 1) stack.pop();
        } else {
            top.children.push({ token, children: [] });
        }
    }
    return rootChildren;
}

const ROOT_TOKEN: MdToken = {
    type: 'root',
    tag: '',
    nesting: 0,
    content: '',
    markup: '',
    info: '',
    children: null,
};

// =============================================================================
// Custom syntax — the two grammars the DSL adds on top of CommonMark
// =============================================================================

// Reuses the editor input rule's sentinel grammar (Blank.ts BLANK_INPUT_REGEX),
// un-anchored + global so it matches blanks anywhere in a run of text, not just
// at a line end. A fresh RegExp per use keeps the stateful `lastIndex` from
// leaking between calls.
const BLANK_PATTERN = '\\{\\{([^{}|]+)((?:\\|[^{}|]+)*)\\}\\}';
function blankMatcher(): RegExp {
    return new RegExp(BLANK_PATTERN, 'g');
}

// A trailing {checkpoint} marker on a heading promotes it to a checkpoint
// section break. Case-insensitive, tolerant of surrounding whitespace.
const CHECKPOINT_RE = /\s*\{checkpoint\}\s*$/i;

// =============================================================================
// Block mapping
// =============================================================================

interface Ctx {
    warnings: Set<string>;
}

function tokensToBlocks(tokens: MdToken[]): ImportResult {
    const ctx: Ctx = { warnings: new Set() };
    const blocks = mapBlocks(nest(tokens), ctx);
    return { blocks, warnings: [...ctx.warnings] };
}

// A single token node can expand to zero, one, or several blocks (a blockquote
// unwraps to its inner blocks; a blank-bearing list flattens to one fillInBlank
// per item), so every block mapper returns an array and we flatten.
function mapBlocks(nodes: TokNode[], ctx: Ctx): JSONContent[] {
    const out: JSONContent[] = [];
    for (const node of nodes) {
        for (const block of mapBlock(node, ctx)) out.push(block);
    }
    return out;
}

function mapBlock(node: TokNode, ctx: Ctx): JSONContent[] {
    switch (node.token.type) {
        case 'heading_open':
            return [mapHeading(node, ctx)];
        case 'paragraph_open':
            return [mapParagraph(node, ctx)];
        case 'bullet_list_open':
            return mapList(node, 'bulletList', ctx);
        case 'ordered_list_open':
            return mapList(node, 'orderedList', ctx);

        case 'fence':
        case 'code_block':
            ctx.warnings.add(
                'Code blocks aren’t supported yet — imported as plain text.',
            );
            return [rawTextParagraph(node.token.content)];

        case 'blockquote_open':
            ctx.warnings.add(
                'Block quotes aren’t supported yet — imported as plain paragraphs.',
            );
            // Unwrap: emit the quote's inner blocks directly.
            return mapBlocks(node.children, ctx);

        case 'table_open':
            ctx.warnings.add(
                'Tables aren’t supported yet — imported as plain text.',
            );
            return [{ type: 'paragraph', content: textRun(collectText(node)) }];

        case 'html_block':
            ctx.warnings.add('Raw HTML isn’t supported — imported as plain text.');
            return [rawTextParagraph(node.token.content)];

        case 'hr':
            // Thematic break — no editor equivalent; drop quietly.
            return [];

        default:
            return [];
    }
}

function mapHeading(node: TokNode, ctx: Ctx): JSONContent {
    const inline = findInline(node);
    const plain = inline ? plainText(inline.children ?? []) : '';

    // Trailing {checkpoint} → a checkpoint section break, not a heading block.
    if (CHECKPOINT_RE.test(plain)) {
        return sectionBreakNode(plain.replace(CHECKPOINT_RE, '').trim(), true);
    }

    return {
        type: 'heading',
        attrs: { level: headingLevel(node.token.tag) },
        content: inline ? mapInline(inline.children ?? [], ctx, false) : [],
    };
}

function mapParagraph(node: TokNode, ctx: Ctx): JSONContent {
    const inline = findInline(node);
    const content = inline ? mapInline(inline.children ?? [], ctx, true) : [];
    return blockFromInline(content);
}

// A paragraph whose inline content carries a blank can't be a `paragraph`
// (blanks live only inside fillInBlank per the schema), so it becomes a
// fillInBlank block; otherwise a plain paragraph.
function blockFromInline(content: JSONContent[]): JSONContent {
    return content.some((n) => n.type === 'blank')
        ? fillInBlankNode(content)
        : { type: 'paragraph', content };
}

function fillInBlankNode(content: JSONContent[]): JSONContent {
    // fillInBlank content is (text | mathInline | blank)* — no hardBreak. A soft
    // or hard break inside a problem statement becomes a space so the node stays
    // schema-valid in the editor; merge so the new space joins its neighbour.
    const sanitized = mergeText(
        content.map((n) =>
            n.type === 'hardBreak' ? { type: 'text', text: ' ' } : n,
        ),
    );
    return {
        type: 'fillInBlank',
        attrs: {
            id: crypto.randomUUID(),
            solution: null,
            hasConfidenceRating: false,
            skills: [],
            workSpace: null,
        },
        content: sanitized,
    };
}

// =============================================================================
// Lists
// -----------------------------------------------------------------------------
// "Paste a numbered list of problems and get problem blocks" (ROADMAP.md:48) is
// the core use case, so a list whose items contain blanks flattens to one
// fillInBlank per item (the list marker is dropped — a problem isn't a list
// item in this model). A list with no blanks stays an ordinary nested list.
// =============================================================================

function mapList(
    node: TokNode,
    listType: 'bulletList' | 'orderedList',
    ctx: Ctx,
): JSONContent[] {
    if (subtreeHasBlank(node)) return flattenListToProblems(node, ctx);
    return [
        {
            type: listType,
            content: listItems(node).map((item) => mapListItem(item, ctx)),
        },
    ];
}

function flattenListToProblems(node: TokNode, ctx: Ctx): JSONContent[] {
    const out: JSONContent[] = [];
    for (const item of listItems(node)) {
        const para = item.children.find((c) => c.token.type === 'paragraph_open');
        const inline = para ? findInline(para) : null;
        const content = inline ? mapInline(inline.children ?? [], ctx, true) : [];
        if (
            item.children.some(
                (c) =>
                    c.token.type === 'bullet_list_open' ||
                    c.token.type === 'ordered_list_open',
            )
        ) {
            ctx.warnings.add(
                'Nested list items under a problem were dropped on import.',
            );
        }
        out.push(blockFromInline(content));
    }
    return out;
}

function mapListItem(item: TokNode, ctx: Ctx): JSONContent {
    const content: JSONContent[] = [];
    for (const child of item.children) {
        if (child.token.type === 'paragraph_open') {
            const inline = findInline(child);
            content.push({
                type: 'paragraph',
                content: inline ? mapInline(inline.children ?? [], ctx, false) : [],
            });
        } else if (child.token.type === 'bullet_list_open') {
            for (const b of mapList(child, 'bulletList', ctx)) content.push(b);
        } else if (child.token.type === 'ordered_list_open') {
            for (const b of mapList(child, 'orderedList', ctx)) content.push(b);
        }
    }
    // A listItem must hold at least one block (mirrors serialize.ts).
    if (content.length === 0) content.push({ type: 'paragraph' });
    return { type: 'listItem', content };
}

function listItems(node: TokNode): TokNode[] {
    return node.children.filter((c) => c.token.type === 'list_item_open');
}

function subtreeHasBlank(node: TokNode): boolean {
    const re = new RegExp(BLANK_PATTERN);
    const visit = (n: TokNode): boolean => {
        if (n.token.type === 'inline' && re.test(n.token.content)) return true;
        return n.children.some(visit);
    };
    return visit(node);
}

// =============================================================================
// Inline mapping
// =============================================================================

// Walks an inline token's children, tracking the active mark stack, into Tiptap
// inline nodes. `allowBlanks` gates {{…}} parsing — true for paragraphs/list
// items (where a blank promotes the block to a fillInBlank), false for headings
// (which can't hold blanks, so the sentinel stays literal text).
function mapInline(
    tokens: MdToken[],
    ctx: Ctx,
    allowBlanks: boolean,
): JSONContent[] {
    const out: JSONContent[] = [];
    const marks: string[] = [];
    let warnedLink = false;

    for (const tok of tokens) {
        switch (tok.type) {
            case 'text':
                pushText(out, tok.content, marks, allowBlanks);
                break;
            case 'strong_open':
                marks.push('bold');
                break;
            case 'strong_close':
                removeLast(marks, 'bold');
                break;
            case 'em_open':
                marks.push('italic');
                break;
            case 'em_close':
                removeLast(marks, 'italic');
                break;
            case 'code_inline':
                out.push(textNode(tok.content, [...marks, 'code']));
                break;
            case 's_open':
            case 's_close':
                ctx.warnings.add('Strikethrough isn’t supported and was removed.');
                break;
            case 'softbreak':
                // CommonMark soft break renders as a space.
                pushText(out, ' ', marks, false);
                break;
            case 'hardbreak':
                out.push({ type: 'hardBreak' });
                break;
            case 'link_open':
            case 'link_close':
                if (!warnedLink) {
                    ctx.warnings.add(
                        'Links aren’t supported — kept the text, dropped the URL.',
                    );
                    warnedLink = true;
                }
                break;
            case 'image':
                ctx.warnings.add(
                    'Images can’t be imported yet — add them with the image block.',
                );
                break;
            default:
                // Unknown inline (e.g. html_inline with html:false) → keep text.
                if (tok.content) pushText(out, tok.content, marks, allowBlanks);
                break;
        }
    }
    return mergeText(out);
}

// Coalesce consecutive text nodes carrying identical marks into one. markdown-it
// emits a separate text token on each side of a soft break, link, etc.; merging
// yields the compact single-run JSON the editor would have stored from authored
// content (and ProseMirror would merge on insert anyway).
function mergeText(nodes: JSONContent[]): JSONContent[] {
    const out: JSONContent[] = [];
    for (const node of nodes) {
        const prev = out[out.length - 1];
        if (
            node.type === 'text' &&
            prev &&
            prev.type === 'text' &&
            sameMarks(prev, node)
        ) {
            prev.text = (prev.text ?? '') + (node.text ?? '');
        } else {
            out.push(node.type === 'text' ? { ...node } : node);
        }
    }
    return out;
}

function sameMarks(a: JSONContent, b: JSONContent): boolean {
    return JSON.stringify(a.marks ?? []) === JSON.stringify(b.marks ?? []);
}

// Splits a text run on the {{…}} sentinel into text + blank nodes. When blanks
// aren't allowed (headings), or a match has an empty canonical answer, the
// sentinel is kept as literal text.
function pushText(
    out: JSONContent[],
    text: string,
    marks: string[],
    allowBlanks: boolean,
): void {
    if (!allowBlanks) {
        if (text.length > 0) out.push(textNode(text, marks));
        return;
    }
    const re = blankMatcher();
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
        const before = text.slice(last, m.index);
        if (before.length > 0) out.push(textNode(before, marks));
        const blank = makeBlank(m);
        out.push(blank ?? textNode(m[0], marks));
        last = m.index + m[0].length;
    }
    const rest = text.slice(last);
    if (rest.length > 0) out.push(textNode(rest, marks));
}

function makeBlank(m: RegExpExecArray): JSONContent | null {
    const canonical = (m[1] ?? '').trim();
    if (canonical.length === 0) return null;
    const acceptableAnswers = (m[2] ?? '')
        .split('|')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    return {
        type: 'blank',
        attrs: { id: crypto.randomUUID(), answer: canonical, acceptableAnswers },
    };
}

function textNode(text: string, marks: string[]): JSONContent {
    const unique = [...new Set(marks)];
    return unique.length > 0
        ? { type: 'text', text, marks: unique.map((type) => ({ type })) }
        : { type: 'text', text };
}

// A plain (mark-free, blank-free) inline run from a string.
function textRun(text: string): JSONContent[] {
    return text.length > 0 ? [{ type: 'text', text }] : [];
}

// =============================================================================
// Small helpers
// =============================================================================

function findInline(node: TokNode): MdToken | null {
    const child = node.children.find((c) => c.token.type === 'inline');
    return child ? child.token : null;
}

function headingLevel(tag: string): 1 | 2 | 3 {
    const n = Number(tag.slice(1));
    if (n <= 1) return 1;
    if (n === 2) return 2;
    return 3; // h3–h6 clamp to the editor's deepest level
}

function sectionBreakNode(title: string, isCheckpoint: boolean): JSONContent {
    return {
        type: 'sectionBreak',
        attrs: { title: title.length > 0 ? title : null, isCheckpoint },
    };
}

// Flattened plain text of an inline token's children (marks stripped, breaks →
// space). Used for the section-break title and degraded table/HTML fallbacks.
function plainText(tokens: MdToken[]): string {
    let s = '';
    for (const t of tokens) {
        if (t.type === 'text' || t.type === 'code_inline') s += t.content;
        else if (t.type === 'softbreak' || t.type === 'hardbreak') s += ' ';
    }
    return s;
}

// Whole-subtree plain text — walks every inline descendant. Degraded fallback
// for unsupported container blocks (tables).
function collectText(node: TokNode): string {
    const parts: string[] = [];
    const visit = (n: TokNode) => {
        if (n.token.type === 'inline') parts.push(plainText(n.token.children ?? []));
        n.children.forEach(visit);
    };
    visit(node);
    return parts.filter((p) => p.length > 0).join(' ');
}

// A paragraph from raw multi-line text (code fence / HTML fallback), preserving
// line breaks as hardBreaks.
function rawTextParagraph(text: string): JSONContent {
    const lines = text.replace(/\n+$/, '').split('\n');
    const content: JSONContent[] = [];
    lines.forEach((line, i) => {
        if (i > 0) content.push({ type: 'hardBreak' });
        if (line.length > 0) content.push({ type: 'text', text: line });
    });
    return { type: 'paragraph', content };
}

function removeLast(arr: string[], value: string): void {
    const i = arr.lastIndexOf(value);
    if (i >= 0) arr.splice(i, 1);
}

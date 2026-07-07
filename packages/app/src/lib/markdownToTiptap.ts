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
// them straight through as text and the two grammars never collide. Math `$…$`
// is likewise plain text to markdown-it and resolved here, with a Pandoc-style
// guard so currency ("$5 and $10") isn't mistaken for math.
//
// Coverage is bounded by what the editor round-trips today (see serialize.ts):
// headings 1–3, paragraphs, bold/italic/code marks, nested bullet/ordered
// lists, blanks, checkpoint section breaks, $inline$/$$display$$ math
// (mathInline/mathBlock), and ![alt](url) images (lifted out of the paragraph
// into an image block). Everything outside the supported set (code fences,
// blockquotes, tables, raw HTML, links) degrades gracefully to plain text /
// dropped attributes with a human-readable warning; it never throws and never
// corrupts the doc.
//
// The emitted JSONContent shapes match activityToTiptap's output exactly, so
// imported blocks round-trip through tiptapToActivity and render identically to
// authored ones.
// =============================================================================

import { parseGraphFormula, parsePointList } from '@activity/graph-kit';
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
    attrs: [string, string][] | null;
}

function attrGet(tok: MdToken, name: string): string | null {
    if (!tok.attrs) return null;
    for (const [k, v] of tok.attrs) if (k === name) return v;
    return null;
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
                // Unwrap a whole-paste ```markdown fence (LLM safety net), then
                // pull math out of the RAW source first (see extractMath) so LaTeX
                // backslashes/underscores survive markdown-it's CommonMark
                // escaping, then parse the placeholdered text.
                const { text, spans } = extractMath(stripMarkdownFence(markdown));
                const tokens = md.parse(text, {}) as unknown as MdToken[];
                return tokensToBlocks(tokens, spans);
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
    attrs: null,
};

// =============================================================================
// Custom syntax — the two grammars the DSL adds on top of CommonMark
// =============================================================================

// Plain blank pattern (no capture names) used only for *detecting* whether a
// list subtree carries a blank. Mirrors the editor input rule's sentinel
// grammar (Blank.ts BLANK_INPUT_REGEX), un-anchored.
const BLANK_PATTERN = '\\{\\{[^{}|]+(?:\\|[^{}|]+)*\\}\\}';

// ---- Math (handled BEFORE markdown-it) --------------------------------------
// Math is the one construct that can't be resolved purely in the mapper: LaTeX
// is full of backslashes (\,, \frac, \sum), underscores and carets that
// CommonMark's backslash-escape and emphasis rules would corrupt in the text
// tokens. So we lift $…$ / $$…$$ out of the RAW source up front, swap each for a
// Private-Use placeholder that markdown-it forwards untouched, and re-expand the
// placeholder into a math node in the mapper. A code span/fence in the same scan
// is matched and left alone, so `$x$` inside backticks is not treated as math.
const MATH_OPEN = String.fromCharCode(0xe000);
const MATH_CLOSE = String.fromCharCode(0xe001);

interface MathSpan {
    latex: string;
    display: boolean;
}

// Safety net for AI-generated input. Teachers are told to ask the model to wrap
// its whole reply in a fenced code block (so the chat shows a Copy button that
// yields raw, unrendered Markdown). The Copy button normally strips the fence,
// but if a paste arrives wrapped entirely in a ```markdown / ```md fence, unwrap
// it here. Scoped to a markdown-tagged OUTER fence so a plain ``` code block in
// the middle of content is still treated as code and flattened, not unwrapped.
function stripMarkdownFence(src: string): string {
    const m = /^\s*```(?:markdown|md)[^\n]*\n([\s\S]*?)\n```\s*$/i.exec(src);
    return m ? m[1]! : src;
}

// Order matters: code spans first (so their `$` is protected), then $$display$$
// (longest delimiter), then $inline$ with a Pandoc-style guard — opening `$`
// followed by a non-space, closing `$` preceded by a non-space and not followed
// by a digit — so "$5 and $10" / "it costs $20" never read as math.
const MATH_SCAN =
    /(`+)([\s\S]*?)\1|\$\$([\s\S]+?)\$\$|\$(?=\S)([^$\n]*?\S)\$(?!\d)/g;

function extractMath(src: string): { text: string; spans: MathSpan[] } {
    const spans: MathSpan[] = [];
    const text = src.replace(
        MATH_SCAN,
        (match, codeTicks, _codeInner, display, inline) => {
            if (codeTicks !== undefined) return match; // code span/fence — leave as-is
            const latex = (display ?? inline ?? '').trim();
            if (latex.length === 0) return match;
            const i = spans.length;
            spans.push({ latex, display: display !== undefined });
            return `${MATH_OPEN}${i}${MATH_CLOSE}`;
        },
    );
    return { text, spans };
}

// Named-group subpattern for the combined inline tokenizer (emitInline). The
// blank grammar matches the editor's sentinel; the placeholder group captures a
// pre-extracted math span's index.
const BLANK_SUB =
    '\\{\\{(?<blankCanon>[^{}|]+)(?<blankAlts>(?:\\|[^{}|]+)*)\\}\\}';
const MATH_PLACEHOLDER_SUB = `${MATH_OPEN}(?<mathIdx>\\d+)${MATH_CLOSE}`;

function inlineMatcher(allowBlanks: boolean): RegExp {
    const pattern = allowBlanks
        ? `(?:${BLANK_SUB})|(?:${MATH_PLACEHOLDER_SUB})`
        : `(?:${MATH_PLACEHOLDER_SUB})`;
    return new RegExp(pattern, 'g');
}

// A paragraph whose entire text is a single display-math placeholder becomes a
// block-level mathBlock (rather than an inline mathInline).
const SOLE_DISPLAY_RE = new RegExp(`^${MATH_OPEN}(\\d+)${MATH_CLOSE}$`);

// A trailing {checkpoint} marker on a heading promotes it to a checkpoint
// section break. Case-insensitive, tolerant of surrounding whitespace.
const CHECKPOINT_RE = /\s*\{checkpoint\}\s*$/i;

// =============================================================================
// Block mapping
// =============================================================================

interface Ctx {
    warnings: Set<string>;
    // Math spans lifted from the raw source (see extractMath), indexed by the
    // placeholder number the mapper re-expands.
    spans: MathSpan[];
}

function tokensToBlocks(tokens: MdToken[], spans: MathSpan[]): ImportResult {
    const ctx: Ctx = { warnings: new Set(), spans };
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
            return mapParagraphBlocks(node, ctx);
        case 'bullet_list_open':
            return mapList(node, 'bulletList', ctx);
        case 'ordered_list_open':
            return mapList(node, 'orderedList', ctx);

        case 'fence': {
            // ```graph fenced blocks are the graph DSL (Drop 7); other fences
            // stay unsupported.
            if ((node.token.info ?? '').trim() === 'graph') {
                const graph = parseGraphFence(node.token.content, ctx);
                if (graph) return [graph];
                return [rawTextParagraph(node.token.content)];
            }
            ctx.warnings.add(
                'Code blocks aren’t supported yet — imported as plain text.',
            );
            return [rawTextParagraph(node.token.content)];
        }
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

// A paragraph can yield several blocks: a whole-paragraph $$…$$ is a display
// math block; an inline image lifts out into its own image block (block-level
// per the schema), so the paragraph is split around it into text-paragraph(s)
// and image block(s), in document order.
function mapParagraphBlocks(node: TokNode, ctx: Ctx): JSONContent[] {
    const inline = findInline(node);
    if (!inline) return [];
    const children = inline.children ?? [];

    // A paragraph that is solely a display-math placeholder → a mathBlock.
    const sole = SOLE_DISPLAY_RE.exec(plainText(children).trim());
    const soleSpan = sole ? ctx.spans[Number(sole[1])] : undefined;
    if (soleSpan?.display) {
        return [{ type: 'mathBlock', attrs: { latex: soleSpan.latex } }];
    }

    const out: JSONContent[] = [];
    let buffer: MdToken[] = [];
    const flush = () => {
        if (buffer.length === 0) return;
        const content = mapInline(buffer, ctx, true);
        if (content.length > 0) out.push(blockFromInline(content));
        buffer = [];
    };
    for (const tok of children) {
        if (tok.type === 'image') {
            flush();
            const img = imageBlock(tok, ctx);
            if (img) out.push(img);
        } else {
            buffer.push(tok);
        }
    }
    flush();
    return out;
}

// A paragraph whose inline content carries a blank can't be a `paragraph`
// (blanks live only inside fillInBlank per the schema), so it becomes a
// fillInBlank block; otherwise a plain paragraph.
function blockFromInline(content: JSONContent[]): JSONContent {
    return content.some((n) => n.type === 'blank')
        ? fillInBlankNode(content)
        : { type: 'paragraph', content };
}

function imageBlock(tok: MdToken, ctx: Ctx): JSONContent | null {
    const src = (attrGet(tok, 'src') ?? '').trim();
    if (src.length === 0) {
        ctx.warnings.add('An image with no URL was skipped.');
        return null;
    }
    // markdown-it stores the alt text on the image token's `content`.
    return {
        type: 'image',
        attrs: { id: crypto.randomUUID(), src, alt: tok.content ?? '', caption: '' },
    };
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
                emitInline(out, tok.content, marks, allowBlanks, ctx);
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
                emitInline(out, ' ', marks, allowBlanks, ctx);
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
                // Paragraph images are lifted to image blocks before mapInline
                // sees them; reaching here means a heading or list item, where an
                // image block can't be placed.
                ctx.warnings.add(
                    'Images in headings or list items were skipped — put each image in its own paragraph.',
                );
                break;
            default:
                // Unknown inline (e.g. html_inline with html:false) → keep text.
                if (tok.content)
                    emitInline(out, tok.content, marks, allowBlanks, ctx);
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

// Splits a text run on the inline sentinels — {{blank}} (when allowed) and the
// pre-extracted math placeholder — into text + atom nodes, leftmost match
// winning. A blank with an empty canonical answer is kept as literal text. Math
// placeholders resolve in any inline context (paragraphs, headings, list items);
// blanks only where allowed.
function emitInline(
    out: JSONContent[],
    text: string,
    marks: string[],
    allowBlanks: boolean,
    ctx: Ctx,
): void {
    const re = inlineMatcher(allowBlanks);
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
        const before = text.slice(last, m.index);
        if (before.length > 0) out.push(textNode(before, marks));

        const g = m.groups ?? {};
        if (g.blankCanon !== undefined) {
            const blank = makeBlank(g.blankCanon, g.blankAlts ?? '');
            out.push(blank ?? textNode(m[0], marks));
        } else if (g.mathIdx !== undefined) {
            // A display span appearing mid-text can't be a block here, so it
            // renders inline; a standalone display paragraph was already caught
            // by mapParagraphBlocks.
            const span = ctx.spans[Number(g.mathIdx)];
            out.push(
                span
                    ? { type: 'mathInline', attrs: { latex: span.latex } }
                    : textNode(m[0], marks),
            );
        } else {
            out.push(textNode(m[0], marks));
        }

        last = m.index + m[0].length;
        if (re.lastIndex === m.index) re.lastIndex++; // defensive: no zero-width loop
    }
    const rest = text.slice(last);
    if (rest.length > 0) out.push(textNode(rest, marks));
}

function makeBlank(canonRaw: string, altsRaw: string): JSONContent | null {
    let canonical = canonRaw.trim();
    // A leading ~ marks the blank as interchangeable with the PREVIOUS blank in
    // the same problem — order-independent grouping (e.g. factoring, where
    // (x+2)(x+3) and (x+3)(x+2) are both correct). Strip it from the answer.
    // The renderer ignores the flag on the first blank of a problem (nothing to
    // group with), so a stray ~ on the first blank is harmless.
    let interchangeableWithPrevious = false;
    if (canonical.startsWith('~')) {
        interchangeableWithPrevious = true;
        canonical = canonical.slice(1).trim();
    }
    if (canonical.length === 0) return null;
    const acceptableAnswers = altsRaw
        .split('|')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    return {
        type: 'blank',
        attrs: {
            id: crypto.randomUUID(),
            answer: canonical,
            acceptableAnswers,
            interchangeableWithPrevious,
        },
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

// =============================================================================
// ```graph fence (Drop 7) — the markdown graph DSL
// -----------------------------------------------------------------------------
// One line per statement; everything after the keyword rides the SAME freeform
// parser the editor answer field uses (parseGraphFormula), so any equation
// format works here too. Example:
//
//   ```graph
//   axes: -10..10, -10..10
//   prompt: Graph the inequality.
//   answer: y > 2x + 1
//   show: point (2, 3) closed
//   options: partial-credit, allow-no-solution
//   ```
//
// answer forms: an equation (plot_function), an inequality (graph_inequality),
// a point list (plot_point), `region (x,y), …` (shade_region), or `none`
// (no-solution trick question, with allow-no-solution implied).
// show forms: `point (x, y) [open|closed] ["label"]`, `line/curve <equation>
// [dashed]`, `expression <formula> [dashed]`, `segment (a,b) (c,d)`,
// `ray (a,b) (c,d) [open|closed]`, `region (x,y), …`.
// No answer lines → a display (static) graph.
// =============================================================================

function parseGraphFence(src: string, ctx: Ctx): JSONContent | null {
    const axis = { xMin: -10, xMax: 10, yMin: -10, yMax: 10, xGridStep: 1, yGridStep: 1, showGrid: true, snapToGrid: true };
    let interaction: Record<string, unknown> | null = null;
    const drawables: Record<string, unknown>[] = [];
    let prompt = '';
    let partialCredit = false;
    let allowNoSolution = false;
    let noSolutionCorrect = false;
    const fail = (msg: string): null => {
        ctx.warnings.add('Graph block: ' + msg + ' — imported as plain text.');
        return null;
    };
    const pointList = (text: string): [number, number][] | null => parsePointList(text);

    for (const rawLine of src.split('\n')) {
        const line = rawLine.trim();
        if (!line) continue;
        const m = /^(axes|prompt|answer|show|options):\s*(.*)$/i.exec(line);
        if (!m) return fail(`unrecognized line "${line}"`);
        const value = (m[2] ?? '').trim();
        switch ((m[1] ?? '').toLowerCase()) {
            case 'axes': {
                const a = /^(-?[\d.]+)\s*\.\.\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\.\.\s*(-?[\d.]+)$/.exec(value);
                if (!a) return fail('axes must look like "-10..10, -10..10"');
                axis.xMin = Number(a[1]); axis.xMax = Number(a[2]);
                axis.yMin = Number(a[3]); axis.yMax = Number(a[4]);
                break;
            }
            case 'prompt':
                prompt = value;
                break;
            case 'options':
                for (const opt of value.split(',').map((o) => o.trim().toLowerCase())) {
                    if (opt === 'partial-credit') partialCredit = true;
                    else if (opt === 'allow-no-solution') allowNoSolution = true;
                    else if (opt === 'no-solution-correct') { allowNoSolution = true; noSolutionCorrect = true; }
                    else if (opt) return fail(`unknown option "${opt}"`);
                }
                break;
            case 'answer': {
                if (interaction) return fail('multiple answer lines (systems are a future addition)');
                if (/^none$/i.test(value)) {
                    allowNoSolution = true;
                    noSolutionCorrect = true;
                    interaction = { type: 'plot_point', correctPoints: [[0, 0]], tolerance: 0.1 };
                    break;
                }
                const regionMatch = /^region\s+(.+)$/i.exec(value);
                if (regionMatch) {
                    const verts = pointList(regionMatch[1] ?? '');
                    if (!verts || verts.length < 3) return fail('a region needs at least 3 vertices');
                    interaction = { type: 'shade_region', regions: [{ correctVertices: verts, minOverlap: 0.9 }] };
                    break;
                }
                const parsed = parseGraphFormula(value);
                if (parsed.kind === 'points') {
                    interaction = { type: 'plot_point', correctPoints: parsed.points, tolerance: 0.1 };
                } else if (parsed.kind === 'inequality') {
                    interaction = {
                        type: 'graph_inequality',
                        inequalities: [{ boundary: parsed.boundary, strict: parsed.strict, shadeSide: parsed.side }],
                    };
                } else if (parsed.kind === 'function') {
                    interaction = {
                        type: 'plot_function',
                        models: [parsed.model],
                        ...(parsed.domain ? { domains: [parsed.domain] } : {}),
                    };
                } else {
                    return fail(parsed.message);
                }
                break;
            }
            case 'show': {
                const style = /\bdashed\b/i.test(value) ? 'dashed' : undefined;
                const label = /"([^"]*)"/.exec(value)?.[1];
                const endpoint = /\bopen\b/i.test(value) ? 'open' : /\bclosed\b/i.test(value) ? 'closed' : undefined;
                const body = value.replace(/\bdashed\b|\bopen\b|\bclosed\b|"[^"]*"/gi, '').trim();
                const kindMatch = /^(point|line|curve|expression|segment|ray|region)\s+(.+)$/i.exec(body);
                if (!kindMatch) return fail(`unrecognized show line "${value}"`);
                const kind = (kindMatch[1] ?? '').toLowerCase();
                const rest = (kindMatch[2] ?? '').trim();
                if (kind === 'point') {
                    const pts = pointList(rest);
                    if (!pts || pts.length !== 1) return fail('show point needs one (x, y)');
                    drawables.push({ kind: 'point', at: pts[0], ...(label ? { label } : {}), ...(endpoint ? { style: endpoint } : {}) });
                } else if (kind === 'segment' || kind === 'ray') {
                    const pts = pointList(rest);
                    if (!pts || pts.length !== 2) return fail(`show ${kind} needs two points`);
                    if (kind === 'segment') drawables.push({ kind, from: pts[0], to: pts[1] });
                    else drawables.push({ kind, from: pts[0], through: pts[1], ...(endpoint ? { fromStyle: endpoint } : {}) });
                } else if (kind === 'region') {
                    const verts = pointList(rest);
                    if (!verts || verts.length < 3) return fail('show region needs at least 3 vertices');
                    drawables.push({ kind: 'polygon', vertices: verts, filled: true });
                } else if (kind === 'expression') {
                    drawables.push({ kind: 'expression', expression: rest, ...(style ? { style } : {}) });
                } else {
                    // line / curve: freeform equation or inequality (pictured).
                    const parsed = parseGraphFormula(rest);
                    if (parsed.kind === 'function') {
                        drawables.push({ kind: 'curve', model: parsed.model, ...(style ? { style } : {}), ...(parsed.domain ? { domain: parsed.domain } : {}) });
                    } else if (parsed.kind === 'inequality') {
                        drawables.push({
                            kind: 'curve', model: parsed.boundary,
                            style: parsed.strict ? 'dashed' : (style ?? 'solid'),
                            shade: parsed.side,
                        });
                    } else {
                        // Anything else plots as a sampled expression.
                        drawables.push({ kind: 'expression', expression: rest, ...(style ? { style } : {}) });
                    }
                }
                break;
            }
        }
    }

    if (!interaction && drawables.length === 0) return fail('empty graph block');
    const finalInteraction = interaction ?? { type: 'display', drawables };
    if (interaction && drawables.length > 0) {
        // A graded answer + show lines: the shows aren't renderable inside a
        // graded block yet (stimulus-with-drawables is a future addition), so
        // surface that rather than silently dropping them.
        ctx.warnings.add('Graph block: show lines alongside an answer aren’t drawn yet (coming with graded stimuli).');
    }
    return {
        type: 'interactiveGraph',
        attrs: {
            id: '',
            axisConfig: axis,
            interaction: finalInteraction,
            solution: null,
            partialCredit,
            allowNoSolution,
            noSolutionCorrect,
            hasConfidenceRating: false,
            skills: [],
        },
        content: prompt ? [{ type: 'text', text: prompt }] : [],
    };
}

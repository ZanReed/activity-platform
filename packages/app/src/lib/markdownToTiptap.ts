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

import { parseGraphFormula, parsePointList, parseRaySegment } from '@activity/graph-kit';
import type { JSONContent } from '@tiptap/react';
import type { InlineNode } from '@activity/schema';
import { tiptapInlineToActivity } from './serialize';
import { toCurveDomain } from './graphDomain';
import { parseNumberLineInterval } from '../editor/numberLineFormula';
import { parseBlankSpec } from './blankSyntax';

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
// `[[term :: definition]]` inline vocabulary definition. `[[`/`]]` pass through
// markdown-it untouched (a bracket run with no `(url)`/reference is literal
// text), so — like blanks and math — it is resolved HERE, post-tokenization.
// The inner run forbids brackets, so definitions never nest.
const DEFINITION_SUB = '\\[\\[(?<defInner>[^\\[\\]]+)\\]\\]';

function inlineMatcher(allowBlanks: boolean): RegExp {
    // Math placeholders + definitions resolve in ANY inline context; blanks only
    // where a blank is allowed (paragraphs / list items, not headings).
    const base = `(?:${MATH_PLACEHOLDER_SUB})|(?:${DEFINITION_SUB})`;
    const pattern = allowBlanks ? `(?:${BLANK_SUB})|${base}` : base;
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
            // Tagged fences are block DSLs — ```graph (Drop 7), ```mc,
            // ```match, ```order, ```dataplot, ```numberline, and the Phase 2
            // pedagogical blocks ```objectives / ```explain / ```worked /
            // ```faded; other fences stay unsupported.
            if ((node.token.info ?? '').trim() === 'graph') {
                const graph = parseGraphFence(node.token.content, ctx);
                if (graph) return [graph];
                return [rawTextParagraph(node.token.content)];
            }
            if ((node.token.info ?? '').trim() === 'mc') {
                const mc = parseMcFence(node.token.content, ctx);
                if (mc) return [mc];
                return [rawTextParagraph(node.token.content)];
            }
            if ((node.token.info ?? '').trim() === 'match') {
                const match = parseMatchFence(node.token.content, ctx);
                if (match) return [match];
                return [rawTextParagraph(node.token.content)];
            }
            if ((node.token.info ?? '').trim() === 'order') {
                const order = parseOrderFence(node.token.content, ctx);
                if (order) return [order];
                return [rawTextParagraph(node.token.content)];
            }
            if ((node.token.info ?? '').trim() === 'dataplot') {
                const dataPlot = parseDataPlotFence(node.token.content, ctx);
                if (dataPlot) return [dataPlot];
                return [rawTextParagraph(node.token.content)];
            }
            if ((node.token.info ?? '').trim() === 'numberline') {
                const numberLine = parseNumberLineFence(node.token.content, ctx);
                if (numberLine) return [numberLine];
                return [rawTextParagraph(node.token.content)];
            }
            if ((node.token.info ?? '').trim() === 'objectives') {
                const objectives = parseObjectivesFence(node.token.content, ctx);
                if (objectives) return [objectives];
                return [rawTextParagraph(node.token.content)];
            }
            if ((node.token.info ?? '').trim() === 'explain') {
                const explain = parseExplainFence(node.token.content, ctx);
                if (explain) return [explain];
                return [rawTextParagraph(node.token.content)];
            }
            if ((node.token.info ?? '').trim() === 'worked') {
                const worked = parseWorkedFence(node.token.content, ctx);
                if (worked) return [worked];
                return [rawTextParagraph(node.token.content)];
            }
            if ((node.token.info ?? '').trim() === 'faded') {
                const faded = parseFadedFence(node.token.content, ctx);
                if (faded) return [faded];
                return [rawTextParagraph(node.token.content)];
            }
            if ((node.token.info ?? '').trim() === 'shortanswer') {
                const block = parseFreeResponseFence(
                    node.token.content,
                    ctx,
                    'shortAnswer',
                    'Short-answer block',
                );
                if (block) return [block];
                return [rawTextParagraph(node.token.content)];
            }
            if ((node.token.info ?? '').trim() === 'essay') {
                const block = parseFreeResponseFence(
                    node.token.content,
                    ctx,
                    'essay',
                    'Essay block',
                );
                if (block) return [block];
                return [rawTextParagraph(node.token.content)];
            }
            if ((node.token.info ?? '').trim() === 'columns') {
                const cols = parseColumnsFence(node.token.content, ctx);
                if (cols) return [cols];
                return [rawTextParagraph(node.token.content)];
            }
            if ((node.token.info ?? '').trim() === 'callout') {
                const callout = parseCalloutFence(node.token.content, ctx);
                if (callout) return [callout];
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
            const blank = makeBlank(g.blankCanon, g.blankAlts ?? '', ctx);
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
        } else if (g.defInner !== undefined) {
            const def = makeDefinition(g.defInner, marks, ctx);
            out.push(def ?? textNode(m[0], marks));
        } else {
            out.push(textNode(m[0], marks));
        }

        last = m.index + m[0].length;
        if (re.lastIndex === m.index) re.lastIndex++; // defensive: no zero-width loop
    }
    const rest = text.slice(last);
    if (rest.length > 0) out.push(textNode(rest, marks));
}

// A `[[term :: definition]]` inline vocabulary definition → the TERM text run
// carrying a `definition` mark (alongside any active bold/italic/code) whose
// popover content is the definition text (plain text + $inline$ math via
// inlineSchemaContent; the editor's definition popover adds rich formatting / an
// image later). Split on the FIRST `::` (the DSL's label::detail convention).
// No `::`, or an empty term or definition, keeps the literal `[[…]]` text.
function makeDefinition(
    inner: string,
    marks: string[],
    ctx: Ctx,
): JSONContent | null {
    const idx = inner.indexOf('::');
    if (idx === -1) return null;
    const term = inner.slice(0, idx).trim();
    const defText = inner.slice(idx + 2).trim();
    if (term.length === 0 || defText.length === 0) return null;
    const content = inlineSchemaContent(defText, ctx);
    if (content.length === 0) return null;
    const marksList = [...new Set(marks)].map((type) => ({ type }));
    return {
        type: 'text',
        text: term,
        marks: [...marksList, { type: 'definition', attrs: { content } }],
    };
}

// parseBlankSpec (the `{{…}}` sigil grammar) + TOLERANCE_RE moved to the shared
// blankSyntax.ts so the editor's live input rule and this importer parse blanks
// identically (imported at the top). makeBlank keeps the importer's rich path
// (inlineSchemaContent, which resolves $math$ in hint/feedback and routes
// warnings to ctx).

// Build a `blank` inline node from its `{{…}}` contents. parseBlankSpec does the
// pure string parse; makeBlank routes its warnings to ctx and builds the rich
// hint / mistake-feedback inline via schemaInlineContent (the SAME canonical
// InlineNode[] shape the MC `::` importer and the editor's blank popover write,
// so serialize's sanitizeInlineNodes / sanitizeMistakeFeedback carry them
// through unchanged). Null (empty answer) → the caller keeps the sentinel as
// literal text.
function makeBlank(canonRaw: string, altsRaw: string, ctx: Ctx): JSONContent | null {
    const spec = parseBlankSpec(canonRaw, altsRaw);
    if (!spec) return null;
    for (const w of spec.warnings) ctx.warnings.add(w);
    const attrs: Record<string, unknown> = {
        id: crypto.randomUUID(),
        answer: spec.canonical,
        acceptableAnswers: spec.acceptableAnswers,
        interchangeableWithPrevious: spec.interchangeableWithPrevious,
        answerType: spec.answerType,
        ...(spec.tolerance !== undefined ? { tolerance: spec.tolerance } : {}),
    };
    if (spec.hint) attrs.hint = inlineSchemaContent(spec.hint, ctx);
    if (spec.mistakes.length > 0) {
        attrs.mistakeFeedback = spec.mistakes.map((m) => ({
            match: m.match,
            feedback: inlineSchemaContent(m.feedbackText, ctx),
        }));
    }
    return { type: 'blank', attrs };
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
// The prompt: line accepts $inline$ math (the editor's prompt field is
// `(text | mathInline)*`); blanks are NOT allowed there.
// =============================================================================

// The document-level math pass never reaches a fence body (extractMath's
// code-span alternative matches the whole ```graph fence and leaves it as-is),
// so the prompt line still carries RAW $…$ here. Extract it locally, append
// the spans to the document table (remapping the fresh 0-based indices to
// global ones), and reuse the shared inline emitter.
function graphPromptContent(raw: string, ctx: Ctx): JSONContent[] {
    return fenceInline(raw, ctx, false);
}

// Inline content from a fence line: extract its $math$, remap the span indices
// into ctx.spans, and emit inline nodes. `allowBlanks` gates {{…}} parsing —
// false for prompts/objectives (a stray {{ stays literal), true for the faded
// worked-example step lines where a blank IS the point. graphPromptContent is
// the allowBlanks=false wrapper used by the older fences.
function fenceInline(
    raw: string,
    ctx: Ctx,
    allowBlanks: boolean,
): JSONContent[] {
    if (!raw) return [];
    const base = ctx.spans.length;
    const { text, spans } = extractMath(raw);
    ctx.spans.push(...spans);
    const remapped = text.replace(
        new RegExp(`${MATH_OPEN}(\\d+)${MATH_CLOSE}`, 'g'),
        (_, i: string) => `${MATH_OPEN}${base + Number(i)}${MATH_CLOSE}`,
    );
    const out: JSONContent[] = [];
    emitInline(out, remapped, [], allowBlanks, ctx);
    return out;
}

// One body block from a worked/faded fence line: a sole $$…$$ line → mathBlock;
// otherwise inline content routed by blockFromInline (a {{…}}-bearing line, when
// allowed, becomes a fillInBlank; else a paragraph). Reused by both example
// fences so worked (allowBlanks=false) and faded (true) build identically.
function fenceBodyBlock(
    line: string,
    ctx: Ctx,
    allowBlanks: boolean,
): JSONContent {
    const mathOnly = /^\$\$([\s\S]+?)\$\$$/.exec(line);
    if (mathOnly) {
        return { type: 'mathBlock', attrs: { latex: (mathOnly[1] ?? '').trim() } };
    }
    return blockFromInline(fenceInline(line, ctx, allowBlanks));
}

// Attrs-stored inline content (MC choices/feedback/solution, matching sides,
// ordering items) lives in the CANONICAL schema shape — the NodeViews write it
// that way and read it back through activityInlineToTiptap, which requires
// `marks` arrays and `math_inline` (not Tiptap's bare text / `mathInline`).
// Node content (prompts) stays Tiptap-shaped; only attrs convert here.
function schemaInlineContent(raw: string, ctx: Ctx): InlineNode[] {
    return tiptapInlineToActivity(graphPromptContent(raw, ctx));
}

// Canonical inline content from text that has ALREADY been through the
// document-level math pass — i.e. INLINE text carrying <index> math
// placeholders, not raw $…$. Blank hint / mistake feedback live inline in a
// paragraph, so their $math$ was lifted into ctx.spans with the rest of the
// document up front; resolve those existing placeholders directly here.
// Deliberately NOT schemaInlineContent (the FENCE path) — that re-runs extractMath
// and re-bases the span indices, which double-counts a placeholder that was
// already resolved (a mid-text $x$ in a hint would point at the wrong span).
// allowBlanks is false: a blank can't nest inside another blank's feedback.
function inlineSchemaContent(placeholdered: string, ctx: Ctx): InlineNode[] {
    const out: JSONContent[] = [];
    emitInline(out, placeholdered, [], false, ctx);
    return tiptapInlineToActivity(out);
}

// ```mc fence — the multiple-choice DSL. One statement per line:
//   prompt: What is $2 + 2$?          (question text; $inline$ math ok)
//   ( ) 3 :: Check your addition.     (a choice; optional "::" feedback)
//   (x) 4                             (x marks a correct choice)
//   solution: Add the ones.           (optional worked solution)
//   options: confidence               (optional flags)
// Parens ( ) author a single-answer question; square brackets [ ] author
// "select all that apply". Mixing is tolerated: ANY square bracket — or more
// than one correct choice — makes the block multi-select (a single-select
// question with two right answers is unanswerable on radios).
function parseMcFence(src: string, ctx: Ctx): JSONContent | null {
    const fail = (msg: string): null => {
        ctx.warnings.add(
            'Multiple-choice block: ' + msg + ' — imported as plain text.',
        );
        return null;
    };

    let prompt = '';
    let solution: InlineNode[] | null = null;
    let hasConfidenceRating = false;
    let sawSquare = false;
    const choices: {
        id: string;
        content: InlineNode[];
        correct: boolean;
        feedback?: InlineNode[];
        image?: { src: string; alt: string };
    }[] = [];

    for (const rawLine of src.split('\n')) {
        const line = rawLine.trim();
        if (!line) continue;

        const choiceMatch = /^([([])\s*([xX]?)\s*[)\]]\s*(.*)$/.exec(line);
        if (choiceMatch) {
            sawSquare = sawSquare || choiceMatch[1] === '[';
            const correct = (choiceMatch[2] ?? '') !== '';
            let body = (choiceMatch[3] ?? '').trim();
            let feedback: InlineNode[] | undefined;
            const sep = body.indexOf('::');
            if (sep !== -1) {
                const feedbackText = body.slice(sep + 2).trim();
                body = body.slice(0, sep).trim();
                if (feedbackText) {
                    feedback = schemaInlineContent(feedbackText, ctx);
                }
            }
            // Optional per-choice image: markdown ![alt](url) anywhere in the
            // choice text (feedback already split off above). Extracted into
            // the option's figure slot; a choice may be image-only. An
            // unparseable URL stays as literal text so the author notices.
            let image: { src: string; alt: string } | undefined;
            body = body
                .replace(
                    /!\[([^\]]*)\]\(([^)]+)\)/,
                    (whole, alt: string, src: string) => {
                        const url = src.trim();
                        try {
                            new URL(url);
                        } catch {
                            return whole;
                        }
                        image = { src: url, alt: alt.trim() };
                        return '';
                    },
                )
                .trim();
            if (!body && !image) return fail('a choice line needs answer text');
            choices.push({
                id: crypto.randomUUID(),
                content: schemaInlineContent(body, ctx),
                correct,
                ...(feedback ? { feedback } : {}),
                ...(image ? { image } : {}),
            });
            continue;
        }

        const m = /^(prompt|solution|options):\s*(.*)$/i.exec(line);
        if (!m) {
            return fail(
                `unrecognized line "${line}" (choices look like "( ) text" or "(x) text")`,
            );
        }
        const value = (m[2] ?? '').trim();
        switch ((m[1] ?? '').toLowerCase()) {
            case 'prompt':
                prompt = value;
                break;
            case 'solution':
                if (value) solution = schemaInlineContent(value, ctx);
                break;
            case 'options':
                for (const opt of value
                    .split(',')
                    .map((o) => o.trim().toLowerCase())) {
                    if (opt === 'confidence') hasConfidenceRating = true;
                    else if (opt) return fail(`unknown option "${opt}"`);
                }
                break;
        }
    }

    if (choices.length < 2) return fail('needs at least two choice lines');
    const correctCount = choices.filter((c) => c.correct).length;
    if (correctCount === 0) {
        return fail('mark the correct choice with (x)');
    }
    const multiSelect = sawSquare || correctCount > 1;

    return {
        type: 'multipleChoice',
        attrs: {
            id: '',
            choices,
            multiSelect,
            solution,
            hasConfidenceRating,
            skills: [],
            workSpace: null,
        },
        content: graphPromptContent(prompt, ctx),
    };
}

// Pull an optional markdown image — ![alt](url) — out of a match-line side,
// returning the remaining text. Same contract as the mc choice image: an
// unparseable URL stays as literal text so the author notices; a side may be
// image-only.
function extractSideImage(body: string): {
    text: string;
    image?: { src: string; alt: string };
} {
    let image: { src: string; alt: string } | undefined;
    const text = body
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/, (whole, alt: string, src: string) => {
            const url = src.trim();
            try {
                new URL(url);
            } catch {
                return whole;
            }
            image = { src: url, alt: alt.trim() };
            return '';
        })
        .trim();
    return image ? { text, image } : { text };
}

// ```match fence — the matching DSL. One statement per line:
//   prompt: Match each equation to its slope.
//   y = 2x = 2                 (item = its correct option)
//   y = -x -> -1               ("->" also splits — use it when both sides
//                               contain "=")
//   = 0                        (option-only line: a distractor)
//   solution: Read off the x coefficient.
//   options: confidence, reuse
//
// The separator is the LAST unescaped " = " on the line (so equation items
// like "y = 2x + 1 = A" split before the final term), or the FIRST " -> "
// when present (which always wins — the unambiguous spelling). "\=" escapes
// a literal equals. A markdown image ![alt](url) on either side becomes that
// side's figure. Students see the options shuffled with letters assigned by
// the platform — letters are never authored.
function parseMatchFence(src: string, ctx: Ctx): JSONContent | null {
    const fail = (msg: string): null => {
        ctx.warnings.add('Matching block: ' + msg + ' — imported as plain text.');
        return null;
    };

    let prompt = '';
    let solution: InlineNode[] | null = null;
    let hasConfidenceRating = false;
    let allowTargetReuse = false;
    type Side = {
        id: string;
        content: InlineNode[];
        image?: { src: string; alt: string };
    };
    const items: Side[] = [];
    const targets: Side[] = [];
    const key: Record<string, string> = {};

    const buildSide = (raw: string): Side | null => {
        const { text, image } = extractSideImage(raw.replace(/\\=/g, '='));
        if (!text && !image) return null;
        return {
            id: crypto.randomUUID(),
            content: schemaInlineContent(text, ctx),
            ...(image ? { image } : {}),
        };
    };

    for (const rawLine of src.split('\n')) {
        const line = rawLine.trim();
        if (!line) continue;

        const directive = /^(prompt|solution|options):\s*(.*)$/i.exec(line);
        if (directive) {
            const value = (directive[2] ?? '').trim();
            switch ((directive[1] ?? '').toLowerCase()) {
                case 'prompt':
                    prompt = value;
                    break;
                case 'solution':
                    if (value) solution = schemaInlineContent(value, ctx);
                    break;
                case 'options':
                    for (const opt of value
                        .split(',')
                        .map((o) => o.trim().toLowerCase())) {
                        if (opt === 'confidence') hasConfidenceRating = true;
                        else if (opt === 'reuse') allowTargetReuse = true;
                        else if (opt) return fail(`unknown option "${opt}"`);
                    }
                    break;
            }
            continue;
        }

        // Option-only line (a distractor): "= 0" or "-> 0".
        const distractor = /^(?:=|->)\s*(.+)$/.exec(line);
        if (distractor) {
            const side = buildSide(distractor[1] ?? '');
            if (!side) return fail('a distractor line needs option text');
            targets.push(side);
            continue;
        }

        // Pair line. "->" wins when present; otherwise split on the LAST
        // unescaped " = " so equation-shaped items keep their equals signs.
        let leftRaw: string;
        let rightRaw: string;
        const arrow = line.indexOf(' -> ');
        if (arrow !== -1) {
            leftRaw = line.slice(0, arrow);
            rightRaw = line.slice(arrow + 4);
        } else {
            // Mask each escaped "\=" with a same-length sentinel so it can't be
            // chosen as the split point, while splitAt still indexes the original
            // line. A private-use codepoint (not a NUL byte \u2014 NUL made the whole
            // file read as binary to grep/rg) that teachers can't type.
            const splitAt = line.replace(/\\=/g, '\uE000\uE000').lastIndexOf(' = ');
            if (splitAt === -1) {
                return fail(
                    `unrecognized line "${line}" (pairs look like "item = option"; ` +
                        'distractors start with "=")',
                );
            }
            leftRaw = line.slice(0, splitAt);
            rightRaw = line.slice(splitAt + 3);
        }
        const item = buildSide(leftRaw);
        const target = buildSide(rightRaw);
        if (!item || !target) {
            return fail(`a pair line needs text on both sides ("${line}")`);
        }
        items.push(item);
        targets.push(target);
        key[item.id] = target.id;
    }

    if (items.length < 2) return fail('needs at least two "item = option" lines');

    return {
        type: 'matching',
        attrs: {
            id: '',
            items,
            targets,
            key,
            allowTargetReuse,
            solution,
            hasConfidenceRating,
            skills: [],
            workSpace: null,
        },
        content: graphPromptContent(prompt, ctx),
    };
}

// ```order fence — the ordering DSL. One item per line, LISTED ORDER =
// CORRECT ORDER (students see them shuffled); leading list markers ("1.",
// "2)", "-") are tolerated decoration and stripped:
//   prompt: Put the steps in order.
//   1. Subtract 3 from both sides
//   2. Divide both sides by 2
//   3. Check the solution
//   solution: Undo operations in reverse.
//   options: confidence
function parseOrderFence(src: string, ctx: Ctx): JSONContent | null {
    const fail = (msg: string): null => {
        ctx.warnings.add('Ordering block: ' + msg + ' — imported as plain text.');
        return null;
    };

    let prompt = '';
    let solution: InlineNode[] | null = null;
    let hasConfidenceRating = false;
    const items: { id: string; content: InlineNode[] }[] = [];

    for (const rawLine of src.split('\n')) {
        const line = rawLine.trim();
        if (!line) continue;

        const directive = /^(prompt|solution|options):\s*(.*)$/i.exec(line);
        if (directive) {
            const value = (directive[2] ?? '').trim();
            switch ((directive[1] ?? '').toLowerCase()) {
                case 'prompt':
                    prompt = value;
                    break;
                case 'solution':
                    if (value) solution = schemaInlineContent(value, ctx);
                    break;
                case 'options':
                    for (const opt of value
                        .split(',')
                        .map((o) => o.trim().toLowerCase())) {
                        if (opt === 'confidence') hasConfidenceRating = true;
                        else if (opt) return fail(`unknown option "${opt}"`);
                    }
                    break;
            }
            continue;
        }

        const body = line.replace(/^(?:\d+[.)]|-)\s+/, '').trim();
        if (!body) return fail('an item line needs text');
        items.push({ id: crypto.randomUUID(), content: schemaInlineContent(body, ctx) });
    }

    if (items.length < 2) return fail('needs at least two item lines');

    return {
        type: 'ordering',
        attrs: {
            id: '',
            items,
            solution,
            hasConfidenceRating,
            skills: [],
            workSpace: null,
        },
        content: graphPromptContent(prompt, ctx),
    };
}

// ```objectives fence — a titled learning-objectives list (learning_objectives
// block). `title:` is optional (defaults to "Learning objectives"); every other
// non-empty line is one objective (inline; $math$ ok). A leading list marker
// (-, *, 1.) is stripped so a pasted markdown list Just Works.
function parseObjectivesFence(src: string, ctx: Ctx): JSONContent | null {
    let title = 'Learning objectives';
    const items: JSONContent[] = [];

    for (const rawLine of src.split('\n')) {
        const line = rawLine.trim();
        if (!line) continue;

        const t = /^title:\s*(.*)$/i.exec(line);
        if (t) {
            const v = (t[1] ?? '').trim();
            if (v) title = v;
            continue;
        }

        const body = line.replace(/^(?:[-*]|\d+[.)])\s+/, '').trim();
        if (!body) continue;
        items.push({ type: 'paragraph', content: fenceInline(body, ctx, false) });
    }

    if (items.length === 0) {
        ctx.warnings.add(
            'Learning objectives block: needs at least one objective — imported as plain text.',
        );
        return null;
    }

    return { type: 'learningObjectives', attrs: { id: '', title }, content: items };
}

// ```explain fence — an ungraded self-explanation prompt (self_explanation
// block). Non-directive lines form the prompt (joined); an optional `starter:`
// line sets the textarea placeholder.
function parseExplainFence(src: string, ctx: Ctx): JSONContent | null {
    let placeholder = '';
    const promptLines: string[] = [];

    for (const rawLine of src.split('\n')) {
        const line = rawLine.trim();
        if (!line) continue;

        const s = /^starter:\s*(.*)$/i.exec(line);
        if (s) {
            placeholder = (s[1] ?? '').trim();
            continue;
        }
        promptLines.push(line);
    }

    if (promptLines.length === 0) {
        ctx.warnings.add(
            'Self-explanation block: needs a prompt — imported as plain text.',
        );
        return null;
    }

    return {
        type: 'selfExplanation',
        attrs: { id: '', placeholder },
        content: fenceInline(promptLines.join(' '), ctx, false),
    };
}

// ```callout fence — a tinted note box (callout block). An optional `variant:`
// line picks info / warning / success / note (default info; `tip` → success,
// `warn` → warning as friendly aliases); every other non-blank line joins into
// the inline body ($math$ ok). Content is inline only (the schema's callout body
// is InlineNode[]), so lines join with a space rather than becoming blocks.
const CALLOUT_VARIANTS: Record<string, string> = {
    info: 'info',
    warning: 'warning',
    warn: 'warning',
    success: 'success',
    note: 'note',
    tip: 'success',
};
function parseCalloutFence(src: string, ctx: Ctx): JSONContent | null {
    let variant = 'info';
    const bodyLines: string[] = [];

    for (const rawLine of src.split('\n')) {
        const line = rawLine.trim();
        if (!line) continue;

        const v = /^variant:\s*(.*)$/i.exec(line);
        if (v) {
            const raw = (v[1] ?? '').trim().toLowerCase();
            const mapped = CALLOUT_VARIANTS[raw];
            if (mapped) variant = mapped;
            else if (raw)
                ctx.warnings.add(
                    `Callout block: unknown variant “${raw}” (use info, warning, success, or note) — used info.`,
                );
            continue;
        }
        bodyLines.push(line);
    }

    if (bodyLines.length === 0) {
        ctx.warnings.add(
            'Callout block: needs body text — imported as plain text.',
        );
        return null;
    }

    return {
        type: 'callout',
        attrs: { id: '', variant },
        content: fenceInline(bodyLines.join(' '), ctx, false),
    };
}

// ```worked / ```faded fences — a worked example (or its faded, fill-in
// variant). `title:` optional; every other line is one body block via
// fenceBodyBlock. Worked disallows blanks (a {{…}} stays literal — the example
// shows the answer); faded allows them, so a {{…}} line becomes a fill-in step.
function parseExampleFence(
    src: string,
    ctx: Ctx,
    nodeType: 'workedExample' | 'fadedWorkedExample',
    defaultTitle: string,
    allowBlanks: boolean,
    label: string,
): JSONContent | null {
    let title = defaultTitle;
    const blocks: JSONContent[] = [];

    for (const rawLine of src.split('\n')) {
        const line = rawLine.trim();
        if (!line) continue;

        const t = /^title:\s*(.*)$/i.exec(line);
        if (t) {
            const v = (t[1] ?? '').trim();
            if (v) title = v;
            continue;
        }
        blocks.push(fenceBodyBlock(line, ctx, allowBlanks));
    }

    if (blocks.length === 0) {
        ctx.warnings.add(
            label + ': needs at least one body line — imported as plain text.',
        );
        return null;
    }

    return { type: nodeType, attrs: { id: '', title }, content: blocks };
}

function parseWorkedFence(src: string, ctx: Ctx): JSONContent | null {
    return parseExampleFence(
        src,
        ctx,
        'workedExample',
        'Worked example',
        false,
        'Worked example block',
    );
}

function parseFadedFence(src: string, ctx: Ctx): JSONContent | null {
    return parseExampleFence(
        src,
        ctx,
        'fadedWorkedExample',
        'Guided practice',
        true,
        'Faded worked example block',
    );
}

// ```columns fence — an authored multi-column (side-by-side) row. Columns are
// separated by a line that is exactly `---`; every other non-blank line in a
// segment becomes one block via fenceBodyBlock (a paragraph, a $$…$$ math block,
// or a {{blank}} fill-in). 2–6 columns; an empty segment seeds an empty
// paragraph (a column needs ≥1 block). Emits a strict-grid `row` node directly —
// wrapBlocksStrict passes it through at the top level while wrapping the bare
// blocks around it. Line-per-block, like ```worked/```faded (rich per-column
// content — nested lists/headings — is editor-only; the fence is for simple
// side-by-side text).
function parseColumnsFence(src: string, ctx: Ctx): JSONContent | null {
    // Split into column segments on a `---` divider line.
    const segments: string[][] = [[]];
    for (const rawLine of src.split('\n')) {
        if (rawLine.trim() === '---') {
            segments.push([]);
            continue;
        }
        segments[segments.length - 1]!.push(rawLine);
    }

    const columns: JSONContent[] = segments.map((lines) => {
        const blocks: JSONContent[] = [];
        for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line) continue;
            blocks.push(fenceBodyBlock(line, ctx, true));
        }
        // A column's content is `block+` — seed an empty paragraph when the
        // segment held nothing.
        if (blocks.length === 0) blocks.push({ type: 'paragraph' });
        return { type: 'column', content: blocks };
    });

    if (columns.length < 2) {
        ctx.warnings.add(
            'Columns block: needs at least two columns (divide them with a `---` line) — imported as plain text.',
        );
        return null;
    }
    if (columns.length > 6) {
        ctx.warnings.add(
            'Columns block: at most 6 columns — the extra columns were dropped.',
        );
        columns.length = 6;
    }

    return {
        type: 'row',
        attrs: { id: '', gridLines: 'inherit' },
        content: columns,
    };
}

// One rubric criterion from a `rubric:` line — `Label | points | optional note`.
// The pipe splits label / maxPoints / description; a criterion id is minted here
// (serialize's sanitizeRubric VALIDATES ids, it doesn't mint them, so an import
// must supply a real uuid up front). Returns null for a missing label or a
// non-positive/unparseable points value so the caller can warn + skip just that
// line — one bad criterion never sinks the block, mirroring the editor's
// per-criterion serialize sanitize.
interface ImportedCriterion {
    id: string;
    label: string;
    maxPoints: number;
    description?: string;
}
function parseRubricLine(raw: string): ImportedCriterion | null {
    if (!raw) return null;
    const parts = raw.split('|').map((p) => p.trim());
    const label = parts[0] ?? '';
    const maxPoints = Number(parts[1] ?? '');
    if (!label) return null;
    if (!Number.isFinite(maxPoints) || maxPoints <= 0) return null;
    const crit: ImportedCriterion = {
        id: crypto.randomUUID(),
        label,
        maxPoints,
    };
    const description = (parts[2] ?? '').trim();
    if (description) crit.description = description;
    return crit;
}

// An essay `words:` target — `min-max`, either side optional (`200-300`,
// `200-` min only, `-300` max only). The dash is required (a bare number is
// ambiguous). Word counts are positive integers, so a zero/negative or an
// inverted min>max range returns null (warn + drop the hint, keep the block).
function parseWordRange(
    raw: string,
): { min: number | null; max: number | null } | null {
    const m = /^(\d+)?\s*-\s*(\d+)?$/.exec(raw);
    if (!m) return null;
    const minText = m[1];
    const maxText = m[2];
    if (minText === undefined && maxText === undefined) return null;
    const min = minText !== undefined ? Number(minText) : null;
    const max = maxText !== undefined ? Number(maxText) : null;
    if ((min !== null && min <= 0) || (max !== null && max <= 0)) return null;
    if (min !== null && max !== null && min > max) return null;
    return { min, max };
}

// ```shortanswer / ```essay fences — the manually-graded free-text blocks
// (Phase 2.6), siblings of the ungraded ```explain (self_explanation). Shared
// grammar: a prompt (a `prompt:` line or any bare line, joined), an optional
// `starter:` placeholder, and an optional pipe-delimited `rubric:` line
// (repeatable). Essay adds a `words: min-max` target range. The rubric attr is
// stored as `{ criteria }` exactly like the editor writes it; serialize carries
// it through untouched.
function parseFreeResponseFence(
    src: string,
    ctx: Ctx,
    kind: 'shortAnswer' | 'essay',
    label: string,
): JSONContent | null {
    let placeholder = '';
    let wordMin: number | null = null;
    let wordMax: number | null = null;
    const criteria: ImportedCriterion[] = [];
    const promptLines: string[] = [];

    for (const rawLine of src.split('\n')) {
        const line = rawLine.trim();
        if (!line) continue;

        const s = /^starter:\s*(.*)$/i.exec(line);
        if (s) {
            placeholder = (s[1] ?? '').trim();
            continue;
        }

        const p = /^prompt:\s*(.*)$/i.exec(line);
        if (p) {
            const v = (p[1] ?? '').trim();
            if (v) promptLines.push(v);
            continue;
        }

        const w = /^words:\s*(.*)$/i.exec(line);
        if (w) {
            if (kind !== 'essay') {
                ctx.warnings.add(
                    label +
                        ': a word-count target (words:) applies only to an essay — ignored.',
                );
            } else {
                const range = parseWordRange((w[1] ?? '').trim());
                if (range) {
                    wordMin = range.min;
                    wordMax = range.max;
                } else {
                    ctx.warnings.add(
                        label +
                            ': couldn’t read the words: range (use words: 200-300) — ignored.',
                    );
                }
            }
            continue;
        }

        const r = /^rubric:\s*(.*)$/i.exec(line);
        if (r) {
            const crit = parseRubricLine((r[1] ?? '').trim());
            if (crit) criteria.push(crit);
            else
                ctx.warnings.add(
                    label +
                        ': skipped a rubric line I couldn’t read (use rubric: Label | points | optional note).',
                );
            continue;
        }

        promptLines.push(line);
    }

    if (promptLines.length === 0) {
        ctx.warnings.add(label + ': needs a prompt — imported as plain text.');
        return null;
    }

    const rubric = criteria.length > 0 ? { criteria } : null;
    const content = fenceInline(promptLines.join(' '), ctx, false);

    if (kind === 'essay') {
        return {
            type: 'essay',
            attrs: { id: '', placeholder, wordMin, wordMax, rubric },
            content,
        };
    }
    return {
        type: 'shortAnswer',
        attrs: { id: '', placeholder, rubric },
        content,
    };
}

// ```dataplot fence — the statistics-chart DSL (data_plot block). One statement
// per line:
//   prompt: Make a dot plot of the data.   ($inline$ math ok)
//   data: 3, 5, 5, 6, 8                    (the dataset — commas or spaces;
//                                           repeat the line to continue it)
//   axis: 0..10 step 1                     (optional; omitted → auto-fit)
//   answer: dotplot                        (graded build: the student
//                                           constructs the chart of the data)
//   show: boxplot                          (OR a static ungraded chart)
//   solution: Count each value's dots.     (optional)
//   options: confidence                    (optional)
// Exactly one of answer:/show:. The correct plot is COMPUTED from the data
// (schema decision 3a) — there is no separately-authored key. A box-plot answer
// takes an optional trailing "tolerance <n>" (line units, default 0.5); the
// axis step doubles as the histogram bin width (the schema's binWidth →
// tickStep fallback). Chart names tolerate "dot plot" / "box-plot" spellings.
function parseDataPlotFence(src: string, ctx: Ctx): JSONContent | null {
    const fail = (msg: string): null => {
        ctx.warnings.add('Data plot block: ' + msg + ' — imported as plain text.');
        return null;
    };

    let prompt = '';
    let solution: InlineNode[] | null = null;
    let hasConfidenceRating = false;
    const data: number[] = [];
    let axis: { min: number; max: number } | null = null;
    let step = 1;
    let interaction: Record<string, unknown> | null = null;

    const chartWord = (raw: string): 'dotplot' | 'histogram' | 'boxplot' | null => {
        const w = raw.toLowerCase().replace(/[\s-]+/g, '');
        return w === 'dotplot' || w === 'histogram' || w === 'boxplot' ? w : null;
    };

    for (const rawLine of src.split('\n')) {
        const line = rawLine.trim();
        if (!line) continue;
        const m = /^(prompt|data|axis|answer|show|solution|options):\s*(.*)$/i.exec(line);
        if (!m) return fail(`unrecognized line "${line}"`);
        const value = (m[2] ?? '').trim();
        switch ((m[1] ?? '').toLowerCase()) {
            case 'prompt':
                prompt = value;
                break;
            case 'solution':
                if (value) solution = schemaInlineContent(value, ctx);
                break;
            case 'options':
                for (const opt of value.split(',').map((o) => o.trim().toLowerCase())) {
                    if (opt === 'confidence') hasConfidenceRating = true;
                    else if (opt) return fail(`unknown option "${opt}"`);
                }
                break;
            case 'data': {
                const parts = value.split(/[,\s]+/).filter((p) => p.length > 0);
                if (parts.length === 0) return fail('the data line needs at least one number');
                for (const p of parts) {
                    const n = Number(p);
                    if (!Number.isFinite(n)) return fail(`"${p}" in the data line is not a number`);
                    data.push(n);
                }
                break;
            }
            case 'axis': {
                const a = /^(-?[\d.]+)\s*\.\.\s*(-?[\d.]+)(?:\s+step\s+([\d.]+))?$/i.exec(value);
                if (!a) return fail('axis must look like "0..10" or "0..20 step 5"');
                const min = Number(a[1]);
                const max = Number(a[2]);
                if (!(min < max)) return fail('the axis range needs min < max');
                axis = { min, max };
                if (a[3] !== undefined) {
                    step = Number(a[3]);
                    if (!(step > 0)) return fail('the axis step must be positive');
                }
                break;
            }
            case 'answer': {
                if (interaction) return fail('only one answer: or show: line per block');
                let body = value;
                let tolerance: number | undefined;
                const tol = /\s+tolerance\s+(\d*\.?\d+)$/i.exec(body);
                if (tol) {
                    tolerance = Number(tol[1]);
                    body = body.slice(0, tol.index).trim();
                }
                const chart = chartWord(body);
                if (!chart) return fail(`the answer must be dotplot, histogram, or boxplot (got "${value}")`);
                if (tolerance !== undefined && chart !== 'boxplot') {
                    return fail('tolerance applies only to a boxplot answer');
                }
                interaction =
                    chart === 'dotplot'
                        ? { type: 'build_dotplot' }
                        : chart === 'histogram'
                          ? { type: 'build_histogram' }
                          : { type: 'build_boxplot', tolerance: tolerance ?? 0.5 };
                break;
            }
            case 'show': {
                if (interaction) return fail('only one answer: or show: line per block');
                const chart = chartWord(value);
                if (!chart) return fail(`show must name dotplot, histogram, or boxplot (got "${value}")`);
                interaction = { type: 'display', chart };
                break;
            }
        }
    }

    if (data.length === 0) return fail('needs a data: line with the dataset');
    if (!interaction) {
        return fail('needs an answer: line (a graded build) or a show: line (a static chart)');
    }

    // No axis line → auto-fit the window to the data, floor/ceil'd to the tick
    // step (the most likely author/AI mistake is a window that clips the data —
    // histogramBins drops out-of-window values, silently changing the computed
    // answer). A single-tick dataset still gets a non-degenerate span.
    let min: number;
    let max: number;
    if (axis) {
        min = axis.min;
        max = axis.max;
        if (data.some((v) => v < min || v > max)) {
            ctx.warnings.add(
                'Data plot block: some data values fall outside the axis window — they won’t appear on the chart.',
            );
        }
    } else {
        min = Math.floor(Math.min(...data) / step) * step;
        max = Math.ceil(Math.max(...data) / step) * step;
        if (max - min < step) max = min + step;
    }

    return {
        type: 'dataPlot',
        attrs: {
            id: '',
            data,
            config: { min, max, tickStep: step, minorTicksPerStep: 0, snapToTick: true },
            interaction,
            solution,
            hasConfidenceRating,
            skills: [],
        },
        content: graphPromptContent(prompt, ctx),
    };
}

// ```numberline fence — the 1-D number-line DSL (number_line block). One
// statement per line:
//   prompt: Graph x >= -2.                ($inline$ math ok)
//   answer: x >= -2                       (an inequality → an interval/ray)
//   axis: -10..10 step 2                  (optional; omitted → auto-fit)
//   solution: A closed dot means "or equal to".
//   options: confidence
// The answer is EITHER a point list — bare numbers, "answer: -3, 4" — OR a
// single/compound inequality that becomes an interval or ray:
//   x >= 3        min 3 closed, no max  (ray → +∞)
//   x < 5         max 5 open,   no min  (ray → -∞)
//   -2 <= x < 5   min -2 closed, max 5 open  (bounded interval)
// >= / <= give closed endpoints, > / < open ones. Unlike the graph and data-plot
// fences there is NO show: line — the number_line block has no static display
// mode; both its interactions are graded. The match tolerance is the block
// default (0.1 line units); the axis window auto-fits the answer values when no
// axis: line is given.
function parseNumberLineFence(src: string, ctx: Ctx): JSONContent | null {
    const fail = (msg: string): null => {
        ctx.warnings.add('Number line block: ' + msg + ' — imported as plain text.');
        return null;
    };

    let prompt = '';
    let solution: InlineNode[] | null = null;
    let hasConfidenceRating = false;
    let axis: { min: number; max: number } | null = null;
    let step = 1;
    let interaction: Record<string, unknown> | null = null;
    // Finite anchor values (point positions or present interval bounds) the
    // auto-fit window is sized around.
    let anchors: number[] = [];

    for (const rawLine of src.split('\n')) {
        const line = rawLine.trim();
        if (!line) continue;
        const m = /^(prompt|answer|axis|solution|options):\s*(.*)$/i.exec(line);
        if (!m) return fail(`unrecognized line "${line}"`);
        const value = (m[2] ?? '').trim();
        switch ((m[1] ?? '').toLowerCase()) {
            case 'prompt':
                prompt = value;
                break;
            case 'solution':
                if (value) solution = schemaInlineContent(value, ctx);
                break;
            case 'options':
                for (const opt of value.split(',').map((o) => o.trim().toLowerCase())) {
                    if (opt === 'confidence') hasConfidenceRating = true;
                    else if (opt) return fail(`unknown option "${opt}"`);
                }
                break;
            case 'axis': {
                const a = /^(-?[\d.]+)\s*\.\.\s*(-?[\d.]+)(?:\s+step\s+([\d.]+))?$/i.exec(value);
                if (!a) return fail('axis must look like "-10..10" or "-10..10 step 2"');
                const min = Number(a[1]);
                const max = Number(a[2]);
                if (!(min < max)) return fail('the axis range needs min < max');
                axis = { min, max };
                if (a[3] !== undefined) {
                    step = Number(a[3]);
                    if (!(step > 0)) return fail('the axis step must be positive');
                }
                break;
            }
            case 'answer': {
                if (interaction) return fail('only one answer: line per block');
                if (/[<>]/.test(value)) {
                    const interval = parseNumberLineInterval(value);
                    if (!interval) {
                        return fail(
                            `couldn't read the inequality "${value}" — write e.g. "x >= 3", "x < 5", or "-2 <= x < 5"`,
                        );
                    }
                    interaction = { type: 'plot_interval', correctInterval: interval, tolerance: 0.1 };
                    if (interval.min !== undefined) anchors.push(interval.min);
                    if (interval.max !== undefined) anchors.push(interval.max);
                } else {
                    const parts = value.split(/[,\s]+/).filter((p) => p.length > 0);
                    if (parts.length === 0) return fail('the answer needs a value');
                    const points: number[] = [];
                    for (const p of parts) {
                        const n = Number(p);
                        if (!Number.isFinite(n)) {
                            return fail(`"${p}" is not a number or a recognized inequality`);
                        }
                        points.push(n);
                    }
                    interaction = { type: 'plot_point', correctPoints: points, tolerance: 0.1 };
                    anchors = anchors.concat(points);
                }
                break;
            }
        }
    }

    if (!interaction) return fail('needs an answer: line');

    let min: number;
    let max: number;
    if (axis) {
        min = axis.min;
        max = axis.max;
        if (anchors.some((v) => v < min || v > max)) {
            ctx.warnings.add(
                'Number line block: an answer value falls outside the axis window — the student can’t place it there.',
            );
        }
    } else {
        // Auto-fit around the answer anchors, floor/ceil'd to the step, then
        // padded a step each side so a point or endpoint isn't jammed at the
        // edge and a ray visibly extends past its bound.
        let lo = Math.floor(Math.min(...anchors) / step) * step;
        let hi = Math.ceil(Math.max(...anchors) / step) * step;
        if (hi - lo < step) {
            lo -= step;
            hi += step;
        }
        min = lo - step;
        max = hi + step;
    }

    return {
        type: 'numberLine',
        attrs: {
            id: '',
            config: { min, max, tickStep: step, minorTicksPerStep: 0, snapToTick: true },
            interaction,
            solution,
            hasConfidenceRating,
            skills: [],
        },
        content: graphPromptContent(prompt, ctx),
    };
}

// parseNumberLineInterval lives in editor/numberLineFormula.ts (shared with the
// number-line NodeView's formula authoring input), imported at the top.

function parseGraphFence(src: string, ctx: Ctx): JSONContent | null {
    const axis = { xMin: -10, xMax: 10, yMin: -10, yMax: 10, xGridStep: 1, yGridStep: 1, showGrid: true, snapToGrid: true };
    let interaction: Record<string, unknown> | null = null;
    const drawables: Record<string, unknown>[] = [];
    let prompt = '';
    let partialCredit = false;
    let allowNoSolution = false;
    let noSolutionCorrect = false;
    let builtinFeedback = true;
    const mistakes: { match: string; feedback: { type: 'text'; text: string; marks: [] }[] }[] = [];
    const fail = (msg: string): null => {
        ctx.warnings.add('Graph block: ' + msg + ' — imported as plain text.');
        return null;
    };
    const pointList = (text: string): [number, number][] | null => parsePointList(text);

    for (const rawLine of src.split('\n')) {
        const line = rawLine.trim();
        if (!line) continue;
        const m = /^(axes|prompt|answer|show|options|mistake):\s*(.*)$/i.exec(line);
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
            case 'mistake': {
                // "mistake: <wrong answer> :: <feedback>" — an authored
                // anticipated mistake. The wrong answer uses the same freeform
                // syntax as answer:; feedback is plain text (rich feedback is
                // an editor affordance).
                const sep = value.indexOf('::');
                if (sep === -1) return fail('mistake lines look like "mistake: (3, 4) :: feedback text"');
                const match = value.slice(0, sep).trim();
                const feedbackText = value.slice(sep + 2).trim();
                if (!match || !feedbackText) return fail('mistake lines need both a wrong answer and feedback text');
                mistakes.push({
                    match,
                    feedback: [{ type: 'text', text: feedbackText, marks: [] }],
                });
                break;
            }
            case 'options':
                for (const opt of value.split(',').map((o) => o.trim().toLowerCase())) {
                    if (opt === 'partial-credit') partialCredit = true;
                    else if (opt === 'allow-no-solution') allowNoSolution = true;
                    else if (opt === 'no-solution-correct') { allowNoSolution = true; noSolutionCorrect = true; }
                    else if (opt === 'no-builtin-feedback') builtinFeedback = false;
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
                if (/^(ray|segment)\b/i.test(value)) {
                    const parsed = parseRaySegment(value);
                    if (parsed.kind === 'error') return fail(parsed.message);
                    interaction =
                        parsed.kind === 'ray'
                            ? {
                                  type: 'plot_ray',
                                  rays: [{ from: parsed.from, through: parsed.through, fromStyle: parsed.fromStyle, tolerance: 0.25 }],
                              }
                            : {
                                  type: 'plot_segment',
                                  segments: [{ from: parsed.from, to: parsed.to, endpoints: parsed.endpoints, tolerance: 0.25 }],
                              };
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
                    if (parsed.domain) {
                        // Domain clauses authored the deprecated glider UX.
                        // Rays/segments are first-class now — steer there.
                        return fail('for a ray or segment, write "answer: ray (1, 2) through (3, 4)" or "answer: segment (1, 2) to (3, 4)"');
                    }
                    interaction = { type: 'plot_function', models: [parsed.model] };
                } else {
                    return fail(parsed.message);
                }
                break;
            }
            case 'show': {
                // 'dotted' is an accepted synonym for 'dashed' — it's the word
                // the student widget uses ("Dotted line"), so teachers reach for
                // it. Both must ALSO be stripped from the body below: an
                // unstripped style token poisons the formula parse and silently
                // downgrades the drawable (losing style + shade).
                const style = /\b(dashed|dotted)\b/i.test(value) ? 'dashed' : undefined;
                const label = /"([^"]*)"/.exec(value)?.[1];
                const endpoint = /\bopen\b/i.test(value) ? 'open' : /\bclosed\b/i.test(value) ? 'closed' : undefined;
                const body = value.replace(/\bdashed\b|\bdotted\b|\bopen\b|\bclosed\b|"[^"]*"/gi, '').trim();
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
                        drawables.push({ kind: 'curve', model: parsed.model, ...(style ? { style } : {}), ...(parsed.domain ? { domain: toCurveDomain(parsed.domain) } : {}) });
                    } else if (parsed.kind === 'inequality') {
                        drawables.push({
                            kind: 'curve', model: parsed.boundary,
                            style: parsed.strict ? 'dashed' : (style ?? 'solid'),
                            shade: parsed.side,
                            ...(parsed.domain ? { domain: toCurveDomain(parsed.domain) } : {}),
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
            builtinFeedback,
            mistakeFeedback: mistakes,
            hasConfidenceRating: false,
            skills: [],
        },
        content: graphPromptContent(prompt, ctx),
    };
}

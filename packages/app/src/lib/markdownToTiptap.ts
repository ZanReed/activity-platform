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

// SUBPATHS, never the graph-kit BARREL. The barrel statically re-exports the
// mount functions, which import `MathfieldElement` from mathlive — a symbol
// mathlive's node/SSR build does not export. In the browser that costs nothing
// (Vite takes the browser condition and tree-shakes); under a bare-node bundle
// it is a HARD build error, which is what made this module unreachable from the
// batch importer until 2026-08-20. Same rule CLAUDE.md already carries for
// graph-kit's scorers, and for the same reason. Guarded by
// scripts/tests/batch-import.test.mjs, which bundles this path for node and
// runs it — a guard bound to OUTPUT, not to a declaration.
import {
    parseGraphFormula,
    parsePointList,
    parseRaySegment,
} from '@activity/graph-kit/formula';
import { latexToAscii } from '@activity/graph-kit/math-prompt-convert';
import type { JSONContent } from '@tiptap/react';
import type {
    ActivityMeta,
    DefinitionBlock,
    InlineNode,
} from '@activity/schema';
import {
    tiptapInlineToActivity,
    tiptapToDefinitionContent,
} from './serialize';
import { toCurveDomain } from './graphDomain';
import { parseNumberLineInterval } from '../editor/numberLineFormula';
import { parseBlankSpec } from './blankSyntax';
import { normalizeTags } from './normalizeTags';
import { parseWorkSpace } from './workSpaceUnits';
import { asPedagogicalRole, type PedagogicalRole } from './pedagogicalRole';

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
    // Content authored via ```reference fences, destined for the activity's
    // REFERENCE PANEL (the summonable resources window + print-top box), not
    // the body. Flat block-level Tiptap nodes in the reference-panel editor's
    // alphabet; the caller appends them to the panel's Tiptap doc. Absent when
    // the paste had no reference fence. Multiple fences accumulate; the first
    // authored title wins (the caller only applies it to an untitled panel).
    referencePanel?: { title?: string; blocks: JSONContent[] };
    // Activity-level metadata authored via a ```meta fence — the taxonomy arc's
    // Drop 2. A THIRD kind of side channel: like ```definitions it contributes
    // no blocks anywhere, and unlike ```reference it does not even carry
    // content — it describes the activity rather than filling it.
    //
    // Absent when the paste had no meta fence. The caller applies these
    // NEVER-CLOBBER (ruling D16): a key lands only where the activity has no
    // value yet, and anything skipped is reported back as a warning so the
    // author is never silently ignored. Tags are the exception — they union,
    // because adding a tag can't destroy one.
    meta?: ImportedMeta;
    // Deduplicated, human-readable notes about anything that degraded (a code
    // fence flattened to text, a link's URL dropped, etc.). The dialog surfaces
    // these so the teacher knows what to fix by hand.
    warnings: string[];
}

/**
 * What a ```meta fence can carry. Every field optional: a fence naming only
 * `tags:` is valid and common.
 *
 * course/unit are DOCUMENT fields (they reach the activities row at publish,
 * stamped by publish_activity); tags/pedagogicalRole are ROW-native. The fence
 * deliberately hides that split — an author writing markdown should not have to
 * know which storage layer a label lives in. See docs/design/activity-taxonomy.md.
 */
export interface ImportedMeta {
    /**
     * The activity's name. Applied only to a still-untitled activity (the
     * never-clobber rule), so re-pasting never renames work you have named.
     * Without this key every imported activity lands as "Untitled activity"
     * and is renamed by hand — the dominant cost when importing a catalogue.
     */
    title?: string;
    course?: string;
    unit?: string;
    tags?: string[];
    pedagogicalRole?: PedagogicalRole;
    // Activity-level SETTINGS. Every one of these was editor-only before, so
    // an imported activity arrived needing a drawer visit to become what its
    // author already knew it was ("this is an exit ticket, answers hidden
    // until check, no calculator"). Flat enums only — the nested knobs
    // (calculator restrictions, print layout, typography) stay editor-only
    // until something actually demands them.
    submissionMode?: ActivityMeta['submissionMode'];
    revisionMode?: ActivityMeta['revisionMode'];
    activityType?: ActivityMeta['activityType'];
    answerFeedback?: ActivityMeta['answerFeedback'];
    /**
     * Blank hand-working space below EVERY problem, in rem — the activity-wide
     * `print.workSpace` default, same unit and same meaning as ⚙ → Print →
     * "Work space per problem (rem)".
     *
     * THE FIRST NESTED KNOB THIS FENCE REACHES, and deliberately so. The
     * taxonomy slice drew the line at "flat enums only — the nested knobs
     * (calculator restrictions, print layout, typography) stay editor-only
     * until something actually demands them". Authoring a ~150-activity
     * printable catalogue is that demand: without it every sheet imports with
     * zero writing room and needs a ⚙ visit before it can be handed out, which
     * is the same per-activity tax the `title` key was added to remove.
     *
     * Scoped tightly on purpose — this is ONE number out of PrintConfig's ten
     * fields, not the print object. Per-PROBLEM overrides stay editor-only
     * (ruled 2026-08-21: most problems want the same room, and the one type
     * that needs a per-problem key — fill_in_blank — has no fence to hang it
     * on). Revisit if uniform spacing starts costing more than it saves.
     */
    workSpace?: number;
    // The MODE, not a built tool: keeping this a flat string leaves
    // ImportedMeta a plain data bag, and lets the merge layer construct the
    // CalculatorTool from the schema factory (so restriction defaults are
    // never re-listed here). 'off' is distinct from absent — it lets an author
    // say "no calculator on this one" explicitly.
    calculatorMode?: 'off' | 'scientific' | 'graphing';
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
                return tokensToBlocks(tokens, spans, (line) => {
                    // parseInline returns one 'inline' token whose children are
                    // the real inline stream mapInline already knows how to walk.
                    const parsed = md.parseInline(line, {}) as unknown as MdToken[];
                    return parsed[0]?.children ?? [];
                });
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

// ---- Model A in-equation gaps (`\gap{answer}`) ------------------------------
// A gradeable gap INSIDE a rendered equation — the natural authoring for a
// "complete the derivation" step (faded worked examples, math completion
// problems). Inside $…$ / $$…$$, `\gap{answer}` becomes a `\placeholder[id]{…}`
// gap + a schema MathPrompt. Answer-in-gap DRAFT form (the answer stays embedded
// in the placeholder here, exactly as the editor stores a live gap; serialize
// empties it on save via emptyPlaceholders so the student page never leaks it).
// The prompt's answer is ASCII (latexToAscii), matching the editor's on-edit
// reconcile; grading defaults to 'value' equivalence, so any equivalent form
// (8, 8.0, 4+4) is accepted — no alternates syntax needed. Balanced-brace scan,
// so `\gap{\frac{1}{2}}` works. `|`-alternates are deliberately NOT parsed here
// (a `|` is a real LaTeX token — |x| absolute value); richer knobs
// (acceptableAnswers, exact-form, tolerance) are editor-only.
const GAP_MARKER = '\\gap{';

interface ImportedMathPrompt {
    id: string;
    answer: string;
    acceptableAnswers: string[];
}

function resolveMathGaps(
    latex: string,
    ctx: Ctx,
): { latex: string; prompts: ImportedMathPrompt[] } {
    if (!latex.includes(GAP_MARKER)) return { latex, prompts: [] };
    const prompts: ImportedMathPrompt[] = [];
    let out = '';
    let i = 0;
    while (i < latex.length) {
        const start = latex.indexOf(GAP_MARKER, i);
        if (start === -1) {
            out += latex.slice(i);
            break;
        }
        out += latex.slice(i, start);
        const open = start + GAP_MARKER.length - 1; // index of the `{`
        let depth = 0;
        let j = open;
        for (; j < latex.length; j++) {
            if (latex[j] === '{') depth++;
            else if (latex[j] === '}') {
                depth--;
                if (depth === 0) break;
            }
        }
        if (depth !== 0) {
            // Unbalanced braces — leave the remainder literal (never throw).
            out += latex.slice(start);
            break;
        }
        const answerLatex = latex.slice(open + 1, j);
        // MathLive-safe, document-unique id (uuid hyphens are unsafe in a
        // \placeholder marker, so strip them; prefix a letter to be safe).
        const id = 'g' + crypto.randomUUID().replace(/-/g, '');
        out += '\\placeholder[' + id + ']{' + answerLatex + '}';
        const answer = latexToAscii(answerLatex).trim();
        if (answer.length > 0) {
            prompts.push({ id, answer, acceptableAnswers: [] });
        } else {
            ctx.warnings.add(
                'Math gap: a \\gap{…} needs an answer inside the braces — left as an empty gap.',
            );
        }
        i = j + 1;
    }
    return { latex: out, prompts };
}

// The attrs for a math node (mathInline / mathBlock) built from a span's latex,
// resolving any `\gap{…}` gaps. `prompts` is emitted only when non-empty, so a
// gap-free equation re-serializes byte-identically (the schema's optional-no-
// default MathPrompt discipline).
function mathAttrs(latex: string, ctx: Ctx): Record<string, unknown> {
    const { latex: resolved, prompts } = resolveMathGaps(latex, ctx);
    return prompts.length > 0 ? { latex: resolved, prompts } : { latex: resolved };
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
    // Reference-panel content accumulated from ```reference fences (a side
    // channel — the fence contributes NO body blocks). Blocks append across
    // fences; the first authored title sticks.
    refPanelBlocks: JSONContent[];
    refPanelTitle?: string;
    // Vocabulary definitions collected from ```definitions fences, keyed by the
    // lower-cased term. Filled in a PRE-PASS over the token list so a [[term]]
    // reference in the body resolves regardless of whether the fence sits above
    // or below it. See parseDefinitionsFence.
    definitions: Map<string, DefinitionBlock[]>;
    // Activity metadata from a ```meta fence, filled in the same PRE-PASS as
    // definitions. Undefined until a fence supplies something.
    meta?: ImportedMeta;
    /**
     * markdown-it's INLINE parse, as a narrow seam.
     *
     * Fence bodies are parsed line by line by this file rather than by
     * markdown-it, so until 2026-08-21 they never saw an emphasis token and
     * `**bold**` reached the document as four literal asterisks — in ```columns,
     * ```worked, ```faded, ```reference and ```definitions alike, while the doc
     * promised bold/italic/code in all of them. Handing the line back to the
     * real inline parser is what makes the promise true, and reuses mapInline
     * so a fence and a paragraph mean exactly the same thing by `**x**`.
     *
     * A function rather than the MarkdownIt instance: this is the only thing
     * the mapper needs, and a whole parser on the context invites a second,
     * divergent parse somewhere down the line.
     */
    inline: (text: string) => MdToken[];
}

function tokensToBlocks(
    tokens: MdToken[],
    spans: MathSpan[],
    inline: (text: string) => MdToken[],
): ImportResult {
    const ctx: Ctx = {
        warnings: new Set(),
        spans,
        refPanelBlocks: [],
        definitions: new Map(),
        inline,
    };
    // Pre-pass: collect every ```definitions fence before mapping any body
    // block, so [[term]] resolves in either direction. Scanning markdown-it's
    // TOKENS (not the raw source) means fence detection is exactly what the
    // real parse will do — no second, divergent fence regex.
    // The ```meta fence rides the SAME pre-pass, for a different reason than
    // definitions: metadata describes the whole activity, so it must not depend
    // on where in the paste the author happened to put the fence.
    for (const token of tokens) {
        const info = (token.info ?? '').trim();
        if (token.type !== 'fence') continue;
        if (info === 'definitions') parseDefinitionsFence(token.content, ctx);
        else if (info === 'meta') parseMetaFence(token.content, ctx);
    }
    const blocks = mapBlocks(nest(tokens), ctx);
    const result: ImportResult = { blocks, warnings: [...ctx.warnings] };
    if (ctx.refPanelBlocks.length > 0) {
        result.referencePanel = ctx.refPanelTitle
            ? { title: ctx.refPanelTitle, blocks: ctx.refPanelBlocks }
            : { blocks: ctx.refPanelBlocks };
    }
    if (ctx.meta) result.meta = ctx.meta;
    return result;
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
            if ((node.token.info ?? '').trim() === 'definitions') {
                // Already consumed by the pre-pass in tokensToBlocks. Like
                // ```reference this is a SIDE CHANNEL — it contributes no body
                // blocks. Degrade to plain text only if nothing parsed at all,
                // so a malformed fence is still visible to the teacher.
                return ctx.definitions.size > 0
                    ? []
                    : [rawTextParagraph(node.token.content)];
            }
            if ((node.token.info ?? '').trim() === 'meta') {
                // Already consumed by the pre-pass in tokensToBlocks. The
                // PUREST side channel in this file: it contributes no body
                // blocks, no panel blocks, and no mark content — it describes
                // the activity. Degrade to plain text only when nothing parsed
                // at all, so a malformed fence stays visible to the teacher
                // instead of vanishing (the ```definitions precedent).
                return ctx.meta ? [] : [rawTextParagraph(node.token.content)];
            }
            if ((node.token.info ?? '').trim() === 'reference') {
                // Side channel: the fence's blocks land in ctx.refPanelBlocks
                // (the activity's reference panel), NOT the body — so a
                // successful parse contributes zero body blocks here.
                if (parseReferenceFence(node.token.content, ctx)) return [];
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
        return [{ type: 'mathBlock', attrs: mathAttrs(soleSpan.latex, ctx) }];
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
                    ? { type: 'mathInline', attrs: mathAttrs(span.latex, ctx) }
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
// inlineSchemaContent; the editor's definition dialog adds richer blocks later).
// Split on the FIRST `::` (the DSL's label::detail convention). WITHOUT `::` the
// brackets are a REFERENCE to a ```definitions fence entry (see
// parseDefinitionsFence) — that is the path that carries block content. An empty
// term or definition, or an unresolved reference, keeps the literal `[[…]]`.
//
// A definition's content is a BLOCK array (schema: DefinitionBlock), so the
// inline run is wrapped in one paragraph here. The serializer would normalize an
// un-wrapped array the same way, but emitting the canonical shape directly keeps
// the importer's output identical to what the editor writes.
function makeDefinition(
    inner: string,
    marks: string[],
    ctx: Ctx,
): JSONContent | null {
    const marksList = [...new Set(marks)].map((type) => ({ type }));
    const idx = inner.indexOf('::');

    // No `::` — a REFERENCE to a ```definitions fence entry, matched
    // case-insensitively. This is the block-capable path: the fence holds
    // headings, display math, lists, figures, which an inline `::` cannot.
    // Marking stays teacher-explicit (they typed [[…]]), so the design's
    // never-auto-define guardrail holds.
    if (idx === -1) {
        const term = inner.trim();
        const content = ctx.definitions.get(term.toLowerCase());
        if (!content) {
            if (term.length > 0 && ctx.definitions.size > 0) {
                ctx.warnings.add(
                    `“${term}” isn’t in a \`\`\`definitions fence — the [[…]] was left as plain text.`,
                );
            }
            return null;
        }
        return {
            type: 'text',
            text: term,
            marks: [...marksList, { type: 'definition', attrs: { content } }],
        };
    }

    const term = inner.slice(0, idx).trim();
    const defText = inner.slice(idx + 2).trim();
    if (term.length === 0 || defText.length === 0) return null;
    const content = inlineSchemaContent(defText, ctx);
    if (content.length === 0) return null;
    return {
        type: 'text',
        text: term,
        marks: [
            ...marksList,
            {
                type: 'definition',
                attrs: { content: [{ type: 'paragraph', content }] },
            },
        ],
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
    // Through the REAL inline parser, then mapInline — the same walk a
    // top-level paragraph gets. Doing it here rather than hand-rolling an
    // emphasis regex is what keeps `**x**` meaning one thing across the whole
    // format; the math has already been lifted out into sentinels (private-use
    // characters markdown-it treats as ordinary text), so no LaTeX reaches
    // CommonMark escaping.
    return mapInline(ctx.inline(remapped), ctx, allowBlanks);
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
        return {
            type: 'mathBlock',
            attrs: mathAttrs((mathOnly[1] ?? '').trim(), ctx),
        };
    }
    return blockFromInline(fenceInline(line, ctx, allowBlanks));
}

// ---- The shared body-line grammar: lists, headings, images ------------------
// Five surfaces parse LINE-BASED bodies — ```worked, ```faded, ```columns,
// ```reference and ```definitions — and until 2026-08-21 only the last two
// understood list runs, headings and images. The first three turned `- step`
// into a paragraph with a visible dash, which is why the format doc said
// "lists and images inside a worked example or a column are editor-only".
//
// The capability was never missing from the PRODUCT: WorkedExampleChild and
// FadedWorkedExampleChild both accept ImageBlock/BulletListBlock/
// OrderedListBlock, Column.blocks is the full Block union, and the viewer
// renders any registered type through ChildBlocks (no allowlist). Only the
// parser could not say it.
//
// These builders are the ONE home for the regexes and the node shapes, shared
// with parseContentLines below, so the two grouping loops cannot drift into
// two dialects of the same grammar — the reference fence's own header already
// makes that argument for its two surfaces ("one implementation, not two"), and
// this extends it to all five.
const BODY_BULLET = /^[-*]\s+(.+)$/;
const BODY_ORDERED = /^\d+[.)]\s+(.+)$/;
const BODY_HEADING = /^(#{1,3})\s+(.+)$/;
const BODY_IMAGE = /^!\[([^\]]*)\]\((\S+)\)$/;

function listBlockFrom(
    type: 'bulletList' | 'orderedList',
    items: JSONContent[][],
): JSONContent {
    return {
        type,
        content: items.map((content) => ({
            type: 'listItem',
            content: [{ type: 'paragraph', content }],
        })),
    };
}

function headingBlockFrom(m: RegExpExecArray, ctx: Ctx): JSONContent {
    return {
        type: 'heading',
        attrs: { level: (m[1] ?? '#').length },
        content: fenceInline((m[2] ?? '').trim(), ctx, false),
    };
}

function imageBlockFrom(
    m: RegExpExecArray,
    ctx: Ctx,
    surface: string,
): JSONContent | null {
    const src = (m[2] ?? '').trim();
    if (!src) {
        ctx.warnings.add(`${surface}: an image with no URL was skipped.`);
        return null;
    }
    return {
        type: 'image',
        attrs: { id: crypto.randomUUID(), src, alt: m[1] ?? '', caption: '' },
    };
}

/**
 * Group already-directive-stripped lines into body blocks. The caller removes
 * its own `title:`-style lines first, because the surfaces disagree about them
 * (an example's last title wins; a panel's first one sticks) and unifying that
 * would be a behaviour change disguised as a refactor.
 *
 * THE ONE SUBTLE RULE — a line carrying a `{{…}}` is never a list item when
 * blanks are live. In a faded example `1. Factor {{x+2}}` is a fill-in STEP,
 * which is the whole point of the block; grouping it into an ordered list would
 * both destroy the blank's block and double-number it against the (a)/(b) step
 * letters `showStepLabels` already draws. When blanks are NOT live (a worked
 * example, where `{{…}}` stays literal text) there is no step to protect, so
 * such a line groups like any other.
 */
function parseBodyLines(
    lines: readonly string[],
    ctx: Ctx,
    allowBlanks: boolean,
    surface: string,
): JSONContent[] {
    const blocks: JSONContent[] = [];
    let list: {
        type: 'bulletList' | 'orderedList';
        items: JSONContent[][];
    } | null = null;

    const flushList = (): void => {
        if (!list) return;
        blocks.push(listBlockFrom(list.type, list.items));
        list = null;
    };

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) {
            flushList();
            continue;
        }

        const isStep = allowBlanks && line.includes('{{');
        const bullet = isStep ? null : BODY_BULLET.exec(line);
        const ordered = bullet || isStep ? null : BODY_ORDERED.exec(line);
        if (bullet || ordered) {
            const type = bullet ? 'bulletList' : 'orderedList';
            const text = (bullet?.[1] ?? ordered?.[1] ?? '').trim();
            if (!list || list.type !== type) {
                flushList();
                list = { type, items: [] };
            }
            list.items.push(fenceInline(text, ctx, allowBlanks));
            continue;
        }
        flushList();

        const heading = BODY_HEADING.exec(line);
        if (heading) {
            blocks.push(headingBlockFrom(heading, ctx));
            continue;
        }

        const image = BODY_IMAGE.exec(line);
        if (image) {
            const block = imageBlockFrom(image, ctx, surface);
            if (block) blocks.push(block);
            continue;
        }

        blocks.push(fenceBodyBlock(line, ctx, allowBlanks));
    }
    flushList();
    return blocks;
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
        graph?: { axis: typeof DEFAULT_CHOICE_AXIS; drawables: Record<string, unknown>[] };
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
            // A `graph: <show-spec>` choice is a static graph FIGURE (ChoiceGraph)
            // — "which graph shows …" — instead of text/image. Reuses the ```graph
            // show: vocabulary; default axis; the graph IS the choice.
            let image: { src: string; alt: string } | undefined;
            let graph:
                | { axis: typeof DEFAULT_CHOICE_AXIS; drawables: Record<string, unknown>[] }
                | undefined;
            const graphMatch = /^graph:\s*(.+)$/i.exec(body);
            if (graphMatch) {
                graph =
                    parseChoiceGraph(
                        graphMatch[1]!.trim(),
                        ctx,
                        'Multiple-choice block',
                    ) ?? undefined;
                body = '';
            } else {
                // Optional per-choice image: markdown ![alt](url) anywhere in the
                // choice text (feedback already split off above). Extracted into
                // the option's figure slot; a choice may be image-only. An
                // unparseable URL stays as literal text so the author notices.
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
            }
            if (!body && !image && !graph)
                return fail('a choice line needs answer text');
            choices.push({
                id: crypto.randomUUID(),
                content: schemaInlineContent(body, ctx),
                correct,
                ...(feedback ? { feedback } : {}),
                ...(image ? { image } : {}),
                ...(graph ? { graph } : {}),
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
        graph?: { axis: typeof DEFAULT_CHOICE_AXIS; drawables: Record<string, unknown>[] };
    };
    const items: Side[] = [];
    const targets: Side[] = [];
    const key: Record<string, string> = {};

    const buildSide = (raw: string): Side | null => {
        const cleaned = raw.replace(/\\=/g, '=');
        // A `graph: <show-spec>` side is a static graph FIGURE (ChoiceGraph) —
        // "match the graph to its equation". Because a graph formula contains `=`,
        // prefer `->` as the pair separator on a graph line (y = 2x -> slope 2).
        const graphMatch = /^\s*graph:\s*(.+)$/i.exec(cleaned);
        if (graphMatch) {
            const graph = parseChoiceGraph(
                graphMatch[1]!.trim(),
                ctx,
                'Matching block',
            );
            if (graph) return { id: crypto.randomUUID(), content: [], graph };
            // parseChoiceGraph warned; fall through and treat as plain text.
        }
        const { text, image } = extractSideImage(cleaned);
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
    // Strip this fence's own directive lines, then hand the rest to the shared
    // body grammar (list runs, #-headings, images, $$math$$, blanks). `title:`
    // stays here because an example's LAST title wins while a panel's FIRST one
    // sticks — folding that into the grouper would be a behaviour change
    // wearing a refactor's clothes.
    const body: string[] = [];
    for (const rawLine of src.split('\n')) {
        const line = rawLine.trim();
        const t = /^title:\s*(.*)$/i.exec(line);
        if (t) {
            const v = (t[1] ?? '').trim();
            if (v) title = v;
            continue;
        }
        body.push(line);
    }
    const blocks = parseBodyLines(body, ctx, allowBlanks, label);

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
// separated by a line that is exactly `---`; an `options:` line anywhere sets
// ROW-level properties (`ruled` / `unruled`, the gridLines tri-state); every
// other non-blank line in a segment becomes one block via parseBodyLines (a paragraph, a $$…$$ math block,
// or a {{blank}} fill-in). 2–6 columns; an empty segment seeds an empty
// paragraph (a column needs ≥1 block). Emits a strict-grid `row` node directly —
// wrapBlocksStrict passes it through at the top level while wrapping the bare
// blocks around it. Line-per-block, like ```worked/```faded (rich per-column
// content — nested lists/headings — is editor-only; the fence is for simple
// side-by-side text).
function parseColumnsFence(src: string, ctx: Ctx): JSONContent | null {
    // `gridLines` is a ROW property, so its directive is pulled out BEFORE the
    // fence is cut into columns — an options line describes the whole row, and
    // a row has no position inside itself. Recognising it anywhere in the fence
    // is what makes `options: ruled` mean the same thing above the first `---`
    // and below the last one, which is the only behaviour an author can
    // predict without reading this function.
    //
    // The tri-state is the point, not a boolean: `ruled` forces the box ON,
    // `unruled` forces it OFF, and saying nothing stays 'inherit' so the
    // activity-wide ⚙ toggle governs. A teacher who ruled the whole activity
    // needs a way to opt ONE row out, and that is what `unruled` is for.
    let gridLines: 'inherit' | 'on' | 'off' = 'inherit';

    // Split into column segments on a `---` divider line.
    const segments: string[][] = [[]];
    for (const rawLine of src.split('\n')) {
        const trimmed = rawLine.trim();
        if (trimmed === '---') {
            segments.push([]);
            continue;
        }

        const directive = /^options:\s*(.*)$/i.exec(trimmed);
        if (directive) {
            for (const opt of (directive[1] ?? '')
                .split(',')
                .map((o) => o.trim().toLowerCase())) {
                if (opt === 'ruled') gridLines = 'on';
                else if (opt === 'unruled') gridLines = 'off';
                else if (opt)
                    ctx.warnings.add(
                        `Columns block: unknown option “${opt}” (use ruled or unruled) — ignored.`,
                    );
            }
            continue;
        }

        segments[segments.length - 1]!.push(rawLine);
    }

    const columns: JSONContent[] = segments.map((lines) => {
        // Column.blocks is the FULL Block union, so a column takes the same
        // body grammar an example does — lists, headings and images included.
        const blocks = parseBodyLines(lines, ctx, true, 'Columns block');
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
        attrs: { id: '', gridLines },
        content: columns,
    };
}

// ```reference fence — content for the activity's REFERENCE PANEL (the
// summonable resources window students consult while working + the print-top
// box). A side channel: blocks accumulate on ctx.refPanelBlocks and the fence
// contributes nothing to the body. Line grammar:
//   title: Formula sheet          panel title (first authored title sticks)
//   $$…$$                         a displayed equation
//   - item  /  1. item            consecutive lines group into one list
//   # / ## / ### Heading          a heading (three levels)
//   ![alt](https://…)             an image
//   axes: -5..5, -5..5            window for the NEXT figure (default ±10)
//   graph: <show-spec>            a drawable, in the shared show:/choice
//                                 grammar (point/line/curve/segment/ray/region)
//   anything else                 a paragraph ($inline$ math ok; {{…}} stays
//                                 literal — panel content is never gradeable)
//
// CONSECUTIVE graph: lines draw on ONE shared grid (option B, author-ruled):
// "these two lines are parallel" needs both lines on the same figure. Any
// other line ends the figure; a later graph: run starts a new one. Same
// "lines that touch merge" spirit as the paragraph rule.
//
// Returns false (→ the whole fence degrades to plain text) only when NOTHING
// in it parsed to a block; a bad graph:/axes: line warns and is skipped so one
// typo never sinks a whole formula sheet.
// The shared LINE GRAMMAR behind the ```reference and ```definitions fences.
// One implementation, not two: a formula sheet and a rich definition accept the
// same vocabulary ($$…$$, list runs, #-headings, images, graph: runs, axes:),
// so a teacher — or an AI writing to the format doc — learns it once.
//
// `surface` prefixes the warnings ("Reference sheet: …" / "Definition: …") so a
// message still says which fence it came from.
function parseContentLines(
    src: string,
    ctx: Ctx,
    surface: string,
): { blocks: JSONContent[]; title: string | undefined } {
    const blocks: JSONContent[] = [];
    let title: string | undefined;

    // Pending run state. A list run and a figure run are mutually exclusive
    // (any line that isn't part of the run flushes it).
    let list: { type: 'bulletList' | 'orderedList'; items: JSONContent[][] } | null = null;
    let figure: { drawables: Record<string, unknown>[] } | null = null;
    // Window for the NEXT figure, set by an axes: line; consumed by the run it
    // precedes, then back to the default.
    let pendingAxis: typeof DEFAULT_CHOICE_AXIS | null = null;

    const flushList = (): void => {
        if (!list) return;
        blocks.push(listBlockFrom(list.type, list.items));
        list = null;
    };
    const flushFigure = (): void => {
        if (!figure) return;
        if (figure.drawables.length > 0) {
            blocks.push({
                type: 'graphFigure',
                attrs: {
                    id: crypto.randomUUID(),
                    axis: pendingAxis ?? DEFAULT_CHOICE_AXIS,
                    drawables: figure.drawables,
                },
            });
        }
        figure = null;
        pendingAxis = null;
    };

    for (const rawLine of src.split('\n')) {
        const line = rawLine.trim();
        if (!line) {
            flushList();
            flushFigure();
            continue;
        }

        const t = /^title:\s*(.*)$/i.exec(line);
        if (t) {
            flushList();
            flushFigure();
            const v = (t[1] ?? '').trim();
            if (v && title === undefined) title = v;
            continue;
        }

        const axes = /^axes:\s*(.*)$/i.exec(line);
        if (axes) {
            flushList();
            flushFigure();
            const a = /^(-?[\d.]+)\s*\.\.\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\.\.\s*(-?[\d.]+)$/.exec(
                (axes[1] ?? '').trim(),
            );
            if (!a) {
                ctx.warnings.add(
                    `${surface}: axes must look like "-5..5, -5..5" — the line was skipped.`,
                );
                continue;
            }
            pendingAxis = {
                ...DEFAULT_CHOICE_AXIS,
                xMin: Number(a[1]),
                xMax: Number(a[2]),
                yMin: Number(a[3]),
                yMax: Number(a[4]),
            };
            continue;
        }

        const graph = /^graph:\s*(.*)$/i.exec(line);
        if (graph) {
            flushList();
            const r = parseShowDrawable((graph[1] ?? '').trim());
            if (!r.ok) {
                ctx.warnings.add(
                    `${surface}: ${r.message} — the graph line was skipped.`,
                );
                continue;
            }
            if (r.drawable.kind === 'expression') {
                ctx.warnings.add(
                    `${surface}: a graph figure can’t use “expression” (it needs the calculator) — the line was skipped.`,
                );
                continue;
            }
            figure = figure ?? { drawables: [] };
            figure.drawables.push(r.drawable);
            continue;
        }

        // Anything below is a non-figure block line.
        flushFigure();

        const bullet = BODY_BULLET.exec(line);
        const ordered = bullet ? null : BODY_ORDERED.exec(line);
        if (bullet || ordered) {
            const type = bullet ? 'bulletList' : 'orderedList';
            const text = (bullet?.[1] ?? ordered?.[1] ?? '').trim();
            if (!list || list.type !== type) {
                flushList();
                list = { type, items: [] };
            }
            list.items.push(fenceInline(text, ctx, false));
            continue;
        }
        flushList();

        const heading = BODY_HEADING.exec(line);
        if (heading) {
            blocks.push(headingBlockFrom(heading, ctx));
            continue;
        }

        const image = BODY_IMAGE.exec(line);
        if (image) {
            const block = imageBlockFrom(image, ctx, surface);
            if (block) blocks.push(block);
            continue;
        }

        blocks.push(fenceBodyBlock(line, ctx, false));
    }
    flushList();
    flushFigure();
    return { blocks, title };
}

function parseReferenceFence(src: string, ctx: Ctx): boolean {
    const { blocks, title } = parseContentLines(src, ctx, 'Reference sheet');
    if (blocks.length === 0) {
        ctx.warnings.add(
            'Reference sheet: needs at least one content line — imported as plain text.',
        );
        return false;
    }
    ctx.refPanelBlocks.push(...blocks);
    if (title && ctx.refPanelTitle === undefined) ctx.refPanelTitle = title;
    return true;
}

// The ```definitions fence — rich vocabulary definitions, referenced from the
// body by [[term]]. Entries are separated by a `---` line and headed by
// `term: <word>`; the rest of each entry is the shared line grammar above.
//
// This is the block-capable half of the definition import story; the inline
// `[[term :: definition]]` form is unchanged and still right for a one-liner.
// See docs/design/definition-rich-content.md §6.
//
// Parsed in a PRE-PASS over the token list (collectDefinitionFences), before any
// body block is mapped, so a [[term]] reference resolves no matter whether it
// appears above or below the fence.
// The ```meta fence — activity-level metadata (taxonomy arc Drop 2).
//
// Plain `key: value` lines, no nesting, no runs — deliberately the simplest
// grammar in this file, because it is the one an AI writes on EVERY paste and
// the one a teacher is most likely to hand-edit:
//
//     ```meta
//     title: Factoring Trinomials
//     course: Algebra I
//     unit: Quadratics
//     tags: factoring, vertex form, word problems
//     role: lesson
//     ```
//
// Tags normalize through normalizeTags — the SAME function the drawer's chip
// input uses, which is the whole point of that function existing (R5). A second
// normalization here would fragment the vocabulary between the two write paths
// the arc created, which is exactly the failure the single-function rule exists
// to prevent.
//
// Unknown keys warn rather than fail: the fence is metadata, and a typo'd key
// must never cost the author the body content in the same paste.
/**
 * Read one enum-valued meta key, or warn and skip. Values are matched
 * case-insensitively with spaces/hyphens folded to underscores, so an author
 * (or an AI) writing "Exit Ticket" lands on `exit_ticket` rather than being
 * told off for formatting.
 */
function metaEnum<T extends string>(
    key: string,
    raw: string,
    allowed: readonly T[],
    ctx: Ctx,
): T | undefined {
    const value = raw.toLowerCase().replace(/[\s-]+/g, '_');
    if ((allowed as readonly string[]).includes(value)) return value as T;
    ctx.warnings.add(
        `Meta: ${key} “${raw}” isn’t one of ${allowed.join(', ')} — it was skipped.`,
    );
    return undefined;
}

function parseMetaFence(src: string, ctx: Ctx): void {
    const meta: ImportedMeta = ctx.meta ?? {};
    for (const rawLine of src.split('\n')) {
        const line = rawLine.trim();
        if (line === '') continue;
        const m = /^([A-Za-z_]+)\s*:\s*(.*)$/.exec(line);
        if (!m) {
            ctx.warnings.add(
                `Meta: “${line}” isn’t a \`key: value\` line and was skipped.`,
            );
            continue;
        }
        const key = (m[1] ?? '').toLowerCase();
        const value = (m[2] ?? '').trim();
        if (value === '') {
            ctx.warnings.add(`Meta: “${key}:” had no value and was skipped.`);
            continue;
        }
        switch (key) {
            case 'title':
                meta.title = value;
                break;
            case 'course':
                meta.course = value;
                break;
            case 'unit':
                meta.unit = value;
                break;
            case 'tags': {
                const tags = normalizeTags(value.split(','));
                // Accumulate across fences and across repeated tags: lines,
                // matching how ```reference blocks append rather than replace.
                if (tags.length > 0) {
                    meta.tags = normalizeTags([...(meta.tags ?? []), ...tags]);
                }
                break;
            }
            case 'submissionmode':
            case 'submission': {
                const v = metaEnum(
                    'submission mode', value,
                    ['single', 'locked', 'free'] as const, ctx,
                );
                if (v) meta.submissionMode = v;
                break;
            }
            case 'revisionmode':
            case 'revision': {
                const v = metaEnum(
                    'revision mode', value, ['free', 'locked'] as const, ctx,
                );
                if (v) meta.revisionMode = v;
                break;
            }
            case 'type':
            case 'activitytype': {
                const v = metaEnum(
                    'activity type', value,
                    ['worksheet', 'exit_ticket', 'warm_up', 'review'] as const,
                    ctx,
                );
                if (v) meta.activityType = v;
                break;
            }
            case 'feedback':
            case 'answerfeedback': {
                const v = metaEnum(
                    'answer feedback', value,
                    ['immediate', 'on_check'] as const, ctx,
                );
                if (v) meta.answerFeedback = v;
                break;
            }
            case 'calculator': {
                const v = metaEnum(
                    'calculator', value,
                    ['off', 'scientific', 'graphing'] as const, ctx,
                );
                if (v) meta.calculatorMode = v;
                break;
            }
            case 'work':
            case 'workspace': {
                // Lines, inches, centimetres, millimetres or bare rem — see
                // lib/workSpaceUnits.ts for why the fence takes all of them and
                // why the doc leads with lines (ruling D6).
                const rem = parseWorkSpace(value);
                if (rem === null) {
                    ctx.warnings.add(
                        `Meta: work “${value}” isn’t an amount of space — try “3 lines”, “1in”, “2.5cm” or a plain number of rem. Ignored.`,
                    );
                    break;
                }
                meta.workSpace = rem;
                break;
            }
            case 'role': {
                const role = asPedagogicalRole(value.toLowerCase());
                if (role) meta.pedagogicalRole = role;
                else
                    ctx.warnings.add(
                        `Meta: role “${value}” isn’t one of lesson, review or practice — it was skipped.`,
                    );
                break;
            }
            default:
                ctx.warnings.add(
                    `Meta: “${key}” isn’t a recognized key (title, course, unit, tags, role, type, submission, revision, feedback, calculator) and was skipped.`,
                );
        }
    }
    if (Object.keys(meta).length > 0) ctx.meta = meta;
}

function parseDefinitionsFence(src: string, ctx: Ctx): void {
    // Split on a line that is exactly `---`. (markdown-it never sees these —
    // they are inside a fence — so there is no thematic-break ambiguity.)
    const entries: string[] = [];
    let current: string[] = [];
    for (const rawLine of src.split('\n')) {
        if (/^\s*---\s*$/.test(rawLine)) {
            entries.push(current.join('\n'));
            current = [];
            continue;
        }
        current.push(rawLine);
    }
    entries.push(current.join('\n'));

    for (const entry of entries) {
        if (!entry.trim()) continue;
        // The term: line heads the entry; everything else is content.
        let term: string | undefined;
        const bodyLines: string[] = [];
        for (const rawLine of entry.split('\n')) {
            const m = /^\s*term:\s*(.*)$/i.exec(rawLine);
            if (m && term === undefined) {
                term = (m[1] ?? '').trim();
                continue;
            }
            bodyLines.push(rawLine);
        }
        if (!term) {
            ctx.warnings.add(
                'Definitions: an entry with no "term:" line was skipped.',
            );
            continue;
        }
        const { blocks } = parseContentLines(
            bodyLines.join('\n'),
            ctx,
            'Definition',
        );
        if (blocks.length === 0) {
            ctx.warnings.add(
                `Definitions: “${term}” has no definition text — the entry was skipped.`,
            );
            continue;
        }
        // Tiptap-shaped blocks become canonical DefinitionBlock[] through the
        // SAME validated converter the dialog uses, so a block outside the
        // definition subset (a callout, a question) cannot slip in here either.
        const content = tiptapToDefinitionContent({
            type: 'doc',
            content: blocks,
        });
        if (content.length === 0) {
            ctx.warnings.add(
                `Definitions: “${term}” had no content a definition can hold — the entry was skipped.`,
            );
            continue;
        }
        const key = term.toLowerCase();
        if (ctx.definitions.has(key)) {
            ctx.warnings.add(
                `Definitions: “${term}” is defined more than once — the first entry was kept.`,
            );
            continue;
        }
        ctx.definitions.set(key, content);
    }
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
//
// MULTI-LINE `answer:` / `solution:` (answer-key slice, ruling E5.6). The two
// teacher-only fields the answer key prints. Unlike every other key in this
// file they accept CONTINUATION LINES, because a worked answer is rarely one
// line and forcing a teacher to write one long run-on is how a key stops being
// readable. The rule, in one sentence:
//
//   a bare line belongs to the most recent of `prompt:`, `answer:`, `solution:`
//
// so the target starts at the prompt (preserving the existing behaviour that a
// bare line IS the prompt), and the single-line keys — starter/words/rubric —
// leave it alone rather than silently capturing the lines after them.
// Continuation lines join with HARD BREAKS, not spaces: the author wrote
// separate lines because the steps are separate.
//
// Both fields are stored as CANONICAL InlineNode[] attrs (schemaInlineContent),
// which is the shape serialize.ts reads back — the round-trip that ruling E5.1
// made mandatory after the same seam killed the `problem` block.
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
    const answerLines: string[] = [];
    const solutionLines: string[] = [];
    // Which field a bare line continues. See the header note: the prompt owns
    // bare lines until an `answer:` or `solution:` key claims them.
    let target = promptLines;

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
            target = promptLines;
            if (v) promptLines.push(v);
            continue;
        }

        const a = /^answer:\s*(.*)$/i.exec(line);
        if (a) {
            const v = (a[1] ?? '').trim();
            target = answerLines;
            if (v) answerLines.push(v);
            continue;
        }

        const sol = /^solution:\s*(.*)$/i.exec(line);
        if (sol) {
            const v = (sol[1] ?? '').trim();
            target = solutionLines;
            if (v) solutionLines.push(v);
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

        target.push(line);
    }

    if (promptLines.length === 0) {
        ctx.warnings.add(label + ': needs a prompt — imported as plain text.');
        return null;
    }

    const rubric = criteria.length > 0 ? { criteria } : null;
    const content = fenceInline(promptLines.join(' '), ctx, false);
    const answer = joinKeyLines(answerLines, ctx);
    const solution = joinKeyLines(solutionLines, ctx);

    if (kind === 'essay') {
        return {
            type: 'essay',
            attrs: { id: '', placeholder, wordMin, wordMax, rubric, answer, solution },
            content,
        };
    }
    return {
        type: 'shortAnswer',
        attrs: { id: '', placeholder, rubric, answer, solution },
        content,
    };
}

// Continuation lines → one canonical InlineNode[], separated by HARD BREAKS.
// `hard_break` is the SCHEMA literal, not Tiptap's `hardBreak`: these ride as
// attrs in the schema's own shape, and serialize.ts sanitizes them against
// InlineNode, which would drop a Tiptap-shaped break as malformed — quietly
// flattening a worked answer into one line.
function joinKeyLines(lines: string[], ctx: Ctx): InlineNode[] | null {
    if (lines.length === 0) return null;
    const out: InlineNode[] = [];
    lines.forEach((line, i) => {
        if (i > 0) out.push({ type: 'hard_break' });
        out.push(...schemaInlineContent(line, ctx));
    });
    return out.length > 0 ? out : null;
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

// Default coordinate window for a CHOICE graph figure (MC / matching), matching
// the ```graph fence default. Choice figures have no axis-authoring syntax
// (the editor tunes the window after import), so they all start here.
const DEFAULT_CHOICE_AXIS = {
    xMin: -10,
    xMax: 10,
    yMin: -10,
    yMax: 10,
    xGridStep: 1,
    yGridStep: 1,
    showGrid: true,
    snapToGrid: true,
};

// Parse ONE `show:`-style drawable spec — shared by the ```graph fence's show:
// lines and by MC / matching choice `graph:` figures. Returns the drawable or a
// teacher-safe error message; the caller decides how to surface a failure (the
// graph fence fails the whole block to plain text; a choice keeps the choice and
// warns). `point (x,y) [open|closed] ["label"]`, `line|curve <equation>
// [dashed]`, `expression <formula>`, `segment (a,b) (c,d)`,
// `ray (a,b) (c,d) [open]`, `region (x,y), …`.
type ShowResult =
    | { ok: true; drawable: Record<string, unknown> }
    | { ok: false; message: string };
function parseShowDrawable(value: string): ShowResult {
    const style = /\b(dashed|dotted)\b/i.test(value) ? 'dashed' : undefined;
    const label = /"([^"]*)"/.exec(value)?.[1];
    const endpoint = /\bopen\b/i.test(value)
        ? 'open'
        : /\bclosed\b/i.test(value)
          ? 'closed'
          : undefined;
    const body = value
        .replace(/\bdashed\b|\bdotted\b|\bopen\b|\bclosed\b|"[^"]*"/gi, '')
        .trim();
    const kindMatch =
        /^(point|line|curve|expression|segment|ray|region)\s+(.+)$/i.exec(body);
    if (!kindMatch) return { ok: false, message: `unrecognized show line "${value}"` };
    const kind = (kindMatch[1] ?? '').toLowerCase();
    const rest = (kindMatch[2] ?? '').trim();
    if (kind === 'point') {
        const p = parsePointList(rest);
        if (!p || p.length !== 1) return { ok: false, message: 'show point needs one (x, y)' };
        return {
            ok: true,
            drawable: {
                kind: 'point',
                at: p[0],
                ...(label ? { label } : {}),
                ...(endpoint ? { style: endpoint } : {}),
            },
        };
    }
    if (kind === 'segment' || kind === 'ray') {
        const p = parsePointList(rest);
        if (!p || p.length !== 2) return { ok: false, message: `show ${kind} needs two points` };
        return {
            ok: true,
            drawable:
                kind === 'segment'
                    ? { kind, from: p[0], to: p[1] }
                    : {
                          kind,
                          from: p[0],
                          through: p[1],
                          ...(endpoint ? { fromStyle: endpoint } : {}),
                      },
        };
    }
    if (kind === 'region') {
        const v = parsePointList(rest);
        if (!v || v.length < 3) return { ok: false, message: 'show region needs at least 3 vertices' };
        return { ok: true, drawable: { kind: 'polygon', vertices: v, filled: true } };
    }
    if (kind === 'expression') {
        return {
            ok: true,
            drawable: { kind: 'expression', expression: rest, ...(style ? { style } : {}) },
        };
    }
    // line / curve: a freeform equation or inequality (pictured).
    const parsed = parseGraphFormula(rest);
    if (parsed.kind === 'function') {
        return {
            ok: true,
            drawable: {
                kind: 'curve',
                model: parsed.model,
                ...(style ? { style } : {}),
                ...(parsed.domain ? { domain: toCurveDomain(parsed.domain) } : {}),
            },
        };
    }
    if (parsed.kind === 'inequality') {
        return {
            ok: true,
            drawable: {
                kind: 'curve',
                model: parsed.boundary,
                style: parsed.strict ? 'dashed' : (style ?? 'solid'),
                shade: parsed.side,
                ...(parsed.domain ? { domain: toCurveDomain(parsed.domain) } : {}),
            },
        };
    }
    // Anything else plots as a sampled expression.
    return {
        ok: true,
        drawable: { kind: 'expression', expression: rest, ...(style ? { style } : {}) },
    };
}

// Build a CHOICE `graph:` figure (MC choice / matching side) from a show-spec —
// a ChoiceGraph { axis, drawables } with the default window and ONE drawable.
// `expression` drawables are rejected: a ChoiceGraph renders kit-free (inline
// SVG), which can't sample expressions (see multiple-choice.ts ChoiceGraph).
// Returns null + a warning on any failure so the caller keeps the choice/side.
function parseChoiceGraph(
    spec: string,
    ctx: Ctx,
    label: string,
): { axis: typeof DEFAULT_CHOICE_AXIS; drawables: Record<string, unknown>[] } | null {
    const r = parseShowDrawable(spec);
    if (!r.ok) {
        ctx.warnings.add(`${label}: ${r.message} — the graph was skipped.`);
        return null;
    }
    if (r.drawable.kind === 'expression') {
        ctx.warnings.add(
            `${label}: a graph figure can’t use “expression” (it needs the calculator) — skipped.`,
        );
        return null;
    }
    return { axis: DEFAULT_CHOICE_AXIS, drawables: [r.drawable] };
}

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
                // 'dotted' is an accepted synonym for 'dashed'; style/endpoint/
                // label parsing lives in the shared parseShowDrawable (also used
                // by MC/matching choice `graph:` figures). Same failure behaviour:
                // a bad show line fails the whole block to plain text.
                const r = parseShowDrawable(value);
                if (!r.ok) return fail(r.message);
                drawables.push(r.drawable);
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

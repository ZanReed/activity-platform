// =============================================================================
// serialize.ts — Bridge between Tiptap JSON and ActivityDocument
// -----------------------------------------------------------------------------
// The only place in the codebase that knows about both formats. The editor
// produces Tiptap JSON; the renderer reads ActivityDocument; serialize
// translates between them. The editor never imports from @activity/schema;
// the renderer never imports anything Tiptap. Serialize bridges them.
//
// Two directions:
//   tiptapToActivity — used at save / publish time
//   activityToTiptap — used when loading an existing activity into the editor
//
// Phase 1 scope: paragraph, heading, math_block, bullet_list, ordered_list
// (block-level) + text-with-marks, math_inline (inline-level). Stage 13.5
// adds fill_in_blank block plus blank inline tokens. Stage 13.5 Drop 2c
// extends blank serialization to include hint + mistakeFeedback.
//
// Inline alphabet split:
//   - tiptapInlineToActivity / activityInlineToTiptap: standard inline
//     (text + math_inline). Used by paragraph, heading.
//   - tiptapFillInBlankInlineToActivity / activityFillInBlankInlineToTiptap:
//     wider alphabet adding blank tokens. Used by fill_in_blank only.
//   This mirrors the schema's split (InlineNode vs FillInBlankInline) so
//   types narrow correctly at each call site — paragraph can't accidentally
//   carry a blank, and fill_in_blank's blanks are typed.
//
// IDs: ActivityDocument blocks have UUIDs; Tiptap doesn't. tiptapToActivity
// generates fresh UUIDs on every call (including for blanks). Structural
// identity is preserved across round trips, but the IDs themselves are not
// stable. Phase 4 collaboration will require stable IDs; that's a separate
// problem.
// =============================================================================

import type {
    ActivityDocument,
    ActivityMeta,
    ReferencePanel,
    CalculatorTool,
    Block,
    InlineNode,
    FillInBlankInline,
    BlankToken,
    Mark,
    DefinitionMark,
    DefinitionContentInline,
    DefinitionImage,
    SimpleMarkType,
    Section,
    BulletListBlock,
    OrderedListBlock,
    ListItem,
    FillInBlankBlock,
    ColumnsBlock,
    Column,
    ColumnCellBlock,
    ImageBlock,
    MathBlock,
    InteractiveGraphBlock,
    MultipleChoiceBlock,
    MultipleChoiceOption,
    MatchingBlock,
    MatchingItem,
    MatchingTarget,
    OrderingBlock,
    OrderingItem,
} from '@activity/schema';
import {
    SIMPLE_MARK_TYPES,
    InlineNode as InlineNodeSchema,
    DefinitionContentInline as DefinitionContentInlineSchema,
    createInteractiveGraphBlock,
    createMultipleChoiceOption,
    createMatchingItem,
    createMatchingTarget,
    createOrderingItem,
    ChoiceImage,
    ChoiceGraph,
} from '@activity/schema';
import type { JSONContent } from '@tiptap/react';

// Canonical inline content (rich text + inline math) as the schema models it.
// Used for the rich popover fields — blank hint, mistake feedback, problem
// solution — which the editor stores as InlineNode[] and serialize sanitizes
// against the schema at save time (see sanitizeInlineNodes below). Re-exported
// from this bridge module so editor components can name the type without
// importing @activity/schema directly.
export type InlineNodes = InlineNode[];

// Simple (attribute-free) Tiptap marks the schema accepts. Tiptap marks not
// listed here (e.g. 'strike', 'link') are silently dropped. The 'definition'
// mark carries attributes and is handled separately in extractMarks.
const SUPPORTED_SIMPLE_MARKS: ReadonlySet<SimpleMarkType> = new Set(SIMPLE_MARK_TYPES);

// Attrs-stored rich inline content (choice text/feedback, solutions, blank
// hints, mistake feedback) is written by the nested mini-editors in canonical
// InlineNode[] form — but the attr itself is untyped JSON, so anything that
// writes attrs directly (an importer, a hand-crafted payload) can store the
// wrong shape, and downstream consumers (activityInlineToTiptap, the renderer)
// assume the canonical one. Sanitize with the real schema: validate each node,
// drop malformed entries, keep the rest (the ChoiceImage/ChoiceGraph posture).
// Parsing also fills the `marks` default, so entries that omitted it come out
// canonical rather than crashing `node.marks` consumers.
//
// Every drop is warned: before sanitize existed, a malformed shape failed the
// whole-document save gate loudly and the stored draft survived; a silent drop
// here would turn the same class of bug into invisible content loss on the
// next autosave.
function sanitizeInlineNodes(raw: unknown): InlineNode[] {
    if (!Array.isArray(raw)) return [];
    const nodes: InlineNode[] = [];
    for (const node of raw) {
        const parsed = InlineNodeSchema.safeParse(node);
        if (parsed.success) nodes.push(parsed.data);
        else {
            console.warn(
                '[serialize] Dropping malformed inline node:',
                JSON.stringify(node),
            );
        }
    }
    return nodes;
}

// Mistake-feedback entries ({match, feedback}) for blanks and graph blocks
// share one drop rule: a non-string or empty match, or feedback that
// sanitizes away to nothing, makes the entry unusable — drop it, keep the
// rest. One helper so the two call sites can't drift.
function sanitizeMistakeFeedback(
    raw: unknown,
): Array<{ match: string; feedback: InlineNode[] }> {
    if (!Array.isArray(raw)) return [];
    return (raw as unknown[]).flatMap((entry) => {
        if (!entry || typeof entry !== 'object') return [];
        const e = entry as { match?: unknown; feedback?: unknown };
        if (typeof e.match !== 'string' || e.match.length === 0) return [];
        const feedback = sanitizeInlineNodes(e.feedback);
        if (feedback.length === 0) return [];
        return [{ match: e.match, feedback }];
    });
}

// Same posture for definition-mark popover content, which uses the narrower
// DefinitionContentInline union (SimpleMark only — no nested definitions).
function sanitizeDefinitionContent(raw: unknown): DefinitionContentInline[] {
    if (!Array.isArray(raw)) return [];
    const nodes: DefinitionContentInline[] = [];
    for (const node of raw) {
        const parsed = DefinitionContentInlineSchema.safeParse(node);
        if (parsed.success) nodes.push(parsed.data);
        else {
            console.warn(
                '[serialize] Dropping malformed definition content node:',
                JSON.stringify(node),
            );
        }
    }
    return nodes;
}

// =============================================================================
// Tiptap → ActivityDocument
// =============================================================================

export function tiptapToActivity(
    tiptap: JSONContent,
    meta: ActivityMeta,
    referencePanel?: ReferencePanel,
    calculator?: CalculatorTool,
): ActivityDocument {
    if (tiptap.type !== 'doc') {
        throw new Error(
            `tiptapToActivity: expected root type 'doc', got '${tiptap.type}'`,
        );
    }

    const doc: ActivityDocument = {
        schemaVersion: 1,
        meta,
        sections: splitTiptapBlocksIntoSections(tiptap.content ?? []),
    };
    // The reference panel is authored on its own surface (Drop C) and carried
    // as separate state, NOT encoded in the main editor's Tiptap doc — so it
    // arrives here as an argument, not parsed out of `tiptap`. Pass it through
    // verbatim when present so a load→save cycle preserves it; omit it entirely
    // when absent (the schema field is .optional(), and documents without a
    // panel stay structurally identical). This is what closes the latent
    // drop-bug where any stored panel was discarded on the next save.
    if (referencePanel) doc.referencePanel = referencePanel;
    // Calculator config (an activity-level scaffold, parallel to referencePanel)
    // is likewise carried as separate editor state, not encoded in the Tiptap
    // doc. Pass through verbatim when present; omit when absent so documents
    // without a calculator stay structurally identical.
    if (calculator) doc.calculator = calculator;
    return doc;
}

function splitTiptapBlocksIntoSections(nodes: JSONContent[]): Section[] {
    const sections: Section[] = [];
    const startsWithBreak = nodes[0]?.type === 'sectionBreak';

    let current: Section = startsWithBreak
    ? sectionFromBreak(nodes[0]!)
    : { id: crypto.randomUUID(), isCheckpoint: false, blocks: [] };

    for (let i = startsWithBreak ? 1 : 0; i < nodes.length; i++) {
        const node = nodes[i]!;
        if (node.type === 'sectionBreak') {
            sections.push(current);
            current = sectionFromBreak(node);
        } else {
            const block = tiptapBlockToActivity(node);
            if (block) current.blocks.push(block);
        }
    }

    sections.push(current);
    return sections;
}

function sectionFromBreak(node: JSONContent): Section {
    const rawTitle = node.attrs?.title as string | null | undefined;
    const section: Section = {
        id: crypto.randomUUID(),
        isCheckpoint: Boolean(node.attrs?.isCheckpoint),
        blocks: [],
    };
    if (typeof rawTitle === 'string' && rawTitle.length > 0) {
        section.title = rawTitle;
    }
    return section;
}

function tiptapBlockToActivity(node: JSONContent): Block | null {
    switch (node.type) {
        case 'paragraph':
            return {
                id: crypto.randomUUID(),
                type: 'paragraph',
                content: tiptapInlineToActivity(node.content ?? []),
            };

        case 'heading': {
            const raw = node.attrs?.level;
            const level = raw === 1 || raw === 2 || raw === 3 ? raw : 1;
            return {
                id: crypto.randomUUID(),
                type: 'heading',
                level,
                content: tiptapInlineToActivity(node.content ?? []),
            };
        }

        case 'mathBlock': {
            const block: MathBlock = {
                id: crypto.randomUUID(),
                type: 'math_block',
                latex: (node.attrs?.latex as string | undefined) ?? '',
            };
            applySizingAttrs(block, node);
            return block;
        }

        case 'bulletList':
            return tiptapBulletListToActivity(node);

        case 'orderedList':
            return tiptapOrderedListToActivity(node);

        case 'interactiveGraph':
            return tiptapInteractiveGraphToActivity(node);
        case 'multipleChoice':
            return tiptapMultipleChoiceToActivity(node);
        case 'matching':
            return tiptapMatchingToActivity(node);
        case 'ordering':
            return tiptapOrderingToActivity(node);
        case 'fillInBlank':
            return tiptapFillInBlankToActivity(node);

        case 'columns':
            return tiptapColumnsToActivity(node);

        case 'image':
            return tiptapImageToActivity(node);

        default:
            console.warn(
                `[serialize] Skipping unsupported Tiptap block: ${node.type}`,
            );
            return null;
    }
}

function tiptapImageToActivity(node: JSONContent): ImageBlock | null {
    // src is required + must be a URL (schema's .url()). An empty src is the
    // editor's "unfilled placeholder" state — drop it rather than emit a block
    // that would fail Zod at publish. (A non-empty-but-malformed URL still
    // passes through here and is caught by publish-activity's safeParse.)
    const src = (node.attrs?.src as string | undefined)?.trim() ?? '';
    if (src.length === 0) {
        console.warn('[serialize] Dropping image with empty src.');
        return null;
    }

    const block: ImageBlock = {
        id: crypto.randomUUID(),
        type: 'image',
        src,
        alt: (node.attrs?.alt as string | undefined) ?? '',
    };

    // caption is optional — only carry it when non-empty so round-trip equality
    // holds for images without one.
    const rawCaption = node.attrs?.caption;
    if (typeof rawCaption === 'string' && rawCaption.trim().length > 0) {
        block.caption = rawCaption.trim();
    }

    applySizingAttrs(block, node);

    // Fixed display height (rem) — image-specific; positive numbers only,
    // same omit-when-absent discipline as the shared sizing fragment.
    const rawHeight = node.attrs?.height;
    if (typeof rawHeight === 'number' && rawHeight > 0) {
        block.height = rawHeight;
    }

    return block;
}

// Sizing fragment (width fraction + align) shared by the sizable blocks
// (image, math_block today). Omit-when-default both ways: width only in
// (0, 1], align only 'left'/'right' (absent = center) — so round-trip
// equality holds for unsized blocks and malformed attrs can't widen the
// schema's bounds.
function applySizingAttrs(
    block: { width?: number; align?: 'left' | 'center' | 'right' },
    node: JSONContent,
): void {
    const rawWidth = node.attrs?.width;
    if (typeof rawWidth === 'number' && rawWidth > 0 && rawWidth <= 1) {
        block.width = rawWidth;
    }
    const rawAlign = node.attrs?.align;
    if (rawAlign === 'left' || rawAlign === 'right') {
        block.align = rawAlign;
    }
}

function tiptapColumnsToActivity(node: JSONContent): ColumnsBlock {
    // Tri-state grid-lines override. The editor stores 'inherit' | 'on' | 'off'
    // in attrs.gridLines; anything unexpected (or absent) falls back to
    // 'inherit' so a malformed attr can't widen the schema enum.
    const rawGridLines = node.attrs?.gridLines;
    const gridLines =
        rawGridLines === 'on' || rawGridLines === 'off' ? rawGridLines : 'inherit';

    return {
        id: crypto.randomUUID(),
        type: 'columns',
        gridLines,
        columns: (node.content ?? [])
        .filter((c) => c.type === 'column')
        .map(tiptapColumnToActivity),
    };
}

function tiptapColumnToActivity(node: JSONContent): Column {
    const column: Column = {
        id: crypto.randomUUID(),
        // The editor's `column` content expression forbids nested `columns`,
        // so tiptapBlockToActivity never yields a ColumnsBlock here. The
        // type !== 'columns' guard makes that invariant explicit and narrows
        // Block down to ColumnCellBlock for the schema's Column.blocks field.
        blocks: (node.content ?? [])
        .map(tiptapBlockToActivity)
        .filter(
            (b): b is ColumnCellBlock => b !== null && b.type !== 'columns',
        ),
    };

    const rawWidth = node.attrs?.width;
    if (typeof rawWidth === 'number' && rawWidth > 0) {
        column.width = rawWidth;
    }

    // Reserved work-space floor (rem). Positive numbers only, same
    // omit-when-absent discipline as width.
    const rawMinHeight = node.attrs?.minHeight;
    if (typeof rawMinHeight === 'number' && rawMinHeight > 0) {
        column.minHeight = rawMinHeight;
    }

    return column;
}

function tiptapFillInBlankToActivity(node: JSONContent): FillInBlankBlock {
    const block: FillInBlankBlock = {
        id: crypto.randomUUID(),
        type: 'fill_in_blank',
        content: tiptapFillInBlankInlineToActivity(node.content ?? []),
        hasConfidenceRating: Boolean(node.attrs?.hasConfidenceRating),
        skills: Array.isArray(node.attrs?.skills)
        ? (node.attrs.skills as unknown[]).filter(
            (s): s is string => typeof s === 'string',
        )
        : [],
    };

    // solution is optional in the schema — stored as canonical InlineNode[] in
    // the Tiptap attrs (written by the nested mini-editor). Sanitize rather
    // than pass through. Only carry it when non-empty so the saved document
    // doesn't accrue a phantom empty key and round-trip equality holds for
    // problems without a solution.
    const solution = sanitizeInlineNodes(node.attrs?.solution);
    if (solution.length > 0) {
        block.solution = solution;
    }

    // workSpace is optional (absent = inherit the activity print default). Only
    // carry a non-negative number; null/absent leaves the key off so round-trip
    // equality holds for problems with no per-problem override.
    const rawWorkSpace = node.attrs?.workSpace;
    if (typeof rawWorkSpace === 'number' && rawWorkSpace >= 0) {
        block.workSpace = rawWorkSpace;
    }

    return block;
}

function tiptapMultipleChoiceToActivity(node: JSONContent): MultipleChoiceBlock {
    const attrs = node.attrs ?? {};

    // Choices come through as the canonical schema shape (the NodeView writes
    // them that way). Sanitize each entry structurally; drop malformed ones.
    // The NodeView disables removal below two choices, but pad defensively so
    // a hand-crafted or damaged payload still yields a schema-valid block
    // instead of dropping the teacher's work at save time.
    const rawChoices = Array.isArray(attrs.choices) ? attrs.choices : [];
    const choices: MultipleChoiceOption[] = [];
    for (const raw of rawChoices as unknown[]) {
        if (!raw || typeof raw !== 'object') continue;
        const c = raw as {
            id?: unknown;
            content?: unknown;
            correct?: unknown;
            feedback?: unknown;
            image?: unknown;
            graph?: unknown;
        };
        const option: MultipleChoiceOption = {
            id:
                typeof c.id === 'string' && c.id.length > 0
                    ? c.id
                    : crypto.randomUUID(),
            content: sanitizeInlineNodes(c.content),
            correct: c.correct === true,
        };
        const feedback = sanitizeInlineNodes(c.feedback);
        if (feedback.length > 0) {
            option.feedback = feedback;
        }
        // Optional figures: validate with the real schemas (same "drop
        // malformed, keep the rest" posture as the row-level sanitize) so a
        // half-authored figure never poisons the whole save.
        const image = ChoiceImage.safeParse(c.image);
        if (c.image !== undefined && image.success) option.image = image.data;
        const graph = ChoiceGraph.safeParse(c.graph);
        if (c.graph !== undefined && graph.success) option.graph = graph.data;
        choices.push(option);
    }
    while (choices.length < 2) {
        choices.push(createMultipleChoiceOption());
    }

    const block: MultipleChoiceBlock = {
        id: crypto.randomUUID(),
        type: 'multiple_choice',
        prompt: tiptapInlineToActivity(node.content ?? []),
        choices,
        multiSelect: attrs.multiSelect === true,
        hasConfidenceRating: Boolean(attrs.hasConfidenceRating),
        skills: Array.isArray(attrs.skills)
            ? (attrs.skills as unknown[]).filter(
                  (s): s is string => typeof s === 'string',
              )
            : [],
    };

    // Optional fields — carried only when meaningful, same omit-when-absent
    // discipline as fill-in-blank.
    const solution = sanitizeInlineNodes(attrs.solution);
    if (solution.length > 0) {
        block.solution = solution;
    }
    const rawWorkSpace = attrs.workSpace;
    if (typeof rawWorkSpace === 'number' && rawWorkSpace >= 0) {
        block.workSpace = rawWorkSpace;
    }

    return block;
}

// Shared row sanitizer for matching items/targets (the MC-choice pattern:
// sanitize structurally, validate figures with the real Zod schemas, drop
// malformed pieces, keep the rest).
function sanitizeMatchSides(raw: unknown): Array<MatchingItem | MatchingTarget> {
    const sides: Array<MatchingItem | MatchingTarget> = [];
    if (!Array.isArray(raw)) return sides;
    for (const entry of raw as unknown[]) {
        if (!entry || typeof entry !== 'object') continue;
        const s = entry as {
            id?: unknown;
            content?: unknown;
            image?: unknown;
            graph?: unknown;
        };
        const side: MatchingItem = {
            id:
                typeof s.id === 'string' && s.id.length > 0
                    ? s.id
                    : crypto.randomUUID(),
            content: sanitizeInlineNodes(s.content),
        };
        const image = ChoiceImage.safeParse(s.image);
        if (s.image !== undefined && image.success) side.image = image.data;
        const graph = ChoiceGraph.safeParse(s.graph);
        if (s.graph !== undefined && graph.success) side.graph = graph.data;
        sides.push(side);
    }
    return sides;
}

function tiptapMatchingToActivity(node: JSONContent): MatchingBlock {
    const attrs = node.attrs ?? {};

    // Items/targets come through as the canonical schema shape (the NodeView
    // writes them that way); pad defensively to the schema minimum so a
    // damaged payload still yields a valid block instead of dropping the
    // teacher's work at save time (the MC pattern).
    const items = sanitizeMatchSides(attrs.items);
    while (items.length < 2) items.push(createMatchingItem());
    const targets = sanitizeMatchSides(attrs.targets);
    while (targets.length < 2) targets.push(createMatchingTarget());

    const allowTargetReuse = attrs.allowTargetReuse === true;

    // Key: keep only entries whose item AND target actually exist; without
    // reuse, additionally keep only the first item using each target (the
    // NodeView enforces this live — this is the save-boundary backstop).
    const itemIds = new Set(items.map((i) => i.id));
    const targetIds = new Set(targets.map((t) => t.id));
    const usedTargets = new Set<string>();
    const key: Record<string, string> = {};
    const rawKey =
        attrs.key && typeof attrs.key === 'object' && !Array.isArray(attrs.key)
            ? (attrs.key as Record<string, unknown>)
            : {};
    for (const item of items) {
        const t = rawKey[item.id];
        if (typeof t !== 'string' || !targetIds.has(t)) continue;
        if (!allowTargetReuse && usedTargets.has(t)) continue;
        if (!itemIds.has(item.id)) continue;
        key[item.id] = t;
        usedTargets.add(t);
    }

    const block: MatchingBlock = {
        id: crypto.randomUUID(),
        type: 'matching',
        prompt: tiptapInlineToActivity(node.content ?? []),
        items,
        targets,
        key,
        allowTargetReuse,
        hasConfidenceRating: Boolean(attrs.hasConfidenceRating),
        skills: Array.isArray(attrs.skills)
            ? (attrs.skills as unknown[]).filter(
                  (s): s is string => typeof s === 'string',
              )
            : [],
    };

    const solution = sanitizeInlineNodes(attrs.solution);
    if (solution.length > 0) {
        block.solution = solution;
    }
    const rawWorkSpace = attrs.workSpace;
    if (typeof rawWorkSpace === 'number' && rawWorkSpace >= 0) {
        block.workSpace = rawWorkSpace;
    }

    return block;
}

function tiptapOrderingToActivity(node: JSONContent): OrderingBlock {
    const attrs = node.attrs ?? {};

    const rawItems = Array.isArray(attrs.items) ? attrs.items : [];
    const items: OrderingItem[] = [];
    for (const raw of rawItems as unknown[]) {
        if (!raw || typeof raw !== 'object') continue;
        const i = raw as { id?: unknown; content?: unknown };
        items.push({
            id:
                typeof i.id === 'string' && i.id.length > 0
                    ? i.id
                    : crypto.randomUUID(),
            content: sanitizeInlineNodes(i.content),
        });
    }
    while (items.length < 2) items.push(createOrderingItem());

    const block: OrderingBlock = {
        id: crypto.randomUUID(),
        type: 'ordering',
        prompt: tiptapInlineToActivity(node.content ?? []),
        items,
        hasConfidenceRating: Boolean(attrs.hasConfidenceRating),
        skills: Array.isArray(attrs.skills)
            ? (attrs.skills as unknown[]).filter(
                  (s): s is string => typeof s === 'string',
              )
            : [],
    };

    const solution = sanitizeInlineNodes(attrs.solution);
    if (solution.length > 0) {
        block.solution = solution;
    }
    const rawWorkSpace = attrs.workSpace;
    if (typeof rawWorkSpace === 'number' && rawWorkSpace >= 0) {
        block.workSpace = rawWorkSpace;
    }

    return block;
}

function tiptapInteractiveGraphToActivity(node: JSONContent): InteractiveGraphBlock {
    const attrs = node.attrs ?? {};
    const fresh = createInteractiveGraphBlock();
    const block: InteractiveGraphBlock = {
        id: crypto.randomUUID(),
        type: 'interactive_graph',
        // The prompt is the node's editable inline content (text + inline math).
        prompt: tiptapInlineToActivity(node.content ?? []),
        // axisConfig / interaction always come populated from the node's attr
        // defaults; fall back to the factory shape if a hand-crafted payload
        // dropped them. The schema Zod-validates on the save boundary.
        axisConfig: (attrs.axisConfig as InteractiveGraphBlock['axisConfig']) ?? fresh.axisConfig,
        interaction: (attrs.interaction as InteractiveGraphBlock['interaction']) ?? fresh.interaction,
        partialCredit: Boolean(attrs.partialCredit),
        allowNoSolution: Boolean(attrs.allowNoSolution),
        noSolutionCorrect: Boolean(attrs.noSolutionCorrect),
        // Built-in mistake classifiers default ON (absent attr = true).
        builtinFeedback: attrs.builtinFeedback !== false,
        mistakeFeedback: sanitizeMistakeFeedback(attrs.mistakeFeedback),
        hasConfidenceRating: Boolean(attrs.hasConfidenceRating),
        skills: Array.isArray(attrs.skills)
            ? (attrs.skills as unknown[]).filter((s): s is string => typeof s === 'string')
            : [],
    };
    // Optional solution — carry only when non-empty so round-trip equality holds
    // for graphs without one (same pattern as fill-in-blank).
    const solution = sanitizeInlineNodes(attrs.solution);
    if (solution.length > 0) {
        block.solution = solution;
    }
    return block;
}

function tiptapBulletListToActivity(node: JSONContent): BulletListBlock {
    return {
        id: crypto.randomUUID(),
        type: 'bullet_list',
        items: (node.content ?? [])
        .map(tiptapListItemToActivity)
        .filter((i): i is ListItem => i !== null),
    };
}

function tiptapOrderedListToActivity(node: JSONContent): OrderedListBlock {
    return {
        id: crypto.randomUUID(),
        type: 'ordered_list',
        items: (node.content ?? [])
        .map(tiptapListItemToActivity)
        .filter((i): i is ListItem => i !== null),
    };
}

function tiptapListItemToActivity(node: JSONContent): ListItem | null {
    if (node.type !== 'listItem') {
        console.warn(`[serialize] Unexpected node inside list: ${node.type}`);
        return null;
    }

    const item: ListItem = {
        id: crypto.randomUUID(),
        content: [],
    };
    const children: Array<BulletListBlock | OrderedListBlock> = [];
    let paragraphSeen = false;

    for (const child of node.content ?? []) {
        if (child.type === 'paragraph') {
            if (!paragraphSeen) {
                item.content = tiptapInlineToActivity(child.content ?? []);
                paragraphSeen = true;
            }
        } else if (child.type === 'bulletList') {
            children.push(tiptapBulletListToActivity(child));
        } else if (child.type === 'orderedList') {
            children.push(tiptapOrderedListToActivity(child));
        }
    }

    if (children.length > 0) item.children = children;
    return item;
}

export function tiptapInlineToActivity(content: JSONContent[]): InlineNode[] {
    return content
    .map(tiptapInlineNodeToActivity)
    .filter((n): n is InlineNode => n !== null);
}

function tiptapInlineNodeToActivity(node: JSONContent): InlineNode | null {
    switch (node.type) {
        case 'text':
            return {
                type: 'text',
                text: node.text ?? '',
                marks: extractMarks(node.marks),
            };

        case 'mathInline':
            return {
                type: 'math_inline',
                latex: (node.attrs?.latex as string | undefined) ?? '',
            };

        case 'hardBreak':
            return { type: 'hard_break' };

        default:
            console.warn(
                `[serialize] Skipping unsupported Tiptap inline: ${node.type}`,
            );
            return null;
    }
}

function tiptapFillInBlankInlineToActivity(
    content: JSONContent[],
): FillInBlankInline[] {
    return content
    .map(tiptapFillInBlankInlineNodeToActivity)
    .filter((n): n is FillInBlankInline => n !== null);
}

function tiptapFillInBlankInlineNodeToActivity(
    node: JSONContent,
): FillInBlankInline | null {
    if (node.type === 'blank') {
        return tiptapBlankToActivity(node);
    }
    return tiptapInlineNodeToActivity(node);
}

function tiptapBlankToActivity(node: JSONContent): BlankToken | null {
    const answer = (node.attrs?.answer as string | undefined) ?? '';
    if (answer.length === 0) {
        console.warn(
            '[serialize] Dropping blank with empty answer; failed Zod validation if kept.',
        );
        return null;
    }

    const acceptableRaw = node.attrs?.acceptableAnswers;
    const acceptableAnswers = Array.isArray(acceptableRaw)
    ? acceptableRaw.filter((v): v is string => typeof v === 'string')
    : [];

    const rawId = node.attrs?.id;
    const id =
    typeof rawId === 'string' && rawId.length > 0
    ? rawId
    : crypto.randomUUID();

    // Build the BlankToken with required + optional fields. hint and
    // mistakeFeedback are optional in the schema — only include them when
    // non-empty so the saved document doesn't carry phantom undefined keys
    // and round-trip equality is preserved for blanks without those fields.
    const result: BlankToken = {
        type: 'blank',
        id,
        answer,
        acceptableAnswers,
        // Order-independent grouping flag. Authored via the blank's NodeView;
        // absent/falsy attr → false (the common, ungrouped case).
        interchangeableWithPrevious:
            node.attrs?.interchangeableWithPrevious === true,
    };

    // Numeric answer mode: carried only when set so text blanks (the common
    // case, and every pre-existing document) serialize without phantom keys.
    // Tolerance rides only with numeric — a stray tolerance on a text blank
    // is meaningless and is dropped here.
    if (node.attrs?.answerType === 'numeric') {
        result.answerType = 'numeric';
        const rawTolerance = node.attrs?.tolerance;
        if (
            typeof rawTolerance === 'number' &&
            isFinite(rawTolerance) &&
            rawTolerance >= 0
        ) {
            result.tolerance = rawTolerance;
        }
    }

    // hint and each mistakeFeedback entry's feedback are stored as canonical
    // InlineNode[] in the Tiptap attrs (the nested mini-editor writes them in
    // that form); sanitize rather than pass through. Only carry them when
    // non-empty so round-trip equality holds for blanks without them.
    const hint = sanitizeInlineNodes(node.attrs?.hint);
    if (hint.length > 0) {
        result.hint = hint;
    }

    const cleaned = sanitizeMistakeFeedback(node.attrs?.mistakeFeedback);
    if (cleaned.length > 0) {
        result.mistakeFeedback = cleaned;
    }

    return result;
}

function extractMarks(
    marks?: Array<{ type: string; attrs?: Record<string, unknown> | null }>,
): Mark[] {
    if (!marks) return [];
    const out: Mark[] = [];
    for (const m of marks) {
        if (m.type === 'definition') {
            // Attribute-carrying mark. `content` is canonical
            // DefinitionContentInline[] (the nested mini-editor writes it that
            // way, like blank hints); sanitize rather than pass through.
            // `image` is an optional {src, alt}. Keep the mark only if it
            // carries content or an image. glossaryKey is reserved for
            // Phase 4 and carried through if set.
            const content = sanitizeDefinitionContent(m.attrs?.content);
            const rawImage = m.attrs?.image;
            let image: DefinitionImage | undefined;
            if (
                rawImage &&
                typeof rawImage === 'object' &&
                typeof (rawImage as { src?: unknown }).src === 'string' &&
                (rawImage as { src: string }).src.length > 0
            ) {
                const alt = (rawImage as { alt?: unknown }).alt;
                image = {
                    src: (rawImage as { src: string }).src,
                    alt: typeof alt === 'string' ? alt : '',
                };
            }
            if (content.length === 0 && !image) continue;
            const mark: DefinitionMark = { type: 'definition', content };
            if (image) mark.image = image;
            const glossaryKey = m.attrs?.glossaryKey;
            if (typeof glossaryKey === 'string' && glossaryKey.length > 0) {
                mark.glossaryKey = glossaryKey;
            }
            out.push(mark);
        } else if (SUPPORTED_SIMPLE_MARKS.has(m.type as SimpleMarkType)) {
            out.push({ type: m.type } as Mark);
        }
    }
    return out;
}

// =============================================================================
// ActivityDocument → Tiptap
// =============================================================================

export function activityToTiptap(doc: ActivityDocument): JSONContent {
    return {
        type: 'doc',
        content: emitSectionsAsTiptapBlocks(doc.sections),
    };
}

function emitSectionsAsTiptapBlocks(sections: Section[]): JSONContent[] {
    const out: JSONContent[] = [];

    sections.forEach((section, index) => {
        const hasMetadata =
        (section.title !== undefined && section.title !== '') ||
        section.isCheckpoint;
        const isFirst = index === 0;
        if (!isFirst || hasMetadata) {
            out.push(sectionBreakNode(section));
        }
        for (const block of section.blocks) {
            const node = activityBlockToTiptap(block);
            if (node) out.push(node);
        }
    });

    return out;
}

function sectionBreakNode(section: Section): JSONContent {
    return {
        type: 'sectionBreak',
        attrs: {
            title: section.title ?? null,
            isCheckpoint: section.isCheckpoint,
        },
    };
}

function activityBlockToTiptap(block: Block): JSONContent | null {
    switch (block.type) {
        case 'paragraph':
            return {
                type: 'paragraph',
                content: activityInlineToTiptap(block.content),
            };

        case 'heading':
            return {
                type: 'heading',
                attrs: { level: block.level },
                content: activityInlineToTiptap(block.content),
            };

        case 'math_block':
            return {
                type: 'mathBlock',
                attrs: { latex: block.latex, ...sizingTiptapAttrs(block) },
            };

        case 'bullet_list':
            return activityBulletListToTiptap(block);

        case 'ordered_list':
            return activityOrderedListToTiptap(block);

        case 'fill_in_blank':
            return activityFillInBlankToTiptap(block);

        case 'columns':
            return activityColumnsToTiptap(block);

        case 'image':
            return {
                type: 'image',
                attrs: {
                    id: block.id,
                    src: block.src,
                    alt: block.alt,
                    caption: block.caption ?? '',
                    ...sizingTiptapAttrs(block),
                    ...(typeof block.height === 'number'
                        ? { height: block.height }
                        : {}),
                },
            };

        case 'interactive_graph':
            return activityInteractiveGraphToTiptap(block);

        case 'multiple_choice':
            return activityMultipleChoiceToTiptap(block);

        case 'matching':
            return activityMatchingToTiptap(block);

        case 'ordering':
            return activityOrderingToTiptap(block);

        case 'callout':
        case 'problem':
            console.warn(
                `[serialize] No Tiptap mapping for ${block.type} yet; block omitted from editor view.`,
            );
            return null;

        default: {
            const _exhaustive: never = block;
            return _exhaustive;
        }
    }
}

function activityColumnsToTiptap(block: ColumnsBlock): JSONContent {
    return {
        type: 'columns',
        // gridLines always carries through (the schema defaults it to 'inherit',
        // so it's never undefined) — the editor's gridLines attr mirrors the
        // schema tri-state 1:1.
        attrs: { id: block.id, gridLines: block.gridLines },
        content: block.columns.map(activityColumnToTiptap),
    };
}

function activityColumnToTiptap(column: Column): JSONContent {
    const content = column.blocks
    .map(activityBlockToTiptap)
    .filter((n): n is JSONContent => n !== null);

    const attrs: Record<string, unknown> = {};
    if (typeof column.width === 'number') attrs.width = column.width;
    if (typeof column.minHeight === 'number') attrs.minHeight = column.minHeight;

    // The editor's `column` content expression is `(...)+` — a cell must hold
    // at least one block. If every block was unmappable (callout/problem
    // currently serialize to null) or the cell is empty, seed an empty
    // paragraph so the node is valid in the editor.
    return {
        type: 'column',
        attrs,
        content: content.length > 0 ? content : [{ type: 'paragraph' }],
    };
}

// Reverse of applySizingAttrs: schema sizing fragment → Tiptap attrs.
// Omit-when-unset (the same pattern as column.width) so round-trip equality
// holds for unsized blocks; Tiptap fills missing attrs with its declared
// defaults (null) on load anyway. align 'center' maps to absent — the
// attribute-free default on both sides.
function sizingTiptapAttrs(block: {
    width?: number;
    align?: 'left' | 'center' | 'right';
}): Record<string, unknown> {
    const attrs: Record<string, unknown> = {};
    if (typeof block.width === 'number') attrs.width = block.width;
    if (block.align === 'left' || block.align === 'right') attrs.align = block.align;
    return attrs;
}

function activityBulletListToTiptap(block: BulletListBlock): JSONContent {
    return {
        type: 'bulletList',
        content: block.items.map(activityListItemToTiptap),
    };
}

function activityOrderedListToTiptap(block: OrderedListBlock): JSONContent {
    return {
        type: 'orderedList',
        content: block.items.map(activityListItemToTiptap),
    };
}

function activityListItemToTiptap(item: ListItem): JSONContent {
    const content: JSONContent[] = [
        {
            type: 'paragraph',
            content: activityInlineToTiptap(item.content),
        },
    ];
    for (const child of item.children ?? []) {
        content.push(
            child.type === 'bullet_list'
        ? activityBulletListToTiptap(child)
        : activityOrderedListToTiptap(child),
        );
    }
    return {
        type: 'listItem',
        content,
    };
}

function activityFillInBlankToTiptap(block: FillInBlankBlock): JSONContent {
    return {
        type: 'fillInBlank',
        attrs: {
            id: block.id,
            solution: block.solution ?? null,
            hasConfidenceRating: block.hasConfidenceRating,
            skills: block.skills,
            workSpace: block.workSpace ?? null,
        },
        content: activityFillInBlankInlineToTiptap(block.content),
    };
}

function activityMultipleChoiceToTiptap(block: MultipleChoiceBlock): JSONContent {
    return {
        type: 'multipleChoice',
        attrs: {
            id: block.id,
            // Canonical schema shape passes straight through (the NodeView
            // edits it in place).
            choices: block.choices,
            multiSelect: block.multiSelect,
            solution: block.solution ?? null,
            hasConfidenceRating: block.hasConfidenceRating,
            skills: block.skills,
            workSpace: block.workSpace ?? null,
        },
        content: activityInlineToTiptap(block.prompt),
    };
}

function activityMatchingToTiptap(block: MatchingBlock): JSONContent {
    return {
        type: 'matching',
        attrs: {
            id: block.id,
            // Canonical schema shapes pass straight through (the NodeView
            // edits them in place).
            items: block.items,
            targets: block.targets,
            key: block.key,
            allowTargetReuse: block.allowTargetReuse,
            solution: block.solution ?? null,
            hasConfidenceRating: block.hasConfidenceRating,
            skills: block.skills,
            workSpace: block.workSpace ?? null,
        },
        content: activityInlineToTiptap(block.prompt),
    };
}

function activityOrderingToTiptap(block: OrderingBlock): JSONContent {
    return {
        type: 'ordering',
        attrs: {
            id: block.id,
            items: block.items,
            solution: block.solution ?? null,
            hasConfidenceRating: block.hasConfidenceRating,
            skills: block.skills,
            workSpace: block.workSpace ?? null,
        },
        content: activityInlineToTiptap(block.prompt),
    };
}

function activityInteractiveGraphToTiptap(block: InteractiveGraphBlock): JSONContent {
    return {
        type: 'interactiveGraph',
        attrs: {
            id: block.id,
            axisConfig: block.axisConfig,
            interaction: block.interaction,
            partialCredit: block.partialCredit,
            allowNoSolution: block.allowNoSolution,
            noSolutionCorrect: block.noSolutionCorrect,
            builtinFeedback: block.builtinFeedback,
            mistakeFeedback: block.mistakeFeedback,
            solution: block.solution ?? null,
            hasConfidenceRating: block.hasConfidenceRating,
            skills: block.skills,
        },
        content: activityInlineToTiptap(block.prompt),
    };
}

export function activityInlineToTiptap(content: InlineNode[]): JSONContent[] {
    return content.map(activityInlineNodeToTiptap);
}

function activityInlineNodeToTiptap(node: InlineNode): JSONContent {
    switch (node.type) {
        case 'text':
            return node.marks.length > 0
            ? {
                type: 'text',
                text: node.text,
                marks: node.marks.map((m) =>
                    m.type === 'definition'
                        ? {
                              type: 'definition',
                              attrs: {
                                  content: m.content,
                                  ...(m.image ? { image: m.image } : {}),
                                  ...(m.glossaryKey
                                      ? { glossaryKey: m.glossaryKey }
                                      : {}),
                              },
                          }
                        : { type: m.type },
                ),
            }
            : { type: 'text', text: node.text };

        case 'math_inline':
            return {
                type: 'mathInline',
                attrs: { latex: node.latex },
            };

        case 'hard_break':
            return { type: 'hardBreak' };
    }
}

function activityFillInBlankInlineToTiptap(
    content: FillInBlankInline[],
): JSONContent[] {
    return content.map(activityFillInBlankInlineNodeToTiptap);
}

function activityFillInBlankInlineNodeToTiptap(
    node: FillInBlankInline,
): JSONContent {
    if (node.type === 'blank') {
        return activityBlankToTiptap(node);
    }
    return activityInlineNodeToTiptap(node);
}

function activityBlankToTiptap(node: BlankToken): JSONContent {
    // Required attrs always emitted. Optional fields (hint, mistakeFeedback,
    // width) only included when present so round-trip equality is preserved
    // for blanks without those fields. acceptableAnswers always emitted
    // (even when empty) for round-trip exactness with Tiptap's stored attrs.
    const attrs: Record<string, unknown> = {
        id: node.id,
        answer: node.answer,
        acceptableAnswers: node.acceptableAnswers,
        // Always emitted (like acceptableAnswers) for round-trip exactness with
        // the NodeView's stored attr.
        interchangeableWithPrevious: node.interchangeableWithPrevious,
        // Always emitted — the Tiptap attr defaults to 'text', so absent schema
        // field → 'text' keeps editor JSON stable across round trips.
        answerType: node.answerType ?? 'text',
    };
    if (node.tolerance !== undefined) attrs.tolerance = node.tolerance;
    if (node.hint !== undefined) attrs.hint = node.hint;
    if (node.mistakeFeedback !== undefined) {
        attrs.mistakeFeedback = node.mistakeFeedback;
    }
    if (node.width !== undefined) attrs.width = node.width;

    return {
        type: 'blank',
        attrs,
    };
}

// =============================================================================
// Reference panel ⇄ Tiptap
// =============================================================================
// The reference panel is a FLAT list of content blocks (no sections, no section
// breaks) authored on its own constrained editor surface (ReferencePanelEditor).
// These bridge that editor's Tiptap doc and the schema's ReferencePanel.blocks,
// reusing the same per-block converters as the main document — only the
// section-splitting layer is absent.
//
// The panel TITLE is not part of the Tiptap doc (it's a separate field on the
// disclosure), so it's threaded through tiptapToReferencePanel as an argument
// and omitted when blank — matching the schema's optional title and keeping
// round-trip equality for untitled panels.

export function referencePanelToTiptap(panel: ReferencePanel): JSONContent {
    return {
        type: 'doc',
        content: panel.blocks
        .map(activityBlockToTiptap)
        .filter((n): n is JSONContent => n !== null),
    };
}

export function tiptapToReferencePanel(
    tiptap: JSONContent,
    title?: string,
): ReferencePanel {
    const blocks = (tiptap.content ?? [])
    .map(tiptapBlockToActivity)
    .filter((b): b is Block => b !== null);
    const trimmed = title?.trim();
    return trimmed ? { title: trimmed, blocks } : { blocks };
}

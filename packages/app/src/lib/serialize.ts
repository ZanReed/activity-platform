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
    Block,
    InlineNode,
    FillInBlankInline,
    BlankToken,
    Mark,
    Section,
    BulletListBlock,
    OrderedListBlock,
    ListItem,
    FillInBlankBlock,
} from '@activity/schema';
import type { JSONContent } from '@tiptap/react';

// Canonical inline content (rich text + inline math) as the schema models it.
// Used for the rich popover fields — blank hint, mistake feedback, problem
// solution — which the editor stores as InlineNode[] and serialize passes
// through verbatim. Re-exported from this bridge module so editor components
// can name the type without importing @activity/schema directly.
export type InlineNodes = InlineNode[];

// Marks the schema accepts. Tiptap marks not in this set (e.g., strike) are
// silently dropped.
const SUPPORTED_MARKS: ReadonlySet<Mark> = new Set<Mark>([
    'bold',
    'italic',
    'underline',
    'code',
    'subscript',
    'superscript',
]);

// =============================================================================
// Tiptap → ActivityDocument
// =============================================================================

export function tiptapToActivity(
    tiptap: JSONContent,
    meta: ActivityMeta,
): ActivityDocument {
    if (tiptap.type !== 'doc') {
        throw new Error(
            `tiptapToActivity: expected root type 'doc', got '${tiptap.type}'`,
        );
    }

    return {
        schemaVersion: 1,
        meta,
        sections: splitTiptapBlocksIntoSections(tiptap.content ?? []),
    };
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

        case 'mathBlock':
            return {
                id: crypto.randomUUID(),
                type: 'math_block',
                latex: (node.attrs?.latex as string | undefined) ?? '',
            };

        case 'bulletList':
            return tiptapBulletListToActivity(node);

        case 'orderedList':
            return tiptapOrderedListToActivity(node);

        case 'fillInBlank':
            return tiptapFillInBlankToActivity(node);

        default:
            console.warn(
                `[serialize] Skipping unsupported Tiptap block: ${node.type}`,
            );
            return null;
    }
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
    // the Tiptap attrs (written by the nested mini-editor), so it passes
    // straight through. Only carry it when non-empty so the saved document
    // doesn't accrue a phantom empty key and round-trip equality holds for
    // problems without a solution.
    const rawSolution = node.attrs?.solution;
    if (Array.isArray(rawSolution) && rawSolution.length > 0) {
        block.solution = rawSolution as InlineNode[];
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
    };

    // hint and each mistakeFeedback entry's feedback are stored as canonical
    // InlineNode[] in the Tiptap attrs (the nested mini-editor writes them in
    // that form), so they pass straight through. Only carry them when
    // non-empty so round-trip equality holds for blanks without them.
    const rawHint = node.attrs?.hint;
    if (Array.isArray(rawHint) && rawHint.length > 0) {
        result.hint = rawHint as InlineNode[];
    }

    const rawFeedback = node.attrs?.mistakeFeedback;
    if (Array.isArray(rawFeedback)) {
        const cleaned = rawFeedback.filter(
            (p): p is { match: string; feedback: InlineNode[] } =>
            p &&
            typeof p === 'object' &&
            typeof p.match === 'string' &&
            Array.isArray(p.feedback) &&
            p.match.length > 0 &&
            p.feedback.length > 0,
        );
        if (cleaned.length > 0) {
            result.mistakeFeedback = cleaned;
        }
    }

    return result;
}

function extractMarks(marks?: Array<{ type: string }>): Mark[] {
    if (!marks) return [];
    const out: Mark[] = [];
    for (const m of marks) {
        if (SUPPORTED_MARKS.has(m.type as Mark)) {
            out.push(m.type as Mark);
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
                attrs: { latex: block.latex },
            };

        case 'bullet_list':
            return activityBulletListToTiptap(block);

        case 'ordered_list':
            return activityOrderedListToTiptap(block);

        case 'fill_in_blank':
            return activityFillInBlankToTiptap(block);

        case 'image':
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
        },
        content: activityFillInBlankInlineToTiptap(block.content),
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
                marks: node.marks.map((m) => ({ type: m })),
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
    };
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

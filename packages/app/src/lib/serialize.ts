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
// adds fill_in_blank block plus blank inline tokens. Other schema block
// types (image, callout, problem) get translated when their Tiptap
// extensions exist.
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

// Walks the flat Tiptap block list and splits at every `sectionBreak` node.
// Each break opens a new Section that inherits its title and isCheckpoint
// attrs. If the doc doesn't start with a sectionBreak, an implicit first
// section is created with default metadata — this is the Stage 9c first-
// section UX: a teacher who wants to title or check the first section
// inserts a leading sectionBreak; otherwise defaults are used.
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

// Builds a fresh Section from a sectionBreak node's attrs. Nullish/empty
// titles normalize to "no title" — the schema accepts title="" but the
// editor's NodeView strips empties to null on its way out, and we mirror
// that on the way back in so the schema-side never carries phantom empties.
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
            // `number` field is intentionally omitted — the renderer
            // auto-numbers based on document position. Storing the number
            // would create churn whenever a teacher reorders problems.
            // Block-level fields solution / hasConfidenceRating / skills
            // get their editor UIs in Stage 15; until then we emit defaults
            // and the schema accepts the missing fields via its defaults.
            return {
                id: crypto.randomUUID(),
                type: 'fill_in_blank',
                content: tiptapFillInBlankInlineToActivity(node.content ?? []),
                hasConfidenceRating: false,
                skills: [],
            };

        default:
            // blockquote, codeBlock, horizontalRule (StarterKit defaults), and
            // any other unrecognized type fall through here.
            console.warn(
                `[serialize] Skipping unsupported Tiptap block: ${node.type}`,
            );
            return null;
    }
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

// A Tiptap listItem contains a paragraph (the item's inline content) and
// optionally nested bulletList/orderedList nodes. Standard Tiptap behavior
// produces exactly one paragraph per item — if a doc somehow has more, take
// the first paragraph's content and ignore the rest (warned). Children are
// recursively serialized.
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
            // Additional paragraphs in a single list item aren't a thing
            // Tiptap produces under normal authoring; silently drop.
        } else if (child.type === 'bulletList') {
            children.push(tiptapBulletListToActivity(child));
        } else if (child.type === 'orderedList') {
            children.push(tiptapOrderedListToActivity(child));
        }
    }

    if (children.length > 0) item.children = children;
    return item;
}

// -----------------------------------------------------------------------------
// Inline serialization — two parallel pairs for the two inline alphabets.
// -----------------------------------------------------------------------------

// Standard inline (text + math). Used by paragraph, heading. Blank tokens
// encountered here are skipped with a warning — they shouldn't appear
// outside fill_in_blank, but if a malformed document slips one through,
// dropping it is safer than letting it through to fail Zod validation.
function tiptapInlineToActivity(content: JSONContent[]): InlineNode[] {
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

        default:
            console.warn(
                `[serialize] Skipping unsupported Tiptap inline: ${node.type}`,
            );
            return null;
    }
}

// FillInBlank inline (text + math + blank). Used by fill_in_blank only.
// Returns FillInBlankInline (the wider union) so blank tokens type correctly.
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
    // Delegate to the narrow helper for text + math_inline — types narrow
    // correctly because InlineNode is a subset of FillInBlankInline.
    return tiptapInlineNodeToActivity(node);
}

function tiptapBlankToActivity(node: JSONContent): BlankToken | null {
    const answer = (node.attrs?.answer as string | undefined) ?? '';
    // BlankToken requires answer.min(1) per the schema. An empty answer
    // would fail Zod validation at save time; drop it here with a warning
    // so the rest of the document round-trips cleanly.
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

    // Existing id is preserved if present and valid-looking; otherwise mint
    // a fresh one. The editor's insertBlank / input rule both mint UUIDs at
    // insertion, so existing nodes should already have one. The fallback
    // covers pasted content or programmatic insertion paths that bypassed
    // the chain command.
    const rawId = node.attrs?.id;
    const id =
        typeof rawId === 'string' && rawId.length > 0
            ? rawId
            : crypto.randomUUID();

    return {
        type: 'blank',
        id,
        answer,
        acceptableAnswers,
        // hint, mistakeFeedback, width are optional and remain unset until
        // Stage 15 introduces their editor UIs. The schema treats absence
        // as "use default behavior" for all three.
    };
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

// Emits the Tiptap content array: one `sectionBreak` before each section,
// then that section's blocks. The first section is special — a leading
// break is emitted ONLY when the first section has non-default metadata
// (title set or isCheckpoint true). Without that rule a teacher would see
// a section_break at the top of every brand-new document, contradicting
// the Stage 9c implicit-first-section UX.
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

// Both attrs are always emitted (with null/false for absent values) to
// match what Tiptap produces from a live section_break instance — keeping
// the shape exact preserves round-trip equality with editor JSON.
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

            // Block types in the schema that don't have a Tiptap extension yet.
            // When the corresponding NodeViews exist, add cases above this group.
        case 'image':
        case 'callout':
        case 'problem':
            console.warn(
                `[serialize] No Tiptap mapping for ${block.type} yet; block omitted from editor view.`,
            );
            return null;

        default: {
            // Exhaustiveness check — TS errors if a new Block type is added
            // to the schema's discriminated union without being handled here.
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
    // We emit `id` as an attr so the editor's NodeView has stable identity
    // during a session. The schema's optional `number` field is intentionally
    // not emitted — renderer + editor NodeView both auto-number from position.
    // Block-level fields (solution, hasConfidenceRating, skills) get attrs
    // in Stage 15 when their editor UIs land; until then they're absent from
    // the Tiptap representation and re-emitted with defaults on save.
    return {
        type: 'fillInBlank',
        attrs: { id: block.id },
        content: activityFillInBlankInlineToTiptap(block.content),
    };
}

function activityInlineToTiptap(content: InlineNode[]): JSONContent[] {
    return content.map(activityInlineNodeToTiptap);
}

function activityInlineNodeToTiptap(node: InlineNode): JSONContent {
    switch (node.type) {
        case 'text':
            // Omit `marks` entirely when empty so the round-trip is exact —
            // Tiptap's serializer doesn't include an empty marks array on
            // unstyled text runs.
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
    // text + math_inline: delegate to the narrow helper. Types narrow
    // correctly because TextNode and InlineMathNode are members of both
    // InlineNode and FillInBlankInline unions.
    return activityInlineNodeToTiptap(node);
}

function activityBlankToTiptap(node: BlankToken): JSONContent {
    // acceptableAnswers always emitted (even when empty) for round-trip
    // exactness with Tiptap's stored attrs. Optional schema fields (hint,
    // mistakeFeedback, width) are emitted only when present — Stage 15
    // will surface them as editor attrs once their UIs land.
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

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
// Phase 1 scope (Stage 8): paragraph, heading, math_block (block-level) +
// text-with-marks, math_inline (inline-level). Other schema block types
// (image, callout, problem, fill_in_blank) get translated when their Tiptap
// extensions exist. Tiptap-only blocks (lists, blockquote, codeBlock from
// StarterKit) are silently skipped — see the list/quote decision noted in
// the commit thread.
//
// IDs: ActivityDocument blocks have UUIDs; Tiptap doesn't. tiptapToActivity
// generates fresh UUIDs on every call. Structural identity is preserved
// across round trips, but the IDs themselves are not stable. Phase 4
// collaboration will require stable IDs; that's a separate problem.
// =============================================================================

import type {
    ActivityDocument,
    ActivityMeta,
    Block,
    InlineNode,
    Mark,
} from '@activity/schema';
import type { JSONContent } from '@tiptap/react';

// Marks the schema accepts. Tiptap marks not in this set (e.g., strike) are
// silently dropped.
const SUPPORTED_MARKS: ReadonlySet<Mark> = new Set<Mark>([
    'bold',
    'italic',
    'underline',
    'code',
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

    const blocks = (tiptap.content ?? [])
    .map(tiptapBlockToActivity)
    .filter((b): b is Block => b !== null);

    return {
        schemaVersion: 1,
        meta,
        sections: [
            {
                id: crypto.randomUUID(),
                blocks,
            },
        ],
    };
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

        default:
            // bulletList, orderedList, blockquote, codeBlock, horizontalRule
            // (StarterKit defaults), and any other unrecognized type fall
            // through here. See list/quote decision pending.
            console.warn(
                `[serialize] Skipping unsupported Tiptap block: ${node.type}`,
            );
            return null;
    }
}

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
    // Phase 1: sections aren't surfaced in the editor. Flatten all
    // sections' blocks into one content array. Stage 9 (section_break)
    // changes this — sections become explicit dividers in the Tiptap content.
    const blocks = doc.sections.flatMap((s) => s.blocks);

    return {
        type: 'doc',
        content: blocks
        .map(activityBlockToTiptap)
        .filter((n): n is JSONContent => n !== null),
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

            // Block types in the schema that don't have a Tiptap extension yet.
            // When the corresponding NodeViews exist, add cases above this group.
        case 'image':
        case 'callout':
        case 'problem':
        case 'fill_in_blank':
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

// =============================================================================
// list.ts — Bullet and ordered list blocks
// -----------------------------------------------------------------------------
// Lists nest. A ListItem holds inline content plus an optional `children`
// array of nested list blocks; bullet and ordered lists can mix freely at
// any depth. This mirrors Tiptap's listItem > paragraph + (bulletList |
// orderedList) shape end-to-end, so Tab-to-indent in the editor preserves
// hierarchy through autosave.
//
// Recursion mechanic: only the cyclic edge (ListItem.children → list block →
// ListItem) needs z.lazy(). BulletListBlock and OrderedListBlock are plain
// z.objects, which keeps them usable as members of z.discriminatedUnion in
// blocks/index.ts. Discriminated unions need ZodObjects to introspect the
// `type` discriminator; a top-level z.lazy() wrapper would defeat that.
// =============================================================================

import { z } from 'zod';
import { InlineNode } from '../inline.js';

// ---- TypeScript interfaces (forward declarations for the recursive types) ---

export interface ListItem {
    id: string;
    content: z.infer<typeof InlineNode>[];
    children?: Array<BulletListBlock | OrderedListBlock>;
}

export interface BulletListBlock {
    id: string;
    type: 'bullet_list';
    items: ListItem[];
}

export interface OrderedListBlock {
    id: string;
    type: 'ordered_list';
    items: ListItem[];
}

// ---- Zod schemas ------------------------------------------------------------

// Lazy because ListItem.children refers to the list blocks, which refer back
// to ListItem. The arrow body only runs at parse time, by which point all
// three exports are bound.
export const ListItem: z.ZodType<ListItem, z.ZodTypeDef, unknown> = z.lazy(() =>
z.object({
    id: z.string().uuid(),
         content: z.array(InlineNode),
         children: z
         .array(z.union([BulletListBlock, OrderedListBlock]))
         .optional(),
}),
);

export const BulletListBlock = z.object({
    id: z.string().uuid(),
                                        type: z.literal('bullet_list'),
                                        items: z.array(ListItem),
});

export const OrderedListBlock = z.object({
    id: z.string().uuid(),
                                         type: z.literal('ordered_list'),
                                         items: z.array(ListItem),
});

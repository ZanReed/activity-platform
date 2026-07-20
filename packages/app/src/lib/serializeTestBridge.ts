import type { JSONContent } from '@tiptap/core';
import {
    activityToTiptap,
    tiptapToActivity as tiptapToActivityRaw,
} from './serialize';

// =============================================================================
// serializeTestBridge — bare-stream ⇆ strict-grid adapter for serialize tests.
// -----------------------------------------------------------------------------
// The editor tree IS the stored rows-of-columns model now (strict grid: doc =
// (sectionBreak | row)+, blocks only inside a column). Much of the serialize
// test corpus is written in the legacy "bare block stream" representation — one
// block per top-level slot — because the concern it certifies is per-block-type
// ATTR fidelity across a round trip, independent of grid structure. This adapter
// bridges that representation to the REAL strict serialize so those tests keep
// certifying attr fidelity with minimal churn:
//
//   • toStrict wraps consecutive bare blocks into 1-col stack rows, passing
//     `row` / `sectionBreak` nodes through untouched.
//   • toBare inverts it: a 1-col row unwraps to its blocks; a multi-col row and
//     a sectionBreak pass through.
//
// Both are idempotent (already-strict / already-bare → unchanged). The strict-
// grid STRUCTURE contract itself is pinned separately, against the RAW serialize
// (no adapter), in serialize.test.ts's "strict-grid structure oracle" — so that
// "green" certifies the reshape, not this convenience shim.
//
// NOT for production code — the editor never emits bare top-level blocks; this
// exists only so the attr corpus can stay in its readable bare form.
// =============================================================================

export function toStrict(doc: JSONContent): JSONContent {
    const out: JSONContent[] = [];
    let pending: JSONContent[] = [];
    const flush = (): void => {
        if (pending.length === 0) return;
        out.push({
            type: 'row',
            attrs: { gridLines: 'inherit' },
            content: [{ type: 'column', content: pending }],
        });
        pending = [];
    };
    for (const node of doc.content ?? []) {
        if (node.type === 'sectionBreak' || node.type === 'row') {
            flush();
            out.push(node);
        } else {
            pending.push(node);
        }
    }
    flush();
    return { ...doc, content: out };
}

export function toBare(doc: JSONContent): JSONContent {
    const out: JSONContent[] = [];
    for (const node of doc.content ?? []) {
        if (node.type === 'row' && (node.content?.length ?? 0) === 1) {
            for (const block of node.content![0]!.content ?? []) out.push(block);
        } else {
            out.push(node); // sectionBreak, or a multi-col row (kept as-is)
        }
    }
    return { ...doc, content: out };
}

type Tail<T extends unknown[]> = T extends [unknown, ...infer R] ? R : never;

/** tiptapToActivity that accepts a bare-stream doc (wraps it strict first). */
export function tiptapToActivityBare(
    doc: JSONContent,
    ...rest: Tail<Parameters<typeof tiptapToActivityRaw>>
): ReturnType<typeof tiptapToActivityRaw> {
    return tiptapToActivityRaw(toStrict(doc), ...rest);
}

/** activityToTiptap whose output is unwrapped back to a bare stream. */
export function activityToTiptapBare(
    ...args: Parameters<typeof activityToTiptap>
): JSONContent {
    return toBare(activityToTiptap(...args));
}

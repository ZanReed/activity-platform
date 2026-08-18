// =============================================================================
// activityChangeKey.ts — the autosave dirtiness fingerprint
// -----------------------------------------------------------------------------
// useAutosave fires when this string changes. That makes it a CONTRACT with
// ActivityEditor's save(), stated once here so it can be tested:
//
//   ⚠ EVERYTHING save() WRITES MUST BE AN INPUT TO THIS FUNCTION. ⚠
//
// A field that save() persists but this key ignores is a field that silently
// never saves — the edit leaves no trace until some unrelated change happens
// to carry it along, which reads as random data loss. The taxonomy eng review
// (2026-08-18) caught exactly that for `tags` before it shipped; it is
// extracted into this module so the rule has a home and a test file instead of
// living as a comment on a useMemo.
//
// Returns null while the document has not fully loaded — the autosave stays
// idle until BOTH editors (body + reference panel) have reported, so the
// baseline settles once rather than firing a spurious load-time save.
// =============================================================================

import type { JSONContent } from '@tiptap/react';
import type { ActivityMeta, CalculatorTool } from '@activity/schema';
import type { PedagogicalRole } from './pedagogicalRole';

export interface ActivityChangeKeyInputs {
    tiptapJson: JSONContent | null;
    meta: ActivityMeta | null;
    panelTitle: string;
    panelJson: JSONContent | null;
    calculator: CalculatorTool | undefined;
    /** Row-native (0037) — written by save(), so it belongs in the key. */
    tags: string[];
    /** Row-native (0037) — written by save(), so it belongs in the key. */
    pedagogicalRole: PedagogicalRole | null;
}

export function activityChangeKey({
    tiptapJson,
    meta,
    panelTitle,
    panelJson,
    calculator,
    tags,
    pedagogicalRole,
}: ActivityChangeKeyInputs): string | null {
    if (!tiptapJson || !meta || !panelJson) return null;
    return JSON.stringify({
        t: tiptapJson,
        m: meta,
        rt: panelTitle,
        rj: panelJson,
        c: calculator ?? null,
        tg: tags,
        pr: pedagogicalRole,
    });
}

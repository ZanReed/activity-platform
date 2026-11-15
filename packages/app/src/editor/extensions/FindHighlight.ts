// FindHighlight — paints find-and-replace matches in the main document.
// The find bar (components/FindReplaceBar.tsx) sets the query through a
// transaction meta; the plugin re-finds on every document change, so typing
// while the bar is open keeps the highlights true. Matching lives in
// ../findReplace.ts.
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { findInDoc, type DocMatch, type FindOptions } from '../findReplace';

export interface FindState {
    query: string;
    opts: FindOptions;
    matches: DocMatch[];
    /** Index into matches of the current one, or -1. */
    current: number;
}

export const findHighlightKey = new PluginKey<FindState>('findHighlight');

/** Meta payload: a new query (or '' to clear), and/or which match is current. */
export interface FindMeta {
    query?: string;
    opts?: FindOptions;
    current?: number;
    /** Make current the first match starting at or after this position
     *  (wrapping to the first): Replace's "go on to the next one". */
    currentFrom?: number;
}

const EMPTY: FindState = { query: '', opts: { matchCase: false }, matches: [], current: -1 };

export const FindHighlight = Extension.create({
    name: 'findHighlight',
    addProseMirrorPlugins() {
        return [
            new Plugin<FindState>({
                key: findHighlightKey,
                state: {
                    init: () => EMPTY,
                    apply(tr, prev) {
                        const meta = tr.getMeta(findHighlightKey) as FindMeta | undefined;
                        if (!meta && !tr.docChanged) return prev;
                        const query = meta?.query ?? prev.query;
                        const opts = meta?.opts ?? prev.opts;
                        if (query === '') return EMPTY;
                        const matches = findInDoc(tr.doc, query, opts);
                        let wanted = meta?.current ?? prev.current;
                        if (meta?.currentFrom !== undefined) {
                            const at = matches.findIndex((m) => m.from >= meta.currentFrom!);
                            wanted = at === -1 ? 0 : at;
                        }
                        const current = matches.length === 0 ? -1 : Math.min(Math.max(wanted, 0), matches.length - 1);
                        return { query, opts, matches, current };
                    },
                },
                props: {
                    decorations(state) {
                        const s = findHighlightKey.getState(state);
                        if (!s || s.matches.length === 0) return null;
                        return DecorationSet.create(
                            state.doc,
                            s.matches.map((m, i) =>
                                Decoration.inline(m.from, m.to, {
                                    class: i === s.current ? 'find-match find-match--current' : 'find-match',
                                }),
                            ),
                        );
                    },
                },
            }),
        ];
    },
});

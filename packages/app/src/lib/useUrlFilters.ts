// =============================================================================
// useUrlFilters.ts — list filters kept in the query string (F-6)
// -----------------------------------------------------------------------------
// Back, refresh and a shared link keep what the teacher filtered. Writes use
// `replace`, so typing in the search box doesn't fill the history with one
// entry per keystroke.
// =============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';

export function useUrlFilters() {
    const [params, setParams] = useSearchParams();
    const set = useCallback(
        (changes: Record<string, string | readonly string[] | null>) => {
            setParams(
                (prev) => {
                    const next = new URLSearchParams(prev);
                    for (const [key, value] of Object.entries(changes)) {
                        next.delete(key);
                        if (Array.isArray(value)) for (const v of value) next.append(key, v);
                        else if (typeof value === 'string' && value !== '') next.set(key, value);
                    }
                    return next;
                },
                { replace: true },
            );
        },
        [setParams],
    );
    /** Add or remove one value of a multi-value key, computed from the
     *  CURRENT params, so two quick clicks can't drop the first. */
    const toggle = useCallback(
        (key: string, value: string) => {
            setParams(
                (prev) => {
                    const next = new URLSearchParams(prev);
                    const cur = next.getAll(key);
                    next.delete(key);
                    for (const v of cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value]) next.append(key, v);
                    return next;
                },
                { replace: true },
            );
        },
        [setParams],
    );
    return {
        get: (key: string) => params.get(key) ?? '',
        getAll: (key: string) => params.getAll(key),
        set,
        toggle,
    };
}

/**
 * A text box whose value is kept in the URL. The box itself is driven by
 * LOCAL state: react-router applies URL changes inside a transition, so an
 * input controlled by the URL value would lag a keystroke — the caret jumps
 * to the end when editing mid-word and fast typing can drop keys (Fable
 * review). The URL follows the local text; an outside change to the URL
 * (Back, clear) flows back in.
 */
export function useUrlText(filters: ReturnType<typeof useUrlFilters>, key: string): [string, (v: string) => void] {
    const urlValue = filters.get(key);
    const [text, setText] = useState(urlValue);
    const lastWritten = useRef(urlValue);
    useEffect(() => {
        if (urlValue !== lastWritten.current) {
            lastWritten.current = urlValue;
            setText(urlValue);
        }
    }, [urlValue]);
    const update = (v: string) => {
        setText(v);
        lastWritten.current = v;
        filters.set({ [key]: v });
    };
    return [text, update];
}

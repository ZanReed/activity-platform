// =============================================================================
// BankItemPreview.tsx — one practice-bank item, previewed for its owner
// (docs/design/practice-banks.md PB-11, eng review BE-11)
// -----------------------------------------------------------------------------
// The point is RATIFYING: a bank can only be marked `ratified` after someone
// has read its items on the real renderer, so this shows what a ratifier needs
// that a student never sees — the answer key, and every mistake value — for
// one row of the item's stored value table at a time.
//
// Rows, never re-derivation (BE-3): the importer enumerated every valid
// combination once; this page steps through THOSE rows. Nothing here evaluates
// a `where` or a derived variable — a preview that re-derived could disagree
// with the table students will one day be served from.
//
// PRINT mode on purpose, like BankPreview: a static picture with nothing to
// press. No Check button can exist here (the inert store throws if one ever
// tried), so previewing never writes a row anywhere.
//
// Lazy-loaded by the chain page's bank section: the viewer is only paid for
// when a teacher opens a preview.
// =============================================================================

import { useEffect, useMemo, useState } from 'react';
import { ActivityDocument } from '@activity/schema';
import { BankValueTable, bankRowValues } from '@activity/schema/bank-seed';
import {
    AnswerKeyProvider,
    ViewerContainer,
    createViewerStore,
    extractAnswerKey,
    sanitizeActivityDocument,
    substituteSeedValues,
} from '@activity/viewer';
import { substituteSeededAnswers } from '@activity/viewer/seeded-print';
import '@activity/viewer/tokens.css';
import '@activity/viewer/viewer.css';
import { supabase } from '../lib/supabase';
import { parseNumericValue } from '../../../viewer/src/server/grading/numeric';

type Loaded = { document: ActivityDocument; table: BankValueTable };

type State =
    | { phase: 'loading' }
    | { phase: 'ready'; item: Loaded }
    | { phase: 'error'; message: string };

interface MistakeRow {
    readonly match: string;
    readonly value: string;
    readonly misconception: string | null;
}

/** Every seeded blank's answer and mistake values at one row, authored order. */
function keyLines(authored: ActivityDocument, resolved: unknown): Array<{ answer: string; mistakes: MistakeRow[] }> {
    const collect = (node: unknown, out: Array<Record<string, unknown>>): void => {
        if (Array.isArray(node)) {
            node.forEach((n) => collect(n, out));
            return;
        }
        if (node === null || typeof node !== 'object') return;
        const o = node as Record<string, unknown>;
        if (o.type === 'blank' && typeof o.answer === 'string') out.push(o);
        for (const v of Object.values(o)) if (v !== null && typeof v === 'object') collect(v, out);
    };
    const a: Array<Record<string, unknown>> = [];
    const r: Array<Record<string, unknown>> = [];
    collect(authored.sections, a);
    collect(resolved, r);
    return r.map((blank, i) => {
        const authoredMistakes = (a[i]?.mistakeFeedback as Array<{ match?: unknown }> | undefined) ?? [];
        const mistakes = ((blank.mistakeFeedback as Array<Record<string, unknown>> | undefined) ?? []).map((m, j) => ({
            match: String(authoredMistakes[j]?.match ?? m.match ?? ''),
            value: String(m.match ?? ''),
            misconception: typeof m.misconceptionId === 'string' ? m.misconceptionId : null,
        }));
        return { answer: String(blank.answer), mistakes };
    });
}

/** The first numeric answer at every row — the "extremes" view (BE-11). */
function firstAnswerByRow(item: Loaded): Array<number | null> {
    return item.table.rows.map((_, row) => {
        const values = bankRowValues(item.table, row);
        const lines = keyLines(item.document, substituteSeededAnswers(item.document.sections, values));
        const first = lines[0];
        return first ? parseNumericValue(first.answer) : null;
    });
}

export default function BankItemPreview({ itemId }: { itemId: string }) {
    const [state, setState] = useState<State>({ phase: 'loading' });
    const [row, setRow] = useState(0);

    useEffect(() => {
        let cancelled = false;
        setState({ phase: 'loading' });
        setRow(0);
        supabase
            .from('practice_item')
            .select('document, value_table')
            .eq('item_id', itemId)
            .maybeSingle()
            .then(({ data, error }) => {
                if (cancelled) return;
                if (error || !data) {
                    setState({ phase: 'error', message: error?.message ?? 'This item is no longer in your bank.' });
                    return;
                }
                const doc = ActivityDocument.safeParse((data as { document: unknown }).document);
                const table = BankValueTable.safeParse((data as { value_table: unknown }).value_table);
                if (!doc.success || !table.success) {
                    setState({ phase: 'error', message: 'This item could not be read. Re-run the import.' });
                    return;
                }
                setState({ phase: 'ready', item: { document: doc.data, table: table.data } });
            });
        return () => {
            cancelled = true;
        };
    }, [itemId]);

    const item = state.phase === 'ready' ? state.item : null;
    const values = useMemo(() => (item ? bankRowValues(item.table, row) : {}), [item, row]);

    const served = useMemo(
        () => (item ? substituteSeedValues(sanitizeActivityDocument(item.document), values) : null),
        [item, values],
    );
    const resolvedSections = useMemo(
        () => (item ? substituteSeededAnswers(substituteSeedValues(item.document, values), values) : null),
        [item, values],
    );
    const answerKey = useMemo(() => (resolvedSections ? extractAnswerKey(resolvedSections) : null), [resolvedSections]);
    const lines = useMemo(
        () => (item && resolvedSections ? keyLines(item.document, resolvedSections.sections) : []),
        [item, resolvedSections],
    );

    const [extremes, setExtremes] = useState<{ min: number; max: number } | null>(null);
    useEffect(() => setExtremes(null), [itemId]);
    const findExtremes = () => {
        if (!item) return;
        const answers = firstAnswerByRow(item);
        let min = -1;
        let max = -1;
        answers.forEach((v, i) => {
            if (v === null) return;
            if (min === -1 || v < answers[min]!) min = i;
            if (max === -1 || v > answers[max]!) max = i;
        });
        if (min !== -1) setExtremes({ min, max });
    };

    const store = useMemo(
        () =>
            createViewerStore({
                userId: 'teacher-bank-preview',
                activityId: itemId,
                versionId: 'preview',
                checkService: {
                    checkSection: () => Promise.reject(new Error('the bank preview never checks work')),
                    fetchReleasedFeedback: () => Promise.reject(new Error('the bank preview never fetches feedback')),
                },
            }),
        [itemId],
    );

    if (state.phase === 'loading') return <p className="ch-muted" role="status">Loading preview…</p>;
    if (state.phase === 'error') {
        return (
            <p className="ch-error" role="alert">
                Couldn't load this item: {state.message}
            </p>
        );
    }
    const { table } = state.item;
    const rows = table.rows.length;
    const valueText = table.columns.map((c) => `${c} = ${values[c]}`).join(' · ');

    return (
        <div className="bank-preview">
            <div className="bank-preview__bar ch-noprint">
                <span>
                    {rows === 1 && table.columns.length === 0
                        ? 'Fixed item (no seeded values)'
                        : `Sample ${row + 1} of ${rows} valid · ${table.total} combinations before any where`}
                </span>
                {rows > 1 && (
                    <span className="bank-preview__nav">
                        <button type="button" className="ch-btn" onClick={() => setRow((r) => (r - 1 + rows) % rows)}>
                            Previous sample
                        </button>
                        <button type="button" className="ch-btn" onClick={() => setRow((r) => (r + 1) % rows)}>
                            Next sample
                        </button>
                        {extremes ? (
                            <>
                                <button type="button" className="ch-btn" onClick={() => setRow(extremes.min)}>
                                    Smallest answer
                                </button>
                                <button type="button" className="ch-btn" onClick={() => setRow(extremes.max)}>
                                    Largest answer
                                </button>
                            </>
                        ) : (
                            <button type="button" className="ch-btn" onClick={findExtremes}>
                                Find the extremes
                            </button>
                        )}
                    </span>
                )}
            </div>
            {valueText && <p className="bank-preview__values">{valueText}</p>}
            <div className="bank-preview__render">
                {served && answerKey && (
                    <AnswerKeyProvider answers={answerKey}>
                        <ViewerContainer document={served} store={store} mode="print" />
                    </AnswerKeyProvider>
                )}
            </div>
            {lines.some((l) => l.mistakes.length > 0) && (
                <div className="bank-preview__mistakes">
                    <p className="ch-notes-label">Mistakes at this sample</p>
                    <ul>
                        {lines.flatMap((l, i) =>
                            l.mistakes.map((m, j) => (
                                <li key={`${i}-${j}`}>
                                    Blank {i + 1}: <code>!{m.match}</code> = <strong>{m.value}</strong>
                                    {' '}(answer {l.answer}){m.misconception ? ` · ${m.misconception}` : ''}
                                </li>
                            )),
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

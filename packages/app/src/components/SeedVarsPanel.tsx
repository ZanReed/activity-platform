import { useEffect, useMemo, useState } from 'react';
import type { Editor as TiptapEditor } from '@tiptap/core';
import type { SeedVar } from '@activity/schema';
import { deriveSeedValues } from '@activity/viewer/seed-values';
import { seedReferenceFindings, withoutOwnSeedDolSections } from '../lib/seedRules';
import {
    findingsText,
    readRows,
    rowFromVar,
    suggestName,
    type SeedKind,
    type SeedRowDraft,
} from '../lib/seedPanelWords';

// =============================================================================
// SeedVarsPanel — declare, edit and remove an activity's seeded variables
// (seeded-data.md → "GUI amendment 2026-11-12", S-1…S-6). Was a read-only list.
//
// It holds the rows as typed and writes `meta.seedVars` only when EVERY row is
// a valid declaration (seedRules.ts, the importer's own rules), so a saved
// activity never carries a half-typed variable. The last variable removed
// writes `undefined`, never `[]` (R11: no default, or every save churns).
//
// Under the rows, the importer's reference checks run live over the editor's
// document: a {name} with no variable, a variable nothing uses, {a} in maths.
// Renaming or removing a variable rewrites nothing (S-5): these checks point at
// what's left behind.
//
// The sample student uses the real derivation (deriveSeedValues) with a seed no
// student can have, so it shows the shape of the numbers, never anyone's.
// =============================================================================

const LABEL = 'text-xs font-semibold uppercase tracking-wide text-muted';
const HELP = 'mt-1 text-xs text-muted';
const INPUT =
    'min-w-0 rounded-md border border-line-strong bg-canvas px-2 py-1 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent';
const BUTTON = 'rounded px-2 py-1 text-xs text-muted transition hover:bg-surface-2 hover:text-ink disabled:opacity-50';
const RECHECK_MS = 300;

const KINDS: { value: SeedKind; label: string }[] = [
    { value: 'int', label: 'Whole number in a range' },
    { value: 'list', label: 'One value from a list' },
    { value: 'sample', label: 'Several different numbers (a dataset)' },
];

function useBodyFindings(
    editor: TiptapEditor | null | undefined,
    names: readonly string[],
    visible: boolean,
): string[] {
    const [tick, setTick] = useState(0);
    // The drawer is hidden, not unmounted: no walking the document while nobody
    // can see the result. Opening it recomputes (`visible` is a memo key).
    useEffect(() => {
        if (!editor || !visible) return;
        let timer: ReturnType<typeof setTimeout> | undefined;
        const bump = () => {
            clearTimeout(timer);
            timer = setTimeout(() => setTick((t) => t + 1), RECHECK_MS);
        };
        editor.on('update', bump);
        return () => {
            clearTimeout(timer);
            editor.off('update', bump);
        };
    }, [editor, visible]);
    const key = names.join('\u0000');
    return useMemo(() => {
        if (!editor || !visible) return [];
        try {
            const body = withoutOwnSeedDolSections(editor.getJSON().content ?? []);
            // Unused is always checked here: a variable added before the text that
            // uses it is honestly unused until then.
            return findingsText(seedReferenceFindings(body, names, true), names.length);
        } catch {
            return [];
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor, key, tick, visible]);
}

function show(value: number | number[] | undefined): string {
    if (!Array.isArray(value)) return String(value ?? '');
    // A big sample would flood the drawer; the first few show its shape.
    return value.length > 12 ? `${value.slice(0, 12).join(', ')}, … (${value.length} numbers)` : value.join(', ');
}

export default function SeedVarsPanel({
    seedVars,
    onChange,
    editor,
    visible = true,
}: {
    seedVars: SeedVar[] | undefined;
    onChange: (next: SeedVar[] | undefined) => void;
    editor?: TiptapEditor | null;
    /** False while the drawer is closed (it stays mounted). */
    visible?: boolean;
}) {
    const stored = seedVars ?? [];
    const [rows, setRows] = useState<SeedRowDraft[]>(() => stored.map(rowFromVar));
    const [problems, setProblems] = useState<string[][]>([]);
    const [sample, setSample] = useState(0);
    const storedKey = JSON.stringify(stored);
    // An import or a load replaces the stored list: show it.
    useEffect(() => {
        setRows(stored.map(rowFromVar));
        setProblems([]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storedKey]);

    // Closing the drawer never leaves a draft behind (Fable review 2026-11-12):
    // a valid one is saved, an invalid one goes back to what is stored, so what
    // reopens is always what the activity has.
    useEffect(() => {
        if (visible) return;
        const read = readRows(rows);
        if (read.vars && JSON.stringify(read.vars) !== storedKey) {
            onChange(read.vars.length > 0 ? read.vars : undefined);
        } else if (!read.vars) {
            setRows(stored.map(rowFromVar));
            setProblems([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    const commit = (next: SeedRowDraft[]): void => {
        const read = readRows(next);
        setProblems(read.problems);
        if (!read.vars) return;
        if (JSON.stringify(read.vars) === storedKey) return;
        onChange(read.vars.length > 0 ? read.vars : undefined);
    };
    const edit = (i: number, patch: Partial<SeedRowDraft>, now = false) => {
        const next = rows.map((row, j) => (j === i ? { ...row, ...patch } : row));
        setRows(next);
        if (now) commit(next);
    };

    const findings = useBodyFindings(editor, stored.map((v) => v.name), visible);
    const values = useMemo(
        () => (stored.length > 0 ? deriveSeedValues(stored, `editor-sample:${sample}`) : null),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [storedKey, sample],
    );
    const draftVars = readRows(rows).vars;
    const unsaved = problems.some((p) => p.length > 0) || JSON.stringify(draftVars ?? null) !== JSON.stringify(stored);

    return (
        <div data-seed-vars="true">
            <span className={LABEL}>Seeded variables (per-student numbers)</span>
            <p className={HELP}>
                Each student is served, and graded on, their own values. Write <code>{'{a}'}</code> in text,{' '}
                <code>a*p</code> as a blank&rsquo;s answer, and <code>{'\\seed{a}'}</code> in maths.
            </p>

            {rows.length > 0 && (
                <ul className="mt-2 grid gap-2">
                    {rows.map((row, i) => (
                        <li key={i} className="grid gap-1 rounded-md border border-line p-2" data-seed-row={i}>
                            <div className="flex flex-wrap items-center gap-1">
                                <input
                                    className={`${INPUT} w-20 font-mono`}
                                    aria-label={`Variable ${i + 1} name`}
                                    value={row.name}
                                    onChange={(e) => edit(i, { name: e.target.value })}
                                    onBlur={() => commit(rows)}
                                />
                                <select
                                    className={`${INPUT} flex-1`}
                                    aria-label={`Variable ${i + 1} kind`}
                                    value={row.kind}
                                    onChange={(e) => edit(i, { kind: e.target.value as SeedKind }, true)}
                                >
                                    {KINDS.map((k) => (
                                        <option key={k.value} value={k.value}>
                                            {k.label}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    className={BUTTON}
                                    aria-label={`Remove variable ${row.name || i + 1}`}
                                    onClick={() => {
                                        const next = rows.filter((_, j) => j !== i);
                                        setRows(next);
                                        commit(next);
                                    }}
                                >
                                    Remove
                                </button>
                            </div>
                            <div className="flex flex-wrap items-center gap-1 text-xs text-muted">
                                {row.kind === 'list' ? (
                                    <input
                                        className={`${INPUT} flex-1`}
                                        aria-label={`Variable ${i + 1} values`}
                                        placeholder="1.50, 1.75, 2.25"
                                        value={row.values}
                                        onChange={(e) => edit(i, { values: e.target.value })}
                                        onBlur={() => commit(rows)}
                                    />
                                ) : (
                                    <>
                                        {row.kind === 'sample' && (
                                            <>
                                                <input
                                                    className={`${INPUT} w-14`}
                                                    aria-label={`Variable ${i + 1} how many`}
                                                    value={row.n}
                                                    onChange={(e) => edit(i, { n: e.target.value })}
                                                    onBlur={() => commit(rows)}
                                                />
                                                numbers,
                                            </>
                                        )}
                                        from
                                        <input
                                            className={`${INPUT} w-16`}
                                            aria-label={`Variable ${i + 1} lowest`}
                                            value={row.min}
                                            onChange={(e) => edit(i, { min: e.target.value })}
                                            onBlur={() => commit(rows)}
                                        />
                                        to
                                        <input
                                            className={`${INPUT} w-16`}
                                            aria-label={`Variable ${i + 1} highest`}
                                            value={row.max}
                                            onChange={(e) => edit(i, { max: e.target.value })}
                                            onBlur={() => commit(rows)}
                                        />
                                    </>
                                )}
                            </div>
                            {(problems[i]?.length ?? 0) > 0 && (
                                <ul className="text-xs text-danger" role="alert">
                                    {problems[i]!.map((p, k) => (
                                        <li key={k}>{p}</li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            )}
            {unsaved && (
                <p className={HELP} role="note">
                    These changes aren&rsquo;t saved yet. The activity keeps its last working variables until they are fixed.
                </p>
            )}
            <button
                type="button"
                className={`${BUTTON} mt-1 border border-line`}
                onClick={() => {
                    const name = suggestName(rows.map((r) => r.name.trim()));
                    const next = [...rows, { name, kind: 'int' as const, min: '1', max: '10', n: '', values: '' }];
                    setRows(next);
                    commit(next);
                }}
            >
                Add a variable
            </button>

            {values && !unsaved && (
                <p className={HELP} data-seed-sample="true">
                    One student might get{' '}
                    {stored.map((v, i) => (
                        <span key={v.name}>
                            {i > 0 ? '; ' : ''}
                            <code>{v.name}</code> = {show(values[v.name])}
                        </span>
                    ))}
                    .{' '}
                    <button type="button" className="underline" onClick={() => setSample((s) => s + 1)}>
                        Show another
                    </button>
                </p>
            )}
            {findings.length > 0 && (
                <ul className="mt-2 grid gap-0.5 text-xs text-warning-strong" role="status" data-seed-findings="true">
                    {findings.map((f, k) => (
                        <li key={k}>{f}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}

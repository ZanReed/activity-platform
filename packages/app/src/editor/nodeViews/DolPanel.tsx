import { useEffect, useState } from 'react';
import type { Editor as TiptapEditor } from '@tiptap/core';
import type { NodeViewProps } from '@tiptap/react';
import type { BankValueTable } from '@activity/schema/bank-seed';
import type { SectionBreakStorage } from '../extensions/SectionBreak';
import { fetchSkillLabels, type SkillLabel } from '../../lib/skillLabels';
import { activityVarsInDol } from '../../lib/dolRules';
import {
    attemptsText,
    dolSectionSlice,
    passNote,
    readDolSection,
    activityVarText,
    shapeTexts,
    type DolPanelRead,
} from '../../lib/dolPanelWords';

// =============================================================================
// DolPanel — a DoL section's skills, numbers and pass note, under its break
// (D65; GUI amendment 2026-11-12, D-3…D-6). Lazy: loaded only when a section
// is the DoL (SectionBreakView).
//
// SKILLS (D-3): one per gradable item, in order; the first item decides the
// pass. On a Bank copy whose DoL came with skills they are curriculum data,
// shown by name and not editable. Otherwise each is picked from `skill_label`.
// Only picked skills are written, so a half-picked list never stores a blank.
//
// NUMBERS (D-4): a seeded DoL's tables ride along untouched and are summarised;
// a DoL made here has none, so one attempt. The retake shown is what a save
// stores (D-5: stampDolRetake over the section as it is now).
// =============================================================================

const RECHECK_MS = 300;

function useSectionRead(editor: TiptapEditor, getPos: NodeViewProps['getPos']): DolPanelRead | null {
    const read = (): DolPanelRead | null => {
        const pos = typeof getPos === 'function' ? getPos() : undefined;
        if (pos === undefined) return null;
        try {
            return readDolSection(dolSectionSlice(editor.state.doc, pos));
        } catch {
            return null;
        }
    };
    const [value, setValue] = useState<DolPanelRead | null>(read);
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout> | undefined;
        const bump = () => {
            clearTimeout(timer);
            timer = setTimeout(() => setValue(read()), RECHECK_MS);
        };
        editor.on('update', bump);
        return () => {
            clearTimeout(timer);
            editor.off('update', bump);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor]);
    return value;
}

/** The activity facts Editor.tsx writes into SectionBreak storage, live. */
function useActivityFacts(editor: TiptapEditor): { isCopy: boolean; seedNames: string[] } {
    const storage = (editor.storage as { sectionBreak?: SectionBreakStorage }).sectionBreak;
    const snapshot = () => ({ isCopy: storage?.isCopy ?? false, seedNames: storage?.seedNames ?? [] });
    const [facts, setFacts] = useState(snapshot);
    useEffect(() => {
        if (!storage) return;
        const update = () => setFacts(snapshot());
        storage.listeners.add(update);
        update();
        return () => {
            storage.listeners.delete(update);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storage]);
    return facts;
}

function useSkillLabels(): { labels: SkillLabel[]; failed: boolean } {
    const [labels, setLabels] = useState<SkillLabel[]>([]);
    const [failed, setFailed] = useState(false);
    useEffect(() => {
        let live = true;
        fetchSkillLabels().then(
            (l) => live && setLabels(l),
            () => live && setFailed(true),
        );
        return () => {
            live = false;
        };
    }, []);
    return { labels, failed };
}

export default function DolPanel({
    dol,
    editor,
    getPos,
    onChange,
}: {
    dol: Record<string, unknown>;
    editor: TiptapEditor;
    getPos: NodeViewProps['getPos'];
    onChange: (dol: Record<string, unknown>) => void;
}) {
    const stored = Array.isArray(dol.skills) ? (dol.skills as string[]) : [];
    const tables = (dol.seed as { tables?: BankValueTable[] } | undefined)?.tables;
    const { isCopy, seedNames } = useActivityFacts(editor);
    const read = useSectionRead(editor, getPos);
    const { labels, failed } = useSkillLabels();
    const labelOf = (id: string) => labels.find((l) => l.id === id)?.label ?? null;

    // A copy's catalogue skills stay as they came (D-3, curriculum-owned).
    // "Came with skills" is decided when the panel opens, so a DoL added to a
    // copy in this sitting stays editable while it is set up; `isCopy` stays
    // live (Fable review: it is written by an effect, not before render).
    const [startedWithSkills] = useState(() => stored.length > 0);
    const locked = isCopy && startedWithSkills;
    const [keptNote, setKeptNote] = useState(false);
    const [rows, setRows] = useState<string[]>(() => (stored.length > 0 ? stored : ['']));
    const storedKey = stored.join('\u0000');
    useEffect(() => {
        if (rows.filter((r) => r !== '').join('\u0000') !== storedKey) setRows(stored.length > 0 ? stored : ['']);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storedKey]);

    const commit = (next: string[]) => {
        const skills = next.filter((r) => r !== '');
        // Blank rows close up so each skill sits beside its item's number;
        // one trailing blank (a just-added row) stays to be picked.
        setRows(next[next.length - 1] === '' ? [...skills, ''] : skills.length > 0 ? skills : ['']);
        // A DoL with numbers keeps its last skill rather than save with none,
        // which would drop the whole DoL and its numbers (Fable review).
        if (skills.length === 0 && dol.seed) {
            setKeptNote(true);
            return;
        }
        setKeptNote(false);
        if (skills.join('\u0000') === storedKey) return;
        // Written in the stored shape: a leftover importer marker
        // ({ pending: true }) carries no `retake`, and serialize would drop it.
        onChange({ skills, retake: dol.retake === true, ...(dol.seed ? { seed: dol.seed } : {}) });
    };

    const strays = read ? activityVarsInDol(new Set(read.refs), seedNames, tables) : [];
    const problems = read ? shapeTexts(stored, read.items) : [];
    const retake = read?.retake ?? false;

    return (
        <div className="section-break__dol" data-dol-panel="true">
            <p className="section-break__dol-lead">
                A demonstration of learning: one item per skill. The first item decides whether a student has the skill.
            </p>
            {locked ? (
                <ol className="section-break__dol-skills" aria-label="DoL skills">
                    {stored.map((id, i) => (
                        <li key={i}>
                            {labelOf(id) ?? id}
                            {i === 0 ? ' (decides the pass)' : ''}
                        </li>
                    ))}
                </ol>
            ) : (
                <ol className="section-break__dol-skills" aria-label="DoL skills">
                    {rows.map((id, i) => (
                        <li key={i}>
                            <select
                                aria-label={`Skill for item ${i + 1}`}
                                value={id}
                                onChange={(e) => commit(rows.map((r, j) => (j === i ? e.target.value : r)))}
                                onKeyDown={(e) => e.stopPropagation()}
                            >
                                <option value="">Pick a skill…</option>
                                {id !== '' && !labels.some((l) => l.id === id) && <option value={id}>{id}</option>}
                                {labels.map((l) => (
                                    <option key={l.id} value={l.id}>
                                        {l.label}
                                    </option>
                                ))}
                            </select>
                            {i === 0 ? <span> decides the pass</span> : null}
                            {rows.length > 1 && (
                                <button
                                    type="button"
                                    aria-label={`Remove skill ${i + 1}`}
                                    onClick={() => commit(rows.filter((_, j) => j !== i))}
                                >
                                    Remove
                                </button>
                            )}
                        </li>
                    ))}
                </ol>
            )}
            {!locked && (
                <button type="button" onClick={() => setRows([...rows, ''])}>
                    Add a skill
                </button>
            )}
            {failed && <p role="status">Skill names couldn’t load; refresh to try again.</p>}
            {keptNote && (
                <p role="status">
                    A DoL needs a skill, so it keeps “{labelOf(stored[0] ?? '') ?? stored[0]}” until you pick another.
                </p>
            )}
            {strays.length > 0 && (
                <p className="section-break__dol-problems" role="alert" data-dol-activity-vars="true">
                    {activityVarText(strays)}
                </p>
            )}
            {problems.length > 0 && (
                <ul className="section-break__dol-problems" role="status" data-dol-problems="true">
                    {problems.map((p, k) => (
                        <li key={k}>{p}</li>
                    ))}
                </ul>
            )}
            <p data-dol-attempts="true">{attemptsText(tables, retake)}</p>
            <p data-dol-pass="true">{passNote(isCopy, stored[0] ? labelOf(stored[0]) : null)}</p>
        </div>
    );
}

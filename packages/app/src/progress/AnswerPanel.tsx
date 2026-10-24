// =============================================================================
// AnswerPanel.tsx — one student's answers on one activity (CP-3 A, DR-5, DR-6)
// -----------------------------------------------------------------------------
// Its own address (/classes/:classId/progress/:studentId/:activityId and
// /activity/:id/progress/:studentId), drawn as a side panel over the grid's
// right at ≥ 768 px and as a full page on phones (progress.css). Close / Esc
// go back to the page; Refresh keeps it open (it is a URL); focus moves into
// it on open and the page returns focus to the cell that opened it.
//
// Per section: the LATEST attempt (stated once), each question's label, the
// student's answer as words (answerText, from THEIR served document), ✓ Right
// / ✗ Wrong in glyph and word, the authored feedback and misconception the
// grader attached, and under a wrong answer only, "Answer: …" (DR-6).
// =============================================================================

import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useOutletContext, useParams } from 'react-router';
import { dolSectionId, sectionAnswerLines, servedDocument, type AnswerLine, type ServedDoc } from '../lib/answerText';

/** The docs-map key of a version's DoL form-2 rebuild (D65). */
const dolForm2Key = (versionId: string) => `${versionId}#dol-form-2`;
import {
    fetchMisconceptionDescriptions,
    fetchStudentWork,
    fetchVersionContents,
    responsesHref,
    type StudentWork,
} from '../lib/classProgress';
import type { ProgressOutletContext } from './common';

interface Ready {
    work: StudentWork;
    docs: Map<string, ServedDoc | null>;
    descriptions: Map<string, string | null>;
}

export default function AnswerPanel() {
    const params = useParams();
    const studentId = params.studentId ?? '';
    const activityId = params.activityId ?? params.id ?? '';
    const ctx = useOutletContext<ProgressOutletContext>();
    const navigate = useNavigate();
    const [state, setState] = useState<{ status: 'loading' } | { status: 'error' } | ({ status: 'ready' } & Ready)>({
        status: 'loading',
    });
    const headingRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        let cancelled = false;
        setState({ status: 'loading' });
        void (async () => {
            try {
                const work = await fetchStudentWork(ctx.classId, studentId, activityId);
                const contents = await fetchVersionContents(work.versions.map((v) => v.version_id));
                const docs = new Map<string, ServedDoc | null>();
                for (const v of work.versions) {
                    const c = contents.get(v.version_id);
                    try {
                        const served = c ? servedDocument(c.content, v.version_id, studentId) : null;
                        docs.set(v.version_id, served);
                        // D65: a DoL retake was served FORM 2's numbers, so its
                        // answers read against form 2 (a DoL attempt's form is
                        // its attempt number).
                        if (c && served && dolSectionId(served)) {
                            docs.set(dolForm2Key(v.version_id), servedDocument(c.content, v.version_id, studentId, 2));
                        }
                    } catch {
                        docs.set(v.version_id, null);
                    }
                }
                const ids = new Set<string>();
                for (const v of work.versions)
                    for (const s of v.sections)
                        for (const verdicts of [s.verdicts, s.first?.verdicts])
                            for (const item of Object.values((verdicts ?? {}) as Record<string, { misconceptionIds?: string[] }>))
                                for (const id of item?.misconceptionIds ?? []) ids.add(id);
                let descriptions = new Map<string, string | null>();
                try {
                    descriptions = await fetchMisconceptionDescriptions([...ids]);
                } catch {
                    // The answers still show; a tag then reads as unknown.
                }
                if (!cancelled) setState({ status: 'ready', work, docs, descriptions });
            } catch {
                if (!cancelled) setState({ status: 'error' });
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [ctx.classId, studentId, activityId]);

    useEffect(() => {
        headingRef.current?.focus();
    }, [studentId, activityId]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') navigate(ctx.closeTo, { replace: true });
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [navigate, ctx.closeTo]);

    const name =
        state.status === 'ready' ? ctx.nameOf(studentId, state.work.student.name) : ctx.hideNames ? 'This student' : '';
    const title = state.status === 'ready' ? state.work.activity.title : '';

    return (
        <aside className="cp-panel" aria-labelledby="cp-panel-h">
            <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                    <h2 id="cp-panel-h" ref={headingRef} tabIndex={-1} className="text-lg font-semibold text-ink outline-none">
                        {name || 'Answers'}
                    </h2>
                    {title && <p className="text-sm text-muted">{title}</p>}
                </div>
                {/* replace: browser Back after Close must not re-open the panel. */}
                <Link
                    to={ctx.closeTo}
                    replace
                    className="min-h-[44px] rounded-md border border-line-strong bg-canvas px-4 py-2.5 text-sm font-medium text-strong hover:bg-surface"
                >
                    Close
                </Link>
            </div>
            {state.status === 'loading' && (
                <p role="status" className="text-sm text-muted">
                    Loading…
                </p>
            )}
            {state.status === 'error' && (
                <p role="alert" className="text-sm text-ink">
                    Couldn't load these answers. The student may have left the class, or the activity is no longer
                    assigned. Close this and press Refresh.
                </p>
            )}
            {state.status === 'ready' && <Answers ready={state} studentId={studentId} activityId={activityId} />}
        </aside>
    );
}

function Answers({ ready, studentId, activityId }: { ready: Ready; studentId: string; activityId: string }) {
    const { work, docs, descriptions } = ready;
    // FT-8: per section, which attempt is on screen. Latest by default.
    const [firstShown, setFirstShown] = useState<ReadonlySet<string>>(() => new Set());
    if (work.versions.length === 0) {
        return <p className="text-sm text-muted">No checked work on this activity yet.</p>;
    }
    const here = typeof window !== 'undefined' ? window.location.pathname : '';
    let toGrade = 0;
    return (
        <div>
            <p className="mb-2 text-sm text-muted">
                Showing each section's latest attempt. Where there were several, you can switch a section to its
                first try.
            </p>
            {work.versions.map((v) => {
                const served = docs.get(v.version_id) ?? null;
                return (
                    <section key={v.version_id} className="mb-4">
                        {!v.is_current && (
                            <p className="mb-1 text-sm font-medium text-muted">
                                Older version (version {v.version_num}) — the activity has been republished since.
                            </p>
                        )}
                        {served === null && (
                            <p className="text-sm text-ink">This version's content could not be read, so the answers can't be shown as words.</p>
                        )}
                        {served !== null &&
                            orderSections(served, v.sections).map((s) => {
                                const key = `${v.version_id}:${s.section_id}`;
                                const canSwitch = Boolean(s.first) && s.attempts > 1;
                                const showFirst = canSwitch && firstShown.has(key);
                                const shown = showFirst && s.first ? s.first : s;
                                // D65: each DoL attempt against its own form.
                                const formDoc = (attempt: number) =>
                                    s.section_id === dolSectionId(served) && attempt >= 2
                                        ? (docs.get(dolForm2Key(v.version_id)) ?? served)
                                        : served;
                                const latestDoc = formDoc(s.attempts);
                                const shownDoc = formDoc(showFirst ? 1 : s.attempts);
                                const handGradedLine = (itemId: string) => {
                                    const block = served.index.byItem[itemId]?.block;
                                    return block?.type === 'short_answer' || block?.type === 'essay';
                                };
                                // "N to grade" is always the LATEST attempt's, whatever is on screen.
                                // A blank or omitted essay has NO verdict (the grader writes none),
                                // yet Responses queues it and the grid counts it: so does this.
                                for (const line of sectionAnswerLines(latestDoc, s.section_id, s.responses, s.verdicts)) {
                                    if (handGradedLine(line.itemId) && !s.graded_block_ids.includes(line.itemId)) toGrade += 1;
                                }
                                const lines = sectionAnswerLines(shownDoc, s.section_id, shown.responses, shown.verdicts);
                                const rows = lines.map((line) => {
                                    // Grades belong to the LATEST attempt: on a first try, no badge.
                                    const handGraded = !showFirst && handGradedLine(line.itemId);
                                    const graded = handGraded && s.graded_block_ids.includes(line.itemId);
                                    return { line, handGraded, graded };
                                });
                                return (
                                    <div key={s.section_id} className="mb-3">
                                        <h3 className="mt-3 text-sm font-semibold text-ink">
                                            {served.index.sectionTitles[s.section_id] ?? 'A section no longer in this version'}
                                            <span className="ml-2 font-normal text-muted">
                                                {s.attempts === 1 ? '1 attempt' : `${s.attempts} attempts`}
                                            </span>
                                        </h3>
                                        {canSwitch && (
                                            <div role="group" aria-label={`Which attempt: ${served.index.sectionTitles[s.section_id] ?? 'section'}`} className="my-1 inline-flex overflow-hidden rounded-md border border-line-strong text-xs">
                                                {(['first', 'latest'] as const).map((which) => {
                                                    const on = (which === 'first') === showFirst;
                                                    return (
                                                        <button
                                                            key={which}
                                                            type="button"
                                                            aria-pressed={on}
                                                            className={`min-h-[32px] px-3 ${on ? 'bg-surface font-semibold text-ink' : 'bg-canvas text-muted hover:text-ink'}`}
                                                            onClick={() =>
                                                                setFirstShown((prev) => {
                                                                    const next = new Set(prev);
                                                                    if (which === 'first') next.add(key);
                                                                    else next.delete(key);
                                                                    return next;
                                                                })
                                                            }
                                                        >
                                                            {which === 'first' ? 'First try' : 'Latest'}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        {rows.length === 0 ? (
                                            <p className="text-sm text-muted">Nothing to answer in this section.</p>
                                        ) : (
                                            <ul>
                                                {rows.map(({ line, handGraded, graded }) => (
                                                    <AnswerRow
                                                        key={line.itemId}
                                                        line={line}
                                                        handGraded={handGraded}
                                                        graded={graded}
                                                        describe={(id) => descriptions.get(id) ?? null}
                                                    />
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                );
                            })}
                    </section>
                );
            })}
            {toGrade > 0 && (
                <Link
                    to={responsesHref(activityId, here)}
                    className="cp-chip"
                    data-student={studentId}
                >
                    {toGrade} to grade in {work.activity.title}
                </Link>
            )}
        </div>
    );
}

/** Sections in the document's order; any the document lacks, last. */
function orderSections<T extends { section_id: string }>(served: ServedDoc, sections: T[]): T[] {
    const order = Object.keys(served.index.bySection);
    const pos = (id: string) => {
        const i = order.indexOf(id);
        return i === -1 ? Number.MAX_SAFE_INTEGER : i;
    };
    return [...sections].sort((a, b) => pos(a.section_id) - pos(b.section_id));
}

function verdictWords(line: AnswerLine, handGraded: boolean, graded: boolean): { glyph: string; word: string } {
    if (line.verdict === 'correct') return { glyph: '✓', word: 'Right' };
    if (line.verdict === 'incorrect') return { glyph: '✗', word: 'Wrong' };
    if (handGraded) return graded ? { glyph: '●', word: 'Graded' } : { glyph: '○', word: 'To grade' };
    if (line.verdict === 'recorded') return { glyph: '·', word: 'Recorded' };
    return { glyph: '·', word: 'Not marked' };
}

function AnswerRow({
    line,
    handGraded,
    graded,
    describe,
}: {
    line: AnswerLine;
    handGraded: boolean;
    graded: boolean;
    describe: (id: string) => string | null;
}) {
    const v = verdictWords(line, handGraded, graded);
    return (
        <li className="cp-answer text-sm">
            <div className="flex items-baseline gap-3">
                <span className="w-24 shrink-0 font-medium text-ink">{line.label}</span>
                <span className="min-w-0 flex-1 break-words text-ink">{line.answer}</span>
                <span className="shrink-0 whitespace-nowrap text-ink">
                    <span aria-hidden="true">{v.glyph}</span> {v.word}
                </span>
            </div>
            {(line.feedback || line.misconceptionIds.length > 0) && (
                <p className="mt-1 pl-[6.75rem] text-muted">
                    {line.feedback}
                    {line.feedback && line.misconceptionIds.length > 0 ? ' · ' : ''}
                    {line.misconceptionIds.map((id) => describe(id) ?? `Unknown misconception (${id})`).join('; ')}
                </p>
            )}
            {line.verdict === 'incorrect' && line.correctAnswer && (
                <p className="mt-1 pl-[6.75rem] text-muted">Answer: {line.correctAnswer}</p>
            )}
        </li>
    );
}

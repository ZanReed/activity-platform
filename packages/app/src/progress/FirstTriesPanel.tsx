// =============================================================================
// FirstTriesPanel.tsx — what students answered before any feedback (0062)
// -----------------------------------------------------------------------------
// docs/design/first-try-view.md, FT-1..FT-8. On the activity page, above the
// common wrong answers. One closed disclosure per question, lowest first-try
// rate first, the first 3 open (FT-7):
//   "Q4 · 12 of 20 right first time · 6 of the 8 wrong are right now"
// Multiple choice opens to EVERY choice in authored order (A, B, C as the key
// prints it), zeros included, the correct one marked, and under each picked
// distractor the feedback its author wrote and its misconception — what those
// students were told — and how many of them are right now (FT-3..FT-5). Other
// questions open to the top 5 first-try wrong answers (FT-6). Each line can
// list its students (Hide names applies), linking to their answers (FT-8).
// =============================================================================

import { useState } from 'react';
import { Link } from 'react-router';
import { answerWords, inlineText, questionLabel, type AnswerFamily, type ServedDoc } from '../lib/answerText';
import type { FirstTries, FirstTryGroup, FirstTryItem } from '../lib/classProgress';

export const FIRST_TRIES_OPEN = 3;

interface Choice {
    id: string;
    content?: unknown;
    correct?: boolean;
    feedback?: unknown;
    misconceptionId?: string;
    image?: { alt?: string };
}

const rate = (it: FirstTryItem) => (it.first > 0 ? it.right_first / it.first : 1);

export function headline(it: FirstTryItem): string {
    const right = `${it.right_first} of ${it.first} right first time`;
    if (it.wrong_first === 0) return right;
    return `${right} · ${it.wrong_right_now} of the ${it.wrong_first} wrong ${it.wrong_right_now === 1 ? 'is' : 'are'} right now`;
}

export default function FirstTriesPanel({
    data,
    served,
    describe,
    nameOf,
    studentHref,
}: {
    data: FirstTries;
    /** The current version's document (unseeded); null when unreadable. */
    served: ServedDoc | null;
    describe: (misconceptionId: string) => string;
    nameOf: (studentId: string, name: string) => string;
    studentHref: (studentId: string) => string;
}) {
    const items = [...data.items].sort((a, b) => rate(a) - rate(b) || b.wrong_first - a.wrong_first);
    const sectionStudents = new Map(data.sections.map((s) => [s.section_id, s.students]));
    const seeded = (served?.doc.meta.seedVars ?? []).length > 0;
    return (
        <section aria-labelledby="cp-first-h" className="mt-8">
            <h2 id="cp-first-h" className="mb-1 text-base font-semibold text-ink">
                First tries
            </h2>
            <p className="mb-3 text-sm text-muted">
                What students answered on their first check, before any feedback, and how many of those who were
                wrong are right now.
                {data.older_only > 0 &&
                    ` ${data.older_only} ${data.older_only === 1 ? 'student is' : 'students are'} only on an older version of this activity and not counted.`}
            </p>
            {seeded && (
                <p className="mb-3 text-sm text-muted">
                    This activity gives each student different numbers, so the same answer can be right for one student
                    and wrong for another.
                </p>
            )}
            {items.length === 0 ? (
                <p className="text-sm text-muted">No one has checked this activity's current version yet.</p>
            ) : (
                <ul className="divide-y divide-line rounded-lg border border-line bg-canvas px-4">
                    {items.map((it, i) => (
                        <FirstTryRow
                            key={`${it.section_id}:${it.item_id}`}
                            item={it}
                            served={served}
                            sectionStudents={sectionStudents.get(it.section_id) ?? it.first}
                            initiallyOpen={i < FIRST_TRIES_OPEN}
                            describe={describe}
                            nameOf={nameOf}
                            studentHref={studentHref}
                        />
                    ))}
                </ul>
            )}
        </section>
    );
}

function FirstTryRow({
    item,
    served,
    sectionStudents,
    initiallyOpen,
    describe,
    nameOf,
    studentHref,
}: {
    item: FirstTryItem;
    served: ServedDoc | null;
    sectionStudents: number;
    initiallyOpen: boolean;
    describe: (id: string) => string;
    nameOf: (sid: string, name: string) => string;
    studentHref: (sid: string) => string;
}) {
    const [open, setOpen] = useState(initiallyOpen);
    const place = served?.index.byItem[item.item_id] ?? null;
    const label = served && place ? questionLabel(served.index, place) : 'A question';
    const panelId = `cp-first-${item.item_id}`.replace(/[^a-zA-Z0-9_-]/g, '_');
    const block = place?.block as { type?: string; choices?: Choice[]; multiSelect?: boolean } | undefined;
    const isChoice = item.family === 'choices' && block?.type === 'multiple_choice' && Array.isArray(block.choices);
    return (
        <li className="py-2">
            <button
                type="button"
                className="cp-disclosure"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpen(!open)}
            >
                <span aria-hidden="true" className="text-muted">
                    {open ? '▾' : '▸'}
                </span>
                <span className="flex-1 text-sm">
                    <span className="font-medium text-ink">{label}</span>
                    <span className="text-muted"> · {headline(item)}</span>
                </span>
            </button>
            {open && (
                <div id={panelId} className="mb-2 ml-6 text-sm">
                    {isChoice ? (
                        <ChoiceSpread
                            item={item}
                            choices={block!.choices!}
                            multiSelect={Boolean(block!.multiSelect)}
                            noAnswer={Math.max(sectionStudents - item.picked, 0)}
                            describe={describe}
                            nameOf={nameOf}
                            studentHref={studentHref}
                        />
                    ) : (
                        <WrongFirst item={item} served={served} describe={describe} nameOf={nameOf} studentHref={studentHref} />
                    )}
                </div>
            )}
        </li>
    );
}

function ChoiceSpread({
    item,
    choices,
    multiSelect,
    noAnswer,
    describe,
    nameOf,
    studentHref,
}: {
    item: FirstTryItem;
    choices: Choice[];
    multiSelect: boolean;
    noAnswer: number;
    describe: (id: string) => string;
    nameOf: (sid: string, name: string) => string;
    studentHref: (sid: string) => string;
}) {
    const byChoice = new Map(item.groups.map((g) => [String(g.answer), g]));
    return (
        <>
            {multiSelect && <p className="mb-1 text-muted">Students could pick more than one.</p>}
            <ol className="space-y-2">
                {choices.map((c, i) => {
                    const g = byChoice.get(c.id);
                    const n = g?.count ?? 0;
                    const words = inlineText(c.content) || (c.image ? (c.image.alt ? `image: ${c.image.alt}` : 'an image') : 'a graph');
                    const feedback = inlineText(c.feedback);
                    return (
                        <li key={c.id}>
                            <div>
                                <span className="font-medium text-ink">{String.fromCharCode(65 + i)}.</span>{' '}
                                <span className="text-ink">{words}</span>
                                {c.correct && <span className="ml-2 text-success-strong">✓ correct</span>}
                                <span className="ml-2 tabular-nums text-muted">
                                    {n} {n === 1 ? 'student' : 'students'}
                                    {!c.correct && n > 0 ? ` · ${g!.right_now} right now` : ''}
                                </span>
                            </div>
                            {!c.correct && n > 0 && (feedback || c.misconceptionId) && (
                                <p className="text-muted">
                                    {feedback && <>They were told: “{feedback}”</>}
                                    {feedback && c.misconceptionId ? ' · ' : ''}
                                    {c.misconceptionId && describe(c.misconceptionId)}
                                </p>
                            )}
                            {g && <Who group={g} label={`Who picked ${String.fromCharCode(65 + i)}`} nameOf={nameOf} studentHref={studentHref} />}
                        </li>
                    );
                })}
                {noAnswer > 0 && (
                    <li className="text-muted">
                        No answer: {noAnswer} {noAnswer === 1 ? 'student' : 'students'}
                    </li>
                )}
            </ol>
        </>
    );
}

function WrongFirst({
    item,
    served,
    describe,
    nameOf,
    studentHref,
}: {
    item: FirstTryItem;
    served: ServedDoc | null;
    describe: (id: string) => string;
    nameOf: (sid: string, name: string) => string;
    studentHref: (sid: string) => string;
}) {
    const place = served?.index.byItem[item.item_id] ?? null;
    if (item.groups.length === 0) return <p className="text-muted">Everyone who answered was right first time.</p>;
    return (
        <ol className="space-y-2">
            {item.groups.map((g, i) => (
                <li key={i}>
                    <div>
                        <span className="text-ink">
                            {answerWords(place, (g.family as AnswerFamily | null) ?? place?.family ?? null, g.answer)}
                        </span>
                        <span className="ml-2 tabular-nums text-muted">
                            {g.count} {g.count === 1 ? 'student' : 'students'} · {g.right_now} right now
                        </span>
                    </div>
                    {g.misconception_ids.length > 0 && (
                        <p className="text-muted">{g.misconception_ids.map(describe).join('; ')}</p>
                    )}
                    <Who group={g} label={`Who answered ${answerWords(place, (g.family as AnswerFamily | null) ?? place?.family ?? null, g.answer)}`} nameOf={nameOf} studentHref={studentHref} />
                </li>
            ))}
        </ol>
    );
}

function Who({
    group,
    label,
    nameOf,
    studentHref,
}: {
    group: FirstTryGroup;
    label: string;
    nameOf: (sid: string, name: string) => string;
    studentHref: (sid: string) => string;
}) {
    const [open, setOpen] = useState(false);
    if (group.students.length === 0) return null;
    return (
        <div>
            <button
                type="button"
                className="text-sm text-strong underline underline-offset-2"
                aria-expanded={open}
                aria-label={label}
                onClick={() => setOpen(!open)}
            >
                {open ? 'Hide who' : 'Who'}
            </button>
            {open && (
                <ul className="ml-4 mt-1 space-y-0.5">
                    {group.students.map((s) => (
                        <li key={s.student_id}>
                            <Link to={studentHref(s.student_id)} className="text-strong underline underline-offset-2">
                                {nameOf(s.student_id, s.name)}
                            </Link>
                            <span className="ml-2 text-muted">{s.right_now ? 'right now' : 'not yet right'}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

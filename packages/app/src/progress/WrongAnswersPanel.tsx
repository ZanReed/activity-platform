// =============================================================================
// WrongAnswersPanel.tsx — common wrong answers on one activity (D7, DR-11)
// -----------------------------------------------------------------------------
// Only questions where 2 or more students are wrong on their latest attempt
// (the SQL applies the floor), most wrong first. Each is a closed disclosure
// "Q4 · 9 wrong · most common: 0.75 (6)" opening to its top 5; the first 3 open
// by default. Answers read as words through the same formatter as the answer
// panel, from the version's document WITHOUT a student seed (many students'
// answers are grouped here, so one student's numbers are nobody's).
// =============================================================================

import { useState } from 'react';
import { answerWords, questionLabel, type AnswerFamily, type ServedDoc } from '../lib/answerText';
import type { WrongAnswerItem } from '../lib/classProgress';

export const OPEN_BY_DEFAULT = 3;

export default function WrongAnswersPanel({
    items,
    docs,
    describe,
}: {
    items: WrongAnswerItem[];
    /** version id → its document (unseeded); missing = could not be read. */
    docs: ReadonlyMap<string, ServedDoc>;
    describe: (misconceptionId: string) => string;
}) {
    return (
        <section aria-labelledby="cp-wrong-h" className="mt-8">
            <h2 id="cp-wrong-h" className="mb-1 text-base font-semibold text-ink">
                Common wrong answers
            </h2>
            <p className="mb-3 text-sm text-muted">
                Questions two or more students got wrong on their latest attempt.
            </p>
            {items.length === 0 ? (
                <p className="text-sm text-muted">No question has two or more students wrong yet.</p>
            ) : (
                <ul className="divide-y divide-line rounded-lg border border-line bg-canvas px-4">
                    {items.map((item, i) => (
                        <WrongItem
                            key={`${item.version_id}:${item.section_id}:${item.item_id}`}
                            item={item}
                            served={docs.get(item.version_id) ?? null}
                            describe={describe}
                            initiallyOpen={i < OPEN_BY_DEFAULT}
                        />
                    ))}
                </ul>
            )}
        </section>
    );
}

function WrongItem({
    item,
    served,
    describe,
    initiallyOpen,
}: {
    item: WrongAnswerItem;
    served: ServedDoc | null;
    describe: (id: string) => string;
    initiallyOpen: boolean;
}) {
    const [open, setOpen] = useState(initiallyOpen);
    const place = served?.index.byItem[item.item_id] ?? null;
    const label = served && place ? questionLabel(served.index, place) : 'A question';
    const words = (a: WrongAnswerItem['answers'][number]) =>
        answerWords(place, (a.family as AnswerFamily | null) ?? place?.family ?? null, a.answer);
    const top = item.answers[0];
    const panelId = `cp-wrong-${item.version_id}-${item.item_id}`.replace(/[^a-zA-Z0-9_-]/g, '_');
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
                    <span className="text-muted">
                        {' '}
                        · {item.wrong} wrong
                        {top ? ` · most common: ${words(top)} (${top.count})` : ''}
                    </span>
                </span>
            </button>
            {open && (
                <ol id={panelId} className="mb-2 ml-6 space-y-1 text-sm">
                    {item.answers.map((a, i) => (
                        <li key={i}>
                            <span className="text-ink">{words(a)}</span>
                            <span className="ml-2 tabular-nums text-muted">
                                {a.count} {a.count === 1 ? 'student' : 'students'}
                            </span>
                            {a.misconception_ids.length > 0 && (
                                <span className="block text-muted">{a.misconception_ids.map(describe).join('; ')}</span>
                            )}
                        </li>
                    ))}
                </ol>
            )}
        </li>
    );
}

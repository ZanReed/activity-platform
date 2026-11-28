void import('../lib/clientErrors'); // the teacher-only error log, loaded beside the page (review C5 slice 4)
import { dayMonthYear } from '../lib/dates';
import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { leaveOut } from '../lib/loadFailure';
import { isDueThisWeek } from '../lib/dueDates';
import { Link } from 'react-router';
import { PRESENT_FROM_CLASSES } from '../lib/presentFrom';
import { policyChangedOn } from '../lib/policyDate';
import { TeacherNav } from '../components/TeacherNav';
import { listDeletedClasses, restoreClass, type DeletedItem } from '../lib/recentlyDeleted';
import { useSession } from '../lib/SessionContext';
import { CLASS_LIST_KEY, useClassList } from '../lib/classList';
import { reloadKey, updateLoaded } from '../lib/useLoad';
import LoadStatus from '../components/LoadStatus';
import ClassActivitiesPanel, {
    useTeacherClassActivities,
    type TeacherActivitiesData,
} from '../components/ClassActivitiesPanel';
import {
    AGE_STATEMENT_PROMPT,
    AGE_STATEMENTS,
    ASSERTION_TEXT_VERSION,
    createClass,
    formatDate,
    joinUrlFor,
    listClassMembers,
    regenerateJoinCode,
    renameClass,
    reconfirmClassAge,
    softDeleteClass,
    updateClassDomain,
    setClassHelp,
    type ClassInfo,
} from '../lib/classes';
import { countActiveStudents, joinInstructions } from '../lib/classTeacher';

// Teacher-side class management (S1, identity lane). The one non-negotiable
// piece of UX here is the AGE STATEMENT (ruling 3.1C; two choices since U-1,
// 2026-10-06): nothing is picked by default, a choice is required, and the
// exact wording is AGE_STATEMENTS — the class row records which, when, who
// and under which policy version. A card's "Change age confirmation" lets
// the class's teacher confirm the other one (U-2). Everything else is roster
// plumbing for the viewer arc (students join via code; codes are classroom-
// public and regenerable).

// formatDate and joinUrlFor live in lib/classes, shared with the lazy roster.

// The projector view of a code (lazy: a click loads it).
const JoinBoard = lazy(() => import('../components/JoinBoard'));

function JoinCode({ code, className }: { code: string; className: string }) {
    // TWO affordances, deliberately, because teachers distribute a class code
    // two different ways: they READ IT ALOUD (hence the large spaced monospace
    // chip, which copies the bare code) and they POST IT (hence Copy link,
    // which yields the /join/:code deep link B12 ruled and the B14 dialog's
    // "the old link no longer works" copy already presumes exists).
    const [copied, setCopied] = useState<'code' | 'link' | null>(null);
    const [board, setBoard] = useState(false);
    // The "Copied" flash's timer is cleared on unmount: left running, it set
    // state after the page had gone (CI, 2026-11-28: it fired after its test
    // file's window was torn down and failed the run).
    const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => () => {
        if (flashTimer.current) clearTimeout(flashTimer.current);
    }, []);
    const flash = (what: 'code' | 'link') => {
        setCopied(what);
        if (flashTimer.current) clearTimeout(flashTimer.current);
        flashTimer.current = setTimeout(() => setCopied(null), 1500);
    };
    const copyCode = async () => {
        try {
            await navigator.clipboard.writeText(code);
            flash('code');
        } catch {
            // Clipboard unavailable — the code is visible; nothing to do.
        }
    };
    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(joinUrlFor(code));
            flash('link');
        } catch {
            // Clipboard unavailable — nothing to fall back to; the code is
            // still readable and the link is derivable from it.
        }
    };
    return (
        <>
        <button
        type="button"
        onClick={copyCode}
        title="Copy join code"
        className="rounded-md border border-line bg-surface px-3 py-1 font-mono text-lg font-semibold tracking-[0.2em] text-ink transition hover:border-line-strong"
        >
        {copied === 'code' ? 'Copied' : code}
        </button>
        <button
        type="button"
        onClick={copyLink}
        title={`Copy the join link (${joinUrlFor(code)})`}
        className="text-sm font-medium text-muted underline underline-offset-2 transition hover:text-strong"
        >
        {copied === 'link' ? 'Link copied' : 'Copy link'}
        </button>
        <button
        type="button"
        onClick={() => setBoard(true)}
        aria-label={`Show on board: ${className}`}
        title="Show the code full screen, for the projector"
        className="text-sm font-medium text-muted underline underline-offset-2 transition hover:text-strong"
        >
        Show on board
        </button>
        {board && (
            <Suspense fallback={null}>
            <JoinBoard className={className} code={code} url={joinUrlFor(code)} instructions={joinInstructions(className, code, joinUrlFor(code))} onClose={() => setBoard(false)} />
            </Suspense>
        )}
        </>
    );
}

// The roster panel and its remove dialog load when Roster is first opened.
const Roster = lazy(() => import('../components/ClassRoster'));

/** The two age statements as a required choice with NOTHING picked by default
 *  (U-1): the teacher's own selection is the confirmation. Used by the
 *  create form and by a class card's "Change age confirmation". */
function AgeStatementChoice({
    name,
    value,
    onChange,
}: {
    name: string;
    value: boolean | null;
    onChange: (includesUnder13: boolean) => void;
}) {
    return (
        <fieldset className="m-0 border-0 p-0">
        <legend className="text-sm font-medium text-strong">{AGE_STATEMENT_PROMPT}</legend>
        {([false, true] as const).map((under13) => (
            <label key={String(under13)} className="mt-2 flex items-start gap-3">
            <input
            type="radio"
            name={name}
            checked={value === under13}
            onChange={() => onChange(under13)}
            className="mt-0.5 h-4 w-4 shrink-0 border-line"
            />
            <span className="text-sm text-strong">
            {under13 ? AGE_STATEMENTS.under13 : AGE_STATEMENTS.thirteenPlus}
            </span>
            </label>
        ))}
        </fieldset>
    );
}

// G-5/G-7's confirm, loaded on first use (perf-budgets: journey classes).
const ConfirmDialog = lazy(() => import('../components/ConfirmDialog'));
// Loaded only when something has been deleted (perf-budgets journeys).
const RecentlyDeleted = lazy(() => import('../components/RecentlyDeleted'));

const CLASS_CONFIRM_COPY = {
    codeTitle: (code: string) => `Replace code ${code}?`,
    codeBody: 'The old code and link stop working. Students already in the class stay in.',
    codeConfirm: 'Replace code',
    deleteTitle: (name: string) => `Delete ${name}?`,
    deleteBody: (students: number | null, activities: number) => {
        if (students === 0) return 'No students are in this class yet.';
        const who = students === null ? 'Its students lose' : `${students} student${students === 1 ? ' loses' : 's lose'}`;
        const what = activities > 0 ? `, along with its ${activities} activit${activities === 1 ? 'y' : 'ies'}` : '';
        return `${who} this class from their Home${what}. Their checked work is kept.`;
    },
    deleteConfirm: 'Delete class',
} as const;

/** G-5: names what goes before a class is deleted. The student count is read
 *  when the dialog opens; if that read fails the sentence goes on without it. */
function DeleteClassDialog({
    info,
    activityCount,
    onCancel,
    onConfirm,
}: {
    info: ClassInfo;
    activityCount: number;
    onCancel: () => void;
    onConfirm: () => Promise<void>;
}) {
    const [students, setStudents] = useState<number | null>(null);
    useEffect(() => {
        let live = true;
        listClassMembers(info.id).then(
            (m) => live && setStudents(m.filter((x) => x.removedAt === null).length),
            leaveOut('classMembers'), // the count is left off
        );
        return () => {
            live = false;
        };
    }, [info.id]);
    return (
        <Suspense fallback={null}>
        <ConfirmDialog
        title={CLASS_CONFIRM_COPY.deleteTitle(info.name)}
        confirmLabel={CLASS_CONFIRM_COPY.deleteConfirm}
        danger
        onCancel={onCancel}
        onConfirm={onConfirm}
        >
        <p>{CLASS_CONFIRM_COPY.deleteBody(students, activityCount)}</p>
        </ConfirmDialog>
        </Suspense>
    );
}

function ClassCard({
    info,
    activities,
    studentCount,
    onStudentCount,
    onCodeChange,
    onDomainChange,
    onHelpChange,
    onAgeChange,
    onRenamed,
    onDeleted,
    onError,
    moveTargets = [],
    onMembersMoved,
}: {
    info: ClassInfo;
    activities: TeacherActivitiesData;
    /** Current students; undefined when the count could not be read. */
    studentCount: number | undefined;
    onStudentCount: (id: string, n: number) => void;
    onCodeChange: (id: string, code: string) => void;
    onDomainChange: (id: string, domain: string | null) => void;
    /** S9 (ST-14): the "Students can ask you for help" switch. */
    onHelpChange: (id: string, on: boolean) => void;
    onAgeChange: (id: string, change: Pick<ClassInfo, 'includesUnder13' | 'ageAssertionAt' | 'assertionTextVersion'>) => void;
    onRenamed: (id: string, name: string) => void;
    onDeleted: (id: string) => void;
    onError: (msg: string) => void;
    /** The teacher's other classes, for the roster's "Move to…" (S5). */
    moveTargets?: ReadonlyArray<{ id: string; name: string }>;
    onMembersMoved?: () => void;
}) {
    const [showRoster, setShowRoster] = useState(false);
    // "Roster (24)": how many students are in, at a glance, like Activities (N).
    const rosterLabel = studentCount === undefined ? 'Roster' : `Roster (${studentCount})`;
    // E-1 (ui-review-group-e.md): rename in place. Enter saves, Escape
    // cancels; an empty name is refused before it is sent.
    const [nameDraft, setNameDraft] = useState<string | null>(null);
    const [savingName, setSavingName] = useState(false);
    const saveName = async () => {
        if (nameDraft === null) return;
        if (nameDraft.trim() === info.name) {
            setNameDraft(null);
            return;
        }
        setSavingName(true);
        try {
            onRenamed(info.id, await renameClass(info.id, nameDraft));
            setNameDraft(null);
        } catch (err) {
            onError(err instanceof Error ? err.message : 'Could not rename the class.');
        } finally {
            setSavingName(false);
        }
    };
    // The "On students' Home" disclosure (board 3a). The count is COMMITTED
    // rows only (DR-3) — it derives from the shared page-level data, which
    // every mutation refetches, so it can never drift from the server.
    const [showActivities, setShowActivities] = useState(false);
    const activityCount = activities.rows.filter(
        (r) => r.classId === info.id,
    ).length;
    // DD-4 (docs/design/due-dates.md): the v1 "due this week" view — a count
    // of this class's activities due in the next 7 days, linking to progress.
    const dueThisWeek = activities.rows.filter(
        (r) => r.classId === info.id && r.published && isDueThisWeek(r.dueOn, activities.today),
    ).length;
    // Domain edit (T4/D-4): a typo'd domain bricks joining, so it is
    // editable in place — through the audited RPC, since widening/clearing
    // the pin loosens the admission boundary.
    const [editingDomain, setEditingDomain] = useState(false);
    const [domainDraft, setDomainDraft] = useState('');
    const [savingDomain, setSavingDomain] = useState(false);

    const saveDomain = async () => {
        setSavingDomain(true);
        try {
            const applied = await updateClassDomain(info.id, domainDraft);
            onDomainChange(info.id, applied);
            setEditingDomain(false);
        } catch (err) {
            onError(err instanceof Error ? err.message : 'Could not update domain.');
        } finally {
            setSavingDomain(false);
        }
    };
    // S9 (ST-14): whether students in this class can ask for help. One
    // click, audited server-side; open requests still lapse when it goes off.
    const [savingHelp, setSavingHelp] = useState(false);
    const toggleHelp = async () => {
        setSavingHelp(true);
        try {
            onHelpChange(info.id, await setClassHelp(info.id, !info.helpRequestsOn));
        } catch (err) {
            onError(err instanceof Error ? err.message : 'Could not change the setting.');
        } finally {
            setSavingHelp(false);
        }
    };
    // The age statement (U-2): the teacher can confirm the other one. Nothing
    // is pre-picked: a confirmation is a choice the teacher makes each time.
    const [editingAge, setEditingAge] = useState(false);
    const [ageDraft, setAgeDraft] = useState<boolean | null>(null);
    const [savingAge, setSavingAge] = useState(false);
    const saveAge = async () => {
        if (ageDraft === null) return;
        setSavingAge(true);
        try {
            onAgeChange(info.id, await reconfirmClassAge(info.id, ageDraft));
            setEditingAge(false);
            setAgeDraft(null);
        } catch (err) {
            onError(err instanceof Error ? err.message : 'Could not save the age confirmation.');
        } finally {
            setSavingAge(false);
        }
    };
    // G-5/G-7 (ui-review-group-a.md): deleting a class and replacing its join
    // code both ask first, and say what they cost.
    const [confirming, setConfirming] = useState<'delete' | 'code' | null>(null);

    const handleDelete = async () => {
        await softDeleteClass(info.id);
        setConfirming(null);
        onDeleted(info.id);
    };

    return (
        <li className="rounded-lg border border-line bg-canvas p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
        {nameDraft === null ? (
            <span className="flex min-w-0 items-baseline gap-2">
            <span className="block truncate font-medium text-ink">{info.name}</span>
            <button
            type="button"
            onClick={() => setNameDraft(info.name)}
            aria-label={`Rename: ${info.name}`}
            className="shrink-0 text-xs font-medium text-muted underline underline-offset-2 transition hover:text-strong"
            >
            Rename
            </button>
            </span>
        ) : (
            <form
            className="flex flex-wrap items-center gap-2"
            onSubmit={(e) => {
                e.preventDefault();
                void saveName();
            }}
            >
            <input
            autoFocus
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Escape') setNameDraft(null);
            }}
            aria-label="Class name"
            maxLength={120}
            className="min-w-0 rounded-md border border-line-strong bg-canvas px-2 py-1 text-sm text-ink"
            />
            <button
            type="submit"
            disabled={savingName || nameDraft.trim() === ''}
            className="rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-60"
            >
            {savingName ? 'Saving…' : 'Save'}
            </button>
            <button
            type="button"
            onClick={() => setNameDraft(null)}
            className="text-xs font-medium text-muted underline underline-offset-2"
            >
            Cancel
            </button>
            </form>
        )}
        <span className="block text-xs text-muted">
        Created {formatDate(info.createdAt)}
        {info.expectedDomain && <> · limited to @{info.expectedDomain}</>}
        {' · '}
        <span data-testid="class-age-statement">
        {info.includesUnder13
            ? 'Includes students under 13, school authorized'
            : 'All students 13 or older'}
        {' · '}confirmed {formatDate(info.ageAssertionAt)}
        </span>
        {' · '}
        <button
        type="button"
        onClick={() => {
            setAgeDraft(null);
            setEditingAge((s) => !s);
        }}
        aria-label={`Change age confirmation: ${info.name}`}
        className="underline underline-offset-2 transition hover:text-strong"
        >
        Change age confirmation
        </button>
        {' · '}
        <button
        type="button"
        onClick={() => {
            setDomainDraft(info.expectedDomain ?? '');
            setEditingDomain((s) => !s);
        }}
        aria-label={`${info.expectedDomain ? 'Edit domain' : 'Set domain'}: ${info.name}`}
        className="underline underline-offset-2 transition hover:text-strong"
        >
        {info.expectedDomain ? 'Edit domain' : 'Set domain'}
        </button>
        {' · '}
        <span data-testid="class-help-setting">
        {info.helpRequestsOn ? 'Students can ask you for help' : 'Students can’t ask for help'}
        </span>{' '}
        <button
        type="button"
        onClick={() => void toggleHelp()}
        disabled={savingHelp}
        aria-label={`${info.helpRequestsOn ? 'Turn off asking for help' : 'Turn on asking for help'}: ${info.name}`}
        className="underline underline-offset-2 transition hover:text-strong disabled:opacity-50"
        >
        {info.helpRequestsOn ? 'Turn off' : 'Turn on'}
        </button>
        </span>
        {/* The policy's "Changes" section promises teachers hear of a change
            first (TODOS → "Tell teachers when the privacy policy changes",
            author 2026-11-20: notice only). A class confirmed against an older
            version shows this line until its teacher confirms again; it never
            blocks the class. It stays on screen while the form is open, so its
            button keeps keyboard focus (Fable review) and the form follows it. */}
        {info.assertionTextVersion !== ASSERTION_TEXT_VERSION && (
            <p
            className="mt-2 rounded-md border border-warning-border bg-warning-bg px-3 py-2 text-xs text-warning-strong"
            data-policy-notice
            >
            The privacy policy changed on{' '}
            {dayMonthYear(policyChangedOn())}.{' '}
            <Link
            to="/privacy"
            target="_blank"
            rel="noopener"
            aria-label="Review the privacy policy (opens in a new tab)"
            className="font-medium underline underline-offset-2"
            >
            Review it
            </Link>
            , then{' '}
            <button
            type="button"
            onClick={() => {
                setAgeDraft(null);
                setEditingAge(true);
            }}
            aria-label={`Confirm the age statement again: ${info.name}`}
            className="font-medium underline underline-offset-2"
            >
            confirm the age statement again
            </button>
            .
            </p>
        )}
        {editingAge && (
            <form
            className="mt-2 rounded-md border border-line bg-surface p-3"
            onSubmit={(e) => {
                e.preventDefault();
                void saveAge();
            }}
            >
            <AgeStatementChoice
            name={`age-${info.id}`}
            value={ageDraft}
            onChange={setAgeDraft}
            />
            <div className="mt-2 flex items-center gap-3">
            <button
            type="submit"
            disabled={savingAge || ageDraft === null}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-50"
            >
            {savingAge ? 'Saving…' : 'Confirm'}
            </button>
            <button
            type="button"
            onClick={() => setEditingAge(false)}
            className="text-sm text-muted underline underline-offset-2"
            >
            Cancel
            </button>
            </div>
            </form>
        )}
        {editingDomain && (
            <form
            className="mt-2 flex items-center gap-2"
            onSubmit={(e) => {
                e.preventDefault();
                void saveDomain();
            }}
            >
            <input
            value={domainDraft}
            onChange={(e) => setDomainDraft(e.target.value)}
            placeholder="students.district.org (empty = no limit)"
            aria-label="School domain"
            className="w-64 rounded-md border border-line bg-surface px-2 py-1 text-xs text-ink placeholder:text-faint focus:border-line-strong focus:outline-none"
            />
            <button
            type="submit"
            disabled={savingDomain}
            className="text-xs font-medium text-muted underline underline-offset-2 transition hover:text-strong disabled:opacity-50"
            >
            {savingDomain ? 'Saving…' : 'Save'}
            </button>
            </form>
        )}
        </div>
        <span className="flex min-w-0 flex-wrap items-center gap-3">
        <JoinCode code={info.joinCode} className={info.name} />
        <button
        type="button"
        onClick={() => setConfirming('code')}
        aria-label={`New code: ${info.name}`}
        title="Replace this code with a new one"
        className="text-sm font-medium text-muted underline underline-offset-2 transition hover:text-strong"
        >
        New code
        </button>
        <button
        type="button"
        onClick={() => setShowRoster((s) => !s)}
        aria-label={`${showRoster ? 'Hide roster' : rosterLabel}: ${info.name}`}
        className="text-sm font-medium text-muted underline underline-offset-2 transition hover:text-strong"
        data-student-count={studentCount}
        >
        {showRoster ? 'Hide roster' : rosterLabel}
        </button>
        <button
        type="button"
        onClick={() => setShowActivities((s) => !s)}
        aria-label={`Activities (${activityCount}): ${info.name}`}
        aria-expanded={showActivities}
        className={`rounded-md border px-2.5 py-1 text-sm font-medium transition ${
            showActivities
                ? 'border-line-strong bg-surface text-ink'
                : 'border-line-strong bg-canvas text-ink hover:bg-surface'
        }`}
        >
        Activities ({activityCount})
        </button>
        {dueThisWeek > 0 && (
            <Link
            to={`/classes/${info.id}/progress`}
            aria-label={`${dueThisWeek} due this week: ${info.name}`}
            className="text-sm font-medium text-muted underline underline-offset-2 transition hover:text-strong"
            data-due-this-week
            >
            {dueThisWeek} due this week
            </Link>
        )}
        {/* The class's practice page (number-facts snapshot, daily facts,
            mixed practice) is its own lazy page (D43 slice 1, DR-17 / S-4;
            mixed practice S4-2): a snapshot's live view goes on a projector. */}
        {/* Each student's checked work on what this class was set (0061,
            class-progress-view.md CP-1): beside Practice. */}
        <Link
        to={`/classes/${info.id}/progress`}
        aria-label={`Progress: ${info.name}`}
        className="text-sm font-medium text-muted underline underline-offset-2 transition hover:text-strong"
        >
        Progress
        </Link>
        <Link
        to={`/classes/${info.id}/tracker`}
        aria-label={`Unit tracker: ${info.name}`}
        className="text-sm font-medium text-muted underline underline-offset-2 transition hover:text-strong"
        >
        Unit tracker
        </Link>
        {/* D-6: every card control is named "<visible words>: <class>",
            so a list of cards is not a column of identical names.
            PP-9: the projector view, as its own button on the card (author
            2026-11-14: a link under the Today day card did not say what it was
            for). Back from it returns here. */}
        <Link
        to={`/classes/${info.id}/present`}
        state={{ from: PRESENT_FROM_CLASSES }}
        aria-label={`Present today: ${info.name}`}
        title="Show today's period on the projector"
        className="rounded-md border border-line-strong bg-canvas px-2.5 py-1 text-sm font-medium text-ink transition hover:bg-surface"
        data-present-today
        >
        Present today
        </Link>
        {/* C-8: Today lives on this page; "Practice" alone hid it. */}
        <Link
        to={`/classes/${info.id}/facts`}
        aria-label={`Today & practice: ${info.name}`}
        className="text-sm font-medium text-muted underline underline-offset-2 transition hover:text-strong"
        >
        Today &amp; practice
        </Link>
        <Link
        to={`/classes/${info.id}/plan`}
        aria-label={`Plan ahead: ${info.name}`}
        className="text-sm font-medium text-muted underline underline-offset-2 transition hover:text-strong"
        >
        Plan ahead
        </Link>
        <button
        type="button"
        onClick={() => setConfirming('delete')}
        aria-label={`Delete: ${info.name}`}
        className="text-sm font-medium text-muted underline underline-offset-2 transition hover:text-danger"
        >
        Delete
        </button>
        </span>
        </div>
        {confirming === 'code' && (
            <Suspense fallback={null}>
            <ConfirmDialog
            title={CLASS_CONFIRM_COPY.codeTitle(info.joinCode)}
            confirmLabel={CLASS_CONFIRM_COPY.codeConfirm}
            onCancel={() => setConfirming(null)}
            onConfirm={async () => {
                // Errors show in the dialog, which stays open (not via onError).
                onCodeChange(info.id, await regenerateJoinCode(info.id));
                setConfirming(null);
            }}
            >
            <p>{CLASS_CONFIRM_COPY.codeBody}</p>
            </ConfirmDialog>
            </Suspense>
        )}
        {confirming === 'delete' && (
            <DeleteClassDialog
            info={info}
            activityCount={activityCount}
            onCancel={() => setConfirming(null)}
            onConfirm={handleDelete}
            />
        )}
        {showRoster && (
            <Suspense fallback={<p className="mt-2 text-sm text-muted">Loading roster…</p>}>
            <Roster
            info={info}
            onCodeChange={onCodeChange}
            onCount={(n) => onStudentCount(info.id, n)}
            moveTargets={moveTargets}
            {...(onMembersMoved ? { onMoved: onMembersMoved } : {})}
            />
            </Suspense>
        )}
        {showActivities && (
            <ClassActivitiesPanel classId={info.id} data={activities} />
        )}
        </li>
    );
}

const TimezoneControl = lazy(() => import('../components/TimezoneControl'));
const PhotoStorageLine = lazy(() => import('../components/PhotoStorageLine'));

export default function Classes() {
    const { session, role } = useSession();

    // The shared class list (lib/classList.ts, review C5 slice 2): remembered
    // for the visit, re-read on a tab return, and every edit below writes into
    // the one copy, so Present, Plan, Hooks and Practice show it too.
    const classList = useClassList(role !== 'student');
    const classes = classList.data ?? [];
    const setClasses = (change: (prev: ClassInfo[]) => ClassInfo[]) => {
        if (classList.data) updateLoaded(CLASS_LIST_KEY, change);
        else reloadKey(CLASS_LIST_KEY); // no copy to edit yet: read the server's
    };
    // Each card's "Roster (N)". A failed read just leaves the numbers off.
    const [studentCounts, setStudentCounts] = useState<ReadonlyMap<string, number>>(new Map());
    const refreshCounts = () => {
        countActiveStudents().then(setStudentCounts, leaveOut('studentCounts'));
    };
    useEffect(refreshCounts, []);
    const setCount = (id: string, n: number) =>
        setStudentCounts((prev) => (prev.get(id) === n ? prev : new Map(prev).set(id, n)));
    const [actionError, setActionError] = useState<string | null>(null);
    // ONE fetch pair for every card's "On students' Home" section (rows +
    // picker options); mutations inside any panel refetch it (DR-3).
    const classActivities = useTeacherClassActivities();

    // Create form state. The assertion checkbox intentionally has NO
    // remembered default — it resets per class (each class is its own
    // assertion record).
    const [showCreate, setShowCreate] = useState(false);
    const [name, setName] = useState('');
    const [domain, setDomain] = useState('');
    const [ageChoice, setAgeChoice] = useState<boolean | null>(null);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    // G-5: what was deleted (restorable), and the undo toast after a delete.
    const [deleted, setDeleted] = useState<DeletedItem[]>([]);
    const [undo, setUndo] = useState<{ id: string; name: string } | null>(null);
    const refreshDeleted = () => {
        // A failed read (or 0086 not applied yet) just hides the section.
        listDeletedClasses().then(setDeleted, () => setDeleted([]));
    };
    useEffect(refreshDeleted, []);
    useEffect(() => {
        if (!undo) return;
        const t = setTimeout(() => setUndo(null), 7000);
        return () => clearTimeout(t);
    }, [undo]);
    const restore = async (id: string) => {
        await restoreClass(id);
        // A class deleted before this page loaded had no activity rows (the
        // policy hides a deleted class's), so re-read them with the class.
        reloadKey(CLASS_LIST_KEY);
        await classActivities.reload();
        refreshCounts();
        setUndo((u) => (u?.id === id ? null : u));
        refreshDeleted();
    };


    if (!session) return null;

    // A student who reaches /classes (a shared link, a typed URL) used to see
    // their class's card WITH the teacher controls on it. Nothing leaked (the
    // server refuses every action), but the page looked broken. They get the
    // same screen Present today gives them, and a way back to their own home,
    // which lists their classes (TODOS, filed 2026-11-14; fixed 2026-11-19).
    if (role === 'student') {
        return (
            <main className="min-h-screen bg-surface p-8">
            <div className="mx-auto max-w-2xl" data-testid="classes-students-screen">
            <h1 className="text-3xl font-bold text-ink">Classes</h1>
            <p className="mt-4 text-lg text-muted">This page is for teachers.</p>
            <p className="mt-2 text-sm">
            <Link to="/" className="font-medium text-ink underline underline-offset-2">
            Go to your home page
            </Link>
            </p>
            </div>
            </main>
        );
    }

    const handleCreate = async () => {
        setCreating(true);
        setCreateError(null);
        try {
            // create_class RPC (0027, E-2): teacher identity comes from
            // auth.uid() server-side — the audited door needs no client id.
            const info = await createClass({
                name,
                expectedDomain: domain,
                includesUnder13: ageChoice,
            });
            setClasses((prev) => [info, ...prev]);
            setCount(info.id, 0);
            setShowCreate(false);
            setName('');
            setDomain('');
            setAgeChoice(null);
        } catch (err) {
            setCreateError(
                err instanceof Error ? err.message : 'Could not create class.',
            );
        } finally {
            setCreating(false);
        }
    };

    return (
        <main className="min-h-screen bg-surface p-8">
        <div className="mx-auto max-w-2xl">
        <TeacherNav />
        <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-ink">My classes</h1>
        <button
        type="button"
        onClick={() => setShowCreate((s) => !s)}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
        {showCreate ? 'Cancel' : 'New class'}
        </button>
        </div>
        {/* PP-11: the teacher's day zone, once for all their classes.
            Teachers only (a student can reach /classes; set_my_timezone
            refuses them). Lazy: the classes journey's budget is for the list. */}
        {role === 'teacher' && (
            <div className="mt-2">
            <Suspense fallback={null}>
            <TimezoneControl />
            </Suspense>
            {/* MS-13: the teacher's own photo storage (0098). Its own
                boundary, so a failed chunk never takes the zone control. */}
            <Suspense fallback={null}>
            <PhotoStorageLine />
            </Suspense>
            </div>
        )}

        {showCreate && (
            <form
            className="mt-6 space-y-4 rounded-lg border border-line bg-canvas p-6 shadow-sm"
            onSubmit={(e) => {
                e.preventDefault();
                void handleCreate();
            }}
            >
            <div>
            <label
            htmlFor="class-name"
            className="block text-sm font-medium text-strong"
            >
            Class name
            </label>
            <input
            id="class-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Algebra I — Period 2"
            className="mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-faint focus:border-line-strong focus:outline-none"
            />
            </div>
            <div>
            <label
            htmlFor="class-domain"
            className="block text-sm font-medium text-strong"
            >
            Limit to school domain{' '}
            <span className="font-normal text-muted">(optional)</span>
            </label>
            <input
            id="class-domain"
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="students.district.org"
            className="mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-faint focus:border-line-strong focus:outline-none"
            />
            <p className="mt-1 text-xs text-muted">
            When set, only accounts on this domain can join — protection if the
            code leaks beyond your classroom.
            </p>
            </div>
            <AgeStatementChoice name="new-class-age" value={ageChoice} onChange={setAgeChoice} />
            <div className="flex items-center gap-3">
            <button
            type="submit"
            disabled={creating || ageChoice === null || name.trim().length === 0}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-50"
            >
            {creating ? 'Creating…' : 'Create class'}
            </button>
            {ageChoice === null && (
                <span className="text-xs text-muted">
                The age confirmation is required.
                </span>
            )}
            </div>
            {createError && (
                <p className="text-sm text-danger">{createError}</p>
            )}
            </form>
        )}

        <div className="mt-6">
        {!classList.data ? (
            <LoadStatus state={classList} what="your classes" />
        ) : classes.length === 0 && !showCreate ? (
            <p className="text-muted">
            No classes yet. Create one to get a join code your students can
            use to join.
            </p>
        ) : (
            <ul className="space-y-2">
            {classes.map((c) => (
                <ClassCard
                key={c.id}
                info={c}
                activities={classActivities}
                studentCount={studentCounts.get(c.id)}
                onStudentCount={setCount}
                moveTargets={classes.filter((x) => x.id !== c.id).map((x) => ({ id: x.id, name: x.name }))}
                onMembersMoved={() => {
                    countActiveStudents().then(setStudentCounts, leaveOut('studentCounts'));
                }}
                onCodeChange={(id, code) =>
                    setClasses((prev) =>
                        prev.map((x) => (x.id === id ? { ...x, joinCode: code } : x)),
                    )
                }
                onAgeChange={(id, change) =>
                    setClasses((prev) => prev.map((x) => (x.id === id ? { ...x, ...change } : x)))
                }
                onHelpChange={(id, helpRequestsOn) =>
                    setClasses((prev) => prev.map((x) => (x.id === id ? { ...x, helpRequestsOn } : x)))
                }
                onDomainChange={(id, expectedDomain) =>
                    setClasses((prev) =>
                        prev.map((x) => (x.id === id ? { ...x, expectedDomain } : x)),
                    )
                }
                onRenamed={(id, name) =>
                    setClasses((prev) => prev.map((x) => (x.id === id ? { ...x, name } : x)))
                }
                onDeleted={(id) => {
                    setClasses((prev) => prev.filter((x) => x.id !== id));
                    setUndo({ id, name: c.name });
                    refreshDeleted();
                }}
                onError={setActionError}
                />
            ))}
            </ul>
        )}
        {actionError && (
            <p className="mt-3 text-sm text-danger">{actionError}</p>
        )}
        {deleted.length > 0 && (
            <Suspense fallback={null}>
            <RecentlyDeleted items={deleted} onRestore={restore} noun="class" />
            </Suspense>
        )}
        </div>
        </div>
        {undo && (
            <div
            role="status"
            className="fixed bottom-4 left-4 z-50 flex items-center gap-3 rounded-lg bg-primary px-4 py-2.5 text-sm text-white shadow-lg"
            >
            <span className="max-w-[16rem] truncate">
            Deleted <span className="font-medium">{undo.name}</span>
            </span>
            <button
            type="button"
            onClick={() => {
                const id = undo.id;
                setUndo(null);
                restore(id).catch((err: unknown) =>
                    setActionError(`Couldn't restore the class: ${err instanceof Error ? err.message : String(err)}`),
                );
            }}
            className="font-medium text-blue-300 underline-offset-2 hover:text-blue-200 hover:underline"
            >
            Undo
            </button>
            </div>
        )}
        </main>
    );
}

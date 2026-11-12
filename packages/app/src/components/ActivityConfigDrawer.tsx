// =============================================================================
// ActivityConfigDrawer — the activity-level configuration surface.
// -----------------------------------------------------------------------------
// Replaces the four stacked disclosure strips (Activity settings, Print &
// worksheet layout, Reference panel, Calculator) with a row of icon+label
// header buttons (ConfigButtons) that open ONE right-side drawer (ConfigDrawer)
// — one section at a time, the editor never pushed down.
//
// Two invariants carried over from the strips:
// - Every section body stays MOUNTED while hidden (CSS `hidden`, never a
//   conditional mount): the reference panel embeds a whole Tiptap editor whose
//   onCreate must fire once and whose edits must survive open/close, and the
//   calculator preview keeps its mounted widget.
// - The locked-mode warning banner is NOT in here — a correctness warning
//   stays inline on the page (ActivityEditor); the Settings button just gets
//   an amber dot as a secondary cue.
//
// HeaderButton is exported so the route header's navigation actions (Print
// view, Submissions, Import) render in the same visual language.
// =============================================================================

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Settings, BookOpen, Calculator as CalculatorIcon, NotebookPen } from 'lucide-react';
import type { JSONContent } from '@tiptap/react';
import type { Editor as TiptapEditor } from '@tiptap/core';
import SeedVarsPanel from './SeedVarsPanel';
import {
    createCalculatorTool,
    type ActivityFont,
    type ActivityMeta,
    type Typography,
    type CalculatorTool,
    type RegressionModel,
} from '@activity/schema';
import { FONT_MENU, FONT_REGISTRY, fontFamilyValue } from '@activity/schema';
import { mountCalculator, type CalculatorHandle } from '@activity/graph-kit';
import ReferencePanelEditor from '../editor/ReferencePanelEditor';
import TeacherGuideEditor from '../editor/TeacherGuideEditor';
import { ensureActivityFontLoaded } from '../lib/fonts';
import TagChipInput from './TagChipInput';
import { SELECT_CLASS, SETTINGS_HELP_CLASS, SETTINGS_LABEL_CLASS } from './settingsClasses';
import { chainHooksPath, fetchMyChainHooks } from '../lib/chainHooks';
import {
    PEDAGOGICAL_ROLES,
    PEDAGOGICAL_ROLE_HELP,
    PEDAGOGICAL_ROLE_LABELS,
    type PedagogicalRole,
} from '../lib/pedagogicalRole';

// The row-native taxonomy fields (taxonomy R1/R4/R7). These are NOT part of
// ActivityMeta and never travel in the document: tags + pedagogical_role live
// on the activities row as listing metadata, like `visibility`. They ride
// through the drawer as their own props precisely so nothing is tempted to
// fold them into meta, where the catalog could not filter on them.
export interface RowTaxonomy {
    tags: string[];
    onTagsChange: (next: string[]) => void;
    pedagogicalRole: PedagogicalRole | null;
    onPedagogicalRoleChange: (next: PedagogicalRole | null) => void;
    /** The author's existing tags across all activities — typeahead source. */
    tagVocabulary: readonly string[];
}

export type ConfigKey = 'settings' | 'reference' | 'calculator' | 'guide';

const DRAWER_TITLES: Record<ConfigKey, string> = {
    settings: 'Activity settings',
    reference: 'Reference panel',
    calculator: 'Calculator',
    guide: 'Teacher guide',
};


// The help text describes what the STUDENT gets, in the teacher's words. Each
// line is the flow-modes contract (R1/R2) rather than the pre-slice fiction
// these strings carried — "one submit at the end" named a submit that has not
// existed since S9.
const SUBMISSION_MODE_HELP: Record<ActivityMeta['submissionMode'], string> = {
    single: 'One Check at the very end, covering the whole activity. Section checkpoints are ignored.',
    locked: 'A Check at each checkpoint — and answers freeze once checked. There is no undo, and a re-publish is the only way to reset a class.',
    free: 'A Check at each checkpoint, covering everything since the last one. Students can re-check as often as they like.',
};

const ANSWER_FEEDBACK_HELP: Record<ActivityMeta['answerFeedback'], string> = {
    immediate: 'Not available yet — this activity will behave as “Reveal on check”.',
    on_check: 'Correctness stays hidden until the student presses Check.',
};

const ACTIVITY_TYPE_LABELS: Record<ActivityMeta['activityType'], string> = {
    worksheet: 'Worksheet',
    exit_ticket: 'Exit ticket',
    warm_up: 'Warm-up',
    review: 'Review',
    quiz: 'Quiz',
    exam: 'Exam',
};

// =============================================================================
// HeaderButton — the shared icon+label action chip for the editor header's
// config + nav toolbar (row 2). Renders a Link when `to` is given, a button
// otherwise. `icon` is a lucide glyph (18px); `title` is the hover tooltip
// that spells out what the chip does (icons alone are ambiguous — every chip
// carries one). `dot` is the small state cue (emerald = configured/enabled,
// amber = needs attention); pair it with a `title` that says what the dot
// means. (Publish is NOT a chip — it's the filled primary button in row 1.)
// =============================================================================

export function HeaderButton({
    icon,
    label,
    to,
    onClick,
    disabled,
    active,
    dot,
    title,
    dataConfigButton,
}: {
    icon: ReactNode;
    label: string;
    to?: string;
    onClick?: () => void;
    disabled?: boolean;
    active?: boolean;
    dot?: 'emerald' | 'amber';
    title?: string;
    dataConfigButton?: string;
}) {
    const base =
        'relative flex min-w-[3.5rem] flex-col items-center gap-1 rounded-md border px-2 py-1.5 text-[11px] font-medium leading-none transition';
    let tone: string;
    if (disabled) {
        tone = 'cursor-not-allowed border-line bg-canvas text-disabled';
    } else if (active) {
        tone = 'border-ink bg-primary text-white';
    } else {
        tone =
            'border-line bg-canvas text-muted hover:border-line-strong hover:bg-surface-2 hover:text-ink';
    }
    const cls = `${base} ${tone}`;
    const body = (
        <>
            <span aria-hidden="true" className="flex h-[18px] items-center">
                {icon}
            </span>
            <span>{label}</span>
            {dot ? (
                <span
                    aria-hidden="true"
                    className={`absolute right-1 top-1 h-1.5 w-1.5 rounded-full ${
                        dot === 'amber' ? 'bg-warning-accent' : 'bg-success-accent'
                    }`}
                />
            ) : null}
        </>
    );
    if (to) {
        return (
            <Link to={to} title={title} className={cls}>
                {body}
            </Link>
        );
    }
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            aria-pressed={active}
            data-config-button={dataConfigButton}
            className={cls}
        >
            {body}
        </button>
    );
}

// Shared lucide size for header chips.
const ICON = 18;

// =============================================================================
// ConfigButtons — the drawer-opening buttons with their state cues. (Print
// layout moved to the Print view route, so it's no longer here.)
// =============================================================================

export function ConfigButtons({
    active,
    onToggle,
    calculatorEnabled,
    referenceHasContent,
    guideHasContent = false,
    settingsWarning,
}: {
    active: ConfigKey | null;
    // Clicking the open section's button closes the drawer.
    onToggle: (key: ConfigKey) => void;
    calculatorEnabled: boolean;
    referenceHasContent: boolean;
    /** The teacher guide holds text (drives the Guide button's dot). */
    guideHasContent?: boolean;
    /** This activity is in `locked` submission mode. A standing cue rather
     * than a defect warning: locked is irreversible for the student — there is
     * no unlock, and a re-publish resets the whole class — so it is worth
     * seeing without opening the drawer. (It replaced a real warning that had
     * become permanently, wrongly true; see ActivityEditor.) */
    settingsWarning: boolean;
}) {
    return (
        <>
            <HeaderButton
                icon={<Settings size={ICON} />}
                label="Settings"
                active={active === 'settings'}
                dot={settingsWarning ? 'amber' : undefined}
                title={
                    settingsWarning
                        ? 'Activity settings — this activity locks answers when a student checks'
                        : 'Submission, activity type, and feedback settings'
                }
                onClick={() => onToggle('settings')}
                dataConfigButton="settings"
            />
            <HeaderButton
                icon={<BookOpen size={ICON} />}
                label="Reference"
                active={active === 'reference'}
                dot={referenceHasContent ? 'emerald' : undefined}
                title={
                    referenceHasContent
                        ? 'Reference panel (has content)'
                        : 'Optional reference content students can open while working'
                }
                onClick={() => onToggle('reference')}
                dataConfigButton="reference"
            />
            <HeaderButton
                icon={<CalculatorIcon size={ICON} />}
                label="Calculator"
                active={active === 'calculator'}
                dot={calculatorEnabled ? 'emerald' : undefined}
                title={
                    calculatorEnabled
                        ? 'Calculator (enabled on this activity)'
                        : 'Let students open an on-screen calculator'
                }
                onClick={() => onToggle('calculator')}
                dataConfigButton="calculator"
            />
            <HeaderButton
                icon={<NotebookPen size={ICON} />}
                label="Guide"
                active={active === 'guide'}
                dot={guideHasContent ? 'emerald' : undefined}
                title={
                    guideHasContent
                        ? 'Teacher guide (has notes) — teachers only, never shown to students'
                        : 'Notes for the teacher running this activity — never shown to students'
                }
                onClick={() => onToggle('guide')}
                dataConfigButton="guide"
            />
        </>
    );
}

// =============================================================================
// ConfigDrawer — the right-side panel hosting every section body.
// =============================================================================

export function ConfigDrawer({
    active,
    onClose,
    meta,
    onMetaChange,
    panelEditorKey,
    panelInitialContent,
    panelTitle,
    onPanelTitleChange,
    onPanelEditorUpdate,
    calculator,
    onCalculatorChange,
    guideEditorKey,
    guideInitialContent,
    onGuideEditorUpdate,
    activityId,
    taxonomy,
    bodyEditor,
}: {
    active: ConfigKey | null;
    onClose: () => void;
    meta: ActivityMeta;
    onMetaChange: (next: ActivityMeta) => void;
    panelEditorKey: string;
    panelInitialContent: JSONContent;
    panelTitle: string;
    onPanelTitleChange: (t: string) => void;
    onPanelEditorUpdate: (json: JSONContent) => void;
    calculator: CalculatorTool | undefined;
    onCalculatorChange: (c: CalculatorTool | undefined) => void;
    guideEditorKey: string;
    guideInitialContent: JSONContent;
    onGuideEditorUpdate: (json: JSONContent) => void;
    activityId?: string;
    taxonomy: RowTaxonomy;
    /** The activity's main editor, for the seeded-variable panel's live reference checks. */
    bodyEditor?: TiptapEditor | null;
}) {
    const closeRef = useRef<HTMLButtonElement>(null);
    const prevActiveRef = useRef<ConfigKey | null>(null);

    // Focus discipline: opening (closed → open) moves focus to the close
    // button; closing returns it to the button that opened the drawer.
    // Switching sections while open leaves focus where the user has it.
    useEffect(() => {
        const prev = prevActiveRef.current;
        prevActiveRef.current = active;
        if (active && prev === null) {
            closeRef.current?.focus();
        } else if (!active && prev) {
            document
                .querySelector<HTMLElement>(`[data-config-button="${prev}"]`)
                ?.focus();
        }
    }, [active]);

    return (
        // hidden (not unmounted) when closed — see the mounting invariant in
        // the file header. z-40 sits above page content but below the editor
        // popovers (z-50, portaled to body), so the reference editor's blank
        // and image popovers stack above the drawer that hosts them.
        <aside
            role="dialog"
            aria-label={active ? DRAWER_TITLES[active] : undefined}
            onKeyDown={(e) => {
                // defaultPrevented: an Escape already consumed by something
                // inside (a popover, the slash menu) must not also close the
                // drawer.
                if (e.key === 'Escape' && !e.defaultPrevented) onClose();
            }}
            className={
                active
                    ? 'fixed inset-y-0 right-0 z-40 flex w-[26rem] max-w-[92vw] flex-col border-l border-line bg-canvas shadow-xl'
                    : 'hidden'
            }
        >
            <header className="flex items-center justify-between border-b border-line px-4 py-3">
                <h2 className="text-sm font-semibold text-ink">
                    {active ? DRAWER_TITLES[active] : ''}
                </h2>
                <button
                    ref={closeRef}
                    type="button"
                    onClick={onClose}
                    aria-label="Close panel"
                    className="rounded px-2 py-1 text-sm text-muted transition hover:bg-surface-2 hover:text-ink"
                >
                    ✕
                </button>
            </header>
            <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className={active === 'settings' ? '' : 'hidden'}>
                    <ActivitySettingsBody
                        meta={meta}
                        onChange={onMetaChange}
                        taxonomy={taxonomy}
                        bodyEditor={bodyEditor}
                        visible={active === 'settings'}
                    />
                </div>
                <div className={active === 'reference' ? '' : 'hidden'}>
                    <ReferencePanelBody
                        editorKey={panelEditorKey}
                        initialContent={panelInitialContent}
                        title={panelTitle}
                        onTitleChange={onPanelTitleChange}
                        onEditorUpdate={onPanelEditorUpdate}
                        gridLinesDefault={meta.print.gridLines}
                        activityId={activityId}
                    />
                </div>
                <div className={active === 'calculator' ? '' : 'hidden'}>
                    <CalculatorBody
                        calculator={calculator}
                        onChange={onCalculatorChange}
                    />
                </div>
                <div className={active === 'guide' ? '' : 'hidden'}>
                    <p className={`${SETTINGS_HELP_CLASS} mb-3`}>
                        Notes for the teacher running this activity: what the
                        examples are for, what to watch for, what to cut if
                        time runs short. <strong>Only teachers see this —
                        students never do.</strong> It prints as the first page
                        of the answer key.
                    </p>
                    <TeacherGuideEditor
                        key={guideEditorKey}
                        initialContent={guideInitialContent}
                        onUpdate={onGuideEditorUpdate}
                    />
                    <UnitHooksLink activityId={activityId} open={active === 'guide'} />
                </div>
            </div>
        </aside>
    );
}

/**
 * "This unit's hooks →" (0057, CH-7.3; design 2.1A; eng re-run RT5). Shown only
 * when the activity's chain HAS a live pool, and fetched on the guide section's
 * FIRST open — never when the editor mounts, so opening the editor costs no
 * extra request. A failed read shows nothing (D3). No hook text here: the
 * guide and the pool stay separate (CH-10).
 */
function UnitHooksLink({ activityId, open }: { activityId?: string; open: boolean }) {
    const [chain, setChain] = useState<string | null>(null);
    const started = useRef(false);
    // A MOUNTED guard, not a per-run `cancelled`: the fetch runs once, and a
    // per-run cleanup would discard its result whenever `open` flips (the
    // teacher closes the drawer) or StrictMode re-runs the effect — and the
    // `started` guard would then never let it run again.
    const alive = useRef(true);
    useEffect(() => {
        alive.current = true;
        return () => {
            alive.current = false;
        };
    }, []);
    useEffect(() => {
        if (!open || !activityId || started.current) return;
        started.current = true;
        fetchMyChainHooks()
            .then((data) => {
                const c = data.activityChains[activityId];
                if (alive.current && c && (data.chains[c]?.length ?? 0) > 0) setChain(c);
            })
            .catch(() => {
                /* no line (D3) */
            });
    }, [open, activityId]);
    if (!chain) return null;
    return (
        <p className="mt-4 text-sm">
            <Link to={chainHooksPath(chain)} className="font-medium text-strong underline underline-offset-2">
                This unit's hooks →
            </Link>
        </p>
    );
}

// =============================================================================
// Section bodies — the strips' former contents, chrome-free.
// =============================================================================

// Activity-level metadata controls. submissionMode / activityType /
// answerFeedback round-trip through draft_content; this panel surfaces them.
//
// ⚰ revisionMode and gradingMode had controls here until 2026-08-24 (activity
// flow modes, R4) and were DELETED from the schema in the same slice — one
// governed resubmission after a submit that does not exist, the other claimed
// to choose a grading style the server decides per block. Don't re-add them.
// skills UI is still deferred to Phase 2.
//
// `immediate` answer feedback is RESERVED, not active (R3): the option stays
// selectable-looking nowhere — it is disabled, and its help line says what the
// activity will actually do — because the field survives in the schema and a
// document may already carry it.
function ActivitySettingsBody({
    meta,
    onChange,
    taxonomy,
    bodyEditor,
    visible,
}: {
    meta: ActivityMeta;
    onChange: (next: ActivityMeta) => void;
    taxonomy: RowTaxonomy;
    bodyEditor?: TiptapEditor | null;
    /** The settings section is open (the drawer stays mounted when closed). */
    visible: boolean;
}) {

    // meta.unit is optional: a blank field means "no unit", which must be the
    // ABSENT key, not an empty string. The publish stamp mirrors the document
    // into activities.unit, so '' here would put an empty-string facet in the
    // catalog where NULL belongs.
    const setUnit = (raw: string) => {
        const unit = raw.trim();
        const next = { ...meta };
        if (unit === '') delete next.unit;
        else next.unit = unit;
        onChange(next);
    };

    return (
        <div className="grid gap-4">
            {/* Classification first: what this activity IS, before how it
                behaves. course/unit are document fields stamped onto the row
                at publish (taxonomy R1); tags + role are row-native and take
                effect immediately, with no republish (R4/R7). */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={SETTINGS_LABEL_CLASS} htmlFor="activity-course">
                        Course
                    </label>
                    <input
                        id="activity-course"
                        type="text"
                        className={SELECT_CLASS}
                        value={meta.course}
                        onChange={(e) =>
                            onChange({ ...meta, course: e.target.value })
                        }
                    />
                </div>
                <div>
                    <label className={SETTINGS_LABEL_CLASS} htmlFor="activity-unit">
                        Unit
                    </label>
                    <input
                        id="activity-unit"
                        type="text"
                        className={SELECT_CLASS}
                        value={meta.unit ?? ''}
                        placeholder="Optional"
                        onChange={(e) => setUnit(e.target.value)}
                    />
                </div>
            </div>
            <p className={SETTINGS_HELP_CLASS}>
                Shown to students, and used to file this activity. They reach
                the catalog when you publish.
            </p>

            {/* Seeded variables (wishlist #6; editable since the GUI amendment of
                2026-11-12, seeded-data.md). A file-backed activity is still
                edited in its .md: an edit here makes the next import refuse it
                and say so (the importer's hand-edit fingerprint). */}
            <SeedVarsPanel
                seedVars={meta.seedVars}
                editor={bodyEditor}
                visible={visible}
                onChange={(vars) => {
                    const next: ActivityMeta = { ...meta };
                    // R11: absent, never [] — an empty list would churn every save.
                    if (vars) next.seedVars = vars;
                    else delete next.seedVars;
                    onChange(next);
                }}
            />

            <div>
                <label className={SETTINGS_LABEL_CLASS} htmlFor="pedagogical-role">
                    Bank role
                </label>
                <select
                    id="pedagogical-role"
                    className={SELECT_CLASS}
                    value={taxonomy.pedagogicalRole ?? ''}
                    onChange={(e) =>
                        taxonomy.onPedagogicalRoleChange(
                            e.target.value === ''
                                ? null
                                : (e.target.value as PedagogicalRole),
                        )
                    }
                >
                    <option value="">Unclassified</option>
                    {PEDAGOGICAL_ROLES.map((r) => (
                        <option key={r} value={r}>
                            {PEDAGOGICAL_ROLE_LABELS[r]}
                        </option>
                    ))}
                </select>
                <p className={SETTINGS_HELP_CLASS}>
                    {taxonomy.pedagogicalRole
                        ? PEDAGOGICAL_ROLE_HELP[taxonomy.pedagogicalRole]
                        : 'How this activity is used in the sequence. Separate from Activity type below, which is about layout.'}
                </p>
            </div>

            <TagChipInput
                tags={taxonomy.tags}
                onChange={taxonomy.onTagsChange}
                vocabulary={taxonomy.tagVocabulary}
            />

            <hr className="border-line" />

            <div>
                <label className={SETTINGS_LABEL_CLASS} htmlFor="submission-mode">
                    Submission mode
                </label>
                <select
                    id="submission-mode"
                    className={SELECT_CLASS}
                    value={meta.submissionMode}
                    onChange={(e) =>
                        onChange({
                            ...meta,
                            submissionMode: e.target
                                .value as ActivityMeta['submissionMode'],
                        })
                    }
                >
                    <option value="single">Single submit</option>
                    <option value="locked">Locked checkpoints</option>
                    <option value="free">Free checkpoints</option>
                </select>
                <p className={SETTINGS_HELP_CLASS}>
                    {SUBMISSION_MODE_HELP[meta.submissionMode]}
                </p>
            </div>

            <div>
                <label className={SETTINGS_LABEL_CLASS} htmlFor="activity-type">
                    Activity type
                </label>
                <select
                    id="activity-type"
                    className={SELECT_CLASS}
                    value={meta.activityType}
                    onChange={(e) =>
                        onChange({
                            ...meta,
                            activityType: e.target
                                .value as ActivityMeta['activityType'],
                        })
                    }
                >
                    {(
                        Object.keys(
                            ACTIVITY_TYPE_LABELS,
                        ) as ActivityMeta['activityType'][]
                    ).map((t) => (
                        <option key={t} value={t}>
                            {ACTIVITY_TYPE_LABELS[t]}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className={SETTINGS_LABEL_CLASS} htmlFor="answer-feedback">
                    Answer feedback
                </label>
                <select
                    id="answer-feedback"
                    className={SELECT_CLASS}
                    value={meta.answerFeedback}
                    onChange={(e) =>
                        onChange({
                            ...meta,
                            answerFeedback: e.target
                                .value as ActivityMeta['answerFeedback'],
                        })
                    }
                >
                    <option value="on_check">Reveal on check</option>
                    <option value="immediate" disabled>
                        Immediate self-check (not available yet)
                    </option>
                </select>
                <p className={SETTINGS_HELP_CLASS}>
                    {ANSWER_FEEDBACK_HELP[meta.answerFeedback]}
                </p>
            </div>

            <TypographySettings meta={meta} onChange={onChange} />
        </div>
    );
}

// Activity-wide typography (meta.typography): ONE font + base body size for
// the whole activity — published page, editor canvas, and print all follow.
// The field is additive/optional: while both controls hold the defaults the
// meta carries NO typography field at all, so untouched documents stay
// structurally identical to pre-typography ones. Base size is the on-SCREEN
// body size in px; the printed body size stays meta.print.fontSize (pt) in
// the Print & worksheet layout section — two layers, called out in the help
// text so teachers aren't surprised.
const TYPOGRAPHY_DEFAULTS: Typography = { font: 'default', fontSize: 16 };

function TypographySettings({
    meta,
    onChange,
}: {
    meta: ActivityMeta;
    onChange: (next: ActivityMeta) => void;
}) {
    const typography = meta.typography ?? TYPOGRAPHY_DEFAULTS;

    // Load the selected family into the app so the in-menu preview line below
    // (and the editor canvas behind the drawer) renders it immediately.
    useEffect(() => {
        void ensureActivityFontLoaded(typography.font);
    }, [typography.font]);

    const commit = (patch: Partial<Typography>) => {
        const next = { ...typography, ...patch };
        const isDefault =
            next.font === TYPOGRAPHY_DEFAULTS.font &&
            next.fontSize === TYPOGRAPHY_DEFAULTS.fontSize;
        onChange({ ...meta, typography: isDefault ? undefined : next });
    };

    return (
        <div className="border-t border-line pt-4">
            <div>
                <label className={SETTINGS_LABEL_CLASS} htmlFor="activity-font">
                    Font
                </label>
                <select
                    id="activity-font"
                    className={SELECT_CLASS}
                    value={typography.font}
                    onChange={(e) =>
                        commit({ font: e.target.value as ActivityFont })
                    }
                >
                    {FONT_MENU.map((font) => (
                        <option key={font} value={font}>
                            {FONT_REGISTRY[font].label}
                        </option>
                    ))}
                </select>
                <p className={SETTINGS_HELP_CLASS}>
                    One font for the whole activity — on screen, in the editor,
                    and on paper.
                </p>
            </div>

            <div className="mt-4">
                <label
                    className={SETTINGS_LABEL_CLASS}
                    htmlFor="activity-font-size"
                >
                    Base text size (px)
                </label>
                <input
                    id="activity-font-size"
                    type="number"
                    min={12}
                    max={24}
                    step={1}
                    className={SELECT_CLASS}
                    value={typography.fontSize}
                    onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === '') return;
                        const n = Number(raw);
                        if (Number.isFinite(n) && n >= 12 && n <= 24)
                            commit({ fontSize: n });
                    }}
                />
                <p className={SETTINGS_HELP_CLASS}>
                    On-screen body size; headings scale with it. Printed body
                    size is set separately under Print &amp; worksheet layout.
                </p>
            </div>

            <p
                data-typography-preview
                className="mt-3 rounded-md border border-line bg-surface px-3 py-2 text-strong"
                style={{
                    fontFamily: fontFamilyValue(typography.font) ?? undefined,
                    fontSize: `${typography.fontSize}px`,
                }}
            >
                The quick brown fox jumps over 12 lazy dogs.
            </p>
        </div>
    );
}


// Authoring surface for the reference panel: a title field + the constrained
// ReferencePanelEditor. The editor stays MOUNTED while the drawer is closed or
// showing another section (see the file-header invariant).
function ReferencePanelBody({
    editorKey,
    initialContent,
    title,
    onTitleChange,
    onEditorUpdate,
    gridLinesDefault,
    activityId,
}: {
    editorKey: string;
    initialContent: JSONContent;
    title: string;
    onTitleChange: (t: string) => void;
    onEditorUpdate: (json: JSONContent) => void;
    gridLinesDefault: boolean;
    activityId?: string;
}) {
    return (
        <div>
            <p className={`${SETTINGS_HELP_CLASS} mb-3`}>
                Optional reference content students can open from a bar while
                working (formula charts, vocabulary, conversion tables…). It
                shows as a collapsible toolbar on the published page and a box
                at the top of printouts. Leave empty for no panel.
            </p>
            <label className={SETTINGS_LABEL_CLASS} htmlFor="reference-title">
                Panel title
            </label>
            <input
                id="reference-title"
                type="text"
                className={`${SELECT_CLASS} mb-3 mt-1`}
                placeholder="e.g. Formula reference"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
            />
            <ReferencePanelEditor
                key={editorKey}
                initialContent={initialContent}
                onUpdate={onEditorUpdate}
                gridLinesDefault={gridLinesDefault}
                activityId={activityId}
            />
        </div>
    );
}

// Canonical order — checking a box re-derives the array by filtering this list,
// so the stored order never depends on the order the teacher clicked.
const REGRESSION_MODEL_OPTIONS: { model: RegressionModel; label: string }[] = [
    { model: 'linear', label: 'Linear (y = ax + b)' },
    { model: 'quadratic', label: 'Quadratic (y = ax² + bx + c)' },
    { model: 'exponential', label: 'Exponential (y = a·bˣ)' },
    { model: 'logarithmic', label: 'Logarithmic (y = a + b·ln x)' },
];

// Live preview of the calculator in its restricted state — the SAME
// mountCalculator() a published page loads, so the author sees exactly what a
// student gets ("what the teacher sees is what the student gets"). Mounted
// FLOATING (the published-page mode): the graphing widget is 30rem wide and
// can't fit inside the 26rem drawer, so instead of shrinking it the preview IS
// the student's draggable/resizable panel, summoned over the editor. Re-mounts
// when a restriction flag changes (the widget reads its config at mount); the
// kit's module-level remembered geometry keeps its size/position across
// remounts. The × close and Esc work here (the kit stops Esc's propagation,
// so the drawer stays open) and the toggle button below re-summons. Hiding the
// drawer or switching sections hides the panel with it (the mount lives in
// this section's display:none-able body — deliberate: no orphaned preview).
function CalculatorPreview({
    restrictions,
}: {
    restrictions: CalculatorTool['restrictions'];
}) {
    const mountRef = useRef<HTMLDivElement>(null);
    const handleRef = useRef<CalculatorHandle | null>(null);
    // Mirrors the widget's open state (it self-closes via ×/Esc) so the
    // toggle button reads correctly.
    const [open, setOpen] = useState(true);
    // join() so the array's identity churn doesn't re-mount on every render
    const modelsKey = restrictions.allowedRegressionModels.join(',');
    // mountCalculator is async (the calculator chunk loads behind the kit
    // entry), so guard the resolved handle against an effect that already
    // cleaned up (a restriction flag changed mid-load) — destroy it instead
    // of installing it.
    useEffect(() => {
        const el = mountRef.current;
        if (!el) return;
        let cancelled = false;
        let handle: CalculatorHandle | null = null;
        void mountCalculator(el, restrictions, {
            floating: true,
            onToggle: setOpen,
        }).then((h) => {
            if (cancelled) {
                h.destroy();
                return;
            }
            handle = h;
            handleRef.current = h;
        });
        return () => {
            cancelled = true;
            handleRef.current = null;
            handle?.destroy();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        restrictions.mode,
        restrictions.allowTrig,
        restrictions.allowLogExp,
        restrictions.allowInequalities,
        modelsKey,
        restrictions.maxExpressions,
    ]);
    return (
        <div className="mt-3">
            <button
                type="button"
                onClick={() => handleRef.current?.toggle()}
                aria-pressed={open}
                data-calculator-preview-toggle
                className="rounded-md border border-line-strong bg-canvas px-3 py-1.5 text-sm font-medium text-strong transition hover:border-line-strong hover:bg-surface"
            >
                {open ? 'Hide preview' : 'Preview — what students will see'}
            </button>
            <p className={SETTINGS_HELP_CLASS}>
                The preview opens as the same floating panel students get —
                drag its title bar to move it, resize from the corner.
            </p>
            <div ref={mountRef} />
        </div>
    );
}

// Activity-level calculator authoring (a scaffold sibling to the reference
// panel — config only, never graded). A toggle enables it; when on, the
// restriction flags + a live preview appear. Off keeps any configured flags
// (enabled:false) so toggling back on restores them; an activity that never
// touched the calculator carries no `calculator` field at all.
function CalculatorBody({
    calculator,
    onChange,
}: {
    calculator: CalculatorTool | undefined;
    onChange: (c: CalculatorTool | undefined) => void;
}) {
    const enabled = calculator?.enabled ?? false;
    const restrictions =
        calculator?.restrictions ?? createCalculatorTool().restrictions;

    const toggleEnabled = (on: boolean): void => {
        if (on) onChange({ enabled: true, restrictions });
        else if (calculator) onChange({ ...calculator, enabled: false });
    };
    const patchRestrictions = (
        patch: Partial<CalculatorTool['restrictions']>,
    ): void => {
        onChange({ enabled: true, restrictions: { ...restrictions, ...patch } });
    };

    return (
        <div>
            <p className={`${SETTINGS_HELP_CLASS} mb-3`}>
                Let students open an on-screen scientific calculator while
                working (like the one allowed on a digital SAT). It's a
                thinking aid — never graded, no answer key. Restrict which
                functions it offers below.
            </p>
            <label className="flex items-center gap-2 text-sm text-strong">
                <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => toggleEnabled(e.target.checked)}
                />
                <span>Allow a calculator on this activity</span>
            </label>
            {enabled && (
                <div className="mt-3">
                    <label className={SETTINGS_LABEL_CLASS} htmlFor="calc-mode">
                        Mode
                    </label>
                    <select
                        id="calc-mode"
                        className={`${SELECT_CLASS} mb-1 mt-1`}
                        value={restrictions.mode}
                        onChange={(e) =>
                            patchRestrictions({
                                mode:
                                    e.target.value === 'graphing'
                                        ? 'graphing'
                                        : 'scientific',
                            })
                        }
                    >
                        <option value="scientific">Scientific</option>
                        <option value="graphing">Graphing</option>
                    </select>
                    <p className={`${SETTINGS_HELP_CLASS} mb-3`}>
                        Graphing adds a plottable coordinate plane — it loads
                        ~240 KB more the first time a student opens it.
                    </p>
                    <p className={SETTINGS_LABEL_CLASS}>Allowed functions</p>
                    <label className="mt-1 flex items-center gap-2 text-sm text-strong">
                        <input
                            type="checkbox"
                            checked={restrictions.allowTrig}
                            onChange={(e) =>
                                patchRestrictions({
                                    allowTrig: e.target.checked,
                                })
                            }
                        />
                        <span>Trigonometry (sin, cos, tan)</span>
                    </label>
                    <label className="mt-1 flex items-center gap-2 text-sm text-strong">
                        <input
                            type="checkbox"
                            checked={restrictions.allowLogExp}
                            onChange={(e) =>
                                patchRestrictions({
                                    allowLogExp: e.target.checked,
                                })
                            }
                        />
                        <span>Logarithms &amp; exponentials (ln, log)</span>
                    </label>
                    <label className="mt-1 flex items-center gap-2 text-sm text-strong">
                        <input
                            type="checkbox"
                            checked={restrictions.allowInequalities}
                            onChange={(e) =>
                                patchRestrictions({
                                    allowInequalities: e.target.checked,
                                })
                            }
                        />
                        <span>Inequality graphing (y &gt; 2x + 1)</span>
                    </label>
                    {restrictions.mode === 'graphing' && (
                        <div className="mt-3">
                            <label
                                className={SETTINGS_LABEL_CLASS}
                                htmlFor="calc-max-expr"
                            >
                                Expression limit
                            </label>
                            <input
                                id="calc-max-expr"
                                type="number"
                                min={1}
                                max={50}
                                placeholder="Unlimited"
                                className={`${SELECT_CLASS} mb-1 mt-1`}
                                value={restrictions.maxExpressions ?? ''}
                                onChange={(e) => {
                                    const n = Number.parseInt(
                                        e.target.value,
                                        10,
                                    );
                                    patchRestrictions({
                                        maxExpressions:
                                            Number.isInteger(n) && n >= 1
                                                ? Math.min(n, 50)
                                                : undefined,
                                    });
                                }}
                            />
                            <p className={`${SETTINGS_HELP_CLASS} mb-3`}>
                                Cap how many rows the expression list allows.
                                Blank = unlimited.
                            </p>
                            <p className={SETTINGS_LABEL_CLASS}>
                                Regression (data panel)
                            </p>
                            <p className={`${SETTINGS_HELP_CLASS} mb-1`}>
                                Students type (x, y) data and fit a model —
                                equation and r² shown like a TI-84. Uncheck
                                them all for a no-regression lesson.
                            </p>
                            {REGRESSION_MODEL_OPTIONS.map(({ model, label }) => (
                                <label
                                    key={model}
                                    className="mt-1 flex items-center gap-2 text-sm text-strong"
                                >
                                    <input
                                        type="checkbox"
                                        checked={restrictions.allowedRegressionModels.includes(
                                            model,
                                        )}
                                        onChange={(e) =>
                                            patchRestrictions({
                                                allowedRegressionModels: e
                                                    .target.checked
                                                    ? REGRESSION_MODEL_OPTIONS.map(
                                                          (o) => o.model,
                                                      ).filter(
                                                          (m) =>
                                                              m === model ||
                                                              restrictions.allowedRegressionModels.includes(
                                                                  m,
                                                              ),
                                                      )
                                                    : restrictions.allowedRegressionModels.filter(
                                                          (m) => m !== model,
                                                      ),
                                            })
                                        }
                                    />
                                    <span>{label}</span>
                                </label>
                            ))}
                        </div>
                    )}
                    <CalculatorPreview restrictions={restrictions} />
                </div>
            )}
        </div>
    );
}

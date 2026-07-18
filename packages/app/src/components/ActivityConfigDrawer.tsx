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
import { Settings, Printer, BookOpen, Calculator as CalculatorIcon } from 'lucide-react';
import type { JSONContent } from '@tiptap/react';
import {
    createCalculatorTool,
    type ActivityFont,
    type ActivityMeta,
    type PrintConfig,
    type Typography,
    type CalculatorTool,
    type RegressionModel,
} from '@activity/schema';
import { FONT_MENU, FONT_REGISTRY, fontFamilyValue } from '@activity/renderer';
import { mountCalculator, type CalculatorHandle } from '@activity/graph-kit';
import ReferencePanelEditor from '../editor/ReferencePanelEditor';
import { ensureActivityFontLoaded } from '../lib/fonts';

export type ConfigKey = 'settings' | 'print' | 'reference' | 'calculator';

const DRAWER_TITLES: Record<ConfigKey, string> = {
    settings: 'Activity settings',
    print: 'Print & worksheet layout',
    reference: 'Reference panel',
    calculator: 'Calculator',
};

const SELECT_CLASS =
    'w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';
const SETTINGS_LABEL_CLASS =
    'text-xs font-semibold uppercase tracking-wide text-slate-500';
const SETTINGS_HELP_CLASS = 'mt-1 text-xs text-slate-500';

const SUBMISSION_MODE_HELP: Record<ActivityMeta['submissionMode'], string> = {
    single: 'One submit at the end — no per-section checkpoints.',
    locked: 'Per-section checkpoints; answers freeze once a section is checked.',
    free: 'Per-section checkpoints; students can revise and re-check freely.',
};

const REVISION_MODE_HELP: Record<ActivityMeta['revisionMode'], string> = {
    free: 'Students can revise and resubmit after the final submit.',
    locked: 'Final submit is final — no resubmissions.',
};

const ANSWER_FEEDBACK_HELP: Record<ActivityMeta['answerFeedback'], string> = {
    immediate: 'Each blank turns green/red as soon as the student leaves it.',
    on_check: 'Correctness stays hidden until the student checks the section or submits.',
};

const ACTIVITY_TYPE_LABELS: Record<ActivityMeta['activityType'], string> = {
    worksheet: 'Worksheet',
    exit_ticket: 'Exit ticket',
    warm_up: 'Warm-up',
    review: 'Review',
};

// =============================================================================
// HeaderButton — the shared icon+label action chip for the editor header.
// Renders a Link when `to` is given, a button otherwise. `icon` is a lucide
// glyph (18px); `title` is the hover tooltip that spells out what the chip
// does (icons alone are ambiguous — every chip carries one). `dot` is the
// small state cue (emerald = configured/enabled, amber = needs attention);
// pair it with a `title` that says what the dot means. `variant="primary"` is
// the one filled chip (Publish) — louder than the ghost chips, still in the row.
// =============================================================================

export function HeaderButton({
    icon,
    label,
    to,
    onClick,
    disabled,
    active,
    variant = 'default',
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
    variant?: 'default' | 'primary';
    dot?: 'emerald' | 'amber';
    title?: string;
    dataConfigButton?: string;
}) {
    const base =
        'relative flex min-w-[3.5rem] flex-col items-center gap-1 rounded-md border px-2 py-1.5 text-[11px] font-medium leading-none transition';
    let tone: string;
    if (variant === 'primary') {
        // The one filled chip. Disabled dims it rather than dropping to the
        // ghost look, so it still reads as the primary action mid-save.
        tone = disabled
            ? 'cursor-not-allowed border-slate-900 bg-slate-900 text-white opacity-50'
            : 'border-slate-900 bg-slate-900 text-white hover:bg-slate-800';
    } else if (disabled) {
        tone = 'cursor-not-allowed border-slate-200 bg-white text-slate-300';
    } else if (active) {
        tone = 'border-slate-900 bg-slate-900 text-white';
    } else {
        tone =
            'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900';
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
                        dot === 'amber' ? 'bg-amber-500' : 'bg-emerald-500'
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
// ConfigButtons — the four drawer-opening buttons with their state cues.
// =============================================================================

export function ConfigButtons({
    active,
    onToggle,
    calculatorEnabled,
    referenceHasContent,
    settingsWarning,
}: {
    active: ConfigKey | null;
    // Clicking the open section's button closes the drawer.
    onToggle: (key: ConfigKey) => void;
    calculatorEnabled: boolean;
    referenceHasContent: boolean;
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
                        ? 'Activity settings — see the locked-mode warning below'
                        : 'Submission, revision, and feedback settings'
                }
                onClick={() => onToggle('settings')}
                dataConfigButton="settings"
            />
            <HeaderButton
                icon={<Printer size={ICON} />}
                label="Print layout"
                active={active === 'print'}
                title="Paper, margins, header fields, and worksheet spacing"
                onClick={() => onToggle('print')}
                dataConfigButton="print"
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
        </>
    );
}

// =============================================================================
// ConfigDrawer — the right-side panel hosting all four section bodies.
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
    activityId,
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
    activityId?: string;
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
                    ? 'fixed inset-y-0 right-0 z-40 flex w-[26rem] max-w-[92vw] flex-col border-l border-slate-200 bg-white shadow-xl'
                    : 'hidden'
            }
        >
            <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <h2 className="text-sm font-semibold text-slate-900">
                    {active ? DRAWER_TITLES[active] : ''}
                </h2>
                <button
                    ref={closeRef}
                    type="button"
                    onClick={onClose}
                    aria-label="Close panel"
                    className="rounded px-2 py-1 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                >
                    ✕
                </button>
            </header>
            <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className={active === 'settings' ? '' : 'hidden'}>
                    <ActivitySettingsBody meta={meta} onChange={onMetaChange} />
                </div>
                <div className={active === 'print' ? '' : 'hidden'}>
                    <PrintSettingsBody meta={meta} onChange={onMetaChange} />
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
            </div>
        </aside>
    );
}

// =============================================================================
// Section bodies — the strips' former contents, chrome-free.
// =============================================================================

// Activity-level metadata controls. submissionMode / revisionMode /
// activityType all already round-trip through draft_content; this panel just
// surfaces them. revisionMode is inert in single mode (the schema ignores it),
// so its control is disabled there with explanatory text. gradingMode is
// omitted — it's inert in Phase 1 (manual/mixed treated as auto), so a picker
// would imply behavior that doesn't exist yet. skills UI is deferred to Phase 2.
function ActivitySettingsBody({
    meta,
    onChange,
}: {
    meta: ActivityMeta;
    onChange: (next: ActivityMeta) => void;
}) {
    const singleMode = meta.submissionMode === 'single';

    return (
        <div className="grid gap-4">
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
                <label className={SETTINGS_LABEL_CLASS} htmlFor="revision-mode">
                    Revision mode
                </label>
                <select
                    id="revision-mode"
                    className={SELECT_CLASS}
                    value={meta.revisionMode}
                    disabled={singleMode}
                    onChange={(e) =>
                        onChange({
                            ...meta,
                            revisionMode: e.target
                                .value as ActivityMeta['revisionMode'],
                        })
                    }
                >
                    <option value="free">Allow resubmit</option>
                    <option value="locked">No resubmit</option>
                </select>
                <p className={SETTINGS_HELP_CLASS}>
                    {singleMode
                        ? 'Not used in single-submit mode.'
                        : REVISION_MODE_HELP[meta.revisionMode]}
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
                    <option value="immediate">Immediate self-check</option>
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
        <div className="border-t border-slate-200 pt-4">
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
                className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700"
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

// The header toggles, in render order. `custom` is handled separately (it's a
// free-text list, not a boolean), so it isn't in this table.
const PRINT_HEADER_FIELDS: {
    key: 'name' | 'date' | 'period' | 'class' | 'score';
    label: string;
}[] = [
    { key: 'name', label: 'Name' },
    { key: 'date', label: 'Date' },
    { key: 'period', label: 'Period' },
    { key: 'class', label: 'Class' },
    { key: 'score', label: 'Score' },
];

// A labelled number input that commits only valid, in-range values. Empty and
// out-of-range input is ignored (the field keeps its last good value) rather
// than coercing to 0 or NaN — teachers shouldn't be able to type the layout
// into an invalid state. Decimal entry works via the spinner or whole/half
// steps; the schema clamps on save regardless.
function PrintNumberField({
    id,
    label,
    help,
    value,
    min,
    step,
    onCommit,
}: {
    id: string;
    label: string;
    help?: string;
    value: number;
    min: number;
    step: number;
    onCommit: (n: number) => void;
}) {
    return (
        <div>
            <label className={SETTINGS_LABEL_CLASS} htmlFor={id}>
                {label}
            </label>
            <input
                id={id}
                type="number"
                min={min}
                step={step}
                className={SELECT_CLASS}
                value={value}
                onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === '') return;
                    const n = Number(raw);
                    if (Number.isFinite(n) && n >= min) onCommit(n);
                }}
            />
            {help && <p className={SETTINGS_HELP_CLASS}>{help}</p>}
        </div>
    );
}

// Print & worksheet layout controls. Like ActivitySettingsBody, this just
// surfaces fields that already round-trip through draft_content (meta.print is
// embedded whole by tiptapToActivity). paperSize + margin drive the printed
// @page; fontSize/problemSpacing/workSpace become --print-* container vars;
// the header object toggles the printed Name/Date/… line. Per-problem work
// space lives on each FillInBlank block (FillInBlankView), not here — this
// workSpace is the worksheet-wide default.
function PrintSettingsBody({
    meta,
    onChange,
}: {
    meta: ActivityMeta;
    onChange: (next: ActivityMeta) => void;
}) {
    const print = meta.print;
    // Local draft for the comma-separated custom-label input so a trailing
    // comma or space survives mid-type (the stored array filters empties).
    const [customDraft, setCustomDraft] = useState(() =>
        print.header.custom.join(', '),
    );

    const setPrint = (patch: Partial<PrintConfig>) =>
        onChange({ ...meta, print: { ...print, ...patch } });
    const setHeader = (patch: Partial<PrintConfig['header']>) =>
        setPrint({ header: { ...print.header, ...patch } });

    return (
        <div>
            <div className="grid gap-4">
                <div>
                    <label className={SETTINGS_LABEL_CLASS} htmlFor="print-paper">
                        Paper size
                    </label>
                    <select
                        id="print-paper"
                        className={SELECT_CLASS}
                        value={print.paperSize}
                        onChange={(e) =>
                            setPrint({
                                paperSize: e.target
                                    .value as PrintConfig['paperSize'],
                            })
                        }
                    >
                        <option value="letter">Letter (8.5 × 11 in)</option>
                        <option value="a4">A4 (210 × 297 mm)</option>
                    </select>
                </div>

                {/* The worksheet print "Columns" control (CSS column-count, 1–3)
                    was retired here when structural authored columns landed — a
                    content-level columns block renders consistently on screen, in
                    worksheet print, and inside a foldable, so the per-mode print
                    setting is redundant. The control is removed but the underlying
                    plumbing is intentionally kept dormant (schema
                    PrintConfig.columns, the --print-columns renderer var, and its
                    @media print column-count rule) so already-saved values keep
                    printing as authored and the feature can be re-exposed later
                    with just this dropdown — no schema/renderer/redeploy churn.
                    See packages/schema/src/document.ts (PrintConfig.columns). */}

                <PrintNumberField
                    id="print-margin"
                    label="Margin (in)"
                    value={print.margin}
                    min={0}
                    step={0.25}
                    onCommit={(n) => setPrint({ margin: n })}
                />

                <PrintNumberField
                    id="print-font-size"
                    label="Body text (pt)"
                    value={print.fontSize}
                    min={1}
                    step={1}
                    onCommit={(n) => setPrint({ fontSize: n })}
                />

                <PrintNumberField
                    id="print-problem-spacing"
                    label="Space between problems (rem)"
                    value={print.problemSpacing}
                    min={0}
                    step={0.5}
                    onCommit={(n) => setPrint({ problemSpacing: n })}
                />

                <PrintNumberField
                    id="print-work-space"
                    label="Work space per problem (rem)"
                    help="Default blank space below each problem. Override on individual problems in their settings."
                    value={print.workSpace}
                    min={0}
                    step={0.5}
                    onCommit={(n) => setPrint({ workSpace: n })}
                />
            </div>

            <div className="mt-4">
                <span className={SETTINGS_LABEL_CLASS}>Header fields</span>
                <p className={SETTINGS_HELP_CLASS}>
                    Blank lines printed at the top of the worksheet for students
                    to fill in.
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                    {PRINT_HEADER_FIELDS.map(({ key, label }) => (
                        <label
                            key={key}
                            className="inline-flex items-center gap-1.5 text-sm text-slate-700"
                        >
                            <input
                                type="checkbox"
                                checked={print.header[key]}
                                onChange={(e) =>
                                    setHeader({ [key]: e.target.checked })
                                }
                            />
                            <span>{label}</span>
                        </label>
                    ))}
                </div>
                <label
                    className={`${SETTINGS_LABEL_CLASS} mt-3 block`}
                    htmlFor="print-custom-fields"
                >
                    Custom fields
                </label>
                <input
                    id="print-custom-fields"
                    type="text"
                    className={`${SELECT_CLASS} mt-1`}
                    placeholder="e.g. Homeroom, Teacher"
                    value={customDraft}
                    onChange={(e) => {
                        setCustomDraft(e.target.value);
                        setHeader({
                            custom: e.target.value
                                .split(',')
                                .map((s) => s.trim())
                                .filter(Boolean),
                        });
                    }}
                />
                <p className={SETTINGS_HELP_CLASS}>
                    Comma-separated extra labels, each printed with a blank line.
                </p>
            </div>

            <div className="mt-4">
                <label className="inline-flex items-center gap-1.5 text-sm text-slate-700">
                    <input
                        type="checkbox"
                        checked={print.gridLines}
                        onChange={(e) =>
                            setPrint({ gridLines: e.target.checked })
                        }
                    />
                    <span>Grid lines on columns blocks</span>
                </label>
                <p className={SETTINGS_HELP_CLASS}>
                    Draw boxes and dividers around columns layouts by default —
                    handy for printed worksheets. Individual columns blocks can
                    override this with their own grid toggle in the editor
                    toolbar.
                </p>
            </div>

            <div className="mt-4">
                <label className="inline-flex items-center gap-1.5 text-sm text-slate-700">
                    <input
                        type="checkbox"
                        checked={print.printReferencePanel}
                        onChange={(e) =>
                            setPrint({ printReferencePanel: e.target.checked })
                        }
                    />
                    <span>Include reference panel when printing</span>
                </label>
                <p className={SETTINGS_HELP_CLASS}>
                    Print the activity's reference panel as a box at the top of
                    the worksheet. Turn off if students already have a class set
                    (e.g. a shared formula chart). The on-screen reference
                    toolbar is unaffected.
                </p>
            </div>
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
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
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
            <label className="flex items-center gap-2 text-sm text-slate-700">
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
                    <label className="mt-1 flex items-center gap-2 text-sm text-slate-700">
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
                    <label className="mt-1 flex items-center gap-2 text-sm text-slate-700">
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
                    <label className="mt-1 flex items-center gap-2 text-sm text-slate-700">
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
                                    className="mt-1 flex items-center gap-2 text-sm text-slate-700"
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

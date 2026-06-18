// =============================================================================
// ActivityEditor.tsx — the /activity/:id route
// -----------------------------------------------------------------------------
// Loads an activity's draft (or its published version if no draft exists),
// displays it in the editor, autosaves changes (title + body) back to Supabase,
// and provides a Publish action that snapshots the current draft to an
// immutable, student-accessible static HTML page.
//
// Load priority on mount: prefer draft_content (a pending edit-in-progress) →
// then current_version_id's content (post-publish, no edits yet) → then a
// fresh empty doc (brand-new activity, shouldn't happen via Activities.tsx
// flow which always inserts a draft, but defensive). This is the fix for
// the "publish clears your editor" bug: the publish RPC clears draft_content
// on success, so after a publish there's a window (until the next edit) where
// draft is null. Before this fix, the editor showed an empty document during
// that window; now it shows the just-published version as the starting point
// for the next revision.
// =============================================================================

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import { Link, useParams } from 'react-router';
import type { Editor as TiptapEditor, JSONContent } from '@tiptap/react';
import {
    ActivityDocument,
    createEmptyDocument,
    type ActivityMeta,
    type PrintConfig,
    type ReferencePanel,
} from '@activity/schema';
import { supabase } from '../lib/supabase';
import {
    activityToTiptap,
    tiptapToActivity,
    referencePanelToTiptap,
    tiptapToReferencePanel,
} from '../lib/serialize';
import { useAutosave, type SaveStatus } from '../lib/useAutosave';
import Editor from '../editor/Editor';
import ReferencePanelEditor from '../editor/ReferencePanelEditor';
import PublishControl from '../components/PublishControl';
import ImportMarkdownDialog from '../components/ImportMarkdownDialog';

interface ActivityLoadRow {
    id: string;
    title: string;
    draft_content: unknown;
    current_version_id: string | null;
}

interface ActivityVersionLoadRow {
    content: unknown;
}

type LoadState =
| { status: 'loading' }
| { status: 'not_found' }
| { status: 'error'; message: string }
| { status: 'ready'; tiptap: JSONContent; referenceTiptap: JSONContent };

const UUID_RE =
/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

// Locked mode relies on per-section "Check this section" buttons to freeze
// answers; a section that isn't a checkpoint has no such button, so students
// in that section can never lock. Walk the Tiptap doc and report whether any
// section lacks a checkpoint. The leading run before the first sectionBreak
// forms an implicit section with no checkpoint affordance, so its presence
// counts. Mirrors splitTiptapBlocksIntoSections in serialize.ts.
function hasNonCheckpointSection(tiptap: JSONContent): boolean {
    const nodes = tiptap.content ?? [];
    if (nodes.length === 0) return false;
    if (nodes[0]?.type !== 'sectionBreak') return true;
    for (const n of nodes) {
        if (n.type === 'sectionBreak' && n.attrs?.isCheckpoint !== true) {
            return true;
        }
    }
    return false;
}

// Reconstitute a ReferencePanel from the panel editor's Tiptap JSON + the title
// field, or undefined when the panel is effectively empty (no title and no real
// content) so an empty scaffold is never persisted. Called only at save time —
// the live fingerprint uses the Tiptap JSON directly (see changeKey), since
// tiptapToReferencePanel mints fresh UUIDs and must not feed change detection.
function panelFromEditor(
    json: JSONContent | null,
    title: string,
): ReferencePanel | undefined {
    const hasTitle = title.trim().length > 0;
    const content = json?.content ?? [];
    const hasContent = content.some(
        (n) => n.type !== 'paragraph' || (n.content?.length ?? 0) > 0,
    );
    if (!hasTitle && !hasContent) return undefined;
    return tiptapToReferencePanel(json ?? { type: 'doc', content: [] }, title);
}

function Shell({ children }: { children: ReactNode }) {
    return (
        <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-3xl">{children}</div>
        </main>
    );
}

// Public base for published pages, mirrored from the publish Edge Function's
// R2_PUBLIC_URL_BASE. Trailing slashes trimmed so URL building is unambiguous.
const PUBLISHED_BASE = (import.meta.env.VITE_PUBLISHED_URL_BASE ?? '').replace(
    /\/+$/,
    '',
);

// The live alias URL the publish function writes (`{base}/{id}/index.html`).
// Null when the base env is unset, so callers can hide the affordance rather
// than render a broken link.
function publishedUrl(activityId: string): string | null {
    return PUBLISHED_BASE ? `${PUBLISHED_BASE}/${activityId}/index.html` : null;
}

// Persistent link to an already-published activity's live page. Unlike the
// post-publish pill in PublishControl (which only exists in the session where
// you clicked Publish), this renders on every load of a published activity so
// the URL is always retrievable.
function PublishedLink({ activityId }: { activityId: string }) {
    const url = publishedUrl(activityId);
    const [copied, setCopied] = useState(false);
    if (!url) return null;
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            /* clipboard write can fail in unsupported contexts; non-fatal */
        }
    };
    return (
        <span className="flex items-center gap-2 text-sm">
        <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-slate-500 underline underline-offset-2 hover:text-slate-700"
        >
        View published page
        </a>
        <button
        type="button"
        onClick={copy}
        className="font-medium text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
        >
        {copied ? 'Copied!' : 'Copy link'}
        </button>
        </span>
    );
}

function SaveIndicator({ status }: { status: SaveStatus }) {
    if (status === 'idle') return null;
    if (status === 'saving') {
        return <span className="text-xs text-slate-400">Saving…</span>;
    }
    if (status === 'saved') {
        return <span className="text-xs text-slate-400">Saved</span>;
    }
    return (
        <span className="text-xs text-red-600">
        Couldn't save — your latest edits aren't stored
        </span>
    );
}

const SELECT_CLASS =
    'w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';
const SETTINGS_LABEL_CLASS =
    'text-xs font-semibold uppercase tracking-wide text-slate-500';
const SETTINGS_HELP_CLASS = 'mt-1 text-xs text-slate-500';

// Activity-level metadata controls. submissionMode / revisionMode /
// activityType all already round-trip through draft_content; this panel just
// surfaces them. revisionMode is inert in single mode (the schema ignores it),
// so its control is disabled there with explanatory text. gradingMode is
// omitted — it's inert in Phase 1 (manual/mixed treated as auto), so a picker
// would imply behavior that doesn't exist yet. skills UI is deferred to Phase 2.
function ActivitySettings({
    meta,
    onChange,
}: {
    meta: ActivityMeta;
    onChange: (next: ActivityMeta) => void;
}) {
    const [open, setOpen] = useState(false);
    const singleMode = meta.submissionMode === 'single';

    return (
        <div className="mt-3 rounded-md border border-slate-200 bg-white">
        <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
        <span>
        <span aria-hidden="true">⚙</span> Activity settings
        </span>
        <span className="text-xs text-slate-400">{open ? '▲' : '▼'}</span>
        </button>
        {open && (
            <div className="grid gap-4 border-t border-slate-200 px-3 py-3 sm:grid-cols-2">
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
            </div>
        )}
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

// Print & worksheet layout controls. Like ActivitySettings, this just surfaces
// fields that already round-trip through draft_content (meta.print is embedded
// whole by tiptapToActivity). paperSize + margin drive the printed @page;
// columns/fontSize/problemSpacing/workSpace become --print-* container vars;
// the header object toggles the printed Name/Date/… line. Per-problem work
// space lives on each FillInBlank block (FillInBlankView), not here — this
// workSpace is the worksheet-wide default.
function PrintSettings({
    meta,
    onChange,
}: {
    meta: ActivityMeta;
    onChange: (next: ActivityMeta) => void;
}) {
    const [open, setOpen] = useState(false);
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
        <div className="mt-3 rounded-md border border-slate-200 bg-white">
        <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
        <span>
        <span aria-hidden="true">🖨</span> Print &amp; worksheet layout
        </span>
        <span className="text-xs text-slate-400">{open ? '▲' : '▼'}</span>
        </button>
        {open && (
            <div className="border-t border-slate-200 px-3 py-3">
            <div className="grid gap-4 sm:grid-cols-2">
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
                    paperSize: e.target.value as PrintConfig['paperSize'],
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
            Blank lines printed at the top of the worksheet for students to
            fill in.
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
                onChange={(e) => setHeader({ [key]: e.target.checked })}
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
            onChange={(e) => setPrint({ gridLines: e.target.checked })}
            />
            <span>Grid lines on columns blocks</span>
            </label>
            <p className={SETTINGS_HELP_CLASS}>
            Draw boxes and dividers around columns layouts by default — handy
            for printed worksheets. Individual columns blocks can override this
            with their own grid toggle in the editor toolbar.
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
            Print the activity's reference panel as a box at the top of the
            worksheet. Turn off if students already have a class set (e.g. a
            shared formula chart). The on-screen reference toolbar is
            unaffected.
            </p>
            </div>
            </div>
        )}
        </div>
    );
}

// Collapsible authoring surface for the reference panel. Mirrors the
// ActivitySettings / PrintSettings disclosures, but its body holds a title
// field + the constrained ReferencePanelEditor. The editor stays MOUNTED while
// collapsed (hidden via CSS) so its onCreate fires once and edits survive
// expand/collapse — a conditional mount would remount it and drop content.
function ReferencePanelSection({
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
    activityId: string;
}) {
    const [open, setOpen] = useState(false);
    return (
        <div className="mt-3 rounded-md border border-slate-200 bg-white">
        <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
        <span>
        <span aria-hidden="true">📎</span> Reference panel
        </span>
        <span className="text-xs text-slate-400">{open ? '▲' : '▼'}</span>
        </button>
        <div className={open ? 'border-t border-slate-200 px-3 py-3' : 'hidden'}>
        <p className={`${SETTINGS_HELP_CLASS} mb-3`}>
        Optional reference content students can open from a bar while working
        (formula charts, vocabulary, conversion tables…). It shows as a
        collapsible toolbar on the published page and a box at the top of
        printouts. Leave empty for no panel.
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
        </div>
    );
}

export default function ActivityEditor() {
    const { id } = useParams();
    const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
    const [meta, setMeta] = useState<ActivityMeta | null>(null);
    // Reference-panel authoring state. Like the main editor, the FINGERPRINT
    // uses the panel editor's Tiptap JSON (stable) — never the serialized
    // ReferencePanel, since tiptapToReferencePanel mints fresh block UUIDs and
    // would churn the change-detection key. panelTitle is the disclosure's title
    // field (not part of the Tiptap doc). Both are folded into changeKey;
    // panelFromEditor reconstitutes the ReferencePanel at save time.
    const [panelTitle, setPanelTitle] = useState('');
    const [panelJson, setPanelJson] = useState<JSONContent | null>(null);
    const [tiptapJson, setTiptapJson] = useState<JSONContent | null>(null);
    const [isPublished, setIsPublished] = useState(false);
    // Live editor instance (null until mounted) + the markdown-import modal's
    // open state. The editor owns its useEditor instance; it reports up here via
    // onEditorReady so the header's Import action can drive insert commands.
    const [editorInstance, setEditorInstance] = useState<TiptapEditor | null>(
        null,
    );
    const [importOpen, setImportOpen] = useState(false);

    useEffect(() => {
        if (!id || !UUID_RE.test(id)) {
            setLoadState({ status: 'not_found' });
            return;
        }
        let cancelled = false;
        (async () => {
            const { data, error } = await supabase
            .from('activities')
            .select('id, title, draft_content, current_version_id')
            .eq('id', id)
            .is('deleted_at', null)
            .maybeSingle();
            if (cancelled) return;

            if (error) {
                setLoadState({ status: 'error', message: error.message });
                return;
            }
            if (!data) {
                setLoadState({ status: 'not_found' });
                return;
            }

            const row = data as ActivityLoadRow;
            setIsPublished(row.current_version_id !== null);

            // Three-way load priority: draft > published version > fresh empty.
            // The draft path is the common case (any activity with in-progress
            // edits). The version path is the post-publish reopen case — the
            // publish RPC clears draft_content, so without this fallback the
            // editor would show an empty document for any activity that's been
            // published but not yet re-edited. Fresh-empty is the defensive
            // bottom case; Activities.tsx always inserts a draft on creation,
            // so a row with neither a draft nor a current_version_id should be
            // impossible via the normal flow.
            let doc: ActivityDocument;
            if (row.draft_content !== null) {
                const parsed = ActivityDocument.safeParse(row.draft_content);
                if (!parsed.success) {
                    setLoadState({
                        status: 'error',
                        message: "This activity's saved draft could not be read.",
                    });
                    return;
                }
                doc = parsed.data;
            } else if (row.current_version_id) {
                const { data: versionData, error: vErr } = await supabase
                .from('activity_versions')
                .select('content')
                .eq('id', row.current_version_id)
                .single();
                if (cancelled) return;

                if (vErr || !versionData) {
                    setLoadState({
                        status: 'error',
                        message:
                        "Couldn't load the published version of this activity.",
                    });
                    return;
                }
                const versionRow = versionData as ActivityVersionLoadRow;
                const parsed = ActivityDocument.safeParse(versionRow.content);
                if (!parsed.success) {
                    setLoadState({
                        status: 'error',
                        message:
                        "The published version of this activity is malformed.",
                    });
                    return;
                }
                doc = parsed.data;
            } else {
                doc = createEmptyDocument({ title: row.title });
            }

            // ProseMirror's `doc` requires at least one block child; a brand-new
            // activity serializes to content: [] — substitute an empty paragraph.
            const tiptap = activityToTiptap(doc);
            const safeTiptap: JSONContent =
            Array.isArray(tiptap.content) && tiptap.content.length > 0
            ? tiptap
            : { type: 'doc', content: [{ type: 'paragraph' }] };

            // Seed the reference-panel editor with the loaded panel's blocks
            // (flat, no sections). Empty-paragraph fallback when there's no
            // panel or it has no blocks — ProseMirror's doc needs at least one
            // block child.
            const loadedPanel = doc.referencePanel;
            const refTiptap =
            loadedPanel && loadedPanel.blocks.length > 0
            ? referencePanelToTiptap(loadedPanel)
            : { type: 'doc', content: [{ type: 'paragraph' }] };
            const safeRefTiptap: JSONContent =
            Array.isArray(refTiptap.content) && refTiptap.content.length > 0
            ? refTiptap
            : { type: 'doc', content: [{ type: 'paragraph' }] };

            setMeta(doc.meta);
            setPanelTitle(loadedPanel?.title ?? '');
            setLoadState({
                status: 'ready',
                tiptap: safeTiptap,
                referenceTiptap: safeRefTiptap,
            });
        })();

        return () => {
            cancelled = true;
        };
    }, [id]);

    // The editor reports body changes here; onCreate also routes here, so the
    // first call carries the loaded baseline (the autosave hook ignores it).
    const handleEditorUpdate = useCallback((json: JSONContent) => {
        setTiptapJson(json);
    }, []);

    // The reference-panel editor reports its Tiptap JSON here; onCreate routes
    // here too (the baseline). changeKey gates on panelJson so the autosave
    // baseline settles only once BOTH editors have reported — no spurious
    // load-time save.
    const handlePanelUpdate = useCallback((json: JSONContent) => {
        setPanelJson(json);
    }, []);

    // Insert markdown-imported blocks. A fresh activity (just the default empty
    // paragraph) is replaced outright so there's no leading blank; an activity
    // with existing content gets the blocks appended at the end. The resulting
    // transaction flows through onUpdate → autosave like any other edit.
    const handleImportMarkdown = useCallback(
        (importedBlocks: JSONContent[]) => {
            if (!editorInstance || importedBlocks.length === 0) return;
            if (editorInstance.isEmpty) {
                editorInstance
                    .chain()
                    .focus()
                    .setContent({ type: 'doc', content: importedBlocks })
                    .run();
            } else {
                editorInstance
                    .chain()
                    .focus('end')
                    .insertContentAt(
                        editorInstance.state.doc.content.size,
                        importedBlocks,
                    )
                    .run();
            }
        },
        [editorInstance],
    );

    // Stable fingerprint of the whole document (body + meta). Null until the
    // editor has produced its first JSON — the autosave stays idle until then.
    const changeKey = useMemo(
        () =>
        tiptapJson && meta && panelJson
        ? JSON.stringify({ t: tiptapJson, m: meta, rt: panelTitle, rj: panelJson })
        : null,
        [tiptapJson, meta, panelTitle, panelJson],
    );

    // Serializes the current state and writes the draft. draft_content and the
    // title column are written together so the activity list (which reads the
    // column) never drifts from meta.title.
    const save = async () => {
        if (!tiptapJson || !meta || !id) return;
        // meta.title is z.string().min(1); a blank title would make the saved
        // draft fail validation on the next load. Fall back to a placeholder.
        const safeMeta: ActivityMeta = {
            ...meta,
            title: meta.title.trim() || 'Untitled activity',
        };
        const doc = tiptapToActivity(
            tiptapJson,
            safeMeta,
            panelFromEditor(panelJson, panelTitle),
        );
        const parsed = ActivityDocument.safeParse(doc);
        if (!parsed.success) {
            // Shouldn't happen — serialize produces valid docs and the title is
            // sanitized. Fail loud rather than persist a draft the editor can't read.
            throw new Error('Document failed validation; not saved.');
        }
        const { error } = await supabase
        .from('activities')
        .update({
            draft_content: parsed.data,
            title: safeMeta.title,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id);
        if (error) throw error;
    };

        const { status, flush } = useAutosave(changeKey, save);

        if (loadState.status === 'loading') {
            return (
                <Shell>
                <p className="text-slate-500">Loading activity…</p>
                </Shell>
            );
        }

        if (loadState.status === 'not_found') {
            return (
                <Shell>
                <h1 className="text-2xl font-bold text-slate-900">
                Activity not found
                </h1>
                <p className="mt-2 text-slate-600">
                It may have been deleted, or you don't have access to it.
                </p>
                <Link
                to="/activities"
                className="mt-4 inline-block text-sm font-medium text-slate-700 underline underline-offset-2 hover:text-slate-900"
                >
                ← Back to my activities
                </Link>
                </Shell>
            );
        }

        if (loadState.status === 'error') {
            return (
                <Shell>
                <h1 className="text-2xl font-bold text-slate-900">
                Couldn't open this activity
                </h1>
                <p className="mt-2 text-slate-600">{loadState.message}</p>
                <Link
                to="/activities"
                className="mt-4 inline-block text-sm font-medium text-slate-700 underline underline-offset-2 hover:text-slate-900"
                >
                ← Back to my activities
                </Link>
                </Shell>
            );
        }

        // status === 'ready'. meta and id are both set; guards narrow them for
        // PublishControl's activityId: string prop.
        if (!meta) return null;
        if (!id) return null;

        return (
            <Shell>
            <div className="flex items-center justify-between">
            <Link
            to="/activities"
            className="text-sm font-medium text-slate-500 underline underline-offset-2 hover:text-slate-700"
            >
            ← All activities
            </Link>
            <div className="flex items-center gap-4">
            <SaveIndicator status={status} />
            {isPublished && <PublishedLink activityId={id} />}
            <Link
            to={`/activity/${id}/print`}
            className="text-sm font-medium text-slate-500 underline underline-offset-2 hover:text-slate-700"
            >
            Print
            </Link>
            <Link
            to={`/activity/${id}/submissions`}
            className="text-sm font-medium text-slate-500 underline underline-offset-2 hover:text-slate-700"
            >
            Submissions
            </Link>
            <button
            type="button"
            onClick={() => setImportOpen(true)}
            disabled={!editorInstance}
            title="Paste markdown and convert it to activity blocks"
            className="text-sm font-medium text-slate-500 underline underline-offset-2 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
            Import markdown
            </button>
            <PublishControl activityId={id} saveStatus={status} onBeforePublish={flush} />
            </div>
            </div>

            <input
            type="text"
            value={meta.title}
            onChange={(e) => setMeta({ ...meta, title: e.target.value })}
            placeholder="Untitled activity"
            aria-label="Activity title"
            className="mt-4 w-full bg-transparent text-2xl font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />

            <ActivitySettings meta={meta} onChange={setMeta} />

            <PrintSettings meta={meta} onChange={setMeta} />

            <ReferencePanelSection
            editorKey={id}
            initialContent={loadState.referenceTiptap}
            title={panelTitle}
            onTitleChange={setPanelTitle}
            onEditorUpdate={handlePanelUpdate}
            gridLinesDefault={meta.print.gridLines}
            activityId={id}
            />

            {meta.submissionMode === 'locked' &&
            hasNonCheckpointSection(tiptapJson ?? loadState.tiptap) && (
                <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Locked mode freezes answers when a section is checked, but at
                least one section isn't a checkpoint — students there have no
                way to lock their work. Mark every section as a checkpoint, or
                switch to free or single mode.
                </div>
            )}

            <div className="mb-6" />

            {/* key={id}: the editor's identity is the activity; a fresh activity
            gets a fresh editor (Editor consumes initialContent only at mount). */}
            <Editor
            key={id}
            initialContent={loadState.tiptap}
            onUpdate={handleEditorUpdate}
            gridLinesDefault={meta.print.gridLines}
            activityId={id}
            onEditorReady={setEditorInstance}
            />

            {importOpen && (
                <ImportMarkdownDialog
                onClose={() => setImportOpen(false)}
                onImport={handleImportMarkdown}
                />
            )}
            </Shell>
        );
}

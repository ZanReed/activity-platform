// =============================================================================
// PrintSettingsBody.tsx — the print page's layout controls
// -----------------------------------------------------------------------------
// Lived in ActivityConfigDrawer.tsx until 2026-11-13. The print route was its
// only user, and importing it from the drawer pulled the drawer's two Tiptap
// editors, MathLive and the calculator into every print preview: ~590 KiB gz
// that print never ran (shell-size review TR2). Keep this module free of
// editor imports; perf-budgets.mjs → TEACHER_JOURNEYS forbids ProseMirror and
// MathLive in the print journey.
// =============================================================================

import { useState } from 'react';
import type { ActivityMeta, PrintConfig } from '@activity/schema';
import { linesToRem, remToLines } from '../lib/workSpaceUnits';
import { SELECT_CLASS, SETTINGS_HELP_CLASS, SETTINGS_LABEL_CLASS } from './settingsClasses';

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
export function PrintSettingsBody({
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
                    label="Space between problems (lines)"
                    value={remToLines(print.problemSpacing)}
                    min={0}
                    step={0.5}
                    onCommit={(n) => setPrint({ problemSpacing: linesToRem(n) })}
                />

                <PrintNumberField
                    id="print-work-space"
                    // D-7 (ui-review-group-d.md): shown and typed in lines —
                    // the unit the ```meta fence leads with ("3 lines", ruling
                    // D6) — and stored as rem, as before.
                    label="Work space per problem (lines)"
                    help="Default blank space below each problem (1 line ≈ 8mm). Override on individual problems in their settings."
                    value={remToLines(print.workSpace)}
                    min={0}
                    step={0.5}
                    onCommit={(n) => setPrint({ workSpace: linesToRem(n) })}
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
                            className="inline-flex items-center gap-1.5 text-sm text-strong"
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
                <label className="inline-flex items-center gap-1.5 text-sm text-strong">
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
                <label className="inline-flex items-center gap-1.5 text-sm text-strong">
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

            <div className="mt-4">
                <label className="inline-flex items-center gap-1.5 text-sm text-strong">
                    <input
                        type="checkbox"
                        checked={print.printDefinitionGlossary}
                        onChange={(e) =>
                            setPrint({
                                printDefinitionGlossary: e.target.checked,
                            })
                        }
                    />
                    <span>Include a glossary of defined words when printing</span>
                </label>
                <p className={SETTINGS_HELP_CLASS}>
                    Add every defined word and its definition as a glossary at
                    the end of the worksheet. On screen a student taps a word to
                    open its definition, but paper has no popovers — turn this on
                    when a definition carries something students need, like a
                    formula or a diagram.
                </p>
            </div>
        </div>
    );
}

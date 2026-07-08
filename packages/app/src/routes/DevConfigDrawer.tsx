import { useState } from 'react';
import type { JSONContent } from '@tiptap/react';
import {
    createEmptyDocument,
    type ActivityMeta,
    type CalculatorTool,
} from '@activity/schema';
import {
    ConfigButtons,
    ConfigDrawer,
    HeaderButton,
    type ConfigKey,
} from '../components/ActivityConfigDrawer';

// =============================================================================
// /dev/config-drawer — dev-only bench for the activity-editor header + drawer.
// -----------------------------------------------------------------------------
// ActivityEditor sits behind auth + a Supabase load, so this bench drives the
// SAME ConfigButtons/ConfigDrawer/HeaderButton components with local state:
// every drawer section, the state-cue dots (calculator enabled, reference has
// content, locked-mode warning), and keyboard/focus behavior are exercisable
// here without a session. The nav cluster is visual-parity only (dead links /
// disabled), like the other /dev benches.
// =============================================================================

export default function DevConfigDrawer() {
    const [meta, setMeta] = useState<ActivityMeta>(
        () => createEmptyDocument({ title: 'Dev activity' }).meta,
    );
    const [panelTitle, setPanelTitle] = useState('');
    const [panelJson, setPanelJson] = useState<JSONContent | null>(null);
    const [calculator, setCalculator] = useState<CalculatorTool | undefined>(
        undefined,
    );
    const [configOpen, setConfigOpen] = useState<ConfigKey | null>(null);

    const referenceHasContent =
        panelTitle.trim().length > 0 ||
        (panelJson?.content ?? []).some(
            (n) => n.type !== 'paragraph' || (n.content?.length ?? 0) > 0,
        );

    return (
        <main className="min-h-screen bg-slate-50 p-8">
            <div className="mx-auto max-w-3xl">
                <h1 className="text-2xl font-bold text-slate-900">
                    Config drawer bench
                </h1>
                <p className="mb-6 mt-1 text-sm text-slate-500">
                    Dev-only — the activity-editor header cluster + settings
                    drawer with local state. The locked-mode dot appears when
                    submission mode is set to “Locked checkpoints” (this bench
                    has no sections, so the warning is always on in that mode).
                </p>

                <div className="flex flex-wrap items-center justify-end gap-2">
                    <ConfigButtons
                        active={configOpen}
                        onToggle={(key) =>
                            setConfigOpen((cur) => (cur === key ? null : key))
                        }
                        calculatorEnabled={calculator?.enabled ?? false}
                        referenceHasContent={referenceHasContent}
                        settingsWarning={meta.submissionMode === 'locked'}
                    />
                    <span
                        aria-hidden="true"
                        className="mx-1 w-px self-stretch bg-slate-200"
                    />
                    <HeaderButton icon="📄" label="Print view" to="#" />
                    <HeaderButton icon="📊" label="Submissions" to="#" />
                    <HeaderButton icon="📥" label="Import" disabled />
                </div>

                <ConfigDrawer
                    active={configOpen}
                    onClose={() => setConfigOpen(null)}
                    meta={meta}
                    onMetaChange={setMeta}
                    panelEditorKey="dev"
                    panelInitialContent={{
                        type: 'doc',
                        content: [{ type: 'paragraph' }],
                    }}
                    panelTitle={panelTitle}
                    onPanelTitleChange={setPanelTitle}
                    onPanelEditorUpdate={setPanelJson}
                    calculator={calculator}
                    onCalculatorChange={setCalculator}
                />
            </div>
        </main>
    );
}

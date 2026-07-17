import { useEffect, useMemo, useRef, useState } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import {
    mountNumberLineAuthor,
    type NumberLineAuthorHandle,
    type StudentInterval,
} from '@activity/graph-kit';
import { QuestionSettingsSummary } from '../components/QuestionSettings';
import PromptField from '../components/PromptField';
import {
    formatNumberLineInterval,
    parseNumberLineInterval,
} from '../numberLineFormula';
import type { InlineNodes } from '../../lib/serialize';
import { problemNumberAt } from '../problemNumbering';
import {
    defaultNumberLinePointInteraction,
    defaultNumberLineIntervalInteraction,
    type NumberLineConfigAttr,
    type NumberLineInteractionAttr,
    type NumberLineIntervalAttr,
} from '../extensions/NumberLine';

// ============================================================================
// NumberLineView — NodeView for the graded number_line block (1-D). The lean
// sibling of InteractiveGraphView: "what the teacher sees is what the student
// gets" — the author board is the SAME kit board students use (mountNumber-
// LineAuthor). plot_point: drag the handle(s) → correctPoints. plot_interval:
// drag the two ends + the open/closed pills → correctInterval. Numeric fields
// give precise entry; a drag updates them live (and vice versa, via an epoch
// bump that remounts the board only on a typed edit, never mid-drag).
// ============================================================================

type InteractionType = NumberLineInteractionAttr['type'];

const num = (v: string, d: number): number => {
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
};

// Resize a correctPoints array to `count`, spreading new points across the line.
function resizePoints(points: number[], count: number, cfg: NumberLineConfigAttr): number[] {
    if (count <= points.length) return points.slice(0, count);
    const out = points.slice();
    while (out.length < count) {
        // Seed a new point at a tick not already used, else the midpoint.
        const mid = Math.round((cfg.min + cfg.max) / 2);
        out.push(out.includes(mid) ? mid + out.length : mid);
    }
    return out;
}

// The author board — a thin host that mounts mountNumberLineAuthor and reports
// drags back up. Remounts only on config / type / point-count / epoch (a typed
// edit), never on a drag (which would yank the board from the pointer).
function NumberLineAuthorBoard({
    config,
    interaction,
    epoch,
    onPointsChange,
    onIntervalChange,
}: {
    config: NumberLineConfigAttr;
    interaction: NumberLineInteractionAttr;
    epoch: number;
    onPointsChange: (points: number[]) => void;
    onIntervalChange: (interval: StudentInterval) => void;
}) {
    const hostRef = useRef<HTMLDivElement>(null);
    const pointsCb = useRef(onPointsChange);
    pointsCb.current = onPointsChange;
    const intervalCb = useRef(onIntervalChange);
    intervalCb.current = onIntervalChange;

    const count =
        interaction.type === 'plot_point' ? interaction.correctPoints.length : 2;

    // Snapshot the current key values so the mount reads them without becoming a
    // remount trigger on every drag.
    const startRef = useRef(interaction);
    startRef.current = interaction;

    const key = useMemo(
        () => JSON.stringify([config, interaction.type, count, epoch]),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [config.min, config.max, config.tickStep, config.minorTicksPerStep, config.snapToTick, interaction.type, count, epoch],
    );

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return;
        const el = document.createElement('div');
        el.style.cssText = 'position:absolute;inset:0;';
        host.appendChild(el);
        let handle: NumberLineAuthorHandle | null = null;
        let disposed = false;
        const cur = startRef.current;
        void mountNumberLineAuthor(
            el,
            {
                interactionType: cur.type,
                config,
                correctPoints:
                    cur.type === 'plot_point' ? cur.correctPoints : undefined,
                correctInterval:
                    cur.type === 'plot_interval' ? cur.correctInterval : undefined,
            },
            {
                onChange: (pts) => pointsCb.current(pts),
                onIntervalChange: (iv) => intervalCb.current(iv),
            },
        ).then((h) => {
            if (disposed) {
                h.destroy();
                return;
            }
            handle = h;
        });
        return () => {
            disposed = true;
            handle?.destroy();
            host.removeChild(el);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    return (
        <div
            ref={hostRef}
            contentEditable={false}
            style={{ position: 'relative', height: '6rem', border: '1px solid var(--ed-border)', borderRadius: 6, background: '#fff' }}
        />
    );
}

const labelStyle = { fontSize: '0.8rem', color: 'var(--ed-text-secondary)' } as const;

// The interval answer input: type an inequality (e.g. "2 < x <= 5" or "x < -3")
// and the board previews it — mirrors the graph ray. Draft-then-commit on
// blur/Enter; an unparseable entry shows an inline error and keeps the draft.
function IntervalFormulaField({
    value,
    disabled,
    onApply,
}: {
    value: string;
    disabled: boolean;
    onApply: (raw: string) => string | null;
}) {
    const [draft, setDraft] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const shown = draft ?? value;
    const commit = (): void => {
        if (draft === null) return;
        const err = onApply(draft.trim());
        if (err) {
            setError(err);
            return;
        }
        setDraft(null);
        setError(null);
    };
    return (
        <span style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.2rem' }}>
            <input
                type="text"
                value={shown}
                disabled={disabled}
                placeholder="e.g. 2 < x <= 5  ·  x < -3  ·  x >= 0"
                aria-label="Answer inequality"
                spellCheck={false}
                style={{
                    width: '17rem',
                    maxWidth: '100%',
                    padding: '0.25rem 0.4375rem',
                    border: `1px solid ${error ? 'var(--ed-danger-2)' : 'var(--ed-border-strong)'}`,
                    borderRadius: '0.3125rem',
                    background: 'var(--ed-canvas)',
                    color: 'var(--ed-text)',
                    fontSize: '0.8125rem',
                    fontFamily: 'ui-monospace, monospace',
                }}
                onChange={(e) => {
                    setDraft(e.target.value);
                    setError(null);
                }}
                onBlur={commit}
                onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        commit();
                    }
                }}
            />
            {error && (
                <span style={{ fontSize: '0.72rem', color: 'var(--ed-danger-2)' }}>
                    {error}
                </span>
            )}
        </span>
    );
}

export default function NumberLineView({
    node,
    editor,
    getPos,
    updateAttributes,
    selected,
}: NodeViewProps) {
    // Bumped only on a typed edit (numeric field / count / type switch) to
    // remount the board so the handles jump to the typed answer; a drag never
    // bumps it.
    const [epoch, setEpoch] = useState(0);
    const bump = (): void => setEpoch((e) => e + 1);

    const config = node.attrs.config as NumberLineConfigAttr;
    const interaction = node.attrs.interaction as NumberLineInteractionAttr;
    const solution = (node.attrs.solution as InlineNodes | null) ?? [];
    const hasConfidenceRating = Boolean(node.attrs.hasConfidenceRating);
    const isEditable = editor.isEditable;

    const problemNumber = useMemo(
        () =>
            problemNumberAt(
                editor,
                typeof getPos === 'function' ? getPos() : undefined,
            ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [editor.state, getPos],
    );


    // A drag on the board reports the new key — update WITHOUT bumping epoch.
    const onPointsChange = (points: number[]): void => {
        if (interaction.type !== 'plot_point') return;
        updateAttributes({ interaction: { ...interaction, correctPoints: points } });
    };
    const onIntervalChange = (iv: StudentInterval): void => {
        if (interaction.type !== 'plot_interval') return;
        // Guard the schema invariant: at least one bound present. An all-unbounded
        // drag result is ignored (the board can't actually produce it via pills
        // without both ends unbounded, which authors won't do).
        if (iv.min === undefined && iv.max === undefined) return;
        updateAttributes({ interaction: { ...interaction, correctInterval: iv } });
    };

    const switchType = (type: InteractionType): void => {
        if (type === interaction.type) return;
        updateAttributes({
            interaction:
                type === 'plot_interval'
                    ? defaultNumberLineIntervalInteraction()
                    : defaultNumberLinePointInteraction(),
        });
        bump();
    };

    const setPointCount = (n: number): void => {
        if (interaction.type !== 'plot_point') return;
        const count = Math.max(1, Math.min(6, n));
        updateAttributes({
            interaction: {
                ...interaction,
                correctPoints: resizePoints(interaction.correctPoints, count, config),
            },
        });
        bump();
    };
    const setPointValue = (i: number, v: number): void => {
        if (interaction.type !== 'plot_point') return;
        const next = interaction.correctPoints.slice();
        next[i] = v;
        updateAttributes({ interaction: { ...interaction, correctPoints: next } });
        bump();
    };

    // plot_interval numeric editing. The shape (segment / ray →‎ / ray ←‎)
    // mirrors the student's shape pills; a ray is one bound omitted. At least one
    // side must stay bounded.
    const iv: NumberLineIntervalAttr =
        interaction.type === 'plot_interval' ? interaction.correctInterval : {};
    const setInterval = (next: NumberLineIntervalAttr): void => {
        if (interaction.type !== 'plot_interval') return;
        if (next.min === undefined && next.max === undefined) return; // keep 1+ bound
        updateAttributes({ interaction: { ...interaction, correctInterval: next } });
        bump();
    };

    // The interval shape (segment / ray) and open/closed ends are all encoded in
    // the typed inequality now (IntervalFormulaField) — no separate shape pills
    // or bound rows. Dragging the board's ends still updates correctInterval via
    // onIntervalChange, and the formula field re-derives from it.

    return (
        <NodeViewWrapper
            className={`number-line-block${selected ? ' is-selected' : ''}`}
            data-block-id={node.attrs.id ?? ''}
        >
            <div contentEditable={false} style={{ userSelect: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--ed-text-strong)' }}>
                        {problemNumber}. Number line
                    </strong>
                    <label style={labelStyle}>
                        {' '}Type:{' '}
                        <select
                            value={interaction.type}
                            disabled={!isEditable}
                            onChange={(e) => switchType(e.target.value as InteractionType)}
                            onKeyDown={(e) => e.stopPropagation()}
                        >
                            <option value="plot_point">Plot a point</option>
                            <option value="plot_interval">Graph an interval</option>
                        </select>
                    </label>
                </div>
            </div>

            {/* The question prompt sits ABOVE the board (like the graphs). */}
            <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                <span
                    contentEditable={false}
                    style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--ed-faint)' }}
                >
                    Question prompt
                </span>
                <PromptField
                    node={node}
                    className="number-line-block__prompt"
                    placeholder="Type the question…"
                />
            </div>

            <div contentEditable={false} style={{ userSelect: 'none' }}>
                <NumberLineAuthorBoard
                    config={config}
                    interaction={interaction}
                    epoch={epoch}
                    onPointsChange={onPointsChange}
                    onIntervalChange={onIntervalChange}
                />

                <p style={{ margin: '0.35rem 0 0', fontSize: '0.78rem', color: 'var(--ed-text-muted)' }}>
                    {interaction.type === 'plot_point'
                        ? `Drag the ${interaction.correctPoints.length > 1 ? 'points' : 'point'} — or type the ${interaction.correctPoints.length > 1 ? 'values' : 'value'} below.`
                        : 'Type the answer as an inequality below — the shape (segment/ray) and open/closed ends follow from it. Or drag the ends on the line.'}
                </p>

                {interaction.type === 'plot_point' && (
                    <div style={{ marginTop: '0.35rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                        <label style={labelStyle}>
                            Points students plot:{' '}
                            <input
                                type="number"
                                min={1}
                                max={6}
                                value={interaction.correctPoints.length}
                                disabled={!isEditable}
                                style={{ width: '3rem' }}
                                onChange={(e) => setPointCount(Math.trunc(num(e.target.value, 1)))}
                                onKeyDown={(e) => e.stopPropagation()}
                            />
                        </label>
                        {interaction.correctPoints.map((p, i) => (
                            <label key={i} style={labelStyle}>
                                {interaction.correctPoints.length > 1 ? `#${i + 1}: ` : 'Value: '}
                                <input
                                    type="number"
                                    value={p}
                                    disabled={!isEditable}
                                    step="any"
                                    style={{ width: '4rem' }}
                                    onChange={(e) => setPointValue(i, num(e.target.value, p))}
                                    onKeyDown={(e) => e.stopPropagation()}
                                />
                            </label>
                        ))}
                    </div>
                )}

                {interaction.type === 'plot_interval' && (
                    <div style={{ marginTop: '0.35rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'flex-start' }}>
                        <label style={{ ...labelStyle, paddingTop: '0.3rem' }}>Answer:</label>
                        <IntervalFormulaField
                            value={formatNumberLineInterval(iv)}
                            disabled={!isEditable}
                            onApply={(raw) => {
                                const parsed = parseNumberLineInterval(raw);
                                if (!parsed) {
                                    return 'Couldn’t read that — try “2 < x <= 5”, “x < -3”, or “x >= 0”.';
                                }
                                setInterval(parsed);
                                return null;
                            }}
                        />
                    </div>
                )}
            </div>

            <QuestionSettingsSummary
                hasSolution={solution.length > 0}
                hasConfidenceRating={hasConfidenceRating}
                workSpace={null}
            />
        </NodeViewWrapper>
    );
}

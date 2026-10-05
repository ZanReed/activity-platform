// =============================================================================
// FactRunner.tsx — the number-facts runner's screens (D43 slice 1)
// -----------------------------------------------------------------------------
// Intro → warm-up → "Warm-up done" → the facts → done, with the Paused card
// between facts when the page was left. All timing and rules live in
// factRun.ts; this file wires DOM events to it, passing each event's OWN
// timestamp (`event.timeStamp`, the same clock as performance.now()).
//
// The rulings this file carries (docs/design/practice-blocks.md):
//   DR-2/ER-12  no editable input anywhere; ONE focusable answer box owns the
//               keys (the listener is on the runner, never the document); keypad
//               buttons never take focus from a tap; held keys ignored.
//   DR-5        "probe" never renders; students see "Quick number facts".
//   DR-6        the intro states the time in words; no clock anywhere.
//   DR-7/CR-16  large expression, fixed-size answer box, keypad always shown,
//               Skip as a text button away from Enter, no motion.
//   DR-9        a thin unlabelled progress bar; the count is screen-reader only.
//   DR-10       an item paints only after a student action; Paused card.
//   DR-3        done: "You got 24 right. You skipped 2." — never "out of N".
//
// THE SPRINT (D43 slice 2) uses the same screens with `sprint` set: no intro
// (the entry screen is the Start), no progress bar (a bar that fills with the
// time box would be a clock), a strategy card, the feedback card after a miss
// (SP-11), and "Show the strategy" in a strategy-mode family (SP-9).
//
// Lazy: imported only by the /facts routes, so none of this (or practice.css)
// is in the shell.
// =============================================================================

import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { KeyboardEvent, PointerEvent as ReactPointerEvent, MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import { BTN_PRIMARY } from '../components/AuthScreens';
import { answerKeyFromKeyboard, displayAnswer, type AnswerKey } from './answerInput';
import type { Baselines, Modality } from './baseline';
import { FactRun, type AttemptRecord, type ProbeItem, type SprintFamily, type SprintOptions } from './factRun';
import { aboutMinutes } from './minutes';
import './practice.css';

const CARD = 'mx-auto max-w-sm rounded-lg border border-line bg-canvas p-6 text-center shadow-sm';

export { aboutMinutes } from './minutes';

export interface FactRunnerProps {
    items: ProbeItem[];
    ceilingS: number;
    /** Every finished attempt, in order, with the session's typing baselines.
     *  The demo passes none: nothing saved. */
    onAttempt?: (attempt: AttemptRecord, baselines: Baselines) => void;
    /** The run reached the done screen. */
    onDone?: () => void;
    /** Continue a part-saved run (the entry's `resume` state). */
    resume?: { saved: number; nextN: number; baselines: Baselines; counts: { right: number; skipped: number; not_counted: number } };
    /** Run as a daily practice session; `baselines` are the session's own. */
    sprint?: SprintOptions & { baselines: Baselines };
    /** Replaces the done screen's count lines (the sprint's are the server's). */
    doneHeadline?: ReactNode;
    /** The line under the count on the done screen… */
    savedLine: string;
    /** …or, when saving is still settling, what replaces it (DR-14). */
    doneSlot?: ReactNode;
    /** One quiet line under the keypad (DR-14: "Not connected. Keep going…"). */
    notice?: string | null;
    /** The done screen's one button. */
    doneAction: { label: string; onClick: () => void };
    rng?: () => number;
}

export default function FactRunner(props: FactRunnerProps) {
    // The callbacks are read through a ref so a parent re-render never rebuilds
    // the run (and with it the student's progress).
    const callbacks = useRef(props);
    callbacks.current = props;
    const [run] = useState(() => {
        const holder: { run?: FactRun } = {};
        holder.run = new FactRun({
            items: props.items,
            ceilingS: props.ceilingS,
            ...(props.rng ? { rng: props.rng } : {}),
            onAttempt: (attempt) =>
                callbacks.current.onAttempt?.(attempt, holder.run!.baselines),
            ...(props.sprint
                ? {
                      sprint: props.sprint,
                      resume: {
                          index: 0,
                          baselines: props.sprint.baselines,
                          prior: { right: 0, skipped: 0, notCounted: 0 },
                      },
                  }
                : props.resume
                ? {
                      resume: {
                          index: props.resume.nextN - 1,
                          baselines: props.resume.baselines,
                          prior: {
                              right: props.resume.counts.right,
                              skipped: props.resume.counts.skipped,
                              notCounted: props.resume.counts.not_counted,
                          },
                      },
                  }
                : {}),
        });
        return holder.run;
    });
    useSyncExternalStore(run.subscribe, () => run.version);
    const phase = run.phase.kind;
    useEffect(() => {
        if (phase === 'done') callbacks.current.onDone?.();
    }, [phase]);

    if (phase === 'resume') {
        return (
            <Card title="Welcome back">
                <p className="mt-2 text-base text-muted">
                    You have done {props.resume?.saved ?? 0} of {run.items.length}. Your answers so
                    far are saved.
                </p>
                <button type="button" className={`mt-4 w-full ${BTN_PRIMARY}`} onClick={() => run.proceed()} autoFocus>
                    Keep going
                </button>
            </Card>
        );
    }

    if (phase === 'intro') {
        return (
            <Card title="Quick number facts">
                <p className="mt-2 text-base text-strong">
                    {run.partCount > 1
                        ? `Two parts, with a break between them. Part 1 is ${aboutMinutes(run.partSize(1)).toLowerCase()}.`
                        : `${aboutMinutes(run.items.length)}.`}
                </p>
                <p className="mt-2 text-base text-muted">
                    It is not marked, and nobody else in the class sees your answers. Answer each
                    one as quickly as you comfortably can. If you do not know one, press Skip.
                    Nothing tells you right or wrong as you go.
                </p>
                <p className="mt-2 text-base text-muted">
                    You can type on your keyboard or tap the number keys on the screen, whichever
                    you are more comfortable with. Stick with the one you start with.
                </p>
                <p className="mt-2 text-base text-muted">
                    Your teacher uses the class&apos;s results to plan warm-ups, and sees which
                    facts you know straight away and which take longer.
                </p>
                <button type="button" className={`mt-4 w-full ${BTN_PRIMARY}`} onClick={() => run.begin()}>
                    Start
                </button>
            </Card>
        );
    }
    if (phase === 'warmupDone') {
        return (
            <Card title="Warm-up done">
                <p className="mt-2 text-base text-muted">Now the number facts.</p>
                <button type="button" className={`mt-4 w-full ${BTN_PRIMARY}`} onClick={() => run.proceed()} autoFocus>
                    Start
                </button>
            </Card>
        );
    }
    if (phase === 'partBreak') {
        const nextPart = run.currentPart;
        return (
            <Card title={`Part ${nextPart - 1} done`}>
                <p className="mt-2 text-base text-muted">
                    Take a break. Your answers so far are saved. You can do Part {nextPart} now, or
                    come back to this page another day.
                </p>
                <p className="mt-2 text-base text-muted">
                    Part {nextPart} is {aboutMinutes(run.partSize(nextPart)).toLowerCase()}.
                </p>
                <button type="button" className={`mt-4 w-full ${BTN_PRIMARY}`} onClick={() => run.proceed()}>
                    Start Part {nextPart}
                </button>
            </Card>
        );
    }
    if (phase === 'strategy') {
        const family = run.shownStrategy;
        return family ? <StrategyCard family={family} onDone={() => run.proceed()} /> : null;
    }
    if (run.phase.kind === 'feedback') {
        const item = run.phase.item;
        return (
            <Card title="Not this time">
                <p className="fx-feedback" data-testid="fx-feedback">
                    {item.display.replace('__', displayAnswer(item.answer))}
                </p>
                <p className="fx-sr">The answer is {displayAnswer(item.answer)}.</p>
                <p className="mt-2 text-base text-muted">Have a look, then carry on. It will come up again.</p>
                <button type="button" className={`mt-4 w-full ${BTN_PRIMARY}`} onClick={() => run.proceed()} autoFocus>
                    Next
                </button>
                {run.feedbackStrategy ? (
                    <button type="button" className="fx-skip mt-2" onClick={(e) => run.openStrategy(e.timeStamp)}>
                        Show the strategy
                    </button>
                ) : null}
            </Card>
        );
    }
    if (phase === 'paused') {
        return (
            <Card title="Paused">
                <p className="mt-2 text-base text-muted">
                    You left this page for a moment, so that fact will not be counted. Nothing is
                    lost.
                </p>
                <button type="button" className={`mt-4 w-full ${BTN_PRIMARY}`} onClick={() => run.proceed()} autoFocus>
                    Keep going
                </button>
            </Card>
        );
    }
    if (phase === 'done') {
        const { right, skipped, notCounted } = run.summary();
        return (
            <Card title="All done">
                {props.doneHeadline ?? (
                    <>
                        <p className="mt-2 text-base text-strong">
                            You got {right} right.{skipped > 0 ? ` You skipped ${skipped}.` : ''}
                        </p>
                        {notCounted > 0 ? (
                            <p className="mt-2 text-base text-muted">
                                {notCounted} {notCounted === 1 ? 'was' : 'were'} not counted because
                                you left the page.
                            </p>
                        ) : null}
                    </>
                )}
                {props.doneSlot ?? <p className="mt-2 text-base text-muted">{props.savedLine}</p>}
                <button type="button" className={`mt-4 w-full ${BTN_PRIMARY}`} onClick={props.doneAction.onClick} autoFocus>
                    {props.doneAction.label}
                </button>
            </Card>
        );
    }
    return <RunnerScreen run={run} notice={props.notice ?? null} />;
}

/** A fact family's strategy, laid out from the registry's plain fields
 *  (intro, labelled lines, an example): no markup comes from the registry. */
function StrategyCard({ family, onDone }: { family: SprintFamily; onDone: () => void }) {
    const strategy = family.strategy!;
    return (
        <div className={`${CARD} fx-strategy`} data-testid="fx-strategy">
            <p className="text-sm font-semibold text-muted">A strategy for</p>
            <h1 className="text-2xl font-bold text-ink">{family.name}</h1>
            {strategy.intro ? <p className="mt-3 text-base text-strong">{strategy.intro}</p> : null}
            {strategy.lines.length > 0 ? (
                <ul className="fx-strategy-lines">
                    {strategy.lines.map((line, i) => (
                        <li key={i}>
                            {line.label ? <strong>{line.label}: </strong> : null}
                            {line.text}
                        </li>
                    ))}
                </ul>
            ) : null}
            {strategy.example ? (
                <p className="mt-3 text-base text-strong">
                    <span className="text-muted">For example: </span>
                    {strategy.example}
                </p>
            ) : null}
            <button type="button" className={`mt-4 w-full ${BTN_PRIMARY}`} onClick={onDone} autoFocus>
                Got it
            </button>
        </div>
    );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className={CARD}>
            <h1 className="text-2xl font-bold text-ink">{title}</h1>
            {children}
        </div>
    );
}

// ---- the warm-up and the facts --------------------------------------------------

function RunnerScreen({ run, notice }: { run: FactRun; notice: string | null }) {
    const warmup = run.phase.kind === 'warmup';
    const trial = run.currentTrial;
    const item = run.currentItem;
    const answerRef = useRef<HTMLDivElement>(null);
    const exprRef = useRef<HTMLParagraphElement>(null);
    const key = warmup ? `w${run.trialIndex}` : `i${run.itemIndex}`;

    // The clock starts when the thing on screen is painted: the next frame
    // after it was committed (DR-10: this screen exists only because of a
    // student action). The answer box takes focus for each one (DR-2).
    //
    // The timer is a FALLBACK, not a second clock: painted() keeps the first
    // call. A browser that skips frames for an occluded-but-"visible" window
    // (a covered Chromebook split screen; seen here in a hidden preview pane,
    // 2026-10-05) would otherwise never start the clock, and Enter would be
    // ignored with nothing on screen saying why.
    useLayoutEffect(() => {
        answerRef.current?.focus({ preventScroll: true });
        // Mounted while the page is already hidden: nothing was seen, so no
        // clock starts (factRun shows the Paused card and keeps this fact).
        if (document.visibilityState === 'hidden') {
            run.interrupt(performance.now());
            return;
        }
        const frame = requestAnimationFrame((t) => run.painted(t));
        const fallback = window.setTimeout(() => run.painted(performance.now()), 100);
        return () => {
            cancelAnimationFrame(frame);
            window.clearTimeout(fallback);
        };
    }, [run, key]);

    // The expression SHRINKS TO FIT and never wraps (CR-21): a prompt is an
    // authored string and can be long ("3/4 = __ as a decimal" was cut off at
    // desktop width — author finding 2026-10-05). Measured before paint, so
    // the student never sees the oversized frame; re-measured on resize.
    useLayoutEffect(() => {
        const fit = () => {
            const el = exprRef.current;
            if (!el) return;
            el.style.fontSize = '';
            // Scale by the measured ratio with a 2% margin, and re-measure:
            // widths are whole pixels, so one pass can land a pixel over.
            for (let pass = 0; pass < 4 && el.scrollWidth > el.clientWidth; pass++) {
                const px = parseFloat(getComputedStyle(el).fontSize);
                el.style.fontSize = `${Math.floor(((px * el.clientWidth) / el.scrollWidth) * 98) / 100}px`;
            }
        };
        fit();
        window.addEventListener('resize', fit);
        return () => window.removeEventListener('resize', fit);
    }, [key]);

    // Hidden page or lost focus: the fact is interrupted (DR-10).
    useEffect(() => {
        const onHidden = () => {
            if (document.visibilityState === 'hidden') run.interrupt(performance.now());
        };
        const onBlur = () => run.interrupt(performance.now());
        document.addEventListener('visibilitychange', onHidden);
        window.addEventListener('blur', onBlur);
        return () => {
            document.removeEventListener('visibilitychange', onHidden);
            window.removeEventListener('blur', onBlur);
        };
    }, [run]);

    // "Stuck? Skip is fine." once net time reaches the ceiling (CR-11).
    useEffect(() => {
        if (warmup) return;
        const timer = window.setInterval(() => run.tick(performance.now()), 500);
        return () => window.clearInterval(timer);
    }, [run, warmup, key]);

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        // A focused button answers only to its own Enter or Space (DR-2).
        if ((event.target as HTMLElement).closest('button')) return;
        if (event.key === 'Enter') {
            event.preventDefault();
            run.enter('keyboard', event.timeStamp, event.repeat);
            return;
        }
        const k = answerKeyFromKeyboard(event.key);
        if (!k) return;
        event.preventDefault();
        run.key(k, 'keyboard', event.timeStamp, event.repeat);
    };

    // A tap on blank space returns focus to the answer box.
    const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (!(event.target as HTMLElement).closest('button')) {
            event.preventDefault();
            answerRef.current?.focus({ preventScroll: true });
        }
    };

    const shown = warmup ? displayAnswer(trial?.target ?? '') : item?.display ?? '';
    const progress = run.progress;
    const hint = hintText(run, warmup);

    return (
        <div className="fx-runner" onKeyDown={onKeyDown} onPointerDown={onPointerDown}>
            <div>
                {warmup || run.sprint ? null : (
                    <>
                        <div className="fx-bar" aria-hidden="true">
                            <span style={{ width: `${(progress.done / progress.total) * 100}%` }} />
                        </div>
                        <p className="fx-sr">
                            {progress.done + 1} of {progress.total}
                        </p>
                    </>
                )}
                <p ref={exprRef} className="fx-expr" aria-hidden="true">
                    {shown}
                </p>
                {/* Announced once per item, in its spoken form. */}
                <p className="fx-sr" aria-live="polite">
                    {warmup ? `Type ${shown}` : item?.spoken}
                </p>
                <div
                    ref={answerRef}
                    className="fx-answer"
                    tabIndex={0}
                    role="group"
                    aria-label={warmup ? 'Type the number shown' : 'Your answer'}
                    data-testid="fx-answer"
                >
                    {displayAnswer(run.answer)}
                </div>
                <p className="fx-sr" aria-live="polite">
                    {run.answer ? displayAnswer(run.answer) : ''}
                </p>
                <p className="fx-hint" aria-live="polite">
                    {hint}
                </p>
            </div>
            <div>
                <Keypad run={run} />
                {warmup ? null : (
                    <div className="fx-skiprow">
                        <button type="button" className="fx-skip" onClick={(e) => run.skip(e.timeStamp)}>
                            Skip this one
                        </button>
                        {run.reopenableStrategy ? (
                            <button type="button" className="fx-skip" onClick={(e) => run.openStrategy(e.timeStamp)}>
                                Show the strategy
                            </button>
                        ) : null}
                    </div>
                )}
                <p className="fx-savenote" aria-live="polite">
                    {notice ?? ''}
                </p>
            </div>
        </div>
    );
}

function hintText(run: FactRun, warmup: boolean): string {
    const h = run.hint;
    if (h && typeof h === 'object') return `Type ${displayAnswer(h.retype)}`;
    if (h === 'empty') return warmup ? 'Type the number, then press Enter.' : 'Type an answer, or press Skip.';
    if (h === 'stuck') return 'Stuck? Skip is fine.';
    if (warmup && run.trialIndex === 0) {
        return 'Type the number you see, then press Enter. Keyboard or the keys below: stick with whichever you start with.';
    }
    return '';
}

// ---- the keypad (CR-16, DR-8: calculator order) ----------------------------------

const PAD: (string | null)[][] = [
    ['7', '8', '9', 'back'],
    ['4', '5', '6', null],
    ['1', '2', '3', null],
    ['minus', '0', 'point', null],
];

function Keypad({ run }: { run: FactRun }) {
    const uses = (special: 'minus' | 'point') => run.specials.includes(special);

    const press = useCallback(
        (k: AnswerKey, source: Modality, t: number) => run.key(k, source, t),
        [run],
    );

    // A key registers on pointer-down (and never takes focus from a tap); a
    // keyboard activation of a FOCUSED key (Enter or Space) arrives as a click
    // with detail 0 and registers there instead, as a keyboard keystroke.
    const keyProps = (k: AnswerKey) => ({
        onPointerDown: (e: ReactPointerEvent<HTMLButtonElement>) => {
            e.preventDefault();
            press(k, 'keypad', e.timeStamp);
        },
        onClick: (e: ReactMouseEvent<HTMLButtonElement>) => {
            if (e.detail === 0) press(k, 'keyboard', e.timeStamp);
        },
    });

    return (
        <div className="fx-pad">
            {PAD.flatMap((row, r) =>
                row.map((cell, c) => {
                    if (cell === null) return null;
                    const id = `${r}-${c}`;
                    if (cell === 'back') {
                        return (
                            <button key={id} type="button" aria-label="Delete" {...keyProps({ kind: 'back' })}>
                                ⌫
                            </button>
                        );
                    }
                    if (cell === 'minus' || cell === 'point') {
                        if (!uses(cell)) return <span key={id} className="fx-blank" aria-hidden="true" />;
                        return (
                            <button
                                key={id}
                                type="button"
                                aria-label={cell === 'minus' ? 'Negative sign' : 'Decimal point'}
                                {...keyProps({ kind: cell })}
                            >
                                {cell === 'minus' ? '−' : '.'}
                            </button>
                        );
                    }
                    return (
                        <button key={id} type="button" {...keyProps({ kind: 'digit', digit: cell })}>
                            {cell}
                        </button>
                    );
                }),
            )}
            <button
                type="button"
                className="fx-enter"
                // The submit key registers on click (DR-2): a tap that slides
                // off it does not submit.
                onPointerDown={(e) => e.preventDefault()}
                onClick={(e) => run.enter(e.detail === 0 ? 'keyboard' : 'keypad', e.timeStamp)}
            >
                Enter
            </button>
        </div>
    );
}

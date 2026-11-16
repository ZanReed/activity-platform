// @vitest-environment jsdom
// "Ask my teacher" (S9, migration 0090, docs/design/ask-my-teacher.md): the
// student's button and its words, the teacher strip's polling, and the RPC
// wrappers' mapping. SQL behaviour is verify-0090's, not this file's.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react';

const net = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock('../lib/supabase', () => ({ supabase: { rpc: net.rpc } }));

import AskTeacher from '../components/AskTeacher';
import { NO_HELP, fetchHelpState, type HelpState } from '../lib/helpRequests';
import { askErrorWords, askTeacher } from '../lib/helpRequestsAsk';
import { fetchClassHelp, waitedWords } from '../lib/classHelp';
import { HELP_POLL_MS, HelpStrip, useClassHelp } from '../progress/HelpStrip';

const state = (over: Partial<{ open: string[]; done: string[] }> = {}): HelpState => ({
    canAsk: true,
    open: new Set(over.open ?? []),
    done: new Set(over.done ?? []),
});
const reply = (open: string[] = [], done: string[] = []) => ({ data: { can_ask: true, open, done }, error: null });

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.useRealTimers();
});

describe('the student button (ST-7, ST-9)', () => {
    it('asks, then offers "I’ve got it now" on the SAME button, focus kept, never disabled mid-call', async () => {
        let resolve!: (v: unknown) => void;
        net.rpc.mockImplementationOnce(() => new Promise((r) => { resolve = r; }));
        const onState = vi.fn();
        const { rerender } = render(<AskTeacher versionId="v1" sectionId="s1" state={state()} onState={onState} />);
        const button = screen.getByRole('button', { name: 'Ask my teacher' });
        button.focus();
        fireEvent.click(button);
        // In flight: still focusable (aria-disabled, not disabled), and a second press sends nothing.
        expect((button as HTMLButtonElement).disabled).toBe(false);
        expect(button.getAttribute('aria-disabled')).toBe('true');
        fireEvent.click(button);
        expect(net.rpc).toHaveBeenCalledTimes(1);
        expect(net.rpc).toHaveBeenCalledWith('ask_teacher', { p_version_id: 'v1', p_section_id: 's1' });
        await act(async () => resolve(reply(['s1'])));
        expect([...onState.mock.calls[0]![0].open]).toEqual(['s1']);
        rerender(<AskTeacher versionId="v1" sectionId="s1" state={state({ open: ['s1'] })} onState={onState} />);
        const after = screen.getByRole('button', { name: 'I’ve got it now' });
        expect(after).toBe(button);
        expect(document.activeElement).toBe(after);
        expect(screen.getByText('Asked. Your teacher can see this.')).toBeTruthy();
        expect(document.body.textContent).not.toMatch(/will come|on (her|his|their) way/);
    });

    it('withdraws from the asked state, and says so', async () => {
        net.rpc.mockResolvedValueOnce(reply());
        const onState = vi.fn();
        const { rerender } = render(<AskTeacher versionId="v1" sectionId="s1" state={state({ open: ['s1'] })} onState={onState} />);
        fireEvent.click(screen.getByRole('button', { name: 'I’ve got it now' }));
        await act(async () => {});
        expect(net.rpc).toHaveBeenCalledWith('withdraw_help', { p_version_id: 'v1', p_section_id: 's1' });
        rerender(<AskTeacher versionId="v1" sectionId="s1" state={state()} onState={onState} />);
        expect(screen.getByText('OK, you’re not asking now.')).toBeTruthy();
    });

    it('says when the teacher marked it done, and can ask again', () => {
        render(<AskTeacher versionId="v1" sectionId="s1" state={state({ done: ['s1'] })} onState={vi.fn()} />);
        expect(screen.getByText('Your teacher marked this done.')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Ask my teacher' })).toBeTruthy();
    });

    it('a refused ask says why, in a student’s words, and never "try again" when that cannot work', async () => {
        net.rpc.mockResolvedValueOnce({ data: null, error: { message: 'rate_limited' } });
        render(<AskTeacher versionId="v1" sectionId="s1" state={state()} onState={vi.fn()} />);
        fireEvent.click(screen.getByRole('button', { name: 'Ask my teacher' }));
        expect(await screen.findByText('You’ve asked a lot today. Put your hand up instead.')).toBeTruthy();
        expect(askErrorWords('not_available')).toBe('This page is out of date. Reload it, then ask.');
        expect(askErrorWords('network down')).toBe('That didn’t send. Try again, or put your hand up.');
    });
});

describe('the wrappers', () => {
    it('map the student state and send the version and section only (ST-3: never a class)', async () => {
        net.rpc.mockResolvedValue(reply(['s2']));
        const s = await askTeacher('v1', 's2');
        expect(net.rpc).toHaveBeenCalledWith('ask_teacher', { p_version_id: 'v1', p_section_id: 's2' });
        expect(s.canAsk).toBe(true);
        expect([...s.open]).toEqual(['s2']);
        net.rpc.mockResolvedValue({ data: null, error: null });
        expect(await fetchHelpState('v1')).toBe(NO_HELP);
    });

    it('map the teacher list', async () => {
        net.rpc.mockResolvedValue({
            data: { on: true, requests: [{ id: 'h1', student_id: 's1', name: 'Ana', activity_id: 'a1',
                activity_title: 'Fractions', section_label: 'Section 2', created_at: '2027-02-09T09:30:00Z' }] },
            error: null,
        });
        const h = await fetchClassHelp('c1');
        expect(h.requests[0]).toEqual({ id: 'h1', studentId: 's1', name: 'Ana', activityId: 'a1',
            activityTitle: 'Fractions', sectionLabel: 'Section 2', createdAt: '2027-02-09T09:30:00Z' });
    });

    it('say how long a hand has been up', () => {
        const now = new Date('2027-02-09T10:00:00Z');
        expect(waitedWords('2027-02-09T09:59:40Z', now)).toBe('just now');
        expect(waitedWords('2027-02-09T09:56:00Z', now)).toBe('4 min');
        expect(waitedWords('2027-02-09T08:55:00Z', now)).toBe('1 h 5 min');
        expect(waitedWords('2027-02-09T08:00:00Z', now)).toBe('2 h');
        expect(waitedWords('not a date', now)).toBe('');
    });
});

describe('the strip after Done', () => {
    const req = (id: string, name: string) => ({ id, studentId: `st-${id}`, name, activityId: 'a', activityTitle: 'T',
        sectionLabel: 'S', createdAt: '2027-02-09T09:30:00Z' });
    it('moves focus to the next Done, never the body', async () => {
        const two = { on: true, requests: [req('h1', 'Ana'), req('h2', 'Ben')] };
        const onDone = vi.fn(async () => {});
        const { rerender } = render(<HelpStrip help={two} onDone={onDone} nameOf={(_, n) => n} />);
        fireEvent.click(screen.getByRole('button', { name: 'Done: Ana, T' }));
        await act(async () => {});
        rerender(<HelpStrip help={{ on: true, requests: [req('h2', 'Ben')] }} onDone={onDone} nameOf={(_, n) => n} />);
        expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Done: Ben, T' }));
        expect(document.querySelector('[data-help-live]')!.textContent).toBe('1 asking for you');
    });
});

describe('the teacher strip polls (ST-6)', () => {
    let visibility: DocumentVisibilityState = 'visible';
    beforeEach(() => {
        visibility = 'visible';
        vi.spyOn(document, 'visibilityState', 'get').mockImplementation(() => visibility);
        vi.useFakeTimers();
    });

    const reads = () => net.rpc.mock.calls.filter((c) => c[0] === 'class_help_open').length;

    it('every 15 s while visible and on; not while hidden; again on return', async () => {
        net.rpc.mockResolvedValue({ data: { on: true, requests: [] }, error: null });
        renderHook(() => useClassHelp('c1'));
        await act(async () => {});
        expect(reads()).toBe(1);
        await act(async () => {
            vi.advanceTimersByTime(HELP_POLL_MS);
        });
        expect(reads()).toBe(2);
        visibility = 'hidden';
        await act(async () => {
            document.dispatchEvent(new Event('visibilitychange'));
            vi.advanceTimersByTime(HELP_POLL_MS * 3);
        });
        expect(reads()).toBe(2);
        visibility = 'visible';
        await act(async () => {
            document.dispatchEvent(new Event('visibilitychange'));
        });
        expect(reads()).toBe(3);
    });

    it('a failed first read is retried by the next tick, not given up on', async () => {
        net.rpc.mockResolvedValueOnce({ data: null, error: { message: 'offline' } });
        net.rpc.mockResolvedValue({ data: { on: true, requests: [] }, error: null });
        const { result } = renderHook(() => useClassHelp('c1'));
        await act(async () => {});
        expect(result.current.help).toBeNull();
        await act(async () => {
            vi.advanceTimersByTime(HELP_POLL_MS);
        });
        expect(result.current.help).toEqual({ on: true, requests: [] });
    });

    it('a poll that left before Done never puts the hand back up', async () => {
        const up = { on: true, requests: [{ id: 'h1', student_id: 's', name: 'A', activity_id: 'a',
            activity_title: 'T', section_label: 'S', created_at: '2027-02-09T09:30:00Z' }] };
        net.rpc.mockResolvedValueOnce({ data: up, error: null });
        const { result } = renderHook(() => useClassHelp('c1'));
        await act(async () => {});
        let slow!: (v: unknown) => void;
        net.rpc.mockImplementationOnce(() => new Promise((r) => { slow = r; }));
        await act(async () => {
            vi.advanceTimersByTime(HELP_POLL_MS); // a poll leaves, slowly
        });
        net.rpc.mockResolvedValueOnce({ data: { on: true, requests: [] }, error: null });
        await act(async () => {
            await result.current.done('h1');
        });
        expect(result.current.help?.requests).toHaveLength(0);
        await act(async () => slow({ data: up, error: null }));
        expect(result.current.help?.requests).toHaveLength(0);
    });

    it('not at all when the switch is off and nobody is asking', async () => {
        net.rpc.mockResolvedValue({ data: { on: false, requests: [] }, error: null });
        renderHook(() => useClassHelp('c1'));
        await act(async () => {});
        await act(async () => {
            vi.advanceTimersByTime(HELP_POLL_MS * 4);
        });
        expect(reads()).toBe(1);
    });

    it('Done ends one request and shows what the server returns', async () => {
        net.rpc.mockResolvedValueOnce({
            data: { on: true, requests: [{ id: 'h1', student_id: 's', name: 'A', activity_id: 'a',
                activity_title: 'T', section_label: 'S', created_at: '2027-02-09T09:30:00Z' }] },
            error: null,
        });
        const { result } = renderHook(() => useClassHelp('c1'));
        await act(async () => {});
        expect(result.current.help?.requests).toHaveLength(1);
        net.rpc.mockResolvedValueOnce({ data: { on: true, requests: [] }, error: null });
        await act(async () => {
            await result.current.done('h1');
        });
        expect(net.rpc).toHaveBeenCalledWith('end_help', { p_request_id: 'h1' });
        expect(result.current.help?.requests).toHaveLength(0);
    });
});

// @vitest-environment jsdom
// GUI sweep item 8 (ruled 2026-11-13): a DoL rubric's lines carry a level, in
// the teacher's own words — suggestions come from the activity, never a fixed
// A/M/E list (ruling 8b).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import RubricEditor from '../editor/components/RubricEditor';
import type { Rubric } from '@activity/schema';

const rubric: Rubric = {
    criteria: [
        { id: '11111111-1111-4111-8111-111111111111', label: 'Finds the rate', maxPoints: 2, level: 'A' },
        { id: '22222222-2222-4222-8222-222222222222', label: 'Explains', maxPoints: 2 },
    ],
};

afterEach(cleanup);

describe('rubric levels', () => {
    it('outside a DoL there is no level field', () => {
        render(<RubricEditor rubric={rubric} isEditable onChange={() => {}} />);
        expect(screen.queryAllByLabelText('Level this line shows')).toHaveLength(0);
    });

    it('in a DoL each line has one, suggesting the activity\'s own levels', () => {
        const { container } = render(
            <RubricEditor rubric={rubric} isEditable onChange={() => {}} showLevels knownLevels={['Pass', 'A']} />,
        );
        const fields = screen.getAllByLabelText('Level this line shows') as HTMLInputElement[];
        expect(fields.map((f) => f.value)).toEqual(['A', '']);
        const options = [...container.querySelectorAll('datalist option')].map((o) => o.getAttribute('value'));
        expect(options).toEqual(['Pass', 'A']);
        expect(fields[0]!.maxLength).toBe(8);
    });

    it('typing sets the level in the teacher\'s words; emptying removes it', () => {
        const onChange = vi.fn();
        render(<RubricEditor rubric={rubric} isEditable onChange={onChange} showLevels />);
        const fields = screen.getAllByLabelText('Level this line shows');
        fireEvent.change(fields[1]!, { target: { value: 'Merit' } });
        expect(onChange.mock.calls.at(-1)![0].criteria[1].level).toBe('Merit');
        fireEvent.change(fields[0]!, { target: { value: '' } });
        expect(onChange.mock.calls.at(-1)![0].criteria[0].level).toBeUndefined();
    });
});

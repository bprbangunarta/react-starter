import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Field } from '@/components/ui/field';

function Harness({ initial = null, prefix }: { initial?: number | null; prefix?: string | null }) {
    const [value, setValue] = useState<number | null>(initial);

    return (
        <>
            <Field label="Nominal">
                <CurrencyInput value={value} onValueChange={setValue} prefix={prefix} />
            </Field>
            <output data-testid="value">{value === null ? 'null' : String(value)}</output>
        </>
    );
}

describe('CurrencyInput', () => {
    it('formats digits with thousands separators and keeps a plain number as the value', async () => {
        render(<Harness />);
        await userEvent.type(screen.getByLabelText('Nominal'), '1000000');

        expect(screen.getByLabelText('Nominal')).toHaveValue('1.000.000');
        expect(screen.getByTestId('value')).toHaveTextContent('1000000');
    });

    it('ignores letters and symbols', async () => {
        render(<Harness />);
        await userEvent.type(screen.getByLabelText('Nominal'), 'a1b2,c3-');

        expect(screen.getByLabelText('Nominal')).toHaveValue('123');
    });

    it('becomes null when cleared and strips leading zeros', async () => {
        render(<Harness initial={5} />);
        const input = screen.getByLabelText('Nominal');
        await userEvent.clear(input);
        expect(screen.getByTestId('value')).toHaveTextContent('null');

        await userEvent.type(input, '007');
        expect(input).toHaveValue('7');
    });

    it('shows the Rp prefix unless it is turned off', () => {
        const { unmount } = render(<Harness initial={1000} />);
        expect(screen.getByText('Rp')).toBeInTheDocument();
        unmount();

        render(<Harness initial={1000} prefix={null} />);
        expect(screen.queryByText('Rp')).not.toBeInTheDocument();
    });
});

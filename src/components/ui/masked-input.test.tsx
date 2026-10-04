import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { Field } from '@/components/ui/field';
import { MaskedInput } from '@/components/ui/masked-input';
import { MASKS } from '@/lib/mask';

function Harness() {
    const [raw, setRaw] = useState('');

    return (
        <>
            <Field label="Telepon">
                <MaskedInput mask={MASKS.phone} value={raw} onValueChange={setRaw} />
            </Field>
            <output data-testid="raw">{raw}</output>
        </>
    );
}

describe('MaskedInput', () => {
    it('masks while typing and reports the unmasked value', async () => {
        render(<Harness />);
        await userEvent.type(screen.getByLabelText('Telepon'), '0812x3456 7890');

        expect(screen.getByLabelText('Telepon')).toHaveValue('0812-3456-7890');
        expect(screen.getByTestId('raw')).toHaveTextContent('081234567890');
    });

    it('deletes the digit before a literal when backspace lands right after it', async () => {
        render(<Harness />);
        const input = screen.getByLabelText('Telepon');
        await userEvent.type(input, '08123');
        expect(input).toHaveValue('0812-3');

        await userEvent.keyboard('{ArrowLeft}{Backspace}');
        expect(input).toHaveValue('0813');
    });

    it('removes trailing digits one by one', async () => {
        render(<Harness />);
        const input = screen.getByLabelText('Telepon');
        await userEvent.type(input, '08123');
        await userEvent.keyboard('{Backspace}{Backspace}');

        expect(input).toHaveValue('081');
    });
});

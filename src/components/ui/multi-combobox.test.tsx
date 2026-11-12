import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { beforeAll, describe, expect, it } from 'vitest';
import { MultiCombobox } from '@/components/ui/multi-combobox';

const options = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta' },
    { value: 'c', label: 'Gamma' },
];

function Harness() {
    const [value, setValue] = useState<string[]>([]);

    return <MultiCombobox aria-label="Huruf" options={options} value={value} onChange={setValue} clearable />;
}

describe('MultiCombobox', () => {
    beforeAll(() => {
        // jsdom has no layout, so it does not implement scrollIntoView.
        Element.prototype.scrollIntoView = () => undefined;
    });

    it('selects several options, keeps the list open, and clears them all', async () => {
        const user = userEvent.setup();
        render(<Harness />);

        await user.click(screen.getByRole('combobox', { name: 'Huruf' }));
        await user.click(screen.getByRole('option', { name: 'Gamma' }));
        await user.click(screen.getByRole('option', { name: 'Alpha' }));

        expect(screen.getByRole('option', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true');
        expect(screen.getByRole('combobox', { name: 'Huruf' })).toHaveTextContent('Alpha, Gamma');

        await user.click(screen.getByRole('option', { name: 'Alpha' }));
        expect(screen.getByRole('combobox', { name: 'Huruf' })).toHaveTextContent('Gamma');

        await user.click(screen.getByRole('button', { name: 'Hapus semua pilihan' }));
        expect(screen.getByRole('combobox', { name: 'Huruf' })).toHaveTextContent('Pilih…');
    });
});

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

describe('Field', () => {
    it('connects the label to the control', () => {
        render(
            <Field label="Nama" required>
                <Input />
            </Field>,
        );

        expect(screen.getByLabelText(/Nama/)).toBeInTheDocument();
    });

    it('connects the error to the control and marks it invalid', () => {
        render(
            <Field label="Nama" error="Wajib diisi.">
                <Input />
            </Field>,
        );
        const input = screen.getByLabelText('Nama');

        expect(input).toHaveAttribute('aria-invalid', 'true');
        expect(input).toHaveAccessibleDescription('Wajib diisi.');
    });

    it('connects the hint as the description when there is no error', () => {
        render(
            <Field label="Nama" hint="Minimal 3 huruf">
                <Input />
            </Field>,
        );

        expect(screen.getByLabelText('Nama')).toHaveAccessibleDescription('Minimal 3 huruf');
    });
});

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageHeader } from '@/components/ui/misc';

describe('PageHeader', () => {
    it('puts the action buttons of the row in equal-width columns, so a pair never looks uneven', () => {
        render(
            <PageHeader
                title="Audit Logs"
                actions={
                    <>
                        <button type="button">Periksa integritas</button>
                        <button type="button">Ekspor CSV</button>
                    </>
                }
            />,
        );
        const row = screen.getByRole('button', { name: 'Ekspor CSV' }).parentElement;

        expect(row).toHaveClass('grid', 'sm:auto-cols-fr', 'sm:grid-flow-col');
        // On a phone: the full width in two equal columns, like the filters.
        expect(row).toHaveClass('w-full', 'grid-cols-2');
        expect(row?.children).toHaveLength(2);
    });

    it('shows the title and the description', () => {
        render(<PageHeader title="Audit Logs" description="Catatan anti-rusak" />);

        expect(screen.getByRole('heading', { level: 1, name: 'Audit Logs' })).toBeInTheDocument();
        expect(screen.getByText('Catatan anti-rusak')).toBeInTheDocument();
    });
});

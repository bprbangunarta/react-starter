import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DataTable } from '@/components/ui/data-table';
import type { Column } from '@/components/ui/data-table';

type Row = { id: number; name: string; amount: number };
const rows: Row[] = [
    { id: 1, name: 'Beta', amount: 5 },
    { id: 2, name: 'Alfa', amount: 9 },
];
const columns: Column<Row>[] = [
    { key: 'name', header: 'Nama', cell: (r) => r.name, sort: 'name' },
    { key: 'amount', header: 'Nilai', cell: (r) => r.amount, sort: 'amount' },
    { key: 'note', header: 'Catatan', cell: () => '–', sort: 'note' },
];

afterEach(() => {
    vi.restoreAllMocks();
});

describe('DataTable sorting', () => {
    it('gives every column with data a header button, and leaves a column of row actions plain', () => {
        const withActions: Column<Row>[] = [...columns, { key: 'actions', header: 'Aksi', srOnly: true, cell: () => '…' }];
        render(
            <DataTable
                empty={{ icon: null, title: 'Kosong' }}
                rows={rows}
                rowKey={(r) => r.id}
                columns={withActions}
                sort={{ sort: 'name', direction: 'asc', onSort: () => undefined }}
            />,
        );

        expect(screen.getByRole('button', { name: 'Nama' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Nilai' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Catatan' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Aksi' })).not.toBeInTheDocument();
    });

    it('warns while developing when a sorting table has a column with data that cannot sort', () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const partial: Column<Row>[] = [...columns.slice(0, 2), { key: 'note', header: 'Catatan', cell: () => '–' }];
        render(
            <DataTable
                empty={{ icon: null, title: 'Kosong' }}
                rows={rows}
                rowKey={(r) => r.id}
                columns={partial}
                sort={{ sort: 'name', direction: 'asc', onSort: () => undefined }}
            />,
        );

        expect(error).toHaveBeenCalledWith(expect.stringContaining('no "sort" key on: note'));
    });

    it('writes the header in the smallest text size, uppercase', () => {
        const { container } = render(
            <DataTable
                empty={{ icon: null, title: 'Kosong' }}
                rows={rows}
                rowKey={(r) => r.id}
                columns={columns}
                sort={{ sort: 'name', direction: 'asc', onSort: () => undefined }}
            />,
        );

        expect(container.querySelector('thead')).toHaveClass('text-2xs', 'uppercase');
    });

    it('tells screen readers which column is sorted and in which direction', () => {
        render(
            <DataTable
                empty={{ icon: null, title: 'Kosong' }}
                rows={rows}
                rowKey={(r) => r.id}
                columns={columns}
                sort={{ sort: 'amount', direction: 'desc', onSort: () => undefined }}
            />,
        );

        expect(screen.getByRole('columnheader', { name: 'Nilai' })).toHaveAttribute('aria-sort', 'descending');
        expect(screen.getByRole('columnheader', { name: 'Nama' })).toHaveAttribute('aria-sort', 'none');
    });

    it('asks the screen to sort by the clicked column', async () => {
        const onSort = vi.fn();
        render(
            <DataTable
                empty={{ icon: null, title: 'Kosong' }}
                rows={rows}
                rowKey={(r) => r.id}
                columns={columns}
                sort={{ sort: 'name', direction: 'asc', onSort }}
            />,
        );

        await userEvent.click(screen.getByRole('button', { name: 'Nilai' }));

        expect(onSort).toHaveBeenCalledWith('amount');
    });

    it('warns while developing when a column declares `sort` but the table has no `sort` prop', () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        render(<DataTable empty={{ icon: null, title: 'Kosong' }} rows={rows} rowKey={(r) => r.id} columns={columns} />);

        expect(error).toHaveBeenCalledWith(expect.stringContaining('no "sort" prop'));
        expect(screen.queryByRole('button', { name: 'Nama' })).not.toBeInTheDocument();
    });

    it('does not warn for a table without sortable columns', () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        render(
            <DataTable
                empty={{ icon: null, title: 'Kosong' }}
                rows={rows}
                rowKey={(r) => r.id}
                columns={[{ key: 'name', header: 'Nama', cell: (r) => r.name }]}
            />,
        );

        expect(error).not.toHaveBeenCalled();
    });
});

describe('DataTable on a narrow screen', () => {
    it('never hides a column: every header and cell stays, and the table scrolls sideways inside its card', () => {
        const { container } = render(<DataTable empty={{ icon: null, title: 'Kosong' }} rows={rows} rowKey={(r) => r.id} columns={columns} />);

        expect(screen.getAllByRole('columnheader')).toHaveLength(3);
        expect(container.querySelector('.overflow-x-auto')).toBeInTheDocument();
        expect(container.querySelector('th.hidden, td.hidden, [class*="sm:table-cell"], [class*="md:table-cell"], [class*="lg:table-cell"]')).toBeNull();
        expect(screen.getAllByRole('cell')[0]).toHaveClass('whitespace-nowrap');
    });
});

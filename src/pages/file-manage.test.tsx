import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { TooltipProvider } from '@/components/ui/tooltip';
import FileManage from '@/pages/file-manage';

const renderPage = (path = '/file-manage') =>
    render(
        <MemoryRouter initialEntries={[path]}>
            <TooltipProvider>
                <FileManage />
            </TooltipProvider>
        </MemoryRouter>,
    );

describe('File Manage', () => {
    it('lists folders before files and opens a folder with its breadcrumb', async () => {
        const user = userEvent.setup();
        renderPage();
        const folder = screen.getByRole('button', { name: /^Laporan\s*Folder/ });
        const file = screen.getByRole('button', { name: /^Panduan Pengguna\.pdf/ });

        expect(folder.compareDocumentPosition(file) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

        await user.click(screen.getByRole('button', { name: /^Dokumen\s*Folder/ }));
        expect(screen.getByText('Prosedur Operasional.pdf')).toBeInTheDocument();
        expect(screen.queryByText('Panduan Pengguna.pdf')).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'File Manage' })).toHaveAttribute('href', '/file-manage');
    });

    it('creates a folder, refuses a duplicate name, and deletes it', async () => {
        const user = userEvent.setup();
        renderPage();

        await user.click(screen.getByRole('button', { name: 'Folder Baru' }));
        await user.type(screen.getByLabelText(/Nama/), 'dokumen');
        await user.click(screen.getByRole('button', { name: 'Simpan' }));
        expect(screen.getByText('Nama sudah dipakai di folder ini.')).toBeInTheDocument();

        await user.clear(screen.getByLabelText(/Nama/));
        await user.type(screen.getByLabelText(/Nama/), 'Arsip');
        await user.click(screen.getByRole('button', { name: 'Simpan' }));
        expect(screen.getByRole('button', { name: /^Arsip\s*Folder/ })).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Aksi Arsip' }));
        await user.click(screen.getByRole('menuitem', { name: 'Hapus' }));
        await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Hapus' }));
        expect(screen.queryByRole('button', { name: /^Arsip\s*Folder/ })).not.toBeInTheDocument();
    });

    it('switches to the table view', async () => {
        const user = userEvent.setup();
        renderPage();

        await user.click(screen.getByRole('button', { name: 'Daftar' }));
        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: /Ukuran/ })).toBeInTheDocument();
    });
});

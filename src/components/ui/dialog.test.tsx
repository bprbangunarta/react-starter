import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ConfirmDialog, DialogBody, DialogFooter, Modal } from '@/components/ui/dialog';

describe('ConfirmDialog', () => {
    it('puts the title in the header and the message in the body, with the buttons in the footer', () => {
        render(
            <ConfirmDialog
                open
                onOpenChange={() => undefined}
                title="Hapus data?"
                description="Ini akan menghapus data secara permanen."
                onConfirm={() => undefined}
            />,
        );
        const dialog = screen.getByRole('alertdialog');
        const title = within(dialog).getByText('Hapus data?');
        const message = within(dialog).getByText('Ini akan menghapus data secara permanen.');

        expect(title.parentElement).not.toContainElement(message);
        expect(message.parentElement).toHaveClass('p-4');
        expect(within(dialog).getByRole('button', { name: 'Batal' }).parentElement).toHaveClass('border-t');
    });

    it('is named by its title and described by its message', () => {
        render(<ConfirmDialog open onOpenChange={() => undefined} title="Hapus data?" description="Tidak bisa dibatalkan." onConfirm={() => undefined} />);

        expect(screen.getByRole('alertdialog', { name: 'Hapus data?', description: 'Tidak bisa dibatalkan.' })).toBeInTheDocument();
    });
});

describe('Modal', () => {
    it('keeps header, body, and footer as separate parts', () => {
        render(
            <Modal open onOpenChange={() => undefined} title="Ubah data" description="Isi lalu simpan.">
                <DialogBody>Isi formulir</DialogBody>
                <DialogFooter>
                    <button type="button">Simpan</button>
                </DialogFooter>
            </Modal>,
        );
        const dialog = screen.getByRole('dialog', { name: 'Ubah data' });

        expect(within(dialog).getByText('Isi formulir')).toHaveClass('p-4');
        expect(within(dialog).getByRole('button', { name: 'Simpan' }).parentElement).toHaveClass('border-t');
    });
});

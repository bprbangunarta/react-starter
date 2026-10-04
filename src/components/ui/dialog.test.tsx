import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
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

function Controlled({ persistent }: { persistent?: boolean }) {
    const [open, setOpen] = useState(true);

    return (
        <Modal open={open} onOpenChange={setOpen} persistent={persistent} title="Ubah data">
            <DialogBody>Isi formulir</DialogBody>
        </Modal>
    );
}

describe('Modal closing', () => {
    it('closes on Escape and with the close button', async () => {
        const { unmount } = render(<Controlled />);
        await userEvent.keyboard('{Escape}');
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        unmount();

        render(<Controlled />);
        await userEvent.click(screen.getByRole('button', { name: 'Tutup' }));
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('closes on a click outside by default', async () => {
        render(<Controlled />);
        await userEvent.click(document.querySelector('.overlay-fade[data-state="open"]') as HTMLElement);

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('stays open on a click outside when persistent (dialogs with fields), but still closes on Escape', async () => {
        render(<Controlled persistent />);
        await userEvent.click(document.querySelector('.overlay-fade[data-state="open"]') as HTMLElement);
        expect(screen.getByRole('dialog')).toBeInTheDocument();

        await userEvent.keyboard('{Escape}');
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('scrolls inside the screen height instead of being cut off', () => {
        render(<Controlled />);

        expect(screen.getByRole('dialog').className).toMatch(/max-h-\[calc\(100dvh-2rem\)\]/);
        expect(screen.getByRole('dialog')).toHaveClass('overflow-y-auto');
    });
});

function Opener({ confirm }: { confirm?: boolean }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button type="button" onClick={() => setOpen(true)}>
                Buka
            </button>
            {confirm ? (
                <ConfirmDialog open={open} onOpenChange={setOpen} title="Hapus data?" description="Pesan." onConfirm={() => setOpen(false)} />
            ) : (
                <Modal open={open} onOpenChange={setOpen} title="Ubah data">
                    <DialogBody>Isi</DialogBody>
                </Modal>
            )}
        </>
    );
}

describe('focus', () => {
    it.each([
        ['Modal', false],
        ['ConfirmDialog', true],
    ])('%s moves focus inside when opened and returns it to the opener when closed', async (_name, confirm) => {
        render(<Opener confirm={confirm} />);
        const opener = screen.getByRole('button', { name: 'Buka' });
        await userEvent.click(opener);
        const dialog = screen.getByRole(confirm ? 'alertdialog' : 'dialog');

        expect(dialog).toContainElement(document.activeElement as HTMLElement);

        await userEvent.keyboard('{Escape}');
        expect(opener).toHaveFocus();
    });
});

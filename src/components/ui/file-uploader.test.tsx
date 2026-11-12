import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FileUploader } from '@/components/ui/file-uploader';
import type { UploadFn } from '@/components/ui/file-uploader';

const pdf = (name: string, bytes = 1024) => new File([new Uint8Array(bytes)], name, { type: 'application/pdf' });

/** An uploader the test drives by hand: one pending promise per file. */
function controlled() {
    const calls: { file: File; progress: (n: number) => void; finish: () => void; fail: (message: string) => void; signal: AbortSignal }[] = [];
    const upload: UploadFn = (file, { onProgress, signal }) =>
        new Promise((resolve, reject) => {
            calls.push({ file, progress: onProgress, finish: () => resolve(undefined), fail: (message) => reject(new Error(message)), signal });
        });

    return { calls, upload };
}

describe('FileUploader', () => {
    it('sends two files at a time, shows progress, and starts the next when one finishes', async () => {
        const user = userEvent.setup();
        const { calls, upload } = controlled();
        const onUploaded = vi.fn();
        render(<FileUploader upload={upload} onUploaded={onUploaded} />);

        await user.upload(screen.getByLabelText(/Pilih berkas/), [pdf('a.pdf'), pdf('b.pdf'), pdf('c.pdf')]);

        expect(calls.map((c) => c.file.name)).toEqual(['a.pdf', 'b.pdf']);
        expect(screen.getByText('Menunggu giliran')).toBeInTheDocument();

        act(() => calls[0]?.progress(40));
        expect(screen.getByRole('progressbar', { name: 'Mengunggah a.pdf' })).toHaveAttribute('aria-valuenow', '40');

        await act(() => Promise.resolve(calls[0]?.finish()));
        await waitFor(() => expect(calls).toHaveLength(3));
        expect(onUploaded).toHaveBeenCalledWith(expect.objectContaining({ name: 'a.pdf' }));
        expect(screen.getByText('1 dari 3 berkas terunggah')).toBeInTheDocument();
    });

    it('refuses files of the wrong type, too big, or too many, and says why', async () => {
        const user = userEvent.setup({ applyAccept: false });
        const { calls, upload } = controlled();
        const onReject = vi.fn();
        render(<FileUploader upload={upload} accept=".pdf" maxBytes={2048} maxFiles={1} onReject={onReject} />);

        await user.upload(screen.getByLabelText(/Pilih berkas/), [
            new File(['x'], 'virus.exe', { type: 'application/x-msdownload' }),
            pdf('besar.pdf', 4096),
            pdf('satu.pdf'),
            pdf('dua.pdf'),
        ]);

        expect(calls.map((c) => c.file.name)).toEqual(['satu.pdf']);
        const message = onReject.mock.calls[0]?.[0] as string;

        expect(message).toContain('virus.exe: jenis berkas tidak didukung.');
        expect(message).toContain('besar.pdf: melebihi batas 2 KB.');
        expect(message).toContain('dua.pdf: melebihi batas 1 berkas.');
    });

    it('keeps a failed file with its reason and sends it again on "Coba lagi"', async () => {
        const user = userEvent.setup();
        const { calls, upload } = controlled();
        render(<FileUploader upload={upload} />);

        await user.upload(screen.getByLabelText(/Pilih berkas/), pdf('a.pdf'));
        await act(() => Promise.resolve(calls[0]?.fail('Server menolak.')));
        expect(await screen.findByText('Server menolak.')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Coba lagi a.pdf' }));
        await waitFor(() => expect(calls).toHaveLength(2));
        await act(() => Promise.resolve(calls[1]?.finish()));
        expect(await screen.findByText('Selesai')).toBeInTheDocument();
    });

    it('cancels a file that is going up: the request is aborted and it leaves the list', async () => {
        const user = userEvent.setup();
        const { calls, upload } = controlled();
        render(<FileUploader upload={upload} />);

        await user.upload(screen.getByLabelText(/Pilih berkas/), pdf('a.pdf'));
        await user.click(screen.getByRole('button', { name: 'Batalkan a.pdf' }));

        expect(calls[0]?.signal.aborted).toBe(true);
        expect(screen.queryByText('a.pdf')).not.toBeInTheDocument();
    });
});

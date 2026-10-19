import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AvatarEditor } from '@/components/avatar-editor';
import type * as HttpModule from '@/lib/http';
import { HttpError, http } from '@/lib/http';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));
vi.mock('@/lib/http', async (importOriginal) => ({
    ...(await importOriginal<typeof HttpModule>()),
    http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

const photo = (bytes = 1000) => new File([new Uint8Array(bytes)], 'foto.jpg', { type: 'image/jpeg' });

describe('AvatarEditor', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(http.post).mockResolvedValue({ message: 'Foto profil diperbarui.' });
        vi.mocked(http.delete).mockResolvedValue({ message: 'Foto profil dihapus.' });
    });

    it('uploads the chosen photo as multipart form data and tells the screen', async () => {
        const onChanged = vi.fn();
        render(<AvatarEditor name="Rina" src={null} onChanged={onChanged} />);

        await userEvent.upload(screen.getByLabelText('Pilih foto profil'), photo());

        await waitFor(() => expect(onChanged).toHaveBeenCalled());
        const body = vi.mocked(http.post).mock.calls[0]?.[1] as FormData;

        expect(http.post).toHaveBeenCalledWith('/profile/avatar', expect.any(FormData));
        expect(body.get('avatar')).toBeInstanceOf(File);
        expect(toast.success).toHaveBeenCalledWith('Foto profil diperbarui.');
    });

    it('refuses a photo over 2 MB without calling the server', () => {
        render(<AvatarEditor name="Rina" src={null} onChanged={vi.fn()} />);

        fireEvent.change(screen.getByLabelText('Pilih foto profil'), { target: { files: [photo(3 * 1024 * 1024)] } });

        expect(toast.error).toHaveBeenCalledWith('Ukuran foto maksimal 2 MB.');
        expect(http.post).not.toHaveBeenCalled();
    });

    it('shows the first message from the server when the upload is refused', async () => {
        vi.mocked(http.post).mockRejectedValue(new HttpError(422, 'Tidak valid.', { avatar: ['Berkas harus berupa foto berformat JPG, PNG, atau WebP.'] }));
        render(<AvatarEditor name="Rina" src={null} onChanged={vi.fn()} />);

        await userEvent.upload(screen.getByLabelText('Pilih foto profil'), photo());

        await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Berkas harus berupa foto berformat JPG, PNG, atau WebP.'));
    });

    it('offers removal only when there is a photo, and asks first', async () => {
        const onChanged = vi.fn();
        const { rerender } = render(<AvatarEditor name="Rina" src={null} onChanged={onChanged} />);

        expect(screen.queryByRole('button', { name: /Hapus/ })).not.toBeInTheDocument();

        rerender(<AvatarEditor name="Rina" src="/foto/1.jpg" onChanged={onChanged} />);
        await userEvent.click(screen.getByRole('button', { name: /Hapus/ }));

        expect(http.delete).not.toHaveBeenCalled();

        await userEvent.click(screen.getByRole('button', { name: 'Hapus' }));

        await waitFor(() => expect(http.delete).toHaveBeenCalledWith('/profile/avatar'));
        expect(onChanged).toHaveBeenCalled();
    });
});

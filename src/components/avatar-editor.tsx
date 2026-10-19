import { Camera, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Avatar } from '@/components/avatar';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/dialog';
import { http, HttpError } from '@/lib/http';

/** The same limit the server enforces (it checks again). */
const MAX_BYTES = 2 * 1024 * 1024;
const ACCEPT = 'image/jpeg,image/png,image/webp';

/** The photo row on the profile page: shows the current photo and lets the person replace or remove it. */
export function AvatarEditor({ name, src, onChanged }: { name: string; src: string | null; onChanged: () => void }) {
    const input = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const fail = (e: unknown) => {
        toast.error(e instanceof HttpError ? (e.errors.avatar?.[0] ?? e.message) : 'Terjadi kesalahan.');
    };

    const upload = async (file: File | undefined) => {
        if (input.current) {
            input.current.value = '';
        }

        if (!file) {
            return;
        }

        if (file.size > MAX_BYTES) {
            toast.error('Ukuran foto maksimal 2 MB.');

            return;
        }

        setBusy(true);

        try {
            const form = new FormData();
            form.append('avatar', file);
            const response = await http.post<{ message: string }>('/profile/avatar', form);
            toast.success(response.message);
            onChanged();
        } catch (e) {
            fail(e);
        } finally {
            setBusy(false);
        }
    };

    const remove = async () => {
        setBusy(true);

        try {
            const response = await http.delete<{ message: string }>('/profile/avatar');
            toast.success(response.message);
            setConfirmOpen(false);
            onChanged();
        } catch (e) {
            fail(e);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3">
                <Avatar name={name} src={src} className="size-14 text-lg" />
                <div className="min-w-0">
                    <p className="text-sm font-medium">Foto profil</p>
                    <p className="text-xs text-muted">JPG, PNG, atau WebP, maksimal 2 MB.</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <input
                    ref={input}
                    type="file"
                    accept={ACCEPT}
                    className="sr-only"
                    aria-label="Pilih foto profil"
                    tabIndex={-1}
                    onChange={(e) => void upload(e.target.files?.[0])}
                />
                <Button size="sm" variant="outline" loading={busy} onClick={() => input.current?.click()}>
                    <Camera /> {src ? 'Ganti foto' : 'Unggah foto'}
                </Button>
                {src && (
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => setConfirmOpen(true)}>
                        <Trash2 /> Hapus
                    </Button>
                )}
            </div>
            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Hapus foto profil?"
                description="Foto Anda dihapus dan diganti huruf pertama nama Anda."
                confirmLabel="Hapus"
                loading={busy}
                onConfirm={() => void remove()}
            />
        </div>
    );
}

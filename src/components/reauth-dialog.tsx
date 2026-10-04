import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DialogBody, DialogFooter, Modal } from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import { PasswordInput } from '@/components/ui/password-input';
import { HttpError, REAUTH_EVENT, http } from '@/lib/http';

/**
 * Sensitive actions (users, API keys) need a recent password confirmation. When the server asks for it
 * (403 `reauth_required`), this dialog opens, confirms the password, and the person repeats the action.
 */
export function ReauthDialog() {
    const [open, setOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | undefined>();
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        // The dialog may open on top of another dialog; Radix focuses its first button, so move focus to the field.
        const show = () => {
            setOpen(true);
            setTimeout(() => document.getElementById('reauth-password')?.focus(), 80);
        };
        window.addEventListener(REAUTH_EVENT, show);

        return () => window.removeEventListener(REAUTH_EVENT, show);
    }, []);

    const close = () => {
        setOpen(false);
        setPassword('');
        setError(undefined);
    };

    const submit = async () => {
        setBusy(true);
        setError(undefined);

        try {
            const response = await http.post<{ message: string }>('/reauth', { password });
            toast.success(response.message);
            close();
        } catch (e) {
            if (e instanceof HttpError && e.status === 422) {
                setError(e.errors.password?.[0] ?? e.message);
            } else {
                toast.error(e instanceof Error ? e.message : 'Terjadi kesalahan.');
            }
        } finally {
            setBusy(false);
        }
    };

    return (
        <Modal
            open={open}
            onOpenChange={(next) => !next && close()}
            title="Konfirmasi kata sandi"
            description="Aksi ini sensitif. Masukkan kata sandi Anda untuk melanjutkan."
        >
            <form
                noValidate
                onSubmit={(e) => {
                    e.preventDefault();
                    void submit();
                }}
            >
                <DialogBody>
                    <Field label="Kata sandi" error={error}>
                        <PasswordInput
                            id="reauth-password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            aria-invalid={!!error}
                        />
                    </Field>
                </DialogBody>
                <DialogFooter>
                    <Button variant="outline" onClick={close}>
                        Batal
                    </Button>
                    <Button type="submit" loading={busy} disabled={password === ''}>
                        Konfirmasi
                    </Button>
                </DialogFooter>
            </form>
        </Modal>
    );
}

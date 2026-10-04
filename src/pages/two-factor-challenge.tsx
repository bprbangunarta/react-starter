import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useSession } from '@/auth/session';
import type { Me } from '@/auth/session';
import { NetworkStatus } from '@/components/network-status';
import { Button } from '@/components/ui/button';
import { CodeInput } from '@/components/ui/code-input';
import { Field } from '@/components/ui/field';
import { Card } from '@/components/ui/misc';
import { useForm } from '@/lib/form';
import { http, HttpError } from '@/lib/http';
import { useResource } from '@/lib/resource';
import { useTitle } from '@/lib/title';

type Challenge = { method: 'totp' | 'email'; name: string; email: string; wait: number; recovery_available: boolean };

export default function TwoFactorChallenge() {
    useTitle('Verifikasi');
    const navigate = useNavigate();
    const { me, refresh } = useSession();
    const { data, error } = useResource<Challenge>('/two-factor-challenge');
    const form = useForm({ code: '' });
    const [recovery, setRecovery] = useState(false);
    const [wait, setWait] = useState(0);

    useEffect(() => {
        setWait(data?.wait ?? 0);
    }, [data]);

    useEffect(() => {
        if (wait <= 0) {
            return;
        }

        const timer = setTimeout(() => setWait((seconds) => seconds - 1), 1000);

        return () => clearTimeout(timer);
    }, [wait]);

    if (me) {
        return <Navigate to="/" replace />;
    }

    // Nobody is waiting for a second factor (the session ended): back to the sign-in page.
    if (error) {
        return <Navigate to="/login" replace />;
    }

    if (!data) {
        return null;
    }

    const { method, name, email } = data;

    const resend = async () => {
        try {
            const response = await http.post<{ message: string; wait: number }>('/two-factor-challenge/resend');
            toast.success(response.message);
            setWait(response.wait);
        } catch (e) {
            toast.error(e instanceof HttpError ? e.message : 'Terjadi kesalahan.');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <NetworkStatus />
            <div className="w-full max-w-xs">
                <div className="mb-4 flex flex-col items-center gap-1">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-white">
                        <ShieldCheck className="size-5" />
                    </span>
                    <h1 className="text-base font-semibold">Verifikasi dua langkah</h1>
                    <p className="text-center text-xs text-muted">
                        {method === 'email'
                            ? `Halo ${name}, masukkan kode yang kami kirim ke ${email}.`
                            : recovery
                              ? `Halo ${name}, masukkan salah satu kode pemulihan Anda.`
                              : `Halo ${name}, masukkan kode dari aplikasi authenticator Anda.`}
                    </p>
                </div>
                <Card className="p-4">
                    <form
                        className="flex flex-col gap-3"
                        noValidate
                        onSubmit={(e) => {
                            e.preventDefault();
                            // The code is sent with the flag that says whether it is a recovery code.
                            void (async () => {
                                form.clearErrors();

                                try {
                                    await http.post<Me>('/two-factor-challenge', { code: form.data.code, recovery });
                                    await refresh();
                                    void navigate('/');
                                } catch (err) {
                                    if (err instanceof HttpError && err.status === 422) {
                                        form.reset('code');
                                        form.setError('code', err.errors.code?.[0] ?? err.message);
                                    } else {
                                        toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan.');
                                        void navigate('/login');
                                    }
                                }
                            })();
                        }}
                    >
                        <Field label={recovery ? 'Kode pemulihan' : 'Kode verifikasi'} error={form.errors.code}>
                            <CodeInput autoFocus recovery={recovery} value={form.data.code} onValueChange={(value) => form.setData('code', value)} aria-invalid={!!form.errors.code} placeholder={recovery ? 'xxxxx-xxxxx' : '••••••'} />
                        </Field>
                        <Button type="submit" disabled={form.data.code.length < (recovery ? 11 : 6)}>
                            Verifikasi
                        </Button>
                        <div className="flex flex-col items-center gap-1.5 text-xs">
                            {method === 'email' && (
                                <button type="button" disabled={wait > 0} onClick={() => void resend()} className="cursor-pointer text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted disabled:no-underline">
                                    {wait > 0 ? `Kirim kode baru dalam ${wait} dtk` : 'Kirim kode baru'}
                                </button>
                            )}
                            {method === 'totp' && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setRecovery((current) => !current);
                                        form.reset('code');
                                        form.clearErrors();
                                    }}
                                    className="cursor-pointer text-primary hover:underline"
                                >
                                    {recovery ? 'Pakai aplikasi authenticator' : 'Pakai kode pemulihan'}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() =>
                                    void http.post('/two-factor-challenge/cancel').then(() => navigate('/login'))
                                }
                                className="flex cursor-pointer items-center gap-1 text-muted hover:text-ink"
                            >
                                <ArrowLeft className="size-3" /> Kembali ke halaman masuk
                            </button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
}

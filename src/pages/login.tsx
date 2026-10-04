import { Info } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router';
import { useSession } from '@/auth/session';
import type { Me } from '@/auth/session';
import { NetworkStatus } from '@/components/network-status';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/misc';
import { PasswordInput } from '@/components/ui/password-input';
import { useForm } from '@/lib/form';
import { USE_MOCK } from '@/lib/http';
import { useTitle } from '@/lib/title';

export default function Login() {
    useTitle('Masuk');
    const { me, refresh } = useSession();
    const navigate = useNavigate();
    const form = useForm({ username: '', password: '', remember: false });

    if (me) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <NetworkStatus />
            <div className="w-full max-w-xs">
                <div className="mb-4 flex flex-col items-center gap-1">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-base font-bold text-white">S</span>
                    <h1 className="text-base font-semibold">Starter Kit</h1>
                    <p className="text-center text-xs text-muted">Silakan masuk menggunakan akun Anda dengan email atau username dan kata sandi yang telah terdaftar.</p>
                </div>
                <Card className="p-4">
                    <form
                        className="flex flex-col gap-3"
                        noValidate
                        onSubmit={(e) => {
                            e.preventDefault();
                            void form.post<Partial<Me> & { two_factor: boolean }>('/login', {
                                toast: false,
                                onSuccess: async (response) => {
                                    if (response.two_factor) {
                                        void navigate('/two-factor-challenge');
                                    } else {
                                        await refresh();
                                        void navigate('/');
                                    }
                                },
                                onError: () => form.setData('password', ''),
                            });
                        }}
                    >
                        <Field label="Kredensial" error={form.errors.username}>
                            <Input
                                type="text"
                                autoComplete="username"
                                autoFocus
                                required
                                value={form.data.username}
                                onChange={(e) => form.setData('username', e.target.value)}
                                aria-invalid={!!form.errors.username}
                                placeholder="Email atau Username"
                            />
                        </Field>
                        <Field label="Kata sandi" error={form.errors.password}>
                            <PasswordInput
                                autoComplete="current-password"
                                required
                                value={form.data.password}
                                onChange={(e) => form.setData('password', e.target.value)}
                                aria-invalid={!!form.errors.password}
                                placeholder="************************"
                            />
                        </Field>
                        <label className="flex items-center gap-2 text-xs text-muted">
                            <input type="checkbox" className="accent-primary" checked={form.data.remember} onChange={(e) => form.setData('remember', e.target.checked)} />
                            Ingat saya
                        </label>
                        <Button type="submit" loading={form.processing} className="w-full" disabled={form.data.username === '' || form.data.password === ''}>
                            Masuk
                        </Button>
                    </form>
                </Card>
                {USE_MOCK && (
                    <p className="mt-3 flex items-start gap-1.5 text-xs text-muted">
                        <Info className="mt-0.5 size-3.5 shrink-0" />
                        <span>
                            Data tiruan: masuk dengan <code className="rounded bg-canvas px-1">admin</code> / <code className="rounded bg-canvas px-1">password</code>.
                        </span>
                    </p>
                )}
            </div>
        </div>
    );
}

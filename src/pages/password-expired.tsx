import { ArrowLeft, KeyRound } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router';
import { useSession } from '@/auth/session';
import type { Me } from '@/auth/session';
import { NetworkStatus } from '@/components/network-status';
import { EMPTY_PASSWORD, PasswordFields } from '@/components/password-fields';
import type { PasswordData } from '@/components/password-fields';
import { Button } from '@/components/ui/button';
import { Alert, Card } from '@/components/ui/misc';
import { APP_INITIAL, APP_NAME } from '@/lib/brand';
import { useForm } from '@/lib/form';
import { http } from '@/lib/http';
import { useResource } from '@/lib/resource';
import { useTitle } from '@/lib/title';

type Expired = { name: string; username: string; max_age_days: number };

/**
 * Shown after a correct sign-in when the password is older than the policy allows (30 days in the mock). The person sets a
 * new one with the same three fields as Profile; the server refuses a password equal to the current or recent ones.
 */
export default function PasswordExpired() {
    useTitle('Kata sandi kedaluwarsa');
    const navigate = useNavigate();
    const { me, refresh } = useSession();
    const { data, error } = useResource<Expired>('/password-expired');
    const form = useForm<PasswordData>(EMPTY_PASSWORD);

    if (me) {
        return <Navigate to="/" replace />;
    }

    // Nobody is waiting to renew a password (the sign-in ended): back to the sign-in page.
    if (error) {
        return <Navigate to="/login" replace />;
    }

    if (!data) {
        return null;
    }

    const cancel = async () => {
        await http.post('/password-expired/cancel');
        void navigate('/login');
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <NetworkStatus />
            <div className="w-full max-w-md">
                <div className="mb-4 flex flex-col items-center gap-1">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-base font-bold text-white">{APP_INITIAL}</span>
                    <h1 className="text-base font-semibold">{APP_NAME}</h1>
                </div>
                <Card className="p-4">
                    <div className="mb-3">
                        <h2 className="text-sm font-semibold">Kata sandi sudah kedaluwarsa</h2>
                        <p className="text-xs text-muted">Halo, {data.name}. Buat kata sandi baru untuk melanjutkan.</p>
                    </div>
                    <Alert tone="warning" icon={<KeyRound />} className="mb-3 text-xs">
                        Kata sandi diganti setiap {data.max_age_days} hari. Kata sandi lama Anda sudah melewati batas itu.
                    </Alert>
                    <form
                        className="flex flex-col gap-3"
                        noValidate
                        onSubmit={(e) => {
                            e.preventDefault();
                            void form.post<Partial<Me> & { two_factor: boolean }>('/password-expired', {
                                onSuccess: async (response) => {
                                    if (response.two_factor) {
                                        void navigate('/two-factor-challenge');
                                    } else {
                                        await refresh();
                                        void navigate('/');
                                    }
                                },
                            });
                        }}
                    >
                        <PasswordFields form={form} />
                        <div className="flex items-center justify-between gap-2">
                            <Button variant="outline" onClick={() => void cancel()}>
                                <ArrowLeft /> Kembali
                            </Button>
                            <Button type="submit" loading={form.processing} disabled={!form.data.current_password || !form.data.password}>
                                Simpan dan lanjutkan
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
}

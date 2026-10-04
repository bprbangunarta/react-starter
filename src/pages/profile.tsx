import { QRCodeSVG } from 'qrcode.react';
import { KeyRound, Mail, ShieldCheck, Smartphone } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useSession } from '@/auth/session';
import { EMPTY_PASSWORD, PasswordFields } from '@/components/password-fields';
import type { PasswordData } from '@/components/password-fields';
import { Button } from '@/components/ui/button';
import { CodeInput } from '@/components/ui/code-input';
import { DialogBody, DialogFooter, Modal } from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import { Badge, Card, CardBody, CardFooter, CardHeader, PageHeader } from '@/components/ui/misc';
import { useForm } from '@/lib/form';
import { http, HttpError } from '@/lib/http';
import { useResource } from '@/lib/resource';
import { useTitle } from '@/lib/title';

type ProfileData = {
    account: { name: string; username: string | null; email: string };
    twoFactor: { method: 'totp' | 'email' | null; emailAvailable: boolean; recoveryRemaining: number };
};

type Done = (response: { recovery_codes?: string[] }) => void;

function Detail({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="min-w-0">
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="truncate text-sm font-medium">{children || '–'}</dd>
        </div>
    );
}

/** Confirm a code with the server (`method` + `url`), showing errors under the field. */
function CodeForm({
    url,
    method = 'post',
    submitLabel,
    onDone,
    recovery = false,
    children,
}: {
    url: string;
    method?: 'post' | 'delete';
    submitLabel: string;
    onDone: Done;
    recovery?: boolean;
    children?: ReactNode;
}) {
    const form = useForm({ code: '' });

    return (
        <form
            noValidate
            onSubmit={(e) => {
                e.preventDefault();
                void form[method]<{ recovery_codes?: string[] }>(url, {
                    onSuccess: (response) => {
                        form.reset();
                        onDone(response);
                    },
                });
            }}
        >
            <DialogBody className="flex flex-col gap-3">
                {children}
                <Field label={recovery ? 'Kode atau kode pemulihan' : 'Kode verifikasi'} error={form.errors.code}>
                    <CodeInput
                        recovery={recovery}
                        value={form.data.code}
                        onValueChange={(value) => form.setData('code', value)}
                        aria-invalid={!!form.errors.code}
                        placeholder={recovery ? 'kode atau xxxxx-xxxxx' : '••••••'}
                    />
                </Field>
            </DialogBody>
            <DialogFooter>
                <Button variant="outline" onClick={() => onDone({})}>
                    Batal
                </Button>
                <Button type="submit" loading={form.processing} variant={method === 'delete' ? 'danger' : 'primary'} disabled={form.data.code.length < 6}>
                    {submitLabel}
                </Button>
            </DialogFooter>
        </form>
    );
}

function SendCode({ url, sent, onSent }: { url: string; sent: boolean; onSent: () => void }) {
    const [resendIn, setResendIn] = useState(0);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (resendIn <= 0) {
            return;
        }

        const timer = setTimeout(() => setResendIn((seconds) => seconds - 1), 1000);

        return () => clearTimeout(timer);
    }, [resendIn]);

    const send = async () => {
        setSending(true);

        try {
            const response = await http.post<{ message: string; wait: number }>(url);
            toast.success(response.message);
            setResendIn(response.wait);
            onSent();
        } catch (e) {
            toast.error(e instanceof HttpError ? e.message : 'Terjadi kesalahan.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" loading={sending} disabled={resendIn > 0} onClick={() => void send()}>
                <Mail /> {sent ? 'Kirim kode baru' : 'Kirim kode'}
            </Button>
            {resendIn > 0 && <span className="text-xs text-muted">Bisa lagi dalam {resendIn} dtk</span>}
        </div>
    );
}

function RecoveryCodes({ codes, onClose }: { codes: string[] | null; onClose: () => void }) {
    return (
        <Modal
            open={codes !== null}
            onOpenChange={(open) => !open && onClose()}
            title="Simpan kode pemulihan Anda"
            description="Tiap kode hanya berlaku sekali bila ponsel Anda hilang. Kode ini hanya ditampilkan sekarang."
        >
            <DialogBody>
                <ul className="grid grid-cols-2 gap-1.5 rounded-md border border-line bg-canvas p-3 font-mono text-sm">
                    {codes?.map((code) => (
                        <li key={code}>{code}</li>
                    ))}
                </ul>
            </DialogBody>
            <DialogFooter>
                <Button
                    variant="outline"
                    onClick={() => {
                        void navigator.clipboard.writeText((codes ?? []).join('\n'));
                        toast.success('Kode pemulihan disalin.');
                    }}
                >
                    Salin
                </Button>
                <Button onClick={onClose}>Sudah saya simpan</Button>
            </DialogFooter>
        </Modal>
    );
}

function PasswordCard() {
    const form = useForm<PasswordData>(EMPTY_PASSWORD);

    return (
        <Card>
            <CardHeader title="Kata sandi" />
            <form
                noValidate
                onSubmit={(e) => {
                    e.preventDefault();
                    void form.put('/profile/password', { onSuccess: () => form.reset() });
                }}
            >
                <CardBody className="flex flex-col gap-3">
                    <PasswordFields form={form} />
                </CardBody>
                <CardFooter>
                    <p className="text-xs text-muted">Kata sandi baru berlaku untuk masuk berikutnya.</p>
                    <Button type="submit" loading={form.processing} disabled={!form.data.current_password || !form.data.password}>
                        Ubah kata sandi
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}

export default function Profile() {
    useTitle('Profil');
    const { me, refresh } = useSession();
    const { data, reload } = useResource<ProfileData>('/profile');
    const [setup, setSetup] = useState<{ secret: string; uri: string } | null>(null);
    const [emailOpen, setEmailOpen] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [disableOpen, setDisableOpen] = useState(false);
    const [codes, setCodes] = useState<string[] | null>(null);

    if (!data || !me) {
        return null;
    }

    const { account, twoFactor } = data;
    const { method } = twoFactor;
    const enabled = me.security.enabled;
    const changed = (response: { recovery_codes?: string[] }) => {
        if (response.recovery_codes) {
            setCodes(response.recovery_codes);
        }

        void reload();
        void refresh();
    };

    const startTotp = async () => {
        try {
            setSetup(await http.post<{ secret: string; uri: string }>('/profile/two-factor/totp/start'));
        } catch (e) {
            toast.error(e instanceof HttpError ? e.message : 'Terjadi kesalahan.');
        }
    };

    return (
        <>
            <PageHeader title="Profil" description="Akun Anda dan cara Anda masuk" />
            <div className="grid gap-3 lg:grid-cols-2">
                <div className="flex flex-col gap-3">
                    <Card>
                        <CardHeader title="Akun" />
                        <CardBody>
                            <dl className="grid gap-3 sm:grid-cols-2">
                                <Detail label="Nama">{account.name}</Detail>
                                <Detail label="Nama pengguna">{account.username}</Detail>
                                <Detail label="Email">{account.email}</Detail>
                            </dl>
                        </CardBody>
                    </Card>
                    <PasswordCard />
                </div>
                <Card className="self-start">
                    <CardHeader
                        title="Verifikasi dua langkah"
                        actions={enabled && <Badge tone={method ? 'success' : 'warning'}>{method ? 'Aktif' : 'Mati'}</Badge>}
                    />
                    {!enabled ? (
                        <p className="p-3 text-sm text-muted">Verifikasi dua langkah dimatikan oleh administrator.</p>
                    ) : (
                        <div className="flex flex-col divide-y divide-line">
                            <div className="flex items-center justify-between gap-3 p-3">
                                <div className="flex gap-2.5">
                                    <Smartphone className="mt-0.5 size-4 shrink-0 text-muted" />
                                    <div>
                                        <p className="text-sm font-medium">Aplikasi authenticator</p>
                                        <p className="text-xs text-muted">
                                            Kode dari aplikasi seperti Google Authenticator atau Microsoft Authenticator. Disarankan.
                                        </p>
                                        {method === 'totp' && <p className="mt-1 text-xs text-muted">{twoFactor.recoveryRemaining} kode pemulihan tersisa</p>}
                                    </div>
                                </div>
                                {method === 'totp' ? (
                                    <Badge tone="success">Dipakai</Badge>
                                ) : (
                                    <Button size="sm" variant={method ? 'outline' : 'primary'} onClick={() => void startTotp()}>
                                        <ShieldCheck /> {method ? 'Ganti' : 'Atur'}
                                    </Button>
                                )}
                            </div>
                            <div className="flex items-center justify-between gap-3 p-3">
                                <div className="flex gap-2.5">
                                    <Mail className="mt-0.5 size-4 shrink-0 text-muted" />
                                    <div>
                                        <p className="text-sm font-medium">Kode email</p>
                                        <p className="text-xs text-muted">
                                            {twoFactor.emailAvailable
                                                ? `Kode dikirim ke ${account.email} setiap kali Anda masuk.`
                                                : 'Akun Anda tidak punya alamat email yang bisa menerima kode.'}
                                        </p>
                                    </div>
                                </div>
                                {method === 'email' ? (
                                    <Badge tone="success">Dipakai</Badge>
                                ) : (
                                    <Button
                                        size="sm"
                                        variant={method ? 'outline' : 'primary'}
                                        disabled={!twoFactor.emailAvailable}
                                        onClick={() => setEmailOpen(true)}
                                    >
                                        <KeyRound /> {method ? 'Ganti' : 'Atur'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                    {enabled && method && (
                        <CardFooter className="justify-end">
                            <Button size="sm" variant="outline" onClick={() => setDisableOpen(true)}>
                                Matikan
                            </Button>
                        </CardFooter>
                    )}
                </Card>
            </div>

            <Modal
                open={setup !== null}
                onOpenChange={(open) => !open && setSetup(null)}
                title="Atur aplikasi authenticator"
                description="Pindai kode QR, lalu masukkan kode 6 digit yang tampil di aplikasi."
            >
                {setup && (
                    <CodeForm
                        url="/profile/two-factor/totp"
                        submitLabel="Aktifkan"
                        onDone={(response) => {
                            setSetup(null);
                            changed(response);
                        }}
                    >
                        <div className="flex flex-col items-center gap-2">
                            <div className="rounded-md border border-line bg-white p-2">
                                <QRCodeSVG value={setup.uri} size={148} />
                            </div>
                            <p className="text-xs text-muted">Tidak bisa memindai? Masukkan kunci ini di aplikasi:</p>
                            <code className="rounded bg-canvas px-2 py-1 font-mono text-xs break-all select-all">{setup.secret}</code>
                        </div>
                    </CodeForm>
                )}
            </Modal>
            <Modal
                open={emailOpen}
                onOpenChange={setEmailOpen}
                title="Atur kode email"
                description={`Kami akan mengirim kode ke ${account.email} untuk memastikan berfungsi.`}
            >
                <CodeForm
                    url="/profile/two-factor/email"
                    submitLabel="Aktifkan"
                    onDone={(response) => {
                        setEmailOpen(false);
                        setEmailSent(false);
                        changed(response);
                    }}
                >
                    <SendCode url="/profile/two-factor/email/send" sent={emailSent} onSent={() => setEmailSent(true)} />
                </CodeForm>
            </Modal>
            <Modal
                open={disableOpen}
                onOpenChange={setDisableOpen}
                title="Matikan verifikasi dua langkah"
                description="Masukkan kode untuk memastikan ini Anda."
            >
                <CodeForm
                    url="/profile/two-factor"
                    method="delete"
                    submitLabel="Matikan"
                    recovery={method === 'totp'}
                    onDone={(response) => {
                        setDisableOpen(false);
                        changed(response);
                    }}
                >
                    {method === 'email' && <SendCode url="/profile/two-factor/email/send" sent={emailSent} onSent={() => setEmailSent(true)} />}
                </CodeForm>
            </Modal>
            <RecoveryCodes codes={codes} onClose={() => setCodes(null)} />
        </>
    );
}

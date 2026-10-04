import { Check, Download, Inbox, Pencil, Plus, Save, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { renderLoginCodeEmail } from '../../email/login-code';
import { Button } from '@/components/ui/button';
import { CodeInput } from '@/components/ui/code-input';
import { Combobox } from '@/components/ui/combobox';
import { DataTable } from '@/components/ui/data-table';
import type { Column } from '@/components/ui/data-table';
import { DatePicker } from '@/components/ui/date-picker';
import { ConfirmDialog, DialogFooter, Modal } from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import { FilterBar, SearchInput } from '@/components/ui/filter-bar';
import { Input } from '@/components/ui/input';
import { Badge, Card, EmptyState, ErrorState, PageHeader, Skeleton } from '@/components/ui/misc';
import type { BadgeTone } from '@/components/ui/misc';
import { PasswordInput } from '@/components/ui/password-input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tip } from '@/components/ui/tooltip';
import { rupiah } from '@/lib/format';
import { useTitle } from '@/lib/title';

const TOKENS = [
    ['primary', 'bg-primary', 'Warna utama: tombol, tautan, item menu aktif'],
    ['primary-hover', 'bg-primary-hover', 'Tombol utama saat disorot'],
    ['primary-soft', 'bg-primary-soft', 'Latar item aktif dan badge info'],
    ['surface', 'bg-surface', 'Kartu, sidebar, header, dialog'],
    ['canvas', 'bg-canvas', 'Latar halaman, header tabel, hover'],
    ['line', 'bg-line', 'Garis pemisah dan batas'],
    ['ink', 'bg-ink', 'Teks utama'],
    ['muted', 'bg-muted', 'Teks pendukung (label, hint, header tabel)'],
    ['danger', 'bg-danger', 'Galat, tombol hapus'],
];

/** The static error pages (error-pages/*.html, made by `npm run error-pages`), keyed by status code. */
const ERROR_PAGES = Object.entries(import.meta.glob<string>('../../error-pages/*.html', { query: '?raw', import: 'default', eager: true }))
    .map(([file, html]) => ({ code: /(\d{3})\.html$/.exec(file)?.[1] ?? file, html }))
    .sort((a, b) => a.code.localeCompare(b.code));
const ERROR_LABELS: Record<string, string> = { '401': 'Perlu masuk', '403': 'Akses ditolak', '404': 'Tidak ditemukan', '419': 'Kedaluwarsa', '429': 'Terlalu banyak', '500': 'Galat server', '503': 'Pemeliharaan' };

const TONES: BadgeTone[] = ['neutral', 'info', 'success', 'warning', 'danger'];

type Row = { id: number; name: string; status: BadgeTone; amount: number };
type Draft = { id: number | null; name: string; status: BadgeTone; amount: string };
const EMPTY_DRAFT: Draft = { id: null, name: '', status: 'success', amount: '' };
const INITIAL_ROWS: Row[] = [
    { id: 1, name: 'Proyek Alfa', status: 'success', amount: 12_500_000 },
    { id: 2, name: 'Proyek Beta', status: 'warning', amount: 3_200_000 },
    { id: 3, name: 'Proyek Gamma', status: 'danger', amount: 870_000 },
];

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
    return (
        <Card>
            <div className="border-b border-line px-3 py-2">
                <h2 className="text-sm font-semibold">{title}</h2>
                {description && <p className="text-xs text-muted">{description}</p>}
            </div>
            <div className="flex flex-col gap-3 p-3">{children}</div>
        </Card>
    );
}

/** A living reference of every shared component and token. Compare any new screen against it. */
export default function Styleguide() {
    useTitle('Panduan tampilan');
    const [modal, setModal] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [select, setSelect] = useState<string | null>('b');
    const [date, setDate] = useState('');
    const [code, setCode] = useState('');
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<string | null>(null);
    const [rows, setRows] = useState<Row[]>(INITIAL_ROWS);
    const [draft, setDraft] = useState<Draft | null>(null);
    const [nameError, setNameError] = useState<string | undefined>();
    const [removing, setRemoving] = useState<Row | null>(null);
    const email = renderLoginCodeEmail({ appName: 'Starter Kit', code: '482915', minutes: 10, name: 'Rina Wulandari', sentAt: '1 Oktober 2026, 21:16 WIB' });

    const visible = rows.filter((r) => r.name.toLowerCase().includes(search.trim().toLowerCase()) && (status === null || r.status === status));

    const openDraft = (next: Draft) => {
        setNameError(undefined);
        setDraft(next);
    };

    const save = () => {
        if (!draft) {
            return;
        }

        if (draft.name.trim() === '') {
            setNameError('Nama wajib diisi.');

            return;
        }

        const next = { name: draft.name.trim(), status: draft.status, amount: Number(draft.amount) || 0 };
        setRows((all) => (draft.id === null ? [...all, { id: Math.max(0, ...all.map((r) => r.id)) + 1, ...next }] : all.map((r) => (r.id === draft.id ? { ...r, ...next } : r))));
        toast.success(draft.id === null ? 'Data ditambahkan' : 'Perubahan tersimpan');
        setDraft(null);
    };

    const columns: Column<Row>[] = [
        { key: 'name', header: 'Nama', className: 'font-medium', cell: (r) => r.name, sort: 'name' },
        { key: 'status', header: 'Status', cell: (r) => <Badge tone={r.status}>{r.status}</Badge> },
        { key: 'amount', header: 'Nilai', align: 'right', hideBelow: 'sm', className: 'tabular-nums', cell: (r) => rupiah(r.amount) },
        {
            key: 'actions',
            header: 'Aksi',
            srOnly: true,
            narrow: true,
            align: 'right',
            cell: (r) => (
                <div className="flex justify-end gap-1">
                    <Tip label="Ubah">
                        <Button variant="ghost" size="icon" aria-label={`Ubah ${r.name}`} onClick={() => openDraft({ id: r.id, name: r.name, status: r.status, amount: String(r.amount) })}>
                            <Pencil />
                        </Button>
                    </Tip>
                    <Tip label="Hapus">
                        <Button variant="ghost" size="icon" aria-label={`Hapus ${r.name}`} onClick={() => setRemoving(r)}>
                            <Trash2 />
                        </Button>
                    </Tip>
                </div>
            ),
        },
    ];

    return (
        <>
            <PageHeader title="Panduan tampilan" description="Acuan komponen dan token. Tampilan baru harus terlihat sama dengan ini" actions={<Button variant="outline" onClick={() => toast.success('Contoh toast sukses')}>Coba toast</Button>} />

            <div className="flex flex-col gap-3">
                <Section title="Warna (token tema)" description="Hanya lewat token di src/index.css. Jangan menulis warna sendiri.">
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {TOKENS.map(([name, swatch, use]) => (
                            <div key={name} className="flex items-center gap-2.5">
                                <span className={`size-8 shrink-0 rounded-md border border-line ${swatch}`} />
                                <div className="min-w-0">
                                    <p className="font-mono text-xs">{name}</p>
                                    <p className="truncate text-xs text-muted">{use}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>

                <Section title="Tipografi dan ukuran" description="Font Instrument Sans. Isi text-sm (0.8125rem), label dan hint text-xs, kontrol h-8, radius rounded-md, kartu rounded-lg border border-line.">
                    <p className="text-base font-semibold">Judul halaman (text-base font-semibold)</p>
                    <p className="text-sm">Isi dan sel tabel (text-sm)</p>
                    <p className="text-xs text-muted">Label, keterangan, dan hint (text-xs text-muted)</p>
                </Section>

                <Section title="Tombol" description="Aksi level halaman: ikon + label. Footer dialog: hanya teks. Aksi baris tabel: ikon saja dengan Tip.">
                    <div className="flex flex-wrap items-center gap-2">
                        <Button><Plus /> Tambah</Button>
                        <Button variant="outline"><Download /> Ekspor</Button>
                        <Button variant="ghost">Ghost</Button>
                        <Button variant="danger"><Trash2 /> Hapus</Button>
                        <Button size="sm">Kecil</Button>
                        <Button loading><Save /> Menyimpan</Button>
                        <Button disabled>Nonaktif</Button>
                        <Button variant="ghost" size="icon" aria-label="Cari"><Search /></Button>
                    </div>
                </Section>

                <Section title="Isian" description="Field: label text-xs, tanda * merah untuk wajib, galat di bawah isian.">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <Field label="Teks" required hint="Contoh hint"><Input placeholder="Ketik sesuatu" /></Field>
                        <Field label="Dengan galat" error="Kolom ini wajib diisi."><Input aria-invalid /></Field>
                        <Field label="Kata sandi"><PasswordInput placeholder="********" /></Field>
                        <Field label="Angka"><Input type="number" className="text-right tabular-nums" defaultValue={1500000} /></Field>
                        <Field label="Pilihan"><Combobox options={[{ value: 'a', label: 'Opsi A' }, { value: 'b', label: 'Opsi B', description: 'Pembeda pilihan yang mirip' }, { value: 'c', label: 'Opsi C' }]} value={select} onChange={setSelect} clearable /></Field>
                        <Field label="Tanggal"><DatePicker value={date} onChange={setDate} placeholder="Pilih tanggal" /></Field>
                        <Field label="Kode verifikasi"><CodeInput value={code} onValueChange={setCode} placeholder="••••••" /></Field>
                    </div>
                </Section>

                <Section title="Badge, kosong, galat, dan memuat">
                    <div className="flex flex-wrap gap-2">{TONES.map((t) => <Badge key={t} tone={t}>{t}</Badge>)}</div>
                    <div className="grid gap-3 md:grid-cols-3">
                        <Card><EmptyState icon={<Inbox />} title="Belum ada data" description="Keadaan kosong dengan tombol aksi." action={<Button size="sm"><Plus /> Tambah</Button>} /></Card>
                        <Card><ErrorState message="Server tidak dapat dihubungi." onRetry={() => toast.info('Mencoba lagi…')} /></Card>
                        <Card className="flex flex-col gap-2 p-3"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-1/2" /></Card>
                    </div>
                </Section>

                <div>
                    <div className="mb-2 flex items-center justify-between gap-2">
                        <div>
                            <h2 className="text-sm font-semibold">Tabel (DataTable) dan contoh CRUD</h2>
                            <p className="text-xs text-muted">Data statis di memori: Tambah, Ubah, dan Hapus membuka dialog lalu mengubah tabel. Muat ulang halaman untuk mengembalikan.</p>
                        </div>
                        <Button size="sm" onClick={() => openDraft(EMPTY_DRAFT)}><Plus />Tambah</Button>
                    </div>
                    <DataTable
                        rows={visible}
                        rowKey={(r) => r.id}
                        columns={columns}
                        onRowClick={(r) => openDraft({ id: r.id, name: r.name, status: r.status, amount: String(r.amount) })}
                        toolbar={<FilterBar search={<SearchInput value={search} onChange={setSearch} placeholder="Cari…" label="Cari contoh" />}><Combobox className="w-full sm:w-36" clearable searchable={false} placeholder="Status" options={TONES.map((t) => ({ value: t, label: t }))} value={status} onChange={setStatus} /></FilterBar>}
                        empty={{ icon: <Inbox />, title: 'Tidak ada data' }}
                    />
                </div>

                <Section title="Dialog" description="Footer: tombol batal paling kiri, tombol konfirmasi paling kanan.">
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setModal(true)}>Buka dialog</Button>
                        <Button variant="outline" onClick={() => setConfirm(true)}>Buka konfirmasi</Button>
                    </div>
                </Section>

                <Section title="Halaman error dan pemeliharaan" description="HTML statis di error-pages/ untuk disajikan web server saat aplikasi tidak bisa menjawab. Di dalam aplikasi, 404 tampil lewat pages/not-found.tsx.">
                    <Tabs defaultValue="503">
                        <TabsList className="flex-wrap">
                            {ERROR_PAGES.map((p) => (
                                <TabsTrigger key={p.code} value={p.code}>
                                    {p.code} {ERROR_LABELS[p.code]}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        {ERROR_PAGES.map((p) => (
                            <TabsContent key={p.code} value={p.code} className="pt-3">
                                <iframe title={`Halaman error ${p.code}`} sandbox="" srcDoc={p.html} className="h-[420px] w-full rounded-md border border-line bg-white" />
                            </TabsContent>
                        ))}
                    </Tabs>
                </Section>

                <Section title="Email kode OTP" description="Pratinjau templatenya (email/login-code.ts). Versi Blade untuk Laravel ada di email/blade.">
                    <iframe title="Pratinjau email OTP" srcDoc={email.html} className="h-[560px] w-full rounded-md border border-line bg-white" />
                    <pre className="max-h-56 overflow-auto rounded-md bg-canvas p-3 text-xs whitespace-pre-wrap">{email.text}</pre>
                </Section>
            </div>

            <Modal open={draft !== null} onOpenChange={(next) => !next && setDraft(null)} title={draft?.id === null ? 'Tambah data' : 'Ubah data'} description="Isi lalu simpan. Galat validasi tampil di bawah kolom.">
                {draft && (
                    <form noValidate onSubmit={(e) => { e.preventDefault(); save(); }}>
                        <div className="grid gap-3 p-4">
                            <Field label="Nama" required error={nameError}>
                                <Input autoFocus value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} aria-invalid={!!nameError} />
                            </Field>
                            <Field label="Status">
                                <Combobox searchable={false} options={TONES.map((t) => ({ value: t, label: t }))} value={draft.status} onChange={(v) => setDraft({ ...draft, status: (v ?? 'neutral') as BadgeTone })} />
                            </Field>
                            <Field label="Nilai (Rp)">
                                <Input inputMode="numeric" value={draft.amount} onChange={(e) => setDraft({ ...draft, amount: e.target.value.replace(/\D/g, '') })} />
                            </Field>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDraft(null)}>Batal</Button>
                            <Button type="submit"><Check />Simpan</Button>
                        </DialogFooter>
                    </form>
                )}
            </Modal>
            <ConfirmDialog
                open={removing !== null}
                onOpenChange={(next) => !next && setRemoving(null)}
                title="Hapus data?"
                description={`"${removing?.name ?? ''}" akan dihapus dari contoh ini.`}
                onConfirm={() => {
                    setRows((all) => all.filter((r) => r.id !== removing?.id));
                    setRemoving(null);
                    toast.success('Dihapus');
                }}
            />

            <Modal open={modal} onOpenChange={setModal} title="Contoh dialog" description="Dialog kecil untuk tambah atau ubah data.">
                <div className="p-4">
                    <Field label="Nama" required><Input autoFocus /></Field>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setModal(false)}>Batal</Button>
                    <Button onClick={() => { setModal(false); toast.success('Tersimpan'); }}><Check />Simpan</Button>
                </DialogFooter>
            </Modal>
            <ConfirmDialog open={confirm} onOpenChange={setConfirm} title="Hapus data?" description="Ini akan menghapus data secara permanen." onConfirm={() => { setConfirm(false); toast.success('Dihapus'); }} />
        </>
    );
}

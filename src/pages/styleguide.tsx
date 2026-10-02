import { Check, Download, Inbox, Plus, Save, Search, Trash2 } from 'lucide-react';
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

const TONES: BadgeTone[] = ['neutral', 'info', 'success', 'warning', 'danger'];

type Row = { id: number; name: string; status: BadgeTone; amount: number };
const ROWS: Row[] = [
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
    const email = renderLoginCodeEmail({ appName: 'Starter Kit', code: '482915', minutes: 10, name: 'Rina Wulandari', sentAt: '1 Oktober 2026, 21:16 WIB' });

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
                <Tip label="Hapus">
                    <Button variant="ghost" size="icon" aria-label={`Hapus ${r.name}`}>
                        <Trash2 />
                    </Button>
                </Tip>
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
                    <h2 className="mb-2 text-sm font-semibold">Tabel (DataTable)</h2>
                    <DataTable
                        rows={ROWS}
                        rowKey={(r) => r.id}
                        columns={columns}
                        onRowClick={(r) => toast.info(`Baris ${r.name}`)}
                        toolbar={<FilterBar search={<SearchInput value={search} onChange={setSearch} placeholder="Cari…" label="Cari contoh" />}><Combobox className="w-full sm:w-36" clearable searchable={false} placeholder="Status" options={TONES.map((t) => ({ value: t, label: t }))} value={null} onChange={() => undefined} /></FilterBar>}
                        empty={{ icon: <Inbox />, title: 'Tidak ada data' }}
                    />
                </div>

                <Section title="Dialog" description="Footer: tombol batal paling kiri, tombol konfirmasi paling kanan.">
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setModal(true)}>Buka dialog</Button>
                        <Button variant="outline" onClick={() => setConfirm(true)}>Buka konfirmasi</Button>
                    </div>
                </Section>

                <Section title="Email kode OTP" description="Pratinjau templatenya (email/login-code.ts). Versi Blade untuk Laravel ada di email/blade.">
                    <iframe title="Pratinjau email OTP" srcDoc={email.html} className="h-[560px] w-full rounded-md border border-line bg-white" />
                    <pre className="max-h-56 overflow-auto rounded-md bg-canvas p-3 text-xs whitespace-pre-wrap">{email.text}</pre>
                </Section>
            </div>

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

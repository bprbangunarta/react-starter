import { Copy, Download, Inbox, Info, MoreHorizontal, Pencil, Plus, Save, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { renderLoginCodeEmail } from '../../email/login-code';
import { Button } from '@/components/ui/button';
import { CodeInput } from '@/components/ui/code-input';
import { Checkbox, RadioGroup, Switch } from '@/components/ui/choice';
import { ColorInput } from '@/components/ui/color-input';
import { Combobox } from '@/components/ui/combobox';
import { CurrencyInput } from '@/components/ui/currency-input';
import { DataTable } from '@/components/ui/data-table';
import type { Column } from '@/components/ui/data-table';
import { DatePicker } from '@/components/ui/date-picker';
import { DropdownContent, DropdownItem, DropdownLabel, DropdownMenu, DropdownSeparator, DropdownTrigger } from '@/components/ui/dropdown';
import { ConfirmDialog, DialogBody, DialogFooter, Modal } from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import { FileInput } from '@/components/ui/file-input';
import { FilterBar, SearchInput } from '@/components/ui/filter-bar';
import { Input } from '@/components/ui/input';
import { MaskedInput } from '@/components/ui/masked-input';
import { Alert, Badge, Card, CardBody, CardFooter, CardHeader, EmptyState, ErrorState, PageHeader, Skeleton } from '@/components/ui/misc';
import type { BadgeTone } from '@/components/ui/misc';
import { PasswordInput } from '@/components/ui/password-input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tip } from '@/components/ui/tooltip';
import { APP_NAME } from '@/lib/brand';
import { rupiah } from '@/lib/format';
import { MASKS } from '@/lib/mask';
import { useTitle } from '@/lib/title';

/** Every `--color-*` token of src/index.css (a test keeps this list complete). Class names are written out so Tailwind can see them. */
const TOKENS = [
    ['primary', 'bg-primary', 'Warna utama: tombol, tautan, item menu aktif, fokus'],
    ['primary-hover', 'bg-primary-hover', 'Tombol utama saat disorot'],
    ['primary-soft', 'bg-primary-soft', 'Latar lembut warna utama (item menu aktif, area tarik berkas)'],
    ['surface', 'bg-surface', 'Kartu, sidebar, header, dialog'],
    ['canvas', 'bg-canvas', 'Latar halaman, header tabel, hover'],
    ['line', 'bg-line', 'Garis pemisah dan batas'],
    ['ink', 'bg-ink', 'Teks utama'],
    ['muted', 'bg-muted', 'Teks pendukung (label, hint, header tabel)'],
    ['danger', 'bg-danger', 'Galat, tombol hapus'],
    ['success', 'bg-success', 'Berhasil: ikon dan elemen solid'],
    ['success-soft', 'bg-success-soft', 'Berhasil: latar badge, alert, toast'],
    ['success-line', 'bg-success-line', 'Berhasil: garis tepi'],
    ['success-ink', 'bg-success-ink', 'Berhasil: teks di atas latar soft'],
    ['warning', 'bg-warning', 'Peringatan: ikon dan elemen solid'],
    ['warning-soft', 'bg-warning-soft', 'Peringatan: latar badge, alert, toast'],
    ['warning-line', 'bg-warning-line', 'Peringatan: garis tepi'],
    ['warning-ink', 'bg-warning-ink', 'Peringatan: teks di atas latar soft'],
    ['info', 'bg-info', 'Informasi: ikon dan elemen solid'],
    ['info-soft', 'bg-info-soft', 'Informasi: latar badge, alert, toast'],
    ['info-line', 'bg-info-line', 'Informasi: garis tepi'],
    ['info-ink', 'bg-info-ink', 'Informasi: teks di atas latar soft'],
    ['danger-soft', 'bg-danger-soft', 'Galat: latar badge, alert, toast'],
    ['danger-line', 'bg-danger-line', 'Galat: garis tepi'],
    ['danger-ink', 'bg-danger-ink', 'Galat: teks di atas latar soft'],
];

/** The static error pages (error-pages/*.html, made by `npm run error-pages`), keyed by status code. */
const ERROR_PAGES = Object.entries(import.meta.glob<string>('../../error-pages/*.html', { query: '?raw', import: 'default', eager: true }))
    .map(([file, html]) => ({ code: /(\d{3})\.html$/.exec(file)?.[1] ?? file, html }))
    .sort((a, b) => a.code.localeCompare(b.code));
const ERROR_LABELS: Record<string, string> = {
    '401': 'Perlu masuk',
    '403': 'Akses ditolak',
    '404': 'Tidak ditemukan',
    '419': 'Kedaluwarsa',
    '429': 'Terlalu banyak',
    '500': 'Galat server',
    '503': 'Pemeliharaan',
};

/** Status ladder: one row per tone. Class names are written out so Tailwind can see them. */
const STATUS = [
    {
        tone: 'success',
        label: 'Berhasil',
        swatches: ['bg-success', 'bg-success-soft', 'bg-success-line', 'bg-success-ink'],
        notify: () => toast.success('Data tersimpan'),
    },
    { tone: 'info', label: 'Informasi', swatches: ['bg-info', 'bg-info-soft', 'bg-info-line', 'bg-info-ink'], notify: () => toast.info('Ada pembaruan data') },
    {
        tone: 'warning',
        label: 'Peringatan',
        swatches: ['bg-warning', 'bg-warning-soft', 'bg-warning-line', 'bg-warning-ink'],
        notify: () => toast.warning('Sesi hampir berakhir'),
    },
    {
        tone: 'danger',
        label: 'Galat',
        swatches: ['bg-danger', 'bg-danger-soft', 'bg-danger-line', 'bg-danger-ink'],
        notify: () => toast.error('Gagal menyimpan data'),
    },
] as const;

const TONES: BadgeTone[] = ['neutral', 'info', 'success', 'warning', 'danger'];

type Row = { id: number; name: string; status: BadgeTone; amount: number };
type Draft = { id: number | null; name: string; status: BadgeTone; amount: string };
const EMPTY_DRAFT: Draft = { id: null, name: '', status: 'success', amount: '' };
const NAMES = ['Alfa', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa', 'Lambda', 'Sigma'];
const STATUSES: BadgeTone[] = ['success', 'warning', 'danger', 'info', 'neutral'];
const INITIAL_ROWS: Row[] = NAMES.map((name, index) => ({
    id: index + 1,
    name: `Proyek ${name}`,
    status: STATUSES[index % STATUSES.length] ?? 'neutral',
    amount: 870_000 + ((index * 3_730_000) % 12_000_000),
}));

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
    return (
        <Card>
            <CardHeader title={title} description={description} />
            <CardBody className="flex flex-col gap-3">{children}</CardBody>
        </Card>
    );
}

function SubTitle({ children }: { children: ReactNode }) {
    return <h3 className="text-xs font-semibold text-muted uppercase tracking-wide">{children}</h3>;
}

/** Every kind of input the app uses, each with its own state. Money, phone, and other formatted fields send the raw value to the API. */
function InputExamples() {
    const [select, setSelect] = useState<string | null>('b');
    const [date, setDate] = useState('');
    const [code, setCode] = useState('');
    const [amount, setAmount] = useState<number | null>(1_500_000);
    const [quantity, setQuantity] = useState<number | null>(12_500);
    const [phone, setPhone] = useState('081234567890');
    const [nik, setNik] = useState('');
    const [npwp, setNpwp] = useState('');
    const [color, setColor] = useState('');
    const [note, setNote] = useState('');
    const [agree, setAgree] = useState(true);
    const [notify, setNotify] = useState(true);
    const [channel, setChannel] = useState('email');
    const [files, setFiles] = useState<File[]>([]);

    return (
        <Section
            title="Isian"
            description="Field: label text-xs, tanda * merah untuk wajib, hint atau galat di bawah isian. Label dan galat otomatis terhubung ke isian lewat Field."
        >
            <SubTitle>Teks dan sandi</SubTitle>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Teks" required hint="Contoh hint">
                    <Input placeholder="Ketik sesuatu" />
                </Field>
                <Field label="Dengan galat" error="Kolom ini wajib diisi.">
                    <Input />
                </Field>
                <Field label="Kata sandi">
                    <PasswordInput placeholder="********" />
                </Field>
                <Field label="Kode verifikasi">
                    <CodeInput value={code} onValueChange={setCode} placeholder="••••••" />
                </Field>
            </div>

            <SubTitle>Angka dan mata uang (format otomatis)</SubTitle>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Nominal (Rp)" hint={`Nilai dikirim: ${amount ?? 'kosong'}`}>
                    <CurrencyInput value={amount} onValueChange={setAmount} placeholder="0" />
                </Field>
                <Field label="Angka dengan pemisah ribuan" hint={`Nilai dikirim: ${quantity ?? 'kosong'}`}>
                    <CurrencyInput prefix={null} value={quantity} onValueChange={setQuantity} placeholder="0" />
                </Field>
                <Field label="Angka biasa">
                    <Input type="number" className="text-right tabular-nums" defaultValue={42} />
                </Field>
            </div>

            <SubTitle>Masking (format saat mengetik)</SubTitle>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="No. telepon" hint={`Nilai dikirim: ${phone || 'kosong'}`}>
                    <MaskedInput mask={MASKS.phone} value={phone} onValueChange={setPhone} placeholder="0812-3456-7890" />
                </Field>
                <Field label="NIK (16 digit)" hint={`${nik.length}/16 digit`}>
                    <MaskedInput mask={MASKS.nik} value={nik} onValueChange={setNik} placeholder="3171 0123 4567 8901" />
                </Field>
                <Field label="NPWP (15 digit)" hint={`${npwp.length}/15 digit`}>
                    <MaskedInput mask={MASKS.npwp} value={npwp} onValueChange={setNpwp} placeholder="01.234.567.8-901.234" />
                </Field>
            </div>

            <SubTitle>Pilihan dan tanggal</SubTitle>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Pilihan (Combobox)">
                    <Combobox
                        options={[
                            { value: 'a', label: 'Opsi A' },
                            { value: 'b', label: 'Opsi B', description: 'Pembeda pilihan yang mirip' },
                            { value: 'c', label: 'Opsi C' },
                        ]}
                        value={select}
                        onChange={setSelect}
                        clearable
                    />
                </Field>
                <Field label="Tanggal">
                    <DatePicker value={date} onChange={setDate} placeholder="Pilih tanggal" />
                </Field>
                <Field label="Warna" hint="Pemilih warna, kode hex, dan warna siap pakai" className="sm:col-span-2">
                    <ColorInput value={color} onValueChange={setColor} />
                </Field>
            </div>

            <SubTitle>Teks panjang, centang, sakelar, dan radio</SubTitle>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Catatan" hint="Penghitung muncul bila ada maxLength" className="sm:col-span-2">
                    <Textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} placeholder="Tulis catatan…" />
                </Field>
                <div className="flex flex-col gap-3">
                    <Checkbox
                        checked={agree}
                        onCheckedChange={(v) => setAgree(v === true)}
                        label="Saya setuju dengan ketentuan"
                        description="Pilihan yang menunggu tombol Simpan."
                    />
                    <Switch checked={notify} onCheckedChange={setNotify} label="Notifikasi email" description="Berlaku seketika." />
                </div>
                <Field label="Kirim kode lewat">
                    <RadioGroup
                        aria-label="Kirim kode lewat"
                        value={channel}
                        onValueChange={setChannel}
                        options={[
                            { value: 'email', label: 'Email' },
                            { value: 'sms', label: 'SMS', description: 'Tarif operator berlaku' },
                            { value: 'wa', label: 'WhatsApp', disabled: true },
                        ]}
                    />
                </Field>
            </div>

            <SubTitle>Berkas</SubTitle>
            <Field label="Lampiran" hint="PDF atau gambar, maksimal 2 MB" className="max-w-md">
                <FileInput value={files} onValueChange={setFiles} multiple accept=".pdf,image/*" maxBytes={2 * 1024 * 1024} onReject={(m) => toast.error(m)} />
            </Field>
        </Section>
    );
}

/** A living reference of every shared component and token. Compare any new screen against it. */
export default function Styleguide() {
    useTitle('Panduan tampilan');
    const [modal, setModal] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<string | null>(null);
    const [rows, setRows] = useState<Row[]>(INITIAL_ROWS);
    const [draft, setDraft] = useState<Draft | null>(null);
    const [nameError, setNameError] = useState<string | undefined>();
    const [removing, setRemoving] = useState<Row | null>(null);
    const email = renderLoginCodeEmail({ appName: APP_NAME, code: '482915', minutes: 10, name: 'Rina Wulandari', sentAt: '1 Oktober 2026, 21:16 WIB' });

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(5);
    const matching = rows.filter((r) => r.name.toLowerCase().includes(search.trim().toLowerCase()) && (status === null || r.status === status));
    const lastPage = Math.max(1, Math.ceil(matching.length / perPage));
    const current = Math.min(page, lastPage);
    const visible = matching.slice((current - 1) * perPage, current * perPage);

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
        setRows((all) =>
            draft.id === null
                ? [...all, { id: Math.max(0, ...all.map((r) => r.id)) + 1, ...next }]
                : all.map((r) => (r.id === draft.id ? { ...r, ...next } : r)),
        );
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
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Ubah ${r.name}`}
                            onClick={() => openDraft({ id: r.id, name: r.name, status: r.status, amount: String(r.amount) })}
                        >
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
            <PageHeader
                title="Panduan tampilan"
                description="Acuan komponen dan token. Tampilan baru harus terlihat sama dengan ini"
                actions={
                    <Button variant="outline" onClick={() => toast.success('Contoh toast sukses')}>
                        Coba toast
                    </Button>
                }
            />

            <div className="flex flex-col gap-3">
                <Section
                    title="Warna (token tema)"
                    description="Semua token warna di src/index.css, termasuk keluarga status (success, warning, info, danger). Hanya lewat token; jangan menulis warna sendiri."
                >
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {TOKENS.map(([name, swatch, use]) => (
                            <div key={name} className="flex min-w-0 items-center gap-2.5">
                                <span className={`size-8 shrink-0 rounded-md border border-line ${swatch}`} />
                                <div className="min-w-0">
                                    <p className="font-mono text-xs">{name}</p>
                                    <p className="truncate text-xs text-muted">{use}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>

                <Section
                    title="Tipografi dan ukuran"
                    description="Font Instrument Sans. Isi text-sm (0.8125rem), label dan hint text-xs, keterangan sangat kecil text-2xs, kontrol h-8, radius rounded-md, kartu rounded-lg border border-line."
                >
                    <p className="text-base font-semibold">Judul halaman (text-base font-semibold)</p>
                    <p className="text-sm">Isi dan sel tabel (text-sm)</p>
                    <p className="text-xs text-muted">Label, keterangan, dan hint (text-xs text-muted)</p>
                    <p className="text-2xs text-muted">Keterangan sangat kecil: badge, waktu notifikasi, label seksi sidebar, penghitung (text-2xs)</p>
                    <p className="text-xs text-muted">
                        Bayangan: <code>shadow-sm</code> bidang kecil (jempol sakelar), <code>shadow-md</code> penanda mengambang, <code>shadow-lg</code>{' '}
                        dropdown dan popover, <code>shadow-xl</code> dialog dan laci. Lapisan: header <code>z-30</code>, laci <code>z-40</code>, dialog dan
                        penanda jaringan <code>z-50</code>, tooltip <code>z-60</code>, popover <code>z-70</code>.
                    </p>
                </Section>

                <Section title="Tombol" description="Aksi level halaman: ikon + label. Footer dialog: hanya teks. Aksi baris tabel: ikon saja dengan Tip.">
                    <div className="flex flex-wrap items-center gap-2">
                        <Button>
                            <Plus /> Tambah
                        </Button>
                        <Button variant="outline">
                            <Download /> Ekspor
                        </Button>
                        <Button variant="ghost">Ghost</Button>
                        <Button variant="danger">
                            <Trash2 /> Hapus
                        </Button>
                        <Button size="sm">Kecil</Button>
                        <Button loading>
                            <Save /> Menyimpan
                        </Button>
                        <Button disabled>Nonaktif</Button>
                        <Button variant="ghost" size="icon" aria-label="Cari">
                            <Search />
                        </Button>
                    </div>
                </Section>

                <InputExamples />

                <Section
                    title="Warna status (badge, alert, toast)"
                    description="Satu keluarga warna: tiap nada punya base (ikon), soft (latar), line (garis), dan ink (teks). Toast, badge, alert, dan indikator jaringan memakai token yang sama."
                >
                    <div className="grid gap-2.5">
                        {STATUS.map((s) => (
                            <div key={s.tone} className="grid items-center gap-2 md:grid-cols-[9rem_8rem_auto_1fr_auto]">
                                <p className="text-xs font-medium">{s.label}</p>
                                <div className="flex gap-1">
                                    {s.swatches.map((c) => (
                                        <span key={c} title={c} className={`size-6 rounded border border-line ${c}`} />
                                    ))}
                                </div>
                                <Badge tone={s.tone} className="justify-self-start">
                                    {s.tone}
                                </Badge>
                                <Alert tone={s.tone} className="py-1.5 text-xs">
                                    Contoh pesan {s.label.toLowerCase()} di dalam halaman.
                                </Alert>
                                <Button variant="outline" size="sm" className="justify-self-start" onClick={s.notify}>
                                    Coba toast
                                </Button>
                            </div>
                        ))}
                    </div>
                </Section>

                <Section title="Badge, kosong, galat, dan memuat">
                    <div className="flex flex-wrap gap-2">
                        {TONES.map((t) => (
                            <Badge key={t} tone={t}>
                                {t}
                            </Badge>
                        ))}
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                        <Card>
                            <EmptyState
                                icon={<Inbox />}
                                title="Belum ada data"
                                description="Keadaan kosong dengan tombol aksi."
                                action={
                                    <Button size="sm">
                                        <Plus /> Tambah
                                    </Button>
                                }
                            />
                        </Card>
                        <Card>
                            <ErrorState message="Server tidak dapat dihubungi." onRetry={() => toast.info('Mencoba lagi…')} />
                        </Card>
                        <Card className="flex flex-col gap-2 p-3">
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-1/2" />
                        </Card>
                    </div>
                </Section>

                <div>
                    <div className="mb-2 flex items-center justify-between gap-2">
                        <div>
                            <h2 className="text-sm font-semibold">Tabel (DataTable) dan contoh CRUD</h2>
                            <p className="text-xs text-muted">
                                Data statis di memori: Tambah, Ubah, dan Hapus membuka dialog lalu mengubah tabel. Muat ulang halaman untuk mengembalikan.
                            </p>
                        </div>
                        <Button size="sm" onClick={() => openDraft(EMPTY_DRAFT)}>
                            <Plus />
                            Tambah
                        </Button>
                    </div>
                    <DataTable
                        rows={visible}
                        rowKey={(r) => r.id}
                        columns={columns}
                        onRowClick={(r) => openDraft({ id: r.id, name: r.name, status: r.status, amount: String(r.amount) })}
                        toolbar={
                            <FilterBar search={<SearchInput value={search} onChange={setSearch} placeholder="Cari…" label="Cari contoh" />}>
                                <Combobox
                                    className="w-full sm:w-36"
                                    clearable
                                    searchable={false}
                                    placeholder="Status"
                                    options={TONES.map((t) => ({ value: t, label: t }))}
                                    value={status}
                                    onChange={setStatus}
                                />
                            </FilterBar>
                        }
                        pagination={{
                            meta: {
                                current_page: current,
                                last_page: lastPage,
                                from: matching.length === 0 ? 0 : (current - 1) * perPage + 1,
                                to: Math.min(matching.length, current * perPage),
                                total: matching.length,
                            },
                            perPage,
                            options: [5, 10],
                            onPage: setPage,
                            onPerPage: (value) => {
                                setPerPage(value);
                                setPage(1);
                            },
                        }}
                        empty={{ icon: <Inbox />, title: 'Tidak ada data' }}
                    />
                </div>

                <Section
                    title="Kartu: header, body, footer"
                    description="Disusun seperti dialog. Footer (garis atas) hanya ada bila kartu punya tombol; tombol batal di kiri, konfirmasi di kanan, hanya teks. Kartu tanpa tombol tidak punya footer."
                >
                    <div className="grid gap-3 md:grid-cols-2">
                        <Card>
                            <CardHeader title="Kartu form" description="Ada tombol, jadi ada footer" />
                            <CardBody className="flex flex-col gap-3">
                                <Field label="Nama" required>
                                    <Input placeholder="Ketik sesuatu" />
                                </Field>
                            </CardBody>
                            <CardFooter>
                                <p className="text-xs text-muted">Hint boleh di kiri footer.</p>
                                <Button onClick={() => toast.success('Tersimpan')}>Simpan</Button>
                            </CardFooter>
                        </Card>
                        <Card>
                            <CardHeader title="Kartu informasi" description="Tanpa tombol, jadi tanpa footer" actions={<Badge tone="success">Aktif</Badge>} />
                            <CardBody>
                                <p className="text-sm">Isi kartu. Aksi di header (badge atau tombol ikon + label) boleh ada tanpa footer.</p>
                            </CardBody>
                        </Card>
                    </div>
                </Section>

                <Section
                    title="Menu dropdown dan tooltip"
                    description="Dropdown untuk beberapa aksi di satu tempat (menu akun, aksi baris yang banyak): item berikon, pemisah, dan item berbahaya di bawah. Tip memberi nama pada tombol ikon."
                >
                    <div className="flex flex-wrap items-center gap-2">
                        <DropdownMenu>
                            <DropdownTrigger asChild>
                                <Button variant="outline">
                                    <MoreHorizontal /> Aksi
                                </Button>
                            </DropdownTrigger>
                            <DropdownContent>
                                <DropdownLabel>Proyek Alfa</DropdownLabel>
                                <DropdownItem icon={<Pencil />} onSelect={() => toast.info('Ubah')}>
                                    Ubah
                                </DropdownItem>
                                <DropdownItem icon={<Copy />} onSelect={() => toast.info('Duplikat')}>
                                    Duplikat
                                </DropdownItem>
                                <DropdownSeparator />
                                <DropdownItem danger icon={<Trash2 />} onSelect={() => toast.error('Hapus')}>
                                    Hapus
                                </DropdownItem>
                            </DropdownContent>
                        </DropdownMenu>
                        <Tip label="Contoh tooltip">
                            <Button variant="ghost" size="icon" aria-label="Info">
                                <Info />
                            </Button>
                        </Tip>
                    </div>
                </Section>

                <Section
                    title="Dialog"
                    description="Header (judul), body (isi atau pesan konfirmasi), footer (tombol teks: batal paling kiri, konfirmasi paling kanan)."
                >
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setModal(true)}>
                            Buka dialog
                        </Button>
                        <Button variant="outline" onClick={() => setConfirm(true)}>
                            Buka konfirmasi
                        </Button>
                    </div>
                </Section>

                <Section
                    title="Halaman error dan pemeliharaan"
                    description="HTML statis di error-pages/ untuk disajikan web server saat aplikasi tidak bisa menjawab. Di dalam aplikasi, 404 tampil lewat pages/not-found.tsx."
                >
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
                                <iframe
                                    title={`Halaman error ${p.code}`}
                                    sandbox=""
                                    srcDoc={p.html}
                                    className="h-[420px] w-full rounded-md border border-line bg-white"
                                />
                            </TabsContent>
                        ))}
                    </Tabs>
                </Section>

                <Section title="Email kode OTP" description="Pratinjau templatenya (email/login-code.ts). Versi Blade untuk Laravel ada di email/blade.">
                    <iframe title="Pratinjau email OTP" srcDoc={email.html} className="h-[560px] w-full rounded-md border border-line bg-white" />
                    <pre className="max-h-56 overflow-auto rounded-md bg-canvas p-3 text-xs whitespace-pre-wrap">{email.text}</pre>
                </Section>
            </div>

            <Modal
                open={draft !== null}
                onOpenChange={(next) => !next && setDraft(null)}
                title={draft?.id === null ? 'Tambah data' : 'Ubah data'}
                description="Isi lalu simpan. Galat validasi tampil di bawah kolom."
            >
                {draft && (
                    <form
                        noValidate
                        onSubmit={(e) => {
                            e.preventDefault();
                            save();
                        }}
                    >
                        <DialogBody className="grid gap-3">
                            <Field label="Nama" required error={nameError}>
                                <Input autoFocus value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} aria-invalid={!!nameError} />
                            </Field>
                            <Field label="Status">
                                <Combobox
                                    searchable={false}
                                    options={TONES.map((t) => ({ value: t, label: t }))}
                                    value={draft.status}
                                    onChange={(v) => setDraft({ ...draft, status: (v ?? 'neutral') as BadgeTone })}
                                />
                            </Field>
                            <Field label="Nilai (Rp)">
                                <Input
                                    inputMode="numeric"
                                    value={draft.amount}
                                    onChange={(e) => setDraft({ ...draft, amount: e.target.value.replace(/\D/g, '') })}
                                />
                            </Field>
                        </DialogBody>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDraft(null)}>
                                Batal
                            </Button>
                            <Button type="submit">Simpan</Button>
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
                <DialogBody>
                    <Field label="Nama" required>
                        <Input autoFocus />
                    </Field>
                </DialogBody>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setModal(false)}>
                        Batal
                    </Button>
                    <Button
                        onClick={() => {
                            setModal(false);
                            toast.success('Tersimpan');
                        }}
                    >
                        Simpan
                    </Button>
                </DialogFooter>
            </Modal>
            <ConfirmDialog
                open={confirm}
                onOpenChange={setConfirm}
                title="Hapus data?"
                description="Ini akan menghapus data secara permanen."
                onConfirm={() => {
                    setConfirm(false);
                    toast.success('Dihapus');
                }}
            />
        </>
    );
}

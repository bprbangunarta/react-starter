import { Copy, Database, Download, Inbox, Info, LayoutDashboard, MoreHorizontal, Pencil, Plus, Save, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { renderLoginCodeEmail } from '../../email/login-code';
import { Button, buttonVariants } from '@/components/ui/button';
import { ILLUSTRATIONS, Illustration } from '@/components/illustrations';
import type { IllustrationName } from '@/components/illustrations';
import { ThemeMenu } from '@/components/theme-menu';
import { MenuLink, SubMenu } from '@/layouts/app-layout';
import { ERROR_PAGES as ERROR_SCREENS } from '@/lib/error-pages';
import { BarChart, ColumnChart, DonutChart } from '@/components/ui/chart';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Drawer, DrawerBody } from '@/components/ui/drawer';
import { Progress } from '@/components/ui/progress';
import { Stepper } from '@/components/ui/stepper';
import { DropdownContent, DropdownItem, DropdownLabel, DropdownMenu, DropdownSeparator, DropdownTrigger } from '@/components/ui/dropdown';
import { ConfirmDialog, DialogBody, DialogFooter, Modal } from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Alert, Badge, Card, CardBody, CardFooter, CardHeader, EmptyState, ErrorState, PageHeader, Skeleton } from '@/components/ui/misc';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tip } from '@/components/ui/tooltip';
import { APP_NAME } from '@/lib/brand';
import { useTitle } from '@/lib/title';
import { InputExamples } from '@/pages/ui-guideline/inputs';
import { Section, SubTitle } from '@/pages/ui-guideline/parts';
import { TONES, TableExample } from '@/pages/ui-guideline/table';

/** Every `--color-*` token of src/index.css (a test keeps this list complete). Class names are written out so Tailwind can see them. */
const TOKENS = [
    ['primary', 'bg-primary', 'Warna utama: tombol, tautan, item menu aktif, fokus'],
    ['primary-hover', 'bg-primary-hover', 'Tombol utama saat disorot'],
    ['primary-soft', 'bg-primary-soft', 'Latar lembut warna utama (item menu aktif, area tarik berkas)'],
    ['surface', 'bg-surface', 'Kartu, sidebar, header, dialog'],
    ['on-primary', 'bg-on-primary', 'Teks dan ikon di atas isian primary atau danger'],
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
    ['chart-1', 'bg-chart-1', 'Grafik: warna seri 1 (tanpa arti status)'],
    ['chart-2', 'bg-chart-2', 'Grafik: warna seri 2 (tanpa arti status)'],
    ['chart-3', 'bg-chart-3', 'Grafik: warna seri 3 (tanpa arti status)'],
    ['chart-4', 'bg-chart-4', 'Grafik: warna seri 4 (tanpa arti status)'],
    ['chart-5', 'bg-chart-5', 'Grafik: warna seri 5 (tanpa arti status)'],
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

const CHART_DONUT = [
    { label: 'Tetap', count: 42 },
    { label: 'Kontrak', count: 18 },
    { label: 'Trainee', count: 6 },
];
const CHART_COLUMNS = [
    { label: '< 1', count: 6 },
    { label: '1-3', count: 14 },
    { label: '3-5', count: 20 },
    { label: '5-10', count: 17 },
    { label: '> 10', count: 9 },
];
const CHART_BARS = [
    { label: 'Kantor Pusat', count: 31 },
    { label: 'Kantor Cabang Utara', count: 19 },
    { label: 'Kantor Kas Selatan', count: 11 },
    { label: 'Belum diisi', count: 5 },
];

/** A living reference of every shared component and token. Compare any new screen against it. */
export default function UiGuideline() {
    useTitle('UI Guideline');
    const [modal, setModal] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [drawer, setDrawer] = useState(false);
    const [step, setStep] = useState(1);
    const email = renderLoginCodeEmail({ appName: APP_NAME, code: '482915', minutes: 10, name: 'Rina Wulandari', sentAt: '1 Oktober 2026, 21:16 WIB' });

    return (
        <>
            <PageHeader
                title="UI Guideline"
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

                <Section
                    title="Grafik"
                    description="Donat untuk sedikit bagian dari satu keseluruhan, kolom untuk rentang yang berurutan, batang mendatar untuk nama panjang. Angka selalu tertulis di samping bagiannya; warna hanya pelengkap."
                >
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="flex flex-col gap-2">
                            <SubTitle>DonutChart</SubTitle>
                            <DonutChart label="Contoh donat" items={CHART_DONUT} centerLabel="contoh" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <SubTitle>ColumnChart</SubTitle>
                            <ColumnChart label="Contoh kolom" items={CHART_COLUMNS} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <SubTitle>BarChart</SubTitle>
                            <BarChart label="Contoh batang" items={CHART_BARS} />
                        </div>
                    </div>
                </Section>

                <Section
                    title="Tema terang dan gelap"
                    description="Nama token sama di kedua tema, jadi tampilan tidak berubah per layar. Bawaannya mengikuti sistem; pilihan Terang, Gelap, atau Ikuti sistem disimpan di peramban. Teks di atas isian primary atau danger memakai on-primary, bukan putih."
                >
                    <div className="flex items-center gap-2">
                        <ThemeMenu />
                        <span className="text-xs text-muted">Ganti tema di sini atau di header, lalu lihat semua contoh di halaman ini ikut berubah.</span>
                    </div>
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

                <TableExample />

                <Section
                    title="Kartu: header, body, footer"
                    description="Disusun seperti dialog. Footer (garis atas) hanya ada bila kartu punya tombol; tombol batal di kiri, konfirmasi di kanan, hanya teks. Kartu tanpa tombol tidak punya footer."
                >
                    <div className="grid gap-3 md:grid-cols-2">
                        <Card>
                            <CardHeader title="Kartu form" description="Ada tombol, jadi ada footer" />
                            <CardBody className="flex flex-col gap-3">
                                <Field label="Nama" required>
                                    <Input maxLength={100} placeholder="Ketik sesuatu" />
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
                                <DropdownSeparator />
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
                    title="Menu sidebar dengan submenu"
                    description="Induk adalah tombol (ikon, nama, panah) yang membuka dan menutup daftar halaman; submenu tidak berikon (garis dan titik). Tertutup sampai dibuka, dan terbuka sendiri saat salah satu halamannya tampil. Daftarnya ditulis di layouts/menu.ts: { label, icon, children }."
                >
                    <nav aria-label="Contoh menu" className="flex w-60 flex-col gap-0.5 rounded-lg border border-line bg-surface p-2">
                        <MenuLink item={{ label: 'Dashboard', to: '/', icon: LayoutDashboard, end: true }} onNavigate={() => undefined} />
                        <SubMenu label="Data Master" icon={Database} onNavigate={() => undefined}>
                            {[
                                { label: 'Audit Logs', to: '/audit-logs' },
                                { label: 'UI Guideline', to: '/ui-guideline' },
                            ]}
                        </SubMenu>
                    </nav>
                </Section>

                <Section
                    title="Dialog"
                    description="Header (judul), body (isi atau pesan konfirmasi), footer (tombol teks: batal paling kiri, konfirmasi paling kanan). Dialog berisi isian tidak menutup saat klik di luar (persistent); Esc dan tombol tutup tetap bisa; fokus kembali ke tombol pembuka."
                >
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setModal(true)}>
                            Buka dialog
                        </Button>
                        <Button variant="outline" onClick={() => setConfirm(true)}>
                            Buka konfirmasi
                        </Button>
                        <Button variant="outline" onClick={() => setDrawer(true)}>
                            Buka laci (Drawer)
                        </Button>
                    </div>
                </Section>

                <Section
                    title="Navigasi, langkah, dan progres"
                    description="Breadcrumb di atas PageHeader (induk berupa tautan, halaman ini teks). Stepper untuk proses bertahap; vertikal di ponsel. Progress untuk kuota atau tugas; tanpa nilai berarti durasi tidak diketahui. Accordion melipat bagian yang jarang dibuka."
                >
                    <Breadcrumb items={[{ label: 'Beranda', to: '/' }, { label: 'UI Guideline', to: '/ui-guideline' }, { label: 'Komponen' }]} />
                    <Stepper
                        steps={[
                            { label: 'Data diri', description: 'Nama dan kontak' },
                            { label: 'Dokumen', description: 'Unggah berkas' },
                            { label: 'Konfirmasi' },
                        ]}
                        current={step}
                    />
                    <div className="flex gap-2">
                        <Button variant="outline" disabled={step === 0} onClick={() => setStep((n) => Math.max(0, n - 1))}>
                            Sebelumnya
                        </Button>
                        <Button variant="outline" disabled={step === 3} onClick={() => setStep((n) => Math.min(3, n + 1))}>
                            Berikutnya
                        </Button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                        <Progress label="Kuota penyimpanan" value={72} />
                        <Progress label="Batas hampir habis" value={92} tone="danger" />
                        <Progress label="Selesai" value={100} tone="success" />
                        <Progress aria-label="Memproses" />
                    </div>
                    <Accordion type="single" collapsible defaultValue="a" className="rounded-md border border-line px-3">
                        <AccordionItem value="a">
                            <AccordionTrigger>Apa itu starter ini?</AccordionTrigger>
                            <AccordionContent>Kerangka antarmuka dengan autentikasi, MFA, dan audit log.</AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="b">
                            <AccordionTrigger>Bagaimana menyambung backend?</AccordionTrigger>
                            <AccordionContent>Ikuti kontrak di docs/API.md, lalu hapus src/mock.</AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </Section>

                <Section
                    title="Ilustrasi"
                    description="Dipakai di layar masuk dan layar error. Warnanya token tema (ikut berubah saat rebranding), dibuat sekali di components/illustrations.tsx dan dipakai juga oleh halaman error statis. Hiasan saja: teks di sebelahnya yang menyampaikan isinya."
                >
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                        {(Object.keys(ILLUSTRATIONS) as IllustrationName[]).map((name) => (
                            <figure key={name} className="flex flex-col items-center gap-1 rounded-md border border-line p-2">
                                <Illustration name={name} className="w-full" />
                                <figcaption className="font-mono text-2xs text-muted">{name}</figcaption>
                            </figure>
                        ))}
                    </div>
                </Section>

                <Section
                    title="Halaman error dan pemeliharaan"
                    description="Layar penuh tanpa sidebar dan header: ilustrasi, apa yang terjadi dalam kata-kata (bukan hanya angka), kode kecil, dan jalan keluar. Tab di bawah adalah HTML statis di error-pages/ untuk disajikan web server saat aplikasi tidak bisa menjawab (npm run error-pages); tautan di bawahnya membuka layar yang sama di dalam aplikasi."
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
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                        <span>Di dalam aplikasi, layar penuh:</span>
                        {ERROR_SCREENS.map((screen) => (
                            <a
                                key={screen.status}
                                href={`/ui-guideline/errors/${screen.status}`}
                                target="_blank"
                                rel="noreferrer"
                                className={buttonVariants({ variant: 'outline', size: 'sm' })}
                            >
                                {screen.status}
                            </a>
                        ))}
                    </div>
                </Section>

                <Section title="Email kode OTP" description="Pratinjau templatenya (email/login-code.ts). Versi Blade untuk Laravel ada di email/blade.">
                    <iframe title="Pratinjau email OTP" srcDoc={email.html} className="h-[560px] w-full rounded-md border border-line bg-white" />
                    <pre className="max-h-56 overflow-auto rounded-md bg-canvas p-3 text-xs whitespace-pre-wrap">{email.text}</pre>
                </Section>
            </div>

            <Modal persistent open={modal} onOpenChange={setModal} title="Contoh dialog" description="Dialog kecil untuk tambah atau ubah data.">
                <DialogBody>
                    <Field label="Nama" required>
                        <Input autoFocus maxLength={60} />
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
            <Drawer open={drawer} onOpenChange={setDrawer} title="Contoh laci" description="Panel dari samping untuk rincian atau form panjang.">
                <DrawerBody>
                    <p className="text-sm">Isi laci menggulir sendiri; header tetap di atas.</p>
                </DrawerBody>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setDrawer(false)}>
                        Batal
                    </Button>
                    <Button
                        onClick={() => {
                            setDrawer(false);
                            toast.success('Tersimpan');
                        }}
                    >
                        Simpan
                    </Button>
                </DialogFooter>
            </Drawer>
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

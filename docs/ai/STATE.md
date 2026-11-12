# STATE: kondisi terkini

Diperbarui setiap selesai satu unit pekerjaan. Pegangan untuk melanjutkan di sesi baru; keputusan jangka panjang ada di [MEMORY](MEMORY.md), pekerjaan tertunda di [BACKLOG](BACKLOG.md).

**Diperbarui:** 2026-11-13 (rilis v1.0.0, diulang dari awal) · **Cabang:** `main` · **Verifikasi terakhir:** `npm run check` lolos (tsc, ESLint, Prettier, pemeriksa standar, 253 tes Vitest), `npm run build` lolos, CI GitHub Actions hijau, 0 kerentanan `npm audit`. Audit dialog dan lapisan mengambang (dialog, laci, popover, dropdown, tooltip: peran, nama, Esc, fokus kembali, klik luar, layar pendek, urutan lapisan) lolos. Audit penutup sebelumnya: 5 rute × 3 lebar layar (375/768/822) tanpa luapan, tanpa kontrol tanpa nama, tanpa id ganda; langkah di README (melepas mock, rebrand) disimulasikan di salinan dan lolos.

## Yang sudah ada

- **Layar:** login, verifikasi dua langkah, kata sandi kedaluwarsa, Dashboard (placeholder), Profil (data akun, foto profil, kata sandi, MFA), Audit Logs (filter, detail, ekspor CSV, verifikasi rantai), UI Guideline (`/ui-guideline`), File Manage (`/file-manage`, contoh pengelola berkas dengan data di memori), 404, penanda koneksi, dialog konfirmasi kata sandi (reauth).
- **Komponen UI** di `src/components/ui`, semuanya punya contoh di UI Guideline (dijaga tes): Button, Input/InputGroup/Field, CurrencyInput, MaskedInput, FilteredInput, charts (Donut/Column/Bar), ColorInput, Textarea, Checkbox/Switch/RadioGroup, FileInput, FileUploader, Combobox, MultiCombobox, DatePicker, DateRangePicker, TimePicker, TagInput, Slider, Progress, Stepper, Accordion, Breadcrumb, Drawer, DataTable (+ paginasi), Dialog, Dropdown, Tabs, Tip, Card (header/body/footer), Alert, Badge.
- **Sesi dan profil:** `IdleTimeout` (peringatan lalu keluar otomatis), foto profil (unggah/ganti/hapus), kata sandi kedaluwarsa. **Menu:** `layouts/menu.ts` (satu daftar, submenu, label singkat, tes nama menu).
- **Gerak:** animasi halus lewat kelas `motion-*` dan token `--ease-soft`/`--motion-*` di `src/index.css` (halaman, overlay, laci, accordion, daftar, grafik, tombol); mati bila `prefers-reduced-motion`; dijaga `src/index.motion.test.ts`. Aturannya di STANDARDS bagian Gerak.
- **Warna:** satu keluarga status (`success`/`warning`/`info`/`danger` × base/soft/line/ink), kontras WCAG dijaga tes, toast memakai token yang sama.
- **Layar tamu dan error:** `AuthLayout` (masuk, 2 langkah, kata sandi kedaluwarsa), `ErrorPage` layar penuh, `MaintenanceGate` (503), 10 ilustrasi SVG, pratinjau `/ui-guideline/errors/:status`.
- **Merek:** `src/lib/brand.ts` + `npm run rebrand` (nama, warna, favicon, email, halaman error). Anti-crawl lewat `ALLOW_INDEXING` (bawaan tertutup).
- **Produksi:** halaman dimuat per rute (bundel awal ±130 kB gzip), Docker multi-tahap + nginx (gzip, CSP, header keamanan), CI GitHub Actions.
- **Server tiruan** `src/mock/` lengkap sesuai `docs/API.md`; akun demo `admin` dan `kadaluarsa` (password `password`).
- **Dokumen:** `README.md`, `AGENTS.md`, `CLAUDE.md`, `docs/STANDARDS.md`, `docs/API.md`, `docs/ai/*`.

## Verifikasi sebelum rilis

Diperiksa dengan Docker (image dibuat, `HEALTHCHECK` healthy, unggahan 5 MB lolos dan 9 MB 413, tanpa pelanggaran CSP), ukuran 1280/768/375px pada halaman utama dan dialog/laci/kalender baru, papan ketik (Playwright), dan tiga mesin peramban (Chromium, Firefox, WebKit).
Menemukan dua bug nyata: `Combobox` tanpa kolom cari tidak bisa dioperasikan dengan papan ketik, dan `DateRangePicker` tampil tanpa gaya di Audit Logs karena skrip perapi impor menghapus `import 'react-day-picker/style.css'` (diperbaiki; pemeriksa standar kini menjaganya). Docker Desktop tidak berjalan di awal; saya menyalakannya untuk uji ini.

## Tema gelap, lisensi, rilis ulang (2026-11-13)

Tema gelap (token `--color-*` bernilai gelap di `index.css`, `lib/theme.ts`, `public/theme-init.js`, `ThemeMenu`, `on-primary` menggantikan `text-white`), lisensi MIT (`LICENSE`), PR Dependabot diselesaikan (versi Actions dan nginx 1.31 sudah diterapkan).
Rilis v1.0.0 dan v1.0.1 lama dihapus (rilis dan tag) atas permintaan pemilik, lalu v1.0.0 dirilis ulang dari awal dengan `CHANGELOG.md` tunggal.

## Rilis v1.0.0 (2026-11-13)

Disiapkan untuk rilis: tes aksesibilitas axe (`src/a11y.test.tsx`; menemukan combobox tanpa nama, sudah diperbaiki), tes ujung ke ujung Playwright (`e2e/`, job `e2e` di CI), anggaran bundel 150 kB gzip (`scripts/check-bundle.mjs`, bagian dari `npm run build`),
hook pra-commit (`.githooks/`, dipasang oleh `prepare`), Dependabot, `npm audit` di CI, `reportError`/`setErrorReporter` dan muat ulang otomatis bila potongan kode lama hilang (`src/lib/report.ts`), nginx `client_max_body_size 8m` (unggahan 2 MB/5 MB tadinya ditolak 413) dan `HEALTHCHECK` Docker,
`CHANGELOG.md`, bagian "Merilis versi" di README. 0 kerentanan (`overrides` minimatch, lihat MEMORY).

## Audit gaya kode (2026-11-13)

Komentar di seluruh `src`, `scripts`, dan `email` ditulis ulang ringkas (alasan, bukan apa yang sudah terbaca dari kode); aturan komentar di STANDARDS bagian 1 dijaga pemeriksa (tanpa — dan →, blok maksimal 8 baris).
`ui-guideline.tsx` dipecah ke `src/pages/ui-guideline/` (`inputs`, `table`, `parts`); `Combobox` dan `MultiCombobox` berbagi `option-panel.tsx` dan `ClearButton`. Konvensi `onValueChange` vs `onChange` ditulis di STANDARDS.

## Sedang berjalan

Tidak ada pekerjaan yang menggantung.

## Langkah berikutnya

Tidak ditentukan oleh agent. Pemilik memilih dari [BACKLOG](BACKLOG.md); jangan mengusulkan atau memulai fitur baru sebelum diminta.

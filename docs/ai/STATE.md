# STATE: kondisi terkini

Diperbarui setiap selesai satu unit pekerjaan. Pegangan untuk melanjutkan di sesi baru; keputusan jangka panjang ada di [MEMORY](MEMORY.md), pekerjaan tertunda di [BACKLOG](BACKLOG.md).

**Diperbarui:** 2026-10-04 · **Cabang:** `main` · **Verifikasi terakhir:** `npm run check` lolos (tsc, ESLint, Prettier, pemeriksa standar, 44 tes Vitest) dan `npm run build` lolos; 0 kerentanan `npm audit`.

## Yang sudah ada

- **Layar:** login, verifikasi dua langkah, kata sandi kedaluwarsa, Dashboard (placeholder), Profil (data akun, kata sandi, MFA), Audit Log (filter, detail, ekspor CSV, verifikasi rantai), Panduan (`/styleguide`), 404, penanda koneksi, dialog konfirmasi kata sandi (reauth).
- **Komponen UI** di `src/components/ui`, semuanya punya contoh di Panduan (dijaga tes): Button, Input/Field, CurrencyInput, MaskedInput, ColorInput, Textarea, Checkbox/Switch/RadioGroup, FileInput, Combobox, DatePicker, DataTable (+ paginasi), Dialog, Dropdown, Tabs, Tip, Card (header/body/footer), Alert, Badge.
- **Warna:** satu keluarga status (`success`/`warning`/`info`/`danger` × base/soft/line/ink), kontras WCAG dijaga tes, toast memakai token yang sama.
- **Merek:** `src/lib/brand.ts` + `npm run rebrand` (nama, warna, favicon, email, halaman error). Anti-crawl lewat `ALLOW_INDEXING` (bawaan tertutup).
- **Produksi:** halaman dimuat per rute (bundel awal ±130 kB gzip), Docker multi-tahap + nginx (gzip, CSP, header keamanan), CI GitHub Actions.
- **Server tiruan** `src/mock/` lengkap sesuai `docs/API.md`; akun demo `admin` dan `kadaluarsa` (password `password`).
- **Dokumen:** `README.md`, `AGENTS.md`, `CLAUDE.md`, `docs/STANDARDS.md`, `docs/API.md`, `docs/ai/*`.

## Sedang berjalan

Tidak ada pekerjaan yang menggantung.

## Langkah berikutnya

Tidak ditentukan oleh agent. Pemilik memilih dari [BACKLOG](BACKLOG.md); jangan mengusulkan atau memulai fitur baru sebelum diminta.

# STATE: kondisi terkini

Diperbarui setiap selesai satu unit pekerjaan. Pegangan untuk melanjutkan di sesi baru; keputusan jangka panjang ada di [MEMORY](MEMORY.md), pekerjaan tertunda di [BACKLOG](BACKLOG.md).

**Diperbarui:** 2026-10-19 · **Cabang:** `main` · **Verifikasi terakhir:** `npm run check` lolos (tsc, ESLint, Prettier, pemeriksa standar, 190 tes Vitest), `npm run build` lolos, CI GitHub Actions hijau, 0 kerentanan `npm audit`. Audit dialog dan lapisan mengambang (dialog, laci, popover, dropdown, tooltip: peran, nama, Esc, fokus kembali, klik luar, layar pendek, urutan lapisan) lolos. Audit penutup sebelumnya: 5 rute × 3 lebar layar (375/768/822) tanpa luapan, tanpa kontrol tanpa nama, tanpa id ganda; langkah di README (melepas mock, rebrand) disimulasikan di salinan dan lolos.

## Yang sudah ada

- **Layar:** login, verifikasi dua langkah, kata sandi kedaluwarsa, Dashboard (placeholder), Profil (data akun, foto profil, kata sandi, MFA), Audit Logs (filter, detail, ekspor CSV, verifikasi rantai), UI Guideline (`/ui-guideline`), 404, penanda koneksi, dialog konfirmasi kata sandi (reauth).
- **Komponen UI** di `src/components/ui`, semuanya punya contoh di UI Guideline (dijaga tes): Button, Input/InputGroup/Field, CurrencyInput, MaskedInput, FilteredInput, charts (Donut/Column/Bar), ColorInput, Textarea, Checkbox/Switch/RadioGroup, FileInput, Combobox, DatePicker, DataTable (+ paginasi), Dialog, Dropdown, Tabs, Tip, Card (header/body/footer), Alert, Badge.
- **Sesi dan profil:** `IdleTimeout` (peringatan lalu keluar otomatis), foto profil (unggah/ganti/hapus), kata sandi kedaluwarsa. **Menu:** `layouts/menu.ts` (satu daftar, submenu, label singkat, tes nama menu).
- **Warna:** satu keluarga status (`success`/`warning`/`info`/`danger` × base/soft/line/ink), kontras WCAG dijaga tes, toast memakai token yang sama.
- **Layar tamu dan error:** `AuthLayout` (masuk, 2 langkah, kata sandi kedaluwarsa), `ErrorPage` layar penuh, `MaintenanceGate` (503), 10 ilustrasi SVG, pratinjau `/ui-guideline/errors/:status`.
- **Merek:** `src/lib/brand.ts` + `npm run rebrand` (nama, warna, favicon, email, halaman error). Anti-crawl lewat `ALLOW_INDEXING` (bawaan tertutup).
- **Produksi:** halaman dimuat per rute (bundel awal ±130 kB gzip), Docker multi-tahap + nginx (gzip, CSP, header keamanan), CI GitHub Actions.
- **Server tiruan** `src/mock/` lengkap sesuai `docs/API.md`; akun demo `admin` dan `kadaluarsa` (password `password`).
- **Dokumen:** `README.md`, `AGENTS.md`, `CLAUDE.md`, `docs/STANDARDS.md`, `docs/API.md`, `docs/ai/*`.

## Sedang berjalan

Tidak ada pekerjaan yang menggantung.

## Langkah berikutnya

Tidak ditentukan oleh agent. Pemilik memilih dari [BACKLOG](BACKLOG.md); jangan mengusulkan atau memulai fitur baru sebelum diminta.

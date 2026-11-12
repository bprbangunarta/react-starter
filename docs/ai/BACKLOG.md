# Backlog

Fitur dan praktik yang **belum** dikerjakan, beserta alasannya. Kerjakan bila kebutuhannya sudah nyata; jangan menambahnya "untuk jaga-jaga".
Prioritas: **T** tinggi (kerjakan sebelum dipakai produksi), **S** sedang, **R** rendah.

Hapus barisnya bila sudah dikerjakan dan pindahkan ringkasannya ke tabel "Praktik terbaik yang sudah diterapkan" di [README](../../README.md#praktik-terbaik-yang-sudah-diterapkan).

| Peningkatan | Mengapa belum | Usulan | Prioritas |
|---|---|---|---|
| Memilih layanan pemantauan galat | Butuh layanan pihak ketiga dan kebijakan data; satu pintu keluarnya sudah ada (`reportError`, `setErrorReporter` di `src/lib/report.ts`) | Pasang Sentry atau sejenisnya lewat `setErrorReporter`; jangan kirim rahasia | T |
| Pemecahan vendor chunk | Bundel awal 419 kB masih di bawah peringatan | Pisahkan React/Radix/date-fns di `build.rolldownOptions.output` bila bertambah | R |
| Mode gelap | Token warna belum punya varian gelap | Duplikasi tangga token di `@media (prefers-color-scheme: dark)`; tes kontras sudah ada | R |
| Multi-bahasa (i18n) | Aplikasi satu bahasa (Indonesia); teks layar masih literal | Pindahkan teks ke kamus bila butuh bahasa kedua | R |
| PWA / offline | Dasbor admin butuh data langsung; offline tidak bermakna | Hanya bila ada kebutuhan khusus (instal di perangkat) | R |
| Regresi visual (tangkapan layar Playwright) | `/ui-guideline` sudah jadi acuan hidup; Playwright sudah ada untuk tes alur | Bandingkan tangkapan layar UI Guideline di CI (`toHaveScreenshot`) | R |
| Peran dan izin, manajemen pengguna | Sengaja dikeluarkan dari starter | Tambah sebagai fitur aplikasi turunan, bukan starter | R |
| Kunci akses (passkey/WebAuthn) sebagai MFA | MFA yang ada (TOTP, OTP email) sudah memadai untuk starter | Butuh dukungan backend; tambah di halaman Profil | R |
| Bawa perbaikan starter ke `mso-api/admin-ui` | `admin-ui` adalah turunan starter; ia belum punya tes, ESLint, Prettier, CI, kartu header/body/footer, tangga warna status, dan komponen isian baru | Urusan repo mso-api: salin komponen dan aturan, lalu jalankan `npm run check` di sana (halaman Pengguna/API Key/Referensi perlu disesuaikan) | S |
| Naikkan versi mayor dependensi | ESLint 10 menunggu `eslint-plugin-jsx-a11y`; TypeScript 7 menunggu `typescript-eslint`; React Router 8 dan `@types/node` 26 belum dicoba | Naikkan satu per satu, jalankan `npm run check` dan CI | S |
| Izin per halaman (`can`, `NoPermission`) | Starter sengaja tanpa peran dan izin; codex memakainya (`layouts/menu.ts` dengan `can`, halaman "Tidak ada akses") | Tambah bila aplikasi turunan punya peran: `can` pada entri menu, `visibleMenu`, dan `permissionFor` dari codex | R |
| Halaman aktivitas pengguna sendiri | codex punya `/activity` (jejak audit milik pengguna itu sendiri) | Layar baca-saja dari audit log yang difilter ke pengguna yang masuk | R |
| Pemeriksa duplikasi kode (`jscpd`) | codex menjalankannya sebagai `npm run duplicates`; starter belum cukup besar | Tambah ke `npm run check` bila kode bertambah | R |

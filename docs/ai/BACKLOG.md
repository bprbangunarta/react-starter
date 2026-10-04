# Backlog

Fitur dan praktik yang **belum** dikerjakan, beserta alasannya. Kerjakan bila kebutuhannya sudah nyata; jangan menambahnya "untuk jaga-jaga".
Prioritas: **T** tinggi (kerjakan sebelum dipakai produksi), **S** sedang, **R** rendah.

Hapus barisnya bila sudah dikerjakan dan pindahkan ringkasannya ke tabel "Praktik terbaik yang sudah diterapkan" di [README](../../README.md#praktik-terbaik-yang-sudah-diterapkan).

| Peningkatan | Mengapa belum | Usulan | Prioritas |
|---|---|---|---|
| Logout otomatis saat tak aktif (idle timeout) | Harus sejalan dengan masa sesi di backend | Pantau aktivitas di `SessionProvider`, peringatkan 1 menit sebelum habis, panggil `/logout` | T |
| Pemantauan galat produksi | Butuh layanan pihak ketiga dan kebijakan data | Sentry atau sejenisnya dari `ErrorBoundary` dan `http.ts`; jangan kirim rahasia | T |
| Pembaruan dependensi otomatis | Belum ada repositori tetap | Dependabot atau Renovate + CI yang sudah ada; `npm audit` berkala | T |
| Tes ujung ke ujung (Playwright) | Belum ada backend nyata; server tiruan sudah dicakup tes unit | Skenario login, MFA, kata sandi kedaluwarsa, CRUD; jalan di CI terhadap `npm run preview` | S |
| Tes aksesibilitas otomatis (axe) | Saat ini lewat ESLint `jsx-a11y` dan pemeriksaan manual | `vitest-axe` pada halaman utama, atau axe di Playwright | S |
| Anggaran ukuran bundel di CI | Bundel awal sudah kecil (130 kB gzip) | Gagalkan CI bila JS awal melewati batas (mis. `size-limit`) | S |
| Hook pra-commit (husky + lint-staged) | CI sudah menjalankan semuanya | Format dan lint berkas yang berubah sebelum commit | S |
| Pemecahan vendor chunk | Bundel awal 419 kB masih di bawah peringatan | Pisahkan React/Radix/date-fns di `build.rolldownOptions.output` bila bertambah | R |
| Mode gelap | Token warna belum punya varian gelap | Duplikasi tangga token di `@media (prefers-color-scheme: dark)`; tes kontras sudah ada | R |
| Multi-bahasa (i18n) | Aplikasi satu bahasa (Indonesia); teks layar masih literal | Pindahkan teks ke kamus bila butuh bahasa kedua | R |
| PWA / offline | Dasbor admin butuh data langsung; offline tidak bermakna | Hanya bila ada kebutuhan khusus (instal di perangkat) | R |
| Regresi visual (Storybook/Chromatic atau tangkapan layar Playwright) | `/styleguide` sudah jadi acuan hidup | Bandingkan tangkapan layar Panduan di CI | R |
| Peran dan izin, manajemen pengguna | Sengaja dikeluarkan dari starter | Tambah sebagai fitur aplikasi turunan, bukan starter | R |
| Kunci akses (passkey/WebAuthn) sebagai MFA | MFA yang ada (TOTP, OTP email) sudah memadai untuk starter | Butuh dukungan backend; tambah di halaman Profil | R |
| Bawa perbaikan starter ke `mso-api/admin-ui` | `admin-ui` adalah turunan starter; ia belum punya tes, ESLint, Prettier, CI, kartu header/body/footer, tangga warna status, dan komponen isian baru | Urusan repo mso-api: salin komponen dan aturan, lalu jalankan `npm run check` di sana (halaman Pengguna/API Key/Referensi perlu disesuaikan) | S |

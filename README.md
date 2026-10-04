# Starter Kit

Kerangka antarmuka **React + TypeScript + Vite + Tailwind** untuk dasbor admin internal dengan tampilan Compact UI (padat dan rapi),
lengkap dengan layar **autentikasi, MFA, dan audit log**. Proyek ini **hanya frontend**: semua data berasal dari server tiruan di peramban,
jadi setiap layar sudah bisa dicoba dan terasa seperti aslinya. Backend dikerjakan pihak lain; mereka cukup mengikuti kontrak di
[API.md](docs/API.md) dan tidak ada layar yang perlu ditulis ulang.

## Menjalankan

Butuh Node.js 20.19+ atau 22.12+ (syarat Vite 8).

```bash
npm install
npm run dev          # http://localhost:5173
npm run check        # tsc --noEmit + ESLint + pemeriksa standar kode
npm run build        # check + vite build ke dist/
npm run preview      # menjalankan hasil build
```

Masuk dengan **`admin` / `password`**. Untuk mencoba kata sandi kedaluwarsa, masuk dengan **`kadaluarsa` / `password`** (kata sandinya dibuat 45 hari lalu; batasnya 30 hari). Data tiruan (pengguna, audit log, notifikasi, sesi) disimpan di `localStorage` pada kunci
`starterkit.db.v2`; hapus kunci itu (atau pakai jendela penyamaran) untuk mengulang dari awal. Bila peramban memakai alamat selain
`localhost`, fitur kriptografi (`crypto.subtle`) butuh HTTPS.

## Yang sudah ada

| Bidang | Isi |
|---|---|
| **Autentikasi** | Login (email atau username), keluar, penjaga halaman, sesi, halaman error layar penuh, penanda koneksi putus/pulih |
| **MFA** | Aplikasi authenticator (TOTP **sungguhan**: kunci dibuat acak, QR dipindai Google Authenticator, kode divalidasi dengan toleransi ±30 detik), OTP email (kodenya tampil di toast karena tidak ada email), 8 kode pemulihan sekali pakai, batas 5 kode salah, jeda kirim ulang, pengaturan dan pemutusan di Profil, pengingat bila belum aktif |
| **Audit log** | Daftar terbaru dulu dengan pencarian, filter tanggal/modul/hasil, paginasi, detail sebelum/sesudah, **ekspor CSV**, dan **verifikasi integritas rantai hash** (SHA-256) yang sungguhan. Coba ubah satu entri di `localStorage` lalu tekan "Periksa integritas": rantai terputus dan entri yang diubah terdeteksi |
| **Isian** | `CurrencyInput` (Rp, format ribuan), `MaskedInput` (telepon, NIK, NPWP), `ColorInput`, `Textarea`, `Checkbox`, `Switch`, `RadioGroup`, `FileInput`; contoh hidup di `/styleguide` |
| **Kata sandi kedaluwarsa** | Setelah masuk dengan benar, bila kata sandi lebih tua dari 30 hari, layar `/password-expired` meminta kata sandi baru (3 kolom yang sama dengan Profil). Kata sandi baru tidak boleh sama dengan yang sekarang atau 5 sebelumnya; lalu lanjut ke verifikasi dua langkah atau langsung masuk |
| **Profil** | Data akun, ganti kata sandi (validasi, batas percobaan, tercatat di audit log), pengaturan MFA |
| **Kerangka** | Sidebar: Dashboard (placeholder) dan bagian Sistem (Panduan, Audit log), bel notifikasi (tandai dibaca), menu akun (Profil, Keluar) |
| **Referensi** | Halaman `/styleguide` (semua komponen dan token), template email OTP, halaman error statis, aturan tampilan dan kode |

Tidak ada peran/izin dan tidak ada manajemen pengguna (sengaja dikeluarkan). Sidebar berisi Dashboard, Panduan, dan Audit log; Profil dan Keluar ada di menu akun.

## Struktur proyek

```
src/
  main.tsx, App.tsx          pintu masuk dan daftar rute
  index.css                  token tema dan CSS global (sumber gaya satu-satunya)
  lib/
    http.ts                  SATU-SATUNYA pintu ke server (tiruan atau fetch) + aturan respons
    form.ts                  useForm: data, errors (dari 422), processing, post/put/delete
    resource.ts              useResource: memuat data GET dengan parameter
    download.ts              unduh CSV (tiruan membuat berkas di peramban)
    format.ts, utils.ts      format tanggal/rupiah, cn()
    mask.ts                  aturan mask isian (telepon, NIK, NPWP) untuk MaskedInput
    brand.ts                 nama aplikasi dan huruf logo (diubah lewat `npm run rebrand`)
    title.ts                 useTitle: judul tab "Halaman - <nama aplikasi>"
  auth/session.tsx           siapa yang masuk (me), notifikasi, keluar
  layouts/app-layout.tsx     sidebar, header, menu akun, pengingat MFA  (tambah menu di MENU)
  pages/                     login, two-factor-challenge, password-expired, dashboard, profile, audit-logs, styleguide, not-found
  components/ui/             komponen dasar: button, input, field, combobox, data-table, dialog, dropdown, date-picker, currency-input,
                             masked-input, color-input, textarea, choice (checkbox/switch/radio), file-input, misc (Card, Alert, Badge, ...)
  components/                bel notifikasi, penanda jaringan, dialog konfirmasi kata sandi (reauth), kolom kata sandi bersama, error boundary
  hooks/use-network-status.ts
  mock/                      server tiruan (HAPUS saat backend asli siap)
email/                       template email OTP (TypeScript, dan Blade untuk Laravel)
error-pages/                 halaman error statis (401, 403, 404, 419, 429, 500, 503)
scripts/                     pemeriksa standar kode, pembuat halaman error, rebrand
Dockerfile, nginx.conf,      pengemasan produksi: UI statis + proxy `/api/` ke backend (ubah `backend:7100` di nginx.conf)
security-headers.conf
.env.example                 ALLOW_INDEXING (akses mesin pencarian)
README.md                    panduan ini
AGENTS.md                    peta dokumen dan ringkasan aturan (baca dulu bila mengubah kode)
docs/                        STANDARDS.md (aturan wajib kode dan tampilan), API.md (kontrak endpoint)
```

## Cara kerja server tiruan dan melepasnya

Semua layar memanggil `http.get/post/put/delete(url, data)` (`src/lib/http.ts`) dan **tidak tahu** siapa yang menjawab. Saat
`USE_MOCK = true`, jawabannya dari `src/mock/server.ts` (tunda 0,2 detik supaya loading terlihat, lalu JSON atau galat). Bila backend
sudah menjawab sesuai kontrak:

1. Pastikan backend mengikuti [API.md](docs/API.md). Yang paling penting bagi layar:
   - sukses = 2xx dengan JSON (bila ada `message`, tampil sebagai toast);
   - validasi gagal = **422** `{ "message": "...", "errors": { "kolom": ["pesan"] } }` (pesan tampil di bawah kolom);
   - belum masuk = **401** (layar kembali ke login).
2. **Lepas server tiruan** (empat sunting; hasilnya sudah dicoba: `npm run check` lolos):
   1. Hapus folder `src/mock/`.
   2. `src/lib/http.ts`: hapus `import { handleMock }`, baris `export const USE_MOCK = true;`, dan blok `if (USE_MOCK) { return ... }` di awal
      `send()`. Permintaan menjadi `fetch(API_BASE + url)` dengan cookie sesi (`credentials: 'include'`); isi `API_BASE` bila perlu.
   3. `src/lib/download.ts`: sisakan cabang backend saja (`window.location.assign(...)`), hapus impor `USE_MOCK`/`http` dan kode pembuat berkas
      di peramban. Ekspor CSV (`/audit-logs/export`) cukup mengalirkan `text/csv`.
   4. `src/pages/login.tsx`: hapus blok petunjuk `{USE_MOCK && (...)}` beserta impor `USE_MOCK` dan ikon `Info`.
3. Saat pengembangan, `vite.config.ts` meneruskan `/api/*` ke `API_URL` (bawaan `http://127.0.0.1:8000`, tanpa awalan `/api`); di
   produksi `nginx.conf` melakukan hal yang sama.

Bila backend memakai token alih-alih cookie, ubah `send()` di `src/lib/http.ts` (satu tempat) untuk menambah header
`Authorization`; tidak ada layar yang berubah.

## Rebranding

Satu perintah mengganti nama, warna utama, favicon, template email, dan halaman error:

```bash
npm run rebrand -- --name "Nama Aplikasi" --color "#0f766e"      # --initial N untuk huruf logo (bawaan: huruf pertama nama)
```

Yang diubah: `src/lib/brand.ts` (satu-satunya sumber nama dan huruf logo; dipakai sidebar, login, 404, judul tab, pratinjau email),
token `--color-primary`, `-hover`, `-soft` di `src/index.css` (dihitung dari hex ke OKLCH; ada peringatan bila teks putih di atasnya
kurang kontras), `<title>` di `index.html`, nama di `package.json`, `public/favicon.svg` dan `favicon.ico` (persegi membulat berwarna utama
dengan huruf logo), warna merek di `email/`, dan `error-pages/`. Salah satu opsi boleh dipakai sendiri. Pembuatan `favicon.ico` butuh
`rsvg-convert` dan ImageMagick (`brew install librsvg imagemagick`); tanpa itu skrip memberi tahu dan `favicon.svg` tetap diperbarui.

Secara manual:

- **Warna utama:** ubah tiga token primary di `src/index.css`; warna status (berhasil, info, peringatan, galat) tidak ikut berubah.
- **Logo/favicon sendiri:** timpa `public/favicon.svg`, `public/favicon.ico` (32×32 atau multi-ukuran), dan bila perlu ganti kotak huruf di
  `app-layout.tsx`, `login.tsx`, `not-found.tsx` dengan `<img>`. Email dan halaman error memakai kotak huruf sebaris (ubah di `email/` dan
  `scripts/generate-error-pages.mjs`).
- **Nama perusahaan di email:** parameter `company` pada `renderLoginCodeEmail`; di versi Blade lewat `config('app.company')` (bawaan: nama aplikasi).
- **Kunci demo** `starterkit.db.v2` di `src/mock/db.ts` boleh diganti; ia hilang bersama `src/mock/` saat backend tersambung.

<a id="indexing"></a>
## Akses mesin pencarian (anti-crawl)

Ini aplikasi admin internal, jadi **bawaannya tertutup bagi mesin pencari**: meta `noindex, nofollow`, `robots.txt` berisi `Disallow: /`,
dan header `X-Robots-Tag: noindex, nofollow` di nginx. Halaman error statis selalu `noindex`. Semuanya dikendalikan satu variabel:

| Mode | Cara |
|---|---|
| **Tertutup (bawaan)** | tidak perlu apa-apa, atau `ALLOW_INDEXING=false` |
| **Boleh diindeks** | bangun dengan `ALLOW_INDEXING=true npm run build` (atau tulis di `.env`; contoh di `.env.example`), dan untuk Docker: `docker build --build-arg ALLOW_INDEXING=true .` |

`vite.config.ts` menyuntikkan meta dan membuat `dist/robots.txt` sesuai variabel itu (juga dilayani saat `npm run dev`); `Dockerfile`
menghapus header `X-Robots-Tag` dari `security-headers.conf` bila `true`. Tanpa Docker, atur header yang sama di web server Anda.
`robots.txt` hanya meminta crawler yang patuh; ia bukan kontrol akses. Untuk data sungguhan tetap andalkan login dan, bila perlu,
pembatasan jaringan (VPN/IP).

## Menambah halaman

1. **Halaman:** buat `src/pages/orders.tsx`, pakai `useTitle`, `PageHeader`, dan komponen dari `components/ui`.
2. **Rute:** tambahkan di `src/App.tsx` di dalam grup `AppLayout`:
   `<Route path="/orders" element={<Orders />} />`
3. **Menu:** tambahkan satu objek di `MENU` pada `src/layouts/app-layout.tsx` (`label`, `to`, `icon` dari lucide-react).
4. **Data:** `const { data, loading, error, reload } = useResource<Order[]>('/orders', { search, page })`.
5. **Tabel:** definisikan `Column<Order>[]` dan pakai `DataTable` (lihat `src/pages/audit-logs.tsx` sebagai contoh lengkap:
   filter, pencarian tertunda, paginasi, dialog detail).
6. **Formulir:**
   ```tsx
   const form = useForm({ name: '' });
   form.post('/orders', { onSuccess: () => navigate('/orders') });
   // form.errors.name berisi pesan dari 422; form.processing untuk tombol loading
   ```
7. **Tiruan (opsional):** tambahkan rute di `src/mock/server.ts` supaya halaman baru bisa dicoba tanpa backend; catat endpoint-nya
   di [API.md](docs/API.md).

## Panduan tampilan, token, dan CSS acuan

- **`src/index.css`** adalah CSS acuan: token warna (`oklch`), ukuran teks, kalender kompak, dan gaya dasar.
- **`/styleguide`** (sidebar → Panduan) menampilkan semua komponen, warna, ukuran, dialog, tabel, dan email OTP. Tabelnya berupa contoh CRUD statis (Tambah, Ubah, Hapus lewat dialog form dan konfirmasi hapus) yang bisa disalin untuk halaman baru.
  Bandingkan layar baru dengannya.
- **[docs/STANDARDS.md](docs/STANDARDS.md)** memuat aturan Compact UI dan tabel token (ukuran, tabel, tombol, dialog, DatePicker, Combobox).

## Template email kode OTP

`email/login-code.ts` berisi `renderLoginCodeEmail()`: fungsi murni tanpa dependensi yang menghasilkan `{ subject, html, text }`.
HTML memakai tabel dan gaya sebaris (agar tampil benar di aplikasi email), ada versi teks biasa dan teks pratinjau.

```ts
import { renderLoginCodeEmail } from './email/login-code';

const { subject, html, text } = renderLoginCodeEmail({
    appName: 'Nama Aplikasi',
    company: 'PT Nama Perusahaan',   // opsional, untuk baris hak cipta
    code: '482915',
    minutes: 10,
    name: 'Rina',                    // opsional
    sentAt: '1 Oktober 2026, 21:16 WIB',
    brandColor: '#33479f',           // opsional
});
// kirim lewat pengirim email Anda (nodemailer, Resend, SES, ...): subject, html, dan text sekaligus
```

Pratinjaunya tampil di `/styleguide`. Untuk Laravel, versi Blade yang sama ada di `email/blade/` (`login-code.blade.php`,
`login-code-text.blade.php`, dan kelas `LoginCode.php.txt`). Aturan OTP sisi server (hash, masa berlaku, batas salah) ada di [docs/API.md](docs/API.md), bagian "Aturan sisi server".

## Halaman error statis

Pratinjau ketujuhnya (termasuk 503 pemeliharaan) ada di `/styleguide`.

`error-pages/` berisi HTML mandiri (tanpa aset) untuk 401, 403, 404, 419, 429, 500, dan 503, untuk disajikan server web atau
framework saat aplikasi tidak bisa menjawab (pemeliharaan, galat server). Nama, huruf logo, dan warnanya diambil dari `src/lib/brand.ts` dan
`src/index.css` (jadi ikut berubah lewat `npm run rebrand`); buat ulang bila perlu, argumen opsional menimpa nama:

```bash
npm run error-pages -- "Nama Aplikasi"
```

Di dalam aplikasi, 404 ditampilkan oleh `src/pages/not-found.tsx` (layar penuh, tombol Kembali dan Ke beranda).

## Aturan kode dan pemeriksaan otomatis

Baca [docs/STANDARDS.md](docs/STANDARDS.md). Ringkasnya: kode berbahasa Inggris dan teks layar berbahasa Indonesia, TypeScript ketat
tanpa `any`, semua akses server lewat `http`, semua tabel lewat `DataTable`, warna hanya lewat token, plus aturan React (hooks, efek, `key`).
`npm run standards` memeriksa yang bisa dicek mesin (tabel mentah, warna tertulis langsung, `any`, `@ts-ignore`, `fetch` langsung,
`dangerouslySetInnerHTML`, `localStorage`, ekspor bawaan, `key` berindeks, `console.log`, penjajaran judul+aksi) dan menjadi bagian dari
`npm run check` dan `npm run build`.

## Serah terima ke tim backend

Proyek ini hanya frontend. Yang diserahkan ke tim backend adalah [docs/API.md](docs/API.md): daftar endpoint, bentuk request dan respons,
galat 422, dan aturan yang diasumsikan layar. Cara mengimplementasikannya (penyimpanan, hash, pembatasan percobaan, rantai hash audit log,
pengiriman email) sepenuhnya urusan mereka. Dari sisi frontend, serah terima selesai bila:

- [ ] semua endpoint di `docs/API.md` menjawab dengan bentuk yang sama, termasuk galat 422 dan 401;
- [ ] server tiruan sudah dilepas (langkah di atas) dan `npm run check` lolos;
- [ ] proxy `/api` (`vite.config.ts`, `nginx.conf`) menunjuk ke backend yang benar;
- [ ] akses mesin pencarian sesuai kebutuhan (lihat [Akses mesin pencarian](#indexing)).

## Pemecahan masalah

| Gejala | Penyebab dan cara |
|---|---|
| Layar kosong sebentar saat pertama dibuka | Server tiruan membuat 160 entri audit log berantai hash sekali saja (sekitar satu detik) |
| "crypto.subtle undefined" | Dibuka lewat `http://` selain `localhost`; pakai HTTPS atau `localhost` |
| Ingin mengulang dari awal | Hapus kunci `starterkit.db.v2` di `localStorage` |
| Kode authenticator ditolak | Jam perangkat harus akurat; kode berlaku 30 detik dengan toleransi ±1 langkah |
| Kode OTP email tidak datang | Tidak ada email sungguhan; kodenya tampil di toast "demo: ......" |
| `npm run build` gagal di `standards` | Baca baris yang dilaporkan; aturannya dijelaskan di docs/STANDARDS.md |

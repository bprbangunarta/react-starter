# Starter Kit

Kerangka antarmuka **React + TypeScript + Vite + Tailwind** yang tampilannya sama persis dengan aplikasi SIPEBRI (Compact UI),
lengkap dengan **autentikasi, MFA, dan audit log**. Proyek ini **tanpa backend**: semua data berasal dari server tiruan di peramban,
jadi setiap layar sudah bisa dicoba dan terasa seperti aslinya. Backend sungguhan (mis. dengan PostgreSQL) cukup menyediakan
endpoint di [API.md](API.md); tidak ada layar yang perlu ditulis ulang.

## Daftar isi

1. [Menjalankan](#menjalankan)
2. [Yang sudah ada](#yang-sudah-ada)
3. [Struktur proyek](#struktur-proyek)
4. [Cara kerja server tiruan dan menyambung ke backend](#menyambung-ke-backend)
5. [Menambah halaman, menu, tabel, dan formulir](#menambah-halaman)
6. [Panduan tampilan, token, dan CSS acuan](#tampilan)
7. [Template email kode OTP](#email-otp)
8. [Halaman error statis](#halaman-error)
9. [Aturan kode dan pemeriksaan otomatis](#aturan-kode)
10. [Daftar periksa untuk tim backend](#backend)
11. [Pemecahan masalah](#masalah)

## Menjalankan

Butuh Node.js 20 atau lebih baru.

```bash
npm install
npm run dev          # http://localhost:5173
npm run check        # tsc --noEmit + pemeriksa standar kode
npm run build        # check + vite build ke dist/
npm run preview      # menjalankan hasil build
```

Masuk dengan **`admin` / `password`**. Data tiruan (pengguna, audit log, notifikasi, sesi) disimpan di `localStorage` pada kunci
`starterkit.db.v1`; hapus kunci itu (atau pakai jendela penyamaran) untuk mengulang dari awal. Bila peramban memakai alamat selain
`localhost`, fitur kriptografi (`crypto.subtle`) butuh HTTPS.

## Yang sudah ada

| Bidang | Isi |
|---|---|
| **Autentikasi** | Login (email atau username), keluar, penjaga halaman, sesi, halaman error layar penuh, penanda koneksi putus/pulih |
| **MFA** | Aplikasi authenticator (TOTP **sungguhan**: kunci dibuat acak, QR dipindai Google Authenticator, kode divalidasi dengan toleransi ±30 detik), OTP email (kodenya tampil di toast karena tidak ada email), 8 kode pemulihan sekali pakai, batas 5 kode salah, jeda kirim ulang, pengaturan dan pemutusan di Profil, pengingat bila belum aktif |
| **Audit log** | Daftar terbaru dulu dengan pencarian, filter tanggal/modul/hasil, paginasi, detail sebelum/sesudah, **ekspor CSV**, dan **verifikasi integritas rantai hash** (SHA-256) yang sungguhan. Coba ubah satu entri di `localStorage` lalu tekan "Periksa integritas": rantai terputus dan entri yang diubah terdeteksi |
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
    title.ts                 useTitle: judul tab "Halaman - Starter Kit"
  auth/session.tsx           siapa yang masuk (me), notifikasi, keluar
  layouts/app-layout.tsx     sidebar, header, menu akun, pengingat MFA  (tambah menu di MENU)
  pages/                     login, two-factor-challenge, dashboard, profile, audit-logs, styleguide, not-found
  components/ui/             komponen dasar: button, input, field, combobox, data-table, dialog, dropdown, date-picker, ...
  components/                bel notifikasi, penanda jaringan
  hooks/use-network-status.ts
  mock/                      server tiruan (HAPUS saat backend asli siap)
email/                       template email OTP (TypeScript, dan Blade untuk Laravel)
error-pages/                 halaman error statis (401, 403, 404, 419, 429, 500, 503)
scripts/                     pemeriksa standar kode, pembuat halaman error
AGENTS.md                    peta semua dokumen (baca ini dulu)
docs/                        README.md (panduan ini), API.md (kontrak endpoint), CODE-STANDARDS.md (aturan wajib kode),
                             ui-rules.md (aturan tampilan), design-tokens.md (token dan CSS acuan)
```

<a id="menyambung-ke-backend"></a>
## Cara kerja server tiruan dan menyambung ke backend

Semua layar memanggil `http.get/post/put/delete(url, data)` (`src/lib/http.ts`) dan **tidak tahu** siapa yang menjawab. Saat
`USE_MOCK = true`, jawabannya dari `src/mock/server.ts` (tunda 0,2 detik supaya loading terlihat, lalu JSON atau galat). Untuk
backend asli:

1. Di `src/lib/http.ts`: isi `API_BASE` dan ubah `USE_MOCK` menjadi `false`. Permintaan menjadi `fetch(API_BASE + url)` dengan
   cookie sesi (`credentials: 'include'`).
2. Sediakan endpoint di [API.md](API.md) dengan bentuk respons yang sama. Yang paling penting:
   - sukses = 2xx dengan JSON (bila ada `message`, tampil sebagai toast);
   - validasi gagal = **422** `{ "message": "...", "errors": { "kolom": ["pesan"] } }` (pesan tampil di bawah kolom);
   - belum masuk = **401** (layar kembali ke login).
3. Hapus folder `src/mock/` dan baris `import { handleMock }` di `src/lib/http.ts`.
4. Ekspor CSV (`/audit-logs/export`) cukup mengalirkan `text/csv`; layar mengunduhnya lewat tautan biasa.

Bila backend memakai token alih-alih cookie, ubah `send()` di `src/lib/http.ts` (satu tempat) untuk menambah header
`Authorization`; tidak ada layar yang berubah.

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
   di [API.md](API.md).

<a id="tampilan"></a>
## Panduan tampilan, token, dan CSS acuan

- **`src/index.css`** adalah CSS acuan: token warna (`oklch`), ukuran teks, kalender kompak, dan gaya dasar. Salinan persis dari
  aplikasi asal.
- **`/styleguide`** (sidebar → Panduan) menampilkan semua komponen, warna, ukuran, dialog, tabel, dan email OTP.
  Bandingkan layar baru dengannya.
- **[docs/design-tokens.md](design-tokens.md)** merinci nilai token dan ukuran; **[docs/ui-rules.md](ui-rules.md)** memuat aturan
  Compact UI (ukuran, tabel, tombol, dialog, penjajaran, DatePicker, Combobox).

<a id="email-otp"></a>
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
`login-code-text.blade.php`, dan kelas `LoginCode.php.txt`). Aturan kode OTP (tersimpan sebagai hash, berlaku 10 menit, maksimal 5
salah, jeda kirim ulang) ada di [CODE-STANDARDS.md](CODE-STANDARDS.md) bagian 7.

<a id="halaman-error"></a>
## Halaman error statis

`error-pages/` berisi HTML mandiri (tanpa aset) untuk 401, 403, 404, 419, 429, 500, dan 503, untuk disajikan server web atau
framework saat aplikasi tidak bisa menjawab (pemeliharaan, galat server). Ubah nama aplikasinya dan buat ulang:

```bash
npm run error-pages -- "Nama Aplikasi"
```

Di dalam aplikasi, 404 ditampilkan oleh `src/pages/not-found.tsx` (layar penuh, tombol Kembali dan Ke beranda).

<a id="aturan-kode"></a>
## Aturan kode dan pemeriksaan otomatis

Baca [CODE-STANDARDS.md](CODE-STANDARDS.md). Ringkasnya: kode berbahasa Inggris dan teks layar berbahasa Indonesia, TypeScript ketat
tanpa `any`, semua akses server lewat `http`, semua tabel lewat `DataTable`, warna hanya lewat token. `npm run standards` memeriksa
hal-hal yang bisa dicek mesin (tabel mentah, warna tertulis langsung, `any`, `console.log`, penjajaran judul+aksi) dan menjadi bagian
dari `npm run check` dan `npm run build`.

<a id="backend"></a>
## Daftar periksa untuk tim backend

- [ ] Endpoint sesi, MFA, profil, notifikasi, dan audit log sesuai [API.md](API.md), termasuk bentuk galat 422.
- [ ] Kata sandi di-hash; percobaan masuk dibatasi; sesi aman (cookie `HttpOnly`, `Secure`, `SameSite`).
- [ ] TOTP: rahasia disimpan terenkripsi; kode divalidasi dengan toleransi ±1 langkah; kode OTP email disimpan sebagai hash.
- [ ] Kode pemulihan di-hash dan sekali pakai.
- [ ] Audit log **append-only** dengan rantai hash (disarankan HMAC dengan kunci rahasia di server); tidak ada jalur ubah/hapus;
      verifikasi terjadwal; entri tidak memuat rahasia.
- [ ] Setiap kejadian di [CODE-STANDARDS.md](CODE-STANDARDS.md) bagian 6 tercatat.
- [ ] Email OTP memakai template di `email/` dan domain pengirim ber-SPF/DKIM/DMARC.
- [ ] Header `X-Robots-Tag: noindex, nofollow` dan `robots.txt` (`Disallow: /`) bila aplikasi internal (sudah ada di `public/`).
- [ ] Hapus `src/mock/` setelah semua endpoint tersambung.

<a id="masalah"></a>
## Pemecahan masalah

| Gejala | Penyebab dan cara |
|---|---|
| Layar kosong sebentar saat pertama dibuka | Server tiruan membuat 160 entri audit log berantai hash sekali saja (sekitar satu detik) |
| "crypto.subtle undefined" | Dibuka lewat `http://` selain `localhost`; pakai HTTPS atau `localhost` |
| Ingin mengulang dari awal | Hapus kunci `starterkit.db.v1` di `localStorage` |
| Kode authenticator ditolak | Jam perangkat harus akurat; kode berlaku 30 detik dengan toleransi ±1 langkah |
| Kode OTP email tidak datang | Tidak ada email sungguhan; kodenya tampil di toast "demo: ......" |
| `npm run build` gagal di `standards` | Baca baris yang dilaporkan; aturannya dijelaskan di CODE-STANDARDS.md |

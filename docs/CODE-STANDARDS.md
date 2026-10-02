# Aturan wajib standar kode

Aturan ini berlaku untuk semua kode di proyek ini, termasuk yang ditulis setelah backend tersambung. Yang bisa diperiksa mesin
dijalankan oleh `npm run standards` (juga bagian dari `npm run check` dan `npm run build`).

## 1. Bahasa

- **Kode berbahasa Inggris:** nama berkas, komponen, fungsi, variabel, tipe, kolom data, URL/endpoint, komentar, dan pesan commit.
- **Hanya teks yang tampil di layar berbahasa Indonesia:** label, judul, pesan galat, pesan toast, isi email.
- URL dan nama endpoint tetap Inggris tetapi **sepadan dengan judul layarnya** (mis. layar "Audit Log" → `/audit-logs`).
- Pesan validasi dari backend sudah berbahasa Indonesia; jangan menulis ulang di frontend.

## 2. TypeScript

- `strict` aktif. **Dilarang `any`** (dan `as any`); pakai `unknown` lalu persempit, atau tipe yang tepat.
- Tidak ada `// @ts-ignore`. Tipe respons API didefinisikan dan dipakai ulang, bukan ditebak di tiap halaman.
- Komponen fungsi dengan props bertipe; ekspor bawaan hanya untuk halaman (`src/pages`).
- Tidak ada `console.log` atau `debugger` tertinggal (`console.error` untuk galat tak terduga boleh).

## 3. Struktur

- Halaman di `src/pages`, komponen bersama di `src/components`, komponen dasar di `src/components/ui`, logika bersama di `src/lib`.
- **Semua akses server lewat `src/lib/http.ts`** (`http.get/post/put/delete`), formulir lewat `useForm`, data bacaan lewat `useResource`.
  Jangan memanggil `fetch` langsung di halaman.
- Jangan membuat folder dasar baru tanpa alasan. Cek komponen yang ada sebelum membuat yang baru.

## 4. Tampilan (Compact UI)

Aturan lengkap ada di [ui-rules.md](ui-rules.md), token di [design-tokens.md](design-tokens.md). Ringkasnya:

- Pakai ulang komponen `src/components/ui`; jangan membuat gaya baru per halaman dan jangan menulis warna sendiri (token saja).
- Semua tabel lewat `DataTable`; semua toolbar daftar lewat `FilterBar` + `SearchInput`.
- Setiap daftar punya keadaan memuat, kosong, dan galat; setiap aksi memberi toast sukses/gagal.
- Baris judul + aksi memakai `items-center`; footer dialog: batal paling kiri, konfirmasi paling kanan.
- Periksa tampilan di lebar ponsel (375px) dan desktop; tidak boleh ada gulir horizontal pada halaman.

## 5. Data dan formulir

- Validasi sebenarnya ada di backend; batasan di UI (`maxLength`, `min`, `max`) **berpasangan** dengan aturan di backend.
- Galat validasi (422) dipetakan ke kolomnya lewat `useForm`; jangan menampilkan galat teknis mentah kepada pengguna.
- Jangan menyimpan rahasia (kata sandi, token, kode) di `localStorage`, URL, atau log. (Server tiruan memang menyimpannya karena
  hanya untuk demo; **jangan salin kebiasaan itu ke backend asli**.)
- Teks bebas dari pengguna ditampilkan sebagai teks (React meng-escape); jangan memakai `dangerouslySetInnerHTML`.

## 6. Audit log (wajib, standar OJK)

- Catatan **tambah-saja** dengan rantai hash; tidak ada layar atau API untuk mengubah atau menghapus entri.
- Setiap perubahan data bisnis dan kejadian keamanan dicatat: masuk/keluar/gagal masuk, MFA (kirim, gagal, berhasil, kode pemulihan
  dipakai), ganti kata sandi, MFA diaktifkan/dimatikan, ekspor dan verifikasi audit log, akses ditolak, dan baca data sensitif.
- Entri memuat siapa, kapan, dari mana (IP, peramban, URL), hasil, dan nilai sebelum/sesudah. **Rahasia tidak pernah masuk entri.**
- Verifikasi rantai harus bisa dijalankan dari layar dan terjadwal di backend.

## 7. Autentikasi dan MFA

- Kata sandi minimal 8 karakter; percobaan salah dibatasi (kunci sementara).
- MFA opsional per pengguna: aplikasi authenticator (TOTP) atau OTP email; kode OTP email berlaku 10 menit, maksimal 5 kali salah,
  jeda kirim ulang, dan batas kiriman per jam; kode disimpan sebagai hash. 8 kode pemulihan sekali pakai.
- Setiap kegagalan, pengiriman, dan penahanan tercatat di audit log (tanpa kodenya).
- Layar yang belum dilindungi MFA menampilkan pengingat di atas halaman.

## 8. Sebelum selesai

```bash
npm run check      # tsc --noEmit + npm run standards
npm run build
```

Lalu coba layar yang diubah di peramban (ponsel dan desktop), termasuk keadaan kosong, galat, dan memuat.

## 9. Dokumentasi dan commit

- Perubahan endpoint dicatat di [API.md](API.md); perubahan pola tampilan memperbaiki komponen bersama dan diterapkan ke semua halaman.
- Pesan commit berbahasa Inggris, satu perubahan logis per commit.

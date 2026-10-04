# MEMORY: yang harus selalu diingat agent

Hanya pengetahuan berumur panjang yang **tidak bisa disimpulkan dari kode atau dokumen lain**. Aturan kode dan tampilan ada di [STANDARDS](../STANDARDS.md), kontrak endpoint di [API](../API.md),
pekerjaan tertunda di [BACKLOG](BACKLOG.md), kondisi terkini di [STATE](STATE.md). Jangan menyalin ke sini; jangan menaruh percakapan, log, atau asumsi yang belum dikonfirmasi.

## Pemilik dan gaya kerja

- Pemilik membaca hasil dan melaporkan temuan singkat ("kayaknya ada yang tidak sama"). Anggap itu **permintaan audit**, bukan satu tambalan: cocokkan sumber, Panduan (`/styleguide`),
  dokumen, dan kode dengan skrip, lalu perbaiki seluruh kelasnya dan jaga dengan tes atau pemeriksa mesin (pelajaran 2026-10-04: daftar token di Panduan tidak lengkap karena audit hanya per bagian).
- Pertanyaan berbentuk "apakah wajar / bukannya ... ?" meminta penilaian jujur, bukan persetujuan. Cek faktanya dulu (mis. aturan kartu header/body/footer ternyata tidak ada di mso-api) lalu jawab apa adanya.
- Suka keputusan tegas dari agent ("kamu lebih paham", "putusan sendiri"). Putuskan, jelaskan alasannya singkat, kerjakan.
- Komunikasi dalam bahasa Indonesia; kode, komentar, dan commit dalam bahasa Inggris.
- Pemilik mengoreksi inkonsistensi dengan tajam (ikon tombol, warna, penjajaran). Satu aturan yang konsisten lebih baik dari banyak kompromi; tulis sebagai aturan + pemeriksa mesin.

## Otorisasi git (instruksi pemilik, 2026-10-04)

- Remote `https://github.com/bprbangunarta/react-starter.git`, branch `main`.
- Agent commit dan **push sendiri** setelah tiap unit pekerjaan selesai (`npm run check` lolos), tanpa bertanya. Perubahan teks yang dibuat pemilik sendiri di berkas **ikut** di-commit dan di-push, tidak dikecualikan; periksa `git status` dulu.
- Pesan commit bahasa Inggris, satu perubahan logis per commit, dengan baris `Co-Authored-By` dari sistem. Tidak ada force-push, tidak menulis ulang riwayat, tidak menghapus branch tanpa diminta.

## Keputusan pemilik tentang produk

- **Starter berdiri sendiri.** Dulu tampilannya "sama persis" dengan aplikasi SIPEBRI; sekarang tidak ada rujukan ke aplikasi asal (2026-10-04). Jangan menulis ulang rujukan itu.
- **Hanya frontend.** Implementasi backend adalah urusan tim lain; starter menyerahkan **kontrak** `docs/API.md` dan langkah melepas server tiruan. Jangan menulis panduan implementasi backend.
- `mso-api/admin-ui` (repo `/Users/Bananay/Claude/mso-api`) adalah turunan starter yang dipakai nyata. Dulu pemilik meminta starter diselaraskan dengan versi di sana; kini starter lebih maju (lihat BACKLOG).
- Sengaja **tanpa** peran/izin dan manajemen pengguna. Halaman API Key, Pengguna, dan Referensi milik mso-api tidak dibawa; Panduan sudah menjadi contoh CRUD statis.
- Aplikasi **internal**: tertutup bagi mesin pencari secara bawaan; `ALLOW_INDEXING=true` untuk membuka. Rebranding lewat `npm run rebrand`.
- Aturan UI yang diputuskan pemilik: kartu = header/body/footer, footer hanya bila ada tombol; ikon tombol ditentukan **tempatnya** (tabel di STANDARDS); kolom tabel tidak boleh bertumpuk (satu nilai satu kolom).
- Kata sandi kedaluwarsa 30 hari di mock, tiga kolom seperti Profil, tidak boleh sama dengan kata sandi sebelumnya (2026-10-04).

## Keputusan teknis yang tidak terlihat dari kode

- **ESLint 9, bukan 10:** `eslint-plugin-jsx-a11y` belum mendukung ESLint 10. Naikkan hanya bila plugin itu sudah mendukung.
- Aturan ESLint `react-hooks/set-state-in-effect` dan `jsx-a11y/no-autofocus` sengaja dimatikan (alasan ada di `eslint.config.js`); jangan diaktifkan ulang tanpa alasan.
- Info (biru, hue 250) sengaja terpisah dari warna utama supaya tidak bentrok setelah rebranding.
- Kunci demo localStorage `starterkit.db.v2`; naikkan versinya bila bentuk data tiruan berubah.
- Mock menyimpan kata sandi sebagai teks **hanya untuk demo**; backend asli wajib hash.

## Jebakan yang sudah diketahui

- Vite 8 butuh Node 20.19+ atau 22.12+. `tsconfig.json` hanya memuat tipe `vite/client`: tes yang membaca berkas memakai `// @vitest-environment node` dan `/// <reference types="node" />`.
- Dialog yang dibuka lewat state (tanpa `Dialog.Trigger` Radix) kehilangan pengembalian fokus: selalu pakai `useRestoreFocus` (sudah di `Modal`, `ConfirmDialog`, laci). Uji fokus di browser harus memakai `activeElement`, bukan event `focus` (jendela pane tidak fokus OS).
- Vitest dengan `css: false` mengosongkan impor CSS (termasuk `?raw`): baca `index.css` lewat `node:fs`.
- Di panel browser bawaan: `cmd+a` tidak memilih teks (isi kolom lewat `form_input`), ref bisa basi setelah render ulang (cari ulang), dan pembukaan pertama sebuah halaman butuh ±2 detik (server dev mengompilasi modul lazy; data tiruan juga dibuat sekali). Setelah `npm update` atau server dev baru menyala, muat ulang penuh halaman uji; modul lazy lama gagal diambil dan `ErrorBoundary` tampil.
- zsh: tanda `--include=*.tsx` tanpa kutip membuat grep gagal; pakai `--include='*.tsx'`. `sed -i` di macOS butuh argumen cadangan (`-i.bak`).
- `.prettierignore` mengecualikan `*.md`, `error-pages`, `public`, dan `email/blade`; jalankan Prettier pada dokumen secara eksplisit bila perlu.
- Pembuatan `favicon.ico` oleh `npm run rebrand` butuh `rsvg-convert` dan ImageMagick (ImageMagick saja gagal merender teks SVG).
- Setelah menghentikan server dev (`pkill -f vite`), halaman yang masih terbuka akan menumpuk galat `ERR_CONNECTION_REFUSED` dari ping koneksi; itu bukan galat aplikasi.

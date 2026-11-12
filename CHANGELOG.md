# Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/), versi mengikuti [SemVer](https://semver.org/lang/id/).

## [1.0.0] - 2026-11-13

Rilis pertama yang siap dipakai sebagai kerangka proyek.

### Ditambahkan

- Autentikasi: masuk dengan email atau username, penjaga halaman, sesi dan peringatan tak aktif (`IdleTimeout`), kata sandi kedaluwarsa, konfirmasi ulang kata sandi.
- MFA: authenticator TOTP sungguhan, OTP email, kode pemulihan, pengaturan di Profil.
- Audit Logs: daftar dengan pencarian, filter (rentang tanggal, modul, hasil), semua kolom bisa diurutkan, detail sebelum/sesudah, ekspor CSV, verifikasi rantai hash.
- Profil: data akun, foto profil, ganti kata sandi.
- File Manage: halaman contoh pengelola berkas (folder, tampilan kotak dan daftar, unggah, ubah nama, hapus, rincian di laci).
- Komponen: `DateRangePicker`, `TimePicker`, `MultiCombobox`, `TagInput`, `Slider`, `Progress`, `Stepper`, `Accordion`, `Breadcrumb`, `Drawer`, `FileUploader` (dropzone, antrean, progres, batalkan, coba lagi), selain `Combobox`, `DatePicker`, `DataTable`, dialog, dropdown, tab, grafik, dan isian berformat.
- `http.upload`: unggah dengan progres dan pembatalan.
- Gerak halus di seluruh aplikasi dan pada ilustrasi, mati bila `prefers-reduced-motion`.
- Halaman error layar penuh dengan ilustrasi, halaman pemeliharaan, halaman error statis untuk web server, template email OTP.
- Pemantauan galat: `reportError` dan `setErrorReporter` sebagai satu pintu keluar; muat ulang otomatis sekali bila potongan kode lama hilang setelah deploy.
- Tes aksesibilitas (axe), tes ujung ke ujung (Playwright), anggaran ukuran bundel, hook pra-commit, Dependabot, `npm audit` di CI.
- `npm run rebrand` untuk nama, warna, favicon, email, dan halaman error.

### Diubah

- Penghitung karakter `Textarea` pindah ke baris label.
- Filter tanggal Audit Logs memakai satu `DateRangePicker`.
- `DropdownLabel` bergaya bawaan; `Combobox` tanpa label memakai placeholder sebagai nama.
- nginx menerima unggahan sampai 8 MB di `/api/` (sebelumnya 128 kB menolak foto profil).
- Komentar kode ditulis ulang ringkas; aturan komentar dijaga `npm run standards`.

### Dikeluarkan dengan sengaja

- Peran dan izin, manajemen pengguna (urusan aplikasi turunan).
- Mode gelap, multi-bahasa, PWA (lihat `docs/ai/BACKLOG.md`).

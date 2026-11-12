# Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/), versi mengikuti [SemVer](https://semver.org/lang/id/).

## [1.0.1] - 2026-11-13

### Diperbaiki

- `DateRangePicker` tidak lagi memanggil `onChange` setelah klik tanggal awal saja: filter Audit Logs dulu langsung berjalan dengan setengah rentang. Rentang baru dilaporkan saat tanggal akhir dipilih; tanggal awal saja dibuang bila kalender ditutup.

## [1.0.0] - 2026-11-13

Rilis pertama yang siap dipakai sebagai kerangka proyek. Berlisensi MIT.

### Ditambahkan

- Autentikasi: masuk dengan email atau username, penjaga halaman, sesi dan peringatan tak aktif (`IdleTimeout`), kata sandi kedaluwarsa, konfirmasi ulang kata sandi.
- MFA: authenticator TOTP sungguhan, OTP email, kode pemulihan, pengaturan di Profil.
- Audit Logs: daftar dengan pencarian, filter (rentang tanggal, modul, hasil), semua kolom bisa diurutkan, detail sebelum/sesudah, ekspor CSV, verifikasi rantai hash.
- Profil: data akun, foto profil, ganti kata sandi.
- File Manage: halaman contoh pengelola berkas (folder, tampilan kotak dan daftar, unggah, ubah nama, hapus, rincian di laci).
- Tema terang dan gelap dengan token yang sama di keduanya: mengikuti sistem, pilihan Terang/Gelap/Ikuti sistem lewat tombol Tema di header, diterapkan sebelum halaman tergambar tanpa kedip, kontras dites di kedua tema. Halaman error statis mengikuti tema sistem; `npm run rebrand` mengubah warna utama di kedua tema.
- Komponen: `Combobox`, `MultiCombobox`, `DatePicker`, `DateRangePicker`, `TimePicker`, `TagInput`, `Slider`, `Progress`, `Stepper`, `Accordion`, `Breadcrumb`, `Drawer`, `DataTable`, dialog, dropdown, tab, grafik, isian berformat, dan `FileUploader` (dropzone, antrean, progres, batalkan, coba lagi).
- `http.upload`: unggah dengan progres dan pembatalan.
- Gerak halus di seluruh aplikasi dan pada ilustrasi, mati bila `prefers-reduced-motion`.
- Halaman error layar penuh dengan ilustrasi, halaman pemeliharaan, halaman error statis untuk web server, template email OTP.
- Pemantauan galat: `reportError` dan `setErrorReporter` sebagai satu pintu keluar; muat ulang otomatis sekali bila potongan kode lama hilang setelah deploy.
- Kualitas: tes aksesibilitas (axe), tes ujung ke ujung Playwright di Chromium, Firefox, dan WebKit (alur utama, papan ketik, kalender, tema), anggaran ukuran bundel, hook pra-commit, Dependabot (versi mayor dilewati), `npm audit` di CI.
- Operasional: Docker multi-tahap dengan `HEALTHCHECK` (nginx 1.31), batas unggahan nginx 8 MB, `npm run rebrand` untuk nama, warna, favicon, email, dan halaman error.

### Diverifikasi

- Image Docker dibuat dan sehat; unggahan 5 MB lewat nginx lolos dan 9 MB ditolak 413; tanpa pelanggaran CSP di halaman utama.
- Tanpa luapan horizontal, kontrol tanpa nama, atau id ganda di 1280, 768, dan 375px pada Dashboard, Audit Logs, File Manage, dan UI Guideline.
- 0 kerentanan `npm audit`.

### Dikeluarkan dengan sengaja

- Peran dan izin, manajemen pengguna (urusan aplikasi turunan).
- Multi-bahasa dan PWA (lihat `docs/ai/BACKLOG.md`).

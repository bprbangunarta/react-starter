# AGENTS.md

Peta dokumen proyek ini. **Baca bagian "Urutan baca" sebelum mengubah apa pun**, lalu buka dokumen yang sesuai dengan pekerjaan Anda.

Starter Kit: antarmuka React + TypeScript + Vite + Tailwind (tampilan Compact UI yang sama dengan aplikasi SIPEBRI) dengan autentikasi,
MFA, dan audit log. **Tanpa backend**: data berasal dari server tiruan di `src/mock/`; backend asli menyediakan endpoint yang sama.

## Dokumen

| Berkas | Isi | Buka bila |
|---|---|---|
| [docs/README.md](docs/README.md) | Panduan penggunaan: menjalankan, isi, struktur, server tiruan dan menyambung backend, menambah halaman, email, halaman error, daftar periksa backend, pemecahan masalah | pertama kali memakai proyek ini |
| [docs/CODE-STANDARDS.md](docs/CODE-STANDARDS.md) | **Aturan wajib standar kode**: bahasa, TypeScript, struktur, data dan formulir, audit log, autentikasi/MFA, langkah sebelum selesai | menulis atau mengubah kode apa pun |
| [docs/ui-rules.md](docs/ui-rules.md) | Aturan tampilan Compact UI: ukuran, tombol, tabel, dialog, form, penjajaran, DatePicker, Combobox | menulis atau mengubah tampilan |
| [docs/design-tokens.md](docs/design-tokens.md) | Token warna dan ukuran, CSS acuan (`src/index.css`), cara membandingkan kesamaan tampilan | memilih warna/ukuran, memeriksa kesamaan |
| [docs/API.md](docs/API.md) | Kontrak endpoint, bentuk request/response, galat validasi 422, rantai hash audit log | menyambung atau mengubah backend, menambah endpoint |

Berkas acuan lain (bukan dokumen teks):

| Lokasi | Isi |
|---|---|
| `/styleguide` (jalankan `npm run dev`, sidebar → Panduan) | semua komponen, token, tabel, dialog, dan pratinjau email OTP |
| `src/index.css` | sumber gaya satu-satunya (token tema, kalender kompak) |
| `email/login-code.ts`, `email/blade/` | template email kode OTP (TypeScript untuk Node, Blade untuk Laravel) |
| `error-pages/*.html` | halaman error statis 401, 403, 404, 419, 429, 500, 503 (dibuat oleh `npm run error-pages`) |
| `scripts/check-standards.mjs` | pemeriksa mesin untuk aturan kode (`npm run standards`) |

## Urutan baca

1. Mengubah kode: `docs/CODE-STANDARDS.md`.
2. Mengubah tampilan: tambah `docs/ui-rules.md` dan `docs/design-tokens.md`, lalu cocokkan dengan `/styleguide`.
3. Mengubah akses ke server atau data: `docs/API.md` dan `src/lib/http.ts`.
4. Lainnya: `docs/README.md`.

## Perintah

```bash
npm install
npm run dev        # server pengembangan
npm run check      # tsc --noEmit + pemeriksa standar kode (wajib lolos sebelum selesai)
npm run build      # check + build produksi
```

## Ringkasan aturan (rinciannya di docs/CODE-STANDARDS.md)

- Kode berbahasa Inggris; hanya teks layar yang berbahasa Indonesia. URL Inggris tetapi sepadan dengan judul layar.
- TypeScript ketat, tanpa `any`. Semua akses server lewat `src/lib/http.ts` (`http`, `useForm`, `useResource`).
- Pakai ulang `src/components/ui`; semua tabel lewat `DataTable`; warna hanya lewat token tema.
- Audit log tambah-saja dengan rantai hash; rahasia tidak pernah masuk log, `localStorage`, atau URL.
- Perubahan endpoint dicatat di `docs/API.md`; `src/mock/` dihapus setelah backend asli tersambung.

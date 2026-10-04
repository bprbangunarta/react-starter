# AGENTS.md

Starter Kit: antarmuka React + TypeScript + Vite + Tailwind (tampilan Compact UI) dengan autentikasi, MFA, dan audit log.
**Tanpa backend**: data dari server tiruan di `src/mock/`; backend asli menyediakan endpoint yang sama.

## Dokumen (baca sesuai pekerjaan)

| Berkas | Isi | Buka bila |
|---|---|---|
| [README.md](README.md) | menjalankan, isi, struktur, menyambung backend, rebranding, akses mesin pencarian, menambah halaman, email OTP, halaman error, daftar periksa backend, pemecahan masalah | pertama kali memakai proyek |
| [docs/STANDARDS.md](docs/STANDARDS.md) | **aturan wajib**: kode, tampilan (Compact UI), token, data, audit log, MFA | menulis atau mengubah kode/tampilan |
| [docs/API.md](docs/API.md) | kontrak endpoint, galat 422, rantai hash audit log | mengubah akses server atau menambah endpoint |

Acuan lain: `/styleguide` (jalankan `npm run dev`, sidebar → Panduan; semua komponen dan contoh CRUD), `src/index.css` (token tema),
`email/` (template OTP: TypeScript dan Blade), `error-pages/` (halaman error statis), `scripts/check-standards.mjs` (pemeriksa aturan).

## Perintah

```bash
npm install
npm run dev        # server pengembangan
npm run check      # tsc + ESLint + pemeriksa standar kode (wajib lolos sebelum selesai)
npm run build      # check + build produksi
```

## Ringkasan aturan (rinci di docs/STANDARDS.md)

- Kode berbahasa Inggris; hanya teks layar berbahasa Indonesia. URL Inggris tetapi sepadan dengan judul layar.
- TypeScript ketat, tanpa `any`. Semua akses server lewat `src/lib/http.ts` (`http`, `useForm`, `useResource`).
- Pakai ulang `src/components/ui`; semua tabel lewat `DataTable`; warna hanya lewat token tema.
- Audit log tambah-saja dengan rantai hash; rahasia tidak pernah masuk log, `localStorage`, atau URL.
- Perubahan endpoint dicatat di `docs/API.md`; `src/mock/` dihapus setelah backend asli tersambung.

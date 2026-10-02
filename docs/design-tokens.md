# Token desain dan CSS acuan

Satu-satunya sumber gaya adalah `src/index.css` (Tailwind v4, konfigurasi lewat `@theme`). Salinannya persis dengan aplikasi asal,
sehingga tampilan sama. Jangan menulis warna atau ukuran baru di komponen; ubah token di sana bila memang perlu.

## Token

| Token | Nilai | Dipakai untuk |
|---|---|---|
| `--font-sans` | Instrument Sans (variabel), lalu font sistem | seluruh teks; paket `@fontsource-variable/instrument-sans` |
| `--color-primary` | `oklch(0.45 0.16 265)` | tombol utama, tautan, item menu aktif, fokus |
| `--color-primary-hover` | `oklch(0.4 0.16 265)` | tombol utama saat disorot |
| `--color-primary-soft` | `oklch(0.96 0.02 265)` | latar item aktif, badge info |
| `--color-surface` | `#ffffff` | kartu, sidebar, header, dialog, dropdown |
| `--color-canvas` | `oklch(0.975 0.003 260)` | latar halaman, header tabel, hover |
| `--color-line` | `oklch(0.92 0.006 260)` | semua garis dan batas |
| `--color-ink` | `oklch(0.24 0.02 265)` | teks utama |
| `--color-muted` | `oklch(0.55 0.02 265)` | label, hint, header tabel, teks pendukung |
| `--color-danger` | `oklch(0.55 0.2 27)` | galat, tombol hapus |
| `--text-xs` | `0.75rem` | label, hint, keterangan |
| `--text-sm` | `0.8125rem` | isi, sel tabel, tombol |

Tulisan `html { font-size: 15px }` membuat `1rem = 15px`: seluruh skala ikut mengecil dibanding standar 16px. Latar `body` memakai
`canvas`, teks `ink`, dan semua tombol yang aktif berkursor `pointer`.

## Ukuran dan bentuk

| Elemen | Aturan |
|---|---|
| Kontrol (tombol, isian, pilihan) | tinggi `h-8`; tombol kecil `h-7`; tombol ikon `size-7` |
| Ikon | lucide-react, `size-3.5` di tombol, `size-4` di menu |
| Radius | kontrol `rounded-md`, kartu `rounded-lg`, kotak kode/chip `rounded` |
| Kartu | `rounded-lg border border-line bg-surface` |
| Sidebar | `w-60` (laci ponsel `w-64`); header `h-12`; konten `p-3 sm:p-5` |
| Jarak antar bagian | `gap-3` |
| Tabel | sel `px-3 py-1.5`, header `text-xs text-muted bg-canvas`, `divide-y divide-line` |

## Kalender

`react-day-picker` dengan kelas `compact-calendar` (sel 28px) di `src/index.css`. Jangan menampilkan kalender berukuran bawaan.

## Email dan halaman error statis

Email (`email/login-code.ts`) dan halaman error (`error-pages/*.html`) tidak bisa memakai CSS aplikasi, jadi nilai warnanya ditulis
sebaris. Warna merek email: `#33479f` (setara `--color-primary`); ubah lewat parameter `brandColor`. Halaman error memakai token yang
sama sebagai variabel CSS di dalam berkasnya (dibuat oleh `npm run error-pages`).

## Cara memeriksa kesamaan

1. Jalankan `npm run dev`, buka **sidebar → Panduan** (`/styleguide`).
2. Bandingkan berdampingan dengan aplikasi asal: warna, ukuran kontrol, jarak, tabel, dialog, badge, keadaan kosong/galat.
3. `npm run standards` memeriksa pelanggaran yang bisa dicek mesin (warna tertulis langsung, tabel mentah, dll.).

# Kontrak API

Semua layar memanggil `http.get/post/put/delete(url, data)` di `src/lib/http.ts`. Saat ini jawabannya dari `src/mock/server.ts`
(`USE_MOCK = true`). Untuk memakai backend asli: isi `API_BASE`, set `USE_MOCK = false`, dan sediakan endpoint di bawah. Hapus folder
`src/mock/` setelahnya.

## Aturan umum

- JSON masuk dan keluar. Sesi lewat cookie (`credentials: 'include'`); tambahkan CSRF/token bila backend membutuhkan.
- **Berhasil:** status 2xx, isi bebas. Bila ada `message`, tampil sebagai toast hijau.
- **Validasi gagal:** status **422**, `{ "message": "...", "errors": { "kolom": ["pesan pertama", ...] } }`. Pesan pertama tiap kolom
  tampil di bawah kolom itu.
- **Gagal lain:** status 4xx/5xx, `{ "message": "..." }` (tampil sebagai toast merah). **401** = belum masuk (layar kembali ke login).
- Teks untuk pengguna berbahasa Indonesia. Waktu dalam ISO 8601.

## Sesi

| Metode | URL | Isi / hasil |
|---|---|---|
| GET | `/me` | `{ user: {id,name,username,email}, security: {enabled, method: 'totp'\|'email'\|null}, notifications: {unread, items[]} }`, 401 bila belum masuk |
| POST | `/login` | `{ username, password, remember }` → `{ two_factor: false, ...me }` atau `{ two_factor: true }` (lanjut ke verifikasi). 422 `errors.username` bila salah |
| POST | `/logout` | `{}` |

## Verifikasi dua langkah saat masuk

| Metode | URL | Isi / hasil |
|---|---|---|
| GET | `/two-factor-challenge` | `{ method, name, email, wait, recovery_available }`; 401 bila tidak ada yang menunggu verifikasi |
| POST | `/two-factor-challenge` | `{ code, recovery: boolean }` → `me`. 422 `errors.code` bila salah; 401 setelah terlalu banyak salah (kembali ke login) |
| POST | `/two-factor-challenge/resend` | OTP email: `{ message, wait }` (detik sampai boleh kirim lagi), 422 bila masih ditahan |
| POST | `/two-factor-challenge/cancel` | `{}` |

## Profil dan MFA

| Metode | URL | Isi / hasil |
|---|---|---|
| GET | `/profile` | `{ account: {name,username,email}, twoFactor: {method, emailAvailable, recoveryRemaining} }` |
| PUT | `/profile/password` | `{ current_password, password, password_confirmation }`. 422 per kolom |
| POST | `/profile/two-factor/totp/start` | `{ secret, uri }` (`uri` = `otpauth://totp/...`, dibuat jadi QR di layar) |
| POST | `/profile/two-factor/totp` | `{ code }` → `{ message, recovery_codes: string[] }` |
| POST | `/profile/two-factor/email/send` | `{ message, wait }` |
| POST | `/profile/two-factor/email` | `{ code }` → `{ message, recovery_codes }` |
| DELETE | `/profile/two-factor` | `{ code }` (kode aplikasi, OTP email, atau kode pemulihan) → `{ message }` |

Kode pemulihan: 8 kode berbentuk `xxxxx-xxxxx`, sekali pakai, hanya ditampilkan saat MFA diaktifkan.

## Notifikasi

| Metode | URL | Hasil |
|---|---|---|
| POST | `/notifications/read-all` | `{ unread, items[] }` |
| POST | `/notifications/{id}/read` | `{ unread, items[] }` |

Item: `{ id, title, body, module, level: 'info'\|'success'\|'warning', url, read, at }`.

## Audit log

Catatan tambah-saja (tidak pernah diubah atau dihapus) dengan **rantai hash**: `hash = SHA-256(isi entri + previous_hash)`; entri
pertama memakai hash nol. Contoh perhitungan ada di `src/mock/audit.ts` (di backend asli sebaiknya HMAC dengan kunci rahasia).

| Metode | URL | Hasil |
|---|---|---|
| GET | `/audit-logs?search&module&outcome&from&to&page&per_page` | `{ data: Entry[], meta: {current_page,last_page,from,to,total,per_page}, modules: string[] }`, terbaru dulu. `per_page` ∈ 10, 25, 50 |
| GET | `/audit-logs/export?...filter yang sama` | berkas `text/csv` (kolom: Waktu, Pengguna, Modul, Kejadian, Data, Hasil, IP, URL) |
| POST | `/audit-logs/verify` | `{ ok, checked, broken_at, reason }`; hasilnya sendiri dicatat sebagai entri |

`Entry`: `{ id, at, user, username, module, event, action, subject_type, subject_id, subject, outcome: 'success'|'failure'|'denied', ip,
method, url, user_agent, request_id, old, new, context, previous_hash, hash }`. `old`/`new` = nilai kolom sebelum dan sesudah
(objek, boleh `null`).

Kejadian yang sebaiknya dicatat: masuk, keluar, gagal masuk, MFA (dikirim, gagal, berhasil, kode pemulihan dipakai), ganti kata
sandi (berhasil/gagal), MFA diaktifkan/dimatikan, ekspor dan verifikasi audit log, akses ditolak. **Jangan pernah** menyimpan
rahasia (kata sandi, kode, kunci) di `old`/`new`/`context`.

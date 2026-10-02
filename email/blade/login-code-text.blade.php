{{ config('app.name') }}

Halo{{ $name ? ' '.$name : '' }},

Kode verifikasi Anda:

    {{ $code }}

Kode berlaku {{ $minutes }} menit dan hanya bisa dipakai sekali.
Dikirim pada {{ $sentAt }}.

JANGAN BAGIKAN KODE INI kepada siapa pun, termasuk petugas bank atau tim IT. Kami tidak pernah memintanya.

Bila bukan Anda yang mencoba masuk atau mengubah pengaturan keamanan, abaikan email ini dan segera beri tahu administrator.

--
Email otomatis dari {{ config('app.name') }}, mohon tidak dibalas.
PT BPR Bangunarta

<!DOCTYPE html>
<html lang="id">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="color-scheme" content="light">
        <title>Kode verifikasi {{ config('app.name') }}</title>
    </head>
    <body style="margin:0;padding:0;background:#eef0f5;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#1f2430;-webkit-text-size-adjust:100%;">
        {{-- Preheader: the line mail apps show next to the subject. --}}
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
            Kode verifikasi Anda {{ $code }}. Berlaku {{ $minutes }} menit.
        </div>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef0f5;">
            <tr>
                <td align="center" style="padding:32px 12px;">
                    <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="width:100%;max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #dfe3ec;">
                        {{-- Brand bar --}}
                        <tr>
                            <td style="background:#33479f;padding:20px 28px;">
                                <table role="presentation" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="width:36px;height:36px;background:#ffffff;border-radius:8px;text-align:center;font-size:18px;font-weight:700;color:#33479f;line-height:36px;">S</td>
                                        <td style="padding-left:12px;font-size:18px;font-weight:700;color:#ffffff;letter-spacing:.3px;">{{ config('app.name') }}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        {{-- Message --}}
                        <tr>
                            <td style="padding:32px 28px 8px;">
                                <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#33479f;text-transform:uppercase;letter-spacing:1px;">Verifikasi dua langkah</p>
                                <h1 style="margin:0 0 14px;font-size:22px;line-height:1.3;font-weight:700;color:#1f2430;">Kode verifikasi Anda</h1>
                                <p style="margin:0;font-size:15px;line-height:1.6;color:#4b5263;">
                                    Halo{{ $name ? ' '.$name : '' }}, masukkan kode berikut untuk melanjutkan.
                                </p>
                            </td>
                        </tr>

                        {{-- The code, one box per digit --}}
                        <tr>
                            <td align="center" style="padding:20px 28px 8px;">
                                <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:6px 0;">
                                    <tr>
                                        @foreach (str_split($code) as $digit)
                                            <td align="center" style="width:46px;height:56px;background:#f3f5fb;border:1px solid #d5dbee;border-radius:8px;font-family:'SFMono-Regular',Consolas,'Courier New',monospace;font-size:28px;font-weight:700;color:#1f2430;">{{ $digit }}</td>
                                        @endforeach
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding:6px 28px 24px;font-size:13px;color:#6b7280;">
                                Berlaku <strong style="color:#1f2430;">{{ $minutes }} menit</strong> dan hanya bisa dipakai sekali.
                            </td>
                        </tr>

                        {{-- Security notice --}}
                        <tr>
                            <td style="padding:0 28px 28px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff8e6;border:1px solid #f3dfa2;border-radius:8px;">
                                    <tr>
                                        <td style="padding:14px 16px;font-size:13px;line-height:1.6;color:#6a5416;">
                                            <strong>Jangan bagikan kode ini</strong> kepada siapa pun, termasuk petugas bank atau tim IT. Kami tidak pernah memintanya.
                                        </td>
                                    </tr>
                                </table>
                                <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#6b7280;">
                                    Bila bukan Anda yang mencoba masuk atau mengubah pengaturan keamanan, abaikan email ini dan segera beri tahu administrator.
                                </p>
                            </td>
                        </tr>

                        {{-- Footer --}}
                        <tr>
                            <td style="padding:18px 28px;background:#f7f8fb;border-top:1px solid #e6e9f1;font-size:12px;line-height:1.6;color:#8a91a1;">
                                Dikirim pada {{ $sentAt }}<br>
                                Email otomatis dari {{ config('app.name') }}, mohon tidak dibalas.<br>
                                &copy; {{ now()->year }} PT BPR Bangunarta
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
</html>

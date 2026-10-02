/**
 * The one-time-code email (sign-in with two-factor, or turning two-factor on). Pure functions with no dependencies, so
 * they run in any Node backend or in the browser (the style guide previews it). The HTML uses tables and inline styles on
 * purpose: that is what mail apps render reliably. `email/blade/` holds the same template for Laravel.
 *
 * Usage: const { subject, html, text } = renderLoginCodeEmail({ appName: 'Starter Kit', code: '482915', minutes: 10, name: 'Rina' });
 */
export type LoginCodeEmail = {
    appName: string;
    /** Company line in the footer, e.g. "PT BPR Bangunarta". */
    company?: string;
    code: string;
    /** How long the code is valid, in minutes. */
    minutes: number;
    /** Recipient's name; the greeting is "Halo," without it. */
    name?: string | null;
    /** When the mail was sent, already formatted (e.g. "1 Oktober 2026, 21:16 WIB"). */
    sentAt: string;
    /** Brand colour of the top bar and the small labels. */
    brandColor?: string;
};

const escape = (value: string): string => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function renderLoginCodeEmail(input: LoginCodeEmail): { subject: string; html: string; text: string } {
    const { appName, code, minutes, sentAt } = input;
    const company = input.company ?? appName;
    const brand = input.brandColor ?? '#33479f';
    const greeting = input.name ? ` ${escape(input.name)}` : '';
    const digits = [...code]
        .map((digit) => `<td align="center" style="width:46px;height:56px;background:#f3f5fb;border:1px solid #d5dbee;border-radius:8px;font-family:'SFMono-Regular',Consolas,'Courier New',monospace;font-size:28px;font-weight:700;color:#1f2430;">${escape(digit)}</td>`)
        .join('');

    const html = `<!DOCTYPE html>
<html lang="id">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="color-scheme" content="light">
        <title>Kode verifikasi ${escape(appName)}</title>
    </head>
    <body style="margin:0;padding:0;background:#eef0f5;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#1f2430;-webkit-text-size-adjust:100%;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
            Kode verifikasi Anda ${escape(code)}. Berlaku ${minutes} menit.
        </div>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef0f5;">
            <tr>
                <td align="center" style="padding:32px 12px;">
                    <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="width:100%;max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #dfe3ec;">
                        <tr>
                            <td style="background:${brand};padding:20px 28px;">
                                <table role="presentation" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="width:36px;height:36px;background:#ffffff;border-radius:8px;text-align:center;font-size:18px;font-weight:700;color:${brand};line-height:36px;">${escape(appName.charAt(0).toUpperCase())}</td>
                                        <td style="padding-left:12px;font-size:18px;font-weight:700;color:#ffffff;letter-spacing:.3px;">${escape(appName)}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <tr>
                            <td style="padding:32px 28px 8px;">
                                <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:${brand};text-transform:uppercase;letter-spacing:1px;">Verifikasi dua langkah</p>
                                <h1 style="margin:0 0 14px;font-size:22px;line-height:1.3;font-weight:700;color:#1f2430;">Kode verifikasi Anda</h1>
                                <p style="margin:0;font-size:15px;line-height:1.6;color:#4b5263;">
                                    Halo${greeting}, masukkan kode berikut untuk melanjutkan.
                                </p>
                            </td>
                        </tr>

                        <tr>
                            <td align="center" style="padding:20px 28px 8px;">
                                <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:6px 0;">
                                    <tr>${digits}</tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding:6px 28px 24px;font-size:13px;color:#6b7280;">
                                Berlaku <strong style="color:#1f2430;">${minutes} menit</strong> dan hanya bisa dipakai sekali.
                            </td>
                        </tr>

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

                        <tr>
                            <td style="padding:18px 28px;background:#f7f8fb;border-top:1px solid #e6e9f1;font-size:12px;line-height:1.6;color:#8a91a1;">
                                Dikirim pada ${escape(sentAt)}<br>
                                Email otomatis dari ${escape(appName)}, mohon tidak dibalas.<br>
                                &copy; ${new Date().getFullYear()} ${escape(company)}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
</html>
`;

    const text = `${appName}

Halo${input.name ? ` ${input.name}` : ''},

Kode verifikasi Anda:

    ${code}

Kode berlaku ${minutes} menit dan hanya bisa dipakai sekali.
Dikirim pada ${sentAt}.

JANGAN BAGIKAN KODE INI kepada siapa pun, termasuk petugas bank atau tim IT. Kami tidak pernah memintanya.

Bila bukan Anda yang mencoba masuk atau mengubah pengaturan keamanan, abaikan email ini dan segera beri tahu administrator.

--
Email otomatis dari ${appName}, mohon tidak dibalas.
${company}
`;

    return { subject: `${appName}: kode verifikasi ${code}`, html, text };
}

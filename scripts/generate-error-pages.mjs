// Builds the static error pages in error-pages/ (self-contained HTML: no build step, no assets), for a web server or a
// framework to serve when the app itself cannot (maintenance, 5xx, 401/403/404/419/429).
//   node scripts/generate-error-pages.mjs [AppName]
import { mkdirSync, writeFileSync } from 'node:fs';

const app = process.argv[2] ?? 'Starter Kit';
const pages = [
    [401, 'Perlu masuk', 'Silakan masuk untuk melanjutkan.', 'Ke beranda'],
    [403, 'Akses ditolak', 'Peran Anda tidak diizinkan membuka halaman ini. Bila ini keliru, minta administrator memberikan aksesnya.', 'Ke beranda'],
    [404, 'Halaman tidak ditemukan', 'Halaman yang Anda cari tidak ada atau sudah dipindahkan.', 'Ke beranda'],
    [419, 'Halaman kedaluwarsa', 'Sesi Anda berakhir. Muat ulang halaman lalu coba lagi.', 'Coba lagi', true],
    [429, 'Terlalu banyak permintaan', 'Anda mengirim permintaan terlalu cepat. Tunggu sebentar lalu coba lagi.', 'Coba lagi', true],
    [500, 'Terjadi kesalahan', 'Terjadi kesalahan tak terduga. Coba lagi sebentar lagi.', 'Coba lagi', true],
    [503, 'Sedang dalam pemeliharaan', 'Sistem sedang diperbarui dan akan segera kembali. Coba lagi dalam beberapa menit.', 'Coba lagi', true],
];

const css = `
:root{--primary:oklch(0.45 0.16 265);--primary-hover:oklch(0.4 0.16 265);--canvas:oklch(0.975 0.003 260);--ink:oklch(0.24 0.02 265);--muted:oklch(0.55 0.02 265)}
*{box-sizing:border-box}
html{font-size:15px}
body{margin:0;background:var(--canvas);color:var(--ink);font-family:'Instrument Sans Variable','Instrument Sans',ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
main{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2.5rem 1rem;text-align:center}
.brand{display:flex;align-items:center;gap:.5rem;margin-bottom:2rem}
.mark{display:flex;width:2rem;height:2rem;align-items:center;justify-content:center;border-radius:.5rem;background:var(--primary);color:#fff;font-size:.8125rem;font-weight:700}
.name{font-size:1rem;font-weight:600}
.code{margin:0;font-size:6rem;line-height:1;font-weight:700;letter-spacing:-.025em;color:color-mix(in oklch,var(--primary) 20%,transparent);user-select:none}
@media(min-width:640px){.code{font-size:8rem}}
h1{margin:1rem 0 0;font-size:1.5rem;font-weight:600}
p.d{margin:.5rem 0 0;max-width:28rem;font-size:.8125rem;color:var(--muted)}
a.b{display:inline-flex;height:2rem;align-items:center;margin-top:1.5rem;padding:0 .75rem;border-radius:.375rem;background:var(--primary);color:#fff;font-size:.8125rem;font-weight:500;text-decoration:none}
a.b:hover{background:var(--primary-hover)}
`;

mkdirSync('error-pages', { recursive: true });

for (const [code, title, description, label, reload] of pages) {
    const href = reload ? 'javascript:location.reload()' : '/';
    writeFileSync(
        `error-pages/${code}.html`,
        `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${code} ${title} - ${app}</title>
<style>${css}</style>
</head>
<body>
<main>
<div class="brand"><span class="mark">${app.charAt(0).toUpperCase()}</span><span class="name">${app}</span></div>
<p class="code">${code}</p>
<h1>${title}</h1>
<p class="d">${description}</p>
<a class="b" href="${href}">${label}</a>
</main>
</body>
</html>
`,
    );
}

console.log(`${pages.length} error pages written to error-pages/`);

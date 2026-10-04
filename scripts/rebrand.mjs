// Rebrands the starter in one command: app name, logo letter, primary colour, favicon, email, and static error pages.
//   npm run rebrand -- --name "Nama Aplikasi" --color "#0f766e" [--initial N]
// Either --name or --color may be given alone. See README, "Rebranding".
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const arg = (flag) => {
    const index = process.argv.indexOf(flag);

    return index === -1 ? undefined : process.argv[index + 1];
};
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const write = (path, content) => writeFileSync(new URL(`../${path}`, import.meta.url), content);
const done = (message) => console.log(`✓ ${message}`);

const name = arg('--name');
const color = arg('--color');

if (!name && !color) {
    console.error('Pakai: npm run rebrand -- --name "Nama Aplikasi" --color "#0f766e" [--initial N]');
    process.exit(1);
}

if (color && !/^#[0-9a-fA-F]{6}$/.test(color)) {
    console.error('--color harus berbentuk #rrggbb, mis. #0f766e');
    process.exit(1);
}

/** sRGB hex to OKLCH (Björn Ottosson's matrices), the colour space of the theme tokens. */
function hexToOklch(hex) {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
    const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
    const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

    return { L, C: Math.hypot(a, bb), H: ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360, luminance: 0.2126 * r + 0.7152 * g + 0.0722 * b };
}

const num = (value, digits) => Number(value.toFixed(digits));
const oklch = (L, C, H) => `oklch(${num(L, 2)} ${num(C, 3)} ${Math.round(H)})`;

let initial = arg('--initial');

if (name) {
    initial = (initial ?? name.trim().charAt(0)).toUpperCase();
    write('src/lib/brand.ts', read('src/lib/brand.ts').replace(/APP_NAME = '.*'/, `APP_NAME = '${name.replace(/'/g, "\\'")}'`).replace(/APP_INITIAL = '.*'/, `APP_INITIAL = '${initial}'`));
    write('index.html', read('index.html').replace(/<title>.*<\/title>/, `<title>${name}</title>`));
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    write('package.json', read('package.json').replace(/"name": ".*"/, `"name": "${slug}"`));
    done(`nama aplikasi "${name}" (huruf logo ${initial}) di src/lib/brand.ts, index.html, package.json`);
}

if (color) {
    const { L, C, H, luminance } = hexToOklch(color);
    const css = read('src/index.css')
        .replace(/--color-primary: .*;/, `--color-primary: ${oklch(L, C, H)};`)
        .replace(/--color-primary-hover: .*;/, `--color-primary-hover: ${oklch(Math.max(L - 0.05, 0), C, H)};`)
        .replace(/--color-primary-soft: .*;/, `--color-primary-soft: ${oklch(0.96, Math.min(C, 0.02), H)};`);
    write('src/index.css', css);
    done(`warna utama ${color} -> token primary di src/index.css`);

    const old = /\?\? '(#[0-9a-fA-F]{6})'/.exec(read('email/login-code.ts'))?.[1];

    if (old) {
        for (const file of ['email/login-code.ts', 'email/blade/login-code.blade.php']) {
            write(file, read(file).replaceAll(old, color));
        }

        done('warna merek di template email (TypeScript dan Blade)');
    }

    if (1.05 / (luminance + 0.05) < 4.5) {
        console.warn('! Kontras teks putih di atas warna ini di bawah 4,5:1 (tombol utama sulit dibaca). Pilih warna yang lebih gelap.');
    }
}

// Favicon: a rounded square in the primary colour with the logo letter.
const letter = initial ?? /APP_INITIAL = '(.*)'/.exec(read('src/lib/brand.ts'))?.[1] ?? 'S';
const fill = color ?? /#[0-9a-fA-F]{6}/.exec(read('public/favicon.svg'))?.[0] ?? '#33479f';

write('public/favicon.svg', `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">\n<rect width="64" height="64" rx="14" fill="${fill}"/>\n<text x="32" y="45" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="38" font-weight="700" text-anchor="middle" fill="#ffffff">${letter}</text>\n</svg>\n`);
done(`public/favicon.svg (${letter}, ${fill})`);

const root = new URL('..', import.meta.url).pathname;
const png = join(tmpdir(), 'rebrand-favicon.png');

try {
    // rsvg-convert renders the SVG text reliably; ImageMagick alone often lacks the font.
    execFileSync('rsvg-convert', ['-w', '256', '-h', '256', 'public/favicon.svg', '-o', png], { cwd: root, stdio: 'ignore' });
    execFileSync('magick', [png, '-define', 'icon:auto-resize=48,32,16', 'public/favicon.ico'], { cwd: root, stdio: 'ignore' });
    done('public/favicon.ico dibuat ulang (rsvg-convert + ImageMagick)');
} catch {
    console.warn('! public/favicon.ico belum dibuat ulang (butuh rsvg-convert dan ImageMagick). Ubah favicon.svg menjadi favicon.ico secara manual, mis. lewat realfavicongenerator.net.');
}

execFileSync('node', ['scripts/generate-error-pages.mjs'], { cwd: root, stdio: 'ignore' });
done('halaman error statis dibuat ulang (error-pages/)');
console.log('\nSelesai. Jalankan: npm run check && npm run dev');

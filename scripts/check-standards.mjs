// Mechanical checks of the code standards (see docs/STANDARDS.md). Exit code 1 when something is broken.
//   npm run standards
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('../src', import.meta.url).pathname;
const files = [];

(function walk(dir) {
    for (const name of readdirSync(dir)) {
        const path = join(dir, name);

        if (statSync(path).isDirectory()) {
            walk(path);
        } else if (/\.(ts|tsx)$/.test(name)) {
            files.push(path);
        }
    }
})(root);

/** Test files and test setup may use literal colours and localStorage (test data, cleanup). */
const isTest = (file) => /\.test\.tsx?$|\/src\/test\//.test(file);

const rules = [
    {
        name: 'Tabel mentah dilarang: pakai components/ui/data-table.tsx (DataTable)',
        test: (line) => /<table[\s>]/.test(line),
        skip: (file) => file.endsWith('components/ui/data-table.tsx'),
    },
    {
        name: 'Warna ditulis langsung: pakai token tema di src/index.css',
        test: (line) => /#[0-9a-fA-F]{3,8}\b|\b(rgb|rgba|hsl|hsla|oklch)\(/.test(line) && !/^\s*(\/\/|\*|\/\*)/.test(line),
        skip: (file) => file.includes('/mock/') || file.endsWith('components/ui/color-input.tsx') || isTest(file),
    },
    {
        name: 'Baris judul + aksi memakai items-center, bukan items-start justify-between',
        test: (line) => /items-start justify-between/.test(line),
        skip: (file) => file.endsWith('components/ui/combobox.tsx'),
    },
    { name: 'console.log/debugger tertinggal', test: (line) => /\bconsole\.log\(|\bdebugger\b/.test(line), skip: () => false },
    {
        name: 'Palet Tailwind untuk status dilarang: pakai token success/warning/info/danger (-soft, -line, -ink)',
        test: (line) => /\b(bg|text|border|ring)-(red|green|emerald|amber|yellow|orange|blue|sky|rose|lime|teal)-\d{2,3}\b/.test(line),
        skip: () => false,
    },
    {
        name: 'Ukuran teks sembarang dilarang: pakai text-2xs, text-xs, text-sm, atau text-base (token di src/index.css)',
        test: (line) => /\btext-\[\d+(\.\d+)?(px|rem)\]/.test(line),
        skip: () => false,
    },
    {
        name: 'Lapisan layar penuh buatan sendiri dilarang: pakai Modal/ConfirmDialog (components/ui/dialog.tsx) atau Dialog Radix',
        test: (line) => /\bfixed inset-0\b/.test(line),
        skip: (file) => file.endsWith('components/ui/dialog.tsx'),
    },
    { name: 'Tipe any dilarang', test: (line) => /:\s*any\b|\bas any\b|<any>/.test(line), skip: () => false },
    { name: '@ts-ignore/@ts-nocheck dilarang: perbaiki tipenya', test: (line) => /@ts-(ignore|nocheck)/.test(line), skip: () => false, inComments: true },
    {
        name: 'fetch langsung dilarang: pakai http di lib/http.ts',
        test: (line) => /\bfetch\(/.test(line),
        skip: (file) => file.endsWith('lib/http.ts') || file.endsWith('hooks/use-network-status.ts'),
    },
    { name: 'dangerouslySetInnerHTML dilarang: tampilkan teks biasa', test: (line) => /dangerouslySetInnerHTML/.test(line), skip: () => false },
    {
        name: 'localStorage/sessionStorage dilarang: rahasia tidak boleh disimpan di peramban',
        test: (line) => /\b(localStorage|sessionStorage)\b/.test(line),
        skip: (file) => file.includes('/mock/') || isTest(file),
    },
    {
        name: 'Ekspor bawaan hanya untuk halaman, layout, dan App',
        test: (line) => /^export default\b/.test(line),
        skip: (file) => /\/(pages|layouts)\//.test(file) || file.endsWith('/App.tsx'),
    },
    {
        name: 'key memakai indeks dilarang: pakai id yang stabil',
        test: (line) => /key=\{(i|idx|index)\}/.test(line),
        skip: (file) => file.endsWith('components/ui/data-table.tsx'),
    },
];

let failures = 0;

for (const file of files) {
    const lines = readFileSync(file, 'utf8').split('\n');

    lines.forEach((line, index) => {
        const comment = /^\s*(\/\/|\*|\/\*)/.test(line);

        for (const rule of rules) {
            if (comment && !rule.inComments) {
                continue;
            }

            if (!rule.skip(file) && rule.test(line)) {
                failures++;
                console.error(`${relative(process.cwd(), file)}:${index + 1}  ${rule.name}`);
            }
        }
    });
}

// Multi-line rule: buttons inside DialogFooter/CardFooter are text only (see docs/STANDARDS.md, "Tombol").
for (const file of files) {
    const text = readFileSync(file, 'utf8');

    for (const match of text.matchAll(/<(DialogFooter|CardFooter)\b[^>]*>([\s\S]*?)<\/\1>/g)) {
        if (/<[A-Z][A-Za-z0-9]*\s*\/>/.test(match[2] ?? '')) {
            failures++;
            console.error(
                `${relative(process.cwd(), file)}:${text.slice(0, match.index).split('\n').length}  Tombol di footer dialog/kartu hanya teks, tanpa ikon`,
            );
        }
    }
}

// Multi-line rule: a screen that opens a Modal supplies the dialog body with DialogBody (header, body, footer; see docs/STANDARDS.md).
for (const file of files) {
    const text = readFileSync(file, 'utf8');

    if (/<Modal\b/.test(text) && !/\bDialogBody\b/.test(text) && !file.endsWith('components/ui/dialog.tsx') && !isTest(file)) {
        failures++;
        console.error(`${relative(process.cwd(), file)}  Dialog tanpa DialogBody: isi dialog dibungkus DialogBody (header, body, footer)`);
    }
}

if (failures > 0) {
    console.error(`\n${failures} pelanggaran standar kode.`);
    process.exit(1);
}

console.log(`Standar kode terpenuhi (${files.length} berkas diperiksa).`);

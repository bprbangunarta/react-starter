// Mechanical checks of the code standards (see docs/STANDARDS.md). Exit code 1 when something is broken.
//   npm run standards
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// `fileURLToPath`, not `.pathname`: a folder name with a space or a non-ASCII letter is percent-encoded in a URL and `.pathname` would not open.
const root = fileURLToPath(new URL('../src', import.meta.url));
const files = [];

/** A file or folder that cannot be read stops the check with a sentence, never with a stack trace nobody can act on. */
function unreadable(path, error) {
    console.error(`Tidak bisa membaca ${relative(process.cwd(), path)} (${error.code ?? error.message}). Periksa izin dan isi folder src, lalu ulangi.`);
    process.exit(1);
}

(function walk(dir) {
    let names;

    try {
        names = readdirSync(dir);
    } catch (error) {
        unreadable(dir, error);
    }

    for (const name of names) {
        const path = join(dir, name);

        try {
            if (statSync(path).isDirectory()) {
                walk(path);
            } else if (/\.(ts|tsx)$/.test(name)) {
                files.push(path);
            }
        } catch (error) {
            unreadable(path, error);
        }
    }
})(root);

if (files.length === 0) {
    console.error(`Tidak ada berkas .ts atau .tsx di ${relative(process.cwd(), root)}: pemeriksaan ini tidak memeriksa apa pun, jadi dihentikan.`);
    process.exit(1);
}

const sources = new Map(
    files.map((file) => {
        try {
            return [file, readFileSync(file, 'utf8')];
        } catch (error) {
            return unreadable(file, error);
        }
    }),
);

/** Test files and test setup may use literal colours and localStorage (test data, cleanup). */

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
    {
        name: 'Tanggal, waktu, dan angka untuk orang diformat di lib/format.ts saja (formatDate, formatDateTime, formatRelative, formatNumber, rupiah)',
        test: (line) => /from 'date-fns\/locale'|\bIntl\.(NumberFormat|DateTimeFormat)\b|\.toLocale(Date|Time)?String\(/.test(line),
        skip: (file) => isTest(file) || file.endsWith('lib/format.ts') || file.endsWith('components/ui/date-picker.tsx'),
    },
    {
        name: 'type="number"/type="tel" dilarang: kolom angka memakai MaskedInput (components/ui/masked-input.tsx), karena type="number" menerima huruf e dan tanda, dan type="tel" menerima huruf',
        test: (line) => /\btype=["']?(number|tel)\b/.test(line) || /\btype:\s*['"](number|tel)['"]/.test(line),
        skip: (file) => isTest(file),
    },
    {
        name: 'Label menu terlalu panjang: satu atau dua kata, maksimal 15 karakter, tanpa garis miring (nama lengkap ada di judul halaman)',
        test: (line) => {
            const label = /\{\s*label:\s*'([^']*)',\s*to:/.exec(line)?.[1];

            return label !== undefined && (label.length > 15 || label.includes('/') || label.trim().split(/\s+/).length > 2);
        },
        skip: (file) => !file.endsWith('layouts/menu.ts'),
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
    const lines = sources.get(file).split('\n');

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
    const text = sources.get(file);

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
    const text = sources.get(file);

    if (/<Modal\b/.test(text) && !/\bDialogBody\b/.test(text) && !file.endsWith('components/ui/dialog.tsx') && !isTest(file)) {
        failures++;
        console.error(`${relative(process.cwd(), file)}  Dialog tanpa DialogBody: isi dialog dibungkus DialogBody (header, body, footer)`);
    }
}

// Multi-line rule: PageHeader gives its action buttons equal widths by itself, so `actions` is the buttons (a fragment), never a wrapping div.
for (const file of files) {
    const text = sources.get(file);

    if (/<PageHeader\b[^>]*?actions=\{\s*<div\b/s.test(text) && !isTest(file)) {
        failures++;
        console.error(
            `${relative(process.cwd(), file)}  PageHeader: actions berisi tombolnya langsung (fragment), tanpa div pembungkus, supaya tombolnya sama lebar`,
        );
    }
}

if (failures > 0) {
    console.error(`\n${failures} pelanggaran standar kode.`);
    process.exit(1);
}

console.log(`Standar kode terpenuhi (${files.length} berkas diperiksa).`);

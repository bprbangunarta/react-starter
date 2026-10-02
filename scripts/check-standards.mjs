// Mechanical checks of the code standards (see docs/CODE-STANDARDS.md). Exit code 1 when something is broken.
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

const rules = [
    {
        name: 'Tabel mentah dilarang: pakai components/ui/data-table.tsx (DataTable)',
        test: (line) => /<table[\s>]/.test(line),
        skip: (file) => file.endsWith('components/ui/data-table.tsx'),
    },
    {
        name: 'Warna ditulis langsung: pakai token tema di src/index.css',
        test: (line) => /#[0-9a-fA-F]{3,8}\b|\b(rgb|rgba|hsl|hsla|oklch)\(/.test(line) && !/^\s*(\/\/|\*|\/\*)/.test(line),
        skip: (file) => file.includes('/mock/'),
    },
    {
        name: 'Baris judul + aksi memakai items-center, bukan items-start justify-between',
        test: (line) => /items-start justify-between/.test(line),
        skip: (file) => file.endsWith('components/ui/combobox.tsx'),
    },
    { name: 'console.log/debugger tertinggal', test: (line) => /\bconsole\.log\(|\bdebugger\b/.test(line), skip: () => false },
    { name: 'Tipe any dilarang', test: (line) => /:\s*any\b|\bas any\b|<any>/.test(line), skip: () => false },
];

let failures = 0;

for (const file of files) {
    const lines = readFileSync(file, 'utf8').split('\n');

    lines.forEach((line, index) => {
        if (/^\s*(\/\/|\*|\/\*)/.test(line)) {
            return; // comments
        }

        for (const rule of rules) {
            if (!rule.skip(file) && rule.test(line)) {
                failures++;
                console.error(`${relative(process.cwd(), file)}:${index + 1}  ${rule.name}`);
            }
        }
    });
}

if (failures > 0) {
    console.error(`\n${failures} pelanggaran standar kode.`);
    process.exit(1);
}

console.log(`Standar kode terpenuhi (${files.length} berkas diperiksa).`);

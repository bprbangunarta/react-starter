import {
    File,
    FileArchive,
    FileImage,
    FileSpreadsheet,
    FileText,
    Folder,
    FolderPlus,
    LayoutGrid,
    List,
    MoreHorizontal,
    Pencil,
    Trash2,
    Upload,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import type { Column } from '@/components/ui/data-table';
import { ConfirmDialog, DialogBody, DialogFooter, Modal } from '@/components/ui/dialog';
import { Drawer, DrawerBody } from '@/components/ui/drawer';
import { DropdownContent, DropdownItem, DropdownMenu, DropdownSeparator, DropdownTrigger } from '@/components/ui/dropdown';
import { Field } from '@/components/ui/field';
import { FileInput } from '@/components/ui/file-input';
import { FilterBar, SearchInput } from '@/components/ui/filter-bar';
import { Input } from '@/components/ui/input';
import { Card, CardBody, EmptyState, PageHeader } from '@/components/ui/misc';
import { Progress } from '@/components/ui/progress';
import { Tip } from '@/components/ui/tooltip';
import { formatBytes, formatDate } from '@/lib/format';
import { useTitle } from '@/lib/title';
import { cn } from '@/lib/utils';

type Item = {
    id: string;
    /** Id of the folder it sits in; `null` is the top level. */
    parent: string | null;
    type: 'folder' | 'file';
    name: string;
    /** Bytes; 0 for a folder. */
    size: number;
    /** ISO date. */
    modified: string;
};

const MB = 1024 * 1024;
/** Demo storage limit (100 MB): the bar below the header fills as files are uploaded. */
const QUOTA = 100 * MB;

const INITIAL_ITEMS: Item[] = [
    { id: 'f1', parent: null, type: 'folder', name: 'Dokumen', size: 0, modified: '2026-10-02' },
    { id: 'f2', parent: null, type: 'folder', name: 'Gambar', size: 0, modified: '2026-10-08' },
    { id: 'f3', parent: null, type: 'folder', name: 'Laporan', size: 0, modified: '2026-10-15' },
    { id: 'f4', parent: 'f1', type: 'folder', name: 'Kontrak', size: 0, modified: '2026-09-21' },
    { id: 'a1', parent: null, type: 'file', name: 'Panduan Pengguna.pdf', size: 2.4 * MB, modified: '2026-10-12' },
    { id: 'a2', parent: null, type: 'file', name: 'Catatan Rapat.docx', size: 86 * 1024, modified: '2026-10-18' },
    { id: 'a3', parent: 'f1', type: 'file', name: 'Prosedur Operasional.pdf', size: 1.1 * MB, modified: '2026-09-30' },
    { id: 'a4', parent: 'f1', type: 'file', name: 'Daftar Vendor.xlsx', size: 214 * 1024, modified: '2026-10-05' },
    { id: 'a5', parent: 'f4', type: 'file', name: 'Kontrak Sewa 2026.pdf', size: 3.2 * MB, modified: '2026-09-21' },
    { id: 'a6', parent: 'f2', type: 'file', name: 'Logo Utama.png', size: 480 * 1024, modified: '2026-10-08' },
    { id: 'a7', parent: 'f2', type: 'file', name: 'Foto Kantor.jpg', size: 4.6 * MB, modified: '2026-10-09' },
    { id: 'a8', parent: 'f3', type: 'file', name: 'Laporan Triwulan III.xlsx', size: 1.8 * MB, modified: '2026-10-15' },
    { id: 'a9', parent: 'f3', type: 'file', name: 'Arsip Laporan 2025.zip', size: 18.5 * MB, modified: '2026-01-10' },
];

const KINDS: { match: RegExp; label: string; icon: LucideIcon }[] = [
    { match: /\.(png|jpe?g|gif|webp|svg)$/i, label: 'Gambar', icon: FileImage },
    { match: /\.pdf$/i, label: 'PDF', icon: FileText },
    { match: /\.(docx?|txt|rtf)$/i, label: 'Dokumen', icon: FileText },
    { match: /\.(xlsx?|csv)$/i, label: 'Spreadsheet', icon: FileSpreadsheet },
    { match: /\.(zip|rar|7z|tar|gz)$/i, label: 'Arsip', icon: FileArchive },
];

/** Kind label and icon of an item, from its type or the extension of its name. */
function kindOf(item: Item): { label: string; icon: LucideIcon } {
    if (item.type === 'folder') {
        return { label: 'Folder', icon: Folder };
    }

    return KINDS.find((k) => k.match.test(item.name)) ?? { label: 'Berkas', icon: File };
}

/** The name, or the name with " (2)", " (3)"… before the extension when the folder already has one like it. */
function uniqueName(name: string, taken: string[]): string {
    const used = new Set(taken.map((n) => n.toLowerCase()));

    if (!used.has(name.toLowerCase())) {
        return name;
    }

    const dot = name.lastIndexOf('.');
    const stem = dot > 0 ? name.slice(0, dot) : name;
    const extension = dot > 0 ? name.slice(dot) : '';

    for (let n = 2; ; n++) {
        const candidate = `${stem} (${n})${extension}`;

        if (!used.has(candidate.toLowerCase())) {
            return candidate;
        }
    }
}

type NameDraft = { mode: 'create' } | { mode: 'rename'; item: Item };

export default function FileManage() {
    useTitle('File Manage');
    const [params, setParams] = useSearchParams();
    const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');
    const [order, setOrder] = useState<{ sort: string; direction: 'asc' | 'desc' }>({ sort: 'name', direction: 'asc' });
    const [naming, setNaming] = useState<NameDraft | null>(null);
    const [name, setName] = useState('');
    const [nameError, setNameError] = useState<string | undefined>();
    const [uploading, setUploading] = useState(false);
    const [chosen, setChosen] = useState<File[]>([]);
    const [removing, setRemoving] = useState<Item | null>(null);
    const [detail, setDetail] = useState<Item | null>(null);
    const counter = useRef(100);

    const requested = params.get('folder');
    const folder = items.find((i) => i.id === requested && i.type === 'folder') ?? null;
    const currentId = folder?.id ?? null;

    // The chain of folders from the top level down to `item` (inclusive).
    const trailOf = (item: Item | null): Item[] => {
        const trail: Item[] = [];

        for (let at = item; at; at = items.find((i) => i.id === at?.parent) ?? null) {
            trail.unshift(at);
        }

        return trail;
    };

    const openFolder = (item: Item) => {
        setSearch('');
        setParams({ folder: item.id });
    };

    // Breadcrumb: File Manage → … → current folder; the parents link back through the `folder` address parameter.
    const trail = trailOf(folder);
    const crumbs = [
        { label: 'File Manage', to: trail.length > 0 ? '/file-manage' : undefined },
        ...trail.map((t, index) => ({ label: t.name, to: index < trail.length - 1 ? `/file-manage?folder=${t.id}` : undefined })),
    ];

    const compare: Record<string, (a: Item, b: Item) => number> = {
        name: (a, b) => a.name.localeCompare(b.name, 'id'),
        kind: (a, b) => kindOf(a).label.localeCompare(kindOf(b).label, 'id'),
        size: (a, b) => a.size - b.size,
        modified: (a, b) => a.modified.localeCompare(b.modified),
    };
    const direction = order.direction === 'asc' ? 1 : -1;
    // Folders always come first, then the chosen order.
    const visible = items
        .filter((i) => i.parent === currentId && i.name.toLowerCase().includes(search.trim().toLowerCase()))
        .sort((a, b) => (a.type === b.type ? (compare[order.sort]?.(a, b) ?? 0) * direction : a.type === 'folder' ? -1 : 1));

    const used = items.reduce((total, i) => total + i.size, 0);
    const usedPercent = (used / QUOTA) * 100;

    const locationOf = (item: Item): string => {
        const parents = trailOf(items.find((i) => i.id === item.parent) ?? null).map((t) => t.name);

        return `/${parents.join('/')}`;
    };

    const openNaming = (draft: NameDraft) => {
        setNameError(undefined);
        setName(draft.mode === 'rename' ? draft.item.name : '');
        setNaming(draft);
    };

    const saveName = () => {
        if (!naming) {
            return;
        }

        const value = name.trim();
        const parent = naming.mode === 'rename' ? naming.item.parent : currentId;
        const siblings = items.filter((i) => i.parent === parent && (naming.mode === 'create' || i.id !== naming.item.id));

        if (value === '') {
            setNameError('Nama wajib diisi.');
        } else if (/[\\/]/.test(value)) {
            setNameError('Nama tidak boleh memuat garis miring.');
        } else if (siblings.some((i) => i.name.toLowerCase() === value.toLowerCase())) {
            setNameError('Nama sudah dipakai di folder ini.');
        } else {
            const now = new Date().toISOString();

            if (naming.mode === 'create') {
                counter.current += 1;
                setItems((all) => [...all, { id: `n${counter.current}`, parent, type: 'folder', name: value, size: 0, modified: now }]);
                toast.success('Folder dibuat');
            } else {
                setItems((all) => all.map((i) => (i.id === naming.item.id ? { ...i, name: value, modified: now } : i)));
                toast.success('Nama diubah');
            }

            setNaming(null);
        }
    };

    const closeUpload = () => {
        setUploading(false);
        setChosen([]);
    };

    const upload = () => {
        const taken = items.filter((i) => i.parent === currentId).map((i) => i.name);
        const now = new Date().toISOString();
        const added: Item[] = chosen.map((file) => {
            counter.current += 1;
            const unique = uniqueName(file.name, taken);

            taken.push(unique);

            return { id: `n${counter.current}`, parent: currentId, type: 'file', name: unique, size: file.size, modified: now };
        });

        setItems((all) => [...all, ...added]);
        toast.success(added.length === 1 ? 'Berkas diunggah' : `${added.length} berkas diunggah`);
        closeUpload();
    };

    const remove = () => {
        if (!removing) {
            return;
        }

        // A folder takes everything inside it along.
        const gone = new Set<string>([removing.id]);

        for (let grew = true; grew;) {
            grew = false;

            for (const i of items) {
                if (i.parent !== null && gone.has(i.parent) && !gone.has(i.id)) {
                    gone.add(i.id);
                    grew = true;
                }
            }
        }

        setItems((all) => all.filter((i) => !gone.has(i.id)));
        toast.success(removing.type === 'folder' ? 'Folder dihapus' : 'Berkas dihapus');
        setRemoving(null);
    };

    const actions = (item: Item) => (
        <DropdownMenu>
            <Tip label="Aksi">
                <DropdownTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label={`Aksi ${item.name}`}>
                        <MoreHorizontal />
                    </Button>
                </DropdownTrigger>
            </Tip>
            <DropdownContent>
                {item.type === 'file' && (
                    <DropdownItem icon={<File />} onSelect={() => setDetail(item)}>
                        Lihat rincian
                    </DropdownItem>
                )}
                <DropdownItem icon={<Pencil />} onSelect={() => openNaming({ mode: 'rename', item })}>
                    Ubah nama
                </DropdownItem>
                <DropdownSeparator />
                <DropdownItem danger icon={<Trash2 />} onSelect={() => setRemoving(item)}>
                    Hapus
                </DropdownItem>
            </DropdownContent>
        </DropdownMenu>
    );

    const empty = {
        icon: <Folder />,
        title: search ? 'Tidak ada hasil' : 'Folder ini kosong',
        description: search ? 'Coba kata kunci lain.' : 'Unggah berkas atau buat folder baru.',
    };

    const toolbar = (
        <FilterBar search={<SearchInput value={search} onChange={setSearch} placeholder="Cari berkas atau folder…" label="Cari berkas atau folder" />}>
            <Button variant={view === 'grid' ? 'primary' : 'outline'} aria-pressed={view === 'grid'} onClick={() => setView('grid')}>
                <LayoutGrid /> Kotak
            </Button>
            <Button variant={view === 'list' ? 'primary' : 'outline'} aria-pressed={view === 'list'} onClick={() => setView('list')}>
                <List /> Daftar
            </Button>
        </FilterBar>
    );

    const columns: Column<Item>[] = [
        {
            key: 'name',
            header: 'Nama',
            sort: 'name',
            className: 'font-medium',
            cell: (item) => {
                const { icon: Icon } = kindOf(item);

                return (
                    <span className="flex items-center gap-2">
                        <Icon className={cn('size-4 shrink-0', item.type === 'folder' ? 'text-primary' : 'text-muted')} />
                        {item.name}
                    </span>
                );
            },
        },
        { key: 'kind', header: 'Jenis', sort: 'kind', cell: (item) => kindOf(item).label },
        {
            key: 'size',
            header: 'Ukuran',
            sort: 'size',
            align: 'right',
            className: 'tabular-nums',
            cell: (item) => (item.type === 'folder' ? '–' : formatBytes(item.size)),
        },
        { key: 'modified', header: 'Diubah', sort: 'modified', cell: (item) => formatDate(item.modified) },
        { key: 'actions', header: 'Aksi', srOnly: true, narrow: true, align: 'right', cell: (item) => actions(item) },
    ];

    return (
        <>
            <div className="mb-2">
                <Breadcrumb items={crumbs} />
            </div>
            <PageHeader
                title="File Manage"
                description="Contoh pengelola berkas: folder, unggah, ubah nama, dan hapus (data demo di memori)"
                actions={
                    <>
                        <Button variant="outline" onClick={() => openNaming({ mode: 'create' })}>
                            <FolderPlus /> Folder Baru
                        </Button>
                        <Button onClick={() => setUploading(true)}>
                            <Upload /> Unggah
                        </Button>
                    </>
                }
            />

            <Card className="mb-3">
                <CardBody>
                    <Progress
                        label={`Penyimpanan terpakai: ${formatBytes(used)} dari ${formatBytes(QUOTA)}`}
                        value={usedPercent}
                        tone={usedPercent >= 95 ? 'danger' : usedPercent >= 80 ? 'warning' : 'primary'}
                    />
                </CardBody>
            </Card>

            {view === 'list' ? (
                <DataTable
                    columns={columns}
                    rows={visible}
                    rowKey={(i) => i.id}
                    toolbar={toolbar}
                    empty={empty}
                    sort={{
                        sort: order.sort,
                        direction: order.direction,
                        onSort: (column) => setOrder((o) => ({ sort: column, direction: o.sort === column && o.direction === 'asc' ? 'desc' : 'asc' })),
                    }}
                    onRowClick={(item) => (item.type === 'file' ? setDetail(item) : openFolder(item))}
                />
            ) : (
                <Card>
                    {toolbar}
                    {visible.length === 0 ? (
                        <EmptyState icon={empty.icon} title={empty.title} description={empty.description} />
                    ) : (
                        <ul className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {visible.map((item) => {
                                const { icon: Icon, label } = kindOf(item);

                                return (
                                    <li
                                        key={item.id}
                                        className="relative flex flex-col rounded-lg border border-line bg-surface p-3 transition-colors hover:bg-canvas"
                                    >
                                        <div className="absolute top-1 right-1">{actions(item)}</div>
                                        <button
                                            type="button"
                                            onClick={() => (item.type === 'file' ? setDetail(item) : openFolder(item))}
                                            className="flex min-w-0 flex-col items-start gap-2 rounded text-left focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
                                        >
                                            <Icon className={cn('size-9', item.type === 'folder' ? 'text-primary' : 'text-muted')} />
                                            <span className="w-full min-w-0">
                                                <span className="block truncate text-sm font-medium" title={item.name}>
                                                    {item.name}
                                                </span>
                                                <span className="block truncate text-xs text-muted">
                                                    {item.type === 'folder' ? 'Folder' : `${label} · ${formatBytes(item.size)}`}
                                                </span>
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </Card>
            )}

            <Modal
                persistent
                open={naming !== null}
                onOpenChange={(next) => !next && setNaming(null)}
                title={naming?.mode === 'rename' ? 'Ubah nama' : 'Folder baru'}
                description={naming?.mode === 'rename' ? undefined : 'Folder dibuat di lokasi yang sedang dibuka.'}
            >
                <form
                    noValidate
                    onSubmit={(e) => {
                        e.preventDefault();
                        saveName();
                    }}
                >
                    <DialogBody>
                        <Field label="Nama" required error={nameError}>
                            <Input autoFocus maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
                        </Field>
                    </DialogBody>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setNaming(null)}>
                            Batal
                        </Button>
                        <Button type="submit">Simpan</Button>
                    </DialogFooter>
                </form>
            </Modal>

            <Modal persistent open={uploading} onOpenChange={(next) => !next && closeUpload()} title="Unggah berkas" description="Maksimal 5 MB per berkas.">
                <DialogBody>
                    <FileInput multiple value={chosen} onValueChange={setChosen} maxBytes={5 * MB} onReject={(message) => toast.error(message)} />
                </DialogBody>
                <DialogFooter>
                    <Button variant="outline" onClick={closeUpload}>
                        Batal
                    </Button>
                    <Button disabled={chosen.length === 0} onClick={upload}>
                        Unggah
                    </Button>
                </DialogFooter>
            </Modal>

            <ConfirmDialog
                open={removing !== null}
                onOpenChange={(next) => !next && setRemoving(null)}
                title={removing?.type === 'folder' ? 'Hapus folder?' : 'Hapus berkas?'}
                description={
                    removing?.type === 'folder'
                        ? `Folder "${removing.name}" beserta seluruh isinya akan dihapus.`
                        : `Berkas "${removing?.name ?? ''}" akan dihapus.`
                }
                onConfirm={remove}
            />

            <Drawer open={detail !== null} onOpenChange={(next) => !next && setDetail(null)} title={detail?.name ?? 'Rincian'} description="Rincian berkas">
                <DrawerBody>
                    {detail && (
                        <dl className="grid grid-cols-[6rem_1fr] gap-x-3 gap-y-2 text-sm">
                            {(
                                [
                                    ['Jenis', kindOf(detail).label],
                                    ['Ukuran', formatBytes(detail.size)],
                                    ['Diubah', formatDate(detail.modified)],
                                    ['Lokasi', locationOf(detail)],
                                ] as [string, string][]
                            ).map(([label, value]) => (
                                <div key={label} className="contents">
                                    <dt className="text-xs text-muted">{label}</dt>
                                    <dd className="break-all">{value}</dd>
                                </div>
                            ))}
                        </dl>
                    )}
                </DrawerBody>
            </Drawer>
        </>
    );
}

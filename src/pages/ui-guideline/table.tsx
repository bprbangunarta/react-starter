import { Inbox, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { DataTable } from '@/components/ui/data-table';
import type { Column } from '@/components/ui/data-table';
import { ConfirmDialog, DialogBody, DialogFooter, Modal } from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import { FilterBar, SearchInput } from '@/components/ui/filter-bar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/misc';
import type { BadgeTone } from '@/components/ui/misc';
import { Tip } from '@/components/ui/tooltip';
import { rupiah } from '@/lib/format';

export const TONES: BadgeTone[] = ['neutral', 'info', 'success', 'warning', 'danger'];

type Row = { id: number; name: string; status: BadgeTone; amount: number };
type Draft = { id: number | null; name: string; status: BadgeTone; amount: string };
const EMPTY_DRAFT: Draft = { id: null, name: '', status: 'success', amount: '' };
const NAMES = ['Alfa', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa', 'Lambda', 'Sigma'];
const STATUSES: BadgeTone[] = ['success', 'warning', 'danger', 'info', 'neutral'];
const INITIAL_ROWS: Row[] = NAMES.map((name, index) => ({
    id: index + 1,
    name: `Proyek ${name}`,
    status: STATUSES[index % STATUSES.length] ?? 'neutral',
    amount: 870_000 + ((index * 3_730_000) % 12_000_000),
}));

/** DataTable with search, filter, sort, pagination and a create/edit/delete flow, all on rows kept in memory. */
export function TableExample() {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<string | null>(null);
    const [rows, setRows] = useState<Row[]>(INITIAL_ROWS);
    const [draft, setDraft] = useState<Draft | null>(null);
    const [nameError, setNameError] = useState<string | undefined>();
    const [removing, setRemoving] = useState<Row | null>(null);

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(5);
    // Sorting: clicking a header sorts by it (ascending first); clicking the active one flips the direction. Here it runs on the rows in
    // memory; in a list paged by the server it is the server that sorts, with the same keys in a whitelist (see docs/STANDARDS.md).
    const [order, setOrder] = useState<{ sort: string; direction: 'asc' | 'desc' }>({ sort: 'name', direction: 'asc' });
    const compare: Record<string, (a: Row, b: Row) => number> = {
        name: (a, b) => a.name.localeCompare(b.name, 'id'),
        status: (a, b) => TONES.indexOf(a.status) - TONES.indexOf(b.status),
        amount: (a, b) => a.amount - b.amount,
    };
    const matching = rows
        .filter((r) => r.name.toLowerCase().includes(search.trim().toLowerCase()) && (status === null || r.status === status))
        .sort((a, b) => (compare[order.sort]?.(a, b) ?? 0) * (order.direction === 'asc' ? 1 : -1));
    const lastPage = Math.max(1, Math.ceil(matching.length / perPage));
    const current = Math.min(page, lastPage);
    const visible = matching.slice((current - 1) * perPage, current * perPage);

    const openDraft = (next: Draft) => {
        setNameError(undefined);
        setDraft(next);
    };

    const save = () => {
        if (!draft) {
            return;
        }

        if (draft.name.trim() === '') {
            setNameError('Nama wajib diisi.');

            return;
        }

        const next = { name: draft.name.trim(), status: draft.status, amount: Number(draft.amount) || 0 };
        setRows((all) =>
            draft.id === null
                ? [...all, { id: Math.max(0, ...all.map((r) => r.id)) + 1, ...next }]
                : all.map((r) => (r.id === draft.id ? { ...r, ...next } : r)),
        );
        toast.success(draft.id === null ? 'Data ditambahkan' : 'Perubahan tersimpan');
        setDraft(null);
    };

    const columns: Column<Row>[] = [
        { key: 'name', header: 'Nama', className: 'font-medium', cell: (r) => r.name, sort: 'name' },
        { key: 'status', header: 'Status', cell: (r) => <Badge tone={r.status}>{r.status}</Badge>, sort: 'status' },
        { key: 'amount', header: 'Nilai', align: 'right', className: 'tabular-nums', cell: (r) => rupiah(r.amount), sort: 'amount' },
        {
            key: 'actions',
            header: 'Aksi',
            srOnly: true,
            narrow: true,
            align: 'right',
            cell: (r) => (
                <div className="flex justify-end gap-1">
                    <Tip label="Ubah">
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Ubah ${r.name}`}
                            onClick={() => openDraft({ id: r.id, name: r.name, status: r.status, amount: String(r.amount) })}
                        >
                            <Pencil />
                        </Button>
                    </Tip>
                    <Tip label="Hapus">
                        <Button variant="ghost" size="icon" aria-label={`Hapus ${r.name}`} onClick={() => setRemoving(r)}>
                            <Trash2 />
                        </Button>
                    </Tip>
                </div>
            ),
        },
    ];

    return (
        <>
            <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                    <div>
                        <h2 className="text-sm font-semibold">Tabel (DataTable) dan contoh CRUD</h2>
                        <p className="text-xs text-muted">
                            Data statis di memori: Tambah, Ubah, dan Hapus membuka dialog lalu mengubah tabel. Muat ulang halaman untuk mengembalikan.
                        </p>
                    </div>
                    <Button size="sm" onClick={() => openDraft(EMPTY_DRAFT)}>
                        <Plus />
                        Tambah
                    </Button>
                </div>
                <DataTable
                    rows={visible}
                    rowKey={(r) => r.id}
                    columns={columns}
                    onRowClick={(r) => openDraft({ id: r.id, name: r.name, status: r.status, amount: String(r.amount) })}
                    toolbar={
                        <FilterBar search={<SearchInput value={search} onChange={setSearch} placeholder="Cari…" label="Cari contoh" />}>
                            <Combobox
                                className="w-full sm:w-36"
                                clearable
                                searchable={false}
                                placeholder="Status"
                                options={TONES.map((t) => ({ value: t, label: t }))}
                                value={status}
                                onChange={setStatus}
                            />
                        </FilterBar>
                    }
                    sort={{
                        ...order,
                        onSort: (column) => setOrder((o) => ({ sort: column, direction: o.sort === column && o.direction === 'asc' ? 'desc' : 'asc' })),
                    }}
                    pagination={{
                        meta: {
                            current_page: current,
                            last_page: lastPage,
                            from: matching.length === 0 ? 0 : (current - 1) * perPage + 1,
                            to: Math.min(matching.length, current * perPage),
                            total: matching.length,
                        },
                        perPage,
                        options: [5, 10],
                        onPage: setPage,
                        onPerPage: (value) => {
                            setPerPage(value);
                            setPage(1);
                        },
                    }}
                    empty={{ icon: <Inbox />, title: 'Tidak ada data' }}
                />
            </div>

            <Modal
                persistent
                open={draft !== null}
                onOpenChange={(next) => !next && setDraft(null)}
                title={draft?.id === null ? 'Tambah data' : 'Ubah data'}
                description="Isi lalu simpan. Galat validasi tampil di bawah kolom."
            >
                {draft && (
                    <form
                        noValidate
                        onSubmit={(e) => {
                            e.preventDefault();
                            save();
                        }}
                    >
                        <DialogBody className="grid gap-3">
                            <Field label="Nama" required error={nameError}>
                                <Input
                                    autoFocus
                                    maxLength={60}
                                    value={draft.name}
                                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                                    aria-invalid={!!nameError}
                                />
                            </Field>
                            <Field label="Status">
                                <Combobox
                                    searchable={false}
                                    options={TONES.map((t) => ({ value: t, label: t }))}
                                    value={draft.status}
                                    onChange={(v) => setDraft({ ...draft, status: (v ?? 'neutral') as BadgeTone })}
                                />
                            </Field>
                            <Field label="Nilai (Rp)">
                                <Input
                                    inputMode="numeric"
                                    value={draft.amount}
                                    onChange={(e) => setDraft({ ...draft, amount: e.target.value.replace(/\D/g, '') })}
                                />
                            </Field>
                        </DialogBody>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDraft(null)}>
                                Batal
                            </Button>
                            <Button type="submit">Simpan</Button>
                        </DialogFooter>
                    </form>
                )}
            </Modal>
            <ConfirmDialog
                open={removing !== null}
                onOpenChange={(next) => !next && setRemoving(null)}
                title="Hapus data?"
                description={`"${removing?.name ?? ''}" akan dihapus dari contoh ini.`}
                onConfirm={() => {
                    setRows((all) => all.filter((r) => r.id !== removing?.id));
                    setRemoving(null);
                    toast.success('Dihapus');
                }}
            />
        </>
    );
}

import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Download, Eye, ScrollText, ShieldCheck, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { DatePicker } from '@/components/ui/date-picker';
import { DialogFooter, Modal } from '@/components/ui/dialog';
import { FilterBar, SearchInput } from '@/components/ui/filter-bar';
import { DataTable } from '@/components/ui/data-table';
import type { Column } from '@/components/ui/data-table';
import { Badge, PageHeader } from '@/components/ui/misc';
import type { BadgeTone } from '@/components/ui/misc';
import type { PageMeta } from '@/components/ui/pagination';
import { Tip } from '@/components/ui/tooltip';
import { http } from '@/lib/http';
import type { Params } from '@/lib/http';
import { useResource } from '@/lib/resource';
import { useTitle } from '@/lib/title';
import { exportCsv as downloadCsv } from '@/lib/download';

type Values = Record<string, unknown>;
type LogRow = {
    id: number | string;
    at: string;
    user: string | null;
    username: string | null;
    event: string;
    module: string;
    action: string;
    outcome: 'success' | 'failure' | 'denied';
    subject: string | null;
    subject_type: string | null;
    subject_id: number | string | null;
    old: Values | null;
    new: Values | null;
    context: Values | null;
    ip: string | null;
    user_agent: string | null;
    method: string | null;
    url: string | null;
    request_id: string;
    hash: string;
};
type Filters = {
    search: string;
    module: string | null;
    outcome: 'success' | 'failure' | 'denied' | null;
    from: string | null;
    to: string | null;
    per_page: number;
};
type Verification = {
    ok: boolean;
    checked: number;
    broken_at: number | string | null;
    reason: string | null;
};
const OUTCOMES = [
    { value: 'success', label: 'Berhasil' },
    { value: 'failure', label: 'Gagal' },
    { value: 'denied', label: 'Ditolak' },
];
const OUTCOME_LABEL = Object.fromEntries(
    OUTCOMES.map((o) => [o.value, o.label]),
) as Record<LogRow['outcome'], string>;
const TONES: Record<LogRow['outcome'], BadgeTone> = {
    success: 'success',
    failure: 'danger',
    denied: 'warning',
};
const MIN_DATE = new Date(2020, 0, 1);

const show = (value: unknown): string =>
    value === null || value === undefined
        ? '–'
        : typeof value === 'string'
          ? value
          : JSON.stringify(value);

const changedFields = (log: LogRow): string[] =>
    Array.from(
        new Set([...Object.keys(log.old ?? {}), ...Object.keys(log.new ?? {})]),
    );

const diffColumns = (log: LogRow): Column<string>[] => [
    { key: 'field', header: 'Kolom', className: 'font-medium', cell: (f) => f },
    {
        key: 'before',
        header: 'Sebelum',
        className: 'break-all text-muted',
        cell: (f) => show(log.old?.[f]),
    },
    {
        key: 'after',
        header: 'Sesudah',
        className: 'break-all',
        cell: (f) => show(log.new?.[f]),
    },
];

export default function AuditLogsIndex() {
    useTitle('Audit Log');
    const [selected, setSelected] = useState<LogRow | null>(null);
    const [verifying, setVerifying] = useState(false);
    const [verification, setVerification] = useState<Verification | null>(null);
    const [filters, setFilters] = useState<Filters & { page: number }>({ search: '', module: null, outcome: null, from: null, to: null, per_page: 25, page: 1 });
    const [search, setSearch] = useState('');
    const { data, loading, error, reload } = useResource<{ data: LogRow[]; meta: PageMeta & { per_page: number }; modules: string[] }>('/audit-logs', filters as unknown as Params);
    const logs = { data: data?.data ?? [], ...(data?.meta ?? { current_page: 1, last_page: 1, from: 0, to: 0, total: 0 }) };
    const modules = data?.modules ?? [];

    // Typing in the search box searches a moment after the last key.
    useEffect(() => {
        const timer = setTimeout(() => setFilters((f) => (f.search === search ? f : { ...f, search, page: 1 })), 300);

        return () => clearTimeout(timer);
    }, [search]);

    const visit = (changes: Partial<Filters & { page: number }>) => setFilters((f) => ({ ...f, ...changes, page: changes.page ?? 1 }));
    const onSearch = setSearch;
    const clear = (changes: Partial<Filters>) => {
        setSearch('');
        setFilters((f) => ({ ...f, search: '', ...changes, page: 1 }));
    };

    const hasFilters = Boolean(filters.search || filters.module || filters.outcome || filters.from || filters.to);
    const iso = (d: string) => (d ? d : null);

    const exportCsv = () => void downloadCsv('/audit-logs/export', filters as unknown as Params);

    const verify = async () => {
        setVerifying(true);

        try {
            setVerification(await http.post<Verification>('/audit-logs/verify'));
            reload();
        } finally {
            setVerifying(false);
        }
    };

    const columns: Column<LogRow>[] = [
        {
            key: 'time',
            header: 'Waktu',
            className: 'whitespace-nowrap',
            cell: (log) =>
                format(
                    new Date(log.at.replace(' ', 'T')),
                    'dd MMM yyyy HH:mm:ss',
                    { locale: id },
                ),
        },
        {
            key: 'ip',
            header: 'Host',
            className: 'whitespace-nowrap',
            hideBelow: 'md',
            cell: (log) => log.ip ?? '–',
        },
        {
            key: 'user',
            header: 'Pengguna',
            cell: (log) => log.user ?? 'Sistem',
        },
        {
            key: 'module',
            header: 'Modul',
            className: 'whitespace-nowrap',
            hideBelow: 'md',
            cell: (log) => log.module,
        },
        {
            key: 'event',
            header: 'Kejadian',
            cell: (log) => log.event,
        },
        {
            key: 'record',
            header: 'Data',
            hideBelow: 'md',
            cell: (log) => log.subject ?? '–',
        },
        {
            key: 'outcome',
            header: 'Hasil',
            cell: (log) => (
                <Badge tone={TONES[log.outcome]}>
                    {OUTCOME_LABEL[log.outcome]}
                </Badge>
            ),
        },
        {
            key: 'actions',
            header: 'Aksi',
            srOnly: true,
            narrow: true,
            align: 'right',
            cell: (log) => (
                <Tip label="Detail">
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Detail entri ${log.id}`}
                        onClick={() => setSelected(log)}
                    >
                        <Eye />
                    </Button>
                </Tip>
            ),
        },
    ];

    return (
        <>
            <PageHeader
                title="Audit Log"
                description="Catatan anti-rusak tentang siapa melakukan apa, kapan, dan dari mana"
                actions={
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={verify}
                            disabled={verifying}
                        >
                            <ShieldCheck />{' '}
                            {verifying ? 'Memeriksa…' : 'Periksa integritas'}
                        </Button>
                        <Button onClick={exportCsv}>
                            <Download /> Ekspor CSV
                        </Button>
                    </div>
                }
            />

            {verification && (
                <div
                    role="status"
                    className={
                        verification.ok
                            ? 'mb-3 rounded-md border border-emerald-600/20 bg-emerald-50 px-3 py-2 text-sm text-emerald-700'
                            : 'mb-3 rounded-md border border-danger/30 bg-red-50 px-3 py-2 text-sm text-danger'
                    }
                >
                    {verification.ok
                        ? `Rantai utuh: ${verification.checked} entri terverifikasi.`
                        : `Rantai terputus di entri #${verification.broken_at}. ${verification.reason}`}
                </div>
            )}

            <DataTable
                rows={logs.data}
                rowKey={(r) => r.id}
                loading={loading}
                error={error}
                onRetry={() => visit({})}
                toolbar={
                    <FilterBar
                        search={
                            <SearchInput
                                value={search}
                                onChange={onSearch}
                                placeholder="Cari pengguna, kejadian, data, IP…"
                                label="Cari audit log"
                            />
                        }
                    >
                        <div className="w-full sm:w-36">
                            <DatePicker
                                value={filters.from ?? ''}
                                min={MIN_DATE}
                                placeholder="Dari"
                                onChange={(v) => visit({ from: iso(v) })}
                            />
                        </div>
                        <div className="w-full sm:w-36">
                            <DatePicker
                                value={filters.to ?? ''}
                                min={MIN_DATE}
                                placeholder="Sampai"
                                onChange={(v) => visit({ to: iso(v) })}
                            />
                        </div>
                        <Combobox
                            className="w-full sm:w-40"
                            clearable
                            placeholder="Modul"
                            options={modules.map((m) => ({
                                value: m,
                                label: m,
                            }))}
                            value={filters.module}
                            onChange={(v) => visit({ module: v })}
                        />
                        <Combobox
                            className="w-full sm:w-32"
                            clearable
                            searchable={false}
                            placeholder="Hasil"
                            options={OUTCOMES}
                            value={filters.outcome}
                            onChange={(v) =>
                                visit({ outcome: v as Filters['outcome'] })
                            }
                        />
                        {hasFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                    clear({
                                        module: null,
                                        outcome: null,
                                        from: null,
                                        to: null,
                                    })
                                }
                            >
                                <X /> Atur ulang
                            </Button>
                        )}
                    </FilterBar>
                }
                columns={columns}
                empty={{
                    icon: <ScrollText />,
                    title: hasFilters
                        ? 'Tidak ada entri yang cocok dengan filter'
                        : 'Belum ada entri',
                }}
                pagination={{
                    meta: logs,
                    perPage: filters.per_page,
                    options: [10, 25, 50],
                    onPage: (page) => visit({ page }),
                    onPerPage: (per_page) => visit({ per_page }),
                }}
            />

            <Modal
                wide
                open={selected !== null}
                onOpenChange={(open) => !open && setSelected(null)}
                title={selected ? `Entri #${selected.id}` : 'Entri'}
                description={selected?.event}
            >
                {selected && (
                    <>
                        <div className="max-h-[70vh] overflow-y-auto p-4 text-sm">
                            <dl className="grid grid-cols-[7rem_1fr] gap-x-3 gap-y-1">
                                {(
                                    [
                                        ['Waktu', selected.at],
                                        [
                                            'Pengguna',
                                            [selected.user, selected.username]
                                                .filter(Boolean)
                                                .join(' · ') || 'Sistem',
                                        ],
                                        [
                                            'Data',
                                            [
                                                selected.subject_type,
                                                selected.subject_id
                                                    ? `#${selected.subject_id}`
                                                    : null,
                                                selected.subject,
                                            ]
                                                .filter(Boolean)
                                                .join(' · ') || '–',
                                        ],
                                        [
                                            'Hasil',
                                            OUTCOME_LABEL[selected.outcome],
                                        ],
                                        ['Alamat IP', selected.ip ?? '–'],
                                        [
                                            'Permintaan',
                                            [selected.method, selected.url]
                                                .filter(Boolean)
                                                .join(' ') || '–',
                                        ],
                                        [
                                            'Peramban',
                                            selected.user_agent ?? '–',
                                        ],
                                        ['ID permintaan', selected.request_id],
                                        ['Hash', selected.hash],
                                    ] as [string, string][]
                                ).map(([label, value]) => (
                                    <div key={label} className="contents">
                                        <dt className="text-xs text-muted">
                                            {label}
                                        </dt>
                                        <dd className="break-all">{value}</dd>
                                    </div>
                                ))}
                            </dl>

                            {(selected.old || selected.new) && (
                                <div className="mt-3 rounded-md border border-line">
                                    <DataTable
                                        bare
                                        dense
                                        rows={changedFields(selected)}
                                        rowKey={(field) => field}
                                        columns={diffColumns(selected)}
                                        empty={{
                                            icon: <ScrollText />,
                                            title: 'Tidak ada perubahan kolom',
                                        }}
                                    />
                                </div>
                            )}

                            {selected.context && (
                                <pre className="mt-3 rounded bg-canvas p-2 text-xs break-all whitespace-pre-wrap">
                                    {JSON.stringify(selected.context, null, 2)}
                                </pre>
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setSelected(null)}
                            >
                                Tutup
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </Modal>
        </>
    );
}

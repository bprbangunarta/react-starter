import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';

export type PageMeta = {
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
};

/** Page numbers to display, with `null` marking a gap. */
function pageWindow(current: number, last: number): (number | null)[] {
    const pages = new Set([1, last, current - 1, current, current + 1].filter((p) => p >= 1 && p <= last));
    const sorted = [...pages].sort((a, b) => a - b);
    const result: (number | null)[] = [];

    sorted.forEach((p, i) => {
        if (i > 0 && p - sorted[i - 1] > 1) {
            result.push(null);
        }
        result.push(p);
    });

    return result;
}

export function Pagination({
    meta,
    perPage,
    perPageOptions,
    onPage,
    onPerPage,
}: {
    meta: PageMeta;
    perPage: number;
    perPageOptions: number[];
    onPage: (page: number) => void;
    onPerPage: (perPage: number) => void;
}) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-3 py-2 text-xs text-muted">
            <div className="flex items-center gap-2">
                <span>{meta.total === 0 ? '0 hasil' : `${meta.from}–${meta.to} dari ${meta.total}`}</span>
                <Combobox
                    className="w-24"
                    searchable={false}
                    options={perPageOptions.map((n) => ({ value: n, label: `${n} / halaman` }))}
                    value={perPage}
                    onChange={(v) => onPerPage(Number(v))}
                />
            </div>
            {meta.last_page > 1 && (
                <nav className="flex items-center gap-1" aria-label="Halaman">
                    <Button variant="outline" size="icon" aria-label="Halaman sebelumnya" disabled={meta.current_page === 1} onClick={() => onPage(meta.current_page - 1)}>
                        <ChevronLeft />
                    </Button>
                    {pageWindow(meta.current_page, meta.last_page).map((p, i) =>
                        p === null ? (
                            <span key={`gap-${i}`} className="px-1">
                                …
                            </span>
                        ) : (
                            <Button
                                key={p}
                                size="icon"
                                variant={p === meta.current_page ? 'primary' : 'outline'}
                                aria-current={p === meta.current_page ? 'page' : undefined}
                                onClick={() => onPage(p)}
                            >
                                {p}
                            </Button>
                        ),
                    )}
                    <Button variant="outline" size="icon" aria-label="Halaman berikutnya" disabled={meta.current_page === meta.last_page} onClick={() => onPage(meta.current_page + 1)}>
                        <ChevronRight />
                    </Button>
                </nav>
            )}
        </div>
    );
}

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Card, EmptyState, ErrorState, Skeleton } from '@/components/ui/misc';
import { Pagination } from '@/components/ui/pagination';
import type { PageMeta } from '@/components/ui/pagination';
import { SortHead } from '@/components/ui/sort-head';
import { cn } from '@/lib/utils';

export type Column<T> = {
    key: string;
    header: ReactNode;
    cell: (row: T, index: number) => ReactNode;
    /** Sort key sent to the server. Adds a sort button to the header. */
    sort?: string;
    align?: 'left' | 'right';
    /** Extra classes for body cells. */
    className?: string;
    /** Hide the header text but keep it for screen readers (action columns). */
    srOnly?: boolean;
    /** Narrow column, for row actions. */
    narrow?: boolean;
};

// Columns are never hidden on small screens; wide tables scroll sideways inside the card.

type Props<T> = {
    columns: Column<T>[];
    rows: T[];
    rowKey: (row: T) => string | number;
    /** Usually a FilterBar, shown above the table. */
    toolbar?: ReactNode;
    loading?: boolean;
    error?: string | null;
    onRetry?: () => void;
    empty: {
        icon: ReactNode;
        title: string;
        description?: string;
        action?: ReactNode;
    };
    sort?: {
        sort: string;
        direction: 'asc' | 'desc';
        onSort: (column: string) => void;
    };
    pagination?: {
        meta: PageMeta;
        perPage: number;
        options: number[];
        onPage: (page: number) => void;
        onPerPage: (perPage: number) => void;
    };
    onRowClick?: (row: T) => void;
    rowClassName?: (row: T) => string | undefined;
    /** Render without the card, for a table inside another card. */
    bare?: boolean;
    /** Smaller text, for secondary tables. */
    dense?: boolean;
    /** Classes for the card. */
    className?: string;
};

/**
 * The app's one table: toolbar, sortable header, skeleton, empty and error states, row click, pagination.
 * Keep the scroll wrapper relative, or absolute children (sr-only) widen the page on phones.
 */
export function DataTable<T>({
    columns,
    rows,
    rowKey,
    toolbar,
    loading = false,
    error = null,
    onRetry,
    empty,
    sort,
    pagination,
    onRowClick,
    rowClassName,
    bare = false,
    dense = false,
    className,
}: Props<T>) {
    // Sorting is all or nothing: if any column has `sort`, the table needs a `sort` prop and every data column needs a key.
    // Only action columns (srOnly) can skip it. Warns in development.
    const sortable = columns.some((c) => c.sort);
    const unsortable = columns
        .filter((c) => !c.sort && !c.srOnly)
        .map((c) => c.key)
        .join(', ');

    useEffect(() => {
        if (!import.meta.env.DEV || !sortable) {
            return;
        }

        if (!sort) {
            console.error('DataTable: a column has "sort" but the table got no "sort" prop, so its header is not clickable.');
        } else if (unsortable !== '') {
            console.error(`DataTable: every column with data should sort; no "sort" key on: ${unsortable}.`);
        }
    }, [sortable, sort, unsortable]);

    const th = (c: Column<T>) => cn('px-3 py-2 font-medium whitespace-nowrap', c.align === 'right' ? 'text-right' : 'text-left', c.narrow && 'w-10');

    const body = error ? (
        <ErrorState message={error} onRetry={onRetry} />
    ) : (
        <div className="relative overflow-x-auto">
            <table className={cn('w-full', dense ? 'text-xs' : 'text-sm')}>
                <thead className="border-b border-line bg-canvas text-2xs tracking-wide text-muted uppercase">
                    <tr>
                        {columns.map((c) =>
                            c.sort && sort ? (
                                <SortHead
                                    key={c.key}
                                    column={c.sort}
                                    sort={sort.sort}
                                    direction={sort.direction}
                                    onSort={sort.onSort}
                                    className={cn(c.align === 'right' && 'text-right [&_button]:ml-auto')}
                                >
                                    {typeof c.header === 'string' ? c.header : c.key}
                                </SortHead>
                            ) : (
                                <th key={c.key} scope="col" className={th(c)}>
                                    {c.srOnly ? <span className="sr-only">{c.header}</span> : c.header}
                                </th>
                            ),
                        )}
                    </tr>
                </thead>
                <tbody className={cn('divide-y divide-line', loading && rows.length > 0 && 'opacity-50')}>
                    {loading && rows.length === 0
                        ? Array.from({ length: 5 }).map((_, i) => (
                              <tr key={i}>
                                  <td colSpan={columns.length} className="px-3 py-2.5">
                                      <Skeleton className="h-4 w-full" />
                                  </td>
                              </tr>
                          ))
                        : rows.map((row, index) => (
                              <tr
                                  key={rowKey(row)}
                                  className={cn('motion-row transition-colors hover:bg-canvas/60', onRowClick && 'cursor-pointer', rowClassName?.(row))}
                                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                              >
                                  {columns.map((c) => (
                                      <td
                                          key={c.key}
                                          // Row actions must not trigger the row click.
                                          onClick={c.srOnly ? (e) => e.stopPropagation() : undefined}
                                          // The 26px icon button sets the row height, so its cell gets the least padding.
                                          className={cn(
                                              'px-3 whitespace-nowrap',
                                              c.srOnly ? 'py-0.5' : 'py-1',
                                              c.align === 'right' && 'text-right',
                                              c.className,
                                          )}
                                      >
                                          {c.cell(row, index)}
                                      </td>
                                  ))}
                              </tr>
                          ))}
                </tbody>
            </table>
            {!loading && rows.length === 0 && <EmptyState icon={empty.icon} title={empty.title} description={empty.description} action={empty.action} />}
        </div>
    );

    const content = (
        <>
            {toolbar}
            {body}
            {pagination && (
                <Pagination
                    meta={pagination.meta}
                    perPage={pagination.perPage}
                    perPageOptions={pagination.options}
                    onPage={pagination.onPage}
                    onPerPage={pagination.onPerPage}
                />
            )}
        </>
    );

    return bare ? content : <Card className={className}>{content}</Card>;
}

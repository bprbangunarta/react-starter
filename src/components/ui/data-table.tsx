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
    /** Server-side sort field; gives the header a sort button. */
    sort?: string;
    align?: 'left' | 'right';
    /** Hide the column below this breakpoint. */
    hideBelow?: 'sm' | 'md' | 'lg';
    /** Extra classes for the body cells. */
    className?: string;
    /** Hide the label visually (e.g. a column of row actions), keeping it for screen readers. */
    srOnly?: boolean;
    /** Narrow column (row actions). */
    narrow?: boolean;
};

const HIDE = {
    sm: 'hidden sm:table-cell',
    md: 'hidden md:table-cell',
    lg: 'hidden lg:table-cell',
};

type Props<T> = {
    columns: Column<T>[];
    rows: T[];
    rowKey: (row: T) => string | number;
    /** Usually a <FilterBar>; rendered above the table inside the card. */
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
    /** Render without the surrounding card (for a table inside another card). */
    bare?: boolean;
    /** Smaller text for dense secondary tables. */
    dense?: boolean;
    /** Classes for the surrounding card (e.g. a max width for short lists). */
    className?: string;
};

/**
 * The one table of the app: card, toolbar, header (sortable on demand), loading skeleton, empty and error
 * states, optional row click, and pagination. The scroll wrapper is `relative` on purpose: absolutely
 * positioned content (e.g. `sr-only` labels) must stay inside it, or the whole page scrolls sideways on phones.
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
    const th = (c: Column<T>) =>
        cn('px-3 py-2 font-medium', c.align === 'right' ? 'text-right' : 'text-left', c.hideBelow && HIDE[c.hideBelow], c.narrow && 'w-10');

    const body = error ? (
        <ErrorState message={error} onRetry={onRetry} />
    ) : (
        <div className="relative overflow-x-auto">
            <table className={cn('w-full', dense ? 'text-xs' : 'text-sm')}>
                <thead className="border-b border-line bg-canvas text-xs text-muted">
                    <tr>
                        {columns.map((c) =>
                            c.sort && sort ? (
                                <SortHead
                                    key={c.key}
                                    column={c.sort}
                                    sort={sort.sort}
                                    direction={sort.direction}
                                    onSort={sort.onSort}
                                    className={cn(c.align === 'right' && 'text-right [&_button]:ml-auto', c.hideBelow && HIDE[c.hideBelow])}
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
                                  className={cn('hover:bg-canvas/60', onRowClick && 'cursor-pointer', rowClassName?.(row))}
                                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                              >
                                  {columns.map((c) => (
                                      <td
                                          key={c.key}
                                          // Row actions must not trigger the row click.
                                          onClick={c.srOnly ? (e) => e.stopPropagation() : undefined}
                                          className={cn('px-3 py-1.5', c.align === 'right' && 'text-right', c.hideBelow && HIDE[c.hideBelow], c.className)}
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

import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Sortable table header cell. `sort`/`direction` describe the current ordering. */
export function SortHead({
    column,
    sort,
    direction,
    onSort,
    children,
    className,
}: {
    column: string;
    sort: string;
    direction: 'asc' | 'desc';
    onSort: (column: string) => void;
    children: string;
    className?: string;
}) {
    const active = sort === column;
    const Icon = !active ? ArrowUpDown : direction === 'asc' ? ArrowUp : ArrowDown;

    return (
        <th scope="col" aria-sort={active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'} className={cn('px-3 py-2 text-left font-medium', className)}>
            <button type="button" onClick={() => onSort(column)} className="inline-flex cursor-pointer items-center gap-1 hover:text-ink">
                {children}
                <Icon className={cn('size-3', !active && 'opacity-40')} />
            </button>
        </th>
    );
}

/** Toggle helper for list pages: clicking the active column flips the direction. */
export function nextSort(current: { sort: string; direction: 'asc' | 'desc' }, column: string) {
    return { sort: column, direction: current.sort === column && current.direction === 'asc' ? ('desc' as const) : ('asc' as const) };
}

import { Search } from 'lucide-react';
import type { ReactNode } from 'react';
import { Input } from '@/components/ui/input';

export function SearchInput({
    value,
    onChange,
    placeholder,
    label,
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    label: string;
}) {
    return (
        <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted" />
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                aria-label={label}
                className="pl-8"
            />
        </div>
    );
}

/**
 * Toolbar of every list: the search box stays alone at the left, the filters (and the reset button)
 * sit together at the right. On small screens the search box takes the full width and the filters sit below it in two even columns (a last, odd one spans both).
 */
export function FilterBar({ search, children }: { search: ReactNode; children?: ReactNode }) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line p-2.5">
            {search}
            {children && (
                <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-end [&>:last-child:nth-child(odd)]:col-span-2 sm:[&>:last-child:nth-child(odd)]:col-span-1">
                    {children}
                </div>
            )}
        </div>
    );
}

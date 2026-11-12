import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

export type Crumb = {
    label: string;
    /** Leave out for the current page (the last crumb). */
    to?: string;
};

/** Where the page sits in the app: parents are links, the last crumb is the current page. Place it above the `PageHeader`. */
export function Breadcrumb({ items }: { items: Crumb[] }) {
    return (
        <nav aria-label="Jejak halaman" className="min-w-0 text-xs text-muted">
            <ol className="flex flex-wrap items-center gap-1">
                {items.map((item, index) => {
                    const last = index === items.length - 1;

                    return (
                        <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1">
                            {item.to && !last ? (
                                <Link
                                    to={item.to}
                                    className="truncate rounded hover:text-ink hover:underline focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span aria-current={last ? 'page' : undefined} className={last ? 'truncate font-medium text-ink' : 'truncate'}>
                                    {item.label}
                                </span>
                            )}
                            {!last && <ChevronRight className="size-3 shrink-0" aria-hidden />}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

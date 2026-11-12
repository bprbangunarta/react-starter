import { formatNumber } from '@/lib/format';
import { Tip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type ChartItem = { label: string; count: number };

/** Series colours chart-1 to chart-5. Written out in full so Tailwind can see the class names. */
const FILL = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4', 'bg-chart-5'] as const;
const STROKE = ['stroke-chart-1', 'stroke-chart-2', 'stroke-chart-3', 'stroke-chart-4', 'stroke-chart-5'] as const;
const OTHER = 'Lainnya';
/** Height of the tallest column in rem. The count above it uses the rest of the 8rem area. */
const COLUMN_MAX_REM = 6;

/** Share of the whole, rounded here so every chart rounds the same way. */
export function share(count: number, total: number): number {
    return total === 0 ? 0 : Math.round((count / total) * 100);
}

const sum = (items: ChartItem[]) => items.reduce((all, item) => all + item.count, 0);

/** Text for one part, shared by the picture, the tooltip and the list. */
const reading = (item: ChartItem, total: number) => `${formatNumber(item.count)} (${share(item.count, total)}%)`;

function NoData() {
    return <p className="py-6 text-center text-xs text-muted">Belum ada data.</p>;
}

/** Horizontal bars for labels too long to fit under a column. The number is always shown. */
export function BarChart({ label, items, className }: { label: string; items: ChartItem[]; className?: string }) {
    const total = sum(items);

    if (total === 0) {
        return <NoData />;
    }

    return (
        <ul
            aria-label={label}
            // Scrollable regions need to be focusable (WCAG 2.1.1).
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            tabIndex={0}
            className={cn(
                'flex max-h-72 flex-col gap-2 overflow-y-auto focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none',
                className,
            )}
        >
            {items.map((item) => (
                <li key={item.label} className="text-xs">
                    <div className="flex items-baseline justify-between gap-2">
                        <span className="min-w-0 truncate">{item.label}</span>
                        <span className="shrink-0 font-medium tabular-nums">
                            {formatNumber(item.count)} <span className="font-normal text-muted">({share(item.count, total)}%)</span>
                        </span>
                    </div>
                    <div aria-hidden="true" className="mt-1 h-1.5 overflow-hidden rounded-full bg-line">
                        <div className="motion-grow-x h-full rounded-full bg-chart-1" style={{ width: `${share(item.count, total)}%` }} />
                    </div>
                </li>
            ))}
        </ul>
    );
}

/** Columns for ordered parts (tenure, age bands). Count on top, label below. */
export function ColumnChart({ label, items }: { label: string; items: ChartItem[] }) {
    const total = sum(items);
    const tallest = Math.max(...items.map((item) => item.count), 1);

    if (total === 0) {
        return <NoData />;
    }

    return (
        <ul aria-label={label} className="flex items-end gap-2">
            {items.map((item) => (
                <li key={item.label} className="flex min-w-0 flex-1 flex-col items-center text-center">
                    <Tip label={`${item.label}: ${reading(item, total)}`}>
                        <div className="flex h-32 w-full flex-col items-center justify-end gap-1">
                            <span className="text-xs font-medium tabular-nums">{formatNumber(item.count)}</span>
                            <div
                                className="motion-grow-y w-full max-w-12 rounded-t-sm bg-chart-1"
                                style={{ height: `${(item.count / tallest) * COLUMN_MAX_REM}rem` }}
                            />
                        </div>
                    </Tip>
                    <span className="mt-1 w-full border-t border-line pt-1 text-2xs break-words text-muted">{item.label}</span>
                </li>
            ))}
        </ul>
    );
}

/** The first four parts keep their colour, the rest are summed as "Lainnya" (five slices at most). */
function slices(items: ChartItem[]): ChartItem[] {
    const parts = items.filter((item) => item.count > 0);

    if (parts.length <= FILL.length) {
        return parts;
    }

    const rest = parts.slice(FILL.length - 1);

    return [...parts.slice(0, FILL.length - 1), { label: OTHER, count: sum(rest) }];
}

/** Donut for a few parts of a whole. The legend carries the numbers; the ring is hidden from screen readers. */
export function DonutChart({ label, items, centerLabel }: { label: string; items: ChartItem[]; centerLabel: string }) {
    const total = sum(items);
    const parts = slices(items);

    if (total === 0) {
        return <NoData />;
    }

    // Where each slice starts, as a share of the whole ring (computed up front: render must not reassign a running total).
    const starts = parts.map((_, index) => parts.slice(0, index).reduce((all, part) => all + (part.count / total) * 100, 0));

    return (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <div className="relative size-32 shrink-0">
                <svg viewBox="0 0 36 36" aria-hidden="true" className="size-full -rotate-90">
                    <circle cx="18" cy="18" r="15" pathLength="100" fill="none" strokeWidth="5" className="stroke-line" />
                    {parts.map((part, index) => {
                        const length = (part.count / total) * 100;
                        const start = starts[index] ?? 0;

                        return (
                            <circle
                                key={part.label}
                                cx="18"
                                cy="18"
                                r="15"
                                pathLength="100"
                                fill="none"
                                strokeWidth="5"
                                strokeDasharray={`${Math.max(length - (parts.length > 1 ? 0.6 : 0), 0.1)} ${100 - length + (parts.length > 1 ? 0.6 : 0)}`}
                                strokeDashoffset={-start}
                                className={STROKE[index]}
                            />
                        );
                    })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-lg leading-none font-semibold tabular-nums">{formatNumber(total)}</span>
                    <span className="mt-0.5 text-2xs text-muted">{centerLabel}</span>
                </div>
            </div>
            <ul aria-label={label} className="flex min-w-40 flex-1 flex-col gap-1.5 text-xs">
                {parts.map((part, index) => (
                    <li key={part.label} className="flex items-baseline justify-between gap-3">
                        <span className="flex min-w-0 items-center gap-2">
                            <span aria-hidden="true" className={cn('size-2.5 shrink-0 rounded-sm', FILL[index])} />
                            <span className="min-w-0 truncate">{part.label}</span>
                        </span>
                        <span className="shrink-0 font-medium tabular-nums">
                            {formatNumber(part.count)} <span className="font-normal text-muted">({share(part.count, total)}%)</span>
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

import { AlertCircle, CheckCircle2, Clock, FileText, RotateCcw, Trash2, UploadCloud, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tip, TooltipProvider } from '@/components/ui/tooltip';
import { formatBytes } from '@/lib/format';
import { cn } from '@/lib/utils';

/** How to send one file. Report progress as 0-100 and stop when signal aborts; http.upload does both. */
export type UploadFn = (file: File, context: { onProgress: (percent: number) => void; signal: AbortSignal }) => Promise<unknown>;

type Status = 'queued' | 'uploading' | 'done' | 'error';

type Entry = { id: string; file: File; status: Status; progress: number; error?: string };

type Props = {
    upload: UploadFn;
    /** Same as the native accept. Checked again here because dropped files skip the native check. */
    accept?: string;
    /** Largest file in bytes. */
    maxBytes?: number;
    /** Most files in the list at once. */
    maxFiles?: number;
    /** Parallel uploads, default 2. */
    concurrency?: number;
    /** Hint under the call to action. */
    description?: string;
    /** Called for each file the server accepted. */
    onUploaded?: (file: File) => void;
    /** Called with a message when files are refused, usually shown as a toast. */
    onReject?: (message: string) => void;
    disabled?: boolean;
    id?: string;
    className?: string;
    'aria-invalid'?: boolean;
    'aria-describedby'?: string;
};

/** Matches a file against an accept list like ".pdf,image/*". */
function accepted(file: File, accept?: string): boolean {
    const tokens = (accept ?? '')
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

    if (tokens.length === 0) {
        return true;
    }

    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();

    return tokens.some((t) => (t.startsWith('.') ? name.endsWith(t) : t.endsWith('/*') ? type.startsWith(t.slice(0, -1)) : type === t));
}

/** Image preview, or a document icon. */
function Thumb({ file }: { file: File }) {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!file.type.startsWith('image/') || typeof URL.createObjectURL !== 'function') {
            return;
        }

        const made = URL.createObjectURL(file);
        setUrl(made);

        return () => URL.revokeObjectURL(made);
    }, [file]);

    return url ? (
        <img src={url} alt="" className="size-9 shrink-0 rounded object-cover" />
    ) : (
        <span className="flex size-9 shrink-0 items-center justify-center rounded bg-canvas text-muted">
            <FileText className="size-4" />
        </span>
    );
}

/**
 * Dropzone with an upload queue: files start right away, two at a time, each with progress, cancel and retry.
 * The screen only passes `upload`. Leaving the screen cancels running uploads. Use FileInput when files are sent with a form.
 */
export function FileUploader({
    upload,
    accept,
    maxBytes,
    maxFiles,
    concurrency = 2,
    description,
    onUploaded,
    onReject,
    disabled,
    id,
    className,
    ...aria
}: Props) {
    const generated = useId();
    const input = useRef<HTMLInputElement>(null);
    const [over, setOver] = useState(false);
    const [entries, setEntries] = useState<Entry[]>([]);
    const controllers = useRef(new Map<string, AbortController>());
    const counter = useRef(0);
    // The effect below should not restart when the parent passes new function instances.
    const latest = useRef({ upload, onUploaded });
    useEffect(() => {
        latest.current = { upload, onUploaded };
    });

    const patch = (entryId: string, changes: Partial<Entry>) => setEntries((all) => all.map((e) => (e.id === entryId ? { ...e, ...changes } : e)));

    const take = (list: FileList | null) => {
        const incoming = [...(list ?? [])];
        const problems: string[] = [];
        const room = maxFiles === undefined ? Infinity : Math.max(0, maxFiles - entries.length);
        const fits: File[] = [];

        for (const file of incoming) {
            if (!accepted(file, accept)) {
                problems.push(`${file.name}: jenis berkas tidak didukung.`);
            } else if (maxBytes !== undefined && file.size > maxBytes) {
                problems.push(`${file.name}: melebihi batas ${formatBytes(maxBytes)}.`);
            } else if (fits.length >= room) {
                problems.push(`${file.name}: melebihi batas ${maxFiles} berkas.`);
            } else {
                fits.push(file);
            }
        }

        if (problems.length > 0) {
            onReject?.(problems.join(' '));
        }

        if (fits.length > 0) {
            setEntries((all) => [
                ...all,
                ...fits.map((file) => {
                    counter.current += 1;

                    return { id: `u${counter.current}`, file, status: 'queued' as const, progress: 0 };
                }),
            ]);
        }

        if (input.current) {
            input.current.value = '';
        }
    };

    // Start queued files while fewer than `concurrency` are running.
    useEffect(() => {
        const active = entries.filter((e) => e.status === 'uploading').length;
        // Started files are in `controllers` (the effect can run twice in development).
        const waiting = entries.filter((e) => e.status === 'queued' && !controllers.current.has(e.id)).slice(0, Math.max(0, concurrency - active));

        for (const entry of waiting) {
            const controller = new AbortController();

            controllers.current.set(entry.id, controller);
            patch(entry.id, { status: 'uploading', progress: 0 });

            latest.current
                .upload(entry.file, { onProgress: (percent) => patch(entry.id, { progress: percent }), signal: controller.signal })
                .then(() => {
                    patch(entry.id, { status: 'done', progress: 100 });
                    latest.current.onUploaded?.(entry.file);
                })
                .catch((error: unknown) => {
                    // A cancelled file is removed by drop(). Other failures stay in the list with a retry button.
                    if (!controller.signal.aborted) {
                        patch(entry.id, { status: 'error', error: error instanceof Error && error.message ? error.message : 'Unggahan gagal.' });
                    }
                })
                .finally(() => controllers.current.delete(entry.id));
        }
    }, [entries, concurrency]);

    // Cancel running uploads on unmount.
    useEffect(() => {
        const running = controllers.current;

        return () => running.forEach((controller) => controller.abort());
    }, []);

    const drop = (entry: Entry) => {
        controllers.current.get(entry.id)?.abort();
        setEntries((all) => all.filter((e) => e.id !== entry.id));
    };

    const done = entries.filter((e) => e.status === 'done').length;
    const failed = entries.filter((e) => e.status === 'error').length;
    const busy = entries.some((e) => e.status === 'queued' || e.status === 'uploading');

    return (
        <TooltipProvider delayDuration={200}>
            <div className={cn('flex flex-col gap-2', className)}>
                <label
                    htmlFor={id ?? generated}
                    onDragOver={(event) => {
                        event.preventDefault();
                        setOver(true);
                    }}
                    onDragLeave={() => setOver(false)}
                    onDrop={(event) => {
                        event.preventDefault();
                        setOver(false);

                        if (!disabled) {
                            take(event.dataTransfer.files);
                        }
                    }}
                    className={cn(
                        'flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-dashed border-line bg-surface px-4 py-6 text-center transition-colors duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 hover:border-primary/50 hover:bg-canvas',
                        over && 'border-primary bg-primary-soft',
                        disabled && 'cursor-not-allowed opacity-50',
                    )}
                >
                    <UploadCloud className={cn('size-8 text-muted transition-transform duration-200', over && 'scale-110 text-primary')} />
                    <span className="text-sm">
                        <span className="font-medium text-primary">Pilih berkas</span> atau seret ke sini
                    </span>
                    {description && <span className="text-xs text-muted">{description}</span>}
                    <input
                        ref={input}
                        id={id ?? generated}
                        type="file"
                        multiple
                        className="sr-only"
                        accept={accept}
                        disabled={disabled}
                        onChange={(event) => take(event.target.files)}
                        {...aria}
                    />
                </label>

                {entries.length > 0 && (
                    <>
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted" aria-live="polite">
                            <span>
                                {done} dari {entries.length} berkas terunggah{failed > 0 && `, ${failed} gagal`}
                            </span>
                            {done > 0 && (
                                <button
                                    type="button"
                                    className="rounded font-medium text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
                                    onClick={() => setEntries((all) => all.filter((e) => e.status !== 'done'))}
                                >
                                    Bersihkan yang selesai
                                </button>
                            )}
                        </div>
                        <ul className="flex flex-col gap-1.5" aria-busy={busy}>
                            {entries.map((entry) => (
                                <li key={entry.id} className="motion-row flex items-center gap-2.5 rounded-md border border-line bg-surface p-2">
                                    <Thumb file={entry.file} />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-baseline justify-between gap-2">
                                            <span className="min-w-0 truncate text-sm font-medium" title={entry.file.name}>
                                                {entry.file.name}
                                            </span>
                                            <span className="shrink-0 text-xs text-muted tabular-nums">{formatBytes(entry.file.size)}</span>
                                        </div>
                                        {entry.status === 'uploading' && (
                                            <Progress aria-label={`Mengunggah ${entry.file.name}`} value={entry.progress} className="mt-1" />
                                        )}
                                        <p
                                            className={cn(
                                                'mt-0.5 flex items-center gap-1 text-xs',
                                                entry.status === 'done' && 'text-success-ink',
                                                entry.status === 'error' && 'text-danger-ink',
                                                (entry.status === 'queued' || entry.status === 'uploading') && 'text-muted',
                                            )}
                                        >
                                            {entry.status === 'queued' && (
                                                <>
                                                    <Clock className="size-3" /> Menunggu giliran
                                                </>
                                            )}
                                            {entry.status === 'uploading' && `Mengunggah… ${entry.progress}%`}
                                            {entry.status === 'done' && (
                                                <>
                                                    <CheckCircle2 className="size-3" /> Selesai
                                                </>
                                            )}
                                            {entry.status === 'error' && (
                                                <>
                                                    <AlertCircle className="size-3 shrink-0" /> <span className="min-w-0 break-words">{entry.error}</span>
                                                </>
                                            )}
                                        </p>
                                    </div>
                                    {entry.status === 'error' && (
                                        <Tip label="Coba lagi">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`Coba lagi ${entry.file.name}`}
                                                onClick={() => patch(entry.id, { status: 'queued', progress: 0, error: undefined })}
                                            >
                                                <RotateCcw />
                                            </Button>
                                        </Tip>
                                    )}
                                    <Tip label={entry.status === 'queued' || entry.status === 'uploading' ? 'Batalkan' : 'Hapus dari daftar'}>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`${entry.status === 'queued' || entry.status === 'uploading' ? 'Batalkan' : 'Hapus'} ${entry.file.name}`}
                                            onClick={() => drop(entry)}
                                        >
                                            {entry.status === 'queued' || entry.status === 'uploading' ? <X /> : <Trash2 />}
                                        </Button>
                                    </Tip>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>
        </TooltipProvider>
    );
}

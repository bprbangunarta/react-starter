import { FileText, Upload, X } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const size = (bytes: number) => (bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

type Props = {
    id?: string;
    value: File[];
    onValueChange: (files: File[]) => void;
    /** Same as the native `accept`, e.g. ".pdf,.jpg,image/*". */
    accept?: string;
    multiple?: boolean;
    /** Largest file in bytes; bigger files are refused and reported through `onReject`. */
    maxBytes?: number;
    onReject?: (message: string) => void;
    disabled?: boolean;
    className?: string;
    'aria-invalid'?: boolean;
    'aria-describedby'?: string;
};

/** Click-or-drop file chooser with the chosen files listed (and removable) below it. Uploading is up to the screen. */
export function FileInput({ id, value, onValueChange, accept, multiple, maxBytes, onReject, disabled, className, ...aria }: Props) {
    const generated = useId();
    const input = useRef<HTMLInputElement>(null);
    const [over, setOver] = useState(false);

    const take = (list: FileList | null) => {
        const files = [...(list ?? [])];
        const fits = files.filter((file) => maxBytes === undefined || file.size <= maxBytes);

        if (fits.length < files.length) {
            onReject?.(`Berkas melebihi batas ${size(maxBytes ?? 0)}.`);
        }

        onValueChange(multiple ? [...value, ...fits] : fits.slice(0, 1));

        if (input.current) {
            input.current.value = '';
        }
    };

    return (
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
                    'flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-line bg-surface px-3 py-3 text-sm text-muted transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 hover:border-primary/50',
                    over && 'border-primary bg-primary-soft',
                    disabled && 'cursor-not-allowed opacity-50',
                )}
            >
                <Upload className="size-4 shrink-0" />
                <span>
                    <span className="font-medium text-primary">Pilih berkas</span> atau seret ke sini
                </span>
                <input
                    ref={input}
                    id={id ?? generated}
                    type="file"
                    className="sr-only"
                    accept={accept}
                    multiple={multiple}
                    disabled={disabled}
                    onChange={(event) => take(event.target.files)}
                    {...aria}
                />
            </label>
            {value.length > 0 && (
                <ul className="flex flex-col gap-1">
                    {value.map((file, index) => (
                        <li
                            key={`${file.name}-${file.lastModified}-${index}`}
                            className="flex items-center gap-2 rounded-md border border-line px-2 py-1 text-xs"
                        >
                            <FileText className="size-3.5 shrink-0 text-muted" />
                            <span className="min-w-0 flex-1 truncate">{file.name}</span>
                            <span className="shrink-0 text-muted tabular-nums">{size(file.size)}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-5"
                                aria-label={`Hapus ${file.name}`}
                                onClick={() => onValueChange(value.filter((_, i) => i !== index))}
                            >
                                <X />
                            </Button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

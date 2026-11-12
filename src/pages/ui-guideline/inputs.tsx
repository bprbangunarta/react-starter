import { Copy, Dices } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CodeInput } from '@/components/ui/code-input';
import { Checkbox, RadioGroup, Switch } from '@/components/ui/choice';
import { ColorInput } from '@/components/ui/color-input';
import { Combobox } from '@/components/ui/combobox';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import type { DateSpan } from '@/components/ui/date-range-picker';
import { Slider } from '@/components/ui/slider';
import { TagInput } from '@/components/ui/tag-input';
import { TimePicker } from '@/components/ui/time-picker';
import { MultiCombobox } from '@/components/ui/multi-combobox';
import { CurrencyInput } from '@/components/ui/currency-input';
import { DatePicker } from '@/components/ui/date-picker';
import { Field } from '@/components/ui/field';
import { FileInput } from '@/components/ui/file-input';
import { FileUploader } from '@/components/ui/file-uploader';
import { CODE_CHARACTER, FilteredInput, NAME_CHARACTER } from '@/components/ui/filtered-input';
import { Input, InputGroup } from '@/components/ui/input';
import { MaskedInput } from '@/components/ui/masked-input';
import { PasswordInput } from '@/components/ui/password-input';
import { Textarea } from '@/components/ui/textarea';
import { Tip } from '@/components/ui/tooltip';
import { http } from '@/lib/http';
import { MASKS } from '@/lib/mask';
import { generatePassword } from '@/lib/password';
import { Section, SubTitle } from '@/pages/ui-guideline/parts';

/** Every kind of input the app uses, each with its own state. Money, phone, and other formatted fields send the raw value to the API. */
export function InputExamples() {
    const [select, setSelect] = useState<string | null>('b');
    const [multi, setMulti] = useState<string[]>(['a', 'c']);
    const [date, setDate] = useState('');
    const [period, setPeriod] = useState<DateSpan>({ from: '', to: '' });
    const [time, setTime] = useState('');
    const [tags, setTags] = useState<string[]>(['laporan', 'bulanan']);
    const [level, setLevel] = useState([40]);
    const [band, setBand] = useState([20, 70]);
    const [code, setCode] = useState('');
    const [amount, setAmount] = useState<number | null>(1_500_000);
    const [quantity, setQuantity] = useState<number | null>(12_500);
    const [small, setSmall] = useState('42');
    const [person, setPerson] = useState('');
    const [codeText, setCodeText] = useState('');
    const [secret, setSecret] = useState('');
    const [phone, setPhone] = useState('081234567890');
    const [nik, setNik] = useState('');
    const [npwp, setNpwp] = useState('');
    const [color, setColor] = useState('');
    const [note, setNote] = useState('');
    const [agree, setAgree] = useState(true);
    const [notify, setNotify] = useState(true);
    const [channel, setChannel] = useState('email');
    const [files, setFiles] = useState<File[]>([]);

    return (
        <Section
            title="Isian"
            description="Field: label text-xs, tanda * merah untuk wajib, hanya galat yang tampil di bawah isian. Keterangan isian (hint) tampil sebagai tooltip pada ikon info di samping label, dan tetap terbaca oleh pembaca layar."
        >
            <SubTitle>Teks dan sandi</SubTitle>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Teks" required hint="Contoh hint">
                    <Input maxLength={100} placeholder="Ketik sesuatu" />
                </Field>
                <Field label="Dengan galat" error="Kolom ini wajib diisi.">
                    <Input />
                </Field>
                <Field label="Kata sandi">
                    <PasswordInput placeholder="********" />
                </Field>
                <Field label="Kode verifikasi">
                    <CodeInput value={code} onValueChange={setCode} placeholder="••••••" />
                </Field>
            </div>

            <SubTitle>Angka dan mata uang (format otomatis)</SubTitle>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Nominal (Rp)" hint="Nilai yang dikirim ke API berupa angka tanpa format">
                    <CurrencyInput value={amount} onValueChange={setAmount} placeholder="0" />
                </Field>
                <Field label="Angka dengan pemisah ribuan" hint="Angka bulat dengan pemisah ribuan">
                    <CurrencyInput prefix={null} value={quantity} onValueChange={setQuantity} placeholder="0" />
                </Field>
                <Field label="Angka kecil (4 digit)" hint="Angka tanpa format memakai MaskedInput, bukan input angka bawaan peramban">
                    <MaskedInput mask="9999" value={small} onValueChange={setSmall} placeholder="0000" className="text-right tabular-nums" />
                </Field>
            </div>
            <p className="text-xs text-muted tabular-nums">
                Dikirim ke API: nominal = {amount ?? 'kosong'}, angka = {quantity ?? 'kosong'}, angka kecil = {small || 'kosong'}
            </p>

            <SubTitle>Masking (format saat mengetik)</SubTitle>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="No. telepon" hint="Mask 0812-3456-7890; yang dikirim hanya angkanya">
                    <MaskedInput mask={MASKS.phone} value={phone} onValueChange={setPhone} placeholder="0812-3456-7890" />
                </Field>
                <Field label="NIK (16 digit)" hint="16 digit">
                    <MaskedInput mask={MASKS.nik} value={nik} onValueChange={setNik} placeholder="3171 0123 4567 8901" />
                </Field>
                <Field label="NPWP (15 digit)" hint="15 digit">
                    <MaskedInput mask={MASKS.npwp} value={npwp} onValueChange={setNpwp} placeholder="01.234.567.8-901.234" />
                </Field>
            </div>
            <p className="text-xs text-muted tabular-nums">
                Dikirim ke API: telepon = {phone || 'kosong'}, NIK = {nik || 'kosong'} ({nik.length}/16), NPWP = {npwp || 'kosong'} ({npwp.length}/15)
            </p>

            <SubTitle>Karakter dibatasi dan tombol di samping isian</SubTitle>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Nama (hanya huruf)" hint="Karakter lain tidak pernah masuk, diketik maupun ditempel">
                    <FilteredInput allowed={NAME_CHARACTER} maxLength={60} value={person} onValueChange={setPerson} placeholder="Rina Wulandari" />
                </Field>
                <Field label="Kode (huruf, angka, strip)" hint="Aturan yang sama dengan server, diperiksa lagi di sana">
                    <FilteredInput allowed={CODE_CHARACTER} maxLength={10} value={codeText} onValueChange={setCodeText} placeholder="KC-01" />
                </Field>
                <Field label="Kata sandi acak" className="sm:col-span-2" hint="Tombol di samping isian memakai size=fieldIcon: setinggi isian">
                    <InputGroup>
                        <Input
                            maxLength={64}
                            value={secret}
                            autoComplete="off"
                            spellCheck={false}
                            className="font-mono"
                            placeholder="Ketik atau buat acak"
                            onChange={(e) => setSecret(e.target.value)}
                        />
                        <Tip label="Buat kata sandi acak">
                            <Button
                                type="button"
                                variant="outline"
                                size="fieldIcon"
                                aria-label="Buat kata sandi acak"
                                onClick={() => setSecret(generatePassword())}
                            >
                                <Dices />
                            </Button>
                        </Tip>
                        <Tip label="Salin kata sandi">
                            <Button
                                type="button"
                                variant="outline"
                                size="fieldIcon"
                                aria-label="Salin kata sandi"
                                disabled={secret === ''}
                                onClick={() => {
                                    void navigator.clipboard.writeText(secret);
                                    toast.success('Kata sandi disalin.');
                                }}
                            >
                                <Copy />
                            </Button>
                        </Tip>
                    </InputGroup>
                </Field>
            </div>

            <SubTitle>Pilihan dan tanggal</SubTitle>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Pilihan (Combobox)">
                    <Combobox
                        options={[
                            { value: 'a', label: 'Opsi A' },
                            { value: 'b', label: 'Opsi B', description: 'Pembeda pilihan yang mirip' },
                            { value: 'c', label: 'Opsi C' },
                        ]}
                        value={select}
                        onChange={setSelect}
                        clearable
                    />
                </Field>
                <Field label="Pilihan ganda (MultiCombobox)">
                    <MultiCombobox
                        options={[
                            { value: 'a', label: 'Opsi A' },
                            { value: 'b', label: 'Opsi B', description: 'Pembeda pilihan yang mirip' },
                            { value: 'c', label: 'Opsi C' },
                            { value: 'd', label: 'Opsi D' },
                        ]}
                        value={multi}
                        onChange={setMulti}
                        clearable
                    />
                </Field>
                <Field label="Tanggal">
                    <DatePicker value={date} onChange={setDate} placeholder="Pilih tanggal" />
                </Field>
                <Field label="Warna" hint="Pemilih warna, kode hex, dan warna siap pakai" className="sm:col-span-2">
                    <ColorInput value={color} onValueChange={setColor} />
                </Field>
            </div>

            <SubTitle>Rentang tanggal, jam, tag, dan slider</SubTitle>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Rentang tanggal (DateRangePicker)">
                    <DateRangePicker value={period} onChange={setPeriod} clearable />
                </Field>
                <Field label="Jam (TimePicker)">
                    <TimePicker value={time} onChange={setTime} />
                </Field>
                <Field label="Tag (TagInput)" hint="Enter atau koma menambah; Backspace menghapus yang terakhir" className="sm:col-span-2">
                    <TagInput value={tags} onChange={setTags} maxTags={6} />
                </Field>
                <Field label={`Slider: ${level[0] ?? 0}%`}>
                    <Slider aria-label="Tingkat" value={level} onValueChange={setLevel} />
                </Field>
                <Field label={`Slider rentang: ${band[0] ?? 0}–${band[1] ?? 0}`}>
                    <Slider labels={['Dari', 'Sampai']} value={band} onValueChange={setBand} />
                </Field>
            </div>

            <SubTitle>Teks panjang, centang, sakelar, dan radio</SubTitle>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Catatan" hint="Penghitung muncul di kanan label bila ada maxLength" className="sm:col-span-2">
                    <Textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} placeholder="Tulis catatan…" />
                </Field>
                <div className="flex flex-col gap-3">
                    <Checkbox
                        checked={agree}
                        onCheckedChange={(v) => setAgree(v === true)}
                        label="Saya setuju dengan ketentuan"
                        description="Pilihan yang menunggu tombol Simpan."
                    />
                    <Switch checked={notify} onCheckedChange={setNotify} label="Notifikasi email" description="Berlaku seketika." />
                </div>
                <Field label="Kirim kode lewat">
                    <RadioGroup
                        aria-label="Kirim kode lewat"
                        value={channel}
                        onValueChange={setChannel}
                        options={[
                            { value: 'email', label: 'Email' },
                            { value: 'sms', label: 'SMS', description: 'Tarif operator berlaku' },
                            { value: 'wa', label: 'WhatsApp', disabled: true },
                        ]}
                    />
                </Field>
            </div>

            <SubTitle>Berkas</SubTitle>
            <Field label="Lampiran" hint="PDF atau gambar, maksimal 2 MB" className="max-w-md">
                <FileInput value={files} onValueChange={setFiles} multiple accept=".pdf,image/*" maxBytes={2 * 1024 * 1024} onReject={(m) => toast.error(m)} />
            </Field>

            <SubTitle>Unggah banyak berkas (dropzone, antrean, progres)</SubTitle>
            <Field
                label="Dokumen"
                hint="Berkas langsung diunggah, dua sekaligus; yang lain menunggu giliran. Nama berkas yang memuat kata gagal sengaja ditolak untuk mencoba tombol coba lagi."
                className="max-w-xl"
            >
                <FileUploader
                    accept=".pdf,image/*"
                    description="PDF atau gambar · maksimal 5 MB per berkas · sampai 8 berkas"
                    maxBytes={5 * 1024 * 1024}
                    maxFiles={8}
                    upload={(file, context) =>
                        file.name.toLowerCase().includes('gagal')
                            ? new Promise((_, reject) => window.setTimeout(() => reject(new Error('Server menolak berkas ini (contoh galat).')), 900))
                            : http.upload('/files', file, context)
                    }
                    onUploaded={(file) => toast.success(`${file.name} terunggah`)}
                    onReject={(m) => toast.error(m)}
                />
            </Field>
        </Section>
    );
}

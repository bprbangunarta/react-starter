import { Field } from '@/components/ui/field';
import { PasswordInput } from '@/components/ui/password-input';
import type { useForm } from '@/lib/form';

export type PasswordData = { current_password: string; password: string; password_confirmation: string };
export const EMPTY_PASSWORD: PasswordData = { current_password: '', password: '', password_confirmation: '' };

/**
 * The three password fields (current, new, confirmation) shared by Profile and the expired-password screen. The server rules
 * (minimum length, not the same as the previous passwords) come back as 422 messages under the matching field.
 */
export function PasswordFields({ form }: { form: ReturnType<typeof useForm<PasswordData>> }) {
    return (
        <>
            <Field label="Kata sandi saat ini" required error={form.errors.current_password}>
                <PasswordInput autoComplete="current-password" value={form.data.current_password} onChange={(e) => form.setData('current_password', e.target.value)} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Kata sandi baru" required error={form.errors.password} hint="Minimal 8 karakter, tidak boleh sama dengan kata sandi sebelumnya">
                    <PasswordInput autoComplete="new-password" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} />
                </Field>
                <Field label="Konfirmasi kata sandi baru" required error={form.errors.password_confirmation}>
                    <PasswordInput autoComplete="new-password" value={form.data.password_confirmation} onChange={(e) => form.setData('password_confirmation', e.target.value)} />
                </Field>
            </div>
        </>
    );
}

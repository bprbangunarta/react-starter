import { act, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IdleTimeout } from '@/components/idle-timeout';

const refresh = vi.fn();
const signOut = vi.fn();

vi.mock('@/auth/session', () => ({
    useSession: () => ({ me: { session: { idle_minutes: 10 } }, refresh, signOut }),
}));

const MINUTE = 60_000;

function renderTimeout() {
    return render(
        <MemoryRouter initialEntries={['/halaman']}>
            <Routes>
                <Route path="/halaman" element={<IdleTimeout />} />
                <Route path="/login" element={<p>Halaman masuk</p>} />
            </Routes>
        </MemoryRouter>,
    );
}

describe('IdleTimeout', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        refresh.mockReset().mockResolvedValue({ session: { idle_minutes: 10 } });
        signOut.mockReset().mockResolvedValue(undefined);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('stays quiet while the person has been idle for less than nine minutes', () => {
        renderTimeout();

        act(() => void vi.advanceTimersByTime(8 * MINUTE));

        expect(screen.queryByText('Sesi akan berakhir')).not.toBeInTheDocument();
    });

    it('warns one minute before the end and counts the seconds', () => {
        renderTimeout();

        act(() => void vi.advanceTimersByTime(9 * MINUTE + 1000));

        expect(screen.getByText('Sesi akan berakhir')).toBeInTheDocument();
        expect(screen.getByText(/59 detik/)).toBeInTheDocument();
    });

    it('signs out and goes to the sign-in page when the time is up', async () => {
        renderTimeout();

        await act(async () => {
            vi.advanceTimersByTime(10 * MINUTE + 1000);
            await Promise.resolve();
        });

        expect(signOut).toHaveBeenCalledTimes(1);
        expect(screen.getByText('Halaman masuk')).toBeInTheDocument();
    });

    it('lets the person stay signed in from the warning', async () => {
        renderTimeout();
        act(() => void vi.advanceTimersByTime(9 * MINUTE + 1000));

        await act(async () => {
            screen.getByRole('button', { name: 'Tetap masuk' }).click();
            await Promise.resolve();
        });

        expect(refresh).toHaveBeenCalledTimes(1);
        expect(screen.queryByText('Sesi akan berakhir')).not.toBeInTheDocument();

        act(() => void vi.advanceTimersByTime(8 * MINUTE));

        expect(screen.queryByText('Sesi akan berakhir')).not.toBeInTheDocument();
    });

    it('treats activity as a fresh start and tells the server now and then', () => {
        renderTimeout();

        act(() => void vi.advanceTimersByTime(8 * MINUTE));
        act(() => void window.dispatchEvent(new Event('keydown')));
        act(() => void vi.advanceTimersByTime(8 * MINUTE));

        expect(screen.queryByText('Sesi akan berakhir')).not.toBeInTheDocument();
        expect(refresh).toHaveBeenCalled();
    });

    it('does not contact the server when nobody is working', () => {
        renderTimeout();

        act(() => void vi.advanceTimersByTime(8 * MINUTE));

        expect(refresh).not.toHaveBeenCalled();
    });
});

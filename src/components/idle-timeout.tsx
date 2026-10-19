import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useSession } from '@/auth/session';
import { Button } from '@/components/ui/button';
import { DialogBody, DialogFooter, Modal } from '@/components/ui/dialog';

/** The warning shows this long before the session ends. */
const WARNING_MS = 60_000;
const ACTIVITY_EVENTS = ['pointermove', 'pointerdown', 'keydown', 'scroll', 'touchstart'] as const;

/**
 * Ends the session after the idle time the server allows (`session.idle_minutes` in `/me`). The server enforces the limit; this only
 * keeps it honest and kind: while the person works, a quiet request now and then keeps the server's clock running, one minute before
 * the end a dialog offers to stay signed in, and at the end the person is signed out and taken to the sign-in page.
 */
export function IdleTimeout() {
    const { me, refresh, signOut } = useSession();
    const navigate = useNavigate();
    const idleMs = (me?.session.idle_minutes ?? 0) * 60_000;
    // The clock starts when the component mounts (a lazy initial state keeps `Date.now()` out of the render itself).
    const [mountedAt] = useState(() => Date.now());
    const lastActivity = useRef(mountedAt);
    const lastPing = useRef(mountedAt);
    const warning = useRef(false);
    const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

    const leave = useCallback(async () => {
        try {
            await signOut();
        } catch {
            // The server may have ended the session already; the sign-in page is the right place either way.
        }

        toast.info('Sesi berakhir karena tidak ada aktivitas. Silakan masuk lagi.');
        void navigate('/login', { replace: true });
    }, [navigate, signOut]);

    const stay = useCallback(async () => {
        const result = await refresh();

        if (result === null) {
            await leave();

            return;
        }

        lastActivity.current = Date.now();
        lastPing.current = Date.now();
        warning.current = false;
        setSecondsLeft(null);
    }, [leave, refresh]);

    useEffect(() => {
        if (idleMs <= 0) {
            return;
        }

        // While the warning is open only its buttons count: moving the mouse must not hide it.
        const markActive = () => {
            if (!warning.current) {
                lastActivity.current = Date.now();
            }
        };

        for (const name of ACTIVITY_EVENTS) {
            window.addEventListener(name, markActive, { passive: true });
        }

        const tick = setInterval(() => {
            const now = Date.now();
            const left = idleMs - (now - lastActivity.current);

            if (left <= 0) {
                clearInterval(tick);
                void leave();

                return;
            }

            warning.current = left <= WARNING_MS;
            setSecondsLeft(warning.current ? Math.ceil(left / 1000) : null);

            // The person is working: tell the server now and then (a third of the limit) so its idle clock does not run out.
            if (!warning.current && lastActivity.current > lastPing.current && now - lastPing.current >= idleMs / 3) {
                lastPing.current = now;
                void refresh();
            }
        }, 1000);

        return () => {
            clearInterval(tick);

            for (const name of ACTIVITY_EVENTS) {
                window.removeEventListener(name, markActive);
            }
        };
    }, [idleMs, leave, refresh]);

    return (
        <Modal open={secondsLeft !== null} onOpenChange={() => undefined} title="Sesi akan berakhir" description="Tidak ada aktivitas." persistent>
            <DialogBody>
                <p className="text-sm">
                    Demi keamanan, Anda akan keluar otomatis dalam <strong>{secondsLeft ?? 0} detik</strong>. Pilih &ldquo;Tetap masuk&rdquo; untuk melanjutkan.
                </p>
            </DialogBody>
            <DialogFooter>
                <Button variant="outline" onClick={() => void leave()}>
                    Keluar
                </Button>
                <Button onClick={() => void stay()}>Tetap masuk</Button>
            </DialogFooter>
        </Modal>
    );
}

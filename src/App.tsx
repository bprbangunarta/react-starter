import { lazy } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router';
import { SessionProvider, useSession } from '@/auth/session';
import AppLayout from '@/layouts/app-layout';
import Login from '@/pages/login';
import ErrorPreview from '@/pages/error-preview';
import NotFound from '@/pages/not-found';
import PasswordExpired from '@/pages/password-expired';
import TwoFactorChallenge from '@/pages/two-factor-challenge';

// Signed-in pages load on demand, so the sign-in screens stay small and heavy ones (QR code, style guide, email preview) are split off.
const Dashboard = lazy(() => import('@/pages/dashboard'));
const AuditLogs = lazy(() => import('@/pages/audit-logs'));
const Profile = lazy(() => import('@/pages/profile'));
const UiGuideline = lazy(() => import('@/pages/ui-guideline'));

/** Signed-in pages only: anyone else is sent to the sign-in page. */
function RequireAuth() {
    const { me, loading } = useSession();

    if (loading) {
        return null;
    }

    return me ? <Outlet /> : <Navigate to="/login" replace />;
}

export default function App() {
    return (
        <BrowserRouter>
            <SessionProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/two-factor-challenge" element={<TwoFactorChallenge />} />
                    <Route path="/password-expired" element={<PasswordExpired />} />
                    <Route element={<RequireAuth />}>
                        <Route element={<AppLayout />}>
                            <Route index element={<Dashboard />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/audit-logs" element={<AuditLogs />} />
                            <Route path="/ui-guideline" element={<UiGuideline />} />
                        </Route>
                    </Route>
                    <Route path="/ui-guideline/errors/:status" element={<ErrorPreview />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </SessionProvider>
        </BrowserRouter>
    );
}

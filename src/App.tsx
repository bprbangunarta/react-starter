import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router';
import { SessionProvider, useSession } from '@/auth/session';
import AppLayout from '@/layouts/app-layout';
import AuditLogs from '@/pages/audit-logs';
import Dashboard from '@/pages/dashboard';
import Login from '@/pages/login';
import NotFound from '@/pages/not-found';
import PasswordExpired from '@/pages/password-expired';
import Profile from '@/pages/profile';
import Styleguide from '@/pages/styleguide';
import TwoFactorChallenge from '@/pages/two-factor-challenge';

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
                            <Route path="/styleguide" element={<Styleguide />} />
                            <Route path="*" element={<NotFound />} />
                        </Route>
                    </Route>
                </Routes>
            </SessionProvider>
        </BrowserRouter>
    );
}

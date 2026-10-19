import { ErrorPage } from '@/components/error-page';

/** An address nobody serves: a full-screen 404 outside the app shell (no sidebar, no header), with a way back. */
export default function NotFound() {
    return <ErrorPage status={404} back />;
}

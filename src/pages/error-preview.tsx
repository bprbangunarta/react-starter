import { useParams } from 'react-router';
import { ErrorPage } from '@/components/error-page';

/** `/ui-guideline/errors/503` and the like: an error screen as people see it, full screen, for the UI Guideline and for checking the wording. */
export default function ErrorPreview() {
    const { status } = useParams();

    return <ErrorPage status={Number(status)} back />;
}

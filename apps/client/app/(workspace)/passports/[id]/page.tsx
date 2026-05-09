import { WorkspaceHeader } from '@/features/workspace-header';
import { PassportDetail } from '@/features/passport-detail';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function PassportDetailPage({ params }: PageProps) {
    const { id } = await params;
    return (
        <>
            <WorkspaceHeader title="Détail passeport" description={id} />
            <PassportDetail passportId={id} />
        </>
    );
}

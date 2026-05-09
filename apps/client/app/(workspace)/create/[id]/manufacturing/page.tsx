import { WorkspaceHeader } from '@/features/workspace-header';
import { CreateStepManufacturing } from '@/features/create-step-manufacturing';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
    const { id } = await params;
    return (
        <>
            <WorkspaceHeader title="Création — Étapes" description="Étape 4 sur 6" />
            <CreateStepManufacturing draftId={id} />
        </>
    );
}

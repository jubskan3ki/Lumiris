import { WorkspaceHeader } from '@/features/workspace-header';
import { CreateStepIdentification } from '@/features/create-step-identification';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
    const { id } = await params;
    return (
        <>
            <WorkspaceHeader title="Création - Identification" description="Étape 1 sur 6" />
            <CreateStepIdentification draftId={id} />
        </>
    );
}

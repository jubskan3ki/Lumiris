import { WorkspaceHeader } from '@/features/workspace-header';
import { CreateStepComposition } from '@/features/create-step-composition';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
    const { id } = await params;
    return (
        <>
            <WorkspaceHeader title="Création - Composition" description="Étape 2 sur 6" />
            <CreateStepComposition draftId={id} />
        </>
    );
}

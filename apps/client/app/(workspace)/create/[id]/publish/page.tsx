import { WorkspaceHeader } from '@/features/workspace-header';
import { CreateStepPublish } from '@/features/create-step-publish';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
    const { id } = await params;
    return (
        <>
            <WorkspaceHeader title="Création - Publication" description="Étape 6 sur 6" />
            <CreateStepPublish draftId={id} />
        </>
    );
}

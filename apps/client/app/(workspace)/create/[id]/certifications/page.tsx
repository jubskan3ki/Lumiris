import { WorkspaceHeader } from '@/features/workspace-header';
import { CreateStepCertifications } from '@/features/create-step-certifications';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
    const { id } = await params;
    return (
        <>
            <WorkspaceHeader title="Création — Certifications" description="Étape 5 sur 6" />
            <CreateStepCertifications draftId={id} />
        </>
    );
}

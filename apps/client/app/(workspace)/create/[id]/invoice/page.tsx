import { WorkspaceHeader } from '@/features/workspace-header';
import { CreateStepInvoiceScan } from '@/features/create-step-invoice-scan';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
    const { id } = await params;
    return (
        <>
            <WorkspaceHeader title="Création - OCR facture" description="Étape 3 sur 6" />
            <CreateStepInvoiceScan draftId={id} />
        </>
    );
}

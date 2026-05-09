import { WorkspaceHeader } from '@/features/workspace-header';
import { CertificationsList } from '@/features/certifications-list';

export default function CertificationsPage() {
    return (
        <>
            <WorkspaceHeader title="Mes certifications" description="Portefeuille global de l'atelier." />
            <CertificationsList />
        </>
    );
}

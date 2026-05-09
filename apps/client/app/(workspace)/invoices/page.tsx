import { WorkspaceHeader } from '@/features/workspace-header';
import { InvoicesList } from '@/features/invoices-list';

export default function InvoicesPage() {
    return (
        <>
            <WorkspaceHeader
                title="Factures fournisseurs"
                description="Bibliothèque de vos factures, OCR à la demande."
            />
            <InvoicesList />
        </>
    );
}

'use client';

import { Info, ScanLine } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@lumiris/ui/components/alert';
import { WizardStepFrame } from '@/features/wizard-shell/step-frame';
import { useStepNavigation } from '@/features/wizard-shell/use-step-navigation';
import { InvoiceScanPickerBody } from '@/features/invoice-scan-picker';
import { mergeMaterials } from '@/features/invoice-scan-picker/merge';
import { useDraftStore } from '@/lib/draft-store';
import { useCurrentArtisan } from '@/lib/current-artisan';

export function CreateStepInvoiceScan({ draftId }: { draftId: string }) {
    const artisan = useCurrentArtisan();
    const draft = useDraftStore((s) => s.drafts[draftId]);
    const setMaterials = useDraftStore((s) => s.setMaterials);
    const { goNext, goTo } = useStepNavigation(draftId);

    return (
        <WizardStepFrame
            draftId={draftId}
            step="invoice"
            title={
                <span className="flex items-center gap-2">
                    <ScanLine className="text-lumiris-emerald h-4 w-4" /> Factures fournisseurs
                </span>
            }
            subtitle="Étape optionnelle — utile si une facture justifie une partie de la composition."
            onPrev={() => goTo('composition')}
            onNext={() => goNext('invoice', 'manufacturing')}
            nextLabel="Passer cette étape"
            contentClassName="space-y-4"
        >
            <Alert className="border-lumiris-amber/30 bg-lumiris-amber/5 text-lumiris-amber">
                <Info aria-hidden />
                <AlertTitle>Mode démo</AlertTitle>
                <AlertDescription className="text-foreground/80">
                    L’extraction de facture est simulée. En production, vous photographierez ou téléverserez vos vraies
                    factures fournisseurs et l’OCR (Mistral / Tesseract) tournera côté backend.
                </AlertDescription>
            </Alert>

            <InvoiceScanPickerBody
                artisanId={artisan.id}
                onInject={(extracted) => {
                    if (!draft) return;
                    const merged = mergeMaterials(draft.materials, extracted);
                    setMaterials(draftId, merged);
                    goTo('composition');
                }}
            />
        </WizardStepFrame>
    );
}

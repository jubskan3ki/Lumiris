'use client';

import { useEffect, useMemo } from 'react';
import { use } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { mockPassportById } from '@lumiris/mock-data';
import { useDraftStore, draftToPassport } from '@/lib/draft-store';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function PrintLabelPage({ params }: PageProps) {
    const { id } = use(params);
    const draft = useDraftStore((s) => s.drafts[id]);
    const fixed = useMemo(() => mockPassportById(id), [id]);
    const passport = draft ? draftToPassport(draft) : fixed;

    useEffect(() => {
        if (passport) {
            const t = window.setTimeout(() => window.print(), 250);
            return () => window.clearTimeout(t);
        }
        return undefined;
    }, [passport]);

    if (!passport) {
        return <p className="p-12 text-center font-mono text-sm">Passeport introuvable.</p>;
    }

    return (
        <div className="bg-white text-neutral-900">
            <div className="mx-auto flex min-h-screen w-[80mm] flex-col items-center justify-center gap-3 p-4 print:min-h-0">
                <p className="font-mono text-[10px] uppercase tracking-widest">LUMIRIS · Iris</p>
                <p className="text-center text-sm font-semibold">{passport.garment.reference}</p>
                <div className="rounded-md border border-neutral-300 bg-white p-2">
                    <QRCodeCanvas value={passport.gs1.verificationUrl} size={180} includeMargin level="M" />
                </div>
                <p className="break-all text-center font-mono text-[8px]">{passport.gs1.verificationUrl}</p>
                <p className="text-[10px] text-neutral-600">{passport.garment.kind}</p>
            </div>
        </div>
    );
}

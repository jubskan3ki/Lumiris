'use client';

import { notFound } from 'next/navigation';
import { use, useMemo } from 'react';
import { mockArtisanById, mockPassportById } from '@lumiris/mock-data';
import { PassportPreview } from '@/features/passport-preview';
import { draftToPassport, useDraftStore } from '@/lib/draft-store';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function PassportPreviewPage({ params }: PageProps) {
    const { id } = use(params);
    const draft = useDraftStore((s) => s.drafts[id]);
    const fixed = useMemo(() => mockPassportById(id), [id]);
    const passport = draft ? draftToPassport(draft) : (fixed ?? null);

    if (!passport) {
        notFound();
    }

    const artisan = mockArtisanById(passport.artisanId);
    if (!artisan) {
        notFound();
    }

    return <PassportPreview passport={passport} artisan={artisan} />;
}

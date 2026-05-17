'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useDraftStore } from '@/lib/draft-store';
import { useCurrentArtisan } from '@/lib/current-artisan';

export default function CreateEntryPage() {
    const router = useRouter();
    const artisan = useCurrentArtisan();
    const createDraft = useDraftStore((s) => s.createDraft);

    useEffect(() => {
        const id = createDraft(artisan.id);
        router.replace(`/create/${id}/identification`);
    }, [artisan.id, createDraft, router]);

    return (
        <div className="text-muted-foreground flex items-center gap-2 p-12 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" /> Création d’un nouveau brouillon…
        </div>
    );
}

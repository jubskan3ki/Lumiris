import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { Button } from '@lumiris/ui/components/button';
import { WorkspaceHeader } from '@/features/workspace-header';
import { PassportsList } from '@/features/passports-list';

export default function PassportsPage() {
    return (
        <>
            <WorkspaceHeader
                title="Mes passeports"
                description="Tous les passeports actifs de votre atelier - brouillons inclus."
                actions={
                    <Button asChild className="bg-lumiris-emerald hover:bg-lumiris-emerald/90 text-white">
                        <Link href="/create">
                            <PlusCircle className="mr-1.5 h-4 w-4" /> Nouveau passeport
                        </Link>
                    </Button>
                }
            />
            <PassportsList />
        </>
    );
}

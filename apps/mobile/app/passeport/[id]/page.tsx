import { notFound } from 'next/navigation';
import { mockPassports, mockPassportById } from '@lumiris/mock-data';
import { PassportDetail } from '@/features/passport-detail';

// `output: 'export'` (Tauri) exige que les paramètres dynamiques soient pré-générés.
export const dynamicParams = false;

export function generateStaticParams() {
    return mockPassports.map((p) => ({ id: p.id }));
}

interface RouteProps {
    params: Promise<{ id: string }>;
}

export default async function PassportRoute({ params }: RouteProps) {
    const { id } = await params;
    const passport = mockPassportById(id);
    if (!passport) notFound();
    return (
        <div className="bg-background mx-auto flex h-dvh max-w-md flex-col">
            <PassportDetail passport={passport} />
        </div>
    );
}

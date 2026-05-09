import { notFound } from 'next/navigation';
import { mockRepairers, mockRepairerById } from '@lumiris/mock-data';
import { RepairRequestForm } from '@/features/repair-request';

export const dynamicParams = false;

export function generateStaticParams() {
    return mockRepairers.map((r) => ({ slug: r.id }));
}

interface RouteProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function RepairRequestRoute({ params, searchParams }: RouteProps) {
    const { slug } = await params;
    const search = await searchParams;
    const repairer = mockRepairerById(slug);
    if (!repairer) notFound();
    const forParam = search['for'];
    const prefillPassportId = typeof forParam === 'string' ? forParam : null;
    return (
        <div className="bg-background mx-auto flex h-dvh max-w-md flex-col">
            <RepairRequestForm repairer={repairer} prefillPassportId={prefillPassportId} />
        </div>
    );
}

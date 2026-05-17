import { mockExternalDpps, mockExternalDppByGtin } from '@lumiris/mock-data';
import { ExternalDppDetail } from '@/features/external-dpp-detail';
import { ExternalDppNotFound } from '@/features/external-dpp-detail/external-dpp-not-found';

export const dynamicParams = true;

export function generateStaticParams() {
    return mockExternalDpps.map((dpp) => ({ gtin: dpp.gtin }));
}

interface RouteProps {
    params: Promise<{ gtin: string }>;
}

export default async function ExternalDppRoute({ params }: RouteProps) {
    const { gtin } = await params;
    const dpp = mockExternalDppByGtin(gtin);

    if (!dpp) {
        return <ExternalDppNotFound gtin={gtin} />;
    }

    return (
        <div className="bg-background mx-auto flex h-dvh max-w-md flex-col">
            <ExternalDppDetail dpp={dpp} />
        </div>
    );
}

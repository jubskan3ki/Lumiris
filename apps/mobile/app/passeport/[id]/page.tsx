import { mockPassports, mockPassportById } from '@lumiris/mock-data';
import { PassportDetail } from '@/features/passport-detail';
import { PassportNotFound } from '@/features/passport-detail/passport-not-found';

export const dynamicParams = true;

export function generateStaticParams() {
    return mockPassports.map((p) => ({ id: p.id }));
}

interface RouteProps {
    params: Promise<{ id: string }>;
}

export default async function PassportRoute({ params }: RouteProps) {
    const { id } = await params;
    const passport = mockPassportById(id);

    if (!passport) {
        return <PassportNotFound passportId={id} />;
    }

    return (
        <div className="bg-background mx-auto flex h-dvh max-w-md flex-col">
            <PassportDetail passport={passport} />
        </div>
    );
}

import { ImageResponse } from 'next/og';
import { mockPassportsPublic, passportPublicByIdOrSlug } from '@lumiris/mock-data';

export const alt = 'Passeport LUMIRIS';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const KIND_LABEL: Record<string, string> = {
    sweater: 'Pull',
    shirt: 'Chemise',
    shoe: 'Chaussures',
    jacket: 'Veste',
    trouser: 'Pantalon',
    accessory: 'Accessoire',
    other: 'Pièce',
};

export function generateStaticParams() {
    return mockPassportsPublic.map((view) => ({ id: view.passport.id }));
}

interface OgProps {
    params: Promise<{ id: string }>;
}

export default async function Image({ params }: OgProps) {
    const { id } = await params;
    const view = passportPublicByIdOrSlug(id);
    const kind = view ? (KIND_LABEL[view.passport.garment.kind] ?? KIND_LABEL.other) : 'Pièce';
    const title = view ? `${kind} ${view.passport.garment.reference}` : 'Passeport LUMIRIS';
    const sub = view ? `${view.artisan.atelierName} · ${view.artisan.city}` : '';
    const grade = view?.irisScore?.grade ?? null;

    return new ImageResponse(
        <div
            style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #fafafa 0%, #f1f5f9 100%)',
                color: '#0f172a',
                display: 'flex',
                flexDirection: 'column',
                padding: 80,
                fontFamily: 'sans-serif',
                justifyContent: 'space-between',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: 'linear-gradient(135deg,#10b981,#06b6d4,#f59e0b)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 18,
                        color: '#0b1014',
                    }}
                >
                    L
                </div>
                <div style={{ display: 'flex', fontSize: 20, letterSpacing: 4, color: '#475569' }}>
                    LUMIRIS · PASSEPORT
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 48 }}>
                <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 800 }}>
                    <div
                        style={{
                            display: 'flex',
                            fontSize: 64,
                            fontWeight: 700,
                            lineHeight: 1.05,
                            color: '#0f172a',
                        }}
                    >
                        {title}
                    </div>
                    <div style={{ display: 'flex', fontSize: 28, color: '#64748b', marginTop: 16 }}>{sub}</div>
                </div>
                {grade ? (
                    <div
                        style={{
                            width: 200,
                            height: 200,
                            borderRadius: 28,
                            background: '#10b981',
                            color: '#fff',
                            fontWeight: 800,
                            fontSize: 140,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {grade}
                    </div>
                ) : null}
            </div>

            <div style={{ display: 'flex', fontSize: 20, color: '#94a3b8' }}>lumiris.fr/passeport</div>
        </div>,
        size,
    );
}

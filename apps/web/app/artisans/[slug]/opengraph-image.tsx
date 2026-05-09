import { ImageResponse } from 'next/og';
import { getAllArtisans, getArtisanBySlug } from '@/lib/artisans';

export const alt = 'Artisan LUMIRIS';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
    return getAllArtisans().map((a) => ({ slug: a.slug }));
}

interface OgProps {
    params: Promise<{ slug: string }>;
}

export default async function Image({ params }: OgProps) {
    const { slug } = await params;
    const artisan = getArtisanBySlug(slug);
    const title = artisan?.atelierName ?? 'Atelier LUMIRIS';
    const sub = artisan ? `${artisan.displayName} · ${artisan.city}, ${artisan.region}` : '';
    const tier = artisan?.tier ?? '';

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
                    LUMIRIS · ARTISAN {tier ? `· ${tier.toUpperCase()}` : ''}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 1040 }}>
                <div
                    style={{
                        display: 'flex',
                        fontSize: 72,
                        fontWeight: 700,
                        lineHeight: 1.05,
                        color: '#0f172a',
                    }}
                >
                    {title}
                </div>
                <div style={{ display: 'flex', fontSize: 30, color: '#64748b', marginTop: 24 }}>{sub}</div>
            </div>

            <div style={{ display: 'flex', fontSize: 22, color: '#94a3b8' }}>lumiris.fr/artisans</div>
        </div>,
        size,
    );
}

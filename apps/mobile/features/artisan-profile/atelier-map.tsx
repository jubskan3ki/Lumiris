'use client';

import dynamic from 'next/dynamic';
import { CITY_COORDS } from '@lumiris/mock-data';

const Map = dynamic(() => import('./atelier-map.client').then((m) => m.AtelierMapClient), {
    ssr: false,
    loading: () => (
        <div
            className="border-border bg-card text-muted-foreground flex items-center justify-center rounded-2xl border text-[11px] italic"
            style={{ height: 180 }}
        >
            Chargement de la carte…
        </div>
    ),
});

interface AtelierMapProps {
    city: string;
    atelierName: string;
}

export function AtelierMap({ city, atelierName }: AtelierMapProps) {
    const coords = CITY_COORDS[city];
    if (!coords) return null;
    return <Map lat={coords.lat} lng={coords.lng} atelierName={atelierName} />;
}

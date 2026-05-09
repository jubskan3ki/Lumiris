'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CITY_COORDS } from '@lumiris/mock-data';
import type { Material, ProductionStep } from '@lumiris/types';

const lumiris_icon = L.divIcon({
    className: 'lumiris-map-pin',
    html: '<span class="block h-3 w-3 rounded-full bg-lumiris-cyan ring-4 ring-lumiris-cyan/30 shadow-lg" aria-hidden="true"></span>',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
});

const lumiris_icon_artisan = L.divIcon({
    className: 'lumiris-map-pin-emerald',
    html: '<span class="block h-4 w-4 rounded-full bg-lumiris-emerald ring-4 ring-lumiris-emerald/30 shadow-lg" aria-hidden="true"></span>',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
});

interface MapPoint {
    id: string;
    label: string;
    sublabel: string;
    lat: number;
    lng: number;
    order: number;
}

interface OriginMapProps {
    materials: readonly Material[];
    steps: readonly ProductionStep[];
}

export function OriginMap({ materials, steps }: OriginMapProps) {
    void materials;

    const points: MapPoint[] = useMemo(() => {
        const buf: MapPoint[] = [];
        steps.forEach((step, idx) => {
            const coords = CITY_COORDS[step.locationCity];
            if (!coords) return;
            buf.push({
                id: step.id,
                label: step.label,
                sublabel: `${step.performedBy} · ${step.locationCity}`,
                lat: coords.lat,
                lng: coords.lng,
                order: idx + 1,
            });
        });
        return buf;
    }, [steps]);

    const center: [number, number] = useMemo(() => {
        if (points.length === 0) return [46.5, 2.5];
        const avg = points.reduce((acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }), { lat: 0, lng: 0 });
        return [avg.lat / points.length, avg.lng / points.length];
    }, [points]);

    const path: Array<[number, number]> = useMemo(() => points.map((p) => [p.lat, p.lng]), [points]);

    if (points.length === 0) {
        return (
            <div className="border-border bg-card text-muted-foreground flex h-48 items-center justify-center rounded-2xl border text-xs italic">
                Aucune localisation renseignée pour cette pièce.
            </div>
        );
    }

    return (
        <div className="border-border relative h-72 w-full overflow-hidden rounded-2xl border">
            <MapContainer
                center={center}
                zoom={5}
                scrollWheelZoom={false}
                className="h-full w-full"
                attributionControl={false}
            >
                <TileLayer
                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap"
                    maxZoom={19}
                />
                <FitBounds points={points} />
                <Polyline
                    positions={path}
                    pathOptions={{ color: '#06b6d4', weight: 2, dashArray: '4 6', opacity: 0.8 }}
                />
                {points.map((p) => (
                    <Marker
                        key={p.id}
                        position={[p.lat, p.lng]}
                        icon={p.order === 1 || p.order === points.length ? lumiris_icon_artisan : lumiris_icon}
                    >
                        <Popup>
                            <div className="font-sans">
                                <p className="text-xs font-semibold">
                                    {p.order}. {p.label}
                                </p>
                                <p className="text-[11px] opacity-70">{p.sublabel}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}

function FitBounds({ points }: { points: readonly MapPoint[] }) {
    const map = useMap();
    useEffect(() => {
        if (points.length < 2) return;
        const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
        map.fitBounds(bounds, { padding: [24, 24] });
    }, [map, points]);
    return null;
}

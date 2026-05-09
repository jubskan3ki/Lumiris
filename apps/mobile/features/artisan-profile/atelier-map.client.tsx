'use client';

import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const atelierIcon = L.divIcon({
    className: 'lumiris-atelier-pin',
    html: '<span class="block h-3.5 w-3.5 rounded-full bg-lumiris-cyan ring-4 ring-lumiris-cyan/30 shadow-lg" aria-hidden="true"></span>',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
});

interface AtelierMapClientProps {
    lat: number;
    lng: number;
    atelierName: string;
}

export function AtelierMapClient({ lat, lng, atelierName }: AtelierMapClientProps) {
    return (
        <div className="border-border relative overflow-hidden rounded-2xl border" style={{ height: 180 }}>
            <MapContainer
                center={[lat, lng]}
                zoom={12}
                scrollWheelZoom={false}
                attributionControl={false}
                className="h-full w-full"
            >
                <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} />
                <Marker position={[lat, lng]} icon={atelierIcon}>
                    <Popup>
                        <span className="font-sans text-xs font-semibold">{atelierName}</span>
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}

'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const lumiris_icon = L.divIcon({
    className: 'lumiris-map-pin-emerald',
    html: '<span class="block h-4 w-4 rounded-full bg-lumiris-emerald ring-4 ring-lumiris-emerald/30 shadow-lg" aria-hidden="true"></span>',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
});

interface AtelierMapProps {
    lat: number;
    lng: number;
    label: string;
    sublabel?: string;
}

export function AtelierMap({ lat, lng, label, sublabel }: AtelierMapProps) {
    return (
        <div className="border-border relative h-72 w-full overflow-hidden rounded-2xl border">
            <MapContainer
                center={[lat, lng]}
                zoom={11}
                scrollWheelZoom={false}
                className="h-full w-full"
                attributionControl={false}
            >
                <TileLayer
                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap"
                    maxZoom={19}
                />
                <Marker position={[lat, lng]} icon={lumiris_icon}>
                    <Popup>
                        <div className="font-sans">
                            <p className="text-xs font-semibold">{label}</p>
                            {sublabel ? <p className="text-[11px] opacity-70">{sublabel}</p> : null}
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}

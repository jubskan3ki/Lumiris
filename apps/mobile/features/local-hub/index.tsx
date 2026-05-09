'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MapPin } from 'lucide-react';
import type { ArtisanWithSlug } from '@lumiris/mock-data';
import type { Repairer } from '@lumiris/types';
import { useUserCoords } from '@/lib/geolocation/use-user-coords';
import { hasSeenGeolocPrompt, markGeolocPromptSeen } from '@/lib/geolocation/permission-storage';
import { useOnlineStatus } from '@/lib/network/use-online-status';
import { toast } from '@/lib/toast';
import { toLocalPoints } from './adapter';
import { ListView } from './list-view';
import { MapView } from './map-view';
import { MiniPointCard } from './mini-point-card';
import { PermissionPrompt } from './permission-prompt';
import { ViewToggle, type LocalView } from './view-toggle';

export interface LocalHubProps {
    artisans: readonly ArtisanWithSlug[];
    repairers: readonly Repairer[];
}

export function LocalHub({ artisans, repairers }: LocalHubProps) {
    const online = useOnlineStatus();
    const { coords, status, request } = useUserCoords();

    const [view, setView] = useState<LocalView>('list');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showGeolocPrompt, setShowGeolocPrompt] = useState(false);

    const points = useMemo(
        () => toLocalPoints(artisans, repairers, { userCoords: coords ?? undefined }),
        [artisans, repairers, coords],
    );

    useEffect(() => {
        if (view === 'map' && !online) {
            setView('list');
            setSelectedId(null);
            toast.info('Carte indisponible hors-ligne');
        }
    }, [online, view]);

    function handleViewChange(next: LocalView) {
        if (next === 'map' && !online) {
            toast.info('Carte indisponible hors-ligne');
            return;
        }
        setView(next);
        setSelectedId(null);
        if (next === 'map' && !hasSeenGeolocPrompt() && status !== 'granted') {
            setShowGeolocPrompt(true);
        }
    }

    function handleAcceptGeoloc() {
        markGeolocPromptSeen();
        setShowGeolocPrompt(false);
        request();
    }

    function handleDismissGeoloc() {
        markGeolocPromptSeen();
        setShowGeolocPrompt(false);
    }

    const selected = useMemo(() => {
        if (!selectedId) return null;
        return points.find((p) => `${p.kind}-${p.id}` === selectedId) ?? null;
    }, [points, selectedId]);

    const showDeniedBanner = view === 'map' && status === 'denied';

    return (
        <div className="bg-background relative flex h-full flex-col">
            <header className="flex shrink-0 items-start justify-between gap-3 px-5 pb-4 pt-12">
                <div className="min-w-0">
                    <h1 className="text-foreground text-xl font-bold">Local</h1>
                    <p className="text-muted-foreground text-sm">Ateliers et retoucheurs partenaires pres de toi</p>
                </div>
                <ViewToggle value={view} onChange={handleViewChange} />
            </header>

            {showDeniedBanner ? (
                <div className="border-border/40 bg-card/80 mx-5 mb-3 flex shrink-0 items-center justify-between gap-2 rounded-2xl border px-3 py-2 text-xs backdrop-blur-md">
                    <span className="text-muted-foreground inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" aria-hidden />
                        Position non partagee, tri par note.
                    </span>
                    <button
                        type="button"
                        onClick={() => setShowGeolocPrompt(true)}
                        className="text-foreground font-semibold underline-offset-2 hover:underline"
                    >
                        Reactiver
                    </button>
                </div>
            ) : null}

            <div className="relative min-h-0 flex-1">
                {view === 'list' ? (
                    <div className="absolute inset-0 overflow-y-auto">
                        <ListView points={points} />
                    </div>
                ) : (
                    <>
                        <MapView points={points} userCoords={coords} selectedId={selectedId} onSelect={setSelectedId} />
                        <AnimatePresence>
                            {selected ? (
                                <div key="mini-card" className="z-1000 pointer-events-none absolute inset-x-3 bottom-3">
                                    <div className="pointer-events-auto">
                                        <MiniPointCard point={selected} onClose={() => setSelectedId(null)} />
                                    </div>
                                </div>
                            ) : null}
                        </AnimatePresence>
                    </>
                )}
            </div>

            <AnimatePresence>
                {showGeolocPrompt ? (
                    <PermissionPrompt onAccept={handleAcceptGeoloc} onDismiss={handleDismissGeoloc} />
                ) : null}
            </AnimatePresence>
        </div>
    );
}

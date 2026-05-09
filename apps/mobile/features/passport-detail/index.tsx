'use client';

import { useMemo, useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, BookmarkPlus, Check, ArrowRight } from 'lucide-react';
import {
    PassportHeader,
    PassportStatusBanner,
    ScoreBreakdown,
    ArtisanCard,
    MaterialBreakdown,
    ProductionTimeline,
    CertificatesList,
    CareGuide,
    RepairersNearby,
} from '@lumiris/scoring-ui';
import { mockArtisanById, mockRepairersByCity, CITY_COORDS } from '@lumiris/mock-data';
import type { Passport, Repairer, Coordinates } from '@lumiris/types';
import { scorePassport } from '@/lib/passport-score';
import { useWardrobe, addToWardrobe, removeFromWardrobe } from '@/lib/wardrobe-storage';

// Carte uniquement côté client — Leaflet utilise window/document au moment du module load.
const OriginMap = dynamic(() => import('./origin-map').then((m) => m.OriginMap), {
    ssr: false,
    loading: () => (
        <div className="border-border/60 bg-card text-muted-foreground flex h-64 items-center justify-center rounded-2xl border text-xs italic">
            Chargement de la carte…
        </div>
    ),
});

export interface PassportDetailProps {
    passport: Passport;
}

export function PassportDetail({ passport }: PassportDetailProps) {
    const router = useRouter();
    const [now] = useState(() => new Date());
    const score = useMemo(() => scorePassport(passport, now), [passport, now]);
    const artisan = mockArtisanById(passport.artisanId);

    const allRepairers = useMemo<readonly Repairer[]>(
        () => (artisan ? mockRepairersByCity(artisan.city) : []),
        [artisan],
    );
    const previewRepairers = allRepairers.slice(0, 3);
    const userCoords: Coordinates | undefined = artisan ? CITY_COORDS[artisan.city] : undefined;

    const wardrobe = useWardrobe();
    const isSaved = wardrobe.some((entry) => entry.passportId === passport.id);

    const toggleWardrobe = useCallback(() => {
        if (isSaved) removeFromWardrobe(passport.id);
        else addToWardrobe(passport.id);
    }, [isSaved, passport.id]);

    // Toutes les certifications visibles : passeport + composition (uniques).
    const certificates = useMemo(() => {
        const seen = new Set<string>();
        const buf = [...passport.certifications];
        for (const cert of passport.certifications) seen.add(cert.id);
        for (const material of passport.materials) {
            for (const cert of material.certifications) {
                if (!seen.has(cert.id)) {
                    seen.add(cert.id);
                    buf.push(cert);
                }
            }
        }
        return buf;
    }, [passport]);

    return (
        <div className="bg-background flex h-full w-full flex-col overflow-y-auto pb-24">
            <motion.header
                className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 backdrop-blur-md"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <button
                    type="button"
                    onClick={() => router.back()}
                    aria-label="Retour"
                    className="border-border bg-card/90 text-foreground inline-flex h-9 w-9 items-center justify-center rounded-full border"
                >
                    <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={toggleWardrobe}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        isSaved
                            ? 'border-lumiris-emerald/40 bg-lumiris-emerald/10 text-lumiris-emerald'
                            : 'border-border bg-card text-foreground'
                    }`}
                    aria-pressed={isSaved}
                >
                    {isSaved ? <Check className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
                    {isSaved ? 'Dans la Garde-Robe' : 'Ajouter à la Garde-Robe'}
                </button>
            </motion.header>

            <div className="flex flex-col gap-5 px-4">
                <PassportHeader passport={passport} artisan={artisan} grade={score.grade} />

                <PassportStatusBanner passport={passport} score={score} />

                <Section title="Score Iris">
                    <ScoreBreakdown breakdown={score.breakdown} />
                </Section>

                {artisan ? (
                    <Section title="L'artisan">
                        <ArtisanCard artisan={artisan} truncateStory />
                        <button
                            type="button"
                            onClick={() => router.push(`/artisans/${artisan.id}`)}
                            className="border-border bg-card text-foreground inline-flex items-center gap-2 self-start rounded-full border px-4 py-2 text-xs font-medium"
                        >
                            Découvrir l&apos;atelier
                            <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                    </Section>
                ) : null}

                {passport.materials.length > 0 ? (
                    <Section title="Matières">
                        <MaterialBreakdown materials={passport.materials} now={now} />
                    </Section>
                ) : null}

                {passport.steps.length > 0 ? (
                    <Section title="Étapes de fabrication">
                        <ProductionTimeline steps={passport.steps} />
                    </Section>
                ) : null}

                <Section title="Origine et trajet">
                    <OriginMap materials={passport.materials} steps={passport.steps} />
                </Section>

                {certificates.length > 0 ? (
                    <Section title="Certifications">
                        <CertificatesList certificates={certificates} now={now} />
                    </Section>
                ) : null}

                {passport.care || passport.warranty ? (
                    <Section title="Entretien et garantie">
                        <CareGuide care={passport.care} warranty={passport.warranty} />
                    </Section>
                ) : null}

                {previewRepairers.length > 0 ? (
                    <Section title="Retoucheurs proches">
                        <RepairersNearby repairers={previewRepairers} userCoordinates={userCoords} limit={3} />
                        <button
                            type="button"
                            onClick={() => router.push('/retoucheurs')}
                            className="border-border bg-card text-foreground inline-flex items-center gap-2 self-start rounded-full border px-4 py-2 text-xs font-medium"
                        >
                            Voir tous les retoucheurs
                            <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                    </Section>
                ) : null}
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="flex flex-col gap-3">
            <h2 className="text-foreground text-sm font-semibold uppercase tracking-wider">{title}</h2>
            {children}
        </section>
    );
}

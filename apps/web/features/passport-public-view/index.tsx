'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowRight, Smartphone } from 'lucide-react';
import {
    PassportHeader,
    PassportStatusBanner,
    ScoreBreakdown,
    ArtisanCard,
    MaterialBreakdown,
    ProductionTimeline,
    CertificatesList,
    CareGuide,
} from '@lumiris/scoring-ui';
import type { PassportPublicView } from '@lumiris/mock-data';

const OriginMap = dynamic(() => import('./origin-map').then((m) => m.OriginMap), {
    ssr: false,
    loading: () => (
        <div className="border-border bg-card text-muted-foreground flex h-72 items-center justify-center rounded-2xl border text-xs italic">
            Chargement de la carte…
        </div>
    ),
});

interface PassportPublicViewProps {
    view: PassportPublicView;
    artisanSlug: string;
}

export function PassportPublicViewSection({ view, artisanSlug }: PassportPublicViewProps) {
    const { passport, artisan, irisScore, inProgress } = view;
    const now = useMemo(() => new Date('2026-04-30T08:00:00Z'), []);

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
        <article className="mx-auto max-w-5xl space-y-8 px-6 pb-20 pt-28" aria-labelledby="passport-title">
            <h1 id="passport-title" className="sr-only">
                Passeport {passport.garment.reference}
            </h1>

            <PassportHeader passport={passport} artisan={artisan} grade={irisScore?.grade ?? 'E'} />

            <PassportStatusBanner passport={passport} score={irisScore} />

            {irisScore ? (
                <Section title="Score Iris" subtitle="Quatre piliers, cent points">
                    <ScoreBreakdown breakdown={irisScore.breakdown} />
                </Section>
            ) : null}

            <Section title="L’artisan">
                <ArtisanCard artisan={artisan} truncateStory />
                <Link
                    href={`/artisans/${artisanSlug}`}
                    className="bg-foreground text-background mt-4 inline-flex items-center gap-2 self-start rounded-full px-4 py-2 text-xs font-medium transition-opacity hover:opacity-90"
                >
                    Voir l’atelier
                    <ArrowRight className="h-3.5 w-3.5" />
                </Link>
            </Section>

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

            <RepairCallout />

            <p className="text-muted-foreground text-center text-xs">
                Passeport identifié par le GS1 Digital Link{' '}
                <code className="font-mono">{passport.gs1.verificationUrl}</code>.
            </p>
            <p className="text-muted-foreground text-center text-xs">
                LUMIRIS ne vend pas ses scores —{' '}
                <Link href="/charte-independance" className="text-foreground underline-offset-4 hover:underline">
                    charte d’indépendance
                </Link>
                .{inProgress ? ' Pièce en cours de complétion.' : null}
            </p>
        </article>
    );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
    return (
        <section className="flex flex-col gap-4">
            <div>
                <h2 className="text-foreground text-lg font-semibold tracking-tight">{title}</h2>
                {subtitle ? <p className="text-muted-foreground text-xs">{subtitle}</p> : null}
            </div>
            {children}
        </section>
    );
}

function RepairCallout() {
    return (
        <aside className="border-grade-b/30 bg-grade-b/5 flex flex-col gap-3 rounded-2xl border p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <p className="text-foreground inline-flex items-center gap-2 text-base font-semibold">
                    <Smartphone className="text-grade-b h-4 w-4" aria-hidden="true" />
                    Besoin d’une retouche ?
                </p>
                <p className="text-muted-foreground mt-1 max-w-xl text-sm leading-relaxed">
                    Téléchargez l’app LUMIRIS Vision pour trouver un retoucheur référencé près de chez vous, avec
                    géolocalisation et plages de disponibilité en temps réel.
                </p>
            </div>
            <Link
                href="#"
                className="bg-foreground text-background inline-flex shrink-0 items-center gap-2 self-start rounded-full px-4 py-2 text-xs font-medium transition-opacity hover:opacity-90"
            >
                Télécharger Vision
                <ArrowRight className="h-3.5 w-3.5" />
            </Link>
        </aside>
    );
}

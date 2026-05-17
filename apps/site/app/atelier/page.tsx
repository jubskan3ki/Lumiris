import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Hammer, Mail, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@lumiris/ui/components/card';

export const metadata: Metadata = {
    title: 'ATELIER — l’offre artisans LUMIRIS (ouvre Q3 2026)',
    description:
        'L’offre ATELIER permet aux artisans textiles français de créer leurs passeports DPP, suivre leurs scans et préparer leur conformité ESPR / AGEC. Ouverture des inscriptions à la liste d’attente.',
    alternates: { canonical: '/atelier' },
};

const PILLARS: ReadonlyArray<{ icon: typeof Hammer; title: string; body: string }> = [
    {
        icon: Hammer,
        title: 'Créer ses passeports DPP en 6 étapes',
        body: 'Composition fibres, étapes de fabrication, certifications, photos, prix, publication — chaque champ contribue au score Iris en temps réel.',
    },
    {
        icon: Sparkles,
        title: 'Score Iris vérifié et auditable',
        body: 'Le moteur 40 / 25 / 25 / 10 calcule Transparence, Savoir-faire, Impact et Réparabilité. Aucun acteur ne peut acheter son score.',
    },
    {
        icon: Mail,
        title: 'Conformité ESPR + AGEC anticipée',
        body: 'Plafond D si un champ ESPR ou AGEC manque. Tableau de bord de complétude pour préparer l’échéance européenne 2026-2028.',
    },
];

export default function AtelierPage() {
    return (
        <main className="bg-background min-h-screen pb-24 pt-28">
            <header className="mx-auto max-w-3xl px-6 text-center">
                <span className="border-border bg-card text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
                    <Sparkles className="text-grade-a h-3.5 w-3.5" aria-hidden="true" />
                    Ouverture Q3 2026
                </span>
                <h1 className="text-foreground mt-6 text-3xl font-semibold tracking-tight sm:text-5xl">
                    ATELIER — l’offre artisans
                </h1>
                <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-base leading-relaxed">
                    Le workspace B2B des artisans textiles français. Créez vos passeports DPP, suivez vos scans,
                    anticipez ESPR et AGEC. La plateforme ouvre au troisième trimestre 2026 — inscrivez-vous à la liste
                    d’attente.
                </p>

                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <a
                        href="mailto:atelier@lumiris.fr?subject=Liste%20d%E2%80%99attente%20ATELIER"
                        className="bg-foreground text-background inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                    >
                        Rejoindre la liste d’attente
                        <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                    <Link
                        href="/charte-independance"
                        className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
                    >
                        Lire la charte d’indépendance
                    </Link>
                </div>
            </header>

            <section aria-labelledby="atelier-pillars" className="mx-auto mt-20 max-w-5xl px-6">
                <h2 id="atelier-pillars" className="sr-only">
                    Ce que propose ATELIER
                </h2>
                <ul className="grid gap-4 sm:grid-cols-3">
                    {PILLARS.map(({ icon: Icon, title, body }) => (
                        <li key={title}>
                            <Card className="h-full">
                                <CardContent className="flex h-full flex-col gap-3 p-6">
                                    <Icon className="text-grade-b h-5 w-5" aria-hidden="true" />
                                    <h3 className="text-foreground text-base font-semibold">{title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
                                </CardContent>
                            </Card>
                        </li>
                    ))}
                </ul>
            </section>
        </main>
    );
}

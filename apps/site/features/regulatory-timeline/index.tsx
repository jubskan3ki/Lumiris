'use client';

import { motion } from 'framer-motion';
import { CalendarRange } from 'lucide-react';

interface TimelineEntry {
    date: string;
    label: string;
    region: 'France' | 'UE';
    description: string;
}

const ENTRIES: readonly TimelineEntry[] = [
    {
        date: 'Février 2020',
        label: 'AGEC promulguée',
        region: 'France',
        description:
            'Loi anti-gaspillage : socle français de l’affichage environnemental. Affichage progressif de 2020 à 2029.',
    },
    {
        date: 'Juillet 2024',
        label: 'ESPR en vigueur',
        region: 'UE',
        description:
            'Le règlement européen ESPR entre en vigueur. Programme de travail textile en priorité 1 dès mars 2025.',
    },
    {
        date: '19 juillet 2026',
        label: 'Registre central DPP',
        region: 'UE',
        description:
            'Ouverture du registre central des Digital Product Passports. URL canonique pour chaque passeport européen.',
    },
    {
        date: '1ᵉʳ janvier 2027',
        label: 'AGEC obligatoire',
        region: 'France',
        description:
            'Affichage environnemental obligatoire pour les acteurs > 50 M€ de chiffre d’affaires. Sanctions DGCCRF.',
    },
    {
        date: 'Q2 2027',
        label: 'Acte délégué textile',
        region: 'UE',
        description:
            'Adoption de l’acte délégué qui définit les seuils précis par catégorie (vêtement, chaussure, accessoire).',
    },
    {
        date: 'Mi-2028',
        label: 'DPP en application',
        region: 'UE',
        description:
            'Application pleine et entière du DPP textile. Premiers contrôles DGCCRF. Tout vêtement vendu en UE doit l’exposer.',
    },
];

const REGION_TONE: Record<TimelineEntry['region'], string> = {
    France: 'bg-grade-a/8 text-grade-a border-grade-a/20',
    UE: 'bg-grade-b/8 text-grade-b border-grade-b/20',
};

export function RegulatoryTimeline() {
    return (
        <section className="bg-secondary/40 border-border border-y py-20" aria-labelledby="timeline-title">
            <div className="mx-auto max-w-6xl px-6">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-12 max-w-2xl"
                >
                    <p className="text-muted-foreground mb-3 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.25em]">
                        <CalendarRange className="h-3.5 w-3.5" />
                        Calendrier réglementaire
                    </p>
                    <h2 id="timeline-title" className="text-foreground text-balance text-3xl font-bold sm:text-4xl">
                        AGEC, ESPR, DPP : tous les jalons
                    </h2>
                    <p className="text-muted-foreground mt-3 leading-relaxed">
                        Le passage à un textile traçable se déroule en six étapes. LUMIRIS prépare votre conformité dès
                        aujourd’hui - sans attendre la dernière vague.
                    </p>
                </motion.div>

                <ol className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 [scrollbar-width:thin]">
                    {ENTRIES.map((entry, i) => (
                        <motion.li
                            key={entry.label}
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.4, delay: i * 0.06 }}
                            className="bg-card border-border w-72 shrink-0 snap-start rounded-2xl border p-5 shadow-sm"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-muted-foreground font-mono text-[11px]">{entry.date}</p>
                                <span
                                    className={`rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${REGION_TONE[entry.region]}`}
                                >
                                    {entry.region}
                                </span>
                            </div>
                            <h3 className="text-foreground mt-3 text-base font-semibold leading-snug">{entry.label}</h3>
                            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{entry.description}</p>
                        </motion.li>
                    ))}
                </ol>
            </div>
        </section>
    );
}

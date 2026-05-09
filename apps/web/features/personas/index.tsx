'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Quote } from 'lucide-react';

interface Persona {
    id: string;
    name: string;
    role: string;
    photo: string;
    quote: string;
    solution: string;
}

const PERSONAS: readonly Persona[] = [
    {
        id: 'marie',
        name: 'Marie, créatrice',
        role: 'Couturière à Quimper',
        photo: 'https://placehold.co/256x256/oklch/65/0.13/195/png?text=Marie',
        quote: '« Je passais 4 heures par mois sur Excel pour Origine France Garantie. Aujourd’hui, je scanne mes factures et le passeport est prêt. »',
        solution:
            'LUMIRIS Atelier transforme ses factures fournisseurs en preuves valides. Score Iris A en 30 minutes par pièce.',
    },
    {
        id: 'theo',
        name: 'Théo, DNVB',
        role: 'Fondateur d’une marque jeune',
        photo: 'https://placehold.co/256x256/oklch/64/0.18/45/png?text=Theo',
        quote: '« Mes clients veulent voir l’atelier qui fabrique. Le QR code sur l’étiquette ouvre tout, sans que j’aie à monter une page produit. »',
        solution:
            'Chaque pièce expose son passeport via un QR — interopérable, conforme au DPP européen, gratuit pour le consommateur.',
    },
    {
        id: 'lea',
        name: 'Léa, acheteuse',
        role: 'Mode responsable',
        photo: 'https://placehold.co/256x256/oklch/55/0.18/160/png?text=Lea',
        quote: '« Je veux savoir exactement ce que j’achète. Le grade Iris me dit en 2 secondes si une pièce mérite son prix. »',
        solution:
            'Score Iris A→E : la note est lisible en un coup d’œil, le détail (composition, atelier, garantie) à un scroll.',
    },
    {
        id: 'mehdi',
        name: 'Mehdi, retoucheur',
        role: 'Cordonnerie de quartier',
        photo: 'https://placehold.co/256x256/oklch/55/0.20/15/png?text=Mehdi',
        quote: '« Quand le QR pointe vers un retoucheur référencé, le client vient avec sa pièce et son histoire — c’est un acte de réparation, pas une vente forcée. »',
        solution:
            'Le réseau LUMIRIS Local référence les retoucheurs par spécialité — visibilité gratuite pour les indépendants.',
    },
];

export function Personas() {
    return (
        <section className="py-24" aria-labelledby="personas-title">
            <div className="mx-auto max-w-6xl px-6">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-14 max-w-2xl"
                >
                    <p className="text-muted-foreground mb-3 text-xs font-medium uppercase tracking-[0.25em]">
                        Quatre points de vue
                    </p>
                    <h2 id="personas-title" className="text-foreground text-balance text-3xl font-bold sm:text-4xl">
                        Une plateforme, quatre rôles
                    </h2>
                    <p className="text-muted-foreground mt-3 leading-relaxed">
                        LUMIRIS sert les artisans, les marques, les acheteurs conscients et le réseau de retoucheurs qui
                        font durer les pièces.
                    </p>
                </motion.div>

                <ul className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {PERSONAS.map((p, i) => (
                        <motion.li
                            key={p.id}
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.5, delay: i * 0.07 }}
                            className="bg-card border-border flex flex-col gap-4 rounded-2xl border p-6 shadow-sm sm:flex-row sm:gap-6"
                        >
                            <Image
                                src={p.photo}
                                alt={`Photo de ${p.name}`}
                                width={88}
                                height={88}
                                className="border-border h-22 w-22 shrink-0 rounded-2xl border object-cover"
                            />
                            <div className="flex-1">
                                <p className="text-foreground text-base font-semibold">{p.name}</p>
                                <p className="text-muted-foreground text-xs">{p.role}</p>
                                <p className="text-foreground/90 mt-3 text-sm leading-relaxed">
                                    <Quote className="text-muted-foreground/50 mr-1 inline h-3.5 w-3.5" />
                                    {p.quote}
                                </p>
                                <p className="text-muted-foreground border-border mt-4 border-t pt-3 text-xs leading-relaxed">
                                    <span className="text-foreground font-semibold">Solution LUMIRIS — </span>
                                    {p.solution}
                                </p>
                            </div>
                        </motion.li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

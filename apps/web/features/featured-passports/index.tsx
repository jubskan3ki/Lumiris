'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MapPin } from 'lucide-react';
import { mockPassportsPublic } from '@lumiris/mock-data';
import { IrisGrade } from '@lumiris/scoring-ui/components/iris-grade';

const KIND_LABEL: Record<string, string> = {
    sweater: 'Pull',
    shirt: 'Chemise',
    shoe: 'Chaussures',
    jacket: 'Veste',
    trouser: 'Pantalon',
    accessory: 'Accessoire',
    other: 'Pièce',
};

export function FeaturedPassports() {
    const passports = mockPassportsPublic.filter((v) => v.passport.status === 'Published' && v.irisScore).slice(0, 8);

    if (passports.length === 0) return null;

    return (
        <section className="bg-secondary/40 border-border border-y py-20" aria-labelledby="featured-passports-title">
            <div className="mx-auto max-w-6xl px-6">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
                >
                    <div>
                        <p className="text-muted-foreground mb-3 text-xs font-medium uppercase tracking-[0.25em]">
                            Récemment publiés
                        </p>
                        <h2
                            id="featured-passports-title"
                            className="text-foreground text-balance text-3xl font-bold sm:text-4xl"
                        >
                            Quelques pièces vivantes
                        </h2>
                        <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed">
                            Cliquez sur une pièce pour voir son passeport complet — composition, étapes, atelier, score
                            Iris.
                        </p>
                    </div>
                    <Link
                        href="/artisans"
                        className="text-foreground hover:text-grade-a inline-flex items-center gap-2 self-start text-sm font-medium transition-colors"
                    >
                        Voir tous les artisans
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </motion.div>

                <ul
                    className="-mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-6 [scrollbar-width:thin]"
                    aria-label="Passeports récemment publiés"
                >
                    {passports.map((view, i) => {
                        const score = view.irisScore;
                        if (!score) return null;
                        const kind = KIND_LABEL[view.passport.garment.kind] ?? KIND_LABEL.other;
                        const photo = view.passport.garment.mainPhotoUrl;
                        return (
                            <motion.li
                                key={view.passport.id}
                                initial={{ opacity: 0, y: 18 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-40px' }}
                                transition={{ duration: 0.4, delay: i * 0.05 }}
                                className="bg-card border-border w-72 shrink-0 snap-start overflow-hidden rounded-2xl border shadow-sm"
                            >
                                <Link href={`/passeport/${view.passport.id}`} className="group block">
                                    <div className="bg-muted aspect-4/5 relative w-full overflow-hidden">
                                        {photo ? (
                                            <Image
                                                src={photo}
                                                alt={`${kind} ${view.passport.garment.reference} — ${view.artisan.atelierName}`}
                                                fill
                                                sizes="288px"
                                                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                            />
                                        ) : null}
                                        <div className="absolute right-3 top-3">
                                            <IrisGrade grade={score.grade} size="md" tone="solid" shape="square" />
                                        </div>
                                    </div>
                                    <div className="space-y-2 p-5">
                                        <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-wider">
                                            {kind}
                                        </p>
                                        <h3 className="text-foreground text-base font-semibold leading-snug">
                                            {view.passport.garment.reference}
                                        </h3>
                                        <p className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                                            <MapPin className="h-3 w-3" />
                                            {view.artisan.atelierName} · {view.artisan.city}
                                        </p>
                                    </div>
                                </Link>
                            </motion.li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}

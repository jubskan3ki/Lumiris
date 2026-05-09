'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, Star, Clock, Phone, Mail, X, Search } from 'lucide-react';
import { Badge } from '@lumiris/ui/components/badge';
import { mockRepairers, CITY_COORDS, distanceKm } from '@lumiris/mock-data';
import type { Coordinates, Repairer, RepairerSpecialty } from '@lumiris/types';

const SPECIALITY_LABEL: Record<RepairerSpecialty, string> = {
    alteration: 'Retouche',
    embroidery: 'Broderie',
    'shoe-repair': 'Cordonnerie',
    leather: 'Cuir',
    lining: 'Doublure',
};

const SPECIALITIES: readonly RepairerSpecialty[] = ['alteration', 'embroidery', 'shoe-repair', 'leather', 'lining'];

export function RepairersDirectory() {
    const router = useRouter();
    const [city, setCity] = useState('');
    const [activeSpecs, setActiveSpecs] = useState<Set<RepairerSpecialty>>(new Set());
    const [maxPrice, setMaxPrice] = useState<number>(200);
    const [maxDelay, setMaxDelay] = useState<number>(14);
    const [userCoords, setUserCoords] = useState<Coordinates | null>(null);
    const [selected, setSelected] = useState<Repairer | null>(null);

    useEffect(() => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => {
                /* refus = tri par note (cf. memo ci-dessous) */
            },
            { timeout: 5000, maximumAge: 60_000 },
        );
    }, []);

    const toggleSpec = (spec: RepairerSpecialty) => {
        setActiveSpecs((prev) => {
            const next = new Set(prev);
            if (next.has(spec)) next.delete(spec);
            else next.add(spec);
            return next;
        });
    };

    const items = useMemo(() => {
        const filtered = mockRepairers.filter((r) => {
            if (city && !r.city.toLowerCase().includes(city.toLowerCase())) return false;
            if (activeSpecs.size > 0 && !r.specialities.some((s) => activeSpecs.has(s))) return false;
            if (r.priceRange.min > maxPrice) return false;
            if (r.avgDelayDays > maxDelay) return false;
            return true;
        });

        if (userCoords) {
            return [...filtered]
                .map((r) => {
                    const cityCoords = CITY_COORDS[r.city];
                    const distance = cityCoords ? distanceKm(userCoords, cityCoords) : undefined;
                    return { repairer: r, distance };
                })
                .sort((a, b) => (a.distance ?? Number.POSITIVE_INFINITY) - (b.distance ?? Number.POSITIVE_INFINITY));
        }
        return [...filtered]
            .map((r) => ({ repairer: r, distance: undefined as number | undefined }))
            .sort((a, b) => b.repairer.avgRating - a.repairer.avgRating);
    }, [city, activeSpecs, maxPrice, maxDelay, userCoords]);

    return (
        <div className="bg-background flex h-full flex-col">
            <motion.header
                className="flex items-center gap-3 px-4 pb-3 pt-12"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <button
                    type="button"
                    onClick={() => router.back()}
                    aria-label="Retour"
                    className="border-border bg-card text-foreground inline-flex h-9 w-9 items-center justify-center rounded-full border"
                >
                    <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="min-w-0 flex-1">
                    <h1 className="text-foreground text-base font-bold">Retoucheurs</h1>
                    <p className="text-muted-foreground text-xs">
                        {items.length} atelier{items.length > 1 ? 's' : ''}
                        {userCoords ? ' · trié par distance' : ' · trié par note'}
                    </p>
                </div>
            </motion.header>

            <div className="flex flex-col gap-3 px-4 pb-3">
                <label className="border-border bg-card text-foreground flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm">
                    <Search className="text-muted-foreground h-4 w-4" />
                    <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Ville (Lyon, Paris…)"
                        className="placeholder:text-muted-foreground/60 flex-1 bg-transparent outline-none"
                        aria-label="Filtre ville"
                    />
                </label>

                <ul className="-mx-1 flex flex-wrap gap-1.5 px-1">
                    {SPECIALITIES.map((spec) => {
                        const active = activeSpecs.has(spec);
                        return (
                            <li key={spec}>
                                <button
                                    type="button"
                                    onClick={() => toggleSpec(spec)}
                                    aria-pressed={active}
                                    className={`rounded-full border px-3 py-1 text-[11px] font-medium transition ${
                                        active
                                            ? 'border-lumiris-cyan bg-lumiris-cyan/10 text-lumiris-cyan'
                                            : 'border-border bg-card text-muted-foreground'
                                    }`}
                                >
                                    {SPECIALITY_LABEL[spec]}
                                </button>
                            </li>
                        );
                    })}
                </ul>

                <div className="grid grid-cols-2 gap-3">
                    <RangeInput
                        label="Prix max"
                        suffix="€"
                        value={maxPrice}
                        min={20}
                        max={300}
                        step={10}
                        onChange={setMaxPrice}
                    />
                    <RangeInput
                        label="Délai max"
                        suffix="j"
                        value={maxDelay}
                        min={1}
                        max={21}
                        step={1}
                        onChange={setMaxDelay}
                    />
                </div>
            </div>

            <ul className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 pb-24">
                {items.length === 0 ? (
                    <li className="text-muted-foreground py-10 text-center text-sm italic">
                        Aucun retoucheur ne correspond à ces filtres.
                    </li>
                ) : (
                    items.map(({ repairer, distance }) => (
                        <li key={repairer.id}>
                            <button
                                type="button"
                                onClick={() => setSelected(repairer)}
                                className="border-border/60 bg-card flex w-full flex-col gap-2 rounded-2xl border p-4 text-left"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-foreground truncate text-sm font-semibold">
                                            {repairer.displayName}
                                        </p>
                                        <p className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                                            <MapPin className="h-3 w-3" />
                                            {repairer.city}
                                            {typeof distance === 'number' ? (
                                                <span className="text-muted-foreground/70 font-mono">
                                                    · {distance.toFixed(0)} km
                                                </span>
                                            ) : null}
                                        </p>
                                    </div>
                                    <div className="text-foreground inline-flex items-center gap-1 text-sm font-semibold">
                                        <Star className="text-lumiris-amber h-3.5 w-3.5 fill-current" />
                                        {repairer.avgRating.toFixed(1)}
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {repairer.specialities.map((s) => (
                                        <Badge key={s} variant="secondary" className="text-[10px]">
                                            {SPECIALITY_LABEL[s]}
                                        </Badge>
                                    ))}
                                </div>
                                <div className="text-muted-foreground flex items-center justify-between text-xs">
                                    <span className="inline-flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> ~{repairer.avgDelayDays} j
                                    </span>
                                    <span className="font-mono">
                                        {repairer.priceRange.min}–{repairer.priceRange.max} €
                                    </span>
                                </div>
                            </button>
                        </li>
                    ))
                )}
            </ul>

            <AnimatePresence>
                {selected ? <RepairerDetail repairer={selected} onClose={() => setSelected(null)} /> : null}
            </AnimatePresence>
        </div>
    );
}

function RangeInput({
    label,
    suffix,
    value,
    min,
    max,
    step,
    onChange,
}: {
    label: string;
    suffix: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (n: number) => void;
}) {
    const inputId = useId();
    return (
        <label htmlFor={inputId} className="border-border bg-card flex flex-col gap-1 rounded-2xl border px-3 py-2">
            <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
                {label}
                <span className="text-foreground ml-1">
                    {value}
                    {suffix}
                </span>
            </span>
            <input
                id={inputId}
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="accent-lumiris-cyan"
                aria-label={`${label} (${value}${suffix})`}
            />
        </label>
    );
}

function RepairerDetail({ repairer, onClose }: { repairer: Repairer; onClose: () => void }) {
    return (
        <motion.div
            className="absolute inset-0 z-40 flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="bg-background/70 absolute inset-0 backdrop-blur-sm" onClick={onClose} role="presentation" />
            <motion.div
                role="dialog"
                aria-label={repairer.displayName}
                className="border-border bg-card relative mx-4 mb-8 w-full max-w-sm rounded-3xl border p-5 shadow-2xl"
                initial={{ y: 60 }}
                animate={{ y: 0 }}
                exit={{ y: 60 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Fermer"
                    className="border-border/60 bg-card text-foreground absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border"
                >
                    <X className="h-3.5 w-3.5" />
                </button>

                <h2 className="text-foreground text-base font-semibold">{repairer.displayName}</h2>
                <p className="text-muted-foreground text-xs">
                    {repairer.atelierName ?? '—'} · {repairer.city}
                </p>

                <div className="mt-3 flex items-center gap-3 text-xs">
                    <span className="inline-flex items-center gap-1">
                        <Star className="text-lumiris-amber h-3.5 w-3.5 fill-current" />
                        {repairer.avgRating.toFixed(1)} ({repairer.reviewCount})
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> ~{repairer.avgDelayDays} j
                    </span>
                    <span className="font-mono">
                        {repairer.priceRange.min}–{repairer.priceRange.max} €
                    </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                    {repairer.specialities.map((s) => (
                        <Badge key={s} variant="secondary" className="text-[10px]">
                            {SPECIALITY_LABEL[s]}
                        </Badge>
                    ))}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2">
                    <a
                        href={`tel:+33000000000`}
                        className="bg-foreground text-primary-foreground inline-flex items-center justify-center gap-2 rounded-full py-2 text-xs font-semibold"
                    >
                        <Phone className="h-3.5 w-3.5" /> Appeler
                    </a>
                    <a
                        href={`mailto:contact@${repairer.id}.fr`}
                        className="border-border bg-card text-foreground inline-flex items-center justify-center gap-2 rounded-full border py-2 text-xs font-medium"
                    >
                        <Mail className="h-3.5 w-3.5" /> Email
                    </a>
                </div>

                <p className="text-muted-foreground/80 mt-3 text-center text-[10px]">
                    Prise de RDV en ligne — bientôt disponible.
                </p>
            </motion.div>
        </motion.div>
    );
}

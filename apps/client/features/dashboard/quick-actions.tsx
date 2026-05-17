'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FilePlus2, Receipt, ShieldCheck, UserCog, type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@lumiris/ui/components/card';
import { QuotaUpsellDialog } from '@/features/quota-upsell';
import { useBilling } from '@/lib/billing-store';
import { useCurrentArtisan } from '@/lib/current-artisan';
import { usePassports } from '@/lib/passports-source';
import { activePassportCount, isQuotaReached } from '@/lib/quota';

interface QuickAction {
    label: string;
    href: string;
    icon: LucideIcon;
}

const ACTIONS: readonly QuickAction[] = [
    { label: 'Nouveau passeport', href: '/create', icon: FilePlus2 },
    { label: 'Importer une facture', href: '/invoices', icon: Receipt },
    { label: 'Ajouter un certificat', href: '/certifications', icon: ShieldCheck },
    { label: 'Voir mon profil', href: '/profile', icon: UserCog },
];

export function QuickActions() {
    const artisan = useCurrentArtisan();
    const billing = useBilling(artisan.id);
    const passports = usePassports(artisan.id);
    const [upsellOpen, setUpsellOpen] = useState(false);

    const createBlocked = isQuotaReached(passports, billing.tier);

    return (
        <>
            <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {ACTIONS.map(({ label, href, icon: Icon }) => {
                    const isCreate = href === '/create';
                    const card = (
                        <Card className="transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
                            <CardContent className="flex items-center gap-3 p-4">
                                <div className="bg-lumiris-emerald/10 text-lumiris-emerald flex h-9 w-9 shrink-0 items-center justify-center rounded-md">
                                    <Icon className="h-4 w-4" />
                                </div>
                                <span className="text-foreground text-sm font-medium">{label}</span>
                            </CardContent>
                        </Card>
                    );

                    if (isCreate && createBlocked) {
                        return (
                            <button
                                key={href}
                                type="button"
                                onClick={() => setUpsellOpen(true)}
                                className="group text-left"
                            >
                                {card}
                            </button>
                        );
                    }

                    return (
                        <Link key={href} href={href} className="group">
                            {card}
                        </Link>
                    );
                })}
            </section>

            <QuotaUpsellDialog
                open={upsellOpen}
                onOpenChange={setUpsellOpen}
                currentTier={billing.tier}
                used={activePassportCount(passports)}
            />
        </>
    );
}

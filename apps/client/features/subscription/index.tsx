'use client';

import { useState } from 'react';
import { Check, ExternalLink, Sparkles } from 'lucide-react';
import { ATELIER_PLANS, ATELIER_ADD_ONS } from '@lumiris/mock-data';
import type { AtelierPlanTier } from '@lumiris/types';
import { Badge } from '@lumiris/ui/components/badge';
import { Button } from '@lumiris/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@lumiris/ui/components/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@lumiris/ui/components/dialog';
import { Switch } from '@lumiris/ui/components/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@lumiris/ui/components/table';
import { cn } from '@lumiris/ui/lib/cn';
import { ATELIER_PASSPORT_LIMIT_LABEL, usePassportCount } from '@/features/workspace-shell/hooks';
import { currentArtisan } from '@/lib/current-artisan';

const TIER_KEY: Record<typeof currentArtisan.tier, AtelierPlanTier> = {
    Solo: 'solo',
    Studio: 'studio',
    Maison: 'maison',
};

export function Subscription() {
    const [plus, setPlus] = useState(currentArtisan.plus);
    const [dialogOpen, setDialogOpen] = useState(false);
    const passportCount = usePassportCount(currentArtisan.id);
    const tierKey = TIER_KEY[currentArtisan.tier];
    const currentPlan = ATELIER_PLANS.find((p) => p.tier === tierKey);
    const addon = ATELIER_ADD_ONS[0];
    const limitLabel = ATELIER_PASSPORT_LIMIT_LABEL[currentArtisan.tier];

    return (
        <div className="space-y-6 p-8">
            <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            Palier actuel : {currentPlan?.label ?? currentArtisan.tier}
                            {currentArtisan.plus && (
                                <Badge className="bg-lumiris-amber/10 text-lumiris-amber border-lumiris-amber/30">
                                    ATELIER+
                                </Badge>
                            )}
                        </CardTitle>
                        <p className="text-muted-foreground mt-1 text-sm">{currentPlan?.tagline}</p>
                    </div>
                    <Button variant="outline" onClick={() => setDialogOpen(true)}>
                        Changer de palier
                    </Button>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                    <Field label="Tarif mensuel" value={currentPlan ? `${currentPlan.monthlyEur} €/mois` : '-'} />
                    <Field
                        label="Tarif annuel"
                        value={currentPlan ? `${currentPlan.yearlyEur} €/an (2 mois offerts)` : '-'}
                    />
                    <Field label="Passeports actifs" value={`${passportCount} / ${limitLabel}`} emphasize />
                </CardContent>
            </Card>

            {addon && (
                <Card>
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="text-lumiris-amber h-4 w-4" /> {addon.label}
                            </CardTitle>
                            <p className="text-muted-foreground mt-1 text-sm">{addon.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-muted-foreground font-mono text-xs">{addon.monthlyEur} € / mois</span>
                            <Switch checked={plus} onCheckedChange={setPlus} aria-label="Activer ATELIER+" />
                        </div>
                    </CardHeader>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Comparatif des paliers</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Palier</TableHead>
                                <TableHead>Mensuel</TableHead>
                                <TableHead>Annuel</TableHead>
                                <TableHead>Passeports</TableHead>
                                <TableHead>Sièges</TableHead>
                                <TableHead>Atouts</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {ATELIER_PLANS.map((plan) => (
                                <TableRow
                                    key={plan.tier}
                                    className={cn(plan.tier === tierKey && 'bg-lumiris-emerald/5')}
                                >
                                    <TableCell className="font-medium">
                                        {plan.label}
                                        {plan.tier === tierKey && (
                                            <Badge className="border-lumiris-emerald/30 bg-lumiris-emerald/10 text-lumiris-emerald ml-2">
                                                Actuel
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-mono">{plan.monthlyEur} €</TableCell>
                                    <TableCell className="font-mono">{plan.yearlyEur} €</TableCell>
                                    <TableCell>{plan.maxPassports ?? 'illimité'}</TableCell>
                                    <TableCell>{plan.maxSeats ?? 'illimité'}</TableCell>
                                    <TableCell>
                                        <ul className="text-muted-foreground space-y-0.5 text-xs">
                                            {plan.features.slice(0, 3).map((f) => (
                                                <li key={f} className="flex items-center gap-1.5">
                                                    <Check className="text-lumiris-emerald h-3 w-3 shrink-0" /> {f}
                                                </li>
                                            ))}
                                        </ul>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ExternalLink className="h-4 w-4" /> Bientôt disponible
                        </DialogTitle>
                        <DialogDescription>
                            Le changement de palier passera par Stripe et sera branché lors de la vague V5 (apps/api).
                            En attendant, contactez l’équipe LUMIRIS pour faire évoluer votre abonnement.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Compris
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function Field({ label, value, emphasize = false }: { label: string; value: string; emphasize?: boolean }) {
    return (
        <div className="space-y-1">
            <p className="text-muted-foreground text-[11px] uppercase tracking-wider">{label}</p>
            <p
                className={cn(
                    'font-mono',
                    emphasize ? 'text-foreground text-2xl font-semibold' : 'text-foreground text-sm',
                )}
            >
                {value}
            </p>
        </div>
    );
}

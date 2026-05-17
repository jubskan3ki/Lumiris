'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, CreditCard, Receipt, Sparkles } from 'lucide-react';
import { toast } from '@lumiris/ui/components/sonner';
import { ATELIER_ADD_ONS, ATELIER_PLANS } from '@lumiris/mock-data';
import type { ArtisanTier, AtelierPlanTier } from '@lumiris/types';
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
import {
    ATELIER_PLUS_LABEL,
    ATELIER_PLUS_MONTHLY_EUR,
    PLAN_TO_TIER,
    type BillingCycle,
    atelierPlusAmount,
    planAmount,
    planMonthly,
    planYearly,
    useBilling,
    useBillingStore,
} from '@/lib/billing-store';
import { useCurrentArtisan } from '@/lib/current-artisan';

const TIER_TO_PLAN: Record<ArtisanTier, AtelierPlanTier> = {
    Solo: 'solo',
    Studio: 'studio',
    Maison: 'maison',
};

interface PlanChangeIntent {
    targetTier: ArtisanTier;
}

export function Subscription() {
    const searchParams = useSearchParams();
    const upsell = searchParams?.get('upsell');

    const artisan = useCurrentArtisan();
    const billing = useBilling(artisan.id);
    const setTier = useBillingStore((s) => s.setTier);
    const setAtelierPlus = useBillingStore((s) => s.setAtelierPlus);

    const passportCount = usePassportCount(artisan.id);
    const limitLabel = ATELIER_PASSPORT_LIMIT_LABEL[billing.tier];
    const currentPlan = ATELIER_PLANS.find((p) => p.tier === TIER_TO_PLAN[billing.tier]);
    const addon = ATELIER_ADD_ONS[0];

    const [intent, setIntent] = useState<PlanChangeIntent | null>(null);
    const [intentCycle, setIntentCycle] = useState<BillingCycle>(billing.billingCycle);
    const [methodOpen, setMethodOpen] = useState(false);

    const plusToggleRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        if (upsell === 'analytics' && plusToggleRef.current) {
            plusToggleRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [upsell]);

    const onConfirmTierChange = () => {
        if (!intent) return;
        const amount = planAmount(intent.targetTier, intentCycle);
        setTier(artisan.id, intent.targetTier, { amount, cycle: intentCycle });
        toast.success(`Palier mis à jour : ${intent.targetTier}`, {
            description: `Cycle ${intentCycle === 'annual' ? 'annuel' : 'mensuel'} — ${amount} €`,
        });
        setIntent(null);
    };

    const onTogglePlus = (checked: boolean) => {
        setAtelierPlus(artisan.id, checked);
        if (checked) {
            toast.success('ATELIER+ activé', {
                description: `+${atelierPlusAmount(billing.billingCycle)} € · ${ATELIER_PLUS_LABEL}`,
            });
        } else {
            toast.info('ATELIER+ désactivé');
        }
    };

    return (
        <div className="space-y-6 p-4 md:p-8">
            {upsell === 'analytics' && (
                <div className="bg-lumiris-amber/10 text-lumiris-amber border-lumiris-amber/30 flex items-start gap-2 rounded-md border p-3 text-sm">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                        Analytics nécessite l’option <strong>ATELIER+</strong>. Activez-la ci-dessous pour accéder au
                        tableau de bord d’analyse.
                    </div>
                </div>
            )}

            <Card>
                <CardHeader className="flex flex-col items-start justify-between gap-4 md:flex-row">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            Palier actuel : {currentPlan?.label ?? billing.tier}
                            {billing.atelierPlus && (
                                <Badge className="bg-lumiris-amber/10 text-lumiris-amber border-lumiris-amber/30">
                                    {ATELIER_PLUS_LABEL}
                                </Badge>
                            )}
                        </CardTitle>
                        <p className="text-muted-foreground mt-1 text-sm">{currentPlan?.tagline}</p>
                    </div>
                    <div className="text-muted-foreground text-xs">
                        Cycle de facturation actuel :{' '}
                        <span className="font-medium uppercase">
                            {billing.billingCycle === 'annual' ? 'annuel' : 'mensuel'}
                        </span>
                    </div>
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
                <Card ref={plusToggleRef}>
                    <CardHeader className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="text-lumiris-amber h-4 w-4" /> {addon.label}
                            </CardTitle>
                            <p className="text-muted-foreground mt-1 text-sm">{addon.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-muted-foreground font-mono text-xs">
                                {ATELIER_PLUS_MONTHLY_EUR} € / mois
                            </span>
                            <Switch
                                checked={billing.atelierPlus}
                                onCheckedChange={onTogglePlus}
                                aria-label="Activer ATELIER+"
                            />
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
                                <TableHead className="hidden md:table-cell">Atouts</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {ATELIER_PLANS.map((plan) => {
                                const isCurrent = plan.tier === TIER_TO_PLAN[billing.tier];
                                const targetTier = PLAN_TO_TIER[plan.tier];
                                return (
                                    <TableRow key={plan.tier} className={cn(isCurrent && 'bg-lumiris-emerald/5')}>
                                        <TableCell className="font-medium">
                                            {plan.label}
                                            {isCurrent && (
                                                <Badge className="border-lumiris-emerald/30 bg-lumiris-emerald/10 text-lumiris-emerald ml-2">
                                                    Actuel
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-mono">{plan.monthlyEur} €</TableCell>
                                        <TableCell className="font-mono">{plan.yearlyEur} €</TableCell>
                                        <TableCell>{plan.maxPassports ?? 'illimité'}</TableCell>
                                        <TableCell>{plan.maxSeats ?? 'illimité'}</TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <ul className="text-muted-foreground space-y-0.5 text-xs">
                                                {plan.features.slice(0, 3).map((f) => (
                                                    <li key={f} className="flex items-center gap-1.5">
                                                        <Check className="text-lumiris-emerald h-3 w-3 shrink-0" /> {f}
                                                    </li>
                                                ))}
                                            </ul>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                variant={isCurrent ? 'ghost' : 'outline'}
                                                disabled={isCurrent}
                                                onClick={() => {
                                                    setIntentCycle(billing.billingCycle);
                                                    setIntent({ targetTier });
                                                }}
                                            >
                                                {isCurrent ? '—' : 'Changer'}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="text-muted-foreground h-4 w-4" />
                            Méthode de paiement
                        </CardTitle>
                        <p className="text-muted-foreground mt-1 text-xs">Visa se terminant par {billing.cardLast4}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono uppercase">
                            Démo
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => setMethodOpen(true)}>
                            Modifier
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="text-muted-foreground h-4 w-4" />
                        Historique de facturation
                    </CardTitle>
                    <p className="text-muted-foreground text-xs">
                        Tous les montants en euros TTC. Les reçus sont des fac-similés générés en local.
                    </p>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead className="text-right">Montant</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-right">Reçu</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {billing.invoiceHistory.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-muted-foreground py-10 text-center text-sm">
                                        Aucune facture pour le moment.
                                    </TableCell>
                                </TableRow>
                            )}
                            {billing.invoiceHistory.slice(0, 24).map((entry) => (
                                <TableRow key={entry.id}>
                                    <TableCell className="text-muted-foreground font-mono text-xs">
                                        {new Date(entry.date).toLocaleDateString('fr-FR')}
                                    </TableCell>
                                    <TableCell>{entry.plan}</TableCell>
                                    <TableCell className="text-right font-mono">{entry.amount} €</TableCell>
                                    <TableCell>
                                        <Badge className="bg-lumiris-emerald/10 text-lumiris-emerald border-lumiris-emerald/30">
                                            {entry.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                window.open(`/print/receipt/${entry.id}`, '_blank', 'noopener')
                                            }
                                        >
                                            Reçu
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <ChangePlanDialog
                intent={intent}
                cycle={intentCycle}
                currentTier={billing.tier}
                onCycleChange={setIntentCycle}
                onCancel={() => setIntent(null)}
                onConfirm={onConfirmTierChange}
            />

            <PaymentMethodDialog open={methodOpen} onOpenChange={setMethodOpen} last4={billing.cardLast4} />
        </div>
    );
}

function ChangePlanDialog({
    intent,
    cycle,
    currentTier,
    onCycleChange,
    onCancel,
    onConfirm,
}: {
    intent: PlanChangeIntent | null;
    cycle: BillingCycle;
    currentTier: ArtisanTier;
    onCycleChange: (c: BillingCycle) => void;
    onCancel: () => void;
    onConfirm: () => void;
}) {
    const target = intent?.targetTier;
    const summary = useMemo(() => {
        if (!target) return null;
        const amount = cycle === 'annual' ? planYearly(target) : planMonthly(target);
        const nextDate = new Date();
        nextDate.setUTCMonth(nextDate.getUTCMonth() + (cycle === 'annual' ? 12 : 1));
        const dailyMonthly = planMonthly(target) / 30;
        const proRata = Math.max(0, Math.round(dailyMonthly * 14));
        return { amount, nextDateLabel: nextDate.toLocaleDateString('fr-FR'), proRata };
    }, [target, cycle]);

    return (
        <Dialog open={!!intent} onOpenChange={(o) => !o && onCancel()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirmer le changement de palier</DialogTitle>
                    <DialogDescription>
                        Récapitulatif du changement avant confirmation. Les chiffres ci-dessous sont calculés
                        localement.
                    </DialogDescription>
                </DialogHeader>

                {target && summary && (
                    <div className="space-y-3 py-2 text-sm">
                        <div className="bg-lumiris-amber/10 text-lumiris-amber border-lumiris-amber/30 rounded-md border p-2 text-xs">
                            Mode démo — aucun paiement n’est réellement effectué.
                        </div>

                        <div className="grid gap-2">
                            <div className="text-muted-foreground flex items-center justify-between">
                                <span>Palier actuel</span>
                                <span className="text-foreground font-medium">{currentTier}</span>
                            </div>
                            <div className="text-muted-foreground flex items-center justify-between">
                                <span>Palier cible</span>
                                <span className="text-foreground font-medium">{target}</span>
                            </div>
                            <div className="text-muted-foreground flex items-center justify-between">
                                <span>Cycle</span>
                                <div className="bg-muted text-muted-foreground inline-flex rounded-md p-0.5">
                                    <button
                                        type="button"
                                        className={cn(
                                            'rounded-sm px-2 py-1 text-xs',
                                            cycle === 'monthly' && 'bg-background text-foreground shadow-sm',
                                        )}
                                        onClick={() => onCycleChange('monthly')}
                                    >
                                        Mensuel
                                    </button>
                                    <button
                                        type="button"
                                        className={cn(
                                            'rounded-sm px-2 py-1 text-xs',
                                            cycle === 'annual' && 'bg-background text-foreground shadow-sm',
                                        )}
                                        onClick={() => onCycleChange('annual')}
                                    >
                                        Annuel <span className="text-lumiris-emerald font-mono text-[10px]">−17%</span>
                                    </button>
                                </div>
                            </div>
                            <div className="text-muted-foreground flex items-center justify-between">
                                <span>Prochaine facture</span>
                                <span className="text-foreground font-mono">
                                    {summary.amount} € · {summary.nextDateLabel}
                                </span>
                            </div>
                            <div className="text-muted-foreground flex items-center justify-between">
                                <span>Pro-rata estimé</span>
                                <span className="text-foreground font-mono">{summary.proRata} €</span>
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onCancel}>
                        Annuler
                    </Button>
                    <Button onClick={onConfirm}>Confirmer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function PaymentMethodDialog({
    open,
    onOpenChange,
    last4,
}: {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    last4: string;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Méthode de paiement</DialogTitle>
                    <DialogDescription>
                        La modification de carte n’est pas disponible en mode démo. La carte fictive Visa{' '}
                        <span className="font-mono">•••• {last4}</span> reste associée au compte pour les écritures
                        d’historique.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Compris</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
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

'use client';

import { useState } from 'react';
import { Clock, History } from 'lucide-react';
import type { Passport, IrisGrade as IrisGradeLetter } from '@lumiris/types';
import { gradeBackground, gradeColor } from '@lumiris/scoring-ui';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@lumiris/ui/components/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@lumiris/ui/components/select';
import { Textarea } from '@lumiris/ui/components/textarea';
import { cn } from '@lumiris/ui/lib/cn';
import { useLogAction } from '@/lib/auth';
import { useCurationStore } from '../curation-store';

interface OverrideDialogProps {
    passport: Passport;
    grade: IrisGradeLetter;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAfterAction: () => void;
}

export function OverrideDialog({ passport, grade, open, onOpenChange, onAfterAction }: OverrideDialogProps) {
    const log = useLogAction();
    const { setOverlay } = useCurationStore();
    const [overrideGrade, setOverrideGrade] = useState<IrisGradeLetter>(grade);
    const [reason, setReason] = useState('');

    const handleOverride = () => {
        if (reason.trim().length < 30) return;
        setOverlay(passport.id, {
            overrideGrade,
            overrideReason: reason,
        });
        log({
            action: 'passport.override_score',
            targetType: 'passport',
            targetId: passport.id,
            payload: {
                from: grade,
                to: overrideGrade,
                reason,
                artisanId: passport.artisanId,
            },
        });
        setReason('');
        onOpenChange(false);
        onAfterAction();
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-lumiris-cyan">
                        Override de score - gouvernance sensible
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Vous remplacez visuellement le grade calculé par l&apos;algorithme. Cette action est tracée
                        publiquement dans la timeline gouvernance. <strong>Personne n&apos;achète son score</strong> -
                        la raison doit justifier formellement (audit ré-vérifié, certif re-validée…).
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-3">
                    <div className="border-border bg-muted/30 flex items-center justify-around rounded-xl border p-3">
                        <div className="text-center">
                            <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Grade calculé</p>
                            <span
                                className={cn(
                                    'mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full font-mono text-base font-bold',
                                    gradeBackground(grade),
                                    gradeColor(grade),
                                )}
                            >
                                {grade}
                            </span>
                        </div>
                        <Clock className="text-muted-foreground h-4 w-4" />
                        <div className="text-center">
                            <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Nouveau grade</p>
                            <span
                                className={cn(
                                    'mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full font-mono text-base font-bold',
                                    gradeBackground(overrideGrade),
                                    gradeColor(overrideGrade),
                                )}
                            >
                                {overrideGrade}
                            </span>
                        </div>
                    </div>
                    <Select value={overrideGrade} onValueChange={(v) => setOverrideGrade(v as IrisGradeLetter)}>
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {(['A', 'B', 'C', 'D', 'E'] as const).map((g) => (
                                <SelectItem key={g} value={g}>
                                    Grade {g}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Justification (30+ caractères) : audit ré-effectué, certif re-validée, etc."
                        className="min-h-24"
                    />
                    <p
                        className={cn(
                            'text-right font-mono text-[10px]',
                            reason.trim().length >= 30 ? 'text-lumiris-emerald' : 'text-muted-foreground',
                        )}
                    >
                        {reason.trim().length} / 30
                    </p>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleOverride}
                        disabled={reason.trim().length < 30 || overrideGrade === grade}
                        className="bg-lumiris-cyan hover:bg-lumiris-cyan/90"
                    >
                        <History className="mr-1 h-3.5 w-3.5" /> Confirmer override
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

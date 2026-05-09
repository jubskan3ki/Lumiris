'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2 } from 'lucide-react';
import type { ProductionStep, StageKind } from '@lumiris/types';
import { Button } from '@lumiris/ui/components/button';
import { Input } from '@lumiris/ui/components/input';
import { Label } from '@lumiris/ui/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@lumiris/ui/components/select';
import { WizardStepFrame } from '@/features/wizard-shell/step-frame';
import { useStepNavigation } from '@/features/wizard-shell/use-step-navigation';
import { useDraftStore } from '@/lib/draft-store';
import { COUNTRIES } from '@/lib/countries';
import { currentArtisan } from '@/lib/current-artisan';
import { readFileAsDataUrl } from '@/lib/file-utils';

const STEP_KINDS: ReadonlyArray<{ value: StageKind; label: string }> = [
    { value: 'weaving', label: 'Tissage' },
    { value: 'dyeing', label: 'Teinture' },
    { value: 'cutting', label: 'Coupe' },
    { value: 'sewing', label: 'Couture' },
    { value: 'finishing', label: 'Finition' },
    { value: 'embroidery', label: 'Broderie' },
    { value: 'assembly', label: 'Assemblage' },
    { value: 'quality-check', label: 'Contrôle qualité' },
    { value: 'other', label: 'Autre' },
];

const MAX_PHOTOS = 4;

function newStep(idPrefix: string, idx: number): ProductionStep {
    return {
        id: `${idPrefix}-step-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        kind: 'sewing',
        label: '',
        performedBy: currentArtisan.atelierName,
        locationCity: currentArtisan.city,
        locationCountry: 'FR',
        photos: [],
    };
}

export function CreateStepManufacturing({ draftId }: { draftId: string }) {
    const draft = useDraftStore((s) => s.drafts[draftId]);
    const setSteps = useDraftStore((s) => s.setProductionSteps);
    const { goNext, goTo } = useStepNavigation(draftId);

    const [items, setItems] = useState<ProductionStep[]>(
        draft?.steps.length ? [...draft.steps] : [newStep(draftId, 0)],
    );

    const updateItem = (idx: number, patch: Partial<ProductionStep>) => {
        setItems((cur) => cur.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
    };

    const move = (idx: number, dir: -1 | 1) => {
        setItems((cur) => {
            const next = [...cur];
            const target = idx + dir;
            if (target < 0 || target >= next.length) return cur;
            const [item] = next.splice(idx, 1);
            if (item) next.splice(target, 0, item);
            return next;
        });
    };

    const remove = (idx: number) => setItems((cur) => cur.filter((_, i) => i !== idx));

    const handleNext = () => {
        if (items.length === 0) return;
        setSteps(draftId, items);
        goNext('manufacturing', 'certifications');
    };

    const valid = items.length >= 1;

    return (
        <WizardStepFrame
            draftId={draftId}
            step="manufacturing"
            title="Étapes de fabrication"
            subtitle="Au moins une étape requise. Chaque étape précise qui l’a réalisée et où."
            onPrev={() => goTo('invoice')}
            onNext={handleNext}
            nextDisabled={!valid}
            contentClassName="space-y-3"
        >
            {items.map((item, idx) => (
                <ManufacturingRow
                    key={item.id}
                    step={item}
                    idx={idx}
                    count={items.length}
                    onChange={(patch) => updateItem(idx, patch)}
                    onMoveUp={() => move(idx, -1)}
                    onMoveDown={() => move(idx, 1)}
                    onRemove={() => remove(idx)}
                />
            ))}

            <Button
                variant="outline"
                size="sm"
                onClick={() => setItems((cur) => [...cur, newStep(draftId, cur.length)])}
            >
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Ajouter une étape
            </Button>
        </WizardStepFrame>
    );
}

interface ManufacturingRowProps {
    step: ProductionStep;
    idx: number;
    count: number;
    onChange: (patch: Partial<ProductionStep>) => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onRemove: () => void;
}

function ManufacturingRow({ step, idx, count, onChange, onMoveUp, onMoveDown, onRemove }: ManufacturingRowProps) {
    const handlePhoto = async (file: File | undefined) => {
        if (!file || step.photos.length >= MAX_PHOTOS) return;
        const dataUrl = await readFileAsDataUrl(file);
        onChange({ photos: [...step.photos, dataUrl] });
    };

    return (
        <div className="border-border bg-muted/30 space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between">
                <p className="text-foreground text-sm font-medium">Étape #{idx + 1}</p>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" disabled={idx === 0} onClick={onMoveUp} aria-label="Monter">
                        <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={idx === count - 1}
                        onClick={onMoveDown}
                        aria-label="Descendre"
                    >
                        <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onRemove} aria-label="Supprimer">
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1.5">
                    <Label>Type</Label>
                    <Select value={step.kind} onValueChange={(v) => onChange({ kind: v as StageKind })}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {STEP_KINDS.map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                    {s.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5 lg:col-span-1">
                    <Label>Libellé</Label>
                    <Input
                        value={step.label}
                        onChange={(e) => onChange({ label: e.target.value })}
                        placeholder="Tissage à la navette"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label>Réalisée par</Label>
                    <Input value={step.performedBy} onChange={(e) => onChange({ performedBy: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                        <Label>Ville</Label>
                        <Input value={step.locationCity} onChange={(e) => onChange({ locationCity: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Pays</Label>
                        <Select value={step.locationCountry} onValueChange={(v) => onChange({ locationCountry: v })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {COUNTRIES.map((c) => (
                                    <SelectItem key={c.code} value={c.code}>
                                        {c.code}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="space-y-1.5">
                <Label>
                    Photos ({step.photos.length}/{MAX_PHOTOS})
                </Label>
                <div className="flex flex-wrap gap-2">
                    {step.photos.map((src, i) => (
                        <div key={i} className="relative">
                            <Image
                                src={src}
                                alt={`Étape ${step.label || 'en cours'} - visuel ${i + 1}`}
                                width={64}
                                height={64}
                                unoptimized
                                className="border-border h-16 w-16 rounded-md border object-cover"
                            />
                            <button
                                type="button"
                                aria-label="Supprimer la photo"
                                onClick={() => onChange({ photos: step.photos.filter((_, j) => j !== i) })}
                                className="border-border bg-card text-muted-foreground hover:text-foreground absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border text-[10px]"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                    {step.photos.length < MAX_PHOTOS && (
                        <label className="border-border bg-muted/40 hover:bg-muted text-muted-foreground flex h-16 w-16 cursor-pointer items-center justify-center rounded-md border-2 border-dashed">
                            <ImagePlus className="h-4 w-4" />
                            <input
                                type="file"
                                accept="image/*"
                                aria-label={`Ajouter une photo à l'étape ${step.label || 'en cours'}`}
                                className="hidden"
                                onChange={(e) => handlePhoto(e.target.files?.[0])}
                            />
                        </label>
                    )}
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImagePlus, X } from 'lucide-react';
import { create } from 'zustand';
import { Button } from '@lumiris/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@lumiris/ui/components/card';
import { Input } from '@lumiris/ui/components/input';
import { Label } from '@lumiris/ui/components/label';
import { Switch } from '@lumiris/ui/components/switch';
import { Textarea } from '@lumiris/ui/components/textarea';
import { currentArtisan } from '@/lib/current-artisan';

interface ProfileEdits {
    story: string;
    photoUrl: string;
    specialities: string[];
    city: string;
    region: string;
    epvLabeled: boolean;
    ofgLabeled: boolean;
    setAll: (patch: Partial<Omit<ProfileEdits, 'setAll'>>) => void;
}

const useProfileStore = create<ProfileEdits>()((set) => ({
    story: currentArtisan.story,
    photoUrl: currentArtisan.photoUrl,
    specialities: [...currentArtisan.specialities],
    city: currentArtisan.city,
    region: currentArtisan.region as string,
    epvLabeled: currentArtisan.epvLabeled,
    ofgLabeled: currentArtisan.ofgLabeled,
    setAll: (patch) => set(patch),
}));

export function WorkspaceProfile() {
    const profile = useProfileStore();
    const [tag, setTag] = useState('');

    const addTag = () => {
        const t = tag.trim();
        if (!t || profile.specialities.includes(t)) return;
        profile.setAll({ specialities: [...profile.specialities, t] });
        setTag('');
    };

    const removeTag = (t: string) => {
        profile.setAll({ specialities: profile.specialities.filter((s) => s !== t) });
    };

    const handlePhoto = (file: File | undefined) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') profile.setAll({ photoUrl: reader.result });
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="grid gap-6 p-8 lg:grid-cols-[280px_1fr]">
            <Card>
                <CardHeader>
                    <CardTitle>Photo atelier</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <label className="border-border bg-muted/40 hover:bg-muted relative flex h-44 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed">
                        {profile.photoUrl ? (
                            <Image
                                src={profile.photoUrl}
                                alt="Aperçu de la photo de l'atelier"
                                fill
                                sizes="280px"
                                unoptimized
                                className="object-cover"
                            />
                        ) : (
                            <>
                                <ImagePlus className="text-muted-foreground mb-2 h-6 w-6" />
                                <p className="text-muted-foreground text-xs">Cliquez pour importer</p>
                            </>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            aria-label="Importer la photo de l'atelier"
                            className="absolute inset-0 cursor-pointer opacity-0"
                            onChange={(e) => handlePhoto(e.target.files?.[0])}
                        />
                    </label>
                </CardContent>
            </Card>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Identité atelier</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label>Nom artisan</Label>
                            <Input value={currentArtisan.displayName} disabled />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Atelier</Label>
                            <Input value={currentArtisan.atelierName} disabled />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="city">Ville</Label>
                            <Input
                                id="city"
                                value={profile.city}
                                onChange={(e) => profile.setAll({ city: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="region">Région</Label>
                            <Input
                                id="region"
                                value={profile.region}
                                onChange={(e) => profile.setAll({ region: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                            <Label htmlFor="story">Histoire de l’atelier (markdown léger)</Label>
                            <Textarea
                                id="story"
                                rows={6}
                                value={profile.story}
                                onChange={(e) => profile.setAll({ story: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Spécialités</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex flex-wrap gap-1.5">
                            {profile.specialities.map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    className="bg-lumiris-emerald/10 text-lumiris-emerald inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs"
                                    onClick={() => removeTag(t)}
                                >
                                    {t} <X className="h-3 w-3" />
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <Input
                                value={tag}
                                onChange={(e) => setTag(e.target.value)}
                                placeholder="Ex. tissage main"
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                            />
                            <Button variant="outline" onClick={addTag}>
                                Ajouter
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Labels métier</CardTitle>
                        <p className="text-muted-foreground text-xs">
                            EPV et OFG influencent le sous-score Savoir-faire (axe 25%).
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <ToggleRow
                            label="EPV (Entreprise du Patrimoine Vivant)"
                            checked={profile.epvLabeled}
                            onChange={(v) => profile.setAll({ epvLabeled: v })}
                        />
                        <ToggleRow
                            label="OFG (Origine France Garantie)"
                            checked={profile.ofgLabeled}
                            onChange={(v) => profile.setAll({ ofgLabeled: v })}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <label className="border-border bg-card flex items-center justify-between rounded-md border p-3">
            <span className="text-foreground text-sm">{label}</span>
            <Switch checked={checked} onCheckedChange={onChange} />
        </label>
    );
}

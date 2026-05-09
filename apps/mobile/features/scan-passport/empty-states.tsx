'use client';

import { useState, useCallback, type FormEvent } from 'react';
import { CameraOff, RefreshCw, ScanSearch, KeyRound } from 'lucide-react';

// Trois états vides du scanner :
//   - CameraDeniedState  : permission refusée par le navigateur
//   - QrUnreadableState  : aucun QR détecté pendant N secondes
//   - PassportNotFoundState : QR lu mais id/gtin absent du catalogue
// Chaque état propose un CTA explicite et garde l'utilisateur dans l'app (jamais de
// blame implicite ni de retry caché).

interface CameraDeniedStateProps {
    onRetry: () => void;
}

export function CameraDeniedState({ onRetry }: CameraDeniedStateProps) {
    return (
        <EmptyShell icon={<CameraOff className="text-lumiris-rose h-7 w-7" />} title="Caméra non disponible">
            <p>Pour scanner un passeport, autorise l&apos;accès à ta caméra dans les réglages du navigateur.</p>
            <button
                type="button"
                onClick={onRetry}
                className="bg-foreground text-primary-foreground inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold"
            >
                <RefreshCw className="h-3.5 w-3.5" />
                Réessayer
            </button>
        </EmptyShell>
    );
}

interface QrUnreadableStateProps {
    onRetry: () => void;
    onManualEntry: () => void;
}

export function QrUnreadableState({ onRetry, onManualEntry }: QrUnreadableStateProps) {
    return (
        <EmptyShell icon={<ScanSearch className="text-lumiris-amber h-7 w-7" />} title="QR illisible">
            <p>Approche un peu plus, vérifie l&apos;éclairage ou essaie de stabiliser la pièce.</p>
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={onRetry}
                    className="bg-foreground text-primary-foreground inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold"
                >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Recommencer
                </button>
                <button
                    type="button"
                    onClick={onManualEntry}
                    className="border-border/60 bg-card text-foreground inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium"
                >
                    <KeyRound className="h-3.5 w-3.5" />
                    Saisir un identifiant
                </button>
            </div>
        </EmptyShell>
    );
}

interface PassportNotFoundStateProps {
    raw: string;
    onRetry: () => void;
    onSubmitManualId: (id: string) => void;
}

export function PassportNotFoundState({ raw, onRetry, onSubmitManualId }: PassportNotFoundStateProps) {
    const [value, setValue] = useState('');
    const handle = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const trimmed = value.trim();
            if (trimmed) onSubmitManualId(trimmed);
        },
        [value, onSubmitManualId],
    );
    return (
        <EmptyShell icon={<ScanSearch className="text-lumiris-orange h-7 w-7" />} title="Passeport inconnu">
            <p>
                Le code lu (<span className="text-foreground/80 font-mono text-[10px]">{raw.slice(0, 32)}</span>)
                n&apos;est pas relié à un passeport LUMIRIS connu. Saisis un identifiant manuellement ou recommence.
            </p>
            <form onSubmit={handle} className="flex w-full max-w-xs flex-col gap-2">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="ex. pass-marie-001"
                    className="border-border bg-card text-foreground placeholder:text-muted-foreground/60 rounded-xl border px-3 py-2 text-sm"
                    aria-label="Identifiant passeport"
                />
                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={!value.trim()}
                        className="bg-foreground text-primary-foreground flex-1 rounded-full px-4 py-2 text-xs font-semibold disabled:opacity-50"
                    >
                        Ouvrir
                    </button>
                    <button
                        type="button"
                        onClick={onRetry}
                        className="border-border/60 bg-card text-foreground inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Recommencer
                    </button>
                </div>
            </form>
        </EmptyShell>
    );
}

function EmptyShell({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
    return (
        <div className="bg-background/95 absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 px-8 text-center backdrop-blur-md">
            <div className="border-border bg-card flex h-14 w-14 items-center justify-center rounded-2xl border">
                {icon}
            </div>
            <h2 className="text-foreground text-base font-semibold">{title}</h2>
            <div className="text-muted-foreground flex flex-col items-center gap-3 text-xs leading-relaxed">
                {children}
            </div>
        </div>
    );
}

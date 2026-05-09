'use client';

import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import { GlassCard } from '@/lib/motion';

interface PermissionPromptProps {
    onActivate: () => void;
    onDefer: () => void;
}

export function PermissionPrompt({ onActivate, onDefer }: PermissionPromptProps) {
    return (
        <motion.div
            role="dialog"
            aria-labelledby="camera-prompt-title"
            aria-describedby="camera-prompt-desc"
            className="bg-background absolute inset-0 z-30 flex flex-col items-center justify-center px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
        >
            <GlassCard className="flex w-full max-w-sm flex-col items-center gap-5 p-7 text-center">
                <span
                    aria-hidden
                    className="border-border/60 bg-background/60 relative flex h-14 w-14 items-center justify-center rounded-2xl border"
                >
                    <Camera className="text-foreground/80 h-6 w-6" />
                    <span className="bg-lumiris-cyan/15 absolute -inset-2 -z-10 rounded-3xl blur-xl motion-reduce:hidden" />
                </span>

                <div className="flex flex-col gap-2">
                    <h2 id="camera-prompt-title" className="text-foreground text-lg font-bold tracking-tight">
                        Autorise ta caméra
                    </h2>
                    <p id="camera-prompt-desc" className="text-muted-foreground text-sm leading-relaxed">
                        LUMIRIS scanne le QR du passeport produit. Aucune image n&apos;est envoyée - tout reste sur ton
                        téléphone.
                    </p>
                </div>

                <div className="mt-1 flex w-full flex-col gap-2">
                    <button
                        type="button"
                        onClick={onActivate}
                        className="bg-foreground text-background hover:bg-foreground/90 inline-flex h-11 w-full items-center justify-center rounded-full text-sm font-semibold"
                    >
                        Activer la caméra
                    </button>
                    <button
                        type="button"
                        onClick={onDefer}
                        className="text-muted-foreground hover:text-foreground inline-flex h-11 w-full items-center justify-center rounded-full text-sm"
                    >
                        Plus tard
                    </button>
                </div>
            </GlassCard>
        </motion.div>
    );
}

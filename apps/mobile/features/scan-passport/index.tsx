'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import jsQR from 'jsqr';
import { mockArtisanById } from '@lumiris/mock-data';
import type { Passport } from '@lumiris/types';
import { scorePassport } from '@/lib/passport-score';
import { incrementScanCounter } from '@/lib/scan-counter';
import { decodeQrPayload, resolvePassportFromScan } from './qr-decoder';
import { PrismaticOverlay } from './prismatic-overlay';
import { NfcComingSoon } from './nfc-coming-soon';
import { ScanResultModal } from './scan-result-modal';
import { CameraDeniedState, QrUnreadableState, PassportNotFoundState } from './empty-states';

type ScannerStatus = 'idle' | 'scanning' | 'denied' | 'unreadable' | 'unknown' | 'matched';

// Délai en ms après lequel on considère que le QR est introuvable et on bascule sur l'état "unreadable".
// Volontairement long (12 s) pour ne pas frustrer l'utilisateur — la grille de la caméra pulse en permanence.
const UNREADABLE_TIMEOUT_MS = 12_000;

export function ScanPassport() {
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const rafRef = useRef<number | null>(null);
    const startedAtRef = useRef<number>(0);

    const [status, setStatus] = useState<ScannerStatus>('idle');
    const [match, setMatch] = useState<{ passport: Passport; raw: string } | null>(null);
    const [unknownRaw, setUnknownRaw] = useState<string>('');

    const stopCamera = useCallback(() => {
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
    }, []);

    const startCamera = useCallback(async () => {
        if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
            setStatus('denied');
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false,
            });
            streamRef.current = stream;
            const video = videoRef.current;
            if (video) {
                video.srcObject = stream;
                await video.play();
            }
            startedAtRef.current = performance.now();
            setStatus('scanning');
        } catch {
            setStatus('denied');
        }
    }, []);

    // Boucle requestAnimationFrame — décode 1 frame sur 2 pour préserver la batterie.
    const tick = useCallback(() => {
        const video = videoRef.current;
        if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
            rafRef.current = requestAnimationFrame(tick);
            return;
        }
        if (!canvasRef.current) canvasRef.current = document.createElement('canvas');
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        const w = video.videoWidth;
        const h = video.videoHeight;
        if (w === 0 || h === 0) {
            rafRef.current = requestAnimationFrame(tick);
            return;
        }
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(video, 0, 0, w, h);
        const imageData = ctx.getImageData(0, 0, w, h);

        const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });
        if (code?.data) {
            const decoded = decodeQrPayload(code.data);
            const passport = resolvePassportFromScan(decoded);
            if (passport) {
                if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(60);
                incrementScanCounter();
                stopCamera();
                setMatch({ passport, raw: code.data });
                setStatus('matched');
                return;
            }
            // Lu mais inconnu — on s'arrête sur l'état "unknown" avec le payload brut.
            stopCamera();
            setUnknownRaw(code.data);
            setStatus('unknown');
            return;
        }

        // Pas de QR : si on dépasse le délai max sans rien lire, bascule sur "unreadable"
        if (performance.now() - startedAtRef.current > UNREADABLE_TIMEOUT_MS) {
            stopCamera();
            setStatus('unreadable');
            return;
        }
        rafRef.current = requestAnimationFrame(tick);
    }, [stopCamera]);

    useEffect(() => {
        if (status === 'scanning') {
            rafRef.current = requestAnimationFrame(tick);
        }
        return () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        };
    }, [status, tick]);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
        // Démarrage unique au mount — `startCamera`/`stopCamera` sont stables.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const restart = useCallback(() => {
        setMatch(null);
        setUnknownRaw('');
        startCamera();
    }, [startCamera]);

    const openPassport = useCallback(
        (passportId: string) => {
            stopCamera();
            router.push(`/passeport/${passportId}`);
        },
        [router, stopCamera],
    );

    const matchScore = match ? scorePassport(match.passport, new Date()) : null;
    const matchArtisan = match ? mockArtisanById(match.passport.artisanId) : undefined;

    return (
        <div className="bg-background relative h-full w-full overflow-hidden">
            <video
                ref={videoRef}
                playsInline
                muted
                className="absolute inset-0 h-full w-full object-cover"
                aria-label="Vue caméra"
            />

            {/* Voile sombre pour faire ressortir le viewfinder */}
            <div className="bg-background/30 pointer-events-none absolute inset-0" />

            <PrismaticOverlay active={status === 'matched'} />

            <motion.header
                className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-5 pb-3 pt-12"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <h1 className="text-foreground text-base font-bold tracking-tight">LUMIRIS</h1>
                    <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-[0.2em]">
                        Scanner un passeport
                    </p>
                </div>
                <NfcComingSoon />
            </motion.header>

            <motion.p
                className="text-muted-foreground absolute bottom-32 left-0 right-0 z-20 px-8 text-center text-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                Approche le QR du passeport jusqu&apos;à ce qu&apos;il rentre dans le cadre.
            </motion.p>

            {status === 'denied' ? <CameraDeniedState onRetry={startCamera} /> : null}
            {status === 'unreadable' ? (
                <QrUnreadableState
                    onRetry={restart}
                    onManualEntry={() => {
                        setUnknownRaw('');
                        setStatus('unknown');
                    }}
                />
            ) : null}
            {status === 'unknown' ? (
                <PassportNotFoundState raw={unknownRaw} onRetry={restart} onSubmitManualId={openPassport} />
            ) : null}

            {match && matchScore ? (
                <ScanResultModal
                    passport={match.passport}
                    artisan={matchArtisan}
                    score={matchScore}
                    onClose={restart}
                    onOpenPassport={openPassport}
                />
            ) : null}
        </div>
    );
}

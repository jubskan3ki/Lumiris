'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, Zap } from 'lucide-react';

interface IrisScannerProps {
    onProductScanned: () => void;
}

export function IrisScanner({ onProductScanned }: IrisScannerProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const simulateScan = useCallback(() => {
        if (isScanning) return;
        setIsScanning(true);
        setTimeout(() => {
            setIsFocused(true);
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(100);
            }
            setTimeout(() => {
                onProductScanned();
                setIsScanning(false);
                setIsFocused(false);
            }, 1000);
        }, 1800);
    }, [onProductScanned, isScanning]);

    return (
        <div className="bg-background relative flex h-full flex-col items-center justify-center overflow-hidden">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute -right-32 -top-32 h-[50vh] w-[50vh] rounded-full opacity-[0.07] blur-[100px]"
                    style={{
                        background: 'radial-gradient(circle, #06b6d4, #059669, transparent)',
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                    className="absolute -bottom-24 -left-24 h-[35vh] w-[35vh] rounded-full opacity-[0.06] blur-[80px]"
                    style={{
                        background: 'radial-gradient(circle, #059669, #06b6d4, transparent)',
                    }}
                    animate={{ rotate: -360 }}
                    transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
                />
            </div>

            <motion.div
                className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-6 pb-4 pt-14"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div>
                    <h1 className="text-foreground text-lg font-bold tracking-tight">LUMIRIS</h1>
                    <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-[0.2em]">Vision</p>
                </div>
                <div className="border-border bg-card flex items-center gap-1.5 rounded-full border px-3 py-1.5">
                    <Zap className="text-grade-a h-3 w-3" />
                    <span className="text-foreground text-xs font-medium">Ready</span>
                </div>
            </motion.div>

            <div className="relative flex items-center justify-center">
                <motion.div
                    className="absolute h-[272px] w-[272px] rounded-full"
                    style={{
                        background:
                            'conic-gradient(from 0deg, rgba(6,182,212,0.12), rgba(5,150,105,0.08), rgba(245,158,11,0.04), transparent, rgba(6,182,212,0.12))',
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                />

                <motion.div
                    className="border-border/50 bg-glass relative flex h-64 w-64 items-center justify-center rounded-full border backdrop-blur-2xl"
                    style={{
                        animation: isScanning ? 'none' : 'iris-breathe 4s ease-in-out infinite',
                    }}
                    animate={
                        isFocused
                            ? { scale: [1, 0.88, 1.06, 1] }
                            : isScanning
                              ? { scale: [1, 1.02, 0.99, 1.01, 1] }
                              : {}
                    }
                    transition={
                        isFocused
                            ? { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
                            : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
                    }
                >
                    <div className="border-border/25 absolute h-52 w-52 rounded-full border" />
                    <div className="border-border/15 absolute h-40 w-40 rounded-full border" />
                    <div className="border-border/10 absolute h-28 w-28 rounded-full border" />

                    <AnimatePresence>
                        {isScanning && (
                            <motion.div
                                className="absolute inset-4 overflow-hidden rounded-full"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <motion.div
                                    className="absolute left-0 right-0 h-px"
                                    style={{
                                        background: 'linear-gradient(90deg, transparent, #06b6d4, transparent)',
                                        boxShadow: '0 0 12px rgba(6,182,212,0.4)',
                                    }}
                                    initial={{ top: '0%' }}
                                    animate={{ top: ['0%', '100%', '0%'] }}
                                    transition={{
                                        duration: 2.4,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="relative z-10 flex flex-col items-center gap-2">
                        <AnimatePresence mode="wait">
                            {isFocused ? (
                                <motion.div
                                    key="focused"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                    className="flex flex-col items-center gap-1.5"
                                >
                                    <div
                                        className="h-5 w-5 rounded-full"
                                        style={{
                                            background: '#059669',
                                            boxShadow: '0 0 16px rgba(5,150,105,0.4)',
                                        }}
                                    />
                                    <span className="text-foreground text-[11px] font-bold uppercase tracking-[0.15em]">
                                        Locked
                                    </span>
                                </motion.div>
                            ) : isScanning ? (
                                <motion.div
                                    key="scanning"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center gap-2"
                                >
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{
                                            duration: 1.2,
                                            repeat: Infinity,
                                            ease: 'linear',
                                        }}
                                    >
                                        <Scan className="text-grade-b h-7 w-7" />
                                    </motion.div>
                                    <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-[0.15em]">
                                        Scanning
                                    </span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="idle"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center gap-2"
                                >
                                    <Scan className="text-muted-foreground/50 h-7 w-7" />
                                    <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-[0.12em]">
                                        Point at product
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 256 256">
                        <motion.path
                            d="M 40 8 L 8 8 L 8 40"
                            fill="none"
                            strokeWidth="1.5"
                            className="stroke-border"
                            animate={isFocused ? { stroke: '#059669' } : {}}
                        />
                        <motion.path
                            d="M 216 8 L 248 8 L 248 40"
                            fill="none"
                            strokeWidth="1.5"
                            className="stroke-border"
                            animate={isFocused ? { stroke: '#059669' } : {}}
                        />
                        <motion.path
                            d="M 40 248 L 8 248 L 8 216"
                            fill="none"
                            strokeWidth="1.5"
                            className="stroke-border"
                            animate={isFocused ? { stroke: '#059669' } : {}}
                        />
                        <motion.path
                            d="M 216 248 L 248 248 L 248 216"
                            fill="none"
                            strokeWidth="1.5"
                            className="stroke-border"
                            animate={isFocused ? { stroke: '#059669' } : {}}
                        />
                    </svg>
                </motion.div>
            </div>

            <motion.div
                className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-3 px-6 pb-24"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <button
                    onClick={simulateScan}
                    disabled={isScanning}
                    className="bg-foreground text-primary-foreground group relative w-full overflow-hidden rounded-2xl px-6 py-4 font-semibold transition-all active:scale-[0.98] disabled:opacity-60"
                >
                    <span className="relative z-10 text-sm tracking-wide">
                        {isScanning ? 'Analyzing...' : 'Scan Product'}
                    </span>
                </button>
                <p className="text-muted-foreground text-center text-[11px]">
                    Point your camera at a barcode or QR code
                </p>
            </motion.div>
        </div>
    );
}

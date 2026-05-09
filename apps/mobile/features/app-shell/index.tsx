'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Shirt, Sparkles, User } from 'lucide-react';
import { ScanPassport } from '../scan-passport';
import { Wardrobe } from '../wardrobe';
import { Discover } from '../discover';
import { Profile } from '../profile';

type Tab = 'scanner' | 'wardrobe' | 'discover' | 'profile';

const TABS: ReadonlyArray<{ id: Tab; label: string; Icon: typeof QrCode }> = [
    { id: 'scanner', label: 'Scanner', Icon: QrCode },
    { id: 'wardrobe', label: 'Garde-Robe', Icon: Shirt },
    { id: 'discover', label: 'Découvrir', Icon: Sparkles },
    { id: 'profile', label: 'Profil', Icon: User },
];

export function AppShell() {
    const [activeTab, setActiveTab] = useState<Tab>('scanner');

    const switchToScanner = useCallback(() => setActiveTab('scanner'), []);

    return (
        <div className="bg-background relative mx-auto flex h-dvh max-w-md flex-col overflow-hidden">
            {/* Halos prismatiques d'arrière-plan partagés — recyclés depuis l'ancien iris-scanner. */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <motion.div
                    className="absolute -right-24 -top-24 h-[40vh] w-[40vh] rounded-full opacity-[0.06] blur-[100px] motion-reduce:hidden"
                    style={{
                        background: 'radial-gradient(circle, #06b6d4, #059669, transparent)',
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                    className="absolute -bottom-20 -left-20 h-[30vh] w-[30vh] rounded-full opacity-[0.05] blur-[80px] motion-reduce:hidden"
                    style={{
                        background: 'radial-gradient(circle, #059669, #06b6d4, transparent)',
                    }}
                    animate={{ rotate: -360 }}
                    transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
                />
            </div>

            <div className="relative flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        className="absolute inset-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                    >
                        {activeTab === 'scanner' ? (
                            <ScanPassport />
                        ) : activeTab === 'wardrobe' ? (
                            <Wardrobe onScanRequested={switchToScanner} />
                        ) : activeTab === 'discover' ? (
                            <Discover />
                        ) : (
                            <Profile />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            <motion.nav
                className="border-border/40 bg-background/85 absolute bottom-0 left-0 right-0 z-50 border-t px-4 pb-7 pt-2 backdrop-blur-xl"
                initial={{ y: 80 }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            >
                <div className="flex items-center justify-around">
                    {TABS.map(({ id, label, Icon }) => {
                        const active = activeTab === id;
                        return (
                            <button
                                key={id}
                                type="button"
                                onClick={() => setActiveTab(id)}
                                aria-pressed={active}
                                className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors ${
                                    active ? 'text-foreground' : 'text-muted-foreground'
                                }`}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="text-[10px] font-semibold tracking-wide">{label}</span>
                                {active ? (
                                    <motion.span
                                        className="bg-foreground absolute -top-2 h-0.5 w-8 rounded-full"
                                        layoutId="tab-indicator"
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                ) : null}
                            </button>
                        );
                    })}
                </div>
            </motion.nav>
        </div>
    );
}

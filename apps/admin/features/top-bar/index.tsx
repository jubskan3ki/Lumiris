'use client';

import { memo, useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle2, Command, Search, X } from 'lucide-react';
import type { NavSection } from '../sidebar';
import { DevUserSwitcher } from '../_shared/dev-user-switcher';

interface TopBarProps {
    onNavigate: (section: NavSection) => void;
}

const SEARCHABLE: ReadonlyArray<{ label: string; section: NavSection; keywords: string }> = [
    { label: 'Overview', section: 'overview', keywords: 'home stats kpi metrics' },
    { label: 'Passports - file de curation', section: 'passports', keywords: 'passport curate review queue' },
    { label: 'Artisans', section: 'artisans', keywords: 'artisans atelier maison' },
    { label: 'Repairers (LUMIRIS Local)', section: 'retoucheurs', keywords: 'retoucheur local annuaire' },
    { label: 'Vision Users', section: 'vision-users', keywords: 'consumer scan vision rgpd' },
    { label: 'Billing', section: 'billing', keywords: 'billing mrr abonnement dunning' },
    { label: 'Affiliation', section: 'affiliation', keywords: 'affiliation payout commission' },
    { label: 'Iris Workbench', section: 'iris-workbench', keywords: 'score override iris weights' },
    { label: 'Blog', section: 'blog', keywords: 'journal articles cms blog' },
    { label: 'Governance - audit log', section: 'governance', keywords: 'audit governance log rgpd' },
];

function TopBarComponent({ onNavigate }: TopBarProps) {
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredItems = SEARCHABLE.filter(
        (item) =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.keywords.includes(searchQuery.toLowerCase()),
    );

    const handleSelect = useCallback(
        (section: NavSection) => {
            onNavigate(section);
            setSearchOpen(false);
            setSearchQuery('');
        },
        [onNavigate],
    );

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen((prev) => !prev);
            }
            if (e.key === 'Escape') {
                setSearchOpen(false);
                setSearchQuery('');
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    useEffect(() => {
        if (searchOpen) inputRef.current?.focus();
    }, [searchOpen]);

    return (
        <>
            <header className="border-border bg-card/80 fixed left-60 right-0 top-0 z-30 flex h-14 items-center justify-between border-b px-6 backdrop-blur-sm">
                <button
                    onClick={() => setSearchOpen(true)}
                    className="border-border bg-background text-muted-foreground hover:border-lumiris-emerald/40 hover:text-foreground flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors"
                >
                    <Search className="h-3.5 w-3.5" />
                    <span>Rechercher…</span>
                    <kbd className="border-border bg-muted text-muted-foreground ml-6 flex items-center gap-0.5 rounded border px-1.5 py-0.5 font-mono text-[10px]">
                        <Command className="h-2.5 w-2.5" />K
                    </kbd>
                </button>

                <div className="flex items-center gap-3">
                    <DevUserSwitcher />

                    <button className="text-muted-foreground hover:bg-muted hover:text-foreground relative rounded-lg p-2 transition-colors">
                        <Bell className="h-4 w-4" />
                        <span className="bg-lumiris-rose absolute right-1.5 top-1.5 h-2 w-2 rounded-full" />
                    </button>

                    <div className="border-lumiris-emerald/20 bg-lumiris-emerald/5 flex items-center gap-2 rounded-lg border px-3 py-1.5">
                        <CheckCircle2 className="text-lumiris-emerald h-3.5 w-3.5" />
                        <span className="text-lumiris-emerald text-xs font-medium">Plateforme opérationnelle</span>
                    </div>
                </div>
            </header>

            <AnimatePresence>
                {searchOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-foreground/10 fixed inset-0 z-50 backdrop-blur-sm"
                            onClick={() => {
                                setSearchOpen(false);
                                setSearchQuery('');
                            }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.97, y: -8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.97, y: -8 }}
                            transition={{ duration: 0.15 }}
                            className="opal-shadow-lg border-border bg-card fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-xl border"
                        >
                            <div className="border-border flex items-center gap-3 border-b px-4 py-3">
                                <Search className="text-muted-foreground h-4 w-4" />
                                <input
                                    ref={inputRef}
                                    aria-label="Search commands"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Rechercher un module…"
                                    className="text-foreground placeholder-muted-foreground/60 flex-1 bg-transparent text-sm outline-none"
                                />
                                <button
                                    onClick={() => {
                                        setSearchOpen(false);
                                        setSearchQuery('');
                                    }}
                                    className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-1"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="max-h-64 overflow-y-auto p-2">
                                {filteredItems.map((item) => (
                                    <button
                                        key={item.section}
                                        onClick={() => handleSelect(item.section)}
                                        className="text-foreground hover:bg-lumiris-emerald/5 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors"
                                    >
                                        <span>{item.label}</span>
                                        <span className="text-muted-foreground/50 ml-auto font-mono text-[10px]">
                                            Aller
                                        </span>
                                    </button>
                                ))}
                                {filteredItems.length === 0 && (
                                    <p className="text-muted-foreground px-3 py-6 text-center text-sm">
                                        Aucun résultat.
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

export const TopBar = memo(TopBarComponent);

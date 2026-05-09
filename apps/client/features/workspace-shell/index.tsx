'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookCheck, FileText, LayoutDashboard, PlusCircle, Receipt, Sparkles, Store, Wallet } from 'lucide-react';
import { cn } from '@lumiris/ui/lib/cn';
import { ATELIER_PASSPORT_LIMIT_LABEL, usePassportCount } from './hooks';
import { currentArtisan } from '@/lib/current-artisan';

interface NavItem {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    primary?: boolean;
}

const NAV_ITEMS: readonly NavItem[] = [
    { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/passports', label: 'Mes passeports', icon: FileText },
    { href: '/create', label: 'Création', icon: PlusCircle, primary: true },
    { href: '/invoices', label: 'Factures fournisseurs', icon: Receipt },
    { href: '/certifications', label: 'Mes certifications', icon: BookCheck },
    { href: '/profile', label: 'Profil atelier', icon: Store },
    { href: '/subscription', label: 'Abonnement', icon: Wallet },
];

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname() ?? '/';
    const passportCount = usePassportCount(currentArtisan.id);

    return (
        <div className="bg-background min-h-screen">
            <aside className="border-border bg-card fixed left-0 top-0 z-30 flex h-screen w-[260px] flex-col border-r">
                <div className="border-border flex items-center gap-3 border-b px-5 py-5">
                    <div className="bg-lumiris-emerald flex h-9 w-9 items-center justify-center rounded-lg">
                        <Sparkles className="text-primary-foreground h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-foreground text-sm font-semibold leading-none">LUMIRIS</p>
                        <p className="text-muted-foreground font-mono text-[10px] tracking-widest">ATELIER</p>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-4">
                    <ul className="space-y-1">
                        {NAV_ITEMS.map((item) => {
                            const isActive =
                                item.href === '/dashboard'
                                    ? pathname === '/' || pathname.startsWith('/dashboard')
                                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                            const Icon = item.icon;

                            if (item.primary) {
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                'bg-lumiris-emerald hover:bg-lumiris-emerald/90 my-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity',
                                                isActive && 'ring-lumiris-emerald/30 ring-2 ring-offset-1',
                                            )}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {item.label}
                                        </Link>
                                    </li>
                                );
                            }

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                                            isActive
                                                ? 'bg-lumiris-emerald/10 text-lumiris-emerald font-medium'
                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="border-border border-t px-4 py-3">
                    <div className="mb-1.5 flex items-center gap-2">
                        <span
                            className={cn(
                                'rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider',
                                currentArtisan.tier === 'Solo' && 'bg-grade-a/8 text-grade-a',
                                currentArtisan.tier === 'Studio' && 'bg-grade-b/8 text-grade-b',
                                currentArtisan.tier === 'Maison' && 'bg-grade-c/8 text-grade-c',
                            )}
                        >
                            {currentArtisan.tier}
                        </span>
                        {currentArtisan.plus && (
                            <span className="bg-lumiris-amber/10 text-lumiris-amber rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold">
                                ATELIER+
                            </span>
                        )}
                    </div>
                    <p className="text-muted-foreground font-mono text-[11px]">
                        {passportCount} / {ATELIER_PASSPORT_LIMIT_LABEL[currentArtisan.tier]} passeports actifs
                    </p>
                </div>
            </aside>

            <main className="ml-[260px] flex min-h-screen flex-col">{children}</main>
        </div>
    );
}
